import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const auditRoot = path.join(repoRoot, "audit/2026-06-29-cmp-nick-safe-rescue");
const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const breakpoints = {
  "1440x1000": { width: 1440, height: 1000 },
  "1280x800": { width: 1280, height: 800 },
  "1024x900": { width: 1024, height: 900 },
  "390x844": { width: 390, height: 844 }
};
const desktop = breakpoints["1440x1000"];

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const npxDir = path.join(os.homedir(), ".npm", "_npx");
    if (fs.existsSync(npxDir)) {
      for (const entry of fs.readdirSync(npxDir)) {
        const modulePath = path.join(npxDir, entry, "node_modules", "playwright", "index.mjs");
        if (fs.existsSync(modulePath)) return await import(pathToFileURL(modulePath).href);
      }
    }
    throw new Error("Playwright is not available in local imports or the npx cache.");
  }
}

async function withStaticServer(fn) {
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
      const ext = path.extname(filePath);
      response.writeHead(200, {
        "content-type": {
          ".html": "text/html; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".svg": "image/svg+xml",
          ".png": "image/png",
          ".jpg": "image/jpeg"
        }[ext] || "application/octet-stream"
      });
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function selection(overrides = {}) {
  return {
    id: "nick-safe-address",
    uprn: "NICK-SAFE-UPRN",
    address: "18 Willow Brook Drive, Solihull, B37 7BA",
    postcode: "B37 7BA",
    city: "Solihull",
    type: "Semi-detached house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      currentScore: 72,
      potential: "B",
      potentialScore: 83,
      issue: "2024-02-10",
      expiry: "2034-02-10",
      certificate: "NICK-SAFE-EPC",
      source: "Example EPC register match"
    },
    ...overrides
  };
}

function createProperty(options = {}) {
  const result = bridge.createPropertyRecord(selection(options.selection || {}), {
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    propertyId: options.id || "prop_nick_safe_one",
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: options.answeredQuestions || {}
    },
    now: "2026-06-29T09:00:00.000Z",
    randomUUID: () => options.id || "prop-nick-safe-one"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    ...result.value.property,
    lifecycleStatus: "active",
    currentSetupStage: options.setupStage || "review_found_data",
    landlordAnswers: [],
    evidence: [],
    serviceRequests: [],
    timeline: [],
    monitoring: []
  };
}

function createStore() {
  const store = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-29T09:00:00.000Z" });
  const one = createProperty();
  store.propertiesById[one.id] = one;
  store.propertyOrder.push(one.id);
  store.lastSelectedPropertyId = one.id;
  return store;
}

async function newPage(browser, viewport = desktop, seedStore = false) {
  const context = await browser.newContext({ viewport });
  if (seedStore) {
    await context.addInitScript(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [publicStorageKey, createStore()]);
  }
  const page = await context.newPage();
  const events = { consoleMessages: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) events.consoleMessages.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => events.pageErrors.push(error.message));
  page.on("requestfailed", (request) => events.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || "" }));
  page.on("response", (response) => {
    if (response.status() >= 400) events.badResponses.push({ url: response.url(), status: response.status() });
  });
  return { context, page, events };
}

async function visibleText(page) {
  return (await page.locator("body").innerText({ timeout: 10000 })).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function parseRgb(value) {
  const match = String(value || "").match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function luminance([r, g, b]) {
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const fg = parseRgb(foreground);
  const bg = parseRgb(background);
  if (!fg || !bg) return 21;
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function pageMetrics(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const parseColor = (value) => {
      const match = String(value || "").match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\s*\)/);
      if (!match) return null;
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] === undefined ? 1 : Number(match[4])
      };
    };
    const blend = (top, bottom) => ({
      r: Math.round(top.r * top.a + bottom.r * (1 - top.a)),
      g: Math.round(top.g * top.a + bottom.g * (1 - top.a)),
      b: Math.round(top.b * top.a + bottom.b * (1 - top.a)),
      a: 1
    });
    const backgroundFor = (el) => {
      const colors = [];
      let node = el;
      while (node) {
        const color = parseColor(getComputedStyle(node).backgroundColor);
        if (color && color.a > 0) colors.push(color);
        if (color && color.a >= 1) break;
        node = node.parentElement;
      }
      const resolved = colors.reverse().reduce((bottom, top) => blend(top, bottom), { r: 255, g: 255, b: 255, a: 1 });
      return `rgb(${resolved.r}, ${resolved.g}, ${resolved.b})`;
    };
    const textNodes = Array.from(document.querySelectorAll("p, small, span, strong, em, li, dt, dd, label, button, a, input, textarea, select, h1, h2, h3, h4"))
      .filter(visible)
      .filter((el) => (el.innerText || el.value || el.getAttribute("aria-label") || "").trim())
      .map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 120),
          color: style.color,
          backgroundColor: backgroundFor(el),
          opacity: Number(style.opacity || 1),
          fontSize: Number.parseFloat(style.fontSize || "16"),
          disabled: Boolean(el.disabled || el.getAttribute("aria-disabled") === "true"),
          width: rect.width,
          height: rect.height
        };
      });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      textNodes,
      visibleTabs: Array.from(document.querySelectorAll("[data-tab]")).filter(visible).map((el) => (el.innerText || "").trim()),
      visibleNav: Array.from(document.querySelectorAll("[data-global-nav]")).filter(visible).map((el) => (el.innerText || "").trim().replace(/\s+/g, " ")),
      visibleButtons: Array.from(document.querySelectorAll("button, a.button, .primary-button, .secondary-button, .text-button")).filter(visible).map((el) => (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")),
      assistantRailVisible: Boolean(document.querySelector(".assistant-rail") && visible(document.querySelector(".assistant-rail"))),
      qaVisible: Array.from(document.querySelectorAll("[data-qa-only], [data-demo-state-open], [data-demo-guide-open], .scenario-panel, .what-if-panel")).filter(visible).map((el) => (el.innerText || el.getAttribute("aria-label") || el.className || "").trim().replace(/\s+/g, " ").slice(0, 120)),
      reviewRendererCount: document.querySelectorAll("[data-canonical-review]").length,
      handoffAnchorCount: document.querySelectorAll("[data-canonical-handoff]").length,
      handoffSectionCount: document.querySelectorAll("[data-canonical-handoff-section]").length,
      reviewGroupHeadings: Array.from(document.querySelectorAll("[data-canonical-review] .stage-h-review-panel-head h3, [data-canonical-review] [data-canonical-handoff-section] h3")).filter(visible).map((el) => el.innerText.trim()),
      reviewLooseItemCount: document.querySelectorAll("[data-canonical-review] > .add-property-review-list, [data-canonical-review] .helper-card .add-property-review-item").length
    };
  });
}

function lowContrastNodes(metrics) {
  return metrics.textNodes
    .map((node) => ({ ...node, ratio: contrastRatio(node.color, node.backgroundColor) }))
    .filter((node) => !node.disabled && node.text && node.fontSize < 24 && node.ratio < 4.5)
    .slice(0, 12);
}

function lowOpacityNodes(metrics) {
  return metrics.textNodes
    .filter((node) => !node.disabled && node.text && node.opacity < 0.82)
    .slice(0, 12);
}

function relevantBrowserErrors(events) {
  const ignored = /favicon|Failed to load resource: the server responded with a status of 404|data:image/i;
  return {
    pageErrors: events.pageErrors,
    consoleMessages: events.consoleMessages.filter((item) => item.type === "error" && !ignored.test(item.text)),
    failedRequests: events.failedRequests.filter((item) => !ignored.test(item.url) && !ignored.test(item.failure)),
    badResponses: events.badResponses.filter((item) => !ignored.test(item.url))
  };
}

function push(assertions, name, pass, detail = "") {
  assertions.push({ name, pass: Boolean(pass), detail: String(detail || "") });
}

async function openReview(page, origin) {
  await page.goto(`${origin}/add-property.html`, { waitUntil: "networkidle", timeout: 25000 });
  await page.fill("#addPropertyPostcode", "B37 7BA");
  await page.click("#addPropertySearchForm button[type='submit']");
  await page.waitForSelector("[data-use-address]", { timeout: 12000 });
  await page.locator("[data-use-address]").first().click();
  await page.waitForSelector("[data-canonical-review]", { timeout: 12000 });
  await page.waitForTimeout(450);
}

async function openWorkspace(page, origin) {
  await page.goto(`${origin}/dashboard-labs.html?propertyId=prop_nick_safe_one`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(500);
}

async function capture(page, filepath) {
  await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
  await page.screenshot({ path: filepath, fullPage: false });
}

async function clickFirstVisible(page, selectors) {
  const clicked = await page.evaluate((candidateSelectors) => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    for (const selector of candidateSelectors) {
      const target = Array.from(document.querySelectorAll(selector)).find(visible);
      if (target) {
        target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return selector;
      }
    }
    return "";
  }, selectors);
  assert.ok(clicked, `No visible target for ${selectors.join(", ")}`);
  await page.waitForTimeout(500);
}

async function screenshotSet(browser, origin, phase) {
  const screenshotDir = path.join(auditRoot, phase);
  const manifest = [];
  const states = [
    ["01-add-property-initial", async (page) => page.goto(`${origin}/add-property.html`, { waitUntil: "networkidle", timeout: 25000 })],
    ["02-review-found-data", async (page) => openReview(page, origin)],
    ["03-review-handoff", async (page) => {
      await openReview(page, origin);
      await page.locator("[data-canonical-handoff], .review-handoff-card").first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
    }],
    ["04-property-questions", async (page) => {
      await openWorkspace(page, origin);
      await page.locator("[data-normal-canonical-primary]").first().click();
      await page.waitForTimeout(500);
    }],
    ["05-first-workspace-overview", async (page) => openWorkspace(page, origin)],
    ["06-evidence", async (page) => {
      await openWorkspace(page, origin);
      await clickFirstVisible(page, ["[data-tab='documents']", "[data-global-nav='Evidence Vault']"]);
    }],
    ["07-action-plan", async (page) => {
      await openWorkspace(page, origin);
      await clickFirstVisible(page, ["[data-tab='action']", "[data-global-nav='Tasks']", "[data-tab='compliance']"]);
    }],
    ["08-monitoring", async (page) => {
      await openWorkspace(page, origin);
      await clickFirstVisible(page, ["[data-tab='monitoring']", "[data-global-nav='Activity']", "[data-tab='timeline']"]);
    }],
    ["09-my-properties-one-property", async (page) => {
      await page.goto(`${origin}/my-properties.html`, { waitUntil: "networkidle", timeout: 25000 });
      await page.waitForTimeout(500);
    }]
  ];
  for (const [breakpointName, viewport] of Object.entries(breakpoints)) {
    for (const [stateName, prepare] of states) {
      const { context, page } = await newPage(browser, viewport, true);
      await prepare(page);
      const file = `${breakpointName}-${stateName}.png`;
      await capture(page, path.join(screenshotDir, file));
      manifest.push({ phase, breakpoint: breakpointName, state: stateName, file: `${phase}/${file}` });
      await context.close();
    }
  }
  await fs.promises.writeFile(path.join(screenshotDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

async function reviewAssertions(browser, origin, assertions) {
  const { context, page, events } = await newPage(browser, desktop);
  await openReview(page, origin);
  const text = await visibleText(page);
  const metrics = await pageMetrics(page);
  push(assertions, "one Review Found Data renderer", metrics.reviewRendererCount === 1, String(metrics.reviewRendererCount));
  push(assertions, "one handoff section", metrics.handoffSectionCount === 1 && metrics.handoffAnchorCount === 1, JSON.stringify({ sections: metrics.handoffSectionCount, anchors: metrics.handoffAnchorCount }));
  push(assertions, "review is exactly two decision groups plus handoff", JSON.stringify(metrics.reviewGroupHeadings) === JSON.stringify(["What CMP found", "What CMP still needs", "What happens next"]), JSON.stringify(metrics.reviewGroupHeadings));
  push(assertions, "handoff heading copy and CTAs match Nick-safe contract", /What happens next/i.test(text) && /Answer the remaining property questions so CMP can complete the Property Brain and recommend one clear next action\./i.test(text) && /Continue property setup/i.test(text) && /Save and return to My Properties/i.test(text), text.slice(0, 1600));
  push(assertions, "no duplicate What to do next cards", !/What to do next/i.test(text), text.match(/What to do next/i)?.[0] || "");
  push(assertions, "review found data does not render loose cards", metrics.reviewLooseItemCount === 0, String(metrics.reviewLooseItemCount));
  push(assertions, "review has no low contrast normal text", lowContrastNodes(metrics).length === 0, JSON.stringify(lowContrastNodes(metrics)));
  push(assertions, "review has no low opacity normal text", lowOpacityNodes(metrics).length === 0, JSON.stringify(lowOpacityNodes(metrics)));
  const browserErrors = relevantBrowserErrors(events);
  push(assertions, "review route has no console/page errors", browserErrors.pageErrors.length === 0 && browserErrors.consoleMessages.length === 0 && browserErrors.failedRequests.length === 0 && browserErrors.badResponses.length === 0, JSON.stringify(browserErrors));
  await context.close();

  const mobile = await newPage(browser, breakpoints["390x844"]);
  await openReview(mobile.page, origin);
  await mobile.page.locator("[data-canonical-handoff-section]").first().scrollIntoViewIfNeeded();
  await mobile.page.waitForTimeout(250);
  const mobileHandoff = await mobile.page.evaluate(() => {
    const card = document.querySelector("[data-canonical-handoff-section]");
    const heading = card?.querySelector("h3");
    const copy = card?.querySelector("p");
    const actions = Array.from(card?.querySelectorAll(".button") || []);
    const rectFor = (el) => {
      const rect = el?.getBoundingClientRect();
      return rect ? { width: rect.width, height: rect.height } : { width: 0, height: 0 };
    };
    return {
      heading: rectFor(heading),
      copy: rectFor(copy),
      actions: actions.map(rectFor)
    };
  });
  push(assertions, "390px review handoff remains readable", mobileHandoff.heading.width >= 200 && mobileHandoff.copy.width >= 200 && mobileHandoff.copy.height < 180 && mobileHandoff.actions.every((rect) => rect.width >= 200), JSON.stringify(mobileHandoff));
  await mobile.context.close();
}

async function workspaceAssertions(browser, origin, assertions, viewport = desktop) {
  const { context, page, events } = await newPage(browser, viewport, true);
  await openWorkspace(page, origin);
  const text = await visibleText(page);
  const metrics = await pageMetrics(page);
  const expectedTabs = ["Overview", "Evidence", "Action Plan", "Monitoring"];
  const visibleWorkspaceSections = metrics.visibleTabs.length ? metrics.visibleTabs : metrics.visibleNav;
  const forbiddenWorkspaceSections = /Compliance centre|Complete property check|Add property|Ask CMP|Services|Request service|Learn|Settings|Portfolio Sweep/i;
  const bodyState = await page.evaluate(() => ({
    url: location.href,
    propertyIds: Array.from(new URLSearchParams(location.search).getAll("propertyId")),
    selectedAddressCount: (document.body.innerText.match(/18 Willow Brook Drive/g) || []).length,
    otherAddressCount: (document.body.innerText.match(/57 The Butts|Station Road|Canal View/g) || []).length,
    primaryNextActions: document.querySelectorAll("[data-normal-canonical-primary]").length
  }));
  push(assertions, `${viewport.width}px workspace has four allowed sections`, expectedTabs.every((label) => visibleWorkspaceSections.includes(label)) && !visibleWorkspaceSections.some((label) => forbiddenWorkspaceSections.test(label)), JSON.stringify({ tabs: metrics.visibleTabs, nav: metrics.visibleNav }));
  push(assertions, `${viewport.width}px workspace hides permanent Ask CMP rail`, !metrics.assistantRailVisible, String(metrics.assistantRailVisible));
  push(assertions, `${viewport.width}px workspace hides portfolio/demo/scenario controls`, metrics.qaVisible.length === 0 && !/Portfolio Sweep|portfolio comparison|QA states|QA guide|scenario controls|command centre|Assistant command centre/i.test(text), JSON.stringify(metrics.qaVisible));
  push(assertions, `${viewport.width}px workspace has no Continue guided check`, !/Continue guided check/i.test(text), text.match(/Continue guided check/i)?.[0] || "");
  push(assertions, `${viewport.width}px workspace has one propertyId and one address`, bodyState.propertyIds.length === 1 && bodyState.propertyIds[0] === "prop_nick_safe_one" && bodyState.selectedAddressCount > 0 && bodyState.otherAddressCount === 0, JSON.stringify(bodyState));
  push(assertions, `${viewport.width}px workspace first view has one clear next action`, /Continue property setup|Add evidence|Review next action/i.test(text) && bodyState.primaryNextActions === 1 && /What CMP has confirmed|What still needs checking|Property file strength|Next best action/i.test(text), text.slice(0, 1800));
  push(assertions, `${viewport.width}px workspace has no horizontal overflow`, metrics.scrollWidth <= metrics.innerWidth + 1 && metrics.bodyWidth <= metrics.innerWidth + 1, `${metrics.scrollWidth}/${metrics.innerWidth}`);
  push(assertions, `${viewport.width}px workspace has no low contrast normal text`, lowContrastNodes(metrics).length === 0, JSON.stringify(lowContrastNodes(metrics)));
  push(assertions, `${viewport.width}px workspace has no low opacity normal text`, lowOpacityNodes(metrics).length === 0, JSON.stringify(lowOpacityNodes(metrics)));
  const browserErrors = relevantBrowserErrors(events);
  push(assertions, `${viewport.width}px workspace has no console/page errors`, browserErrors.pageErrors.length === 0 && browserErrors.consoleMessages.length === 0 && browserErrors.failedRequests.length === 0 && browserErrors.badResponses.length === 0, JSON.stringify(browserErrors));
  await context.close();
}

function sourceAssertions(assertions) {
  const publicPages = read("public-pages.js");
  const dashboardHtml = read("dashboard-labs.html");
  const dashboardJs = read("dashboard-labs.js");
  push(assertions, "one Add Property route", /href="add-property\.html"|add-property\.html/.test(publicPages + dashboardHtml) && !/az-checker-v2\.html/.test(publicPages), "Add property should not fork to A-Z on normal routes.");
  push(assertions, "one Review Found Data renderer in source", (publicPages.match(/function renderCanonicalReview/g) || []).length === 1, String((publicPages.match(/function renderCanonicalReview/g) || []).length));
  push(assertions, "no normal-route Portfolio Sweep copy in selected-property source path", !/normalCanonical[\s\S]{0,500}Portfolio Sweep/i.test(dashboardJs), "normal selected route should not mention Portfolio Sweep");
}

async function runChecks(browser, origin) {
  const assertions = [];
  sourceAssertions(assertions);
  await reviewAssertions(browser, origin, assertions);
  await workspaceAssertions(browser, origin, assertions, desktop);
  await workspaceAssertions(browser, origin, assertions, breakpoints["390x844"]);
  const failures = assertions.filter((item) => !item.pass);
  if (failures.length) {
    console.error("CMP Nick-safe rescue check failed:");
    failures.forEach((failure) => console.error(`- ${failure.name}${failure.detail ? `: ${failure.detail}` : ""}`));
    console.error(`Failed ${failures.length} of ${assertions.length} assertions.`);
    process.exitCode = 1;
  } else {
    console.log(`CMP Nick-safe rescue check passed (${assertions.length} assertions).`);
  }
  return assertions;
}

async function writeContactSheet(manifest) {
  const rows = manifest.map((item) => `
    <article>
      <h2>${item.phase} / ${item.breakpoint} / ${item.state}</h2>
      <img src="${item.file}" alt="${item.phase} ${item.breakpoint} ${item.state}">
    </article>
  `).join("");
  await fs.promises.mkdir(auditRoot, { recursive: true });
  await fs.promises.writeFile(path.join(auditRoot, "CMP_NICK_SAFE_CONTACT_SHEET.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMP Nick-safe rescue contact sheet</title>
  <style>
    body { margin: 0; padding: 24px; color: #111827; background: #f8fafc; font-family: system-ui, sans-serif; }
    h1 { margin: 0 0 18px; font-size: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    article { padding: 12px; border: 1px solid #d7dde5; border-radius: 10px; background: white; }
    h2 { margin: 0 0 10px; font-size: 13px; color: #334155; }
    img { display: block; width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>CMP Nick-safe rescue contact sheet</h1>
  <div class="grid">${rows}</div>
</body>
</html>
`);
}

async function main() {
  const phaseArg = process.argv.find((arg) => arg.startsWith("--capture="));
  const capturePhase = phaseArg ? phaseArg.split("=")[1] : "";
  const { chromium } = await loadPlaywright();
  const launchOptions = fs.existsSync(chromePath)
    ? { headless: true, executablePath: chromePath }
    : { headless: true };
  const browser = await chromium.launch(launchOptions);
  try {
    await withStaticServer(async (origin) => {
      if (capturePhase) {
        const manifest = await screenshotSet(browser, origin, capturePhase);
        const combinedManifestPath = path.join(auditRoot, "screenshot-manifest.json");
        const existing = fs.existsSync(combinedManifestPath) ? JSON.parse(fs.readFileSync(combinedManifestPath, "utf8")) : [];
        const combined = [...existing.filter((item) => item.phase !== capturePhase), ...manifest];
        await fs.promises.mkdir(auditRoot, { recursive: true });
        await fs.promises.writeFile(combinedManifestPath, JSON.stringify(combined, null, 2));
        await writeContactSheet(combined);
      }
      await runChecks(browser, origin);
    });
  } finally {
    await browser.close();
  }
}

await main();
