(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPScenarioDefinitions = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEMO_SCENARIO_NAMESPACE = "demo:canonical-scenarios";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function smartCheck(checkType, resultStatus, confidence, value = null) {
    return {
      checkType,
      resultStatus,
      confidence,
      value,
      sourceReferences: [{
        sourceType: resultStatus === "missing" ? "missing" : resultStatus === "unknown" ? "unknown" : "official",
        sourceLabel: "Simulated scenario seed",
        confidence,
        capabilityStatus: "simulated",
      }],
    };
  }

  function answer(questionId, value, evidenceStatus = "unverified", context = "current") {
    return { questionId, answer: value, context, evidenceStatus };
  }

  function issue(category, status = "open", confidence = "medium") {
    return { category, status, confidence };
  }

  function service(serviceId, status = "draft") {
    return { serviceId, status };
  }

  function monitoring(monitoringType, reason) {
    return { monitoringType, reason };
  }

  function evidence(evidenceType, proofStatus = "accepted", overrides = {}) {
    return {
      evidenceType,
      proofStatus,
      verificationStatus: proofStatus === "accepted" ? "accepted" : "needs_review",
      source: overrides.source || "user_stated",
      issuedDate: overrides.issuedDate || "2026-06-01",
      expiryDate: overrides.expiryDate ?? null,
      extractedFields: overrides.extractedFields || {},
      userConfirmationState: overrides.userConfirmationState || (proofStatus === "accepted" ? "confirmed" : "needs_confirmation"),
    };
  }

  function baseSeed({
    id,
    propertyId,
    address,
    postcode,
    town,
    story,
    userGoal,
    selection,
    journeyContext = {},
    evidenceSeed = [],
    serviceRequestSeed = [],
    expectedSafeSuggestedPrompts = [],
  }) {
    return {
      story,
      userGoal,
      canonicalNamespaceType: "demo",
      selection: {
        id: `${id}-address`,
        uprn: `SIM-${propertyId.toUpperCase()}`,
        address,
        postcode,
        city: town,
        type: "Terraced house",
        bedrooms: 3,
        storeys: 2,
        hasGas: false,
        fixedCombustion: false,
        epc: {
          rating: "C",
          currentScore: 70,
          potential: "B",
          potentialScore: 82,
          issue: "2024-04-10",
          expiry: "2034-04-10",
          certificate: `${propertyId.toUpperCase()}-EPC`,
          source: "Simulated EPC preview",
        },
        ...selection,
      },
      journeyContext: {
        sourceRoute: `dashboard-labs.html?demoScenario=${id}&qa=1`,
        entryService: "full_compliance",
        focusMode: "scenario_demo",
        isTenanted: "yes",
        scenarioId: id,
        ...(journeyContext || {}),
      },
      evidenceSeed,
      serviceRequestSeed,
      expectedSafeSuggestedPrompts,
      demoMetadata: {
        scenarioId: id,
        scenarioLabel: id.replace(/-/g, " "),
        namespaceId: DEMO_SCENARIO_NAMESPACE,
        capabilityStatus: "simulated",
        stage: "stage9",
      },
    };
  }

  const SCENARIOS = [
    {
      id: "standard-first-property",
      label: "Standard first property",
      uniqueFictionalPropertyId: "prop_demo_standard_first_property",
      uniqueFictionalAddress: "12 Maple Quay, Bristol, BS1 9QA",
      propertySeed: baseSeed({
        id: "standard-first-property",
        propertyId: "prop_demo_standard_first_property",
        address: "12 Maple Quay, Bristol",
        postcode: "BS1 9QA",
        town: "Bristol",
        story: "Ordinary landlord checking a first property with strong existing evidence.",
        userGoal: "Check My Property",
        evidenceSeed: [
          evidence("gas_safety_certificate", "accepted", { expiryDate: "2027-06-01" }),
          evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }),
          evidence("alarm_record", "accepted"),
          evidence("deposit_protection", "accepted"),
        ],
      }),
      smartCheckSeed: [
        smartCheck("epc", "found", "medium", { epcFound: true, epcRating: "C" }),
        smartCheck("heating_source", "likely", "low", { hasGas: true }),
      ],
      answerSeed: [
        answer("alarm_status", "tested"),
        answer("deposit_status", "protected"),
      ],
      expectedIssues: [],
      expectedTopAction: { actionType: "review", status: "recommended", reason: "No urgent blocker from seeded evidence." },
      expectedServices: [],
      expectedMonitoring: [monitoring("annual_review", "Keep the evidence trail under review.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "no-epc-found",
      label: "No EPC found",
      uniqueFictionalPropertyId: "prop_demo_no_epc_found",
      uniqueFictionalAddress: "44 Northgate Mews, Leeds, LS2 8ZZ",
      propertySeed: baseSeed({
        id: "no-epc-found",
        propertyId: "prop_demo_no_epc_found",
        address: "44 Northgate Mews, Leeds",
        postcode: "LS2 8ZZ",
        town: "Leeds",
        story: "EPC lookup finds no record and heating remains unknown.",
        userGoal: "Full property check",
        selection: { epc: null, hasGas: undefined, fixedCombustion: null, type: "Mid-terrace house" },
        journeyContext: { isTenanted: "yes" },
        evidenceSeed: [evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted")],
        expectedSafeSuggestedPrompts: ["epc-missing", "gas-confirmation"],
      }),
      smartCheckSeed: [smartCheck("epc", "missing", "medium", { epcFound: false }), smartCheck("heating_source", "unknown", "unknown", null)],
      answerSeed: [answer("deposit_status", "protected")],
      expectedIssues: [issue("epc", "open", "medium"), issue("gas_safety", "open", "unknown")],
      expectedTopAction: { actionType: "request_service", status: "recommended", reason: "No EPC found." },
      expectedServices: [service("epc-assessment")],
      expectedMonitoring: [monitoring("evidence_gap_follow_up", "No EPC record found.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "expired-epc",
      label: "Expired EPC",
      uniqueFictionalPropertyId: "prop_demo_expired_epc",
      uniqueFictionalAddress: "7 Amber Mill Lane, Sheffield, S3 7QQ",
      propertySeed: baseSeed({
        id: "expired-epc",
        propertyId: "prop_demo_expired_epc",
        address: "7 Amber Mill Lane, Sheffield",
        postcode: "S3 7QQ",
        town: "Sheffield",
        story: "EPC exists but the expiry date is in the past.",
        userGoal: "Check energy evidence",
        selection: { epc: { rating: "D", currentScore: 60, potential: "C", potentialScore: 75, issue: "2013-05-04", expiry: "2024-05-04", certificate: "DEMO-EXPIRED-EPC", source: "Simulated EPC preview" } },
        evidenceSeed: [evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted"), evidence("deposit_protection", "accepted")],
      }),
      smartCheckSeed: [smartCheck("epc", "found", "medium", { epcFound: true, epcRating: "D", epcExpiry: "2024-05-04" })],
      answerSeed: [answer("deposit_status", "protected")],
      expectedIssues: [issue("epc", "open", "medium")],
      expectedTopAction: { actionType: "request_service", status: "recommended", reason: "Expired EPC evidence." },
      expectedServices: [service("epc-assessment")],
      expectedMonitoring: [monitoring("expiry_follow_up", "EPC expiry is in the past.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "low-epc-improvement",
      label: "Low EPC improvement",
      uniqueFictionalPropertyId: "prop_demo_low_epc_improvement",
      uniqueFictionalAddress: "19 Orchard Kiln Road, Exeter, EX4 8XP",
      propertySeed: baseSeed({
        id: "low-epc-improvement",
        propertyId: "prop_demo_low_epc_improvement",
        address: "19 Orchard Kiln Road, Exeter",
        postcode: "EX4 8XP",
        town: "Exeter",
        story: "Valid low EPC rating creates a future-readiness action.",
        userGoal: "Improve future readiness",
        selection: { epc: { rating: "E", currentScore: 48, potential: "C", potentialScore: 72, issue: "2024-03-01", expiry: "2034-03-01", certificate: "DEMO-LOW-EPC", source: "Simulated EPC preview" } },
        evidenceSeed: [evidence("gas_safety_certificate", "accepted", { expiryDate: "2027-06-01" }), evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted"), evidence("deposit_protection", "accepted")],
      }),
      smartCheckSeed: [smartCheck("epc", "found", "medium", { epcFound: true, epcRating: "E" })],
      answerSeed: [answer("deposit_status", "protected")],
      expectedIssues: [issue("future_readiness", "open", "medium")],
      expectedTopAction: { actionType: "plan_improvement", status: "recommended", reason: "Low EPC rating." },
      expectedServices: [service("epc-improvement-review")],
      expectedMonitoring: [monitoring("future_readiness_watch", "Low EPC remains visible.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "missing-gas-evidence",
      label: "Missing Gas Safety evidence",
      uniqueFictionalPropertyId: "prop_demo_missing_gas_evidence",
      uniqueFictionalAddress: "25 Beacon Yard, Manchester, M4 6QH",
      propertySeed: baseSeed({
        id: "missing-gas-evidence",
        propertyId: "prop_demo_missing_gas_evidence",
        address: "25 Beacon Yard, Manchester",
        postcode: "M4 6QH",
        town: "Manchester",
        story: "Gas appears relevant from a named simulated source but no certificate proof is held.",
        userGoal: "Close safety evidence gaps",
        selection: { hasGas: true, fixedCombustion: true, type: "Converted flat" },
        evidenceSeed: [evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted"), evidence("deposit_protection", "accepted")],
      }),
      smartCheckSeed: [smartCheck("heating_source", "likely", "low", { hasGas: true })],
      answerSeed: [answer("deposit_status", "protected")],
      expectedIssues: [issue("gas_safety", "awaiting_evidence", "low")],
      expectedTopAction: { actionType: "request_service", status: "recommended", reason: "Gas proof missing." },
      expectedServices: [service("gas-safety")],
      expectedMonitoring: [monitoring("evidence_gap_follow_up", "Gas Safety evidence gap is open.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "missing-eicr-evidence",
      label: "Missing EICR evidence",
      uniqueFictionalPropertyId: "prop_demo_missing_eicr_evidence",
      uniqueFictionalAddress: "63 Paper Mill Street, Norwich, NR2 4TT",
      propertySeed: baseSeed({
        id: "missing-eicr-evidence",
        propertyId: "prop_demo_missing_eicr_evidence",
        address: "63 Paper Mill Street, Norwich",
        postcode: "NR2 4TT",
        town: "Norwich",
        story: "Landlord says an EICR exists but proof has not been added.",
        userGoal: "Add proof before duplicate booking",
        selection: { hasGas: false, fixedCombustion: false, type: "Terraced house" },
        evidenceSeed: [evidence("alarm_record", "accepted"), evidence("deposit_protection", "accepted")],
        expectedSafeSuggestedPrompts: ["eicr-proof"],
      }),
      smartCheckSeed: [smartCheck("heating_source", "likely", "low", { hasGas: false })],
      answerSeed: [answer("eicr_status", "have_it_but_no_proof", "missing"), answer("deposit_status", "protected")],
      expectedIssues: [issue("eicr", "awaiting_evidence", "medium"), issue("evidence_confidence", "awaiting_evidence", "medium")],
      expectedTopAction: { actionType: "add_evidence", status: "recommended", reason: "EICR held without proof." },
      expectedServices: [service("eicr")],
      expectedMonitoring: [monitoring("evidence_gap_follow_up", "EICR proof is missing.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "possession-readiness",
      label: "Possession readiness",
      uniqueFictionalPropertyId: "prop_demo_possession_readiness",
      uniqueFictionalAddress: "8 Counsel Row, Nottingham, NG1 5ZX",
      propertySeed: baseSeed({
        id: "possession-readiness",
        propertyId: "prop_demo_possession_readiness",
        address: "8 Counsel Row, Nottingham",
        postcode: "NG1 5ZX",
        town: "Nottingham",
        story: "Tenancy admin evidence needs organisation before possession readiness decisions.",
        userGoal: "Possession readiness evidence review",
        selection: { hasGas: false, fixedCombustion: false, type: "Flat" },
        evidenceSeed: [evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted")],
        expectedSafeSuggestedPrompts: ["possession-readiness"],
      }),
      smartCheckSeed: [smartCheck("property_type", "likely", "medium", { propertyType: "Flat" })],
      answerSeed: [answer("tenancy_documents", "have_it_but_no_proof", "missing")],
      expectedIssues: [issue("deposit_admin", "open", "unknown"), issue("evidence_confidence", "awaiting_evidence", "medium")],
      expectedTopAction: { actionType: "answer_unknowns", status: "recommended", reason: "Admin evidence needs review." },
      expectedServices: [service("possession-readiness")],
      expectedMonitoring: [monitoring("evidence_gap_follow_up", "Admin evidence remains open.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "damp-mould-concern",
      label: "Damp and mould concern",
      uniqueFictionalPropertyId: "prop_demo_damp_mould_concern",
      uniqueFictionalAddress: "31 Harbour View Terrace, Swansea, SA1 2MN",
      propertySeed: baseSeed({
        id: "damp-mould-concern",
        propertyId: "prop_demo_damp_mould_concern",
        address: "31 Harbour View Terrace, Swansea",
        postcode: "SA1 2MN",
        town: "Swansea",
        story: "A damp/mould complaint creates condition evidence and inspection follow-up.",
        userGoal: "Record condition evidence",
        selection: { hasGas: false, fixedCombustion: false, type: "Flat" },
        evidenceSeed: [evidence("eicr_certificate", "accepted", { expiryDate: "2030-06-01" }), evidence("alarm_record", "accepted"), evidence("deposit_protection", "accepted")],
        expectedSafeSuggestedPrompts: ["condition-issue"],
      }),
      smartCheckSeed: [smartCheck("property_type", "likely", "medium", { propertyType: "Flat" })],
      answerSeed: [answer("condition_report", "tenant reported damp and mould"), answer("deposit_status", "protected")],
      expectedIssues: [issue("property_condition", "open", "medium")],
      expectedTopAction: { actionType: "check", status: "recommended", reason: "Condition concern recorded." },
      expectedServices: [service("damp-mould-support")],
      expectedMonitoring: [monitoring("condition_follow_up", "Condition concern needs follow-up.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "done-for-me-compliance",
      label: "Done-for-me compliance",
      uniqueFictionalPropertyId: "prop_demo_done_for_me_compliance",
      uniqueFictionalAddress: "5 Regent Works, Birmingham, B5 5TR",
      propertySeed: baseSeed({
        id: "done-for-me-compliance",
        propertyId: "prop_demo_done_for_me_compliance",
        address: "5 Regent Works, Birmingham",
        postcode: "B5 5TR",
        town: "Birmingham",
        story: "Landlord wants help packaging several evidence gaps into a managed review.",
        userGoal: "Done-for-me compliance support",
        selection: { hasGas: true, fixedCombustion: true, type: "Flat" },
        journeyContext: { focusMode: "done_for_me", entryService: "done_for_me_compliance_review" },
        evidenceSeed: [evidence("alarm_record", "accepted")],
      }),
      smartCheckSeed: [smartCheck("heating_source", "likely", "low", { hasGas: true })],
      answerSeed: [answer("landlord_intent", "doneForMe"), answer("tenancy_documents", "unknown", "unverified")],
      expectedIssues: [issue("gas_safety", "awaiting_evidence", "low"), issue("eicr", "awaiting_evidence", "unknown")],
      expectedTopAction: { actionType: "request_service", status: "recommended", reason: "Multiple gaps need review." },
      expectedServices: [service("done-for-me-compliance-review"), service("gas-safety")],
      expectedMonitoring: [monitoring("evidence_gap_follow_up", "Multiple evidence gaps remain open.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
    {
      id: "pre-let-readiness",
      label: "Pre-let readiness",
      uniqueFictionalPropertyId: "prop_demo_pre_let_readiness",
      uniqueFictionalAddress: "14 Lettings Green, York, YO1 7PR",
      propertySeed: baseSeed({
        id: "pre-let-readiness",
        propertyId: "prop_demo_pre_let_readiness",
        address: "14 Lettings Green, York",
        postcode: "YO1 7PR",
        town: "York",
        story: "Vacant property being prepared for letting without current-tenancy assumptions.",
        userGoal: "Pre-let readiness",
        selection: { epc: null, hasGas: undefined, fixedCombustion: null, type: "Terraced house" },
        journeyContext: { isTenanted: "no" },
        evidenceSeed: [evidence("alarm_record", "accepted")],
        expectedSafeSuggestedPrompts: ["epc-missing"],
      }),
      smartCheckSeed: [smartCheck("epc", "missing", "medium", { epcFound: false }), smartCheck("heating_source", "unknown", "unknown", null)],
      answerSeed: [answer("occupancy_status", "pre_let", "unverified", "future")],
      expectedIssues: [issue("epc", "open", "medium"), issue("gas_safety", "open", "unknown")],
      expectedTopAction: { actionType: "request_service", status: "recommended", reason: "Pre-let EPC gap." },
      expectedServices: [service("epc-assessment")],
      expectedMonitoring: [monitoring("pre_let_readiness", "Pre-let evidence gaps remain open.")],
      expectedRouteOutcome: "selected canonical property shell",
      capabilityStatus: "simulated",
    },
  ];

  function listScenarioDefinitions() {
    return resultOk(clone(SCENARIOS));
  }

  function getScenarioDefinition(scenarioId) {
    const definition = SCENARIOS.find((item) => item.id === scenarioId) || null;
    return definition ? resultOk(clone(definition)) : resultFail(`Unknown scenario: ${scenarioId}`);
  }

  function validateScenarioDefinition(definition) {
    const errors = [];
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) errors.push("ScenarioDefinition must be an object.");
    for (const key of ["id", "label", "uniqueFictionalPropertyId", "uniqueFictionalAddress", "propertySeed", "smartCheckSeed", "answerSeed", "expectedIssues", "expectedTopAction", "expectedServices", "expectedMonitoring", "expectedRouteOutcome"]) {
      if (!(key in (definition || {}))) errors.push(`ScenarioDefinition missing ${key}.`);
    }
    if (/57 The Butts/i.test(JSON.stringify(definition || {}))) errors.push("New canonical scenarios must not use 57 The Butts.");
    if (definition?.capabilityStatus !== "simulated") errors.push("Scenario capabilityStatus must be simulated.");
    if (definition?.propertySeed?.canonicalNamespaceType !== "demo") errors.push("Scenario must declare demo namespace type.");
    if (definition?.propertySeed?.demoMetadata?.scenarioId !== definition?.id) errors.push("Scenario demo metadata must include matching scenarioId.");
    if (!definition?.propertySeed?.selection?.address || !definition?.propertySeed?.selection?.postcode) errors.push("Scenario selection requires address and postcode.");
    return errors.length ? resultFail(errors) : resultOk(definition);
  }

  return {
    DEMO_SCENARIO_NAMESPACE,
    listScenarioDefinitions,
    getScenarioDefinition,
    validateScenarioDefinition,
  };
});
