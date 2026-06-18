(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPAskContext = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function scrubUnsafePhrases(value) {
    return JSON.parse(JSON.stringify(value).replace(/EPC-derived heating/g, "heating from a missing EPC"));
  }

  function titleCase(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function sourceSummary(sourceReferences = []) {
    const first = sourceReferences.find(Boolean) || {};
    return {
      sourceType: first.sourceType || "unknown",
      sourceLabel: first.sourceLabel || "Source not recorded",
      confidence: first.confidence || "unknown",
      capabilityStatus: first.capabilityStatus || "simulated",
    };
  }

  function sanitizeSmartCheck(check) {
    const copy = clone(check);
    if (copy.checkType === "epc" && (copy.resultStatus === "missing" || copy.value?.epcFound === false)) {
      copy.value = { epcFound: false };
    }
    if (copy.checkType === "heating_source" && !copy.value) {
      copy.value = null;
    }
    copy.sourceSummary = sourceSummary(copy.sourceReferences || []);
    return copy;
  }

  function factFromCheck(check) {
    const summary = sourceSummary(check.sourceReferences || []);
    const base = {
      id: check.id || `${check.checkType}_${check.resultStatus || "unknown"}`,
      checkType: check.checkType,
      label: titleCase(check.label || check.checkType),
      source: summary.sourceLabel,
      confidence: check.confidence || summary.confidence || "unknown",
      capabilityStatus: check.capabilityStatus || summary.capabilityStatus || "simulated",
    };
    if (check.checkType === "address_match") {
      return { ...base, label: "Address", value: check.value?.displayAddress || "Address selected" };
    }
    if (check.checkType === "epc" && check.value?.epcFound === false) {
      return { ...base, label: "EPC", value: "No EPC found in simulated Smart Check" };
    }
    if (check.checkType === "epc" && check.value?.epcRating) {
      return { ...base, label: "EPC", value: `EPC ${check.value.epcRating}` };
    }
    if (check.checkType === "heating_source" && !check.value) {
      return { ...base, label: "Heating source", value: "Unknown" };
    }
    if (check.checkType === "local_authority" && check.value?.localAuthority) {
      return { ...base, label: "Local authority", value: check.value.localAuthority };
    }
    if (check.checkType === "property_type" && check.value?.propertyType) {
      return { ...base, label: "Property type", value: check.value.propertyType };
    }
    return { ...base, value: check.value === null || check.value === undefined ? "Unknown" : JSON.stringify(check.value) };
  }

  function splitFacts(smartChecks = []) {
    const knownFacts = [];
    const missingFacts = [];
    const unknownFacts = [];
    smartChecks.forEach((check) => {
      const fact = factFromCheck(check);
      if (check.resultStatus === "missing" || check.missingReason || check.value?.epcFound === false) {
        missingFacts.push(fact);
        return;
      }
      if (check.resultStatus === "unknown" || check.unknownReason || check.value === null || check.value === undefined) {
        unknownFacts.push(fact);
        return;
      }
      knownFacts.push(fact);
    });
    return { knownFacts, missingFacts, unknownFacts };
  }

  function buildAskCmpContext(propertyRecord, derivedState, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord with id is required.");
    const smartChecks = (propertyRecord.smartCheckResults || []).map(sanitizeSmartCheck);
    const facts = splitFacts(smartChecks);
    const context = {
      propertyRecord: scrubUnsafePhrases(propertyRecord),
      property: {
        id: propertyRecord.id,
        namespace: propertyRecord.namespace || null,
        displayAddress: propertyRecord.identity?.displayAddress || propertyRecord.address || "Selected property",
        postcode: propertyRecord.identity?.postcode || "",
        uprn: propertyRecord.identity?.uprn || null,
        schemaVersion: propertyRecord.schemaVersion || null,
        setupStage: propertyRecord.currentSetupStage || propertyRecord.setupStage || "review_found_data",
        lifecycleStatus: propertyRecord.lifecycleStatus || "active",
      },
      currentPage: options.currentPage || null,
      generatedAt: options.now || new Date().toISOString(),
      smartChecks: scrubUnsafePhrases(smartChecks),
      landlordAnswers: clone(propertyRecord.landlordAnswers || []),
      issues: clone(derivedState?.issues || []),
      scores: clone(derivedState?.scores || {}),
      evidenceGaps: clone(derivedState?.evidenceGaps || []),
      actionItems: clone(derivedState?.actionItems || []),
      nextBestAction: clone(derivedState?.nextBestAction || null),
      serviceRequests: clone(propertyRecord.serviceRequests || []),
      evidenceItems: clone(propertyRecord.evidence || []),
      monitoringItems: clone(derivedState?.monitoringItems || []),
      sourceConfidence: {
        smartCheckCount: smartChecks.length,
        issueCount: derivedState?.issues?.length || 0,
        confidenceLevel: derivedState?.confidenceLevel || "unknown",
        ruleVersion: derivedState?.ruleVersion || null,
      },
      knownFacts: facts.knownFacts,
      missingFacts: facts.missingFacts,
      unknownFacts: facts.unknownFacts,
      simulatedItems: [
        ...smartChecks.filter((check) => check.capabilityStatus === "simulated"),
        ...(propertyRecord.evidence || []).filter((item) => item.capabilityStatus === "simulated"),
        ...(propertyRecord.serviceRequests || []).filter((item) => item.capabilityStatus === "simulated"),
      ].map((item) => ({
        id: item.id || item.checkType || item.serviceId || item.evidenceType,
        label: item.label || titleCase(item.checkType || item.serviceId || item.evidenceType || "simulated item"),
        capabilityStatus: "simulated",
      })),
      capabilityLimits: [
        "Based on current information.",
        "Guidance, not legal advice.",
        "Rules engine output explains compliance priority; Ask CMP explains and guides only.",
        "Simulated Smart Checks and report previews are prepared for review.",
        "No live supplier action, payment flow or document storage is created by Ask CMP.",
      ],
    };
    return resultOk(context);
  }

  return {
    buildAskCmpContext,
  };
});
