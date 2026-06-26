import assert from "node:assert/strict";
import fs from "node:fs";
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

function functionSlice(source, functionName, length = 16000) {
  const index = source.indexOf(`function ${functionName}`);
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

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function selection(overrides = {}) {
  return {
    id: "stage-e-address",
    uprn: "STAGE-E-UPRN",
    address: "18, Willow Brook Drive, Birmingham, B37 7BA",
    postcode: "B37 7BA",
    city: "Birmingham",
    type: "Semi-detached house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      currentScore: 72,
      potential: "B",
      potentialScore: 83,
      issue: "2024-02-10",
      expiry: "2034-02-10",
      certificate: "STAGE-E-EPC",
      source: "Example EPC preview",
    },
    ...overrides,
  };
}

function createProperty(overrides = {}, options = {}) {
  const result = bridge.createPropertyRecord(selection(overrides), {
    namespaceId: options.namespaceId || "guest:stage-e",
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: options.isTenanted || "yes",
      sourceRoute: "add-property.html",
      answeredQuestions: options.answeredQuestions || {},
    },
    now: options.now || "2026-06-25T10:00:00.000Z",
    randomUUID: () => options.id || "stage-e-property",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return {
    ...result.value.property,
    landlordAnswers: options.landlordAnswers || [],
    evidence: options.evidence || [],
    serviceRequests: options.serviceRequests || [],
    timeline: options.timeline || [],
    monitoring: options.monitoring || [],
  };
}

function derive(property, options = {}) {
  const result = derivation.derivePropertyComplianceState(property, {
    now: "2026-06-25T10:00:00.000Z",
    ...options,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function actionFor(property, matcher = /eicr|gas/i) {
  const state = derive(property);
  const action = state.actionItems.find((item) => matcher.test(`${item.title} ${item.reason} ${item.primaryCtaLabel}`));
  assert.ok(action, `expected action matching ${matcher}`);
  const options = serviceLifecycle.resolveServiceOptionsForAction(action, property, state);
  assert.equal(options.ok, true, JSON.stringify(options.errors || []));
  assert.ok(options.value[0], `expected service option for ${action.actionId}`);
  return { state, action, option: options.value[0] };
}

function serviceEvents(record) {
  return (record.timeline || []).filter((event) => event.sourceEntityType === "service_request");
}

function evidenceEvents(record) {
  return (record.timeline || []).filter((event) => event.sourceEntityType === "evidence");
}

test("one full Evidence Vault renderer owns normal evidence rows", () => {
  const code = read("dashboard-labs.js");
  assert.equal(countMatches(code, /function\s+renderSelectedCanonicalEvidenceState\s*\(/g), 1);
  assert.match(functionSlice(code, "renderPortfolioEvidenceState", 5000), /isNormalSelectedCanonicalWorkspace\(\)[\s\S]{0,120}renderSelectedCanonicalEvidenceState\(\)/);
});

test("Evidence Inbox is rendered as a helper inside Evidence Vault", () => {
  const html = read("dashboard-labs.html");
  const evidenceSection = html.slice(html.indexOf("data-portfolio-evidence"), html.indexOf("data-portfolio-tasks"));
  assert.match(evidenceSection, /evidence-inbox-panel/);
  assert.match(evidenceSection, /data-evidence-inbox-address/);
  assert.doesNotMatch(html, /data-global-nav="Evidence Inbox"|data-portfolio-inbox/);
});

test("Smart Upload and Add Evidence focus Evidence Vault intake", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function focusCanonicalEvidenceIntake\(/);
  assert.match(functionSlice(code, "openPropertySmartUpload", 1200), /focusCanonicalEvidenceIntake/);
  assert.match(functionSlice(code, "bindSmartUpload", 1600), /isNormalSelectedCanonicalWorkspace\(\)[\s\S]{0,180}focusCanonicalEvidenceIntake/);
});

test("overview evidence preview deep-links to Evidence Vault instead of mutating", () => {
  const code = read("dashboard-labs.js");
  const renderBlock = functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 32000);
  assert.match(renderBlock, /data-canonical-focus="evidence"/);
  assert.doesNotMatch(renderBlock, /data-canonical-service-evidence-complete/);
});

test("Action Plan has a canonical normal-route renderer", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function renderSelectedCanonicalActionPlanState\(/);
  assert.match(functionSlice(code, "renderPortfolioTasksState", 2400), /isNormalSelectedCanonicalWorkspace\(\)[\s\S]{0,160}renderSelectedCanonicalActionPlanState\(\)/);
});

test("Action Plan evidence actions open Evidence Vault items", () => {
  const code = read("dashboard-labs.js");
  const actionPlan = functionSlice(code, "renderSelectedCanonicalActionPlanState", 14000);
  assert.match(actionPlan, /data-canonical-focus="evidence"/);
  assert.doesNotMatch(actionPlan, /data-upload-trigger|openPropertySmartUpload/);
});

test("Timeline normal route is read-only", () => {
  const code = read("dashboard-labs.js");
  const timeline = functionSlice(code, "renderSelectedCanonicalTimelineState", 5000);
  assert.doesNotMatch(timeline, /data-canonical-service-request|data-upload-trigger|data-note-open|data-summary-open/);
  assert.match(timeline, /data-canonical-focus="evidence"|data-canonical-focus="action"/);
});

test("Monitoring has a canonical derived normal-route renderer", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function renderSelectedCanonicalMonitoringState\(/);
  assert.match(functionSlice(code, "renderPortfolioActivityState", 2200), /isNormalSelectedCanonicalWorkspace\(\)[\s\S]{0,160}renderSelectedCanonicalMonitoringState\(\)/);
  assert.match(functionSlice(code, "renderSelectedCanonicalMonitoringState", 14000), /derivedState\?\.monitoringItems/);
});

test("Monitoring renderer does not own evidence records or service forms", () => {
  const code = read("dashboard-labs.js");
  const monitoring = functionSlice(code, "renderSelectedCanonicalMonitoringState", 16000);
  assert.doesNotMatch(monitoring, /data-upload-trigger|data-service-create|createCanonicalServiceRequest|completeCanonicalServiceEvidence/);
  assert.match(monitoring, /const focus = item\.linkedEvidenceId \? "evidence" : item\.linkedActionId \? "action" : "monitoring"/);
  assert.match(monitoring, /data-canonical-focus="\$\{escapeHtml\(focus\)\}"/);
});

test("canonical service requests are idempotent by property, action and service", () => {
  const property = createProperty({}, { id: "stage-e-idempotent-service" });
  const { action, option } = actionFor(property, /gas/i);
  const first = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-25T10:00:00.000Z",
  });
  assert.equal(first.ok, true, JSON.stringify(first.errors || []));
  const second = serviceLifecycle.createServiceRequestFromAction(first.value.propertyRecord, action, option, {
    now: "2026-06-25T10:01:00.000Z",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors || []));
  assert.equal(second.value.propertyRecord.serviceRequests.length, 1);
  assert.equal(serviceEvents(second.value.propertyRecord).length, 1);
});

test("evidence placeholders are idempotent by evidence id", () => {
  const property = createProperty({}, { id: "stage-e-idempotent-evidence" });
  const { action, option } = actionFor(property, /gas/i);
  const requested = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-25T10:00:00.000Z",
  }).value.propertyRecord;
  const first = evidenceLifecycle.createEvidencePlaceholderFromServiceRequest(requested, requested.serviceRequests[0], {
    now: "2026-06-25T10:02:00.000Z",
  });
  assert.equal(first.ok, true, JSON.stringify(first.errors || []));
  const second = evidenceLifecycle.createEvidencePlaceholderFromServiceRequest(first.value.propertyRecord, requested.serviceRequests[0], {
    now: "2026-06-25T10:03:00.000Z",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors || []));
  assert.equal(second.value.propertyRecord.evidence.length, 1);
  assert.equal(evidenceEvents(second.value.propertyRecord).length, 1);
});

test("accepted proof is not presented as legally verified", () => {
  const code = read("dashboard-labs.js");
  const canonicalEvidence = functionSlice(code, "renderSelectedCanonicalEvidenceState", 7000);
  const canonicalRows = functionSlice(code, "selectedCanonicalEvidenceRows", 10000);
  assert.match(canonicalRows, /Accepted proof/);
  assert.doesNotMatch(canonicalEvidence + canonicalRows, /Legally verified|Verified proof|Fully compliant|legal verification/i);
});

test("Missing EICR creates one clear evidence gap", () => {
  const property = createProperty({}, { id: "stage-e-eicr-gap" });
  const state = derive(property);
  const eicrGaps = state.evidenceGaps.filter((gap) => /eicr/i.test(gap.evidenceType));
  assert.equal(eicrGaps.length, 1);
  assert.equal(new Set(eicrGaps.map((gap) => gap.gapId)).size, 1);
});

test("Evidence Vault displays accepted evidence from canonical evidence state", () => {
  const code = read("dashboard-labs.js");
  const rows = functionSlice(code, "selectedCanonicalEvidenceRows", 12000);
  assert.match(rows, /derivedState\?\.evidenceState|record\?\.evidence/);
  assert.match(rows, /linkedServiceRequestId|sourceReferences/);
  assert.match(rows, /Accepted proof/);
});

test("Adding EICR proof updates evidence and resolves the EICR gap", () => {
  const property = createProperty({}, { id: "stage-e-eicr-proof" });
  const { action, option } = actionFor(property, /eicr/i);
  const requested = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-25T10:00:00.000Z",
  }).value.propertyRecord;
  const completed = evidenceLifecycle.createSimulatedEvidenceFromServiceRequest(requested, requested.serviceRequests[0], {
    now: "2026-06-25T10:05:00.000Z",
    confirmationState: "confirmed",
  });
  assert.equal(completed.ok, true, JSON.stringify(completed.errors || []));
  const state = derive(completed.value.propertyRecord);
  assert.ok(completed.value.propertyRecord.evidence.some((item) => item.evidenceType === "eicr_certificate" && item.proofStatus === "accepted"));
  assert.equal(state.evidenceGaps.some((gap) => /eicr/i.test(gap.evidenceType)), false);
});

test("Adding evidence writes one timeline evidence event", () => {
  const property = createProperty({}, { id: "stage-e-one-evidence-event" });
  const { action, option } = actionFor(property, /gas/i);
  const requested = serviceLifecycle.createServiceRequestFromAction(property, action, option, {
    now: "2026-06-25T10:00:00.000Z",
  }).value.propertyRecord;
  const completed = evidenceLifecycle.createSimulatedEvidenceFromServiceRequest(requested, requested.serviceRequests[0], {
    now: "2026-06-25T10:05:00.000Z",
    confirmationState: "confirmed",
  }).value.propertyRecord;
  const repeated = evidenceLifecycle.createSimulatedEvidenceFromServiceRequest(completed, requested.serviceRequests[0], {
    now: "2026-06-25T10:06:00.000Z",
    confirmationState: "confirmed",
  }).value.propertyRecord;
  assert.equal(evidenceEvents(repeated).length, 1);
});

test("A dated evidence item creates one monitoring item", () => {
  const property = createProperty({}, { id: "stage-e-monitoring-date" });
  const evidence = {
    id: "ev_stage_e_gas",
    propertyId: property.id,
    evidenceType: "gas_safety_certificate",
    proofStatus: "accepted",
    verificationStatus: "accepted",
    source: "supplier_confirmed",
    capabilityStatus: "simulated",
    issuedDate: "2026-06-25",
    expiryDate: "2027-06-25",
    sourceReferences: [],
  };
  const state = derive({ ...property, evidence: [evidence] });
  const matching = state.monitoringItems.filter((item) => item.linkedEvidenceId === evidence.id);
  assert.equal(matching.length, 1);
  assert.equal(matching[0].propertyId, property.id);
});

test("Services normal route renders canonical request state once", () => {
  const code = read("dashboard-labs.js");
  const services = functionSlice(code, "renderServicesState", 3000);
  const canonicalServices = functionSlice(code, "renderSelectedCanonicalServicesState", 9000);
  assert.match(services, /isNormalSelectedCanonicalWorkspace\(\)[\s\S]{0,200}renderSelectedCanonicalServicesState\(\)/);
  assert.match(canonicalServices, /selectedCanonicalServiceRequests\(\)/);
  assert.doesNotMatch(canonicalServices, /labsState\.serviceRequests\.filter[\s\S]{0,200}the-butts/);
});

test("Service request safe copy is preserved", () => {
  const dashboard = read("dashboard-labs.js");
  const code = functionSlice(dashboard, "renderSelectedCanonicalServicesState", 9000) + read("core/cmp-service-lifecycle.js");
  assert.match(code, /No supplier contacted/);
  assert.match(code, /No payment taken/);
  assert.doesNotMatch(code, /supplier has been contacted|supplier contacted successfully|payment has been taken|payment taken successfully|booking confirmed|payment successful/i);
});

test("Timeline uses stored lifecycle events without creating them", () => {
  const code = read("dashboard-labs.js");
  const events = functionSlice(code, "selectedCanonicalTimelineEvents", 14000);
  assert.match(events, /record\?\.timeline/);
  assert.doesNotMatch(events, /saveSelectedCanonicalPropertyRecord|createCanonicalServiceRequest|completeCanonicalServiceEvidence/);
});

test("Property isolation keeps canonical IDs on service, evidence, timeline and monitoring", () => {
  const propertyA = createProperty({}, { id: "stage-e-property-a", namespaceId: "guest:a" });
  const propertyB = createProperty({ address: "22, Cedar Court, Birmingham, B37 7BB", postcode: "B37 7BB" }, { id: "stage-e-property-b", namespaceId: "guest:b" });
  const { action, option } = actionFor(propertyA, /gas/i);
  const requested = serviceLifecycle.createServiceRequestFromAction(propertyA, action, option, {
    now: "2026-06-25T10:00:00.000Z",
  }).value.propertyRecord;
  const completed = evidenceLifecycle.createSimulatedEvidenceFromServiceRequest(requested, requested.serviceRequests[0], {
    now: "2026-06-25T10:05:00.000Z",
    confirmationState: "confirmed",
  }).value.propertyRecord;
  const stateA = derive(completed);
  const stateB = derive(propertyB);
  assert.ok(completed.serviceRequests.every((request) => request.propertyId === propertyA.id));
  assert.ok(completed.evidence.every((item) => item.propertyId === propertyA.id));
  assert.ok(completed.timeline.every((event) => event.propertyId === propertyA.id));
  assert.ok(stateA.monitoringItems.every((item) => item.propertyId === propertyA.id));
  assert.equal(JSON.stringify(stateB).includes(propertyA.id), false);
});

test("Cross-surface focus handler preserves selected property and does not mutate", () => {
  const code = read("dashboard-labs.js");
  const focus = functionSlice(code, "focusCanonicalSurface", 5000);
  assert.match(focus, /showPortfolioEvidence|showPortfolioTasks|openPropertyWorkspace/);
  assert.doesNotMatch(focus, /saveSelectedCanonicalPropertyRecord|writeCanonicalStore|createCanonicalServiceRequest|completeCanonicalServiceEvidence/);
});

test("Browser Back support does not write state during focus handoff", () => {
  const code = read("dashboard-labs.js");
  const focus = functionSlice(code, "focusCanonicalSurface", 5000);
  assert.doesNotMatch(focus, /pushState|replaceState|location\.href|localStorage\.setItem/);
});

test("Stage A demo quarantine remains intact", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /isQaMode\(\).*demoScenario|demoScenario.*isQaMode\(\)/s);
  assert.match(code, /isNormalSelectedCanonicalWorkspace/);
  assert.match(code, /assertNormalCanonicalRecordContext/);
});

test("Stage B single Add Property owner remains intact", () => {
  const publicCode = read("public-pages.js");
  assert.equal(countMatches(publicCode, /function\s+renderAddPropertyPage\s*\(/g), 1);
  assert.match(publicCode, /createOrUpdatePropertyFromSelection/);
  assert.match(read("dashboard-labs.js"), /openNormalAddPropertyFlow/);
});

test("Stage C single workspace navigation remains intact", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /normal-canonical-workspace/);
  assert.match(code, /hidePortfolioPages/);
  assert.match(code, /data-normal-canonical-primary/);
});

test("Stage C.1 public visual acceptance hooks remain intact", () => {
  const publicCode = read("public-pages.js");
  const css = read("landing.css");
  assert.match(publicCode, /add-property-journey-shell/);
  assert.match(css, /body\[data-public-page="add-property"\]\s+\.cmp-public-container/);
});

test("No storage or schema keys changed in Stage E diff", () => {
  const diff = execFileSync("git", ["diff", "--", "core/cmp-public-property-bridge.js", "core/cmp-property-store.js", "contracts"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.doesNotMatch(diff, /CANONICAL_STORE_KEY_PREFIX|storageKey|schema|migration/i);
});

test("Priority and scoring rules are unchanged in Stage E diff", () => {
  const changed = execFileSync("git", ["diff", "--name-only"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
  assert.equal(changed.includes("core/cmp-priority-rules.js"), false);
  assert.equal(changed.includes("core/cmp-compliance-derivation.js"), false);
});

test("Demo and scenario code remains quarantined and unchanged", () => {
  const changed = execFileSync("git", ["diff", "--name-only"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
  assert.equal(changed.some((file) => /guided-demo|scenario/i.test(file)), false);
  assert.doesNotMatch(read("dashboard-labs.js"), /demoScenario[\s\S]{0,120}PUBLIC_GUEST_NAMESPACE_ID/);
});

test("No user storage clearing was introduced", () => {
  const diff = execFileSync("git", ["diff", "--", "dashboard-labs.js", "public-pages.js", "core"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.doesNotMatch(diff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|removeItem\()/m);
});

test("Stage E changed only allowed product and test files", () => {
  const changed = execFileSync("git", ["diff", "--name-only"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !file.startsWith("audit/"));
  const allowed = new Set([
    "dashboard-labs.html",
    "dashboard-labs.js",
    "dashboard-labs.css",
    "public-pages.js",
    "core/cmp-ask-response.js",
    "core/cmp-evidence-lifecycle.js",
    "core/cmp-service-lifecycle.js",
    "core/cmp-monitoring-derivation.js",
    "tools/cmp-stage-c1-public-journey-acceptance-check.mjs",
    "tools/cmp-stage-e-evidence-action-monitoring-check.mjs",
  ]);
  assert.deepEqual(changed.filter((file) => !allowed.has(file)), []);
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

console.log(`CMP Stage E evidence/action/service/monitoring check passed (${passed} assertions).`);
