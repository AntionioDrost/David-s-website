#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import url from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

const {
  createCanonicalStore,
  createEmptyStoreEnvelope,
  buildStorageKey,
} = require("../core/cmp-property-store.js");
const {
  createMemoryStorageDriver,
  createStorageObjectDriver,
  createLocalStorageDriver,
  createSessionStorageDriver,
} = require("../core/cmp-storage-drivers.js");
const {
  validateJsonSchema,
  validatePropertyRecord,
  validateServiceIntentDraft,
  validateServiceRequest,
  validateStoreEnvelope,
  normalizePostcode,
  normalizeConfidence,
  normalizeSourceType,
  normalizeProofStatus,
  normalizeIssueStatus,
  normalizeActionStatus,
  normalizeServiceStatus,
  normalizeCapabilityStatus,
  normalizeUnknownish,
  normalizeNoEpcFinding,
} = require("../core/cmp-domain-normalize.js");
const {
  adaptPublicWorkspaceStore,
  adaptJourneyContext,
  adaptPublicServiceDraft,
  adaptLabsPropertyFixture,
  adaptJourneyOsState,
  adaptOldDashboardWorkspace,
  adaptAzCheckerState,
} = require("../core/cmp-transitional-adapters.js");
const {
  createCanonicalId,
  createImportedId,
  createMigrationKey,
} = require("../core/cmp-id.js");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const propertySchema = readJson("contracts/property-record.schema.json");
const serviceRequestSchema = readJson("contracts/service-request.schema.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertOk(result, label = "result") {
  assert.equal(result.ok, true, `${label} should be ok: ${JSON.stringify(result.errors || result.warnings || [])}`);
  return result.value;
}

function assertNotOk(result, label = "result") {
  assert.equal(result.ok, false, `${label} should fail`);
  assert.ok(Array.isArray(result.errors) && result.errors.length > 0, `${label} should include errors`);
}

function makeProperty(id, address = "12 Maple Quay, Bristol BS1 4AA", namespace = "guest:stage3") {
  const [line1, townPostcode] = address.split(", ");
  const postcode = townPostcode.split(" ").slice(-2).join(" ");
  return {
    id,
    namespace,
    identity: {
      displayAddress: address,
      line1,
      line2: null,
      town: townPostcode.replace(` ${postcode}`, ""),
      county: null,
      postcode,
      uprn: null,
      matchStatus: "manual",
      confidence: "medium",
      manualEdits: [],
      previousValues: [],
      history: [],
    },
    address,
    uprn: null,
    creationSource: "add_property",
    currentSetupStage: "workspace",
    lifecycleStatus: "active",
    entryContext: { sourceRoute: "stage-3-test" },
    smartCheckResults: [],
    landlordAnswers: [],
    issues: [],
    evidence: [],
    actions: [],
    serviceRequests: [],
    timeline: [],
    monitoring: [],
    reports: [],
    demoMetadata: null,
    schemaVersion: "1.0.0",
    createdAt: "2026-06-18T12:00:00.000Z",
    updatedAt: "2026-06-18T12:00:00.000Z",
  };
}

test("canonical ID helpers", async (t) => {
  await t.test("new IDs use supplied UUID source and prefix", () => {
    const id = createCanonicalId("prop", { randomUUID: () => "11111111-2222-4333-8444-555555555555" });
    assert.equal(id, "prop_11111111-2222-4333-8444-555555555555");
  });

  await t.test("imported IDs are source namespaced and stable", () => {
    assert.equal(createImportedId("public_workspace", "abc 123"), "legacy_public_workspace_abc-123");
    assert.equal(createMigrationKey("public_workspace", "abc 123", "v1"), "public_workspace::abc-123::v1");
  });
});

test("store lifecycle", async (t) => {
  await t.test("creates an empty namespaced store envelope", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    const result = await store.loadStore();
    const envelope = assertOk(result, "load empty store");
    assert.equal(envelope.storeVersion, 1);
    assert.equal(envelope.namespaceId, "guest:stage3");
    assert.deepEqual(envelope.propertiesById, {});
    assert.deepEqual(envelope.propertyOrder, []);
    assert.equal(buildStorageKey("guest:stage3"), "cmp_canonical_property_store_v1::guest:stage3");
  });

  await t.test("save/load round trip preserves deterministic order", async () => {
    const driver = createMemoryStorageDriver();
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver });
    assertOk(await store.upsertProperty(makeProperty("prop_b", "22 Cedar Street, York YO1 7AA")), "upsert B");
    assertOk(await store.upsertProperty(makeProperty("prop_a", "18 Oak Lane, Bath BA1 1AA")), "upsert A");

    const listed = assertOk(await store.listProperties(), "list properties");
    assert.deepEqual(listed.map((property) => property.id), ["prop_b", "prop_a"]);

    const reloaded = createCanonicalStore({ namespaceId: "guest:stage3", driver });
    assert.equal(assertOk(await reloaded.getProperty("prop_a"), "get prop_a").address, "18 Oak Lane, Bath BA1 1AA");
  });

  await t.test("updates one record without changing order", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    const property = makeProperty("prop_update");
    assertOk(await store.upsertProperty(property), "initial upsert");
    assertOk(await store.upsertProperty({ ...property, lifecycleStatus: "paused" }), "update upsert");
    assert.equal(assertOk(await store.getProperty("prop_update"), "get updated").lifecycleStatus, "paused");
    assert.deepEqual(assertOk(await store.listProperties(), "list updated").map((item) => item.id), ["prop_update"]);
  });

  await t.test("archives without hard deletion", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    assertOk(await store.upsertProperty(makeProperty("prop_archive")), "upsert archive");
    assertOk(await store.archiveProperty("prop_archive"), "archive");
    const archived = assertOk(await store.getProperty("prop_archive"), "get archived");
    assert.equal(archived.lifecycleStatus, "archived");
  });

  await t.test("rejects invalid selected property", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    assertNotOk(await store.setLastSelectedProperty("missing_property"), "set missing selected property");
  });
});

test("namespace isolation", async (t) => {
  await t.test("guest and demo stores do not see each other", async () => {
    const driver = createMemoryStorageDriver();
    const guest = createCanonicalStore({ namespaceId: "guest:stage3", driver });
    const demo = createCanonicalStore({ namespaceId: "demo:nick", driver });
    assertOk(await guest.upsertProperty(makeProperty("prop_guest", "1 Guest Road, Leeds LS1 1AA", "guest:stage3")), "guest upsert");
    assertOk(await demo.upsertProperty(makeProperty("prop_demo", "2 Demo Road, Cardiff CF10 1AA", "demo:nick")), "demo upsert");
    assert.equal(assertOk(await guest.getProperty("prop_demo"), "guest cannot see demo"), null);
    assert.equal(assertOk(await demo.getProperty("prop_guest"), "demo cannot see guest"), null);
  });

  await t.test("two user namespaces and QA namespace stay isolated", async () => {
    const driver = createMemoryStorageDriver();
    const userA = createCanonicalStore({ namespaceId: "user:a", driver });
    const userB = createCanonicalStore({ namespaceId: "user:b", driver });
    const qa = createCanonicalStore({ namespaceId: "qa:fixtures", driver });
    assertOk(await userA.upsertProperty(makeProperty("prop_user_a", "3 User A Lane, London E1 1AA", "user:a")), "user A");
    assertOk(await userB.upsertProperty(makeProperty("prop_user_b", "4 User B Lane, London E2 2AA", "user:b")), "user B");
    assertOk(await qa.upsertProperty(makeProperty("prop_qa", "5 QA Street, London E3 3AA", "qa:fixtures")), "qa");
    assert.equal(assertOk(await userA.getProperty("prop_user_b"), "user A no user B"), null);
    assert.equal(assertOk(await userB.getProperty("prop_qa"), "user B no QA"), null);
  });

  await t.test("demo import does not clear guest data", async () => {
    const driver = createMemoryStorageDriver();
    const guest = createCanonicalStore({ namespaceId: "guest:stage3", driver });
    const demo = createCanonicalStore({ namespaceId: "demo:nick", driver });
    assertOk(await guest.upsertProperty(makeProperty("prop_guest_keep", "6 Guest Keep, Oxford OX1 1AA", "guest:stage3")), "guest keep");
    assertOk(await demo.importLegacyRecord("labs_fixture", { id: "demo-fixture", address: "7 Demo Seed, Oxford OX2 2AA", postcode: "OX2 2AA" }), "demo import");
    assert.equal(assertOk(await guest.getProperty("prop_guest_keep"), "guest survives").address, "6 Guest Keep, Oxford OX1 1AA");
  });
});

test("validation", async (t) => {
  const exampleFiles = [
    ["contracts/examples/property-record-standard.json", propertySchema],
    ["contracts/examples/property-record-no-epc.json", propertySchema],
    ["contracts/examples/property-record-vacant.json", propertySchema],
    ["contracts/examples/property-record-evidence-gap.json", propertySchema],
    ["contracts/examples/service-request-simulated.json", serviceRequestSchema],
  ];

  for (const [file, schema] of exampleFiles) {
    await t.test(`${file} validates against its schema`, () => {
      const validation = validateJsonSchema(readJson(file), schema);
      assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    });
  }

  await t.test("service intent example validates with service intent validator", () => {
    const validation = validateServiceIntentDraft(readJson("contracts/examples/service-intent-eicr.json"));
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  });

  await t.test("canonical store example validates as an envelope", () => {
    const validation = validateStoreEnvelope(readJson("contracts/examples/canonical-store-example.json"));
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  });

  await t.test("malformed record is rejected and invalid enum is rejected", () => {
    assert.equal(validatePropertyRecord({ id: "only-id" }).ok, false);
    const invalid = makeProperty("prop_invalid_enum");
    invalid.lifecycleStatus = "deleted";
    assert.equal(validatePropertyRecord(invalid).ok, false);
  });

  await t.test("missing property ID is rejected", () => {
    const missingId = makeProperty("prop_missing");
    delete missingId.id;
    assert.equal(validatePropertyRecord(missingId).ok, false);
  });

  await t.test("stored malformed JSON is handled safely", async () => {
    const storage = { getItem: () => "{bad json", setItem: () => {}, removeItem: () => {}, key: () => null, length: 1 };
    const store = createCanonicalStore({ namespaceId: "guest:bad-json", driver: createStorageObjectDriver(storage) });
    const result = await store.loadStore();
    assert.equal(result.ok, false);
    assert.match(result.errors.join(" "), /Malformed JSON/);
  });

  await t.test("valid data remains intact after invalid write attempt", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    const original = makeProperty("prop_valid_intact");
    assertOk(await store.upsertProperty(original), "valid upsert");
    const invalid = { ...original, lifecycleStatus: "deleted" };
    assertNotOk(await store.upsertProperty(invalid), "invalid upsert");
    assert.equal(assertOk(await store.getProperty("prop_valid_intact"), "valid still present").lifecycleStatus, "active");
  });
});

test("unknown and missing semantics", async (t) => {
  await t.test("unknown and missing remain distinct", () => {
    assert.deepEqual(normalizeUnknownish("unknown"), { kind: "unknown", value: "unknown" });
    assert.deepEqual(normalizeUnknownish("missing"), { kind: "missing", value: "missing" });
    assert.deepEqual(normalizeUnknownish(""), { kind: "empty_string", value: "" });
  });

  await t.test("normalizers preserve enum boundaries", () => {
    assert.equal(normalizePostcode("bs11aa"), "BS1 1AA");
    assert.equal(normalizeConfidence("HIGH"), "high");
    assert.equal(normalizeSourceType("local-authority"), "local_authority");
    assert.equal(normalizeProofStatus("missing"), "missing");
    assert.equal(normalizeIssueStatus("awaiting evidence"), "awaiting_evidence");
    assert.equal(normalizeActionStatus("queued"), "queued");
    assert.equal(normalizeServiceStatus("quote requested"), "quote_requested");
    assert.equal(normalizeCapabilityStatus("live"), "live");
  });

  await t.test("no EPC remains no EPC without rating or heating inference", () => {
    const noEpc = normalizeNoEpcFinding({ epcStatus: "missing", epcRating: "C", mainHeating: "Gas boiler" });
    assert.equal(noEpc.value.epcFound, false);
    assert.equal("epcRating" in noEpc.value, false);
    assert.equal("epcPotential" in noEpc.value, false);
    assert.equal("epcExpiry" in noEpc.value, false);
    assert.equal("mainHeating" in noEpc.value, false);
  });

  await t.test("vacant example has no current occupant count", () => {
    const vacant = readJson("contracts/examples/property-record-vacant.json");
    const occupantAnswer = vacant.landlordAnswers.find((answer) => answer.questionId.includes("occupant"));
    assert.equal(occupantAnswer, undefined);
  });

  await t.test("no proof does not become verified and simulated does not become live", () => {
    const gap = readJson("contracts/examples/property-record-evidence-gap.json");
    assert.equal(gap.evidence[0].proofStatus, "missing");
    assert.notEqual(gap.evidence[0].verificationStatus, "verified");
    assert.equal(gap.evidence[0].capabilityStatus, "simulated");
  });
});

test("adapter behavior", async (t) => {
  await t.test("public workspace maps to PropertyRecord candidates", () => {
    const result = adaptPublicWorkspaceStore({
      propertiesById: {
        pub_1: { id: "pub_1", address: "21 Public Road, Bristol BS2 2AA", postcode: "BS2 2AA" },
      },
      selectedPropertyId: "pub_1",
    }, { namespaceId: "guest:stage3" });
    const candidates = assertOk(result, "public workspace adapter");
    assert.equal(candidates.records[0].id, "legacy_public_workspace_pub_1");
    assert.equal(validatePropertyRecord(candidates.records[0]).ok, true);
  });

  await t.test("public service draft maps to ServiceIntentDraft without creating ServiceRequest", () => {
    const source = { serviceId: "eicr", route: "eicr.html", answers: { urgency: "soon" }, fileNames: ["old-eicr.pdf"] };
    const intent = assertOk(adaptPublicServiceDraft(source), "service draft adapter");
    assert.equal(intent.serviceId, "eicr");
    assert.equal(intent.propertyId, null);
    assert.equal(intent.evidencePlaceholders[0].stored, false);
    assert.equal(validateServiceIntentDraft(intent).ok, true);
  });

  await t.test("Labs fixture maps into demo namespace metadata", () => {
    const record = assertOk(adaptLabsPropertyFixture({ id: "the-butts", address: "57 The Butts, Brentford TW8 8BL", postcode: "TW8 8BL" }), "labs fixture").records[0];
    assert.equal(record.namespace, "demo:labs-fixture");
    assert.equal(record.demoMetadata.fixture, true);
    assert.equal(record.entryContext.migration.sourceSystem, "labs_fixture");
  });

  await t.test("Journey OS no-EPC state does not invent EPC or heating", () => {
    const record = assertOk(adaptJourneyOsState({
      id: "journey-no-epc",
      address: "31 No EPC Road, Exeter EX1 1AA",
      epc: { status: "missing", rating: "C", mainHeating: "Gas boiler" },
      answers: { occupancy: "unknown" },
    }), "journey adapter").records[0];
    const epcFinding = record.smartCheckResults.find((finding) => finding.checkType === "epc");
    assert.equal(epcFinding.resultStatus, "missing");
    assert.equal("epcRating" in epcFinding.value, false);
    assert.equal("mainHeating" in epcFinding.value, false);
  });

  await t.test("old dashboard adapter is pure", () => {
    const source = { id: "old_1", address: "41 Old Dash Way, Norwich NR1 1AA", postcode: "NR1 1AA" };
    const before = clone(source);
    assertOk(adaptOldDashboardWorkspace(source), "old dashboard adapter");
    assert.deepEqual(source, before);
  });

  await t.test("A-Z adapter does not claim verified compliance", () => {
    const result = adaptAzCheckerState({ answers: { epc: "valid" }, completed: true, compliance: "verified" });
    assert.equal(result.ok, false);
    assert.equal(result.nonImportable, true);
    assert.match(result.warnings.join(" "), /no property identity/i);
  });
});

test("migration behavior", async (t) => {
  await t.test("preview writes nothing", async () => {
    const driver = createMemoryStorageDriver();
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver });
    const source = { id: "pub_preview", address: "51 Preview Road, Derby DE1 1AA", postcode: "DE1 1AA" };
    assertOk(await store.previewImport("public_workspace", source), "preview");
    assert.deepEqual(assertOk(await store.listProperties(), "list after preview"), []);
  });

  await t.test("first import creates one record and repeated import is idempotent", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    const source = { id: "pub_import", address: "52 Import Road, Derby DE1 2AA", postcode: "DE1 2AA" };
    const first = assertOk(await store.importLegacyRecord("public_workspace", source), "first import");
    const second = assertOk(await store.importLegacyRecord("public_workspace", source), "second import");
    assert.equal(first.records[0].id, second.records[0].id);
    assert.equal(assertOk(await store.listProperties(), "list imported").length, 1);
  });

  await t.test("collision does not overwrite and potential duplicate is reported", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    assertOk(await store.upsertProperty(makeProperty("legacy_public_workspace_conflict", "60 Existing Road, Derby DE1 3AA")), "existing");
    const collision = await store.importLegacyRecord("public_workspace", { id: "conflict", address: "61 New Road, Derby DE1 4AA", postcode: "DE1 4AA" });
    assert.equal(collision.ok, false);
    assert.match(collision.errors.join(" "), /collision/i);

    const duplicate = await store.importLegacyRecord("public_workspace", { id: "possible_dup", address: "60 Existing Road, Derby DE1 3AA", postcode: "DE1 3AA" });
    assert.equal(duplicate.ok, true);
    assert.match(duplicate.warnings.join(" "), /potential duplicate/i);
    assert.equal(assertOk(await store.listProperties(), "duplicates preserved").length, 2);
  });

  await t.test("rollback archive affects only canonical import and source remains unchanged", async () => {
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: createMemoryStorageDriver() });
    const source = { id: "rollback", address: "70 Rollback Road, Derby DE1 5AA", postcode: "DE1 5AA" };
    const before = clone(source);
    const imported = assertOk(await store.importLegacyRecord("public_workspace", source), "import rollback");
    assertOk(await store.archiveImportedRecord(imported.migrationKeys[0]), "archive imported");
    assert.equal(assertOk(await store.getProperty(imported.records[0].id), "archived imported").lifecycleStatus, "archived");
    assert.deepEqual(source, before);
  });
});

test("storage drivers", async (t) => {
  await t.test("localStorage and sessionStorage drivers require explicit storage objects", async () => {
    const storage = new Map();
    const storageLike = {
      get length() { return storage.size; },
      key(index) { return [...storage.keys()][index] || null; },
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, value); },
      removeItem(key) { storage.delete(key); },
    };
    assertOk(await createLocalStorageDriver(storageLike).set("local", "1"), "local set");
    assertOk(await createSessionStorageDriver(storageLike).set("session", "2"), "session set");
    assert.deepEqual(assertOk(await createStorageObjectDriver(storageLike).keys(), "keys").sort(), ["local", "session"]);
  });
});

test("product isolation", async (t) => {
  await t.test("legacy storage keys are not removed by canonical operations", async () => {
    const memory = createMemoryStorageDriver({
      "cmp_compliance_workspaces::guest": "{\"legacy\":true}",
      "cmp_public_service_draft::eicr": "{\"legacy\":true}",
      "cmp_az_checker_v2": "{\"legacy\":true}",
    });
    const store = createCanonicalStore({ namespaceId: "guest:stage3", driver: memory });
    assertOk(await store.upsertProperty(makeProperty("prop_no_legacy_remove")), "canonical write");
    const keys = assertOk(await memory.keys(), "memory keys");
    assert.ok(keys.includes("cmp_compliance_workspaces::guest"));
    assert.ok(keys.includes("cmp_public_service_draft::eicr"));
    assert.ok(keys.includes("cmp_az_checker_v2"));
  });

  await t.test("no product page imports storage or migration internals directly", () => {
    const productFiles = execFileSync("git", ["ls-files", "*.html", "*.css", "*.js"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .filter((file) => !file.startsWith("core/"));
    const allowedCoreScripts = [
      "core/cmp-public-property-bridge.js",
      "core/cmp-priority-rules.js",
      "core/cmp-score-derivation.js",
      "core/cmp-monitoring-derivation.js",
      "core/cmp-compliance-derivation.js",
      "core/cmp-service-lifecycle.js",
      "core/cmp-evidence-lifecycle.js",
      "core/cmp-ask-context.js",
      "core/cmp-ask-response.js",
      "core/cmp-report-generator.js",
      "core/cmp-property-actions.js",
      "core/cmp-scenario-definitions.js",
      "core/cmp-scenario-seeding.js",
    ];
    for (const file of productFiles) {
      let content = fs.readFileSync(path.join(root, file), "utf8");
      for (const allowed of allowedCoreScripts) {
        content = content.replaceAll(allowed, "");
      }
      assert.equal(/cmp-property-store|cmp-storage-drivers|cmp-domain-normalize|cmp-transitional-adapters|cmp-id|core\//.test(content), false, `${file} imports restricted Stage 3 core`);
    }
  });

  await t.test("no existing product HTML/CSS/runtime page file changed during Stage 3", () => {
    const allowed = [/^core\//, /^contracts\/examples\//, /^docs\/CMP_CANONICAL_STORE_API\.md$/, /^docs\/CMP_LEGACY_ADAPTER_MATRIX\.md$/, /^tools\/cmp-stage-2-contract-check\.mjs$/, /^tools\/cmp-stage-3-property-store-check\.mjs$/];
    const status = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(3).trim());
    for (const file of status) {
      assert.ok(allowed.some((pattern) => pattern.test(file)), `unexpected changed file: ${file}`);
    }
  });
});
