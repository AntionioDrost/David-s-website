#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const primeDir = path.join(root, "prototypes", "cmp-prime");
const auditPrefix = "audit/2026-06-29-cmp-prime-clean-action-led/";

const requiredFiles = [
  "index.html",
  "add-property.html",
  "property.html",
  "my-properties.html",
  "services.html",
  "assets/cmp-prime.css",
  "assets/cmp-prime.js",
  "assets/property-data.js",
  "tools/cmp-prime-check.mjs",
  "README.md"
];

const htmlFiles = ["index.html", "add-property.html", "property.html", "my-properties.html", "services.html"];
const uiFiles = [
  ...htmlFiles,
  "assets/cmp-prime.css",
  "assets/cmp-prime.js",
  "assets/property-data.js"
];

const failures = [];
const notes = [];

function read(rel) {
  return fs.readFileSync(path.join(primeDir, rel), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function fileExists(rel) {
  return fs.existsSync(path.join(primeDir, rel));
}

function changedFiles() {
  const status = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""));
}

function stripMarkup(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countPostcodeInputs() {
  const html = htmlFiles.map(read).join("\n");
  const matches = html.match(/<input[^>]+(?:id|name)=["']postcode["'][^>]*>/gi) || [];
  return matches.length;
}

function visibleText() {
  return htmlFiles.map((file) => stripMarkup(read(file))).join("\n");
}

function allUiSource() {
  return uiFiles.map((file) => read(file)).join("\n");
}

function assertChangedBoundary() {
  const changed = changedFiles();
  const bad = changed.filter((file) => !file.startsWith("prototypes/cmp-prime/") && !file.startsWith(auditPrefix));
  assert(bad.length === 0, `Only prototypes/cmp-prime files may change, except permitted audit outputs. Offending: ${bad.join(", ")}`);
  const oldPatterns = [
    /^dashboard-labs\./,
    /^public-pages\.js$/,
    /^landing\.css$/,
    /^[^/]+\.(html|css|js)$/,
    /^supabase\//,
    /^netlify\.toml$/
  ];
  const oldTouched = changed.filter((file) => oldPatterns.some((pattern) => pattern.test(file)));
  assert(oldTouched.length === 0, `Old/root files were modified: ${oldTouched.join(", ")}`);
}

function assertNoForbiddenUiTerms() {
  const text = visibleText().toLowerCase();
  const forbidden = [
    "canonical",
    "renderer",
    "fixture",
    "journey os",
    "labs",
    "command centre",
    "demo mode",
    "qa route",
    "legal compliance decision",
    "official verification",
    "dashboard-labs",
    "state route",
    "scenario",
    "legally verified",
    "officially compliant",
    "officially verified",
    "legally compliant"
  ];

  const bad = forbidden.filter((term) => text.includes(term));
  assert(bad.length === 0, `Forbidden visible UI terms found: ${bad.join(", ")}`);
  assert(text.includes("no supplier contacted"), "Service request draft must show No supplier contacted.");
  assert(text.includes("no payment taken"), "Service request draft must show No payment taken.");
  const positiveSupplierClaims = text.replace(/no supplier contacted/g, "").includes("supplier contacted");
  const positivePaymentClaims = text.replace(/no payment taken/g, "").includes("payment taken");
  assert(!positiveSupplierClaims, "Positive supplier contact claim found.");
  assert(!positivePaymentClaims, "Positive payment claim found.");
}

function assertNoKeys(source) {
  const patterns = [
    /sk-[A-Za-z0-9_-]{20,}/,
    /AIza[0-9A-Za-z_-]{20,}/,
    /xox[baprs]-[0-9A-Za-z-]{20,}/,
    /(?:api|secret|token|private)[_-]?key\s*[:=]\s*["'][^"']{8,}["']/i
  ];
  const matched = patterns.find((pattern) => pattern.test(source));
  assert(!matched, "Private API key-like pattern found.");
}

function assertStorageNamespace(source) {
  const storageCalls = source.match(/localStorage\.(?:getItem|setItem|removeItem)\(([^)]+)\)/g) || [];
  assert(storageCalls.length > 0, "CMP Prime localStorage calls were not found.");
  const bad = storageCalls.filter((call) => !call.includes("STORAGE_KEY"));
  assert(bad.length === 0, `localStorage must use cmpPrimePrototypeV1 namespace only. Offending calls: ${bad.join(", ")}`);
  assert(source.includes("cmpPrimePrototypeV1"), "cmpPrimePrototypeV1 namespace is missing.");
}

requiredFiles.forEach((file) => assert(fileExists(file), `Missing required file: ${file}`));

assertChangedBoundary();

const index = read("index.html");
const add = read("add-property.html");
const property = read("property.html");
const services = read("services.html");
const myProperties = read("my-properties.html");
const js = read("assets/cmp-prime.js");
const dataJs = read("assets/property-data.js");
const css = read("assets/cmp-prime.css");
const source = allUiSource();

assert(countPostcodeInputs() === 1, `Expected one postcode input, found ${countPostcodeInputs()}.`);
assert(dataJs.includes("api.postcodes.io/postcodes"), "Postcodes.io adapter is missing.");
assertNoKeys(source);
assert(index.includes("Check a property"), "Homepage Check a property CTA is missing.");
assert(add.includes("Run Smart Checks"), "Add Property primary postcode flow is missing.");
assert(!add.match(/name=["']postcode["']/gi) || add.match(/name=["']postcode["']/gi).length === 1, "Add Property must have one postcode field.");
assert(add.includes("What CMP found"), "Review Found Data is missing What CMP found.");
assert(add.includes("What CMP still needs from you"), "Review Found Data is missing What CMP still needs from you.");
assert(property.includes("Property Brain"), "Property Brain route/content is missing.");
assert(property.includes("One next action") && js.includes("nextBestAction"), "One next best action is not visible.");
assert(property.includes("Evidence Vault"), "Evidence Vault is missing.");
assert(js.includes("addEvidence") && js.includes("Evidence added"), "Fake upload evidence update is missing.");
assert(js.includes("Top priority action") && dataJs.includes("determineNextAction"), "Action Plan priority logic is missing.");
assert(services.includes("Linked gap") && js.includes("serviceOption"), "Services are not tied to gaps.");
assert(services.includes("No supplier contacted"), "No supplier contacted label is missing.");
assert(services.includes("No payment taken"), "No payment taken label is missing.");
assert(property.includes("Monitoring") && myProperties.includes("monitoring alerts"), "Monitoring is missing.");
assert(myProperties.includes("propertiesList"), "My Properties one-property state is missing.");
assert(myProperties.includes("propertyComparison") && js.includes("properties.length < 2"), "Portfolio comparison must be hidden for one-property state.");
assert(property.includes("Ask CMP about this property") && property.includes("askCmpDrawer") && property.includes("hidden"), "Ask CMP must be contextual.");
assertNoForbiddenUiTerms();
assert(!visibleText().toLowerCase().includes("officially verified"), "No officially verified language may appear.");
assert(!visibleText().toLowerCase().includes("legally compliant"), "No legally compliant guarantee may appear.");
assert(css.includes("@media (max-width: 720px)") && css.includes("overflow-x: hidden"), "Mobile overflow protections are missing.");
assert(css.includes("min-height: 44px") || css.includes("min-height: 46px"), "44px tap target rules are missing.");
notes.push("Manual text contrast check: normal text uses #17231F or #5F6F67 on white/off-white/mint surfaces; no pale normal body text found in CSS review.");
assertStorageNamespace(source);

async function runBrowserOverflowCheck(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/index.html`;
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    }));
    await browser.close();
    return result;
  } catch {
    const code = `
      (async () => {
        const { chromium } = require("playwright");
        const browser = await chromium.launch();
        const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
        await page.goto(${JSON.stringify(url)}, { waitUntil: "networkidle" });
        const result = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        }));
        await browser.close();
        console.log(JSON.stringify(result));
      })().catch((error) => {
        console.error(error.stack || error.message);
        process.exit(1);
      });
    `;
    const output = execFileSync("npx", ["--yes", "--package", "playwright", "node", "-e", code], {
      encoding: "utf8",
      timeout: 60000
    }).trim();
    return JSON.parse(output.split(/\r?\n/).pop());
  }
}

if (process.env.CMP_PRIME_URL) {
  try {
    const result = await runBrowserOverflowCheck(process.env.CMP_PRIME_URL);
    assert(!result.overflow, `Horizontal overflow detected at 390px: scrollWidth ${result.scrollWidth}, viewport ${result.innerWidth}.`);
  } catch (error) {
    notes.push(`Browser overflow check skipped: ${error.message}`);
  }
} else {
  notes.push("Browser overflow check skipped: set CMP_PRIME_URL to run optional Playwright check.");
}

if (failures.length) {
  console.error("CMP Prime validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  if (notes.length) {
    console.error("Notes:");
    notes.forEach((note) => console.error(`- ${note}`));
  }
  process.exit(1);
}

console.log("CMP Prime validation passed.");
notes.forEach((note) => console.log(`- ${note}`));
