const STORAGE_KEY = "cmpRadarPrototypeV1";

const sampleProperty = {
  id: "cedar-lane",
  address: "9 Cedar Lane, Nottingham, NG7 2AB",
  type: "Two-bed terrace",
};

const statusRank = {
  Clear: 0,
  "Not relevant": 0,
  Watch: 1,
  "Due soon": 2,
  Missing: 3,
  "Human review recommended": 4,
  "High risk": 5,
};

const statusClass = {
  Clear: "status-clear",
  Watch: "status-watch",
  "Due soon": "status-due",
  Missing: "status-missing",
  "High risk": "status-high",
  "Human review recommended": "status-human",
  "Not relevant": "status-na",
};

const categories = [
  {
    id: "certificates",
    label: "Certificates",
    position: "sector-top",
    summary: "EPC, Gas Safety, EICR, smoke alarm evidence and CO alarm evidence.",
  },
  {
    id: "tenancy",
    label: "Tenancy",
    position: "sector-upper-right",
    summary: "Agreement, deposit protection, prescribed information, How to Rent guide and tenant communications.",
  },
  {
    id: "licensing",
    label: "Licensing",
    position: "sector-lower-right",
    summary: "HMO uncertainty, selective or additional licensing, local authority context and property use concerns.",
  },
  {
    id: "condition",
    label: "Condition",
    position: "sector-bottom",
    summary: "Damp/mould, repairs, inspections, contractor evidence and complaint history.",
  },
  {
    id: "possession",
    label: "Possession",
    position: "sector-lower-left",
    summary: "Arrears record, notice status, tenancy evidence, deposit evidence, certificate evidence and advisor review status.",
  },
  {
    id: "deadlines",
    label: "Deadlines",
    position: "sector-upper-left",
    summary: "Certificate expiry, service follow-up, inspection dates, monitoring reminders and unresolved risk age.",
  },
];

const routeCards = [
  {
    id: "scan",
    label: "Scan property risk",
    text: "Answer a short set of risk-relevant questions and open a live risk radar.",
    icon: "scan",
  },
  {
    id: "deadlines",
    label: "Check renewal deadlines",
    text: "See certificate, service and review dates in deadline order.",
    icon: "clock",
  },
  {
    id: "possession",
    label: "Preview possession risk",
    text: "Check evidence readiness before speaking to an advisor.",
    icon: "folder",
  },
  {
    id: "evidence",
    label: "Upload evidence to reduce risk",
    text: "Add proof, confirm the match and update the risk picture.",
    icon: "proof",
  },
  {
    id: "example",
    label: "Open example risk radar",
    text: "Open a reviewer-safe sample property with realistic records and deadlines.",
    icon: "radar",
  },
];

const questionSet = [
  { id: "gas", label: "Can you find the latest Gas Safety proof?", yes: "Proof found", no: "Cannot find it" },
  { id: "eicr", label: "Is the EICR renewal date known?", yes: "Date known", no: "Date unclear" },
  { id: "deposit", label: "Is deposit evidence saved?", yes: "Saved", no: "Missing" },
  { id: "repair", label: "Are recent repair or damp/mould complaints saved?", yes: "Saved", no: "Not saved" },
  { id: "licensing", label: "Are you sure the licensing position is understood?", yes: "Understood", no: "Unsure" },
  { id: "advisor", label: "Would you like advisor review if a high risk remains?", yes: "Yes", no: "Not now" },
];

const possessionQuestions = [
  "Why are you considering possession?",
  "Is the tenant still in the property?",
  "Are there rent arrears?",
  "Are there repair or damp/mould complaints?",
  "Has any notice already been served?",
  "Is the tenancy agreement available?",
  "Is deposit evidence available?",
  "Is EPC evidence available?",
  "Is Gas Safety evidence available?",
  "Is How to Rent evidence available where relevant?",
  "Are tenant communications saved?",
  "Do you want a CMP advisor to review this?",
];

const scenarioPrompts = [
  "What if I cannot find this certificate?",
  "What if I rent the property without this proof?",
  "What if I delay this service?",
  "What if the tenant raises a repair complaint?",
  "What if the property needs possession advice?",
  "What if I mark this as monitor later?",
];

const askPrompts = [
  "What is the biggest risk?",
  "What happens if I ignore this?",
  "What service would reduce this risk?",
  "Should I speak to an advisor?",
  "What proof do I need?",
  "What deadline matters next?",
];

function defaultRiskItems() {
  return [
    {
      id: "gas-proof",
      category: "certificates",
      title: "Gas Safety proof is missing",
      status: "Missing",
      action: "Add proof",
      due: "14 Jul 2026",
      why: "The file has a certificate deadline but no saved proof attached to the property record.",
      consequence:
        "This may make the property file weaker if you need to explain the record later. You may want to add proof or set a reminder before relying on this record.",
      next: "Add proof to reduce risk, or book a Gas Safety check if the document cannot be found.",
      service: "Book Gas Safety check to reduce certificate risk.",
    },
    {
      id: "epc-watch",
      category: "certificates",
      title: "EPC record needs a date check",
      status: "Watch",
      action: "Set reminder",
      due: "29 Sep 2026",
      why: "The EPC appears in the file, but the renewal date has not been confirmed in Radar.",
      consequence: "This may create avoidable uncertainty when the property file is reviewed.",
      next: "Confirm the EPC date and set a renewal reminder.",
      service: "Book EPC assessment to reduce energy record risk.",
    },
    {
      id: "eicr-due",
      category: "certificates",
      title: "EICR service window is due soon",
      status: "Due soon",
      action: "Book service",
      due: "04 Aug 2026",
      why: "The electrical safety record has a near-term renewal window.",
      consequence: "Booking late may leave less time to gather the evidence needed for the property file.",
      next: "Book EICR and attach the completed certificate when available.",
      service: "Book EICR to reduce electrical safety risk.",
    },
    {
      id: "smoke-proof",
      category: "certificates",
      title: "Smoke alarm evidence is not saved",
      status: "Missing",
      action: "Add proof",
      due: "18 Jul 2026",
      why: "The file does not show a recent alarm test note, image or inspection record.",
      consequence: "This may make the property file weaker if a condition question is raised.",
      next: "Add proof from an inspection or book an inspection visit.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "co-evidence",
      category: "certificates",
      title: "CO alarm evidence needs review",
      status: "Watch",
      action: "View risk",
      due: "18 Jul 2026",
      why: "The property has a partial alarm note but no clear supporting image.",
      consequence: "The record may be harder to rely on without clear supporting proof.",
      next: "Add an inspection image or mark the item not relevant if it does not apply.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "tenancy-agreement",
      category: "tenancy",
      title: "Tenancy agreement saved",
      status: "Clear",
      action: "View risk",
      due: "Saved",
      why: "The agreement is attached to the sample property.",
      consequence: "Keep the record available for advisor review if the situation changes.",
      next: "Monitor only.",
      service: "Prepare advisor review if needed.",
    },
    {
      id: "deposit-protection",
      category: "tenancy",
      title: "Deposit protection evidence needs a second proof",
      status: "Watch",
      action: "Add proof",
      due: "21 Jul 2026",
      why: "The record is noted but supporting evidence is incomplete.",
      consequence: "This may make the property file weaker if the deposit record is questioned.",
      next: "Add scheme proof or prepare the evidence pack for advisor review.",
      service: "Prepare possession evidence review.",
    },
    {
      id: "prescribed-info",
      category: "tenancy",
      title: "Prescribed information proof is missing",
      status: "Missing",
      action: "Add proof",
      due: "21 Jul 2026",
      why: "Radar cannot see the proof attached to the property file.",
      consequence: "This may create process risk if the file needs to support a later decision.",
      next: "Add proof or ask an advisor what evidence to prepare.",
      service: "Prepare advisor review.",
    },
    {
      id: "how-to-rent",
      category: "tenancy",
      title: "How to Rent guide evidence needs confirmation",
      status: "Watch",
      action: "Add proof",
      due: "21 Jul 2026",
      why: "The sample file has a note but no dated evidence entry.",
      consequence: "A dated record may make the property file easier to review.",
      next: "Add dated proof where relevant.",
      service: "Prepare advisor review.",
    },
    {
      id: "tenant-comms",
      category: "tenancy",
      title: "Tenant communications are saved",
      status: "Clear",
      action: "View risk",
      due: "Saved",
      why: "Recent messages are saved against the property record.",
      consequence: "Keep monitoring if new repair or arrears messages arrive.",
      next: "Monitor only.",
      service: "Ask advisor if the situation changes.",
    },
    {
      id: "hmo-uncertainty",
      category: "licensing",
      title: "HMO uncertainty needs a check",
      status: "Watch",
      action: "Ask advisor",
      due: "24 Jul 2026",
      why: "Property use notes are incomplete, so Radar cannot rule the issue out from the file.",
      consequence: "Unclear property use can make planning the next step harder.",
      next: "Request licensing/HMO review.",
      service: "Request licensing/HMO review.",
    },
    {
      id: "selective-licensing",
      category: "licensing",
      title: "Selective or additional licensing context needs review",
      status: "Human review recommended",
      action: "Ask advisor",
      due: "24 Jul 2026",
      why: "The local authority context is not fully recorded for this sample.",
      consequence: "A CMP advisor can help review the next step before you rely on the record.",
      next: "Prepare advisor review with property use notes.",
      service: "Request licensing/HMO review.",
    },
    {
      id: "local-context",
      category: "licensing",
      title: "Local authority context is incomplete",
      status: "Watch",
      action: "Set reminder",
      due: "31 Jul 2026",
      why: "The file has the address but not the local check note.",
      consequence: "Missing context can slow down a later decision.",
      next: "Set a reminder to add the local context note.",
      service: "Ask advisor.",
    },
    {
      id: "property-use",
      category: "licensing",
      title: "Property use concern not currently relevant",
      status: "Not relevant",
      action: "Mark not relevant",
      due: "None",
      why: "The current sample notes do not show a property use concern.",
      consequence: "Keep this marked only while the use remains unchanged.",
      next: "Monitor if household or use changes.",
      service: "Ask advisor if use changes.",
    },
    {
      id: "damp-watch",
      category: "condition",
      title: "Damp/mould note needs monitoring",
      status: "Watch",
      action: "Book service",
      due: "31 Aug 2026",
      why: "There is a monitor-later note but no follow-up inspection date.",
      consequence:
        "If the tenant raises a repair complaint, missing inspection evidence may make the property file weaker.",
      next: "Book inspection and save the contractor evidence.",
      service: "Request damp/mould inspection.",
    },
    {
      id: "repairs",
      category: "condition",
      title: "Repairs log needs a follow-up",
      status: "Watch",
      action: "Set reminder",
      due: "12 Aug 2026",
      why: "A repair note exists but the follow-up outcome is not saved.",
      consequence: "The record may be harder to explain if the issue comes back.",
      next: "Set reminder and add contractor evidence.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "inspection-date",
      category: "condition",
      title: "Inspection date is due soon",
      status: "Due soon",
      action: "Book service",
      due: "02 Aug 2026",
      why: "The last inspection is near the review point.",
      consequence: "Delaying may reduce time to gather evidence if a condition issue appears.",
      next: "Book inspection and attach images or notes.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "contractor-evidence",
      category: "condition",
      title: "Contractor evidence is missing",
      status: "Missing",
      action: "Add proof",
      due: "12 Aug 2026",
      why: "The repair note names a job but does not include contractor proof.",
      consequence: "This may make the repair record weaker.",
      next: "Add invoice, image or work note.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "complaint-history",
      category: "condition",
      title: "Complaint history needs a review",
      status: "Watch",
      action: "View risk",
      due: "18 Aug 2026",
      why: "Radar sees a condition note but no closed review note.",
      consequence: "A review note may make the file easier to understand.",
      next: "Review the complaint history and add the outcome.",
      service: "Ask advisor.",
    },
    {
      id: "arrears-record",
      category: "possession",
      title: "Arrears record needs a current export",
      status: "Watch",
      action: "Prepare evidence pack",
      due: "17 Jul 2026",
      why: "The sample has arrears notes but no current export in the evidence pack.",
      consequence: "This may slow an advisor review if possession advice is needed.",
      next: "Prepare evidence pack with arrears history and communications.",
      service: "Prepare possession evidence review.",
    },
    {
      id: "notice-status",
      category: "possession",
      title: "Notice status not currently relevant",
      status: "Not relevant",
      action: "Mark not relevant",
      due: "None",
      why: "No served notice is recorded in this sample route.",
      consequence: "Keep this updated if the position changes.",
      next: "Ask advisor before taking process steps.",
      service: "Book advisor call.",
    },
    {
      id: "tenancy-evidence",
      category: "possession",
      title: "Tenancy evidence is available",
      status: "Clear",
      action: "View risk",
      due: "Saved",
      why: "The tenancy agreement is attached.",
      consequence: "Keep it in the evidence pack if advisor review is requested.",
      next: "Monitor only.",
      service: "Prepare advisor review.",
    },
    {
      id: "deposit-evidence",
      category: "possession",
      title: "Deposit evidence needs a proof check",
      status: "Watch",
      action: "Add proof",
      due: "21 Jul 2026",
      why: "Deposit proof is not complete enough for a clean advisor pack.",
      consequence: "A CMP advisor can help review the next step.",
      next: "Add proof or prepare advisor review.",
      service: "Prepare possession evidence review.",
    },
    {
      id: "certificate-evidence",
      category: "possession",
      title: "Certificate evidence is incomplete for advisor review",
      status: "Missing",
      action: "Prepare evidence pack",
      due: "17 Jul 2026",
      why: "Gas Safety and alarm evidence are not fully attached.",
      consequence: "This may slow down an advisor review.",
      next: "Prepare evidence pack and add missing certificate proof.",
      service: "Prepare possession evidence review.",
    },
    {
      id: "repair-complaints-possession",
      category: "possession",
      title: "Repair complaint history needs context",
      status: "Watch",
      action: "Prepare evidence pack",
      due: "17 Jul 2026",
      why: "Condition notes should be organised before an advisor conversation.",
      consequence: "Unclear repair context may make the property file weaker.",
      next: "Add inspection and repair outcome notes.",
      service: "Prepare possession evidence review.",
    },
    {
      id: "advisor-review",
      category: "possession",
      title: "Advisor review is recommended",
      status: "Human review recommended",
      action: "Ask advisor",
      due: "22 Jul 2026",
      why: "The sample has possession-related evidence gaps and condition notes.",
      consequence: "A CMP advisor can help review the next step.",
      next: "Prepare advisor review with the evidence pack.",
      service: "Book advisor call.",
    },
    {
      id: "certificate-expiry",
      category: "deadlines",
      title: "Certificate expiry is the next deadline",
      status: "Due soon",
      action: "Set reminder",
      due: "14 Jul 2026",
      why: "The next dated item is the Gas Safety proof check.",
      consequence: "You may want to add proof or set a reminder before relying on this record.",
      next: "Set reminder for the deadline and attach proof.",
      service: "Book Gas Safety check to reduce certificate risk.",
    },
    {
      id: "service-follow-up",
      category: "deadlines",
      title: "Service follow-up not booked",
      status: "Watch",
      action: "Book service",
      due: "18 Jul 2026",
      why: "There is no booked follow-up for the missing proof.",
      consequence: "Delaying the service may reduce time to gather evidence.",
      next: "Prepare booking details. No provider has been contacted. No charge has been made.",
      service: "Book service.",
    },
    {
      id: "inspection-dates",
      category: "deadlines",
      title: "Inspection date is approaching",
      status: "Due soon",
      action: "Book service",
      due: "02 Aug 2026",
      why: "Condition review is approaching and has no confirmed visit.",
      consequence: "A later inspection may leave less time to gather condition evidence.",
      next: "Book inspection.",
      service: "Book inspection to reduce condition risk.",
    },
    {
      id: "monitoring-reminders",
      category: "deadlines",
      title: "Monitoring reminders need dates",
      status: "Watch",
      action: "Set reminder",
      due: "31 Aug 2026",
      why: "Monitor-later items need clear follow-up dates.",
      consequence: "A monitor note without a reminder can drift.",
      next: "Set reminder.",
      service: "Ask advisor if the monitor item escalates.",
    },
    {
      id: "unresolved-risk-age",
      category: "deadlines",
      title: "Unresolved risk age is rising",
      status: "High risk",
      action: "View risk",
      due: "Now",
      why: "Several watch items have been open without a dated reduction action.",
      consequence: "Older unresolved risk can make the property file harder to act on.",
      next: "Pick one risk reducer today: add proof, book service or ask advisor.",
      service: "Book advisor call.",
    },
  ];
}

function buildInitialState() {
  return {
    view: "home",
    selectedRoute: null,
    activeCategory: "certificates",
    properties: [sampleProperty],
    propertyId: sampleProperty.id,
    riskItems: defaultRiskItems(),
    answers: {},
    possessionAnswers: {},
    evidenceDraft: "Gas Safety certificate photo",
    evidenceAdded: false,
    advisorMode: "risk",
    askOpen: false,
    askAnswer: "",
    lastAction: "",
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw);
    return {
      ...buildInitialState(),
      ...parsed,
      properties: parsed.properties?.length ? parsed.properties : [sampleProperty],
      riskItems: parsed.riskItems?.length ? parsed.riskItems : defaultRiskItems(),
    };
  } catch {
    return buildInitialState();
  }
}

let state = loadState();
const app = document.querySelector("#app");

function applyQueryState() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const allowedViews = new Set([
    "home",
    "route-select",
    "property-select",
    "risk-questions",
    "radar",
    "risk-detail",
    "deadline-check",
    "possession-risk",
    "evidence-upload",
    "advisor",
    "properties",
  ]);

  if (view && allowedViews.has(view)) state.view = view;
  if (params.get("route")) state.selectedRoute = params.get("route");
  if (params.get("category")) state.activeCategory = params.get("category");
  if (params.get("ask") === "1") state.askOpen = true;
  if (params.get("scenario")) state.askAnswer = scenarioResponse(params.get("scenario"));
  if (params.get("question")) state.askAnswer = askResponse(params.get("question"));
  if (params.get("evidence") === "added") {
    updateRiskItem("gas-proof", {
      status: "Clear",
      action: "View risk",
      why: "Gas Safety proof was added and confirmed against the property record.",
      consequence: "Keep the evidence attached and set the next renewal reminder.",
      next: "Monitor the next certificate deadline.",
    });
    state.evidenceAdded = true;
    state.lastAction = "Evidence added. Risk reduced. The radar has moved the top signal to the next unresolved item.";
  }
}

applyQueryState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  const paths = {
    scan: '<path d="M4 12a8 8 0 0 1 8-8"/><path d="M12 20a8 8 0 0 0 8-8"/><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="2"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    folder: '<path d="M4 6h6l2 2h8v10H4z"/><path d="M8 13h8"/>',
    proof: '<path d="M7 4h7l3 3v13H7z"/><path d="M14 4v4h4"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    radar: '<circle cx="12" cy="12" r="8"/><path d="M12 12l6-4"/><path d="M12 12v-8"/><circle cx="12" cy="12" r="2"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.radar}</svg>`;
}

function logoSvg() {
  return `
    <svg class="brand-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 31.5 32 15l20 16.5v19a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3v-19Z" stroke="#24D3EE" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 53V36h16v17" stroke="#70E0A3" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 31c7.5 0 13.5 6 13.5 13.5" stroke="#F2A93B" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 22c12.4 0 22.5 10.1 22.5 22.5" stroke="#FF5C5C" stroke-width="3" stroke-linecap="round" opacity=".82"/>
      <path d="M32 44.5 47 29" stroke="#F7F4EA" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="44.5" r="3.5" fill="#24D3EE"/>
    </svg>
  `;
}

function header() {
  return `
    <header class="site-header">
      <div class="header-inner">
        <button class="brand-button" type="button" data-action="home" aria-label="CMP Radar home">
          ${logoSvg()}
          <span class="brand-text">
            <span class="brand-name">CMP Radar</span>
            <span class="brand-sub">Risk intelligence</span>
          </span>
        </button>
        <nav class="header-nav" aria-label="Prototype navigation">
          <button class="nav-button" type="button" data-action="route-select">Routes</button>
          <button class="nav-button" type="button" data-action="open-radar">Risk Radar</button>
          <button class="nav-button" type="button" data-action="properties">My Properties</button>
          <button class="signal-button" type="button" data-action="ask-open">Ask CMP</button>
        </nav>
      </div>
    </header>
  `;
}

function currentProperty() {
  return state.properties.find((property) => property.id === state.propertyId) || state.properties[0] || sampleProperty;
}

function dedupeProperties(properties) {
  const seen = new Set();
  return properties.filter((property) => {
    if (seen.has(property.id)) return false;
    seen.add(property.id);
    return true;
  });
}

function getRiskItem(id) {
  return state.riskItems.find((item) => item.id === id);
}

function categoryItems(categoryId) {
  return state.riskItems.filter((item) => item.category === categoryId);
}

function categorySummary(categoryId) {
  const items = categoryItems(categoryId);
  const active = items.filter((item) => statusRank[item.status] > 0);
  const severity = active.reduce((highest, item) => {
    return statusRank[item.status] > statusRank[highest] ? item.status : highest;
  }, "Clear");
  return {
    count: active.length,
    severity,
    items,
  };
}

function topRisk() {
  return [...state.riskItems]
    .filter((item) => statusRank[item.status] > 0)
    .sort((a, b) => statusRank[b.status] - statusRank[a.status])[0] || state.riskItems[0];
}

function nextDeadline() {
  return state.evidenceAdded
    ? { label: "EICR service window", date: "04 Aug 2026" }
    : { label: "Gas Safety proof check", date: "14 Jul 2026" };
}

function riskLevel() {
  const top = topRisk();
  if (top.status === "High risk" || top.status === "Human review recommended") return "High risk";
  if (top.status === "Missing") return state.evidenceAdded ? "Watch" : "High risk";
  if (top.status === "Due soon") return "Due soon";
  return "Watch";
}

function nextAction() {
  const top = topRisk();
  return top.action;
}

function advisorStatus() {
  const hasHuman = state.riskItems.some((item) => item.status === "Human review recommended");
  return hasHuman || state.selectedRoute === "possession" ? "Advisor review recommended" : "Advisor review available";
}

function setView(view, patch = {}) {
  state = { ...state, view, ...patch };
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateRiskItem(id, patch) {
  state.riskItems = state.riskItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function statusPill(status) {
  return `<span class="status-pill ${statusClass[status] || ""}">${escapeHtml(status)}</span>`;
}

function pageWrap(content) {
  return `${header()}${content}${state.askOpen ? renderAskDrawer() : ""}`;
}

function renderHome() {
  return pageWrap(`
    <main>
      <section class="page hero">
        <div class="hero-copy">
          <div class="brand-lockup">
            ${logoSvg()}
            <span class="brand-text">
              <span class="brand-name">CMP Radar</span>
              <span class="brand-sub">Risk-first landlord decisions</span>
            </span>
          </div>
          <h1>See property risks before they become problems.</h1>
          <p>CMP Radar shows the records, deadlines and landlord decisions that need attention first - then helps you add proof, book services or speak to an advisor.</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-action="route-select">Scan property risk</button>
            <button class="ghost-button" type="button" data-action="deadline-route">Check renewal deadlines</button>
            <button class="ghost-button" type="button" data-action="possession-route">Preview possession risk</button>
            <button class="ghost-button" type="button" data-action="evidence-route">Upload evidence to reduce risk</button>
            <button class="signal-button" type="button" data-action="open-radar">Open example risk radar</button>
          </div>
        </div>
        <div class="hero-frame" aria-label="Preview of risk radar">
          <div class="signal-halo"></div>
          <div class="hero-radar-card">
            <div class="mini-status">
              <div>
                <span class="mini-label">Current risk</span>
                <strong>High risk</strong>
              </div>
              <span class="status-pill status-missing">Missing proof</span>
            </div>
            <div class="mini-risk-stack">
              <div class="mini-risk"><span class="pulse-dot risk"></span><strong>Gas Safety proof</strong><span>Now</span></div>
              <div class="mini-risk"><span class="pulse-dot warn"></span><strong>EICR service window</strong><span>04 Aug</span></div>
              <div class="mini-risk"><span class="pulse-dot"></span><strong>Damp/mould monitor</strong><span>31 Aug</span></div>
            </div>
            <div class="scenario-box">
              <span class="small-label">What would happen if...</span>
              <strong>I cannot find this certificate?</strong>
              <p>This may make the property file weaker. Radar will suggest proof, service or advisor routes once the risk is selected.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="page route-strip">
        <div class="section-heading">
          <span class="eyebrow">Risk routes</span>
          <h2>Start with the decision that matters today.</h2>
        </div>
        <div class="route-grid">
          ${routeCards.map(renderRouteCard).join("")}
        </div>
      </section>

      <section class="page section-band">
        <div class="section-grid">
          <div class="info-panel accent">
            <span class="eyebrow">Risk categories</span>
            <h2>Six signal groups, one top risk.</h2>
            <p>Certificates, Tenancy, Licensing, Condition, Possession and Deadlines stay grouped so the landlord sees what needs attention first.</p>
          </div>
          <div class="info-panel">
            <span class="eyebrow">How Radar works</span>
            <h2>Ask less, decide faster.</h2>
            <p>Radar asks only risk-relevant questions, then shows the likely impact, next deadline and one risk reduction action.</p>
          </div>
          <div class="info-panel">
            <span class="eyebrow">Support model</span>
            <h2>Services are risk reducers.</h2>
            <p>Booking details can be prepared for Gas Safety, EICR, EPC, inspections, licensing review or advisor support. No provider has been contacted. No charge has been made.</p>
          </div>
        </div>
      </section>

      <section class="page section-band">
        <div class="trust-panel">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Trust boundary</span>
              <h2>Guidance only, not legal advice.</h2>
            </div>
            <button class="signal-button" type="button" data-action="open-radar">Open example risk radar</button>
          </div>
          <p>Review before relying on this information. CMP Radar helps organise risk, evidence, reminders and advisor preparation; it does not make automatic legal decisions.</p>
        </div>
      </section>
    </main>
  `);
}

function renderRouteCard(route) {
  return `
    <button class="route-card" type="button" data-action="select-route" data-route="${route.id}">
      <span class="route-icon">${icon(route.icon)}</span>
      <strong>${escapeHtml(route.label)}</strong>
      <p>${escapeHtml(route.text)}</p>
      <span class="route-arrow">Open</span>
    </button>
  `;
}

function renderRouteSelect() {
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Choose the risk route</span>
        <h1>What risk are you trying to understand first?</h1>
        <p>Pick the route that matches the landlord decision. Radar will keep the questions narrow and then open the main Risk Radar.</p>
      </div>
      <div class="route-grid">
        ${routeCards.map(renderRouteCard).join("")}
      </div>
    </main>
  `);
}

function renderPropertySelect() {
  const property = currentProperty();
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Property select</span>
        <h1>Select the property file.</h1>
        <p>The prototype uses one sample property once. You can rename it locally for review without creating duplicates.</p>
      </div>
      <div class="property-grid">
        <button class="property-choice" type="button" data-action="start-questions">
          <span class="status-pill status-high">${riskLevel()}</span>
          <strong>${escapeHtml(property.address)}</strong>
          <p>Top deadline: ${escapeHtml(nextDeadline().label)} on ${escapeHtml(nextDeadline().date)}</p>
        </button>
        <form class="question-panel" id="propertyForm">
          <label class="field-label" for="propertyAddress">Review address</label>
          <div class="input-row">
            <input id="propertyAddress" name="propertyAddress" value="${escapeHtml(property.address)}" autocomplete="street-address">
            <button class="signal-button" type="submit">Use this address</button>
          </div>
          <p>Address edits stay in this prototype only.</p>
        </form>
      </div>
    </main>
  `);
}

function renderRiskQuestions() {
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Risk questions</span>
        <h1>Only answer what changes the risk picture.</h1>
        <p>These questions focus on records, deadlines, property condition and advisor readiness.</p>
      </div>
      <section class="question-panel">
        <div class="question-grid">
          ${questionSet.map(renderQuestion).join("")}
        </div>
        <div class="button-row">
          <button class="primary-button" type="button" data-action="complete-questions">Create Risk Radar</button>
          <button class="ghost-button" type="button" data-action="open-radar">Open example risk radar</button>
        </div>
      </section>
    </main>
  `);
}

function renderQuestion(question) {
  const answer = state.answers[question.id] || "no";
  return `
    <div class="choice-field">
      <span>${escapeHtml(question.label)}</span>
      <div class="segmented" role="group" aria-label="${escapeHtml(question.label)}">
        <button class="segment ${answer === "yes" ? "active" : ""}" type="button" data-action="answer" data-question="${question.id}" data-value="yes">${escapeHtml(question.yes)}</button>
        <button class="segment ${answer === "no" ? "active" : ""}" type="button" data-action="answer" data-question="${question.id}" data-value="no">${escapeHtml(question.no)}</button>
      </div>
    </div>
  `;
}

function renderRadar() {
  const property = currentProperty();
  const top = topRisk();
  const deadline = nextDeadline();
  return pageWrap(`
    <main class="page screen-layout">
      <section class="screen-title">
        <span class="eyebrow">Risk decision screen</span>
        <h1>Risk Radar</h1>
        <p>${escapeHtml(property.address)} - see the biggest risk, the next deadline and the action most likely to reduce the risk picture.</p>
      </section>
      <section class="screen-kpis" aria-label="Risk header">
        <div class="metric"><span class="mini-label">Property address</span><strong>${escapeHtml(property.address)}</strong></div>
        <div class="metric"><span class="mini-label">Current risk level</span><strong>${escapeHtml(riskLevel())}</strong></div>
        <div class="metric"><span class="mini-label">Top deadline</span><strong>${escapeHtml(deadline.date)}</strong><p>${escapeHtml(deadline.label)}</p></div>
        <div class="metric"><span class="mini-label">Next risk reduction action</span><strong>${escapeHtml(nextAction())}</strong><p>${escapeHtml(advisorStatus())}</p></div>
      </section>

      ${state.lastAction ? `<div class="success-box">${escapeHtml(state.lastAction)}</div>` : ""}

      <section class="radar-grid">
        <div class="radar-stage">
          <div class="radar-toolbar">
            <div>
              <span class="eyebrow">Signal sectors</span>
              <h2 class="timeline-title">Risk Radar</h2>
            </div>
            <div class="button-row">
              <button class="ghost-button" type="button" data-action="evidence-route">Add proof</button>
              <button class="signal-button" type="button" data-action="ask-open">Ask CMP</button>
            </div>
          </div>
          ${renderRadarVisual()}
        </div>
        ${renderTopRiskPanel(top)}
      </section>

      ${renderDeadlineTimeline()}
    </main>
  `);
}

function renderRadarVisual() {
  return `
    <div class="radar-visual" aria-label="Risk Radar sector map">
      <div class="radar-core">
        <span>Risk Radar</span>
        <strong>${escapeHtml(riskLevel())}</strong>
      </div>
      ${categories.map((category) => {
        const summary = categorySummary(category.id);
        return `
          <button class="sector ${category.position}" type="button" data-action="sector-detail" data-category="${category.id}">
            <strong>${escapeHtml(category.label)}</strong>
            <small>${escapeHtml(summary.severity)} - ${summary.count} issue${summary.count === 1 ? "" : "s"}</small>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTopRiskPanel(item) {
  return `
    <aside class="top-risk-panel" aria-label="Top risk panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">Top risk</span>
          <h2 class="risk-title">${escapeHtml(item.title)}</h2>
        </div>
        ${statusPill(item.status)}
      </div>
      <div class="risk-list">
        <div>
          <span class="small-label">Why it matters</span>
          <p>${escapeHtml(item.why)}</p>
        </div>
        <div>
          <span class="small-label">What happens if ignored</span>
          <p>${escapeHtml(item.consequence)}</p>
        </div>
        <div>
          <span class="small-label">What to do next</span>
          <p>${escapeHtml(item.next)}</p>
        </div>
      </div>
      <div class="scenario-box">
        <span class="small-label">What would happen if...</span>
        <div class="prompt-list">
          ${scenarioPrompts.slice(0, 4).map((prompt) => `<button class="prompt-chip" type="button" data-action="scenario" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
        </div>
        ${state.askAnswer ? `<div class="response-box">${escapeHtml(state.askAnswer)}</div>` : ""}
      </div>
      <div class="impact-panel">
        <span class="small-label">Reduce this risk</span>
        <h3>${escapeHtml(item.service)}</h3>
        <p>Booking details can be prepared. No provider has been contacted. No charge has been made.</p>
        <div class="button-row">
          <button class="primary-button" type="button" data-action="evidence-route">${escapeHtml(item.action)}</button>
          <button class="signal-button" type="button" data-action="advisor-route">Ask advisor</button>
        </div>
      </div>
    </aside>
  `;
}

function renderDeadlineTimeline() {
  const events = state.evidenceAdded
    ? [
        { type: "Evidence added", title: "Gas Safety proof attached", date: "Today", status: "Clear" },
        { type: "Next expiry", title: "EICR service window", date: "04 Aug 2026", status: "Due soon" },
        { type: "Advisor milestone", title: "Possession evidence review", date: "22 Jul 2026", status: "Human review recommended" },
        { type: "Monitor later", title: "Damp/mould inspection reminder", date: "31 Aug 2026", status: "Watch" },
      ]
    : [
        { type: "Next expiry", title: "Gas Safety proof check", date: "14 Jul 2026", status: "Missing" },
        { type: "Service follow-up", title: "Gas Safety booking details", date: "18 Jul 2026", status: "Watch" },
        { type: "Evidence review", title: "Prepare certificate evidence", date: "17 Jul 2026", status: "Due soon" },
        { type: "Advisor milestone", title: "Possession evidence review", date: "22 Jul 2026", status: "Human review recommended" },
        { type: "Monitor later", title: "Damp/mould inspection reminder", date: "31 Aug 2026", status: "Watch" },
      ];
  return `
    <section class="route-strip">
      <div class="section-heading">
        <span class="eyebrow">Deadline timeline</span>
        <h2>Deadline lane</h2>
      </div>
      <div class="deadline-lane">
        ${events.map((event) => `
          <button class="timeline-event" type="button" data-action="timeline-select">
            <span class="timeline-date">${escapeHtml(event.date)}</span>
            <span>
              <span class="timeline-label">${escapeHtml(event.type)}</span>
              <strong>${escapeHtml(event.title)}</strong>
            </span>
            ${statusPill(event.status)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRiskDetail() {
  const category = categories.find((item) => item.id === state.activeCategory) || categories[0];
  const summary = categorySummary(category.id);
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Risk detail</span>
        <h1>${escapeHtml(category.label)}</h1>
        <p>${escapeHtml(category.summary)}</p>
      </div>
      <section class="detail-grid">
        <div class="risk-list-panel">
          <div class="panel-heading">
            <h2 class="timeline-title">${escapeHtml(category.label)} issues</h2>
            ${statusPill(summary.severity)}
          </div>
          <div class="risk-list">
            ${summary.items.map((item) => `
              <button class="risk-row" type="button" data-action="focus-risk" data-risk="${item.id}">
                <span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>${escapeHtml(item.why)}</p>
                </span>
                <span>
                  ${statusPill(item.status)}
                  <span class="count-pill">${escapeHtml(item.action)}</span>
                </span>
              </button>
            `).join("")}
          </div>
        </div>
        <div class="impact-panel">
          <span class="small-label">Risk decision</span>
          <h2 class="risk-title">${escapeHtml(summary.severity)} in ${escapeHtml(category.label)}</h2>
          <p>Inspect the items, add proof where it exists, set reminders for dated items or ask an advisor when the next step needs human review.</p>
          <div class="button-row">
            <button class="primary-button" type="button" data-action="evidence-route">Add proof</button>
            <button class="ghost-button" type="button" data-action="back-radar">Back to Risk Radar</button>
          </div>
        </div>
      </section>
    </main>
  `);
}

function renderDeadlineCheck() {
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Deadline-first route</span>
        <h1>Check renewal deadlines.</h1>
        <p>Deadline lane shows the next expiry, service follow-up, evidence review, possession/advisor milestone and monitor-later item.</p>
      </div>
      ${renderDeadlineTimeline()}
      <section class="question-panel">
        <div class="question-grid">
          ${["Certificate expiry dates are known", "Service follow-up is booked", "Inspection dates are current", "Monitor-later items have reminders"].map((label, index) => `
            <div class="choice-field">
              <span>${label}</span>
              <div class="segmented">
                <button class="segment ${index === 0 ? "" : "active"}" type="button">Yes</button>
                <button class="segment ${index === 0 ? "active" : ""}" type="button">Needs review</button>
              </div>
            </div>
          `).join("")}
        </div>
        <button class="primary-button" type="button" data-action="open-radar">Build deadline radar</button>
      </section>
    </main>
  `);
}

function renderPossessionRisk() {
  return pageWrap(`
    <main class="page screen screen-layout" data-state="possession-risk">
      <div class="screen-title">
        <span class="eyebrow">Possession risk preview</span>
        <h1>Check evidence readiness before speaking to an advisor.</h1>
        <p>This route organises evidence and process-readiness questions. It does not predict an outcome.</p>
      </div>
      <section class="detail-grid">
        <div class="question-panel">
          <div class="question-grid">
            ${possessionQuestions.map((question, index) => renderPossessionQuestion(question, index)).join("")}
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-action="prepare-pack">Prepare evidence pack</button>
            <button class="signal-button" type="button" data-action="advisor-route">Prepare advisor review</button>
          </div>
        </div>
        <aside class="top-risk-panel">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Possession evidence risk</span>
              <h2 class="risk-title">Missing evidence list</h2>
            </div>
            ${statusPill("Human review recommended")}
          </div>
          <div class="risk-list">
            <div class="risk-row"><strong>Gas Safety evidence</strong>${statusPill(state.evidenceAdded ? "Clear" : "Missing")}</div>
            <div class="risk-row"><strong>Deposit evidence</strong>${statusPill("Watch")}</div>
            <div class="risk-row"><strong>Repair complaint history</strong>${statusPill("Watch")}</div>
            <div class="risk-row"><strong>Advisor review status</strong>${statusPill("Human review recommended")}</div>
          </div>
          <div class="scenario-box">
            <span class="small-label">What would happen if...</span>
            <button class="prompt-chip" type="button" data-action="scenario" data-prompt="What if the property needs possession advice?">What if the property needs possession advice?</button>
            <p>A CMP advisor can help review the next step. Prepare the evidence pack before relying on this information.</p>
          </div>
        </aside>
      </section>
    </main>
  `);
}

function renderPossessionQuestion(question, index) {
  const answer = state.possessionAnswers[index] || (index === 11 ? "yes" : "review");
  return `
    <div class="choice-field">
      <span>${escapeHtml(question)}</span>
      <div class="segmented">
        <button class="segment ${answer === "yes" ? "active" : ""}" type="button" data-action="possession-answer" data-question="${index}" data-value="yes">Yes</button>
        <button class="segment ${answer === "review" ? "active" : ""}" type="button" data-action="possession-answer" data-question="${index}" data-value="review">Review</button>
      </div>
    </div>
  `;
}

function renderEvidenceUpload() {
  const suggested = state.evidenceDraft || "Gas Safety certificate photo";
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Evidence upload</span>
        <h1>Add proof to reduce risk.</h1>
        <p>Select a sample document, confirm the suggested match and Radar updates the risk item after landlord confirmation.</p>
      </div>
      <section class="detail-grid">
        <div class="upload-panel">
          <div class="upload-stack">
            <button class="upload-option" type="button" data-action="evidence-select" data-doc="Gas Safety certificate photo">
              <span class="route-icon">${icon("proof")}</span>
              <strong>Gas Safety certificate photo</strong>
              <p>Suggested match for the missing Gas Safety proof risk.</p>
            </button>
            <button class="upload-option" type="button" data-action="evidence-select" data-doc="EICR appointment email">
              <span class="route-icon">${icon("clock")}</span>
              <strong>EICR appointment email</strong>
              <p>Suggested match for the electrical service follow-up risk.</p>
            </button>
            <button class="upload-option" type="button" data-action="evidence-select" data-doc="Inspection image set">
              <span class="route-icon">${icon("scan")}</span>
              <strong>Inspection image set</strong>
              <p>Suggested match for condition and alarm evidence.</p>
            </button>
          </div>
        </div>
        <aside class="top-risk-panel">
          <span class="small-label">Suggested match</span>
          <h2 class="risk-title">${escapeHtml(suggested)}</h2>
          <p>Confirm before updating risk. This prototype does not say the proof has been independently checked.</p>
          <div class="risk-list">
            <div class="risk-row"><strong>Related risk item</strong><span>${escapeHtml(suggested.includes("EICR") ? "EICR service window is due soon" : suggested.includes("Inspection") ? "Smoke alarm evidence is not saved" : "Gas Safety proof is missing")}</span></div>
            <div class="risk-row"><strong>Current status</strong>${statusPill(getRiskItem("gas-proof")?.status || "Missing")}</div>
            <div class="risk-row"><strong>After confirmation</strong>${statusPill("Watch")}</div>
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-action="confirm-evidence">Confirm before updating risk</button>
            <button class="ghost-button" type="button" data-action="open-radar">View current radar</button>
          </div>
          ${state.evidenceAdded ? `<div class="success-box">Evidence added. Risk reduced. Advisor review available.</div>` : ""}
        </aside>
      </section>
    </main>
  `);
}

function renderAdvisor() {
  const top = topRisk();
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">Advisor and services</span>
        <h1>Risk reducers, not a shop.</h1>
        <p>Choose the next support option tied to the current top risk. Booking details can be prepared without contacting a provider or making a charge.</p>
      </div>
      <section class="support-grid">
        ${[
          ["Book Gas Safety check to reduce certificate risk.", "Book service", "No provider has been contacted. No charge has been made."],
          ["Book EICR to reduce electrical safety risk.", "Book service", "Use the date in the deadline lane."],
          ["Book EPC assessment to reduce energy record risk.", "Book service", "Attach the completed record when available."],
          ["Request damp/mould inspection.", "Book service", "Save inspection notes and images."],
          ["Request licensing/HMO review.", "Ask advisor", "Prepare property use notes first."],
          ["Prepare possession evidence review.", "Prepare advisor review", "Gather arrears, tenancy, deposit, certificate and repair records."],
        ].map(([title, action, body]) => `
          <div class="advisor-panel">
            <span class="small-label">Reduce this risk</span>
            <h2 class="risk-title">${title}</h2>
            <p>${body}</p>
            <button class="signal-button" type="button" data-action="advisor-action" data-message="${escapeHtml(action)} prepared for ${escapeHtml(top.title)}.">${action}</button>
          </div>
        `).join("")}
      </section>
    </main>
  `);
}

function renderProperties() {
  const properties = dedupeProperties(state.properties);
  const property = properties[0] || sampleProperty;
  const top = topRisk();
  const deadline = nextDeadline();
  return pageWrap(`
    <main class="page screen screen-layout">
      <div class="screen-title">
        <span class="eyebrow">My Properties</span>
        <h1>One property, one current risk signal.</h1>
        <p>Portfolio risk view available once more properties are added.</p>
      </div>
      <section class="property-stack">
        <article class="property-card">
          <div class="property-card-head">
            <div>
              <span class="small-label">Address</span>
              <h2 class="risk-title">${escapeHtml(property.address)}</h2>
            </div>
            ${statusPill(riskLevel())}
          </div>
          <div class="metrics-grid">
            <div class="metric"><span class="mini-label">Top risk</span><strong>${escapeHtml(top.title)}</strong></div>
            <div class="metric"><span class="mini-label">Next deadline</span><strong>${escapeHtml(deadline.date)}</strong><p>${escapeHtml(deadline.label)}</p></div>
            <div class="metric"><span class="mini-label">Risk reduction action</span><strong>${escapeHtml(top.action)}</strong></div>
            <div class="metric"><span class="mini-label">Advisor review status</span><strong>${escapeHtml(advisorStatus())}</strong></div>
          </div>
          <button class="primary-button" type="button" data-action="open-radar">Open radar</button>
        </article>
      </section>
    </main>
  `);
}

function renderAskDrawer() {
  return `
    <div class="drawer-backdrop" data-action="ask-close"></div>
    <aside class="ask-drawer" aria-label="Ask CMP drawer">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">Ask CMP</span>
          <h2 class="risk-title">Risk questions</h2>
        </div>
        <button class="plain-button" type="button" data-action="ask-close">Close</button>
      </div>
      <div class="ask-stack">
        <form id="askForm">
          <label class="field-label" for="askInput">Type a risk question</label>
          <div class="input-row">
            <input id="askInput" name="askInput" placeholder="What happens if I ignore this?">
            <button class="signal-button" type="submit">Ask</button>
          </div>
        </form>
        <div class="prompt-list">
          ${askPrompts.map((prompt) => `<button class="prompt-chip" type="button" data-action="ask-prompt" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
        </div>
        ${state.askAnswer ? `<div class="response-box">${escapeHtml(state.askAnswer)}</div>` : `<div class="empty-state">Ask CMP uses deterministic prototype responses from the current risk state.</div>`}
      </div>
    </aside>
  `;
}

function scenarioResponse(prompt) {
  const top = topRisk();
  if (prompt.includes("cannot find")) {
    return "This may make the property file weaker. Add proof if it exists, book a service if the record cannot be found, or ask an advisor what evidence to prepare.";
  }
  if (prompt.includes("without this proof")) {
    return "You may want to add proof or set a reminder before relying on this record. A CMP advisor can help review the next step.";
  }
  if (prompt.includes("delay")) {
    return "Delaying this service may leave less time to gather evidence. Booking a service may help produce the evidence needed.";
  }
  if (prompt.includes("repair complaint")) {
    return "A repair complaint can make condition evidence more important. Add inspection notes, contractor evidence and communications before relying on the file.";
  }
  if (prompt.includes("possession advice")) {
    return "Prepare the evidence pack first: tenancy, arrears, deposit, certificates, repair history and tenant communications. A CMP advisor can help review the next step.";
  }
  if (prompt.includes("monitor later")) {
    return "A monitor-later item should have a reminder date. Without one, unresolved risk age may rise.";
  }
  return `${top.title}: ${top.consequence}`;
}

function askResponse(prompt) {
  const top = topRisk();
  const deadline = nextDeadline();
  const normal = prompt.toLowerCase();
  if (normal.includes("biggest")) {
    return `The biggest current risk is ${top.title}. Status: ${top.status}. Next action: ${top.action}.`;
  }
  if (normal.includes("ignore")) {
    return top.consequence;
  }
  if (normal.includes("service")) {
    return `${top.service} Booking details can be prepared. No provider has been contacted. No charge has been made.`;
  }
  if (normal.includes("advisor")) {
    return "Advisor review is recommended when evidence is missing, a possession route is being considered, or the next step needs human review.";
  }
  if (normal.includes("proof")) {
    return "Add dated proof that relates to the risk item: certificate image, appointment record, inspection note, contractor evidence or saved communications.";
  }
  if (normal.includes("deadline")) {
    return `The next deadline is ${deadline.label} on ${deadline.date}. Set a reminder or reduce the risk before that date.`;
  }
  return scenarioResponse(prompt);
}

function confirmEvidence() {
  updateRiskItem("gas-proof", {
    status: "Clear",
    action: "View risk",
    why: "Gas Safety proof was added and confirmed against the property record.",
    consequence: "Keep the evidence attached and set the next renewal reminder.",
    next: "Monitor the next certificate deadline.",
  });
  updateRiskItem("certificate-evidence", {
    status: "Watch",
    action: "Prepare evidence pack",
  });
  updateRiskItem("certificate-expiry", {
    status: "Watch",
    action: "Set reminder",
  });
  state.evidenceAdded = true;
  state.lastAction = "Evidence added. Risk reduced. The radar has moved the top signal to the next unresolved item.";
  saveState();
  setView("radar");
}

function prepareEvidencePack() {
  state.selectedRoute = "possession";
  state.lastAction = "Evidence pack prepared for advisor review: tenancy, deposit, certificates, arrears, repairs and communications.";
  saveState();
  setView("radar");
}

function render() {
  const renderers = {
    home: renderHome,
    "route-select": renderRouteSelect,
    "property-select": renderPropertySelect,
    "risk-questions": renderRiskQuestions,
    radar: renderRadar,
    "risk-detail": renderRiskDetail,
    "deadline-check": renderDeadlineCheck,
    "possession-risk": renderPossessionRisk,
    "evidence-upload": renderEvidenceUpload,
    advisor: renderAdvisor,
    properties: renderProperties,
  };
  const renderer = renderers[state.view] || renderHome;
  app.innerHTML = renderer();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  const action = trigger.dataset.action;

  if (action === "home") setView("home", { askOpen: false });
  if (action === "route-select") setView("route-select");
  if (action === "properties") setView("properties");
  if (action === "open-radar") setView("radar", { selectedRoute: "example" });
  if (action === "deadline-route") setView("deadline-check", { selectedRoute: "deadlines" });
  if (action === "possession-route") setView("possession-risk", { selectedRoute: "possession" });
  if (action === "evidence-route") setView("evidence-upload", { selectedRoute: "evidence" });
  if (action === "advisor-route") setView("advisor", { advisorMode: "advisor" });
  if (action === "back-radar") setView("radar");
  if (action === "ask-open") setView(state.view, { askOpen: true });
  if (action === "ask-close") setView(state.view, { askOpen: false });

  if (action === "select-route") {
    const route = trigger.dataset.route;
    if (route === "deadlines") setView("deadline-check", { selectedRoute: route });
    else if (route === "possession") setView("possession-risk", { selectedRoute: route });
    else if (route === "evidence") setView("evidence-upload", { selectedRoute: route });
    else if (route === "example") setView("radar", { selectedRoute: route });
    else setView("property-select", { selectedRoute: route });
  }

  if (action === "start-questions") setView("risk-questions");
  if (action === "complete-questions") setView("radar", { selectedRoute: state.selectedRoute || "scan" });

  if (action === "answer") {
    state.answers = { ...state.answers, [trigger.dataset.question]: trigger.dataset.value };
    saveState();
    render();
  }

  if (action === "possession-answer") {
    state.possessionAnswers = { ...state.possessionAnswers, [trigger.dataset.question]: trigger.dataset.value };
    saveState();
    render();
  }

  if (action === "sector-detail") {
    setView("risk-detail", { activeCategory: trigger.dataset.category });
  }

  if (action === "focus-risk") {
    const risk = getRiskItem(trigger.dataset.risk);
    if (risk) {
      state.askAnswer = `${risk.title}: ${risk.consequence}`;
      setView("radar");
    }
  }

  if (action === "scenario") {
    state.askAnswer = scenarioResponse(trigger.dataset.prompt || "");
    saveState();
    render();
  }

  if (action === "ask-prompt") {
    state.askAnswer = askResponse(trigger.dataset.prompt || "");
    saveState();
    render();
  }

  if (action === "evidence-select") {
    state.evidenceDraft = trigger.dataset.doc;
    state.lastAction = "";
    saveState();
    render();
  }

  if (action === "confirm-evidence") {
    confirmEvidence();
  }

  if (action === "prepare-pack") {
    prepareEvidencePack();
  }

  if (action === "advisor-action") {
    state.lastAction = trigger.dataset.message || "Advisor action prepared.";
    saveState();
    setView("radar");
  }

  if (action === "timeline-select") {
    state.askAnswer = "This deadline should either have proof attached, a reminder set or a risk reducer selected before you rely on the record.";
    saveState();
    render();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "askForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const question = String(formData.get("askInput") || "").trim();
    state.askAnswer = askResponse(question || "What is the biggest risk?");
    saveState();
    render();
  }

  if (event.target.id === "propertyForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const address = String(formData.get("propertyAddress") || "").trim() || sampleProperty.address;
    state.properties = dedupeProperties([{ ...sampleProperty, address }, ...state.properties.filter((property) => property.id !== sampleProperty.id)]);
    state.propertyId = sampleProperty.id;
    saveState();
    setView("risk-questions");
  }
});

render();
