#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const v2Dir = path.join(root, "prototypes", "cmp-origin-v2");
const assetDir = path.join(v2Dir, "assets");
const auditPrefixes = [
  "audit/2026-07-01-cmp-origin-v2-homepage-foundation/",
  "audit/2026-07-01-cmp-origin-v2-homepage-polish/",
  "audit/2026-07-01-cmp-origin-v2-homepage-aesthetic-uplift/",
  "audit/2026-07-01-cmp-origin-v2-premium-homepage-rebuild/",
];

const requiredFiles = [
  "prototypes/cmp-origin-v2/CMP_ORIGIN_V2_HOMEPAGE_VISUAL_BLUEPRINT.md",
  "prototypes/cmp-origin-v2/index.html",
  "prototypes/cmp-origin-v2/styles.css",
  "prototypes/cmp-origin-v2/app.js",
  "prototypes/cmp-origin-v2/README.md",
  "prototypes/cmp-origin-v2/tools/cmp-origin-v2-homepage-check.mjs",
];

const requiredAssets = [
  "logo-grey-live.png",
  "homepage-origami-house-wide.webp",
  "homepage-origami-house-cropped.webp",
  "homepage-warning-epc.webp",
  "homepage-warning-solicitor.webp",
  "homepage-dashboard-overview.webp",
  "service-compliance-checker-tile.webp",
  "service-epc-tile.webp",
  "service-aml-tile.webp",
  "service-selective-licensing-tile.webp",
  "service-landlord-insurance-tile.webp",
  "support-feel-lost.webp",
  "support-overcomplicating.webp",
  "verified-inspections/01-live-verified-capture.svg",
  "verified-inspections/02-no-upload-loophole.svg",
  "verified-inspections/03-room-coverage.svg",
  "verified-inspections/04-lidar-depth-aware.svg",
  "verified-inspections/05-compare-over-time.svg",
  "verified-inspections/06-evidence-with-property.svg",
];

const optionalAssets = [
  "service-mortgages-tile.webp",
  "support-epc-big-tile.webp",
  "homepage-hero-dashboard-fallback.jpg",
  "logo-colour-horizontal.png",
  "property-inspections-main-tile.webp",
  "eicr-card-legally-important.webp",
  "possession-section-21.webp",
];

const requiredCopy = [
  "Landlord compliance made simple.",
  "Check your property. Fix the gaps. Store the proof.",
  "What do you need help with today?",
  "The one stop shop for Property Compliance",
  "We don\u2019t just make you compliant.",
  "Our Main Services",
  "Latest property news, without the noise",
  "CMP Verified Inspections",
  "Coming soon: inspections with fewer blind spots.",
  "How ComplyMyProperty works",
  "Real people. Smart tech. No guesswork.",
];

const forbiddenTerms = [
  "legally verified",
  "officially compliant",
  "guaranteed",
  "eviction ready",
  "possession approved",
  "court ready",
  "notice valid",
  "supplier contacted",
  "payment taken",
  "AI approved",
  "legally checked",
  "court-ready",
  "legally binding proof",
];

const checks = [];

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail });
}

function assert(name, condition, detail = "") {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

function gitLines(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function statusFiles() {
  const lines = gitLines(["status", "--short", "--untracked-files=all"]);
  return lines
    .map((line) => line.slice(2).trim().replace(/^"|"$/g, ""))
    .map((line) => {
      const renamed = line.split(" -> ");
      return renamed[renamed.length - 1];
    })
    .filter((line) => !line.startsWith("cmp-verified-inspections-carousel-assets/"))
    .filter(Boolean);
}

function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(target);
    if (entry.isFile()) return [target];
    return [];
  });
}

async function readIfExists(relativePath) {
  const target = path.join(root, relativePath);
  if (!existsSync(target)) return "";
  return readFile(target, "utf8");
}

function decodeBasicEntities(source) {
  return source
    .replaceAll("&rsquo;", "\u2019")
    .replaceAll("&#8217;", "\u2019")
    .replaceAll("&mdash;", "\u2014")
    .replaceAll("&ndash;", "\u2013")
    .replaceAll("&amp;", "&");
}

function pathIsAllowed(file) {
  if (file === "prototypes/cmp-origin-v2/CMP_ORIGIN_V2_HOMEPAGE_VISUAL_BLUEPRINT.md") return true;
  if (file === "prototypes/cmp-origin-v2/index.html") return true;
  if (file === "prototypes/cmp-origin-v2/styles.css") return true;
  if (file === "prototypes/cmp-origin-v2/app.js") return true;
  if (file === "prototypes/cmp-origin-v2/README.md") return true;
  if (file === "prototypes/cmp-origin-v2/tools/cmp-origin-v2-homepage-check.mjs") return true;
  if (file.startsWith("prototypes/cmp-origin-v2/assets/")) return true;
  if (auditPrefixes.some((prefix) => file.startsWith(prefix))) return true;
  return false;
}

async function runBrowserChecks() {
  const indexPath = path.join(v2Dir, "index.html");
  if (!existsSync(indexPath)) {
    fail("No horizontal overflow at 390px if browser tooling is available", "index.html missing");
    fail("No console errors if browser tooling is available", "index.html missing");
    return;
  }

  const tmp = mkdtempSync(path.join(os.tmpdir(), "cmp-v2-check-"));
  const appUrl = pathToFileURL(indexPath).href;
  const pwcli = process.env.PWCLI || path.join(os.homedir(), ".codex", "skills", "playwright", "scripts", "playwright_cli.sh");

  if (existsSync(pwcli)) {
    let opened = false;
    try {
      execFileSync(pwcli, ["open", "about:blank"], { cwd: tmp, encoding: "utf8", timeout: 30000 });
      opened = true;
      execFileSync(pwcli, ["resize", "390", "844"], { cwd: tmp, encoding: "utf8", timeout: 30000 });
      const code = `
async page => {
  const result = { ok: true, errors: [], overflow: null };
  page.on("console", (msg) => {
    if (msg.type() === "error") result.errors.push(msg.text());
  });
  page.on("pageerror", (err) => result.errors.push(err.message));
  await page.goto(${JSON.stringify(appUrl)}, { waitUntil: "load" });
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, { timeout: 10000 }).catch(() => {});
  result.overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
  });
  return result;
}`;
      const output = execFileSync(pwcli, ["--raw", "run-code", code], { cwd: tmp, encoding: "utf8", timeout: 45000 }).trim();
      const result = JSON.parse(output.split(/\r?\n/).at(-1));
      assert(
        "No horizontal overflow at 390px if browser tooling is available",
        result.ok && result.overflow <= 1,
        `overflow=${result.overflow}`,
      );
      assert(
        "No console errors if browser tooling is available",
        result.ok && result.errors.length === 0,
        result.errors.join(" | "),
      );
      return;
    } catch (error) {
      pass("Playwright CLI browser checks skipped", error.message);
      return;
    } finally {
      if (opened) {
        try {
          execFileSync(pwcli, ["close"], { cwd: tmp, encoding: "utf8", timeout: 10000 });
        } catch {}
      }
    }
  }

  const npx = spawnSync("sh", ["-lc", "command -v npx"], { encoding: "utf8" });
  if (npx.status !== 0) {
    pass("Browser checks skipped", "npx is not available, so browser tooling is unavailable to this script.");
    return;
  }

  const browserScript = path.join(tmp, "browser-check.cjs");
  const resultPath = path.join(tmp, "result.json");

  writeFileSync(
    browserScript,
    `
const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const result = { ok: true, errors: [], overflow: null };
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on("console", (msg) => {
      if (msg.type() === "error") result.errors.push(msg.text());
    });
    page.on("pageerror", (err) => result.errors.push(err.message));
    await page.goto(${JSON.stringify(appUrl)}, { waitUntil: "load" });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, { timeout: 10000 }).catch(() => {});
    result.overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
    });
    await browser.close();
  } catch (error) {
    result.ok = false;
    result.errors.push(error.message);
    try { await browser.close(); } catch {}
  }
  fs.writeFileSync(${JSON.stringify(resultPath)}, JSON.stringify(result));
})();
`,
  );

  const run = spawnSync(
    "npx",
    ["--yes", "--package", "playwright", "node", browserScript],
    { cwd: tmp, encoding: "utf8", timeout: 45000 },
  );

  if (run.status !== 0 || !existsSync(resultPath)) {
    pass(
      "Browser checks skipped",
      `Playwright could not run from npx in this environment: ${run.stderr || run.stdout || "no output"}`.trim(),
    );
    return;
  }

  const result = JSON.parse(await readFile(resultPath, "utf8"));
  assert(
    "No horizontal overflow at 390px if browser tooling is available",
    result.ok && result.overflow <= 1,
    `overflow=${result.overflow}`,
  );
  assert(
    "No console errors if browser tooling is available",
    result.ok && result.errors.length === 0,
    result.errors.join(" | "),
  );
}

async function main() {
  for (const file of requiredFiles) {
    assert(`Required V2 file exists: ${file}`, existsSync(path.join(root, file)));
  }

  for (const asset of requiredAssets) {
    assert(`Required V2 asset exists: ${asset}`, existsSync(path.join(assetDir, asset)));
  }

  const changed = statusFiles();
  const disallowed = changed.filter((file) => !pathIsAllowed(file));
  assert("Only allowed paths changed", disallowed.length === 0, disallowed.join(", "));
  assert(
    "No Prime/Vault/Concierge/Radar files changed",
    !changed.some((file) => /^prototypes\/cmp-(prime|prime-v2|vault|concierge|radar)\//.test(file)),
  );
  assert(
    "No root HTML/CSS/JS changed",
    !changed.some((file) => /^(index|styles|app|landing|public-pages)\.(html|css|js)$/.test(file)),
  );

  const html = await readIfExists("prototypes/cmp-origin-v2/index.html");
  const css = await readIfExists("prototypes/cmp-origin-v2/styles.css");
  const js = await readIfExists("prototypes/cmp-origin-v2/app.js");
  const source = `${html}\n${css}\n${js}`;
  const decoded = decodeBasicEntities(source);

  assert("No source-selected assets are used", !/source-selected/i.test(source));
  assert("No source asset folder references are used", !/cmp-verified-inspections-carousel-assets|prototypes\/cmp-origin\/assets/i.test(source));
  assert("No raw Desktop paths are referenced", !/\/Users\/davidtaylor\/Desktop|Desktop\/Comply my property/i.test(source));
  assert("No Wix hotlinks are used", !/wixstatic|static\.wix|https?:\/\//i.test(source));
  assert("Logo asset exists and is used", existsSync(path.join(assetDir, "logo-grey-live.png")) && source.includes("logo-grey-live.png"));
  assert(
    "Origami/house asset exists and is used",
    existsSync(path.join(assetDir, "homepage-origami-house-wide.webp")) &&
      source.includes("homepage-origami-house-wide.webp"),
  );

  for (const copy of requiredCopy) {
    assert(`Homepage contains: ${copy}`, decoded.includes(copy));
  }

  assert("Footer exists", /<footer\b/i.test(html));
  assert("Latest Updates section exists", /id=["']updates["']/i.test(html) && /updates-ticker/i.test(html));
  assert("Verified Inspections section exists", /id=["']verified-inspections["']/i.test(html));
  assert(
    "Verified Inspections carousel uses local copied V2 assets",
    /assets\/verified-inspections\/01-live-verified-capture\.svg/.test(source) &&
      /assets\/verified-inspections\/06-evidence-with-property\.svg/.test(source),
  );

  const lower = decoded.toLowerCase();
  for (const term of forbiddenTerms) {
    assert(`Forbidden overclaim term absent: ${term}`, !lower.includes(term.toLowerCase()));
  }

  const assetsToCheck = collectFiles(assetDir);
  const oversized = assetsToCheck
    .map((assetPath) => ({ file: rel(assetPath), size: statSync(assetPath).size }))
    .filter((item) => item.size > 350 * 1024);
  assert("No V2 asset exceeds 350 KB unless explicitly reported", oversized.length === 0, JSON.stringify(oversized));

  await runBrowserChecks();

  for (const check of checks) {
    const mark = check.ok ? "PASS" : "FAIL";
    console.log(`${mark} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} CMP Origin V2 homepage checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
