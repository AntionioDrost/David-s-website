import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));
const askContext = require(path.join(repoRoot, "core/cmp-ask-context.js"));
const reportGenerator = require(path.join(repoRoot, "core/cmp-report-generator.js"));
const scenarioDefinitions = require(path.join(repoRoot, "core/cmp-scenario-definitions.js"));
const scenarioSeeding = require(path.join(repoRoot, "core/cmp-scenario-seeding.js"));
const guidedSteps = require(path.join(repoRoot, "core/cmp-guided-demo-steps.js"));
const guidedSession = require(path.join(repoRoot, "core/cmp-guided-demo-session.js"));

const tests = [];
const requiredScenarioIds = [
  "standard-first-property",
  "no-epc-found",
  "expired-epc",
  "low-epc-improvement",
  "missing-gas-evidence",
  "missing-eicr-evidence",
  "possession-readiness",
  "damp-mould-concern",
  "done-for-me-compliance",
  "pre-let-readiness",
];
const requiredStepIds = [
  "welcome",
  "add-or-check-property",
  "smart-checks",
  "review-found-data",
  "answer-unknowns",
  "property-brain-status",
  "next-best-action",
  "evidence-or-service-loop",
  "ask-cmp-explanation",
  "report-preview",
  "monitoring-preview",
  "finish",
  "scenario-explorer",
];

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  // Historical Stage 10 scope is pinned to its commit range; functional checks
  // below still read the current cumulative branch.
  return execFileSync("git", ["diff", "--name-only", "540cfe..464140a"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function freshDemoStore() {
  return bridge.createEmptyStore(scenarioDefinitions.DEMO_SCENARIO_NAMESPACE, { now: "2026-06-19T09:00:00.000Z" });
}

async function withStaticServer(fn) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = path.normalize(path.join(repoRoot, pathname));
    if (!filePath.startsWith(repoRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200);
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("guided demo step spine is complete, short and product-targeted", () => {
  const steps = guidedSteps.listGuidedDemoSteps().value;
  const stepIds = new Set(steps.map((step) => step.stepId));
  for (const id of requiredStepIds) assert.ok(stepIds.has(id), `${id} step should exist`);
  assert.equal(guidedSteps.DEFAULT_GUIDED_DEMO_SCENARIO_ID, "standard-first-property");
  for (const step of steps) {
    assert.ok(step.title && step.explanation, `${step.stepId} needs title and explanation`);
    assert.ok(step.explanation.length <= 170, `${step.stepId} explanation should stay short`);
    assert.ok(step.targetProductSurface, `${step.stepId} should target a product surface`);
    assert.notEqual(step.targetActionType, "presenter_control", `${step.stepId} should not target presenter controls first`);
    assert.ok(step.preferredSelector || step.productEventKey || step.fallback, `${step.stepId} needs target or fallback`);
    assert.doesNotMatch(`${step.title} ${step.explanation} ${step.fallback || ""}`, /fully compliant|legally compliant|verified|AI confirmed|booked|paid|supplier contacted|uploaded and stored/i);
  }
});

test("guided scenario explorer uses every Stage 9 scenario secondarily", () => {
  const cards = guidedSteps.listGuidedScenarioExplorerCards(scenarioDefinitions.listScenarioDefinitions().value).value;
  const cardIds = new Set(cards.map((card) => card.scenarioId));
  for (const id of requiredScenarioIds) assert.ok(cardIds.has(id), `${id} explorer card should exist`);
  assert.equal(cards.every((card) => card.placement === "secondary"), true);
  assert.equal(cards.some((card) => /57 The Butts/i.test(JSON.stringify(card))), false);
  assert.equal(cards.every((card) => /Load scenario|Try scenario/i.test(card.ctaLabel)), true);
});

test("demo session seeds canonical default scenario in demo namespace only", () => {
  const guestStore = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-19T09:00:00.000Z" });
  guestStore.propertiesById.guest_property = { id: "guest_property" };
  guestStore.propertyOrder.push("guest_property");
  const session = guidedSession.createGuidedDemoSession(freshDemoStore(), {
    route: "dashboard-labs.html?demo=nick&qa=1",
    now: "2026-06-19T09:00:00.000Z",
  });
  assert.equal(session.ok, true, JSON.stringify(session.errors || []));
  assert.equal(session.value.namespaceId, scenarioDefinitions.DEMO_SCENARIO_NAMESPACE);
  assert.equal(session.value.scenarioId, "standard-first-property");
  assert.equal(session.value.property.id, "prop_demo_standard_first_property");
  assert.doesNotMatch(session.value.property.identity.displayAddress, /57 The Butts/i);
  assert.equal(session.value.store.propertiesById[session.value.property.id].namespace, scenarioDefinitions.DEMO_SCENARIO_NAMESPACE);
  assert.deepEqual(guestStore.propertyOrder, ["guest_property"]);
});

test("demo session can switch scenarios without overwriting other scenario records", () => {
  const first = guidedSession.createGuidedDemoSession(freshDemoStore(), {
    scenarioId: "standard-first-property",
    now: "2026-06-19T09:00:00.000Z",
  }).value;
  const second = guidedSession.loadGuidedDemoScenario(first.store, "no-epc-found", {
    now: "2026-06-19T09:05:00.000Z",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors || []));
  assert.equal(second.value.property.id, "prop_demo_no_epc_found");
  assert.equal(second.value.store.propertyOrder.length, 2);
  const repeated = guidedSession.loadGuidedDemoScenario(second.value.store, "no-epc-found", {
    now: "2026-06-19T09:10:00.000Z",
  });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.value.store.propertyOrder.length, 2);
  assert.ok(repeated.value.store.propertiesById.prop_demo_standard_first_property);
});

test("guided demo scenario properties use derivation, service, Ask CMP and reports", () => {
  const session = guidedSession.loadGuidedDemoScenario(freshDemoStore(), "missing-gas-evidence", {
    now: "2026-06-19T09:15:00.000Z",
  }).value;
  const derived = derivation.derivePropertyComplianceState(session.property, { now: "2026-06-19T09:15:00.000Z" }).value;
  assert.ok(derived.nextBestAction);
  const serviceOption = serviceLifecycle.resolveServiceOptionsForAction(derived.nextBestAction, session.property, derived).value[0];
  assert.ok(serviceOption);
  const ask = askContext.buildAskCmpContext(session.property, derived, {
    currentPage: "dashboard-labs.html?demo=nick&qa=1",
    now: "2026-06-19T09:15:00.000Z",
  });
  assert.equal(ask.ok, true);
  assert.match(ask.value.property.displayAddress, /Beacon Yard/i);
  const report = reportGenerator.generateReportPreview(session.property, derived, "property_summary", {
    now: "2026-06-19T09:16:00.000Z",
  });
  assert.equal(report.ok, true);
  assert.match(report.value.title, /Report preview/i);
});

test("dashboard wiring keeps Nick demo canonical and storage-safe", () => {
  const html = read("dashboard-labs.html");
  const code = read("dashboard-labs.js");
  assert.ok(html.includes("core/cmp-guided-demo-steps.js"));
  assert.ok(html.includes("core/cmp-guided-demo-session.js"));
  assert.match(code, /hydrateCanonicalGuidedDemoProperty/);
  assert.match(code, /createGuidedDemoSession/);
  assert.match(code, /data-guided-scenario-id/);
  assert.match(code, /demo:canonical-scenarios/);
  const clearStart = code.indexOf("function clearNickDemoStoredState");
  const clearEnd = code.indexOf("function newPropertyEpcVariantCopy", clearStart);
  const clearBlock = code.slice(clearStart, clearEnd);
  assert.ok(clearStart > -1 && clearEnd > clearStart);
  assert.doesNotMatch(clearBlock, /cmp_compliance_workspaces::guest|cmp_public_service_draft|cmp_journey_context|removeItem|clear\(/);
  const enterStart = code.indexOf("function enterGuidedDemo");
  const enterEnd = code.indexOf("function exitGuidedDemo", enterStart);
  const enterBlock = code.slice(enterStart, enterEnd);
  assert.match(enterBlock, /hydrateCanonicalGuidedDemoProperty/);
  assert.doesNotMatch(enterBlock, /selectedServicePropertyId = "the-butts"|azPropertyId = "the-butts"/);
});

test("routes and product isolation remain intact", async () => {
  const changed = changedFiles();
  const forbidden = [
    "index.html",
    "services.html",
    "epcs.html",
    "gas-safety.html",
    "eicr.html",
    "property-inspections.html",
    "selective-licensing.html",
    "mould-damp.html",
    "add-property.html",
    "my-properties.html",
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
  ];
  assert.deepEqual(changed.filter((file) => forbidden.includes(file)), []);
  assert.doesNotMatch(changed.join("\n"), /^app\//m);
  const diff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(diff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|fetch\(|XMLHttpRequest|api\.openai|OpenAI)/m);
  assert.doesNotMatch(diff, /^\+.*(?:Portfolio Intelligence|Netlify rewrite|legally compliant|fully compliant|AI confirmed)/im);
  assert.doesNotMatch(diff, new RegExp("^\\+.*(?<!No )supplier\\s+contacted", "im"));
  assert.doesNotMatch(diff, new RegExp("^\\+.*(?<!No )payment\\s+taken", "im"));

  await withStaticServer(async (origin) => {
    for (const route of [
      "/dashboard-labs.html?demo=nick&qa=1",
      "/dashboard-labs.html?demoScenario=no-epc-found&qa=1",
      "/dashboard-labs.html?state=empty",
      "/az-checker-v2.html",
      "/dashboard.html",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 10 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 10 guided demo check passed (${tests.length} assertions).`);
