import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));

const writeAudit = process.argv.includes("--write-audit");
const auditRoot = path.join(repoRoot, "audit/2026-06-26-cmp-stage-g1-final-regression-blockers");
const screenshotRoot = path.join(auditRoot, "screenshots");
const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const internalTerms = /\b(?:canonical|propertyId|fixture|demo|QA|renderer|handler)\b/i;
const prohibitedNormalTerms = /\bscenario\b/i;

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

async function loadPlaywright() {
  try {
    const module = await import("playwright");
    return module.chromium ? module : module.default;
  } catch {
    const npxDir = path.join(os.homedir(), ".npm", "_npx");
    if (fs.existsSync(npxDir)) {
      for (const entry of fs.readdirSync(npxDir)) {
        const packagePath = path.join(npxDir, entry, "node_modules", "playwright", "package.json");
        if (fs.existsSync(packagePath)) {
          const module = await import(path.join(npxDir, entry, "node_modules", "playwright", "index.mjs"));
          return module.chromium ? module : module.default;
        }
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

function selection(overrides = {}) {
  return {
    id: "g1-address",
    uprn: "G1-UPRN",
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
      certificate: "G1-EPC",
      source: "Example EPC preview",
    },
    ...overrides,
  };
}

function createProperty(options = {}) {
  const result = bridge.createPropertyRecord(selection(options.selection || {}), {
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    propertyId: options.id || "prop_final_audit_one",
    journeyContext: {
      entryService: options.entryService || "full_compliance",
      focusMode: options.entryService || "full_compliance",
      isTenanted: "yes",
      sourceRoute: options.sourceRoute || "add-property.html",
      answeredQuestions: options.answeredQuestions || {},
    },
    now: "2026-06-26T10:00:00.000Z",
    randomUUID: () => "g1-final-audit-one",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    ...result.value.property,
    lifecycleStatus: "active",
    currentSetupStage: "workspace",
    landlordAnswers: [],
    evidence: [],
    serviceRequests: [],
    timeline: [],
    monitoring: [],
  };
}

function withPreparedRequest(property) {
  const derived = derivation.derivePropertyComplianceState(property, {
    now: "2026-06-26T10:00:00.000Z",
  });
  assert.equal(derived.ok, true, JSON.stringify(derived.errors || []));
  const action = derived.value.actionItems.find((item) => /epc|eicr|electrical|gas/i.test(`${item.title} ${item.reason}`));
  assert.ok(action, "seed property should produce an EPC/EICR/Gas action");
  const options = serviceLifecycle.resolveServiceOptionsForAction(action, property, derived.value);
  assert.equal(options.ok, true, JSON.stringify(options.errors || []));
  assert.ok(options.value[0], "seed action should produce a service option");
  const request = serviceLifecycle.createServiceRequestFromAction(property, action, options.value[0], {
    now: "2026-06-26T10:05:00.000Z",
  });
  assert.equal(request.ok, true, JSON.stringify(request.errors || []));
  return request.value.propertyRecord;
}

function createStore({ request = false } = {}) {
  const store = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-26T10:00:00.000Z" });
  const property = request ? withPreparedRequest(createProperty()) : createProperty();
  store.propertiesById[property.id] = property;
  store.propertyOrder.push(property.id);
  store.lastSelectedPropertyId = property.id;
  return store;
}

async function newAuditedPage(browser, origin, viewport = { width: 1366, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(origin)) {
      failedRequests.push({ url: request.url(), method: request.method(), failure: request.failure()?.errorText || "" });
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) {
      badResponses.push({ url: response.url(), status: response.status() });
    }
  });
  return { context, page, consoleMessages, pageErrors, failedRequests, badResponses };
}

async function bodyText(page) {
  return (await page.locator("body").innerText({ timeout: 6000 })).replace(/\u00a0/g, " ");
}

async function visibleMetrics(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const controls = Array.from(document.querySelectorAll("button, a, input, textarea, select"))
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "),
          width: rect.width,
          height: rect.height,
        };
      });
    const badges = Array.from(document.querySelectorAll(".doc-status, .source-badge, .prototype-badge, .status-pill, .quiet-pill"))
      .filter(visible)
      .map((el) => {
        const style = getComputedStyle(el);
        let node = el;
        let backgroundColor = style.backgroundColor;
        while ((!backgroundColor || backgroundColor === "rgba(0, 0, 0, 0)" || backgroundColor === "transparent") && node.parentElement) {
          node = node.parentElement;
          backgroundColor = getComputedStyle(node).backgroundColor;
        }
        return {
          text: (el.innerText || "").trim().replace(/\s+/g, " "),
          color: style.color,
          backgroundColor,
        };
      });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      smallTapTargets: controls.filter((control) => control.text && Math.min(control.width, control.height) < 44),
      badges,
      storageCount: localStorage.length,
    };
  });
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

function normalizeLabel(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function countTerm(text, term) {
  return (text.match(new RegExp(`\\b${term}\\b`, "gi")) || []).length;
}

async function runRouteScan(browser, origin, route, label, assertions) {
  const { context, page, consoleMessages, pageErrors, failedRequests, badResponses } = await newAuditedPage(browser, origin);
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(300);
  const text = await bodyText(page);
  const metrics = await visibleMetrics(page);
  const result = {
    label,
    route,
    h1: await page.locator("h1").first().innerText().catch(() => ""),
    textSample: text.slice(0, 600),
    containsScenario: prohibitedNormalTerms.test(text),
    containsInternal: internalTerms.test(text),
    consoleMessages,
    pageErrors,
    failedRequests,
    badResponses,
    smallTapTargets: metrics.smallTapTargets.slice(0, 8),
    lowContrastBadges: metrics.badges
      .filter((badge) => badge.text && contrastRatio(badge.color, badge.backgroundColor) < 3)
      .map((badge) => ({ ...badge, ratio: Number(contrastRatio(badge.color, badge.backgroundColor).toFixed(2)) })),
    horizontalOverflow: metrics.scrollWidth > metrics.innerWidth + 1,
  };
  assertions.push({
    name: `${label} has no horizontal overflow`,
    pass: !result.horizontalOverflow,
    detail: `${metrics.scrollWidth}/${metrics.innerWidth}`,
  });
  assertions.push({
    name: `${label} has no low-contrast visible badges`,
    pass: result.lowContrastBadges.length === 0,
    detail: JSON.stringify(result.lowContrastBadges.slice(0, 4)),
  });
  await context.close();
  return result;
}

async function runAddPropertyReview(browser, origin, assertions, screenshots) {
  const { context, page } = await newAuditedPage(browser, origin);
  await page.goto(`${origin}/add-property.html?postcode=B37%207BA`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForSelector("[data-use-address]", { timeout: 12000 });
  await page.locator("[data-use-address]").first().click();
  await page.waitForSelector("[data-canonical-review]", { timeout: 12000 });
  await page.waitForTimeout(300);
  const text = await bodyText(page);
  const groups = await page.$$eval("[data-canonical-review] .stage-h-review-panel h3, [data-canonical-review] .review-found-card h3", (items) => items.map((item) => item.textContent.trim()));
  const hasFound = groups.some((item) => /what cmp found/i.test(item));
  const hasNeeds = groups.some((item) => /what cmp still needs/i.test(item));
  const hasNext = groups.some((item) => /what to do next/i.test(item));
  assertions.push({
    name: "Add Property review shows found, still-needed and next-action property-file sections",
    pass: hasFound && hasNeeds && hasNext,
    detail: groups.join(" | "),
  });
  assertions.push({
    name: "Add Property keeps canonical handoff hook",
    pass: await page.locator("[data-canonical-handoff]").count() === 1,
    detail: "",
  });
  if (writeAudit) {
    const file = "g1-add-property-review.png";
    await page.screenshot({ path: path.join(screenshotRoot, file), fullPage: true });
    screenshots.push({ label: "add-property-review", route: "/add-property.html?postcode=B37%207BA", screenshot: `screenshots/${file}` });
  }
  const result = { route: "/add-property.html?postcode=B37%207BA", groups, textSample: text.slice(0, 700) };
  await context.close();
  return result;
}

async function runInvalidRoute(browser, origin, assertions, screenshots) {
  const route = "/dashboard-labs.html?propertyId=invalid-property-id";
  const { context, page } = await newAuditedPage(browser, origin);
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(400);
  const text = await bodyText(page);
  const propertyNotFoundCount = countTerm(text, "Property not found");
  assertions.push({
    name: "Invalid property route hides internal terms",
    pass: !internalTerms.test(text),
    detail: text.match(internalTerms)?.[0] || "",
  });
  assertions.push({
    name: "Invalid property route gives safe My Properties/Add Property handoff",
    pass: /Open My Properties/i.test(text) && /Add property/i.test(text),
    detail: text.slice(0, 400).replace(/\s+/g, " "),
  });
  assertions.push({
    name: "Invalid property route avoids repeated not-found headings",
    pass: propertyNotFoundCount <= 2,
    detail: String(propertyNotFoundCount),
  });
  if (writeAudit) {
    const file = "g1-invalid-property.png";
    await page.screenshot({ path: path.join(screenshotRoot, file), fullPage: true });
    screenshots.push({ label: "invalid-property", route, screenshot: `screenshots/${file}` });
  }
  const result = {
    route,
    prohibitedTerm: text.match(internalTerms)?.[0] || null,
    propertyNotFoundCount,
    textSample: text.slice(0, 700),
  };
  await context.close();
  return result;
}

async function seedSelectedStore(page, origin, options = {}) {
  await page.goto(`${origin}/index.html`, { waitUntil: "networkidle", timeout: 20000 });
  const store = createStore(options);
  const before = await page.evaluate(([key, value]) => {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(value));
    return localStorage.length;
  }, [publicStorageKey, store]);
  return before;
}

async function runSelectedWorkspace(browser, origin, assertions, screenshots) {
  const { context, page } = await newAuditedPage(browser, origin);
  const startStorage = await seedSelectedStore(page, origin, { request: true });
  await page.goto(`${origin}/dashboard-labs.html?propertyId=prop_final_audit_one`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(500);
  const overviewText = await bodyText(page);
  const overviewNextCount = countTerm(overviewText, "Next action");
  assertions.push({
    name: "Selected overview does not duplicate Next action labels",
    pass: overviewNextCount <= 1,
    detail: String(overviewNextCount),
  });
  assertions.push({
    name: "Selected workspace primary hook remains",
    pass: await page.locator("[data-normal-canonical-primary]").count() === 1,
    detail: "",
  });
  if (writeAudit) {
    const file = "g1-selected-overview.png";
    await page.screenshot({ path: path.join(screenshotRoot, file), fullPage: true });
    screenshots.push({ label: "selected-overview", route: "/dashboard-labs.html?propertyId=prop_final_audit_one", screenshot: `screenshots/${file}` });
  }

  await page.locator('[data-global-nav="Tasks"]').click();
  await page.waitForTimeout(400);
  const actionText = await bodyText(page);
  const actionNextCount = countTerm(actionText, "Next action");
  assertions.push({
    name: "Action Plan owns one clear Next action marker",
    pass: actionNextCount >= 1 && actionNextCount <= 2,
    detail: String(actionNextCount),
  });
  assertions.push({
    name: "Action Plan terminology remains visible",
    pass: /Action Plan/i.test(actionText) && !/\bTasks\b/.test(actionText),
    detail: actionText.slice(0, 300).replace(/\s+/g, " "),
  });

  await page.locator('[data-global-nav="Request service"]').click();
  await page.waitForTimeout(400);
  const servicesText = await bodyText(page);
  assertions.push({
    name: "Selected Services shows supplier boundary",
    pass: /No supplier contacted/.test(servicesText),
    detail: servicesText.slice(0, 500).replace(/\s+/g, " "),
  });
  assertions.push({
    name: "Selected Services shows payment boundary",
    pass: /No payment taken/.test(servicesText),
    detail: servicesText.slice(0, 500).replace(/\s+/g, " "),
  });
  assertions.push({
    name: "Selected Services primary body hook remains",
    pass: await page.locator("[data-service-primary-body]").count() === 1,
    detail: "",
  });
  const endMetrics = await visibleMetrics(page);
  assertions.push({
    name: "Selected workspace navigation does not change localStorage count",
    pass: startStorage === endMetrics.storageCount,
    detail: `${startStorage}->${endMetrics.storageCount}`,
  });
  assertions.push({
    name: "Selected workspace visible controls are tappable",
    pass: endMetrics.smallTapTargets.length === 0,
    detail: JSON.stringify(endMetrics.smallTapTargets.slice(0, 5)),
  });
  const lowContrast = endMetrics.badges
    .filter((badge) => badge.text && contrastRatio(badge.color, badge.backgroundColor) < 3)
    .map((badge) => ({ ...badge, ratio: Number(contrastRatio(badge.color, badge.backgroundColor).toFixed(2)) }));
  assertions.push({
    name: "Selected workspace visible badges meet contrast",
    pass: lowContrast.length === 0,
    detail: JSON.stringify(lowContrast.slice(0, 5)),
  });
  if (writeAudit) {
    const file = "g1-selected-services.png";
    await page.screenshot({ path: path.join(screenshotRoot, file), fullPage: true });
    screenshots.push({ label: "selected-services", route: "/dashboard-labs.html?propertyId=prop_final_audit_one#services", screenshot: `screenshots/${file}` });
  }
  const result = {
    route: "/dashboard-labs.html?propertyId=prop_final_audit_one",
    overviewNextCount,
    actionNextCount,
    servicesBoundary: {
      noSupplierContacted: /No supplier contacted/.test(servicesText),
      noPaymentTaken: /No payment taken/.test(servicesText),
    },
    storage: `${startStorage}->${endMetrics.storageCount}`,
    servicesSample: servicesText.slice(0, 700),
  };
  await context.close();
  return result;
}

async function runDashboardQa(browser, origin, assertions) {
  const route = "/dashboard.html?qa=1";
  const { context, page, consoleMessages, pageErrors, failedRequests, badResponses } = await newAuditedPage(browser, origin);
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(500);
  assertions.push({
    name: "Dashboard QA has no local failed requests",
    pass: failedRequests.length === 0 && badResponses.length === 0,
    detail: JSON.stringify({ failedRequests, badResponses }),
  });
  assertions.push({
    name: "Dashboard QA has no console/page errors",
    pass: consoleMessages.filter((message) => message.type === "error").length === 0 && pageErrors.length === 0,
    detail: JSON.stringify({ consoleMessages, pageErrors }),
  });
  const result = { route, consoleMessages, pageErrors, failedRequests, badResponses };
  await context.close();
  return result;
}

function sourceAssertions(assertions) {
  const publicPages = fs.readFileSync(path.join(repoRoot, "public-pages.js"), "utf8");
  const labsHtml = fs.readFileSync(path.join(repoRoot, "dashboard-labs.html"), "utf8");
  const labsJs = fs.readFileSync(path.join(repoRoot, "dashboard-labs.js"), "utf8");
  const dashboardHtml = fs.readFileSync(path.join(repoRoot, "dashboard.html"), "utf8");
  const diffFiles = require("node:child_process").execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
  const protectedChanged = diffFiles.filter((file) => /^core\/|^contracts\/|package|netlify|supabase-workspace-schema\.sql/.test(file));
  assertions.push({
    name: "No protected core/contracts/config files changed",
    pass: protectedChanged.length === 0,
    detail: protectedChanged.join(", "),
  });
  assertions.push({
    name: "Normal route hooks remain present",
    pass: /data-canonical-handoff/.test(publicPages)
      && /data-normal-canonical-primary/.test(labsJs)
      && /data-global-nav="Tasks"/.test(labsHtml)
      && /data-service-primary-body/.test(labsHtml)
      && /id="addPropertySearchForm"/.test(publicPages),
    detail: "",
  });
  assertions.push({
    name: "Dashboard optional AI key no longer requests missing local file",
    pass: !/src="ai-key\.local\.js"/.test(dashboardHtml),
    detail: "",
  });
  assertions.push({
    name: "External mysite workspace is not the active repo",
    pass: repoRoot !== "/Users/davidtaylor/Code/mysite" && !diffFiles.some((file) => file.includes("/Users/davidtaylor/Code/mysite")),
    detail: repoRoot,
  });
}

function duplicateAssertions(routeResults, assertions) {
  const exactBadLabels = [
    "not sure at this point",
    "not sure",
    "add proof later optional. add proof later; nothing is submitted from this screen.",
  ];
  for (const result of routeResults) {
    const normalized = normalizeLabel(result.textSample);
    for (const label of exactBadLabels) {
      const count = normalized.split(label).length - 1;
      assertions.push({
        name: `${result.label} avoids repeated ${label}`,
        pass: count <= 1,
        detail: String(count),
      });
    }
  }
}

function writeAuditOutputs(outputs) {
  if (!writeAudit) return;
  fs.mkdirSync(auditRoot, { recursive: true });
  fs.mkdirSync(screenshotRoot, { recursive: true });
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_ROUTE_RESULTS.json"), JSON.stringify(outputs.routeResults, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_INTERACTIVE_RESULTS.json"), JSON.stringify(outputs.interactiveResults, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_RENDERED_TEXT_SCAN.json"), JSON.stringify(outputs.renderedText, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_ACCESSIBILITY_RESULTS.json"), JSON.stringify(outputs.accessibilityResults, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_SCREENSHOT_LOG.json"), JSON.stringify(outputs.screenshots, null, 2));
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_CONTACT_SHEET.html"), `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>CMP Stage G.1 contact sheet</title><style>
body{font-family:system-ui,sans-serif;margin:24px;background:#f6f7f9;color:#111827}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}
figure{margin:0;background:#fff;border:1px solid #d7dde5;border-radius:8px;padding:12px}
img{width:100%;height:auto;border:1px solid #e5e7eb;border-radius:6px}
figcaption{font-weight:700;margin-bottom:8px}
</style></head>
<body><h1>CMP Stage G.1 contact sheet</h1><div class="grid">
${outputs.screenshots.map((shot) => `<figure><figcaption>${shot.label}</figcaption><img src="${shot.screenshot}" alt="${shot.label}"></figure>`).join("\n")}
</div></body></html>`);
  const failures = outputs.assertions.filter((item) => !item.pass);
  fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G1_REPORT.md"), [
    "# CMP Stage G.1 Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Failures: ${failures.length}`,
    "",
    "## Assertions",
    "",
    "| Check | Status | Detail |",
    "|---|---|---|",
    ...outputs.assertions.map((item) => `| ${item.name} | ${item.pass ? "pass" : "fail"} | ${(item.detail || "").replace(/\|/g, "\\|")} |`),
    "",
  ].join("\n"));
}

async function main() {
  assert.ok(fs.existsSync(chromePath), "Google Chrome is required for the Stage G.1 browser checks.");
  const assertions = [];
  const screenshots = [];
  const renderedText = [];
  const accessibilityResults = [];
  const routeResults = [];
  const interactiveResults = [];

  sourceAssertions(assertions);

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    await withStaticServer(async (origin) => {
      const evictions = await runRouteScan(browser, origin, "/evictions-possession.html", "evictions-possession", assertions);
      const aml = await runRouteScan(browser, origin, "/aml-checks.html", "aml-checks", assertions);
      routeResults.push(evictions, aml);
      renderedText.push(evictions, aml);
      accessibilityResults.push(
        { label: evictions.label, smallTapTargets: evictions.smallTapTargets, lowContrastBadges: evictions.lowContrastBadges },
        { label: aml.label, smallTapTargets: aml.smallTapTargets, lowContrastBadges: aml.lowContrastBadges },
      );
      assertions.push({
        name: "Evictions route does not expose scenario",
        pass: !evictions.containsScenario,
        detail: evictions.textSample,
      });
      assertions.push({
        name: "AML route does not expose scenario",
        pass: !aml.containsScenario,
        detail: aml.textSample,
      });
      duplicateAssertions(routeResults, assertions);

      const invalid = await runInvalidRoute(browser, origin, assertions, screenshots);
      routeResults.push(invalid);
      renderedText.push(invalid);

      const dashboardQa = await runDashboardQa(browser, origin, assertions);
      routeResults.push(dashboardQa);

      const addProperty = await runAddPropertyReview(browser, origin, assertions, screenshots);
      interactiveResults.push({ name: "Flow A - Add Property review", ...addProperty });

      const selected = await runSelectedWorkspace(browser, origin, assertions, screenshots);
      interactiveResults.push({ name: "Flow A/B - Selected workspace", ...selected });
    });
  } finally {
    await browser.close();
  }

  const outputs = { assertions, routeResults, interactiveResults, renderedText, accessibilityResults, screenshots };
  writeAuditOutputs(outputs);

  const failures = assertions.filter((item) => !item.pass);
  if (failures.length) {
    console.error("CMP Stage G.1 final regression blocker check failed:");
    for (const failure of failures) {
      console.error(`- ${failure.name}${failure.detail ? `: ${failure.detail}` : ""}`);
    }
    process.exit(1);
  }

  console.log(`CMP Stage G.1 final regression blocker check passed (${assertions.length} assertions).${writeAudit ? " Wrote G.1 audit artifacts." : ""}`);
}

await main();
