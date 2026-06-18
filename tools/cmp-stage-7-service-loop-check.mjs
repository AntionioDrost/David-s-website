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
const evidenceLifecycle = require(path.join(repoRoot, "core/cmp-evidence-lifecycle.js"));

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
    id: "address-stage7-1",
    uprn: "1000STAGE71",
    address: "24 Service Loop Road, Leeds, LS1 7AA",
    postcode: "LS1 7AA",
    city: "Leeds",
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
      certificate: "EPC-STAGE7-1",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function createProperty(overrides = {}, options = {}) {
  const result = bridge.createPropertyRecord(selection(overrides), {
    namespaceId: "guest:test-stage7",
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: {},
      ...(options.journeyContext || {}),
    },
    serviceDraft: options.serviceDraft || {},
    now: "2026-06-18T12:00:00.000Z",
    randomUUID: () => options.id || "stage7-property",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    property: {
      ...result.value.property,
      landlordAnswers: options.landlordAnswers || [],
      evidence: options.evidence || [],
      serviceRequests: options.serviceRequests || [],
      timeline: options.timeline || [],
      monitoring: options.monitoring || [],
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

function issue(category, rule = category) {
  return {
    issueId: `issue_${rule}`,
    propertyId: "prop_test",
    category,
    status: "open",
    severity: "high",
    legalUrgency: "high",
    confidence: "medium",
    sourceRefs: [],
    triggerFacts: [],
    triggerAnswers: [],
    reason: `${category} gap`,
    recommendedActionType: "request_service",
    evidenceNeeded: [`${category}_proof`],
    createdFromRule: rule,
    capabilityStatus: "simulated",
  };
}

function actionForIssue(linkedIssue, overrides = {}) {
  return {
    actionId: `${linkedIssue.issueId}_action`,
    propertyId: linkedIssue.propertyId,
    linkedIssueId: linkedIssue.issueId,
    title: `${linkedIssue.category} action`,
    reason: linkedIssue.reason,
    sourceConfidenceSummary: "Source confidence: medium · Capability: simulated",
    nextStep: "Prepare service request.",
    primaryCtaType: "request_service",
    primaryCtaLabel: "Request service",
    secondaryCtaType: "add_evidence",
    secondaryCtaLabel: "Add proof later",
    status: "recommended",
    priorityScore: 80,
    priorityExplanation: "Test priority",
    capabilityStatus: "simulated",
    issue: linkedIssue,
    ...overrides,
  };
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

test("service catalog maps issues without unsafe fallback", () => {
  const mappings = [
    [issue("epc", "epc_missing"), "epc-assessment"],
    [issue("gas_safety", "gas_missing_evidence"), "gas-safety"],
    [issue("eicr", "eicr_missing_or_unknown"), "eicr"],
    [issue("property_condition", "condition_damp_mould"), "damp-mould-support"],
    [issue("licensing_hmo", "licensing_hmo_possible"), "licensing-hmo-check"],
  ];
  for (const [linkedIssue, expectedServiceId] of mappings) {
    const options = serviceLifecycle.resolveServiceOptionsForAction(actionForIssue(linkedIssue), { id: linkedIssue.propertyId }, { issues: [linkedIssue] });
    assert.equal(options.ok, true, JSON.stringify(options.errors || []));
    assert.equal(options.value[0]?.serviceId, expectedServiceId);
    assert.match(options.value[0].recommendedBecause, /^Recommended because/i);
    assert.equal(options.value[0].capabilityStatus, "simulated");
  }
  const unknownIssue = issue("totally_unknown", "unknown_gap");
  const unmapped = serviceLifecycle.resolveServiceOptionsForAction(actionForIssue(unknownIssue), { id: unknownIssue.propertyId }, { issues: [unknownIssue] });
  assert.equal(unmapped.ok, true);
  assert.equal(unmapped.value.length, 0);
  assert.ok(unmapped.warnings.some((warning) => /No service option/i.test(warning)));
});

test("public service draft becomes attached ServiceIntentDraft without request", () => {
  const { property, serviceIntent } = createProperty({}, {
    id: "stage7-service-intent",
    journeyContext: {
      entryService: "eicr",
      focusMode: "service_only",
      sourceRoute: "eicr.html",
      answeredQuestions: { eicr_age: "unknown" },
    },
    serviceDraft: {
      entryService: "eicr",
      focusMode: "service_only",
      eicr_age: "unknown",
      eicr_upload: "old-eicr-name-only.pdf",
    },
  });
  assert.ok(serviceIntent);
  assert.equal(serviceIntent.serviceId, "eicr");
  assert.equal(serviceIntent.propertyId, property.id);
  assert.equal(serviceIntent.serviceAnswers.eicr_age, "unknown");
  assert.equal(serviceIntent.evidencePlaceholders[0].fileName, "old-eicr-name-only.pdf");
  assert.equal(serviceIntent.evidencePlaceholders[0].stored, false);
  assert.deepEqual(property.serviceRequests, []);

  const requestResult = serviceLifecycle.createServiceRequestFromServiceIntent(property, serviceIntent, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "service-intent-request",
  });
  assert.equal(requestResult.ok, true, JSON.stringify(requestResult.errors || []));
  assert.equal(requestResult.value.serviceRequest.propertyId, property.id);
  assert.equal(requestResult.value.serviceRequest.source, "public_service");
  assert.equal(requestResult.value.serviceRequest.serviceId, "eicr");
  assert.equal(requestResult.value.serviceRequest.supplierJobPackData.supplierContacted, false);
});

test("derived action creates simulated ServiceRequest with property issue and action links", () => {
  const { property } = createProperty({ hasGas: true }, { id: "stage7-gas-request" });
  const state = derive(property);
  const gasAction = state.actionItems.find((action) => action.linkedIssueId?.includes("gas_missing_evidence"));
  assert.ok(gasAction);
  const serviceOptions = serviceLifecycle.resolveServiceOptionsForAction(gasAction, property, state);
  assert.equal(serviceOptions.ok, true);
  assert.equal(serviceOptions.value[0].serviceId, "gas-safety");
  const requestResult = serviceLifecycle.createServiceRequestFromAction(property, gasAction, serviceOptions.value[0], {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "gas-request",
  });
  assert.equal(requestResult.ok, true, JSON.stringify(requestResult.errors || []));
  const { serviceRequest, propertyRecord } = requestResult.value;
  assert.equal(serviceRequest.propertyId, property.id);
  assert.equal(serviceRequest.issueId, gasAction.linkedIssueId);
  assert.equal(serviceRequest.actionId, gasAction.actionId);
  assert.equal(serviceRequest.serviceId, "gas-safety");
  assert.equal(serviceRequest.requestMode, "simulated");
  assert.equal(serviceRequest.capabilityStatus, "simulated");
  assert.equal(serviceRequest.supplierJobPackData.supplierContacted, false);
  assert.equal(serviceRequest.supplierJobPackData.paymentTaken, false);
  assert.match(serviceRequest.supplierJobPackData.statusCopy, /Service request prepared/i);
  assert.equal(propertyRecord.serviceRequests.length, 1);
});

test("service lifecycle statuses are safe and idempotent enough for repeated events", () => {
  const { property } = createProperty({ hasGas: true }, { id: "stage7-lifecycle" });
  const state = derive(property);
  const action = state.actionItems.find((item) => item.linkedIssueId?.includes("gas_missing_evidence"));
  const option = serviceLifecycle.resolveServiceOptionsForAction(action, property, state).value[0];
  const created = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "lifecycle-request",
  }).value.propertyRecord;
  const progressed = serviceLifecycle.updateServiceRequestStatus(created, "svc_lifecycle-request", "quote_requested", {
    now: "2026-06-18T12:05:00.000Z",
  });
  assert.equal(progressed.ok, true, JSON.stringify(progressed.errors || []));
  assert.equal(progressed.value.serviceRequest.requestStatus, "quote_requested");
  assert.match(progressed.value.serviceRequest.supplierJobPackData.statusCopy, /no supplier contacted/i);
  assert.equal(progressed.value.serviceRequest.supplierJobPackData.paymentTaken, false);

  const repeated = serviceLifecycle.updateServiceRequestStatus(progressed.value.propertyRecord, "svc_lifecycle-request", "quote_requested", {
    now: "2026-06-18T12:05:00.000Z",
  });
  assert.equal(repeated.ok, true);
  assert.ok(repeated.warnings.some((warning) => /already/i.test(warning)));

  const invalid = serviceLifecycle.updateServiceRequestStatus(progressed.value.propertyRecord, "svc_lifecycle-request", "paid");
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /Unsupported service status/i);
});

test("service completion creates simulated evidence and improves derived gaps only after accepted proof", () => {
  const { property } = createProperty({ hasGas: true }, { id: "stage7-evidence-loop" });
  const before = derive(property);
  const action = before.actionItems.find((item) => item.linkedIssueId?.includes("gas_missing_evidence"));
  const option = serviceLifecycle.resolveServiceOptionsForAction(action, property, before).value[0];
  const requested = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-18T12:00:00.000Z",
    randomId: () => "evidence-loop-request",
  }).value.propertyRecord;
  const placeholder = evidenceLifecycle.createEvidencePlaceholderFromServiceRequest(requested, requested.serviceRequests[0], {
    now: "2026-06-18T12:10:00.000Z",
  });
  assert.equal(placeholder.ok, true, JSON.stringify(placeholder.errors || []));
  assert.equal(placeholder.value.evidenceItem.linkedServiceRequestId, "svc_evidence-loop-request");
  assert.equal(placeholder.value.evidenceItem.linkedIssueId, action.linkedIssueId);
  assert.equal(placeholder.value.evidenceItem.proofStatus, "needs_review");
  assert.equal(placeholder.value.evidenceItem.verificationStatus, "needs_review");
  assert.equal(placeholder.value.evidenceItem.capabilityStatus, "simulated");
  const placeholderDerived = derive(placeholder.value.propertyRecord);
  assert.ok(placeholderDerived.evidenceGaps.some((gap) => gap.evidenceType === "gas_safety_certificate"));

  const simulated = evidenceLifecycle.createSimulatedEvidenceFromServiceRequest(placeholder.value.propertyRecord, requested.serviceRequests[0], {
    now: "2026-06-18T12:20:00.000Z",
    confirmationState: "confirmed",
  });
  assert.equal(simulated.ok, true, JSON.stringify(simulated.errors || []));
  assert.equal(simulated.value.evidenceItem.proofStatus, "accepted");
  assert.equal(simulated.value.evidenceItem.verificationStatus, "accepted");
  assert.equal(simulated.value.evidenceItem.capabilityStatus, "simulated");
  assert.equal(simulated.value.evidenceItem.source, "supplier_confirmed");
  const after = derive(simulated.value.propertyRecord);
  assert.equal(after.evidenceGaps.some((gap) => gap.evidenceType === "gas_safety_certificate"), false);
});

test("dashboard Labs selected-property route exposes canonical service loop wiring and safe copy", () => {
  const html = read("dashboard-labs.html");
  const code = read("dashboard-labs.js");
  assert.ok(html.includes("core/cmp-service-lifecycle.js"));
  assert.ok(html.includes("core/cmp-evidence-lifecycle.js"));
  assert.match(code, /createCanonicalServiceRequest/);
  assert.match(code, /completeCanonicalServiceEvidence/);
  assert.match(code, /Recommended because/);
  assert.match(code, /No supplier contacted/);
  assert.match(code, /No payment taken/);
  assert.match(code, /Evidence needs review/);
  assert.doesNotMatch(code, /Supplier contacted|Payment taken|Uploaded and stored|Fully compliant|Legally compliant|AI confirmed compliance/);
});

test("route and product isolation stays inside selected canonical service loop", async () => {
  await withStaticServer(async (origin) => {
    for (const route of [
      "/services.html",
      "/epcs.html",
      "/gas-safety.html",
      "/eicr.html",
      "/property-inspections.html",
      "/selective-licensing.html",
      "/mould-damp.html",
      "/add-property.html",
      "/my-properties.html",
      "/dashboard-labs.html?demo=nick",
      "/dashboard-labs.html?state=empty&qa=1",
      "/az-checker-v2.html",
      "/dashboard.html",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });

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
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
  ];
  assert.deepEqual(changed.filter((file) => forbidden.includes(file)), []);
  assert.doesNotMatch(changed.join("\n"), /^app\//m);
  assert.doesNotMatch(read("dashboard-labs.js"), /generateReport|report generated|Ask CMP.*createServiceRequest/i);
  const dashboardDiff = execFileSync("git", ["diff", "--", "dashboard-labs.js"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(dashboardDiff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|removeItem\()/m);
});

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 7 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 7 service loop check passed (${tests.length} assertions).`);
