import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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

function functionSlice(source, functionName, length = 14000) {
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
    id: "stage-c-address-1",
    uprn: "STAGE-C-UPRN-1",
    address: "18, Willow Brook Drive, Coventry, CV1 3BJ",
    postcode: "CV1 3BJ",
    city: "Coventry",
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
      certificate: "STAGE-C-EPC",
      source: "Example EPC preview",
    },
    ...overrides,
  };
}

function createViaBridge() {
  const result = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage: fakeStorage(),
    journeyContext: {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: "unsure",
      sourceRoute: "add-property.html",
      answeredQuestions: {},
    },
    now: "2026-06-25T09:00:00.000Z",
    randomUUID: () => "stage-c-record",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value.property;
}

test("Review Found Data partitions checks into one visible group each", () => {
  const review = bridge.prepareReviewFoundData(createViaBridge());
  const foundIds = new Set(review.foundAutomatically.map((item) => item.id));
  const missingIds = new Set(review.missingUnknown.map((item) => item.id));
  const repeatedInConfirmation = review.needsConfirmation
    .filter((item) => foundIds.has(item.id) || missingIds.has(item.id))
    .map((item) => item.label);

  assert.deepEqual(repeatedInConfirmation, []);
});

test("public Add Property does not render empty Review Found Data groups", () => {
  const code = read("public-pages.js");
  const renderReviewItems = functionSlice(code, "renderReviewItems", 1600);
  const renderCanonicalReview = functionSlice(code, "renderCanonicalReview", 2600);

  assert.doesNotMatch(renderReviewItems, /Nothing in this group yet/i);
  assert.match(renderCanonicalReview, /filter\(\(group\) => group\.items\.length\)/);
});

test("public Add Property hides internal prototype language on normal review copy", () => {
  const code = read("public-pages.js");
  const renderAddPropertyPage = functionSlice(code, "renderAddPropertyPage", 9000);
  const renderReviewItems = functionSlice(code, "renderReviewItems", 1600);
  const renderCanonicalReview = functionSlice(code, "renderCanonicalReview", 2600);
  const renderFlashBanner = functionSlice(code, "renderFlashBanner", 800);

  assert.doesNotMatch(renderAddPropertyPage, /Smart Checks are simulated|simulated Smart Checks/i);
  assert.doesNotMatch(renderReviewItems, /Simulated Smart Check/i);
  assert.doesNotMatch(renderCanonicalReview, /simulated Smart Checks|simulated checks/i);
  assert.match(renderFlashBanner, /flash-banner-section/);
  assert.match(renderAddPropertyPage, /state\.addProperty\.canonicalReview = canonicalReview;[\s\S]{0,160}state\.addProperty\.isCreating = false;/);
});

test("normal selected-property workspace replaces Check My Property with state-derived continuation", () => {
  const code = read("dashboard-labs.js");
  const renderBlock = functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 14000);
  const bindJourneyBlock = functionSlice(code, "bindJourneyOs", 2400);

  assert.match(code, /function selectedCanonicalPrimaryAction\(/);
  assert.match(renderBlock, /removeAttribute\("data-journey-start"\)/);
  assert.match(renderBlock, /data-normal-canonical-primary/);
  assert.match(renderBlock, /homePromptRow\.remove\(\)/);
  assert.match(bindJourneyBlock, /if \(isNormalSelectedCanonicalWorkspace\(\)\) \{[\s\S]{0,180}handleSelectedCanonicalPrimaryAction\(\)/);
  assert.doesNotMatch(renderBlock, /Check My Property/);
  assert.doesNotMatch(renderBlock, /Property workspace · Simulated Smart Check/);
});

test("normal selected-property workspace hides competing global navigation", () => {
  const code = read("dashboard-labs.js");
  const css = read("dashboard-labs.css");
  const html = read("dashboard-labs.html");

  assert.match(code, /normal-canonical-workspace/);
  assert.match(code, /toast-normal-route/);
  assert.match(css, /body\.normal-canonical-workspace[\s\S]{0,800}\[data-global-nav="Add property"\]/);
  assert.match(css, /body\.normal-canonical-workspace[\s\S]{0,800}\[data-global-nav="Ask CMP"\]/);
  assert.match(css, /body\.normal-canonical-workspace \.toast::before[\s\S]{0,80}content:\s*"Notice"/);
  assert.doesNotMatch(html, /Demo note|official-data connections are simulated/);
});

test("normal selected-property workspace fails on fixture context instead of text-scrubbing it", () => {
  const code = read("dashboard-labs.js");
  const renderBlock = functionSlice(code, "renderSelectedCanonicalWorkspaceShell", 14000);

  assert.doesNotMatch(code, /function scrubNormalCanonicalRoutePresetText\(/);
  assert.doesNotMatch(renderBlock, /scrubNormalCanonicalRoutePresetText\(/);
  assert.match(code, /function assertNormalCanonicalRecordContext\(/);

  const assertionBlock = functionSlice(code, "assertNormalCanonicalRecordContext", 3000);
  const conflictBlock = functionSlice(code, "findNormalRouteFixtureConflict", 3000);
  assert.match(assertionBlock, /throw new Error/);
  assert.match(conflictBlock, /57 The Butts/);
  assert.match(conflictBlock, /18 Willow Brook Drive/);
  assert.match(conflictBlock, /12 Maple Quay/);
  assert.doesNotMatch(assertionBlock, /\.replace\(/);
});

test("normal selected-property copy is written deliberately, not globally rewritten after render", () => {
  const publicCode = read("public-pages.js");
  const dashboardCode = read("dashboard-labs.js");
  const bridgeCode = read("core/cmp-public-property-bridge.js");
  const landlordCopy = functionSlice(publicCode, "landlordFacingCopy", 1800);
  const showToast = functionSlice(dashboardCode, "showToast", 1200);

  assert.match(bridgeCode, /Smart Checks use available and example information in this prototype/);
  assert.doesNotMatch(landlordCopy, /\.replace\(/);
  assert.doesNotMatch(landlordCopy, /prototype\/gi|simulated\/gi|demo\/gi/);
  assert.doesNotMatch(showToast, /\.replace\(/);
  assert.doesNotMatch(showToast, /prototype\/gi|simulated\/gi|demo\/gi/);
});

test("Add Property bridge layout keeps the property flow centred and bounded", () => {
  const css = read("landing.css");

  assert.match(css, /body\[data-public-page="add-property"\] \.add-property-bridge-hero[\s\S]{0,700}grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(320px,\s*420px\)/);
  assert.match(css, /body\[data-public-page="add-property"\] \.add-property-flow[\s\S]{0,500}max-width:\s*960px/);
  assert.match(css, /body\[data-public-page="add-property"\] \.add-property-bridge-page > \.flash-banner-section \+ \.page-section[\s\S]{0,80}padding-top:\s*0/);
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

console.log(`CMP Stage C one-workspace navigation check passed (${passed} assertions).`);
