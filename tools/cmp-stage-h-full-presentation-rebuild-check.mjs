import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));

const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const desktop = { width: 1440, height: 1000 };
const tablet = { width: 1024, height: 900 };
const mobile = { width: 390, height: 844 };

const protectedPatterns = [
  /^core\/cmp-property-store\.js$/,
  /^core\/cmp-compliance-derivation\.js$/,
  /^core\/cmp-priority-rules\.js$/,
  /^core\/cmp-service-lifecycle\.js$/,
  /^core\/cmp-evidence-lifecycle\.js$/,
  /^core\/cmp-monitoring-derivation\.js$/,
  /^schemas?\//,
  /^netlify\.toml$/,
  /^package(?:-lock)?\.json$/,
  /^auth\//,
  /scenario/i,
  /storage-key/i,
];

const allowedFiles = new Set([
  "landing.css",
  "dashboard-labs.css",
  "public-pages.js",
  "dashboard-labs.html",
  "dashboard-labs.js",
  "tools/cmp-stage-h-full-presentation-rebuild-check.mjs",
  "tools/cmp-stage-f-copy-convergence-check.mjs",
  "tools/cmp-stage-g-visual-system-convergence-check.mjs",
  "tools/cmp-stage-g1-final-regression-blockers-check.mjs",
  "tools/cmp-stage-g3-premium-british-landlord-ui-check.mjs",
]);

const forbiddenNormalText = /\b(?:quest|command centre|prototype|demo|scenario|simulated|canonical|propertyId|renderer|handler|lifecycle|fixture|Labs|AI operating system|Journey OS|workspace setup|Portfolio Sweep)\b/i;
const forbiddenReviewText = /\b(?:No missing or unknown facts in this review|No missing or unknown facts|No extra landlord answers needed|Nothing else needed right now|Current subtask)\b|(?:\bCURRENT\b|\bSUBTASK\b|\bNEXT STEP\b)/;
const legalOverclaimText = /\b(?:legally verified|guaranteed compliant|compliance guarantee|official approval|AI confirmed compliance)\b/i;

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  const ranges = [
    ["diff", "--name-only", "55554f8..HEAD"],
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
  ];
  return [...new Set(ranges.flatMap((args) => execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/).filter(Boolean)))];
}

function push(assertions, name, pass, detail = "") {
  assertions.push({ name, pass: Boolean(pass), detail: String(detail || "") });
}

function parseRgb(value) {
  const match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
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
        }[ext] || "application/octet-stream",
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
    id: "h-address",
    uprn: "H-UPRN",
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
      certificate: "H-EPC",
      source: "Example EPC register match",
    },
    ...overrides,
  };
}

function createProperty(options = {}) {
  const result = bridge.createPropertyRecord(selection(options.selection || {}), {
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    propertyId: options.id || "prop_h_one",
    journeyContext: {
      entryService: options.entryService || "full_compliance",
      focusMode: options.entryService || "full_compliance",
      isTenanted: "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: options.answeredQuestions || {},
    },
    now: "2026-06-29T09:00:00.000Z",
    randomUUID: () => options.id || "prop-h-one",
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
  const derived = derivation.derivePropertyComplianceState(property, { now: "2026-06-29T09:00:00.000Z" });
  assert.equal(derived.ok, true, JSON.stringify(derived.errors || []));
  const action = derived.value.actionItems.find((item) => /epc|eicr|electrical|gas/i.test(`${item.title} ${item.reason}`));
  assert.ok(action, "seed property should produce an EPC/EICR/Gas action");
  const options = serviceLifecycle.resolveServiceOptionsForAction(action, property, derived.value);
  assert.equal(options.ok, true, JSON.stringify(options.errors || []));
  const request = serviceLifecycle.createServiceRequestFromAction(property, action, options.value[0], {
    now: "2026-06-29T09:05:00.000Z",
  });
  assert.equal(request.ok, true, JSON.stringify(request.errors || []));
  return request.value.propertyRecord;
}

function createStore(mode = "one") {
  const store = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-29T09:00:00.000Z" });
  if (mode === "empty") return store;
  const one = mode === "request" ? withPreparedRequest(createProperty({ id: "prop_h_one" })) : createProperty({ id: "prop_h_one" });
  store.propertiesById[one.id] = one;
  store.propertyOrder.push(one.id);
  store.lastSelectedPropertyId = one.id;
  if (mode === "two") {
    const two = createProperty({
      id: "prop_h_two",
      selection: {
        address: "42 Station Road, Coventry, CV1 2AA",
        postcode: "CV1 2AA",
        city: "Coventry",
        type: "Terraced house",
      },
    });
    store.propertiesById[two.id] = two;
    store.propertyOrder.push(two.id);
  }
  return store;
}

async function newPage(browser, viewport = desktop, seedMode = "") {
  const context = await browser.newContext({ viewport });
  if (seedMode) {
    const store = createStore(seedMode);
    await context.addInitScript(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [publicStorageKey, store]);
  }
  const page = await context.newPage();
  const events = { consoleMessages: [], pageErrors: [], badResponses: [], failedRequests: [] };
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
  return (await page.locator("body").innerText({ timeout: 8000 })).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

async function metrics(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const controls = Array.from(document.querySelectorAll("button, a, input, textarea, select")).filter(visible).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "),
        width: rect.width,
        height: rect.height,
      };
    });
    const headings = Array.from(document.querySelectorAll("h1,h2,h3")).filter(visible).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        text: (el.innerText || "").trim().replace(/\s+/g, " "),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    });
    const labels = Array.from(document.querySelectorAll(".section-kicker, .service-grid-eyebrow, .prototype-badge, .source-badge, .doc-status, .status-pill")).filter(visible).map((el) => {
      const rect = el.getBoundingClientRect();
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
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    });
    const sidebar = document.querySelector(".labs-sidebar");
    const navItem = document.querySelector(".labs-sidebar .nav-item");
    const sidebarStyles = sidebar && navItem ? {
      sidebarBackground: getComputedStyle(sidebar).backgroundColor,
      navColor: getComputedStyle(navItem).color,
    } : null;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      localStorageCount: localStorage.length,
      smallControls: controls.filter((control) => control.text && Math.min(control.width, control.height) < 44),
      headings,
      labels,
      sidebarStyles,
      addressRenderers: document.querySelectorAll(".address-card-list").length,
      postcodeInputs: document.querySelectorAll("#addPropertyPostcode, input[name='postcode']").length,
      serviceCards: Array.from(document.querySelectorAll(".service-grid-card, .service-card, .service-proof-card")).filter(visible).map((card) => ({
        width: card.getBoundingClientRect().width,
        clipped: card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2,
        text: (card.innerText || "").trim().replace(/\s+/g, " ").slice(0, 180),
      })),
    };
  });
}

function overlaps(metricsResult) {
  const result = [];
  for (const label of metricsResult.labels) {
    for (const heading of metricsResult.headings) {
      const separate = label.right <= heading.left || label.left >= heading.right || label.bottom <= heading.top || label.top >= heading.bottom;
      if (!separate && label.text && heading.text && !heading.text.includes(label.text)) result.push({ label: label.text, heading: heading.text });
    }
  }
  return result;
}

async function scanRoute(browser, origin, entry, viewport = desktop, seedMode = "") {
  const { context, page, events } = await newPage(browser, viewport, seedMode);
  await page.goto(`${origin}${entry.route}`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(250);
  const text = await visibleText(page);
  const pageMetrics = await metrics(page);
  await context.close();
  return { ...entry, text, metrics: pageMetrics, events };
}

async function clickVisible(page, selector) {
  const ok = await page.evaluate((targetSelector) => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const target = Array.from(document.querySelectorAll(targetSelector)).find(visible) || document.querySelector(targetSelector);
    if (!target) return false;
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  }, selector);
  assert.equal(ok, true, `Unable to click ${selector}`);
  await page.waitForTimeout(350);
}

async function runAddPropertyReview(browser, origin) {
  const { context, page, events } = await newPage(browser, desktop);
  await page.goto(`${origin}/add-property.html`, { waitUntil: "networkidle", timeout: 25000 });
  await page.fill("#addPropertyPostcode", "B37 7BA");
  await page.click("#addPropertySearchForm button[type='submit']");
  await page.waitForSelector("[data-use-address]", { timeout: 12000 });
  const addressMetrics = await metrics(page);
  await page.locator("[data-use-address]").first().click();
  await page.waitForSelector("[data-canonical-review]", { timeout: 12000 });
  await page.waitForTimeout(450);
  const startStorage = await page.evaluate(() => localStorage.length);
  const text = await visibleText(page);
  const pageMetrics = await metrics(page);
  const reviewInfo = await page.evaluate(() => ({
    reviewCount: document.querySelectorAll("[data-canonical-review]").length,
    handoffCount: document.querySelectorAll("[data-canonical-handoff]").length,
    nestedHelperCards: document.querySelectorAll("[data-canonical-review] .helper-card .add-property-review-item").length,
    reviewRecordPanels: document.querySelectorAll("[data-canonical-review] .stage-h-review-panel, [data-canonical-review] .property-file-review-panel").length,
    prominentEmptyCards: Array.from(document.querySelectorAll("[data-canonical-review] article, [data-canonical-review] .helper-card")).filter((item) => /Nothing else needed|No missing|No extra/i.test(item.innerText || "")).length,
    focusOutline: getComputedStyle(document.querySelector("[data-canonical-handoff]"), ":focus-visible").outlineStyle,
  }));
  const endStorage = await page.evaluate(() => localStorage.length);
  await context.close();
  return { text, metrics: pageMetrics, addressMetrics, reviewInfo, events, startStorage, endStorage };
}

async function runWorkspace(browser, origin, viewport = desktop) {
  const { context, page, events } = await newPage(browser, viewport, "request");
  await page.goto(`${origin}/dashboard-labs.html?propertyId=prop_h_one`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(400);
  const overviewText = await visibleText(page);
  const overviewMetrics = await metrics(page);
  await clickVisible(page, "[data-tab='documents']");
  const evidenceText = await visibleText(page);
  await clickVisible(page, "[data-global-nav='Tasks']");
  const actionsText = await visibleText(page);
  await clickVisible(page, "[data-tab='services']");
  const servicesText = await visibleText(page);
  await clickVisible(page, "[data-tab='timeline']");
  const timelineText = await visibleText(page);
  await clickVisible(page, "[data-global-nav='Activity']");
  const monitoringText = await visibleText(page);
  await clickVisible(page, "[data-assistant-open]");
  const askText = await visibleText(page);
  const hookCounts = await page.evaluate(() => ({
    primary: document.querySelectorAll("[data-normal-canonical-primary]").length,
    evidence: document.querySelectorAll("[data-portfolio-evidence]").length,
    servicePrimary: document.querySelectorAll("[data-service-primary-body]").length,
    assistant: document.querySelectorAll("[data-assistant-panel]").length,
  }));
  await context.close();
  return { overviewText, evidenceText, actionsText, servicesText, timelineText, monitoringText, askText, overviewMetrics, events, hookCounts };
}

function sourceAssertions(assertions) {
  const diffFiles = changedFiles().filter((file) => !file.startsWith("audit/"));
  push(assertions, "Only allowed Stage H files changed", diffFiles.every((file) => allowedFiles.has(file) || /^assets\/generated\/(?:public-h|workspace-h)\/[^/]+\.svg$/.test(file)), diffFiles.join(", "));
  push(assertions, "No protected core lifecycle/rules/scoring/store files changed", !diffFiles.some((file) => protectedPatterns.some((pattern) => pattern.test(file))), diffFiles.join(", "));
  push(assertions, "No package/dependency/config files changed", !diffFiles.some((file) => /^package(?:-lock)?\.json$|^netlify\.toml$|eslint|tsconfig|jsconfig/i.test(file)), diffFiles.join(", "));
  push(assertions, "/Users/davidtaylor/Code/mysite is not the active repo", repoRoot !== "/Users/davidtaylor/Code/mysite", repoRoot);

  const landingCss = read("landing.css");
  const dashboardCss = read("dashboard-labs.css");
  const publicPages = read("public-pages.js");
  const dashboardHtml = read("dashboard-labs.html");
  const dashboardJs = read("dashboard-labs.js");

  push(assertions, "Stage H public design-system tokens exist", /--h-ink|--h-paper|--h-accent|stage-h-public/.test(landingCss), "missing Stage H public tokens");
  push(assertions, "Stage H workspace design-system tokens exist", /--h-workspace-ink|--h-sidebar|stage-h-workspace/.test(dashboardCss), "missing Stage H workspace tokens");
  push(assertions, "Old decorative Add Property stage art is removed", !/add-property-stage-art|add-property-stage-panel|add-property-stage-cards|add-property-stage-bars/.test(publicPages), "old stage art remains");
  push(assertions, "Old hero texture/orbital decorative system is removed from active CSS", !/hero-texture-orbital|hero-texture-glow|decorative circles/i.test(landingCss), "old hero texture remains");
  push(assertions, "Reduced-motion CSS remains present", /prefers-reduced-motion/.test(landingCss) && /prefers-reduced-motion/.test(dashboardCss), "");
  push(assertions, "Add Property route remains the only normal Add Property entry", /add-property\.html/.test(publicPages) && !/az-checker-v2\.html/.test(publicPages), "");
  push(assertions, "Selected workspace route still uses dashboard-labs propertyId handoff", /dashboard-labs\.html\?propertyId=/.test(publicPages) && /propertyId/.test(dashboardJs), "");
  push(assertions, "Protected hooks remain present", /data-canonical-handoff/.test(publicPages) && /data-normal-canonical-primary/.test(dashboardJs) && /data-portfolio-evidence/.test(dashboardHtml) && /data-service-primary-body/.test(dashboardHtml), "");
  push(assertions, "Demo/QA controls remain quarantined", /data-qa-only hidden/.test(dashboardHtml), "");
  push(assertions, "Stage H copy avoids future-incomplete footer wording", !/will be added|can be connected before launch/i.test(publicPages + dashboardHtml), "");
}

function genericRouteAssertions(assertions, result) {
  const relevantConsoleErrors = result.events.consoleMessages.filter((item) => item.type === "error" && !/404|favicon/i.test(item.text));
  push(assertions, `${result.label} has no console/page errors`, relevantConsoleErrors.length === 0 && result.events.pageErrors.length === 0, JSON.stringify({ console: relevantConsoleErrors, pageErrors: result.events.pageErrors }));
  push(assertions, `${result.label} has no horizontal overflow`, result.metrics.scrollWidth <= result.metrics.innerWidth + 1 && result.metrics.bodyWidth <= result.metrics.innerWidth + 1, `${result.metrics.scrollWidth}/${result.metrics.innerWidth}`);
  push(assertions, `${result.label} hides forbidden internal terms`, !forbiddenNormalText.test(result.text), result.text.match(forbiddenNormalText)?.[0] || "");
  push(assertions, `${result.label} avoids legal overclaim`, !legalOverclaimText.test(result.text), result.text.match(legalOverclaimText)?.[0] || "");
  push(assertions, `${result.label} controls meet 44px tap target where visible`, result.metrics.smallControls.length === 0, JSON.stringify(result.metrics.smallControls.slice(0, 5)));
  const lowContrast = result.metrics.labels.map((label) => ({ ...label, ratio: contrastRatio(label.color, label.backgroundColor) })).filter((label) => label.text && label.ratio < 3.0);
  push(assertions, `${result.label} status/source labels avoid very low contrast`, lowContrast.length === 0, JSON.stringify(lowContrast.slice(0, 5)));
  push(assertions, `${result.label} heading labels do not overlap`, overlaps(result.metrics).length === 0, JSON.stringify(overlaps(result.metrics).slice(0, 5)));
}

async function main() {
  assert.ok(fs.existsSync(chromePath), "Google Chrome is required for Stage H rendered checks.");
  const assertions = [];
  sourceAssertions(assertions);
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    await withStaticServer(async (origin) => {
      const publicRoutes = [
        { label: "homepage", route: "/" },
        { label: "services", route: "/services.html" },
        { label: "add-property", route: "/add-property.html" },
        { label: "my-properties-empty", route: "/my-properties.html", seed: "empty" },
        { label: "my-properties-one", route: "/my-properties.html", seed: "one" },
        { label: "my-properties-two", route: "/my-properties.html", seed: "two" },
        { label: "epc", route: "/epcs.html" },
        { label: "eicr", route: "/eicr.html" },
        { label: "gas", route: "/gas-safety.html" },
      ];
      const results = [];
      for (const entry of publicRoutes) {
        const result = await scanRoute(browser, origin, entry, desktop, entry.seed || "");
        results.push(result);
        genericRouteAssertions(assertions, result);
      }

      const homepage = results.find((item) => item.label === "homepage");
      const services = results.find((item) => item.label === "services");
      const myOne = results.find((item) => item.label === "my-properties-one");
      const myTwo = results.find((item) => item.label === "my-properties-two");

      push(assertions, "Homepage contains no quest", !/\bquest\b/i.test(homepage.text), homepage.text.match(/\bquest\b/i)?.[0] || "");
      push(assertions, "Homepage contains no internal architecture-table wording", !/principle|architecture|route map|Journey OS/i.test(homepage.text), homepage.text.slice(0, 500));
      push(assertions, "Homepage has Check My Property CTA", /Check My Property/i.test(homepage.text), homepage.text.slice(0, 500));
      push(assertions, "Homepage includes supplier/payment/legal boundaries", /No supplier contacted/i.test(homepage.text) && /No payment taken/i.test(homepage.text) && /Guidance, not legal advice/i.test(homepage.text), homepage.text.slice(0, 900));
      push(assertions, "Homepage has Stage H record-led visual system marker", /stage-h-home|property-file-desk|h-assurance-strip/.test(read("public-pages.js") + read("landing.css")), "missing Stage H home markers");

      push(assertions, "Services cards meet readable width", services.metrics.serviceCards.every((card) => card.width >= 260), JSON.stringify(services.metrics.serviceCards.map((card) => card.width).slice(0, 6)));
      push(assertions, "Services card text does not clip", services.metrics.serviceCards.every((card) => !card.clipped), JSON.stringify(services.metrics.serviceCards.filter((card) => card.clipped).slice(0, 3)));
      push(assertions, "Service CTAs are landlord-facing", /Prepare request|Check EPC status|Prepare Gas Safety request|Add EICR evidence|Check licensing position/i.test(services.text) && !/Start .*route/i.test(services.text), services.text.slice(0, 900));
      push(assertions, "Services use property-evidence motifs", /EPC|Gas Safety|EICR|licensing|evidence|certificate/i.test(services.text) && /stage-h-service-card|h-service-ledger/.test(read("public-pages.js") + read("landing.css")), "missing service motifs");

      push(assertions, "My Properties one-property state is not portfolio-heavy", !/\bPortfolio Sweep\b|\bportfolio analytics\b/i.test(myOne.text), myOne.text.slice(0, 700));
      push(assertions, "My Properties one-property keeps property check moving", /Keep your property check moving|Next action|Open property workspace/i.test(myOne.text), myOne.text.slice(0, 700));
      push(assertions, "My Properties two-property may show comparison", /Compare|comparison|saved properties/i.test(myTwo.text), myTwo.text.slice(0, 700));

      const review = await runAddPropertyReview(browser, origin);
      push(assertions, "Add Property has exactly one postcode input", review.metrics.postcodeInputs === 1, String(review.metrics.postcodeInputs));
      push(assertions, "Add Property has exactly one address selection renderer", review.addressMetrics.addressRenderers === 1, String(review.addressMetrics.addressRenderers));
      push(assertions, "Add Property has no visible CURRENT/SUBTASK/NEXT STEP collision labels", !/\bCURRENT\b|\bSUBTASK\b|\bNEXT STEP\b/.test(review.text), review.text.match(/\bCURRENT\b|\bSUBTASK\b|\bNEXT STEP\b/)?.[0] || "");
      push(assertions, "Add Property has no heading-label bounding-box overlaps", overlaps(review.metrics).length === 0, JSON.stringify(overlaps(review.metrics).slice(0, 5)));
      push(assertions, "Review found data has What CMP found", /What CMP found/i.test(review.text), review.text.slice(0, 900));
      push(assertions, "Review found data has What CMP still needs only when relevant", /What CMP still needs/i.test(review.text) && !/What CMP still needs[^]*Nothing else needed right now/i.test(review.text), review.text.slice(0, 1200));
      push(assertions, "Review found data has What to do next", /What to do next/i.test(review.text), review.text.slice(0, 1200));
      push(assertions, "Review found data has no odd empty card", !forbiddenReviewText.test(review.text) && review.reviewInfo.prominentEmptyCards === 0, review.text.match(forbiddenReviewText)?.[0] || String(review.reviewInfo.prominentEmptyCards));
      push(assertions, "Review found data uses rebuilt property-file panels", review.reviewInfo.reviewRecordPanels >= 3 && review.reviewInfo.nestedHelperCards === 0, JSON.stringify(review.reviewInfo));
      push(assertions, "Storage count does not change during visual review navigation", review.startStorage === review.endStorage, `${review.startStorage}->${review.endStorage}`);

      const workspace = await runWorkspace(browser, origin, desktop);
      const sidebarContrast = workspace.overviewMetrics.sidebarStyles ? contrastRatio(workspace.overviewMetrics.sidebarStyles.navColor, workspace.overviewMetrics.sidebarStyles.sidebarBackground) : 0;
      push(assertions, "Workspace sidebar contrast/readability passes", sidebarContrast >= 4.5, sidebarContrast.toFixed(2));
      push(assertions, "Workspace first viewport shows selected property and one Next action", /18 Willow Brook Drive|B37 7BA/i.test(workspace.overviewText) && /Next action|one clear next step/i.test(workspace.overviewText), workspace.overviewText.slice(0, 1000));
      push(assertions, "Evidence Vault states are text-labelled", /Accepted proof|Needs review|Missing evidence|Missing/i.test(workspace.evidenceText), workspace.evidenceText.slice(0, 900));
      push(assertions, "Services view contains No supplier contacted", /No supplier contacted/i.test(workspace.servicesText), workspace.servicesText.slice(0, 900));
      push(assertions, "Services view contains No payment taken", /No payment taken/i.test(workspace.servicesText), workspace.servicesText.slice(0, 900));
      push(assertions, "Timeline remains read-only history", /read-only history/i.test(workspace.timelineText), workspace.timelineText.slice(0, 900));
      push(assertions, "Monitoring remains practical follow-up", /monitoring|review date|follow-up|No date confirmed/i.test(workspace.monitoringText), workspace.monitoringText.slice(0, 900));
      push(assertions, "Ask CMP remains contextual and bounded", /Guidance, not legal advice/i.test(workspace.askText), workspace.askText.slice(0, 900));
      push(assertions, "Workspace protected hooks remain mounted", workspace.hookCounts.primary === 1 && workspace.hookCounts.evidence === 1 && workspace.hookCounts.servicePrimary === 1 && workspace.hookCounts.assistant === 1, JSON.stringify(workspace.hookCounts));

      const mobileHome = await scanRoute(browser, origin, { label: "mobile-homepage", route: "/" }, mobile);
      const mobileAdd = await scanRoute(browser, origin, { label: "mobile-add", route: "/add-property.html" }, mobile);
      const mobileServices = await scanRoute(browser, origin, { label: "mobile-services", route: "/services.html" }, mobile);
      const mobileWorkspace = await runWorkspace(browser, origin, mobile);
      [mobileHome, mobileAdd, mobileServices].forEach((result) => genericRouteAssertions(assertions, result));
      push(assertions, "Mobile workspace has no horizontal overflow", mobileWorkspace.overviewMetrics.scrollWidth <= mobileWorkspace.overviewMetrics.innerWidth + 1, `${mobileWorkspace.overviewMetrics.scrollWidth}/${mobileWorkspace.overviewMetrics.innerWidth}`);
      push(assertions, "Mobile workspace tap targets are at least 44px", mobileWorkspace.overviewMetrics.smallControls.length === 0, JSON.stringify(mobileWorkspace.overviewMetrics.smallControls.slice(0, 5)));
      push(assertions, "Mobile Add Property keeps primary action visible", /Check one property|Find property|Postcode|Check this property/i.test(mobileAdd.text), mobileAdd.text.slice(0, 700));
    });
  } finally {
    await browser.close();
  }

  const failures = assertions.filter((item) => !item.pass);
  if (failures.length) {
    console.error("CMP Stage H full presentation rebuild check failed:");
    failures.forEach((failure) => console.error(`- ${failure.name}${failure.detail ? `: ${failure.detail}` : ""}`));
    console.error(`Failed ${failures.length} of ${assertions.length} assertions.`);
    process.exit(1);
  }
  console.log(`CMP Stage H full presentation rebuild check passed (${assertions.length} assertions).`);
}

await main();
