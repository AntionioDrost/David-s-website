const assets = {
  logo: "./assets/logo-grey.png",
  hero: "./assets/origami-house-wide.png",
  house: "./assets/origami-house-hd.png",
  epcTile: "./assets/top-tile-epc.png",
};

const serviceAssets = {
  epc: "./assets/service-epc.png",
  gas: "./assets/service-gas.png",
  eicr: "./assets/service-eicr.png",
  inspections: "./assets/service-property-inspections.png",
  aml: "./assets/service-aml.png",
  monitoring: "./assets/service-property-inspections.png",
  tenant: "./assets/service-possession.png",
  licensing: "./assets/service-licensing.png",
  hmo: "./assets/service-licensing.png",
  mould: "./assets/service-mould.png",
  rent: "./assets/service-rent-guarantee.png",
  possession: "./assets/service-possession.png",
  insurance: "./assets/service-insurance.png",
  mortgages: "./assets/service-mortgages.png",
  tax: "./assets/service-aml.png",
  advisory: "./assets/service-property-inspections.png",
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
    choices: ["I need an EICR", "I have unsatisfactory observations", "I need renewal tracking"],
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
    title: "HMO/licensing review",
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
    title: "Mould & Damp support",
    shortTitle: "Mould & damp",
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
    shortTitle: "Possession preparation",
    promise: "Prepare your evidence before speaking to an advisor and keep the file organised for review.",
    choices: ["Prepare your evidence before speaking to an advisor", "Check what documents may be needed", "Build an evidence pack for review"],
    checks: ["Tenancy evidence", "Deposit evidence", "Certificate evidence", "Communication record"],
    documents: ["Tenancy agreement", "Deposit documents", "EPC and Gas Safety proof", "Tenant communications"],
    booking: "Request advisor review",
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
  { id: "epc", title: "Check EPC or energy rating", text: "Start with EPC evidence, rating improvement or renewal help." },
  { id: "gas", title: "Book or upload Gas Safety", text: "Keep the certificate, renewal date and service route together." },
  { id: "eicr", title: "Check EICR position", text: "Track electrical evidence, remedial notes and renewal timing." },
  { id: "inspections", title: "Arrange property inspection", text: "Record condition, alarm notes, photos and follow-up actions." },
  { id: "mould", title: "Handle mould or damp", text: "Organise reports, photos, repair notes and human review." },
  { id: "possession", title: "Possession & eviction preparation", text: "Prepare documents for advisor review without overclaiming the outcome." },
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
        <button class="brand-button" type="button" data-view="home" aria-label="Go to CMP Origin home">
          <img class="brand-logo" src="${assets.logo}" alt="ComplyMyProperty.com">
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
        <img src="${assets.hero}" alt="Paper house surrounded by landlord compliance documents">
        <div class="hero-address-panel">
          <span>Find Address</span>
          <strong>Start with a postcode, then choose what you need help with.</strong>
        </div>
      </div>
    </section>

    <section class="decision-section">
      <div class="section-heading">
        <p class="section-label">Start here</p>
        <h2>What do you need help with today?</h2>
        <p>CMP Origin keeps service choices, property checks, documents and human support connected to one property record.</p>
      </div>
      <div class="choice-grid">
        ${helpTopics.map(renderHelpTopicCard).join("")}
      </div>
    </section>

    <section class="origin-band">
      <div>
        <p class="section-label">Finished Wix direction</p>
        <h2>Real people. Smart tech. No guesswork.</h2>
        <p>Smart tools help sort your documents. Our team helps check the next step. Upload what you have - CMP will help organise it.</p>
      </div>
      <div class="support-strip">
        <article>
          <h3>Smart document upload</h3>
          <p>Secure document storage keeps EPCs, Gas Safety, EICR, tenancy records and inspection proof attached to the property.</p>
        </article>
        <article>
          <h3>Human support</h3>
          <p>Speak to someone if you are unsure. Advisor callbacks sit beside service booking and document review.</p>
        </article>
        <article>
          <h3>Connected services</h3>
          <p>Services are suggested from compliance gaps rather than sitting as disconnected brochure pages.</p>
        </article>
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
        ${services.slice(0, 8).map(renderServiceCard).join("")}
      </div>
    </section>
  `;
}

function renderHelpTopicCard(topic) {
  return `
    <button class="choice-card" type="button" data-flow-start="${topic.id}">
      <span>${escapeHtml(topic.title)}</span>
      <small>${escapeHtml(topic.text)}</small>
    </button>
  `;
}

function renderServicesHub() {
  return `
    <section class="page-hero compact-hero">
      <div>
        <h1>Services that lead back to your property record.</h1>
        <p>Each service starts a practical journey: answer a few questions, add a postcode or address, upload what you have, and continue into the same property dashboard.</p>
      </div>
      <img src="${assets.house}" alt="Folded paper house made from landlord guidance documents">
    </section>
    <section class="service-preview-section">
      <div class="section-heading">
        <p class="section-label">Full service list</p>
        <h2>Choose the service you need today.</h2>
      </div>
      <div class="service-grid">
        ${services.map(renderServiceCard).join("")}
      </div>
    </section>
  `;
}

function renderServiceCard(service) {
  return `
    <button class="service-card" type="button" data-service="${service.id}">
      <span class="service-image">
        <img src="${serviceAssets[service.id]}" alt="">
      </span>
      <span class="service-title">${escapeHtml(service.title)}</span>
      <small>${escapeHtml(service.promise)}</small>
    </button>
  `;
}

function renderServicePage(service) {
  const relatedServices = service.related.map(serviceById);
  const heroImage = service.id === "epc" ? assets.epcTile : serviceAssets[service.id];
  const heroClass = service.id === "epc" ? "service-photo" : "service-icon-large";

  return `
    <section class="page-hero service-hero">
      <div>
        <button class="back-button" type="button" data-view="services">Services</button>
        <h1>${escapeHtml(service.title)}</h1>
        <p>${escapeHtml(service.promise)}</p>
        ${service.id === "possession" ? `<p class="careful-copy">Prepare your evidence before speaking to an advisor. Check what documents may be needed. Build an evidence pack for review.</p>` : ""}
        <div class="hero-actions">
          <button class="primary-button" type="button" data-flow-start="${service.id}">Start this service</button>
          <button class="secondary-button" type="button" data-dashboard-service="${service.id}">Route into property dashboard</button>
        </div>
      </div>
      <img class="${heroClass}" src="${heroImage}" alt="">
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
        ${renderChecklist("What documents may be needed", service.documents)}
        <article class="detail-panel action-panel">
          <h3>What service can be booked</h3>
          <p>${escapeHtml(service.booking)} with document support and advisor callback where needed.</p>
          <button class="primary-button" type="button" data-flow-start="${service.id}">${escapeHtml(service.booking)}</button>
        </article>
      </div>
      <div class="human-panel">
        <img src="${assets.house}" alt="">
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
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderCheckFlow() {
  const activeService = serviceById(state.selectedNeedId);

  return `
    <section class="flow-shell">
      <div class="flow-header">
        <div>
          <p class="section-label">Check property</p>
          <h1>Find the address, then choose what needs attention.</h1>
          <p>No live lookup is used in this prototype. The postcode creates plausible address choices and lets the landlord edit the property route.</p>
        </div>
        <div class="flow-status">
          <span class="${state.flowStep === "postcode" ? "active" : ""}">Postcode</span>
          <span class="${state.flowStep === "address" ? "active" : ""}">Address</span>
          <span class="${state.flowStep === "need" ? "active" : ""}">Need</span>
          <span class="${state.flowStep === "confirm" ? "active" : ""}">Confirm</span>
        </div>
      </div>
      ${renderFlowStep(activeService)}
    </section>
  `;
}

function renderFlowStep(activeService) {
  if (state.flowStep === "address") {
    return `
      <section class="flow-card">
        <h2>Select address</h2>
        <p>Postcode ${escapeHtml(state.postcode || "SW1A 1AA")} returned more than one possible address.</p>
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
        <h2>What do you need help with today?</h2>
        <p>${escapeHtml(state.selectedAddress)}</p>
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
          <div>
            <h3>Smart document upload</h3>
            <p>Smart tools help sort your documents. Secure document storage keeps records with this property.</p>
          </div>
          <button type="button" class="secondary-button" data-upload-demo>${state.uploadedDocument ? "Document marked for review" : "Upload what you have"}</button>
        </div>
        <button class="primary-button" type="button" data-complete-flow>Continue to property dashboard</button>
      </section>
    `;
  }

  return `
    <section class="flow-card postcode-card">
      <div>
        <h2>Enter postcode</h2>
        <p>Start with a postcode. The next step lets you choose the address before CMP shows property-specific actions.</p>
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
  return `
    <section class="page-hero compact-hero properties-hero">
      <div>
        <h1>My Properties</h1>
        <p>A simple landlord workspace for property records, service status, documents, renewals and human support.</p>
      </div>
      <button class="primary-button" type="button" data-flow-start="epc">Add or check a property</button>
    </section>
    <section class="property-list">
      ${[
        {
          address: state.selectedAddress,
          status: "Action needed",
          action: "EPC evidence review",
          documents: "4 saved, 2 to add",
        },
        {
          address: "41 Maple Road, Bristol, BS3 1QP",
          status: "Monitor",
          action: "Gas Safety renewal reminder",
          documents: "8 saved",
        },
      ].map((property) => `
        <button class="property-card" type="button" data-open-dashboard="${escapeHtml(property.address)}">
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
  const documentLabel = state.uploadedDocument ? "Document marked for human review" : "Needs document upload";

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

        <section class="workspace-panel">
          <h2>Services you may need</h2>
          <div class="service-actions">
            ${[service, ...service.related.map(serviceById)].slice(0, 4).map((item) => `
              <button type="button" class="service-action" data-service="${item.id}">
                <img src="${serviceAssets[item.id]}" alt="">
                <span>${escapeHtml(item.shortTitle)}</span>
              </button>
            `).join("")}
          </div>
        </section>

        <section class="workspace-panel">
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
          <button type="button" class="secondary-button" data-upload-demo>${state.uploadedDocument ? "Document marked for review" : "Upload what you have"}</button>
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
          <img src="${assets.house}" alt="">
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
            <li>Dashboard updated with the next service action.</li>
          </ul>
        </section>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <section class="footer-brand">
          <img src="${assets.logo}" alt="ComplyMyProperty.com">
          <p>Landlord compliance made simple. Secure document storage. Clear compliance guidance. Trusted landlord support.</p>
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
          <h2>Legal</h2>
          <p>Privacy, terms, data protection, company information, ICO registration and service disclaimers for prototype review.</p>
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
