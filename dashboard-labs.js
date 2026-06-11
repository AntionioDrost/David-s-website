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
      epcFloorArea: "Needs review",
      epcPropertyType: "Flat / apartment",
      epcBuiltForm: "Purpose-built flat",
      epcMatchConfidence: "Prepared for review",
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
      licensingReviewed: false,
      localChecksStarted: false
    },
    landlordAnswers: {
      propertyType: "Flat / apartment",
      bedrooms: "",
      occupancy: "",
      gasAppliances: "",
      eicrAvailable: "",
      alarmStatus: ""
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
  if (confirmations.licensingReviewed) {
    score += 4;
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
  const missingCertificates = [
    evidence.gasSafety?.status !== "uploaded" ? "Gas Safety" : "",
    evidence.eicr?.status !== "uploaded" ? "EICR" : "",
    evidence.alarms?.status === "unknown" ? "Alarm status" : "",
    evidence.inspection?.status !== "uploaded" ? "Inspection record" : ""
  ].filter(Boolean);
  const needsAnswer = [
    confirmations.bedroomsConfirmed ? "" : "Bedrooms",
    confirmations.occupancyConfirmed ? "" : "Occupancy",
    confirmations.gasSafetyRelevanceConfirmed ? "" : "Gas Safety relevance",
    confirmations.alarmsConfirmed ? "" : "Smoke and CO alarms"
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
    primaryTaskTitle: confirmations.findingsConfirmed ? "Confirm occupancy / tenancy status" : "Confirm what CMP found",
    missingEvidence: missingCertificates,
    needsAnswer,
    watchItems: [
      confirmations.findingsConfirmed ? "Found details confirmed" : "Review CMP findings",
      evidence.epc?.status === "acceptedStartingSignal" ? "EPC accepted as starting signal" : "EPC prepared for review",
      missingCertificates.length ? `${missingCertificates.length} evidence items still missing` : "Core certificates uploaded"
    ],
    statusLine: confirmations.findingsConfirmed
      ? "CMP findings confirmed. Continue the guided check before scoring compliance."
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
        { label: "Review CMP findings", action: "reviewFindings", primary: true },
        { label: "Ask CMP", action: "askLicensing" }
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
      source: "Guided check",
      body: "Occupancy determines which checks, documents and reminders CMP should prioritise.",
      status: "Needs confirmation",
      suggestedAction: "Answer the occupancy questions",
      board: "todo",
      filters: ["high"],
      detail: "CMP needs the landlord scenario before treating evidence gaps as reliable.",
      search: "occupancy tenancy status confirm setup 57 butts",
      actions: [
        { label: "Continue guided check", action: "startGuidedCheck", primary: true },
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
      source: "Evidence Vault",
      body: missing ? `${missing} evidence is not uploaded yet.` : "Core certificates are uploaded for review.",
      status: missing ? "Evidence missing" : "Uploaded for review",
      suggestedAction: "Upload certificates",
      board: "todo",
      filters: ["evidence"],
      detail: "CMP created this task because uploaded certificates are needed before evidence confidence can improve.",
      search: "upload certificates gas safety eicr evidence 57 butts",
      actions: [
        { label: evidence.eicr?.status !== "uploaded" ? "Upload EICR" : "Upload Gas Safety", action: evidence.eicr?.status !== "uploaded" ? "uploadEicr" : "uploadGas", primary: true },
        { label: "Open Evidence Vault", action: "openEvidence" }
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
      source: "Guided check",
      body: "CMP needs the landlord answer before it can decide whether supporting evidence is needed.",
      status: "Needs answer",
      suggestedAction: "Continue guided check",
      board: "progress",
      filters: ["evidence"],
      detail: "Alarm status depends on landlord input and supporting evidence if available.",
      search: "smoke co alarm status landlord answer 57 butts",
      actions: [
        { label: "Continue guided check", action: "startGuidedCheck", primary: true },
        { label: "Ask CMP", action: "askLicensing" }
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
        makeActivityAction("Review CMP findings", "reviewFindings", true),
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

  if (lowerPrompt.includes("epc")) {
    return summary.findingsConfirmed
      ? "CMP saved the EPC-style record as a starting signal for this property. It helps setup, but it is not legal verification. Upload or confirm the actual certificate before relying on it."
      : "CMP found an EPC-style match for 57 The Butts with rating C and potential B. Save the smart search results before CMP uses it as setup context.";
  }

  if (lowerPrompt.includes("evidence") || lowerPrompt.includes("upload")) {
    return summary.evidenceConfidenceScore === 0
      ? "No uploaded certificates are stored yet. You can upload Gas Safety or Electrical Safety/EICR documents during setup, and CMP will add anything useful to this property."
      : `Evidence confidence is ${summary.evidenceConfidenceScore}%. Uploaded documents are now attached to this property setup; ${remaining || "the remaining answers"} still need review or confirmation.`;
  }

  if (lowerPrompt.includes("not know") || lowerPrompt.includes("confirm")) {
    return summary.findingsConfirmed
      ? `Smart search findings are saved. CMP still needs ${remaining || "the landlord-only answers"} before the property score is reliable.`
      : "CMP matched the address, prepared an EPC-style record and found Coventry City Council as the local authority. Save these findings, then CMP will ask for the missing information it could not find automatically.";
  }

  if (lowerPrompt.includes("found")) {
    return summary.findingsConfirmed
      ? "Smart search findings are saved. CMP still needs bedrooms, occupancy, Gas Safety relevance, EICR status and alarm answers before the property score is reliable."
      : "CMP matched the address, prepared an EPC-style record and found Coventry City Council as the local authority. Save these findings, then CMP will ask for the missing information it could not find automatically.";
  }

  return summary.findingsConfirmed
    ? "Smart search findings are saved. CMP still needs bedrooms, occupancy, Gas Safety relevance, EICR status and alarm answers before the property score is reliable."
    : "CMP matched the address, prepared an EPC-style record and found Coventry City Council as the local authority. Save these findings, then CMP will ask for the missing information it could not find automatically.";
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
    focusArea: "Fully compliant",
    state: "Fully compliant",
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
    search: "24 maple court fully compliant all evidence complete gas eicr epc alarms tenancy licensing inspection"
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
    focus: summary.findingsConfirmed ? "Guided setup" : "Review CMP findings",
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
  if (isNewPropertyMode()) {
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
  "What changed recently?": "Your EICR was verified and the Electrical Safety gap was resolved. The next useful item is inspection evidence.",
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
    response.textContent = message || defaultAssistantResponse;
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
  showPortfolioHome({ scroll: true });
  setAssistantResponse(getGlobalAskDefaultResponse());
  showToast("Smart search ready — review the property results.");
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
      "Summarise my portfolio": `You have five properties in this Labs portfolio. ${fullyCompliantProperties().length} is fully compliant, portfolio compliance is ${portfolioComplianceScore()}%, and portfolio evidence is ${portfolioEvidenceScore()}%.`,
      "What should I do today?": "Start with 3 Station Road onboarding gaps, then handle 18 Willow Brook Drive Gas Safety renewal and 9 Canal View licensing uncertainty.",
      "Which property needs attention?": "3 Station Road has the lowest readiness score. 18 Willow Brook Drive has the urgent renewal item, while 24 Maple Court is fully compliant.",
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
      "Summarise my properties": "The portfolio contains five properties in different states, including one fully compliant file: 24 Maple Court.",
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
      "Summarise my compliance position": `Portfolio compliance is ${portfolioComplianceScore()}% and evidence is ${portfolioEvidenceScore()}%. 24 Maple Court is fully compliant.`
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
      "What changed recently?": "CMP prepared a five-property Portfolio Sweep and identified 24 Maple Court as fully compliant.",
      "What still needs attention?": "3 Station Road onboarding, Willow Brook Gas Safety renewal and Canal View licensing are the main items.",
      "Summarise portfolio activity": "The activity feed shows the portfolio sweep, fully compliant property, renewal items and evidence gaps by property.",
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

function getAssistantResponse(prompt) {
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
  "checker-is-active"
];

const portfolioPageSelectors = [
  "[data-portfolio-home]",
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
  const homeIntro = document.querySelector(".portfolio-home-header p:not(.section-kicker)");
  const homeBadge = document.querySelector(".portfolio-home-header .prototype-badge");
  const smartSearchSection = document.querySelector("[data-smart-search-results]");
  const autopilotCard = document.querySelector(".portfolio-autopilot-card");
  const pulseGrid = document.querySelector(".portfolio-pulse-grid");
  const homeScoreGrid = document.querySelector("[data-home-score-grid]");
  const homePriorityCard = document.querySelector(".home-priority-card");

  if (!properties.length) {
    smartSearchSection?.setAttribute("hidden", "");
    autopilotCard?.removeAttribute("hidden");
    pulseGrid?.removeAttribute("hidden");
    homeScoreGrid?.removeAttribute("hidden");
    homePriorityCard?.removeAttribute("hidden");
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
    document.querySelector("[data-home-summary-title]").textContent = "Start from scratch";
    document.querySelector("[data-home-summary-body]").textContent = "Add your first property, run the A-Z Checker, upload existing certificates, or ask CMP what to do first.";
    document.querySelector("[data-home-priority-area]").textContent = "Onboarding";
    document.querySelector("[data-home-priority-status]").textContent = "No properties yet";
    document.querySelector("[data-home-priority-body]").textContent = "CMP needs at least one property before it can personalise compliance checks, evidence scores or service recommendations.";
    document.querySelector("[data-home-upload-priority]").textContent = "Add your first property";
    document.querySelector("[data-home-arrange-priority]").textContent = "Ask CMP what to prepare";
    if (autopilotTitle) {
      autopilotTitle.textContent = "Build your CMP workspace from scratch";
    }
    if (autopilotBody) {
      autopilotBody.textContent = "No properties are connected yet. CMP can still guide setup, explain what evidence to gather and prepare the first A-Z check.";
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
          <strong>Run the A-Z Compliance Checker</strong>
          <p>Use the checker to discover which answers and evidence are needed.</p>
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
            <button class="secondary-button" type="button" data-az-mode="single">Preview A-Z Checker</button>
          </div>
        </article>
      `;
    }
    const upcomingGrid = document.querySelector("[data-home-upcoming-grid]");
    if (upcomingGrid) {
      upcomingGrid.innerHTML = [
        ["Add first property", "Create the first CMP property file."],
        ["Run A-Z Compliance Checker", "Answer setup questions before evidence is available."],
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
    if (smartSearchSection) {
      smartSearchSection.hidden = false;
      smartSearchSection.innerHTML = renderSmartSearchResults();
    }
    autopilotCard?.setAttribute("hidden", "");
    pulseGrid?.setAttribute("hidden", "");
    homeScoreGrid?.setAttribute("hidden", "");
    homePriorityCard?.setAttribute("hidden", "");
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
      summaryPrimary.textContent = "Review CMP findings";
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
    document.querySelector("[data-home-upload-priority]").textContent = "Review CMP findings";
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
            <button class="primary-button" type="button" data-az-mode="single">Review CMP findings</button>
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
        ["Review CMP findings", "Step 1", "Confirm the matched address, EPC context, property type, bedrooms and occupancy.", "Review findings", 'data-az-mode="single"'],
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
  smartSearchSection?.setAttribute("hidden", "");
  autopilotCard?.removeAttribute("hidden");
  pulseGrid?.removeAttribute("hidden");
  homeScoreGrid?.removeAttribute("hidden");
  homePriorityCard?.removeAttribute("hidden");
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
      ? "CMP has compared five properties, separated compliance readiness from evidence completeness and found one fully compliant file."
      : isTwoPropertyMode()
      ? "CMP has compared both properties and found the most time-sensitive action first, while keeping other evidence gaps visible."
      : "CMP has reviewed the information currently stored for your property and highlighted the most useful action to take next.";
  }
  document.querySelector("[data-home-summary-title]").textContent = isTwoPropertyMode()
    ? isFivePropertyMode()
      ? "Portfolio sweep: 1 fully compliant, 2 urgent actions"
      : "Priority 1: Gas Safety renewal — 18 Willow Brook Drive"
    : labsState.eicrAdded
      ? "Add recent inspection evidence for 57 The Butts"
      : "Check whether 57 The Butts has a current EICR";
  document.querySelector("[data-home-summary-body]").textContent = isTwoPropertyMode()
    ? isFivePropertyMode()
      ? `${fullyCompliantProperties().length} property is fully compliant. ${portfolioUrgentActionCount()} urgent actions and ${portfolioEvidenceGapCount()} evidence gaps remain across the portfolio.`
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
    ? `${urgentProperty.label}: ${urgentProperty.priorityBody} Portfolio-wide: ${fullyCompliantProperties().length} property is fully compliant and ${portfolioEvidenceGapCount()} evidence gaps remain.`
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
              <p>Open the workspace to find out what this property needs to become compliant.</p>
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
            <button class="secondary-button" type="button" data-new-setup-start>Answer remaining questions</button>
            <button class="secondary-button" type="button" data-evidence-action="uploadGas">Upload certificates</button>
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
    return `
    <li>
      <span>${escapeHtml(row.label)}</span>
      <strong class="${escapeHtml(row.className || "")}">${escapeHtml(row.status)}</strong>
    </li>
  `;
  }).join("");
}

function renderSmartSearchResults() {
  const setup = newPropertySetup();
  const summary = newPropertyStatusSummary(setup);
  const identity = setup.identity || {};
  const foundData = setup.foundData || {};
  const evidence = setup.evidence || {};
  const saved = Boolean(summary.findingsConfirmed);
  const gasUploaded = isNewPropertyEvidenceUploaded(setup, "gasSafety");
  const eicrUploaded = isNewPropertyEvidenceUploaded(setup, "eicr");
  const remainingItems = [
    "Confirm bedrooms",
    "Confirm occupancy / tenancy status",
    gasUploaded ? "" : "Upload Gas Safety if relevant",
    eicrUploaded ? "" : "Upload or arrange Electrical Safety / EICR",
    "Confirm smoke and CO alarm status"
  ].filter(Boolean);

  return `
    <header class="smart-search-hero">
      <div>
        <p class="section-kicker">Smart Search Results</p>
        <h2 id="smartSearchResultsTitle">Here&rsquo;s what CMP found about your property</h2>
        <p>CMP matched the address, checked EPC-style records and prepared a starting property profile. Review the findings, then save them to this property.</p>
      </div>
      <div class="smart-search-address-card">
        <span>Property</span>
        <strong>57 The Butts</strong>
        <small>Coventry, CV1 3BJ</small>
      </div>
    </header>

    ${saved ? `
      <article class="smart-saved-strip">
        <span class="tile-icon" data-icon="check"></span>
        <div>
          <strong>Smart search saved to this property.</strong>
          <p>Found data is now part of the property setup. CMP will only ask for information it could not find automatically.</p>
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
    </section>

    <section class="smart-search-layout">
      <div class="smart-search-main">
        <article class="smart-search-panel">
          <div class="smart-section-heading">
            <p class="section-kicker">Found automatically</p>
            <h3>Useful property records are ready to review</h3>
          </div>
          <div class="smart-found-grid">
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Address matched</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-watch-text"}">${saved ? "Saved and locked" : "Locked after save"}</span>
              </div>
              <h4>Flat 42, 57 The Butts, Coventry, CV1 3BJ</h4>
              <p>Source: Confirmed from address selection</p>
              <small>UPRN ${escapeHtml(identity.uprn || "DEMO-UPRN-57TB")}</small>
            </article>
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">EPC match found</span>
                <span class="doc-status ${saved ? "status-watch-text" : "status-review-text"}">${saved ? "Saved as starting signal" : "Needs review"}</span>
              </div>
              <h4>Rating ${escapeHtml(foundData.epcRating || "C")} · potential ${escapeHtml(foundData.epcPotentialRating || "B")}</h4>
              <dl>
                <div><dt>Expiry</dt><dd>${escapeHtml(foundData.epcExpiryDate || "February 2034")}</dd></div>
                <div><dt>Floor area</dt><dd>${escapeHtml(foundData.epcFloorArea || "Needs review")}</dd></div>
              </dl>
              <p>Source: EPC-style record prepared for review</p>
              <small>Needs review before relying on it.</small>
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
            <article class="smart-found-card">
              <div class="smart-card-top">
                <span class="source-badge">Property type assumption</span>
                <span class="doc-status ${saved ? "status-good-text" : "status-review-text"}">${saved ? "Saved for setup" : "Needs confirmation"}</span>
              </div>
              <h4>${escapeHtml(setup.landlordAnswers?.propertyType || foundData.epcPropertyType || "Flat / apartment")}</h4>
              <p>Source: EPC/address assumption</p>
              <small>Confirm or correct this in the remaining questions.</small>
            </article>
          </div>
        </article>

        <article class="smart-search-panel smart-missing-panel">
          <div class="smart-section-heading">
            <p class="section-kicker">CMP could not find yet</p>
            <h3>These stay open until you answer or upload evidence</h3>
          </div>
          <ul class="smart-missing-list">
            ${renderSmartSearchMissingRows([
              "Bedrooms",
              "Occupancy / tenancy status",
              gasUploaded
                ? { label: "Gas Safety Certificate", status: "Uploaded for review", className: "is-found" }
                : "Gas Safety Certificate",
              eicrUploaded
                ? { label: "Electrical Safety / EICR", status: "Uploaded for review", className: "is-found" }
                : "Electrical Safety / EICR",
              "Smoke and CO alarm status",
              "Tenancy/deposit documents",
              "Inspection evidence"
            ])}
          </ul>
        </article>
      </div>

      <aside class="smart-search-side">
        <article class="smart-upload-panel" data-smart-upload-panel>
          <div>
            <p class="section-kicker">Optional file dump</p>
            <h3>Have certificates or useful files for this property?</h3>
            <p>Upload them now and CMP will add anything useful to this property setup.</p>
          </div>
          <div class="smart-upload-actions">
            <button class="${gasUploaded ? "secondary-button" : "primary-button"}" type="button" data-smart-upload="gasSafety" ${gasUploaded ? "disabled" : ""}>${gasUploaded ? "Gas Safety demo uploaded" : "Upload Gas Safety demo"}</button>
            <button class="${eicrUploaded ? "secondary-button" : "primary-button"}" type="button" data-smart-upload="eicr" ${eicrUploaded ? "disabled" : ""}>${eicrUploaded ? "EICR demo uploaded" : "Upload EICR demo"}</button>
            <button class="text-button" type="button" data-smart-skip-upload>Skip for now</button>
          </div>
          <dl>
            <div><dt>Gas Safety</dt><dd>${escapeHtml(evidence.gasSafety?.status === "uploaded" ? "Uploaded for review" : "No document uploaded")}</dd></div>
            <div><dt>EICR</dt><dd>${escapeHtml(evidence.eicr?.status === "uploaded" ? "Uploaded for review" : "No document uploaded")}</dd></div>
          </dl>
        </article>

        <article class="smart-action-panel">
          <div>
            <p class="section-kicker">Save found data</p>
            <h3>${saved ? "Found data saved" : "Confirm the smart search once"}</h3>
            <p>${saved ? "CMP will not ask you to confirm these found details again." : "This saves the address, EPC starting signal, property type assumption and local context to the property setup."}</p>
          </div>
          <div class="smart-main-actions">
            <button class="${saved ? "secondary-button" : "primary-button"}" type="button" data-smart-confirm ${saved ? "disabled" : ""}>${saved ? "Found data saved" : "Confirm and save found data"}</button>
            <button class="secondary-button" type="button" data-smart-edit-details>Edit found details</button>
            <button class="text-button" type="button" data-smart-ask>Ask CMP what this means</button>
            <button class="text-button" type="button" data-smart-scroll-upload>Upload certificates</button>
          </div>
        </article>
      </aside>
    </section>

    <section class="smart-next-panel">
      <div>
        <p class="section-kicker">${saved ? "What CMP still needs" : "Next after saving"}</p>
        <h3>${saved ? "Answer only the remaining unknowns" : "Save the found data, then fill the gaps"}</h3>
        <p>CMP will only ask for information it could not find automatically.</p>
      </div>
      <ul>
        ${remainingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="button-row">
        <button class="primary-button" type="button" data-smart-answer-remaining>Answer remaining questions</button>
        <button class="secondary-button" type="button" data-smart-scroll-upload>Upload certificates</button>
        <button class="text-button" type="button" data-smart-view-property>${saved ? "View property in Properties" : "Open property card"}</button>
      </div>
    </section>
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
    "maple-court": "Fully compliant",
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
          <span>${fullyCompliantProperties().length} fully compliant</span>
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
                <p>${fullyCompliantProperties().length} property fully compliant. ${selected.length} properties need review for ${escapeHtml(azScenarioLabels[labsState.azScenario]).toLowerCase()}.${pulse?.compliance ? ` +${pulse.compliance} readiness recorded.` : ""}</p>
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
        status: property.complianceScore === 100 ? "Fully compliant" : property.state,
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
  document.querySelector("[data-evidence-health-verified]").textContent = isFivePropertyMode() ? `${fullyCompliantProperties().length} fully compliant property` : isTwoPropertyMode() ? (labsState.eicrAdded ? "6 verified records" : "5 verified records") : labsState.eicrAdded ? "3 verified records" : "2 verified records";
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
          status: "Resolved",
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
          search: "eicr complete resolved smart upload evidence 57 butts"
        }]
      : []),
    ...(labsState.inspectionStatusRecorded
      ? [{
          id: "inspection-recorded",
          title: "Inspection status recorded",
          status: "Dismissed",
          source: "Tasks · Demo action",
          body: "Marked as not completed during the walkthrough.",
          property: "57 The Butts · CV1 3BJ",
          propertyId: "the-butts",
          category: "Inspection",
          priority: "Medium",
          suggestedAction: "Return when inspection evidence is available",
          board: "resolved",
          filters: ["completed", "inspection"],
          detail: "CMP moved this task here because inspection status was recorded for this session.",
          search: "inspection complete dismissed not completed 57 butts"
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
    { id: "resolved", title: "Resolved" }
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
        ? "This gap was resolved after EICR evidence was verified."
        : "CMP could not find a current EICR in the property file. Electrical Safety became the clearest evidence priority.",
      source: "Compliance Centre",
      status: labsState.eicrAdded ? "Resolved" : "Needs checking",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      resolved: labsState.eicrAdded,
      open: !labsState.eicrAdded,
      search: `eicr electrical safety compliance gap ${labsState.eicrAdded ? "resolved historical" : "missing needs checking"} 57 butts`,
      why: labsState.eicrAdded
        ? "This is retained as history. The gap was resolved when EICR evidence was verified."
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
        body: "CMP compared five properties, separated shared answers from property-specific unknowns and found one fully compliant property.",
        source: "Compliance Centre",
        status: "Ready to review",
        statusClass: "status-watch-text",
        search: "portfolio sweep a-z checker five properties fully compliant scores",
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
        title: "24 Maple Court marked fully compliant",
        property: "24 Maple Court · B15 2QT",
        body: "All core checks and evidence are present in the five-property demo state.",
        source: "Evidence Vault",
        status: "Fully compliant",
        statusClass: "status-good-text",
        search: "24 maple court fully compliant evidence score compliance score 100",
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
        "24 Maple Court marked fully compliant",
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
    return ["5 properties compared", "1 fully compliant", "2 urgent actions", "Portfolio Sweep ready"];
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
      body: `CMP has compared five properties: ${fullyCompliantProperties().length} fully compliant, ${portfolioUrgentActionCount()} urgent actions and ${portfolioEvidenceGapCount()} evidence gaps.`
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
    askResponse.textContent = response;
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
    askResponse.textContent = getGlobalAskAssistantResponse(activePrompt);
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
    chatResponse.textContent = getGlobalAskAssistantResponse(activePrompt);
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
        ? "Portfolio brain for 5 properties"
        : isTwoPropertyMode() ? "Portfolio brain for 2 properties" : "Portfolio brain for 57 The Butts";
  }
  if (chatState) {
    chatState.textContent = isEmptyPortfolioMode() ? "Setup guidance" : isNewPropertyMode() ? "New profile" : "Context live";
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
        <span class="source-badge">${item.complianceScore === 100 ? "Fully compliant" : index === 0 ? "Workspace" : item.state}</span>
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

function recordNewPropertyEvidenceUpload(type) {
  const setup = newPropertySetup();
  const config = {
    gasSafety: {
      label: "Gas Safety",
      id: "new-gas-uploaded",
      title: "Gas Safety evidence uploaded",
      body: "A demo Gas Safety certificate was added to the 57 The Butts evidence list.",
      search: "gas safety evidence uploaded 57 butts"
    },
    eicr: {
      label: "Electrical Safety / EICR",
      id: "new-eicr-uploaded",
      title: "EICR evidence uploaded",
      body: "A demo Electrical Safety/EICR document was added to the 57 The Butts evidence list.",
      search: "eicr electrical safety evidence uploaded 57 butts"
    }
  }[type];

  if (!config || !setup.evidence?.[type]) {
    return;
  }

  setup.evidence[type].status = "uploaded";
  setup.evidence[type].source = "Demo upload";
  setup.evidence[type].uploadedAt = "Today";

  addNewPropertySetupActivity({
    id: config.id,
    filter: "evidence",
    category: "Evidence",
    title: config.title,
    body: config.body,
    source: "Evidence Vault",
    status: "Uploaded for review",
    statusClass: "status-good-text",
    search: config.search,
    why: "CMP recorded this because uploaded evidence changes the property evidence confidence.",
    nextAction: "Continue the guided check so CMP can decide which gaps remain.",
    route: "evidence",
    actions: [
      makeActivityAction("Open Evidence Vault", "viewEvidence", true),
      makeActivityAction("Ask CMP", "askReview")
    ]
  });

  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(getGlobalAskAssistantResponse("What evidence should I upload next?"));
  showToast(`${config.label} evidence added to this demo property file.`);
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
      showPortfolioHome({ scroll: true });
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

    if (event.target.closest("[data-smart-confirm]")) {
      confirmNewPropertyFindings();
      window.setTimeout(() => scrollToPanel("[data-smart-search-results]"), 80);
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
      scrollToPanel("[data-smart-upload-panel]");
      return;
    }

    if (event.target.closest("[data-smart-skip-upload]")) {
      showToast("Uploads skipped for now. CMP will keep those evidence items open.");
      return;
    }

    if (event.target.closest("[data-smart-answer-remaining]")) {
      startNewPropertyGuidedCheck();
      return;
    }

    if (event.target.closest("[data-smart-view-property]")) {
      showPortfolioProperties({ scroll: true });
      setAssistantResponse("You added your first property. Open the workspace to find out what this property needs to become compliant.");
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
      showToast("Copied the fully compliant pattern as a comparison reference.");
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
    document.querySelector("[data-activity-summary-resolved]").innerHTML = "<li>No resolved items yet</li>";
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
      <li>24 Maple Court · fully compliant evidence pack</li>
      <li>18 Willow Brook Drive · Gas Safety renewal flagged</li>
      <li>3 Station Road · onboarding evidence missing</li>
    `;
    document.querySelector("[data-activity-summary-open-list]").innerHTML = `
      <li>3 Station Road · new purchase onboarding</li>
      <li>18 Willow Brook Drive · Gas Safety renewal</li>
      <li>9 Canal View · licensing answer needed</li>
    `;
    document.querySelector("[data-activity-summary-resolved]").innerHTML = `
      <li>24 Maple Court · fully compliant</li>
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
        <li>57 The Butts · Electrical Safety gap resolved</li>
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
      <li>Electrical Safety gap resolved</li>
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
    showPortfolioHome({ scroll: true });
  });

  document.querySelectorAll("[data-demo-state-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyDemoState(button.dataset.demoStateOption);
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
      badge: labsState.eicrAdded ? "Resolved" : "Needs checking",
      badgeClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      resolved: labsState.eicrAdded,
      open: !labsState.eicrAdded,
      resolvedNote: labsState.eicrAdded ? "Resolved after EICR evidence was verified" : "",
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
          ["Status", labsState.eicrAdded ? "Resolved from uploaded document" : "No matching evidence stored"],
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
showPortfolioHome();
if (isEmptyPortfolioMode() || isNewPropertyMode()) {
  setAssistantResponse(getGlobalAskDefaultResponse());
}

window.labsDemoProperty = labsDemoProperty;
