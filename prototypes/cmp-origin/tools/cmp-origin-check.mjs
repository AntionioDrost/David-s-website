#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const originDir = path.join(root, "prototypes", "cmp-origin");

const requiredFiles = [
  "prototypes/cmp-origin/index.html",
  "prototypes/cmp-origin/styles.css",
  "prototypes/cmp-origin/app.js",
  "prototypes/cmp-origin/README.md",
  "prototypes/cmp-origin/tools/cmp-origin-check.mjs",
  "prototypes/cmp-origin/assets/logo-grey.png",
  "prototypes/cmp-origin/assets/origami-house-wide.png",
  "prototypes/cmp-origin/assets/origami-house-hd.png",
  "prototypes/cmp-origin/assets/service-epc.png",
  "prototypes/cmp-origin/assets/service-gas.png",
  "prototypes/cmp-origin/assets/service-eicr.png",
  "prototypes/cmp-origin/assets/service-property-inspections.png",
  "prototypes/cmp-origin/assets/service-aml.png",
  "prototypes/cmp-origin/assets/service-possession.png",
];

const forbiddenChangedPathPatterns = [
  /^prototypes\/cmp-prime\//,
  /^prototypes\/cmp-vault\//,
  /^prototypes\/cmp-concierge\//,
  /^prototypes\/cmp-radar\//,
  /^dashboard-labs\./,
  /^public-pages\.js$/,
  /^landing\.(?:html|css|js)$/,
  /^index\.html$/,
  /^styles\.css$/,
  /^app\.js$/,
  /^\/?Users\/davidtaylor\/Code\/mysite\//,
];

const forbiddenVisibleTerms = [
  "eviction ready",
  "court ready",
  "notice valid",
  "possession approved",
  "guaranteed outcome",
  "nothing gets rejected later",
  "legally verified",
  "officially compliant",
  "supplier contacted",
  "payment taken",
  "api key",
];

const requiredVisibleTerms = [
  "Landlord compliance made simple.",
  "Check your property. Fix the gaps. Store the proof.",
  "What do you need help with today?",
  "No subscription fee",
  "Real people. Smart tech. No guesswork.",
  "Check your property",
  "Start with one service",
  "My Properties",
  "Possession & eviction preparation",
  "Prepare your evidence before speaking to an advisor",
  "Smart tools help sort your documents.",
  "Our team helps check the next step.",
  "Secure document storage",
  "Full service list",
  "Contact",
  "Legal",
];

const requiredServices = [
  "EPC Certificates & Rating Improvements",
  "Gas Safety Certificates & Renewals",
  "Electrical Installation Condition Reports (EICR)",
  "Property Inspections & Condition Reporting",
  "AML Checks & Identity Verification",
  "Compliance Monitoring & Deadline Tracking",
  "Tenant Documentation & Legal Support",
  "Selective Licensing Guidance",
  "HMO/licensing review",
  "Mould & Damp support",
  "Rent Guarantee",
  "Possession & Eviction Preparation",
  "Landlord Insurance",
  "Mortgages",
  "Making Tax Digital",
  "Landlord Compliance Strategy & Advisory",
];

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
}

function assert(name, condition, detail = "") {
  if (condition) {
    pass(name, detail);
  } else {
    fail(name, detail);
  }
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

function changedFiles() {
  return [
    ...new Set([
      ...gitLines(["diff", "--name-only", "HEAD"]),
      ...gitLines(["diff", "--cached", "--name-only"]),
      ...gitLines(["ls-files", "--others", "--exclude-standard"]),
    ]),
  ].sort();
}

async function readProjectFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function runOptionalBrowserChecks() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    pass("Browser layout and interaction checks", "Skipped because Playwright is not installed for this repo.");
    return;
  }

  const appUrl = pathToFileURL(path.join(originDir, "index.html")).href;
  const browser = await chromium.launch();
  const errors = [];

  try {
    for (const viewport of [
      { width: 1440, height: 1000, label: "desktop" },
      { width: 390, height: 844, label: "mobile" },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`${viewport.label}: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`${viewport.label}: ${message.text()}`);
      });

      await page.goto(appUrl);
      await page.waitForSelector("#app", { timeout: 5000 });
      const bodyText = await page.locator("body").innerText();
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        return Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
      });
      assert(`No horizontal overflow at ${viewport.label}`, overflow <= 1, `overflow=${overflow}`);
      assert(`Home content renders at ${viewport.label}`, bodyText.includes("Landlord compliance made simple."));
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(appUrl);
    await page.getByRole("button", { name: "Check your property" }).first().click();
    await page.getByLabel("Postcode").fill("SW1A 1AA");
    await page.getByRole("button", { name: "Find address" }).click();
    await page.getByRole("button", { name: /Victoria Street/i }).first().click();
    await page.getByRole("button", { name: /EPC/i }).first().click();
    await page.getByRole("button", { name: "Continue to property dashboard" }).click();
    await page.waitForTimeout(100);
    let bodyText = await page.locator("body").innerText();
    assert("Check property flow reaches dashboard", bodyText.includes("Compliance snapshot"));
    assert("Selected address appears in dashboard", bodyText.includes("Victoria Street"));

    await page.getByRole("button", { name: "Services" }).click();
    await page.getByRole("button", { name: /Possession & Eviction Preparation/i }).click();
    bodyText = await page.locator("body").innerText();
    assert("Possession service page opens", bodyText.includes("Prepare your evidence before speaking to an advisor"));
    assert("Service page routes to dashboard", bodyText.includes("Route into property dashboard"));
    await context.close();

    assert("Console and page errors", errors.length === 0, errors.join(" | "));
  } finally {
    await browser.close();
  }
}

async function main() {
  for (const file of requiredFiles) {
    assert(`Required file exists: ${file}`, existsSync(path.join(root, file)));
  }

  const files = changedFiles();
  const disallowed = files.filter((file) => {
    if (file.startsWith("prototypes/cmp-origin/")) return false;
    return forbiddenChangedPathPatterns.some((pattern) => pattern.test(file));
  });
  assert("Only CMP Origin files changed among prototype families and old CMP roots", disallowed.length === 0, disallowed.join(", "));

  const index = existsSync(path.join(originDir, "index.html")) ? await readProjectFile("prototypes/cmp-origin/index.html") : "";
  const styles = existsSync(path.join(originDir, "styles.css")) ? await readProjectFile("prototypes/cmp-origin/styles.css") : "";
  const app = existsSync(path.join(originDir, "app.js")) ? await readProjectFile("prototypes/cmp-origin/app.js") : "";
  const source = `${index}\n${styles}\n${app}`;

  for (const term of requiredVisibleTerms) {
    assert(`Required copy present: ${term}`, source.includes(term));
  }

  for (const service of requiredServices) {
    assert(`Service supported: ${service}`, source.includes(service));
  }

  for (const term of forbiddenVisibleTerms) {
    assert(`Forbidden claim absent: ${term}`, !source.toLowerCase().includes(term.toLowerCase()));
  }

  assert("Uses local asset paths only", !/https?:\/\/|static\.wixstatic\.com/i.test(source));
  assert("Uses CMP green token", styles.includes("#007a3f") || styles.includes("#007A3F"));
  assert("Uses pale Wix-aligned background token", styles.includes("#f5f6f4") || styles.includes("#F5F6F4"));
  assert("Avoids generic SaaS chart labels", !/chart|analytics|metric|kpi/i.test(source));
  assert("No browser storage clearing", !/clear\(\)|clearStorage|localStorage\.clear|sessionStorage\.clear/.test(app));
  assert("No external API calls or keys", !/fetch\(|XMLHttpRequest|apiKey|token/i.test(app));

  await runOptionalBrowserChecks();

  const failed = checks.filter((check) => !check.ok);
  for (const check of checks) {
    const icon = check.ok ? "PASS" : "FAIL";
    const detail = check.detail ? ` - ${check.detail}` : "";
    console.log(`${icon}: ${check.name}${detail}`);
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} CMP Origin check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll CMP Origin checks passed.");
  }
}

await main();
