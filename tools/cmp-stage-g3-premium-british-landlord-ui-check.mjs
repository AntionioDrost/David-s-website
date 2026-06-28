import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));

const writeAudit = process.argv.includes("--write-audit");
const auditRoot = path.join(repoRoot, "audit/2026-06-28-cmp-stage-g3-premium-british-landlord-ui");
const publicStorageKey = bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const desktop = { width: 1440, height: 1000 };
const tablet = { width: 1024, height: 900 };
const mobile = { width: 390, height: 844 };

const serviceRoutes = [
  "/epcs.html",
  "/gas-safety.html",
  "/eicr.html",
  "/property-inspections.html",
  "/selective-licensing.html",
  "/mould-damp.html",
  "/possession-eviction-preparation.html",
  "/evictions-possession.html",
  "/aml-checks.html",
  "/mortgages.html",
  "/landlord-insurance.html",
  "/rent-guarantee.html",
];

const publicRoutes = [
  { label: "homepage", route: "/" },
  { label: "index", route: "/index.html" },
  { label: "services", route: "/services.html" },
  ...serviceRoutes.map((route) => ({ label: route.replace(/^\/|\.html$/g, ""), route })),
  { label: "add-property", route: "/add-property.html" },
  { label: "my-properties-empty", route: "/my-properties.html", seed: "empty" },
  { label: "my-properties-one", route: "/my-properties.html", seed: "one" },
  { label: "my-properties-two", route: "/my-properties.html", seed: "two" },
  { label: "contact", route: "/contact.html", optional: true },
  { label: "updates", route: "/updates.html", optional: true },
];

const forbiddenNormalText = /\b(?:quest|journey|route|command centre|prototype|demo|scenario|simulated|canonical|propertyId|renderer|handler|fixture|workspace setup|AI operating system|Journey OS|CMP Labs)\b/i;
const forbiddenPublicText = /\b(?:landlord's quest|start this service route|preview import|portfolio sweep|operating system|will be added|can be connected before launch)\b/i;
const forbiddenReviewText = /\b(?:No automatically found facts|No missing or unknown facts|No extra landlord answers needed|Current subtask|Review Found Data|Confirm Unknowns)\b/i;
const legalOverclaimText = /\b(?:legally verified|guaranteed compliant|compliance guarantee|legal deadline|official approval)\b/i;

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

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function push(assertions, name, pass, detail = "") {
  assertions.push({ name, pass: Boolean(pass), detail: String(detail || "") });
}

function contains(text, pattern) {
  return pattern.test(String(text || ""));
}

function countTerm(text, term) {
  return (String(text || "").match(new RegExp(`\\b${term}\\b`, "gi")) || []).length;
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
    id: "g3-address",
    uprn: "G3-UPRN",
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
      certificate: "G3-EPC",
      source: "Example EPC register match",
    },
    ...overrides,
  };
}

function createProperty(options = {}) {
  const result = bridge.createPropertyRecord(selection(options.selection || {}), {
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    propertyId: options.id || "prop_g3_one",
    journeyContext: {
      entryService: options.entryService || "full_compliance",
      focusMode: options.entryService || "full_compliance",
      isTenanted: "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: options.answeredQuestions || {},
    },
    now: "2026-06-28T09:00:00.000Z",
    randomUUID: () => options.id || "prop-g3-one",
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
    now: "2026-06-28T09:00:00.000Z",
  });
  assert.equal(derived.ok, true, JSON.stringify(derived.errors || []));
  const action = derived.value.actionItems.find((item) => /epc|eicr|electrical|gas/i.test(`${item.title} ${item.reason}`));
  assert.ok(action, "seed property should produce an EPC/EICR/Gas action");
  const options = serviceLifecycle.resolveServiceOptionsForAction(action, property, derived.value);
  assert.equal(options.ok, true, JSON.stringify(options.errors || []));
  assert.ok(options.value[0], "seed action should produce a service option");
  const request = serviceLifecycle.createServiceRequestFromAction(property, action, options.value[0], {
    now: "2026-06-28T09:05:00.000Z",
  });
  assert.equal(request.ok, true, JSON.stringify(request.errors || []));
  return request.value.propertyRecord;
}

function createStore(mode = "one") {
  const store = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-28T09:00:00.000Z" });
  if (mode === "empty") return store;
  const one = mode === "request" ? withPreparedRequest(createProperty({ id: "prop_g3_one" })) : createProperty({ id: "prop_g3_one" });
  store.propertiesById[one.id] = one;
  store.propertyOrder.push(one.id);
  store.lastSelectedPropertyId = one.id;
  if (mode === "two") {
    const two = createProperty({
      id: "prop_g3_two",
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

async function newPage(browser, viewport = desktop) {
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
  page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), method: request.method(), failure: request.failure()?.errorText || "" }));
  page.on("response", (response) => {
    if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
  });
  return { context, page, consoleMessages, pageErrors, failedRequests, badResponses };
}

async function seedStore(page, origin, mode) {
  if (!mode) return;
  await page.goto(`${origin}/index.html`, { waitUntil: "networkidle", timeout: 20000 });
  const store = createStore(mode);
  await page.evaluate(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [publicStorageKey, store]);
}

async function visibleText(page) {
  return (await page.locator("body").innerText({ timeout: 8000 })).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

async function pageMetrics(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const controls = Array.from(document.querySelectorAll("button, a, input, textarea, select"))
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "),
          width: rect.width,
          height: rect.height,
          selector: el.tagName.toLowerCase(),
        };
      });
    const badgeSelectors = ".doc-status, .source-badge, .prototype-badge, .status-pill, .quiet-pill, .section-kicker, .service-status";
    const badges = Array.from(document.querySelectorAll(badgeSelectors))
      .filter(visible)
      .map((el) => {
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
          width: rect.width,
          height: rect.height,
        };
      });
    const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: (el.innerText || "").trim().replace(/\s+/g, " "),
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        };
      });
    const serviceCards = Array.from(document.querySelectorAll(".service-grid-card, .service-card, .service-proof-card"))
      .filter(visible)
      .map((el) => ({
        text: (el.innerText || "").trim().replace(/\s+/g, " "),
        clipped: el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2,
      }));
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
      smallControls: controls.filter((control) => control.text && Math.min(control.width, control.height) < 40),
      badges,
      headings,
      serviceCards,
      sidebarStyles,
      localStorageCount: localStorage.length,
    };
  });
}

function overlappingBadges(metrics) {
  const overlaps = [];
  for (const badge of metrics.badges) {
    for (const heading of metrics.headings) {
      const separate = badge.right <= heading.left || badge.left >= heading.right || badge.bottom <= heading.top || badge.top >= heading.bottom;
      if (!separate) {
        const sameText = badge.text && heading.text && heading.text.includes(badge.text);
        if (!sameText) overlaps.push({ badge: badge.text, heading: heading.text });
      }
    }
  }
  return overlaps;
}

async function scanRoute(browser, origin, entry, viewport = desktop) {
  const { context, page, consoleMessages, pageErrors, failedRequests, badResponses } = await newPage(browser, viewport);
  await seedStore(page, origin, entry.seed);
  await page.goto(`${origin}${entry.route}`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(300);
  const status = page.url().includes(entry.route.replace(/^\//, "")) || entry.route === "/";
  const text = await visibleText(page);
  const metrics = await pageMetrics(page);
  const result = {
    label: entry.label,
    route: entry.route,
    optional: Boolean(entry.optional),
    status,
    text,
    textSample: text.slice(0, 900),
    metrics,
    consoleMessages,
    pageErrors,
    failedRequests: failedRequests.filter((item) => item.url.startsWith(origin)),
    badResponses: badResponses.filter((item) => item.url.startsWith(origin)),
  };
  await context.close();
  return result;
}

async function runAddPropertyReview(browser, origin) {
  const { context, page, consoleMessages, pageErrors, failedRequests, badResponses } = await newPage(browser, desktop);
  await page.goto(`${origin}/add-property.html`, { waitUntil: "networkidle", timeout: 25000 });
  await page.fill("#addPropertyPostcode", "B37 7BA");
  await page.click("#addPropertySearchForm button[type='submit']");
  await page.waitForSelector("[data-use-address]", { timeout: 12000 });
  const addressText = await visibleText(page);
  await page.locator("[data-use-address]").first().click();
  await page.waitForSelector("[data-canonical-review]", { timeout: 12000 });
  await page.waitForTimeout(500);
  const reviewText = await visibleText(page);
  const metrics = await pageMetrics(page);
  const headings = await page.$$eval("[data-canonical-review] h2, [data-canonical-review] h3", (items) => items.map((item) => item.textContent.trim()).filter(Boolean));
  const hooks = await page.evaluate(() => ({
    handoff: document.querySelectorAll("[data-canonical-handoff]").length,
    review: document.querySelectorAll("[data-canonical-review]").length,
  }));
  await context.close();
  return { addressText, reviewText, headings, metrics, hooks, consoleMessages, pageErrors, failedRequests, badResponses };
}

async function runWorkspace(browser, origin, viewport = desktop) {
  const { context, page, consoleMessages, pageErrors, failedRequests, badResponses } = await newPage(browser, viewport);
  await seedStore(page, origin, "request");
  await page.goto(`${origin}/dashboard-labs.html?propertyId=prop_g3_one`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(500);
  const overviewText = await visibleText(page);
  const overviewMetrics = await pageMetrics(page);

  async function clickAndRead(selector) {
    const clicked = await page.evaluate((targetSelector) => {
      const isVisible = (el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };
      const target = Array.from(document.querySelectorAll(targetSelector)).find(isVisible) || document.querySelector(targetSelector);
      if (!target) return false;
      target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    }, selector);
    assert.equal(clicked, true, `Unable to click ${selector}`);
    await page.waitForTimeout(450);
    return { text: await visibleText(page), metrics: await pageMetrics(page) };
  }

  const evidence = await clickAndRead("[data-tab='documents']");
  const actions = await clickAndRead("[data-global-nav='Tasks']");
  const services = await clickAndRead("[data-tab='services']");
  const timeline = await clickAndRead("[data-tab='timeline']");
  const monitoring = await clickAndRead("[data-global-nav='Activity']");
  await page.evaluate(() => {
    document.querySelector("[data-assistant-open]")?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  });
  await page.waitForTimeout(350);
  const askText = await visibleText(page);
  const askMetrics = await pageMetrics(page);
  const hooks = await page.evaluate(() => ({
    primary: document.querySelectorAll("[data-normal-canonical-primary]").length,
    evidence: document.querySelectorAll("[data-portfolio-evidence]").length,
    servicePrimary: document.querySelectorAll("[data-service-primary-body]").length,
    assistant: document.querySelectorAll("[data-assistant-panel]").length,
  }));
  await context.close();
  return {
    overviewText,
    overviewMetrics,
    evidence,
    actions,
    services,
    timeline,
    monitoring,
    askText,
    askMetrics,
    hooks,
    consoleMessages,
    pageErrors,
    failedRequests,
    badResponses,
  };
}

function sourceAssertions(assertions) {
  const diffFiles = changedFiles().filter((file) => !file.startsWith("audit/"));
  const allowed = new Set([
    "landing.css",
    "dashboard-labs.css",
    "public-pages.js",
    "dashboard-labs.html",
    "dashboard-labs.js",
    "tools/cmp-stage-g3-premium-british-landlord-ui-check.mjs",
    "tools/cmp-stage-f-copy-convergence-check.mjs",
    "tools/cmp-stage-g-visual-system-convergence-check.mjs",
    "tools/cmp-stage-g1-final-regression-blockers-check.mjs",
  ]);
  const protectedPatterns = [/^core\//, /^contracts\//, /^schemas?\//, /^netlify\.toml$/, /^package(?:-lock)?\.json$/, /supabase/i, /scenario/i];
  const protectedChanged = diffFiles.filter((file) => protectedPatterns.some((pattern) => pattern.test(file)));
  push(assertions, "Only allowed G.3 product/test files changed", diffFiles.every((file) => allowed.has(file)), diffFiles.join(", "));
  push(assertions, "No protected core/contracts/schema/config/scenario file changed", protectedChanged.length === 0, protectedChanged.join(", "));
  push(assertions, "/Users/davidtaylor/Code/mysite is not the active repo", repoRoot !== "/Users/davidtaylor/Code/mysite", repoRoot);
  push(assertions, "No diff path targets /Users/davidtaylor/Code/mysite", !diffFiles.some((file) => file.includes("/Users/davidtaylor/Code/mysite")), diffFiles.join(", "));

  const publicPages = read("public-pages.js");
  const dashboardHtml = read("dashboard-labs.html");
  const dashboardJs = read("dashboard-labs.js");
  const landingCss = read("landing.css");
  const dashboardCss = read("dashboard-labs.css");
  push(assertions, "Add Property route remains the public entry", /add-property\.html/.test(publicPages), "");
  push(assertions, "Selected workspace route still uses dashboard-labs propertyId handoff", /dashboard-labs\.html\?propertyId=/.test(publicPages) && /propertyId/.test(dashboardJs), "");
  push(assertions, "Canonical data hooks required by earlier stages remain present", /data-canonical-handoff/.test(publicPages) && /data-normal-canonical-primary/.test(dashboardJs) && /data-portfolio-evidence/.test(dashboardHtml) && /data-service-primary-body/.test(dashboardHtml), "");
  push(assertions, "QA/demo controls remain quarantined behind qa-only markup", /data-qa-only hidden/.test(dashboardHtml), "");
  push(assertions, "G.3 CSS exposes premium British landlord tokens", /--cmp-ink/.test(landingCss) && /--workspace-ink/.test(dashboardCss), "missing new colour tokens");
  push(assertions, "G.3 introduces property/document visual motifs without fake official marks", /property-file-visual|document-motif|trust-ledger|service-proof-card/.test(publicPages + landingCss), "missing visual motif classes");
}

function genericRouteAssertions(assertions, result) {
  if (result.optional && result.badResponses.some((item) => item.status === 404)) return;
  const relevantConsoleErrors = result.consoleMessages.filter((item) => item.type === "error" && !/Failed to load resource: the server responded with a status of 404/i.test(item.text));
  push(assertions, `${result.label} has no local console/page errors`, relevantConsoleErrors.length === 0 && result.pageErrors.length === 0, JSON.stringify({ consoleMessages: relevantConsoleErrors, pageErrors: result.pageErrors }));
  push(assertions, `${result.label} has no local 4xx/5xx responses`, result.badResponses.length === 0, JSON.stringify(result.badResponses.slice(0, 4)));
  push(assertions, `${result.label} has no horizontal overflow`, result.metrics.scrollWidth <= result.metrics.innerWidth + 1 && result.metrics.bodyWidth <= result.metrics.innerWidth + 1, `${result.metrics.scrollWidth}/${result.metrics.innerWidth}`);
  push(assertions, `${result.label} hides internal/prototype wording on normal route`, !contains(result.text, forbiddenNormalText), result.text.match(forbiddenNormalText)?.[0] || "");
  push(assertions, `${result.label} avoids legal overclaim`, !contains(result.text, legalOverclaimText), result.text.match(legalOverclaimText)?.[0] || "");
  const lowContrast = result.metrics.badges
    .map((badge) => ({ ...badge, ratio: contrastRatio(badge.color, badge.backgroundColor) }))
    .filter((badge) => badge.text && badge.ratio < 3.2);
  push(assertions, `${result.label} visible badges have readable contrast`, lowContrast.length === 0, JSON.stringify(lowContrast.slice(0, 4)));
  push(assertions, `${result.label} badges do not collide with headings`, overlappingBadges(result.metrics).length === 0, JSON.stringify(overlappingBadges(result.metrics).slice(0, 4)));
}

async function main() {
  assert.ok(fs.existsSync(chromePath), "Google Chrome is required for Stage G.3 rendered checks.");
  const assertions = [];
  const renderedText = [];
  const layoutResults = [];
  const accessibilityResults = [];
  const interactiveResults = [];

  sourceAssertions(assertions);

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    await withStaticServer(async (origin) => {
      const routeResults = [];
      for (const entry of publicRoutes) {
        const result = await scanRoute(browser, origin, entry, desktop);
        routeResults.push(result);
        renderedText.push({ label: result.label, route: result.route, textSample: result.textSample });
        layoutResults.push({ label: result.label, route: result.route, overflow: result.metrics.scrollWidth > result.metrics.innerWidth + 1, serviceCards: result.metrics.serviceCards });
        accessibilityResults.push({ label: result.label, route: result.route, smallControls: result.metrics.smallControls, badges: result.metrics.badges });
        genericRouteAssertions(assertions, result);
      }

      const homepage = routeResults.find((item) => item.label === "homepage");
      const services = routeResults.find((item) => item.label === "services");
      const addInitial = routeResults.find((item) => item.label === "add-property");
      const oneProperty = routeResults.find((item) => item.label === "my-properties-one");
      const twoProperty = routeResults.find((item) => item.label === "my-properties-two");
      const emptyProperty = routeResults.find((item) => item.label === "my-properties-empty");

      push(assertions, "Homepage promise starts with one property", /Check one property/i.test(homepage.text), homepage.textSample);
      push(assertions, "Homepage reassures landlord control", /You stay in control/i.test(homepage.text), homepage.textSample);
      push(assertions, "Homepage states guidance boundary", /Guidance, not legal advice/i.test(homepage.text), homepage.textSample);
      push(assertions, "Homepage states supplier and payment boundary", /No supplier contacted/i.test(homepage.text) && /No payment taken/i.test(homepage.text), homepage.textSample);
      push(assertions, "Homepage no longer reads like a wireframe/principle table", !/principle/i.test(homepage.text) && !/landlord's quest/i.test(homepage.text), homepage.textSample);
      push(assertions, "Public footer no longer exposes launch-incomplete copy", !contains(homepage.text, forbiddenPublicText), homepage.text.match(forbiddenPublicText)?.[0] || "");

      push(assertions, "Services page is practical rather than marketplace-led", /Choose the property job/i.test(services.text) || /Prepare a request/i.test(services.text), services.textSample);
      push(assertions, "Services page includes property-specific categories", /EPC/i.test(services.text) && /Gas Safety/i.test(services.text) && /EICR/i.test(services.text) && /licensing/i.test(services.text) && /damp/i.test(services.text), services.textSample);
      push(assertions, "Services page uses request-preparation CTAs", /Prepare request/i.test(services.text) && !/Start .*route/i.test(services.text), services.textSample);
      push(assertions, "Services cards are not clipped", services.metrics.serviceCards.every((card) => !card.clipped), JSON.stringify(services.metrics.serviceCards.filter((card) => card.clipped).slice(0, 4)));

      push(assertions, "Add Property initial copy starts from one address", /Check one property/i.test(addInitial.text) || /Add one property/i.test(addInitial.text), addInitial.textSample);
      push(assertions, "Add Property initial does not expose Property Brain before property-file setup", !/Property Brain/i.test(addInitial.text), addInitial.textSample);
      push(assertions, "Add Property initial shows control boundaries", /No supplier contacted/i.test(addInitial.text) && /No payment taken/i.test(addInitial.text), addInitial.textSample);
      push(assertions, "Add Property initial avoids staged task labels", !/Current subtask|Subtask|Next step/i.test(addInitial.text), addInitial.textSample);

      const review = await runAddPropertyReview(browser, origin);
      interactiveResults.push({ name: "Add Property review", headings: review.headings, textSample: review.reviewText.slice(0, 1000) });
      push(assertions, "Add Property review keeps canonical review and handoff hooks", review.hooks.review === 1 && review.hooks.handoff === 1, JSON.stringify(review.hooks));
      push(assertions, "Add Property review uses landlord-facing found/needed/action headings", /What CMP found/i.test(review.reviewText) && /What CMP still needs/i.test(review.reviewText) && /What to do next/i.test(review.reviewText), review.headings.join(" | "));
      push(assertions, "Add Property review shows source and confidence near facts", /Source/i.test(review.reviewText) && /Confidence/i.test(review.reviewText), review.reviewText.slice(0, 900));
      push(assertions, "Add Property review removes odd empty system states", !contains(review.reviewText, forbiddenReviewText), review.reviewText.match(forbiddenReviewText)?.[0] || "");
      push(assertions, "Add Property review badges do not collide with headings", overlappingBadges(review.metrics).length === 0, JSON.stringify(overlappingBadges(review.metrics).slice(0, 4)));

      push(assertions, "My Properties empty starts with one-property action", /Add one property/i.test(emptyProperty.text) || /Check one property/i.test(emptyProperty.text), emptyProperty.textSample);
      push(assertions, "My Properties one-property avoids premature portfolio language", !/\bportfolio\b/i.test(oneProperty.text), oneProperty.textSample);
      push(assertions, "My Properties one-property gives a practical next action", /Next action/i.test(oneProperty.text) || /Keep this property ready/i.test(oneProperty.text), oneProperty.textSample);
      push(assertions, "My Properties two-property may compare without Portfolio Sweep", /Compare|properties/i.test(twoProperty.text) && !/Portfolio Sweep/i.test(twoProperty.text), twoProperty.textSample);

      const workspace = await runWorkspace(browser, origin, desktop);
      interactiveResults.push({ name: "Selected workspace", overview: workspace.overviewText.slice(0, 900), services: workspace.services.text.slice(0, 900), ask: workspace.askText.slice(0, 900) });
      push(assertions, "Selected workspace hooks remain present", workspace.hooks.primary === 1 && workspace.hooks.evidence === 1 && workspace.hooks.servicePrimary === 1 && workspace.hooks.assistant === 1, JSON.stringify(workspace.hooks));
      push(assertions, "Workspace overview keeps landlord focused on this property", /this property/i.test(workspace.overviewText) && /Keep this property ready|Next action/i.test(workspace.overviewText), workspace.overviewText.slice(0, 900));
      push(assertions, "Workspace normal states hide internal/prototype wording", !contains(`${workspace.overviewText} ${workspace.evidence.text} ${workspace.actions.text} ${workspace.services.text} ${workspace.timeline.text} ${workspace.monitoring.text} ${workspace.askText}`, forbiddenNormalText), `${workspace.overviewText} ${workspace.evidence.text}`.match(forbiddenNormalText)?.[0] || "");
      const sidebarContrast = workspace.overviewMetrics.sidebarStyles ? contrastRatio(workspace.overviewMetrics.sidebarStyles.navColor, workspace.overviewMetrics.sidebarStyles.sidebarBackground) : 0;
      push(assertions, "Workspace sidebar contrast is strong enough", sidebarContrast >= 4.5, String(sidebarContrast.toFixed(2)));
      push(assertions, "Workspace badges do not collide with headings", overlappingBadges(workspace.overviewMetrics).length === 0, JSON.stringify(overlappingBadges(workspace.overviewMetrics).slice(0, 4)));
      push(assertions, "Evidence Vault remains evidence-focused", /Evidence Vault/i.test(workspace.evidence.text) && /Add evidence|Add proof/i.test(workspace.evidence.text), workspace.evidence.text.slice(0, 900));
      push(assertions, "Evidence Vault avoids storage or legal verification overclaim", !/document stored|upload(?:ed)?\\s+.+\\s+stor(?:ed|age)|legally verified/i.test(workspace.evidence.text), workspace.evidence.text.slice(0, 900));
      push(assertions, "Action Plan owns one or two clear Next action markers", countTerm(workspace.actions.text, "Next action") >= 1 && countTerm(workspace.actions.text, "Next action") <= 2, String(countTerm(workspace.actions.text, "Next action")));
      push(assertions, "Workspace Services preserves supplier/payment boundaries", /No supplier contacted/i.test(workspace.services.text) && /No payment taken/i.test(workspace.services.text), workspace.services.text.slice(0, 900));
      push(assertions, "Timeline is explicitly read-only history", /read-only history/i.test(workspace.timeline.text), workspace.timeline.text.slice(0, 900));
      push(assertions, "Monitoring avoids legal deadline guarantees", /No date confirmed|review date/i.test(workspace.monitoring.text) && !contains(workspace.monitoring.text, legalOverclaimText), workspace.monitoring.text.slice(0, 900));
      push(assertions, "Ask CMP open state repeats guidance boundary", /Guidance, not legal advice/i.test(workspace.askText), workspace.askText.slice(0, 900));

      const mobileHomepage = await scanRoute(browser, origin, { label: "mobile-homepage", route: "/" }, mobile);
      const mobileAdd = await scanRoute(browser, origin, { label: "mobile-add-property", route: "/add-property.html" }, mobile);
      const mobileWorkspace = await runWorkspace(browser, origin, mobile);
      layoutResults.push(
        { label: mobileHomepage.label, route: "/", overflow: mobileHomepage.metrics.scrollWidth > mobileHomepage.metrics.innerWidth + 1 },
        { label: mobileAdd.label, route: "/add-property.html", overflow: mobileAdd.metrics.scrollWidth > mobileAdd.metrics.innerWidth + 1 },
        { label: "mobile-workspace", route: "/dashboard-labs.html?propertyId=prop_g3_one", overflow: mobileWorkspace.overviewMetrics.scrollWidth > mobileWorkspace.overviewMetrics.innerWidth + 1 },
      );
      push(assertions, "Mobile homepage has no horizontal overflow", mobileHomepage.metrics.scrollWidth <= mobileHomepage.metrics.innerWidth + 1, `${mobileHomepage.metrics.scrollWidth}/${mobileHomepage.metrics.innerWidth}`);
      push(assertions, "Mobile Add Property has no horizontal overflow", mobileAdd.metrics.scrollWidth <= mobileAdd.metrics.innerWidth + 1, `${mobileAdd.metrics.scrollWidth}/${mobileAdd.metrics.innerWidth}`);
      push(assertions, "Mobile selected workspace has no horizontal overflow", mobileWorkspace.overviewMetrics.scrollWidth <= mobileWorkspace.overviewMetrics.innerWidth + 1, `${mobileWorkspace.overviewMetrics.scrollWidth}/${mobileWorkspace.overviewMetrics.innerWidth}`);
      push(assertions, "Mobile visible controls are not cramped", mobileHomepage.metrics.smallControls.length === 0 && mobileAdd.metrics.smallControls.length === 0 && mobileWorkspace.overviewMetrics.smallControls.length === 0, JSON.stringify([...mobileHomepage.metrics.smallControls, ...mobileAdd.metrics.smallControls, ...mobileWorkspace.overviewMetrics.smallControls].slice(0, 8)));
      push(assertions, "Mobile normal routes hide internal/prototype wording", !contains(`${mobileHomepage.text} ${mobileAdd.text} ${mobileWorkspace.overviewText}`, forbiddenNormalText), `${mobileHomepage.text} ${mobileAdd.text} ${mobileWorkspace.overviewText}`.match(forbiddenNormalText)?.[0] || "");
    });
  } finally {
    await browser.close();
  }

  const outputs = {
    generatedAt: new Date().toISOString(),
    assertionCount: assertions.length,
    failures: assertions.filter((item) => !item.pass),
    assertions,
    layoutResults,
    renderedText,
    accessibilityResults,
    interactiveResults,
  };

  if (writeAudit) {
    fs.mkdirSync(auditRoot, { recursive: true });
    fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G3_LAYOUT_RESULTS.json"), JSON.stringify(layoutResults, null, 2));
    fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G3_RENDERED_TEXT_SCAN.json"), JSON.stringify(renderedText, null, 2));
    fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G3_ACCESSIBILITY_RESULTS.json"), JSON.stringify(accessibilityResults, null, 2));
    fs.writeFileSync(path.join(auditRoot, "CMP_STAGE_G3_INTERACTIVE_RESULTS.json"), JSON.stringify(interactiveResults, null, 2));
  }

  if (outputs.failures.length) {
    console.error("CMP Stage G.3 premium British landlord UI check failed:");
    for (const failure of outputs.failures) {
      console.error(`- ${failure.name}${failure.detail ? `: ${failure.detail}` : ""}`);
    }
    console.error(`Failed ${outputs.failures.length} of ${assertions.length} assertions.`);
    process.exit(1);
  }

  console.log(`CMP Stage G.3 premium British landlord UI check passed (${assertions.length} assertions).${writeAudit ? " Wrote G.3 audit JSON artifacts." : ""}`);
}

await main();
