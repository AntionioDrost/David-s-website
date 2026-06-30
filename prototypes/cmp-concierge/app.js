const STORAGE_KEY = "cmpConciergePrototypeV1";

const sampleProperties = [
  {
    id: "warwick-row",
    address: "22 Warwick Row, Coventry, CV1 1EX",
    owner: "David Taylor",
    tenancy: "Single household AST",
    localAuthority: "Coventry City Council",
    notes: "Two-bedroom city centre flat with a renewal decision due this quarter.",
  },
];

const services = [
  {
    id: "epc",
    name: "EPC assessment",
    intent: "certificate",
    helps: "Confirms the current energy rating route and whether a renewal should be prepared.",
    evidenceProduces: "EPC certificate reference, rating date and renewal reminder.",
    cmpNeeds: ["Property access notes", "Any existing EPC reference", "Preferred appointment windows"],
    advisor: false,
    booking: true,
    price: "Indicative booking band available after appointment details",
  },
  {
    id: "gas",
    name: "Gas Safety check",
    intent: "certificate",
    helps: "Prepares an annual gas safety appointment and captures the evidence CMP should expect after it.",
    evidenceProduces: "Gas Safety record, appliance notes and renewal monitoring date.",
    cmpNeeds: ["Boiler location", "Tenant access route", "Current certificate if held"],
    advisor: false,
    booking: true,
    price: "Booking details can be prepared now",
  },
  {
    id: "eicr",
    name: "EICR",
    intent: "certificate",
    helps: "Routes an electrical inspection request and records remedial evidence if the report raises observations.",
    evidenceProduces: "Electrical Installation Condition Report and follow-up action list.",
    cmpNeeds: ["Consumer unit access", "Last report if available", "Preferred inspection window"],
    advisor: true,
    booking: true,
    price: "Advisor review useful if remedial work is likely",
  },
  {
    id: "smoke-co",
    name: "Smoke/CO alarm check",
    intent: "certificate",
    helps: "Prepares a visit or self-check evidence route for smoke and carbon monoxide alarms.",
    evidenceProduces: "Alarm test record, photos and monitoring reminder.",
    cmpNeeds: ["Room layout notes", "Current alarm photos", "Access notes"],
    advisor: false,
    booking: true,
    price: "Can be bundled with inspection routes",
  },
  {
    id: "inspection",
    name: "Property inspection",
    intent: "issue",
    helps: "Turns a repair concern, complaint or condition question into a structured inspection route.",
    evidenceProduces: "Inspection report, dated photos and recommended next actions.",
    cmpNeeds: ["Issue summary", "Tenant availability", "Recent photos or messages"],
    advisor: true,
    booking: true,
    price: "Prepare request before confirming contractor route",
  },
  {
    id: "damp-mould",
    name: "Damp/mould inspection",
    intent: "issue",
    helps: "Collects the right context before a damp or mould inspection and flags where advisor support may help.",
    evidenceProduces: "Condition report, moisture observations, photos and recommended follow-up.",
    cmpNeeds: ["Affected rooms", "Tenant complaint history", "Repair or ventilation notes"],
    advisor: true,
    booking: true,
    price: "Advisor review recommended before or after inspection",
  },
  {
    id: "inventory",
    name: "Inventory/check-in support",
    intent: "documents",
    helps: "Prepares inventory, check-in or condition evidence for a tenancy file.",
    evidenceProduces: "Inventory record, dated photos and check-in notes.",
    cmpNeeds: ["Tenancy start date", "Existing inventory files", "Room and meter photos"],
    advisor: false,
    booking: true,
    price: "Can be prepared as a document-led request",
  },
  {
    id: "licensing",
    name: "Licensing/HMO review",
    intent: "documents",
    helps: "Checks whether CMP should review local licensing questions before a wider service route.",
    evidenceProduces: "Licensing evidence summary and questions for advisor review.",
    cmpNeeds: ["Occupier count", "Room use", "Local authority correspondence"],
    advisor: true,
    booking: false,
    price: "Advisor review recommended",
  },
  {
    id: "tenant-docs",
    name: "Tenant documentation support",
    intent: "documents",
    helps: "Organises tenancy agreement, deposit, certificate and service evidence into a reviewable request.",
    evidenceProduces: "Document check summary and missing evidence list.",
    cmpNeeds: ["Tenancy agreement", "Deposit evidence", "Certificates or upload notes"],
    advisor: true,
    booking: false,
    price: "Ready for advisor review after upload",
  },
  {
    id: "possession-review",
    name: "Possession evidence review",
    intent: "possession",
    helps: "Prepares the evidence picture before a landlord speaks to an advisor about possession options.",
    evidenceProduces: "Evidence readiness summary, missing evidence list and upload prompt.",
    cmpNeeds: ["Reason for considering possession", "Tenancy and deposit evidence", "Repair and complaint history"],
    advisor: true,
    booking: false,
    price: "Advisor review recommended",
  },
  {
    id: "monitoring",
    name: "Compliance monitoring",
    intent: "full-check",
    helps: "Creates reminders for certificates, inspection follow-up and evidence gaps after a wider property check.",
    evidenceProduces: "Monitoring schedule and one next service request.",
    cmpNeeds: ["Property basics", "Known certificate dates", "Preferred reminder channel"],
    advisor: false,
    booking: false,
    price: "Start with a guided property check",
  },
  {
    id: "advisor-call",
    name: "Advisor call",
    intent: "advisor",
    helps: "Routes uncertain landlord situations to a human conversation before booking or uploading more evidence.",
    evidenceProduces: "Advisor brief and recommended next action.",
    cmpNeeds: ["Main concern", "Current evidence", "Contact preference"],
    advisor: true,
    booking: false,
    price: "Quick call request can be prepared",
  },
];

const routeIntents = [
  {
    id: "certificate",
    title: "I need a certificate",
    text: "EPC, Gas Safety, EICR or Smoke/CO alarm check routed into the right booking preparation.",
    examples: "EPC, Gas Safety, EICR, Smoke/CO alarm check",
    icon: "certificate",
  },
  {
    id: "issue",
    title: "I need help with a property issue",
    text: "Damp, mould, repairs, inspection needs, tenant complaints or condition evidence.",
    examples: "Damp/mould, repairs, inspection, tenant complaint",
    icon: "inspection",
  },
  {
    id: "possession",
    title: "I need possession preparation",
    text: "Prepare your evidence before speaking to an advisor about the route and next questions.",
    examples: "Rent arrears, property sale, tenancy breach, not sure",
    icon: "advisor",
  },
  {
    id: "documents",
    title: "I need my documents checked",
    text: "Upload or choose documents so CMP can prepare a review summary and next step.",
    examples: "Tenancy agreement, certificates, deposit evidence, photos",
    icon: "documents",
  },
  {
    id: "full-check",
    title: "I want a full property check",
    text: "Use a broader property route if you are unsure where to begin.",
    examples: "Certificates, records, services and monitoring",
    icon: "monitoring",
  },
];

const defaultState = {
  view: "home",
  selectedIntent: null,
  selectedServiceId: "gas",
  selectedPropertyId: "warwick-row",
  issueType: "damp or mould",
  certificateType: "Gas Safety",
  documentType: "Tenancy agreement",
  booking: {
    urgency: "Within 7 days",
    preferredTime: "Weekday morning",
    accessNotes: "Tenant can provide access with 24 hours notice.",
    contactPreference: "Email then phone",
    contractor: "No, please help me prepare options",
    ready: false,
  },
  possession: {
    reason: "Rent arrears",
    tenantInProperty: "Yes",
    tenancyType: "Assured shorthold tenancy",
    noticeServed: "No",
    rentArrears: "Yes",
    repairComplaints: "Possible damp/mould complaint",
    depositTaken: "Yes",
    depositEvidence: "Not uploaded yet",
    tenancyAgreement: "Available",
    epcEvidence: "Available",
    gasEvidence: "Needs checking",
    howToRentEvidence: "Not uploaded yet",
    advisorReview: "Yes",
  },
  requests: [],
  askInput: "",
  askResponse: "Tell CMP what is happening and we will suggest a service route, evidence to gather and whether a human advisor should review it.",
};

let state = loadState();
const app = document.querySelector("#app");

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(stored) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentProperty() {
  return sampleProperties.find((property) => property.id === state.selectedPropertyId) || sampleProperties[0];
}

function currentService() {
  return services.find((service) => service.id === state.selectedServiceId) || services[1];
}

function icon(name) {
  const icons = {
    certificate: '<path d="M8 5h8l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M15 5v5h5"/><path d="M9 15h6"/><path d="M9 18h4"/>',
    inspection: '<path d="M4 20V8l8-5 8 5v12"/><path d="M9 20v-6h6v6"/><path d="M7 11h10"/><path d="m15 4 2 3"/>',
    advisor: '<path d="M12 21a8 8 0 0 0 8-8V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v5a8 8 0 0 0 8 8Z"/><path d="M8 12h8"/><path d="M9 16h6"/><path d="M9 8h.01"/><path d="M15 8h.01"/>',
    documents: '<path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5"/><path d="M9 14h6"/><path d="M9 17h6"/>',
    monitoring: '<path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-4"/><path d="M5 5h4"/><path d="M15 9h4"/>',
    bell: '<path d="M10 20h4"/><path d="M18 16H6l2-3V9a4 4 0 0 1 8 0v4l2 3Z"/><path d="M10 5V4a2 2 0 0 1 4 0v1"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  return `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.check}</svg>`;
}

function logo() {
  return `
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="cmpBellGradient" x1="8" y1="5" x2="57" y2="59">
          <stop stop-color="#3A8DFF" />
          <stop offset="1" stop-color="#FF7A59" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="54" height="54" rx="8" fill="#101827" stroke="rgba(240,232,255,.24)" />
      <path d="M17 33.5 32 20l15 13.5V48H36V36h-8v12H17V33.5Z" fill="rgba(240,232,255,.13)" stroke="#F0E8FF" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M41 31c0-5-3.5-8.5-8-8.5S25 26 25 31v4.6L22.6 40h20.8L41 35.6V31Z" fill="url(#cmpBellGradient)" />
      <path d="M29 43h8" stroke="#101318" stroke-width="2.4" stroke-linecap="round" />
    </svg>
  `;
}

function header() {
  const nav = [
    ["home", "Home"],
    ["requests", "My Requests"],
    ["properties", "My Properties"],
    ["ask", "Ask CMP"],
  ];
  return `
    <header class="site-header">
      <div class="header-inner">
        <button class="brand-button" type="button" data-view="home" aria-label="CMP Concierge home">
          ${logo()}
          <span class="brand-text">
            <span class="brand-name">CMP Concierge</span>
            <span class="brand-subtitle">Service routes and advisor support</span>
          </span>
        </button>
        <nav class="top-nav" aria-label="Prototype navigation">
          ${nav
            .map(
              ([view, label]) =>
                `<button class="nav-button ${state.view === view ? "is-active" : ""}" type="button" data-view="${view}">${label}</button>`,
            )
            .join("")}
        </nav>
      </div>
    </header>
  `;
}

function homeView() {
  const routeCards = services.slice(0, 6);
  return `
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <div>${logo()}</div>
          <h1>Tell CMP what your property needs. We&rsquo;ll route the next step.</h1>
          <p>From certificates and inspections to evidence checks and possession preparation, CMP helps landlords choose the right service, prepare the right proof and know what happens next.</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-view="route-select">Get help with a property ${icon("arrow")}</button>
            <button class="secondary-button" type="button" data-intent="certificate">Book a certificate or inspection</button>
          </div>
          <div class="hero-links" aria-label="Concierge quick routes">
            <button class="hero-link" type="button" data-intent="possession"><strong>Prepare possession evidence</strong><span>Evidence first, advisor next</span></button>
            <button class="hero-link" type="button" data-view="documents"><strong>Upload documents for review</strong><span>Suggested match and summary</span></button>
            <button class="hero-link" type="button" data-intent="full-check"><strong>Run a full property check</strong><span>Wider review, guided route</span></button>
            <button class="hero-link" type="button" data-example="service-plan"><strong>Open example service plan</strong><span>Seed one clear request</span></button>
          </div>
        </div>
        <aside class="route-preview" aria-label="Dynamic service route preview">
          <div class="preview-top">
            <div>
              <p class="route-meta">Live route preview</p>
              <h2 class="preview-title">Damp/mould inspection with advisor review</h2>
            </div>
            <span class="preview-status">Booking readiness 76%</span>
          </div>
          <div class="route-stack">
            ${previewRoute("Recommended route", "Damp/mould inspection", "Inspection prepares condition evidence and follow-up questions.", "inspection", true)}
            ${previewRoute("What CMP needs", "Complaint history and photos", "Add affected rooms, repair notes and tenant availability.", "documents", false)}
            ${previewRoute("Advisor support", "Recommended", "A human can review the evidence picture before the next action.", "advisor", false)}
            ${previewRoute("Expected service outcome", "Condition report", "Dated photos, observations and monitoring reminder.", "monitoring", false)}
          </div>
        </aside>
      </section>

      <section class="section-band">
        <div class="section-heading">
          <h2>Popular landlord needs</h2>
          <p>Start with the situation, then CMP routes the service, evidence and next step.</p>
        </div>
        <div class="service-grid">
          ${routeCards.map(serviceCard).join("")}
        </div>
      </section>

      <section class="section-band">
        <div class="section-heading">
          <h2>How Concierge works</h2>
          <p>A service-first path for landlords who need action and one clear next step.</p>
        </div>
        <div class="service-grid">
          ${howCard("1", "Describe the need", "Choose certificates, inspections, documents, possession preparation or a broader property check.")}
          ${howCard("2", "Confirm the evidence", "CMP shows what is needed before the service and what evidence should exist afterwards.")}
          ${howCard("3", "Prepare the next step", "Build booking details, upload documents or ask a CMP advisor to review the request.")}
        </div>
        <div class="trust-strip">
          <div>
            <strong>Trust boundary:</strong>
            <span class="fine-print">This prototype prepares requests and evidence summaries. Guidance only, not legal advice.</span>
          </div>
          <button class="dangerless-button" type="button" data-view="advisor">Not sure? Get guidance before booking</button>
        </div>
      </section>
    </main>
    ${footerNote()}
  `;
}

function previewRoute(label, title, text, iconName, featured) {
  return `
    <article class="route-card ${featured ? "is-featured" : ""}">
      <span class="route-icon">${icon(iconName)}</span>
      <div>
        <p class="route-meta">${label}</p>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
      <span class="route-meta">${featured ? "Primary" : "Next"}</span>
    </article>
  `;
}

function serviceCard(service) {
  return `
    <article class="service-card">
      <span class="route-icon">${icon(service.intent === "certificate" ? "certificate" : "inspection")}</span>
      <div>
        <h3>${service.name}</h3>
        <p>${service.helps}</p>
      </div>
      <ul class="mini-list">
        <li>Evidence: ${service.evidenceProduces}</li>
        <li>${service.advisor ? "Advisor review recommended" : "Advisor optional"}</li>
      </ul>
      <button class="text-button" type="button" data-service="${service.id}">Choose route ${icon("arrow")}</button>
    </article>
  `;
}

function howCard(number, title, text) {
  return `
    <article class="service-card">
      <span class="status-chip is-blue">${number}</span>
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `;
}

function routeSelectView() {
  return `
    <main class="page">
      ${stepRail(["Home", "Choose need", "Property", "Questions", "Service plan"], 1)}
      <section class="screen-heading">
        <h1>What help do you need?</h1>
        <p>Choose the closest route. You do not need to run a full property check first.</p>
      </section>
      <div class="choice-grid">
        ${routeIntents
          .map(
            (route) => `
              <button class="choice-panel ${state.selectedIntent === route.id ? "is-selected" : ""}" type="button" data-intent="${route.id}">
                <span class="panel-icon">${icon(route.icon)}</span>
                <span>
                  <h2>${route.title}</h2>
                  <p>${route.text}</p>
                  <p class="fine-print">${route.examples}</p>
                </span>
                <footer>Route this need ${icon("arrow")}</footer>
              </button>
            `,
          )
          .join("")}
      </div>
    </main>
    ${footerNote()}
  `;
}

function propertySelectView() {
  const property = currentProperty();
  return `
    <main class="page">
      ${stepRail(["Home", "Choose need", "Property", "Questions", "Service plan"], 2)}
      <section class="screen-heading">
        <h1>Select the property</h1>
        <p>Concierge uses the property context to shape the evidence checklist and booking details.</p>
      </section>
      <div class="property-select-layout">
        <article class="property-card is-large">
          <header>
            <div>
              <p class="route-meta">Selected property</p>
              <h2>${property.address}</h2>
            </div>
            <span class="status-chip is-blue">Ready to route</span>
          </header>
          <p>${property.notes}</p>
          <div class="divider"></div>
          <ul class="evidence-list">
            <li>Tenancy: ${property.tenancy}</li>
            <li>Area: ${property.localAuthority}</li>
            <li>Current need: ${intentLabel()}</li>
          </ul>
          <div class="button-row">
            <button class="primary-button" type="button" data-next-after-property>Continue ${icon("arrow")}</button>
          </div>
        </article>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function questionsView() {
  if (state.selectedIntent === "possession") return possessionView();
  if (state.selectedIntent === "documents") return documentsView();
  const certificate = state.selectedIntent === "certificate";
  const issue = state.selectedIntent === "issue";
  const options = certificate
    ? [
        ["epc", "EPC"],
        ["gas", "Gas Safety"],
        ["eicr", "EICR"],
        ["smoke-co", "Smoke/CO alarm check"],
      ]
    : issue
      ? [
          ["damp-mould", "Damp/mould"],
          ["inspection", "Repairs or inspection"],
          ["inventory", "Condition report"],
          ["advisor-call", "Tenant complaint"],
        ]
      : [
          ["monitoring", "Broader property check"],
          ["tenant-docs", "Document-led review"],
          ["advisor-call", "Not sure"],
        ];
  return `
    <main class="page">
      ${stepRail(["Home", "Choose need", "Property", "Questions", "Service plan"], 3)}
      <section class="screen-heading">
        <h1>A few targeted questions</h1>
        <p>Concierge asks only what it needs to recommend a service route and evidence checklist.</p>
      </section>
      <div class="property-select-layout">
        <section class="question-stack">
          <article class="question-card">
            <h2>${certificate ? "Which certificate or inspection do you need?" : issue ? "What is happening at the property?" : "How broad should the check be?"}</h2>
            <div class="option-grid">
              ${options
                .map(
                  ([id, label]) =>
                    `<button class="option-button ${state.selectedServiceId === id ? "is-selected" : ""}" type="button" data-service-choice="${id}">${label}</button>`,
                )
                .join("")}
            </div>
          </article>
          <article class="question-card">
            <h2>What should CMP prepare first?</h2>
            <div class="option-grid">
              ${["Booking details", "Evidence checklist", "Advisor review"]
                .map(
                  (label, index) =>
                    `<button class="option-button ${index === 0 ? "is-selected" : ""}" type="button">${label}</button>`,
                )
                .join("")}
            </div>
          </article>
          <article class="question-card">
            <h2>What access or evidence is already available?</h2>
            <div class="field-grid">
              <label class="field">
                <span>Access note</span>
                <input data-booking-field="accessNotes" value="${escapeHTML(state.booking.accessNotes)}" />
              </label>
              <label class="field">
                <span>Preferred time</span>
                <select data-booking-field="preferredTime">
                  ${selectOptions(["Weekday morning", "Weekday afternoon", "Evening if available", "Tenant to confirm"], state.booking.preferredTime)}
                </select>
              </label>
            </div>
          </article>
          <div class="button-row">
            <button class="primary-button" type="button" data-view="service-plan">Build service plan ${icon("arrow")}</button>
          </div>
        </section>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function servicePlanView() {
  const service = currentService();
  const property = currentProperty();
  const dominant = dominantAction(service);
  return `
    <main class="page">
      ${stepRail(["Home", "Choose need", "Property", "Questions", "Service plan"], 4)}
      <section class="plan-title">
        <h1>Service Plan</h1>
        <p>${property.address} · ${intentLabel()} · ${service.name}</p>
      </section>
      <div class="plan-layout">
        <section class="plan-sections" aria-label="Concierge service plan">
          ${planSection("Recommended route", service.name, service.helps, "inspection")}
          ${planSection("What CMP needs from you", "Prepare these before the next step", listMarkup(service.cmpNeeds), "documents")}
          ${planSection("Book or prepare request", dominant.title, dominant.text, "bell", dominant.button)}
          ${planSection("Evidence this should create", "Expected service outcome", service.evidenceProduces, "certificate")}
          ${planSection("Advisor support", service.advisor ? "Advisor review recommended" : "Advisor support optional", service.advisor ? "A CMP advisor can review the evidence picture before you proceed." : "You can still ask a CMP advisor if anything feels uncertain.", "advisor")}
          ${planSection("What happens next", "Concierge keeps the route moving", "Your request appears in My Requests with evidence needed, booking readiness and monitoring outcome.", "monitoring")}
        </section>
        <aside class="plan-summary">
          <div class="booking-readiness">
            <p class="route-meta">Booking readiness</p>
            <h2>${service.booking ? "Ready to prepare" : "Review first"}</h2>
            <div class="readiness-meter" aria-label="Booking readiness 76 percent"><span></span></div>
            <p class="fine-print">${service.price}</p>
          </div>
          ${contextPanel()}
        </aside>
      </div>
    </main>
    ${footerNote()}
  `;
}

function dominantAction(service) {
  if (service.id === "possession-review") {
    return {
      title: "Prepare evidence pack",
      text: "Summarise the reason, missing records and advisor questions before the call.",
      button: `<button class="primary-button" type="button" data-view="possession">Prepare evidence pack ${icon("arrow")}</button>`,
    };
  }
  if (service.intent === "documents" || service.id === "licensing") {
    return {
      title: "Upload evidence first",
      text: "Add documents so CMP can prepare a review summary and route the next action.",
      button: `<button class="primary-button" type="button" data-view="documents">Upload evidence first ${icon("arrow")}</button>`,
    };
  }
  if (service.id === "advisor-call") {
    return {
      title: "Speak to a CMP advisor",
      text: "Use a short advisor route before booking or uploading more evidence.",
      button: `<button class="primary-button" type="button" data-view="advisor">Speak to a CMP advisor ${icon("arrow")}</button>`,
    };
  }
  if (service.id === "monitoring") {
    return {
      title: "Start full property check",
      text: "Create a broader evidence checklist and monitoring reminder without forcing a certificate booking.",
      button: `<button class="primary-button" type="button" data-create-request="monitoring">Start full property check ${icon("arrow")}</button>`,
    };
  }
  return {
    title: "Prepare booking",
    text: "Prefill property and service details, then choose urgency, timing, access notes and contact preference.",
    button: `<button class="primary-button" type="button" data-view="booking">Prepare booking ${icon("arrow")}</button>`,
  };
}

function planSection(label, title, body, iconName, action = "") {
  return `
    <article class="plan-section">
      <span class="section-icon">${icon(iconName)}</span>
      <div>
        <p class="route-meta">${label}</p>
        <h2>${title}</h2>
        ${body.startsWith("<") ? body : `<p>${body}</p>`}
        ${action ? `<div class="button-row">${action}</div>` : ""}
      </div>
    </article>
  `;
}

function bookingView() {
  const service = currentService();
  const property = currentProperty();
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>Prepare booking</h1>
        <p>Property and service are prefilled. Add the practical details CMP needs before anything is sent onward.</p>
      </section>
      <div class="booking-layout">
        <section class="booking-panel">
          <div class="confirmation-box">
            <strong>${property.address}</strong>
            <span>${service.name}</span>
          </div>
          <div class="field-grid">
            <label class="field">
              <span>Urgency</span>
              <select data-booking-field="urgency">${selectOptions(["Within 48 hours", "Within 7 days", "This month", "Monitoring only"], state.booking.urgency)}</select>
            </label>
            <label class="field">
              <span>Preferred date/time</span>
              <select data-booking-field="preferredTime">${selectOptions(["Weekday morning", "Weekday afternoon", "Evening if available", "Tenant to confirm"], state.booking.preferredTime)}</select>
            </label>
            <label class="field">
              <span>Contact preference</span>
              <select data-booking-field="contactPreference">${selectOptions(["Email then phone", "Phone first", "Email only", "Advisor to confirm"], state.booking.contactPreference)}</select>
            </label>
            <label class="field">
              <span>Existing contractor</span>
              <select data-booking-field="contractor">${selectOptions(["No, please help me prepare options", "Yes, I have a contractor", "Tenant has suggested one", "Not sure"], state.booking.contractor)}</select>
            </label>
          </div>
          <label class="field">
            <span>Access notes</span>
            <textarea data-booking-field="accessNotes">${escapeHTML(state.booking.accessNotes)}</textarea>
          </label>
          <div class="confirmation-box">
            <strong>Booking details ready</strong>
            <span>No supplier contacted yet</span>
            <span>No payment taken</span>
            <span>Expected evidence outcome: ${service.evidenceProduces}</span>
            <span>${service.advisor ? "Advisor review option is recommended." : "Advisor review option is available."}</span>
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-create-request="booking">Save to My Requests ${icon("arrow")}</button>
          </div>
        </section>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function documentsView() {
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>I need my documents checked</h1>
        <p>Upload or choose documents, confirm the suggested match, and prepare a reviewable request.</p>
      </section>
      <div class="document-layout">
        <section class="question-stack">
          <div class="document-drop">
            <div>
              <span class="section-icon">${icon("documents")}</span>
              <h2>Drop files here or choose a sample document</h2>
              <p class="fine-print">No real upload is needed for this prototype.</p>
              <div class="button-row">
                ${["Tenancy agreement", "Certificates", "Deposit evidence", "Inspection photos"].map((label) => `<button class="dangerless-button" type="button" data-document-type="${label}">${label}</button>`).join("")}
              </div>
            </div>
          </div>
          <article class="question-card document-summary">
            <p class="route-meta">Suggested match</p>
            <h2>${state.documentType}</h2>
            <p>Document added to this request. CMP can use this to prepare the next step.</p>
            <ul class="evidence-list">
              <li>Ready for advisor review</li>
              <li>Renewal reminder can be added if a certificate date is found</li>
              <li>May route to service booking, advisor review or full property check</li>
            </ul>
            <div class="button-row">
              <button class="primary-button" type="button" data-create-request="documents">Create document check summary ${icon("arrow")}</button>
            </div>
          </article>
        </section>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function possessionView() {
  const questions = [
    ["reason", "Why are you considering possession?", ["Rent arrears", "Anti-social behaviour", "Property sale", "Tenancy breach", "Not sure / need advice"]],
    ["tenantInProperty", "Is the tenant currently in the property?", ["Yes", "No", "Not sure"]],
    ["tenancyType", "What type of tenancy do you have?", ["Assured shorthold tenancy", "Periodic tenancy", "Company let", "Not sure"]],
    ["noticeServed", "Has any notice already been served?", ["No", "Yes", "Not sure"]],
    ["rentArrears", "Are there rent arrears?", ["Yes", "No", "Not sure"]],
    ["repairComplaints", "Are there repair or damp/mould complaints?", ["No", "Possible damp/mould complaint", "Repair complaint raised", "Not sure"]],
    ["depositTaken", "Was a deposit taken?", ["Yes", "No", "Not sure"]],
    ["depositEvidence", "Is deposit evidence available?", ["Available", "Not uploaded yet", "Not sure"]],
    ["tenancyAgreement", "Is the tenancy agreement available?", ["Available", "Not uploaded yet", "Not sure"]],
    ["epcEvidence", "Is EPC evidence available?", ["Available", "Needs checking", "Not sure"]],
    ["gasEvidence", "Is Gas Safety evidence available?", ["Available", "Needs checking", "Not sure"]],
    ["howToRentEvidence", "Is How to Rent evidence available where relevant?", ["Available", "Not uploaded yet", "Not sure"]],
    ["advisorReview", "Do you want a CMP advisor to review the file?", ["Yes", "No", "Not sure"]],
  ];
  const missing = possessionMissingEvidence();
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>Prepare possession evidence</h1>
        <p>Check what evidence CMP needs before possession advice. This route prepares a review pack; it does not make a legal decision.</p>
      </section>
      <div class="property-select-layout">
        <section class="question-stack">
          ${questions
            .map(
              ([key, question, options]) => `
                <article class="question-card">
                  <h2>${question}</h2>
                  <div class="option-grid">
                    ${options
                      .map(
                        (option) =>
                          `<button class="option-button ${state.possession[key] === option ? "is-selected" : ""}" type="button" data-possession-key="${key}" data-possession-value="${escapeHTML(option)}">${option}</button>`,
                      )
                      .join("")}
                  </div>
                </article>
              `,
            )
            .join("")}
        </section>
        <aside class="plan-summary">
          <div class="booking-readiness">
            <p class="route-meta">Evidence readiness summary</p>
            <h2>${missing.length ? `${missing.length} item${missing.length === 1 ? "" : "s"} to prepare` : "Evidence ready for review"}</h2>
            ${listMarkup(missing.length ? missing : ["Advisor can review the file summary", "Document upload prompt is ready"])}
            <div class="button-row">
              <button class="primary-button" type="button" data-create-request="possession">Prepare evidence pack ${icon("arrow")}</button>
            </div>
          </div>
          <div class="advisor-strip">
            <div>
              <strong>Advisor review recommended</strong>
              <p class="fine-print">Use this summary before speaking to a CMP advisor. Guidance only, not legal advice.</p>
            </div>
            <button class="dangerless-button" type="button" data-view="advisor">Ask a human to review this</button>
          </div>
        </aside>
      </div>
    </main>
    ${footerNote()}
  `;
}

function advisorView() {
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>Speak to a CMP advisor</h1>
        <p>Use a human support route when the evidence picture is uncertain or the landlord wants guidance before booking.</p>
      </section>
      <div class="booking-layout">
        <section class="booking-panel">
          <div class="field-grid">
            <label class="field">
              <span>Reason for call</span>
              <select>${selectOptions(["Not sure which service to book", "Possession evidence review", "Damp/mould concern", "Document check", "Full property check"], "Not sure which service to book")}</select>
            </label>
            <label class="field">
              <span>Contact preference</span>
              <select>${selectOptions(["Book a quick call", "Email summary first", "Phone first"], "Book a quick call")}</select>
            </label>
          </div>
          <label class="field">
            <span>What should the advisor know?</span>
            <textarea>The landlord wants guidance before booking and has asked CMP to review the evidence route.</textarea>
          </label>
          <div class="confirmation-box">
            <strong>Advisor brief ready</strong>
            <span>Ask a human to review this before a service route is confirmed.</span>
            <span>Concierge will keep the request in My Requests.</span>
          </div>
          <button class="primary-button" type="button" data-create-request="advisor">Book a quick call ${icon("arrow")}</button>
        </section>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function requestsView() {
  const requests = state.requests;
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>My Requests</h1>
        <p>Service and advisor cases stay here with evidence needed, booking readiness and next step.</p>
      </section>
      <div class="requests-layout">
        <section class="question-stack">
          ${
            requests.length
              ? requests.map(requestCard).join("")
              : `<div class="empty-panel">
                  <h2>No request created yet</h2>
                  <p>Open the example service plan or prepare a booking to seed one clear service/advisor case.</p>
                  <button class="primary-button" type="button" data-example="service-plan">Open example service plan ${icon("arrow")}</button>
                </div>`
          }
        </section>
        ${contextPanel()}
      </div>
    </main>
    ${footerNote()}
  `;
}

function requestCard(request) {
  return `
    <article class="request-card">
      <header>
        <div>
          <p class="route-meta">${request.route}</p>
          <h2>${request.service}</h2>
        </div>
        <span class="status-chip is-coral">${request.status}</span>
      </header>
      <p>${request.property}</p>
      <ul class="evidence-list">
        <li>Evidence needed: ${request.evidenceNeeded}</li>
        <li>Booking readiness: ${request.bookingReadiness}</li>
        <li>Advisor recommendation: ${request.advisor}</li>
        <li>Next step: ${request.nextStep}</li>
      </ul>
      <div class="button-row">
        <button class="dangerless-button" type="button" data-view="service-plan">Open service plan</button>
      </div>
    </article>
  `;
}

function propertiesView() {
  const property = currentProperty();
  const count = state.requests.length;
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>My Properties</h1>
        <p>Properties stay secondary to service requests. The property links back to related Concierge cases.</p>
      </section>
      <article class="property-card is-large">
        <header>
          <div>
            <p class="route-meta">Property file</p>
            <h2>${property.address}</h2>
          </div>
          <span class="status-chip is-blue">${count || 1} related request${(count || 1) === 1 ? "" : "s"}</span>
        </header>
        <p>${property.notes}</p>
        <ul class="evidence-list">
          <li>Linked route: ${count ? state.requests[0].service : "Example service plan available"}</li>
          <li>Monitoring outcome: reminders can be created after evidence or service action</li>
          <li>Next step: ${count ? state.requests[0].nextStep : "Get help with a property"}</li>
        </ul>
        <div class="button-row">
          <button class="primary-button" type="button" data-view="requests">View related requests ${icon("arrow")}</button>
        </div>
      </article>
    </main>
    ${footerNote()}
  `;
}

function askView() {
  return `
    <main class="page">
      <section class="screen-heading">
        <h1>Ask CMP</h1>
        <p>Use the assistant to route a need, then move to booking preparation, document review or a human advisor.</p>
      </section>
      <div class="booking-layout">
        ${askPanel(true)}
        <aside class="advisor-strip">
          <div>
            <strong>Human help stays prominent</strong>
            <p class="fine-print">Not sure? Get guidance before booking or ask a human to review this request.</p>
          </div>
          <button class="primary-button" type="button" data-view="advisor">Speak to a CMP advisor</button>
        </aside>
      </div>
    </main>
    ${footerNote()}
  `;
}

function contextPanel() {
  return askPanel(false);
}

function askPanel(full) {
  return `
    <aside class="ask-panel" aria-label="Ask CMP">
      <h2>Ask CMP</h2>
      <p class="fine-print">Describe the situation. Concierge gives deterministic guidance for this prototype.</p>
      <div class="prompt-list">
        ${["Which service do I need?", "What evidence should I gather?", "Should I speak to an advisor?"]
          .map((prompt) => `<button class="prompt-button" type="button" data-ask-prompt="${prompt}">${prompt}</button>`)
          .join("")}
      </div>
      <label class="field">
        <span>Your question</span>
        <textarea class="ask-input" data-ask-input placeholder="Type what is happening with the property">${escapeHTML(state.askInput)}</textarea>
      </label>
      <button class="${full ? "primary-button" : "dangerless-button"}" type="button" data-ask-submit>Get guidance</button>
      <div class="ask-response">${state.askResponse}</div>
      <button class="text-button" type="button" data-view="advisor">Speak to a CMP advisor</button>
    </aside>
  `;
}

function stepRail(labels, activeIndex) {
  return `
    <div class="step-rail" aria-label="Concierge progress">
      ${labels.map((label, index) => `<span class="step-chip ${index === activeIndex ? "is-blue" : ""}">${label}</span>`).join("")}
    </div>
  `;
}

function listMarkup(items) {
  return `<ul class="evidence-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function selectOptions(options, selected) {
  return options.map((option) => `<option ${option === selected ? "selected" : ""}>${option}</option>`).join("");
}

function intentLabel() {
  const route = routeIntents.find((intent) => intent.id === state.selectedIntent);
  return route ? route.title : "Landlord compliance help, routed to the right service.";
}

function possessionMissingEvidence() {
  const missing = [];
  if (state.possession.depositEvidence !== "Available") missing.push("Deposit evidence upload");
  if (state.possession.tenancyAgreement !== "Available") missing.push("Tenancy agreement upload");
  if (state.possession.epcEvidence !== "Available") missing.push("EPC evidence check");
  if (state.possession.gasEvidence !== "Available") missing.push("Gas Safety evidence check");
  if (state.possession.howToRentEvidence !== "Available") missing.push("How to Rent evidence where relevant");
  if (state.possession.repairComplaints !== "No") missing.push("Repair or damp/mould complaint timeline");
  return missing;
}

function createRequest(kind) {
  const service = currentService();
  const property = currentProperty();
  let request = {
    id: `request-${Date.now()}`,
    property: property.address,
    route: intentLabel(),
    service: service.name,
    status: "Booking details ready",
    evidenceNeeded: service.cmpNeeds.join(", "),
    bookingReadiness: service.booking ? "Ready to prepare" : "Advisor or evidence first",
    advisor: service.advisor ? "Recommended" : "Available",
    nextStep: "Prepare booking",
  };

  if (kind === "documents") {
    request = {
      ...request,
      route: "I need my documents checked",
      service: "Document check summary",
      status: "Ready for advisor review",
      evidenceNeeded: `${state.documentType}, certificates, deposit evidence or inspection photos`,
      bookingReadiness: "Upload evidence first",
      advisor: "Recommended",
      nextStep: "Ask a human to review this",
    };
  }

  if (kind === "possession") {
    request = {
      ...request,
      route: "Possession preparation",
      service: "Possession evidence review",
      status: "Evidence ready for review",
      evidenceNeeded: possessionMissingEvidence().join(", ") || "Advisor file summary",
      bookingReadiness: "Advisor review before service booking",
      advisor: "Recommended",
      nextStep: "Prepare evidence pack",
    };
  }

  if (kind === "advisor") {
    request = {
      ...request,
      route: "Advisor support",
      service: "Advisor call",
      status: "Advisor brief ready",
      evidenceNeeded: "Main concern and current evidence",
      bookingReadiness: "Book a quick call",
      advisor: "Requested",
      nextStep: "Speak to a CMP advisor",
    };
  }

  if (kind === "monitoring") {
    request = {
      ...request,
      route: "Full property check",
      service: "Compliance monitoring",
      status: "Monitoring reminder drafted",
      evidenceNeeded: "Known certificate dates and landlord confirmed records",
      bookingReadiness: "Start full property check",
      advisor: "Available",
      nextStep: "Create monitoring reminder",
    };
  }

  state.requests = [request];
  state.booking.ready = true;
  state.view = "requests";
  saveState();
  render();
}

function seedExamplePlan() {
  state.selectedIntent = "issue";
  state.selectedServiceId = "damp-mould";
  state.requests = [
    {
      id: "example-damp-mould",
      property: currentProperty().address,
      route: "Property issue",
      service: "Damp/mould inspection",
      status: "Service request drafted",
      evidenceNeeded: "Affected rooms, tenant complaint history, recent photos",
      bookingReadiness: "Prepare booking",
      advisor: "Recommended",
      nextStep: "Prepare booking",
    },
  ];
  state.view = "service-plan";
  saveState();
  render();
}

function askResponseFor(input) {
  const value = input.toLowerCase();
  if (value.includes("advisor") || value.includes("not sure")) {
    return "Speak to a CMP advisor. Bring the property address, the main concern and any documents already held so the advisor can route the next step.";
  }
  if (value.includes("evidence") || value.includes("document")) {
    return "Upload evidence first. CMP will suggest a document type, add it to this request and prepare a review summary.";
  }
  if (value.includes("possession") || value.includes("arrears")) {
    return "Prepare possession evidence before speaking to an advisor. CMP will list missing records and create an evidence pack prompt.";
  }
  if (value.includes("gas") || value.includes("epc") || value.includes("eicr") || value.includes("certificate")) {
    return "Book a certificate or inspection route. CMP needs access notes, preferred timing and any current certificate evidence.";
  }
  if (value.includes("damp") || value.includes("mould") || value.includes("repair")) {
    return "Prepare a property inspection route. CMP needs affected rooms, complaint history, access details and recent photos.";
  }
  return "Start with Get help with a property. CMP will route this to a service plan, evidence checklist and advisor option.";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function footerNote() {
  return `<footer class="footer-note">CMP Concierge prototype. No API keys added. Guidance only, not legal advice.</footer>`;
}

function routeFromIntent(intent) {
  state.selectedIntent = intent;
  if (intent === "certificate") state.selectedServiceId = "gas";
  if (intent === "issue") state.selectedServiceId = "damp-mould";
  if (intent === "possession") state.selectedServiceId = "possession-review";
  if (intent === "documents") state.selectedServiceId = "tenant-docs";
  if (intent === "full-check") state.selectedServiceId = "monitoring";
  state.view = intent === "possession" ? "possession" : intent === "documents" ? "documents" : "property-select";
  saveState();
  render();
}

function render() {
  const views = {
    home: homeView,
    "route-select": routeSelectView,
    "property-select": propertySelectView,
    questions: questionsView,
    "service-plan": servicePlanView,
    booking: bookingView,
    documents: documentsView,
    possession: possessionView,
    advisor: advisorView,
    requests: requestsView,
    properties: propertiesView,
    ask: askView,
  };
  const view = views[state.view] || homeView;
  app.innerHTML = `${header()}${view()}`;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const view = button.dataset.view;
  const intent = button.dataset.intent;
  const serviceId = button.dataset.service || button.dataset.serviceChoice;
  const documentType = button.dataset.documentType;
  const possessionKey = button.dataset.possessionKey;
  const prompt = button.dataset.askPrompt;
  const create = button.dataset.createRequest;

  if (view) {
    state.view = view;
    saveState();
    render();
    return;
  }

  if (intent) {
    routeFromIntent(intent);
    return;
  }

  if (button.dataset.example) {
    seedExamplePlan();
    return;
  }

  if (button.hasAttribute("data-next-after-property")) {
    state.view = "questions";
    saveState();
    render();
    return;
  }

  if (serviceId) {
    state.selectedServiceId = serviceId;
    const service = services.find((item) => item.id === serviceId);
    if (button.dataset.service) {
      state.selectedIntent = service?.intent || state.selectedIntent;
      state.view = "service-plan";
    }
    saveState();
    render();
    return;
  }

  if (documentType) {
    state.documentType = documentType;
    saveState();
    render();
    return;
  }

  if (possessionKey) {
    state.possession[possessionKey] = button.dataset.possessionValue;
    saveState();
    render();
    return;
  }

  if (prompt) {
    state.askInput = prompt;
    state.askResponse = askResponseFor(prompt);
    saveState();
    render();
    return;
  }

  if (button.hasAttribute("data-ask-submit")) {
    const input = document.querySelector("[data-ask-input]");
    state.askInput = input?.value || "";
    state.askResponse = askResponseFor(state.askInput);
    saveState();
    render();
    return;
  }

  if (create) {
    createRequest(create);
  }
});

document.addEventListener("input", (event) => {
  const field = event.target;
  if (field.matches("[data-booking-field]")) {
    state.booking[field.dataset.bookingField] = field.value;
    saveState();
  }
  if (field.matches("[data-ask-input]")) {
    state.askInput = field.value;
    saveState();
  }
});

render();
