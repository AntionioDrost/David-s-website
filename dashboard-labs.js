const labsDemoProperty = {
  address: "57 The Butts",
  postcode: "CV1 3BJ",
  occupancy: "Vacant property",
  journey: "General compliance check"
};

function createInitialPropertyDetails() {
  return {
    propertyType: "Terraced house",
    bedrooms: "3 bedrooms",
    occupancy: "Vacant property",
    goal: "General compliance check"
  };
}

function createInitialOptionalDetails() {
  return {
    constructionYear: "",
    heatingType: "",
    storeys: "",
    parkingAccess: "",
    managingAgent: "",
    emergencyAccess: ""
  };
}

function createInitialPropertyMemory() {
  return {
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
  };
}

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
  evidenceSearch: "",
  evidenceFilter: "all",
  evidenceView: "list",
  taskSearch: "",
  taskFilter: "all",
  taskView: "list",
  activitySearch: "",
  activityFilter: "all",
  inspectionStatusRecorded: false,
  settings: {
    complianceReminders: true,
    evidenceExpiryAlerts: true,
    supportRequestUpdates: true,
    weeklyPortfolioSummary: false,
    showPrototypeLabels: true,
    compactMode: false
  },
  propertyDetails: createInitialPropertyDetails(),
  optionalDetails: createInitialOptionalDetails(),
  propertyMemory: createInitialPropertyMemory(),
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

const complianceCentrePrompts = [
  "What should I fix first?",
  "Which evidence is missing?",
  "What expires soon?",
  "Summarise my compliance position"
];

const evidenceVaultPrompts = [
  "What evidence is missing?",
  "Which documents are verified?",
  "How should I upload paperwork?",
  "Summarise my evidence vault"
];

const tasksPrompts = [
  "What should I do first?",
  "Why is this a task?",
  "Which tasks are evidence-related?",
  "What can I leave for later?"
];

const activityPrompts = [
  "What changed recently?",
  "What still needs attention?",
  "Summarise portfolio activity",
  "Why was this recorded?"
];

const globalAskPrompts = [
  "What should I do today?",
  "Which property needs attention?",
  "What evidence is missing?",
  "Explain this property file",
  "Summarise my portfolio",
  "What can wait until later?"
];

const globalServicePrompts = [
  "What should I book first?",
  "Why is this recommended?",
  "Can CMP help arrange it?",
  "What can wait until later?"
];

const learnPrompts = [
  "Explain EICR",
  "What evidence should I keep?",
  "What should I check before letting?",
  "Explain local licensing"
];

const settingsPrompts = [
  "What can CMP notify me about?",
  "What data does CMP use?",
  "How does demo reset work?",
  "What is compact mode?"
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

const complianceCentreAssistantResponses = {
  "What should I fix first?": "Your clearest next step is 57 The Butts. Electrical Safety evidence is missing, while EPC and Gas Safety are already recorded.",
  "Which evidence is missing?": "The clearest missing evidence is an EICR for 57 The Butts. Inspection evidence and local licensing are also still worth reviewing.",
  "What expires soon?": "There are no confirmed urgent deadlines this week. CMP recommends reviewing inspection status in 34 days and planning the Gas Safety renewal window in 71 days.",
  "Summarise my compliance position": "CMP has one monitored property. EPC and Gas Safety evidence are recorded, while EICR, inspection evidence and licensing review still need attention."
};

const complianceCentrePostEicrAssistantResponses = {
  "What should I fix first?": "Your EICR is now recorded. The next useful compliance improvement is inspection evidence and local licensing review.",
  "Which evidence is missing?": "CMP has EPC, Gas Safety and EICR evidence. The next useful evidence item is a recent property-inspection record.",
  "What expires soon?": "There are no confirmed urgent deadlines this week. CMP recommends confirming inspection status in 34 days and planning the Gas Safety renewal window in 71 days.",
  "Summarise my compliance position": "CMP has EPC, Gas Safety and EICR evidence for 57 The Butts. Inspection evidence and local licensing review are now the most useful follow-up items."
};

const evidenceVaultAssistantResponses = {
  "What evidence is missing?": "CMP has EPC and Gas Safety evidence for 57 The Butts. The clearest missing item is an EICR, with inspection evidence also still useful to add.",
  "Which documents are verified?": "EPC is confirmed from an official record. Gas Safety is verified from an uploaded document. After the EICR is added, Electrical Safety also becomes verified from an uploaded document.",
  "How should I upload paperwork?": "You can forward paperwork to the Evidence Inbox or use Smart Upload. CMP Labs will simulate classifying and linking it to the correct property.",
  "Summarise my evidence vault": "Your portfolio evidence vault contains two verified items and one key missing certificate for 57 The Butts."
};

const evidenceVaultPostEicrAssistantResponses = {
  "What evidence is missing?": "CMP has EPC, Gas Safety and EICR evidence for 57 The Butts. The next useful upload is a recent property-inspection record.",
  "Which documents are verified?": "EPC is confirmed from an official record. Gas Safety is verified from an uploaded document. Electrical Safety is also verified from an uploaded document.",
  "How should I upload paperwork?": "You can forward paperwork to the Evidence Inbox or use Smart Upload. CMP Labs will simulate classifying and linking it to the correct property.",
  "Summarise my evidence vault": "Your portfolio evidence vault contains three verified evidence items for 57 The Butts. Inspection evidence is now the main useful next upload."
};

const tasksAssistantResponses = {
  "What should I do first?": "Your first task is to upload or arrange an EICR for 57 The Butts. Electrical Safety is the clearest missing evidence area.",
  "Why is this a task?": "CMP creates tasks from missing evidence, compliance checks, upcoming reviews and support requests so you can act without reading every section manually.",
  "Which tasks are evidence-related?": "The evidence-related tasks are EICR and inspection evidence for 57 The Butts.",
  "What can I leave for later?": "Licensing is still under review, so it can be monitored unless you need to let or alter the property soon. Inspection evidence is the more useful next action."
};

const tasksPostEicrAssistantResponses = {
  "What should I do first?": "Your EICR is now verified. The next useful task is to add inspection evidence or record that no recent inspection has been completed.",
  "Why is this a task?": "CMP creates tasks from missing evidence, compliance checks, upcoming reviews and support requests so you can act without reading every section manually.",
  "Which tasks are evidence-related?": "The main evidence-related task is inspection evidence for 57 The Butts.",
  "What can I leave for later?": "Licensing is still under review, so it can be monitored unless you need to let or alter the property soon. Inspection evidence is the more useful next action."
};

const activityAssistantResponses = {
  "What changed recently?": "CMP recently verified Gas Safety evidence and identified Electrical Safety evidence as the clearest gap for 57 The Butts.",
  "What still needs attention?": "Electrical Safety evidence still needs attention. Inspection evidence and licensing review are also worth monitoring.",
  "Summarise portfolio activity": "The portfolio activity feed shows imported records, uploaded evidence, landlord answers, task changes and support events for 57 The Butts.",
  "Why was this recorded?": "CMP records activity so landlords can understand what changed, when it changed and which property file was affected."
};

const activityPostEicrAssistantResponses = {
  "What changed recently?": "Your EICR was verified and the Electrical Safety gap was resolved. The next useful item is inspection evidence.",
  "What still needs attention?": "Inspection evidence is now the main useful upload. Licensing review is still in progress.",
  "Summarise portfolio activity": "The portfolio activity feed shows imported records, uploaded evidence, landlord answers, task changes and support events for 57 The Butts.",
  "Why was this recorded?": "CMP records activity so landlords can understand what changed, when it changed and which property file was affected."
};

const propertiesAssistantResponses = {
  "Which property needs attention?": "57 The Butts needs attention because Electrical Safety evidence is still missing. Open the workspace or upload an existing EICR.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review the Electrical Safety action. That is the clearest evidence gap.",
  "How do I add another property?": "Use Add property to preview the future onboarding flow: postcode entry, address selection, EPC import and workspace creation."
};

const propertiesPostEicrAssistantResponses = {
  "Which property needs attention?": "57 The Butts is still the active property. Electrical Safety evidence is now recorded, so inspection evidence is the next useful focus.",
  "Summarise my properties": "You currently have one property in this CMP Labs portfolio: 57 The Butts in Coventry. CMP has EPC and Gas Safety evidence recorded, with the next priority shown on the property card.",
  "What should I open first?": "Open 57 The Butts and review inspection evidence. It is now the next useful item.",
  "How do I add another property?": "Use Add property to preview the future onboarding flow: postcode entry, address selection, EPC import and workspace creation."
};

const learnAssistantResponses = {
  "Explain EICR": "An EICR records the condition of a property's fixed electrical installation. In CMP, it appears as Electrical Safety evidence.",
  "What evidence should I keep?": "Keep core certificates, uploaded documents, landlord answers, inspection records and activity history together so each property file has a clear source trail.",
  "What should I check before letting?": "Before letting, review Electrical Safety, Gas Safety, EPC, alarm testing, tenancy documents, inspection evidence and any local licensing questions.",
  "Explain local licensing": "Local licensing rules can vary by council area and property setup. CMP shows it as checking until the position is confirmed."
};

const settingsAssistantResponses = {
  "What can CMP notify me about?": "CMP could notify you about compliance reminders, evidence expiry alerts, support request updates and weekly portfolio summaries.",
  "What data does CMP use?": "This Labs preview uses local prototype state. A final CMP account would use secure account storage and database-backed property records.",
  "How does demo reset work?": "Reset demo returns the Labs preview to the initial pre-EICR state without connecting to any backend.",
  "What is compact mode?": "Compact mode reduces spacing in the Labs preview so repeated cards and lists feel tighter during demos."
};

const guidePreviews = [
  {
    title: "What is an EICR?",
    category: "Electrical Safety",
    summary: "A short guide to Electrical Installation Condition Reports and why CMP treats them as core evidence.",
    preview: "An EICR records the condition of fixed electrical installations. CMP uses it to decide whether Electrical Safety evidence is recorded or still needs attention."
  },
  {
    title: "What documents should a landlord keep?",
    category: "Evidence",
    summary: "A practical overview of certificates, records and useful supporting documents.",
    preview: "Landlords usually benefit from keeping certificates, inspection notes, tenancy documents, landlord answers and support history together in one property file."
  },
  {
    title: "How often should I review property inspections?",
    category: "Inspections",
    summary: "How CMP thinks about inspection evidence as a useful follow-up record.",
    preview: "Inspection records help explain what was checked, when it was checked and whether any follow-up action was needed. CMP treats them as useful evidence to add when available."
  },
  {
    title: "What does local licensing mean?",
    category: "Licensing",
    summary: "A plain-English introduction to why licensing can depend on area and property setup.",
    preview: "Local licensing can depend on council rules, property type and occupancy. CMP keeps it visible as a review item until the position is confirmed."
  },
  {
    title: "What should I prepare before a new tenancy?",
    category: "Tenancy readiness",
    summary: "A short checklist-style preview for evidence, checks and paperwork before move-in.",
    preview: "Before a new tenancy, CMP would help review core certificates, alarm testing, inspection records, tenancy documents and any local licensing questions."
  },
  {
    title: "How CMP organises evidence",
    category: "CMP workflow",
    summary: "How records, uploads, landlord answers and activity history fit together.",
    preview: "CMP separates official records, uploaded evidence, landlord answers and support activity so each property status has a visible source."
  }
];

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
  renderPortfolioComplianceState();
  renderPortfolioEvidenceState();
  renderPortfolioTasksState();
  renderPortfolioActivityState();
  renderPortfolioUtilityState();
  hydrateIcons();
}

function resetDemoState() {
  clearScanTimers();
  labsState.eicrAdded = false;
  labsState.strength = 42;
  labsState.timelineFilter = "all";
  labsState.alarmAnswer = "";
  labsState.notes = [];
  labsState.propertyEvents = [];
  labsState.serviceRequests = [];
  labsState.serviceEvents = [];
  labsState.propertiesSearch = "";
  labsState.propertiesFilter = "all";
  labsState.propertiesView = "cards";
  labsState.evidenceSearch = "";
  labsState.evidenceFilter = "all";
  labsState.evidenceView = "list";
  labsState.taskSearch = "";
  labsState.taskFilter = "all";
  labsState.taskView = "list";
  labsState.activitySearch = "";
  labsState.activityFilter = "all";
  labsState.inspectionStatusRecorded = false;
  labsState.propertyDetails = createInitialPropertyDetails();
  labsState.optionalDetails = createInitialOptionalDetails();
  labsState.propertyMemory = createInitialPropertyMemory();
}

function ensureDemoSupportRequest() {
  const requestType = "Property inspection support";
  const hasRequest = labsState.serviceRequests.some((request) => request.type === requestType && request.status !== "Cancelled");

  if (!hasRequest) {
    labsState.serviceRequests.unshift({
      id: "demo-support-request",
      type: requestType,
      status: "Awaiting review",
      created: "just now",
      linkedTo: "Inspection evidence"
    });
  }

  const hasEvent = labsState.serviceEvents.some((event) => event.id === "demo-support-event");

  if (!hasEvent) {
    labsState.serviceEvents.unshift({
      id: "demo-support-event",
      createdAt: Date.now(),
      group: "Today",
      filter: "actions",
      icon: "calendar",
      category: "Service request",
      title: "Property inspection support requested",
      body: "CMP recorded a request to help arrange the next property-inspection step.",
      badge: "Awaiting review",
      badgeClass: "status-watch-text",
      activityLabel: "Property inspection support requested",
      type: "service-request",
      actions: [],
      details: {
        title: "Request details",
        rows: [
          ["Property", "57 The Butts"],
          ["Request type", requestType],
          ["Status", "Awaiting review"],
          ["Created", "Just now"]
        ],
        note: "Prototype support request for layout testing."
      }
    });
  }
}

function ensureDemoQuickWin() {
  labsState.alarmAnswer = "Yes, they have been tested";

  const hasEvent = labsState.propertyEvents.some((event) => event.id === "demo-alarm-answer");

  if (!hasEvent) {
    labsState.propertyEvents.unshift({
      id: "demo-alarm-answer",
      createdAt: Date.now(),
      group: "Today",
      filter: "answers",
      icon: "check",
      category: "Landlord answer",
      title: "Alarm testing answer recorded",
      body: "Smoke and CO alarm testing was recorded from the Home quick-win card.",
      badge: "Landlord confirmed",
      badgeClass: "status-good-text",
      activityLabel: "Alarm testing answer recorded",
      type: "alarm-answer",
      actions: [
        { label: "Review answer", action: "details" },
        { label: "Add evidence", action: "documents" }
      ],
      details: {
        title: "Landlord answer",
        rows: [
          ["Question", "Have smoke and CO alarms been tested?"],
          ["Answer", labsState.alarmAnswer],
          ["Property", "57 The Butts"]
        ],
        note: "This quick-win answer is useful history, but supporting evidence can still be added."
      }
    });
  }
}

function applyDemoState(state) {
  const labels = {
    reset: "Reset demo",
    "before-eicr": "Before EICR",
    "after-eicr": "After EICR",
    "after-support": "After support request",
    "after-quick-win": "After quick win"
  };

  resetDemoState();

  if (state === "after-eicr" || state === "after-support") {
    labsState.eicrAdded = true;
    labsState.strength = 58;
  }

  if (state === "after-support") {
    ensureDemoSupportRequest();
  }

  if (state === "after-quick-win") {
    ensureDemoQuickWin();
  }

  renderAllState();
  renderAssistantPrompts();
  closeTimelineModals();
  const firstPrompt = document.querySelector(".prompt-stack [data-prompt]")?.dataset.prompt;
  setAssistantResponse(getAssistantResponse(firstPrompt || "What changed recently?"));
  showToast(`Demo state updated: ${labels[state] || "Before EICR"}`);
}

function getPortfolioAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? portfolioPostEicrAssistantResponses : portfolioAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getPropertiesAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? propertiesPostEicrAssistantResponses : propertiesAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getComplianceCentreAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? complianceCentrePostEicrAssistantResponses : complianceCentreAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getEvidenceVaultAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? evidenceVaultPostEicrAssistantResponses : evidenceVaultAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getTasksAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? tasksPostEicrAssistantResponses : tasksAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getActivityAssistantResponse(prompt) {
  const responses = labsState.eicrAdded ? activityPostEicrAssistantResponses : activityAssistantResponses;
  return responses[prompt] || defaultAssistantResponse;
}

function getGlobalAskDefaultResponse() {
  if (currentServiceRequest()) {
    return "A support request is open. CMP is waiting for the next review step before creating duplicate requests.";
  }

  if (labsState.alarmAnswer) {
    return "Alarm testing has been recorded. Supporting evidence can be added later if available.";
  }

  if (labsState.eicrAdded) {
    return "Your EICR is verified. The next useful action is to add inspection evidence or confirm that no recent inspection has been completed.";
  }

  return "The clearest next step is to upload or arrange an EICR for 57 The Butts. Electrical Safety is the main missing evidence area.";
}

function getGlobalAskAssistantResponse(prompt) {
  const responses = {
    "What should I do today?": labsState.eicrAdded
      ? "Add inspection evidence or record that no recent inspection has been completed for 57 The Butts."
      : "Upload or arrange an EICR for 57 The Butts. Electrical Safety is the clearest missing evidence area.",
    "Which property needs attention?": labsState.eicrAdded
      ? "57 The Butts is still the focus, but Electrical Safety is now verified. Inspection evidence is the next useful item."
      : "57 The Butts needs attention because CMP does not yet have current EICR evidence.",
    "What evidence is missing?": labsState.eicrAdded
      ? "Core certificates are recorded. Inspection evidence is still useful to add."
      : "The main missing evidence is an EICR. Inspection evidence is also useful to add when available.",
    "Explain this property file": "57 The Butts has matched EPC information, verified Gas Safety evidence, landlord alarm information, tasks and activity history in this Labs preview.",
    "Summarise my portfolio": labsState.eicrAdded
      ? "Your portfolio has one property. EPC, Gas Safety and EICR evidence are recorded; inspection evidence and licensing review remain useful follow-up items."
      : "Your portfolio has one property. EPC and Gas Safety evidence are recorded; Electrical Safety is the clearest gap.",
    "What can wait until later?": labsState.eicrAdded
      ? "Licensing can be monitored while inspection evidence is the more useful next upload."
      : "Licensing and inspection evidence can be monitored, but Electrical Safety should be handled first."
  };

  return responses[prompt] || getGlobalAskDefaultResponse();
}

function getGlobalServiceAssistantResponse(prompt) {
  const responses = {
    "What should I book first?": labsState.eicrAdded
      ? "Inspection support is the most useful next support option because core certificates are now recorded."
      : "EICR support is the most useful next support option because Electrical Safety evidence is missing.",
    "Why is this recommended?": labsState.eicrAdded
      ? "CMP is recommending inspection support because it is the next useful evidence item after the core certificates."
      : "CMP is recommending EICR support because no current Electrical Safety evidence is stored for 57 The Butts.",
    "Can CMP help arrange it?": "This Labs preview can record a prototype support request. The finished product would connect that request to CMP support workflows.",
    "What can wait until later?": labsState.eicrAdded
      ? "Gas Safety and EPC are already recorded. Licensing can keep checking while inspection evidence is reviewed."
      : "Gas Safety and EPC are already recorded, so EICR support should come before optional document review."
  };

  return responses[prompt] || getGlobalAskDefaultResponse();
}

function getLearnAssistantResponse(prompt) {
  return learnAssistantResponses[prompt] || "CMP Learn gives plain-English previews connected to the property evidence and tasks in this Labs workspace.";
}

function getSettingsAssistantResponse(prompt) {
  return settingsAssistantResponses[prompt] || "Settings in this Labs preview are local controls for presentation and prototype preferences.";
}

function getAssistantResponse(prompt) {
  if (labsState.currentView === "home") {
    return getPortfolioAssistantResponse(prompt);
  }

  if (labsState.currentView === "properties") {
    return getPropertiesAssistantResponse(prompt);
  }

  if (labsState.currentView === "complianceCentre") {
    return getComplianceCentreAssistantResponse(prompt);
  }

  if (labsState.currentView === "evidenceVault") {
    return getEvidenceVaultAssistantResponse(prompt);
  }

  if (labsState.currentView === "tasks") {
    return getTasksAssistantResponse(prompt);
  }

  if (labsState.currentView === "activity") {
    return getActivityAssistantResponse(prompt);
  }

  if (labsState.currentView === "askCmp") {
    return getGlobalAskAssistantResponse(prompt);
  }

  if (labsState.currentView === "bookService") {
    return getGlobalServiceAssistantResponse(prompt);
  }

  if (labsState.currentView === "learn") {
    return getLearnAssistantResponse(prompt);
  }

  if (labsState.currentView === "settings") {
    return getSettingsAssistantResponse(prompt);
  }

  if (labsState.eicrAdded && postEicrAssistantResponses[prompt]) {
    return postEicrAssistantResponses[prompt];
  }

  return assistantResponses[prompt] || defaultAssistantResponse;
}

function renderAssistantPrompts() {
  const stack = document.querySelector(".prompt-stack");
  let prompts = overviewPrompts;

  if (labsState.currentView === "home") {
    prompts = portfolioPrompts;
  } else if (labsState.currentView === "properties") {
    prompts = propertiesPrompts;
  } else if (labsState.currentView === "complianceCentre") {
    prompts = complianceCentrePrompts;
  } else if (labsState.currentView === "evidenceVault") {
    prompts = evidenceVaultPrompts;
  } else if (labsState.currentView === "tasks") {
    prompts = tasksPrompts;
  } else if (labsState.currentView === "activity") {
    prompts = activityPrompts;
  } else if (labsState.currentView === "askCmp") {
    prompts = globalAskPrompts;
  } else if (labsState.currentView === "bookService") {
    prompts = globalServicePrompts;
  } else if (labsState.currentView === "learn") {
    prompts = learnPrompts;
  } else if (labsState.currentView === "settings") {
    prompts = settingsPrompts;
  } else if (labsState.activeTab === "documents") {
    prompts = documentPrompts;
  } else if (labsState.activeTab === "compliance") {
    prompts = compliancePrompts;
  } else if (labsState.activeTab === "timeline") {
    prompts = timelinePrompts;
  } else if (labsState.activeTab === "services") {
    prompts = servicesPrompts;
  } else if (labsState.activeTab === "details") {
    prompts = propertyPrompts;
  }

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

const portfolioBodyClasses = [
  "portfolio-home-active",
  "portfolio-properties-active",
  "portfolio-compliance-active",
  "portfolio-evidence-active",
  "portfolio-tasks-active",
  "portfolio-activity-active",
  "portfolio-utility-active"
];

const portfolioPageSelectors = [
  "[data-portfolio-home]",
  "[data-portfolio-properties]",
  "[data-portfolio-compliance]",
  "[data-portfolio-evidence]",
  "[data-portfolio-tasks]",
  "[data-portfolio-activity]",
  "[data-portfolio-ask]",
  "[data-portfolio-service]",
  "[data-portfolio-learn]",
  "[data-portfolio-settings]"
];

function setGlobalNavActive(label) {
  document.querySelectorAll("[data-global-nav]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.globalNav === label);
  });
}

function hidePortfolioPages() {
  portfolioPageSelectors.forEach((selector) => {
    document.querySelector(selector)?.setAttribute("hidden", "");
  });
}

function hidePropertyPanelsAndTabs() {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("is-active");
  });
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });
}

function activatePortfolioPage({ selector, view, navLabel, bodyClass, response, scroll = false }) {
  const page = document.querySelector(selector);

  if (!page) {
    return;
  }

  labsState.currentView = view;
  document.body.classList.remove(...portfolioBodyClasses, "menu-open");
  document.body.classList.add(bodyClass || "portfolio-utility-active");
  hidePortfolioPages();
  page.hidden = false;
  hidePropertyPanelsAndTabs();
  setGlobalNavActive(navLabel);
  renderAllState();
  renderAssistantPrompts();
  setAssistantResponse(response || getAssistantResponse(document.querySelector(".prompt-stack [data-prompt]")?.dataset.prompt || ""));

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
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
  document.body.classList.remove(...portfolioBodyClasses, "menu-open");
  hidePortfolioPages();
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
  activatePortfolioPage({
    selector: "[data-portfolio-home]",
    view: "home",
    navLabel: "Home",
    bodyClass: "portfolio-home-active",
    response: getPortfolioAssistantResponse("What should I do today?"),
    scroll
  });
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
  activatePortfolioPage({
    selector: "[data-portfolio-properties]",
    view: "properties",
    navLabel: "Properties",
    bodyClass: "portfolio-properties-active",
    response: getPropertiesAssistantResponse("Which property needs attention?"),
    scroll
  });
}

function compliancePriorityRequestType() {
  return labsState.eicrAdded ? "Property inspection support" : "EICR support";
}

function currentComplianceRequest() {
  const type = compliancePriorityRequestType();
  return labsState.serviceRequests.find((request) => request.type === type && request.status !== "Cancelled");
}

function renderPortfolioComplianceState() {
  const page = document.querySelector("[data-portfolio-compliance]");

  if (!page) {
    return;
  }

  const activeRequest = currentComplianceRequest();
  document.querySelector("[data-compliance-confirmed-count]").textContent = labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-compliance-review-count]").textContent = labsState.eicrAdded ? "2" : "3";
  document.querySelector("[data-compliance-open-action-detail]").textContent = labsState.eicrAdded ? "Inspection evidence" : "Electrical Safety";
  document.querySelector("[data-compliance-priority-title]").textContent = labsState.eicrAdded
    ? "57 The Butts needs inspection evidence"
    : "57 The Butts needs Electrical Safety evidence";
  document.querySelector("[data-compliance-priority-body]").textContent = labsState.eicrAdded
    ? "Electrical Safety evidence is now recorded. The next useful improvement is a recent property-inspection record."
    : "CMP has EPC and Gas Safety evidence recorded, but no current EICR is stored for this property.";
  document.querySelector("[data-compliance-priority-upload]").textContent = labsState.eicrAdded ? "Upload inspection evidence" : "Upload EICR";
  document.querySelector("[data-compliance-priority-support]").textContent = labsState.eicrAdded ? "Request inspection support" : "Request EICR support";

  const requestIndicator = document.querySelector("[data-compliance-request-indicator]");
  if (requestIndicator) {
    requestIndicator.hidden = !activeRequest;
    requestIndicator.textContent = activeRequest ? `${activeRequest.type} open` : "Support request open";
  }

  const eicrStatus = document.querySelector("[data-compliance-matrix-eicr-status]");
  const eicrSource = document.querySelector("[data-compliance-matrix-eicr-source]");
  if (eicrStatus) {
    eicrStatus.textContent = labsState.eicrAdded ? "Verified" : "Needs checking";
    eicrStatus.classList.toggle("status-good-text", labsState.eicrAdded);
    eicrStatus.classList.toggle("status-review-text", !labsState.eicrAdded);
  }
  if (eicrSource) {
    eicrSource.textContent = labsState.eicrAdded ? "Uploaded document" : "No EICR evidence";
  }

  renderComplianceGaps();
}

function renderComplianceGaps() {
  const list = document.querySelector("[data-compliance-gap-list]");

  if (!list) {
    return;
  }

  const gaps = [
    ...(!labsState.eicrAdded
      ? [{
          title: "EICR missing",
          detail: "57 The Butts · Electrical Safety",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Request support", action: "requestSupport" }
          ]
        }]
      : []),
    {
      title: "Inspection evidence missing",
      detail: "57 The Butts · Property inspection",
      actions: [
        { label: "Upload inspection evidence", action: "uploadInspection", primary: !labsState.eicrAdded },
        { label: "Mark as not completed", action: "markInspection" }
      ]
    },
    {
      title: "Licensing still checking",
      detail: "57 The Butts · Local licensing",
      actions: [
        { label: "Review licensing", action: "reviewLicensing" },
        { label: "Ask CMP", action: "askLicensing" }
      ]
    }
  ];

  list.innerHTML = gaps.map((gap) => `
    <article class="compliance-gap-card">
      <div>
        <h3>${escapeHtml(gap.title)}</h3>
        <p>${escapeHtml(gap.detail)}</p>
      </div>
      <div class="compliance-gap-actions">
        ${gap.actions.map((action) => `
          <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-compliance-action="${action.action}">
            ${escapeHtml(action.label)}
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function showPortfolioCompliance({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-compliance]",
    view: "complianceCentre",
    navLabel: "Compliance centre",
    bodyClass: "portfolio-compliance-active",
    response: getComplianceCentreAssistantResponse("What should I fix first?"),
    scroll
  });
}

function getEvidenceRows() {
  return [
    {
      id: "epc",
      title: "EPC",
      document: "Energy Performance Certificate",
      property: "57 The Butts · CV1 3BJ",
      source: "Official record",
      sourceClass: "status-good-text",
      status: "Confirmed",
      statusClass: "status-good-text",
      keyDate: "Expires 14 March 2031",
      filters: ["verified", "official"],
      search: "epc energy performance certificate 57 butts official confirmed",
      actions: [
        { label: "View", action: "viewEpc" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    {
      id: "gas",
      title: "Gas Safety",
      document: "Gas Safety Certificate",
      property: "57 The Butts · CV1 3BJ",
      source: "Uploaded document",
      sourceClass: "status-good-text",
      status: "Verified",
      statusClass: "status-good-text",
      keyDate: "Expires 18 June 2027",
      filters: ["verified", "uploaded"],
      search: "gas safety certificate 57 butts uploaded verified",
      actions: [
        { label: "View", action: "viewGas" },
        { label: "Replace", action: "replaceGas" },
        { label: "Open property", action: "openProperty" }
      ]
    },
    {
      id: "eicr",
      title: "EICR",
      document: "Electrical Installation Condition Report",
      property: "57 The Butts · CV1 3BJ",
      source: labsState.eicrAdded ? "Uploaded document" : "No evidence uploaded",
      sourceClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      status: labsState.eicrAdded ? "Verified" : "Missing",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      keyDate: labsState.eicrAdded ? "Review date 11 May 2031" : "Review date unknown",
      filters: labsState.eicrAdded ? ["verified", "uploaded"] : ["missing", "review"],
      search: `eicr electrical installation condition report electrical 57 butts ${labsState.eicrAdded ? "uploaded verified" : "missing no evidence needs review"}`,
      actions: labsState.eicrAdded
        ? [
            { label: "View", action: "viewEicr" },
            { label: "Replace", action: "replaceEicr" },
            { label: "Open property", action: "openProperty" }
          ]
        : [
            { label: "Upload", action: "uploadEicr", primary: true },
            { label: "Arrange EICR", action: "arrangeEicr" },
            { label: "Open property", action: "openProperty" }
          ]
    },
    {
      id: "inspection",
      title: "Inspection evidence",
      document: "Property inspection record",
      property: "57 The Butts · CV1 3BJ",
      source: "No evidence uploaded",
      sourceClass: "status-review-text",
      status: "Missing",
      statusClass: "status-review-text",
      keyDate: "No recent record",
      filters: ["missing"],
      search: "inspection property inspection record 57 butts missing no evidence",
      actions: [
        { label: "Upload", action: "uploadInspection", primary: labsState.eicrAdded },
        { label: "Mark not completed", action: "markInspection" },
        { label: "Open property", action: "openProperty" }
      ]
    }
  ];
}

function evidenceMatchesCurrentView(row) {
  const query = labsState.evidenceSearch.trim().toLowerCase();
  const matchesSearch = !query || `${row.title} ${row.document} ${row.property} ${row.source} ${row.status} ${row.keyDate} ${row.search}`.toLowerCase().includes(query);
  const matchesFilter = labsState.evidenceFilter === "all" || row.filters.includes(labsState.evidenceFilter);

  return matchesSearch && matchesFilter;
}

function renderEvidenceRow(row) {
  const actions = row.actions.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${action.action}">
      ${escapeHtml(action.label)}
    </button>
  `).join("");

  return `
    <article class="evidence-row" data-evidence-row="${escapeHtml(row.id)}">
      <div>
        <h3>${escapeHtml(row.title)}</h3>
        <p>${escapeHtml(row.document)}</p>
      </div>
      <div class="evidence-row-meta"><span>Property</span><strong>${escapeHtml(row.property)}</strong></div>
      <div class="evidence-pill-stack"><span class="matrix-pill ${row.sourceClass}">${escapeHtml(row.source)}</span></div>
      <div class="evidence-pill-stack"><span class="matrix-pill ${row.statusClass}">${escapeHtml(row.status)}</span></div>
      <div class="evidence-row-date"><span>Date</span><small>${escapeHtml(row.keyDate)}</small></div>
      <div class="evidence-row-actions">${actions}</div>
    </article>
  `;
}

function renderPortfolioEvidenceState() {
  const page = document.querySelector("[data-portfolio-evidence]");

  if (!page) {
    return;
  }

  document.querySelector("[data-evidence-verified-count]").textContent = labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-evidence-review-count]").textContent = labsState.eicrAdded ? "0" : "1";
  document.querySelector("[data-evidence-review-detail]").textContent = labsState.eicrAdded ? "nothing waiting" : "EICR extraction";
  document.querySelector("[data-evidence-missing-count]").textContent = labsState.eicrAdded ? "1" : "2";
  document.querySelector("[data-evidence-missing-detail]").textContent = labsState.eicrAdded ? "inspection record" : "EICR and inspection";
  document.querySelector("[data-evidence-health-strength]").textContent = labsState.eicrAdded ? "58% evidenced" : "42% evidenced";
  document.querySelector("[data-evidence-health-verified]").textContent = labsState.eicrAdded ? "3 verified" : "2 verified";
  document.querySelector("[data-evidence-health-missing]").textContent = labsState.eicrAdded ? "0 missing in core certificates" : "1 missing";
  document.querySelector("[data-evidence-health-focus]").textContent = labsState.eicrAdded
    ? "Core certificates are recorded. Inspection evidence is still useful to add."
    : "Electrical Safety needs evidence";

  const searchInput = document.querySelector("[data-evidence-search]");
  if (searchInput && searchInput.value !== labsState.evidenceSearch) {
    searchInput.value = labsState.evidenceSearch;
  }

  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceFilter === labsState.evidenceFilter);
  });
  document.querySelectorAll("[data-evidence-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evidenceView === labsState.evidenceView);
  });

  const rows = getEvidenceRows().filter(evidenceMatchesCurrentView);
  const listCard = document.querySelector("[data-evidence-list-card]");
  const list = document.querySelector("[data-evidence-list]");
  const empty = document.querySelector("[data-evidence-empty]");
  if (listCard) {
    listCard.hidden = !rows.length;
    listCard.classList.toggle("is-card-view", labsState.evidenceView === "cards");
  }
  if (list) {
    list.innerHTML = rows.map(renderEvidenceRow).join("");
  }
  if (empty) {
    empty.hidden = Boolean(rows.length);
  }

  renderEvidenceMissingList();
}

function renderEvidenceMissingList() {
  const list = document.querySelector("[data-evidence-missing-list]");

  if (!list) {
    return;
  }

  const items = [
    ...(!labsState.eicrAdded
      ? [{
          title: "EICR",
          detail: "57 The Butts · Electrical Safety",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Arrange EICR", action: "arrangeEicr" }
          ]
        }]
      : []),
    {
      title: "Inspection evidence",
      detail: "57 The Butts · Property inspection",
      actions: [
        { label: "Upload inspection evidence", action: "uploadInspection", primary: labsState.eicrAdded },
        { label: "Mark as not completed", action: "markInspection" }
      ]
    }
  ];

  list.innerHTML = items.map((item) => `
    <article class="compliance-gap-card">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <div class="compliance-gap-actions">
        ${item.actions.map((action) => `
          <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-evidence-action="${action.action}">
            ${escapeHtml(action.label)}
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function showPortfolioEvidence({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-evidence]",
    view: "evidenceVault",
    navLabel: "Evidence Vault",
    bodyClass: "portfolio-evidence-active",
    response: getEvidenceVaultAssistantResponse("What evidence is missing?"),
    scroll
  });
}

function activeTaskItems() {
  return [
    ...(!labsState.eicrAdded
      ? [{
          id: "eicr",
          title: "Upload or arrange an EICR",
          property: "57 The Butts · CV1 3BJ",
          category: "Evidence",
          priority: "High",
          source: "Compliance Centre",
          body: "No current Electrical Safety evidence is stored for this property.",
          status: "Needs checking",
          suggestedAction: "Upload EICR or request EICR support",
          board: "todo",
          filters: ["high", "evidence"],
          requestType: "EICR support",
          detail: "CMP created this task because Electrical Safety evidence was missing for 57 The Butts.",
          search: "eicr electrical evidence support 57 butts vacant",
          actions: [
            { label: "Upload EICR", action: "uploadEicr", primary: true },
            { label: "Request support", action: "requestSupport" },
            { label: "Open property", action: "openProperty" }
          ]
        }]
      : []),
    ...(!labsState.inspectionStatusRecorded
      ? [{
          id: "inspection",
          title: "Confirm inspection evidence",
          property: "57 The Butts · CV1 3BJ",
          category: "Inspection",
          priority: "Medium",
          source: "Evidence Vault",
          body: "CMP does not hold a recent property inspection record.",
          status: labsState.eicrAdded ? "Useful next step" : "Open",
          suggestedAction: "Upload inspection evidence or record that no recent inspection has been completed",
          board: "todo",
          filters: ["inspection", "evidence"],
          requestType: "Property inspection support",
          detail: "CMP created this task because no recent property inspection record is stored for this property.",
          search: "inspection evidence 57 butts vacant complete",
          actions: [
            { label: "Upload inspection evidence", action: "uploadInspection", primary: labsState.eicrAdded },
            { label: "Mark as not completed", action: "markInspection" },
            { label: "Open property", action: "openProperty" }
          ]
        }]
      : []),
    {
      id: "licensing",
      title: "Review local licensing position",
      property: "57 The Butts · CV1 3BJ",
      category: "Licensing",
      priority: "Medium",
      source: "Compliance Centre",
      body: "CMP is still checking whether local rules may affect this address.",
      status: "In progress",
      suggestedAction: "Review licensing in the property workspace",
      board: "progress",
      filters: ["licensing"],
      detail: "CMP created this task because local licensing rules are still being checked for this postcode.",
      search: "licensing local 57 butts vacant",
      actions: [
        { label: "Review licensing", action: "reviewLicensing" },
        { label: "Ask CMP", action: "askLicensing" },
        { label: "Open property", action: "openProperty" }
      ]
    }
  ];
}

function completedTaskItems() {
  return [
    ...(labsState.eicrAdded
      ? [{
          id: "eicr-resolved",
          title: "EICR evidence added",
          status: "Resolved",
          source: "Documents · Smart Upload",
          body: "Electrical Safety evidence was verified and linked to 57 The Butts.",
          property: "57 The Butts · CV1 3BJ",
          category: "Evidence",
          priority: "High",
          suggestedAction: "Review the next useful task",
          board: "resolved",
          filters: ["completed", "high", "evidence"],
          detail: "CMP moved this task here because Electrical Safety evidence was verified through Smart Upload.",
          search: "eicr complete resolved smart upload evidence 57 butts"
        }]
      : []),
    ...(labsState.inspectionStatusRecorded
      ? [{
          id: "inspection-recorded",
          title: "Inspection status recorded",
          status: "Dismissed",
          source: "Tasks · Labs preview",
          body: "Marked as not completed in this Labs preview.",
          property: "57 The Butts · CV1 3BJ",
          category: "Inspection",
          priority: "Medium",
          suggestedAction: "Return when inspection evidence is available",
          board: "resolved",
          filters: ["completed", "inspection"],
          detail: "CMP moved this task here because inspection status was recorded for this session.",
          search: "inspection complete dismissed not completed 57 butts"
        }]
      : []),
    ...(labsState.alarmAnswer
      ? [{
          id: "alarm-recorded",
          title: "Alarm testing answer recorded",
          status: "Landlord confirmed",
          source: "Home · Quick win",
          body: "Landlord confirmed.",
          property: "57 The Butts · CV1 3BJ",
          category: "Evidence",
          priority: "Medium",
          suggestedAction: "Add supporting evidence later if useful",
          board: "resolved",
          filters: ["completed", "evidence"],
          detail: "CMP moved this task here because the alarm testing answer was recorded from the Home quick-win flow.",
          search: "alarm complete landlord confirmed evidence 57 butts"
        }]
      : [])
  ];
}

function taskMatchesCurrentView(task) {
  const query = labsState.taskSearch.trim().toLowerCase();
  const matchesSearch = !query || `${task.title} ${task.property} ${task.category} ${task.priority} ${task.source} ${task.body} ${task.status} ${task.search}`.toLowerCase().includes(query);
  const matchesFilter = labsState.taskFilter === "all"
    || task.filters.includes(labsState.taskFilter)
    || (labsState.taskFilter === "completed" && task.board === "resolved");

  return matchesSearch && matchesFilter;
}

function allTaskItems() {
  return [...activeTaskItems(), ...completedTaskItems()];
}

function activeRequestForTask(task) {
  if (!task.requestType) {
    return null;
  }

  return labsState.serviceRequests.find((request) => request.type === task.requestType && request.status !== "Cancelled");
}

function renderTaskCard(task, { compact = false } = {}) {
  const actions = task.actions?.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-task-action="${action.action}">
      ${escapeHtml(action.label)}
    </button>
  `).join("") || "";
  const activeRequest = activeRequestForTask(task);

  return `
    <article class="task-card" data-task-id="${escapeHtml(task.id)}">
      <div>
        <button class="task-title-button" type="button" data-task-detail="${escapeHtml(task.id)}">
          <h3>${escapeHtml(task.title)}</h3>
        </button>
        <p class="property-card-label">${escapeHtml(task.property)}</p>
        ${compact ? "" : `<p>${escapeHtml(task.body)}</p>`}
        <div class="task-chip-row">
          <span>${escapeHtml(task.category)}</span>
          <span>${escapeHtml(task.priority)} priority</span>
          <span>Source: ${escapeHtml(task.source)}</span>
          <span>${escapeHtml(task.status)}</span>
          ${activeRequest ? `<span>${escapeHtml(activeRequest.type)} open</span>` : ""}
        </div>
      </div>
      <div class="task-card-actions">
        ${actions}
        <button class="text-button" type="button" data-task-detail="${escapeHtml(task.id)}">Why this task?</button>
      </div>
    </article>
  `;
}

function renderTaskBoard(tasks) {
  const columns = [
    { id: "todo", title: "To do" },
    { id: "progress", title: "In progress" },
    { id: "resolved", title: "Resolved" }
  ];

  return columns.map((column) => {
    const columnTasks = tasks.filter((task) => task.board === column.id);

    return `
      <section class="task-board-column">
        <h3>${column.title}</h3>
        ${columnTasks.length
          ? columnTasks.map((task) => renderTaskCard(task, { compact: true })).join("")
          : `<p>No tasks in this column.</p>`}
      </section>
    `;
  }).join("");
}

function renderCompletedTasks() {
  const list = document.querySelector("[data-completed-task-list]");

  if (!list) {
    return;
  }

  const completed = completedTaskItems();
  list.innerHTML = completed.length
    ? completed.map((task) => `
        <article class="completed-task-card">
          <strong>${escapeHtml(task.title)}</strong>
          <span>${escapeHtml(task.status)}</span>
          <p>${escapeHtml(task.body || task.source)}</p>
          <small>${escapeHtml(task.source)}</small>
        </article>
      `).join("")
    : "<p>No completed tasks yet in this Labs session.</p>";
}

function renderPortfolioTasksState() {
  const page = document.querySelector("[data-portfolio-tasks]");

  if (!page) {
    return;
  }

  const activeTasks = activeTaskItems();
  const completedTasks = completedTaskItems();
  const highestPriority = activeTasks.find((task) => task.id === "eicr")
    || activeTasks.find((task) => task.id === "inspection")
    || activeTasks[0];
  const activeRequest = highestPriority ? activeRequestForTask(highestPriority) : null;

  document.querySelector("[data-tasks-active-pill]").textContent = `${activeTasks.length} active ${activeTasks.length === 1 ? "task" : "tasks"}`;
  document.querySelector("[data-tasks-active-count]").textContent = String(activeTasks.length);
  document.querySelector("[data-tasks-priority-label]").textContent = highestPriority?.id === "eicr" ? "EICR" : highestPriority?.id === "inspection" ? "Inspection" : "Licensing";
  document.querySelector("[data-tasks-completed-count]").textContent = String(completedTasks.length);
  document.querySelector("[data-tasks-start-title]").textContent = highestPriority?.id === "eicr" ? "Upload or arrange an EICR" : highestPriority?.id === "inspection" ? "Add inspection evidence" : "Review local licensing position";
  document.querySelector("[data-tasks-start-body]").textContent = highestPriority?.id === "eicr"
    ? "Electrical Safety is the clearest evidence gap in this property file."
    : highestPriority?.id === "inspection"
      ? "Electrical Safety evidence is now verified. A recent property inspection record is the next useful evidence item."
      : "CMP is still checking whether local rules may affect this address.";
  document.querySelector("[data-tasks-start-source]").textContent = highestPriority?.id === "eicr"
    ? "Source: Compliance Centre · Evidence Vault"
    : highestPriority?.id === "inspection"
      ? "Source: Evidence Vault · Compliance Centre"
      : "Source: Compliance Centre";
  document.querySelector("[data-tasks-start-status]").textContent = highestPriority?.status || "Open";
  document.querySelector("[data-tasks-start-status]").classList.toggle("status-review-text", highestPriority?.id === "eicr");
  document.querySelector("[data-tasks-start-status]").classList.toggle("status-watch-text", highestPriority?.id !== "eicr");

  const supportIndicator = document.querySelector("[data-tasks-support-indicator]");
  if (supportIndicator) {
    supportIndicator.hidden = !activeRequest;
    supportIndicator.textContent = activeRequest ? `${activeRequest.type} open` : "Support request open";
  }

  const startActions = document.querySelector("[data-tasks-start-actions]");
  if (startActions && highestPriority) {
    startActions.innerHTML = highestPriority.actions.map((action) => `
      <button class="${action.primary ? "primary-button" : action.action === "openProperty" ? "text-button" : "secondary-button"}" type="button" data-task-action="${action.action}">
        ${escapeHtml(action.label)}
      </button>
    `).join("");
  }

  const searchInput = document.querySelector("[data-task-search]");
  if (searchInput && searchInput.value !== labsState.taskSearch) {
    searchInput.value = labsState.taskSearch;
  }

  document.querySelectorAll("[data-task-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.taskFilter === labsState.taskFilter);
  });
  document.querySelectorAll("[data-task-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.taskView === labsState.taskView);
  });

  const taskSource = labsState.taskView === "board"
    ? allTaskItems()
    : labsState.taskFilter === "completed"
      ? completedTasks
      : activeTasks;
  const tasksForView = taskSource.filter(taskMatchesCurrentView);
  const list = document.querySelector("[data-task-list]");
  const board = document.querySelector("[data-task-board]");
  const empty = document.querySelector("[data-task-empty]");
  const hasTasks = Boolean(tasksForView.length);

  if (list) {
    list.hidden = labsState.taskView !== "list" || !hasTasks;
    list.innerHTML = tasksForView.map((task) => renderTaskCard(task)).join("");
  }
  if (board) {
    board.hidden = labsState.taskView !== "board" || !hasTasks;
    board.innerHTML = renderTaskBoard(tasksForView);
  }
  if (empty) {
    empty.hidden = hasTasks;
  }

  renderCompletedTasks();
}

function showPortfolioTasks({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-tasks]",
    view: "tasks",
    navLabel: "Tasks",
    bodyClass: "portfolio-tasks-active",
    response: getTasksAssistantResponse("What should I do first?"),
    scroll
  });
}

function activeSupportRequestForActivity() {
  return labsState.serviceRequests.find((request) => request.status !== "Cancelled");
}

function makeActivityAction(label, action, primary = false) {
  return { label, action, primary };
}

function getActivityEvents() {
  const property = "57 The Butts · CV1 3BJ";
  const activeSupportRequest = activeSupportRequestForActivity();
  const events = [];

  if (activeSupportRequest) {
    events.push({
      id: "support-request-created",
      group: "Today",
      filter: "support",
      category: "Support",
      title: "Support request created",
      property,
      body: "A prototype support request was created from the Services workspace.",
      source: "Services",
      status: "Awaiting review",
      statusClass: "status-watch-text",
      search: `${activeSupportRequest.type} support service request awaiting review 57 butts`,
      why: "CMP recorded this because a prototype support request was created from the Services workspace.",
      nextAction: "Open Services to review the request.",
      route: "services",
      actions: [
        makeActivityAction("Open services", "openServices"),
        makeActivityAction("View request", "viewRequest")
      ]
    });
  }

  if (labsState.inspectionStatusRecorded) {
    events.push({
      id: "inspection-status-recorded",
      group: "Today",
      filter: "tasks",
      category: "Tasks",
      title: "Inspection status recorded",
      property,
      body: "Inspection evidence was marked as not yet completed in this Labs preview.",
      source: "Tasks",
      status: "Recorded",
      statusClass: "status-neutral-text",
      search: "inspection task evidence status recorded not completed 57 butts",
      why: "CMP recorded this because the inspection evidence task was marked as not yet completed.",
      nextAction: "Return to Tasks when inspection evidence is available.",
      route: "tasks",
      actions: [
        makeActivityAction("Open task", "openTask"),
        makeActivityAction("Open property", "openProperty")
      ]
    });
  }

  labsState.propertyEvents
    .filter((event) => ["property-update", "optional-details", "memory-observation", "alarm-answer"].includes(event.type))
    .forEach((event) => {
      const isAnswer = event.type === "alarm-answer";
      events.push({
        id: `property-event-${event.id}`,
        group: "Today",
        filter: isAnswer ? "answers" : "details",
        category: isAnswer ? "Landlord answer" : "Property details",
        title: event.title,
        property,
        body: event.body,
        source: event.details?.rows?.find(([term]) => term === "Source")?.[1] || "Property details",
        status: event.badge || "Recorded",
        statusClass: event.badgeClass || "status-watch-text",
        search: `${event.title} ${event.body} property details landlord answer alarm 57 butts`,
        why: "CMP recorded this because property information changed in the Labs preview.",
        nextAction: isAnswer ? "Review the property timeline or add supporting evidence." : "Open Property details to review the saved information.",
        route: isAnswer ? "timeline" : "details",
        actions: [
          makeActivityAction(isAnswer ? "Review answer" : "View property details", isAnswer ? "openTimeline" : "openDetails")
        ]
      });
    });

  if (labsState.eicrAdded) {
    events.push({
      id: "eicr-verified",
      group: "Today",
      filter: "evidence",
      category: "Evidence",
      title: "EICR evidence verified",
      property,
      body: "A satisfactory Electrical Installation Condition Report was reviewed and added to the property file.",
      source: "Documents · Smart Upload",
      status: "Verified",
      statusClass: "status-good-text",
      search: "eicr electrical installation condition report evidence verified uploaded smart upload 57 butts",
      why: "CMP recorded this because the uploaded EICR was confirmed and linked to 57 The Butts.",
      nextAction: "View the evidence record or continue to the property workspace.",
      route: "evidence",
      actions: [
        makeActivityAction("View evidence", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    });
  }

  events.push(
    {
      id: "electrical-gap",
      group: "Today",
      filter: "compliance",
      category: "Compliance",
      title: "Electrical Safety gap identified",
      property,
      body: labsState.eicrAdded
        ? "This gap was resolved after EICR evidence was verified."
        : "CMP could not find a current EICR in the property file. Electrical Safety became the clearest evidence priority.",
      source: "Compliance Centre",
      status: labsState.eicrAdded ? "Resolved" : "Needs checking",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      resolved: labsState.eicrAdded,
      open: !labsState.eicrAdded,
      search: `eicr electrical safety compliance gap ${labsState.eicrAdded ? "resolved historical" : "missing needs checking"} 57 butts`,
      why: labsState.eicrAdded
        ? "This is retained as history. The gap was resolved when EICR evidence was verified."
        : "CMP recorded this because no current EICR was found in the property file.",
      nextAction: labsState.eicrAdded ? "No EICR action is needed now." : "Upload EICR or ask CMP for help.",
      route: labsState.eicrAdded ? "evidence" : "documents",
      actions: labsState.eicrAdded
        ? [
            makeActivityAction("View evidence", "viewEvidence"),
            makeActivityAction("Open property", "openProperty")
          ]
        : [
            makeActivityAction("Upload EICR", "uploadEicr", true),
            makeActivityAction("Ask CMP", "askEicr"),
            makeActivityAction("Open property", "openProperty")
          ]
    },
    {
      id: "inspection-follow-up",
      group: "Today",
      filter: "tasks",
      category: "Tasks",
      title: "Inspection follow-up prepared",
      property,
      body: "CMP prepared inspection evidence as a useful follow-up item for this vacant property.",
      source: "Tasks",
      status: "Prepared",
      statusClass: "status-watch-text",
      search: "inspection follow up prepared task evidence 57 butts vacant",
      why: "CMP recorded this because inspection evidence is a useful follow-up item for a vacant property.",
      nextAction: "Open the task or upload inspection evidence when available.",
      route: "tasks",
      actions: [
        makeActivityAction("Open task", "openTask"),
        makeActivityAction("Upload inspection evidence", "uploadInspection")
      ]
    },
    {
      id: "licensing-review",
      group: "Today",
      filter: "compliance",
      category: "Compliance",
      title: "Local licensing review started",
      property,
      body: "CMP marked the postcode for a local rules review so the property file can show whether any extra checks may be relevant.",
      source: "Compliance Centre",
      status: "Checking",
      statusClass: "status-watch-text",
      search: "licensing local rules postcode review compliance 57 butts",
      why: "CMP recorded this because local rules can depend on postcode and property setup.",
      nextAction: "Review licensing in the property Compliance tab.",
      route: "compliance",
      actions: [
        makeActivityAction("Review licensing", "reviewLicensing"),
        makeActivityAction("Ask CMP", "askLicensing")
      ]
    },
    {
      id: "gas-verified",
      group: "Earlier this week",
      filter: "evidence",
      category: "Evidence",
      title: "Gas Safety Certificate verified",
      property,
      body: "Uploaded certificate reviewed and stored against the property file.",
      source: "Evidence Vault",
      status: "Verified",
      statusClass: "status-good-text",
      search: "gas safety certificate evidence verified document 57 butts",
      why: "CMP recorded this because an uploaded Gas Safety certificate was reviewed and stored.",
      nextAction: "View the evidence record or open the property.",
      route: "evidence",
      actions: [
        makeActivityAction("View evidence", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    },
    {
      id: "epc-imported",
      group: "Earlier this week",
      filter: "evidence",
      category: "Official record",
      title: "EPC record imported",
      property,
      body: "CMP matched an Energy Performance Certificate to this property.",
      source: "Official record",
      status: "Confirmed",
      statusClass: "status-good-text",
      search: "epc energy performance certificate official record imported confirmed 57 butts",
      why: "CMP recorded this because an EPC official record was matched to 57 The Butts.",
      nextAction: "View the record or open the property.",
      route: "evidence",
      actions: [
        makeActivityAction("View record", "viewEvidence"),
        makeActivityAction("Open property", "openProperty")
      ]
    },
    {
      id: "alarms-confirmed",
      group: "Earlier this week",
      filter: "answers",
      category: "Landlord answer",
      title: "Alarm testing confirmed",
      property,
      body: "Smoke and CO alarms were reported as tested. Supporting evidence has not yet been uploaded.",
      source: "Landlord answer",
      status: "Landlord confirmed",
      statusClass: "status-watch-text",
      search: "alarm smoke co landlord answer confirmed evidence 57 butts",
      why: "CMP recorded this because the landlord answer affects the property evidence picture.",
      nextAction: "Add supporting evidence when available or review the answer.",
      route: "timeline",
      actions: [
        makeActivityAction("Add evidence", "addEvidence"),
        makeActivityAction("Review answer", "openTimeline")
      ]
    },
    {
      id: "vacant-scenario",
      group: "Earlier this week",
      filter: "details",
      category: "Property details",
      title: "Property marked as vacant",
      property,
      body: "CMP adjusted suggested next steps to focus on core evidence, inspection records and readiness for a future tenancy.",
      source: "Property details",
      status: "Scenario updated",
      statusClass: "status-watch-text",
      search: "property details vacant scenario updated 57 butts",
      why: "CMP recorded this because occupancy affects which next steps are most useful.",
      nextAction: "View Property details.",
      route: "details",
      actions: [
        makeActivityAction("View property details", "openDetails")
      ]
    },
    {
      id: "file-created",
      group: "Earlier this week",
      filter: "details",
      category: "Property setup",
      title: "Property file created",
      property,
      body: "57 The Butts was added to the CMP Labs workspace.",
      source: "Property setup",
      status: "Recorded",
      statusClass: "status-neutral-text",
      search: "property setup file created 57 butts",
      why: "CMP recorded this because the property file was created in the Labs workspace.",
      nextAction: "Open the property workspace.",
      route: "overview",
      actions: [
        makeActivityAction("Open property", "openProperty")
      ]
    }
  );

  return events;
}

function activityMatchesCurrentView(event) {
  const query = labsState.activitySearch.trim().toLowerCase();
  const text = `${event.category} ${event.title} ${event.property} ${event.body} ${event.source} ${event.status} ${event.search}`.toLowerCase();
  const matchesSearch = !query || text.includes(query);
  const matchesFilter = labsState.activityFilter === "all" || event.filter === labsState.activityFilter;

  return matchesSearch && matchesFilter;
}

function renderActivityEvent(event) {
  const actions = event.actions.map((action) => `
    <button class="${action.primary ? "primary-button" : "text-button"}" type="button" data-activity-action="${escapeHtml(action.action)}">
      ${escapeHtml(action.label)}
    </button>
  `).join("");

  return `
    <article class="activity-event${event.open ? " is-open" : ""}${event.resolved ? " is-resolved" : ""}" data-activity-event="${escapeHtml(event.id)}">
      <div class="activity-event-top">
        <div>
          <span class="timeline-event-kicker"><span class="nav-icon" data-icon="clock"></span>${escapeHtml(event.category)}</span>
          <button class="activity-event-title" type="button" data-activity-detail="${escapeHtml(event.id)}">
            <h3>${escapeHtml(event.title)}</h3>
          </button>
          <span class="activity-property-label">${escapeHtml(event.property)}</span>
        </div>
        <span class="doc-status ${event.statusClass}">${escapeHtml(event.status)}</span>
      </div>
      <p>${escapeHtml(event.body)}</p>
      <div class="activity-source-row">
        <span>Source: ${escapeHtml(event.source)}</span>
        <span>${escapeHtml(event.category)}</span>
      </div>
      <div class="activity-event-actions">
        ${actions}
        <button class="text-button" type="button" data-activity-detail="${escapeHtml(event.id)}">Show details</button>
      </div>
    </article>
  `;
}

function renderPortfolioActivityState() {
  const page = document.querySelector("[data-portfolio-activity]");

  if (!page) {
    return;
  }

  const allEvents = getActivityEvents();
  const supportCreated = Boolean(activeSupportRequestForActivity());
  const visitItems = labsState.eicrAdded
    ? [
        "EICR evidence was verified",
        "Gas Safety evidence was verified",
        "Inspection evidence is now the next useful upload",
        ...(supportCreated ? ["Support request was created"] : [])
      ]
    : [
        "Gas Safety evidence was verified",
        "Electrical Safety became the highest-priority evidence gap",
        ...(supportCreated ? ["Support request was created"] : [])
      ];
  const watchItems = labsState.eicrAdded
    ? ["Inspection evidence", "Local licensing review"]
    : ["Electrical Safety evidence", "Inspection evidence", "Local licensing review"];

  document.querySelector("[data-activity-event-count]").textContent = String(allEvents.length);
  document.querySelector("[data-activity-evidence-count]").textContent = labsState.eicrAdded ? "3" : "2";
  document.querySelector("[data-activity-action-count]").textContent = String(1 + (supportCreated ? 1 : 0) + (labsState.inspectionStatusRecorded ? 1 : 0));
  document.querySelector("[data-activity-open-count]").textContent = "1";
  document.querySelector("[data-activity-open-detail]").textContent = labsState.eicrAdded ? "inspection evidence" : "EICR gap";
  document.querySelector("[data-activity-visit-title]").textContent = `${visitItems.length} useful updates`;
  document.querySelector("[data-activity-visit-list]").innerHTML = visitItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("[data-activity-watch-list]").innerHTML = watchItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const searchInput = document.querySelector("[data-activity-search]");
  if (searchInput && searchInput.value !== labsState.activitySearch) {
    searchInput.value = labsState.activitySearch;
  }

  document.querySelectorAll("[data-activity-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.activityFilter === labsState.activityFilter);
  });

  const events = allEvents.filter(activityMatchesCurrentView);
  const groups = [...new Set(events.map((event) => event.group))];
  const feed = document.querySelector("[data-activity-feed]");
  const empty = document.querySelector("[data-activity-empty]");

  if (feed) {
    feed.hidden = !events.length;
    feed.innerHTML = groups.map((group) => `
      <section class="activity-day">
        <span class="activity-day-label">${escapeHtml(group)}</span>
        <div class="activity-events">
          ${events.filter((event) => event.group === group).map(renderActivityEvent).join("")}
        </div>
      </section>
    `).join("");
  }

  if (empty) {
    empty.hidden = Boolean(events.length);
  }

  renderActivitySummaryModalState();
}

function showPortfolioActivity({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-activity]",
    view: "activity",
    navLabel: "Activity",
    bodyClass: "portfolio-activity-active",
    response: getActivityAssistantResponse("What changed recently?"),
    scroll
  });
}

function globalServiceCards() {
  return [
    {
      title: "EICR",
      body: labsState.eicrAdded ? "Electrical Safety evidence is already verified for 57 The Butts." : "Arrange or upload Electrical Safety evidence for 57 The Butts.",
      status: labsState.eicrAdded ? "Recorded" : "Recommended",
      statusClass: labsState.eicrAdded ? "status-good-text" : "status-review-text",
      action: labsState.eicrAdded ? "viewEicr" : "support",
      button: labsState.eicrAdded ? "View evidence" : "Request EICR support"
    },
    {
      title: "Gas Safety",
      body: "Gas Safety evidence is already verified and stored in the property file.",
      status: "Verified",
      statusClass: "status-good-text",
      action: "viewEvidence",
      button: "View evidence"
    },
    {
      title: "EPC",
      body: "CMP has matched an EPC official record to this property.",
      status: "Confirmed",
      statusClass: "status-good-text",
      action: "viewEvidence",
      button: "View record"
    },
    {
      title: "Property inspection",
      body: "Inspection evidence is useful for keeping the property file current.",
      status: labsState.eicrAdded ? "Next useful" : "Follow-up",
      statusClass: "status-watch-text",
      action: labsState.eicrAdded ? "support" : "uploadInspection",
      button: labsState.eicrAdded ? "Request inspection support" : "Upload later"
    },
    {
      title: "Licensing review",
      body: "Review local rules and property setup before treating licensing as confirmed.",
      status: "Checking",
      statusClass: "status-watch-text",
      action: "licensing",
      button: "Review licensing"
    },
    {
      title: "Tenancy document review",
      body: "A future CMP workflow could help organise tenancy paperwork before move-in.",
      status: "Preview",
      statusClass: "status-neutral-text",
      action: "tenancy",
      button: "Preview"
    }
  ];
}

function renderPortfolioUtilityState() {
  const askResponse = document.querySelector("[data-utility-ask-response]");
  if (askResponse) {
    askResponse.textContent = getGlobalAskDefaultResponse();
  }

  renderGlobalServiceState();
  renderLearnGuides();
  renderSettingsState();
}

function renderGlobalServiceState() {
  const title = document.querySelector("[data-global-service-title]");

  if (!title) {
    return;
  }

  title.textContent = labsState.eicrAdded ? "Arrange or record a property inspection" : "Arrange an EICR";
  document.querySelector("[data-global-service-body]").textContent = labsState.eicrAdded
    ? "Core certificates are now recorded. A recent inspection record is the next useful evidence item."
    : "Electrical Safety evidence is currently missing for 57 The Butts.";
  document.querySelector("[data-global-service-actions]").innerHTML = labsState.eicrAdded
    ? `
      <button class="primary-button" type="button" data-global-service-action="support">Request inspection support</button>
      <button class="secondary-button" type="button" data-global-service-action="uploadInspection">Upload inspection evidence</button>
      <button class="text-button" type="button" data-global-service-action="ask">Ask CMP why</button>
    `
    : `
      <button class="primary-button" type="button" data-global-service-action="support">Request EICR support</button>
      <button class="secondary-button" type="button" data-global-service-action="uploadEicr">Upload existing EICR</button>
      <button class="text-button" type="button" data-global-service-action="ask">Ask CMP why</button>
    `;

  const cardGrid = document.querySelector("[data-global-service-cards]");
  if (cardGrid) {
    cardGrid.innerHTML = globalServiceCards().map((card) => `
      <article class="service-option-preview">
        <div class="service-card-top">
          <h3>${escapeHtml(card.title)}</h3>
          <span class="doc-status ${card.statusClass}">${escapeHtml(card.status)}</span>
        </div>
        <p>${escapeHtml(card.body)}</p>
        <div class="button-row">
          <button class="${card.action === "support" ? "primary-button" : "secondary-button"}" type="button" data-global-service-action="${escapeHtml(card.action)}">${escapeHtml(card.button)}</button>
        </div>
      </article>
    `).join("");
  }

  const requests = labsState.serviceRequests.filter((request) => request.status !== "Cancelled");
  document.querySelector("[data-global-service-request-count]").textContent = requests.length === 1 ? "1 open" : `${requests.length} open`;
  const list = document.querySelector("[data-global-service-requests]");
  if (list) {
    list.innerHTML = requests.length
      ? requests.map((request) => `
        <article class="global-request-card">
          <strong>${escapeHtml(request.type)}</strong>
          <span class="doc-status status-watch-text">${escapeHtml(request.status)}</span>
          <p>${escapeHtml(request.linkedTo)} · 57 The Butts · ${escapeHtml(request.created)}</p>
        </article>
      `).join("")
      : "<p>No open support requests.</p>";
  }
}

function renderLearnGuides() {
  const grid = document.querySelector("[data-learn-guide-grid]");

  if (!grid || grid.dataset.rendered === "true") {
    return;
  }

  grid.innerHTML = guidePreviews.map((guide, index) => `
    <article class="learn-guide-card">
      <div class="learn-card-top">
        <span class="source-badge">${escapeHtml(guide.category)}</span>
      </div>
      <h3>${escapeHtml(guide.title)}</h3>
      <p>${escapeHtml(guide.summary)}</p>
      <div class="button-row">
        <button class="secondary-button" type="button" data-learn-guide="${index}">Read preview</button>
      </div>
    </article>
  `).join("");
  grid.dataset.rendered = "true";
}

function renderSettingsState() {
  document.querySelectorAll("[data-settings-toggle]").forEach((button) => {
    const key = button.dataset.settingsToggle;
    const value = Boolean(labsState.settings[key]);
    button.classList.toggle("is-on", value);
    const label = button.querySelector("strong");
    if (label) {
      label.textContent = value ? "On" : "Off";
    }
  });

  document.body.classList.toggle("hide-prototype-labels", !labsState.settings.showPrototypeLabels);
  document.body.classList.toggle("labs-compact", labsState.settings.compactMode);
}

function showGlobalAskPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-ask]",
    view: "askCmp",
    navLabel: "Ask CMP",
    response: getGlobalAskDefaultResponse(),
    scroll
  });
}

function showGlobalServicePage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-service]",
    view: "bookService",
    navLabel: "Book a service",
    response: getGlobalServiceAssistantResponse("What should I book first?"),
    scroll
  });
}

function showLearnPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-learn]",
    view: "learn",
    navLabel: "Learn",
    response: getLearnAssistantResponse("Explain EICR"),
    scroll
  });
}

function showSettingsPage({ scroll = false } = {}) {
  activatePortfolioPage({
    selector: "[data-portfolio-settings]",
    view: "settings",
    navLabel: "Settings",
    response: getSettingsAssistantResponse("What can CMP notify me about?"),
    scroll
  });
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
    button.addEventListener("click", openAddPropertyModal);
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
    showPortfolioEvidence({ scroll: true });
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
    button.addEventListener("click", openAddPropertyModal);
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

      if (item.dataset.globalNav === "Compliance centre") {
        showPortfolioCompliance({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Evidence Vault") {
        showPortfolioEvidence({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Tasks") {
        showPortfolioTasks({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Activity") {
        showPortfolioActivity({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Ask CMP") {
        showGlobalAskPage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Book a service") {
        showGlobalServicePage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Learn") {
        showLearnPage({ scroll: true });
        return;
      }

      if (item.dataset.globalNav === "Settings") {
        showSettingsPage({ scroll: true });
        return;
      }

      showToast("This Labs navigation item is a preview and is not connected yet.");
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

function bindPortfolioCompliance() {
  document.querySelector("[data-compliance-ask]")?.addEventListener("click", () => {
    openAssistant(getComplianceCentreAssistantResponse("What should I fix first?"));
    focusAssistantInput();
  });

  document.querySelector("[data-compliance-review-actions]")?.addEventListener("click", () => {
    scrollToPanel("[data-compliance-gaps-section]");
  });

  document.querySelector("[data-compliance-priority-upload]")?.addEventListener("click", () => {
    if (labsState.eicrAdded) {
      showToast("Inspection evidence upload will be connected in a later Labs pass.");
      return;
    }

    openPropertyWorkspace("documents", "[data-document-upload-panel]");
  });

  document.querySelector("[data-compliance-priority-support]")?.addEventListener("click", () => {
    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  });

  document.querySelector("[data-compliance-open-property]")?.addEventListener("click", () => {
    openPropertyWorkspace("overview");
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-compliance-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.complianceAction;

    if (action === "uploadEicr") {
      openPropertyWorkspace("documents", "[data-document-upload-panel]");
    } else if (action === "requestSupport") {
      openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
    } else if (action === "uploadInspection") {
      showToast("Inspection evidence upload will be connected in a later Labs pass.");
    } else if (action === "markInspection") {
      showToast("Inspection status marked as not completed for this Labs preview.");
    } else if (action === "reviewLicensing") {
      openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
    } else if (action === "askLicensing") {
      openAssistant(assistantResponses["Why is licensing still checking?"]);
    }
  });
}

function openPropertySmartUpload({ previewDemo = false } = {}) {
  openPropertyWorkspace("documents", "[data-document-upload-panel]");

  if (previewDemo) {
    window.setTimeout(openSmartModal, 120);
  }
}

function copyEvidenceInboxAddress() {
  const address = document.querySelector("[data-evidence-inbox-address]")?.textContent?.trim()
    || "57-the-butts@inbox.complymyproperty.co.uk";
  copyInboxAddress(address);
}

function handleEvidenceAction(action) {
  if (action === "openProperty") {
    openPropertyWorkspace("overview");
  } else if (action === "uploadEicr" || action === "replaceEicr" || action === "replaceGas") {
    openPropertySmartUpload();
  } else if (action === "arrangeEicr") {
    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  } else if (action === "uploadInspection") {
    showToast("Inspection evidence upload will be connected in a later Labs pass.");
  } else if (action === "markInspection") {
    showToast("Inspection status recorded for this Labs preview.");
  } else if (action === "viewEpc") {
    showToast("EPC record viewer is not connected in Labs.");
  } else if (action === "viewGas") {
    showToast("Gas Safety viewer is not connected in Labs.");
  } else if (action === "viewEicr") {
    showToast("EICR viewer is not connected in Labs.");
  }
}

function bindPortfolioEvidence() {
  document.querySelector("[data-evidence-upload]")?.addEventListener("click", () => {
    openPropertySmartUpload();
  });

  document.querySelectorAll("[data-evidence-copy-inbox]").forEach((button) => {
    button.addEventListener("click", copyEvidenceInboxAddress);
  });

  document.querySelector("[data-evidence-ask]")?.addEventListener("click", () => {
    openAssistant(getEvidenceVaultAssistantResponse("What evidence is missing?"));
    focusAssistantInput();
  });

  document.querySelector("[data-evidence-open-property-inbox]")?.addEventListener("click", () => {
    openPropertyWorkspace("documents", "[data-document-inbox-panel]");
  });

  document.querySelector("[data-evidence-forwarding-help]")?.addEventListener("click", () => {
    openTimelineModal("[data-evidence-inbox-modal]");
  });

  document.querySelector("[data-evidence-search]")?.addEventListener("input", (event) => {
    labsState.evidenceSearch = event.target.value;
    renderPortfolioEvidenceState();
  });

  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.evidenceFilter = button.dataset.evidenceFilter;
      renderPortfolioEvidenceState();
    });
  });

  document.querySelectorAll("[data-evidence-view]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.evidenceView = button.dataset.evidenceView;
      renderPortfolioEvidenceState();
    });
  });

  document.querySelector("[data-evidence-clear]")?.addEventListener("click", () => {
    labsState.evidenceSearch = "";
    labsState.evidenceFilter = "all";
    renderPortfolioEvidenceState();
  });

  document.querySelector("[data-evidence-demo-upload]")?.addEventListener("click", () => {
    openPropertySmartUpload({ previewDemo: true });
  });

  document.querySelectorAll("[data-evidence-open-documents]").forEach((button) => {
    button.addEventListener("click", () => {
      openPropertyWorkspace("documents");
    });
  });

  document.querySelector("[data-evidence-open-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelector("[data-evidence-open-services]")?.addEventListener("click", () => {
    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-evidence-action]");

    if (actionButton) {
      handleEvidenceAction(actionButton.dataset.evidenceAction);
    }
  });

  document.querySelectorAll("[data-evidence-inbox-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function markInspectionTaskNotCompleted() {
  if (labsState.inspectionStatusRecorded) {
    showToast("Inspection status already recorded for this Labs preview.");
    return;
  }

  labsState.inspectionStatusRecorded = true;
  addPropertyTimelineEvent({
    type: "inspection-status-recorded",
    filter: "actions",
    icon: "calendar",
    category: "Actions",
    title: "Inspection status recorded",
    body: "Inspection evidence was marked as not completed in this Labs preview.",
    badge: "Recorded",
    badgeClass: "status-neutral-text",
    activityLabel: "Inspection status recorded",
    details: {
      title: "Inspection status",
      rows: [
        ["Property", "57 The Butts"],
        ["Area", "Property inspection"],
        ["Status", "Marked as not completed"],
        ["Source", "Portfolio Tasks"]
      ],
      note: "Prototype task action for layout testing."
    }
  });
  showToast("Inspection status recorded for this Labs preview.");
}

function handleTaskAction(action) {
  if (action === "uploadEicr") {
    openPropertySmartUpload();
  } else if (action === "requestSupport") {
    openPropertyWorkspace("services", currentComplianceRequest() ? "[data-open-requests-panel]" : "[data-service-primary-card]");
  } else if (action === "openProperty") {
    openPropertyWorkspace("overview");
  } else if (action === "uploadInspection") {
    showToast("Inspection evidence upload will be connected in a later Labs pass.");
  } else if (action === "markInspection") {
    markInspectionTaskNotCompleted();
  } else if (action === "reviewLicensing") {
    openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
  } else if (action === "askLicensing") {
    openAssistant("Licensing is still under postcode review. CMP is keeping it visible, but inspection evidence is the more useful next action unless your plans change soon.");
  }
}

function openTaskDetail(taskId) {
  const task = allTaskItems().find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  document.querySelector("[data-task-detail-body]").textContent = task.detail;
  document.querySelector("[data-task-detail-property]").textContent = task.property;
  document.querySelector("[data-task-detail-category]").textContent = task.category;
  document.querySelector("[data-task-detail-source]").textContent = task.source;
  document.querySelector("[data-task-detail-status]").textContent = task.status;
  document.querySelector("[data-task-detail-action]").textContent = task.suggestedAction;
  document.querySelector("[data-task-detail-open-property]").dataset.taskDetailProperty = task.id;
  openTimelineModal("[data-task-detail-modal]");
}

function bindPortfolioTasks() {
  document.querySelector("[data-tasks-ask]")?.addEventListener("click", () => {
    openAssistant(getTasksAssistantResponse("What should I do first?"));
    focusAssistantInput();
  });

  document.querySelector("[data-tasks-review-completed]")?.addEventListener("click", () => {
    scrollToPanel("[data-tasks-completed-section]");
  });

  document.querySelector("[data-task-search]")?.addEventListener("input", (event) => {
    labsState.taskSearch = event.target.value;
    renderPortfolioTasksState();
  });

  document.querySelectorAll("[data-task-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.taskFilter = button.dataset.taskFilter;
      renderPortfolioTasksState();
    });
  });

  document.querySelectorAll("[data-task-view]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.taskView = button.dataset.taskView;
      renderPortfolioTasksState();
    });
  });

  document.querySelector("[data-task-clear]")?.addEventListener("click", () => {
    labsState.taskSearch = "";
    labsState.taskFilter = "all";
    renderPortfolioTasksState();
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-task-action]");
    if (actionButton) {
      handleTaskAction(actionButton.dataset.taskAction);
      return;
    }

    const detailButton = event.target.closest("[data-task-detail]");
    if (detailButton) {
      openTaskDetail(detailButton.dataset.taskDetail);
    }
  });

  document.querySelector("[data-task-detail-open-property]")?.addEventListener("click", () => {
    closeTimelineModals();
    openPropertyWorkspace("overview");
  });

  document.querySelectorAll("[data-task-detail-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });
}

function openActivityRelatedPage(event) {
  if (!event) {
    return;
  }

  if (event.route === "services") {
    openPropertyWorkspace("services", "[data-open-requests-panel]");
  } else if (event.route === "tasks") {
    closeTimelineModals();
    showPortfolioTasks({ scroll: true });
  } else if (event.route === "evidence") {
    closeTimelineModals();
    showPortfolioEvidence({ scroll: true });
  } else if (event.route === "documents") {
    openPropertyWorkspace("documents", "[data-document-upload-panel]");
  } else if (event.route === "compliance") {
    openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
  } else if (event.route === "details") {
    openPropertyWorkspace("details");
  } else if (event.route === "timeline") {
    openPropertyWorkspace("timeline");
  } else {
    openPropertyWorkspace("overview");
  }
}

function openActivityDetail(eventId) {
  const event = getActivityEvents().find((item) => item.id === eventId);

  if (!event) {
    return;
  }

  document.querySelector("[data-activity-detail-title]").textContent = event.title;
  document.querySelector("[data-activity-detail-property]").textContent = event.property;
  document.querySelector("[data-activity-detail-category]").textContent = event.category;
  document.querySelector("[data-activity-detail-source]").textContent = event.source;
  document.querySelector("[data-activity-detail-status]").textContent = event.status;
  document.querySelector("[data-activity-detail-why]").textContent = event.why;
  document.querySelector("[data-activity-detail-action]").textContent = event.nextAction;
  document.querySelector("[data-activity-detail-open]").dataset.activityDetailOpen = event.id;
  openTimelineModal("[data-activity-detail-modal]");
}

function renderActivitySummaryModalState() {
  const evidenceList = document.querySelector("[data-activity-summary-evidence]");

  if (!evidenceList) {
    return;
  }

  evidenceList.innerHTML = labsState.eicrAdded
    ? `
      <li>EICR evidence verified</li>
      <li>Gas Safety evidence verified</li>
      <li>EPC record imported</li>
    `
    : `
      <li>Gas Safety evidence verified</li>
      <li>EPC record imported</li>
    `;

  document.querySelector("[data-activity-summary-open-list]").innerHTML = labsState.eicrAdded
    ? `
      <li>Inspection evidence</li>
      <li>Local licensing review</li>
    `
    : `
      <li>Electrical Safety evidence</li>
      <li>Inspection evidence</li>
      <li>Local licensing review</li>
    `;

  document.querySelector("[data-activity-summary-resolved]").innerHTML = labsState.eicrAdded
    ? `
      <li>Electrical Safety gap resolved</li>
      <li>Gas Safety certificate verified</li>
    `
    : `
      <li>Gas Safety certificate verified</li>
    `;

  document.querySelector("[data-activity-summary-next]").textContent = labsState.eicrAdded
    ? "Add inspection evidence or record that no recent inspection has been completed."
    : "Upload or arrange an EICR for 57 The Butts.";
}

function handleActivityAction(action) {
  if (action === "uploadEicr") {
    openPropertySmartUpload();
  } else if (action === "askEicr") {
    openAssistant(getActivityAssistantResponse("What still needs attention?"));
  } else if (action === "openProperty") {
    openPropertyWorkspace("overview");
  } else if (action === "openTask") {
    showPortfolioTasks({ scroll: true });
  } else if (action === "uploadInspection") {
    showToast("Inspection evidence upload will be connected in a later Labs pass.");
  } else if (action === "reviewLicensing") {
    openPropertyWorkspace("compliance", "[data-compliance-licensing-card]");
  } else if (action === "askLicensing") {
    openAssistant(getActivityAssistantResponse("What still needs attention?"));
  } else if (action === "viewEvidence") {
    showPortfolioEvidence({ scroll: true });
  } else if (action === "addEvidence") {
    openPropertyWorkspace("documents", "[data-document-upload-panel]");
  } else if (action === "openTimeline") {
    openPropertyWorkspace("timeline");
  } else if (action === "openDetails") {
    openPropertyWorkspace("details");
  } else if (action === "openServices" || action === "viewRequest") {
    openPropertyWorkspace("services", "[data-open-requests-panel]");
  }
}

function bindPortfolioActivity() {
  document.querySelector("[data-activity-ask]")?.addEventListener("click", () => {
    openAssistant(getActivityAssistantResponse("What changed recently?"));
    focusAssistantInput();
  });

  document.querySelector("[data-activity-open-timeline]")?.addEventListener("click", () => {
    openPropertyWorkspace("timeline");
  });

  document.querySelector("[data-activity-search]")?.addEventListener("input", (event) => {
    labsState.activitySearch = event.target.value;
    renderPortfolioActivityState();
  });

  document.querySelectorAll("[data-activity-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      labsState.activityFilter = button.dataset.activityFilter;
      renderPortfolioActivityState();
    });
  });

  document.querySelector("[data-activity-clear]")?.addEventListener("click", () => {
    labsState.activitySearch = "";
    labsState.activityFilter = "all";
    renderPortfolioActivityState();
  });

  document.querySelector("[data-activity-summary-open]")?.addEventListener("click", () => {
    renderActivitySummaryModalState();
    openTimelineModal("[data-activity-summary-modal]");
  });

  document.querySelector("[data-activity-preview-export]")?.addEventListener("click", () => {
    showToast("Activity export will be connected in a later Labs pass.");
  });

  document.querySelector("[data-activity-detail-open]")?.addEventListener("click", (event) => {
    const activityEvent = getActivityEvents().find((item) => item.id === event.currentTarget.dataset.activityDetailOpen);
    closeTimelineModals();
    openActivityRelatedPage(activityEvent);
  });

  document.querySelectorAll("[data-activity-detail-close], [data-activity-summary-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-activity-action]");
    if (actionButton) {
      handleActivityAction(actionButton.dataset.activityAction);
      return;
    }

    const detailButton = event.target.closest("[data-activity-detail]");
    if (detailButton) {
      openActivityDetail(detailButton.dataset.activityDetail);
    }
  });
}

function bindDemoState() {
  document.querySelector("[data-demo-state-open]")?.addEventListener("click", () => {
    openTimelineModal("[data-demo-state-modal]");
  });

  document.querySelector("[data-demo-state-close]")?.addEventListener("click", closeTimelineModals);

  document.querySelectorAll("[data-demo-state-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyDemoState(button.dataset.demoStateOption);
    });
  });
}

function openAddPropertyModal() {
  openTimelineModal("[data-add-property-modal]");
}

function openLearnGuide(index) {
  const guide = guidePreviews[Number(index)];

  if (!guide) {
    return;
  }

  document.querySelector("[data-learn-preview-title]").textContent = guide.title;
  document.querySelector("[data-learn-preview-body]").textContent = guide.preview;
  openTimelineModal("[data-learn-preview-modal]");
}

function handleGlobalServiceAction(action) {
  if (action === "support") {
    openServiceRequestModal();
  } else if (action === "uploadEicr" || action === "viewEicr") {
    openPropertyWorkspace("documents", action === "viewEicr" ? "[data-vault-list]" : "[data-document-upload-panel]");
  } else if (action === "uploadInspection") {
    showToast("Inspection evidence upload will be connected in a later Labs pass.");
  } else if (action === "licensing") {
    showPortfolioCompliance({ scroll: true });
  } else if (action === "ask") {
    openAssistant(getGlobalServiceAssistantResponse("Why is this recommended?"));
    focusAssistantInput();
  } else if (action === "viewEvidence") {
    showPortfolioEvidence({ scroll: true });
  } else if (action === "tenancy") {
    showToast("Tenancy document review is a preview support option in CMP Labs.");
  }
}

function bindUtilityPages() {
  document.addEventListener("click", (event) => {
    const askPrompt = event.target.closest("[data-utility-ask-prompt]");
    if (askPrompt) {
      const response = getGlobalAskAssistantResponse(askPrompt.dataset.utilityAskPrompt);
      document.querySelector("[data-utility-ask-response]").textContent = response;
      setAssistantResponse(response);
      return;
    }

    const serviceAction = event.target.closest("[data-global-service-action]");
    if (serviceAction) {
      handleGlobalServiceAction(serviceAction.dataset.globalServiceAction);
      return;
    }

    const guideButton = event.target.closest("[data-learn-guide]");
    if (guideButton) {
      openLearnGuide(guideButton.dataset.learnGuide);
      return;
    }
  });

  document.querySelectorAll("[data-add-property-close], [data-learn-preview-close]").forEach((button) => {
    button.addEventListener("click", closeTimelineModals);
  });

  document.querySelector("[data-add-property-preview]")?.addEventListener("click", () => {
    showToast("Add-property onboarding will be connected in a later CMP Labs pass.");
  });

  document.querySelectorAll("[data-settings-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.settingsToggle;
      labsState.settings[key] = !labsState.settings[key];
      renderSettingsState();
    });
  });

  document.querySelector("[data-settings-reset-demo]")?.addEventListener("click", () => {
    applyDemoState("reset");
    showSettingsPage({ scroll: false });
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
    "[data-evidence-inbox-modal]",
    "[data-task-detail-modal]",
    "[data-activity-detail-modal]",
    "[data-activity-summary-modal]",
    "[data-demo-state-modal]",
    "[data-add-property-modal]",
    "[data-learn-preview-modal]",
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

function renderSmartUploadState() {
  const status = document.querySelector("[data-smart-eicr-status]");
  const note = document.querySelector("[data-smart-eicr-note]");
  const actions = document.querySelector("[data-smart-eicr-actions]");

  if (!status || !note || !actions) {
    return;
  }

  status.classList.toggle("status-good-text", labsState.eicrAdded);
  status.classList.toggle("status-review-text", !labsState.eicrAdded);
  status.textContent = labsState.eicrAdded ? "Already in property file" : "Needs your review";
  note.textContent = labsState.eicrAdded
    ? "Property: 57 The Butts · Current EICR evidence is already stored"
    : "Property: 57 The Butts";
  actions.innerHTML = labsState.eicrAdded
    ? `
      <button class="secondary-button" type="button" data-toast="EICR evidence is already stored in this Labs preview.">View current evidence</button>
      <button class="text-button" type="button" data-upload-trigger>Replace evidence</button>
      <button class="text-button" type="button" data-modal-close>Close</button>
    `
    : `
      <button class="primary-button" type="button" data-review-eicr>Review and add</button>
      <button class="text-button" type="button" data-toast="Extracted details are shown in the review step.">View extracted details</button>
    `;
}

function showScanResults() {
  renderSmartUploadState();
  document.querySelector("[data-scan-view]").hidden = true;
  document.querySelector("[data-results-view]").hidden = false;
  document.querySelector("[data-review-view]").hidden = true;
}

function showEicrReview() {
  if (labsState.eicrAdded) {
    showToast("EICR evidence is already stored in this Labs preview.");
    return;
  }

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
  showToast(wasAlreadyConfirmed
    ? "EICR evidence is already stored in this Labs preview."
    : "Property file strengthened. Electrical Safety evidence verified. Evidence completeness increased from 42% to 58%.");
}

hydrateIcons();
renderAssistantPrompts();
renderAllState();
bindTabs();
bindPortfolioHome();
bindPortfolioProperties();
bindPortfolioCompliance();
bindPortfolioEvidence();
bindPortfolioTasks();
bindPortfolioActivity();
bindDemoState();
bindUtilityPages();
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
