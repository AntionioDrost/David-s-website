(function propertyDataModule(window) {
  "use strict";

  const STORAGE_KEY = "cmpPrimePrototypeV1";
  const POSTCODES_IO_ENDPOINT = "https://api.postcodes.io/postcodes";

  const EVIDENCE_STATES = [
    "Not known",
    "Landlord says held",
    "Evidence added",
    "Needs renewal",
    "Service request drafted",
    "Service requested",
    "Monitor later"
  ];

  const RECORD_DEFINITIONS = [
    { id: "epc", type: "EPC", title: "EPC", serviceType: "Book EPC assessment", expiryOffsetYears: 4 },
    { id: "gas-safety", type: "Gas Safety", title: "Gas Safety certificate", serviceType: "Arrange Gas Safety check", expiryOffsetYears: 1 },
    { id: "eicr", type: "EICR", title: "EICR", serviceType: "Arrange EICR", expiryOffsetYears: 5 },
    { id: "smoke-alarm", type: "Smoke alarm", title: "Smoke alarm confirmation", serviceType: "Smoke/CO alarm check" },
    { id: "co-alarm", type: "CO alarm", title: "CO alarm confirmation", serviceType: "Smoke/CO alarm check" },
    { id: "licence-hmo", type: "Licence/HMO", title: "Licence/HMO review", serviceType: "Licensing/HMO review" },
    { id: "tenancy-agreement", type: "Tenancy agreement", title: "Tenancy agreement", serviceType: "Tenancy pack support" },
    { id: "deposit-protection", type: "Deposit protection", title: "Deposit protection", serviceType: "Tenancy pack support" },
    { id: "inventory-check-in", type: "Inventory/check-in", title: "Inventory/check-in", serviceType: "Property inspection" },
    { id: "inspection-records", type: "Inspection records", title: "Inspection records", serviceType: "Property inspection" },
    { id: "repair-records", type: "Repair records", title: "Repair records", serviceType: "Property inspection" },
    { id: "damp-mould-case", type: "Damp/mould case file", title: "Damp/mould case file", serviceType: "Damp/mould inspection" },
    { id: "contractor-records", type: "Contractor records", title: "Contractor records", serviceType: "Property inspection" }
  ];

  const SERVICE_OPTIONS = [
    "Arrange Gas Safety check",
    "Arrange EICR",
    "Book EPC assessment",
    "Smoke/CO alarm check",
    "Licensing/HMO review",
    "Damp/mould inspection",
    "Property inspection",
    "Tenancy pack support"
  ];

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function today() {
    return new Date();
  }

  function isoDateFromNow(days) {
    const date = today();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function isoDateYearsFromNow(years) {
    const date = today();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().slice(0, 10);
  }

  function normalisePostcode(postcode) {
    return String(postcode || "").trim().toUpperCase().replace(/\s+/g, " ");
  }

  function samplePostcodeContext(postcode) {
    const clean = normalisePostcode(postcode) || "BS1 5AH";
    return {
      postcode: clean,
      localAuthority: "Bristol City Council",
      adminCounty: "Bristol",
      region: "South West",
      country: "England",
      latitude: 51.4545,
      longitude: -2.5879,
      source: "Prototype property fallback"
    };
  }

  async function lookupPostcode(postcode, options = {}) {
    const clean = normalisePostcode(postcode);
    const timeoutMs = options.timeoutMs || 4500;

    if (!clean) {
      return {
        ok: false,
        source: "Prototype property fallback",
        error: "Enter a postcode to run Smart Checks.",
        data: samplePostcodeContext(clean)
      };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${POSTCODES_IO_ENDPOINT}/${encodeURIComponent(clean)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Postcode lookup returned ${response.status}`);
      }

      const payload = await response.json();
      if (!payload || payload.status !== 200 || !payload.result) {
        throw new Error("Postcode lookup did not return a result.");
      }

      const result = payload.result;
      return {
        ok: true,
        source: "Postcode data from live postcode lookup",
        data: {
          postcode: result.postcode || clean,
          localAuthority: result.admin_district || result.parish || "Local authority not returned",
          adminCounty: result.admin_county || result.admin_district || "Not returned",
          region: result.region || "Not returned",
          country: result.country || "Not returned",
          latitude: result.latitude,
          longitude: result.longitude,
          source: "Postcode data from live postcode lookup"
        }
      };
    } catch (error) {
      return {
        ok: false,
        source: "Prototype property fallback",
        error: error.name === "AbortError" ? "Postcode lookup timed out." : error.message,
        data: samplePostcodeContext(clean)
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function lookupEpc() {
    return {
      ok: false,
      source: "Prototype EPC data shown for review",
      data: {
        rating: "C",
        expiryDate: isoDateYearsFromNow(4),
        reviewDate: isoDateFromNow(30)
      }
    };
  }

  function makeRecord(definition, overrides = {}) {
    return {
      id: definition.id,
      type: definition.type,
      title: definition.title,
      status: "Needs landlord confirmation",
      source: "Needs landlord confirmation",
      evidenceState: "Not known",
      expiryDate: definition.expiryOffsetYears ? isoDateYearsFromNow(definition.expiryOffsetYears) : "",
      reviewDate: isoDateFromNow(30),
      linkedActionId: "",
      serviceType: definition.serviceType,
      fileName: "",
      ...overrides
    };
  }

  function createRecords(epcLookup) {
    return RECORD_DEFINITIONS.map((definition) => {
      if (definition.id !== "epc") {
        return makeRecord(definition);
      }

      return makeRecord(definition, {
        status: "Found for review",
        source: epcLookup.source,
        evidenceState: "Not known",
        expiryDate: epcLookup.data.expiryDate,
        reviewDate: epcLookup.data.reviewDate,
        rating: epcLookup.data.rating
      });
    });
  }

  function createPropertyFromLookup({ postcodeContext, epcLookup, address }) {
    const context = postcodeContext || samplePostcodeContext();
    const epc = epcLookup || {
      source: "Prototype EPC data shown for review",
      data: { rating: "C", expiryDate: isoDateYearsFromNow(4), reviewDate: isoDateFromNow(30) }
    };

    const property = {
      id: uid("property"),
      address: address || `Rental property at ${context.postcode}`,
      postcode: context.postcode,
      localAuthority: context.localAuthority,
      propertyType: "House",
      bedrooms: 2,
      occupancyStatus: "Being prepared",
      tenancyStatus: "Preparing to let",
      epc: {
        rating: epc.data.rating,
        source: epc.source,
        expiryDate: epc.data.expiryDate,
        reviewDate: epc.data.reviewDate
      },
      records: createRecords(epc),
      actions: [],
      serviceRequests: [],
      monitoringItems: [],
      readinessScore: 0,
      evidenceStrength: 0,
      nextBestAction: null,
      sourceLabels: {
        postcode: context.source,
        epc: epc.source
      },
      foundDataReviewed: false,
      questionsAnswered: false,
      serviceHelpPreference: "yes",
      createdAt: new Date().toISOString()
    };

    addMonitoringDefaults(property);
    return recalculateProperty(property);
  }

  function createSampleProperty() {
    const property = createPropertyFromLookup({
      postcodeContext: samplePostcodeContext("BS1 5AH"),
      epcLookup: {
        source: "Prototype EPC data shown for review",
        data: { rating: "C", expiryDate: isoDateYearsFromNow(4), reviewDate: isoDateFromNow(30) }
      },
      address: "18 Alder Mews, Bristol BS1 5AH"
    });

    property.occupancyStatus = "Tenanted";
    property.tenancyStatus = "Active tenancy";
    property.propertyType = "Terraced house";
    property.bedrooms = 3;
    setRecordAnswer(property, "gas-safety", "no");
    setRecordAnswer(property, "eicr", "not-known");
    setRecordAnswer(property, "smoke-alarm", "yes");
    setRecordAnswer(property, "co-alarm", "yes");
    setRecordAnswer(property, "tenancy-agreement", "yes");
    setRecordAnswer(property, "deposit-protection", "yes");
    setRecordAnswer(property, "licence-hmo", "unsure");
    setRecordAnswer(property, "damp-mould-case", "no-issue");
    property.questionsAnswered = true;
    return recalculateProperty(property);
  }

  function getRecord(property, id) {
    return property.records.find((record) => record.id === id);
  }

  function setRecordAnswer(property, recordId, answer) {
    const record = getRecord(property, recordId);
    if (!record) return;

    if (answer === "yes") {
      record.status = "Landlord confirmed";
      record.source = "Landlord confirmed";
      record.evidenceState = "Landlord says held";
      record.reviewDate = isoDateFromNow(30);
      if (!record.expiryDate && ["gas-safety", "eicr", "epc"].includes(recordId)) {
        record.expiryDate = recordId === "gas-safety" ? isoDateYearsFromNow(1) : isoDateYearsFromNow(5);
      }
      return;
    }

    if (answer === "no-issue") {
      record.status = "No current issue noted";
      record.source = "Landlord confirmed";
      record.evidenceState = "Landlord says held";
      record.reviewDate = isoDateFromNow(60);
      return;
    }

    if (answer === "monitor") {
      record.status = "Monitor later";
      record.source = "Landlord confirmed";
      record.evidenceState = "Monitor later";
      record.reviewDate = isoDateFromNow(14);
      upsertMonitoringItem(property, {
        id: `monitor-${record.id}`,
        title: `${record.title} follow-up`,
        date: isoDateFromNow(14),
        reason: "Landlord marked this as something to watch.",
        riskLevel: "Medium",
        linkedRecordId: record.id
      });
      return;
    }

    record.status = answer === "no" ? "Missing evidence" : "Needs landlord confirmation";
    record.source = "Needs landlord confirmation";
    record.evidenceState = "Not known";
    record.reviewDate = isoDateFromNow(14);
  }

  function applyQuestionAnswers(property, answers) {
    property.occupancyStatus = answers.occupancyStatus || property.occupancyStatus;
    property.tenancyStatus =
      property.occupancyStatus === "Tenanted"
        ? "Active tenancy"
        : property.occupancyStatus === "Vacant"
          ? "Vacant"
          : "Preparing to let";

    setRecordAnswer(property, "gas-safety", answers.gasSafety);
    setRecordAnswer(property, "eicr", answers.eicr);
    setRecordAnswer(property, "smoke-alarm", answers.smokeCo === "yes" ? "yes" : answers.smokeCo);
    setRecordAnswer(property, "co-alarm", answers.smokeCo === "yes" ? "yes" : answers.smokeCo);
    setRecordAnswer(property, "deposit-protection", answers.deposit);
    setRecordAnswer(property, "tenancy-agreement", answers.tenancyAgreement);
    setRecordAnswer(property, "damp-mould-case", answers.dampMould === "yes" ? "monitor" : "no-issue");
    setRecordAnswer(property, "licence-hmo", answers.licensing === "no" ? "yes" : answers.licensing);

    property.serviceHelpPreference = answers.serviceHelp || "yes";
    property.questionsAnswered = true;
    return recalculateProperty(property);
  }

  function isOccupiedOrSoon(property) {
    return property.occupancyStatus === "Tenanted" || property.occupancyStatus === "Being prepared";
  }

  function isSatisfied(record) {
    return Boolean(record && ["Evidence added", "Landlord says held"].includes(record.evidenceState));
  }

  function isServiceDrafted(record) {
    return Boolean(record && record.evidenceState === "Service request drafted");
  }

  function actionFor(property, recordId, title, reason, priority, serviceOption, evidenceNeeded) {
    const record = getRecord(property, recordId);
    const action = {
      id: `action-${recordId}`,
      priority,
      title,
      reason,
      status: isServiceDrafted(record) ? "Service request drafted" : "Open",
      evidenceNeeded,
      serviceOption,
      dueDate: priority <= 3 ? isoDateFromNow(7) : isoDateFromNow(14),
      linkedRecordId: recordId
    };
    if (record) record.linkedActionId = action.id;
    return action;
  }

  function determineNextAction(property) {
    const gas = getRecord(property, "gas-safety");
    const eicr = getRecord(property, "eicr");
    const smoke = getRecord(property, "smoke-alarm");
    const co = getRecord(property, "co-alarm");
    const epc = getRecord(property, "epc");
    const licence = getRecord(property, "licence-hmo");
    const damp = getRecord(property, "damp-mould-case");
    const agreement = getRecord(property, "tenancy-agreement");
    const deposit = getRecord(property, "deposit-protection");

    if (isOccupiedOrSoon(property) && !isSatisfied(gas)) {
      return actionFor(
        property,
        "gas-safety",
        "Resolve the Gas Safety gap",
        "The property is occupied or close to letting, and CMP does not yet have evidence for the Gas Safety record.",
        1,
        "Arrange Gas Safety check",
        "Current Gas Safety certificate or a drafted service request"
      );
    }

    if (!isSatisfied(eicr)) {
      return actionFor(
        property,
        "eicr",
        "Confirm the EICR position",
        "Electrical evidence is still missing, so this is the next record to confirm or arrange.",
        2,
        "Arrange EICR",
        "Current EICR or a drafted service request"
      );
    }

    if (!isSatisfied(smoke) || !isSatisfied(co)) {
      return actionFor(
        property,
        !isSatisfied(smoke) ? "smoke-alarm" : "co-alarm",
        "Confirm smoke and CO alarms",
        "CMP still needs the alarm position before the property file is ready for the next review.",
        3,
        "Smoke/CO alarm check",
        "Alarm test note, photo, or a drafted check request"
      );
    }

    if (!isSatisfied(epc) || epc.evidenceState === "Needs renewal") {
      return actionFor(
        property,
        "epc",
        "Add EPC evidence",
        "CMP has prototype EPC data for review, but the property file still needs evidence or landlord confirmation.",
        4,
        "Book EPC assessment",
        "EPC certificate or assessment request"
      );
    }

    if (!isSatisfied(licence)) {
      return actionFor(
        property,
        "licence-hmo",
        "Resolve licensing uncertainty",
        "The HMO or local licensing position is not confirmed for this property.",
        5,
        "Licensing/HMO review",
        "Licence evidence or review request"
      );
    }

    if (damp && damp.evidenceState === "Monitor later") {
      return actionFor(
        property,
        "damp-mould-case",
        "Monitor the damp or repair note",
        "A condition issue was marked for follow-up, so CMP has added it to monitoring.",
        6,
        "Damp/mould inspection",
        "Inspection note, repair record, or follow-up reminder"
      );
    }

    if (!isSatisfied(agreement) || !isSatisfied(deposit)) {
      return actionFor(
        property,
        !isSatisfied(agreement) ? "tenancy-agreement" : "deposit-protection",
        "Complete the tenancy pack",
        "The core tenancy records are not fully evidenced in the property file.",
        7,
        "Tenancy pack support",
        "Tenancy agreement, deposit evidence, or support request"
      );
    }

    return {
      id: "action-monitoring",
      priority: 8,
      title: "Keep monitoring dates visible",
      reason: "The main records have been confirmed or evidenced, so the next useful step is to watch renewals and follow-ups.",
      status: "Monitor later",
      evidenceNeeded: "Renewal dates and follow-up notes",
      serviceOption: "",
      dueDate: isoDateFromNow(30),
      linkedRecordId: ""
    };
  }

  function recalculateProperty(property) {
    const nextAction = determineNextAction(property);
    property.nextBestAction = nextAction;
    property.actions = [nextAction];

    const weighted = property.records.reduce((score, record) => {
      if (record.evidenceState === "Evidence added") return score + 8;
      if (record.evidenceState === "Landlord says held") return score + 5;
      if (record.evidenceState === "Service request drafted") return score + 3;
      if (record.evidenceState === "Monitor later") return score + 3;
      if (record.evidenceState === "Needs renewal") return score + 1;
      return score;
    }, 36);

    const evidencePoints = property.records.reduce((score, record) => {
      if (record.evidenceState === "Evidence added") return score + 1;
      if (record.evidenceState === "Landlord says held") return score + 0.55;
      if (record.evidenceState === "Service request drafted") return score + 0.3;
      if (record.evidenceState === "Monitor later") return score + 0.25;
      return score;
    }, 0);

    property.readinessScore = Math.max(10, Math.min(96, Math.round(weighted)));
    property.evidenceStrength = Math.max(8, Math.min(100, Math.round((evidencePoints / property.records.length) * 100)));
    return property;
  }

  function addEvidence(property, recordId, fileName) {
    const record = getRecord(property, recordId);
    if (!record) return property;

    record.status = "Evidence added";
    record.source = "Evidence added";
    record.evidenceState = "Evidence added";
    record.fileName = fileName || `${record.title}.pdf`;
    record.reviewDate = isoDateFromNow(30);

    property.actions.forEach((action) => {
      if (action.linkedRecordId === recordId) action.status = "Resolved with evidence";
    });

    upsertMonitoringItem(property, {
      id: `monitor-${record.id}`,
      title: `${record.title} review`,
      date: record.expiryDate || record.reviewDate || isoDateFromNow(30),
      reason: "Evidence was added to the property file.",
      riskLevel: record.expiryDate ? "Medium" : "Low",
      linkedRecordId: record.id
    });

    return recalculateProperty(property);
  }

  function draftServiceRequest(property, actionId) {
    const action = property.actions.find((item) => item.id === actionId) || property.nextBestAction;
    const linkedRecord = action && action.linkedRecordId ? getRecord(property, action.linkedRecordId) : null;
    const serviceType = action && action.serviceOption ? action.serviceOption : "Property inspection";
    const request = {
      id: uid("service"),
      serviceType,
      linkedRecordId: linkedRecord ? linkedRecord.id : "",
      linkedActionId: action ? action.id : "",
      status: "Service request drafted",
      noSupplierContacted: true,
      noPaymentTaken: true,
      createdAt: new Date().toISOString(),
      preview: `${serviceType} for ${property.address}. Gap: ${linkedRecord ? linkedRecord.title : "property follow-up"}. CMP has prepared a draft only.`
    };

    property.serviceRequests.unshift(request);

    if (linkedRecord) {
      linkedRecord.status = "Service request drafted";
      linkedRecord.source = "Service request drafted";
      linkedRecord.evidenceState = "Service request drafted";
    }

    if (action) action.status = "Service request drafted";

    upsertMonitoringItem(property, {
      id: `service-follow-up-${linkedRecord ? linkedRecord.id : request.id}`,
      title: `${serviceType} follow-up`,
      date: isoDateFromNow(7),
      reason: "A request draft exists. The landlord still needs to decide whether to send it.",
      riskLevel: "Medium",
      linkedRecordId: linkedRecord ? linkedRecord.id : ""
    });

    return recalculateProperty(property);
  }

  function addMonitoringDefaults(property) {
    upsertMonitoringItem(property, {
      id: "monitor-epc",
      title: "EPC review",
      date: property.epc ? property.epc.expiryDate : isoDateYearsFromNow(4),
      reason: "EPC date is shown as prototype data until evidence is added.",
      riskLevel: "Low",
      linkedRecordId: "epc"
    });
  }

  function upsertMonitoringItem(property, item) {
    const index = property.monitoringItems.findIndex((existing) => existing.id === item.id);
    if (index >= 0) property.monitoringItems[index] = item;
    else property.monitoringItems.push(item);
  }

  function loadStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { properties: [], activePropertyId: "" };
      const parsed = JSON.parse(raw);
      return {
        properties: Array.isArray(parsed.properties) ? parsed.properties : [],
        activePropertyId: parsed.activePropertyId || ""
      };
    } catch (error) {
      return { properties: [], activePropertyId: "" };
    }
  }

  function saveStore(store) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function saveProperty(property) {
    const updated = recalculateProperty(property);
    const store = loadStore();
    const index = store.properties.findIndex((item) => item.id === updated.id);
    if (index >= 0) store.properties[index] = updated;
    else store.properties.unshift(updated);
    store.activePropertyId = updated.id;
    saveStore(store);
    return updated;
  }

  function getActiveProperty() {
    const store = loadStore();
    let property = store.properties.find((item) => item.id === store.activePropertyId);
    if (!property && store.properties.length) property = store.properties[0];
    return property ? recalculateProperty(property) : null;
  }

  function ensureExampleProperty() {
    const existing = getActiveProperty();
    if (existing) return existing;
    return saveProperty(createSampleProperty());
  }

  window.CMPPrimeData = {
    STORAGE_KEY,
    EVIDENCE_STATES,
    RECORD_DEFINITIONS,
    SERVICE_OPTIONS,
    lookupPostcode,
    lookupEpc,
    createPropertyFromLookup,
    createSampleProperty,
    ensureExampleProperty,
    loadStore,
    saveStore,
    saveProperty,
    getActiveProperty,
    applyQuestionAnswers,
    addEvidence,
    draftServiceRequest,
    recalculateProperty,
    getRecord,
    normalisePostcode
  };
})(window);
