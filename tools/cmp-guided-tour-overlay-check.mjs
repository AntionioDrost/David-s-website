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

async function isAboveFold(locator, viewportHeight = 950) {
  const box = await locator.boundingBox();
  return Boolean(box && box.y >= 0 && box.y + Math.min(box.height, 80) <= viewportHeight);
}

async function startMainDemo(page, baseUrl) {
  await openNick(page, baseUrl);
  const startCta = page.getByRole("button", { name: /Start guided property check/i });
  assert(await startCta.isVisible(), "Nick demo intro should show Start guided property check.");
  assert(await isAboveFold(startCta), "Nick demo intro CTA should be visible above the fold.");
  await startCta.click();
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
  await page.locator("[data-guided-target='open-action-plan']").click();

  await page.locator("[data-guided-section-target='actionPlan']").waitFor({ timeout: 5000 });
  assert(/CMP turns evidence gaps into prioritised next steps|CMP prioritises gaps first/i.test(await bodyText(page)), "Action Plan needs a section explainer before the CTA.");
  assert(await page.locator("[data-guided-target='action-plan-primary']").isVisible(), "Recommended Action Plan CTA should be highlighted.");
  assert(await page.locator(".journey-service-card").count() <= 1, "Strict guided Action Plan should not dump the full service catalogue.");

  await page.locator("[data-guided-target='action-plan-primary']").click();
  await page.locator("[data-guided-target='service-confirm-evidence']").waitFor({ timeout: 5000 });
  const modalButton = page.locator("[data-guided-target='service-confirm-evidence']").first();
  const contrast = await modalButton.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, background: styles.backgroundColor };
  });
  assert(contrast.color !== contrast.background, "Service confirmation primary next step should have readable contrast.");
  assert(/View Evidence Vault/i.test(await modalButton.innerText()), "Service confirmation should have a clear View Evidence Vault next step.");

  await modalButton.click();
  await page.locator("[data-guided-section-target='evidence']").waitFor({ timeout: 5000 });
  assert(await page.locator("[data-guided-target='evidence-gap']").isVisible(), "Evidence Vault should have a focused guided target.");
  assert(/Evidence pending|Proof needed|No document has been uploaded/i.test(await bodyText(page)), "Evidence labels should be landlord-friendly.");

  await page.getByRole("button", { name: /^Ask CMP$/i }).click();
  await page.locator("[data-guided-section-target='ask']").waitFor({ timeout: 5000 });
  assert(await page.locator("[data-guided-target='ask-prompt']").isVisible(), "Ask CMP should have a focused prompt target.");
  await page.locator("[data-guided-target='ask-prompt']").click();

  await page.getByRole("button", { name: /^Monitoring$/i }).click();
  await page.locator("[data-guided-section-target='monitoring']").waitFor({ timeout: 5000 });
  assert(await page.locator("[data-guided-target='monitoring-item']").isVisible(), "Monitoring should have a focused guided item.");

  await page.getByRole("button", { name: /Explore another scenario/i }).click();
  assert(/Done-for-me compliance plan|Damp, mould or enforcement/i.test(await bodyText(page)), "Scenario Explorer should appear after the main spine is taught.");
}

async function runGuideAndArrowChecks(page, baseUrl) {
  await startMainDemo(page, baseUrl);
  const guide = page.locator("[data-demo-guide-character]").first();
  await guide.waitFor({ timeout: 5000 });
  assert(await guide.locator(".cmp-demo-guide-icon").count() > 0, "Macaw should appear as a compact demo guide icon.");
  const iconBox = await guide.locator(".cmp-demo-guide-icon").first().boundingBox();
  assert(Boolean(iconBox && iconBox.width <= 64 && iconBox.height <= 64), "Compact guide icon should stay small.");
  assert(await page.locator(".cmp-demo-guide-bubble").count() === 0, "Demo Theatre should use one coach surface, not a separate macaw speech bubble.");
  assert(await page.locator(".journey-demo-coachmark [data-demo-guide-character]").count() > 0, "Macaw badge should be integrated inside the local coach card.");

  await page.goto(`${baseUrl}/dashboard-labs.html`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  assert(await page.locator("[data-demo-guide-character]").count() === 0, "Macaw guide should not appear in normal dashboard mode.");

  await openNick(page, baseUrl);
  const arrowVisible = await page.locator("[data-demo-target-arrow]").first().getAttribute("data-arrow-visible").catch(() => "false");
  assert(arrowVisible !== "true", "Arrow should hide when no reliable target geometry is available.");
}

async function runDemoTheatreChecks(page, baseUrl) {
  await openNick(page, baseUrl);
  assert(/Start with one property/i.test(await bodyText(page)), "Intro should lead with the Demo Theatre property-first headline.");
  assert(/Simulated demo data · no live lookup · no supplier contacted · not legal advice/i.test(await bodyText(page)), "Prototype caveat should be compact on the intro.");
  assert(await page.locator("[data-demo-theatre-spine]").isVisible(), "Intro should show the visual product spine.");
  assert(await page.locator("[data-demo-simulation-lab]").isVisible(), "Scenario Explorer should be presented as a Simulation Lab.");

  await startMainDemo(page, baseUrl);
  await page.locator("[data-demo-rail-state='locked']").waitFor({ timeout: 5000 });
  assert(/Ask CMP unlocks after the property profile is built/i.test(await bodyText(page)), "Right rail should be quiet before Ask CMP matters.");

  const targetBox = await page.locator("[data-guided-target]").first().boundingBox();
  const dockBox = await page.locator(".journey-guided-presenter").first().boundingBox();
  assert(Boolean(targetBox && dockBox), "Progress dock and first target should be measurable.");
  const overlaps = !(dockBox.x + dockBox.width < targetBox.x || targetBox.x + targetBox.width < dockBox.x || dockBox.y + dockBox.height < targetBox.y || targetBox.y + targetBox.height < dockBox.y);
  assert(!overlaps, "Progress dock should not overlap the highlighted product target.");

  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click();
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").waitFor({ timeout: 5000 });
  assert(/Build Property Intelligence/i.test(await bodyText(page)), "Use guided demo answers should land on the build step, not deep dashboard state.");
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-demo-intelligence-diagram]").waitFor({ timeout: 5000 });
  assert(/Found records/i.test(await bodyText(page)) && /Property Compliance Profile/i.test(await bodyText(page)), "Build Property Intelligence should show the input-to-profile diagram.");

  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  await page.locator("[data-guided-target='open-action-plan']").click();
  await page.locator("[data-demo-next-best-action]").waitFor({ timeout: 5000 });
  assert(await page.locator("[data-demo-next-best-action] [data-guided-target='action-plan-primary']").isVisible(), "Action Plan should use a guided Next Best Action layout with one primary CTA.");

  await page.locator("[data-guided-target='action-plan-primary']").click();
  await page.locator("[data-guided-target='service-confirm-evidence']").waitFor({ timeout: 5000 });
  await page.locator("[data-guided-target='service-confirm-evidence']").click();
  await page.locator("[data-demo-evidence-trail]").waitFor({ timeout: 5000 });
  assert(/Proof needed/i.test(await bodyText(page)) && /Monitoring active/i.test(await bodyText(page)), "Evidence Vault should show a demo evidence trail.");

  await page.locator("[data-journey-workspace-tab-link='ask']").first().click();
  await page.locator("[data-demo-rail-state='active']").waitFor({ timeout: 5000 });
  assert(await page.locator(".assistant-rail [data-guided-target='ask-prompt']").isVisible(), "Ask CMP step should expand the rail and spotlight one prompt there.");
}

async function runMobileCheck(page, baseUrl) {
  await page.setViewportSize({ width: 390, height: 844 });
  await openNick(page, baseUrl);
  const startCta = page.getByRole("button", { name: /Start guided property check/i });
  assert(await isAboveFold(startCta, 844), "Mobile intro should show the primary CTA quickly.");
  await startCta.click();
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= viewportWidth + 1, "390px mobile should not have horizontal overflow.");
  const fabVisible = await page.locator(".assistant-fab").evaluate((element) => getComputedStyle(element).display !== "none").catch(() => false);
  assert(!fabVisible, "Strict guided mobile should hide the assistant FAB when it competes.");
  const arrowVisible = await page.locator("[data-demo-target-arrow]").first().getAttribute("data-arrow-visible").catch(() => "false");
  assert(arrowVisible !== "true", "390px mobile should hide arrows unless geometry is tight and reliable.");

  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click();
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  await page.locator("[data-guided-target='open-action-plan']").click();
  await page.locator("[data-guided-section-target='actionPlan']").waitFor({ timeout: 5000 });
  assert(!(await page.evaluate(() => document.body.classList.contains("assistant-open"))), "Strict guided mobile Action Plan should not leave the Ask CMP drawer open.");
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
    await runDemoTheatreChecks(page, baseUrl);
    await page.setViewportSize({ width: 1440, height: 950 });
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
