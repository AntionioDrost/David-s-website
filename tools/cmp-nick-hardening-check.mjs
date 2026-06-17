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
  assert(await page.getByRole("button", { name: /Run the 2-minute demo/i }).isVisible(), "demo=nick should show guided demo CTA.");
  await openNick(page, baseUrl, "journeyDemo=nick");
  assert(await page.getByRole("button", { name: /Run the 2-minute demo/i }).isVisible(), "journeyDemo=nick alias should show guided demo CTA.");
}

async function testCoachMarks(page, baseUrl) {
  await openNick(page, baseUrl);
  assert(await page.locator("[data-demo-coachmark]").first().isVisible(), "Nick demo should show a next-action coach mark.");
  assert(await page.locator("[data-guided-target='run-demo']").isVisible(), "Run demo CTA should be highlighted as the first recommended action.");
  await page.getByRole("button", { name: /Hide hints/i }).click();
  assert(!(await page.locator("[data-demo-coachmark]").first().isVisible().catch(() => false)), "Hints should hide without blocking core buttons.");
  await page.getByRole("button", { name: /Show hints/i }).click();
  assert(await page.locator("[data-demo-coachmark]").first().isVisible(), "Hints should be restorable.");
}

async function testVacantLogic(page, baseUrl) {
  await openNick(page, baseUrl);
  await page.getByRole("button", { name: /Run the 2-minute demo/i }).click();
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
  assert(/Add proof later|Mark as held|Request evidence|Book assessment|Evidence needed|No live document upload/i.test(body), "Nick demo should use prototype-safe evidence wording.");
}

async function testScenarioCards(page, baseUrl) {
  await openNick(page, baseUrl);
  const cards = page.locator("[data-guided-scenario-card]");
  assert(await cards.count() === 7, "Nick scenario explorer should show exactly seven scenario cards.");
  const firstText = await cards.first().innerText();
  assert(/Finds|Gap created|Action created/i.test(firstText), "Scenario cards should use compact visual chips.");
  assert(firstText.length < 650, "Scenario cards should be scannable rather than long-form notes.");
}

async function run() {
  const { chromium } = await loadPlaywright();
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  try {
    await testNickRoutes(page, baseUrl);
    await testCoachMarks(page, baseUrl);
    await testVacantLogic(page, baseUrl);
    await testEvidenceWording(page, baseUrl);
    await testScenarioCards(page, baseUrl);
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
