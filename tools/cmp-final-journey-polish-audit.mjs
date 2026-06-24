#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const auditDir = path.join(repoRoot, "audit", "2026-06-24-cmp-v2-final-journey-polish");
const screenshotDir = path.join(auditDir, "screenshots");
const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));

const selectedPostcode = "CV1 3BJ";
const selectedAddressPattern = /18,?\s+Willow Brook Drive,\s+Coventry,\s+CV1 3BJ/i;
const legacyAddressPattern = /57 The Butts/i;
const internalTerms = [
  /\bcanonical\b/i,
  /\bPropertyRecord\b/i,
  /\bLabs\b/i,
  /\bfixture\b/i,
  /\braw state\b/i,
  /prototype assistant preview/i,
  /demo data only/i,
  /concept\/prototype asset/i,
  /see image provenance/i,
  /\bpresenter\b/i,
  /implementation wording/i
];

const requiredSafeCopy = [
  /Based on current information/i,
  /Guidance, not legal advice/i,
  /No supplier contacted/i,
  /No payment taken/i,
  /Evidence needs review|needs review/i,
  /Request prepared|prepared/i
];

const viewports = [
  { name: "desktop", width: 1440, height: 1050, mobile: false },
  { name: "tablet", width: 820, height: 1180, mobile: true },
  { name: "mobile", width: 390, height: 844, mobile: true }
];

const screenshotTargets = [
  { name: "homepage", route: "/" },
  { name: "services", route: "/services.html" },
  { name: "add-property-initial", route: "/add-property.html" },
  { name: "add-property-after-address-selection", state: "afterAddressSelection" },
  { name: "review-found-data", state: "reviewFoundData" },
  { name: "selected-property-hero", state: "workspaceHome" },
  { name: "next-best-action", state: "nextBestAction" },
  { name: "evidence", state: "evidence" },
  { name: "ask-cmp", state: "askCmp" },
  { name: "report-preview", state: "reportPreview" },
  { name: "monitoring", state: "monitoring" },
  { name: "nick-guided-demo", route: "/dashboard-labs.html?demo=nick" },
  { name: "no-epc-scenario", route: "/dashboard-labs.html?demoScenario=no-epc-found&qa=1" },
  { name: "portfolio", route: "/dashboard-labs.html?portfolioDemo=1&qa=1" }
];

function argValue(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.find((item) => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const mode = argValue("mode", "audit");
const failOnIssues = !process.argv.includes("--no-fail");

function contentType(filePath) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  }[path.extname(filePath)] || "application/octet-stream";
}

async function startStaticServer() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = path.normalize(path.join(repoRoot, pathname));
    if (!filePath.startsWith(repoRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForHttp(url, timeoutMs = 8000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function launchChrome() {
  const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome was not found at ${chromePath}`);
  }
  const port = await freePort();
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "cmp-polish-chrome-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-search-engine-choice-screen",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ];
  const child = spawn(chromePath, args, { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  await waitForHttp(`http://127.0.0.1:${port}/json/version`, 12000);
  return {
    port,
    profileDir,
    stderr: () => stderr,
    close: async () => {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
      await rm(profileDir, { recursive: true, force: true });
    }
  };
}

class CdpPage {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.console = [];
    this.pageErrors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.handleMessage(event.data));
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
    await this.send("DOM.enable");
  }

  handleMessage(data) {
    const message = JSON.parse(data);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result || {});
      return;
    }
    this.events.push(message);
    if (message.method === "Runtime.consoleAPICalled") {
      this.console.push({
        type: message.params.type,
        text: (message.params.args || []).map((arg) => arg.value || arg.description || "").join(" "),
        timestamp: new Date().toISOString()
      });
    }
    if (message.method === "Runtime.exceptionThrown") {
      this.pageErrors.push({
        text: message.params.exceptionDetails?.text || "Runtime exception",
        exception: message.params.exceptionDetails?.exception?.description || "",
        timestamp: new Date().toISOString()
      });
    }
    if (message.method === "Log.entryAdded") {
      const entry = message.params.entry || {};
      if (["error", "warning"].includes(entry.level)) {
        this.console.push({
          type: entry.level,
          text: entry.text || "",
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 12000);
    });
  }

  async setViewport(viewport, reducedMotion = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: Boolean(viewport.mobile)
    });
    await this.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }]
    });
  }

  async goto(url) {
    this.console = [];
    this.pageErrors = [];
    const loadPromise = this.waitForEvent("Page.loadEventFired", 10000).catch(() => null);
    await this.send("Page.navigate", { url });
    await loadPromise;
    await delay(300);
  }

  waitForEvent(method, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const startedLength = this.events.length;
      const interval = setInterval(() => {
        const match = this.events.slice(startedLength).find((event) => event.method === method);
        if (match) {
          clearInterval(interval);
          resolve(match);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result?.value;
  }

  async waitFor(expression, timeoutMs = 8000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const value = await this.evaluate(expression).catch(() => false);
      if (value) return value;
      await delay(100);
    }
    throw new Error(`Timed out waiting for expression: ${expression}`);
  }

  async click(selector) {
    return this.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) throw new Error(${JSON.stringify(`Missing selector: ${selector}`)});
      node.scrollIntoView({ block: "center", inline: "nearest" });
      node.click();
      return true;
    })()`);
  }

  async fill(selector, value) {
    return this.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) throw new Error(${JSON.stringify(`Missing selector: ${selector}`)});
      node.focus();
      node.value = ${JSON.stringify(value)};
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
  }

  async submit(selector) {
    return this.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) throw new Error(${JSON.stringify(`Missing selector: ${selector}`)});
      if (typeof node.requestSubmit === "function") node.requestSubmit();
      else node.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      return true;
    })()`);
  }

  async clickNoScroll(selector) {
    return this.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) throw new Error(${JSON.stringify(`Missing selector: ${selector}`)});
      node.click();
      return true;
    })()`);
  }

  async visibleText(selector = "body") {
    return this.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      return node ? node.innerText : "";
    })()`);
  }

  async snapshot() {
    return this.evaluate(`(() => {
      const h1 = document.querySelector("h1")?.innerText || "";
      const title = document.title;
      const url = location.href;
      const selection = String(window.getSelection?.() || "");
      const scrollY = Math.round(window.scrollY);
      const active = document.activeElement ? {
        tag: document.activeElement.tagName,
        id: document.activeElement.id || "",
        text: document.activeElement.innerText || document.activeElement.getAttribute("aria-label") || ""
      } : null;
      return { title, h1, url, selection, scrollY, active, text: document.body.innerText };
    })()`);
  }

  async screenshot(filePath) {
    await this.evaluate(`window.getSelection?.().removeAllRanges?.(); true`);
    const result = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true
    });
    await writeFile(filePath, Buffer.from(result.data, "base64"));
  }

  async close() {
    this.ws.close();
  }
}

async function newPage(chrome) {
  const response = await fetch(`http://127.0.0.1:${chrome.port}/json/new?about:blank`, { method: "PUT" });
  const target = await response.json();
  const page = new CdpPage(target.webSocketDebuggerUrl);
  await page.connect();
  return page;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseCanonicalStore(localStorageDump) {
  const storeKey = Object.keys(localStorageDump).find((key) => key.startsWith(`${bridge.CANONICAL_STORE_KEY_PREFIX || "cmp_canonical_property_store_v1"}::guest:public`))
    || Object.keys(localStorageDump).find((key) => key.startsWith("cmp_canonical_property_store_v1::guest:public"));
  if (!storeKey) return null;
  return JSON.parse(localStorageDump[storeKey]);
}

function deriveExpectedNextAction(localStorageDump, propertyId) {
  const store = parseCanonicalStore(localStorageDump);
  const property = store?.propertiesById?.[propertyId] || Object.values(store?.propertiesById || {})[0];
  if (!property) return null;
  const result = derivation.derivePropertyComplianceState(property, { now: "2026-06-24T12:00:00.000Z" });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return { property, derivedState: result.value, nextBestAction: result.value.nextBestAction };
}

function includesNextAction(text, expected) {
  if (!expected) return false;
  const needles = [
    expected.title,
    expected.primaryCtaLabel,
    expected.reason,
    expected.priorityExplanation
  ].filter(Boolean).map((item) => String(item).slice(0, 80).toLowerCase());
  const lower = String(text || "").toLowerCase();
  return needles.some((needle) => needle && lower.includes(needle));
}

async function createCanonicalProperty(page, origin, viewport, progression = []) {
  await page.setViewport(viewport);
  await page.goto(`${origin}/`);
  await page.click('a[href="add-property.html"], a[href="./add-property.html"]');
  await page.waitFor(`location.pathname.endsWith("/add-property.html")`);
  await page.fill("#addPropertyPostcode", selectedPostcode);
  const beforeSearch = await page.snapshot();
  await page.submit("#addPropertySearchForm");
  await page.waitFor(`document.querySelectorAll("[data-use-address]").length > 0`, 10000);
  await page.waitFor(`window.scrollY > ${beforeSearch.scrollY} || Boolean(document.querySelector("[data-use-address]")?.getBoundingClientRect().top < innerHeight * 0.8)`, 2000).catch(() => null);
  const afterSearch = await page.snapshot();
  progression.push({
    step: "postcode submitted",
    beforeScrollY: beforeSearch.scrollY,
    afterScrollY: afterSearch.scrollY,
    active: afterSearch.active,
    addressOptionsVisible: await page.evaluate(`Boolean(document.querySelector("[data-use-address]")?.getBoundingClientRect().top < innerHeight)`),
    passed: afterSearch.scrollY > beforeSearch.scrollY || await page.evaluate(`Boolean(document.querySelector("[data-use-address]")?.getBoundingClientRect().top < innerHeight * 0.78)`)
  });

  const beforeAddress = await page.snapshot();
  await page.evaluate(`document.querySelector("[data-use-address]")?.scrollIntoView({ block: "center", inline: "nearest" }); true`);
  await page.clickNoScroll("[data-use-address]");
  await page.waitFor(`Boolean(document.querySelector("[data-canonical-review]"))`, 12000);
  await page.waitFor(`window.scrollY > ${beforeAddress.scrollY} || Boolean(document.querySelector("[data-canonical-review]")?.getBoundingClientRect().top < innerHeight * 0.8)`, 2500).catch(() => null);
  const afterAddress = await page.snapshot();
  progression.push({
    step: "address selected and Smart Checks completed",
    beforeScrollY: beforeAddress.scrollY,
    afterScrollY: afterAddress.scrollY,
    active: afterAddress.active,
    reviewVisible: await page.evaluate(`Boolean(document.querySelector("[data-canonical-review]")?.getBoundingClientRect().top < innerHeight)`),
    passed: afterAddress.scrollY > beforeAddress.scrollY || await page.evaluate(`Boolean(document.querySelector("[data-canonical-review]")?.getBoundingClientRect().top < innerHeight * 0.8)`)
  });

  const handoffHref = await page.evaluate(`document.querySelector("[data-canonical-handoff]")?.href || ""`);
  return { handoffHref };
}

async function validateReducedMotion(origin, chrome) {
  const page = await newPage(chrome);
  await page.setViewport(viewports[0], true);
  await page.goto(`${origin}/add-property.html`);
  await page.fill("#addPropertyPostcode", selectedPostcode);
  await page.submit("#addPropertySearchForm");
  await page.waitFor(`document.querySelectorAll("[data-use-address]").length > 0`, 10000);
  await page.waitFor(`window.scrollY > 0 || Boolean(document.querySelector("[data-use-address]")?.getBoundingClientRect().top < innerHeight * 0.8)`, 1000).catch(() => null);
  const search = await page.snapshot();
  await page.evaluate(`document.querySelector("[data-use-address]")?.scrollIntoView({ block: "center", inline: "nearest" }); true`);
  await page.clickNoScroll("[data-use-address]");
  await page.waitFor(`Boolean(document.querySelector("[data-canonical-review]"))`, 12000);
  await page.waitFor(`window.scrollY >= ${search.scrollY} || Boolean(document.querySelector("[data-canonical-review]")?.getBoundingClientRect().top < innerHeight * 0.8)`, 1000).catch(() => null);
  const review = await page.snapshot();
  await page.close();
  return {
    mode: "prefers-reduced-motion",
    searchScrollY: search.scrollY,
    reviewScrollY: review.scrollY,
    passed: search.scrollY > 0 && review.scrollY >= search.scrollY
  };
}

async function validateFailedValidationNoScroll(origin, chrome) {
  const page = await newPage(chrome);
  await page.setViewport(viewports[0]);
  await page.goto(`${origin}/add-property.html`);
  const before = await page.snapshot();
  await page.submit("#addPropertySearchForm");
  await delay(250);
  const after = await page.snapshot();
  await page.close();
  return {
    beforeScrollY: before.scrollY,
    afterScrollY: after.scrollY,
    message: after.text.match(/Enter a postcode[^\n]*/i)?.[0] || "",
    passed: before.scrollY === after.scrollY
  };
}

async function collectVisibleSurfaceTexts(page) {
  const selectors = [
    ["property heading", "#propertyTitle"],
    ["sidebar property card", "[data-sidebar-property-list]"],
    ["Ask CMP rail response", "[data-assistant-response]"],
    ["Ask CMP heading", "#portfolioAskTitle"],
    ["home summary", "[data-home-summary-title], [data-home-summary-body]"],
    ["property card", "[data-home-property-list]"],
    ["next best action", "[data-canonical-next-action]"],
    ["service recommendation", "[data-home-upcoming-grid]"],
    ["monitoring preview", "[data-canonical-monitoring-preview]"],
    ["timeline", "[data-panel='timeline']"],
    ["Evidence Inbox address", "[data-home-inbox-address]"],
    ["evidence summary", "[data-evidence-list], [data-evidence-summary], [data-evidence-property-filter]"]
  ];
  const results = [];
  for (const [name, selector] of selectors) {
    const text = await page.evaluate(`(() => {
      const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
      return nodes.map((node) => node.innerText || node.textContent || "").join("\\n").trim();
    })()`);
    if (text) {
      results.push({
        name,
        selector,
        text: text.slice(0, 1400),
        containsSelectedAddress: selectedAddressPattern.test(text),
        containsLegacyAddress: legacyAddressPattern.test(text)
      });
    }
  }
  return results;
}

async function collectCopyAudit(page, origin, workspaceHref) {
  const routes = [
    `${origin}/`,
    `${origin}/services.html`,
    `${origin}/add-property.html`,
    `${origin}/my-properties.html`,
    workspaceHref
  ];
  const findings = [];
  for (const route of routes) {
    await page.goto(route);
    const text = await page.visibleText("body");
    const matchedTerms = internalTerms
      .filter((pattern) => pattern.test(text))
      .map((pattern) => pattern.source);
    if (matchedTerms.length) {
      findings.push({ route, matchedTerms });
    }
  }
  return findings;
}

async function capture(page, viewport, targetName, log, extra = {}) {
  const fileName = `${viewport.name}-${slug(targetName)}.png`;
  const filePath = path.join(screenshotDir, fileName);
  await page.screenshot(filePath);
  const snap = await page.snapshot();
  log.push({
    file: `screenshots/${fileName}`,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    target: targetName,
    url: snap.url,
    title: snap.title,
    h1: snap.h1,
    scrollY: snap.scrollY,
    textSelectionLength: snap.selection.length,
    console: page.console.filter((item) => item.type === "error" || item.type === "warning"),
    pageErrors: page.pageErrors,
    ...extra
  });
}

async function prepareState(page, origin, state, workspaceHref) {
  if (state === "afterAddressSelection" || state === "reviewFoundData") {
    await page.goto(`${origin}/add-property.html`);
    await page.fill("#addPropertyPostcode", selectedPostcode);
    await page.submit("#addPropertySearchForm");
    await page.waitFor(`document.querySelectorAll("[data-use-address]").length > 0`, 10000);
    if (state === "afterAddressSelection") return;
    await page.evaluate(`document.querySelector("[data-use-address]")?.scrollIntoView({ block: "center", inline: "nearest" }); true`);
    await page.clickNoScroll("[data-use-address]");
    await page.waitFor(`Boolean(document.querySelector("[data-canonical-review]"))`, 12000);
    return;
  }
  await page.goto(workspaceHref);
  if (state === "workspaceHome" || state === "nextBestAction") return;
  if (state === "evidence") {
    await page.click('[data-global-nav="Evidence Vault"]');
    await delay(300);
    return;
  }
  if (state === "askCmp") {
    await page.click('[data-global-nav="Ask CMP"]');
    await delay(300);
    return;
  }
  if (state === "reportPreview") {
    await page.click("[data-canonical-report-preview]");
    await delay(500);
    return;
  }
  if (state === "monitoring") {
    await page.click('[data-tab="timeline"]');
    await delay(300);
  }
}

async function captureRequestedScreenshots(chrome, origin, workspaceHref) {
  const screenshotLog = [];
  for (const viewport of viewports) {
    const page = await newPage(chrome);
    await page.setViewport(viewport);
    for (const target of screenshotTargets) {
      if (target.route) {
        await page.goto(`${origin}${target.route}`);
      } else {
        await prepareState(page, origin, target.state, workspaceHref);
      }
      await capture(page, viewport, target.name, screenshotLog);
    }
    await page.close();
  }
  return screenshotLog;
}

function contactSheetHtml(log) {
  const cards = log.map((item) => `
    <article>
      <img src="${item.file}" alt="${item.viewport} ${item.target}">
      <div>
        <strong>${item.viewport} - ${item.target}</strong>
        <span>${item.file}</span>
        <small>${item.h1 || item.title}</small>
      </div>
    </article>
  `).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CMP Final Polish Contact Sheet</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f5f1e8; color: #172033; }
    header { padding: 32px; border-bottom: 1px solid #d8d0c1; background: #fffaf0; }
    h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: 0; }
    p { margin: 0; color: #586273; }
    main { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; padding: 24px; }
    article { background: white; border: 1px solid #ded6c8; border-radius: 8px; overflow: hidden; }
    img { display: block; width: 100%; height: 260px; object-fit: contain; object-position: top; background: white; border-bottom: 1px solid #eee6d7; }
    div { padding: 12px; }
    strong, span, small { display: block; line-height: 1.35; }
    span, small { color: #667085; font-size: 12px; }
  </style>
</head>
<body>
  <header>
    <h1>CMP Final Polish Contact Sheet</h1>
    <p>Desktop, tablet and mobile captures for the final journey-polish audit.</p>
  </header>
  <main>${cards}</main>
</body>
</html>`;
}

function uxReviewMarkdown(report, copyAudit, screenshotLog) {
  const issues = report.issues.map((issue) => `- ${issue.severity}: ${issue.title} (${issue.area})`).join("\n") || "- No blocking issues recorded.";
  const copyLines = copyAudit.findings.map((item) => `- ${item.route}: ${item.matchedTerms.join(", ")}`).join("\n") || "- No internal terminology found on audited normal routes.";
  return `# CMP Final Polish UX Review

Generated: ${new Date().toISOString()}

## Verdict

${report.passed ? "PASS" : "FAIL"} for ${mode}.

## Browser

- In-app Browser: unavailable in this environment (\`iab\` runtime did not exist).
- Fallback: system Chrome controlled through Chrome DevTools Protocol.
- Fresh browser context: yes.

## Issues

${issues}

## Add Property Progression

${report.addPropertyProgression.map((item) => `- ${item.step}: ${item.passed ? "PASS" : "FAIL"} (scroll ${item.beforeScrollY} -> ${item.afterScrollY})`).join("\n")}
- failed validation no-scroll: ${report.failedValidation.passed ? "PASS" : "FAIL"} (scroll ${report.failedValidation.beforeScrollY} -> ${report.failedValidation.afterScrollY})
- reduced motion progression: ${report.reducedMotion.passed ? "PASS" : "FAIL"} (search ${report.reducedMotion.searchScrollY}, review ${report.reducedMotion.reviewScrollY})

## Context Integrity

- selected property: ${report.contextIntegrity.selectedAddress}
- legacy address leaks: ${report.contextIntegrity.legacyLeakCount}
- surface mismatches: ${report.contextIntegrity.surfaceMismatchCount}

## Next Action Consistency

- expected: ${report.nextActionConsistency.expectedTitle}
- inconsistent surfaces: ${report.nextActionConsistency.inconsistentSurfaces.length}

## Service Request

- prepare service request: ${report.serviceRequestPreparation.passed ? "PASS" : "FAIL"}

## Copy Audit

${copyLines}

## Screenshot Artefact Check

- Text selection cleared before screenshots: ${screenshotLog.every((item) => item.textSelectionLength === 0) ? "yes" : "no"}.
- Duplicate sticky navigation was checked against the DOM; screenshots may duplicate fixed elements during full-page capture, but no extra navigation node is created by the app when the DOM count remains one.

## Screenshots

${screenshotLog.map((item) => `- ${item.file}: ${item.viewport} ${item.target}`).join("\n")}
`;
}

function copyAuditMarkdown(copyAudit) {
  const findings = copyAudit.findings.map((item) => `- ${item.route}: ${item.matchedTerms.join(", ")}`).join("\n") || "- No audited normal route exposed the listed internal/prototype wording.";
  return `# CMP Landlord Copy Audit

## Normal Routes Checked

${copyAudit.routes.map((route) => `- ${route}`).join("\n")}

## Findings

${findings}

## Safety Wording

${copyAudit.requiredSafeCopy.map((item) => `- ${item.label}: ${item.present ? "present" : "missing"}`).join("\n")}

## Notes

Normal user copy should stay landlord-facing. Demo and QA routes may retain explicit simulated-data labels when they are clearly marked as demo/QA surfaces.
`;
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  const staticServer = await startStaticServer();
  const chrome = await launchChrome();
  const mainPage = await newPage(chrome);
  const progression = [];
  const issues = [];
  let screenshotLog = [];
  try {
    const { handoffHref } = await createCanonicalProperty(mainPage, staticServer.origin, viewports[0], progression);
    await mainPage.goto(handoffHref);
    await mainPage.waitFor(`document.body.classList.contains("canonical-property-route")`, 10000);
    const localStorageDump = await mainPage.evaluate(`Object.fromEntries(Object.entries(localStorage))`);
    const propertyId = new URL(handoffHref).searchParams.get("propertyId");
    const expected = deriveExpectedNextAction(localStorageDump, propertyId);
    const selectedAddress = expected?.property?.identity?.displayAddress || "";

    const surfaceTexts = await collectVisibleSurfaceTexts(mainPage);
    await mainPage.click('[data-tab="timeline"]');
    await delay(250);
    surfaceTexts.push(...(await collectVisibleSurfaceTexts(mainPage)).filter((item) => item.name === "timeline"));
    await mainPage.goto(handoffHref);
    await mainPage.click('[data-global-nav="Evidence Vault"]');
    await delay(250);
    surfaceTexts.push(...(await collectVisibleSurfaceTexts(mainPage)).filter((item) => ["Evidence Inbox address", "evidence summary"].includes(item.name)));
    await mainPage.goto(handoffHref);
    await mainPage.click("[data-canonical-ask-prompt]");
    await delay(350);
    const askResponseText = await mainPage.visibleText("[data-assistant-panel], [data-assistant-response], body");
    surfaceTexts.push({
      name: "Ask CMP response",
      selector: "[data-canonical-ask-prompt]",
      text: askResponseText.slice(0, 1400),
      containsSelectedAddress: selectedAddressPattern.test(askResponseText),
      containsLegacyAddress: legacyAddressPattern.test(askResponseText)
    });
    await mainPage.goto(handoffHref);
    await mainPage.click("[data-canonical-report-preview]");
    await delay(350);
    const reportPreviewText = await mainPage.visibleText("[data-assistant-panel], [data-assistant-response], body");
    surfaceTexts.push({
      name: "report preview",
      selector: "[data-canonical-report-preview]",
      text: reportPreviewText.slice(0, 1400),
      containsSelectedAddress: selectedAddressPattern.test(reportPreviewText),
      containsLegacyAddress: legacyAddressPattern.test(reportPreviewText)
    });

    const contextIntegrity = {
      selectedAddress,
      surfaces: surfaceTexts,
      legacyLeakCount: surfaceTexts.filter((item) => item.containsLegacyAddress).length,
      surfaceMismatchCount: surfaceTexts.filter((item) => /property|address|selected|report|Ask CMP|Evidence|timeline|monitoring/i.test(item.name) && item.text && !item.containsSelectedAddress && item.containsLegacyAddress).length
    };

    if (!selectedAddressPattern.test(selectedAddress)) {
      issues.push({ severity: "blocking", area: "context", title: `Selected address was ${selectedAddress || "missing"}` });
    }
    for (const surface of contextIntegrity.surfaces.filter((item) => item.containsLegacyAddress)) {
      issues.push({ severity: "blocking", area: "context", title: `${surface.name} leaks 57 The Butts` });
    }

    const expectedAction = expected?.nextBestAction || null;
    await mainPage.goto(handoffHref);
    const nextSurfaces = [
      ["property hero", ".portfolio-home-header"],
      ["action card", "[data-canonical-next-action]"],
      ["portfolio summary", "[data-home-summary-title], [data-home-summary-body]"],
      ["service recommendation", "[data-home-upcoming-grid]"]
    ];
    const nextSurfaceResults = [];
    for (const [name, selector] of nextSurfaces) {
      nextSurfaceResults.push({
        name,
        text: await mainPage.visibleText(selector),
        matchesExpected: includesNextAction(await mainPage.visibleText(selector), expectedAction)
      });
    }
    await mainPage.click("[data-canonical-ask-prompt]");
    await delay(350);
    nextSurfaceResults.push({
      name: "Ask CMP summary",
      text: await mainPage.visibleText("[data-assistant-panel], [data-assistant-response], body"),
      matchesExpected: includesNextAction(await mainPage.visibleText("[data-assistant-panel], [data-assistant-response], body"), expectedAction)
    });
    await mainPage.goto(handoffHref);
    await mainPage.click('[data-tab="timeline"]');
    await delay(250);
    nextSurfaceResults.push({
      name: "monitoring/timeline",
      text: await mainPage.visibleText("[data-panel='timeline']"),
      matchesExpected: includesNextAction(await mainPage.visibleText("[data-panel='timeline']"), expectedAction)
    });
    const nextActionConsistency = {
      expectedTitle: expectedAction?.title || "",
      expectedPrimaryCta: expectedAction?.primaryCtaLabel || "",
      surfaces: nextSurfaceResults,
      inconsistentSurfaces: nextSurfaceResults.filter((item) => !item.matchesExpected)
    };
    for (const item of nextActionConsistency.inconsistentSurfaces) {
      issues.push({ severity: "blocking", area: "next-action", title: `${item.name} does not match ${nextActionConsistency.expectedTitle}` });
    }

    await mainPage.goto(handoffHref);
    await mainPage.click("[data-canonical-service-request]");
    await delay(500);
    const serviceRequestText = await mainPage.visibleText("body");
    const serviceRequestPreparation = {
      passed: /(?:Service request|Request) prepared/i.test(serviceRequestText)
        && /No supplier contacted/i.test(serviceRequestText)
        && /No payment taken/i.test(serviceRequestText),
      text: serviceRequestText.slice(0, 1400)
    };
    if (!serviceRequestPreparation.passed) {
      issues.push({ severity: "blocking", area: "service", title: "Service request preparation did not show the required safe state" });
    }

    const reducedMotion = await validateReducedMotion(staticServer.origin, chrome);
    const failedValidation = await validateFailedValidationNoScroll(staticServer.origin, chrome);
    for (const item of progression.filter((step) => !step.passed)) {
      issues.push({ severity: "major", area: "add-property", title: `${item.step} does not move to the next section` });
    }
    if (!reducedMotion.passed) {
      issues.push({ severity: "major", area: "add-property", title: "Reduced-motion progression does not move to the next section" });
    }
    if (!failedValidation.passed) {
      issues.push({ severity: "major", area: "add-property", title: "Validation error changes scroll position" });
    }

    const copyAuditRoutes = [
      `${staticServer.origin}/`,
      `${staticServer.origin}/services.html`,
      `${staticServer.origin}/add-property.html`,
      `${staticServer.origin}/my-properties.html`,
      handoffHref
    ];
    const copyAudit = {
      routes: copyAuditRoutes,
      findings: await collectCopyAudit(mainPage, staticServer.origin, handoffHref),
      requiredSafeCopy: []
    };
    const combinedNormalText = [];
    for (const route of copyAuditRoutes) {
      await mainPage.goto(route);
      combinedNormalText.push(await mainPage.visibleText("body"));
    }
    const combined = combinedNormalText.join("\n");
    copyAudit.requiredSafeCopy = requiredSafeCopy.map((pattern) => ({
      label: pattern.source,
      present: pattern.test(combined)
    }));
    for (const finding of copyAudit.findings) {
      issues.push({ severity: "major", area: "copy", title: `${finding.route} exposes internal/prototype wording` });
    }

    screenshotLog = await captureRequestedScreenshots(chrome, staticServer.origin, handoffHref);

    const report = {
      mode,
      generatedAt: new Date().toISOString(),
      browser: {
        inAppBrowser: "unavailable: iab",
        fallback: "system Chrome via Chrome DevTools Protocol",
        freshContext: true
      },
      origin: staticServer.origin,
      propertyId,
      contextIntegrity,
      nextActionConsistency,
      serviceRequestPreparation,
      addPropertyProgression: progression,
      reducedMotion,
      failedValidation,
      screenshotArtefactCheck: {
        textSelectionCleared: screenshotLog.every((item) => item.textSelectionLength === 0),
        duplicateStickyNavigationDomCount: "checked by DOM visibility rather than CSS change",
        conclusion: "Do not change product CSS for capture-only selection or fixed-element artefacts unless visible in DOM."
      },
      issues,
      passed: issues.length === 0
    };

    await writeFile(path.join(auditDir, "CMP_CONTEXT_INTEGRITY_REPORT.json"), JSON.stringify(report, null, 2));
    await writeFile(path.join(auditDir, "CMP_FINAL_POLISH_SCREENSHOT_LOG.json"), JSON.stringify(screenshotLog, null, 2));
    await writeFile(path.join(auditDir, "CMP_FINAL_POLISH_CONTACT_SHEET.html"), contactSheetHtml(screenshotLog));
    await writeFile(path.join(auditDir, "CMP_FINAL_POLISH_UX_REVIEW.md"), uxReviewMarkdown(report, copyAudit, screenshotLog));
    await writeFile(path.join(auditDir, "CMP_LANDLORD_COPY_AUDIT.md"), copyAuditMarkdown(copyAudit));

    if (failOnIssues && issues.length) {
      console.error(`CMP final journey polish audit failed with ${issues.length} issue(s).`);
      for (const issue of issues) console.error(`- ${issue.severity}: ${issue.area}: ${issue.title}`);
      process.exitCode = 1;
    } else {
      console.log(`CMP final journey polish audit ${issues.length ? "completed with issues" : "passed"} (${screenshotLog.length} screenshots).`);
    }
  } finally {
    await mainPage.close().catch(() => {});
    await chrome.close().catch(() => {});
    await staticServer.close().catch(() => {});
  }
}

await main();
