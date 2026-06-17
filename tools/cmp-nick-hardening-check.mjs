#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
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
  if (!condition) {
    throw new Error(message);
  }
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
  const { readdir } = await import("node:fs/promises");
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

async function text(page) {
  return page.locator("body").innerText();
}

async function openNick(page, baseUrl, query = "demo=nick") {
  await page.goto(`${baseUrl}/dashboard-labs.html?${query}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function testNickRoutes(page, baseUrl) {
  await openNick(page, baseUrl, "demo=nick");
  assert(await page.getByRole("button", { name: /Start guided property check/i }).isVisible(), "demo=nick should show guided demo CTA.");
  await openNick(page, baseUrl, "journeyDemo=nick");
  assert(await page.getByRole("button", { name: /Start guided property check/i }).isVisible(), "journeyDemo=nick alias should show guided demo CTA.");
}

async function testCoachMarks(page, baseUrl) {
  await openNick(page, baseUrl);
  assert(await page.locator("[data-demo-coachmark]").first().isVisible(), "Nick demo should show a next-action coach mark.");
  assert(await page.locator("[data-demo-guide-character]").first().isVisible(), "Nick demo should show the CMP Demo Guide.");
  assert(await page.locator("[data-guided-target='run-demo']").isVisible(), "Run demo CTA should be highlighted as the first recommended action.");
  await page.getByRole("button", { name: /Hide guide/i }).click();
  assert(!(await page.locator("[data-demo-coachmark]").first().isVisible().catch(() => false)), "Hints should hide without blocking core buttons.");
  assert(!(await page.locator("[data-demo-guide-character]").first().isVisible().catch(() => false)), "Hide hints should hide the CMP Demo Guide.");
  await page.getByRole("button", { name: /Show guide/i }).click();
  assert(await page.locator("[data-demo-coachmark]").first().isVisible(), "Hints should be restorable.");
  assert(await page.locator("[data-demo-guide-character]").first().isVisible(), "Show hints should restore the CMP Demo Guide.");
}

async function testNormalModeHasNoMacawGuide(page, baseUrl) {
  await page.goto(`${baseUrl}/dashboard-labs.html`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  assert(await page.locator("[data-demo-guide-character]").count() === 0, "CMP Demo Guide should not appear in normal dashboard mode.");
}

async function testMacawGuideCopyAndPlacement(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  await page.waitForTimeout(100);
  const guide = page.locator("[data-demo-guide-character]").first();
  assert(await guide.isVisible(), "CMP Demo Guide should appear on the guided start screen.");
  const coachText = (await page.locator("[data-demo-coachmark]").first().innerText()).replace(/\s+/g, " ").trim();
  assert(/Nick demo path/i.test(coachText), "Coach card should identify the guided demo path.");
  assert(/Start with property/i.test(coachText), "Start screen coach copy should be short and action-led.");
  const startTarget = page.locator("[data-guided-target='start-check']").first();
  assert(await startTarget.isVisible(), "Guide should support the existing Check My Property target.");
  const guideBox = await guide.boundingBox();
  const targetBox = await startTarget.boundingBox();
  assert(Boolean(guideBox && targetBox), "Guide and target should both have bounding boxes.");
  const overlapX = Math.max(0, Math.min(guideBox.x + guideBox.width, targetBox.x + targetBox.width) - Math.max(guideBox.x, targetBox.x));
  const overlapY = Math.max(0, Math.min(guideBox.y + guideBox.height, targetBox.y + targetBox.height) - Math.max(guideBox.y, targetBox.y));
  assert(overlapX * overlapY < targetBox.width * targetBox.height * 0.25, "Guide should not cover the highlighted CTA.");

  await startTarget.click();
  await page.waitForTimeout(100);
  const addressCoachText = (await page.locator("[data-demo-coachmark]").first().innerText()).replace(/\s+/g, " ").trim();
  assert(/Run Smart Search/i.test(addressCoachText), "Address step coach copy should point to the simulated checks.");
  assert(await page.locator("[data-guided-target='run-auto-checks']").isVisible(), "Address step should still highlight Run simulated auto checks.");
}

async function highlightedTargetText(page) {
  const target = page.locator("[data-guided-target]").filter({ hasNot: page.locator("[disabled]") }).first();
  assert(await target.isVisible(), "A guided product target should be visible.");
  return (await target.innerText()).replace(/\s+/g, " ").trim();
}

async function journeyTestState(page) {
  return page.evaluate(() => {
    const state = window.__cmpDemoTest?.state?.();
    if (!state) return null;
    return {
      screen: state.screen,
      currentStage: state.currentStage,
      unknownIndex: state.unknownIndex,
      answers: { ...(state.answers || {}) },
      routeId: state.routeId,
      workspaceTab: state.workspaceTab,
      pendingJumpTarget: state.pendingJumpTarget || "",
      modalMode: state.modalMode || "",
      activeConfirmation: state.activeConfirmation ? {
        title: state.activeConfirmation.title,
        nextStep: state.activeConfirmation.nextStep,
        status: state.activeConfirmation.status
      } : null,
      serviceBasketLength: (state.serviceBasket || []).length,
      evidenceVaultLength: (state.evidenceVault || []).length,
      askHistoryLength: (state.askHistory || []).length
    };
  });
}

async function reachCleanUnknowns(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click({ timeout: 6000 });
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await page.locator("[data-guided-target='recommended-answer']").first().waitFor({ timeout: 5000 });
}

async function clickRecommendedUnknownAnswer(page) {
  const target = page.locator("[data-guided-target='recommended-answer']").first();
  assert(await target.isVisible(), "Recommended unknown answer should be highlighted.");
  const targetText = (await target.innerText()).replace(/\s+/g, " ").trim();
  await target.click();
  if (/known problems|none|damp|mould|not sure/i.test(targetText)) {
    const submit = page.locator("[data-journey-condition-submit]").first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    }
  }
  await page.waitForTimeout(120);
  return targetText;
}

async function reachActionPlanWithGuidedAnswers(page, baseUrl) {
  await reachCleanUnknowns(page, baseUrl);
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  await page.locator("[data-guided-target='open-action-plan']").click();
  await page.locator("[data-guided-target='action-plan-primary']").waitFor({ timeout: 5000 });
}

async function testGuidedProductTargets(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  await page.waitForTimeout(100);

  let targetText = await highlightedTargetText(page);
  assert(/Check My Property/i.test(targetText), "First story moment should highlight Check My Property.");
  assert(!/Next moment/i.test(targetText), "First story moment must not highlight Next moment.");
  assert(await page.locator("[data-guided-next]").isVisible(), "Presenter skip control should still exist.");
  assert(/Skip ahead/i.test(await page.locator("[data-guided-next]").innerText()), "Presenter skip should use a natural secondary label.");
  assert(await page.locator("[data-guided-next][data-guided-target]").count() === 0, "Presenter skip should not be the primary highlighted target when a product action exists.");

  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await page.waitForTimeout(100);
  targetText = await highlightedTargetText(page);
  assert(/Run simulated auto checks/i.test(targetText), "Address moment should highlight Run simulated auto checks.");
  assert(!/Next moment/i.test(targetText), "Address moment must not highlight Next moment.");

  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByText(/This looks like your property|We couldn't find a clear EPC record|CMP found several possible records/i).waitFor({ timeout: 5000 });
  targetText = await highlightedTargetText(page);
  assert(/Yes, this is my property|Currently rented|Select this property|Review found data/i.test(targetText), "After auto checks, the story should progress to the real review/confirm action.");
}

async function testUnknownQuestionHighlight(page, baseUrl) {
  await reachCleanUnknowns(page, baseUrl);
  const answerTarget = page.locator("[data-guided-target='recommended-answer']").first();
  assert(await answerTarget.isVisible(), "Unknown question should highlight a recommended answer card.");
  const answerText = (await answerTarget.innerText()).replace(/\s+/g, " ").trim();
  assert(/Yes, currently occupied|No, currently vacant|I want|Damp\/mould|1-2 people/i.test(answerText), "Highlighted unknown target should be an answer card, not presenter controls.");
  assert(await page.locator("[data-guided-next][data-guided-target]").count() === 0, "Unknown question should not highlight presenter controls.");
}

async function testGuidedUnknownsDoNotSkipWorkspace(page, baseUrl) {
  await reachCleanUnknowns(page, baseUrl);
  let state = await journeyTestState(page);
  assert(state?.screen === "unknowns" && state.unknownIndex === 0, "Clean demo should enter the first unknown question.");

  const firstAnswer = await clickRecommendedUnknownAnswer(page);
  assert(/Yes, currently occupied/i.test(firstAnswer), "Clean demo should recommend the occupied answer first.");
  state = await journeyTestState(page);
  assert(state.screen === "unknowns", `First guided answer should keep the demo in unknowns, not jump to ${state.screen}.`);
  assert(state.unknownIndex === 1, `First guided answer should advance to question 2, not index ${state.unknownIndex}.`);
  assert(state.answers.occupancy === "occupied", "First guided answer should be saved progressively.");
  assert(!state.answers.propertyType, "Future unknown answers must not be prefilled before the user reaches them.");
  let chips = await page.locator(".journey-answer-chip").count();
  assert(chips === 1, `Answers so far should reveal only the first answer, not ${chips} pills.`);

  let guard = 0;
  while ((await page.locator("[data-guided-target='recommended-answer']").count()) && guard < 12) {
    await clickRecommendedUnknownAnswer(page);
    guard += 1;
    state = await journeyTestState(page);
    assert(["unknowns"].includes(state.screen), `Guided unknown answer ${guard + 1} should not jump to ${state.screen}.`);
    if (state.unknownIndex >= 10) break;
  }

  state = await journeyTestState(page);
  assert(state.screen === "unknowns" && state.unknownIndex >= 10, "Clean demo should step through every required unknown before building the profile.");
  assert(await page.locator("[data-guided-target='build-brain']").isVisible(), "After all unknowns, Build Property Intelligence should be the highlighted next action.");
  chips = await page.locator(".journey-answer-chip").count();
  assert(chips >= 9, "Answers so far should be built from actual answers across the full unknown sequence.");
}

async function testStrictGuidedAnswerSoftLockAndShortcut(page, baseUrl) {
  await reachCleanUnknowns(page, baseUrl);
  const nonRecommended = page.locator("[data-journey-answer='occupancy'][data-answer-id='vacant']").first();
  assert(await nonRecommended.isVisible(), "A non-recommended occupancy answer should still be visible.");
  await nonRecommended.click();
  await page.waitForTimeout(100);
  let state = await journeyTestState(page);
  assert(!state.answers.occupancy, "Strict guided mode should not accept a non-recommended answer by default.");
  assert(/To keep this scenario on track, follow the highlighted answer/i.test(await text(page)), "Soft-lock message should explain how to stay on the scenario path.");
  assert(await page.locator("[data-guided-unlock]").isVisible(), "Strict guided mode should offer an unlock/free-explore escape.");

  await page.locator("[data-guided-unlock]").click();
  await nonRecommended.click();
  await page.waitForTimeout(100);
  state = await journeyTestState(page);
  assert(state.answers.occupancy === "vacant", "Unlock all choices should allow non-recommended answers without exiting demo mode.");

  await reachCleanUnknowns(page, baseUrl);
  const shortcut = page.locator("[data-guided-use-demo-answers]").first();
  assert(await shortcut.isVisible(), "Guided demo should offer an intentional shortcut for demo answers.");
  await shortcut.click();
  await page.waitForTimeout(150);
  state = await journeyTestState(page);
  assert(state.screen === "unknowns", "Use guided demo answers should finish unknowns without jumping straight to workspace.");
  assert(state.unknownIndex >= 10, "Use guided demo answers should mark required clean-demo unknowns complete.");
  assert(await page.locator("[data-guided-target='build-brain']").isVisible(), "Use guided demo answers should land on Build Property Intelligence.");
}

async function testGuidedSectionMoments(page, baseUrl) {
  await reachActionPlanWithGuidedAnswers(page, baseUrl);
  let body = await text(page);
  assert(/CMP turns evidence gaps into prioritised next steps|Action Plan turns gaps into next steps/i.test(body), "Action Plan should have a section-level explainer before the recommended CTA.");
  assert(/specific evidence or compliance gap|specific gaps|not as a marketplace/i.test(body), "Action Plan explainer should frame services as gap-driven.");

  await page.locator("[data-guided-target='action-plan-primary']").click();
  await page.locator("[data-guided-target='service-confirm-evidence']").waitFor({ timeout: 5000 });
  body = await text(page);
  assert(/No supplier is contacted|No supplier was contacted/i.test(body), "Service confirmation should make the no-supplier caveat readable.");
  assert(/no payment/i.test(body), "Service confirmation should make the no-payment caveat readable.");
  assert(/View Evidence Vault/i.test(await page.locator("[data-guided-target='service-confirm-evidence']").innerText()), "Service confirmation should clearly point to Evidence Vault.");
  const confirmationStyles = await page.locator(".journey-confirmation-banner").evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, backgroundColor: style.backgroundColor };
  });
  assert(!/rgb\(255,\s*255,\s*255\)/i.test(confirmationStyles.color), "Service confirmation body should not use white text on a light banner.");

  await page.locator("[data-guided-target='service-confirm-evidence']").click();
  await page.locator("[data-guided-section-target='evidence']").waitFor({ timeout: 5000 });
  body = await text(page);
  assert(/Evidence Vault is the source of truth/i.test(body), "Evidence Vault should have a guided section moment.");

  await page.getByRole("button", { name: /^Ask CMP$/i }).click();
  await page.locator("[data-guided-section-target='ask']").waitFor({ timeout: 5000 });
  body = await text(page);
  assert(/Ask CMP uses the same evidence/i.test(body), "Ask CMP should have a guided section moment.");
  assert(await page.locator("[data-guided-target='ask-prompt']").isVisible(), "Ask CMP should highlight one useful prompt.");

  await page.getByRole("button", { name: /^Monitoring$/i }).click();
  await page.locator("[data-guided-section-target='monitoring']").waitFor({ timeout: 5000 });
  body = await text(page);
  assert(/Monitoring is the ongoing value/i.test(body), "Monitoring should have a guided section moment.");
  assert(await page.locator("[data-guided-target='monitoring-item']").isVisible(), "Monitoring should highlight the follow-up action.");
}

async function testDesktopArrowLayer(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  const arrow = page.locator("[data-demo-target-arrow]").first();
  assert(await arrow.count() > 0, "Guided coach mark should render the measured arrow layer.");
  await page.waitForTimeout(120);
  const visibleState = await arrow.getAttribute("data-arrow-visible");
  assert(["true", "false"].includes(visibleState || ""), "Measured arrow should explicitly report whether a reliable target was found.");
}

async function testMobileGuidedTarget(page, baseUrl) {
  await page.setViewportSize({ width: 390, height: 844 });
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  const target = page.locator("[data-guided-target='start-check']").first();
  assert(await target.isVisible(), "Mobile should show the Check My Property highlighted target.");
  assert(await page.locator("[data-demo-guide-character]").first().isVisible(), "Mobile should show compact guide support in demo mode.");
  const box = await target.boundingBox();
  assert(Boolean(box), "Mobile highlighted target should have a bounding box.");
  assert(box.width >= 44 && box.height >= 36, "Mobile highlighted target should be tappable.");
  assert(box.x >= 0 && box.x + box.width <= 390, "Mobile highlighted target should not create horizontal overflow.");
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= viewportWidth + 1, "Mobile guide should not create horizontal overflow.");
  const arrowVisible = await page.locator("[data-demo-target-arrow]").first().getAttribute("data-arrow-visible").catch(() => "false");
  assert(arrowVisible !== "true", "Mobile should hide the arrow if target placement is too tight to be reliable.");
  await target.click();
  assert(await page.locator("[data-guided-target='run-auto-checks']").isVisible(), "Mobile tap on Check My Property should advance to address target.");
  await page.setViewportSize({ width: 1440, height: 950 });
}

async function testVacantLogic(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Start guided property check/i }).click();
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    window.__cmpDemoTest?.setAnswers?.({
      occupancy: "occupied",
      propertyType: "room",
      occupants: "threeFour",
      gas: "yes",
      eicr: "unknown",
      alarms: "unknown",
      deposit: "unknown",
      tenancyDocs: "unknown",
      condition: "none",
      intent: "risk"
    }, 10);
  });
  await page.evaluate(() => {
    const state = window.__cmpDemoTest?.state?.();
    if (state) {
      state.screen = "unknowns";
      state.currentStage = "unknowns";
      state.unknownIndex = 0;
    }
  });
  await page.evaluate(() => window.__cmpDemoTest?.answerUnknown?.("occupancy", "vacant"));
  await page.waitForTimeout(250);
  const body = await text(page);
  assert(!/3-4 unrelated people|3–4 unrelated people/i.test(body), "Vacant property should not show a live 3-4 unrelated people answer.");
  assert(/Skipped|Not applicable|Needed later if the property is let/i.test(body), "Vacant property should mark occupant count as skipped/not applicable.");
  assert(!/High HMO risk route added|Possible HMO\/licensing check added/i.test(body), "HMO/licensing route chips should not remain after changing occupancy to vacant.");
}

async function testEvidenceWording(page, baseUrl) {
  await openNick(page, baseUrl);
  const body = await text(page);
  assert(!/Yes,\s*upload it/i.test(body), "Nick demo must not offer 'Yes, upload it'.");
  assert(!/Upload existing EPC|Upload EICR|Upload missing evidence/i.test(body), "Nick demo primary wording should avoid real upload implications.");
  assert(/Add proof later|Mark as held|Request evidence|Book assessment|Evidence needed|No live document upload|no live lookup/i.test(body), "Nick demo should use prototype-safe evidence wording.");
}

async function testScenarioCards(page, baseUrl) {
  await openNick(page, baseUrl);
  const cards = page.locator("[data-guided-scenario-card]");
  assert(await cards.count() === 7, "Nick scenario explorer should show exactly seven scenario cards.");
  const firstText = await cards.first().innerText();
  assert(/Finds|Gap created|Action created/i.test(firstText), "Scenario cards should use compact visual chips.");
  assert(firstText.length < 650, "Scenario cards should be scannable rather than long-form notes.");
  await page.getByRole("button", { name: /Explore scenarios later/i }).click();
  await page.waitForTimeout(100);
  const firstTargetText = await page.locator("[data-guided-target='first-scenario']").innerText();
  assert(/Try this scenario/i.test(firstTargetText), "Scenario Explorer should highlight the first Try this scenario CTA.");
  const coachText = (await page.locator("[data-demo-coachmark]").first().innerText()).replace(/\s+/g, " ").trim();
  assert(/Try another case|Try another landlord situation|Try this scenario next/i.test(coachText), "Scenario Explorer should show concise guide copy.");
}

async function run() {
  const { chromium } = await loadPlaywright();
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  try {
    await testNickRoutes(page, baseUrl);
    await testCoachMarks(page, baseUrl);
    await testNormalModeHasNoMacawGuide(page, baseUrl);
    await testMacawGuideCopyAndPlacement(page, baseUrl);
    await testGuidedProductTargets(page, baseUrl);
    await testUnknownQuestionHighlight(page, baseUrl);
    await testGuidedUnknownsDoNotSkipWorkspace(page, baseUrl);
    await testStrictGuidedAnswerSoftLockAndShortcut(page, baseUrl);
    await testGuidedSectionMoments(page, baseUrl);
    await testDesktopArrowLayer(page, baseUrl);
    await testVacantLogic(page, baseUrl);
    await testEvidenceWording(page, baseUrl);
    await testScenarioCards(page, baseUrl);
    await testMobileGuidedTarget(page, baseUrl);
    assert(consoleErrors.length === 0, `Console errors should not be emitted during Nick demo checks: ${consoleErrors.join(" | ")}`);
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
