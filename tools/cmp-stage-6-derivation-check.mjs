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
const priorityRules = require(path.join(repoRoot, "core/cmp-priority-rules.js"));

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  // Historical Stage 6 scope is pinned to its commit range; functional checks
  // below still read the current cumulative branch.
  return execFileSync("git", ["diff", "--name-only", "40a2861..81317b5"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function selection(overrides = {}) {
  return {
    id: "address-stage6-1",
    uprn: "1000STAGE61",
    address: "12 Rules Street, Coventry, CV1 1AA",
    postcode: "CV1 1AA",
    city: "Coventry",
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
      certificate: "EPC-STAGE6-1",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function createProperty(overrides = {}, options = {}) {
  const result = bridge.createPropertyRecord(selection(overrides), {
    namespaceId: "guest:test-stage6",
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "yes",
      answeredQuestions: {},
      ...(options.journeyContext || {}),
    },
    now: "2026-06-18T12:00:00.000Z",
    randomUUID: () => options.id || "stage6-property",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    ...result.value.property,
    landlordAnswers: options.landlordAnswers || [],
    evidence: options.evidence || [],
    serviceRequests: options.serviceRequests || [],
  };
}

function evidence(id, propertyId, evidenceType, overrides = {}) {
  return {
    id,
    propertyId,
    linkedIssueId: overrides.linkedIssueId || null,
    linkedActionId: overrides.linkedActionId || null,
    linkedServiceRequestId: null,
    evidenceType,
    proofStatus: overrides.proofStatus || "accepted",
    verificationStatus: overrides.verificationStatus || "accepted",
    source: overrides.source || "user_stated",
    capabilityStatus: overrides.capabilityStatus || "simulated",
    issuedDate: overrides.issuedDate || "2026-01-01",
    expiryDate: overrides.expiryDate || null,
    extractedFields: {},
    userConfirmationState: overrides.userConfirmationState || "confirmed",
    sourceReferences: overrides.sourceReferences || [],
  };
}

function answer(id, propertyId, questionId, value, overrides = {}) {
  return {
    id,
    propertyId,
    questionId,
    answer: value,
    context: overrides.context || "current",
    source: "user_stated",
    answeredAt: "2026-06-18T12:00:00.000Z",
    dependencyKeys: overrides.dependencyKeys || [],
    evidenceStatus: overrides.evidenceStatus || "unverified",
    editedHistory: [],
    sourceReferences: [],
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

function byCategory(state, category) {
  return state.issues.filter((issue) => issue.category === category);
}

function issueByRule(state, ruleId) {
  return state.issues.find((issue) => issue.createdFromRule === ruleId);
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

test("standard property with valid EPC and critical evidence returns non-urgent status", () => {
  const property = createProperty({}, { id: "stage6-standard" });
  property.evidence = [
    evidence("gas-ok", property.id, "gas_safety_certificate", { expiryDate: "2027-01-01" }),
    evidence("eicr-ok", property.id, "eicr_certificate", { expiryDate: "2031-01-01" }),
    evidence("alarm-ok", property.id, "alarm_record"),
    evidence("deposit-ok", property.id, "deposit_protection"),
  ];
  const state = derive(property);
  assert.notEqual(state.riskLevel, "urgent");
  assert.equal(byCategory(state, "epc").length, 0);
  assert.ok(state.scores.legalCompliance.value >= 70);
});

test("No-EPC property creates EPC issue without EPC-derived facts", () => {
  const property = createProperty({
    epc: null,
    hasGas: null,
    fixedCombustion: null,
  }, { id: "stage6-no-epc" });
  const state = derive(property);
  assert.ok(issueByRule(state, "epc_missing"));
  const serialized = JSON.stringify(state);
  assert.doesNotMatch(serialized, /epcRating/i);
  assert.doesNotMatch(serialized, /epcPotential/i);
  assert.doesNotMatch(serialized, /epcExpiry/i);
  assert.doesNotMatch(serialized, /EPC-derived/i);
});

test("gas unknown creates confirmation issue only", () => {
  const property = createProperty({ hasGas: null, fixedCombustion: null }, { id: "stage6-gas-unknown" });
  const state = derive(property);
  assert.ok(issueByRule(state, "gas_unknown"));
  assert.equal(issueByRule(state, "gas_missing_evidence"), undefined);
});

test("gas present with no proof creates gas evidence issue", () => {
  const property = createProperty({ hasGas: true }, { id: "stage6-gas-missing" });
  const state = derive(property);
  assert.ok(issueByRule(state, "gas_missing_evidence"));
  assert.ok(state.evidenceGaps.some((gap) => gap.evidenceType === "gas_safety_certificate"));
});

test("EICR unknown creates issue, held without proof creates evidence gap not no-EICR", () => {
  const unknownProperty = createProperty({}, { id: "stage6-eicr-unknown" });
  const unknownState = derive(unknownProperty);
  assert.ok(issueByRule(unknownState, "eicr_missing_or_unknown"));

  const heldProperty = createProperty({}, {
    id: "stage6-eicr-held",
    landlordAnswers: [answer("answer-eicr-held", "prop_stage6-eicr-held", "eicr_status", "i_have_it_but_no_proof_available", { evidenceStatus: "missing" })],
  });
  const heldState = derive(heldProperty);
  assert.ok(issueByRule(heldState, "eicr_held_no_proof"));
  assert.equal(issueByRule(heldState, "eicr_missing_or_unknown"), undefined);
  assert.ok(heldState.evidenceGaps.some((gap) => gap.proofStatus === "held_no_proof"));
});

test("vacant property does not acquire occupant count and deposit unknown is tenancy-context aware", () => {
  const vacant = createProperty({}, {
    id: "stage6-vacant",
    journeyContext: { isTenanted: "no" },
    landlordAnswers: [answer("answer-vacant", "prop_stage6-vacant", "current_occupancy", "vacant")],
  });
  const vacantState = derive(vacant);
  assert.equal(vacantState.context.occupantCount, null);
  assert.equal(issueByRule(vacantState, "deposit_unknown"), undefined);

  const tenanted = createProperty({}, {
    id: "stage6-tenanted",
    journeyContext: { isTenanted: "yes" },
  });
  const tenantedState = derive(tenanted);
  assert.ok(issueByRule(tenantedState, "deposit_unknown"));
});

test("low EPC and damp/mould create future readiness and condition issues", () => {
  const property = createProperty({
    epc: { rating: "E", currentScore: 45, potential: "C", potentialScore: 72, expiry: "2032-01-01", certificate: "LOW-EPC" },
  }, {
    id: "stage6-low-epc-damp",
    landlordAnswers: [answer("answer-condition", "prop_stage6-low-epc-damp", "condition", "damp_mould_reported")],
  });
  const state = derive(property);
  assert.ok(issueByRule(state, "epc_low_rating_future_readiness"));
  assert.ok(issueByRule(state, "condition_damp_mould"));
});

test("simulated proof remains simulated and is not live verification", () => {
  const property = createProperty({}, { id: "stage6-simulated-proof" });
  property.evidence = [evidence("sim-proof", property.id, "gas_safety_certificate", { capabilityStatus: "simulated", verificationStatus: "accepted" })];
  const state = derive(property);
  assert.ok(state.evidenceState.some((item) => item.capabilityStatus === "simulated"));
  assert.equal(state.evidenceState.some((item) => item.capabilityStatus === "live" && item.verificationStatus === "accepted"), false);
});

test("scores are conservative and explainable", () => {
  const property = createProperty({ hasGas: true }, { id: "stage6-scores" });
  const state = derive(property);
  assert.ok(state.scores.legalCompliance.value < 80);
  assert.ok(state.scores.evidenceStrength.value < 80);
  assert.ok(state.scores.confidence.value < 80);
  assert.ok(state.scores.legalCompliance.explanation);
  assert.ok(state.scores.futureReadiness.explanation);
});

test("priority is explicit and not arbitrary array order", () => {
  const lowEpcProperty = createProperty({
    epc: { rating: "E", currentScore: 45, potential: "C", potentialScore: 72, expiry: "2032-01-01", certificate: "LOW-EPC" },
  }, { id: "stage6-priority-low-epc" });
  const gasIssue = {
    issueId: "gas",
    propertyId: lowEpcProperty.id,
    category: "gas_safety",
    severity: "high",
    legalUrgency: "urgent",
    confidence: "medium",
    recommendedActionType: "request_service",
    createdFromRule: "gas_missing_evidence",
    evidenceNeeded: ["gas_safety_certificate"],
  };
  const lowEpcIssue = {
    issueId: "low-epc",
    propertyId: lowEpcProperty.id,
    category: "future_readiness",
    severity: "low",
    legalUrgency: "watch",
    confidence: "high",
    recommendedActionType: "plan_improvement",
    createdFromRule: "epc_low_rating_future_readiness",
    evidenceNeeded: [],
  };
  const gasPriority = priorityRules.calculateIssuePriority(gasIssue, { occupancyStatus: "occupied", userGoal: "full_compliance" });
  const epcPriority = priorityRules.calculateIssuePriority(lowEpcIssue, { occupancyStatus: "occupied", userGoal: "full_compliance" });
  assert.ok(gasPriority.score > epcPriority.score);
});

test("upload-proof action wins when proof is claimed but missing", () => {
  const property = createProperty({}, {
    id: "stage6-upload-proof",
    landlordAnswers: [answer("answer-eicr-held-proof", "prop_stage6-upload-proof", "eicr_status", "i_have_it_but_no_proof_available", { evidenceStatus: "missing" })],
  });
  const state = derive(property);
  assert.equal(state.nextBestAction.primaryCtaType, "add_evidence");
  assert.equal(state.nextBestAction.primaryCtaLabel, "Add proof later");
  assert.ok(state.nextBestAction.linkedIssueId);
  assert.ok(state.nextBestAction.reason);
});

test("evidence gaps distinguish proof states and link issue/action", () => {
  const property = createProperty({}, { id: "stage6-gaps" });
  property.evidence = [
    evidence("expired-gas", property.id, "gas_safety_certificate", { proofStatus: "expired", verificationStatus: "expired", expiryDate: "2025-01-01" }),
  ];
  const state = derive(property);
  assert.ok(state.evidenceGaps.some((gap) => gap.proofStatus === "expired"));
  assert.ok(state.evidenceGaps.every((gap) => gap.linkedIssueId));
  assert.ok(state.actionItems.some((action) => action.linkedIssueId));
});

test("monitoring derives from expiry and unresolved evidence gaps", () => {
  const property = createProperty({}, { id: "stage6-monitoring" });
  property.evidence = [evidence("gas-expiry", property.id, "gas_safety_certificate", { expiryDate: "2026-07-01" })];
  const state = derive(property);
  assert.ok(state.monitoringItems.some((item) => item.monitoringType === "expiry"));
  assert.ok(state.monitoringItems.some((item) => item.monitoringType === "evidence_gap"));
  assert.ok(state.monitoringItems.every((item) => item.reason && item.nextAction));
});

test("dashboard Labs selected-property route is wired to derivation", () => {
  const html = read("dashboard-labs.html");
  const code = read("dashboard-labs.js");
  assert.ok(html.indexOf("core/cmp-compliance-derivation.js") > -1);
  assert.ok(html.indexOf("core/cmp-compliance-derivation.js") < html.indexOf("dashboard-labs.js"));
  assert.match(code, /derivePropertyComplianceState/);
  assert.match(code, /derivedState/);
  assert.match(code, /nextBestAction/);
  assert.match(code, /canonicalDerivedState/);
});

test("invalid and missing selected property handling still avoids fixture fallback", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /invalidWorkspaceShell/);
  assert.doesNotMatch(code, /invalidWorkspaceShell[\s\S]{0,400}57 The Butts/);
});

test("direct demo and QA routes still return HTTP 200", async () => {
  await withStaticServer(async (origin) => {
    for (const route of ["/dashboard-labs.html?demo=nick", "/dashboard-labs.html?state=empty&qa=1"]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

test("Stage 6 isolation keeps unrelated systems untouched", () => {
  const changed = changedFiles();
  const forbidden = [
    "index.html",
    "services.html",
    "public-pages.js",
    "my-properties.html",
    "add-property.html",
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
    "dashboard-labs.css",
  ];
  assert.deepEqual(changed.filter((file) => forbidden.includes(file)), []);
  assert.equal(changed.some((file) => /^app\//.test(file)), false);
  assert.equal(changed.some((file) => /^services?/.test(file) && file.endsWith(".html")), false);
  assert.doesNotMatch(read("dashboard-labs.js"), /generateReport|report generated|Ask CMP.*derivePropertyComplianceState/i);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
  } catch (error) {
    console.error(`Stage 6 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 6 derivation check passed (${passed} assertions).`);
