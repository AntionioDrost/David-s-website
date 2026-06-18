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
const askResponse = require(path.join(repoRoot, "core/cmp-ask-response.js"));
const reportGenerator = require(path.join(repoRoot, "core/cmp-report-generator.js"));
const propertyActions = require(path.join(repoRoot, "core/cmp-property-actions.js"));

const tests = [];

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

function selection(overrides = {}) {
  return {
    id: "address-stage8-1",
    uprn: "1000STAGE81",
    address: "31 Canonical Ask Road, Bristol, BS1 8AA",
    postcode: "BS1 8AA",
    city: "Bristol",
    type: "Terraced house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      currentScore: 70,
      potential: "B",
      potentialScore: 82,
      issue: "2024-04-10",
      expiry: "2034-04-10",
      certificate: "EPC-STAGE8-1",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function answer(questionId, value, overrides = {}) {
  return {
    id: `answer_${questionId}`,
    propertyId: overrides.propertyId || "prop_stage8",
    questionId,
    answer: value,
    context: overrides.context || "current",
    source: "user_stated",
    answeredAt: "2026-06-18T12:00:00.000Z",
    dependencyKeys: overrides.dependencyKeys || [],
    evidenceStatus: overrides.evidenceStatus || "unverified",
    editedHistory: [],
    sourceReferences: [{
      sourceType: "user_stated",
      sourceLabel: "Stage 8 test answer",
      sourceIdentifier: questionId,
      checkedDate: "2026-06-18",
      confidence: "medium",
      capabilityStatus: "simulated",
    }],
  };
}

function createProperty(overrides = {}, options = {}) {
  const result = bridge.createPropertyRecord(selection(overrides), {
    namespaceId: options.namespaceId || "guest:test-stage8",
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: options.isTenanted || "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: {},
      ...(options.journeyContext || {}),
    },
    serviceDraft: options.serviceDraft || {},
    now: "2026-06-18T12:00:00.000Z",
    randomUUID: () => options.id || "stage8-property",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  const propertyId = result.value.property.id;
  return {
    property: {
      ...result.value.property,
      landlordAnswers: (options.landlordAnswers || []).map((item) => ({ ...item, propertyId })),
      evidence: options.evidence || [],
      serviceRequests: options.serviceRequests || [],
      timeline: options.timeline || [],
      monitoring: options.monitoring || [],
      reports: options.reports || [],
    },
    serviceIntent: result.value.serviceIntent,
  };
}

function derive(property, options = {}) {
  const result = derivation.derivePropertyComplianceState(property, {
    now: "2026-06-18T12:00:00.000Z",
    ...options,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function buildContext(property, derivedState = derive(property), options = {}) {
  const result = askContext.buildAskCmpContext(property, derivedState, {
    currentPage: "dashboard-labs.html?propertyId=test",
    now: "2026-06-18T12:00:00.000Z",
    ...options,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function createServiceRequest(property) {
  const state = derive(property);
  const action = state.actionItems.find((item) => item.primaryCtaType === "request_service");
  assert.ok(action);
  const option = serviceLifecycle.resolveServiceOptionsForAction(action, property, state).value[0];
  assert.ok(option);
  const request = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "stage8-service-request",
  });
  assert.equal(request.ok, true, JSON.stringify(request.errors || []));
  return request.value.propertyRecord;
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

test("Ask CMP context is canonical, sourced and does not invent missing facts", () => {
  const noEpc = createProperty({ epc: null, hasGas: undefined }, { id: "stage8-no-epc" }).property;
  const context = buildContext(noEpc);
  assert.equal(context.property.id, noEpc.id);
  assert.match(context.property.displayAddress, /Canonical Ask Road/);
  assert.ok(context.smartChecks.some((check) => check.checkType === "epc"));
  assert.ok(context.issues.some((issue) => issue.category === "epc"));
  assert.ok(context.scores.legalCompliance);
  assert.ok(context.nextBestAction);
  assert.ok(context.evidenceGaps.length);
  assert.ok(context.knownFacts.some((fact) => fact.label === "Address"));
  assert.ok(context.missingFacts.some((fact) => /epc/i.test(fact.label)));
  assert.ok(context.unknownFacts.some((fact) => /heating/i.test(fact.label)));
  assert.ok(context.capabilityLimits.some((item) => /Guidance, not legal advice/i.test(item)));
  assert.equal(context.smartChecks.find((check) => check.checkType === "epc").value.epcRating, undefined);
  assert.equal(context.smartChecks.find((check) => check.checkType === "heating_source").value, null);
  assert.equal(JSON.stringify(context).includes("EPC-derived heating"), false);
});

test("suggested prompts are generated from relevant property context", () => {
  const standard = buildContext(createProperty({}, { id: "stage8-standard" }).property);
  const standardPrompts = askResponse.getSuggestedAskCmpPrompts(standard).value;
  assert.ok(standardPrompts.some((prompt) => prompt.id === "found-automatically"));
  assert.ok(standardPrompts.some((prompt) => prompt.id === "next-best-action"));

  const noEpc = buildContext(createProperty({ epc: null, hasGas: undefined }, { id: "stage8-prompts-no-epc" }).property);
  const noEpcPrompts = askResponse.getSuggestedAskCmpPrompts(noEpc).value;
  assert.ok(noEpcPrompts.some((prompt) => prompt.id === "epc-missing"));
  assert.ok(noEpcPrompts.some((prompt) => prompt.id === "gas-confirmation"));
  assert.equal(noEpcPrompts.some((prompt) => /gas failure/i.test(prompt.label)), false);

  const eicrHeld = createProperty({}, {
    id: "stage8-eicr-held",
    landlordAnswers: [answer("eicr_status", "have_it_but_no_proof", { evidenceStatus: "missing" })],
  }).property;
  const eicrPrompts = askResponse.getSuggestedAskCmpPrompts(buildContext(eicrHeld)).value;
  assert.ok(eicrPrompts.some((prompt) => prompt.id === "eicr-proof"));
  assert.equal(eicrPrompts.some((prompt) => /book another eicr/i.test(prompt.label)), false);

  const cleanCondition = askResponse.getSuggestedAskCmpPrompts(standard).value;
  assert.equal(cleanCondition.some((prompt) => prompt.id === "condition-issue"), false);
  const condition = createProperty({}, {
    id: "stage8-condition",
    landlordAnswers: [answer("condition_report", "tenant reported damp and mould")],
  }).property;
  const conditionPrompts = askResponse.getSuggestedAskCmpPrompts(buildContext(condition)).value;
  assert.ok(conditionPrompts.some((prompt) => prompt.id === "condition-issue"));
});

test("answers are deterministic, property-aware and prototype-safe", () => {
  const property = createServiceRequest(createProperty({ hasGas: true }, { id: "stage8-answer" }).property);
  const context = buildContext(property);
  const prompts = [
    "found-automatically",
    "unknowns",
    "next-best-action",
    "evidence-needed",
    "recommended-services",
  ];
  for (const promptId of prompts) {
    const answerResult = askResponse.answerAskCmpPrompt(context, promptId);
    assert.equal(answerResult.ok, true, JSON.stringify(answerResult.errors || []));
    const text = answerResult.value.answerText;
    assert.match(text, /31 Canonical Ask Road/);
    assert.match(text, /Based on current information|CMP found|next best action|Evidence gap|Recommended because/i);
    assert.match(text, /Guidance, not legal advice|Source|Confidence|Simulated|No supplier contacted|No payment taken/i);
    assert.doesNotMatch(text, /You are compliant|legally compliant|AI confirmed|Verified|Booked|Paid|Supplier contacted|Document stored/i);
  }
});

test("property-aware actions use safe Stage 7 mechanisms and preserve property scope", () => {
  const property = createProperty({ hasGas: true }, { id: "stage8-actions" }).property;
  const context = buildContext(property);
  const serviceAction = propertyActions.resolvePropertyAwareAction(context, { type: "prepare_service_request" }, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "stage8-action-service",
  });
  assert.equal(serviceAction.ok, true, JSON.stringify(serviceAction.errors || []));
  assert.equal(serviceAction.value.propertyId, property.id);
  assert.equal(serviceAction.value.capabilityStatus, "simulated");
  assert.equal(serviceAction.value.changedCanonicalState, true);
  assert.equal(serviceAction.value.propertyRecord.serviceRequests[0].propertyId, property.id);
  assert.equal(serviceAction.value.propertyRecord.serviceRequests[0].supplierJobPackData.supplierContacted, false);
  assert.equal(serviceAction.value.propertyRecord.serviceRequests[0].supplierJobPackData.paymentTaken, false);

  const evidenceAction = propertyActions.resolvePropertyAwareAction(
    buildContext(serviceAction.value.propertyRecord),
    { type: "create_evidence_placeholder", serviceRequestId: "svc_stage8-action-service" },
    { now: "2026-06-18T12:05:00.000Z" },
  );
  assert.equal(evidenceAction.ok, true, JSON.stringify(evidenceAction.errors || []));
  assert.equal(evidenceAction.value.propertyRecord.evidence[0].linkedServiceRequestId, "svc_stage8-action-service");
  assert.equal(evidenceAction.value.propertyRecord.evidence[0].capabilityStatus, "simulated");

  const reportAction = propertyActions.resolvePropertyAwareAction(context, { type: "generate_report_preview", reportType: "property_summary" }, {
    now: "2026-06-18T12:10:00.000Z",
  });
  assert.equal(reportAction.ok, true);
  assert.equal(reportAction.value.reportPreview.propertyId, property.id);
  assert.equal(reportAction.value.changedCanonicalState, false);

  const invalid = propertyActions.resolvePropertyAwareAction(context, { type: "send_legal_notice" });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /Unsupported property-aware action/i);
});

test("report previews are generated from canonical state with caveats", () => {
  const property = createServiceRequest(createProperty({ hasGas: true }, { id: "stage8-reports" }).property);
  const state = derive(property);
  const types = [
    "property_summary",
    "compliance_status_summary",
    "evidence_gap_summary",
    "pre_let_readiness_summary",
    "service_job_pack_preview",
    "monitoring_summary",
  ];
  for (const type of types) {
    const preview = reportGenerator.generateReportPreview(property, state, type, {
      now: "2026-06-18T12:00:00.000Z",
    });
    assert.equal(preview.ok, true, JSON.stringify(preview.errors || []));
    assert.equal(preview.value.propertyId, property.id);
    assert.equal(preview.value.reportType, type);
    assert.equal(preview.value.generatedAt, "2026-06-18T12:00:00.000Z");
    assert.ok(preview.value.generatedFrom.schemaVersion);
    assert.ok(preview.value.generatedFrom.ruleVersion);
    assert.ok(preview.value.sections.length);
    assert.match(preview.value.caveat, /Guidance, not legal advice|Report preview|Based on current information/i);
    assert.doesNotMatch(JSON.stringify(preview.value), /legal compliance guarantee|legally compliant|Uploaded and stored|AI confirmed/i);
  }
  const record = reportGenerator.createReportRecord(property, state, "property_summary", {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "stage8-report",
  });
  assert.equal(record.ok, true);
  assert.equal(record.value.reportRecord.propertyId, property.id);
  assert.equal(record.value.reportRecord.capabilityStatus, "simulated");
});

test("selected property UI exposes canonical Ask CMP and report wiring only", async () => {
  const html = read("dashboard-labs.html");
  const code = read("dashboard-labs.js");
  assert.ok(html.includes("core/cmp-ask-context.js"));
  assert.ok(html.includes("core/cmp-ask-response.js"));
  assert.ok(html.includes("core/cmp-report-generator.js"));
  assert.ok(html.includes("core/cmp-property-actions.js"));
  assert.match(code, /canonicalAskCmpContext/);
  assert.match(code, /renderCanonicalAskReportPanel/);
  assert.match(code, /data-canonical-ask-prompt/);
  assert.match(code, /data-canonical-report-preview/);
  assert.match(code, /Report preview/);
  assert.match(code, /Based on current information/);
  assert.match(code, /Guidance, not legal advice/);

  await withStaticServer(async (origin) => {
    for (const route of [
      "/index.html",
      "/add-property.html",
      "/my-properties.html",
      "/services.html",
      "/dashboard-labs.html?demo=nick",
      "/dashboard-labs.html?state=empty&qa=1",
      "/az-checker-v2.html",
      "/dashboard.html",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

test("Stage 8 isolation preserves routes, scenarios, portfolio and external boundaries", () => {
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
  assert.doesNotMatch(stagedDiff, /^\+.*(?:fetch\(|XMLHttpRequest|api\.openai|OpenAI|localStorage\.clear|sessionStorage\.clear|removeItem\()/m);
  assert.doesNotMatch(stagedDiff, /^\+.*(?:portfolio intelligence|scenario seed|guided demo)/im);
});

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 8 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 8 Ask CMP/report check passed (${tests.length} assertions).`);
