#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const AUDIT_DIR = path.join(ROOT_DIR, "audit", "2026-06-17-cmp-guided-demo-stabilised");
const MAIN_DEMO_RE = /Start first property walkthrough/i;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
      const { readFile } = await import("node:fs/promises");
      const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
      if (packageJson.version === "1.61.0") {
        candidates.push({ packageDir: path.dirname(packagePath), mtimeMs: packageStat.mtimeMs });
      }
    } catch {
      // Ignore partial npm cache entries.
    }
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.packageDir || null;
}

async function loadPlaywright() {
  try {
    return normalizePlaywrightModule(await import("playwright"));
  } catch (error) {
    const cachedPlaywright = await findCachedNpxPlaywright();
    if (cachedPlaywright) {
      return normalizePlaywrightModule(await import(pathToFileURL(path.join(cachedPlaywright, "index.js")).href));
    }
    throw error;
  }
}

async function openNick(page, baseUrl, query = "demo=nick") {
  await page.goto(`${baseUrl}/dashboard-labs.html?${query}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function bodyText(page) {
  return page.locator("body").innerText();
}

async function screenshot(page, name) {
  await mkdir(AUDIT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(AUDIT_DIR, `${name}.png`), fullPage: true });
}

async function runMainWalkthrough(page, baseUrl) {
  await openNick(page, baseUrl);
  await screenshot(page, "01-intro");
  await page.getByRole("button", { name: MAIN_DEMO_RE }).click();
  await screenshot(page, "02-check-my-property");
  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await screenshot(page, "03-run-simulated-auto-checks");
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click({ timeout: 6000 });
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await screenshot(page, "04-unknown-question");
  await page.evaluate(() => {
    window.__cmpDemoTest?.answerUnknown?.("occupancy", "occupied", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("propertyType", "flat", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("occupants", "oneTwo", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("gas", "yes", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("eicr", "noProof", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("alarms", "tested", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("deposit", "noProof", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("tenancyDocs", "noProof");
  });
  await page.locator("[data-journey-condition-toggle='none']").waitFor({ timeout: 5000 });
  await page.locator("[data-journey-condition-toggle='none']").first().click();
  await screenshot(page, "05-condition-none-selected");
  const conditionButton = page.locator("[data-journey-condition-submit]");
  assert(/Continue with no known issues/i.test(await conditionButton.innerText()), "Condition None submit button should use no-known-issues copy.");
  await conditionButton.click();
  await page.locator("[data-guided-target='recommended-answer']").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await screenshot(page, "06-build-property-intelligence");
  await page.locator("[data-guided-target='open-workspace']").waitFor({ timeout: 5000 });
  await page.locator("[data-guided-target='open-workspace']").click();
  await page.locator("[data-guided-target='workspace-tab-compliance']").waitFor({ timeout: 5000 });
  await screenshot(page, "07-overview-tab");
  await page.locator("[data-guided-target='workspace-tab-compliance']").click();
  await page.locator("[data-guided-target='workspace-tab-evidence']").waitFor({ timeout: 5000 });
  await screenshot(page, "08-compliance-tab");
  await page.locator("[data-guided-target='workspace-tab-evidence']").click();
  await page.locator("[data-guided-target='workspace-tab-services']").waitFor({ timeout: 5000 });
  await screenshot(page, "09-evidence-tab");
  await page.locator("[data-guided-target='workspace-tab-services']").click();
  await page.locator("[data-guided-target='workspace-tab-timeline']").waitFor({ timeout: 5000 });
  await screenshot(page, "10-services-tab");
  await page.locator("[data-guided-target='workspace-tab-timeline']").click();
  await page.locator("[data-guided-target='workspace-tab-ask']").waitFor({ timeout: 5000 });
  await screenshot(page, "11-timeline-tab");
  await page.locator("[data-guided-target='workspace-tab-ask']").click();
  await page.locator("[data-guided-target='ask-prompt']").click();
  await page.waitForTimeout(120);
  const askHistoryLength = await page.evaluate(() => window.__cmpDemoTest?.state?.().askHistory?.length || 0);
  assert(askHistoryLength > 0, "Ask CMP should record a response from the same property context.");
  await screenshot(page, "12-ask-cmp-tab");
  await page.getByRole("button", { name: /Open Monitoring/i }).click();
  await page.locator("[data-guided-target='monitoring-item']").waitFor({ timeout: 5000 });
  await screenshot(page, "13-monitoring-tab");
  await page.locator("[data-guided-target='monitoring-item']").click();
  await page.getByRole("button", { name: /Try another landlord situation/i }).waitFor({ timeout: 5000 });
  await screenshot(page, "14-scenario-explorer");
}

async function runScenarioSmoke(page, baseUrl, title) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Try another landlord situation/i }).click();
  const card = page.locator("[data-guided-scenario-card]").filter({ hasText: title }).first();
  assert(await card.isVisible(), `${title} scenario card should be visible.`);
  await card.getByRole("button", { name: /Try this scenario/i }).click();
  await page.locator("[data-guided-target='start-check']").waitFor({ timeout: 5000 });
  assert(/Check My Property/i.test(await page.locator("[data-guided-target='start-check']").innerText()), `${title} should start on the product action path.`);
}

async function runMobileCheck(page, baseUrl) {
  await page.setViewportSize({ width: 390, height: 844 });
  await openNick(page, baseUrl);
  await screenshot(page, "15-mobile-intro");
  await page.getByRole("button", { name: MAIN_DEMO_RE }).click();
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= viewportWidth + 1, "390px mobile should not create horizontal overflow.");
  const arrowCount = await page.locator("[data-demo-target-arrow]").count();
  assert(arrowCount === 0, "390px mobile should not render guided arrows.");
  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click({ timeout: 6000 });
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await screenshot(page, "16-mobile-unknown-question");
  await page.evaluate(() => {
    window.__cmpDemoTest?.answerUnknown?.("occupancy", "occupied", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("propertyType", "flat", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("occupants", "oneTwo", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("gas", "yes", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("eicr", "noProof", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("alarms", "tested", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("deposit", "noProof", { silent: true });
    window.__cmpDemoTest?.answerUnknown?.("tenancyDocs", "noProof");
  });
  await page.locator("[data-journey-condition-toggle='none']").first().click();
  await page.locator("[data-journey-condition-submit]").click();
  await page.locator("[data-guided-target='recommended-answer']").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-workspace']").click();
  await page.locator("[data-guided-target='workspace-tab-compliance']").waitFor({ timeout: 5000 });
  await screenshot(page, "17-mobile-workspace-section");
}

async function run() {
  const { chromium } = await loadPlaywright();
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await runMainWalkthrough(page, baseUrl);
    await runScenarioSmoke(page, baseUrl, "Done-for-me compliance plan");
    await runScenarioSmoke(page, baseUrl, "Damp, mould or enforcement");
    await runMobileCheck(page, baseUrl);
    assert(consoleErrors.length === 0, `Console errors should not be emitted: ${consoleErrors.join(" | ")}`);
    console.log(JSON.stringify({ status: "passed", baseUrl, auditDir: AUDIT_DIR }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
