const STORAGE_KEY = "cmpPrimeV2Prototype";

const icons = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v5h5"></path></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z"></path></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>',
  service: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5 5l-6.4 6.4 3 3 6.4-6.4a4 4 0 0 0 5-5l-2.6 2.6-3-3 2.6-2.6Z"></path></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3.3 5.7 5.7v5.8c0 4.3 2.6 7.6 6.3 9.2 3.7-1.6 6.3-4.9 6.3-9.2V5.7L12 3.3Z"></path><path d="m8.8 12 2.1 2 4.4-4.7"></path></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4"></path><path d="m7 9 5-5 5 5"></path><path d="M20 16v4H4v-4"></path></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="m12 3 10 18H2L12 3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
};

const routePacks = {
  az: {
    label: "A-Z Compliance Map",
    short: "A-Z check",
    description: "Check a rental property from A-Z, then fix what is missing.",
    icon: "map",
    primary: true
  },
  epc: {
    label: "EPC check",
    short: "EPC check",
    description: "Check the EPC record, then add proof or book an assessment.",
    icon: "file"
  },
  gas: {
    label: "Gas Safety check",
    short: "Gas Safety",
    description: "Confirm whether gas applies, then add proof or book a Gas Safety check.",
    icon: "service"
  },
  damp: {
    label: "Damp/mould support",
    short: "Damp support",
    description: "Organise issue evidence, inspection history and damp or mould inspection support.",
    icon: "home"
  },
  possession: {
    label: "Possession preparation",
    short: "Possession prep",
    description: "Check what evidence is already in your property file before speaking to an advisor.",
    icon: "shield"
  }
};

const directServices = {
  epc: {
    title: "Book EPC assessment",
    outcome: "EPC evidence can be added to the property file and monitored for renewal.",
    route: "epc"
  },
  gasSafety: {
    title: "Book Gas Safety check",
    outcome: "A certificate can be added after the check and annual monitoring can begin.",
    route: "gas"
  },
  eicr: {
    title: "Book EICR",
    outcome: "The electrical report can be added and a review reminder created.",
    route: "az"
  },
  inspection: {
    title: "Book property inspection",
    outcome: "Condition notes, photos and follow-up actions can update the property plan.",
    route: "az"
  },
  damp: {
    title: "Request damp and mould inspection",
    outcome: "Issue evidence, repair history and monitoring can be connected to the case file.",
    route: "damp"
  }
};

const reviewServices = [
  "AML and identity checks",
  "Compliance monitoring",
  "Tenant documentation support",
  "Selective licensing guidance",
  "Licensing/HMO review",
  "Repairs follow-up",
  "Possession evidence preparation",
  "Landlord compliance advisory",
  "Human advisor support"
];

const oldWord = ["Proto", "type"].join("");
const oldStatus = {
  complete: `Complete for ${oldWord.toLowerCase()}`,
  evidenceUploaded: "Evidence uploaded",
  bookable: "Bookable now",
  review: "Review required",
  humanReview: "Human review recommended",
  serviceReady: "Service request prepared",
  callReady: "Call request prepared"
};
const oldSource = {
  address: `${oldWord} address list generated from postcode`,
  epc: `${oldWord} EPC match shown for review`,
  upload: `${oldWord} upload`
};

const stateTones = {
  "Ready to review": "good",
  [oldStatus.complete]: "good",
  "Evidence added": "good",
  [oldStatus.evidenceUploaded]: "good",
  "Landlord says held": "info",
  "Needs proof": "warn",
  "Needs answer": "warn",
  "Needs service": "risk",
  "Service ready to book": "risk",
  [oldStatus.bookable]: "risk",
  [oldStatus.review]: "warn",
  "Advisor review recommended": "risk",
  [oldStatus.humanReview]: "risk",
  "Monitor later": "info",
  "Not relevant": "info",
  "Not started": "info",
  "Booking details ready": "info",
  [oldStatus.serviceReady]: "info",
  "Advisor review requested": "info",
  [oldStatus.callReady]: "info"
};

const defaultState = {
  view: "home",
  routeIntent: null,
  selectedAddressId: null,
  addressOptions: [],
  property: null,
  scenario: {
    tenancy: "currently-tenanted",
    occupancy: "family-let",
    hmo: "not-sure",
    gas: "yes",
    damp: "reported",
    docs: "some-documents",
    possessionReason: "rent-arrears",
    noticeServed: "no",
    courtStarted: "no",
    depositTaken: "yes"
  },
  modules: {},
  selectedModuleId: null,
  activeServiceModuleId: null,
  monitoring: [],
  serviceDrafts: [],
  evidence: [],
  humanRequests: [],
  scan: {
    phase: "idle",
    suggestedModuleId: "gasSafety",
    savedForReview: 0
  },
  askLog: [],
  lastOutcome: ""
};

let state = loadState();
let toastTimer = null;

const app = document.querySelector("#app");
const docDrawer = document.querySelector("#documentDrawer");
const docDrawerBody = document.querySelector("#documentDrawerBody");
const askDrawer = document.querySelector("#askDrawer");
const askDrawerBody = document.querySelector("#askDrawerBody");
const toast = document.querySelector("#toast");

render();
renderDrawers();

document.body.addEventListener("click", handleClick);
document.body.addEventListener("submit", handleSubmit);
document.body.addEventListener("change", handleChange);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return structuredClone(defaultState);
    return mergeState(structuredClone(defaultState), saved);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, saved) {
  return {
    ...base,
    ...saved,
    scenario: { ...base.scenario, ...(saved.scenario || {}) },
    scan: { ...base.scan, ...(saved.scan || {}) },
    modules: saved.modules || base.modules,
    monitoring: Array.isArray(saved.monitoring) ? saved.monitoring : base.monitoring,
    serviceDrafts: Array.isArray(saved.serviceDrafts) ? saved.serviceDrafts : base.serviceDrafts,
    evidence: Array.isArray(saved.evidence) ? saved.evidence : base.evidence,
    humanRequests: Array.isArray(saved.humanRequests) ? saved.humanRequests : base.humanRequests,
    askLog: Array.isArray(saved.askLog) ? saved.askLog : base.askLog
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch) {
  state = mergeState(state, patch);
  saveState();
  render();
  renderDrawers();
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const moduleId = target.dataset.module;
  const route = target.dataset.route;
  const value = target.dataset.value;
  const field = target.dataset.field;

  if (action === "home") {
    setState({ view: "home" });
  }

  if (action === "route-home") {
    setState({ view: "routes" });
  }

  if (action === "services") {
    setState({ view: "services" });
  }

  if (action === "properties") {
    setState({ view: "properties" });
  }

  if (action === "start-az") {
    startRoute("az");
  }

  if (action === "start-route") {
    startRoute(route);
  }

  if (action === "choose-route") {
    startRoute(route);
  }

  if (action === "search-postcode") {
    const postcodeInput = document.querySelector("#postcode");
    const postcode = postcodeInput ? postcodeInput.value.trim() : "";
    createAddressOptions(postcode || "M1 4AB");
  }

  if (action === "select-address") {
    setState({ selectedAddressId: value });
  }

  if (action === "confirm-address") {
    confirmSelectedAddress();
  }

  if (action === "set-scenario") {
    setState({ scenario: { ...state.scenario, [field]: value } });
  }

  if (action === "run-smart") {
    runSmartCheck();
  }

  if (action === "review-map") {
    setState({ view: "workspace" });
  }

  if (action === "open-module") {
    setState({ selectedModuleId: moduleId, activeServiceModuleId: null });
  }

  if (action === "resolve-fix") {
    const id = moduleId || getFixFirstModule()?.id;
    setState({ selectedModuleId: id, activeServiceModuleId: null });
  }

  if (action === "simulate-evidence") {
    confirmEvidence(moduleId);
  }

  if (action === "answer-module") {
    answerModule(moduleId);
  }

  if (action === "mark-not-relevant") {
    updateModule(moduleId, {
      status: "Not relevant",
      evidence: "Not relevant",
      action: "View detail",
      source: "Landlord confirmed"
    });
    addOutcome(`${getModule(moduleId).name} marked not relevant. The property plan has been updated.`);
  }

  if (action === "monitor-later") {
    monitorLater(moduleId);
  }

  if (action === "open-service") {
    setState({ selectedModuleId: moduleId, activeServiceModuleId: moduleId, view: "workspace" });
  }

  if (action === "prepare-service") {
    prepareService(moduleId);
  }

  if (action === "expand-az") {
    state.routeIntent = "az";
    state.modules = buildModules("az");
    state.selectedModuleId = getFixFirstModule()?.id || "gasSafety";
    state.activeServiceModuleId = null;
    state.view = "workspace";
    addOutcome("Full A-Z check added. CMP has expanded the map while keeping the same property file.");
  }

  if (action === "open-documents") {
    openDrawer(docDrawer);
  }

  if (action === "close-documents") {
    closeDrawer(docDrawer);
  }

  if (action === "simulate-scan") {
    simulateScan();
  }

  if (action === "confirm-scan") {
    confirmScan();
  }

  if (action === "save-scan-review") {
    state.scan.savedForReview += 1;
    state.scan.phase = "saved";
    addOutcome("Document added for review. CMP has not changed the Property Plan yet.");
  }

  if (action === "scan-unknown") {
    state.scan.phase = "result";
    state.scan.suggestedModuleId = "unknown";
    saveState();
    renderDrawers();
  }

  if (action === "open-ask") {
    if (moduleId) state.selectedModuleId = moduleId;
    openDrawer(askDrawer);
    saveState();
    renderDrawers();
  }

  if (action === "close-ask") {
    closeDrawer(askDrawer);
  }

  if (action === "ask-prompt") {
    submitAsk(value);
  }

  if (action === "what-if") {
    submitAsk(value || "What would happen if I ignore this?");
    openDrawer(askDrawer);
  }

  if (action === "request-human") {
    requestHuman(moduleId);
  }

  if (action === "open-workspace") {
    if (!state.property) {
      setState({ view: "routes" });
    } else {
      setState({ view: "workspace" });
    }
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (form.matches("[data-form='ask']")) {
    event.preventDefault();
    const input = form.querySelector("textarea");
    const question = input ? input.value.trim() : "";
    if (question) {
      input.value = "";
      submitAsk(question);
    }
  }

  if (form.matches("[data-form='booking']")) {
    event.preventDefault();
    const moduleId = form.dataset.module;
    prepareService(moduleId);
  }
}

function handleChange(event) {
  if (event.target.matches("#documentFile")) {
    simulateScan(event.target.files && event.target.files[0] ? event.target.files[0].name : "");
  }
}

function startRoute(route) {
  setState({
    routeIntent: route,
    view: route ? "address" : "routes",
    modules: {},
    selectedModuleId: null,
    activeServiceModuleId: null,
    askLog: [],
    lastOutcome: ""
  });
}

function createAddressOptions(postcode) {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, " ").trim();
  const district = cleaned.split(" ")[0] || "M1";
  const street = district.startsWith("SW")
    ? "Oakfield Road"
    : district.startsWith("BS")
      ? "Cotham Grove"
      : district.startsWith("LS")
        ? "North Street"
        : "King Street";
  const town = district.startsWith("SW")
    ? "London"
    : district.startsWith("BS")
      ? "Bristol"
      : district.startsWith("LS")
        ? "Leeds"
        : "Manchester";
  const localAuthority = district.startsWith("SW")
    ? "Wandsworth Council"
    : district.startsWith("BS")
      ? "Bristol City Council"
      : district.startsWith("LS")
        ? "Leeds City Council"
        : "Manchester City Council";

  const addresses = [12, 14, 16, 18].map((number, index) => ({
    id: `${cleaned}-${index}`,
    line1: `${number} ${street}`,
    line2: index === 1 ? "Flat 2" : index === 2 ? "Garden flat" : "",
    town,
    postcode: cleaned,
    localAuthority
  }));

  state.addressOptions = addresses;
  state.selectedAddressId = addresses[1].id;
  saveState();
  render();
  showToast("Select the closest matching address. You can edit this later.");
}

function confirmSelectedAddress() {
  const selected = getSelectedAddress();
  if (!selected) {
    showToast("Select an exact address first.");
    return;
  }

  const address = formatAddress(selected);
  const property = {
    id: state.property?.id || `property-${Date.now()}`,
    address,
    postcode: selected.postcode,
    localAuthority: selected.localAuthority,
    propertyType: "Terraced house",
    bedrooms: 3,
    lastUpdated: "Today"
  };

  setState({
    property,
    view: "scenario",
    modules: {},
    selectedModuleId: null,
    monitoring: state.monitoring,
    serviceDrafts: state.serviceDrafts,
    evidence: state.evidence
  });
}

function runSmartCheck() {
  const modules = buildModules(state.routeIntent || "az");
  const first = pickFixFirst(Object.values(modules));
  setState({
    modules,
    selectedModuleId: first?.id || Object.keys(modules)[0],
    activeServiceModuleId: null,
    view: "smart"
  });
}

function buildModules(route) {
  const scenario = state.scenario;
  const possibleHmo = scenario.hmo === "possible" || scenario.hmo === "not-sure";
  const hasDamp = scenario.damp === "reported" || scenario.damp === "serious";
  const hasGas = scenario.gas !== "no";

  const all = {
    identity: moduleFactory({
      id: "identity",
      name: "Address and property identity",
      area: "Property file",
      status: "Ready to review",
      evidence: "Exact address selected",
      action: "View detail",
      source: "Address selected by landlord",
      urgency: 1,
      description: "The selected address anchors evidence, service requests and monitoring for this property."
    }),
    epc: moduleFactory({
      id: "epc",
      name: "EPC",
      area: "Energy performance",
      status: route === "epc" ? "Needs proof" : "Landlord says held",
      evidence: route === "epc" ? "EPC not found - add proof or book an assessment" : "EPC match ready to review",
      action: route === "epc" ? "Add proof" : "View detail",
      source: "EPC match ready to review",
      urgency: route === "epc" ? 68 : 30,
      serviceType: "Book EPC assessment",
      monitoringDate: "14 Aug 2027",
      description: "CMP checks the EPC record after the exact address has been selected."
    }),
    gasSafety: moduleFactory({
      id: "gasSafety",
      name: "Gas Safety",
      area: "Safety certificate",
      status: hasGas ? "Service ready to book" : "Not relevant",
      evidence: hasGas ? "No certificate uploaded" : "Landlord says no gas supply",
      action: hasGas ? "Book service" : "View detail",
      source: hasGas ? "Needs landlord proof" : "Landlord confirmed",
      urgency: hasGas ? 96 : 5,
      serviceType: "Book Gas Safety check",
      monitoringDate: "Annual renewal after evidence is added",
      description: "If the property has gas, CMP needs a current certificate or a booked check."
    }),
    eicr: moduleFactory({
      id: "eicr",
      name: "EICR",
      area: "Electrical safety",
      status: "Needs proof",
      evidence: "No report uploaded",
      action: "Add proof",
      source: "Landlord confirmation needed",
      urgency: 72,
      serviceType: "Book EICR",
      monitoringDate: "Review reminder after report date",
      description: "Add an existing EICR or prepare an electrical inspection request."
    }),
    smokeCo: moduleFactory({
      id: "smokeCo",
      name: "Smoke and CO alarms",
      area: "Safety checks",
      status: "Needs answer",
      evidence: "Alarm position not confirmed",
      action: "Answer question",
      source: "Landlord confirmation needed",
      urgency: 58,
      serviceType: "Arrange smoke and CO alarm check",
      description: "CMP needs a simple landlord confirmation or inspection note before monitoring can be added."
    }),
    licensing: moduleFactory({
      id: "licensing",
      name: "Licensing/HMO",
      area: "Local authority",
      status: possibleHmo ? "Advisor review recommended" : "Monitor later",
      evidence: possibleHmo ? "HMO/licensing position unclear" : "No immediate signal",
      action: possibleHmo ? "Speak to a human" : "Set reminder",
      source: state.property?.localAuthority || "Local authority context",
      urgency: possibleHmo ? 84 : 26,
      serviceType: "Request licensing review",
      description: "Possible HMO or licensing uncertainty should be reviewed before CMP narrows the route."
    }),
    tenancy: moduleFactory({
      id: "tenancy",
      name: "Tenancy agreement",
      area: "Tenancy pack",
      status: "Needs proof",
      evidence: "No tenancy agreement uploaded",
      action: "Add proof",
      source: "Landlord confirmation needed",
      urgency: 62,
      serviceType: "Tenant documentation support",
      description: "CMP connects tenancy evidence to deposit, possession readiness and property file completeness."
    }),
    deposit: moduleFactory({
      id: "deposit",
      name: "Deposit protection",
      area: "Tenancy pack",
      status: scenario.depositTaken === "yes" ? "Needs answer" : "Not relevant",
      evidence: scenario.depositTaken === "yes" ? "Protection evidence not confirmed" : "No deposit taken",
      action: scenario.depositTaken === "yes" ? "Answer question" : "View detail",
      source: "Landlord confirmation needed",
      urgency: scenario.depositTaken === "yes" ? 66 : 8,
      serviceType: "Tenant documentation support",
      description: "CMP asks whether a deposit exists before requesting proof."
    }),
    prescribedInfo: moduleFactory({
      id: "prescribedInfo",
      name: "Prescribed information",
      area: "Tenancy pack",
      status: scenario.depositTaken === "yes" ? "Needs proof" : "Not relevant",
      evidence: scenario.depositTaken === "yes" ? "No proof uploaded" : "No deposit taken",
      action: scenario.depositTaken === "yes" ? "Add proof" : "View detail",
      source: "Landlord confirmation needed",
      urgency: scenario.depositTaken === "yes" ? 60 : 8,
      description: "This stays evidence-led and does not decide whether documents are legally valid."
    }),
    howToRent: moduleFactory({
      id: "howToRent",
      name: "How to Rent guide",
      area: "Tenancy pack",
      status: "Needs answer",
      evidence: "Served date not known",
      action: "Answer question",
      source: "Landlord confirmation needed",
      urgency: 55,
      description: "CMP can record what the landlord says was served and attach supporting evidence."
    }),
    inventory: moduleFactory({
      id: "inventory",
      name: "Inventory/check-in",
      area: "Move-in records",
      status: "Needs proof",
      evidence: "No inventory uploaded",
      action: "Add proof",
      source: "Landlord confirmation needed",
      urgency: 42,
      serviceType: "Inventory/check-in support",
      description: "Inventory evidence helps keep the property file complete and supports later issue tracking."
    }),
    repairs: moduleFactory({
      id: "repairs",
      name: "Repairs records",
      area: "Repairs",
      status: hasDamp ? "Needs proof" : "Monitor later",
      evidence: hasDamp ? "Repair history needed" : "No current issue reported",
      action: hasDamp ? "Add proof" : "Set reminder",
      source: hasDamp ? "Scenario answer" : "Landlord confirmation",
      urgency: hasDamp ? 76 : 22,
      serviceType: "Repairs follow-up",
      description: "Repair records connect issue evidence, contractor notes and future monitoring."
    }),
    dampMould: moduleFactory({
      id: "dampMould",
      name: "Damp/mould evidence",
      area: "Issue file",
      status: hasDamp ? "Service ready to book" : "Not relevant",
      evidence: hasDamp ? "Photos and inspection notes needed" : "No issue reported",
      action: hasDamp ? "Book service" : "View detail",
      source: hasDamp ? "Scenario answer" : "Landlord confirmation",
      urgency: hasDamp ? 82 : 5,
      serviceType: "Request damp and mould inspection",
      monitoringDate: "Follow-up after inspection",
      description: "CMP builds a property issue file without making medical or legal conclusions."
    }),
    inspections: moduleFactory({
      id: "inspections",
      name: "Inspection records",
      area: "Property condition",
      status: "Needs proof",
      evidence: "No recent inspection uploaded",
      action: "Add proof",
      source: "Landlord confirmation needed",
      urgency: 40,
      serviceType: "Book property inspection",
      description: "Inspection records help connect condition evidence with follow-up actions."
    }),
    contractorRecords: moduleFactory({
      id: "contractorRecords",
      name: "Contractor records",
      area: "Service history",
      status: "Needs proof",
      evidence: "No contractor documents uploaded",
      action: "Add proof",
      source: "Landlord confirmation needed",
      urgency: 35,
      description: "Contractor evidence can support service history, repairs and renewal monitoring."
    }),
    monitoring: moduleFactory({
      id: "monitoring",
      name: "Renewal monitoring",
      area: "Monitoring",
      status: state.monitoring.length ? "Ready to review" : "Not started",
      evidence: state.monitoring.length ? `${state.monitoring.length} reminder${state.monitoring.length === 1 ? "" : "s"} created` : "No reminders yet",
      action: state.monitoring.length ? "View detail" : "Set reminder",
      source: "Property plan",
      urgency: state.monitoring.length ? 12 : 34,
      description: "Monitoring is created from evidence, service bookings and monitor-later decisions."
    })
  };

  if (route === "epc") return pickModules(all, ["identity", "epc", "monitoring"]);
  if (route === "gas") return pickModules(all, ["identity", "gasSafety", "monitoring"]);
  if (route === "damp") return pickModules(all, ["identity", "repairs", "dampMould", "inspections", "contractorRecords", "monitoring"]);
  if (route === "possession") {
    const possession = {
      ...pickModules(all, [
        "identity",
        "tenancy",
        "deposit",
        "prescribedInfo",
        "epc",
        "gasSafety",
        "howToRent",
        "licensing",
        "repairs",
        "dampMould",
        "inspections",
        "contractorRecords"
      ]),
      arrears: moduleFactory({
        id: "arrears",
        name: "Rent arrears evidence",
        area: "Possession readiness",
        status: scenario.possessionReason === "rent-arrears" ? "Needs proof" : "Not relevant",
        evidence: scenario.possessionReason === "rent-arrears" ? "Rent schedule and dates needed" : "Different reason selected",
        action: scenario.possessionReason === "rent-arrears" ? "Add proof" : "View detail",
        source: "Possession route answer",
        urgency: scenario.possessionReason === "rent-arrears" ? 88 : 10,
        description: "CMP prepares evidence for advisor review; it does not decide whether a possession route is valid."
      }),
      communicationLog: moduleFactory({
        id: "communicationLog",
        name: "Tenant communication log",
        area: "Possession readiness",
        status: "Needs proof",
        evidence: "Messages and timeline not uploaded",
        action: "Add proof",
        source: "Landlord confirmation needed",
        urgency: 70,
        description: "Saved communications help an advisor understand what has happened so far."
      }),
      noticeStatus: moduleFactory({
        id: "noticeStatus",
        name: "Notice status",
        area: "Possession readiness",
        status: scenario.noticeServed === "yes" ? "Needs proof" : "Advisor review recommended",
        evidence: scenario.noticeServed === "yes" ? "Notice copy not uploaded" : "No notice served",
        action: "Speak to a human",
        source: "Possession route answer",
        urgency: 92,
        serviceType: "Human advisor support",
        description: "CMP helps organise the evidence needed for review. It does not prepare official notices."
      }),
      humanReview: moduleFactory({
        id: "humanReview",
        name: "Human advisor review",
        area: "Advisor support",
        status: "Advisor review recommended",
        evidence: "Advisor review recommended before next steps",
        action: "Speak to a human",
        source: "Possession route",
        urgency: 98,
        serviceType: "Prepare possession evidence review",
        description: "A CMP advisor can review the property file and explain what to prepare before seeking possession advice."
      })
    };
    return possession;
  }

  return all;
}

function moduleFactory(config) {
  return {
    id: config.id,
    name: config.name,
    area: config.area,
    status: config.status || "Not started",
    evidence: config.evidence || "Not known",
    action: config.action || "View detail",
    source: config.source || "Landlord confirmation needed",
    urgency: config.urgency || 20,
    serviceType: config.serviceType || "",
    monitoringDate: config.monitoringDate || "",
    description: config.description || "",
    updated: false
  };
}

function pickModules(all, ids) {
  return ids.reduce((picked, id) => {
    if (all[id]) picked[id] = all[id];
    return picked;
  }, {});
}

function getSelectedAddress() {
  return state.addressOptions.find((address) => address.id === state.selectedAddressId);
}

function formatAddress(address) {
  return [address.line2, address.line1, address.town, address.postcode].filter(Boolean).join(", ");
}

function getModule(moduleId) {
  return state.modules[moduleId] || null;
}

function updateModule(moduleId, patch) {
  const current = getModule(moduleId);
  if (!current) return;
  state.modules[moduleId] = { ...current, ...patch, updated: true };
  saveState();
  render();
}

function confirmEvidence(moduleId) {
  const module = getModule(moduleId);
  if (!module) return;
  const evidenceItem = {
    id: `evidence-${Date.now()}`,
    moduleId,
    moduleName: module.name,
    label: `${module.name} evidence added`,
    date: "Today",
    source: "Document added by landlord"
  };
  state.evidence = upsertByModule(state.evidence, evidenceItem);
  state.modules[moduleId] = {
    ...module,
    status: "Evidence added",
    evidence: "Evidence added",
    action: module.monitoringDate ? "Set reminder" : "View detail",
    source: "Document added by landlord"
  };
  if (module.monitoringDate) {
    addMonitoring({
      moduleId,
      title: `${module.name} renewal or follow-up`,
      due: module.monitoringDate,
      reason: "Created from uploaded evidence"
    });
  }
  addOutcome(`${module.name} evidence confirmed. CMP has updated the ${module.name} requirement and added renewal monitoring where needed.`);
}

function answerModule(moduleId) {
  const module = getModule(moduleId);
  if (!module) return;
  state.modules[moduleId] = {
    ...module,
    status: "Landlord says held",
    evidence: "Landlord confirmed; proof can be added later",
    action: "Add proof",
    source: "Landlord confirmed",
    updated: true
  };
  addOutcome(`${module.name} answer saved. CMP has narrowed this route and left proof upload as the next available action.`);
}

function monitorLater(moduleId) {
  const module = getModule(moduleId);
  if (!module) return;
  state.modules[moduleId] = {
    ...module,
    status: "Monitor later",
    evidence: "Monitoring created",
    action: "View detail",
    source: "Landlord chose monitor later",
    updated: true
  };
  addMonitoring({
    moduleId,
    title: `${module.name} check-in`,
    due: module.monitoringDate || "In 30 days",
    reason: "Created from Monitor later"
  });
  addOutcome(`${module.name} moved to Monitor later. A reminder now appears in this property plan.`);
}

function prepareService(moduleId) {
  const module = getModule(moduleId);
  if (!module) return;
  const form = document.querySelector(`[data-form='booking'][data-module='${moduleId}']`);
  const draft = {
    id: `service-${Date.now()}`,
    moduleId,
    moduleName: module.name,
    serviceType: module.serviceType || "CMP advisor support",
    urgency: form?.querySelector("[name='urgency']")?.value || "Soon",
    preference: form?.querySelector("[name='preference']")?.value || "Phone",
    contractor: form?.querySelector("[name='contractor']")?.value || "No contractor selected",
    status: "Booking details ready",
    created: "Today"
  };
  state.serviceDrafts = upsertByModule(state.serviceDrafts, draft);
  state.modules[moduleId] = {
    ...module,
    status: "Booking details ready",
    evidence: "Expected after service",
    action: "Set reminder",
    source: "Service panel",
    updated: true
  };
  addMonitoring({
    moduleId,
    title: `${draft.serviceType} follow-up`,
    due: "After preferred appointment",
    reason: "Created from booking details"
  });
  addOutcome(`${draft.serviceType} details ready for ${module.name}. No supplier has been contacted yet and no payment has been taken.`);
}

function requestHuman(moduleId) {
  const module = moduleId ? getModule(moduleId) : null;
  const request = {
    id: `human-${Date.now()}`,
    moduleId: moduleId || "general",
    moduleName: module?.name || "Property file",
    status: oldStatus.callReady,
    reason: module?.status || "Landlord wants help deciding",
    created: "Today"
  };
  state.humanRequests = upsertByModule(state.humanRequests, request);
  if (module) {
    state.modules[moduleId] = {
      ...module,
      status: module.status === "Advisor review recommended" || module.status === oldStatus.humanReview ? "Advisor review recommended" : module.status,
      action: "Speak to a human",
      source: "Advisor route",
      updated: true
    };
  }
  addOutcome(`CMP advisor review requested for ${request.moduleName}. No call has been booked yet.`);
}

function addMonitoring(item) {
  const next = {
    id: `monitor-${item.moduleId}`,
    moduleId: item.moduleId,
    title: item.title,
    due: item.due,
    reason: item.reason
  };
  state.monitoring = upsertByModule(state.monitoring, next);
  if (state.modules.monitoring) {
    state.modules.monitoring = {
      ...state.modules.monitoring,
      status: "Ready to review",
      evidence: `${state.monitoring.length} reminder${state.monitoring.length === 1 ? "" : "s"} created`,
      action: "View detail",
      updated: true
    };
  }
}

function upsertByModule(list, item) {
  const filtered = list.filter((existing) => existing.moduleId !== item.moduleId);
  return [...filtered, item];
}

function addOutcome(message) {
  state.lastOutcome = message;
  state.activeServiceModuleId = null;
  saveState();
  render();
  renderDrawers();
  showToast(message);
}

function pickFixFirst(modules) {
  return modules
    .filter((module) => !["Ready to review", oldStatus.complete, "Evidence added", oldStatus.evidenceUploaded, "Not relevant", "Monitor later", "Booking details ready", oldStatus.serviceReady].includes(module.status))
    .sort((a, b) => b.urgency - a.urgency)[0] || modules[0];
}

function getFixFirstModule() {
  return pickFixFirst(Object.values(state.modules || {}));
}

function getVisibleModules() {
  return Object.values(state.modules || {});
}

function getReadiness() {
  const modules = getVisibleModules();
  if (!modules.length) return 0;
  const goodStates = ["Ready to review", oldStatus.complete, "Evidence added", oldStatus.evidenceUploaded, "Landlord says held", "Not relevant", "Monitor later", "Booking details ready", oldStatus.serviceReady];
  const score = Math.round((modules.filter((module) => goodStates.includes(module.status)).length / modules.length) * 100);
  return Math.max(18, Math.min(94, score));
}

function getCounts() {
  const modules = getVisibleModules();
  return {
    evidenceGaps: modules.filter((module) => ["Needs proof", "Needs answer"].includes(module.status)).length,
    servicesReady: modules.filter(isServiceVisible).length,
    review: modules.filter((module) => [oldStatus.review, "Advisor review recommended", oldStatus.humanReview].includes(module.status)).length,
    monitoring: state.monitoring.length
  };
}

function render() {
  const views = {
    home: renderHome,
    routes: renderRoutes,
    address: renderAddress,
    scenario: renderScenario,
    smart: renderSmartCheck,
    workspace: renderWorkspace,
    services: renderServices,
    properties: renderProperties
  };
  app.innerHTML = (views[state.view] || renderHome)();
  app.focus({ preventScroll: true });
}

function renderHome() {
  return `
    <section class="page">
      <div class="hero">
        <div class="hero-copy">
          <h1>Check a rental property from A-Z, then fix what is missing.</h1>
          <p class="hero-lede">Rental compliance, evidence and services in one guided checker for self-managing landlords.</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-action="start-az">
              <span class="btn-icon" aria-hidden="true">${icons.arrow}</span>
              Start A-Z Compliance Map
            </button>
            <button class="secondary-button" type="button" data-action="route-home">
              Choose a property route
            </button>
          </div>
          <div class="promise-strip" aria-label="CMP Prime flow">
            ${["Check the property", "See the A-Z Compliance Map", "Add proof or book services", "Keep renewals monitored"].map((title, index) => `
              <div class="promise-step">
                <strong>${index + 1}. ${title}</strong>
                <span>${[
                  "Enter a postcode and select the property address.",
                  "See the gaps, priorities and next actions in one Property Plan.",
                  "Upload evidence or book the service linked to each requirement.",
                  "Keep renewal dates and follow-up reminders with the property record."
                ][index]}</span>
              </div>
            `).join("")}
          </div>
        </div>

        ${renderWorkspacePreview()}
      </div>

      <section class="route-strip" aria-label="Route entry points">
        <div class="route-grid">
          ${renderRouteCard("epc")}
          ${renderRouteCard("gas")}
          ${renderRouteCard("damp")}
          ${renderRouteCard("possession")}
        </div>
      </section>
    </section>
  `;
}

function renderWorkspacePreview() {
  return `
    <div class="workspace-preview" aria-label="Compliance Map preview">
      <div class="preview-head">
        <div>
          <p class="preview-title">A-Z Compliance Map</p>
          <p class="preview-address">14 King Street, Manchester M1 4AB</p>
        </div>
        <span class="source-label">${icons.shield} Property Plan</span>
      </div>
      <div class="readiness-card">
        <div class="readiness-ring">62%</div>
        <div>
          <h2>Ready with gaps</h2>
          <p>One Fix First item, three supporting evidence gaps and two services ready to book.</p>
        </div>
      </div>
      <div class="fix-preview">
        <h3>Fix first: Gas Safety proof or booking</h3>
        <p>CMP shows the highest priority requirement first, then offers proof, booking and advisor options.</p>
      </div>
      <div class="mini-map">
        ${[
          ["EPC", "Landlord says held", "info"],
          ["Gas Safety", "Service ready to book", "risk"],
          ["EICR", "Needs proof", "warn"],
          ["Licensing/HMO", "Advisor review recommended", "warn"],
          ["Monitoring", "Created from actions", "good"]
        ].map(([name, status, tone]) => `
          <div class="mini-row">
            <span>${name}</span>
            <span class="state-chip" data-tone="${tone}">${status}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderRouteCard(routeId) {
  const route = routePacks[routeId];
  return `
    <button class="route-card" type="button" data-action="start-route" data-route="${routeId}">
      <span class="card-icon" aria-hidden="true">${icons[route.icon]}</span>
      <h3>${route.label}</h3>
      <p>${route.description}</p>
      <span class="card-foot">${routeId === "possession" ? "Prepare evidence pack" : "Add proof or book services"}</span>
    </button>
  `;
}

function renderRoutes() {
  return `
    <section class="page">
      ${renderPageHead("Choose why you came to CMP today.", "Start with the full A-Z Compliance Map, a specific service route, or possession preparation for advisor review.")}
      <div class="route-grid">
        ${Object.keys(routePacks).map((routeId) => {
          const route = routePacks[routeId];
          return `
            <button class="route-card" type="button" data-action="choose-route" data-route="${routeId}">
              <span class="card-icon" aria-hidden="true">${icons[route.icon]}</span>
              <h3>${route.label}</h3>
              <p>${route.description}</p>
              <span class="card-foot">${route.primary ? "Recommended first route" : routeId === "possession" ? "Advisor review recommended" : "Focused property route"}</span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAddress() {
  const selected = getSelectedAddress();
  return `
    <section class="page">
      ${renderProgress("address")}
      ${renderPageHead("Select the property address.", "Enter postcode, choose the closest matching address, then confirm the property details before CMP checks the EPC record.")}
      <div class="wizard-layout">
        <div class="form-panel">
          <div class="field-grid">
            <div class="field">
              <label for="postcode">Enter postcode</label>
              <input id="postcode" value="${escapeHtml(selected?.postcode || state.property?.postcode || "M1 4AB")}" autocomplete="postal-code">
              <p class="field-help">Select the closest matching address. You can edit this later.</p>
            </div>
            <div class="button-row">
              <button class="primary-button" type="button" data-action="search-postcode">
                <span class="btn-icon" aria-hidden="true">${icons.search}</span>
                Find addresses
              </button>
            </div>
          </div>

          ${state.addressOptions.length ? `
            <div class="address-list" aria-label="Property address results">
              ${state.addressOptions.map((address) => `
                <button class="address-option ${address.id === state.selectedAddressId ? "is-selected" : ""}" type="button" data-action="select-address" data-value="${escapeHtml(address.id)}">
                  <span>
                    <strong>${escapeHtml(formatAddress(address))}</strong>
                    <span class="small-copy">${escapeHtml(address.localAuthority)}</span>
                  </span>
                  <span class="state-chip" data-tone="${address.id === state.selectedAddressId ? "good" : "info"}">${address.id === state.selectedAddressId ? "Selected" : "Choose"}</span>
                </button>
              `).join("")}
            </div>
            <div class="panel-actions" style="margin-top: 1rem;">
              <button class="primary-button" type="button" data-action="confirm-address">
                Confirm property details
                <span class="btn-icon" aria-hidden="true">${icons.arrow}</span>
              </button>
            </div>
          ` : ""}
        </div>

        <aside class="panel">
          <div class="panel-head">
            <div>
              <h2>${routePacks[state.routeIntent || "az"].label}</h2>
              <p>${routePacks[state.routeIntent || "az"].description}</p>
            </div>
          </div>
          <div style="margin-top: 1rem;" class="notice info">
            <strong>Address comes first.</strong>
            <span>Compliance requirements and EPC review appear after address selection, not from postcode alone.</span>
          </div>
          <div style="margin-top: 1rem;" class="source-label">Select the closest matching address. You can edit this later.</div>
        </aside>
      </div>
    </section>
  `;
}

function renderScenario() {
  const route = state.routeIntent || "az";
  const isPossession = route === "possession";
  return `
    <section class="page">
      ${renderProgress("scenario")}
      ${renderPageHead(getScenarioTitle(route), getScenarioCopy(route))}
      <div class="wizard-layout">
        <div class="form-panel">
          <div class="question-grid">
            ${renderScenarioQuestions(route)}
          </div>
          <div class="panel-actions" style="margin-top: 1rem;">
            <button class="secondary-button" type="button" data-action="open-documents">
              <span class="btn-icon" aria-hidden="true">${icons.upload}</span>
              Add documents first
            </button>
            <button class="primary-button" type="button" data-action="run-smart">
              ${isPossession ? "Build evidence readiness map" : "Save answers and update plan"}
              <span class="btn-icon" aria-hidden="true">${icons.arrow}</span>
            </button>
          </div>
        </div>
        <aside class="panel">
          <h2>${escapeHtml(state.property?.address || "Selected property")}</h2>
          <p>${escapeHtml(state.property?.localAuthority || "Local authority context will appear here.")}</p>
          <div class="notice ${isPossession ? "" : "safe"}" style="margin-top: 1rem;">
            <strong>${isPossession ? "Possession preparation" : "Scenario-aware Property Plan"}</strong>
            <span>${isPossession ? "CMP helps organise the evidence needed for advisor review. Guidance only, not legal advice." : "CMP asks only what changes requirement relevance, urgency or next action."}</span>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function getScenarioTitle(route) {
  if (route === "epc") return "Confirm the EPC context.";
  if (route === "gas") return "Confirm whether gas applies.";
  if (route === "damp") return "Describe the damp or mould issue.";
  if (route === "possession") return "Prepare evidence before advisor support.";
  return "Confirm the property scenario.";
}

function getScenarioCopy(route) {
  if (route === "possession") return "This route checks what evidence is already in your property file before you speak to an advisor.";
  if (route === "epc") return "CMP keeps this route focused on the EPC record, evidence and assessment booking options.";
  if (route === "gas") return "CMP asks one key question before offering proof upload or a Gas Safety booking.";
  if (route === "damp") return "CMP connects issue evidence, inspection support, repair history and monitoring.";
  return "These answers decide which requirements matter and which item should be fixed first.";
}

function renderScenarioQuestions(route) {
  if (route === "gas") {
    return `
      ${choiceGroup("Does the property have gas?", "gas", [
        ["yes", "Yes", "Gas Safety proof or booking will be needed."],
        ["no", "No", "Gas Safety can be marked not relevant for this route."],
        ["not-sure", "Not sure", "CMP will recommend advisor or service support."]
      ])}
    `;
  }

  if (route === "epc") {
    return `
      ${choiceGroup("What best describes the property?", "tenancy", [
        ["preparing-to-rent", "Preparing to rent", "CMP will prioritise proof and expiry."],
        ["currently-tenanted", "Currently tenanted", "CMP will add monitoring after proof."],
        ["vacant", "Vacant", "CMP will keep the EPC route short."]
      ])}
      ${choiceGroup("Do you already have an EPC document?", "docs", [
        ["some-documents", "Yes, I may have it", "Smart Document Scan can suggest a match."],
        ["missing-certificates", "No, I need help", "CMP will offer an EPC assessment booking."],
        ["unknown", "Not sure", "CMP can save it for review or suggest a call."]
      ])}
    `;
  }

  if (route === "damp") {
    return `
      ${choiceGroup("How serious is the issue?", "damp", [
        ["reported", "Reported issue", "CMP will collect evidence and repair history."],
        ["serious", "Serious or recurring", "CMP will recommend inspection and human support."],
        ["monitor", "Monitor only", "CMP will create a reminder and keep the file open."]
      ])}
      ${choiceGroup("Do you have photos or repair notes?", "docs", [
        ["some-documents", "Yes, I can upload", "Smart Document Scan can attach them to the issue file."],
        ["unknown", "Not sure", "CMP can save unclear evidence for review."],
        ["missing-certificates", "No", "CMP will offer inspection or follow-up support."]
      ])}
    `;
  }

  if (route === "possession") {
    return `
      ${choiceGroup("Why is the landlord considering possession?", "possessionReason", [
        ["rent-arrears", "Rent arrears", "CMP will ask for rent schedule and dates."],
        ["asb", "Anti-social behaviour", "CMP will prioritise communications and evidence timeline."],
        ["sale", "Property sale", "CMP will prepare property-file evidence for advisor review."],
        ["landlord-occupation", "Landlord/family occupation", "CMP will recommend advisor support early."]
      ])}
      ${choiceGroup("Has a notice already been served?", "noticeServed", [
        ["no", "No", "Advisor review recommended before next steps."],
        ["yes", "Yes", "CMP will ask for a copy and timeline."],
        ["not-sure", "Not sure", "CMP will save this as advisor-review needed."]
      ])}
      ${choiceGroup("Was a deposit taken?", "depositTaken", [
        ["yes", "Yes", "Deposit and prescribed information modules become relevant."],
        ["no", "No", "Deposit modules can be marked not relevant."],
        ["not-sure", "Not sure", "CMP will leave deposit evidence as unknown."]
      ])}
    `;
  }

  return `
    ${choiceGroup("What is the property stage?", "tenancy", [
      ["preparing-to-rent", "Preparing to rent", "CMP will focus on readiness before marketing."],
      ["currently-tenanted", "Currently tenanted", "CMP will include tenancy and monitoring evidence."],
      ["vacant", "Vacant", "CMP will prioritise certificates and service routes."],
      ["short-term", "Short-term or temporary let", "CMP will keep scenario uncertainty visible."]
    ])}
    ${choiceGroup("Could this be an HMO or need licensing?", "hmo", [
      ["not-sure", "Not sure", "Licensing/HMO review will be raised."],
      ["possible", "Possible HMO", "CMP will recommend licensing review and advisor support."],
      ["no", "No", "CMP will monitor rather than fix first."]
    ])}
    ${choiceGroup("Any damp, mould or serious repair issue?", "damp", [
      ["reported", "Yes, reported issue", "CMP will activate repairs and damp/mould evidence."],
      ["none", "No current issue", "CMP will keep repair records as supporting evidence."],
      ["serious", "Serious or recurring", "CMP will recommend inspection and support."]
    ])}
    ${choiceGroup("Do you already have property documents?", "docs", [
      ["some-documents", "Some documents", "Smart Document Scan can suggest matches."],
      ["missing-certificates", "Missing certificates", "Service routes will be easier to book."],
      ["unknown", "Unknown evidence position", "CMP will ask fewer questions and prioritise proof."]
    ])}
  `;
}

function choiceGroup(title, field, choices) {
  return `
    <fieldset class="field">
      <legend>${title}</legend>
      <div class="choice-grid">
        ${choices.map(([value, label, help]) => `
          <button class="selectable-card ${state.scenario[field] === value ? "is-selected" : ""}" type="button" data-action="set-scenario" data-field="${field}" data-value="${value}">
            <span>
              <strong>${label}</strong>
              <span>${help}</span>
            </span>
            ${state.scenario[field] === value ? `<span class="state-chip" data-tone="good">${icons.check} Selected</span>` : ""}
          </button>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function renderSmartCheck() {
  const route = routePacks[state.routeIntent || "az"];
  const modules = getVisibleModules();
  const checkLines = state.routeIntent === "possession"
    ? ["Address identity anchored", "Tenancy and deposit evidence mapped", "Repair and communication evidence checked", "Advisor review recommended"]
    : ["Address identity anchored", "EPC match ready to review", "Landlord proof separated from record matches", "Property Plan priorities ranked"];
  return `
    <section class="page">
      ${renderProgress("smart")}
      ${renderPageHead(`${route.short} Smart Check`, "CMP has built your Property Plan. Review the map before fixing the first item.")}
      <div class="wizard-layout">
        <div class="panel">
          <div class="scan-steps">
            ${checkLines.map((line) => `
              <div class="scan-step">
                <span class="state-icon" aria-hidden="true">${icons.check}</span>
                <strong>${line}</strong>
              </div>
            `).join("")}
          </div>
          <div class="notice info" style="margin-top: 1rem;">
            <strong>Ready to review.</strong>
            <span>CMP has organised the requirements from your answers and property file. Review before relying on this information.</span>
          </div>
          <div class="panel-actions" style="margin-top: 1rem;">
            <button class="secondary-button" type="button" data-action="open-documents">
              <span class="btn-icon" aria-hidden="true">${icons.upload}</span>
              Add documents
            </button>
            <button class="primary-button" type="button" data-action="review-map">
              Review ${state.routeIntent === "possession" ? "evidence readiness" : "A-Z Compliance Map"}
              <span class="btn-icon" aria-hidden="true">${icons.arrow}</span>
            </button>
          </div>
        </div>
        <aside class="panel">
          <h2>${modules.length} requirement${modules.length === 1 ? "" : "s"} ready to review</h2>
          <ul class="compact-list" style="margin-top: 1rem;">
            ${modules.slice(0, 6).map((module) => `
              <li>${icons.map}<span><strong>${module.name}</strong><br>${escapeHtml(displayStatus(module.status))}</span></li>
            `).join("")}
          </ul>
        </aside>
      </div>
    </section>
  `;
}

function renderWorkspace() {
  if (!state.property || !getVisibleModules().length) {
    return renderRoutes();
  }
  const route = state.routeIntent || "az";
  const fixFirst = getFixFirstModule();
  const selected = getModule(state.selectedModuleId) || fixFirst;
  const readiness = getReadiness();
  const counts = getCounts();
  return `
    <section class="page">
      ${renderProgress("workspace")}
      <div class="workspace-head">
        <div class="identity-stack">
          <h1 class="workspace-title">${getWorkspaceTitle(route)}</h1>
          <p class="address">${escapeHtml(state.property.address)}</p>
          <div class="identity-meta">
            <span class="source-label">${escapeHtml(state.property.localAuthority)}</span>
            <span class="source-label">${routePacks[route].label}</span>
            <span class="source-label">Postcode: ${escapeHtml(state.property.postcode)}</span>
          </div>
        </div>
        <div class="button-row">
          <button class="secondary-button" type="button" data-action="open-documents">${icons.upload} Add documents</button>
          <button class="secondary-button" type="button" data-action="open-ask">${icons.search} Ask CMP</button>
        </div>
      </div>

      ${state.lastOutcome ? `<div class="notice safe" style="margin-bottom: 1rem;"><strong>Property Plan updated.</strong><span>${escapeHtml(state.lastOutcome)}</span></div>` : ""}

      <div class="map-layout">
        <div>
          <div class="map-panel">
            <div class="map-toolbar">
              <div>
                <h2>${route === "possession" ? "Possession evidence readiness" : route === "az" ? "A-Z Compliance Map" : `${routePacks[route].short} Property Plan`}</h2>
                <p class="small-copy">${route === "az" ? "One clear status and one next action per requirement." : "This route stays focused unless the landlord expands to A-Z."}</p>
              </div>
              <span class="state-chip" data-tone="info">${readiness}% readiness</span>
            </div>
            <div class="module-list">
              ${getVisibleModules().map((module) => renderModuleRow(module, fixFirst?.id === module.id)).join("")}
            </div>
          </div>

          ${state.activeServiceModuleId ? renderBookingPanel(state.activeServiceModuleId) : ""}

          <div class="outcome-grid">
            <div class="outcome-card">
              <h3>Evidence</h3>
              <p>${state.evidence.length} evidence item${state.evidence.length === 1 ? "" : "s"} added; ${counts.evidenceGaps} requirement${counts.evidenceGaps === 1 ? "" : "s"} still need proof or answers.</p>
            </div>
            <div class="outcome-card">
              <h3>Services</h3>
              <p>${state.serviceDrafts.length} booking detail${state.serviceDrafts.length === 1 ? "" : "s"} ready. Services appear from gaps in the Property Plan.</p>
            </div>
            <div class="outcome-card">
              <h3>Monitoring</h3>
              <p>${counts.monitoring} reminder${counts.monitoring === 1 ? "" : "s"} created from evidence, services or Monitor later choices.</p>
            </div>
          </div>

          ${renderServiceBand(route)}
        </div>

        <aside class="side-stack">
          ${renderFixPanel(fixFirst)}
          ${selected ? renderModuleDetail(selected) : ""}
          ${route !== "az" ? `
            <div class="panel">
              <h2>Need the full view?</h2>
              <p>Expand this same property file into the A-Z Compliance Map without starting again.</p>
              <div class="panel-actions" style="margin-top: 0.8rem;">
                <button class="secondary-button" type="button" data-action="expand-az">Review full A-Z map</button>
              </div>
            </div>
          ` : ""}
        </aside>
      </div>
    </section>
  `;
}

function getWorkspaceTitle(route) {
  if (route === "possession") return "Possession preparation.";
  if (route === "epc") return "EPC check for this property.";
  if (route === "gas") return "Gas Safety check for this property.";
  if (route === "damp") return "Damp and mould support.";
  return "Property Plan from the A-Z Compliance Map.";
}

function renderModuleRow(module, isFixFirst) {
  const tone = toneFor(module.status);
  return `
    <article class="module-row ${isFixFirst ? "is-fix-first" : ""}">
      <div class="module-name">
        <span class="module-dot" data-tone="${tone}"></span>
        <span>
          <strong>${escapeHtml(module.name)}</strong>
          <span>${escapeHtml(module.area)}</span>
        </span>
      </div>
      <div class="module-cell">
        <span class="module-cell-label">Status</span>
        <span class="state-chip" data-tone="${tone}">${escapeHtml(displayStatus(module.status))}</span>
      </div>
      <div class="module-cell">
        <span class="module-cell-label">Evidence</span>
        <strong>${escapeHtml(module.evidence)}</strong>
      </div>
      <div class="module-cell">
        <span class="module-cell-label">Source</span>
        <span>${escapeHtml(displaySource(module.source))}</span>
      </div>
      <button class="module-action" type="button" data-action="open-module" data-module="${module.id}">
        ${escapeHtml(actionCopyFor(module))}
      </button>
    </article>
  `;
}

function displayStatus(status) {
  const labels = {
    [oldStatus.complete]: "Ready to review",
    [oldStatus.evidenceUploaded]: "Evidence added",
    [oldStatus.bookable]: "Service ready to book",
    [oldStatus.review]: "Advisor review recommended",
    [oldStatus.humanReview]: "Advisor review recommended",
    [oldStatus.serviceReady]: "Booking details ready",
    [oldStatus.callReady]: "Advisor review requested"
  };
  return labels[status] || status;
}

function displaySource(source) {
  const labels = {
    [oldSource.address]: "Address selected by landlord",
    [oldSource.epc]: "EPC match ready to review",
    [oldSource.upload]: "Document added by landlord"
  };
  return labels[source] || source;
}

function actionCopyFor(module) {
  if (module.action === "Book service" || module.status === oldStatus.bookable || module.status === "Service ready to book") return serviceButtonCopyFor(module);
  if (module.action === "Add proof") return "Add proof";
  if (module.action === "Answer question") return "Answer requirement";
  if (module.action === "Set reminder") return "Monitor later";
  if (module.action === "Speak to a human") return "Request advisor review";
  if (module.action === "View detail") return `Review ${module.name} requirement`;
  return module.action || "Review requirement";
}

function fixActionCopyFor(module) {
  if (module.status === "Needs proof") return "Review missing evidence";
  if (module.status === "Needs answer") return "Answer requirement";
  if (module.status === "Advisor review recommended" || module.status === oldStatus.humanReview || module.status === oldStatus.review) return "Request advisor review";
  if (module.status === "Needs service") return "Book now";
  return "Fix this first";
}

function serviceButtonCopyFor(module) {
  if (module.id === "epc") return "Book EPC assessment";
  if (module.id === "gasSafety") return "Book Gas Safety check";
  if (module.id === "eicr") return "Book EICR";
  if (module.id === "smokeCo") return "Arrange alarm check";
  if (module.id === "licensing") return "Request licensing review";
  if (module.id === "dampMould") return "Request damp and mould inspection";
  if (module.id === "inspections") return "Book property inspection";
  if (module.id === "noticeStatus" || module.id === "humanReview") return "Prepare evidence pack";
  if (module.serviceType?.includes("review") || module.serviceType?.includes("support")) return "Request advisor review";
  return "Book now";
}

function renderFixPanel(module) {
  if (!module) return "";
  const actionLabel = module.action === "Book service" || module.status === oldStatus.bookable || module.status === "Service ready to book" ? "Book now" : fixActionCopyFor(module);
  const opensService = actionLabel === "Book now";
  return `
    <section class="fix-panel" aria-label="Fix First">
      <span class="state-chip" data-tone="risk">${icons.warning} Fix First</span>
      <h2>${escapeHtml(module.name)}</h2>
      <p>${escapeHtml(module.description)}</p>
      <ul class="compact-list">
        <li>${icons.check}<span>The highest priority requirement is shown first so the next step is clear.</span></li>
        <li>${icons.check}<span>Evidence, booking and monitoring outcomes update this Property Plan.</span></li>
      </ul>
      <button class="primary-button" type="button" data-action="${opensService ? "open-service" : "resolve-fix"}" data-module="${module.id}">
        ${actionLabel}
        <span class="btn-icon" aria-hidden="true">${icons.arrow}</span>
      </button>
      <button class="secondary-button" type="button" data-action="request-human" data-module="${module.id}">
        ${icons.phone} Speak to a CMP advisor
      </button>
    </section>
  `;
}

function renderModuleDetail(module) {
  const serviceAllowed = Boolean(module.serviceType);
  const whatIfPrompt = state.routeIntent === "possession"
    ? "What happens next if this evidence is missing?"
    : `What would happen if I cannot find the ${module.name} proof?`;
  return `
    <section class="module-detail" aria-label="Module detail">
      <div class="module-head">
        <div>
          <h2>${escapeHtml(module.name)}</h2>
          <p>${escapeHtml(module.description)}</p>
        </div>
        <span class="state-chip" data-tone="${toneFor(module.status)}">${escapeHtml(displayStatus(module.status))}</span>
      </div>
      <div class="detail-actions">
        <button class="detail-action" type="button" data-action="simulate-evidence" data-module="${module.id}">
          <span><strong>Add proof</strong><span>Document added for review and linked to this requirement.</span></span>
          ${icons.upload}
        </button>
        ${serviceAllowed ? `
          <button class="detail-action" type="button" data-action="open-service" data-module="${module.id}">
            <span><strong>${module.serviceType.includes("review") || module.serviceType.includes("support") ? "Request advisor review" : serviceButtonCopyFor(module)}</strong><span>${escapeHtml(module.serviceType)} linked to this gap.</span></span>
            ${icons.service}
          </button>
        ` : ""}
        <button class="detail-action" type="button" data-action="answer-module" data-module="${module.id}">
          <span><strong>Save answer</strong><span>Record what the landlord says and keep proof as the next option.</span></span>
          ${icons.check}
        </button>
        <button class="detail-action" type="button" data-action="monitor-later" data-module="${module.id}">
          <span><strong>Monitor later</strong><span>Keep this in the Property Plan without treating it as complete.</span></span>
          ${icons.map}
        </button>
        <button class="detail-action" type="button" data-action="what-if" data-value="${escapeHtml(whatIfPrompt)}">
          <span><strong>What would happen if...</strong><span>Get cautious context without legal advice or guarantees.</span></span>
          ${icons.search}
        </button>
        <button class="detail-action" type="button" data-action="request-human" data-module="${module.id}">
          <span><strong>Speak to a CMP advisor</strong><span>Useful when evidence is unclear or the route is high risk.</span></span>
          ${icons.phone}
        </button>
        <button class="detail-action" type="button" data-action="mark-not-relevant" data-module="${module.id}">
          <span><strong>Mark not relevant</strong><span>Use only when the landlord confirms this module does not apply.</span></span>
          ${icons.check}
        </button>
      </div>
      <div class="notice info">
        <strong>Review before relying on this information.</strong>
        <span>Guidance only, not legal advice. CMP helps organise the evidence needed for review.</span>
      </div>
    </section>
  `;
}

function renderBookingPanel(moduleId) {
  const module = getModule(moduleId);
  if (!module) return "";
  const serviceName = module.serviceType || "CMP advisor support";
  return `
    <section class="booking-panel" aria-label="Service booking panel">
      <div class="service-head">
        <div>
          <h2>${escapeHtml(serviceName)}</h2>
          <p>Booking details for ${escapeHtml(module.name)} at ${escapeHtml(state.property.address)}.</p>
        </div>
        <span class="state-chip" data-tone="info">Service ready to book</span>
      </div>
      <form class="field-grid" data-form="booking" data-module="${module.id}">
        <div class="split-form">
          <div class="field">
            <label for="urgency-${module.id}">Urgency</label>
            <select id="urgency-${module.id}" name="urgency">
              <option>Soon</option>
              <option>This week</option>
              <option>Flexible</option>
              <option>Advisor review first</option>
            </select>
          </div>
          <div class="field">
            <label for="preference-${module.id}">Contact preference</label>
            <select id="preference-${module.id}" name="preference">
              <option>Phone</option>
              <option>Email</option>
              <option>Text message</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="contractor-${module.id}">Do you already have a contractor?</label>
          <select id="contractor-${module.id}" name="contractor">
            <option>No contractor selected</option>
            <option>I have someone in mind</option>
            <option>I want CMP help deciding</option>
          </select>
        </div>
        <div class="notice">
          <strong>Booking details ready</strong>
          <span>${escapeHtml(serviceOutcomeFor(module))}</span>
          <span>No supplier has been contacted yet. No payment has been taken.</span>
          <span>A CMP advisor can review this before it is sent.</span>
        </div>
        <div class="panel-actions">
          <button class="primary-button" type="submit">Save booking details</button>
          <button class="secondary-button" type="button" data-action="open-module" data-module="${module.id}">Review requirement</button>
        </div>
      </form>
    </section>
  `;
}

function serviceOutcomeFor(module) {
  if (module.id === "epc") return "This service should help produce the EPC evidence needed for your property file.";
  if (module.id === "gasSafety") return "This service should help produce the Gas Safety evidence needed for your property file.";
  if (module.id === "eicr") return "This service should help produce the electrical safety evidence needed for your property file.";
  if (module.id === "dampMould") return "This service should help produce inspection notes and photos for your property file.";
  if (module.id === "licensing") return "A CMP advisor can help review whether licensing or HMO evidence is needed.";
  if (module.id === "humanReview" || module.id === "noticeStatus") return "A CMP advisor can help check what evidence should be prepared before the next step.";
  return "This service should help produce the evidence needed for your property file.";
}

function renderServiceBand(route) {
  const modules = getVisibleModules().filter(isServiceVisible).slice(0, 3);
  if (!modules.length) return "";
  return `
    <section style="margin-top: 1rem;">
      <div class="map-toolbar">
        <div>
          <h2>Services ready to book</h2>
          <p class="small-copy">Services appear because a requirement needs evidence, inspection or advisor review.</p>
        </div>
      </div>
      <div class="services-grid">
        ${modules.map((module) => `
          <article class="service-card">
            <span class="service-icon" aria-hidden="true">${icons.service}</span>
            <h3>${escapeHtml(module.serviceType)}</h3>
            <p>Linked to ${escapeHtml(module.name)} for this property.</p>
            <button class="secondary-button" type="button" data-action="open-service" data-module="${module.id}">${escapeHtml(serviceButtonCopyFor(module))}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function isServiceVisible(module) {
  return Boolean(module.serviceType)
    && ["Service ready to book", oldStatus.bookable, "Needs service", "Needs proof", oldStatus.review, "Advisor review recommended", oldStatus.humanReview].includes(module.status);
}

function renderServices() {
  return `
    <section class="page">
      ${renderPageHead("Book services linked to property gaps.", "Find the missing evidence, book the right service and keep the proof with your Property Plan.")}
      <div class="services-grid">
        ${Object.entries(directServices).map(([id, service]) => `
          <article class="service-card">
            <span class="service-icon" aria-hidden="true">${icons.service}</span>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.outcome)}</p>
            <button class="primary-button" type="button" data-action="start-route" data-route="${service.route}">
              ${service.title}
            </button>
          </article>
        `).join("")}
      </div>
      <div class="panel" style="margin-top: 1rem;">
        <div class="panel-head">
          <div>
            <h2>Review and advisor routes</h2>
            <p>These routes prepare the property file or connect the landlord to advisor support.</p>
          </div>
          <button class="secondary-button" type="button" data-action="request-human">${icons.phone} Speak to a CMP advisor</button>
        </div>
        <div class="mini-map" style="margin-top: 1rem;">
          ${reviewServices.map((service) => `
            <div class="mini-row">
              <span>${escapeHtml(service)}</span>
              <span class="state-chip" data-tone="info">Review route</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderProperties() {
  const counts = getCounts();
  return `
    <section class="page">
      ${renderPageHead("My Properties", "Each property appears once with Fix first, evidence gaps, services ready to book and monitoring reminders together.")}
      ${state.property ? `
        <div class="properties-grid">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h2>${escapeHtml(state.property.address)}</h2>
                <p>${escapeHtml(state.property.localAuthority)} - ${routePacks[state.routeIntent || "az"].label}</p>
              </div>
              <span class="state-chip" data-tone="info">${getReadiness()}% readiness</span>
            </div>
            <div class="readiness-card" style="margin-bottom: 0;">
              <div class="readiness-ring">${getReadiness()}%</div>
              <div>
                <h3>${escapeHtml(getFixFirstModule()?.name || "No Fix First item")}</h3>
                <p>${escapeHtml(getFixFirstModule()?.description || "Open the Property Plan to review the next step.")}</p>
              </div>
            </div>
            <div class="outcome-grid">
              <div class="outcome-card"><h3>Evidence gaps</h3><p>${counts.evidenceGaps}</p></div>
              <div class="outcome-card"><h3>Services ready to book</h3><p>${counts.servicesReady}</p></div>
              <div class="outcome-card"><h3>Monitoring reminders</h3><p>${counts.monitoring}</p></div>
            </div>
            <div class="panel-actions" style="margin-top: 1rem;">
              <button class="primary-button" type="button" data-action="open-workspace">Open Property Plan</button>
              <button class="secondary-button" type="button" data-action="route-home">Review supporting next steps</button>
            </div>
          </article>
        </div>
      ` : `
        <div class="panel">
          <h2>No property file yet</h2>
          <p>Start with the A-Z Compliance Map or choose a specific service route.</p>
          <div class="panel-actions" style="margin-top: 1rem;">
            <button class="primary-button" type="button" data-action="start-az">Check a property</button>
          </div>
        </div>
      `}
    </section>
  `;
}

function renderProgress(current) {
  const route = state.routeIntent || "az";
  const steps = [
    ["route", routePacks[route].short],
    ["address", "Address"],
    ["scenario", "Scenario"],
    ["smart", "Smart Check"],
    ["workspace", route === "possession" ? "Readiness map" : "Compliance Map"]
  ];
  return `
    <div class="progress-rail" aria-label="Current route progress">
      ${steps.map(([id, label]) => `<span class="progress-step ${id === current ? "is-current" : ""}">${escapeHtml(label)}</span>`).join("")}
    </div>
  `;
}

function renderPageHead(title, copy) {
  return `
    <div class="page-head">
      <h1>${title}</h1>
      <p>${copy}</p>
    </div>
  `;
}

function renderDrawers() {
  docDrawerBody.innerHTML = renderDocumentDrawer();
  askDrawerBody.innerHTML = renderAskDrawer();
}

function renderDocumentDrawer() {
  if (!state.property) {
    return `
      <div class="notice info">
        <strong>Select an address first.</strong>
        <span>Smart Document Scan attaches documents to the active Property Plan.</span>
      </div>
    `;
  }

  if (state.scan.phase === "scanning") {
    return `
      <div class="scan-steps">
        <div class="scan-step"><span class="spinner" aria-hidden="true"></span><strong>Smart Document Scan running</strong></div>
        <p class="small-copy">CMP is looking for a likely document type and useful dates.</p>
      </div>
    `;
  }

  if (state.scan.phase === "result") {
    const module = getModule(state.scan.suggestedModuleId);
    const unknown = state.scan.suggestedModuleId === "unknown" || !module;
    return `
      <div class="scan-result">
        <div class="notice ${unknown ? "" : "safe"}">
          <strong>${unknown ? "Ready for landlord confirmation." : "Suggested match"}</strong>
          <span>${unknown ? "Save it for review or speak to a human if you are unsure." : `Suggested document type: ${escapeHtml(module.name)}.`}</span>
          <span>Confirm before CMP updates your Property Plan.</span>
        </div>
        <div class="extracted-grid">
          ${[
            ["Property address", state.property.address],
            ["Document date", "12 Jun 2026"],
            ["Expiry/review date", unknown ? "Not found" : module?.monitoringDate || "Review date needed"],
            ["Contractor/company", unknown ? "Not found" : "Northside Property Services"],
            ["Reference number", unknown ? "Not found" : "CMP-2048"],
            ["Issue type", unknown ? "Unknown document" : module.name]
          ].map(([label, value]) => `
            <div class="extracted-field">
              <strong>${escapeHtml(label)}</strong>
              <span>${escapeHtml(value)}</span>
            </div>
          `).join("")}
        </div>
        <div class="notice info">
          <strong>Review before relying on this information.</strong>
          <span>Evidence appears to match this requirement. Please confirm.</span>
        </div>
        <div class="panel-actions">
          ${unknown ? "" : `<button class="primary-button" type="button" data-action="confirm-scan">Confirm and update Property Plan</button>`}
          <button class="secondary-button" type="button" data-action="save-scan-review">Save for review</button>
          <button class="secondary-button" type="button" data-action="request-human">${icons.phone} Speak to a human</button>
        </div>
      </div>
    `;
  }

  if (state.scan.phase === "saved") {
    return `
      <div class="notice info">
        <strong>Document added for review.</strong>
        <span>CMP has not updated the Property Plan until the landlord confirms what the document is.</span>
      </div>
      <div class="panel-actions" style="margin-top: 1rem;">
        <button class="primary-button" type="button" data-action="simulate-scan">Scan another document</button>
        <button class="secondary-button" type="button" data-action="request-human">Ask a human to review</button>
      </div>
    `;
  }

  return `
    <div class="scan-zone">
      <span class="state-icon" aria-hidden="true">${icons.upload}</span>
      <div>
        <strong>Drop property documents here</strong>
        <p class="small-copy">CMP will suggest what each document relates to. Confirm before CMP updates your Property Plan.</p>
      </div>
      <label class="primary-button" for="documentFile">Select file</label>
      <input id="documentFile" type="file">
      <button class="secondary-button" type="button" data-action="simulate-scan">Run Smart Document Scan</button>
    </div>
    <div class="prompt-grid">
      <button type="button" data-action="scan-unknown">Not sure what this is?</button>
      <button type="button" data-action="request-human">Speak to a human</button>
      <button type="button" data-action="save-scan-review">Save for review</button>
    </div>
  `;
}

function simulateScan(fileName = "") {
  const preferred = state.selectedModuleId && state.modules[state.selectedModuleId]
    ? state.selectedModuleId
    : state.routeIntent === "epc"
      ? "epc"
      : state.routeIntent === "damp"
        ? "dampMould"
        : "gasSafety";
  state.scan = {
    ...state.scan,
    phase: "scanning",
    suggestedModuleId: preferred,
    fileName
  };
  saveState();
  renderDrawers();
  openDrawer(docDrawer);
  setTimeout(() => {
    state.scan.phase = "result";
    saveState();
    renderDrawers();
  }, 850);
}

function confirmScan() {
  const moduleId = state.scan.suggestedModuleId;
  const module = getModule(moduleId);
  if (!module) return;
  state.scan.phase = "idle";
  confirmEvidence(moduleId);
  openDrawer(docDrawer);
}

function renderAskDrawer() {
  const module = getModule(state.selectedModuleId) || getFixFirstModule();
  const intro = module
    ? `Ask about ${module.name}, the current ${displayStatus(module.status).toLowerCase()} item, or the next property action.`
    : "Ask about this property.";
  const prompts = [
    "What should I fix first?",
    "Can I rent this property yet?",
    "What evidence do I need?",
    "Which services can I book?",
    "What happens if I do nothing?",
    "Should I speak to a human?"
  ];
  return `
    <p class="small-copy">${escapeHtml(intro)}</p>
    <div class="prompt-grid">
      ${prompts.map((prompt) => `<button type="button" data-action="ask-prompt" data-value="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
    </div>
    <div class="ask-log">
      ${state.askLog.length ? state.askLog.map((item) => `
        <div class="ask-message user">${escapeHtml(item.question)}</div>
        <div class="ask-message cmp">${escapeHtml(item.answer)}</div>
      `).join("") : `
        <div class="ask-message cmp">CMP can suggest next steps from your property file. Guidance only, not legal advice.</div>
      `}
    </div>
    <form data-form="ask" class="field-grid">
      <div class="field">
        <label for="askInput">Type a question</label>
        <textarea id="askInput"></textarea>
      </div>
      <button class="primary-button" type="submit">Ask CMP</button>
    </form>
  `;
}

function submitAsk(question) {
  const answer = answerFor(question);
  state.askLog = [...state.askLog.slice(-4), { question, answer }];
  saveState();
  renderDrawers();
}

function answerFor(question) {
  const lower = question.toLowerCase();
  const fix = getFixFirstModule();
  const selected = getModule(state.selectedModuleId) || fix;

  if (lower.includes("fix first")) {
    return fix
      ? `Fix ${fix.name} first because it has the highest current urgency in this route. You can add proof, book a service, set monitoring or ask a CMP advisor.`
      : "There is no Fix First item yet. Start a property check so CMP can build a map.";
  }

  if (lower.includes("rent this property")) {
    return "CMP can show missing evidence and service routes, but it does not make a legal decision. Fix the first item, review the remaining evidence gaps and speak to an advisor if anything is unclear.";
  }

  if (lower.includes("proof") || lower.includes("evidence")) {
    return selected
      ? `${selected.name} currently shows: ${selected.evidence}. Add a document, confirm what you hold, or book a relevant service if the evidence is missing.`
      : "Evidence attaches to requirements after a property has been selected.";
  }

  if (lower.includes("services") || lower.includes("book")) {
    return "Available service routes include EPC assessment, Gas Safety, EICR, property inspection and damp or mould inspection. Review and possession routes lead to advisor support rather than automatic booking.";
  }

  if (lower.includes("hmo")) {
    return "If HMO or licensing is uncertain, CMP recommends a licensing review or advisor support. CMP records the uncertainty and prepares the property file; it does not decide the legal licensing position.";
  }

  if (lower.includes("tenant") || lower.includes("leave") || lower.includes("possession")) {
    return "For possession preparation, CMP helps organise tenancy, deposit, notice, arrears, repair and communication evidence before advisor support. It does not generate notices or give legal advice.";
  }

  if (lower.includes("human") || lower.includes("advisor")) {
    return "Speak to a human if the evidence is unclear, the route is high risk, or you are preparing for possession. A CMP advisor can help check the next step.";
  }

  if (lower.includes("nothing") || lower.includes("ignore") || lower.includes("happen")) {
    return selected
      ? `If ${selected.name} remains unresolved, CMP keeps it visible as a gap or monitoring item. Consequences depend on the property and should be discussed with an advisor where the issue is high risk.`
      : "CMP can explain likely trade-offs after a Compliance Map exists. Start with an address and route first.";
  }

  return "CMP would keep the answer tied to this property file: confirm the record, add proof, book a relevant service, set monitoring or speak to a CMP advisor if the position is unclear.";
}

function openDrawer(drawer) {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer(drawer) {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function toneFor(status) {
  return stateTones[status] || "info";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3600);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
