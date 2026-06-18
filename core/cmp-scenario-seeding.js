(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPScenarioSeeding = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const definitionsApi = root?.CMPScenarioDefinitions || (typeof require === "function" ? require("./cmp-scenario-definitions.js") : null);
  const bridge = root?.CMPPublicPropertyBridge || (typeof require === "function" ? require("./cmp-public-property-bridge.js") : null);

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowIso(options = {}) {
    return options.now || new Date().toISOString();
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10) || null;
  }

  function scrubUnsafePhrases(value) {
    return JSON.parse(JSON.stringify(value).replace(/EPC-derived heating/g, "heating from a missing EPC"));
  }

  function sourceReference(definition, options = {}) {
    return {
      sourceType: options.sourceType || "user_stated",
      sourceLabel: options.sourceLabel || `Simulated scenario: ${definition.label}`,
      sourceIdentifier: options.sourceIdentifier || definition.id,
      checkedDate: dateOnly(nowIso(options)),
      confidence: options.confidence || "medium",
      capabilityStatus: "simulated",
      notes: options.notes || "Prepared from a canonical demo scenario seed.",
    };
  }

  function answerFromSeed(seed, propertyId, definition, options = {}) {
    return {
      id: `${propertyId}_answer_${String(seed.questionId).replace(/[^a-z0-9_]+/gi, "_")}`,
      propertyId,
      questionId: seed.questionId,
      answer: seed.answer,
      context: seed.context || "current",
      source: "user_stated",
      answeredAt: nowIso(options),
      dependencyKeys: seed.dependencyKeys || [],
      evidenceStatus: seed.evidenceStatus || "unverified",
      editedHistory: [],
      sourceReferences: [sourceReference(definition, {
        ...options,
        sourceIdentifier: seed.questionId,
        sourceLabel: "Simulated landlord answer",
      })],
    };
  }

  function evidenceFromSeed(seed, propertyId, definition, options = {}) {
    const safeType = String(seed.evidenceType || "evidence").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
    return {
      id: `${propertyId}_evidence_${safeType}`,
      propertyId,
      linkedIssueId: seed.linkedIssueId || null,
      linkedActionId: seed.linkedActionId || null,
      linkedServiceRequestId: seed.linkedServiceRequestId || null,
      evidenceType: seed.evidenceType || "evidence",
      proofStatus: seed.proofStatus || "needs_review",
      verificationStatus: seed.verificationStatus || "needs_review",
      source: seed.source || "user_stated",
      capabilityStatus: "simulated",
      issuedDate: seed.issuedDate || dateOnly(nowIso(options)),
      expiryDate: seed.expiryDate ?? null,
      extractedFields: {
        ...(seed.extractedFields || {}),
        scenarioId: definition.id,
        simulated: true,
      },
      userConfirmationState: seed.userConfirmationState || "needs_confirmation",
      sourceReferences: [sourceReference(definition, {
        ...options,
        sourceIdentifier: safeType,
        sourceLabel: "Simulated scenario evidence",
        sourceType: seed.source || "user_stated",
      })],
    };
  }

  function serviceRequestFromSeed(seed, propertyId, definition, options = {}) {
    const serviceId = seed.serviceId || "done-for-me-compliance-review";
    return {
      id: `${propertyId}_service_${serviceId}`,
      propertyId,
      issueId: seed.issueId || null,
      actionId: seed.actionId || null,
      serviceId,
      source: "demo_scenario",
      requestMode: "simulated",
      requestStatus: seed.requestStatus || "draft",
      supplierJobPackData: {
        serviceLabel: seed.serviceLabel || serviceId,
        recommendedBecause: seed.recommendedBecause || "Recommended because this scenario has an open property gap.",
        supplierContacted: false,
        paymentTaken: false,
        liveBooking: false,
        prototypeOnly: true,
      },
      evidenceExpected: seed.evidenceExpected || [],
      verificationStatus: "unverified",
      capabilityStatus: "simulated",
      sourceReferences: [sourceReference(definition, {
        ...options,
        sourceIdentifier: serviceId,
        sourceLabel: "Simulated scenario service request",
      })],
      createdAt: nowIso(options),
      updatedAt: nowIso(options),
    };
  }

  function createPropertyRecordFromScenario(definition, options = {}) {
    if (!definitionsApi || !bridge?.createPropertyRecord) return resultFail("Scenario dependencies are unavailable.");
    const validation = definitionsApi.validateScenarioDefinition(definition);
    if (!validation.ok) return validation;
    const namespaceId = options.namespaceId || definitionsApi.DEMO_SCENARIO_NAMESPACE;
    if (namespaceId !== definitionsApi.DEMO_SCENARIO_NAMESPACE) {
      return resultFail(`Scenario namespace must be ${definitionsApi.DEMO_SCENARIO_NAMESPACE}.`);
    }
    const created = bridge.createPropertyRecord(definition.propertySeed.selection, {
      namespaceId,
      propertyId: definition.uniqueFictionalPropertyId,
      journeyContext: {
        ...(definition.propertySeed.journeyContext || {}),
        scenarioId: definition.id,
        sourceRoute: `dashboard-labs.html?demoScenario=${definition.id}&qa=1`,
      },
      now: nowIso(options),
    });
    if (!created.ok) return created;
    const property = scrubUnsafePhrases(created.value.property);
    property.namespace = namespaceId;
    property.creationSource = "demo_scenario";
    property.lifecycleStatus = "demo";
    property.currentSetupStage = "workspace";
    property.address = definition.propertySeed.selection.address;
    property.entryContext = {
      ...(property.entryContext || {}),
      ...(definition.propertySeed.journeyContext || {}),
      scenarioId: definition.id,
      sourceRoute: `dashboard-labs.html?demoScenario=${definition.id}&qa=1`,
      demoScenarioId: definition.id,
      userGoal: definition.propertySeed.userGoal,
    };
    property.demoMetadata = {
      ...(definition.propertySeed.demoMetadata || {}),
      scenarioId: definition.id,
      scenarioLabel: definition.label,
      story: definition.propertySeed.story,
      userGoal: definition.propertySeed.userGoal,
      namespaceId,
      capabilityStatus: "simulated",
      expectedRouteOutcome: definition.expectedRouteOutcome,
    };
    property.landlordAnswers = (definition.answerSeed || []).map((seed) => answerFromSeed(seed, property.id, definition, options));
    property.evidence = (definition.propertySeed.evidenceSeed || []).map((seed) => evidenceFromSeed(seed, property.id, definition, options));
    property.serviceRequests = (definition.propertySeed.serviceRequestSeed || []).map((seed) => serviceRequestFromSeed(seed, property.id, definition, options));
    property.timeline = [
      ...(property.timeline || []),
      {
        id: `${property.id}_scenario_seeded`,
        propertyId: property.id,
        eventType: "scenario_property_seeded",
        timestamp: nowIso(options),
        summary: `${definition.label} scenario seeded as a canonical demo property.`,
        visibility: "qa",
        capabilityStatus: "simulated",
      },
    ];
    property.monitoring = property.monitoring || [];
    property.reports = property.reports || [];
    property.updatedAt = nowIso(options);
    return resultOk({ propertyRecord: property, scenario: clone(definition) });
  }

  function seedScenarioProperty(store, scenarioId, options = {}) {
    if (!definitionsApi || !bridge) return resultFail("Scenario dependencies are unavailable.");
    if (!store || store.namespaceId !== definitionsApi.DEMO_SCENARIO_NAMESPACE) {
      return resultFail(`Scenario seeding requires ${definitionsApi.DEMO_SCENARIO_NAMESPACE} store.`);
    }
    const definitionResult = definitionsApi.getScenarioDefinition(scenarioId);
    if (!definitionResult.ok) return definitionResult;
    const created = createPropertyRecordFromScenario(definitionResult.value, options);
    if (!created.ok) return created;
    const nextStore = clone(store);
    const property = created.value.propertyRecord;
    nextStore.propertiesById[property.id] = property;
    if (!nextStore.propertyOrder.includes(property.id)) nextStore.propertyOrder.push(property.id);
    nextStore.lastSelectedPropertyId = property.id;
    nextStore.migrationIndex = {
      ...(nextStore.migrationIndex || {}),
      [`scenario::${scenarioId}::v1`]: {
        propertyId: property.id,
        source: "stage9_canonical_scenario",
        importedAt: nowIso(options),
      },
    };
    nextStore.updatedAt = nowIso(options);
    return resultOk({ store: nextStore, property, scenario: created.value.scenario });
  }

  function seedScenarioSet(store, scenarioIds, options = {}) {
    let nextStore = clone(store);
    const properties = [];
    const warnings = [];
    for (const scenarioId of scenarioIds || []) {
      const seeded = seedScenarioProperty(nextStore, scenarioId, options);
      if (!seeded.ok) return seeded;
      nextStore = seeded.value.store;
      properties.push(seeded.value.property);
      warnings.push(...(seeded.warnings || []));
    }
    return resultOk({ store: nextStore, properties }, warnings);
  }

  function resolveScenarioRoute(queryParams, options = {}) {
    const get = typeof queryParams?.get === "function"
      ? (key) => queryParams.get(key)
      : (key) => queryParams?.[key] || null;
    const scenarioId = get("demoScenario");
    if (!scenarioId) return resultOk({ active: false });
    if (get("qa") !== "1" && !options.allowWithoutQa) {
      return resultFail("Canonical demo scenario routes require qa=1.");
    }
    const definition = definitionsApi.getScenarioDefinition(scenarioId);
    if (!definition.ok) return definition;
    return resultOk({
      active: true,
      scenarioId,
      namespaceId: definitionsApi.DEMO_SCENARIO_NAMESPACE,
      propertyId: definition.value.uniqueFictionalPropertyId,
      route: `dashboard-labs.html?demoScenario=${scenarioId}&qa=1`,
    });
  }

  return {
    createPropertyRecordFromScenario,
    seedScenarioProperty,
    seedScenarioSet,
    resolveScenarioRoute,
  };
});
