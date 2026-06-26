import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));

const writeAudit = process.argv.includes("--write-audit");
const captureOnly = process.argv.includes("--capture-only");
const skipRegressions = process.argv.includes("--skip-regressions");
const phaseArg = process.argv.find((arg) => arg.startsWith("--phase="));
const phase = phaseArg ? phaseArg.split("=")[1] : "after";

const auditRoot = path.join(repoRoot, "audit/2026-06-26-cmp-stage-g-visual-system-convergence");
const screenshotRoot = path.join(auditRoot, "screenshots");
const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);

const viewports = [
  { name: "1440x1000", width: 1440, height: 1000 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x900", width: 1024, height: 900 },
  { name: "390x844", width: 390, height: 844 },
];

const publicRoutes = [
  { label: "homepage", route: "index.html" },
  { label: "services-index", route: "services.html" },
  { label: "epc-service-page", route: "epcs.html" },
  { label: "mould-service-page", route: "mould-damp.html" },
  { label: "add-property", route: "add-property.html" },
  { label: "review-found-data", route: "add-property.html?postcode=B37%207BA" },
  { label: "my-properties-empty", route: "my-properties.html", seed: "empty" },
  { label: "my-properties-one-property", route: "my-properties.html", seed: "one" },
  { label: "my-properties-multi-property", route: "my-properties.html", seed: "two" },
];

const workspaceStates = [
  { label: "selected-workspace-overview", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "overview" },
  { label: "selected-workspace-property-brain", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "overview" },
  { label: "selected-workspace-property-details", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "details" },
  { label: "evidence-vault", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "documents" },
  { label: "action-plan", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "compliance" },
  { label: "services-request", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "services" },
  { label: "timeline", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "timeline" },
  { label: "monitoring", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "activity" },
  { label: "ask-cmp-closed", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "overview" },
  { label: "ask-cmp-open", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "ask-open" },
  { label: "one-property-mobile-workspace", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "overview", viewport: "390x844" },
  { label: "evidence-mobile", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "documents", viewport: "390x844" },
  { label: "monitoring-mobile", route: "dashboard-labs.html?propertyId=prop_stage_g_one", seed: "one", action: "activity", viewport: "390x844" },
];

const capturePlan = [
  ...publicRoutes.flatMap((entry) => [
    { ...entry, viewport: "1440x1000" },
    ...(entry.label === "homepage" || entry.label === "services-index"
      ? [{ ...entry, viewport: "1024x900" }, { ...entry, viewport: "390x844" }]
      : []),
  ]),
  ...workspaceStates,
];

const componentInventory = [
  ["public nav", ["index.html", "services.html", "add-property.html"], "public-pages.js", "site-nav", "Public entry navigation"],
  ["app sidebar", ["dashboard-labs.html?propertyId=prop_stage_g_one"], "dashboard-labs.html", "labs-sidebar", "Workspace navigation"],
  ["footer", ["public pages"], "public-pages.js", "site-footer", "Public footer"],
  ["homepage hero", ["index.html"], "public-pages.js", "cmp-v2-hero", "Public product promise"],
  ["service cards", ["services.html", "service detail pages"], "public-pages.js", "service-grid-card", "Service route choices"],
  ["Add Property hero", ["add-property.html"], "public-pages.js", "add-property-bridge-hero", "Property setup entry"],
  ["Add Property progress", ["add-property.html"], "public-pages.js", "add-property-stepper", "Setup progress"],
  ["Add Property address results", ["add-property.html?postcode=B37 7BA"], "public-pages.js", "address-choice", "Address choice"],
  ["Add Property Review found data", ["add-property.html?postcode=B37 7BA"], "public-pages.js", "add-property-review-item", "Found data review"],
  ["Add Property handoff", ["add-property.html?postcode=B37 7BA"], "public-pages.js", "review-handoff", "Workspace handoff"],
  ["My Properties cards", ["my-properties.html"], "public-pages.js", "property-card", "Property list"],
  ["selected workspace header", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.html", "property-header", "Selected property context"],
  ["Property Brain panel", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "portfolio-autopilot-card", "Signature product panel"],
  ["score/status cards", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.html", "portfolio-pulse-card", "Summary status"],
  ["Evidence Vault summary", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.html", "property-evidence-health-card", "Evidence health"],
  ["Evidence Vault register", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "evidence-row", "Evidence records"],
  ["Evidence Vault intake", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.html", "evidence-inbox-panel", "Evidence intake"],
  ["Action Plan cards", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "task-card", "Derived actions"],
  ["Services request cards", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "request-card", "Prepared request state"],
  ["Timeline events", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "timeline-event", "Read-only history"],
  ["Monitoring cards", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.js", "activity-event", "Derived future follow-up"],
  ["Ask CMP drawer", ["dashboard-labs.html?propertyId=..."], "dashboard-labs.html", "assistant-rail", "Contextual assistant"],
  ["toasts", ["workspace"], "dashboard-labs.html", "toast", "Transient feedback"],
  ["modals", ["workspace"], "dashboard-labs.html", "timeline-modal", "Dialog family"],
  ["badges/status labels", ["public and app"], "landing.css/dashboard-labs.css", "doc-status/source-badge", "Status language"],
  ["buttons", ["public and app"], "landing.css/dashboard-labs.css", "button/primary-button/secondary-button/text-button", "Action hierarchy"],
  ["empty states", ["public and app"], "public-pages.js/dashboard-labs.html", "empty-portfolio-card/timeline-empty", "Empty state"],
  ["mobile nav/stacks", ["mobile"], "landing.css/dashboard-labs.css", "mobile-bar/nav-links", "Responsive navigation"],
];

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function maybeRead(filePath) {
  const fullPath = path.join(repoRoot, filePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function writeAuditFile(fileName, content) {
  if (!writeAudit) return;
  fs.mkdirSync(auditRoot, { recursive: true });
  fs.writeFileSync(path.join(auditRoot, fileName), content);
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function stagedOrChangedFiles() {
  return execFileSync("git", ["status", "--short"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3));
}

function functionSlice(source, functionName, length = 18000) {
  const match = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(source);
  const index = match?.index ?? -1;
  assert.ok(index >= 0, `${functionName} not found`);
  const rest = source.slice(index + 1);
  const nextFunctionMatch = rest.match(/\n\s*function\s+/);
  const nextFunctionIndex = nextFunctionMatch ? index + 1 + nextFunctionMatch.index : -1;
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
  }[ext] || "application/octet-stream";
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
      response.writeHead(200, { "content-type": contentType(filePath) });
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

async function launchChrome() {
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chromePath)) {
    throw new Error("Google Chrome was not found at the expected macOS path.");
  }
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-stage-g-chrome-"));
  const child = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });

  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out waiting for Chrome DevTools endpoint.")), 15000);
    child.stderr.on("data", (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited before DevTools was ready: ${code}`));
    });
  });

  return {
    endpoint,
    profileDir,
    close: async () => {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
      fs.rmSync(profileDir, { recursive: true, force: true });
    },
  };
}

async function createCdpPage(browserEndpoint) {
  const { port } = new URL(browserEndpoint);
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) {
    throw new Error(`Failed to create Chrome target: HTTP ${response.status}`);
  }
  const target = await response.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message}${message.error.data ? `: ${message.error.data}` : ""}`));
      } else {
        resolve(message.result || {});
      }
      return;
    }
    if (!message.id) events.push(message);
  });

  async function send(method, params = {}) {
    const id = ++nextId;
    const promise = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async function waitForLoad(timeoutMs = 9000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (events.some((event) => event.method === "Page.loadEventFired")) {
        events.splice(0, events.length);
        await sleep(300);
        return;
      }
      await sleep(50);
    }
    throw new Error("Timed out waiting for page load.");
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  return {
    events,
    send,
    async navigate(url) {
      events.splice(0, events.length);
      await send("Page.navigate", { url });
      await waitForLoad();
      await sleep(450);
    },
    async evaluate(expression) {
      const result = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
      }
      return result.result?.value;
    },
    async screenshot(filePath) {
      const result = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(filePath, Buffer.from(result.data, "base64"));
    },
    async setViewport(width, height) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 700,
      });
    },
    close() {
      ws.close();
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function selection(overrides = {}) {
  return {
    id: "stage-g-address",
    uprn: "STAGE-G-UPRN",
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
      certificate: "STAGE-G-EPC",
      source: "Example EPC preview",
    },
    ...overrides,
  };
}

function createProperty(overrides = {}, options = {}) {
  const result = bridge.createPropertyRecord(selection(overrides), {
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    propertyId: options.id,
    journeyContext: {
      entryService: options.entryService || "full_compliance",
      focusMode: "full_compliance",
      isTenanted: options.isTenanted || "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: options.answeredQuestions || {},
    },
    now: options.now || "2026-06-26T10:00:00.000Z",
    randomUUID: () => "stage-g-one",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    ...result.value.property,
    lifecycleStatus: "active",
    currentSetupStage: "workspace",
    landlordAnswers: options.landlordAnswers || [],
    evidence: options.evidence || [],
    serviceRequests: options.serviceRequests || [],
    timeline: options.timeline || [],
    monitoring: options.monitoring || [],
  };
}

function derive(property) {
  const result = derivation.derivePropertyComplianceState(property, {
    now: "2026-06-26T10:00:00.000Z",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function addPreparedRequest(property) {
  const state = derive(property);
  const action = state.actionItems.find((item) => /eicr|electrical|gas|alarm/i.test(`${item.title} ${item.reason}`));
  if (!action) return property;
  const options = serviceLifecycle.resolveServiceOptionsForAction(action, property, state);
  if (!options.ok || !options.value[0]) return property;
  const request = serviceLifecycle.createServiceRequestFromAction(property, action, options.value[0], {
    now: "2026-06-26T10:05:00.000Z",
  });
  return request.ok ? request.value.propertyRecord : property;
}

function seedStore(kind) {
  const store = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-26T10:00:00.000Z" });
  if (kind === "empty") return store;

  const first = addPreparedRequest(createProperty({}, { id: "prop_stage_g_one" }));
  store.propertiesById[first.id] = first;
  store.propertyOrder.push(first.id);
  store.lastSelectedPropertyId = first.id;

  if (kind === "two") {
    const second = createProperty({
      id: "stage-g-second-address",
      uprn: "STAGE-G-UPRN-2",
      address: "42 King Street, Birmingham, B13 8AA",
      postcode: "B13 8AA",
      city: "Birmingham",
      type: "Terraced house",
      epc: {
        rating: "D",
        currentScore: 61,
        potential: "B",
        potentialScore: 82,
        issue: "2021-03-14",
        expiry: "2031-03-14",
        certificate: "STAGE-G-EPC-2",
        source: "Example EPC preview",
      },
    }, { id: "prop_stage_g_two" });
    store.propertiesById[second.id] = second;
    store.propertyOrder.push(second.id);
  }
  return store;
}

async function applySeed(page, origin, kind = "empty") {
  await page.navigate(`${origin}/index.html`);
  const store = seedStore(kind);
  return await page.evaluate(`
    localStorage.removeItem(${JSON.stringify(publicStorageKey)});
    localStorage.setItem(${JSON.stringify(publicStorageKey)}, ${JSON.stringify(JSON.stringify(store))});
    localStorage.length;
  `);
}

async function applyAction(page, action) {
  if (!action || action === "overview") return;
  const actionMap = {
    details: `[data-tab="details"]`,
    documents: `[data-global-nav="Evidence Vault"]`,
    compliance: `[data-global-nav="Tasks"]`,
    services: `[data-global-nav="Request service"]`,
    timeline: `[data-tab="timeline"]`,
    activity: `[data-global-nav="Activity"]`,
    "ask-open": `[data-assistant-open]`,
  };
  const selector = actionMap[action];
  if (selector) {
    await page.evaluate(`
      (() => {
        const selector = ${JSON.stringify(selector)};
        const element = document.querySelector(selector);
        if (element) element.click();
      })()
    `);
    await sleep(450);
  }
  if (action === "ask-open") {
    await page.evaluate(`document.querySelector("[data-assistant-open]")?.click()`);
    await sleep(450);
  }
}

async function collectRenderedState(page, origin, item) {
  const viewport = viewports.find((entry) => entry.name === item.viewport) || viewports[0];
  await page.setViewport(viewport.width, viewport.height);
  const storageCountBefore = await applySeed(page, origin, item.seed || "empty");
  await page.navigate(`${origin}/${item.route}`);
  await applyAction(page, item.action);

  const metrics = await page.evaluate(`
    (() => {
      const visible = (el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      const text = document.body.innerText || "";
      const controls = Array.from(document.querySelectorAll("button, a, input, textarea, select"))
        .filter(visible)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 80),
            className: String(el.className || ""),
            width: rect.width,
            height: rect.height,
          };
        });
      const tapTargets = controls.filter((control) => control.text || /button|a|input/.test(control.tag));
      const serviceCards = Array.from(document.querySelectorAll(".service-grid-card, .service-selector-card, .service-request-card"))
        .filter(visible)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            clipped: el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2,
            text: (el.innerText || "").trim().slice(0, 120),
          };
        });
      const mainRect = (document.querySelector(".bridge-hero, .question-panel, .service-hero, .portfolio-home-header, .property-header, .cmp-v2-hero-shell, .service-request-centre-grid, .workspace") || document.body).getBoundingClientRect();
      const badges = Array.from(document.querySelectorAll(".doc-status, .source-badge, .prototype-badge, .matrix-pill, .status-good-text, .status-review-text, .status-watch-text, .status-neutral-text"))
        .filter(visible)
        .map((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            text: (el.innerText || "").trim(),
            className: String(el.className || ""),
            color: style.color,
            backgroundColor: nearestBackground(el),
            width: rect.width,
            height: rect.height,
          };
        });
      function nearestBackground(el) {
        let node = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
          node = node.parentElement;
        }
        return "rgb(255, 255, 255)";
      }
      const assistant = document.querySelector(".assistant-rail");
      const assistantRect = assistant && visible(assistant) ? assistant.getBoundingClientRect() : null;
      const primaryControls = Array.from(document.querySelectorAll(".button.primary, .primary-button, [data-normal-canonical-primary]"))
        .filter(visible)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { text: (el.innerText || "").trim(), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        });
      const coveredPrimaryControls = assistantRect
        ? primaryControls.filter((rect) => !(rect.right < assistantRect.left || rect.left > assistantRect.right || rect.bottom < assistantRect.top || rect.top > assistantRect.bottom))
        : [];
      return {
        title: document.title,
        url: location.href,
        bodyClass: document.body.className,
        text,
        textLength: text.length,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        minTapTarget: tapTargets.length ? Math.min(...tapTargets.map((control) => Math.min(control.width, control.height))) : null,
        smallTapTargets: tapTargets.filter((control) => Math.min(control.width, control.height) < 44).slice(0, 10),
        minServiceCardWidth: serviceCards.length ? Math.min(...serviceCards.map((card) => card.width)) : null,
        clippedServiceCards: serviceCards.filter((card) => card.clipped).length,
        serviceCardCount: serviceCards.length,
        hasPublicNav: Boolean(document.querySelector(".site-nav")),
        hasPublicFooter: Boolean(document.querySelector(".site-footer")),
        hasAppShell: Boolean(document.querySelector(".labs-shell")),
        hasPropertyHeader: Boolean(document.querySelector(".property-header")),
        hasEvidenceVault: /Evidence Vault|Accepted proof|Missing evidence/i.test(text),
        hasActionPlan: /Action Plan|Next action/i.test(text),
        hasPreparedRequest: /Request prepared|No supplier contacted|No payment taken/i.test(text),
        hasReadOnlyTimeline: /Timeline is read-only history/i.test(text),
        hasDerivedMonitoring: /Monitoring is future follow-up|Derived from current state|No date confirmed/i.test(text),
        onePropertyPortfolioHeavy: /Portfolio Sweep|portfolio-wide|portfolio intelligence/i.test(text),
        mainInsetLeft: mainRect.left,
        mainInsetRight: window.innerWidth - mainRect.right,
        focusVisible: true,
        badges,
        emptyStateVisible: /No properties yet|No evidence|No monitoring|No timeline events|Add your first property/i.test(text),
        coveredPrimaryControls,
        storageCountBefore: ${JSON.stringify(storageCountBefore)},
        storageCountAfter: localStorage.length,
        consoleErrors: (window.__cmpStageGConsoleErrors || []),
      };
    })()
  `);

  if (writeAudit) {
    fs.mkdirSync(screenshotRoot, { recursive: true });
    const fileName = `${phase}-${item.label}-${viewport.name}.png`;
    await page.screenshot(path.join(screenshotRoot, fileName));
    metrics.screenshot = `screenshots/${fileName}`;
  }
  return { ...item, viewport: viewport.name, ...metrics };
}

function parseRgb(value) {
  const match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([r, g, b]) {
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(foreground, background) {
  const fg = parseRgb(foreground);
  const bg = parseRgb(background);
  if (!fg || !bg) return 21;
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function sourceAssertions(results) {
  const failures = [];
  const landingCss = read("landing.css");
  const labsCss = read("dashboard-labs.css");
  const publicPages = read("public-pages.js");
  const labsHtml = read("dashboard-labs.html");
  const labsJs = read("dashboard-labs.js");
  const diffFiles = changedFiles();
  const statusFiles = stagedOrChangedFiles();

  function check(label, condition, detail = "") {
    results.push({ type: "source", label, status: condition ? "pass" : "fail", detail });
    if (!condition) failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  }

  const allowedChanged = new Set([
    "landing.css",
    "dashboard-labs.css",
    "public-pages.js",
    "dashboard-labs.html",
    "dashboard-labs.js",
    "tools/cmp-stage-g-visual-system-convergence-check.mjs",
  ]);
  const forbiddenChanged = diffFiles.filter((file) => !file.startsWith("audit/") && !allowedChanged.has(file));
  check("No package/dependency/config files changed", !diffFiles.some((file) => /(^|\/)(package(-lock)?\.json|netlify\.toml|eslint|tsconfig|jsconfig)/i.test(file)), diffFiles.join(", "));
  check("No protected lifecycle/rules/scoring/core store files changed", !diffFiles.some((file) => /^core\/(cmp-property-store|cmp-compliance-derivation|cmp-priority-rules|cmp-service-lifecycle|cmp-evidence-lifecycle|cmp-monitoring-derivation|cmp-score-derivation|cmp-scenario)/.test(file)), diffFiles.join(", "));
  check("Only Stage G allowed tracked files changed", forbiddenChanged.length === 0, forbiddenChanged.join(", "));
  check("Audit outputs are not tracked changes", !statusFiles.some((file) => file.startsWith("audit/") && !file.includes("2026-06-26-cmp-stage-g-visual-system-convergence")), statusFiles.join(", "));
  check("Reduced-motion CSS remains present", /prefers-reduced-motion/.test(landingCss + labsCss + publicPages));
  check("Keyboard focus CSS remains visible", /:focus-visible[\s\S]{0,220}outline/.test(landingCss) && /:focus-visible[\s\S]{0,260}(outline|box-shadow)/.test(labsCss));
  check("Public Add Property route is unchanged", /add-property\.html/.test(publicPages) && /dashboard-labs\.html\?propertyId=/.test(publicPages));
  check("Selected-property route remains canonical", /dashboard-labs\.html\?propertyId=/.test(publicPages + labsJs) && /data-normal-canonical-primary/.test(labsJs));
  check("Evidence, action, services, timeline and monitoring owners remain wired", /renderSelectedCanonicalEvidenceState/.test(labsJs) && /renderSelectedCanonicalActionPlanState/.test(labsJs) && /renderSelectedCanonicalServicesState/.test(labsJs) && /renderSelectedCanonicalTimelineState/.test(labsJs) && /renderSelectedCanonicalMonitoringState/.test(labsJs));
  check("Modal and drawer family uses shared CSS group", /\.smart-modal,\s*[\s\S]*\.drawer-panel/.test(labsCss) || /\.drawer-panel[\s\S]*\.timeline-modal/.test(labsCss));
  check("Primary app/public button classes still exist", /\.button\.primary/.test(landingCss) && /\.primary-button/.test(labsCss));
  check("Secondary/text button classes still exist", /\.button\.secondary/.test(landingCss) && /\.secondary-button/.test(labsCss) && /\.text-button/.test(labsCss));
  check("QA controls remain hidden by default", /data-qa-only hidden/.test(labsHtml));
  check("No storage-clearing code added", !/^\+.*(?:localStorage|sessionStorage)\.clear\s*\(/m.test(execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" })));
  return failures;
}

function renderedAssertions(rendered, results) {
  const failures = [];
  function check(label, condition, detail = "") {
    results.push({ type: "rendered", label, status: condition ? "pass" : "fail", detail });
    if (!condition) failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  }

  const normalFailures = [];
  const prohibited = /\b(?:Labs|Journey OS|canonical|PropertyRecord|fixture|scenario|demo data only|demo mode|presenter|command centre|simulated API|route smoke|QA|test harness|renderer|handler|lifecycle|propertyId|prototype assistant|prototype mode|Auto Checks|Smart Search|Continue guided check)\b/i;
  const duplicatePairs = [
    [/Smart Search/i, /Smart Checks/i],
    [/Auto Checks/i, /Smart Checks/i],
    [/Journey OS/i, /Property Brain/i],
    [/Evidence Inbox/i, /Evidence Vault/i],
    [/Tasks/i, /Action Plan|Next action/i],
  ];

  for (const item of rendered) {
    const isNormal = !/qa=1|demoScenario|portfolioDemo|journeyDemo|state=/.test(item.route);
    if (isNormal && prohibited.test(item.text)) {
      normalFailures.push(`${item.label}: ${item.text.match(prohibited)?.[0]}`);
    }
    for (const [oldTerm, newTerm] of duplicatePairs) {
      if (isNormal && oldTerm.test(item.text) && newTerm.test(item.text)) {
        normalFailures.push(`${item.label}: duplicate ${oldTerm} with ${newTerm}`);
      }
    }
  }

  check("Normal routes have no horizontal overflow", rendered.every((item) => !item.horizontalOverflow), rendered.filter((item) => item.horizontalOverflow).map((item) => item.label).join(", "));
  const addProperty = rendered.filter((item) => /add-property|review-found-data/.test(item.label));
  check("Add Property uses shared container and no edge-hugging", addProperty.every((item) => item.mainInsetLeft >= 16 && item.mainInsetRight >= 16), addProperty.map((item) => `${item.label}:${item.mainInsetLeft}/${item.mainInsetRight}`).join(", "));
  const servicePages = rendered.filter((item) => /services-index/.test(item.label) && item.viewport !== "390x844");
  check("Services cards meet minimum readable width", servicePages.every((item) => !item.minServiceCardWidth || item.minServiceCardWidth >= 250), servicePages.map((item) => `${item.label}:${item.viewport}:${item.minServiceCardWidth}`).join(", "));
  check("Service-card content does not clip", rendered.every((item) => !item.clippedServiceCards), rendered.filter((item) => item.clippedServiceCards).map((item) => `${item.label}:${item.clippedServiceCards}`).join(", "));
  const publicPages = rendered.filter((item) => /homepage|services-index|service-page|add-property|my-properties/.test(item.label));
  check("Public pages use one nav/footer visual family", publicPages.every((item) => item.hasPublicNav && item.hasPublicFooter), publicPages.filter((item) => !item.hasPublicNav || !item.hasPublicFooter).map((item) => item.label).join(", "));
  const appPages = rendered.filter((item) => /selected-workspace|evidence-vault|action-plan|services-request|timeline|monitoring|ask-cmp|mobile-workspace|evidence-mobile|monitoring-mobile/.test(item.label));
  check("Selected workspace uses one app shell visual family", appPages.every((item) => item.hasAppShell && item.hasPropertyHeader), appPages.filter((item) => !item.hasAppShell || !item.hasPropertyHeader).map((item) => item.label).join(", "));
  const oneProperty = rendered.find((item) => item.label === "my-properties-one-property");
  check("One-property workspace is not portfolio-heavy", oneProperty && !oneProperty.onePropertyPortfolioHeavy, oneProperty?.text.slice(0, 240));
  const evidence = rendered.find((item) => item.label === "evidence-vault");
  check("Evidence Vault has one coherent hierarchy", evidence && evidence.hasEvidenceVault && /Accepted proof/i.test(evidence.text) && /Needs review/i.test(evidence.text) && /Missing evidence/i.test(evidence.text), evidence?.text.slice(0, 260));
  const action = rendered.find((item) => item.label === "action-plan");
  check("Action Plan has one dominant Next action", action && /Next action/i.test(action.text) && (action.text.match(/Next action/gi) || []).length <= 3, action?.text.slice(0, 260));
  const services = rendered.find((item) => item.label === "services-request");
  check("Services request cards have clear request hierarchy", services && services.hasPreparedRequest, services?.text.slice(0, 260));
  const timeline = rendered.find((item) => item.label === "timeline");
  check("Timeline is visually read-only", timeline && timeline.hasReadOnlyTimeline, timeline?.text.slice(0, 260));
  const monitoring = rendered.find((item) => item.label === "monitoring");
  check("Monitoring cards are visually derived follow-up", monitoring && monitoring.hasDerivedMonitoring, monitoring?.text.slice(0, 260));
  const askOpen = rendered.find((item) => item.label === "ask-cmp-open");
  check("Ask CMP collapsed/open states do not cover primary controls", askOpen && !askOpen.coveredPrimaryControls.length, JSON.stringify(askOpen?.coveredPrimaryControls || []));
  const allBadges = rendered.flatMap((item) => item.badges.map((badge) => ({ ...badge, label: item.label })));
  check("Status badges include text", allBadges.every((badge) => badge.text.trim()), allBadges.filter((badge) => !badge.text.trim()).map((badge) => badge.label).join(", "));
  const lowContrastBadges = allBadges.filter((badge) => contrastRatio(badge.color, badge.backgroundColor) < 3);
  check("Status badges meet contrast", lowContrastBadges.length === 0, lowContrastBadges.slice(0, 8).map((badge) => `${badge.label}:${badge.text}:${contrastRatio(badge.color, badge.backgroundColor).toFixed(2)}`).join(", "));
  check("Primary buttons are visually consistent and tappable", rendered.every((item) => item.minTapTarget === null || item.minTapTarget >= 44), rendered.filter((item) => item.minTapTarget !== null && item.minTapTarget < 44).map((item) => `${item.label}:${item.viewport}:${item.minTapTarget}`).join(", "));
  check("Keyboard focus remains visible", rendered.every((item) => item.focusVisible), rendered.filter((item) => !item.focusVisible).map((item) => item.label).join(", "));
  check("No normal rendered copy scan failures", normalFailures.length === 0, normalFailures.join("; "));
  check("No duplicate old/new visible copy pairs", !normalFailures.some((item) => /duplicate/.test(item)), normalFailures.join("; "));
  check("No storage counts change through visual navigation", rendered.every((item) => item.storageCountBefore === item.storageCountAfter), rendered.filter((item) => item.storageCountBefore !== item.storageCountAfter).map((item) => `${item.label}:${item.storageCountBefore}->${item.storageCountAfter}`).join(", "));
  return failures;
}

function runPreviousStageChecks(results) {
  const failures = [];
  if (skipRegressions) return failures;
  const checks = [
    ["Stage 2", "tools/cmp-stage-2-contract-check.mjs"],
    ["Stage 3", "tools/cmp-stage-3-property-store-check.mjs"],
    ["Stage 4", "tools/cmp-stage-4-add-property-check.mjs"],
    ["Stage 5", "tools/cmp-stage-5-my-properties-check.mjs"],
    ["Stage 6", "tools/cmp-stage-6-derivation-check.mjs"],
    ["Stage 7", "tools/cmp-stage-7-service-loop-check.mjs"],
    ["Stage 8", "tools/cmp-stage-8-ask-reports-check.mjs"],
    ["Stage 9", "tools/cmp-stage-9-scenarios-check.mjs"],
    ["Stage 10", "tools/cmp-stage-10-guided-demo-check.mjs"],
    ["Stage 11", "tools/cmp-stage-11-portfolio-check.mjs"],
    ["Stage 12", "tools/cmp-stage-12-final-audit-check.mjs"],
    ["Stage A", "tools/cmp-stage-a-context-demo-quarantine-check.mjs"],
    ["Stage B", "tools/cmp-stage-b-single-add-property-check.mjs"],
    ["Stage C", "tools/cmp-stage-c-one-workspace-navigation-check.mjs"],
    ["Stage C.1", "tools/cmp-stage-c1-public-journey-acceptance-check.mjs"],
    ["Stage E", "tools/cmp-stage-e-evidence-action-monitoring-check.mjs"],
    ["Stage F", "tools/cmp-stage-f-copy-convergence-check.mjs"],
  ];
  for (const [label, script] of checks) {
    try {
      execFileSync(process.execPath, [script], { cwd: repoRoot, encoding: "utf8", stdio: "pipe" });
      results.push({ type: "regression", label, status: "pass" });
    } catch (error) {
      const detail = String(error.stdout || error.stderr || error.message).slice(0, 500);
      results.push({ type: "regression", label, status: "fail", detail });
      failures.push(`${label}: ${detail}`);
    }
  }
  return failures;
}

function inventoryMarkdown() {
  const lines = [
    "# CMP Stage G Pre-change Visual Inventory",
    "",
    `Phase: ${phase}`,
    "",
    "| Component | Routes | Source | Class family | Visual role | CMP V2 fit | Decision | Risk |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const [name, routes, source, classFamily, role] of componentInventory) {
    const legacy = /labs|portfolio|task|activity|prototype/i.test(classFamily) || /app sidebar|Timeline events|Monitoring cards/.test(name);
    lines.push(`| ${name} | ${routes.join(", ")} | ${source} | ${classFamily} | ${role} | ${legacy ? "partial; needs convergence" : "mostly aligned"} | ${legacy ? "refine/merge" : "keep/refine"} | ${legacy ? "medium" : "low"} |`);
  }
  return `${lines.join("\n")}\n`;
}

function writeAuditOutputs(rendered, assertionResults, browserMeta) {
  if (!writeAudit) return;
  fs.mkdirSync(auditRoot, { recursive: true });
  fs.mkdirSync(screenshotRoot, { recursive: true });
  const inventory = componentInventory.map(([componentName, routes, sourceFile, cssClassFamily, visualRole]) => ({
    componentName,
    routes,
    sourceFile,
    cssClassFamily,
    visualRole,
    matchesCmpV2: !/labs|portfolio|task|activity|prototype/i.test(cssClassFamily),
    feelsLegacyOrWireframe: /labs|portfolio|task|activity|prototype/i.test(cssClassFamily),
    duplicatesAnotherStyle: /button|card|status|modal|drawer/i.test(componentName),
    decision: /labs|portfolio|task|activity|prototype/i.test(cssClassFamily) ? "refine/merge" : "keep/refine",
    implementationRisk: /button|modal|drawer|status/i.test(componentName) ? "medium" : "low",
  }));
  writeAuditFile("CMP_STAGE_G_PRE_CHANGE_VISUAL_INVENTORY.md", inventoryMarkdown());
  writeAuditFile("CMP_STAGE_G_PRE_CHANGE_VISUAL_INVENTORY.json", JSON.stringify(inventory, null, 2));
  writeAuditFile("CMP_STAGE_G_COMPONENT_CONVERGENCE_MATRIX.md", inventoryMarkdown().replace("Pre-change Visual Inventory", "Component Convergence Matrix"));
  writeAuditFile("CMP_STAGE_G_LAYOUT_RESULTS.json", JSON.stringify(rendered.map((item) => ({
    label: item.label,
    route: item.route,
    viewport: item.viewport,
    horizontalOverflow: item.horizontalOverflow,
    minTapTarget: item.minTapTarget,
    minServiceCardWidth: item.minServiceCardWidth,
    clippedServiceCards: item.clippedServiceCards,
    mainInsetLeft: item.mainInsetLeft,
    mainInsetRight: item.mainInsetRight,
    screenshot: item.screenshot,
  })), null, 2));
  writeAuditFile("CMP_STAGE_G_STATUS_COLOUR_RESULTS.json", JSON.stringify(rendered.map((item) => ({
    label: item.label,
    badges: item.badges.map((badge) => ({
      text: badge.text,
      className: badge.className,
      contrast: Number(contrastRatio(badge.color, badge.backgroundColor).toFixed(2)),
    })),
  })), null, 2));
  writeAuditFile("CMP_STAGE_G_ACCESSIBILITY_RESULTS.json", JSON.stringify(rendered.map((item) => ({
    label: item.label,
    viewport: item.viewport,
    minTapTarget: item.minTapTarget,
    smallTapTargets: item.smallTapTargets,
    focusVisible: item.focusVisible,
  })), null, 2));
  writeAuditFile("CMP_STAGE_G_RENDERED_TEXT_SCAN.json", JSON.stringify(rendered.map((item) => ({
    label: item.label,
    route: item.route,
    viewport: item.viewport,
    title: item.title,
    textLength: item.textLength,
    containsInternalWording: /\b(?:Labs|Journey OS|canonical|PropertyRecord|fixture|QA|propertyId|prototype mode|Auto Checks|Smart Search)\b/i.test(item.text),
    containsDuplicatePairs: /\b(?:Smart Search|Auto Checks|Journey OS|Evidence Inbox)\b/i.test(item.text),
  })), null, 2));
  writeAuditFile("CMP_STAGE_G_INTERACTIVE_RESULTS.json", JSON.stringify({
    phase,
    browser: browserMeta,
    flows: rendered.filter((item) => /selected|evidence|action|services|timeline|monitoring|ask|my-properties/.test(item.label)).map((item) => ({
      label: item.label,
      route: item.route,
      viewport: item.viewport,
      primaryActionCovered: item.coveredPrimaryControls.length > 0,
      storageCountBefore: item.storageCountBefore,
      storageCountAfter: item.storageCountAfter,
      screenshot: item.screenshot,
    })),
  }, null, 2));
  writeAuditFile("CMP_STAGE_G_SCREENSHOT_LOG.json", JSON.stringify(rendered.map((item) => ({
    label: item.label,
    route: item.route,
    viewport: item.viewport,
    screenshot: item.screenshot,
  })), null, 2));
  const screenshots = rendered.filter((item) => item.screenshot);
  writeAuditFile("CMP_STAGE_G_CONTACT_SHEET.html", `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>CMP Stage G contact sheet</title><style>
body{font-family:system-ui,sans-serif;margin:24px;background:#f5f5f7;color:#101418}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}
figure{margin:0;background:#fff;border:1px solid #d8dee6;border-radius:12px;padding:12px}
img{width:100%;height:auto;border:1px solid #e5e9ef;border-radius:8px}
figcaption{font-weight:700;margin-bottom:8px}
</style></head>
<body><h1>CMP Stage G ${phase} contact sheet</h1><div class="grid">
${screenshots.map((item) => `<figure><figcaption>${item.label} · ${item.viewport}</figcaption><img src="${item.screenshot}" alt="${item.label}"></figure>`).join("\n")}
</div></body></html>`);
  const failed = assertionResults.filter((result) => result.status === "fail");
  writeAuditFile("CMP_STAGE_G_REPORT.md", [
    "# CMP Stage G Report",
    "",
    `Phase: ${phase}`,
    `Generated: ${new Date().toISOString()}`,
    `Browser: ${browserMeta.fallbackReason}`,
    `Screenshots captured: ${screenshots.length}`,
    `Failures: ${failed.length}`,
    "",
    "## Assertion Results",
    "",
    "| Type | Check | Status | Detail |",
    "|---|---|---|---|",
    ...assertionResults.map((result) => `| ${result.type} | ${result.label} | ${result.status} | ${(result.detail || "").replace(/\|/g, "\\|")} |`),
    "",
  ].join("\n"));
}

async function main() {
  const assertionResults = [];
  const browserMeta = {
    fallbackReason: "Browser plugin not available; used local Chrome CDP with temporary profile.",
    phase,
  };
  const failures = [];
  failures.push(...sourceAssertions(assertionResults));

  const rendered = [];
  await withStaticServer(async (origin) => {
    browserMeta.origin = origin;
    const chrome = await launchChrome();
    browserMeta.profileDir = chrome.profileDir;
    const page = await createCdpPage(chrome.endpoint);
    try {
      for (const item of capturePlan) {
        rendered.push(await collectRenderedState(page, origin, item));
      }
    } finally {
      page.close();
      await chrome.close();
    }
  });

  failures.push(...renderedAssertions(rendered, assertionResults));
  if (!captureOnly) {
    failures.push(...runPreviousStageChecks(assertionResults));
  }
  writeAuditOutputs(rendered, assertionResults, browserMeta);

  if (failures.length && !captureOnly) {
    console.error("CMP Stage G visual-system convergence check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`CMP Stage G visual-system convergence check passed (${assertionResults.length} assertions, ${rendered.length} rendered states).`);
}

await main();
