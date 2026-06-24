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

const tests = [];
const auditMode = process.argv.includes("--write-audit");
const auditRoot = path.join(repoRoot, "audit/2026-06-24-cmp-stage-a-context-demo-quarantine");
const screenshotDir = path.join(auditRoot, "screenshots");

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  const calls = [];
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key) {
      calls.push(["getItem", key]);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      calls.push(["setItem", key]);
      store.set(key, String(value));
    },
    removeItem(key) {
      calls.push(["removeItem", key]);
      store.delete(key);
    },
    clear() {
      calls.push(["clear", "*"]);
      store.clear();
    },
    dump() {
      return Object.fromEntries(store.entries());
    },
    calls,
  };
}

function selection(overrides = {}) {
  return {
    id: "stage-a-address-1",
    uprn: "STAGE-A-UPRN-1",
    address: "22 Canon Walk, York, YO1 7AA",
    postcode: "YO1 7AA",
    city: "York",
    type: "Terraced house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      currentScore: 70,
      potential: "B",
      potentialScore: 82,
      issue: "2024-04-10",
      expiry: "2034-04-10",
      certificate: "STAGE-A-EPC",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function createCanonicalProperty(storage, overrides, uuid) {
  const created = bridge.createOrUpdatePropertyFromSelection(selection(overrides), {
    storage,
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "unsure",
      sourceRoute: "add-property.html",
      answeredQuestions: {},
    },
    now: "2026-06-24T09:00:00.000Z",
    randomUUID: () => uuid,
  });
  assert.equal(created.ok, true, JSON.stringify(created.errors || []));
  return created.value.property;
}

function functionSlice(source, functionName, length = 7000) {
  const index = source.indexOf(`function ${functionName}`);
  assert.ok(index >= 0, `${functionName} not found`);
  const nextFunctionIndex = source.indexOf("\nfunction ", index + 1);
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
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

function buildBrowserStore() {
  const storage = fakeStorage();
  const propertyA = createCanonicalProperty(storage, {
    id: "stage-a-browser-address-a",
    uprn: "STAGE-A-BROWSER-UPRN-A",
    address: "22 Canon Walk, York, YO1 7AA",
    postcode: "YO1 7AA",
    city: "York",
  }, "stage-a-browser-a");
  const propertyB = createCanonicalProperty(storage, {
    id: "stage-a-browser-address-b",
    uprn: "STAGE-A-BROWSER-UPRN-B",
    address: "41 Ledger Street, Bath, BA1 2ZZ",
    postcode: "BA1 2ZZ",
    city: "Bath",
  }, "stage-a-browser-b");
  const storageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
  const store = JSON.parse(storage.getItem(storageKey));
  return {
    storageKey,
    store,
    propertyA,
    propertyB,
    propertyIds: [propertyA.id, propertyB.id],
  };
}

async function launchChrome() {
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chromePath)) {
    throw new Error("Google Chrome was not found at the expected macOS path.");
  }
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-stage-a-chrome-"));
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

function parsePortFromEndpoint(endpoint) {
  const { port } = new URL(endpoint);
  return port;
}

async function createCdpPage(browserEndpoint) {
  const port = parsePortFromEndpoint(browserEndpoint);
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
    if (!message.id) {
      events.push(message);
    }
  });

  async function send(method, params = {}) {
    const id = ++nextId;
    const promise = new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
    ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async function waitForLoad(timeoutMs = 8000) {
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
      await sleep(400);
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
      const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
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

function pageErrorSummary(events) {
  return events
    .filter((event) => event.method === "Runtime.exceptionThrown"
      || (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params?.entry?.level)))
    .map((event) => event.method === "Runtime.exceptionThrown"
      ? { type: "exception", text: event.params?.exceptionDetails?.text || "Runtime exception" }
      : { type: event.params?.entry?.level || "log", text: event.params?.entry?.text || "" });
}

async function writeStageAAuditArtifacts() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const browserStore = buildBrowserStore();
  const routePolicy = {
    generatedAt: new Date().toISOString(),
    normalRoutes: [
      "index.html",
      "add-property.html",
      "my-properties.html",
      "dashboard-labs.html?propertyId=<validCanonicalPropertyId>",
    ],
    quarantinedWithoutQa: {
      "dashboard-labs.html?demo=nick": "index.html",
      "dashboard-labs.html?journeyDemo=nick": "index.html",
      "dashboard-labs.html?demoScenario=<id>": "index.html",
      "dashboard-labs.html?portfolioDemo=1": "my-properties.html",
      "dashboard-labs.html?state=new-property": "add-property.html",
      "dashboard-labs.html?state=<other>": "my-properties.html",
    },
    qaRoutesRemainOperational: [
      "dashboard-labs.html?demo=nick&qa=1",
      "dashboard-labs.html?journeyDemo=nick&qa=1",
      "dashboard-labs.html?demoScenario=no-epc-found&qa=1",
      "dashboard-labs.html?portfolioDemo=1&qa=1",
      "dashboard-labs.html?state=new-property&qa=1",
    ],
    missingPropertyId: "my-properties.html safe handoff",
    invalidPropertyId: "safe selected-property handoff shell with My Properties CTA",
  };

  const propertyResults = {
    generatedAt: new Date().toISOString(),
    canonicalRecords: browserStore.propertyIds.map((propertyId) => ({
      propertyId,
      address: browserStore.store.propertiesById[propertyId]?.identity?.displayAddress,
      postcode: browserStore.store.propertiesById[propertyId]?.identity?.postcode,
    })),
    checks: [],
  };

  const storageSnapshot = {
    generatedAt: new Date().toISOString(),
    storageKey: browserStore.storageKey,
    before: {
      canonicalRecordCount: browserStore.store.propertyOrder.length,
      canonicalRecordIds: browserStore.store.propertyOrder,
    },
    after: null,
    cleared: false,
    demoNamespaceReadsOnNormalRoutes: false,
  };

  const screenshotLog = [];
  const interactiveResults = [];
  const chrome = await launchChrome();
  let browserAvailable = true;
  let originForReport = "";

  try {
    await withStaticServer(async (origin) => {
      originForReport = origin;
      const page = await createCdpPage(chrome.endpoint);
      await page.setViewport(1440, 1000);
      await page.navigate(`${origin}/index.html`);
      await page.evaluate(`localStorage.setItem(${JSON.stringify(browserStore.storageKey)}, ${JSON.stringify(JSON.stringify(browserStore.store))}); sessionStorage.setItem("cmp_stage_a_marker", "preserve");`);
      const beforeStorage = await page.evaluate(`JSON.stringify({ localKeys: Object.keys(localStorage).sort(), sessionKeys: Object.keys(sessionStorage).sort(), canonical: JSON.parse(localStorage.getItem(${JSON.stringify(browserStore.storageKey)})) })`);
      storageSnapshot.browserBefore = JSON.parse(beforeStorage);

      async function capture(label, route, options = {}) {
        await page.setViewport(options.mobile ? 390 : 1440, options.mobile ? 844 : 1000);
        await page.navigate(`${origin}/${route}`);
        if (options.click) {
          await page.evaluate(`document.querySelector(${JSON.stringify(options.click)})?.click()`);
          await sleep(500);
        }
        const state = await page.evaluate(`JSON.stringify({
          href: location.href,
          title: document.title,
          bodyText: document.body ? document.body.innerText : "",
          demoControls: [...document.querySelectorAll("[data-demo-state-open], [data-demo-guide-open], [data-scenario-button]")]
            .filter((node) => Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length)).length,
          addPropertyHref: document.querySelector('[data-global-nav="Add property"]')?.href || "",
          storageKeys: Object.keys(localStorage).sort(),
          canonicalCount: (() => { try { return JSON.parse(localStorage.getItem(${JSON.stringify(browserStore.storageKey)}))?.propertyOrder?.length || 0; } catch (_error) { return -1; } })(),
          marker: sessionStorage.getItem("cmp_stage_a_marker")
        })`);
        const parsed = JSON.parse(state);
        const fileName = `${String(screenshotLog.length + 1).padStart(2, "0")}-${label}.png`;
        const screenshotPath = path.join(screenshotDir, fileName);
        await page.screenshot(screenshotPath);
        const errors = pageErrorSummary(page.events);
        screenshotLog.push({
          label,
          route,
          finalUrl: parsed.href,
          screenshot: path.relative(auditRoot, screenshotPath),
          title: parsed.title,
          pageErrors: errors,
        });
        interactiveResults.push({
          label,
          route,
          finalUrl: parsed.href,
          title: parsed.title,
          containsPropertyA: parsed.bodyText.includes("22 Canon Walk"),
          containsPropertyB: parsed.bodyText.includes("41 Ledger Street"),
          contains57TheButts: /57 The Butts/i.test(parsed.bodyText),
          demoControlsVisible: parsed.demoControls,
          addPropertyHref: parsed.addPropertyHref,
          canonicalCount: parsed.canonicalCount,
          markerPreserved: parsed.marker === "preserve",
          pageErrors: errors,
        });
        return parsed;
      }

      await capture("homepage-no-demo-cta", "index.html");
      await capture("my-properties", "my-properties.html");
      const propA = await capture("selected-canonical-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`);
      const propB = await capture("selected-canonical-property-b", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyB.id)}`);
      await capture("evidence-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { click: '[data-global-nav="Evidence Vault"]' });
      await capture("ask-cmp-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { click: '[data-global-nav="Ask CMP"]' });
      await capture("services-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { click: '[data-global-nav="Request service"]' });
      await capture("timeline-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { click: '[data-tab="timeline"]' });
      await capture("monitoring-property-a", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`);
      const invalid = await capture("invalid-property-safe-handoff", "dashboard-labs.html?propertyId=prop_missing");
      const missing = await capture("missing-property-safe-handoff", "dashboard-labs.html");
      const addRedirect = await capture("normal-add-property-redirect", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { click: '[data-global-nav="Add property"]' });
      const rejectedDemo = await capture("rejected-demo-nick", "dashboard-labs.html?demo=nick");
      const rejectedState = await capture("rejected-state-new-property", "dashboard-labs.html?state=new-property");
      await capture("internal-demo-nick-qa", "dashboard-labs.html?demo=nick&qa=1");
      await capture("internal-no-epc-scenario-qa", "dashboard-labs.html?demoScenario=no-epc-found&qa=1");
      await capture("internal-portfolio-demo-qa", "dashboard-labs.html?portfolioDemo=1&qa=1");
      await capture("internal-state-new-property-qa", "dashboard-labs.html?state=new-property&qa=1");
      await capture("normal-workspace-desktop", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`);
      await capture("normal-workspace-mobile", `dashboard-labs.html?propertyId=${encodeURIComponent(browserStore.propertyA.id)}`, { mobile: true });

      propertyResults.checks.push(
        {
          name: "property A renders only its own context",
          pass: propA.bodyText.includes("22 Canon Walk") && !propA.bodyText.includes("41 Ledger Street") && !/57 The Butts/i.test(propA.bodyText),
        },
        {
          name: "property B renders only its own context",
          pass: propB.bodyText.includes("41 Ledger Street") && !propB.bodyText.includes("22 Canon Walk") && !/57 The Butts/i.test(propB.bodyText),
        },
        {
          name: "invalid propertyId safe handoff shell",
          pass: invalid.bodyText.includes("Open My Properties") && !/57 The Butts/i.test(invalid.bodyText),
        },
        {
          name: "missing propertyId redirects to My Properties",
          pass: /my-properties\.html/.test(missing.href),
        },
        {
          name: "normal Add Property control redirects to public Add Property",
          pass: /add-property\.html/.test(addRedirect.href),
        },
        {
          name: "demo=nick without QA is quarantined",
          pass: /index\.html/.test(rejectedDemo.href),
        },
        {
          name: "state=new-property without QA is quarantined to Add Property",
          pass: /add-property\.html/.test(rejectedState.href),
        },
      );

      const afterStorage = await page.evaluate(`JSON.stringify({ localKeys: Object.keys(localStorage).sort(), sessionKeys: Object.keys(sessionStorage).sort(), canonical: JSON.parse(localStorage.getItem(${JSON.stringify(browserStore.storageKey)})) })`);
      storageSnapshot.browserAfter = JSON.parse(afterStorage);
      storageSnapshot.after = {
        canonicalRecordCount: storageSnapshot.browserAfter.canonical.propertyOrder.length,
        canonicalRecordIds: storageSnapshot.browserAfter.canonical.propertyOrder,
      };
      storageSnapshot.recordCountUnchanged = storageSnapshot.before.canonicalRecordCount === storageSnapshot.after.canonicalRecordCount;
      storageSnapshot.noStorageCleared = storageSnapshot.browserAfter.localKeys.includes(browserStore.storageKey)
        && storageSnapshot.browserAfter.sessionKeys.includes("cmp_stage_a_marker");
      page.close();
    });
  } catch (error) {
    browserAvailable = false;
    screenshotLog.push({
      label: "browser-capture-unavailable",
      route: originForReport || "not-started",
      finalUrl: "",
      screenshot: "",
      title: "",
      pageErrors: [{ type: "capture", text: error.message }],
    });
    storageSnapshot.browserCaptureError = error.message;
  } finally {
    await chrome.close();
  }

  const contactRows = screenshotLog.map((entry) => `
    <article>
      <h2>${escapeHtml(entry.label)}</h2>
      <p><strong>Route:</strong> ${escapeHtml(entry.route)}</p>
      <p><strong>Final URL:</strong> ${escapeHtml(entry.finalUrl)}</p>
      ${entry.screenshot ? `<img src="${escapeHtml(entry.screenshot)}" alt="${escapeHtml(entry.label)} screenshot">` : "<p>No screenshot captured.</p>"}
      ${entry.pageErrors?.length ? `<pre>${escapeHtml(JSON.stringify(entry.pageErrors, null, 2))}</pre>` : "<p>No page errors captured.</p>"}
    </article>
  `).join("\n");
  const contactSheetPath = path.join(auditRoot, "CMP_STAGE_A_CONTACT_SHEET.html");
  fs.writeFileSync(contactSheetPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CMP Stage A Contact Sheet</title>
  <style>
    body { margin: 24px; font-family: Arial, sans-serif; color: #162033; background: #f6f7f4; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    article { background: #fff; border: 1px solid #dde3dc; border-radius: 8px; padding: 14px; }
    img { width: 100%; border: 1px solid #e1e5df; border-radius: 6px; background: #fff; }
    pre { white-space: pre-wrap; background: #f1f3ef; padding: 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>CMP Stage A Contact Sheet</h1>
  <p>Chrome CDP capture ${browserAvailable ? "completed" : "was unavailable"} using a fresh temporary browser profile.</p>
  <section class="grid">${contactRows}</section>
</body>
</html>
`);

  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_A_ROUTE_POLICY.json"), JSON.stringify(routePolicy, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_A_PROPERTY_CONTEXT_RESULTS.json"), JSON.stringify({
    ...propertyResults,
    interactiveResults,
  }, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_A_STORAGE_SNAPSHOT.json"), JSON.stringify(storageSnapshot, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_A_SCREENSHOT_LOG.json"), JSON.stringify(screenshotLog, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_A_CONTEXT_DEMO_REPORT.md"), `# CMP Stage A Context/Demo Quarantine Report

Generated: ${new Date().toISOString()}

## Verdict

${propertyResults.checks.every((item) => item.pass) && storageSnapshot.recordCountUnchanged ? "PASS" : "REVIEW REQUIRED"}

## Route Policy

- Normal selected property routes require a valid canonical \`propertyId\`.
- Missing \`propertyId\` safely hands off to My Properties.
- Invalid \`propertyId\` shows a safe selected-property handoff shell.
- Demo, scenario, portfolio-demo and raw state routes require \`qa=1\`.
- Normal Add Property controls route to \`add-property.html\`.

## Browser Capture

- Browser capture available: ${browserAvailable ? "yes" : "no"}
- Screenshots recorded: ${screenshotLog.filter((entry) => entry.screenshot).length}
- Contact sheet: \`CMP_STAGE_A_CONTACT_SHEET.html\`

## Storage

- Canonical record count before navigation: ${storageSnapshot.before.canonicalRecordCount}
- Canonical record count after navigation: ${storageSnapshot.after?.canonicalRecordCount ?? "not captured"}
- Record count unchanged: ${storageSnapshot.recordCountUnchanged ? "yes" : "no"}
- Fresh-profile session marker preserved: ${storageSnapshot.noStorageCleared ? "yes" : "no"}

## Property Context

${propertyResults.checks.map((item) => `- ${item.pass ? "PASS" : "FAIL"} ${item.name}`).join("\n")}

## Preservation

- Demo scenario definitions and seeding code remain present.
- No schemas, rules, derivation, service lifecycle, evidence lifecycle, Ask CMP logic or report generation files were changed.
- No storage clear operation was introduced.
`);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

test("valid canonical property shells retain exactly their own context", () => {
  const storage = fakeStorage();
  const propertyA = createCanonicalProperty(storage, {
    id: "stage-a-address-a",
    uprn: "STAGE-A-UPRN-A",
    address: "22 Canon Walk, York, YO1 7AA",
    postcode: "YO1 7AA",
    city: "York",
  }, "stage-a-canon-a");
  const propertyB = createCanonicalProperty(storage, {
    id: "stage-a-address-b",
    uprn: "STAGE-A-UPRN-B",
    address: "41 Ledger Street, Bath, BA1 2ZZ",
    postcode: "BA1 2ZZ",
    city: "Bath",
  }, "stage-a-canon-b");

  const shellA = bridge.workspaceShellFromRecord(propertyA);
  const shellB = bridge.workspaceShellFromRecord(propertyB);
  assert.equal(shellA.propertyId, propertyA.id);
  assert.equal(shellA.address, "22 Canon Walk, York, YO1 7AA");
  assert.equal(shellA.postcode, "YO1 7AA");
  assert.equal(shellB.propertyId, propertyB.id);
  assert.equal(shellB.address, "41 Ledger Street, Bath, BA1 2ZZ");
  assert.equal(shellB.postcode, "BA1 2ZZ");
  assert.doesNotMatch(JSON.stringify(shellA), /41 Ledger Street|57 The Butts|Maple Quay|Northgate Mews|Paper Mill Street|Beacon Yard/i);
  assert.doesNotMatch(JSON.stringify(shellB), /22 Canon Walk|57 The Butts|Maple Quay|Northgate Mews|Paper Mill Street|Beacon Yard/i);
});

test("invalid and missing propertyId states use safe handoff copy", () => {
  const invalid = bridge.invalidWorkspaceShell("invalid", "prop_missing");
  const missing = bridge.invalidWorkspaceShell("missing", "");
  for (const shell of [invalid, missing]) {
    assert.match(shell.ctaHref, /my-properties\.html/);
    assert.doesNotMatch(JSON.stringify(shell), /57 The Butts|Maple Quay|Northgate Mews|Paper Mill Street|Beacon Yard/i);
  }
});

test("dashboard startup gates missing property and internal routes before demo storage", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function quarantineInternalRouteWithoutQa/);
  assert.match(code, /function shouldUseMissingPropertySafeHandoff/);
  assert.match(code, /function runStageARouteGate/);
  const startupIndex = code.indexOf("runStageARouteGate()");
  const canonicalHydrationIndex = code.indexOf("hydrateSelectedCanonicalProperty();");
  const guidedEntryIndex = code.indexOf("enterGuidedDemo();", startupIndex);
  assert.ok(startupIndex > -1, "Stage A route gate must run during startup");
  assert.ok(startupIndex < canonicalHydrationIndex, "route gate must run before selected property hydration");
  assert.ok(guidedEntryIndex === -1 || startupIndex < guidedEntryIndex, "route gate must run before guided demo entry can read demo storage");
  const gateSlice = functionSlice(code, "quarantineInternalRouteWithoutQa", 5000);
  const nickDemoSlice = functionSlice(code, "hasNickDemoRequest", 1200);
  assert.match(nickDemoSlice, /params\.get\("demo"\)\s*===\s*"nick"/);
  assert.match(nickDemoSlice, /params\.get\("journeyDemo"\)\s*===\s*"nick"/);
  assert.match(gateSlice, /hasNickDemoRequest/);
  assert.match(gateSlice, /demoScenario/);
  assert.match(gateSlice, /portfolioDemo/);
  assert.match(gateSlice, /params\.get\("state"\)\s*===\s*"new-property"/);
  assert.match(gateSlice, /add-property\.html/);
  assert.match(gateSlice, /my-properties\.html/);
  assert.match(gateSlice, /index\.html/);
});

test("normal route policy does not read demo namespace before qa gate", () => {
  const code = read("dashboard-labs.js");
  const gateIndex = code.indexOf("runStageARouteGate()");
  assert.ok(gateIndex > -1);
  const startup = code.slice(gateIndex, code.indexOf("window.__cmpDemoTest", gateIndex));
  assert.doesNotMatch(startup, /readCanonicalStore\(localStorage,\s*definitions\.DEMO_SCENARIO_NAMESPACE\)/);
});

test("demo, journey, scenario, portfolio demo and raw state routes require qa=1", () => {
  const code = read("dashboard-labs.js");
  const routeGate = `${functionSlice(code, "hasNickDemoRequest", 1200)}\n${functionSlice(code, "hasInternalRouteRequest", 1600)}\n${functionSlice(code, "quarantineInternalRouteWithoutQa", 6000)}`;
  for (const token of ["demo", "journeyDemo", "demoScenario", "portfolioDemo", "state"]) {
    assert.match(routeGate, new RegExp(token));
  }
  assert.match(code, /params\.get\("qa"\)\s*===\s*"1"/);
  assert.match(code, /demo=nick&qa=1/);
  assert.match(functionSlice(code, "isCanonicalScenarioRoute", 800), /isQaMode\(\)[\s\S]*demoScenario/);
  assert.match(code, /params\.get\("portfolioDemo"\)\s*===\s*"1"\s*&&\s*params\.get\("qa"\)\s*===\s*"1"/);
});

test("normal selected-property renderer excludes fixture addresses and owns canonical surfaces", () => {
  const code = read("dashboard-labs.js");
  const selectedRenderer = functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 18000);
  assert.doesNotMatch(selectedRenderer, /57 The Butts|Maple Quay|Northgate Mews|Paper Mill Street|Beacon Yard/i);
  for (const hook of [
    "data-canonical-workspace-shell",
    "data-canonical-next-action",
    "data-canonical-monitoring-preview",
  ]) {
    assert.match(selectedRenderer, new RegExp(hook));
  }
  assert.match(selectedRenderer, /renderCanonicalAskReportPanel/);
  const askReportRenderer = functionSlice(code, "renderCanonicalAskReportPanel", 9000);
  for (const hook of [
    "data-canonical-ask-panel",
    "data-canonical-report-panel",
  ]) {
    assert.match(askReportRenderer, new RegExp(hook));
  }
  assert.match(code, /data-canonical-service-request/);
});

test("normal dashboard HTML exposes no demo controls or fixture copy by default", () => {
  const html = read("dashboard-labs.html");
  assert.doesNotMatch(html, />\\s*Demo state\\s*</i);
  assert.doesNotMatch(html, />\\s*Demo guide\\s*</i);
  assert.doesNotMatch(html, /Scenario Explorer|Presenter|raw state/i);
  assert.doesNotMatch(html, /18 Willow Brook Drive|57 The Butts/i);
});

test("public pages expose no normal demo CTA and keep QA demo link internal", () => {
  const publicPages = read("public-pages.js");
  assert.doesNotMatch(publicPages, /href="dashboard-labs\.html\?demo=nick"/);
  assert.doesNotMatch(publicPages, />Try guided demo</);
  assert.match(publicPages, /demo=nick&qa=1/);
});

test("normal Add Property controls navigate to public Add Property", () => {
  const code = read("dashboard-labs.js");
  const addPropertySlice = `${functionSlice(code, "normalAddPropertyHref", 3000)}\n${functionSlice(code, "openNormalAddPropertyFlow", 1200)}`;
  assert.match(addPropertySlice, /add-property\.html/);
  assert.match(addPropertySlice, /service|return|from/i);
  assert.doesNotMatch(addPropertySlice, /openTimelineModal|data-add-property-modal/);
});

test("storage is not cleared and canonical record counts are stable for read-only shell prep", () => {
  const storage = fakeStorage();
  const property = createCanonicalProperty(storage, {}, "stage-a-count");
  const key = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
  const before = JSON.parse(storage.getItem(key));
  bridge.workspaceShellFromRecord(property);
  const after = JSON.parse(storage.getItem(key));
  assert.equal(before.propertyOrder.length, after.propertyOrder.length);
  assert.equal(after.propertyOrder.includes(property.id), true);
  const diff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(diff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|\.clear\(|removeItem\()/m);
});

test("scenario modules and definitions remain present", () => {
  const html = read("dashboard-labs.html");
  assert.match(html, /core\/cmp-scenario-definitions\.js/);
  assert.match(html, /core\/cmp-scenario-seeding\.js/);
  assert.match(read("core/cmp-scenario-definitions.js"), /DEMO_SCENARIO_NAMESPACE/);
  assert.match(read("core/cmp-scenario-seeding.js"), /seedScenarioProperty/);
  assert.match(read("core/cmp-guided-demo-session.js"), /createGuidedDemoSession/);
  assert.match(read("core/cmp-guided-demo-steps.js"), /listGuidedDemoSteps/);
});

test("route files still return HTTP 200 for normal and explicit QA entries", async () => {
  await withStaticServer(async (origin) => {
    for (const route of [
      "/index.html",
      "/add-property.html",
      "/my-properties.html",
      "/dashboard-labs.html?propertyId=prop_missing",
      "/dashboard-labs.html?demo=nick&qa=1",
      "/dashboard-labs.html?journeyDemo=nick&qa=1",
      "/dashboard-labs.html?demoScenario=no-epc-found&qa=1",
      "/dashboard-labs.html?portfolioDemo=1&qa=1",
      "/dashboard-labs.html?state=new-property&qa=1",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

test("Stage A file scope leaves schemas, rules, lifecycles and external workspace untouched", () => {
  const allowed = new Set([
    "dashboard-labs.js",
    "dashboard-labs.html",
    "public-pages.js",
    "core/cmp-public-property-bridge.js",
    "dashboard-labs.css",
    "core/cmp-guided-demo-session.js",
    "tools/cmp-stage-5-my-properties-check.mjs",
    "tools/cmp-stage-9-scenarios-check.mjs",
    "tools/cmp-stage-10-guided-demo-check.mjs",
    "tools/cmp-stage-11-portfolio-check.mjs",
    "tools/cmp-stage-12-final-audit-check.mjs",
    "tools/cmp-stage-a-context-demo-quarantine-check.mjs",
  ]);
  const changed = changedFiles().filter((file) => !file.startsWith("audit/"));
  assert.deepEqual(changed.filter((file) => !allowed.has(file)), []);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
  } catch (error) {
    console.error(`Stage A context/demo quarantine check failed: ${name}`);
    throw error;
  }
}

if (auditMode) {
  await writeStageAAuditArtifacts();
}

console.log(`CMP Stage A context/demo quarantine check passed (${passed} assertions).${auditMode ? " Wrote Stage A audit artifacts." : ""}`);
