#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../..");
const vaultDir = path.join(root, "prototypes/cmp-vault");

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "tools/cmp-vault-check.mjs",
];

const forbiddenVisibleTerms = [
  "legally verified",
  "officially compliant",
  "guaranteed",
  "eviction ready",
  "possession approved",
  "notice valid",
  "court ready",
  "supplier contacted",
  "payment taken",
  "A-Z Compliance Map",
];

const oldStorageKeys = [
  "cmpPrimePrototypeV1",
  "cmpPrimeV2Prototype",
  "dashboard-labs",
  "dashboardLabs",
  "supabase",
];

const requiredCategories = [
  "Property identity",
  "Safety certificates",
  "Energy and condition",
  "Tenancy file",
  "Licensing and special cases",
  "Services and contractors",
  "Possession readiness file",
];

const requiredStates = [
  "home",
  "start-vault",
  "address",
  "document-first",
  "vault",
  "record-detail",
  "service",
  "renewals",
  "possession-readiness",
  "properties",
];

const checks = [];

function rel(filePath) {
  return path.relative(root, filePath);
}

function read(relativePath) {
  return fs.readFileSync(path.join(vaultDir, relativePath), "utf8");
}

function add(name, pass, detail = "") {
  checks.push({ name, pass, detail });
}

function containsAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function changedFiles() {
  const output = git(["diff", "--name-only", "HEAD"]);
  return output.split("\n").map((line) => line.trim()).filter(Boolean);
}

function countMatches(haystack, needle) {
  return haystack.split(needle).length - 1;
}

for (const file of requiredFiles) {
  add(`required file exists: ${file}`, fs.existsSync(path.join(vaultDir, file)));
}

const allVaultText = requiredFiles
  .filter((file) => fs.existsSync(path.join(vaultDir, file)))
  .map((file) => read(file))
  .join("\n");

const html = fs.existsSync(path.join(vaultDir, "index.html")) ? read("index.html") : "";
const css = fs.existsSync(path.join(vaultDir, "styles.css")) ? read("styles.css") : "";
const js = fs.existsSync(path.join(vaultDir, "app.js")) ? read("app.js") : "";
const appText = [html, css, js].join("\n");
const visibleText = [html.replace(/<script[\s\S]*?<\/script>/gi, ""), css, js].join("\n");
const visibleTextWithoutRequiredDisclaimers = visibleText
  .replace(/No supplier contacted yet/gi, "")
  .replace(/No payment taken/gi, "");

const modified = changedFiles();
add(
  "no CMP Prime files modified",
  !modified.some((file) => file.startsWith("prototypes/cmp-prime/") || file.startsWith("prototypes/cmp-prime-v2/")),
  modified.join(", "),
);
add(
  "no root HTML/CSS/JS files modified",
  !modified.some((file) => /^[^/]+\.(html|css|js)$/.test(file)),
  modified.join(", "),
);
add(
  "no old CMP pages modified",
  !modified.some((file) =>
    /^(dashboard-labs|public-pages|landing|az-checker-v2|journey-context|supabase-|auth|app|styles)\.(html|css|js)$/.test(file),
  ),
  modified.join(", "),
);

add("localStorage namespace is cmpVaultPrototypeV1", js.includes("cmpVaultPrototypeV1"));
for (const key of oldStorageKeys) {
  add(`old storage key absent: ${key}`, !appText.includes(key));
}

for (const copy of [
  "Start a property vault",
  "Upload documents first",
  "Open example vault",
  "Check possession evidence readiness",
]) {
  add(`homepage copy exists: ${copy}`, html.includes(copy));
}

add("property passport language exists", /property passport|property vault|secure property vault/i.test(html + js));
add("A-Z Compliance Map absent", !appText.includes("A-Z Compliance Map"));

for (const category of requiredCategories) {
  add(`record category exists: ${category}`, appText.includes(category));
}
add("Safety certificates category exists", appText.includes("Safety certificates"));
add("Tenancy file category exists", appText.includes("Tenancy file"));
add("renewal panel exists", appText.includes("Next renewal") && appText.includes("renewalTimeline"));
add("document scan flow exists", containsAll(appText, ["Scan property file", "Suggested match", "Confirm matches"]));
add(
  "confirming a document updates a record",
  containsAll(js, ["confirmInboxItem", "Evidence added", "Landlord confirmed", "updateFileStrength"]),
);
add("service flow is tied to a record", containsAll(js, ["linkedRecordId", "bookService", "Service booked"]));
add("service copy includes No supplier contacted yet", appText.includes("No supplier contacted yet"));
add("service copy includes No payment taken", appText.includes("No payment taken"));
add("possession readiness route exists", appText.includes("possession-readiness"));

const bannedPossessionTerms = [
  "eviction ready",
  "possession approved",
  "notice valid",
  "court ready",
  "guaranteed possession",
  "automatic eviction help",
];
add(
  "possession route avoids banned legal overclaim terms",
  !bannedPossessionTerms.some((term) => appText.toLowerCase().includes(term.toLowerCase())),
);
add("Ask CMP is record-specific", containsAll(appText, ["Ask CMP", "What proof should I upload?", "What service would complete this record?"]));
add(
  "My Properties shows one property once",
  countMatches(appText, "48 Maple Terrace, Leamington Spa, CV32 5AA") <= 1 && js.includes("renderProperties"),
);
for (const term of forbiddenVisibleTerms) {
  add(`forbidden visible UI term absent: ${term}`, !visibleTextWithoutRequiredDisclaimers.toLowerCase().includes(term.toLowerCase()));
}

for (const state of requiredStates) {
  add(`state supported: ${state}`, appText.includes(state));
}

add("390px overflow guard exists", css.includes("@media") && css.includes("390") && css.includes("overflow-x: hidden"));
add("44px tap-target guard exists", css.includes("min-height: 44px"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) {
  const mark = check.pass ? "PASS" : "FAIL";
  const detail = check.detail ? ` (${check.detail})` : "";
  console.log(`${mark} ${check.name}${detail}`);
}

if (failed.length) {
  console.error(`\n${failed.length} CMP Vault validation check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} CMP Vault validation checks passed.`);
