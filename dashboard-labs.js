const labsDemoProperty = {
  address: "57 The Butts",
  postcode: "CV1 3BJ",
  occupancy: "Vacant property",
  journey: "General compliance check"
};

const labsState = {
  activeTab: "overview",
  eicrAdded: false,
  strength: 42,
  timelineFilter: "all",
  notes: [],
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
  "Why is this event important?": "Timeline events help explain where each status came from, what changed and which evidence still needs attention."
};

const postEicrAssistantResponses = {
  "What should I fix first?": "Your EICR has been added. Your next useful step is to confirm the latest inspection record and review the local licensing position.",
  "What evidence am I missing?": "Your EICR has been added. The next useful evidence item is your latest property inspection record.",
  "What should I upload next?": "Your EICR has been added. The next useful evidence item is your latest property inspection record.",
  "What changed recently?": "CMP verified your EICR and updated the property file. Inspection evidence is now the most useful next upload.",
  "What still needs attention?": "Electrical Safety evidence is now recorded. CMP still recommends reviewing local licensing and adding inspection evidence."
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

function getAssistantResponse(prompt) {
  if (labsState.eicrAdded && postEicrAssistantResponses[prompt]) {
    return postEicrAssistantResponses[prompt];
  }

  return assistantResponses[prompt] || defaultAssistantResponse;
}

function renderAssistantPrompts() {
  const stack = document.querySelector(".prompt-stack");
  const prompts = labsState.activeTab === "documents"
    ? documentPrompts
    : labsState.activeTab === "compliance"
      ? compliancePrompts
      : labsState.activeTab === "timeline"
        ? timelinePrompts
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

function switchTab(target) {
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  labsState.activeTab = target;

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

  renderAssistantPrompts();

  if (target === "documents") {
    setAssistantResponse(labsState.eicrAdded ? postEicrAssistantResponses["What evidence am I missing?"] : assistantResponses["What evidence am I missing?"]);
  } else if (target === "compliance") {
    setAssistantResponse(getAssistantResponse("What should I fix first?"));
  } else if (target === "timeline") {
    renderTimelineState();
    setAssistantResponse(getAssistantResponse("What changed recently?"));
  }
}

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-global-nav]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(`${item.dataset.globalNav} is a portfolio-level destination in this Labs prototype.`);
      document.body.classList.remove("menu-open");
    });
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
    return event.open || event.actions?.some((action) => action.primary || action.upload);
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

  const recordedCount = labsState.eicrAdded ? 9 + labsState.notes.length : 8 + labsState.notes.length;
  document.querySelector("[data-timeline-event-count]").textContent = recordedCount;
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
  document.querySelector("[data-timeline-backdrop]").hidden = false;
  document.querySelector(selector).hidden = false;
}

function closeTimelineModals() {
  document.querySelector("[data-timeline-backdrop]").hidden = true;
  document.querySelector("[data-summary-modal]").hidden = true;
  document.querySelector("[data-note-modal]").hidden = true;
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

async function copyInboxAddress() {
  const address = document.querySelector("[data-inbox-address]")?.textContent?.trim();

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
  labsState.eicrAdded = true;
  updateStrength(58);

  const tile = document.querySelector("[data-electrical-tile]");
  tile?.classList.remove("status-review", "status-watch", "status-neutral");
  tile?.classList.add("status-good");

  const tileIcon = tile?.querySelector("[data-icon]");
  if (tileIcon) {
    tileIcon.dataset.icon = "shield";
    hydrateIcons();
  }

  document.querySelector("[data-electrical-status]").textContent = "Verified";
  document.querySelector("[data-electrical-source]").textContent = "Uploaded document";

  document.querySelector("[data-verified-count]").textContent = "3 documents";
  document.querySelector("[data-review-count]").textContent = "0 documents";
  document.querySelector("[data-next-upload]").textContent = "Inspection evidence";
  document.querySelector("[data-next-upload-note]").textContent = "Latest inspection record is the next useful item";
  document.querySelector("[data-vault-state]").textContent = "3 verified, 0 missing";

  document.querySelector("[data-eicr-source]").textContent = "Uploaded document";
  document.querySelector("[data-eicr-doc-status]").textContent = "Verified";
  document.querySelector("[data-eicr-doc-status]").classList.remove("status-review-text");
  document.querySelector("[data-eicr-doc-status]").classList.add("status-good-text");
  document.querySelector("[data-eicr-review-date]").textContent = "Review date 11 May 2031";
  document.querySelector("[data-eicr-document-row]")?.classList.remove("is-missing");
  document.querySelector("[data-eicr-actions]").innerHTML = `
    <button class="text-button" type="button" data-toast="Document viewer is not connected in Labs.">View</button>
    <button class="text-button" type="button" data-upload-trigger>Replace</button>
  `;

  const complianceCard = document.querySelector("[data-compliance-eicr-card]");
  complianceCard?.classList.remove("status-review", "status-watch", "status-neutral");
  complianceCard?.classList.add("status-good");
  document.querySelector("[data-compliance-eicr-icon]").dataset.icon = "shield";
  document.querySelector("[data-compliance-eicr-source]").textContent = "Uploaded document";
  document.querySelector("[data-compliance-eicr-status]").textContent = "Verified";
  document.querySelector("[data-compliance-eicr-status]").classList.remove("status-review-text");
  document.querySelector("[data-compliance-eicr-status]").classList.add("status-good-text");
  document.querySelector("[data-compliance-eicr-details]").textContent = "Satisfactory EICR recorded. Review date: 11 May 2031.";
  document.querySelector("[data-compliance-eicr-actions]").innerHTML = `
    <button class="secondary-button" type="button" data-toast="EICR viewer is not connected in Labs.">View certificate</button>
    <button class="text-button" type="button" data-upload-trigger>Replace evidence</button>
  `;
  hydrateIcons();

  const activity = document.querySelector("[data-recent-activity]");
  if (activity && !activity.textContent.includes("EICR evidence verified")) {
    const item = document.createElement("li");
    item.textContent = "EICR evidence verified";
    activity.prepend(item);
  }

  const panel = document.querySelector("[data-strengthened-panel]");
  if (panel) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  renderTimelineState();
  setAssistantResponse(postEicrAssistantResponses["What evidence am I missing?"]);
  closeSmartModal();
  showToast("Property file strengthened. Electrical Safety evidence verified. Evidence completeness increased from 42% to 58%.");
}

hydrateIcons();
renderAssistantPrompts();
bindTabs();
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

window.labsDemoProperty = labsDemoProperty;
