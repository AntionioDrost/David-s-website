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

const auditMode = process.argv.includes("--write-audit");
const captureOnly = process.argv.includes("--capture-only");
const phaseArg = process.argv.find((arg) => arg.startsWith("--phase="));
const phase = phaseArg ? phaseArg.split("=")[1] : "after";
const auditRoot = path.join(repoRoot, "audit/2026-06-25-cmp-stage-c1-public-journey-acceptance");
const screenshotRoot = path.join(auditRoot, "screenshots");
const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);

const tests = [];
const viewports = [
  { name: "1440x1000", width: 1440, height: 1000 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x900", width: 1024, height: 900 },
  { name: "390x844", width: 390, height: 844 },
];

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function functionSlice(source, functionName, length = 16000) {
  const index = source.indexOf(`function ${functionName}`);
  assert.ok(index >= 0, `${functionName} not found`);
  const rest = source.slice(index + 1);
  const nextFunctionMatch = rest.match(/\n\s*function\s+/);
  const nextFunctionIndex = nextFunctionMatch ? index + 1 + nextFunctionMatch.index : -1;
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
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
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-stage-c1-chrome-"));
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

  async function waitForLoad(timeoutMs = 9000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (events.some((event) => event.method === "Page.loadEventFired")) {
        events.splice(0, events.length);
        await sleep(350);
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

async function waitFor(page, expression, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await page.evaluate(expression);
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

function pageErrorSummary(events) {
  return events
    .filter((event) => event.method === "Runtime.exceptionThrown"
      || (event.method === "Log.entryAdded" && ["error"].includes(event.params?.entry?.level)))
    .map((event) => event.method === "Runtime.exceptionThrown"
      ? { type: "exception", text: event.params?.exceptionDetails?.text || "Runtime exception" }
      : { type: event.params?.entry?.level || "log", text: event.params?.entry?.text || "" })
    .filter((entry) => !/favicon\.ico|unpkg\.com\/lucide/i.test(entry.text));
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
    calls,
  };
}

function selection(overrides = {}) {
  return {
    id: "stage-c1-address-1",
    uprn: "STAGE-C1-UPRN-1",
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
      currentScore: 70,
      potential: "B",
      potentialScore: 82,
      issue: "2024-04-10",
      expiry: "2034-04-10",
      certificate: "STAGE-C1-EPC",
      source: "Example EPC preview",
    },
    ...overrides,
  };
}

function createViaBridge(storage = fakeStorage(), selected = selection(), uuid = "stage-c1-record") {
  const result = bridge.createOrUpdatePropertyFromSelection(selected, {
    storage,
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "unsure",
      sourceRoute: "add-property.html",
      answeredQuestions: {},
    },
    now: "2026-06-25T09:00:00.000Z",
    randomUUID: () => uuid,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value.property;
}

function canonicalStore(storage) {
  const raw = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  assert.ok(raw, "canonical store should be written");
  return JSON.parse(raw);
}

function browserSeedScript(mode = "incomplete") {
  const selected = mode === "complete"
    ? selection({
        id: "stage-c1-complete-address",
        uprn: "STAGE-C1-COMPLETE-UPRN",
        address: "26 Clearview Road, Bath, BA1 4AA",
        postcode: "BA1 4AA",
        city: "Bath",
        type: "Terraced house",
        hasGas: false,
        epc: {
          rating: "B",
          currentScore: 84,
          potential: "B",
          potentialScore: 88,
          issue: "2025-01-10",
          expiry: "2035-01-10",
          certificate: "STAGE-C1-COMPLETE-EPC",
          source: "Example EPC preview",
        },
      })
    : selection();
  return `
    (() => {
      const bridge = window.CMPPublicPropertyBridge;
      const result = bridge.createOrUpdatePropertyFromSelection(${JSON.stringify(selected)}, {
        storage: localStorage,
        journeyContext: {
          entryService: "full_compliance",
          focusMode: "full_compliance",
          isTenanted: "unsure",
          sourceRoute: "add-property.html",
          answeredQuestions: {}
        },
        now: "2026-06-25T09:00:00.000Z",
        randomUUID: () => "${mode === "complete" ? "stage-c1-complete-record" : "stage-c1-incomplete-record"}"
      });
      if (!result.ok) throw new Error(result.errors.join(" "));
      const key = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
      const store = JSON.parse(localStorage.getItem(key));
      const record = store.propertiesById[result.value.property.id];
      if (${JSON.stringify(mode)} === "complete") {
        record.currentSetupStage = "workspace";
        record.lifecycleStatus = "active";
        record.smartCheckResults = record.smartCheckResults.map((check) => ({
          ...check,
          requiresConfirmation: false,
          resultStatus: check.resultStatus === "likely" ? "found" : check.resultStatus,
          missingReason: null,
          unknownReason: null
        }));
        record.landlordAnswers = [
          {
            id: record.id + "_occupancy_answer",
            propertyId: record.id,
            questionId: "current_occupancy",
            answer: "occupied_single_household",
            context: "current",
            source: "user_stated",
            answeredAt: "2026-06-25T09:05:00.000Z",
            dependencyKeys: [],
            evidenceStatus: "verified",
            editedHistory: [],
            sourceReferences: []
          },
          {
            id: record.id + "_heating_answer",
            propertyId: record.id,
            questionId: "heating_source",
            answer: "no_gas",
            context: "current",
            source: "user_stated",
            answeredAt: "2026-06-25T09:06:00.000Z",
            dependencyKeys: [],
            evidenceStatus: "verified",
            editedHistory: [],
            sourceReferences: []
          }
        ];
        record.evidence = [
          {
            id: record.id + "_epc_evidence",
            propertyId: record.id,
            linkedIssueId: null,
            linkedActionId: null,
            linkedServiceRequestId: null,
            evidenceType: "epc_certificate",
            proofStatus: "accepted",
            verificationStatus: "accepted",
            source: "example_available_information",
            capabilityStatus: "simulated",
            issuedDate: "2025-01-10",
            expiryDate: "2035-01-10",
            extractedFields: {},
            userConfirmationState: "confirmed",
            sourceReferences: []
          }
        ];
      }
      localStorage.setItem(key, JSON.stringify(store));
      return result.value.property.id;
    })()
  `;
}

test("source edits stay inside the C.1 allowed implementation scope", () => {
  const allowed = new Set([
    "landing.css",
    "public-pages.js",
    "dashboard-labs.js",
    "dashboard-labs.css",
    "dashboard-labs.html",
    "tools/cmp-stage-c1-public-journey-acceptance-check.mjs",
  ]);
  const unexpected = changedFiles().filter((file) => !allowed.has(file));
  assert.deepEqual(unexpected, []);
});

test("Add Property keeps one canonical renderer, one postcode input and one address-selection renderer", () => {
  const code = read("public-pages.js");
  assert.equal(countMatches(code, /function\s+renderAddPropertyPage\s*\(/g), 1);
  assert.equal(countMatches(code, /id="addPropertyPostcode"/g), 1);
  assert.equal(countMatches(code, /function\s+renderAddressResults\s*\(/g), 1);
  assert.equal(countMatches(code, /data-use-address/g), 2);
});

test("Add Property uses one centred shared container and one local progress presentation", () => {
  const code = read("public-pages.js");
  const css = read("landing.css");
  const renderBlock = functionSlice(code, "renderAddPropertyPage", 16000);

  assert.match(renderBlock, /cmp-public-container add-property-journey-shell/);
  assert.equal(countMatches(renderBlock, /add-property-progress/g), 1);
  assert.match(css, /body\[data-public-page="add-property"\]\s+\.cmp-public-container/);
  assert.match(css, /body\[data-public-page="add-property"\]\s+\.add-property-progress/);
});

test("Review Found Data uses public review groups and no empty or implementation-language groups", () => {
  const code = read("public-pages.js");
  const renderReviewItems = functionSlice(code, "renderReviewItems", 6000);
  const renderCanonicalReview = functionSlice(code, "renderCanonicalReview", 10000);

  assert.match(renderCanonicalReview, /What CMP found/);
  assert.match(renderCanonicalReview, /What still needs your answer/);
  assert.match(renderCanonicalReview, /Example and available property information is shown for review/);
  assert.match(renderCanonicalReview, /filter\(\(group\) => group\.items\.length\)/);
  assert.doesNotMatch(renderReviewItems + renderCanonicalReview, /Nothing in this group yet/i);
  assert.doesNotMatch(renderReviewItems + renderCanonicalReview, /Prepared for review[\s\S]{0,80}Prepared for review/i);
  assert.doesNotMatch(renderReviewItems + renderCanonicalReview, /renderer|public Add Property flow|simulated system/i);
});

test("Review-to-workspace handoff has state-derived labels and clear next-step copy", () => {
  const code = read("public-pages.js");
  const renderCanonicalReview = functionSlice(code, "renderCanonicalReview", 12000);
  const handoffState = functionSlice(code, "reviewHandoffState", 4000);

  assert.match(handoffState, /Continue to property questions/);
  assert.match(handoffState, /Open Property Brain/);
  assert.match(handoffState, /Answer the remaining property questions/);
  assert.match(handoffState, /Open the Property Brain to review/);
  assert.match(renderCanonicalReview + handoffState, /What happens next/);
  assert.match(renderCanonicalReview, /Save and return to My Properties/);
  assert.doesNotMatch(renderCanonicalReview, /Continue to workspace setup|Continue guided check|Check My Property|Start another check/);
});

test("normal workspace guidance uses property-file language while keeping the Stage C handler", () => {
  const code = read("dashboard-labs.js");
  const renderBlock = functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 18000);
  const actionBlock = functionSlice(code, "selectedCanonicalPrimaryAction", 5000);
  const bindBlock = functionSlice(code, "bindPortfolioHome", 1500);

  assert.match(renderBlock, /Your property file is taking shape/);
  assert.match(renderBlock, /Property details[^"]*Property Brain[^"]*Next action/);
  assert.match(renderBlock, /Answer the remaining property questions, then CMP will build the Property Brain and recommend one clear next action/);
  assert.match(actionBlock, /Continue property setup/);
  assert.match(actionBlock, /Review next action/);
  assert.match(bindBlock, /data-normal-canonical-primary[\s\S]{0,240}handleSelectedCanonicalPrimaryAction\(\)/);
  assert.doesNotMatch(renderBlock, /Continue guided check/);
});

test("normal route copy avoids prohibited handoff and prototype labels", () => {
  const publicCode = read("public-pages.js");
  const dashboardCode = read("dashboard-labs.js");
  const publicNormalSlices = [
    functionSlice(publicCode, "renderAddPropertyPage", 18000),
    functionSlice(publicCode, "renderReviewItems", 6000),
    functionSlice(publicCode, "renderCanonicalReview", 12000),
    functionSlice(publicCode, "capabilityStatusCopy", 1200),
  ].join("\n");
  const dashboardNormalSlices = [
    functionSlice(dashboardCode, "renderSelectedCanonicalWorkspaceShell", 18000),
    functionSlice(dashboardCode, "selectedCanonicalPrimaryAction", 5000),
  ].join("\n");

  assert.doesNotMatch(publicNormalSlices, /Prototype\/example information/i);
  assert.doesNotMatch(publicNormalSlices, /Continue to workspace setup|Continue guided check/i);
  assert.doesNotMatch(dashboardNormalSlices, /Continue guided check/i);
});

test("services index grid is configured for readable card widths", () => {
  const css = read("landing.css");

  assert.match(css, /body\[data-public-page="services"\]\s+\.service-directory-v2[\s\S]{0,500}max-width:\s*var\(--cmpv2-page-width\)/);
  assert.match(css, /body\[data-public-page="services"\]\s+\.service-category-grid[\s\S]{0,260}repeat\(auto-fit,\s*minmax\(min\(100%,\s*280px\),\s*1fr\)\)/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]{0,500}body\[data-public-page="services"\]\s+\.service-category-block[\s\S]{0,120}grid-template-columns:\s*1fr/);
});

test("Stage A/B/C protected strings remain intact", () => {
  const publicCode = read("public-pages.js");
  const dashboardCode = read("dashboard-labs.js");
  const bridgeCode = read("core/cmp-public-property-bridge.js");
  const html = read("dashboard.html");
  const azHtml = read("az-checker-v2.html");

  assert.match(html, /my-properties\.html/);
  assert.match(azHtml, /add-property\.html/);
  assert.match(publicCode, /homePostcodeForm[\s\S]{0,500}add-property\.html\?postcode=/);
  assert.match(publicCode, /function renderAddPropertyPage/);
  assert.match(publicCode, /createOrUpdatePropertyFromSelection/);
  assert.match(bridgeCode, /CANONICAL_STORE_KEY_PREFIX = "cmp_canonical_property_store_v1"/);
  assert.match(dashboardCode, /normal-canonical-workspace/);
  assert.match(dashboardCode, /selectedPropertyId/);
  assert.match(dashboardCode, /function assertNormalCanonicalRecordContext/);
});

async function browserLayoutRun({ writeAudit = false, phaseName = "after" } = {}) {
  const screenshotDir = path.join(screenshotRoot, phaseName);
  if (writeAudit) fs.mkdirSync(screenshotDir, { recursive: true });
  const layoutResults = [];
  const copyResults = [];
  const screenshotLog = [];
  const consoleIssues = [];
  const chrome = await launchChrome();
  let originForReport = "";

  try {
    await withStaticServer(async (origin) => {
      originForReport = origin;
      const page = await createCdpPage(chrome.endpoint);
      await page.setViewport(1440, 1000);
      await page.navigate(`${origin}/add-property.html`);
      await page.evaluate(`localStorage.setItem("cmp_stage_c1_marker", "preserve"); sessionStorage.setItem("cmp_stage_c1_session_marker", "preserve");`);
      const initialStorageCounts = await page.evaluate(`JSON.stringify({
        local: localStorage.length,
        session: sessionStorage.length
      })`);

      async function capture(label, route, viewport, options = {}) {
        await page.setViewport(viewport.width, viewport.height);
        await page.navigate(`${origin}/${route}`);
        if (options.seed === "incomplete" || options.seed === "complete") {
          await page.evaluate(browserSeedScript(options.seed));
          const propertyId = await page.evaluate(`localStorage.getItem("cmp_stage_c1_last_property_id") || ""`);
          if (propertyId) {
            await page.navigate(`${origin}/dashboard-labs.html?propertyId=${encodeURIComponent(propertyId)}`);
          }
        }
        if (options.prepare === "addresses") {
          await waitFor(page, `Boolean(document.querySelector("[data-use-address]"))`, 9000);
        }
        if (options.prepare === "review") {
          await waitFor(page, `Boolean(document.querySelector("[data-use-address]"))`, 9000);
          await page.evaluate(`document.querySelector("[data-use-address]")?.click()`);
          await waitFor(page, `Boolean(document.querySelector("[data-canonical-review]"))`, 9000);
        }
        if (options.scrollSelector) {
          await page.evaluate(`document.querySelector(${JSON.stringify(options.scrollSelector)})?.scrollIntoView({ block: "center", inline: "nearest" }); window.getSelection()?.removeAllRanges();`);
          await sleep(250);
        } else {
          await page.evaluate(`window.scrollTo(0, 0); window.getSelection()?.removeAllRanges();`);
          await sleep(120);
        }
        const state = JSON.parse(await page.evaluate(`JSON.stringify({
          href: location.href,
          title: document.title,
          bodyText: document.body ? document.body.innerText : "",
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          container: (() => {
            const el = document.querySelector(".cmp-public-container.add-property-journey-shell");
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { left: r.left, right: document.documentElement.clientWidth - r.right, width: r.width };
          })(),
          serviceCards: [...document.querySelectorAll(".service-category-grid .service-grid-card")].map((card) => {
            const r = card.getBoundingClientRect();
            return {
              width: r.width,
              scrollOverflow: card.scrollWidth > card.clientWidth + 2,
              clippedChildren: [...card.querySelectorAll("h3, p, small, a, span")].filter((node) => node.scrollWidth > node.clientWidth + 2).length
            };
          }),
          addPropertyPostcodes: document.querySelectorAll("#addPropertyPostcode").length,
          addressRenderers: document.querySelectorAll(".address-card-list").length,
          progress: document.querySelectorAll(".add-property-progress").length,
          facts: [...document.querySelectorAll("[data-review-fact-key]")].map((node) => node.getAttribute("data-review-fact-key")),
          emptyUnknowns: /Nothing in this group yet/i.test(document.body?.innerText || ""),
          prototypeCopy: /Prototype\\/example information/i.test(document.body?.innerText || ""),
          oldHandoff: /Continue to workspace setup|Continue guided check/i.test(document.body?.innerText || ""),
          ctas: [...document.querySelectorAll("a, button")].map((node) => node.textContent.trim()).filter(Boolean),
          reviewHandoff: (() => {
            const el = document.querySelector(".review-handoff-card");
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const styles = getComputedStyle(el);
            const footer = document.querySelector(".site-footer");
            const fr = footer?.getBoundingClientRect();
            return {
              paddingTop: parseFloat(styles.paddingTop),
              paddingBottom: parseFloat(styles.paddingBottom),
              marginBottomToFooter: fr ? fr.top - r.bottom : null,
            };
          })(),
          workspacePrimary: document.querySelector("[data-normal-canonical-primary]")?.textContent.trim() || "",
          stageHandlerHook: Boolean(document.querySelector("[data-normal-canonical-primary]")),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
        })`));
        const pageErrors = pageErrorSummary(page.events);
        consoleIssues.push(...pageErrors.map((issue) => ({ label, viewport: viewport.name, ...issue })));
        if (writeAudit) {
          const fileName = `${phaseName}-${viewport.name}-${label}.png`;
          const screenshotPath = path.join(screenshotDir, fileName);
          await page.screenshot(screenshotPath);
          screenshotLog.push({
            phase: phaseName,
            viewport: viewport.name,
            label,
            route,
            finalUrl: state.href,
            title: state.title,
            screenshot: path.relative(auditRoot, screenshotPath),
            pageErrors,
          });
        }
        layoutResults.push({
          phase: phaseName,
          viewport: viewport.name,
          label,
          scrollWidth: state.scrollWidth,
          innerWidth: state.innerWidth,
          horizontalOverflow: state.horizontalOverflow,
          container: state.container,
          minServiceCardWidth: state.serviceCards.length ? Math.min(...state.serviceCards.map((card) => card.width)) : null,
          overflowingServiceCards: state.serviceCards.filter((card) => card.scrollOverflow || card.clippedChildren).length,
          reviewHandoff: state.reviewHandoff,
        });
        copyResults.push({
          phase: phaseName,
          viewport: viewport.name,
          label,
          emptyUnknowns: state.emptyUnknowns,
          prototypeCopy: state.prototypeCopy,
          oldHandoff: state.oldHandoff,
          ctas: state.ctas,
          workspacePrimary: state.workspacePrimary,
        });
        return state;
      }

      async function seedWorkspace(mode) {
        await page.setViewport(1440, 1000);
        await page.navigate(`${origin}/add-property.html`);
        const propertyId = await page.evaluate(browserSeedScript(mode));
        await page.evaluate(`localStorage.setItem("cmp_stage_c1_last_property_id", ${JSON.stringify(propertyId)})`);
        return propertyId;
      }

      const incompleteId = await seedWorkspace("incomplete");
      const completeId = await seedWorkspace("complete");
      const storageAfterSeed = await page.evaluate(`JSON.stringify({
        local: localStorage.length,
        session: sessionStorage.length,
        canonicalCount: (() => {
          const key = ${JSON.stringify(publicStorageKey)};
          return JSON.parse(localStorage.getItem(key))?.propertyOrder?.length || 0;
        })()
      })`);

      for (const viewport of viewports) {
        await capture("add-property-initial", "add-property.html", viewport);
        await capture("progress-area", "add-property.html", viewport, { scrollSelector: ".add-property-progress" });
        await capture("address-results", "add-property.html?postcode=B37%207BA", viewport, { prepare: "addresses", scrollSelector: "[data-add-property-step='address']" });
        await capture("review-found-data", "add-property.html?postcode=B37%207BA", viewport, { prepare: "review", scrollSelector: "[data-canonical-review]" });
        await capture("review-handoff-actions", "add-property.html?postcode=B37%207BA", viewport, { prepare: "review", scrollSelector: ".review-handoff-card" });
        await capture("selected-incomplete-workspace", `dashboard-labs.html?propertyId=${encodeURIComponent(incompleteId)}`, viewport);
        await capture("selected-complete-workspace", `dashboard-labs.html?propertyId=${encodeURIComponent(completeId)}`, viewport);
        await capture("services-certificate-led-group", "services.html", viewport, { scrollSelector: ".service-category-certificate" });
        await capture("services-condition-led-group", "services.html", viewport, { scrollSelector: ".service-category-problem" });
        await capture("services-mobile", "services.html", viewport, { scrollSelector: ".service-category-grid" });
      }

      const storageBeforeRouteOnlyNavigation = JSON.parse(await page.evaluate(`JSON.stringify({
        local: localStorage.length,
        session: sessionStorage.length,
        canonicalCount: (() => {
          const key = ${JSON.stringify(publicStorageKey)};
          return JSON.parse(localStorage.getItem(key))?.propertyOrder?.length || 0;
        })(),
        marker: localStorage.getItem("cmp_stage_c1_marker"),
        sessionMarker: sessionStorage.getItem("cmp_stage_c1_session_marker")
      })`));
      await page.navigate(`${origin}/services.html`);
      await page.navigate(`${origin}/add-property.html`);
      await page.navigate(`${origin}/dashboard-labs.html?propertyId=${encodeURIComponent(incompleteId)}`);
      const storageAfterNavigation = JSON.parse(await page.evaluate(`JSON.stringify({
        local: localStorage.length,
        session: sessionStorage.length,
        canonicalCount: (() => {
          const key = ${JSON.stringify(publicStorageKey)};
          return JSON.parse(localStorage.getItem(key))?.propertyOrder?.length || 0;
        })(),
        marker: localStorage.getItem("cmp_stage_c1_marker"),
        sessionMarker: sessionStorage.getItem("cmp_stage_c1_session_marker")
      })`));
      const storageSeed = JSON.parse(storageAfterSeed);
      layoutResults.push({
        phase: phaseName,
        label: "storage-count-navigation",
        viewport: "all",
        storageCountsStable: storageBeforeRouteOnlyNavigation.local === storageAfterNavigation.local
          && storageBeforeRouteOnlyNavigation.session === storageAfterNavigation.session
          && storageBeforeRouteOnlyNavigation.canonicalCount === storageAfterNavigation.canonicalCount
          && storageAfterNavigation.marker === "preserve"
          && storageAfterNavigation.sessionMarker === "preserve",
        initialStorageCounts: JSON.parse(initialStorageCounts),
        storageAfterSeed: storageSeed,
        storageBeforeRouteOnlyNavigation,
        storageAfterNavigation,
      });

      page.close();
    });
  } finally {
    await chrome.close();
  }

  if (writeAudit) {
    writeAuditFiles({
      phaseName,
      origin: originForReport,
      layoutResults,
      copyResults,
      screenshotLog,
      consoleIssues,
    });
  }

  return {
    layoutResults,
    copyResults,
    screenshotLog,
    consoleIssues,
  };
}

function writeJson(fileName, data) {
  fs.mkdirSync(auditRoot, { recursive: true });
  fs.writeFileSync(path.join(auditRoot, fileName), `${JSON.stringify(data, null, 2)}\n`);
}

function readJsonIfExists(fileName, fallback) {
  const filePath = path.join(auditRoot, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeAuditFiles({ phaseName, origin, layoutResults, copyResults, screenshotLog, consoleIssues }) {
  const allLayout = [...readJsonIfExists("CMP_STAGE_C1_LAYOUT_RESULTS.json", []), ...layoutResults];
  const allCopy = [...readJsonIfExists("CMP_STAGE_C1_COPY_RESULTS.json", []), ...copyResults];
  const allShots = [...readJsonIfExists("CMP_STAGE_C1_SCREENSHOT_LOG.json", []), ...screenshotLog];
  const allConsole = [...readJsonIfExists("CMP_STAGE_C1_CONSOLE_RESULTS.json", []), ...consoleIssues];
  writeJson("CMP_STAGE_C1_LAYOUT_RESULTS.json", allLayout);
  writeJson("CMP_STAGE_C1_COPY_RESULTS.json", allCopy);
  writeJson("CMP_STAGE_C1_SCREENSHOT_LOG.json", allShots);
  writeJson("CMP_STAGE_C1_CONSOLE_RESULTS.json", allConsole);

  const phaseRows = allShots.map((entry) => `
    <article>
      <h2>${escapeHtml(entry.phase)} · ${escapeHtml(entry.viewport)} · ${escapeHtml(entry.label)}</h2>
      <p>${escapeHtml(entry.route)} → ${escapeHtml(entry.finalUrl)}</p>
      <img src="${escapeHtml(entry.screenshot)}" alt="${escapeHtml(entry.phase)} ${escapeHtml(entry.label)} ${escapeHtml(entry.viewport)}">
      ${entry.pageErrors?.length ? `<pre>${escapeHtml(JSON.stringify(entry.pageErrors, null, 2))}</pre>` : ""}
    </article>
  `).join("");
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_C1_CONTACT_SHEET.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMP Stage C.1 Contact Sheet</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #f7f4ed; color: #102033; }
    header { padding: 28px; background: #102033; color: #fff; }
    main { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 18px; padding: 18px; }
    article { border: 1px solid rgba(16, 32, 51, .16); background: #fff; padding: 14px; }
    h2 { margin: 0 0 8px; font-size: 1rem; }
    p { margin: 0 0 12px; color: #4a5562; font-size: .86rem; }
    img { width: 100%; border: 1px solid rgba(16, 32, 51, .12); }
    pre { white-space: pre-wrap; color: #9c2f2f; font-size: .75rem; }
  </style>
</head>
<body>
  <header>
    <h1>CMP Stage C.1 Public Journey Acceptance</h1>
    <p>Latest run phase: ${escapeHtml(phaseName)} · Origin: ${escapeHtml(origin || "not captured")}</p>
  </header>
  <main>${phaseRows}</main>
</body>
</html>
`);

  const afterLayout = allLayout.filter((entry) => entry.phase === "after");
  const serviceWidths = afterLayout
    .filter((entry) => entry.minServiceCardWidth !== null)
    .map((entry) => entry.minServiceCardWidth);
  const minServiceWidth = serviceWidths.length ? Math.min(...serviceWidths).toFixed(1) : "not captured";
  const overflowCount = afterLayout.filter((entry) => entry.horizontalOverflow).length;
  const screenshotCount = allShots.length;
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_C1_REPORT.md"), `# CMP Stage C.1 Public Journey Acceptance

- Latest phase: ${phaseName}
- Browser origin: ${origin || "not captured"}
- Screenshots captured: ${screenshotCount}
- Minimum after service-card width: ${minServiceWidth}
- After horizontal overflow findings: ${overflowCount}
- Console/page errors captured: ${allConsole.length}

Audit outputs are intentionally ignored by Git.
`);
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_C1_BEFORE_AFTER.md"), `# CMP Stage C.1 Before / After

Before and after screenshots are recorded in \`CMP_STAGE_C1_SCREENSHOT_LOG.json\` and rendered in \`CMP_STAGE_C1_CONTACT_SHEET.html\`.

- Before screenshots: ${allShots.filter((entry) => entry.phase === "before").length}
- After screenshots: ${allShots.filter((entry) => entry.phase === "after").length}
- Latest phase written: ${phaseName}
`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

test("browser acceptance: public pages meet C.1 layout, copy, storage and route constraints", async () => {
  const result = await browserLayoutRun();
  const addInitial = result.layoutResults.find((entry) => entry.label === "add-property-initial" && entry.viewport === "1440x1000");
  assert.ok(addInitial?.container, "Add Property shared container should exist");
  assert.ok(
    Math.abs(addInitial.container.left - addInitial.container.right) <= 2,
    `Add Property container should be centred: ${JSON.stringify(addInitial.container)}`
  );

  const allLayout = result.layoutResults.filter((entry) => entry.viewport !== "all");
  assert.deepEqual(allLayout.filter((entry) => entry.horizontalOverflow).map((entry) => `${entry.viewport}:${entry.label}`), []);

  const serviceLayouts = allLayout.filter((entry) => entry.minServiceCardWidth !== null);
  assert.ok(serviceLayouts.length, "service card layouts should be measured");
  assert.deepEqual(serviceLayouts.filter((entry) => entry.minServiceCardWidth < 280).map((entry) => `${entry.viewport}:${entry.label}:${entry.minServiceCardWidth}`), []);
  assert.deepEqual(serviceLayouts.filter((entry) => entry.overflowingServiceCards > 0).map((entry) => `${entry.viewport}:${entry.label}`), []);

  const copyFailures = result.copyResults
    .filter((entry) => entry.emptyUnknowns || entry.prototypeCopy || entry.oldHandoff)
    .map((entry) => `${entry.viewport}:${entry.label}`);
  assert.deepEqual(copyFailures, []);

  const reviewCopies = result.copyResults.filter((entry) => entry.label === "review-handoff-actions");
  assert.ok(reviewCopies.some((entry) => entry.ctas.includes("Continue to property questions") || entry.ctas.includes("Open Property Brain")));
  assert.ok(reviewCopies.every((entry) => entry.ctas.includes("Save and return to My Properties")));

  const handoffLayouts = allLayout.filter((entry) => entry.label === "review-handoff-actions");
  assert.deepEqual(handoffLayouts.filter((entry) => !entry.reviewHandoff || entry.reviewHandoff.paddingTop < 22 || entry.reviewHandoff.paddingBottom < 22 || entry.reviewHandoff.marginBottomToFooter < 32).map((entry) => entry.viewport), []);

  const workspaceCopy = result.copyResults.filter((entry) => entry.label === "selected-incomplete-workspace" || entry.label === "selected-complete-workspace");
  assert.ok(workspaceCopy.some((entry) => entry.workspacePrimary === "Continue property setup"));
  assert.ok(workspaceCopy.some((entry) => entry.workspacePrimary === "Review next action"));

  const storage = result.layoutResults.find((entry) => entry.label === "storage-count-navigation");
  assert.equal(storage?.storageCountsStable, true, JSON.stringify(storage));
  assert.deepEqual(result.consoleIssues, []);
});

test("bridge-created Review Found Data facts remain deduplicated", () => {
  const storage = fakeStorage();
  const property = createViaBridge(storage);
  const review = bridge.prepareReviewFoundData(property);
  const allFactIds = [
    ...review.foundAutomatically,
    ...review.needsConfirmation,
    ...review.missingUnknown,
  ].map((item) => item.id);
  assert.equal(allFactIds.length, new Set(allFactIds).size);
  assert.equal(canonicalStore(storage).propertyOrder.length, 1);
});

if (auditMode) {
  await browserLayoutRun({ writeAudit: true, phaseName: phase });
}

if (!captureOnly) {
  let passed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      passed += 1;
    } catch (error) {
      console.error(`FAIL ${name}`);
      console.error(error.stack || error.message);
      process.exit(1);
    }
  }

  console.log(`CMP Stage C.1 public journey acceptance check passed (${passed} assertions).`);
} else {
  console.log(`CMP Stage C.1 ${phase} capture written.`);
}
