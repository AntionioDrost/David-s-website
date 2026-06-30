const optimized = "./assets/optimized/";

const assets = {
  logo: `${optimized}logo-grey-live.png`,
  colourLogo: `${optimized}logo-colour-horizontal.png`,
  heroWide: `${optimized}homepage-origami-house-wide.webp`,
  heroCropped: `${optimized}homepage-origami-house-cropped.webp`,
  warningEpc: `${optimized}homepage-warning-epc.webp`,
  warningSolicitor: `${optimized}homepage-warning-solicitor.webp`,
  dashboard: `${optimized}homepage-dashboard-overview.webp`,
  complianceTile: `${optimized}service-compliance-checker-tile.webp`,
  epcTile: `${optimized}service-epc-tile.webp`,
  amlTile: `${optimized}service-aml-tile.webp`,
  licensingTile: `${optimized}service-selective-licensing-tile.webp`,
  mortgagesTile: `${optimized}service-mortgages-tile.webp`,
  insuranceTile: `${optimized}service-landlord-insurance-tile.webp`,
  supportLost: `${optimized}support-feel-lost.webp`,
  supportOvercomplicating: `${optimized}support-overcomplicating.webp`,
  supportEpc: `${optimized}support-epc-big-tile.webp`,
  tick: `${optimized}tick-green.png`,
};

const serviceIcons = {
  epc: `${optimized}service-icon-epc.webp`,
  gas: `${optimized}service-icon-gas.webp`,
  eicr: `${optimized}service-icon-eicr.webp`,
  inspections: `${optimized}service-icon-property-inspections.webp`,
  aml: `${optimized}service-icon-aml.webp`,
  monitoring: `${optimized}service-compliance-checker-tile.webp`,
  tenant: `${optimized}service-icon-evictions-possession.webp`,
  licensing: `${optimized}service-icon-selective-licensing.webp`,
  hmo: `${optimized}service-icon-selective-licensing.webp`,
  mould: `${optimized}service-icon-property-inspections.webp`,
  rent: `${optimized}service-icon-evictions-possession.webp`,
  possession: `${optimized}service-icon-evictions-possession.webp`,
  insurance: assets.insuranceTile,
  mortgages: assets.mortgagesTile,
  tax: `${optimized}service-icon-aml.webp`,
  advisory: `${optimized}service-icon-property-inspections.webp`,
};

const serviceTiles = {
  epc: assets.epcTile,
  gas: `${optimized}gas-card-what-is-gas-safety.webp`,
  eicr: `${optimized}eicr-card-legally-important.webp`,
  inspections: `${optimized}property-inspections-main-tile.webp`,
  aml: assets.amlTile,
  monitoring: assets.complianceTile,
  tenant: assets.warningSolicitor,
  licensing: assets.licensingTile,
  hmo: assets.licensingTile,
  mould: assets.supportOvercomplicating,
  rent: assets.supportLost,
  possession: `${optimized}possession-section-21.webp`,
  insurance: assets.insuranceTile,
  mortgages: assets.mortgagesTile,
  tax: `${optimized}aml-note.webp`,
  advisory: assets.supportEpc,
};

const serviceMedia = {
  epc: [
    ["What is an EPC?", `${optimized}epc-card-what-is-an-epc.webp`],
    ["Know your rating instantly", `${optimized}epc-card-know-your-rating.webp`],
    ["Upgrade guidance", `${optimized}epc-card-upgrade-guidance.webp`],
  ],
  gas: [
    ["Why it matters", `${optimized}gas-card-why-it-matters.webp`],
    ["Paperwork kept together", `${optimized}gas-card-paperwork.webp`],
    ["Track the renewal", `${optimized}gas-card-track-it.webp`],
  ],
  eicr: [
    ["Electrical report context", `${optimized}eicr-section-strip.webp`],
    ["Legally important", `${optimized}eicr-card-legally-important.webp`],
    ["No guesswork", `${optimized}eicr-card-no-guesswork.webp`],
  ],
  inspections: [
    ["Property inspection route", `${optimized}property-inspections-main-tile.webp`],
    ["Evidence helps", `${optimized}inspection-card-evidence-helps.webp`],
    ["Stay informed", `${optimized}inspection-card-stay-informed.webp`],
  ],
  aml: [
    ["Identity notes", `${optimized}aml-note.webp`],
    ["Red flags to review", `${optimized}aml-red-flags.webp`],
    ["Transaction record support", `${optimized}aml-strip-money.jpg`],
  ],
  licensing: [
    ["Selective licensing", assets.licensingTile],
    ["Local guidance route", `${optimized}service-icon-selective-licensing.webp`],
    ["Document support", assets.supportLost],
  ],
  possession: [
    ["Section 21 information", `${optimized}possession-section-21.webp`],
    ["Section 8 routes", `${optimized}possession-section-8-routes.webp`],
    ["Advisor review available", assets.supportLost],
  ],
};

const services = [
  {
    id: "epc",
    title: "EPC Certificates & Rating Improvements",
    shortTitle: "EPC certificates",
    promise: "Check whether an EPC is held, nearing renewal or needs improvement planning.",
    choices: ["I need a new EPC", "I have an EPC to upload", "I need rating improvement guidance"],
    checks: ["Certificate date", "Current rating", "Improvement notes", "Renewal reminder"],
    documents: ["Current EPC", "Previous EPC", "Improvement quote", "Property details"],
    booking: "Book EPC assessment",
    related: ["gas", "eicr", "monitoring"],
  },
  {
    id: "gas",
    title: "Gas Safety Certificates & Renewals",
    shortTitle: "Gas safety",
    promise: "Keep gas safety evidence, renewal reminders and service booking in one place.",
    choices: ["My certificate is due", "I cannot find the certificate", "I need a reminder"],
    checks: ["Certificate date", "Appliance notes", "Renewal window", "Saved proof"],
    documents: ["Gas Safety certificate", "Engineer notes", "Previous renewal", "Tenant access notes"],
    booking: "Book Gas Safety check",
    related: ["eicr", "inspections", "monitoring"],
  },
  {
    id: "eicr",
    title: "Electrical Installation Condition Reports (EICR)",
    shortTitle: "EICR",
    promise: "Track the electrical report, renewal timing and any follow-up works.",
    choices: ["I need an EICR", "I have observations to resolve", "I need renewal tracking"],
    checks: ["Report date", "Outcome", "Remedial notes", "Renewal reminder"],
    documents: ["EICR report", "Remedial certificate", "Contractor invoice", "Access notes"],
    booking: "Book EICR",
    related: ["gas", "epc", "monitoring"],
  },
  {
    id: "inspections",
    title: "Property Inspections & Condition Reporting",
    shortTitle: "Property inspections",
    promise: "Record property condition, smoke and CO alarm notes, damp signs and visit history.",
    choices: ["I need an inspection", "I want to upload photos", "I need a condition report"],
    checks: ["Visit date", "Condition notes", "Photo evidence", "Follow-up actions"],
    documents: ["Inspection report", "Photos", "Contractor notes", "Tenant communications"],
    booking: "Book property inspection",
    related: ["mould", "gas", "eicr"],
  },
  {
    id: "aml",
    title: "AML Checks & Identity Verification",
    shortTitle: "AML checks",
    promise: "Prepare identity and ownership checks for property transactions and services.",
    choices: ["I need identity checks", "I need document review", "I need advisor guidance"],
    checks: ["Identity documents", "Ownership context", "Address match", "Review status"],
    documents: ["Photo ID", "Proof of address", "Ownership documents", "Company details"],
    booking: "Start AML check",
    related: ["mortgages", "advisory", "insurance"],
  },
  {
    id: "monitoring",
    title: "Compliance Monitoring & Deadline Tracking",
    shortTitle: "Monitoring",
    promise: "Keep renewal dates, missing proof and service follow-ups visible.",
    choices: ["I want reminders", "I want all dates in one place", "I need a team review"],
    checks: ["Renewal dates", "Missing proof", "Open service requests", "Next action"],
    documents: ["Certificates", "Inspection reports", "Service notes", "Advisor notes"],
    booking: "Set up monitoring",
    related: ["epc", "gas", "eicr"],
  },
  {
    id: "tenant",
    title: "Tenant Documentation & Legal Support",
    shortTitle: "Tenant documents",
    promise: "Organise tenancy records, tenant communications and documents for advisor review.",
    choices: ["I need to organise documents", "I need advisor support", "I need a document checklist"],
    checks: ["Tenancy agreement", "Deposit evidence", "Tenant communications", "Guide evidence"],
    documents: ["Tenancy agreement", "Deposit proof", "How to Rent evidence", "Messages"],
    booking: "Request document support",
    related: ["possession", "advisory", "inspections"],
  },
  {
    id: "licensing",
    title: "Selective Licensing Guidance",
    shortTitle: "Selective licensing",
    promise: "Understand whether local licensing questions need human review.",
    choices: ["I am unsure about licensing", "I have a licence to upload", "I need local guidance"],
    checks: ["Local authority", "Property use", "Licence evidence", "Review notes"],
    documents: ["Licence document", "Application reference", "Property details", "Council notes"],
    booking: "Request licensing guidance",
    related: ["hmo", "advisory", "monitoring"],
  },
  {
    id: "hmo",
    title: "HMO/Licensing Review",
    shortTitle: "HMO review",
    promise: "Prepare occupancy and property-use information for a licensing review.",
    choices: ["I need HMO review", "The property use changed", "I want advisor support"],
    checks: ["Occupancy", "Layout notes", "Council context", "Evidence held"],
    documents: ["Floor plan", "Tenancy details", "Licence proof", "Council letters"],
    booking: "Request HMO review",
    related: ["licensing", "advisory", "inspections"],
  },
  {
    id: "mould",
    title: "Mould & Damp Support",
    shortTitle: "Mould and damp",
    promise: "Create a clear record of damp signs, repairs, communication and next steps.",
    choices: ["Tenant reported damp", "I need inspection evidence", "I need repair follow-up"],
    checks: ["Photos", "Repair history", "Tenant messages", "Inspection notes"],
    documents: ["Photos", "Repair invoices", "Inspection report", "Messages"],
    booking: "Request mould and damp support",
    related: ["inspections", "tenant", "advisory"],
  },
  {
    id: "rent",
    title: "Rent Guarantee",
    shortTitle: "Rent guarantee",
    promise: "Understand what records may be needed before requesting rent guarantee support.",
    choices: ["I want cover guidance", "I have arrears concerns", "I need documents checked"],
    checks: ["Tenancy records", "Payment history", "Property file gaps", "Advisor notes"],
    documents: ["Tenancy agreement", "Rent schedule", "Property documents", "Communications"],
    booking: "Request rent guarantee support",
    related: ["insurance", "possession", "tenant"],
  },
  {
    id: "possession",
    title: "Possession & Eviction Preparation",
    shortTitle: "Possession & eviction preparation",
    promise: "Prepare your evidence before speaking to an advisor and keep the file organised for review.",
    choices: [
      "Prepare your evidence before speaking to an advisor",
      "Check what documents may be needed",
      "Build an evidence pack for review",
    ],
    checks: ["Tenancy evidence", "Deposit evidence", "Certificate evidence", "Communication record"],
    documents: ["Tenancy agreement", "Deposit documents", "EPC and Gas Safety proof", "Tenant communications"],
    booking: "Advisor review available",
    related: ["tenant", "rent", "advisory"],
    careful: true,
  },
  {
    id: "insurance",
    title: "Landlord Insurance",
    shortTitle: "Landlord insurance",
    promise: "Collect property and document information before discussing landlord cover.",
    choices: ["I need cover guidance", "I want my documents ready", "I need to compare next steps"],
    checks: ["Property details", "Existing cover", "Certificate gaps", "Claim notes"],
    documents: ["Policy schedule", "Property details", "Certificates", "Correspondence"],
    booking: "Request insurance support",
    related: ["rent", "mortgages", "advisory"],
  },
  {
    id: "mortgages",
    title: "Mortgages",
    shortTitle: "Mortgages",
    promise: "Prepare property and landlord information before a mortgage conversation.",
    choices: ["I need mortgage support", "I want documents organised", "I need advisor guidance"],
    checks: ["Property details", "Rental context", "Ownership notes", "Document readiness"],
    documents: ["Mortgage statement", "Rental schedule", "Property documents", "ID documents"],
    booking: "Request mortgage support",
    related: ["aml", "insurance", "advisory"],
  },
  {
    id: "tax",
    title: "Making Tax Digital",
    shortTitle: "Making Tax Digital",
    promise: "Organise property records so tax support starts from a clearer file.",
    choices: ["I need records organised", "I want advisor guidance", "I need document support"],
    checks: ["Income records", "Expense records", "Property documents", "Advisor notes"],
    documents: ["Rental statements", "Invoices", "Mortgage interest records", "Property costs"],
    booking: "Request tax record support",
    related: ["advisory", "mortgages", "insurance"],
  },
  {
    id: "advisory",
    title: "Landlord Compliance Strategy & Advisory",
    shortTitle: "Compliance advisory",
    promise: "Speak to someone when you are unsure what the next practical step should be.",
    choices: ["I am unsure what to do", "I need a review", "I want a property plan"],
    checks: ["Property file", "Open questions", "Missing documents", "Next step"],
    documents: ["Existing certificates", "Tenancy records", "Inspection notes", "Service history"],
    booking: "Request advisor callback",
    related: ["monitoring", "tenant", "possession"],
  },
];

const helpTopics = [
  { id: "epc", title: "Check EPC or energy rating", text: "Start with EPC evidence, rating improvement or renewal help.", image: assets.epcTile },
  { id: "gas", title: "Book or upload Gas Safety", text: "Keep the certificate, renewal date and service route together.", image: `${optimized}gas-card-know-status.webp` },
  { id: "eicr", title: "Check EICR position", text: "Track electrical evidence, remedial notes and renewal timing.", image: `${optimized}eicr-card-no-guesswork.webp` },
  { id: "inspections", title: "Arrange property inspection", text: "Record condition, alarm notes, photos and follow-up actions.", image: `${optimized}inspection-card-evidence-helps.webp` },
  { id: "licensing", title: "Check licensing questions", text: "Prepare local authority, HMO or selective licensing evidence.", image: assets.licensingTile },
  { id: "possession", title: "Possession & eviction preparation", text: "Prepare documents for advisor review without overclaiming the outcome.", image: `${optimized}possession-section-21.webp` },
];

const generatedAddresses = [
  "18 Victoria Street, London, SW1A 1AA",
  "22 Victoria Street, London, SW1A 1AA",
  "Flat 3, 24 Victoria Street, London, SW1A 1AA",
  "Garden Flat, 26 Victoria Street, London, SW1A 1AA",
];

const state = {
  view: "home",
  selectedServiceId: "epc",
  flowStep: "postcode",
  postcode: "",
  addressOptions: [],
  selectedAddress: "18 Victoria Street, London, SW1A 1AA",
  selectedNeedId: "epc",
  situation: "I have a document to upload and want CMP to help organise it.",
  serviceInProgress: "EPC evidence review",
  uploadedDocument: false,
};

const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageHtml({ src, alt = "", className = "", width, height, loading = "lazy" }) {
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  const widthAttr = width ? ` width="${width}"` : "";
  const heightAttr = height ? ` height="${height}"` : "";
  const loadingAttr = loading ? ` loading="${loading}"` : "";
  return `<img${classAttr} src="${src}" alt="${escapeHtml(alt)}"${widthAttr}${heightAttr} decoding="async"${loadingAttr}>`;
}

function serviceById(id) {
  return services.find((service) => service.id === id) || services[0];
}

function setView(view, options = {}) {
  Object.assign(state, options, { view });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startFlow(needId = state.selectedNeedId, serviceInProgress = "") {
  state.flowStep = "postcode";
  state.postcode = "";
  state.addressOptions = [];
  state.uploadedDocument = false;
  state.selectedNeedId = needId;
  state.serviceInProgress = serviceInProgress || `${serviceById(needId).shortTitle} support`;
  setView("check");
}

function completeFlow() {
  const service = serviceById(state.selectedNeedId);
  state.serviceInProgress = `${service.shortTitle} review`;
  setView("dashboard");
}

function render() {
  app.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderView()}
    </main>
    ${renderFooter()}
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="site-header">
      <div class="header-inner">
        <button class="brand-button" type="button" data-view="home" aria-label="Go to ComplyMyProperty home">
          ${imageHtml({ src: assets.logo, alt: "ComplyMyProperty.com", className: "brand-logo", width: 1304, height: 168, loading: "" })}
        </button>
        <nav class="header-nav" aria-label="Primary navigation">
          <button type="button" data-view="home">Home</button>
          <button type="button" data-view="services">Services</button>
          <button type="button" data-flow-start="epc">Check your property</button>
          <button type="button" data-view="properties">My Properties</button>
        </nav>
        <button class="primary-button header-cta" type="button" data-flow-start="epc">Check your property</button>
      </div>
    </header>
  `;
}

function renderView() {
  if (state.view === "services") return renderServicesHub();
  if (state.view === "service") return renderServicePage(serviceById(state.selectedServiceId));
  if (state.view === "check") return renderCheckFlow();
  if (state.view === "properties") return renderMyProperties();
  if (state.view === "dashboard") return renderDashboard();
  return renderHome();
}

function renderHome() {
  return `
    <section class="hero-section">
      <div class="hero-copy">
        <h1>Landlord compliance made simple.</h1>
        <p class="hero-line">Check your property. Fix the gaps. Store the proof.</p>
        <p class="hero-support">
          Built for private landlords. No subscription fee. Start with one service, check a property, or build your compliance picture at your own pace.
        </p>
        <div class="hero-actions" aria-label="Homepage actions">
          <button class="primary-button" type="button" data-flow-start="epc">Check your property</button>
          <button class="secondary-button" type="button" data-view="services">Start with one service</button>
          <button class="plain-link" type="button" data-view="properties">My Properties</button>
        </div>
      </div>
      <div class="hero-media">
        ${imageHtml({ src: assets.heroWide, alt: "Paper origami house and property documents", className: "hero-image", width: 3456, height: 1071, loading: "" })}
        <div class="hero-check-panel">
          <span>Find Address</span>
          <strong>Start with a postcode, choose the address, then decide what needs attention.</strong>
        </div>
      </div>
    </section>

    <section class="what-section" aria-labelledby="what-cmp-does">
      <div class="section-heading split-heading">
        <div>
          <p class="section-label">What CMP does</p>
          <h2 id="what-cmp-does">Simple compliance steps for real landlord jobs.</h2>
        </div>
        <p>Check a property, fix the gaps, and store the proof without turning every task into a separate admin trail.</p>
      </div>
      <div class="what-grid">
        ${renderWhatCard("Check", "Start from a property address and see which records may need attention.", assets.complianceTile)}
        ${renderWhatCard("Fix", "Move straight into EPC, Gas Safety, EICR, licensing, AML or advisor support.", assets.warningEpc)}
        ${renderWhatCard("Store", "Secure document storage keeps proof, reminders and service notes connected.", assets.dashboard)}
      </div>
    </section>

    <section class="decision-section">
      <div class="section-heading">
        <p class="section-label">Start here</p>
        <h2>What do you need help with today?</h2>
        <p>CMP keeps service choices, property checks, documents and human support connected to one property record.</p>
      </div>
      <div class="choice-grid">
        ${helpTopics.map(renderHelpTopicCard).join("")}
      </div>
    </section>

    <section class="service-preview-section">
      <div class="section-heading split-heading">
        <div>
          <p class="section-label">Full service list</p>
          <h2>Start with one service, then keep the record together.</h2>
        </div>
        <button class="secondary-button" type="button" data-view="services">View all services</button>
      </div>
      <div class="service-grid compact">
        ${services.slice(0, 8).map((service) => renderServiceCard(service)).join("")}
      </div>
    </section>

    <section class="people-tech-section">
      <div class="people-copy">
        <p class="section-label">Smart tech + real people</p>
        <h2>Real people. Smart tech. No guesswork.</h2>
        <p>Smart tools help sort your documents. Our team helps check the next step. Advisor review available when the route needs a human decision.</p>
        <div class="support-points">
          ${["Guidance only, not legal advice", "Evidence ready for review", "Review before relying on this information"].map((item) => `
            <span>${imageHtml({ src: assets.tick, alt: "", width: 153, height: 152 })}${escapeHtml(item)}</span>
          `).join("")}
        </div>
      </div>
      <div class="support-tile-grid">
        ${renderSupportTile("Feel a bit lost?", "Ask for help choosing the next practical step.", assets.supportLost)}
        ${renderSupportTile("Too much admin?", "Keep the service route and records in one place.", assets.supportOvercomplicating)}
      </div>
    </section>

    <section class="dashboard-preview-section">
      <div class="dashboard-preview-copy">
        <p class="section-label">Property dashboard</p>
        <h2>Your compliance picture, one property at a time.</h2>
        <p>Property status, next actions, service progress, documents, reminders and recent activity stay connected after the check-property flow.</p>
        <button class="primary-button" type="button" data-flow-start="epc">Check your property</button>
      </div>
      <div class="dashboard-preview-media">
        ${imageHtml({ src: assets.dashboard, alt: "ComplyMyProperty dashboard overview", width: 4961, height: 3508 })}
      </div>
    </section>
  `;
}

function renderWhatCard(title, text, image) {
  return `
    <article class="what-card">
      ${imageHtml({ src: image, alt: "", width: 800, height: 1000 })}
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

function renderHelpTopicCard(topic) {
  return `
    <button class="choice-card image-choice" type="button" data-flow-start="${topic.id}">
      <span class="choice-image">${imageHtml({ src: topic.image, alt: "", width: 3935, height: 4825 })}</span>
      <span>${escapeHtml(topic.title)}</span>
      <small>${escapeHtml(topic.text)}</small>
    </button>
  `;
}

function renderServicesHub() {
  return `
    <section class="page-hero compact-hero services-hero">
      <div>
        <button class="back-button" type="button" data-view="home">Home</button>
        <h1>Choose the service you need today.</h1>
        <p>The broad CMP service catalogue starts with one clear choice, then routes back to the property record, documents and advisor support where useful.</p>
      </div>
      ${imageHtml({ src: assets.heroCropped, alt: "Paper house made from property documents", className: "hero-house-cutout", width: 3024, height: 4032 })}
    </section>
    <section class="service-preview-section hub-section">
      <div class="section-heading">
        <p class="section-label">Full service list</p>
        <h2>Landlord services without the clutter.</h2>
        <p>Each tile gives a clear outcome and a route into the same check-property journey. Details stay on the service page, not all at once.</p>
      </div>
      <div class="service-grid">
        ${services.map((service) => renderServiceCard(service)).join("")}
      </div>
    </section>
  `;
}

function renderServiceCard(service) {
  const image = serviceTiles[service.id] || serviceIcons[service.id] || assets.complianceTile;
  return `
    <button class="service-card" type="button" data-service="${service.id}">
      <span class="service-image">
        ${imageHtml({ src: image, alt: "", width: 3935, height: 4825 })}
      </span>
      <span class="service-title">${escapeHtml(service.title)}</span>
      <small>${escapeHtml(service.promise)}</small>
      <span class="card-cta">View service</span>
    </button>
  `;
}

function renderServicePage(service) {
  const relatedServices = service.related.map(serviceById);
  const heroImage = serviceTiles[service.id] || serviceIcons[service.id];
  const mediaItems = serviceMedia[service.id] || [
    [service.shortTitle, heroImage],
    ["Document support", assets.supportLost],
    ["Advisor review available", assets.supportOvercomplicating],
  ];

  return `
    <section class="page-hero service-hero">
      <div>
        <button class="back-button" type="button" data-view="services">Services</button>
        <h1>${escapeHtml(service.title)}</h1>
        <p>${escapeHtml(service.promise)}</p>
        ${service.careful ? `<p class="careful-copy">Prepare your evidence before speaking to an advisor. Check what documents may be needed. Build an evidence pack for review. Advisor review available.</p>` : ""}
        <div class="hero-actions">
          <button class="primary-button" type="button" data-flow-start="${service.id}">Start this service</button>
          <button class="secondary-button" type="button" data-dashboard-service="${service.id}">Open property dashboard</button>
        </div>
      </div>
      <div class="service-hero-visual">
        ${imageHtml({ src: heroImage, alt: "", width: 3935, height: 4825, loading: "" })}
      </div>
    </section>

    <section class="service-template">
      <div class="section-heading">
        <p class="section-label">Service route</p>
        <h2>What do you need help with today?</h2>
      </div>
      <div class="choice-grid three">
        ${service.choices.map((choice) => `
          <button class="choice-card" type="button" data-flow-start="${service.id}" data-situation="${escapeHtml(choice)}">
            <span>${escapeHtml(choice)}</span>
            <small>Connect this to the property record.</small>
          </button>
        `).join("")}
      </div>

      <div class="detail-columns">
        ${renderChecklist("What CMP checks", service.checks)}
        ${renderChecklist("Documents that may be needed", service.documents)}
        <article class="detail-panel action-panel">
          <h3>Bookable service or advisor option</h3>
          <p>${escapeHtml(service.booking)} with document support and a clear route back to the property dashboard.</p>
          <button class="primary-button light-button" type="button" data-flow-start="${service.id}">${escapeHtml(service.booking)}</button>
        </article>
      </div>

      <div class="postcode-cta">
        <div>
          <p class="section-label">Address first</p>
          <h2>Start with the property address.</h2>
          <p>Use a postcode to choose the address, then CMP can connect this service, documents and reminders to the right property.</p>
        </div>
        <button class="primary-button" type="button" data-flow-start="${service.id}">Check your property</button>
      </div>

      <div class="service-media-grid">
        ${mediaItems.map(([title, image]) => `
          <article class="service-media-card">
            ${imageHtml({ src: image, alt: "", width: 3935, height: 4825 })}
            <h3>${escapeHtml(title)}</h3>
          </article>
        `).join("")}
      </div>

      <div class="human-panel">
        ${imageHtml({ src: assets.heroCropped, alt: "", width: 3024, height: 4032 })}
        <div>
          <h3>Human support stays available.</h3>
          <p>Speak to someone if you are unsure. CMP can help sort the documents, explain the next practical step and keep records safely in the dashboard.</p>
        </div>
      </div>

      <div class="related-row">
        <h3>Related services</h3>
        <div class="related-actions">
          ${relatedServices.map((related) => `
            <button type="button" class="related-button" data-service="${related.id}">${escapeHtml(related.shortTitle)}</button>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderChecklist(title, items) {
  return `
    <article class="detail-panel">
      <h3>${escapeHtml(title)}</h3>
      <ul class="tick-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderCheckFlow() {
  return `
    <section class="flow-shell">
      <div class="flow-header">
        <div>
          <p class="section-label">Check property</p>
          <h1>Start with the address.</h1>
          <p>Enter a postcode, select the address, choose what needs attention, then continue to the property dashboard.</p>
        </div>
        <div class="flow-status">
          <span class="${state.flowStep === "postcode" ? "active" : ""}">Postcode</span>
          <span class="${state.flowStep === "address" ? "active" : ""}">Address</span>
          <span class="${state.flowStep === "need" ? "active" : ""}">Need</span>
          <span class="${state.flowStep === "confirm" ? "active" : ""}">Confirm</span>
        </div>
      </div>
      ${renderFlowStep()}
    </section>
  `;
}

function renderFlowStep() {
  if (state.flowStep === "address") {
    return `
      <section class="flow-card">
        <div>
          <h2>Select address</h2>
          <p>Postcode ${escapeHtml(state.postcode || "SW1A 1AA")} returned more than one possible address.</p>
        </div>
        <div class="address-list">
          ${state.addressOptions.map((address) => `
            <button type="button" class="address-option" data-address="${escapeHtml(address)}">${escapeHtml(address)}</button>
          `).join("")}
        </div>
        <label class="field-label" for="manual-address">Edit address manually</label>
        <textarea id="manual-address" data-manual-address rows="3">${escapeHtml(state.selectedAddress)}</textarea>
      </section>
    `;
  }

  if (state.flowStep === "need") {
    return `
      <section class="flow-card">
        <div>
          <h2>What do you need help with today?</h2>
          <p>${escapeHtml(state.selectedAddress)}</p>
        </div>
        <div class="choice-grid three">
          ${helpTopics.map((topic) => `
            <button type="button" class="choice-card ${state.selectedNeedId === topic.id ? "selected" : ""}" data-need="${topic.id}">
              <span>${escapeHtml(topic.title)}</span>
              <small>${escapeHtml(topic.text)}</small>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (state.flowStep === "confirm") {
    const activeService = serviceById(state.selectedNeedId);
    return `
      <section class="flow-card confirm-card">
        <div>
          <h2>Confirm current situation</h2>
          <p><strong>Property:</strong> ${escapeHtml(state.selectedAddress)}</p>
          <p><strong>Help needed:</strong> ${escapeHtml(activeService.title)}</p>
        </div>
        <label class="field-label" for="situation">Current situation</label>
        <textarea id="situation" rows="4" data-situation-input>${escapeHtml(state.situation)}</textarea>
        <div class="document-panel">
          ${imageHtml({ src: serviceTiles[state.selectedNeedId] || assets.supportLost, alt: "", width: 3935, height: 4825 })}
          <div>
            <h3>Smart document upload</h3>
            <p>Smart tools help sort your documents. Secure document storage keeps records with this property.</p>
          </div>
          <button type="button" class="secondary-button" data-upload-demo>${state.uploadedDocument ? "Document added for review" : "Upload what you have"}</button>
        </div>
        <button class="primary-button" type="button" data-complete-flow>Continue to property dashboard</button>
      </section>
    `;
  }

  return `
    <section class="flow-card postcode-card">
      <div>
        <h2>Enter postcode</h2>
        <p>The next step lets you choose the address before CMP shows property-specific actions.</p>
      </div>
      <form data-postcode-form>
        <label class="field-label" for="postcode">Postcode</label>
        <div class="postcode-row">
          <input id="postcode" name="postcode" type="text" value="${escapeHtml(state.postcode)}" autocomplete="postal-code" placeholder="SW1A 1AA">
          <button class="primary-button" type="submit">Find address</button>
        </div>
      </form>
    </section>
  `;
}

function renderMyProperties() {
  const properties = [
    {
      address: state.selectedAddress,
      status: "Action needed",
      action: "EPC evidence review",
      documents: "4 saved, 2 to add",
      image: assets.dashboard,
    },
    {
      address: "41 Maple Road, Bristol, BS3 1QP",
      status: "Monitor",
      action: "Gas Safety renewal reminder",
      documents: "8 saved",
      image: `${optimized}gas-card-track-it.webp`,
    },
  ];

  return `
    <section class="page-hero compact-hero properties-hero">
      <div>
        <button class="back-button" type="button" data-view="home">Home</button>
        <h1>My Properties</h1>
        <p>A simple landlord workspace for property records, service status, documents, renewals and human support.</p>
      </div>
      <button class="primary-button" type="button" data-flow-start="epc">Add or check a property</button>
    </section>
    <section class="property-list">
      ${properties.map((property) => `
        <button class="property-card" type="button" data-open-dashboard="${escapeHtml(property.address)}">
          <span class="property-thumb">${imageHtml({ src: property.image, alt: "", width: 4961, height: 3508 })}</span>
          <span>
            <strong>${escapeHtml(property.address)}</strong>
            <small>${escapeHtml(property.documents)}</small>
          </span>
          <span>
            <em>${escapeHtml(property.status)}</em>
            <small>${escapeHtml(property.action)}</small>
          </span>
        </button>
      `).join("")}
    </section>
  `;
}

function renderDashboard() {
  const service = serviceById(state.selectedNeedId);
  const documentLabel = state.uploadedDocument ? "Document added for review" : "Needs document upload";

  return `
    <section class="dashboard-shell">
      <div class="dashboard-header">
        <div>
          <p class="section-label">Property dashboard</p>
          <h1>${escapeHtml(state.selectedAddress)}</h1>
          <p>This workspace keeps checks, service bookings, document records, reminders and human support together.</p>
        </div>
        <div class="dashboard-summary">
          <article>
            <span>Compliance status</span>
            <strong>Action needed</strong>
          </article>
          <article>
            <span>Next action</span>
            <strong>${escapeHtml(service.booking)}</strong>
          </article>
          <article>
            <span>Service in progress</span>
            <strong>${escapeHtml(state.serviceInProgress)}</strong>
          </article>
          <article>
            <span>Document status</span>
            <strong>${escapeHtml(documentLabel)}</strong>
          </article>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="workspace-panel compliance-panel">
          <h2>Compliance snapshot</h2>
          <div class="snapshot-list">
            ${[
              ["EPC", service.id === "epc" ? "Needs review" : "Saved"],
              ["Gas Safety", service.id === "gas" ? "Service in progress" : "Renewal due later"],
              ["EICR", service.id === "eicr" ? "Needs date check" : "Saved"],
              ["Inspection records", service.id === "inspections" ? "Visit requested" : "Needs recent note"],
            ].map(([label, value]) => `
              <div class="snapshot-row">
                <span>${label}</span>
                <strong>${value}</strong>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="workspace-panel next-action-panel">
          <h2>Next action</h2>
          <div class="next-action-media">
            ${imageHtml({ src: serviceTiles[service.id] || serviceIcons[service.id], alt: "", width: 3935, height: 4825 })}
          </div>
          <p>${escapeHtml(service.promise)}</p>
          <button type="button" class="primary-button" data-service="${service.id}">Review service details</button>
        </section>

        <section class="workspace-panel">
          <h2>Services you may need</h2>
          <div class="service-actions">
            ${[service, ...service.related.map(serviceById)].slice(0, 4).map((item) => `
              <button type="button" class="service-action" data-service="${item.id}">
                ${imageHtml({ src: serviceIcons[item.id] || serviceTiles[item.id], alt: "", width: 1254, height: 1254 })}
                <span>${escapeHtml(item.shortTitle)}</span>
              </button>
            `).join("")}
          </div>
        </section>

        <section class="workspace-panel documents-panel" data-documents-panel>
          <h2>Documents and records</h2>
          <div class="document-list">
            ${[
              ["EPC certificate", service.id === "epc" ? "Upload requested" : "Saved"],
              ["Gas Safety certificate", service.id === "gas" ? "Booking route open" : "Saved"],
              ["Tenancy agreement", service.id === "possession" ? "Needed for review" : "Saved"],
              ["Inspection notes", service.id === "mould" ? "Needed for review" : "Optional"],
            ].map(([name, status]) => `
              <div class="document-row">
                <span>${escapeHtml(name)}</span>
                <strong>${escapeHtml(status)}</strong>
              </div>
            `).join("")}
          </div>
          <button type="button" class="secondary-button" data-upload-demo>${state.uploadedDocument ? "Document added for review" : "Upload what you have"}</button>
        </section>

        <section class="workspace-panel">
          <h2>Renewals and reminders</h2>
          <ul class="quiet-list">
            <li>Gas Safety reminder - 14 Jul 2026</li>
            <li>EICR date check - 04 Aug 2026</li>
            <li>Inspection follow-up - 18 Jul 2026</li>
          </ul>
        </section>

        <section class="workspace-panel human-support">
          ${imageHtml({ src: assets.supportLost, alt: "", width: 4825, height: 3935 })}
          <div>
            <h2>Human support</h2>
            <p>Our team helps check the next step. Speak to someone if you are unsure, or ask for an advisor callback.</p>
            <button type="button" class="primary-button">Request advisor callback</button>
          </div>
        </section>

        <section class="workspace-panel">
          <h2>Recent activity</h2>
          <ul class="activity-list">
            <li>Address selected from postcode search.</li>
            <li>${escapeHtml(service.shortTitle)} route opened.</li>
            <li>${escapeHtml(documentLabel)}.</li>
            <li>Property dashboard updated with the next service action.</li>
          </ul>
        </section>
      </div>
    </section>
  `;
}

function renderSupportTile(title, text, image) {
  return `
    <article class="support-tile">
      ${imageHtml({ src: image, alt: "", width: 4825, height: 3935 })}
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <section class="footer-brand">
          ${imageHtml({ src: assets.logo, alt: "ComplyMyProperty.com", width: 1304, height: 168 })}
          <p>Landlord compliance made simple. Secure document storage. Clear compliance guidance. Trusted landlord support.</p>
          <p class="trust-note">Guidance only, not legal advice. Review before relying on this information.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>Support for private landlords, service bookings, document review and advisor callbacks.</p>
          <p>help@complymyproperty.com</p>
        </section>
        <section>
          <h2>Services</h2>
          <p>EPC, Gas Safety, EICR, inspections, AML, licensing, damp, rent guarantee, possession preparation, insurance, mortgages and tax record support.</p>
        </section>
        <section>
          <h2>Company</h2>
          <p>Platform for private landlord compliance records, service routes and advisor support.</p>
          <p class="social-links">LinkedIn / Facebook / Instagram</p>
        </section>
        <section>
          <h2>Legal</h2>
          <p>Privacy, terms, data protection, company information and service guidance boundaries.</p>
        </section>
      </div>
    </footer>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  app.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => setView("service", { selectedServiceId: button.dataset.service }));
  });

  app.querySelectorAll("[data-flow-start]").forEach((button) => {
    button.addEventListener("click", () => {
      const needId = button.dataset.flowStart;
      if (button.dataset.situation) state.situation = button.dataset.situation;
      startFlow(needId, `${serviceById(needId).shortTitle} service`);
    });
  });

  app.querySelectorAll("[data-dashboard-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const service = serviceById(button.dataset.dashboardService);
      state.selectedNeedId = service.id;
      state.serviceInProgress = `${service.shortTitle} review`;
      setView("dashboard");
    });
  });

  const postcodeForm = app.querySelector("[data-postcode-form]");
  if (postcodeForm) {
    postcodeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(postcodeForm);
      state.postcode = String(formData.get("postcode") || "SW1A 1AA").trim().toUpperCase() || "SW1A 1AA";
      state.addressOptions = generatedAddresses.map((address) => address.replace("SW1A 1AA", state.postcode));
      state.flowStep = "address";
      render();
    });
  }

  app.querySelectorAll("[data-address]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAddress = button.dataset.address;
      state.flowStep = "need";
      render();
    });
  });

  const manualAddress = app.querySelector("[data-manual-address]");
  if (manualAddress) {
    manualAddress.addEventListener("input", () => {
      state.selectedAddress = manualAddress.value.trim() || state.selectedAddress;
    });
  }

  app.querySelectorAll("[data-need]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedNeedId = button.dataset.need;
      state.situation = `I need help with ${serviceById(state.selectedNeedId).shortTitle.toLowerCase()} and want CMP to connect it to this property.`;
      state.flowStep = "confirm";
      render();
    });
  });

  const situationInput = app.querySelector("[data-situation-input]");
  if (situationInput) {
    situationInput.addEventListener("input", () => {
      state.situation = situationInput.value;
    });
  }

  app.querySelectorAll("[data-upload-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      state.uploadedDocument = true;
      render();
    });
  });

  const completeButton = app.querySelector("[data-complete-flow]");
  if (completeButton) {
    completeButton.addEventListener("click", completeFlow);
  }

  app.querySelectorAll("[data-open-dashboard]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAddress = button.dataset.openDashboard;
      setView("dashboard");
    });
  });
}

render();
