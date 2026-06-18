"use strict";

const {
  normalizeAddress,
  normalizePostcode,
  normalizeConfidence,
  normalizeCapabilityStatus,
  normalizeNoEpcFinding,
  normalizeProofStatus,
  normalizeIssueStatus,
  normalizeActionStatus,
  normalizeServiceStatus,
  resultOk,
  resultFail,
} = require("./cmp-domain-normalize.js");
const {
  createImportedId,
  createMigrationKey,
  sanitizeIdPart,
  stableHash,
} = require("./cmp-id.js");

const ADAPTER_VERSION = "v1";

function nowIso(options = {}) {
  return options.now || new Date().toISOString();
}

function sourceReference(sourceSystem, confidence = "medium") {
  return {
    sourceType: "cmp_history",
    sourceLabel: sourceSystem,
    sourceIdentifier: null,
    checkedDate: null,
    confidence: normalizeConfidence(confidence),
    capabilityStatus: "simulated",
    notes: "Imported from transitional prototype state.",
  };
}

function sourceRecordId(source, fallbackPrefix) {
  return source?.id || source?.propertyId || source?.workspaceId || source?.selectedPropertyId || `${fallbackPrefix}-${stableHash(source)}`;
}

function migrationBlock(sourceSystem, source, options = {}) {
  const recordId = sourceRecordId(source, sourceSystem);
  return {
    sourceSystem,
    sourceRecordId: String(recordId),
    importedAt: nowIso(options),
    adapterVersion: ADAPTER_VERSION,
    originalSchemaVersion: source?.schemaVersion || source?.version || null,
    migrationKey: createMigrationKey(sourceSystem, recordId, ADAPTER_VERSION, source),
  };
}

function createBaseRecord(sourceSystem, source, options = {}) {
  const recordId = sourceRecordId(source, sourceSystem);
  const id = options.id || createImportedId(sourceSystem, recordId, source);
  const addressInput = normalizeAddress({
    displayAddress: source?.displayAddress || source?.address,
    line1: source?.line1,
    line2: source?.line2,
    town: source?.town,
    county: source?.county,
    postcode: source?.postcode,
  });
  const timestamp = nowIso(options);
  const namespace = options.namespaceId || "guest:import";

  return {
    id,
    namespace,
    identity: {
      displayAddress: addressInput.displayAddress,
      line1: addressInput.line1,
      line2: addressInput.line2,
      town: addressInput.town,
      county: addressInput.county,
      postcode: normalizePostcode(addressInput.postcode),
      uprn: source?.uprn || null,
      source: sourceReference(sourceSystem, source?.confidence),
      matchStatus: source?.uprn ? "matched" : "manual",
      confidence: normalizeConfidence(source?.confidence || "medium"),
      manualEdits: [],
      previousValues: [],
      history: [],
    },
    address: addressInput.displayAddress,
    uprn: source?.uprn || null,
    creationSource: sourceSystem === "labs_fixture" ? "demo_scenario" : "migration",
    currentSetupStage: "workspace",
    lifecycleStatus: sourceSystem === "labs_fixture" ? "demo" : "active",
    entryContext: {
      sourceRoute: source?.sourceRoute || null,
      serviceIntentId: source?.serviceIntentId || null,
      problemId: source?.problemId || null,
      askCmpPromptId: source?.askCmpPromptId || null,
      scenarioId: source?.scenarioId || null,
      migration: migrationBlock(sourceSystem, source, options),
    },
    smartCheckResults: [],
    landlordAnswers: [],
    issues: [],
    evidence: [],
    actions: [],
    serviceRequests: [],
    timeline: [],
    monitoring: [],
    reports: [],
    demoMetadata: sourceSystem === "labs_fixture" ? { fixture: true, sourceSystem } : null,
    schemaVersion: "1.0.0",
    createdAt: source?.createdAt || timestamp,
    updatedAt: source?.updatedAt || timestamp,
  };
}

function extractPropertyObjects(source) {
  if (Array.isArray(source)) return source;
  if (source?.propertiesById && typeof source.propertiesById === "object") return Object.values(source.propertiesById);
  if (Array.isArray(source?.properties)) return source.properties;
  if (Array.isArray(source?.workspaces)) return source.workspaces;
  if (source && typeof source === "object" && (source.address || source.displayAddress || source.id || source.propertyId)) return [source];
  return [];
}

function adaptPublicWorkspaceStore(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Public workspace source must be an object");
  const properties = extractPropertyObjects(source);
  if (!properties.length) return resultFail("Public workspace source contains no property-like records");
  const records = properties.map((property) => createBaseRecord("public_workspace", property, { ...options, namespaceId: options.namespaceId || "guest:import" }));
  return resultOk({
    records,
    selectedPropertySourceId: source.selectedPropertyId || null,
  }, source.selectedPropertyId ? ["Selected property preserved as metadata only."] : []);
}

function adaptJourneyContext(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Journey context source must be an object");
  return resultOk({
    sourceRoute: source.sourceRoute || source.route || null,
    serviceIntentId: source.serviceIntentId || source.entryService || null,
    problemId: source.problemId || source.focusMode || null,
    askCmpPromptId: source.askCmpPromptId || null,
    scenarioId: source.scenarioId || source.demo || null,
    migration: migrationBlock("journey_context", source, options),
  }, ["Journey context is transitional context, not authoritative property truth."]);
}

function adaptPublicServiceDraft(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Public service draft source must be an object");
  const serviceId = source.serviceId || source.service || source.entryService;
  if (!serviceId) return resultFail("Public service draft is missing serviceId");
  const timestamp = nowIso(options);
  const recordId = source.id || serviceId;
  return resultOk({
    id: createImportedId("public_service_draft", recordId, source),
    serviceId: sanitizeIdPart(serviceId),
    sourceRoute: source.sourceRoute || source.route || `${sanitizeIdPart(serviceId)}.html`,
    contact: source.contact || source.visitorContact || {},
    addressInput: source.addressInput || source.address || null,
    focusMode: source.focusMode || source.mode || null,
    serviceAnswers: source.answers || source.serviceAnswers || {},
    evidencePlaceholders: (source.fileNames || source.documents || []).map((fileName) => ({
      fileName: String(fileName),
      stored: false,
      proofStatus: "missing",
      capabilityStatus: "simulated",
    })),
    propertyId: source.propertyId || null,
    status: "draft",
    migration: migrationBlock("public_service_draft", source, options),
    createdAt: source.createdAt || timestamp,
    updatedAt: source.updatedAt || timestamp,
  }, ["File names are evidence placeholders only; no document is uploaded or stored."]);
}

function adaptLabsPropertyFixture(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Labs fixture source must be an object");
  const record = createBaseRecord("labs_fixture", source, { ...options, namespaceId: options.namespaceId || "demo:labs-fixture" });
  record.demoMetadata = {
    fixture: true,
    sourceSystem: "labs_fixture",
    label: source.label || source.name || null,
  };
  return resultOk({ records: [record] }, ["Labs fixtures are demo namespace only and must never overwrite public/guest records."]);
}

function adaptJourneyOsState(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Journey OS source must be an object");
  const record = createBaseRecord("journey_os", source, { ...options, namespaceId: options.namespaceId || "demo:journey-os" });
  const timestamp = nowIso(options);

  if (source.epc?.status === "missing" || source.epc?.status === "no_epc" || source.epcStatus === "missing") {
    record.smartCheckResults.push(normalizeNoEpcFinding({
      propertyId: record.id,
      checkedAt: timestamp,
      capabilityStatus: "simulated",
    }));
  } else if (source.epc?.rating || source.epcRating) {
    record.smartCheckResults.push({
      id: `${record.id}_epc_import`,
      propertyId: record.id,
      checkType: "epc",
      resultStatus: "found",
      value: {
        epcRating: source.epc?.rating || source.epcRating,
        epcPotential: source.epc?.potential || source.epcPotential || "unknown",
        epcExpiry: source.epc?.expiry || source.epcExpiry || null,
      },
      sourceReferences: [sourceReference("journey_os")],
      confidence: "medium",
      requiresConfirmation: true,
      missingReason: null,
      unknownReason: null,
      checkedAt: timestamp,
      capabilityStatus: "simulated",
    });
  }

  record.landlordAnswers = Object.entries(source.answers || {}).map(([questionId, answer], index) => ({
    id: `${record.id}_answer_${index + 1}`,
    propertyId: record.id,
    questionId,
    answer,
    context: "unknown",
    source: "user_stated",
    answeredAt: timestamp,
    dependencyKeys: [],
    evidenceStatus: "unverified",
    editedHistory: [],
    sourceReferences: [sourceReference("journey_os")],
  }));

  record.issues = (source.issues || []).map((issue, index) => ({
    id: issue.id || `${record.id}_issue_${index + 1}`,
    propertyId: record.id,
    category: issue.category || issue.type || "legacy_import",
    status: normalizeIssueStatus(issue.status),
    severity: issue.severity || "unknown",
    legalUrgency: issue.legalUrgency || "unknown",
    confidence: normalizeConfidence(issue.confidence),
    sourceReferences: [sourceReference("journey_os")],
    triggerFacts: [],
    triggerAnswers: [],
    affectedStage: issue.affectedStage || null,
    resolvedAt: null,
    ruleVersion: "legacy-journey-os-import",
    capabilityStatus: "simulated",
  }));

  record.actions = (source.actions || []).map((action, index) => ({
    id: action.id || `${record.id}_action_${index + 1}`,
    propertyId: record.id,
    linkedIssueId: action.issueId || record.issues[0]?.id || `${record.id}_legacy_issue`,
    priority: Number(action.priority || index + 1),
    actionType: action.actionType || action.type || "legacy_import",
    reason: action.reason || "Imported from Journey OS transitional state.",
    sourceConfidenceSummary: "Imported local derived item; not canonical rules-engine output.",
    nextStep: action.nextStep || "Review imported action.",
    primaryCta: action.primaryCta || "Review",
    secondaryCta: action.secondaryCta || null,
    serviceOptions: action.serviceOptions || [],
    status: normalizeActionStatus(action.status),
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return resultOk({ records: [record] }, ["Imported Journey OS issues/actions are legacy-derived and not canonical rules-engine output."]);
}

function adaptOldDashboardWorkspace(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("Old dashboard source must be an object");
  const record = createBaseRecord("old_dashboard", source, { ...options, namespaceId: options.namespaceId || "guest:old-dashboard" });
  return resultOk({ records: [record] }, ["Old dashboard source was mapped without live Supabase access."]);
}

function adaptAzCheckerState(source, options = {}) {
  if (!source || typeof source !== "object") return resultFail("A-Z checker source must be an object");
  if (!source.address && !source.displayAddress && !source.propertyId && !source.id) {
    return {
      ok: false,
      errors: ["A-Z checker state has no property identity and is not directly importable."],
      warnings: ["No property identity was found; A-Z completion is not proof or verified compliance."],
      nonImportable: true,
      preservedAnswers: source.answers || {},
    };
  }
  const record = createBaseRecord("az_checker", source, { ...options, namespaceId: options.namespaceId || "guest:az-import" });
  record.landlordAnswers = Object.entries(source.answers || {}).map(([questionId, answer], index) => ({
    id: `${record.id}_az_answer_${index + 1}`,
    propertyId: record.id,
    questionId,
    answer,
    context: "unknown",
    source: "user_stated",
    answeredAt: nowIso(options),
    dependencyKeys: [],
    evidenceStatus: "unverified",
    editedHistory: [],
    sourceReferences: [sourceReference("az_checker")],
  }));
  return resultOk({ records: [record] }, ["A-Z completion was imported as answers only, not proof or verified compliance."]);
}

function previewWithAdapter(sourceType, sourceValue, options = {}) {
  const adapters = {
    public_workspace: adaptPublicWorkspaceStore,
    journey_context: adaptJourneyContext,
    public_service_draft: adaptPublicServiceDraft,
    labs_fixture: adaptLabsPropertyFixture,
    journey_os: adaptJourneyOsState,
    old_dashboard: adaptOldDashboardWorkspace,
    az_checker: adaptAzCheckerState,
  };
  const adapter = adapters[sourceType];
  if (!adapter) return resultFail(`Unsupported source type: ${sourceType}`);
  return adapter(sourceValue, options);
}

module.exports = {
  ADAPTER_VERSION,
  adaptPublicWorkspaceStore,
  adaptJourneyContext,
  adaptPublicServiceDraft,
  adaptLabsPropertyFixture,
  adaptJourneyOsState,
  adaptOldDashboardWorkspace,
  adaptAzCheckerState,
  previewWithAdapter,
};
