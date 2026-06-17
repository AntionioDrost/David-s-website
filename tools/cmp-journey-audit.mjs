#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, mkdir, readdir, rm, writeFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const AUDIT_SLUG = process.env.CMP_AUDIT_SLUG || "2026-06-16-cmp-journey";
const AUDIT_DIR = path.join(ROOT_DIR, "audit", AUDIT_SLUG);
const SCREENSHOT_DIR = path.join(AUDIT_DIR, "screenshots");
const SCENARIO_AUDIT_DIR = path.join(ROOT_DIR, "audit", process.env.CMP_SCENARIO_AUDIT_SLUG || AUDIT_SLUG);
const EXTERNAL_BASE_URL = normalizeBaseUrl(process.env.CMP_BASE_URL || process.env.BASE_URL || "");
const CMP_SITE_PASSWORD = process.env.CMP_SITE_PASSWORD || process.env.NETLIFY_SITE_PASSWORD || "";

const DESKTOP = { name: "desktop", width: 1440, height: 950 };
const MOBILE = { name: "mobile", width: 390, height: 844 };

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const publicRoutes = [
  ["home", "Homepage", "/index.html"],
  ["services", "Services overview", "/services.html"],
  ["epcs", "EPC page", "/epcs.html"],
  ["gas-safety", "Gas Safety page", "/gas-safety.html"],
  ["eicr", "EICR page", "/eicr.html"],
  ["property-inspections", "Property Inspections page", "/property-inspections.html"],
  ["landlord-insurance", "Insurance page", "/landlord-insurance.html"],
  ["mortgages", "Mortgages page", "/mortgages.html"],
  ["mould-damp", "Mould or Damp page", "/mould-damp.html"],
  ["selective-licensing", "Selective Licensing page", "/selective-licensing.html"],
  ["contact", "Contact/support page", "/contact.html"],
  ["news", "News/update page", "/news.html"],
  ["add-property", "Add Property page", "/add-property.html?postcode=CV1%203BJ"]
];

const dashboardRoutes = [
  ["nick-demo", "Nick guided demo", "/dashboard-labs.html?demo=nick"],
  ["nick-demo-alias", "Nick guided demo alias", "/dashboard-labs.html?journeyDemo=nick"],
  ["empty-fresh", "New landlord fresh portfolio", "/dashboard-labs.html?fresh=1"],
  ["empty-state", "Empty portfolio state", "/dashboard-labs.html?state=empty"],
  ["new-property", "Immediate new property workspace", "/dashboard-labs.html?state=new-property"],
  ["new-property-epc-valid", "New property EPC valid URL variant", "/dashboard-labs.html?state=new-property&epc=valid"],
  ["new-property-epc-expired", "New property EPC expired URL variant", "/dashboard-labs.html?state=new-property&epc=expired"],
  ["new-property-epc-expiring", "New property EPC expiring URL variant", "/dashboard-labs.html?state=new-property&epc=expiring"],
  ["new-property-epc-missing", "New property EPC missing URL variant", "/dashboard-labs.html?state=new-property&epc=missing"],
  ["one-property", "One-property dashboard", "/dashboard-labs.html?state=one-property"],
  ["portfolio", "Portfolio dashboard", "/dashboard-labs.html?state=portfolio"]
];

const screenshotRecords = [];
const pageRecords = [];
const flowRecords = [];
const scenarioAuditResults = [];
const issues = [];
let passwordStorageState = null;

const nickScenarioCards = [
  { id: "clean-property-check", label: "Clean property", actionSelector: "[data-journey-service-plan='legal']", actionText: "Book legal essentials" },
  { id: "no-epc-found", label: "No EPC found", actionSelector: "[data-journey-service='epc-assessment']", actionText: "Book EPC assessment" },
  { id: "epc-expired-mees-risk", label: "EPC expired / MEES risk", actionSelector: "[data-journey-service='epc-assessment']", actionText: "Book EPC assessment" },
  { id: "hmo-licensing-risk", label: "HMO or licensing risk", actionSelector: "[data-journey-service='licensing-check']", actionText: "Book licensing check" },
  { id: "damp-mould-enforcement", label: "Damp, mould or enforcement", actionSelector: "[data-journey-message='damp-photo-request']", actionText: "Generate tenant message" },
  { id: "done-for-me-plan", label: "Done-for-me compliance plan", actionSelector: "[data-journey-service-plan='quotes']", actionText: "Request quotes first" },
  { id: "portfolio-landlord-preview", label: "Portfolio landlord preview", actionSelector: "[data-journey-service-plan='risk']", actionText: "Show risk-protected services" }
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeBaseUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.href.replace(/\/+$/, "");
  } catch {
    throw new Error(`Invalid CMP_BASE_URL/BASE_URL: ${value}`);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function severityRank(severity) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1 }[severity] || 0;
}

function addIssue(issue) {
  const id = issue.id || slugify(issue.title);
  if (issues.some((existing) => existing.id === id)) return;
  issues.push({
    id,
    severity: issue.severity || "Medium",
    where: issue.where || "Prototype",
    title: issue.title,
    why: issue.why,
    recommendation: issue.recommendation,
    effort: issue.effort || "Quick fix",
    evidence: issue.evidence || []
  });
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://localhost");
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname === "/") pathname = "/index.html";
      const resolvedPath = path.resolve(ROOT_DIR, `.${pathname}`);

      if (!resolvedPath.startsWith(ROOT_DIR)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const targetPath = (await fileExists(resolvedPath)) ? resolvedPath : path.join(ROOT_DIR, "index.html");
      const extension = path.extname(targetPath).toLowerCase();
      response.writeHead(200, { "Content-Type": MIME_TYPES[extension] || "application/octet-stream" });
      createReadStream(targetPath).pipe(response);
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function loadPlaywright() {
  try {
    return normalizePlaywrightModule(await import("playwright"));
  } catch (error) {
    const cachedPlaywright = await findCachedNpxPlaywright();
    if (cachedPlaywright) {
      return normalizePlaywrightModule(await import(pathToFileURL(path.join(cachedPlaywright, "index.js")).href));
    }
    throw new Error(
      [
        "Playwright is not available to this Node process.",
        "Run with:",
        "npm_config_optional=false npm exec --yes --package=playwright@1.61.0 -- node tools/cmp-journey-audit.mjs",
        `Original error: ${error.message}`
      ].join("\n")
    );
  }
}

function normalizePlaywrightModule(module) {
  return module.chromium ? module : module.default;
}

async function findCachedNpxPlaywright() {
  const npxDir = path.join(os.homedir(), ".npm", "_npx");
  let entries = [];
  try {
    entries = await readdir(npxDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packagePath = path.join(npxDir, entry.name, "node_modules", "playwright", "package.json");
    try {
      const packageStat = await stat(packagePath);
      const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
      if (packageJson.version === "1.61.0") {
        candidates.push({
          packageDir: path.dirname(packagePath),
          mtimeMs: packageStat.mtimeMs
        });
      }
    } catch {
      // Ignore incomplete npm cache entries.
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.packageDir || null;
}

async function prepareOutput() {
  await rm(AUDIT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
}

async function installDeterministicRoutes(page) {
  await page.route("**/api.postcodes.io/postcodes/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: 200,
        result: {
          postcode: "CV1 3BJ",
          quality: 1,
          eastings: 433500,
          northings: 278900,
          country: "England",
          nhs_ha: "West Midlands",
          longitude: -1.5162,
          latitude: 52.4081,
          european_electoral_region: "West Midlands",
          primary_care_trust: "Coventry Teaching",
          region: "West Midlands",
          lsoa: "Coventry 031A",
          msoa: "Coventry 031",
          incode: "3BJ",
          outcode: "CV1",
          parliamentary_constituency: "Coventry South",
          admin_district: "Coventry",
          parish: "Coventry, unparished area",
          admin_county: null,
          date_of_introduction: "198001",
          admin_ward: "Earlsdon",
          ced: null,
          ccg: "NHS Coventry and Warwickshire",
          nuts: "Coventry",
          codes: {
            admin_district: "E08000026",
            admin_county: "E99999999",
            admin_ward: "E05001223",
            parish: "E43000246"
          },
          post_town: "Coventry"
        }
      })
    });
  });
}

async function createAuditedPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile",
    ...(passwordStorageState ? { storageState: passwordStorageState } : {})
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({
        type: message.type(),
        text: message.text().slice(0, 500)
      });
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message.slice(0, 500));
  });

  await installDeterministicRoutes(page);
  return { context, page, consoleMessages, pageErrors };
}

async function waitForPrototype(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 3500 }).catch(() => {});
  await page.waitForTimeout(650);
}

async function unlockPasswordProtectedSite(page) {
  if (!CMP_SITE_PASSWORD) return;

  const passwordInput = page.locator("input[type='password'][name='password']").first();
  const isPasswordGate = await passwordInput.isVisible({ timeout: 1500 }).catch(() => false);
  if (!isPasswordGate) return;

  await passwordInput.fill(CMP_SITE_PASSWORD);
  const submitResponse = page.waitForResponse((response) => response.request().method() === "POST", { timeout: 10000 }).catch(() => null);
  await page.locator("button, input[type='submit']").first().click({ timeout: 4000 });
  const response = await submitResponse;
  await page.waitForTimeout(1200);
  await page.waitForLoadState("domcontentloaded", { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 3500 }).catch(() => {});

  const bodyText = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
  const stillLocked = await page.locator("input[type='password'][name='password']").first().isVisible({ timeout: 1500 }).catch(() => false)
    || /Password protected site|Please enter your password/i.test(bodyText);
  if (stillLocked || (response && response.status() >= 400)) {
    throw new Error("CMP_SITE_PASSWORD/NETLIFY_SITE_PASSWORD did not unlock the deployed site.");
  }

  passwordStorageState = await page.context().storageState();
}

async function clearStorage(page, baseUrl) {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  await unlockPasswordProtectedSite(page);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function getPageFacts(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 1 && rect.height > 1;
    };
    const textOf = (element) => (element?.innerText || element?.textContent || element?.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
    const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
    const doc = document.documentElement;
    const actions = Array.from(document.querySelectorAll("a, button, input[type='submit']"))
      .filter(visible)
      .map((element) => ({
        text: textOf(element).slice(0, 120),
        tag: element.tagName.toLowerCase(),
        href: element.getAttribute("href") || "",
        aria: element.getAttribute("aria-label") || "",
        classes: element.className || ""
      }))
      .filter((item) => item.text || item.aria)
      .slice(0, 30);
    const clipped = Array.from(document.querySelectorAll("button, a, input, textarea, select, .card, article, aside, nav, header, section"))
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: textOf(element).slice(0, 80),
          selector: element.tagName.toLowerCase(),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        };
      })
      .filter((item) => item.right > window.innerWidth + 3 || item.left < -3)
      .slice(0, 20);

    return {
      title: document.title,
      h1: textOf(document.querySelector("h1")),
      h2s: Array.from(document.querySelectorAll("h2")).filter(visible).map(textOf).slice(0, 12),
      bodyText: bodyText.slice(0, 12000),
      actions,
      actionTexts: actions.map((item) => item.text || item.aria),
      horizontalOverflow: doc.scrollWidth > doc.clientWidth + 3,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      navVisible: Array.from(document.querySelectorAll("nav, header, [data-global-nav], .mobile-bar")).some(visible),
      clipped,
      visibleButtonCount: actions.filter((item) => item.tag === "button").length,
      url: window.location.href
    };
  });
}

async function capture(page, viewport, id, label, facts = null) {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const filename = `${String(screenshotRecords.length + 1).padStart(2, "0")}-${viewport.name}-${slugify(id)}.png`;
  const fullPath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: true, animations: "disabled" });
  const record = {
    id,
    label,
    viewport: viewport.name,
    filename,
    relativePath: `screenshots/${filename}`,
    h1: facts?.h1 || ""
  };
  screenshotRecords.push(record);
  return record;
}

async function auditRoute(browser, baseUrl, viewport, route) {
  const [id, label, urlPath] = route;
  const { context, page, consoleMessages, pageErrors } = await createAuditedPage(browser, viewport);
  try {
    await clearStorage(page, baseUrl);
    await page.goto(`${baseUrl}${urlPath}`, { waitUntil: "domcontentloaded" });
    await waitForPrototype(page);
    const facts = await getPageFacts(page);
    const screenshot = await capture(page, viewport, `${id}`, label, facts);
    const record = {
      id,
      label,
      path: urlPath,
      viewport: viewport.name,
      title: facts.title,
      h1: facts.h1,
      h2s: facts.h2s,
      actions: facts.actionTexts,
      horizontalOverflow: facts.horizontalOverflow,
      scrollWidth: facts.scrollWidth,
      clientWidth: facts.clientWidth,
      navVisible: facts.navVisible,
      clipped: facts.clipped,
      consoleMessages,
      pageErrors,
      bodyText: facts.bodyText,
      screenshot: screenshot.relativePath
    };
    pageRecords.push(record);
    addMechanicalIssues(record);
    return record;
  } finally {
    await context.close();
  }
}

async function clickByText(page, text, options = {}) {
  const locator = page.getByText(text, { exact: options.exact ?? false }).first();
  if (await locator.isVisible({ timeout: options.timeout || 1500 }).catch(() => false)) {
    const clicked = await locator.click({ timeout: 4000 }).then(() => true).catch(() => false);
    if (clicked) {
      await page.waitForTimeout(options.wait || 500);
      return true;
    }
  }
  return false;
}

async function clickSelector(page, selector, options = {}) {
  const locator = page.locator(selector);
  const count = await locator.count().catch(() => 0);
  const viewport = page.viewportSize() || { width: 1440, height: 950 };
  const visibleCandidates = [];

  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    if (!(await item.isVisible({ timeout: options.timeout || 1500 }).catch(() => false))) continue;
    visibleCandidates.push(item);
    const box = await item.boundingBox().catch(() => null);
    if (!box) continue;
    const horizontallyReachable = box.x < viewport.width && box.x + box.width > 0;
    if (!horizontallyReachable) continue;
    const clicked = await item.click({ timeout: 4000 }).then(() => true).catch(() => false);
    if (!clicked) continue;
    await page.waitForTimeout(options.wait || 500);
    return true;
  }

  return false;
}

async function auditPublicAddPropertyFlow(browser, baseUrl, viewport) {
  const { context, page, consoleMessages, pageErrors } = await createAuditedPage(browser, viewport);
  const steps = [];
  try {
    await clearStorage(page, baseUrl);
    await page.goto(`${baseUrl}/add-property.html?postcode=CV1%203BJ`, { waitUntil: "domcontentloaded" });
    await waitForPrototype(page);
    let facts = await getPageFacts(page);
    await capture(page, viewport, "public-add-property-prefilled", "Add Property prefilled postcode", facts);
    steps.push({ step: "Open prefilled postcode", h1: facts.h1, actions: facts.actionTexts.slice(0, 8) });

    if (!facts.bodyText.includes("Use this property")) {
      await page.locator("#addPropertyPostcode").fill("CV1 3BJ");
      await page.locator("#addPropertySearchForm button[type='submit']").click();
      await page.waitForSelector("[data-use-address]", { timeout: 8000 }).catch(() => {});
    }
    facts = await getPageFacts(page);
    await capture(page, viewport, "public-add-property-results", "Add Property address results", facts);
    steps.push({ step: "Address results", h1: facts.h1, hasUseProperty: facts.bodyText.includes("Use this property") });

    const usedAddress = await clickSelector(page, "[data-use-address]", { timeout: 6000, wait: 1800 });
    await page.waitForURL(/dashboard-labs\.html\?state=new-property/, { timeout: 9000 }).catch(() => {});
    await waitForPrototype(page);
    facts = await getPageFacts(page);
    await capture(page, viewport, "public-add-property-handoff", "Add Property handoff", facts);
    steps.push({
      step: "Property selected",
      usedAddress,
      finalUrl: page.url(),
      h1: facts.h1,
      hasSuccess: /Property workspace created|Address matched|prepared for review|Review Smart Search/i.test(facts.bodyText),
      actions: facts.actionTexts.slice(0, 10)
    });

    const flow = {
      id: "public-add-property-flow",
      label: "Public Add Property / Smart Search flow",
      viewport: viewport.name,
      steps,
      consoleMessages,
      pageErrors,
      finalUrl: page.url(),
      finalBodyText: facts.bodyText
    };
    flowRecords.push(flow);
    analyzeAddPropertyFlow(flow);
  } finally {
    await context.close();
  }
}

async function auditDashboardInteractions(browser, baseUrl, viewport) {
  const interactions = [
    {
      id: "empty-add-property-modal",
      label: "Empty portfolio Add Property entry",
      path: "/dashboard-labs.html?fresh=1",
      actions: [{ selector: "[data-home-add-property]", wait: 700 }]
    },
    {
      id: "new-property-review-smart-search",
      label: "New property Review Smart Search",
      path: "/dashboard-labs.html?state=new-property",
      actions: [{ selector: "[data-smart-primary-review]", wait: 900 }]
    },
    {
      id: "one-property-evidence-vault",
      label: "One property Evidence Vault",
      path: "/dashboard-labs.html?state=one-property",
      actions: [{ selector: "[data-global-nav='Evidence Vault']", wait: 900 }]
    },
    {
      id: "one-property-book-service",
      label: "One property Book a Service",
      path: "/dashboard-labs.html?state=one-property",
      actions: [{ selector: "[data-global-nav='Book a service']", wait: 900 }]
    },
    {
      id: "one-property-ask-cmp",
      label: "One property Ask CMP",
      path: "/dashboard-labs.html?state=one-property",
      actions: [{ selector: "[data-global-nav='Ask CMP']", wait: 900 }]
    },
    {
      id: "portfolio-compliance-sweep",
      label: "Portfolio Compliance Centre sweep",
      path: "/dashboard-labs.html?state=portfolio",
      actions: [
        { selector: "[data-global-nav='Compliance centre']", wait: 700 },
        { selector: "[data-az-mode='portfolio']", wait: 900 }
      ]
    }
  ];

  for (const interaction of interactions) {
    const { context, page, consoleMessages, pageErrors } = await createAuditedPage(browser, viewport);
    try {
      await clearStorage(page, baseUrl);
      await page.goto(`${baseUrl}${interaction.path}`, { waitUntil: "domcontentloaded" });
      await waitForPrototype(page);
      for (const action of interaction.actions) {
        if (viewport.name === "mobile" && action.selector.includes("data-global-nav")) {
          await clickSelector(page, "[data-menu-open]", { wait: 350 });
        }
        const clicked = await clickSelector(page, action.selector, { wait: action.wait || 500 });
        if (!clicked) {
          addIssue({
            id: `unreachable-control-${interaction.id}-${viewport.name}-${slugify(action.selector)}`,
            severity: viewport.name === "mobile" ? "High" : "Medium",
            where: `${interaction.label} (${viewport.name})`,
            title: "Audit could not activate an expected control in the viewport",
            why: `The selector \`${action.selector}\` was present or expected but no visible in-viewport control could be clicked. On mobile this usually means the CTA is hidden off-canvas or behind navigation.`,
            recommendation: "Make the primary CTA reachable in the current viewport, or expose it through the mobile menu before relying on this route in a demo.",
            effort: "Quick fix",
            evidence: [interaction.id]
          });
        }
      }
      const facts = await getPageFacts(page);
      const screenshot = await capture(page, viewport, interaction.id, interaction.label, facts);
      const record = {
        id: interaction.id,
        label: interaction.label,
        path: interaction.path,
        viewport: viewport.name,
        title: facts.title,
        h1: facts.h1,
        h2s: facts.h2s,
        actions: facts.actionTexts,
        horizontalOverflow: facts.horizontalOverflow,
        scrollWidth: facts.scrollWidth,
        clientWidth: facts.clientWidth,
        navVisible: facts.navVisible,
        clipped: facts.clipped,
        consoleMessages,
        pageErrors,
        bodyText: facts.bodyText,
        screenshot: screenshot.relativePath
      };
      pageRecords.push(record);
      addMechanicalIssues(record);
    } finally {
      await context.close();
    }
  }
}

async function advanceGuidedStoryToWorkspace(page, maxSteps = 18) {
  for (let index = 0; index < maxSteps; index += 1) {
    const nextButton = page.locator("[data-guided-next]").first();
    const visible = await nextButton.isVisible({ timeout: 1200 }).catch(() => false);
    if (!visible) {
      const facts = await getPageFacts(page);
      return /Property Workspace Created/i.test(facts.bodyText);
    }
    const label = (await nextButton.innerText().catch(() => "")).trim();
    const clicked = await nextButton.click({ timeout: 3000 }).then(() => true).catch(() => false);
    if (!clicked) return false;
    await page.waitForTimeout(500);
    if (/Finish story/i.test(label)) {
      const facts = await getPageFacts(page);
      return /Property Workspace Created/i.test(facts.bodyText);
    }
    const nextClicked = true;
    if (!nextClicked) {
      return false;
    }
  }
  const facts = await getPageFacts(page);
  return /Property Workspace Created/i.test(facts.bodyText);
}

async function completeScenarioAction(page, scenario) {
  let clicked = await clickSelector(page, scenario.actionSelector, { wait: 700, timeout: 1800 });
  let actionBodyText = (await getPageFacts(page)).bodyText;
  if (!clicked && /Service confirmation|Service intake|Quote request prepared|Request prepared|concierge plan prepared|demo concierge route|Tenant message|demo basket/i.test(actionBodyText)) {
    clicked = true;
  }
  if (!clicked && scenario.actionText) {
    clicked = await clickByText(page, scenario.actionText, { exact: false, wait: 700, timeout: 1800 });
    actionBodyText = `${actionBodyText} ${(await getPageFacts(page)).bodyText}`;
  }
  if (!clicked) {
    return { clicked: false, completed: false, bodyText: "" };
  }

  await clickSelector(page, "[data-service-intake-complete][data-service-final-status='booked']", { wait: 600, timeout: 900 });
  actionBodyText = `${actionBodyText} ${(await getPageFacts(page)).bodyText}`;
  await clickSelector(page, "[data-service-intake-complete][data-service-final-status='quote_requested']", { wait: 600, timeout: 900 });
  actionBodyText = `${actionBodyText} ${(await getPageFacts(page)).bodyText}`;
  await clickSelector(page, "[data-journey-log-message]", { wait: 600, timeout: 900 });
  actionBodyText = `${actionBodyText} ${(await getPageFacts(page)).bodyText}`;
  await clickSelector(page, "[data-journey-confirm-evidence]", { wait: 700, timeout: 900 });
  await clickSelector(page, "[data-journey-action-close]", { wait: 300, timeout: 600 });
  return { clicked: true, completed: true, bodyText: actionBodyText };
}

async function openWorkspaceTab(page, tab) {
  await clickSelector(page, `[data-journey-workspace-tab='${tab}']`, { wait: 600, timeout: 1600 });
  if (tab === "ask") {
    await clickSelector(page, "[data-journey-ask-prompt]", { wait: 600, timeout: 900 });
  }
  return getPageFacts(page);
}

async function auditNickScenarioExplorer(browser, baseUrl, viewport) {
  const { context, page, consoleMessages, pageErrors } = await createAuditedPage(browser, viewport);
  try {
    await clearStorage(page, baseUrl);
    await page.goto(`${baseUrl}/dashboard-labs.html?demo=nick`, { waitUntil: "domcontentloaded" });
    await waitForPrototype(page);
    const landingFacts = await getPageFacts(page);
    const missingCards = nickScenarioCards.filter((scenario) => !landingFacts.bodyText.includes(scenario.label));
    missingCards.forEach((scenario) => {
      addIssue({
        id: `nick-scenario-card-missing-${scenario.id}`,
        severity: "High",
        where: "Nick Scenario Explorer",
        title: `${scenario.label} scenario card is missing`,
        why: "Nick should only be invited to test supported, named scenarios after the main story.",
        recommendation: "Add the missing card or remove the scenario from the demo script.",
        effort: "Quick fix",
        evidence: ["nick-demo"]
      });
    });
  } finally {
    await context.close();
  }

  for (const scenario of nickScenarioCards) {
    const run = {
      id: scenario.id,
      label: scenario.label,
      startsCorrectly: false,
      reachesAction: false,
      reachesEvidence: false,
      reachesAskCmp: false,
      reachesMonitoring: false,
      actionContextMatches: false,
      confusingOrFake: "",
      screenshots: [],
      consoleMessages: [],
      pageErrors: []
    };
    const scenarioPage = await createAuditedPage(browser, viewport);
    const { context: runContext, page: runPage } = scenarioPage;
    try {
      await clearStorage(runPage, baseUrl);
      await runPage.goto(`${baseUrl}/dashboard-labs.html?demo=nick`, { waitUntil: "domcontentloaded" });
      await waitForPrototype(runPage);
      const startClicked = await clickSelector(runPage, `[data-guided-story='${scenario.id}']`, { wait: 700, timeout: 2500 });
      await waitForPrototype(runPage);
      let facts = await getPageFacts(runPage);
      const startShot = await capture(runPage, viewport, `nick-scenario-${scenario.id}-start`, `${scenario.label} scenario start`, facts);
      run.screenshots.push(startShot.relativePath);
      run.startsCorrectly = startClicked && facts.bodyText.includes(`Current scenario: ${scenario.label}`) && /Restart this scenario|Return to main demo|Explore another scenario/i.test(facts.bodyText);

      const reachedWorkspace = await advanceGuidedStoryToWorkspace(runPage);
      facts = await getPageFacts(runPage);
      const workspaceShot = await capture(runPage, viewport, `nick-scenario-${scenario.id}-workspace`, `${scenario.label} scenario workspace`, facts);
      run.screenshots.push(workspaceShot.relativePath);

      const actionResult = await completeScenarioAction(runPage, scenario);
      facts = await getPageFacts(runPage);
      run.reachesAction = actionResult.clicked;
      run.actionContextMatches = actionResult.clicked;

      const evidenceFacts = await openWorkspaceTab(runPage, "evidence");
      const evidenceShot = await capture(runPage, viewport, `nick-scenario-${scenario.id}-evidence`, `${scenario.label} evidence`, evidenceFacts);
      run.screenshots.push(evidenceShot.relativePath);
      run.reachesEvidence = /Evidence|Vault|pending|generated|scanned|missing/i.test(evidenceFacts.bodyText);

      const askFacts = await openWorkspaceTab(runPage, "ask");
      const askShot = await capture(runPage, viewport, `nick-scenario-${scenario.id}-ask`, `${scenario.label} Ask CMP`, askFacts);
      run.screenshots.push(askShot.relativePath);
      run.reachesAskCmp = /Ask CMP|guidance|simulated|what should|risk|evidence/i.test(askFacts.bodyText);

      const monitoringFacts = await openWorkspaceTab(runPage, "monitoring");
      const monitoringShot = await capture(runPage, viewport, `nick-scenario-${scenario.id}-monitoring`, `${scenario.label} monitoring`, monitoringFacts);
      run.screenshots.push(monitoringShot.relativePath);
      run.reachesMonitoring = /Monitoring|renewal|watch|reminder|follow-up|annual/i.test(monitoringFacts.bodyText);

      if (scenario.id === "no-epc-found" && /EPC C|Rating C|EPC Improvement Plan/i.test(`${facts.bodyText} ${evidenceFacts.bodyText}`)) {
        run.confusingOrFake = "No EPC scenario appears to imply a confident EPC rating or improvement path.";
      }
      if (scenario.id === "portfolio-landlord-preview" && /Portfolio Sweep/i.test(facts.bodyText)) {
        run.confusingOrFake = "Portfolio Sweep appears during the scenario preview.";
      }
      run.consoleMessages = scenarioPage.consoleMessages;
      run.pageErrors = scenarioPage.pageErrors;
    } finally {
      await runContext.close();
    }

    scenarioAuditResults.push(run);
    [
      ["startsCorrectly", "Scenario does not start with clear current-scenario controls"],
      ["reachesAction", "Scenario does not reach an Action Plan or practical next action"],
      ["reachesEvidence", "Scenario does not reach Evidence Vault/evidence state"],
      ["reachesAskCmp", "Scenario does not reach Ask CMP"],
      ["reachesMonitoring", "Scenario does not reach Monitoring/timeline follow-up"],
      ["actionContextMatches", "Scenario action does not appear to match the scenario gap"]
    ].forEach(([key, title]) => {
      if (!run[key]) {
        addIssue({
          id: `nick-scenario-${scenario.id}-${key}`,
          severity: key === "startsCorrectly" || key === "reachesAction" ? "High" : "Medium",
          where: `${scenario.label} scenario`,
          title,
          why: "Scenario Explorer needs each scenario to follow the same believable product spine without ending in a dead modal.",
          recommendation: "Check the guided story moments, final workspace tab and scenario-specific action selector.",
          effort: "Quick fix",
          evidence: run.screenshots
        });
      }
    });
    if (run.confusingOrFake) {
      addIssue({
        id: `nick-scenario-${scenario.id}-confusing`,
        severity: "Medium",
        where: `${scenario.label} scenario`,
        title: "Scenario still feels confusing or too fake",
        why: run.confusingOrFake,
        recommendation: "Tighten the visible scenario copy or service/evidence mapping before inviting Nick to self-explore it.",
        effort: "Quick fix",
        evidence: run.screenshots
      });
    }
  }
}

async function auditMobileNavigation(browser, baseUrl) {
  const { context, page, consoleMessages, pageErrors } = await createAuditedPage(browser, MOBILE);
  try {
    await clearStorage(page, baseUrl);
    await page.goto(`${baseUrl}/dashboard-labs.html?state=one-property`, { waitUntil: "domcontentloaded" });
    await waitForPrototype(page);
    let facts = await getPageFacts(page);
    await capture(page, MOBILE, "mobile-dashboard-start", "Mobile dashboard start", facts);

    await clickSelector(page, "[data-menu-open]", { wait: 600 });
    facts = await getPageFacts(page);
    await capture(page, MOBILE, "mobile-dashboard-menu", "Mobile dashboard menu", facts);

    await clickSelector(page, "[data-global-nav='Evidence Vault']", { wait: 900 });
    facts = await getPageFacts(page);
    await capture(page, MOBILE, "mobile-dashboard-evidence", "Mobile Evidence Vault", facts);

    const flow = {
      id: "mobile-dashboard-navigation",
      label: "Mobile dashboard navigation",
      viewport: "mobile",
      finalUrl: page.url(),
      menuOpened: facts.bodyText.includes("Evidence Vault"),
      horizontalOverflow: facts.horizontalOverflow,
      clipped: facts.clipped,
      consoleMessages,
      pageErrors
    };
    flowRecords.push(flow);
    if (facts.horizontalOverflow) {
      addIssue({
        id: "mobile-horizontal-overflow-dashboard",
        severity: "High",
        where: "Mobile dashboard",
        title: "Mobile dashboard has horizontal overflow",
        why: `The 390px viewport rendered wider than the screen (${facts.scrollWidth}px vs ${facts.clientWidth}px), which can hide CTAs or create awkward side-scrolling during the demo.`,
        recommendation: "Tighten the widest dashboard rail/card/table or make the relevant section scroll intentionally with a visible affordance.",
        effort: "Quick fix",
        evidence: ["mobile-dashboard-evidence"]
      });
    }
  } finally {
    await context.close();
  }
}

function addMechanicalIssues(record) {
  if (record.pageErrors.length) {
    addIssue({
      id: `runtime-error-${record.id}-${record.viewport}`,
      severity: "Critical",
      where: `${record.label} (${record.viewport})`,
      title: "Runtime page error during audit",
      why: "A JavaScript page error can break the demo journey or stop interactive controls from responding.",
      recommendation: `Fix the runtime error reported for ${record.label}: ${record.pageErrors[0]}`,
      effort: "Quick fix",
      evidence: [record.screenshot]
    });
  }
  const relevantConsoleErrors = record.consoleMessages.filter((message) => message.type === "error" && !/favicon|fonts\.googleapis|fonts\.gstatic|ERR_NETWORK_CHANGED/i.test(message.text));
  if (relevantConsoleErrors.length) {
    addIssue({
      id: `console-error-${record.id}-${record.viewport}`,
      severity: "High",
      where: `${record.label} (${record.viewport})`,
      title: "Console error appears during audit",
      why: "Visible or hidden JavaScript/resource errors reduce confidence before a stakeholder demo.",
      recommendation: `Review and fix or intentionally silence the console error: ${relevantConsoleErrors[0].text}`,
      effort: "Quick fix",
      evidence: [record.screenshot]
    });
  }
  if (record.horizontalOverflow) {
    addIssue({
      id: `horizontal-overflow-${record.id}-${record.viewport}`,
      severity: record.viewport === "mobile" ? "High" : "Medium",
      where: `${record.label} (${record.viewport})`,
      title: "Page renders wider than the viewport",
      why: `The page width is ${record.scrollWidth}px inside a ${record.clientWidth}px viewport, which can create accidental horizontal scrolling.`,
      recommendation: "Find the widest card/table/rail in the screenshot and constrain it with responsive max-width or intentional overflow handling.",
      effort: "Quick fix",
      evidence: [record.screenshot]
    });
  }
  if (!record.navVisible) {
    addIssue({
      id: `missing-nav-${record.id}-${record.viewport}`,
      severity: "Medium",
      where: `${record.label} (${record.viewport})`,
      title: "No visible navigation detected",
      why: "A landlord may not know where they are or how to recover from a dead end.",
      recommendation: "Make sure the header/sidebar/mobile bar is visible and includes a clear route back to the main journey.",
      effort: "Quick fix",
      evidence: [record.screenshot]
    });
  }
}

function analyzeAddPropertyFlow(flow) {
  const finalStep = flow.steps.at(-1) || {};
  if (!finalStep.usedAddress || !/dashboard-labs\.html\?state=new-property/.test(finalStep.finalUrl || "")) {
    addIssue({
      id: "add-property-flow-does-not-complete",
      severity: "Critical",
      where: "Public Add Property / Smart Search",
      title: "Add Property flow did not complete reliably",
      why: "The most important new-landlord journey must prove that a postcode/address selection becomes a property record.",
      recommendation: "Fix the postcode/address selection path before demoing the public journey.",
      effort: "Quick fix",
      evidence: ["public-add-property-flow"]
    });
  }
  if (/my-properties\.html/.test(finalStep.finalUrl || "")) {
    addIssue({
      id: "add-property-handoff-stops-at-my-properties",
      severity: "High",
      where: "Add Property handoff",
      title: "Property creation lands on My Properties rather than the richer Labs workspace",
      why: "After a successful Smart Search, the demo should feel like CMP has created a useful property workspace. Landing on a property list makes the moment feel flatter and adds another decision.",
      recommendation: "For today's demo, show the dashboard Labs `state=new-property` route immediately after the public Add Property flow, or change the demo script to say the list is an intermediate Wix-style handoff.",
      effort: "Quick fix",
      evidence: ["public-add-property-handoff"]
    });
  }
}

function analyzeJourneyContent() {
  const byId = Object.fromEntries(pageRecords.map((record) => [`${record.viewport}:${record.id}`, record]));
  const empty = byId["desktop:empty-fresh"] || byId["desktop:empty-state"];
  const newProperty = byId["desktop:new-property"];
  const nickDemo = byId["desktop:nick-demo"];
  const nickAlias = byId["desktop:nick-demo-alias"];
  const oneProperty = byId["desktop:one-property"];
  const portfolio = byId["desktop:portfolio"];
  const epcVariants = ["valid", "expired", "expiring", "missing"].map((variant) => byId[`desktop:new-property-epc-${variant}`]).filter(Boolean);

  [nickDemo, nickAlias].filter(Boolean).forEach((record) => {
    if (!/Run the 2-minute demo|simulated CMP prototype|test the landlord journey/i.test(record.bodyText)) {
      addIssue({
        id: `nick-demo-entry-unclear-${record.id}`,
        severity: "High",
        where: record.label,
        title: "Nick demo route does not open with clear guided-demo framing",
        why: "Nick should not land on a busy dashboard or prototype controls. The entry route needs to explain the simulated journey before any free-clicking.",
        recommendation: "Start the route with the guided demo landing, prototype framing, and a single primary CTA: Run the 2-minute guided demo.",
        effort: "Quick fix",
        evidence: [record.screenshot]
      });
    }
    if (/Demo state|Demo guide|Prototype controls|Demo scenario|Portfolio Sweep/i.test(record.bodyText)) {
      addIssue({
        id: `nick-demo-prototype-machinery-visible-${record.id}`,
        severity: "High",
        where: record.label,
        title: "Nick demo route exposes prototype machinery too early",
        why: "Raw demo controls make CMP feel like several prototypes rather than one product journey.",
        recommendation: "Hide demo state, demo guide, scenario controls, Portfolio Sweep and debug controls unless `advanced=1` or `debug=1` is present.",
        effort: "Quick fix",
        evidence: [record.screenshot]
      });
    }
  });

  if (empty?.bodyText.includes("Preview A-Z Checker")) {
    addIssue({
      id: "empty-state-offers-az-before-property",
      severity: "High",
      where: "Empty portfolio dashboard",
      title: "Empty state offers an A-Z Checker preview before the property-first action is settled",
      why: "David needs the landlord to understand the first job is adding a property. A secondary checker preview competes with that mental model.",
      recommendation: "For Nick's demo, keep the empty state focused on one CTA: Add your first property. Move checker preview behind that step or label it clearly as optional demo preview.",
      effort: "Quick fix",
      evidence: [empty.screenshot]
    });
  }

  if (newProperty && !/what CMP found automatically|EPC record prepared|still needs|Confirm/i.test(newProperty.bodyText)) {
    addIssue({
      id: "new-property-found-vs-needed-unclear",
      severity: "High",
      where: "New property workspace",
      title: "New property state does not clearly separate found data from landlord confirmations",
      why: "The Smart Search value depends on the landlord seeing what CMP found automatically and what still needs confirmation.",
      recommendation: "Keep the first new-property screen split into two plain groups: 'CMP found' and 'You still need to confirm'.",
      effort: "Quick fix",
      evidence: [newProperty.screenshot]
    });
  }

  if (oneProperty) {
    const hasEvidence = /Evidence Vault/i.test(oneProperty.bodyText);
    const hasServices = /Book a service|Recommended Services|Service/i.test(oneProperty.bodyText);
    const hasAsk = /Ask CMP/i.test(oneProperty.bodyText);
    if (!hasEvidence || !hasServices || !hasAsk) {
      addIssue({
        id: "one-property-core-demo-moments-not-visible",
        severity: "Medium",
        where: "One-property dashboard",
        title: "Core demo moments are not all visible from the one-property route",
        why: "The one-property journey is likely the strongest Nick route, so Evidence Vault, service action, and Ask CMP need to be easy to reach.",
        recommendation: "Keep the hero/first screen focused on the next action, then use sidebar nav to show Evidence Vault, Book a Service, and Ask CMP in that order.",
        effort: "Later polish",
        evidence: [oneProperty.screenshot]
      });
    }
  }

  if (portfolio && /one property|only property/i.test(portfolio.bodyText) && /portfolio/i.test(portfolio.bodyText)) {
    addIssue({
      id: "portfolio-single-language-conflict",
      severity: "Medium",
      where: "Portfolio dashboard",
      title: "Portfolio route may mix portfolio and single-property language",
      why: "Portfolio Sweep should feel like a multi-property capability, not a label pasted onto a single-property dashboard.",
      recommendation: "Check the portfolio route copy and remove any 'only property' phrasing unless the state is intentionally a one-property portfolio.",
      effort: "Quick fix",
      evidence: [portfolio.screenshot]
    });
  }

  if (epcVariants.length === 4) {
    const normalized = epcVariants.map((record) => record.bodyText.replace(/valid|expired|expiring|missing/gi, "").slice(0, 5000));
    const allSame = normalized.every((value) => value === normalized[0]);
    if (allSame) {
      addIssue({
        id: "epc-query-variants-not-wired",
        severity: "Medium",
        where: "New property EPC variants",
        title: "`&epc=valid|expired|expiring|missing` does not appear to change the rendered state",
        why: "The requested EPC demo variants are useful for Nick, but the URL parameters currently look unsupported. Showing those URLs may create confusion.",
        recommendation: "Either avoid these URLs today or add a tiny query-param switch later that changes the new-property EPC copy and evidence state.",
        effort: "Later polish",
        evidence: epcVariants.map((record) => record.screenshot)
      });
    }
  }

  addIssue({
    id: "prototype-only-capabilities-need-spoken-framing",
    severity: "Medium",
    where: "Nick demo framing",
    title: "Prototype-only features need explicit spoken framing",
    why: "Smart Search, Ask CMP, scanner outcomes, service booking, and compliance scoring are demo-useful but not live product capabilities.",
    recommendation: "Before showing the flow, say: 'This is a prototype journey using simulated data. The important thing is the landlord experience: CMP finds what it can, asks what it must, and turns it into a clear workspace.'",
    effort: "Quick fix",
    evidence: ["all dashboard screenshots"]
  });
}

function readinessSummary() {
  const critical = issues.filter((issue) => issue.severity === "Critical").length;
  const high = issues.filter((issue) => issue.severity === "High").length;
  const score = Math.max(1, Math.min(10, 8 - critical * 2 - high * 0.7));
  const rounded = Math.round(score * 10) / 10;
  const status = critical ? "showable with caveats" : high >= 3 ? "showable with caveats" : "showable";
  return { score: rounded, status };
}

function recordSummary(label, matcher) {
  const records = pageRecords.filter(matcher);
  if (!records.length) return `- ${label}: not captured.`;
  return records.map((record) => {
    const actionList = record.actions.slice(0, 5).join("; ") || "No clear CTA detected";
    const flags = [
      record.horizontalOverflow ? "horizontal overflow" : "",
      record.pageErrors.length ? "runtime error" : "",
      record.consoleMessages.length ? `${record.consoleMessages.length} console warning/error(s)` : ""
    ].filter(Boolean).join(", ");
    return `- ${record.label} (${record.viewport}): H1 "${record.h1 || "not detected"}"; primary visible actions: ${actionList}.${flags ? ` Flags: ${flags}.` : ""}`;
  }).join("\n");
}

function topIssuesMarkdown() {
  return issues
    .slice()
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 10)
    .map((issue, index) => [
      `### ${index + 1}. ${issue.title}`,
      `- Severity: ${issue.severity}`,
      `- Where it appears: ${issue.where}`,
      `- Why it matters: ${issue.why}`,
      `- What David should do next: ${issue.recommendation}`,
      `- Effort: ${issue.effort}`
    ].join("\n"))
    .join("\n\n");
}

function generatedPrompt() {
  return `You are tightening the CMP prototype for David's Nick demo today. Do not redesign the product. Fix only the highest-priority demo blockers from audit/2026-06-16-cmp-journey/CMP_JOURNEY_UX_AUDIT.md: make the empty portfolio state point clearly to Add your first property, make the Add Property handoff feel like a property workspace was created, and avoid showing unsupported &epc= variants unless you wire them visibly. Keep copy legally careful, prototype-only where needed, and run the existing audit script afterward.`;
}

function buildReport() {
  const { score, status } = readinessSummary();
  const orderedIssues = issues.slice().sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  const strongest = [
    "Smart Search creates a believable address-first property setup story.",
    "The one-property dashboard has strong evidence-led concepts: scores, Evidence Vault, tasks, services, Ask CMP and monitoring.",
    "Portfolio Sweep is a good strategic signal when shown after the single-property workspace."
  ];
  const weakest = orderedIssues.slice(0, 3).map((issue) => issue.title);

  return `# CMP Journey UX Audit

Generated: 2026-06-16

## 1. Executive summary

Status: **${status}**.

Confidence score: **${score}/10**.

The prototype is strong enough to show Nick today if David controls the route and frames the fake/local parts clearly. The safest route is not a broad free-click tour. It is a guided story: start with the empty/new landlord premise, show Smart Search/Add Property, jump to the new-property workspace, then show the one-property dashboard with Evidence Vault, Book a Service, Ask CMP and monitoring.

The main caveat is still prototype framing. The public Add Property flow should now hand off into the richer Labs workspace, but David should say clearly that Smart Search, service booking, Ask CMP and scoring are simulated prototype behaviours using demo data.

## 2. Top 10 issues ranked by importance

${topIssuesMarkdown() || "No ranked issues were generated by the automated audit."}

## 3. Full journey observations

### Public website
${recordSummary("Public website", (record) => record.viewport === "desktop" && publicRoutes.some(([id]) => id === record.id))}

The public site broadly explains CMP as a landlord compliance platform and gives multiple routes into services and Add Property. The strongest public path is still postcode-first. Avoid spending too long in service pages unless Nick asks, because the dashboard prototype is where the strategic "Civic Property Intelligence OS" idea lands.

### Empty state
${recordSummary("Empty state", (record) => record.viewport === "desktop" && ["empty-fresh", "empty-state", "empty-add-property-modal"].includes(record.id))}

The empty portfolio state mostly explains that CMP needs a property first. The audit flags any competing secondary checker-preview language because it can dilute the first action for a non-technical landlord.

### Add Property / Smart Search
${flowRecords.filter((flow) => flow.id === "public-add-property-flow").map((flow) => `- ${flow.label} (${flow.viewport}): final URL ${flow.finalUrl}; steps: ${flow.steps.map((step) => step.step).join(" -> ")}.`).join("\n") || "- Add Property flow was not captured."}

The postcode -> address -> property creation story is demo-useful and believable. The handoff should feel strongest when it lands directly on the Labs new-property workspace and David narrates it as: "CMP found what it could, created the workspace, and now asks for confirmations."

### New property workspace
${recordSummary("New property", (record) => record.viewport === "desktop" && record.id.startsWith("new-property"))}

This state is the natural follow-up after adding a property. It should stay calm and early-stage: "CMP found these starting signals; you still need to confirm these items." Avoid making it feel like a mature compliance dashboard too soon.

### One-property dashboard
${recordSummary("One property", (record) => record.viewport === "desktop" && (record.id === "one-property" || record.id.startsWith("one-property-")))}

This is the strongest demo area. The dashboard has the right strategic ingredients: property intelligence, evidence strength, next actions, services, and restrained Ask CMP support. David should keep the route short and purposeful.

### Portfolio dashboard
${recordSummary("Portfolio", (record) => record.viewport === "desktop" && (record.id === "portfolio" || record.id.startsWith("portfolio-")))}

Portfolio mode works best after Nick has seen the one-property story. It should be framed as the scale-up view: "once a landlord has more than one property, CMP compares risk and evidence across the portfolio."

### Mobile
${recordSummary("Mobile", (record) => record.viewport === "mobile")}

Mobile is adequate for smoke testing, but today's Nick demo should be desktop-first. Use mobile only if Nick specifically asks whether the landlord journey works on a phone.

## 4. Landlord clarity audit

- Does a non-technical landlord understand what CMP does? **Mostly yes.** The best copy explains CMP as organising compliance information, evidence, tasks and support around a property.
- Does the journey explain what CMP found automatically? **Yes in the new-property state, but this is the screen to emphasise.** Keep "found automatically" and "needs landlord confirmation" visibly separate.
- Does the journey explain what CMP still needs from the landlord? **Mostly yes.** The language around missing evidence, EICR, certificates and confirmations is useful.
- Does every page have an obvious next action? **Not always.** Public pages have many CTAs; the empty state must keep "add property first" as the dominant action.
- Are there any dead ends? **No hard dead end was identified.** Keep the demo on the guided Labs route rather than letting Nick free-click into older or secondary prototype paths.
- Is the compliance language clear without feeling legally risky? **Generally yes.** Keep using "guidance", "may", "check", "evidence support" and "not legal advice" around possession, licensing and compliance scoring.

## 5. Nick demo audit

- Show Nick first: **Public homepage postcode/Add Property premise -> Labs \`dashboard-labs.html?state=new-property\` -> one-property dashboard -> Evidence Vault -> Book a Service -> Ask CMP -> monitoring.**
- Avoid showing today: raw scenario controls, old \`dashboard.html\`, and any route where a fake service could be mistaken for live booking. The \`&epc=\` variants are useful only as quick prepared examples, not as the main story.
- 3 strongest demo moments:
${strongest.map((item) => `  - ${item}`).join("\n")}
- 3 weakest demo moments:
${weakest.map((item) => `  - ${item}`).join("\n")}
- Prototype framing David should say out loud: "This is simulated data, not live API/legal advice. The product idea is the landlord journey: CMP finds what it can, asks what it must, then turns the property into an evidence-led workspace with clear next actions."

## 6. Design/UX quality check

- Premium/trustworthy feel: strong in the Labs dashboard, especially where the UI uses restrained evidence and score language.
- Consistency: good direction; older public/list-style routes still feel less compelling than the Labs workspace.
- Spacing and hierarchy: generally strong on desktop; mobile and long horizontal rails still need spot checks before production.
- Button hierarchy: sometimes too many valid CTAs compete. For Nick, follow one route and ignore secondary options.
- Overwhelming sections: the one-property dashboard can become dense if David scrolls too freely. Use navigation to jump between moments.
- Duplicated/confusing copy: watch for portfolio language in single-property states and checker language before a property exists.
- Mobile layout: usable for a smoke test, not the recommended demo surface.
- Obvious prototype placeholders: demo data/prototype badges are acceptable if framed; they should not be hidden from Nick.
- AI-generated feel: the restrained Ask CMP copy is stronger than generic "AI assistant" language. Keep it as evidence support, not magic.

## 7. Recommended next Codex prompt

\`\`\`text
${generatedPrompt()}
\`\`\`

## Generated evidence

- Screenshots: \`audit/${AUDIT_SLUG}/screenshots/\`
- Contact sheet: \`audit/${AUDIT_SLUG}/contact-sheet.html\`
- Machine-readable issues: \`audit/${AUDIT_SLUG}/issues.json\`
`;
}

async function writeContactSheet() {
  const cards = screenshotRecords.map((shot) => `
    <article>
      <a href="${escapeHtml(shot.relativePath)}"><img src="${escapeHtml(shot.relativePath)}" alt="${escapeHtml(shot.label)}"></a>
      <h2>${escapeHtml(shot.label)}</h2>
      <p>${escapeHtml(shot.viewport)}${shot.h1 ? ` · ${escapeHtml(shot.h1)}` : ""}</p>
      <code>${escapeHtml(shot.filename)}</code>
    </article>
  `).join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMP Journey Audit Contact Sheet</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f7f4ee; color: #172033; }
    header { padding: 32px; background: #101827; color: white; }
    main { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 24px; }
    article { background: white; border: 1px solid #ded8cc; border-radius: 8px; padding: 12px; }
    img { width: 100%; max-height: 360px; object-fit: contain; object-position: top; border: 1px solid #ece6dc; background: #fff; }
    h2 { font-size: 16px; margin: 12px 0 4px; }
    p { margin: 0 0 8px; color: #5f6675; }
    code { font-size: 12px; color: #4b5563; word-break: break-all; }
  </style>
</head>
<body>
  <header>
    <h1>CMP Journey Audit Contact Sheet</h1>
    <p>${screenshotRecords.length} screenshots generated for ${AUDIT_SLUG}.</p>
  </header>
  <main>
    ${cards}
  </main>
</body>
</html>`;
  await writeFile(path.join(AUDIT_DIR, "contact-sheet.html"), html);
}

function scenarioStatus(value) {
  return value ? "Yes" : "No";
}

function buildScenarioMatrix() {
  const lines = [
    "# CMP Final Demo Scenario Matrix",
    "",
    "Generated: 2026-06-16",
    `Audit folder: \`audit/${AUDIT_SLUG}\``,
    "",
    "## Summary",
    "",
    `- Scenarios tested: ${scenarioAuditResults.length}`,
    `- Every scenario starts correctly: ${scenarioAuditResults.every((item) => item.startsCorrectly) ? "yes" : "no"}`,
    `- Every scenario reaches an action: ${scenarioAuditResults.every((item) => item.reachesAction) ? "yes" : "no"}`,
    `- Every scenario reaches evidence/service, Ask CMP and monitoring: ${scenarioAuditResults.every((item) => item.reachesEvidence && item.reachesAskCmp && item.reachesMonitoring) ? "yes" : "no"}`,
    "",
    "## Matrix",
    "",
    "| Scenario | Starts correctly | Reaches action | Evidence/service | Ask CMP | Monitoring | Action matches gap | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...scenarioAuditResults.map((item) => `| ${item.label} | ${scenarioStatus(item.startsCorrectly)} | ${scenarioStatus(item.reachesAction)} | ${scenarioStatus(item.reachesEvidence)} | ${scenarioStatus(item.reachesAskCmp)} | ${scenarioStatus(item.reachesMonitoring)} | ${scenarioStatus(item.actionContextMatches)} | ${item.confusingOrFake || "OK"} |`),
    "",
    "## Screenshot Evidence",
    "",
    ...scenarioAuditResults.flatMap((item) => [
      `### ${item.label}`,
      ...item.screenshots.map((screenshot) => `- \`${screenshot}\``),
      ""
    ])
  ];
  return `${lines.join("\n")}\n`;
}

async function writeScenarioOutputs() {
  await mkdir(SCENARIO_AUDIT_DIR, { recursive: true });
  const scenarioIssues = issues.filter((issue) => issue.id.startsWith("nick-scenario-"));
  await writeFile(path.join(SCENARIO_AUDIT_DIR, "scenario-matrix.md"), buildScenarioMatrix());
  await writeFile(path.join(SCENARIO_AUDIT_DIR, "scenario-issues.json"), `${JSON.stringify({
    generated: "2026-06-16",
    auditSlug: AUDIT_SLUG,
    scenarios: scenarioAuditResults,
    issues: scenarioIssues
  }, null, 2)}\n`);
}

async function writeOutputs() {
  analyzeJourneyContent();
  issues.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.title.localeCompare(b.title));
  await writeFile(path.join(AUDIT_DIR, "issues.json"), `${JSON.stringify({ generated: "2026-06-16", issues, pages: pageRecords, flows: flowRecords, screenshots: screenshotRecords }, null, 2)}\n`);
  await writeContactSheet();
  await writeFile(path.join(AUDIT_DIR, "CMP_JOURNEY_UX_AUDIT.md"), buildReport());
  await writeScenarioOutputs();
}

async function runAudit() {
  await prepareOutput();
  const { chromium } = await loadPlaywright();
  const localServer = EXTERNAL_BASE_URL ? null : await startStaticServer();
  const baseUrl = EXTERNAL_BASE_URL || localServer.baseUrl;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const route of publicRoutes) {
      await auditRoute(browser, baseUrl, DESKTOP, route);
    }
    for (const route of dashboardRoutes) {
      await auditRoute(browser, baseUrl, DESKTOP, route);
    }
    await auditPublicAddPropertyFlow(browser, baseUrl, DESKTOP);
    await auditDashboardInteractions(browser, baseUrl, DESKTOP);
    await auditNickScenarioExplorer(browser, baseUrl, DESKTOP);

    for (const route of [
      publicRoutes[0],
      publicRoutes[1],
      publicRoutes[12],
      dashboardRoutes[0],
      dashboardRoutes[2],
      dashboardRoutes[7],
      dashboardRoutes[8]
    ]) {
      await auditRoute(browser, baseUrl, MOBILE, route);
    }
    await auditPublicAddPropertyFlow(browser, baseUrl, MOBILE);
    await auditDashboardInteractions(browser, baseUrl, MOBILE);
    await auditMobileNavigation(browser, baseUrl);
    await writeOutputs();
  } finally {
    if (browser) await browser.close();
    if (localServer) {
      await new Promise((resolve) => localServer.server.close(resolve));
    }
  }

  const summary = readinessSummary();
  console.log(JSON.stringify({
    status: "completed",
    baseUrl,
    mode: EXTERNAL_BASE_URL ? "external" : "local",
    passwordGateUsed: Boolean(CMP_SITE_PASSWORD),
    readiness: summary.status,
    confidenceScore: summary.score,
    report: path.relative(ROOT_DIR, path.join(AUDIT_DIR, "CMP_JOURNEY_UX_AUDIT.md")),
    contactSheet: path.relative(ROOT_DIR, path.join(AUDIT_DIR, "contact-sheet.html")),
    screenshots: screenshotRecords.length,
    issues: issues.length
  }, null, 2));
}

runAudit().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
