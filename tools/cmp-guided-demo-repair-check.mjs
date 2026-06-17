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
const AUDIT_DIR = path.join(ROOT_DIR, "audit", "2026-06-17-cmp-master-journey-alignment");
const MAIN_DEMO_RE = /Start landlord compliance journey/i;

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
  await page.getByRole("button", { name: MAIN_DEMO_RE }).click();
  await screenshot(page, "01-add-property");
  await page.getByRole("button", { name: /^Check My Property$/i }).click();
  await screenshot(page, "02-auto-checks");
  await page.getByRole("button", { name: /Run simulated auto checks/i }).click();
  await page.getByRole("button", { name: /Yes, this is my property/i }).click({ timeout: 6000 });
  await screenshot(page, "03-review-found-data");
  await page.getByRole("button", { name: /Answer landlord-only unknowns/i }).click();
  await screenshot(page, "04-answer-unknowns");
  await page.locator("[data-guided-use-demo-answers]").click();
  await page.locator("[data-guided-target='build-brain']").click();
  await page.locator("[data-guided-target='open-action-plan']").waitFor({ timeout: 5000 });
  await screenshot(page, "05-compliance-analysis");
  await page.locator("[data-guided-target='open-action-plan']").click();
  await page.locator("[data-guided-target='action-plan-primary']").waitFor({ timeout: 5000 });
  await screenshot(page, "06-action-plan");
  await page.locator("[data-guided-target='action-plan-primary']").click();
  await page.locator("[data-guided-target='take-action-primary']").waitFor({ timeout: 5000 });
  await screenshot(page, "07-take-action");
  await page.locator("[data-guided-target='take-action-primary']").click();
  await page.locator("[data-guided-target='monitoring-item']").waitFor({ timeout: 5000 });
  await screenshot(page, "08-monitor");
  await page.locator("[data-guided-target='monitoring-item']").click();
  await page.getByRole("button", { name: /Try another landlord situation/i }).waitFor({ timeout: 5000 });
  await screenshot(page, "09-scenario-explorer");
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
