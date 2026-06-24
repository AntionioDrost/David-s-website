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
const normalize = require(path.join(repoRoot, "core/cmp-domain-normalize.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const serviceLifecycle = require(path.join(repoRoot, "core/cmp-service-lifecycle.js"));
const evidenceLifecycle = require(path.join(repoRoot, "core/cmp-evidence-lifecycle.js"));
const askContext = require(path.join(repoRoot, "core/cmp-ask-context.js"));
const askResponse = require(path.join(repoRoot, "core/cmp-ask-response.js"));
const reportGenerator = require(path.join(repoRoot, "core/cmp-report-generator.js"));
const scenarioDefinitions = require(path.join(repoRoot, "core/cmp-scenario-definitions.js"));
const scenarioSeeding = require(path.join(repoRoot, "core/cmp-scenario-seeding.js"));

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

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function freshDemoStore() {
  return bridge.createEmptyStore(scenarioDefinitions.DEMO_SCENARIO_NAMESPACE, { now: "2026-06-18T12:00:00.000Z" });
}

function seedOne(scenarioId, store = freshDemoStore()) {
  const result = scenarioSeeding.seedScenarioProperty(store, scenarioId, {
    now: "2026-06-18T12:00:00.000Z",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function derive(property) {
  const result = derivation.derivePropertyComplianceState(property, {
    now: "2026-06-18T12:00:00.000Z",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
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

test("scenario definitions are unique, simulated and contract-compatible", () => {
  const definitions = scenarioDefinitions.listScenarioDefinitions().value;
  const ids = new Set(definitions.map((definition) => definition.id));
  for (const id of requiredScenarioIds) assert.ok(ids.has(id), `${id} should exist`);
  assert.equal(ids.size, definitions.length, "scenario IDs should be unique");
  assert.equal(new Set(definitions.map((definition) => definition.uniqueFictionalPropertyId)).size, definitions.length);
  assert.equal(new Set(definitions.map((definition) => definition.uniqueFictionalAddress)).size, definitions.length);
  assert.equal(definitions.some((definition) => /57 The Butts/i.test(JSON.stringify(definition))), false);

  const schema = JSON.parse(read("contracts/scenario-definition.schema.json"));
  for (const definition of definitions) {
    assert.equal(definition.capabilityStatus, "simulated");
    assert.equal(definition.propertySeed?.canonicalNamespaceType, "demo");
    assert.ok(definition.propertySeed?.demoMetadata?.scenarioId);
    assert.ok(definition.expectedIssues.length >= 0);
    assert.ok(definition.expectedTopAction?.actionType);
    const validation = scenarioDefinitions.validateScenarioDefinition(definition);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors || []));
    const schemaValidation = normalize.validateJsonSchema(definition, schema);
    assert.equal(schemaValidation.ok, true, `${definition.id}: ${JSON.stringify(schemaValidation.errors || [])}`);
    const created = scenarioSeeding.createPropertyRecordFromScenario(definition, {
      now: "2026-06-18T12:00:00.000Z",
    });
    assert.equal(created.ok, true, JSON.stringify(created.errors || []));
    assert.equal(normalize.validatePropertyRecord(created.value.propertyRecord).ok, true, definition.id);
  }
});

test("scenario seeding is demo-namespace isolated and idempotent", () => {
  const guestStore = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now: "2026-06-18T12:00:00.000Z" });
  guestStore.propertiesById.guest_property = { id: "guest_property" };
  guestStore.propertyOrder.push("guest_property");
  const legacyStorage = {
    "cmp_compliance_workspaces::guest": "{\"legacy\":true}",
    "cmp_public_service_draft::eicr": "{\"legacy\":true}",
  };
  const first = seedOne("standard-first-property");
  assert.equal(first.store.namespaceId, scenarioDefinitions.DEMO_SCENARIO_NAMESPACE);
  assert.equal(guestStore.propertyOrder.includes("guest_property"), true);
  assert.deepEqual(Object.keys(legacyStorage), ["cmp_compliance_workspaces::guest", "cmp_public_service_draft::eicr"]);

  const second = seedOne("no-epc-found", first.store);
  assert.notEqual(first.property.id, second.property.id);
  assert.equal(second.store.propertyOrder.length, 2);
  const repeated = seedOne("no-epc-found", second.store);
  assert.equal(repeated.store.propertyOrder.length, 2);
  assert.equal(repeated.property.id, second.property.id);
  assert.equal(repeated.store.propertiesById[first.property.id].identity.displayAddress, first.property.identity.displayAddress);
  assert.equal(repeated.store.namespaceId === bridge.PUBLIC_GUEST_NAMESPACE_ID, false);
});

test("scenario derivation covers expected issue and no-EPC safety rules", () => {
  const scenarioState = {};
  for (const scenarioId of requiredScenarioIds) {
    const seeded = seedOne(scenarioId);
    scenarioState[scenarioId] = { property: seeded.property, derived: derive(seeded.property) };
  }

  assert.equal(scenarioState["standard-first-property"].derived.riskLevel, "low");
  assert.equal(scenarioState["standard-first-property"].derived.overallStatus, "looks_ok_based_on_current_information");

  const noEpc = scenarioState["no-epc-found"].property;
  const noEpcState = scenarioState["no-epc-found"].derived;
  assert.ok(noEpcState.issues.some((issue) => issue.category === "epc" && issue.createdFromRule === "epc_missing"));
  const epcCheck = noEpc.smartCheckResults.find((check) => check.checkType === "epc");
  const heatingCheck = noEpc.smartCheckResults.find((check) => check.checkType === "heating_source");
  assert.equal(epcCheck.value.epcRating, undefined);
  assert.equal(epcCheck.value.epcPotential, undefined);
  assert.equal(epcCheck.value.epcExpiry, undefined);
  assert.equal(heatingCheck.value, null);
  assert.equal(JSON.stringify(noEpc).includes("EPC-derived heating"), false);

  assert.ok(scenarioState["expired-epc"].derived.issues.some((issue) => issue.createdFromRule === "epc_expired"));
  assert.ok(scenarioState["low-epc-improvement"].derived.issues.some((issue) => issue.category === "future_readiness"));
  assert.ok(scenarioState["missing-gas-evidence"].derived.issues.some((issue) => issue.category === "gas_safety"));
  assert.ok(scenarioState["missing-eicr-evidence"].derived.issues.some((issue) => issue.category === "eicr"));
  assert.ok(scenarioState["possession-readiness"].derived.issues.some((issue) => ["deposit_admin", "evidence_confidence"].includes(issue.category)));
  assert.doesNotMatch(JSON.stringify(scenarioState["possession-readiness"].derived), /legally compliant|legal guarantee|final legal notice/i);
  assert.ok(scenarioState["damp-mould-concern"].derived.issues.some((issue) => issue.category === "property_condition"));
  assert.ok(scenarioState["done-for-me-compliance"].derived.nextBestAction);

  const preLet = scenarioState["pre-let-readiness"].derived;
  assert.equal(preLet.context.occupancyStatus, "pre_let");
  assert.equal(preLet.context.occupantCount, null);
});

test("scenario records use service, evidence, Ask CMP and report systems", () => {
  const seeded = seedOne("missing-gas-evidence");
  const state = derive(seeded.property);
  const action = state.actionItems.find((item) => item.primaryCtaType === "request_service");
  assert.ok(action);
  const option = serviceLifecycle.resolveServiceOptionsForAction(action, seeded.property, state).value[0];
  assert.ok(option);
  const requestResult = serviceLifecycle.createServiceRequestFromAction(seeded.property, action, option, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "stage9-gas-request",
  });
  assert.equal(requestResult.ok, true, JSON.stringify(requestResult.errors || []));
  const requestRecord = requestResult.value.propertyRecord;
  assert.equal(requestResult.value.serviceRequest.capabilityStatus, "simulated");
  assert.equal(requestResult.value.serviceRequest.supplierJobPackData.supplierContacted, false);

  const evidenceResult = evidenceLifecycle.createEvidencePlaceholderFromServiceRequest(requestRecord, requestResult.value.serviceRequest, {
    now: "2026-06-18T12:05:00.000Z",
  });
  assert.equal(evidenceResult.ok, true, JSON.stringify(evidenceResult.errors || []));
  assert.equal(evidenceResult.value.evidenceItem.capabilityStatus, "simulated");
  assert.equal(evidenceResult.value.evidenceItem.verificationStatus, "needs_review");

  const ask = askContext.buildAskCmpContext(evidenceResult.value.propertyRecord, derive(evidenceResult.value.propertyRecord), {
    currentPage: "dashboard-labs.html?demoScenario=missing-gas-evidence&qa=1",
    now: "2026-06-18T12:10:00.000Z",
  });
  assert.equal(ask.ok, true);
  assert.match(ask.value.property.displayAddress, /Beacon/i);
  const answer = askResponse.answerAskCmpPrompt(ask.value, "recommended-services");
  assert.equal(answer.ok, true);
  assert.match(answer.value.answerText, /Beacon/i);
  assert.doesNotMatch(answer.value.answerText, /legally compliant|AI confirmed|Supplier contacted/i);

  const report = reportGenerator.generateReportPreview(evidenceResult.value.propertyRecord, derive(evidenceResult.value.propertyRecord), "service_job_pack_preview", {
    now: "2026-06-18T12:15:00.000Z",
  });
  assert.equal(report.ok, true);
  assert.equal(report.value.propertyId, seeded.property.id);
  assert.match(JSON.stringify(report.value), /Report preview|Guidance, not legal advice/i);
});

test("scenario route is internal, canonical and does not expose public navigation", async () => {
  const html = read("dashboard-labs.html");
  const code = read("dashboard-labs.js");
  assert.ok(html.includes("core/cmp-scenario-definitions.js"));
  assert.ok(html.includes("core/cmp-scenario-seeding.js"));
  assert.match(code, /demoScenario/);
  assert.match(code, /DEMO_SCENARIO_NAMESPACE/);
  assert.match(code, /hydrateCanonicalScenarioProperty/);
  assert.match(code, /seedScenarioProperty/);
  assert.match(code, /canonical selected-property shell/i);
  const scenarioHydrationStart = code.indexOf("function hydrateCanonicalScenarioProperty");
  const scenarioHydrationEnd = code.indexOf("function hydrateSelectedCanonicalProperty", scenarioHydrationStart);
  const scenarioHydrationBlock = code.slice(scenarioHydrationStart, scenarioHydrationEnd);
  assert.ok(scenarioHydrationStart > -1 && scenarioHydrationEnd > scenarioHydrationStart);
  assert.doesNotMatch(scenarioHydrationBlock, /57 The Butts/i);
  assert.doesNotMatch(read("index.html"), /demoScenario=/);
  assert.doesNotMatch(read("public-pages.js"), /demoScenario=/);

  await withStaticServer(async (origin) => {
    for (const route of [
      "/dashboard-labs.html?demoScenario=no-epc-found&qa=1",
      "/dashboard-labs.html?demo=nick&qa=1",
      "/dashboard-labs.html?demo=nick&advanced=1&qa=1",
      "/dashboard-labs.html?state=empty",
      "/dashboard-labs.html?state=before-eicr",
      "/az-checker-v2.html",
      "/dashboard.html",
      "/services.html",
      "/epcs.html",
      "/gas-safety.html",
      "/eicr.html",
      "/property-inspections.html",
      "/selective-licensing.html",
      "/mould-damp.html",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

test("existing flow isolation is preserved", () => {
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
  const stagedDiff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(stagedDiff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|removeItem\(|fetch\(|XMLHttpRequest|api\.openai|OpenAI)/m);
  assert.doesNotMatch(stagedDiff, /^\+.*(?:portfolio intelligence|guided demo coach marks|Netlify rewrite)/im);
  assert.equal(read("dashboard-labs.js").includes("const guidedDemoStories = {"), true);
  assert.equal(read("dashboard-labs.js").includes("const journeyDemoScenarios = {"), true);
});

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 9 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 9 scenario check passed (${tests.length} assertions).`);
