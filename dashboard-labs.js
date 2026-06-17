const labsDemoProperty = {
  address: "57 The Butts",
  postcode: "CV1 3BJ",
  occupancy: "Vacant property",
  journey: "General compliance check"
};

function createInitialPropertyDetails() {
  return {
    propertyType: "Terraced house",
    bedrooms: "3 bedrooms",
    occupancy: "Vacant property",
    goal: "General compliance check"
  };
}

function createInitialOptionalDetails() {
  return {
    constructionYear: "",
    heatingType: "",
    storeys: "",
    parkingAccess: "",
    managingAgent: "",
    emergencyAccess: ""
  };
}

function createInitialPropertyMemory() {
  return {
    activeRoom: "living",
    rooms: {
      kitchen: [],
      bathroom: [],
      living: [
        {
          title: "Condensation near front window",
          body: "Check whether condensation is still appearing during the next inspection. Review ventilation and any visible signs of damp.",
          status: "Review at next inspection",
          created: "Earlier this week"
        }
      ],
      bedroom1: [],
      bedroom2: [],
      bedroom3: [],
      hallway: [],
      external: []
    }
  };
}

function createInitialPropertySetup() {
  return {
    id: "the-butts",
    lifecycle: "new-property",
    identity: {
      address: "Flat 42, 57 The Butts, Coventry, CV1 3BJ",
      displayAddress: "57 The Butts",
      postcode: "CV1 3BJ",
      uprn: "DEMO-UPRN-57TB",
      localAuthority: "Coventry City Council",
      selectedAddressLocked: true,
      addressConfirmed: true,
      createdAt: "Today"
    },
    foundData: {
      epcFound: true,
      epcStatus: "preparedForReview",
      epcRating: "C",
      epcPotentialRating: "B",
      epcExpiryDate: "February 2034",
      epcFloorArea: "92 m²",
      epcPropertyType: "Flat / apartment",
      epcBuiltForm: "Purpose-built flat",
      epcMatchConfidence: "Likely match",
      postcodeMetadataFound: true,
      localAuthorityFound: true,
      localChecksStatus: "ready"
    },
    confirmations: {
      findingsConfirmed: false,
      epcAcceptedForDemoReview: false,
      propertyTypeConfirmed: false,
      bedroomsConfirmed: false,
      occupancyConfirmed: false,
      gasSafetyRelevanceConfirmed: false,
      eicrStatusConfirmed: false,
      alarmsConfirmed: false,
      tenancyDepositConfirmed: false,
      inspectionReviewed: false,
      licensingReviewed: false,
      localChecksStarted: false
    },
    landlordAnswers: {
      propertyType: "Flat / apartment",
      bedrooms: "",
      occupancy: "",
      gasAppliances: "",
      eicrAvailable: "",
      alarmStatus: "",
      tenancyDepositStatus: "",
      inspectionStatus: ""
    },
    evidence: {
      epc: {
        status: "preparedForReview",
        source: "EPC-style lookup",
        label: "EPC record prepared for review"
      },
      gasSafety: {
        status: "missing",
        source: "Landlord upload needed",
        label: "Gas Safety certificate"
      },
      eicr: {
        status: "missing",
        source: "Landlord upload needed",
        label: "Electrical Safety / EICR"
      },
      alarms: {
        status: "unknown",
        source: "Landlord answer needed",
        label: "Smoke and CO alarm status"
      },
      tenancy: {
        status: "dependsOnOccupancy",
        source: "Depends on occupancy",
        label: "Tenancy agreement"
      },
      deposit: {
        status: "dependsOnOccupancy",
        source: "Depends on occupancy",
        label: "Deposit protection"
      },
      inspection: {
        status: "missing",
        source: "Landlord upload needed",
        label: "Inspection / maintenance record"
      },
      licensing: {
        status: "readyForReview",
        source: "Postcode context",
        label: "Licensing / local checks"
      }
    },
    activity: []
  };
}

function requestedNewPropertyEpcVariant() {
  const value = new URLSearchParams(window.location.search).get("epc");
  return ["valid", "expired", "expiring", "missing"].includes(value) ? value : "";
}

function queryParams() {
  return new URLSearchParams(window.location.search);
}

function isNickDemoMode() {
  const params = queryParams();
  return params.get("demo") === "nick" || params.get("journeyDemo") === "nick";
}

function isAdvancedDemoMode() {
  const params = queryParams();
  return params.get("advanced") === "1" || params.get("debug") === "1";
}

function shouldHidePrototypeMachinery() {
  return isNickDemoMode() && !isAdvancedDemoMode();
}

function clearNickDemoStoredState() {
  if (!isNickDemoMode()) {
    return;
  }

  const storageKeys = [
    "cmp_compliance_workspaces::guest",
    "cmp_onboarding_complete",
    "cmp_public_flash",
    "cmp_public_postcode_hint"
  ];
  const storagePrefixes = [
    "cmp_journey_context::",
    "cmp_public_service_draft::"
  ];

  [window.localStorage, window.sessionStorage].forEach((storage) => {
    try {
      storageKeys.forEach((key) => storage.removeItem(key));
      Object.keys(storage)
        .filter((key) => storagePrefixes.some((prefix) => key.startsWith(prefix)))
        .forEach((key) => storage.removeItem(key));
    } catch {
      // Storage can be unavailable in private browsing or embedded previews.
    }
  });
}

function newPropertyEpcVariantCopy(variant = requestedNewPropertyEpcVariant()) {
  const variants = {
    valid: {
      epcFound: true,
      epcStatus: "validDemoMatch",
      epcRating: "C",
      epcPotentialRating: "B",
      epcExpiryDate: "February 2034",
      epcMatchConfidence: "Likely EPC record",
      label: "Likely EPC record",
      cardTitle: "Likely EPC record found",
      status: "Prepared for review",
      summary: "Demo match: EPC rating C appears current. Review before relying on it.",
      source: "Demo EPC match prepared for review"
    },
    expired: {
      epcFound: true,
      epcStatus: "expiredDemoMatch",
      epcRating: "D",
      epcPotentialRating: "C",
      epcExpiryDate: "March 2024",
      epcMatchConfidence: "Likely expired EPC record",
      label: "Expired demo match",
      cardTitle: "Likely EPC record found, but it may be expired",
      status: "May need checking",
      summary: "Demo match: EPC record appears expired. CMP would keep this open until it is checked, uploaded or booked.",
      source: "Prototype EPC expiry signal"
    },
    expiring: {
      epcFound: true,
      epcStatus: "expiringDemoMatch",
      epcRating: "C",
      epcPotentialRating: "B",
      epcExpiryDate: "December 2026",
      epcMatchConfidence: "Likely EPC record, expiry watch",
      label: "Expiring demo match",
      cardTitle: "Likely EPC record found, with expiry watch",
      status: "Expiry watch",
      summary: "Demo match: EPC appears valid but should stay on monitoring because the renewal window is approaching.",
      source: "Prototype EPC monitoring signal"
    },
    missing: {
      epcFound: false,
      epcStatus: "missingDemoMatch",
      epcRating: "Unknown",
      epcPotentialRating: "Unknown",
      epcExpiryDate: "No EPC date found",
      epcMatchConfidence: "No clear EPC record found",
      label: "No EPC demo match",
      cardTitle: "No clear EPC record found",
      status: "Needs checking",
      summary: "Demo match: CMP could not find a clear EPC signal. Book or upload evidence before relying on the property file.",
      source: "Prototype missing-record signal"
    }
  };
  return variants[variant] || variants.valid;
}

function applyNewPropertyEpcVariant(setup = newPropertySetup()) {
  const variant = requestedNewPropertyEpcVariant();
  if (!variant || setup.epcVariantApplied === variant) return setup;
  const epc = newPropertyEpcVariantCopy(variant);
  setup.epcVariantApplied = variant;
  setup.foundData = {
    ...setup.foundData,
    epcFound: epc.epcFound,
    epcStatus: epc.epcStatus,
    epcRating: epc.epcRating,
    epcPotentialRating: epc.epcPotentialRating,
    epcExpiryDate: epc.epcExpiryDate,
    epcMatchConfidence: epc.epcMatchConfidence,
    epcVariantLabel: epc.label,
    epcCardTitle: epc.cardTitle,
    epcVariantStatus: epc.status,
    epcVariantSummary: epc.summary,
    epcVariantSource: epc.source
  };
  setup.evidence.epc = {
    ...setup.evidence.epc,
    status: variant === "missing" ? "missing" : "preparedForReview",
    source: epc.source,
    label: epc.cardTitle
  };
  return setup;
}

const journeyStages = [
  { id: "start", label: "Start" },
  { id: "addProperty", label: "Add property" },
  { id: "autoChecks", label: "Smart Search" },
  { id: "confirmProperty", label: "Review data", fullLabel: "Review found data" },
  { id: "unknowns", label: "Unknowns", fullLabel: "Confirm unknowns" },
  { id: "brain", label: "Workspace", fullLabel: "Evidence-led workspace" },
  { id: "actionPlan", label: "Action Plan", fullLabel: "Action Plan" },
  { id: "action", label: "Actions", fullLabel: "Upload / Book / Ask / Defer" },
  { id: "vault", label: "Evidence", fullLabel: "Evidence Vault" },
  { id: "monitor", label: "Monitoring", fullLabel: "Monitoring" }
];

const journeyAutoCheckSteps = [
  "Checking address and UPRN",
  "Searching EPC register",
  "Finding local authority",
  "Checking possible licensing area",
  "Reading property clues",
  "Preparing property intelligence"
];

const journeyBrainSteps = [
  "Combining API results",
  "Reviewing landlord answers",
  "Calculating compliance scores",
  "Finding missing evidence",
  "Building action plan",
  "Preparing service routes",
  "Setting up monitoring"
];

const journeyRoutes = {
  prioritised: {
    label: "Prioritised",
    helper: "CMP chooses: urgent blockers, missing evidence, expiring items, future risks, then optional improvements."
  },
  legalMinimum: {
    label: "Legal Minimum",
    helper: "Required compliance actions and urgent blockers only."
  },
  riskProtected: {
    label: "Risk-Protected",
    helper: "Adds evidence gaps, inspection records, deposit risk and possession readiness."
  },
  futureProof: {
    label: "Future-Proof",
    helper: "Adds EPC C roadmap, Decent Homes readiness and monitoring."
  },
  doneForMe: {
    label: "Done-For-Me",
    helper: "Starts a service basket and uses concierge-style next steps."
  }
};

const journeyDemoScenarios = {
  "clean-property-match": {
    label: "Clean property match",
    branch: "clean",
    epcRating: "C",
    epcScore: 72,
    epcPotentialRating: "B",
    epcPotentialScore: 84,
    epcFound: true,
    epcRecordStatus: "Clear match",
    propertyType: "Flat / apartment",
    propertyTypeConfidence: "High",
    localAuthority: "Coventry City Council",
    licensingRisk: "Possible selective licensing watch",
    hmoRiskFlag: false,
    flatBlockCommonPartsFlag: true,
    conversionRiskFlag: false,
    dataConfidence: "High"
  },
  "multiple-epc-address-matches": {
    label: "Multiple EPC/address matches",
    branch: "multiple",
    epcRating: "D",
    epcScore: 61,
    epcPotentialRating: "C",
    epcPotentialScore: 76,
    epcFound: true,
    epcRecordStatus: "Multiple possible matches",
    propertyType: "Converted flat",
    propertyTypeConfidence: "Medium",
    licensingRisk: "Address confidence needs review",
    conversionRiskFlag: true,
    dataConfidence: "Medium"
  },
  "no-epc-found": {
    label: "No EPC found",
    branch: "noEpc",
    epcRating: "Unknown",
    epcScore: 0,
    epcPotentialRating: "Unknown",
    epcPotentialScore: 0,
    epcFound: false,
    epcRecordStatus: "No clear EPC record found",
    propertyType: "Unknown",
    propertyTypeConfidence: "Low",
    licensingRisk: "Unknown until address evidence improves",
    dataConfidence: "Low"
  },
  "epc-e-future-risk": {
    label: "EPC E future-risk",
    branch: "clean",
    epcRating: "E",
    epcScore: 48,
    epcPotentialRating: "C",
    epcPotentialScore: 72,
    epcFound: true,
    epcRecordStatus: "Clear match",
    propertyType: "Terraced house",
    propertyTypeConfidence: "High",
    licensingRisk: "No obvious licensing signal",
    futureRisk: "EPC future-risk"
  },
  "epc-fg-urgent-mees-risk": {
    label: "EPC F/G urgent MEES risk",
    branch: "clean",
    epcRating: "F",
    epcScore: 34,
    epcPotentialRating: "D",
    epcPotentialScore: 62,
    epcFound: true,
    epcRecordStatus: "Clear match",
    propertyType: "Mid-terrace house",
    propertyTypeConfidence: "High",
    licensingRisk: "No obvious licensing signal",
    urgentMees: true
  },
  "epc-expired-mees-risk": {
    label: "EPC expired / MEES risk",
    branch: "clean",
    epcRating: "E",
    epcScore: 48,
    epcPotentialRating: "C",
    epcPotentialScore: 72,
    epcFound: true,
    epcExpired: true,
    epcExpiry: "Expired 04 May 2024",
    epcRecordStatus: "Likely EPC record found, but it may be expired and needs checking",
    propertyType: "Terraced house",
    propertyTypeConfidence: "High",
    licensingRisk: "No obvious licensing signal",
    futureRisk: "EPC / MEES review needed"
  },
  "occupied-normal-single-household": {
    label: "Occupied normal single household",
    branch: "clean",
    occupancyStatus: "Occupied",
    occupantCount: "1-2 people",
    householdCount: "One household",
    depositTaken: true,
    epcRating: "C",
    epcScore: 70
  },
  "vacant-pre-let-property": {
    label: "Vacant/pre-let property",
    branch: "clean",
    occupancyStatus: "Vacant / preparing to rent",
    landlordIntent: "Legal minimum",
    epcRating: "D",
    epcScore: 61
  },
  "currently-advertised-property": {
    label: "Currently advertised property",
    branch: "noEpc",
    occupancyStatus: "Being advertised",
    epcFound: false,
    epcRating: "Unknown",
    epcScore: 0
  },
  "flat-block-common-parts": {
    label: "Flat/block/common parts",
    branch: "clean",
    propertyType: "Flat / apartment",
    flatBlockCommonPartsFlag: true,
    propertyTypeConfidence: "High",
    licensingRisk: "Block/common-parts evidence useful"
  },
  "hmo-high-occupancy-risk": {
    label: "HMO/high-occupancy risk",
    branch: "clean",
    propertyType: "Room in shared house",
    hmoRiskFlag: true,
    occupantCount: "5+ people",
    householdCount: "Multiple households",
    possibleLicensingRisk: "High HMO/licensing risk"
  },
  "converted-multiple-unit-property": {
    label: "Converted/multiple-unit property",
    branch: "multiple",
    propertyType: "Converted property / multiple units",
    conversionRiskFlag: true,
    propertyTypeConfidence: "Medium",
    licensingRisk: "Planning/building control review useful"
  },
  "gas-unknown": {
    label: "Gas unknown",
    branch: "clean",
    mainHeating: "Gas boiler",
    gasStatus: "Unknown"
  },
  "eicr-missing": {
    label: "EICR missing",
    branch: "clean",
    eicrMissing: true
  },
  "deposit-evidence-missing": {
    label: "Deposit evidence missing",
    branch: "clean",
    occupancyStatus: "Occupied",
    depositTaken: true,
    depositStatus: "Evidence missing"
  },
  "damp-mould-complaint": {
    label: "Damp/mould complaint",
    branch: "clean",
    repairComplaintStatus: "Damp/mould complaint",
    conditionIssue: "Damp/mould"
  },
  "council-enforcement-contact": {
    label: "Council/enforcement contact",
    branch: "clean",
    councilContactStatus: "Council contacted landlord",
    conditionIssue: "Council contacted me"
  },
  "done-for-me-landlord": {
    label: "Done-for-me landlord",
    branch: "clean",
    landlordIntent: "Done-for-me",
    preferredRoute: "doneForMe"
  },
  "portfolio-landlord-preview": {
    label: "Portfolio landlord preview",
    branch: "clean",
    landlordIntent: "Reduce risk",
    portfolioPreview: true,
    preferredRoute: "riskProtected"
  }
};

const journeyUnknownQuestions = [
  {
    id: "occupancy",
    title: "Is anyone living at the property?",
    why: "APIs can see records, but they cannot reliably know the current tenancy status.",
    options: [
      { id: "occupied", label: "Yes, currently occupied", effect: "Active Tenancy route added" },
      { id: "vacant", label: "No, currently vacant", effect: "Pre-let/void route added" },
      { id: "advertised", label: "It is being advertised", effect: "Urgent pre-let blockers added" },
      { id: "unknown", label: "I don't know", effect: "Full Compliance Audit route added" }
    ]
  },
  {
    id: "propertyType",
    title: "What type of property is it?",
    why: "Property type changes fire, licensing, leasehold and common-parts checks.",
    options: [
      { id: "house", label: "Whole house", effect: "Standard PRS route added" },
      { id: "flat", label: "Flat", effect: "Flat/block route added" },
      { id: "room", label: "Room in shared house", effect: "Possible HMO route added" },
      { id: "converted", label: "Converted property / multiple units", effect: "Conversion review route added" },
      { id: "unknown", label: "I don't know", effect: "Property classification review added" }
    ]
  },
  {
    id: "occupants",
    title: "How many people live there?",
    why: "Occupant count can change HMO, licensing and management-standard risk.",
    options: [
      { id: "oneTwo", label: "1-2 people, one household", effect: "Standard occupancy route kept" },
      { id: "threeFour", label: "3-4 unrelated people", effect: "Possible HMO/licensing check added" },
      { id: "fivePlus", label: "5+ people", effect: "High HMO risk route added" },
      { id: "unknown", label: "I don't know", effect: "Occupancy confidence marked low" }
    ]
  },
  {
    id: "gas",
    title: "The EPC suggests this property may have gas heating. Is there currently gas at the property?",
    why: "Gas Safety duties depend on gas appliances, not just the address.",
    options: [
      { id: "yes", label: "Yes, gas boiler/appliances", effect: "Gas Safety route added" },
      { id: "no", label: "No, all electric", effect: "Gas Safety certificate route removed" },
      { id: "unknown", label: "I don't know", effect: "Confirm gas appliances action added" }
    ]
  },
  {
    id: "eicr",
    title: "Do you have a valid EICR?",
    why: "CMP needs evidence, not just a memory that the check happened.",
    options: [
      { id: "upload", label: "Yes, upload it", effect: "EICR evidence route opened" },
      { id: "noProof", label: "Yes, but I don't have proof", effect: "EICR evidence gap added" },
      { id: "expired", label: "No / expired", effect: "Book EICR action added" },
      { id: "unknown", label: "I don't know", effect: "Book EICR action added" }
    ]
  },
  {
    id: "alarms",
    title: "Are smoke and CO alarms installed and working?",
    why: "Alarm status often lives in landlord notes, not public data.",
    options: [
      { id: "tested", label: "Yes, tested", effect: "Alarm evidence improved" },
      { id: "noProof", label: "Yes, but no proof", effect: "Alarm evidence gap added" },
      { id: "no", label: "No", effect: "Smoke/CO Alarm Check added" },
      { id: "faulty", label: "Tenant reported faulty alarm", effect: "Urgent alarm repair route added" },
      { id: "unknown", label: "I don't know", effect: "Smoke/CO Alarm Check added" }
    ]
  },
  {
    id: "deposit",
    title: "Was a tenancy deposit taken?",
    why: "Deposit risk depends on what happened with this tenancy.",
    options: [
      { id: "none", label: "No deposit", effect: "Deposit route removed" },
      { id: "protected", label: "Yes, protected with proof", effect: "Deposit evidence improved" },
      { id: "noProof", label: "Yes, but no proof", effect: "Deposit evidence gap added" },
      { id: "notProtected", label: "No / not protected", effect: "Deposit compliance review added" },
      { id: "unknown", label: "I don't know", effect: "Deposit compliance review added" }
    ]
  },
  {
    id: "tenancyDocs",
    title: "Were the required tenancy documents/information given?",
    why: "Documents served to tenants are not available through property records.",
    options: [
      { id: "upload", label: "Yes, upload proof", effect: "Tenancy evidence vault route opened" },
      { id: "noProof", label: "Yes, but no proof", effect: "Tenancy evidence gap added" },
      { id: "no", label: "No", effect: "Tenancy Document Review added" },
      { id: "unknown", label: "I'm not sure", effect: "Tenancy Document Review added" }
    ]
  },
  {
    id: "condition",
    title: "Are there any known problems with the property?",
    why: "Condition risks need landlord or tenant context before CMP can rank urgency.",
    options: [
      { id: "none", label: "None", effect: "Routine inspection kept optional" },
      { id: "dampMould", label: "Damp/mould", effect: "Damp/mould risk route added" },
      { id: "coldRooms", label: "Cold rooms", effect: "Heating/insulation review added" },
      { id: "heatingHotWater", label: "Heating/hot water problem", effect: "Urgent repair evidence route added" },
      { id: "leak", label: "Leak/roof/gutter issue", effect: "Repair evidence pack added" },
      { id: "pests", label: "Pests", effect: "Property condition inspection added" },
      { id: "windowsDoors", label: "Broken windows/doors", effect: "Security/repair action added" },
      { id: "electrical", label: "Electrical issue", effect: "Electrical repair review added" },
      { id: "gasHeating", label: "Gas/heating issue", effect: "Gas/heating safety route added" },
      { id: "tenantComplaint", label: "Tenant complaint", effect: "Repair evidence pack added" },
      { id: "councilContact", label: "Council contacted me", effect: "Enforcement risk route added" },
      { id: "unknown", label: "Not sure", effect: "Property Condition Inspection added" }
    ]
  },
  {
    id: "intent",
    title: "What do you want CMP to help you do?",
    why: "CMP can show the same facts as a minimum plan, risk plan, future plan or done-for-me basket.",
    options: [
      { id: "minimum", label: "I just want the legal minimum", effect: "Legal Minimum Plan built" },
      { id: "risk", label: "I want to reduce risk", effect: "Risk-Protected Plan built" },
      { id: "future", label: "I want to future-proof the property", effect: "Future-Proof Plan built" },
      { id: "doneForMe", label: "I want someone to handle it for me", effect: "Done-for-me service basket started" },
      { id: "unknown", label: "I don't know", effect: "Prioritised Action Plan built" }
    ]
  }
];

const journeyServiceCatalog = [
  {
    id: "gas-safety-certificate",
    title: "Gas Safety Certificate",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Gas Safety",
    linkedActionIds: ["gas-safety", "gas-service"],
    routeTypes: ["prioritised", "legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["legal essentials", "urgent only", "done for me"],
    whatItFixes: "Confirms gas appliances and creates renewal evidence.",
    why: "Gas is unknown or unproven, so CMP keeps it as a core legal blocker until evidence exists.",
    questions: [
      "Which gas appliances are present?",
      "Where is the boiler?",
      "Any known defects?",
      "Is tenant access confirmed?",
      "Preferred dates?",
      "Parking/access notes?",
      "Boiler service at the same time?",
      "CO alarms checked/installed?"
    ]
  },
  {
    id: "eicr",
    title: "EICR",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Electrical Safety",
    linkedActionIds: ["eicr", "book-eicr"],
    routeTypes: ["prioritised", "legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["legal essentials", "urgent only", "done for me"],
    whatItFixes: "Turns missing Electrical Safety evidence into a booked or uploaded route.",
    why: "CMP has weak or missing EICR evidence for this property.",
    questions: [
      "Is the property occupied?",
      "Where is the consumer unit?",
      "Any known faults, tripping, burning smells or broken sockets?",
      "Is there an old EICR?",
      "Are landlord appliances supplied?",
      "Smoke alarms checked too?",
      "Preferred dates/access notes?"
    ]
  },
  {
    id: "smoke-co-alarm-check",
    title: "Smoke/CO Alarm Check",
    category: "Urgent",
    urgency: "Medium",
    linkedComplianceArea: "Smoke and CO",
    linkedActionIds: ["alarms"],
    routeTypes: ["prioritised", "legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["legal essentials", "urgent only"],
    whatItFixes: "Confirms alarm presence, test evidence and any replacement need.",
    why: "Alarm status is unconfirmed or needs supporting evidence.",
    questions: ["How many storeys?", "Known alarm locations?", "Any tenant-reported faults?", "Preferred access dates?"]
  },
  {
    id: "licensing-check",
    title: "Licensing Check",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Licensing",
    linkedActionIds: ["hmo-licensing", "licence-renewal"],
    routeTypes: ["prioritised", "legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["legal essentials", "hmo", "risk protected"],
    whatItFixes: "Checks HMO/selective/additional licensing risk before the landlord treats the file as clear.",
    why: "Property type, occupancy or local rules suggest licensing needs checking.",
    questions: [
      "How many people live there?",
      "How many households?",
      "Do they share kitchen/bathroom/toilet?",
      "Are rooms individually let?",
      "Do you have a floorplan?",
      "Do you know room sizes?",
      "Any council letters?",
      "Any previous licence?"
    ]
  },
  {
    id: "deposit-compliance-review",
    title: "Deposit Compliance Review",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Deposit",
    linkedActionIds: ["deposit-review", "prescribed-info"],
    routeTypes: ["prioritised", "legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["legal essentials", "risk protected"],
    whatItFixes: "Reviews deposit protection, prescribed information and evidence weakness.",
    why: "Deposit evidence is missing, weak or unknown.",
    questions: [
      "Was a deposit taken?",
      "How much was taken?",
      "Which scheme was used, if known?",
      "Was it protected within 30 days?",
      "Was prescribed information served?",
      "Any possession/dispute issue?",
      "Documents to upload?"
    ]
  },
  {
    id: "tenancy-document-pack",
    title: "Tenancy Document Pack",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Tenancy documents",
    linkedActionIds: ["tenancy-docs"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["risk protected", "void/re-let"],
    whatItFixes: "Creates a cleaner written terms and serving-evidence route.",
    why: "Tenancy documents are missing or not yet evidenced.",
    questions: ["Tenancy status?", "Existing agreement?", "Start date?", "Tenant names?", "Any special clauses?"]
  },
  {
    id: "right-to-rent-review",
    title: "Right to Rent Evidence Review",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Right to Rent",
    linkedActionIds: ["right-to-rent"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["risk protected"],
    whatItFixes: "Builds a clearer evidence trail for identity and tenancy file checks.",
    why: "Right to Rent evidence is currently unknown.",
    questions: ["How many occupants?", "Any evidence already held?", "Any repeat checks needed?"]
  },
  {
    id: "condition-inspection",
    title: "Property Condition Inspection",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Condition",
    linkedActionIds: ["condition-inspection", "inventory"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["risk protected", "void/re-let"],
    whatItFixes: "Creates inspection evidence and a prioritised repair record.",
    why: "Condition evidence is missing or a complaint needs a record.",
    questions: ["Occupied or vacant?", "Known issues?", "Photos available?", "Preferred access dates?", "Any tenant vulnerability context?"]
  },
  {
    id: "damp-mould-survey",
    title: "Damp/Mould Survey",
    category: "Recommended",
    urgency: "High",
    linkedComplianceArea: "Condition",
    linkedActionIds: ["damp-survey", "enforcement-response"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["risk protected", "condition"],
    whatItFixes: "Turns a damp/mould report into survey, photos and repair evidence.",
    why: "Damp/mould or council contact is present in this scenario.",
    questions: [
      "Which rooms are affected?",
      "How long has it been happening?",
      "Has the tenant complained in writing?",
      "Can you upload photos?",
      "Is heating working?",
      "Are extractor fans working?",
      "Is there a leak or water stain?",
      "Any occupants who may be more vulnerable to damp/cold issues? Optional."
    ]
  },
  {
    id: "inventory-check-in",
    title: "Inventory / Check-In Report",
    category: "Recommended",
    urgency: "Low",
    linkedComplianceArea: "Evidence",
    linkedActionIds: ["inventory"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["risk protected", "void/re-let"],
    whatItFixes: "Improves possession, damage and repair evidence readiness.",
    why: "CMP can see the inventory/check-in evidence is absent.",
    questions: ["Move-in date?", "Furnished or unfurnished?", "Meter readings needed?", "Photo schedule needed?"]
  },
  {
    id: "epc-improvement-plan",
    title: "EPC Improvement Plan",
    category: "Future-proof",
    urgency: "Medium",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["epc-e-roadmap", "mees-review", "improvement-0"],
    routeTypes: ["prioritised", "futureProof", "doneForMe"],
    bundleTags: ["future proof", "energy"],
    whatItFixes: "Creates a route from current EPC status towards a stronger rating.",
    why: "The EPC profile creates future-readiness or MEES risk.",
    questions: [
      "New EPC or improvement advice before reassessment?",
      "Cheapest compliant route or best long-term route?",
      "Consider insulation?",
      "Consider heating controls?",
      "Consider solar/battery?",
      "Leasehold?",
      "External changes restricted?",
      "Budget range?"
    ]
  },
  {
    id: "annual-monitoring",
    title: "Annual Compliance Monitoring",
    category: "Future-proof",
    urgency: "Low",
    linkedComplianceArea: "Monitoring",
    linkedActionIds: ["annual-monitoring", "prs-database"],
    routeTypes: ["prioritised", "futureProof", "doneForMe"],
    bundleTags: ["monitoring", "future proof"],
    whatItFixes: "Keeps expiry dates, law-change watch and annual review visible.",
    why: "Monitoring prevents evidence and renewal gaps disappearing after setup.",
    questions: ["Preferred review month?", "Email reminders?", "Portfolio summary?", "Include future EPC C watch?"]
  },
  {
    id: "relet-readiness-pack",
    title: "Re-let Readiness Pack",
    category: "Void / Re-let",
    urgency: "Medium",
    linkedComplianceArea: "Void / Re-let",
    linkedActionIds: ["book-epc", "inventory", "condition-inspection"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["void/re-let"],
    whatItFixes: "Groups clean, clearance, locks, inspection and evidence before marketing.",
    why: "Vacant or pre-let properties need practical readiness as well as certificates.",
    questions: ["Target marketing date?", "Cleaning needed?", "Lock change needed?", "Clearance needed?", "Inventory needed?"]
  },
  {
    id: "epc-assessment",
    title: "EPC Assessment",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["epc-urgent", "book-epc", "epc-expiry"],
    routeTypes: ["prioritised", "legalMinimum", "futureProof", "doneForMe"],
    bundleTags: ["legal essentials", "urgent only", "energy"],
    whatItFixes: "Books a fresh EPC assessment or replaces a missing/expired EPC route.",
    why: "CMP cannot rely on the EPC profile until a current certificate exists.",
    questions: ["Preferred assessor access?", "Is the property occupied?", "Any loft access?", "Any recent insulation/heating upgrades?", "Preferred dates?"]
  },
  {
    id: "prescribed-info-evidence",
    title: "Prescribed Information Evidence",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Deposit",
    linkedActionIds: ["prescribed-info", "deposit-review"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["evidence recovery", "risk protected"],
    whatItFixes: "Creates a recoverable evidence trail for prescribed information and deposit documents.",
    why: "Deposit evidence is weak until the served information is recorded.",
    questions: ["Which scheme was used?", "Date served, if known?", "Tenant names?", "Any email/post evidence?", "Any dispute or possession concern?"]
  },
  {
    id: "evidence-pack-review",
    title: "Evidence Pack Review",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Evidence",
    linkedActionIds: ["right-to-rent", "tenancy-docs", "inventory"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["evidence recovery", "risk protected"],
    whatItFixes: "Reviews the file and turns weak proof into a clear evidence recovery list.",
    why: "CMP can see several pieces of evidence are missing or low confidence.",
    questions: ["Which documents do you already have?", "Any tenant communications?", "Any certificates booked elsewhere?", "Preferred review priority?"]
  },
  {
    id: "pest-control",
    title: "Pest Control",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Condition",
    linkedActionIds: ["pest-condition-risk", "condition-inspection"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["condition", "risk protected"],
    whatItFixes: "Creates a treatment route and evidence trail for pest or habitability concerns.",
    why: "A pest issue should become an inspection/treatment record, not a loose note.",
    questions: ["Which rooms are affected?", "How long has this been happening?", "Photos available?", "Tenant access confirmed?", "Any previous treatment?"]
  },
  {
    id: "heating-hot-water-repair",
    title: "Heating/Hot Water Repair",
    category: "Recommended",
    urgency: "High",
    linkedComplianceArea: "Condition",
    linkedActionIds: ["damp-condition-risk", "condition-inspection", "gas-service"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["condition", "risk protected", "urgent only"],
    whatItFixes: "Routes heating or hot-water issues into repair evidence and tenant follow-up.",
    why: "Heating, hot water and damp risks can escalate quickly without proof of response.",
    questions: ["What is not working?", "Since when?", "Any vulnerable occupants? Optional.", "Is heating currently safe?", "Preferred repair access?"]
  },
  {
    id: "roof-gutter-inspection",
    title: "Roof/Gutter Inspection",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Condition",
    linkedActionIds: ["damp-condition-risk", "condition-inspection"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["condition", "risk protected"],
    whatItFixes: "Checks roof, gutter or leak routes and creates condition evidence.",
    why: "Leak clues should connect to a survey and repair chronology.",
    questions: ["Where is water entering?", "Any ceiling stains?", "Photos available?", "Recent storms or gutter overflow?", "Access notes?"]
  },
  {
    id: "fire-risk-assessment",
    title: "Fire Risk Assessment",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Licensing",
    linkedActionIds: ["hmo-licensing", "hmo-bundle", "alarms"],
    routeTypes: ["prioritised", "riskProtected", "doneForMe"],
    bundleTags: ["hmo", "legal essentials", "risk protected"],
    whatItFixes: "Adds fire-safety review for HMO, flat/common-parts or high-occupancy routes.",
    why: "Possible HMO or shared-use risk needs fire-safety evidence before being treated as low risk.",
    questions: ["How many storeys?", "Any shared escape route?", "Fire doors present?", "Alarm system type?", "Floorplan available?"]
  },
  {
    id: "room-measurement",
    title: "Room Measurement",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Licensing",
    linkedActionIds: ["hmo-licensing", "hmo-bundle"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["hmo", "evidence recovery"],
    whatItFixes: "Checks room-size evidence for HMO/licensing readiness.",
    why: "Room measurements may be needed before a licensing route feels supplier-ready.",
    questions: ["How many lettable rooms?", "Any floorplan?", "Access to each room?", "Are rooms individually let?"]
  },
  {
    id: "hmo-licence-application",
    title: "Licensing Application Support",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "Licensing",
    linkedActionIds: ["hmo-licensing", "hmo-bundle"],
    routeTypes: ["legalMinimum", "riskProtected", "doneForMe"],
    bundleTags: ["hmo", "legal essentials", "done for me"],
    whatItFixes: "Packages occupancy, room, fire and council evidence for a licensing route.",
    why: "If licensing applies, CMP should turn the risk into a prepared application workflow.",
    questions: ["Which council?", "Any previous licence?", "Manager details?", "Floorplan?", "Certificates available?", "Room sizes known?"]
  },
  {
    id: "epc-c-roadmap",
    title: "EPC C Roadmap",
    category: "Future-proof",
    urgency: "Medium",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["epc-e-roadmap", "decent-homes", "improvement-0"],
    routeTypes: ["futureProof", "doneForMe"],
    bundleTags: ["future proof", "energy"],
    whatItFixes: "Turns EPC future-risk into a staged improvement plan.",
    why: "A roadmap helps avoid last-minute energy compliance and upgrade decisions.",
    questions: ["Cheapest route or long-term value?", "Budget range?", "Leasehold restrictions?", "Any grants to consider?", "Tenant disruption limits?"]
  },
  {
    id: "loft-insulation-quote",
    title: "Loft Insulation Quote",
    category: "Future-proof",
    urgency: "Low",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["improvement-0", "epc-e-roadmap"],
    routeTypes: ["futureProof", "doneForMe"],
    bundleTags: ["future proof", "energy"],
    whatItFixes: "Explores a low-cost/high-impact EPC improvement.",
    why: "CMP found insulation as a likely improvement opportunity.",
    questions: ["Loft access?", "Current insulation depth?", "Any boarding?", "Tenant access?", "Budget range?"]
  },
  {
    id: "heating-controls-trvs",
    title: "Heating Controls / TRVs",
    category: "Future-proof",
    urgency: "Low",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["improvement-1", "epc-e-roadmap"],
    routeTypes: ["futureProof", "doneForMe"],
    bundleTags: ["future proof", "energy"],
    whatItFixes: "Creates an upgrade quote route for controls and radiator valves.",
    why: "Heating controls can improve comfort, evidence and future-readiness.",
    questions: ["Current heating system?", "TRVs already fitted?", "Smart thermostat interest?", "Preferred access dates?"]
  },
  {
    id: "solar-pv-feasibility",
    title: "Solar PV Feasibility",
    category: "Future-proof",
    urgency: "Low",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["epc-e-roadmap", "decent-homes"],
    routeTypes: ["futureProof", "doneForMe"],
    bundleTags: ["future proof", "energy"],
    whatItFixes: "Adds an optional long-term energy feasibility route.",
    why: "Future-proof planning can include high-impact upgrades once urgent blockers are controlled.",
    questions: ["Roof orientation known?", "Leasehold restrictions?", "Battery interest?", "Budget range?", "Tenant disruption limits?"]
  },
  {
    id: "mees-exemption-review",
    title: "MEES Exemption Review",
    category: "Urgent",
    urgency: "High",
    linkedComplianceArea: "EPC",
    linkedActionIds: ["mees-review", "epc-urgent"],
    routeTypes: ["legalMinimum", "futureProof", "doneForMe"],
    bundleTags: ["legal essentials", "energy", "urgent only"],
    whatItFixes: "Reviews urgent EPC F/G improvement or exemption evidence routes.",
    why: "EPC F/G needs a clear improvement or exemption path before the risk is treated as handled.",
    questions: ["Current EPC rating?", "Improvements already attempted?", "Quotes obtained?", "Exemption reason?", "Tenancy status?"]
  },
  {
    id: "end-tenancy-clean",
    title: "End-of-Tenancy Clean",
    category: "Void / Re-let",
    urgency: "Low",
    linkedComplianceArea: "Void / Re-let",
    linkedActionIds: ["condition-inspection", "inventory"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["void/re-let"],
    whatItFixes: "Adds practical re-let readiness to the compliance route.",
    why: "Void/re-let work should sit alongside certificates and evidence.",
    questions: ["Target date?", "Furnished?", "Appliances included?", "Key collection?", "Parking/access?"]
  },
  {
    id: "property-clearance",
    title: "Property Clearance",
    category: "Void / Re-let",
    urgency: "Low",
    linkedComplianceArea: "Void / Re-let",
    linkedActionIds: ["condition-inspection", "inventory"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["void/re-let"],
    whatItFixes: "Creates a clearance route before inspection, inventory or re-let.",
    why: "Clearance affects readiness and evidence quality.",
    questions: ["Items to remove?", "Any hazardous waste?", "Photos available?", "Access notes?"]
  },
  {
    id: "lock-change",
    title: "Lock Change",
    category: "Void / Re-let",
    urgency: "Medium",
    linkedComplianceArea: "Void / Re-let",
    linkedActionIds: ["condition-inspection", "inventory"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["void/re-let"],
    whatItFixes: "Adds a practical security step for void or re-let readiness.",
    why: "Lock change can be part of making a property ready and evidenced.",
    questions: ["How many external doors?", "Any communal entry?", "Preferred dates?", "Key handover notes?"]
  },
  {
    id: "checkout-report",
    title: "Check-Out Report",
    category: "Void / Re-let",
    urgency: "Medium",
    linkedComplianceArea: "Evidence",
    linkedActionIds: ["inventory", "condition-inspection"],
    routeTypes: ["riskProtected", "doneForMe"],
    bundleTags: ["void/re-let", "evidence recovery"],
    whatItFixes: "Creates end-of-tenancy condition evidence and repair priorities.",
    why: "A check-out report helps connect repair, deposit and re-let decisions.",
    questions: ["Move-out date?", "Inventory available?", "Meter reads needed?", "Photo schedule needed?", "Deposit dispute risk?"]
  },
  {
    id: "done-for-me-concierge",
    title: "Done-for-Me Concierge",
    category: "Recommended",
    urgency: "Medium",
    linkedComplianceArea: "Service coordination",
    linkedActionIds: ["annual-monitoring", "gas-safety", "eicr", "deposit-review"],
    routeTypes: ["doneForMe"],
    bundleTags: ["done for me", "risk protected", "legal essentials", "future proof"],
    whatItFixes: "Groups urgent compliance, evidence recovery, quote handling and monitoring into one managed route.",
    why: "The landlord asked CMP to handle the plan rather than manually choosing every service.",
    questions: ["Preferred contact method?", "Budget range?", "Urgent-only or full plan?", "Tenant access permission?", "Quote approval preference?"]
  }
];

const journeyServiceFilters = [
  { id: "all", label: "All services" },
  { id: "legal", label: "Legal essentials", tags: ["legal essentials", "urgent only"] },
  { id: "evidence", label: "Evidence recovery", areas: ["Evidence", "Right to Rent", "Tenancy documents", "Deposit"] },
  { id: "condition", label: "Property condition", tags: ["condition"], areas: ["Condition"] },
  { id: "hmo", label: "HMO/licensing", tags: ["hmo"], areas: ["Licensing"] },
  { id: "energy", label: "Energy/future-proof", tags: ["energy", "future proof"], areas: ["EPC", "Monitoring"] },
  { id: "void", label: "Void/re-let", tags: ["void/re-let"], areas: ["Void / Re-let"] },
  { id: "doneForMe", label: "Done-for-me", tags: ["done for me"] }
];

const journeyDocumentTypes = [
  { id: "epc", label: "EPC", complianceArea: "EPC", defaultOutcome: "valid" },
  { id: "epc-expired", label: "EPC (expired demo)", complianceArea: "EPC", defaultOutcome: "expired" },
  { id: "gas", label: "Gas Safety Certificate", complianceArea: "Gas Safety", defaultOutcome: "valid" },
  { id: "eicr", label: "EICR", complianceArea: "Electrical Safety", defaultOutcome: "valid" },
  { id: "deposit", label: "Deposit Certificate", complianceArea: "Deposit", defaultOutcome: "valid" },
  { id: "tenancy", label: "Tenancy Agreement / Written Terms", complianceArea: "Tenancy documents", defaultOutcome: "unclear" },
  { id: "renters-rights", label: "Renters' Rights Information Sheet proof", complianceArea: "Tenant information", defaultOutcome: "missing_key_details" },
  { id: "right-to-rent", label: "Right to Rent evidence", complianceArea: "Right to Rent", defaultOutcome: "unclear" },
  { id: "inspection", label: "Inspection report", complianceArea: "Inspection", defaultOutcome: "valid" },
  { id: "damp-photos", label: "Damp/mould photos", complianceArea: "Condition", defaultOutcome: "missing_key_details" },
  { id: "council-letter", label: "Council letter", complianceArea: "Enforcement", defaultOutcome: "valid" },
  { id: "licence", label: "HMO/selective licence", complianceArea: "Licensing", defaultOutcome: "valid" },
  { id: "insurance", label: "Insurance document", complianceArea: "Insurance", defaultOutcome: "expired" }
];

const guidedDemoStories = {
  "clean-property-check": {
    title: "Clean property check",
    scenarioId: "clean-property-match",
    proof: "CMP makes a confusing compliance process feel manageable.",
    time: "2 minutes",
    motif: "match",
    moments: [
      {
        name: "Story intro",
        stage: "start",
        screen: "start",
        note: "Open with the product promise: CMP starts with a property, not a form.",
        callout: "This is simulated data, but the journey is the important part: CMP finds what it can, asks what it must, and returns every route to a property workspace."
      },
      {
        name: "Start from address",
        stage: "addProperty",
        screen: "add",
        note: "Show that the landlord can start from a simple address.",
        callout: "The landlord starts with one familiar input. The real product would connect address and UPRN lookup here."
      },
      {
        name: "Auto checks reveal",
        stage: "autoChecks",
        screen: "autoChecks",
        autoComplete: true,
        note: "CMP checks what it can before asking the landlord anything.",
        callout: "Address, EPC, local authority, licensing and property clues are checked before the landlord has to answer unknowns."
      },
      {
        name: "Clean property match",
        stage: "confirmProperty",
        screen: "match",
        note: "The property match gives confidence before the action plan.",
        callout: "A clean match turns raw records into a clear starting point for the Property Compliance Profile."
      },
      {
        name: "Review found data",
        stage: "confirmProperty",
        screen: "review",
        note: "Point out what CMP found automatically.",
        callout: "CMP separates what it found from what it still needs. This keeps the landlord from facing a giant form."
      },
      {
        name: "Unknowns handled",
        stage: "unknowns",
        screen: "unknowns",
        answers: {
          occupancy: "occupied",
          propertyType: "flat",
          occupants: "oneTwo",
          gas: "yes",
          eicr: "noProof",
          alarms: "tested",
          deposit: "noProof",
          tenancyDocs: "noProof",
          condition: "none",
          intent: "risk"
        },
        note: "Landlord-only details are asked progressively, not all at once.",
        callout: "Only landlord-confirmed details are asked here: occupancy, gas, documents, condition and intent."
      },
      {
        name: "Property Intelligence built",
        stage: "brain",
        screen: "brain",
        brainComplete: true,
        note: "Show the intelligence moment, not a loading spinner.",
        callout: "CMP combines records, landlord answers, evidence, service routes and monitoring into one Property Intelligence profile."
      },
      {
        name: "Action plan reveal",
        stage: "actionPlan",
        screen: "actionPlan",
        note: "The output is prioritised, not a flat checklist.",
        callout: "CMP separates urgent blockers, missing evidence, condition risk, future risk and service opportunities."
      },
      {
        name: "Book/request quote",
        stage: "action",
        screen: "workspace",
        workspaceTab: "services",
        servicePlan: "legal",
        note: "Show that Book a Service is contextual to a gap, not a random marketplace.",
        callout: "The booking/request step is simulated. The point is that CMP turns a specific gap into a practical service action."
      },
      {
        name: "Evidence Vault updates",
        stage: "vault",
        screen: "workspace",
        workspaceTab: "evidence",
        note: "Show that evidence status and missing proof stay attached to the property.",
        callout: "Evidence Vault is the source of truth. Dashboard cards should only summarise what the vault knows."
      },
      {
        name: "Ask CMP explains the position",
        stage: "action",
        screen: "workspace",
        workspaceTab: "ask",
        note: "Show Ask CMP as property-specific guidance, not generic AI.",
        callout: "Ask CMP should explain what the evidence means, what is still unknown and what to do next. It is guidance, not legal advice."
      },
      {
        name: "Workspace and monitoring",
        stage: "monitor",
        screen: "workspace",
        workspaceTab: "monitoring",
        note: "End on the subscription value: the property stays watched.",
        callout: "The long-term value is monitoring: expiry dates, law watch, licensing watch and annual review."
      }
    ]
  },
  "no-epc-found": {
    title: "No EPC found",
    scenarioId: "no-epc-found",
    proof: "No API result becomes an action, not a dead end.",
    time: "2-3 minutes",
    motif: "gap",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Frame missing records as a product opportunity.", callout: "This story shows how CMP turns a missing EPC into a clear next action." },
      { name: "No EPC scenario", stage: "addProperty", screen: "add", note: "Use the same starting point.", callout: "The landlord still starts from an address. The difference is what CMP finds." },
      { name: "Auto checks find gap", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show that missing data is handled calmly.", callout: "A failed lookup is not a dead end. CMP makes the gap visible and keeps going." },
      { name: "No EPC branch", stage: "confirmProperty", screen: "match", note: "Choose the property context.", callout: "CMP asks the minimum context needed to decide whether EPC is urgent, pre-let or uploadable." },
      { name: "EPC action added", stage: "confirmProperty", screen: "review", noEpcChoice: "advertised", note: "The missing record becomes a blocker/action.", callout: "Because the property is being advertised, CMP keeps EPC visible as a pre-let blocker." },
      { name: "Confirm unknowns", stage: "unknowns", screen: "unknowns", noEpcChoice: "advertised", answers: { occupancy: "advertised", propertyType: "house", occupants: "unknown", gas: "unknown", eicr: "unknown", alarms: "unknown", deposit: "none", tenancyDocs: "unknown", condition: "none", intent: "minimum" }, note: "Confirm only what the landlord can know.", callout: "CMP does not invent an EPC rating. The EPC stays unknown until a current certificate is booked or uploaded." },
      { name: "Action plan", stage: "actionPlan", screen: "actionPlan", noEpcChoice: "advertised", note: "Point to Book EPC and Upload EPC routes.", callout: "The action plan now has a practical route: book an EPC, upload evidence, or continue with a warning." },
      { name: "Book EPC assessment", stage: "action", screen: "workspace", workspaceTab: "services", noEpcChoice: "advertised", servicePlan: "urgent", note: "Recommended service should be EPC Assessment, not an improvement plan.", callout: "This is a missing-evidence route. CMP recommends an EPC assessment or upload, not confident improvement advice." },
      { name: "Workspace evidence watch", stage: "vault", screen: "workspace", workspaceTab: "evidence", noEpcChoice: "advertised", note: "End with the evidence gap still visible.", callout: "No EPC remains monitored in the property workspace until evidence is found, uploaded or booked." },
      { name: "Ask CMP explains the missing record", stage: "action", screen: "workspace", workspaceTab: "ask", noEpcChoice: "advertised", note: "Ask CMP should explain the missing EPC without pretending it has live certainty.", callout: "The answer should say this is a simulated missing-record check and that a current EPC may need booking or uploading." },
      { name: "Monitoring", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", noEpcChoice: "advertised", note: "Finish with EPC follow-up visible.", callout: "The EPC gap stays on the monitoring timeline until it is resolved." }
    ]
  },
  "epc-expired-mees-risk": {
    title: "EPC expired / MEES risk",
    scenarioId: "epc-expired-mees-risk",
    proof: "CMP can explain energy evidence risk without pretending to give legal advice.",
    time: "3 minutes",
    motif: "energy",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Frame this as evidence review, not legal determination.", callout: "This scenario shows how CMP handles an EPC that may be expired or may create future risk. It uses guidance language: may, check, needs confirmation." },
      { name: "Start scenario", stage: "addProperty", screen: "add", note: "Use the same address-first start.", callout: "The product spine stays the same even when the risk changes." },
      { name: "Smart Search finds energy risk", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show that CMP found a likely EPC record, but not a clean green status.", callout: "CMP should not say the property is compliant. It should say the EPC may be expired and needs checking." },
      { name: "Address/property match", stage: "confirmProperty", screen: "match", note: "Keep property identity separate from EPC confidence.", callout: "The address can match while the EPC evidence still needs review." },
      { name: "Review found data", stage: "confirmProperty", screen: "review", note: "Point to the expired/MEES wording.", callout: "Current/future risk is visible, but the copy avoids legal certainty." },
      { name: "Confirm unknowns", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "house", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "tested", deposit: "protected", tenancyDocs: "noProof", condition: "none", intent: "future" }, note: "Landlord answers decide how urgent the energy route is.", callout: "Occupancy and intent change whether the next step is minimum action, risk reduction or future-proofing." },
      { name: "Action Plan", stage: "actionPlan", screen: "actionPlan", route: "futureProof", note: "Show EPC action tied to evidence.", callout: "The recommended step should be EPC assessment/review and then improvement planning only after the current position is known." },
      { name: "Evidence/service action", stage: "action", screen: "workspace", workspaceTab: "services", servicePlan: "future", note: "Show an EPC-related service route.", callout: "The booking/quote is simulated and should say no supplier has been contacted." },
      { name: "Ask CMP explanation", stage: "action", screen: "workspace", workspaceTab: "ask", note: "Ask CMP should explain current and future EPC risk carefully.", callout: "This is guidance, not legal advice. It should say the record may need checking before decisions are made." },
      { name: "Monitoring", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", note: "Finish with energy watch.", callout: "CMP should keep EPC/MEES review in monitoring rather than treating it as solved." }
    ]
  },
  "hmo-licensing-risk": {
    title: "HMO or licensing risk",
    scenarioId: "hmo-high-occupancy-risk",
    proof: "User answers modify the journey intelligently.",
    time: "3 minutes",
    motif: "route",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Explain that records alone cannot know household structure.", callout: "This story shows a specialist side route appearing from landlord answers." },
      { name: "HMO scenario", stage: "addProperty", screen: "add", note: "Same address-first journey.", callout: "CMP keeps the same main journey but changes the action plan as risk is discovered." },
      { name: "Smart Search found data", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show the found data before asking HMO questions.", callout: "CMP can know the address and likely property clues, but it cannot determine household structure from records alone." },
      { name: "Review found data", stage: "confirmProperty", screen: "review", note: "Separate found records from licensing unknowns.", callout: "Licensing is treated as possible and needs confirmation, not as a legal determination." },
      { name: "Property type answer", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "room" }, unknownIndex: 2, note: "Choose the shared-house answer.", callout: "This answer adds a possible HMO route without sending the user into a separate dead-end workflow." },
      { name: "Occupants answer", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus" }, unknownIndex: 3, note: "Choose 5+ occupants.", callout: "Occupancy and household answers change licensing, fire safety and room-measurement risk." },
      { name: "Licensing route added", stage: "actionPlan", screen: "actionPlan", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "risk" }, note: "The action plan should now prioritise licensing/HMO services.", callout: "CMP ties the licensing route back into the same action plan instead of creating a separate checklist." },
      { name: "Service basket", stage: "action", screen: "workspace", workspaceTab: "services", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "risk" }, servicePlan: "legal", note: "Show licensing, fire and safety services.", callout: "Recommendations are tied to property risks, not random upsells." },
      { name: "Evidence route", stage: "vault", screen: "workspace", workspaceTab: "evidence", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "risk" }, note: "Show licensing/fire evidence still pending.", callout: "Room-size, fire-risk and licence evidence remain visible until checked." },
      { name: "Ask CMP explanation", stage: "action", screen: "workspace", workspaceTab: "ask", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "risk" }, note: "Ask CMP should use cautious language.", callout: "The answer should say possible HMO/licensing risk may need checking and confirmation." },
      { name: "Monitoring", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", answers: { occupancy: "occupied", propertyType: "room", occupants: "fivePlus", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "risk" }, note: "Show that licensing watch remains live.", callout: "The workspace keeps HMO/licensing watch visible over time." }
    ]
  },
  "damp-mould-enforcement": {
    title: "Damp, mould or enforcement",
    scenarioId: "damp-mould-complaint",
    proof: "CMP handles real property risk, not just certificates.",
    time: "3 minutes",
    motif: "condition",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Explain that compliance is also condition and communication.", callout: "This story shows CMP handling risk that lives outside certificates." },
      { name: "Condition scenario", stage: "addProperty", screen: "add", note: "Use damp/mould scenario.", callout: "A tenant complaint changes the route because condition evidence matters." },
      { name: "Smart Search found data", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show that Smart Search creates the property context first.", callout: "CMP starts from property identity, then adds condition evidence and communication when the landlord provides it." },
      { name: "Review found data", stage: "confirmProperty", screen: "review", note: "Show records first, then the condition unknown.", callout: "The condition issue is not assumed from the address. It is added through landlord/tenant context." },
      { name: "Condition answer", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", condition: "dampMould" }, unknownIndex: 9, note: "Select damp/mould as the known issue.", callout: "This answer adds a condition risk route and repair evidence path." },
      { name: "Action plan", stage: "actionPlan", screen: "actionPlan", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "noProof", deposit: "noProof", tenancyDocs: "noProof", condition: "dampMould", intent: "risk" }, note: "Point to damp survey and repair evidence.", callout: "CMP connects condition risk to services, evidence and tenant communication." },
      { name: "Tenant message", stage: "action", screen: "workspace", workspaceTab: "ask", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "noProof", deposit: "noProof", tenancyDocs: "noProof", condition: "dampMould", intent: "risk" }, tenantMessage: "damp-photos", note: "Show practical tenant communication.", callout: "The tenant message is a practical draft and can be logged to the timeline as communication evidence." },
      { name: "Evidence and timeline", stage: "vault", screen: "workspace", workspaceTab: "timeline", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "noProof", deposit: "noProof", tenancyDocs: "noProof", condition: "dampMould", intent: "risk" }, addConditionEvidence: true, note: "Show evidence trail value.", callout: "Photos, messages and service actions become a timeline, not loose paperwork." },
      { name: "Monitoring", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "noProof", deposit: "noProof", tenancyDocs: "noProof", condition: "dampMould", intent: "risk" }, tenantMessage: "damp-photos", addConditionEvidence: true, note: "Show condition follow-up.", callout: "CMP keeps condition follow-up visible so a complaint does not disappear after one action." }
    ]
  },
  "done-for-me-plan": {
    title: "Done-for-me compliance plan",
    scenarioId: "done-for-me-landlord",
    proof: "CMP can become a service concierge, not just a checklist.",
    time: "3 minutes",
    motif: "concierge",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Frame the commercial service vision.", callout: "This story shows how CMP can move from diagnosis to done-for-me service orchestration." },
      { name: "Done-for-me scenario", stage: "addProperty", screen: "add", note: "Start with the same simple property check.", callout: "The journey does not change for the landlord. CMP changes the route behind the scenes." },
      { name: "Smart Search found data", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show the property context before the commercial plan.", callout: "The managed route is built from the same evidence and unknowns, not from a generic services marketplace." },
      { name: "Review found data", stage: "confirmProperty", screen: "review", note: "Show what CMP knows before asking intent.", callout: "CMP should only offer done-for-me after it has a property-specific picture." },
      { name: "Landlord intent", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, note: "Choose the done-for-me intent.", callout: "The landlord does not need to know what to book. CMP translates risk into a service plan." },
      { name: "Action plan", stage: "actionPlan", screen: "actionPlan", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", note: "Show the same Property Compliance Profile in concierge mode.", callout: "The action plan becomes a commercial path: urgent first, evidence next, monitoring always on." },
      { name: "Service basket reveal", stage: "action", screen: "workspace", workspaceTab: "services", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", servicePlan: "concierge", note: "Show the service basket as a plan, not a directory.", callout: "Service bundles are generated from risks: legal essentials, risk protection, future-proofing and monitoring." },
      { name: "Quote or book", stage: "action", screen: "workspace", workspaceTab: "services", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", servicePlan: "quotes", note: "Show quote-first commercial option.", callout: "The landlord can request quotes first, book urgent only, or hand the whole plan to CMP." },
      { name: "Evidence handoff", stage: "vault", screen: "workspace", workspaceTab: "evidence", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", servicePlan: "quotes", note: "Show evidence expected from the managed plan.", callout: "Quote requests do not solve compliance. The evidence stays pending until a service completes or evidence is uploaded." },
      { name: "Ask CMP explanation", stage: "action", screen: "workspace", workspaceTab: "ask", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", servicePlan: "quotes", note: "Ask CMP should explain the managed route.", callout: "The answer should make commercial value clear without implying a real supplier has been contacted." },
      { name: "Monitoring and workspace", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "unknown", alarms: "unknown", deposit: "unknown", tenancyDocs: "unknown", condition: "unknown", intent: "doneForMe" }, route: "doneForMe", servicePlan: "concierge", note: "End on recurring value.", callout: "The subscription value is ongoing: renewals, law watch, evidence watch and portfolio priority." }
    ]
  },
  "portfolio-landlord-preview": {
    title: "Portfolio landlord preview",
    scenarioId: "portfolio-landlord-preview",
    proof: "CMP can scale after the one-property journey is understood.",
    time: "2 minutes",
    motif: "scale",
    moments: [
      { name: "Story intro", stage: "start", screen: "start", note: "Frame this as scale-up mode, not the default landlord journey.", callout: "Only show this after Nick understands the one-property spine. Portfolio is a second act." },
      { name: "Start with one property", stage: "addProperty", screen: "add", note: "Keep the same property-first start.", callout: "Portfolio landlords still start by trusting one property workspace." },
      { name: "Smart Search found data", stage: "autoChecks", screen: "autoChecks", autoComplete: true, note: "Show that each property gets the same intelligence profile.", callout: "CMP repeats the same scan across properties instead of exposing a raw spreadsheet first." },
      { name: "Review found data", stage: "confirmProperty", screen: "review", note: "Show the one-property evidence model before scale-up.", callout: "Portfolio tools should summarize property intelligence, not replace it." },
      { name: "Confirm unknowns", stage: "unknowns", screen: "unknowns", answers: { occupancy: "occupied", propertyType: "flat", occupants: "oneTwo", gas: "yes", eicr: "noProof", alarms: "tested", deposit: "noProof", tenancyDocs: "noProof", condition: "none", intent: "risk" }, route: "riskProtected", note: "Confirm unknowns in the same way.", callout: "Unknowns remain property-specific even when David previews scale-up." },
      { name: "Action Plan", stage: "actionPlan", screen: "actionPlan", route: "riskProtected", note: "Show the single-property action plan first.", callout: "The action plan proves CMP has substance before showing portfolio comparison." },
      { name: "Evidence/service action", stage: "action", screen: "workspace", workspaceTab: "services", route: "riskProtected", servicePlan: "risk", note: "Show one service action before scale.", callout: "A portfolio view should not feel like a random marketplace. It inherits the gap and action logic." },
      { name: "Ask CMP explanation", stage: "action", screen: "workspace", workspaceTab: "ask", route: "riskProtected", note: "Ask CMP explains scale-up mode.", callout: "The explanation should say portfolio is for comparing risk after property one is understood." },
      { name: "Monitoring", stage: "monitor", screen: "workspace", workspaceTab: "monitoring", route: "riskProtected", note: "End with recurring monitoring value.", callout: "Portfolio mode becomes credible when each property already has monitoring and evidence state." }
    ]
  }
};

const nickScenarioExplorerCards = [
  {
    id: "clean-property-check",
    title: "Clean property",
    tests: "A straightforward landlord journey where records match cleanly.",
    finds: "Address, UPRN, likely EPC, local authority and a clear property profile.",
    action: "Confirm the remaining unknowns, then move into evidence and monitoring."
  },
  {
    id: "no-epc-found",
    title: "No EPC found",
    tests: "What happens when a public record is missing.",
    finds: "No clear EPC signal and a property file that keeps the gap visible.",
    action: "Book or upload an EPC before relying on the property file."
  },
  {
    id: "epc-expired-mees-risk",
    title: "EPC expired / MEES risk",
    tests: "How CMP turns EPC risk into a practical next step.",
    finds: "A likely EPC record that may be expired, weak or needs checking before decisions are made.",
    action: "Create an EPC assessment/review action and keep future MEES monitoring visible."
  },
  {
    id: "hmo-licensing-risk",
    title: "HMO or licensing risk",
    tests: "How landlord answers change the route.",
    finds: "Occupancy/licensing signals that need property-specific confirmation.",
    action: "Create licensing, fire-safety or room-measurement actions."
  },
  {
    id: "damp-mould-enforcement",
    title: "Damp, mould or enforcement",
    tests: "Condition risk beyond certificates.",
    finds: "Repair, communication and evidence gaps that need an audit trail.",
    action: "Create survey, tenant-message, evidence and follow-up tasks."
  },
  {
    id: "done-for-me-plan",
    title: "Done-for-me compliance plan",
    tests: "The commercial service path after diagnosis.",
    finds: "A property-specific set of service recommendations.",
    action: "Request quotes or build a managed compliance plan."
  },
  {
    id: "portfolio-landlord-preview",
    title: "Portfolio landlord preview",
    tests: "How the same model could scale after property one.",
    finds: "Cross-property risk, evidence strength and prioritised actions.",
    action: "Move to portfolio mode only after the core story is understood."
  }
];

const journeyScanOutcomes = {
  valid: {
    label: "Valid",
    status: "accepted",
    confidence: "High",
    body: "Evidence accepted. Score improves, expiry reminder is created if relevant, and the linked compliance item updates."
  },
  unclear: {
    label: "Unclear",
    status: "flagged",
    confidence: "Medium",
    body: "Needs landlord confirmation. Evidence confidence partially improves and the action remains amber."
  },
  expired: {
    label: "Expired",
    status: "flagged",
    confidence: "High",
    body: "Evidence stored but marked expired. Replacement service remains recommended."
  },
  wrong_property: {
    label: "Wrong property",
    status: "rejected",
    confidence: "High",
    body: "Evidence rejected or flagged because the address does not match this property."
  },
  missing_key_details: {
    label: "Missing details",
    status: "flagged",
    confidence: "Low",
    body: "Evidence partially accepted. CMP asks for date, address or provider confirmation."
  }
};

const journeyScanSteps = [
  "Upload received",
  "Reading document",
  "Checking address",
  "Extracting dates",
  "Matching to compliance rule",
  "Checking expiry",
  "Updating evidence vault"
];

const journeyAskPrompts = [
  "Can I rent this property now?",
  "What should I do first?",
  "What can wait?",
  "Why is my score low?",
  "What should I book?",
  "How do I improve the EPC?",
  "What should I say to the tenant?",
  "What risks could get expensive?",
  "What is the cheapest compliant route?",
  "What is the safest future-proof route?",
  "What changed in this Property Intelligence profile?",
  "What did my booking change?",
  "What evidence is still missing?",
  "What is waiting on a service?",
  "What can I mark complete?",
  "What should I do after requesting quotes?"
];

const journeyTenantMessageTemplates = [
  { id: "gas-access", title: "Access request for Gas Safety", linkedServiceId: "gas-safety-certificate", body: "Hi [Tenant Name], I hope you're well. We need to arrange access for a gas safety check at [Property Address]. Please let me know which of the following times would be convenient, or suggest another suitable time. Thanks." },
  { id: "eicr-access", title: "Access request for EICR", linkedServiceId: "eicr", body: "Hi [Tenant Name], I hope you're well. We need to arrange access for an electrical safety inspection at [Property Address]. Please confirm which appointment window works best for you. Thanks." },
  { id: "damp-photo-request", title: "Damp/mould photo request", linkedServiceId: "damp-mould-survey", body: "Hi [Tenant Name], thanks for reporting the damp/mould issue. Please send clear photos of the affected areas and let me know which rooms are affected, when it started, and whether heating and ventilation are working normally." },
  { id: "repair-appointment", title: "Repair appointment confirmation", linkedServiceId: "condition-inspection", body: "Hi [Tenant Name], this confirms we are arranging a repair/inspection visit at [Property Address]. Please let me know if the proposed time is unsuitable or if there are any access notes we should pass on." },
  { id: "routine-inspection", title: "Routine inspection notice", linkedServiceId: "condition-inspection", body: "Hi [Tenant Name], I would like to arrange a routine property inspection at [Property Address]. Please let me know which of the suggested times is convenient. The visit is to check condition and any maintenance needs." },
  { id: "certificate-follow-up", title: "Certificate/service follow-up", linkedServiceId: "annual-monitoring", body: "Hi [Tenant Name], following the recent property visit/check, I will update the property record and share any relevant next steps. Please let me know if anything has changed since the appointment." },
  { id: "tenant-doc-request", title: "Tenant document request", linkedServiceId: "tenancy-document-pack", body: "Hi [Tenant Name], I am updating the property records for [Property Address]. Please confirm whether you have received the tenancy information and let me know if anything needs re-sending." },
  { id: "council-response", title: "Council/enforcement response acknowledgement", linkedServiceId: "damp-mould-survey", body: "Hi [Tenant Name], I acknowledge the issue raised about [Property Address]. I am reviewing the matter and arranging the next practical step. Please send any further photos or updates that may help document the condition." },
  { id: "general-access", title: "General access follow-up", linkedServiceId: "relet-readiness-pack", body: "Hi [Tenant Name], I need to arrange access to [Property Address] for a property-related visit. Please let me know your availability from the options below, or suggest another time." },
  { id: "access-refusal-log", title: "Access refusal log message", linkedServiceId: "annual-monitoring", body: "Hi [Tenant Name], I am following up because access has not yet been agreed for the required property visit at [Property Address]. Please contact me with suitable times so the matter can be progressed." }
];

const journeyMonitoringCatalog = [
  { id: "epc-expiry-monitor", type: "Expiry reminder", title: "EPC expiry reminder", dueDate: "14 March 2031", urgency: "Low", linkedActionId: "epc-expiry", description: "Monitor EPC expiry and future improvement roadmap." },
  { id: "gas-renewal-monitor", type: "Expiry reminder", title: "Gas Safety renewal", dueDate: "Unknown until certificate uploaded", urgency: "High", linkedActionId: "gas-safety", description: "Create renewal tracking after evidence is uploaded or booked." },
  { id: "eicr-renewal-monitor", type: "Expiry reminder", title: "EICR renewal", dueDate: "Unknown until EICR uploaded", urgency: "High", linkedActionId: "eicr", description: "Track Electrical Safety renewal after the current report is known." },
  { id: "licensing-watch", type: "Licensing watch", title: "Licence renewal unknown", dueDate: "Needs local check", urgency: "Medium", linkedActionId: "hmo-licensing", description: "Keep local licensing visible until the position is confirmed." },
  { id: "insurance-renewal", type: "Evidence monitoring", title: "Insurance renewal unknown", dueDate: "Unknown", urgency: "Medium", linkedActionId: "insurance", description: "Request insurance evidence and add renewal date later." },
  { id: "inspection-due", type: "Condition review", title: "Inspection due", dueDate: "Next 30 days", urgency: "Medium", linkedActionId: "condition-inspection", description: "Schedule or upload a condition inspection." },
  { id: "epc-c-readiness", type: "Law change watch", title: "Future EPC C readiness", dueDate: "Future watch", urgency: "Medium", linkedActionId: "epc-e-roadmap", description: "Track improvement plan and future PRS readiness." },
  { id: "annual-review", type: "Annual compliance review", title: "Annual compliance review", dueDate: "Every 12 months", urgency: "Low", linkedActionId: "annual-monitoring", description: "Bundle evidence, actions and monitoring into an annual review." }
];

const journeyPortfolioPreviewProperties = [
  { id: "willow-brook", address: "18 Willow Brook Drive", issue: "Gas Safety missing", urgency: "High", evidence: "Weak", epc: "C" },
  { id: "the-butts", address: "57 The Butts", issue: "EICR evidence weak", urgency: "High", evidence: "Building", epc: "C" },
  { id: "king-street", address: "22 King Street", issue: "EPC E future-risk", urgency: "Medium", evidence: "Medium", epc: "E" }
];

function createJourneyEvidenceItem(status, evidenceLevel, expiryDate, source, confidence, actionNeeded) {
  return { status, evidenceLevel, expiryDate, source, confidence, actionNeeded };
}

function createJourneyPropertyBrain(scenarioId = "clean-property-match") {
  const scenario = journeyDemoScenarios[scenarioId] || journeyDemoScenarios["clean-property-match"];
  const epcFound = scenario.epcFound !== false;
  const eicrMissing = scenario.eicrMissing !== false;
  const gasUnknown = scenario.gasStatus === "Unknown";
  const depositMissing = scenario.depositStatus === "Evidence missing";

  return {
    PropertyIdentity: {
      address: "Flat 42, 57 The Butts, Coventry, CV1 3BJ",
      postcode: "CV1 3BJ",
      uprn: "DEMO-UPRN-57TB",
      localAuthority: scenario.localAuthority || "Coventry City Council",
      ward: "Earlsdon",
      propertyType: scenario.propertyType || "Flat / apartment",
      propertyTypeConfidence: scenario.propertyTypeConfidence || "High",
      tenure: "Private rented sector",
      flatBlockCommonPartsFlag: Boolean(scenario.flatBlockCommonPartsFlag),
      hmoRiskFlag: Boolean(scenario.hmoRiskFlag),
      conversionRiskFlag: Boolean(scenario.conversionRiskFlag),
      identityConfidence: scenario.dataConfidence || (scenario.branch === "multiple" ? "Medium" : "High")
    },
    AutoCheckResults: {
      epcFound,
      epcRecordStatus: scenario.epcRecordStatus || (epcFound ? "Clear match" : "No clear EPC record found"),
      epcRating: scenario.epcRating ?? "C",
      epcScore: scenario.epcScore ?? 72,
      epcPotentialRating: scenario.epcPotentialRating ?? "B",
      epcPotentialScore: scenario.epcPotentialScore ?? 84,
      epcExpiry: epcFound ? (scenario.epcExpiry || "14 March 2031") : "Unknown",
      epcLodgementDate: epcFound ? "15 March 2021" : "Unknown",
      epcRecommendations: epcFound ? ["Improve loft insulation", "Add heating controls / TRVs", "Review low-energy lighting"] : ["Book EPC assessment"],
      mainHeating: scenario.mainHeating || "Gas boiler",
      propertyAge: "1900-1929",
      councilTaxBand: "B",
      floodRisk: "Low surface water risk",
      possibleLicensingRisk: scenario.possibleLicensingRisk || scenario.licensingRisk || "Selective licensing watch item",
      planningDataAvailable: scenario.conversionRiskFlag ? "Partial planning clues only" : "No obvious planning flag",
      dataConfidence: scenario.dataConfidence || (scenario.branch === "noEpc" ? "Low" : "High")
    },
    TenancyProfile: {
      occupancyStatus: scenario.occupancyStatus || "Unknown",
      tenancyStartKnown: false,
      tenancyStartDate: "",
      occupantCount: scenario.occupantCount || "Unknown",
      householdCount: scenario.householdCount || "Unknown",
      depositTaken: Boolean(scenario.depositTaken),
      depositStatus: scenario.depositStatus || "Unknown",
      rightToRentStatus: "Unknown",
      tenancyDocsStatus: "Unknown",
      repairComplaintStatus: scenario.repairComplaintStatus || "No complaint recorded",
      councilContactStatus: scenario.councilContactStatus || "No council contact recorded",
      landlordIntent: scenario.landlordIntent || "Prioritised"
    },
    ComplianceEvidence: {
      epc: createJourneyEvidenceItem(epcFound ? (scenario.epcExpired ? "expired" : "found") : "missing", epcFound ? "Official record signal" : "No evidence", epcFound ? (scenario.epcExpiry || "14 March 2031") : "Unknown", "Simulated EPC lookup", epcFound ? "High" : "Low", scenario.epcExpired ? "Book EPC assessment or review MEES position" : epcFound ? "Review record" : "Book or upload EPC"),
      gasSafety: createJourneyEvidenceItem(gasUnknown ? "unknown" : "missing", "No uploaded evidence", "Unknown", "Landlord answer needed", gasUnknown ? "Low" : "Medium", "Confirm gas and upload/book Gas Safety"),
      eicr: createJourneyEvidenceItem(eicrMissing ? "missing" : "found", eicrMissing ? "No uploaded evidence" : "Uploaded evidence", eicrMissing ? "Unknown" : "11 May 2031", eicrMissing ? "Landlord upload needed" : "Demo upload", eicrMissing ? "Low" : "High", eicrMissing ? "Book or upload EICR" : "Monitor renewal"),
      smokeCo: createJourneyEvidenceItem("unknown", "Landlord answer needed", "Unknown", "Landlord answer needed", "Low", "Confirm alarm status"),
      licensing: createJourneyEvidenceItem("review", "Postcode signal", "Unknown", "Simulated local check", "Medium", "Check local licensing position"),
      deposit: createJourneyEvidenceItem(depositMissing ? "missing" : "unknown", depositMissing ? "No proof" : "Depends on tenancy", "Unknown", "Landlord answer needed", depositMissing ? "Low" : "Medium", depositMissing ? "Deposit Compliance Review" : "Confirm deposit status"),
      rightToRent: createJourneyEvidenceItem("unknown", "No evidence", "Unknown", "Landlord answer needed", "Low", "Upload or confirm Right to Rent evidence"),
      tenancyDocs: createJourneyEvidenceItem("unknown", "No evidence", "Unknown", "Landlord answer needed", "Low", "Upload tenancy documents or review"),
      inspectionReports: createJourneyEvidenceItem("missing", "No inspection report", "Unknown", "Landlord upload needed", "Low", "Upload or book inspection"),
      repairLogs: createJourneyEvidenceItem(scenario.conditionIssue ? "review" : "unknown", scenario.conditionIssue ? "Condition issue reported" : "No repair log", "Unknown", "Landlord answer", scenario.conditionIssue ? "Medium" : "Low", scenario.conditionIssue ? "Build repair evidence pack" : "Confirm condition"),
      insurance: createJourneyEvidenceItem("unknown", "No evidence", "Unknown", "Landlord upload needed", "Low", "Upload insurance schedule"),
      leaseholdConsent: createJourneyEvidenceItem(scenario.flatBlockCommonPartsFlag ? "review" : "not_applicable", scenario.flatBlockCommonPartsFlag ? "Flat route" : "Not applicable", "Unknown", "Property type logic", "Medium", scenario.flatBlockCommonPartsFlag ? "Request freeholder/leasehold evidence" : "No action")
    },
    Scores: {
      legalComplianceScore: 52,
      evidenceStrengthScore: 34,
      conditionRiskScore: scenario.conditionIssue ? 62 : 28,
      futureReadinessScore: scenario.futureRisk || scenario.urgentMees ? 44 : 66,
      serviceReadinessScore: scenario.preferredRoute === "doneForMe" ? 82 : 58
    },
    Actions: {
      urgentLegalBlockers: [],
      missingEvidence: [],
      expiringSoon: [],
      conditionRisks: [],
      futureRisks: [],
      improvementOpportunities: [],
      recommendedServices: []
    }
  };
}

function createInitialJourneyState(scenarioId = "clean-property-match") {
  const scenario = journeyDemoScenarios[scenarioId] || journeyDemoScenarios["clean-property-match"];
  const state = {
    scenarioId,
    currentStage: "start",
    screen: "start",
    routeId: scenario.preferredRoute || "prioritised",
    workspaceTab: "overview",
    addressInput: "Flat 42, 57 The Butts, Coventry, CV1 3BJ",
    postcodeInput: "CV1 3BJ",
    selectedMatchId: "",
    autoCheckStep: 0,
    brainStep: 0,
    unknownIndex: 0,
    answers: {},
    carriedAnswers: {},
    conditionSelections: [],
    serviceFilter: "all",
    branchEffects: [],
    propertyBrain: createJourneyPropertyBrain(scenarioId),
    actionPlan: null,
    serviceRecommendations: [],
    serviceBasket: [],
    timelineEvents: [
      { id: "journey-ready", title: "Journey OS ready", body: "Demo mode started with simulated data.", type: "Setup", time: "Now" }
    ],
    evidenceVault: [],
    monitoringItems: [],
    askHistory: [],
    generatedMessages: [],
    activeIntake: null,
    activeScanner: null,
    activeTenantMessage: null,
    activeServiceDetail: "",
    activeConfirmation: null,
    modalMode: "",
    scannerTimers: [],
    deferredActions: [],
    activeAction: null,
    autoTimers: [],
    brainTimers: []
  };
  state.actionPlan = buildJourneyActionPlan(state);
  state.serviceRecommendations = buildServiceRecommendations(state);
  state.monitoringItems = journeyMonitoringCatalog.map((item) => ({ ...item, status: "watching" }));
  return state;
}

const labsState = {
  currentView: "home",
  activeTab: "overview",
  eicrAdded: false,
  strength: 42,
  timelineFilter: "all",
  alarmAnswer: "",
  notes: [],
  propertyEvents: [],
  serviceRequests: [],
  serviceEvents: [],
  propertiesSearch: "",
  propertiesFilter: "all",
  propertiesView: "cards",
  evidenceSearch: "",
  evidenceFilter: "all",
  evidencePropertyFilter: "all",
  evidenceView: "list",
  taskSearch: "",
  taskFilter: "all",
  taskView: "list",
  activitySearch: "",
  activityFilter: "all",
  utilityAskPrompt: "",
  inspectionStatusRecorded: false,
  demoState: "starter-portfolio",
  portfolioMode: "two",
  azMode: "single",
  azPropertyId: "the-butts",
  azScenario: "general",
  activeCheckerSection: "property-basics",
  newPropertyCheckerExpanded: false,
  portfolioSweepStage: "scope",
  editingCheckerCard: "",
  checkerAnswers: {},
  checkerScoreBoosts: {},
  scorePulse: null,
  selectedServicePropertyId: "all",
  pendingServiceRequestType: "eicr",
  pendingServicePropertyId: "the-butts",
  addPropertyStep: 1,
  addPropertyAddress: "Flat 42, 57 The Butts, Coventry, CV1 3BJ",
  smartSearchAnswerPanel: "",
  smartSearchWorkspaceOpen: false,
  journeyState: createInitialJourneyState(),
  guidedDemo: {
    enabled: false,
    activeStoryId: "",
    activeMomentIndex: 0,
    mode: "landing",
    lastNormalScenarioId: "clean-property-match",
    hasSeenLanding: false
  },
  settings: {
    complianceReminders: true,
    evidenceExpiryAlerts: true,
    supportRequestUpdates: true,
    weeklyPortfolioSummary: false,
    showPrototypeLabels: true,
    compactMode: false
  },
  propertyDetails: createInitialPropertyDetails(),
  optionalDetails: createInitialOptionalDetails(),
  propertyMemory: createInitialPropertyMemory(),
  propertySetup: createInitialPropertySetup(),
  scanTimers: []
};

function newPropertySetup() {
  if (!labsState.propertySetup) {
    labsState.propertySetup = createInitialPropertySetup();
  }
  applyNewPropertyEpcVariant(labsState.propertySetup);
  return labsState.propertySetup;
}

function isNewPropertyEvidenceUploaded(setup, key) {
  return ["uploaded", "verified"].includes(setup.evidence?.[key]?.status);
}

function newPropertyProfileSetupScore(setup = newPropertySetup()) {
  let score = 0;
  const confirmations = setup.confirmations || {};
  const foundData = setup.foundData || {};
  const identity = setup.identity || {};

  if (identity.addressConfirmed && identity.selectedAddressLocked) {
    score += 15;
  }
  if (identity.uprn && foundData.postcodeMetadataFound && foundData.localAuthorityFound) {
    score += 10;
  }
  if (confirmations.epcAcceptedForDemoReview) {
    score += 15;
  }
  if (confirmations.propertyTypeConfirmed) {
    score += 10;
  }
  if (confirmations.localChecksStarted) {
    score += 8;
  }
  if (confirmations.bedroomsConfirmed) {
    score += 8;
  }
  if (confirmations.occupancyConfirmed) {
    score += 12;
  }
  if (confirmations.gasSafetyRelevanceConfirmed) {
    score += 8;
  }
  if (confirmations.eicrStatusConfirmed) {
    score += 6;
  }
  if (confirmations.alarmsConfirmed) {
    score += 5;
  }
  if (confirmations.tenancyDepositConfirmed) {
    score += 4;
  }
  if (confirmations.inspectionReviewed) {
    score += 4;
  }
  if (confirmations.licensingReviewed) {
    score += 4;
  }

  if (!confirmations.licensingReviewed) {
    score = Math.min(score, 96);
  }

  return clampScore(score);
}

function newPropertyEvidenceConfidenceScore(setup = newPropertySetup()) {
  let score = 0;
  const evidence = setup.evidence || {};

  if (evidence.epc?.status === "acceptedStartingSignal") {
    score += 10;
  } else if (isNewPropertyEvidenceUploaded(setup, "epc")) {
    score += 18;
  }
  if (isNewPropertyEvidenceUploaded(setup, "gasSafety")) {
    score += 20;
  }
  if (isNewPropertyEvidenceUploaded(setup, "eicr")) {
    score += 25;
  }
  if (isNewPropertyEvidenceUploaded(setup, "alarms")) {
    score += 10;
  }
  if (isNewPropertyEvidenceUploaded(setup, "tenancy")) {
    score += 7;
  }
  if (isNewPropertyEvidenceUploaded(setup, "deposit")) {
    score += 7;
  }
  if (isNewPropertyEvidenceUploaded(setup, "inspection")) {
    score += 8;
  }
  if (isNewPropertyEvidenceUploaded(setup, "licensing")) {
    score += 5;
  }

  return clampScore(score);
}

function newPropertyComplianceReadinessScore(setup = newPropertySetup()) {
  const profileScore = newPropertyProfileSetupScore(setup);
  if (profileScore < 70) {
    return null;
  }
  return clampScore(Math.round((profileScore * 0.45) + (newPropertyEvidenceConfidenceScore(setup) * 0.55)));
}

function newPropertyStatusSummary(setup = newPropertySetup()) {
  const profileSetupScore = newPropertyProfileSetupScore(setup);
  const evidenceConfidenceScore = newPropertyEvidenceConfidenceScore(setup);
  const readinessScore = newPropertyComplianceReadinessScore(setup);
  const confirmations = setup.confirmations || {};
  const evidence = setup.evidence || {};
  const answers = setup.landlordAnswers || {};
  const inspectionHandled = ["uploaded", "answered", "skipped"].includes(evidence.inspection?.status);
  const missingCertificates = [
    evidence.gasSafety?.status !== "uploaded" ? "Gas Safety" : "",
    evidence.eicr?.status !== "uploaded" ? "EICR" : "",
    evidence.alarms?.status === "unknown" ? "Alarm status" : "",
    inspectionHandled ? "" : "Inspection record"
  ].filter(Boolean);
  const needsAnswer = [
    confirmations.bedroomsConfirmed ? "" : "Bedrooms",
    confirmations.occupancyConfirmed ? "" : "Occupancy",
    confirmations.gasSafetyRelevanceConfirmed ? "" : "Gas Safety relevance",
    confirmations.eicrStatusConfirmed ? "" : "EICR status",
    confirmations.alarmsConfirmed ? "" : "Smoke and CO alarms",
    confirmations.tenancyDepositConfirmed || answers.tenancyDepositStatus ? "" : "Tenancy/deposit documents",
    confirmations.inspectionReviewed || answers.inspectionStatus ? "" : "Inspection evidence"
  ].filter(Boolean);

  return {
    findingsConfirmed: Boolean(confirmations.findingsConfirmed),
    profileSetupScore,
    evidenceConfidenceScore,
    readinessScore,
    profileSetupLabel: profileSetupScore < 35 ? "Starting" : profileSetupScore < 70 ? "Needs confirmation" : "Mostly confirmed",
    evidenceConfidenceLabel: evidenceConfidenceScore === 0 ? "No uploaded evidence yet" : evidenceConfidenceScore < 20 ? "Starting signal only" : "Evidence building",
    readinessLabel: readinessScore === null ? "Complete setup before compliance scoring" : `${readinessScore}% provisional readiness`,
    profileSetupHelp: confirmations.findingsConfirmed
      ? "Found details are confirmed; bedrooms, occupancy and safety answers still need landlord input."
      : "Address and postcode context are prepared. Confirm CMP findings to lift the setup score.",
    evidenceConfidenceHelp: evidenceConfidenceScore === 0
      ? "No uploaded certificates are stored yet."
      : evidence.epc?.status === "acceptedStartingSignal" && evidenceConfidenceScore <= 10
        ? "EPC is accepted only as a starting signal. Uploaded certificates are still missing."
        : "Demo evidence uploads are stored in this prototype session.",
    primaryTaskTitle: confirmations.findingsConfirmed ? needsAnswer[0] ? `Confirm ${needsAnswer[0]}` : "Open property workspace" : "Confirm what CMP found",
    missingEvidence: missingCertificates,
    needsAnswer,
    watchItems: [
      confirmations.findingsConfirmed ? "Smart search saved" : "Review smart search results",
      evidence.epc?.status === "acceptedStartingSignal" ? "EPC accepted as starting signal" : "EPC prepared for review",
      missingCertificates.length ? `${missingCertificates.length} evidence items still missing` : "Core certificates uploaded"
    ],
    statusLine: confirmations.findingsConfirmed
      ? "Smart search saved. Continue the remaining inline setup questions before compliance scoring."
      : "CMP has prepared the first property profile. Confirm findings before scoring."
  };
}

function newPropertyFindingItems(setup = newPropertySetup()) {
  const confirmations = setup.confirmations || {};
  const identity = setup.identity || {};
  const foundData = setup.foundData || {};

  return [
    {
      title: "Address matched",
      value: identity.address,
      status: identity.addressConfirmed ? "Confirmed from selection" : "Found automatically",
      action: identity.addressConfirmed ? "Confirmed" : "Confirm / Edit",
      complete: identity.addressConfirmed
    },
    {
      title: "EPC prepared for review",
      value: confirmations.epcAcceptedForDemoReview
        ? `Rating ${foundData.epcRating} accepted as a starting signal`
        : "EPC-style record prepared before relying on it",
      status: confirmations.epcAcceptedForDemoReview ? "Accepted for demo review" : "Prepared for review",
      action: confirmations.epcAcceptedForDemoReview ? "Reviewed" : "Review",
      complete: confirmations.epcAcceptedForDemoReview
    },
    {
      title: "Property type",
      value: setup.landlordAnswers?.propertyType || foundData.epcPropertyType || "Needs confirmation",
      status: confirmations.propertyTypeConfirmed ? "Confirmed by landlord" : "Needs confirmation",
      action: confirmations.propertyTypeConfirmed ? "Confirmed" : "Confirm / Change",
      complete: confirmations.propertyTypeConfirmed
    },
    {
      title: "Bedrooms",
      value: confirmations.bedroomsConfirmed ? setup.landlordAnswers.bedrooms : "Needs confirmation",
      status: confirmations.bedroomsConfirmed ? "Confirmed by landlord" : "Needs confirmation",
      action: confirmations.bedroomsConfirmed ? "Confirmed" : "Answer",
      complete: confirmations.bedroomsConfirmed
    },
    {
      title: "Occupancy / tenancy status",
      value: confirmations.occupancyConfirmed ? setup.landlordAnswers.occupancy : "Unknown",
      status: confirmations.occupancyConfirmed ? "Confirmed by landlord" : "Needs answer",
      action: confirmations.occupancyConfirmed ? "Confirmed" : "Answer",
      complete: confirmations.occupancyConfirmed
    },
    {
      title: "Postcode / local checks",
      value: foundData.localAuthorityFound ? `${identity.localAuthority} context ready` : "Ready for local checks",
      status: confirmations.localChecksStarted ? "Started" : "Ready",
      action: confirmations.localChecksStarted ? "Started" : "Review later",
      complete: confirmations.localChecksStarted
    }
  ];
}

function newPropertyEvidenceRows(setup = newPropertySetup()) {
  const evidence = setup.evidence || {};
  const property = "57 The Butts · CV1 3BJ";
  const epcAccepted = evidence.epc?.status === "acceptedStartingSignal";
  const gasUploaded = isNewPropertyEvidenceUploaded(setup, "gasSafety");
  const eicrUploaded = isNewPropertyEvidenceUploaded(setup, "eicr");

  return [
    {
      id: "new-epc",
      title: "EPC",
      document: "Energy Performance Certificate",
      propertyId: "the-butts",
      property,
      source: epcAccepted ? "Accepted starting signal" : "Official record signal",
      sourceClass: epcAccepted ? "status-watch-text" : "status-watch-text",
      status: epcAccepted ? "Accepted for demo review" : "Prepared for review",
      statusClass: epcAccepted ? "status-watch-text" : "status-watch-text",
      keyDate: epcAccepted ? "Review before relying on it" : "Review before relying on it",
      filters: ["review", "official"],
      search: "epc energy performance certificate 57 butts official record prepared review accepted starting signal",
      actions: [
        { label: "Ask CMP", action: "askEpc" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    {
      id: "new-gas",
      title: "Gas Safety",
      document: "Gas Safety Certificate",
      propertyId: "the-butts",
      property,
      source: gasUploaded ? "Demo upload" : "No document uploaded",
      sourceClass: gasUploaded ? "status-good-text" : "status-review-text",
      status: gasUploaded ? "Uploaded for review" : "Needs landlord input",
      statusClass: gasUploaded ? "status-good-text" : "status-review-text",
      keyDate: gasUploaded ? "Added today" : "Unknown",
      filters: gasUploaded ? ["uploaded", "review"] : ["missing", "review"],
      search: "gas safety certificate 57 butts missing uploaded no document needs landlord input",
      actions: gasUploaded
        ? [{ label: "Ask CMP", action: "askReview" }]
        : [
            { label: "Upload", action: "uploadGas", primary: true },
            { label: "Ask CMP", action: "askReview" }
          ]
    },
    {
      id: "new-eicr",
      title: "Electrical Safety / EICR",
      document: "Electrical Installation Condition Report",
      propertyId: "the-butts",
      property,
      source: eicrUploaded ? "Demo upload" : "No document uploaded",
      sourceClass: eicrUploaded ? "status-good-text" : "status-review-text",
      status: eicrUploaded ? "Uploaded for review" : "Needs landlord input",
      statusClass: eicrUploaded ? "status-good-text" : "status-review-text",
      keyDate: eicrUploaded ? "Added today" : "Unknown",
      filters: eicrUploaded ? ["uploaded", "review"] : ["missing", "review"],
      search: "eicr electrical safety 57 butts missing uploaded no document needs landlord input",
      actions: eicrUploaded
        ? [{ label: "Ask CMP", action: "askReview" }]
        : [
            { label: "Upload", action: "uploadEicr", primary: true },
            { label: "Ask CMP", action: "askReview" }
          ]
    },
    {
      id: "new-alarms",
      title: "Smoke and CO alarms",
      document: "Landlord alarm answer or supporting evidence",
      propertyId: "the-butts",
      property,
      source: "Landlord answer needed",
      sourceClass: "status-neutral-text",
      status: "Needs answer",
      statusClass: "status-watch-text",
      keyDate: "Confirm in guided check",
      filters: ["missing", "review"],
      search: "smoke co alarms 57 butts landlord answer evidence",
      actions: [
        { label: "Continue guided check", action: "startGuidedCheck", primary: true },
        { label: "Ask CMP", action: "askReview" }
      ]
    },
    {
      id: "new-tenancy",
      title: "Tenancy / deposit documents",
      document: "Tenancy, deposit or prescribed information",
      propertyId: "the-butts",
      property,
      source: "Not assessed yet",
      sourceClass: "status-neutral-text",
      status: "Depends on occupancy",
      statusClass: "status-watch-text",
      keyDate: "Confirm occupancy first",
      filters: ["missing", "review"],
      search: "tenancy deposit documents 57 butts occupancy unknown not assessed",
      actions: [
        { label: "Continue guided check", action: "startGuidedCheck", primary: true },
        { label: "Ask CMP", action: "askTenancy" }
      ]
    },
    {
      id: "new-inspection",
      title: "Inspection / maintenance evidence",
      document: "Inspection notes or maintenance record",
      propertyId: "the-butts",
      property,
      source: "No document uploaded",
      sourceClass: "status-review-text",
      status: "Missing",
      statusClass: "status-review-text",
      keyDate: "Add when available",
      filters: ["missing", "review"],
      search: "inspection maintenance evidence 57 butts missing",
      actions: [
        { label: "Ask CMP", action: "askReview" }
      ]
    }
  ];
}

function newPropertyTaskItems(setup = newPropertySetup()) {
  const summary = newPropertyStatusSummary(setup);
  const evidence = setup.evidence || {};
  const tasks = [];
  const property = "57 The Butts · CV1 3BJ";

  if (!summary.findingsConfirmed) {
    tasks.push({
      id: "new-details",
      title: "Confirm what CMP found",
      property,
      propertyId: "the-butts",
      category: "Property setup",
      priority: "High",
      source: "Add property",
      body: "CMP matched the address and prepared EPC context. Confirm the found details before CMP scores the property file.",
      status: "Needs confirmation",
      suggestedAction: "Confirm all found details",
      board: "todo",
      filters: ["high"],
      detail: "CMP created this setup task because the address and EPC signal are prepared, but the landlord still needs to confirm the found details before scoring.",
      search: "property type confirm setup 57 butts cmp findings",
      actions: [
        { label: "Review smart search", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askLicensing" }
      ]
    });
  }

  if (summary.findingsConfirmed && !setup.confirmations?.bedroomsConfirmed) {
    tasks.push({
      id: "new-bedrooms",
      title: "Confirm bedrooms",
      property,
      propertyId: "the-butts",
      category: "Property setup",
      priority: "High",
      source: "Smart Search setup",
      body: "CMP could not reliably infer the bedroom count from the found records.",
      status: "Needs landlord input",
      suggestedAction: "Answer the bedroom question",
      board: "todo",
      filters: ["high"],
      detail: "Bedroom count helps CMP tailor reminders, inspections and future local checks.",
      search: "bedrooms bedroom count confirm setup 57 butts",
      actions: [
        { label: "Answer bedrooms", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askSetup" }
      ]
    });
  }

  if (!setup.confirmations?.occupancyConfirmed) {
    tasks.push({
      id: "new-occupancy",
      title: "Confirm occupancy / tenancy status",
      property,
      propertyId: "the-butts",
      category: "Property setup",
      priority: "High",
      source: "Smart Search setup",
      body: "Occupancy determines which checks, documents and reminders CMP should prioritise.",
      status: "Needs confirmation",
      suggestedAction: "Answer the occupancy questions",
      board: "todo",
      filters: ["high"],
      detail: "CMP needs the landlord scenario before treating evidence gaps as reliable.",
      search: "occupancy tenancy status confirm setup 57 butts",
      actions: [
        { label: "Answer occupancy", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askLicensing" }
      ]
    });
  }

  if (evidence.gasSafety?.status !== "uploaded" || evidence.eicr?.status !== "uploaded") {
    const missing = [
      evidence.gasSafety?.status !== "uploaded" ? "Gas Safety" : "",
      evidence.eicr?.status !== "uploaded" ? "EICR" : ""
    ].filter(Boolean).join(" and ");
    tasks.push({
      id: "new-certificates",
      title: "Upload certificates you already have",
      property,
      propertyId: "the-butts",
      category: "Evidence",
      priority: "Medium",
      source: "Smart Document Drop",
      body: missing ? `${missing} evidence is not uploaded yet.` : "Core certificates are uploaded for review.",
      status: missing ? "Evidence missing" : "Uploaded for review",
      suggestedAction: "Upload certificates",
      board: "todo",
      filters: ["evidence"],
      detail: "CMP created this task because uploaded certificates are needed before evidence confidence can improve.",
      search: "upload certificates gas safety eicr evidence 57 butts",
      actions: [
        { label: evidence.eicr?.status !== "uploaded" ? "Upload EICR" : "Upload Gas Safety", action: evidence.eicr?.status !== "uploaded" ? "uploadEicr" : "uploadGas", primary: true },
        { label: "Review Smart Search", action: "reviewFindings" }
      ]
    });
  }

  if (!setup.confirmations?.alarmsConfirmed) {
    tasks.push({
      id: "new-alarms",
      title: "Confirm smoke and CO alarm status",
      property,
      propertyId: "the-butts",
      category: "Landlord answer",
      priority: "Medium",
      source: "Smart Search setup",
      body: "CMP needs the landlord answer before it can decide whether supporting evidence is needed.",
      status: "Needs answer",
      suggestedAction: "Continue guided check",
      board: "progress",
      filters: ["evidence"],
      detail: "Alarm status depends on landlord input and supporting evidence if available.",
      search: "smoke co alarm status landlord answer 57 butts",
      actions: [
        { label: "Answer alarm status", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askLicensing" }
      ]
    });
  }

  if (!setup.landlordAnswers?.tenancyDepositStatus) {
    tasks.push({
      id: "new-tenancy-docs",
      title: "Confirm tenancy/deposit documents",
      property,
      propertyId: "the-butts",
      category: "Landlord answer",
      priority: "Medium",
      source: "Smart Search setup",
      body: "CMP needs to know whether tenancy and deposit documents matter for this property right now.",
      status: "Needs answer",
      suggestedAction: "Answer the tenancy/deposit question",
      board: "todo",
      filters: ["evidence"],
      detail: "Tenancy and deposit prompts depend on the occupancy route selected during setup.",
      search: "tenancy deposit documents answer 57 butts smart search",
      actions: [
        { label: "Answer tenancy documents", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askTenancy" }
      ]
    });
  }

  if (!setup.landlordAnswers?.inspectionStatus) {
    tasks.push({
      id: "new-inspection-answer",
      title: "Confirm inspection evidence",
      property,
      propertyId: "the-butts",
      category: "Landlord answer",
      priority: "Low",
      source: "Smart Search setup",
      body: "CMP can keep inspection evidence open, skip it for now or mark that a recent inspection exists.",
      status: "Can skip for now",
      suggestedAction: "Answer or skip the inspection question",
      board: "todo",
      filters: ["evidence"],
      detail: "Inspection evidence is useful context, but it should not block first-property setup.",
      search: "inspection evidence answer skip 57 butts smart search",
      actions: [
        { label: "Answer inspection evidence", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askReview" }
      ]
    });
  }

  return tasks;
}

function newPropertyActivityEvents(setup = newPropertySetup()) {
  const property = "57 The Butts · CV1 3BJ";
  const setupEvents = (setup.activity || []).map((event) => ({
    group: "Today",
    property,
    ...event
  }));

  return [
    ...setupEvents,
    {
      id: "new-profile-created",
      group: "Today",
      filter: "details",
      category: "Property setup",
      title: "Property profile created",
      property,
      body: "CMP created the first property workspace for 57 The Butts.",
      source: "Add property",
      status: "Created",
      statusClass: "status-good-text",
      search: "property profile created add property 57 butts",
      why: "CMP recorded this because the landlord completed the Add Property flow.",
      nextAction: "Review what CMP found.",
      route: "compliance",
      actions: [
        makeActivityAction("Review smart search", "reviewFindings", true),
        makeActivityAction("Open property", "openProperty")
      ]
    },
    {
      id: "new-address-matched",
      group: "Today",
      filter: "details",
      category: "Property details",
      title: "Address matched",
      property,
      body: "Flat 42, 57 The Butts, Coventry, CV1 3BJ was matched to the property workspace.",
      source: "Address lookup",
      status: "Matched",
      statusClass: "status-good-text",
      search: "address matched flat 42 57 butts coventry cv1",
      why: "CMP recorded this because address matching anchors checks, evidence and tasks to the correct property.",
      nextAction: "Confirm the found details once.",
      route: "details",
      actions: [
        makeActivityAction("Open details", "openDetails"),
        makeActivityAction("Ask CMP", "askSetup")
      ]
    },
    {
      id: "new-epc-prepared",
      group: "Today",
      filter: "evidence",
      category: "Evidence",
      title: setup.confirmations?.epcAcceptedForDemoReview ? "EPC accepted as starting signal" : "EPC record prepared for review",
      property,
      body: setup.confirmations?.epcAcceptedForDemoReview
        ? "The EPC signal was accepted for demo review. It is not treated as legal verification."
        : "CMP prepared an EPC signal for landlord review, but no uploaded certificates are stored yet.",
      source: "Official record signal",
      status: setup.confirmations?.epcAcceptedForDemoReview ? "Accepted for review" : "Prepared",
      statusClass: "status-watch-text",
      search: "epc prepared review official record signal 57 butts accepted",
      why: "CMP recorded this because EPC context can help start the property file without being treated as legal verification.",
      nextAction: "Upload any certificates already held.",
      route: "evidence",
      actions: [
        makeActivityAction("Open Evidence Vault", "viewEvidence", true),
        makeActivityAction("Ask CMP", "askEpc")
      ]
    }
  ];
}

function newPropertyAskResponse(prompt = "", setup = newPropertySetup()) {
  const summary = newPropertyStatusSummary(setup);
  const lowerPrompt = prompt.toLowerCase();
  const remaining = [...summary.needsAnswer, ...summary.missingEvidence].slice(0, 4).join(", ");
  const gasUploaded = isNewPropertyEvidenceUploaded(setup, "gasSafety");
  const eicrUploaded = isNewPropertyEvidenceUploaded(setup, "eicr");

  if (lowerPrompt.includes("epc")) {
    return summary.findingsConfirmed
      ? "CMP saved the EPC-style record as a starting signal for this property. It helps setup, but it is not legal verification. Upload or confirm the actual certificate before relying on it."
      : "CMP found a likely EPC-style match for 57 The Butts with rating C, potential B, a February 2034 expiry and 92 m² floor area. Review before relying on this, then save it as a starting signal.";
  }

  if (lowerPrompt.includes("evidence") || lowerPrompt.includes("upload")) {
    if (gasUploaded && eicrUploaded) {
      return "Gas Safety and Electrical Safety / EICR evidence have been added to this property setup. CMP will not ask for the same certificates again unless they need review.";
    }
    if (gasUploaded) {
      return "Gas Safety evidence has been added to this property setup. CMP will not ask for the same certificate again unless it needs review.";
    }
    if (eicrUploaded) {
      return "Electrical Safety / EICR evidence has been added to this property setup. CMP can now update evidence confidence and reduce missing evidence prompts.";
    }
    return "No uploaded certificates are stored yet. You can upload Gas Safety or Electrical Safety/EICR documents during setup, and CMP will add anything useful to this property.";
  }

  if (lowerPrompt.includes("not know") || lowerPrompt.includes("confirm")) {
    return summary.findingsConfirmed
      ? `Smart search findings are saved. CMP still needs ${remaining || "the landlord-only answers"} before the property score is reliable.`
      : "CMP has matched the address, prepared EPC-style data and found local authority context. Save these findings, then CMP will only ask for information it could not find automatically.";
  }

  if (lowerPrompt.includes("found")) {
    return summary.findingsConfirmed
      ? "Smart search findings are saved. CMP still needs bedrooms, occupancy, Gas Safety relevance, EICR status and alarm answers before the property score is reliable."
      : "CMP has matched the address, prepared EPC-style data and found local authority context. Save these findings, then CMP will only ask for information it could not find automatically.";
  }

  return summary.findingsConfirmed
    ? "Smart search findings are saved. CMP still needs bedrooms, occupancy, safety evidence and alarm answers before the property score becomes reliable."
    : "CMP has matched the address, prepared EPC-style data and found local authority context. Save these findings, then CMP will only ask for information it could not find automatically.";
}

const iconPaths = {
  alert: '<path d="M10.3 3.2 2.7 16.4a1.7 1.7 0 0 0 1.5 2.6h15.2a1.7 1.7 0 0 0 1.5-2.6L13.3 3.2a1.7 1.7 0 0 0-3 0Z"/><path d="M12 8v5"/><path d="M12 16.5h.01"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"/><path d="M9 21v-4h3v4"/><path d="M8 7h1"/><path d="M12 7h1"/><path d="M8 11h1"/><path d="M12 11h1"/><path d="M20 21H2"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
  home: '<path d="m3 10.8 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
  more: '<path d="M12 12h.01"/><path d="M19 12h.01"/><path d="M5 12h.01"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  settings: '<path d="M12 2.75a2.1 2.1 0 0 0-2.05 1.65l-.22 1.01a7.45 7.45 0 0 0-1.38.8l-.98-.32a2.1 2.1 0 0 0-2.48.96L3.93 8.5a2.1 2.1 0 0 0 .42 2.62l.77.68a7.58 7.58 0 0 0 0 1.6l-.77.68a2.1 2.1 0 0 0-.42 2.62l.96 1.65a2.1 2.1 0 0 0 2.48.96l.98-.32c.43.31.9.58 1.38.8l.22 1.01A2.1 2.1 0 0 0 12 22.25h1.9a2.1 2.1 0 0 0 2.05-1.65l.22-1.01c.49-.22.95-.49 1.38-.8l.98.32a2.1 2.1 0 0 0 2.48-.96l.96-1.65a2.1 2.1 0 0 0-.42-2.62l-.77-.68a7.58 7.58 0 0 0 0-1.6l.77-.68a2.1 2.1 0 0 0 .42-2.62l-.96-1.65a2.1 2.1 0 0 0-2.48-.96l-.98.32a7.45 7.45 0 0 0-1.38-.8l-.22-1.01A2.1 2.1 0 0 0 13.9 2.75H12Z"/><circle cx="12.95" cy="12.6" r="3.15"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3.2 9.4-8 11-4.8-1.6-8-6-8-11V5l8-3Z"/><path d="m9 12 2 2 4-5"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'
};

const overviewPrompts = [
  "What should I fix first?",
  "Explain my current status",
  "What evidence am I missing?",
  "Is this property ready to let?"
];

const documentPrompts = [
  "What evidence am I missing?",
  "What should I upload next?",
  "How does document scanning work?",
  "Can CMP organise mixed paperwork?"
];

const compliancePrompts = [
  "What should I fix first?",
  "Is this property ready to let?",
  "What changes in the next 90 days?",
  "Why is licensing still checking?"
];

const timelinePrompts = [
  "What changed recently?",
  "What still needs attention?",
  "Summarise this property file",
  "Why is this event important?"
];

const servicesPrompts = [
  "What should I arrange first?",
  "Why is this being recommended?",
  "Can someone review my property file?",
  "What can CMP help with?"
];

const propertyPrompts = [
  "What details are still missing?",
  "Where did this information come from?",
  "Why does CMP need property details?",
  "What is Property Memory?"
];

const portfolioPrompts = [
  "Summarise my portfolio",
  "What should I do today?",
  "Which property needs attention?",
  "What evidence am I missing?"
];

const complianceCentrePrompts = [
  "What should I fix first?",
  "Which evidence is missing?",
  "What expires soon?",
  "Summarise my compliance position"
];

const evidenceVaultPrompts = [
  "What evidence is missing?",
  "Which documents are verified?",
  "How should I upload paperwork?",
  "Summarise my evidence vault"
];

const tasksPrompts = [
  "What should I do first?",
  "Why is this a task?",
  "Which tasks are evidence-related?",
  "What can I leave for later?"
];

const activityPrompts = [
  "What changed recently?",
  "What still needs attention?",
  "Summarise portfolio activity",
  "Why was this recorded?"
];

const globalAskPrompts = [
  "What should I do today?",
  "Which property needs attention?",
  "What evidence is missing?",
  "Explain this property file",
  "Summarise my portfolio",
  "What can wait until later?"
];

const emptyGlobalAskPrompts = [
  "How do I get started?",
  "What documents should I prepare?",
  "What information do I need to add a property?",
  "How does CMP help landlords?",
  "What happens after I add my first property?"
];

const globalServicePrompts = [
  "What should I book first?",
  "Why is this recommended?",
  "Can CMP help arrange it?",
  "What can wait until later?"
];

const addPropertyAddresses = [
  "Flat 42, 57 The Butts, Coventry, CV1 3BJ"
];

const portfolioFivePropertyDefinitions = [
  {
    id: "maple-court",
    address: "24 Maple Court",
    postcode: "B15 2QT",
    location: "Birmingham, B15 2QT",
    occupancy: "Currently tenanted",
    journey: "Full compliance",
    complianceScore: 100,
    evidenceScore: 100,
    focus: "Keep evidence current",
    focusArea: "Evidence-ready",
    state: "Evidence-ready",
    statusDetail: "All core checks and evidence recorded",
    priority: "Monitor renewal dates",
    priorityBody: "CMP has all core evidence for this property. Keep renewal reminders active and continue routine inspections.",
    serviceType: "review",
    verifiedEvidence: 8,
    reviewCount: 0,
    missingEvidence: [],
    recommendedService: "None needed",
    workspaceAvailable: false,
    mostUrgent: false,
    search: "24 maple court evidence ready all core evidence complete gas eicr epc alarms tenancy licensing inspection"
  },
  {
    id: "canal-view",
    address: "9 Canal View",
    postcode: "M4 6AG",
    location: "Manchester, M4 6AG",
    occupancy: "HMO / licensing review",
    journey: "Licensing review",
    complianceScore: 68,
    evidenceScore: 76,
    focus: "Licensing position",
    focusArea: "Local licensing",
    state: "Licensing unclear",
    statusDetail: "HMO/selective licensing answer unresolved",
    priority: "Confirm licensing route",
    priorityBody: "Evidence is decent, but CMP needs a property-specific licensing answer before treating this file as ready.",
    serviceType: "licensing",
    verifiedEvidence: 6,
    reviewCount: 3,
    missingEvidence: ["Licensing decision", "Occupancy evidence"],
    recommendedService: "Licensing review support",
    workspaceAvailable: false,
    mostUrgent: false,
    search: "9 canal view manchester hmo licensing selective local authority watch evidence decent compliance uncertain"
  },
  {
    id: "station-road",
    address: "3 Station Road",
    postcode: "CV2 4FN",
    location: "Coventry, CV2 4FN",
    occupancy: "New purchase review",
    journey: "New purchase review",
    complianceScore: 34,
    evidenceScore: 24,
    focus: "Onboarding essentials",
    focusArea: "New purchase setup",
    state: "Setup incomplete",
    statusDetail: "Core setup and evidence missing",
    priority: "Run A-Z onboarding check",
    priorityBody: "CMP needs tenancy setup, alarm answers, core certificates and initial evidence before this property can be treated as ready.",
    serviceType: "bundle",
    verifiedEvidence: 1,
    reviewCount: 7,
    missingEvidence: ["Gas Safety", "EICR", "Alarm evidence", "Tenancy setup", "Inspection record"],
    recommendedService: "Move-in readiness pack",
    workspaceAvailable: false,
    mostUrgent: false,
    search: "3 station road new purchase onboarding missing tenancy alarms certificates low evidence low compliance"
  }
];

function isEmptyPortfolioMode() {
  return labsState.portfolioMode === "empty";
}

function isNewPropertyMode() {
  return labsState.portfolioMode === "new";
}

function isTwoPropertyMode() {
  return labsState.portfolioMode === "two" || labsState.portfolioMode === "five";
}

function isFivePropertyMode() {
  return labsState.portfolioMode === "five";
}

function hasPortfolioProperties() {
  return !isEmptyPortfolioMode() && getPortfolioProperties().length > 0;
}

function newPropertyProfile() {
  const setup = newPropertySetup();
  const summary = newPropertyStatusSummary(setup);
  return {
    id: "the-butts",
    address: "57 The Butts",
    postcode: "CV1 3BJ",
    location: "Coventry, CV1 3BJ",
    label: "57 The Butts · CV1 3BJ",
    inbox: "57-the-butts@inbox.complymyproperty.co.uk",
    occupancy: setup.confirmations.occupancyConfirmed ? setup.landlordAnswers.occupancy : "Needs confirmation",
    journey: "New property setup",
    strength: summary.evidenceConfidenceScore,
    evidenceScore: summary.evidenceConfidenceScore,
    complianceScore: summary.readinessScore || 0,
    focus: summary.findingsConfirmed ? "Guided setup" : "Review smart search",
    focusArea: "Setup confirmation",
    state: summary.profileSetupLabel,
    statusDetail: summary.readinessLabel,
    priority: summary.primaryTaskTitle,
    priorityBody: summary.statusLine,
    serviceType: "review",
    verifiedEvidence: summary.evidenceConfidenceScore > 0 ? 1 : 0,
    reviewCount: summary.missingEvidence.length + summary.needsAnswer.length,
    missingEvidence: [...summary.needsAnswer, ...summary.missingEvidence],
    recommendedService: "Confirm details first",
    currentRequest: null,
    workspaceAvailable: true,
    mostUrgent: true,
    search: "57 the butts coventry cv1 new property setup address matched epc prepared confirm occupancy certificates"
  };
}

function buttsPortfolioProperty() {
  if (!hasJourneyPropertyBrainActivity() && isNewPropertyMode()) {
    return newPropertyProfile();
  }

  const eicrAdded = labsState.eicrAdded;
  const request = openSupportRequestForType(eicrAdded ? "inspection" : "eicr", "the-butts");

  return {
    id: "the-butts",
    address: "57 The Butts",
    postcode: "CV1 3BJ",
    location: "Coventry, CV1 3BJ",
    label: "57 The Butts · CV1 3BJ",
    inbox: "57-the-butts@inbox.complymyproperty.co.uk",
    occupancy: labsState.propertyDetails.occupancy,
    journey: labsState.propertyDetails.goal,
    strength: eicrAdded ? 58 : 42,
    evidenceScore: eicrAdded ? 58 : 42,
    complianceScore: eicrAdded ? 72 : 56,
    focus: eicrAdded ? "Inspection evidence" : "Electrical Safety evidence",
    focusArea: eicrAdded ? "Property inspection" : "Electrical Safety",
    state: eicrAdded ? "Useful next step" : "Needs checking",
    statusDetail: eicrAdded ? "2 areas still need review" : "3 areas need checking",
    priority: eicrAdded ? "Add inspection evidence" : "Upload or arrange EICR",
    priorityBody: eicrAdded
      ? "Electrical Safety evidence is now recorded. Add recent inspection evidence or arrange a property inspection."
      : "CMP could not find a current EICR. Upload an existing report or request help arranging one.",
    serviceType: eicrAdded ? "inspection" : "eicr",
    verifiedEvidence: eicrAdded ? 3 : 2,
    reviewCount: eicrAdded ? 2 : 3,
    missingEvidence: eicrAdded ? ["Inspection evidence"] : ["EICR", "Inspection evidence"],
    recommendedService: eicrAdded ? "Property inspection support" : "EICR support",
    currentRequest: request,
    workspaceAvailable: true,
    mostUrgent: !isTwoPropertyMode(),
    search: `57 the butts coventry cv1 vacant eicr electrical inspection ${labsState.propertyDetails.occupancy} ${labsState.propertyDetails.goal} ${request ? "open request support" : ""}`
  };
}

function willowPortfolioProperty() {
  const request = openSupportRequestForType("gas", "willow-brook");

  return {
    id: "willow-brook",
    address: "18 Willow Brook Drive",
    postcode: "B37 7BA",
    location: "Birmingham, B37 7BA",
    label: "18 Willow Brook Drive · B37 7BA",
    inbox: "18-willow-brook-drive@inbox.complymyproperty.co.uk",
    occupancy: "Currently tenanted",
    journey: "Tenanted property review",
    strength: 64,
    evidenceScore: 82,
    complianceScore: 74,
    focus: "Gas Safety renewal",
    focusArea: "Gas Safety",
    state: "Expiring soon",
    statusDetail: "Gas Safety renewal needed in 21 days",
    priority: "Book or upload Gas Safety renewal evidence",
    priorityBody: "Gas Safety evidence is approaching its renewal window. Upload the new certificate or request support arranging a check.",
    serviceType: "gas",
    verifiedEvidence: 3,
    reviewCount: 4,
    missingEvidence: ["Gas Safety renewal evidence", "Alarm evidence", "Inspection evidence", "Tenancy document evidence"],
    recommendedService: "Gas Safety support",
    currentRequest: request,
    workspaceAvailable: false,
    mostUrgent: isTwoPropertyMode(),
    nextRenewal: "Renewal needed in 21 days",
    search: `18 willow brook drive birmingham b37 gas safety renewal expiring soon tenanted inspection alarms licensing ${request ? "open request support" : ""}`
  };
}

function getPortfolioProperties() {
  if (isEmptyPortfolioMode()) {
    return [];
  }

  if (isNewPropertyMode()) {
    return [newPropertyProfile()];
  }

  const properties = [buttsPortfolioProperty()];
  if (isTwoPropertyMode()) {
    properties.push(willowPortfolioProperty());
  }
  if (isFivePropertyMode()) {
    properties.push(...portfolioFivePropertyDefinitions.map((property) => ({ ...property })));
  }
  return properties;
}

function getPortfolioPropertyById(propertyId = "the-butts") {
  return getPortfolioProperties().find((property) => property.id === propertyId) || getPortfolioProperties()[0] || buttsPortfolioProperty();
}

function normaliseDemoState(value) {
  const state = String(value || "").trim().toLowerCase();
  const aliases = {
    empty: "empty-portfolio",
    "empty-portfolio": "empty-portfolio",
    portfolio: "two-property",
    "portfolio-demo": "two-property",
    "two-property": "two-property",
    "new-property": "new-property",
    "new property": "new-property",
    new: "new-property",
    "one-property": "one-property",
    single: "one-property",
    "single-property": "one-property",
    starter: "one-property",
    "starter-portfolio": "starter-portfolio",
    reset: "reset",
    "before-eicr": "before-eicr",
    "after-eicr": "after-eicr",
    "after-support": "after-support",
    "after-quick-win": "after-quick-win",
    "five-property": "five-property"
  };

  return aliases[state] || "before-eicr";
}

function initialDemoStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestedState = params.get("state");

  if (requestedState) {
    return normaliseDemoState(requestedState);
  }

  if (params.get("fresh") === "1") {
    return "empty-portfolio";
  }

  return null;
}

function selectedServicePropertyId() {
  if (!isTwoPropertyMode()) {
    return "the-butts";
  }

  if (labsState.selectedServicePropertyId === "all") {
    return "all";
  }

  return labsState.selectedServicePropertyId === "willow-brook" ? "willow-brook" : "the-butts";
}

function isAllServicePropertiesMode() {
  return isTwoPropertyMode() && selectedServicePropertyId() === "all";
}

function serviceActionPropertyId() {
  if (isEmptyPortfolioMode()) {
    return "the-butts";
  }

  return isAllServicePropertiesMode() ? portfolioUrgentProperty().id : selectedServicePropertyId();
}

function selectedServiceProperty() {
  if (isAllServicePropertiesMode()) {
    return portfolioUrgentProperty();
  }

  return getPortfolioPropertyById(selectedServicePropertyId());
}

function requestPropertyId(request) {
  return request?.propertyId || "the-butts";
}

function propertyLabelForId(propertyId = "the-butts") {
  return getPortfolioPropertyById(propertyId).label;
}

function propertyLocationForId(propertyId = "the-butts") {
  return getPortfolioPropertyById(propertyId).location;
}

function openRequestCountForProperty(propertyId) {
  return labsState.serviceRequests.filter((request) => request.status !== "Cancelled" && requestPropertyId(request) === propertyId).length;
}

function openRequestsForProperty(propertyId) {
  return labsState.serviceRequests.filter((request) => request.status !== "Cancelled" && requestPropertyId(request) === propertyId);
}

function portfolioUrgentProperty() {
  return getPortfolioProperties().find((property) => property.mostUrgent) || getPortfolioProperties()[0];
}

function averageScore(properties, key) {
  if (!properties.length) {
    return 0;
  }

  return Math.round(properties.reduce((sum, property) => sum + effectivePropertyScore(property, key), 0) / properties.length);
}

function portfolioComplianceScore() {
  return clampScore(averageScore(getPortfolioProperties(), "complianceScore") + checkerScoreBoost("portfolio").compliance);
}

function portfolioEvidenceScore() {
  return clampScore(averageScore(getPortfolioProperties(), "evidenceScore") + checkerScoreBoost("portfolio").evidence);
}

function portfolioEvidenceGapCount() {
  return getPortfolioProperties().reduce((sum, property) => sum + (property.missingEvidence?.length || 0), 0);
}

function portfolioUrgentActionCount() {
  return getPortfolioProperties().filter((property) => property.mostUrgent || property.state === "Expiring soon" || property.complianceScore < 60).length;
}

function fullyCompliantProperties() {
  return getPortfolioProperties().filter((property) => effectivePropertyScore(property, "complianceScore") === 100 && effectivePropertyScore(property, "evidenceScore") === 100);
}

function clampScore(value) {
  return Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
}

function checkerScoreBoost(scope = checkerScopeKey()) {
  return labsState.checkerScoreBoosts[scope] || { compliance: 0, evidence: 0 };
}

function effectivePropertyScore(property, key) {
  const base = Number(property[key] || property.strength || 0);
  const boost = checkerScoreBoost(property.id);
  const lift = key === "evidenceScore" ? boost.evidence : boost.compliance;
  return clampScore(base + lift);
}

function effectiveComplianceScore(property) {
  return effectivePropertyScore(property, "complianceScore");
}

function effectiveEvidenceScore(property) {
  return effectivePropertyScore(property, "evidenceScore");
}

function scoreClass(score) {
  if (score >= 85) {
    return "is-good";
  }
  if (score >= 60) {
    return "is-watch";
  }
  return "is-risk";
}

function renderScoreCards(container, scores, { compact = false } = {}) {
  if (!container) {
    return;
  }

  container.innerHTML = scores.map((score) => `
    <article class="score-card ${scoreClass(score.value)}${compact ? " is-compact" : ""}">
      <div>
        <span>${escapeHtml(score.label)}</span>
        <strong>${score.value}%</strong>
      </div>
      <div class="score-meter" aria-hidden="true"><span style="width: ${score.value}%"></span></div>
      <small>${escapeHtml(score.help)}</small>
    </article>
  `).join("");
}

function renderGlobalScoreSurfaces() {
  const properties = getPortfolioProperties();
  const compliance = portfolioComplianceScore();
  const evidence = portfolioEvidenceScore();
  const portfolioScores = [
    {
      label: "Portfolio compliance score",
      value: compliance,
      help: "Readiness against required checks and scenario answers."
    },
    {
      label: "Portfolio evidence score",
      value: evidence,
      help: "Documents and proof currently stored in CMP."
    }
  ];

  renderScoreCards(document.querySelector("[data-home-score-grid]"), portfolioScores);
  renderScoreCards(document.querySelector("[data-properties-score-grid]"), portfolioScores);
  renderScoreCards(document.querySelector("[data-compliance-score-grid]"), portfolioScores);

  if (hasJourneyPropertyBrainActivity()) {
    renderScoreCards(document.querySelector("[data-compliance-score-grid]"), journeyScoreCards(), { compact: true });
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const newPropertyScores = [
      {
        label: "Profile setup",
        value: summary.profileSetupScore,
        help: summary.profileSetupHelp
      },
      {
        label: "Evidence confidence",
        value: summary.evidenceConfidenceScore,
        help: summary.evidenceConfidenceHelp
      }
    ];
    renderScoreCards(document.querySelector("[data-home-score-grid]"), newPropertyScores);
    renderScoreCards(document.querySelector("[data-properties-score-grid]"), newPropertyScores);
    renderScoreCards(document.querySelector("[data-compliance-score-grid]"), newPropertyScores);
    return;
  }

  if (!properties.length) {
    renderScoreCards(document.querySelector("[data-home-score-grid]"), [
      { label: "Portfolio compliance score", value: 0, help: "Add a property to begin scoring." },
      { label: "Portfolio evidence score", value: 0, help: "Upload evidence once a property exists." }
    ]);
  }
}

const utilityAskPromptMeta = {
  "How do I get started?": {
    category: "Setup",
    helper: "Start with the first property workflow."
  },
  "What documents should I prepare?": {
    category: "Documents",
    helper: "See which paperwork is useful after setup."
  },
  "What information do I need to add a property?": {
    category: "Property setup",
    helper: "Prepare the address and basic property details."
  },
  "How does CMP help landlords?": {
    category: "CMP",
    helper: "Understand checks, evidence, tasks and support."
  },
  "What happens after I add my first property?": {
    category: "Next",
    helper: "Preview the workspace CMP will build."
  },
  "What should I do today?": {
    category: "Today",
    helper: "Get the next useful action for the active property."
  },
  "Which property needs attention?": {
    category: "Portfolio",
    helper: "See where CMP would focus first."
  },
  "What evidence is missing?": {
    category: "Evidence",
    helper: "Review certificate and document gaps."
  },
  "Explain this property file": {
    category: "Property file",
    helper: "Summarise what CMP knows and why."
  },
  "Summarise my portfolio": {
    category: "Summary",
    helper: "Turn portfolio status into plain English."
  },
  "What can wait until later?": {
    category: "Priorities",
    helper: "Separate urgent gaps from watch items."
  },
  "What did CMP find automatically?": {
    category: "Found",
    helper: "Review the first signals CMP matched."
  },
  "What should I confirm first?": {
    category: "Setup",
    helper: "Prioritise the next property details."
  },
  "What evidence should I upload next?": {
    category: "Evidence",
    helper: "See which certificates matter first."
  },
  "Is the EPC okay?": {
    category: "EPC",
    helper: "Understand the imported EPC context."
  },
  "What does CMP still not know?": {
    category: "Unknowns",
    helper: "See what needs landlord confirmation."
  }
};

const newPropertyAskPrompts = [
  "What did CMP find automatically?",
  "What should I confirm first?",
  "What evidence should I upload next?",
  "Is the EPC okay?",
  "What does CMP still not know?"
];

function currentGlobalAskPrompts() {
  if (isEmptyPortfolioMode()) {
    return emptyGlobalAskPrompts;
  }

  if (isNewPropertyMode()) {
    return newPropertyAskPrompts;
  }

  return globalAskPrompts;
}

const learnPrompts = [
  "Explain EICR",
  "What evidence should I keep?",
  "What should I check before letting?",
  "Explain local licensing"
];

const settingsPrompts = [
  "What can CMP notify me about?",
  "What data does CMP use?",
  "How does demo reset work?",
  "What is compact mode?"
];

const propertiesPrompts = [
  "Which property needs attention?",
  "Summarise my properties",
  "What should I open first?",
  "How do I add another property?"
];

const roomLabels = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  living: "Living room",
  bedroom1: "Bedroom 1",
  bedroom2: "Bedroom 2",
  bedroom3: "Bedroom 3",
  hallway: "Hallway and stairs",
  external: "External areas"
};

const occupancyScenarioMap = {
  "Vacant property": "vacant",
  "Ready to let": "ready",
  "Currently tenanted": "tenanted",
  "New purchase review": "purchase"
};

const optionalDetailLabels = {
  constructionYear: "Construction year or approximate age",
  heatingType: "Heating type",
  storeys: "Number of storeys",
  parkingAccess: "Parking or access notes",
  managingAgent: "Managing agent details",
  emergencyAccess: "Emergency access notes"
};

const scenarioContent = {
  vacant: {
    title: "Keep the property secure and ready",
    body: "Focus on core evidence, inspection records and anything that could delay the next tenancy.",
    priorities: ["Add EICR evidence", "Confirm inspection status", "Review local licensing position"]
  },
  ready: {
    title: "Prepare the property for advertising and move-in",
    body: "Review the essential checks, organise the evidence pack and identify anything that could delay a new tenancy.",
    priorities: ["Confirm alarms have been tested", "Review EICR evidence", "Prepare tenancy documents"]
  },
  tenanted: {
    title: "Keep the tenancy safely on track",
    body: "Monitor upcoming dates, confirm evidence has been stored and stay ahead of renewal windows.",
    priorities: ["Review the next 90 days", "Check tenant-facing evidence", "Confirm inspection schedule"]
  },
  purchase: {
    title: "Understand the property before you proceed",
    body: "Use the property file to identify missing records, possible setup work and useful questions for the seller or agent.",
    priorities: ["Check available EPC information", "Request certificates", "Review local licensing position"]
  }
};

const whatIfContent = {
  let: {
    title: "Before a new tenancy",
    body: "CMP would prioritise your EICR evidence, alarm-test confirmation and tenancy-document checklist before move-in.",
    steps: ["Review Electrical Safety", "Confirm alarm testing", "Prepare tenancy evidence"]
  },
  hmo: {
    title: "Household change worth reviewing",
    body: "CMP would ask additional questions about occupancy, property setup and local licensing before suggesting the next steps.",
    steps: ["Review occupancy details", "Check licensing position", "Ask CMP for guidance"]
  },
  advertising: {
    title: "Get the property file ready",
    body: "CMP would organise the known evidence, show any missing items and help you prepare a clear checklist before advertising.",
    steps: ["Review evidence gaps", "Prepare the evidence pack", "Check move-in questions"]
  },
  vacant: {
    title: "Keep the property ready",
    body: "CMP would continue monitoring evidence gaps, inspection records and any local issues worth reviewing before the next tenancy.",
    steps: ["Monitor evidence gaps", "Confirm inspection status", "Review licensing position"]
  }
};

const assistantResponses = {
  "What should I fix first?": "Your most useful next step is to check whether you have a current EICR. Your EPC and Gas Safety evidence are already recorded.",
  "Explain my current status": "This property file is partly built. EPC and Gas Safety are in a good state, alarms are landlord-confirmed, and Electrical Safety still needs evidence.",
  "What evidence am I missing?": "Your most useful missing document is currently an EICR. You can upload an existing report, enter the details manually or arrange an inspection.",
  "Is this property ready to let?": "Not yet. CMP would first need Electrical Safety evidence and a stronger alarm record before this property can be treated as ready.",
  "What should I upload next?": "Upload an EICR first. It is the highest-value missing evidence item for this property file.",
  "How does document scanning work?": "In this demo, CMP simulates reading document names, identifying the type, extracting useful dates and matching the paperwork to 57 The Butts.",
  "Can CMP organise mixed paperwork?": "Yes, the future workflow is designed for mixed paperwork. CMP would group certificates, tenancy documents and unclear files for review.",
  "What changes in the next 90 days?": "There are no confirmed urgent deadlines this week. CMP recommends reviewing inspection evidence and preparing for the Gas Safety renewal window.",
  "Why is licensing still checking?": "Local licensing requirements can vary by area and property setup. CMP is showing this as a review item until the position is confirmed.",
  "What changed recently?": "CMP verified your Gas Safety evidence and identified Electrical Safety as the clearest remaining evidence gap.",
  "What still needs attention?": "The clearest next step is to add or arrange an EICR. Local licensing and inspection evidence also remain under review.",
  "Summarise this property file": "CMP has official EPC information, verified Gas Safety evidence and a landlord-confirmed alarm answer. The timeline records each source so you can see how the property file developed.",
  "Why is this event important?": "Timeline events help explain where each status came from, what changed and which evidence still needs attention.",
  "What should I arrange first?": "Electrical Safety is your clearest unresolved evidence area. You can upload an existing EICR or request help arranging an inspection.",
  "Why is this being recommended?": "CMP is recommending EICR support because there is no current Electrical Safety evidence stored against this property.",
  "Can someone review my property file?": "Yes. CMP can record a request for a human review of the evidence and next steps shown in this prototype.",
  "What can CMP help with?": "CMP can help organise evidence, explain the next priority and record a support request when you want help arranging the next step.",
  "What details are still missing?": "CMP already has the address, postcode, property type, bedroom count and occupancy status. Optional details such as heating type, property age and access notes can be added later.",
  "Where did this information come from?": "CMP separates matched records, uploaded evidence and landlord-provided details so you can see why each item appears in the property file.",
  "Why does CMP need property details?": "Property details help CMP ask more relevant questions, organise the right evidence and adapt the workspace to the property situation.",
  "What is Property Memory?": "Property Memory is a CMP Labs concept for keeping room-by-room observations and follow-up notes connected to the property file."
};

const postEicrAssistantMessage = "Your EICR has been verified and your property file is stronger. The next useful step is to review your latest inspection record.";

const postEicrAssistantResponses = {
  "What should I fix first?": postEicrAssistantMessage,
  "What evidence am I missing?": postEicrAssistantMessage,
  "What should I upload next?": postEicrAssistantMessage,
  "What changed recently?": "CMP verified your EICR and updated the property file. Inspection evidence is now the most useful next upload.",
  "What still needs attention?": "Electrical Safety evidence is now recorded. CMP still recommends reviewing local licensing and adding inspection evidence.",
  "What should I arrange first?": "Your EICR is recorded. The next useful improvement is your latest property inspection record.",
  "Why is this being recommended?": "CMP is recommending an inspection review because Electrical Safety evidence is now recorded and inspection evidence is the next useful gap."
};

const portfolioAssistantResponses = {
  "Summarise my portfolio": "You currently have one property in CMP. EPC and Gas Safety evidence are recorded for 57 The Butts. Electrical Safety is the clearest area to check next.",
  "What should I do today?": "The most useful action today is to check whether 57 The Butts has a current EICR. You can upload an existing report or ask CMP to help arrange an inspection.",
  "Which property needs attention?": "57 The Butts is the only property in this Labs portfolio. Its clearest remaining gap is Electrical Safety evidence.",
  "What evidence am I missing?": "CMP has EPC and Gas Safety evidence. The clearest missing item is an EICR. Inspection evidence can also be added when available.",
  "Ask CMP why this matters": "Electrical Safety evidence helps CMP understand whether this property file is ready for the next tenancy steps. Upload an existing EICR or request help arranging an inspection.",
  "Ask CMP what I need": "Your most useful missing item is your latest property inspection record. Add evidence if an inspection has been completed, or confirm that it has not yet been carried out."
};

const portfolioPostEicrAssistantResponses = {
  "Summarise my portfolio": "You currently have one property in CMP. EPC, Gas Safety and EICR evidence are recorded for 57 The Butts. Inspection evidence is the next useful item to add.",
  "What should I do today?": "Your EICR is recorded. The next useful step is to add recent inspection evidence or arrange a property inspection.",
  "Which property needs attention?": "57 The Butts is still the active property. Electrical Safety evidence is now verified, so inspection evidence is the next useful focus.",
  "What evidence am I missing?": "CMP has EPC, Gas Safety and EICR evidence. The next useful upload is a recent property-inspection record.",
  "Ask CMP why this matters": "Your EICR is now verified. The next useful step is to review your latest inspection record so CMP can keep the property file current.",
  "Ask CMP what I need": "Your most useful missing item is your latest property inspection record. Add evidence if an inspection has been completed, or confirm that it has not yet been carried out."
};

const complianceCentreAssistantResponses = {
  "What should I fix first?": "Your clearest next step is 57 The Butts. Electrical Safety evidence is missing, while EPC and Gas Safety are already recorded.",
  "Which evidence is missing?": "The clearest missing evidence is an EICR for 57 The Butts. Inspection evidence and local licensing are also still worth reviewing.",
  "What expires soon?": "There are no confirmed urgent deadlines this week. CMP recommends reviewing inspection status in 34 days and planning the Gas Safety renewal window in 71 days.",
  "Summarise my compliance position": "CMP has one monitored property. EPC and Gas Safety evidence are recorded, while EICR, inspection evidence and licensing review still need attention."
};

const complianceCentrePostEicrAssistantResponses = {
  "What should I fix first?": "Your EICR is now recorded. The next useful compliance improvement is inspection evidence and local licensing review.",
  "Which evidence is missing?": "CMP has EPC, Gas Safety and EICR evidence. The next useful evidence item is a recent property-inspection record.",
  "What expires soon?": "There are no confirmed urgent deadlines this week. CMP recommends confirming inspection status in 34 days and planning the Gas Safety renewal window in 71 days.",
  "Summarise my compliance position": "CMP has EPC, Gas Safety and EICR evidence for 57 The Butts. Inspection evidence and local licensing review are now the most useful follow-up items."
};

const evidenceVaultAssistantResponses = {
  "What evidence is missing?": "CMP has EPC and Gas Safety evidence for 57 The Butts. The clearest missing item is an EICR, with inspection evidence also still useful to add.",
  "Which documents are verified?": "EPC is confirmed from an official record. Gas Safety is verified from an uploaded document. After the EICR is added, Electrical Safety also becomes verified from an uploaded document.",
  "How should I upload paperwork?": "You can forward paperwork to the Evidence Inbox or use Smart Upload. CMP Labs will simulate classifying and linking it to the correct property.",
  "Summarise my evidence vault": "Your portfolio evidence vault contains two verified items and one key missing certificate for 57 The Butts."
};

const evidenceVaultPostEicrAssistantResponses = {
  "What evidence is missing?": "CMP has EPC, Gas Safety and EICR evidence for 57 The Butts. The next useful upload is a recent property-inspection record.",
  "Which documents are verified?": "EPC is confirmed from an official record. Gas Safety is verified from an uploaded document. Electrical Safety is also verified from an uploaded document.",
  "How should I upload paperwork?": "You can forward paperwork to the Evidence Inbox or use Smart Upload. CMP Labs will simulate classifying and linking it to the correct property.",
  "Summarise my evidence vault": "Your portfolio evidence vault contains three verified evidence items for 57 The Butts. Inspection evidence is now the main useful next upload."
};

const tasksAssistantResponses = {
  "What should I do first?": "Your first task is to upload or arrange an EICR for 57 The Butts. Electrical Safety is the clearest missing evidence area.",
  "Why is this a task?": "CMP creates tasks from missing evidence, compliance checks, upcoming reviews and support requests so you can act without reading every section manually.",
  "Which tasks are evidence-related?": "The evidence-related tasks are EICR and inspection evidence for 57 The Butts.",
  "What can I leave for later?": "Licensing is still under review, so it can be monitored unless you need to let or alter the property soon. Inspection evidence is the more useful next action."
};

const tasksPostEicrAssistantResponses = {
  "What should I do first?": "Your EICR is now verified. The next useful task is to add inspection evidence or record that no recent inspection has been completed.",
  "Why is this a task?": "CMP creates tasks from missing evidence, compliance checks, upcoming reviews and support requests so you can act without reading every section manually.",
  "Which tasks are evidence-related?": "The main evidence-related task is inspection evidence for 57 The Butts.",
  "What can I leave for later?": "Licensing is still under review, so it can be monitored unless you need to let or alter the property soon. Inspection evidence is the more useful next action."
};

const activityAssistantResponses = {
  "What changed recently?": "CMP recently verified Gas Safety evidence and identified Electrical Safety evidence as the clearest gap for 57 The Butts.",
  "What still needs attention?": "Electrical Safety evidence still needs attention. Inspection evidence and licensing review are also worth monitoring.",
  "Summarise portfolio activity": "The portfolio activity feed shows imported records, uploaded evidence, landlord answers, task changes and support events for 57 The Butts.",
  "Why was this recorded?": "CMP records activity so landlords can understand what changed, when it changed and which property file was affected."
};

const activityPostEicrAssistantResponses = {
  "What changed recently?": "Your EICR was verified and the Electrical Safety item moved to evidence accepted. The next useful item is inspection evidence.",
  "What still needs attention?": "Inspection evidence is now the main useful upload. Licensing review is still in progress.",
  "Summarise portfolio activity": "The portfolio activity feed shows imported records, uploaded evidence, landlord answers, task changes and support events for 57 The Butts.",
  "Why was this recorded?": "CMP records activity so landlords can understand what changed, when it changed and which property file was affected."
};

const propertiesAssistantResponses = {
  "Which property needs attention?": "57 The Butts needs attention because Electrical Safety evidence is still missing. Open the workspace or upload an existing EICR.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review the Electrical Safety action. That is the clearest evidence gap.",
  "How do I add another property?": "Use Add property to preview the future onboarding flow: postcode entry, address selection, EPC import and workspace creation."
};

const propertiesPostEicrAssistantResponses = {
  "Which property needs attention?": "57 The Butts is still the active property. Electrical Safety evidence is now recorded, so inspection evidence is the next useful focus.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review inspection evidence. It is now the next useful item.",
  "How do I add another property?": "Use Add property to preview the future onboarding flow: postcode entry, address selection, EPC import and workspace creation."
};

const learnAssistantResponses = {
  "Explain EICR": "An EICR records the condition of a property's fixed electrical installation. In CMP, it appears as Electrical Safety evidence.",
  "What evidence should I keep?": "Keep core certificates, uploaded documents, landlord answers, inspection records and activity history together so each property file has a clear source trail.",
  "What should I check before letting?": "Before letting, review Electrical Safety, Gas Safety, EPC, alarm testing, tenancy documents, inspection evidence and any local licensing questions.",
  "Explain local licensing": "Local licensing rules can vary by council area and property setup. CMP shows it as checking until the position is confirmed."
};

const settingsAssistantResponses = {
  "What can CMP notify me about?": "CMP could notify you about compliance reminders, evidence expiry alerts, support request updates and weekly portfolio summaries.",
  "What data does CMP use?": "This demo uses local prototype state. A live CMP account would use secure account storage and database-backed property records.",
  "How does demo reset work?": "Reset demo returns the walkthrough to the initial pre-EICR state without connecting to any backend.",
  "What is compact mode?": "Compact mode reduces spacing so repeated cards and lists feel tighter during demos."
};

const guidePreviews = [
  {
    title: "What is an EICR?",
    category: "Electrical Safety",
    summary: "A short guide to Electrical Installation Condition Reports and why CMP treats them as core evidence.",
    preview: "An EICR records the condition of fixed electrical installations. CMP uses it to decide whether Electrical Safety evidence is recorded or still needs attention."
  },
  {
    title: "What documents should a landlord keep?",
    category: "Evidence",
    summary: "A practical overview of certificates, records and useful supporting documents.",
    preview: "Landlords usually benefit from keeping certificates, inspection notes, tenancy documents, landlord answers and support history together in one property file."
  },
  {
    title: "How often should I review property inspections?",
    category: "Inspections",
    summary: "How CMP thinks about inspection evidence as a useful follow-up record.",
    preview: "Inspection records help explain what was checked, when it was checked and whether any follow-up action was needed. CMP treats them as useful evidence to add when available."
  },
  {
    title: "What does local licensing mean?",
    category: "Licensing",
    summary: "A plain-English introduction to why licensing can depend on area and property setup.",
    preview: "Local licensing can depend on council rules, property type and occupancy. CMP keeps it visible as a review item until the position is confirmed."
  },
  {
    title: "What should I prepare before a new tenancy?",
    category: "Tenancy readiness",
    summary: "A short checklist-style preview for evidence, checks and paperwork before move-in.",
    preview: "Before a new tenancy, CMP would help review core certificates, alarm testing, inspection records, tenancy documents and any local licensing questions."
  },
  {
    title: "How CMP organises evidence",
    category: "CMP workflow",
    summary: "How records, uploads, landlord answers and activity history fit together.",
    preview: "CMP separates official records, uploaded evidence, landlord answers and support activity so each property status has a visible source."
  }
];

const defaultAssistantResponse = "CMP can organise evidence, identify gaps and suggest the next useful action for this property.";

function formatControlledAssistantResponse(message) {
  const response = (message || defaultAssistantResponse).trim();

  if (response.startsWith("Summary:")) {
    return response;
  }

  return [
    `Summary: ${response}`,
    "Based on: Simulated demo data from the local property record, Evidence Vault, Compliance Centre, tasks and service basket.",
    "What this means: Treat this as source-backed prototype guidance for prioritising review, evidence and support steps.",
    "Suggested next action: Check the linked evidence or action before booking, uploading or deferring anything.",
    "Limits: Prototype mode only. No live lookup performed and this is not legal advice."
  ].join("\n\n");
}

const scanStages = [
  "Reading documents...",
  "Identifying document types...",
  "Extracting useful details...",
  "Matching paperwork to 57 The Butts...",
  "Ready for your review"
];

function hydrateIcons() {
  document.querySelectorAll("[data-icon]").forEach((icon) => {
    const path = iconPaths[icon.dataset.icon];

    if (!path) {
      return;
    }

    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  });
}

function showToast(message) {
  const region = document.querySelector("[data-toast-region]");

  if (!region || !message) {
    return;
  }

  region.querySelectorAll(".toast").forEach((existingToast) => existingToast.remove());

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setAssistantResponse(message) {
  const response = document.querySelector("[data-assistant-response] p");

  if (response) {
    response.textContent = formatControlledAssistantResponse(message);
  }
}

let assistantFeedbackTimer = null;

function flashAssistantResponse(label = "Assistant updated") {
  const assistantCard = document.querySelector("[data-assistant-response]");
  const assistantLabel = document.querySelector("[data-assistant-update-label]");
  const homeLabel = document.querySelector("[data-home-assistant-status]");
  const utilityCard = document.querySelector("[data-utility-ask-response]")?.closest(".utility-response-card");
  const chatPanel = document.querySelector(".ask-chat-panel");
  const highlightTargets = [assistantCard, utilityCard, chatPanel].filter(Boolean);

  highlightTargets.forEach((target) => target.classList.add("is-updated"));

  [assistantLabel, homeLabel].forEach((statusLabel) => {
    if (!statusLabel) {
      return;
    }

    statusLabel.textContent = label;
    statusLabel.hidden = false;
  });

  window.clearTimeout(assistantFeedbackTimer);
  assistantFeedbackTimer = window.setTimeout(() => {
    highlightTargets.forEach((target) => target.classList.remove("is-updated"));
    [assistantLabel, homeLabel].forEach((statusLabel) => {
      if (statusLabel) {
        statusLabel.hidden = true;
      }
    });
  }, 1600);
}

function renderAssistantActivity() {
  const list = document.querySelector("[data-assistant-activity]");

  if (!list) {
    return;
  }

  list.innerHTML = getRecentActivityItems()
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function getRecentActivityItems() {
  if (isEmptyPortfolioMode()) {
    return ["No property activity yet", "A-Z setup path ready", "Evidence upload available after setup"];
  }

  if (isNewPropertyMode()) {
    return ["Property profile created", "Address matched for 57 The Butts", "EPC record prepared for review"];
  }

  const dynamicItems = [...labsState.serviceEvents, ...labsState.propertyEvents]
    .filter((event) => event.activityLabel)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((event) => event.activityLabel);
  const baseItems = [
    ...(isTwoPropertyMode() ? ["Gas Safety renewal flagged for 18 Willow Brook Drive"] : []),
    labsState.eicrAdded ? "EICR evidence verified" : "EICR gap identified",
    "Gas Safety certificate verified",
    "EPC record imported"
  ];

  return [...dynamicItems, ...baseItems]
    .filter(Boolean)
    .slice(0, 3);
}

function openPropertyFromPortfolio(propertyId = "the-butts") {
  if (isEmptyPortfolioMode()) {
    openPropertyWorkspace("overview");
    return;
  }

  if (isNewPropertyMode()) {
    openPropertyWorkspace("overview");
    return;
  }

  if (propertyId !== "the-butts") {
    const property = getPortfolioPropertyById(propertyId);
    openTimelineModal("[data-second-property-modal]");
    setAssistantResponse(`${property.address} is shown as a portfolio-level preview in CMP Labs. Use Properties, Compliance Centre, Evidence Vault and Book a Service to review its scores and actions while the full workspace remains focused on 57 The Butts.`);
    return;
  }

  openPropertyWorkspace("overview");
}

function renderSidebarProperties() {
  const list = document.querySelector("[data-sidebar-property-list]");

  if (!list) {
    return;
  }

  const properties = getPortfolioProperties();
  if (!properties.length) {
    list.innerHTML = `
      <article class="sidebar-empty-state">
        <strong>No properties yet</strong>
        <small>Add a property to start building compliance and evidence scores.</small>
      </article>
    `;
    return;
  }

  list.innerHTML = properties.map((property) => `
    <button class="property-option${property.id === "the-butts" ? " is-current" : ""}" type="button" data-open-property-id="${escapeHtml(property.id)}">
      <span class="status-dot" aria-hidden="true"></span>
      <span>
        <strong>${escapeHtml(property.address)}</strong>
        <small>${escapeHtml(property.location)}</small>
      </span>
      <em class="sidebar-property-count">${property.complianceScore === 100 ? "Compliant" : escapeHtml(property.focusArea)}</em>
    </button>
  `).join("");
}

function renderOverviewRecentActivity() {
  const list = document.querySelector("[data-recent-activity]");

  if (!list) {
    return;
  }

  const heading = list.closest(".small-card")?.querySelector("h2");
  const items = labsState.eicrAdded
    ? [
        "Gas Safety evidence was verified",
        "Electrical Safety evidence was added",
        "Inspection evidence is now your next useful upload"
      ]
    : [
        "Gas Safety evidence was verified",
        "Electrical Safety is now your highest-priority gap"
      ];

  if (heading) {
    heading.textContent = `${items.length} updates since your last visit`;
  }

  list.innerHTML = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function renderOverviewNextAction() {
  const card = document.querySelector("[data-next-best-step]");

  if (!card) {
    return;
  }

  card.innerHTML = labsState.eicrAdded
    ? `
      <div>
        <p class="section-kicker">Your next best step</p>
        <h2>Add recent property inspection evidence</h2>
        <p>Electrical Safety evidence is now recorded. The next useful improvement is your latest property inspection record.</p>
      </div>
      <div class="action-controls">
        <button class="primary-button" type="button" data-global-service-action="uploadInspection">Upload inspection evidence</button>
        <button class="secondary-button" type="button" data-toast="Inspection status recorded locally for this walkthrough.">Mark as not yet completed</button>
        <button class="text-button" type="button" data-assistant-message="Your EICR is now verified. The next useful improvement is inspection evidence, because it helps keep the property file current.">Ask CMP why this matters</button>
      </div>
    `
    : `
      <div>
        <p class="section-kicker">Your next best step</p>
        <h2>Check whether this property has a current EICR</h2>
        <p>Electrical safety is the highest-priority unknown area in this property file.</p>
      </div>
      <div class="action-controls">
        <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
        <button class="secondary-button" type="button" data-toast="Preview only — manual certificate entry is not connected in this demo.">Enter details manually</button>
        <button class="secondary-button" type="button" data-open-global-service>Arrange an EICR</button>
        <button class="text-button" type="button" data-assistant-message="Electrical safety is treated as a priority because a valid EICR is core evidence before a property is let.">Ask CMP why this matters</button>
      </div>
    `;
}

function renderOverviewState() {
  updateStrength(labsState.eicrAdded ? 58 : 42);
  renderOverviewRecentActivity();
  renderOverviewNextAction();

  const tile = document.querySelector("[data-electrical-tile]");
  const tileIcon = tile?.querySelector("[data-icon]");
  if (tile) {
    tile.classList.toggle("status-good", labsState.eicrAdded);
    tile.classList.toggle("status-review", !labsState.eicrAdded);
    tile.classList.remove("status-watch", "status-neutral");
  }
  if (tileIcon) {
    tileIcon.dataset.icon = labsState.eicrAdded ? "shield" : "alert";
  }

  document.querySelector("[data-electrical-status]").textContent = labsState.eicrAdded ? "Verified" : "Needs checking";
  document.querySelector("[data-electrical-source]").textContent = labsState.eicrAdded ? "Uploaded document" : "No EICR evidence";
}

function renderDocumentsState() {
  document.querySelector("[data-verified-count]").textContent = labsState.eicrAdded ? "3 documents" : "2 documents";
  document.querySelector("[data-review-count]").textContent = labsState.eicrAdded ? "0 documents" : "1 document";
  document.querySelector("[data-next-upload]").textContent = labsState.eicrAdded ? "Inspection evidence" : "EICR";
  document.querySelector("[data-next-upload-note]").textContent = labsState.eicrAdded ? "Latest inspection record is the next useful item" : "Electrical Safety is still unverified";
  document.querySelector("[data-vault-state]").textContent = labsState.eicrAdded ? "3 verified, 0 missing" : "2 verified, 1 missing";

  document.querySelector("[data-eicr-source]").textContent = labsState.eicrAdded ? "Uploaded document" : "No evidence uploaded";
  const status = document.querySelector("[data-eicr-doc-status]");
  status.textContent = labsState.eicrAdded ? "Verified" : "Missing";
  status.classList.toggle("status-good-text", labsState.eicrAdded);
  status.classList.toggle("status-review-text", !labsState.eicrAdded);
  document.querySelector("[data-eicr-review-date]").textContent = labsState.eicrAdded ? "Review date 11 May 2031" : "Review date unknown";
  document.querySelector("[data-eicr-document-row]")?.classList.toggle("is-missing", !labsState.eicrAdded);
  document.querySelector("[data-eicr-actions]").innerHTML = labsState.eicrAdded
    ? `
      <button class="text-button" type="button" data-toast="Preview only — document viewing is not connected to live storage.">View</button>
      <button class="text-button" type="button" data-upload-trigger>Replace</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="text-button" type="button" data-toast="Preview only — manual certificate entry is not connected in this demo.">Enter details manually</button>
    `;
}

function renderComplianceState() {
  const complianceCard = document.querySelector("[data-compliance-eicr-card]");
  complianceCard?.classList.toggle("status-good", labsState.eicrAdded);
  complianceCard?.classList.toggle("status-review", !labsState.eicrAdded);
  complianceCard?.classList.remove("status-watch", "status-neutral");

  const icon = document.querySelector("[data-compliance-eicr-icon]");
  if (icon) {
    icon.dataset.icon = labsState.eicrAdded ? "shield" : "alert";
  }

  document.querySelector("[data-compliance-eicr-source]").textContent = labsState.eicrAdded ? "Uploaded document" : "No EICR evidence";
  const status = document.querySelector("[data-compliance-eicr-status]");
  status.textContent = labsState.eicrAdded ? "Verified" : "Needs checking";
  status.classList.toggle("status-good-text", labsState.eicrAdded);
  status.classList.toggle("status-review-text", !labsState.eicrAdded);
  document.querySelector("[data-compliance-eicr-details]").textContent = labsState.eicrAdded
    ? "Satisfactory EICR recorded. Review date: 11 May 2031."
    : "CMP does not yet have a current EICR stored for this property.";
  document.querySelector("[data-compliance-eicr-actions]").innerHTML = labsState.eicrAdded
    ? `
      <button class="secondary-button" type="button" data-toast="Preview only — certificate viewing is not connected to live storage.">View certificate</button>
      <button class="text-button" type="button" data-upload-trigger>Replace evidence</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="secondary-button" type="button" data-toast="Preview only — manual certificate entry is not connected in this demo.">Enter details manually</button>
      <button class="text-button" type="button" data-open-global-service>Arrange an EICR</button>
    `;
}

function renderAllState() {
  renderOverviewState();
  renderDocumentsState();
  renderComplianceState();
  renderTimelineState();
  renderJourneyOsState();
  renderServicesState();
  renderPropertyDetailsState();
  renderSidebarProperties();
  renderAssistantActivity();
  renderPortfolioHomeState();
  renderPortfolioPropertiesState();
  renderPortfolioComplianceState();
  renderPortfolioEvidenceState();
  renderPortfolioTasksState();
  renderPortfolioActivityState();
  renderPortfolioUtilityState();
  renderGlobalScoreSurfaces();
  renderAzChecker();
  hydrateIcons();
}

function resetDemoState() {
  clearScanTimers();
  clearJourneyTimers();
  clearNickDemoStoredState();
  labsState.eicrAdded = false;
  labsState.strength = 42;
  labsState.timelineFilter = "all";
  labsState.alarmAnswer = "";
  labsState.notes = [];
  labsState.propertyEvents = [];
  labsState.serviceRequests = [];
  labsState.serviceEvents = [];
  labsState.propertiesSearch = "";
  labsState.propertiesFilter = "all";
  labsState.propertiesView = "cards";
  labsState.evidenceSearch = "";
  labsState.evidenceFilter = "all";
  labsState.evidencePropertyFilter = "all";
  labsState.evidenceView = "list";
  labsState.taskSearch = "";
  labsState.taskFilter = "all";
  labsState.taskView = "list";
  labsState.activitySearch = "";
  labsState.activityFilter = "all";
  labsState.utilityAskPrompt = "";
  labsState.inspectionStatusRecorded = false;
  labsState.demoState = "before-eicr";
  labsState.portfolioMode = "single";
  labsState.azMode = "single";
  labsState.azPropertyId = "the-butts";
  labsState.azScenario = "general";
  labsState.activeCheckerSection = "property-basics";
  labsState.newPropertyCheckerExpanded = false;
  labsState.portfolioSweepStage = "scope";
  labsState.editingCheckerCard = "";
  labsState.checkerAnswers = {};
  labsState.checkerScoreBoosts = {};
  labsState.scorePulse = null;
  labsState.selectedServicePropertyId = "the-butts";
  labsState.pendingServiceRequestType = "eicr";
  labsState.pendingServicePropertyId = "the-butts";
  labsState.addPropertyStep = 1;
  labsState.addPropertyAddress = addPropertyAddresses[0];
  labsState.smartSearchAnswerPanel = "";
  labsState.smartSearchWorkspaceOpen = false;
  labsState.journeyState = createInitialJourneyState();
  labsState.guidedDemo = {
    enabled: false,
    activeStoryId: "",
    activeMomentIndex: 0,
    mode: "landing",
    lastNormalScenarioId: "clean-property-match",
    hasSeenLanding: false
  };
  labsState.propertyDetails = createInitialPropertyDetails();
  labsState.optionalDetails = createInitialOptionalDetails();
  labsState.propertyMemory = createInitialPropertyMemory();
  labsState.propertySetup = createInitialPropertySetup();
}

function ensureDemoSupportRequest() {
  const requestType = "Property inspection support";
  const hasRequest = labsState.serviceRequests.some((request) => request.type === requestType && requestPropertyId(request) === "the-butts" && request.status !== "Cancelled");

  if (!hasRequest) {
    labsState.serviceRequests.unshift({
      id: "demo-support-request",
      type: requestType,
      propertyId: "the-butts",
      propertyLabel: "57 The Butts · CV1 3BJ",
      status: "Awaiting review",
      created: "Just now",
      linkedTo: "Inspection evidence"
    });
  }

  const hasEvent = labsState.serviceEvents.some((event) => event.id === "demo-support-event");

  if (!hasEvent) {
    labsState.serviceEvents.unshift({
      id: "demo-support-event",
      createdAt: Date.now(),
      group: "Today",
      filter: "actions",
      icon: "calendar",
      category: "Service request",
      title: "Property inspection support requested",
      body: "CMP recorded a request to help arrange the next property-inspection step.",
      badge: "Awaiting review",
      badgeClass: "status-watch-text",
      activityLabel: "Property inspection support requested",
      type: "service-request",
      actions: [],
      details: {
        title: "Request details",
        rows: [
          ["Property", "57 The Butts"],
          ["Request type", requestType],
          ["Status", "Awaiting review"],
          ["Created", "Just now"]
        ],
        note: "Local demo support request for layout testing."
      }
    });
  }
}

function ensureDemoQuickWin() {
  labsState.alarmAnswer = "Yes, they have been tested";

  const hasEvent = labsState.propertyEvents.some((event) => event.id === "demo-alarm-answer");

  if (!hasEvent) {
    labsState.propertyEvents.unshift({
      id: "demo-alarm-answer",
      createdAt: Date.now(),
      group: "Today",
      filter: "answers",
      icon: "check",
      category: "Landlord answer",
      title: "Alarm testing answer recorded",
      body: "Smoke and CO alarm testing was recorded from the Home quick-win card.",
      badge: "Landlord confirmed",
      badgeClass: "status-good-text",
      activityLabel: "Alarm testing answer recorded",
      type: "alarm-answer",
      actions: [
        { label: "Review answer", action: "details" },
        { label: "Add evidence", action: "documents" }
      ],
      details: {
        title: "Landlord answer",
        rows: [
          ["Question", "Have smoke and CO alarms been tested?"],
          ["Answer", labsState.alarmAnswer],
          ["Property", "57 The Butts"]
        ],
        note: "This quick-win answer is useful history, but supporting evidence can still be added."
      }
    });
  }
}

function configureDemoState(state) {
  const demoState = normaliseDemoState(state);

  resetDemoState();
  labsState.demoState = demoState;

  if (demoState === "empty-portfolio") {
    labsState.portfolioMode = "empty";
    labsState.selectedServicePropertyId = "the-butts";
    labsState.azMode = "single";
  }

  if (demoState === "new-property") {
    labsState.portfolioMode = "new";
    labsState.selectedServicePropertyId = "the-butts";
    labsState.azMode = "single";
    labsState.evidencePropertyFilter = "the-butts";
    labsState.propertyDetails = {
      ...labsState.propertyDetails,
      propertyType: "Flat / apartment",
      bedrooms: "Needs confirmation",
      occupancy: "Needs confirmation",
      goal: "New property setup"
    };
  }

  if (demoState === "starter-portfolio" || demoState === "two-property") {
    labsState.portfolioMode = "two";
    labsState.selectedServicePropertyId = "all";
  }

  if (demoState === "five-property") {
    labsState.portfolioMode = "five";
    labsState.selectedServicePropertyId = "all";
    labsState.azMode = "portfolio";
  }

  if (demoState === "after-eicr" || demoState === "after-support") {
    labsState.eicrAdded = true;
    labsState.strength = 58;
  }

  if (demoState === "after-support") {
    ensureDemoSupportRequest();
  }

  if (demoState === "after-quick-win") {
    ensureDemoQuickWin();
  }

  return demoState;
}

function applyDemoState(state) {
  const labels = {
    "empty-portfolio": "Empty portfolio",
    "new-property": "New property",
    "one-property": "Worked example",
    "starter-portfolio": "Starter portfolio",
    "five-property": "Five-property portfolio",
    reset: "Reset demo",
    "before-eicr": "Before EICR",
    "after-eicr": "After EICR",
    "after-support": "After support request",
    "after-quick-win": "After quick win",
    "two-property": "Portfolio demo"
  };
  const demoState = configureDemoState(state);

  renderAllState();
  renderAssistantPrompts();
  closeTimelineModals();
  if (demoState === "new-property") {
    setLabsRouteState("new-property");
    startJourneyFromNewPropertyState({ scroll: true });
    return;
  }
  const firstPrompt = document.querySelector(".prompt-stack [data-prompt]")?.dataset.prompt;
  setAssistantResponse(isEmptyPortfolioMode() || isNewPropertyMode()
    ? getGlobalAskDefaultResponse()
    : getAssistantResponse(firstPrompt || "What changed recently?"));
  showToast(`Demo state updated: ${labels[demoState] || "Before EICR"}`);
}

function setLabsRouteState(state) {
  const url = new URL(window.location.href);
  url.searchParams.delete("fresh");
  url.searchParams.set("state", state);
  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function openCreatedPropertyWorkspace() {
  closeTimelineModals();
  configureDemoState("new-property");
  setLabsRouteState("new-property");
  renderAllState();
  renderAssistantPrompts();
  startJourneyFromNewPropertyState({ scroll: true });
}

function getPortfolioAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    const responses = {
      "Summarise my portfolio": "The portfolio is empty. Add your first property so CMP can create a compliance workspace and start organising evidence, tasks and support.",
      "What should I do today?": "Add your first property. CMP will use the address to build the workspace, prepare checks and show what evidence to gather.",
      "Which property needs attention?": "No property needs attention yet because no properties have been added.",
      "What evidence am I missing?": "CMP cannot identify missing evidence until a property is added. You can prepare EPC, Gas Safety, EICR, inspection and tenancy records if you already have them.",
      "Ask CMP why this matters": "A property address gives CMP the anchor it needs to organise checks, evidence, tasks and service support.",
      "Ask CMP what I need": "Start with address and postcode, then gather any existing certificates or tenancy records you already hold."
    };
    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isFivePropertyMode()) {
    const responses = {
      "Summarise my portfolio": `You have five properties in this Labs portfolio. ${fullyCompliantProperties().length} is evidence-ready, portfolio compliance is ${portfolioComplianceScore()}%, and portfolio evidence is ${portfolioEvidenceScore()}%.`,
      "What should I do today?": "Start with 3 Station Road onboarding gaps, then handle 18 Willow Brook Drive Gas Safety renewal and 9 Canal View licensing uncertainty.",
      "Which property needs attention?": "3 Station Road has the lowest readiness score. 18 Willow Brook Drive has the urgent renewal item, while 24 Maple Court is evidence-ready.",
      "What evidence am I missing?": `${portfolioEvidenceGapCount()} evidence gaps remain across the five-property portfolio. Station Road has the largest setup gap; Canal View needs licensing evidence.`,
      "Ask CMP why this matters": "CMP separates compliance score from evidence score so a property can have decent paperwork but still need scenario-specific answers.",
      "Ask CMP what I need": "Run Portfolio Sweep, resolve Station Road onboarding evidence, confirm Canal View licensing, then review Willow Brook renewal evidence."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "Summarise my portfolio": labsState.eicrAdded ? "You have two properties in this Labs portfolio. 18 Willow Brook Drive needs Gas Safety renewal soon, while 57 The Butts now has EICR evidence verified and should move to inspection evidence." : "You have two properties in this Labs portfolio. 18 Willow Brook Drive needs Gas Safety renewal soon, while 57 The Butts is missing EICR evidence.",
      "What should I do today?": "Start with 18 Willow Brook Drive because Gas Safety renewal is needed in 21 days. Then return to 57 The Butts for the EICR or inspection follow-up.",
      "Which property needs attention?": labsState.eicrAdded ? "18 Willow Brook Drive is most urgent because Gas Safety renewal is approaching. 57 The Butts should move to inspection evidence next." : "18 Willow Brook Drive is most urgent because Gas Safety renewal is approaching. 57 The Butts still has an Electrical Safety evidence gap.",
      "What evidence am I missing?": labsState.eicrAdded ? "18 Willow Brook Drive needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts mainly needs inspection evidence now." : "18 Willow Brook Drive needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts needs EICR evidence.",
      "Ask CMP why this matters": "CMP compares the portfolio and prioritises the item with the clearest timing risk. In this state, that is Gas Safety renewal for 18 Willow Brook Drive.",
      "Ask CMP what I need": "Book or upload Gas Safety renewal evidence for 18 Willow Brook Drive, then review the remaining evidence gaps across both properties."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? portfolioPostEicrAssistantResponses : portfolioAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getPropertiesAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    const responses = {
      "Which property needs attention?": "No property needs attention yet because the portfolio is empty.",
      "Summarise my properties": "No properties have been added yet. Add your first property to create the first CMP compliance workspace.",
      "What should I open first?": "Start with Add your first property. Properties will appear here after setup.",
      "How do I add another property?": "Use Add your first property to open the setup preview. CMP starts with the address and postcode."
    };
    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  if (isFivePropertyMode()) {
    const responses = {
      "Which property needs attention?": "3 Station Road needs attention first because both compliance and evidence scores are low. 18 Willow Brook Drive and 9 Canal View also need targeted review.",
      "Summarise my properties": "The portfolio contains five properties in different states, including one evidence-ready file: 24 Maple Court.",
      "What should I open first?": "Open the A-Z Checker or focus 3 Station Road to show the new-purchase onboarding state.",
      "How do I add another property?": "Use Add property to preview onboarding; this five-property state is static demo data."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "Which property needs attention?": "18 Willow Brook Drive needs attention first because Gas Safety renewal is due soon. 57 The Butts remains important for Electrical Safety or inspection evidence depending on the demo state.",
      "Summarise my properties": "The portfolio contains 57 The Butts in Coventry and 18 Willow Brook Drive in Birmingham. CMP is using both cards to compare evidence strength, occupancy and current focus.",
      "What should I open first?": "Open the 18 Willow Brook Drive preview if you want to inspect the urgent portfolio item, or open 57 The Butts for the full property workspace.",
      "How do I add another property?": "Use Add property to preview the onboarding flow. The second property here is a portfolio-level demo record rather than a full workspace."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? propertiesPostEicrAssistantResponses : propertiesAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getComplianceCentreAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    const responses = {
      "What should I fix first?": "There is nothing to fix yet. Add your first property so CMP can identify checks, evidence gaps and useful actions.",
      "Which evidence is missing?": "CMP cannot identify missing evidence until a property is added.",
      "What expires soon?": "No renewal dates are being tracked yet because the portfolio is empty.",
      "Summarise my compliance position": "No compliance position has been created yet. Add a property to start the A-Z Compliance Checker and evidence baseline."
    };
    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  if (isFivePropertyMode()) {
    const responses = {
      "What should I fix first?": "Fix 3 Station Road first because it has the lowest compliance and evidence scores. Then confirm Willow Brook Gas Safety renewal and Canal View licensing.",
      "Which evidence is missing?": `${portfolioEvidenceGapCount()} evidence gaps remain. Station Road is missing the largest set; Canal View has licensing-specific uncertainty.`,
      "What expires soon?": "18 Willow Brook Drive has the clearest upcoming renewal item: Gas Safety evidence is needed soon.",
      "Summarise my compliance position": `Portfolio compliance is ${portfolioComplianceScore()}% and evidence is ${portfolioEvidenceScore()}%. 24 Maple Court is evidence-ready.`
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "What should I fix first?": "Fix Gas Safety renewal for 18 Willow Brook Drive first because it is expiring soon. 57 The Butts should still be reviewed for EICR or inspection evidence.",
      "Which evidence is missing?": labsState.eicrAdded ? "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts mainly needs inspection evidence now." : "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts needs EICR evidence.",
      "What expires soon?": "Gas Safety renewal for 18 Willow Brook Drive is the clear upcoming item in this portfolio view.",
      "Summarise my compliance position": labsState.eicrAdded ? "CMP is comparing two properties: Willow Brook has the urgent renewal item, while 57 The Butts has EICR verified and should move to inspection evidence." : "CMP is comparing two properties: Willow Brook has the urgent renewal item, while 57 The Butts carries the main evidence gap."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? complianceCentrePostEicrAssistantResponses : complianceCentreAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getEvidenceVaultAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    const responses = {
      "What evidence is missing?": "CMP cannot identify missing evidence until you add a property. Prepare any certificates and records you already have.",
      "Which documents are verified?": "No documents are stored yet because no property has been added.",
      "How should I upload paperwork?": "Add your first property first. CMP will then organise uploads against the correct address.",
      "Summarise my evidence vault": "Evidence Vault is empty. After setup, it will hold certificates, inspection records and supporting documents for each property."
    };
    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  if (isFivePropertyMode()) {
    const responses = {
      "What evidence is missing?": `The five-property portfolio has ${portfolioEvidenceGapCount()} evidence gaps. Station Road needs onboarding evidence; Canal View needs licensing evidence.`,
      "Which documents are verified?": "24 Maple Court has a complete evidence pack. Willow Brook and The Butts have several verified core records.",
      "How should I upload paperwork?": "Use Smart Upload for property-specific files, or run Portfolio Sweep first to decide which evidence matters by property.",
      "Summarise my evidence vault": `Portfolio evidence score is ${portfolioEvidenceScore()}%. One property is complete, and the remaining gaps are grouped by address.`
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "What evidence is missing?": labsState.eicrAdded ? "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts mainly needs inspection evidence now." : "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts still needs EICR evidence.",
      "Which documents are verified?": "EPC and EICR are confirmed for Willow Brook, while 57 The Butts has EPC and Gas Safety recorded plus EICR once the after-EICR state is active.",
      "How should I upload paperwork?": "Use Smart Upload for the 57 The Butts EICR flow. Gas Safety upload for Willow Brook is shown as a Labs prototype action.",
      "Summarise my evidence vault": "The Evidence Vault now includes records and gaps for both properties, with each row labelled by address so portfolio evidence is easier to scan."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? evidenceVaultPostEicrAssistantResponses : evidenceVaultAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getTasksAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    return "There are no tasks yet because no properties are connected. Add a property and run the A-Z Checker to create tasks.";
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  if (isFivePropertyMode()) {
    const responses = {
      "What should I do first?": "Start with 3 Station Road: run the onboarding A-Z check and collect missing certificates, alarms and tenancy setup evidence.",
      "Why is this a task?": "CMP created these from the five-property scores and grouped them by the property-specific gaps.",
      "Which tasks are evidence-related?": "Station Road onboarding, Willow Brook renewal evidence and Canal View licensing evidence are the main evidence-related tasks.",
      "What can I leave for later?": "24 Maple Court only needs monitoring. Lower-risk review items can wait until Station Road, Willow Brook and Canal View are handled."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "What should I do first?": "Do the Gas Safety renewal task for 18 Willow Brook Drive first. It is the most time-sensitive item in the two-property portfolio.",
      "Why is this a task?": "CMP created the task because Gas Safety renewal is approaching and the evidence needs to stay tied to the correct property.",
      "Which tasks are evidence-related?": "Evidence tasks include Willow Brook Gas Safety renewal, alarm evidence and inspection evidence, plus 57 The Butts EICR or inspection evidence.",
      "What can I leave for later?": "Local licensing can stay on watch while Gas Safety renewal and missing core evidence are handled first."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? tasksPostEicrAssistantResponses : tasksAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getActivityAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    return "No property activity has been recorded yet. Add a property to start the activity timeline.";
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  if (isFivePropertyMode()) {
    const responses = {
      "What changed recently?": "CMP prepared a five-property Portfolio Sweep and identified 24 Maple Court as evidence-ready.",
      "What still needs attention?": "3 Station Road onboarding, Willow Brook Gas Safety renewal and Canal View licensing are the main items.",
      "Summarise portfolio activity": "The activity feed shows the portfolio sweep, evidence-ready property, renewal items and evidence gaps by property.",
      "Why was this recorded?": "CMP records the portfolio sweep so the landlord can see why property-specific actions were created."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "What changed recently?": "CMP flagged Gas Safety renewal for 18 Willow Brook Drive and kept 57 The Butts evidence status visible in the same activity feed.",
      "What still needs attention?": "Willow Brook Gas Safety renewal is most urgent. 57 The Butts still needs EICR evidence before the after-EICR state, then inspection evidence.",
      "Summarise portfolio activity": "The feed now shows portfolio-level events across both properties, including renewal, evidence, property setup and support activity.",
      "Why was this recorded?": "CMP records activity with property labels so landlords can see which address each evidence or support event belongs to."
    };
    return responses[prompt] || defaultAssistantResponse;
  }

  const responses = labsState.eicrAdded ? activityPostEicrAssistantResponses : activityAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getGlobalAskDefaultResponse() {
  if (isEmptyPortfolioMode()) {
    return "No properties are connected yet. Add a property first, then CMP can personalise the A-Z Checker, compliance score, evidence score, tasks and service recommendations.";
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse();
  }

  const activeRequest = activeSupportRequestForActivity();

  if (activeRequest) {
    return `${activeRequest.type} is already open for ${propertyLabelForId(requestPropertyId(activeRequest))} and awaiting CMP review. CMP will keep that request visible rather than prompting you to request the same support again.`;
  }

  if (isTwoPropertyMode()) {
    return labsState.eicrAdded
      ? "CMP has compared both properties. 18 Willow Brook Drive still needs Gas Safety renewal soon, while 57 The Butts now has EICR evidence verified and should move to inspection evidence."
      : "CMP has compared both properties. 18 Willow Brook Drive needs Gas Safety renewal soon, while 57 The Butts is missing EICR evidence.";
  }

  if (labsState.alarmAnswer) {
    return "Alarm testing has been recorded. Supporting evidence can be added later if available.";
  }

  if (labsState.eicrAdded) {
    return "Your EICR is verified. The next useful action is to add inspection evidence or confirm that no recent inspection has been completed.";
  }

  return "The clearest next step is to upload or arrange an EICR for 57 The Butts. Electrical Safety is the main missing evidence area.";
}

function getGlobalAskAssistantResponse(prompt) {
  if (isEmptyPortfolioMode()) {
    const responses = {
      "How do I get started?": "Start by adding your first property. CMP will then help organise compliance checks, evidence, tasks and support around that address.",
      "What documents should I prepare?": "Useful starting documents include any EPC, Gas Safety certificate, EICR, inspection records, tenancy paperwork, deposit records, alarm evidence and licensing information you already have.",
      "What information do I need to add a property?": "Start with the property address and postcode. CMP can then build the workspace and ask for details such as occupancy, property type, landlord goal and existing evidence.",
      "How does CMP help landlords?": "CMP turns a property address into a workspace for checks, evidence, tasks, activity and support requests, so a landlord can see what is known and what still needs attention.",
      "What happens after I add my first property?": "CMP will create the property workspace, prepare the A-Z Compliance Checker, organise Evidence Vault around the address and create tasks when evidence or checks need attention.",
      "What should I do today?": "Add your first property, then run the A-Z Compliance Checker. If you already have certificates, keep them ready for Evidence Vault upload after setup.",
      "Which property needs attention?": "No property needs attention yet because the portfolio is empty.",
      "What evidence is missing?": "CMP cannot identify missing evidence until a property and scenario are added. Typical starting evidence includes EPC, Gas Safety, EICR, alarms, tenancy documents and licensing answers.",
      "Explain this property file": "There is no property file yet. CMP will create one from the first address and then attach evidence, answers, tasks and services to it.",
      "Summarise my portfolio": "The portfolio currently has 0 properties. Scores and readiness checks will appear after setup.",
      "What can wait until later?": "Detailed service recommendations can wait until the first property is added. Start with address, occupancy/scenario and any certificates you already hold."
    };
    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isNewPropertyMode()) {
    return newPropertyAskResponse(prompt);
  }

  const activeRequest = activeSupportRequestForActivity();

  if (activeRequest) {
    const propertyLabel = propertyLabelForId(requestPropertyId(activeRequest));
    const activeRequests = labsState.serviceRequests.filter((request) => request.status !== "Cancelled");
    const requestSummary = activeRequests
      .map((request) => `${request.type} for ${propertyLabelForId(requestPropertyId(request))}`)
      .join("; ");
    const requestResponses = {
      "What should I do today": isTwoPropertyMode()
        ? `CMP has ${activeRequests.length} open support ${activeRequests.length === 1 ? "request" : "requests"} awaiting review: ${requestSummary}. Keep Gas Safety renewal for 18 Willow Brook Drive as the most time-sensitive item and avoid duplicate requests.`
        : `${activeRequest.type} is open for ${propertyLabel}. The next useful step is to wait for CMP review or add any existing evidence you already have.`,
      "What should I do today?": isTwoPropertyMode()
        ? `CMP has ${activeRequests.length} open support ${activeRequests.length === 1 ? "request" : "requests"} awaiting review: ${requestSummary}. Keep Gas Safety renewal for 18 Willow Brook Drive as the most time-sensitive item and avoid duplicate requests.`
        : `${activeRequest.type} is open for ${propertyLabel}. The next useful step is to wait for CMP review or add any existing evidence you already have.`,
      "Which property needs attention?": isTwoPropertyMode()
        ? `CMP has compared both properties. 18 Willow Brook Drive remains most time-sensitive because Gas Safety renewal is approaching, while 57 The Butts has its ${labsState.eicrAdded ? "inspection" : "EICR"} support context visible. Open requests: ${requestSummary}.`
        : `${propertyLabel} has an open ${activeRequest.type.toLowerCase()} awaiting review, so duplicate support is not needed.`,
      "What evidence is missing?": labsState.eicrAdded
        ? "Inspection evidence is still the most useful document gap, and CMP already has a support request awaiting review."
        : "Electrical Safety evidence is still the clearest evidence gap, and CMP already has a support request awaiting review.",
      "Explain this property file": `${propertyLabel} has an open ${activeRequest.type.toLowerCase()} connected to the property file and visible in support requests.`,
      "Summarise my portfolio": isTwoPropertyMode()
        ? `Your portfolio has two properties. CMP is tracking the open ${activeRequest.type.toLowerCase()} for ${propertyLabel} and comparing the remaining evidence gaps.`
        : `Your portfolio has one property. CMP is tracking the open ${activeRequest.type.toLowerCase()} for 57 The Butts and keeping the next evidence gap visible.`,
      "What can wait until later?": "Avoid creating duplicate support requests. Licensing and document review can stay on watch while CMP reviews the open request."
    };

    return requestResponses[prompt] || getGlobalAskDefaultResponse();
  }

  if (isTwoPropertyMode()) {
    const responses = {
      "What should I do today?": "Start with Gas Safety renewal for 18 Willow Brook Drive. It is more time-sensitive than the 57 The Butts evidence follow-up.",
      "Which property needs attention?": labsState.eicrAdded
        ? "18 Willow Brook Drive needs attention first because Gas Safety renewal is due soon. 57 The Butts should add inspection evidence next."
        : "18 Willow Brook Drive needs attention first because Gas Safety renewal is due soon. 57 The Butts still needs EICR evidence.",
      "What evidence is missing?": labsState.eicrAdded ? "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts mainly needs inspection evidence now." : "Willow Brook needs Gas Safety renewal evidence, alarm evidence and inspection evidence. 57 The Butts needs EICR evidence until it is verified.",
      "Explain this property file": "CMP is comparing 57 The Butts and 18 Willow Brook Drive using property details, evidence, compliance status, tasks, activity and support requests.",
      "Summarise my portfolio": labsState.eicrAdded ? "Your two-property portfolio has one urgent renewal item and one follow-up evidence gap: Willow Brook Gas Safety renewal and 57 The Butts inspection evidence." : "Your two-property portfolio has one urgent renewal item and one core evidence gap: Willow Brook Gas Safety renewal and 57 The Butts EICR evidence.",
      "What can wait until later?": labsState.eicrAdded
        ? "Local licensing and tenancy document review can stay on watch while Gas Safety renewal and the 57 The Butts inspection follow-up are handled first."
        : "Local licensing and tenancy document review can stay on watch while Gas Safety renewal and the 57 The Butts EICR gap are handled first."
    };

    return responses[prompt] || getGlobalAskDefaultResponse();
  }

  const responses = {
    "What should I do today?": labsState.eicrAdded
      ? "Add inspection evidence or record that no recent inspection has been completed for 57 The Butts."
      : "Upload or arrange an EICR for 57 The Butts. Electrical Safety is the clearest missing evidence area.",
    "Which property needs attention?": labsState.eicrAdded
      ? "57 The Butts is still the focus, but Electrical Safety is now verified. Inspection evidence is the next useful item."
      : "57 The Butts needs attention because CMP does not yet have current EICR evidence.",
    "What evidence is missing?": labsState.eicrAdded
      ? "Core certificates are recorded. Inspection evidence is still useful to add."
      : "The main missing evidence is an EICR. Inspection evidence is also useful to add when available.",
    "Explain this property file": "57 The Butts has matched EPC information, verified Gas Safety evidence, landlord alarm information, tasks and activity history in this demo.",
    "Summarise my portfolio": labsState.eicrAdded
      ? "Your portfolio has one property. EPC, Gas Safety and EICR evidence are recorded; inspection evidence and licensing review remain useful follow-up items."
      : "Your portfolio has one property. EPC and Gas Safety evidence are recorded; Electrical Safety is the clearest gap.",
    "What can wait until later?": labsState.eicrAdded
      ? "Licensing can be monitored while inspection evidence is the more useful next upload."
      : "Licensing and inspection evidence can be monitored, but Electrical Safety should be handled first."
  };

  return responses[prompt] || getGlobalAskDefaultResponse();
}

function getGlobalServiceAssistantResponse(prompt) {
  if (isNewPropertyMode()) {
    const responses = {
      "What should I book first?": "Do not book a service yet. Confirm the property details and upload any certificates first so CMP can recommend the right support.",
      "Why is this recommended?": "CMP is holding service recommendations until it knows whether Gas Safety, EICR, licensing or other evidence gaps actually apply.",
      "Can CMP help arrange it?": "CMP can help arrange support after the guided check confirms the property context and evidence gaps.",
      "What can wait until later?": "Service requests can wait. Continue the guided check and upload existing evidence first."
    };
    return responses[prompt] || responses["What should I book first?"];
  }

  if (isAllServicePropertiesMode()) {
    const activeRequests = openRequestsForServiceScope();

    if (activeRequests.length) {
      const requestSummary = activeRequests
        .map((request) => `${request.type} for ${propertyLabelForId(requestPropertyId(request))}`)
        .join("; ");
      const responsesWithRequests = {
        "What should I book first?": `Across the portfolio, CMP has ${activeRequests.length} open support ${activeRequests.length === 1 ? "request" : "requests"} awaiting review: ${requestSummary}. Avoid duplicating those and handle any remaining evidence uploads you already have.`,
        "Why is this recommended?": "CMP is using property-specific open requests so the same support item is not requested twice for the same address.",
        "Can CMP help arrange it?": "This demo can record local support requests per property and service type. The final workflow would connect those to CMP support handling.",
        "What can wait until later?": "Licensing and tenancy document review can stay visible while open support requests and urgent renewal evidence are handled first."
      };

      return responsesWithRequests[prompt] || responsesWithRequests["What should I book first?"];
    }

    const responses = {
      "What should I book first?": "Across the portfolio, book or upload Gas Safety renewal evidence for 18 Willow Brook Drive first. 57 The Butts still needs EICR evidence, but the Gas Safety renewal is the most time-sensitive item.",
      "Why is this recommended?": "CMP compared both properties and ranked the renewal window ahead of the 57 The Butts evidence gap, while keeping both visible.",
      "Can CMP help arrange it?": "This demo can create a local Gas Safety support request for 18 Willow Brook Drive or an EICR support request for 57 The Butts.",
      "What can wait until later?": "Inspection evidence, alarm evidence and licensing should stay visible, but Gas Safety renewal and the EICR gap are the higher-value actions."
    };

    return responses[prompt] || responses["What should I book first?"];
  }

  const property = selectedServiceProperty();
  const activeRequest = openRequestsForProperty(property.id)[0];

  if (activeRequest) {
    const responsesWithRequest = {
      "What should I book first": `${activeRequest.type} is already open for ${property.label}. The next useful step is to wait for CMP review or add any existing evidence you already have.`,
      "What should I book first?": `${activeRequest.type} is already open for ${property.label}. The next useful step is to wait for CMP review or add any existing evidence you already have.`,
      "Why is this recommended?": "CMP is avoiding duplicate support requests and keeping the open item visible so the property file stays clear.",
      "Can CMP help arrange it?": "A support request is already open in this demo. In the final workflow this would notify CMP or a connected supplier process.",
      "What can wait until later?": property.id === "willow-brook"
        ? "Inspection, alarms and licensing can stay visible while the Gas Safety renewal request is reviewed."
        : labsState.eicrAdded
        ? "Gas Safety, EPC and EICR are recorded. Keep licensing and tenancy document review visible while inspection support is reviewed."
        : "Gas Safety and EPC are recorded. Keep licensing and document review visible while the open support request is reviewed."
    };

    return responsesWithRequest[prompt] || responsesWithRequest["What should I book first?"];
  }

  if (property.id === "willow-brook") {
    const responses = {
      "What should I book first?": "Gas Safety support is the most useful service for 18 Willow Brook Drive because renewal evidence is approaching its window.",
      "Why is this recommended?": "CMP is recommending Gas Safety renewal because this tenanted property has a renewal item due soon, while EICR and EPC are already recorded.",
      "Can CMP help arrange it?": "This demo can record a local Gas Safety support request for 18 Willow Brook Drive. The final workflow would connect it to support handling.",
      "What can wait until later?": "Inspection evidence, alarm evidence and licensing review should stay visible, but Gas Safety renewal comes first."
    };

    return responses[prompt] || responses["What should I book first?"];
  }

  const responses = {
    "What should I book first?": labsState.eicrAdded
      ? "Inspection support is the most useful next support option because core certificates are now recorded."
      : "EICR support is the most useful next support option because Electrical Safety evidence is missing.",
    "Why is this recommended?": labsState.eicrAdded
      ? "CMP is recommending inspection support because it is the next useful evidence item after the core certificates."
      : "CMP is recommending EICR support because no current Electrical Safety evidence is stored for 57 The Butts.",
    "Can CMP help arrange it?": "This demo can record a local support request. The finished product would connect that request to CMP support workflows.",
    "What can wait until later?": labsState.eicrAdded
      ? "Gas Safety and EPC are already recorded. Licensing can keep checking while inspection evidence is reviewed."
      : "Gas Safety and EPC are already recorded, so EICR support should come before optional document review."
  };

  return responses[prompt] || getGlobalAskDefaultResponse();
}

function getLearnAssistantResponse(prompt) {
  return learnAssistantResponses[prompt] || "CMP Learn gives plain-English previews connected to the property evidence and tasks in this Labs workspace.";
}

function getSettingsAssistantResponse(prompt) {
  return settingsAssistantResponses[prompt] || "Settings are local controls for presentation and prototype preferences.";
}

function getJourneyBridgeAssistantResponse(prompt) {
  const state = journeyState();
  const brain = state.propertyBrain;
  const urgent = (state.actionPlan?.urgentLegalBlockers || []).filter((item) => item.status !== "Deferred");
  const missing = state.actionPlan?.missingEvidence || [];
  const route = journeyRoutes[state.routeId]?.label || "Prioritised";
  const address = brain.PropertyIdentity.address;

  if (labsState.currentView === "home") {
    return `${address} is the active simulated Property Intelligence profile. The biggest current priority is ${urgent[0]?.title || "keeping monitoring live"}. Use Add / check property to continue the A-Z journey.`;
  }
  if (labsState.currentView === "journeyOs") {
    return `Journey OS is building the ${route} route for ${address}. CMP checks simulated records first, then asks only landlord-only unknowns before returning to the workspace.`;
  }
  if (labsState.currentView === "complianceCentre") {
    return `Compliance Centre is now reading the Journey OS Property Intelligence profile: ${urgent.length} urgent blocker${urgent.length === 1 ? "" : "s"}, ${missing.length} evidence gap${missing.length === 1 ? "" : "s"}, and ${state.serviceBasket.length} fake service item${state.serviceBasket.length === 1 ? "" : "s"}.`;
  }
  if (labsState.currentView === "evidenceVault") {
    return state.evidenceVault.length
      ? `Evidence Vault has ${state.evidenceVault.length} simulated scan${state.evidenceVault.length === 1 ? "" : "s"} linked to ${address}. The next useful evidence gap is ${missing[0]?.title || "monitoring evidence dates"}.`
      : `Evidence Vault is waiting for simulated uploads for ${address}. Start with ${missing[0]?.title || "EICR, Gas Safety or tenancy evidence"} or use the fake scanner.`;
  }
  if (labsState.currentView === "bookService") {
    return `Services should follow the Property Intelligence profile, not a generic directory. The current recommended first service is ${buildServiceRecommendations(state)[0]?.title || "Annual Compliance Monitoring"}.`;
  }
  return `For ${address}, CMP would prioritise ${urgent[0]?.title || missing[0]?.title || "monitoring and evidence quality"} on the ${route} route.`;
}

function getAssistantResponse(prompt) {
  if (hasJourneyPropertyBrainActivity() && ["home", "journeyOs", "complianceCentre", "evidenceVault", "bookService", "askCmp"].includes(labsState.currentView)) {
    return getJourneyBridgeAssistantResponse(prompt);
  }

  if (isEmptyPortfolioMode() && emptyGlobalAskPrompts.includes(prompt)) {
    return getGlobalAskAssistantResponse(prompt);
  }

  if (isNewPropertyMode() && newPropertyAskPrompts.includes(prompt)) {
    return getGlobalAskAssistantResponse(prompt);
  }

  if (labsState.currentView === "home") {
    return getPortfolioAssistantResponse(prompt);
  }

  if (labsState.currentView === "properties") {
    return getPropertiesAssistantResponse(prompt);
  }

  if (labsState.currentView === "complianceCentre") {
    return getComplianceCentreAssistantResponse(prompt);
  }

  if (labsState.currentView === "evidenceVault") {
    return getEvidenceVaultAssistantResponse(prompt);
  }

  if (labsState.currentView === "tasks") {
    return getTasksAssistantResponse(prompt);
  }

  if (labsState.currentView === "activity") {
    return getActivityAssistantResponse(prompt);
  }

  if (labsState.currentView === "askCmp") {
    return getGlobalAskAssistantResponse(prompt);
  }

  if (labsState.currentView === "bookService") {
    return getGlobalServiceAssistantResponse(prompt);
  }

  if (labsState.currentView === "learn") {
    return getLearnAssistantResponse(prompt);
  }

  if (labsState.currentView === "settings") {
    return getSettingsAssistantResponse(prompt);
  }

  if (labsState.eicrAdded && postEicrAssistantResponses[prompt]) {
    return postEicrAssistantResponses[prompt];
  }

  return assistantResponses[prompt] || defaultAssistantResponse;
}

function renderAssistantPrompts() {
  const stack = document.querySelector(".prompt-stack");
  const assistantSubtitle = document.querySelector("[data-assistant] .assistant-header p");
  const assistantInput = document.querySelector('[data-assistant-form] input[name="question"]');
  let prompts = overviewPrompts;

  if (assistantSubtitle) {
    assistantSubtitle.textContent = isEmptyPortfolioMode()
      ? "Your setup assistant"
      : isNewPropertyMode()
      ? "Your new property assistant"
      : "Your property compliance assistant";
  }
  if (assistantInput) {
    assistantInput.placeholder = isEmptyPortfolioMode()
      ? "What should I prepare before adding a property?"
      : isNewPropertyMode()
      ? "Ask CMP about 57 The Butts..."
      : "Ask a question about this property...";
  }

  if (isNewPropertyMode() && ["home", "properties", "complianceCentre", "evidenceVault", "tasks", "activity"].includes(labsState.currentView)) {
    prompts = newPropertyAskPrompts;
  } else if (labsState.currentView === "home") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : portfolioPrompts;
  } else if (labsState.currentView === "properties") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : propertiesPrompts;
  } else if (labsState.currentView === "complianceCentre") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : complianceCentrePrompts;
  } else if (labsState.currentView === "evidenceVault") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : evidenceVaultPrompts;
  } else if (labsState.currentView === "tasks") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : tasksPrompts;
  } else if (labsState.currentView === "activity") {
    prompts = isEmptyPortfolioMode() ? emptyGlobalAskPrompts : activityPrompts;
  } else if (labsState.currentView === "askCmp") {
    prompts = currentGlobalAskPrompts();
  } else if (labsState.currentView === "bookService") {
    prompts = globalServicePrompts;
  } else if (labsState.currentView === "learn") {
    prompts = learnPrompts;
  } else if (labsState.currentView === "settings") {
    prompts = settingsPrompts;
  } else if (labsState.activeTab === "documents") {
    prompts = documentPrompts;
  } else if (labsState.activeTab === "compliance") {
    prompts = compliancePrompts;
  } else if (labsState.activeTab === "timeline") {
    prompts = timelinePrompts;
  } else if (labsState.activeTab === "services") {
    prompts = servicesPrompts;
  } else if (labsState.activeTab === "details") {
    prompts = propertyPrompts;
  }

  if (!stack) {
    return;
  }

  stack.innerHTML = prompts.map((prompt) => `<button type="button" data-prompt="${prompt}">${prompt}</button>`).join("");
}

function openAssistant(message, { flash = false } = {}) {
  if (message) {
    setAssistantResponse(message);
  }

  document.body.classList.add("assistant-open");

  if (flash) {
    flashAssistantResponse();
  }
}

function closeDrawers() {
  document.body.classList.remove("menu-open", "assistant-open", "findings-open", "prs-open");
  closeTimelineModals();
}

const portfolioBodyClasses = [
  "portfolio-home-active",
  "portfolio-properties-active",
  "portfolio-compliance-active",
  "portfolio-evidence-active",
  "portfolio-tasks-active",
  "portfolio-activity-active",
  "portfolio-utility-active",
  "journey-os-active",
  "journey-guided-active",
  "checker-is-active"
];

const portfolioPageSelectors = [
  "[data-portfolio-home]",
  "[data-journey-os]",
  "[data-portfolio-properties]",
  "[data-portfolio-compliance]",
  "[data-portfolio-evidence]",
  "[data-portfolio-tasks]",
  "[data-portfolio-activity]",
  "[data-portfolio-ask]",
  "[data-portfolio-service]",
  "[data-portfolio-learn]",
  "[data-portfolio-settings]"
];

function setGlobalNavActive(label) {
  document.querySelectorAll("[data-global-nav]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.globalNav === label);
  });
}

function setNavItemLabel(navName, label) {
  const item = document.querySelector(`[data-global-nav="${navName}"]`);
  if (!item) return;
  const textNode = Array.from(item.childNodes).reverse().find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) {
    textNode.textContent = ` ${label}`;
  } else {
    item.append(` ${label}`);
  }
}

function syncDemoChrome() {
  const nickMode = isNickDemoMode();
  const advancedMode = isAdvancedDemoMode();
  const simpleProductNav = (nickMode && !advancedMode) || (!isTwoPropertyMode() && !isFivePropertyMode());
  document.body.classList.toggle("nick-demo-mode", nickMode);
  document.body.classList.toggle("advanced-demo-mode", advancedMode);
  document.body.classList.toggle("hide-prototype-machinery", shouldHidePrototypeMachinery());
  document.body.classList.toggle("simple-product-nav", simpleProductNav);

  setNavItemLabel("Home", "Home");
  setNavItemLabel("Properties", simpleProductNav ? "Property" : "Properties");
  setNavItemLabel("Compliance centre", simpleProductNav ? "Complete property check" : "Compliance centre");
  setNavItemLabel("Journey OS", simpleProductNav ? "Add / check property" : "Add / check property");
  setNavItemLabel("Evidence Vault", simpleProductNav ? "Evidence" : "Evidence Vault");
  setNavItemLabel("Tasks", simpleProductNav ? "Action Plan" : "Tasks");
  setNavItemLabel("Activity", simpleProductNav ? "Monitoring" : "Activity");
  setNavItemLabel("Book a service", simpleProductNav ? "Services" : "Book a service");

  const portfolioHeading = document.querySelector("#navPortfolio");
  if (portfolioHeading) {
    portfolioHeading.textContent = simpleProductNav ? "Property" : "Portfolio";
  }
  const toolsHeading = document.querySelector("#navPortfolioTools");
  if (toolsHeading) {
    toolsHeading.textContent = simpleProductNav ? "Property tools" : "Portfolio tools";
  }
}

function hidePortfolioPages() {
  portfolioPageSelectors.forEach((selector) => {
    document.querySelector(selector)?.setAttribute("hidden", "");
  });
}

function hidePropertyPanelsAndTabs() {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("is-active");
  });
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });
}

function activatePortfolioPage({ selector, view, navLabel, bodyClass, response, scroll = false }) {
  const page = document.querySelector(selector);

  if (!page) {
    return;
  }

  labsState.currentView = view;
  document.body.classList.remove(...portfolioBodyClasses, "menu-open");
  document.body.classList.add(bodyClass || "portfolio-utility-active");
  if (bodyClass === "portfolio-compliance-active") {
    document.body.classList.add("checker-is-active");
  }
  hidePortfolioPages();
  page.hidden = false;
  hidePropertyPanelsAndTabs();
  syncDemoChrome();
  setGlobalNavActive(navLabel);
  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(response || getAssistantResponse(document.querySelector(".prompt-stack [data-prompt]")?.dataset.prompt || ""));

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function setCheckerActive() {
  document.body.classList.add("checker-is-active");
}

function focusAssistantInput() {
  const input = document.querySelector('[data-assistant-form] input[name="question"]');

  if (window.matchMedia("(max-width: 1240px)").matches) {
    openAssistant();
  }

  input?.focus({ preventScroll: false });
}

function switchTab(target) {
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  labsState.currentView = "property";
  labsState.activeTab = target;
  document.body.classList.remove(...portfolioBodyClasses, "menu-open");
  hidePortfolioPages();
  setGlobalNavActive(null);

  tabs.forEach((item) => {
    const isActive = item.dataset.tab === target;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === target;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  renderAllState();
  renderAssistantPrompts();

  if (target === "documents") {
    setAssistantResponse(labsState.eicrAdded ? postEicrAssistantResponses["What evidence am I missing?"] : assistantResponses["What evidence am I missing?"]);
  } else if (target === "compliance") {
    setAssistantResponse(getAssistantResponse("What should I fix first?"));
  } else if (target === "timeline") {
    renderTimelineState();
    setAssistantResponse(getAssistantResponse("What changed recently?"));
  } else if (target === "services") {
    renderServicesState();
    setAssistantResponse(getAssistantResponse("What should I arrange first?"));
  } else if (target === "details") {
    renderPropertyDetailsState();
    setAssistantResponse(getAssistantResponse("What details are still missing?"));
  } else {
    setAssistantResponse(getAssistantResponse("What should I fix first?"));
  }
}

function renderPortfolioHomeState() {
  const home = document.querySelector("[data-portfolio-home]");

  if (!home) {
    return;
  }

  const properties = getPortfolioProperties();
  const urgentProperty = properties.length ? portfolioUrgentProperty() : null;
  const latestActivity = getRecentActivityItems();
  const autopilotTitle = document.querySelector("[data-home-autopilot-title]");
  const autopilotBody = document.querySelector("[data-home-autopilot-body]");
  const rankList = document.querySelector("[data-home-priority-rank-list]");
  const summaryPrimary = document.querySelector("[data-home-open-action]");
  const summarySecondary = document.querySelector("[data-home-why]");
  const workspaceShortcut = document.querySelector("[data-home-open-workspace]");
  const homeSecondaryGrid = document.querySelector(".home-two-column");
  const homeQuickWin = document.querySelector(".home-quick-win-card");
  const homeKicker = document.querySelector("[data-portfolio-home] .section-kicker");
  const homeTitle = document.querySelector("#portfolioHomeTitle");
  const homeHeader = document.querySelector(".portfolio-home-header");
  const homeIntro = document.querySelector(".portfolio-home-header p:not(.section-kicker)");
  const homeBadge = document.querySelector(".portfolio-home-header .prototype-badge");
  const smartSearchSection = document.querySelector("[data-smart-search-results]");
  const autopilotCard = document.querySelector(".portfolio-autopilot-card");
  const pulseGrid = document.querySelector(".portfolio-pulse-grid");
  const homeScoreGrid = document.querySelector("[data-home-score-grid]");
  const homePriorityCard = document.querySelector(".home-priority-card");
  const homePropertySection = document.querySelector("#homePropertiesTitle")?.closest(".portfolio-section");
  const homeUpcomingSection = document.querySelector("#homeUpcomingTitle")?.closest(".portfolio-section");

  if (!properties.length) {
    homeHeader?.removeAttribute("hidden");
    smartSearchSection?.setAttribute("hidden", "");
    autopilotCard?.removeAttribute("hidden");
    pulseGrid?.removeAttribute("hidden");
    homeScoreGrid?.removeAttribute("hidden");
    homePriorityCard?.removeAttribute("hidden");
    homePropertySection?.removeAttribute("hidden");
    homeUpcomingSection?.removeAttribute("hidden");
    if (homeKicker) {
      homeKicker.textContent = "Home";
    }
    if (homeTitle) {
      homeTitle.textContent = "Welcome to ComplyMyProperty";
    }
    if (homeIntro) {
      homeIntro.textContent = "CMP helps landlords build a property compliance workspace, organise evidence, track tasks and request support.";
    }
    if (homeBadge) {
      homeBadge.textContent = "New landlord setup";
    }
    document.querySelectorAll("[data-home-add-property]").forEach((button) => {
      if (button.classList.contains("quiet-add")) {
        button.innerHTML = '<span aria-hidden="true">+</span> Add property';
      } else {
        button.textContent = "Add your first property";
      }
    });
    if (summaryPrimary) {
      summaryPrimary.textContent = "Add your first property";
    }
    if (summarySecondary) {
      summarySecondary.textContent = "Ask CMP what to prepare";
    }
    if (workspaceShortcut) {
      workspaceShortcut.hidden = true;
    }
    if (homeSecondaryGrid) {
      homeSecondaryGrid.hidden = true;
    }
    if (homeQuickWin) {
      homeQuickWin.hidden = true;
    }
    document.querySelector("[data-home-property-count]").textContent = "0";
    document.querySelector("[data-home-property-count-detail]").textContent = "properties tracked";
    document.querySelector("[data-home-priority-count]").textContent = "0";
    document.querySelector("[data-home-priority-detail]").textContent = "add a property first";
    document.querySelector("[data-home-verified-count]").textContent = "0";
    document.querySelector("[data-home-review-count]").textContent = "0";
    document.querySelector("[data-home-review-detail]").textContent = "nothing to review";
    document.querySelector("[data-home-summary-title]").textContent = "Add your first property";
    document.querySelector("[data-home-summary-body]").textContent = "CMP starts with a property address. It checks what it can automatically, then asks you to confirm the unknowns.";
    document.querySelector("[data-home-priority-area]").textContent = "Onboarding";
    document.querySelector("[data-home-priority-status]").textContent = "No properties yet";
    document.querySelector("[data-home-priority-body]").textContent = "CMP needs at least one property before it can personalise compliance checks, evidence scores or service recommendations.";
    document.querySelector("[data-home-upload-priority]").textContent = "Add your first property";
    document.querySelector("[data-home-arrange-priority]").textContent = "Ask CMP what to prepare";
    if (autopilotTitle) {
      autopilotTitle.textContent = "Start by adding a property";
    }
    if (autopilotBody) {
      autopilotBody.textContent = "No properties are connected yet. Add a property first so CMP can create the workspace, prepare demo matches and show the confirmations it still needs from you.";
    }
    if (rankList) {
      rankList.hidden = false;
      rankList.innerHTML = `
        <article class="priority-rank-item is-primary">
          <span>Step 1</span>
          <strong>Add your first property</strong>
          <p>Start with an address and postcode so CMP can create the property file.</p>
        </article>
        <article class="priority-rank-item">
          <span>Step 2</span>
          <strong>Review what CMP found</strong>
          <p>CMP prepares address, EPC and local signals first. The checker becomes useful after that property exists.</p>
        </article>
      `;
    }
    const propertyHeading = document.querySelector("#homePropertiesTitle");
    const propertyHeadingBlock = propertyHeading?.closest(".section-heading");
    if (propertyHeadingBlock) {
      propertyHeadingBlock.querySelector(".section-kicker").textContent = "Your properties";
      propertyHeading.textContent = "Your properties";
      propertyHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "Properties will appear here after setup.";
    }
    const upcomingHeading = document.querySelector("#homeUpcomingTitle");
    const upcomingHeadingBlock = upcomingHeading?.closest(".section-heading");
    if (upcomingHeadingBlock) {
      upcomingHeadingBlock.querySelector(".section-kicker").textContent = "Setup";
      upcomingHeading.textContent = "What happens after adding a property";
      upcomingHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "CMP starts with the address, then organises checks, evidence, tasks and support around that property.";
    }
    const homePromptRow = document.querySelector(".portfolio-prompt-row");
    if (homePromptRow) {
      homePromptRow.innerHTML = emptyGlobalAskPrompts.slice(0, 4)
        .map((prompt) => `<button type="button" data-home-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
        .join("");
    }
    const propertyList = document.querySelector("[data-home-property-list]");
    if (propertyList) {
      propertyList.innerHTML = `
        <article class="empty-portfolio-card">
          <span class="tile-icon" data-icon="building"></span>
          <h3>No properties yet</h3>
          <p>Add your first property to unlock compliance scoring, evidence tracking, tasks and service recommendations.</p>
          <div class="button-row">
            <button class="primary-button" type="button" data-home-add-property>Add your first property</button>
            <button class="secondary-button is-locked-preview" type="button" disabled aria-disabled="true">A-Z preview unlocks after property</button>
          </div>
        </article>
      `;
    }
    const upcomingGrid = document.querySelector("[data-home-upcoming-grid]");
    if (upcomingGrid) {
      upcomingGrid.innerHTML = [
        ["Add first property", "Create the first CMP property file."],
        ["Review what CMP found", "After Smart Search, confirm the demo matches and answer the unknowns."],
        ["Upload existing certificates", "Keep EPC, Gas Safety, EICR and tenancy documents ready."],
        ["Ask CMP what to do first", "Use the assistant for setup guidance."]
      ].map(([title, body]) => `
        <article class="portfolio-upcoming-card">
          <span class="source-badge">Setup</span>
          <h3>${title}</h3>
          <p>${body}</p>
          <button class="text-button" type="button" data-home-add-property>Start setup</button>
        </article>
      `).join("");
    }
    document.querySelector("[data-home-activity-list]").innerHTML = "<li>No property activity yet</li>";
    return;
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const tasks = newPropertyTaskItems();
    homeHeader?.setAttribute("hidden", "");
    if (smartSearchSection) {
      smartSearchSection.hidden = false;
      smartSearchSection.innerHTML = renderSmartSearchResults();
    }
    autopilotCard?.setAttribute("hidden", "");
    pulseGrid?.setAttribute("hidden", "");
    homeScoreGrid?.setAttribute("hidden", "");
    homePriorityCard?.setAttribute("hidden", "");
    homePropertySection?.setAttribute("hidden", "");
    homeUpcomingSection?.setAttribute("hidden", "");
    if (homeKicker) {
      homeKicker.textContent = "Smart Search Results";
    }
    if (homeTitle) {
      homeTitle.textContent = "Here\u2019s what CMP found about your property";
    }
    if (homeIntro) {
      homeIntro.textContent = "CMP matched the address, checked EPC-style records and prepared a starting property profile. Review the findings, then save them to this property.";
    }
    if (homeBadge) {
      homeBadge.textContent = "57 The Butts \u00b7 Coventry, CV1 3BJ";
    }
    document.querySelectorAll("[data-home-add-property]").forEach((button) => {
      if (button.classList.contains("quiet-add")) {
        button.innerHTML = '<span aria-hidden="true">+</span> Add property';
      } else {
        button.textContent = "Add property";
      }
    });
    if (summaryPrimary) {
      summaryPrimary.textContent = "Review smart search";
    }
    if (summarySecondary) {
      summarySecondary.textContent = "Upload certificates";
    }
    if (workspaceShortcut) {
      workspaceShortcut.hidden = false;
    }
    if (homeSecondaryGrid) {
      homeSecondaryGrid.hidden = true;
    }
    if (homeQuickWin) {
      homeQuickWin.hidden = true;
    }
    document.querySelector("[data-home-property-count]").textContent = "1";
    document.querySelector("[data-home-property-count-detail]").textContent = "new profile";
    document.querySelector("[data-home-priority-count]").textContent = String(tasks.length);
    document.querySelector("[data-home-priority-detail]").textContent = tasks.length === 1 ? "setup task" : "setup tasks";
    document.querySelector("[data-home-verified-count]").textContent = String(summary.evidenceConfidenceScore > 0 ? 1 : 0);
    document.querySelector("[data-home-review-count]").textContent = String(summary.missingEvidence.length);
    document.querySelector("[data-home-review-detail]").textContent = summary.evidenceConfidenceLabel;
    document.querySelector("[data-home-summary-title]").textContent = "Your first property profile is ready";
    document.querySelector("[data-home-summary-body]").textContent = "CMP has matched 57 The Butts, prepared EPC context for review and created a starting workspace. Confirm the details before CMP scores the property or recommends services.";
    const priorityKicker = document.querySelector(".home-priority-card .section-kicker");
    const priorityTitle = document.querySelector(".home-priority-card h2");
    if (priorityKicker) {
      priorityKicker.textContent = "What CMP found";
    }
    if (priorityTitle) {
      priorityTitle.textContent = "What CMP found automatically";
    }
    document.querySelector("[data-home-priority-area]").textContent = "Starting signals";
    document.querySelector("[data-home-priority-status]").textContent = summary.readinessLabel;
    document.querySelector("[data-home-priority-body]").textContent = summary.statusLine;
    document.querySelector("[data-home-upload-priority]").textContent = "Review smart search";
    document.querySelector("[data-home-arrange-priority]").textContent = "Upload certificates";
    if (workspaceShortcut) {
      workspaceShortcut.textContent = "Ask CMP what matters first";
    }
    if (autopilotTitle) {
      autopilotTitle.textContent = "Your first property profile is ready";
    }
    if (autopilotBody) {
      autopilotBody.textContent = "CMP has matched 57 The Butts, prepared EPC context for review and created a starting workspace. The file is not mature yet.";
    }
    if (rankList) {
      rankList.hidden = false;
      rankList.innerHTML = `
        <article class="priority-rank-item is-primary">
          <span>Found</span>
          <strong>Address matched</strong>
          <p>Flat 42, 57 The Butts, Coventry, CV1 3BJ is connected to this workspace.</p>
        </article>
        <article class="priority-rank-item">
          <span>Found</span>
          <strong>EPC record prepared for review</strong>
          <p>CMP has prepared an EPC signal, but it still needs landlord review before it becomes trusted evidence.</p>
        </article>
        <article class="priority-rank-item">
          <span>Found</span>
          <strong>Postcode ready for local checks</strong>
          <p>Local licensing and postcode-based checks can continue once property details are confirmed.</p>
        </article>
        <article class="priority-rank-item">
          <span>Created</span>
          <strong>Property workspace created</strong>
          <p>The property file is ready for evidence, answers and next steps.</p>
        </article>
      `;
    }
    const homePromptRow = document.querySelector(".portfolio-prompt-row");
    if (homePromptRow) {
      homePromptRow.innerHTML = newPropertyAskPrompts.slice(0, 4)
        .map((prompt) => `<button type="button" data-home-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
        .join("");
    }
    const propertyList = document.querySelector("[data-home-property-list]");
    if (propertyList) {
      propertyList.innerHTML = `
        <article class="portfolio-property-card is-most-urgent">
          <div class="portfolio-property-main">
            <span class="status-dot" aria-hidden="true"></span>
            <div>
              <div class="property-card-heading-row">
                <h3>57 The Butts</h3>
                <span class="source-badge">New profile</span>
              </div>
              <p>Coventry, CV1 3BJ</p>
              <div class="signal-row">
                <span>Flat / apartment</span>
                <span>Bedrooms need confirmation</span>
                <span>Occupancy unknown</span>
              </div>
            </div>
          </div>
          <div class="portfolio-property-progress">
            <span>Evidence confidence</span>
            <strong>${summary.evidenceConfidenceScore}%</strong>
            <div class="strength-meter"><span style="width: ${summary.evidenceConfidenceScore}%"></span></div>
            <small>${escapeHtml(summary.evidenceConfidenceHelp)}</small>
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-az-mode="single">Review smart search</button>
            <button class="secondary-button" type="button" data-home-upload-priority>Upload certificates</button>
            <button class="text-button" type="button" data-home-open-property-id="the-butts">Open workspace</button>
          </div>
        </article>
      `;
    }
    const propertyHeading = document.querySelector("#homePropertiesTitle");
    const propertyHeadingBlock = propertyHeading?.closest(".section-heading");
    if (propertyHeadingBlock) {
      propertyHeadingBlock.querySelector(".section-kicker").textContent = "Your property";
      propertyHeading.textContent = "57 The Butts";
      propertyHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "This card is secondary to setup. Use it to reopen the new property profile after reviewing what CMP found.";
    }
    const upcomingHeading = document.querySelector("#homeUpcomingTitle");
    const upcomingHeadingBlock = upcomingHeading?.closest(".section-heading");
    if (upcomingHeadingBlock) {
      upcomingHeadingBlock.querySelector(".section-kicker").textContent = "Confirm next";
      upcomingHeading.textContent = "The setup path";
      upcomingHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "CMP needs these landlord confirmations before scores, tasks and recommendations become reliable.";
    }
    const upcomingGrid = document.querySelector("[data-home-upcoming-grid]");
    if (upcomingGrid) {
      upcomingGrid.innerHTML = [
        ["Review smart search", "Step 1", "Confirm the matched address, EPC context, property type, bedrooms and occupancy.", "Review findings", 'data-az-mode="single"'],
        ["Complete guided compliance check", "Step 2", "Answer what CMP cannot know, then upload evidence if you already have it.", "Open check", "data-new-setup-start"]
      ].map(([title, badge, body, action, buttonAttr]) => `
        <article class="portfolio-upcoming-card">
          <span class="source-badge">${escapeHtml(badge)}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(body)}</p>
          <button class="text-button" type="button" ${buttonAttr}>${escapeHtml(action)}</button>
        </article>
      `).join("");
    }
    document.querySelector("[data-home-activity-list]").innerHTML = getActivityEvents()
      .slice(0, 4)
      .map((item) => `<li>${escapeHtml(item.title)}</li>`)
      .join("");
    return;
  }

  if (homeKicker) {
    homeKicker.textContent = "Portfolio Home";
  }
  homeHeader?.removeAttribute("hidden");
  smartSearchSection?.setAttribute("hidden", "");
  autopilotCard?.removeAttribute("hidden");
  pulseGrid?.removeAttribute("hidden");
  homeScoreGrid?.removeAttribute("hidden");
  homePriorityCard?.removeAttribute("hidden");
  homePropertySection?.removeAttribute("hidden");
  homeUpcomingSection?.removeAttribute("hidden");
  if (homeTitle) {
    homeTitle.textContent = "Welcome to ComplyMyProperty";
  }
  if (homeIntro) {
    homeIntro.textContent = "CMP helps landlords build a property compliance workspace, organise evidence, track tasks and request support.";
  }
  if (homeBadge) {
    homeBadge.textContent = "New landlord setup";
  }
  const propertyHeading = document.querySelector("#homePropertiesTitle");
  const propertyHeadingBlock = propertyHeading?.closest(".section-heading");
  if (propertyHeadingBlock) {
    propertyHeadingBlock.querySelector(".section-kicker").textContent = "Your portfolio";
    propertyHeading.textContent = "Your properties";
    propertyHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "Open a property workspace to review evidence, compliance checks, activity and useful next steps.";
  }
  const upcomingHeading = document.querySelector("#homeUpcomingTitle");
  const upcomingHeadingBlock = upcomingHeading?.closest(".section-heading");
  if (upcomingHeadingBlock) {
    upcomingHeadingBlock.querySelector(".section-kicker").textContent = "Looking ahead";
    upcomingHeading.textContent = "Upcoming compliance and reviews";
    upcomingHeadingBlock.querySelector("p:not(.section-kicker)").textContent = "CMP keeps a simple watchlist so important actions do not disappear into the background.";
  }
  document.querySelectorAll("[data-home-add-property]").forEach((button) => {
    if (button.classList.contains("quiet-add")) {
      button.innerHTML = '<span aria-hidden="true">+</span> Add property';
    } else {
      button.textContent = button.classList.contains("quiet-button") ? "+ Add another property" : "Add property";
    }
  });
  if (summaryPrimary) {
    summaryPrimary.textContent = "Review next action";
  }
  if (summarySecondary) {
    summarySecondary.textContent = "Ask CMP why this matters";
  }
  if (workspaceShortcut) {
    workspaceShortcut.hidden = false;
  }
  if (homeSecondaryGrid) {
    homeSecondaryGrid.hidden = false;
  }
  if (homeQuickWin) {
    homeQuickWin.hidden = false;
  }
  const homePromptRow = document.querySelector(".portfolio-prompt-row");
  if (homePromptRow) {
    homePromptRow.innerHTML = portfolioPrompts
      .map((prompt) => `<button type="button" data-home-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
      .join("");
  }
  const activeRequest = urgentProperty.currentRequest;
  const propertyCountLabel = properties.length === 1 ? "property tracked" : "properties tracked";

  if (autopilotTitle) {
    autopilotTitle.textContent = isFivePropertyMode()
      ? "Your five-property portfolio has two urgent actions"
      : isTwoPropertyMode()
      ? "Your portfolio has a clear priority"
      : "Your portfolio has one clear next step";
  }
  if (autopilotBody) {
    autopilotBody.textContent = isFivePropertyMode()
      ? "CMP has compared five properties, separated compliance readiness from evidence completeness and found one evidence-ready file."
      : isTwoPropertyMode()
      ? "CMP has compared both properties and found the most time-sensitive action first, while keeping other evidence gaps visible."
      : "CMP has reviewed the information currently stored for your property and highlighted the most useful action to take next.";
  }
  document.querySelector("[data-home-summary-title]").textContent = isTwoPropertyMode()
    ? isFivePropertyMode()
      ? "Portfolio sweep: 1 evidence-ready, 2 urgent actions"
      : "Priority 1: Gas Safety renewal — 18 Willow Brook Drive"
    : labsState.eicrAdded
      ? "Add recent inspection evidence for 57 The Butts"
      : "Check whether 57 The Butts has a current EICR";
  document.querySelector("[data-home-summary-body]").textContent = isTwoPropertyMode()
    ? isFivePropertyMode()
      ? `${fullyCompliantProperties().length} property is evidence-ready. ${portfolioUrgentActionCount()} urgent actions and ${portfolioEvidenceGapCount()} evidence gaps remain across the portfolio.`
      : "Gas Safety renewal is approaching sooner, so this is the first portfolio action to deal with."
    : labsState.eicrAdded
      ? "Electrical Safety is recorded. Inspection evidence is the next useful improvement."
      : "Electrical Safety is the clearest evidence gap in the property file.";
  if (rankList) {
    rankList.hidden = !(isTwoPropertyMode() || isFivePropertyMode());
    rankList.innerHTML = isFivePropertyMode()
      ? getPortfolioProperties().slice().sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0)).slice(0, 3).map((property, index) => `
        <article class="priority-rank-item${index === 0 ? " is-primary" : ""}">
          <span>${index === 0 ? "Priority 1" : "Watch"}</span>
          <strong>${escapeHtml(property.focus)} — ${escapeHtml(property.address)}</strong>
          <p>${escapeHtml(property.priorityBody)}</p>
        </article>
      `).join("")
      : isTwoPropertyMode()
      ? `
        <article class="priority-rank-item is-primary">
          <span>Priority 1</span>
          <strong>Gas Safety renewal — 18 Willow Brook Drive</strong>
          <p>Renewal evidence is needed in 21 days, so CMP ranks this first.</p>
        </article>
        <article class="priority-rank-item">
          <span>Also watch</span>
          <strong>${labsState.eicrAdded ? "Inspection evidence" : "EICR evidence"} — 57 The Butts</strong>
          <p>${labsState.eicrAdded ? "Electrical Safety is verified; inspection evidence is the next useful record." : "Electrical Safety evidence is still missing, but it is less time-sensitive in this demo state."}</p>
        </article>
      `
      : "";
  }
  document.querySelector("[data-home-property-count]").textContent = String(properties.length);
  document.querySelector("[data-home-property-count-detail]").textContent = propertyCountLabel;
  document.querySelector("[data-home-priority-count]").textContent = String(isFivePropertyMode() ? portfolioUrgentActionCount() : isTwoPropertyMode() ? 2 : 1);
  document.querySelector("[data-home-priority-detail]").textContent = activeRequest
    ? "request awaiting review"
    : isTwoPropertyMode() ? "ranked by urgency" : "clear next step";
  document.querySelector("[data-home-verified-count]").textContent = String(properties.reduce((sum, property) => sum + property.verifiedEvidence, 0));
  document.querySelector("[data-home-review-count]").textContent = String(isFivePropertyMode() ? portfolioEvidenceGapCount() : properties.reduce((sum, property) => sum + property.reviewCount, 0));
  document.querySelector("[data-home-review-detail]").textContent = "areas still checking";
  document.querySelector("[data-home-priority-area]").textContent = urgentProperty.focusArea;
  document.querySelector("[data-home-priority-status]").textContent = urgentProperty.state;
  document.querySelector("[data-home-priority-body]").textContent = isFivePropertyMode()
    ? `${urgentProperty.label}: ${urgentProperty.priorityBody} Portfolio-wide: ${fullyCompliantProperties().length} property is evidence-ready and ${portfolioEvidenceGapCount()} evidence gaps remain.`
    : isTwoPropertyMode()
    ? `Priority 1: ${urgentProperty.focus} — ${urgentProperty.address}. ${urgentProperty.priorityBody} Also watch: 57 The Butts ${labsState.eicrAdded ? "needs inspection evidence next." : "still needs Electrical Safety evidence."}`
    : `${urgentProperty.label}: ${urgentProperty.priorityBody}`;
  document.querySelector("[data-home-upload-priority]").textContent = urgentProperty.id === "willow-brook"
    ? "Upload Gas Safety certificate"
    : labsState.eicrAdded ? "Upload inspection evidence" : "Upload EICR";
  document.querySelector("[data-home-arrange-priority]").textContent = urgentProperty.id === "willow-brook"
    ? "Request Gas Safety support"
    : labsState.eicrAdded ? "Arrange an inspection" : "Arrange an EICR";

  const propertyList = document.querySelector("[data-home-property-list]");
  if (propertyList) {
    propertyList.innerHTML = properties.map((property) => `
      <article class="portfolio-property-card${property.mostUrgent ? " is-most-urgent" : ""}">
        <div class="portfolio-property-main">
          <span class="status-dot" aria-hidden="true"></span>
          <div>
            <div class="property-card-heading-row">
              <h3>${escapeHtml(property.address)}</h3>
              ${property.mostUrgent ? '<span class="source-badge">Most urgent</span>' : ""}
            </div>
            <p>${escapeHtml(property.location)}</p>
            <div class="signal-row">
              <span>${escapeHtml(property.occupancy)}</span>
              <span>${escapeHtml(property.journey)}</span>
              ${property.currentRequest ? '<span>Open request</span>' : ""}
            </div>
          </div>
        </div>
        <div class="portfolio-property-progress">
          <span>Compliance score</span>
          <strong>${property.complianceScore}% ready</strong>
          <div class="strength-meter score-compliance"><span style="width: ${property.complianceScore}%"></span></div>
          <span>Evidence score</span>
          <strong>${property.evidenceScore}% evidenced</strong>
          <div class="strength-meter"><span style="width: ${property.evidenceScore}%"></span></div>
          <small>${escapeHtml(property.statusDetail)}</small>
        </div>
        <div class="button-row">
          <button class="primary-button" type="button" data-home-open-property-id="${escapeHtml(property.id)}">Open workspace</button>
          <button class="text-button" type="button" data-home-view-activity-id="${escapeHtml(property.id)}">View activity</button>
          ${property.id === "the-butts" ? '<button class="secondary-button quiet-button" type="button" data-home-add-property>+ Add another property</button>' : ""}
        </div>
      </article>
    `).join("");
  }

  const upcomingGrid = document.querySelector("[data-home-upcoming-grid]");
  if (upcomingGrid) {
    const upcomingItems = isFivePropertyMode()
      ? getPortfolioProperties()
        .filter((property) => property.complianceScore < 100 || property.mostUrgent)
        .slice(0, 4)
        .map((property) => ({
          badge: property.mostUrgent ? "Urgent" : property.state,
          title: property.focus,
          property: property.label || `${property.address} · ${property.postcode}`,
          body: property.priorityBody,
          action: `azSingle:${property.id}`,
          label: "Run A-Z check"
        }))
      : [
      ...(isTwoPropertyMode()
        ? [{
            badge: "Renewal in 21 days",
            title: "Gas Safety renewal",
            property: "18 Willow Brook Drive · B37 7BA",
            body: "Book or upload renewal evidence before the current certificate becomes a risk.",
            action: "gas",
            label: "Review renewal"
          }]
        : []),
      {
        badge: labsState.eicrAdded ? "Recommended" : "Follow-up",
        title: "Inspection review",
        property: "57 The Butts · CV1 3BJ",
        body: "Confirm whether a recent inspection has been completed or schedule the next one.",
        action: "inspection",
        label: "Review inspection"
      },
      {
        badge: labsState.eicrAdded ? "Verified" : "Missing",
        title: "Electrical Safety",
        property: "57 The Butts · CV1 3BJ",
        body: labsState.eicrAdded ? "EICR evidence is now verified and linked to the property." : "Upload or arrange EICR evidence for the property file.",
        action: "eicr",
        label: labsState.eicrAdded ? "View evidence" : "Review EICR"
      },
      {
        badge: "Checking postcode",
        title: "Local licensing",
        property: isTwoPropertyMode() ? "Both properties" : "57 The Butts · CV1 3BJ",
        body: "CMP is reviewing whether local rules may affect the address and occupancy profile.",
        action: "licensing",
        label: "Review licensing"
      },
      {
        badge: "Needs evidence",
        title: "Alarm evidence",
        property: isTwoPropertyMode() ? "18 Willow Brook Drive · B37 7BA" : "57 The Butts · CV1 3BJ",
        body: isTwoPropertyMode() ? "Willow Brook still needs a landlord answer and supporting evidence." : "Smoke and CO alarms were reported as tested. Supporting evidence can be added later.",
        action: "alarms",
        label: "Add evidence"
      }
    ];

    upcomingGrid.innerHTML = upcomingItems.slice(0, 4).map((item) => `
      <article class="portfolio-upcoming-card">
        <span class="source-badge">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <small class="property-card-label">${escapeHtml(item.property)}</small>
        <p>${escapeHtml(item.body)}</p>
        <button class="text-button" type="button" data-home-upcoming="${escapeHtml(item.action)}">${escapeHtml(item.label)}</button>
      </article>
    `).join("");
  }

  document.querySelector("[data-home-activity-list]").innerHTML = latestActivity
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const quickTitle = document.querySelector("[data-home-quick-title]");
  const quickBody = document.querySelector("[data-home-quick-body]");
  const quickButton = document.querySelector("[data-home-quick-win-open]");

  if (labsState.alarmAnswer) {
    quickTitle.textContent = "Alarm-testing answer recorded";
    quickBody.textContent = `Saved answer: ${labsState.alarmAnswer}. You can update this later from the property timeline.`;
    quickButton.textContent = "Update answer";
  } else {
    quickTitle.textContent = "Complete a useful task in approximately 2 minutes";
    quickBody.textContent = "Confirm whether smoke and CO alarms have been tested recently.";
    quickButton.textContent = "Complete now";
  }
}

function showPortfolioHome({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-home]",
    view: "home",
    navLabel: "Home",
    bodyClass: "portfolio-home-active",
    response: getPortfolioAssistantResponse("What should I do today?"),
    scroll
  });
}

function journeyState() {
  if (!labsState.journeyState) {
    labsState.journeyState = createInitialJourneyState();
  }
  return labsState.journeyState;
}

function clearJourneyTimers() {
  const state = journeyState();
  (state.autoTimers || []).forEach((timer) => window.clearTimeout(timer));
  (state.brainTimers || []).forEach((timer) => window.clearTimeout(timer));
  (state.scannerTimers || []).forEach((timer) => window.clearTimeout(timer));
  state.autoTimers = [];
  state.brainTimers = [];
  state.scannerTimers = [];
}

function journeyScenario() {
  return journeyDemoScenarios[journeyState().scenarioId] || journeyDemoScenarios["clean-property-match"];
}

function hasJourneyPropertyBrainActivity() {
  const state = journeyState();
  return state.currentStage !== "start"
    || state.screen !== "start"
    || Boolean(state.selectedMatchId)
    || Object.keys(state.answers || {}).length > 0
    || (state.timelineEvents || []).length > 1
    || (state.evidenceVault || []).length > 0
    || (state.serviceBasket || []).length > 0;
}

function conditionAnswerIds(state = journeyState()) {
  const value = state.answers?.condition;
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

function conditionAnswerLabels(ids = conditionAnswerIds()) {
  const question = journeyUnknownQuestions.find((item) => item.id === "condition");
  return ids.map((id) => question?.options.find((option) => option.id === id)?.label || id);
}

function serviceLifecycleLabel(status = "recommended") {
  const labels = {
    recommended: "Recommended",
    added: "Added to basket",
    quote_requested: "Quote requested",
    booked: "Booked",
    pending: "In progress",
    completed: "Completed",
    deferred: "Saved for later",
    required: "Required",
    pending_evidence: "Pending from booking",
    uploaded: "Uploaded",
    accepted: "Verified simulation",
    rejected: "Rejected",
    expired: "Expired",
    review: "Needs review"
  };
  return labels[status] || status.replace(/_/g, " ");
}

function serviceEvidenceConfig(serviceId) {
  const service = journeyServiceById(serviceId);
  const fallback = {
    title: `${service.title} evidence`,
    area: service.linkedComplianceArea,
    renewalId: "evidence-review-due",
    dueDate: "Follow-up in 14 days",
    expiryDate: "Review date to confirm",
    actionId: service.linkedActionIds[0] || service.id
  };
  const configs = {
    "gas-safety-certificate": { title: "Gas Safety Certificate", area: "Gas Safety", renewalId: "gas-renewal", dueDate: "12 months after certificate", expiryDate: "14 June 2027", actionId: "gas-safety" },
    eicr: { title: "EICR", area: "Electrical Safety", renewalId: "eicr-renewal", dueDate: "5-year renewal watch", expiryDate: "14 June 2031", actionId: "eicr" },
    "smoke-co-alarm-check": { title: "Smoke/CO Alarm Check Report", area: "Smoke and CO", renewalId: "evidence-review-due", dueDate: "Next tenancy / annual review", expiryDate: "Annual review", actionId: "alarms" },
    "licensing-check": { title: "Licensing Check Report", area: "Licensing", renewalId: "licensing-watch", dueDate: "Council/licence watch", expiryDate: "Council result pending", actionId: "hmo-licensing" },
    "hmo-licence-application": { title: "Licence Application Pack", area: "Licensing", renewalId: "licensing-watch", dueDate: "Council response watch", expiryDate: "Council result pending", actionId: "hmo-licensing" },
    "fire-risk-assessment": { title: "Fire Risk Assessment", area: "Licensing", renewalId: "evidence-review-due", dueDate: "Annual review", expiryDate: "Annual review", actionId: "hmo-bundle" },
    "room-measurement": { title: "Room Measurement Evidence", area: "Licensing", renewalId: "evidence-review-due", dueDate: "Before licence application", expiryDate: "Not applicable", actionId: "hmo-licensing" },
    "epc-assessment": { title: "EPC Assessment", area: "EPC", renewalId: "epc-expiry-monitor", dueDate: "10-year EPC watch", expiryDate: "14 June 2036", actionId: "book-epc" },
    "epc-improvement-plan": { title: "EPC Improvement Plan", area: "EPC", renewalId: "epc-c-readiness", dueDate: "Future EPC C watch", expiryDate: "Roadmap review due", actionId: "epc-e-roadmap" },
    "epc-c-roadmap": { title: "EPC C Roadmap", area: "EPC", renewalId: "epc-c-readiness", dueDate: "Quarterly improvement watch", expiryDate: "Roadmap review due", actionId: "epc-e-roadmap" },
    "mees-exemption-review": { title: "MEES Improvement/Exemption Review", area: "EPC", renewalId: "epc-c-readiness", dueDate: "Urgent MEES follow-up", expiryDate: "Review outcome pending", actionId: "mees-review" },
    "deposit-compliance-review": { title: "Deposit Compliance Review", area: "Deposit", renewalId: "evidence-review-due", dueDate: "Evidence review due", expiryDate: "Not applicable", actionId: "deposit-review" },
    "prescribed-info-evidence": { title: "Prescribed Information Evidence", area: "Deposit", renewalId: "evidence-review-due", dueDate: "Evidence review due", expiryDate: "Not applicable", actionId: "prescribed-info" },
    "right-to-rent-review": { title: "Right to Rent Evidence Review", area: "Right to Rent", renewalId: "evidence-review-due", dueDate: "Repeat check watch", expiryDate: "Status dependent", actionId: "right-to-rent" },
    "tenancy-document-pack": { title: "Tenancy Document Pack", area: "Tenancy documents", renewalId: "evidence-review-due", dueDate: "Evidence review due", expiryDate: "Not applicable", actionId: "tenancy-docs" },
    "inventory-check-in": { title: "Inventory / Check-In Report", area: "Evidence", renewalId: "inspection-due", dueDate: "Next tenancy/check-out", expiryDate: "Not applicable", actionId: "inventory" },
    "checkout-report": { title: "Check-Out Report", area: "Evidence", renewalId: "inspection-due", dueDate: "End of tenancy follow-up", expiryDate: "Not applicable", actionId: "inventory" },
    "damp-mould-survey": { title: "Damp/Mould Survey Report", area: "Condition", renewalId: "condition-review", dueDate: "Follow-up in 14 days", expiryDate: "Review follow-up", actionId: "damp-survey" },
    "pest-control": { title: "Pest Control Treatment Record", area: "Condition", renewalId: "condition-review", dueDate: "Follow-up in 14 days", expiryDate: "Treatment follow-up", actionId: "pest-condition-risk" },
    "condition-inspection": { title: "Property Condition Inspection", area: "Condition", renewalId: "inspection-due", dueDate: "Inspection follow-up", expiryDate: "Annual review", actionId: "condition-inspection" },
    "heating-hot-water-repair": { title: "Heating/Hot Water Repair Record", area: "Condition", renewalId: "condition-review", dueDate: "Repair follow-up", expiryDate: "Review follow-up", actionId: "damp-condition-risk" },
    "roof-gutter-inspection": { title: "Roof/Gutter Inspection Report", area: "Condition", renewalId: "condition-review", dueDate: "Repair follow-up", expiryDate: "Review follow-up", actionId: "damp-condition-risk" },
    "annual-monitoring": { title: "Annual Compliance Review Plan", area: "Monitoring", renewalId: "annual-review", dueDate: "Annual review", expiryDate: "15 June 2027", actionId: "annual-monitoring" },
    "done-for-me-concierge": { title: "Done-for-Me Concierge Plan", area: "Service coordination", renewalId: "annual-review", dueDate: "Concierge follow-up", expiryDate: "Monthly review", actionId: "annual-monitoring" }
  };
  return { ...fallback, ...(configs[serviceId] || {}) };
}

function serviceConfirmationFor(status, item, services = [journeyServiceById(item.serviceId)]) {
  const referencePrefix = status === "quote_requested" ? "CMP-QUOTE" : status === "booked" ? "CMP-BOOK" : status === "pending" ? "CMP-JOB" : status === "completed" ? "CMP-EVID" : "CMP-BASKET";
  const reference = `${referencePrefix}-${String(Date.now()).slice(-6)}`;
  const titles = {
    added: "Service added to basket",
    quote_requested: "Quote request prepared",
    booked: "Booking prepared",
    pending: "Service marked in progress",
    completed: "Service completed",
    deferred: "Service saved for later"
  };
  const bodies = {
    added: "CMP added this to the fake basket. Risk stays visible until the service is quoted, booked, completed or evidence is uploaded.",
    quote_requested: "CMP prepared supplier-ready quote details. Compliance risk remains open until the quote becomes a booking or evidence is accepted.",
    booked: "CMP prepared a fake booking, added pending evidence, updated monitoring and logged the next step.",
    pending: "CMP marked the fake job in progress and kept the evidence follow-up visible.",
    completed: "CMP generated simulated evidence, updated the Property Intelligence profile, refreshed monitoring and logged completion.",
    deferred: "CMP saved this for later without treating it as solved."
  };
  return {
    id: `confirmation-${reference}`,
    title: titles[status] || "Service updated",
    body: bodies[status] || "The fake service state was updated.",
    reference,
    status,
    serviceIds: services.map((service) => service.id),
    services: services.map((service) => service.title),
    evidenceExpected: services.map((service) => serviceEvidenceConfig(service.id).title),
    nextStep: status === "quote_requested" ? "Review the quote request or mark it accepted." : status === "completed" ? "View generated evidence or set renewal monitoring." : "Return to the workspace or continue with the service basket.",
    property: journeyState().propertyBrain.PropertyIdentity.address
  };
}

function serviceMatchesFilter(service, filterId = journeyState().serviceFilter || "all") {
  if (filterId === "all") {
    return true;
  }
  const filter = journeyServiceFilters.find((item) => item.id === filterId);
  if (!filter) {
    return true;
  }
  const tags = service.bundleTags || [];
  return (filter.tags || []).some((tag) => tags.includes(tag)) || (filter.areas || []).includes(service.linkedComplianceArea);
}

function startJourneyFromNewPropertyState({ scroll = true } = {}) {
  clearJourneyTimers();
  labsState.portfolioMode = "new";
  labsState.selectedServicePropertyId = "the-butts";
  labsState.azMode = "single";
  labsState.azPropertyId = "the-butts";
  labsState.currentView = "home";
  addNewPropertySetupActivity({
    id: "new-property-workspace-created",
    filter: "details",
    category: "Property setup",
    title: "Property workspace created",
    body: "Address matched. EPC/property record prepared for review. CMP is ready to ask for the unknowns.",
    source: "Smart Search demo match",
    status: "Prepared for review",
    statusClass: "status-review-text",
    search: "property workspace created address matched epc prepared review unknowns",
    why: "CMP recorded this because the public Add Property flow handed off into the new property workspace.",
    nextAction: "Review Smart Search and confirm the unknowns.",
    route: "home",
    actions: [
      makeActivityAction("Review Smart Search", "reviewFindings", true),
      makeActivityAction("Ask CMP", "askCmp")
    ]
  });
  showPortfolioHome({ scroll });
  showToast("Property workspace created. Review Smart Search next.");
}

function addTimelineEvent(event) {
  const state = journeyState();
  state.timelineEvents.unshift({
    id: event.id || `journey-event-${Date.now()}`,
    title: event.title,
    body: event.body,
    type: event.type || "Journey OS",
    time: event.time || "Just now"
  });
}

function setJourneyStage(stageId, screen = stageId) {
  const state = journeyState();
  state.currentStage = stageId;
  state.screen = screen;
  renderJourneyOsState();
}

function applyDemoScenario(scenarioId) {
  clearJourneyTimers();
  labsState.journeyState = createInitialJourneyState(scenarioId);
  addTimelineEvent({
    title: "Demo scenario changed",
    body: `${journeyDemoScenarios[scenarioId]?.label || "Journey scenario"} loaded with simulated checks.`,
    type: "Demo mode"
  });
  showJourneyOs({ scroll: false });
  showToast("Journey OS scenario updated.");
}

function guidedDemoState() {
  if (!labsState.guidedDemo) {
    labsState.guidedDemo = {
      enabled: false,
      activeStoryId: "",
      activeMomentIndex: 0,
      mode: "landing",
      lastNormalScenarioId: journeyState().scenarioId,
      hasSeenLanding: false
    };
  }
  return labsState.guidedDemo;
}

function currentGuidedStory() {
  const demo = guidedDemoState();
  return guidedDemoStories[demo.activeStoryId] || null;
}

function currentGuidedMoment() {
  const story = currentGuidedStory();
  const demo = guidedDemoState();
  return story?.moments?.[demo.activeMomentIndex] || null;
}

function syncGuidedDemoClass() {
  document.body.classList.toggle("journey-guided-active", Boolean(guidedDemoState().enabled));
}

function resetJourneyStateForGuidedStory(storyId) {
  const story = guidedDemoStories[storyId] || guidedDemoStories["clean-property-check"];
  clearJourneyTimers();
  labsState.journeyState = createInitialJourneyState(story.scenarioId);
  const state = journeyState();
  addTimelineEvent({
    title: `${story.title} story started`,
    body: "Guided demo reset this Property Intelligence profile with simulated data.",
    type: "Guided demo"
  });
  return state;
}

function applyGuidedAnswerSet(answers = {}, unknownIndex = null) {
  const orderedAnswers = journeyUnknownQuestions
    .map((question) => [question.id, answers[question.id]])
    .filter(([, answerId]) => Boolean(answerId));

  orderedAnswers.forEach(([questionId, answerId]) => {
    answerUnknown(questionId, answerId);
  });

  const state = journeyState();
  state.unknownIndex = unknownIndex ?? (orderedAnswers.length ? journeyUnknownQuestions.length : state.unknownIndex);
  state.actionPlan = buildJourneyActionPlan(state);
  state.serviceRecommendations = buildServiceRecommendations(state);
}

function addGuidedTenantMessage(templateId = "damp-photos") {
  const state = journeyState();
  const template = journeyTenantMessageTemplates.find((item) => item.id === templateId) || journeyTenantMessageTemplates[0];
  const message = {
    id: `guided-message-${template.id}`,
    title: template.title,
    body: template.body.replaceAll("[Property Address]", state.propertyBrain.PropertyIdentity.address),
    linkedServiceId: template.linkedServiceId,
    status: "logged"
  };
  state.generatedMessages.unshift(message);
  addTimelineEvent({
    title: "Tenant message generated",
    body: `${message.title} prepared and logged in guided demo mode.`,
    type: "Tenant message"
  });
}

function addGuidedConditionEvidence() {
  const state = journeyState();
  state.evidenceVault.unshift({
    id: "guided-damp-evidence",
    documentType: "damp-photos",
    title: "Damp/mould photos",
    linkedComplianceArea: "Condition",
    uploadStatus: "accepted",
    fakeScanResult: "Guided scan accepted",
    addressMatch: `Matched to ${state.propertyBrain.PropertyIdentity.address}`,
    extractedDate: "Just now",
    expiryDate: "Not applicable",
    confidence: "Medium",
    reviewStatus: "accepted",
    scoreImpact: 5,
    timelineLink: "guided-damp-evidence"
  });
  addTimelineEvent({
    title: "Evidence and communication logged",
    body: "Damp/mould photo evidence and tenant communication were added to the guided timeline.",
    type: "Evidence scan"
  });
}

function enterGuidedDemo(storyId = "") {
  clearNickDemoStoredState();
  const demo = guidedDemoState();
  demo.enabled = true;
  demo.lastNormalScenarioId = journeyState().scenarioId;
  demo.hasSeenLanding = true;
  if (shouldHidePrototypeMachinery()) {
    labsState.portfolioMode = "empty";
    labsState.selectedServicePropertyId = "the-butts";
    labsState.azMode = "single";
    labsState.azPropertyId = "the-butts";
  }
  syncGuidedDemoClass();

  if (storyId && guidedDemoStories[storyId]) {
    startGuidedStory(storyId);
    return;
  }

  demo.activeStoryId = "";
  demo.activeMomentIndex = 0;
  demo.mode = "landing";
  showJourneyOs({ scroll: true });
  renderJourneyOsState();
}

function exitGuidedDemo() {
  const demo = guidedDemoState();
  demo.enabled = false;
  demo.activeStoryId = "";
  demo.activeMomentIndex = 0;
  demo.mode = "landing";
  syncGuidedDemoClass();
  showJourneyOs({ scroll: false });
  renderJourneyOsState();
  showToast("Exited guided demo mode.");
}

function resetGuidedDemo(storyId = "") {
  const demo = guidedDemoState();
  const targetStoryId = storyId || demo.activeStoryId;
  if (targetStoryId && guidedDemoStories[targetStoryId]) {
    startGuidedStory(targetStoryId);
    return;
  }
  enterGuidedDemo();
}

function startGuidedStory(storyId) {
  const story = guidedDemoStories[storyId] || guidedDemoStories["clean-property-check"];
  const demo = guidedDemoState();
  demo.enabled = true;
  demo.activeStoryId = storyId in guidedDemoStories ? storyId : "clean-property-check";
  demo.activeMomentIndex = 0;
  demo.mode = "story";
  syncGuidedDemoClass();
  applyGuidedMoment(demo.activeStoryId, 0);
}

function advanceGuidedMoment(direction = 1) {
  const demo = guidedDemoState();
  const story = currentGuidedStory();
  if (!story) {
    enterGuidedDemo();
    return;
  }
  const nextIndex = Math.max(0, Math.min(story.moments.length - 1, demo.activeMomentIndex + direction));
  applyGuidedMoment(demo.activeStoryId, nextIndex);
}

function openGuidedWorkspacePreview() {
  const state = journeyState();
  state.screen = "workspace";
  state.currentStage = "action";
  state.workspaceTab = "overview";
  addTimelineEvent({
    title: "Guided workspace opened",
    body: "Presenter opened the workspace to show the Property Intelligence profile destination.",
    type: "Guided demo"
  });
  showJourneyOs({ scroll: false });
  renderJourneyOsState();
}

function applyGuidedMoment(storyId, momentIndex) {
  const story = guidedDemoStories[storyId] || guidedDemoStories["clean-property-check"];
  const moment = story.moments[momentIndex] || story.moments[0];
  const demo = guidedDemoState();
  demo.enabled = true;
  demo.activeStoryId = storyId in guidedDemoStories ? storyId : "clean-property-check";
  demo.activeMomentIndex = story.moments.indexOf(moment);
  demo.mode = "story";
  syncGuidedDemoClass();

  const state = resetJourneyStateForGuidedStory(demo.activeStoryId);
  if (moment.autoComplete) {
    state.autoCheckStep = journeyAutoCheckSteps.length;
    addTimelineEvent({
      title: "Auto checks completed",
      body: "Address, EPC, authority, licensing and property clues were revealed in guided mode.",
      type: "Auto checks"
    });
  }
  if (moment.noEpcChoice) {
    handleNoEpcChoice(moment.noEpcChoice);
  }
  if (moment.answers) {
    applyGuidedAnswerSet(moment.answers, moment.unknownIndex);
  }
  if (moment.route) {
    state.routeId = moment.route;
    state.actionPlan = buildJourneyActionPlan(state);
    state.serviceRecommendations = buildServiceRecommendations(state);
  }
  if (moment.brainComplete) {
    state.brainStep = journeyBrainSteps.length;
    state.actionPlan = buildJourneyActionPlan(state);
    state.serviceRecommendations = buildServiceRecommendations(state);
    addTimelineEvent({
      title: "Property brain built",
      body: "Guided demo combined simulated records, landlord answers, services and monitoring.",
      type: "Property brain"
    });
  }
  if (moment.servicePlan) {
    applyServicePlan(moment.servicePlan);
  }
  if (moment.tenantMessage) {
    addGuidedTenantMessage(moment.tenantMessage);
  }
  if (moment.addConditionEvidence) {
    addGuidedConditionEvidence();
  }

  state.currentStage = moment.stage;
  state.screen = moment.screen;
  if (moment.workspaceTab) {
    state.workspaceTab = moment.workspaceTab;
  }
  state.actionPlan = buildJourneyActionPlan(state);
  state.serviceRecommendations = buildServiceRecommendations(state);
  showJourneyOs({ scroll: false });
  renderJourneyOsState();
}

function updatePropertyBrain(partialUpdate) {
  const state = journeyState();
  state.propertyBrain = {
    ...state.propertyBrain,
    ...partialUpdate
  };
  state.actionPlan = buildJourneyActionPlan(state);
  state.serviceRecommendations = state.actionPlan.recommendedServices;
}

function journeyAction(id, title, body, group, routeTags = ["prioritised"], risk = "medium") {
  return {
    id,
    title,
    body,
    group,
    routeTags,
    risk,
    status: "Open"
  };
}

function buildJourneyActionPlan(state = journeyState()) {
  const brain = state.propertyBrain;
  const scenario = journeyDemoScenarios[state.scenarioId] || journeyDemoScenarios["clean-property-match"];
  const auto = brain.AutoCheckResults;
  const identity = brain.PropertyIdentity;
  const tenancy = brain.TenancyProfile;
  const evidence = brain.ComplianceEvidence;
  const answers = state.answers || {};
  const urgentLegalBlockers = [];
  const missingEvidence = [];
  const expiringSoon = [];
  const conditionRisks = [];
  const futureRisks = [];
  const improvementOpportunities = [];
  const recommendedServices = [];

  if (!auto.epcFound || scenario.urgentMees || scenario.epcExpired) {
    const title = scenario.urgentMees ? "Urgent MEES risk" : scenario.epcExpired ? "EPC may be expired" : "EPC record missing";
    const body = scenario.urgentMees
      ? "EPC F/G may create an urgent letting risk. CMP recommends improvement or exemption review before relying on the property."
      : scenario.epcExpired
        ? "CMP found a likely EPC record, but it appears expired or needs checking. Treat it as an evidence gap until a current certificate is confirmed."
        : "No clear EPC record was found. Book or upload an EPC before marketing or continuing to rely on the file.";
    urgentLegalBlockers.push(journeyAction("epc-urgent", title, body, "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "high"));
    recommendedServices.push(journeyAction("book-epc", "Book EPC assessment", "Arrange an EPC assessment or upload an existing current certificate.", "Recommended Services", ["prioritised", "legalMinimum", "futureProof", "doneForMe"], "high"));
  }

  if (evidence.gasSafety.status !== "found" && answers.gas !== "no") {
    urgentLegalBlockers.push(journeyAction("gas-safety", "Gas Safety Certificate missing or unconfirmed", "CMP cannot see a current Gas Safety Certificate. Confirm gas status, upload evidence or book a check.", "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "high"));
    recommendedServices.push(journeyAction("gas-service", "Gas Safety Check", "Confirm appliances and arrange a gas safety check if gas is present.", "Recommended Services", ["prioritised", "legalMinimum", "doneForMe"], "high"));
  }

  if (evidence.eicr.status === "missing" || ["expired", "unknown"].includes(answers.eicr)) {
    urgentLegalBlockers.push(journeyAction("eicr", "EICR evidence missing", "Upload a valid EICR or book an inspection so Electrical Safety is no longer an unknown.", "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "high"));
    recommendedServices.push(journeyAction("book-eicr", "Book EICR", "Arrange Electrical Safety inspection and add the result to the evidence vault.", "Recommended Services", ["prioritised", "legalMinimum", "doneForMe"], "high"));
  }

  if (["no", "faulty", "unknown"].includes(answers.alarms)) {
    urgentLegalBlockers.push(journeyAction("alarms", "Smoke/CO alarms unconfirmed", "Confirm alarms are installed and working, or arrange a check before the risk disappears from view.", "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "medium"));
  }

  if (["notProtected", "unknown"].includes(answers.deposit) || scenario.depositStatus === "Evidence missing") {
    urgentLegalBlockers.push(journeyAction("deposit-review", "Deposit protection unconfirmed", "Deposit evidence is weak or missing. CMP recommends a deposit compliance review.", "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "high"));
  }

  if (identity.hmoRiskFlag || ["room"].includes(answers.propertyType) || answers.occupants === "fivePlus") {
    urgentLegalBlockers.push(journeyAction("hmo-licensing", "Licensing status needs checking", "The answers suggest possible HMO or high-occupancy risk. Confirm licensing before treating the property as low risk.", "Urgent Legal Blockers", ["prioritised", "legalMinimum", "riskProtected", "doneForMe"], "high"));
    recommendedServices.push(journeyAction("hmo-bundle", "HMO safety bundle", "Licence check, room measurement, fire risk review and management-standards review.", "Recommended Services", ["prioritised", "riskProtected", "doneForMe"], "high"));
  }

  [
    ["right-to-rent", "Right to Rent evidence", "Upload or confirm Right to Rent evidence for the tenancy file."],
    ["tenancy-docs", "Tenancy agreement / written terms", "Upload proof that required tenancy information was provided."],
    ["prescribed-info", "Prescribed information served", "Confirm deposit prescribed information if a deposit was taken."],
    ["inventory", "Inventory / check-in report", "Add inventory or check-in evidence for possession and repair readiness."],
    ["insurance", "Insurance unknown", "Upload the landlord insurance schedule or mark it as handled elsewhere."]
  ].forEach(([id, title, body]) => {
    missingEvidence.push(journeyAction(id, title, body, "Missing Evidence", ["prioritised", "riskProtected", "doneForMe"], "medium"));
  });

  if (auto.epcFound) {
    expiringSoon.push(journeyAction("epc-expiry", `EPC expiry: ${auto.epcExpiry}`, "Keep the EPC date in monitoring even when no urgent action is needed today.", "Expiring Soon", ["prioritised", "futureProof", "doneForMe"], "low"));
  }
  expiringSoon.push(journeyAction("gas-renewal", "Gas renewal unknown", "Add the current certificate to enable renewal tracking.", "Expiring Soon", ["prioritised", "riskProtected", "doneForMe"], "medium"));
  expiringSoon.push(journeyAction("licence-renewal", "Licence renewal unknown", "If licensing applies, renewal dates need to be tracked.", "Expiring Soon", ["prioritised", "riskProtected", "doneForMe"], "medium"));

  const conditionIds = conditionAnswerIds(state);
  const hasCondition = scenario.conditionIssue || conditionIds.some((id) => !["none"].includes(id));
  if (hasCondition) {
    const council = scenario.councilContactStatus === "Council contacted landlord" || conditionIds.includes("councilContact");
    const damp = scenario.conditionIssue === "Damp/mould complaint" || conditionIds.some((id) => ["dampMould", "coldRooms", "heatingHotWater", "leak", "gasHeating"].includes(id));
    const pests = conditionIds.includes("pests");
    const electrical = conditionIds.includes("electrical");
    const unknownCondition = conditionIds.includes("unknown");
    if (council) {
      conditionRisks.push(journeyAction("enforcement-response", "Council contact / enforcement risk", "Prepare a council response pack and professional escalation route.", "Condition Risks", ["prioritised", "riskProtected", "doneForMe"], "high"));
      recommendedServices.push(journeyAction("council-support", "Council Enforcement Response Support", "Prepare evidence, chronology and response support.", "Recommended Services", ["prioritised", "riskProtected", "doneForMe"], "high"));
    }
    if (damp) {
      conditionRisks.push(journeyAction("damp-condition-risk", "Damp, mould, heating or leak risk", "Book a damp/mould survey or create repair evidence so this does not sit as an untracked complaint.", "Condition Risks", ["prioritised", "riskProtected", "doneForMe"], "medium"));
      recommendedServices.push(journeyAction("damp-survey", "Damp/Mould Survey", "Survey condition issue and prepare repair evidence.", "Recommended Services", ["prioritised", "riskProtected", "doneForMe"], "medium"));
    }
    if (pests) {
      conditionRisks.push(journeyAction("pest-condition-risk", "Pest or habitability concern", "Create an inspection record and action plan for pest or condition evidence.", "Condition Risks", ["prioritised", "riskProtected", "doneForMe"], "medium"));
      recommendedServices.push(journeyAction("condition-inspection", "Property Condition Inspection", "Inspect the reported issue and produce a repair evidence record.", "Recommended Services", ["prioritised", "riskProtected", "doneForMe"], "medium"));
    }
    if (electrical) {
      conditionRisks.push(journeyAction("electrical-condition-risk", "Electrical condition issue reported", "Keep electrical condition risk visible alongside EICR evidence and repair records.", "Condition Risks", ["prioritised", "riskProtected", "doneForMe"], "high"));
    }
    if (unknownCondition || (!council && !damp && !pests && !electrical)) {
      conditionRisks.push(journeyAction("condition-inspection", "Known or uncertain property condition risk", "Book or upload a condition inspection and repair evidence pack.", "Condition Risks", ["prioritised", "riskProtected", "doneForMe"], "medium"));
      recommendedServices.push(journeyAction("condition-inspection", "Property Condition Inspection", "Builds condition evidence and a prioritised repair record.", "Recommended Services", ["prioritised", "riskProtected", "doneForMe"], "medium"));
    }
  }

  if (auto.epcRating === "E") {
    futureRisks.push(journeyAction("epc-e-roadmap", "EPC E future-risk", "Currently acceptable but future-risk. CMP recommends an EPC improvement plan.", "Future Risks", ["prioritised", "futureProof", "doneForMe"], "medium"));
  }
  if (["F", "G"].includes(auto.epcRating)) {
    futureRisks.push(journeyAction("mees-review", "Urgent MEES improvement/exemption review", "EPC F/G is an urgent risk. CMP recommends improvement or exemption review.", "Future Risks", ["prioritised", "legalMinimum", "futureProof", "doneForMe"], "high"));
  }
  futureRisks.push(journeyAction("decent-homes", "Decent Homes readiness", "Keep condition evidence ready for future PRS standards and monitoring.", "Future Risks", ["prioritised", "futureProof", "doneForMe"], "medium"));
  futureRisks.push(journeyAction("prs-database", "Future PRS database / monitoring readiness", "Keep property identity and evidence clean for future registration-style requirements.", "Future Risks", ["futureProof", "doneForMe"], "low"));

  if (auto.epcFound) {
    auto.epcRecommendations.forEach((recommendation, index) => {
      improvementOpportunities.push(journeyAction(`improvement-${index}`, recommendation, index === 0 ? "Low-cost/high-impact improvement to move the property toward a stronger EPC profile." : "Optional improvement for future readiness.", "Opportunities & Improvements", ["futureProof", "doneForMe"], "low"));
    });
  }
  improvementOpportunities.push(journeyAction("annual-monitoring", "Annual compliance monitoring", "Set monitoring so certificates, evidence gaps and future risks do not disappear.", "Opportunities & Improvements", ["prioritised", "futureProof", "doneForMe"], "low"));

  const grouped = {
    urgentLegalBlockers,
    missingEvidence,
    expiringSoon,
    conditionRisks,
    futureRisks,
    improvementOpportunities,
    recommendedServices
  };

  Object.values(grouped).flat().forEach((action) => {
    action.status = (state.deferredActions || []).includes(action.id) ? "Deferred" : "Open";
  });

  brain.Actions = grouped;
  brain.Scores = recalculateJourneyScores(state, grouped);
  return grouped;
}

function recalculateScores(state = journeyState(), grouped = state.actionPlan || {}) {
  const urgentCount = (grouped.urgentLegalBlockers || []).filter((item) => item.status !== "Deferred").length;
  const missingCount = (grouped.missingEvidence || []).filter((item) => item.status !== "Deferred").length;
  const conditionCount = (grouped.conditionRisks || []).length;
  const futureCount = (grouped.futureRisks || []).length;
  const basketBoost = Math.min(18, (state.serviceBasket || []).length * 6);
  const evidenceBoost = Math.min(20, (state.evidenceVault || []).length * 8);
  return {
    legalComplianceScore: clampScore(88 - urgentCount * 12 + evidenceBoost),
    evidenceStrengthScore: clampScore(72 - missingCount * 6 + evidenceBoost),
    conditionRiskScore: clampScore(20 + conditionCount * 24),
    futureReadinessScore: clampScore(78 - futureCount * 8 + basketBoost),
    serviceReadinessScore: clampScore(48 + basketBoost + (state.routeId === "doneForMe" ? 20 : 0))
  };
}

function journeyRouteGroups(routeId = journeyState().routeId) {
  if (routeId === "legalMinimum") {
    return ["urgentLegalBlockers"];
  }
  if (routeId === "riskProtected") {
    return ["urgentLegalBlockers", "missingEvidence", "conditionRisks", "expiringSoon", "recommendedServices"];
  }
  if (routeId === "futureProof") {
    return ["urgentLegalBlockers", "futureRisks", "improvementOpportunities", "expiringSoon", "recommendedServices"];
  }
  if (routeId === "doneForMe") {
    return ["urgentLegalBlockers", "missingEvidence", "conditionRisks", "futureRisks", "recommendedServices", "improvementOpportunities"];
  }
  return ["urgentLegalBlockers", "missingEvidence", "expiringSoon", "conditionRisks", "futureRisks", "improvementOpportunities", "recommendedServices"];
}

function allJourneyActions() {
  const plan = journeyState().actionPlan || {};
  return Object.values(plan).flat();
}

function journeyServiceById(serviceId) {
  return journeyServiceCatalog.find((service) => service.id === serviceId) || journeyServiceCatalog[0];
}

function journeyServiceForAction(actionId) {
  return journeyServiceCatalog.find((service) => service.linkedActionIds.includes(actionId)) || journeyServiceCatalog[0];
}

function serviceStatusFor(state, serviceId) {
  return state.serviceBasket.find((item) => item.serviceId === serviceId)?.status || "recommended";
}

function buildServiceRecommendations(state = journeyState()) {
  const scenario = journeyDemoScenarios[state.scenarioId] || journeyDemoScenarios["clean-property-match"];
  const actionIds = new Set(Object.values(state.actionPlan || {}).flat().map((action) => action.id));
  const routeId = state.routeId || "prioritised";
  return journeyServiceCatalog
    .filter((service) => service.routeTypes.includes(routeId) || routeId === "prioritised" || service.category === "Urgent")
    .filter((service) => service.linkedActionIds.some((id) => actionIds.has(id)) || service.id === "annual-monitoring" || (scenario.branch === "noEpc" && service.id === "epc-assessment") || ((scenario.occupancyStatus || "").includes("Vacant") && service.category === "Void / Re-let"))
    .map((service) => ({
      ...service,
      status: serviceStatusFor(state, service.id),
      knownPropertyData: {
        address: state.propertyBrain.PropertyIdentity.address,
        propertyType: state.propertyBrain.PropertyIdentity.propertyType,
        occupancy: state.propertyBrain.TenancyProfile.occupancyStatus,
        epc: state.propertyBrain.AutoCheckResults.epcRating,
        gasStatus: state.answers.gas || "unknown"
      },
      selectedAnswers: state.serviceBasket.find((item) => item.serviceId === service.id)?.selectedAnswers || {}
    }));
}

function ensureServiceBasketItem(serviceId, status = "added") {
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  const existing = state.serviceBasket.find((item) => item.serviceId === serviceId);
  if (existing) {
    existing.status = status;
    return existing;
  }
  const item = {
    id: `service-${serviceId}-${Date.now()}`,
    serviceId,
    title: service.title,
    category: service.category,
    urgency: service.urgency,
    linkedActionId: service.linkedActionIds[0],
    linkedComplianceArea: service.linkedComplianceArea,
    status,
    routeType: state.routeId,
    knownPropertyData: {
      address: state.propertyBrain.PropertyIdentity.address,
      propertyType: state.propertyBrain.PropertyIdentity.propertyType,
      occupancy: state.propertyBrain.TenancyProfile.occupancyStatus,
      epc: state.propertyBrain.AutoCheckResults.epcRating
    },
    requiredBookingQuestions: service.questions,
    selectedAnswers: {},
    bundleTags: service.bundleTags
  };
  state.serviceBasket.unshift(item);
  return item;
}

function upsertJourneyEvidenceFromService(serviceId, status) {
  if (!["booked", "pending", "completed"].includes(status)) {
    return null;
  }
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  const config = serviceEvidenceConfig(serviceId);
  const evidenceId = `service-evidence-${serviceId}`;
  const existing = state.evidenceVault.find((item) => item.id === evidenceId);
  const completed = status === "completed";
  const evidence = {
    id: evidenceId,
    documentType: "service-generated",
    title: completed ? `${config.title} - generated simulation` : `${config.title} pending`,
    linkedComplianceArea: config.area,
    linkedServiceId: serviceId,
    linkedActionId: config.actionId,
    uploadStatus: completed ? "accepted" : "pending_evidence",
    fakeScanResult: completed ? "Generated by completed fake service" : "Pending from fake booking",
    addressMatch: `Linked to ${state.propertyBrain.PropertyIdentity.address}`,
    extractedDate: completed ? "15 June 2026" : "Awaiting service result",
    expiryDate: config.expiryDate,
    confidence: completed ? "High" : "Medium",
    reviewStatus: completed ? "accepted" : "pending_evidence",
    scoreImpact: completed ? 10 : 4,
    timelineLink: `service-${serviceId}`,
    sourceService: service.title
  };
  if (existing) {
    Object.assign(existing, evidence);
  } else {
    state.evidenceVault.unshift(evidence);
  }
  return existing || evidence;
}

function updateComplianceEvidenceFromService(serviceId, status) {
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  const compliance = state.propertyBrain.ComplianceEvidence;
  const serviceState = status === "completed" ? "found" : ["booked", "pending"].includes(status) ? "booked" : "review";
  const area = service.linkedComplianceArea;
  if (area === "Gas Safety") compliance.gasSafety.status = serviceState;
  if (area === "Electrical Safety") compliance.eicr.status = serviceState;
  if (area === "EPC") {
    compliance.epc.status = serviceState;
    if (status === "completed") {
      state.propertyBrain.AutoCheckResults.epcFound = true;
      state.propertyBrain.AutoCheckResults.epcRecordStatus = "Service-generated EPC evidence accepted";
      if (state.propertyBrain.AutoCheckResults.epcRating === "Unknown") {
        state.propertyBrain.AutoCheckResults.epcRating = "C";
        state.propertyBrain.AutoCheckResults.epcPotentialRating = "B";
      }
    }
  }
  if (area === "Smoke and CO") compliance.smokeCo.status = serviceState;
  if (area === "Deposit") compliance.deposit.status = serviceState;
  if (area === "Licensing") compliance.licensing.status = serviceState;
  if (["Condition", "Void / Re-let"].includes(area)) {
    compliance.inspectionReports.status = serviceState;
    compliance.repairLogs.status = status === "completed" ? "found" : "review";
  }
  if (["Right to Rent", "Tenancy documents", "Evidence"].includes(area)) {
    const key = area === "Right to Rent" ? "rightToRent" : area === "Tenancy documents" ? "tenancyDocs" : "inspectionReports";
    compliance[key].status = serviceState;
  }
}

function upsertMonitoringFromService(serviceId, status) {
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  const config = serviceEvidenceConfig(serviceId);
  const id = status === "quote_requested" ? `quote-follow-up-${serviceId}` : `service-follow-up-${serviceId}`;
  const title = status === "quote_requested" ? `${service.title} quote follow-up` : status === "completed" ? `${config.title} renewal / review` : `${service.title} service follow-up`;
  const existing = state.monitoringItems.find((item) => item.id === id);
  const item = {
    id,
    type: status === "quote_requested" ? "Quote follow-up" : status === "completed" ? "Renewal watch" : "Service follow-up",
    title,
    dueDate: status === "quote_requested" ? "Follow up in 3 days" : config.dueDate,
    urgency: service.urgency,
    linkedServiceId: serviceId,
    linkedActionId: config.actionId,
    linkedEvidenceId: `service-evidence-${serviceId}`,
    description: status === "quote_requested"
      ? "CMP is waiting on quote response before this risk can move toward solved."
      : status === "completed"
        ? "CMP created simulated evidence and will keep renewal or review visible."
        : "CMP is waiting for service completion and evidence return.",
    status: "watching"
  };
  if (existing) {
    Object.assign(existing, item);
  } else {
    state.monitoringItems.unshift(item);
  }
  return item;
}

function applyServiceLifecycleSideEffects(serviceId, status, source = "Service basket") {
  if (["booked", "pending", "completed"].includes(status)) {
    const evidence = upsertJourneyEvidenceFromService(serviceId, status);
    updateComplianceEvidenceFromService(serviceId, status);
    upsertMonitoringFromService(serviceId, status);
    addTimelineEvent({
      title: status === "completed" ? "Evidence generated from service" : "Evidence pending from booking",
      body: `${evidence?.title || journeyServiceById(serviceId).title} linked to Evidence Vault and Monitoring.`,
      type: source
    });
  }
  if (status === "quote_requested") {
    upsertMonitoringFromService(serviceId, status);
  }
}

function updateServiceStatus(serviceId, status, source = "Service basket") {
  const state = journeyState();
  const item = ensureServiceBasketItem(serviceId, status);
  applyServiceLifecycleSideEffects(serviceId, status, source);
  state.serviceRecommendations = buildServiceRecommendations(state);
  state.propertyBrain.Scores = recalculateJourneyScores(state, state.actionPlan);
  const titleByStatus = {
    added: "Service added to basket",
    quote_requested: "Quote requested",
    booked: "Service booked",
    pending: "Service pending",
    completed: "Service completed",
    deferred: "Service saved for later"
  };
  const statusCopy = {
    added: "added to the basket",
    quote_requested: "sent to the fake quote queue",
    booked: "moved to booked/pending in the fake basket",
    pending: "moved to the done-for-me pending list",
    completed: "marked complete in the prototype",
    deferred: "saved for later. This does not mean solved; CMP keeps the linked risk visible"
  };
  addTimelineEvent({
    title: titleByStatus[status] || "Service basket updated",
    body: `${item.title} ${statusCopy[status] || `moved to ${status.replace("_", " ")}`}.`,
    type: source
  });
  state.branchEffects.unshift(status === "deferred" ? "Service saved for later - risk still visible" : `${item.title} updated in service basket`);
  return item;
}

function removeServiceFromBasket(serviceId) {
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  state.serviceBasket = state.serviceBasket.filter((item) => item.serviceId !== serviceId);
  state.branchEffects.unshift(`${service.title} removed from basket`);
  addTimelineEvent({
    title: "Service removed from basket",
    body: `${service.title} removed from the fake basket. Linked risk remains visible in the action plan.`,
    type: "Services"
  });
  state.serviceRecommendations = buildServiceRecommendations(state);
  state.propertyBrain.Scores = recalculateJourneyScores(state, state.actionPlan);
  showToast(`${service.title} removed from basket. Risk still visible.`);
}

function applyServicePlan(action) {
  const state = journeyState();
  const services = buildServiceRecommendations(state);
  const urgent = services.filter((service) => service.category === "Urgent");
  const legal = services.filter((service) => service.bundleTags.includes("legal essentials"));
  const risk = services.filter((service) => service.bundleTags.includes("risk protected"));
  const future = services.filter((service) => service.category === "Future-proof");
  const selected = action === "urgent" ? urgent
    : action === "legal" ? legal
    : action === "risk" ? risk
    : action === "future" ? future
    : action === "quotes" ? services.slice(0, 5)
    : services;
  const status = action === "quotes" ? "quote_requested" : action === "save" ? "added" : action === "concierge" ? "pending" : "booked";
  selected.forEach((service) => updateServiceStatus(service.id, status, "Service plan"));
  state.workspaceTab = "services";
  state.screen = "workspace";
  state.currentStage = "action";
  state.activeConfirmation = {
    ...serviceConfirmationFor(status, ensureServiceBasketItem(selected[0]?.id || services[0]?.id || "annual-monitoring", status), selected),
    title: action === "quotes" ? "Quote request bundle prepared"
      : action === "concierge" ? "Done-for-Me concierge plan prepared"
        : action === "future" ? "Future-proof plan prepared"
          : action === "risk" ? "Risk-protected plan prepared"
            : action === "legal" ? "Legal essentials bundle prepared"
              : "Urgent service bundle prepared",
    body: action === "quotes"
      ? "CMP prepared quote requests from the current Property Intelligence profile. Compliance risk remains open until quotes become bookings or evidence is accepted."
      : action === "concierge"
        ? "CMP grouped urgent compliance, evidence recovery and monitoring into a fake concierge route. No supplier was contacted."
        : `${selected.length} service${selected.length === 1 ? "" : "s"} moved into the fake ${serviceLifecycleLabel(status).toLowerCase()} state.`,
    planAction: action
  };
  addTimelineEvent({
    title: action === "quotes" ? "Quote request bundle started" : action === "concierge" ? "Done-for-me concierge started" : "Service bundle started",
    body: `${selected.length} services updated from the ${journeyRoutes[state.routeId]?.label || "Prioritised"} plan.`,
    type: "Services"
  });
  state.modalMode = "service-confirmation";
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function openServiceIntake(serviceId, preferredAction = "added") {
  const state = journeyState();
  const service = journeyServiceById(serviceId);
  state.modalMode = "service-intake";
  state.activeIntake = {
    serviceId,
    preferredAction,
    answers: {}
  };
  state.activeAction = { actionType: "service-intake", actionId: serviceId };
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function saveServiceIntakeAnswer(question, value) {
  const intake = journeyState().activeIntake;
  if (!intake) {
    return;
  }
  intake.answers[question] = value;
}

function completeServiceIntake(serviceId, status) {
  const state = journeyState();
  const item = updateServiceStatus(serviceId, status, "Service intake");
  item.selectedAnswers = { ...(state.activeIntake?.answers || {}) };
  item.reference = item.reference || `${status === "quote_requested" ? "CMP-QUOTE" : "CMP-BOOK"}-${String(Date.now()).slice(-6)}`;
  state.activeConfirmation = serviceConfirmationFor(status, item, [journeyServiceById(serviceId)]);
  state.activeIntake = null;
  state.modalMode = "service-confirmation";
  state.workspaceTab = "services";
  state.screen = "workspace";
  state.currentStage = "action";
  renderJourneyActionModal();
  showToast(`${item.title} updated in fake service basket.`);
}

function scanOutcomeForDocument(documentTypeId) {
  const scenario = journeyScenario();
  if (documentTypeId === "epc-expired") {
    return "expired";
  }
  if (documentTypeId === "eicr" && stateHasScenario("eicr-missing")) {
    return "valid";
  }
  if (documentTypeId === "deposit" && stateHasScenario("deposit-evidence-missing")) {
    return "valid";
  }
  if (documentTypeId === "council-letter" && stateHasScenario("council-enforcement-contact")) {
    return "valid";
  }
  if (documentTypeId === "epc" && scenario.branch === "noEpc") {
    return "unclear";
  }
  if (documentTypeId === "insurance") {
    return "expired";
  }
  return journeyDocumentTypes.find((item) => item.id === documentTypeId)?.defaultOutcome || "valid";
}

function stateHasScenario(id) {
  return journeyState().scenarioId === id;
}

function openFakeUpload() {
  const state = journeyState();
  state.modalMode = "fake-upload";
  state.activeScanner = { documentTypeId: "", step: 0, outcomeId: "", complete: false };
  state.activeAction = { actionType: "upload", actionId: "fake-upload" };
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function startFakeUploadScan(documentTypeId) {
  const state = journeyState();
  clearJourneyTimers();
  state.modalMode = "fake-upload";
  state.activeScanner = {
    documentTypeId,
    step: 0,
    outcomeId: scanOutcomeForDocument(documentTypeId),
    complete: false
  };
  addTimelineEvent({
    title: "Evidence uploaded/scanned",
    body: `${journeyDocumentTypes.find((item) => item.id === documentTypeId)?.label || "Document"} entered the fake scanner.`,
    type: "Evidence scan"
  });
  renderJourneyActionModal();
  journeyScanSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      state.activeScanner.step = index + 1;
      if (index === journeyScanSteps.length - 1) {
        state.activeScanner.complete = true;
      }
      renderJourneyActionModal();
    }, 220 + index * 260);
    state.scannerTimers.push(timer);
  });
}

function completeFakeScan() {
  const state = journeyState();
  const scanner = state.activeScanner;
  if (!scanner?.documentTypeId) {
    return;
  }
  const doc = journeyDocumentTypes.find((item) => item.id === scanner.documentTypeId);
  const outcome = journeyScanOutcomes[scanner.outcomeId] || journeyScanOutcomes.valid;
  const evidence = {
    id: `doc-${scanner.documentTypeId}-${Date.now()}`,
    documentType: scanner.documentTypeId,
    title: doc?.label || "Uploaded document",
    linkedComplianceArea: doc?.complianceArea || "Evidence",
    uploadStatus: outcome.status,
    fakeScanResult: outcome.label,
    addressMatch: scanner.outcomeId === "wrong_property" ? "Rejected - different address" : `Matched to ${state.propertyBrain.PropertyIdentity.address}`,
    extractedDate: scanner.outcomeId === "missing_key_details" ? "Needs confirmation" : "12 May 2026",
    expiryDate: scanner.outcomeId === "expired" ? "Expired 04 May 2024" : "11 May 2031",
    confidence: outcome.confidence,
    reviewStatus: outcome.status,
    scoreImpact: scanner.outcomeId === "valid" ? 12 : scanner.outcomeId === "wrong_property" ? 0 : 5,
    timelineLink: `scan-${Date.now()}`
  };
  state.evidenceVault.unshift(evidence);
  if (scanner.outcomeId === "valid") {
    if (scanner.documentTypeId === "epc") {
      state.propertyBrain.ComplianceEvidence.epc.status = "found";
      state.propertyBrain.AutoCheckResults.epcFound = true;
      state.propertyBrain.AutoCheckResults.epcRecordStatus = "Uploaded EPC accepted";
    }
    if (scanner.documentTypeId === "gas") {
      state.propertyBrain.ComplianceEvidence.gasSafety.status = "found";
    }
    if (scanner.documentTypeId === "eicr") {
      state.propertyBrain.ComplianceEvidence.eicr.status = "found";
    }
    if (scanner.documentTypeId === "deposit") {
      state.propertyBrain.ComplianceEvidence.deposit.status = "found";
    }
    if (scanner.documentTypeId === "council-letter") {
      state.propertyBrain.TenancyProfile.councilContactStatus = "Council evidence uploaded";
    }
    if (scanner.documentTypeId === "licence") {
      state.propertyBrain.ComplianceEvidence.licensing.status = "found";
    }
    if (["inspection", "damp-photos"].includes(scanner.documentTypeId)) {
      state.propertyBrain.ComplianceEvidence.inspectionReports.status = "found";
      state.propertyBrain.ComplianceEvidence.repairLogs.status = "review";
    }
  }
  if (scanner.outcomeId === "expired") {
    state.branchEffects.unshift(`${evidence.title} stored as expired - replacement action remains visible`);
    state.monitoringItems.unshift({
      id: `expired-${scanner.documentTypeId}-${Date.now()}`,
      type: "Expiry reminder",
      title: `Replace expired ${evidence.title}`,
      dueDate: "Now",
      urgency: "High",
      linkedActionId: scanner.documentTypeId.startsWith("epc") ? "book-epc" : "insurance",
      description: "CMP stored the evidence but keeps the replacement route visible because expired evidence is not solved.",
      status: "watching"
    });
  }
  if (scanner.outcomeId === "wrong_property") {
    state.branchEffects.unshift("Evidence rejected - wrong property");
  }
  if (["unclear", "missing_key_details"].includes(scanner.outcomeId)) {
    state.branchEffects.unshift("Evidence partly useful - CMP still needs confirmation");
  }
  state.actionPlan = buildJourneyActionPlan(state);
  state.propertyBrain.Scores = recalculateJourneyScores(state, state.actionPlan);
  addTimelineEvent({
    title: `Scan result: ${outcome.label}`,
    body: `${evidence.title} ${outcome.body}`,
    type: "Evidence scan"
  });
  state.activeScanner = null;
  state.modalMode = "";
  state.workspaceTab = "evidence";
  state.screen = "workspace";
  state.currentStage = "vault";
  closeTimelineModals();
  showJourneyOs({ scroll: false });
}

function generateAskCmpResponse(prompt) {
  const state = journeyState();
  const brain = state.propertyBrain;
  const urgent = (state.actionPlan.urgentLegalBlockers || []).filter((item) => item.status !== "Deferred");
  const missing = state.actionPlan.missingEvidence || [];
  const scores = brain.Scores;
  const booked = state.serviceBasket.filter((item) => ["booked", "pending"].includes(item.status));
  const quotes = state.serviceBasket.filter((item) => item.status === "quote_requested");
  const completed = state.serviceBasket.filter((item) => item.status === "completed");
  const pendingEvidence = state.evidenceVault.filter((item) => item.reviewStatus === "pending_evidence");
  let body = "";
  const propertyContext = `${brain.PropertyIdentity.address} is recorded as ${brain.PropertyIdentity.propertyType} on the ${journeyRoutes[state.routeId]?.label || "Prioritised"} route.`;
  if (prompt.includes("booking change")) {
    body = booked.length
      ? `Your fake bookings moved ${booked.map((item) => item.title).join(", ")} into a supplier-ready state. CMP also added pending evidence and monitoring follow-ups, but the risk is not solved until evidence is accepted or the service is completed.`
      : "No booking has been prepared yet. Add a service or use Book legal essentials to create pending evidence and monitoring.";
  } else if (prompt.includes("waiting on a service")) {
    body = booked.length || quotes.length
      ? `CMP is waiting on ${[...booked, ...quotes].map((item) => `${item.title} (${serviceLifecycleLabel(item.status)})`).join(", ")}. Quote requests do not close compliance risk; completed services or accepted evidence do.`
      : "Nothing is waiting on a service yet. Your next step is to book, request a quote, or upload evidence.";
  } else if (prompt.includes("mark complete")) {
    body = booked.length
      ? `You can mark ${booked[0].title} in progress or complete from the Services tab. Completion will generate simulated evidence and refresh Compliance Centre and Monitoring.`
      : completed.length
        ? `${completed[0].title} is already complete in the prototype. View generated evidence or set renewal monitoring.`
        : "There is not a booked service ready to complete yet.";
  } else if (prompt.includes("requesting quotes")) {
    body = quotes.length
      ? `CMP has prepared quote requests for ${quotes.map((item) => item.title).join(", ")}. Your risk remains open until a quote is accepted, booked, completed, or evidence is uploaded.`
      : "No quote requests exist yet. Request quotes first is useful when cost or supplier choice matters, but it does not make compliance solved.";
  } else if (prompt.includes("evidence still missing") || prompt.includes("evidence is still missing")) {
    body = `${missing.length} action-plan evidence gap${missing.length === 1 ? "" : "s"} remain. ${pendingEvidence.length ? `${pendingEvidence.length} evidence item${pendingEvidence.length === 1 ? " is" : "s are"} pending from fake bookings.` : "No pending service evidence has been created yet."}`;
  } else if (prompt.includes("rent this property")) {
    body = urgent.length
      ? `Not safely yet. CMP has a simulated EPC ${brain.AutoCheckResults.epcRating}, but ${urgent.slice(0, 4).map((item) => item.title).join(", ")} still need handling before you treat this property as ready.`
      : "It looks closer to ready, but CMP would still keep monitoring evidence dates and tenant documents before you rely on the file.";
  } else if (prompt.includes("first")) {
    body = urgent[0] ? `Start with ${urgent[0].title}. It has the highest risk and unlocks a clearer property file.` : "Start by adding the strongest missing evidence so CMP can improve the Property Intelligence profile.";
  } else if (prompt.includes("wait")) {
    body = `Future-proofing can wait longer than legal blockers. Improvements like ${state.actionPlan.improvementOpportunities?.[0]?.title || "annual monitoring"} should stay visible but not block the urgent route.`;
  } else if (prompt.includes("score low")) {
    body = `Your scores are low because legal compliance is ${scores.legalComplianceScore}%, evidence strength is ${scores.evidenceStrengthScore}%, and CMP still sees ${missing.length} evidence gaps.`;
  } else if (prompt.includes("book")) {
    body = `Book ${buildServiceRecommendations(state).slice(0, 3).map((service) => service.title).join(", ")} first. These map directly to the current risk and evidence gaps.`;
  } else if (prompt.includes("EPC")) {
    body = `The EPC is ${brain.AutoCheckResults.epcRating}. CMP would compare the potential rating ${brain.AutoCheckResults.epcPotentialRating}, then build an EPC improvement plan around insulation, controls and reassessment.`;
  } else if (prompt.includes("tenant")) {
    body = "Generate a practical access message from the Property Intelligence profile, then log it to the timeline so communication evidence stays visible.";
  } else if (prompt.includes("expensive")) {
    body = `The expensive risks are usually unresolved safety certificates, licensing/HMO uncertainty, enforcement contact and damp/mould evidence gaps. CMP is keeping those visible.`;
  } else if (prompt.includes("cheapest")) {
    body = "The cheapest compliant route is to handle legal essentials first: EPC if missing, Gas Safety if gas is present, EICR, alarms, deposit evidence and licensing check.";
  } else if (prompt.includes("future-proof")) {
    body = "The safest future-proof route adds EPC improvement planning, condition evidence, annual monitoring, insurance dates and licensing watch on top of the legal essentials.";
  } else {
    body = `This Property Intelligence profile changed around ${journeyDemoScenarios[state.scenarioId]?.label}. The current route is ${journeyRoutes[state.routeId]?.label}, with ${urgent.length} urgent blockers and ${state.serviceBasket.length} basket items.`;
  }
  const basketCopy = state.serviceBasket.length ? ` ${state.serviceBasket.length} service item${state.serviceBasket.length === 1 ? "" : "s"} are already in the fake basket, including ${booked.length} booked/in-progress and ${quotes.length} quote request${quotes.length === 1 ? "" : "s"}.` : " No service basket has been started yet.";
  const response = {
    id: `ask-${Date.now()}`,
    prompt,
    body: `${propertyContext} ${body}${basketCopy}`,
    actions: ["Book Gas Safety", "Book EICR", "Upload evidence", "Add legal essentials to basket", "Generate tenant message", "Set reminder", "View evidence gaps", "Escalate placeholder"]
  };
  state.askHistory.unshift(response);
  addTimelineEvent({ title: "Ask CMP question answered", body: prompt, type: "Ask CMP" });
  return response;
}

function generateTenantMessage(templateId) {
  const state = journeyState();
  const template = journeyTenantMessageTemplates.find((item) => item.id === templateId) || journeyTenantMessageTemplates[0];
  const message = {
    id: `message-${template.id}-${Date.now()}`,
    title: template.title,
    body: template.body.replaceAll("[Property Address]", state.propertyBrain.PropertyIdentity.address),
    linkedServiceId: template.linkedServiceId,
    status: "draft"
  };
  state.activeTenantMessage = message;
  state.modalMode = "tenant-message";
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function logTenantMessage() {
  const state = journeyState();
  const message = state.activeTenantMessage;
  if (!message) {
    return;
  }
  message.status = "logged";
  state.generatedMessages.unshift(message);
  state.evidenceVault.unshift({
    id: `communication-${Date.now()}`,
    documentType: "tenant-message",
    title: message.title,
    linkedComplianceArea: "Communication evidence",
    uploadStatus: "accepted",
    fakeScanResult: "Communication logged",
    addressMatch: "Linked to property",
    extractedDate: "Just now",
    expiryDate: "Not applicable",
    confidence: "Medium",
    reviewStatus: "accepted",
    scoreImpact: 3,
    timelineLink: message.id
  });
  addTimelineEvent({ title: "Message generated", body: `${message.title} logged to the property timeline.`, type: "Tenant message" });
  state.activeTenantMessage = null;
  state.modalMode = "";
  state.workspaceTab = "timeline";
  state.screen = "workspace";
  closeTimelineModals();
  showJourneyOs({ scroll: false });
}

function upsertMonitoringItem(itemId, status = "watching") {
  const state = journeyState();
  const catalogItem = journeyMonitoringCatalog.find((item) => item.id === itemId) || journeyMonitoringCatalog[0];
  const existing = state.monitoringItems.find((item) => item.id === catalogItem.id);
  if (existing) {
    existing.status = status;
  } else {
    state.monitoringItems.unshift({ ...catalogItem, status });
  }
  addTimelineEvent({ title: "Reminder set", body: `${catalogItem.title} marked as ${status}.`, type: "Monitoring" });
  journeyState().branchEffects.unshift(status === "deferred" ? "Monitoring deferred - CMP will keep it visible" : `${catalogItem.title} monitoring updated`);
  state.workspaceTab = "monitoring";
  state.screen = "workspace";
  closeTimelineModals();
  showJourneyOs({ scroll: false });
}

function recalculateJourneyScores(state = journeyState(), grouped = state.actionPlan || {}) {
  const base = recalculateScores(state, grouped);
  const acceptedEvidence = state.evidenceVault.filter((item) => item.reviewStatus === "accepted").length;
  const bookedServices = state.serviceBasket.filter((item) => ["booked", "pending", "quote_requested"].includes(item.status)).length;
  const loggedMessages = state.generatedMessages.length;
  return {
    legalComplianceScore: clampScore(base.legalComplianceScore + acceptedEvidence * 3 + bookedServices * 2),
    evidenceStrengthScore: clampScore(base.evidenceStrengthScore + acceptedEvidence * 5 + loggedMessages * 2),
    conditionRiskScore: base.conditionRiskScore,
    futureReadinessScore: clampScore(base.futureReadinessScore + state.monitoringItems.filter((item) => item.status === "watching").length),
    serviceReadinessScore: clampScore(base.serviceReadinessScore + bookedServices * 5 + state.serviceBasket.filter((item) => item.status === "added").length * 2)
  };
}

function selectRoute(routeId) {
  const state = journeyState();
  state.routeId = routeId;
  state.actionPlan = buildJourneyActionPlan(state);
  state.serviceRecommendations = buildServiceRecommendations(state);
  addTimelineEvent({
    title: "Route selected",
    body: `${journeyRoutes[routeId]?.label || "Prioritised"} route selected.`,
    type: "Action plan"
  });
  renderJourneyOsState();
}

function selectPropertyMatch(matchId) {
  const state = journeyState();
  state.selectedMatchId = matchId;
  state.propertyBrain.PropertyIdentity.identityConfidence = matchId === "uncertain" ? "Low" : "High";
  state.propertyBrain.AutoCheckResults.epcRecordStatus = matchId === "uncertain" ? "Proceeding with warning" : "Property match confirmed";
  state.actionPlan = buildJourneyActionPlan(state);
  addTimelineEvent({
    title: "Property match confirmed",
    body: matchId === "uncertain" ? "Property identity kept with low confidence and warning." : "Selected property match saved to the Journey OS Property Intelligence profile.",
    type: "Property match"
  });
  setJourneyStage("confirmProperty", "review");
}

function handleNoEpcChoice(choice) {
  const state = journeyState();
  const brain = state.propertyBrain;
  const labels = {
    rented: "Currently rented",
    advertised: "Being advertised",
    vacant: "Vacant / preparing to rent",
    upload: "EPC evidence to upload",
    manual: "Continue manually"
  };
  const carriedOccupancy = {
    rented: { answerId: "occupied", label: "Yes, currently occupied" },
    advertised: { answerId: "advertised", label: "It is being advertised" },
    vacant: { answerId: "vacant", label: "No, currently vacant" }
  }[choice];
  brain.AutoCheckResults.epcRecordStatus = choice === "manual" ? "EPC unknown - continuing manually" : labels[choice];
  brain.ComplianceEvidence.epc.status = choice === "upload" ? "to_upload" : "missing";
  if (carriedOccupancy) {
    state.answers.occupancy = carriedOccupancy.answerId;
    state.carriedAnswers.occupancy = {
      ...carriedOccupancy,
      source: "No EPC branch"
    };
    brain.TenancyProfile.occupancyStatus = carriedOccupancy.label;
    state.branchEffects.unshift("CMP carried this answer into the Property Intelligence profile");
  }
  state.branchEffects.unshift(choice === "vacant" ? "Book EPC before marketing added" : choice === "upload" ? "EPC evidence upload route added" : "Book EPC assessment added");
  state.actionPlan = buildJourneyActionPlan(state);
  addTimelineEvent({
    title: "No EPC branch answered",
    body: `${labels[choice]} selected. EPC stays visible in the action plan.`,
    type: "Auto checks"
  });
  setJourneyStage("confirmProperty", "review");
}

function answerUnknown(questionId, answerId) {
  const state = journeyState();
  if (questionId === "condition" && Array.isArray(answerId)) {
    answerConditionUnknown(answerId);
    return;
  }
  const question = journeyUnknownQuestions.find((item) => item.id === questionId);
  const option = question?.options.find((item) => item.id === answerId);
  const brain = state.propertyBrain;

  state.answers[questionId] = answerId;
  if (option?.effect) {
    state.branchEffects.unshift(option.effect);
  }

  if (questionId === "occupancy") {
    brain.TenancyProfile.occupancyStatus = option?.label || "Unknown";
  }
  if (questionId === "propertyType") {
    brain.PropertyIdentity.propertyType = option?.label || brain.PropertyIdentity.propertyType;
    brain.PropertyIdentity.flatBlockCommonPartsFlag = answerId === "flat";
    brain.PropertyIdentity.hmoRiskFlag = answerId === "room";
    brain.PropertyIdentity.conversionRiskFlag = answerId === "converted";
  }
  if (questionId === "occupants") {
    brain.TenancyProfile.occupantCount = option?.label || "Unknown";
    brain.PropertyIdentity.hmoRiskFlag = brain.PropertyIdentity.hmoRiskFlag || ["threeFour", "fivePlus"].includes(answerId);
  }
  if (questionId === "gas") {
    brain.ComplianceEvidence.gasSafety.status = answerId === "no" ? "not_applicable" : answerId === "unknown" ? "unknown" : "missing";
  }
  if (questionId === "eicr") {
    brain.ComplianceEvidence.eicr.status = answerId === "upload" ? "to_upload" : answerId === "noProof" ? "weak" : "missing";
  }
  if (questionId === "alarms") {
    brain.ComplianceEvidence.smokeCo.status = answerId === "tested" ? "landlord_confirmed" : answerId === "noProof" ? "weak" : "missing";
  }
  if (questionId === "deposit") {
    brain.TenancyProfile.depositTaken = answerId !== "none";
    brain.TenancyProfile.depositStatus = option?.label || "Unknown";
    brain.ComplianceEvidence.deposit.status = answerId === "protected" ? "found" : answerId === "none" ? "not_applicable" : "missing";
  }
  if (questionId === "tenancyDocs") {
    brain.TenancyProfile.tenancyDocsStatus = option?.label || "Unknown";
    brain.ComplianceEvidence.tenancyDocs.status = answerId === "upload" ? "to_upload" : "missing";
  }
  if (questionId === "condition") {
    brain.TenancyProfile.repairComplaintStatus = option?.label || "Unknown";
    if (answerId === "councilContact") {
      brain.TenancyProfile.councilContactStatus = "Council contacted landlord";
    }
  }
  if (questionId === "intent") {
    brain.TenancyProfile.landlordIntent = option?.label || "Prioritised";
    if (answerId === "minimum") {
      state.routeId = "legalMinimum";
    } else if (answerId === "risk") {
      state.routeId = "riskProtected";
    } else if (answerId === "future") {
      state.routeId = "futureProof";
    } else if (answerId === "doneForMe") {
      state.routeId = "doneForMe";
    } else {
      state.routeId = "prioritised";
    }
  }

  state.unknownIndex = Math.min(state.unknownIndex + 1, journeyUnknownQuestions.length);
  state.actionPlan = buildJourneyActionPlan(state);
  addTimelineEvent({
    title: "Unknown answered",
    body: `${question?.title || "Question"}: ${option?.label || answerId}.`,
    type: "Landlord answer"
  });

  if (state.unknownIndex >= journeyUnknownQuestions.length) {
    addTimelineEvent({
      title: "Unknowns answered",
      body: "All landlord-only Journey OS questions have been handled.",
      type: "Landlord answer"
    });
  }

  renderJourneyOsState();
}

function toggleConditionSelection(answerId) {
  const state = journeyState();
  const current = new Set(state.conditionSelections?.length ? state.conditionSelections : conditionAnswerIds(state));
  if (["none", "unknown"].includes(answerId)) {
    state.conditionSelections = current.has(answerId) ? [] : [answerId];
  } else {
    current.delete("none");
    current.delete("unknown");
    if (current.has(answerId)) {
      current.delete(answerId);
    } else {
      current.add(answerId);
    }
    state.conditionSelections = Array.from(current);
  }
  renderJourneyOsState();
}

function answerConditionUnknown(selectedIds = []) {
  const state = journeyState();
  const question = journeyUnknownQuestions.find((item) => item.id === "condition");
  const selected = selectedIds.length ? selectedIds : ["unknown"];
  const normalized = selected.includes("none") ? ["none"] : selected.includes("unknown") && selected.length === 1 ? ["unknown"] : selected.filter((id) => !["none", "unknown"].includes(id));
  const finalAnswers = normalized.length ? normalized : ["unknown"];
  const labels = conditionAnswerLabels(finalAnswers);
  const brain = state.propertyBrain;

  state.answers.condition = finalAnswers;
  state.conditionSelections = finalAnswers;
  brain.TenancyProfile.repairComplaintStatus = labels.join(", ");
  brain.TenancyProfile.councilContactStatus = finalAnswers.includes("councilContact") ? "Council contacted landlord" : brain.TenancyProfile.councilContactStatus;
  question?.options
    .filter((option) => finalAnswers.includes(option.id))
    .forEach((option) => state.branchEffects.unshift(option.effect));
  if (finalAnswers.length > 1) {
    state.branchEffects.unshift(`${finalAnswers.length} condition routes added`);
  }
  state.unknownIndex = Math.min(state.unknownIndex + 1, journeyUnknownQuestions.length);
  state.actionPlan = buildJourneyActionPlan(state);
  addTimelineEvent({
    title: "Condition issues answered",
    body: labels.join(", "),
    type: "Landlord answer"
  });
  showToast("CMP updated condition routes.");
  renderJourneyOsState();
}

function editUnknownAnswer(questionId) {
  const index = journeyUnknownQuestions.findIndex((question) => question.id === questionId);
  if (index < 0) {
    return;
  }
  const state = journeyState();
  state.unknownIndex = index;
  state.currentStage = "unknowns";
  state.screen = "unknowns";
  if (questionId === "occupancy" && state.carriedAnswers?.occupancy) {
    delete state.carriedAnswers.occupancy;
  }
  if (questionId === "condition") {
    state.conditionSelections = conditionAnswerIds(state);
  }
  showToast("Edit the answer and CMP will update routes, scores and services.");
  renderJourneyOsState();
}

function renderGuidedStoryCards() {
  return Object.entries(guidedDemoStories).map(([id, story]) => `
    <article class="journey-guided-story-card" data-guided-scenario-card>
      <div class="journey-story-motif is-${escapeHtml(story.motif)}" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="section-kicker">${escapeHtml(story.time)}</p>
      <h3>${escapeHtml(story.title)}</h3>
      <p>${escapeHtml(story.proof)}</p>
      <small>Scenario: ${escapeHtml(journeyDemoScenarios[story.scenarioId]?.label || story.scenarioId)}</small>
      <button class="secondary-button" type="button" data-guided-story="${escapeHtml(id)}">Start story</button>
    </article>
  `).join("");
}

function renderNickScenarioCards() {
  return nickScenarioExplorerCards.map((card) => `
    <article class="journey-guided-story-card nick-scenario-card" data-guided-scenario-card>
      <p class="section-kicker">Simulated scenario</p>
      <h3>${escapeHtml(card.title)}</h3>
      <dl>
        <div><dt>Tests</dt><dd>${escapeHtml(card.tests)}</dd></div>
        <div><dt>CMP will simulate</dt><dd>${escapeHtml(card.finds)}</dd></div>
        <div><dt>Action created</dt><dd>${escapeHtml(card.action)}</dd></div>
      </dl>
      <small>Prototype-only: uses simulated demo data. No live lookup, supplier booking, payment, document storage or legal advice.</small>
      <button class="secondary-button" type="button" data-guided-story="${escapeHtml(card.id)}">Try this scenario</button>
    </article>
  `).join("");
}

function renderGuidedDemoLanding() {
  return `
    <section class="journey-guided-landing" aria-labelledby="guidedDemoTitle">
      <div class="journey-guided-hero">
        <div>
          <p class="section-kicker">Nick demo mode</p>
          <h1 id="guidedDemoTitle">Test the landlord journey, not the prototype machinery</h1>
          <p>This is a simulated CMP prototype using demo data. The purpose is to test the landlord journey: CMP starts with a property, finds what it can automatically, asks the landlord to confirm the unknowns, then turns the result into evidence, actions, services and monitoring.</p>
          <span class="prototype-badge">Prototype mode · simulated data</span>
          <p class="nick-demo-disclaimer">Smart Search, Ask CMP, scoring, bookings and evidence updates are simulated for this demo. No live API lookup, supplier booking, payment, document storage or legal advice is happening.</p>
          <div class="button-row">
            <button class="primary-button" type="button" data-guided-story="clean-property-check">Run the 2-minute demo</button>
            <button class="secondary-button" type="button" data-guided-scroll-stories>Explore scenarios after the main demo</button>
            <button class="text-button" type="button" data-guided-exit>Exit guided demo</button>
          </div>
        </div>
        <aside class="journey-guided-vision-card">
          <strong>The story Nick should understand</strong>
          <p>Add property → Smart Search → Confirm unknowns → Evidence Vault → Action Plan → Ask CMP → Monitoring.</p>
          <div class="journey-guided-orbit" aria-hidden="true">
            <span>Property</span>
            <span>Search</span>
            <span>Evidence</span>
            <span>Monitor</span>
            <i></i>
          </div>
        </aside>
      </div>
      <section class="journey-guided-story-grid" id="guidedStoryGrid">
        <div class="journey-guided-scenario-intro">
          <p class="section-kicker">After the main demo</p>
          <h2>Try another scenario</h2>
          <p>Use these only after the basic journey lands. Each scenario uses simulated data to test whether CMP creates the right evidence gap, action and monitoring path.</p>
        </div>
        ${renderNickScenarioCards()}
      </section>
      <section class="journey-guided-simulation-note">
        <strong>What is simulated</strong>
        <p>Smart Search, public-record checks, EPC lookup, licensing signals, document scanning, Ask CMP responses, scoring, supplier booking and monitoring are all local prototype state.</p>
      </section>
    </section>
  `;
}

function renderGuidedPresenterPanel() {
  const demo = guidedDemoState();
  const story = currentGuidedStory();
  const moment = currentGuidedMoment();
  if (!demo.enabled || !story || !moment) {
    return "";
  }
  const progress = story.moments.length ? Math.round(((demo.activeMomentIndex + 1) / story.moments.length) * 100) : 0;
  const isLast = demo.activeMomentIndex >= story.moments.length - 1;
  return `
    <section class="journey-guided-presenter" aria-label="Guided demo presenter controls">
      <div class="journey-guided-presenter-main">
        <span>Guided demo</span>
        <strong>${escapeHtml(story.title)}</strong>
        <small>${escapeHtml(moment.name)} · ${demo.activeMomentIndex + 1} of ${story.moments.length}</small>
        <div class="journey-current-scenario">Current scenario: <b>${escapeHtml(story.title)}</b></div>
        <div class="journey-guided-progress"><i style="width: ${progress}%"></i></div>
        <p>${escapeHtml(moment.note)}</p>
      </div>
      <div class="journey-guided-presenter-actions">
        <button class="secondary-button" type="button" data-guided-back ${demo.activeMomentIndex === 0 ? "disabled" : ""}>Back</button>
        <button class="primary-button" type="button" data-guided-next>${isLast ? "Finish story" : "Next moment"}</button>
        <button class="text-button" type="button" data-guided-restart>Restart demo</button>
        <button class="text-button" type="button" data-guided-main-demo>Return to main demo</button>
        <button class="text-button" type="button" data-guided-explore>Explore another scenario</button>
        <button class="text-button" type="button" data-guided-open-workspace>Open workspace</button>
        <button class="text-button" type="button" data-guided-reset>Reset scenario</button>
        <button class="text-button" type="button" data-guided-exit>Exit guided demo</button>
      </div>
      <small class="journey-guided-presenter-note">Presenter mode keeps the walkthrough focused. Exit to return to normal testing controls.</small>
    </section>
  `;
}

function renderGuidedCallout() {
  const demo = guidedDemoState();
  const moment = currentGuidedMoment();
  if (!demo.enabled || !moment?.callout) {
    return "";
  }
  return `
    <aside class="journey-guided-callout">
      <span>Presenter note</span>
      <p>${escapeHtml(moment.callout)}</p>
    </aside>
  `;
}

function renderGuidedBrainVisual() {
  if (!guidedDemoState().enabled) {
    return "";
  }
  return `
    <section class="journey-brain-visual" aria-label="Property brain visual">
      <svg viewBox="0 0 600 260" role="presentation" aria-hidden="true">
        <path d="M300 130 118 62M300 130 116 198M300 130 300 38M300 130 482 62M300 130 484 198"></path>
      </svg>
      <div class="journey-brain-node is-core">Property brain</div>
      <div class="journey-brain-node is-records">Public records</div>
      <div class="journey-brain-node is-answers">Landlord answers</div>
      <div class="journey-brain-node is-evidence">Evidence</div>
      <div class="journey-brain-node is-services">Service routes</div>
      <div class="journey-brain-node is-monitoring">Monitoring</div>
    </section>
  `;
}

function guidedNextStepsForStory(storyId = guidedDemoState().activeStoryId) {
  const maps = {
    "clean-property-check": [
      ["View action plan", "data-journey-go=\"actionPlan\""],
      ["Upload missing evidence", "data-journey-open-upload"],
      ["Book legal essentials", "data-journey-service-plan=\"legal\""],
      ["Ask CMP what to do first", "data-journey-ask-prompt=\"What should I do first?\""],
      ["Set monitoring", "data-journey-monitor=\"annual-review\""]
    ],
    "no-epc-found": [
      ["Book EPC assessment", "data-journey-service=\"epc-assessment\" data-service-action=\"booked\""],
      ["Upload existing EPC", "data-journey-open-upload"],
      ["Continue with warning", "data-journey-go=\"actionPlan\""],
      ["Set EPC reminder", "data-journey-monitor=\"epc-expiry-monitor\""],
      ["Ask CMP why EPC matters", "data-journey-ask-prompt=\"Why is the EPC missing still a blocker?\""]
    ],
    "epc-expired-mees-risk": [
      ["Book EPC assessment", "data-journey-service=\"epc-assessment\" data-service-action=\"booked\""],
      ["Request EPC/MEES quote", "data-journey-service=\"epc-improvement-plan\" data-service-action=\"quote_requested\""],
      ["Upload current EPC", "data-journey-open-upload"],
      ["Ask CMP about EPC risk", "data-journey-ask-prompt=\"How do I improve the EPC?\""],
      ["Set EPC monitoring", "data-journey-monitor=\"epc-c-readiness\""]
    ],
    "hmo-licensing-risk": [
      ["Book licensing check", "data-journey-service=\"licensing-check\" data-service-action=\"booked\""],
      ["Book fire risk assessment", "data-journey-service=\"fire-risk-assessment\" data-service-action=\"booked\""],
      ["Add room measurement", "data-journey-service=\"room-measurement\" data-service-action=\"added\""],
      ["Request quote bundle", "data-journey-service-plan=\"quotes\""],
      ["Ask CMP about HMO risk", "data-journey-ask-prompt=\"What risks could get expensive?\""]
    ],
    "damp-mould-enforcement": [
      ["Book damp/mould survey", "data-journey-service=\"damp-mould-survey\" data-service-action=\"booked\""],
      ["Generate tenant message", "data-journey-message=\"damp-photo-request\""],
      ["Upload photos/council letter", "data-journey-open-upload"],
      ["Create repair evidence pack", "data-journey-service=\"condition-inspection\" data-service-action=\"added\""],
      ["Set follow-up reminder", "data-journey-monitor=\"inspection-due\""]
    ],
    "done-for-me-plan": [
      ["Book urgent only", "data-journey-service-plan=\"urgent\""],
      ["Book legal essentials", "data-journey-service-plan=\"legal\""],
      ["Request quotes first", "data-journey-service-plan=\"quotes\""],
      ["Build future-proof plan", "data-journey-service-plan=\"future\""],
      ["Done-for-me concierge", "data-journey-service-plan=\"concierge\""]
    ],
    "portfolio-landlord-preview": [
      ["Show risk-protected services", "data-journey-service-plan=\"risk\""],
      ["Request quote bundle", "data-journey-service-plan=\"quotes\""],
      ["View evidence model", "data-journey-workspace-tab-link=\"evidence\""],
      ["Ask CMP about scale-up", "data-journey-ask-prompt=\"What changed in this Property Intelligence profile?\""],
      ["Set annual monitoring", "data-journey-monitor=\"annual-review\""]
    ]
  };
  return maps[storyId] || maps["clean-property-check"];
}

function renderGuidedNextStepsPanel() {
  const demo = guidedDemoState();
  const story = currentGuidedStory();
  if (!demo.enabled || !story || journeyState().screen !== "workspace") {
    return "";
  }
  return `
    <section class="journey-guided-next-steps">
      <div>
        <p class="section-kicker">Next steps</p>
        <h3>${escapeHtml(story.title)} commercial follow-through</h3>
        <p>The story now returns to the same Property Intelligence profile. Pick one next action to show booking, evidence, Ask CMP or monitoring.</p>
      </div>
      <div class="journey-guided-next-grid">
        ${guidedNextStepsForStory(demo.activeStoryId).map(([label, attrs]) => `
          <button class="secondary-button" type="button" ${attrs}>${escapeHtml(label)}</button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderJourneySpine() {
  const state = journeyState();
  const currentIndex = journeyStages.findIndex((stage) => stage.id === state.currentStage);
  return `
    <section class="journey-spine-card" aria-label="Guided demo progress">
      <div class="journey-spine-copy">
        <p>Add property -> Smart Search -> Confirm unknowns -> Evidence Vault -> Action Plan -> Ask CMP -> Monitoring.</p>
      </div>
      <ol class="journey-spine">
        ${journeyStages.map((stage, index) => `
          <li class="${index < currentIndex ? "is-complete" : index === currentIndex ? "is-current" : "is-upcoming"}">
            <span>${index + 1}</span>
            <strong title="${escapeHtml(stage.fullLabel || stage.label)}">${escapeHtml(stage.label)}</strong>
            <em>${index < currentIndex ? "Complete" : index === currentIndex ? "You are here" : "Coming up"}</em>
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderJourneyScenarioSwitcher() {
  const state = journeyState();
  return `
    <section class="journey-prototype-controls" aria-label="Prototype controls">
      <p>Prototype controls</p>
      <label class="journey-scenario-switcher">
        <span>Demo scenario</span>
        <select data-journey-scenario-select>
          ${Object.entries(journeyDemoScenarios).map(([id, scenario]) => `
            <option value="${escapeHtml(id)}" ${state.scenarioId === id ? "selected" : ""}>${escapeHtml(scenario.label)}</option>
          `).join("")}
        </select>
      </label>
      <small>Visible in demo/testing mode only.</small>
    </section>
  `;
}

function renderJourneyShell(screenHtml) {
  const state = journeyState();
  const guided = guidedDemoState();
  return `
    ${renderGuidedPresenterPanel()}
    <header class="journey-os-header">
      <div>
        <p class="section-kicker">CMP guided journey</p>
        <h1 id="journeyOsTitle">Build an evidence-led property workspace</h1>
        <p>Start with an address. CMP checks demo records, asks landlord-only unknowns, then creates the property workspace, action plan and monitoring trail.</p>
        <span class="prototype-badge">Prototype mode · simulated data</span>
        <small class="nick-demo-disclaimer">Smart Search, Ask CMP, scoring, bookings and evidence updates are simulated for this demo. No live API lookup, supplier booking, payment, document storage or legal advice is happening.</small>
      </div>
      <div class="journey-os-header-actions">
        ${guided.enabled ? `
          <section class="journey-guided-status-card" aria-label="Guided demo status">
            <span>Guided demo mode</span>
            <strong>Simulated data, real product journey</strong>
            <div class="button-row">
              <button class="secondary-button" type="button" data-guided-reset>Reset scenario</button>
              <button class="text-button" type="button" data-guided-exit>Exit</button>
            </div>
          </section>
        ` : `
          ${renderJourneyScenarioSwitcher()}
          <button class="primary-button" type="button" data-guided-enter>Run guided demo</button>
          <button class="secondary-button" type="button" data-journey-reset>Reset demo</button>
        `}
      </div>
    </header>
    ${renderJourneySpine()}
    ${renderGuidedCallout()}
    ${state.branchEffects.length ? `
      <section class="journey-branch-effects" aria-live="polite">
        <div>
          <strong>Latest route changes</strong>
          <small>These side routes were added by the current demo answers or scenario.</small>
        </div>
        <div>
          ${state.branchEffects.slice(0, 4).map((effect) => `<span>${escapeHtml(effect)}</span>`).join("")}
        </div>
      </section>
    ` : ""}
    ${screenHtml}
  `;
}

function renderJourneyStart() {
  return renderJourneyShell(`
    <section class="journey-hero-panel">
      <div>
        <p class="section-kicker">Start</p>
        <h2>Build a Property Intelligence profile before choosing what to fix</h2>
        <p>Start with an address. CMP will simulate official checks, ask only for the things public records cannot know, and return every route to a property workspace.</p>
        <div class="button-row">
          <button class="primary-button" type="button" data-journey-go="add">Check My Property</button>
          <button class="secondary-button" type="button" data-journey-go="workspace">Open workspace preview</button>
        </div>
      </div>
      <aside class="journey-principle-card">
        <strong>No dead ends</strong>
        <p>Every branch returns to the Property Workspace with an updated action plan, evidence status, services, timeline and monitoring preview.</p>
      </aside>
    </section>
  `);
}

function renderJourneyAddProperty() {
  const state = journeyState();
  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Add Property</p>
        <h2>Enter the address CMP should check</h2>
        <p>For demo purposes, type anything or use the prefilled address. No live lookup is performed.</p>
      </div>
      <form class="journey-address-form" data-journey-address-form>
        <label>
          <span>Postcode</span>
          <input type="text" name="postcode" value="${escapeHtml(state.postcodeInput)}" placeholder="CV1 3BJ">
        </label>
        <label>
          <span>Address or selected address</span>
          <input type="text" name="address" value="${escapeHtml(state.addressInput)}" placeholder="Flat 42, 57 The Butts...">
        </label>
        <div class="button-row">
          <button class="primary-button" type="submit">Run simulated auto checks</button>
          <button class="secondary-button" type="button" data-journey-use-demo-address>Use demo address</button>
        </div>
      </form>
    </section>
  `);
}

function renderJourneyAutoChecks() {
  const state = journeyState();
  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Auto Checks</p>
        <h2>Running simulated property checks</h2>
        <p>CMP checked this automatically using local demo data. The real product would connect official records, property clues and document intelligence here.</p>
      </div>
      <div class="journey-progress-grid">
        ${journeyAutoCheckSteps.map((step, index) => `
          <article class="journey-progress-card ${index < state.autoCheckStep ? "is-complete" : index === state.autoCheckStep ? "is-active" : ""}">
            <span>${index < state.autoCheckStep ? "Done" : index === state.autoCheckStep ? "Checking" : "Waiting"}</span>
            <strong>${escapeHtml(step)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function journeyMatchRecords() {
  return [
    { id: "match-1", address: "Flat 42, 57 The Butts, Coventry", postcode: "CV1 3BJ", rating: "D", expiry: "14 March 2031", type: "Converted flat", confidence: "76%" },
    { id: "match-2", address: "57 The Butts, Coventry", postcode: "CV1 3BJ", rating: "C", expiry: "02 February 2034", type: "Purpose-built flat", confidence: "68%" },
    { id: "match-3", address: "Basement Flat, 57 The Butts, Coventry", postcode: "CV1 3BJ", rating: "E", expiry: "29 August 2028", type: "Basement flat", confidence: "49%" }
  ];
}

function renderJourneyMatch() {
  const state = journeyState();
  const branch = journeyScenario().branch;
  const brain = state.propertyBrain;

  if (branch === "multiple") {
    return renderJourneyShell(`
      <section class="journey-step-panel">
        <div class="journey-step-heading">
          <p class="section-kicker">Property Match</p>
          <h2>CMP found several possible records</h2>
          <p>Select the best match or continue with low identity confidence. All routes continue to the review screen.</p>
        </div>
        <div class="journey-match-grid">
          ${journeyMatchRecords().map((record) => `
            <article class="journey-match-card">
              <h3>${escapeHtml(record.address)}</h3>
              <dl>
                <div><dt>Postcode</dt><dd>${escapeHtml(record.postcode)}</dd></div>
                <div><dt>EPC</dt><dd>${escapeHtml(record.rating)} · expires ${escapeHtml(record.expiry)}</dd></div>
                <div><dt>Type</dt><dd>${escapeHtml(record.type)}</dd></div>
                <div><dt>Confidence</dt><dd>${escapeHtml(record.confidence)}</dd></div>
              </dl>
              <button class="primary-button" type="button" data-journey-select-match="${escapeHtml(record.id)}">Select this property</button>
            </article>
          `).join("")}
        </div>
        <div class="button-row">
          <button class="secondary-button" type="button" data-journey-select-match="uncertain">I'm not sure</button>
          <button class="text-button" type="button" data-journey-go="add">None of these match</button>
        </div>
      </section>
    `);
  }

  if (branch === "noEpc") {
    return renderJourneyShell(`
      <section class="journey-step-panel">
        <div class="journey-step-heading">
          <p class="section-kicker">Property Match</p>
          <h2>We couldn't find a clear EPC record</h2>
          <p>CMP can continue manually, but EPC stays as an action until uploaded, found or booked.</p>
        </div>
        <div class="journey-choice-grid">
          ${[
            ["rented", "Currently rented"],
            ["advertised", "Being advertised"],
            ["vacant", "Vacant / preparing to rent"],
            ["upload", "I have an EPC to upload"],
            ["manual", "Continue manually"]
          ].map(([id, label]) => `<button class="journey-choice" type="button" data-journey-no-epc="${id}">${label}</button>`).join("")}
        </div>
      </section>
    `);
  }

  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Property Match</p>
        <h2>This looks like your property</h2>
        <p>CMP found a clean simulated match. Confirm it or go back to correct the address.</p>
      </div>
      <article class="journey-match-card is-featured">
        <h3>${escapeHtml(brain.PropertyIdentity.address)}</h3>
        <dl>
          <div><dt>UPRN</dt><dd>${escapeHtml(brain.PropertyIdentity.uprn)}</dd></div>
          <div><dt>EPC</dt><dd>${escapeHtml(brain.AutoCheckResults.epcRating)} · expires ${escapeHtml(brain.AutoCheckResults.epcExpiry)}</dd></div>
          <div><dt>Property type</dt><dd>${escapeHtml(brain.PropertyIdentity.propertyType)}</dd></div>
          <div><dt>Confidence</dt><dd>${escapeHtml(brain.PropertyIdentity.identityConfidence)}</dd></div>
        </dl>
        <div class="button-row">
          <button class="primary-button" type="button" data-journey-select-match="clean">Yes, this is my property</button>
          <button class="secondary-button" type="button" data-journey-go="add">Edit / wrong property</button>
        </div>
      </article>
    </section>
  `);
}

function renderJourneyReview() {
  const brain = journeyState().propertyBrain;
  const auto = brain.AutoCheckResults;
  const identity = brain.PropertyIdentity;
  const epcMessage = !auto.epcFound
    ? "No clear EPC record found. CMP can continue, but EPC will remain an action until uploaded, found, or booked."
    : auto.epcRating === "E"
      ? "Currently acceptable but future-risk. CMP recommends an EPC improvement plan."
      : ["F", "G"].includes(auto.epcRating)
        ? "Urgent MEES risk. Improvement or exemption review recommended."
        : "EPC record looks usable as a simulated starting signal.";

  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Review Found Data</p>
        <h2>CMP has built a first picture from simulated records</h2>
        <p>${escapeHtml(epcMessage)}</p>
      </div>
      <div class="journey-data-grid">
        ${[
          ["EPC rating", auto.epcRating],
          ["EPC potential", auto.epcFound ? `${auto.epcPotentialRating} (${auto.epcPotentialScore || "unknown"})` : "Unknown"],
          ["EPC expiry", auto.epcExpiry],
          ["Property type", `${identity.propertyType} · ${identity.propertyTypeConfidence} confidence`],
          ["Local authority", identity.localAuthority],
          ["Main heating", auto.mainHeating],
          ["Property age", auto.propertyAge],
          ["Council tax band", auto.councilTaxBand],
          ["Possible licensing risk", auto.possibleLicensingRisk],
          ["Data confidence", auto.dataConfidence]
        ].map(([term, detail]) => `<article><span>${escapeHtml(term)}</span><strong>${escapeHtml(detail)}</strong></article>`).join("")}
      </div>
      <section class="journey-recommendation-strip">
        <h3>EPC recommendations</h3>
        <div>${auto.epcRecommendations.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      </section>
      <div class="button-row">
        <button class="primary-button" type="button" data-journey-go="unknowns">Answer landlord-only unknowns</button>
        <button class="secondary-button" type="button" data-journey-go="add">Edit / this is not my property</button>
        <button class="secondary-button" type="button" data-journey-action="upload" data-action-id="epc-upload">Simulate evidence upload</button>
        <button class="text-button" type="button" data-journey-action="book" data-action-id="book-epc">Prepare EPC booking</button>
      </div>
    </section>
  `);
}

function renderJourneyAnswerReview() {
  const state = journeyState();
  const answered = journeyUnknownQuestions
    .map((question, index) => {
      const answer = state.answers?.[question.id];
      if (!answer) {
        return "";
      }
      const label = Array.isArray(answer)
        ? conditionAnswerLabels(answer).join(", ")
        : question.options.find((option) => option.id === answer)?.label || answer;
      return `
        <button class="journey-answer-chip" type="button" data-journey-edit-answer="${escapeHtml(question.id)}">
          <span>${escapeHtml(question.title.replace(/\?$/, ""))}</span>
          <strong>${escapeHtml(label)}</strong>
          <small>Edit</small>
        </button>
      `;
    })
    .filter(Boolean);

  if (!answered.length) {
    return "";
  }

  return `
    <section class="journey-answer-review">
      <div>
        <p class="section-kicker">Answers so far</p>
        <p>Change an answer any time. CMP will update routes, scores and recommended services.</p>
      </div>
      <div class="journey-answer-chip-grid">
        ${answered.join("")}
      </div>
    </section>
  `;
}

function renderUnknownsWizard() {
  const state = journeyState();
  const question = journeyUnknownQuestions[state.unknownIndex];

  if (!question) {
    return renderJourneyShell(`
      <section class="journey-step-panel">
        <div class="journey-step-heading">
          <p class="section-kicker">Answer Unknowns</p>
          <h2>Unknowns handled</h2>
          <p>CMP has enough simulated context to build the Property Intelligence profile and action plan.</p>
        </div>
        <div class="button-row">
          <button class="primary-button" type="button" data-journey-build-brain>Build Property Intelligence</button>
          <button class="secondary-button" type="button" data-journey-go="workspace">Open workspace preview</button>
        </div>
      </section>
    `);
  }

  if (question.id === "occupancy" && state.carriedAnswers?.occupancy) {
    return renderJourneyShell(`
      <section class="journey-step-panel journey-wizard-panel">
        <div class="journey-step-heading">
          <p class="section-kicker">Question ${state.unknownIndex + 1} of ${journeyUnknownQuestions.length}</p>
          <h2>CMP carried this answer forward</h2>
          <p>You already told CMP this property context during the No EPC branch, so the journey will not ask you twice.</p>
        </div>
        <article class="journey-carried-answer">
          <span>Already answered from ${escapeHtml(state.carriedAnswers.occupancy.source)}</span>
          <strong>${escapeHtml(state.carriedAnswers.occupancy.label)}</strong>
          <p>CMP carried this into the Property Intelligence profile and will continue with landlord-only unknowns.</p>
        </article>
        <div class="button-row">
          <button class="primary-button" type="button" data-journey-continue-carried>Continue with carried answer</button>
          <button class="secondary-button" type="button" data-journey-edit-answer="occupancy">Change this answer</button>
        </div>
        ${renderJourneyAnswerReview()}
      </section>
    `);
  }

  if (question.id === "condition") {
    const selected = new Set(state.conditionSelections?.length ? state.conditionSelections : conditionAnswerIds(state));
    return renderJourneyShell(`
      <section class="journey-step-panel journey-wizard-panel">
        ${renderJourneyCarriedAnswerNote()}
        <div class="journey-step-heading">
          <p class="section-kicker">Question ${state.unknownIndex + 1} of ${journeyUnknownQuestions.length}</p>
          <h2>${escapeHtml(question.title)}</h2>
          <p>Only you can confirm this. ${escapeHtml(question.why)} Choose all that apply; CMP can add more than one side route and still return to the same workspace.</p>
        </div>
        <div class="journey-choice-grid journey-choice-grid--multi">
          ${question.options.map((option) => `
            <button class="journey-choice ${selected.has(option.id) ? "is-selected" : ""}" type="button" data-journey-condition-toggle="${escapeHtml(option.id)}">
              <strong>${escapeHtml(option.label)}</strong>
              <small>${escapeHtml(option.effect)}</small>
            </button>
          `).join("")}
        </div>
        <div class="button-row">
          <button class="secondary-button" type="button" data-journey-unknown-back ${state.unknownIndex === 0 ? "disabled" : ""}>Back</button>
          <button class="primary-button" type="button" data-journey-condition-submit>Continue with selected issues</button>
        </div>
        ${renderJourneyAnswerReview()}
      </section>
    `);
  }

  return renderJourneyShell(`
    <section class="journey-step-panel journey-wizard-panel">
      ${renderJourneyCarriedAnswerNote()}
      <div class="journey-step-heading">
        <p class="section-kicker">Question ${state.unknownIndex + 1} of ${journeyUnknownQuestions.length}</p>
        <h2>${escapeHtml(question.title)}</h2>
        <p>Only you can confirm this. ${escapeHtml(question.why)} This answer may add a side route, but every route returns to the workspace.</p>
      </div>
      <div class="journey-choice-grid">
        ${question.options.map((option) => `
          <button class="journey-choice ${state.answers?.[question.id] === option.id ? "is-selected" : ""}" type="button" data-journey-answer="${escapeHtml(question.id)}" data-answer-id="${escapeHtml(option.id)}">
            <strong>${escapeHtml(option.label)}</strong>
            <small>${escapeHtml(option.effect)}</small>
          </button>
        `).join("")}
      </div>
      <div class="button-row">
        <button class="secondary-button" type="button" data-journey-unknown-back ${state.unknownIndex === 0 ? "disabled" : ""}>Back</button>
      </div>
      ${renderJourneyAnswerReview()}
    </section>
  `);
}

function renderJourneyCarriedAnswerNote() {
  const carried = journeyState().carriedAnswers?.occupancy;
  if (!carried || journeyState().unknownIndex === 0) {
    return "";
  }
  return `
    <div class="journey-carried-answer journey-carried-answer--compact">
      <span>CMP carried this from the No EPC branch</span>
      <strong>${escapeHtml(carried.label)}</strong>
      <p>This answer is already in the Property Intelligence profile, so CMP will not ask the same occupancy question twice.</p>
    </div>
  `;
}

function renderJourneyBrain() {
  const state = journeyState();
  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Property Intelligence</p>
        <h2>CMP is building your Property Intelligence profile</h2>
        <p>Fake analysis is combining simulated records, landlord answers, evidence gaps and service routes.</p>
      </div>
      ${renderGuidedBrainVisual()}
      <div class="journey-progress-grid">
        ${journeyBrainSteps.map((step, index) => `
          <article class="journey-progress-card ${index < state.brainStep ? "is-complete" : index === state.brainStep ? "is-active" : ""}">
            <span>${index < state.brainStep ? "Done" : index === state.brainStep ? "Building" : "Waiting"}</span>
            <strong>${escapeHtml(step)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function renderRouteSelector() {
  const state = journeyState();
  return `
    <nav class="journey-route-selector" aria-label="Choose Journey OS route">
      ${Object.entries(journeyRoutes).map(([id, route]) => `
        <button class="${state.routeId === id ? "is-active" : ""}" type="button" data-journey-route="${escapeHtml(id)}">
          <strong>${escapeHtml(route.label)}</strong>
          <small>${escapeHtml(route.helper)}</small>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderJourneyScores() {
  const scores = journeyState().propertyBrain.Scores;
  return `
    <section class="journey-score-grid" aria-label="Journey OS scores">
      ${[
        ["Legal Compliance Score", scores.legalComplianceScore],
        ["Evidence Strength Score", scores.evidenceStrengthScore],
        ["Condition Risk Score", scores.conditionRiskScore],
        ["Future Readiness Score", scores.futureReadinessScore],
        ["Service Readiness Score", scores.serviceReadinessScore]
      ].map(([label, value]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${value}%</strong>
          <div><i style="width: ${value}%"></i></div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderJourneyPlanSummary() {
  const state = journeyState();
  const actions = allJourneyActions();
  const nextAction = actions.find((action) => action.status !== "Deferred") || actions[0];
  const routeLabel = journeyRoutes[state.routeId]?.label || "Prioritised";
  const urgentCount = actions.filter((action) => action.risk === "high").length;
  const evidenceCount = (state.actionPlan.missingEvidence || []).length;
  const serviceCount = buildServiceRecommendations(state).length;
  return `
    <section class="journey-plan-summary" aria-label="Action plan summary">
      <div>
        <p class="section-kicker">Next best action</p>
        <h3>${escapeHtml(nextAction?.title || "Open the property workspace")}</h3>
        <p>${escapeHtml(nextAction?.body || "CMP has created a simulated action plan from the Property Intelligence profile.")}</p>
      </div>
      <div class="journey-plan-summary-stats">
        <span><strong>${escapeHtml(routeLabel)}</strong> selected route</span>
        <span><strong>${urgentCount}</strong> urgent blockers</span>
        <span><strong>${evidenceCount}</strong> evidence gaps</span>
        <span><strong>${serviceCount}</strong> recommended services</span>
      </div>
    </section>
  `;
}

function renderJourneyActionCard(action) {
  const recommendation = action.risk === "high"
    ? "Handle this before treating the file as ready."
    : action.risk === "medium"
      ? "Keep this visible and either evidence, book, ask or defer with a reason."
      : "Track this so it does not disappear later.";
  return `
    <article class="journey-action-card ${action.status === "Deferred" ? "is-deferred" : ""}">
      <div>
        <span class="source-badge">${escapeHtml(action.risk)} risk</span>
        <h3>${escapeHtml(action.title)}</h3>
        <p>${escapeHtml(action.body)}</p>
        <div class="journey-action-insight">
          <strong>CMP recommends</strong>
          <span>${escapeHtml(recommendation)}</span>
        </div>
        <small>Status: ${escapeHtml(action.status)}</small>
        ${action.status === "Deferred" ? `<small class="journey-deferred-note">Deferred does not mean solved. CMP keeps this risk visible in the action plan and timeline.</small>` : ""}
      </div>
      <div class="journey-action-buttons">
        <button class="secondary-button" type="button" data-journey-action="upload" data-action-id="${escapeHtml(action.id)}">Upload evidence</button>
        <button class="secondary-button" type="button" data-journey-action="book" data-action-id="${escapeHtml(action.id)}">Book service</button>
        <button class="text-button" type="button" data-journey-action="ask" data-action-id="${escapeHtml(action.id)}">Ask CMP</button>
        <button class="text-button" type="button" data-journey-action="reminder" data-action-id="${escapeHtml(action.id)}">Set reminder</button>
        <button class="text-button" type="button" data-journey-action="defer" data-action-id="${escapeHtml(action.id)}">Defer</button>
      </div>
    </article>
  `;
}

function renderJourneyActionGroups(limitForWorkspace = false) {
  const state = journeyState();
  const plan = state.actionPlan || {};
  const labels = {
    urgentLegalBlockers: "Urgent Legal Blockers",
    missingEvidence: "Missing Evidence",
    expiringSoon: "Expiring Soon",
    conditionRisks: "Condition Risks",
    futureRisks: "Future Risks",
    improvementOpportunities: "Opportunities & Improvements",
    recommendedServices: "Recommended Services"
  };
  const routeGroups = journeyRouteGroups();
  return routeGroups.map((groupId) => {
    const actions = (plan[groupId] || []).filter((action) => action.routeTags.includes(state.routeId) || state.routeId === "prioritised");
    const visible = limitForWorkspace ? actions.slice(0, 3) : actions;
    if (!visible.length) {
      return "";
    }
    return `
      <section class="journey-action-group">
        <div class="section-heading">
          <p class="section-kicker">${escapeHtml(labels[groupId])}</p>
          <h2>${escapeHtml(labels[groupId])}</h2>
        </div>
        <div class="journey-action-grid">
          ${visible.map(renderJourneyActionCard).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderJourneyPlanButtons() {
  return `
    <section class="journey-plan-controls" aria-label="Journey OS service plan controls">
      <p>Every plan button updates the fake basket, timeline and Property Intelligence profile. No supplier is contacted.</p>
      <button class="primary-button" type="button" data-journey-service-plan="urgent">Book urgent only</button>
      <button class="secondary-button" type="button" data-journey-service-plan="legal">Book legal essentials</button>
      <button class="secondary-button" type="button" data-journey-service-plan="risk">Build risk-protected plan</button>
      <button class="secondary-button" type="button" data-journey-service-plan="future">Build future-proof plan</button>
      <button class="text-button" type="button" data-journey-service-plan="quotes">Request quotes first</button>
      <button class="text-button" type="button" data-journey-service-plan="concierge">Done-for-me concierge</button>
    </section>
  `;
}

function renderServiceLifecycleButtons(service) {
  const status = service.status || serviceStatusFor(journeyState(), service.id);
  const messageTemplate = tenantMessageForService(service.id);
  if (status === "recommended") {
    return `
      <button class="primary-button" type="button" data-journey-service="${escapeHtml(service.id)}" data-service-action="booked">Book now</button>
      <button class="secondary-button" type="button" data-journey-service="${escapeHtml(service.id)}" data-service-action="quote_requested">Request quote</button>
      <button class="secondary-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="added">Add to basket</button>
      <button class="text-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="deferred">Save for later</button>
    `;
  }
  if (status === "added") {
    return `
      <button class="primary-button" type="button" data-journey-service="${escapeHtml(service.id)}" data-service-action="booked">Book now</button>
      <button class="secondary-button" type="button" data-journey-service="${escapeHtml(service.id)}" data-service-action="quote_requested">Request quote</button>
      <button class="secondary-button" type="button" data-journey-service-remove="${escapeHtml(service.id)}">Remove from basket</button>
      <button class="text-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="deferred">Save for later</button>
    `;
  }
  if (status === "quote_requested") {
    return `
      <button class="primary-button" type="button" data-journey-service-view="${escapeHtml(service.id)}">View quote request</button>
      <button class="secondary-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="booked">Mark quote accepted</button>
      <button class="secondary-button" type="button" data-journey-service-note="${escapeHtml(service.id)}">Add note</button>
      <button class="text-button" type="button" data-journey-confirm-workspace>Return to workspace</button>
    `;
  }
  if (status === "booked") {
    return `
      <button class="primary-button" type="button" data-journey-service-view="${escapeHtml(service.id)}">View booking</button>
      <button class="secondary-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="pending">Mark service in progress</button>
      <button class="secondary-button" type="button" data-journey-message="${escapeHtml(messageTemplate)}">Generate tenant message</button>
      <button class="text-button" type="button" data-journey-confirm-workspace>Return to workspace</button>
    `;
  }
  if (status === "pending") {
    return `
      <button class="primary-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="completed">Mark completed</button>
      <button class="secondary-button" type="button" data-journey-open-upload>Upload evidence</button>
      <button class="secondary-button" type="button" data-journey-service-note="${escapeHtml(service.id)}">Add timeline note</button>
    `;
  }
  if (status === "completed") {
    return `
      <button class="primary-button" type="button" data-journey-confirm-evidence>View generated evidence</button>
      <button class="secondary-button" type="button" data-journey-view-timeline>View timeline</button>
      <button class="secondary-button" type="button" data-journey-monitor="${escapeHtml(serviceEvidenceConfig(service.id).renewalId)}">Set renewal reminder</button>
      <button class="text-button" type="button" data-journey-confirm-workspace>Return to workspace</button>
    `;
  }
  return `
    <button class="primary-button" type="button" data-journey-service-view="${escapeHtml(service.id)}">View status</button>
    <button class="secondary-button" type="button" data-journey-service-direct="${escapeHtml(service.id)}" data-service-status="added">Add back to basket</button>
  `;
}

function tenantMessageForService(serviceId = "") {
  const mapping = {
    "gas-safety-certificate": "gas-access",
    eicr: "eicr-access",
    "smoke-co-alarm-check": "certificate-follow-up",
    "licensing-check": "council-response",
    "hmo-licence-application": "council-response",
    "fire-risk-assessment": "routine-inspection",
    "room-measurement": "routine-inspection",
    "epc-assessment": "general-access",
    "epc-improvement-plan": "general-access",
    "deposit-compliance-review": "tenant-doc-request",
    "prescribed-info-evidence": "tenant-doc-request",
    "right-to-rent-review": "tenant-doc-request",
    "tenancy-document-pack": "tenant-doc-request",
    "inventory-check-in": "routine-inspection",
    "checkout-report": "routine-inspection",
    "condition-inspection": "routine-inspection",
    "damp-mould-survey": "damp-photo-request",
    "pest-control": "repair-appointment",
    "heating-hot-water-repair": "repair-appointment",
    "roof-gutter-inspection": "repair-appointment",
    "done-for-me-concierge": "certificate-follow-up"
  };
  return mapping[serviceId] || "general-access";
}

function renderJourneyServiceCard(service) {
  const statusClass = `is-${service.status.replace(/_/g, "-")}`;
  const statusLabel = serviceLifecycleLabel(service.status);
  const nextStep = service.status === "recommended" ? "Open intake or add to basket"
    : service.status === "added" ? "Ready to quote or book"
      : service.status === "quote_requested" ? "Fake quote request is visible in the basket"
        : ["booked", "pending"].includes(service.status) ? "Fake booking in progress"
          : service.status === "completed" ? "Completed in this prototype session"
            : service.status === "deferred" ? "Saved for later - risk still visible"
              : "In progress";
  return `
    <article class="journey-service-card">
      <div class="journey-service-top">
        <span class="source-badge">${escapeHtml(service.category)}</span>
        <span class="journey-status-chip ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>
      </div>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.why)}</p>
      <dl>
        <div><dt>Fixes</dt><dd>${escapeHtml(service.whatItFixes)}</dd></div>
        <div><dt>Urgency</dt><dd>${escapeHtml(service.urgency)}</dd></div>
        <div><dt>Linked area</dt><dd>${escapeHtml(service.linkedComplianceArea)}</dd></div>
        <div><dt>Next</dt><dd>${escapeHtml(nextStep)}</dd></div>
      </dl>
      <div class="journey-action-buttons">
        <button class="text-button" type="button" data-journey-service-detail="${escapeHtml(service.id)}">View details</button>
        ${renderServiceLifecycleButtons(service)}
      </div>
    </article>
  `;
}

function renderJourneyServicesExperience() {
  const state = journeyState();
  const services = buildServiceRecommendations(state).filter((service) => serviceMatchesFilter(service, state.serviceFilter));
  const categories = ["Urgent", "Recommended", "Future-proof", "Void / Re-let"];
  const basket = state.serviceBasket;
  return `
    <section class="journey-services-shell">
      <div class="journey-services-summary">
        <article>
          <span>Basket</span>
          <strong>${basket.length}</strong>
          <small>fake service items</small>
        </article>
        <article>
          <span>Booked/pending</span>
          <strong>${basket.filter((item) => ["booked", "pending"].includes(item.status)).length}</strong>
          <small>supplier-ready simulations</small>
        </article>
        <article>
          <span>Quotes</span>
          <strong>${basket.filter((item) => item.status === "quote_requested").length}</strong>
          <small>quote requests</small>
        </article>
      </div>
      ${renderJourneyPlanButtons()}
      <nav class="journey-service-filters" aria-label="Filter recommended services">
        ${journeyServiceFilters.map((filter) => `
          <button class="${state.serviceFilter === filter.id ? "is-active" : ""}" type="button" data-journey-service-filter="${escapeHtml(filter.id)}">${escapeHtml(filter.label)}</button>
        `).join("")}
      </nav>
      ${categories.map((category) => {
        const categoryServices = services.filter((service) => service.category === category);
        if (!categoryServices.length) {
          return "";
        }
        return `
          <section class="journey-service-group">
            <div class="section-heading">
              <p class="section-kicker">${escapeHtml(category)}</p>
              <h2>${escapeHtml(category)} services</h2>
              <p>CMP is recommending these from the current Property Intelligence profile, not from a live supplier directory.</p>
            </div>
            <div class="journey-service-grid">
              ${categoryServices.map(renderJourneyServiceCard).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </section>
  `;
}

function renderEvidenceVaultExperience() {
  const state = journeyState();
  return `
    <section class="journey-evidence-shell">
      <article class="journey-upload-panel">
        <div>
          <p class="section-kicker">Fake upload scanner</p>
          <h3>Scan evidence into the Property Intelligence profile</h3>
          <p>Choose a fake document type. CMP will simulate reading, matching, extracting dates and updating evidence.</p>
        </div>
        <button class="primary-button" type="button" data-journey-open-upload>Simulate evidence upload</button>
      </article>
      <div class="journey-evidence-grid">
        ${state.evidenceVault.length ? state.evidenceVault.map((item) => `
          <article class="journey-evidence-card">
            <span class="journey-status-chip is-${escapeHtml((item.reviewStatus || item.uploadStatus || "unknown").replace(/_/g, "-"))}">${escapeHtml(item.reviewStatus || item.uploadStatus)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.fakeScanResult)} · ${escapeHtml(item.linkedComplianceArea)}</p>
            <dl>
              <div><dt>Address</dt><dd>${escapeHtml(item.addressMatch)}</dd></div>
              <div><dt>Date</dt><dd>${escapeHtml(item.extractedDate)}</dd></div>
              <div><dt>Expiry</dt><dd>${escapeHtml(item.expiryDate)}</dd></div>
              <div><dt>Confidence</dt><dd>${escapeHtml(item.confidence)}</dd></div>
            </dl>
          </article>
        `).join("") : `
          <article class="journey-evidence-card">
            <h3>No scanned evidence yet</h3>
            <p>Upload a fake EPC, Gas Safety, EICR, deposit certificate, council letter or inspection report to see the vault update.</p>
          </article>
        `}
      </div>
    </section>
  `;
}

function renderAskCmpExperience() {
  const state = journeyState();
  const latest = state.askHistory[0];
  return `
    <section class="journey-ask-shell">
      <article class="journey-ask-note">
        <p class="section-kicker">Ask CMP</p>
        <h3>Property-specific simulated assistant</h3>
        <p>Demo mode: Ask CMP responses are simulated from local property data.</p>
      </article>
      <div class="journey-ask-chips">
        ${journeyAskPrompts.map((prompt) => `<button type="button" data-journey-ask-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
      </div>
      <article class="journey-ask-response">
        <span>${latest ? escapeHtml(latest.prompt) : "Suggested question"}</span>
        <p>${latest ? escapeHtml(latest.body) : "Ask what to do first, what can wait, what to book, or what to say to the tenant."}</p>
        <div class="journey-action-buttons">
          <button class="secondary-button" type="button" data-journey-service="gas-safety-certificate" data-service-action="booked">Book Gas Safety</button>
          <button class="secondary-button" type="button" data-journey-service="eicr" data-service-action="booked">Book EICR</button>
          <button class="secondary-button" type="button" data-journey-open-upload>Upload evidence</button>
          <button class="secondary-button" type="button" data-journey-service-plan="legal">Add legal essentials to basket</button>
          <button class="text-button" type="button" data-journey-message="gas-access">Generate tenant message</button>
          <button class="text-button" type="button" data-journey-monitor="annual-review">Set reminder</button>
          <button class="text-button" type="button" data-journey-workspace-tab-link="evidence">View evidence gaps</button>
          <button class="text-button" type="button" data-journey-escalate>Escalate placeholder</button>
        </div>
      </article>
      <article class="journey-message-picker">
        <h3>Tenant message generator</h3>
        <p>Generate a practical draft from this Property Intelligence profile, then log it to the timeline if useful.</p>
        <div class="journey-message-grid">
          ${journeyTenantMessageTemplates.map((template) => `<button type="button" data-journey-message="${escapeHtml(template.id)}">${escapeHtml(template.title)}</button>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderMonitoringExperience() {
  const state = journeyState();
  return `
    <section class="journey-monitoring-shell">
      <div class="journey-monitor-grid">
        ${state.monitoringItems.map((item) => `
          <article class="journey-monitor-card">
            <span class="source-badge">${escapeHtml(item.type)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <dl>
              <div><dt>Due</dt><dd>${escapeHtml(item.dueDate)}</dd></div>
              <div><dt>Urgency</dt><dd>${escapeHtml(item.urgency)}</dd></div>
              <div><dt>Status</dt><dd>${escapeHtml(item.status || "watching")}</dd></div>
            </dl>
            <div class="journey-action-buttons">
              <button class="secondary-button" type="button" data-journey-monitor="${escapeHtml(item.id)}" data-monitor-status="watching">Set reminder</button>
              <button class="text-button" type="button" data-journey-monitor="${escapeHtml(item.id)}" data-monitor-status="watched">Mark watched</button>
              <button class="text-button" type="button" data-journey-monitor="annual-review" data-monitor-status="watching">Add annual review</button>
              <button class="text-button" type="button" data-journey-monitor="${escapeHtml(item.id)}" data-monitor-status="deferred">Defer</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPortfolioPreviewExperience() {
  const urgentCount = journeyPortfolioPreviewProperties.filter((property) => property.urgency === "High").length;
  return `
    <section class="journey-portfolio-preview">
      <div class="section-heading">
        <p class="section-kicker">Portfolio preview</p>
        <h2>How Journey OS scales across properties</h2>
        <p>A compact fake portfolio view that shows the future global value without rebuilding the whole dashboard.</p>
      </div>
      <div class="journey-services-summary">
        <article><span>Total properties</span><strong>${journeyPortfolioPreviewProperties.length}</strong><small>preview files</small></article>
        <article><span>Urgent actions</span><strong>${urgentCount}</strong><small>need attention</small></article>
        <article><span>EPC future-risk</span><strong>1</strong><small>property at E</small></article>
        <article><span>Monitoring items</span><strong>${journeyState().monitoringItems.length}</strong><small>watching</small></article>
      </div>
      <div class="journey-portfolio-grid">
        ${journeyPortfolioPreviewProperties.map((property) => `
          <article class="journey-portfolio-card">
            <span class="source-badge">${escapeHtml(property.urgency)} urgency</span>
            <h3>${escapeHtml(property.address)}</h3>
            <p>${escapeHtml(property.issue)}</p>
            <small>EPC ${escapeHtml(property.epc)} · evidence ${escapeHtml(property.evidence)}</small>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderJourneyActionPlan() {
  return renderJourneyShell(`
    <section class="journey-step-panel">
      <div class="journey-step-heading">
        <p class="section-kicker">Results / Action Plan</p>
        <h2>Your simulated CMP action plan</h2>
        <p>Choose how you want CMP to organise the same Property Intelligence profile. The plan reorders and filters without losing risk visibility.</p>
      </div>
      <section class="journey-answer-update-note">
        <div>
          <strong>Need to change an answer?</strong>
          <span>CMP will update routes, scores and recommended services when landlord details change.</span>
        </div>
        <button class="secondary-button" type="button" data-journey-edit-answer="occupancy">Edit answers</button>
      </section>
      ${renderJourneyScores()}
      ${renderJourneyPlanSummary()}
      ${renderRouteSelector()}
      ${renderJourneyPlanButtons()}
      ${renderJourneyActionGroups()}
      ${renderJourneyServicesExperience()}
      <div class="journey-sticky-next">
        <button class="primary-button" type="button" data-journey-go="workspace">Open Property Workspace</button>
      </div>
    </section>
  `);
}

function renderWorkspaceTabContent() {
  const state = journeyState();
  const brain = state.propertyBrain;
  const topAction = allJourneyActions().find((action) => action.status !== "Deferred") || allJourneyActions()[0];
  const tab = state.workspaceTab;

  if (tab === "compliance") {
    return `<div class="journey-workspace-grid">${renderJourneyActionGroups(true)}</div>`;
  }
  if (tab === "evidence") {
    return renderEvidenceVaultExperience();
  }
  if (tab === "services") {
    return renderJourneyServicesExperience();
  }
  if (tab === "timeline") {
    return `<section class="journey-timeline">${state.timelineEvents.map((event) => `<article><span>${escapeHtml(event.time)} · ${escapeHtml(event.type)}</span><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.body)}</p></article>`).join("")}</section>`;
  }
  if (tab === "ask") {
    return renderAskCmpExperience();
  }
  if (tab === "monitoring") {
    return renderMonitoringExperience();
  }
  return `
    <section class="journey-workspace-overview">
      <article class="journey-workspace-card is-primary">
        <p class="section-kicker">Top next action</p>
        <h3>${escapeHtml(topAction?.title || "No action selected")}</h3>
        <p>${escapeHtml(topAction?.body || "Journey OS has no action for this route yet.")}</p>
        <div class="button-row">
          <button class="primary-button" type="button" data-journey-action="book" data-action-id="${escapeHtml(topAction?.id || "top-action")}">Book service</button>
          <button class="secondary-button" type="button" data-journey-action="upload" data-action-id="${escapeHtml(topAction?.id || "top-action")}">Upload evidence</button>
          <button class="text-button" type="button" data-journey-action="ask" data-action-id="${escapeHtml(topAction?.id || "top-action")}">Ask CMP</button>
        </div>
      </article>
      <article class="journey-workspace-card"><h3>What CMP found</h3><p>${escapeHtml(brain.AutoCheckResults.epcRecordStatus)} · EPC ${escapeHtml(brain.AutoCheckResults.epcRating)} · ${escapeHtml(brain.PropertyIdentity.localAuthority)}</p></article>
      <article class="journey-workspace-card"><h3>What CMP still needs</h3><p>${(state.actionPlan.missingEvidence || []).slice(0, 3).map((item) => item.title).join(", ") || "No missing evidence on this route."}</p></article>
      <article class="journey-workspace-card"><h3>Recommended services</h3><p>${(state.actionPlan.recommendedServices || []).slice(0, 3).map((item) => item.title).join(", ") || "No service basket started yet."}</p></article>
    </section>
    ${renderPortfolioPreviewExperience()}
  `;
}

function renderPropertyWorkspace() {
  const state = journeyState();
  const brain = state.propertyBrain;
  const tabs = [
    ["overview", "Overview"],
    ["compliance", "Compliance"],
    ["evidence", "Evidence"],
    ["services", "Services"],
    ["timeline", "Timeline"],
    ["ask", "Ask CMP"],
    ["monitoring", "Monitoring"]
  ];
  return renderJourneyShell(`
    <section class="journey-workspace">
      <header class="journey-workspace-header">
        <div>
          <p class="section-kicker">Property Workspace Created</p>
          <h2>${escapeHtml(brain.PropertyIdentity.address)}</h2>
          <p>Created from simulated checks, landlord answers and the ${escapeHtml(journeyRoutes[state.routeId]?.label || "Prioritised")} route. Every action below updates this local demo Property Intelligence profile.</p>
        </div>
        <div class="journey-workspace-meta">
          <span>UPRN ${escapeHtml(brain.PropertyIdentity.uprn)}</span>
          <span>${escapeHtml(brain.PropertyIdentity.identityConfidence)} identity confidence</span>
        </div>
      </header>
      ${renderJourneyScores()}
      <nav class="journey-workspace-tabs" aria-label="Journey OS workspace tabs">
        ${tabs.map(([id, label]) => `<button class="${state.workspaceTab === id ? "is-active" : ""}" type="button" data-journey-workspace-tab="${id}">${label}</button>`).join("")}
      </nav>
      ${renderGuidedNextStepsPanel()}
      ${renderWorkspaceTabContent()}
    </section>
  `);
}

function renderJourneyOsState() {
  const page = document.querySelector("[data-journey-os]");
  if (!page) {
    return;
  }

  syncGuidedDemoClass();
  const guided = guidedDemoState();
  if (guided.enabled && guided.mode === "landing" && !guided.activeStoryId) {
    page.innerHTML = renderGuidedDemoLanding();
    hydrateIcons();
    return;
  }

  const state = journeyState();
  const screens = {
    start: renderJourneyStart,
    add: renderJourneyAddProperty,
    autoChecks: renderJourneyAutoChecks,
    match: renderJourneyMatch,
    review: renderJourneyReview,
    unknowns: renderUnknownsWizard,
    brain: renderJourneyBrain,
    actionPlan: renderJourneyActionPlan,
    workspace: renderPropertyWorkspace
  };
  page.innerHTML = (screens[state.screen] || renderJourneyStart)();
  hydrateIcons();
}

function showJourneyOs({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-journey-os]",
    view: "journeyOs",
    navLabel: "Journey OS",
    bodyClass: "journey-os-active",
    response: "Journey OS is running in demo mode with simulated API checks, compliance analysis and document intelligence.",
    scroll
  });
  syncGuidedDemoClass();
}

function runMockAutoChecks() {
  const state = journeyState();
  clearJourneyTimers();
  state.autoCheckStep = 0;
  state.currentStage = "autoChecks";
  state.screen = "autoChecks";
  addTimelineEvent({
    title: "Property search started",
    body: `${state.addressInput || "Demo address"} submitted to simulated Journey OS checks.`,
    type: "Auto checks"
  });
  renderJourneyOsState();

  journeyAutoCheckSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      state.autoCheckStep = index + 1;
      renderJourneyOsState();
      if (index === journeyAutoCheckSteps.length - 1) {
        addTimelineEvent({
          title: "Fake auto checks completed",
          body: "UPRN, EPC, local authority, licensing and property clues were simulated.",
          type: "Auto checks"
        });
        const finishTimer = window.setTimeout(() => {
          setJourneyStage("confirmProperty", "match");
        }, 360);
        state.autoTimers.push(finishTimer);
      }
    }, 260 + index * 380);
    state.autoTimers.push(timer);
  });
}

function runPropertyBrainBuild() {
  const state = journeyState();
  clearJourneyTimers();
  state.brainStep = 0;
  state.currentStage = "brain";
  state.screen = "brain";
  renderJourneyOsState();

  journeyBrainSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      state.brainStep = index + 1;
      renderJourneyOsState();
      if (index === journeyBrainSteps.length - 1) {
        state.actionPlan = buildJourneyActionPlan(state);
        addTimelineEvent({
          title: "Property brain built",
          body: "Scores, missing evidence, service routes and monitoring preview were generated.",
          type: "Property brain"
        });
        addTimelineEvent({
          title: "Action plan generated",
          body: `${journeyRoutes[state.routeId]?.label || "Prioritised"} action plan prepared.`,
          type: "Action plan"
        });
        const finishTimer = window.setTimeout(() => {
          setJourneyStage("actionPlan", "actionPlan");
        }, 420);
        state.brainTimers.push(finishTimer);
      }
    }, 220 + index * 330);
    state.brainTimers.push(timer);
  });
}

function journeyActionById(actionId) {
  return allJourneyActions().find((action) => action.id === actionId) || {
    id: actionId,
    title: "Journey OS action",
    body: "Prototype action linked to the current Property Intelligence profile.",
    risk: "medium",
    status: "Open"
  };
}

function renderServiceIntakeModal() {
  const state = journeyState();
  const intake = state.activeIntake;
  const service = journeyServiceById(intake?.serviceId);
  const status = serviceStatusFor(state, service.id);
  return `
    <section class="journey-intake-modal">
      <div class="journey-service-detail-hero">
        <span class="journey-status-chip is-${escapeHtml(status.replace(/_/g, "-"))}">${escapeHtml(serviceLifecycleLabel(status))}</span>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.whatItFixes)}</p>
      </div>
      <div class="journey-known-data">
        <h3>What CMP already knows</h3>
        <dl>
          <div><dt>Address</dt><dd>${escapeHtml(state.propertyBrain.PropertyIdentity.address)}</dd></div>
          <div><dt>Occupancy</dt><dd>${escapeHtml(state.propertyBrain.TenancyProfile.occupancyStatus)}</dd></div>
          <div><dt>EPC</dt><dd>${escapeHtml(state.propertyBrain.AutoCheckResults.epcRating)}</dd></div>
          <div><dt>Property type</dt><dd>${escapeHtml(state.propertyBrain.PropertyIdentity.propertyType)}</dd></div>
          <div><dt>Linked area</dt><dd>${escapeHtml(service.linkedComplianceArea)}</dd></div>
          <div><dt>Urgency</dt><dd>${escapeHtml(service.urgency)}</dd></div>
        </dl>
      </div>
      <div class="journey-intake-questions">
        <h3>Supplier-ready questions</h3>
        <p>CMP has filled the property context. These are the remaining fake supplier-ready details.</p>
        ${service.questions.map((question, index) => `
          <label>
            <span>${escapeHtml(question)}</span>
            <input type="text" value="${escapeHtml(intake?.answers?.[question] || (index < 2 ? "CMP demo answer" : ""))}" data-intake-question="${escapeHtml(question)}" placeholder="Prototype answer">
          </label>
        `).join("")}
      </div>
      <div class="journey-action-buttons">
        <button class="primary-button" type="button" data-service-intake-complete="${escapeHtml(service.id)}" data-service-final-status="booked">Book now</button>
        <button class="secondary-button" type="button" data-service-intake-complete="${escapeHtml(service.id)}" data-service-final-status="quote_requested">Request quote</button>
        <button class="secondary-button" type="button" data-service-intake-complete="${escapeHtml(service.id)}" data-service-final-status="added">Add to basket</button>
        <button class="text-button" type="button" data-service-intake-complete="${escapeHtml(service.id)}" data-service-final-status="deferred">Save for later</button>
      </div>
    </section>
  `;
}

function openServiceDetail(serviceId) {
  const state = journeyState();
  state.activeServiceDetail = serviceId;
  state.modalMode = "service-detail";
  state.activeAction = { actionType: "service-detail", actionId: serviceId };
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function openServiceConfirmation(serviceId, status = serviceStatusFor(journeyState(), serviceId)) {
  const state = journeyState();
  const item = ensureServiceBasketItem(serviceId, status);
  state.activeConfirmation = serviceConfirmationFor(status, item, [journeyServiceById(serviceId)]);
  state.modalMode = "service-confirmation";
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function renderServiceDetailModal() {
  const state = journeyState();
  const service = journeyServiceById(state.activeServiceDetail || state.activeIntake?.serviceId);
  const status = serviceStatusFor(state, service.id);
  const config = serviceEvidenceConfig(service.id);
  const known = buildServiceRecommendations(state).find((item) => item.id === service.id)?.knownPropertyData || {};
  return `
    <section class="journey-service-detail-modal">
      <div class="journey-service-detail-hero">
        <span class="journey-status-chip is-${escapeHtml(status.replace(/_/g, "-"))}">${escapeHtml(serviceLifecycleLabel(status))}</span>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.why)}</p>
      </div>
      <div class="journey-service-detail-grid">
        <article>
          <span>What it fixes</span>
          <strong>${escapeHtml(service.whatItFixes)}</strong>
        </article>
        <article>
          <span>Linked property</span>
          <strong>${escapeHtml(state.propertyBrain.PropertyIdentity.address)}</strong>
        </article>
        <article>
          <span>Compliance area</span>
          <strong>${escapeHtml(service.linkedComplianceArea)}</strong>
        </article>
        <article>
          <span>Expected evidence</span>
          <strong>${escapeHtml(config.title)}</strong>
        </article>
      </div>
      <div class="journey-known-data">
        <h3>What CMP already knows</h3>
        <dl>
          <div><dt>Property type</dt><dd>${escapeHtml(known.propertyType || state.propertyBrain.PropertyIdentity.propertyType)}</dd></div>
          <div><dt>Occupancy</dt><dd>${escapeHtml(known.occupancy || state.propertyBrain.TenancyProfile.occupancyStatus)}</dd></div>
          <div><dt>EPC</dt><dd>${escapeHtml(String(known.epc || state.propertyBrain.AutoCheckResults.epcRating))}</dd></div>
          <div><dt>Current status</dt><dd>${escapeHtml(serviceLifecycleLabel(status))}</dd></div>
        </dl>
      </div>
      <div class="journey-intake-questions">
        <h3>Supplier still needs</h3>
        <ul class="journey-service-question-list">
          ${service.questions.slice(0, 7).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
        </ul>
      </div>
      <div class="journey-action-buttons">
        ${renderServiceLifecycleButtons(service)}
      </div>
    </section>
  `;
}

function renderServiceConfirmationModal() {
  const state = journeyState();
  const confirmation = state.activeConfirmation || serviceConfirmationFor("added", ensureServiceBasketItem("annual-monitoring", "added"));
  const messageTemplate = tenantMessageForService(confirmation.serviceIds?.[0] || "");
  return `
    <section class="journey-confirmation-modal">
      <div class="journey-confirmation-banner">
        <span class="journey-status-chip is-${escapeHtml(confirmation.status.replace(/_/g, "-"))}">${escapeHtml(serviceLifecycleLabel(confirmation.status))}</span>
        <h3>${escapeHtml(confirmation.title)}</h3>
        <p>${escapeHtml(confirmation.body)}</p>
      </div>
      <div class="journey-confirmation-grid">
        <article><span>Property</span><strong>${escapeHtml(confirmation.property)}</strong></article>
        <article><span>Reference</span><strong>${escapeHtml(confirmation.reference)}</strong></article>
        <article><span>Services</span><strong>${escapeHtml(confirmation.services.join(", ") || "Service plan")}</strong></article>
        <article><span>Evidence expected</span><strong>${escapeHtml(confirmation.evidenceExpected.join(", ") || "Evidence follow-up")}</strong></article>
      </div>
      <article class="journey-property-brain-updated">
        <strong>Property brain updated</strong>
        <p>${escapeHtml(confirmation.nextStep)} CMP updated timeline, service state, evidence where relevant and monitoring reminders locally.</p>
      </article>
      <div class="journey-action-buttons">
        <button class="primary-button" type="button" data-journey-confirm-workspace>View workspace</button>
        <button class="secondary-button" type="button" data-journey-confirm-services>View service basket</button>
        <button class="secondary-button" type="button" data-journey-confirm-evidence>View generated evidence</button>
        <button class="text-button" type="button" data-journey-message="${escapeHtml(messageTemplate)}">Generate tenant message</button>
        <button class="text-button" type="button" data-journey-monitor="annual-review">Set reminder</button>
      </div>
    </section>
  `;
}

function renderFakeUploadModal() {
  const scanner = journeyState().activeScanner;
  if (!scanner?.documentTypeId) {
    return `
      <section class="journey-upload-modal">
        <h3>Choose a fake document type</h3>
        <div class="journey-document-grid">
          ${journeyDocumentTypes.map((documentType) => `
            <button type="button" data-fake-scan-doc="${escapeHtml(documentType.id)}">
              <strong>${escapeHtml(documentType.label)}</strong>
              <small>${escapeHtml(documentType.complianceArea)}</small>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }
  const doc = journeyDocumentTypes.find((item) => item.id === scanner.documentTypeId);
  const outcome = journeyScanOutcomes[scanner.outcomeId] || journeyScanOutcomes.valid;
  return `
    <section class="journey-upload-modal">
      <h3>${escapeHtml(doc?.label || "Document")} scanner</h3>
      <div class="journey-scan-rail">
        ${journeyScanSteps.map((step, index) => `
          <article class="${index < scanner.step ? "is-complete" : index === scanner.step ? "is-active" : ""}">
            <span>${index < scanner.step ? "Done" : index === scanner.step ? "Scanning" : "Waiting"}</span>
            <strong>${escapeHtml(step)}</strong>
          </article>
        `).join("")}
      </div>
      ${scanner.complete ? `
        <article class="journey-scan-result">
          <span class="journey-status-chip">${escapeHtml(outcome.label)}</span>
          <h3>${escapeHtml(outcome.body)}</h3>
          <button class="primary-button" type="button" data-fake-scan-accept>Accept scan result</button>
        </article>
      ` : ""}
    </section>
  `;
}

function renderAskCmpModal() {
  const latest = journeyState().askHistory[0] || {
    prompt: "What should I do first?",
    body: "Start with the highest-risk service and evidence gap. CMP is using local simulated property data only."
  };
  return `
    <section class="journey-ask-modal">
      <span>${escapeHtml(latest.prompt)}</span>
      <p>${escapeHtml(latest.body)}</p>
      <div class="journey-action-buttons">
        <button class="secondary-button" type="button" data-journey-service="gas-safety-certificate" data-service-action="booked">Book Gas Safety</button>
        <button class="secondary-button" type="button" data-journey-service="eicr" data-service-action="booked">Book EICR</button>
        <button class="secondary-button" type="button" data-journey-open-upload>Upload evidence</button>
        <button class="secondary-button" type="button" data-journey-service-plan="legal">Add legal essentials to basket</button>
        <button class="text-button" type="button" data-journey-message="gas-access">Generate tenant message</button>
        <button class="text-button" type="button" data-journey-monitor="annual-review">Set reminder</button>
        <button class="text-button" type="button" data-journey-workspace-tab-link="evidence">View evidence gaps</button>
        <button class="text-button" type="button" data-journey-escalate>Escalate placeholder</button>
      </div>
    </section>
  `;
}

function renderTenantMessageModal() {
  const message = journeyState().activeTenantMessage;
  return `
    <section class="journey-message-modal">
      <h3>${escapeHtml(message?.title || "Tenant message")}</h3>
      <div class="journey-message-body">${escapeHtml(message?.body || "").replace(/\n/g, "<br>")}</div>
      <p class="modal-note">Practical draft only. Depending on the situation, it may need professional review before sending.</p>
      <div class="journey-action-buttons">
        <button class="secondary-button" type="button" data-toast="Message copied in this prototype.">Copy draft</button>
        <button class="primary-button" type="button" data-journey-log-message>Log to timeline</button>
      </div>
    </section>
  `;
}

function renderJourneyActionModal() {
  const state = journeyState();
  const mode = state.modalMode || state.activeAction?.actionType || "ask";
  const content = document.querySelector("[data-journey-action-content]");
  const reasons = document.querySelector("[data-journey-defer-reasons]");
  const controls = document.querySelector("[data-journey-action-controls]");
  const action = journeyActionById(state.activeAction?.actionId || "journey-action");
  const labels = {
    "service-detail": ["Service detail", journeyServiceById(state.activeServiceDetail).title, "This fake service detail is generated from the Property Intelligence profile, current risks and required evidence."],
    "service-intake": ["Service intake", journeyServiceById(state.activeIntake?.serviceId).title, "CMP has prefilled the supplier-ready job from the Property Intelligence profile. No supplier is contacted."],
    "service-confirmation": ["Service confirmation", state.activeConfirmation?.title || "Service journey updated", "This is a local/mock confirmation. No supplier was contacted and no payment was taken."],
    "fake-upload": ["Fake upload scanner", "Simulate evidence upload", "Choose a document type and let CMP simulate scanning, matching and evidence scoring."],
    "ask-cmp": ["Ask CMP", "Property-specific simulated response", "Demo mode: Ask CMP responses are simulated from local property data."],
    "tenant-message": ["Tenant message", "Generated tenant message", "Create a practical draft and log it as communication evidence if useful."],
    defer: ["Defer action", "Defer without hiding risk", `Choose why "${action.title}" is being deferred. Deferred does not mean solved.`]
  }[mode] || ["Journey OS", action.title, "This prototype action updates local state and returns to the workspace."];

  document.querySelector("[data-journey-action-kicker]").textContent = labels[0];
  document.querySelector("[data-journey-action-title]").textContent = labels[1];
  document.querySelector("[data-journey-action-body]").textContent = labels[2];
  document.querySelector("[data-journey-action-context]").textContent = `Property · ${state.propertyBrain.PropertyIdentity.address}`;
  if (reasons) {
    reasons.hidden = mode !== "defer";
    reasons.innerHTML = ["cost", "waiting for tenant", "booked elsewhere", "not urgent", "unsure"].map((reason, index) => `
      <label class="choice-option">
        <input type="radio" name="journey-defer-reason" value="${escapeHtml(reason)}" ${index === 0 ? "checked" : ""}>
        <span>${escapeHtml(reason)}</span>
      </label>
    `).join("");
  }
  if (content) {
    content.innerHTML = mode === "service-detail" ? renderServiceDetailModal()
      : mode === "service-intake" ? renderServiceIntakeModal()
      : mode === "service-confirmation" ? renderServiceConfirmationModal()
      : mode === "fake-upload" ? renderFakeUploadModal()
      : mode === "ask-cmp" ? renderAskCmpModal()
      : mode === "tenant-message" ? renderTenantMessageModal()
      : "";
  }
  if (controls) {
    controls.innerHTML = mode === "defer"
      ? `<button class="primary-button" type="button" data-journey-action-confirm>Defer and keep visible</button><button class="secondary-button" type="button" data-journey-action-close>Close</button>`
      : mode === "service-confirmation"
        ? `<button class="secondary-button" type="button" data-journey-action-close>Close</button>`
      : `<button class="secondary-button" type="button" data-journey-action-close>Close</button>`;
  }
}

function openActionModal(actionType, actionId) {
  const state = journeyState();
  const action = journeyActionById(actionId);
  if (actionType === "book") {
    openServiceIntake(journeyServiceForAction(action.id).id, "booked");
    return;
  }
  if (actionType === "upload") {
    openFakeUpload();
    return;
  }
  if (actionType === "ask") {
    state.modalMode = "ask-cmp";
    state.activeAction = { actionType, actionId };
    generateAskCmpResponse(`What should I do about ${action.title}?`);
    renderJourneyActionModal();
    openTimelineModal("[data-journey-action-modal]");
    return;
  }
  if (actionType === "reminder") {
    upsertMonitoringItem("annual-review", "watching");
    return;
  }
  state.modalMode = actionType;
  state.activeAction = { actionType, actionId };
  renderJourneyActionModal();
  openTimelineModal("[data-journey-action-modal]");
}

function confirmJourneyAction() {
  const state = journeyState();
  const active = state.activeAction;
  if (!active) {
    closeTimelineModals();
    return;
  }

  const action = journeyActionById(active.actionId);
  if (active.actionType === "upload") {
    state.evidenceVault.unshift({ id: `evidence-${Date.now()}`, title: `${action.title} evidence simulation`, status: "Uploaded simulation" });
    addTimelineEvent({ title: "Evidence simulation uploaded", body: `${action.title} evidence marked as simulated upload.`, type: "Evidence" });
  } else if (active.actionType === "book") {
    state.serviceBasket.unshift({ id: `service-${Date.now()}`, title: action.title, status: "Selected simulation" });
    addTimelineEvent({ title: "Service simulation selected", body: `${action.title} added to the fake service basket.`, type: "Services" });
  } else if (active.actionType === "reminder") {
    state.monitoringItems.unshift({ id: `monitor-${Date.now()}`, title: action.title, status: "Reminder simulation" });
    addTimelineEvent({ title: "Reminder added", body: `${action.title} added to the monitoring preview.`, type: "Monitoring" });
  } else if (active.actionType === "defer") {
    const reason = document.querySelector('input[name="journey-defer-reason"]:checked')?.value || "unsure";
    if (!state.deferredActions.includes(action.id)) {
      state.deferredActions.push(action.id);
    }
    addTimelineEvent({ title: "Action deferred", body: `${action.title} deferred because: ${reason}. Risk remains visible.`, type: "Action plan" });
  } else {
    addTimelineEvent({ title: "Ask CMP opened", body: `Fake response shown for: ${action.title}.`, type: "Ask CMP" });
  }

  state.actionPlan = buildJourneyActionPlan(state);
  state.propertyBrain.Scores = recalculateJourneyScores(state, state.actionPlan);
  state.currentStage = active.actionType === "upload" ? "vault" : active.actionType === "reminder" ? "monitor" : "action";
  state.workspaceTab = active.actionType === "defer" ? "compliance" : state.workspaceTab;
  state.screen = "workspace";
  closeTimelineModals();
  showJourneyOs({ scroll: false });
  showToast("Journey OS prototype state updated.");
}

function bindJourneyOs() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-journey-start]")) {
      event.preventDefault();
      showJourneyOs({ scroll: true });
      return;
    }

    if (event.target.closest("[data-guided-enter]")) {
      event.preventDefault();
      closeTimelineModals();
      enterGuidedDemo();
      return;
    }

    const guidedStoryButton = event.target.closest("[data-guided-story]");
    if (guidedStoryButton) {
      event.preventDefault();
      closeTimelineModals();
      startGuidedStory(guidedStoryButton.dataset.guidedStory);
      return;
    }

    if (event.target.closest("[data-guided-scroll-stories]")) {
      event.preventDefault();
      document.querySelector("#guidedStoryGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (event.target.closest("[data-guided-next]")) {
      event.preventDefault();
      const story = currentGuidedStory();
      const demo = guidedDemoState();
      if (story && demo.activeMomentIndex >= story.moments.length - 1) {
        openGuidedWorkspacePreview();
        showToast("Guided story finished with next steps in the Property Workspace.");
      } else {
        advanceGuidedMoment(1);
      }
      return;
    }

    if (event.target.closest("[data-guided-back]")) {
      event.preventDefault();
      advanceGuidedMoment(-1);
      return;
    }

    if (event.target.closest("[data-guided-restart]")) {
      event.preventDefault();
      resetGuidedDemo(guidedDemoState().activeStoryId);
      return;
    }

    if (event.target.closest("[data-guided-main-demo]")) {
      event.preventDefault();
      closeTimelineModals();
      startGuidedStory("clean-property-check");
      return;
    }

    if (event.target.closest("[data-guided-explore]")) {
      event.preventDefault();
      closeTimelineModals();
      enterGuidedDemo();
      window.setTimeout(() => {
        document.querySelector("#guidedStoryGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }

    if (event.target.closest("[data-guided-open-workspace]")) {
      event.preventDefault();
      openGuidedWorkspacePreview();
      return;
    }

    if (event.target.closest("[data-guided-reset]")) {
      event.preventDefault();
      resetGuidedDemo(guidedDemoState().activeStoryId);
      return;
    }

    if (event.target.closest("[data-guided-exit]")) {
      event.preventDefault();
      exitGuidedDemo();
      return;
    }

    const goButton = event.target.closest("[data-journey-go]");
    if (goButton) {
      const target = goButton.dataset.journeyGo;
      if (target === "add") {
        setJourneyStage("addProperty", "add");
      } else if (target === "unknowns") {
        if (journeyState().carriedAnswers?.occupancy && journeyState().unknownIndex === 0) {
          journeyState().unknownIndex = 1;
          showToast("CMP carried the No EPC context into the Property Intelligence profile.");
        }
        setJourneyStage("unknowns", "unknowns");
      } else if (target === "actionPlan") {
        setJourneyStage("actionPlan", "actionPlan");
      } else if (target === "workspace") {
        addTimelineEvent({ title: "Property Workspace opened", body: "Journey branch returned to the workspace.", type: "Workspace" });
        setJourneyStage("monitor", "workspace");
      }
      return;
    }

    const matchButton = event.target.closest("[data-journey-select-match]");
    if (matchButton) {
      selectPropertyMatch(matchButton.dataset.journeySelectMatch);
      return;
    }

    const noEpcButton = event.target.closest("[data-journey-no-epc]");
    if (noEpcButton) {
      handleNoEpcChoice(noEpcButton.dataset.journeyNoEpc);
      return;
    }

    const answerButton = event.target.closest("[data-journey-answer]");
    if (answerButton) {
      answerUnknown(answerButton.dataset.journeyAnswer, answerButton.dataset.answerId);
      return;
    }

    const conditionToggle = event.target.closest("[data-journey-condition-toggle]");
    if (conditionToggle) {
      toggleConditionSelection(conditionToggle.dataset.journeyConditionToggle);
      return;
    }

    if (event.target.closest("[data-journey-condition-submit]")) {
      answerConditionUnknown(journeyState().conditionSelections);
      return;
    }

    if (event.target.closest("[data-journey-continue-carried]")) {
      journeyState().unknownIndex = 1;
      addTimelineEvent({
        title: "Carried answer used",
        body: "No EPC context answer was carried into the unknowns wizard.",
        type: "Landlord answer"
      });
      showToast("CMP carried this answer into the Property Intelligence profile.");
      renderJourneyOsState();
      return;
    }

    const editAnswer = event.target.closest("[data-journey-edit-answer]");
    if (editAnswer) {
      editUnknownAnswer(editAnswer.dataset.journeyEditAnswer);
      return;
    }

    if (event.target.closest("[data-journey-unknown-back]")) {
      journeyState().unknownIndex = Math.max(0, journeyState().unknownIndex - 1);
      renderJourneyOsState();
      return;
    }

    if (event.target.closest("[data-journey-build-brain]")) {
      runPropertyBrainBuild();
      return;
    }

    const routeButton = event.target.closest("[data-journey-route]");
    if (routeButton) {
      selectRoute(routeButton.dataset.journeyRoute);
      return;
    }

    const workspaceTab = event.target.closest("[data-journey-workspace-tab]");
    if (workspaceTab) {
      journeyState().workspaceTab = workspaceTab.dataset.journeyWorkspaceTab;
      renderJourneyOsState();
      return;
    }

    const actionButton = event.target.closest("[data-journey-action]");
    if (actionButton) {
      openActionModal(actionButton.dataset.journeyAction, actionButton.dataset.actionId || "journey-action");
      return;
    }

    const servicePlan = event.target.closest("[data-journey-service-plan]");
    if (servicePlan) {
      applyServicePlan(servicePlan.dataset.journeyServicePlan);
      return;
    }

    const serviceDetail = event.target.closest("[data-journey-service-detail]");
    if (serviceDetail) {
      openServiceDetail(serviceDetail.dataset.journeyServiceDetail);
      return;
    }

    const serviceButton = event.target.closest("[data-journey-service]");
    if (serviceButton) {
      openServiceIntake(serviceButton.dataset.journeyService, serviceButton.dataset.serviceAction || "added");
      return;
    }

    const serviceView = event.target.closest("[data-journey-service-view]");
    if (serviceView) {
      openServiceConfirmation(serviceView.dataset.journeyServiceView);
      return;
    }

    const serviceRemove = event.target.closest("[data-journey-service-remove]");
    if (serviceRemove) {
      removeServiceFromBasket(serviceRemove.dataset.journeyServiceRemove);
      journeyState().workspaceTab = "services";
      journeyState().screen = "workspace";
      showJourneyOs({ scroll: false });
      return;
    }

    const serviceNote = event.target.closest("[data-journey-service-note]");
    if (serviceNote) {
      const service = journeyServiceById(serviceNote.dataset.journeyServiceNote);
      addTimelineEvent({
        title: "Service note added",
        body: `${service.title}: fake note added for supplier follow-up.`,
        type: "Services"
      });
      journeyState().branchEffects.unshift(`${service.title} note added to timeline`);
      showToast("Service note added to timeline.");
      renderJourneyOsState();
      return;
    }

    const directServiceButton = event.target.closest("[data-journey-service-direct]");
    if (directServiceButton) {
      const status = directServiceButton.dataset.serviceStatus || "added";
      const item = updateServiceStatus(directServiceButton.dataset.journeyServiceDirect, status);
      journeyState().activeConfirmation = serviceConfirmationFor(status, item, [journeyServiceById(item.serviceId)]);
      journeyState().modalMode = "service-confirmation";
      journeyState().workspaceTab = "services";
      journeyState().screen = "workspace";
      renderJourneyActionModal();
      openTimelineModal("[data-journey-action-modal]");
      return;
    }

    const serviceFilter = event.target.closest("[data-journey-service-filter]");
    if (serviceFilter) {
      journeyState().serviceFilter = serviceFilter.dataset.journeyServiceFilter || "all";
      renderJourneyOsState();
      return;
    }

    const intakeComplete = event.target.closest("[data-service-intake-complete]");
    if (intakeComplete) {
      document.querySelectorAll("[data-intake-question]").forEach((input) => {
        saveServiceIntakeAnswer(input.dataset.intakeQuestion, input.value);
      });
      completeServiceIntake(intakeComplete.dataset.serviceIntakeComplete, intakeComplete.dataset.serviceFinalStatus || "added");
      return;
    }

    if (event.target.closest("[data-journey-open-upload]")) {
      openFakeUpload();
      return;
    }

    const fakeScanDoc = event.target.closest("[data-fake-scan-doc]");
    if (fakeScanDoc) {
      startFakeUploadScan(fakeScanDoc.dataset.fakeScanDoc);
      return;
    }

    if (event.target.closest("[data-fake-scan-accept]")) {
      completeFakeScan();
      return;
    }

    const askPrompt = event.target.closest("[data-journey-ask-prompt]");
    if (askPrompt) {
      generateAskCmpResponse(askPrompt.dataset.journeyAskPrompt);
      renderJourneyOsState();
      return;
    }

    const messageButton = event.target.closest("[data-journey-message]");
    if (messageButton) {
      generateTenantMessage(messageButton.dataset.journeyMessage);
      return;
    }

    if (event.target.closest("[data-journey-log-message]")) {
      logTenantMessage();
      return;
    }

    if (event.target.closest("[data-journey-confirm-workspace]")) {
      const state = journeyState();
      state.screen = "workspace";
      state.currentStage = "monitor";
      state.workspaceTab = "overview";
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      return;
    }

    if (event.target.closest("[data-journey-confirm-services]")) {
      const state = journeyState();
      state.screen = "workspace";
      state.currentStage = "action";
      state.workspaceTab = "services";
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      return;
    }

    if (event.target.closest("[data-journey-confirm-evidence]")) {
      const state = journeyState();
      state.screen = "workspace";
      state.currentStage = "vault";
      state.workspaceTab = "evidence";
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      return;
    }

    if (event.target.closest("[data-journey-view-timeline]")) {
      const state = journeyState();
      state.screen = "workspace";
      state.currentStage = "vault";
      state.workspaceTab = "timeline";
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      return;
    }

    const tabLink = event.target.closest("[data-journey-workspace-tab-link]");
    if (tabLink) {
      const state = journeyState();
      state.workspaceTab = tabLink.dataset.journeyWorkspaceTabLink;
      state.screen = "workspace";
      state.currentStage = tabLink.dataset.journeyWorkspaceTabLink === "evidence" ? "vault" : "action";
      addTimelineEvent({
        title: "Workspace section opened",
        body: `${tabLink.textContent.trim()} selected from a Journey OS action.`,
        type: "Workspace"
      });
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      return;
    }

    if (event.target.closest("[data-journey-escalate]")) {
      const state = journeyState();
      state.workspaceTab = "services";
      state.screen = "workspace";
      state.currentStage = "action";
      addTimelineEvent({
        title: "Professional escalation placeholder added",
        body: "CMP would package the Property Intelligence profile, evidence gaps and timeline for human review. No real escalation was sent.",
        type: "Escalation"
      });
      state.branchEffects.unshift("Professional escalation placeholder added");
      closeTimelineModals();
      showJourneyOs({ scroll: false });
      showToast("Escalation placeholder added to the prototype timeline.");
      return;
    }

    const monitorButton = event.target.closest("[data-journey-monitor]");
    if (monitorButton) {
      upsertMonitoringItem(monitorButton.dataset.journeyMonitor, monitorButton.dataset.monitorStatus || "watching");
      return;
    }

    if (event.target.closest("[data-journey-reset]")) {
      applyDemoScenario("clean-property-match");
      return;
    }

    const journeyDemoOption = event.target.closest("[data-journey-demo-option]");
    if (journeyDemoOption) {
      closeTimelineModals();
      applyDemoScenario(journeyDemoOption.dataset.journeyDemoOption);
      return;
    }

    if (event.target.closest("[data-journey-use-demo-address]")) {
      const state = journeyState();
      state.addressInput = "Flat 42, 57 The Butts, Coventry, CV1 3BJ";
      state.postcodeInput = "CV1 3BJ";
      renderJourneyOsState();
      return;
    }

    if (event.target.closest("[data-journey-action-confirm]")) {
      confirmJourneyAction();
      return;
    }

    if (event.target.closest("[data-journey-action-close]")) {
      closeTimelineModals();
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-journey-address-form]");
    if (!form) {
      return;
    }
    event.preventDefault();
    const state = journeyState();
    state.postcodeInput = form.elements.postcode.value.trim() || "CV1 3BJ";
    state.addressInput = form.elements.address.value.trim() || "Flat 42, 57 The Butts, Coventry, CV1 3BJ";
    state.propertyBrain.PropertyIdentity.address = state.addressInput;
    state.propertyBrain.PropertyIdentity.postcode = state.postcodeInput;
    runMockAutoChecks();
  });

  document.addEventListener("change", (event) => {
    const scenarioSelect = event.target.closest("[data-journey-scenario-select]");
    if (scenarioSelect) {
      applyDemoScenario(scenarioSelect.value);
    }
  });
}

function propertyMatchesCurrentView(property) {
  const query = labsState.propertiesSearch.trim().toLowerCase();
  const hasOpenRequest = openRequestCountForProperty(property.id) > 0;
  const matchesSearch = !query || property.search.toLowerCase().includes(query);
  const matchesFilter = labsState.propertiesFilter === "all"
    || (labsState.propertiesFilter === "attention")
    || (labsState.propertiesFilter === "vacant" && property.occupancy === "Vacant property")
    || (labsState.propertiesFilter === "requests" && hasOpenRequest);

  return matchesSearch && matchesFilter;
}

function propertyMapLabelParts(property) {
  const city = (property.location || "").split(",")[0]?.trim() || "Local area";
  const postcodeArea = (property.postcode || "").split(" ")[0] || city;
  const street = (property.address || "Property")
    .replace(/^\d+\s*/, "")
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  return {
    primary: city.toUpperCase(),
    secondary: postcodeArea.toUpperCase(),
    street: street.toUpperCase()
  };
}

function propertyMapSeed(value) {
  return String(value).split("").reduce((total, char) => {
    return ((total << 5) - total + char.charCodeAt(0)) | 0;
  }, 0);
}

function seededMapValue(seed, index, min, max) {
  const raw = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return min + (raw - Math.floor(raw)) * (max - min);
}

function propertyMapPath(seed, index, vertical = false) {
  const points = [];
  const startX = vertical ? seededMapValue(seed, index, 70, 760) : -90;
  const startY = vertical ? -50 : seededMapValue(seed, index, 38, 260);
  points.push([startX, startY]);

  for (let step = 1; step <= 5; step += 1) {
    const drift = seededMapValue(seed, index + step * 7, -42, 42);
    const x = vertical
      ? startX + drift + step * seededMapValue(seed, index + 33, -7, 7)
      : startX + step * 205;
    const y = vertical
      ? startY + step * 86
      : startY + drift + step * seededMapValue(seed, index + 45, -5, 5);
    points.push([x, y]);
  }

  return points.map(([x, y], pointIndex) => {
    return `${pointIndex === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function propertyMapDataUri(property) {
  const labels = propertyMapLabelParts(property);
  const seed = Math.abs(propertyMapSeed(`${property.id}-${property.address}-${property.postcode}`));
  const majorRoads = Array.from({ length: 3 }, (_, index) => propertyMapPath(seed, index + 1, index % 2 === 0));
  const minorRoads = Array.from({ length: 7 }, (_, index) => propertyMapPath(seed + 17, index + 5, index % 3 === 0));
  const areaX = seededMapValue(seed, 61, 390, 610).toFixed(1);
  const areaY = seededMapValue(seed, 62, 118, 188).toFixed(1);
  const streetX = seededMapValue(seed, 63, 118, 720).toFixed(1);
  const streetY = seededMapValue(seed, 64, 48, 245).toFixed(1);
  const streetRotation = seededMapValue(seed, 65, -18, 18).toFixed(1);
  const districtRotation = seededMapValue(seed, 66, -6, 6).toFixed(1);
  const markerX = seededMapValue(seed, 67, 210, 700).toFixed(1);
  const markerY = seededMapValue(seed, 68, 70, 225).toFixed(1);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300">
      <rect width="900" height="300" fill="#f3f8f5"/>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${minorRoads.map((path) => `<path d="${path}" stroke="#93aaa0" stroke-width="7" opacity="0.48"/>`).join("")}
        ${majorRoads.map((path) => `<path d="${path}" stroke="#728d82" stroke-width="13" opacity="0.38"/><path d="${path}" stroke="#fbfffc" stroke-width="5" opacity="0.72"/>`).join("")}
      </g>
      <g fill="#718980" font-family="Avenir Next, Inter, Arial, sans-serif" text-anchor="middle">
        <text x="${areaX}" y="${areaY}" transform="rotate(${districtRotation} ${areaX} ${areaY})" font-size="25" font-weight="750" letter-spacing="8" opacity="0.42">${escapeHtml(labels.primary)}</text>
        <text x="${streetX}" y="${streetY}" transform="rotate(${streetRotation} ${streetX} ${streetY})" font-size="15" font-weight="680" letter-spacing="2" opacity="0.46">${escapeHtml(labels.street)}</text>
        <text x="820" y="52" font-size="13" font-weight="760" letter-spacing="4" opacity="0.34">${escapeHtml(labels.secondary)}</text>
      </g>
      <circle cx="${markerX}" cy="${markerY}" r="8" fill="#267653" opacity="0.16"/>
      <circle cx="${markerX}" cy="${markerY}" r="2.8" fill="#267653" opacity="0.32"/>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function propertyMapStyle(property) {
  const seed = Math.abs(propertyMapSeed(`${property.id}-${property.location}`));
  const x = seededMapValue(seed, 88, 38, 64).toFixed(1);
  const y = seededMapValue(seed, 89, 42, 58).toFixed(1);
  return `--property-map: url('${propertyMapDataUri(property)}'); --property-map-position: ${x}% ${y}%;`;
}

function renderPropertiesCard(property) {
  const openRequests = openRequestCountForProperty(property.id);

  return `
    <article class="properties-card${property.mostUrgent ? " is-most-urgent" : ""}" style="${propertyMapStyle(property)}" data-property-id="${escapeHtml(property.id)}">
      <div class="properties-card-main">
        <div>
          <div class="property-card-heading-row">
            <h2>${escapeHtml(property.address)}</h2>
            ${property.mostUrgent ? '<span class="source-badge">Most urgent</span>' : ""}
          </div>
          <p>${escapeHtml(property.location)}</p>
          <div class="signal-row">
            <span>${escapeHtml(property.occupancy)}</span>
            <span>${escapeHtml(property.journey)}</span>
            ${openRequests ? '<span>Open request</span>' : ""}
          </div>
        </div>
        <div class="properties-evidence">
          <span>Scores</span>
          <strong>${property.complianceScore}% compliance</strong>
          <div class="strength-meter score-compliance"><span style="width: ${property.complianceScore}%"></span></div>
          <small>${property.evidenceScore}% evidence</small>
          <div class="strength-meter"><span style="width: ${property.evidenceScore}%"></span></div>
        </div>
      </div>
      <div class="properties-card-status">
        <div>
          <span>Current focus</span>
          <strong>${escapeHtml(property.focus)}</strong>
        </div>
        <div>
          <span>State</span>
          <strong>${escapeHtml(property.state)}</strong>
          ${property.nextRenewal ? `<small>${escapeHtml(property.nextRenewal)}</small>` : ""}
        </div>
      </div>
      <div class="properties-card-actions">
        <button class="primary-button" type="button" data-properties-open-property-id="${escapeHtml(property.id)}">Open workspace</button>
        <button class="secondary-button" type="button" data-properties-upload-id="${escapeHtml(property.id)}">Upload evidence</button>
        <button class="text-button" type="button" data-properties-timeline-id="${escapeHtml(property.id)}">View timeline</button>
        <button class="text-button" type="button" data-properties-support-id="${escapeHtml(property.id)}">Request support</button>
      </div>
    </article>
  `;
}

function renderPropertiesCompactRow(property) {
  return `
    <article class="properties-compact-row" style="${propertyMapStyle(property)}" data-property-id="${escapeHtml(property.id)}">
      <div>
        <span>Property</span>
        <strong>${escapeHtml(property.address)}</strong>
        <small>${escapeHtml(property.location)}</small>
      </div>
      <div>
        <span>Status</span>
        <strong>${escapeHtml(property.state)}</strong>
        <small>${escapeHtml(property.occupancy)}</small>
      </div>
      <div>
        <span>Evidence</span>
        <strong>${property.evidenceScore}% evidence</strong>
        <div class="strength-meter"><span style="width: ${property.evidenceScore}%"></span></div>
      </div>
      <div>
        <span>Compliance</span>
        <strong>${property.complianceScore}% ready</strong>
        <div class="strength-meter score-compliance"><span style="width: ${property.complianceScore}%"></span></div>
      </div>
      <div>
        <span>Priority</span>
        <strong>${escapeHtml(property.focus)}</strong>
      </div>
      <div>
        <span>Next action</span>
        <button class="text-button" type="button" data-properties-open-property-id="${escapeHtml(property.id)}">Open workspace</button>
      </div>
    </article>
  `;
}

function renderPortfolioPropertiesState() {
  const page = document.querySelector("[data-portfolio-properties]");

  if (!page) {
    return;
  }

  const properties = getPortfolioProperties();
  const urgentProperty = portfolioUrgentProperty();
  const openRequests = labsState.serviceRequests.filter((request) => request.status !== "Cancelled").length;
  const results = properties.filter(propertyMatchesCurrentView);
  const cardView = labsState.propertiesView === "cards";

  if (!properties.length) {
    document.querySelector("[data-properties-count-badge]").textContent = "0 properties tracked";
    document.querySelector("[data-properties-count]").textContent = "0";
    document.querySelector("[data-properties-count-detail]").textContent = "properties tracked";
    document.querySelector("[data-properties-attention-count]").textContent = "0";
    document.querySelector("[data-properties-attention-detail]").textContent = "no property alerts";
    document.querySelector("[data-properties-summary-strength]").textContent = "-";
    document.querySelector("[data-properties-open-requests]").textContent = "0";
    document.querySelector(".properties-toolbar")?.setAttribute("hidden", "");
    document.querySelector("[data-properties-score-grid]")?.setAttribute("hidden", "");
    document.querySelector(".properties-grow-card")?.setAttribute("hidden", "");
    const resultsContainer = document.querySelector("[data-properties-results]");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <article class="empty-portfolio-card">
          <span class="tile-icon" data-icon="building"></span>
          <h2>No properties yet</h2>
          <p>Add your first property to create a compliance workspace. Properties will appear here with evidence scores, checks and current priorities after setup.</p>
          <div class="button-row">
            <button class="primary-button" type="button" data-properties-add>Add your first property</button>
            <button class="secondary-button" type="button" data-properties-empty-ask>Ask CMP what information to prepare</button>
          </div>
        </article>
      `;
    }
    document.querySelector("[data-properties-empty]").hidden = true;
    return;
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const tasks = newPropertyTaskItems();
    document.querySelector("[data-properties-count-badge]").textContent = "1 new property profile";
    document.querySelector("[data-properties-count]").textContent = "1";
    document.querySelector("[data-properties-count-detail]").textContent = "new profile";
    document.querySelector("[data-properties-attention-count]").textContent = String(tasks.length);
    document.querySelector("[data-properties-attention-detail]").textContent = tasks.length === 1 ? "setup task" : "setup tasks";
    document.querySelector("[data-properties-summary-strength]").textContent = `${summary.profileSetupScore}% setup`;
    document.querySelector("[data-properties-open-requests]").textContent = "0";
    document.querySelector(".properties-toolbar")?.setAttribute("hidden", "");
    document.querySelector("[data-properties-score-grid]")?.setAttribute("hidden", "");
    document.querySelector(".properties-grow-card")?.setAttribute("hidden", "");
    const resultsContainer = document.querySelector("[data-properties-results]");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        ${summary.findingsConfirmed ? `
          <article class="smart-property-success-banner">
            <span class="tile-icon" data-icon="check"></span>
            <div>
              <strong>You added your first property.</strong>
              <p>Open the workspace to see what this property needs next.</p>
            </div>
          </article>
        ` : ""}
        <article class="portfolio-property-card is-most-urgent smart-property-card">
          <div class="portfolio-property-main">
            <span class="status-dot" aria-hidden="true"></span>
            <div>
              <div class="property-card-heading-row">
                <h3>57 The Butts</h3>
                <span class="source-badge">New profile</span>
                <span class="source-badge">${summary.findingsConfirmed ? "Setup in progress" : "Smart search ready"}</span>
              </div>
              <p>Flat 42 · Coventry, CV1 3BJ</p>
              <div class="signal-row">
                <span>Address matched</span>
                <span>${summary.findingsConfirmed ? "Smart search saved" : "EPC prepared for review"}</span>
                <span>Top unresolved: ${escapeHtml(summary.primaryTaskTitle)}</span>
              </div>
            </div>
          </div>
          <div class="portfolio-property-progress">
            <span>Profile setup</span>
            <strong>${summary.profileSetupScore}% setup</strong>
            <div class="strength-meter score-compliance"><span style="width: ${summary.profileSetupScore}%"></span></div>
            <span>Evidence confidence</span>
            <strong>${summary.evidenceConfidenceScore}% evidence</strong>
            <div class="strength-meter"><span style="width: ${summary.evidenceConfidenceScore}%"></span></div>
            <small>${escapeHtml(summary.evidenceConfidenceHelp)}</small>
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-home-open-property-id="the-butts">Open workspace</button>
            <button class="secondary-button" type="button" data-smart-answer-remaining>Continue setup</button>
          </div>
        </article>
      `;
    }
    document.querySelector("[data-properties-empty]").hidden = true;
    return;
  }

  document.querySelector("[data-properties-attention-count]").textContent = String(isFivePropertyMode() ? portfolioUrgentActionCount() : isTwoPropertyMode() ? 2 : 1);
  document.querySelector(".properties-toolbar")?.removeAttribute("hidden");
  document.querySelector("[data-properties-score-grid]")?.removeAttribute("hidden");
  document.querySelector(".properties-grow-card")?.removeAttribute("hidden");
  document.querySelector("[data-properties-count-badge]").textContent = `${properties.length} ${properties.length === 1 ? "property" : "properties"} tracked`;
  document.querySelector("[data-properties-count]").textContent = String(properties.length);
  document.querySelector("[data-properties-count-detail]").textContent = properties.length === 1 ? "property tracked" : "properties tracked";
  document.querySelector("[data-properties-attention-detail]").textContent = urgentProperty.focusArea;
  document.querySelector("[data-properties-summary-strength]").textContent = `${portfolioEvidenceScore()}%`;
  document.querySelector("[data-properties-open-requests]").textContent = String(openRequests);

  const searchInput = document.querySelector("[data-properties-search]");
  if (searchInput && searchInput.value !== labsState.propertiesSearch) {
    searchInput.value = labsState.propertiesSearch;
  }

  document.querySelectorAll("[data-properties-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.propertiesFilter === labsState.propertiesFilter);
  });
  document.querySelectorAll("[data-properties-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.propertiesView === labsState.propertiesView);
  });

  const resultsContainer = document.querySelector("[data-properties-results]");
  if (resultsContainer) {
    resultsContainer.innerHTML = results.map((property) => cardView ? renderPropertiesCard(property) : renderPropertiesCompactRow(property)).join("");
  }
  document.querySelector("[data-properties-empty]").hidden = Boolean(results.length);
}

function showPortfolioProperties({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-properties]",
    view: "properties",
    navLabel: "Properties",
    bodyClass: "portfolio-properties-active",
    response: getPropertiesAssistantResponse("Which property needs attention?"),
    scroll
  });
}

function compliancePriorityRequestType() {
  return serviceRequestConfig(portfolioUrgentProperty().serviceType, portfolioUrgentProperty().id).requestType;
}

function currentComplianceRequest() {
  const property = portfolioUrgentProperty();
  const type = compliancePriorityRequestType();
  return labsState.serviceRequests.find((request) => request.type === type && requestPropertyId(request) === property.id && request.status !== "Cancelled");
}

function renderComplianceMatrixRows(properties) {
  return properties.map((property) => {
    if (isNewPropertyMode() && property.id === "the-butts") {
      const setup = newPropertySetup();
      const summary = newPropertyStatusSummary(setup);
      const gasUploaded = isNewPropertyEvidenceUploaded(setup, "gasSafety");
      const eicrUploaded = isNewPropertyEvidenceUploaded(setup, "eicr");
      return `
        <tr>
          <th scope="row">
            <strong>57 The Butts</strong>
            <span>Coventry, CV1 3BJ</span>
          </th>
          <td><span class="matrix-pill status-watch-text">${summary.findingsConfirmed ? "Accepted" : "Prepared"}</span><small>${summary.findingsConfirmed ? "Starting signal only" : "EPC ready for review"}</small></td>
          <td><span class="matrix-pill ${gasUploaded ? "status-good-text" : "status-neutral-text"}">${gasUploaded ? "Uploaded" : "Unknown"}</span><small>${gasUploaded ? "Gas Safety upload added" : "No Gas Safety uploaded"}</small></td>
          <td><span class="matrix-pill ${eicrUploaded ? "status-good-text" : "status-review-text"}">${eicrUploaded ? "Uploaded" : "No document"}</span><small>${eicrUploaded ? "EICR upload added" : "No EICR uploaded"}</small></td>
          <td><span class="matrix-pill status-watch-text">Needs answer</span><small>Smoke and CO status</small></td>
          <td><span class="matrix-pill status-watch-text">Needs answer</span><small>Occupancy unknown</small></td>
          <td><span class="matrix-pill status-watch-text">${summary.findingsConfirmed ? "Started" : "Ready"}</span><small>Postcode review</small></td>
          <td><span class="matrix-pill status-review-text">${summary.evidenceConfidenceLabel}</span><small>${summary.evidenceConfidenceScore}% evidence confidence</small></td>
        </tr>
      `;
    }

    if (!["the-butts", "willow-brook"].includes(property.id)) {
      const scoreStatus = property.complianceScore === 100 ? "Confirmed" : property.complianceScore < 60 ? "Needs checking" : "Review";
      const scoreClassName = property.complianceScore === 100 ? "status-good-text" : property.complianceScore < 60 ? "status-review-text" : "status-watch-text";
      return `
        <tr>
          <th scope="row">
            <strong>${escapeHtml(property.address)}</strong>
            <span>${escapeHtml(property.location)}</span>
          </th>
          <td><span class="matrix-pill status-good-text">Confirmed</span><small>Record present</small></td>
          <td><span class="matrix-pill ${scoreClassName}">${scoreStatus}</span><small>${escapeHtml(property.focusArea)}</small></td>
          <td><span class="matrix-pill ${property.evidenceScore >= 80 ? "status-good-text" : "status-review-text"}">${property.evidenceScore >= 80 ? "Verified" : "Missing"}</span><small>${property.evidenceScore}% evidence</small></td>
          <td><span class="matrix-pill ${scoreClassName}">${scoreStatus}</span><small>${property.complianceScore}% compliance</small></td>
          <td><span class="matrix-pill ${property.id === "station-road" ? "status-review-text" : "status-watch-text"}">${property.id === "station-road" ? "Missing" : "Review"}</span><small>${escapeHtml(property.occupancy)}</small></td>
          <td><span class="matrix-pill ${property.id === "canal-view" ? "status-review-text" : "status-good-text"}">${property.id === "canal-view" ? "Unresolved" : "Checked"}</span><small>Local authority watch</small></td>
          <td><span class="matrix-pill ${property.evidenceScore === 100 ? "status-good-text" : "status-review-text"}">${property.evidenceScore === 100 ? "Stored" : "Gap"}</span><small>${property.missingEvidence.length} missing</small></td>
        </tr>
      `;
    }

    if (property.id === "willow-brook") {
      return `
        <tr>
          <th scope="row">
            <strong>18 Willow Brook Drive</strong>
            <span>Birmingham, B37 7BA</span>
          </th>
          <td><span class="matrix-pill status-good-text">Confirmed</span><small>Official record</small></td>
          <td><span class="matrix-pill status-watch-text">Expiring soon</span><small>Renewal needed in 21 days</small></td>
          <td><span class="matrix-pill status-good-text">Verified</span><small>Uploaded document</small></td>
          <td><span class="matrix-pill status-review-text">Needs checking</span><small>Landlord answer missing</small></td>
          <td><span class="matrix-pill status-watch-text">Landlord confirmed</span><small>Evidence not uploaded</small></td>
          <td><span class="matrix-pill status-watch-text">Checking</span><small>Postcode review</small></td>
          <td><span class="matrix-pill status-review-text">Missing</span><small>No recent evidence</small></td>
        </tr>
      `;
    }

    return `
      <tr>
        <th scope="row">
          <strong>57 The Butts</strong>
          <span>Coventry, CV1 3BJ</span>
        </th>
        <td><span class="matrix-pill status-good-text">Confirmed</span><small>Official record</small></td>
        <td><span class="matrix-pill status-good-text">Verified</span><small>Uploaded document</small></td>
        <td><span class="matrix-pill ${labsState.eicrAdded ? "status-good-text" : "status-review-text"}">${labsState.eicrAdded ? "Verified" : "Needs checking"}</span><small>${labsState.eicrAdded ? "Uploaded document" : "No EICR evidence"}</small></td>
        <td><span class="matrix-pill status-watch-text">Landlord confirmed</span><small>Evidence not uploaded</small></td>
        <td><span class="matrix-pill status-neutral-text">Not applicable</span><small>Vacant</small></td>
        <td><span class="matrix-pill status-watch-text">Checking</span><small>Postcode review</small></td>
        <td><span class="matrix-pill status-review-text">Missing</span><small>No recent evidence</small></td>
      </tr>
    `;
  }).join("");
}

function journeyScoreCards() {
  const scores = journeyState().propertyBrain.Scores;
  return [
    { label: "Legal compliance", value: scores.legalComplianceScore, help: "Journey OS legal blocker score for the active Property Intelligence profile." },
    { label: "Evidence strength", value: scores.evidenceStrengthScore, help: "Strength of simulated uploaded and missing evidence." },
    { label: "Future readiness", value: scores.futureReadinessScore, help: "EPC, monitoring and future-risk readiness." }
  ];
}

function renderJourneyComplianceBridge() {
  const state = journeyState();
  const actions = allJourneyActions();
  const urgent = (state.actionPlan.urgentLegalBlockers || []).filter((item) => item.status !== "Deferred");
  const missing = state.actionPlan.missingEvidence || [];
  const condition = state.actionPlan.conditionRisks || [];
  const future = state.actionPlan.futureRisks || [];
  const nextAction = urgent[0] || missing[0] || actions[0];
  const address = state.propertyBrain.PropertyIdentity.address;
  const complianceHeader = document.querySelector(".portfolio-compliance-header");
  const complianceKicker = complianceHeader?.querySelector(".section-kicker");
  const complianceBody = complianceHeader?.querySelector("p:not(.section-kicker)");
  const matrixTitle = document.querySelector("#portfolioMatrixTitle");
  const matrixHeading = matrixTitle?.closest(".section-heading");
  const gapsTitle = document.querySelector("#complianceGapsTitle");
  const gapsHeading = gapsTitle?.closest(".section-heading");
  const forecastTitle = document.querySelector("#portfolioForecastTitle");
  const forecastHeading = forecastTitle?.closest(".section-heading");

  document.querySelector("[data-compliance-review-actions]")?.removeAttribute("hidden");
  document.querySelector("[data-compliance-score-grid]")?.removeAttribute("hidden");
  document.querySelector("[data-compliance-open-property]")?.removeAttribute("hidden");
  document.querySelector('[aria-labelledby="portfolioMatrixTitle"]')?.removeAttribute("hidden");
  document.querySelector("[data-compliance-gaps-section]")?.removeAttribute("hidden");
  document.querySelector('[aria-labelledby="portfolioForecastTitle"]')?.removeAttribute("hidden");
  document.querySelector(".compliance-readiness-card")?.removeAttribute("hidden");

  if (complianceKicker) complianceKicker.textContent = "PROPERTY BRAIN COMPLIANCE";
  if (complianceBody) complianceBody.textContent = "Compliance Centre is reading the same Journey OS Property Intelligence profile, action plan and service status.";
  document.querySelector("[data-compliance-count-badge]").textContent = "1 active Property Intelligence profile";
  document.querySelector("[data-compliance-property-count]").textContent = "1";
  document.querySelector("[data-compliance-property-count-detail]").textContent = "Property Intelligence profile";
  document.querySelector("[data-compliance-confirmed-count]").textContent = String(Math.max(1, Object.keys(state.answers || {}).length));
  document.querySelector("[data-compliance-review-count]").textContent = String(missing.length + condition.length + future.length);
  document.querySelector("[data-compliance-open-count]").textContent = String(urgent.length || actions.length);
  document.querySelector("[data-compliance-upcoming-count]").textContent = String(state.monitoringItems.length);
  document.querySelector("[data-compliance-open-action-detail]").textContent = journeyRoutes[state.routeId]?.label || "Prioritised";
  document.querySelector("[data-compliance-priority-title]").textContent = nextAction?.title || "Open Journey OS action plan";
  document.querySelector("[data-compliance-priority-body]").textContent = `${address} · ${nextAction?.body || "The Journey OS action plan is ready."}`;
  document.querySelector("[data-compliance-priority-upload]").textContent = "Open action plan";
  document.querySelector("[data-compliance-priority-upload]")?.setAttribute("data-journey-go", "actionPlan");
  document.querySelector("[data-compliance-priority-support]").textContent = "Open services";
  document.querySelector("[data-compliance-priority-support]")?.setAttribute("data-journey-workspace-tab-link", "services");
  renderScoreCards(document.querySelector("[data-compliance-score-grid]"), journeyScoreCards(), { compact: true });

  if (matrixHeading) {
    matrixHeading.querySelector(".section-kicker").textContent = "Active Property Intelligence profile";
    matrixTitle.textContent = "Compliance from Journey OS";
    matrixHeading.querySelector("p:not(.section-kicker)").textContent = "Generated from simulated records, landlord answers, evidence and service routes.";
  }
  const matrixBody = document.querySelector("[data-compliance-matrix-body]");
  if (matrixBody) {
    matrixBody.innerHTML = `
      <tr>
        <th scope="row">${escapeHtml(address)}</th>
        <td><span class="matrix-pill status-watch-text">EPC ${escapeHtml(state.propertyBrain.AutoCheckResults.epcRating)}</span><small>${escapeHtml(state.propertyBrain.AutoCheckResults.epcRecordStatus)}</small></td>
        <td><span class="matrix-pill ${state.propertyBrain.ComplianceEvidence.gasSafety.status === "found" ? "status-good-text" : "status-review-text"}">${escapeHtml(state.propertyBrain.ComplianceEvidence.gasSafety.status)}</span><small>Gas Safety</small></td>
        <td><span class="matrix-pill ${state.propertyBrain.ComplianceEvidence.eicr.status === "found" ? "status-good-text" : "status-review-text"}">${escapeHtml(state.propertyBrain.ComplianceEvidence.eicr.status)}</span><small>EICR</small></td>
        <td><span class="matrix-pill status-watch-text">${escapeHtml(state.propertyBrain.ComplianceEvidence.smokeCo.status)}</span><small>Smoke/CO</small></td>
        <td><span class="matrix-pill status-watch-text">${escapeHtml(state.propertyBrain.ComplianceEvidence.deposit.status)}</span><small>Deposit</small></td>
        <td><span class="matrix-pill status-watch-text">${escapeHtml(state.propertyBrain.ComplianceEvidence.licensing.status)}</span><small>Licensing</small></td>
        <td><span class="matrix-pill status-review-text">${condition.length} issue${condition.length === 1 ? "" : "s"}</span><small>Condition</small></td>
      </tr>
    `;
  }
  if (gapsHeading) {
    gapsHeading.querySelector(".section-kicker").textContent = "Journey OS gaps";
    gapsTitle.textContent = "What the Property Intelligence profile still needs";
    gapsHeading.querySelector("p:not(.section-kicker)").textContent = "Click an item to return to the action plan, evidence vault or services.";
  }
  const gapList = document.querySelector("[data-compliance-gap-list]");
  if (gapList) {
    gapList.innerHTML = [...urgent, ...missing, ...condition, ...future].slice(0, 8).map((action) => {
      const service = journeyServiceForAction(action.id);
      const status = serviceStatusFor(state, service.id);
      return `
        <article class="compliance-gap-card">
          <div>
            <h3>${escapeHtml(action.title)}</h3>
            <p>${escapeHtml(action.body)}</p>
            <span class="matrix-pill status-watch-text">${escapeHtml(service.title)} · ${escapeHtml(serviceLifecycleLabel(status))}</span>
          </div>
          <div class="compliance-gap-actions">
            <button class="primary-button" type="button" data-journey-go="actionPlan">Open plan</button>
            <button class="text-button" type="button" data-journey-action="book" data-action-id="${escapeHtml(action.id)}">${status === "recommended" ? "Book service" : "View service"}</button>
          </div>
        </article>
      `;
    }).join("");
  }
  if (forecastHeading) {
    forecastHeading.querySelector(".section-kicker").textContent = "Monitoring";
    forecastTitle.textContent = "Journey OS monitoring forecast";
    forecastHeading.querySelector("p:not(.section-kicker)").textContent = "Expiry, evidence and future-risk watch items from the active Property Intelligence profile.";
  }
  const forecastGrid = document.querySelector("[data-compliance-forecast-grid]");
  if (forecastGrid) {
    forecastGrid.innerHTML = state.monitoringItems.slice(0, 4).map((item) => `
      <article>
        <span>${escapeHtml(item.dueDate)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description)}</p>
      </article>
    `).join("");
  }
}

function renderPortfolioComplianceState() {
  const page = document.querySelector("[data-portfolio-compliance]");

  if (!page) {
    return;
  }

  const properties = getPortfolioProperties();
  const urgentProperty = portfolioUrgentProperty();
  const complianceHeader = document.querySelector(".portfolio-compliance-header");
  const complianceKicker = complianceHeader?.querySelector(".section-kicker");
  const complianceBody = complianceHeader?.querySelector("p:not(.section-kicker)");
  const complianceReviewActions = document.querySelector("[data-compliance-review-actions]");
  const complianceSummary = document.querySelector(".compliance-centre-summary");
  const matrixTitle = document.querySelector("#portfolioMatrixTitle");
  const matrixHeading = matrixTitle?.closest(".section-heading");
  const gapsTitle = document.querySelector("#complianceGapsTitle");
  const gapsHeading = gapsTitle?.closest(".section-heading");
  const forecastTitle = document.querySelector("#portfolioForecastTitle");
  const forecastHeading = forecastTitle?.closest(".section-heading");

  if (complianceKicker) {
    complianceKicker.textContent = properties.length ? "PORTFOLIO COMPLIANCE" : "Compliance Centre";
  }
  if (complianceBody) {
    complianceBody.textContent = "See what CMP knows, what proof is missing, and which landlord action is most useful next.";
  }
  if (complianceReviewActions) {
    complianceReviewActions.textContent = "Review open actions";
  }
  if (complianceSummary) {
    complianceSummary.hidden = false;
  }
  if (matrixHeading) {
    matrixHeading.querySelector(".section-kicker").textContent = "Portfolio matrix";
    matrixTitle.textContent = "Compliance by property";
    matrixHeading.querySelector("p:not(.section-kicker)").textContent = "Confirmed means CMP has a record. Verified means proof is stored. Needs checking means CMP still needs an answer, evidence, or both.";
  }
  if (gapsHeading) {
    gapsHeading.querySelector(".section-kicker").textContent = "EVIDENCE GAPS";
    gapsTitle.textContent = "What still needs attention";
    gapsHeading.querySelector("p:not(.section-kicker)").textContent = "These are the proof gaps and manual checks most likely to unblock your compliance picture.";
  }
  if (forecastHeading) {
    forecastHeading.querySelector(".section-kicker").textContent = "Next 90 days";
    forecastTitle.textContent = "Portfolio forecast";
    forecastHeading.querySelector("p:not(.section-kicker)").textContent = "Short-range watch items based on the information currently in CMP Labs.";
  }

  if (!properties.length) {
    document.querySelector("[data-compliance-review-actions]")?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-score-grid]")?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-count-badge]").textContent = "0 properties monitored";
    document.querySelector("[data-compliance-property-count]").textContent = "0";
    document.querySelector("[data-compliance-property-count-detail]").textContent = "properties tracked";
    document.querySelector("[data-compliance-confirmed-count]").textContent = "0";
    document.querySelector("[data-compliance-review-count]").textContent = "0";
    document.querySelector("[data-compliance-open-count]").textContent = "0";
    document.querySelector("[data-compliance-upcoming-count]").textContent = "0";
    document.querySelector("[data-compliance-open-action-detail]").textContent = "setup";
    document.querySelector("[data-compliance-priority-title]").textContent = "Add your first property to start compliance checks";
    document.querySelector("[data-compliance-priority-body]").textContent = "Once you add a property, Compliance Centre will show what CMP knows, what evidence is missing, and which checks need attention.";
    document.querySelector("[data-compliance-priority-upload]").textContent = "Add your first property";
    document.querySelector("[data-compliance-priority-support]").textContent = "Preview A-Z Checker";
    document.querySelector("[data-compliance-open-property]")?.setAttribute("hidden", "");
    document.querySelector('[aria-labelledby="portfolioMatrixTitle"]')?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-gaps-section]")?.setAttribute("hidden", "");
    document.querySelector('[aria-labelledby="portfolioForecastTitle"]')?.setAttribute("hidden", "");
    document.querySelector(".compliance-readiness-card")?.setAttribute("hidden", "");
    const matrixBody = document.querySelector("[data-compliance-matrix-body]");
    if (matrixBody) {
      matrixBody.innerHTML = `
        <tr>
          <td colspan="8">
            <article class="empty-inline-state">
              <strong>No properties to check</strong>
              <span>Use Add property or preview the A-Z setup questions.</span>
            </article>
          </td>
        </tr>
      `;
    }
    const forecastGrid = document.querySelector("[data-compliance-forecast-grid]");
    if (forecastGrid) {
      forecastGrid.innerHTML = `
        <article>
          <span>Setup</span>
          <strong>No forecast yet</strong>
          <p>Add a property before CMP can show 90-day compliance watch items.</p>
        </article>
      `;
    }
    renderComplianceGaps();
    renderAzChecker();
    return;
  }

  if (hasJourneyPropertyBrainActivity()) {
    renderJourneyComplianceBridge();
    renderAzChecker();
    return;
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const tasks = newPropertyTaskItems();
    if (complianceKicker) {
      complianceKicker.textContent = "Compliance Centre";
    }
    if (complianceBody) {
      complianceBody.textContent = summary.statusLine;
    }
    if (complianceReviewActions) {
      complianceReviewActions.removeAttribute("hidden");
      complianceReviewActions.textContent = "Review CMP findings";
    }
    if (complianceSummary) {
      complianceSummary.hidden = true;
    }
    document.querySelector("[data-compliance-score-grid]")?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-open-property]")?.setAttribute("hidden", "");
    document.querySelector('[aria-labelledby="portfolioMatrixTitle"]')?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-gaps-section]")?.setAttribute("hidden", "");
    document.querySelector('[aria-labelledby="portfolioForecastTitle"]')?.setAttribute("hidden", "");
    document.querySelector(".compliance-readiness-card")?.setAttribute("hidden", "");
    document.querySelector("[data-compliance-count-badge]").textContent = "1 new property profile";
    document.querySelector("[data-compliance-property-count]").textContent = "1";
    document.querySelector("[data-compliance-property-count-detail]").textContent = "new profile";
    document.querySelector("[data-compliance-confirmed-count]").textContent = String(summary.findingsConfirmed ? 4 : 1);
    document.querySelector("[data-compliance-review-count]").textContent = String(summary.needsAnswer.length + summary.missingEvidence.length);
    document.querySelector("[data-compliance-open-count]").textContent = String(tasks.length);
    document.querySelector("[data-compliance-upcoming-count]").textContent = "0";
    document.querySelector("[data-compliance-open-action-detail]").textContent = "setup";
    document.querySelector("[data-compliance-priority-title]").textContent = "Continue setup for 57 The Butts";
    document.querySelector("[data-compliance-priority-body]").textContent = summary.statusLine;
    document.querySelector("[data-compliance-priority-upload]").textContent = "Review CMP findings";
    document.querySelector("[data-compliance-priority-support]").textContent = "Upload certificates";
    const requestIndicator = document.querySelector("[data-compliance-request-indicator]");
    if (requestIndicator) {
      requestIndicator.hidden = true;
    }
    const matrixBody = document.querySelector("[data-compliance-matrix-body]");
    if (matrixBody) {
      matrixBody.innerHTML = renderComplianceMatrixRows(properties);
    }
    if (matrixHeading) {
      matrixHeading.querySelector(".section-kicker").textContent = "Property compliance snapshot";
      matrixTitle.textContent = "Checks for 57 The Butts";
      matrixHeading.querySelector("p:not(.section-kicker)").textContent = "Prepared means CMP found a starting signal. Needs confirmation means landlord input or documents are still required.";
    }
    if (gapsHeading) {
      gapsHeading.querySelector(".section-kicker").textContent = "Setup gaps";
      gapsTitle.textContent = "What CMP still needs";
      gapsHeading.querySelector("p:not(.section-kicker)").textContent = "These confirmations unblock reliable scoring and later service recommendations.";
    }
    const forecastGrid = document.querySelector("[data-compliance-forecast-grid]");
    if (forecastGrid) {
      forecastGrid.innerHTML = `
        <article>
          <span>Now</span>
          <strong>Confirm property details</strong>
          <p>Property type, bedrooms and occupancy decide the right compliance path.</p>
        </article>
        <article>
          <span>Next</span>
          <strong>Upload certificates</strong>
          <p>Add Gas Safety or EICR if you already have them.</p>
        </article>
        <article>
          <span>Checking</span>
          <strong>Local licensing</strong>
          <p>Postcode review can continue once setup details are confirmed.</p>
        </article>
      `;
    }
    if (forecastHeading) {
      forecastHeading.querySelector(".section-kicker").textContent = "Upcoming checks";
      forecastTitle.textContent = "Upcoming checks";
      forecastHeading.querySelector("p:not(.section-kicker)").textContent = "Light watch items based on the early setup context. Nothing is treated as fully assessed yet.";
    }
    renderAzChecker();
    return;
  }

  const activeRequest = currentComplianceRequest();

  document.querySelector("[data-compliance-review-actions]")?.removeAttribute("hidden");
  document.querySelector("[data-compliance-score-grid]")?.removeAttribute("hidden");
  document.querySelector("[data-compliance-open-property]")?.removeAttribute("hidden");
  document.querySelector('[aria-labelledby="portfolioMatrixTitle"]')?.removeAttribute("hidden");
  document.querySelector("[data-compliance-gaps-section]")?.removeAttribute("hidden");
  document.querySelector('[aria-labelledby="portfolioForecastTitle"]')?.removeAttribute("hidden");
  document.querySelector(".compliance-readiness-card")?.removeAttribute("hidden");
  document.querySelector("[data-compliance-count-badge]").textContent = `${properties.length} ${properties.length === 1 ? "property" : "properties"} monitored`;
  document.querySelector("[data-compliance-property-count]").textContent = String(properties.length);
  document.querySelector("[data-compliance-property-count-detail]").textContent = properties.length === 1 ? "property tracked" : "properties tracked";
  document.querySelector("[data-compliance-confirmed-count]").textContent = isFivePropertyMode() ? "19" : isTwoPropertyMode() ? (labsState.eicrAdded ? "7" : "6") : labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-compliance-review-count]").textContent = isFivePropertyMode() ? String(portfolioEvidenceGapCount()) : isTwoPropertyMode() ? (labsState.eicrAdded ? "6" : "7") : labsState.eicrAdded ? "2" : "3";
  document.querySelector("[data-compliance-open-count]").textContent = String(isFivePropertyMode() ? portfolioUrgentActionCount() : isTwoPropertyMode() ? 2 : 1);
  document.querySelector("[data-compliance-upcoming-count]").textContent = String(isFivePropertyMode() ? 5 : isTwoPropertyMode() ? 3 : 2);
  document.querySelector("[data-compliance-open-action-detail]").textContent = urgentProperty.focusArea;
  document.querySelector("[data-compliance-priority-title]").textContent = `${urgentProperty.address} needs ${urgentProperty.focus.toLowerCase()}`;
  document.querySelector("[data-compliance-priority-body]").textContent = urgentProperty.priorityBody;
  document.querySelector("[data-compliance-priority-upload]").textContent = urgentProperty.id === "willow-brook"
    ? "Upload Gas Safety certificate"
    : labsState.eicrAdded ? "Upload inspection evidence" : "Upload EICR";
  document.querySelector("[data-compliance-priority-support]").textContent = urgentProperty.id === "willow-brook"
    ? "Request Gas Safety support"
    : labsState.eicrAdded ? "Request inspection support" : "Request EICR support";

  const requestIndicator = document.querySelector("[data-compliance-request-indicator]");
  if (requestIndicator) {
    requestIndicator.hidden = !activeRequest;
    requestIndicator.textContent = activeRequest ? `${activeRequest.type} open` : "Support request open";
  }

  const eicrStatus = document.querySelector("[data-compliance-matrix-eicr-status]");
  const eicrSource = document.querySelector("[data-compliance-matrix-eicr-source]");
  if (eicrStatus) {
    eicrStatus.textContent = labsState.eicrAdded ? "Verified" : "Needs checking";
    eicrStatus.classList.toggle("status-good-text", labsState.eicrAdded);
    eicrStatus.classList.toggle("status-review-text", !labsState.eicrAdded);
  }
  if (eicrSource) {
    eicrSource.textContent = labsState.eicrAdded ? "Uploaded document" : "No EICR evidence";
  }

  const matrixBody = document.querySelector("[data-compliance-matrix-body]");
  if (matrixBody) {
    matrixBody.innerHTML = renderComplianceMatrixRows(properties);
  }

  const forecastGrid = document.querySelector("[data-compliance-forecast-grid]");
  if (forecastGrid) {
    const forecastItems = [
      ...(isTwoPropertyMode()
        ? [{
            time: "In 21 days",
            title: "Gas Safety renewal",
            body: "18 Willow Brook Drive · Upload or arrange renewal evidence"
          }]
        : []),
      {
        time: labsState.eicrAdded ? "In 34 days" : "This week",
        title: labsState.eicrAdded ? "Inspection review recommended" : "Electrical Safety evidence",
        body: labsState.eicrAdded ? "57 The Butts · Confirm inspection status" : "57 The Butts · Upload or arrange an EICR"
      },
      {
        time: "Local watch",
        title: "Licensing review in progress",
        body: isTwoPropertyMode() ? "Both properties · Postcode reviews" : "57 The Butts · Postcode review"
      },
      {
        time: "Evidence watch",
        title: isTwoPropertyMode() ? "Alarm and inspection evidence" : "Alarm evidence",
        body: isTwoPropertyMode() ? "18 Willow Brook Drive · Add supporting records" : "57 The Butts · Add supporting record"
      }
    ];

    forecastGrid.innerHTML = forecastItems.map((item) => `
      <article>
        <span>${escapeHtml(item.time)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `).join("");
  }

  renderComplianceGaps();
  renderAzChecker();
}

function renderComplianceGaps() {
  const list = document.querySelector("[data-compliance-gap-list]");

  if (!list) {
    return;
  }

  if (isEmptyPortfolioMode()) {
    list.innerHTML = `
      <article class="compliance-gap-card">
        <div>
          <h3>No compliance gaps yet</h3>
          <p>Add a property to generate required actions, evidence gaps and service recommendations.</p>
        </div>
        <div class="compliance-gap-actions">
          <button class="primary-button" type="button" data-properties-add>Add property</button>
        </div>
      </article>
    `;
    return;
  }

  if (isNewPropertyMode()) {
    const setupItems = [
      ["Confirm property type and bedrooms", "57 The Butts · Property profile", "azSingle:the-butts", true],
      ["Confirm occupancy / tenancy status", "57 The Butts · Scenario setup", "azSingle:the-butts", false],
      ["Upload Gas Safety evidence if relevant", "No Gas Safety certificate uploaded yet", "uploadGas", false],
      ["Add or arrange Electrical Safety / EICR", "No EICR uploaded yet", "uploadEicr", false],
      ["Confirm smoke and CO alarm status", "Landlord answer needed", "askLicensing", false],
      ["Continue local licensing check", "Postcode review started", "reviewLicensing", false]
    ];

    list.innerHTML = setupItems.map(([title, detail, action, primary]) => `
      <article class="compliance-gap-card">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(detail)}</p>
        </div>
        <div class="compliance-gap-actions">
          <button class="${primary ? "primary-button" : "text-button"}" type="button" data-compliance-action="${escapeHtml(action)}">
            ${primary ? "Continue guided check" : "Review"}
          </button>
        </div>
      </article>
    `).join("");
    return;
  }

  if (isFivePropertyMode()) {
    const gaps = getPortfolioProperties()
      .filter((property) => property.complianceScore < 100 || property.evidenceScore < 100)
      .slice()
      .sort((a, b) => (a.complianceScore + a.evidenceScore) - (b.complianceScore + b.evidenceScore))
      .map((property) => ({
        title: `${property.address}: ${property.focus}`,
        detail: `${property.location} · ${property.state} · ${property.missingEvidence.length} evidence gaps`,
        actions: [
          { label: "Run A-Z check", action: `azSingle:${property.id}`, primary: property.complianceScore < 60 },
          { label: property.recommendedService || "Review support", action: `service:${property.id}` }
        ]
      }));

    list.innerHTML = gaps.map((gap) => `
      <article class="compliance-gap-card">
        <div>
          <h3>${escapeHtml(gap.title)}</h3>
          <p>${escapeHtml(gap.detail)}</p>
        </div>
        <div class="compliance-gap-actions">
          ${gap.actions.map((action) => `
            <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-compliance-action="${escapeHtml(action.action)}">
              ${escapeHtml(action.label)}
            </button>
          `).join("")}
        </div>
      </article>
    `).join("");
    return;
  }

  const gaps = [
    ...(isTwoPropertyMode()
      ? [{
          title: "Gas Safety renewal approaching",
          detail: "18 Willow Brook Drive · Renewal needed in 21 days",
          actions: [
            { label: "Upload certificate", action: "uploadGas", primary: true },
            { label: "Request support", action: "requestGasSupport" }
          ]
        }]
      : []),
    ...(!labsState.eicrAdded
      ? [{
          title: "EICR missing",
          detail: "57 The Butts · Electrical Safety",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Request support", action: "requestSupport" }
          ]
        }]
      : []),
    {
      title: "Inspection evidence missing",
      detail: "57 The Butts · Property inspection",
      actions: [
        { label: "Upload inspection evidence", action: "uploadInspection", primary: !labsState.eicrAdded },
        { label: "Mark as not completed", action: "markInspection" }
      ]
    },
    {
      title: "Licensing still checking",
      detail: "57 The Butts · Local licensing",
      actions: [
        { label: "Review licensing", action: "reviewLicensing" },
        { label: "Ask CMP", action: "askLicensing" }
      ]
    }
  ];

  list.innerHTML = gaps.map((gap) => `
    <article class="compliance-gap-card">
      <div>
        <h3>${escapeHtml(gap.title)}</h3>
        <p>${escapeHtml(gap.detail)}</p>
      </div>
      <div class="compliance-gap-actions">
        ${gap.actions.map((action) => `
          <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-compliance-action="${action.action}">
            ${escapeHtml(action.label)}
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
}

const azScenarioLabels = {
  general: "General compliance check",
  ready: "Ready to let",
  tenanted: "Currently tenanted",
  purchase: "New purchase review",
  hmo: "HMO / licensing review",
  possession: "Possession readiness",
  evidence_pack: "Compliance evidence pack"
};

const azScenarioDetails = {
  general: {
    summary: "A broad health check across the core compliance areas.",
    prioritises: "EPC, Gas Safety, EICR, alarms, tenancy documents, licensing and inspections.",
    questions: "Starts with property facts, then checks each essential area in a steady order.",
    evidence: "Highlights missing proof separately from answers you can give from memory.",
    action: "Use this when you want CMP to find the obvious gaps before choosing a service."
  },
  ready: {
    summary: "A pre-let check focused on what should be ready before a tenant moves in.",
    prioritises: "Certificates, alarm checks, tenant-facing documents and expiry dates.",
    questions: "Pulls certificate and tenant-service questions forward.",
    evidence: "Treats gas, EICR, EPC, alarms and tenant documents as higher-priority proof.",
    action: "Expect next steps around upload, renewal, or arranging a certificate before let."
  },
  tenanted: {
    summary: "A live tenancy check focused on what has been served and what is due next.",
    prioritises: "Renewals, tenant-facing evidence, deposits, inspections and repair history.",
    questions: "Emphasises served documents, renewal dates and recent property activity.",
    evidence: "Looks for proof that certificates and documents were stored or served.",
    action: "Use this when a tenant is already in place and you need an operational view."
  },
  purchase: {
    summary: "An onboarding review for a property you have just bought or are assessing.",
    prioritises: "Seller certificates, initial setup, licensing checks and missing baseline facts.",
    questions: "Keeps property basics and setup questions prominent.",
    evidence: "Flags where seller or agent documents still need to be uploaded.",
    action: "Expect a setup list rather than a renewal list."
  },
  hmo: {
    summary: "A licensing-led review for shared, HMO or local-authority uncertainty.",
    prioritises: "Occupancy, local licensing, HMO/selective licensing, fire and amenity evidence.",
    questions: "Moves licensing and occupancy answers higher in the flow.",
    evidence: "Looks for licence proof, local authority notes and supporting safety evidence.",
    action: "Use this when the property may need extra local or HMO checks."
  },
  possession: {
    summary: "An evidence-organisation view before any possession pathway is considered.",
    prioritises: "Tenancy documents, notices, communications, repairs and inspection history.",
    questions: "Adds more emphasis to evidence pack, communications and condition records.",
    evidence: "Separates missing proof from legal decisions; CMP is not giving legal advice.",
    action: "Use this to organise records before asking for professional support."
  },
  evidence_pack: {
    summary: "A document-first view for building a clean, export-ready evidence pack.",
    prioritises: "Stored certificates, uploaded documents, timeline entries and unresolved gaps.",
    questions: "Keeps document status and proof gaps visible throughout the flow.",
    evidence: "Treats upload status as the main signal and keeps unanswered landlord inputs open.",
    action: "Use this when you want to tidy the file rather than answer every question now."
  }
};

const azSections = [
  {
    id: "property-basics",
    title: "Property basics",
    icon: "home",
    completion: 36,
    description: "Start with the core property facts. CMP uses these to decide which checks apply."
  },
  {
    id: "epc",
    title: "EPC",
    icon: "energy",
    completion: 36,
    description: "CMP checks the EPC rating, expiry date and whether the certificate is stored."
  },
  {
    id: "gas-safety",
    title: "Gas Safety",
    icon: "flame",
    completion: 98,
    description: "Tell CMP whether gas applies, when the certificate was issued and whether evidence is stored."
  },
  {
    id: "electrical-safety",
    title: "Electrical Safety",
    icon: "bolt",
    completion: 36,
    description: "Track the current EICR, its result and any missing tenant evidence."
  },
  {
    id: "alarms",
    title: "Alarms",
    icon: "bell",
    completion: 98,
    description: "Confirm the alarm checks that apply. Unknown answers stay neutral until confirmed."
  },
  {
    id: "tenancy-deposit",
    title: "Tenancy & deposit",
    icon: "file",
    completion: 36,
    description: "Check tenancy agreements, deposit protection, prescribed information and served documents."
  },
  {
    id: "licensing",
    title: "Licensing",
    icon: "badge",
    completion: 98,
    description: "Capture local licensing, HMO/selective licensing watch items, expiry dates and evidence."
  },
  {
    id: "inspections-maintenance",
    title: "Inspections and maintenance",
    icon: "tools",
    completion: 36,
    description: "Organise inspection dates, repairs, maintenance notes and condition evidence."
  },
  {
    id: "evidence-pack",
    title: "Evidence pack",
    icon: "vault",
    completion: 98,
    description: "Upload documents once. CMP turns them into property evidence and highlights gaps."
  },
  {
    id: "possession-prep",
    title: "Possession preparation evidence",
    icon: "shield",
    completion: 98,
    description: "Prepare notice evidence, tenant communications and repair history for a possession-readiness pack."
  },
  {
    id: "mould-damp",
    title: "Mould and damp",
    icon: "droplet",
    completion: 36,
    description: "Check damp or mould reports, repair records, communications and photos."
  },
  {
    id: "summary",
    title: "Summary",
    icon: "check",
    completion: 98,
    description: "Review what is complete, what is missing and what CMP recommends next."
  }
];

const newPropertyAzSections = [
  {
    id: "property-basics",
    title: "Review found property details",
    icon: "home",
    completion: 20,
    description: "First, confirm the address, EPC signal and basic details CMP prepared from the setup flow."
  },
  {
    id: "epc",
    title: "Confirm occupancy / tenancy status",
    icon: "file",
    completion: 0,
    description: "Tell CMP whether the property is vacant, ready to let, currently tenanted or under new-purchase review."
  },
  {
    id: "gas-safety",
    title: "Confirm Gas Safety relevance",
    icon: "flame",
    completion: 0,
    description: "Confirm whether gas applies and whether any Gas Safety certificate is already available."
  },
  {
    id: "electrical-safety",
    title: "Confirm Electrical Safety / EICR",
    icon: "bolt",
    completion: 0,
    description: "Confirm whether an EICR exists, whether it can be uploaded, and whether review dates are known."
  },
  {
    id: "alarms",
    title: "Confirm alarms",
    icon: "bell",
    completion: 0,
    description: "Answer the smoke and CO alarm questions before CMP treats alarm status as confirmed."
  },
  {
    id: "tenancy-deposit",
    title: "Tenancy / deposit documents",
    icon: "file",
    completion: 0,
    description: "Only confirm tenancy, deposit and prescribed information documents if the occupancy route needs them."
  },
  {
    id: "licensing",
    title: "Licensing / local checks",
    icon: "badge",
    completion: 10,
    description: "Use the postcode context to continue local licensing checks once the property details are confirmed."
  },
  {
    id: "inspections-maintenance",
    title: "Inspection / maintenance evidence",
    icon: "tools",
    completion: 0,
    description: "Add any inspection, repair or maintenance evidence once the setup facts are stable."
  }
];

function activeAzSections() {
  return isNewPropertyMode() ? newPropertyAzSections : azSections;
}

function azSelectedProperty() {
  const properties = getPortfolioProperties();
  return properties.find((property) => property.id === labsState.azPropertyId) || properties[0] || buttsPortfolioProperty();
}

function azStatusForProperty(property) {
  if (!getPortfolioProperties().length) {
    return "Setup needed";
  }
  if (isNewPropertyMode()) {
    return "Needs confirmation before scoring";
  }
  const compliance = effectiveComplianceScore(property);
  const evidence = effectiveEvidenceScore(property);
  if (compliance === 100 && evidence === 100) {
    return "Ready";
  }
  if (compliance < 55 || evidence < 45) {
    return "Blocked";
  }
  return "Needs review";
}

function scenarioPriorityList(scenario, property) {
  const defaults = {
    ready: ["EICR, Gas Safety and EPC", "Alarm-test evidence", "Tenant-facing documents"],
    tenanted: ["Renewal dates", "Tenant-facing evidence", "Inspection and repair history"],
    purchase: ["Seller certificates", "Initial inspection", "Licensing and permissions"],
    hmo: ["Occupancy answers", "HMO/selective licensing", "Fire and amenity evidence"],
    possession: ["Evidence pack", "Tenancy documents", "Repair and communication history"],
    evidence_pack: ["Export-ready certificates", "Activity timeline", "Landlord answers"],
    general: ["Six essential checks", "Missing evidence", "Recommended services"]
  };

  return property.missingEvidence?.length
    ? [...new Set([...property.missingEvidence.slice(0, 3), ...(defaults[scenario] || defaults.general).slice(0, 2)])]
    : defaults[scenario] || defaults.general;
}

function activeAzSection() {
  const sections = activeAzSections();
  return sections.find((section) => section.id === labsState.activeCheckerSection) || sections[0];
}

function activeAzSectionIndex() {
  return Math.max(0, activeAzSections().findIndex((section) => section.id === activeAzSection().id));
}

function scenarioTargetSection(scenario) {
  const targets = {
    ready: "gas-safety",
    tenanted: "tenancy-deposit",
    purchase: "property-basics",
    hmo: "licensing",
    possession: "possession-prep",
    evidence_pack: "evidence-pack",
    general: "property-basics"
  };
  return targets[scenario] || "property-basics";
}

function scenarioPriorityCopy(property) {
  const copies = {
    ready: `CMP is prioritising certificates, alarms and tenant-facing documents before ${property.address} is marked ready to let.`,
    tenanted: `CMP is checking tenant-serving evidence, renewal dates and inspection records for ${property.address}.`,
    purchase: `CMP is treating ${property.address} as an onboarding review, so seller evidence and initial setup questions stay prominent.`,
    hmo: `CMP is focusing on licensing/HMO answers and local-authority uncertainty for ${property.address}.`,
    possession: `CMP is organising notices, communications and repair evidence before any possession pathway is progressed.`,
    evidence_pack: `CMP is building an evidence pack view so gaps can be uploaded or confirmed without repeating questions.`,
    general: `CMP is checking the six essential compliance areas and separating missing answers from missing evidence.`
  };
  return copies[labsState.azScenario] || copies.general;
}

function activeScenarioDetail() {
  return azScenarioDetails[labsState.azScenario] || azScenarioDetails.general;
}

function renderScenarioClarityPanel(mode = "single") {
  const detail = activeScenarioDetail();
  const modeCopy = mode === "portfolio"
    ? "This changes the order CMP highlights portfolio questions, the evidence it treats as urgent, and the wording of recommended actions."
    : "This changes the current priority, the questions CMP brings forward, and the next actions shown in the output panel.";

  return `
    <aside class="az-scenario-guide" aria-label="What changes in this scenario">
      <div>
        <p class="section-kicker">Selected scenario</p>
        <h4>${escapeHtml(azScenarioLabels[labsState.azScenario])}</h4>
        <p>${escapeHtml(detail.summary)}</p>
      </div>
      <dl>
        <div><dt>CMP prioritises</dt><dd>${escapeHtml(detail.prioritises)}</dd></div>
        <div><dt>Questions change</dt><dd>${escapeHtml(detail.questions)}</dd></div>
        <div><dt>Evidence focus</dt><dd>${escapeHtml(detail.evidence)}</dd></div>
      </dl>
      <small>${escapeHtml(modeCopy)}</small>
    </aside>
  `;
}

function renderAnswerEvidenceGuide() {
  if (isNewPropertyMode()) {
    return `
      <div class="az-evidence-legend" aria-label="Confirmation meaning">
        <div>
          <strong>Found automatically</strong>
          <span>CMP has prepared a starting signal for you to review.</span>
        </div>
        <div>
          <strong>Needs confirmation</strong>
          <span>CMP needs your answer before scoring or recommending services.</span>
        </div>
        <div>
          <strong>No document uploaded</strong>
          <span>Upload evidence only if you already hold the document.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="az-evidence-legend" aria-label="Answer and evidence meaning">
      <div>
        <strong>Missing answer</strong>
        <span>CMP needs you to choose or confirm something.</span>
      </div>
      <div>
        <strong>Missing evidence</strong>
        <span>CMP needs a document, photo or record stored in the Evidence Vault.</span>
      </div>
      <div>
        <strong>Landlord confirmed</strong>
        <span>You have answered it, but proof may still be useful.</span>
      </div>
    </div>
  `;
}

function checkerScopeKey() {
  return labsState.azMode === "portfolio" ? "portfolio" : azSelectedProperty().id;
}

function checkerAnswerKey(sectionId, cardId, scope = checkerScopeKey()) {
  return `${scope}:${sectionId}:${cardId}`;
}

function checkerAnswer(sectionId, cardId, fallback) {
  return labsState.checkerAnswers[checkerAnswerKey(sectionId, cardId)] || fallback;
}

function setCheckerAnswer(sectionId, cardId, value, scope = checkerScopeKey()) {
  labsState.checkerAnswers[checkerAnswerKey(sectionId, cardId, scope)] = value;
}

function azCardById(sectionId, cardId) {
  return azCardsForSection(sectionId, azSelectedProperty()).find((card) => card.id === cardId);
}

function parseLeadingNumber(value, fallback = 0) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function formatAzRangeValue(card, value) {
  const numberValue = Number(value);
  if (card.id === "bedrooms") {
    if (numberValue === 0) {
      return "Not set yet";
    }
    return `${numberValue} ${numberValue === 1 ? "bedroom" : "bedrooms"}`;
  }
  if (card.id === "storeys") {
    return `${numberValue} ${numberValue === 1 ? "floor" : "floors"}`;
  }
  return `${numberValue}${card.suffix || ""}`;
}

function azRangeInitialValue(card, currentValue) {
  const fallback = card.id === "storeys" ? 1 : 0;
  return Math.min(card.max || 10, Math.max(card.min || 0, parseLeadingNumber(currentValue, fallback)));
}

function azInputSafeDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : "";
}

function azSelectInitialValue(card, currentValue) {
  return (card.options || []).includes(currentValue) ? currentValue : card.value;
}

function scoreDeltaForCard(card) {
  const evidenceHeavy = card.control === "upload" || /evidence|upload|certificate|document|proof/i.test(`${card.eyebrow} ${card.label}`);
  if (evidenceHeavy) {
    return { compliance: 1, evidence: 4 };
  }
  if (card.control === "range" || card.control === "select" || card.sectionId === "property-basics") {
    return { compliance: 3, evidence: 1 };
  }
  return { compliance: 2, evidence: 1 };
}

function recordCheckerAnswer(sectionId, cardId, value) {
  const card = azCardById(sectionId, cardId) || { control: "choice", sectionId, id: cardId };
  const scope = checkerScopeKey();
  const previousValue = checkerAnswer(sectionId, cardId, card.value);
  setCheckerAnswer(sectionId, cardId, value, scope);

  if (sectionId === "property-basics" && cardId === "journey") {
    const scenarioEntry = Object.entries(azScenarioLabels).find(([, label]) => label === value);
    if (scenarioEntry) {
      labsState.azScenario = scenarioEntry[0];
    }
  }

  if (value !== previousValue) {
    const delta = scoreDeltaForCard(card);
    const current = checkerScoreBoost(scope);
    labsState.checkerScoreBoosts[scope] = {
      compliance: Math.min(100, current.compliance + delta.compliance),
      evidence: Math.min(100, current.evidence + delta.evidence)
    };
    labsState.scorePulse = { scope, compliance: delta.compliance, evidence: delta.evidence };
  }

  labsState.editingCheckerCard = "";
}

function syncScenarioJourneyAnswer() {
  const property = azSelectedProperty();
  if (!property) {
    return;
  }
  setCheckerAnswer("property-basics", "journey", azScenarioLabels[labsState.azScenario], property.id);
}

function clearCheckerPulseSoon() {
  window.setTimeout(() => {
    labsState.scorePulse = null;
    renderGlobalScoreSurfaces();
    renderAzChecker();
  }, 1800);
}

function propertyCheckerFacts(property) {
  const facts = {
    "the-butts": {
      type: "Terraced house",
      bedrooms: "2 bedrooms",
      storeys: "2 floors",
      tenanted: "Yes",
      epcRating: "C",
      epcExpiry: "10 Feb 2034",
      epcRef: "EPC-57TB-CV1",
      gasAppliances: "No",
      gasIssue: "Not applicable",
      gasGiven: "N/A",
      eicrIssue: "Setup needed",
      eicrResult: "Missing",
      eicrGiven: "Unknown",
      alarmSmoke: "Yes",
      alarmFuel: "Not sure",
      coAlarm: "Not sure",
      alarmTest: "Setup needed",
      tenancyAgreement: "Present",
      depositProtected: "Confirmed",
      prescribedInfo: "Confirmed",
      tenantDocs: "Part confirmed",
      licensingChecked: "Checking",
      licenceExpiry: "Unknown",
      inspectionDate: "Setup needed",
      possessionActive: labsState.azScenario === "possession" ? "Yes" : "No",
      dampReport: "Not answered yet"
    },
    "willow-brook": {
      type: "Semi-detached house",
      bedrooms: "3 bedrooms",
      storeys: "2 floors",
      tenanted: "Yes",
      epcRating: "B",
      epcExpiry: "18 Nov 2031",
      epcRef: "EPC-WBD-B37",
      gasAppliances: "Yes",
      gasIssue: "Renewal due soon",
      gasGiven: "Yes",
      eicrIssue: "12 Mar 2022",
      eicrResult: "Satisfactory",
      eicrGiven: "Yes",
      alarmSmoke: "Yes",
      alarmFuel: "Yes",
      coAlarm: "Yes",
      alarmTest: "Confirmed",
      tenancyAgreement: "Present",
      depositProtected: "Confirmed",
      prescribedInfo: "Confirmed",
      tenantDocs: "Confirmed",
      licensingChecked: "No local issue found",
      licenceExpiry: "N/A",
      inspectionDate: "16 Apr 2026",
      possessionActive: "No",
      dampReport: "No issue recorded"
    },
    "maple-court": {
      type: "Apartment",
      bedrooms: "2 bedrooms",
      storeys: "1 floor",
      tenanted: "Yes",
      epcRating: "A",
      epcExpiry: "10 Feb 2034",
      epcRef: "EPC-24MC-B1",
      gasAppliances: "No",
      gasIssue: "N/A",
      gasGiven: "N/A",
      eicrIssue: "20 Jan 2026",
      eicrResult: "Satisfactory",
      eicrGiven: "Yes",
      alarmSmoke: "Yes",
      alarmFuel: "No",
      coAlarm: "N/A",
      alarmTest: "Confirmed",
      tenancyAgreement: "Present",
      depositProtected: "Confirmed",
      prescribedInfo: "Confirmed",
      tenantDocs: "Confirmed",
      licensingChecked: "Confirmed",
      licenceExpiry: "N/A",
      inspectionDate: "03 May 2026",
      possessionActive: "No",
      dampReport: "No issue recorded"
    },
    "canal-view": {
      type: "Flat above commercial",
      bedrooms: "4 bedrooms",
      storeys: "2 floors",
      tenanted: "Yes",
      epcRating: "C",
      epcExpiry: "22 Aug 2030",
      epcRef: "EPC-9CV-B18",
      gasAppliances: "Yes",
      gasIssue: "14 Sep 2025",
      gasGiven: "Yes",
      eicrIssue: "09 Oct 2023",
      eicrResult: "Satisfactory",
      eicrGiven: "Yes",
      alarmSmoke: "Yes",
      alarmFuel: "Yes",
      coAlarm: "Yes",
      alarmTest: "Confirmed",
      tenancyAgreement: "Present",
      depositProtected: "Confirmed",
      prescribedInfo: "Confirmed",
      tenantDocs: "Confirmed",
      licensingChecked: "Unresolved",
      licenceExpiry: "Answer needed",
      inspectionDate: "21 Mar 2026",
      possessionActive: "No",
      dampReport: "Not answered yet"
    },
    "station-road": {
      type: "New purchase",
      bedrooms: "Setup needed",
      storeys: "Setup needed",
      tenanted: "Unknown",
      epcRating: "Missing",
      epcExpiry: "Unknown",
      epcRef: "Missing",
      gasAppliances: "Unknown",
      gasIssue: "Setup needed",
      gasGiven: "Unknown",
      eicrIssue: "Setup needed",
      eicrResult: "Missing",
      eicrGiven: "Unknown",
      alarmSmoke: "Not answered yet",
      alarmFuel: "Not answered yet",
      coAlarm: "Not answered yet",
      alarmTest: "Setup needed",
      tenancyAgreement: "Missing",
      depositProtected: "Not started",
      prescribedInfo: "Not started",
      tenantDocs: "Not started",
      licensingChecked: "Setup needed",
      licenceExpiry: "Unknown",
      inspectionDate: "Setup needed",
      possessionActive: "No",
      dampReport: "Not answered yet"
    }
  };

  const baseFacts = facts[property.id] || facts["the-butts"];
  if (isNewPropertyMode() && property.id === "the-butts") {
    return {
      ...baseFacts,
      type: "Needs confirmation",
      bedrooms: "Needs confirmation",
      storeys: "Needs confirmation",
      tenanted: "Unknown",
      epcRating: "Prepared for review",
      epcExpiry: "Review before relying on it",
      epcRef: "Prepared EPC signal",
      gasAppliances: "Unknown",
      gasIssue: "No document uploaded",
      gasGiven: "Unknown",
      eicrIssue: "No document uploaded",
      eicrResult: "Needs landlord input",
      eicrGiven: "Unknown",
      alarmSmoke: "Needs landlord answer",
      alarmFuel: "Needs landlord answer",
      coAlarm: "Needs landlord answer",
      alarmTest: "Needs landlord answer",
      tenancyAgreement: "Depends on occupancy",
      depositProtected: "Depends on occupancy",
      prescribedInfo: "Depends on occupancy",
      tenantDocs: "Depends on occupancy",
      licensingChecked: "Postcode ready for local checks",
      licenceExpiry: "Unknown",
      inspectionDate: "Not assessed yet",
      possessionActive: "No",
      dampReport: "Not assessed yet"
    };
  }

  return baseFacts;
}

function azSourceForValue(value, defaultSource = "Property record") {
  const missingValues = ["Setup needed", "Not answered yet", "Unknown", "Missing", "Answer needed", "Not started", "Needs confirmation", "Needs landlord input", "No document uploaded"];
  return missingValues.includes(value) ? "Setup needed" : defaultSource;
}

function azCard(sectionId, card) {
  return {
    sectionId,
    action: "Edit",
    control: "choice",
    helper: "Choose the closest answer. If you do not know, choose Not sure rather than guessing.",
    options: ["Yes", "No", "Not sure", "N/A"],
    ...card
  };
}

function azCardsForSection(sectionId, property) {
  const facts = propertyCheckerFacts(property);
  const status = azStatusForProperty(property);
  const evidenceSource = property.evidenceScore >= 90 ? "Evidence Vault" : "Evidence missing";
  const gasEvidence = facts.gasIssue === "N/A" || facts.gasIssue === "Not applicable" ? "Not applicable" : property.id === "willow-brook" ? "Expiring soon" : property.id === "station-road" ? "Evidence missing" : "Uploaded";
  const eicrEvidence = facts.eicrResult === "Missing" ? "Evidence missing" : "Uploaded";

  if (isNewPropertyMode()) {
    const newPropertySections = {
      "property-basics": [
        azCard(sectionId, { id: "address", eyebrow: "Found automatically", label: "Address matched", value: "Flat 42, 57 The Butts, Coventry, CV1 3BJ", source: "Address lookup", action: "Confirm", control: "note", helper: "Confirm this is the property you want CMP to use for checks, evidence and tasks." }),
        azCard(sectionId, { id: "epc-signal", eyebrow: "Found automatically", label: "EPC record prepared for review", value: "Prepared for review", source: "EPC-style lookup", action: "Review", control: "note", helper: "Review before relying on this. CMP has prepared a starting signal, not legal verification." }),
        azCard(sectionId, { id: "type", eyebrow: "Needs confirmation", label: "Property type", value: facts.type, source: "Landlord confirmation needed", action: "Edit", control: "select", options: ["Flat / apartment", "Terraced house", "Semi-detached house", "Detached house", "HMO / shared house", "Not sure"], helper: "Confirm or correct what CMP should use before scoring the property." }),
        azCard(sectionId, { id: "bedrooms", eyebrow: "Needs confirmation", label: "Bedrooms", value: facts.bedrooms, source: "Landlord confirmation needed", action: "Answer", control: "range", min: 0, max: 8, suffix: " bedrooms", helper: "Use 0 if you want CMP to keep this open for later." }),
        azCard(sectionId, { id: "occupancy", eyebrow: "Needs confirmation", label: "Occupancy / tenancy status", value: facts.tenanted, source: "Landlord answer needed", action: "Answer", options: ["Vacant", "Ready to let", "Currently tenanted", "New purchase review", "Not sure"], helper: "Occupancy decides which checks, evidence and reminders CMP should prioritise." }),
        azCard(sectionId, { id: "postcode", eyebrow: "Ready", label: "Postcode / local check", value: "Ready for local checks", source: "Postcode context", action: "Review", control: "note", helper: "Local/licensing checks can continue once the property details are confirmed." })
      ],
      epc: [
        azCard(sectionId, { id: "occupancy-route", eyebrow: "Step 2", label: "Which setup route applies?", value: facts.tenanted, source: "Landlord answer needed", action: "Answer", options: ["Vacant", "Ready to let", "Currently tenanted", "New purchase review", "Not sure"], helper: "This tells CMP whether tenancy/deposit documents matter now or can wait." }),
        azCard(sectionId, { id: "move-in", eyebrow: "Tenancy timing", label: "Is anyone due to move in soon?", value: "Unknown", source: "Landlord answer needed", action: "Answer", options: ["Yes", "No", "Already occupied", "Not sure"], helper: "Move-in timing affects how quickly tenant-facing evidence becomes important." }),
        azCard(sectionId, { id: "landlord-goal", eyebrow: "Goal", label: "What are you trying to do first?", value: "New property setup", source: "Setup flow", action: "Edit", control: "select", options: ["New property setup", "Ready to let", "Review existing tenancy", "New purchase review", "Build evidence pack"], helper: "CMP uses this to keep the guided check practical." })
      ],
      "gas-safety": [
        azCard(sectionId, { id: "appliances", eyebrow: "Landlord answer", label: "Does the property have gas appliances?", value: facts.gasAppliances, source: "Landlord answer needed", action: "Answer" }),
        azCard(sectionId, { id: "certificate", eyebrow: "Certificate", label: "Gas Safety certificate available?", value: facts.gasIssue, source: "No document uploaded", action: "Answer", options: ["Yes, I can upload it", "No", "Not applicable", "Not sure"], helper: "Only upload or arrange Gas Safety if it applies to this property." }),
        azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload Gas Safety certificate", value: "No document uploaded", source: "Evidence Vault", action: "Upload", control: "upload", helper: "Upload only if you already hold a relevant certificate." })
      ],
      "electrical-safety": [
        azCard(sectionId, { id: "available", eyebrow: "Certificate", label: "EICR report available?", value: facts.eicrResult, source: "No document uploaded", action: "Answer", options: ["Yes, I can upload it", "No", "Not sure"], helper: "CMP should not treat EICR as missing until this setup answer is confirmed." }),
        azCard(sectionId, { id: "date-known", eyebrow: "Review date", label: "Expiry or review date known?", value: facts.eicrIssue, source: "Landlord answer needed", action: "Edit", control: "date", helper: "Add the date if you know it, or leave it open for later." }),
        azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload EICR evidence", value: "No document uploaded", source: "Evidence Vault", action: "Upload", control: "upload" })
      ],
      alarms: [
        azCard(sectionId, { id: "smoke", eyebrow: "Landlord answer", label: "Smoke alarms present where required?", value: facts.alarmSmoke, source: "Landlord answer needed", action: "Answer" }),
        azCard(sectionId, { id: "co", eyebrow: "Landlord answer", label: "CO alarms present where relevant?", value: facts.coAlarm, source: "Landlord answer needed", action: "Answer" }),
        azCard(sectionId, { id: "tested", eyebrow: "Tenancy start", label: "Alarms tested at tenancy start?", value: facts.alarmTest, source: "Landlord answer needed", action: "Answer" }),
        azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload alarm photos or report", value: "Optional after answer", source: "Evidence Vault", action: "Upload", control: "upload" })
      ],
      "tenancy-deposit": [
        azCard(sectionId, { id: "agreement", eyebrow: "Depends on occupancy", label: "Tenancy agreement needed now?", value: facts.tenancyAgreement, source: "Occupancy not confirmed", action: "Answer" }),
        azCard(sectionId, { id: "deposit", eyebrow: "Depends on occupancy", label: "Deposit protection evidence needed?", value: facts.depositProtected, source: "Occupancy not confirmed", action: "Answer" }),
        azCard(sectionId, { id: "prescribed", eyebrow: "Depends on occupancy", label: "Prescribed information needed?", value: facts.prescribedInfo, source: "Occupancy not confirmed", action: "Answer" }),
        azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload tenancy/deposit documents", value: "Wait until occupancy is confirmed", source: "Evidence Vault", action: "Upload", control: "upload" })
      ],
      licensing: [
        azCard(sectionId, { id: "postcode", eyebrow: "Postcode context", label: "Local licensing check", value: facts.licensingChecked, source: "Postcode ready", action: "Review", control: "note", helper: "CMP can continue local checks once the basic property facts are confirmed." }),
        azCard(sectionId, { id: "hmo", eyebrow: "Landlord answer", label: "Could this be HMO/shared occupancy?", value: "Unknown", source: "Occupancy not confirmed", action: "Answer" }),
        azCard(sectionId, { id: "licence", eyebrow: "Evidence", label: "Licence evidence available?", value: "Unknown", source: "Landlord answer needed", action: "Answer", options: ["Yes", "No", "Not applicable", "Not sure"] })
      ],
      "inspections-maintenance": [
        azCard(sectionId, { id: "last-inspection", eyebrow: "Inspection", label: "Any recent inspection record?", value: facts.inspectionDate, source: "No record uploaded", action: "Answer" }),
        azCard(sectionId, { id: "maintenance", eyebrow: "Maintenance", label: "Any known repairs or hazards?", value: facts.dampReport, source: "Landlord answer needed", action: "Answer" }),
        azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload inspection or maintenance evidence", value: "Optional after setup", source: "Evidence Vault", action: "Upload", control: "upload" })
      ]
    };

    return newPropertySections[sectionId] || newPropertySections["property-basics"];
  }

  const sections = {
    "property-basics": [
      azCard(sectionId, { id: "journey", eyebrow: "Journey context", label: "Current journey", value: labsState.azScenario === "possession" ? "Build a possession evidence pack before progressing." : azScenarioLabels[labsState.azScenario], source: "Journey context", action: "Edit", control: "select", options: Object.values(azScenarioLabels), helper: "This changes the checks CMP prioritises for this property." }),
      azCard(sectionId, { id: "type", eyebrow: "Property record", label: "Property type", value: facts.type, source: azSourceForValue(facts.type), action: "Edit", control: "select", options: ["Terraced house", "Semi-detached house", "Apartment", "Flat above commercial", "New purchase", "HMO / shared house"] }),
      azCard(sectionId, { id: "bedrooms", eyebrow: "Property record", label: "Bedrooms", value: facts.bedrooms, source: azSourceForValue(facts.bedrooms), action: "Edit", control: "range", min: 0, max: 8, suffix: " bedrooms", helper: "Use 0 if CMP should ask for this later." }),
      azCard(sectionId, { id: "storeys", eyebrow: "Property record", label: "Storeys", value: facts.storeys, source: azSourceForValue(facts.storeys), action: "Edit", control: "range", min: 1, max: 5, suffix: " floors" }),
      azCard(sectionId, { id: "tenanted", eyebrow: "Occupancy", label: "Is the property currently tenanted?", value: facts.tenanted, source: azSourceForValue(facts.tenanted), action: "Answer" })
    ],
    epc: [
      azCard(sectionId, { id: "rating", eyebrow: "EPC data", label: "Current EPC rating", value: facts.epcRating, source: facts.epcRating === "Missing" ? "Evidence missing" : "EPC data pulled automatically", action: facts.epcRating === "Missing" ? "Add" : "Review", control: "select", options: ["A", "B", "C", "D", "E", "F", "G", "Missing", "Not sure"] }),
      azCard(sectionId, { id: "expiry", eyebrow: "EPC data", label: "EPC expiry", value: facts.epcExpiry, source: azSourceForValue(facts.epcExpiry, "EPC data pulled automatically"), action: "Edit", control: "date" }),
      azCard(sectionId, { id: "reference", eyebrow: "Certificate", label: "Certificate reference", value: facts.epcRef, source: azSourceForValue(facts.epcRef, "EPC data pulled automatically"), action: "Review", control: "note", helper: "Correct the reference if the automatic record does not match the certificate." }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload EPC certificate", value: facts.epcRating === "Missing" ? "Evidence missing" : `Rating ${facts.epcRating} · expires ${facts.epcExpiry}`, source: facts.epcRating === "Missing" ? "Evidence Vault" : "EPC data pulled automatically", action: facts.epcRating === "Missing" ? "Upload" : "Replace", control: "upload", helper: "Upload is simulated in this Labs prototype." })
    ],
    "gas-safety": [
      azCard(sectionId, { id: "appliances", eyebrow: "Landlord answer", label: "Does the property have gas appliances?", value: facts.gasAppliances, source: azSourceForValue(facts.gasAppliances, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "issue-date", eyebrow: "Certificate", label: "Gas certificate issue date", value: facts.gasIssue, source: azSourceForValue(facts.gasIssue, "Evidence Vault"), action: "Edit", control: "date" }),
      azCard(sectionId, { id: "given-tenant", eyebrow: "Tenant service", label: "Was the gas safety certificate given to the tenant?", value: facts.gasGiven, source: azSourceForValue(facts.gasGiven, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "engineer", eyebrow: "Certificate detail", label: "Engineer or registration note", value: property.id === "station-road" ? "Scan should fill this in automatically" : "Record held in evidence pack", source: property.id === "station-road" ? "Setup needed" : "Evidence Vault", action: "Add", control: "note" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload Gas Safety certificate", value: gasEvidence, source: gasEvidence === "Evidence missing" ? "Evidence missing" : "Evidence Vault", action: gasEvidence === "Evidence missing" ? "Upload" : "Replace", control: "upload" })
    ],
    "electrical-safety": [
      azCard(sectionId, { id: "issue-date", eyebrow: "Certificate", label: "EICR issue date", value: facts.eicrIssue, source: azSourceForValue(facts.eicrIssue, "Evidence Vault"), action: "Edit", control: "date" }),
      azCard(sectionId, { id: "result", eyebrow: "Certificate", label: "EICR result", value: facts.eicrResult, source: facts.eicrResult === "Missing" ? "Evidence missing" : "Evidence Vault", action: facts.eicrResult === "Missing" ? "Add" : "Review", control: "select", options: ["Satisfactory", "Unsatisfactory", "Remedial work completed", "Missing", "Not sure"] }),
      azCard(sectionId, { id: "given-tenant", eyebrow: "Tenant service", label: "Was the EICR given to the tenant?", value: facts.eicrGiven, source: azSourceForValue(facts.eicrGiven, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload EICR evidence", value: eicrEvidence, source: eicrEvidence === "Evidence missing" ? "Evidence missing" : "Evidence Vault", action: eicrEvidence === "Evidence missing" ? "Upload" : "Replace", control: "upload" })
    ],
    alarms: [
      azCard(sectionId, { id: "smoke", eyebrow: "Alarm check", label: "Smoke alarm on each storey used as living accommodation?", value: facts.alarmSmoke, source: azSourceForValue(facts.alarmSmoke, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "combustion", eyebrow: "Alarm check", label: "Any fixed combustion appliance, excluding gas cookers?", value: facts.alarmFuel, source: azSourceForValue(facts.alarmFuel, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "co", eyebrow: "Alarm check", label: "CO alarm present where required?", value: facts.coAlarm, source: azSourceForValue(facts.coAlarm, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "tested", eyebrow: "Tenancy start", label: "Alarms tested at tenancy start?", value: facts.alarmTest, source: azSourceForValue(facts.alarmTest, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload alarm photos or report", value: property.evidenceScore > 75 ? "Uploaded document" : "Evidence missing", source: evidenceSource, action: property.evidenceScore > 75 ? "Replace" : "Upload", control: "upload" })
    ],
    "tenancy-deposit": [
      azCard(sectionId, { id: "agreement", eyebrow: "Document", label: "Tenancy agreement present?", value: facts.tenancyAgreement, source: azSourceForValue(facts.tenancyAgreement, "Evidence Vault"), action: "Review" }),
      azCard(sectionId, { id: "deposit", eyebrow: "Deposit", label: "Deposit protected?", value: facts.depositProtected, source: azSourceForValue(facts.depositProtected, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "prescribed", eyebrow: "Deposit", label: "Prescribed information served?", value: facts.prescribedInfo, source: azSourceForValue(facts.prescribedInfo, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "tenant-docs", eyebrow: "Tenant service", label: "Tenant received relevant documents?", value: facts.tenantDocs, source: azSourceForValue(facts.tenantDocs, "Confirmed by answer"), action: "Answer" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload tenancy/deposit documents", value: facts.tenancyAgreement === "Missing" ? "Evidence missing" : "Uploaded document", source: evidenceSource, action: facts.tenancyAgreement === "Missing" ? "Upload" : "Replace", control: "upload" })
    ],
    licensing: [
      azCard(sectionId, { id: "checked", eyebrow: "Local authority", label: "Local licensing checked?", value: facts.licensingChecked, source: azSourceForValue(facts.licensingChecked, "Local authority / PRS watch item"), action: facts.licensingChecked === "Unresolved" ? "Review" : "Edit", control: "select", options: ["Confirmed", "No local issue found", "Unresolved", "Setup needed", "Not sure"] }),
      azCard(sectionId, { id: "expiry", eyebrow: "Licence", label: "Licence expiry date", value: facts.licenceExpiry, source: azSourceForValue(facts.licenceExpiry, "Property record"), action: "Edit", control: "date" }),
      azCard(sectionId, { id: "evidence", eyebrow: "Evidence", label: "Licence evidence", value: facts.licensingChecked === "Unresolved" || facts.licensingChecked === "Setup needed" ? "Evidence missing" : "Official record", source: facts.licensingChecked === "Unresolved" ? "Evidence missing" : "Property record", action: facts.licensingChecked === "Unresolved" ? "Upload" : "Review", control: "upload" }),
      azCard(sectionId, { id: "watch", eyebrow: "PRS watch", label: "Local authority / PRS watch item", value: property.id === "canal-view" ? "Licensing question unresolved" : "No active watch item", source: property.id === "canal-view" ? "CMP watch list" : "Property record", action: "Review", control: "note" })
    ],
    "inspections-maintenance": [
      azCard(sectionId, { id: "last-inspection", eyebrow: "Inspection", label: "Last inspection date", value: facts.inspectionDate, source: azSourceForValue(facts.inspectionDate, "Property record"), action: "Edit", control: "date" }),
      azCard(sectionId, { id: "repair-notes", eyebrow: "Maintenance", label: "Repair or maintenance notes", value: property.id === "station-road" ? "Setup needed" : "Notes stored", source: property.id === "station-road" ? "Setup needed" : "Activity timeline", action: "Add", control: "note" }),
      azCard(sectionId, { id: "inspection-report", eyebrow: "Evidence", label: "Upload inspection report", value: property.missingEvidence.some((gap) => gap.toLowerCase().includes("inspection")) ? "Evidence missing" : "Uploaded document", source: evidenceSource, action: "Upload", control: "upload" }),
      azCard(sectionId, { id: "inspection-pics", eyebrow: "Evidence", label: "Upload latest inspection pics", value: property.evidenceScore > 80 ? "Uploaded document" : "Evidence not uploaded", source: evidenceSource, action: "Upload", control: "upload" })
    ],
    "evidence-pack": [
      azCard(sectionId, { id: "upload-docs", eyebrow: "Evidence", label: "Upload property documents", value: property.evidenceScore === 100 ? "Complete" : `${property.missingEvidence.length} gaps still showing`, source: "Evidence Vault", action: "Upload", control: "upload" }),
      azCard(sectionId, { id: "gaps", eyebrow: "Evidence", label: "Evidence gaps still showing", value: property.missingEvidence.length ? property.missingEvidence.join(", ") : "None", source: "Evidence Vault", action: property.missingEvidence.length ? "Review" : "Confirm", control: "note" }),
      azCard(sectionId, { id: "gas-status", eyebrow: "Certificate", label: "Gas Safety evidence status", value: gasEvidence, source: "Evidence Vault", action: "Review", control: "upload" }),
      azCard(sectionId, { id: "eicr-status", eyebrow: "Certificate", label: "Electrical Safety evidence status", value: eicrEvidence, source: "Evidence Vault", action: "Review", control: "upload" }),
      azCard(sectionId, { id: "deposit-status", eyebrow: "Tenancy", label: "Deposit protection evidence status", value: facts.depositProtected === "Confirmed" ? "Confirmed" : "Evidence missing", source: "Evidence Vault", action: "Review", control: "upload" })
    ],
    "possession-prep": [
      azCard(sectionId, { id: "active", eyebrow: "Journey", label: "Is a possession or eviction workflow active?", value: facts.possessionActive, source: "Journey context", action: "Answer" }),
      azCard(sectionId, { id: "notices", eyebrow: "Evidence", label: "Notice evidence organised?", value: facts.possessionActive === "Yes" ? "Setup needed" : "N/A", source: "Evidence pack", action: "Add", control: "upload" }),
      azCard(sectionId, { id: "communications", eyebrow: "Evidence", label: "Tenant communications organised?", value: facts.possessionActive === "Yes" ? "Part organised" : "N/A", source: "Activity timeline", action: "Review", control: "note" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload notices or possession evidence", value: facts.possessionActive === "Yes" ? "Evidence missing" : "Not required yet", source: "Evidence Vault", action: "Upload", control: "upload" })
    ],
    "mould-damp": [
      azCard(sectionId, { id: "report", eyebrow: "Hazards", label: "Do you have a damp or mould report?", value: facts.dampReport, source: azSourceForValue(facts.dampReport, "Property record"), action: "Answer" }),
      azCard(sectionId, { id: "repair-history", eyebrow: "Repairs", label: "Repair history organised?", value: property.id === "station-road" ? "Setup needed" : "Organised", source: property.id === "station-road" ? "Setup needed" : "Activity timeline", action: "Review", control: "note" }),
      azCard(sectionId, { id: "communications", eyebrow: "Tenant comms", label: "Tenant communications organised?", value: property.id === "station-road" ? "Not started" : "Organised", source: "Activity timeline", action: "Review", control: "note" }),
      azCard(sectionId, { id: "upload", eyebrow: "Evidence", label: "Upload mould report or photos", value: facts.dampReport === "No issue recorded" ? "N/A" : "Evidence missing", source: "Evidence Vault", action: "Upload", control: "upload" })
    ],
    summary: [
      azCard(sectionId, { id: "completed", eyebrow: "Summary", label: "Completed checks", value: property.complianceScore === 100 ? "All core checks complete" : `${Math.round(property.complianceScore / 10)} of 10 core checks ready`, source: "CMP readiness model", action: "Review", control: "note" }),
      azCard(sectionId, { id: "unanswered", eyebrow: "Summary", label: "Still unanswered", value: property.complianceScore === 100 ? "None" : property.id === "station-road" ? "Property setup, certificates, tenancy" : "Some answers can be double-checked later", source: "Landlord answers", action: "Review", control: "note" }),
      azCard(sectionId, { id: "proof", eyebrow: "Summary", label: "Known missing proof", value: property.missingEvidence.length ? property.missingEvidence.join(", ") : "None", source: "Evidence Vault", action: property.missingEvidence.length ? "Upload" : "Confirm", control: "upload" }),
      azCard(sectionId, { id: "renewals", eyebrow: "Summary", label: "Renewals", value: property.id === "willow-brook" ? "Gas Safety renewal soon" : property.complianceScore === 100 ? "No urgent renewals" : "Review expiry dates", source: "Timeline forecast", action: "Review", control: "date" }),
      azCard(sectionId, { id: "next", eyebrow: "Summary", label: "Possible next steps", value: property.recommendedService || "No service needed", source: "Scenario builder", action: "Review", control: "note" })
    ]
  };

  return sections[sectionId] || sections["property-basics"];
}

function renderAzPropertySelector(properties) {
  return `
    <label class="az-field">
      <span>Property</span>
      <select data-az-property-select>
        ${properties.map((property) => `
          <option value="${escapeHtml(property.id)}" ${property.id === azSelectedProperty().id ? "selected" : ""}>
            ${escapeHtml(property.address)}${isNewPropertyMode() ? " · new profile" : ` · ${effectiveComplianceScore(property)}% compliance`}
          </option>
        `).join("")}
      </select>
    </label>
  `;
}

const newPropertyGuidedStages = [
  "Property basics",
  "Occupancy / tenancy status",
  "Gas Safety relevance",
  "Electrical Safety / EICR",
  "Smoke and CO alarms",
  "Tenancy / deposit documents",
  "Licensing / local checks",
  "Inspection / maintenance evidence"
];

function renderNewPropertyFindingRows() {
  return newPropertyFindingItems().map((item) => `
    <article class="new-property-finding-row">
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.value)}</p>
      </div>
      <span>${escapeHtml(item.status)}</span>
      <button type="button" ${item.complete ? "disabled" : "data-new-setup-confirm"}>${escapeHtml(item.action)}</button>
    </article>
  `).join("");
}

function renderNewPropertyGuidedStages() {
  return newPropertyGuidedStages.map((stage, index) => `
    <li>
      <span>${index + 1}</span>
      <strong>${escapeHtml(stage)}</strong>
    </li>
  `).join("");
}

function renderNewPropertySetupSummary() {
  const summary = newPropertyStatusSummary();
  return `
    <div class="new-property-setup-shell">
      <section class="new-property-findings-panel" data-new-property-findings aria-labelledby="newPropertyFindingsTitle">
        <div class="new-property-panel-heading">
          <p class="section-kicker">Review CMP findings</p>
          <h3 id="newPropertyFindingsTitle">Review what CMP found</h3>
          <p>${escapeHtml(summary.statusLine)}</p>
        </div>
        <div class="score-pair-grid">
          <article class="score-card ${scoreClass(summary.profileSetupScore)} is-compact">
            <div><span>Profile setup</span><strong>${summary.profileSetupScore}%</strong></div>
            <div class="score-meter"><span style="width: ${summary.profileSetupScore}%"></span></div>
            <small>${escapeHtml(summary.profileSetupHelp)}</small>
          </article>
          <article class="score-card ${scoreClass(summary.evidenceConfidenceScore)} is-compact">
            <div><span>Evidence confidence</span><strong>${summary.evidenceConfidenceScore}%</strong></div>
            <div class="score-meter"><span style="width: ${summary.evidenceConfidenceScore}%"></span></div>
            <small>${escapeHtml(summary.evidenceConfidenceHelp)}</small>
          </article>
        </div>
        <div class="new-property-finding-list">
          ${renderNewPropertyFindingRows()}
        </div>
        <div class="button-row">
          <button class="${summary.findingsConfirmed ? "secondary-button" : "primary-button"}" type="button" data-new-setup-confirm ${summary.findingsConfirmed ? "disabled" : ""}>${summary.findingsConfirmed ? "Findings confirmed" : "Confirm all found details"}</button>
          <button class="secondary-button" type="button" data-new-setup-ask>Ask CMP what this means</button>
        </div>
      </section>

      <section class="new-property-guided-panel" aria-labelledby="newPropertyGuidedTitle">
        <div class="new-property-panel-heading">
          <p class="section-kicker">Complete guided compliance check</p>
          <h3 id="newPropertyGuidedTitle">Complete the guided compliance check</h3>
          <p>After confirming the basics, CMP will ask only for the information it cannot find automatically.</p>
        </div>
        <ol class="new-property-stage-list">
          ${renderNewPropertyGuidedStages()}
        </ol>
        <div class="button-row">
          <button class="primary-button" type="button" data-new-setup-start>Start guided check</button>
          <button class="secondary-button" type="button" data-new-setup-upload>Upload certificates first</button>
        </div>
        <p class="new-property-setup-note">You can skip anything you do not know and return later. Scores, gaps and service recommendations stay provisional until these setup details are confirmed.</p>
      </section>
    </div>
  `;
}

function renderSmartSearchMissingRows(items) {
  return items.map((item) => {
    const row = typeof item === "string"
      ? { label: item, status: "Needs landlord input", className: "" }
      : item;
    const statusClass = row.statusClass || row.className || "";
    const actionAttributes = row.actionField
      ? `data-smart-answer-field="${escapeHtml(row.actionField)}"`
      : row.actionAttr || "";
    const action = row.actionLabel
      ? `<button class="secondary-button compact-answer-button" type="button" ${actionAttributes}>${escapeHtml(row.actionLabel)}</button>`
      : "";
    return `
    <li class="${row.complete ? "is-complete" : ""}">
      <span class="smart-missing-copy">
        <strong>${escapeHtml(row.label)}</strong>
        ${row.note ? `<small>${escapeHtml(row.note)}</small>` : ""}
      </span>
      <span class="smart-missing-meta">
        <span class="smart-status-pill ${escapeHtml(statusClass)}">${escapeHtml(row.status)}</span>
        ${action}
      </span>
    </li>
  `;
  }).join("");
}

function smartSearchQuestionConfigs() {
  return {
    bedrooms: {
      title: "How many bedrooms?",
      body: "Choose the bedroom count CMP should use for this property setup.",
      answerKey: "bedrooms",
      confirmationKey: "bedroomsConfirmed",
      label: "Bedrooms",
      choices: ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "Not sure"]
    },
    occupancy: {
      title: "What is the occupancy status?",
      body: "This tells CMP which documents, reminders and checks matter next.",
      answerKey: "occupancy",
      confirmationKey: "occupancyConfirmed",
      label: "Occupancy / tenancy status",
      choices: ["Vacant", "Ready to let", "Currently tenanted", "New purchase review", "Not sure"]
    },
    alarms: {
      title: "Are smoke and CO alarms checked?",
      body: "Tell CMP whether this is already checked or should remain a follow-up.",
      answerKey: "alarmStatus",
      confirmationKey: "alarmsConfirmed",
      evidenceKey: "alarms",
      label: "Smoke and CO alarm status",
      choices: ["Confirmed installed/tested", "Need to check", "Not sure"]
    },
    tenancy: {
      title: "Which tenancy or deposit documents apply?",
      body: "This depends on the occupancy route and helps CMP decide which tenancy documents matter now.",
      answerKey: "tenancyDepositStatus",
      confirmationKey: "tenancyDepositConfirmed",
      label: "Tenancy/deposit documents",
      choices: ["Not currently tenanted", "Tenanted, documents held", "Tenanted, documents missing", "Preparing for new tenancy", "Not sure"]
    },
    inspection: {
      title: "Is there recent inspection evidence?",
      body: "A simple answer is enough for the first setup pass. Documents can be added later.",
      answerKey: "inspectionStatus",
      confirmationKey: "inspectionReviewed",
      evidenceKey: "inspection",
      label: "Inspection evidence",
      choices: ["Recent inspection completed", "No recent inspection", "Not sure", "Skip for now"]
    }
  };
}

function nextSmartSearchAnswerField(setup = newPropertySetup()) {
  const answers = setup.landlordAnswers || {};
  const order = ["bedrooms", "occupancy", "alarms", "tenancy", "inspection"];
  const configs = smartSearchQuestionConfigs();
  return order.find((field) => !answers[configs[field].answerKey]) || "";
}

function smartSearchAnswerStatus(setup, field, note = "Landlord answer needed.", defaultStatus = "Needs landlord input") {
  const configs = smartSearchQuestionConfigs();
  const config = configs[field];
  const value = setup.landlordAnswers?.[config.answerKey] || "";
  const confirmed = Boolean(setup.confirmations?.[config.confirmationKey]);

  if (!value) {
    return {
      note,
      status: defaultStatus,
      statusClass: defaultStatus === "Depends on occupancy" || defaultStatus === "Can skip for now" ? "is-watch" : "is-needed",
      complete: false
    };
  }

  if (confirmed) {
    return {
      note: value,
      status: field === "inspection" && value === "Skip for now" ? "Skipped" : "Answered",
      statusClass: "is-found",
      complete: true
    };
  }

  return {
    note: value,
    status: value === "Skip for now" ? "Skipped for now" : "Not sure",
    statusClass: "is-watch",
    complete: false
  };
}

function renderSmartSearchAnswerPanel() {
  const activePanel = labsState.smartSearchAnswerPanel;
  const configs = smartSearchQuestionConfigs();
  const config = configs[activePanel];
  if (!config) {
    return "";
  }

  const setup = newPropertySetup();
  const current = setup.landlordAnswers?.[config.answerKey] || "Not answered";
  const questionKeys = Object.keys(configs);
  const questionIndex = Math.max(0, questionKeys.indexOf(activePanel));

  return `
    <article class="smart-answer-panel" data-smart-answer-panel>
      <div>
        <p class="section-kicker">Question ${questionIndex + 1} of ${questionKeys.length}</p>
        <h4>${escapeHtml(config.title)}</h4>
        <p>${escapeHtml(config.body)}</p>
        <small>Current answer: ${escapeHtml(current)}</small>
      </div>
      <div class="smart-answer-options">
        ${config.choices.map((choice) => `
          <button class="secondary-button" type="button" data-smart-answer-choice="${escapeHtml(activePanel)}" data-smart-answer-value="${escapeHtml(choice)}">${escapeHtml(choice)}</button>
        `).join("")}
      </div>
      <button class="text-button" type="button" data-smart-answer-close>Close</button>
    </article>
  `;
}

function renderSmartSearchResults() {
  const setup = newPropertySetup();
  const summary = newPropertyStatusSummary(setup);
  const identity = setup.identity || {};
  const foundData = setup.foundData || {};
  const evidence = setup.evidence || {};
  const confirmations = setup.confirmations || {};
  const saved = Boolean(summary.findingsConfirmed);
  const gasUploaded = isNewPropertyEvidenceUploaded(setup, "gasSafety");
  const eicrUploaded = isNewPropertyEvidenceUploaded(setup, "eicr");
  const bedroomsAnswered = Boolean(confirmations.bedroomsConfirmed);
  const occupancyAnswered = Boolean(confirmations.occupancyConfirmed);
  const alarmStatus = smartSearchAnswerStatus(setup, "alarms", "Landlord answer needed.");
  const tenancyStatus = smartSearchAnswerStatus(setup, "tenancy", "Depends on occupancy.", "Depends on occupancy");
  const inspectionStatus = smartSearchAnswerStatus(setup, "inspection", "Can skip during first setup.", "Can skip for now");
  const nextQuestion = nextSmartSearchAnswerField(setup);
  const step2Started = ["bedrooms", "occupancy", "alarmStatus", "tenancyDepositStatus", "inspectionStatus"]
    .some((key) => Boolean(setup.landlordAnswers?.[key]))
    || gasUploaded
    || eicrUploaded;
  const step2Complete = saved && !nextQuestion;
  const step3Active = saved && step2Complete;
  const remainingItems = [
    bedroomsAnswered ? "" : "Bedrooms",
    occupancyAnswered ? "" : "Occupancy / tenancy status",
    gasUploaded || confirmations.gasSafetyRelevanceConfirmed ? "" : "Gas Safety relevance / certificate",
    eicrUploaded || confirmations.eicrStatusConfirmed ? "" : "Electrical Safety / EICR status",
    confirmations.alarmsConfirmed ? "" : "Smoke and CO alarm status",
    confirmations.tenancyDepositConfirmed ? "" : "Tenancy/deposit documents if relevant",
    confirmations.inspectionReviewed ? "" : "Inspection evidence"
  ].filter(Boolean);
  const epcVariant = newPropertyEpcVariantCopy();
  const epcSourceBadge = foundData.epcVariantLabel || epcVariant.label;
  const epcCardTitle = foundData.epcCardTitle || epcVariant.cardTitle;
  const epcStatus = saved ? "Accepted as starting signal" : (foundData.epcVariantStatus || epcVariant.status);
  const epcStatusClass = foundData.epcStatus === "missingDemoMatch"
    ? "status-watch-text"
    : foundData.epcStatus === "expiredDemoMatch" || foundData.epcStatus === "expiringDemoMatch"
      ? "status-watch-text"
      : saved
        ? "status-watch-text"
        : "status-review-text";
  const epcSummary = foundData.epcVariantSummary || epcVariant.summary;
  const epcSource = foundData.epcVariantSource || epcVariant.source;
  const gasStatus = gasUploaded ? "Uploaded for review" : "No document uploaded";
  const eicrStatus = eicrUploaded ? "Uploaded for review" : "No document uploaded";
  const topTask = newPropertyTaskItems(setup)[0]?.title || "Continue setup";
  const allQuestionsHandled = saved && !nextQuestion;
  const nextPrimaryLabel = !saved
    ? "Confirm and save found data"
    : allQuestionsHandled
      ? "View property in Properties"
      : "Answer remaining questions";
  const nextPrimaryAttr = !saved
    ? "data-smart-confirm"
    : allQuestionsHandled
      ? "data-smart-view-property"
      : "data-smart-answer-remaining";

  return `
    <header class="smart-search-hero is-signal-led">
      <div class="smart-hero-copy">
        <p class="section-kicker">Smart Search Results</p>
        <h2 id="smartSearchResultsTitle">Property workspace created</h2>
        <p>Address matched. CMP prepared a likely property record, EPC signal and local authority context for review. Next: check what CMP found and confirm the unknowns.</p>
        <span class="smart-hero-badge">57 The Butts &middot; Coventry, CV1 3BJ</span>
        <div class="smart-hero-actions">
          <button class="primary-button" type="button" data-smart-primary-review>Review Smart Search</button>
          <button class="secondary-button" type="button" data-smart-answer-remaining>Confirm unknowns</button>
        </div>
      </div>
      <aside class="smart-signal-summary" aria-label="Smart search signal summary">
        <span>Smart search found</span>
        <strong>${foundData.epcFound === false ? "5 useful property signals" : "6 useful property signals"}</strong>
        <ul>
          <li><span>Found automatically</span><strong>Address matched</strong></li>
          <li><span>Prepared for review</span><strong>UPRN prepared</strong></li>
          <li><span>Found automatically</span><strong>Coventry City Council found</strong></li>
          <li><span>${escapeHtml(epcSourceBadge)}</span><strong>${foundData.epcFound === false ? "EPC needs checking" : `EPC rating ${escapeHtml(foundData.epcRating || "C")} prepared`}</strong></li>
          <li><span>${escapeHtml(epcStatus)}</span><strong>${escapeHtml(foundData.epcExpiryDate || "February 2034")}</strong></li>
          <li><span>Needs landlord input</span><strong>Flat/apartment assumption prepared</strong></li>
        </ul>
      </aside>
    </header>

    <section class="smart-journey-strip" aria-label="First property setup journey">
      <article class="${saved ? "is-complete" : "is-active"}">
        <span>1</span>
        <div>
          <strong>Review found data</strong>
          <small>${saved ? "Smart search saved" : "Check the address, EPC and local signals"}</small>
        </div>
      </article>
      <article class="${step2Complete ? "is-complete" : saved ? "is-active" : ""}">
        <span>2</span>
        <div>
          <strong>Answer remaining unknowns</strong>
          <small>${step2Complete ? "Inline setup answers recorded" : saved ? "CMP asks only what it could not find" : "Available after saving found data"}</small>
        </div>
      </article>
      <article class="${step3Active ? "is-active" : ""}">
        <span>3</span>
        <div>
          <strong>View property / open workspace</strong>
          <small>${step3Active ? "Ready for handoff" : "Complete setup enough to hand off"}</small>
        </div>
      </article>
    </section>

    ${saved ? `
      <article class="smart-saved-strip">
        <span class="tile-icon" data-icon="check"></span>
        <div>
          <strong>Smart search saved. CMP will only ask for information it could not find automatically.</strong>
          <p>CMP has saved the useful data it found. Now answer only the details it could not find automatically.</p>
        </div>
      </article>
    ` : ""}

    <section class="smart-search-score-row" aria-label="Property setup scores">
      <article class="score-card ${scoreClass(summary.profileSetupScore)} is-compact">
        <div><span>Profile setup</span><strong>${summary.profileSetupScore}%</strong></div>
        <div class="score-meter"><span style="width: ${summary.profileSetupScore}%"></span></div>
        <small>${escapeHtml(summary.profileSetupHelp)}</small>
      </article>
      <article class="score-card ${scoreClass(summary.evidenceConfidenceScore)} is-compact">
        <div><span>Evidence confidence</span><strong>${summary.evidenceConfidenceScore}%</strong></div>
        <div class="score-meter"><span style="width: ${summary.evidenceConfidenceScore}%"></span></div>
        <small>${escapeHtml(summary.evidenceConfidenceHelp)}</small>
      </article>
      <article class="score-card is-compact smart-readiness-card">
        <div><span>Property compliance</span><strong>Setup first</strong></div>
        <small>Complete setup before compliance scoring.</small>
      </article>
    </section>

    <section class="smart-search-layout">
      <div class="smart-search-main">
        <article class="smart-search-panel smart-found-panel">
          <div class="smart-section-heading">
            <p class="section-kicker">What CMP found automatically</p>
            <h3>Useful property records are ready to review</h3>
            <p>CMP found a likely EPC-style record, address context and local authority signal. Save the useful details, then CMP will only ask for what it could not find.</p>
          </div>
          <div class="smart-found-grid">
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Address matched</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-watch-text"}">${saved ? "Saved and locked" : "Locked after save"}</span>
              </div>
              <h4>${escapeHtml(identity.address || "Flat 42, 57 The Butts, Coventry, CV1 3BJ")}</h4>
              <p>Source: Confirmed from address selection</p>
              <small>Identity data locks after save.</small>
            </article>
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">UPRN prepared</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-watch-text"}">${saved ? "Saved" : "Ready to save"}</span>
              </div>
              <h4>${escapeHtml(identity.uprn || "DEMO-UPRN-57TB")}</h4>
              <p>Source: address lookup style identity signal</p>
              <small>Useful for connecting future records to this property.</small>
            </article>
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Local authority found</span>
                <span class="doc-status status-good-text">Context ready</span>
              </div>
              <h4>${escapeHtml(identity.localAuthority || "Coventry City Council")}</h4>
              <p>Source: postcode/local authority context</p>
              <small>Local and licensing checks can continue after setup facts are confirmed.</small>
            </article>
            <article class="smart-found-card is-epc">
              <div class="smart-card-top">
                <span class="source-badge">${escapeHtml(epcSourceBadge)}</span>
                <span class="doc-status ${epcStatusClass}">${escapeHtml(epcStatus)}</span>
              </div>
              <h4>${escapeHtml(epcCardTitle)}</h4>
              <div class="smart-epc-rating-row" aria-label="EPC rating summary">
                <div><span>Current rating</span><strong>${escapeHtml(foundData.epcRating || "C")}</strong></div>
                <div><span>Potential rating</span><strong>${escapeHtml(foundData.epcPotentialRating || "B")}</strong></div>
              </div>
              <dl>
                <div><dt>Valid until</dt><dd>${escapeHtml(foundData.epcExpiryDate || "February 2034")}</dd></div>
                <div><dt>Floor area</dt><dd>${escapeHtml(foundData.epcFloorArea || "Needs review")}</dd></div>
                <div><dt>Property type</dt><dd>${escapeHtml(foundData.epcPropertyType || "Flat / apartment")}</dd></div>
                <div><dt>Match confidence</dt><dd>${escapeHtml(foundData.epcMatchConfidence || "Likely match")}</dd></div>
              </dl>
              <p>${escapeHtml(epcSummary)}</p>
              <p>Source: ${escapeHtml(epcSource)}</p>
              <small>Guidance only. Review before relying on this; it is a starting signal, not legal verification.</small>
            </article>
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Property type assumption</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-review-text"}">${saved ? "Saved for setup" : "Needs confirmation"}</span>
              </div>
              <h4>${escapeHtml(setup.landlordAnswers?.propertyType || foundData.epcPropertyType || "Flat / apartment")}</h4>
              <p>Source: EPC/address assumption</p>
              <small>Confirm or correct this in the remaining questions.</small>
            </article>
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Local checks ready</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-watch-text"}">${saved ? "Started" : "Ready"}</span>
              </div>
              <h4>Postcode and licensing context prepared</h4>
              <p>Source: postcode/local authority context</p>
              <small>CMP will use this once bedrooms, occupancy and evidence are clearer.</small>
            </article>
          </div>
        </article>

        <article class="smart-search-panel smart-missing-panel">
          <div class="smart-section-heading">
            <p class="section-kicker">Still needed from you</p>
            <h3>These stay open until you answer or upload evidence</h3>
          </div>
          <ul class="smart-missing-list">
            ${renderSmartSearchMissingRows([
              {
                label: "Bedrooms",
                note: bedroomsAnswered ? setup.landlordAnswers.bedrooms : "CMP could not infer this reliably.",
                status: bedroomsAnswered ? "Answered" : "Needs landlord input",
                statusClass: bedroomsAnswered ? "is-found" : "is-needed",
                complete: bedroomsAnswered,
                actionLabel: bedroomsAnswered ? "Change" : "Answer",
                actionField: "bedrooms"
              },
              {
                label: "Occupancy / tenancy status",
                note: occupancyAnswered ? setup.landlordAnswers.occupancy : "Decides which checks and documents matter next.",
                status: occupancyAnswered ? "Answered" : "Needs landlord input",
                statusClass: occupancyAnswered ? "is-found" : "is-needed",
                complete: occupancyAnswered,
                actionLabel: occupancyAnswered ? "Change" : "Answer",
                actionField: "occupancy"
              },
              gasUploaded
                ? { label: "Gas Safety Certificate", note: "Demo evidence is attached to this setup.", status: "Uploaded for review", statusClass: "is-found", complete: true }
                : { label: "Gas Safety Certificate", note: "Upload if available. Relevance can be confirmed later.", status: "Upload if available", statusClass: "is-needed", actionLabel: "Upload", actionAttr: "data-smart-scroll-upload" },
              eicrUploaded
                ? { label: "Electrical Safety / EICR", note: "Demo evidence is attached to this setup.", status: "Uploaded for review", statusClass: "is-found", complete: true }
                : { label: "Electrical Safety / EICR", note: "Upload now or arrange later.", status: "Upload if available", statusClass: "is-needed", actionLabel: "Upload", actionAttr: "data-smart-scroll-upload" },
              {
                label: "Smoke and CO alarm status",
                note: alarmStatus.note,
                status: alarmStatus.status,
                statusClass: alarmStatus.statusClass,
                complete: alarmStatus.complete,
                actionLabel: alarmStatus.complete ? "Change" : "Answer",
                actionField: "alarms"
              },
              {
                label: "Tenancy/deposit documents",
                note: tenancyStatus.note,
                status: tenancyStatus.status,
                statusClass: tenancyStatus.statusClass,
                complete: tenancyStatus.complete,
                actionLabel: tenancyStatus.complete ? "Change" : "Answer",
                actionField: "tenancy"
              },
              {
                label: "Inspection evidence",
                note: inspectionStatus.note,
                status: inspectionStatus.status,
                statusClass: inspectionStatus.statusClass,
                complete: inspectionStatus.complete,
                actionLabel: inspectionStatus.complete ? "Change" : "Answer",
                actionField: "inspection"
              }
            ])}
          </ul>
          ${renderSmartSearchAnswerPanel()}
        </article>
      </div>

      <aside class="smart-search-side">
        <article class="smart-upload-panel" data-smart-upload-panel>
          <div>
            <p class="section-kicker">Smart Document Drop</p>
            <h3>Smart Document Drop</h3>
            <p>Drop certificates, inspection notes or property files here. CMP will classify them and attach useful records to this property.</p>
          </div>
          <div class="smart-drop-zone">
            <span class="source-badge">Prototype file scan</span>
            <strong>Drop documents here</strong>
            <small>Demo only. Files are recognised locally in this prototype.</small>
          </div>
          <div class="smart-upload-actions">
            <button class="secondary-button" type="button" data-smart-upload="gasSafety" ${gasUploaded ? "disabled" : ""}>${gasUploaded ? "Gas Safety demo uploaded" : "Upload Gas Safety demo"}</button>
            <button class="secondary-button" type="button" data-smart-upload="eicr" ${eicrUploaded ? "disabled" : ""}>${eicrUploaded ? "EICR demo uploaded" : "Upload EICR demo"}</button>
            <button class="text-button" type="button" data-smart-skip-upload>Skip for now</button>
          </div>
          ${(gasUploaded || eicrUploaded) ? `
            <div class="smart-upload-result">
              ${gasUploaded ? "<strong>Gas Safety Certificate recognised</strong>" : ""}
              ${eicrUploaded ? "<strong>Electrical Safety / EICR report recognised</strong>" : ""}
              <span>Uploaded for review. Not legally verified in this prototype.</span>
              <small>Evidence confidence, still-needed rows, Ask CMP and activity have updated.</small>
            </div>
          ` : ""}
          <dl>
            <div><dt>Gas Safety</dt><dd>${escapeHtml(gasStatus)}</dd></div>
            <div><dt>EICR</dt><dd>${escapeHtml(eicrStatus)}</dd></div>
          </dl>
        </article>

        <article class="smart-action-panel ${saved ? "is-saved" : ""}" data-smart-save-panel>
          <div>
            <p class="section-kicker">Save found data to this property</p>
            <h3>${saved ? "Smart search saved" : "Confirm the smart search once"}</h3>
            <p>${saved ? "CMP has saved the useful data it found. Now answer only the details it could not find automatically." : "This saves the address, UPRN, EPC starting signal, property type assumption and local authority context to this property setup."}</p>
          </div>
          ${saved ? `
            <div class="smart-action-success">
              <strong>Complete</strong>
              <span>Found data saved. Move to the remaining unknowns.</span>
            </div>
          ` : ""}
          <div class="smart-main-actions">
            ${saved
              ? `
                <button class="primary-button" type="button" ${allQuestionsHandled ? "data-smart-view-property" : "data-smart-answer-remaining"}>${allQuestionsHandled ? "View property in Properties" : "Answer remaining questions"}</button>
                <button class="secondary-button" type="button" data-smart-confirm disabled>Found data saved</button>
              `
              : `<button class="primary-button" type="button" data-smart-confirm>Confirm and save found data</button>`}
            <button class="secondary-button" type="button" data-smart-scroll-upload>Upload documents</button>
            <button class="text-button" type="button" data-smart-ask>Ask CMP what this means</button>
            <button class="text-button" type="button" data-smart-edit-details>Edit found details</button>
          </div>
        </article>
      </aside>
    </section>

    <section class="smart-next-panel ${saved ? "is-ready" : ""}">
      <div>
        <p class="section-kicker">${allQuestionsHandled ? "Property added" : saved ? "Next: answer the remaining unknowns" : "Next: save found data"}</p>
        <h3>${allQuestionsHandled ? "Core setup unknowns are answered" : saved ? "Answer only the remaining unknowns" : "Save the found data, then fill the gaps"}</h3>
        <p>${saved ? "CMP will keep asking only for information it could not find automatically." : "Saving turns the scan into the starting property profile."}</p>
      </div>
      <ul>
        ${remainingItems.length
          ? remainingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
          : "<li>Core setup unknowns are answered. Continue the guided check when ready.</li>"}
      </ul>
      <div class="button-row">
        <button class="primary-button" type="button" ${nextPrimaryAttr}>${nextPrimaryLabel}</button>
        <button class="secondary-button" type="button" data-smart-scroll-upload>Upload documents</button>
        ${saved
          ? `<button class="text-button" type="button" ${allQuestionsHandled ? "data-smart-open-workspace" : "data-smart-view-property"}>${allQuestionsHandled ? "Open workspace" : "View property in Properties"}</button>`
          : `<button class="text-button" type="button" data-smart-ask>Ask CMP what this means</button>`}
      </div>
    </section>

    ${saved && labsState.smartSearchWorkspaceOpen ? `
      <section class="smart-workspace-panel" data-smart-workspace-panel>
        <div>
          <p class="section-kicker">Early property workspace</p>
          <h3>57 The Butts workspace</h3>
          <p>This is where CMP will store evidence, tasks, reminders and property-specific compliance guidance.</p>
        </div>
        <div class="smart-workspace-grid">
          <article>
            <span class="source-badge">What CMP knows</span>
            <strong>Property profile created</strong>
            <p>Address, UPRN, Coventry City Council, EPC starting signal and flat/apartment assumption are saved.</p>
          </article>
          <article>
            <span class="source-badge">Evidence status</span>
            <strong>${summary.evidenceConfidenceScore}% confidence</strong>
            <p>${escapeHtml(summary.evidenceConfidenceHelp)}</p>
          </article>
          <article>
            <span class="source-badge">Top next action</span>
            <strong>${escapeHtml(topTask)}</strong>
            <p>CMP keeps this as the next property-specific setup item.</p>
          </article>
        </div>
        <div class="button-row">
          <button class="primary-button" type="button" data-smart-answer-remaining>Continue setup</button>
          <button class="secondary-button" type="button" data-smart-scroll-upload>Upload documents</button>
          <button class="text-button" type="button" data-smart-ask>Ask CMP</button>
        </div>
      </section>
    ` : ""}
  `;
}

function renderNewPropertyAzIntro() {
  return `
    <aside class="az-scenario-guide" aria-label="What CMP found automatically">
      <div>
        <p class="section-kicker">What CMP found first</p>
        <h4>Starting profile prepared</h4>
        <p>CMP matched 57 The Butts, prepared EPC context for review and created the property workspace.</p>
      </div>
      <dl>
        <div><dt>Address</dt><dd>Flat 42, 57 The Butts, Coventry, CV1 3BJ</dd></div>
        <div><dt>EPC</dt><dd>Prepared for review before relying on it</dd></div>
        <div><dt>Next</dt><dd>Confirm property type, bedrooms and occupancy</dd></div>
      </dl>
      <small>Once confirmed, CMP can score evidence gaps and make better service recommendations.</small>
    </aside>
  `;
}

function newPropertySectionContext(section) {
  const context = {
    "property-basics": "This comes first because CMP should show what it found before asking unanswered landlord questions.",
    epc: "Occupancy decides whether tenancy, deposit and tenant-serving evidence matter now or can wait.",
    "gas-safety": "Gas Safety should only become an action once the landlord confirms whether gas applies and whether a certificate exists.",
    "electrical-safety": "Electrical Safety becomes a clearer gap after CMP knows whether an EICR is already available.",
    alarms: "Alarm status is a landlord answer first; supporting evidence can come after the answer.",
    "tenancy-deposit": "These documents depend on the occupancy route selected earlier in the check.",
    licensing: "Postcode context is ready, but local checks need property and occupancy details to be useful.",
    "inspections-maintenance": "Inspection and maintenance evidence can be added once the core setup facts are stable."
  };
  return context[section.id] || "Confirm the setup details before CMP treats this as a reliable compliance score.";
}

function renderAzScenarioSelector() {
  return `
    <label class="az-field">
      <span>Scenario</span>
      <select data-az-scenario-select>
        ${Object.entries(azScenarioLabels).map(([key, label]) => `
          <option value="${key}" ${key === labsState.azScenario ? "selected" : ""}>${escapeHtml(label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderAzProgressHeader({ property, modeLabel }) {
  const section = activeAzSection();
  const step = activeAzSectionIndex() + 1;
  const sections = activeAzSections();
  const completeSections = sections.filter((item) => item.completion >= 90).length;
  const remainingAnswers = labsState.azMode === "portfolio" ? Math.max(8, 33 - checkerScoreBoost("portfolio").compliance) : Math.max(4, Math.round((100 - effectiveComplianceScore(property)) / 2));
  const progress = Math.round(sections.reduce((total, item) => total + item.completion, 0) / sections.length);

  if (isNewPropertyMode()) {
    return `
      <div class="az-product-header">
        <div class="az-product-header-copy">
          <p class="section-kicker">A-Z Compliance Check</p>
          <h3>Confirm what CMP found, then fill the gaps.</h3>
          <p>${escapeHtml(modeLabel)} · ${escapeHtml(section.title)}</p>
          <small>CMP has prepared a starting property profile from the address and EPC-style lookup. Confirm the details before CMP starts scoring evidence gaps.</small>
        </div>
        <div class="az-progress-panel" aria-label="Checker progress">
          <strong>Step ${step} of ${sections.length}</strong>
          <span>Awaiting confirmation</span>
          <small>CMP can generate stronger scores once these setup details are confirmed.</small>
          <div class="az-progress-track"><span style="width: ${progress}%"></span></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="az-product-header">
      <div class="az-product-header-copy">
        <p class="section-kicker">A-Z Compliance Check</p>
        <h3>Answer the landlord questions. Let evidence fill the proof gaps.</h3>
        <p>${escapeHtml(modeLabel)} · ${escapeHtml(azScenarioLabels[labsState.azScenario])} · ${escapeHtml(section.title)}</p>
        <small>CMP keeps two lists: answers you still need to confirm, and evidence that still needs to be uploaded or matched. You can skip uncertain answers and come back later.</small>
      </div>
      <div class="az-progress-panel" aria-label="Checker progress">
        <strong>Step ${step} of ${sections.length}</strong>
        <span>${completeSections}/11 sections mostly complete</span>
        <small>${remainingAnswers} answers can still be checked later. Progress is a guide, not a legal approval.</small>
        <div class="az-progress-track"><span style="width: ${progress}%"></span></div>
      </div>
    </div>
  `;
}

function renderAzSectionRail() {
  const sections = activeAzSections();
  return `
    <nav class="az-section-rail" aria-label="A-Z checker sections">
      ${sections.map((section) => `
        <button type="button" class="${section.id === activeAzSection().id ? "is-active" : ""}" data-az-section="${escapeHtml(section.id)}">
          <span class="az-section-icon" data-az-icon="${escapeHtml(section.icon)}"></span>
          <span>${escapeHtml(section.title)}</span>
          <strong>${section.completion}%</strong>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderAzScenarioPills() {
  return `
    <div class="az-scenario-pills" aria-label="Checker scenario">
      ${Object.entries(azScenarioLabels).map(([key, label]) => `
        <button type="button" class="${key === labsState.azScenario ? "is-active" : ""}" data-az-scenario-button="${escapeHtml(key)}">${escapeHtml(label)}</button>
      `).join("")}
    </div>
  `;
}

function renderAzEditControl(card, currentValue) {
  if (card.control === "select") {
    const selectedValue = azSelectInitialValue(card, currentValue);
    return `
      <label class="az-edit-field">
        <span>${escapeHtml(card.label)}</span>
        <select data-az-edit-value>
          ${(card.options || []).map((option) => `<option value="${escapeHtml(option)}" ${option === selectedValue ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (card.control === "date") {
    return `
      <label class="az-edit-field">
        <span>${escapeHtml(card.label)}</span>
        <input type="date" value="${escapeHtml(azInputSafeDate(currentValue))}" data-az-edit-value>
      </label>
    `;
  }

  if (card.control === "range") {
    const rangeValue = azRangeInitialValue(card, currentValue);
    return `
      <label class="az-edit-field">
        <span>${escapeHtml(card.label)}</span>
        <input type="range" min="${card.min || 0}" max="${card.max || 10}" value="${rangeValue}" data-az-edit-value data-az-range-card="${escapeHtml(card.id)}">
        <strong class="az-range-live" data-az-live-value>${escapeHtml(formatAzRangeValue(card, rangeValue))}</strong>
      </label>
    `;
  }

  if (card.control === "upload") {
    return `
      <div class="az-upload-prompt">
        <strong>Upload or link evidence</strong>
        <span>This simulated upload tells CMP there is more proof to organise. Existing upload hooks elsewhere in Labs remain unchanged.</span>
      </div>
    `;
  }

  if (card.control === "note") {
    return `
      <label class="az-edit-field">
        <span>${escapeHtml(card.label)}</span>
        <textarea rows="3" data-az-edit-value placeholder="Add a short note for CMP to use in the evidence pack">${currentValue !== card.value ? escapeHtml(currentValue) : ""}</textarea>
      </label>
    `;
  }

  return `
    <div class="az-choice-stack" role="group" aria-label="${escapeHtml(card.label)}">
      ${(card.options || ["Yes", "No", "Not sure", "N/A"]).map((option) => `
        <button type="button" data-az-card-option="${escapeHtml(option)}" data-az-section-id="${escapeHtml(card.sectionId)}" data-az-card-id="${escapeHtml(card.id)}">${escapeHtml(option)}</button>
      `).join("")}
    </div>
  `;
}

function renderAzCard(card) {
  const value = checkerAnswer(card.sectionId, card.id, card.value);
  const isEditing = labsState.editingCheckerCard === `${card.sectionId}:${card.id}`;
  const isRecorded = value !== card.value;

  if (isEditing) {
    return `
      <article class="az-check-card is-editing" data-az-card="${escapeHtml(card.id)}">
        <div class="az-card-topline">
          <span>${escapeHtml(card.eyebrow)}</span>
          <button type="button" data-az-card-cancel>Cancel</button>
        </div>
        <h4>${escapeHtml(card.label)}</h4>
        ${renderAzEditControl(card, value)}
        <p>${escapeHtml(card.helper || "Record what you know now. CMP can keep unanswered items open for later.")}</p>
        ${card.control === "choice" ? "" : `
          <button class="az-edit-done" type="button" data-az-card-done data-az-section-id="${escapeHtml(card.sectionId)}" data-az-card-id="${escapeHtml(card.id)}">Done</button>
        `}
      </article>
    `;
  }

  return `
    <article class="az-check-card">
      <div class="az-card-topline">
        <span>${escapeHtml(card.eyebrow)}</span>
        ${isRecorded ? "<strong>Recorded</strong>" : ""}
      </div>
      <h4>${escapeHtml(card.label)}</h4>
      <p class="az-card-value">${escapeHtml(value)}</p>
      <p>${escapeHtml(card.source)}</p>
      <button type="button" data-az-edit-card="${escapeHtml(card.id)}" data-az-section-id="${escapeHtml(card.sectionId)}">${escapeHtml(isRecorded ? "Change" : card.action)}</button>
    </article>
  `;
}

function renderAzCards(sectionId, property) {
  return `
    <div class="az-card-grid">
      ${azCardsForSection(sectionId, property).map(renderAzCard).join("")}
    </div>
  `;
}

function renderAzSectionNav() {
  const index = activeAzSectionIndex();
  const sections = activeAzSections();
  const previous = sections[Math.max(0, index - 1)];
  const next = sections[Math.min(sections.length - 1, index + 1)];

  return `
    <div class="az-step-nav">
      <button class="secondary-button" type="button" data-az-prev ${index === 0 ? "disabled" : ""}>Previous</button>
      <span>${index + 1} / ${sections.length}</span>
      <button class="primary-button" type="button" data-az-next ${index === sections.length - 1 ? "disabled" : ""}>Next</button>
      <small>${escapeHtml(previous.title)} / ${escapeHtml(next.title)}</small>
    </div>
  `;
}

function renderAzOutputPanel(property) {
  const priorities = scenarioPriorityList(labsState.azScenario, property);
  const detail = activeScenarioDetail();
  const scope = checkerScopeKey();
  const pulse = labsState.scorePulse?.scope === scope ? labsState.scorePulse : null;
  const compliance = effectiveComplianceScore(property);
  const evidence = effectiveEvidenceScore(property);

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    return `
      <aside class="az-output-panel">
        <p class="section-kicker">Checker output</p>
        <h3>${escapeHtml(summary.readinessLabel)}</h3>
        <p class="az-score-explainer">${escapeHtml(summary.statusLine)}</p>
        <div class="score-pair-grid">
          <article class="score-card ${scoreClass(summary.profileSetupScore)} is-compact">
            <div><span>Profile setup</span><strong>${summary.profileSetupScore}%</strong></div>
            <div class="score-meter"><span style="width: ${summary.profileSetupScore}%"></span></div>
            <small>${escapeHtml(summary.profileSetupHelp)}</small>
          </article>
          <article class="score-card ${scoreClass(summary.evidenceConfidenceScore)} is-compact">
            <div><span>Evidence confidence</span><strong>${summary.evidenceConfidenceScore}%</strong></div>
            <div class="score-meter"><span style="width: ${summary.evidenceConfidenceScore}%"></span></div>
            <small>${escapeHtml(summary.evidenceConfidenceHelp)}</small>
          </article>
        </div>
        <p class="az-score-note">Prepared data is useful starting context, not legal verification.</p>
        <dl>
          <div><dt>What CMP found</dt><dd>${escapeHtml(summary.findingsConfirmed ? "Address, EPC starting signal, property type and local-check context confirmed" : "Address matched, EPC prepared for review, workspace created, postcode ready for local checks")}</dd></div>
          <div><dt>Confirm next</dt><dd>${escapeHtml(summary.needsAnswer.join(", ") || "Core setup answers are confirmed")}</dd></div>
          <div><dt>Documents not uploaded</dt><dd>${escapeHtml(summary.missingEvidence.join(", ") || "Core documents uploaded for review")}</dd></div>
          <div><dt>Recommended next step</dt><dd>${escapeHtml(summary.primaryTaskTitle)}</dd></div>
        </dl>
        <button class="secondary-button" type="button" data-az-ask>Ask CMP to explain</button>
      </aside>
    `;
  }

  return `
    <aside class="az-output-panel">
      <p class="section-kicker">Checker output</p>
      <h3>${escapeHtml(azStatusForProperty(property))}</h3>
      <p class="az-score-explainer">This panel translates your answers and stored proof into a practical next-step view.</p>
      <div class="score-pair-grid">
        <article class="score-card ${scoreClass(compliance)} is-compact${pulse?.compliance ? " is-pulsing" : ""}">
          <div><span>Compliance score</span><strong>${compliance}%</strong></div>
          <div class="score-meter"><span style="width: ${compliance}%"></span></div>
          <small>How ready this property looks for the selected scenario.</small>
          ${pulse?.compliance ? `<em>+${pulse.compliance} readiness</em>` : ""}
        </article>
        <article class="score-card ${scoreClass(evidence)} is-compact${pulse?.evidence ? " is-pulsing" : ""}">
          <div><span>Evidence score</span><strong>${evidence}%</strong></div>
          <div class="score-meter"><span style="width: ${evidence}%"></span></div>
          <small>How much supporting proof CMP can currently see.</small>
          ${pulse?.evidence ? `<em>+${pulse.evidence} evidence</em>` : ""}
        </article>
      </div>
      <p class="az-score-note">A property can still have evidence missing even when some answers are complete.</p>
      <dl>
        <div><dt>Scenario focus</dt><dd>${escapeHtml(detail.action)}</dd></div>
        <div><dt>Checks CMP is prioritising</dt><dd>${escapeHtml(priorities.slice(0, 3).join(", "))}</dd></div>
        <div><dt>Proof CMP still needs</dt><dd>${property.missingEvidence.length ? escapeHtml(property.missingEvidence.join(", ")) : "No obvious proof gaps"}</dd></div>
        <div><dt>Recommended next step</dt><dd>${escapeHtml(property.recommendedService || "No service needed")}</dd></div>
      </dl>
      <button class="secondary-button" type="button" data-az-ask>Ask CMP to explain</button>
    </aside>
  `;
}

function renderSingleAzCheck(properties) {
  const property = azSelectedProperty();
  const section = activeAzSection();
  const isNewSetup = isNewPropertyMode();

  return `
    <div class="az-workspace-shell">
      ${renderAzProgressHeader({ property, modeLabel: `Single property · ${property.address}` })}
      <div class="az-control-strip">
        ${renderAzPropertySelector(properties)}
        ${isNewSetup ? "" : renderAzScenarioSelector()}
      </div>
      ${isNewSetup ? renderNewPropertyAzIntro() : `${renderAzScenarioPills()}${renderScenarioClarityPanel("single")}`}
      <div class="az-workspace-grid">
        ${renderAzSectionRail()}
        <main class="az-active-panel">
          <div class="az-current-heading">
            <p class="section-kicker">Current section</p>
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.description)}</p>
            <div class="az-scenario-context">
              <strong>${isNewSetup ? "Why this comes now" : "Why this section matters now"}</strong>
              <span>${escapeHtml(isNewSetup ? newPropertySectionContext(section) : scenarioPriorityCopy(property))}</span>
            </div>
          </div>
          ${renderAnswerEvidenceGuide()}
          ${renderAzCards(section.id, property)}
          ${renderAzSectionNav()}
        </main>
        ${renderAzOutputPanel(property)}
      </div>
    </div>
  `;
}

const portfolioSweepStages = [
  {
    id: "scope",
    eyebrow: "1",
    title: "Scope",
    help: "Confirm properties, scenario and evidence source.",
    outcome: "You know exactly what CMP is about to check."
  },
  {
    id: "shared",
    eyebrow: "2",
    title: "Shared answers",
    help: "Answer portfolio-wide questions once.",
    outcome: "Global answers are applied before exceptions are reviewed."
  },
  {
    id: "exceptions",
    eyebrow: "3",
    title: "Property exceptions",
    help: "Review only differences and uncertain cells.",
    outcome: "You can see why each property needs manual attention."
  },
  {
    id: "results",
    eyebrow: "4",
    title: "Results",
    help: "Turn findings into next actions.",
    outcome: "You leave with a short action list, not a spreadsheet."
  }
];

function activePortfolioSweepStageIndex() {
  return Math.max(0, portfolioSweepStages.findIndex((stage) => stage.id === labsState.portfolioSweepStage));
}

function renderPortfolioSweepStepper() {
  return `
    <div class="portfolio-sweep-stepper" aria-label="Portfolio Sweep workflow">
      ${portfolioSweepStages.map((stage) => `
        <button type="button" class="${stage.id === labsState.portfolioSweepStage ? "is-active" : ""}" data-az-sweep-stage="${escapeHtml(stage.id)}">
          <span>${escapeHtml(stage.eyebrow)}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${escapeHtml(stage.help)}</small>
          <em>${escapeHtml(stage.outcome)}</em>
        </button>
      `).join("")}
    </div>
  `;
}

function renderPortfolioSweepRail() {
  return `
    <nav class="portfolio-sweep-rail" aria-label="Portfolio Sweep stages">
      <p class="section-kicker">Sweep stages</p>
      ${portfolioSweepStages.map((stage) => `
        <button type="button" class="${stage.id === labsState.portfolioSweepStage ? "is-active" : ""}" data-az-sweep-stage="${escapeHtml(stage.id)}">
          <span>${escapeHtml(stage.eyebrow)}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${escapeHtml(stage.help)}</small>
        </button>
      `).join("")}
    </nav>
  `;
}

function portfolioSweepPropertySubtitle(property) {
  const subtitles = {
    "the-butts": "Upload or arrange EICR",
    "willow-brook": "Book or upload Gas Safety renewal evidence",
    "maple-court": "Evidence-ready",
    "canal-view": "Confirm licensing route",
    "station-road": "Run A-Z onboarding check"
  };
  return subtitles[property.id] || property.priority;
}

function renderPortfolioScopeList(properties) {
  return `
    <div class="portfolio-scope-list">
      ${properties.map((property) => `
        <article class="${effectiveComplianceScore(property) === 100 && effectiveEvidenceScore(property) === 100 ? "is-complete" : ""}">
          <div>
            <strong>${escapeHtml(property.address)}</strong>
            <span>${escapeHtml(portfolioSweepPropertySubtitle(property))}</span>
          </div>
          <small>${effectiveComplianceScore(property)}% compliance · ${effectiveEvidenceScore(property)}% evidence</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderPortfolioStagePurpose(stageId, title, body, items = []) {
  return `
    <div class="portfolio-stage-purpose is-${escapeHtml(stageId)}">
      <div>
        <p class="section-kicker">What this stage does</p>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(body)}</p>
      </div>
      ${items.length ? `
        <ul>
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      ` : ""}
    </div>
  `;
}

function renderPortfolioExceptionSummary(properties) {
  const needingEvidence = properties.filter((property) => property.missingEvidence.length);
  const licensing = properties.filter((property) => /licensing|licence/i.test(`${property.priority} ${property.focus}`));
  const complete = fullyCompliantProperties();

  return `
    <div class="portfolio-exception-summary" aria-label="Portfolio exception summary">
      <article>
        <span>Needs proof</span>
        <strong>${needingEvidence.length}</strong>
        <p>${needingEvidence.map((property) => property.address).slice(0, 2).join(", ") || "No current proof gaps"}</p>
      </article>
      <article>
        <span>Manual review</span>
        <strong>${licensing.length || 1}</strong>
        <p>Licensing, inspection or onboarding items need a landlord decision.</p>
      </article>
      <article>
        <span>Already clean</span>
        <strong>${complete.length}</strong>
        <p>${complete.map((property) => property.address).join(", ") || "No property is fully clear yet"}</p>
      </article>
    </div>
  `;
}

function renderPortfolioMatrix(properties, matrixQuestions) {
  return `
    <div class="az-matrix-wrap portfolio-exceptions-table">
      <div class="az-matrix-toolbar">
        <span>Exception matrix</span>
        <small>Green means clear enough for now. Amber means confirm. Red means proof or support is needed.</small>
      </div>
      <table class="az-property-matrix">
        <thead>
          <tr>
            <th>Property</th>
            ${matrixQuestions.map((question) => `<th>${question}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${properties.map((property) => `
            <tr>
              <th>
                <strong>${escapeHtml(property.address)}</strong>
                <span>${escapeHtml(portfolioSweepPropertySubtitle(property))}</span>
              </th>
              ${matrixQuestions.map((question) => {
                const lower = question.toLowerCase();
                const missing = property.missingEvidence.some((gap) => gap.toLowerCase().includes(lower) || (lower === "eicr" && gap.toLowerCase().includes("electrical")));
                const fallback = effectiveComplianceScore(property) === 100 && effectiveEvidenceScore(property) === 100 ? "Yes" : missing ? "No" : property.id === "canal-view" && lower === "licensing" ? "Unsure" : "Yes";
                const answer = checkerAnswer("portfolio-matrix", `${property.id}-${lower}`, fallback);
                return `<td><button class="az-answer ${answer.toLowerCase().replace("/", "a")}" type="button" data-az-answer data-az-section-id="portfolio-matrix" data-az-card-id="${escapeHtml(property.id)}-${escapeHtml(lower)}">${escapeHtml(answer)}</button></td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPortfolioNextActions() {
  return `
    <ol class="portfolio-next-actions">
      <li>
        <div><strong>57 The Butts</strong><span>Proof gap: upload EICR or arrange an inspection.</span></div>
        <button class="secondary-button" type="button" data-compliance-action="uploadEicr">Upload EICR</button>
      </li>
      <li>
        <div><strong>18 Willow Brook Drive</strong><span>Renewal gap: gas safety evidence expires soon.</span></div>
        <button class="secondary-button" type="button" data-compliance-action="requestGasSupport">Book Gas Safety</button>
      </li>
      <li>
        <div><strong>9 Canal View</strong><span>Manual review: confirm the licensing route.</span></div>
        <button class="secondary-button" type="button" data-compliance-action="reviewLicensing">Review licensing</button>
      </li>
      <li>
        <div><strong>3 Station Road</strong><span>Setup gap: complete onboarding answers and upload baseline documents.</span></div>
        <button class="secondary-button" type="button" data-compliance-action="azSingle:station-road">Continue onboarding</button>
      </li>
    </ol>
  `;
}

function renderPortfolioSweepNav() {
  const index = activePortfolioSweepStageIndex();
  const previous = portfolioSweepStages[Math.max(0, index - 1)];
  const next = portfolioSweepStages[Math.min(portfolioSweepStages.length - 1, index + 1)];

  return `
    <div class="az-step-nav portfolio-sweep-nav">
      <button class="secondary-button" type="button" data-az-sweep-prev ${index === 0 ? "disabled" : ""}>Previous</button>
      <span>${index + 1} / ${portfolioSweepStages.length}</span>
      <button class="primary-button" type="button" data-az-sweep-next ${index === portfolioSweepStages.length - 1 ? "disabled" : ""}>Next</button>
      <small>${escapeHtml(previous.title)} / ${escapeHtml(next.title)}</small>
    </div>
  `;
}

function renderPortfolioAzSweep(properties) {
  const selected = properties.filter((property) => effectiveComplianceScore(property) < 100 || effectiveEvidenceScore(property) < 100);
  const matrixQuestions = ["Gas", "EICR", "Alarms", "Tenancy docs", "Licensing", "Inspection"];
  const property = azSelectedProperty();
  const pulse = labsState.scorePulse?.scope === "portfolio" ? labsState.scorePulse : null;
  const sharedCards = [
    azCard("portfolio-shared", { id: "england-wales", eyebrow: "Shared answer", label: "All properties are in England/Wales", value: "Yes", source: "Portfolio setup", action: "Edit", helper: "Apply this answer once instead of repeating it for every property." }),
    azCard("portfolio-shared", { id: "same-process", eyebrow: "Shared answer", label: "Same letting process used", value: "Yes", source: "Landlord process", action: "Edit", helper: "CMP can apply this across the sweep and only ask where property-specific differences appear." }),
    azCard("portfolio-shared", { id: "central-docs", eyebrow: "Shared answer", label: "Tenancy documents managed centrally", value: "Yes", source: "Evidence workflow", action: "Edit" }),
    azCard("portfolio-shared", { id: "scan-evidence", eyebrow: "Shared answer", label: "Check evidence from uploaded documents", value: "Only where evidence exists", source: "Evidence Vault", action: "Edit", control: "select", options: ["Yes", "No", "Only where evidence exists", "Ask me first"] })
  ];

  return `
    <div class="az-workspace-shell portfolio-sweep-shell">
      <header class="portfolio-sweep-hero">
        <div>
          <p class="section-kicker">Portfolio Sweep</p>
          <h3>Check common answers once. Review only the properties that differ.</h3>
          <p>Portfolio Sweep is for landlords with more than one property. CMP applies shared answers first, then separates property-specific exceptions from proof gaps.</p>
        </div>
        <div class="portfolio-sweep-summary" aria-label="Portfolio Sweep summary">
          <span>${properties.length} properties selected</span>
          <span>${fullyCompliantProperties().length} evidence-ready</span>
          <span>${selected.length} need review</span>
          <span>${portfolioUrgentActionCount()} top actions</span>
          <span>${portfolioEvidenceGapCount()} evidence gaps</span>
        </div>
      </header>
      <div class="az-control-strip">
        ${renderAzScenarioSelector()}
        <button class="secondary-button" type="button" data-az-apply-all>Apply shared answers to all</button>
        <button class="text-button" type="button" data-az-copy-first>Copy from 24 Maple Court</button>
      </div>
      ${renderAzScenarioPills()}
      ${renderScenarioClarityPanel("portfolio")}
      ${renderPortfolioSweepStepper()}
      <div class="az-workspace-grid is-portfolio">
        ${renderPortfolioSweepRail()}
        <main class="az-active-panel portfolio-sweep-main">
          <section class="portfolio-sweep-stage ${labsState.portfolioSweepStage === "scope" ? "is-active" : ""}" data-sweep-stage-panel="scope">
            <div class="az-current-heading">
              <p class="section-kicker">Stage 1 · Scope</p>
              <h3>Confirm what CMP is checking</h3>
              <p>Start by confirming the property set, the selected scenario and whether uploaded evidence should influence the sweep.</p>
            </div>
            ${renderPortfolioStagePurpose("scope", "Set the rules before CMP checks anything", "This stage defines the sweep boundary. It does not ask certificate questions yet; it confirms what is included and what evidence CMP should trust.", [
              `${properties.length} properties included`,
              `${azScenarioLabels[labsState.azScenario]} scenario selected`,
              "Uploaded evidence will be used where available"
            ])}
            <div class="portfolio-scope-card">
              <strong>Selected sweep set</strong>
              <span>${escapeHtml(azScenarioLabels[labsState.azScenario])} · Use stored evidence where available · Keep unknown answers open</span>
              <div class="portfolio-scope-controls" aria-label="Portfolio Sweep scope controls">
                <button class="is-active" type="button">All properties</button>
                <button type="button">Only properties needing review</button>
                <button type="button">Select properties</button>
                <button type="button">Only missing evidence</button>
              </div>
            </div>
            ${renderPortfolioScopeList(properties)}
          </section>

          <section class="portfolio-sweep-stage ${labsState.portfolioSweepStage === "shared" ? "is-active" : ""}" data-sweep-stage-panel="shared">
            <div class="az-current-heading">
              <p class="section-kicker">Stage 2 · Shared answers</p>
              <h3>Answer shared questions once</h3>
              <p>Use this for answers that are true across the selected portfolio. Property-specific exceptions are handled in the next stage.</p>
            </div>
            ${renderPortfolioStagePurpose("shared", "Global answers, not property exceptions", "The cards below are deliberately portfolio-wide. If one property differs, leave the shared answer broad and handle the exception in Stage 3.", [
              "Applies across the selected properties",
              "Reduces repeated landlord questions",
              "Does not mark missing documents as uploaded"
            ])}
            <div class="portfolio-sweep-helper-card">
              <strong>Answer once. CMP only asks again where a property differs.</strong>
              <span>Missing answer means CMP needs landlord input. Missing evidence means CMP needs proof stored in the Evidence Vault.</span>
            </div>
            ${renderAnswerEvidenceGuide()}
            <div class="portfolio-sweep-controls">
              <button class="secondary-button" type="button" data-az-apply-all>Apply shared answers to all</button>
              <button class="secondary-button" type="button" data-az-copy-first>Copy answers from 24 Maple Court</button>
              <button class="text-button" type="button" data-az-apply-all>Only ask where unknown</button>
            </div>
            <div class="az-card-grid is-shared">
              ${sharedCards.map(renderAzCard).join("")}
            </div>
          </section>

          <section class="portfolio-sweep-stage ${labsState.portfolioSweepStage === "exceptions" ? "is-active" : ""}" data-sweep-stage-panel="exceptions">
            <div class="az-current-heading">
              <p class="section-kicker">Stage 3 · Property exceptions</p>
              <h3>Property-specific exceptions</h3>
              <p>This is the only stage that behaves like a matrix. Review where one property differs, has a proof gap, or needs a manual decision.</p>
            </div>
            ${renderPortfolioStagePurpose("exceptions", "Focus on differences, not everything", "A property appears here because CMP found a missing document, an uncertain answer, a licensing watch item or a setup gap.", [
              "Green cells are already clear enough for this prototype",
              "Amber cells need a landlord answer or date check",
              "Red cells need proof or service support"
            ])}
            ${renderPortfolioExceptionSummary(properties)}
            ${renderPortfolioMatrix(properties, matrixQuestions)}
          </section>

          <section class="portfolio-sweep-stage ${labsState.portfolioSweepStage === "results" ? "is-active" : ""}" data-sweep-stage-panel="results">
            <div class="az-current-heading">
              <p class="section-kicker">Stage 4 · Results and actions</p>
              <h3>Portfolio results and next best actions</h3>
              <p>This stage concludes the sweep. It turns answers and evidence gaps into a short, practical action list.</p>
            </div>
            ${renderPortfolioStagePurpose("results", "The sweep ends with decisions", "CMP keeps the output short: what looks ready, what needs proof, what needs a service, and what can wait.", [
              "Compliance score shows scenario readiness",
              "Evidence score shows stored proof",
              "Next actions are grouped by property"
            ])}
            <div class="az-results-grid portfolio-results-grid">
              <article class="${pulse?.compliance ? "is-pulsing" : ""}">
                <span>Portfolio compliance score</span>
                <strong>${portfolioComplianceScore()}%</strong>
                <p>${fullyCompliantProperties().length} property evidence-ready. ${selected.length} properties need review for ${escapeHtml(azScenarioLabels[labsState.azScenario]).toLowerCase()}.${pulse?.compliance ? ` +${pulse.compliance} readiness recorded.` : ""}</p>
              </article>
              <article class="${pulse?.evidence ? "is-pulsing" : ""}">
                <span>Portfolio evidence score</span>
                <strong>${portfolioEvidenceScore()}%</strong>
                <p>${portfolioEvidenceGapCount()} evidence gaps across the portfolio.${pulse?.evidence ? ` +${pulse.evidence} evidence context.` : ""}</p>
              </article>
              <article>
                <span>Top actions</span>
                <strong>${portfolioUrgentActionCount()}</strong>
                <p>Upload or arrange EICR; book or upload Gas Safety renewal evidence; confirm licensing route.</p>
              </article>
              <article>
                <span>Report summary preview</span>
                <strong>Ready</strong>
                <p>Download/export placeholder only. No legal advice or official approval is implied.</p>
              </article>
            </div>
            <div class="portfolio-next-actions-panel">
              <h4>Next best actions</h4>
              ${renderPortfolioNextActions()}
            </div>
          </section>

          ${renderPortfolioSweepNav()}
        </main>
      </div>
    </div>
  `;
}

function renderAzChecker() {
  const body = document.querySelector("[data-az-checker-body]");
  if (!body) {
    return;
  }

  const properties = getPortfolioProperties();
  const isEmpty = !properties.length;
  const isNewSetup = isNewPropertyMode();
  if ((isEmpty || isNewSetup) && labsState.azMode === "portfolio") {
    labsState.azMode = "single";
  }

  const modeToggle = document.querySelector(".az-mode-toggle");
  if (modeToggle) {
    modeToggle.hidden = isNewSetup;
  }

  document.querySelectorAll("[data-az-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.azMode === labsState.azMode);
    if (button.dataset.azMode === "portfolio") {
      button.hidden = isEmpty || isNewSetup;
      button.disabled = isEmpty || isNewSetup;
      button.setAttribute("aria-disabled", String(isEmpty || isNewSetup));
    } else {
      button.hidden = false;
      button.disabled = false;
      button.removeAttribute("aria-disabled");
    }
  });

  const checkerTitle = document.querySelector(".az-checker-header h2");
  if (checkerTitle) {
    checkerTitle.textContent = isNewSetup
      ? "Review CMP findings"
      : "A guided check for answers, evidence and next steps.";
  }
  const checkerIntro = document.querySelector(".az-checker-header h2 + p");
  if (checkerIntro) {
    checkerIntro.textContent = isEmpty
      ? "Add your first property to run the A-Z checker. You can preview the question structure before setup."
      : isNewSetup
      ? "CMP has already matched a few starting details. Confirm or correct them before continuing into the guided compliance check."
      : "Use Single property for one address, or Portfolio sweep to answer shared questions once and only review exceptions. Prototype readiness logic only — this is not legal advice.";
  }

  if (isEmpty) {
    body.innerHTML = `
      <div class="az-workspace-shell is-empty">
        <div class="az-product-header">
          <div class="az-product-header-copy">
            <p class="section-kicker">A-Z Compliance Check</p>
            <h3>Add your first property to run the A-Z checker.</h3>
            <p>Preview the checker structure, ask CMP what to prepare, then add a property for personalised scores.</p>
          </div>
          <div class="az-progress-panel">
            <strong>Preview mode</strong>
            <span>0 properties connected</span>
            <small>Preview structure only. No property-specific compliance or evidence score is available yet.</small>
          </div>
        </div>
        <div class="az-empty-preview">
          ${renderAzSectionRail()}
          <article class="empty-portfolio-card">
            <span class="tile-icon" data-icon="shield"></span>
            <h3>Preview the checker structure</h3>
            <p>CMP will ask for property basics, certificates, tenancy/deposit evidence, licensing answers, inspections and evidence-pack goals.</p>
            <div class="az-card-grid">
              ${[
                azCard("empty-preview", { id: "property", eyebrow: "Setup needed", label: "Property basics", value: "Add address, type, bedrooms and occupancy", source: "Setup needed", action: "Add" }),
                azCard("empty-preview", { id: "certificates", eyebrow: "Evidence", label: "Existing certificates", value: "Upload EPC, Gas Safety, EICR and alarm evidence", source: "Evidence Vault", action: "Upload", control: "upload" }),
                azCard("empty-preview", { id: "goal", eyebrow: "Journey", label: "What are you trying to do?", value: "Let, renew, check a portfolio or build an evidence pack", source: "Journey context", action: "Edit", control: "select", options: Object.values(azScenarioLabels) })
              ].map(renderAzCard).join("")}
            </div>
            <div class="button-row">
              <button class="primary-button" type="button" data-properties-add>Add first property</button>
              <button class="secondary-button" type="button" data-az-ask>Ask CMP what to prepare</button>
            </div>
          </article>
        </div>
      </div>
    `;
    hydrateIcons();
    return;
  }

  if (isNewSetup) {
    body.innerHTML = `
      ${renderNewPropertySetupSummary()}
      ${labsState.newPropertyCheckerExpanded ? `
        <section class="new-property-expanded-check" data-new-guided-check-panel aria-label="Guided compliance check">
          ${renderSingleAzCheck(properties)}
        </section>
      ` : ""}
    `;
    hydrateIcons();
    return;
  }

  body.innerHTML = labsState.azMode === "portfolio"
    ? renderPortfolioAzSweep(properties)
    : renderSingleAzCheck(properties);
  hydrateIcons();
}

function showPortfolioCompliance({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-compliance]",
    view: "complianceCentre",
    navLabel: "Compliance centre",
    bodyClass: "portfolio-compliance-active",
    response: getComplianceCentreAssistantResponse("What should I fix first?"),
    scroll
  });
}

function getEvidenceRows() {
  if (isNewPropertyMode()) {
    return newPropertyEvidenceRows();
  }

  const rows = [
    {
      id: "epc",
      title: "EPC",
      document: "Energy Performance Certificate",
      propertyId: "the-butts",
      property: "57 The Butts · CV1 3BJ",
      source: "Official record",
      sourceClass: "status-good-text",
      status: "Confirmed",
      statusClass: "status-good-text",
      keyDate: "Expires 14 March 2031",
      filters: ["verified", "official"],
      search: "epc energy performance certificate 57 butts official confirmed",
      actions: [
        { label: "View", action: "viewEpc" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    {
      id: "gas",
      title: "Gas Safety",
      document: "Gas Safety Certificate",
      propertyId: "the-butts",
      property: "57 The Butts · CV1 3BJ",
      source: "Uploaded document",
      sourceClass: "status-good-text",
      status: "Verified",
      statusClass: "status-good-text",
      keyDate: "Expires 18 June 2027",
      filters: ["verified", "uploaded"],
      search: "gas safety certificate 57 butts uploaded verified",
      actions: [
        { label: "View", action: "viewGas" },
        { label: "Replace", action: "replaceGas" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    {
      id: "eicr",
      title: "EICR",
      document: "Electrical Installation Condition Report",
      propertyId: "the-butts",
      property: "57 The Butts · CV1 3BJ",
      source: labsState.eicrAdded ? "Uploaded document" : "No evidence uploaded",
      sourceClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      status: labsState.eicrAdded ? "Verified" : "Missing",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      keyDate: labsState.eicrAdded ? "Review date 11 May 2031" : "Review date unknown",
      filters: labsState.eicrAdded ? ["verified", "uploaded"] : ["missing", "review"],
      search: `eicr electrical installation condition report electrical 57 butts ${labsState.eicrAdded ? "uploaded verified" : "missing no evidence needs review"}`,
      actions: labsState.eicrAdded
        ? [
            { label: "View", action: "viewEicr" },
            { label: "Replace", action: "replaceEicr" },
            { label: "Open property", action: "openProperty" }
          ]
        : [
            { label: "Upload", action: "uploadEicr", primary: true },
            { label: "Arrange EICR", action: "arrangeEicr" },
            { label: "Open property", action: "openProperty" }
          ]
    },
    {
      id: "inspection",
      title: "Inspection evidence",
      document: "Property inspection record",
      propertyId: "the-butts",
      property: "57 The Butts · CV1 3BJ",
      source: "No evidence uploaded",
      sourceClass: "status-review-text",
      status: "Missing",
      statusClass: "status-review-text",
      keyDate: "No recent record",
      filters: ["missing"],
      search: "inspection property inspection record 57 butts missing no evidence",
      actions: [
        { label: "Upload", action: "uploadInspection", primary: labsState.eicrAdded },
        { label: "Mark not completed", action: "markInspection" },
        { label: "Open property", action: "openProperty" }
      ]
    }
  ];

  if (isTwoPropertyMode()) {
    rows.push(
      {
        id: "willow-epc",
        title: "EPC",
        document: "Energy Performance Certificate",
        propertyId: "willow-brook",
        property: "18 Willow Brook Drive · B37 7BA",
        source: "Official record",
        sourceClass: "status-good-text",
        status: "Confirmed",
        statusClass: "status-good-text",
        keyDate: "Valid until 2030",
        filters: ["verified", "official"],
        search: "epc energy performance certificate 18 willow brook drive b37 official confirmed valid 2030",
        actions: [
          { label: "View", action: "viewEpc" },
          { label: "Open preview", action: "openWillowProperty" }
        ]
      },
      {
        id: "willow-gas",
        title: "Gas Safety",
        document: "Gas Safety Certificate",
        propertyId: "willow-brook",
        property: "18 Willow Brook Drive · B37 7BA",
        source: "Uploaded document",
        sourceClass: "status-watch-text",
        status: "Expiring soon",
        statusClass: "status-watch-text",
        keyDate: "Renewal needed in 21 days",
        filters: ["verified", "uploaded", "review"],
        search: "gas safety certificate 18 willow brook drive b37 uploaded expiring soon renewal needed 21 days",
        actions: [
          { label: "Upload renewal", action: "uploadGas", primary: true },
          { label: "Request support", action: "arrangeGas" },
          { label: "Open preview", action: "openWillowProperty" }
        ]
      },
      {
        id: "willow-eicr",
        title: "EICR",
        document: "Electrical Installation Condition Report",
        propertyId: "willow-brook",
        property: "18 Willow Brook Drive · B37 7BA",
        source: "Uploaded document",
        sourceClass: "status-good-text",
        status: "Verified",
        statusClass: "status-good-text",
        keyDate: "Valid until 2029",
        filters: ["verified", "uploaded"],
        search: "eicr electrical installation condition report 18 willow brook drive b37 verified uploaded valid 2029",
        actions: [
          { label: "View", action: "viewEicr" },
          { label: "Open preview", action: "openWillowProperty" }
        ]
      },
      {
        id: "willow-inspection",
        title: "Inspection evidence",
        document: "Property inspection record",
        propertyId: "willow-brook",
        property: "18 Willow Brook Drive · B37 7BA",
        source: "No evidence uploaded",
        sourceClass: "status-review-text",
        status: "Missing",
        statusClass: "status-review-text",
        keyDate: "No recent record",
        filters: ["missing"],
        search: "inspection property inspection record 18 willow brook drive b37 missing no evidence",
        actions: [
          { label: "Upload", action: "uploadInspection" },
          { label: "Open preview", action: "openWillowProperty" }
        ]
      },
      {
        id: "willow-tenancy",
        title: "Deposit and tenancy",
        document: "Tenancy document evidence",
        propertyId: "willow-brook",
        property: "18 Willow Brook Drive · B37 7BA",
        source: "Landlord confirmed",
        sourceClass: "status-watch-text",
        status: "Evidence not uploaded",
        statusClass: "status-watch-text",
        keyDate: "No document stored",
        filters: ["missing", "review"],
        search: "deposit tenancy document landlord confirmed evidence not uploaded 18 willow brook drive b37",
        actions: [
          { label: "Upload", action: "uploadTenancy" },
          { label: "Open preview", action: "openWillowProperty" }
        ]
      }
    );
  }

  if (isFivePropertyMode()) {
    portfolioFivePropertyDefinitions.forEach((property) => {
      rows.push({
        id: `${property.id}-summary`,
        title: property.complianceScore === 100 ? "Full compliance evidence pack" : property.focus,
        document: property.missingEvidence.length ? property.missingEvidence.join(", ") : "All core evidence uploaded",
        propertyId: property.id,
        property: property.label || `${property.address} · ${property.postcode}`,
        source: property.evidenceScore === 100 ? "Complete evidence pack" : "Mixed evidence",
        sourceClass: property.evidenceScore === 100 ? "status-good-text" : "status-watch-text",
        status: property.complianceScore === 100 ? "Evidence-ready" : property.state,
        statusClass: property.complianceScore === 100 ? "status-good-text" : property.complianceScore < 60 ? "status-review-text" : "status-watch-text",
        keyDate: property.complianceScore === 100 ? "No action due" : property.priority,
        filters: property.evidenceScore === 100 ? ["verified", "uploaded"] : ["missing", "review"],
        search: property.search,
        actions: [
          { label: "Run A-Z", action: `az:${property.id}` },
          { label: "Service path", action: `service:${property.id}` }
        ]
      });
    });
  }

  return rows;
}

function evidenceMatchesCurrentView(row) {
  const query = labsState.evidenceSearch.trim().toLowerCase();
  const matchesSearch = !query || `${row.title} ${row.document} ${row.property} ${row.source} ${row.status} ${row.keyDate} ${row.search}`.toLowerCase().includes(query);
  const matchesFilter = labsState.evidenceFilter === "all" || row.filters.includes(labsState.evidenceFilter);
  const matchesProperty = labsState.evidencePropertyFilter === "all" || row.propertyId === labsState.evidencePropertyFilter;

  return matchesSearch && matchesFilter && matchesProperty;
}

function renderEvidenceRow(row) {
  const actions = row.actions.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${action.action}">
      ${escapeHtml(action.label)}
    </button>
  `).join("");

  return `
    <article class="evidence-row" data-evidence-row="${escapeHtml(row.id)}">
      <div>
        <h3>${escapeHtml(row.title)}</h3>
        <p>${escapeHtml(row.document)}</p>
      </div>
      <div class="evidence-row-meta"><span>Property</span><strong>${escapeHtml(row.property)}</strong></div>
      <div class="evidence-pill-stack"><span class="matrix-pill ${row.sourceClass}">${escapeHtml(row.source)}</span></div>
      <div class="evidence-pill-stack"><span class="matrix-pill ${row.statusClass}">${escapeHtml(row.status)}</span></div>
      <div class="evidence-row-date"><span>Date</span><small>${escapeHtml(row.keyDate)}</small></div>
      <div class="evidence-row-actions">${actions}</div>
    </article>
  `;
}

function journeyEvidenceRowsForVault() {
  const state = journeyState();
  const address = state.propertyBrain.PropertyIdentity.address;
  const uploaded = (state.evidenceVault || []).map((item) => ({
    id: item.id,
    title: item.title,
    document: `${item.fakeScanResult || item.uploadStatus} · ${item.linkedComplianceArea}`,
    propertyId: "the-butts",
    property: address,
    source: item.addressMatch || "Journey OS scanner",
    sourceClass: item.reviewStatus === "accepted" ? "status-good-text" : item.reviewStatus === "rejected" ? "status-review-text" : "status-watch-text",
    status: serviceLifecycleLabel(item.reviewStatus || item.uploadStatus || "recommended"),
    statusClass: item.reviewStatus === "accepted" ? "status-good-text" : item.reviewStatus === "rejected" ? "status-review-text" : "status-watch-text",
    keyDate: item.expiryDate || item.extractedDate || "Unknown",
    filters: [item.reviewStatus === "accepted" ? "uploaded" : "review", "review"],
    search: `${item.title} ${item.linkedComplianceArea} ${address}`,
    actions: [
      { label: "Open evidence tab", action: "journeyEvidence", primary: true },
      ...(item.linkedServiceId ? [{ label: "View linked service", action: `journeyService:${item.linkedServiceId}` }] : []),
      { label: "Ask CMP", action: "askReview" }
    ]
  }));
  const missing = (state.actionPlan.missingEvidence || []).map((action) => ({
    id: `missing-${action.id}`,
    title: action.title,
    document: action.body,
    propertyId: "the-butts",
    property: address,
    source: "Journey OS Property Intelligence profile",
    sourceClass: "status-review-text",
    status: action.status === "Deferred" ? "Deferred - still open" : "Missing",
    statusClass: "status-review-text",
    keyDate: "Needs upload or confirmation",
    filters: ["missing", "review"],
    search: `${action.title} ${action.body} ${address}`,
    actions: [
      { label: "Simulate upload", action: "journeyUpload", primary: true },
      { label: "Open action plan", action: "journeyActionPlan" }
    ]
  }));
  return [...uploaded, ...missing];
}

function renderJourneyEvidenceVaultBridge() {
  const rows = journeyEvidenceRowsForVault().filter(evidenceMatchesCurrentView);
  const state = journeyState();
  const uploadedCount = state.evidenceVault.filter((item) => item.reviewStatus === "accepted").length;
  const missingCount = state.actionPlan.missingEvidence?.length || 0;
  const evidenceKicker = document.querySelector("[data-portfolio-evidence] .section-kicker");
  const evidenceMissingTitle = document.querySelector("#evidenceMissingTitle");
  const evidenceMissingHeading = evidenceMissingTitle?.closest(".section-heading");
  if (evidenceKicker) evidenceKicker.textContent = "PROPERTY BRAIN EVIDENCE";
  document.querySelector("[data-evidence-upload]")?.removeAttribute("hidden");
  document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => button.setAttribute("hidden", ""));
  const evidenceAsk = document.querySelector("[data-evidence-ask]");
  if (evidenceAsk) evidenceAsk.textContent = "Ask CMP what to upload next";
  document.querySelector("[data-evidence-count-badge]").textContent = "1 active Property Intelligence profile";
  document.querySelector("[data-evidence-verified-count]").textContent = String(uploadedCount);
  document.querySelector("[data-evidence-review-count]").textContent = String(rows.length - uploadedCount);
  document.querySelector("[data-evidence-review-detail]").textContent = "Journey OS evidence state";
  document.querySelector("[data-evidence-missing-count]").textContent = String(missingCount);
  document.querySelector("[data-evidence-missing-detail]").textContent = "property-brain gaps";
  document.querySelector("[data-evidence-inbox-count]").textContent = "0";
  document.querySelector("[data-evidence-health-strength]").textContent = `${state.propertyBrain.Scores.evidenceStrengthScore}% evidence strength`;
  document.querySelector("[data-evidence-health-verified]").textContent = uploadedCount ? `${uploadedCount} accepted fake scan${uploadedCount === 1 ? "" : "s"}` : "No accepted fake scans yet";
  document.querySelector("[data-evidence-health-missing]").textContent = missingCount ? `${missingCount} missing evidence item${missingCount === 1 ? "" : "s"}` : "No missing evidence in current route";
  document.querySelector("[data-evidence-health-focus]").textContent = "Evidence Vault is reading the Journey OS Property Intelligence profile for 57 The Butts.";
  document.querySelector(".evidence-inbox-panel")?.setAttribute("hidden", "");
  document.querySelector(".evidence-toolbar")?.removeAttribute("hidden");
  document.querySelector(".evidence-lower-grid")?.setAttribute("hidden", "");
  document.querySelector("[data-evidence-missing-section]")?.removeAttribute("hidden");
  if (evidenceMissingHeading) {
    evidenceMissingHeading.querySelector(".section-kicker").textContent = "Journey OS gaps";
    evidenceMissingTitle.textContent = "What the Property Intelligence profile still needs";
    evidenceMissingHeading.querySelector("p:not(.section-kicker)").textContent = "Missing documents, weak evidence and fake scan results linked to the active property.";
  }
  const healthCard = document.querySelector(".property-evidence-health-card");
  if (healthCard) {
    healthCard.querySelector("h2").textContent = "57 The Butts evidence brain";
    healthCard.querySelector("p").textContent = `${state.propertyBrain.PropertyIdentity.address} · ${journeyRoutes[state.routeId]?.label || "Prioritised"} route`;
  }
  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceFilter === labsState.evidenceFilter);
  });
  document.querySelectorAll("[data-evidence-property-filter]").forEach((button) => {
    const propertyFilter = button.dataset.evidencePropertyFilter;
    button.hidden = propertyFilter !== "the-butts" && propertyFilter !== "all";
    button.classList.toggle("is-active", propertyFilter === labsState.evidencePropertyFilter);
  });
  document.querySelectorAll("[data-evidence-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceView === labsState.evidenceView);
  });
  const listCard = document.querySelector("[data-evidence-list-card]");
  const list = document.querySelector("[data-evidence-list]");
  const empty = document.querySelector("[data-evidence-empty]");
  if (listCard) {
    listCard.hidden = !rows.length;
    listCard.classList.toggle("is-card-view", labsState.evidenceView === "cards");
  }
  if (list) {
    list.innerHTML = rows.map(renderEvidenceRow).join("");
  }
  if (empty) {
    empty.innerHTML = `
      <h2>No Journey OS evidence matches this view</h2>
      <p>Clear filters or simulate an evidence upload from the Journey OS workspace.</p>
      <button class="secondary-button" type="button" data-evidence-clear>Clear filters</button>
    `;
    empty.hidden = Boolean(rows.length);
  }
  const missingList = document.querySelector("[data-evidence-missing-list]");
  if (missingList) {
    missingList.innerHTML = (state.actionPlan.missingEvidence || []).slice(0, 6).map((action) => `
      <article>
        <span>${escapeHtml(action.status)}</span>
        <strong>${escapeHtml(action.title)}</strong>
        <p>${escapeHtml(action.body)}</p>
        <button class="text-button" type="button" data-journey-open-upload>Simulate upload</button>
      </article>
    `).join("");
  }
}

function renderPortfolioEvidenceState() {
  const page = document.querySelector("[data-portfolio-evidence]");

  if (!page) {
    return;
  }

  const properties = getPortfolioProperties();
  const evidenceKicker = document.querySelector("[data-portfolio-evidence] .section-kicker");
  const evidenceMissingTitle = document.querySelector("#evidenceMissingTitle");
  const evidenceMissingHeading = evidenceMissingTitle?.closest(".section-heading");
  if (evidenceMissingHeading) {
    evidenceMissingHeading.querySelector(".section-kicker").textContent = "MISSING EVIDENCE";
    evidenceMissingTitle.textContent = "What CMP still needs";
    evidenceMissingHeading.querySelector("p:not(.section-kicker)").textContent = "A short list of evidence gaps across the portfolio.";
  }
  if (!properties.length) {
    if (evidenceKicker) {
      evidenceKicker.textContent = "Evidence Vault";
    }
    document.querySelector("[data-evidence-upload]")?.setAttribute("hidden", "");
    document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => button.setAttribute("hidden", ""));
    const evidenceAsk = document.querySelector("[data-evidence-ask]");
    if (evidenceAsk) {
      evidenceAsk.textContent = "What evidence should I prepare?";
    }
    document.querySelector("[data-evidence-count-badge]").textContent = "0 properties connected";
    document.querySelector("[data-evidence-verified-count]").textContent = "0";
    document.querySelector("[data-evidence-review-count]").textContent = "0";
    document.querySelector("[data-evidence-review-detail]").textContent = "nothing to review";
    document.querySelector("[data-evidence-missing-count]").textContent = "0";
    document.querySelector("[data-evidence-missing-detail]").textContent = "add a property first";
    document.querySelector("[data-evidence-inbox-count]").textContent = "0";
    document.querySelector("[data-evidence-health-strength]").textContent = "No score yet";
    document.querySelector("[data-evidence-health-verified]").textContent = "No evidence stored";
    document.querySelector("[data-evidence-health-missing]").textContent = "No properties connected";
    document.querySelector("[data-evidence-health-focus]").textContent = "Add a property before uploading evidence.";
    document.querySelector(".evidence-inbox-panel")?.setAttribute("hidden", "");
    document.querySelector(".evidence-toolbar")?.setAttribute("hidden", "");
    document.querySelector(".evidence-lower-grid")?.setAttribute("hidden", "");
    document.querySelector("[data-evidence-missing-section]")?.setAttribute("hidden", "");
    const healthCard = document.querySelector(".property-evidence-health-card");
    if (healthCard) {
      healthCard.querySelector("h2").textContent = "Evidence Vault is empty";
      healthCard.querySelector("p").textContent = "No properties connected";
    }
    const listCard = document.querySelector("[data-evidence-list-card]");
    const list = document.querySelector("[data-evidence-list]");
    const empty = document.querySelector("[data-evidence-empty]");
    if (listCard) {
      listCard.hidden = true;
    }
    if (list) {
      list.innerHTML = "";
    }
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `
        <h2>No evidence yet</h2>
        <p>Once you add a property, Evidence Vault will store certificates, inspection records and supporting documents against the correct address.</p>
        <div class="button-row">
          <button class="primary-button" type="button" data-properties-add>Add your first property</button>
          <button class="secondary-button" type="button" data-evidence-empty-ask>What evidence should I prepare?</button>
        </div>
      `;
    }
    renderEvidenceMissingList();
    return;
  }

  if (hasJourneyPropertyBrainActivity()) {
    renderJourneyEvidenceVaultBridge();
    return;
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const setupEvidenceRows = newPropertyEvidenceRows();
    const uploadedRows = setupEvidenceRows.filter((row) => row.filters.includes("uploaded"));
    const missingRows = setupEvidenceRows.filter((row) => row.filters.includes("missing"));
    if (evidenceKicker) {
      evidenceKicker.textContent = "Evidence Vault";
    }
    document.querySelector("[data-evidence-upload]")?.removeAttribute("hidden");
    document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => button.setAttribute("hidden", ""));
    const evidenceAsk = document.querySelector("[data-evidence-ask]");
    if (evidenceAsk) {
      evidenceAsk.textContent = "Ask CMP what to upload";
    }
    document.querySelector("[data-evidence-count-badge]").textContent = "1 new property profile";
    document.querySelector("[data-evidence-verified-count]").textContent = String(uploadedRows.length);
    document.querySelector("[data-evidence-review-count]").textContent = String(setupEvidenceRows.length - uploadedRows.length);
    document.querySelector("[data-evidence-review-detail]").textContent = summary.evidenceConfidenceLabel;
    document.querySelector("[data-evidence-missing-count]").textContent = String(missingRows.length);
    document.querySelector("[data-evidence-missing-detail]").textContent = missingRows.length === 1 ? "item needs input" : "items need input";
    document.querySelector("[data-evidence-inbox-count]").textContent = "0";
    document.querySelector("[data-evidence-health-strength]").textContent = `${summary.evidenceConfidenceScore}% evidence confidence`;
    document.querySelector("[data-evidence-health-verified]").textContent = uploadedRows.length ? `${uploadedRows.length} demo upload${uploadedRows.length === 1 ? "" : "s"} added` : "No uploaded documents yet";
    document.querySelector("[data-evidence-health-missing]").textContent = summary.missingEvidence.length ? `${summary.missingEvidence.join(", ")} need input` : "Core certificate uploads are present for review";
    document.querySelector("[data-evidence-health-focus]").textContent = summary.evidenceConfidenceHelp;
    document.querySelector(".evidence-inbox-panel")?.setAttribute("hidden", "");
    document.querySelector(".evidence-toolbar")?.removeAttribute("hidden");
    document.querySelector(".evidence-lower-grid")?.setAttribute("hidden", "");
    document.querySelector("[data-evidence-missing-section]")?.removeAttribute("hidden");
    if (evidenceMissingHeading) {
      evidenceMissingHeading.querySelector(".section-kicker").textContent = "57 The Butts";
      evidenceMissingTitle.textContent = "What CMP still needs for 57 The Butts";
      evidenceMissingHeading.querySelector("p:not(.section-kicker)").textContent = "Records that are prepared, unknown or waiting for landlord-uploaded documents.";
    }
    const healthCard = document.querySelector(".property-evidence-health-card");
    if (healthCard) {
      const title = healthCard.querySelector("h2");
      const body = healthCard.querySelector("p");
      if (title) {
        title.textContent = "57 The Butts evidence profile";
      }
      if (body) {
        body.textContent = `${summary.evidenceConfidenceLabel} · ${summary.evidenceConfidenceHelp}`;
      }
    }
    document.querySelectorAll("[data-evidence-property-filter]").forEach((button) => {
      const propertyFilter = button.dataset.evidencePropertyFilter;
      button.hidden = propertyFilter !== "the-butts";
      button.classList.toggle("is-active", propertyFilter === labsState.evidencePropertyFilter);
    });
    document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.evidenceFilter === labsState.evidenceFilter);
    });
    document.querySelectorAll("[data-evidence-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.evidenceView === labsState.evidenceView);
    });
    const rows = getEvidenceRows().filter(evidenceMatchesCurrentView);
    const listCard = document.querySelector("[data-evidence-list-card]");
    const list = document.querySelector("[data-evidence-list]");
    const empty = document.querySelector("[data-evidence-empty]");
    if (listCard) {
      listCard.hidden = !rows.length;
      listCard.classList.toggle("is-card-view", labsState.evidenceView === "cards");
    }
    if (list) {
      list.innerHTML = rows.map(renderEvidenceRow).join("");
    }
    if (empty) {
      empty.innerHTML = `
        <h2>No evidence matches this view</h2>
        <p>No early-stage evidence record matches those filters.</p>
        <button class="secondary-button" type="button" data-evidence-clear>Clear filters</button>
      `;
      empty.hidden = Boolean(rows.length);
    }
    renderEvidenceMissingList();
    return;
  }

  if (evidenceKicker) {
    evidenceKicker.textContent = "PORTFOLIO EVIDENCE";
  }
  document.querySelector("[data-evidence-upload]")?.removeAttribute("hidden");
  document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => button.removeAttribute("hidden"));
  const evidenceAsk = document.querySelector("[data-evidence-ask]");
  if (evidenceAsk) {
    evidenceAsk.textContent = "Ask CMP what is missing";
  }
  document.querySelector(".evidence-inbox-panel")?.removeAttribute("hidden");
  document.querySelector(".evidence-toolbar")?.removeAttribute("hidden");
  document.querySelector(".evidence-lower-grid")?.removeAttribute("hidden");
  document.querySelector("[data-evidence-missing-section]")?.removeAttribute("hidden");
  document.querySelector("[data-evidence-count-badge]").textContent = `${properties.length} ${properties.length === 1 ? "property" : "properties"} connected`;
  document.querySelector("[data-evidence-verified-count]").textContent = isFivePropertyMode() ? String(properties.reduce((sum, property) => sum + property.verifiedEvidence, 0)) : isTwoPropertyMode() ? (labsState.eicrAdded ? "6" : "5") : labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-evidence-review-count]").textContent = isFivePropertyMode() ? String(portfolioEvidenceGapCount()) : isTwoPropertyMode() ? "2" : labsState.eicrAdded ? "0" : "1";
  document.querySelector("[data-evidence-review-detail]").textContent = isFivePropertyMode() ? "portfolio evidence gaps" : isTwoPropertyMode() ? "Gas renewal and tenancy evidence" : labsState.eicrAdded ? "nothing waiting" : "EICR extraction";
  document.querySelector("[data-evidence-missing-count]").textContent = isFivePropertyMode() ? String(portfolioEvidenceGapCount()) : isTwoPropertyMode() ? (labsState.eicrAdded ? "3" : "4") : labsState.eicrAdded ? "1" : "2";
  document.querySelector("[data-evidence-missing-detail]").textContent = isFivePropertyMode() ? "across five properties" : isTwoPropertyMode() ? "property-specific gaps" : labsState.eicrAdded ? "inspection record" : "EICR and inspection";
  document.querySelector("[data-evidence-inbox-count]").textContent = "1";
  document.querySelector("[data-evidence-health-strength]").textContent = isFivePropertyMode() ? `${portfolioEvidenceScore()}% evidence score` : isTwoPropertyMode() ? "2 properties tracked" : labsState.eicrAdded ? "58% evidenced" : "42% evidenced";
  document.querySelector("[data-evidence-health-verified]").textContent = isFivePropertyMode() ? `${fullyCompliantProperties().length} evidence-ready property` : isTwoPropertyMode() ? (labsState.eicrAdded ? "6 verified records" : "5 verified records") : labsState.eicrAdded ? "3 verified records" : "2 verified records";
  document.querySelector("[data-evidence-health-missing]").textContent = isFivePropertyMode() ? `${portfolioEvidenceGapCount()} evidence gaps visible` : isTwoPropertyMode() ? (labsState.eicrAdded ? "3 evidence gaps visible" : "4 evidence gaps visible") : labsState.eicrAdded ? "Inspection evidence still missing" : "EICR evidence still missing";
  document.querySelector("[data-evidence-health-focus]").textContent = isFivePropertyMode()
    ? "Next gap: 3 Station Road onboarding evidence"
    : isTwoPropertyMode()
    ? "Next gap: Gas Safety renewal for 18 Willow Brook Drive"
    : labsState.eicrAdded
      ? "Core certificates are recorded. Inspection evidence is still useful to add."
      : "Electrical Safety needs evidence";
  const healthCard = document.querySelector(".property-evidence-health-card");
  if (healthCard) {
    const title = healthCard.querySelector("h2");
    const body = healthCard.querySelector("p");
    if (title) {
      title.textContent = isFivePropertyMode() ? "Five-property evidence health" : isTwoPropertyMode() ? "Portfolio evidence health" : "57 The Butts";
    }
    if (body) {
      body.textContent = isFivePropertyMode() ? "5 properties · mixed compliance states" : isTwoPropertyMode() ? "2 properties · Coventry and Birmingham" : "Coventry, CV1 3BJ";
    }
  }

  const searchInput = document.querySelector("[data-evidence-search]");
  if (searchInput && searchInput.value !== labsState.evidenceSearch) {
    searchInput.value = labsState.evidenceSearch;
  }

  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceFilter === labsState.evidenceFilter);
  });
  document.querySelectorAll("[data-evidence-property-filter]").forEach((button) => {
    const propertyFilter = button.dataset.evidencePropertyFilter;
    button.hidden = propertyFilter === "willow-brook" && !isTwoPropertyMode();
    button.classList.toggle("is-active", propertyFilter === labsState.evidencePropertyFilter);
  });
  document.querySelectorAll("[data-evidence-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceView === labsState.evidenceView);
  });

  const rows = getEvidenceRows().filter(evidenceMatchesCurrentView);
  const listCard = document.querySelector("[data-evidence-list-card]");
  const list = document.querySelector("[data-evidence-list]");
  const empty = document.querySelector("[data-evidence-empty]");
  if (listCard) {
    listCard.hidden = !rows.length;
    listCard.classList.toggle("is-card-view", labsState.evidenceView === "cards");
  }
  if (list) {
    list.innerHTML = rows.map(renderEvidenceRow).join("");
  }
  if (empty) {
    empty.innerHTML = `
      <h2>No evidence matches this view</h2>
      <p>No evidence record matches those filters. Clear the view to return to the full vault.</p>
      <button class="secondary-button" type="button" data-evidence-clear>Clear filters</button>
    `;
    empty.hidden = Boolean(rows.length);
  }

  renderEvidenceMissingList();
}

function renderEvidenceMissingList() {
  const list = document.querySelector("[data-evidence-missing-list]");

  if (!list) {
    return;
  }

  if (isEmptyPortfolioMode()) {
    list.innerHTML = `
      <article class="compliance-gap-card">
        <div>
          <h3>No missing evidence yet</h3>
          <p>Add a property first; CMP will then create the evidence list for that address.</p>
        </div>
        <div class="compliance-gap-actions">
          <button class="primary-button" type="button" data-properties-add>Add property</button>
        </div>
      </article>
    `;
    return;
  }

  if (isNewPropertyMode()) {
    const items = [
      ["Gas Safety evidence", "Upload if relevant to this property and occupancy.", "uploadGas", true],
      ["Electrical Safety / EICR", "Upload an existing report or continue the guided check.", "uploadEicr", true],
      ["Tenancy / deposit documents", "Only needed if the property is or will be tenanted.", "startGuidedCheck", false],
      ["Smoke and CO alarm status", "Confirm landlord answer and add supporting evidence if available.", "startGuidedCheck", false]
    ];

    list.innerHTML = items.map(([title, detail, action, primary]) => `
      <article class="compliance-gap-card">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(detail)}</p>
        </div>
        <div class="compliance-gap-actions">
          <button class="${primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${escapeHtml(action)}">
            ${primary ? "Upload" : "Continue guided check"}
          </button>
        </div>
      </article>
    `).join("");
    return;
  }

  if (isFivePropertyMode()) {
    const items = getPortfolioProperties()
      .filter((property) => property.missingEvidence.length)
      .map((property) => ({
        title: property.address,
        detail: `${property.missingEvidence.join(", ")} · ${property.evidenceScore}% evidence`,
        actions: [
          { label: "Run A-Z", action: `az:${property.id}`, primary: property.evidenceScore < 50 },
          { label: "Service path", action: `service:${property.id}` }
        ]
      }));

    list.innerHTML = items.map((item) => `
      <article class="compliance-gap-card">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.detail)}</p>
        </div>
        <div class="compliance-gap-actions">
          ${item.actions.map((action) => `
            <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${escapeHtml(action.action)}">
              ${escapeHtml(action.label)}
            </button>
          `).join("")}
        </div>
      </article>
    `).join("");
    return;
  }

  const items = [
    ...(isTwoPropertyMode()
      ? [{
          title: "Gas Safety renewal",
          detail: "18 Willow Brook Drive · Renewal evidence needed in 21 days",
          actions: [
            { label: "Upload certificate", action: "uploadGas", primary: true },
            { label: "Request support", action: "arrangeGas" }
          ]
        }, {
          title: "Alarm evidence",
          detail: "18 Willow Brook Drive · Landlord answer missing",
          actions: [
            { label: "Add evidence", action: "uploadAlarms" },
            { label: "Open preview", action: "openWillowProperty" }
          ]
        }]
      : []),
    ...(!labsState.eicrAdded
      ? [{
          title: "EICR",
          detail: "57 The Butts · Electrical Safety",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Arrange EICR", action: "arrangeEicr" }
          ]
        }]
      : []),
    {
      title: "Inspection evidence",
      detail: "57 The Butts · Property inspection",
      actions: [
        { label: "Upload inspection evidence", action: "uploadInspection", primary: labsState.eicrAdded },
        { label: "Mark as not completed", action: "markInspection" }
      ]
    }
  ];

  list.innerHTML = items.map((item) => `
    <article class="compliance-gap-card">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <div class="compliance-gap-actions">
        ${item.actions.map((action) => `
          <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${action.action}">
            ${escapeHtml(action.label)}
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function showPortfolioEvidence({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-evidence]",
    view: "evidenceVault",
    navLabel: "Evidence Vault",
    bodyClass: "portfolio-evidence-active",
    response: getEvidenceVaultAssistantResponse("What evidence is missing?"),
    scroll
  });
}

function activeTaskItems() {
  if (isEmptyPortfolioMode()) {
    return [];
  }

  if (isNewPropertyMode()) {
    return newPropertyTaskItems();
  }

  if (isFivePropertyMode()) {
    return getPortfolioProperties()
      .filter((property) => property.complianceScore < 100 || property.evidenceScore < 100)
      .map((property) => ({
        id: `${property.id}-priority`,
        title: `${property.address}: ${property.priority}`,
        property: `${property.address} · ${property.postcode}`,
        propertyId: property.id,
        category: property.complianceScore < 60 ? "Evidence" : property.focusArea,
        priority: property.mostUrgent || property.complianceScore < 60 ? "High" : "Medium",
        source: "A-Z Checker",
        body: property.priorityBody,
        status: property.state,
        suggestedAction: property.priority,
        board: property.complianceScore < 60 ? "todo" : "progress",
        filters: [property.complianceScore < 60 ? "high" : "evidence", "evidence", property.focusArea.toLowerCase().includes("licensing") ? "licensing" : "inspection"],
        detail: `CMP created this portfolio task from ${property.address}'s compliance score (${property.complianceScore}%) and evidence score (${property.evidenceScore}%).`,
        search: property.search,
        actions: [
          { label: "Run A-Z check", action: `az:${property.id}`, primary: property.complianceScore < 60 },
          { label: "Service path", action: `service:${property.id}` }
        ]
      }));
  }

  return [
    ...(!labsState.eicrAdded
      ? [{
          id: "eicr",
          title: "Upload or arrange an EICR",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Evidence",
          priority: "High",
          source: "Compliance Centre",
          body: "No current Electrical Safety evidence is stored for this property.",
          status: "Needs checking",
          suggestedAction: "Upload EICR or request EICR support",
          board: "todo",
          filters: ["high", "evidence"],
          requestType: "EICR support",
          detail: "CMP created this task because Electrical Safety evidence was missing for 57 The Butts.",
          search: "eicr electrical evidence support 57 butts vacant",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Request support", action: "requestSupport" },
            { label: "Open property", action: "openProperty" }
          ]
        }]
      : []),
    ...(!labsState.inspectionStatusRecorded
      ? [{
          id: "inspection",
          title: "Confirm inspection evidence",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Inspection",
          priority: "Medium",
          source: "Evidence Vault",
          body: "CMP does not hold a recent property inspection record.",
          status: labsState.eicrAdded ? "Useful next step" : "Open",
          suggestedAction: "Upload inspection evidence or record that no recent inspection has been completed",
          board: "todo",
          filters: ["inspection", "evidence"],
          requestType: "Property inspection support",
          detail: "CMP created this task because no recent property inspection record is stored for this property.",
          search: "inspection evidence 57 butts vacant complete",
          actions: [
            { label: "Upload inspection evidence", action: "uploadInspection", primary: labsState.eicrAdded },
            { label: "Mark as not completed", action: "markInspection" },
            { label: "Open property", action: "openProperty" }
          ]
        }]
      : []),
    {
      id: "licensing",
      title: "Review local licensing position",
      property: "57 The Butts · CV1 3BJ",
      propertyId: "the-butts",
      category: "Licensing",
      priority: "Medium",
      source: "Compliance Centre",
      body: "CMP is still checking whether local rules may affect this address.",
      status: "In progress",
      suggestedAction: "Review licensing in the property workspace",
      board: "progress",
      filters: ["licensing"],
      detail: "CMP created this task because local licensing rules are still being checked for this postcode.",
      search: "licensing local 57 butts vacant",
      actions: [
        { label: "Review licensing", action: "reviewLicensing" },
        { label: "Ask CMP", action: "askLicensing" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    ...(isTwoPropertyMode()
      ? [
          {
            id: "willow-gas-renewal",
            title: "18 Willow Brook Drive: book or upload Gas Safety renewal",
            property: "18 Willow Brook Drive · B37 7BA",
            propertyId: "willow-brook",
            category: "Evidence",
            priority: "High",
            source: "Compliance Centre",
            body: "Gas Safety evidence is approaching its renewal window for this tenanted property.",
            status: "Expiring soon",
            suggestedAction: "Upload the new certificate or request Gas Safety support",
            board: "todo",
            filters: ["high", "evidence"],
            requestType: "Gas Safety support",
            detail: "CMP created this task because Gas Safety renewal evidence is needed soon for 18 Willow Brook Drive.",
            search: "gas safety renewal 18 willow brook drive b37 expiring soon high evidence",
            actions: [
              { label: "Upload certificate", action: "uploadGas", primary: true },
              { label: "Request support", action: "requestGasSupport" },
              { label: "Open preview", action: "openWillowProperty" }
            ]
          },
          {
            id: "willow-alarm-check",
            title: "18 Willow Brook Drive: confirm alarm evidence",
            property: "18 Willow Brook Drive · B37 7BA",
            propertyId: "willow-brook",
            category: "Evidence",
            priority: "Medium",
            source: "Property details",
            body: "Smoke and CO alarm answer is still missing for this property.",
            status: "Needs checking",
            suggestedAction: "Add alarm evidence or record the landlord answer",
            board: "todo",
            filters: ["evidence"],
            detail: "CMP created this task because alarm evidence is not yet recorded for 18 Willow Brook Drive.",
            search: "alarm evidence smoke co 18 willow brook drive b37 needs checking",
            actions: [
              { label: "Add evidence", action: "uploadAlarms" },
              { label: "Open preview", action: "openWillowProperty" }
            ]
          },
          {
            id: "willow-inspection",
            title: "18 Willow Brook Drive: add inspection evidence",
            property: "18 Willow Brook Drive · B37 7BA",
            propertyId: "willow-brook",
            category: "Inspection",
            priority: "Medium",
            source: "Evidence Vault",
            body: "No recent inspection evidence is stored for the tenanted property review.",
            status: "Missing",
            suggestedAction: "Upload inspection evidence when available",
            board: "todo",
            filters: ["inspection", "evidence"],
            detail: "CMP created this task because no recent inspection record is stored for 18 Willow Brook Drive.",
            search: "inspection evidence 18 willow brook drive b37 missing",
            actions: [
              { label: "Upload inspection evidence", action: "uploadInspection" },
              { label: "Open preview", action: "openWillowProperty" }
            ]
          },
          {
            id: "willow-licensing",
            title: "18 Willow Brook Drive: review local licensing",
            property: "18 Willow Brook Drive · B37 7BA",
            propertyId: "willow-brook",
            category: "Licensing",
            priority: "Medium",
            source: "Compliance Centre",
            body: "CMP is checking postcode and occupancy rules for this address.",
            status: "Checking",
            suggestedAction: "Review local licensing when the postcode check completes",
            board: "progress",
            filters: ["licensing"],
            detail: "CMP created this task because local rules can depend on postcode and tenancy setup.",
            search: "licensing local review 18 willow brook drive b37 checking",
            actions: [
              { label: "Ask CMP", action: "askLicensing" },
              { label: "Open preview", action: "openWillowProperty" }
            ]
          }
        ]
      : [])
  ];
}

function completedTaskItems() {
  return [
    ...(labsState.eicrAdded
      ? [{
          id: "eicr-resolved",
          title: "EICR evidence added",
          status: "Evidence accepted",
          source: "Documents · Smart Upload",
          body: "Electrical Safety evidence was verified and linked to 57 The Butts.",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Evidence",
          priority: "High",
          suggestedAction: "Review the next useful task",
          board: "resolved",
          filters: ["completed", "high", "evidence"],
          detail: "CMP moved this task here because Electrical Safety evidence was verified through Smart Upload.",
          search: "eicr complete evidence accepted smart upload evidence 57 butts"
        }]
      : []),
    ...(labsState.inspectionStatusRecorded
      ? [{
          id: "inspection-recorded",
          title: "Inspection status recorded",
          status: "Deferred - still open",
          source: "Tasks · Demo action",
          body: "Marked as not completed during the walkthrough. CMP keeps the inspection evidence gap visible.",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Inspection",
          priority: "Medium",
          suggestedAction: "Return when inspection evidence is available",
          board: "resolved",
          filters: ["completed", "inspection"],
          detail: "CMP moved this task here because inspection status was recorded for this session, but this does not close the evidence gap.",
          search: "inspection deferred still open not completed 57 butts"
        }]
      : []),
    ...(labsState.alarmAnswer
      ? [{
          id: "alarm-recorded",
          title: "Alarm testing answer recorded",
          status: "Landlord confirmed",
          source: "Home · Quick win",
          body: "Landlord confirmed.",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Evidence",
          priority: "Medium",
          suggestedAction: "Add supporting evidence later if useful",
          board: "resolved",
          filters: ["completed", "evidence"],
          detail: "CMP moved this task here because the alarm testing answer was recorded from the Home quick-win flow.",
          search: "alarm complete landlord confirmed evidence 57 butts"
        }]
      : [])
  ];
}

function taskMatchesCurrentView(task) {
  const query = labsState.taskSearch.trim().toLowerCase();
  const matchesSearch = !query || `${task.title} ${task.property} ${task.category} ${task.priority} ${task.source} ${task.body} ${task.status} ${task.search}`.toLowerCase().includes(query);
  const matchesFilter = labsState.taskFilter === "all"
    || task.filters.includes(labsState.taskFilter)
    || (labsState.taskFilter === "completed" && task.board === "resolved");

  return matchesSearch && matchesFilter;
}

function allTaskItems() {
  return [...activeTaskItems(), ...completedTaskItems()];
}

function activeRequestForTask(task) {
  if (!task.requestType) {
    return null;
  }

  return labsState.serviceRequests.find((request) => request.type === task.requestType && requestPropertyId(request) === (task.propertyId || "the-butts") && request.status !== "Cancelled");
}

function renderTaskCard(task, { compact = false } = {}) {
  const actions = task.actions?.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-task-action="${action.action}">
      ${escapeHtml(action.label)}
    </button>
  `).join("") || "";
  const activeRequest = activeRequestForTask(task);

  return `
    <article class="task-card" data-task-id="${escapeHtml(task.id)}">
      <div>
        <button class="task-title-button" type="button" data-task-detail="${escapeHtml(task.id)}">
          <h3>${escapeHtml(task.title)}</h3>
        </button>
        <p class="property-card-label">${escapeHtml(task.property)}</p>
        ${compact ? "" : `<p>${escapeHtml(task.body)}</p>`}
        <div class="task-chip-row">
          <span>${escapeHtml(task.category)}</span>
          <span>${escapeHtml(task.priority)} priority</span>
          <span>Source: ${escapeHtml(task.source)}</span>
          <span>${escapeHtml(task.status)}</span>
          ${activeRequest ? `<span>${escapeHtml(activeRequest.type)} open</span>` : ""}
        </div>
      </div>
      <div class="task-card-actions">
        ${actions}
        <button class="text-button" type="button" data-task-detail="${escapeHtml(task.id)}">Why this task?</button>
      </div>
    </article>
  `;
}

function renderTaskBoard(tasks) {
  const columns = [
    { id: "todo", title: "To do" },
    { id: "progress", title: "In progress" },
    { id: "resolved", title: "Closed or deferred" }
  ];

  return columns.map((column) => {
    const columnTasks = tasks.filter((task) => task.board === column.id);

    return `
      <section class="task-board-column">
        <h3>${column.title}</h3>
        ${columnTasks.length
          ? columnTasks.map((task) => renderTaskCard(task, { compact: true })).join("")
          : `<p>No tasks sit in this column for the current view.</p>`}
      </section>
    `;
  }).join("");
}

function renderCompletedTasks() {
  const list = document.querySelector("[data-completed-task-list]");

  if (!list) {
    return;
  }

  const completed = completedTaskItems();
  list.classList.toggle("is-empty", !completed.length);
  list.innerHTML = completed.length
    ? completed.map((task) => `
        <article class="completed-task-card">
          <strong>${escapeHtml(task.title)}</strong>
          <span>${escapeHtml(task.status)}</span>
          <p>${escapeHtml(task.body || task.source)}</p>
          <small>${escapeHtml(task.source)}</small>
        </article>
      `).join("")
    : `
        <article class="completed-task-empty">
          <span>Nothing recorded yet</span>
          <h3>No completed or dismissed tasks</h3>
          <p>Completed support, evidence and landlord-answer actions will appear here during the walkthrough.</p>
        </article>
      `;
}

function renderPortfolioTasksState() {
  const page = document.querySelector("[data-portfolio-tasks]");

  if (!page) {
    return;
  }

  const activeTasks = activeTaskItems();
  const completedTasks = completedTaskItems();
  const highestPriority = activeTasks.find((task) => task.id === "willow-gas-renewal")
    || activeTasks.find((task) => task.id === "eicr")
    || activeTasks.find((task) => task.id === "inspection")
    || activeTasks[0];
  const activeRequest = highestPriority ? activeRequestForTask(highestPriority) : null;
  const isEmptyTaskState = !activeTasks.length && !completedTasks.length;
  const tasksAsk = document.querySelector("[data-tasks-ask]");
  const tasksKicker = document.querySelector("[data-portfolio-tasks] .section-kicker");
  if (tasksAsk) {
    tasksAsk.textContent = isEmptyTaskState ? "Ask CMP how tasks work" : "Ask CMP what to do first";
  }
  if (tasksKicker) {
    tasksKicker.textContent = isEmptyTaskState || isNewPropertyMode() ? "Tasks" : "PORTFOLIO TASKS";
  }

  document.querySelector("[data-tasks-active-pill]").textContent = `${activeTasks.length} active ${activeTasks.length === 1 ? "task" : "tasks"}`;
  document.querySelector("[data-tasks-active-count]").textContent = String(activeTasks.length);
  document.querySelector("[data-tasks-priority-label]").textContent = highestPriority
    ? isNewPropertyMode()
      ? "Setup"
      : highestPriority.id === "willow-gas-renewal"
        ? "Gas Safety"
        : highestPriority.id === "eicr"
          ? "EICR"
          : highestPriority.id === "inspection"
            ? "Inspection"
            : "Licensing"
    : "Setup";
  document.querySelector("[data-tasks-due-count]").textContent = highestPriority ? "1" : "0";
  document.querySelector("[data-tasks-completed-count]").textContent = String(completedTasks.length);
  document.querySelector("[data-tasks-start-title]").textContent = highestPriority?.title || "No property tasks yet";
  const startProperty = document.querySelector(".tasks-start-card .property-card-label");
  if (startProperty) {
    startProperty.textContent = highestPriority?.property || "No property selected";
  }
  document.querySelector("[data-tasks-start-body]").textContent = highestPriority?.body || "Add your first property to create property-specific compliance and evidence tasks.";
  document.querySelector("[data-tasks-start-source]").textContent = highestPriority ? `Source: ${highestPriority.source}` : "Source: CMP";
  document.querySelector("[data-tasks-start-status]").textContent = highestPriority?.status || "Setup";
  document.querySelector("[data-tasks-start-status]").classList.toggle("status-review-text", ["eicr", "willow-alarm-check", "willow-inspection"].includes(highestPriority?.id));
  document.querySelector("[data-tasks-start-status]").classList.toggle("status-watch-text", !["eicr", "willow-alarm-check", "willow-inspection"].includes(highestPriority?.id));

  const supportIndicator = document.querySelector("[data-tasks-support-indicator]");
  if (supportIndicator) {
    supportIndicator.hidden = !activeRequest;
    supportIndicator.textContent = activeRequest ? `${activeRequest.type} open` : "Support request open";
  }

  const startActions = document.querySelector("[data-tasks-start-actions]");
  if (startActions && highestPriority) {
    startActions.innerHTML = highestPriority.actions.map((action) => `
      <button class="${action.primary ? "primary-button" : action.action === "openProperty" ? "text-button" : "secondary-button"}" type="button" data-task-action="${action.action}">
        ${escapeHtml(action.label)}
      </button>
    `).join("");
  } else if (startActions) {
    startActions.innerHTML = `
      <button class="primary-button" type="button" data-properties-add>Add your first property</button>
    `;
  }

  document.querySelector("[data-tasks-review-completed]")?.toggleAttribute("hidden", isEmptyTaskState);
  document.querySelector(".tasks-toolbar")?.toggleAttribute("hidden", isEmptyTaskState);
  document.querySelector(".tasks-completed-section")?.toggleAttribute("hidden", isEmptyTaskState);

  const searchInput = document.querySelector("[data-task-search]");
  if (searchInput && searchInput.value !== labsState.taskSearch) {
    searchInput.value = labsState.taskSearch;
  }

  document.querySelectorAll("[data-task-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.taskFilter === labsState.taskFilter);
  });
  document.querySelectorAll("[data-task-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.taskView === labsState.taskView);
  });

  const taskSource = labsState.taskView === "board"
    ? allTaskItems()
    : labsState.taskFilter === "completed"
      ? completedTasks
      : activeTasks;
  const tasksForView = taskSource.filter(taskMatchesCurrentView);
  const list = document.querySelector("[data-task-list]");
  const board = document.querySelector("[data-task-board]");
  const empty = document.querySelector("[data-task-empty]");
  const hasTasks = Boolean(tasksForView.length);

  if (list) {
    list.hidden = labsState.taskView !== "list" || !hasTasks;
    list.innerHTML = tasksForView.map((task) => renderTaskCard(task)).join("");
  }
  if (board) {
    board.hidden = labsState.taskView !== "board" || !hasTasks;
    board.innerHTML = renderTaskBoard(tasksForView);
  }
  if (empty) {
    empty.innerHTML = isEmptyTaskState
      ? `
        <h2>No tasks yet</h2>
        <p>Tasks will appear after you add a property and CMP identifies missing evidence, upcoming renewals or checks that need attention.</p>
        <button class="primary-button" type="button" data-properties-add>Add your first property</button>
      `
      : `
        <h2>No tasks match this view</h2>
        <p>No task matches those filters. Clear the view to return to the active action list.</p>
        <button class="secondary-button" type="button" data-task-clear>Clear filters</button>
      `;
    empty.hidden = hasTasks;
  }

  renderCompletedTasks();
}

function showPortfolioTasks({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-tasks]",
    view: "tasks",
    navLabel: "Tasks",
    bodyClass: "portfolio-tasks-active",
    response: getTasksAssistantResponse("What should I do first?"),
    scroll
  });
}

function activeSupportRequestForActivity() {
  return labsState.serviceRequests.find((request) => request.status !== "Cancelled");
}

function makeActivityAction(label, action, primary = false) {
  return { label, action, primary };
}

function getActivityEvents() {
  if (isEmptyPortfolioMode()) {
    return [];
  }

  if (isNewPropertyMode()) {
    return newPropertyActivityEvents();
  }

  const property = "57 The Butts · CV1 3BJ";
  const activeSupportRequest = activeSupportRequestForActivity();
  const events = [];

  if (activeSupportRequest) {
    const supportProperty = propertyLabelForId(requestPropertyId(activeSupportRequest));
    events.push({
      id: "support-request-created",
      group: "Today",
      filter: "support",
      category: "Support",
      title: "Support request created",
      property: supportProperty,
      body: `A local demo ${activeSupportRequest.type.toLowerCase()} request was created for this property.`,
      source: "Services",
      status: "Awaiting review",
      statusClass: "status-watch-text",
      search: `${activeSupportRequest.type} support service request awaiting review ${supportProperty}`,
      why: "CMP recorded this because a walkthrough support request was created from the Services workspace.",
      nextAction: "Open Services to review the request.",
      route: "services",
      actions: [
        makeActivityAction("Open services", "openServices"),
        makeActivityAction("View request", "viewRequest")
      ]
    });
  }

  if (labsState.inspectionStatusRecorded) {
    events.push({
      id: "inspection-status-recorded",
      group: "Today",
      filter: "tasks",
      category: "Tasks",
      title: "Inspection status recorded",
      property,
      body: "Inspection evidence was marked as not yet completed during the walkthrough.",
      source: "Tasks",
      status: "Recorded",
      statusClass: "status-neutral-text",
      search: "inspection task evidence status recorded not completed 57 butts",
      why: "CMP recorded this because the inspection evidence task was marked as not yet completed.",
      nextAction: "Return to Tasks when inspection evidence is available.",
      route: "tasks",
      actions: [
        makeActivityAction("Open task", "openTask"),
        makeActivityAction("Open property", "openProperty")
      ]
    });
  }

  labsState.propertyEvents
    .filter((event) => ["property-update", "optional-details", "memory-observation", "alarm-answer"].includes(event.type))
    .forEach((event) => {
      const isAnswer = event.type === "alarm-answer";
      events.push({
        id: `property-event-${event.id}`,
        group: "Today",
        filter: isAnswer ? "answers" : "details",
        category: isAnswer ? "Landlord answer" : "Property details",
        title: event.title,
        property,
        body: event.body,
        source: event.details?.rows?.find(([term]) => term === "Source")?.[1] || "Property details",
        status: event.badge || "Recorded",
        statusClass: event.badgeClass || "status-watch-text",
        search: `${event.title} ${event.body} property details landlord answer alarm 57 butts`,
        why: "CMP recorded this because property information changed during the walkthrough.",
        nextAction: isAnswer ? "Review the property timeline or add supporting evidence." : "Open Property details to review the saved information.",
        route: isAnswer ? "timeline" : "details",
        actions: [
          makeActivityAction(isAnswer ? "Review answer" : "View property details", isAnswer ? "openTimeline" : "openDetails")
        ]
      });
    });

  if (labsState.eicrAdded) {
    events.push({
      id: "eicr-verified",
      group: "Today",
      filter: "evidence",
      category: "Evidence",
      title: "EICR evidence verified",
      property,
      body: "A satisfactory Electrical Installation Condition Report was reviewed and added to the property file.",
      source: "Documents · Smart Upload",
      status: "Verified",
      statusClass: "status-good-text",
      search: "eicr electrical installation condition report evidence verified uploaded smart upload 57 butts",
      why: "CMP recorded this because the uploaded EICR was confirmed and linked to 57 The Butts.",
      nextAction: "View the evidence record or continue to the property workspace.",
      route: "evidence",
      actions: [
        makeActivityAction("View evidence", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    });
  }

  events.push(
    {
      id: "electrical-gap",
      group: "Today",
      filter: "compliance",
      category: "Compliance",
      title: "Electrical Safety gap identified",
      property,
      body: labsState.eicrAdded
        ? "This gap moved to evidence accepted after EICR evidence was verified."
        : "CMP could not find a current EICR in the property file. Electrical Safety became the clearest evidence priority.",
      source: "Compliance Centre",
      status: labsState.eicrAdded ? "Evidence accepted" : "Needs checking",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      resolved: labsState.eicrAdded,
      open: !labsState.eicrAdded,
      search: `eicr electrical safety compliance gap ${labsState.eicrAdded ? "evidence accepted historical" : "missing needs checking"} 57 butts`,
      why: labsState.eicrAdded
        ? "This is retained as history. The gap moved to evidence accepted when EICR evidence was verified."
        : "CMP recorded this because no current EICR was found in the property file.",
      nextAction: labsState.eicrAdded ? "No EICR action is needed now." : "Upload EICR or ask CMP for help.",
      route: labsState.eicrAdded ? "evidence" : "documents",
      actions: labsState.eicrAdded
        ? [
            makeActivityAction("View evidence", "viewEvidence"),
            makeActivityAction("Open property", "openProperty")
          ]
        : [
            makeActivityAction("Upload EICR", "uploadEicr", true),
            makeActivityAction("Ask CMP", "askEicr"),
            makeActivityAction("Open property", "openProperty")
          ]
    },
    {
      id: "inspection-follow-up",
      group: "Today",
      filter: "tasks",
      category: "Tasks",
      title: "Inspection follow-up prepared",
      property,
      body: "CMP prepared inspection evidence as a useful follow-up item for this vacant property.",
      source: "Tasks",
      status: "Prepared",
      statusClass: "status-watch-text",
      search: "inspection follow up prepared task evidence 57 butts vacant",
      why: "CMP recorded this because inspection evidence is a useful follow-up item for a vacant property.",
      nextAction: "Open the task or upload inspection evidence when available.",
      route: "tasks",
      actions: [
        makeActivityAction("Open task", "openTask"),
        makeActivityAction("Upload inspection evidence", "uploadInspection")
      ]
    },
    {
      id: "licensing-review",
      group: "Today",
      filter: "compliance",
      category: "Compliance",
      title: "Local licensing review started",
      property,
      body: "CMP marked the postcode for a local rules review so the property file can show whether any extra checks may be relevant.",
      source: "Compliance Centre",
      status: "Checking",
      statusClass: "status-watch-text",
      search: "licensing local rules postcode review compliance 57 butts",
      why: "CMP recorded this because local rules can depend on postcode and property setup.",
      nextAction: "Review licensing in the property Compliance tab.",
      route: "compliance",
      actions: [
        makeActivityAction("Review licensing", "reviewLicensing"),
        makeActivityAction("Ask CMP", "askLicensing")
      ]
    },
    {
      id: "gas-verified",
      group: "Earlier this week",
      filter: "evidence",
      category: "Evidence",
      title: "Gas Safety Certificate verified",
      property,
      body: "Uploaded certificate reviewed and stored against the property file.",
      source: "Evidence Vault",
      status: "Verified",
      statusClass: "status-good-text",
      search: "gas safety certificate evidence verified document 57 butts",
      why: "CMP recorded this because an uploaded Gas Safety certificate was reviewed and stored.",
      nextAction: "View the evidence record or open the property.",
      route: "evidence",
      actions: [
        makeActivityAction("View evidence", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    },
    {
      id: "epc-imported",
      group: "Earlier this week",
      filter: "evidence",
      category: "Official record",
      title: "EPC record imported",
      property,
      body: "CMP matched an Energy Performance Certificate to this property.",
      source: "Official record",
      status: "Confirmed",
      statusClass: "status-good-text",
      search: "epc energy performance certificate official record imported confirmed 57 butts",
      why: "CMP recorded this because an EPC official record was matched to 57 The Butts.",
      nextAction: "View the record or open the property.",
      route: "evidence",
      actions: [
        makeActivityAction("View record", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    },
    {
      id: "alarms-confirmed",
      group: "Earlier this week",
      filter: "answers",
      category: "Landlord answer",
      title: "Alarm testing confirmed",
      property,
      body: "Smoke and CO alarms were reported as tested. Supporting evidence has not yet been uploaded.",
      source: "Landlord answer",
      status: "Landlord confirmed",
      statusClass: "status-watch-text",
      search: "alarm smoke co landlord answer confirmed evidence 57 butts",
      why: "CMP recorded this because the landlord answer affects the property evidence picture.",
      nextAction: "Add supporting evidence when available or review the answer.",
      route: "timeline",
      actions: [
        makeActivityAction("Add evidence", "addEvidence"),
        makeActivityAction("Review answer", "openTimeline")
      ]
    },
    {
      id: "vacant-scenario",
      group: "Earlier this week",
      filter: "details",
      category: "Property details",
      title: "Property marked as vacant",
      property,
      body: "CMP adjusted suggested next steps to focus on core evidence, inspection records and readiness for a future tenancy.",
      source: "Property details",
      status: "Scenario updated",
      statusClass: "status-watch-text",
      search: "property details vacant scenario updated 57 butts",
      why: "CMP recorded this because occupancy affects which next steps are most useful.",
      nextAction: "View Property details.",
      route: "details",
      actions: [
        makeActivityAction("View property details", "openDetails")
      ]
    },
    {
      id: "file-created",
      group: "Earlier this week",
      filter: "details",
      category: "Property setup",
      title: "Property file created",
      property,
      body: "57 The Butts was added to the CMP Labs workspace.",
      source: "Property setup",
      status: "Recorded",
      statusClass: "status-neutral-text",
      search: "property setup file created 57 butts",
      why: "CMP recorded this because the property file was created in the Labs workspace.",
      nextAction: "Open the property workspace.",
      route: "overview",
      actions: [
        makeActivityAction("Open property", "openProperty")
      ]
    }
  );

  if (isTwoPropertyMode()) {
    events.push(
      {
        id: "willow-gas-renewal",
        group: "Today",
        filter: "compliance",
        category: "Compliance",
        title: "Gas Safety renewal flagged",
        property: "18 Willow Brook Drive · B37 7BA",
        body: "Gas Safety evidence is approaching its renewal window for this tenanted property.",
        source: "Compliance Centre",
        status: "Expiring soon",
        statusClass: "status-watch-text",
        open: true,
        search: "gas safety renewal flagged expiring soon 18 willow brook drive b37",
        why: "CMP recorded this because renewal evidence is needed soon and the property is currently tenanted.",
        nextAction: "Upload the renewal certificate or request Gas Safety support.",
        route: "bookService",
        actions: [
          makeActivityAction("Open Book a Service", "openGlobalServices"),
          makeActivityAction("Ask CMP", "askGasRenewal")
        ]
      },
      {
        id: "willow-eicr-verified",
        group: "Earlier this week",
        filter: "evidence",
        category: "Evidence",
        title: "EICR evidence verified",
        property: "18 Willow Brook Drive · B37 7BA",
        body: "Uploaded Electrical Safety evidence is stored and valid until 2029.",
        source: "Evidence Vault",
        status: "Verified",
        statusClass: "status-good-text",
        search: "eicr evidence verified 18 willow brook drive b37",
        why: "CMP recorded this because the EICR is available for the second property.",
        nextAction: "Keep Gas Safety renewal and inspection evidence visible.",
        route: "evidence",
        actions: [
          makeActivityAction("View evidence", "viewEvidence"),
          makeActivityAction("Open preview", "openWillowProperty")
        ]
      },
      {
        id: "willow-tenanted-review",
        group: "Earlier this week",
        filter: "details",
        category: "Property details",
        title: "Tenanted review created",
        property: "18 Willow Brook Drive · B37 7BA",
        body: "CMP added a portfolio-level preview for a tenanted property review.",
        source: "Property details",
        status: "Portfolio view",
        statusClass: "status-neutral-text",
        search: "tenanted property review created 18 willow brook drive b37",
        why: "CMP recorded this so global pages can compare two property files in the demo.",
        nextAction: "Use Properties, Tasks or Book a Service to review the portfolio-level preview.",
        route: "properties",
        actions: [
          makeActivityAction("Open Properties", "openProperties"),
          makeActivityAction("Open preview", "openWillowProperty")
        ]
      }
    );
  }

  if (isFivePropertyMode()) {
    events.push(
      {
        id: "portfolio-sweep-created",
        group: "Today",
        filter: "compliance",
        category: "A-Z Checker",
        title: "Portfolio sweep prepared",
        property: "Five-property portfolio",
        body: "CMP compared five properties, separated shared answers from property-specific unknowns and found one evidence-ready property.",
        source: "Compliance Centre",
        status: "Ready to review",
        statusClass: "status-watch-text",
        search: "portfolio sweep a-z checker five properties evidence-ready scores",
        why: "CMP recorded this so the demo can show portfolio-wide compliance logic without repeated questions.",
        nextAction: "Open the A-Z Checker and review the property matrix.",
        route: "compliance",
        actions: [
          makeActivityAction("Open A-Z Checker", "openAz", true),
          makeActivityAction("Open Compliance Centre", "reviewLicensing")
        ]
      },
      {
        id: "maple-fully-compliant",
        group: "Today",
        filter: "evidence",
        category: "Evidence",
        title: "24 Maple Court marked evidence-ready",
        property: "24 Maple Court · B15 2QT",
        body: "All core checks and evidence are present in the five-property demo state.",
        source: "Evidence Vault",
        status: "Evidence-ready",
        statusClass: "status-good-text",
        search: "24 maple court evidence-ready evidence score compliance score 100",
        why: "CMP recorded this to demonstrate the positive end-state alongside riskier properties.",
        nextAction: "Keep renewal reminders active.",
        route: "evidence",
        actions: [
          makeActivityAction("View evidence", "viewEvidence")
        ]
      }
    );
  }

  return events;
}

function activityMatchesCurrentView(event) {
  const query = labsState.activitySearch.trim().toLowerCase();
  const text = `${event.category} ${event.title} ${event.property} ${event.body} ${event.source} ${event.status} ${event.search}`.toLowerCase();
  const matchesSearch = !query || text.includes(query);
  const matchesFilter = labsState.activityFilter === "all" || event.filter === labsState.activityFilter;

  return matchesSearch && matchesFilter;
}

function renderActivityEvent(event) {
  const actions = event.actions.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-activity-action="${escapeHtml(action.action)}">
      ${escapeHtml(action.label)}
    </button>
  `).join("");

  return `
    <article class="activity-event${event.open ? " is-open" : ""}${event.resolved ? " is-resolved" : ""}" data-activity-event="${escapeHtml(event.id)}">
      <div class="activity-event-top">
        <div>
          <span class="timeline-event-kicker"><span class="nav-icon" data-icon="clock"></span>${escapeHtml(event.category)}</span>
          <button class="activity-event-title" type="button" data-activity-detail="${escapeHtml(event.id)}">
            <h3>${escapeHtml(event.title)}</h3>
          </button>
          <span class="activity-property-label">${escapeHtml(event.property)}</span>
        </div>
        <span class="doc-status ${event.statusClass}">${escapeHtml(event.status)}</span>
      </div>
      <p>${escapeHtml(event.body)}</p>
      <div class="activity-source-row">
        <span>Source: ${escapeHtml(event.source)}</span>
        <span>${escapeHtml(event.category)}</span>
      </div>
      <div class="activity-event-actions">
        ${actions}
        <button class="text-button" type="button" data-activity-detail="${escapeHtml(event.id)}">Show details</button>
      </div>
    </article>
  `;
}

function renderPortfolioActivityState() {
  const page = document.querySelector("[data-portfolio-activity]");

  if (!page) {
    return;
  }

  const allEvents = getActivityEvents();
  if (isEmptyPortfolioMode()) {
    document.querySelector("[data-activity-open-timeline]")?.setAttribute("hidden", "");
    document.querySelector(".activity-toolbar")?.setAttribute("hidden", "");
    document.querySelector("[data-activity-summary-open]")?.setAttribute("hidden", "");
    const activityAsk = document.querySelector("[data-activity-ask]");
    if (activityAsk) {
      activityAsk.textContent = "Ask CMP how activity works";
    }
    const activityBadge = document.querySelector("[data-portfolio-activity] .prototype-badge");
    if (activityBadge) {
      activityBadge.textContent = "Activity";
    }
    const activityKicker = document.querySelector("[data-portfolio-activity] .section-kicker");
    if (activityKicker) {
      activityKicker.textContent = "Activity";
    }
    document.querySelector("[data-activity-event-count]").textContent = "0";
    document.querySelector("[data-activity-evidence-count]").textContent = "0";
    document.querySelector("[data-activity-action-count]").textContent = "0";
    document.querySelector("[data-activity-open-count]").textContent = "0";
    document.querySelector("[data-activity-open-detail]").textContent = "add property first";
    document.querySelector("[data-activity-visit-title]").textContent = "No activity yet";
    document.querySelector("[data-activity-visit-list]").innerHTML = "<li>Add a property to start the activity history.</li>";
    document.querySelector("[data-activity-watch-list]").innerHTML = "<li>No watch items yet</li>";
    const feed = document.querySelector("[data-activity-feed]");
    const empty = document.querySelector("[data-activity-empty]");
    if (feed) {
      feed.hidden = true;
      feed.innerHTML = "";
    }
    if (empty) {
      empty.hidden = false;
      empty.querySelector("h2").textContent = "No activity yet";
      empty.querySelector("p").textContent = "Property setup, evidence uploads, answers and service requests will appear here.";
      empty.querySelector("[data-activity-clear]")?.setAttribute("hidden", "");
    }
    renderActivitySummaryModalState();
    return;
  }
  document.querySelector("[data-activity-open-timeline]")?.removeAttribute("hidden");
  document.querySelector(".activity-toolbar")?.removeAttribute("hidden");
  document.querySelector("[data-activity-summary-open]")?.removeAttribute("hidden");
  const activityAsk = document.querySelector("[data-activity-ask]");
  if (activityAsk) {
    activityAsk.textContent = "Ask CMP what changed";
  }
  const activityBadge = document.querySelector("[data-portfolio-activity] .prototype-badge");
  if (activityBadge) {
    activityBadge.textContent = isNewPropertyMode() ? "57 The Butts activity" : "Portfolio activity";
  }
  const activityKicker = document.querySelector("[data-portfolio-activity] .section-kicker");
  if (activityKicker) {
    activityKicker.textContent = isNewPropertyMode() ? "Activity" : "PORTFOLIO ACTIVITY";
  }
  const activityHeaderBody = document.querySelector("[data-portfolio-activity] .portfolio-activity-header p:not(.section-kicker)");
  if (activityHeaderBody) {
    activityHeaderBody.textContent = isNewPropertyMode()
      ? "Activity shows what CMP has added or changed in this property file."
      : "Use Activity to explain what changed, why CMP recorded it and which property or support action it affects.";
  }
  const supportCreated = Boolean(activeSupportRequestForActivity());
  const newPropertySummary = isNewPropertyMode() ? newPropertyStatusSummary() : null;
  const newPropertyTasks = isNewPropertyMode() ? newPropertyTaskItems() : [];
  const newPropertyEvidenceUpdates = isNewPropertyMode()
    ? newPropertyEvidenceRows().filter((row) => row.filters.includes("uploaded") || row.id === "new-epc")
    : [];
  const visitItems = isFivePropertyMode()
    ? [
        "Portfolio Sweep prepared for five properties",
        "24 Maple Court marked evidence-ready",
        "3 Station Road onboarding gaps identified",
        ...(supportCreated ? ["Support request was created"] : [])
      ]
    : isNewPropertyMode()
    ? getActivityEvents().slice(0, 4).map((event) => event.title)
    : isTwoPropertyMode()
    ? [
        "Gas Safety renewal flagged for 18 Willow Brook Drive",
        labsState.eicrAdded ? "EICR evidence verified for 57 The Butts" : "EICR gap remains open for 57 The Butts",
        ...(supportCreated ? ["Support request was created"] : [])
      ]
    : labsState.eicrAdded
    ? [
        "EICR evidence was verified",
        "Gas Safety evidence was verified",
        "Inspection evidence is now the next useful upload",
        ...(supportCreated ? ["Support request was created"] : [])
      ]
    : [
        "Gas Safety evidence was verified",
        "Electrical Safety became the highest-priority evidence gap",
        ...(supportCreated ? ["Support request was created"] : [])
      ];
  const watchItems = isFivePropertyMode()
    ? ["3 Station Road onboarding", "18 Willow Brook Gas Safety renewal", "9 Canal View licensing answer"]
    : isNewPropertyMode()
    ? newPropertySummary.watchItems
    : isTwoPropertyMode()
    ? ["18 Willow Brook Gas Safety renewal", labsState.eicrAdded ? "57 The Butts inspection evidence" : "57 The Butts Electrical Safety", "Local licensing review"]
    : labsState.eicrAdded
    ? ["Inspection evidence", "Local licensing review"]
    : ["Electrical Safety evidence", "Inspection evidence", "Local licensing review"];

  document.querySelector("[data-activity-event-count]").textContent = String(allEvents.length);
  document.querySelector("[data-activity-evidence-count]").textContent = isNewPropertyMode() ? String(newPropertyEvidenceUpdates.length) : isFivePropertyMode() ? String(getPortfolioProperties().reduce((sum, property) => sum + property.verifiedEvidence, 0)) : isTwoPropertyMode() ? (labsState.eicrAdded ? "6" : "5") : labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-activity-action-count]").textContent = String((isNewPropertyMode() ? newPropertyTasks.length : isFivePropertyMode() ? portfolioUrgentActionCount() : isTwoPropertyMode() ? 2 : 1) + (supportCreated ? 1 : 0) + (labsState.inspectionStatusRecorded ? 1 : 0));
  document.querySelector("[data-activity-open-count]").textContent = String(isNewPropertyMode() ? newPropertyTasks.length : isFivePropertyMode() ? portfolioUrgentActionCount() : isTwoPropertyMode() ? 2 : 1);
  document.querySelector("[data-activity-open-detail]").textContent = isFivePropertyMode()
    ? "portfolio gaps"
    : isNewPropertyMode()
    ? "setup confirmations"
    : isTwoPropertyMode()
    ? labsState.eicrAdded ? "Gas renewal and inspection gap" : "Gas renewal and EICR gap"
    : labsState.eicrAdded ? "inspection evidence" : "EICR gap";
  document.querySelector("[data-activity-visit-title]").textContent = `${visitItems.length} useful updates`;
  document.querySelector("[data-activity-visit-list]").innerHTML = visitItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("[data-activity-watch-list]").innerHTML = watchItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const searchInput = document.querySelector("[data-activity-search]");
  if (searchInput && searchInput.value !== labsState.activitySearch) {
    searchInput.value = labsState.activitySearch;
  }

  document.querySelectorAll("[data-activity-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.activityFilter === labsState.activityFilter);
  });

  const events = allEvents.filter(activityMatchesCurrentView);
  const groups = [...new Set(events.map((event) => event.group))];
  const feed = document.querySelector("[data-activity-feed]");
  const empty = document.querySelector("[data-activity-empty]");

  if (feed) {
    feed.hidden = !events.length;
    feed.innerHTML = groups.map((group) => `
      <section class="activity-day">
        <span class="activity-day-label">${escapeHtml(group)}</span>
        <div class="activity-events">
          ${events.filter((event) => event.group === group).map(renderActivityEvent).join("")}
        </div>
      </section>
    `).join("");
  }

  if (empty) {
    empty.hidden = Boolean(events.length);
    empty.querySelector("[data-activity-clear]")?.removeAttribute("hidden");
  }

  renderActivitySummaryModalState();
}

function showPortfolioActivity({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-activity]",
    view: "activity",
    navLabel: "Activity",
    bodyClass: "portfolio-activity-active",
    response: getActivityAssistantResponse("What changed recently?"),
    scroll
  });
}

function recommendedServiceType(propertyId = serviceActionPropertyId()) {
  const property = getPortfolioProperties().find((item) => item.id === propertyId);
  if (property?.serviceType) {
    return property.serviceType;
  }

  if (propertyId === "willow-brook") {
    return "gas";
  }

  return labsState.eicrAdded ? "inspection" : "eicr";
}

function serviceRequestConfig(type = recommendedServiceType()) {
  const configs = {
    eicr: {
      requestType: "EICR support",
      eventTitle: "EICR support requested",
      eventBody: "CMP recorded a request to help arrange Electrical Safety support for this property.",
      linkedTo: "Electrical Safety"
    },
    inspection: {
      requestType: "Property inspection support",
      eventTitle: "Property inspection support requested",
      eventBody: "CMP recorded a request to help arrange the next property-inspection step.",
      linkedTo: "Inspection evidence"
    },
    gas: {
      requestType: "Gas Safety support",
      eventTitle: "Gas Safety support requested",
      eventBody: "CMP recorded a request to help arrange or upload Gas Safety renewal evidence for this property.",
      linkedTo: "Gas Safety renewal"
    },
    review: {
      requestType: "Property file review",
      eventTitle: "Property file review requested",
      eventBody: "CMP recorded a request for a human review of the property file, evidence gaps and recommended next actions.",
      linkedTo: "Property file review"
    },
    bundle: {
      requestType: "Compliance bundle support",
      eventTitle: "Compliance bundle support requested",
      eventBody: "CMP recorded a request to package the most useful support items for this property.",
      linkedTo: "Service bundle"
    },
    licensing: {
      requestType: "Licensing review support",
      eventTitle: "Licensing review support requested",
      eventBody: "CMP recorded a request to review the local licensing position for this property.",
      linkedTo: "Local licensing"
    },
    tenancy: {
      requestType: "Tenancy document review",
      eventTitle: "Tenancy document review requested",
      eventBody: "CMP recorded a request to review tenancy document readiness for this property.",
      linkedTo: "Tenancy documents"
    },
    moveIn: {
      requestType: "Move-in readiness pack",
      eventTitle: "Move-in readiness pack requested",
      eventBody: "CMP recorded a request to prepare move-in readiness support for this property.",
      linkedTo: "Move-in readiness"
    }
  };

  return configs[type] || configs[recommendedServiceType()];
}

function openSupportRequestForType(type = recommendedServiceType(), propertyId = serviceActionPropertyId()) {
  const requestType = serviceRequestConfig(type).requestType;
  return labsState.serviceRequests.find((request) => request.type === requestType && requestPropertyId(request) === propertyId && request.status !== "Cancelled");
}

function openRequestsForServiceScope() {
  return isAllServicePropertiesMode()
    ? labsState.serviceRequests.filter((request) => request.status !== "Cancelled")
    : openRequestsForProperty(selectedServiceProperty().id);
}

function serviceBundleItems(propertyId = serviceActionPropertyId()) {
  if (propertyId === "willow-brook") {
    return ["Gas Safety renewal", "Inspection evidence", "Alarm check", "Local licensing review"];
  }

  return labsState.eicrAdded
    ? ["Inspection evidence", "Local licensing review", "Tenancy document checklist", "Human file review"]
    : ["EICR support", "Inspection evidence", "Local licensing review", "Tenancy document checklist"];
}

function globalServiceCards(propertyId = serviceActionPropertyId()) {
  const property = getPortfolioPropertyById(propertyId);
  if (isFivePropertyMode() && !["the-butts", "willow-brook"].includes(property.id)) {
    return [
      {
        title: property.recommendedService || property.focus,
        propertyLabel: property.label || `${property.address} · ${property.postcode}`,
        body: property.priorityBody,
        status: property.state,
        statusClass: property.complianceScore < 60 ? "status-review-text" : property.complianceScore === 100 ? "status-good-text" : "status-watch-text",
        why: `Compliance score ${property.complianceScore}%, evidence score ${property.evidenceScore}%.`,
        primaryAction: property.serviceType === "licensing" ? `request:licensing:${property.id}` : property.serviceType === "bundle" ? "previewBundle" : `request:review:${property.id}`,
        primaryLabel: property.serviceType === "bundle" ? "Preview bundle" : "Request support",
        secondaryAction: `az:${property.id}`,
        secondaryLabel: "Run A-Z check"
      },
      {
        title: "Evidence pack review",
        propertyLabel: property.label || `${property.address} · ${property.postcode}`,
        body: property.missingEvidence.length ? `Missing evidence: ${property.missingEvidence.join(", ")}.` : "All core evidence is currently present.",
        status: property.evidenceScore === 100 ? "Complete" : "Evidence gaps",
        statusClass: property.evidenceScore === 100 ? "status-good-text" : "status-review-text",
        why: "Evidence score tracks stored documents separately from compliance readiness.",
        primaryAction: `az:${property.id}`,
        primaryLabel: "Review in A-Z",
        secondaryAction: "viewEvidence",
        secondaryLabel: "Open Evidence Vault"
      },
      {
        title: "Scenario check",
        propertyLabel: property.label || `${property.address} · ${property.postcode}`,
        body: `Current scenario: ${property.occupancy}. CMP can adapt the checker around this journey.`,
        status: property.journey,
        statusClass: "status-watch-text",
        why: "The same evidence can mean different things depending on occupancy, letting goal and licensing context.",
        primaryAction: `az:${property.id}`,
        primaryLabel: "Run scenario check",
        secondaryAction: "askReview",
        secondaryLabel: "Ask CMP why"
      }
    ];
  }

  const isWillow = property.id === "willow-brook";
  const eicrRequest = openSupportRequestForType("eicr", property.id);
  const gasRequest = openSupportRequestForType("gas", property.id);
  const inspectionRequest = openSupportRequestForType("inspection", property.id);
  const reviewRequest = openSupportRequestForType("review", property.id);
  const bundleRequest = openSupportRequestForType("bundle", property.id);
  const licensingRequest = openSupportRequestForType("licensing", property.id);
  const tenancyRequest = openSupportRequestForType("tenancy", property.id);

  return [
    {
      title: "EICR",
      propertyLabel: property.label,
      body: isWillow
        ? "Electrical Safety evidence is already verified and valid until 2029."
        : labsState.eicrAdded ? "Electrical Safety evidence is already verified for 57 The Butts." : "Arrange or upload Electrical Safety evidence for 57 The Butts.",
      status: isWillow ? "Verified" : labsState.eicrAdded ? "Verified / uploaded" : eicrRequest ? "Request open" : "Recommended",
      statusClass: isWillow || labsState.eicrAdded ? "status-good-text" : "status-review-text",
      why: isWillow ? "It means Electrical Safety is not the urgent support item for this property." : "It is core evidence before CMP can treat Electrical Safety as recorded.",
      primaryAction: isWillow || labsState.eicrAdded ? "viewEicr" : eicrRequest ? "openRequests" : "request:eicr",
      primaryLabel: isWillow || labsState.eicrAdded ? "View evidence" : eicrRequest ? "View open request" : "Request EICR support",
      secondaryAction: isWillow || labsState.eicrAdded ? null : "uploadEicr",
      secondaryLabel: isWillow || labsState.eicrAdded ? "" : "Upload existing EICR"
    },
    {
      title: "Gas Safety",
      propertyLabel: property.label,
      body: isWillow
        ? "Gas Safety evidence is approaching its renewal window for 18 Willow Brook Drive."
        : "Gas Safety evidence is already verified and stored in the property file.",
      status: isWillow ? gasRequest ? "Request open" : "Recommended / expiring soon" : "Verified",
      statusClass: isWillow ? "status-watch-text" : "status-good-text",
      why: isWillow ? "It is the most time-sensitive portfolio item in this two-property demo." : "It keeps the property file ready for renewal tracking and tenant-facing evidence.",
      primaryAction: isWillow ? gasRequest ? "openRequests" : "request:gas" : "viewEvidence",
      primaryLabel: isWillow ? gasRequest ? "View open request" : "Request Gas Safety support" : "View evidence",
      secondaryAction: isWillow ? "uploadGas" : "askGas",
      secondaryLabel: isWillow ? "Upload Gas Safety certificate" : "Ask CMP why"
    },
    {
      title: "EPC",
      propertyLabel: property.label,
      body: isWillow ? "CMP has an EPC official record confirmed for this address and valid until 2030." : "CMP has matched an EPC official record to this property.",
      status: "Confirmed",
      statusClass: "status-good-text",
      why: "It helps CMP understand the property and keeps the record tied to the address.",
      primaryAction: "viewEvidence",
      primaryLabel: "View record",
      secondaryAction: "askEpc",
      secondaryLabel: "Ask CMP why"
    },
    {
      title: "Property inspection",
      propertyLabel: property.label,
      body: isWillow ? "Add a recent inspection record to strengthen the tenanted property review." : "Add or arrange a recent inspection record to keep the property file current.",
      status: inspectionRequest ? "Request open" : isWillow ? "Useful follow-up" : labsState.eicrAdded ? "Recommended" : "Follow-up",
      statusClass: isWillow || labsState.eicrAdded ? "status-review-text" : "status-watch-text",
      why: "Inspection evidence explains what was checked and what needs follow-up.",
      primaryAction: inspectionRequest ? "openRequests" : "request:inspection",
      primaryLabel: inspectionRequest ? "View open request" : "Request inspection support",
      secondaryAction: "uploadInspection",
      secondaryLabel: "Upload inspection evidence"
    },
    {
      title: "Licensing review",
      propertyLabel: property.label,
      body: isWillow ? "Review local rules for the Birmingham postcode and current tenancy setup." : "Review local rules and property setup before treating licensing as confirmed.",
      status: licensingRequest ? "Request open" : "Worth reviewing",
      statusClass: "status-watch-text",
      why: "Local licensing can depend on council area, occupancy and property setup.",
      primaryAction: licensingRequest ? "openRequests" : "request:licensing",
      primaryLabel: licensingRequest ? "View open request" : "Request review",
      secondaryAction: "licensing",
      secondaryLabel: "Open Compliance Centre"
    },
    {
      title: "Tenancy document review",
      propertyLabel: property.label,
      body: isWillow ? "Check tenant-facing documents and evidence that has been landlord-confirmed but not uploaded." : "Check tenancy paperwork, tenant-facing evidence and useful move-in documents.",
      status: tenancyRequest ? "Request open" : isWillow ? "Useful for tenant evidence" : "Useful before letting",
      statusClass: tenancyRequest ? "status-watch-text" : "status-neutral-text",
      why: "It reduces repeated admin before advertising or move-in.",
      primaryAction: tenancyRequest ? "openRequests" : "request:tenancy",
      primaryLabel: tenancyRequest ? "View open request" : "Request review",
      secondaryAction: "askTenancy",
      secondaryLabel: "Ask CMP what to include"
    },
    {
      title: "Full property compliance review",
      propertyLabel: property.label,
      body: "A human review of the property file, evidence gaps and next recommended actions.",
      status: reviewRequest ? "Request open" : "Optional reassurance",
      statusClass: reviewRequest ? "status-watch-text" : "status-neutral-text",
      why: "It is useful when you want extra confidence before making decisions.",
      primaryAction: reviewRequest ? "openRequests" : "request:review",
      primaryLabel: reviewRequest ? "View open request" : "Request review",
      secondaryAction: "askReview",
      secondaryLabel: "What will be reviewed?"
    },
    {
      title: "Move-in readiness pack",
      propertyLabel: property.label,
      body: isWillow
        ? "Less urgent unless you are preparing to re-let, but useful for certificates, alarm checks and tenant documents."
        : "Prepare certificates, alarm checks, tenancy documents and inspection evidence before a new tenancy.",
      status: bundleRequest ? "Request open" : isWillow ? "Less urgent" : "Useful before letting",
      statusClass: bundleRequest ? "status-watch-text" : "status-neutral-text",
      why: "It groups the practical items landlords usually need before move-in.",
      primaryAction: bundleRequest ? "openRequests" : "previewBundle",
      primaryLabel: bundleRequest ? "View open request" : "Preview pack",
      secondaryAction: "askBundle",
      secondaryLabel: "Ask CMP what to include"
    }
  ];
}

function portfolioServiceCards() {
  if (isFivePropertyMode()) {
    return getPortfolioProperties()
      .filter((property) => property.complianceScore < 100 || property.recommendedService !== "None needed")
      .slice()
      .sort((a, b) => (a.complianceScore + a.evidenceScore) - (b.complianceScore + b.evidenceScore))
      .map((property) => ({
        title: property.recommendedService || property.focus,
        propertyLabel: property.label || `${property.address} · ${property.postcode}`,
        body: property.priorityBody,
        status: property.state,
        statusClass: property.complianceScore < 60 ? "status-review-text" : property.complianceScore === 100 ? "status-good-text" : "status-watch-text",
        why: `Compliance score ${property.complianceScore}%, evidence score ${property.evidenceScore}%.`,
        primaryAction: property.serviceType === "gas" ? `request:gas:${property.id}` : property.serviceType === "licensing" ? `request:licensing:${property.id}` : property.serviceType === "bundle" ? "previewBundle" : `request:review:${property.id}`,
        primaryLabel: property.serviceType === "bundle" ? "Preview bundle" : "Request support",
        secondaryAction: `az:${property.id}`,
        secondaryLabel: "Run A-Z check"
      }));
  }

  const willow = getPortfolioPropertyById("willow-brook");
  const butts = getPortfolioPropertyById("the-butts");
  const willowGasRequest = openSupportRequestForType("gas", willow.id);
  const buttsEicrRequest = openSupportRequestForType("eicr", butts.id);
  const buttsInspectionRequest = openSupportRequestForType("inspection", butts.id);

  return [
    {
      title: "Gas Safety renewal",
      propertyLabel: willow.label,
      body: "Gas Safety evidence is approaching its renewal window for 18 Willow Brook Drive.",
      status: willowGasRequest ? "Request open" : "Most urgent",
      statusClass: "status-watch-text",
      why: "Renewal evidence is needed in 21 days, so CMP ranks this first across the portfolio.",
      primaryAction: willowGasRequest ? "openRequests" : "request:gas:willow-brook",
      primaryLabel: willowGasRequest ? "View open request" : "Request Gas Safety support",
      secondaryAction: "uploadGas",
      secondaryLabel: "Upload certificate"
    },
    {
      title: "EICR support",
      propertyLabel: butts.label,
      body: labsState.eicrAdded ? "Electrical Safety evidence is verified for 57 The Butts." : "Electrical Safety evidence is still missing for 57 The Butts.",
      status: labsState.eicrAdded ? "Verified / uploaded" : buttsEicrRequest ? "Request open" : "Evidence gap",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      why: labsState.eicrAdded ? "It can move down the list while inspection evidence becomes the follow-up." : "It remains a core certificate gap after the Gas Safety renewal priority.",
      primaryAction: labsState.eicrAdded ? "viewEicr" : buttsEicrRequest ? "openRequests" : "request:eicr:the-butts",
      primaryLabel: labsState.eicrAdded ? "View evidence" : buttsEicrRequest ? "View open request" : "Request EICR support",
      secondaryAction: labsState.eicrAdded ? null : "uploadEicr",
      secondaryLabel: labsState.eicrAdded ? "" : "Upload existing EICR"
    },
    {
      title: "Inspection evidence",
      propertyLabel: butts.label,
      body: "Add or arrange a recent inspection record so the condition record is stronger.",
      status: buttsInspectionRequest ? "Request open" : labsState.eicrAdded ? "Recommended next" : "Follow-up",
      statusClass: labsState.eicrAdded ? "status-review-text" : "status-watch-text",
      why: "It is the next useful property-file improvement once core certificates are handled.",
      primaryAction: buttsInspectionRequest ? "openRequests" : "request:inspection:the-butts",
      primaryLabel: buttsInspectionRequest ? "View open request" : "Request inspection support",
      secondaryAction: "uploadInspection",
      secondaryLabel: "Upload inspection evidence"
    },
    {
      title: "Alarm evidence",
      propertyLabel: willow.label,
      body: "Smoke and CO alarm evidence is still missing for the tenanted property review.",
      status: "Needs evidence",
      statusClass: "status-review-text",
      why: "It keeps tenant-facing evidence visible without outranking the Gas Safety renewal.",
      primaryAction: "uploadAlarms",
      primaryLabel: "Add evidence",
      secondaryAction: "askAlarms",
      secondaryLabel: "Ask CMP why"
    },
    {
      title: "Licensing review",
      propertyLabel: "Both properties · postcode review",
      body: "Review local rules for Coventry and Birmingham postcodes as a portfolio watch item.",
      status: "Worth reviewing",
      statusClass: "status-watch-text",
      why: "Local licensing can depend on council area, postcode, occupancy and property setup.",
      primaryAction: "licensing",
      primaryLabel: "Open Compliance Centre",
      secondaryAction: "askLicensingPortfolio",
      secondaryLabel: "Ask CMP what matters"
    }
  ];
}

function askChatStatusChips() {
  const activeRequest = activeSupportRequestForActivity();

  if (activeRequest) {
    return ["Support request open", "CMP review pending", "Evidence checked", "No duplicate needed"];
  }

  if (isEmptyPortfolioMode()) {
    return ["No properties yet", "Setup guidance", "A-Z preview ready"];
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    return [
      "Address matched",
      summary.findingsConfirmed ? "Findings confirmed" : "EPC prepared",
      summary.needsAnswer.length ? `${summary.needsAnswer.length} answers needed` : "Details confirmed",
      summary.evidenceConfidenceScore ? `${summary.evidenceConfidenceScore}% evidence confidence` : "No uploaded documents yet"
    ];
  }

  if (isFivePropertyMode()) {
    return ["5 properties compared", "1 evidence-ready", "2 urgent actions", "Portfolio Sweep ready"];
  }

  if (isTwoPropertyMode()) {
    return ["2 properties compared", "Gas renewal soon", "EICR gap checked", "Tasks checked", "Support requests checked"];
  }

  if (labsState.eicrAdded) {
    return ["EICR verified", "Inspection evidence missing", "Licensing still watching", "Tasks checked", "Support requests checked"];
  }

  return ["Evidence Vault checked", "Compliance Centre checked", "Tasks checked", "Activity reviewed", "Support requests checked"];
}

function askContextSequenceItems() {
  if (isEmptyPortfolioMode()) {
    return ["Setup route", "Evidence checklist", "First property needed"];
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    return [
      "Address matched",
      summary.findingsConfirmed ? "Findings confirmed" : "EPC prepared",
      `${summary.profileSetupScore}% setup`,
      summary.evidenceConfidenceScore ? `${summary.evidenceConfidenceScore}% evidence` : "Evidence awaiting upload"
    ];
  }

  if (isFivePropertyMode()) {
    return ["Shared answers", "Property matrix", "Scores calculated", "Actions grouped"];
  }

  if (isTwoPropertyMode()) {
    return ["Evidence compared", "Renewals checked", "Support requests reviewed", "Properties ranked"];
  }

  if (labsState.eicrAdded) {
    return ["EICR verified", "Inspection gap checked", "Tasks reviewed", "Activity matched"];
  }

  return ["Evidence checked", "Compliance matched", "Tasks prioritised", "Support requests checked"];
}

function askContextSources() {
  if (isEmptyPortfolioMode()) {
    return [
      { name: "Property details", body: "No address or postcode is connected yet.", state: "Empty" },
      { name: "A-Z Checker", body: "Can preview setup questions before property scoring.", state: "Ready" },
      { name: "Evidence Vault", body: "Upload paths are available after property setup.", state: "Empty" }
    ];
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const tasks = newPropertyTaskItems();
    return [
      { name: "Property details", body: summary.statusLine, state: summary.profileSetupLabel },
      { name: "Evidence Vault", body: summary.evidenceConfidenceHelp, state: summary.evidenceConfidenceLabel },
      { name: "Compliance Centre", body: "Uses confirmed setup answers before treating compliance scoring as reliable.", state: summary.readinessLabel },
      { name: "Tasks", body: "Setup tasks are generated from the property profile state.", state: `${tasks.length} setup ${tasks.length === 1 ? "task" : "tasks"}` },
      { name: "Book a Service", body: "Support recommendations wait until evidence gaps are confirmed.", state: "Not recommended yet" }
    ];
  }

  const activeRequest = activeSupportRequestForActivity();
  const evidenceState = isFivePropertyMode() ? `${portfolioEvidenceScore()}% portfolio score` : isTwoPropertyMode() ? (labsState.eicrAdded ? "6 verified / 3 gaps" : "5 verified / 4 gaps") : labsState.eicrAdded ? "3 verified / inspection missing" : "2 verified / 1 missing";
  const complianceState = isFivePropertyMode() ? `${portfolioComplianceScore()}% portfolio score` : isTwoPropertyMode() ? "Gas renewal first" : labsState.eicrAdded ? "Inspection next" : "EICR priority";
  const taskState = activeRequest ? "Support review open" : isFivePropertyMode() ? "Portfolio actions" : isTwoPropertyMode() ? "Gas renewal task" : labsState.eicrAdded ? "Inspection task" : "EICR task";
  const supportState = activeRequest ? "Awaiting review" : "No open requests";

  return [
    {
      name: "Property details",
      body: "Uses address, postcode, occupancy and compliance goal.",
      state: isFivePropertyMode() ? "5 properties" : isTwoPropertyMode() ? "2 properties" : "57 The Butts"
    },
    {
      name: "Evidence Vault",
      body: "Uses uploaded certificates, EPC matches and missing document gaps.",
      state: evidenceState
    },
    {
      name: "Compliance Centre",
      body: "Uses evidence status and next compliance checks.",
      state: complianceState
    },
    {
      name: "Tasks",
      body: "Uses open actions and completed demo updates.",
      state: taskState
    },
    {
      name: "Activity history",
      body: "Uses recent evidence, support and landlord-answer events.",
      state: isFivePropertyMode() ? "Portfolio sweep" : isTwoPropertyMode() ? "Both properties" : labsState.eicrAdded ? "EICR verified" : "EICR gap identified"
    },
    {
      name: "Support requests",
      body: "Uses open requests so CMP avoids duplicate support prompts.",
      state: supportState
    },
    {
      name: "Book a Service",
      body: "Uses the recommended support pathway for this property.",
      state: isFivePropertyMode() ? "Grouped by property" : isTwoPropertyMode() ? "Gas Safety support" : labsState.eicrAdded ? "Inspection support" : "EICR support"
    }
  ];
}

function askContextHighlight() {
  const activeRequest = activeSupportRequestForActivity();

  if (activeRequest) {
    const property = getPortfolioPropertyById(requestPropertyId(activeRequest));
    return {
      title: `${activeRequest.type} is awaiting review`,
      body: `CMP is keeping the open request tied to ${property.address} and will not suggest creating the same request again.`
    };
  }

  if (isEmptyPortfolioMode()) {
    return {
      title: "No property file yet",
      body: "CMP needs at least one property before it can personalise checks, evidence gaps or service recommendations."
    };
  }

  if (isNewPropertyMode()) {
    return {
      title: "57 The Butts is ready for setup review",
      body: "CMP has matched the address and prepared EPC context, but property details and uploaded evidence still need landlord confirmation."
    };
  }

  if (isFivePropertyMode()) {
    return {
      title: "Portfolio Sweep is ready",
      body: `CMP has compared five properties: ${fullyCompliantProperties().length} evidence-ready, ${portfolioUrgentActionCount()} urgent actions and ${portfolioEvidenceGapCount()} evidence gaps.`
    };
  }

  if (isTwoPropertyMode()) {
    return {
      title: "18 Willow Brook Drive needs attention first",
      body: "CMP compared both properties and found Gas Safety renewal is more time-sensitive than the 57 The Butts evidence follow-up."
    };
  }

  if (labsState.eicrAdded) {
    return {
      title: "Inspection evidence is the next useful step",
      body: "CMP has seen the EICR is verified and is now watching inspection evidence and licensing."
    };
  }

  return {
    title: "Electrical Safety is the clearest next step",
    body: "CMP has checked evidence, compliance status and tasks for 57 The Butts."
  };
}

function resolveUtilityAskPrompt(rawValue) {
  const value = (rawValue || "").trim();
  if (!value) {
    return currentGlobalAskPrompts()[0];
  }

  const exact = currentGlobalAskPrompts().find((prompt) => prompt.toLowerCase() === value.toLowerCase());
  if (exact) {
    return exact;
  }

  const lower = value.toLowerCase();
  if (lower.includes("today") || lower.includes("first") || lower.includes("next")) {
    return isEmptyPortfolioMode() ? "How do I get started?" : "What should I do today?";
  }
  if (lower.includes("property") || lower.includes("attention")) {
    return isEmptyPortfolioMode() ? "What information do I need to add a property?" : "Which property needs attention?";
  }
  if (lower.includes("evidence") || lower.includes("missing") || lower.includes("certificate")) {
    return isEmptyPortfolioMode() ? "What documents should I prepare?" : "What evidence is missing?";
  }
  if (lower.includes("explain") || lower.includes("file")) {
    return isEmptyPortfolioMode() ? "How does CMP help landlords?" : "Explain this property file";
  }
  if (lower.includes("summar")) {
    return isEmptyPortfolioMode() ? "How does CMP help landlords?" : "Summarise my portfolio";
  }
  if (lower.includes("wait") || lower.includes("later")) {
    return "What can wait until later?";
  }

  return currentGlobalAskPrompts()[0];
}

function setUtilityAskPrompt(prompt) {
  labsState.utilityAskPrompt = resolveUtilityAskPrompt(prompt);
  const response = getGlobalAskAssistantResponse(labsState.utilityAskPrompt);
  const askResponse = document.querySelector("[data-utility-ask-response]");
  if (askResponse) {
    askResponse.textContent = formatControlledAssistantResponse(response);
  }
  setAssistantResponse(response);
  renderPortfolioUtilityState();
  flashAssistantResponse();
}

function renderPortfolioUtilityState() {
  const visibleAskPrompts = currentGlobalAskPrompts();
  const activePrompt = visibleAskPrompts.includes(labsState.utilityAskPrompt)
    ? labsState.utilityAskPrompt
    : visibleAskPrompts[0];
  const askResponse = document.querySelector("[data-utility-ask-response]");
  if (askResponse) {
    askResponse.textContent = formatControlledAssistantResponse(getGlobalAskAssistantResponse(activePrompt));
  }

  const promptGrid = document.querySelector("[data-utility-ask-prompts]");
  if (promptGrid) {
    promptGrid.innerHTML = visibleAskPrompts.map((prompt) => {
      const meta = utilityAskPromptMeta[prompt] || { category: "Ask CMP", helper: "Ask for setup guidance." };
      return `
        <button class="utility-prompt-card ask-command-prompt-card" type="button" data-utility-ask-prompt="${escapeHtml(prompt)}">
          <span class="source-badge">${escapeHtml(meta.category)}</span>
          <strong>${escapeHtml(prompt)}</strong>
          <small>${escapeHtml(meta.helper)}</small>
        </button>
      `;
    }).join("");
  }

  document.querySelectorAll("[data-utility-ask-prompt]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.utilityAskPrompt === activePrompt);
  });

  const chatUser = document.querySelector("[data-ask-chat-user]");
  const chatResponse = document.querySelector("[data-ask-chat-response]");
  const statusChips = document.querySelector("[data-ask-status-chips]");
  const sequence = document.querySelector(".ask-context-sequence");
  const sourceGrid = document.querySelector("[data-ask-source-grid]");
  const chatTitle = document.querySelector(".ask-chat-topline h2");
  const chatState = document.querySelector("[data-ask-chat-state]");
  const utilityAskInput = document.querySelector('[data-utility-ask-form] input[name="question"]');
  const askHeaderBody = document.querySelector("[data-portfolio-ask] .portfolio-utility-header p:not(.section-kicker)");
  const askCheckChips = document.querySelector("[data-portfolio-ask] .ask-check-chip-row");
  const highlight = askContextHighlight();

  if (chatUser) {
    chatUser.textContent = activePrompt;
  }
  if (chatResponse) {
    chatResponse.textContent = formatControlledAssistantResponse(getGlobalAskAssistantResponse(activePrompt));
  }
  if (statusChips) {
    statusChips.innerHTML = askChatStatusChips().map((chip) => `<span><i></i>${escapeHtml(chip)}</span>`).join("");
  }
  if (sequence) {
    sequence.innerHTML = askContextSequenceItems().map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  }
  if (sourceGrid) {
    sourceGrid.innerHTML = askContextSources().map((source) => `
      <article class="ask-source-card">
        <div>
          <strong>${escapeHtml(source.name)}</strong>
          <span class="doc-status status-neutral-text">${escapeHtml(source.state)}</span>
        </div>
        <p>${escapeHtml(source.body)}</p>
      </article>
    `).join("");
  }
  if (chatTitle) {
    chatTitle.textContent = isEmptyPortfolioMode()
      ? "Setup assistant"
      : isNewPropertyMode()
      ? "Ask CMP about 57 The Butts"
      : isFivePropertyMode()
        ? "Portfolio intelligence for 5 properties"
        : isTwoPropertyMode() ? "Portfolio intelligence for 2 properties" : "Portfolio intelligence for 57 The Butts";
  }
  if (chatState) {
    chatState.textContent = isEmptyPortfolioMode() ? "Setup guidance" : isNewPropertyMode() ? "New profile" : "Demo data only";
  }
  if (utilityAskInput) {
    utilityAskInput.placeholder = isEmptyPortfolioMode()
      ? "What should I prepare before adding a property?"
      : isNewPropertyMode()
      ? "Ask CMP about 57 The Butts..."
      : "Ask CMP anything about your portfolio...";
  }
  if (askHeaderBody) {
    askHeaderBody.textContent = isEmptyPortfolioMode()
      ? "Ask CMP what to prepare before adding your first property."
      : isNewPropertyMode()
      ? "Ask CMP about what it found for 57 The Butts and what still needs landlord confirmation."
      : "Ask CMP to read the property file, evidence, tasks, activity and support requests, then explain the next step.";
  }
  if (askCheckChips) {
    askCheckChips.innerHTML = (isEmptyPortfolioMode()
      ? ["property setup", "documents to prepare", "first property", "A-Z preview"]
      : isNewPropertyMode()
      ? ["address match", "EPC context", "setup tasks", "missing certificates"]
      : ["property file", "certificates", "missing evidence", "upcoming reviews", "support requests", "activity history"]
    ).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  }

  const highlightTitle = document.querySelector("[data-ask-context-highlight-title]");
  const highlightBody = document.querySelector("[data-ask-context-highlight-body]");
  if (highlightTitle) {
    highlightTitle.textContent = highlight.title;
  }
  if (highlightBody) {
    highlightBody.textContent = highlight.body;
  }

  const askAzShortcut = document.querySelector("[data-ask-az-shortcut]");
  if (askAzShortcut) {
    const shortcutButtonAttr = isNewPropertyMode()
      ? "data-new-setup-start"
      : `data-az-mode="${isFivePropertyMode() ? "portfolio" : "single"}"`;
    askAzShortcut.innerHTML = `
      <article class="az-checker-section">
        <div class="az-checker-header">
          <div>
            <p class="section-kicker">Suggested next workflow</p>
            <h2>${isEmptyPortfolioMode() ? "Add your first property first" : isNewPropertyMode() ? "Continue the guided check" : isFivePropertyMode() ? "Run Portfolio Sweep" : "Run the Compliance A-Z Checker"}</h2>
            <p>${isEmptyPortfolioMode() ? "The checker becomes useful once there is an address to check. You can still preview the setup questions from Compliance Centre." : isNewPropertyMode() ? "Use the guided check to confirm property details, occupancy and evidence before CMP recommends services." : "Use the checker to turn CMP's context into scores, gaps and service recommendations."}</p>
          </div>
          <div class="button-row">
            <button class="${isEmptyPortfolioMode() ? "secondary-button" : "primary-button"}" type="button" ${shortcutButtonAttr}>${isEmptyPortfolioMode() ? "Preview A-Z Checker" : isNewPropertyMode() ? "Continue guided check" : isFivePropertyMode() ? "Open Portfolio Sweep" : "Open A-Z Checker"}</button>
          </div>
        </div>
      </article>
    `;
  }

  renderGlobalServiceState();
  renderLearnGuides();
  renderSettingsState();
}

function renderGlobalServiceState() {
  const title = document.querySelector("[data-global-service-title]");

  if (!title) {
    return;
  }

  const properties = getPortfolioProperties();
  const selectedId = selectedServicePropertyId();
  const isAllMode = isAllServicePropertiesMode();
  const serviceKicker = document.querySelector(".service-recommendation-card .section-kicker");
  const pathwaySection = document.querySelector(".service-pathway-section");
  const commercialServicesSection = document.querySelector(".commercial-services-section");
  const openRequestsPanel = document.querySelector("[data-global-open-requests-panel]");

  if (!properties.length) {
    if (serviceKicker) {
      serviceKicker.textContent = "SETUP REQUIRED";
    }
    const context = document.querySelector("[data-service-property-context]");
    if (context) {
      context.classList.remove("is-portfolio-selector");
      context.innerHTML = `
        <div>
          <p>Setup required</p>
          <strong>No properties yet</strong>
          <span>Add a property before CMP can recommend a service.</span>
        </div>
      `;
    }
    title.textContent = "Add a property before booking support";
    document.querySelector("[data-global-service-body]").textContent = "CMP needs a property address, scenario and evidence baseline before it can recommend an EICR, Gas Safety, licensing or evidence-pack service.";
    document.querySelector("[data-global-service-actions]").innerHTML = `
      <button class="primary-button" type="button" data-properties-add>Add your first property</button>
      <button class="secondary-button" type="button" data-global-service-action="askPrepare">Ask CMP what to prepare</button>
    `;
    pathwaySection?.setAttribute("hidden", "");
    commercialServicesSection?.setAttribute("hidden", "");
    openRequestsPanel?.setAttribute("hidden", "");
    const cardGrid = document.querySelector("[data-global-service-cards]");
    if (cardGrid) {
      cardGrid.innerHTML = "";
    }
    document.querySelector("[data-global-service-request-count]").textContent = "0 open";
    const list = document.querySelector("[data-global-service-requests]");
    if (list) {
      list.innerHTML = "<p>No support request is open. Add a property first.</p>";
    }
    return;
  }

  if (isNewPropertyMode()) {
    if (serviceKicker) {
      serviceKicker.textContent = "SETUP FIRST";
    }
    const context = document.querySelector("[data-service-property-context]");
    if (context) {
      context.classList.remove("is-portfolio-selector");
      context.innerHTML = `
        <div>
          <p>New property profile</p>
          <strong>57 The Butts · CV1 3BJ</strong>
          <span>Confirm details and evidence gaps before booking support.</span>
        </div>
      `;
    }
    title.textContent = "Confirm the property profile before booking support";
    document.querySelector("[data-global-service-body]").textContent = "CMP can recommend services once you confirm property type, occupancy and which Gas Safety, Electrical Safety, licensing or evidence gaps apply.";
    document.querySelector("[data-global-service-actions]").innerHTML = `
      <button class="primary-button" type="button" data-new-setup-start>Continue guided check</button>
      <button class="secondary-button" type="button" data-global-service-action="askPrepare">Ask CMP what to prepare</button>
    `;
    pathwaySection?.setAttribute("hidden", "");
    commercialServicesSection?.setAttribute("hidden", "");
    openRequestsPanel?.setAttribute("hidden", "");
    const cardGrid = document.querySelector("[data-global-service-cards]");
    if (cardGrid) {
      cardGrid.innerHTML = "";
    }
    document.querySelector("[data-global-service-request-count]").textContent = "0 open";
    const list = document.querySelector("[data-global-service-requests]");
    if (list) {
      list.innerHTML = "<p>No support request is open. Confirm the property details first.</p>";
    }
    return;
  }

  if (serviceKicker) {
    serviceKicker.textContent = "RECOMMENDED NEXT SUPPORT";
  }
  pathwaySection?.removeAttribute("hidden");
  commercialServicesSection?.removeAttribute("hidden");
  openRequestsPanel?.removeAttribute("hidden");

  const property = selectedServiceProperty();
  const recommendationProperty = isAllMode ? portfolioUrgentProperty() : property;
  const recommendationType = recommendedServiceType(recommendationProperty.id);
  const existingRecommendationRequest = openSupportRequestForType(recommendationType, recommendationProperty.id);
  const isWillow = recommendationProperty.id === "willow-brook";
  const serviceFocusTiles = isFivePropertyMode()
    ? getPortfolioProperties().map((item, index) => `
      <article class="service-focus-tile${selectedId === item.id ? " is-selected" : ""}">
        <span class="source-badge">${item.complianceScore === 100 ? "Evidence-ready" : index === 0 ? "Workspace" : item.state}</span>
        <h3>${escapeHtml(item.address)}</h3>
        <p>${escapeHtml(item.focus)}</p>
        <strong>${item.complianceScore}% compliance · ${item.evidenceScore}% evidence</strong>
        <button class="${item.mostUrgent || item.complianceScore < 60 ? "primary-button" : "secondary-button"}" type="button" data-service-property-select="${escapeHtml(item.id)}">Focus this property</button>
      </article>
    `).join("")
    : `
      <article class="service-focus-tile${selectedId === "willow-brook" ? " is-selected" : ""}">
        <span class="source-badge">Most urgent</span>
        <h3>18 Willow Brook Drive</h3>
        <p>Gas Safety renewal</p>
        <strong>Renewal needed in 21 days</strong>
        <button class="primary-button" type="button" data-service-property-select="willow-brook">Focus this property</button>
      </article>
      <article class="service-focus-tile${selectedId === "the-butts" ? " is-selected" : ""}">
        <span class="source-badge">Evidence gap</span>
        <h3>57 The Butts</h3>
        <p>${labsState.eicrAdded ? "Inspection evidence" : "Electrical Safety evidence"}</p>
        <strong>${labsState.eicrAdded ? "EICR verified" : "EICR still missing"}</strong>
        <button class="secondary-button" type="button" data-service-property-select="the-butts">Focus this property</button>
      </article>
    `;

  const context = document.querySelector("[data-service-property-context]");
  if (context) {
    context.classList.toggle("is-portfolio-selector", properties.length > 1);
    context.innerHTML = properties.length > 1
      ? `
        <div class="service-selector-heading">
          <p class="section-kicker">Portfolio focus</p>
          <h2>Choose where CMP should focus</h2>
          <span>CMP can show support across the portfolio or focus on one property at a time.</span>
        </div>
        <div class="service-focus-tabs" aria-label="Choose Book a Service scope">
          <button class="${isAllMode ? "is-active" : ""}" type="button" data-service-property-select="all">
            <strong>All properties</strong>
            <small>Portfolio view</small>
          </button>
          <button class="${selectedId === portfolioUrgentProperty().id ? "is-active" : ""}" type="button" data-service-property-select="${escapeHtml(portfolioUrgentProperty().id)}">
            <strong>Highest priority</strong>
            <small>${escapeHtml(portfolioUrgentProperty().address)}</small>
          </button>
          <button class="${selectedId === "the-butts" ? "is-active" : ""}" type="button" data-service-property-select="the-butts">
            <strong>Recent properties</strong>
            <small>57 The Butts</small>
          </button>
        </div>
        <div class="service-focus-tiles">
          ${serviceFocusTiles}
        </div>
        <label class="service-property-search">
          <span>Find another property</span>
          <input type="search" placeholder="Search address or postcode..." disabled>
        </label>
      `
      : `
        <div>
          <p>Current recommendation for</p>
          <strong>${escapeHtml(property.label)}</strong>
          <span>${escapeHtml(property.occupancy)} · ${escapeHtml(property.journey)}</span>
        </div>
      `;
  }

  title.textContent = isAllMode
    ? isFivePropertyMode() ? "Resolve the portfolio's highest-risk gaps first" : "Arrange Gas Safety renewal first"
    : isWillow
    ? "Arrange Gas Safety renewal"
    : labsState.eicrAdded ? "Arrange or record a property inspection" : "Arrange an EICR";
  document.querySelector("[data-global-service-body]").textContent = isAllMode
    ? isFivePropertyMode()
      ? `CMP has compared five properties. Start with 3 Station Road onboarding, Willow Brook renewal evidence and Canal View licensing; 24 Maple Court can stay on monitoring.`
      : `CMP has compared both properties and found Gas Safety renewal for 18 Willow Brook Drive as the most time-sensitive support item. ${labsState.eicrAdded ? "57 The Butts should move to inspection evidence next." : "57 The Butts still needs EICR evidence."}`
    : isWillow
    ? "Gas Safety evidence is approaching its renewal window for 18 Willow Brook Drive. CMP can help you upload the new certificate or request support arranging a check."
    : labsState.eicrAdded
      ? "Core certificates are now recorded. The next useful evidence item is a recent property inspection record."
      : "Electrical Safety is the clearest missing evidence area for 57 The Butts. CMP can help you upload an existing report or request support arranging one.";

  const primaryLabel = existingRecommendationRequest
    ? "View open request"
    : isWillow ? "Request Gas Safety support" : labsState.eicrAdded ? "Request inspection support" : "Request EICR support";
  const primaryAction = existingRecommendationRequest ? "openRequests" : "support";
  const secondaryAction = isWillow ? "uploadGas" : labsState.eicrAdded ? "uploadInspection" : "uploadEicr";
  const secondaryLabel = isWillow ? "Upload Gas Safety certificate" : labsState.eicrAdded ? "Upload inspection evidence" : "Upload existing EICR";

  document.querySelector("[data-global-service-actions]").innerHTML = `
    <button class="primary-button" type="button" data-global-service-action="${primaryAction}">${primaryLabel}</button>
    <button class="secondary-button" type="button" data-global-service-action="${secondaryAction}">${secondaryLabel}</button>
    <button class="text-button" type="button" data-global-service-action="ask">Ask CMP why</button>
  `;

  const cardGrid = document.querySelector("[data-global-service-cards]");
  if (cardGrid) {
    const serviceCards = isAllMode ? portfolioServiceCards() : globalServiceCards(property.id);
    cardGrid.innerHTML = serviceCards.map((card) => `
      <article class="service-option-preview commercial-service-card">
        <div class="service-card-top">
          <h3>${escapeHtml(card.title)}</h3>
          <span class="doc-status ${card.statusClass}">${escapeHtml(card.status)}</span>
        </div>
        <div class="service-card-property-row">
          <span>Property</span>
          <strong>${escapeHtml(card.propertyLabel)}</strong>
        </div>
        <p>${escapeHtml(card.body)}</p>
        <div class="commercial-service-why">
          <strong>Why it matters</strong>
          <span>${escapeHtml(card.why)}</span>
        </div>
        <div class="button-row">
          <button class="primary-button" type="button" data-global-service-action="${escapeHtml(card.primaryAction)}">${escapeHtml(card.primaryLabel)}</button>
          ${card.secondaryAction ? `<button class="text-button" type="button" data-global-service-action="${escapeHtml(card.secondaryAction)}">${escapeHtml(card.secondaryLabel)}</button>` : ""}
        </div>
      </article>
    `).join("");
  }

  const sectionTitle = document.querySelector("[data-global-service-section-title]");
  if (sectionTitle) {
    sectionTitle.textContent = isAllMode ? "Portfolio service recommendations" : `Useful support for ${property.address}`;
  }
  const requestTitle = document.querySelector("[data-global-requests-title]");
  if (requestTitle) {
    requestTitle.textContent = isAllMode ? "Portfolio support requests" : `${property.address} support requests`;
  }

  const requests = openRequestsForServiceScope();
  document.querySelector("[data-global-service-request-count]").textContent = requests.length === 1 ? "1 open" : `${requests.length} open`;
  const list = document.querySelector("[data-global-service-requests]");
  if (list) {
    list.innerHTML = requests.length
      ? requests.map((request) => `
        <article class="global-request-card">
          <div class="request-card-top">
            <strong>${escapeHtml(request.type)}</strong>
            <span class="doc-status status-watch-text">${escapeHtml(request.status)}</span>
          </div>
          <dl>
            <div><dt>Property</dt><dd>${escapeHtml(request.propertyLabel || propertyLabelForId(requestPropertyId(request)))}</dd></div>
            <div><dt>Created</dt><dd>${escapeHtml(request.created)}</dd></div>
            <div><dt>Next step</dt><dd>CMP review</dd></div>
            <div><dt>Linked to</dt><dd>${escapeHtml(request.linkedTo)}</dd></div>
          </dl>
          <div class="button-row">
            <button class="text-button" type="button" data-global-service-action="openRequests">View request</button>
            <button class="text-button" type="button" data-cancel-request="${escapeHtml(request.id)}">Cancel request</button>
          </div>
        </article>
      `).join("")
      : "<p>No support request is open for this view. Use a recommended service when you want CMP to help coordinate support.</p>";
  }
}

function renderLearnGuides() {
  const grid = document.querySelector("[data-learn-guide-grid]");

  if (!grid || grid.dataset.rendered === "true") {
    return;
  }

  grid.innerHTML = guidePreviews.map((guide, index) => `
    <article class="learn-guide-card">
      <div class="learn-card-top">
        <span class="source-badge">${escapeHtml(guide.category)}</span>
      </div>
      <h3>${escapeHtml(guide.title)}</h3>
      <p>${escapeHtml(guide.summary)}</p>
      <div class="button-row">
        <button class="secondary-button" type="button" data-learn-guide="${index}">Read preview</button>
      </div>
    </article>
  `).join("");
  grid.dataset.rendered = "true";
}

function renderSettingsState() {
  document.querySelectorAll("[data-settings-toggle]").forEach((button) => {
    const key = button.dataset.settingsToggle;
    const value = Boolean(labsState.settings[key]);
    button.classList.toggle("is-on", value);
    const label = button.querySelector("strong");
    if (label) {
      label.textContent = value ? "On" : "Off";
    }
  });

  document.body.classList.toggle("hide-prototype-labels", !labsState.settings.showPrototypeLabels);
  document.body.classList.toggle("labs-compact", labsState.settings.compactMode);
}

function showGlobalAskPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-ask]",
    view: "askCmp",
    navLabel: "Ask CMP",
    response: getGlobalAskDefaultResponse(),
    scroll
  });
}

function showGlobalServicePage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-service]",
    view: "bookService",
    navLabel: "Book a service",
    response: getGlobalServiceAssistantResponse("What should I book first?"),
    scroll
  });
}

function showLearnPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-learn]",
    view: "learn",
    navLabel: "Learn",
    response: getLearnAssistantResponse("Explain EICR"),
    scroll
  });
}

function showSettingsPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-settings]",
    view: "settings",
    navLabel: "Settings",
    response: getSettingsAssistantResponse("What can CMP notify me about?"),
    scroll
  });
}

function openNewPropertyGuidedCheck() {
  startNewPropertyGuidedCheck();
}

function openNewPropertyFindings() {
  labsState.azMode = "single";
  labsState.azPropertyId = "the-butts";
  labsState.newPropertyCheckerExpanded = false;
  showPortfolioHome({ scroll: true });
  window.setTimeout(() => scrollToPanel("[data-smart-search-results]"), 80);
  showToast("Review the smart search results before continuing.");
}

function startNewPropertyGuidedCheck() {
  labsState.azMode = "single";
  labsState.azPropertyId = "the-butts";
  labsState.activeCheckerSection = "property-basics";
  labsState.editingCheckerCard = "";
  labsState.newPropertyCheckerExpanded = true;
  showPortfolioCompliance({ scroll: true });
  window.setTimeout(() => scrollToPanel("[data-new-guided-check-panel]"), 80);
}

function openNewPropertyEvidence() {
  showPortfolioEvidence({ scroll: true });
  setAssistantResponse(getGlobalAskAssistantResponse("What evidence should I upload next?"));
}

function addNewPropertySetupActivity(event) {
  const setup = newPropertySetup();
  setup.activity = setup.activity || [];
  if (setup.activity.some((item) => item.id === event.id)) {
    return;
  }
  setup.activity.unshift(event);
}

function confirmNewPropertyFindings() {
  const setup = newPropertySetup();
  const alreadyConfirmed = Boolean(setup.confirmations.findingsConfirmed);

  setup.identity.addressConfirmed = true;
  setup.identity.selectedAddressLocked = true;
  setup.confirmations.findingsConfirmed = true;
  setup.confirmations.epcAcceptedForDemoReview = true;
  setup.confirmations.propertyTypeConfirmed = true;
  setup.confirmations.localChecksStarted = true;
  setup.foundData.epcStatus = "acceptedForDemoReview";
  setup.foundData.localChecksStatus = "started";
  setup.evidence.epc.status = "acceptedStartingSignal";
  setup.evidence.epc.source = "Accepted starting signal";
  setup.evidence.epc.label = "EPC accepted for demo review";

  addNewPropertySetupActivity({
    id: "new-findings-confirmed",
    filter: "details",
    category: "Property setup",
    title: "Smart search findings saved",
    body: "The address, EPC starting signal, property type assumption and local-check context were saved to this property setup.",
    source: "Landlord confirmation",
    status: "Saved",
    statusClass: "status-good-text",
    search: "cmp findings confirmed epc starting signal property type local checks 57 butts",
    why: "CMP recorded this because saved smart search data becomes the property profile baseline.",
    nextAction: "Answer occupancy and safety questions before compliance scoring.",
    route: "compliance",
    actions: [
      makeActivityAction("Continue guided check", "startGuidedCheck", true),
      makeActivityAction("Upload certificates", "addEvidence")
    ]
  });

  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(getGlobalAskAssistantResponse("What does CMP still not know?"));
  showToast(alreadyConfirmed ? "Smart search findings are already saved." : "Smart search saved to this property.");
}

function recordSmartSearchAnswer(field, value) {
  const setup = newPropertySetup();
  const config = smartSearchQuestionConfigs()[field];
  const isKnown = value !== "Not sure";
  const isSkipped = value === "Skip for now";

  if (!config) {
    return;
  }

  setup.landlordAnswers[config.answerKey] = value;
  setup.confirmations[config.confirmationKey] = isKnown || isSkipped;
  if (config.evidenceKey && setup.evidence?.[config.evidenceKey]) {
    setup.evidence[config.evidenceKey].status = isSkipped ? "skipped" : isKnown ? "answered" : "unknown";
    setup.evidence[config.evidenceKey].source = "Landlord answer";
  }
  const nextField = nextSmartSearchAnswerField(setup);
  labsState.smartSearchAnswerPanel = nextField;

  const response = isKnown || isSkipped
    ? `${config.label} saved as ${value}. CMP can use that in the property setup and keep asking only for the remaining unknowns.`
    : `${config.label} kept open. CMP will keep this visible and reduce confidence until it is confirmed.`;

  addNewPropertySetupActivity({
    id: `new-${field}-answer-${Date.now()}`,
    filter: "details",
    category: "Landlord answer",
    title: `${config.label} ${isKnown ? "confirmed" : "left open"}`,
    body: `${config.label}: ${value}.`,
    source: "Smart Search setup",
    status: isKnown ? "Confirmed" : "Unknown",
    statusClass: isKnown ? "status-good-text" : "status-watch-text",
    search: `${field} answer ${value} 57 butts smart search setup`,
    why: "CMP recorded this because landlord answers improve the property setup profile.",
    nextAction: "Continue answering the remaining unknowns.",
    route: "details",
    actions: [
      makeActivityAction("Review setup", "reviewFindings", true),
      makeActivityAction("Ask CMP", "askSetup")
    ]
  });

  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(response);
  showToast(isKnown || isSkipped ? `${config.label} answer saved.` : `${config.label} kept open for later.`);
  window.setTimeout(() => scrollToPanel(nextField ? "[data-smart-answer-panel]" : "[data-smart-search-results]"), 80);
}

function recordNewPropertyEvidenceUpload(type) {
  const setup = newPropertySetup();
  const config = {
    gasSafety: {
      label: "Gas Safety",
      toast: "Valid demo Gas Safety evidence added to this property.",
      response: "Gas Safety evidence has been added to this property setup. CMP will not ask for the same certificate again unless it needs review.",
      id: "new-gas-uploaded",
      title: "Gas Safety evidence uploaded",
      body: "A demo Gas Safety certificate was added to the 57 The Butts evidence list.",
      search: "gas safety evidence uploaded 57 butts",
      confirmationKey: "gasSafetyRelevanceConfirmed",
      answerKey: "gasAppliances",
      answerValue: "Gas Safety certificate uploaded"
    },
    eicr: {
      label: "Electrical Safety / EICR",
      toast: "Electrical Safety / EICR evidence added to this property.",
      response: "Electrical Safety / EICR evidence has been added to this property setup. CMP can now update evidence confidence and reduce missing evidence prompts.",
      id: "new-eicr-uploaded",
      title: "EICR evidence uploaded",
      body: "A demo Electrical Safety/EICR document was added to the 57 The Butts evidence list.",
      search: "eicr electrical safety evidence uploaded 57 butts",
      confirmationKey: "eicrStatusConfirmed",
      answerKey: "eicrAvailable",
      answerValue: "EICR uploaded"
    }
  }[type];

  if (!config || !setup.evidence?.[type]) {
    return;
  }

  setup.evidence[type].status = "uploaded";
  setup.evidence[type].source = "Demo upload";
  setup.evidence[type].uploadedAt = "Today";
  setup.confirmations[config.confirmationKey] = true;
  setup.landlordAnswers[config.answerKey] = config.answerValue;

  addNewPropertySetupActivity({
    id: config.id,
    filter: "evidence",
    category: "Evidence",
    title: config.title,
    body: config.body,
    source: "Smart Search setup",
    status: "Uploaded for review",
    statusClass: "status-good-text",
    search: config.search,
    why: "CMP recorded this because uploaded evidence changes the property evidence confidence.",
    nextAction: "Continue the guided check so CMP can decide which gaps remain.",
    route: "details",
    actions: [
      makeActivityAction("Review setup", "reviewFindings", true),
      makeActivityAction("Ask CMP", "askReview")
    ]
  });

  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(config.response);
  showToast(config.toast);
}

function openPropertyWorkspace(tab = "overview", focusSelector = null) {
  if (isEmptyPortfolioMode()) {
    showPortfolioHome({ scroll: true });
    setAssistantResponse("There is no property workspace yet. Add your first property to create a workspace, then CMP can show property-specific checks, evidence, tasks and activity.");
    showToast("Add your first property before opening a workspace.");
    return;
  }

  if (isNewPropertyMode()) {
    if (tab === "documents") {
      openNewPropertyEvidence();
    } else if (tab === "timeline") {
      showPortfolioActivity({ scroll: true });
    } else if (tab === "compliance") {
      openNewPropertyGuidedCheck();
    } else if (tab === "services") {
      showGlobalServicePage({ scroll: true });
    } else {
      labsState.smartSearchWorkspaceOpen = true;
      showPortfolioHome({ scroll: true });
      setAssistantResponse("This is the early workspace for 57 The Butts. CMP knows the saved Smart Search data and keeps the remaining setup items visible before compliance scoring.");
      window.setTimeout(() => scrollToPanel("[data-smart-workspace-panel]"), 90);
    }
    return;
  }

  switchTab(tab);

  window.setTimeout(() => {
    if (focusSelector) {
      scrollToPanel(focusSelector);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 60);
}

function openHomeAlarmModal() {
  document.querySelectorAll('input[name="home-alarm-answer"]').forEach((input) => {
    input.checked = labsState.alarmAnswer ? input.value === labsState.alarmAnswer : input.value === "Yes, they have been tested";
  });
  openTimelineModal("[data-home-alarm-modal]");
}

function saveHomeAlarmAnswer() {
  const selected = document.querySelector('input[name="home-alarm-answer"]:checked');

  if (!selected) {
    showToast("Choose an alarm-testing answer before saving");
    return;
  }

  const previous = labsState.alarmAnswer || "Not answered";
  labsState.alarmAnswer = selected.value;
  addPropertyTimelineEvent({
    type: "alarm-answer",
    filter: "checks",
    icon: "bell",
    category: "Landlord answer",
    title: "Alarm-testing answer saved",
    body: `Smoke and CO alarm answer saved: ${labsState.alarmAnswer}.`,
    badge: "Landlord answer",
    badgeClass: "status-watch-text",
    activityLabel: "Alarm-testing answer saved",
    detailsTitle: "Answer details",
    details: {
      title: "Answer details",
      rows: [
        ["Previous answer", previous],
        ["Saved answer", labsState.alarmAnswer],
        ["Created", "Just now"],
        ["Source", "Portfolio Home quick win"]
      ],
      note: "Prototype landlord answer for layout testing."
    }
  });
  closeTimelineModals();
  renderPortfolioHomeState();
  showToast("Alarm-testing answer saved");
}

function bindPortfolioHome() {
  document.querySelectorAll("[data-home-add-property]").forEach((button) => {
    button.addEventListener("click", openAddPropertyModal);
  });

  document.querySelector("[data-home-ask]")?.addEventListener("click", () => {
    focusAssistantInput();
  });

  document.querySelector("[data-home-open-action]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAddPropertyModal();
      return;
    }

    if (isNewPropertyMode()) {
      openNewPropertyFindings();
      return;
    }

    openPropertyWorkspace(labsState.eicrAdded ? "timeline" : "overview", labsState.eicrAdded ? "[data-timeline-action-body]" : "[data-next-best-step]");
  });

  document.querySelector("[data-home-why]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAssistant(getGlobalAskAssistantResponse("What documents should I prepare?"), { flash: true });
      return;
    }

    if (isNewPropertyMode()) {
      openAssistant(getGlobalAskAssistantResponse("What should I confirm first?"), { flash: true });
      return;
    }

    openAssistant(getPortfolioAssistantResponse("Ask CMP why this matters"), { flash: true });
  });

  document.querySelector("[data-home-upload-priority]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAddPropertyModal();
      return;
    }

    if (isNewPropertyMode()) {
      openNewPropertyFindings();
      return;
    }

    const urgentProperty = portfolioUrgentProperty();
    if (urgentProperty.id === "willow-brook") {
      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
      return;
    }

    openPropertyWorkspace("documents", labsState.eicrAdded ? "[data-inspection-upload-card]" : "[data-document-upload-panel]");
  });

  document.querySelector("[data-home-arrange-priority]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAssistant(getGlobalAskAssistantResponse("What information do I need to add a property?"), { flash: true });
      return;
    }

    if (isNewPropertyMode()) {
      openNewPropertyEvidence();
      return;
    }

    const urgentProperty = portfolioUrgentProperty();
    if (urgentProperty.id === "willow-brook") {
      labsState.selectedServicePropertyId = "willow-brook";
      showGlobalServicePage({ scroll: true });
      return;
    }

    openPropertyWorkspace("services", "[data-service-primary-card]");
  });

  document.querySelector("[data-home-open-workspace]")?.addEventListener("click", () => {
    openPropertyWorkspace("overview");
  });

  document.querySelector("[data-home-open-property]")?.addEventListener("click", () => {
    openPropertyWorkspace("overview");
  });

  document.querySelector("[data-home-view-activity]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelector("[data-home-copy-inbox]")?.addEventListener("click", () => {
    const address = document.querySelector("[data-home-inbox-address]")?.textContent?.trim();
    copyInboxAddress(address);
  });

  document.querySelector("[data-home-open-vault]")?.addEventListener("click", () => {
    showPortfolioEvidence({ scroll: true });
  });

  document.querySelector("[data-home-view-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelectorAll("[data-home-upcoming]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.homeUpcoming;

      if (target.startsWith("azSingle:")) {
        labsState.azMode = "single";
        labsState.azPropertyId = target.split(":")[1] || "the-butts";
        showPortfolioCompliance({ scroll: true });
        window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
      } else if (target === "inspection") {
        openPropertyWorkspace("timeline", "[data-timeline-action-body]");
      } else if (target === "gas") {
        openPropertyWorkspace("documents", "[data-vault-list]");
      } else if (target === "licensing") {
        openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
      } else {
        openHomeAlarmModal();
      }
    });
  });

  document.querySelector("[data-home-quick-win-open]")?.addEventListener("click", openHomeAlarmModal);
  document.querySelector("[data-home-quick-remind]")?.addEventListener("click", () => {
    showToast("Preview only — reminders are not scheduled in this demo.");
  });
  document.querySelector("[data-home-alarm-save]")?.addEventListener("click", saveHomeAlarmAnswer);
  document.querySelectorAll("[data-home-alarm-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

	document.addEventListener("click", (event) => {
	    const homePromptButton = event.target.closest("[data-home-prompt]");
	    if (homePromptButton) {
	      const response = isEmptyPortfolioMode() || isNewPropertyMode()
	        ? getGlobalAskAssistantResponse(homePromptButton.dataset.homePrompt)
	        : getPortfolioAssistantResponse(homePromptButton.dataset.homePrompt);
	      openAssistant(response, { flash: true });
	      return;
	    }

    const smartUploadButton = event.target.closest("[data-smart-upload]");
    if (smartUploadButton) {
      recordNewPropertyEvidenceUpload(smartUploadButton.dataset.smartUpload);
      return;
    }

    const smartAnswerFieldButton = event.target.closest("[data-smart-answer-field]");
    if (smartAnswerFieldButton) {
      labsState.smartSearchAnswerPanel = smartAnswerFieldButton.dataset.smartAnswerField;
      renderAllState();
      window.setTimeout(() => scrollToPanel("[data-smart-answer-panel]"), 80);
      return;
    }

    const smartAnswerChoice = event.target.closest("[data-smart-answer-choice]");
    if (smartAnswerChoice) {
      recordSmartSearchAnswer(
        smartAnswerChoice.dataset.smartAnswerChoice,
        smartAnswerChoice.dataset.smartAnswerValue
      );
      return;
    }

    if (event.target.closest("[data-smart-answer-close]")) {
      labsState.smartSearchAnswerPanel = "";
      renderAllState();
      return;
    }

    if (event.target.closest("[data-smart-confirm]")) {
      confirmNewPropertyFindings();
      window.setTimeout(() => scrollToPanel("[data-smart-search-results]"), 80);
      return;
    }

    if (event.target.closest("[data-smart-primary-review]")) {
      scrollToPanel("[data-smart-save-panel]");
      showToast("Review the prepared demo match, then save it as the starting property profile.");
      return;
    }

    if (event.target.closest("[data-smart-edit-details]")) {
      showToast("Editing found details is coming next in the prototype.");
      return;
    }

    if (event.target.closest("[data-smart-ask]")) {
      openAssistant(getGlobalAskAssistantResponse("What did CMP find automatically?"), { flash: true });
      return;
    }

    if (event.target.closest("[data-smart-scroll-upload]")) {
      if (isNewPropertyMode() && labsState.currentView !== "home") {
        showPortfolioHome({ scroll: true });
        window.setTimeout(() => scrollToPanel("[data-smart-upload-panel]"), 100);
        return;
      }
      scrollToPanel("[data-smart-upload-panel]");
      return;
    }

    if (event.target.closest("[data-smart-skip-upload]")) {
      showToast("Uploads skipped for now. CMP will keep those evidence items open.");
      return;
    }

    if (event.target.closest("[data-smart-answer-remaining]")) {
      const setup = newPropertySetup();
      if (!setup.confirmations.findingsConfirmed) {
        showToast("Save the smart search findings first, then CMP will ask the remaining unknowns.");
        scrollToPanel("[data-smart-save-panel]");
        return;
      }
      labsState.smartSearchAnswerPanel = nextSmartSearchAnswerField(setup);
      if (labsState.smartSearchAnswerPanel) {
        if (isNewPropertyMode() && labsState.currentView !== "home") {
          showPortfolioHome({ scroll: true });
        } else {
          renderAllState();
        }
        window.setTimeout(() => scrollToPanel("[data-smart-answer-panel]"), 80);
      } else {
        if (isNewPropertyMode() && labsState.currentView !== "home") {
          showPortfolioHome({ scroll: true });
        }
        labsState.smartSearchWorkspaceOpen = true;
        renderAllState();
        scrollToPanel("[data-smart-workspace-panel]");
        showToast("Remaining inline questions are handled. Open the workspace when ready.");
      }
      return;
    }

    if (event.target.closest("[data-smart-view-property]")) {
      if (!newPropertySetup().confirmations.findingsConfirmed) {
        showToast("Save the smart search findings before handing off to Properties.");
        scrollToPanel("[data-smart-save-panel]");
        return;
      }
      showPortfolioProperties({ scroll: true });
      setAssistantResponse("You added your first property. Open the workspace to find out what this property needs to become compliant.");
      return;
    }

    if (event.target.closest("[data-smart-open-workspace]")) {
      openPropertyWorkspace("overview");
      return;
    }

	    if (event.target.closest("[data-home-property-list] [data-home-add-property]")) {
	      openAddPropertyModal();
	      return;
	    }

	    if (event.target.closest("[data-home-property-list] [data-home-upload-priority]")) {
	      openNewPropertyEvidence();
	      return;
	    }

    const openPropertyButton = event.target.closest("[data-home-open-property-id]");
    if (openPropertyButton) {
      openPropertyFromPortfolio(openPropertyButton.dataset.homeOpenPropertyId);
      return;
    }

    const activityButton = event.target.closest("[data-home-view-activity-id]");
    if (activityButton) {
      if (activityButton.dataset.homeViewActivityId === "willow-brook") {
        showPortfolioActivity({ scroll: true });
      } else {
        openPropertyWorkspace("timeline");
      }
    }
  });
}

function bindPortfolioProperties() {
  document.querySelectorAll("[data-properties-add]").forEach((button) => {
    button.addEventListener("click", openAddPropertyModal);
  });

  document.querySelector("[data-properties-ask]")?.addEventListener("click", () => {
    openAssistant(getPropertiesAssistantResponse("Which property needs attention?"));
    focusAssistantInput();
  });

  document.querySelector("[data-properties-search]")?.addEventListener("input", (event) => {
    labsState.propertiesSearch = event.target.value;
    renderPortfolioPropertiesState();
  });

  document.querySelectorAll("[data-properties-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.propertiesFilter = button.dataset.propertiesFilter;
      renderPortfolioPropertiesState();
    });
  });

  document.querySelectorAll("[data-properties-view]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.propertiesView = button.dataset.propertiesView;
      renderPortfolioPropertiesState();
    });
  });

  document.querySelector("[data-properties-clear]")?.addEventListener("click", () => {
    labsState.propertiesSearch = "";
    labsState.propertiesFilter = "all";
    renderPortfolioPropertiesState();
  });

  document.addEventListener("click", (event) => {
    const openPropertyButton = event.target.closest("[data-properties-open-property-id], [data-properties-open-workspace]");
    if (openPropertyButton) {
      openPropertyFromPortfolio(openPropertyButton.dataset.propertiesOpenPropertyId || "the-butts");
    }

	    const uploadButton = event.target.closest("[data-properties-upload-id], [data-properties-upload]");
	    if (uploadButton) {
	      if (isNewPropertyMode()) {
	        openNewPropertyEvidence();
	        return;
	      }

	      if (uploadButton.dataset.propertiesUploadId === "willow-brook") {
	        showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	      } else {
	        openPropertyWorkspace("documents", "[data-document-upload-panel]");
      }
    }

    const timelineButton = event.target.closest("[data-properties-timeline-id], [data-properties-timeline]");
    if (timelineButton) {
      if (timelineButton.dataset.propertiesTimelineId === "willow-brook") {
        showPortfolioActivity({ scroll: true });
      } else {
        openPropertyWorkspace("timeline");
      }
    }

	    const supportButton = event.target.closest("[data-properties-support-id], [data-properties-support]");
	    if (supportButton) {
	      const propertyId = supportButton.dataset.propertiesSupportId || "the-butts";
	      if (isNewPropertyMode()) {
	        showGlobalServicePage({ scroll: true });
	        return;
	      }

	      if (propertyId === "willow-brook") {
	        labsState.selectedServicePropertyId = "willow-brook";
        showGlobalServicePage({ scroll: true });
      } else {
        openPropertyWorkspace("services", currentServiceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
      }
    }
  });
}

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-global-nav]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.dataset.globalNav === "Home") {
        showPortfolioHome({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Properties") {
        showPortfolioProperties({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Compliance centre") {
        showPortfolioCompliance({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Journey OS") {
        showJourneyOs({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Evidence Vault") {
        showPortfolioEvidence({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Tasks") {
        showPortfolioTasks({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Activity") {
        showPortfolioActivity({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Ask CMP") {
        showGlobalAskPage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Book a service") {
        showGlobalServicePage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Learn") {
        showLearnPage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Settings") {
        showSettingsPage({ scroll: true });
        return;
      }

      showToast("This Labs area is a static local preview.");
      document.body.classList.remove("menu-open");
    });
  });

  document.querySelectorAll("[data-home-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPortfolioHome({ scroll: true });
    });
  });

  document.addEventListener("click", (event) => {
    const propertyButton = event.target.closest("[data-open-property-id]");
    if (propertyButton) {
      openPropertyFromPortfolio(propertyButton.dataset.openPropertyId);
      return;
    }

    if (event.target.closest("[data-open-property]")) {
      openPropertyWorkspace("overview");
    }
  });
}

function bindPortfolioCompliance() {
  document.querySelector("[data-compliance-ask]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAssistant(getGlobalAskAssistantResponse("How does CMP help landlords?"));
      focusAssistantInput();
      return;
    }

    openAssistant(getComplianceCentreAssistantResponse("What should I fix first?"));
    focusAssistantInput();
  });

  document.querySelector("[data-compliance-review-actions]")?.addEventListener("click", () => {
    if (isNewPropertyMode()) {
      openNewPropertyFindings();
      return;
    }

    scrollToPanel("[data-compliance-gaps-section]");
  });

	  document.querySelector("[data-compliance-priority-upload]")?.addEventListener("click", () => {
	    if (isEmptyPortfolioMode()) {
	      openAddPropertyModal();
	      return;
	    }

	    if (isNewPropertyMode()) {
	      openNewPropertyFindings();
	      return;
	    }

	    const urgentProperty = portfolioUrgentProperty();
    if (urgentProperty.id === "willow-brook") {
      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
      return;
    }

    if (labsState.eicrAdded) {
      showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
      return;
    }

    openPropertyWorkspace("documents", "[data-document-upload-panel]");
  });

	  document.querySelector("[data-compliance-priority-support]")?.addEventListener("click", () => {
	    if (isEmptyPortfolioMode()) {
	      labsState.azMode = "single";
	      showPortfolioCompliance({ scroll: true });
	      window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
	      return;
	    }

	    if (isNewPropertyMode()) {
	      openNewPropertyEvidence();
	      return;
	    }

	    const urgentProperty = portfolioUrgentProperty();
    if (urgentProperty.id === "willow-brook") {
      labsState.selectedServicePropertyId = "willow-brook";
      openServiceRequestModal("gas", "willow-brook");
      return;
    }

    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  });

  document.querySelector("[data-compliance-open-property]")?.addEventListener("click", () => {
    openPropertyFromPortfolio(portfolioUrgentProperty().id);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-compliance-action]");

    if (!button) {
      return;
    }

	    const action = button.dataset.complianceAction;

	    if (action === "reviewFindings") {
	      openNewPropertyFindings();
	    } else if (action === "startGuidedCheck") {
	      startNewPropertyGuidedCheck();
	    } else if (action === "uploadEicr") {
	      if (isNewPropertyMode()) {
	        recordNewPropertyEvidenceUpload("eicr");
	      } else {
	        openPropertyWorkspace("documents", "[data-document-upload-panel]");
	      }
	    } else if (action === "requestSupport") {
	      if (isNewPropertyMode()) {
	        showGlobalServicePage({ scroll: true });
	      } else {
	        openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
	      }
	    } else if (action === "uploadGas") {
	      if (isNewPropertyMode()) {
	        recordNewPropertyEvidenceUpload("gasSafety");
	      } else {
	        showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	      }
    } else if (action === "requestGasSupport") {
      labsState.selectedServicePropertyId = "willow-brook";
      openServiceRequestModal("gas", "willow-brook");
    } else if (action === "uploadInspection") {
      showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
    } else if (action === "markInspection") {
      showToast("Inspection status marked as not completed for this walkthrough.");
	    } else if (action === "reviewLicensing") {
	      if (isNewPropertyMode()) {
	        openNewPropertyGuidedCheck();
	      } else {
	        openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
	      }
	    } else if (action === "askLicensing") {
	      openAssistant(isNewPropertyMode()
	        ? getGlobalAskAssistantResponse("What does CMP still not know?")
	        : assistantResponses["Why is licensing still checking?"]);
    } else if (action.startsWith("azSingle:")) {
      labsState.azMode = "single";
      labsState.azPropertyId = action.split(":")[1] || "the-butts";
      renderAzChecker();
      scrollToPanel("[data-az-checker]");
    } else if (action.startsWith("service:")) {
      labsState.selectedServicePropertyId = action.split(":")[1] || serviceActionPropertyId();
      showGlobalServicePage({ scroll: true });
    }
  });
}

function bindAzChecker() {
  document.addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-az-mode]");
    if (modeButton) {
      setCheckerActive();
      if (isEmptyPortfolioMode() && modeButton.dataset.azMode === "portfolio") {
        labsState.azMode = "single";
        showToast("Portfolio Sweep is available after properties are added.");
        showPortfolioCompliance({ scroll: true });
        window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
        return;
      }
      if (isNewPropertyMode() && modeButton.dataset.azMode === "single") {
        openNewPropertyFindings();
        return;
      }
      labsState.azMode = modeButton.dataset.azMode;
      labsState.editingCheckerCard = "";
      if (isNewPropertyMode()) {
        labsState.newPropertyCheckerExpanded = false;
      }
      if (labsState.azMode === "portfolio" && getPortfolioProperties().length < 2) {
        showToast("Portfolio Sweep is best with multiple properties. Showing the available scope.");
      }
      showPortfolioCompliance({ scroll: true });
      window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
      return;
    }

    const sectionButton = event.target.closest("[data-az-section]");
    if (sectionButton) {
      setCheckerActive();
      labsState.activeCheckerSection = sectionButton.dataset.azSection;
      labsState.editingCheckerCard = "";
      renderAzChecker();
      return;
    }

    const sweepStageButton = event.target.closest("[data-az-sweep-stage]");
    if (sweepStageButton) {
      setCheckerActive();
      labsState.portfolioSweepStage = sweepStageButton.dataset.azSweepStage;
      renderAzChecker();
      return;
    }

    const scenarioButton = event.target.closest("[data-az-scenario-button]");
    if (scenarioButton) {
      setCheckerActive();
      labsState.azScenario = scenarioButton.dataset.azScenarioButton;
      syncScenarioJourneyAnswer();
      labsState.activeCheckerSection = scenarioTargetSection(labsState.azScenario);
      labsState.editingCheckerCard = "";
      renderAzChecker();
      return;
    }

    if (event.target.closest("[data-az-prev]")) {
      setCheckerActive();
      const index = activeAzSectionIndex();
      const sections = activeAzSections();
      if (index > 0) {
        labsState.activeCheckerSection = sections[index - 1].id;
        labsState.editingCheckerCard = "";
        renderAzChecker();
      }
      return;
    }

    if (event.target.closest("[data-az-next]")) {
      setCheckerActive();
      const index = activeAzSectionIndex();
      const sections = activeAzSections();
      if (index < sections.length - 1) {
        labsState.activeCheckerSection = sections[index + 1].id;
        labsState.editingCheckerCard = "";
        renderAzChecker();
      }
      return;
    }

    if (event.target.closest("[data-az-sweep-prev]")) {
      setCheckerActive();
      const index = activePortfolioSweepStageIndex();
      if (index > 0) {
        labsState.portfolioSweepStage = portfolioSweepStages[index - 1].id;
        renderAzChecker();
      }
      return;
    }

    if (event.target.closest("[data-az-sweep-next]")) {
      setCheckerActive();
      const index = activePortfolioSweepStageIndex();
      if (index < portfolioSweepStages.length - 1) {
        labsState.portfolioSweepStage = portfolioSweepStages[index + 1].id;
        renderAzChecker();
      }
      return;
    }

    const editButton = event.target.closest("[data-az-edit-card]");
    if (editButton) {
      setCheckerActive();
      labsState.editingCheckerCard = `${editButton.dataset.azSectionId}:${editButton.dataset.azEditCard}`;
      renderAzChecker();
      return;
    }

    if (event.target.closest("[data-az-card-cancel]")) {
      setCheckerActive();
      labsState.editingCheckerCard = "";
      renderAzChecker();
      return;
    }

    const optionButton = event.target.closest("[data-az-card-option]");
    if (optionButton) {
      setCheckerActive();
      recordCheckerAnswer(optionButton.dataset.azSectionId, optionButton.dataset.azCardId, optionButton.dataset.azCardOption);
      renderGlobalScoreSurfaces();
      renderAzChecker();
      showToast("Answer recorded. CMP has more context now.");
      clearCheckerPulseSoon();
      return;
    }

    const doneButton = event.target.closest("[data-az-card-done]");
    if (doneButton) {
      setCheckerActive();
      const card = doneButton.closest(".az-check-card");
      const input = card?.querySelector("[data-az-edit-value]");
      const cardMeta = azCardById(doneButton.dataset.azSectionId, doneButton.dataset.azCardId);
      let value = input?.value?.trim() || "Recorded";
      if (input?.type === "range" && cardMeta) {
        value = formatAzRangeValue(cardMeta, input.value);
      }
      if (input?.tagName === "TEXTAREA" && !value) {
        value = "Note added";
      }
      if (cardMeta?.control === "upload") {
        value = "Evidence uploaded";
      }
      recordCheckerAnswer(doneButton.dataset.azSectionId, doneButton.dataset.azCardId, value);
      renderGlobalScoreSurfaces();
      renderAzChecker();
      showToast(cardMeta?.control === "upload" ? "Evidence context recorded. Prototype evidence score updated." : "Checker card updated. Prototype readiness score updated.");
      clearCheckerPulseSoon();
      return;
    }

    if (event.target.closest("[data-az-run-single]")) {
      setCheckerActive();
      renderAzChecker();
      showToast("A-Z check refreshed using prototype readiness logic.");
      return;
    }

    if (event.target.closest("[data-az-ask]")) {
      setCheckerActive();
      if (isEmptyPortfolioMode()) {
        openAssistant(getGlobalAskAssistantResponse("What information do I need to add a property?"), { flash: true });
        return;
      }

      if (isNewPropertyMode()) {
        openAssistant(getGlobalAskAssistantResponse("What should I confirm first?"), { flash: true });
        return;
      }

      const property = azSelectedProperty();
      openAssistant(`${property.address}: CMP is showing ${azStatusForProperty(property).toLowerCase()} because the compliance score is ${effectiveComplianceScore(property)}% and the evidence score is ${effectiveEvidenceScore(property)}%. This is prototype readiness guidance only, not legal advice.`, { flash: true });
      return;
    }

    if (event.target.closest("[data-new-setup-confirm]")) {
      confirmNewPropertyFindings();
      return;
    }

    if (event.target.closest("[data-new-setup-start]")) {
      startNewPropertyGuidedCheck();
      showToast("Guided check opened. You can skip anything you do not know.");
      return;
    }

    if (event.target.closest("[data-new-setup-upload]")) {
      openNewPropertyEvidence();
      return;
    }

    if (event.target.closest("[data-new-setup-ask]")) {
      openAssistant(getGlobalAskAssistantResponse("What did CMP find automatically?"), { flash: true });
      return;
    }

    if (event.target.closest("[data-az-apply-all]")) {
      setCheckerActive();
      showToast("Shared answers applied across the portfolio matrix in this prototype.");
      return;
    }

    if (event.target.closest("[data-az-copy-first]")) {
      setCheckerActive();
      showToast("Copied the evidence-ready pattern as a comparison reference.");
      return;
    }

    const answer = event.target.closest("[data-az-answer]");
    if (answer) {
      setCheckerActive();
      const cycle = ["yes", "no", "unsure", "na"];
      const labels = { yes: "Yes", no: "No", unsure: "Unsure", na: "N/A" };
      const current = cycle.findIndex((item) => answer.classList.contains(item));
      const next = cycle[(current + 1) % cycle.length];
      cycle.forEach((item) => answer.classList.remove(item));
      answer.classList.add(next);
      answer.textContent = labels[next];
      const scope = "portfolio";
      setCheckerAnswer(answer.dataset.azSectionId || "portfolio-matrix", answer.dataset.azCardId || "matrix", labels[next], scope);
      const currentBoost = checkerScoreBoost(scope);
      labsState.checkerScoreBoosts[scope] = {
        compliance: Math.min(100, currentBoost.compliance + 1),
        evidence: currentBoost.evidence
      };
      labsState.scorePulse = { scope, compliance: 1, evidence: 0 };
      renderGlobalScoreSurfaces();
      renderAzChecker();
      showToast("Matrix answer updated. Portfolio readiness score nudged.");
      clearCheckerPulseSoon();
    }
  });

  document.addEventListener("change", (event) => {
    const propertySelect = event.target.closest("[data-az-property-select]");
    if (propertySelect) {
      setCheckerActive();
      labsState.azPropertyId = propertySelect.value;
      labsState.editingCheckerCard = "";
      renderAzChecker();
    }

    const scenarioSelect = event.target.closest("[data-az-scenario-select]");
    if (scenarioSelect) {
      setCheckerActive();
      labsState.azScenario = scenarioSelect.value;
      syncScenarioJourneyAnswer();
      labsState.activeCheckerSection = scenarioTargetSection(labsState.azScenario);
      labsState.editingCheckerCard = "";
      renderAzChecker();
    }
  });

  document.addEventListener("input", (event) => {
    const range = event.target.closest("[data-az-range-card]");
    if (!range) {
      return;
    }
    const card = azCardById(activeAzSection().id, range.dataset.azRangeCard);
    const live = range.closest(".az-edit-field")?.querySelector("[data-az-live-value]");
    if (card && live) {
      live.textContent = formatAzRangeValue(card, range.value);
    }
  });
}

function openPropertySmartUpload({ previewDemo = false } = {}) {
  openPropertyWorkspace("documents", "[data-document-upload-panel]");

  if (previewDemo) {
    window.setTimeout(openSmartModal, 120);
  }
}

function copyEvidenceInboxAddress() {
  const address = document.querySelector("[data-evidence-inbox-address]")?.textContent?.trim()
    || "57-the-butts@inbox.complymyproperty.co.uk";
  copyInboxAddress(address);
}

function handleEvidenceAction(action) {
  if (action === "journeyUpload") {
    showJourneyOs({ scroll: true });
    openFakeUpload();
  } else if (action === "journeyActionPlan") {
    setJourneyStage("actionPlan", "actionPlan");
    showJourneyOs({ scroll: true });
  } else if (action === "journeyEvidence") {
    const state = journeyState();
    state.workspaceTab = "evidence";
    state.screen = "workspace";
    state.currentStage = "vault";
    showJourneyOs({ scroll: true });
  } else if (action?.startsWith("journeyService:")) {
    const serviceId = action.split(":")[1];
    showJourneyOs({ scroll: true });
    openServiceDetail(serviceId);
  } else if (action === "reviewFindings") {
    openNewPropertyFindings();
  } else if (action === "startGuidedCheck") {
    startNewPropertyGuidedCheck();
  } else if (action?.startsWith("az:")) {
    labsState.azMode = "single";
    labsState.azPropertyId = action.split(":")[1] || "the-butts";
    showPortfolioCompliance({ scroll: true });
    window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
  } else if (action?.startsWith("service:")) {
    labsState.selectedServicePropertyId = action.split(":")[1] || serviceActionPropertyId();
    showGlobalServicePage({ scroll: true });
  } else if (action === "openProperty") {
    openPropertyWorkspace("overview");
	  } else if (action === "openWillowProperty") {
	    openPropertyFromPortfolio("willow-brook");
	  } else if (action === "uploadEicr" || action === "replaceEicr" || action === "replaceGas") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload(action === "replaceGas" ? "gasSafety" : "eicr");
	    } else {
	      openPropertySmartUpload();
	    }
	  } else if (action === "arrangeEicr") {
	    if (isNewPropertyMode()) {
	      openAssistant(getGlobalServiceAssistantResponse("What should I book first?"), { flash: true });
	    } else {
	      openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
	    }
	  } else if (action === "uploadGas") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload("gasSafety");
	    } else {
	      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	    }
  } else if (action === "arrangeGas") {
    labsState.selectedServicePropertyId = "willow-brook";
    openServiceRequestModal("gas", "willow-brook");
  } else if (action === "uploadTenancy" || action === "uploadAlarms") {
    showToast("Preview only — evidence upload is not connected to a live workflow.");
  } else if (action === "uploadInspection") {
    showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
  } else if (action === "markInspection") {
    showToast("Inspection status recorded locally for this walkthrough.");
  } else if (action === "viewEpc") {
    showToast("Preview only — official record viewing is not connected to live records.");
  } else if (action === "viewGas") {
    showToast("Preview only — certificate viewing is not connected to live storage.");
	  } else if (action === "viewEicr") {
	    showToast("Preview only — certificate viewing is not connected to live storage.");
	  } else if (action === "askEpc") {
	    openAssistant(getGlobalAskAssistantResponse("Is the EPC okay?"), { flash: true });
	  } else if (action === "askReview") {
	    openAssistant(getGlobalAskAssistantResponse("What evidence should I upload next?"), { flash: true });
	  } else if (action === "askTenancy") {
	    openAssistant(getGlobalAskAssistantResponse("What does CMP still not know?"), { flash: true });
	  }
	}

function bindPortfolioEvidence() {
  document.querySelector("[data-evidence-upload]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAddPropertyModal();
      return;
    }
    if (hasJourneyPropertyBrainActivity()) {
      showJourneyOs({ scroll: true });
      openFakeUpload();
      return;
    }

    openPropertySmartUpload();
  });

  document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => {
    button.addEventListener("click", copyEvidenceInboxAddress);
  });

  document.querySelector("[data-evidence-ask]")?.addEventListener("click", () => {
    if (isEmptyPortfolioMode()) {
      openAssistant(getGlobalAskAssistantResponse("What documents should I prepare?"));
      focusAssistantInput();
      return;
    }

    openAssistant(getEvidenceVaultAssistantResponse("What evidence is missing?"));
    focusAssistantInput();
  });

  document.querySelector("[data-evidence-open-property-inbox]")?.addEventListener("click", () => {
    openPropertyWorkspace("documents", "[data-document-inbox-panel]");
  });

  document.querySelector("[data-evidence-forwarding-help]")?.addEventListener("click", () => {
    openTimelineModal("[data-evidence-inbox-modal]");
  });

  document.querySelector("[data-evidence-search]")?.addEventListener("input", (event) => {
    labsState.evidenceSearch = event.target.value;
    renderPortfolioEvidenceState();
  });

  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.evidenceFilter = button.dataset.evidenceFilter;
      renderPortfolioEvidenceState();
    });
  });

  document.querySelectorAll("[data-evidence-property-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.evidencePropertyFilter = button.dataset.evidencePropertyFilter;
      renderPortfolioEvidenceState();
    });
  });

  document.querySelectorAll("[data-evidence-view]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.evidenceView = button.dataset.evidenceView;
      renderPortfolioEvidenceState();
    });
  });

  document.querySelector("[data-evidence-clear]")?.addEventListener("click", () => {
    labsState.evidenceSearch = "";
    labsState.evidenceFilter = "all";
    labsState.evidencePropertyFilter = "all";
    renderPortfolioEvidenceState();
  });

  document.querySelector("[data-evidence-demo-upload]")?.addEventListener("click", () => {
    openPropertySmartUpload({ previewDemo: true });
  });

  document.querySelectorAll("[data-evidence-open-documents]").forEach((button) => {
    button.addEventListener("click", () => {
      openPropertyWorkspace("documents");
    });
  });

  document.querySelector("[data-evidence-open-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelector("[data-evidence-open-services]")?.addEventListener("click", () => {
    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-evidence-action]");

    if (actionButton) {
      handleEvidenceAction(actionButton.dataset.evidenceAction);
    }
  });

  document.querySelectorAll("[data-evidence-inbox-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function markInspectionTaskNotCompleted() {
  if (labsState.inspectionStatusRecorded) {
    showToast("Inspection status is already recorded locally for this walkthrough.");
    return;
  }

  labsState.inspectionStatusRecorded = true;
  addPropertyTimelineEvent({
    type: "inspection-status-recorded",
    filter: "actions",
    icon: "calendar",
    category: "Actions",
    title: "Inspection status recorded",
    body: "Inspection evidence was marked as not completed during the walkthrough.",
    badge: "Recorded",
    badgeClass: "status-neutral-text",
    activityLabel: "Inspection status recorded",
    details: {
      title: "Inspection status",
      rows: [
        ["Property", "57 The Butts"],
        ["Area", "Property inspection"],
        ["Status", "Marked as not completed"],
        ["Source", "Portfolio Tasks"]
      ],
      note: "Prototype task action for layout testing."
    }
  });
  showToast("Inspection status recorded locally for this walkthrough.");
}

function handleTaskAction(action) {
  if (action === "reviewFindings") {
    openNewPropertyFindings();
  } else if (action === "startGuidedCheck") {
    startNewPropertyGuidedCheck();
  } else if (action?.startsWith("az:")) {
    labsState.azMode = "single";
    labsState.azPropertyId = action.split(":")[1] || "the-butts";
    showPortfolioCompliance({ scroll: true });
    window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
	  } else if (action?.startsWith("service:")) {
	    labsState.selectedServicePropertyId = action.split(":")[1] || serviceActionPropertyId();
	    showGlobalServicePage({ scroll: true });
	  } else if (action === "uploadEicr") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload("eicr");
	    } else {
	      openPropertySmartUpload();
	    }
	  } else if (action === "requestSupport") {
	    if (isNewPropertyMode()) {
	      showGlobalServicePage({ scroll: true });
	    } else {
	      openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
	    }
  } else if (action === "requestGasSupport") {
    labsState.selectedServicePropertyId = "willow-brook";
    openServiceRequestModal("gas", "willow-brook");
  } else if (action === "openProperty") {
    openPropertyWorkspace("overview");
  } else if (action === "openWillowProperty") {
    openPropertyFromPortfolio("willow-brook");
	  } else if (action === "uploadGas") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload("gasSafety");
	    } else {
	      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	    }
  } else if (action === "uploadAlarms") {
    showToast("Preview only — alarm evidence upload is not connected to a live workflow.");
  } else if (action === "uploadInspection") {
    showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
  } else if (action === "markInspection") {
    markInspectionTaskNotCompleted();
	  } else if (action === "reviewLicensing") {
	    if (isNewPropertyMode()) {
	      openNewPropertyGuidedCheck();
	    } else {
	      openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
	    }
	  } else if (action === "askLicensing") {
	    openAssistant(isNewPropertyMode()
	      ? getGlobalAskAssistantResponse("What does CMP still not know?")
	      : "Licensing is still under postcode review. CMP is keeping it visible, but inspection evidence is the more useful next action unless your plans change soon.");
	  } else if (action === "openEvidence") {
	    openNewPropertyEvidence();
	  }
	}

function openTaskDetail(taskId) {
  const task = allTaskItems().find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  document.querySelector("[data-task-detail-body]").textContent = task.detail;
  document.querySelector("[data-task-detail-property]").textContent = task.property;
  document.querySelector("[data-task-detail-category]").textContent = task.category;
  document.querySelector("[data-task-detail-source]").textContent = task.source;
  document.querySelector("[data-task-detail-status]").textContent = task.status;
  document.querySelector("[data-task-detail-action]").textContent = task.suggestedAction;
  document.querySelector("[data-task-detail-open-property]").dataset.taskDetailProperty = task.id;
  openTimelineModal("[data-task-detail-modal]");
}

function bindPortfolioTasks() {
  document.querySelector("[data-tasks-ask]")?.addEventListener("click", () => {
    openAssistant(getTasksAssistantResponse("What should I do first?"));
    focusAssistantInput();
  });

  document.querySelector("[data-tasks-review-completed]")?.addEventListener("click", () => {
    scrollToPanel("[data-tasks-completed-section]");
  });

  document.querySelector("[data-task-search]")?.addEventListener("input", (event) => {
    labsState.taskSearch = event.target.value;
    renderPortfolioTasksState();
  });

  document.querySelectorAll("[data-task-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.taskFilter = button.dataset.taskFilter;
      renderPortfolioTasksState();
    });
  });

  document.querySelectorAll("[data-task-view]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.taskView = button.dataset.taskView;
      renderPortfolioTasksState();
    });
  });

  document.querySelector("[data-task-clear]")?.addEventListener("click", () => {
    labsState.taskSearch = "";
    labsState.taskFilter = "all";
    renderPortfolioTasksState();
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-task-action]");
    if (actionButton) {
      handleTaskAction(actionButton.dataset.taskAction);
      return;
    }

    const detailButton = event.target.closest("[data-task-detail]");
    if (detailButton) {
      openTaskDetail(detailButton.dataset.taskDetail);
    }
  });

  document.querySelector("[data-task-detail-open-property]")?.addEventListener("click", () => {
    const taskId = document.querySelector("[data-task-detail-open-property]")?.dataset.taskDetailProperty;
    const task = allTaskItems().find((item) => item.id === taskId);
    closeTimelineModals();
    openPropertyFromPortfolio(task?.propertyId || "the-butts");
  });

  document.querySelectorAll("[data-task-detail-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function openActivityRelatedPage(event) {
  if (!event) {
    return;
  }

  if (event.route === "services") {
    openPropertyWorkspace("services", "[data-open-requests-panel]");
  } else if (event.route === "bookService") {
    labsState.selectedServicePropertyId = "willow-brook";
    showGlobalServicePage({ scroll: true });
  } else if (event.route === "properties") {
    showPortfolioProperties({ scroll: true });
  } else if (event.route === "tasks") {
    closeTimelineModals();
    showPortfolioTasks({ scroll: true });
  } else if (event.route === "evidence") {
    closeTimelineModals();
    showPortfolioEvidence({ scroll: true });
  } else if (event.route === "documents") {
    openPropertyWorkspace("documents", "[data-document-upload-panel]");
  } else if (event.route === "compliance") {
    openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
  } else if (event.route === "details") {
    openPropertyWorkspace("details");
  } else if (event.route === "timeline") {
    openPropertyWorkspace("timeline");
  } else {
    openPropertyWorkspace("overview");
  }
}

function openActivityDetail(eventId) {
  const event = getActivityEvents().find((item) => item.id === eventId);

  if (!event) {
    return;
  }

  document.querySelector("[data-activity-detail-title]").textContent = event.title;
  document.querySelector("[data-activity-detail-property]").textContent = event.property;
  document.querySelector("[data-activity-detail-category]").textContent = event.category;
  document.querySelector("[data-activity-detail-source]").textContent = event.source;
  document.querySelector("[data-activity-detail-status]").textContent = event.status;
  document.querySelector("[data-activity-detail-why]").textContent = event.why;
  document.querySelector("[data-activity-detail-action]").textContent = event.nextAction;
  document.querySelector("[data-activity-detail-open]").dataset.activityDetailOpen = event.id;
  openTimelineModal("[data-activity-detail-modal]");
}

function renderActivitySummaryModalState() {
  const evidenceList = document.querySelector("[data-activity-summary-evidence]");

  if (!evidenceList) {
    return;
  }

  if (isEmptyPortfolioMode()) {
    evidenceList.innerHTML = "<li>No evidence updates yet</li>";
    document.querySelector("[data-activity-summary-open-list]").innerHTML = "<li>Add a property to create actions</li>";
    document.querySelector("[data-activity-summary-resolved]").innerHTML = "<li>No closed or deferred items yet</li>";
    document.querySelector("[data-activity-summary-next]").textContent = "Add your first property, then run the A-Z Compliance Checker.";
    return;
  }

  if (isNewPropertyMode()) {
    const summary = newPropertyStatusSummary();
    const tasks = newPropertyTaskItems();
    const evidenceRows = newPropertyEvidenceRows();
    evidenceList.innerHTML = evidenceRows
      .filter((row) => row.id === "new-epc" || row.filters.includes("uploaded"))
      .map((row) => `<li>${escapeHtml(row.property)} · ${escapeHtml(row.title)}: ${escapeHtml(row.status)}</li>`)
      .join("");
    document.querySelector("[data-activity-summary-open-list]").innerHTML = tasks
      .slice(0, 5)
      .map((task) => `<li>${escapeHtml(task.title)}</li>`)
      .join("");
    document.querySelector("[data-activity-summary-resolved]").innerHTML = [
      "Address matched",
      "Property profile created",
      summary.findingsConfirmed ? "CMP findings confirmed" : ""
    ].filter(Boolean).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    document.querySelector("[data-activity-summary-next]").textContent = summary.primaryTaskTitle;
    return;
  }

  if (isFivePropertyMode()) {
    evidenceList.innerHTML = `
      <li>24 Maple Court · evidence-ready evidence pack</li>
      <li>18 Willow Brook Drive · Gas Safety renewal flagged</li>
      <li>3 Station Road · onboarding evidence missing</li>
    `;
    document.querySelector("[data-activity-summary-open-list]").innerHTML = `
      <li>3 Station Road · new purchase onboarding</li>
      <li>18 Willow Brook Drive · Gas Safety renewal</li>
      <li>9 Canal View · licensing answer needed</li>
    `;
    document.querySelector("[data-activity-summary-resolved]").innerHTML = `
      <li>24 Maple Court · evidence-ready</li>
      <li>18 Willow Brook Drive · EICR verified</li>
    `;
    document.querySelector("[data-activity-summary-next]").textContent = "Run Portfolio Sweep, resolve Station Road onboarding gaps, then confirm Canal View licensing.";
    return;
  }

  if (isTwoPropertyMode()) {
    evidenceList.innerHTML = `
      <li>18 Willow Brook Drive · EICR verified</li>
      <li>18 Willow Brook Drive · Gas Safety renewal flagged</li>
      <li>57 The Butts · ${labsState.eicrAdded ? "EICR evidence verified" : "EICR gap still visible"}</li>
    `;
    document.querySelector("[data-activity-summary-open-list]").innerHTML = `
      <li>18 Willow Brook Drive · Gas Safety renewal</li>
      <li>18 Willow Brook Drive · Alarm and inspection evidence</li>
      <li>57 The Butts · ${labsState.eicrAdded ? "Inspection evidence" : "Electrical Safety evidence"}</li>
    `;
    document.querySelector("[data-activity-summary-resolved]").innerHTML = labsState.eicrAdded
      ? `
        <li>57 The Butts · Electrical Safety evidence accepted</li>
        <li>18 Willow Brook Drive · EICR verified</li>
      `
      : `
        <li>18 Willow Brook Drive · EICR verified</li>
      `;
    document.querySelector("[data-activity-summary-next]").textContent = "Prioritise Gas Safety renewal for 18 Willow Brook Drive, then review the remaining evidence gaps by property.";
    return;
  }

  evidenceList.innerHTML = labsState.eicrAdded
    ? `
      <li>EICR evidence verified</li>
      <li>Gas Safety evidence verified</li>
      <li>EPC record imported</li>
    `
    : `
      <li>Gas Safety evidence verified</li>
      <li>EPC record imported</li>
    `;

  document.querySelector("[data-activity-summary-open-list]").innerHTML = labsState.eicrAdded
    ? `
      <li>Inspection evidence</li>
      <li>Local licensing review</li>
    `
    : `
      <li>Electrical Safety evidence</li>
      <li>Inspection evidence</li>
      <li>Local licensing review</li>
    `;

  document.querySelector("[data-activity-summary-resolved]").innerHTML = labsState.eicrAdded
    ? `
      <li>Electrical Safety evidence accepted</li>
      <li>Gas Safety certificate verified</li>
    `
    : `
      <li>Gas Safety certificate verified</li>
    `;

  document.querySelector("[data-activity-summary-next]").textContent = labsState.eicrAdded
    ? "Add inspection evidence or record that no recent inspection has been completed."
    : "Upload or arrange an EICR for 57 The Butts.";
}

	function handleActivityAction(action) {
	  if (action === "reviewFindings") {
	    openNewPropertyFindings();
	  } else if (action === "startGuidedCheck") {
	    startNewPropertyGuidedCheck();
	  } else if (action === "uploadEicr") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload("eicr");
	    } else {
	      openPropertySmartUpload();
	    }
	  } else if (action === "uploadGas") {
	    if (isNewPropertyMode()) {
	      recordNewPropertyEvidenceUpload("gasSafety");
	    } else {
	      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	    }
  } else if (action === "askEicr") {
    openAssistant(getActivityAssistantResponse("What still needs attention?"));
  } else if (action === "openProperty") {
    openPropertyWorkspace("overview");
  } else if (action === "openTask") {
    showPortfolioTasks({ scroll: true });
	  } else if (action === "uploadInspection") {
	    showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
	  } else if (action === "reviewLicensing") {
	    if (isNewPropertyMode()) {
	      openNewPropertyGuidedCheck();
	    } else {
	      openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
	    }
  } else if (action === "askLicensing") {
    openAssistant(getActivityAssistantResponse("What still needs attention?"));
  } else if (action === "viewEvidence") {
    showPortfolioEvidence({ scroll: true });
	  } else if (action === "addEvidence") {
	    if (isNewPropertyMode()) {
	      openNewPropertyEvidence();
	    } else {
	      openPropertyWorkspace("documents", "[data-document-upload-panel]");
	    }
  } else if (action === "openTimeline") {
    openPropertyWorkspace("timeline");
  } else if (action === "openDetails") {
    openPropertyWorkspace("details");
	  } else if (action === "openServices" || action === "viewRequest") {
	    openPropertyWorkspace("services", "[data-open-requests-panel]");
  } else if (action === "openGlobalServices") {
    labsState.selectedServicePropertyId = "willow-brook";
    showGlobalServicePage({ scroll: true });
  } else if (action === "openProperties") {
    showPortfolioProperties({ scroll: true });
  } else if (action === "openWillowProperty") {
    openPropertyFromPortfolio("willow-brook");
	  } else if (action === "openAz") {
	    labsState.azMode = isNewPropertyMode() ? "single" : "portfolio";
	    labsState.azPropertyId = "the-butts";
	    showPortfolioCompliance({ scroll: true });
	    window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
	  } else if (action === "askSetup") {
	    openAssistant(getGlobalAskAssistantResponse("What should I confirm first?"), { flash: true });
	  } else if (action === "askEpc") {
	    openAssistant(getGlobalAskAssistantResponse("Is the EPC okay?"), { flash: true });
	  } else if (action === "askGasRenewal") {
	    openAssistant("18 Willow Brook Drive needs Gas Safety renewal soon. CMP would prioritise upload or support for that certificate before lower-risk follow-up evidence.");
	  }
	}

function bindPortfolioActivity() {
  document.querySelector("[data-activity-ask]")?.addEventListener("click", () => {
    openAssistant(getActivityAssistantResponse("What changed recently?"));
    focusAssistantInput();
  });

  document.querySelector("[data-activity-open-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelector("[data-activity-search]")?.addEventListener("input", (event) => {
    labsState.activitySearch = event.target.value;
    renderPortfolioActivityState();
  });

  document.querySelectorAll("[data-activity-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.activityFilter = button.dataset.activityFilter;
      renderPortfolioActivityState();
    });
  });

  document.querySelector("[data-activity-clear]")?.addEventListener("click", () => {
    labsState.activitySearch = "";
    labsState.activityFilter = "all";
    renderPortfolioActivityState();
  });

  document.querySelector("[data-activity-summary-open]")?.addEventListener("click", () => {
    renderActivitySummaryModalState();
    openTimelineModal("[data-activity-summary-modal]");
  });

  document.querySelector("[data-activity-preview-export]")?.addEventListener("click", () => {
    showToast("Preview only — activity export is not connected to a live workflow.");
  });

  document.querySelector("[data-activity-detail-open]")?.addEventListener("click", (event) => {
    const activityEvent = getActivityEvents().find((item) => item.id === event.currentTarget.dataset.activityDetailOpen);
    closeTimelineModals();
    openActivityRelatedPage(activityEvent);
  });

  document.querySelectorAll("[data-activity-detail-close], [data-activity-summary-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-activity-action]");
    if (actionButton) {
      handleActivityAction(actionButton.dataset.activityAction);
      return;
    }

    const detailButton = event.target.closest("[data-activity-detail]");
    if (detailButton) {
      openActivityDetail(detailButton.dataset.activityDetail);
    }
  });
}

function bindDemoState() {
  document.querySelector("[data-demo-state-open]")?.addEventListener("click", () => {
    openTimelineModal("[data-demo-state-modal]");
  });

  document.querySelector("[data-demo-guide-open]")?.addEventListener("click", () => {
    openTimelineModal("[data-demo-guide-modal]");
  });

  document.querySelector("[data-demo-state-close]")?.addEventListener("click", closeTimelineModals);
  document.querySelectorAll("[data-demo-guide-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
  document.querySelector("[data-demo-guide-start]")?.addEventListener("click", () => {
    closeTimelineModals();
    enterGuidedDemo("clean-property-check");
  });

  document.querySelectorAll("[data-demo-state-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyDemoState(button.dataset.demoStateOption);
    });
  });

  document.querySelectorAll("[data-journey-demo-option]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeTimelineModals();
      applyDemoScenario(button.dataset.journeyDemoOption);
    });
  });
}

function openAddPropertyModal() {
  labsState.addPropertyStep = 1;
  labsState.addPropertyAddress = addPropertyAddresses[0];
  renderAddPropertyState();
  setAssistantResponse("CMP would start with the property address, then import official records where available before building the workspace.");
  openTimelineModal("[data-add-property-modal]");
}

function renderAddPropertyState() {
  document.querySelectorAll("[data-add-step-indicator]").forEach((item) => {
    const step = Number(item.dataset.addStepIndicator);
    item.classList.toggle("is-active", step === labsState.addPropertyStep);
    item.classList.toggle("is-complete", step < labsState.addPropertyStep);
  });

  document.querySelectorAll("[data-add-property-step]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.addPropertyStep) !== labsState.addPropertyStep;
  });

  const successPanel = document.querySelector("[data-add-property-success-panel]");
  if (successPanel) {
    successPanel.hidden = labsState.addPropertyStep !== 4;
  }

  const list = document.querySelector("[data-add-address-list]");
  if (list) {
    list.innerHTML = addPropertyAddresses.map((address, index) => `
      <label class="address-choice${address === labsState.addPropertyAddress ? " is-selected" : ""}">
        <input type="radio" name="add-property-address" value="${escapeHtml(address)}" ${address === labsState.addPropertyAddress ? "checked" : ""}>
        <span>${escapeHtml(address)}</span>
        <small>${index === 0 ? "Matched address for this setup" : "Matched address preview"}</small>
      </label>
    `).join("");
  }

  const selected = document.querySelector("[data-add-selected-address]");
  if (selected) {
    selected.textContent = labsState.addPropertyAddress;
  }
}

function openBundlePreviewModal() {
  const property = selectedServiceProperty();
  const list = document.querySelector("[data-bundle-items]");
  const context = document.querySelector("[data-bundle-property-context]");
  if (context) {
    context.textContent = `Bundle for · ${property.label}`;
  }
  if (list) {
    list.innerHTML = `
      <article class="bundle-property-card">
        <span>Bundle for</span>
        <strong>${escapeHtml(property.label)}</strong>
      </article>
      ${serviceBundleItems(property.id).map((item) => `
        <article class="bundle-item">
          <span class="tile-icon" data-icon="check"></span>
          <strong>${escapeHtml(item)}</strong>
        </article>
      `).join("")}
    `;
  }

  openTimelineModal("[data-bundle-modal]");
  hydrateIcons();
}

function openLearnGuide(index) {
  const guide = guidePreviews[Number(index)];

  if (!guide) {
    return;
  }

  document.querySelector("[data-learn-preview-title]").textContent = guide.title;
  document.querySelector("[data-learn-preview-body]").textContent = guide.preview;
  openTimelineModal("[data-learn-preview-modal]");
}

function handleGlobalServiceAction(action) {
  if (action === "reviewFindings") {
    openNewPropertyFindings();
  } else if (action === "startGuidedCheck") {
    startNewPropertyGuidedCheck();
  } else if (action.startsWith("az:")) {
    labsState.azMode = "single";
    labsState.azPropertyId = action.split(":")[1] || "the-butts";
    showPortfolioCompliance({ scroll: true });
    window.setTimeout(() => scrollToPanel("[data-az-checker]"), 80);
  } else if (action.startsWith("request:")) {
    const [, requestType, propertyId] = action.split(":");
    openServiceRequestModal(requestType, propertyId || serviceActionPropertyId());
  } else if (action === "support") {
    openServiceRequestModal(recommendedServiceType(serviceActionPropertyId()), serviceActionPropertyId());
  } else if (action === "openRequests") {
    scrollToPanel("[data-global-open-requests-panel]");
	  } else if (action === "uploadEicr" || action === "viewEicr") {
	    if (isNewPropertyMode()) {
	      openNewPropertyEvidence();
	    } else {
	      openPropertyWorkspace("documents", action === "viewEicr" ? "[data-vault-list]" : "[data-document-upload-panel]");
	    }
	  } else if (action === "uploadInspection" || action === "uploadRecommended") {
	    if (isNewPropertyMode()) {
	      openNewPropertyEvidence();
	      return;
	    }

	    if (serviceActionPropertyId() === "willow-brook" && action === "uploadRecommended") {
	      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
      return;
    }

    if (labsState.eicrAdded || action === "uploadInspection") {
      showToast("Preview only — inspection evidence upload is not connected to a live workflow.");
    } else {
      openPropertyWorkspace("documents", "[data-document-upload-panel]");
      window.setTimeout(() => document.querySelector("[data-file-input]")?.click(), 180);
    }
	  } else if (action === "uploadGas") {
	    if (isNewPropertyMode()) {
	      openNewPropertyEvidence();
	    } else {
	      showToast("Preview only — Gas Safety upload is not connected to a live workflow.");
	    }
  } else if (action === "uploadAlarms") {
    showToast("Preview only — alarm evidence upload is not connected to a live workflow.");
  } else if (action === "licensing") {
    showPortfolioCompliance({ scroll: true });
  } else if (action === "ask") {
    openAssistant(getGlobalServiceAssistantResponse("Why is this recommended?"));
    focusAssistantInput();
	  } else if (action === "askPrepare") {
	    openAssistant(isNewPropertyMode()
	      ? getGlobalAskAssistantResponse("What evidence should I upload next?")
	      : getGlobalAskAssistantResponse("What documents should I prepare?"));
	    focusAssistantInput();
  } else if (action === "viewEvidence") {
    showPortfolioEvidence({ scroll: true });
  } else if (action === "previewBundle") {
    openBundlePreviewModal();
  } else if (action === "callback") {
    document.querySelector("[data-callback-phone]").value = "";
    document.querySelector("[data-callback-time]").value = "";
    document.querySelector("[data-callback-help]").value = "";
    openTimelineModal("[data-callback-modal]");
  } else if (action === "askBundle") {
    openAssistant(isAllServicePropertiesMode()
      ? "CMP would rank Gas Safety renewal for 18 Willow Brook Drive first, then keep the 57 The Butts EICR or inspection follow-up visible in the same portfolio view."
      : selectedServicePropertyId() === "willow-brook"
      ? "CMP would include Gas Safety renewal first, then inspection evidence, alarm evidence and local licensing review for 18 Willow Brook Drive."
      : labsState.eicrAdded
      ? "CMP would include inspection evidence, local licensing review, tenancy document readiness and a human file review."
      : "CMP would include EICR support first, then inspection evidence, local licensing review and a tenancy document checklist.");
    focusAssistantInput();
  } else if (action === "askGas") {
    openAssistant("Gas Safety evidence is already verified. CMP keeps it tied to the property so renewal tracking and evidence sharing stay organised.");
  } else if (action === "askEpc") {
    openAssistant("CMP uses the EPC match to anchor the property record and prepare useful checks around the address.");
  } else if (action === "askTenancy") {
    openAssistant("CMP would include tenancy agreement readiness, prescribed information, useful certificates and any evidence needed before move-in.");
  } else if (action === "askReview") {
    openAssistant("A property-file review would look at stored evidence, unresolved gaps, useful next actions and whether anything should be checked before letting.");
  } else if (action === "askAlarms") {
    openAssistant("Alarm evidence for 18 Willow Brook Drive stays visible because the property is tenanted, but CMP ranks Gas Safety renewal first in this demo state.");
  } else if (action === "askLicensingPortfolio") {
    openAssistant("CMP keeps licensing as a postcode watch item across both properties while higher-priority evidence and renewal items are handled first.");
  }
}

function bindUtilityPages() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-properties-add], [data-home-add-property]")) {
      openAddPropertyModal();
      return;
    }

    if (event.target.closest("[data-properties-empty-ask]")) {
      openAssistant(getGlobalAskAssistantResponse("What information do I need to add a property?"), { flash: true });
      return;
    }

    if (event.target.closest("[data-evidence-empty-ask]")) {
      openAssistant(getGlobalAskAssistantResponse("What documents should I prepare?"), { flash: true });
      return;
    }

    if (event.target.closest("[data-open-global-service]")) {
      showGlobalServicePage({ scroll: true });
      return;
    }

    if (event.target.closest("[data-open-global-activity]")) {
      showPortfolioActivity({ scroll: true });
      return;
    }

    const askPrompt = event.target.closest("[data-utility-ask-prompt]");
    if (askPrompt) {
      setUtilityAskPrompt(askPrompt.dataset.utilityAskPrompt);
      return;
    }

    const serviceAction = event.target.closest("[data-global-service-action]");
    if (serviceAction) {
      handleGlobalServiceAction(serviceAction.dataset.globalServiceAction);
      return;
    }

    const serviceProperty = event.target.closest("[data-service-property-select]");
    if (serviceProperty) {
      labsState.selectedServicePropertyId = serviceProperty.dataset.servicePropertySelect;
      renderPortfolioUtilityState();
      setAssistantResponse(getGlobalServiceAssistantResponse("What should I book first?"));
      return;
    }

    const guideButton = event.target.closest("[data-learn-guide]");
    if (guideButton) {
      openLearnGuide(guideButton.dataset.learnGuide);
      return;
    }
  });

  document.querySelectorAll("[data-add-property-close], [data-learn-preview-close], [data-bundle-close], [data-second-property-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.addEventListener("change", (event) => {
    const addressInput = event.target.closest('input[name="add-property-address"]');
    if (addressInput) {
      labsState.addPropertyAddress = addressInput.value;
      renderAddPropertyState();
    }
  });

  document.addEventListener("click", (event) => {
    const addNext = event.target.closest("[data-add-property-next]");
    if (addNext) {
      labsState.addPropertyStep = Number(addNext.dataset.addPropertyNext);
      renderAddPropertyState();
    }

    const addBack = event.target.closest("[data-add-property-back]");
    if (addBack) {
      labsState.addPropertyStep = Number(addBack.dataset.addPropertyBack);
      renderAddPropertyState();
    }

	    if (event.target.closest("[data-add-property-success]")) {
	      openCreatedPropertyWorkspace();
	    }

    if (event.target.closest("[data-add-property-open-demo]")) {
      openCreatedPropertyWorkspace();
    }

    if (event.target.closest("[data-add-property-later]")) {
      closeTimelineModals();
      setAssistantResponse("Add your first property when you are ready. CMP will create the workspace around the address and available evidence context.");
    }

    if (event.target.closest("[data-bundle-request]")) {
      closeTimelineModals();
      openServiceRequestModal("bundle", serviceActionPropertyId());
    }

    if (event.target.closest("[data-second-property-open-demo]")) {
      closeTimelineModals();
      openPropertyWorkspace("overview");
    }
  });

  document.querySelector("[data-utility-ask-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.question;
    setUtilityAskPrompt(input.value);
    input.value = "";
  });

  document.querySelectorAll("[data-settings-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.settingsToggle;
      labsState.settings[key] = !labsState.settings[key];
      renderSettingsState();
    });
  });

  document.querySelector("[data-settings-reset-demo]")?.addEventListener("click", () => {
    applyDemoState("reset");
    showSettingsPage({ scroll: false });
  });
}

function bindAssistant() {
  document.querySelectorAll("[data-assistant-open]").forEach((button) => {
    button.addEventListener("click", () => openAssistant());
  });

  document.querySelector("[data-assistant-close]")?.addEventListener("click", () => {
    document.body.classList.remove("assistant-open");
  });

  document.querySelector(".prompt-stack")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prompt]");

    if (!button) {
      return;
    }

    if (labsState.currentView === "askCmp") {
      setUtilityAskPrompt(button.dataset.prompt);
    } else {
      setAssistantResponse(getAssistantResponse(button.dataset.prompt));
    }
    openAssistant();
  });

  document.querySelector("[data-assistant-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.question;
    if (labsState.currentView === "askCmp") {
      setUtilityAskPrompt(input.value);
    } else {
      setAssistantResponse(input.value.trim() ? defaultAssistantResponse : getAssistantResponse("What evidence am I missing?"));
    }
    input.value = "";
    openAssistant();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-assistant-message]");

    if (button) {
      openAssistant(button.dataset.assistantMessage);
    }
  });
}

function bindMobileMenu() {
  document.querySelector("[data-menu-open]")?.addEventListener("click", () => {
    document.body.classList.add("menu-open");
  });

  document.querySelector("[data-drawer-close]")?.addEventListener("click", closeDrawers);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawers();
      closeSmartModal();
      closeTimelineModals();
    }
  });
}

function bindToasts() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toast]");

    if (button) {
      showToast(button.dataset.toast);
    }
  });
}

function bindFindings() {
  document.querySelector("[data-findings-open]")?.addEventListener("click", () => {
    document.body.classList.add("findings-open");
  });

  document.querySelector("[data-findings-close]")?.addEventListener("click", () => {
    document.body.classList.remove("findings-open");
  });

  document.querySelector("[data-open-compliance]")?.addEventListener("click", () => {
    document.body.classList.remove("findings-open");
    switchTab("compliance");
  });

  document.querySelector("[data-findings-drawer]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-findings-drawer]")) {
      document.body.classList.remove("findings-open");
    }
  });
}

function bindPrsDrawer() {
  document.querySelector("[data-prs-open]")?.addEventListener("click", () => {
    document.body.classList.add("prs-open");
  });

  document.querySelector("[data-prs-close]")?.addEventListener("click", () => {
    document.body.classList.remove("prs-open");
  });

  document.querySelector("[data-prs-drawer]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-prs-drawer]")) {
      document.body.classList.remove("prs-open");
    }
  });
}

function bindScenarios() {
  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      const content = scenarioContent[button.dataset.scenario];

      if (!content) {
        return;
      }

      document.querySelectorAll("[data-scenario]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      document.querySelector("[data-scenario-title]").textContent = content.title;
      document.querySelector("[data-scenario-body]").textContent = content.body;
      document.querySelector("[data-scenario-priorities]").innerHTML = content.priorities.map((priority) => `<li>${priority}</li>`).join("");
    });
  });
}

function bindWhatIf() {
  const toggle = document.querySelector("[data-what-if-toggle]");
  const body = document.querySelector("[data-what-if-body]");

  toggle?.addEventListener("click", () => {
    const willOpen = body.hidden;
    body.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  document.querySelectorAll("[data-what-if]").forEach((button) => {
    button.addEventListener("click", () => {
      const content = whatIfContent[button.dataset.whatIf];

      if (!content) {
        return;
      }

      document.querySelectorAll("[data-what-if]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      document.querySelector("[data-what-if-response]").innerHTML = `
        <h3>${content.title}</h3>
        <p>${content.body}</p>
        <ul>${content.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
      `;
    });
  });
}

function scrollToPanel(selector) {
  const panel = document.querySelector(selector);

  if (!panel) {
    return;
  }

  panel.scrollIntoView({ behavior: "smooth", block: "center" });
  panel.focus({ preventScroll: true });
}

function setSelectValue(selector, value) {
  const select = document.querySelector(selector);

  if (select) {
    select.value = value;
  }
}

function serviceMode() {
  return labsState.eicrAdded ? "inspection" : "eicr";
}

function serviceCopy() {
  if (labsState.eicrAdded) {
    return {
      title: "Add or arrange a property inspection",
      body: "Electrical Safety evidence is now recorded. Your latest property inspection record is the next useful improvement.",
      reason: "Inspection evidence helps keep the property file current and supports future follow-up actions.",
      action: "Request inspection support",
      upload: "Upload inspection evidence",
      handled: "Mark as not yet needed",
      requestTitle: "Request property inspection support",
      requestType: "Property inspection support",
      eventTitle: "Property inspection support requested",
      eventBody: "CMP recorded a request to help arrange the next property-inspection step.",
      linkedTo: "Inspection evidence",
      options: ["Help me arrange an inspection", "Ask someone to contact me", "I want guidance before deciding"],
      handledTitle: "Record inspection status",
      handledOptions: ["No recent inspection has been completed", "An inspection is already arranged", "I want to review this later"]
    };
  }

  return {
    title: "Arrange an EICR",
    body: "Electrical Safety is the clearest missing evidence area in this property file. Add an existing report or request help arranging an inspection.",
    reason: "CMP does not currently hold a satisfactory EICR for this property.",
    action: "Request EICR support",
    upload: "Upload existing EICR",
    handled: "Mark as already handled",
    requestTitle: "Request EICR support",
    requestType: "EICR support",
    eventTitle: "EICR support requested",
    eventBody: "CMP recorded a request to help arrange Electrical Safety support for this property.",
    linkedTo: "Electrical Safety",
    options: ["Help me arrange an inspection", "Ask someone to contact me", "I want to upload an existing EICR instead"],
    handledTitle: "Has this already been handled?",
    handledOptions: ["I already have an EICR", "An inspection has been arranged elsewhere", "I want to return to this later"]
  };
}

function currentServiceRequest() {
  return openSupportRequestForType(serviceMode(), "the-butts");
}

function renderChoiceList(container, options, name) {
  if (!container) {
    return;
  }

  container.innerHTML = options.map((option, index) => `
    <label class="choice-option">
      <input type="radio" name="${name}" value="${escapeHtml(option)}" ${index === 0 ? "checked" : ""}>
      <span>${escapeHtml(option)}</span>
    </label>
  `).join("");
}

function renderServicesState() {
  const copy = serviceCopy();

  const title = document.querySelector("[data-service-primary-title]");
  if (!title) {
    return;
  }

  title.textContent = copy.title;
  document.querySelector("[data-service-primary-body]").textContent = copy.body;
  document.querySelector("[data-service-primary-reason]").textContent = copy.reason;
  const existingRequest = currentServiceRequest();
  document.querySelector("[data-service-primary-action]").textContent = existingRequest
    ? (serviceMode() === "eicr" ? "View EICR request" : "View inspection request")
    : copy.action;
  document.querySelector("[data-service-upload-action]").textContent = copy.upload;
  document.querySelector("[data-service-handled-action]").textContent = copy.handled;

  const headerButton = document.querySelector(".services-header [data-assistant-message]");
  if (headerButton) {
    headerButton.dataset.assistantMessage = getAssistantResponse("What should I arrange first?");
  }

  const empty = document.querySelector("[data-open-requests-empty]");
  const note = document.querySelector("[data-open-requests-note]");
  const list = document.querySelector("[data-request-list]");

  if (!list) {
    return;
  }

  const activeRequests = labsState.serviceRequests.filter((request) => request.status !== "Cancelled" && requestPropertyId(request) === "the-butts");

  if (!activeRequests.length) {
    if (empty) {
      empty.hidden = false;
    }
    if (note) {
      note.hidden = false;
    }
    list.innerHTML = "";
    return;
  }

  if (empty) {
    empty.hidden = true;
  }
  if (note) {
    note.hidden = true;
  }

  list.innerHTML = activeRequests.map((request) => `
    <article class="request-card" data-request-id="${request.id}">
      <div class="request-card-top">
        <h3>${escapeHtml(request.type)}</h3>
        <span class="doc-status status-watch-text">${escapeHtml(request.status)}</span>
      </div>
      <dl>
        <div><dt>Property</dt><dd>${escapeHtml(request.propertyLabel || propertyLabelForId(requestPropertyId(request)))}</dd></div>
        <div><dt>Created</dt><dd>${escapeHtml(request.created)}</dd></div>
        <div><dt>Next step</dt><dd>CMP review</dd></div>
        <div><dt>Linked to</dt><dd>${escapeHtml(request.linkedTo)}</dd></div>
      </dl>
      <div class="button-row">
        <button class="text-button" type="button" data-toast="Preview only — request details are not connected to a live workflow.">View request</button>
        <button class="text-button" type="button" data-cancel-request="${request.id}">Cancel request</button>
      </div>
    </article>
  `).join("");
}

function openServiceRequestModal(type = recommendedServiceType("the-butts"), propertyId = labsState.currentView === "bookService" ? serviceActionPropertyId() : "the-butts") {
  const copy = serviceRequestConfig(type);
  const property = getPortfolioPropertyById(propertyId === "all" ? serviceActionPropertyId() : propertyId);
  const existingRequest = openSupportRequestForType(type, property.id);

  closeTimelineModals();

  if (existingRequest) {
    if (labsState.currentView === "bookService") {
      scrollToPanel("[data-global-open-requests-panel]");
    } else {
      scrollToPanel("[data-open-requests-panel]");
    }
    showToast("A support request for this item is already open.");
    return;
  }

  labsState.pendingServiceRequestType = type;
  labsState.pendingServicePropertyId = property.id;
  document.querySelector("[data-service-modal-title]").textContent = "Request support";
  document.querySelector("[data-service-modal-property-context]").textContent = `Property · ${property.label}`;
  document.querySelector("[data-service-selected-type]").textContent = copy.requestType;
  document.querySelector("[data-service-selected-property]").textContent = property.label;
  document.querySelector("[data-service-success-property]").textContent = property.label;
  document.querySelector("[data-service-note]").value = "";
  document.querySelector("[data-service-form]").hidden = false;
  document.querySelector("[data-service-success]").hidden = true;
  renderChoiceList(document.querySelector("[data-service-contact-options]"), ["Email", "Phone", "Either"], "service-contact");
  renderChoiceList(document.querySelector("[data-service-urgency-options]"), ["This week", "This month", "Not urgent"], "service-urgency");
  openTimelineModal("[data-service-modal]");
}

function addServiceTimelineEvent(event) {
  labsState.serviceEvents.unshift({
    id: `${event.type}-${Date.now()}`,
    createdAt: Date.now(),
    group: "Today",
    filter: "actions",
    icon: event.icon || "calendar",
    category: event.category,
    title: event.title,
    body: event.body,
    badge: event.badge,
    badgeClass: event.badgeClass || "status-watch-text",
    activityLabel: event.activityLabel,
    type: event.type,
    actions: event.actions || [],
    details: event.details || null
  });
  renderAllState();
}

function createSupportRequest() {
  const copy = serviceRequestConfig(labsState.pendingServiceRequestType);
  const property = getPortfolioPropertyById(labsState.pendingServicePropertyId);
  const existingRequest = openSupportRequestForType(labsState.pendingServiceRequestType, property.id);

  if (existingRequest) {
    closeTimelineModals();
    if (labsState.currentView === "bookService") {
      scrollToPanel("[data-global-open-requests-panel]");
    } else {
      scrollToPanel("[data-open-requests-panel]");
    }
    showToast("A support request for this item is already open.");
    return;
  }

  const contact = document.querySelector('input[name="service-contact"]:checked')?.value || "Email";
  const urgency = document.querySelector('input[name="service-urgency"]:checked')?.value || "This month";
  const note = document.querySelector("[data-service-note]")?.value.trim() || "No note added.";
  const id = `request-${Date.now()}`;
  const request = {
    id,
    type: copy.requestType,
    propertyId: property.id,
    propertyLabel: property.label,
    status: "Awaiting review",
    created: "Just now",
    linkedTo: copy.linkedTo,
    contact,
    urgency,
    note
  };

  labsState.serviceRequests.unshift(request);
  addServiceTimelineEvent({
    type: "service-request",
    category: "Service request",
    title: copy.eventTitle,
    body: copy.eventBody,
    badge: "Awaiting review",
    activityLabel: `${copy.requestType} requested`,
    details: {
      title: "Request details",
      rows: [
        ["Property", property.address],
        ["Request type", copy.requestType],
        ["Status", "Awaiting review"],
        ["Created", "Just now"],
        ["Preferred contact", contact],
        ["Urgency", urgency]
      ],
      note
    }
  });
  renderAllState();
  document.querySelector("[data-service-success-type]").textContent = copy.requestType;
  document.querySelector("[data-service-success-property]").textContent = property.label;
  document.querySelector("[data-service-form]").hidden = true;
  document.querySelector("[data-service-success]").hidden = false;
  hydrateIcons();
  showToast("Support request added to property file");
}

function cancelSupportRequest(id) {
  const request = labsState.serviceRequests.find((item) => item.id === id);

  if (!request || request.status === "Cancelled") {
    return;
  }

  if (!window.confirm("Cancel this walkthrough support request?")) {
    return;
  }

  request.status = "Cancelled";
  const property = getPortfolioPropertyById(requestPropertyId(request));
  addServiceTimelineEvent({
    type: "service-cancel",
    category: "Service request",
    title: "Support request cancelled",
    body: `The ${request.type.toLowerCase()} request was marked as cancelled in CMP Labs.`,
    badge: "Cancelled",
    badgeClass: "status-neutral-text",
    activityLabel: "Support request cancelled",
    details: {
      title: "Cancellation details",
      rows: [
        ["Property", property.address],
        ["Request type", request.type],
        ["Status", "Cancelled"],
        ["Updated", "Just now"]
      ],
      note: "Prototype service history for layout testing."
    }
  });
  showToast("Support request cancelled");
}

function openHandledModal() {
  const copy = serviceCopy();
  document.querySelector("[data-handled-title]").textContent = copy.handledTitle;
  renderChoiceList(document.querySelector("[data-handled-options]"), copy.handledOptions, "handled-option");
  openTimelineModal("[data-handled-modal]");
}

function saveHandledStatus() {
  const selected = document.querySelector('input[name="handled-option"]:checked')?.value || "I want to review this later";
  const isEicr = serviceMode() === "eicr";
  const title = isEicr ? "EICR support status recorded" : "Inspection status recorded";

  addServiceTimelineEvent({
    type: "service-status",
    category: "Service request",
    title,
    body: selected,
    badge: "Recorded",
    badgeClass: "status-neutral-text",
    activityLabel: title,
    details: {
      title: "Recorded status",
      rows: [
        ["Property", "57 The Butts"],
        ["Area", isEicr ? "Electrical Safety" : "Inspection evidence"],
        ["Answer", selected],
        ["Status", "Recorded"]
      ],
      note: "Prototype support status for layout testing."
    }
  });
  closeTimelineModals();
  showToast("Recommendation status recorded");
}

function createCallbackRequest() {
  addServiceTimelineEvent({
    type: "callback",
    category: "Human support",
    icon: "message",
    title: "Callback requested",
    body: "CMP recorded a callback request for this property.",
    badge: "Awaiting review",
    activityLabel: "Callback requested",
    details: {
      title: "Callback details",
      rows: [
        ["Property", "57 The Butts"],
        ["Status", "Awaiting review"],
        ["Created", "Just now"],
        ["Source", "Services tab"]
      ],
      note: "Prototype callback request for layout testing."
    }
  });
  closeTimelineModals();
  showToast("Callback request recorded");
}

function createSupportMessage() {
  const input = document.querySelector("[data-message-input]");
  const body = input?.value.trim() || "Support message recorded for CMP review.";

  addServiceTimelineEvent({
    type: "message",
    category: "Human support",
    icon: "message",
    title: "Support message added",
    body,
    badge: "Recorded",
    badgeClass: "status-neutral-text",
    activityLabel: "Support message added",
    details: {
      title: "Message details",
      rows: [
        ["Property", "57 The Butts"],
        ["Status", "Recorded"],
        ["Created", "Just now"],
        ["Source", "Services tab"]
      ],
      note: "Prototype support message for layout testing."
    }
  });
  closeTimelineModals();
  showToast("Message recorded");
}

function bindServices() {
  renderServicesState();

  document.addEventListener("click", (event) => {
    const scrollButton = event.target.closest("[data-scroll-target]");
    if (scrollButton) {
      scrollToPanel(scrollButton.dataset.scrollTarget);
    }

    if (event.target.closest("[data-service-request-open]")) {
      openServiceRequestModal();
    }

    if (event.target.closest("[data-service-create]")) {
      createSupportRequest();
    }

    if (event.target.closest("[data-view-request]")) {
      closeTimelineModals();
      scrollToPanel(labsState.currentView === "bookService" ? "[data-global-open-requests-panel]" : "[data-open-requests-panel]");
    }

    const cancelButton = event.target.closest("[data-cancel-request]");
    if (cancelButton) {
      cancelSupportRequest(cancelButton.dataset.cancelRequest);
    }

    if (event.target.closest("[data-service-upload-action]")) {
      if (labsState.eicrAdded) {
        showToast("Preview only — inspection upload is not connected to a live workflow.");
      } else {
        document.querySelector("[data-file-input]")?.click();
      }
    }

    if (event.target.closest("[data-callback-open]")) {
      document.querySelector("[data-callback-phone]").value = "";
      document.querySelector("[data-callback-time]").value = "";
      document.querySelector("[data-callback-help]").value = "";
      openTimelineModal("[data-callback-modal]");
    }

    if (event.target.closest("[data-message-open]")) {
      document.querySelector("[data-message-input]").value = "";
      openTimelineModal("[data-message-modal]");
    }

    if (event.target.closest("[data-handled-open]")) {
      openHandledModal();
    }
  });

  document.querySelector("[data-callback-save]")?.addEventListener("click", createCallbackRequest);
  document.querySelector("[data-message-save]")?.addEventListener("click", createSupportMessage);
  document.querySelector("[data-handled-save]")?.addEventListener("click", saveHandledStatus);

  document.querySelectorAll("[data-service-close], [data-callback-close], [data-message-close], [data-handled-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function addPropertyTimelineEvent(event) {
  labsState.propertyEvents.unshift({
    id: `${event.type}-${Date.now()}`,
    createdAt: Date.now(),
    group: "Today",
    filter: event.filter || "details",
    icon: event.icon || "home",
    category: event.category || "Property details",
    title: event.title,
    body: event.body,
    badge: event.badge,
    badgeClass: event.badgeClass || "status-watch-text",
    activityLabel: event.activityLabel,
    type: event.type,
    actions: event.actions || [],
    details: event.details || null
  });
  renderAllState();
}

function applyScenarioByOccupancy(occupancy) {
  const scenario = occupancyScenarioMap[occupancy];

  if (!scenario || !scenarioContent[scenario]) {
    return;
  }

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scenario === scenario);
  });

  const content = scenarioContent[scenario];
  const title = document.querySelector("[data-scenario-title]");
  const body = document.querySelector("[data-scenario-body]");
  const priorities = document.querySelector("[data-scenario-priorities]");

  if (title) {
    title.textContent = content.title;
  }

  if (body) {
    body.textContent = content.body;
  }

  if (priorities) {
    priorities.innerHTML = content.priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }
}

function renderPropertyDetailsState() {
  const details = labsState.propertyDetails;

  document.querySelector("[data-profile-property-type]") && (document.querySelector("[data-profile-property-type]").textContent = details.propertyType);
  document.querySelector("[data-profile-bedrooms]") && (document.querySelector("[data-profile-bedrooms]").textContent = details.bedrooms);
  document.querySelector("[data-profile-occupancy]") && (document.querySelector("[data-profile-occupancy]").textContent = details.occupancy);
  document.querySelector("[data-profile-goal]") && (document.querySelector("[data-profile-goal]").textContent = details.goal);
  document.querySelector("[data-header-occupancy]") && (document.querySelector("[data-header-occupancy]").textContent = details.occupancy);
  document.querySelector("[data-header-goal]") && (document.querySelector("[data-header-goal]").textContent = details.goal);

  labsDemoProperty.occupancy = details.occupancy;
  labsDemoProperty.journey = details.goal;

  const eicrCard = document.querySelector("[data-details-eicr-card]");
  const eicrIcon = document.querySelector("[data-details-eicr-icon]");
  const eicrStatus = document.querySelector("[data-details-eicr-status]");
  const eicrSource = document.querySelector("[data-details-eicr-source]");
  const eicrList = document.querySelector("[data-details-eicr-list]");
  const eicrAction = document.querySelector("[data-details-eicr-action]");

  if (eicrCard && eicrStatus && eicrSource && eicrList && eicrAction) {
    eicrCard.classList.toggle("is-verified", labsState.eicrAdded);
    eicrIcon.dataset.icon = labsState.eicrAdded ? "shield" : "alert";
    eicrStatus.textContent = labsState.eicrAdded ? "Verified" : "Needs checking";
    eicrStatus.classList.toggle("status-good-text", labsState.eicrAdded);
    eicrStatus.classList.toggle("status-review-text", !labsState.eicrAdded);
    eicrSource.textContent = labsState.eicrAdded ? "Uploaded document" : "Source: no EICR evidence stored";
    eicrList.innerHTML = labsState.eicrAdded
      ? `
        <li>Inspection date: 12 May 2026</li>
        <li>Review date: 11 May 2031</li>
        <li>Outcome: Satisfactory</li>
      `
      : "<li>No current EICR linked to this property file</li>";
    eicrAction.textContent = labsState.eicrAdded ? "View EICR" : "Upload EICR";
    eicrAction.toggleAttribute("data-upload-trigger", !labsState.eicrAdded);
    if (labsState.eicrAdded) {
      eicrAction.dataset.toast = "Preview only — certificate viewing is not connected to live storage.";
    } else {
      delete eicrAction.dataset.toast;
    }
  }

  renderOptionalDetailsState();
  renderPropertyMemoryState();
  renderPortfolioHomeState();
  hydrateIcons();
}

function openBasicsModal() {
  const details = labsState.propertyDetails;
  setSelectValue("[data-basics-property-type]", details.propertyType);
  setSelectValue("[data-basics-bedrooms]", details.bedrooms);
  setSelectValue("[data-basics-occupancy]", details.occupancy);
  setSelectValue("[data-basics-goal]", details.goal);
  openTimelineModal("[data-basics-modal]");
}

function savePropertyBasics() {
  const previous = { ...labsState.propertyDetails };
  const next = {
    propertyType: document.querySelector("[data-basics-property-type]")?.value || previous.propertyType,
    bedrooms: document.querySelector("[data-basics-bedrooms]")?.value || previous.bedrooms,
    occupancy: document.querySelector("[data-basics-occupancy]")?.value || previous.occupancy,
    goal: document.querySelector("[data-basics-goal]")?.value || previous.goal
  };

  const changedRows = Object.entries(next)
    .filter(([key, value]) => value !== previous[key])
    .map(([key, value]) => [propertyFieldLabel(key), `${previous[key]} -> ${value}`]);

  labsState.propertyDetails = next;
  applyScenarioByOccupancy(next.occupancy);

  if (changedRows.length) {
    addPropertyTimelineEvent({
      type: "property-update",
      title: "Property details updated",
      body: "The property profile was updated in CMP Labs.",
      badge: "Landlord updated",
      activityLabel: "Property details updated",
      details: {
        title: "Changed fields",
        rows: [...changedRows, ["Created", "Just now"]],
        note: "Prototype property update for layout testing."
      }
    });
  } else {
    renderAllState();
  }

  closeTimelineModals();
  showToast("Property details updated");
}

function propertyFieldLabel(key) {
  return {
    propertyType: "Property type",
    bedrooms: "Bedrooms",
    occupancy: "Occupancy",
    goal: "Primary workspace goal"
  }[key] || key;
}

function renderOptionalDetailsState() {
  const count = Object.values(labsState.optionalDetails).filter((value) => value.trim()).length;
  const countNode = document.querySelector("[data-optional-count]");

  if (countNode) {
    countNode.textContent = `${count} of 6 added`;
  }

  Object.keys(optionalDetailLabels).forEach((key) => {
    const item = document.querySelector(`[data-optional-item="${key}"]`);
    if (item) {
      item.classList.toggle("is-complete", Boolean(labsState.optionalDetails[key].trim()));
    }
  });
}

function openOptionalModal() {
  Object.keys(optionalDetailLabels).forEach((key) => {
    const field = document.querySelector(`[data-optional-field="${key}"]`);
    if (field) {
      field.value = labsState.optionalDetails[key] || "";
    }
  });
  openTimelineModal("[data-optional-modal]");
}

function saveOptionalDetails() {
  const next = { ...labsState.optionalDetails };

  Object.keys(optionalDetailLabels).forEach((key) => {
    next[key] = document.querySelector(`[data-optional-field="${key}"]`)?.value.trim() || "";
  });

  const addedRows = Object.entries(next)
    .filter(([, value]) => value)
    .map(([key, value]) => [optionalDetailLabels[key], value]);

  labsState.optionalDetails = next;
  renderOptionalDetailsState();

  if (addedRows.length) {
    addPropertyTimelineEvent({
      type: "optional-details",
      title: "Optional property details added",
      body: "Additional property context was saved in CMP Labs.",
      badge: "Landlord updated",
      activityLabel: "Optional property details saved",
      details: {
        title: "Optional details",
        rows: [...addedRows, ["Created", "Just now"]],
        note: "Prototype optional property details for layout testing."
      }
    });
  }

  closeTimelineModals();
  showToast("Optional property details saved");
}

function observationLabel(count) {
  return count === 1 ? "1 observation" : `${count} observations`;
}

function renderPropertyMemoryState() {
  ["kitchen", "bathroom", "living"].forEach((room) => {
    const count = labsState.propertyMemory.rooms[room].length;
    const status = document.querySelector(`[data-room-status="${room}"]`);
    if (status) {
      status.textContent = count ? observationLabel(count) : "No notes yet";
    }
  });

  renderMemoryModal();
}

function openMemoryModal(room = labsState.propertyMemory.activeRoom, showAdd = false) {
  labsState.propertyMemory.activeRoom = room;
  renderMemoryModal();
  openTimelineModal("[data-memory-modal]");
  if (showAdd) {
    showMemoryAddPanel();
  }
}

function renderMemoryModal() {
  const roomList = document.querySelector("[data-memory-room-list]");
  const detail = document.querySelector("[data-memory-detail]");
  const roomSelect = document.querySelector("[data-memory-room-select]");

  if (!roomList || !detail || !roomSelect) {
    return;
  }

  const activeRoom = labsState.propertyMemory.activeRoom;
  roomList.innerHTML = Object.entries(roomLabels).map(([key, label]) => `
    <button class="${key === activeRoom ? "is-active" : ""}" type="button" data-memory-room="${key}">
      <span>${escapeHtml(label)}</span>
      <small>${labsState.propertyMemory.rooms[key].length ? escapeHtml(observationLabel(labsState.propertyMemory.rooms[key].length)) : "No notes"}</small>
    </button>
  `).join("");
  roomSelect.innerHTML = Object.entries(roomLabels).map(([key, label]) => `
    <option value="${key}" ${key === activeRoom ? "selected" : ""}>${escapeHtml(label)}</option>
  `).join("");

  const observations = labsState.propertyMemory.rooms[activeRoom];
  detail.innerHTML = `
    <h3>${escapeHtml(roomLabels[activeRoom])}</h3>
    ${observations.length
      ? observations.map((item) => `
          <article class="memory-observation">
            <span class="source-badge">${escapeHtml(item.status || "Observation")}</span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.body)}</p>
            <small>Created: ${escapeHtml(item.created || "Just now")}</small>
          </article>
        `).join("")
      : `<p class="memory-empty">No observations have been recorded for this room yet.</p>`
    }
  `;
}

function showMemoryAddPanel() {
  const panel = document.querySelector("[data-memory-add-panel]");
  const actions = document.querySelector("[data-memory-actions]");
  const activeRoom = labsState.propertyMemory.activeRoom;

  if (panel) {
    panel.hidden = false;
  }
  if (actions) {
    actions.hidden = true;
  }

  setSelectValue("[data-memory-room-select]", activeRoom);
  document.querySelector("[data-memory-observation]").value = "";
  document.querySelector("[data-memory-follow-up]").value = "Review at next inspection";
}

function hideMemoryAddPanel() {
  document.querySelector("[data-memory-add-panel]") && (document.querySelector("[data-memory-add-panel]").hidden = true);
  document.querySelector("[data-memory-actions]") && (document.querySelector("[data-memory-actions]").hidden = false);
}

function saveMemoryObservation() {
  const room = document.querySelector("[data-memory-room-select]")?.value || labsState.propertyMemory.activeRoom;
  const observation = document.querySelector("[data-memory-observation]")?.value.trim();
  const followUp = document.querySelector("[data-memory-follow-up]")?.value.trim() || "Review later";

  if (!observation) {
    showToast("Add an observation before saving");
    return;
  }

  const item = {
    title: observation.split(".")[0].slice(0, 72),
    body: observation,
    status: followUp,
    created: "Just now"
  };

  labsState.propertyMemory.rooms[room].unshift(item);
  labsState.propertyMemory.activeRoom = room;
  hideMemoryAddPanel();
  renderPropertyMemoryState();
  addPropertyTimelineEvent({
    type: "memory-observation",
    icon: "message",
    title: "Property Memory observation added",
    body: observation,
    badge: "Memory updated",
    activityLabel: "Property Memory updated",
    details: {
      title: "Memory observation",
      rows: [
        ["Room", roomLabels[room]],
        ["Observation", observation],
        ["Follow-up", followUp],
        ["Created", "Just now"]
      ],
      note: "Prototype Property Memory record for layout testing."
    }
  });
  showToast("Property Memory updated");
}

function bindPropertyDetails() {
  renderPropertyDetailsState();

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-property-basics-open]")) {
      openBasicsModal();
    }

    if (event.target.closest("[data-basics-save]")) {
      savePropertyBasics();
    }

    if (event.target.closest("[data-optional-open]")) {
      openOptionalModal();
    }

    if (event.target.closest("[data-optional-save]")) {
      saveOptionalDetails();
    }

    const memoryRoomButton = event.target.closest("[data-memory-open-room]");
    if (memoryRoomButton) {
      openMemoryModal(memoryRoomButton.dataset.memoryOpenRoom, memoryRoomButton.hasAttribute("data-memory-add-first"));
    }

    if (event.target.closest("[data-memory-open]")) {
      openMemoryModal();
    }

    const memoryRoom = event.target.closest("[data-memory-room]");
    if (memoryRoom) {
      labsState.propertyMemory.activeRoom = memoryRoom.dataset.memoryRoom;
      hideMemoryAddPanel();
      renderMemoryModal();
    }

    if (event.target.closest("[data-memory-add]")) {
      showMemoryAddPanel();
    }

    if (event.target.closest("[data-memory-cancel]")) {
      hideMemoryAddPanel();
    }

    if (event.target.closest("[data-memory-save]")) {
      saveMemoryObservation();
    }
  });

  document.querySelectorAll("[data-basics-close], [data-optional-close], [data-memory-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTimelineEvents() {
  const events = [
    ...labsState.serviceEvents.map((event) => ({ ...event })),
    ...labsState.propertyEvents.map((event) => ({ ...event })),
    ...labsState.notes.map((note) => ({
      id: note.id,
      group: "Today",
      filter: "notes",
      icon: "message",
      category: "Note",
      title: "Property note added",
      body: note.body,
      badge: "Landlord note",
      badgeClass: "status-watch-text",
      actions: [],
      details: null
    }))
  ];

  if (labsState.eicrAdded) {
    events.push({
      id: "eicr-verified",
      group: "Today",
      filter: "evidence",
      icon: "shield",
      category: "Evidence",
      title: "EICR evidence verified",
      body: "A satisfactory Electrical Installation Condition Report was reviewed and added to the property file.",
      badge: "Verified",
      badgeClass: "status-good-text",
      actions: [{ label: "View evidence", toast: "Preview only — certificate viewing is not connected to live storage." }],
      details: {
        title: "Document details",
        rows: [
          ["Document type", "Electrical Installation Condition Report"],
          ["Matched to", "57 The Butts"],
          ["Inspection date", "12 May 2026"],
          ["Review date", "11 May 2031"],
          ["Outcome", "Satisfactory"],
          ["Confidence", "High"],
          ["Status", "Verified from uploaded document"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    });
  }

  events.push(
    {
      id: "electrical-gap",
      group: "Today",
      filter: "compliance",
      icon: labsState.eicrAdded ? "check" : "alert",
      category: "Compliance check",
      title: "Electrical Safety gap identified",
      body: "CMP could not find a current EICR in the property file. Electrical Safety became the clearest next evidence priority.",
      badge: labsState.eicrAdded ? "Evidence accepted" : "Needs checking",
      badgeClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      resolved: labsState.eicrAdded,
      open: !labsState.eicrAdded,
      resolvedNote: labsState.eicrAdded ? "Evidence accepted after EICR verification" : "",
      actions: labsState.eicrAdded
        ? []
        : [
            { label: "Upload EICR", upload: true, primary: true },
            { label: "Ask CMP why this matters", assistant: "Your clearest next step is to add or arrange an EICR. This strengthens the Electrical Safety record in the property file." }
          ],
      details: {
        title: "Why CMP flagged this",
        rows: [
          ["Source", "Property file review"],
          ["Document type", "EICR"],
          ["Status", labsState.eicrAdded ? "Evidence accepted from uploaded document" : "No matching evidence stored"],
          ["Property match", "57 The Butts"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    },
    {
      id: "gas-verified",
      group: "Today",
      filter: "evidence",
      icon: "shield",
      category: "Evidence",
      title: "Gas Safety Certificate verified",
      body: "Uploaded certificate reviewed and stored against 57 The Butts.",
      badge: "Verified",
      badgeClass: "status-good-text",
      actions: [{ label: "View evidence", toast: "Preview only — document viewing is not connected to live storage." }],
      details: {
        title: "Document details",
        rows: [
          ["Source", "Uploaded document"],
          ["Document type", "Gas Safety Certificate"],
          ["Valid until", "18 June 2027"],
          ["Confidence", "High"],
          ["Status", "Verified from uploaded document"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    },
    {
      id: "epc-imported",
      group: "Today",
      filter: "evidence",
      icon: "zap",
      category: "Official record",
      title: "EPC record imported",
      body: "CMP matched an Energy Performance Certificate to this property.",
      badge: "Confirmed",
      badgeClass: "status-good-text",
      actions: [{ label: "View record", toast: "Preview only — official record viewing is not connected to live records." }],
      details: {
        title: "Official record details",
        rows: [
          ["Source", "Official record"],
          ["Document type", "Energy Performance Certificate"],
          ["Valid until", "14 March 2031"],
          ["Property match", "57 The Butts"],
          ["Status", "Confirmed from official record"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    },
    {
      id: "licensing-review",
      group: "Today",
      filter: "compliance",
      icon: "map",
      category: "Compliance check",
      title: "Local licensing review started",
      body: "CMP marked the postcode for a local rules review so the property file can show whether any extra checks may be relevant.",
      badge: "Checking",
      badgeClass: "status-watch-text",
      actions: [{ label: "Ask CMP", assistant: "Local licensing requirements can vary by area and property setup. CMP is showing this as a review item until the position is confirmed." }],
      details: {
        title: "Review details",
        rows: [
          ["Source", "Postcode review"],
          ["Area", "Local licensing"],
          ["Property match", "57 The Butts"],
          ["Status", "Review in progress"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    },
    {
      id: "inspection-follow-up",
      group: "Today",
      filter: "actions",
      icon: "calendar",
      category: "Actions",
      title: "Inspection follow-up prepared",
      body: "CMP prepared inspection evidence as a useful follow-up item for this vacant property.",
      badge: "Prepared",
      badgeClass: "status-watch-text",
      actions: [{ label: "Upload inspection evidence", upload: true }],
      details: null
    },
    {
      id: "alarms-confirmed",
      group: "Earlier this week",
      filter: "compliance",
      icon: "bell",
      category: "Landlord answer",
      title: "Alarm testing confirmed",
      body: "Smoke and CO alarms were reported as tested. Supporting evidence has not yet been uploaded.",
      badge: "Landlord confirmed",
      badgeClass: "status-watch-text",
      actions: [
        { label: "Add evidence", upload: true },
        { label: "Review answer", toast: "Preview only — answer review is not connected to a live workflow." }
      ],
      details: {
        title: "Answer details",
        rows: [
          ["Source", "Landlord answer"],
          ["Area", "Smoke and CO alarms"],
          ["Evidence", "Not uploaded"],
          ["Status", "Landlord confirmed"]
        ],
        note: "Prototype evidence record for layout testing."
      }
    },
    {
      id: "vacant-scenario",
      group: "Earlier this week",
      filter: "details",
      icon: "home",
      category: "Property details",
      title: "Property marked as vacant",
      body: "CMP adjusted the suggested next steps to focus on core evidence, inspection records and readiness for a future tenancy.",
      badge: "Scenario updated",
      badgeClass: "status-watch-text",
      actions: [{ label: "View scenario", toast: "Scenario detail is shown in the Compliance tab." }],
      details: null
    },
    {
      id: "file-created",
      group: "Earlier this week",
      filter: "details",
      icon: "building",
      category: "Property setup",
      title: "Property file created",
      body: "57 The Butts was added to the CMP Labs workspace.",
      badge: "Recorded",
      badgeClass: "status-neutral-text",
      actions: [],
      details: null
    }
  );

  return events;
}

function eventMatchesFilter(event) {
  if (labsState.timelineFilter === "all") {
    return true;
  }

  if (labsState.timelineFilter === "actions") {
    return event.filter === "actions" || event.open || event.actions?.some((action) => action.primary || action.upload);
  }

  return event.filter === labsState.timelineFilter;
}

function renderTimelineEvent(event) {
  const actions = event.actions?.map((action) => {
    const attrs = action.upload
      ? "data-upload-trigger"
      : action.assistant
        ? `data-assistant-message="${escapeHtml(action.assistant)}"`
        : `data-toast="${escapeHtml(action.toast || "Preview only — this action is not connected to a live workflow.")}"`;
    const className = action.primary ? "primary-button" : "text-button";
    return `<button class="${className}" type="button" ${attrs}>${escapeHtml(action.label)}</button>`;
  }).join("") || "";

  const detailsButton = event.details
    ? `<button class="text-button" type="button" data-event-toggle="${event.id}" aria-expanded="false">Show details</button>`
    : "";

  const details = event.details
    ? `
      <div class="timeline-details" hidden data-event-details="${event.id}">
        <h4>${escapeHtml(event.details.title)}</h4>
        <dl>
          ${event.details.rows.map(([term, detail]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(detail)}</dd></div>`).join("")}
        </dl>
        <small>${escapeHtml(event.details.note)}</small>
      </div>
    `
    : "";

  return `
    <article class="timeline-event${event.open ? " is-open" : ""}${event.resolved ? " is-resolved" : ""}" data-event-id="${event.id}">
      <div class="timeline-event-top">
        <div>
          <span class="timeline-event-kicker"><span class="nav-icon" data-icon="${event.icon}"></span>${escapeHtml(event.category)}</span>
          <h3>${escapeHtml(event.title)}</h3>
        </div>
        <span class="doc-status ${event.badgeClass}">${escapeHtml(event.badge)}</span>
      </div>
      <p>${escapeHtml(event.body)}</p>
      ${event.resolvedNote ? `<span class="timeline-resolved-note">${escapeHtml(event.resolvedNote)}</span>` : ""}
      ${details}
      ${actions || detailsButton ? `<div class="button-row">${actions}${detailsButton}</div>` : ""}
    </article>
  `;
}

function renderTimelineState() {
  const list = document.querySelector("[data-timeline-list]");

  if (!list) {
    return;
  }

  const allEvents = getTimelineEvents();
  const events = allEvents.filter(eventMatchesFilter);
  const groups = [...new Set(events.map((event) => event.group))];

  list.innerHTML = groups.length
    ? groups.map((group) => `
        <section class="timeline-day">
          <span class="timeline-day-label">${escapeHtml(group)}</span>
          <div class="timeline-events">
            ${events.filter((event) => event.group === group).map(renderTimelineEvent).join("")}
          </div>
        </section>
      `).join("")
    : `<div class="timeline-empty">No timeline events match this filter yet.</div>`;

  document.querySelector("[data-timeline-event-count]").textContent = allEvents.length;
  document.querySelector("[data-timeline-evidence-count]").textContent = labsState.eicrAdded ? "4" : "3";
  document.querySelector("[data-timeline-open-count]").textContent = "1";

  document.querySelector("[data-visit-title]").textContent = labsState.eicrAdded ? "3 useful updates" : "2 useful updates";
  document.querySelector("[data-visit-list]").innerHTML = labsState.eicrAdded
    ? `
      <li>Gas Safety evidence was verified</li>
      <li>Electrical Safety evidence was added</li>
      <li>Inspection evidence is now the next useful upload</li>
    `
    : `
      <li>Gas Safety evidence was verified</li>
      <li>Electrical Safety became the highest-priority evidence gap</li>
    `;

  document.querySelector("[data-timeline-action-body]").textContent = labsState.eicrAdded
    ? "Add inspection evidence or confirm that no recent inspection has been completed."
    : "Add or arrange an EICR to strengthen the Electrical Safety record.";
  document.querySelector("[data-timeline-action-buttons]").innerHTML = labsState.eicrAdded
    ? `
      <button class="primary-button" type="button" data-global-service-action="uploadInspection">Upload inspection evidence</button>
      <button class="secondary-button" type="button" data-toast="Inspection status is recorded locally for this walkthrough.">Mark as not yet completed</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="secondary-button" type="button" data-open-global-service>Arrange an EICR</button>
    `;

  document.querySelector("[data-summary-confirmed]").innerHTML = labsState.eicrAdded
    ? `
      <li>EPC — confirmed from official record</li>
      <li>Gas Safety — verified from uploaded document</li>
      <li>EICR — verified from uploaded document</li>
    `
    : `
      <li>EPC — confirmed from official record</li>
      <li>Gas Safety — verified from uploaded document</li>
      <li>EICR — needs checking</li>
    `;
  document.querySelector("[data-summary-needs]").innerHTML = labsState.eicrAdded
    ? `
      <li>Local licensing position</li>
      <li>Inspection evidence</li>
    `
    : `
      <li>Electrical Safety evidence</li>
      <li>Local licensing position</li>
      <li>Inspection evidence</li>
    `;

  hydrateIcons();
}

function openTimelineModal(selector) {
  const backdrop = document.querySelector("[data-timeline-backdrop]");
  const modal = document.querySelector(selector);

  if (backdrop) {
    backdrop.hidden = false;
  }

  if (modal) {
    modal.hidden = false;
  }
}

function closeTimelineModals() {
  document.querySelector("[data-timeline-backdrop]").hidden = true;
  [
    "[data-summary-modal]",
    "[data-journey-action-modal]",
    "[data-note-modal]",
    "[data-service-modal]",
    "[data-callback-modal]",
    "[data-message-modal]",
    "[data-handled-modal]",
    "[data-home-alarm-modal]",
    "[data-evidence-inbox-modal]",
    "[data-task-detail-modal]",
    "[data-activity-detail-modal]",
    "[data-activity-summary-modal]",
    "[data-demo-state-modal]",
    "[data-demo-guide-modal]",
    "[data-second-property-modal]",
    "[data-add-property-modal]",
    "[data-bundle-modal]",
    "[data-learn-preview-modal]",
    "[data-basics-modal]",
    "[data-optional-modal]",
    "[data-memory-modal]"
  ].forEach((selector) => {
    const modal = document.querySelector(selector);
    if (modal) {
      modal.hidden = true;
    }
  });
}

function bindTimeline() {
  renderTimelineState();

  document.querySelectorAll("[data-timeline-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.timelineFilter = button.dataset.timelineFilter;
      document.querySelectorAll("[data-timeline-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderTimelineState();
    });
  });

  document.querySelector("[data-timeline-list]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-event-toggle]");

    if (!button) {
      return;
    }

    const details = document.querySelector(`[data-event-details="${button.dataset.eventToggle}"]`);

    if (!details) {
      return;
    }

    const willOpen = details.hidden;

    document.querySelectorAll("[data-event-details]").forEach((item) => {
      if (item !== details) {
        item.hidden = true;
      }
    });

    document.querySelectorAll("[data-event-toggle]").forEach((item) => {
      if (item !== button) {
        item.textContent = "Show details";
        item.setAttribute("aria-expanded", "false");
      }
    });

    details.hidden = !willOpen;
    button.textContent = willOpen ? "Hide details" : "Show details";
    button.setAttribute("aria-expanded", String(willOpen));
  });

  document.querySelector("[data-summary-open]")?.addEventListener("click", () => {
    renderTimelineState();
    openTimelineModal("[data-summary-modal]");
  });

  document.querySelectorAll("[data-summary-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.querySelector("[data-note-open]")?.addEventListener("click", () => {
    document.querySelector("[data-note-input]").value = "";
    openTimelineModal("[data-note-modal]");
  });

  document.querySelectorAll("[data-note-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.querySelector("[data-note-save]")?.addEventListener("click", () => {
    const input = document.querySelector("[data-note-input]");
    const body = input.value.trim();

    if (!body) {
      showToast("Add a note before saving");
      return;
    }

    labsState.notes.unshift({ id: `note-${Date.now()}`, body });
    labsState.timelineFilter = "all";
    document.querySelectorAll("[data-timeline-filter]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.timelineFilter === "all");
    });
    closeTimelineModals();
    renderTimelineState();
    showToast("Note added to property timeline");
  });

  document.querySelector("[data-timeline-backdrop]")?.addEventListener("click", closeTimelineModals);
}

async function copyInboxAddress(addressOverride) {
  const address = typeof addressOverride === "string"
    ? addressOverride
    : document.querySelector("[data-inbox-address]")?.textContent?.trim();

  if (!address) {
    return;
  }

  try {
    await navigator.clipboard.writeText(address);
    showToast("Evidence Inbox address copied");
  } catch {
    showToast(`Evidence Inbox: ${address}`);
  }
}

function bindInbox() {
  document.querySelector("[data-copy-inbox]")?.addEventListener("click", copyInboxAddress);
}

function clearScanTimers() {
  labsState.scanTimers.forEach((timer) => window.clearTimeout(timer));
  labsState.scanTimers = [];
}

function openSmartModal() {
  clearScanTimers();
  document.querySelector("[data-modal-backdrop]").hidden = false;
  document.querySelector("[data-smart-modal]").hidden = false;
  document.querySelector("[data-scan-view]").hidden = false;
  document.querySelector("[data-results-view]").hidden = true;
  document.querySelector("[data-review-view]").hidden = true;
  runScanSequence();
}

function closeSmartModal() {
  clearScanTimers();
  const backdrop = document.querySelector("[data-modal-backdrop]");
  const modal = document.querySelector("[data-smart-modal]");

  if (backdrop) {
    backdrop.hidden = true;
  }

  if (modal) {
    modal.hidden = true;
  }
}

function runScanSequence() {
  const title = document.querySelector("[data-scan-title]");
  const body = document.querySelector("[data-scan-body]");
  const fill = document.querySelector("[data-scan-fill]");
  const steps = Array.from(document.querySelectorAll("[data-scan-steps] li"));

  scanStages.forEach((stage, index) => {
    const timer = window.setTimeout(() => {
      if (title) {
        title.textContent = stage;
      }

      if (body) {
        body.textContent = index === scanStages.length - 1
          ? "Three documents are ready for landlord review."
          : "Simulating local classification and evidence matching.";
      }

      if (fill) {
        fill.style.height = `${18 + index * 20}%`;
      }

      steps.forEach((step, stepIndex) => {
        step.classList.toggle("is-active", stepIndex === index);
        step.classList.toggle("is-complete", stepIndex < index);
      });

      if (index === scanStages.length - 1) {
        const finishTimer = window.setTimeout(showScanResults, 520);
        labsState.scanTimers.push(finishTimer);
      }
    }, index * 620);

    labsState.scanTimers.push(timer);
  });
}

function renderSmartUploadState() {
  const status = document.querySelector("[data-smart-eicr-status]");
  const note = document.querySelector("[data-smart-eicr-note]");
  const actions = document.querySelector("[data-smart-eicr-actions]");

  if (!status || !note || !actions) {
    return;
  }

  status.classList.toggle("status-good-text", labsState.eicrAdded);
  status.classList.toggle("status-review-text", !labsState.eicrAdded);
  status.textContent = labsState.eicrAdded ? "Already in property file" : "Needs your review";
  note.textContent = labsState.eicrAdded
    ? "Property: 57 The Butts · Current EICR evidence is already stored"
    : "Property: 57 The Butts";
  actions.innerHTML = labsState.eicrAdded
    ? `
      <button class="secondary-button" type="button" data-toast="EICR evidence is already stored in this demo.">View current evidence</button>
      <button class="text-button" type="button" data-upload-trigger>Replace evidence</button>
      <button class="text-button" type="button" data-modal-close>Close</button>
    `
    : `
      <button class="primary-button" type="button" data-review-eicr>Review and add</button>
      <button class="text-button" type="button" data-toast="Extracted details are shown in the review step.">View extracted details</button>
    `;
}

function showScanResults() {
  renderSmartUploadState();
  document.querySelector("[data-scan-view]").hidden = true;
  document.querySelector("[data-results-view]").hidden = false;
  document.querySelector("[data-review-view]").hidden = true;
}

function showEicrReview() {
  if (labsState.eicrAdded) {
    showToast("EICR evidence is already stored in this demo.");
    return;
  }

  document.querySelector("[data-scan-view]").hidden = true;
  document.querySelector("[data-results-view]").hidden = true;
  document.querySelector("[data-review-view]").hidden = false;
}

function bindSmartUpload() {
  const input = document.querySelector("[data-file-input]");
  const dropZone = document.querySelector("[data-drop-zone]");

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-upload-trigger]")) {
      input?.click();
    }

    if (event.target.closest("[data-demo-scan]")) {
      openSmartModal();
    }

    if (event.target.closest("[data-review-eicr]")) {
      showEicrReview();
    }

    if (event.target.closest("[data-confirm-eicr]")) {
      confirmEicr();
    }

    if (event.target.closest("[data-modal-close]")) {
      closeSmartModal();
    }
  });

  input?.addEventListener("change", () => {
    if (input.files.length) {
      openSmartModal();
      input.value = "";
    }
  });

  document.querySelector("[data-modal-backdrop]")?.addEventListener("click", closeSmartModal);

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");

      if (eventName === "drop") {
        openSmartModal();
      }
    });
  });
}

function updateStrength(percent) {
  labsState.strength = percent;
  const value = document.querySelector("[data-strength-value]");
  const meter = document.querySelector("[data-strength-meter]");
  const label = document.querySelector("[data-strength-label]");

  if (value) {
    value.textContent = `${percent}%`;
  }

  if (meter) {
    meter.style.width = `${percent}%`;
  }

  if (label) {
    label.textContent = percent >= 58 ? "Strengthening" : "Building";
  }
}

function confirmEicr() {
  const wasAlreadyConfirmed = labsState.eicrAdded;
  clearScanTimers();
  labsState.eicrAdded = true;
  renderAllState();

  const panel = document.querySelector("[data-strengthened-panel]");
  if (panel && !wasAlreadyConfirmed) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  setAssistantResponse(postEicrAssistantMessage);
  closeSmartModal();
  showToast(wasAlreadyConfirmed
    ? "EICR evidence is already stored in this demo."
    : "Property file strengthened. Electrical Safety evidence verified. Evidence completeness increased from 42% to 58%.");
}

const initialDemoState = initialDemoStateFromUrl();
if (initialDemoState) {
  configureDemoState(initialDemoState);
}

hydrateIcons();
renderAssistantPrompts();
renderAllState();
bindTabs();
bindPortfolioHome();
bindPortfolioProperties();
bindPortfolioCompliance();
bindAzChecker();
bindPortfolioEvidence();
bindPortfolioTasks();
bindPortfolioActivity();
bindJourneyOs();
bindDemoState();
bindUtilityPages();
bindAssistant();
bindMobileMenu();
bindToasts();
bindFindings();
bindPrsDrawer();
bindScenarios();
bindWhatIf();
bindTimeline();
bindInbox();
bindSmartUpload();
bindServices();
bindPropertyDetails();
if (isNickDemoMode()) {
  enterGuidedDemo();
} else if (initialDemoState === "new-property") {
  startJourneyFromNewPropertyState({ scroll: false });
} else {
  showPortfolioHome();
}
if (isEmptyPortfolioMode()) {
  setAssistantResponse(getGlobalAskDefaultResponse());
}

window.labsDemoProperty = labsDemoProperty;
