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

function functionSlice(source, functionName, length = 12000) {
  const index = source.indexOf(`function ${functionName}`);
  assert.ok(index >= 0, `${functionName} not found`);
  const rest = source.slice(index + 1);
  const nextFunctionMatch = rest.match(/\n\s*function\s+/);
  const nextFunctionIndex = nextFunctionMatch ? index + 1 + nextFunctionMatch.index : -1;
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
}

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  const calls = [];
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key) {
      calls.push(["getItem", key]);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      calls.push(["setItem", key]);
      store.set(key, String(value));
    },
    removeItem(key) {
      calls.push(["removeItem", key]);
      store.delete(key);
    },
    clear() {
      calls.push(["clear", "*"]);
      store.clear();
    },
    dump() {
      return Object.fromEntries(store.entries());
    },
    calls,
  };
}

function selection(overrides = {}) {
  return {
    id: "stage-b-address-1",
    uprn: "STAGE-B-UPRN-1",
    address: "18 Willow Brook Drive, Solihull, B37 7BA",
    postcode: "B37 7BA",
    city: "Solihull",
    type: "Semi-detached house",
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
      certificate: "STAGE-B-EPC",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function journeyContext(overrides = {}) {
  return {
    entryService: "full_compliance",
    focusMode: "full_compliance",
    isTenanted: "unsure",
    sourceRoute: "add-property.html",
    answeredQuestions: {},
    ...overrides,
  };
}

function createViaBridge(storage, selected = selection(), context = journeyContext(), draft = {}, uuid = "stage-b-record") {
  const result = bridge.createOrUpdatePropertyFromSelection(selected, {
    storage,
    journeyContext: context,
    serviceDraft: draft,
    now: "2026-06-25T09:00:00.000Z",
    randomUUID: () => uuid,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
}

function canonicalStore(storage) {
  const raw = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  assert.ok(raw, "canonical store should be written");
  return JSON.parse(raw);
}

function canonicalRecords(storage) {
  const store = canonicalStore(storage);
  return store.propertyOrder.map((id) => store.propertiesById[id]).filter(Boolean);
}

function assertNoStorageClearIn(files) {
  for (const file of files) {
    assert.doesNotMatch(read(file), /(?:localStorage|sessionStorage)\.clear\s*\(/, `${file} must not clear browser storage`);
  }
}

test("homepage Check My Property enters add-property.html", () => {
  const code = read("public-pages.js");
  assert.match(code, /href="add-property\.html"[\s\S]{0,240}Check My Property/);
  assert.match(code, /homePostcodeForm[\s\S]{0,500}add-property\.html\?postcode=/);
  assert.doesNotMatch(code, /az-checker-v2\.html/);
});

test("services full-property route enters add-property.html", () => {
  const code = read("public-pages.js");
  assert.match(code, /Full property check[\s\S]{0,300}href="add-property\.html"/);
  assert.match(code, /service-index-bridge-band[\s\S]{0,500}href="add-property\.html"/);
});

test("My Properties empty-state Add Property enters add-property.html", () => {
  const code = read("public-pages.js");
  assert.match(code, /No properties added yet[\s\S]{0,500}href="add-property\.html"/);
});

test("My Properties Add another property enters add-property.html", () => {
  const code = read("public-pages.js");
  const renderBlock = functionSlice(code, "renderMyPropertiesPage", 9000);
  assert.match(renderBlock, /href="add-property\.html"[\s\S]{0,220}Add another property/);
});

test("normal selected-workspace Add Property enters add-property.html", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function normalAddPropertyHref\(\)[\s\S]{0,700}add-property\.html/);
  assert.match(code, /if \(item\.dataset\.globalNav === "Add property"\)[\s\S]{0,220}openNormalAddPropertyFlow\(\)/);
});

test("normal Labs Add Property modal cannot open", () => {
  const code = read("dashboard-labs.js");
  const modalFunction = functionSlice(code, "openAddPropertyModal", 1200);
  const redirectIndex = modalFunction.indexOf("openNormalAddPropertyFlow()");
  const modalIndex = modalFunction.indexOf("openTimelineModal(\"[data-add-property-modal]\")");
  assert.ok(redirectIndex > -1, "normal path should redirect to public Add Property");
  assert.ok(modalIndex > -1, "QA path may retain the modal");
  assert.ok(redirectIndex < modalIndex, "normal redirect must happen before modal open");
  assert.match(modalFunction, /if \(!isQaMode\(\)\) \{[\s\S]{0,100}openNormalAddPropertyFlow\(\);[\s\S]{0,40}return;/);
});

test("dashboard.html redirects normal access to my-properties.html before legacy app scripts", () => {
  const html = read("dashboard.html");
  const redirectIndex = html.indexOf("my-properties.html");
  const appIndex = html.indexOf("app.js");
  assert.ok(redirectIndex > -1, "dashboard.html needs a normal-user redirect to My Properties");
  assert.ok(appIndex === -1 || redirectIndex < appIndex, "redirect must run before legacy app.js");
  assert.match(html, /URLSearchParams\(window\.location\.search\)[\s\S]{0,240}qa/);
});

test("az-checker-v2.html redirects normal access to add-property.html before legacy app scripts", () => {
  const html = read("az-checker-v2.html");
  const redirectIndex = html.indexOf("add-property.html");
  const appIndex = html.indexOf("az-checker-v2.js");
  assert.ok(redirectIndex > -1, "A-Z checker needs a normal-user redirect to Add Property");
  assert.ok(appIndex === -1 || redirectIndex < appIndex, "redirect must run before az-checker-v2.js");
  assert.match(html, /URLSearchParams\(window\.location\.search\)[\s\S]{0,240}qa/);
});

test("explicit QA legacy routes remain available if intentionally preserved", () => {
  assert.match(read("dashboard.html"), /qa[\s\S]{0,160}1/);
  assert.match(read("az-checker-v2.html"), /qa[\s\S]{0,160}1/);
  assert.match(read("dashboard-labs.js"), /if \(!isQaMode\(\)\)[\s\S]{0,120}openNormalAddPropertyFlow\(\)/);
});

test("successful Add Property creates exactly one canonical record", () => {
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  const records = canonicalRecords(storage);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, property.id);
  assert.equal(records[0].namespace, bridge.PUBLIC_GUEST_NAMESPACE_ID);
});

test("final route contains the created canonical propertyId", () => {
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  const review = bridge.prepareReviewFoundData(property);
  assert.match(review.handoffHref, new RegExp(`dashboard-labs\\.html\\?propertyId=${property.id}`));
  assert.match(review.handoffHref, /from=add-property/);
});

test("final selected workspace displays the selected address", () => {
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  const shell = bridge.workspaceShellFromRecord(property);
  assert.equal(shell.propertyId, property.id);
  assert.equal(shell.address, "18 Willow Brook Drive, Solihull, B37 7BA");
  assert.doesNotMatch(JSON.stringify(shell), /57 The Butts/i);
});

test("My Properties displays the same record once", () => {
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  const listed = bridge.listCanonicalProperties(storage, bridge.PUBLIC_GUEST_NAMESPACE_ID);
  assert.equal(listed.ok, true);
  const cards = listed.value.map((record) => bridge.propertyCardFromRecord(record));
  assert.equal(cards.filter((card) => card.id === property.id).length, 1);
  assert.equal(cards[0].canonicalPropertyId, property.id);
  assert.equal(cards[0].openHref, `dashboard-labs.html?propertyId=${encodeURIComponent(property.id)}`);
});

test("repeating the same completion does not duplicate the record", () => {
  const storage = fakeStorage();
  const first = createViaBridge(storage, selection(), journeyContext(), {}, "stage-b-repeat");
  const second = createViaBridge(storage, selection(), journeyContext(), {}, "stage-b-repeat-new-random-ignored");
  const records = canonicalRecords(storage);
  assert.equal(records.length, 1);
  assert.equal(second.property.id, first.property.id);
});

test("refreshing the final route does not duplicate the record", () => {
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  const before = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  const dashboardCode = read("dashboard-labs.js");
  const hydrateBlock = functionSlice(dashboardCode, "hydrateSelectedCanonicalProperty", 4000);
  assert.doesNotMatch(hydrateBlock, /createOrUpdatePropertyFromSelection|createPropertyRecord|writeCanonicalStore/);
  bridge.workspaceShellFromRecord(property);
  const after = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  assert.equal(after, before);
});

test("a different selected address creates a distinct propertyId", () => {
  const storage = fakeStorage();
  const first = createViaBridge(storage, selection(), journeyContext(), {}, "stage-b-one");
  const second = createViaBridge(storage, selection({
    id: "stage-b-address-2",
    uprn: "STAGE-B-UPRN-2",
    address: "41 Ledger Street, Bath, BA1 2ZZ",
    postcode: "BA1 2ZZ",
    city: "Bath",
  }), journeyContext(), {}, "stage-b-two");
  const records = canonicalRecords(storage);
  assert.equal(records.length, 2);
  assert.notEqual(first.property.id, second.property.id);
});

test("service-first flow preserves service key and answers", () => {
  const serviceCases = [
    ["epc", { intent: "broader_check", epc_upload: "epc.pdf", already_have_epc: "yes" }],
    ["gas", { intent: "need_certificate", has_gas_appliances: "yes", gas_upload: "gas.pdf" }],
    ["eicr", { intent: "need_eicr", has_eicr: "no", eicr_upload: "eicr.pdf" }],
    ["inspection", { intent: "inspection_report", inspection_upload: "inspection.pdf" }],
    ["mould", { intent: "assess_issue", mould_severity: "one_area", mould_upload: "mould.jpg" }],
    ["eviction", { intent: "prepare_properly", possession_documents: "some", notice_evidence_upload: "notice.pdf" }],
    ["licensing", { intent: "check_need", licence_state: "not_sure", licensing_upload: "licence.pdf" }],
  ];

  for (const [serviceId, draft] of serviceCases) {
    const storage = fakeStorage();
    const context = journeyContext({
      entryService: serviceId,
      focusMode: serviceId === "eviction" ? "full_compliance" : "service_only",
      isTenanted: "yes",
      sourceRoute: `${serviceId}.html`,
      answeredQuestions: { service_intent: draft.intent, isTenanted: "yes", ...draft },
    });
    const { property, serviceIntent } = createViaBridge(storage, selection({ uprn: `UPRN-${serviceId}` }), context, draft, `stage-b-${serviceId}`);
    assert.ok(serviceIntent, `${serviceId} should create an attached service intent`);
    assert.equal(serviceIntent.serviceId, serviceId);
    assert.equal(serviceIntent.propertyId, property.id);
    assert.equal(serviceIntent.focusMode, context.focusMode);
    assert.equal(serviceIntent.serviceAnswers.intent, draft.intent);
    assert.equal(serviceIntent.status, "attached");
    assert.equal(serviceIntent.capabilityStatus, "simulated");
    assert.equal(JSON.stringify(serviceIntent).includes("supplierContacted"), false);
    assert.equal(JSON.stringify(serviceIntent).includes("payment"), false);
    if (Object.keys(draft).some((key) => key.endsWith("_upload"))) {
      assert.ok(serviceIntent.evidencePlaceholders.length >= 1, `${serviceId} upload metadata should be preserved`);
      assert.equal(serviceIntent.evidencePlaceholders.every((item) => item.stored === false), true);
    }
    const store = canonicalStore(storage);
    assert.equal(store.serviceIntentsById[serviceIntent.id].propertyId, property.id);
  }
});

test("no normal route opens a demo or scenario property-creation renderer", () => {
  assert.doesNotMatch(read("public-pages.js"), /demoScenario=|portfolioDemo=|state=new-property/);
  const normalAddProperty = functionSlice(read("dashboard-labs.js"), "normalAddPropertyHref", 1000);
  assert.doesNotMatch(normalAddProperty, /demo|journeyDemo|demoScenario|portfolioDemo|state=/);
});

test("public Add Property uses journey answers for service draft handoff", () => {
  const code = read("public-pages.js");
  const draftBlock = functionSlice(code, "serviceDraftForJourney", 3000);
  const renderBlock = functionSlice(code, "renderAddPropertyPage", 12000);
  assert.match(draftBlock, /answeredQuestions/);
  assert.match(draftBlock, /loadServiceDraft\(journey\?\.entryService\)/);
  assert.match(draftBlock, /SERVICE_CONFIG\[key\]\.route === sourceRoute/);
  assert.match(renderBlock, /serviceDraft:\s*serviceDraftForJourney\(\)/);
});

test("no normal route reads the demo namespace", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function quarantineInternalRouteWithoutQa/);
  assert.match(code, /function isCanonicalScenarioRoute\(\)[\s\S]{0,220}isQaMode\(\)/);
  assert.match(code, /function hydrateCanonicalScenarioProperty/);
  assert.match(code, /DEMO_SCENARIO_NAMESPACE/);
  const startupPrefix = code.slice(0, code.indexOf("function hydrateCanonicalScenarioProperty"));
  assert.doesNotMatch(startupPrefix, /demo:canonical-scenarios/);
});

test("no storage clear is performed", () => {
  assertNoStorageClearIn([
    "public-pages.js",
    "dashboard-labs.js",
    "dashboard.html",
    "az-checker-v2.html",
    "az-checker-v2.js",
    "core/cmp-public-property-bridge.js",
  ]);
});

test("Stage A route quarantine remains intact", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /function quarantineInternalRouteWithoutQa/);
  assert.match(code, /params\.get\("state"\) === "new-property"[\s\S]{0,100}target = "add-property\.html"/);
  assert.match(code, /hasNickDemoRequest\(params\) \|\| params\.get\("demoScenario"\)[\s\S]{0,100}target = "index\.html"/);
  assert.match(code, /params\.get\("qa"\) === "1" \|\| !hasInternalRouteRequest/);
});

test("canonical store schema and storage-key names remain unchanged", () => {
  assert.equal(bridge.PUBLIC_GUEST_NAMESPACE_ID, "guest:public");
  assert.equal(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID), "cmp_canonical_property_store_v1::guest:public");
  const storage = fakeStorage();
  const { property } = createViaBridge(storage);
  assert.equal(property.schemaVersion, "property-record.stage4.v1");
  const store = canonicalStore(storage);
  assert.equal(store.storeVersion, 1);
  assert.ok(Object.prototype.hasOwnProperty.call(store, "serviceIntentsById"));
});

test("public Add Property normal path does not create a legacy workspace record", () => {
  const renderBlock = functionSlice(read("public-pages.js"), "renderAddPropertyPage", 9000);
  assert.doesNotMatch(renderBlock, /saveWorkspaceEntry\s*\(/);
  assert.doesNotMatch(renderBlock, /cmp_compliance_workspaces::guest|ONBOARDING_STORAGE/);
});

test("canonical Add Property exposes one local progress sequence", () => {
  const code = read("public-pages.js");
  const renderBlock = functionSlice(code, "renderAddPropertyPage", 9000);
  const stepperBlock = functionSlice(code, "renderAddPropertyStepper", 5000);
  assert.doesNotMatch(renderBlock, /bridge-stage-row/);
  assert.match(stepperBlock, /Find property/);
  assert.match(stepperBlock, /Smart Checks/);
  assert.match(stepperBlock, /Review found data/);
  assert.match(stepperBlock, /Open Property Brain/);
  assert.doesNotMatch(stepperBlock, /title:\s*"Enter postcode"|title:\s*"Choose address"/);
  assert.doesNotMatch(stepperBlock, /Smart Search|Auto Checks/);
});

test("canonical Add Property guards pending address confirmation", () => {
  const code = read("public-pages.js");
  const renderBlock = functionSlice(code, "renderAddPropertyPage", 12000);
  const addressResultsBlock = functionSlice(code, "renderAddressResults", 5000);
  const guardIndex = renderBlock.indexOf("if (state.addProperty.isCreating) return;");
  const bridgeIndex = renderBlock.indexOf("createOrUpdatePropertyFromSelection");
  assert.ok(guardIndex > -1, "address confirmation must have a pending guard");
  assert.ok(bridgeIndex > -1, "canonical bridge creation should remain the creation owner");
  assert.ok(guardIndex < bridgeIndex, "pending guard must run before the bridge call");
  assert.match(addressResultsBlock, /data-use-address=.*state\.addProperty\.isCreating \? "disabled" : ""/);
});

test("Stage B changes stay inside allowed product and test scope", () => {
  const allowed = new Set([
    "public-pages.js",
    "dashboard-labs.js",
    "dashboard-labs.html",
    "core/cmp-public-property-bridge.js",
    "dashboard.html",
    "az-checker-v2.html",
    "tools/cmp-stage-b-single-add-property-check.mjs",
  ]);
  const changed = changedFiles().filter((file) => !file.startsWith("audit/"));
  assert.deepEqual(changed.filter((file) => !allowed.has(file)), []);
  assert.equal(changed.includes("core/cmp-property-store.js"), false);
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
    process.exitCode = 1;
    break;
  }
}

if (!process.exitCode) {
  console.log(`CMP Stage B single Add Property check passed (${passed} assertions).`);
}
