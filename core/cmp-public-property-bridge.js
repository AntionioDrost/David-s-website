(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPPublicPropertyBridge = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const CANONICAL_STORE_VERSION = 1;
  const CANONICAL_STORE_KEY_PREFIX = "cmp_canonical_property_store_v1";
  const PUBLIC_GUEST_NAMESPACE_ID = "guest:public";
  const SCHEMA_VERSION = "property-record.stage4.v1";
  const BRIDGE_VERSION = "stage4-public-add-property-v1";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors, extra = {}) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors], ...extra };
  }

  function nowIso(options = {}) {
    return options.now || new Date().toISOString();
  }

  function datePart(value) {
    return String(value || "").slice(0, 10) || null;
  }

  function buildPublicStorageKey(namespaceId = PUBLIC_GUEST_NAMESPACE_ID) {
    return `${CANONICAL_STORE_KEY_PREFIX}::${namespaceId}`;
  }

  function normalizePostcode(value) {
    const normalized = String(value || "").replace(/\s+/g, "").toUpperCase();
    if (!normalized) return "";
    if (normalized.length <= 3) return normalized;
    return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
  }

  function normalizeLookupText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizedAddressKey(address, postcode = "") {
    return `${normalizeLookupText(address)}|${normalizePostcode(postcode).replace(/\s+/g, "")}`;
  }

  function sanitizeIdPart(value) {
    return String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "") || "unknown";
  }

  function fallbackRandomId() {
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createCanonicalId(prefix = "prop", options = {}) {
    const randomUUID = options.randomUUID
      || root?.crypto?.randomUUID?.bind(root.crypto)
      || globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
    const rawId = randomUUID ? randomUUID() : fallbackRandomId();
    return `${sanitizeIdPart(prefix)}_${rawId}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeJsonParse(value) {
    try {
      return resultOk(JSON.parse(value || "null"));
    } catch (error) {
      return resultFail(`Malformed JSON: ${error.message}`, { rawValue: value });
    }
  }

  function createEmptyStore(namespaceId, options = {}) {
    const timestamp = nowIso(options);
    return {
      storeVersion: CANONICAL_STORE_VERSION,
      namespaceId,
      propertiesById: {},
      propertyOrder: [],
      lastSelectedPropertyId: null,
      serviceIntentsById: {},
      migrationIndex: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  function validateStorage(storage) {
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
      return resultFail("A Storage-compatible object is required.");
    }
    return resultOk(storage);
  }

  function validateStoreEnvelope(store, namespaceId) {
    const errors = [];
    if (!store || typeof store !== "object" || Array.isArray(store)) errors.push("Store envelope must be an object.");
    if (store?.storeVersion !== CANONICAL_STORE_VERSION) errors.push("Store envelope storeVersion must be 1.");
    if (store?.namespaceId !== namespaceId) errors.push(`Store namespace must be ${namespaceId}.`);
    if (!store?.propertiesById || typeof store.propertiesById !== "object" || Array.isArray(store.propertiesById)) errors.push("Store propertiesById must be an object.");
    if (!Array.isArray(store?.propertyOrder)) errors.push("Store propertyOrder must be an array.");
    if (!store?.serviceIntentsById || typeof store.serviceIntentsById !== "object" || Array.isArray(store.serviceIntentsById)) errors.push("Store serviceIntentsById must be an object.");
    if (!store?.migrationIndex || typeof store.migrationIndex !== "object" || Array.isArray(store.migrationIndex)) errors.push("Store migrationIndex must be an object.");
    for (const propertyId of store?.propertyOrder || []) {
      if (!store.propertiesById?.[propertyId]) errors.push(`propertyOrder references missing property ${propertyId}.`);
    }
    return errors.length ? resultFail(errors) : resultOk(store);
  }

  function readCanonicalStore(storage, namespaceId = PUBLIC_GUEST_NAMESPACE_ID, options = {}) {
    const storageValidation = validateStorage(storage);
    if (!storageValidation.ok) return storageValidation;

    const key = buildPublicStorageKey(namespaceId);
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      return resultFail(`Storage read failed for ${key}: ${error.message}`);
    }

    if (!raw) return resultOk(createEmptyStore(namespaceId, options));

    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      return resultFail(parsed.errors, { quarantine: { storageKey: key, rawValue: raw } });
    }

    const validation = validateStoreEnvelope(parsed.value, namespaceId);
    if (!validation.ok) {
      return resultFail(validation.errors, { quarantine: { storageKey: key, parsed: parsed.value } });
    }
    return resultOk(parsed.value);
  }

  function writeCanonicalStore(storage, store, options = {}) {
    const storageValidation = validateStorage(storage);
    if (!storageValidation.ok) return storageValidation;
    const nextStore = clone(store);
    nextStore.updatedAt = nowIso(options);
    const validation = validateStoreEnvelope(nextStore, nextStore.namespaceId);
    if (!validation.ok) return validation;
    const key = buildPublicStorageKey(nextStore.namespaceId);
    try {
      storage.setItem(key, JSON.stringify(nextStore));
    } catch (error) {
      return resultFail(`Storage write failed for ${key}: ${error.message}`);
    }
    return resultOk(nextStore);
  }

  function sourceReference(overrides = {}) {
    return {
      sourceType: overrides.sourceType || "user_stated",
      sourceLabel: overrides.sourceLabel || "Public Add Property",
      sourceIdentifier: overrides.sourceIdentifier ?? null,
      checkedDate: overrides.checkedDate ?? null,
      confidence: overrides.confidence || "medium",
      capabilityStatus: overrides.capabilityStatus || "simulated",
      notes: overrides.notes ?? null,
    };
  }

  function smartCheck(idSuffix, propertyId, checkType, resultStatus, options = {}) {
    return {
      id: `${propertyId}_${idSuffix}`,
      propertyId,
      checkType,
      resultStatus,
      value: options.value ?? null,
      sourceReferences: options.sourceReferences || [sourceReference()],
      confidence: options.confidence || "unknown",
      requiresConfirmation: Boolean(options.requiresConfirmation),
      missingReason: options.missingReason ?? null,
      unknownReason: options.unknownReason ?? null,
      checkedAt: options.checkedAt ?? null,
      capabilityStatus: options.capabilityStatus || "simulated",
    };
  }

  function createSmartCheckResults(selection, propertyId, options = {}) {
    const checkedAt = nowIso(options);
    const checkedDate = datePart(checkedAt);
    const addressSource = sourceReference({
      sourceType: "user_stated",
      sourceLabel: "Public address selection",
      sourceIdentifier: selection.uprn || selection.id || null,
      checkedDate,
      confidence: selection.uprn ? "high" : "medium",
      notes: "Address selected by the landlord from the public Add Property flow.",
    });
    const simulatedSource = sourceReference({
      sourceType: "inferred",
      sourceLabel: "Simulated Smart Check",
      sourceIdentifier: selection.id || null,
      checkedDate,
      confidence: "medium",
      notes: "Prepared for review from prototype data. No live supplier or official lookup was performed.",
    });
    const epcSource = sourceReference({
      sourceType: selection.epc?.rating ? "official" : "missing",
      sourceLabel: selection.epc?.rating ? (selection.epc.source || "Simulated EPC preview") : "No EPC found in simulated preview",
      sourceIdentifier: selection.epc?.certificate || null,
      checkedDate,
      confidence: selection.epc?.rating ? "medium" : "medium",
      notes: selection.epc?.rating
        ? "Simulated EPC data prepared for landlord review."
        : "No EPC rating, potential, expiry or EPC-derived heating has been inferred.",
    });

    const checks = [
      smartCheck("address_match", propertyId, "address_match", selection.uprn ? "found" : "likely", {
        value: {
          displayAddress: selection.address,
          postcode: normalizePostcode(selection.postcode),
          uprn: selection.uprn || null,
        },
        sourceReferences: [addressSource],
        confidence: selection.uprn ? "high" : "medium",
        requiresConfirmation: true,
        checkedAt,
      }),
      smartCheck("local_authority", propertyId, "local_authority", selection.city ? "likely" : "unknown", {
        value: selection.city ? { localAuthority: selection.city } : null,
        sourceReferences: [simulatedSource],
        confidence: selection.city ? "medium" : "unknown",
        requiresConfirmation: true,
        unknownReason: selection.city ? null : "Local authority unavailable in simulated preview",
        checkedAt,
      }),
      smartCheck("property_type", propertyId, "property_type", selection.type ? "likely" : "unknown", {
        value: selection.type ? {
          propertyType: selection.type,
          bedrooms: selection.bedrooms ?? null,
          storeys: selection.storeys ?? null,
        } : null,
        sourceReferences: [simulatedSource],
        confidence: selection.type ? "medium" : "unknown",
        requiresConfirmation: true,
        unknownReason: selection.type ? null : "Property type unavailable in simulated preview",
        checkedAt,
      }),
    ];

    if (selection.epc?.rating) {
      checks.push(smartCheck("epc", propertyId, "epc", "found", {
        value: {
          epcFound: true,
          epcRating: selection.epc.rating,
          currentScore: selection.epc.currentScore ?? null,
          epcPotential: selection.epc.potential || null,
          potentialScore: selection.epc.potentialScore ?? null,
          epcIssueDate: selection.epc.issue || null,
          epcExpiry: selection.epc.expiry || null,
          certificateRef: selection.epc.certificate || null,
        },
        sourceReferences: [epcSource],
        confidence: "medium",
        requiresConfirmation: true,
        checkedAt,
      }));
      checks.push(smartCheck("heating_source", propertyId, "heating_source", selection.hasGas === undefined || selection.hasGas === null ? "unknown" : "likely", {
        value: selection.hasGas === undefined || selection.hasGas === null ? null : {
          hasGas: Boolean(selection.hasGas),
          fixedCombustion: selection.fixedCombustion ?? null,
        },
        sourceReferences: [sourceReference({
          sourceType: "inferred",
          sourceLabel: "Simulated property preview",
          sourceIdentifier: selection.id || null,
          checkedDate,
          confidence: "low",
          notes: "Heating is not derived from EPC. It needs landlord confirmation.",
        })],
        confidence: selection.hasGas === undefined || selection.hasGas === null ? "unknown" : "low",
        requiresConfirmation: true,
        unknownReason: selection.hasGas === undefined || selection.hasGas === null ? "Heating source unavailable in simulated preview" : null,
        checkedAt,
      }));
    } else {
      checks.push(smartCheck("epc", propertyId, "epc", "missing", {
        value: { epcFound: false },
        sourceReferences: [epcSource],
        confidence: "medium",
        requiresConfirmation: true,
        missingReason: "No EPC found in simulated preview",
        checkedAt,
      }));
      checks.push(smartCheck("heating_source", propertyId, "heating_source", "unknown", {
        value: null,
        sourceReferences: [sourceReference({
          sourceType: "unknown",
          sourceLabel: "Heating source not known",
          sourceIdentifier: null,
          checkedDate,
          confidence: "unknown",
          notes: "Heating remains unknown because no EPC was found and no separate heating source was checked.",
        })],
        confidence: "unknown",
        requiresConfirmation: true,
        unknownReason: "Heating source is unknown",
        checkedAt,
      }));
    }

    return checks;
  }

  function serviceIntentFromContext(journeyContext = {}, serviceDraft = {}, propertyId, options = {}) {
    const serviceId = journeyContext.entryService || serviceDraft.entryService || null;
    if (!serviceId || serviceId === "full_compliance") return null;
    const timestamp = nowIso(options);
    const uploadEntries = Object.entries(serviceDraft)
      .filter(([key, value]) => /_upload$/.test(key) && value)
      .map(([key, value]) => ({
        key,
        fileName: String(value),
        evidenceType: key.replace(/_upload$/, ""),
        proofStatus: "unverified",
        stored: false,
        capabilityStatus: "simulated",
      }));
    return {
      id: `service_intent_${sanitizeIdPart(serviceId)}_${sanitizeIdPart(propertyId)}`,
      serviceId,
      sourceRoute: journeyContext.sourceRoute || serviceDraft.sourceRoute || null,
      contact: {},
      addressInput: null,
      focusMode: journeyContext.focusMode || serviceDraft.focusMode || "service_only",
      serviceAnswers: clone(serviceDraft),
      evidencePlaceholders: uploadEntries,
      propertyId,
      status: "attached",
      createdAt: timestamp,
      updatedAt: timestamp,
      capabilityStatus: "simulated",
    };
  }

  function existingPropertyForSelection(store, selection) {
    const addressKey = normalizedAddressKey(selection.address, selection.postcode);
    return Object.values(store.propertiesById).find((property) => {
      return Boolean(
        (selection.uprn && property.identity?.uprn === selection.uprn)
        || property.entryContext?.stage4Bridge?.addressKey === addressKey
      );
    }) || null;
  }

  function createPropertyRecord(selection, options = {}) {
    const errors = [];
    if (!selection || typeof selection !== "object") errors.push("Selection is required.");
    if (!String(selection?.address || "").trim()) errors.push("Selection address is required.");
    if (!normalizePostcode(selection?.postcode)) errors.push("Selection postcode is required.");
    if (errors.length) return resultFail(errors);

    const namespaceId = options.namespaceId || PUBLIC_GUEST_NAMESPACE_ID;
    const timestamp = nowIso(options);
    const propertyId = options.propertyId || createCanonicalId("prop", options);
    const addressKey = normalizedAddressKey(selection.address, selection.postcode);
    const serviceIntent = serviceIntentFromContext(options.journeyContext || {}, options.serviceDraft || {}, propertyId, options);
    const source = sourceReference({
      sourceType: "user_stated",
      sourceLabel: "Public address selection",
      sourceIdentifier: selection.uprn || selection.id || null,
      checkedDate: datePart(timestamp),
      confidence: selection.uprn ? "high" : "medium",
      notes: "Selected in the Stage 4 canonical Add Property flow.",
    });
    const property = {
      id: propertyId,
      namespace: namespaceId,
      identity: {
        displayAddress: selection.address,
        line1: String(selection.address).split(",")[0]?.trim() || null,
        line2: null,
        town: selection.city || null,
        county: null,
        postcode: normalizePostcode(selection.postcode),
        uprn: selection.uprn || null,
        source,
        matchStatus: selection.uprn ? "matched" : "likely_match",
        confidence: selection.uprn ? "high" : "medium",
        manualEdits: [],
        previousValues: [],
        history: [],
      },
      address: selection.address,
      uprn: selection.uprn || null,
      creationSource: "add_property",
      currentSetupStage: "review_found_data",
      lifecycleStatus: "draft",
      entryContext: {
        sourceRoute: options.journeyContext?.sourceRoute || "add-property.html",
        serviceIntentId: serviceIntent?.id || null,
        problemId: null,
        askCmpPromptId: null,
        scenarioId: null,
        entryService: options.journeyContext?.entryService || "full_compliance",
        focusMode: options.journeyContext?.focusMode || "full_compliance",
        isTenanted: options.journeyContext?.isTenanted || "unsure",
        answeredQuestionKeys: Object.keys(options.journeyContext?.answeredQuestions || {}),
        stage4Bridge: {
          bridgeVersion: BRIDGE_VERSION,
          addressKey,
          selectedAddressId: selection.id || null,
          publicServiceDraftPreserved: Boolean(serviceIntent),
        },
      },
      smartCheckResults: createSmartCheckResults(selection, propertyId, options),
      landlordAnswers: [],
      issues: [],
      evidence: [],
      actions: [],
      serviceRequests: [],
      timeline: [],
      monitoring: [],
      reports: [],
      demoMetadata: null,
      schemaVersion: SCHEMA_VERSION,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    return resultOk({ property, serviceIntent });
  }

  function validatePropertyRecord(record) {
    const errors = [];
    for (const key of ["id", "namespace", "identity", "creationSource", "currentSetupStage", "lifecycleStatus", "schemaVersion", "createdAt", "updatedAt"]) {
      if (!record?.[key]) errors.push(`PropertyRecord missing ${key}.`);
    }
    if (!record?.identity?.displayAddress) errors.push("PropertyRecord identity.displayAddress is required.");
    if (!record?.identity?.postcode) errors.push("PropertyRecord identity.postcode is required.");
    if (!Array.isArray(record?.smartCheckResults)) errors.push("PropertyRecord smartCheckResults must be an array.");
    for (const check of record?.smartCheckResults || []) {
      if (check.propertyId !== record.id) errors.push(`Smart Check ${check.id} has mismatched propertyId.`);
      if (!check.sourceReferences?.length) errors.push(`Smart Check ${check.id} is missing source references.`);
      if (!["high", "medium", "low", "unknown"].includes(check.confidence)) errors.push(`Smart Check ${check.id} has invalid confidence.`);
      if (!["simulated", "live"].includes(check.capabilityStatus)) errors.push(`Smart Check ${check.id} has invalid capability status.`);
    }
    return errors.length ? resultFail(errors) : resultOk(record);
  }

  function createOrUpdatePropertyFromSelection(selection, options = {}) {
    const namespaceId = options.namespaceId || PUBLIC_GUEST_NAMESPACE_ID;
    const storage = options.storage || root?.localStorage;
    const loaded = readCanonicalStore(storage, namespaceId, options);
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    const existing = existingPropertyForSelection(store, selection);
    const created = createPropertyRecord(selection, {
      ...options,
      namespaceId,
      propertyId: existing?.id,
      createdAt: existing?.createdAt,
    });
    if (!created.ok) return created;

    const property = created.value.property;
    if (existing) {
      property.createdAt = existing.createdAt || property.createdAt;
      property.identity.previousValues = existing.identity?.previousValues || [];
      property.identity.history = [
        ...(existing.identity?.history || []),
        {
          event: "stage4_add_property_update",
          at: nowIso(options),
          source: BRIDGE_VERSION,
        },
      ];
    }

    const validation = validatePropertyRecord(property);
    if (!validation.ok) return validation;

    store.propertiesById[property.id] = property;
    if (!store.propertyOrder.includes(property.id)) store.propertyOrder.push(property.id);
    store.lastSelectedPropertyId = property.id;

    const serviceIntent = created.value.serviceIntent;
    if (serviceIntent) {
      store.serviceIntentsById[serviceIntent.id] = serviceIntent;
    }

    const saved = writeCanonicalStore(storage, store, options);
    if (!saved.ok) return saved;
    return resultOk({ store: saved.value, property, serviceIntent });
  }

  function labelForCheck(check) {
    const labels = {
      address_match: "Property address",
      local_authority: "Local authority",
      property_type: "Property type",
      epc: "EPC",
      heating_source: "Heating source",
    };
    return labels[check.checkType] || check.checkType;
  }

  function valueForCheck(check) {
    const value = check.value || {};
    if (check.checkType === "address_match") return value.displayAddress || "Address selected";
    if (check.checkType === "local_authority") return value.localAuthority || "Missing / unknown";
    if (check.checkType === "property_type") return value.propertyType || "Missing / unknown";
    if (check.checkType === "epc") {
      if (value.epcFound === false) return "No EPC found";
      return value.epcRating ? `EPC ${value.epcRating}` : "Missing / unknown";
    }
    if (check.checkType === "heating_source") {
      if (value.hasGas === true) return "Gas likely, confirm with landlord";
      if (value.hasGas === false) return "No gas indicated, confirm with landlord";
      return "Missing / unknown";
    }
    return typeof check.value === "string" ? check.value : "Prepared for review";
  }

  function reviewItem(check) {
    const source = check.sourceReferences?.[0] || {};
    return {
      id: check.id,
      label: labelForCheck(check),
      value: valueForCheck(check),
      status: check.resultStatus,
      sourceLabel: source.sourceLabel || "Smart Check",
      confidence: check.confidence || "unknown",
      capabilityStatus: check.capabilityStatus || "simulated",
      requiresConfirmation: Boolean(check.requiresConfirmation),
      reason: check.missingReason || check.unknownReason || source.notes || "",
    };
  }

  function prepareReviewFoundData(propertyRecord) {
    const checks = propertyRecord.smartCheckResults || [];
    const missingUnknownStatuses = new Set(["missing", "unknown"]);
    const foundAutomatically = checks
      .filter((check) => ["found", "likely"].includes(check.resultStatus))
      .map(reviewItem);
    const missingUnknown = checks
      .filter((check) => missingUnknownStatuses.has(check.resultStatus))
      .map(reviewItem);
    const alreadyVisible = new Set([
      ...foundAutomatically.map((item) => item.id),
      ...missingUnknown.map((item) => item.id),
    ]);
    const needsConfirmation = checks
      .filter((check) => check.requiresConfirmation && !alreadyVisible.has(check.id))
      .map(reviewItem);

    return {
      propertyId: propertyRecord.id,
      address: propertyRecord.identity?.displayAddress || propertyRecord.address || "",
      postcode: propertyRecord.identity?.postcode || "",
      currentSetupStage: propertyRecord.currentSetupStage,
      foundAutomatically,
      needsConfirmation,
      missingUnknown,
      nextStepLabel: "Continue to workspace setup",
      handoffHref: `dashboard-labs.html?propertyId=${encodeURIComponent(propertyRecord.id)}&from=add-property`,
      capabilityCopy: "Smart Checks use available and example information in this prototype. Review the findings before relying on them. No live supplier is contacted. No payment is taken. Guidance, not legal advice.",
    };
  }

  function setupStageLabel(stage = "") {
    const labels = {
      add_property: "Add property",
      smart_checks: "Smart Checks",
      review_found_data: "Review found data",
      answer_unknowns: "Answer unknowns",
      property_brain: "Property Brain",
      analysis: "Compliance Analysis",
      workspace: "Property workspace",
    };
    return labels[stage] || "Setup in progress";
  }

  function listCanonicalProperties(storage, namespaceId = PUBLIC_GUEST_NAMESPACE_ID, options = {}) {
    const loaded = readCanonicalStore(storage, namespaceId, options);
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    return resultOk(store.propertyOrder.map((propertyId) => store.propertiesById[propertyId]).filter(Boolean));
  }

  function smartCheckSummary(propertyRecord) {
    const checks = propertyRecord?.smartCheckResults || [];
    const found = checks.filter((check) => ["found", "likely"].includes(check.resultStatus)).length;
    const missingUnknown = checks.filter((check) => ["missing", "unknown"].includes(check.resultStatus)).length;
    const needsConfirmation = checks.filter((check) => check.requiresConfirmation).length;
    return {
      total: checks.length,
      found,
      missingUnknown,
      needsConfirmation,
      label: checks.length
        ? `${found} found, ${needsConfirmation} need confirmation, ${missingUnknown} missing / unknown`
        : "Smart Checks prepared for review",
    };
  }

  function propertyCardFromRecord(propertyRecord) {
    const summary = smartCheckSummary(propertyRecord);
    const address = propertyRecord.identity?.displayAddress || propertyRecord.address || "Property address missing";
    const postcode = propertyRecord.identity?.postcode || "";
    const setupStage = setupStageLabel(propertyRecord.currentSetupStage);
    const entryService = propertyRecord.entryContext?.entryService || "full_compliance";
    return {
      sourceKind: "canonical",
      id: propertyRecord.id,
      canonicalPropertyId: propertyRecord.id,
      address,
      postcode,
      location: [postcode].filter(Boolean).join(", "),
      setupStage,
      statusTone: propertyRecord.currentSetupStage === "workspace" ? "info" : "warning",
      statusLabel: setupStage,
      smartCheckSummary: `Smart Checks: ${summary.label}`,
      type: propertyRecord.smartCheckResults?.find((check) => check.checkType === "property_type")?.value?.propertyType || "Property type to confirm",
      epcLabel: propertyRecord.smartCheckResults?.find((check) => check.checkType === "epc")?.value?.epcRating
        ? `EPC ${propertyRecord.smartCheckResults.find((check) => check.checkType === "epc").value.epcRating}`
        : "EPC missing / unknown",
      entryService,
      updatedAt: propertyRecord.updatedAt || propertyRecord.createdAt || "",
      openHref: `dashboard-labs.html?propertyId=${encodeURIComponent(propertyRecord.id)}`,
      record: propertyRecord,
    };
  }

  function dedupeLegacyPropertyCards(canonicalCards = [], legacyProperties = []) {
    const canonicalIds = new Set(canonicalCards.map((card) => card.canonicalPropertyId || card.id).filter(Boolean));
    const canonicalAddressKeys = new Set(canonicalCards.map((card) => normalizedAddressKey(card.address, card.postcode)).filter(Boolean));
    return legacyProperties.filter((property) => {
      const canonicalId = property.canonicalPropertyId || property.identity?.canonicalPropertyId || null;
      if (canonicalId && canonicalIds.has(canonicalId)) return false;
      const addressKey = normalizedAddressKey(property.address, property.postcode);
      return !canonicalAddressKeys.has(addressKey);
    });
  }

  function legacyPropertyCardFromSnapshot(property) {
    const canonicalId = property.canonicalPropertyId || property.identity?.canonicalPropertyId || null;
    return {
      sourceKind: "legacy",
      id: property.id,
      canonicalPropertyId: canonicalId,
      address: property.address || "Legacy property",
      postcode: property.postcode || "",
      location: property.postcode || "",
      setupStage: "Legacy setup",
      statusTone: "neutral",
      statusLabel: "Legacy setup",
      smartCheckSummary: "Transitional public workspace record",
      type: property.type || "Property type to confirm",
      epcLabel: property.epc?.rating ? `EPC ${property.epc.rating}` : "No EPC rating recorded yet",
      entryService: property.originJourney?.entryService || "full_compliance",
      updatedAt: property.updatedAt || "",
      openHref: canonicalId
        ? `dashboard-labs.html?propertyId=${encodeURIComponent(canonicalId)}`
        : `add-property.html${property.postcode ? `?postcode=${encodeURIComponent(property.postcode)}` : ""}`,
      record: property,
    };
  }

  function workspaceShellFromRecord(propertyRecord) {
    const review = prepareReviewFoundData(propertyRecord);
    const summary = smartCheckSummary(propertyRecord);
    return {
      status: "valid",
      propertyId: propertyRecord.id,
      address: review.address,
      postcode: review.postcode,
      setupStatus: setupStageLabel(propertyRecord.currentSetupStage),
      updatedAt: propertyRecord.updatedAt || propertyRecord.createdAt || "",
      smartCheckSummary: summary.label,
      foundDataSummary: review.foundAutomatically.slice(0, 4),
      missingUnknownSummary: review.missingUnknown.slice(0, 4),
      needsConfirmationSummary: review.needsConfirmation.slice(0, 4),
      intro: "Workspace connected to this property. Detailed compliance analysis follows in the next setup step.",
      sourceCopy: "Example information in this prototype",
    };
  }

  function invalidWorkspaceShell(status = "missing", propertyId = "") {
    const invalid = status === "invalid";
    return {
      status: invalid ? "invalid" : "missing",
      propertyId: propertyId || null,
      title: invalid ? "Property not found" : "Choose a property from My Properties",
      body: invalid
        ? "CMP could not find that canonical property record. Return to My Properties and open a listed property."
        : "Open a property from My Properties so CMP can load the correct workspace.",
      ctaLabel: "Open My Properties",
      ctaHref: "my-properties.html",
    };
  }

  return {
    CANONICAL_STORE_VERSION,
    CANONICAL_STORE_KEY_PREFIX,
    PUBLIC_GUEST_NAMESPACE_ID,
    SCHEMA_VERSION,
    BRIDGE_VERSION,
    buildPublicStorageKey,
    readCanonicalStore,
    writeCanonicalStore,
    createEmptyStore,
    createCanonicalId,
    createSmartCheckResults,
    createPropertyRecord,
    createOrUpdatePropertyFromSelection,
    prepareReviewFoundData,
    listCanonicalProperties,
    smartCheckSummary,
    propertyCardFromRecord,
    dedupeLegacyPropertyCards,
    legacyPropertyCardFromSnapshot,
    workspaceShellFromRecord,
    invalidWorkspaceShell,
    setupStageLabel,
    normalizedAddressKey,
    normalizePostcode,
  };
});
