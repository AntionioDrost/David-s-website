#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const conciergeDir = join(root, "prototypes", "cmp-concierge");
const requiredFiles = [
  "prototypes/cmp-concierge/index.html",
  "prototypes/cmp-concierge/styles.css",
  "prototypes/cmp-concierge/app.js",
  "prototypes/cmp-concierge/README.md",
  "prototypes/cmp-concierge/tools/cmp-concierge-check.mjs",
];

const results = [];

function pass(message) {
  results.push({ ok: true, message });
}

function fail(message) {
  results.push({ ok: false, message });
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function changedFiles() {
  const output = execFileSync(
    "git",
    ["diff", "--name-only", "HEAD", "--"],
    { cwd: root, encoding: "utf8" },
  ).trim();
  return output ? output.split("\n") : [];
}

function trackedAndUntrackedFiles() {
  const output = execFileSync("git", ["status", "--porcelain=v1"], {
    cwd: root,
    encoding: "utf8",
  });
  if (!output) return [];
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function combinedText() {
  return [
    "prototypes/cmp-concierge/index.html",
    "prototypes/cmp-concierge/styles.css",
    "prototypes/cmp-concierge/app.js",
    "prototypes/cmp-concierge/README.md",
  ]
    .filter((file) => existsSync(join(root, file)))
    .map((file) => read(file))
    .join("\n");
}

function visibleText() {
  return [
    "prototypes/cmp-concierge/index.html",
    "prototypes/cmp-concierge/app.js",
  ]
    .filter((file) => existsSync(join(root, file)))
    .map((file) => read(file))
    .join("\n");
}

const allChanged = Array.from(
  new Set([...changedFiles(), ...trackedAndUntrackedFiles()]),
);
const text = combinedText();
const uiText = visibleText();
const html = existsSync(join(root, "prototypes/cmp-concierge/index.html"))
  ? read("prototypes/cmp-concierge/index.html")
  : "";
const app = existsSync(join(root, "prototypes/cmp-concierge/app.js"))
  ? read("prototypes/cmp-concierge/app.js")
  : "";
const css = existsSync(join(root, "prototypes/cmp-concierge/styles.css"))
  ? read("prototypes/cmp-concierge/styles.css")
  : "";

requiredFiles.forEach((file) => {
  assert(existsSync(join(root, file)), `required file exists: ${file}`);
});

const forbiddenChangeMatchers = [
  [/^prototypes\/cmp-prime\//, "No CMP Prime files changed"],
  [/^prototypes\/cmp-prime-v2\//, "No CMP Prime V2 files changed"],
  [/^prototypes\/cmp-vault\//, "No CMP Vault files changed"],
  [/^dashboard-labs\./, "No dashboard-labs files changed"],
  [/^public-pages\.js$/, "No public-pages.js changed"],
  [/^landing\.css$/, "No landing.css changed"],
  [/^netlify\.toml$/, "No Netlify config changed"],
  [/^supabase\//, "No Supabase files changed"],
  [/^audit\/(?!2026-06-30-cmp-concierge-service-first\/)/, "No old audit folders changed"],
];

for (const [pattern, message] of forbiddenChangeMatchers) {
  assert(!allChanged.some((file) => pattern.test(file)), message);
}

assert(
  !allChanged.some((file) => /^[^/]+\.(html|css|js)$/.test(file)),
  "No root HTML/CSS/JS changed",
);

assert(
  allChanged.every(
    (file) =>
      file.startsWith("prototypes/cmp-concierge/") ||
      file.startsWith("audit/2026-06-30-cmp-concierge-service-first/"),
  ),
  "Changed files stay within Concierge or its temporary audit folder",
);

assert(
  app.includes("cmpConciergePrototypeV1"),
  "Storage namespace is cmpConciergePrototypeV1",
);

const oldStorageKeys = [
  "cmpPrimePrototypeV1",
  "cmpPrimeV2Prototype",
  "cmpVaultPrototypeV1",
  "dashboard-labs",
  "supabase",
];
for (const key of oldStorageKeys) {
  assert(!text.includes(key), `Old storage key absent: ${key}`);
}

assert(uiText.includes("Get help with a property"), "Homepage primary CTA exists");
assert(
  /certificate|inspection/i.test(uiText),
  "Homepage has certificate/inspection route",
);
assert(/possession evidence/i.test(uiText), "Homepage has possession evidence route");
assert(/documents? for review|document review/i.test(uiText), "Homepage has document review route");
assert(/example service plan/i.test(uiText), "Example service plan route exists");
assert(!/A-Z Compliance Map/i.test(uiText), "Service plan is not an A-Z Compliance Map");
assert(!/property passport/i.test(uiText), "Service plan is not a property passport");
assert(/Prepare booking|Book this service/i.test(uiText), "Booking flow exists");
assert(uiText.includes("No supplier contacted yet"), "Booking copy includes no supplier contacted yet");
assert(uiText.includes("No payment taken"), "Booking copy includes no payment taken");
assert(/possession preparation|Prepare possession evidence/i.test(uiText), "Possession prep route exists");
assert(/I need my documents checked|Document check/i.test(uiText), "Document check route exists");
assert(/Ask CMP/i.test(uiText) && /textarea|input/i.test(html + app), "Ask CMP has typed input");
assert(/Speak to a CMP advisor|Book a quick call|Ask a human/i.test(uiText), "Human advisor route exists");
assert(/My Requests/i.test(uiText), "My Requests exists");
assert(/My Properties/i.test(uiText), "My Properties exists");

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
];
const allowedNegatedTerms = new Map([
  ["supplier contacted", ["no supplier contacted yet"]],
  ["payment taken", ["no payment taken"]],
]);
function hasForbiddenVisibleTerm(source, term) {
  let checked = source.toLowerCase();
  for (const allowed of allowedNegatedTerms.get(term) || []) {
    checked = checked.replaceAll(allowed, "");
  }
  return checked.includes(term.toLowerCase());
}
for (const term of forbiddenVisibleTerms) {
  assert(!hasForbiddenVisibleTerm(uiText, term), `Forbidden visible term absent: ${term}`);
}

const possessionTerms = [
  "eviction ready",
  "court ready",
  "notice valid",
  "possession approved",
  "guaranteed",
];
for (const term of possessionTerms) {
  assert(!uiText.toLowerCase().includes(term), `Possession overclaim absent: ${term}`);
}

const propertyMatches = uiText.match(/22 Warwick Row, Coventry, CV1 1EX/g) || [];
assert(propertyMatches.length >= 1, "Sample property is present");
assert(
  /const sampleProperties = \[\s*{\s*id: "warwick-row"/m.test(app) &&
    (app.match(/id: "warwick-row"/g) || []).length === 1 &&
    !/id: "warwick-row"[\s\S]*id: "[^"]+"/m.test(app.slice(app.indexOf("const sampleProperties"), app.indexOf("];", app.indexOf("const sampleProperties")))),
  "My Properties source data shows one property once",
);

assert(css.includes("min-height: 44px"), "Main tap targets are at least 44px where practical");
assert(
  /overflow-x:\s*hidden/.test(css) || /max-width:\s*100%/.test(css),
  "CSS includes horizontal overflow protection",
);
assert(
  /@media\s*\([^)]*390px|@media\s*\([^)]*480px|@media\s*\([^)]*700px/.test(css),
  "Mobile responsive rules exist for narrow viewports",
);

const appStat = existsSync(join(conciergeDir, "app.js"))
  ? statSync(join(conciergeDir, "app.js"))
  : null;
assert(Boolean(appStat && appStat.size > 10000), "App implementation is substantive");

const failed = results.filter((result) => !result.ok);
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.message}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} Concierge validation check(s) failed.`);
  process.exit(1);
}

console.log("\nCMP Concierge validation passed.");
