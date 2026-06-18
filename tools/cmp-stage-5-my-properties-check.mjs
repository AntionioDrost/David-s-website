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
    id: "address-cv1-1aa-1",
    uprn: "1000CV11AA1",
    address: "12 Canon Street, Coventry, CV1 1AA",
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
      certificate: "EPC-CV11AA-1",
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
    },
    ...overrides,
  };
}

function createCanonicalFixture(storage = fakeStorage()) {
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now: "2026-06-18T12:00:00.000Z",
    randomUUID: () => "stage5-canonical",
  });
  assert.equal(result.ok, true);
  return { storage, property: result.value.property };
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

test("My Properties loads the canonical bridge before public-pages.js", () => {
  const html = read("my-properties.html");
  const bridgeIndex = html.indexOf("core/cmp-public-property-bridge.js");
  const publicIndex = html.indexOf("public-pages.js");
  assert.ok(bridgeIndex > -1, "my-properties.html must load the canonical bridge");
  assert.ok(bridgeIndex < publicIndex, "bridge must load before public-pages.js");
});

test("canonical property can be listed and converted to a My Properties card", () => {
  const { storage, property } = createCanonicalFixture();
  const listed = bridge.listCanonicalProperties(storage);
  assert.equal(listed.ok, true);
  assert.equal(listed.value.length, 1);
  const card = bridge.propertyCardFromRecord(listed.value[0]);
  assert.equal(card.id, property.id);
  assert.equal(card.address, "12 Canon Street, Coventry, CV1 1AA");
  assert.equal(card.postcode, "CV1 1AA");
  assert.equal(card.openHref, `dashboard-labs.html?propertyId=${encodeURIComponent(property.id)}`);
  assert.match(card.smartCheckSummary, /Smart Checks/i);
});

test("canonical and legacy compatibility records can be deduped", () => {
  const { storage, property } = createCanonicalFixture();
  const legacy = {
    id: "property:legacy",
    canonicalPropertyId: property.id,
    address: property.address,
    postcode: property.identity.postcode,
    identity: { canonicalPropertyId: property.id },
  };
  const canonical = bridge.listCanonicalProperties(storage).value.map((record) => bridge.propertyCardFromRecord(record));
  const legacyOnly = bridge.dedupeLegacyPropertyCards(canonical, [legacy]);
  assert.equal(legacyOnly.length, 0);
});

test("My Properties public code reads canonical records first and opens by propertyId", () => {
  const code = read("public-pages.js");
  assert.match(code, /canonicalPropertyEntries/);
  assert.match(code, /myPropertyEntries/);
  assert.match(code, /dashboard-labs\.html\?propertyId=/);
  assert.doesNotMatch(code, /dashboard-labs\.html";/);
});

test("empty-state Add Property routes to add-property.html", () => {
  const code = read("public-pages.js");
  assert.match(code, /href="add-property\.html"/);
});

test("My Properties no longer exposes the fixture/demo loader as a user-created property path", () => {
  const code = read("public-pages.js");
  assert.doesNotMatch(code, /data-load-demo-property/);
});

test("dashboard Labs has a selected-property URL contract", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /propertyId/);
  assert.match(code, /hydrateSelectedCanonicalProperty/);
  assert.match(code, /renderSelectedCanonicalWorkspaceShell/);
});

test("selected workspace shell model uses canonical identity", () => {
  const { property } = createCanonicalFixture();
  const shell = bridge.workspaceShellFromRecord(property);
  assert.equal(shell.propertyId, property.id);
  assert.equal(shell.address, "12 Canon Street, Coventry, CV1 1AA");
  assert.equal(shell.postcode, "CV1 1AA");
  assert.match(shell.setupStatus, /Review found data/i);
  assert.ok(shell.foundDataSummary.length > 0);
});

test("invalid and missing propertyId states are explicit and do not name 57 The Butts", () => {
  const invalid = bridge.invalidWorkspaceShell("invalid", "prop_missing");
  const missing = bridge.invalidWorkspaceShell("missing", "");
  assert.doesNotMatch(JSON.stringify(invalid), /57 The Butts/i);
  assert.doesNotMatch(JSON.stringify(missing), /57 The Butts/i);
  assert.match(invalid.title, /not found/i);
  assert.match(missing.title, /Choose a property/i);
});

test("Labs normal property route does not rely on state=new-property", () => {
  const code = read("dashboard-labs.js");
  assert.doesNotMatch(code, /propertyId[^\\n]+state=new-property/);
  assert.doesNotMatch(code, /setLabsRouteState\("new-property"\)[^;]*propertyId/);
});

test("single canonical property route does not default to portfolio mode", () => {
  const code = read("dashboard-labs.js");
  assert.match(code, /canonicalSelectedPortfolioProperty/);
  assert.match(code, /portfolioMode = "single"/);
});

test("data safety keeps legacy and demo namespaces intact", () => {
  const legacyValue = JSON.stringify({ "property:legacy": { checkerState: { propertySnapshot: { id: "property:legacy" } } } });
  const demoKey = bridge.buildPublicStorageKey("demo:nick");
  const storage = fakeStorage({
    "cmp_compliance_workspaces::guest": legacyValue,
    [demoKey]: JSON.stringify(bridge.createEmptyStore("demo:nick", { now: "2026-06-18T12:00:00.000Z" })),
  });
  const { property } = createCanonicalFixture(storage);
  const shell = bridge.workspaceShellFromRecord(property);
  assert.equal(shell.propertyId, property.id);
  assert.equal(storage.getItem("cmp_compliance_workspaces::guest"), legacyValue);
  assert.ok(storage.getItem(demoKey));
});

test("canonical property remains intact after shell model preparation", () => {
  const { storage, property } = createCanonicalFixture();
  const before = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  bridge.workspaceShellFromRecord(property);
  const after = storage.getItem(bridge.buildPublicStorageKey(bridge.PUBLIC_GUEST_NAMESPACE_ID));
  assert.equal(after, before);
});

test("restricted systems are not rewired in Stage 5", () => {
  const changed = changedFiles();
  const forbidden = [
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
  ];
  assert.deepEqual(changed.filter((file) => forbidden.includes(file)), []);
  assert.equal(changed.some((file) => /^services?/.test(file) && file.endsWith(".html")), false);
});

test("public and internal routes still return HTTP 200", async () => {
  await withStaticServer(async (origin) => {
    const routes = [
      "/index.html",
      "/add-property.html",
      "/my-properties.html",
      "/services.html",
      "/epcs.html",
      "/gas-safety.html",
      "/eicr.html",
      "/property-inspections.html",
      "/selective-licensing.html",
      "/evictions-possession.html",
      "/mould-damp.html",
      "/dashboard-labs.html?demo=nick",
      "/dashboard-labs.html?state=empty&qa=1",
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
    console.error(`Stage 5 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 5 My Properties check passed (${passed} assertions).`);
