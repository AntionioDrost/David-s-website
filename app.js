const DAY = 24 * 60 * 60 * 1000;

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  activePropertyId: null,
  activeJourney: "compliance",
  activeStep: 0,
  activeDashboardPanel: "check",
  currentUserId: null,
  journeyContext: null,
  currentRecommendations: [],
  uploadContext: {
    category: "other",
    label: "Property evidence",
    prompt: "Upload documents for this property",
    source: "dashboard"
  },
  setup: {
    mode: "create",
    isOpen: true,
    postcode: "",
    searchDone: false,
    selectedAddressId: "",
    pendingPropertyId: null,
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
    keyPresent: false,
    key: ""
  },
  saveStatus: "Not saved yet",
  saveTone: "idle"
};

const WORKSPACE_TABLE = "cmp_property_compliance_workspaces";
const AI_PREF_TABLE = "cmp_ai_preferences";
const LOCAL_WORKSPACE_STORAGE_PREFIX = "cmp_compliance_workspaces::";
const LOCAL_AI_PREF_STORAGE = "cmp_ai_preferences";
const AI_KEY_STORAGE = "cmp_document_ai_key";
const ONBOARDING_STORAGE = "cmp_onboarding_complete";
const EPC_TOKEN_STORAGE = "cmp_epc_bearer_token";
const POSTCODES_IO_BASE = "https://api.postcodes.io";
const EPC_API_BASE = "https://api.get-energy-performance-data.communities.gov.uk/api/domestic";
const DOCUMENT_AI_MODEL = "gpt-4o-mini";
const DEMO_MODE = window.CMP_DEMO_MODE !== false;
const DEMO_STUDIO_STORAGE = "cmp_demo_scenario";
let workspaceSaveTimer = null;

const DEMO_SCENARIOS = {
  demo_property: {
    label: "Demo property",
    entryService: "full_compliance",
    focusMode: "full_compliance",
    postcode: "B14 7RZ",
    title: "General landlord demo"
  },
  epc_only: {
    label: "EPC journey",
    entryService: "epc",
    focusMode: "service_only",
    postcode: "B29 6HH",
    title: "EPC-first demo"
  },
  full_compliance: {
    label: "Full compliance",
    entryService: "full_compliance",
    focusMode: "full_compliance",
    postcode: "B37 7BA",
    title: "Full property check demo"
  },
  eviction: {
    label: "Eviction evidence",
    entryService: "eviction",
    focusMode: "full_compliance",
    postcode: "CV1 3BJ",
    title: "Possession evidence pack demo"
  },
  mould: {
    label: "Mould case",
    entryService: "mould",
    focusMode: "related_checks",
    postcode: "B16 8TL",
    title: "Mould and repair timeline demo"
  }
};

const DEMO_ADDRESS_TEMPLATES = [
  { houseNumber: "18", roadName: "Willow Brook Drive", city: "Birmingham", type: "Semi-detached house", bedrooms: 3, storeys: 2, rating: "C", currentScore: 72, potential: "B", potentialScore: 83, hasGas: true, fixedCombustion: true },
  { houseNumber: "Flat 3", roadName: "Cedar Court", city: "Birmingham", type: "Flat", bedrooms: 2, storeys: 1, rating: "D", currentScore: 61, potential: "C", potentialScore: 74, hasGas: true, fixedCombustion: false },
  { houseNumber: "44", roadName: "Maple Avenue", city: "Birmingham", type: "Terraced house", bedrooms: 3, storeys: 2, rating: "", currentScore: null, potential: "", potentialScore: null, hasGas: true, fixedCombustion: true },
  { houseNumber: "2", roadName: "Oakfield Mews", city: "Birmingham", type: "Maisonette", bedrooms: 1, storeys: 1, rating: "B", currentScore: 82, potential: "A", potentialScore: 91, hasGas: false, fixedCombustion: false },
  { houseNumber: "91", roadName: "Station Road", city: "Birmingham", type: "Detached house", bedrooms: 4, storeys: 2, rating: "E", currentScore: 49, potential: "C", potentialScore: 69, hasGas: true, fixedCombustion: true }
];

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

const evidenceTypes = [
  { category: "epc", key: "epc", title: "EPC evidence", icon: "leaf", evaluationKey: "epc" },
  { category: "gas", key: "gas", title: "Gas Safety evidence", icon: "flame", evaluationKey: "gas" },
  { category: "eicr", key: "eicr", title: "EICR evidence", icon: "zap", evaluationKey: "eicr" },
  { category: "alarms", key: "alarm", title: "Alarm evidence", icon: "bell-ring", evaluationKey: "alarms" },
  { category: "tenancy", key: "tenancy", title: "Tenancy agreement", icon: "file-text", evaluationKey: "tenancy" },
  { category: "deposit", key: "deposit", title: "Deposit protection proof", icon: "wallet-cards", evaluationKey: "deposit" },
  { category: "prescribed_info", key: "prescribed_info", title: "Prescribed information proof", icon: "file-badge-2", evaluationKey: "deposit" },
  { category: "licensing", key: "licensing", title: "Licensing evidence", icon: "badge-check", evaluationKey: "licensing" },
  { category: "inspections", key: "inspection", title: "Inspection evidence", icon: "clipboard-list", evaluationKey: "inspections" },
  { category: "eviction_notices", key: "notice", title: "Notices and possession records", icon: "scale", evaluationKey: "possession" },
  { category: "tenant_communications", key: "tenant_communications", title: "Tenant communications", icon: "messages-square", evaluationKey: "tenancy" },
  { category: "mould_damp", key: "mould_damp", title: "Mould and damp evidence", icon: "droplets", evaluationKey: "inspections" },
  { category: "repairs", key: "repairs", title: "Repair and maintenance record", icon: "wrench", evaluationKey: "inspections" },
  { category: "other", key: "other", title: "Other compliance evidence", icon: "folder", evaluationKey: null },
  { category: "irrelevant", key: "irrelevant", title: "Ignored or irrelevant files", icon: "circle-off", evaluationKey: null }
];

const SERVICE_KEY_META = {
  epc: { title: "EPC", uploadCategory: "epc", sectionId: "epc", panelTarget: "requirements" },
  gas: { title: "Gas Safety", uploadCategory: "gas", sectionId: "gas", panelTarget: "check" },
  eicr: { title: "EICR", uploadCategory: "eicr", sectionId: "eicr", panelTarget: "check" },
  inspection: { title: "Inspection", uploadCategory: "inspections", sectionId: "inspections", panelTarget: "check" },
  licensing: { title: "Licensing", uploadCategory: "licensing", sectionId: "licensing", panelTarget: "check" },
  eviction_pack: { title: "Possession evidence pack", uploadCategory: "eviction_notices", sectionId: "eviction_evidence", panelTarget: "evidence" },
  mould_damp: { title: "Mould and damp record", uploadCategory: "mould_damp", sectionId: "mould_damp", panelTarget: "evidence" },
  evidence_pack: { title: "Evidence pack", uploadCategory: "other", sectionId: "evidence_pack", panelTarget: "evidence" },
  insurance: { title: "Landlord insurance", uploadCategory: "insurance", sectionId: "evidence_pack", panelTarget: "services" },
  aml: { title: "AML workflow", uploadCategory: "aml", sectionId: "property_basics", panelTarget: "services" },
  mortgage: { title: "Mortgage support", uploadCategory: "other", sectionId: "property_basics", panelTarget: "services" }
};

const properties = [];

const STATUS_META = {
  ok: { label: "Compliant", tone: "ok", severity: "ok", score: 1, rank: 7 },
  warning: { label: "Needs Attention", tone: "warning", severity: "warning", score: 0.62, rank: 4 },
  critical: { label: "Serious Issue", tone: "critical", severity: "critical", score: 0.1, rank: 1 },
  missing: { label: "Evidence Missing", tone: "missing", severity: "warning", score: 0.38, rank: 3 },
  unknown: { label: "Not Checked Yet", tone: "unknown", severity: "setup", score: null, rank: 5 },
  not_applicable: { label: "Not Applicable", tone: "na", severity: "na", score: null, rank: 8 },
  setup_needed: { label: "Setup Needed", tone: "unknown", severity: "setup", score: null, rank: 6 },
  review_needed: { label: "Review Needed", tone: "warning", severity: "warning", score: null, rank: 5.5 },
  completed: { label: "Recorded", tone: "ok", severity: "ok", score: null, rank: 7 },
  upcoming: { label: "Upcoming", tone: "warning", severity: "warning", score: null, rank: 2.5 },
  expired: { label: "Expired", tone: "critical", severity: "critical", score: 0, rank: 0 },
  expiring_soon: { label: "Expiring Soon", tone: "warning", severity: "warning", score: 0.5, rank: 2 }
};

const JOURNEY_PRESETS = {
  full_compliance: {
    primaryFocus: "full_compliance",
    dashboardJourney: "compliance",
    defaultPanel: "check",
    defaultStep: 0,
    visibleModules: ["requirements", "check", "az", "evidence", "services"],
    secondaryModules: ["requirements", "az", "evidence", "services"],
    primaryKeys: ["epc", "gas", "eicr", "alarms", "deposit", "tenancy", "licensing", "inspections"],
    secondaryKeys: ["rent", "possession"],
    journeyLabel: "Property compliance setup",
    journeyTitle: "Property compliance setup",
    journeyIntro: "Answer the key checks so CMP can build a clearer compliance picture.",
    priorityTitle: "Work through the next checks",
    priorityHelper: "Start with the first answer or action. CMP will widen the compliance picture as the property record becomes clearer.",
    assistantHeadline: "Guide the whole property, not just one document",
    assistantCopy: "CMP can work across certificates, alarms, tenancy evidence, licensing, inspections, and document storage once the base property facts are confirmed."
  },
  epc_only: {
    primaryFocus: "epc",
    dashboardJourney: "certificate",
    defaultPanel: "requirements",
    defaultStep: 0,
    visibleModules: ["requirements", "evidence", "services", "check"],
    secondaryModules: ["evidence", "services", "check"],
    primaryKeys: ["epc"],
    secondaryKeys: ["licensing", "inspections"],
    journeyLabel: "EPC check",
    journeyTitle: "EPC check for this property",
    journeyIntro: "Start with the EPC rating, expiry date, and any renewal actions.",
    priorityTitle: "Start with the EPC record",
    priorityHelper: "CMP keeps the EPC and related proof front and centre without turning every unknown item into a service push.",
    assistantHeadline: "Keep this journey EPC-led",
    assistantCopy: "CMP should focus on EPC status, expiry, and certificate evidence first. Wider compliance checks can wait unless a known serious issue appears."
  },
  epc_related: {
    primaryFocus: "epc",
    dashboardJourney: "certificate",
    defaultPanel: "requirements",
    defaultStep: 0,
    visibleModules: ["requirements", "check", "evidence", "services", "az"],
    secondaryModules: ["check", "evidence", "services", "az"],
    primaryKeys: ["epc"],
    secondaryKeys: ["gas", "eicr", "alarms", "licensing", "inspections"],
    journeyLabel: "EPC and related checks",
    journeyTitle: "Start with the EPC, then widen the checks",
    journeyIntro: "Use the EPC data as the starting point, then confirm the related safety and evidence checks that usually follow.",
    priorityTitle: "Use the EPC as the first anchor",
    priorityHelper: "CMP keeps the EPC first, then moves into the related checks that matter once the register record is confirmed.",
    assistantHeadline: "Use the EPC record to open the wider journey",
    assistantCopy: "The EPC record can seed the property setup. CMP then guides the next checks without asking for data the EPC already provided."
  },
  gas_only: {
    primaryFocus: "gas",
    dashboardJourney: "certificate",
    defaultPanel: "check",
    defaultStep: 1,
    visibleModules: ["check", "requirements", "evidence", "services"],
    secondaryModules: ["requirements", "evidence", "services"],
    primaryKeys: ["gas"],
    secondaryKeys: ["alarms", "tenancy"],
    journeyLabel: "Gas Safety check",
    journeyTitle: "Gas Safety check",
    journeyIntro: "Upload or confirm the current Gas Safety Certificate so CMP can track the renewal.",
    priorityTitle: "Gas first",
    priorityHelper: "CMP keeps this journey focused on the Gas Safety Certificate, service proof, and the next renewal date.",
    assistantHeadline: "Keep this property gas-led",
    assistantCopy: "CMP should focus on whether gas applies, whether the certificate is current, and whether the tenant service proof is stored."
  },
  eicr_only: {
    primaryFocus: "eicr",
    dashboardJourney: "certificate",
    defaultPanel: "check",
    defaultStep: 2,
    visibleModules: ["check", "requirements", "evidence", "services"],
    secondaryModules: ["requirements", "evidence", "services"],
    primaryKeys: ["eicr"],
    secondaryKeys: ["alarms", "tenancy"],
    journeyLabel: "Electrical Safety check",
    journeyTitle: "Electrical Safety check",
    journeyIntro: "Upload or confirm the current EICR so CMP can track the inspection cycle and any follow-up evidence.",
    priorityTitle: "Lead with the EICR",
    priorityHelper: "CMP keeps the EICR and related electrical evidence ahead of unrelated services.",
    assistantHeadline: "Keep this journey electrical-led",
    assistantCopy: "CMP should focus on the EICR issue date, result, and supporting evidence before widening into other checks."
  },
  eviction: {
    primaryFocus: "eviction",
    dashboardJourney: "tenancy",
    defaultPanel: "evidence",
    defaultStep: 4,
    visibleModules: ["evidence", "requirements", "services", "check", "az"],
    secondaryModules: ["requirements", "services", "check", "az"],
    primaryKeys: ["tenancy", "deposit", "epc", "gas", "eicr", "possession"],
    secondaryKeys: ["licensing", "inspections"],
    journeyLabel: "Possession preparation",
    journeyTitle: "Possession preparation evidence pack",
    journeyIntro: "Organise the documents and timeline you may need before taking next steps.",
    priorityTitle: "Build the evidence pack first",
    priorityHelper: "CMP should prioritise tenancy, deposit, served-document, certificate, and notice evidence before any booking-heavy recommendations.",
    assistantHeadline: "Prepare proof before action",
    assistantCopy: "CMP should help organise tenancy documents, deposit evidence, certificates, notices, and timeline evidence before a possession process moves further."
  },
  mould: {
    primaryFocus: "mould",
    dashboardJourney: "issue",
    defaultPanel: "evidence",
    defaultStep: 5,
    visibleModules: ["evidence", "requirements", "services", "check"],
    secondaryModules: ["requirements", "services", "check"],
    primaryKeys: ["inspections", "tenancy", "alarms"],
    secondaryKeys: ["gas", "eicr", "licensing"],
    journeyLabel: "Mould and damp",
    journeyTitle: "Mould and damp evidence trail",
    journeyIntro: "Track inspections, repair history, tenant communications, and any linked safety or compliance risk.",
    priorityTitle: "Start with the inspection and evidence trail",
    priorityHelper: "CMP should emphasise reports, maintenance history, and communications instead of turning this into a generic certificate journey.",
    assistantHeadline: "Make this evidence-led",
    assistantCopy: "CMP should keep inspection notes, maintenance history, and tenant communications easy to review alongside any linked compliance gaps."
  },
  evidence_pack: {
    primaryFocus: "evidence_pack",
    dashboardJourney: "upload",
    defaultPanel: "evidence",
    defaultStep: 4,
    visibleModules: ["evidence", "services", "requirements", "check", "az"],
    secondaryModules: ["services", "requirements", "check", "az"],
    primaryKeys: ["tenancy", "deposit", "epc", "gas", "eicr", "licensing", "inspections", "possession"],
    secondaryKeys: ["alarms", "rent"],
    journeyLabel: "Evidence pack",
    journeyTitle: "Property evidence pack setup",
    journeyIntro: "Upload documents, organise the property record, and fill the known evidence gaps.",
    priorityTitle: "Turn the document pile into an organised pack",
    priorityHelper: "CMP keeps uploads, scanned evidence, and missing proof in front so the property pack becomes usable.",
    assistantHeadline: "Start with the documents",
    assistantCopy: "CMP should focus on getting certificates, tenancy papers, notices, and inspection proof into one usable evidence pack."
  },
  inspection: {
    primaryFocus: "inspection",
    dashboardJourney: "certificate",
    defaultPanel: "evidence",
    defaultStep: 5,
    visibleModules: ["evidence", "requirements", "services", "check"],
    secondaryModules: ["requirements", "services", "check"],
    primaryKeys: ["inspections", "alarms"],
    secondaryKeys: ["gas", "eicr", "tenancy"],
    journeyLabel: "Inspection check",
    journeyTitle: "Property inspection follow-up",
    journeyIntro: "Start with the latest inspection evidence, then confirm the follow-up actions and supporting proof.",
    priorityTitle: "Inspection evidence first",
    priorityHelper: "CMP should keep condition reports, alarm proof, and follow-up evidence ahead of unrelated bookings.",
    assistantHeadline: "Use the inspection record as the anchor",
    assistantCopy: "CMP should focus on the latest inspection, what it found, and what evidence still needs to be stored."
  },
  licensing: {
    primaryFocus: "licensing",
    dashboardJourney: "certificate",
    defaultPanel: "requirements",
    defaultStep: 5,
    visibleModules: ["requirements", "services", "evidence", "check"],
    secondaryModules: ["services", "evidence", "check"],
    primaryKeys: ["licensing"],
    secondaryKeys: ["inspections", "tenancy"],
    journeyLabel: "Licensing check",
    journeyTitle: "Selective licensing check",
    journeyIntro: "Confirm the local licensing position, then store the council evidence and expiry dates that matter.",
    priorityTitle: "Check the council position first",
    priorityHelper: "CMP should focus on licensing triggers, evidence, and renewal dates before broader compliance tasks.",
    assistantHeadline: "Keep this licensing-led",
    assistantCopy: "CMP should keep local authority checks, licence evidence, and renewal dates in view before widening into other areas."
  },
  aml: {
    primaryFocus: "aml",
    dashboardJourney: "compliance",
    defaultPanel: "services",
    defaultStep: 0,
    visibleModules: ["services", "requirements", "evidence"],
    secondaryModules: ["requirements", "evidence"],
    primaryKeys: ["tenancy"],
    secondaryKeys: ["deposit"],
    journeyLabel: "AML checks",
    journeyTitle: "Landlord AML checks",
    journeyIntro: "This journey is prepared for a later pass. For now CMP can still organise the property evidence and compliance basics.",
    priorityTitle: "AML-specific workflow prepared",
    priorityHelper: "Use the property record and evidence pack now. The dedicated AML journey still needs a fuller implementation.",
    assistantHeadline: "This journey is prepared, not complete",
    assistantCopy: "CMP can still organise property evidence and core checks, but a dedicated AML workflow will need a later pass."
  },
  rent_guarantee: {
    primaryFocus: "rent_guarantee",
    dashboardJourney: "compliance",
    defaultPanel: "services",
    defaultStep: 4,
    visibleModules: ["services", "evidence", "requirements"],
    secondaryModules: ["evidence", "requirements"],
    primaryKeys: ["tenancy", "deposit", "inspections"],
    secondaryKeys: ["epc", "gas", "eicr"],
    journeyLabel: "Rent guarantee",
    journeyTitle: "Rent guarantee readiness",
    journeyIntro: "This journey is prepared for later. CMP can still organise the core property evidence needed for a cleaner tenancy record.",
    priorityTitle: "Prepare the property record",
    priorityHelper: "A dedicated rent guarantee flow is still to come. For now CMP can organise the tenancy and compliance evidence that usually matters first.",
    assistantHeadline: "Prepared for a later pass",
    assistantCopy: "CMP can still keep tenancy evidence and property compliance organised while the dedicated rent guarantee journey remains unbuilt."
  },
  insurance: {
    primaryFocus: "insurance",
    dashboardJourney: "compliance",
    defaultPanel: "services",
    defaultStep: 0,
    visibleModules: ["services", "evidence", "requirements"],
    secondaryModules: ["evidence", "requirements"],
    primaryKeys: ["inspections", "epc", "gas", "eicr"],
    secondaryKeys: ["tenancy"],
    journeyLabel: "Landlord insurance",
    journeyTitle: "Landlord insurance readiness",
    journeyIntro: "This journey is prepared for later. CMP can still organise the property evidence and safety record the insurer may ask about.",
    priorityTitle: "Organise the evidence base",
    priorityHelper: "A dedicated insurance workflow is still to come. For now CMP keeps the safety and evidence record easier to review.",
    assistantHeadline: "Prepared for a later pass",
    assistantCopy: "CMP can still organise evidence and compliance history while the dedicated insurance journey is still queued."
  },
  mortgage: {
    primaryFocus: "mortgage",
    dashboardJourney: "compliance",
    defaultPanel: "services",
    defaultStep: 0,
    visibleModules: ["services", "requirements", "evidence"],
    secondaryModules: ["requirements", "evidence"],
    primaryKeys: ["epc", "inspections"],
    secondaryKeys: ["gas", "eicr"],
    journeyLabel: "Mortgages",
    journeyTitle: "Mortgage and property record",
    journeyIntro: "This journey is prepared for later. CMP can still keep the property facts, EPC, and supporting evidence organised.",
    priorityTitle: "Keep the property record ready",
    priorityHelper: "A dedicated mortgage workflow is still to come. For now the property facts and evidence pack remain the useful foundation.",
    assistantHeadline: "Prepared for a later pass",
    assistantCopy: "CMP can still organise the property facts and evidence while the mortgage-specific workflow is left for a later build."
  }
};

const GUIDED_JOURNEY_SECTIONS = [
  {
    id: "property_basics",
    icon: "home",
    title: "Property basics",
    intro: "Start with the property profile so CMP can decide which checks matter.",
    summaryTitle: "Confirm the base property facts",
    nextAction: "Confirm the property profile and tenancy status.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "related",
      epc_related: "related",
      gas_only: "related",
      eicr_only: "related",
      eviction: "required",
      mould: "related",
      evidence_pack: "related",
      inspection: "related",
      licensing: "related"
    },
    journeyPriority: {
      full_compliance: 10,
      epc_only: 30,
      epc_related: 25,
      gas_only: 30,
      eicr_only: 30,
      eviction: 10,
      mould: 15,
      evidence_pack: 25,
      inspection: 25,
      licensing: 25
    },
    questions: [
      { id: "journey_entry", type: "info", source: "journey", label: "Current journey" },
      { id: "property_type", type: "select", field: "type", label: "Property type", options: ["Single let house", "Flat", "HMO", "Student let", "Short let"], hint: "Only add this once the property type is confirmed." },
      { id: "bedrooms", type: "number", field: "bedrooms", label: "Bedrooms", hint: "Leave this blank until the bedroom count is confirmed." },
      { id: "storeys", type: "number", field: "storeys", label: "Storeys", hint: "Only add this once the storey count is confirmed." },
      { id: "tenancy_status", type: "toggle", field: "tenancy.currentlyTenanted", label: "Is the property currently tenanted?", allowNa: true, hint: "This decides whether tenancy evidence needs to be checked now." }
    ]
  },
  {
    id: "epc",
    icon: "leaf",
    title: "EPC",
    intro: "Use EPC register data where it already exists, then only ask what still needs a human decision.",
    summaryTitle: "Check the EPC record first",
    nextAction: "Confirm whether the current EPC record is enough or whether renewal work is needed.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "required",
      epc_related: "required",
      gas_only: "related",
      eicr_only: "related",
      eviction: "required",
      mould: "optional",
      evidence_pack: "related",
      inspection: "optional",
      licensing: "related"
    },
    journeyPriority: {
      full_compliance: 20,
      epc_only: 10,
      epc_related: 10,
      gas_only: 60,
      eicr_only: 60,
      eviction: 30,
      mould: 70,
      evidence_pack: 40,
      inspection: 70,
      licensing: 35
    },
    questions: [
      { id: "epc_rating", type: "display", field: "epc.rating", label: "Current EPC rating", sourceLabel: "EPC register", emptyText: "No EPC rating recorded yet." },
      { id: "epc_expiry", type: "display", field: "epc.expiry", label: "EPC expiry", sourceLabel: "EPC register", emptyText: "No EPC expiry recorded yet.", formatter: "date" },
      { id: "epc_certificate", type: "display", field: "epc.certificate", label: "Certificate reference", sourceLabel: "EPC register", emptyText: "No certificate reference recorded yet." },
      { id: "epc_follow_up", type: "select_az", answerKey: "epc_follow_up", label: "What do you want to do with the EPC?", options: ["", "Keep current EPC", "Review EPC expiry", "Arrange EPC renewal"], hint: "This helps CMP keep the summary focused on your next step." },
      { id: "epc_upload", type: "upload", evidenceKey: "epc", uploadCategory: "epc", label: "Upload EPC certificate", hint: "Prototype only: uploads and scan results stay in this browser/session flow." }
    ]
  },
  {
    id: "gas",
    icon: "flame",
    title: "Gas Safety",
    intro: "Confirm whether gas applies first. If it does, CMP can track the certificate and tenant evidence.",
    summaryTitle: "Check the Gas Safety record",
    nextAction: "Confirm whether gas applies, then add the certificate details if it does.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "required",
      eicr_only: "optional",
      eviction: "required",
      mould: "related",
      evidence_pack: "related",
      inspection: "related",
      licensing: "optional"
    },
    journeyPriority: {
      full_compliance: 30,
      epc_only: 70,
      epc_related: 30,
      gas_only: 10,
      eicr_only: 70,
      eviction: 40,
      mould: 55,
      evidence_pack: 45,
      inspection: 55,
      licensing: 65
    },
    questions: [
      { id: "has_gas", type: "toggle", field: "hasGas", label: "Does the property have gas appliances?", allowNa: true, hint: "If gas does not apply, CMP will stop pushing this section." },
      { id: "gas_issue", type: "date", field: "gas.issue", label: "Gas certificate issue date", hint: "Annual renewal is tracked from this date.", when: (property) => property.hasGas === true },
      { id: "gas_engineer", type: "text", field: "gas.engineer", label: "Engineer or registration note", hint: "Useful if the scan found the certificate but not every detail.", when: (property) => property.hasGas === true },
      { id: "gas_served", type: "toggle", field: "tenancy.gasServed", label: "Was the Gas Safety Certificate given to the tenant?", allowNa: true, hint: "Only confirm this if the property is tenanted.", when: (property) => property.hasGas === true && property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "gas_upload", type: "upload", evidenceKey: "gas", uploadCategory: "gas", label: "Upload Gas Safety Certificate", when: (property) => property.hasGas !== false && property.hasGas !== "na" }
    ]
  },
  {
    id: "eicr",
    icon: "zap",
    title: "Electrical Safety",
    intro: "Track the current EICR, result, and any tenant evidence without repeating what is already known.",
    summaryTitle: "Check the EICR",
    nextAction: "Add or confirm the EICR date and result.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "optional",
      eicr_only: "required",
      eviction: "required",
      mould: "related",
      evidence_pack: "related",
      inspection: "related",
      licensing: "optional"
    },
    journeyPriority: {
      full_compliance: 40,
      epc_only: 75,
      epc_related: 35,
      gas_only: 75,
      eicr_only: 10,
      eviction: 45,
      mould: 60,
      evidence_pack: 50,
      inspection: 50,
      licensing: 70
    },
    questions: [
      { id: "eicr_issue", type: "date", field: "eicr.issue", label: "EICR issue date", hint: "CMP tracks the five-year cycle from this date." },
      { id: "eicr_result", type: "select", field: "eicr.result", label: "EICR result", options: ["Satisfactory", "Unsatisfactory", "Remedial works completed"], hint: "Only add the result if it is clearly known." },
      { id: "eicr_served", type: "toggle", field: "tenancy.eicrServed", label: "Was the EICR given to the tenant?", allowNa: true, hint: "Only confirm this if the property is tenanted.", when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "eicr_upload", type: "upload", evidenceKey: "eicr", uploadCategory: "eicr", label: "Upload EICR" }
    ]
  },
  {
    id: "alarms",
    icon: "bell-ring",
    title: "Alarms",
    intro: "Keep the alarm questions factual. Unknown stays unknown until the landlord confirms it.",
    summaryTitle: "Confirm alarm coverage",
    nextAction: "Confirm smoke and CO alarm coverage, then add any evidence you have.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "related",
      eicr_only: "related",
      eviction: "related",
      mould: "related",
      evidence_pack: "related",
      inspection: "required",
      licensing: "optional"
    },
    journeyPriority: {
      full_compliance: 50,
      epc_only: 80,
      epc_related: 40,
      gas_only: 40,
      eicr_only: 40,
      eviction: 60,
      mould: 50,
      evidence_pack: 55,
      inspection: 20,
      licensing: 80
    },
    questions: [
      { id: "smoke_alarms", type: "toggle", field: "alarms.smokeEachStorey", label: "Smoke alarm on each storey used as living accommodation?", allowNa: true },
      { id: "fixed_combustion", type: "toggle", field: "fixedCombustion", label: "Any fixed combustion appliance, excluding gas cookers?", allowNa: true },
      { id: "co_alarms", type: "toggle", field: "alarms.coAlarm", label: "CO alarm present where required?", allowNa: true, when: (property) => property.fixedCombustion !== false && property.fixedCombustion !== "na" },
      { id: "alarms_tested", type: "toggle", field: "alarms.testedAtStart", label: "Alarms tested at tenancy start?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "alarm_upload", type: "upload", evidenceKey: "alarm", uploadCategory: "alarms", label: "Upload alarm photos or report" }
    ]
  },
  {
    id: "tenancy_deposit",
    icon: "file-text",
    title: "Tenancy and deposit",
    intro: "Only ask tenancy and deposit questions when they matter. Unknown should stay neutral until confirmed.",
    summaryTitle: "Build the tenancy evidence trail",
    nextAction: "Confirm the tenancy documents and deposit evidence that apply.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "optional",
      gas_only: "optional",
      eicr_only: "optional",
      eviction: "required",
      mould: "related",
      evidence_pack: "required",
      inspection: "optional",
      licensing: "optional"
    },
    journeyPriority: {
      full_compliance: 60,
      epc_only: 90,
      epc_related: 85,
      gas_only: 90,
      eicr_only: 90,
      eviction: 20,
      mould: 45,
      evidence_pack: 20,
      inspection: 90,
      licensing: 85
    },
    questions: [
      { id: "tenancy_agreement", type: "toggle", field: "tenancy.agreement", label: "Written tenancy agreement stored?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "how_to_rent", type: "toggle", field: "tenancy.howToRent", label: "How to Rent guide served?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "epc_served", type: "toggle", field: "tenancy.epcServed", label: "EPC served to tenant?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "right_to_rent", type: "toggle", field: "tenancy.rightToRent", label: "Right to Rent check completed?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "deposit_taken", type: "toggle", field: "deposit.taken", label: "Deposit taken?", allowNa: true, when: (property) => property.tenancy?.currentlyTenanted !== false && property.tenancy?.currentlyTenanted !== "na" },
      { id: "deposit_protected", type: "toggle", field: "deposit.protected", label: "Deposit protected?", allowNa: true, when: (property) => property.deposit?.taken === true },
      { id: "prescribed_info", type: "toggle", field: "deposit.prescribedInfo", label: "Prescribed information served?", allowNa: true, when: (property) => property.deposit?.taken === true },
      { id: "tenancy_upload", type: "upload", evidenceKey: "tenancy", uploadCategory: "tenancy", label: "Upload tenancy agreement" },
      { id: "deposit_upload", type: "upload", evidenceKey: "deposit", uploadCategory: "deposit", label: "Upload deposit protection proof", when: (property) => property.deposit?.taken === true },
      { id: "prescribed_upload", type: "upload", evidenceKey: "prescribed_info", uploadCategory: "prescribed_info", label: "Upload prescribed information proof", when: (property) => property.deposit?.taken === true }
    ]
  },
  {
    id: "licensing",
    icon: "badge-check",
    title: "Licensing",
    intro: "Use this section when the council position or licence evidence still needs to be confirmed.",
    summaryTitle: "Check the local licensing position",
    nextAction: "Confirm whether the address needs a licence and store the evidence if it does.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "optional",
      eicr_only: "optional",
      eviction: "related",
      mould: "optional",
      evidence_pack: "related",
      inspection: "optional",
      licensing: "required"
    },
    journeyPriority: {
      full_compliance: 70,
      epc_only: 85,
      epc_related: 50,
      gas_only: 85,
      eicr_only: 85,
      eviction: 55,
      mould: 80,
      evidence_pack: 60,
      inspection: 85,
      licensing: 10
    },
    questions: [
      { id: "licensing_checked", type: "toggle", field: "licensing.localChecked", label: "Local licensing checked?", allowNa: true },
      { id: "hmo_licence", type: "toggle", field: "licensing.hmoLicence", label: "HMO licence evidence stored?", allowNa: true, when: (property) => property.type === "HMO" || property.licensing?.localChecked === true },
      { id: "licence_expiry", type: "date", field: "licensing.licenceExpiry", label: "Licence expiry date", hint: "Optional, but useful for renewal reminders." },
      { id: "licence_upload", type: "upload", evidenceKey: "licence", uploadCategory: "licensing", label: "Upload licensing evidence" }
    ]
  },
  {
    id: "inspections",
    icon: "clipboard-list",
    title: "Inspections and maintenance",
    intro: "Keep the latest inspection date, evidence, and practical notes together.",
    summaryTitle: "Check the inspection trail",
    nextAction: "Add the latest inspection date and any supporting evidence.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "related",
      eicr_only: "related",
      eviction: "related",
      mould: "required",
      evidence_pack: "related",
      inspection: "required",
      licensing: "related"
    },
    journeyPriority: {
      full_compliance: 80,
      epc_only: 95,
      epc_related: 60,
      gas_only: 60,
      eicr_only: 60,
      eviction: 65,
      mould: 20,
      evidence_pack: 35,
      inspection: 10,
      licensing: 55
    },
    questions: [
      { id: "inspection_last", type: "date", field: "inspections.last", label: "Last inspection date", hint: "CMP can remind every six months or on your policy." },
      { id: "repair_notes", type: "text_az", answerKey: "repair_notes", label: "Repair or maintenance notes", hint: "Short notes are enough in this prototype." },
      { id: "inspection_upload", type: "upload", evidenceKey: "inspection", uploadCategory: "inspections", label: "Upload inspection report" }
    ]
  },
  {
    id: "eviction_evidence",
    icon: "scale",
    title: "Possession preparation evidence",
    intro: "This route focuses on proving what was done and when, rather than pushing generic services.",
    summaryTitle: "Build the possession evidence pack",
    nextAction: "Keep the served documents, notices, and communication trail organised before taking next steps.",
    journeyModes: {
      full_compliance: "optional",
      epc_only: "hidden",
      epc_related: "hidden",
      gas_only: "hidden",
      eicr_only: "hidden",
      eviction: "required",
      mould: "optional",
      evidence_pack: "related",
      inspection: "hidden",
      licensing: "hidden"
    },
    journeyPriority: {
      full_compliance: 110,
      eviction: 50,
      mould: 90,
      evidence_pack: 45
    },
    questions: [
      { id: "possession_active", type: "toggle", field: "possession.planned", label: "Is a possession or eviction workflow active?", allowNa: true, hint: "Only confirm this if you are already in that process." },
      { id: "notice_evidence", type: "toggle_az", answerKey: "notice_evidence", label: "Notice evidence organised?", allowNa: true, hint: "CMP stores this in the evidence-pack workflow for now." },
      { id: "tenant_comms", type: "toggle_az", answerKey: "tenant_communications", label: "Tenant communications organised?", allowNa: true },
      { id: "notice_upload", type: "upload", evidenceKey: "notice", uploadCategory: "eviction_notices", label: "Upload notices or possession evidence" },
      { id: "tenant_comms_upload", type: "upload", evidenceKey: "tenant_communications", uploadCategory: "tenant_communications", label: "Upload tenant communications" }
    ]
  },
  {
    id: "mould_damp",
    icon: "droplets",
    title: "Mould and damp",
    intro: "Use this section to keep reports, repairs, and tenant communication together without turning it into a generic certificate flow.",
    summaryTitle: "Build the damp and mould record",
    nextAction: "Keep the report, repair history, and communication trail together.",
    journeyModes: {
      full_compliance: "optional",
      epc_only: "hidden",
      epc_related: "hidden",
      gas_only: "hidden",
      eicr_only: "hidden",
      eviction: "optional",
      mould: "required",
      evidence_pack: "related",
      inspection: "related",
      licensing: "hidden"
    },
    journeyPriority: {
      full_compliance: 120,
      eviction: 85,
      mould: 30,
      evidence_pack: 50,
      inspection: 40
    },
    questions: [
      { id: "mould_report", type: "toggle_az", answerKey: "mould_report", label: "Do you have a damp or mould report?", allowNa: true },
      { id: "repair_history", type: "toggle_az", answerKey: "repair_history", label: "Repair history organised?", allowNa: true },
      { id: "mould_comms", type: "toggle_az", answerKey: "mould_communications", label: "Tenant communications organised?", allowNa: true },
      { id: "mould_upload", type: "upload", evidenceKey: "mould_damp", uploadCategory: "mould_damp", label: "Upload mould report or photos" },
      { id: "repair_upload", type: "upload", evidenceKey: "repairs", uploadCategory: "repairs", label: "Upload repair notes or contractor evidence" },
      { id: "mould_comms_upload", type: "upload", evidenceKey: "tenant_communications", uploadCategory: "tenant_communications", label: "Upload tenant communications" }
    ]
  },
  {
    id: "evidence_pack",
    icon: "folder-check",
    title: "Evidence pack",
    intro: "Use the upload tools and scan preview to turn the document pile into a usable property record.",
    summaryTitle: "Organise the property evidence pack",
    nextAction: "Upload the key documents you already have and use the scan preview to speed up the record.",
    journeyModes: {
      full_compliance: "related",
      epc_only: "optional",
      epc_related: "related",
      gas_only: "related",
      eicr_only: "related",
      eviction: "required",
      mould: "related",
      evidence_pack: "required",
      inspection: "related",
      licensing: "related"
    },
    journeyPriority: {
      full_compliance: 90,
      epc_only: 65,
      epc_related: 65,
      gas_only: 35,
      eicr_only: 35,
      eviction: 60,
      mould: 40,
      evidence_pack: 10,
      inspection: 30,
      licensing: 40
    },
    questions: [
      { id: "evidence_upload", type: "upload", evidenceKey: "all", uploadCategory: "other", label: "Upload property documents", hint: "Prototype only: this uses filename/text heuristics, not production OCR." },
      { id: "evidence_overview", type: "evidence_overview", label: "Evidence gaps" }
    ]
  },
  {
    id: "summary",
    icon: "sparkles",
    title: "Summary",
    intro: "Use the summary to decide what is known, what is still unknown, and what CMP should guide next.",
    summaryTitle: "Review the current compliance picture",
    nextAction: "Use the summary to decide whether you need to answer more questions, upload evidence, or act on a known issue.",
    journeyModes: {
      full_compliance: "required",
      epc_only: "required",
      epc_related: "required",
      gas_only: "required",
      eicr_only: "required",
      eviction: "required",
      mould: "required",
      evidence_pack: "required",
      inspection: "required",
      licensing: "required",
      aml: "required",
      rent_guarantee: "required",
      insurance: "required",
      mortgage: "required"
    },
    journeyPriority: {
      full_compliance: 999,
      epc_only: 999,
      epc_related: 999,
      gas_only: 999,
      eicr_only: 999,
      eviction: 999,
      mould: 999,
      evidence_pack: 999,
      inspection: 999,
      licensing: 999
    },
    questions: []
  }
];

function activeProperty() {
  return properties.find((property) => property.id === state.activePropertyId) || null;
}

function defaultJourneyContext(overrides = {}) {
  return window.CMPJourney?.defaultContext?.(overrides) || {
    entryService: overrides.entryService || "full_compliance",
    focusMode: overrides.focusMode || "full_compliance",
    isTenanted: overrides.isTenanted ?? null,
    selectedPropertyId: overrides.selectedPropertyId || null,
    sourceRoute: overrides.sourceRoute || null,
    answeredQuestions: { ...(overrides.answeredQuestions || {}) },
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || new Date().toISOString()
  };
}

function journeyPresetKey(context = state.journeyContext) {
  const entryService = context?.entryService || "full_compliance";
  const focusMode = context?.focusMode || "full_compliance";
  if (entryService === "epc" && focusMode === "service_only") return "epc_only";
  if (entryService === "epc" && focusMode === "related_checks") return "epc_related";
  if (entryService === "gas") return "gas_only";
  if (entryService === "eicr") return "eicr_only";
  if (entryService === "eviction") return "eviction";
  if (entryService === "mould") return "mould";
  if (entryService === "evidence_pack") return "evidence_pack";
  if (entryService === "inspection") return "inspection";
  if (entryService === "licensing") return "licensing";
  if (entryService === "aml") return "aml";
  if (entryService === "rent_guarantee") return "rent_guarantee";
  if (entryService === "insurance") return "insurance";
  if (entryService === "mortgage") return "mortgage";
  return "full_compliance";
}

function journeyPreset(context = state.journeyContext) {
  return JOURNEY_PRESETS[journeyPresetKey(context)] || JOURNEY_PRESETS.full_compliance;
}

function readJourneyContext(userId = state.currentUserId) {
  return window.CMPJourney?.read?.(userId || null) || null;
}

function writeJourneyContext(context, userId = state.currentUserId) {
  if (!window.CMPJourney?.write) {
    state.journeyContext = defaultJourneyContext(context);
    return state.journeyContext;
  }
  state.journeyContext = window.CMPJourney.write(context, userId || null) || defaultJourneyContext(context);
  return state.journeyContext;
}

function ensureJourneyContext() {
  if (!state.journeyContext) {
    state.journeyContext = readJourneyContext() || defaultJourneyContext();
  }
  return state.journeyContext;
}

function persistJourneyContext(partial = {}, { replace = false } = {}) {
  const current = ensureJourneyContext();
  const next = replace
    ? defaultJourneyContext({ ...current, ...partial })
    : defaultJourneyContext({
        ...current,
        ...partial,
        answeredQuestions: partial.answeredQuestions
          ? { ...(current.answeredQuestions || {}), ...partial.answeredQuestions }
          : current.answeredQuestions
      });
  return writeJourneyContext(next);
}

function loadJourneyContextForSession(userId = null) {
  state.currentUserId = userId || null;
  if (userId && window.CMPJourney?.claimForUser) {
    state.journeyContext = window.CMPJourney.claimForUser(userId) || readJourneyContext(userId) || defaultJourneyContext();
    return state.journeyContext;
  }
  state.journeyContext = readJourneyContext(userId) || defaultJourneyContext();
  return state.journeyContext;
}

function applyJourneySelection(propertyId) {
  state.activePropertyId = propertyId;
  persistJourneyContext({ selectedPropertyId: propertyId });
}

function clearJourneySelection(propertyId = null) {
  const current = ensureJourneyContext();
  if (!propertyId || current.selectedPropertyId === propertyId) {
    persistJourneyContext({ selectedPropertyId: properties[0]?.id || null });
  }
}

function recordJourneyAnswer(field, value) {
  const partial = {
    answeredQuestions: { [field]: value }
  };
  if (field === "tenancy.currentlyTenanted") {
    partial.isTenanted = value === true ? "yes" : value === false ? "no" : value === "na" ? "no" : "unsure";
  }
  persistJourneyContext(partial);
}

function contextForDashboardJourney(journeyId, current = ensureJourneyContext()) {
  const mappings = {
    compliance: { entryService: "full_compliance", focusMode: "full_compliance" },
    certificate: {
      entryService: ["epc", "gas", "eicr", "inspection", "licensing"].includes(current.entryService) ? current.entryService : "epc",
      focusMode: current.focusMode === "related_checks" ? "related_checks" : "service_only"
    },
    upload: { entryService: "evidence_pack", focusMode: "full_compliance" },
    tenancy: { entryService: current.entryService === "eviction" ? "eviction" : "full_compliance", focusMode: "related_checks" },
    issue: {
      entryService: ["eviction", "mould"].includes(current.entryService) ? current.entryService : "full_compliance",
      focusMode: current.entryService === "full_compliance" ? "related_checks" : current.focusMode || "related_checks"
    }
  };
  return mappings[journeyId] || mappings.compliance;
}

function applyJourneyNavigation({ forcePanel = false, forceStep = false } = {}) {
  const preset = journeyPreset();
  state.activeJourney = preset.dashboardJourney;
  if (forcePanel || !preset.visibleModules.includes(state.activeDashboardPanel)) {
    state.activeDashboardPanel = preset.defaultPanel;
  }
  if (forceStep) {
    state.activeStep = preset.defaultStep;
  }
}

function ensureActiveProperty() {
  const selectedFromJourney = state.journeyContext?.selectedPropertyId;
  if (
    !state.activePropertyId
    && selectedFromJourney
    && properties.some((property) => property.id === selectedFromJourney)
  ) {
    state.activePropertyId = selectedFromJourney;
    return;
  }

  if (state.activePropertyId && properties.some((property) => property.id === state.activePropertyId)) {
    return;
  }

  state.activePropertyId = properties[0]?.id || null;
  clearJourneySelection();
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
  const normalized = typeof value === "string" && value.includes("T")
    ? value
    : `${value}T00:00:00`;
  const date = new Date(normalized);
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

function normalizeLookupText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizedAddressKey(address, postcode = "") {
  const normalizedAddress = normalizeLookupText(address);
  const normalizedPostcode = normalizePostcode(postcode);
  return normalizedAddress || normalizedPostcode ? `${normalizedAddress}|${normalizedPostcode}` : "";
}

function normalizeCertificateRef(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function isKnownBoolean(value) {
  return value === true || value === false;
}

function hasMeaningfulValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function statusLabel(status) {
  return STATUS_META[status]?.label || "Check";
}

function statusTone(status) {
  return STATUS_META[status]?.tone || "unknown";
}

function statusScore(status) {
  return STATUS_META[status]?.score ?? null;
}

function statusRank(status) {
  return STATUS_META[status]?.rank ?? 99;
}

function isSetupStatus(status) {
  return status === "unknown" || status === "setup_needed";
}

function isKnownIssueStatus(status) {
  return ["critical", "expired", "warning", "expiring_soon", "missing"].includes(status);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function epcExpiryDate(issueDate, explicitExpiry = "") {
  return explicitExpiry || (issueDate ? addYears(issueDate, 10)?.toISOString().slice(0, 10) || "" : "");
}

function epcStatus(epc = {}) {
  const hasCoreFacts = Boolean(epc.rating || epc.issue || epc.certificate);
  if (!hasCoreFacts) return "unknown";
  if (["F", "G"].includes(epc.rating)) return "critical";
  if (!epc.issue) return "unknown";

  const expiry = dateFrom(epc.expiry);
  if (!expiry) return "unknown";

  const days = daysUntil(expiry);
  if (days < 0) return "expired";
  if (days <= 180) return "expiring_soon";
  return "ok";
}

function certStatus(issue, years, soonDays = 90) {
  if (!issue) {
    return { status: "missing", expiry: null, days: null };
  }
  const expiry = addYears(issue, years);
  const days = daysUntil(expiry);
  if (days < 0) return { status: "expired", expiry, days };
  if (days <= soonDays) return { status: "expiring_soon", expiry, days };
  return { status: "ok", expiry, days };
}

function evaluateProperty(property) {
  const items = [];
  const addItem = (item) => items.push(item);
  const epc = property.epc || {};
  const epcDocument = certStatus(epc.issue, 10, 180);
  const epcState = !epc.rating && !epc.issue && !epc.certificate
    ? "setup_needed"
    : ["F", "G"].includes(epc.rating)
      ? "critical"
      : epc.issue
        ? epcDocument.status
        : "setup_needed";

  addItem({
    key: "epc",
    icon: "leaf",
    title: "EPC",
    status: epcState,
    weight: 1.2,
    due: epc.expiry ? dateFrom(epc.expiry) : epcDocument.expiry,
    setupKey: true,
    scoreRelevant: !isSetupStatus(epcState) && epcState !== "not_applicable",
    recommendationType: isSetupStatus(epcState) ? "check" : isKnownIssueStatus(epcState) ? "book" : "store",
    summary: epcState === "setup_needed"
      ? "EPC not checked yet."
      : epcState === "critical"
        ? `EPC ${epc.rating} may need urgent review.`
        : epcState === "expired"
          ? "The EPC certificate appears to be expired."
          : epcState === "expiring_soon"
            ? "The EPC certificate is approaching expiry."
            : `Rating ${epc.rating}. Certificate ${epc.certificate || "number not recorded"}.`,
    action: epcState === "setup_needed"
      ? "Pull EPC data or upload the latest certificate."
      : epcState === "critical"
        ? "Review the EPC rating and any exemption or improvement work."
        : isKnownIssueStatus(epcState)
          ? "Check whether a new EPC should be arranged."
          : "Keep the EPC in the evidence pack.",
    service: epcState === "setup_needed" ? "Check EPC" : isKnownIssueStatus(epcState) ? "Review EPC" : "Store EPC",
    metrics: [
      epc.rating ? `Rating ${epc.rating}` : "Rating not confirmed",
      epc.expiry ? `Expires ${formatDate(epc.expiry)}` : "Expiry not confirmed",
      epc.potential ? `Potential ${epc.potential}` : "Potential unknown"
    ]
  });

  const gasKnown = isKnownBoolean(property.hasGas);
  if (property.hasGas === "na") {
    addItem({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: "not_applicable",
      weight: 0,
      due: null,
      setupKey: true,
      scoreRelevant: false,
      recommendationType: "optional",
      summary: "Gas Safety does not apply to this property setup.",
      action: "Update this only if the property details change.",
      service: "Property profile",
      metrics: ["Marked not applicable"]
    });
  } else if (!gasKnown) {
    addItem({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: "setup_needed",
      weight: 1.15,
      due: null,
      setupKey: true,
      scoreRelevant: false,
      recommendationType: "check",
      summary: "Gas Safety not checked yet.",
      action: "Confirm whether the property has gas appliances.",
      service: "Check gas setup",
      metrics: ["Gas appliance status unknown"]
    });
  } else if (property.hasGas === false) {
    addItem({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: "not_applicable",
      weight: 0,
      due: null,
      setupKey: true,
      scoreRelevant: false,
      recommendationType: "optional",
      summary: "Gas Safety does not apply because no gas appliances are recorded.",
      action: "Update this only if the property details change.",
      service: "Property profile",
      metrics: ["No gas appliances recorded"]
    });
  } else {
    const gasCert = certStatus(property.gas?.issue, 1, 60);
    addItem({
      key: "gas",
      icon: "flame",
      title: "Gas Safety",
      status: gasCert.status,
      weight: 1.3,
      due: gasCert.expiry,
      setupKey: true,
      scoreRelevant: true,
      recommendationType: gasCert.status === "ok" ? "store" : "book",
      summary: gasCert.status === "missing"
        ? "Gas applies, but the certificate is not recorded."
        : gasCert.status === "expired"
          ? "The Gas Safety Certificate appears to be expired."
          : gasCert.status === "expiring_soon"
            ? "The Gas Safety Certificate is expiring soon."
            : "Gas Safety details are recorded.",
      action: gasCert.status === "ok"
        ? "Keep certificate and service proof in the evidence pack."
        : "Upload the latest certificate or arrange a Gas Safety inspection.",
      service: gasCert.status === "ok" ? "Store Gas Safety" : "Review Gas Safety",
      metrics: [property.gas?.issue ? `Issued ${formatDate(property.gas.issue)}` : "Issue date missing", property.gas?.engineer || "Engineer not recorded"]
    });
  }

  const eicrState = property.eicr?.issue ? certStatus(property.eicr.issue, 5, 120).status : "setup_needed";
  const eicrDue = property.eicr?.issue ? addYears(property.eicr.issue, 5) : null;
  addItem({
    key: "eicr",
    icon: "zap",
    title: "Electrical Safety",
    status: eicrState,
    weight: 1.3,
    due: eicrDue,
    setupKey: true,
    scoreRelevant: !isSetupStatus(eicrState),
    recommendationType: isSetupStatus(eicrState) ? "check" : eicrState === "ok" ? "store" : "book",
    summary: eicrState === "setup_needed"
      ? "Electrical Safety not checked yet."
      : eicrState === "expired"
        ? "The EICR appears to be expired."
        : eicrState === "expiring_soon"
          ? "The EICR is approaching expiry."
          : "Electrical Safety details are recorded.",
    action: eicrState === "setup_needed"
      ? "Upload the current EICR or add the issue date."
      : eicrState === "ok"
        ? "Keep the EICR and remedial evidence stored."
        : "Review the EICR and book follow-up work if needed.",
    service: eicrState === "ok" ? "Store EICR" : isSetupStatus(eicrState) ? "Check EICR" : "Review EICR",
    metrics: [property.eicr?.issue ? `Issued ${formatDate(property.eicr.issue)}` : "Issue date missing", property.eicr?.result || "Result not recorded"]
  });

  const alarmUnknown = [property.alarms?.smokeEachStorey, property.alarms?.testedAtStart].some((value) => value === null)
    || (property.fixedCombustion !== "na" && property.fixedCombustion !== false && property.alarms?.coAlarm === null);
  const alarmProblems = [];
  if (property.alarms?.smokeEachStorey === false) alarmProblems.push("smoke alarm coverage");
  if (property.fixedCombustion === true && property.alarms?.coAlarm === false) alarmProblems.push("CO alarm coverage");
  if (property.alarms?.testedAtStart === false) alarmProblems.push("start-of-tenancy test evidence");
  const alarmsState = alarmProblems.length ? (alarmProblems.length > 1 ? "critical" : "missing") : alarmUnknown ? "setup_needed" : "ok";
  addItem({
    key: "alarms",
    icon: "bell-ring",
    title: "Smoke and CO alarms",
    status: alarmsState,
    weight: 1.05,
    due: null,
    setupKey: true,
    scoreRelevant: !isSetupStatus(alarmsState),
    recommendationType: isSetupStatus(alarmsState) ? "check" : isKnownIssueStatus(alarmsState) ? "book" : "store",
    summary: alarmsState === "setup_needed"
      ? "Alarm coverage has not been confirmed yet."
      : alarmProblems.length
        ? `CMP still needs ${alarmProblems.join(", ")}.`
        : "Alarm coverage and testing are recorded.",
    action: alarmsState === "setup_needed"
      ? "Confirm the smoke and CO alarm details."
      : isKnownIssueStatus(alarmsState)
        ? "Upload alarm evidence or arrange a check."
        : "Keep the latest alarm evidence stored.",
    service: alarmsState === "setup_needed" ? "Check alarms" : isKnownIssueStatus(alarmsState) ? "Review alarms" : "Store alarm proof",
    metrics: [
      hasMeaningfulValue(property.storeys) ? `${property.storeys} storey${property.storeys === 1 ? "" : "s"}` : "Storeys not confirmed",
      property.fixedCombustion === true ? "CO alarm may be required" : property.fixedCombustion === false || property.fixedCombustion === "na" ? "No fixed combustion recorded" : "Combustion status unknown"
    ]
  });

  const deposit = property.deposit || {};
  let depositState = "setup_needed";
  let depositSummary = "Deposit protection has not been checked yet.";
  let depositAction = "Confirm whether a deposit was taken for this tenancy.";
  let depositService = "Check deposit";
  let depositScoreRelevant = false;
  if (deposit.taken === false || deposit.taken === "na") {
    depositState = "not_applicable";
    depositSummary = "Deposit protection does not apply because no deposit is recorded.";
    depositAction = "Update this only if a deposit is taken later.";
    depositService = "Property profile";
  } else if (deposit.taken === true) {
    if (deposit.protected === true && deposit.prescribedInfo === true) {
      depositState = "ok";
      depositSummary = "Deposit protection and prescribed information are recorded.";
      depositAction = "Keep the protection proof in the evidence pack.";
      depositService = "Store deposit proof";
      depositScoreRelevant = true;
    } else if (deposit.protected === false) {
      depositState = "critical";
      depositSummary = "A deposit is recorded, but protection is not confirmed.";
      depositAction = "Review the deposit scheme evidence urgently.";
      depositService = "Review deposit evidence";
      depositScoreRelevant = true;
    } else if (deposit.prescribedInfo === false) {
      depositState = "missing";
      depositSummary = "A deposit is recorded, but prescribed information is missing.";
      depositAction = "Add the prescribed information evidence.";
      depositService = "Review deposit evidence";
      depositScoreRelevant = true;
    } else {
      depositState = "setup_needed";
      depositSummary = "A deposit is recorded, but the protection details are not confirmed yet.";
      depositAction = "Add the deposit scheme and prescribed information details.";
      depositService = "Check deposit";
    }
  }
  addItem({
    key: "deposit",
    icon: "wallet-cards",
    title: "Deposit protection",
    status: depositState,
    weight: 1.1,
    due: null,
    setupKey: true,
    scoreRelevant: depositScoreRelevant,
    recommendationType: isSetupStatus(depositState) ? "check" : isKnownIssueStatus(depositState) ? "book" : depositState === "not_applicable" ? "optional" : "store",
    summary: depositSummary,
    action: depositAction,
    service: depositService,
    metrics: [
      deposit.taken === true ? "Deposit taken" : deposit.taken === false || deposit.taken === "na" ? "No deposit recorded" : "Deposit status unknown",
      deposit.protected === true ? "Protected" : deposit.protected === false ? "Protection not confirmed" : "Protection status unknown"
    ]
  });

  const tenancy = property.tenancy || {};
  let tenancyState = "setup_needed";
  let tenancySummary = "Tenancy status has not been confirmed yet.";
  let tenancyAction = "Confirm whether the property is currently tenanted.";
  let tenancyService = "Check tenancy setup";
  let tenancyScoreRelevant = false;
  const requiredDocs = [
    ["agreement", "tenancy agreement"],
    ["howToRent", "How to Rent guide"],
    ["epcServed", "EPC served"],
    ["rightToRent", "Right to Rent check"],
    ...(property.hasGas === true ? [["gasServed", "Gas Safety served"]] : []),
    ["eicrServed", "EICR served"]
  ];
  if (tenancy.currentlyTenanted === false || tenancy.currentlyTenanted === "na") {
    tenancyState = "not_applicable";
    tenancySummary = "Tenancy document checks will matter when the next tenancy is prepared.";
    tenancyAction = "Use this section when preparing the next tenancy.";
    tenancyService = "Prepare tenancy";
  } else if (tenancy.currentlyTenanted === true) {
    const missingDocs = requiredDocs.filter(([key]) => tenancy[key] === false).map(([, label]) => label);
    const unansweredDocs = requiredDocs.filter(([key]) => tenancy[key] === null).map(([, label]) => label);
    if (missingDocs.length) {
      tenancyState = missingDocs.length >= 3 ? "critical" : "missing";
      tenancySummary = `Still missing: ${missingDocs.join(", ")}.`;
      tenancyAction = "Upload the missing tenancy evidence.";
      tenancyService = "Prepare evidence pack";
      tenancyScoreRelevant = true;
    } else if (unansweredDocs.length) {
      tenancyState = "setup_needed";
      tenancySummary = `Still to confirm: ${unansweredDocs.join(", ")}.`;
      tenancyAction = "Answer the remaining tenancy setup questions.";
      tenancyService = "Check tenancy setup";
    } else {
      tenancyState = "ok";
      tenancySummary = "Core tenancy evidence is recorded.";
      tenancyAction = "Keep the served-document proof linked to the tenancy.";
      tenancyService = "Store tenancy docs";
      tenancyScoreRelevant = true;
    }
  }
  addItem({
    key: "tenancy",
    icon: "file-text",
    title: "Tenancy documents",
    status: tenancyState,
    weight: 1.15,
    due: null,
    setupKey: true,
    scoreRelevant: tenancyScoreRelevant,
    recommendationType: isSetupStatus(tenancyState) ? "check" : isKnownIssueStatus(tenancyState) ? "book" : tenancyState === "not_applicable" ? "optional" : "store",
    summary: tenancySummary,
    action: tenancyAction,
    service: tenancyService,
    metrics: [
      tenancy.currentlyTenanted === true ? "Tenanted" : tenancy.currentlyTenanted === false || tenancy.currentlyTenanted === "na" ? "No active tenancy" : "Tenancy not confirmed",
      `${requiredDocs.filter(([key]) => tenancy[key] === true || tenancy[key] === "na").length}/${requiredDocs.length} confirmed`
    ]
  });

  const licenceExpiry = property.licensing?.licenceExpiry ? dateFrom(property.licensing.licenceExpiry) : null;
  let licensingState = "setup_needed";
  let licensingSummary = "Local licensing has not been confirmed yet.";
  if (property.licensing?.localChecked === false) {
    licensingState = "warning";
    licensingSummary = "Selective or additional licensing has not been confirmed for this address.";
  } else if (property.licensing?.localChecked === true) {
    if (property.type === "HMO" && property.licensing?.hmoLicence === false) {
      licensingState = "critical";
      licensingSummary = "Property is marked as HMO, but no HMO licence evidence is stored.";
    } else if (property.type === "HMO" && property.licensing?.hmoLicence === null) {
      licensingState = "setup_needed";
      licensingSummary = "Property is marked as HMO, but the licence status is not confirmed yet.";
    } else if (licenceExpiry) {
      licensingState = daysUntil(licenceExpiry) < 0 ? "expired" : daysUntil(licenceExpiry) <= 120 ? "expiring_soon" : "ok";
      licensingSummary = licensingState === "expired"
        ? "The recorded licence appears to be expired."
        : licensingState === "expiring_soon"
          ? `Licence expires ${formatRelative(licenceExpiry)}.`
          : "Licensing details are recorded.";
    } else {
      licensingState = "ok";
      licensingSummary = "Local licensing has been checked.";
    }
  }
  addItem({
    key: "licensing",
    icon: "badge-check",
    title: "Licensing",
    status: licensingState,
    weight: 1.05,
    due: licenceExpiry,
    setupKey: true,
    scoreRelevant: !isSetupStatus(licensingState) && licensingState !== "not_applicable",
    recommendationType: isSetupStatus(licensingState) ? "check" : isKnownIssueStatus(licensingState) ? "book" : "store",
    summary: licensingSummary,
    action: licensingState === "ok"
      ? "Keep licence records and council correspondence stored."
      : licensingState === "setup_needed"
        ? "Confirm the council licensing position for this address."
        : "Review local licensing requirements and upload the evidence.",
    service: licensingState === "ok" ? "Store licence" : licensingState === "setup_needed" ? "Check licensing" : "Review licensing",
    metrics: [property.type || "Property type not confirmed", property.licensing?.localChecked === true ? "Council check recorded" : "Council check needed"]
  });

  const inspectionDate = dateFrom(property.inspections?.last);
  const inspectionsState = inspectionDate ? (Math.floor((today - inspectionDate) / DAY) > 180 ? "warning" : "ok") : "setup_needed";
  addItem({
    key: "inspections",
    icon: "clipboard-list",
    title: "Inspections",
    status: inspectionsState,
    weight: 0.7,
    due: inspectionDate ? addMonths(inspectionDate, 6) : null,
    setupKey: true,
    scoreRelevant: !isSetupStatus(inspectionsState),
    recommendationType: isSetupStatus(inspectionsState) ? "check" : isKnownIssueStatus(inspectionsState) ? "book" : "store",
    summary: inspectionsState === "setup_needed"
      ? "Inspection history has not been checked yet."
      : inspectionsState === "warning"
        ? "The latest inspection is getting old."
        : "A recent inspection is recorded.",
    action: inspectionsState === "setup_needed"
      ? "Add the last inspection date or upload the latest report."
      : inspectionsState === "warning"
        ? "Book or upload a fresh condition inspection."
        : "Keep the latest inspection report stored.",
    service: inspectionsState === "ok" ? "Store inspection" : inspectionsState === "setup_needed" ? "Check inspections" : "Review inspection",
    metrics: [inspectionDate ? `Last ${formatDate(inspectionDate)}` : "No inspection date"]
  });

  const rentPlanned = property.rent?.increasePlanned;
  addItem({
    key: "rent",
    icon: "calendar-clock",
    title: "Rent increases",
    status: rentPlanned === true ? "warning" : rentPlanned === false || rentPlanned === "na" ? "not_applicable" : "setup_needed",
    weight: 0.35,
    due: null,
    setupKey: false,
    scoreRelevant: rentPlanned === true,
    recommendationType: rentPlanned === true ? "book" : rentPlanned === false || rentPlanned === "na" ? "optional" : "check",
    summary: rentPlanned === true
      ? "A rent increase is planned and notice evidence should be checked."
      : rentPlanned === false || rentPlanned === "na"
        ? "No rent review is currently active."
        : "Rent review status has not been set yet.",
    action: rentPlanned === true
      ? "Prepare and store the right rent increase evidence."
      : rentPlanned === false || rentPlanned === "na"
        ? "CMP can remind you before the next review."
        : "Set this only when a rent review is in progress.",
    service: rentPlanned === true ? "Prepare rent notice" : rentPlanned === false || rentPlanned === "na" ? "Set reminder" : "Check rent setup",
    metrics: [property.rent?.lastIncrease ? `Last increase ${formatDate(property.rent.lastIncrease)}` : "No increase recorded"]
  });

  const possessionPlanned = property.possession?.planned;
  const blockerCount = items.filter((item) => ["epc", "gas", "deposit", "tenancy", "licensing"].includes(item.key) && isKnownIssueStatus(item.status)).length;
  addItem({
    key: "possession",
    icon: "scale",
    title: "Possession readiness",
    status: possessionPlanned === true ? (blockerCount ? "critical" : "warning") : possessionPlanned === false || possessionPlanned === "na" ? "not_applicable" : "setup_needed",
    weight: possessionPlanned === true ? 1.0 : 0.25,
    due: null,
    setupKey: false,
    scoreRelevant: possessionPlanned === true,
    recommendationType: possessionPlanned === true ? "book" : possessionPlanned === false || possessionPlanned === "na" ? "optional" : "check",
    summary: possessionPlanned === true
      ? blockerCount
        ? `${blockerCount} known issue${blockerCount === 1 ? "" : "s"} may affect possession readiness.`
        : "Core evidence looks ready for review."
      : possessionPlanned === false || possessionPlanned === "na"
        ? "No possession workflow is active."
        : "Possession workflow has not been checked yet.",
    action: possessionPlanned === true
      ? "Build a possession evidence pack before progressing."
      : possessionPlanned === false || possessionPlanned === "na"
        ? "Start this only if a possession process begins."
        : "Set this only if a possession workflow starts.",
    service: possessionPlanned === true ? "Prepare possession pack" : possessionPlanned === false || possessionPlanned === "na" ? "Possession guidance" : "Check possession setup",
    metrics: [possessionPlanned === true ? "Journey active" : "Not active"]
  });

  const totalRequiredChecks = items.filter((item) => item.setupKey).length;
  const knownRequiredChecks = items.filter((item) => item.setupKey && !isSetupStatus(item.status)).length;
  const unknownCount = items.filter((item) => item.setupKey && isSetupStatus(item.status)).length;
  const setupProgress = totalRequiredChecks ? Math.round((knownRequiredChecks / totalRequiredChecks) * 100) : 0;
  const scoreItems = items.filter((item) => item.scoreRelevant && statusScore(item.status) !== null);
  const criticalCount = items.filter((item) => ["critical", "expired"].includes(item.status)).length;
  const warningCount = items.filter((item) => ["warning", "expiring_soon", "missing"].includes(item.status)).length;
  const enoughInfoForScore = knownRequiredChecks >= Math.max(4, Math.ceil(totalRequiredChecks * 0.6)) && scoreItems.length >= 4;
  const totalWeight = scoreItems.reduce((sum, item) => sum + item.weight, 0);
  const weighted = scoreItems.reduce((sum, item) => sum + (statusScore(item.status) * item.weight), 0);
  const score = enoughInfoForScore && totalWeight ? Math.round((weighted / totalWeight) * 100) : null;
  const risk = score === null ? null : criticalCount >= 2 || score < 45 ? "High" : score < 74 || criticalCount ? "Medium" : "Low";
  const assessment = score === null
    ? {
        mode: "setup",
        score: null,
        setupProgress,
        knownRequiredChecks,
        totalRequiredChecks,
        unknownCount,
        criticalCount,
        warningCount,
        summaryTitle: "Setup in progress",
        summaryText: `Answer a few more questions before CMP calculates a compliance score. ${knownRequiredChecks} of ${totalRequiredChecks} key checks are confirmed.`
      }
    : {
        mode: "score",
        score,
        setupProgress,
        knownRequiredChecks,
        totalRequiredChecks,
        unknownCount,
        criticalCount,
        warningCount,
        summaryTitle: criticalCount
          ? `${criticalCount} serious issue${criticalCount === 1 ? "" : "s"} need attention`
          : `${risk} compliance risk`,
        summaryText: criticalCount
          ? "CMP has enough information to calculate a score, and at least one known issue needs attention."
          : "CMP has enough information to calculate a working compliance score for this property."
      };

  return { items, score, risk, criticalCount, assessment };
}

function sortedActions(items) {
  return [...items]
    .filter((item) => item.status !== "ok" && item.status !== "not_applicable")
    .sort((a, b) => {
      const rankDiff = statusRank(a.status) - statusRank(b.status);
      if (rankDiff) return rankDiff;
      const aDays = a.due ? daysUntil(a.due) : 9999;
      const bDays = b.due ? daysUntil(b.due) : 9999;
      return aDays - bDays;
    });
}

function propertyMetadataSummary(property) {
  if (!property) return [];
  const parts = [];
  if (property.type) parts.push(property.type);
  if (hasMeaningfulValue(property.bedrooms)) parts.push(`${property.bedrooms} bedroom${property.bedrooms === 1 ? "" : "s"}`);
  if (hasMeaningfulValue(property.storeys)) parts.push(`${property.storeys} storey${property.storeys === 1 ? "" : "s"}`);
  if (property.epc?.rating) {
    parts.push(`EPC ${property.epc.rating}${hasMeaningfulValue(property.epc.currentScore) ? ` (${property.epc.currentScore})` : ""}`);
  } else if (["unknown", "setup_needed"].includes(property.epc?.status)) {
    parts.push("EPC not confirmed");
  }
  if (property.postcode) parts.push(property.postcode);
  return parts;
}

const PROPERTY_EVIDENCE_CATEGORIES = [
  "epc",
  "gas",
  "eicr",
  "alarms",
  "tenancy",
  "deposit",
  "prescribed_info",
  "licensing",
  "inspections",
  "eviction_notices",
  "tenant_communications",
  "mould_damp",
  "repairs",
  "insurance",
  "aml",
  "other",
  "irrelevant"
];

const EVIDENCE_CATEGORY_ALIASES = {
  epc: "epc",
  gas: "gas",
  eicr: "eicr",
  alarm: "alarms",
  alarms: "alarms",
  tenancy: "tenancy",
  deposit: "deposit",
  prescribed_info: "prescribed_info",
  licence: "licensing",
  licensing: "licensing",
  inspection: "inspections",
  inspections: "inspections",
  notice: "eviction_notices",
  eviction_notices: "eviction_notices",
  tenant_communications: "tenant_communications",
  mould_damp: "mould_damp",
  repairs: "repairs",
  insurance: "insurance",
  aml: "aml",
  other: "other",
  irrelevant: "irrelevant"
};

const LEGACY_DOC_KEY_MAP = {
  epc: "epc",
  gas: "gas",
  eicr: "eicr",
  alarm: "alarms",
  alarms: "alarms",
  tenancy: "tenancy",
  deposit: "deposit",
  licence: "licensing",
  licensing: "licensing",
  inspection: "inspections",
  notice: "eviction_notices"
};

const UPLOAD_CATEGORY_TITLES = {
  epc: "EPC evidence",
  gas: "Gas Safety evidence",
  eicr: "EICR evidence",
  alarms: "Alarm evidence",
  tenancy: "Tenancy documents",
  deposit: "Deposit evidence",
  prescribed_info: "Prescribed information proof",
  licensing: "Licensing evidence",
  inspections: "Inspection evidence",
  eviction_notices: "Notices and possession evidence",
  tenant_communications: "Tenant communications",
  mould_damp: "Mould and damp evidence",
  repairs: "Repair evidence",
  insurance: "Insurance documents",
  aml: "AML documents",
  other: "Other compliance evidence",
  irrelevant: "Irrelevant files"
};

function normalizeEvidenceCategory(category) {
  return EVIDENCE_CATEGORY_ALIASES[category] || "other";
}

function emptyEvidenceBuckets() {
  return PROPERTY_EVIDENCE_CATEGORIES.reduce((buckets, category) => {
    buckets[category] = [];
    return buckets;
  }, {});
}

function ensureEvidenceModel(property) {
  if (!property) return emptyEvidenceBuckets();
  const buckets = emptyEvidenceBuckets();
  const current = property.evidence && typeof property.evidence === "object" ? property.evidence : {};
  PROPERTY_EVIDENCE_CATEGORIES.forEach((category) => {
    const list = Array.isArray(current[category]) ? current[category] : [];
    buckets[category] = list.map((item) => ({
      id: item.id || `${category}:${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`,
      category,
      title: item.title || UPLOAD_CATEGORY_TITLES[category] || titleCase(category),
      source: item.source || "manual",
      filename: item.filename ?? null,
      fileUrl: item.fileUrl ?? null,
      fileStored: Boolean(item.fileStored),
      uploadedAt: item.uploadedAt || null,
      date: item.date || null,
      expiryDate: item.expiryDate || null,
      status: item.status || "unknown",
      confidence: item.confidence || null,
      extractedFacts: item.extractedFacts && typeof item.extractedFacts === "object" ? { ...item.extractedFacts } : {},
      notes: item.notes || null,
      linkedQuestionId: item.linkedQuestionId || null,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
    }));
  });
  property.evidence = buckets;
  return buckets;
}

function evidenceConfidenceLabel(confidence) {
  if (confidence === "high" || confidence === "medium" || confidence === "low") return confidence;
  return null;
}

function evidenceStatusFromDates(date, expiryDate) {
  if (!expiryDate) return date ? "ok" : "unknown";
  const days = daysUntil(expiryDate);
  if (days === null) return date ? "ok" : "unknown";
  if (days < 0) return "expired";
  if (days <= 90) return "expiring_soon";
  return "ok";
}

function sortEvidenceItems(list = []) {
  return [...list].sort((left, right) => {
    const leftRank = STATUS_META[left.status]?.rank ?? -1;
    const rightRank = STATUS_META[right.status]?.rank ?? -1;
    if (rightRank !== leftRank) return rightRank - leftRank;
    return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
  });
}

function bestEvidenceItem(property, category) {
  const items = sortEvidenceItems(evidenceItemsForCategory(property, category));
  return items[0] || null;
}

function evidenceSourceCopy(item) {
  if (!item) return "";
  if (item.source === "api") return "Imported from EPC";
  if (item.source === "upload") return item.fileStored ? "File uploaded" : "File selected in prototype mode";
  if (item.source === "scan") return "Scanned from upload";
  if (item.source === "journey_answer" || item.source === "manual") return "Confirmed by answer";
  return "Property evidence";
}

function evidenceSummaryCopy(item, fallbackStatus = "unknown") {
  const status = item?.status || fallbackStatus;
  if (!item) {
    if (status === "not_applicable") return "Not required for this property right now.";
    if (status === "missing") return "Needs evidence.";
    if (status === "expired") return "Known evidence appears to be expired.";
    if (status === "expiring_soon") return "Known evidence is approaching expiry.";
    return "Not checked yet.";
  }

  if (item.source === "api") {
    const rating = item.extractedFacts?.rating ? `Rating ${item.extractedFacts.rating}` : item.title;
    const expiry = item.expiryDate ? ` · expires ${formatDate(item.expiryDate)}` : "";
    return `${rating}${expiry}`;
  }

  if (item.source === "journey_answer" || item.source === "manual") {
    return item.notes || "Confirmed by answer. Add a file if you want stronger proof.";
  }

  if (item.source === "upload" || item.source === "scan") {
    const issue = item.date ? ` · ${formatDate(item.date)}` : "";
    const filename = item.filename ? `${item.filename}${issue}` : `${item.title}${issue}`;
    return item.status === "review_needed"
      ? `${filename} · Review needed before relying on it`
      : filename;
  }

  return item.notes || item.title;
}

function evidenceCategoryForQuestion(question = {}) {
  return normalizeEvidenceCategory(question.uploadCategory || question.evidenceKey || "other");
}

function uploadContextForTrigger(trigger) {
  const button = trigger?.currentTarget || trigger?.target || trigger;
  const category = normalizeEvidenceCategory(button?.dataset?.uploadCategory || "other");
  return {
    category,
    label: button?.dataset?.uploadLabel || UPLOAD_CATEGORY_TITLES[category] || "Property evidence",
    prompt: button?.dataset?.uploadPrompt || "Upload documents for this property",
    source: button?.dataset?.uploadSource || "dashboard"
  };
}

function evidenceSummaryItems(property, modulePlan, evaluation) {
  const items = [];

  const pushIf = (condition, title, detail, status = "unknown") => {
    if (!condition) return;
    items.push({ title, detail, status });
  };

  const epcEvidence = bestEvidenceItem(property, "epc");
  pushIf(Boolean(epcEvidence), "EPC evidence", evidenceSourceCopy(epcEvidence), epcEvidence.status);

  if (modulePlan.primaryFocus === "eviction") {
    const tenancyEvidence = bestEvidenceItem(property, "tenancy");
    const depositEvidence = bestEvidenceItem(property, "deposit");
    const prescribedEvidence = bestEvidenceItem(property, "prescribed_info");
    const noticeEvidence = bestEvidenceItem(property, "eviction_notices");
    const communications = bestEvidenceItem(property, "tenant_communications");
    pushIf(!tenancyEvidence, "Tenancy agreement", "Evidence not added yet.", "setup_needed");
    pushIf(Boolean(depositEvidence) && depositEvidence.source !== "upload", "Deposit protection", "Confirmed, but no proof uploaded yet.", "review_needed");
    pushIf(!depositEvidence && property.deposit?.protected === true, "Deposit protection", "Confirmed, but no proof uploaded yet.", "review_needed");
    pushIf(!prescribedEvidence && property.deposit?.prescribedInfo === true, "Prescribed information", "Confirmed, but no proof uploaded yet.", "review_needed");
    pushIf(!noticeEvidence, "Notices", "Evidence not added yet.", "setup_needed");
    pushIf(!communications, "Tenant communications", "Evidence not added yet.", "setup_needed");
  }

  if (modulePlan.primaryFocus === "mould") {
    const mouldEvidence = bestEvidenceItem(property, "mould_damp");
    const repairEvidence = bestEvidenceItem(property, "repairs");
    const communications = bestEvidenceItem(property, "tenant_communications");
    pushIf(!mouldEvidence, "Mould or damp report", "Evidence not added yet.", "setup_needed");
    pushIf(!repairEvidence, "Repair history", "Timeline evidence not added yet.", "setup_needed");
    pushIf(!communications, "Tenant communications", "Communication evidence not added yet.", "setup_needed");
  }

  const missingProof = evaluation.items
    .filter((item) => ["missing", "expired", "expiring_soon"].includes(item.status))
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      detail: item.summary,
      status: item.status
    }));

  return [...items, ...missingProof].slice(0, 5);
}

function evidenceActionCandidates(property, modulePlan) {
  if (!property) return [];
  const candidates = [];
  const push = (service, action, recommendationType, category, evidence = null) => {
    candidates.push({
      service,
      action,
      recommendationType,
      key: category,
      status: evidence?.status || "unknown"
    });
  };

  const reviewItems = allEvidenceItems(property)
    .filter((item) => item.status === "review_needed" || item.category === "irrelevant")
    .slice(0, 3);

  reviewItems.forEach((item) => {
    if (item.category === "irrelevant") {
      push("Ignore file", `${item.filename || item.title} looks unrelated to this property.`, "optional", item.category, item);
      return;
    }
    push("Review document", `${item.filename || item.title} was imported in prototype mode and should be reviewed.`, "check", item.category, item);
  });

  if (modulePlan.primaryFocus === "eviction") {
    if (!bestEvidenceItem(property, "eviction_notices")) {
      push("Upload notice", "Add the notice or possession paperwork to the evidence pack.", "check", "eviction_notices");
    }
    if (!bestEvidenceItem(property, "tenant_communications")) {
      push("Upload communications", "Add emails, letters, or call notes for the tenant timeline.", "check", "tenant_communications");
    }
  }

  if (modulePlan.primaryFocus === "mould") {
    if (!bestEvidenceItem(property, "mould_damp")) {
      push("Upload report", "Add the mould report, photos, or inspection notes.", "check", "mould_damp");
    }
    if (!bestEvidenceItem(property, "repairs")) {
      push("Add repair evidence", "Add contractor notes, invoices, or repair updates.", "check", "repairs");
    }
  }

  if (modulePlan.primaryFocus === "evidence_pack" && !bestEvidenceItem(property, "other")) {
    push("Upload documents", "Add the main property document pack for prototype analysis.", "check", "other");
  }

  return candidates.slice(0, 4);
}

function allEvidenceItems(property, { includeIrrelevant = true } = {}) {
  if (!property) return [];
  ensureEvidenceModel(property);
  return PROPERTY_EVIDENCE_CATEGORIES
    .filter((category) => includeIrrelevant || category !== "irrelevant")
    .flatMap((category) => property.evidence[category].map((item) => ({ ...item, category })));
}

function evidenceItemsForCategory(property, category) {
  if (!property) return [];
  ensureEvidenceModel(property);
  return property.evidence[normalizeEvidenceCategory(category)] || [];
}

function findEvidenceItem(property, category, predicate) {
  return evidenceItemsForCategory(property, category).find(predicate) || null;
}

function upsertEvidenceItem(property, category, matcher, patch) {
  ensureEvidenceModel(property);
  const normalizedCategory = normalizeEvidenceCategory(category);
  const bucket = property.evidence[normalizedCategory];
  const now = new Date().toISOString();
  const index = bucket.findIndex((item) => matcher(item));
  if (index >= 0) {
    bucket[index] = {
      ...bucket[index],
      ...patch,
      category: normalizedCategory,
      updatedAt: now
    };
    return bucket[index];
  }
  const next = {
    id: patch.id || `${normalizedCategory}:${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`,
    category: normalizedCategory,
    title: patch.title || UPLOAD_CATEGORY_TITLES[normalizedCategory] || titleCase(normalizedCategory),
    source: patch.source || "manual",
    filename: patch.filename ?? null,
    fileUrl: patch.fileUrl ?? null,
    fileStored: Boolean(patch.fileStored),
    uploadedAt: patch.uploadedAt || null,
    date: patch.date || null,
    expiryDate: patch.expiryDate || null,
    status: patch.status || "unknown",
    confidence: patch.confidence || null,
    extractedFacts: patch.extractedFacts && typeof patch.extractedFacts === "object" ? { ...patch.extractedFacts } : {},
    notes: patch.notes || null,
    linkedQuestionId: patch.linkedQuestionId || null,
    createdAt: patch.createdAt || now,
    updatedAt: patch.updatedAt || now
  };
  bucket.unshift(next);
  return next;
}

function removeEvidenceItem(property, category, matcher) {
  ensureEvidenceModel(property);
  const normalizedCategory = normalizeEvidenceCategory(category);
  property.evidence[normalizedCategory] = property.evidence[normalizedCategory].filter((item) => !matcher(item));
}

function setJourneyEvidenceItem(property, category, linkedQuestionId, enabled, patch) {
  if (!enabled) {
    removeEvidenceItem(property, category, (item) => item.linkedQuestionId === linkedQuestionId && ["manual", "journey_answer"].includes(item.source));
    return null;
  }
  return upsertEvidenceItem(property, category, (item) => item.linkedQuestionId === linkedQuestionId && ["manual", "journey_answer"].includes(item.source), {
    source: patch.source || "journey_answer",
    fileStored: false,
    ...patch,
    linkedQuestionId
  });
}

function legacyDocEvidenceItem(doc, category) {
  const date = doc.date || null;
  return {
    id: `legacy-doc:${category}:${normalizeLookupText(doc.title || doc.source || "")}:${date || "nodate"}`,
    title: doc.title || UPLOAD_CATEGORY_TITLES[category] || titleCase(category),
    source: doc.source === "Energy Performance Data API" ? "api" : "manual",
    filename: null,
    fileUrl: null,
    fileStored: false,
    uploadedAt: null,
    date,
    expiryDate: category === "epc" ? epcExpiryDate(date) : null,
    status: evidenceStatusFromDates(date, category === "epc" ? epcExpiryDate(date) : null),
    confidence: doc.source === "Energy Performance Data API" ? "high" : null,
    extractedFacts: {},
    notes: doc.source === "AI scan preview" ? "Legacy scan preview evidence." : null,
    linkedQuestionId: null
  };
}

function scanEvidenceItem(scan, hintedCategory = null) {
  const category = normalizeEvidenceCategory(scan.category || hintedCategory || scan.key || "other");
  return {
    id: `scan:${scan.id}`,
    title: scan.title || UPLOAD_CATEGORY_TITLES[category] || titleCase(category),
    source: scan.source || "scan",
    filename: scan.fileName || null,
    fileUrl: null,
    fileStored: false,
    uploadedAt: scan.scannedAt || null,
    date: scan.issue || null,
    expiryDate: scan.expiry || null,
    status: scan.reviewNeeded ? "review_needed" : evidenceStatusFromDates(scan.issue, scan.expiry),
    confidence: evidenceConfidenceLabel(scan.confidenceLevel),
    extractedFacts: scan.extractedFacts && typeof scan.extractedFacts === "object" ? { ...scan.extractedFacts } : {},
    notes: scan.notes || (scan.reviewNeeded ? "Prototype scan result should be reviewed before relying on it." : "Prototype scan result."),
    linkedQuestionId: null
  };
}

function syncPropertyEvidence(property) {
  if (!property) return;
  ensureEvidenceModel(property);

  property.docs = Array.isArray(property.docs) ? property.docs : [];
  property.docs.forEach((doc) => {
    if (["Energy Performance Data API", "AI scan preview"].includes(doc.source)) {
      return;
    }
    const category = normalizeEvidenceCategory(LEGACY_DOC_KEY_MAP[doc.key] || doc.key || "other");
    const evidence = legacyDocEvidenceItem(doc, category);
    upsertEvidenceItem(property, category, (item) => item.id === evidence.id, evidence);
  });

  state.scans
    .filter((scan) => scan.propertyId === property.id)
    .forEach((scan) => {
      const evidence = scanEvidenceItem(scan);
      upsertEvidenceItem(property, evidence.category, (item) => item.id === evidence.id, evidence);
    });

  const epcExpiry = property.epc?.expiry || epcExpiryDate(property.epc?.issue, property.epc?.expiry);
  if (property.epc?.rating || property.epc?.certificate || property.epc?.issue) {
    upsertEvidenceItem(property, "epc", (item) => item.source === "api" && item.linkedQuestionId === "epc_import", {
      id: `epc:${property.id}`,
      title: "Imported EPC record",
      source: "api",
      fileStored: false,
      date: property.epc.issue || property.epc.inspectionDate || null,
      expiryDate: epcExpiry || null,
      status: property.epc.status === "critical" ? "review_needed" : evidenceStatusFromDates(property.epc.issue, epcExpiry),
      confidence: "high",
      extractedFacts: {
        rating: property.epc.rating || null,
        currentScore: property.epc.currentScore || null,
        potential: property.epc.potential || null,
        potentialScore: property.epc.potentialScore || null,
        certificate: property.epc.certificate || null,
        inspectionDate: property.epc.inspectionDate || null,
        rawReference: property.epc.raw?.lmk_key || null
      },
      notes: "Imported from GOV Energy Performance Data API.",
      linkedQuestionId: "epc_import"
    });
  }

  setJourneyEvidenceItem(property, "tenancy", "tenancy_agreement", property.tenancy?.agreement === true, {
    title: "Tenancy agreement confirmed by answer",
    status: "review_needed",
    notes: "Confirmed by answer. Upload the file if you want stronger proof."
  });
  setJourneyEvidenceItem(property, "gas", "gas_certificate", Boolean(property.gas?.issue || property.gas?.engineer), {
    title: "Gas Safety recorded by answer",
    source: "manual",
    date: property.gas?.issue || null,
    expiryDate: property.gas?.issue ? addYears(property.gas.issue, 1)?.toISOString().slice(0, 10) || null : null,
    status: property.gas?.issue ? evidenceStatusFromDates(property.gas.issue, addYears(property.gas.issue, 1)?.toISOString().slice(0, 10) || null) : "review_needed",
    notes: property.gas?.engineer || "Gas Safety details were recorded manually."
  });
  setJourneyEvidenceItem(property, "eicr", "eicr_report", Boolean(property.eicr?.issue || property.eicr?.result), {
    title: "EICR recorded by answer",
    source: "manual",
    date: property.eicr?.issue || null,
    expiryDate: property.eicr?.issue ? addYears(property.eicr.issue, 5)?.toISOString().slice(0, 10) || null : null,
    status: property.eicr?.issue ? evidenceStatusFromDates(property.eicr.issue, addYears(property.eicr.issue, 5)?.toISOString().slice(0, 10) || null) : "review_needed",
    notes: property.eicr?.result || "Electrical safety details were recorded manually."
  });
  setJourneyEvidenceItem(property, "deposit", "deposit_protected", property.deposit?.protected === true, {
    title: "Deposit protection confirmed by answer",
    status: property.deposit?.protected === true ? "review_needed" : "unknown",
    notes: "Confirmed by answer. Proof has not been uploaded yet."
  });
  setJourneyEvidenceItem(property, "prescribed_info", "prescribed_info", property.deposit?.prescribedInfo === true, {
    title: "Prescribed information confirmed by answer",
    status: "review_needed",
    notes: "Confirmed by answer. Add proof if you have it."
  });
  setJourneyEvidenceItem(property, "inspections", "inspection_last", Boolean(property.inspections?.last), {
    title: "Inspection recorded by answer",
    source: "manual",
    date: property.inspections?.last || null,
    expiryDate: property.inspections?.last ? addMonths(property.inspections.last, 6)?.toISOString().slice(0, 10) || null : null,
    status: property.inspections?.last ? evidenceStatusFromDates(property.inspections.last, addMonths(property.inspections.last, 6)?.toISOString().slice(0, 10) || null) : "unknown",
    notes: "Inspection date recorded manually."
  });
  setJourneyEvidenceItem(property, "licensing", "licensing_record", Boolean(property.licensing?.localChecked || property.licensing?.hmoLicence || property.licensing?.licenceExpiry), {
    title: "Licensing recorded by answer",
    source: "manual",
    date: property.licensing?.licenceExpiry || null,
    expiryDate: property.licensing?.licenceExpiry || null,
    status: property.licensing?.licenceExpiry ? evidenceStatusFromDates(property.licensing.licenceExpiry, property.licensing.licenceExpiry) : "review_needed",
    notes: property.licensing?.localChecked === true ? "Council licensing check recorded." : "Licensing details were recorded manually."
  });

  const azAnswers = getAzAnswers(property.id);
  setJourneyEvidenceItem(property, "eviction_notices", "notice_evidence", azAnswers.notice_evidence === "yes", {
    title: "Notice evidence confirmed by answer",
    status: "review_needed",
    notes: "Confirmed by answer. Upload the notice if you want a stronger evidence pack."
  });
  setJourneyEvidenceItem(property, "tenant_communications", "tenant_communications", azAnswers.tenant_communications === "yes", {
    title: "Tenant communications confirmed by answer",
    status: "review_needed",
    notes: "Confirmed by answer. Upload emails or notes if you have them."
  });
  setJourneyEvidenceItem(property, "mould_damp", "mould_report", azAnswers.mould_report === "yes", {
    title: "Mould or damp report confirmed by answer",
    status: "review_needed",
    notes: "Confirmed by answer. Upload the report or photos if available."
  });
  setJourneyEvidenceItem(property, "repairs", "repair_history", azAnswers.repair_history === "yes" || hasMeaningfulValue(azAnswers.repair_notes), {
    title: "Repair history recorded",
    status: hasMeaningfulValue(azAnswers.repair_notes) ? "review_needed" : "unknown",
    notes: azAnswers.repair_notes || "Repair history confirmed by answer."
  });
  setJourneyEvidenceItem(property, "tenant_communications", "mould_communications", azAnswers.mould_communications === "yes", {
    title: "Mould-related communication record confirmed",
    status: "review_needed",
    notes: "Confirmed by answer. Add files if you want to strengthen the timeline."
  });

  syncPropertyTimeline(property);
}

const TIMELINE_CATEGORY_ALIASES = {
  epc: "epc",
  gas: "gas",
  eicr: "eicr",
  alarms: "alarms",
  tenancy: "tenancy",
  deposit: "deposit",
  prescribed_info: "deposit",
  licensing: "licensing",
  inspections: "inspection",
  inspection: "inspection",
  eviction_notices: "eviction",
  possession: "eviction",
  mould_damp: "mould_damp",
  repairs: "repair",
  repair: "repair",
  tenant_communications: "tenant_communication",
  tenant_communication: "tenant_communication",
  other: "other",
  irrelevant: "other"
};

const TIMELINE_TYPE_BY_CATEGORY = {
  epc: "compliance",
  gas: "compliance",
  eicr: "compliance",
  alarms: "compliance",
  tenancy: "evidence",
  deposit: "evidence",
  licensing: "compliance",
  inspection: "inspection",
  eviction: "notice",
  mould_damp: "note",
  repair: "repair",
  tenant_communication: "communication",
  other: "upload"
};

function normalizeTimelineCategory(category) {
  return TIMELINE_CATEGORY_ALIASES[category] || "other";
}

function timelineTypeForCategory(category) {
  return TIMELINE_TYPE_BY_CATEGORY[normalizeTimelineCategory(category)] || "system";
}

function normalizeTimelineEvent(property, item) {
  const category = normalizeTimelineCategory(item.category || "other");
  const eventDate = item.eventDate || item.date || null;
  const description = item.description || item.detail || "";
  const now = new Date().toISOString();
  return {
    id: item.id || `legacy:${property.id}:${normalizeLookupText(`${item.title || "event"}-${eventDate || item.createdAt || ""}-${description}`)}`,
    type: item.type || timelineTypeForCategory(category),
    category,
    title: item.title || "Property event",
    description,
    eventDate,
    dueDate: item.dueDate || null,
    source: item.source || "system",
    linkedEvidenceId: item.linkedEvidenceId || null,
    linkedQuestionId: item.linkedQuestionId || null,
    status: item.status || "unknown",
    confidence: item.confidence || null,
    notes: item.notes || null,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now
  };
}

function legacyTimelineEvent(property, item) {
  return normalizeTimelineEvent(property, {
    id: `legacy:${property.id}:${normalizeLookupText(`${item.title || "event"}-${item.date || ""}-${item.detail || ""}`)}`,
    type: "system",
    category: "other",
    title: item.title || "Property event",
    description: item.detail || "",
    eventDate: item.date || null,
    source: "system",
    status: "completed",
    notes: "Migrated from the earlier prototype timeline format."
  });
}

function ensureTimelineModel(property) {
  if (!property) return [];
  const list = Array.isArray(property.timeline) ? property.timeline : [];
  property.timeline = list.map((item) => {
    const looksLegacy = !("eventDate" in item) || !("type" in item) || !("category" in item);
    return looksLegacy ? legacyTimelineEvent(property, item) : normalizeTimelineEvent(property, item);
  });
  return property.timeline;
}

function upsertTimelineEvent(property, eventId, patch) {
  ensureTimelineModel(property);
  const now = new Date().toISOString();
  const index = property.timeline.findIndex((item) => item.id === eventId);
  if (index >= 0) {
    property.timeline[index] = normalizeTimelineEvent(property, {
      ...property.timeline[index],
      ...patch,
      id: eventId,
      updatedAt: now
    });
    return property.timeline[index];
  }
  const next = normalizeTimelineEvent(property, {
    ...patch,
    id: eventId,
    createdAt: patch.createdAt || now,
    updatedAt: patch.updatedAt || now
  });
  property.timeline.unshift(next);
  return next;
}

function removeTimelineEvent(property, eventId) {
  ensureTimelineModel(property);
  property.timeline = property.timeline.filter((item) => item.id !== eventId);
}

function setTimelineEvent(property, eventId, enabled, patch) {
  if (!enabled) {
    removeTimelineEvent(property, eventId);
    return null;
  }
  return upsertTimelineEvent(property, eventId, patch);
}

function timelineStatusFromEvidenceStatus(status) {
  if (status === "expired") return "expired";
  if (status === "expiring_soon") return "upcoming";
  if (status === "review_needed") return "review_needed";
  if (status === "missing") return "warning";
  if (status === "critical") return "critical";
  if (status === "ok") return "completed";
  return "unknown";
}

function timelineDescriptionForEvidence(item) {
  if (!item) return "";
  if (item.source === "api") {
    return item.extractedFacts?.rating
      ? `Imported from GOV data with rating ${item.extractedFacts.rating}.`
      : "Imported from GOV data.";
  }
  if (item.source === "upload") {
    return item.reviewNeeded
      ? "File selected in prototype mode. CMP may need a manual review before relying on it."
      : "File selected in prototype mode for this evidence record.";
  }
  if (item.source === "scan") {
    return "Prototype scan result linked to this evidence record.";
  }
  if (item.source === "journey_answer" || item.source === "manual") {
    return item.notes || "Confirmed by landlord answer.";
  }
  return item.notes || item.title;
}

function eventRankForDisplay(event) {
  if (["expired", "critical"].includes(event.status)) return 40;
  if (["upcoming", "warning", "review_needed"].includes(event.status)) return 30;
  if (["completed", "ok"].includes(event.status)) return 20;
  return 10;
}

function eventDateForSort(event) {
  return event.eventDate || event.dueDate || event.updatedAt || event.createdAt || "";
}

function syncPropertyTimeline(property) {
  if (!property) return;
  ensureTimelineModel(property);

  allEvidenceItems(property).forEach((item) => {
    if (item.category === "irrelevant") {
      setTimelineEvent(property, `evidence:${item.id}`, true, {
        type: "upload",
        category: "other",
        title: item.filename || item.title,
        description: "File was marked as irrelevant to this property record.",
        eventDate: item.uploadedAt || item.date || null,
        dueDate: null,
        source: item.source,
        linkedEvidenceId: item.id,
        linkedQuestionId: item.linkedQuestionId,
        status: "review_needed",
        confidence: item.confidence || null,
        notes: item.notes || null
      });
      return;
    }
    setTimelineEvent(property, `evidence:${item.id}`, true, {
      type: timelineTypeForCategory(item.category),
      category: normalizeTimelineCategory(item.category),
      title: item.title,
      description: timelineDescriptionForEvidence(item),
      eventDate: item.date || item.uploadedAt || null,
      dueDate: item.expiryDate || null,
      source: item.source,
      linkedEvidenceId: item.id,
      linkedQuestionId: item.linkedQuestionId,
      status: timelineStatusFromEvidenceStatus(item.status),
      confidence: item.confidence || null,
      notes: item.notes || null
    });
  });

  const epcExpiry = property.epc?.expiry || epcExpiryDate(property.epc?.issue, property.epc?.expiry);
  setTimelineEvent(property, `renewal:${property.id}:epc`, Boolean(epcExpiry), {
    type: "renewal",
    category: "epc",
    title: "EPC renewal",
    description: `EPC ${daysUntil(epcExpiry) < 0 ? "appears expired" : "expiry is being tracked"}${property.epc?.certificate ? ` for certificate ${property.epc.certificate}` : ""}.`,
    eventDate: property.epc?.issue || null,
    dueDate: epcExpiry || null,
    source: "system",
    linkedEvidenceId: findEvidenceItem(property, "epc", (item) => item.source === "api")?.id || null,
    linkedQuestionId: "epc_import",
    status: daysUntil(epcExpiry) < 0 ? "expired" : daysUntil(epcExpiry) <= 180 ? "upcoming" : "ok",
    confidence: "high",
    notes: "Renewal timing based on the EPC issue date."
  });

  const gasDue = property.gas?.issue ? addYears(property.gas.issue, 1)?.toISOString().slice(0, 10) || null : null;
  setTimelineEvent(property, `renewal:${property.id}:gas`, Boolean(gasDue), {
    type: "renewal",
    category: "gas",
    title: "Gas Safety renewal",
    description: daysUntil(gasDue) < 0 ? "Gas Safety renewal appears overdue." : "Annual Gas Safety renewal is being tracked.",
    eventDate: property.gas?.issue || null,
    dueDate: gasDue,
    source: "manual",
    linkedEvidenceId: bestEvidenceItem(property, "gas")?.id || null,
    linkedQuestionId: "gas_certificate",
    status: daysUntil(gasDue) < 0 ? "expired" : daysUntil(gasDue) <= 60 ? "upcoming" : "ok",
    confidence: null,
    notes: "Renewal timing is based on the recorded issue date."
  });

  const eicrDue = property.eicr?.issue ? addYears(property.eicr.issue, 5)?.toISOString().slice(0, 10) || null : null;
  setTimelineEvent(property, `renewal:${property.id}:eicr`, Boolean(eicrDue), {
    type: "renewal",
    category: "eicr",
    title: "EICR renewal",
    description: daysUntil(eicrDue) < 0 ? "The EICR appears overdue." : "Electrical safety renewal is being tracked.",
    eventDate: property.eicr?.issue || null,
    dueDate: eicrDue,
    source: "manual",
    linkedEvidenceId: bestEvidenceItem(property, "eicr")?.id || null,
    linkedQuestionId: "eicr_report",
    status: daysUntil(eicrDue) < 0 ? "expired" : daysUntil(eicrDue) <= 120 ? "upcoming" : "ok",
    confidence: null,
    notes: "Renewal timing is based on the recorded issue date."
  });

  setTimelineEvent(property, `journey:${property.id}:tenancy-active`, property.tenancy?.currentlyTenanted === true, {
    type: "evidence",
    category: "tenancy",
    title: "Tenancy confirmed",
    description: "The property is recorded as currently tenanted.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "tenancy")?.id || null,
    linkedQuestionId: "tenancy.currentlyTenanted",
    status: "completed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:deposit-protected`, property.deposit?.protected === true, {
    type: "evidence",
    category: "deposit",
    title: "Deposit protection confirmed",
    description: bestEvidenceItem(property, "deposit")?.source === "upload"
      ? "Deposit protection proof has been added."
      : "Deposit protection was confirmed by answer, but proof may still be needed.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "deposit")?.id || null,
    linkedQuestionId: "deposit_protected",
    status: bestEvidenceItem(property, "deposit")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:prescribed-info`, property.deposit?.prescribedInfo === true, {
    type: "evidence",
    category: "deposit",
    title: "Prescribed information confirmed",
    description: bestEvidenceItem(property, "prescribed_info")?.source === "upload"
      ? "Prescribed information proof has been added."
      : "Prescribed information was confirmed by answer, but proof may still be needed.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "prescribed_info")?.id || null,
    linkedQuestionId: "prescribed_info",
    status: bestEvidenceItem(property, "prescribed_info")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:inspection-last`, Boolean(property.inspections?.last), {
    type: "inspection",
    category: "inspection",
    title: "Inspection completed",
    description: "A property inspection date is recorded.",
    eventDate: property.inspections?.last || null,
    dueDate: property.inspections?.last ? addMonths(property.inspections.last, 6)?.toISOString().slice(0, 10) || null : null,
    source: "manual",
    linkedEvidenceId: bestEvidenceItem(property, "inspections")?.id || null,
    linkedQuestionId: "inspection_last",
    status: property.inspections?.last ? (daysUntil(addMonths(property.inspections.last, 6)) <= 0 ? "upcoming" : "completed") : "unknown",
    confidence: null
  });

  const azAnswers = getAzAnswers(property.id);
  setTimelineEvent(property, `journey:${property.id}:notice-evidence`, azAnswers.notice_evidence === "yes", {
    type: "notice",
    category: "eviction",
    title: "Notice evidence recorded",
    description: bestEvidenceItem(property, "eviction_notices")?.source === "upload"
      ? "Possession notice evidence has been added to the evidence pack."
      : "Notice evidence was confirmed by answer, but the file may still be missing.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "eviction_notices")?.id || null,
    linkedQuestionId: "notice_evidence",
    status: bestEvidenceItem(property, "eviction_notices")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:tenant-comms`, azAnswers.tenant_communications === "yes", {
    type: "communication",
    category: "tenant_communication",
    title: "Tenant communications recorded",
    description: bestEvidenceItem(property, "tenant_communications")?.source === "upload"
      ? "Tenant communication records have been added."
      : "Tenant communications were confirmed by answer, but files may still be missing.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "tenant_communications")?.id || null,
    linkedQuestionId: "tenant_communications",
    status: bestEvidenceItem(property, "tenant_communications")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:mould-report`, azAnswers.mould_report === "yes", {
    type: "note",
    category: "mould_damp",
    title: "Mould or damp issue recorded",
    description: bestEvidenceItem(property, "mould_damp")?.source === "upload"
      ? "A mould or damp report has been added."
      : "A mould or damp issue was recorded, but supporting files may still be missing.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "mould_damp")?.id || null,
    linkedQuestionId: "mould_report",
    status: bestEvidenceItem(property, "mould_damp")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:repair-history`, azAnswers.repair_history === "yes" || hasMeaningfulValue(azAnswers.repair_notes), {
    type: "repair",
    category: "repair",
    title: "Repair history recorded",
    description: azAnswers.repair_notes || "Repair or maintenance activity has been recorded.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "repairs")?.id || null,
    linkedQuestionId: "repair_history",
    status: bestEvidenceItem(property, "repairs")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
  setTimelineEvent(property, `journey:${property.id}:mould-comms`, azAnswers.mould_communications === "yes", {
    type: "communication",
    category: "tenant_communication",
    title: "Mould-related communications recorded",
    description: "Tenant communications for the mould or damp issue have been recorded.",
    eventDate: null,
    dueDate: null,
    source: "journey_answer",
    linkedEvidenceId: bestEvidenceItem(property, "tenant_communications")?.id || null,
    linkedQuestionId: "mould_communications",
    status: bestEvidenceItem(property, "tenant_communications")?.source === "upload" ? "completed" : "review_needed",
    confidence: null
  });
}

function timelineCategoriesForPlan(modulePlan = dashboardModulePlan()) {
  switch (modulePlan.primaryFocus) {
    case "epc":
      return ["epc"];
    case "gas":
      return ["gas"];
    case "eicr":
      return ["eicr"];
    case "eviction":
      return ["tenancy", "deposit", "eviction", "tenant_communication", "inspection", "repair", "epc", "gas", "eicr"];
    case "mould":
      return ["mould_damp", "repair", "tenant_communication", "inspection"];
    case "evidence_pack":
      return ["epc", "gas", "eicr", "tenancy", "deposit", "licensing", "inspection", "eviction", "tenant_communication", "mould_damp", "repair", "other"];
    default:
      return ["epc", "gas", "eicr", "alarms", "tenancy", "deposit", "licensing", "inspection", "eviction", "tenant_communication", "mould_damp", "repair", "other"];
  }
}

function timelineEventsForDisplay(property, modulePlan = dashboardModulePlan(property, evaluateProperty(property))) {
  if (!property) return [];
  ensureTimelineModel(property);
  const allowed = new Set(timelineCategoriesForPlan(modulePlan));
  return property.timeline
    .filter((item) => allowed.has(item.category))
    .sort((left, right) => {
      const rank = eventRankForDisplay(right) - eventRankForDisplay(left);
      if (rank !== 0) return rank;
      return String(eventDateForSort(right)).localeCompare(String(eventDateForSort(left)));
    })
    .slice(0, 8);
}

function timelineSummaryItems(property, modulePlan = dashboardModulePlan(property, evaluateProperty(property))) {
  const events = timelineEventsForDisplay(property, modulePlan);
  return events.slice(0, 4).map((event) => ({
    title: event.title,
    detail: event.description || "Recorded in the property timeline.",
    status: event.status
  }));
}

function timelineActionCandidates(property, modulePlan = dashboardModulePlan(property, evaluateProperty(property))) {
  const events = timelineEventsForDisplay(property, modulePlan);
  const actions = [];
  const push = (service, action, recommendationType, eventId) => {
    if (!actions.some((item) => item.service === service && item.action === action)) {
      actions.push({ service, action, recommendationType, timelineEventId: eventId });
    }
  };

  events.forEach((event) => {
    if (event.category === "epc" && event.type === "renewal" && event.status === "expired") {
      push("Review EPC", "The EPC renewal looks overdue. Review the certificate and arrange a new EPC if needed.", "book", event.id);
    }
    if (event.category === "gas" && event.type === "renewal" && event.status === "upcoming") {
      push("Review Gas Safety", "The Gas Safety renewal is coming up. Upload the latest certificate or arrange the next check.", "book", event.id);
    }
    if (event.category === "eicr" && event.type === "renewal" && event.status === "upcoming") {
      push("Review EICR", "The EICR renewal is approaching. Review the report and next inspection date.", "book", event.id);
    }
    if (event.category === "inspection" && event.type === "inspection" && event.status === "upcoming") {
      push("Arrange inspection", "CMP may need a follow-up inspection or fresher report.", "check", event.id);
    }
    if (event.category === "eviction" && event.status === "review_needed") {
      push("Add possession evidence", "Add the notice or possession paperwork so the evidence timeline is stronger.", "check", event.id);
    }
    if (event.category === "tenant_communication" && event.status === "review_needed" && modulePlan.primaryFocus === "eviction") {
      push("Add communications", "Add tenant communication records to support the evidence timeline.", "check", event.id);
    }
    if (event.category === "mould_damp" && event.status === "review_needed" && modulePlan.primaryFocus === "mould") {
      push("Add mould evidence", "Add the report, photos, or follow-up details for the damp or mould record.", "check", event.id);
    }
    if (event.category === "repair" && event.status === "review_needed" && modulePlan.primaryFocus === "mould") {
      push("Add repair action", "Add repair evidence or a follow-up inspection so the mould timeline is complete.", "check", event.id);
    }
  });

  return actions.slice(0, 4);
}

function ensureServiceRequestModel(property) {
  if (!property) return [];
  const list = Array.isArray(property.serviceRequests) ? property.serviceRequests : [];
  property.serviceRequests = list.map((item) => ({
    id: item.id || `service:${property.id}:${item.serviceKey || normalizeLookupText(item.title || "request")}`,
    serviceKey: item.serviceKey || null,
    title: item.title || "Property service request",
    sourceRecommendationId: item.sourceRecommendationId || null,
    status: item.status || "selected",
    urgency: item.urgency || "medium",
    reason: item.reason || "",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
  }));
  return property.serviceRequests;
}

function serviceKeyForItemKey(key, modulePlan = dashboardModulePlan()) {
  if (["epc", "gas", "eicr", "licensing"].includes(key)) return key;
  if (key === "inspections") return "inspection";
  if (["deposit", "tenancy", "possession"].includes(key)) return modulePlan.primaryFocus === "eviction" ? "eviction_pack" : "evidence_pack";
  if (modulePlan.primaryFocus === "mould") return "mould_damp";
  return null;
}

function guidedSectionIdForKey(key, modulePlan = dashboardModulePlan()) {
  const map = {
    epc: "epc",
    gas: "gas",
    eicr: "eicr",
    alarms: "alarms",
    deposit: "tenancy_deposit",
    tenancy: "tenancy_deposit",
    licensing: "licensing",
    inspections: "inspections",
    possession: "eviction_evidence"
  };
  if (modulePlan.primaryFocus === "mould" && ["inspections", "tenancy"].includes(key)) return "mould_damp";
  return map[key] || "property_basics";
}

function urgencyRank(urgency) {
  return {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    optional: 1
  }[urgency] || 0;
}

function recommendationStatusTone(urgency) {
  if (urgency === "critical") return "critical";
  if (urgency === "high" || urgency === "medium") return "warning";
  if (urgency === "low") return "unknown";
  return "na";
}

function recommendationIdFor(rec) {
  return [
    rec.type,
    rec.serviceKey || "none",
    rec.panelTarget || "none",
    rec.relatedEvidenceId || "none",
    rec.relatedTimelineId || "none",
    rec.relatedQuestionId || "none",
    normalizeLookupText(rec.title || "")
  ].join(":");
}

function recommendationRoute(panelTarget) {
  return panelTarget === "evidence"
    ? "#evidence-pack"
    : panelTarget === "check"
      ? "#guided-check"
      : panelTarget === "az"
        ? "#az-checker"
        : panelTarget === "services"
          ? "#services"
          : "#dashboard";
}

function bookingActionRequests(property = activeProperty()) {
  return ensureServiceRequestModel(property)
    .filter((item) => !["cancelled", "completed"].includes(item.status))
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

function upsertServiceRequest(property, patch, matcher = null) {
  ensureServiceRequestModel(property);
  const now = new Date().toISOString();
  const index = property.serviceRequests.findIndex((item) => matcher
    ? matcher(item)
    : (patch.sourceRecommendationId && item.sourceRecommendationId === patch.sourceRecommendationId)
      || (patch.serviceKey && item.serviceKey === patch.serviceKey && item.status !== "cancelled"));
  if (index >= 0) {
    property.serviceRequests[index] = {
      ...property.serviceRequests[index],
      ...patch,
      updatedAt: now
    };
    return property.serviceRequests[index];
  }
  const next = {
    id: patch.id || `service:${property.id}:${patch.serviceKey || normalizeLookupText(patch.title || "request")}:${Date.now()}`,
    serviceKey: patch.serviceKey || null,
    title: patch.title || "Property service request",
    sourceRecommendationId: patch.sourceRecommendationId || null,
    status: patch.status || "selected",
    urgency: patch.urgency || "medium",
    reason: patch.reason || "",
    createdAt: now,
    updatedAt: now
  };
  property.serviceRequests.unshift(next);
  return next;
}

function removeServiceRequest(property, requestId) {
  ensureServiceRequestModel(property);
  property.serviceRequests = property.serviceRequests.filter((item) => item.id !== requestId);
}

function defaultRecommendationList(property = activeProperty(), evaluation = property ? evaluateProperty(property) : null, modulePlan = dashboardModulePlan(property, evaluation)) {
  if (!property || !evaluation) return [];
  const recommendations = [];
  const dedupe = new Set();
  const push = (rec) => {
    const id = recommendationIdFor(rec);
    if (dedupe.has(id)) return;
    dedupe.add(id);
    recommendations.push({
      ...rec,
      id,
      route: rec.route || recommendationRoute(rec.panelTarget)
    });
  };
  const presetKey = journeyPresetKey();
  const strictServiceOnly = ["epc_only", "gas_only", "eicr_only"].includes(presetKey);
  const relevantKeys = new Set([
    ...(journeyPreset().primaryKeys || []),
    ...(journeyPreset().secondaryKeys || [])
  ]);
  const focusedItems = evaluation.items.filter((item) => relevantKeys.has(item.key) || ["critical", "expired"].includes(item.status));

  if (evaluation.assessment.mode === "setup") {
    push({
      type: "continue_journey",
      serviceKey: modulePlan.primaryFocus === "full_compliance" ? null : modulePlan.primaryFocus,
      title: modulePlan.primaryFocus === "eviction" ? "Continue the evidence pack" : modulePlan.primaryFocus === "mould" ? "Continue the timeline" : "Continue compliance setup",
      reason: evaluation.assessment.summaryText,
      urgency: "medium",
      source: "journey",
      ctaLabel: modulePlan.primaryFocus === "eviction" ? "Continue evidence pack" : "Continue check",
      panelTarget: "check",
      relatedEvidenceId: null,
      relatedTimelineId: null,
      relatedQuestionId: null
    });
  }

  focusedItems.forEach((item) => {
    const serviceKey = serviceKeyForItemKey(item.key, modulePlan);
    if (strictServiceOnly && serviceKey && ![modulePlan.primaryFocus, "epc"].includes(serviceKey) && !["critical", "expired"].includes(item.status)) {
      return;
    }
    if (isSetupStatus(item.status)) {
      push({
        type: "answer_question",
        serviceKey,
        title: item.key === "gas" ? "Confirm the gas setup" : item.key === "eicr" ? "Confirm the electrical safety record" : `Continue ${item.title.toLowerCase()}`,
        reason: item.summary,
        urgency: modulePlan.primaryFocus === "full_compliance" ? "medium" : "low",
        source: "score",
        ctaLabel: "Answer questions",
        panelTarget: "check",
        relatedEvidenceId: null,
        relatedTimelineId: null,
        relatedQuestionId: guidedSectionIdForKey(item.key, modulePlan)
      });
      return;
    }
    if (["missing", "expired", "critical", "expiring_soon"].includes(item.status)) {
      const bookable = ["epc", "gas", "eicr", "inspection", "licensing"].includes(serviceKey);
      push({
        type: bookable ? "book_service" : "upload_evidence",
        serviceKey,
        title: item.status === "expired" ? `Review ${item.title}` : item.status === "missing" ? `Add ${item.title} evidence` : item.service,
        reason: item.summary,
        urgency: item.status === "critical" || item.status === "expired" ? "critical" : item.status === "expiring_soon" ? "high" : "medium",
        source: "score",
        ctaLabel: bookable ? (item.key === "epc" ? "Start EPC renewal" : `Select ${item.title}`) : "Add evidence",
        panelTarget: bookable ? "services" : "evidence",
        relatedEvidenceId: bestEvidenceItem(property, item.key === "inspections" ? "inspections" : item.key)?.id || null,
        relatedTimelineId: null,
        relatedQuestionId: guidedSectionIdForKey(item.key, modulePlan)
      });
    }
  });

  allEvidenceItems(property).forEach((evidence) => {
    if (strictServiceOnly && evidence.category !== modulePlan.primaryFocus && evidence.status !== "review_needed") return;
    if ((evidence.source === "manual" || evidence.source === "journey_answer") && ["tenancy", "deposit", "prescribed_info", "eviction_notices", "tenant_communications", "mould_damp", "repairs", "inspections"].includes(evidence.category)) {
      push({
        type: "upload_evidence",
        serviceKey: modulePlan.primaryFocus === "eviction" ? "eviction_pack" : modulePlan.primaryFocus === "mould" ? "mould_damp" : "evidence_pack",
        title: `Upload ${evidence.title.toLowerCase()}`,
        reason: evidence.notes || "This has been confirmed by answer, but proof has not been uploaded yet.",
        urgency: "medium",
        source: "evidence",
        ctaLabel: "Upload evidence",
        panelTarget: "evidence",
        relatedEvidenceId: evidence.id,
        relatedTimelineId: null,
        relatedQuestionId: evidence.linkedQuestionId
      });
    }
    if (evidence.status === "review_needed") {
      push({
        type: "review_document",
        serviceKey: serviceKeyForItemKey(evidence.category, modulePlan),
        title: evidence.category === "irrelevant" ? "Review unrelated file" : "Review imported document",
        reason: evidence.notes || "CMP found a document in prototype mode that may need review.",
        urgency: evidence.category === "irrelevant" ? "low" : "medium",
        source: "evidence",
        ctaLabel: evidence.category === "irrelevant" ? "Ignore file" : "Review document",
        panelTarget: "evidence",
        relatedEvidenceId: evidence.id,
        relatedTimelineId: null,
        relatedQuestionId: evidence.linkedQuestionId
      });
    }
  });

  timelineEventsForDisplay(property, modulePlan).forEach((event) => {
    if (event.status === "upcoming" && ["epc", "gas", "eicr", "licensing", "inspection"].includes(event.category)) {
      push({
        type: ["epc", "gas", "eicr", "licensing"].includes(event.category) ? "set_reminder" : "continue_journey",
        serviceKey: serviceKeyForItemKey(event.category === "inspection" ? "inspections" : event.category, modulePlan),
        title: event.title,
        reason: event.description,
        urgency: "high",
        source: "timeline",
        ctaLabel: event.category === "inspection" ? "Review inspection" : "Track renewal",
        panelTarget: event.category === "inspection" ? "check" : "services",
        relatedEvidenceId: event.linkedEvidenceId,
        relatedTimelineId: event.id,
        relatedQuestionId: guidedSectionIdForKey(event.category === "inspection" ? "inspections" : event.category, modulePlan)
      });
    }
    if (event.status === "review_needed" && modulePlan.primaryFocus === "eviction" && ["eviction", "tenant_communication"].includes(event.category)) {
      push({
        type: event.category === "eviction" ? "upload_evidence" : "add_timeline_note",
        serviceKey: "eviction_pack",
        title: event.category === "eviction" ? "Add possession evidence" : "Add tenant communication",
        reason: event.description,
        urgency: "medium",
        source: "timeline",
        ctaLabel: event.category === "eviction" ? "Add evidence" : "Continue timeline",
        panelTarget: "evidence",
        relatedEvidenceId: event.linkedEvidenceId,
        relatedTimelineId: event.id,
        relatedQuestionId: event.linkedQuestionId || "eviction_evidence"
      });
    }
    if (event.status === "review_needed" && modulePlan.primaryFocus === "mould" && ["mould_damp", "repair", "tenant_communication"].includes(event.category)) {
      push({
        type: event.category === "repair" ? "add_timeline_note" : "upload_evidence",
        serviceKey: "mould_damp",
        title: event.category === "repair" ? "Add repair action" : "Add mould evidence",
        reason: event.description,
        urgency: "medium",
        source: "timeline",
        ctaLabel: event.category === "repair" ? "Continue timeline" : "Add evidence",
        panelTarget: event.category === "repair" ? "check" : "evidence",
        relatedEvidenceId: event.linkedEvidenceId,
        relatedTimelineId: event.id,
        relatedQuestionId: event.linkedQuestionId || "mould_damp"
      });
    }
  });

  if (modulePlan.primaryFocus === "eviction") {
    if (!bestEvidenceItem(property, "eviction_notices")) {
      push({
        type: "upload_evidence",
        serviceKey: "eviction_pack",
        title: "Add possession notice evidence",
        reason: "No notice evidence has been added to this evidence pack yet.",
        urgency: "high",
        source: "journey",
        ctaLabel: "Add evidence",
        panelTarget: "evidence",
        relatedEvidenceId: null,
        relatedTimelineId: null,
        relatedQuestionId: "eviction_evidence"
      });
    }
    if (!bestEvidenceItem(property, "tenant_communications")) {
      push({
        type: "upload_evidence",
        serviceKey: "eviction_pack",
        title: "Add tenant communications",
        reason: "Tenant communications have not been added to this evidence pack yet.",
        urgency: "medium",
        source: "journey",
        ctaLabel: "Add evidence",
        panelTarget: "evidence",
        relatedEvidenceId: null,
        relatedTimelineId: null,
        relatedQuestionId: "eviction_evidence"
      });
    }
  }

  if (modulePlan.primaryFocus === "mould") {
    if (!bestEvidenceItem(property, "mould_damp")) {
      push({
        type: "upload_evidence",
        serviceKey: "mould_damp",
        title: "Add mould report or photos",
        reason: "A damp or mould record has not been added yet.",
        urgency: "high",
        source: "journey",
        ctaLabel: "Add evidence",
        panelTarget: "evidence",
        relatedEvidenceId: null,
        relatedTimelineId: null,
        relatedQuestionId: "mould_damp"
      });
    }
    if (!bestEvidenceItem(property, "repairs")) {
      push({
        type: "add_timeline_note",
        serviceKey: "mould_damp",
        title: "Add repair action",
        reason: "Repair history is not recorded yet for this mould or damp issue.",
        urgency: "medium",
        source: "journey",
        ctaLabel: "Continue timeline",
        panelTarget: "check",
        relatedEvidenceId: null,
        relatedTimelineId: null,
        relatedQuestionId: "mould_damp"
      });
    }
  }

  if (modulePlan.primaryFocus === "evidence_pack" && !allEvidenceItems(property, { includeIrrelevant: false }).length) {
    push({
      type: "upload_evidence",
      serviceKey: "evidence_pack",
      title: "Start the evidence pack",
      reason: "No property evidence has been added yet.",
      urgency: "medium",
      source: "journey",
      ctaLabel: "Upload documents",
      panelTarget: "evidence",
      relatedEvidenceId: null,
      relatedTimelineId: null,
      relatedQuestionId: "evidence_pack"
    });
  }

  return recommendations
    .sort((left, right) => urgencyRank(right.urgency) - urgencyRank(left.urgency))
    .slice(0, 6);
}

function recommendationById(id) {
  return state.currentRecommendations.find((item) => item.id === id) || null;
}

function uploadCategoryForRecommendation(recommendation, property = activeProperty()) {
  if (recommendation?.relatedEvidenceId) {
    const match = allEvidenceItems(property).find((item) => item.id === recommendation.relatedEvidenceId);
    if (match) return normalizeEvidenceCategory(match.category);
  }
  return SERVICE_KEY_META[recommendation?.serviceKey]?.uploadCategory || "other";
}

function jumpToGuidedSection(sectionId, panel = "check") {
  const property = activeProperty();
  if (!property) return;
  const sections = visibleGuidedSections(property);
  const targetId = typeof sectionId === "string" ? sectionId : sections[0]?.id;
  const index = sections.findIndex((section) => section.id === targetId);
  if (index >= 0) {
    state.activeStep = index;
    setGuidedCurrentSection(sections[index].id, property.id);
  }
  showDashboardPanel(panel, false);
  renderAll();
  document.querySelector(panel === "check" ? "#guided-check" : `[data-dashboard-panel="${panel}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openUploadForRecommendation(recommendation) {
  const category = uploadCategoryForRecommendation(recommendation);
  const label = SERVICE_KEY_META[recommendation.serviceKey]?.title || recommendation.title;
  showDashboardPanel("evidence", false);
  openUploadModal({
    currentTarget: {
      dataset: {
        uploadCategory: category,
        uploadLabel: `Upload ${label}`,
        uploadPrompt: recommendation.reason || "Add the document or evidence for this property.",
        uploadSource: "recommendation"
      }
    }
  });
}

function selectServiceFromRecommendation(recommendation) {
  const property = activeProperty();
  if (!property) return;
  upsertServiceRequest(property, {
    serviceKey: recommendation.serviceKey,
    title: recommendation.title,
    sourceRecommendationId: recommendation.id,
    status: "selected",
    urgency: recommendation.urgency,
    reason: recommendation.reason
  }, (item) => item.sourceRecommendationId === recommendation.id || (recommendation.serviceKey && item.serviceKey === recommendation.serviceKey && item.status !== "cancelled"));
  queueWorkspaceSave(property.id);
  renderAll();
}

function updateServiceRequestStatus(requestId, status) {
  const property = activeProperty();
  if (!property) return;
  ensureServiceRequestModel(property);
  const request = property.serviceRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  queueWorkspaceSave(property.id);
  renderAll();
}

function executeRecommendationAction(recommendationId) {
  const recommendation = recommendationById(recommendationId);
  if (!recommendation) return;
  if (recommendation.type === "upload_evidence") {
    openUploadForRecommendation(recommendation);
    return;
  }
  if (recommendation.type === "answer_question") {
    jumpToGuidedSection(recommendation.relatedQuestionId || SERVICE_KEY_META[recommendation.serviceKey]?.sectionId || "property_basics", recommendation.panelTarget || "check");
    return;
  }
  if (recommendation.type === "continue_journey") {
    jumpToGuidedSection(recommendation.relatedQuestionId || SERVICE_KEY_META[recommendation.serviceKey]?.sectionId || journeyPreset().defaultStep, recommendation.panelTarget || "check");
    return;
  }
  if (recommendation.type === "review_document") {
    showDashboardPanel(recommendation.panelTarget || "evidence");
    return;
  }
  if (recommendation.type === "add_timeline_note") {
    jumpToGuidedSection(recommendation.relatedQuestionId || SERVICE_KEY_META[recommendation.serviceKey]?.sectionId || "inspections", recommendation.panelTarget || "check");
    return;
  }
  if (recommendation.type === "set_reminder" || recommendation.type === "book_service") {
    selectServiceFromRecommendation(recommendation);
    showDashboardPanel("services", false);
    return;
  }
}

function renderActionCentre(property, recommendations = state.currentRecommendations) {
  const target = document.querySelector("#actionCentre");
  if (!target) return;
  const requests = bookingActionRequests(property);
  if (!property) {
    target.innerHTML = "";
    return;
  }
  if (!requests.length) {
    target.innerHTML = `
      <article class="action-centre-card">
        <header>
          <div>
            <strong>Booking Action Centre</strong>
            <span>Selected actions appear here once you save interest in a service or follow-up.</span>
          </div>
          <span class="quiet-pill">Prototype only</span>
        </header>
        <span>CMP can store service interest and enquiry-ready actions here, but it does not create a live booking in this prototype.</span>
      </article>
    `;
    return;
  }

  target.innerHTML = `
    <article class="action-centre-card">
      <header>
        <div>
          <strong>Booking Action Centre</strong>
          <span>Saved service interest for this property. Prototype only.</span>
        </div>
        <span class="quiet-pill">${requests.length} saved</span>
      </header>
      <div class="action-centre-list">
        ${requests.map((request) => `
          <article class="action-centre-item">
            <header>
              <strong>${escapeHtml(request.title)}</strong>
              <span class="status-pill ${recommendationStatusTone(request.urgency)}">${escapeHtml(titleCase(request.status.replaceAll("_", " ")))}</span>
            </header>
            <span>${escapeHtml(request.reason || "Saved from a CMP recommendation.")}</span>
            <div class="action-centre-item-actions">
              ${request.status === "selected" ? `<button class="secondary-button" type="button" data-service-request-status="${escapeHtml(request.id)}" data-service-request-next="enquiry_ready">Mark enquiry ready</button>` : ""}
              ${request.status === "enquiry_ready" ? `<button class="secondary-button" type="button" data-service-request-status="${escapeHtml(request.id)}" data-service-request-next="requested">Mark requested</button>` : ""}
              <button class="mini-button" type="button" data-service-request-remove="${escapeHtml(request.id)}">Remove</button>
            </div>
          </article>
        `).join("")}
      </div>
    </article>
  `;

  target.querySelectorAll("[data-service-request-status]").forEach((button) => {
    button.addEventListener("click", () => updateServiceRequestStatus(button.dataset.serviceRequestStatus, button.dataset.serviceRequestNext));
  });
  target.querySelectorAll("[data-service-request-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeServiceRequest(property, button.dataset.serviceRequestRemove);
      queueWorkspaceSave(property.id);
      renderAll();
    });
  });
}

function syncAllPropertyEvidence() {
  properties.forEach((property) => syncPropertyEvidence(property));
}

function dashboardModulePlan(property = activeProperty(), evaluation = property ? evaluateProperty(property) : null) {
  const context = ensureJourneyContext();
  const preset = journeyPreset(context);
  const items = evaluation?.items || [];
  const actions = sortedActions(items);
  const primaryKeySet = new Set(preset.primaryKeys || []);
  const secondaryKeySet = new Set(preset.secondaryKeys || []);
  const presetKey = journeyPresetKey(context);
  const strictServiceOnly = ["epc_only", "gas_only", "eicr_only"].includes(presetKey);

  const visibleModules = [...preset.visibleModules];
  const allModules = ["requirements", "check", "az", "evidence", "services"];
  const suppressedModules = allModules.filter((module) => !visibleModules.includes(module));
  const secondaryModules = preset.secondaryModules || [];

  const relevantAction = (item, { allowSecondaryUnknown = true } = {}) => {
    if (primaryKeySet.has(item.key)) return true;
    if (secondaryKeySet.has(item.key)) {
      if (!allowSecondaryUnknown && isSetupStatus(item.status)) return false;
      return true;
    }
    return ["critical", "expired"].includes(item.status);
  };

  const serviceCandidates = (actions.length ? actions : items)
    .filter((item) => item.status !== "ok" && item.status !== "not_applicable")
    .filter((item) => relevantAction(item, { allowSecondaryUnknown: !strictServiceOnly }))
    .slice(0, 4);

  const priorityCandidates = (actions.length ? actions : items.filter((item) => item.status === "ok"))
    .filter((item) => relevantAction(item, { allowSecondaryUnknown: !strictServiceOnly }) || primaryKeySet.has(item.key))
    .slice(0, 4);

  return {
    primaryFocus: preset.primaryFocus,
    visibleModules,
    secondaryModules,
    suppressedModules,
    primaryActions: priorityCandidates.filter((item) => primaryKeySet.has(item.key) || ["critical", "expired"].includes(item.status)),
    secondaryActions: priorityCandidates.filter((item) => !primaryKeySet.has(item.key) && !["critical", "expired"].includes(item.status)),
    primaryActionsAll: priorityCandidates,
    serviceCandidates,
    primaryKeySet,
    secondaryKeySet,
    journeyTitle: preset.journeyTitle,
    journeyIntro: preset.journeyIntro,
    journeyLabel: preset.journeyLabel,
    priorityTitle: preset.priorityTitle,
    priorityHelper: preset.priorityHelper,
    assistantHeadline: preset.assistantHeadline,
    assistantCopy: preset.assistantCopy,
    defaultPanel: preset.defaultPanel,
    defaultStep: preset.defaultStep,
    dashboardJourney: preset.dashboardJourney,
    metadata: propertyMetadataSummary(property)
  };
}

function getPath(object, path) {
  return path.split(".").reduce((value, part) => (value === null || value === undefined ? undefined : value[part]), object);
}

function guidedJourneyKey() {
  return journeyPresetKey();
}

function guidedMeta(propertyId = state.activePropertyId) {
  if (!propertyId) {
    return { currentSectionId: null, editingQuestions: {}, completedSections: {}, updatedAt: "" };
  }
  const answers = getAzAnswers(propertyId);
  const meta = answers.__guided || {};
  return {
    currentSectionId: meta.currentSectionId || null,
    editingQuestions: { ...(meta.editingQuestions || {}) },
    completedSections: { ...(meta.completedSections || {}) },
    updatedAt: meta.updatedAt || ""
  };
}

function saveGuidedMeta(patch, propertyId = state.activePropertyId) {
  const answers = getAzAnswers(propertyId);
  const current = guidedMeta(propertyId);
  answers.__guided = {
    ...current,
    ...patch,
    editingQuestions: patch.editingQuestions ? { ...current.editingQuestions, ...patch.editingQuestions } : current.editingQuestions,
    completedSections: patch.completedSections ? { ...current.completedSections, ...patch.completedSections } : current.completedSections,
    updatedAt: new Date().toISOString()
  };
}

function setGuidedCurrentSection(sectionId, propertyId = state.activePropertyId) {
  if (!propertyId || !sectionId) return;
  saveGuidedMeta({ currentSectionId: sectionId }, propertyId);
}

function setQuestionEditing(questionId, editing, propertyId = state.activePropertyId) {
  if (!propertyId || !questionId) return;
  saveGuidedMeta({ editingQuestions: { [questionId]: editing } }, propertyId);
}

function guidedQuestionIdForField(field) {
  const match = GUIDED_JOURNEY_SECTIONS.flatMap((section) => section.questions).find((question) => question.field === field || question.answerKey === field);
  return match?.id || field;
}

function guidedQuestionValue(question, property, answers) {
  if (question.field) return getPath(property, question.field);
  if (question.answerKey) {
    if (hasMeaningfulValue(answers[question.answerKey])) return answers[question.answerKey];
    const evidenceBackfill = {
      notice_evidence: "eviction_notices",
      tenant_communications: "tenant_communications",
      mould_report: "mould_damp",
      repair_history: "repairs",
      mould_communications: "tenant_communications"
    };
    const category = evidenceBackfill[question.answerKey];
    if (category && bestEvidenceItem(property, category)) return "yes";
    return answers[question.answerKey];
  }
  return undefined;
}

function questionIsAnswered(question, value) {
  if (question.type === "upload") return Boolean(value);
  if (question.type === "info" || question.type === "display" || question.type === "evidence_overview") return Boolean(value);
  if (question.type === "number") return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  if (question.type === "date" || question.type === "text" || question.type === "text_az" || question.type === "select" || question.type === "select_az") return hasMeaningfulValue(value);
  if (question.type === "toggle") return value === true || value === false || value === "na";
  if (question.type === "toggle_az") return ["yes", "no", "na"].includes(value);
  return hasMeaningfulValue(value);
}

function questionOptionLabel(question, value) {
  if (!hasMeaningfulValue(value)) return "";
  if (question.type === "toggle") {
    return value === true ? "Yes" : value === false ? "No" : value === "na" ? "Not applicable" : "Not sure at this point";
  }
  if (question.type === "toggle_az") {
    return value === "yes" ? "Yes" : value === "no" ? "No" : value === "na" ? "Not applicable" : "Not sure at this point";
  }
  return String(value);
}

function latestEvidence(property, key) {
  if (!property) return null;
  syncPropertyEvidence(property);
  if (key === "all") {
    return sortEvidenceItems(allEvidenceItems(property, { includeIrrelevant: false }))[0] || null;
  }
  return bestEvidenceItem(property, key);
}

function evidenceGapSummary(property) {
  const evaluation = evaluateProperty(property);
  return evaluation.items
    .filter((item) => ["missing", "expired", "expiring_soon", "setup_needed"].includes(item.status))
    .slice(0, 4);
}

function guidedQuestionSnapshot(question, property, answers, context = ensureJourneyContext()) {
  if (question.when && !question.when(property, context, answers)) {
    return { hidden: true };
  }

  if (question.type === "upload") {
    const evidence = latestEvidence(property, evidenceCategoryForQuestion(question));
    return {
      hidden: false,
      answered: Boolean(evidence),
      value: evidence,
      source: evidence ? evidenceSourceCopy(evidence) : "",
      summaryValue: evidence ? evidenceSummaryCopy(evidence, evidence?.status) : "",
      canCondense: Boolean(evidence)
    };
  }

  if (question.type === "info") {
    const preset = journeyPreset(context);
    return {
      hidden: false,
      answered: true,
      value: preset.journeyTitle,
      source: "Journey context",
      summaryValue: `${preset.journeyTitle} · ${preset.journeyIntro}`,
      canCondense: true
    };
  }

  if (question.type === "evidence_overview") {
    const gaps = evidenceGapSummary(property);
    return {
      hidden: false,
      answered: gaps.length > 0 || allEvidenceItems(property, { includeIrrelevant: false }).length > 0,
      value: gaps,
      source: "CMP summary",
      summaryValue: gaps.length ? `${gaps.length} evidence gap${gaps.length === 1 ? "" : "s"} still showing` : "No urgent evidence gaps are showing right now.",
      canCondense: false
    };
  }

  const value = guidedQuestionValue(question, property, answers);
  let resolvedValue = value;
  if (question.field === "tenancy.currentlyTenanted" && resolvedValue === null) {
    resolvedValue = context.isTenanted === "yes" ? true : context.isTenanted === "no" ? false : null;
  }
  const answered = questionIsAnswered(question, resolvedValue);
  let source = "";
  let canCondense = answered;

  if (question.answerKey && answered) {
    source = "Guided answer";
  } else if (question.field?.startsWith("epc.") && answered) {
    source = property.epc?.source || "EPC register";
  } else if ((question.field === "gas.issue" || question.field === "eicr.issue" || question.field === "inspections.last") && latestEvidence(property, question.field === "gas.issue" ? "gas" : question.field === "eicr.issue" ? "eicr" : "inspection")) {
    source = "Document scan preview";
  } else if (question.field === "tenancy.currentlyTenanted" && context.isTenanted && !hasMeaningfulValue(property.tenancy?.currentlyTenanted)) {
    source = "Journey answer";
  } else if (answered) {
    source = "Property record";
  }

  if (question.type === "display") {
    canCondense = true;
  }

  return {
    hidden: false,
    answered,
    value: resolvedValue,
    source,
    summaryValue: question.formatter === "date" && resolvedValue ? formatDate(resolvedValue) : questionOptionLabel(question, resolvedValue),
    canCondense
  };
}

function sectionModeForJourney(section, presetKey = guidedJourneyKey()) {
  return section.journeyModes?.[presetKey] || section.journeyModes?.full_compliance || "optional";
}

function visibleGuidedSections(property = activeProperty(), context = ensureJourneyContext()) {
  const answers = property ? getAzAnswers(property.id) : {};
  const presetKey = guidedJourneyKey();
  return GUIDED_JOURNEY_SECTIONS
    .map((section) => {
      const mode = sectionModeForJourney(section, presetKey);
      const visible = mode !== "hidden";
      const questions = section.questions.filter((question) => !guidedQuestionSnapshot(question, property, answers, context).hidden);
      return {
        ...section,
        mode,
        visible,
        questions,
        priority: section.journeyPriority?.[presetKey] ?? section.journeyPriority?.full_compliance ?? 999
      };
    })
    .filter((section) => section.visible)
    .sort((a, b) => a.priority - b.priority);
}

function guidedProgress(sections, property = activeProperty()) {
  const answers = property ? getAzAnswers(property.id) : {};
  const relevantSections = sections.filter((section) => section.id !== "summary");
  const sectionSummaries = relevantSections.map((section) => {
    const questionSnapshots = section.questions.map((question) => ({
      question,
      snapshot: guidedQuestionSnapshot(question, property, answers)
    })).filter(({ snapshot }) => !snapshot.hidden);
    const totalQuestions = questionSnapshots.filter(({ question }) => !["info"].includes(question.type)).length || 0;
    const answeredQuestions = questionSnapshots.filter(({ question, snapshot }) => question.type === "info" || snapshot.answered).length;
    const complete = totalQuestions > 0 && answeredQuestions >= totalQuestions;
    return {
      id: section.id,
      totalQuestions,
      answeredQuestions,
      remainingQuestions: Math.max(0, totalQuestions - answeredQuestions),
      complete,
      percent: totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 100
    };
  });
  const totalQuestions = sectionSummaries.reduce((sum, section) => sum + section.totalQuestions, 0);
  const answeredQuestions = sectionSummaries.reduce((sum, section) => sum + Math.min(section.answeredQuestions, section.totalQuestions), 0);
  const completedSections = sectionSummaries.filter((section) => section.complete).length;
  return {
    totalSections: relevantSections.length,
    completedSections,
    totalQuestions,
    answeredQuestions,
    remainingQuestions: Math.max(0, totalQuestions - answeredQuestions),
    percent: totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
    sectionSummaries
  };
}

function syncGuidedStep(sections, propertyId = state.activePropertyId) {
  if (!sections.length) {
    state.activeStep = 0;
    return;
  }
  const meta = guidedMeta(propertyId);
  const currentId = meta.currentSectionId;
  const fromMeta = sections.findIndex((section) => section.id === currentId);
  if (fromMeta >= 0) {
    state.activeStep = fromMeta;
    return;
  }
  const preset = journeyPreset();
  const preferred = {
    epc: "epc",
    gas: "gas",
    eicr: "eicr",
    eviction: "eviction_evidence",
    mould: "mould_damp",
    evidence_pack: "evidence_pack",
    inspection: "inspections",
    licensing: "licensing",
    full_compliance: "property_basics"
  }[preset.primaryFocus] || "property_basics";
  const index = Math.max(0, sections.findIndex((section) => section.id === preferred));
  state.activeStep = index === -1 ? 0 : index;
  setGuidedCurrentSection(sections[state.activeStep]?.id, propertyId);
}

function refreshGuidedProgressState(propertyId = state.activePropertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;
  const sections = visibleGuidedSections(property);
  const progress = guidedProgress(sections, property);
  const completedSections = Object.fromEntries(progress.sectionSummaries.map((section) => [section.id, section.complete]));
  const currentSectionId = sections[state.activeStep]?.id || guidedMeta(propertyId).currentSectionId || sections[0]?.id || null;
  saveGuidedMeta({ currentSectionId, completedSections }, propertyId);
}

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function workspaceStorageKey(userId = null) {
  return `${LOCAL_WORKSPACE_STORAGE_PREFIX}${userId || "guest"}`;
}

function readWorkspaceStorage(userId = null) {
  return safeJsonParse(localStorage.getItem(workspaceStorageKey(userId)), {});
}

function writeWorkspaceStorage(userId = null, value = {}) {
  localStorage.setItem(workspaceStorageKey(userId), JSON.stringify(value));
}

function resetWorkspaceState() {
  properties.length = 0;
  state.scans = [];
  state.azChecklist = {};
  state.activePropertyId = null;
}

function hydrateWorkspaceEntries(entries = []) {
  resetWorkspaceState();
  entries.forEach(({ propertyId, checkerState, propertyData, documentScans }) => {
    state.azChecklist[propertyId] = unpackCheckerState(checkerState);
    mergePropertySnapshot(propertyId, checkerState?.propertySnapshot || propertyData);
    mergeScans(documentScans || []);
  });
  ensureActiveProperty();
}

function syncSetupStateAfterWorkspaceLoad() {
  if (!properties.length) {
    state.setup.isOpen = true;
    state.setup.createdPropertyId = "";
    return;
  }

  if (localStorage.getItem(ONBOARDING_STORAGE)) {
    state.setup.isOpen = false;
  }
}

async function getSupabaseSession() {
  if (DEMO_MODE) {
    return { client: null, user: null };
  }
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
  syncAllPropertyEvidence();
}

function propertySnapshot(property) {
  return JSON.parse(JSON.stringify(property));
}

function mergePropertySnapshot(propertyId, snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;
  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    Object.assign(property, { ...snapshot, id: propertyId });
    ensureEvidenceModel(property);
    ensureServiceRequestModel(property);
    syncPropertyEvidence(property);
    return;
  }
  const next = { ...snapshot, id: propertyId };
  ensureEvidenceModel(next);
  ensureServiceRequestModel(next);
  properties.push(next);
  syncPropertyEvidence(next);
}

function unpackCheckerState(value) {
  if (!value || typeof value !== "object") return {};
  return value.answers || value;
}

function loadLocalWorkspace(userId = null) {
  const saved = readWorkspaceStorage(userId);
  const entries = Object.entries(saved || {}).map(([propertyId, workspace]) => ({
    propertyId,
    checkerState: workspace.checkerState || workspace.checker_state || {},
    propertyData: workspace.propertySnapshot,
    documentScans: workspace.documentScans || workspace.document_scans || []
  }));

  // Older prototype builds used one global workspace key for every browser user.
  // Do not read that data into an authenticated account automatically.
  // It is safer to ignore it than to leak another landlord's property list.
  hydrateWorkspaceEntries(entries);
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  syncSetupStateAfterWorkspaceLoad();
}

async function loadPersistedWorkspace() {
  await loadAiPreferences();

  const { client, user } = await getSupabaseSession();
  if (!client || !user) {
    loadJourneyContextForSession(null);
    loadLocalWorkspace();
    state.saveStatus = DEMO_MODE ? "Demo mode · saved in this browser" : "Saved locally";
    state.saveTone = "local";
    return;
  }

  loadJourneyContextForSession(user.id);

  const { data, error } = await client
    .from(WORKSPACE_TABLE)
    .select("property_id, checker_state, document_scans, extracted_facts");

  if (error) {
    console.warn("Could not load CMP workspace", error);
    loadLocalWorkspace(user.id);
    state.saveStatus = "Local save active";
    state.saveTone = "local";
    return;
  }

  hydrateWorkspaceEntries((data || []).map((row) => ({
    propertyId: row.property_id,
    checkerState: row.checker_state || {},
    documentScans: row.document_scans || []
  })));
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  syncSetupStateAfterWorkspaceLoad();
  state.saveStatus = "Synced with Supabase";
  state.saveTone = "saved";
}

function saveWorkspaceLocally(propertyId, userId = null) {
  const saved = readWorkspaceStorage(userId);
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    delete saved[propertyId];
    writeWorkspaceStorage(userId, saved);
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
  writeWorkspaceStorage(userId, saved);
}

function removeWorkspaceLocally(propertyId, userId = null) {
  const saved = readWorkspaceStorage(userId);
  delete saved[propertyId];
  writeWorkspaceStorage(userId, saved);
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
  if (!propertyId) {
    setSaveStatus("Nothing to save", "idle");
    return;
  }

  const property = properties.find((item) => item.id === propertyId);
  const { client, user } = await getSupabaseSession();
  if (!property) {
    removeWorkspaceLocally(propertyId, user?.id || null);
    return;
  }

  saveWorkspaceLocally(propertyId, user?.id || null);
  if (!client || !user) {
    setSaveStatus(DEMO_MODE ? "Demo change saved in this browser" : "Saved in this browser", "local");
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
  return window.CMP_DOCUMENT_AI_KEY || state.aiSettings.key || localStorage.getItem(AI_KEY_STORAGE) || "";
}

async function loadAiPreferences() {
  const localPrefs = safeJsonParse(localStorage.getItem(LOCAL_AI_PREF_STORAGE), {});
  const localFileKey = window.CMP_DOCUMENT_AI_KEY || "";
  const localKey = getDocumentAiKey();
  state.aiSettings = {
    provider: localPrefs.provider || state.aiSettings.provider,
    endpoint: localPrefs.endpoint || state.aiSettings.endpoint,
    keyHint: localFileKey ? maskKey(localFileKey) : localPrefs.keyHint || localPrefs.key_hint || (localKey ? maskKey(localKey) : ""),
    keyPresent: Boolean(localKey),
    key: state.aiSettings.key || ""
  };

  const { client, user } = await getSupabaseSession();
  if (!client || !user) return;

  const { data, error } = await client
    .from(AI_PREF_TABLE)
    .select("*")
    .maybeSingle();

  if (!error && data) {
    const supabaseKey = data.document_reader_key || data.api_key || data.key || data.openai_key || "";
    state.aiSettings = {
      provider: data.provider || state.aiSettings.provider,
      endpoint: data.endpoint || state.aiSettings.endpoint,
      keyHint: supabaseKey ? maskKey(supabaseKey) : data.key_hint || state.aiSettings.keyHint,
      keyPresent: Boolean(localKey || supabaseKey || data.key_hint),
      key: supabaseKey
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
  ensureJourneyContext();
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

function demoScenario() {
  return safeJsonParse(localStorage.getItem(DEMO_STUDIO_STORAGE), null);
}

function saveDemoScenarioKey(key) {
  if (!DEMO_MODE) return;
  if (key && DEMO_SCENARIOS[key]) {
    localStorage.setItem(DEMO_STUDIO_STORAGE, JSON.stringify(key));
  } else {
    localStorage.removeItem(DEMO_STUDIO_STORAGE);
  }
}

function demoScenarioKeyForJourney() {
  const presetKey = journeyPresetKey();
  if (presetKey === "epc_only" || presetKey === "epc_related") return "epc_only";
  if (presetKey === "eviction") return "eviction";
  if (presetKey === "mould") return "mould";
  return "full_compliance";
}

function demoPostcodeMeta(postcode) {
  return {
    postcode: formatPostcode(postcode),
    post_town: "Birmingham",
    admin_district: "Birmingham",
    region: "West Midlands",
    country: "England",
    latitude: 52.4862,
    longitude: -1.8904
  };
}

function epcDemoExpiry(issueDate, rating) {
  if (!issueDate) return "";
  const explicitYears = rating === "E" ? 9 : 10;
  return addYears(issueDate, explicitYears)?.toISOString().slice(0, 10) || "";
}

function demoAddressMatches(postcode, postcodeMeta = demoPostcodeMeta(postcode)) {
  const normalizedPostcode = formatPostcode(postcodeMeta?.postcode || postcode);
  return DEMO_ADDRESS_TEMPLATES.map((template, index) => {
    const issueDate = template.rating ? `20${16 + index}-0${(index % 4) + 1}-1${index}`.slice(0, 10) : "";
    const expiryDate = template.rating ? epcDemoExpiry(issueDate, template.rating) : "";
    const address = `${template.houseNumber} ${template.roadName}, ${normalizedPostcode}, ${template.city}`;
    const match = {
      id: `demo-${normalizePostcode(normalizedPostcode)}-${index + 1}`,
      address,
      shortName: `${template.houseNumber} ${template.roadName}`,
      houseNumber: template.houseNumber,
      roadName: template.roadName,
      city: template.city,
      postcode: normalizedPostcode,
      type: template.type,
      bedrooms: template.bedrooms,
      storeys: template.storeys,
      hasGas: template.hasGas,
      fixedCombustion: template.fixedCombustion,
      source: template.rating ? "Demo EPC profile" : "Demo address profile",
      uprn: `100000000${index + 1}`,
      latitude: postcodeMeta?.latitude,
      longitude: postcodeMeta?.longitude,
      epc: {
        rating: template.rating || "",
        currentScore: template.currentScore,
        issue: issueDate,
        inspectionDate: issueDate,
        expiry: expiryDate,
        certificate: template.rating ? `DEMO-EPC-${normalizePostcode(normalizedPostcode)}-${index + 1}` : "",
        floorArea: template.bedrooms ? `${70 + index * 11} sq m` : "",
        potential: template.potential || "",
        potentialScore: template.potentialScore,
        builtForm: template.type.includes("Flat") ? "Mid-floor flat" : "End-terrace",
        localAuthority: "Birmingham",
        heating: template.hasGas ? "Mains gas boiler" : "Electric heating",
        walls: index % 2 === 0 ? "Cavity wall, insulated" : "Solid brick, partial insulation",
        roof: "Pitched roof with insulation",
        windows: "Fully double glazed",
        source: template.rating ? "Demo EPC import" : "Demo property profile",
        status: template.rating
          ? epcStatus({ rating: template.rating, issue: issueDate, certificate: `DEMO-EPC-${normalizePostcode(normalizedPostcode)}-${index + 1}`, expiry: expiryDate })
          : "unknown",
        raw: {
          demo: true,
          postcode: normalizedPostcode
        }
      }
    };
    match.identity = identityFromMatch(match);
    return match;
  });
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
  state.journeyContext = readJourneyContext() || defaultJourneyContext();
  state.setup.isOpen = !localStorage.getItem(ONBOARDING_STORAGE) || !properties.length;
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
}

function getEpcBearerToken() {
  try {
    return String(localStorage.getItem(EPC_TOKEN_STORAGE) || "").trim();
  } catch {
    return "";
  }
}

function setEpcBearerToken(token) {
  const next = String(token || "").trim();
  try {
    if (next) {
      localStorage.setItem(EPC_TOKEN_STORAGE, next);
    } else {
      localStorage.removeItem(EPC_TOKEN_STORAGE);
    }
  } catch {
    // Ignore browser storage failures in prototype mode.
  }
  return next;
}

function hasEpcCredentials() {
  return Boolean(getEpcBearerToken());
}

function epcAuthHeader() {
  return `Bearer ${getEpcBearerToken()}`;
}

function identityFromMatch(match) {
  const uprn = String(match?.uprn || "").trim();
  const certificate = normalizeCertificateRef(match?.epc?.certificate);
  const addressKey = normalizedAddressKey(match?.address, match?.postcode);
  const propertyId = uprn
    ? `uprn:${uprn}`
    : addressKey
      ? `address:${addressKey}`
      : certificate
        ? `epc:${certificate}`
        : `property:${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

  return { propertyId, uprn, certificate, addressKey };
}

function identityFromProperty(property) {
  return {
    propertyId: property?.id || null,
    uprn: String(property?.uprn || "").trim(),
    certificate: normalizeCertificateRef(property?.epc?.certificate),
    addressKey: property?.identity?.addressKey || normalizedAddressKey(property?.address, property?.postcode)
  };
}

function findExistingPropertyForMatch(match) {
  const identity = identityFromMatch(match);
  return properties.find((property) => {
    const existing = identityFromProperty(property);
    if (identity.uprn && existing.uprn && identity.uprn === existing.uprn) return true;
    if (identity.addressKey && existing.addressKey && identity.addressKey === existing.addressKey) return true;
    if (identity.certificate && existing.certificate && identity.certificate === existing.certificate) return true;
    return false;
  }) || null;
}

function chooseBestEpcValue(currentValue, incomingValue) {
  return hasMeaningfulValue(incomingValue) ? incomingValue : currentValue;
}

function applyEpcMatchToProperty(property, match, options = {}) {
  const existingIdentity = identityFromProperty(property);
  const incomingIdentity = identityFromMatch(match);
  const currentEpc = property.epc || {};
  const incomingEpc = match.epc || {};
  property.docs = Array.isArray(property.docs) ? property.docs : [];
  property.timeline = Array.isArray(property.timeline) ? property.timeline : [];
  ensureEvidenceModel(property);

  property.identity = {
    propertyId: property.id,
    addressKey: normalizedAddressKey(property.address || match.address, property.postcode || match.postcode) || existingIdentity.addressKey || incomingIdentity.addressKey,
    certificate: incomingIdentity.certificate || existingIdentity.certificate,
    source: "Energy Performance Data API"
  };

  if (!property.uprn && incomingIdentity.uprn) {
    property.uprn = incomingIdentity.uprn;
  }

  if (!property.address && match.address) {
    property.address = match.address;
    property.shortName = match.shortName;
  }

  if (!property.postcode && match.postcode) property.postcode = match.postcode;
  if (!property.type && match.type) property.type = match.type;
  if (!hasMeaningfulValue(property.bedrooms) && hasMeaningfulValue(match.bedrooms)) property.bedrooms = match.bedrooms;
  if (!hasMeaningfulValue(property.storeys) && hasMeaningfulValue(match.storeys)) property.storeys = match.storeys;
  if (!isKnownBoolean(property.hasGas) && isKnownBoolean(match.hasGas)) property.hasGas = match.hasGas;
  if (!isKnownBoolean(property.fixedCombustion) && isKnownBoolean(match.fixedCombustion)) property.fixedCombustion = match.fixedCombustion;

  property.epc = {
    ...currentEpc,
    rating: chooseBestEpcValue(currentEpc.rating, incomingEpc.rating),
    currentScore: chooseBestEpcValue(currentEpc.currentScore, incomingEpc.currentScore),
    potential: chooseBestEpcValue(currentEpc.potential, incomingEpc.potential),
    potentialScore: chooseBestEpcValue(currentEpc.potentialScore, incomingEpc.potentialScore),
    issue: chooseBestEpcValue(currentEpc.issue, incomingEpc.issue),
    inspectionDate: chooseBestEpcValue(currentEpc.inspectionDate, incomingEpc.inspectionDate),
    expiry: chooseBestEpcValue(currentEpc.expiry, incomingEpc.expiry),
    certificate: chooseBestEpcValue(currentEpc.certificate, incomingEpc.certificate),
    floorArea: chooseBestEpcValue(currentEpc.floorArea, incomingEpc.floorArea),
    builtForm: chooseBestEpcValue(currentEpc.builtForm, incomingEpc.builtForm),
    localAuthority: chooseBestEpcValue(currentEpc.localAuthority, incomingEpc.localAuthority),
    heating: chooseBestEpcValue(currentEpc.heating, incomingEpc.heating),
    walls: chooseBestEpcValue(currentEpc.walls, incomingEpc.walls),
    roof: chooseBestEpcValue(currentEpc.roof, incomingEpc.roof),
    windows: chooseBestEpcValue(currentEpc.windows, incomingEpc.windows),
    source: incomingEpc.source || currentEpc.source || "Energy Performance Data API",
    status: epcStatus({
      rating: chooseBestEpcValue(currentEpc.rating, incomingEpc.rating),
      issue: chooseBestEpcValue(currentEpc.issue, incomingEpc.issue),
      certificate: chooseBestEpcValue(currentEpc.certificate, incomingEpc.certificate),
      expiry: chooseBestEpcValue(currentEpc.expiry, incomingEpc.expiry)
    }),
    raw: incomingEpc.raw || currentEpc.raw || null
  };

  if (options.addDocs !== false && property.epc.issue && !property.docs.some((doc) => doc.key === "epc" && doc.source === "Energy Performance Data API")) {
    property.docs.unshift({
      key: "epc",
      title: "EPC register result",
      date: property.epc.issue,
      source: "Energy Performance Data API"
    });
  }

  syncPropertyEvidence(property);
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

function epcRawRecord(row) {
  return {
    uprn: row.uprn || "",
    certificateNumber: row.certificateNumber || row["lmk-key"] || "",
    currentEnergyEfficiencyBand: row.currentEnergyEfficiencyBand || row["current-energy-rating"] || "",
    currentEnergyEfficiency: row.currentEnergyEfficiency || row["current-energy-efficiency"] || "",
    potentialEnergyEfficiencyBand: row.potentialEnergyEfficiencyBand || row["potential-energy-rating"] || "",
    potentialEnergyEfficiency: row.potentialEnergyEfficiency || row["potential-energy-efficiency"] || "",
    lodgementDate: row.lodgementDate || row["lodgement-date"] || "",
    inspectionDate: row.inspectionDate || row["inspection-date"] || "",
    totalFloorArea: row.totalFloorArea || row["total-floor-area"] || "",
    builtForm: row.builtForm || row["built-form"] || "",
    localAuthorityLabel: row.localAuthorityLabel || row["local-authority-label"] || "",
    mainHeatDescription: row.mainHeatDescription || row["mainheat-description"] || "",
    wallsDescription: row.wallsDescription || row["walls-description"] || "",
    roofDescription: row.roofDescription || row["roof-description"] || "",
    windowsDescription: row.windowsDescription || row["windows-description"] || ""
  };
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
  const currentScore = safeNumber(row.currentEnergyEfficiency || row["current-energy-efficiency"]);
  const potentialScore = safeNumber(row.potentialEnergyEfficiency || row["potential-energy-efficiency"]);
  const issueDate = row.lodgementDate || row["lodgement-date"] || row.registrationDate || row["registration-date"] || "";
  const inspectionDate = row.inspectionDate || row["inspection-date"] || "";
  const expiryDate = epcExpiryDate(issueDate, row.expiryDate || row["expiry-date"] || "");
  const floorAreaNumber = safeNumber(row.totalFloorArea || row["total-floor-area"]);
  const builtForm = titleCase(row.builtForm || row["built-form"] || "");
  const localAuthority = row.localAuthorityLabel || row["local-authority-label"] || row.localAuthority || "";
  const heating = row.mainHeatDescription || row["mainheat-description"] || row["main-heat-description"] || row["main-fuel"] || "";
  const walls = row.wallsDescription || row["walls-description"] || "";
  const roof = row.roofDescription || row["roof-description"] || "";
  const windows = row.windowsDescription || row["windows-description"] || "";
  const heatingDescriptor = `${heating} ${row["main-fuel"] || ""}`.trim();
  const hasGas = heatingDescriptor ? /gas/i.test(heatingDescriptor) : null;
  const fixedCombustion = heatingDescriptor ? /gas|oil|solid fuel|wood|coal/i.test(heatingDescriptor) : null;
  const match = {
    id: certificateNumber || row.uprn || normalizedAddressKey(address, postcode),
    address,
    shortName: address.split(",")[0] || "Property",
    houseNumber: street.houseNumber,
    roadName: street.roadName || titleCase(String(addressLine2).toLowerCase()),
    city,
    postcode,
    type: propertyType || "",
    bedrooms: null,
    storeys: null,
    hasGas,
    fixedCombustion,
    epc: {
      rating: row.currentEnergyEfficiencyBand || row["current-energy-rating"] || "",
      currentScore,
      issue: issueDate,
      inspectionDate,
      expiry: expiryDate,
      certificate: certificateNumber,
      floorArea: floorAreaNumber ? `${floorAreaNumber} sq m` : "",
      potential: row.potentialEnergyEfficiencyBand || row["potential-energy-rating"] || "",
      potentialScore,
      builtForm,
      localAuthority,
      heating,
      walls,
      roof,
      windows,
      source: "Energy Performance Data API",
      status: epcStatus({
        rating: row.currentEnergyEfficiencyBand || row["current-energy-rating"] || "",
        issue: issueDate,
        certificate: certificateNumber,
        expiry: expiryDate
      }),
      raw: epcRawRecord(row)
    },
    source: "Energy Performance Data API",
    uprn: row.uprn || "",
    latitude: postcodeMeta?.latitude,
    longitude: postcodeMeta?.longitude
  };
  match.identity = identityFromMatch(match);
  return match;
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
    let postcodeMeta;
    try {
      postcodeMeta = await lookupPostcode(postcode);
    } catch (error) {
      if (!DEMO_MODE) throw error;
      postcodeMeta = demoPostcodeMeta(postcode);
      state.setup.message = "Demo mode is using a realistic postcode fallback for this preview.";
    }
    state.setup.postcodeMeta = postcodeMeta;

    if (DEMO_MODE && !hasEpcCredentials()) {
      state.setup.addressMatches = demoAddressMatches(postcode, postcodeMeta);
      state.setup.selectedAddressId = state.setup.addressMatches[0].id;
      state.setup.searchDone = true;
      state.setup.apiStatus = "ready";
      state.setup.message = "Demo mode loaded a realistic address list and EPC preview for this postcode.";
      return;
    }

    if (!hasEpcCredentials()) {
      state.setup.addressMatches = [
        postcodeFallbackMatch(postcodeMeta, "Add the prototype bearer token to search the live EPC register from this browser.")
      ];
      state.setup.selectedAddressId = state.setup.addressMatches[0].id;
      state.setup.searchDone = true;
      state.setup.apiStatus = "needs-epc-access";
      state.setup.message = "Postcode found. Add the prototype bearer token to load live EPC address matches, or continue with the verified postcode fallback.";
      return;
    }

    state.setup.message = "Postcode found. Searching the official EPC register for address matches...";
    renderAll();
    const rows = await searchEpcByPostcode(postcode);
    state.setup.addressMatches = rows.map((row) => epcMatchFromRow(row, postcodeMeta));
    if (!state.setup.addressMatches.length) {
      state.setup.addressMatches = DEMO_MODE
        ? demoAddressMatches(postcode, postcodeMeta)
        : [
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
      : DEMO_MODE
        ? "Live EPC results were unavailable, so demo address cards were loaded instead."
        : "Postcode found. CMP could not pull a live EPC address list here, so it created a verified postcode match you can use straight away.";
  } catch (error) {
    if (DEMO_MODE) {
      const fallbackMeta = state.setup.postcodeMeta || demoPostcodeMeta(postcode);
      state.setup.addressMatches = demoAddressMatches(postcode, fallbackMeta);
      state.setup.selectedAddressId = state.setup.addressMatches[0].id;
      state.setup.searchDone = true;
      state.setup.apiStatus = "ready";
      state.setup.message = "Demo mode kept the journey moving with simulated address and EPC data.";
      return;
    }
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

function openEpcRefreshSelection(property, matches, message) {
  state.setup.isOpen = true;
  state.setup.mode = "refresh";
  state.setup.pendingPropertyId = property.id;
  state.setup.postcode = property.postcode || "";
  state.setup.searchDone = true;
  state.setup.isSearching = false;
  state.setup.isChecking = false;
  state.setup.addressMatches = matches;
  state.setup.selectedAddressId = "";
  state.setup.createdPropertyId = "";
  state.setup.apiStatus = matches.length ? "ready" : "no-epc-results";
  state.setup.message = message;
  renderAll();
  document.querySelector("#propertySetup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolveEpcMatchesForProperty(property, matches) {
  const propertyIdentity = identityFromProperty(property);
  const byUprn = propertyIdentity.uprn
    ? matches.filter((match) => String(match.uprn || "").trim() === propertyIdentity.uprn)
    : [];
  if (byUprn.length === 1) return { status: "matched", match: byUprn[0] };
  if (byUprn.length > 1) return { status: "choose", matches: byUprn, reason: "multiple-uprn" };

  const byCertificate = propertyIdentity.certificate
    ? matches.filter((match) => normalizeCertificateRef(match.epc?.certificate) === propertyIdentity.certificate)
    : [];
  if (byCertificate.length === 1) return { status: "matched", match: byCertificate[0] };
  if (byCertificate.length > 1) return { status: "choose", matches: byCertificate, reason: "multiple-certificate" };

  const byAddress = propertyIdentity.addressKey
    ? matches.filter((match) => identityFromMatch(match).addressKey === propertyIdentity.addressKey)
    : [];
  if (byAddress.length === 1) return { status: "matched", match: byAddress[0] };
  if (byAddress.length > 1) return { status: "choose", matches: byAddress, reason: "multiple-address" };

  if (matches.length === 1 && property.postcode && normalizePostcode(matches[0].postcode) === normalizePostcode(property.postcode)) {
    return { status: "matched", match: matches[0] };
  }

  if (matches.length > 1) {
    return { status: "choose", matches, reason: "multiple-postcode" };
  }

  return { status: "none", matches: [] };
}

function buildPropertyFromAddress(match) {
  const identity = identityFromMatch(match);
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
  const property = {
    id: identity.propertyId,
    identity: {
      propertyId: identity.propertyId,
      addressKey: identity.addressKey,
      certificate: identity.certificate,
      source: "Energy Performance Data API"
    },
    shortName: address.split(",")[0] || match.shortName,
    address,
    houseNumber,
    roadName,
    city,
    postcode,
    type: match.type || "",
    bedrooms: hasMeaningfulValue(match.bedrooms) ? match.bedrooms : null,
    storeys: hasMeaningfulValue(match.storeys) ? match.storeys : null,
    hasGas: match.hasGas,
    fixedCombustion: match.fixedCombustion,
    uprn: identity.uprn || "",
    epc: { ...match.epc },
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
    possession: { planned: null, noticeDraft: null },
    serviceRequests: [],
    evidence: emptyEvidenceBuckets(),
    docs: epcIssue ? [{ key: "epc", title: "EPC register result", date: epcIssue, source: match.source || "Energy Performance Data API" }] : [],
    timeline: [
      {
        id: `system:${identity.propertyId}:property-found`,
        type: "system",
        category: "other",
        title: "Property found",
        description: "Postcode and EPC register search selected this address and started the compliance setup.",
        eventDate: todayIso,
        dueDate: null,
        source: "system",
        linkedEvidenceId: null,
        linkedQuestionId: null,
        status: "completed",
        confidence: null,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
  applyEpcMatchToProperty(property, match, { addDocs: false });
  syncPropertyEvidence(property);
  return property;
}

function resetPropertySetup(open = true) {
  state.setup = {
    mode: "create",
    isOpen: open,
    postcode: "",
    searchDone: false,
    selectedAddressId: "",
    pendingPropertyId: null,
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

function seedDemoScenarioProperty(property, scenarioKey = demoScenarioKeyForJourney()) {
  if (!property || !DEMO_MODE) return;
  const answers = getAzAnswers(property.id);
  const todayIso = new Date().toISOString().slice(0, 10);
  const lastMonth = addMonths(todayIso, -1)?.toISOString().slice(0, 10) || todayIso;
  const sixMonthsAgo = addMonths(todayIso, -6)?.toISOString().slice(0, 10) || todayIso;
  const threeMonthsAgo = addMonths(todayIso, -3)?.toISOString().slice(0, 10) || todayIso;

  Object.assign(answers, {
    notice_evidence: "unknown",
    tenant_communications: "unknown",
    mould_report: "unknown",
    repair_history: "unknown",
    mould_communications: "unknown"
  });

  property.tenancy.currentlyTenanted = true;
  property.alarms.smokeEachStorey = true;
  property.alarms.coAlarm = property.fixedCombustion === true ? true : property.alarms.coAlarm;
  property.alarms.testedAtStart = null;
  property.inspections.last = sixMonthsAgo;

  switch (scenarioKey) {
    case "epc_only":
      property.tenancy.currentlyTenanted = null;
      property.inspections.last = "";
      property.hasGas = property.hasGas ?? null;
      property.deposit.taken = null;
      property.tenancy.agreement = null;
      setTimelineEvent(property, `demo:${property.id}:epc-note`, true, {
        type: "system",
        category: "epc",
        title: "Demo EPC import",
        description: "CMP imported the EPC details and left wider checks neutral until you decide to continue.",
        eventDate: todayIso,
        source: "system",
        status: "completed"
      });
      break;
    case "eviction":
      property.tenancy.currentlyTenanted = true;
      property.tenancy.agreement = true;
      property.tenancy.epcServed = true;
      property.tenancy.gasServed = property.hasGas === true ? null : "na";
      property.deposit.taken = true;
      property.deposit.protected = true;
      property.deposit.prescribedInfo = null;
      answers.tenant_communications = "yes";
      setTimelineEvent(property, `demo:${property.id}:tenancy-started`, true, {
        type: "evidence",
        category: "tenancy",
        title: "Tenancy agreement recorded",
        description: "The tenancy agreement is recorded, but CMP still needs the supporting file upload.",
        eventDate: sixMonthsAgo,
        source: "journey_answer",
        status: "completed"
      });
      setTimelineEvent(property, `demo:${property.id}:communications`, true, {
        type: "communication",
        category: "tenant_communication",
        title: "Tenant communication logged",
        description: "A communication trail is recorded for this property. Add emails or letters to strengthen the pack.",
        eventDate: lastMonth,
        source: "manual",
        status: "review_needed"
      });
      break;
    case "mould":
      property.tenancy.currentlyTenanted = true;
      property.inspections.last = threeMonthsAgo;
      answers.mould_report = "yes";
      answers.repair_history = "yes";
      answers.mould_communications = "yes";
      answers.tenant_communications = "yes";
      upsertEvidenceItem(property, "mould_damp", (item) => item.linkedQuestionId === "demo_mould_report", {
        id: `demo:${property.id}:mould-report`,
        title: "Damp and mould report",
        source: "manual",
        date: threeMonthsAgo,
        status: "review_needed",
        notes: "Demo mode: tenant reported mould in the front bedroom."
      });
      upsertEvidenceItem(property, "repairs", (item) => item.linkedQuestionId === "demo_repair_visit", {
        id: `demo:${property.id}:repair-visit`,
        title: "Repair visit note",
        source: "manual",
        date: lastMonth,
        status: "review_needed",
        notes: "Demo mode: extractor fan replacement was scheduled, but follow-up evidence is still missing."
      });
      setTimelineEvent(property, `demo:${property.id}:mould-reported`, true, {
        type: "note",
        category: "mould_damp",
        title: "Mould issue reported",
        description: "The issue has been logged. Add photos, inspection notes, or follow-up actions to complete the case history.",
        eventDate: threeMonthsAgo,
        source: "manual",
        status: "warning"
      });
      break;
    default:
      property.tenancy.currentlyTenanted = true;
      property.tenancy.agreement = true;
      property.deposit.taken = true;
      property.deposit.protected = null;
      property.deposit.prescribedInfo = null;
      property.alarms.testedAtStart = true;
      setTimelineEvent(property, `demo:${property.id}:inspection`, true, {
        type: "inspection",
        category: "inspection",
        title: "Inspection note added",
        description: "Demo mode imported one recent inspection to make the dashboard feel alive.",
        eventDate: sixMonthsAgo,
        source: "manual",
        status: "completed"
      });
      break;
  }

  syncPropertyEvidence(property);
  syncPropertyTimeline(property);
  refreshGuidedProgressState(property.id);
}

function loadDemoScenario(scenarioKey = "demo_property") {
  if (!DEMO_MODE) return;
  const scenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS.demo_property;
  resetWorkspaceState();
  writeWorkspaceStorage(null, {});
  state.setup.isOpen = false;
  state.setup.createdPropertyId = "";
  state.setup.message = "";
  state.scans = [];
  state.azChecklist = {};

  saveDemoScenarioKey(scenarioKey);
  persistJourneyContext({
    entryService: scenario.entryService,
    focusMode: scenario.focusMode,
    selectedPropertyId: null,
    answeredQuestions: {},
    sourceRoute: "demo-studio"
  }, { replace: true });

  const matches = demoAddressMatches(scenario.postcode, demoPostcodeMeta(scenario.postcode));
  const property = buildPropertyFromAddress(matches[0]);
  properties.unshift(property);
  applyJourneySelection(property.id);
  completeOnboarding();
  seedDemoScenarioProperty(property, scenarioKey);
  saveWorkspaceLocally(property.id, null);
  setSaveStatus(`${scenario.title} loaded`, "saved");
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  renderAll();
}

function resetDemoStudio() {
  if (!DEMO_MODE) return;
  resetWorkspaceState();
  writeWorkspaceStorage(null, {});
  saveDemoScenarioKey(null);
  window.CMPJourney?.clear?.();
  localStorage.removeItem(ONBOARDING_STORAGE);
  resetPropertySetup(true);
  setSaveStatus("Demo reset", "idle");
  renderAll();
}

function openExistingProperty(property, message = "") {
  applyJourneySelection(property.id);
  state.setup.isOpen = false;
  state.setup.createdPropertyId = property.id;
  state.setup.message = message || "This property already exists in the portfolio.";
  completeOnboarding();
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  renderAll();
}

function refreshExistingPropertyFromMatch(propertyId, match) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;

  applyEpcMatchToProperty(property, match);
  setTimelineEvent(property, `system:${property.id}:epc-refresh`, true, {
    type: "system",
    category: "epc",
    title: "EPC register data refreshed",
    description: match.epc?.rating
      ? `Matched the selected EPC record and refreshed rating ${match.epc.rating}.`
      : "Matched the selected EPC record and refreshed the property facts.",
    eventDate: new Date().toISOString().slice(0, 10),
    dueDate: property.epc?.expiry || null,
    source: "system",
    linkedEvidenceId: bestEvidenceItem(property, "epc")?.id || null,
    linkedQuestionId: "epc_import",
    status: "completed",
    confidence: "high"
  });
  applyJourneySelection(property.id);
  state.setup.isChecking = false;
  state.setup.createdPropertyId = property.id;
  state.setup.isOpen = false;
  state.setup.pendingPropertyId = null;
  state.setup.mode = "create";
  state.setup.message = "Existing property opened and EPC data refreshed.";
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  queueWorkspaceSave(property.id);
  renderAll();
}

function createPropertyFromMatch(match) {
  const existing = findExistingPropertyForMatch(match);
  if (existing) {
    applyEpcMatchToProperty(existing, match);
    queueWorkspaceSave(existing.id);
    openExistingProperty(existing, "This address already exists in the portfolio. CMP opened the existing record instead of creating a duplicate.");
    return;
  }

  const property = buildPropertyFromAddress(match);
  if (DEMO_MODE) {
    seedDemoScenarioProperty(property, demoScenarioKeyForJourney());
  }
  properties.unshift(property);
  applyJourneySelection(property.id);
  state.setup.isChecking = false;
  state.setup.isOpen = false;
  state.setup.pendingPropertyId = null;
  state.setup.mode = "create";
  state.setup.createdPropertyId = property.id;
  state.setup.message = match.epc?.rating
    ? "Property added. EPC information found."
    : "Property added. The dashboard is ready, and the remaining checks can be guided step by step.";
  completeOnboarding();
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  queueWorkspaceSave(property.id);
  setSaveStatus(state.setup.message, "local");
  renderAll();
  window.setTimeout(() => {
    document.querySelector("#guided-check")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

function beginPropertyImportFlow(match, { isRefreshMode = false } = {}) {
  state.setup.isChecking = true;
  state.setup.message = isRefreshMode ? "Checking EPC records..." : "Checking EPC records...";
  renderAll();

  window.setTimeout(() => {
    state.setup.message = isRefreshMode ? "Importing property details..." : "Importing property details...";
    renderAll();
  }, 350);

  window.setTimeout(() => {
    state.setup.message = isRefreshMode ? "Updating the dashboard..." : "Building your dashboard...";
    renderAll();
  }, 800);

  window.setTimeout(() => {
    if (isRefreshMode && state.setup.pendingPropertyId) {
      refreshExistingPropertyFromMatch(state.setup.pendingPropertyId, match);
      return;
    }
    createPropertyFromMatch(match);
  }, DEMO_MODE ? 1250 : 1000);
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
  const statusTone = state.setup.apiStatus === "error" ? "error" : state.setup.apiStatus === "needs-epc-access" ? "warning" : "neutral";
  const isRefreshMode = state.setup.mode === "refresh";
  const modulePlan = dashboardModulePlan();
  const epcBearerToken = getEpcBearerToken();

  panel.innerHTML = `
    <div class="setup-copy">
      <span class="section-kicker">${escapeHtml(modulePlan.journeyLabel)}</span>
      <h2 id="propertySetupTitle">${isRefreshMode ? "Choose the EPC record to refresh." : "Add your property"}</h2>
      <p>${isRefreshMode
        ? "CMP matched this postcode but needs you to confirm which EPC record belongs to the selected property before refreshing anything."
        : "Enter a postcode and choose the right address. CMP will look for EPC information automatically and build the dashboard around the journey you started from."}</p>
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
          ${state.setup.isSearching ? "Searching..." : isRefreshMode ? "Find EPC records" : "Find address"}
        </button>
      </div>
      <small>${DEMO_MODE ? "Demo mode will keep this flow moving, even if live EPC data is unavailable." : "Postcodes.io validates the postcode only. Address options and EPC data come from the Energy Performance Data domestic search API."}</small>
      <details class="epc-access" ${hasEpcCredentials() ? "" : "open"}>
        <summary>Energy Performance Data API access</summary>
        <div class="epc-access-grid">
          <label>
            <span>Bearer token</span>
            <input id="epcBearerToken" type="password" value="${escapeHtml(epcBearerToken)}" placeholder="GOV.UK One Login API bearer token">
          </label>
        </div>
        <small>${DEMO_MODE ? "Optional in demo mode: if the live token is missing, CMP falls back to realistic simulated EPC data." : "Prototype only: the token is stored in this browser for testing. A production build should move this request behind a secure server function."}</small>
      </details>
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
                  <small>${escapeHtml(match.type || "Property type not returned")} · ${escapeHtml(match.epc.rating ? "EPC match found" : "EPC needs checking")} · ${escapeHtml(match.source)}</small>
                </span>
                <span class="address-option-action">${match.id === state.setup.selectedAddressId ? "Selected" : "Use this property"}</span>
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
        <strong>${state.setup.isChecking ? (isRefreshMode ? "Refreshing EPC data..." : "Checking EPC records...") : activeMatch && !hasManualAddress ? "Complete the address" : state.setup.createdPropertyId ? "Property added" : "What happens next?"}</strong>
        <span>${state.setup.isChecking
          ? isRefreshMode
            ? "CMP is applying the selected EPC record to the existing property."
            : "CMP is importing the property details and building the dashboard."
          : activeMatch && !hasManualAddress
            ? "Add the missing house number and road name first."
            : state.setup.createdPropertyId
              ? escapeHtml(state.setup.message)
              : isRefreshMode
                ? "Choose the exact EPC record before CMP refreshes the selected property."
                : `After you choose an EPC address, CMP opens the ${escapeHtml(modulePlan.journeyTitle)} view for this property.`}</span>
      </div>
      <button class="secondary-button" type="button" id="continueSetupButton" ${canCreateProperty || state.setup.createdPropertyId ? "" : "disabled"}>
        <i data-lucide="${state.setup.createdPropertyId ? "arrow-down" : "sparkles"}"></i>
        ${state.setup.createdPropertyId ? "Open property dashboard" : isRefreshMode ? "Import this EPC record" : "Import this property"}
      </button>
    </div>
  `;

  panel.querySelector("#postcodeSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = panel.querySelector("#postcodeSearch")?.value || "";
    const tokenValue = panel.querySelector("#epcBearerToken")?.value || "";
    setEpcBearerToken(tokenValue);
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
      const continueButton = panel.querySelector("#continueSetupButton");
      if (continueButton && !state.setup.createdPropertyId) {
        continueButton.disabled = !complete || state.setup.isChecking;
      }
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
        resultTitle.textContent = complete ? "What happens next?" : "Complete the address";
        resultCopy.textContent = complete
          ? `After you choose an address, CMP imports the key details and opens the ${modulePlan.journeyTitle} view for this property.`
          : "Add the missing house number and road name first.";
      }
    });
  });

  panel.querySelector("#epcBearerToken")?.addEventListener("change", (event) => {
    setEpcBearerToken(event.target.value);
  });

  panel.querySelector("#continueSetupButton")?.addEventListener("click", () => {
    if (state.setup.createdPropertyId) {
      document.querySelector("#guided-check")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const match = state.setup.addressMatches.find((item) => item.id === state.setup.selectedAddressId);
    if (!match) return;
    if (match.requiresManualAddress && (!state.setup.manualAddress.houseNumber.trim() || !state.setup.manualAddress.roadName.trim())) {
      state.setup.message = "Add the house number and road name before creating the property.";
      renderAll();
      return;
    }
    if (!isRefreshMode) {
      const existing = findExistingPropertyForMatch(match);
      if (existing) {
        const shouldOpenExisting = window.confirm("This property already exists in the portfolio. Open the existing property instead of creating a duplicate?");
        if (!shouldOpenExisting) return;
        applyEpcMatchToProperty(existing, match);
        queueWorkspaceSave(existing.id);
        openExistingProperty(existing, "CMP found an existing match and opened it instead of creating a duplicate property.");
        return;
      }
    }
    beginPropertyImportFlow(match, { isRefreshMode });
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
        <strong>No properties added yet</strong>
        <span>Add your first property to start checking compliance.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = properties.map((property) => {
    const evaluation = evaluateProperty(property);
    const active = property.id === state.activePropertyId ? " is-active" : "";
    const propertyScore = evaluation.assessment.mode === "score"
      ? `${evaluation.score}%`
      : "Setup";
    return `
      <article class="property-row${active}">
        <button class="property-button${active}" type="button" data-property="${property.id}">
          <span>
            <strong>${escapeHtml(property.shortName)}</strong>
            <span>${escapeHtml(property.type || "Property")}${property.postcode ? ` - ${escapeHtml(property.postcode)}` : ""}</span>
          </span>
          <span class="property-score">${escapeHtml(propertyScore)}</span>
        </button>
        <button class="property-remove" type="button" data-remove-property="${property.id}" aria-label="Remove ${escapeHtml(property.shortName)}">
          <i data-lucide="trash-2"></i>
        </button>
      </article>
    `;
  }).join("");

  list.querySelectorAll("[data-property]").forEach((button) => {
    button.addEventListener("click", () => {
      applyJourneySelection(button.dataset.property);
      state.activeStep = journeyPreset().defaultStep;
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
  persistJourneyContext(contextForDashboardJourney(journeyId));
  applyJourneyNavigation({ forcePanel: true, forceStep: true });
  renderAll();
  document.querySelector(state.activeJourney === "upload" ? '[data-dashboard-panel="evidence"]' : `[data-dashboard-panel="${state.activeDashboardPanel}"]`)
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
  const plan = dashboardModulePlan();
  if (plan && !plan.visibleModules.includes(state.activeDashboardPanel)) {
    state.activeDashboardPanel = plan.defaultPanel;
  }

  document.querySelectorAll("[data-dashboard-tab]").forEach((tab) => {
    const visible = !plan || plan.visibleModules.includes(tab.dataset.dashboardTab);
    tab.hidden = !visible;
    tab.classList.toggle("is-secondary", Boolean(visible && plan.secondaryModules.includes(tab.dataset.dashboardTab)));
    const active = tab.dataset.dashboardTab === state.activeDashboardPanel;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll("[data-dashboard-panel]").forEach((panel) => {
    const visible = !plan || plan.visibleModules.includes(panel.dataset.dashboardPanel);
    panel.hidden = !visible;
    panel.classList.toggle("is-active", visible && panel.dataset.dashboardPanel === state.activeDashboardPanel);
  });
}

function focusModeLabel(context = ensureJourneyContext()) {
  if (context?.focusMode === "service_only") return "Just this service";
  if (context?.focusMode === "related_checks") return "This service, then related checks";
  return "Full property check";
}

function heroMetaChip(tone, label) {
  return `<span class="journey-chip journey-chip-${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

function heroMetaChips(property, modulePlan, evaluation) {
  const context = ensureJourneyContext();
  const chips = [
    heroMetaChip("navy", modulePlan.journeyLabel),
    heroMetaChip("info", focusModeLabel(context))
  ];

  if (!property) return chips.join("");
  if (property.postcode) chips.push(heroMetaChip("neutral", property.postcode));
  if (property.epc?.rating) {
    chips.push(heroMetaChip("info", property.epc.expiry ? `EPC ${property.epc.rating} · expires ${formatDate(property.epc.expiry)}` : `EPC ${property.epc.rating} imported`));
  } else {
    chips.push(heroMetaChip("neutral", "EPC not checked yet"));
  }
  if (property.tenancy?.currentlyTenanted === true) chips.push(heroMetaChip("ok", "Currently tenanted"));
  if (property.tenancy?.currentlyTenanted === false) chips.push(heroMetaChip("neutral", "Not currently tenanted"));
  if (evaluation?.assessment.mode === "setup") chips.push(heroMetaChip("warning", "Based on what you’ve added so far"));
  return chips.join("");
}

function heroReassuranceCopy(property, modulePlan, assessment) {
  if (!property) {
    return "Add a property first, then answer only what you know. You can come back to the rest later.";
  }
  if (modulePlan.primaryFocus === "eviction") {
    return "Keep this focused on the evidence trail. CMP helps organise what has been recorded so far, but it is not legal advice.";
  }
  if (modulePlan.primaryFocus === "mould") {
    return "Start with the issue history, inspection notes, and repairs. Unknown items stay neutral until you confirm them.";
  }
  if (modulePlan.primaryFocus === "epc") {
    return "You can keep this journey EPC-led. Wider checks can wait unless you decide to open them.";
  }
  if (modulePlan.primaryFocus === "gas") {
    return "Keep this focused on gas safety first. If you are not sure yet, mark it and come back later.";
  }
  if (modulePlan.primaryFocus === "eicr") {
    return "Keep this focused on the electrical record first. CMP will only widen the journey if you choose to.";
  }
  if (assessment?.mode === "setup") {
    return "Answer what you know, skip what you are unsure about, and CMP will keep the remaining checks in a calmer follow-up list.";
  }
  return "CMP keeps this property organised around what is already known, what still needs checking, and the next most useful step.";
}

function heroStatusState(evaluation, modulePlan) {
  const recommendation = state.currentRecommendations[0] || null;
  if (!evaluation) {
    return {
      tone: "unknown",
      label: "No property yet",
      heading: "Add a property to begin",
      copy: "Start with a postcode and address, then CMP will open the right next step for this journey."
    };
  }
  if (evaluation.assessment.mode === "setup") {
    return {
      tone: "unknown",
      label: "Setup in progress",
      heading: recommendation?.title || "A few more checks needed",
      copy: recommendation?.reason || `${evaluation.assessment.knownRequiredChecks} of ${evaluation.assessment.totalRequiredChecks} key checks are confirmed so far.`
    };
  }
  if (evaluation.assessment.criticalCount > 0 || evaluation.risk === "High") {
    return {
      tone: "critical",
      label: "Known urgent issue",
      heading: recommendation?.title || "A known issue needs attention",
      copy: recommendation?.reason || evaluation.assessment.summaryText
    };
  }
  if (evaluation.assessment.warningCount > 0 || evaluation.risk === "Medium") {
    return {
      tone: "warning",
      label: "Needs attention",
      heading: recommendation?.title || modulePlan.priorityTitle,
      copy: recommendation?.reason || evaluation.assessment.summaryText
    };
  }
  return {
    tone: "ok",
    label: "Property record active",
    heading: recommendation?.title || "Keep the property record up to date",
    copy: recommendation?.reason || "CMP has enough information to keep this journey moving without turning every unknown into a warning."
  };
}

function primaryButtonIcon(recommendation) {
  if (!recommendation) return "sparkles";
  if (recommendation.type === "upload_evidence") return "upload-cloud";
  if (recommendation.type === "book_service") return "calendar-plus";
  if (recommendation.type === "review_document") return "folder-check";
  if (recommendation.type === "set_reminder") return "calendar-plus";
  if (recommendation.type === "add_timeline_note") return "sparkles";
  return "sparkles";
}

function setDashboardPrimaryButton(recommendation = null) {
  const button = document.querySelector("#startGuidedCheck");
  if (!button) return;
  if (recommendation?.id) {
    button.dataset.recommendationAction = recommendation.id;
    button.innerHTML = `<i data-lucide="${primaryButtonIcon(recommendation)}"></i>${escapeHtml(recommendation.ctaLabel)}`;
    return;
  }
  delete button.dataset.recommendationAction;
  button.innerHTML = `<i data-lucide="sparkles"></i>Continue check`;
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

const SECTION_EVALUATION_KEYS = {
  property_basics: ["tenancy"],
  epc: ["epc"],
  gas: ["gas"],
  eicr: ["eicr"],
  alarms: ["alarms"],
  tenancy_deposit: ["tenancy", "deposit"],
  licensing: ["licensing"],
  inspections: ["inspections"],
  eviction_evidence: ["possession", "deposit", "tenancy"],
  mould_damp: ["inspections"],
  evidence_pack: ["epc", "gas", "eicr", "tenancy", "deposit", "licensing", "inspections"]
};

function recommendationTypeLabel(type) {
  return {
    book_service: "Book",
    upload_evidence: "Upload",
    answer_question: "Check",
    review_document: "Review",
    set_reminder: "Track",
    add_timeline_note: "Add note",
    continue_journey: "Continue"
  }[type] || "Next";
}

function sectionStatusSummary(section, property, evaluation, progress) {
  const sectionProgress = progress.sectionSummaries.find((item) => item.id === section.id) || {
    answeredQuestions: 0,
    totalQuestions: 0,
    percent: 0,
    complete: false
  };
  const relatedItems = (evaluation?.items || []).filter((item) => (SECTION_EVALUATION_KEYS[section.id] || []).includes(item.key));

  if (section.id === "epc" && property?.epc?.rating) {
    const expired = property.epc?.expiry && daysUntil(property.epc.expiry) < 0;
    return {
      tone: expired ? "critical" : "info",
      badge: expired ? "Expired" : "Imported",
      detail: property.epc?.expiry
        ? `EPC ${property.epc.rating} recorded · expires ${formatDate(property.epc.expiry)}`
        : `EPC ${property.epc.rating} imported from register data`,
      cta: sectionProgress.complete ? "Review" : "Continue"
    };
  }

  if (relatedItems.some((item) => ["critical", "expired"].includes(item.status))) {
    return {
      tone: "critical",
      badge: "Known issue",
      detail: relatedItems.find((item) => ["critical", "expired"].includes(item.status))?.summary || "A known problem needs attention here.",
      cta: "Review"
    };
  }

  if (relatedItems.some((item) => ["missing", "warning", "expiring_soon", "review_needed"].includes(item.status))) {
    const item = relatedItems.find((entry) => ["missing", "warning", "expiring_soon", "review_needed"].includes(entry.status));
    return {
      tone: item.status === "missing" ? "missing" : "warning",
      badge: item.status === "missing" ? "Needs evidence" : item.status === "review_needed" ? "Review needed" : "Needs attention",
      detail: item.summary,
      cta: sectionProgress.answeredQuestions ? "Continue" : "Start"
    };
  }

  if (sectionProgress.complete) {
    return {
      tone: "ok",
      badge: "Done",
      detail: "This section has enough recorded answers for the current journey.",
      cta: "Review"
    };
  }

  if (sectionProgress.answeredQuestions > 0) {
    return {
      tone: "warning",
      badge: "In progress",
      detail: `${sectionProgress.answeredQuestions} of ${sectionProgress.totalQuestions} questions answered so far.`,
      cta: "Continue"
    };
  }

  return {
    tone: "unknown",
    badge: "Not checked yet",
    detail: "Start here when you are ready. Unknown answers stay neutral until confirmed.",
    cta: "Start"
  };
}

function renderOverviewState(targetId, rows, emptyTitle, emptyCopy) {
  const target = document.querySelector(targetId);
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = `
      <article class="overview-row empty">
        <span class="status-dot unknown"></span>
        <div>
          <strong>${escapeHtml(emptyTitle)}</strong>
          <p>${escapeHtml(emptyCopy)}</p>
        </div>
      </article>
    `;
    return;
  }

  target.innerHTML = rows.map((row) => `
    <article class="overview-row${row.cta ? " has-action" : ""}">
      <span class="status-dot ${escapeHtml(row.tone || "unknown")}"></span>
      <div>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
      </div>
      ${row.cta
        ? `<button class="mini-button" type="button" data-recommendation-action="${escapeHtml(row.cta.id)}">${escapeHtml(row.cta.label)}</button>`
        : row.badge
          ? `<span class="status-pill ${escapeHtml(row.tone || "unknown")}">${escapeHtml(row.badge)}</span>`
          : ""}
    </article>
  `).join("");
}

function renderTrackerPreview(property, sections, progress, evaluation) {
  const target = document.querySelector("#trackerPreview");
  if (!target) return;
  if (!property || !sections.length) {
    target.innerHTML = `
      <article class="tracker-card empty">
        <span class="tracker-step">1</span>
        <div>
          <strong>Start with a property</strong>
          <p>Add a property above and CMP will turn this area into a simple step-by-step tracker.</p>
        </div>
      </article>
    `;
    return;
  }

  target.innerHTML = sections.map((section, index) => {
    const sectionProgress = progress.sectionSummaries.find((item) => item.id === section.id) || { answeredQuestions: 0, totalQuestions: 0 };
    const summary = sectionStatusSummary(section, property, evaluation, progress);
    return `
      <article class="tracker-card tracker-card-${escapeHtml(summary.tone)}">
        <span class="tracker-step">${index + 1}</span>
          <div class="tracker-copy">
            <div class="tracker-topline">
              <h3>${escapeHtml(section.title)}</h3>
              <span class="status-pill ${escapeHtml(summary.tone)}">${escapeHtml(summary.badge)}</span>
            </div>
            <p>${escapeHtml(summary.detail || section.intro)}</p>
            <small>${sectionProgress.answeredQuestions}/${sectionProgress.totalQuestions || 0} recorded${sectionProgress.complete ? " · nice, that’s saved" : ""}</small>
          </div>
        <button class="service-button" type="button" data-jump-guided="${escapeHtml(section.id)}">${escapeHtml(summary.cta)}</button>
      </article>
    `;
  }).join("");

  target.querySelectorAll("[data-jump-guided]").forEach((button) => {
    button.addEventListener("click", () => jumpToGuidedSection(button.dataset.jumpGuided, "check"));
  });
}

function renderOverviewSnapshots(property, evaluation, modulePlan, recommendations, progress) {
  syncPropertyEvidence(property);
  const evidenceCount = allEvidenceItems(property, { includeIrrelevant: false }).length;
  const known = [];
  const missing = [];
  const next = [];

  if (property.epc?.rating) {
    known.push({
      tone: "info",
      title: `EPC ${property.epc.rating} imported`,
      detail: property.epc.expiry ? `Recorded from register data · expires ${formatDate(property.epc.expiry)}` : "Recorded from register data"
    });
  }
  if (property.type || hasMeaningfulValue(property.bedrooms) || hasMeaningfulValue(property.storeys)) {
    known.push({
      tone: "ok",
      title: property.type || "Property profile started",
      detail: [
        hasMeaningfulValue(property.bedrooms) ? `${property.bedrooms} bedrooms` : "",
        hasMeaningfulValue(property.storeys) ? `${property.storeys} storeys` : "",
        property.tenancy?.currentlyTenanted === true ? "Currently tenanted" : property.tenancy?.currentlyTenanted === false ? "Not currently tenanted" : ""
      ].filter(Boolean).join(" · ") || "CMP has started the property profile."
    });
  }
  if (evidenceCount) {
    known.push({
      tone: "ok",
      title: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} added`,
      detail: "Imported data, uploaded files, and confirmed answers all appear here."
    });
  }
  if (progress.completedSections) {
    known.push({
      tone: "ok",
      title: `${progress.completedSections} section${progress.completedSections === 1 ? "" : "s"} completed`,
      detail: `${progress.answeredQuestions} useful answers recorded so far.`
    });
  }

  evaluation.items
    .filter((item) => ["setup_needed", "unknown", "missing", "review_needed", "expired", "expiring_soon"].includes(item.status))
    .slice(0, 4)
    .forEach((item) => {
      missing.push({
        tone: statusTone(item.status),
        title: item.title,
        detail: item.summary,
        badge: statusLabel(item.status)
      });
    });

  recommendations.slice(0, 3).forEach((recommendation) => {
    next.push({
      tone: recommendationStatusTone(recommendation.urgency),
      title: recommendation.title,
      detail: recommendation.reason,
      badge: recommendationTypeLabel(recommendation.type),
      cta: {
        id: recommendation.id,
        label: recommendation.ctaLabel
      }
    });
  });

  renderOverviewState(
    "#knownSnapshot",
    known,
    "Nothing confirmed yet",
    "Imported property details and completed answers will appear here."
  );
  renderOverviewState(
    "#missingSnapshot",
    missing,
    "Nothing urgent is showing yet",
    "Unknown answers stay calm here until the property needs a clearer answer or some proof."
  );
  renderOverviewState(
    "#actionSnapshot",
    next,
    modulePlan.primaryFocus === "eviction" ? "Start the evidence pack" : "Start with the guided check",
    modulePlan.primaryFocus === "eviction"
      ? "Add the first notice, communication, or proof item and CMP will build the timeline."
      : "CMP will narrow the next step once you answer a few simple questions."
  );
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
  const plan = dashboardModulePlan(property);
  if (!property) {
    state.currentRecommendations = [];
    renderCompletionBanner(null, null);
    document.body.dataset.dashboardFocus = plan.primaryFocus || "full_compliance";
    document.querySelector("#dashboardHeaderKicker").textContent = plan.journeyLabel;
    document.querySelector("#propertyTitle").textContent = "No properties added yet";
    document.querySelector("#propertySubtitle").textContent = plan.journeyIntro;
    document.querySelector("#heroMetaChips").innerHTML = heroMetaChips(null, plan, null);
    document.querySelector("#propertyReassurance").textContent = heroReassuranceCopy(null, plan, null);
    document.querySelector("#heroStatusPill").className = "status-pill unknown";
    document.querySelector("#heroStatusPill").textContent = "No property yet";
    document.querySelector("#heroActionHeading").textContent = "Add a property to begin";
    document.querySelector("#heroActionCopy").textContent = "Start with a postcode and address. CMP will then open the right next step for this journey.";
    document.querySelector("#scoreValue").textContent = "—";
    document.querySelector("#riskLabel").textContent = "Setup";
    document.querySelector("#scoreRing").style.setProperty("--score", 0);
    document.querySelector("#scoreRing").style.setProperty("--ring-color", "var(--blue)");
    document.querySelector("#scoreHeadline").textContent = "Setup in progress";
    document.querySelector("#scoreNarrative").textContent = "Use the postcode search above to create the first property record. CMP will then adapt the next steps to the journey you started from.";
    document.querySelector("#priorityHeading").textContent = plan.priorityTitle;
    document.querySelector("#priorityHelper").textContent = "Enter a postcode, choose the address, then let CMP open the right dashboard modules for that property.";
    document.querySelector("#requirementsHeading").textContent = "Only open the detail when you need it";
    document.querySelector("#guidedHeading").textContent = "Answer what you know. CMP organises the rest.";
    document.querySelector("#evidenceHeading").textContent = "What proof is stored, and what is missing";
    document.querySelector("#timelineHeading").textContent = "Recent compliance activity";
    document.querySelector("#serviceHeading").textContent = "Recommended next steps";
    document.querySelector("#scanHeading").textContent = "Upload evidence for this property";
    document.querySelector("#priorityList").innerHTML = `<article class="priority-item empty-state"><span class="status-dot info"></span><div><h3>First step</h3><p>Enter a postcode, choose the address, then let CMP start the property setup.</p></div></article>`;
    document.querySelector("#intelligenceStrip").innerHTML = ["Setup", "What CMP knows", "Still to check", "Evidence"].map((label) => `
      <article class="intel-stat">
        <span>${label}</span>
        <strong>0</strong>
        <span>Waiting</span>
      </article>
    `).join("");
    document.querySelector("#lastUpdated").textContent = "";
    document.querySelector("#complianceGrid").innerHTML = `<div class="empty-panel"><strong>No compliance map yet</strong><span>Add a property first and CMP will generate the property-specific requirements.</span></div>`;
    document.querySelector("#evidenceGrid").innerHTML = `<div class="empty-panel"><strong>No evidence pack yet</strong><span>Add a property before uploading certificates, reports, or tenancy documents.</span></div>`;
    document.querySelector("#timeline").innerHTML = `<div class="empty-panel"><strong>No property timeline yet</strong><span>Recent compliance activity appears once a property has been added.</span></div>`;
    document.querySelector("#assistantHeadline").textContent = plan.assistantHeadline;
    document.querySelector("#assistantCopy").textContent = "Add a property listing to unlock document scans, evidence packs, reminders, and journey-led recommendations.";
    document.querySelector("#scanResults").innerHTML = `<article class="scan-result"><strong>No property selected</strong><span>Add a property before uploading evidence.</span></article>`;
    document.querySelector("#serviceList").innerHTML = `<article class="service-item"><strong>Start with your first property</strong><span>CMP will suggest certificates and services after the address has been added.</span></article>`;
    renderOverviewState("#knownSnapshot", [], "Nothing confirmed yet", "Imported property details and completed answers will appear here.");
    renderOverviewState("#missingSnapshot", [], "No checks started yet", "CMP will list the unanswered or evidence-light areas once a property is added.");
    renderOverviewState("#actionSnapshot", [], "Add a property first", "Use the postcode search or load a demo journey from the sidebar.");
    renderTrackerPreview(null, [], { sectionSummaries: [], answeredQuestions: 0, totalQuestions: 0, completedSections: 0, totalSections: 0 }, null);
    renderActionCentre(null, []);
    document.querySelector("#guidedProgressNarrative").textContent = "You can answer what you know and come back later.";
    document.querySelector("#guidedProgressHelper").textContent = "Not sure at this point is always a safe option.";
    document.querySelector("#guidedProgressFill").style.width = "0%";
    document.querySelector("#pullEpcButton").disabled = true;
    document.querySelector("#startGuidedCheck").disabled = true;
    setDashboardPrimaryButton(null);
    return;
  }

  document.querySelector("#pullEpcButton").disabled = false;
  document.querySelector("#startGuidedCheck").disabled = false;
  const evaluation = evaluateProperty(property);
  renderCompletionBanner(property, evaluation);
  const assessment = evaluation.assessment;
  const actions = sortedActions(evaluation.items);
  const modulePlan = dashboardModulePlan(property, evaluation);
  document.body.dataset.dashboardFocus = modulePlan.primaryFocus || "full_compliance";
  const recommendations = defaultRecommendationList(property, evaluation, modulePlan);
  state.currentRecommendations = recommendations;
  const heroState = heroStatusState(evaluation, modulePlan);
  const ring = document.querySelector("#scoreRing");
  const ringColor = assessment.mode === "score"
    ? evaluation.risk === "High" ? "var(--red)" : evaluation.risk === "Medium" ? "var(--amber)" : "var(--green)"
    : "var(--blue)";
  const subtitleParts = [modulePlan.journeyIntro, modulePlan.metadata.join(" · ")].filter(Boolean);

  document.querySelector("#dashboardHeaderKicker").textContent = modulePlan.journeyLabel;
  document.querySelector("#propertyTitle").textContent = property.address;
  document.querySelector("#propertySubtitle").textContent = subtitleParts.join(" ");
  document.querySelector("#heroMetaChips").innerHTML = heroMetaChips(property, modulePlan, evaluation);
  document.querySelector("#propertyReassurance").textContent = heroReassuranceCopy(property, modulePlan, assessment);
  document.querySelector("#heroStatusPill").className = `status-pill ${heroState.tone}`;
  document.querySelector("#heroStatusPill").textContent = heroState.label;
  document.querySelector("#heroActionHeading").textContent = heroState.heading;
  document.querySelector("#heroActionCopy").textContent = heroState.copy;
  document.querySelector("#scoreValue").textContent = assessment.mode === "score"
    ? `${evaluation.score}%`
    : `${assessment.knownRequiredChecks}/${assessment.totalRequiredChecks}`;
  document.querySelector("#riskLabel").textContent = assessment.mode === "score" ? `${evaluation.risk} risk` : "Setup progress";
  ring.style.setProperty("--score", assessment.mode === "score" ? evaluation.score : assessment.setupProgress);
  ring.style.setProperty("--ring-color", ringColor);

  const topAction = modulePlan.primaryActionsAll[0] || actions[0];
  document.querySelector("#scoreHeadline").textContent = assessment.mode === "setup" ? "Setup in progress" : assessment.summaryTitle;
  document.querySelector("#scoreNarrative").textContent = assessment.mode === "setup"
    ? `${assessment.summaryText} Based on what you’ve added so far, CMP is keeping the next checks calm and focused on this journey.`
    : topAction
      ? `${assessment.summaryText} Next priority: ${topAction.action}`
      : "CMP has no urgent actions for this property. Keep the record, evidence, and renewals moving at a steady pace.";
  document.querySelector("#priorityHeading").textContent = modulePlan.priorityTitle;
  document.querySelector("#priorityHelper").textContent = modulePlan.priorityHelper;
  document.querySelector("#requirementsHeading").textContent = modulePlan.primaryFocus === "evidence_pack" ? "Evidence gaps that still matter" : "Only open the detail when you need it";
  document.querySelector("#guidedHeading").textContent = modulePlan.primaryFocus === "full_compliance"
    ? "Answer what you know. CMP organises the rest."
    : modulePlan.primaryFocus === "epc"
      ? "Use the guided form only for the checks this journey still needs."
      : modulePlan.primaryFocus === "eviction"
        ? "Use the guided form to confirm the evidence trail."
        : "Answer the checks that support this journey.";
  document.querySelector("#evidenceHeading").textContent = modulePlan.primaryFocus === "evidence_pack" || modulePlan.primaryFocus === "eviction" || modulePlan.primaryFocus === "mould"
    ? "Evidence and timeline for this journey"
    : "What proof is stored, and what is missing";
  document.querySelector("#timelineHeading").textContent = modulePlan.primaryFocus === "mould"
    ? "Inspection and repair timeline"
    : modulePlan.primaryFocus === "eviction"
      ? "Possession preparation timeline"
      : modulePlan.primaryFocus === "evidence_pack"
        ? "Evidence timeline"
        : "Recent compliance activity";
  document.querySelector("#serviceHeading").textContent = modulePlan.primaryFocus === "eviction"
    ? "Evidence and support actions"
    : modulePlan.primaryFocus === "mould"
      ? "Recommended next steps"
      : "Recommended next steps";
  document.querySelector("#scanHeading").textContent = modulePlan.primaryFocus === "evidence_pack"
    ? "Upload the document pack here"
    : modulePlan.primaryFocus === "eviction"
      ? "Upload notices, communications, and proof"
      : modulePlan.primaryFocus === "mould"
        ? "Upload reports, photos, or repair notes"
        : "Upload evidence for this property";
  setDashboardPrimaryButton(recommendations[0] || null);

  document.querySelector("#priorityList").innerHTML = (recommendations.length ? recommendations.slice(0, 1) : modulePlan.primaryActionsAll.slice(0, 1)).map((item) => `
    <article class="priority-item">
      <span class="status-dot ${item.reason ? recommendationStatusTone(item.urgency) : statusTone(item.status)}"></span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.reason || item.action)}</p>
      </div>
      ${item.id
        ? `<button class="service-button" type="button" data-recommendation-action="${escapeHtml(item.id)}">${escapeHtml(item.ctaLabel)}</button>`
        : `<span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>`}
    </article>
  `).join("");

  const missingEvidence = evaluation.items.filter((item) => item.status === "missing").length;
  const expiringSoon = evaluation.items.filter((item) => item.status === "expiring_soon").length;
  const setupNeeded = assessment.unknownCount;
  const critical = assessment.criticalCount;
  const confirmed = evaluation.items.filter((item) => item.status === "ok" || item.status === "not_applicable").length;
  document.querySelector("#intelligenceStrip").innerHTML = `
    <article class="intel-stat">
      <span>${assessment.mode === "score" ? "Compliance score" : "Setup progress"}</span>
      <strong>${assessment.mode === "score" ? `${evaluation.score}%` : `${assessment.knownRequiredChecks}/${assessment.totalRequiredChecks}`}</strong>
      <span>${assessment.mode === "score" ? "Based on the information added so far" : "Complete the key property checks first"}</span>
    </article>
    <article class="intel-stat">
      <span>What CMP knows</span>
      <strong>${confirmed}</strong>
      <span>Confirmed or imported checks for this property</span>
    </article>
    <article class="intel-stat">
      <span>Still to check</span>
      <strong>${setupNeeded}</strong>
      <span>Unknown answers stay neutral until confirmed</span>
    </article>
    <article class="intel-stat">
      <span>${critical ? "Known issues" : "Evidence & renewals"}</span>
      <strong>${critical || missingEvidence + expiringSoon}</strong>
      <span>${critical ? "Known issues that need attention" : "Known missing or expiring proof"}</span>
    </article>
  `;

  document.querySelector("#lastUpdated").textContent = `Checked ${formatDate(today)}`;
  document.querySelector("#complianceGrid").innerHTML = evaluation.items.map((item) => renderComplianceCard(item, recommendations)).join("");
  const sections = visibleGuidedSections(property);
  const progress = guidedProgress(sections, property);
  document.querySelector("#guidedProgressNarrative").textContent = progress.completedSections
    ? `${progress.completedSections} of ${progress.totalSections} sections recorded so far`
    : "Start with one simple section and keep the rest for later.";
  document.querySelector("#guidedProgressHelper").textContent = progress.remainingQuestions
    ? `${progress.remainingQuestions} answer${progress.remainingQuestions === 1 ? "" : "s"} can still be double-checked later.`
    : "Nice, that’s recorded. You can still edit any answer later.";
  document.querySelector("#guidedProgressFill").style.width = `${progress.percent}%`;
  renderOverviewSnapshots(property, evaluation, modulePlan, recommendations, progress);
  renderTrackerPreview(property, sections.filter((section) => section.id !== "summary").slice(0, 6), progress, evaluation);
  renderEvidenceGrid(property, evaluation.items, modulePlan);
  renderTimeline(property, modulePlan);
  renderAssistant(property, evaluation, actions, modulePlan);
  renderServices(recommendations, assessment, modulePlan);
  renderActionCentre(property, recommendations);
  renderScanResults(modulePlan);
  document.querySelectorAll("[data-recommendation-action]").forEach((button) => {
    button.addEventListener("click", () => executeRecommendationAction(button.dataset.recommendationAction));
  });
}

function renderComplianceCard(item, recommendations = state.currentRecommendations) {
  const quickAction = recommendations.find((recommendation) => recommendation.serviceKey === serviceKeyForItemKey(item.key, dashboardModulePlan(activeProperty(), evaluateProperty(activeProperty()))) || recommendation.relatedQuestionId === guidedSectionIdForKey(item.key));
  return `
    <article class="compliance-card">
      <div class="card-top">
        <span class="card-icon"><i data-lucide="${item.icon}"></i></span>
        <span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>
      <div class="metric-row">
        ${item.metrics.map((metric) => `<span class="mini-chip">${escapeHtml(metric)}</span>`).join("")}
        ${item.due ? `<span class="mini-chip">${escapeHtml(formatRelative(item.due))}</span>` : ""}
      </div>
      ${quickAction
        ? `<button class="service-button" type="button" data-recommendation-action="${escapeHtml(quickAction.id)}">${escapeHtml(quickAction.ctaLabel)}</button>`
        : `<span class="mini-chip">${escapeHtml(item.service)}</span>`}
    </article>
  `;
}

function hasEvidence(property, key) {
  const category = normalizeEvidenceCategory(key);
  return evidenceItemsForCategory(property, category).some((item) => item.status !== "irrelevant");
}

function renderEvidenceGrid(property, items, modulePlan = dashboardModulePlan(property, evaluateProperty(property))) {
  const itemsByKey = new Map(items.map((item) => [item.key, item]));
  syncPropertyEvidence(property);
  const focusCategories = new Set([
    ...(modulePlan.primaryFocus === "epc" ? ["epc"] : []),
    ...(modulePlan.primaryFocus === "gas" ? ["gas"] : []),
    ...(modulePlan.primaryFocus === "eicr" ? ["eicr"] : []),
    ...(modulePlan.primaryFocus === "eviction" ? ["tenancy", "deposit", "prescribed_info", "epc", "gas", "eicr", "eviction_notices", "tenant_communications", "inspections", "repairs"] : []),
    ...(modulePlan.primaryFocus === "mould" ? ["mould_damp", "repairs", "tenant_communications", "inspections"] : []),
    ...(modulePlan.primaryFocus === "evidence_pack" ? ["epc", "gas", "eicr", "tenancy", "deposit", "prescribed_info", "licensing", "inspections", "eviction_notices", "tenant_communications", "mould_damp", "repairs", "other", "irrelevant"] : [])
  ]);

  const types = evidenceTypes.filter((type) => {
    const hasItems = evidenceItemsForCategory(property, type.category).length > 0;
    const relevant = focusCategories.has(type.category) || !focusCategories.size;
    if (type.category === "irrelevant") {
      return hasItems && (modulePlan.primaryFocus === "evidence_pack" || modulePlan.primaryFocus === "eviction");
    }
    if (modulePlan.primaryFocus === "epc" && !relevant && !hasItems && !["epc"].includes(type.category)) return false;
    if (["gas", "eicr"].includes(modulePlan.primaryFocus) && !relevant && !hasItems) return false;
    if (modulePlan.primaryFocus === "mould" && !relevant && !hasItems) return false;
    if (modulePlan.primaryFocus === "eviction" && !relevant && !hasItems) return false;
    return true;
  });

  document.querySelector("#evidenceGrid").innerHTML = types.map((type) => {
    const evidence = bestEvidenceItem(property, type.category);
    const hasDoc = hasEvidence(property, type.category);
    const itemKey = type.evaluationKey || type.key;
    const evaluationItem = itemsByKey.get(itemKey);
    const evidenceStatus = evidence?.status || evaluationItem?.status || (hasDoc ? "ok" : "setup_needed");
    const evidenceTone = statusTone(evidenceStatus);
    const evidenceCopy = evidence
      ? evidenceSummaryCopy(evidence, evidenceStatus)
      : evidenceStatus === "ok"
        ? "Evidence is stored in the property record."
      : evidenceStatus === "not_applicable"
        ? "Not required for this property right now."
      : evidenceStatus === "setup_needed" || evidenceStatus === "unknown"
          ? "Not checked yet. Confirm this area during setup."
          : evidenceStatus === "missing"
            ? "Required evidence is not stored yet."
            : evidenceStatus === "expired"
              ? "Known evidence appears to be expired."
              : evidenceStatus === "expiring_soon"
                ? "Known evidence is approaching expiry."
                : evidenceStatus === "review_needed"
                  ? "CMP found something, but it still needs review."
                  : evaluationItem?.summary || "This item needs attention.";
    const chips = [
      evidence ? evidenceSourceCopy(evidence) : evaluationItem?.status === "not_applicable" ? "Not required" : "No file",
      evidence?.filename || "",
      evidence?.confidence ? `${titleCase(evidence.confidence)} confidence` : ""
    ].filter(Boolean);
    return `
      <article class="evidence-card${["missing", "critical", "expired"].includes(evidenceStatus) ? " is-missing" : ""}">
        <div class="card-top">
          <span class="card-icon"><i data-lucide="${type.icon}"></i></span>
          <span class="status-pill ${evidenceTone}">${statusLabel(evidenceStatus)}</span>
        </div>
        <div>
          <h3>${escapeHtml(type.title)}</h3>
          <p>${escapeHtml(evidenceCopy)}</p>
        </div>
        <div class="evidence-meta">
          ${chips.map((chip) => `<span class="mini-chip">${escapeHtml(chip)}</span>`).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderTimeline(property, modulePlan = dashboardModulePlan(property, evaluateProperty(property))) {
  const timeline = timelineEventsForDisplay(property, modulePlan);
  if (!timeline.length) {
    document.querySelector("#timeline").innerHTML = `
      <div class="empty-panel">
        <strong>No timeline events yet</strong>
        <span>As you add documents, checks, and notes, CMP will build a property history here.</span>
      </div>
    `;
    return;
  }
  document.querySelector("#timeline").innerHTML = timeline.map((item) => {
    const dateCopy = item.eventDate
      ? formatDate(item.eventDate)
      : item.dueDate
        ? `Due ${formatDate(item.dueDate)}`
        : "Date not recorded";
    const detailParts = [
      item.description,
      item.dueDate && ["upcoming", "expired", "ok"].includes(item.status) ? formatRelative(dateFrom(item.dueDate)) : "",
      item.source === "upload" ? "Prototype upload" : item.source === "scan" ? "Prototype scan" : ""
    ].filter(Boolean);
    return `
      <article class="timeline-item">
        <span class="status-dot ${statusTone(item.status)}"></span>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(detailParts.join(" · "))}</p>
        </div>
        <div class="timeline-meta">
          <span class="quiet-pill">${escapeHtml(dateCopy)}</span>
          <span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderAssistant(property, evaluation, actions, modulePlan = dashboardModulePlan(property, evaluation)) {
  const headline = document.querySelector("#assistantHeadline");
  const copy = document.querySelector("#assistantCopy");
  const top = actions[0];
  const name = property.shortName;

  headline.textContent = modulePlan.assistantHeadline;

  if (evaluation.assessment.mode === "setup") {
    copy.textContent = `${modulePlan.assistantCopy} ${evaluation.assessment.knownRequiredChecks} of ${evaluation.assessment.totalRequiredChecks} key checks are confirmed for ${name}. You can answer what you know and leave the rest for later.`;
    return;
  }

  copy.textContent = top
    ? `${modulePlan.assistantCopy} Next useful move for ${name}: ${top.action}`
    : `${modulePlan.assistantCopy} ${name} has no urgent action showing right now.`;
}

function renderServices(recommendations, assessment, modulePlan) {
  const candidates = recommendations.slice(0, 3);

  if (!candidates.length) {
    document.querySelector("#serviceList").innerHTML = `<article class="service-item"><strong>${assessment.mode === "setup" ? "Complete setup first" : "No urgent next action"}</strong><span>${assessment.mode === "setup" ? "CMP will suggest the next checks once the key property facts are confirmed." : "Based on the information added so far, CMP has no urgent action for this journey."}</span></article>`;
    return;
  }

  document.querySelector("#serviceList").innerHTML = candidates.map((item) => `
    <article class="service-item">
      <header>
        <strong>${escapeHtml(item.title)}</strong>
        <div class="service-item-tags">
          <span class="quiet-pill">${escapeHtml(recommendationTypeLabel(item.type))}</span>
          <span class="status-pill ${recommendationStatusTone(item.urgency)}">${escapeHtml(titleCase(item.urgency))}</span>
        </div>
      </header>
      <span>${escapeHtml(item.reason)}</span>
      <span>${escapeHtml(
        item.type === "book_service"
          ? "Prototype only: this saves service interest for the final version. It does not place a real booking."
          : item.type === "upload_evidence"
            ? "CMP will open the relevant upload flow for this property."
            : item.type === "review_document"
              ? "CMP will open the evidence area so you can review the record."
              : item.type === "set_reminder"
                ? "CMP will save this follow-up in the action centre."
                : item.type === "add_timeline_note"
                  ? "CMP will reopen the relevant guided section for this timeline."
                  : "CMP will continue the current guided journey in baby steps."
      )}</span>
      <button class="service-button" type="button" data-recommendation-action="${escapeHtml(item.id)}">${escapeHtml(item.ctaLabel)}</button>
    </article>
  `).join("");
}

function getAzAnswers(propertyId = state.activePropertyId) {
  state.azChecklist[propertyId] = state.azChecklist[propertyId] || {};
  return state.azChecklist[propertyId];
}

function summarizeAzAnswers(property = activeProperty(), sections = visibleGuidedSections(property)) {
  if (!property) {
    return {
      total: 0,
      answered: 0,
      complete: 0,
      issues: 0,
      unknown: 0,
      completion: 0,
      compliance: 0,
      completedSections: 0,
      totalSections: 0
    };
  }
  const progress = guidedProgress(sections, property);
  const evaluation = evaluateProperty(property);
  const issues = evaluation.items.filter((item) => isKnownIssueStatus(item.status)).length;
  return {
    total: progress.totalQuestions,
    answered: progress.answeredQuestions,
    complete: progress.answeredQuestions,
    issues,
    unknown: progress.remainingQuestions,
    completion: progress.percent,
    compliance: evaluation.assessment.mode === "score" ? evaluation.score : progress.percent,
    completedSections: progress.completedSections,
    totalSections: progress.totalSections
  };
}

function suggestAzPrimaryAction(summary) {
  if (summary.issues) {
    return `${summary.issues} known item${summary.issues === 1 ? "" : "s"} still needs attention. CMP can keep the next step calm and obvious.`;
  }
  if (summary.unknown) {
    return `${summary.unknown} part${summary.unknown === 1 ? "" : "s"} of the property still needs a landlord answer or some proof.`;
  }
  return "Here’s what we know so far. Keep the evidence and renewal dates up to date.";
}

function setAzAnswer(checkId, answer) {
  const answers = getAzAnswers();
  answers[checkId] = answer;
  setQuestionEditing(guidedQuestionIdForField(checkId), false);
  refreshGuidedProgressState();
  queueWorkspaceSave();
  renderAll();
}

function factsList(property) {
  const epcExpiry = property.epc?.issue ? addYears(property.epc.issue, 10) : null;
  const gasExpiry = property.hasGas && property.gas?.issue ? addYears(property.gas.issue, 1) : null;
  const eicrExpiry = property.eicr?.issue ? addYears(property.eicr.issue, 5) : null;
  const latestEvidenceItem = sortEvidenceItems(allEvidenceItems(property, { includeIrrelevant: false }))[0];

  return [
    {
      key: "property_profile",
      label: "Property profile",
      value: [
        property.type || "Type to confirm",
        hasMeaningfulValue(property.bedrooms) ? `${property.bedrooms} bed` : "Bedrooms to confirm",
        hasMeaningfulValue(property.storeys) ? `${property.storeys} storey${property.storeys === 1 ? "" : "s"}` : "Storeys to confirm"
      ].join(" - "),
      source: "Property record"
    },
    {
      key: "epc",
      label: "EPC",
      value: property.epc?.rating ? `Rating ${property.epc.rating}, expires ${formatDate(property.epc.expiry || epcExpiry)}` : "EPC not confirmed yet",
      source: property.epc?.certificate ? `Certificate ${property.epc.certificate}` : "Needs register pull or upload"
    },
    {
      key: "gas",
      label: "Gas safety",
      value: property.hasGas === true ? (property.gas?.issue ? `Issued ${formatDate(property.gas.issue)}, expires ${formatDate(gasExpiry)}` : "Gas applies, certificate date missing") : property.hasGas === false ? "No gas appliances recorded" : "Gas setup not confirmed yet",
      source: property.gas?.engineer || "Property answer"
    },
    {
      key: "eicr",
      label: "Electrical safety",
      value: property.eicr?.issue ? `Issued ${formatDate(property.eicr.issue)}, expires ${formatDate(eicrExpiry)}` : "EICR not confirmed yet",
      source: property.eicr?.result || "No result recorded"
    },
    {
      key: "deposit",
      label: "Deposit",
      value: property.deposit?.taken === true ? (property.deposit?.protected === true ? "Protected" : property.deposit?.protected === false ? "Protection not confirmed" : "Protection status unknown") : property.deposit?.taken === false ? "No deposit recorded" : "Deposit status not confirmed yet",
      source: property.deposit?.prescribedInfo === true ? "Prescribed information recorded" : property.deposit?.prescribedInfo === false ? "Evidence incomplete" : "Setup needed"
    },
    {
      key: "latest_document",
      label: "Latest document intake",
      value: latestEvidenceItem ? latestEvidenceItem.title : "No document evidence yet",
      source: latestEvidenceItem ? `${evidenceSourceCopy(latestEvidenceItem)}${latestEvidenceItem.filename ? ` · ${latestEvidenceItem.filename}` : ""}` : "Upload evidence to populate this"
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

  const sections = visibleGuidedSections(property);
  const summary = summarizeAzAnswers(property, sections);
  const progress = guidedProgress(sections, property);
  const meta = guidedMeta(property.id);
  const evaluation = evaluateProperty(property);
  const currentSectionId = meta.currentSectionId || sections[0]?.id || "";
  const propertyScans = state.scans
    .filter((scan) => scan.propertyId === property.id)
    .slice(-6)
    .reverse();

  document.querySelector("#azProgressValue").textContent = `${summary.completion}%`;
  document.querySelector("#azProgressText").textContent = `${progress.completedSections}/${progress.totalSections} sections completed · ${summary.answered}/${summary.total} relevant checks answered`;
  document.querySelector("#azPrimaryAction").textContent = suggestAzPrimaryAction(summary);

  document.querySelector("#azChecklist").innerHTML = sections.map((section) => {
    const sectionProgress = progress.sectionSummaries.find((item) => item.id === section.id);
    const modeLabel = section.mode === "required" ? "Required" : section.mode === "related" ? "Related" : "Optional";
    const sectionState = sectionStatusSummary(section, property, evaluation, progress);
    return `
      <article class="az-section-card${section.id === currentSectionId ? " is-current" : ""}">
        <header class="az-section-header">
          <span class="card-icon"><i data-lucide="${section.icon}"></i></span>
          <div>
            <h4>${escapeHtml(section.title)}</h4>
            <span>${sectionProgress?.answeredQuestions || 0}/${sectionProgress?.totalQuestions || 0} answered · ${modeLabel}</span>
          </div>
          <span class="status-pill ${escapeHtml(sectionState.tone)}">${escapeHtml(sectionState.badge)}</span>
        </header>
        <p class="section-copy">${escapeHtml(sectionState.detail || section.intro)}</p>
        <div class="az-question-list az-question-summary-list">
          ${section.questions.slice(0, 4).map((question) => {
            const snapshot = guidedQuestionSnapshot(question, property, getAzAnswers(property.id));
            return `
              <article class="priority-item">
                <span class="status-dot ${snapshot.answered ? "ok" : "unknown"}"></span>
                <div>
                  <h3>${escapeHtml(question.label)}</h3>
                  <p>${escapeHtml(snapshot.answered ? (snapshot.summaryValue || "Recorded") : "Still to confirm in the guided journey.")}</p>
                </div>
                <span class="status-pill ${snapshot.answered ? "ok" : "unknown"}">${snapshot.answered ? "Recorded" : "Next"}</span>
              </article>
            `;
          }).join("")}
        </div>
        <div class="az-section-actions">
          <span class="quiet-pill">${sectionProgress?.percent || 0}% complete</span>
          <button class="service-button" type="button" data-jump-guided="${escapeHtml(section.id)}">${escapeHtml(sectionState.cta || (section.id === currentSectionId ? "Continue" : "Open section"))}</button>
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
    <article class="az-document-result${scan.blocked || scan.listingWarning ? " has-warning" : ""}">
      <div>
        <strong>${escapeHtml(scan.title)}</strong>
        <span>${escapeHtml(scan.fileName)} - ${escapeHtml(scan.confidenceLevel || "low")} confidence${scan.reviewNeeded ? " - review needed" : ""}</span>
        <small>${scan.issue ? `Issue ${formatDate(scan.issue)}` : "Issue date not found"}${scan.expiry ? ` - expires ${formatDate(scan.expiry)}` : ""}</small>
        ${scan.listingWarning ? `<small class="listing-warning"><i data-lucide="alert-triangle"></i>${escapeHtml(scan.listingWarning)}</small>` : ""}
      </div>
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}" ${scan.blocked || scan.listingWarning ? "disabled" : ""}>${scan.applied ? "Applied" : "Use"}</button>
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

  root.querySelectorAll("[data-jump-guided]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = sections.findIndex((section) => section.id === button.dataset.jumpGuided);
      if (index >= 0) {
        state.activeStep = index;
        setGuidedCurrentSection(sections[index].id, property.id);
        showDashboardPanel("check", false);
        renderAll();
        document.querySelector("#guided-check")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  renderAiSettings();
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
  const sections = visibleGuidedSections(property);
  syncGuidedStep(sections, property.id);
  refreshGuidedProgressState(property.id);
  const step = sections[state.activeStep];
  const progress = guidedProgress(sections, property);
  document.querySelector("#stepCount").textContent = `Step ${state.activeStep + 1} of ${sections.length} · ${progress.completedSections}/${progress.totalSections} sections complete`;
  document.querySelector("#wizardTabs").innerHTML = sections.map((item, index) => {
    const sectionProgress = progress.sectionSummaries.find((section) => section.id === item.id);
    return `
    <button class="wizard-tab${index === state.activeStep ? " is-active" : ""}" type="button" data-step="${index}">
      <i data-lucide="${item.icon}"></i>
      <span>${escapeHtml(item.title)}</span>
      <small>${sectionProgress?.percent || 0}%</small>
    </button>
  `;
  }).join("");

  document.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeStep = Number(button.dataset.step);
      setGuidedCurrentSection(sections[state.activeStep]?.id, property.id);
      renderAll();
    });
  });

  const form = document.querySelector("#wizardForm");
  form.innerHTML = wizardContent(step, property, sections, progress);
  form.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("change", () => updateField(input));
    input.addEventListener("input", () => {
      updateField(input, false);
    });
  });
  form.querySelectorAll("[data-choice-field]").forEach((button) => {
    button.addEventListener("click", () => updateChoiceField(button.dataset.choiceField, button.dataset.choiceValue));
  });
  form.querySelectorAll("[data-az-field]").forEach((input) => {
    input.addEventListener("change", () => updateAzField(input.dataset.azField, input.value));
    if (input.tagName === "INPUT") {
      input.addEventListener("input", () => updateAzField(input.dataset.azField, input.value, false));
    }
  });
  form.querySelectorAll("[data-guided-az-field]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.dataset.guidedAzValue === "yes" ? "yes" : button.dataset.guidedAzValue === "no" ? "no" : button.dataset.guidedAzValue === "na" ? "na" : "unknown";
      setQuestionEditing(button.dataset.guidedAzField, false, property.id);
      setAzAnswer(button.dataset.guidedAzField, answer);
    });
  });
  form.querySelectorAll("[data-guided-edit-question]").forEach((button) => {
    button.addEventListener("click", () => {
      setQuestionEditing(button.dataset.guidedEditQuestion, true, property.id);
      renderAll();
    });
  });
  form.querySelector("[data-prev]")?.addEventListener("click", () => {
    state.activeStep = Math.max(0, state.activeStep - 1);
    setGuidedCurrentSection(sections[state.activeStep]?.id, property.id);
    renderAll();
  });
  form.querySelector("[data-next]")?.addEventListener("click", () => {
    state.activeStep = Math.min(sections.length - 1, state.activeStep + 1);
    setGuidedCurrentSection(sections[state.activeStep]?.id, property.id);
    renderAll();
  });
  form.querySelectorAll("[data-open-upload]").forEach((button) => {
    button.addEventListener("click", openUploadModal);
  });
  form.querySelectorAll("[data-recommendation-action]").forEach((button) => {
    button.addEventListener("click", () => executeRecommendationAction(button.dataset.recommendationAction));
  });
}

function renderGuidedEvidenceOverview(property) {
  const gaps = evidenceGapSummary(property);
  if (!gaps.length) {
    return `
      <div class="question-confirmed">
        <div>
          <label>Evidence overview</label>
          <strong>No urgent evidence gaps are showing right now.</strong>
        </div>
        <small>Uploads and scan previews in this prototype are still demo-only.</small>
      </div>
    `;
  }
  return `
    <div class="question-confirmed question-confirmed-stack">
      <div>
        <label>Evidence gaps still showing</label>
        <strong>${gaps.length} item${gaps.length === 1 ? "" : "s"} still need checking or proof.</strong>
      </div>
      <div class="priority-list">
        ${gaps.map((item) => `
          <article class="priority-item">
            <span class="status-dot ${statusTone(item.status)}"></span>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
            </div>
            <span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderGuidedQuestion(section, question, property) {
  const answers = getAzAnswers(property.id);
  const snapshot = guidedQuestionSnapshot(question, property, answers);
  if (snapshot.hidden) return "";

  const meta = guidedMeta(property.id);
  const editing = Boolean(meta.editingQuestions[question.id]);

  if (question.type === "info") {
    return `
      <div class="question-confirmed">
        <div>
          <label>${escapeHtml(question.label)}</label>
          <strong>${escapeHtml(snapshot.summaryValue)}</strong>
        </div>
        <small>${escapeHtml(snapshot.source)}</small>
      </div>
    `;
  }

  if (question.type === "display") {
    return `
      <div class="question-confirmed">
        <div>
          <label>${escapeHtml(question.label)}</label>
          <strong>${escapeHtml(snapshot.summaryValue || question.emptyText || "Not recorded yet")}</strong>
        </div>
        <small>${escapeHtml(snapshot.source || question.sourceLabel || "Property record")}</small>
      </div>
    `;
  }

  if (question.type === "evidence_overview") {
    return renderGuidedEvidenceOverview(property);
  }

  if (snapshot.answered && snapshot.canCondense && !editing) {
    return `
      <div class="question-confirmed">
        <div>
          <label>${escapeHtml(question.label)}</label>
          <strong>${escapeHtml(snapshot.summaryValue || "Recorded")}</strong>
        </div>
        <div class="question-confirmed-actions">
          <small>${escapeHtml(snapshot.source || "Recorded")}</small>
          ${question.type === "upload"
            ? ""
            : `<button class="mini-button" type="button" data-guided-edit-question="${escapeHtml(question.id)}">Edit</button>`}
        </div>
      </div>
    `;
  }

  if (question.type === "upload") {
    const category = evidenceCategoryForQuestion(question);
    const evidence = latestEvidence(property, category);
    const statusCopy = evidence
      ? evidenceSummaryCopy(evidence, evidence.status)
      : (question.hint || "Upload it if you have it, or come back to this later.");
    return `
      <div class="question">
        <button
          class="secondary-button"
          type="button"
          data-open-upload
          data-upload-category="${escapeHtml(category)}"
          data-upload-label="${escapeHtml(question.label)}"
          data-upload-prompt="${escapeHtml(question.hint || "Upload the document if you have it.")}"
          data-upload-source="guided"
        >
          <i data-lucide="upload-cloud"></i>
          ${escapeHtml(question.label)}
        </button>
        <small>${escapeHtml(statusCopy)}</small>
      </div>
    `;
  }

  if (question.type === "toggle_az") {
    const selected = snapshot.value || "unknown";
    const options = [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Not sure at this point" },
      ...(question.allowNa ? [{ value: "na", label: "N/A" }] : [])
    ];
    return `
      <div class="question">
        <div class="toggle-row toggle-row-stack">
          <span>${escapeHtml(question.label)}</span>
          <div class="choice-group" role="group" aria-label="${escapeHtml(question.label)}">
            ${options.map((option) => `
              <button
                class="choice-button${selected === option.value ? " is-active" : ""}"
                type="button"
                data-guided-az-field="${escapeHtml(question.answerKey)}"
                data-guided-az-value="${escapeHtml(option.value)}"
              >
                ${escapeHtml(option.label)}
              </button>
            `).join("")}
          </div>
        </div>
        <small>${escapeHtml(selected === "unknown" ? (question.hint || "No problem — mark this to double-check later.") : selected === "na" ? "Marked as not applicable." : "Nice, that’s recorded. You can change it later.")}</small>
      </div>
    `;
  }

  if (question.type === "text_az") {
    return `
      <div class="question">
        <label>${escapeHtml(question.label)}</label>
        <input type="text" data-az-field="${escapeHtml(question.answerKey)}" value="${escapeHtml(snapshot.value || "")}" placeholder="Setup needed">
        <small>${escapeHtml(question.hint || "Add a short note if it helps.")}</small>
      </div>
    `;
  }

  if (question.type === "select_az") {
    const values = question.options.includes("") ? question.options : ["", ...question.options];
    return `
      <div class="question">
        <label>${escapeHtml(question.label)}</label>
        <select data-az-field="${escapeHtml(question.answerKey)}">
          ${values.map((option) => `<option value="${escapeHtml(option)}" ${option === (snapshot.value || "") ? "selected" : ""}>${escapeHtml(option || "Setup needed")}</option>`).join("")}
        </select>
        <small>${escapeHtml(question.hint || "Optional.")}</small>
      </div>
    `;
  }

  if (question.type === "toggle") {
    return toggleQuestion(question.label, question.field, snapshot.value, { allowNa: question.allowNa, hint: question.hint || "Not answered yet." });
  }
  if (question.type === "date") {
    return dateQuestion(question.label, question.field, snapshot.value || "", question.hint || "");
  }
  if (question.type === "text") {
    return textQuestion(question.label, question.field, snapshot.value || "", question.hint || "");
  }
  if (question.type === "number") {
    return numberQuestion(question.label, question.field, snapshot.value, question.hint || "");
  }
  if (question.type === "select") {
    return selectQuestion(question.label, question.field, snapshot.value || "", question.options || [], question.hint || "");
  }

  return "";
}

function renderGuidedSummarySection(property, sections, progress) {
  const evaluation = evaluateProperty(property);
  const actions = sortedActions(evaluation.items);
  const modulePlan = dashboardModulePlan(property, evaluation);
  const recommendations = defaultRecommendationList(property, evaluation, modulePlan);
  const knownExpired = evaluation.items.filter((item) => item.status === "expired").length;
  const upcoming = evaluation.items.filter((item) => item.status === "expiring_soon").length;
  const missingEvidence = evaluation.items.filter((item) => item.status === "missing").length;
  const unanswered = progress.remainingQuestions;
  const summaryActions = recommendations.length ? recommendations.slice(0, 3) : actions.slice(0, 3);
  const evidenceSummary = evidenceSummaryItems(property, modulePlan, evaluation);
  const timelineSummary = timelineSummaryItems(property, modulePlan);
  return `
    <span class="section-kicker">${escapeHtml(modulePlan.journeyLabel)}</span>
    <h3>${escapeHtml(modulePlan.journeyTitle)}</h3>
    <p class="section-copy">Here’s what we know so far. Unknown answers stay neutral, and you can change any answer later.</p>
    <div class="wizard-summary-grid">
      <article class="intel-stat">
        <span>Completed checks</span>
        <strong>${progress.answeredQuestions}/${progress.totalQuestions}</strong>
        <span>${progress.completedSections}/${progress.totalSections} sections complete</span>
      </article>
      <article class="intel-stat">
        <span>Still unanswered</span>
        <strong>${unanswered}</strong>
        <span>Unknown answers stay neutral until confirmed</span>
      </article>
      <article class="intel-stat">
        <span>Known missing proof</span>
        <strong>${missingEvidence}</strong>
        <span>Only counted when CMP knows the evidence is required</span>
      </article>
      <article class="intel-stat">
        <span>Renewals</span>
        <strong>${knownExpired + upcoming}</strong>
        <span>${knownExpired ? `${knownExpired} expired` : "No known expired items"}${upcoming ? ` · ${upcoming} coming up` : ""}</span>
      </article>
    </div>
    <h4 class="wizard-summary-heading">Possible next steps</h4>
    <div class="priority-list">
      ${(summaryActions.length ? summaryActions : evaluation.items.filter((item) => item.status === "ok").slice(0, 3)).map((item) => `
        <article class="priority-item">
          <span class="status-dot ${item.reason ? recommendationStatusTone(item.urgency) : statusTone(item.status)}"></span>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.reason || item.action)}</p>
          </div>
          ${item.id
            ? `<button class="service-button" type="button" data-recommendation-action="${escapeHtml(item.id)}">${escapeHtml(item.ctaLabel)}</button>`
            : `<span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>`}
        </article>
      `).join("")}
    </div>
    ${evidenceSummary.length ? `
      <div class="priority-list evidence-summary-list">
        ${evidenceSummary.map((item) => `
          <article class="priority-item">
            <span class="status-dot ${statusTone(item.status)}"></span>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.detail)}</p>
            </div>
            <span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>
          </article>
        `).join("")}
      </div>
    ` : ""}
    ${timelineSummary.length ? `
      <div class="priority-list evidence-summary-list">
        ${timelineSummary.map((item) => `
          <article class="priority-item">
            <span class="status-dot ${statusTone(item.status)}"></span>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.detail)}</p>
            </div>
            <span class="status-pill ${statusTone(item.status)}">${statusLabel(item.status)}</span>
          </article>
        `).join("")}
      </div>
    ` : ""}
    <p class="wizard-summary-note">No problem if you are not sure about everything yet. CMP can keep those items in a follow-up list instead of treating them as failures.</p>
    <p class="compliance-note">CMP helps organise and highlight property compliance information, but it is not legal advice.</p>
  `;
}

function wizardContent(section, property, sections, progress) {
  if (!section) return "";
  const body = section.id === "summary"
    ? renderGuidedSummarySection(property, sections, progress)
    : `
      <span class="section-kicker">${escapeHtml(section.mode === "required" ? "Current priority" : section.mode === "related" ? "Related check" : "Optional check")}</span>
      <h3>${escapeHtml(section.title)}</h3>
      <p class="section-copy">${escapeHtml(section.intro)} No problem if you need to skip and come back later.</p>
      <div class="question-grid">
        ${section.questions.map((question) => renderGuidedQuestion(section, question, property)).join("")}
      </div>
    `;

  return `
    ${body}
    <div class="wizard-actions">
      <button class="secondary-button" type="button" data-prev ${state.activeStep === 0 ? "disabled" : ""}>
        <i data-lucide="arrow-left"></i>
        Previous
      </button>
      <button class="primary-button" type="button" data-next ${state.activeStep === sections.length - 1 ? "disabled" : ""}>
        ${state.activeStep === sections.length - 2 ? "Review summary" : "Next"}
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

function numberQuestion(label, field, value, hint = "") {
  return `
    <div class="question">
      <label>${escapeHtml(label)}</label>
      <input type="number" min="0" data-field="${escapeHtml(field)}" value="${hasMeaningfulValue(value) ? escapeHtml(value) : ""}" placeholder="Setup needed">
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
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

function selectQuestion(label, field, value, options, hint = "") {
  const values = options.includes("") ? options : ["", ...options];
  return `
    <div class="question">
      <label>${escapeHtml(label)}</label>
      <select data-field="${escapeHtml(field)}">
        ${values.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option || "Setup needed")}</option>`).join("")}
      </select>
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </div>
  `;
}

function choiceStateForValue(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === "na") return "na";
  return "unknown";
}

function choiceValueForState(value) {
  if (value === "yes") return true;
  if (value === "no") return false;
  if (value === "na") return "na";
  return null;
}

function toggleQuestion(label, field, checked, { allowNa = false, hint = "No problem — mark this to double-check later." } = {}) {
  const selected = choiceStateForValue(checked);
  const options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "unknown", label: "Not sure at this point" },
    ...(allowNa ? [{ value: "na", label: "N/A" }] : [])
  ];
  return `
    <div class="question">
      <div class="toggle-row toggle-row-stack">
        <span>${escapeHtml(label)}</span>
        <div class="choice-group" role="group" aria-label="${escapeHtml(label)}">
          ${options.map((option) => `
            <button
              class="choice-button${selected === option.value ? " is-active" : ""}"
              type="button"
              data-choice-field="${escapeHtml(field)}"
              data-choice-value="${escapeHtml(option.value)}"
            >
              ${escapeHtml(option.label)}
            </button>
          `).join("")}
        </div>
      </div>
      <small>${escapeHtml(selected === "unknown" ? hint : selected === "na" ? "Marked as not applicable." : "Nice, that’s recorded. You can change it later.")}</small>
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
      ? (input.value === "" ? null : Number(input.value))
      : input.value;
  setPath(property, input.dataset.field, value);

  if (input.dataset.field === "address") {
    property.shortName = input.value.split(",")[0] || "New property";
    property.identity = {
      ...(property.identity || {}),
      propertyId: property.id,
      addressKey: normalizedAddressKey(input.value, property.postcode)
    };
  }

  if (input.dataset.field === "postcode") {
    property.postcode = input.value.toUpperCase();
    property.identity = {
      ...(property.identity || {}),
      propertyId: property.id,
      addressKey: normalizedAddressKey(property.address, property.postcode)
    };
  }

  recordJourneyAnswer(input.dataset.field, value);
  setQuestionEditing(guidedQuestionIdForField(input.dataset.field), false, property.id);
  refreshGuidedProgressState(property.id);
  syncPropertyEvidence(property);
  queueWorkspaceSave(property.id);
  if (rerender) renderAll();
  else renderDashboard();
}

function updateChoiceField(field, stateValue) {
  const property = activeProperty();
  if (!property) return;
  const value = choiceValueForState(stateValue);
  setPath(property, field, value);
  recordJourneyAnswer(field, value);
  setQuestionEditing(guidedQuestionIdForField(field), false, property.id);
  refreshGuidedProgressState(property.id);
  syncPropertyEvidence(property);
  queueWorkspaceSave(property.id);
  renderAll();
}

function updateAzField(field, value, rerender = true) {
  const property = activeProperty();
  if (!property) return;
  const answers = getAzAnswers(property.id);
  answers[field] = value === "" ? "" : value;
  setQuestionEditing(guidedQuestionIdForField(field), false, property.id);
  refreshGuidedProgressState(property.id);
  syncPropertyEvidence(property);
  queueWorkspaceSave(property.id);
  if (rerender) renderAll();
}

function showUploadFeedback(message, tone = "saved") {
  const feedback = document.querySelector("#uploadFeedback");
  if (!feedback) return;
  feedback.hidden = false;
  feedback.dataset.tone = tone;
  feedback.textContent = message;
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

function openUploadModal(trigger = null) {
  state.uploadContext = uploadContextForTrigger(trigger);
  document.querySelector("#uploadModal").hidden = false;
  const title = document.querySelector("#uploadTitle");
  const intro = document.querySelector("#uploadIntro");
  const label = document.querySelector("#uploadLabelText");
  const hint = document.querySelector("#uploadHintText");
  const input = document.querySelector("#documentUpload");
  const feedback = document.querySelector("#uploadFeedback");
  if (title) title.textContent = state.uploadContext.label;
  if (intro) intro.textContent = state.uploadContext.prompt;
  if (label) label.textContent = state.uploadContext.label;
  if (hint) hint.textContent = "PDF, image, or text files · files are analysed in this browser for prototype testing.";
  if (input) input.value = "";
  if (feedback) {
    feedback.hidden = true;
    feedback.textContent = "";
    delete feedback.dataset.tone;
  }
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

function scanDocument(file, text = "", hintedCategory = "other") {
  const haystack = `${file.name} ${text}`.toLowerCase();
  const rules = [
    { category: "gas", title: "Gas Safety Certificate", words: ["gas", "cp12", "lgsc"], years: 1 },
    { category: "eicr", title: "EICR", words: ["eicr", "electrical", "electric"], years: 5 },
    { category: "epc", title: "EPC certificate", words: ["epc", "energy performance", "energy-certificate"], years: 10 },
    { category: "deposit", title: "Deposit protection", words: ["deposit", "dps", "tds", "mydeposits"], years: null },
    { category: "tenancy", title: "Tenancy agreement", words: ["tenancy", "ast", "agreement", "how to rent"], years: null },
    { category: "prescribed_info", title: "Prescribed information", words: ["prescribed information", "how to rent", "information served"], years: null },
    { category: "licensing", title: "Licensing document", words: ["licence", "license", "licensing", "hmo"], years: 5 },
    { category: "inspections", title: "Inspection report", words: ["inspection", "inventory", "condition"], years: null },
    { category: "eviction_notices", title: "Notice or possession evidence", words: ["notice", "section 21", "section21", "possession", "eviction"], years: null },
    { category: "tenant_communications", title: "Tenant communication", words: ["email", "letter", "communication", "message", "tenant said"], years: null },
    { category: "alarms", title: "Alarm evidence", words: ["alarm", "smoke", "carbon monoxide", "co"], years: null },
    { category: "mould_damp", title: "Mould or damp report", words: ["mould", "mold", "damp", "condensation"], years: null },
    { category: "repairs", title: "Repair or maintenance evidence", words: ["repair", "maintenance", "contractor", "invoice", "work order"], years: null },
    { category: "insurance", title: "Insurance document", words: ["insurance", "policy schedule", "landlord policy"], years: null }
  ];
  const normalizedHint = normalizeEvidenceCategory(hintedCategory);
  const match = rules.find((rule) => rule.words.some((word) => haystack.includes(word)));
  const irrelevantWords = ["holiday", "birthday", "selfie", "passport", "driving licence", "bank statement"];
  const looksIrrelevant = irrelevantWords.some((word) => haystack.includes(word));
  const fallbackCategory = looksIrrelevant ? "irrelevant" : normalizedHint;
  const resolved = match || {
    category: fallbackCategory,
    title: fallbackCategory === "irrelevant" ? "Potentially irrelevant file" : UPLOAD_CATEGORY_TITLES[fallbackCategory] || "Unclassified landlord evidence",
    years: null
  };
  const issue = extractDate(haystack);
  const expiry = resolved.years && issue ? addYears(issue, resolved.years) : null;
  const categoryMatchedByHint = !match && normalizedHint !== "other";
  const confidenceScore = Math.min(96, 34 + (match ? 30 : 0) + (issue ? 18 : 0) + (categoryMatchedByHint ? 12 : 0) + (file.type ? 4 : 0));
  const confidenceLevel = confidenceScore >= 82 ? "high" : confidenceScore >= 62 ? "medium" : "low";
  const reviewNeeded = confidenceLevel === "low" || resolved.category === "irrelevant";

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    propertyId: state.activePropertyId,
    fileName: file.name,
    key: resolved.category,
    category: resolved.category,
    title: resolved.title,
    issue,
    expiry,
    confidence: confidenceScore,
    confidenceLevel,
    reviewNeeded,
    extractedFacts: {
      issueDate: issue || null,
      expiryDate: expiry || null
    },
    source: "upload",
    notes: reviewNeeded
      ? "Prototype classification should be reviewed before relying on it."
      : categoryMatchedByHint
        ? `Classified using the selected ${UPLOAD_CATEGORY_TITLES[normalizedHint] || normalizedHint} upload type.`
        : "Classified from file name and readable text in prototype mode.",
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
        confidence: "0-100 number",
        address: "property address printed on the document, or empty string",
        postcode: "postcode printed on the document, or empty string"
      },
      listingCheck: {
        matchesCurrentProperty: "yes | no | unknown",
        reason: "short reason when no or unknown"
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
  if (!key) {
    const edgeResult = await extractDocumentFactsWithSupabase(file, text, scan);
    return edgeResult;
  }

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
            "Compare any property address or postcode printed in the document with the current property record.",
            "If the document appears to belong to a different listing, set listingCheck.matchesCurrentProperty to no.",
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

async function extractDocumentFactsWithSupabase(file, text, scan) {
  const { client, user } = await getSupabaseSession();
  if (!client || !user || !client.functions?.invoke) return null;

  const property = activeProperty();
  const payload = {
    fileName: file.name,
    fileType: file.type || "",
    readableText: text || "",
    currentProperty: property ? propertySnapshot(property) : null,
    currentScanGuess: scan,
    fileData: canSendFileToAi(file) ? base64FromDataUrl(await readFileAsDataUrl(file)) : ""
  };
  const functionNames = ["document-reader", "DocumentReader", "documentReader"];

  for (const functionName of functionNames) {
    const { data, error } = await client.functions.invoke(functionName, { body: payload });
    if (!error && data) return typeof data === "string" ? safeJsonParse(data, null) : data;
    if (error && !/not found|404/i.test(error.message || "")) {
      console.warn(`Document reader function ${functionName} failed`, error);
      return null;
    }
  }

  return null;
}

const aiFieldMap = {
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

function extractPostcodes(value) {
  return Array.from(String(value || "").matchAll(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi))
    .map((match) => formatPostcode(match[0]));
}

function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function propertyAddressTokens(property) {
  return {
    postcode: normalizePostcode(property.postcode),
    houseNumber: normalizeMatchText(property.houseNumber || property.shortName?.match(/^\d+[a-z]?/i)?.[0] || ""),
    roadName: normalizeMatchText(property.roadName || property.address?.split(",")[0]?.replace(/^\d+[a-z]?\s*/i, "") || ""),
    city: normalizeMatchText(property.city || "")
  };
}

function buildListingWarning(reason, documentAddress = "") {
  return {
    blocked: true,
    reason,
    documentAddress
  };
}

function validateScanForProperty(scan, property, sources = {}) {
  if (!property) return buildListingWarning("No active property is selected.");
  const text = [scan.fileName, sources.text, sources.address, sources.postcode].filter(Boolean).join(" ");
  const propertyPostcode = normalizePostcode(property.postcode);
  const documentPostcodes = extractPostcodes(text);
  const uniqueDocumentPostcodes = [...new Set(documentPostcodes.map(normalizePostcode))];

  if (propertyPostcode && uniqueDocumentPostcodes.length && !uniqueDocumentPostcodes.includes(propertyPostcode)) {
    return buildListingWarning(
      `This document shows postcode ${formatPostcode(uniqueDocumentPostcodes[0])}, but the selected listing is ${formatPostcode(propertyPostcode)}.`,
      sources.address || formatPostcode(uniqueDocumentPostcodes[0])
    );
  }

  const tokens = propertyAddressTokens(property);
  const normalizedAddress = normalizeMatchText([sources.address, sources.text].filter(Boolean).join(" "));
  if (tokens.houseNumber && tokens.roadName && normalizedAddress) {
    const hasRoad = normalizedAddress.includes(tokens.roadName);
    const houseMatches = new RegExp(`\\b${tokens.houseNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(normalizedAddress);
    if (hasRoad && !houseMatches) {
      return buildListingWarning(
        `This document appears to be for ${sources.address || "another house on the same road"}.`,
        sources.address || ""
      );
    }
  }

  return { blocked: false, reason: "", documentAddress: sources.address || "" };
}

function markScanListingWarning(scan, warning) {
  scan.listingWarning = warning?.blocked ? warning.reason : "";
  scan.documentAddress = warning?.documentAddress || scan.documentAddress || "";
  scan.blocked = Boolean(warning?.blocked);
}

function applyAiExtraction(extraction, scan) {
  const property = activeProperty();
  if (!property || !extraction || typeof extraction !== "object") return false;

  const document = extraction.document || {};
  const listingCheck = extraction.listingCheck || {};
  const warning = validateScanForProperty(scan, property, {
    address: document.address || extraction.property?.address || "",
    postcode: document.postcode || extraction.property?.postcode || "",
    text: listingCheck.reason || ""
  });
  if (listingCheck.matchesCurrentProperty === "no" || warning.blocked) {
    markScanListingWarning(scan, warning.blocked ? warning : buildListingWarning(listingCheck.reason || "This document appears to belong to a different listing.", document.address || document.postcode || ""));
    return false;
  }

  const flatProperty = flattenObject(extraction.property || extraction.propertyPatch || {});
  Object.entries(flatProperty).forEach(([sourcePath, value]) => {
    const targetPath = aiFieldMap[sourcePath];
    if (!targetPath || !isKnownValue(value)) return;
    setPath(property, targetPath, typeof value === "string" && sourcePath === "postcode" ? value.toUpperCase() : value);
  });

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

function renderScanResults(modulePlan = dashboardModulePlan(activeProperty(), activeProperty() ? evaluateProperty(activeProperty()) : null)) {
  const propertyScans = state.scans.filter((scan) => scan.propertyId === state.activePropertyId).slice(-4).reverse();
  const target = document.querySelector("#scanResults");
  if (!propertyScans.length) {
    target.innerHTML = `
      <article class="scan-result">
        <strong>No scans yet</strong>
        <span>${escapeHtml(modulePlan.primaryFocus === "eviction" ? "Upload notices, communications, and proof documents to start the evidence pack." : modulePlan.primaryFocus === "mould" ? "Upload reports, photos, or repair notes to build the timeline." : "Upload a certificate or report to preview CMP document intelligence.")}</span>
      </article>
    `;
    return;
  }

  target.innerHTML = propertyScans.map((scan) => `
    <article class="scan-result${scan.blocked || scan.listingWarning ? " has-warning" : ""}">
      <strong>${escapeHtml(scan.title)}</strong>
      <span>${escapeHtml(scan.fileName)} · ${scan.confidenceLevel || "low"} confidence${scan.reviewNeeded ? " · review needed" : ""}</span>
      <span>${scan.issue ? `Issue date ${formatDate(scan.issue)}` : "No issue date found"}${scan.expiry ? ` · expires ${formatDate(scan.expiry)}` : ""}</span>
      ${scan.listingWarning ? `<small class="listing-warning"><i data-lucide="alert-triangle"></i>${escapeHtml(scan.listingWarning)}</small>` : ""}
      <button class="service-button" type="button" data-apply-scan="${escapeHtml(scan.id)}" ${scan.blocked || scan.listingWarning ? "disabled" : ""}>${scan.applied ? "Applied" : "Use details"}</button>
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
  if (scan.blocked || scan.listingWarning) {
    markScanListingWarning(scan, {
      blocked: true,
      reason: scan.listingWarning || "This document needs to be checked before it can be applied.",
      documentAddress: scan.documentAddress || ""
    });
    if (options.render !== false) renderAll();
    return;
  }
  const issue = scan.issue || "";
  const documentDate = issue || String(scan.scannedAt || new Date().toISOString()).slice(0, 10);

  if (scan.category === "gas") setPath(property, "gas.issue", property.gas?.issue || issue);
  if (scan.category === "eicr") setPath(property, "eicr.issue", property.eicr?.issue || issue);
  if (scan.category === "epc") setPath(property, "epc.issue", property.epc?.issue || issue);
  if (scan.category === "inspections") setPath(property, "inspections.last", property.inspections?.last || issue);
  if (scan.category === "licensing") {
    setPath(property, "licensing.localChecked", true);
    setPath(property, "licensing.hmoLicence", property.type === "HMO" ? true : property.licensing?.hmoLicence);
    if (scan.expiry) setPath(property, "licensing.licenceExpiry", scan.expiry);
  }
  if (scan.category === "deposit") {
    setPath(property, "deposit.protected", true);
    setPath(property, "deposit.prescribedInfo", true);
  }
  if (scan.category === "tenancy") setPath(property, "tenancy.agreement", true);
  if (scan.category === "prescribed_info") setPath(property, "deposit.prescribedInfo", true);
  if (scan.category === "alarms") {
    setPath(property, "alarms.smokeEachStorey", true);
    setPath(property, "alarms.testedAtStart", true);
  }
  if (scan.category === "eviction_notices") setPath(property, "possession.noticeDraft", true);
  if (scan.category === "eviction_notices") getAzAnswers(property.id).notice_evidence = "yes";
  if (scan.category === "tenant_communications") getAzAnswers(property.id).tenant_communications = "yes";
  if (scan.category === "mould_damp") getAzAnswers(property.id).mould_report = "yes";
  if (scan.category === "repairs") getAzAnswers(property.id).repair_history = "yes";

  if (!property.docs.some((doc) => doc.key === scan.key && doc.title === scan.title && doc.date === issue && doc.source === "AI scan preview")) {
    property.docs.unshift({
      key: scan.key,
      title: scan.title,
      date: issue,
      source: "AI scan preview"
    });
  }
  scan.applied = true;
  refreshGuidedProgressState(property.id);
  syncPropertyEvidence(property);
  queueWorkspaceSave(property.id);
  if (options.render !== false) renderAll();
}

function handleFiles(files) {
  const property = activeProperty();
  if (!property) {
    window.alert("Add a property listing before uploading evidence.");
    return;
  }
  if (!files?.length) return;
  const context = state.uploadContext || {
    category: "other",
    label: "Property evidence",
    prompt: "Upload documents for this property",
    source: "dashboard"
  };
  showUploadFeedback(
    `${files.length} file${files.length === 1 ? "" : "s"} selected in prototype mode. CMP is updating the evidence area and timeline now.`,
    "saved"
  );
  setSaveStatus("Prototype upload analysed", "local");
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = typeof reader.result === "string" ? reader.result.slice(0, 5000) : "";
      const scan = scanDocument(file, content, context.category);
      markScanListingWarning(scan, validateScanForProperty(scan, property, { text: content }));
      state.scans.push(scan);
      if (!scan.blocked && !getDocumentAiKey()) {
        applyScan(scan.id, { render: false });
      }
      queueWorkspaceSave();
      renderAll();
      await enrichScanWithAi(file, content, scan);
    };
    if (file.type.startsWith("text") || /\.(txt|csv|md)$/i.test(file.name)) {
      reader.readAsText(file);
    } else {
      const scan = scanDocument(file, "", context.category);
      markScanListingWarning(scan, validateScanForProperty(scan, property));
      state.scans.push(scan);
      if (!scan.blocked && !getDocumentAiKey()) {
        applyScan(scan.id, { render: false });
      }
      queueWorkspaceSave();
      renderAll();
      enrichScanWithAi(file, "", scan);
    }
  });
  window.setTimeout(() => {
    closeUploadModal();
    const input = document.querySelector("#documentUpload");
    if (input) input.value = "";
  }, 1100);
}

async function enrichScanWithAi(file, content, scan) {
  if (!getDocumentAiKey()) return;

  setSaveStatus("AI filling property details...", "saving");
  try {
    const extraction = await extractDocumentFactsWithAi(file, content, scan);
    if (!applyAiExtraction(extraction, scan)) {
      if (scan.blocked || scan.listingWarning) {
        setSaveStatus("Upload blocked - document is for another listing", "local");
        queueWorkspaceSave();
        renderAll();
        return;
      }
      applyScan(scan.id, { render: false });
      setSaveStatus("AI did not find new fields", "idle");
      queueWorkspaceSave();
      renderAll();
      return;
    }
    applyScan(scan.id, { ai: true });
  } catch (error) {
    console.warn("Could not fill CMP fields with AI", error);
    if (!scan.blocked && !scan.listingWarning) {
      applyScan(scan.id, { render: false });
      renderAll();
    }
    setSaveStatus("AI fill failed - saved preview only", "local");
  }
}

async function pullEpcData() {
  const property = activeProperty();
  if (!property) return;
  if (!hasEpcCredentials()) {
    window.alert("Add a valid Energy Performance Data API bearer token in the setup panel before refreshing EPC data for this prototype.");
    resetPropertySetup(true);
    state.setup.mode = "refresh";
    state.setup.pendingPropertyId = property.id;
    state.setup.postcode = property.postcode;
    state.setup.message = "CMP needs the prototype bearer token before it can refresh this EPC record.";
    renderAll();
    document.querySelector("#propertySetup")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const button = document.querySelector("#pullEpcButton");
  button.disabled = true;
  button.innerHTML = `<i data-lucide="cloud-download"></i> Pulling EPC`;
  refreshIcons();

  try {
    const postcodeMeta = await lookupPostcode(property.postcode);
    const matches = (await searchEpcByPostcode(property.postcode)).map((row) => epcMatchFromRow(row, postcodeMeta));
    const resolution = resolveEpcMatchesForProperty(property, matches);
    if (resolution.status === "choose") {
      openEpcRefreshSelection(property, resolution.matches, "Multiple EPC records match this postcode. Choose the correct record before CMP refreshes the property.");
      return;
    }
    if (resolution.status !== "matched" || !resolution.match) {
      window.alert("No EPC record was returned for this property postcode.");
      return;
    }
    applyEpcMatchToProperty(property, resolution.match);
  } catch (error) {
    window.alert(error.message || "Could not pull EPC data.");
    return;
  } finally {
    button.disabled = false;
    button.innerHTML = `<i data-lucide="cloud-download"></i> Pull EPC`;
    refreshIcons();
  }

  state.scans.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    propertyId: property.id,
    fileName: "Domestic EPC API search",
    key: "epc",
    title: "EPC register data pulled",
    issue: property.epc.issue,
    expiry: property.epc.expiry || addYears(property.epc.issue, 10),
    confidence: 91,
    scannedAt: new Date().toISOString()
  });

  setTimelineEvent(property, `system:${property.id}:epc-pull`, true, {
    type: "system",
    category: "epc",
    title: "EPC register data pulled",
    description: `Rating ${property.epc.rating || "not recorded"}, potential ${property.epc.potential || "not recorded"} from the Energy Performance Data domestic search API.`,
    eventDate: new Date().toISOString().slice(0, 10),
    dueDate: property.epc.expiry || addYears(property.epc.issue, 10)?.toISOString().slice(0, 10) || null,
    source: "api",
    linkedEvidenceId: bestEvidenceItem(property, "epc")?.id || null,
    linkedQuestionId: "epc_import",
    status: "completed",
    confidence: "high"
  });
  queueWorkspaceSave(property.id);
  renderAll();
}

function addProperty() {
  if (!state.journeyContext) {
    persistJourneyContext({ entryService: "full_compliance", focusMode: "full_compliance" });
  }
  resetPropertySetup(true);
  renderAll();
  document.querySelector("#propertySetup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function removeProperty(propertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;

  const confirmed = window.confirm(`Are you sure you want to remove ${property.shortName || "this portfolio listing"} from the portfolio?`);
  if (!confirmed) return;

  setSaveStatus("Removing portfolio listing...", "saving");
  const { client, user } = await getSupabaseSession();
  if (client && user) {
    const { error } = await client
      .from(WORKSPACE_TABLE)
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);

    if (error) {
      console.warn("Could not remove CMP workspace", error);
      setSaveStatus("Could not remove property", "error");
      window.alert(error.message || "Supabase could not delete this property. It has not been removed from your account.");
      renderAll();
      return;
    }
  }

  properties.splice(properties.indexOf(property), 1);
  delete state.azChecklist[propertyId];
  state.scans = state.scans.filter((scan) => scan.propertyId !== propertyId);
  removeWorkspaceLocally(propertyId, user?.id || null);
  ensureActiveProperty();
  clearJourneySelection(propertyId);

  if (!properties.length) {
    persistJourneyContext({ selectedPropertyId: null });
    applyJourneyNavigation({ forcePanel: true, forceStep: true });
    resetPropertySetup(true);
  } else {
    applyJourneyNavigation({ forcePanel: false, forceStep: false });
  }

  renderAll();
  setSaveStatus(client && user ? "Portfolio listing removed" : "Removed in this browser", client && user ? "saved" : "local");
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
    const recommendationId = document.querySelector("#startGuidedCheck").dataset.recommendationAction;
    if (recommendationId) {
      executeRecommendationAction(recommendationId);
      return;
    }
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
  });

  document.querySelector("#azDocumentDump")?.addEventListener("change", (event) => {
    handleFiles(event.target.files);
    showDashboardPanel("az", false);
    event.target.value = "";
  });

  document.querySelector("#saveAiSettings")?.addEventListener("click", saveAiPreferences);
  document.querySelector("#clearAiKey")?.addEventListener("click", clearAiKey);

  document.querySelector("#demoActions")?.querySelectorAll("[data-demo-scenario]").forEach((button) => {
    button.addEventListener("click", () => loadDemoScenario(button.dataset.demoScenario));
  });
  document.querySelector("#demoActions")?.querySelector("[data-demo-reset]")?.addEventListener("click", () => resetDemoStudio());
  if (!DEMO_MODE) {
    document.querySelector(".demo-studio")?.setAttribute("hidden", "hidden");
  }
});
