#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const MAIN_DEMO_RE = /Start landlord compliance journey/i;

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
  } catch {
    const cachedPlaywright = await findCachedNpxPlaywright();
    if (cachedPlaywright) {
      return normalizePlaywrightModule(await import(pathToFileURL(path.join(cachedPlaywright, "index.js")).href));
    }
    throw new Error("Playwright is not available.");
  }
}

async function openNick(page, baseUrl, query = "demo=nick") {
  await page.goto(`${baseUrl}/dashboard-labs.html?${query}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function bodyText(page) {
  return page.locator("body").innerText();
}

async function state(page) {
  return page.evaluate(() => window.__cmpDemoTest?.state?.());
}

async function highlightedTargetText(page) {
  const target = page.locator("[data-guided-target]").first();
  await target.waitFor({ timeout: 5000 });
  return (await target.innerText()).replace(/\s+/g, " ").trim();
}

async function startMainDemo(page, baseUrl) {
  await openNick(page, baseUrl);
  assert(await page.getByRole("button", { name: MAIN_DEMO_RE }).isVisible(), "dashboard-labs.html?demo=nick should load the landlord compliance journey.");
  await page.getByRole("button", { name: MAIN_DEMO_RE }).click();
}

async function reachUnknowns(page, baseUrl) {
  await startMainDemo(page, baseUrl);
  assert(/Check My Property/i.test(await highlightedTargetText(page)), "First real target should be Check My Property.");
  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  assert(/Run simulated auto checks/i.test(await highlightedTargetText(page)), "Second real target should be Run simulated auto checks.");
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click({ timeout: 6000 });
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await page.locator("[data-guided-target='recommended-answer']").waitFor({ timeout: 5000 });
}

async function clickRecommendedUnknown(page) {
  const before = await state(page);
  const beforeAnswers = Object.keys(before.answers || {}).length;
  const target = page.locator("[data-guided-target='recommended-answer']").first();
  await target.click();
  const after = await state(page);
  if (after?.screen === "unknowns" && before?.unknownIndex === after.unknownIndex) {
    const conditionSubmit = page.locator("[data-journey-condition-submit]").first();
    if (await conditionSubmit.isVisible().catch(() => false)) {
      await conditionSubmit.click();
    }
  }
  await page.waitForTimeout(80);
  const next = await state(page);
  assert(Object.keys(next.answers || {}).length <= beforeAnswers + 1, "Only one unknown answer should be added per click.");
  return next;
}

async function runUnknownChecks(page, baseUrl) {
  await reachUnknowns(page, baseUrl);
  assert(await page.locator(".journey-choice.is-guided-soft-locked, [data-guided-soft-locked]").count() > 0, "Strict guided mode should soft-lock non-recommended answers.");
  assert(await page.locator("[data-guided-unlock]").isVisible(), "Unlock all choices should be available.");
  assert(await page.locator("[data-guided-use-demo-answers]").isVisible(), "Use guided demo answers should be available.");

  const softLocked = page.locator("[data-guided-soft-locked]").first();
  await softLocked.click();
  assert(/To keep this scenario on track/i.test(await bodyText(page)), "Soft-locked answers should explain how to stay on path.");

  let current = await clickRecommendedUnknown(page);
  assert(current.screen === "unknowns", "First unknown answer must not skip straight to workspace.");
  assert(!["brain", "actionPlan", "workspace"].includes(current.screen), "First unknown answer must not jump to a deep dashboard state.");
  assert(current.unknownIndex > 0, "Unknown questions should advance sequentially.");
  assert(await page.locator(".journey-answer-chip").count() === Object.keys(current.answers || {}).length, "Answers so far should only show chosen answers.");

  current = await clickRecommendedUnknown(page);
  assert(current.screen === "unknowns", "Second unknown answer should remain in the unknown sequence.");
  assert(await page.locator(".journey-answer-chip").count() === Object.keys(current.answers || {}).length, "Answer pills should continue to match actual answers.");

  await page.locator("[data-guided-unlock]").click();
  assert(await page.locator("[data-guided-soft-locked]").count() === 0, "Unlock all choices should remove strict answer locking.");

  await reachUnknowns(page, baseUrl);
  await page.locator("[data-guided-use-demo-answers]").click();
  const shortcutState = await state(page);
  assert(shortcutState.screen === "unknowns", "Use guided demo answers should not jump into the dashboard.");
  assert(shortcutState.unknownIndex >= 10, "Use guided demo answers should complete remaining unknowns.");
  assert(await page.locator("[data-guided-target='build-brain']").isVisible(), "Shortcut should land on Build Property Intelligence.");
}

async function runSectionChecks(page, baseUrl) {
  await reachUnknowns(page, baseUrl);
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  assert(/Compliance Analysis/i.test(await bodyText(page)), "Compliance Analysis should appear after unknowns.");
  assert(/Found records|Landlord answers|Evidence gaps/i.test(await bodyText(page)), "Compliance Analysis should explain inputs.");
  assert(await page.locator("[data-demo-coachmark]").count() === 1, "Only one tooltip should be visible in guided mode.");

  await page.locator("[data-guided-target='open-action-plan']").click();
  await page.locator("[data-guided-target='action-plan-primary']").waitFor({ timeout: 5000 });
  assert(/Urgent actions \/ legal blockers|Expiring soon|Missing evidence|Future risks|Opportunities and improvements/i.test(await bodyText(page)), "Action Plan should use master journey buckets.");
  assert(await page.locator("[data-demo-coachmark]").count() === 1, "Only one tooltip should be visible on Action Plan.");

  await page.locator("[data-guided-target='action-plan-primary']").click();
  await page.locator("[data-guided-target='take-action-primary']").waitFor({ timeout: 5000 });
  assert(/Take Action|Prepare service request|Ask CMP|Set reminders/i.test(await bodyText(page)), "Take Action should show structured support options.");
  assert(await page.locator("[data-demo-coachmark]").count() === 1, "Only one tooltip should be visible on Take Action.");

  await page.locator("[data-guided-target='take-action-primary']").click();
  assert(await page.locator("[data-guided-target='monitoring-item']").isVisible(), "Monitoring should have a focused guided item.");
  assert(/CMP keeps this property watched|Expiry monitoring|Law change monitoring|Evidence monitoring|Property change monitoring/i.test(await bodyText(page)), "Monitoring should be the final value moment.");

  await page.locator("[data-guided-target='monitoring-item']").click();
  assert(/Done-for-me compliance plan|Damp, mould or enforcement/i.test(await bodyText(page)), "Scenario Explorer should appear after the main spine is taught.");
}

async function runGuideAndArrowChecks(page, baseUrl) {
  await startMainDemo(page, baseUrl);
  const guide = page.locator("[data-demo-coachmark]").first();
  await guide.waitFor({ timeout: 5000 });
  assert(await page.locator("[data-demo-coachmark]").count() === 1, "Only one guide tooltip should be visible.");
  assert(await guide.locator("[data-demo-macaw-badge]").count() === 1, "Macaw should appear as a badge inside the tooltip.");
  assert(await page.locator("[data-demo-guide-character]").count() === 0, "Macaw should not appear as a separate speech bubble.");
  const iconBox = await guide.locator("[data-demo-macaw-badge]").first().boundingBox();
  assert(Boolean(iconBox && iconBox.width <= 64 && iconBox.height <= 64), "Compact guide icon should stay small.");

  await page.goto(`${baseUrl}/dashboard-labs.html`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  assert(await page.locator("[data-demo-coachmark]").count() === 0, "Macaw guide should not appear in normal dashboard mode.");

  await openNick(page, baseUrl);
  assert(await page.locator("[data-demo-target-arrow]").count() === 0, "Guided demo should not render arrow elements.");
}

async function runMobileCheck(page, baseUrl) {
  await page.setViewportSize({ width: 390, height: 844 });
  await startMainDemo(page, baseUrl);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= viewportWidth + 1, "390px mobile should not have horizontal overflow.");
  assert(await page.locator("[data-demo-target-arrow]").count() === 0, "390px mobile should not render guided arrows.");

  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click();
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  assert(!(await page.evaluate(() => document.body.classList.contains("assistant-open"))), "Strict guided mobile journey should not leave the Ask CMP drawer open.");
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
    await runUnknownChecks(page, baseUrl);
    await page.setViewportSize({ width: 1440, height: 950 });
    await runSectionChecks(page, baseUrl);
    await page.setViewportSize({ width: 1440, height: 950 });
    await runGuideAndArrowChecks(page, baseUrl);
    await runMobileCheck(page, baseUrl);
    assert(consoleErrors.length === 0, `Console errors should not be emitted: ${consoleErrors.join(" | ")}`);
    console.log(JSON.stringify({ status: "passed", baseUrl }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
