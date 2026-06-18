import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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
    dump() {
      return Object.fromEntries(store.entries());
    },
  };
}

function selection(overrides = {}) {
  return {
    id: "address-b1-1aa-1",
    uprn: "1000B11AA1",
    address: "12 Canon Street, Birmingham, B1 1AA",
    postcode: "B1 1AA",
    city: "Birmingham",
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
      certificate: "EPC-B11AA-1",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function journeyContext(overrides = {}) {
  return {
    entryService: "epc",
    focusMode: "full_compliance",
    isTenanted: "unsure",
    sourceRoute: "epcs.html",
    answeredQuestions: {
      service_intent: "broader_check",
      epc_upload: "existing-epc.pdf",
    },
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

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

test("public homepage Check My Property opens add-property.html", () => {
  const index = read("index.html");
  const publicPages = read("public-pages.js");
  assert.match(index + publicPages, /add-property\.html/);
  assert.doesNotMatch(publicPages, /az-checker-v2\.html/);
});

test("add-property.html loads the Stage 4 bridge before public-pages.js", () => {
  const html = read("add-property.html");
  const bridgeIndex = html.indexOf("core/cmp-public-property-bridge.js");
  const publicIndex = html.indexOf("public-pages.js");
  assert.ok(bridgeIndex > -1, "missing public canonical bridge script");
  assert.ok(bridgeIndex < publicIndex, "bridge must load before public-pages.js");
});

test("Add Property can create a canonical PropertyRecord", () => {
  const storage = fakeStorage();
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    serviceDraft: { intent: "broader_check", epc_upload: "existing-epc.pdf" },
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-test-id",
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.property.id, "prop_stage4-test-id");
  assert.equal(result.value.property.namespace, bridge.PUBLIC_GUEST_NAMESPACE_ID);
  assert.equal(result.value.property.identity.displayAddress, "12 Canon Street, Birmingham, B1 1AA");
  assert.equal(result.value.property.currentSetupStage, "review_found_data");
});

test("Created record has Smart Check results stored on the same record", () => {
  const storage = fakeStorage();
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-smart-checks",
  });
  assert.equal(result.ok, true);
  const property = result.value.property;
  assert.ok(property.smartCheckResults.length >= 4);
  assert.ok(property.smartCheckResults.every((check) => check.propertyId === property.id));
  assert.ok(property.smartCheckResults.every((check) => check.sourceReferences?.length));
  assert.ok(property.smartCheckResults.every((check) => ["high", "medium", "low", "unknown"].includes(check.confidence)));
  assert.ok(property.smartCheckResults.every((check) => check.capabilityStatus === "simulated"));
});

test("Review Found Data model is rendered from canonical record", () => {
  const storage = fakeStorage();
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-review",
  });
  const review = bridge.prepareReviewFoundData(result.value.property);
  assert.equal(review.propertyId, "prop_stage4-review");
  assert.equal(review.address, "12 Canon Street, Birmingham, B1 1AA");
  assert.ok(review.foundAutomatically.length > 0);
  assert.ok(review.needsConfirmation.length > 0);
  assert.match(read("public-pages.js"), /data-canonical-review/);
});

test("Review does not show hardcoded 57 The Butts for normal public selection", () => {
  const result = bridge.createOrUpdatePropertyFromSelection(selection({ address: "18 Willow Yard, Coventry, CV1 1AA", postcode: "CV1 1AA", uprn: "1000CV11AA1" }), {
    storage: fakeStorage(),
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-not-butts",
  });
  const review = bridge.prepareReviewFoundData(result.value.property);
  assert.doesNotMatch(JSON.stringify(review), /57 The Butts/i);
});

test("Normal public Add Property does not use state=new-property handoff", () => {
  assert.doesNotMatch(read("public-pages.js"), /state=new-property/);
  assert.doesNotMatch(read("public-pages.js"), /dashboard-labs\.html\?state=/);
});

test("Public service context can be carried into canonical entry context", () => {
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage: fakeStorage(),
    journeyContext: journeyContext({ entryService: "eicr", sourceRoute: "eicr.html" }),
    serviceDraft: { intent: "need_eicr", eicr_upload: "eicr.pdf" },
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-service",
  });
  const { property, serviceIntent } = result.value;
  assert.equal(property.entryContext.entryService, "eicr");
  assert.equal(property.entryContext.sourceRoute, "eicr.html");
  assert.equal(serviceIntent.serviceId, "eicr");
  assert.equal(serviceIntent.propertyId, property.id);
  assert.equal(serviceIntent.evidencePlaceholders[0].stored, false);
});

test("legacy storage keys remain untouched by canonical write", () => {
  const legacyValue = JSON.stringify({ "property:legacy": { checkerState: { propertySnapshot: { id: "property:legacy" } } } });
  const storage = fakeStorage({
    "cmp_compliance_workspaces::guest": legacyValue,
    "cmp_public_service_draft::epc": JSON.stringify({ intent: "broader_check" }),
  });
  bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-legacy-safe",
  });
  assert.equal(storage.getItem("cmp_compliance_workspaces::guest"), legacyValue);
  assert.ok(storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID)));
});

test("invalid canonical write does not overwrite valid stored property", () => {
  const storage = fakeStorage();
  const first = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-valid",
  });
  assert.equal(first.ok, true);
  const before = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  const invalid = bridge.createOrUpdatePropertyFromSelection({ ...selection(), address: "", postcode: "" }, {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-invalid",
  });
  assert.equal(invalid.ok, false);
  assert.equal(storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID)), before);
});

test("guest and demo namespaces remain isolated", () => {
  const storage = fakeStorage();
  bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    namespaceId: bridge.PUBLIC_GUEST_NAMESPACE_ID,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-guest",
  });
  bridge.createOrUpdatePropertyFromSelection(selection({ address: "3 Demo Lane, Leeds, LS1 1AA", postcode: "LS1 1AA", uprn: "1000LS11AA1" }), {
    storage,
    namespaceId: "demo:nick",
    journeyContext: journeyContext({ entryService: "full_compliance" }),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-demo",
  });
  const guest = bridge.readCanonicalStore(storage, bridge.PUBLIC_GUEST_NAMESPACE_ID);
  const demo = bridge.readCanonicalStore(storage, "demo:nick");
  assert.equal(guest.value.propertyOrder.length, 1);
  assert.equal(demo.value.propertyOrder.length, 1);
  assert.notEqual(guest.value.propertyOrder[0], demo.value.propertyOrder[0]);
});

test("Add Property does not auto-migrate or import every legacy property by default", () => {
  const storage = fakeStorage({
    "cmp_compliance_workspaces::guest": JSON.stringify({
      "property:legacy-1": { checkerState: { propertySnapshot: { id: "property:legacy-1" } } },
      "property:legacy-2": { checkerState: { propertySnapshot: { id: "property:legacy-2" } } },
    }),
  });
  bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-no-migrate",
  });
  const canonical = bridge.readCanonicalStore(storage, bridge.PUBLIC_GUEST_NAMESPACE_ID).value;
  assert.equal(canonical.propertyOrder.length, 1);
  assert.doesNotMatch(read("public-pages.js"), /importLegacyRecord|previewImport/);
});

test("No-EPC Smart Check preserves missing EPC and unknown heating facts", () => {
  const noEpcSelection = selection({
    address: "44 Maple Avenue, Birmingham, B1 1AA",
    uprn: "1000B11AA4",
    epc: {
      rating: "",
      currentScore: null,
      potential: "",
      potentialScore: null,
      issue: "",
      expiry: "",
      certificate: "",
      source: "Example property preview",
    },
  });
  const result = bridge.createOrUpdatePropertyFromSelection(noEpcSelection, {
    storage: fakeStorage(),
    journeyContext: journeyContext(),
    now: "2026-06-18T10:00:00.000Z",
    randomUUID: () => "stage4-no-epc",
  });
  assert.equal(result.ok, true);
  const property = result.value.property;
  const epc = property.smartCheckResults.find((check) => check.checkType === "epc");
  const heating = property.smartCheckResults.find((check) => check.checkType === "heating_source");
  assert.equal(epc.resultStatus, "missing");
  assert.equal(epc.value.epcFound, false);
  assert.equal(epc.value.epcRating, undefined);
  assert.equal(epc.value.epcPotential, undefined);
  assert.equal(epc.value.epcExpiry, undefined);
  assert.equal(heating.resultStatus, "unknown");
  assert.doesNotMatch(JSON.stringify(heating), /EPC-derived/i);
});

test("product isolation keeps restricted systems untouched", () => {
  const changed = changedFiles();
  const forbidden = [
    "dashboard-labs.js",
    "dashboard-labs.html",
    "dashboard-labs.css",
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
  ];
  assert.deepEqual(changed.filter((file) => forbidden.includes(file)), []);
  assert.doesNotMatch(changed.join("\n"), /^app\//m);
});

test("public service and internal legacy routes still return HTTP 200", async () => {
  await withStaticServer(async (origin) => {
    const routes = [
      "/services.html",
      "/epcs.html",
      "/gas-safety.html",
      "/eicr.html",
      "/property-inspections.html",
      "/selective-licensing.html",
      "/evictions-possession.html",
      "/possession-eviction-preparation.html",
      "/mould-damp.html",
      "/dashboard-labs.html?demo=nick",
      "/az-checker-v2.html",
      "/dashboard.html",
    ];
    for (const route of routes) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
  } catch (error) {
    console.error(`Stage 4 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 4 Add Property check passed (${passed} assertions).`);
