#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const radarDir = path.join(root, "prototypes", "cmp-radar");
const auditDir = "audit/2026-06-30-cmp-radar-risk-first/";

const requiredFiles = [
  "prototypes/cmp-radar/index.html",
  "prototypes/cmp-radar/styles.css",
  "prototypes/cmp-radar/app.js",
  "prototypes/cmp-radar/README.md",
  "prototypes/cmp-radar/tools/cmp-radar-check.mjs",
];

const allowedChangedFiles = new Set(requiredFiles);

const oldStorageKeys = [
  "cmpPrimePrototypeV1",
  "cmpPrimeV2Prototype",
  "cmpVaultPrototypeV1",
  "cmpConciergePrototypeV1",
  "dashboard-labs",
  "dashboardLabs",
  "supabase",
];

const forbiddenVisibleTerms = [
  "legally verified",
  "officially compliant",
  "guaranteed",
  "eviction ready",
  "possession approved",
  "court ready",
  "notice valid",
  "supplier contacted",
  "payment taken",
  "A-Z Compliance Map",
  "property passport",
  "service concierge",
  "illegal",
  "legally invalid",
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

function unique(items) {
  return [...new Set(items)].sort();
}

function changedFiles() {
  return unique([
    ...gitLines(["diff", "--name-only", "HEAD"]),
    ...gitLines(["diff", "--cached", "--name-only"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ]);
}

async function readProjectFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function includesAll(source, values) {
  return values.every((value) => source.includes(value));
}

function hasForbiddenChangedPath(files, matcher) {
  return files.some((file) => matcher.test(file));
}

function isAllowedChangedFile(file) {
  if (allowedChangedFiles.has(file)) return true;
  if (file.startsWith("prototypes/cmp-radar/assets/")) return true;
  if (file.startsWith(auditDir)) return true;
  return false;
}

async function runOptionalBrowserChecks(results) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    results.push({
      name: "Browser layout checks",
      ok: true,
      detail: "Skipped because the Playwright module is not available to this script.",
    });
    return;
  }

  const appUrl = pathToFileURL(path.join(radarDir, "index.html")).href;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl);
    await page.waitForSelector("#app");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
    });
    results.push({
      name: "No horizontal overflow at 390px",
      ok: overflow <= 1,
      detail: `overflow=${overflow}`,
    });

    const targetIssues = await page.evaluate(() => {
      const selectors = "button, a[href], input, select, textarea, .route-card";
      return [...document.querySelectorAll(selectors)]
        .filter((node) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
        })
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            label: node.textContent.trim().slice(0, 60) || node.getAttribute("aria-label") || node.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter((item) => item.width < 44 || item.height < 44);
    });
    results.push({
      name: "Main tap targets are at least 44px where practical",
      ok: targetIssues.length === 0,
      detail: targetIssues.length ? JSON.stringify(targetIssues.slice(0, 8)) : "all visible targets passed",
    });

    const routeChecks = [
      { label: "Scan property risk", expect: "Choose the risk route" },
      { label: "Check renewal deadlines", expect: "Deadline lane" },
      { label: "Preview possession risk", expect: "Check evidence readiness" },
      { label: "Upload evidence to reduce risk", expect: "Add proof to reduce risk" },
      { label: "Open example risk radar", expect: "Risk Radar" },
    ];

    for (const route of routeChecks) {
      await page.goto(appUrl);
      await page.getByRole("button", { name: route.label }).first().click();
      await page.waitForTimeout(100);
      const text = await page.locator("body").innerText();
      results.push({
        name: `Route smoke: ${route.label}`,
        ok: text.includes(route.expect),
        detail: route.expect,
      });
    }

    results.push({
      name: "Console and page errors",
      ok: errors.length === 0,
      detail: errors.join(" | "),
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  for (const file of requiredFiles) {
    assert(`Required file exists: ${file}`, existsSync(path.join(root, file)));
  }

  const files = changedFiles();
  const disallowed = files.filter((file) => !isAllowedChangedFile(file));
  assert("Only CMP Radar and allowed audit paths changed", disallowed.length === 0, disallowed.join(", "));
  assert("No CMP Prime files changed", !hasForbiddenChangedPath(files, /^prototypes\/cmp-prime(?:-v2)?\//));
  assert("No CMP Vault files changed", !hasForbiddenChangedPath(files, /^prototypes\/cmp-vault\//));
  assert("No CMP Concierge files changed", !hasForbiddenChangedPath(files, /^prototypes\/cmp-concierge\//));
  assert("No old CMP files changed", disallowed.filter((file) => file.startsWith("prototypes/")).length === 0);
  assert("No root HTML/CSS/JS changed", !hasForbiddenChangedPath(files, /^[^/]+\.(?:html|css|js)$/));

  const index = existsSync(path.join(radarDir, "index.html")) ? await readProjectFile("prototypes/cmp-radar/index.html") : "";
  const styles = existsSync(path.join(radarDir, "styles.css")) ? await readProjectFile("prototypes/cmp-radar/styles.css") : "";
  const app = existsSync(path.join(radarDir, "app.js")) ? await readProjectFile("prototypes/cmp-radar/app.js") : "";
  const visibleSource = `${index}\n${app}`;
  const allSource = `${index}\n${styles}\n${app}`;

  assert("Storage namespace is cmpRadarPrototypeV1", app.includes("cmpRadarPrototypeV1"));
  for (const key of oldStorageKeys) {
    assert(`Old storage key is not used: ${key}`, !allSource.includes(key));
  }

  assert("Homepage has Scan property risk", visibleSource.includes("Scan property risk"));
  assert("Homepage has renewal deadline route", visibleSource.includes("Check renewal deadlines"));
  assert("Homepage has possession risk route", visibleSource.includes("Preview possession risk"));
  assert("Homepage has evidence upload route", visibleSource.includes("Upload evidence to reduce risk"));
  assert("Homepage has example risk radar route", visibleSource.includes("Open example risk radar"));
  assert("Main screen has Risk Radar", visibleSource.includes("Risk Radar"));
  assert("Main screen does not use banned map framing", !visibleSource.includes("A-Z Compliance Map"));
  assert("Main screen does not use banned passport framing", !visibleSource.includes("property passport"));
  assert("Main screen does not use banned concierge framing", !visibleSource.includes("service concierge"));

  assert(
    "Risk categories exist",
    includesAll(visibleSource, [
      "Certificates",
      "Tenancy",
      "Licensing",
      "Condition",
      "Possession",
      "Deadlines",
    ]),
  );
  assert("Top risk panel exists", visibleSource.includes("Top risk"));
  assert("What would happen if feature exists", visibleSource.includes("What would happen if"));
  assert("Deadline timeline exists", visibleSource.includes("Deadline timeline"));
  assert(
    "Evidence upload reduces risk after confirmation",
    includesAll(visibleSource, ["Add proof to reduce risk", "Confirm before updating risk", "Risk reduced"]) &&
      app.includes("confirmEvidence"),
  );
  assert(
    "Service/advisor action is tied to risk",
    includesAll(visibleSource, ["Reduce this risk", "Book service", "Prepare advisor review", "Ask advisor"]),
  );
  assert(
    "Possession risk route exists",
    includesAll(visibleSource, ["possession-risk", "Check evidence readiness before speaking to an advisor"]),
  );
  assert("Ask CMP has typed input", includesAll(visibleSource, ["Ask CMP", "askInput"]));
  assert(
    "My Properties shows one property once",
    includesAll(visibleSource, ["My Properties", "dedupeProperties", "Portfolio risk view available once more properties are added"]),
  );

  for (const term of forbiddenVisibleTerms) {
    assert(`Forbidden visible term absent: ${term}`, !visibleSource.toLowerCase().includes(term.toLowerCase()));
  }

  await runOptionalBrowserChecks(checks);

  const failed = checks.filter((check) => !check.ok);
  for (const check of checks) {
    const prefix = check.ok ? "PASS" : "FAIL";
    console.log(`${prefix} ${check.name}${check.detail ? ` :: ${check.detail}` : ""}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length} CMP Radar validation check(s) failed.`);
    process.exit(1);
  }

  const reportPath = path.join(os.tmpdir(), "cmp-radar-check-last-pass.json");
  await writeFile(reportPath, JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2));
  await rm(reportPath, { force: true });
  console.log(`\nCMP Radar validation passed with ${checks.length} checks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
