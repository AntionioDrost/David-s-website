const labsDemoProperty = {
  address: "57 The Butts",
  postcode: "CV1 3BJ",
  occupancy: "Vacant property",
  journey: "General compliance check"
};

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
  propertyDetails: {
    propertyType: "Terraced house",
    bedrooms: "3 bedrooms",
    occupancy: "Vacant property",
    goal: "General compliance check"
  },
  optionalDetails: {
    constructionYear: "",
    heatingType: "",
    storeys: "",
    parkingAccess: "",
    managingAgent: "",
    emergencyAccess: ""
  },
  propertyMemory: {
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
  },
  scanTimers: []
};

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
  settings: '<path d="M12.2 2h-.4l-1 3a7 7 0 0 0-1.7.7l-2.8-1.4-.3.3-2 3.4.1.4 2.5 1.8a7 7 0 0 0 0 1.8l-2.5 1.8-.1.4 2 3.4.3.3 2.8-1.4a7 7 0 0 0 1.7.7l1 3h.4l4-.1.3-.3 1-2.9a7 7 0 0 0 1.6-.9l3 .9.3-.3 1.8-3.5-.1-.4-2.7-1.5a7 7 0 0 0-.1-1.9l2.3-2 .1-.4-2.3-3.3-.4-.1-2.7 1.6a7 7 0 0 0-1.7-.6l-1.2-2.8-.3-.2-4 .1Z"/><circle cx="12" cy="12" r="3"/>',
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
  "How does document scanning work?": "In this Labs preview, CMP simulates reading document names, identifying the type, extracting useful dates and matching the paperwork to 57 The Butts.",
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

const propertiesAssistantResponses = {
  "Which property needs attention?": "57 The Butts needs attention because Electrical Safety evidence is still missing. Open the workspace or upload an existing EICR.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review the Electrical Safety action. That is the clearest evidence gap.",
  "How do I add another property?": "In the finished product, Add property will start a postcode and address lookup. This Labs version shows the button as a prototype placeholder."
};

const propertiesPostEicrAssistantResponses = {
  "Which property needs attention?": "57 The Butts is still the active property. Electrical Safety evidence is now recorded, so inspection evidence is the next useful focus.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review inspection evidence. It is now the next useful item.",
  "How do I add another property?": "In the finished product, Add property will start a postcode and address lookup. This Labs version shows the button as a prototype placeholder."
};

const defaultAssistantResponse = "This is a static Labs preview. CMP can organise evidence, identify gaps and suggest the next useful action for this property.";

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
  const dynamicItems = [...labsState.serviceEvents, ...labsState.propertyEvents]
    .filter((event) => event.activityLabel)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((event) => event.activityLabel);
  const baseItems = [
    labsState.eicrAdded ? "EICR evidence verified" : "EICR gap identified",
    "Gas Safety certificate verified",
    "EPC record imported"
  ];

  return [...dynamicItems, ...baseItems]
    .filter(Boolean)
    .slice(0, 3);
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
        <button class="primary-button" type="button" data-toast="Inspection evidence upload will be connected in a later Labs pass.">Upload inspection evidence</button>
        <button class="secondary-button" type="button" data-toast="Inspection status recorded for this Labs preview.">Mark as not yet completed</button>
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
        <button class="primary-button" type="button" data-toast="Upload flow is a placeholder in this Labs shell.">Upload EICR</button>
        <button class="secondary-button" type="button" data-toast="Manual EICR entry will be designed later.">Enter details manually</button>
        <button class="secondary-button" type="button" data-toast="Service booking is not connected in Labs yet.">Arrange an EICR</button>
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
      <button class="text-button" type="button" data-toast="Document viewer is not connected in Labs.">View</button>
      <button class="text-button" type="button" data-upload-trigger>Replace</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="text-button" type="button" data-toast="Manual EICR entry will be designed later.">Enter details manually</button>
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
      <button class="secondary-button" type="button" data-toast="EICR viewer is not connected in Labs.">View certificate</button>
      <button class="text-button" type="button" data-upload-trigger>Replace evidence</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="secondary-button" type="button" data-toast="Manual EICR entry will be designed later.">Enter details manually</button>
      <button class="text-button" type="button" data-toast="Service booking is not connected in Labs yet.">Arrange an EICR</button>
    `;
}

function renderAllState() {
  renderOverviewState();
  renderDocumentsState();
  renderComplianceState();
  renderTimelineState();
  renderServicesState();
  renderPropertyDetailsState();
  renderAssistantActivity();
  renderPortfolioHomeState();
  renderPortfolioPropertiesState();
  hydrateIcons();
}

function getPortfolioAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? portfolioPostEicrAssistantResponses : portfolioAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getPropertiesAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? propertiesPostEicrAssistantResponses : propertiesAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getAssistantResponse(prompt) {
  if (labsState.currentView === "home") {
    return getPortfolioAssistantResponse(prompt);
  }

  if (labsState.currentView === "properties") {
    return getPropertiesAssistantResponse(prompt);
  }

  if (labsState.eicrAdded && postEicrAssistantResponses[prompt]) {
    return postEicrAssistantResponses[prompt];
  }

  return assistantResponses[prompt] || defaultAssistantResponse;
}

function renderAssistantPrompts() {
  const stack = document.querySelector(".prompt-stack");
  const prompts = labsState.currentView === "home"
    ? portfolioPrompts
    : labsState.currentView === "properties"
      ? propertiesPrompts
    : labsState.activeTab === "documents"
    ? documentPrompts
    : labsState.activeTab === "compliance"
      ? compliancePrompts
      : labsState.activeTab === "timeline"
        ? timelinePrompts
        : labsState.activeTab === "services"
          ? servicesPrompts
          : labsState.activeTab === "details"
            ? propertyPrompts
            : overviewPrompts;

  if (!stack) {
    return;
  }

  stack.innerHTML = prompts.map((prompt) => `<button type="button" data-prompt="${prompt}">${prompt}</button>`).join("");
}

function openAssistant(message) {
  if (message) {
    setAssistantResponse(message);
  }

  document.body.classList.add("assistant-open");
}

function closeDrawers() {
  document.body.classList.remove("menu-open", "assistant-open", "findings-open", "prs-open");
  closeTimelineModals();
}

function setGlobalNavActive(label) {
  document.querySelectorAll("[data-global-nav]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.globalNav === label);
  });
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
  document.body.classList.remove("portfolio-home-active", "portfolio-properties-active", "menu-open");
  document.querySelector("[data-portfolio-home]")?.setAttribute("hidden", "");
  document.querySelector("[data-portfolio-properties]")?.setAttribute("hidden", "");
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

  const strength = labsState.eicrAdded ? 58 : 42;
  const latestActivity = getRecentActivityItems();
  const activeRequest = currentServiceRequest();

  document.querySelector("[data-home-summary-title]").textContent = labsState.eicrAdded
    ? "Add recent inspection evidence for 57 The Butts"
    : "Check whether 57 The Butts has a current EICR";
  document.querySelector("[data-home-summary-body]").textContent = labsState.eicrAdded
    ? "Electrical Safety is recorded. Inspection evidence is the next useful improvement."
    : "Electrical Safety is the clearest evidence gap in the property file.";
  document.querySelector("[data-home-priority-detail]").textContent = activeRequest
    ? "request awaiting review"
    : "clear next step";
  document.querySelector("[data-home-verified-count]").textContent = labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-home-review-count]").textContent = labsState.eicrAdded ? "2" : "3";
  document.querySelector("[data-home-priority-area]").textContent = labsState.eicrAdded ? "Property inspection" : "Electrical Safety";
  document.querySelector("[data-home-priority-status]").textContent = labsState.eicrAdded ? "Useful next step" : "Evidence missing";
  document.querySelector("[data-home-priority-body]").textContent = labsState.eicrAdded
    ? "The Electrical Safety evidence is now recorded. The next useful action is to add recent inspection evidence or arrange a property inspection."
    : "CMP could not find a current EICR for 57 The Butts. Upload an existing report or request help arranging an inspection.";
  document.querySelector("[data-home-upload-priority]").textContent = labsState.eicrAdded ? "Upload inspection evidence" : "Upload EICR";
  document.querySelector("[data-home-arrange-priority]").textContent = labsState.eicrAdded ? "Arrange an inspection" : "Arrange an EICR";
  document.querySelector("[data-home-occupancy]").textContent = labsState.propertyDetails.occupancy;
  document.querySelector("[data-home-goal]").textContent = labsState.propertyDetails.goal;
  document.querySelector("[data-home-strength]").textContent = `${strength}% evidenced`;
  document.querySelector("[data-home-strength-meter]").style.width = `${strength}%`;
  document.querySelector("[data-home-status]").textContent = labsState.eicrAdded
    ? "2 areas still need review"
    : "3 areas need checking";
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
  const home = document.querySelector("[data-portfolio-home]");

  if (!home) {
    return;
  }

  labsState.currentView = "home";
  document.body.classList.add("portfolio-home-active");
  document.body.classList.remove("portfolio-properties-active", "menu-open");
  home.hidden = false;
  document.querySelector("[data-portfolio-properties]")?.setAttribute("hidden", "");
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("is-active");
  });
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });
  setGlobalNavActive("Home");
  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(getPortfolioAssistantResponse("What should I do today?"));

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function propertySearchText() {
  return [
    "57",
    "the butts",
    "butts",
    "coventry",
    "cv1",
    "eicr",
    "inspection",
    "vacant",
    labsState.propertyDetails.occupancy,
    labsState.propertyDetails.goal,
    currentServiceRequest() ? "open requests support request" : ""
  ].join(" ").toLowerCase();
}

function propertyMatchesCurrentView() {
  const query = labsState.propertiesSearch.trim().toLowerCase();
  const hasOpenRequest = Boolean(currentServiceRequest());
  const matchesSearch = !query || propertySearchText().includes(query);
  const matchesFilter = labsState.propertiesFilter === "all"
    || (labsState.propertiesFilter === "attention")
    || (labsState.propertiesFilter === "vacant" && labsState.propertyDetails.occupancy === "Vacant property")
    || (labsState.propertiesFilter === "requests" && hasOpenRequest);

  return matchesSearch && matchesFilter;
}

function renderPortfolioPropertiesState() {
  const page = document.querySelector("[data-portfolio-properties]");

  if (!page) {
    return;
  }

  const strength = labsState.eicrAdded ? 58 : 42;
  const focus = labsState.eicrAdded ? "Inspection evidence" : "Electrical Safety evidence";
  const state = labsState.eicrAdded ? "Useful next step" : "Needs checking";
  const attentionDetail = labsState.eicrAdded ? "Inspection evidence" : "Electrical Safety";
  const openRequests = currentServiceRequest() ? 1 : 0;
  const hasResult = propertyMatchesCurrentView();
  const cardView = labsState.propertiesView === "cards";

  document.querySelector("[data-properties-attention-detail]").textContent = attentionDetail;
  document.querySelector("[data-properties-summary-strength]").textContent = `${strength}%`;
  document.querySelector("[data-properties-open-requests]").textContent = String(openRequests);
  document.querySelector("[data-properties-card-strength]").textContent = `${strength}% evidenced`;
  document.querySelector("[data-properties-card-meter]").style.width = `${strength}%`;
  document.querySelector("[data-properties-current-focus]").textContent = focus;
  document.querySelector("[data-properties-current-state]").textContent = state;
  document.querySelector("[data-properties-occupancy]").textContent = labsState.propertyDetails.occupancy;
  document.querySelector("[data-properties-journey]").textContent = labsState.propertyDetails.goal;
  document.querySelector("[data-properties-compact-status]").textContent = state;
  document.querySelector("[data-properties-compact-occupancy]").textContent = labsState.propertyDetails.occupancy;
  document.querySelector("[data-properties-compact-strength]").textContent = `${strength}% evidenced`;
  document.querySelector("[data-properties-compact-meter]").style.width = `${strength}%`;
  document.querySelector("[data-properties-compact-priority]").textContent = focus;

  const requestIndicator = document.querySelector("[data-properties-request-indicator]");
  if (requestIndicator) {
    requestIndicator.hidden = !openRequests;
  }

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

  document.querySelector("[data-properties-card]").hidden = !hasResult || !cardView;
  document.querySelector("[data-properties-compact]").hidden = !hasResult || cardView;
  document.querySelector("[data-properties-empty]").hidden = hasResult;
}

function showPortfolioProperties({ scroll = false } = {}) {
  const page = document.querySelector("[data-portfolio-properties]");

  if (!page) {
    return;
  }

  labsState.currentView = "properties";
  document.body.classList.add("portfolio-properties-active");
  document.body.classList.remove("portfolio-home-active", "menu-open");
  document.querySelector("[data-portfolio-home]")?.setAttribute("hidden", "");
  page.hidden = false;
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("is-active");
  });
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });
  setGlobalNavActive("Properties");
  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(getPropertiesAssistantResponse("Which property needs attention?"));

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function openPropertyWorkspace(tab = "overview", focusSelector = null) {
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
    button.addEventListener("click", () => {
      showToast("Add-property onboarding will be connected in a later CMP Labs pass.");
    });
  });

  document.querySelector("[data-home-ask]")?.addEventListener("click", () => {
    focusAssistantInput();
  });

  document.querySelector("[data-home-open-action]")?.addEventListener("click", () => {
    openPropertyWorkspace(labsState.eicrAdded ? "timeline" : "overview", labsState.eicrAdded ? "[data-timeline-action-body]" : "[data-next-best-step]");
  });

  document.querySelector("[data-home-why]")?.addEventListener("click", () => {
    openAssistant(getPortfolioAssistantResponse("Ask CMP why this matters"));
  });

  document.querySelectorAll("[data-home-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      openAssistant(getPortfolioAssistantResponse(button.dataset.homePrompt));
    });
  });

  document.querySelector("[data-home-upload-priority]")?.addEventListener("click", () => {
    openPropertyWorkspace(labsState.eicrAdded ? "documents" : "documents", labsState.eicrAdded ? "[data-inspection-upload-card]" : "[data-document-upload-panel]");
  });

  document.querySelector("[data-home-arrange-priority]")?.addEventListener("click", () => {
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
    openPropertyWorkspace("documents");
  });

  document.querySelector("[data-home-view-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelectorAll("[data-home-upcoming]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.homeUpcoming;

      if (target === "inspection") {
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
    showToast("Quick win reminder is not scheduled in this Labs preview.");
  });
  document.querySelector("[data-home-alarm-save]")?.addEventListener("click", saveHomeAlarmAnswer);
  document.querySelectorAll("[data-home-alarm-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function bindPortfolioProperties() {
  document.querySelectorAll("[data-properties-add]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Add-property onboarding will be connected in a later CMP Labs pass.");
    });
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
    if (event.target.closest("[data-properties-open-workspace]")) {
      openPropertyWorkspace("overview");
    }

    if (event.target.closest("[data-properties-upload]")) {
      openPropertyWorkspace("documents", "[data-document-upload-panel]");
    }

    if (event.target.closest("[data-properties-timeline]")) {
      openPropertyWorkspace("timeline");
    }

    if (event.target.closest("[data-properties-support]")) {
      openPropertyWorkspace("services", currentServiceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
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

      showToast("This portfolio page will be designed in a later CMP Labs pass.");
      document.body.classList.remove("menu-open");
    });
  });

  document.querySelectorAll("[data-home-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPortfolioHome({ scroll: true });
    });
  });

  document.querySelectorAll("[data-open-property]").forEach((button) => {
    button.addEventListener("click", () => openPropertyWorkspace("overview"));
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

    setAssistantResponse(getAssistantResponse(button.dataset.prompt));
    openAssistant();
  });

  document.querySelector("[data-assistant-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.question;
    setAssistantResponse(input.value.trim() ? defaultAssistantResponse : getAssistantResponse("What evidence am I missing?"));
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
  const type = serviceCopy().requestType;
  return labsState.serviceRequests.find((request) => request.type === type && request.status !== "Cancelled");
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

  if (!labsState.serviceRequests.length) {
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

  list.innerHTML = labsState.serviceRequests.map((request) => `
    <article class="request-card${request.status === "Cancelled" ? " is-cancelled" : ""}" data-request-id="${request.id}">
      <div class="request-card-top">
        <h3>${escapeHtml(request.type)}</h3>
        <span class="doc-status ${request.status === "Cancelled" ? "status-neutral-text" : "status-watch-text"}">${escapeHtml(request.status)}</span>
      </div>
      <dl>
        <div><dt>Created</dt><dd>${escapeHtml(request.created)}</dd></div>
        <div><dt>Linked to</dt><dd>${escapeHtml(request.linkedTo)}</dd></div>
        <div><dt>Property</dt><dd>57 The Butts</dd></div>
      </dl>
      <div class="button-row">
        <button class="text-button" type="button" data-toast="Request detail is static in this Labs prototype.">View request</button>
        <button class="text-button" type="button" data-toast="Request-note controls will be designed in a later Labs pass.">Add a note</button>
        <button class="text-button" type="button" data-cancel-request="${request.id}" ${request.status === "Cancelled" ? "disabled" : ""}>Cancel request</button>
      </div>
    </article>
  `).join("");
}

function openServiceRequestModal() {
  const copy = serviceCopy();
  const existingRequest = currentServiceRequest();

  if (existingRequest) {
    scrollToPanel("[data-open-requests-panel]");
    showToast(`${existingRequest.type} is already recorded for this property.`);
    return;
  }

  document.querySelector("[data-service-modal-title]").textContent = copy.requestTitle;
  document.querySelector("[data-service-note]").value = "";
  document.querySelector("[data-service-form]").hidden = false;
  document.querySelector("[data-service-success]").hidden = true;
  renderChoiceList(document.querySelector("[data-service-options]"), copy.options, "service-option");
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
  const copy = serviceCopy();
  const existingRequest = currentServiceRequest();

  if (existingRequest) {
    closeTimelineModals();
    scrollToPanel("[data-open-requests-panel]");
    showToast(`${existingRequest.type} is already recorded for this property.`);
    return;
  }

  const id = `request-${Date.now()}`;
  const request = {
    id,
    type: copy.requestType,
    status: "Awaiting review",
    created: "just now",
    linkedTo: copy.linkedTo
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
        ["Property", "57 The Butts"],
        ["Request type", copy.requestType],
        ["Status", "Awaiting review"],
        ["Created", "Just now"]
      ],
      note: "Prototype support request for layout testing."
    }
  });
  renderAllState();
  document.querySelector("[data-service-success-type]").textContent = copy.requestType;
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

  if (!window.confirm("Cancel this prototype support request?")) {
    return;
  }

  request.status = "Cancelled";
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
        ["Property", "57 The Butts"],
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
      scrollToPanel("[data-open-requests-panel]");
    }

    const cancelButton = event.target.closest("[data-cancel-request]");
    if (cancelButton) {
      cancelSupportRequest(cancelButton.dataset.cancelRequest);
    }

    if (event.target.closest("[data-service-upload-action]")) {
      if (labsState.eicrAdded) {
        showToast("Inspection upload is simulated in this Labs preview.");
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
      eicrAction.dataset.toast = "EICR viewer is not connected in CMP Labs.";
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
      actions: [{ label: "View evidence", toast: "EICR viewer is not connected in Labs." }],
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
      actions: [{ label: "View evidence", toast: "Document viewer is not connected in Labs." }],
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
      actions: [{ label: "View record", toast: "Official record viewer is not connected in Labs." }],
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
        { label: "Review answer", toast: "Answer review is not connected in Labs." }
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
        : `data-toast="${escapeHtml(action.toast || "This action is static in CMP Labs.")}"`;
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
      <button class="primary-button" type="button" data-upload-trigger>Upload inspection evidence</button>
      <button class="secondary-button" type="button" data-toast="Inspection status is not saved in this prototype.">Mark as not yet completed</button>
    `
    : `
      <button class="primary-button" type="button" data-upload-trigger>Upload EICR</button>
      <button class="secondary-button" type="button" data-toast="Service booking is not connected in Labs yet.">Arrange an EICR</button>
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

function showScanResults() {
  document.querySelector("[data-scan-view]").hidden = true;
  document.querySelector("[data-results-view]").hidden = false;
  document.querySelector("[data-review-view]").hidden = true;
}

function showEicrReview() {
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
  labsState.eicrAdded = true;
  renderAllState();

  const panel = document.querySelector("[data-strengthened-panel]");
  if (panel && !wasAlreadyConfirmed) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  setAssistantResponse(postEicrAssistantMessage);
  closeSmartModal();
  showToast("Property file strengthened. Electrical Safety evidence verified. Evidence completeness increased from 42% to 58%.");
}

hydrateIcons();
renderAssistantPrompts();
renderAllState();
bindTabs();
bindPortfolioHome();
bindPortfolioProperties();
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

window.labsDemoProperty = labsDemoProperty;
