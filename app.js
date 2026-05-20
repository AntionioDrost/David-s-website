const DAY = 24 * 60 * 60 * 1000;

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  activePropertyId: "",
  activeJourney: "compliance",
  activeStep: 0,
  activeDashboardPanel: "check",
  scans: [],
  azChecklist: {},
  aiSettings: {
    provider: "openai",
    endpoint: "https://api.openai.com/v1",
    keyHint: "",
    keyPresent: false
  },
  saveStatus: "Not saved yet",
  saveTone: "idle"
};

const WORKSPACE_TABLE = "cmp_property_compliance_workspaces";
const AI_PREF_TABLE = "cmp_ai_preferences";
const LOCAL_WORKSPACE_STORAGE = "cmp_compliance_workspaces";
const LOCAL_AI_PREF_STORAGE = "cmp_ai_preferences";
const AI_KEY_STORAGE = "cmp_document_ai_key";
let workspaceSaveTimer = null;

const journeys = [
  {
    id: "compliance",
    icon: "clipboard-check",
    title: "Check compliance",
    detail: "Score the property and build an action plan."
  },
  {
    id: "epc",
    icon: "leaf",
    title: "I need an EPC",
    detail: "Pull register data or book a new assessment."
  },
  {
    id: "gas",
    icon: "flame",
    title: "Renew gas safety",
    detail: "Check expiry, evidence, and service status."
  },
  {
    id: "possession",
    icon: "scale",
    title: "Possession readiness",
    detail: "Review evidence before notices or claims."
  },
  {
    id: "portfolio",
    icon: "layout-dashboard",
    title: "Portfolio renewals",
    detail: "See what needs attention across properties."
  }
];

const wizardSteps = [
  { id: "property", title: "Property", icon: "home" },
  { id: "gas", title: "Gas Safety", icon: "flame" },
  { id: "electrical", title: "Electrical", icon: "zap" },
  { id: "alarms", title: "Alarms", icon: "bell-ring" },
  { id: "tenancy", title: "Tenancy", icon: "file-text" },
  { id: "licensing", title: "Licensing", icon: "badge-check" },
  { id: "summary", title: "Summary", icon: "sparkles" }
];

const evidenceTypes = [
  { key: "epc", title: "EPC certificate", icon: "leaf" },
  { key: "gas", title: "Gas Safety Certificate", icon: "flame" },
  { key: "eicr", title: "EICR", icon: "zap" },
  { key: "alarm", title: "Smoke and CO alarm proof", icon: "bell-ring" },
  { key: "deposit", title: "Deposit protection evidence", icon: "wallet-cards" },
  { key: "tenancy", title: "Tenancy documents", icon: "file-text" },
  { key: "licence", title: "Licensing documents", icon: "badge-check" },
  { key: "inspection", title: "Inspection reports", icon: "clipboard-list" },
  { key: "notice", title: "Rent or possession notices", icon: "scale" }
];

const azAnswerOptions = [
  { value: "yes", label: "Yes", icon: "check" },
  { value: "no", label: "No", icon: "x" },
  { value: "unknown", label: "Not sure", icon: "circle-help" },
  { value: "na", label: "N/A", icon: "minus" }
];

const azSections = [
  {
    id: "property",
    title: "Property setup",
    icon: "home",
    checks: [
      { id: "profile_confirmed", label: "Address, property type, bedrooms and storeys are confirmed.", help: "The base record decides which checks apply." },
      { id: "tenancy_status_confirmed", label: "Current tenancy status is recorded.", help: "This affects served-document and possession readiness checks." },
      { id: "appliances_confirmed", label: "Gas and fixed-combustion appliances are confirmed.", help: "Used for gas safety and CO alarm requirements." },
      { id: "licensing_triggers_checked", label: "HMO, selective, and additional licensing triggers are checked.", help: "Flags local authority risk early." }
    ]
  },
  {
    id: "epc",
    title: "EPC",
    icon: "leaf",
    checks: [
      { id: "epc_certificate_current", label: "A current EPC is recorded or uploaded.", help: "CMP stores rating, issue date, expiry, and certificate number." },
      { id: "epc_rating_acceptable", label: "The rating is E or above, or an exemption is evidenced.", help: "Poor ratings become priority actions." },
      { id: "epc_served_to_tenant", label: "EPC service to the tenant is evidenced.", help: "Important for tenancy and possession workflows." },
      { id: "epc_recommendations_reviewed", label: "Improvement recommendations have been reviewed.", help: "Useful for planning upgrades before expiry." }
    ]
  },
  {
    id: "gas",
    title: "Gas safety",
    icon: "flame",
    checks: [
      { id: "gas_requirement_known", label: "CMP knows whether gas appliances are present.", help: "N/A is fine where no gas applies." },
      { id: "gas_certificate_uploaded", label: "A valid Gas Safety Certificate is stored.", help: "Annual renewal and expiry dates are tracked." },
      { id: "gas_engineer_details_recorded", label: "Engineer or registration details are recorded.", help: "AI extraction should capture this from the certificate." },
      { id: "gas_served_to_tenant", label: "Certificate service to the tenant is evidenced.", help: "This matters before certain tenancy actions." }
    ]
  },
  {
    id: "electrical",
    title: "Electrical safety",
    icon: "zap",
    checks: [
      { id: "eicr_uploaded", label: "A current EICR is stored.", help: "CMP tracks the five-year cycle." },
      { id: "eicr_satisfactory", label: "The EICR result is satisfactory or remedials are evidenced.", help: "Unsatisfactory reports should create follow-up actions." },
      { id: "eicr_served_to_tenant", label: "EICR service to the tenant is evidenced.", help: "Keep proof alongside the report." },
      { id: "remedial_documents_stored", label: "Any remedial works evidence is stored.", help: "Needed if the original report raised issues." }
    ]
  },
  {
    id: "alarms",
    title: "Alarms",
    icon: "bell-ring",
    checks: [
      { id: "smoke_each_storey", label: "Smoke alarms are confirmed on each relevant storey.", help: "Photos or inspection notes can support this." },
      { id: "co_alarm_confirmed", label: "CO alarms are confirmed where required.", help: "Appliance facts decide whether this is required." },
      { id: "alarm_start_tested", label: "Alarms were tested at the start of the tenancy.", help: "CMP stores the evidence, not just the answer." },
      { id: "alarm_evidence_uploaded", label: "Alarm photos, report, or inspection proof is uploaded.", help: "Completes the evidence trail." }
    ]
  },
  {
    id: "tenancy",
    title: "Tenancy and deposit",
    icon: "file-text",
    checks: [
      { id: "tenancy_agreement_stored", label: "Written tenancy agreement is stored.", help: "Forms part of the evidence pack." },
      { id: "how_to_rent_served", label: "How to Rent guide service is evidenced.", help: "Important for possession readiness." },
      { id: "right_to_rent_recorded", label: "Right to Rent check is recorded.", help: "Keeps tenancy onboarding complete." },
      { id: "deposit_protected", label: "Deposit protection and prescribed information are evidenced.", help: "CMP should flag this as high risk when missing." }
    ]
  },
  {
    id: "operations",
    title: "Licensing, inspections, rent, possession",
    icon: "shield-check",
    checks: [
      { id: "licence_evidence_stored", label: "Licence evidence or council check result is stored.", help: "Includes HMO, selective, and additional licensing." },
      { id: "inspection_report_current", label: "A recent inspection or condition report is stored.", help: "Useful for disputes and renewals." },
      { id: "rent_notice_evidence_ready", label: "Rent increase notices are stored where relevant.", help: "Keeps the rent history auditable." },
      { id: "possession_pack_ready", label: "Possession evidence has been checked before notice steps.", help: "CMP should guide and flag, not make legal decisions." }
    ]
  }
];

const properties = [
  {
    id: "station-road",
    shortName: "Station Road",
    address: "66 Station Road, Marston Green, Birmingham B37 7BA",
    postcode: "B37 7BA",
    type: "Single let house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      issue: "2024-04-18",
      certificate: "0420-2843-9201-3184-1022",
      floorArea: "89 sq m",
      potential: "B",
      recommendation: "Loft insulation and heating controls"
    },
    gas: { issue: "2025-07-06", engineer: "Gas Safe engineer recorded" },
    eicr: { issue: "2021-05-20", result: "Satisfactory" },
    alarms: { smokeEachStorey: true, coAlarm: false, testedAtStart: true },
    deposit: { taken: true, protected: true, prescribedInfo: false },
    tenancy: {
      currentlyTenanted: true,
      agreement: true,
      howToRent: true,
      epcServed: true,
      gasServed: false,
      eicrServed: false,
      rightToRent: true
    },
    licensing: { localChecked: false, hmoLicence: false },
    inspections: { last: "2025-11-24" },
    rent: { increasePlanned: false, lastIncrease: "2025-04-01" },
    possession: { planned: true, noticeDraft: false },
    docs: [
      { key: "epc", title: "EPC certificate", date: "2024-04-18", source: "EPC register" },
      { key: "gas", title: "Gas certificate scan", date: "2025-07-06", source: "Uploaded PDF" },
      { key: "tenancy", title: "AST agreement", date: "2025-08-01", source: "Uploaded PDF" }
    ],
    timeline: [
      { date: "2026-05-19", title: "Possession readiness check started", detail: "CMP is checking evidence needed before next steps." },
      { date: "2025-11-24", title: "Property inspection logged", detail: "Routine inspection evidence stored." },
      { date: "2024-04-18", title: "EPC imported", detail: "Rating C, potential B." }
    ]
  },
  {
    id: "kings-heath",
    shortName: "Kings Heath Flat",
    address: "Flat 4, 18 York Road, Kings Heath, Birmingham B14 7RZ",
    postcode: "B14 7RZ",
    type: "Flat",
    bedrooms: 2,
    storeys: 1,
    hasGas: false,
    fixedCombustion: false,
    epc: { rating: "E", issue: "2016-06-12", certificate: "8921-5520-7120-0924-1180", floorArea: "61 sq m", potential: "C" },
    gas: { issue: "" },
    eicr: { issue: "" },
    alarms: { smokeEachStorey: true, coAlarm: true, testedAtStart: false },
    deposit: { taken: true, protected: false, prescribedInfo: false },
    tenancy: {
      currentlyTenanted: true,
      agreement: false,
      howToRent: false,
      epcServed: false,
      gasServed: false,
      eicrServed: false,
      rightToRent: false
    },
    licensing: { localChecked: false, hmoLicence: false },
    inspections: { last: "" },
    rent: { increasePlanned: true, lastIncrease: "2024-10-01" },
    possession: { planned: false, noticeDraft: false },
    docs: [{ key: "epc", title: "Old EPC certificate", date: "2016-06-12", source: "Manual entry" }],
    timeline: [
      { date: "2026-05-19", title: "Compliance check opened", detail: "Missing evidence detected across tenancy and electrical records." }
    ]
  },
  {
    id: "hmo-selly",
    shortName: "Selly Oak HMO",
    address: "21 Raddlebarn Road, Selly Oak, Birmingham B29 6HH",
    postcode: "B29 6HH",
    type: "HMO",
    bedrooms: 5,
    storeys: 3,
    hasGas: true,
    fixedCombustion: true,
    epc: { rating: "D", issue: "2023-02-01", certificate: "6321-8842-1093-7720-4911", floorArea: "132 sq m", potential: "B" },
    gas: { issue: "2026-02-18", engineer: "Gas Safe engineer recorded" },
    eicr: { issue: "2024-08-14", result: "Satisfactory" },
    alarms: { smokeEachStorey: true, coAlarm: true, testedAtStart: true },
    deposit: { taken: true, protected: true, prescribedInfo: true },
    tenancy: {
      currentlyTenanted: true,
      agreement: true,
      howToRent: true,
      epcServed: true,
      gasServed: true,
      eicrServed: true,
      rightToRent: true
    },
    licensing: { localChecked: true, hmoLicence: true, licenceExpiry: "2026-09-30" },
    inspections: { last: "2026-03-10" },
    rent: { increasePlanned: false, lastIncrease: "2025-09-01" },
    possession: { planned: false, noticeDraft: false },
    docs: [
      { key: "epc", title: "EPC certificate", date: "2023-02-01", source: "EPC register" },
      { key: "gas", title: "Gas Safety Certificate", date: "2026-02-18", source: "Uploaded PDF" },
      { key: "eicr", title: "EICR", date: "2024-08-14", source: "Uploaded PDF" },
      { key: "licence", title: "HMO licence", date: "2021-09-30", source: "Council record" },
      { key: "inspection", title: "March inspection report", date: "2026-03-10", source: "Uploaded PDF" }
    ],
    timeline: [
      { date: "2026-03-10", title: "Inspection report uploaded", detail: "No urgent hazards recorded." },
      { date: "2026-02-18", title: "Gas Safety renewed", detail: "Certificate stored in evidence pack." },
      { date: "2024-08-14", title: "EICR uploaded", detail: "Electrical certificate marked satisfactory." }
    ]
  }
];

properties.length = 0;

function activeProperty() {
  return properties.find((property) => property.id === state.activePropertyId) || null;
}

function ensureActiveProperty() {
  if (!properties.some((property) => property.id === state.activePropertyId)) {
    state.activePropertyId = properties[0]?.id || "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dateFrom(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = value instanceof Date ? value : dateFrom(value);
  if (!date) return "Not recorded";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRelative(date) {
  if (!date) return "No date recorded";
  const days = Math.ceil((date - today) / DAY);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 90) return `${days} days remaining`;
  return formatDate(date);
}

function addYears(value, years) {
  const date = value instanceof Date ? new Date(value) : dateFrom(value);
  if (!date) return null;
  date.setFullYear(date.getFullYear() + years);
  date.setDate(date.getDate() - 1);
  return date;
}

function addMonths(value, months) {
  const date = value instanceof Date ? new Date(value) : dateFrom(value);
  if (!date) return null;
  date.setMonth(date.getMonth() + months);
  return date;
}

function daysUntil(value) {
  const date = value instanceof Date ? value : dateFrom(value);
  if (!date) return null;
  return Math.ceil((date - today) / DAY);
}

function titleCase(value) {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusLabel(status) {
  return {
    ok: "Complete",
    warning: "Expiring soon",
    critical: "Priority",
    missing: "Missing",
    info: "Check"
  }[status] || "Check";
}

function certStatus(issue, years, soonDays = 90) {
  if (!issue) {
    return { status: "missing", expiry: null, days: null };
  }
  const expiry = addYears(issue, years);
  const days = daysUntil(expiry);
  if (days < 0) return { status: "critical", expiry, days };
  if (days <= soonDays) return { status: "warning", expiry, days };
  return { status: "ok", expiry, days };
}

function evaluateProperty(property) {
  const items = [];

  const epc = property.epc || {};
  const epcCert = certStatus(epc.issue, 10, 180);
  const poorRating = ["F", "G"].includes(epc.rating);
  const epcStatus = !epc.rating ? "missing" : poorRating ? "critical" : epcCert.status;
  items.push({
    key: "epc",
    icon: "leaf",
    title: "EPC",
    status: epcStatus,
    weight: 1.2,
    due: epcCert.expiry,
    summary: !epc.rating
      ? "No EPC rating is recorded for this property."
      : poorRating
        ? `EPC ${epc.rating} may fall below the private rented minimum standard unless a valid exemption applies.`
        : `Rating ${epc.rating}. Certificate ${epc.certificate || "number not recorded"}.`,
    action: !epc.rating
      ? "Pull EPC data from the register or book an EPC."
      : poorRating
        ? "Improve the rating, register an exemption, or get specialist advice."
        : epcCert.status === "warning"
          ? "Check whether a new EPC should be booked before expiry."
          : "Keep the EPC in the evidence pack.",
    service: epcStatus === "ok" ? "Store EPC" : "Book EPC",
    metrics: [
      epc.rating ? `Rating ${epc.rating}` : "No rating",
      epcCert.expiry ? `Expires ${formatDate(epcCert.expiry)}` : "No expiry",
      epc.potential ? `Potential ${epc.potential}` : "Potential unknown"
    ]
  });

  if (property.hasGas) {
    const gasCert = certStatus(property.gas?.issue, 1, 60);
    items.push({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: gasCert.status,
      weight: 1.3,
      due: gasCert.expiry,
      summary: gasCert.expiry
        ? `Current record expires ${formatRelative(gasCert.expiry)}.`
        : "Gas appliances are recorded, but no certificate issue date is stored.",
      action: gasCert.status === "ok"
        ? "Keep certificate and proof of service in the evidence pack."
        : "Upload the updated certificate or book a Gas Safety inspection.",
      service: gasCert.status === "ok" ? "Store Gas Safety" : "Renew Gas Safety",
      metrics: [property.gas?.issue ? `Issued ${formatDate(property.gas.issue)}` : "Issue date missing", property.gas?.engineer || "Engineer not recorded"]
    });
  } else {
    items.push({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: "info",
      weight: 0.45,
      due: null,
      summary: "No gas appliances are recorded for this property.",
      action: "Confirm if this changes at the next inspection.",
      service: "Update property record",
      metrics: ["No gas recorded"]
    });
  }

  const eicrCert = certStatus(property.eicr?.issue, 5, 120);
  items.push({
    key: "eicr",
    icon: "zap",
    title: "Electrical Safety",
    status: eicrCert.status,
    weight: 1.3,
    due: eicrCert.expiry,
    summary: eicrCert.expiry
      ? `EICR expires ${formatRelative(eicrCert.expiry)}.`
      : "No electrical certificate issue date is recorded.",
    action: eicrCert.status === "ok"
      ? "Keep the EICR and remedial evidence in the vault."
      : "Upload a valid EICR or book an electrical inspection.",
    service: eicrCert.status === "ok" ? "Store EICR" : "Book EICR",
    metrics: [property.eicr?.issue ? `Issued ${formatDate(property.eicr.issue)}` : "Issue date missing", property.eicr?.result || "Result not recorded"]
  });

  const alarmProblems = [];
  if (!property.alarms?.smokeEachStorey) alarmProblems.push("smoke alarm evidence");
  if (property.fixedCombustion && !property.alarms?.coAlarm) alarmProblems.push("CO alarm evidence");
  if (!property.alarms?.testedAtStart) alarmProblems.push("start-of-tenancy test proof");
  items.push({
    key: "alarms",
    icon: "bell-ring",
    title: "Smoke and CO alarms",
    status: alarmProblems.length ? (alarmProblems.length > 1 ? "critical" : "warning") : "ok",
    weight: 1.05,
    due: null,
    summary: alarmProblems.length
      ? `CMP needs ${alarmProblems.join(", ")}.`
      : "Alarm coverage and start-of-tenancy testing are recorded.",
    action: alarmProblems.length
      ? "Upload alarm photos, inspection notes, or arrange a check."
      : "Store the latest inspection evidence.",
    service: alarmProblems.length ? "Book inspection" : "Store alarm proof",
    metrics: [
      `${property.storeys || 1} storey record`,
      property.fixedCombustion ? "Fixed combustion appliance" : "No fixed combustion recorded"
    ]
  });

  const deposit = property.deposit || {};
  const depositMissing = deposit.taken && (!deposit.protected || !deposit.prescribedInfo);
  items.push({
    key: "deposit",
    icon: "wallet-cards",
    title: "Deposit protection",
    status: !deposit.taken ? "info" : depositMissing ? (!deposit.protected ? "critical" : "warning") : "ok",
    weight: 1.1,
    due: null,
    summary: !deposit.taken
      ? "No deposit is recorded."
      : depositMissing
        ? "Deposit evidence is incomplete."
        : "Deposit protection and prescribed information are recorded.",
    action: !deposit.taken
      ? "Confirm at tenancy setup."
      : depositMissing
        ? "Upload the scheme certificate and prescribed information proof."
        : "Keep the protection proof in the evidence pack.",
    service: depositMissing ? "Review deposit evidence" : "Store deposit proof",
    metrics: [deposit.taken ? "Deposit taken" : "No deposit", deposit.protected ? "Protected" : "Protection not confirmed"]
  });

  const tenancy = property.tenancy || {};
  const requiredDocs = [
    ["agreement", "tenancy agreement"],
    ["howToRent", "How to Rent guide"],
    ["epcServed", "EPC served"],
    ["rightToRent", "Right to Rent check"]
  ];
  if (property.hasGas) requiredDocs.push(["gasServed", "Gas Safety served"]);
  requiredDocs.push(["eicrServed", "EICR served"]);
  const missingDocs = requiredDocs.filter(([key]) => !tenancy[key]).map(([, label]) => label);
  items.push({
    key: "tenancy",
    icon: "file-text",
    title: "Tenancy documents",
    status: missingDocs.length ? (missingDocs.length >= 3 ? "critical" : "warning") : "ok",
    weight: 1.15,
    due: null,
    summary: missingDocs.length ? `Missing: ${missingDocs.join(", ")}.` : "Core tenancy evidence is recorded.",
    action: missingDocs.length
      ? "Upload missing documents or create a tenancy evidence checklist."
      : "Keep the served-document proof linked to the tenancy.",
    service: missingDocs.length ? "Prepare evidence pack" : "Store tenancy docs",
    metrics: [`${requiredDocs.length - missingDocs.length}/${requiredDocs.length} recorded`]
  });

  const licenceExpiry = property.licensing?.licenceExpiry ? dateFrom(property.licensing.licenceExpiry) : null;
  const licenceDays = licenceExpiry ? daysUntil(licenceExpiry) : null;
  let licenceStatus = "ok";
  let licenceSummary = "Local licensing has been checked.";
  if (property.type === "HMO" && !property.licensing?.hmoLicence) {
    licenceStatus = "critical";
    licenceSummary = "Property is marked as HMO, but no HMO licence evidence is stored.";
  } else if (!property.licensing?.localChecked) {
    licenceStatus = "warning";
    licenceSummary = "Selective or additional licensing has not been confirmed for this address.";
  } else if (licenceDays !== null && licenceDays < 0) {
    licenceStatus = "critical";
    licenceSummary = "The licence expiry date appears to be overdue.";
  } else if (licenceDays !== null && licenceDays <= 120) {
    licenceStatus = "warning";
    licenceSummary = `Licence expires ${formatRelative(licenceExpiry)}.`;
  }
  items.push({
    key: "licensing",
    icon: "badge-check",
    title: "Licensing",
    status: licenceStatus,
    weight: 1.05,
    due: licenceExpiry,
    summary: licenceSummary,
    action: licenceStatus === "ok"
      ? "Keep licence records and council correspondence stored."
      : "Check local council licensing requirements and upload evidence.",
    service: licenceStatus === "ok" ? "Store licence" : "Check licensing requirements",
    metrics: [property.type, property.licensing?.localChecked ? "Council check recorded" : "Council check needed"]
  });

  const inspectionDate = dateFrom(property.inspections?.last);
  const inspectionAge = inspectionDate ? Math.floor((today - inspectionDate) / DAY) : null;
  items.push({
    key: "inspections",
    icon: "clipboard-list",
    title: "Inspections",
    status: inspectionAge === null ? "missing" : inspectionAge > 180 ? "warning" : "ok",
    weight: 0.7,
    due: inspectionDate ? addMonths(inspectionDate, 6) : null,
    summary: inspectionDate
      ? `Last inspection was ${formatDate(inspectionDate)}.`
      : "No recent property inspection evidence is stored.",
    action: inspectionAge === null || inspectionAge > 180
      ? "Book or upload a condition inspection."
      : "Keep the latest inspection report in the evidence pack.",
    service: inspectionAge === null || inspectionAge > 180 ? "Book inspection" : "Store inspection",
    metrics: [inspectionDate ? `Last ${formatDate(inspectionDate)}` : "No inspection date"]
  });

  items.push({
    key: "rent",
    icon: "calendar-clock",
    title: "Rent increases",
    status: property.rent?.increasePlanned ? "warning" : "info",
    weight: 0.45,
    due: null,
    summary: property.rent?.increasePlanned
      ? "A rent increase is planned, but notice evidence should be checked."
      : "No rent increase is currently planned.",
    action: property.rent?.increasePlanned
      ? "Prepare and store the right rent increase evidence."
      : "CMP can remind you before the next review.",
    service: property.rent?.increasePlanned ? "Prepare rent notice" : "Set reminder",
    metrics: [property.rent?.lastIncrease ? `Last increase ${formatDate(property.rent.lastIncrease)}` : "No increase recorded"]
  });

  const possessionSensitive = property.possession?.planned;
  const possessionBlockers = items.filter((item) => ["epc", "gas", "deposit", "tenancy", "licensing"].includes(item.key) && ["critical", "missing", "warning"].includes(item.status));
  items.push({
    key: "possession",
    icon: "scale",
    title: "Possession readiness",
    status: possessionSensitive && possessionBlockers.length ? "critical" : possessionSensitive ? "warning" : "info",
    weight: possessionSensitive ? 1.2 : 0.45,
    due: null,
    summary: possessionSensitive
      ? possessionBlockers.length
        ? `${possessionBlockers.length} evidence issue${possessionBlockers.length === 1 ? "" : "s"} may affect readiness.`
        : "Core evidence looks ready for review."
      : "No possession journey is active.",
    action: possessionSensitive
      ? "Build a possession evidence pack before progressing."
      : "Start this journey before serving notice.",
    service: possessionSensitive ? "Prepare possession pack" : "Check possession readiness",
    metrics: [possessionSensitive ? "Journey active" : "Not active"]
  });

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const statusScores = { ok: 1, info: 0.76, warning: 0.55, missing: 0.22, critical: 0 };
  const weighted = items.reduce((sum, item) => sum + statusScores[item.status] * item.weight, 0);
  const score = Math.round((weighted / totalWeight) * 100);
  const criticalCount = items.filter((item) => item.status === "critical").length;
  const risk = criticalCount >= 2 || score < 45 ? "High" : score < 74 || criticalCount ? "Medium" : "Low";

  return { items, score, risk, criticalCount };
}

function sortedActions(items) {
  const rank = { critical: 0, missing: 1, warning: 2, info: 3, ok: 4 };
  return [...items]
    .filter((item) => item.status !== "ok")
    .sort((a, b) => {
      const rankDiff = rank[a.status] - rank[b.status];
      if (rankDiff) return rankDiff;
      const aDays = a.due ? daysUntil(a.due) : 9999;
      const bDays = b.due ? daysUntil(b.due) : 9999;
      return aDays - bDays;
    });
}

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

async function getSupabaseSession() {
  const client = window.CMPAuth?.getClient?.();
  if (!client) return { client: null, user: null };

  const { data, error } = await client.auth.getSession();
  if (error || !data?.session?.user) return { client, user: null };
  return { client, user: data.session.user };
}

function mergeScans(scans) {
  const byId = new Map(state.scans.map((scan) => [scan.id, scan]));
  scans
    .filter((scan) => scan?.id && scan?.propertyId)
    .forEach((scan) => byId.set(scan.id, { ...scan }));
  state.scans = Array.from(byId.values());
}

function propertySnapshot(property) {
  return JSON.parse(JSON.stringify(property));
}

function mergePropertySnapshot(propertyId, snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;
  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    Object.assign(property, { ...snapshot, id: propertyId });
    return;
  }
  properties.push({ ...snapshot, id: propertyId });
}

function unpackCheckerState(value) {
  if (!value || typeof value !== "object") return {};
  return value.answers || value;
}

function loadLocalWorkspace() {
  const saved = safeJsonParse(localStorage.getItem(LOCAL_WORKSPACE_STORAGE), {});
  Object.entries(saved || {}).forEach(([propertyId, workspace]) => {
    const checkerState = workspace.checkerState || workspace.checker_state || {};
    state.azChecklist[propertyId] = unpackCheckerState(checkerState);
    mergePropertySnapshot(propertyId, checkerState.propertySnapshot || workspace.propertySnapshot);
    mergeScans(workspace.documentScans || workspace.document_scans || []);
  });
  ensureActiveProperty();
}

async function loadPersistedWorkspace() {
  loadLocalWorkspace();
  await loadAiPreferences();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) {
    state.saveStatus = "Saved locally";
    state.saveTone = "local";
    return;
  }

  const { data, error } = await client
    .from(WORKSPACE_TABLE)
    .select("property_id, checker_state, document_scans, extracted_facts");

  if (error) {
    console.warn("Could not load CMP workspace", error);
    state.saveStatus = "Local save active";
    state.saveTone = "local";
    return;
  }

  (data || []).forEach((row) => {
    state.azChecklist[row.property_id] = unpackCheckerState(row.checker_state);
    mergePropertySnapshot(row.property_id, row.checker_state?.propertySnapshot);
    mergeScans(row.document_scans || []);
  });
  ensureActiveProperty();
  state.saveStatus = "Synced with Supabase";
  state.saveTone = "saved";
}

function saveWorkspaceLocally(propertyId) {
  const saved = safeJsonParse(localStorage.getItem(LOCAL_WORKSPACE_STORAGE), {});
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    delete saved[propertyId];
    localStorage.setItem(LOCAL_WORKSPACE_STORAGE, JSON.stringify(saved));
    return;
  }

  const checkerState = {
    answers: state.azChecklist[propertyId] || {},
    propertySnapshot: property ? propertySnapshot(property) : null,
    updatedAt: new Date().toISOString()
  };
  saved[propertyId] = {
    checkerState,
    documentScans: state.scans.filter((scan) => scan.propertyId === propertyId),
    extractedFacts: property ? extractedFactsObject(property) : {},
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_WORKSPACE_STORAGE, JSON.stringify(saved));
}

function removeWorkspaceLocally(propertyId) {
  const saved = safeJsonParse(localStorage.getItem(LOCAL_WORKSPACE_STORAGE), {});
  delete saved[propertyId];
  localStorage.setItem(LOCAL_WORKSPACE_STORAGE, JSON.stringify(saved));
}

function setSaveStatus(status, tone = "idle") {
  state.saveStatus = status;
  state.saveTone = tone;
  renderSaveStatus();
}

function renderSaveStatus() {
  const target = document.querySelector("#azSaveStatus");
  if (!target) return;
  target.textContent = state.saveStatus;
  target.dataset.tone = state.saveTone;
}

function queueWorkspaceSave(propertyId = state.activePropertyId) {
  window.clearTimeout(workspaceSaveTimer);
  setSaveStatus("Saving workspace...", "saving");
  workspaceSaveTimer = window.setTimeout(() => saveWorkspace(propertyId), 650);
}

async function saveWorkspace(propertyId = state.activePropertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    removeWorkspaceLocally(propertyId);
    return;
  }

  saveWorkspaceLocally(propertyId);

  const { client, user } = await getSupabaseSession();
  if (!client || !user) {
    setSaveStatus("Saved in this browser", "local");
    return;
  }

  const { error } = await client.from(WORKSPACE_TABLE).upsert({
    user_id: user.id,
    property_id: propertyId,
    checker_state: {
      answers: state.azChecklist[propertyId] || {},
      propertySnapshot: propertySnapshot(property),
      updatedAt: new Date().toISOString()
    },
    document_scans: state.scans.filter((scan) => scan.propertyId === propertyId),
    extracted_facts: extractedFactsObject(property),
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,property_id" });

  if (error) {
    console.warn("Could not save CMP workspace", error);
    setSaveStatus("Saved locally - Supabase retry later", "local");
    return;
  }

  setSaveStatus("Saved to Supabase", "saved");
}

function maskKey(value) {
  if (!value) return "";
  const clean = String(value).trim();
  if (clean.length <= 8) return "saved key";
  return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
}

async function loadAiPreferences() {
  const localPrefs = safeJsonParse(localStorage.getItem(LOCAL_AI_PREF_STORAGE), {});
  const localKey = localStorage.getItem(AI_KEY_STORAGE);
  state.aiSettings = {
    provider: localPrefs.provider || state.aiSettings.provider,
    endpoint: localPrefs.endpoint || state.aiSettings.endpoint,
    keyHint: localPrefs.keyHint || localPrefs.key_hint || (localKey ? maskKey(localKey) : ""),
    keyPresent: Boolean(localKey)
  };

  const { client, user } = await getSupabaseSession();
  if (!client || !user) return;

  const { data, error } = await client
    .from(AI_PREF_TABLE)
    .select("provider, endpoint, key_hint")
    .maybeSingle();

  if (!error && data) {
    state.aiSettings = {
      provider: data.provider || state.aiSettings.provider,
      endpoint: data.endpoint || state.aiSettings.endpoint,
      keyHint: data.key_hint || state.aiSettings.keyHint,
      keyPresent: Boolean(localKey || data.key_hint)
    };
  }
}

async function saveAiPreferences() {
  const provider = document.querySelector("#documentAiProvider")?.value || "openai";
  const endpoint = document.querySelector("#documentAiEndpoint")?.value.trim() || "https://api.openai.com/v1";
  const key = document.querySelector("#documentAiKey")?.value.trim() || "";
  const currentKey = localStorage.getItem(AI_KEY_STORAGE);
  const keyHint = key ? maskKey(key) : state.aiSettings.keyHint;

  if (key) {
    localStorage.setItem(AI_KEY_STORAGE, key);
  }

  state.aiSettings = {
    provider,
    endpoint,
    keyHint,
    keyPresent: Boolean(key || currentKey || keyHint)
  };
  localStorage.setItem(LOCAL_AI_PREF_STORAGE, JSON.stringify(state.aiSettings));
  renderAiSettings();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) return;

  const { error } = await client.from(AI_PREF_TABLE).upsert({
    user_id: user.id,
    provider,
    endpoint,
    key_hint: keyHint,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) {
    console.warn("Could not save AI preferences", error);
  }
}

async function clearAiKey() {
  localStorage.removeItem(AI_KEY_STORAGE);
  state.aiSettings = {
    provider: document.querySelector("#documentAiProvider")?.value || state.aiSettings.provider,
    endpoint: document.querySelector("#documentAiEndpoint")?.value.trim() || state.aiSettings.endpoint,
    keyHint: "",
    keyPresent: false
  };
  localStorage.setItem(LOCAL_AI_PREF_STORAGE, JSON.stringify(state.aiSettings));
  renderAiSettings();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) return;

  const { error } = await client.from(AI_PREF_TABLE).upsert({
    user_id: user.id,
    provider: state.aiSettings.provider,
    endpoint: state.aiSettings.endpoint,
    key_hint: "",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) {
    console.warn("Could not clear AI key hint", error);
  }
}

function renderAll() {
  ensureActiveProperty();
  renderPropertyList();
  renderJourneyList();
  renderDashboard();
  renderWizard();
  renderAzChecker();
  renderUploadModalState();
  syncDashboardPanels();
  renderSaveStatus();
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderPropertyList() {
  const list = document.querySelector("#propertyList");
  if (!properties.length) {
    list.innerHTML = `
      <div class="portfolio-empty">
        <strong>No portfolio listings yet</strong>
        <span>Add a property when you are ready to start a compliance check.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = properties.map((property) => {
    const evaluation = evaluateProperty(property);
    const active = property.id === state.activePropertyId ? " is-active" : "";
    return `
      <article class="property-row${active}">
        <button class="property-button${active}" type="button" data-property="${property.id}">
          <span>
            <strong>${escapeHtml(property.shortName)}</strong>
            <span>${escapeHtml(property.type)}${property.postcode ? ` - ${escapeHtml(property.postcode)}` : ""}</span>
          </span>
          <span class="property-score">${evaluation.score}%</span>
        </button>
        <button class="property-remove" type="button" data-remove-property="${property.id}" aria-label="Remove ${escapeHtml(property.shortName)}">
          <i data-lucide="trash-2"></i>
        </button>
      </article>
    `;
  }).join("");

  list.querySelectorAll("[data-property]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePropertyId = button.dataset.property;
      state.activeStep = 0;
      renderAll();
    });
  });

  list.querySelectorAll("[data-remove-property]").forEach((button) => {
    button.addEventListener("click", () => removeProperty(button.dataset.removeProperty));
  });
}

function renderJourneyList() {
  const list = document.querySelector("#journeyList");
  list.innerHTML = journeys.map((journey) => `
    <button class="journey-button${journey.id === state.activeJourney ? " is-active" : ""}" type="button" data-journey="${journey.id}">
      <i data-lucide="${journey.icon}"></i>
      <span>
        <span>${escapeHtml(journey.title)}</span>
        <small>${escapeHtml(journey.detail)}</small>
      </span>
    </button>
  `).join("");

  list.querySelectorAll("[data-journey]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeJourney = button.dataset.journey;
      if (state.activeJourney === "gas") state.activeStep = 1;
      if (state.activeJourney === "epc") state.activeStep = 0;
      if (state.activeJourney === "possession") state.activeStep = 4;
      state.activeDashboardPanel = "check";
      renderAll();
      document.querySelector("#guided-check").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function showDashboardPanel(panel, scroll = true) {
  state.activeDashboardPanel = panel;
  syncDashboardPanels();
  if (scroll) {
    const target = document.querySelector(`[data-dashboard-panel="${panel}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function dashboardPanelFromHash(hash) {
  return {
    "#dashboard": "requirements",
    "#guided-check": "check",
    "#az-checker": "az",
    "#evidence-pack": "evidence",
    "#services": "services"
  }[hash] || "";
}

function syncDashboardPanels() {
  document.querySelectorAll("[data-dashboard-tab]").forEach((tab) => {
    const active = tab.dataset.dashboardTab === state.activeDashboardPanel;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll("[data-dashboard-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.dashboardPanel === state.activeDashboardPanel);
  });
}

function renderDashboard() {
  const property = activeProperty();
  if (!property) {
    document.querySelector("#propertyTitle").textContent = "No portfolio properties yet";
    document.querySelector("#propertySubtitle").textContent = "Add a property to start the guided compliance check.";
    document.querySelector("#scoreValue").textContent = "0%";
    document.querySelector("#riskLabel").textContent = "Empty";
    document.querySelector("#scoreRing").style.setProperty("--score", 0);
    document.querySelector("#scoreRing").style.setProperty("--ring-color", "var(--blue)");
    document.querySelector("#scoreHeadline").textContent = "Your portfolio is empty.";
    document.querySelector("#scoreNarrative").textContent = "New accounts now start with a blank portfolio. Use Add to create the first property listing.";
    document.querySelector("#priorityList").innerHTML = `<article class="priority-item empty-state"><span class="status-dot info"></span><div><h3>No actions yet</h3><p>Add a property to generate compliance actions.</p></div></article>`;
    document.querySelector("#intelligenceStrip").innerHTML = ["Properties", "Urgent", "Expiring soon", "Evidence gaps"].map((label) => `
      <article class="intel-stat">
        <span>${label}</span>
        <strong>0</strong>
        <span>Waiting for a property listing</span>
      </article>
    `).join("");
    document.querySelector("#lastUpdated").textContent = "";
    document.querySelector("#complianceGrid").innerHTML = "";
    document.querySelector("#evidenceGrid").innerHTML = "";
    document.querySelector("#timeline").innerHTML = "";
    document.querySelector("#assistantHeadline").textContent = "Smart guidance, controlled by you";
    document.querySelector("#assistantCopy").textContent = "Add a property listing to unlock document scans, evidence packs, reminders, and recommended services.";
    document.querySelector("#scanResults").innerHTML = `<article class="scan-result"><strong>No property selected</strong><span>Add a portfolio listing before uploading evidence.</span></article>`;
    document.querySelector("#serviceList").innerHTML = "";
    document.querySelector("#pullEpcButton").disabled = true;
    document.querySelector("#startGuidedCheck").disabled = true;
    return;
  }

  document.querySelector("#pullEpcButton").disabled = false;
  document.querySelector("#startGuidedCheck").disabled = false;
  const evaluation = evaluateProperty(property);
  const actions = sortedActions(evaluation.items);
  const ring = document.querySelector("#scoreRing");
  const riskColor = evaluation.risk === "High" ? "var(--red)" : evaluation.risk === "Medium" ? "var(--amber)" : "var(--green)";

  document.querySelector("#propertyTitle").textContent = property.address;
  document.querySelector("#propertySubtitle").textContent = `${property.type} - ${property.bedrooms} bedrooms - ${property.storeys} storey${property.storeys === 1 ? "" : "s"} - ${journeySubtitle()}`;
  document.querySelector("#scoreValue").textContent = `${evaluation.score}%`;
  document.querySelector("#riskLabel").textContent = `${evaluation.risk} risk`;
  ring.style.setProperty("--score", evaluation.score);
  ring.style.setProperty("--ring-color", riskColor);

  const topAction = actions[0];
  document.querySelector("#scoreHeadline").textContent = topAction
    ? `${topAction.title} is the next thing to resolve.`
    : "This property is in a strong compliance position.";
  document.querySelector("#scoreNarrative").textContent = topAction
    ? topAction.action
    : "CMP has no urgent actions for this property. Keep renewals, inspections, and evidence uploads moving on schedule.";

  document.querySelector("#priorityList").innerHTML = (actions.length ? actions.slice(0, 3) : evaluation.items.filter((item) => item.status === "ok").slice(0, 3)).map((item) => `
    <article class="priority-item">
      <span class="status-dot ${item.status}"></span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.action)}</p>
      </div>
      <span class="status-pill ${item.status}">${statusLabel(item.status)}</span>
    </article>
  `).join("");

  const missingEvidence = evidenceTypes.filter((type) => !hasEvidence(property, type.key)).length;
  const expiringSoon = evaluation.items.filter((item) => item.status === "warning").length;
  const critical = evaluation.items.filter((item) => item.status === "critical").length;
  document.querySelector("#intelligenceStrip").innerHTML = `
    <article class="intel-stat">
      <span>Compliance score</span>
      <strong>${evaluation.score}%</strong>
      <span>${evaluation.risk} compliance risk</span>
    </article>
    <article class="intel-stat">
      <span>Urgent</span>
      <strong>${critical}</strong>
      <span>Critical issues needing attention</span>
    </article>
    <article class="intel-stat">
      <span>Expiring soon</span>
      <strong>${expiringSoon}</strong>
      <span>Renewals or checks due soon</span>
    </article>
    <article class="intel-stat">
      <span>Evidence gaps</span>
      <strong>${missingEvidence}</strong>
      <span>Missing proof in this property pack</span>
    </article>
  `;

  document.querySelector("#lastUpdated").textContent = `Checked ${formatDate(today)}`;
  document.querySelector("#complianceGrid").innerHTML = evaluation.items.map(renderComplianceCard).join("");
  renderEvidenceGrid(property);
  renderTimeline(property);
  renderAssistant(property, evaluation, actions);
  renderServices(actions, evaluation.items);
  renderScanResults();
}

function journeySubtitle() {
  const journey = journeys.find((item) => item.id === state.activeJourney);
  return journey ? journey.detail : "Compliance dashboard";
}

function renderComplianceCard(item) {
  return `
    <article class="compliance-card">
      <div class="card-top">
        <span class="card-icon"><i data-lucide="${item.icon}"></i></span>
        <span class="status-pill ${item.status}">${statusLabel(item.status)}</span>
      </div>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>
      <div class="metric-row">
        ${item.metrics.map((metric) => `<span class="mini-chip">${escapeHtml(metric)}</span>`).join("")}
        ${item.due ? `<span class="mini-chip">${escapeHtml(formatRelative(item.due))}</span>` : ""}
      </div>
      <button class="service-button" type="button">${escapeHtml(item.service)}</button>
    </article>
  `;
}

function hasEvidence(property, key) {
  if (key === "alarm") {
    return Boolean(property.docs.some((doc) => doc.key === "alarm") || (property.alarms?.smokeEachStorey && (!property.fixedCombustion || property.alarms?.coAlarm)));
  }
  return property.docs.some((doc) => doc.key === key);
}

function renderEvidenceGrid(property) {
  document.querySelector("#evidenceGrid").innerHTML = evidenceTypes.map((type) => {
    const docs = property.docs.filter((doc) => doc.key === type.key || (type.key === "alarm" && doc.key === "alarms"));
    const hasDoc = docs.length > 0 || hasEvidence(property, type.key);
    const latest = docs[0];
    return `
      <article class="evidence-card${hasDoc ? "" : " is-missing"}">
        <div class="card-top">
          <span class="card-icon"><i data-lucide="${type.icon}"></i></span>
          <span class="status-pill ${hasDoc ? "ok" : "missing"}">${hasDoc ? "Stored" : "Missing"}</span>
        </div>
        <div>
          <h3>${escapeHtml(type.title)}</h3>
          <p>${hasDoc
            ? escapeHtml(latest ? `${latest.title} · ${formatDate(latest.date)}` : "Evidence is recorded in structured property data.")
            : "CMP needs this proof before the pack is complete."}</p>
        </div>
        <div class="evidence-meta">
          <span class="mini-chip">${escapeHtml(latest?.source || (hasDoc ? "Structured record" : "No file"))}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderTimeline(property) {
  const timeline = [...property.timeline]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 6);
  document.querySelector("#timeline").innerHTML = timeline.map((item) => `
    <article class="timeline-item">
      <span class="status-dot info"></span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <span class="quiet-pill">${escapeHtml(formatDate(item.date))}</span>
    </article>
  `).join("");
}

function renderAssistant(property, evaluation, actions) {
  const headline = document.querySelector("#assistantHeadline");
  const copy = document.querySelector("#assistantCopy");
  const journey = state.activeJourney;
  const top = actions[0];
  const name = property.shortName;

  if (journey === "possession") {
    headline.textContent = "Check evidence before action";
    copy.textContent = top
      ? `${name} has evidence issues that may need attention before possession steps are progressed. CMP should guide, not make final legal decisions.`
      : `${name} has the core evidence recorded. CMP can now assemble a possession evidence pack for review.`;
    return;
  }

  if (journey === "gas") {
    headline.textContent = "Gas safety is handled in context";
    copy.textContent = property.hasGas
      ? "CMP checks the certificate date, proof of service, and whether the certificate has been given to the tenant."
      : "No gas appliances are recorded. CMP keeps this as a property fact and will re-check if the record changes.";
    return;
  }

  if (journey === "epc") {
    headline.textContent = "EPC data should auto-fill";
    copy.textContent = "In production, CMP can connect to the domestic EPC API, pull rating, expiry, lodgement, floor area, certificate number, and recommendations.";
    return;
  }

  headline.textContent = `${evaluation.risk} risk, ${evaluation.score}% complete`;
  copy.textContent = top
    ? `CMP thinks ${top.title.toLowerCase()} is the next priority for ${name}. ${top.action}`
    : `${name} looks calm today. CMP should keep watching renewals and evidence gaps.`;
}

function renderServices(actions, items) {
  const candidates = actions.length ? actions : items.filter((item) => item.status !== "info").slice(0, 3);
  document.querySelector("#serviceList").innerHTML = candidates.slice(0, 4).map((item) => `
    <article class="service-item">
      <strong>${escapeHtml(item.service)}</strong>
      <span>${escapeHtml(item.action)}</span>
      <button class="service-button" type="button">Start</button>
    </article>
  `).join("");
}

function getAzAnswers(propertyId = state.activePropertyId) {
  state.azChecklist[propertyId] = state.azChecklist[propertyId] || {};
  return state.azChecklist[propertyId];
}

function azCheckCount() {
  return azSections.reduce((count, section) => count + section.checks.length, 0);
}

function summarizeAzAnswers(answers) {
  const total = azCheckCount();
  const values = azSections.flatMap((section) => section.checks.map((check) => answers[check.id]));
  const answered = values.filter((value) => ["yes", "no", "na"].includes(value)).length;
  const complete = values.filter((value) => value === "yes" || value === "na").length;
  const issues = values.filter((value) => value === "no").length;
  const unknown = total - answered;
  return {
    total,
    answered,
    complete,
    issues,
    unknown,
    completion: Math.round((answered / total) * 100),
    compliance: Math.round((complete / total) * 100)
  };
}

function suggestAzPrimaryAction(summary) {
  if (summary.issues) {
    return `${summary.issues} compliance item${summary.issues === 1 ? "" : "s"} need action before this property feels complete.`;
  }
  if (summary.unknown) {
    return `${summary.unknown} check${summary.unknown === 1 ? "" : "s"} still need evidence or a landlord answer.`;
  }
  return "A-Z checker complete. Keep renewals and document evidence updated.";
}

function setAzAnswer(checkId, answer) {
  const answers = getAzAnswers();
  answers[checkId] = answer;
  queueWorkspaceSave();
  renderAll();
}

function factsList(property) {
  const epcExpiry = property.epc?.issue ? addYears(property.epc.issue, 10) : null;
  const gasExpiry = property.hasGas && property.gas?.issue ? addYears(property.gas.issue, 1) : null;
  const eicrExpiry = property.eicr?.issue ? addYears(property.eicr.issue, 5) : null;
  const latestScan = state.scans
    .filter((scan) => scan.propertyId === property.id)
    .sort((a, b) => String(b.scannedAt || b.id).localeCompare(String(a.scannedAt || a.id)))[0];

  return [
    {
      key: "property_profile",
      label: "Property profile",
      value: `${property.type} - ${property.bedrooms} bed - ${property.storeys} storey${property.storeys === 1 ? "" : "s"}`,
      source: "Property record"
    },
    {
      key: "epc",
      label: "EPC",
      value: property.epc?.rating ? `Rating ${property.epc.rating}, expires ${formatDate(epcExpiry)}` : "No EPC rating stored",
      source: property.epc?.certificate ? `Certificate ${property.epc.certificate}` : "Needs register pull or upload"
    },
    {
      key: "gas",
      label: "Gas safety",
      value: property.hasGas ? (property.gas?.issue ? `Issued ${formatDate(property.gas.issue)}, expires ${formatDate(gasExpiry)}` : "Gas applies, certificate date missing") : "No gas appliances recorded",
      source: property.gas?.engineer || "Property answer"
    },
    {
      key: "eicr",
      label: "Electrical safety",
      value: property.eicr?.issue ? `Issued ${formatDate(property.eicr.issue)}, expires ${formatDate(eicrExpiry)}` : "No EICR date stored",
      source: property.eicr?.result || "No result recorded"
    },
    {
      key: "deposit",
      label: "Deposit",
      value: property.deposit?.taken ? (property.deposit?.protected ? "Protected" : "Protection not confirmed") : "No deposit recorded",
      source: property.deposit?.prescribedInfo ? "Prescribed information recorded" : "Evidence incomplete"
    },
    {
      key: "latest_document",
      label: "Latest document intake",
      value: latestScan ? latestScan.title : "No document dump scans yet",
      source: latestScan ? `${latestScan.fileName} - ${latestScan.confidence}% confidence` : "Upload evidence to populate this"
    }
  ];
}

function extractedFactsObject(property) {
  return factsList(property).reduce((facts, item) => {
    facts[item.key] = {
      label: item.label,
      value: item.value,
      source: item.source
    };
    return facts;
  }, {});
}

function renderAzChecker() {
  const root = document.querySelector("#az-checker");
  if (!root) return;

  const property = activeProperty();
  if (!property) {
    document.querySelector("#azProgressValue").textContent = "0%";
    document.querySelector("#azProgressText").textContent = "No property selected";
    document.querySelector("#azPrimaryAction").textContent = "Add a property listing to start the A-Z checker.";
    document.querySelector("#azChecklist").innerHTML = `
      <div class="empty-panel">
        <strong>No checklist yet</strong>
        <span>The A-Z path appears once a property has been added.</span>
      </div>
    `;
    document.querySelector("#azLatestFacts").innerHTML = "";
    document.querySelector("#azDocumentResults").innerHTML = `
      <article class="az-document-result empty">
        <strong>No property selected</strong>
        <span>Add a portfolio listing before dumping documents.</span>
      </article>
    `;
    renderAiSettings();
    return;
  }

  const answers = getAzAnswers(property.id);
  const summary = summarizeAzAnswers(answers);
  const propertyScans = state.scans
    .filter((scan) => scan.propertyId === property.id)
    .slice(-6)
    .reverse();

  document.querySelector("#azProgressValue").textContent = `${summary.completion}%`;
  document.querySelector("#azProgressText").textContent = `${summary.answered}/${summary.total} checks answered - ${summary.compliance}% evidence ready`;
  document.querySelector("#azPrimaryAction").textContent = suggestAzPrimaryAction(summary);

  document.querySelector("#azChecklist").innerHTML = azSections.map((section) => {
    const sectionAnswered = section.checks.filter((check) => ["yes", "no", "na"].includes(answers[check.id])).length;
    return `
      <article class="az-section-card">
        <header class="az-section-header">
          <span class="card-icon"><i data-lucide="${section.icon}"></i></span>
          <div>
            <h4>${escapeHtml(section.title)}</h4>
            <span>${sectionAnswered}/${section.checks.length} answered</span>
          </div>
        </header>
        <div class="az-question-list">
          ${section.checks.map((check) => renderAzQuestion(check, answers[check.id])).join("")}
        </div>
      </article>
    `;
  }).join("");

  document.querySelector("#azLatestFacts").innerHTML = factsList(property).map((fact) => `
    <article class="latest-fact">
      <span>${escapeHtml(fact.label)}</span>
      <strong>${escapeHtml(fact.value)}</strong>
      <small>${escapeHtml(fact.source)}</small>
    </article>
  `).join("");

  document.querySelector("#azDocumentResults").innerHTML = propertyScans.length ? propertyScans.map((scan) => `
    <article class="az-document-result">
      <div>
        <strong>${escapeHtml(scan.title)}</strong>
        <span>${escapeHtml(scan.fileName)} - ${scan.confidence}% confidence</span>
        <small>${scan.issue ? `Issue ${formatDate(scan.issue)}` : "Issue date not found"}${scan.expiry ? ` - expires ${formatDate(scan.expiry)}` : ""}</small>
      </div>
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}">Use</button>
    </article>
  `).join("") : `
    <article class="az-document-result empty">
      <strong>No documents dumped yet</strong>
      <span>Uploads will appear here with extracted dates and confidence.</span>
    </article>
  `;

  root.querySelectorAll("[data-az-answer]").forEach((button) => {
    button.addEventListener("click", () => setAzAnswer(button.dataset.azCheck, button.dataset.azAnswer));
  });

  root.querySelectorAll("[data-apply-scan]").forEach((button) => {
    button.addEventListener("click", () => applyScan(button.dataset.applyScan));
  });

  renderAiSettings();
}

function renderAzQuestion(check, selected = "") {
  return `
    <div class="az-question">
      <div>
        <strong>${escapeHtml(check.label)}</strong>
        <span>${escapeHtml(check.help)}</span>
      </div>
      <div class="az-answer-group" role="group" aria-label="${escapeHtml(check.label)}">
        ${azAnswerOptions.map((option) => `
          <button
            class="az-answer${selected === option.value ? " is-active" : ""}"
            type="button"
            data-az-check="${escapeHtml(check.id)}"
            data-az-answer="${escapeHtml(option.value)}"
            data-answer="${escapeHtml(option.value)}"
            title="${escapeHtml(option.label)}"
          >
            <i data-lucide="${option.icon}"></i>
            <span>${escapeHtml(option.label)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAiSettings() {
  const provider = document.querySelector("#documentAiProvider");
  const endpoint = document.querySelector("#documentAiEndpoint");
  const keyInput = document.querySelector("#documentAiKey");
  const status = document.querySelector("#aiKeyStatus");
  if (!provider || !endpoint || !keyInput || !status) return;

  provider.value = state.aiSettings.provider || "openai";
  endpoint.value = state.aiSettings.endpoint || "https://api.openai.com/v1";
  keyInput.value = "";
  keyInput.placeholder = state.aiSettings.keyPresent && state.aiSettings.keyHint
    ? `Stored locally: ${state.aiSettings.keyHint}`
    : "Paste key for this browser";
  status.textContent = state.aiSettings.keyPresent
    ? `Reader connected (${state.aiSettings.keyHint || "local key"})`
    : "No reader connected";
  status.dataset.tone = state.aiSettings.keyPresent ? "saved" : "idle";
}

function renderWizard() {
  const property = activeProperty();
  if (!property) {
    document.querySelector("#stepCount").textContent = "";
    document.querySelector("#wizardTabs").innerHTML = "";
    document.querySelector("#wizardForm").innerHTML = `
      <div class="empty-panel">
        <strong>No property selected</strong>
        <span>Add a property listing to begin the guided compliance interview.</span>
      </div>
    `;
    return;
  }
  const step = wizardSteps[state.activeStep];
  document.querySelector("#stepCount").textContent = `${state.activeStep + 1} of ${wizardSteps.length}`;
  document.querySelector("#wizardTabs").innerHTML = wizardSteps.map((item, index) => `
    <button class="wizard-tab${index === state.activeStep ? " is-active" : ""}" type="button" data-step="${index}">
      <i data-lucide="${item.icon}"></i>
      ${escapeHtml(item.title)}
    </button>
  `).join("");

  document.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeStep = Number(button.dataset.step);
      renderAll();
    });
  });

  const form = document.querySelector("#wizardForm");
  form.innerHTML = wizardContent(step.id, property);
  form.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("change", () => updateField(input));
    input.addEventListener("input", () => {
      if (input.type !== "checkbox") updateField(input, false);
    });
  });
  form.querySelector("[data-prev]")?.addEventListener("click", () => {
    state.activeStep = Math.max(0, state.activeStep - 1);
    renderAll();
  });
  form.querySelector("[data-next]")?.addEventListener("click", () => {
    state.activeStep = Math.min(wizardSteps.length - 1, state.activeStep + 1);
    renderAll();
  });
  form.querySelectorAll("[data-open-upload]").forEach((button) => {
    button.addEventListener("click", openUploadModal);
  });
}

function wizardContent(stepId, property) {
  const evaluation = evaluateProperty(property);
  const summary = sortedActions(evaluation.items).slice(0, 3);

  const content = {
    property: `
      <span class="section-kicker">Property profile</span>
      <h3>Make the property the centre of the journey.</h3>
      <div class="question-grid">
        ${textQuestion("Address", "address", property.address, "CMP stores compliance, services, and evidence against this property.")}
        ${textQuestion("Postcode", "postcode", property.postcode, "Used for EPC lookup and future local checks.")}
        ${selectQuestion("Property type", "type", property.type, ["Single let house", "Flat", "HMO", "Student let", "Short let"])}
        ${numberQuestion("Bedrooms", "bedrooms", property.bedrooms)}
        ${numberQuestion("Storeys", "storeys", property.storeys)}
        ${toggleQuestion("Is the property currently tenanted?", "tenancy.currentlyTenanted", property.tenancy?.currentlyTenanted)}
      </div>
    `,
    gas: `
      <span class="section-kicker">Gas Safety</span>
      <h3>CMP checks whether gas evidence is required, valid, and served.</h3>
      <div class="question-grid">
        ${toggleQuestion("Does the property have gas appliances?", "hasGas", property.hasGas)}
        ${dateQuestion("Gas certificate issue date", "gas.issue", property.gas?.issue, "Annual renewal is tracked from this date.")}
        ${textQuestion("Engineer or registration note", "gas.engineer", property.gas?.engineer || "", "AI extraction should confirm engineer details and confidence.")}
        ${toggleQuestion("Was the certificate given to the tenant?", "tenancy.gasServed", property.tenancy?.gasServed)}
        ${uploadQuestion("Upload Gas Safety Certificate")}
      </div>
    `,
    electrical: `
      <span class="section-kicker">Electrical Safety</span>
      <h3>EICR evidence should be current, satisfactory, and stored.</h3>
      <div class="question-grid">
        ${dateQuestion("EICR issue date", "eicr.issue", property.eicr?.issue, "CMP tracks the five-year inspection cycle.")}
        ${selectQuestion("EICR result", "eicr.result", property.eicr?.result || "", ["", "Satisfactory", "Unsatisfactory", "Remedial works completed"])}
        ${toggleQuestion("Was the EICR given to the tenant?", "tenancy.eicrServed", property.tenancy?.eicrServed)}
        ${uploadQuestion("Upload EICR")}
      </div>
    `,
    alarms: `
      <span class="section-kicker">Smoke and CO alarms</span>
      <h3>Record coverage and proof, not just a yes/no answer.</h3>
      <div class="question-grid">
        ${toggleQuestion("Smoke alarm on each storey used as living accommodation?", "alarms.smokeEachStorey", property.alarms?.smokeEachStorey)}
        ${toggleQuestion("Any fixed combustion appliance, excluding gas cookers?", "fixedCombustion", property.fixedCombustion)}
        ${toggleQuestion("CO alarm present where required?", "alarms.coAlarm", property.alarms?.coAlarm)}
        ${toggleQuestion("Alarms tested at tenancy start?", "alarms.testedAtStart", property.alarms?.testedAtStart)}
        ${uploadQuestion("Upload alarm photos or inspection report")}
      </div>
    `,
    tenancy: `
      <span class="section-kicker">Tenancy and documents</span>
      <h3>CMP links compliance to the tenancy evidence trail.</h3>
      <div class="question-grid">
        ${toggleQuestion("Written tenancy agreement stored?", "tenancy.agreement", property.tenancy?.agreement)}
        ${toggleQuestion("How to Rent guide served?", "tenancy.howToRent", property.tenancy?.howToRent)}
        ${toggleQuestion("EPC served to tenant?", "tenancy.epcServed", property.tenancy?.epcServed)}
        ${toggleQuestion("Right to Rent check completed?", "tenancy.rightToRent", property.tenancy?.rightToRent)}
        ${toggleQuestion("Deposit taken?", "deposit.taken", property.deposit?.taken)}
        ${toggleQuestion("Deposit protected?", "deposit.protected", property.deposit?.protected)}
        ${toggleQuestion("Prescribed information served?", "deposit.prescribedInfo", property.deposit?.prescribedInfo)}
        ${uploadQuestion("Upload tenancy or deposit evidence")}
      </div>
    `,
    licensing: `
      <span class="section-kicker">Licensing, inspections, rent, possession</span>
      <h3>Local and journey-sensitive checks are flagged for review.</h3>
      <div class="question-grid">
        ${toggleQuestion("Local licensing checked?", "licensing.localChecked", property.licensing?.localChecked)}
        ${toggleQuestion("HMO licence evidence stored?", "licensing.hmoLicence", property.licensing?.hmoLicence)}
        ${dateQuestion("Licence expiry date", "licensing.licenceExpiry", property.licensing?.licenceExpiry || "", "Optional, but useful for renewal reminders.")}
        ${dateQuestion("Last inspection date", "inspections.last", property.inspections?.last || "", "CMP can remind every six months or on your policy.")}
        ${toggleQuestion("Rent increase planned?", "rent.increasePlanned", property.rent?.increasePlanned)}
        ${toggleQuestion("Possession or eviction journey active?", "possession.planned", property.possession?.planned)}
      </div>
    `,
    summary: `
      <span class="section-kicker">Action plan</span>
      <h3>${evaluation.score}% complete · ${evaluation.risk} risk</h3>
      <div class="priority-list">
        ${(summary.length ? summary : evaluation.items.filter((item) => item.status === "ok").slice(0, 3)).map((item) => `
          <article class="priority-item">
            <span class="status-dot ${item.status}"></span>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.action)}</p>
            </div>
            <span class="status-pill ${item.status}">${statusLabel(item.status)}</span>
          </article>
        `).join("")}
      </div>
    `
  }[stepId];

  return `
    ${content}
    <div class="wizard-actions">
      <button class="secondary-button" type="button" data-prev ${state.activeStep === 0 ? "disabled" : ""}>
        <i data-lucide="arrow-left"></i>
        Previous
      </button>
      <button class="primary-button" type="button" data-next ${state.activeStep === wizardSteps.length - 1 ? "disabled" : ""}>
        Next
        <i data-lucide="arrow-right"></i>
      </button>
    </div>
  `;
}

function textQuestion(label, field, value, hint = "") {
  return `
    <div class="question ${field === "address" ? "full" : ""}">
      <label>${escapeHtml(label)}</label>
      <input type="text" data-field="${escapeHtml(field)}" value="${escapeHtml(value || "")}">
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </div>
  `;
}

function numberQuestion(label, field, value) {
  return `
    <div class="question">
      <label>${escapeHtml(label)}</label>
      <input type="number" min="0" data-field="${escapeHtml(field)}" value="${escapeHtml(value || 0)}">
    </div>
  `;
}

function dateQuestion(label, field, value, hint = "") {
  return `
    <div class="question">
      <label>${escapeHtml(label)}</label>
      <input type="date" data-field="${escapeHtml(field)}" value="${escapeHtml(value || "")}">
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </div>
  `;
}

function selectQuestion(label, field, value, options) {
  return `
    <div class="question">
      <label>${escapeHtml(label)}</label>
      <select data-field="${escapeHtml(field)}">
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option || "Select")}</option>`).join("")}
      </select>
    </div>
  `;
}

function toggleQuestion(label, field, checked) {
  return `
    <div class="question">
      <div class="toggle-row">
        <span>${escapeHtml(label)}</span>
        <label class="switch" aria-label="${escapeHtml(label)}">
          <input type="checkbox" data-field="${escapeHtml(field)}" ${checked ? "checked" : ""}>
          <span></span>
        </label>
      </div>
    </div>
  `;
}

function uploadQuestion(label) {
  return `
    <div class="question">
      <button class="secondary-button" type="button" data-open-upload>
        <i data-lucide="upload-cloud"></i>
        ${escapeHtml(label)}
      </button>
      <small>Scanned evidence can update dates, document type, and confidence.</small>
    </div>
  `;
}

function updateField(input, rerender = true) {
  const property = activeProperty();
  if (!property) return;
  const value = input.type === "checkbox"
    ? input.checked
    : input.type === "number"
      ? Number(input.value)
      : input.value;
  setPath(property, input.dataset.field, value);

  if (input.dataset.field === "address") {
    property.shortName = input.value.split(",")[0] || "New property";
  }

  if (input.dataset.field === "postcode") {
    property.postcode = input.value.toUpperCase();
  }

  queueWorkspaceSave(property.id);
  if (rerender) renderAll();
  else renderDashboard();
}

function setPath(object, path, value) {
  const parts = path.split(".");
  let current = object;
  parts.slice(0, -1).forEach((part) => {
    current[part] = current[part] || {};
    current = current[part];
  });
  current[parts.at(-1)] = value;
}

function openUploadModal() {
  document.querySelector("#uploadModal").hidden = false;
  refreshIcons();
}

function closeUploadModal() {
  document.querySelector("#uploadModal").hidden = true;
}

function renderUploadModalState() {
  document.querySelectorAll("[data-open-upload]").forEach((button) => {
    button.removeEventListener("click", openUploadModal);
    button.addEventListener("click", openUploadModal);
  });
}

function scanDocument(file, text = "") {
  const haystack = `${file.name} ${text}`.toLowerCase();
  const rules = [
    { key: "gas", title: "Gas Safety Certificate", words: ["gas", "cp12", "lgsc"], years: 1 },
    { key: "eicr", title: "EICR", words: ["eicr", "electrical", "electric"], years: 5 },
    { key: "epc", title: "EPC certificate", words: ["epc", "energy performance", "energy-certificate"], years: 10 },
    { key: "deposit", title: "Deposit protection", words: ["deposit", "dps", "tds", "mydeposits"], years: null },
    { key: "tenancy", title: "Tenancy document", words: ["tenancy", "ast", "agreement", "how to rent"], years: null },
    { key: "licence", title: "Licensing document", words: ["licence", "license", "licensing", "hmo"], years: 5 },
    { key: "inspection", title: "Inspection report", words: ["inspection", "inventory", "condition"], years: null },
    { key: "notice", title: "Notice or possession evidence", words: ["notice", "section 21", "section21", "possession", "eviction"], years: null },
    { key: "alarm", title: "Alarm evidence", words: ["alarm", "smoke", "carbon monoxide", "co"], years: null }
  ];

  const match = rules.find((rule) => rule.words.some((word) => haystack.includes(word))) || {
    key: "tenancy",
    title: "Unclassified landlord evidence",
    years: null
  };
  const issue = extractDate(haystack);
  const expiry = match.years && issue ? addYears(issue, match.years) : null;
  const confidence = Math.min(96, 42 + (match.key ? 26 : 0) + (issue ? 24 : 0) + (file.type ? 4 : 0));

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    propertyId: state.activePropertyId,
    fileName: file.name,
    key: match.key,
    title: match.title,
    issue,
    expiry,
    confidence,
    scannedAt: new Date().toISOString()
  };
}

function extractDate(value) {
  const iso = value.match(/\b(20\d{2})[-_.\s](0?[1-9]|1[0-2])[-_.\s](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) {
    const [, year, month, day] = iso;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const uk = value.match(/\b(0?[1-9]|[12]\d|3[01])[-_.\s](0?[1-9]|1[0-2])[-_.\s](20\d{2})\b/);
  if (uk) {
    const [, day, month, year] = uk;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

function renderScanResults() {
  const propertyScans = state.scans.filter((scan) => scan.propertyId === state.activePropertyId).slice(-4).reverse();
  const target = document.querySelector("#scanResults");
  if (!propertyScans.length) {
    target.innerHTML = `
      <article class="scan-result">
        <strong>No scans yet</strong>
        <span>Upload a certificate or report to preview CMP document intelligence.</span>
      </article>
    `;
    return;
  }

  target.innerHTML = propertyScans.map((scan) => `
    <article class="scan-result">
      <strong>${escapeHtml(scan.title)}</strong>
      <span>${escapeHtml(scan.fileName)} · ${scan.confidence}% confidence</span>
      <span>${scan.issue ? `Issue date ${formatDate(scan.issue)}` : "No issue date found"}${scan.expiry ? ` · expires ${formatDate(scan.expiry)}` : ""}</span>
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}">Use details</button>
    </article>
  `).join("");

  target.querySelectorAll("[data-apply-scan]").forEach((button) => {
    button.addEventListener("click", () => applyScan(button.dataset.applyScan));
  });
}

function applyScan(scanId) {
  const scan = state.scans.find((item) => item.id === scanId);
  if (!scan) return;
  const property = activeProperty();
  if (!property) return;
  const issue = scan.issue || new Date().toISOString().slice(0, 10);

  if (scan.key === "gas") setPath(property, "gas.issue", issue);
  if (scan.key === "eicr") setPath(property, "eicr.issue", issue);
  if (scan.key === "epc") setPath(property, "epc.issue", issue);
  if (scan.key === "inspection") setPath(property, "inspections.last", issue);
  if (scan.key === "licence") {
    setPath(property, "licensing.localChecked", true);
    setPath(property, "licensing.hmoLicence", property.type === "HMO" ? true : property.licensing?.hmoLicence);
  }
  if (scan.key === "deposit") {
    setPath(property, "deposit.protected", true);
    setPath(property, "deposit.prescribedInfo", true);
  }
  if (scan.key === "tenancy") setPath(property, "tenancy.agreement", true);
  if (scan.key === "alarm") {
    setPath(property, "alarms.smokeEachStorey", true);
    setPath(property, "alarms.testedAtStart", true);
  }
  if (scan.key === "notice") setPath(property, "possession.noticeDraft", true);

  property.docs.unshift({
    key: scan.key,
    title: scan.title,
    date: issue,
    source: "AI scan preview"
  });
  property.timeline.unshift({
    date: new Date().toISOString().slice(0, 10),
    title: `${scan.title} applied`,
    detail: `${scan.confidence}% confidence from ${scan.fileName}.`
  });
  queueWorkspaceSave(property.id);
  renderAll();
}

function handleFiles(files) {
  if (!activeProperty()) {
    window.alert("Add a property listing before uploading evidence.");
    return;
  }
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === "string" ? reader.result.slice(0, 5000) : "";
      state.scans.push(scanDocument(file, content));
      queueWorkspaceSave();
      renderAll();
    };
    if (file.type.startsWith("text") || /\.(txt|csv|md)$/i.test(file.name)) {
      reader.readAsText(file);
    } else {
      state.scans.push(scanDocument(file));
      queueWorkspaceSave();
      renderAll();
    }
  });
}

function pullEpcData() {
  const property = activeProperty();
  if (!property) return;
  const samples = {
    "B37 7BA": {
      rating: "C",
      issue: "2024-04-18",
      certificate: "0420-2843-9201-3184-1022",
      floorArea: "89 sq m",
      potential: "B",
      recommendation: "Upgrade heating controls and loft insulation"
    },
    "B14 7RZ": {
      rating: "E",
      issue: "2016-06-12",
      certificate: "8921-5520-7120-0924-1180",
      floorArea: "61 sq m",
      potential: "C",
      recommendation: "Wall insulation and low-energy lighting"
    },
    "B29 6HH": {
      rating: "D",
      issue: "2023-02-01",
      certificate: "6321-8842-1093-7720-4911",
      floorArea: "132 sq m",
      potential: "B",
      recommendation: "Solar water heating and heating controls"
    }
  };

  property.epc = samples[property.postcode?.toUpperCase()] || {
    rating: "D",
    issue: new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toISOString().slice(0, 10),
    certificate: "API-READY-DEMO",
    floorArea: "Unknown",
    potential: "C",
    recommendation: "Connect domestic EPC API with authenticated search"
  };

  if (!property.docs.some((doc) => doc.key === "epc")) {
    property.docs.unshift({ key: "epc", title: "EPC certificate", date: property.epc.issue, source: "EPC register preview" });
  }

  state.scans.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    propertyId: property.id,
    fileName: "Domestic EPC API search",
    key: "epc",
    title: "EPC register data pulled",
    issue: property.epc.issue,
    expiry: addYears(property.epc.issue, 10),
    confidence: 91,
    scannedAt: new Date().toISOString()
  });

  property.timeline.unshift({
    date: new Date().toISOString().slice(0, 10),
    title: "EPC register data pulled",
    detail: `Rating ${property.epc.rating}, potential ${property.epc.potential}. Production build should call the authenticated domestic EPC API.`
  });
  queueWorkspaceSave(property.id);
  renderAll();
}

function addProperty() {
  const id = `property-${Date.now()}`;
  properties.unshift({
    id,
    shortName: "New property",
    address: "New property, England",
    postcode: "",
    type: "Single let house",
    bedrooms: 2,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: { rating: "", issue: "", certificate: "", floorArea: "", potential: "" },
    gas: { issue: "" },
    eicr: { issue: "" },
    alarms: { smokeEachStorey: false, coAlarm: false, testedAtStart: false },
    deposit: { taken: true, protected: false, prescribedInfo: false },
    tenancy: {
      currentlyTenanted: true,
      agreement: false,
      howToRent: false,
      epcServed: false,
      gasServed: false,
      eicrServed: false,
      rightToRent: false
    },
    licensing: { localChecked: false, hmoLicence: false },
    inspections: { last: "" },
    rent: { increasePlanned: false, lastIncrease: "" },
    possession: { planned: false, noticeDraft: false },
    docs: [],
    timeline: [{ date: new Date().toISOString().slice(0, 10), title: "Property created", detail: "Guided compliance check ready to start." }]
  });
  state.activePropertyId = id;
  state.activeStep = 0;
  state.activeDashboardPanel = "az";
  queueWorkspaceSave(id);
  renderAll();
}

async function removeProperty(propertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;

  const confirmed = window.confirm(`Are you sure you want to remove ${property.shortName || "this portfolio listing"} from the portfolio?`);
  if (!confirmed) return;

  properties.splice(properties.indexOf(property), 1);
  delete state.azChecklist[propertyId];
  state.scans = state.scans.filter((scan) => scan.propertyId !== propertyId);
  removeWorkspaceLocally(propertyId);
  ensureActiveProperty();
  setSaveStatus("Removing portfolio listing...", "saving");
  renderAll();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) {
    setSaveStatus("Removed in this browser", "local");
    return;
  }

  const { error } = await client
    .from(WORKSPACE_TABLE)
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);

  if (error) {
    console.warn("Could not remove CMP workspace", error);
    setSaveStatus("Removed locally - Supabase retry needed", "local");
    return;
  }

  setSaveStatus("Portfolio listing removed", "saved");
}

document.addEventListener("DOMContentLoaded", () => {
  state.activeDashboardPanel = dashboardPanelFromHash(window.location.hash) || state.activeDashboardPanel;
  renderAll();
  loadPersistedWorkspace()
    .then(() => renderAll())
    .catch((error) => {
      console.warn("Could not initialise saved workspace", error);
      setSaveStatus("Local save active", "local");
    });

  document.querySelector("#pullEpcButton").addEventListener("click", pullEpcData);
  document.querySelector("#startGuidedCheck").addEventListener("click", () => {
    showDashboardPanel("check", false);
    document.querySelector("#guided-check").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#addPropertyButton").addEventListener("click", addProperty);

  document.querySelectorAll("[data-dashboard-tab]").forEach((tab) => {
    tab.addEventListener("click", () => showDashboardPanel(tab.dataset.dashboardTab));
  });

  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const panel = dashboardPanelFromHash(link.getAttribute("href"));
      if (panel) showDashboardPanel(panel, false);
    });
  });

  document.querySelectorAll("[data-close-upload]").forEach((element) => {
    element.addEventListener("click", closeUploadModal);
  });

  document.querySelector("#documentUpload").addEventListener("change", (event) => {
    handleFiles(event.target.files);
    closeUploadModal();
    event.target.value = "";
  });

  document.querySelector("#azDocumentDump")?.addEventListener("change", (event) => {
    handleFiles(event.target.files);
    showDashboardPanel("az", false);
    event.target.value = "";
  });

  document.querySelector("#saveAiSettings")?.addEventListener("click", saveAiPreferences);
  document.querySelector("#clearAiKey")?.addEventListener("click", clearAiKey);
});
