const DAY = 24 * 60 * 60 * 1000;

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  activePropertyId: "",
  activeJourney: "compliance",
  activeStep: 0,
  activeDashboardPanel: "check",
  setup: {
    isOpen: true,
    postcode: "",
    searchDone: false,
    selectedAddressId: "",
    isChecking: false,
    isSearching: false,
    addressMatches: [],
    postcodeMeta: null,
    manualAddress: {
      houseNumber: "",
      roadName: ""
    },
    apiStatus: "idle",
    createdPropertyId: "",
    message: ""
  },
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
const ONBOARDING_STORAGE = "cmp_onboarding_complete";
const POSTCODES_IO_BASE = "https://api.postcodes.io";
const EPC_API_BASE = "https://api.get-energy-performance-data.communities.gov.uk/api/domestic";
const EPC_API_BEARER_TOKEN = "zOgGRYlWU4p4zP7vhfTF4of99wvkOQAhuT6WmVQY82ZAbPip90yuZmm67yJe5HaI";
const DOCUMENT_AI_MODEL = "gpt-4o-mini";
let workspaceSaveTimer = null;

const journeys = [
  {
    id: "compliance",
    icon: "clipboard-check",
    title: "Check my property compliance",
    detail: "Get a plain-English score and the next safest action."
  },
  {
    id: "certificate",
    icon: "badge-check",
    title: "I need a certificate",
    detail: "Start with EPC, Gas Safety, EICR, licence, or inspection needs."
  },
  {
    id: "upload",
    icon: "folder-up",
    title: "I have documents to upload",
    detail: "Drop certificates and tenancy paperwork into one evidence pack."
  },
  {
    id: "tenancy",
    icon: "file-signature",
    title: "I'm preparing for a tenancy",
    detail: "Check the documents and proof a tenant should receive."
  },
  {
    id: "issue",
    icon: "life-buoy",
    title: "I'm dealing with a compliance issue",
    detail: "Find the missing evidence or renewal that needs attention."
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

const properties = [];

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
  if (properties.length && localStorage.getItem(ONBOARDING_STORAGE)) {
    state.setup.isOpen = false;
  }
}

async function loadPersistedWorkspace() {
  loadLocalWorkspace();
  await loadAiPreferences();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) {
    state.saveStatus = "Saved locally";
    state.saveTone = "local";
    if (properties.length && localStorage.getItem(ONBOARDING_STORAGE)) {
      state.setup.isOpen = false;
    }
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
  if (properties.length && localStorage.getItem(ONBOARDING_STORAGE)) {
    state.setup.isOpen = false;
  }
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

function getDocumentAiKey() {
  return window.CMP_DOCUMENT_AI_KEY || localStorage.getItem(AI_KEY_STORAGE) || "";
}

async function loadAiPreferences() {
  const localPrefs = safeJsonParse(localStorage.getItem(LOCAL_AI_PREF_STORAGE), {});
  const localFileKey = window.CMP_DOCUMENT_AI_KEY || "";
  const localKey = getDocumentAiKey();
  state.aiSettings = {
    provider: localPrefs.provider || state.aiSettings.provider,
    endpoint: localPrefs.endpoint || state.aiSettings.endpoint,
    keyHint: localFileKey ? maskKey(localFileKey) : localPrefs.keyHint || localPrefs.key_hint || (localKey ? maskKey(localKey) : ""),
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
  const currentKey = getDocumentAiKey();
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
  const localFileKey = window.CMP_DOCUMENT_AI_KEY || "";
  state.aiSettings = {
    provider: document.querySelector("#documentAiProvider")?.value || state.aiSettings.provider,
    endpoint: document.querySelector("#documentAiEndpoint")?.value.trim() || state.aiSettings.endpoint,
    keyHint: localFileKey ? maskKey(localFileKey) : "",
    keyPresent: Boolean(localFileKey)
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
  renderPropertySetup();
  renderJourneyList();
  renderDashboard();
  renderWizard();
  renderAzChecker();
  renderUploadModalState();
  syncDashboardPanels();
  renderSaveStatus();
  refreshIcons();
}

function normalizePostcode(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function formatPostcode(value) {
  const normalized = normalizePostcode(value);
  if (normalized.length <= 3) return normalized;
  return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
}

function cityFromPostcodeMeta(postcodeMeta) {
  const value = [
    postcodeMeta?.post_town,
    postcodeMeta?.admin_district,
    postcodeMeta?.bua,
    postcodeMeta?.ttwa,
    postcodeMeta?.region,
    postcodeMeta?.country
  ].find(Boolean);
  return titleCase(String(value || "").toLowerCase());
}

function splitStreetLine(value) {
  const line = String(value || "").replace(/\s+/g, " ").trim();
  const match = line.match(/^([0-9]+[a-zA-Z]?(?:\s*(?:-|\/)\s*[0-9]+[a-zA-Z]?)?)\s+(.+)$/);
  if (!match) {
    return { houseNumber: line, roadName: "" };
  }
  return {
    houseNumber: match[1].replace(/\s+/g, ""),
    roadName: titleCase(match[2].toLowerCase())
  };
}

function fullAddressLabel({ houseNumber, roadName, postcode, city, fallbackAddress }) {
  const street = [houseNumber, roadName].filter(Boolean).join(" ").trim();
  return [
    street || fallbackAddress,
    formatPostcode(postcode),
    city
  ]
    .filter(Boolean)
    .join(", ");
}

function setupFromStorage() {
  state.setup.isOpen = !localStorage.getItem(ONBOARDING_STORAGE) || !properties.length;
}

function hasEpcCredentials() {
  return Boolean(EPC_API_BEARER_TOKEN);
}

function epcAuthHeader() {
  return `Bearer ${EPC_API_BEARER_TOKEN}`;
}

async function lookupPostcode(postcode) {
  const response = await fetch(`${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(normalizePostcode(postcode))}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status !== 200 || !data.result) {
    throw new Error("That postcode was not found by Postcodes.io. Check the postcode and try again.");
  }
  return data.result;
}

async function searchEpcByPostcode(postcode) {
  const params = new URLSearchParams({ postcode: formatPostcode(postcode), page_size: "50" });
  const response = await fetch(`${EPC_API_BASE}/search?${params}`, {
    headers: {
      Accept: "application/json",
      Authorization: epcAuthHeader()
    }
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("The Energy Performance Data API rejected that bearer token. Check the GOV.UK One Login API access token.");
  }
  if (!response.ok) {
    throw new Error("The EPC register could not be reached. Try again in a moment.");
  }

  const data = await response.json();
  return Array.isArray(data.data) ? data.data : Array.isArray(data.rows) ? data.rows : Array.isArray(data) ? data : [];
}

function epcAddress(row) {
  return [
    row.addressLine1 || row.address1,
    row.addressLine2 || row.address2,
    row.addressLine3 || row.address3,
    row.addressLine4,
    row.postTown || row.posttown,
    row.postcode
  ]
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ")
    .trim();
}

function epcMatchFromRow(row, postcodeMeta) {
  const certificateNumber = row.certificateNumber || row["lmk-key"] || row["building-reference-number"] || "";
  const addressLine1 = row.addressLine1 || row.address1 || "";
  const addressLine2 = row.addressLine2 || row.address2 || "";
  const street = splitStreetLine(addressLine1);
  const postcode = formatPostcode(row.postcode || postcodeMeta?.postcode || state.setup.postcode);
  const city = cityFromPostcodeMeta({ ...postcodeMeta, post_town: row.postTown || row.posttown || postcodeMeta?.post_town });
  const address = fullAddressLabel({
    houseNumber: street.houseNumber,
    roadName: street.roadName || titleCase(String(addressLine2).toLowerCase()),
    postcode,
    city,
    fallbackAddress: epcAddress(row) || `EPC record ${certificateNumber || row.uprn || "found"}`
  });
  const propertyType = titleCase(row.propertyType || row["property-type"] || "Property");
  const rooms = Number(row["number-habitable-rooms"] || row["number-heated-rooms"] || 2);
  return {
    id: certificateNumber || row.uprn || address,
    address,
    shortName: address.split(",")[0] || "Property",
    houseNumber: street.houseNumber,
    roadName: street.roadName || titleCase(String(addressLine2).toLowerCase()),
    city,
    postcode,
    type: propertyType,
    bedrooms: Number.isFinite(rooms) && rooms > 0 ? Math.min(rooms, 6) : 2,
    storeys: Number(row["number-open-fireplaces"] || 0) > 0 ? 2 : 1,
    hasGas: /gas/i.test(`${row["mainheat-description"] || ""} ${row["main-fuel"] || ""}`),
    fixedCombustion: /gas|oil|solid fuel|wood|coal/i.test(`${row["mainheat-description"] || ""} ${row["main-fuel"] || ""}`),
    epc: {
      rating: row.currentEnergyEfficiencyBand || row["current-energy-rating"] || "",
      issue: row.registrationDate || row["inspection-date"] || row["lodgement-date"] || "",
      certificate: certificateNumber,
      floorArea: row.totalFloorArea || row["total-floor-area"] ? `${row.totalFloorArea || row["total-floor-area"]} sq m` : "",
      potential: row.potentialEnergyEfficiencyBand || row["potential-energy-rating"] || "",
      recommendation: row.environmentImpactCurrent || row["environment-impact-current"]
        ? `Environmental impact score ${row.environmentImpactCurrent || row["environment-impact-current"]}`
        : "View the EPC register for recommendations"
    },
    source: "Energy Performance Data API",
    uprn: row.uprn || "",
    latitude: postcodeMeta?.latitude,
    longitude: postcodeMeta?.longitude
  };
}

function postcodeFallbackAddress(postcodeMeta) {
  return [
    formatPostcode(postcodeMeta?.postcode || state.setup.postcode),
    cityFromPostcodeMeta(postcodeMeta)
  ].filter(Boolean).join(", ");
}

function postcodeFallbackMatch(postcodeMeta, reason = "") {
  const fallbackPostcode = formatPostcode(postcodeMeta?.postcode || state.setup.postcode);
  return {
    id: `postcode-fallback-${normalizePostcode(fallbackPostcode)}`,
    address: postcodeFallbackAddress(postcodeMeta),
    shortName: fallbackPostcode,
    houseNumber: "",
    roadName: "",
    city: cityFromPostcodeMeta(postcodeMeta),
    postcode: fallbackPostcode,
    requiresManualAddress: true,
    type: "Property",
    bedrooms: 2,
    storeys: 1,
    hasGas: false,
    fixedCombustion: false,
    epc: {
      rating: "",
      issue: "",
      certificate: "",
      floorArea: "",
      potential: "",
      recommendation: reason || "Live EPC details can be pulled in later when the register is reachable."
    },
    source: "Verified postcode",
    uprn: "",
    latitude: postcodeMeta?.latitude,
    longitude: postcodeMeta?.longitude
  };
}

async function searchRealPropertyData() {
  const postcode = state.setup.postcode;
  state.setup.isSearching = true;
  state.setup.isChecking = false;
  state.setup.searchDone = false;
  state.setup.addressMatches = [];
  state.setup.selectedAddressId = "";
  state.setup.manualAddress = { houseNumber: "", roadName: "" };
  state.setup.createdPropertyId = "";
  state.setup.message = "Checking the postcode with Postcodes.io...";
  state.setup.apiStatus = "checking";
  renderAll();

  try {
    const postcodeMeta = await lookupPostcode(postcode);
    state.setup.postcodeMeta = postcodeMeta;

    state.setup.message = "Postcode found. Searching the official EPC register for address matches...";
    renderAll();
    const rows = await searchEpcByPostcode(postcode);
    state.setup.addressMatches = rows.map((row) => epcMatchFromRow(row, postcodeMeta));
    if (!state.setup.addressMatches.length) {
      state.setup.addressMatches = [
        postcodeFallbackMatch(postcodeMeta, "No domestic EPC record was returned for this postcode, so CMP started with the verified postcode instead.")
      ];
    }
    if (state.setup.addressMatches.length) {
      state.setup.selectedAddressId = state.setup.addressMatches[0].id;
    }
    state.setup.searchDone = true;
    state.setup.apiStatus = "ready";
    state.setup.message = rows.length
      ? "Addresses found. CMP selected the first match so you can continue immediately."
      : "Postcode found. CMP could not pull a live EPC address list here, so it created a verified postcode match you can use straight away.";
  } catch (error) {
    if (state.setup.postcodeMeta) {
      state.setup.addressMatches = [
        postcodeFallbackMatch(state.setup.postcodeMeta, "The live EPC register was not reachable from this browser, so CMP created a verified postcode match instead.")
      ];
      state.setup.selectedAddressId = state.setup.addressMatches[0].id;
      state.setup.searchDone = true;
      state.setup.apiStatus = "ready";
      state.setup.message = "Postcode found. Live EPC address lookup was unavailable in this browser, but you can continue with a verified postcode match.";
      return;
    }
    state.setup.searchDone = true;
    state.setup.apiStatus = "error";
    state.setup.message = error.message || "The real postcode/EPC lookup failed. Please try again.";
  } finally {
    state.setup.isSearching = false;
    renderAll();
  }
}

function buildPropertyFromAddress(match) {
  const id = `property-${Date.now()}`;
  const todayIso = new Date().toISOString().slice(0, 10);
  const epcIssue = match.epc?.issue || "";
  const houseNumber = String(match.houseNumber || state.setup.manualAddress.houseNumber || "").trim();
  const roadName = titleCase(String(match.roadName || state.setup.manualAddress.roadName || "").toLowerCase());
  const city = titleCase(String(match.city || cityFromPostcodeMeta(state.setup.postcodeMeta)).toLowerCase());
  const postcode = formatPostcode(match.postcode || state.setup.postcode);
  const address = fullAddressLabel({
    houseNumber,
    roadName,
    postcode,
    city,
    fallbackAddress: match.address
  });
  return {
    id,
    shortName: address.split(",")[0] || match.shortName,
    address,
    houseNumber,
    roadName,
    city,
    postcode,
    type: match.type,
    bedrooms: match.bedrooms,
    storeys: match.storeys,
    hasGas: match.hasGas,
    fixedCombustion: match.fixedCombustion,
    epc: { ...match.epc },
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
    docs: epcIssue ? [{ key: "epc", title: "EPC register result", date: epcIssue, source: match.source || "Energy Performance Data API" }] : [],
    timeline: [
      {
        date: todayIso,
        title: "Property found",
        detail: "Postcode and EPC register search selected this address and started the compliance setup."
      },
      {
        date: todayIso,
        title: "EPC data checked",
        detail: match.epc?.rating
          ? `EPC rating ${match.epc.rating}, potential ${match.epc.potential || "not recorded"}.`
          : "No current EPC rating was returned for this property."
      }
    ]
  };
}

function resetPropertySetup(open = true) {
  state.setup = {
    isOpen: open,
    postcode: "",
    searchDone: false,
    selectedAddressId: "",
    isChecking: false,
    isSearching: false,
    addressMatches: [],
    postcodeMeta: null,
    manualAddress: {
      houseNumber: "",
      roadName: ""
    },
    apiStatus: "idle",
    createdPropertyId: "",
    message: ""
  };
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_STORAGE, new Date().toISOString());
}

function createPropertyFromMatch(match, onboardingPath = "manual") {
  const property = buildPropertyFromAddress(match);
  properties.unshift(property);
  state.activePropertyId = property.id;
  state.activeStep = 0;
  state.activeJourney = onboardingPath === "az" ? "upload" : "compliance";
  state.activeDashboardPanel = onboardingPath === "az" ? "az" : "check";
  state.setup.isChecking = false;
  state.setup.isOpen = false;
  state.setup.createdPropertyId = property.id;
  state.setup.message = onboardingPath === "az"
    ? "Property added. CMP opened the A-Z checker."
    : "Property added. CMP opened the manual guided setup.";
  completeOnboarding();
  queueWorkspaceSave(property.id);
  renderAll();
  window.setTimeout(() => {
    document.querySelector(onboardingPath === "az" ? "#az-checker" : "#guided-check")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

function renderPropertySetup() {
  const panel = document.querySelector("#propertySetup");
  if (!panel) return;

  if (!state.setup.isOpen) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  panel.hidden = false;
  const matches = state.setup.searchDone ? state.setup.addressMatches : [];
  const activeMatch = matches.find((item) => item.id === state.setup.selectedAddressId);
  const needsManualAddress = Boolean(activeMatch?.requiresManualAddress);
  const hasManualAddress = !needsManualAddress || (state.setup.manualAddress.houseNumber.trim() && state.setup.manualAddress.roadName.trim());
  const canCreateProperty = Boolean(activeMatch && hasManualAddress && !state.setup.isChecking);
  const statusTone = state.setup.apiStatus === "error" ? "error" : "neutral";

  panel.innerHTML = `
    <div class="setup-copy">
      <span class="section-kicker">Start here</span>
      <h2 id="propertySetupTitle">Add a property in under a minute.</h2>
      <p>Find the address. CMP will prepare the next step.</p>
      <div class="setup-steps" aria-label="Property setup steps">
        <span class="is-complete"><i data-lucide="search"></i> Postcode</span>
        <span class="${matches.length ? "is-complete" : state.setup.isSearching ? "is-active" : ""}"><i data-lucide="map-pin"></i> Address</span>
        <span class="${state.setup.createdPropertyId ? "is-complete" : state.setup.isChecking ? "is-active" : ""}"><i data-lucide="radar"></i> EPC preview</span>
      </div>
    </div>

    <form class="postcode-search" id="postcodeSearchForm">
      <label for="postcodeSearch">Property postcode</label>
      <div class="postcode-control">
        <input id="postcodeSearch" type="text" value="${escapeHtml(state.setup.postcode)}" placeholder="B37 7BA" autocomplete="postal-code">
        <button class="primary-button" type="submit" ${state.setup.isSearching ? "disabled" : ""}>
          <i data-lucide="search"></i>
          ${state.setup.isSearching ? "Searching..." : "Find address"}
        </button>
      </div>
      <small>Uses Postcodes.io and official EPC data.</small>
    </form>

    ${state.setup.searchDone ? `
      <div class="address-results" aria-live="polite" data-tone="${statusTone}">
        <div class="address-results-heading">
          <strong>${matches.length ? `${matches.filter((match) => !match.requiresManualAddress).length || matches.length} ${matches.some((match) => match.requiresManualAddress) ? "postcode match" : `EPC address${matches.length === 1 ? "" : "es"}`} found` : "No selectable address yet"}</strong>
          <span>${escapeHtml(formatPostcode(state.setup.postcode))}</span>
        </div>
        ${state.setup.message ? `<p class="api-message">${escapeHtml(state.setup.message)}</p>` : ""}
        ${matches.length ? `
          <div class="address-list">
            ${matches.map((match) => `
              <button class="address-option${match.id === state.setup.selectedAddressId ? " is-selected" : ""}" type="button" data-address-id="${escapeHtml(match.id)}">
                <span>
                  <strong>${escapeHtml(match.address)}</strong>
                  <small>${escapeHtml(match.type)} · ${match.bedrooms} bed estimate · EPC ${escapeHtml(match.epc.rating || "not recorded")} · ${escapeHtml(match.source)}</small>
                </span>
                <i data-lucide="${match.id === state.setup.selectedAddressId ? "check-circle-2" : "circle"}"></i>
              </button>
            `).join("")}
          </div>
        ` : ""}
        ${needsManualAddress ? `
          <div class="manual-address-card">
            <div>
              <strong>Add the full property address</strong>
              <span>Postcode is verified. Add the house number and road so the property is registered correctly.</span>
            </div>
            <label>
              <span>House number</span>
              <input type="text" data-manual-address="houseNumber" value="${escapeHtml(state.setup.manualAddress.houseNumber)}" placeholder="12" autocomplete="address-line1">
            </label>
            <label>
              <span>Road name</span>
              <input type="text" data-manual-address="roadName" value="${escapeHtml(state.setup.manualAddress.roadName)}" placeholder="High Street" autocomplete="address-line2">
            </label>
            <small data-address-preview>Property will be saved as ${escapeHtml(fullAddressLabel({
              houseNumber: state.setup.manualAddress.houseNumber || "House number",
              roadName: state.setup.manualAddress.roadName || "Road name",
              postcode: activeMatch.postcode,
              city: activeMatch.city
            }))}</small>
          </div>
        ` : ""}
      </div>
    ` : ""}

    <div class="setup-result${activeMatch ? " is-found" : ""}">
      <div>
        <strong>${state.setup.isChecking ? "Creating property..." : activeMatch && !hasManualAddress ? "Complete the address" : activeMatch ? "Choose how to continue" : "What happens next?"}</strong>
        <span>${state.setup.isChecking
          ? "Creating the workspace."
          : activeMatch && !hasManualAddress
            ? "Add the missing house number and road name first."
            : activeMatch
            ? "Use the full checklist, or add the details yourself."
            : "Choose the address, then follow the guided path."}</span>
      </div>
      <div class="setup-choice-actions" aria-label="Choose setup method">
        <button class="primary-button" type="button" data-onboarding-path="az" ${canCreateProperty ? "" : "disabled"}>
          <i data-lucide="list-tree"></i>
          Use A-Z checker
        </button>
        <button class="secondary-button" type="button" data-onboarding-path="manual" ${canCreateProperty ? "" : "disabled"}>
          <i data-lucide="pencil-line"></i>
          Add manually
        </button>
      </div>
    </div>
  `;

  panel.querySelector("#postcodeSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = panel.querySelector("#postcodeSearch")?.value || "";
    state.setup.postcode = formatPostcode(value);
    if (!normalizePostcode(value)) {
      state.setup.searchDone = true;
      state.setup.apiStatus = "error";
      state.setup.message = "Enter a postcode to search for matching addresses.";
      renderAll();
      return;
    }
    searchRealPropertyData();
  });

  panel.querySelectorAll("[data-address-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.setup.selectedAddressId = button.dataset.addressId;
      state.setup.createdPropertyId = "";
      state.setup.message = "";
      renderAll();
    });
  });

  panel.querySelectorAll("[data-manual-address]").forEach((input) => {
    input.addEventListener("input", () => {
      state.setup.manualAddress[input.dataset.manualAddress] = input.value;
      const complete = Boolean(state.setup.manualAddress.houseNumber.trim() && state.setup.manualAddress.roadName.trim());
      panel.querySelectorAll("[data-onboarding-path]").forEach((button) => {
        button.disabled = !complete || state.setup.isChecking;
      });
      const preview = panel.querySelector("[data-address-preview]");
      if (preview && activeMatch) {
        preview.textContent = `Property will be saved as ${fullAddressLabel({
          houseNumber: state.setup.manualAddress.houseNumber || "House number",
          roadName: state.setup.manualAddress.roadName || "Road name",
          postcode: activeMatch.postcode,
          city: activeMatch.city
        })}`;
      }
      const resultTitle = panel.querySelector(".setup-result strong");
      const resultCopy = panel.querySelector(".setup-result span");
      if (resultTitle && resultCopy) {
        resultTitle.textContent = complete ? "Choose how to continue" : "Complete the address";
        resultCopy.textContent = complete
          ? "Use the full checklist, or add the details yourself."
          : "Add the missing house number and road name first.";
      }
    });
  });

  panel.querySelectorAll("[data-onboarding-path]").forEach((button) => {
    button.addEventListener("click", () => {
      const match = state.setup.addressMatches.find((item) => item.id === state.setup.selectedAddressId);
      if (!match) return;
      if (match.requiresManualAddress && (!state.setup.manualAddress.houseNumber.trim() || !state.setup.manualAddress.roadName.trim())) {
        state.setup.message = "Add the house number and road name before creating the property.";
        renderAll();
        return;
      }
      state.setup.isChecking = true;
      renderAll();
      window.setTimeout(() => createPropertyFromMatch(match, button.dataset.onboardingPath), 500);
    });
  });
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
        <strong>No properties yet</strong>
        <span>Start with a postcode search. CMP will build the first property record from there.</span>
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
    button.addEventListener("click", () => activateJourney(button.dataset.journey));
  });
}

function activateJourney(journeyId) {
  state.activeJourney = journeyId;
  if (state.activeJourney === "certificate") state.activeStep = 1;
  if (state.activeJourney === "upload") state.activeDashboardPanel = "evidence";
  if (state.activeJourney === "tenancy") state.activeStep = 4;
  if (state.activeJourney === "issue") state.activeStep = 5;
  if (state.activeJourney !== "upload") state.activeDashboardPanel = "check";
  renderAll();
  document.querySelector(state.activeJourney === "upload" ? '[data-dashboard-panel="evidence"]' : "#guided-check")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

function propertyCompletionSummary(property, evaluation) {
  const missingEvidence = evidenceTypes.filter((type) => !hasEvidence(property, type.key)).length;
  const openActions = evaluation.items.filter((item) => ["critical", "missing", "warning"].includes(item.status));
  const total = Math.max(missingEvidence, openActions.length);
  return {
    total,
    labels: openActions.slice(0, 3).map((item) => item.title)
  };
}

function renderCompletionBanner(property, evaluation) {
  const banner = document.querySelector("#completionBanner");
  if (!banner) return;

  if (!property) {
    banner.hidden = true;
    banner.innerHTML = "";
    return;
  }

  const summary = propertyCompletionSummary(property, evaluation);
  if (!summary.total) {
    banner.hidden = false;
    banner.dataset.tone = "complete";
    banner.innerHTML = `
      <span class="completion-icon"><i data-lucide="check"></i></span>
      <div>
        <strong>Property looks complete</strong>
        <span>Keep documents and renewal dates updated.</span>
      </div>
      <button class="secondary-button" type="button" data-dashboard-tab="evidence">Review evidence</button>
    `;
    return;
  }

  banner.hidden = false;
  banner.dataset.tone = "warning";
  banner.innerHTML = `
    <span class="completion-icon"><i data-lucide="alert-circle"></i></span>
    <div>
      <strong>${summary.total} item${summary.total === 1 ? "" : "s"} left to complete this property</strong>
      <span>${escapeHtml(summary.labels.join(", ") || "Add the missing compliance details.")}</span>
    </div>
    <button class="primary-button" type="button" data-dashboard-tab="az">Finish setup</button>
  `;

  banner.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => showDashboardPanel(button.dataset.dashboardTab));
  });
}

function renderDashboard() {
  const property = activeProperty();
  if (!property) {
    renderCompletionBanner(null);
    document.querySelector("#propertyTitle").textContent = "Start with a postcode";
    document.querySelector("#propertySubtitle").textContent = "Find the address. Follow the next step.";
    document.querySelector("#scoreValue").textContent = "0%";
    document.querySelector("#riskLabel").textContent = "Empty";
    document.querySelector("#scoreRing").style.setProperty("--score", 0);
    document.querySelector("#scoreRing").style.setProperty("--ring-color", "var(--blue)");
    document.querySelector("#scoreHeadline").textContent = "No property selected yet.";
    document.querySelector("#scoreNarrative").textContent = "Use the postcode search above.";
    document.querySelector("#priorityList").innerHTML = `<article class="priority-item empty-state"><span class="status-dot info"></span><div><h3>First step</h3><p>Enter a postcode.</p></div></article>`;
    document.querySelector("#intelligenceStrip").innerHTML = ["Properties", "Urgent", "Expiring soon", "Evidence gaps"].map((label) => `
      <article class="intel-stat">
        <span>${label}</span>
        <strong>0</strong>
        <span>Waiting</span>
      </article>
    `).join("");
    document.querySelector("#lastUpdated").textContent = "";
    document.querySelector("#complianceGrid").innerHTML = "";
    document.querySelector("#evidenceGrid").innerHTML = "";
    document.querySelector("#timeline").innerHTML = "";
    document.querySelector("#assistantHeadline").textContent = "Smart guidance, controlled by you";
    document.querySelector("#assistantCopy").textContent = "Add a property to unlock scans and reminders.";
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
  document.querySelector("#propertySubtitle").textContent = `${property.type} - ${property.bedrooms} bed - ${journeySubtitle()}`;
  document.querySelector("#scoreValue").textContent = `${evaluation.score}%`;
  document.querySelector("#riskLabel").textContent = `${evaluation.risk} risk`;
  ring.style.setProperty("--score", evaluation.score);
  ring.style.setProperty("--ring-color", riskColor);
  renderCompletionBanner(property, evaluation);

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
      <span>${evaluation.risk} risk</span>
    </article>
    <article class="intel-stat">
      <span>Urgent</span>
      <strong>${critical}</strong>
      <span>Need action</span>
    </article>
    <article class="intel-stat">
      <span>Expiring soon</span>
      <strong>${expiringSoon}</strong>
      <span>Due soon</span>
    </article>
    <article class="intel-stat">
      <span>Evidence gaps</span>
      <strong>${missingEvidence}</strong>
      <span>Missing proof</span>
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
  return {
    compliance: "Compliance check",
    certificate: "Certificate path",
    upload: "Document upload",
    tenancy: "Tenancy setup",
    issue: "Resolve an issue"
  }[state.activeJourney] || "Compliance dashboard";
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

  if (journey === "issue") {
    headline.textContent = "Start with the risk, then the proof";
    copy.textContent = top
      ? `${name} has a clear first issue to resolve: ${top.title.toLowerCase()}. CMP keeps the next step practical and evidence-led.`
      : `${name} has no urgent issue showing. CMP can keep watching renewals and evidence gaps.`;
    return;
  }

  if (journey === "certificate") {
    headline.textContent = "Certificates should start from the property";
    copy.textContent = "CMP looks at EPC, Gas Safety, EICR, licensing, and inspection needs together, then suggests the certificate or service that fits this property.";
    return;
  }

  if (journey === "upload") {
    headline.textContent = "Documents become a property record";
    copy.textContent = "Upload certificates, tenancy paperwork, notices, or reports. This prototype scans readable filenames and text, then turns them into evidence items.";
    return;
  }

  if (journey === "tenancy") {
    headline.textContent = "Prepare the tenancy pack before it becomes stressful";
    copy.textContent = "CMP checks the EPC, Gas Safety, EICR, How to Rent, deposit, Right to Rent, and served-document trail in one place.";
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
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}">${scan.applied ? "Applied" : "Use"}</button>
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
    ? `Reader connected (${state.aiSettings.keyHint || "local key"}) - AI fill enabled`
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

function openAiOutputText(response) {
  if (response.output_text) return response.output_text;
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the uploaded file for AI scanning."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function base64FromDataUrl(dataUrl) {
  return String(dataUrl).split(",")[1] || "";
}

function canSendFileToAi(file) {
  return file.size <= 20 * 1024 * 1024;
}

async function buildDocumentAiContent(file, text, scan, property) {
  const promptPayload = {
    fileName: file.name,
    fileType: file.type || "",
    readableText: text || "",
    currentProperty: property ? propertySnapshot(property) : null,
    currentScanGuess: scan,
    checklistIds: azSections.flatMap((section) => section.checks.map((check) => check.id)),
    returnShape: {
      document: {
        key: "epc | gas | eicr | alarm | deposit | tenancy | licence | inspection | notice",
        title: "short document title",
        issue: "YYYY-MM-DD or empty string",
        expiry: "YYYY-MM-DD or empty string",
        confidence: "0-100 number"
      },
      property: {
        address: "",
        postcode: "",
        type: "",
        bedrooms: null,
        storeys: null,
        hasGas: null,
        fixedCombustion: null,
        epc: { rating: "", issue: "", certificate: "", floorArea: "", potential: "", recommendation: "" },
        gas: { issue: "", engineer: "" },
        eicr: { issue: "", result: "" },
        alarms: { smokeEachStorey: null, coAlarm: null, testedAtStart: null },
        deposit: { taken: null, protected: null, prescribedInfo: null },
        tenancy: {
          currentlyTenanted: null,
          agreement: null,
          howToRent: null,
          epcServed: null,
          gasServed: null,
          eicrServed: null,
          rightToRent: null
        },
        licensing: { localChecked: null, hmoLicence: null, licenceExpiry: "" },
        inspections: { last: "" },
        rent: { increasePlanned: null, lastIncrease: "" },
        possession: { planned: null, noticeDraft: null }
      },
      checklistAnswers: {
        example_check_id: "yes | no | unknown | na"
      }
    }
  };

  const content = [{ type: "input_text", text: JSON.stringify(promptPayload) }];
  if (!canSendFileToAi(file)) return content;

  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
  const isFileInput = /(\.pdf|\.docx?|\.rtf|\.odt|\.txt|\.md|\.json|\.csv|\.tsv|\.xls|\.xlsx)$/i.test(file.name);

  if (isImage) {
    content.push({ type: "input_image", image_url: await readFileAsDataUrl(file) });
  } else if (isFileInput) {
    content.push({
      type: "input_file",
      filename: file.name,
      file_data: base64FromDataUrl(await readFileAsDataUrl(file))
    });
  }

  return content;
}

async function extractDocumentFactsWithAi(file, text, scan) {
  const key = getDocumentAiKey();
  if (!key) return null;

  const endpoint = (state.aiSettings.endpoint || "https://api.openai.com/v1").replace(/\/$/, "");
  const property = activeProperty();
  const userContent = await buildDocumentAiContent(file, text, scan, property);
  const response = await fetch(`${endpoint}/responses`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DOCUMENT_AI_MODEL,
      input: [
        {
          role: "system",
          content: [
            "You extract UK landlord compliance facts for CMP.",
            "Return only valid JSON.",
            "Use empty strings for unknown text/date fields, null for unknown numbers, and only yes/no/unknown/na for checklist answers.",
            "Do not invent facts that are not supported by the file name, readable text, or current property record."
          ].join(" ")
        },
        {
          role: "user",
          content: userContent
        }
      ],
      text: { format: { type: "json_object" } }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `OpenAI request failed with ${response.status}`);
  }

  return safeJsonParse(openAiOutputText(await response.json()), null);
}

const aiFieldMap = {
  address: "address",
  postcode: "postcode",
  type: "type",
  bedrooms: "bedrooms",
  storeys: "storeys",
  hasGas: "hasGas",
  fixedCombustion: "fixedCombustion",
  "epc.rating": "epc.rating",
  "epc.issue": "epc.issue",
  "epc.certificate": "epc.certificate",
  "epc.floorArea": "epc.floorArea",
  "epc.potential": "epc.potential",
  "epc.recommendation": "epc.recommendation",
  "gas.issue": "gas.issue",
  "gas.engineer": "gas.engineer",
  "eicr.issue": "eicr.issue",
  "eicr.result": "eicr.result",
  "alarms.smokeEachStorey": "alarms.smokeEachStorey",
  "alarms.coAlarm": "alarms.coAlarm",
  "alarms.testedAtStart": "alarms.testedAtStart",
  "deposit.taken": "deposit.taken",
  "deposit.protected": "deposit.protected",
  "deposit.prescribedInfo": "deposit.prescribedInfo",
  "tenancy.currentlyTenanted": "tenancy.currentlyTenanted",
  "tenancy.agreement": "tenancy.agreement",
  "tenancy.howToRent": "tenancy.howToRent",
  "tenancy.epcServed": "tenancy.epcServed",
  "tenancy.gasServed": "tenancy.gasServed",
  "tenancy.eicrServed": "tenancy.eicrServed",
  "tenancy.rightToRent": "tenancy.rightToRent",
  "licensing.localChecked": "licensing.localChecked",
  "licensing.hmoLicence": "licensing.hmoLicence",
  "licensing.licenceExpiry": "licensing.licenceExpiry",
  "inspections.last": "inspections.last",
  "rent.increasePlanned": "rent.increasePlanned",
  "rent.lastIncrease": "rent.lastIncrease",
  "possession.planned": "possession.planned",
  "possession.noticeDraft": "possession.noticeDraft"
};

function flattenObject(value, prefix = "", output = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return output;
  Object.entries(value).forEach(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenObject(child, path, output);
    } else {
      output[path] = child;
    }
  });
  return output;
}

function isKnownValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "boolean";
}

function applyAiExtraction(extraction, scan) {
  const property = activeProperty();
  if (!property || !extraction || typeof extraction !== "object") return false;

  const flatProperty = flattenObject(extraction.property || extraction.propertyPatch || {});
  Object.entries(flatProperty).forEach(([sourcePath, value]) => {
    const targetPath = aiFieldMap[sourcePath];
    if (!targetPath || !isKnownValue(value)) return;
    setPath(property, targetPath, typeof value === "string" && sourcePath === "postcode" ? value.toUpperCase() : value);
  });

  const document = extraction.document || {};
  if (document.key) scan.key = document.key;
  if (document.title) scan.title = document.title;
  if (document.issue) scan.issue = document.issue;
  if (document.expiry) scan.expiry = document.expiry;
  const confidence = Number(document.confidence);
  if (Number.isFinite(confidence)) scan.confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  const validCheckIds = new Set(azSections.flatMap((section) => section.checks.map((check) => check.id)));
  const answers = getAzAnswers(property.id);
  Object.entries(extraction.checklistAnswers || {}).forEach(([checkId, answer]) => {
    if (!validCheckIds.has(checkId) || !azAnswerOptions.some((option) => option.value === answer)) return;
    answers[checkId] = answer;
  });

  if (property.address) property.shortName = property.address.split(",")[0] || property.shortName;
  property.timeline.unshift({
    date: new Date().toISOString().slice(0, 10),
    title: "AI filled property details",
    detail: `${scan.title} was analysed with ${DOCUMENT_AI_MODEL}.`
  });
  return true;
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
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}">${scan.applied ? "Applied" : "Use details"}</button>
    </article>
  `).join("");

  target.querySelectorAll("[data-apply-scan]").forEach((button) => {
    button.addEventListener("click", () => applyScan(button.dataset.applyScan));
  });
}

function applyScan(scanId, options = {}) {
  const scan = state.scans.find((item) => item.id === scanId);
  if (!scan) return;
  const property = activeProperty();
  if (!property) return;
  const issue = scan.issue || "";
  const documentDate = issue || String(scan.scannedAt || new Date().toISOString()).slice(0, 10);

  if (scan.key === "gas" && issue) setPath(property, "gas.issue", issue);
  if (scan.key === "eicr" && issue) setPath(property, "eicr.issue", issue);
  if (scan.key === "epc" && issue) setPath(property, "epc.issue", issue);
  if (scan.key === "inspection" && issue) setPath(property, "inspections.last", issue);
  if (scan.key === "licence") {
    setPath(property, "licensing.localChecked", true);
    setPath(property, "licensing.hmoLicence", property.type === "HMO" ? true : property.licensing?.hmoLicence);
    if (scan.expiry) setPath(property, "licensing.licenceExpiry", scan.expiry);
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

  scan.docId = scan.docId || scan.id;
  const existingDoc = property.docs.find((doc) => doc.scanId === scan.docId);
  if (existingDoc) {
    existingDoc.key = scan.key;
    existingDoc.title = scan.title;
    existingDoc.date = documentDate;
    existingDoc.source = options.ai ? "AI document scan" : "Auto scan";
  } else {
    property.docs.unshift({
      scanId: scan.docId,
      key: scan.key,
      title: scan.title,
      date: documentDate,
      source: options.ai ? "AI document scan" : "Auto scan"
    });
  }

  if (!scan.applied) {
    property.timeline.unshift({
      date: new Date().toISOString().slice(0, 10),
      title: `${scan.title} applied`,
      detail: `${scan.confidence}% confidence from ${scan.fileName}.`
    });
  }
  scan.applied = true;
  queueWorkspaceSave(property.id);
  if (options.render !== false) renderAll();
}

function handleFiles(files) {
  if (!activeProperty()) {
    window.alert("Add a property listing before uploading evidence.");
    return;
  }
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = typeof reader.result === "string" ? reader.result.slice(0, 5000) : "";
      const scan = scanDocument(file, content);
      state.scans.push(scan);
      applyScan(scan.id, { render: false });
      queueWorkspaceSave();
      renderAll();
      await enrichScanWithAi(file, content, scan);
    };
    if (file.type.startsWith("text") || /\.(txt|csv|md)$/i.test(file.name)) {
      reader.readAsText(file);
    } else {
      const scan = scanDocument(file);
      state.scans.push(scan);
      applyScan(scan.id, { render: false });
      queueWorkspaceSave();
      renderAll();
      enrichScanWithAi(file, "", scan);
    }
  });
}

async function enrichScanWithAi(file, content, scan) {
  if (!getDocumentAiKey()) return;

  setSaveStatus("AI filling property details...", "saving");
  try {
    const extraction = await extractDocumentFactsWithAi(file, content, scan);
    if (!applyAiExtraction(extraction, scan)) {
      setSaveStatus("AI did not find new fields", "idle");
      return;
    }
    applyScan(scan.id, { ai: true });
  } catch (error) {
    console.warn("Could not fill CMP fields with AI", error);
    setSaveStatus("AI fill failed - saved preview only", "local");
  }
}

async function pullEpcData() {
  const property = activeProperty();
  if (!property) return;

  const button = document.querySelector("#pullEpcButton");
  button.disabled = true;
  button.innerHTML = `<i data-lucide="cloud-download"></i> Pulling EPC`;
  refreshIcons();

  try {
    const postcodeMeta = await lookupPostcode(property.postcode);
    const matches = (await searchEpcByPostcode(property.postcode)).map((row) => epcMatchFromRow(row, postcodeMeta));
    const normalizedAddress = property.address.toLowerCase();
    const match = matches.find((item) => normalizedAddress.includes(item.shortName.toLowerCase()) || item.address.toLowerCase() === normalizedAddress) || matches[0];
    if (!match) {
      window.alert("No EPC record was returned for this property postcode.");
      return;
    }
    property.epc = { ...match.epc };
    property.type = match.type || property.type;
    property.bedrooms = match.bedrooms || property.bedrooms;
    property.storeys = match.storeys || property.storeys;
    property.hasGas = match.hasGas;
    property.fixedCombustion = match.fixedCombustion;
  } catch (error) {
    window.alert(error.message || "Could not pull EPC data.");
    return;
  } finally {
    button.disabled = false;
    button.innerHTML = `<i data-lucide="cloud-download"></i> Pull EPC`;
    refreshIcons();
  }

  if (!property.docs.some((doc) => doc.key === "epc")) {
    property.docs.unshift({ key: "epc", title: "EPC certificate", date: property.epc.issue, source: "Energy Performance Data API" });
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
    detail: `Rating ${property.epc.rating || "not recorded"}, potential ${property.epc.potential || "not recorded"} from the Energy Performance Data domestic search API.`
  });
  queueWorkspaceSave(property.id);
  renderAll();
}

function addProperty() {
  resetPropertySetup(true);
  renderAll();
  document.querySelector("#propertySetup")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  setupFromStorage();
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
