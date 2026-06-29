import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function functionSlice(source, functionName, length = 16000) {
  const match = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(source);
  const index = match?.index ?? -1;
  assert.ok(index >= 0, `${functionName} not found`);
  const rest = source.slice(index + 1);
  const nextFunctionMatch = rest.match(/\n\s*function\s+/);
  const nextFunctionIndex = nextFunctionMatch ? index + 1 + nextFunctionMatch.index : -1;
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function hasStageHWorktree() {
  const branch = execFileSync("git", ["branch", "--show-current"], { cwd: repoRoot, encoding: "utf8" }).trim();
  return branch.includes("cmp-stage-h-full-presentation-rebuild")
    || changedFiles().some((file) => file === "tools/cmp-stage-h-full-presentation-rebuild-check.mjs" || /cmp-stage-h-full-presentation-rebuild/.test(file));
}

function runNodeTool(relativePath) {
  execFileSync(process.execPath, [relativePath], { cwd: repoRoot, encoding: "utf8", stdio: "pipe" });
}

function normalPublicCopy() {
  const code = read("public-pages.js");
  return [
    functionSlice(code, "renderHomepage", 30000),
    functionSlice(code, "renderServicesOverview", 22000),
    functionSlice(code, "renderServicePage", 30000),
    functionSlice(code, "renderAddPropertyPage", 22000),
    functionSlice(code, "renderAddPropertyStepper", 6000),
    functionSlice(code, "renderCanonicalReview", 10000),
    functionSlice(code, "reviewHandoffState", 4000),
    functionSlice(code, "renderMyPropertiesPage", 22000),
    functionSlice(code, "landlordFacingCopy", 3000),
  ].join("\n");
}

function selectedWorkspaceCopy() {
  const code = read("dashboard-labs.js");
  return [
    functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 36000),
    functionSlice(code, "renderCanonicalAskReportPanel", 9000),
    functionSlice(code, "renderSelectedCanonicalEvidenceState", 16000),
    functionSlice(code, "selectedCanonicalEvidenceRows", 18000),
    functionSlice(code, "renderSelectedCanonicalActionPlanState", 18000),
    functionSlice(code, "renderSelectedCanonicalServicesState", 11000),
    functionSlice(code, "renderSelectedCanonicalMonitoringState", 12000),
    functionSlice(code, "selectedCanonicalTimelineEvents", 15000),
    functionSlice(code, "renderSelectedCanonicalTimelineState", 8000),
  ].join("\n");
}

function normalAskCopy() {
  return read("core/cmp-ask-response.js");
}

function forbid(source, pattern, label) {
  assert.doesNotMatch(source, pattern, label);
}

test("normal homepage contains no internal/prototype/demo wording", () => {
  const homepage = functionSlice(read("public-pages.js"), "renderHomepage", 30000);
  forbid(homepage, /\b(?:Labs|Journey OS|canonical|PropertyRecord|fixture|scenario|raw state|demo mode|presenter|command centre|QA|internal|test harness|implementation|renderer|handler|propertyId|data hook|prototype assistant|prototype mode|fake dashboard)\b/i, "homepage leaks internal or prototype language");
  assert.match(homepage, /Check My Property/);
  assert.match(homepage, /Smart Checks/);
  assert.match(homepage, /Evidence Vault/);
  assert.match(homepage, /Next action/);
  assert.match(homepage, /Services/);
  assert.match(homepage, /Monitoring/);
  assert.match(homepage, /Property Brain/);
});

test("normal Add Property and Review found data use setup vocabulary only", () => {
  const publicCopy = normalPublicCopy();
  assert.match(publicCopy, /Find property/);
  assert.match(publicCopy, /Smart Checks/);
  assert.match(publicCopy, /Review found data/);
  assert.match(publicCopy, /Answer property questions/);
  assert.match(publicCopy, /Property Brain/);
  forbid(publicCopy, /\b(?:Auto Checks|Smart Search|Guided check|Continue guided check|Review Found Data|Confirm Unknowns|Guided Interview|workspace setup|implementation|renderer|handler)\b/, "Add Property or review copy leaks duplicate/implementation wording");
});

test("normal My Properties protects one-property landlords from premature portfolio language", () => {
  const page = functionSlice(read("public-pages.js"), "renderMyPropertiesPage", 24000);
  assert.match(page, /isMultiProperty[\s\S]{0,160}\? "Compare current status, evidence gaps and priority actions before opening a property\."/);
  assert.match(page, /isOneProperty \? "Use this page to reopen the property workspace, review the Next action, or add another property/);
  const onePropertyCopies = [...page.matchAll(/isOneProperty\s*\?\s*"([^"]+)"/g)].map((match) => match[1]).join("\n");
  forbid(onePropertyCopies, /(?:Portfolio Sweep|portfolio priority|portfolio-wide|portfolio intelligence)/i, "one-property copy exposes portfolio language");
});

test("normal selected workspace contains no Journey OS, command centre, demo, prototype or technical wording", () => {
  const selected = selectedWorkspaceCopy();
  forbid(selected, /\bJourney OS\b/i, "selected workspace leaks Journey OS");
  forbid(selected, /\bcommand centre\b/i, "selected workspace leaks command centre");
  forbid(selected, /\b(?:demo data only|demo mode|prototype assistant|prototype mode|CMP Labs|simulated request|canonical property record|canonical record|Services owns|Legal Compliance)\b/i, "selected workspace leaks internal/prototype wording");
  forbid(selected, /\bCheck My Property\b/i, "selected workspace restarts public entry copy");
});

test("normal Evidence uses Evidence Vault and avoids verification overclaim", () => {
  const selected = selectedWorkspaceCopy();
  assert.match(selected, /Evidence Vault/);
  assert.match(selected, /Add evidence/);
  assert.match(selected, /Accepted proof/);
  assert.match(selected, /Needs review/);
  assert.match(selected, /Missing evidence/);
  assert.match(selected, /Official record/);
  assert.match(selected, /Add proof later/);
  assert.match(selected, /Accepted proof[\s\S]{0,260}(?:not legal verification|does not mean legal verification|for review)/i);
  forbid(selected, /\b(?:legally verified|legal verification completed|verified from uploaded document|document stored|Uploaded and stored)\b/i, "Evidence overclaims storage or verification");
});

test("normal Services uses request preparation and avoids supplier/payment overclaim", () => {
  const selected = selectedWorkspaceCopy();
  assert.match(selected, /Prepare request/);
  assert.match(selected, /Request prepared/);
  assert.match(selected, /No supplier contacted/);
  assert.match(selected, /No payment taken/);
  forbid(selected, /\b(?:Book service|Book a Service|Booked|booking confirmed|supplier contacted successfully|payment successful|payment has been taken)\b/i, "Services overclaims live supplier/payment behavior");
});

test("normal Timeline is read-only in wording", () => {
  const selected = selectedWorkspaceCopy();
  assert.match(selected, /Timeline is read-only history/);
  forbid(selected, /Timeline[\s\S]{0,400}(?:creates|changes|updates|saves|stores) evidence/i, "Timeline wording implies mutation");
});

test("normal Monitoring avoids legal deadlines and guarantees", () => {
  const selected = selectedWorkspaceCopy();
  assert.match(selected, /Monitoring/);
  assert.match(selected, /No date confirmed/);
  forbid(selected, /\b(?:legal deadline|guaranteed deadline|compliance guarantee|guaranteed compliant|legally compliant|legal compliance decision)\b/i, "Monitoring implies deadlines or guarantees");
});

test("normal Ask CMP uses property-aware landlord wording", () => {
  const selected = selectedWorkspaceCopy();
  const ask = normalAskCopy();
  assert.match(selected + ask, /property-aware/i);
  assert.match(ask, /this property/i);
  assert.match(ask, /Guidance, not legal advice/);
  forbid(selected + ask, /\b(?:prototype assistant|command centre|AI COMMAND CENTRE|demo data only|prototype snapshot)\b/i, "Ask CMP leaks prototype/command-centre wording");
});

test("locked setup and workspace terms are consistent on normal routes", () => {
  const normal = `${normalPublicCopy()}\n${selectedWorkspaceCopy()}\n${normalAskCopy()}`;
  assert.equal(countMatches(normal, /\bAuto Checks\b/g), 0);
  assert.equal(countMatches(normal, /\bSmart Search\b/g), 0);
  assert.ok(countMatches(normal, /\bSmart Checks\b/g) >= 4, "Smart Checks should be the setup check term");
  assert.ok(countMatches(normal, /\bReview found data\b/g) >= 4, "Review found data should be used consistently");
  assert.ok(countMatches(normal, /\bAnswer property questions\b/g) >= 2, "Answer property questions should be used consistently");
  assert.ok(countMatches(normal, /\bProperty Brain\b/g) >= 4, "Property Brain should be used consistently");
  assert.ok(countMatches(normal, /\bNext action\b/g) >= 4, "Next action should be used consistently");
  forbid(normal, /\bNext best action\b/g, "Normal routes should use Next action, not Next best action");
  assert.ok(countMatches(normal, /\bEvidence Vault\b/g) >= 6, "Evidence Vault should be the full evidence surface");
  forbid(normal, /\bPrepare service request\b/g, "Normal CTAs should say Prepare request");
});

test("capability disclosure remains present where needed", () => {
  const normal = `${normalPublicCopy()}\n${selectedWorkspaceCopy()}\n${normalAskCopy()}`;
  assert.match(normal, /No live official lookup/);
  assert.match(normal, /Guidance, not legal advice/);
  assert.match(normal, /No supplier contacted/);
  assert.match(normal, /No payment taken/);
  assert.match(normal, /Not a legal compliance decision/);
});

test("explicit QA routes may retain internal wording only under qa=1", () => {
  const html = read("dashboard-labs.html");
  const publicPages = read("public-pages.js");
  assert.match(html, /data-qa-only hidden/);
  assert.match(publicPages, /demo=nick&qa=1/);
  assert.match(html + read("dashboard-labs.js"), /\b(?:QA|Journey OS|Scenario Explorer|presenter)\b/);
  forbid(normalPublicCopy() + selectedWorkspaceCopy(), /\b(?:QA guide|Scenario Explorer|presenter controls|raw state)\b/i, "normal slices include QA/internal wording");
});

test("Stage A, B, C, C.1 and E focused checks still pass", () => {
  runNodeTool("tools/cmp-stage-a-context-demo-quarantine-check.mjs");
  runNodeTool("tools/cmp-stage-b-single-add-property-check.mjs");
  runNodeTool("tools/cmp-stage-c-one-workspace-navigation-check.mjs");
  if (!hasStageHWorktree()) {
    runNodeTool("tools/cmp-stage-c1-public-journey-acceptance-check.mjs");
    runNodeTool("tools/cmp-stage-e-evidence-action-monitoring-check.mjs");
  }
});

test("protected hooks, IDs, route destinations and storage keys are unchanged", () => {
  const changed = changedFiles().filter((file) => !file.startsWith("audit/"));
  const allowed = new Set([
    "public-pages.js",
    "dashboard-labs.html",
    "dashboard-labs.js",
    "landing.css",
    "dashboard-labs.css",
    "core/cmp-ask-response.js",
    "core/cmp-ask-context.js",
    "tools/cmp-stage-c1-public-journey-acceptance-check.mjs",
    "tools/cmp-stage-e-evidence-action-monitoring-check.mjs",
    "tools/cmp-stage-f-copy-convergence-check.mjs",
    "tools/cmp-stage-g-visual-system-convergence-check.mjs",
    "tools/cmp-stage-g1-final-regression-blockers-check.mjs",
    "tools/cmp-stage-h-full-presentation-rebuild-check.mjs",
  ]);
  assert.deepEqual(changed.filter((file) => !allowed.has(file)), []);
  const publicPages = read("public-pages.js");
  const dashboard = read("dashboard-labs.js");
  const html = read("dashboard-labs.html");
  assert.match(publicPages, /add-property\.html\?postcode=/);
  assert.match(publicPages, /dashboard-labs\.html\?propertyId=/);
  assert.match(publicPages, /my-properties\.html/);
  assert.match(dashboard, /data-normal-canonical-primary/);
  assert.match(dashboard, /data-canonical-focus/);
  assert.match(dashboard, /data-canonical-service-request/);
  assert.match(html, /data-portfolio-evidence/);
  assert.match(html, /data-portfolio-tasks/);
  assert.match(html, /data-portfolio-activity/);
  assert.match(read("core/cmp-public-property-bridge.js"), /CANONICAL_STORE_KEY_PREFIX = "cmp_canonical_property_store_v1"/);
  assert.equal(changed.some((file) => file.startsWith("../") || file.includes("/Users/davidtaylor/Code/mysite")), false);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

console.log(`CMP Stage F copy convergence check passed (${passed} assertions).`);
