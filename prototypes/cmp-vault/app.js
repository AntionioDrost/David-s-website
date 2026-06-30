(() => {
  const STORAGE_KEY = "cmpVaultPrototypeV1";
  const ROUTES = [
    "home",
    "start-vault",
    "address",
    "document-first",
    "vault",
    "record-detail",
    "service",
    "renewals",
    "possession-readiness",
    "properties",
  ];

  const SAMPLE_ADDRESS = ["48 Maple Terrace", "Leamington Spa", "CV32 5AA"].join(", ");
  const SAMPLE_POSTCODE = "CV32 5AA";

  const defaultInbox = [
    {
      id: "inbox-gas-2026",
      filename: "gas-safety-maple-terrace-june.pdf",
      suggestedRecord: "gas-safety",
      suggestedDate: "2026-06-12",
      suggestedExpiry: "2027-06-12",
      confidenceLabel: "High confidence",
      confirmationStatus: "Suggested match",
    },
    {
      id: "inbox-deposit",
      filename: "deposit-protection-certificate.pdf",
      suggestedRecord: "deposit-protection",
      suggestedDate: "2025-09-01",
      suggestedExpiry: "",
      confidenceLabel: "Medium confidence",
      confirmationStatus: "Suggested match",
    },
    {
      id: "inbox-inspection",
      filename: "inspection-photos-march.zip",
      suggestedRecord: "inspection-reports",
      suggestedDate: "2026-03-22",
      suggestedExpiry: "2026-09-22",
      confidenceLabel: "Needs landlord confirmation",
      confirmationStatus: "Document added for review",
    },
  ];

  const state = loadState();

  function loadState() {
    const baseState = {
      route: "home",
      activeVaultId: null,
      selectedCategoryId: "safety-certificates",
      selectedRecordId: "gas-safety",
      selectedAddress: SAMPLE_ADDRESS,
      pendingPostcode: SAMPLE_POSTCODE,
      pendingPropertyType: "Terraced house",
      pendingBedrooms: "3",
      documentInbox: structuredCloneSafe(defaultInbox),
      vaults: [],
      activeServiceRecordId: "gas-safety",
      activeRenewalId: "renewal-gas",
      askResponse: null,
      flash: "",
    };

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return baseState;
      const parsed = JSON.parse(stored);
      return { ...baseState, ...parsed };
    } catch {
      return baseState;
    }
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createRecord({
    id,
    categoryId,
    title,
    status,
    evidenceState,
    source = "Vault sample record",
    expiryDate = "",
    reviewDate = "",
    documentName = "",
    advisorReviewRecommended = false,
    serviceOption = "",
    primaryAction = "",
  }) {
    return {
      id,
      categoryId,
      title,
      status,
      evidenceState,
      source,
      expiryDate,
      reviewDate,
      documentName,
      advisorReviewRecommended,
      serviceOption,
      primaryAction: primaryAction || actionForStatus(status, serviceOption),
    };
  }

  function createCategory(id, title, description, records) {
    return { id, title, description, records };
  }

  function createExampleVault(overrides = {}) {
    const categories = [
      createCategory("property-identity", "Property identity", "Address and core details for the property passport.", [
        createRecord({
          id: "address",
          categoryId: "property-identity",
          title: "Address",
          status: "Ready to rely on",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          documentName: "Property passport entry",
        }),
        createRecord({
          id: "postcode",
          categoryId: "property-identity",
          title: "Postcode",
          status: "Ready to rely on",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          documentName: SAMPLE_POSTCODE,
        }),
        createRecord({
          id: "local-authority",
          categoryId: "property-identity",
          title: "Local authority",
          status: "Landlord says held",
          evidenceState: "Needs evidence",
          source: "Address selection",
          documentName: "Warwick District Council",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "property-type",
          categoryId: "property-identity",
          title: "Property type",
          status: "Ready to rely on",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          documentName: overrides.propertyType || "Terraced house",
        }),
        createRecord({
          id: "bedrooms",
          categoryId: "property-identity",
          title: "Bedrooms",
          status: "Ready to rely on",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          documentName: overrides.bedrooms || "3 bedrooms",
        }),
        createRecord({
          id: "tenancy-status",
          categoryId: "property-identity",
          title: "Tenancy status",
          status: "Monitor later",
          evidenceState: "Landlord says held",
          source: "Landlord confirmed",
          documentName: "Periodic tenancy noted",
          primaryAction: "View record",
        }),
        createRecord({
          id: "occupancy-status",
          categoryId: "property-identity",
          title: "Occupancy status",
          status: "Monitor later",
          evidenceState: "Landlord says held",
          source: "Landlord confirmed",
          documentName: "Occupied",
          primaryAction: "View record",
        }),
      ]),
      createCategory("safety-certificates", "Safety certificates", "Key certificates and alarm evidence for the property file.", [
        createRecord({
          id: "gas-safety",
          categoryId: "safety-certificates",
          title: "Gas Safety",
          status: "Expires soon",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          expiryDate: "2026-08-18",
          reviewDate: "2026-07-18",
          documentName: "Gas Safety Certificate 2025.pdf",
          serviceOption: "Book Gas Safety check",
          primaryAction: "Set renewal reminder",
        }),
        createRecord({
          id: "eicr",
          categoryId: "safety-certificates",
          title: "EICR",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          expiryDate: "2028-05-24",
          reviewDate: "2028-04-24",
          documentName: "Electrical Installation Condition Report.pdf",
          serviceOption: "Book EICR",
        }),
        createRecord({
          id: "smoke-alarm",
          categoryId: "safety-certificates",
          title: "Smoke alarm evidence",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Landlord says held",
          reviewDate: "2026-07-14",
          documentName: "",
          serviceOption: "Add alarm test evidence",
        }),
        createRecord({
          id: "co-alarm",
          categoryId: "safety-certificates",
          title: "CO alarm evidence",
          status: "Landlord says held",
          evidenceState: "Needs evidence",
          source: "Landlord says held",
          reviewDate: "2026-07-14",
          documentName: "",
          serviceOption: "Add alarm test evidence",
          primaryAction: "Add proof",
        }),
      ]),
      createCategory("energy-condition", "Energy and condition", "Energy records, inspections, repairs and condition evidence.", [
        createRecord({
          id: "epc",
          categoryId: "energy-condition",
          title: "EPC",
          status: "Expired",
          evidenceState: "Needs evidence",
          source: "Vault sample record",
          expiryDate: "2026-05-01",
          reviewDate: "2026-06-30",
          documentName: "EPC certificate needs refresh",
          serviceOption: "Book EPC assessment",
        }),
        createRecord({
          id: "inspection-reports",
          categoryId: "energy-condition",
          title: "Property inspection reports",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-09-22",
          documentName: "Inspection report March.pdf",
          primaryAction: "Set renewal reminder",
        }),
        createRecord({
          id: "damp-mould",
          categoryId: "energy-condition",
          title: "Damp/mould evidence",
          status: "Advisor review recommended",
          evidenceState: "Needs evidence",
          source: "Tenant communication noted",
          reviewDate: "2026-07-07",
          documentName: "Photo note pending",
          advisorReviewRecommended: true,
          serviceOption: "Book a quick evidence review",
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "repair-records",
          categoryId: "energy-condition",
          title: "Repair records",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-10-02",
          documentName: "Boiler repair receipt.pdf",
        }),
        createRecord({
          id: "contractor-invoices",
          categoryId: "energy-condition",
          title: "Contractor invoices",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Document missing",
          documentName: "",
          serviceOption: "Add contractor invoice",
        }),
      ]),
      createCategory("tenancy-file", "Tenancy file", "Core tenancy records, deposit evidence and communications.", [
        createRecord({
          id: "tenancy-agreement",
          categoryId: "tenancy-file",
          title: "Tenancy agreement",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-09-01",
          documentName: "AST September 2025.pdf",
        }),
        createRecord({
          id: "deposit-protection",
          categoryId: "tenancy-file",
          title: "Deposit protection",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Document missing",
          reviewDate: "2026-07-10",
          documentName: "",
          advisorReviewRecommended: true,
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "prescribed-information",
          categoryId: "tenancy-file",
          title: "Prescribed information",
          status: "Not added",
          evidenceState: "Needs evidence",
          source: "Document missing",
          reviewDate: "2026-07-10",
          documentName: "",
          advisorReviewRecommended: true,
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "how-to-rent",
          categoryId: "tenancy-file",
          title: "How to Rent guide where relevant",
          status: "Landlord says held",
          evidenceState: "Needs evidence",
          source: "Landlord says held",
          reviewDate: "2026-07-12",
          documentName: "",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "inventory-check-in",
          categoryId: "tenancy-file",
          title: "Inventory/check-in",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-09-01",
          documentName: "Inventory check-in report.pdf",
        }),
        createRecord({
          id: "tenant-communications",
          categoryId: "tenancy-file",
          title: "Tenant communications",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-07-30",
          documentName: "Tenant communication log.csv",
        }),
        createRecord({
          id: "right-to-rent",
          categoryId: "tenancy-file",
          title: "Right-to-rent note",
          status: "Not relevant",
          evidenceState: "Not relevant",
          source: "Landlord confirmed",
          documentName: "Not relevant for this file",
          primaryAction: "View record",
        }),
      ]),
      createCategory("licensing-special", "Licensing and special cases", "Licensing, HMO and planning notes that may need review.", [
        createRecord({
          id: "hmo-review",
          categoryId: "licensing-special",
          title: "HMO/licensing review",
          status: "Advisor review recommended",
          evidenceState: "Needs evidence",
          source: "Property detail requires review",
          reviewDate: "2026-07-05",
          documentName: "",
          advisorReviewRecommended: true,
          serviceOption: "Book a quick evidence review",
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "selective-licensing",
          categoryId: "licensing-special",
          title: "Selective/additional licensing evidence",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Local authority note",
          reviewDate: "2026-07-05",
          documentName: "",
          advisorReviewRecommended: true,
          serviceOption: "Ask a CMP advisor to review this file",
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "planning-use",
          categoryId: "licensing-special",
          title: "Planning/use notes if relevant",
          status: "Monitor later",
          evidenceState: "Landlord says held",
          source: "Landlord confirmed",
          reviewDate: "2026-12-01",
          documentName: "No special use note added",
          primaryAction: "View record",
        }),
      ]),
      createCategory("services-contractors", "Services and contractors", "Service bookings, contractor details, outcomes and follow-up reminders.", [
        createRecord({
          id: "service-bookings",
          categoryId: "services-contractors",
          title: "Service bookings",
          status: "Service booked",
          evidenceState: "Service outcome will update this record",
          source: "Landlord confirmed",
          reviewDate: "2026-07-16",
          documentName: "Gas Safety appointment note",
          serviceOption: "View service follow-up",
          primaryAction: "View record",
        }),
        createRecord({
          id: "service-outcomes",
          categoryId: "services-contractors",
          title: "Service outcomes",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Outcome pending",
          reviewDate: "2026-07-18",
          documentName: "",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "contractor-details",
          categoryId: "services-contractors",
          title: "Contractor details",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          reviewDate: "2026-11-01",
          documentName: "Preferred contractor list.pdf",
        }),
        createRecord({
          id: "certificates-produced",
          categoryId: "services-contractors",
          title: "Certificates produced by services",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Outcome pending",
          reviewDate: "2026-07-18",
          documentName: "",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "follow-up-reminders",
          categoryId: "services-contractors",
          title: "Follow-up reminders",
          status: "Monitor later",
          evidenceState: "Landlord says held",
          source: "Vault reminder",
          reviewDate: "2026-07-18",
          documentName: "Service follow-up reminder",
          primaryAction: "Set renewal reminder",
        }),
      ]),
      createCategory("possession-readiness-file", "Possession readiness file", "Evidence readiness for advisor review.", [
        createRecord({
          id: "possession-tenancy-agreement",
          categoryId: "possession-readiness-file",
          title: "Tenancy agreement",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Pulled from tenancy file",
          documentName: "AST September 2025.pdf",
        }),
        createRecord({
          id: "possession-deposit-evidence",
          categoryId: "possession-readiness-file",
          title: "Deposit evidence",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Pulled from tenancy file",
          documentName: "",
          advisorReviewRecommended: true,
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "possession-prescribed-information",
          categoryId: "possession-readiness-file",
          title: "Prescribed information",
          status: "Not added",
          evidenceState: "Needs evidence",
          source: "Pulled from tenancy file",
          documentName: "",
          advisorReviewRecommended: true,
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "possession-epc",
          categoryId: "possession-readiness-file",
          title: "EPC",
          status: "Expired",
          evidenceState: "Needs evidence",
          source: "Pulled from energy records",
          documentName: "EPC certificate needs refresh",
          serviceOption: "Book EPC assessment",
        }),
        createRecord({
          id: "possession-gas",
          categoryId: "possession-readiness-file",
          title: "Gas Safety",
          status: "Expires soon",
          evidenceState: "Evidence added",
          source: "Pulled from safety certificates",
          expiryDate: "2026-08-18",
          documentName: "Gas Safety Certificate 2025.pdf",
          primaryAction: "Set renewal reminder",
        }),
        createRecord({
          id: "possession-how-to-rent",
          categoryId: "possession-readiness-file",
          title: "How to Rent guide where relevant",
          status: "Landlord says held",
          evidenceState: "Needs evidence",
          source: "Pulled from tenancy file",
          documentName: "",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "possession-licensing",
          categoryId: "possession-readiness-file",
          title: "Licensing evidence where relevant",
          status: "Advisor review recommended",
          evidenceState: "Needs evidence",
          source: "Pulled from licensing drawer",
          advisorReviewRecommended: true,
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "arrears-record",
          categoryId: "possession-readiness-file",
          title: "Arrears record",
          status: "Needs evidence",
          evidenceState: "Needs evidence",
          source: "Document missing",
          primaryAction: "Add proof",
        }),
        createRecord({
          id: "communication-log",
          categoryId: "possession-readiness-file",
          title: "Tenant communication log",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Pulled from tenancy file",
          documentName: "Tenant communication log.csv",
        }),
        createRecord({
          id: "repair-complaint-history",
          categoryId: "possession-readiness-file",
          title: "Repair and complaint history",
          status: "Advisor review recommended",
          evidenceState: "Needs evidence",
          source: "Damp/mould note linked",
          advisorReviewRecommended: true,
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "inspection-photos",
          categoryId: "possession-readiness-file",
          title: "Inspection photos",
          status: "Evidence added",
          evidenceState: "Evidence added",
          source: "Landlord confirmed",
          documentName: "Inspection photos March.zip",
        }),
        createRecord({
          id: "notices-status",
          categoryId: "possession-readiness-file",
          title: "Notices status",
          status: "Advisor review recommended",
          evidenceState: "Needs evidence",
          source: "Advisor check recommended",
          advisorReviewRecommended: true,
          primaryAction: "Ask advisor to review",
        }),
        createRecord({
          id: "advisor-review-status",
          categoryId: "possession-readiness-file",
          title: "Advisor review status",
          status: "Advisor review recommended",
          evidenceState: "Advisor review recommended",
          source: "Vault file health",
          advisorReviewRecommended: true,
          primaryAction: "Ask advisor to review",
        }),
      ]),
    ];

    const vault = {
      id: overrides.id || "vault-maple-terrace",
      address: overrides.address || SAMPLE_ADDRESS,
      postcode: overrides.postcode || SAMPLE_POSTCODE,
      localAuthority: "Warwick District Council",
      propertyType: overrides.propertyType || "Terraced house",
      bedrooms: Number(overrides.bedrooms || 3),
      tenancyStatus: "Periodic tenancy",
      occupancyStatus: "Occupied",
      fileStrength: 0,
      recordsComplete: 0,
      recordsMissing: 0,
      recordsExpired: 0,
      nextRenewal: "2026-08-18",
      advisorReviewStatus: "Advisor review recommended",
      recordCategories: categories,
      services: [
        {
          id: "service-gas",
          linkedRecordId: "gas-safety",
          serviceType: "Gas Safety check",
          status: "Ready to draft",
          outcome: "Service outcome will update this record",
          noSupplierContacted: true,
          noPaymentTaken: true,
        },
        {
          id: "service-epc",
          linkedRecordId: "epc",
          serviceType: "EPC assessment",
          status: "Ready to draft",
          outcome: "Service outcome will update this record",
          noSupplierContacted: true,
          noPaymentTaken: true,
        },
        {
          id: "service-review",
          linkedRecordId: "damp-mould",
          serviceType: "Evidence review",
          status: "Advisor review available",
          outcome: "Advisor review recommended",
          noSupplierContacted: true,
          noPaymentTaken: true,
        },
      ],
      renewalTimeline: [
        {
          id: "renewal-gas",
          linkedRecordId: "gas-safety",
          title: "Gas Safety",
          date: "2026-08-18",
          reason: "Certificate expires soon",
          urgency: "Soon",
        },
        {
          id: "renewal-eicr",
          linkedRecordId: "eicr",
          title: "EICR",
          date: "2028-05-24",
          reason: "Electrical certificate renewal",
          urgency: "Later",
        },
        {
          id: "renewal-epc",
          linkedRecordId: "epc",
          title: "EPC",
          date: "2026-05-01",
          reason: "Certificate has expired",
          urgency: "Now",
        },
        {
          id: "renewal-licence",
          linkedRecordId: "selective-licensing",
          title: "Licence/review",
          date: "2026-07-05",
          reason: "Licensing evidence needs advisor review",
          urgency: "Now",
        },
        {
          id: "renewal-inspection",
          linkedRecordId: "inspection-reports",
          title: "Inspection follow-up",
          date: "2026-09-22",
          reason: "Keep condition evidence current",
          urgency: "Soon",
        },
        {
          id: "renewal-service",
          linkedRecordId: "service-bookings",
          title: "Service follow-up",
          date: "2026-07-18",
          reason: "Add service outcome to Vault",
          urgency: "Soon",
        },
      ],
      possessionReadiness: {
        fileStrength: 0,
        missingEvidence: [
          "Deposit evidence",
          "Prescribed information",
          "Current EPC",
          "Licensing evidence where relevant",
          "Arrears record",
          "Repair and complaint history",
        ],
        advisorRecommendation: "Advisor review recommended.",
        recordsUsed: [
          "Tenancy agreement",
          "Deposit evidence",
          "Prescribed information",
          "EPC",
          "Gas Safety",
          "How to Rent guide where relevant",
          "Licensing evidence where relevant",
          "Arrears record",
          "Tenant communication log",
          "Repair and complaint history",
          "Inspection photos",
          "Notices status",
          "Advisor review status",
        ],
      },
      documentInbox: structuredCloneSafe(defaultInbox),
    };

    updateFileStrength(vault);
    return vault;
  }

  function actionForStatus(status, serviceOption = "") {
    if (status === "Not added" || status === "Needs evidence" || status === "Landlord says held") return "Add proof";
    if (status === "Expired") return serviceOption ? "Book service" : "Scan document";
    if (status === "Expires soon") return "Set renewal reminder";
    if (status === "Service booked") return "View record";
    if (status === "Advisor review recommended") return "Ask advisor to review";
    if (status === "Monitor later") return "Set renewal reminder";
    if (status === "Not relevant") return "View record";
    return "View record";
  }

  function flattenRecords(vault) {
    if (!vault) return [];
    return vault.recordCategories.flatMap((category) => category.records);
  }

  function findVault() {
    return state.vaults.find((vault) => vault.id === state.activeVaultId) || state.vaults[0] || null;
  }

  function findCategory(vault, categoryId = state.selectedCategoryId) {
    return vault?.recordCategories.find((category) => category.id === categoryId) || vault?.recordCategories[0] || null;
  }

  function findRecord(vault, recordId = state.selectedRecordId) {
    return flattenRecords(vault).find((record) => record.id === recordId) || flattenRecords(vault)[0] || null;
  }

  function findRenewal(vault, renewalId = state.activeRenewalId) {
    return vault?.renewalTimeline.find((item) => item.id === renewalId) || vault?.renewalTimeline[0] || null;
  }

  function ensureExampleVault() {
    let vault = state.vaults.find((item) => item.id === "vault-maple-terrace");
    if (!vault) {
      vault = createExampleVault();
      state.vaults = [vault];
    }
    state.activeVaultId = vault.id;
    state.selectedCategoryId = state.selectedCategoryId || "safety-certificates";
    state.selectedRecordId = state.selectedRecordId || "gas-safety";
    syncInboxToActiveVault(vault);
    updateFileStrength(vault);
    return vault;
  }

  function createVaultFromAddress() {
    const vault = createExampleVault({
      id: "vault-created-property",
      address: state.selectedAddress,
      postcode: state.pendingPostcode,
      propertyType: state.pendingPropertyType,
      bedrooms: state.pendingBedrooms,
    });
    state.vaults = [vault];
    state.activeVaultId = vault.id;
    state.selectedCategoryId = "safety-certificates";
    state.selectedRecordId = "gas-safety";
    state.flash = "Property passport created. Add documents to strengthen this Vault.";
    syncInboxToActiveVault(vault);
    saveState();
    navigate("vault");
  }

  function updateFileStrength(vault) {
    const records = flattenRecords(vault);
    const completeStates = new Set(["Evidence added", "Ready to rely on", "Landlord says held", "Monitor later", "Not relevant"]);
    const missingStates = new Set(["Not added", "Needs evidence"]);
    const expiredStates = new Set(["Expired", "Expires soon"]);
    const complete = records.filter((record) => completeStates.has(record.status)).length;
    const missing = records.filter((record) => missingStates.has(record.status)).length;
    const expired = records.filter((record) => expiredStates.has(record.status)).length;
    const advisor = records.filter((record) => record.advisorReviewRecommended || record.status === "Advisor review recommended").length;
    const servicesReady = records.filter((record) => record.serviceOption && ["Not added", "Needs evidence", "Expired", "Advisor review recommended"].includes(record.status)).length;
    const rawStrength = Math.round((complete / Math.max(records.length, 1)) * 100) - expired * 2 - advisor;

    vault.recordsComplete = complete;
    vault.recordsMissing = missing;
    vault.recordsExpired = expired;
    vault.fileStrength = Math.max(18, Math.min(96, rawStrength));
    vault.recordsAdvisorReview = advisor;
    vault.servicesReady = servicesReady;
    vault.nextRenewal = nextRenewalDate(vault);
    vault.advisorReviewStatus = advisor > 0 ? "Advisor review recommended" : "No advisor review currently flagged";
    vault.possessionReadiness.fileStrength = Math.max(18, vault.fileStrength - 10);
    return vault;
  }

  function nextRenewalDate(vault) {
    const sorted = [...vault.renewalTimeline].sort((a, b) => a.date.localeCompare(b.date));
    const urgent = sorted.find((item) => ["Now", "Soon"].includes(item.urgency));
    return urgent ? urgent.date : sorted[0]?.date || "";
  }

  function syncInboxToActiveVault(vault) {
    if (!vault) return;
    const source = vault.documentInbox?.length ? vault.documentInbox : state.documentInbox;
    state.documentInbox = structuredCloneSafe(source);
    vault.documentInbox = structuredCloneSafe(source);
  }

  function navigate(route, options = {}) {
    if (!ROUTES.includes(route)) return;
    if (options.ensureVault) ensureExampleVault();
    state.route = route;
    window.location.hash = route;
    saveState();
    render();
  }

  function routeFromHash() {
    const route = window.location.hash.replace("#", "");
    return ROUTES.includes(route) ? route : state.route || "home";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(dateString) {
    if (!dateString) return "No date set";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateString}T12:00:00`));
  }

  function statusClass(status) {
    if (["Evidence added", "Ready to rely on", "Landlord says held", "Not relevant"].includes(status)) return "good";
    if (["Expires soon", "Monitor later", "Service booked"].includes(status)) return "warning";
    if (["Expired", "Needs evidence", "Not added"].includes(status)) return "danger";
    return "review";
  }

  function render() {
    state.route = routeFromHash();
    const app = document.querySelector("#app");
    if (!app) return;
    app.innerHTML = `${renderHeader()}${renderRoute()}`;
    attachDragHandlers();
  }

  function renderHeader() {
    return `
      <header class="site-header">
        <a class="brand" href="#home" data-route-link="home" aria-label="CMP Vault home">
          <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path d="M10 22h19l5 6h20v24a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V22Z" fill="currentColor" opacity=".18" />
            <path d="M10 22h19l5 6h20v24a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V22Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" />
            <rect x="21" y="8" width="22" height="22" rx="7" fill="#FFFDF7" stroke="currentColor" stroke-width="4" />
            <circle cx="32" cy="40" r="5" fill="currentColor" />
            <path d="M32 44v7" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" />
          </svg>
          <span>CMP Vault</span>
        </a>
        <nav class="site-nav" aria-label="Vault navigation">
          <a href="#home" data-route-link="home">Home</a>
          <a href="#document-first" data-route-link="document-first">Add documents</a>
          <a href="#properties" data-route-link="properties">My Properties</a>
        </nav>
      </header>
    `;
  }

  function renderRoute() {
    if (state.route === "start-vault") return renderStartVault();
    if (state.route === "address") return renderAddressSelection();
    if (state.route === "document-first") return renderDocumentFirst();
    if (state.route === "vault") return renderVaultScreen();
    if (state.route === "record-detail") return renderVaultScreen(true);
    if (state.route === "service") return renderServiceFlow();
    if (state.route === "renewals") return renderRenewals();
    if (state.route === "possession-readiness") return renderPossessionReadiness();
    if (state.route === "properties") return renderProperties();
    return renderHome();
  }

  function renderHome() {
    return `
      <main class="home-shell" data-route="home">
        <section class="hero-section" aria-labelledby="home-title">
          <div class="hero-copy">
            <h1 id="home-title">Build a complete property file before you need it.</h1>
            <p>Your certificates, evidence and renewal dates in one secure property vault. Store the proof, spot the gaps and keep the file ready for review.</p>
            <div class="hero-actions">
              <button class="button button-primary" type="button" data-route-link="start-vault">Start a property vault</button>
              <button class="button button-secondary" type="button" data-route-link="document-first">Upload documents first</button>
              <button class="button button-secondary" type="button" data-open-example="true">Open example vault</button>
              <button class="button button-secondary" type="button" data-possession-example="true">Check possession evidence readiness</button>
            </div>
          </div>
          <div class="passport-visual" aria-label="Secure property passport preview">
            <div class="vault-spine"></div>
            <div class="vault-cover">
              <span class="cover-label">Property passport</span>
              <strong>Secure evidence file</strong>
              <div class="seal">
                <span>File strength</span>
                <b>72%</b>
              </div>
              <ul>
                <li>Document sorting</li>
                <li>Record drawers</li>
                <li>Renewal ribbon</li>
              </ul>
            </div>
          </div>
        </section>
        <section class="how-section" aria-labelledby="how-title">
          <h2 id="how-title">How it works</h2>
          <ol>
            <li>Create the property passport.</li>
            <li>Add or scan documents.</li>
            <li>Confirm record matches.</li>
            <li>Track renewals and gaps.</li>
            <li>Ask an advisor when the file needs review.</li>
          </ol>
        </section>
      </main>
    `;
  }

  function renderStartVault() {
    return `
      <main class="screen" data-route="start-vault">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Create property passport</p>
            <h1 class="screen-title">Start with the property details.</h1>
            <p class="screen-copy">Enter a postcode first, then choose the exact address before the Vault creates the property file.</p>
          </div>
        </div>
        ${renderFlash()}
        <form class="form-panel" id="postcode-form">
          <div class="field-grid">
            <div class="field">
              <label for="postcode">Postcode</label>
              <input id="postcode" name="postcode" autocomplete="postal-code" value="${escapeHtml(state.pendingPostcode)}" />
            </div>
            <div class="field">
              <label for="propertyType">Property type</label>
              <select id="propertyType" name="propertyType">
                ${["Terraced house", "Flat", "Semi-detached house", "Detached house", "Maisonette"].map((type) => `<option ${type === state.pendingPropertyType ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="bedrooms">Bedrooms</label>
              <select id="bedrooms" name="bedrooms">
                ${["1", "2", "3", "4", "5"].map((count) => `<option ${count === String(state.pendingBedrooms) ? "selected" : ""}>${count}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="detail-actions">
            <button class="button button-primary" type="submit">Continue to address selection</button>
            <button class="button button-secondary" type="button" data-route-link="document-first">Upload documents first</button>
          </div>
        </form>
      </main>
    `;
  }

  function renderAddressSelection() {
    const addresses = [
      SAMPLE_ADDRESS,
      ["50 Maple Terrace", "Leamington Spa", "CV32 5AA"].join(", "),
      ["Flat 2", "46 Maple Terrace", "Leamington Spa", "CV32 5AA"].join(", "),
    ];

    return `
      <main class="screen" data-route="address">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Address selection</p>
            <h1 class="screen-title">Choose the property for this Vault.</h1>
            <p class="screen-copy">The prototype uses static address matches so the property passport can be reviewed without a live lookup.</p>
          </div>
        </div>
        <section class="form-panel" aria-labelledby="address-title">
          <h2 id="address-title" class="panel-title">Address matches for ${escapeHtml(state.pendingPostcode)}</h2>
          <div class="address-list">
            ${addresses.map((address, index) => `
              <label class="address-option">
                <input type="radio" name="selectedAddress" value="${escapeHtml(address)}" ${address === state.selectedAddress || index === 0 ? "checked" : ""} />
                <span>
                  <strong>${escapeHtml(address)}</strong>
                  <span>Local authority: Warwick District Council</span>
                </span>
              </label>
            `).join("")}
          </div>
          <div class="detail-actions">
            <button class="button button-primary" type="button" data-create-vault="true">Create property passport</button>
            <button class="text-link" type="button" data-route-link="start-vault">Back to postcode</button>
          </div>
        </section>
      </main>
    `;
  }

  function renderVaultScreen(forceDetail = false) {
    const vault = ensureExampleVault();
    const category = findCategory(vault);
    const selectedRecord = findRecord(vault);
    const showDetail = forceDetail || Boolean(selectedRecord);

    return `
      <main class="screen" data-route="${forceDetail ? "record-detail" : "vault"}">
        ${renderFlash()}
        ${renderPassportHeader(vault)}
        <section class="vault-layout" aria-label="Property passport">
          <nav class="category-rail" aria-label="Record categories">
            ${vault.recordCategories.map((item, index) => `
              <button class="rail-button" type="button" data-category-id="${item.id}" aria-current="${item.id === category.id ? "true" : "false"}">
                <span class="rail-icon">${String.fromCharCode(65 + index)}</span>
                <span>${escapeHtml(item.title)}</span>
              </button>
            `).join("")}
          </nav>
          <section class="file-panel" aria-labelledby="drawer-title">
            <div class="drawer-heading">
              <div>
                <h2 id="drawer-title">${escapeHtml(category.title)}</h2>
                <p>${escapeHtml(category.description)}</p>
              </div>
              <button class="button button-quiet" type="button" data-route-link="document-first">Scan property file</button>
            </div>
            <div class="record-list">
              ${category.records.map((record) => renderRecordRow(record, selectedRecord?.id === record.id)).join("")}
            </div>
            ${showDetail ? renderRecordDetail(selectedRecord, vault) : ""}
          </section>
          <aside class="side-stack" aria-label="Vault health and renewals">
            ${renderFileHealth(vault)}
            ${renderNextRenewal(vault)}
            ${renderScanCard(vault)}
          </aside>
        </section>
      </main>
    `;
  }

  function renderPassportHeader(vault) {
    return `
      <section class="passport-header" aria-label="Vault summary">
        <article class="summary-card address-card">
          <small>Property address</small>
          <strong>${escapeHtml(vault.address)}</strong>
          <p>${escapeHtml(vault.propertyType)} · ${vault.bedrooms} bedrooms · ${escapeHtml(vault.tenancyStatus)}</p>
        </article>
        <article class="summary-card">
          <small>File strength</small>
          <strong>${vault.fileStrength}%</strong>
          <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width: ${vault.fileStrength}%"></div></div>
        </article>
        <article class="summary-card">
          <small>Records complete</small>
          <strong>${vault.recordsComplete}</strong>
          <p>Evidence added or held</p>
        </article>
        <article class="summary-card">
          <small>Records missing</small>
          <strong>${vault.recordsMissing}</strong>
          <p>Need proof or review</p>
        </article>
        <article class="summary-card">
          <small>Next renewal</small>
          <strong>${formatDate(vault.nextRenewal)}</strong>
          <p>${escapeHtml(vault.advisorReviewStatus)}</p>
        </article>
      </section>
    `;
  }

  function renderRecordRow(record, selected) {
    return `
      <button class="record-row" type="button" data-record-id="${record.id}" aria-current="${selected ? "true" : "false"}">
        <span>
          <span class="record-title">
            ${escapeHtml(record.title)}
            <span class="status-pill ${statusClass(record.status)}">${escapeHtml(record.status)}</span>
          </span>
          <span class="record-meta">${escapeHtml(record.evidenceState)} · ${escapeHtml(record.documentName || "No document added")}</span>
        </span>
        <span class="record-action">${escapeHtml(record.primaryAction)}</span>
      </button>
    `;
  }

  function renderRecordDetail(record, vault) {
    if (!record) return "";
    const linkedRenewal = vault.renewalTimeline.find((item) => item.linkedRecordId === record.id);
    return `
      <article class="record-detail" aria-labelledby="record-detail-title">
        <div class="detail-head">
          <div>
            <h3 id="record-detail-title">${escapeHtml(record.title)}</h3>
            <p class="record-meta">${escapeHtml(record.evidenceState)} · Source: ${escapeHtml(record.source)}</p>
          </div>
          <span class="status-pill ${statusClass(record.status)}">${escapeHtml(record.status)}</span>
        </div>
        <ul class="detail-list">
          <li><strong>Document</strong><span>${escapeHtml(record.documentName || "No document added")}</span></li>
          <li><strong>Expiry date</strong><span>${formatDate(record.expiryDate)}</span></li>
          <li><strong>Review date</strong><span>${formatDate(record.reviewDate || linkedRenewal?.date)}</span></li>
          <li><strong>Service option</strong><span>${escapeHtml(record.serviceOption || "No service needed right now")}</span></li>
        </ul>
        <div class="detail-actions">
          <button class="button button-primary" type="button" data-primary-action="${escapeHtml(record.primaryAction)}" data-record-action-id="${record.id}">${escapeHtml(record.primaryAction)}</button>
          <button class="text-link" type="button" data-route-link="document-first">Scan document</button>
          ${record.advisorReviewRecommended ? `<button class="text-link" type="button" data-advisor-review="${record.id}">Need help checking this record?</button>` : ""}
        </div>
        ${renderAskCmp(record)}
      </article>
    `;
  }

  function renderAskCmp(record) {
    const prompts = [
      "What proof should I upload?",
      "When does this need renewing?",
      "Can this record support possession preparation?",
      "Should I speak to an advisor?",
      "What service would complete this record?",
    ];
    return `
      <div class="ask-box" aria-label="Ask CMP about this record">
        <h4>Ask CMP about this record</h4>
        <div class="prompt-grid">
          ${prompts.map((prompt) => `<button class="prompt-button" type="button" data-ask-prompt="${escapeHtml(prompt)}" data-ask-record="${record.id}">${escapeHtml(prompt)}</button>`).join("")}
        </div>
        ${state.askResponse?.recordId === record.id ? `<div class="ask-response"><strong>${escapeHtml(state.askResponse.prompt)}</strong><br />${escapeHtml(state.askResponse.answer)}</div>` : ""}
      </div>
    `;
  }

  function renderFileHealth(vault) {
    return `
      <section class="health-panel" aria-labelledby="file-health-title">
        <h2 id="file-health-title" class="panel-title">File health</h2>
        <div class="health-grid">
          <div class="health-stat"><b>${vault.recordsComplete}</b><span>Complete records</span></div>
          <div class="health-stat"><b>${vault.recordsMissing}</b><span>Missing records</span></div>
          <div class="health-stat"><b>${vault.recordsExpired}</b><span>Expired or renewal-soon</span></div>
          <div class="health-stat"><b>${vault.recordsAdvisorReview}</b><span>Advisor review recommended</span></div>
          <div class="health-stat"><b>${vault.servicesReady}</b><span>Services ready to book</span></div>
          <div class="health-stat"><b>${vault.fileStrength}%</b><span>File strength seal</span></div>
        </div>
      </section>
    `;
  }

  function renderNextRenewal(vault) {
    const items = ["Gas Safety", "EICR", "EPC", "Licence/review", "Inspection follow-up", "Service follow-up"]
      .map((title) => vault.renewalTimeline.find((item) => item.title === title))
      .filter(Boolean);
    return `
      <section class="renewal-panel" aria-labelledby="renewal-title">
        <h2 id="renewal-title" class="panel-title">
          <span>Next renewal</span>
          <button class="text-link" type="button" data-route-link="renewals">View all</button>
        </h2>
        <ul class="renewal-list">
          ${items.map((item) => `
            <li class="renewal-item">
              <strong>${escapeHtml(item.title)} · ${formatDate(item.date)}</strong>
              <span>${escapeHtml(item.reason)}</span>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }

  function renderScanCard(vault) {
    const pending = state.documentInbox.filter((item) => item.confirmationStatus !== "Landlord confirmed").length;
    return `
      <section class="scan-card" aria-labelledby="scan-title">
        <h2 id="scan-title" class="panel-title">Document inbox</h2>
        <p>Add documents, scan the property file, sort documents, confirm matches and update records.</p>
        <div class="scan-drop">Document scan flow · ${pending} suggested match${pending === 1 ? "" : "es"} waiting</div>
        <button class="button button-primary" type="button" data-route-link="document-first">Add documents</button>
      </section>
    `;
  }

  function renderDocumentFirst() {
    const vault = findVault();
    return `
      <main class="screen" data-route="document-first">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Upload documents first</p>
            <h1 class="screen-title">Scan property file and confirm matches.</h1>
            <p class="screen-copy">CMP suggests document types and likely dates, then waits for landlord confirmation before updating the property file.</p>
          </div>
          <button class="button button-secondary" type="button" data-open-example="true">Open example vault</button>
        </div>
        ${renderFlash()}
        <section class="scan-card">
          <h2 class="panel-title">Add documents</h2>
          <div class="scan-drop" id="drop-zone">Drag documents here or choose files. Suggested match results are simulated for this prototype.</div>
          <div class="detail-actions">
            <button class="button button-primary" type="button" data-add-simulated-docs="true">Scan property file</button>
            <button class="button button-secondary" type="button" data-confirm-all-docs="true">Confirm matches</button>
            ${vault ? `<button class="text-link" type="button" data-route-link="vault">Open updated Vault</button>` : ""}
          </div>
        </section>
        <section class="inbox-grid" aria-label="Document suggestions">
          ${state.documentInbox.map((item) => renderInboxItem(item)).join("")}
        </section>
      </main>
    `;
  }

  function renderInboxItem(item) {
    const record = findRecord(findVault(), item.suggestedRecord);
    return `
      <article class="inbox-item">
        <h3>${escapeHtml(item.filename)}</h3>
        <ul class="inbox-meta">
          <li><small>Suggested match</small><span>${escapeHtml(record?.title || item.suggestedRecord)}</span></li>
          <li><small>Date found in uploaded document</small><span>${formatDate(item.suggestedDate)}</span></li>
          <li><small>Suggested expiry</small><span>${formatDate(item.suggestedExpiry)}</span></li>
          <li><small>Confidence</small><span>${escapeHtml(item.confidenceLabel)}</span></li>
          <li><small>Status</small><span>${escapeHtml(item.confirmationStatus)}</span></li>
        </ul>
        <p>Confirm before updating the property file. Advisor review available when a document is unclear.</p>
        <button class="button ${item.confirmationStatus === "Landlord confirmed" ? "button-quiet" : "button-primary"}" type="button" data-confirm-inbox="${item.id}">
          ${item.confirmationStatus === "Landlord confirmed" ? "Landlord confirmed" : "Confirm match"}
        </button>
      </article>
    `;
  }

  function renderServiceFlow() {
    const vault = ensureExampleVault();
    const record = findRecord(vault, state.activeServiceRecordId) || findRecord(vault);
    const service = vault.services.find((item) => item.linkedRecordId === record.id) || {
      id: `service-${record.id}`,
      linkedRecordId: record.id,
      serviceType: record.serviceOption || "Evidence service",
      status: "Ready to draft",
      outcome: "Service outcome will update this record",
      noSupplierContacted: true,
      noPaymentTaken: true,
    };

    return `
      <main class="screen" data-route="service">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Complete this record</p>
            <h1 class="screen-title">${escapeHtml(record.title)}</h1>
            <p class="screen-copy">Book a service to produce this evidence. The service outcome will update this record when the landlord adds it to the Vault.</p>
          </div>
          <button class="button button-secondary" type="button" data-route-link="record-detail">Back to record</button>
        </div>
        ${renderFlash()}
        <section class="service-grid">
          <article class="service-card">
            <h3>${escapeHtml(service.serviceType)}</h3>
            <p>${escapeHtml(service.outcome)}</p>
            <div class="service-steps">
              <div class="service-step"><strong>1. Check the weak record</strong><br /><span>${escapeHtml(record.status)} · ${escapeHtml(record.evidenceState)}</span></div>
              <div class="service-step"><strong>2. Draft the service request</strong><br /><span>Keep it tied to ${escapeHtml(record.title)}.</span></div>
              <div class="service-step"><strong>3. Add the outcome</strong><br /><span>The certificate or note becomes evidence for this record.</span></div>
            </div>
            <ul class="disclaimer-list">
              <li>No supplier contacted yet</li>
              <li>No payment taken</li>
            </ul>
            <button class="button button-primary" type="button" data-book-service="${record.id}">Book a service to produce this evidence</button>
          </article>
          <article class="service-card">
            <h3>Add existing certificate</h3>
            <p>If the landlord already has the proof, add it through the document inbox instead of drafting a service request.</p>
            <button class="button button-secondary" type="button" data-route-link="document-first">Add proof</button>
          </article>
          <article class="service-card">
            <h3>Speak to an advisor</h3>
            <p>Use this when the record is unclear, sensitive, expired or connected to possession preparation.</p>
            <button class="button button-secondary" type="button" data-advisor-review="${record.id}">Ask a CMP advisor to review this file</button>
          </article>
        </section>
      </main>
    `;
  }

  function renderRenewals() {
    const vault = ensureExampleVault();
    const active = findRenewal(vault);
    return `
      <main class="screen" data-route="renewals">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Certificate timeline</p>
            <h1 class="screen-title">Renewal ribbon for the property file.</h1>
            <p class="screen-copy">Track certificate dates, inspection follow-ups, service follow-ups and records that need review.</p>
          </div>
          <button class="button button-secondary" type="button" data-route-link="vault">Back to Vault</button>
        </div>
        ${renderFlash()}
        <section class="service-grid">
          <article class="service-card">
            <h3>${escapeHtml(active.title)}</h3>
            <p>${escapeHtml(active.reason)}</p>
            <ul class="detail-list">
              <li><strong>Date</strong><span>${formatDate(active.date)}</span></li>
              <li><strong>Urgency</strong><span>${escapeHtml(active.urgency)}</span></li>
              <li><strong>Linked record</strong><span>${escapeHtml(findRecord(vault, active.linkedRecordId)?.title || active.linkedRecordId)}</span></li>
            </ul>
            <button class="button button-primary" type="button" data-set-reminder="${active.id}">Set renewal reminder</button>
          </article>
          <article class="service-card">
            <h3>Next renewal panel</h3>
            <ul class="renewal-list">
              ${vault.renewalTimeline.map((item) => `
                <li class="renewal-item">
                  <button class="text-link" type="button" data-renewal-id="${item.id}">${escapeHtml(item.title)} · ${formatDate(item.date)}</button>
                  <span>${escapeHtml(item.reason)}</span>
                </li>
              `).join("")}
            </ul>
          </article>
        </section>
      </main>
    `;
  }

  function renderPossessionReadiness() {
    const vault = ensureExampleVault();
    const possession = vault.possessionReadiness;
    const possessionCategory = vault.recordCategories.find((category) => category.id === "possession-readiness-file");
    const present = possessionCategory.records.filter((record) => ["Evidence added", "Ready to rely on", "Landlord says held"].includes(record.status));
    const missing = possessionCategory.records.filter((record) => ["Needs evidence", "Not added", "Expired", "Advisor review recommended"].includes(record.status));

    return `
      <main class="screen" data-route="possession-readiness">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">Possession readiness file</p>
            <h1 class="screen-title">Evidence readiness for advisor review.</h1>
            <p class="screen-copy">Prepare before speaking to an advisor. Check whether key evidence is already in the property file.</p>
          </div>
          <button class="button button-secondary" type="button" data-route-link="vault">Open property Vault</button>
        </div>
        ${renderFlash()}
        <section class="readiness-grid" aria-label="Possession readiness">
          <article class="readiness-card featured">
            <h3>Advisor review recommended</h3>
            <p>${escapeHtml(possession.advisorRecommendation)} This file strength is ${possession.fileStrength}% because several evidence records need proof or review.</p>
            <ul class="readiness-list">
              <li><strong>Records used</strong><span>${possession.recordsUsed.length} evidence categories checked</span></li>
              <li><strong>Missing evidence</strong><span>${possession.missingEvidence.length} items need attention</span></li>
              <li><strong>Next step</strong><span>Prepare evidence pack</span></li>
            </ul>
            <div class="detail-actions">
              <button class="button button-primary" type="button" data-prepare-pack="true">Prepare evidence pack</button>
              <button class="button button-secondary" type="button" data-route-link="document-first">Add evidence</button>
            </div>
          </article>
          <article class="readiness-card">
            <h3>Present in the file</h3>
            <ul class="readiness-list">
              ${present.map((record) => `<li><strong>${escapeHtml(record.title)}</strong><span>${escapeHtml(record.status)}</span></li>`).join("")}
            </ul>
          </article>
          <article class="readiness-card">
            <h3>Missing or needs review</h3>
            <ul class="readiness-list">
              ${missing.map((record) => `<li><strong>${escapeHtml(record.title)}</strong><span>${escapeHtml(record.status)}</span></li>`).join("")}
            </ul>
          </article>
        </section>
      </main>
    `;
  }

  function renderProperties() {
    if (!state.vaults.length) {
      return `
        <main class="screen" data-route="properties">
          <div class="screen-header">
            <div>
              <p class="screen-kicker">My Properties</p>
              <h1 class="screen-title">No property Vault has been started yet.</h1>
              <p class="screen-copy">Create the first property passport or open the example Vault for review.</p>
            </div>
          </div>
          <section class="empty-state">
            <button class="button button-primary" type="button" data-route-link="start-vault">Start a property vault</button>
            <button class="button button-secondary" type="button" data-open-example="true">Open example vault</button>
          </section>
        </main>
      `;
    }

    const vault = state.vaults[0];
    updateFileStrength(vault);
    return `
      <main class="screen" data-route="properties">
        <div class="screen-header">
          <div>
            <p class="screen-kicker">My Properties</p>
            <h1 class="screen-title">One property file, shown once.</h1>
            <p class="screen-copy">Portfolio comparison can come later. This first Vault build keeps one property card with record health and the next renewal.</p>
          </div>
        </div>
        ${renderFlash()}
        <section class="properties-grid" aria-label="Property cards">
          <article class="property-card">
            <h3>${escapeHtml(vault.address)}</h3>
            <p>${escapeHtml(vault.localAuthority)} · ${escapeHtml(vault.occupancyStatus)}</p>
            <div class="property-stats">
              <div><b>${vault.fileStrength}%</b><span>File strength</span></div>
              <div><b>${vault.recordsMissing}</b><span>Records missing</span></div>
              <div><b>${formatDate(vault.nextRenewal)}</b><span>Next renewal</span></div>
            </div>
            <p>${escapeHtml(vault.advisorReviewStatus)}</p>
            <button class="button button-primary" type="button" data-open-vault="${vault.id}">Open vault</button>
          </article>
        </section>
      </main>
    `;
  }

  function renderFlash() {
    if (!state.flash) return "";
    return `<div class="ask-response" role="status">${escapeHtml(state.flash)}</div>`;
  }

  function confirmInboxItem(itemId, quiet = false) {
    const vault = ensureExampleVault();
    const inboxItem = state.documentInbox.find((item) => item.id === itemId);
    if (!inboxItem) return;
    const record = findRecord(vault, inboxItem.suggestedRecord);
    if (!record) return;

    record.status = "Evidence added";
    record.evidenceState = "Document added for review";
    record.source = "Landlord confirmed";
    record.documentName = inboxItem.filename;
    record.reviewDate = inboxItem.suggestedDate;
    if (inboxItem.suggestedExpiry) record.expiryDate = inboxItem.suggestedExpiry;
    record.primaryAction = "View record";
    inboxItem.confirmationStatus = "Landlord confirmed";

    const linkedRenewal = vault.renewalTimeline.find((item) => item.linkedRecordId === record.id);
    if (inboxItem.suggestedExpiry && linkedRenewal) {
      linkedRenewal.date = inboxItem.suggestedExpiry;
      linkedRenewal.reason = "Date found in uploaded document";
      linkedRenewal.urgency = "Later";
    } else if (inboxItem.suggestedExpiry) {
      vault.renewalTimeline.push({
        id: `renewal-${record.id}`,
        linkedRecordId: record.id,
        title: record.title,
        date: inboxItem.suggestedExpiry,
        reason: "Date found in uploaded document",
        urgency: "Later",
      });
    }

    vault.documentInbox = structuredCloneSafe(state.documentInbox);
    updateFileStrength(vault);
    if (!quiet) {
      state.selectedCategoryId = record.categoryId;
      state.selectedRecordId = record.id;
      state.flash = `Document added for review. ${record.title} now has landlord-confirmed evidence. File strength is ${vault.fileStrength}%.`;
    }
    saveState();
  }

  function confirmAllDocuments() {
    for (const item of state.documentInbox) {
      if (item.confirmationStatus !== "Landlord confirmed") confirmInboxItem(item.id, true);
    }
    const vault = ensureExampleVault();
    updateFileStrength(vault);
    state.flash = `Matches confirmed. File strength is now ${vault.fileStrength}%.`;
    saveState();
    render();
  }

  function bookService(recordId) {
    const vault = ensureExampleVault();
    const record = findRecord(vault, recordId);
    if (!record) return;
    let service = vault.services.find((item) => item.linkedRecordId === record.id);
    if (!service) {
      service = {
        id: `service-${record.id}`,
        linkedRecordId: record.id,
        serviceType: record.serviceOption || "Evidence service",
        status: "Drafted in Vault",
        outcome: "Service outcome will update this record",
        noSupplierContacted: true,
        noPaymentTaken: true,
      };
      vault.services.push(service);
    }
    service.status = "Drafted in Vault";
    service.outcome = "Service outcome will update this record";
    service.noSupplierContacted = true;
    service.noPaymentTaken = true;
    record.status = "Service booked";
    record.evidenceState = "Service outcome will update this record";
    record.source = "Service draft held in Vault";
    record.primaryAction = "View record";
    const followUpId = `renewal-service-${record.id}`;
    if (!vault.renewalTimeline.some((item) => item.id === followUpId)) {
      vault.renewalTimeline.push({
        id: followUpId,
        linkedRecordId: record.id,
        title: `${record.title} service follow-up`,
        date: "2026-07-21",
        reason: "Add service outcome to the property file",
        urgency: "Soon",
      });
    }
    updateFileStrength(vault);
    state.selectedCategoryId = record.categoryId;
    state.selectedRecordId = record.id;
    state.flash = `${record.title} changed to Service booked. A follow-up reminder has been added.`;
    saveState();
    navigate("record-detail");
  }

  function setReminder(renewalId) {
    const vault = ensureExampleVault();
    const renewal = findRenewal(vault, renewalId);
    if (!renewal) return;
    renewal.reason = `${renewal.reason} · reminder set`;
    renewal.urgency = renewal.urgency === "Later" ? "Soon" : renewal.urgency;
    state.activeRenewalId = renewal.id;
    state.flash = `Renewal reminder set for ${renewal.title}.`;
    saveState();
    render();
  }

  function primaryRecordAction(recordId, action) {
    const vault = ensureExampleVault();
    const record = findRecord(vault, recordId);
    if (!record) return;
    state.selectedRecordId = record.id;
    state.selectedCategoryId = record.categoryId;

    if (action === "Add proof" || action === "Scan document") {
      navigate("document-first");
      return;
    }
    if (action === "Book service") {
      state.activeServiceRecordId = record.id;
      navigate("service");
      return;
    }
    if (action === "Set renewal reminder") {
      const renewal = vault.renewalTimeline.find((item) => item.linkedRecordId === record.id);
      if (renewal) state.activeRenewalId = renewal.id;
      navigate("renewals");
      return;
    }
    if (action === "Ask advisor to review") {
      record.advisorReviewRecommended = true;
      record.status = "Advisor review recommended";
      record.primaryAction = "Ask advisor to review";
      state.flash = "Advisor review recommended for this record.";
      updateFileStrength(vault);
      saveState();
      render();
      return;
    }
    if (action === "Mark not relevant") {
      record.status = "Not relevant";
      record.evidenceState = "Not relevant";
      record.primaryAction = "View record";
      updateFileStrength(vault);
      state.flash = `${record.title} marked not relevant for this property file.`;
      saveState();
      render();
    }
  }

  function askCmp(recordId, prompt) {
    const vault = ensureExampleVault();
    const record = findRecord(vault, recordId);
    if (!record) return;
    const answers = {
      "What proof should I upload?": `Upload the certificate, dated evidence, service outcome or landlord note that directly supports ${record.title}. Confirm the match before the Vault updates the property file.`,
      "When does this need renewing?": record.expiryDate
        ? `${record.title} has a date of ${formatDate(record.expiryDate)}. Set a renewal reminder if this record needs monitoring.`
        : `${record.title} has no expiry date in the Vault yet. Add the document or set a review date if the record should be checked later.`,
      "Can this record support possession preparation?": `${record.title} can support possession preparation only as part of the wider evidence file. Prepare before speaking to an advisor and keep the record linked to the property file.`,
      "Should I speak to an advisor?": record.advisorReviewRecommended || ["Expired", "Needs evidence", "Not added"].includes(record.status)
        ? "Advisor review recommended because the record is missing, expired, unclear or sensitive."
        : "Advisor review is optional for this record right now. Keep the evidence current and monitor renewal dates.",
      "What service would complete this record?": record.serviceOption
        ? `${record.serviceOption} would help complete this record. The service outcome should be added back into the Vault.`
        : `This record looks document-led. Add proof or set a renewal reminder rather than booking a service.`,
    };
    state.askResponse = {
      recordId: record.id,
      prompt,
      answer: answers[prompt] || "This Vault response is record-specific and uses the current record status.",
    };
    saveState();
    render();
  }

  function requestAdvisorReview(recordId) {
    const vault = ensureExampleVault();
    const record = findRecord(vault, recordId);
    if (!record) return;
    record.advisorReviewRecommended = true;
    record.status = "Advisor review recommended";
    record.evidenceState = "Advisor review recommended";
    record.primaryAction = "Ask advisor to review";
    updateFileStrength(vault);
    state.flash = "Ask a CMP advisor to review this file. Advisor review recommended.";
    saveState();
    render();
  }

  function prepareEvidencePack() {
    const vault = ensureExampleVault();
    vault.advisorReviewStatus = "Advisor review recommended";
    vault.possessionReadiness.advisorRecommendation = "Advisor review recommended.";
    state.flash = "Evidence pack prepared for advisor review. Add missing proof before relying on the file.";
    saveState();
    render();
  }

  function attachDragHandlers() {
    const dropZone = document.querySelector("#drop-zone");
    if (!dropZone) return;
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.textContent = "Release to add documents for sorting.";
      });
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.textContent = "Drag documents here or choose files. Suggested match results are simulated for this prototype.";
    });
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      state.flash = "Documents added for review. Confirm matches before updating the property file.";
      saveState();
      render();
    });
  }

  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route-link]");
    if (routeLink) {
      event.preventDefault();
      const route = routeLink.getAttribute("data-route-link");
      if (["vault", "record-detail", "renewals", "possession-readiness"].includes(route)) ensureExampleVault();
      navigate(route);
      return;
    }

    if (event.target.closest("[data-open-example]")) {
      event.preventDefault();
      ensureExampleVault();
      state.flash = "Example property Vault opened.";
      navigate("vault");
      return;
    }

    if (event.target.closest("[data-possession-example]")) {
      event.preventDefault();
      ensureExampleVault();
      navigate("possession-readiness");
      return;
    }

    const categoryButton = event.target.closest("[data-category-id]");
    if (categoryButton) {
      event.preventDefault();
      const vault = ensureExampleVault();
      state.selectedCategoryId = categoryButton.getAttribute("data-category-id");
      const category = findCategory(vault, state.selectedCategoryId);
      state.selectedRecordId = category?.records[0]?.id || state.selectedRecordId;
      navigate("vault");
      return;
    }

    const recordButton = event.target.closest("[data-record-id]");
    if (recordButton) {
      event.preventDefault();
      const vault = ensureExampleVault();
      const record = findRecord(vault, recordButton.getAttribute("data-record-id"));
      if (record) {
        state.selectedRecordId = record.id;
        state.selectedCategoryId = record.categoryId;
        navigate("record-detail");
      }
      return;
    }

    const createButton = event.target.closest("[data-create-vault]");
    if (createButton) {
      event.preventDefault();
      const selected = document.querySelector("input[name='selectedAddress']:checked");
      state.selectedAddress = selected?.value || SAMPLE_ADDRESS;
      createVaultFromAddress();
      return;
    }

    const addDocs = event.target.closest("[data-add-simulated-docs]");
    if (addDocs) {
      event.preventDefault();
      state.flash = "Suggested match results are ready. Confirm before updating the property file.";
      saveState();
      render();
      return;
    }

    const confirmAll = event.target.closest("[data-confirm-all-docs]");
    if (confirmAll) {
      event.preventDefault();
      confirmAllDocuments();
      return;
    }

    const confirmButton = event.target.closest("[data-confirm-inbox]");
    if (confirmButton) {
      event.preventDefault();
      confirmInboxItem(confirmButton.getAttribute("data-confirm-inbox"));
      render();
      return;
    }

    const primaryButton = event.target.closest("[data-primary-action]");
    if (primaryButton) {
      event.preventDefault();
      primaryRecordAction(primaryButton.getAttribute("data-record-action-id"), primaryButton.getAttribute("data-primary-action"));
      return;
    }

    const serviceButton = event.target.closest("[data-book-service]");
    if (serviceButton) {
      event.preventDefault();
      bookService(serviceButton.getAttribute("data-book-service"));
      return;
    }

    const advisorButton = event.target.closest("[data-advisor-review]");
    if (advisorButton) {
      event.preventDefault();
      requestAdvisorReview(advisorButton.getAttribute("data-advisor-review"));
      return;
    }

    const askButton = event.target.closest("[data-ask-prompt]");
    if (askButton) {
      event.preventDefault();
      askCmp(askButton.getAttribute("data-ask-record"), askButton.getAttribute("data-ask-prompt"));
      return;
    }

    const renewalButton = event.target.closest("[data-renewal-id]");
    if (renewalButton) {
      event.preventDefault();
      state.activeRenewalId = renewalButton.getAttribute("data-renewal-id");
      saveState();
      render();
      return;
    }

    const reminderButton = event.target.closest("[data-set-reminder]");
    if (reminderButton) {
      event.preventDefault();
      setReminder(reminderButton.getAttribute("data-set-reminder"));
      return;
    }

    const openVault = event.target.closest("[data-open-vault]");
    if (openVault) {
      event.preventDefault();
      state.activeVaultId = openVault.getAttribute("data-open-vault");
      navigate("vault");
      return;
    }

    const preparePack = event.target.closest("[data-prepare-pack]");
    if (preparePack) {
      event.preventDefault();
      prepareEvidencePack();
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "postcode-form") return;
    event.preventDefault();
    const formData = new FormData(event.target);
    state.pendingPostcode = String(formData.get("postcode") || SAMPLE_POSTCODE).trim().toUpperCase();
    state.pendingPropertyType = String(formData.get("propertyType") || "Terraced house");
    state.pendingBedrooms = String(formData.get("bedrooms") || "3");
    state.flash = "";
    saveState();
    navigate("address");
  });

  window.addEventListener("hashchange", () => {
    state.route = routeFromHash();
    render();
  });

  render();
})();
