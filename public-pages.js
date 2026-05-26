(function () {
  const DEMO_MODE = window.CMP_DEMO_MODE !== false;
  const WORKSPACE_STORAGE_KEY = "cmp_compliance_workspaces::guest";
  const ONBOARDING_STORAGE = "cmp_onboarding_complete";
  const FLASH_STORAGE_KEY = "cmp_public_flash";
  const SERVICE_DRAFT_PREFIX = "cmp_public_service_draft::";
  const HOME_POSTCODE_KEY = "cmp_public_postcode_hint";

  const SERVICE_CONFIG = {
    epc: {
      route: "epcs.html",
      entryService: "epc",
      title: "EPCs",
      eyebrow: "Energy performance",
      promise: "Check the EPC, keep it simple, and only widen the journey if you want to.",
      heroTitle: "EPC help without turning it into a full compliance exam.",
      heroCopy: "Start with the EPC if that is why you are here. CMP can keep the journey EPC-only, widen it to related checks, or turn it into a full property review later.",
      description: "Check EPC status, review expiry dates, and improve the rating without being pushed into unrelated checks.",
      cardCta: "Start EPC journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "book_epc", label: "I just want to book an EPC", helper: "Keep this focused on the certificate and the next step." },
        { value: "check_rules", label: "I want to check if this property meets EPC rules", helper: "Use the property and EPC data to understand what matters." },
        { value: "improve_rating", label: "I want to improve the EPC rating", helper: "Start with the current EPC, then look at sensible follow-on actions." },
        { value: "broader_check", label: "I want a broader compliance check", helper: "Use EPC as the starting point for a wider property review." }
      ],
      questions: [
        { key: "eviction_reason", type: "choice", label: "Is eviction part of the reason you're here?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure" } },
        { key: "already_have_epc", type: "choice", label: "Do you already have an EPC?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } }
      ],
      optionalEvidence: [
        { key: "epc_upload", type: "upload", label: "Upload an EPC if you have it" },
        { key: "epc_issue_date", type: "date", label: "EPC issue date, if known" }
      ],
      assistant: [
        "If you only came for the EPC, choose the focused option. CMP will not push the full checker too hard.",
        "If the EPC is already in place, CMP can use that as the first known fact when the property is added."
      ]
    },
    gas: {
      route: "gas-safety.html",
      entryService: "gas",
      title: "Gas Safety",
      eyebrow: "Gas Safety",
      promise: "Start with the gas question first, then decide whether you need a certificate check, upload, or wider review.",
      heroTitle: "Keep Gas Safety focused until you decide to go deeper.",
      heroCopy: "CMP asks whether gas applies, whether you already have a certificate, and whether you want to keep this journey tight or widen it later.",
      description: "Check whether gas applies, capture the last inspection, and decide whether you need a new certificate or just better evidence.",
      cardCta: "Start Gas Safety journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_gas", label: "I want to check my gas safety compliance", helper: "Start with the certificate and the appliance setup." },
        { value: "need_certificate", label: "I need a new Gas Safety Certificate", helper: "Use this if the certificate is missing or due." },
        { value: "tenant_prep", label: "I'm preparing for a tenant or inspection", helper: "Capture the evidence and the last known check date." },
        { value: "full_check", label: "I want a full compliance check", helper: "Gas first, then the wider property picture." }
      ],
      questions: [
        { key: "has_gas_appliances", type: "choice", label: "Does the property have gas appliances?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "has_gas_certificate", type: "choice", label: "Do you currently have a Gas Safety Certificate?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "last_gas_check", type: "date", label: "When was the last gas safety check?", placement: "documents" },
        { key: "gas_upload", type: "upload", label: "Upload Gas Safety Certificate if you have it", placement: "documents" }
      ],
      assistant: [
        "If you are not sure whether gas applies, say so. CMP will treat that as a check-next item, not a failure.",
        "If you already have the certificate, you can upload it later from the property dashboard too."
      ]
    },
    eicr: {
      route: "eicr.html",
      entryService: "eicr",
      title: "EICR",
      eyebrow: "Electrical safety",
      promise: "Start with the electrical report first, then decide whether to widen the journey.",
      heroTitle: "Use the EICR journey when electrical safety is the main reason you are here.",
      heroCopy: "CMP keeps the first questions short: do you have an EICR, when was the last inspection, and do you want this to stay EICR-focused?",
      description: "Capture the current EICR position, upload the report if you have it, and then choose whether to widen the checks.",
      cardCta: "Start EICR journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_electrical", label: "I want to check my electrical compliance", helper: "Start with the current EICR and what is known." },
        { value: "need_eicr", label: "I need a new EICR", helper: "Use this if the report is missing or due." },
        { value: "tenant_or_renewal", label: "I'm preparing for a tenant, renewal or inspection", helper: "Keep the journey practical and evidence-led." },
        { value: "full_check", label: "I want a full compliance check", helper: "EICR first, then the wider property picture." }
      ],
      questions: [
        { key: "has_eicr", type: "choice", label: "Do you currently have an EICR?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "last_eicr_check", type: "date", label: "When was the last electrical inspection?", placement: "documents" },
        { key: "eicr_upload", type: "upload", label: "Upload EICR report if you have it", placement: "documents" }
      ],
      assistant: [
        "If you have the report but not the date, continue anyway. CMP can mark it as something to confirm later.",
        "If this is mainly about one certificate, keep the journey service-focused."
      ]
    },
    eviction: {
      route: "evictions-possession.html",
      entryService: "eviction",
      title: "Evictions & Possession",
      eyebrow: "Possession support",
      promise: "Organise the property information and evidence before deciding what to do next.",
      heroTitle: "Start a possession journey without turning it into legal advice.",
      heroCopy: "CMP helps landlords organise compliance documents, notices, and communications before they move further into possession preparation.",
      description: "Start with the landlord goal, then build the evidence pack around the property and the tenancy.",
      cardCta: "Start possession journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "understand_options", label: "I want to understand my eviction options", helper: "Keep the wording careful and evidence-led." },
        { value: "check_compliance_first", label: "I want to make sure this property is compliant first", helper: "Start with the certificates and tenancy evidence." },
        { value: "prepare_properly", label: "I want to prepare for possession properly", helper: "Build the document trail in a calm way." },
        { value: "full_check", label: "I want a full compliance check", helper: "Use the possession journey as the reason for the wider review." }
      ],
      questions: [
        { key: "regaining_possession", type: "choice", label: "Is regaining possession your main goal?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure yet" } },
        { key: "eviction_situation", type: "select", label: "What situation sounds closest to your property?", options: ["Rent arrears", "Late payment pattern", "Anti-social behaviour", "Breach of tenancy", "Sale or move back in", "I'm not sure yet"] }
      ],
      optionalEvidence: [
        { key: "tenancy_agreement_upload", type: "upload", label: "Upload tenancy agreement if you have it" },
        { key: "deposit_proof_upload", type: "upload", label: "Upload deposit proof if available" },
        { key: "notice_evidence_upload", type: "upload", label: "Upload notices or tenant communications if you have them" }
      ],
      assistant: [
        "CMP helps organise your information and evidence. It does not replace legal advice.",
        "If you are not ready for a full possession workflow, you can still use this to organise the documents first."
      ]
    },
    possession_preparation: {
      route: "possession-eviction-preparation.html",
      entryService: "eviction",
      title: "Possession & Eviction Preparation",
      eyebrow: "Evidence pack",
      promise: "Choose the scenario first, then let CMP organise the evidence trail around it.",
      heroTitle: "Build the possession evidence pack before you chase the next step.",
      heroCopy: "Use the scenario cards to tell CMP what is happening. The aim is to organise facts, documents, and timelines calmly before you widen the process.",
      description: "A scenario-led possession page that feels closer to the current Wix structure but keeps the prototype logic underneath.",
      cardCta: "Start evidence prep",
      intentHeading: "Which situation sounds closest?",
      intents: [
        { value: "rent_owes", label: "Tenant owes rent", helper: "Organise arrears and communication records." },
        { value: "late_rent", label: "Rent is always late", helper: "Capture the payment pattern and tenant updates." },
        { value: "anti_social", label: "Anti-social behaviour", helper: "Keep the notes and communications together." },
        { value: "breach", label: "Breach of tenancy", helper: "Use CMP to keep the evidence trail clear." },
        { value: "damage", label: "Property damage", helper: "Log condition concerns and supporting photos." },
        { value: "refusing_access", label: "Tenant refusing access", helper: "Track inspection attempts and communications." },
        { value: "need_to_sell", label: "I need to sell", helper: "Keep the property and tenancy evidence tidy." },
        { value: "family_move_in", label: "I or family need to move in", helper: "Record the compliance and evidence basics first." },
        { value: "unauthorised_occupants", label: "Unauthorised occupants", helper: "Capture what has been observed and communicated." },
        { value: "suspected_subletting", label: "Suspected subletting", helper: "Keep the evidence trail factual and organised." },
        { value: "repairs_redevelopment", label: "Major repairs or redevelopment", helper: "Organise timelines, notices, and property records." },
        { value: "not_sure", label: "I'm not sure yet", helper: "Start the evidence pack without overcommitting." }
      ],
      questions: [
        { key: "evidence_goal", type: "choice", label: "What do you want this to help with most?", options: ["organise_documents", "check_compliance", "prepare_timeline", "all_three"], optionLabels: { organise_documents: "Organise documents", check_compliance: "Check compliance first", prepare_timeline: "Build a timeline", all_three: "A bit of all three" } }
      ],
      optionalEvidence: [
        { key: "tenancy_agreement_upload", type: "upload", label: "Upload tenancy agreement if you have it" },
        { key: "rent_arrears_upload", type: "upload", label: "Upload rent arrears evidence if it is relevant" },
        { key: "notice_evidence_upload", type: "upload", label: "Upload notices or tenant communications if you have them" }
      ],
      assistant: [
        "CMP helps organise your information and evidence. It does not replace legal advice.",
        "If you are not sure where to start, choose the closest scenario and keep moving."
      ]
    },
    mould: {
      route: "mould-damp.html",
      entryService: "mould",
      title: "Mould & Damp",
      eyebrow: "Repairs and evidence",
      promise: "Keep mould and damp practical: issue, inspections, repairs, communications, then next steps.",
      heroTitle: "Treat mould and damp like a case history, not a generic certificate check.",
      heroCopy: "CMP can organise the timeline, reports, repairs, and tenant updates around a mould or damp issue without forcing the whole property through a bigger process.",
      description: "Organise the issue, seriousness, tenant reports, inspections, repairs, and follow-up in one calm flow.",
      cardCta: "Start mould journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "assess_issue", label: "I want to report or assess mould issues", helper: "Start with the seriousness and whether it has been reported." },
        { value: "organise_repairs", label: "I want help organising evidence and repairs", helper: "Use the timeline and document prompts." },
        { value: "prevention_guidance", label: "I want advice on prevention and compliance", helper: "Capture the property facts first, then keep the issue practical." },
        { value: "broader_check", label: "I want a broader property check", helper: "Start with mould, then widen it later if you want." }
      ],
      questions: [
        { key: "mould_severity", type: "choice", label: "How serious does the issue seem?", options: ["minor_condensation", "one_area", "widespread", "not_sure"], optionLabels: { minor_condensation: "Minor condensation only", one_area: "Visible mould in one area", widespread: "Widespread or recurring mould", not_sure: "I'm not sure" } },
        { key: "tenant_reported_mould", type: "choice", label: "Has the tenant reported it?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "mould_repair_state", type: "choice", label: "Has anything been inspected or repaired?", options: ["inspected", "repaired", "both", "not_yet"], optionLabels: { inspected: "Inspected only", repaired: "Repaired only", both: "Inspected and repaired", not_yet: "Not yet" } },
        { key: "mould_upload", type: "upload", label: "Upload photos or a report if you have them", placement: "documents" }
      ],
      optionalEvidence: [
        { key: "mould_repair_notes_upload", type: "upload", label: "Upload repair or contractor notes if available" }
      ],
      assistant: [
        "This journey should stay practical. It is about records, dates, inspections, repairs, and communication.",
        "If you are unsure how serious it is, mark that and keep going."
      ]
    },
    licensing: {
      route: "selective-licensing.html",
      entryService: "licensing",
      title: "Selective Licensing",
      eyebrow: "Council licensing",
      promise: "Check the local licensing position without dragging gas or electrical uploads into the centre of the page.",
      heroTitle: "Start with the licence question, not the wrong certificate.",
      heroCopy: "CMP keeps this journey focused on whether licensing applies, what the current licence state is, and what local authority context you already know.",
      description: "Check if the property may need licensing, record the current position, and widen the journey only if you want to.",
      cardCta: "Start licensing journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_need", label: "I want to check if this property needs licensing", helper: "Use postcode and local authority details if you know them." },
        { value: "apply_licence", label: "I need help applying for a licence", helper: "Capture the current position and evidence." },
        { value: "renew_manage", label: "I need help renewing or managing a licence", helper: "Keep the renewal state and documents together." },
        { value: "not_sure", label: "I'm not sure", helper: "Start the licence journey without overcommitting." }
      ],
      questions: [
        { key: "licence_state", type: "choice", label: "What is the current licensing situation?", options: ["already_licensed", "not_licensed", "expired", "not_sure"], optionLabels: { already_licensed: "Already licensed", not_licensed: "Not licensed", expired: "Expired or needs renewal", not_sure: "I'm not sure" } },
        { key: "local_authority", type: "text", label: "Do you know the council or local authority?" }
      ],
      optionalEvidence: [
        { key: "licence_upload", type: "upload", label: "Upload a licence document if you have it" }
      ],
      assistant: [
        "This page is only about licensing. Wider checks can stay secondary unless you choose otherwise.",
        "If you do not know the council yet, continue anyway and add it later."
      ]
    },
    inspection: {
      route: "property-inspections.html",
      entryService: "inspection",
      title: "Property Inspections",
      eyebrow: "Condition and access",
      promise: "Keep inspections practical: what kind, what concerns, what was last done, and what proof you have.",
      heroTitle: "Use the inspection journey for condition, access, and practical evidence.",
      heroCopy: "CMP can help organise inspection records, photos, condition notes, and the next property action without immediately turning it into a full compliance audit.",
      description: "Choose the inspection type, capture the main concern, and decide whether you want routine checks or a broader property review.",
      cardCta: "Start inspection journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "routine", label: "I want to arrange a routine property inspection", helper: "Use this for regular condition and access checks." },
        { value: "condition", label: "I want to check the condition of a property", helper: "Useful for signs of neglect, damage, or issues building up." },
        { value: "concern", label: "I'm concerned about possible damage or neglect", helper: "Keep the concern practical and documented." },
        { value: "broader_check", label: "I want a wider compliance and condition check", helper: "Start with the inspection and widen it later." }
      ],
      questions: [
        { key: "inspection_type", type: "choice", label: "What kind of inspection do you need?", options: ["routine", "pre_tenancy", "mid_tenancy", "end_tenancy"], optionLabels: { routine: "Routine inspection", pre_tenancy: "Pre-tenancy or move-in", mid_tenancy: "Mid-tenancy inspection", end_tenancy: "End-of-tenancy or condition check" } },
        { key: "inspection_concern", type: "text", label: "What are you most concerned about?" },
        { key: "last_inspection", type: "date", label: "When was the property last inspected?", placement: "documents" },
        { key: "inspection_upload", type: "upload", label: "Upload inspection photos or reports if you have them", placement: "documents" }
      ],
      assistant: [
        "If you are not sure which inspection type fits best, pick the closest and keep moving.",
        "Photos and notes can be added later from the property dashboard too."
      ]
    },
    aml: {
      route: "aml-checks.html",
      entryService: "aml",
      title: "AML Checks",
      eyebrow: "Identity and documents",
      promise: "Keep AML document questions simple and separate from the rest of the property unless you choose otherwise.",
      heroTitle: "Use the AML journey when you need document organisation, not a random certificate page.",
      heroCopy: "CMP can capture what AML documents you have already and whether you want this to stay focused or widen into a broader property check.",
      description: "Capture photo ID and proof-of-address document status without making this page look like a gas or EICR checklist.",
      cardCta: "Start AML journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "understand_aml", label: "I want to understand AML requirements", helper: "Use this if you want a calm starting point." },
        { value: "check_property", label: "I want to check this property is compliant", helper: "Keep it practical and document-led." },
        { value: "organise_documents", label: "I need help organising documents", helper: "Capture what exists now, then add more later." },
        { value: "full_check", label: "I want a full compliance check", helper: "Use AML as the starting point for a wider journey." }
      ],
      questions: [
        { key: "aml_docs", type: "choice", label: "What documents do you currently have?", options: ["photo_id", "proof_of_address", "both", "not_sure"], optionLabels: { photo_id: "Photo ID", proof_of_address: "Proof of address", both: "Both", not_sure: "Not sure" } },
        { key: "aml_upload", type: "upload", label: "Upload AML documents if you have them", placement: "documents" }
      ],
      assistant: [
        "CMP can help organise the document trail here, but it is not giving a verified AML decision.",
        "If you only need document organisation, keep the focus tight."
      ]
    },
    rent_guarantee: {
      route: "rent-guarantee.html",
      entryService: "rent_guarantee",
      title: "Rent Guarantee",
      eyebrow: "Rental income support",
      promise: "Check the tenancy and payment situation first, then decide whether you want wider property checks as well.",
      heroTitle: "Start with the tenancy and payment picture before you look at guarantee options.",
      heroCopy: "CMP keeps the first questions practical: is the property tenanted, is the rent reliable, and do you want this to stay rent-guarantee focused?",
      description: "Capture rent reliability and arrears concerns without being pushed into unrelated services too early.",
      cardCta: "Start rent guarantee journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_cover", label: "I want rent guarantee cover", helper: "Start with the tenancy and payment picture." },
        { value: "compare", label: "I want to compare guarantee options", helper: "Capture the current situation first." },
        { value: "protect_income", label: "I want help protecting rental income", helper: "Keep the journey practical and landlord-friendly." },
        { value: "not_sure", label: "I'm not sure", helper: "Use the starter questions and decide later." }
      ],
      questions: [
        { key: "rent_reliable", type: "choice", label: "Is the tenant currently paying reliably?", options: ["yes", "mostly", "no", "not_sure"], optionLabels: { yes: "Yes", mostly: "Mostly", no: "No", not_sure: "Not sure" } },
        { key: "arrears_recent", type: "choice", label: "Have there been recent arrears or late payments?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "wider_check", type: "choice", label: "Do you want wider compliance checked too?", options: ["yes", "no", "later"], optionLabels: { yes: "Yes", no: "No, keep it focused", later: "Maybe later" } }
      ],
      optionalEvidence: [
        { key: "rent_guarantee_upload", type: "upload", label: "Upload an existing cover document or rent record if you have one" }
      ],
      assistant: [
        "Rent guarantee is a side service here. CMP should not turn it into a giant compliance push unless you choose that.",
        "If payments are mostly fine, keep the journey simple."
      ]
    },
    insurance: {
      route: "landlord-insurance.html",
      entryService: "insurance",
      title: "Landlord Insurance",
      eyebrow: "Policy support",
      promise: "Keep the insurance journey about cover, renewal, and risks — not about the wrong certificate.",
      heroTitle: "Start with landlord insurance questions, not an unrelated Gas Safety page.",
      heroCopy: "CMP keeps this page focused on the current cover, renewal state, and known risks so the landlord stays in control of how deep the journey goes.",
      description: "Capture the current policy state and whether you want CMP to keep this insurance-focused or widen the property check later.",
      cardCta: "Start insurance journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_cover", label: "I want landlord insurance cover", helper: "Start with the current insurance position." },
        { value: "compare_policies", label: "I want to compare policies", helper: "Keep it practical and focused." },
        { value: "renew", label: "I need to renew my insurance", helper: "Use CMP to capture the current cover state." },
        { value: "not_sure", label: "I'm not sure", helper: "Start gently and decide how far to go." }
      ],
      questions: [
        { key: "insurance_state", type: "choice", label: "What is the current insurance situation?", options: ["fully_insured", "basic_cover", "not_insured", "not_sure"], optionLabels: { fully_insured: "Fully insured", basic_cover: "Basic cover only", not_insured: "Not insured", not_sure: "I'm not sure" } },
        { key: "known_risks", type: "text", label: "Are there any known risks or concerns? (optional)" }
      ],
      optionalEvidence: [
        { key: "insurance_upload", type: "upload", label: "Upload a policy document if you have it" }
      ],
      assistant: [
        "This page is about insurance. Related compliance can stay secondary unless you choose otherwise.",
        "You can continue without every detail and come back later."
      ]
    },
    mortgage: {
      route: "mortgages.html",
      entryService: "mortgage",
      title: "Mortgages",
      eyebrow: "Mortgage support",
      promise: "Use a simple estimate first, then decide whether to keep this mortgage-focused or widen the property review.",
      heroTitle: "Start with the mortgage question, not the compliance deep end.",
      heroCopy: "CMP treats mortgages as a side service for now. You can run a simple estimate, save the context, and then choose whether to add the property for a wider check.",
      description: "Capture the mortgage situation and run a basic estimate without forcing mortgage details into compliance scoring.",
      cardCta: "Start mortgage journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_advice", label: "I want mortgage advice", helper: "Start with the current borrowing position." },
        { value: "lender_requirements", label: "I need help understanding lender requirements", helper: "Keep this focused on the mortgage side first." },
        { value: "refinance", label: "I need help refinancing", helper: "Use the estimate and the property context together." },
        { value: "not_sure", label: "I'm not sure", helper: "Run the estimate and keep the rest optional." }
      ],
      questions: [
        { key: "mortgage_state", type: "choice", label: "What is the current mortgage situation?", options: ["have_mortgage", "need_mortgage", "refinance", "not_sure"], optionLabels: { have_mortgage: "I already have a mortgage in place", need_mortgage: "I need a mortgage", refinance: "I want to refinance", not_sure: "I'm not sure" } }
      ],
      optionalEvidence: [
        { key: "mortgage_offer_upload", type: "upload", label: "Upload a mortgage illustration or offer if you have one" }
      ],
      assistant: [
        "This calculator is only an estimate. CMP is not giving regulated mortgage advice here.",
        "If you only want the estimate, keep the focus narrow and move on when you are ready."
      ],
      calculator: true
    }
  };

  const SERVICE_ORDER = [
    "epc",
    "eviction",
    "gas",
    "mortgage",
    "insurance",
    "possession_preparation",
    "rent_guarantee",
    "mould",
    "licensing",
    "eicr",
    "inspection",
    "aml"
  ];

  const NEWS_ARTICLES = [
    { id: "epc-rules", category: "EPC", title: "EPC rules are changing — what landlords should prepare for", excerpt: "Use postcode, certificate dates, and the current rating to keep the next EPC decision practical.", demo: true },
    { id: "gas-renewal", category: "Gas Safety", title: "Gas Safety reminders: what to check before renewal", excerpt: "A calm reminder flow is often more useful than a scary dashboard warning.", demo: true },
    { id: "licensing-postcode", category: "Licensing", title: "Selective licensing: why postcode matters", excerpt: "Landlords usually want to know if licensing even applies before they chase paperwork.", demo: true },
    { id: "possession-prep", category: "Possession", title: "Possession preparation: documents landlords should organise early", excerpt: "Evidence packs work better when the timeline and communication trail are started before they feel urgent.", demo: true },
    { id: "mould-history", category: "Mould & Damp", title: "Mould and damp: why timelines and repair records matter", excerpt: "This is often less about one certificate and more about a clear inspection and repair history.", demo: true }
  ];

  const DEFAULT_FOCUS_OPTIONS = [
    { value: "service_only", label: "Just this service", helper: "Keep CMP focused on what you came for." },
    { value: "related_checks", label: "Start with this service, then related checks", helper: "Let CMP widen the journey gently if it helps." },
    { value: "full_compliance", label: "Check the whole property", helper: "Use this when you want the full A-Z picture." }
  ];

  const DEMO_ADDRESS_TEMPLATES = [
    { houseNumber: "18", street: "Willow Brook Drive", city: "Birmingham", type: "Semi-detached house", bedrooms: 3, storeys: 2, rating: "C", currentScore: 72, potential: "B", potentialScore: 83, hasGas: true, fixedCombustion: true },
    { houseNumber: "Flat 3", street: "Cedar Court", city: "Birmingham", type: "Flat", bedrooms: 2, storeys: 1, rating: "D", currentScore: 61, potential: "C", potentialScore: 74, hasGas: true, fixedCombustion: false },
    { houseNumber: "44", street: "Maple Avenue", city: "Birmingham", type: "Terraced house", bedrooms: 3, storeys: 2, rating: "", currentScore: null, potential: "", potentialScore: null, hasGas: true, fixedCombustion: true },
    { houseNumber: "2", street: "Oakfield Mews", city: "Birmingham", type: "Maisonette", bedrooms: 1, storeys: 1, rating: "B", currentScore: 82, potential: "A", potentialScore: 91, hasGas: false, fixedCombustion: false },
    { houseNumber: "91", street: "Station Road", city: "Birmingham", type: "Detached house", bedrooms: 4, storeys: 2, rating: "E", currentScore: 49, potential: "C", potentialScore: 69, hasGas: true, fixedCombustion: true }
  ];

  const page = document.body.dataset.publicPage || "";
  const serviceKey = document.body.dataset.serviceKey || "";
  const app = document.getElementById("publicSite");
  if (!app) return;

  const state = {
    assistantOpen: false,
    newsFilter: "all",
    serviceDraft: page === "service" ? loadServiceDraft(serviceKey) : {},
    addProperty: {
      postcode: new URLSearchParams(window.location.search).get("postcode") || sessionStorage.getItem(HOME_POSTCODE_KEY) || "",
      isSearching: false,
      matches: [],
      message: "",
      stage: "",
      selectedId: "",
      prefillHandled: false
    }
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function titleCase(value) {
    return String(value || "").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function normalizePostcode(value) {
    return String(value || "").replace(/\s+/g, "").toUpperCase();
  }

  function formatPostcode(value) {
    const normalized = normalizePostcode(value);
    if (normalized.length <= 3) return normalized;
    return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
  }

  function normalizeLookupText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizedAddressKey(address, postcode = "") {
    const addressKey = normalizeLookupText(address);
    const postcodeKey = normalizePostcode(postcode);
    return `${addressKey}|${postcodeKey}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readWorkspace() {
    return safeJsonParse(localStorage.getItem(WORKSPACE_STORAGE_KEY), {});
  }

  function writeWorkspace(value) {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(value));
  }

  function workspaceEntries() {
    return Object.entries(readWorkspace()).map(([propertyId, workspace]) => ({
      propertyId,
      workspace,
      property: workspace?.checkerState?.propertySnapshot || null
    })).filter((entry) => entry.property);
  }

  function propertyEntries() {
    return workspaceEntries().map((entry) => entry.property);
  }

  function saveWorkspaceEntry(property, answers = {}) {
    const saved = readWorkspace();
    saved[property.id] = {
      checkerState: {
        answers,
        propertySnapshot: property,
        updatedAt: nowIso()
      },
      documentScans: [],
      extractedFacts: {},
      updatedAt: nowIso()
    };
    writeWorkspace(saved);
  }

  function flash(message, tone = "info") {
    sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify({ message, tone }));
  }

  function readFlash() {
    const next = safeJsonParse(sessionStorage.getItem(FLASH_STORAGE_KEY), null);
    sessionStorage.removeItem(FLASH_STORAGE_KEY);
    return next;
  }

  function loadServiceDraft(key) {
    return safeJsonParse(sessionStorage.getItem(`${SERVICE_DRAFT_PREFIX}${key}`), {});
  }

  function saveServiceDraft(key, draft) {
    sessionStorage.setItem(`${SERVICE_DRAFT_PREFIX}${key}`, JSON.stringify(draft));
  }

  function currentJourney() {
    return window.CMPJourney?.read?.() || window.CMPJourney?.defaultContext?.() || {
      entryService: "full_compliance",
      focusMode: "full_compliance",
      isTenanted: null,
      answeredQuestions: {}
    };
  }

  function serviceLabel(key) {
    const config = SERVICE_CONFIG[key];
    return config ? config.title : titleCase(key);
  }

  function focusLabel(value) {
    const labels = {
      service_only: "Just this service",
      related_checks: "This service, then related checks",
      full_compliance: "Full property check"
    };
    return labels[value] || titleCase(value);
  }

  function tenancyLabel(value) {
    const labels = {
      yes: "Tenanted",
      no: "Not tenanted",
      unsure: "Not sure yet"
    };
    return labels[value] || "Not sure yet";
  }

  function navigationPrimaryHref() {
    return DEMO_MODE ? "my-properties.html" : "auth.html?redirect=my-properties.html";
  }

  function baseHeader(active = "") {
    return `
      <header class="site-nav">
        <a class="brand" href="index.html" aria-label="ComplyMyProperty home">
          <span class="brand-mark">CMP</span>
          <span>
            <strong>ComplyMyProperty</strong>
            <small>Landlord compliance made simple</small>
          </span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          <a href="index.html"${active === "home" ? ' aria-current="page"' : ""}>Home</a>
          <a href="services.html"${active === "services" ? ' aria-current="page"' : ""}>Services</a>
          <a href="add-property.html"${active === "add-property" ? ' aria-current="page"' : ""}>Add Property</a>
          <a href="my-properties.html"${active === "my-properties" ? ' aria-current="page"' : ""}>My Properties</a>
          <a href="news.html"${active === "news" ? ' aria-current="page"' : ""}>Updates</a>
          <a href="contact.html">Contact</a>
        </nav>
        <div class="nav-actions">
          <a class="nav-link-secondary" href="dashboard.html#guided-check">A-Z checker</a>
          <a class="nav-cta" href="${navigationPrimaryHref()}"><i data-lucide="layout-dashboard"></i>${DEMO_MODE ? "My Properties" : "Log in"}</a>
        </div>
      </header>
    `;
  }

  function baseFooter() {
    return `
      <footer class="site-footer">
        <div>
          <strong>COMPLYMYPROPERTY</strong>
          <p>The safest place for private landlords to organise property compliance with no subscription fee.</p>
        </div>
        <div>
          <span>Explore</span>
          <a href="services.html">Services</a>
          <a href="my-properties.html">My Properties</a>
          <a href="news.html">Compliance updates</a>
        </div>
        <div>
          <span>Support</span>
          <a href="mailto:compliance@complymyproperty.com">compliance@complymyproperty.com</a>
          <a href="tel:01217708814">0121 770 8814</a>
          <small class="footer-note">CMP helps organise and highlight property compliance information, but it is not legal advice.</small>
        </div>
      </footer>
    `;
  }

  function assistantMessages() {
    if (page === "add-property") {
      return [
        "Enter the postcode first. CMP will help you choose the right address and import a property preview.",
        "If live data is unavailable, CMP can still keep the journey moving with a realistic address and EPC preview."
      ];
    }
    if (page === "my-properties") {
      return [
        "Use My Properties as the calm middle step before opening a dashboard.",
        "Each property card keeps the journey label, basic status, and the next obvious action."
      ];
    }
    if (page === "news") {
      return [
        "This updates area is a preview of how CMP could publish regular landlord compliance news and plain-English reminders.",
        "It is editorial placeholder content, not live legal publishing."
      ];
    }
    if (page === "service") {
      return SERVICE_CONFIG[serviceKey]?.assistant || [
        "Choose how focused you want us to be.",
        "Not sure? No problem — you can continue and come back later."
      ];
    }
    return [
      "Start with the service you actually need. CMP does not have to force the whole checker on everyone.",
      "If you get stuck, choose the focused option first. You can widen the journey later."
    ];
  }

  function assistantWidget() {
    const messages = assistantMessages();
    return `
      <div class="assistant-fab-shell${state.assistantOpen ? " is-open" : ""}">
        <button class="assistant-fab" type="button" data-toggle-assistant>
          <i data-lucide="sparkles"></i>
          Need help?
        </button>
        <aside class="assistant-drawer" ${state.assistantOpen ? "" : "hidden"}>
          <div class="assistant-drawer-header">
            <strong>Ask CMP Assistant</strong>
            <button class="icon-button" type="button" data-toggle-assistant aria-label="Close helper">
              <i data-lucide="x"></i>
            </button>
          </div>
          <p>CMP uses the journey and property information you have already added to guide the next step in plain English.</p>
          <div class="assistant-drawer-list">
            ${messages.map((message) => `<article><i data-lucide="message-circle-more"></i><span>${escapeHtml(message)}</span></article>`).join("")}
          </div>
          <p class="assistant-disclaimer">CMP helps organise and highlight property compliance information, but it is not legal advice.</p>
        </aside>
      </div>
    `;
  }

  function renderServiceCards(keys = SERVICE_ORDER) {
    return keys.map((key) => {
      const service = SERVICE_CONFIG[key];
      return `
        <article class="service-grid-card">
          <span class="service-grid-eyebrow">${escapeHtml(service.eyebrow)}</span>
          <h3>${escapeHtml(service.title)}</h3>
          <p>${escapeHtml(service.description)}</p>
          <a class="service-grid-link" href="${escapeHtml(service.route)}">${escapeHtml(service.cardCta)}</a>
        </article>
      `;
    }).join("");
  }

  function renderHomepage() {
    document.title = "ComplyMyProperty | Landlord compliance made simple";
    app.innerHTML = `
      ${baseHeader("home")}
      <main class="public-main">
        <section class="hero home-hero">
          <img class="hero-image" src="assets/cmp-hero-property.png" alt="Traditional UK rental property with a calm compliance overlay">
          <div class="hero-overlay" aria-hidden="true"></div>
          <div class="hero-content">
            <span class="eyebrow">Landlord compliance made simple</span>
            <h1>The compliance operating system for UK landlords.</h1>
            <p>The safest place for private landlords to organise property compliance with no subscription fee.</p>
            <div class="hero-actions">
              <a class="button primary" href="services.html">What do you need help with today?</a>
              <a class="button secondary" href="add-property.html">Check a property</a>
            </div>
            <div class="hero-metrics">
              <span><strong>Choose</strong> a single service or a full check</span>
              <span><strong>Add</strong> a property by postcode</span>
              <span><strong>Build</strong> your A-Z compliance picture later</span>
            </div>
          </div>
        </section>

        <section class="page-section">
          <div class="section-heading">
            <span class="eyebrow">What do you need help with today?</span>
            <h2>Start with the service you actually came for.</h2>
            <p>Start with one service, keep the journey focused, and only widen into a broader property check if it helps.</p>
          </div>
          <div class="service-grid public-service-grid">
            ${renderServiceCards()}
          </div>
        </section>

        <section class="split-section public-split-section">
          <div class="section-copy">
            <span class="eyebrow">Quick property checker</span>
            <h2>Want to start with the property instead?</h2>
            <p>Enter a postcode, choose the right address, and CMP will build the next step around that property.</p>
          </div>
          <form class="postcode-card" id="homePostcodeForm">
            <label for="homePostcodeInput">Property postcode</label>
            <div class="postcode-row">
              <input id="homePostcodeInput" type="text" name="postcode" placeholder="B37 7BA" autocomplete="postal-code">
              <button class="button primary" type="submit">Find address</button>
            </div>
            <small>We will look for EPC information automatically and keep the journey moving with a realistic property preview if live results are unavailable.</small>
          </form>
        </section>

        <section class="how-section">
          <div class="section-heading">
            <span class="eyebrow">How ComplyMyProperty works</span>
            <h2>Start with the reason you arrived, then add the property.</h2>
          </div>
          <div class="steps">
            <article><span>01</span><h3>Choose a service</h3><p>EPC, Gas Safety, EICR, inspections, licensing, possession preparation, mould, and more.</p></article>
            <article><span>02</span><h3>Choose the depth</h3><p>Keep it focused, widen to related checks, or turn it into a full property review.</p></article>
            <article><span>03</span><h3>Add the property</h3><p>Use postcode and address selection so the property title is clear from the start.</p></article>
            <article><span>04</span><h3>Build the picture</h3><p>Use the A-Z checker, uploads, and the property dashboard only when they are useful.</p></article>
          </div>
        </section>

        <section class="split-section public-split-section">
          <div class="section-copy">
            <span class="eyebrow">A-Z compliance checker</span>
            <h2>Build your compliance picture step by step.</h2>
            <p>Landlords should be able to say “Not sure at this point”, keep moving, and come back later. Booking comes after CMP understands what they actually need.</p>
            <a class="button secondary" href="epcs.html">Preview the A-Z checker style</a>
          </div>
          <div class="checker-preview">
            <article><strong>Property basics</strong><span>Done</span><p>Start with the property and tenancy basics.</p></article>
            <article><strong>EPC</strong><span>Imported</span><p>Use register data if it exists and avoid asking twice.</p></article>
            <article><strong>Gas Safety</strong><span>Not checked yet</span><p>Ask whether gas applies before pushing a certificate booking.</p></article>
            <article><strong>Evidence</strong><span>Needs evidence</span><p>Uploads, notes, and timelines can come later without blocking the journey.</p></article>
          </div>
        </section>

        <section class="page-section">
          <div class="section-heading">
            <span class="eyebrow">Latest compliance updates</span>
            <h2>Latest compliance updates</h2>
            <p>These example articles show how CMP could explain changes, reminders, and practical next steps in plain English.</p>
          </div>
          <div class="news-grid">
            ${NEWS_ARTICLES.slice(0, 3).map((article) => renderArticleCard(article)).join("")}
          </div>
          <div class="section-actions">
            <a class="button secondary" href="news.html">See updates preview</a>
          </div>
        </section>

        <section class="final-cta public-trust-band">
          <div>
            <span class="eyebrow">Trust and control</span>
            <h2>Traditional, clear, and landlord-friendly.</h2>
            <p>CMP should feel official and easy to navigate. You stay in control of how focused the journey is, what you answer now, and what can wait until later.</p>
          </div>
          <a class="button primary" href="my-properties.html">Go to My Properties</a>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;

    document.getElementById("homePostcodeForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("homePostcodeInput");
      const postcode = input?.value?.trim() || "";
      if (!postcode) return;
      sessionStorage.setItem(HOME_POSTCODE_KEY, postcode);
      window.location.href = `add-property.html?postcode=${encodeURIComponent(postcode)}`;
    });
  }

  function renderArticleCard(article) {
    return `
      <article class="news-card">
        <span class="service-grid-eyebrow">${escapeHtml(article.category)}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt)}</p>
        <div class="news-card-footer">
          <span class="quiet-pill">Example article</span>
          <button class="mini-button" type="button" data-open-article="${escapeHtml(article.id)}">Read article</button>
        </div>
      </article>
    `;
  }

  function renderServicesOverview() {
    document.title = "Services | ComplyMyProperty";
    app.innerHTML = `
      ${baseHeader("services")}
      <main class="public-main">
        <section class="page-hero public-page-hero">
          <div>
            <span class="eyebrow">Services overview</span>
            <h1>Start with the right service, then choose how deep CMP should go.</h1>
            <p>Choose one service, answer a few simple questions, then add the property and open the right dashboard from My Properties.</p>
            <div class="hero-actions">
              <a class="button primary" href="add-property.html">Add property first</a>
              <a class="button secondary" href="my-properties.html">Go to My Properties</a>
            </div>
          </div>
          <img src="assets/cmp-dashboard-preview.png" alt="ComplyMyProperty service-led dashboard preview">
        </section>
        <section class="page-section">
          <div class="service-grid public-service-grid">
            ${renderServiceCards()}
          </div>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;
  }

  function focusOptionsForService(key) {
    if (key === "eviction" || key === "possession_preparation") {
      return [
        { value: "service_only", label: "Just help with the evidence pack", helper: "Keep this about organising the records and next steps." },
        { value: "related_checks", label: "Start here, then check related items", helper: "Use the possession need as the reason for a few extra checks." },
        { value: "full_compliance", label: "Check the whole property first", helper: "Use the possession journey as the start of a wider property review." }
      ];
    }
    return DEFAULT_FOCUS_OPTIONS;
  }

  function journeyQuestionsForService(service) {
    return (service.questions || []).filter((question) => question.placement !== "documents");
  }

  function optionalEvidenceQuestionsForService(service) {
    return [
      ...(service.questions || []).filter((question) => question.placement === "documents"),
      ...(service.optionalEvidence || [])
    ];
  }

  function serviceProgress(draft, service) {
    const questions = journeyQuestionsForService(service);
    let total = 3 + questions.length;
    let answered = 0;
    if (draft.intent) answered += 1;
    if (draft.focusMode) answered += 1;
    if (draft.isTenanted) answered += 1;
    answered += questions.filter((question) => hasAnswer(draft, question.key)).length;
    return { total, answered, percent: Math.round((answered / total) * 100) };
  }

  function hasAnswer(draft, key) {
    return draft[key] !== undefined && draft[key] !== null && draft[key] !== "";
  }

  function renderChoiceCards(name, items, selected, attrName) {
    return `
      <div class="selection-grid">
        ${items.map((item) => `
          <button class="choice-card${selected === item.value ? " is-selected" : ""}" type="button" ${attrName}="${escapeHtml(item.value)}" data-choice-group-name="${escapeHtml(name)}">
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.helper || "")}</p>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderQuestionField(question, draft) {
    if (question.type === "choice") {
      const options = question.options.map((value) => ({
        value,
        label: question.optionLabels?.[value] || titleCase(value),
        helper: ""
      }));
      return `
        <div class="question-card">
          <label>${escapeHtml(question.label)}</label>
          ${renderChoiceCards(question.key, options, draft[question.key], "data-question-choice")}
        </div>
      `;
    }
    if (question.type === "select") {
      return `
        <div class="question-card">
          <label>${escapeHtml(question.label)}</label>
          <select data-question-input="${escapeHtml(question.key)}">
            <option value="">Choose an option</option>
            ${question.options.map((option) => `<option value="${escapeHtml(option)}" ${draft[question.key] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
          </select>
        </div>
      `;
    }
    if (question.type === "date") {
      return `
        <div class="question-card">
          <label>${escapeHtml(question.label)}</label>
          <input type="date" data-question-input="${escapeHtml(question.key)}" value="${escapeHtml(draft[question.key] || "")}">
        </div>
      `;
    }
    if (question.type === "text") {
      return `
        <div class="question-card">
          <label>${escapeHtml(question.label)}</label>
          <input type="text" data-question-input="${escapeHtml(question.key)}" value="${escapeHtml(draft[question.key] || "")}" placeholder="Add a short note if it helps">
        </div>
      `;
    }
    if (question.type === "upload") {
      return `
        <div class="question-card">
          <label>${escapeHtml(question.label)}</label>
          <label class="upload-mini-zone">
            <input type="file" hidden data-question-upload="${escapeHtml(question.key)}">
            <span>${draft[question.key] ? "Change document" : "Choose document"}</span>
            <small>${draft[question.key] ? `Selected for this demo: ${draft[question.key]}` : "Optional. In the final version, this would be stored securely."}</small>
          </label>
        </div>
      `;
    }
    return "";
  }

  function renderOptionalEvidenceBlock(service, draft, stepNumber) {
    const documentQuestions = optionalEvidenceQuestionsForService(service);
    if (!documentQuestions.length) return "";
    return `
      <section class="question-panel optional-evidence-panel">
        <div class="question-panel-heading">
          <span class="section-kicker">Step ${stepNumber}</span>
          <h3>Optional documents and dates</h3>
        </div>
        <p class="question-panel-copy">Have this document handy? You can add it now, or skip and come back later.</p>
        <div class="question-stack-inner">
          ${documentQuestions.map((question) => renderQuestionField(question, draft)).join("")}
        </div>
      </section>
    `;
  }

  function renderServicePage() {
    const service = SERVICE_CONFIG[serviceKey];
    if (!service) {
      app.innerHTML = `${baseHeader()}<main class="public-main"><section class="page-section"><p>Service not found.</p></section></main>${baseFooter()}`;
      return;
    }

    if (!state.serviceDraft.focusMode) state.serviceDraft.focusMode = service.entryService === "eviction" ? "full_compliance" : "service_only";
    if (!state.serviceDraft.isTenanted) state.serviceDraft.isTenanted = "unsure";
    saveServiceDraft(serviceKey, state.serviceDraft);

    document.title = `${service.title} | ComplyMyProperty`;
    const progress = serviceProgress(state.serviceDraft, service);
    const journeyQuestions = journeyQuestionsForService(service);
    app.innerHTML = `
      ${baseHeader("services")}
      <main class="public-main">
        <section class="page-hero public-page-hero">
          <div>
            <span class="eyebrow">${escapeHtml(service.eyebrow)}</span>
            <h1>${escapeHtml(service.heroTitle)}</h1>
            <p>${escapeHtml(service.heroCopy)}</p>
            <div class="hero-actions">
              <a class="button primary" href="#journeyStart">Start this journey</a>
              <button class="button secondary" type="button" data-skip-service>Skip to Add Property</button>
            </div>
            <div class="hero-metrics">
              <span><strong>${progress.answered}/${progress.total}</strong> setup choices recorded</span>
              <span><strong>${escapeHtml(focusLabel(state.serviceDraft.focusMode || "service_only"))}</strong> selected</span>
            </div>
          </div>
          <img src="assets/cmp-hero-property.png" alt="${escapeHtml(service.title)} landlord journey preview">
        </section>

        <section class="page-section service-journey-shell" id="journeyStart">
          <div class="section-heading">
            <span class="eyebrow">${escapeHtml(service.title)} journey</span>
            <h2>Choose how focused you want us to be.</h2>
            <p>You stay in control. Just this service is a valid path. Related checks and a wider property review are optional.</p>
          </div>

          <div class="journey-progress-bar" aria-label="Journey setup progress">
            <span style="width:${progress.percent}%"></span>
          </div>

          <div class="question-stack">
            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">1</span>
                <h3>${escapeHtml(service.intentHeading)}</h3>
              </div>
              ${renderChoiceCards("intent", service.intents, state.serviceDraft.intent, "data-intent")}
            </section>

            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">2</span>
                <h3>How focused do you want us to be?</h3>
              </div>
              ${renderChoiceCards("focus", focusOptionsForService(serviceKey), state.serviceDraft.focusMode, "data-focus")}
            </section>

            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">3</span>
                <h3>Is the property currently tenanted?</h3>
              </div>
              ${renderChoiceCards("tenanted", [
                { value: "yes", label: "Yes", helper: "Use the tenancy evidence path where relevant." },
                { value: "no", label: "No", helper: "Keep the journey lighter where tenancy proof does not apply." },
                { value: "unsure", label: "Not sure at this point", helper: "No problem — CMP will keep this as something to double-check." }
              ], state.serviceDraft.isTenanted, "data-tenanted")}
            </section>

            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">4</span>
                <h3>Service-specific questions</h3>
              </div>
              <div class="question-stack-inner">
                ${journeyQuestions.map((question) => renderQuestionField(question, state.serviceDraft)).join("")}
              </div>
            </section>

            ${service.calculator ? renderMortgageCalculator(state.serviceDraft) : ""}
            ${renderOptionalEvidenceBlock(service, state.serviceDraft, service.calculator ? 6 : 5)}

            <section class="helper-card">
              <span class="service-grid-eyebrow">Reassurance</span>
              <h3>Not sure? You can continue and come back later.</h3>
              <p>You stay in control of how much you want to check. CMP will carry these answers into Add Property and keep the next step obvious.</p>
            </section>

            <div class="service-journey-actions">
              <button class="button primary" type="button" data-continue-service>Continue to Add Property</button>
              <button class="button secondary" type="button" data-service-properties>Go to My Properties instead</button>
            </div>
          </div>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;

    wireServicePage(service);
  }

  function mortgageEstimate(values) {
    const propertyValue = Number(values.property_value || 0);
    const deposit = Number(values.deposit_amount || 0);
    const principal = Number(values.loan_amount || Math.max(propertyValue - deposit, 0));
    const interestRate = Number(values.interest_rate || 5.5);
    const termYears = Number(values.term_years || 25);
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    const interestOnly = values.repayment_mode === "interest_only";
    const monthlyPayment = principal <= 0
      ? 0
      : interestOnly
        ? principal * monthlyRate
        : monthlyRate === 0
          ? principal / totalPayments
          : principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalPayments)));
    const ltv = propertyValue > 0 ? (principal / propertyValue) * 100 : 0;
    const monthlyRent = Number(values.estimated_rent || 0);
    const rentCoverage = monthlyRent > 0 && monthlyPayment > 0 ? (monthlyRent / monthlyPayment) * 100 : 0;
    return {
      principal,
      monthlyPayment,
      ltv,
      rentCoverage
    };
  }

  function renderMortgageCalculator(draft) {
    const estimate = mortgageEstimate(draft);
    return `
      <section class="question-panel calculator-panel">
        <div class="question-panel-heading">
          <span class="section-kicker">5</span>
          <h3>Simple mortgage estimate</h3>
        </div>
        <div class="calculator-grid">
          <label>Property value<input type="number" data-question-input="property_value" value="${escapeHtml(draft.property_value || "250000")}" min="0"></label>
          <label>Deposit amount<input type="number" data-question-input="deposit_amount" value="${escapeHtml(draft.deposit_amount || "50000")}" min="0"></label>
          <label>Loan amount<input type="number" data-question-input="loan_amount" value="${escapeHtml(draft.loan_amount || "")}" min="0" placeholder="Calculated automatically if left blank"></label>
          <label>Interest rate %<input type="number" step="0.01" data-question-input="interest_rate" value="${escapeHtml(draft.interest_rate || "5.5")}" min="0"></label>
          <label>Mortgage term (years)<input type="number" data-question-input="term_years" value="${escapeHtml(draft.term_years || "25")}" min="1"></label>
          <label>Estimated monthly rent (optional)<input type="number" data-question-input="estimated_rent" value="${escapeHtml(draft.estimated_rent || "")}" min="0"></label>
        </div>
        <div class="selection-grid calculator-choice-grid">
          ${renderChoiceCards("repayment_mode", [
            { value: "repayment", label: "Repayment", helper: "Monthly payment includes capital and interest." },
            { value: "interest_only", label: "Interest-only", helper: "Monthly payment covers the interest estimate only." }
          ], draft.repayment_mode || "repayment", "data-calculator-mode")}
        </div>
        <div class="calculator-summary">
          <article><span>Estimated monthly payment</span><strong>£${estimate.monthlyPayment.toFixed(0)}</strong></article>
          <article><span>Loan to value</span><strong>${estimate.ltv.toFixed(1)}%</strong></article>
          <article><span>Rent coverage</span><strong>${estimate.rentCoverage ? `${estimate.rentCoverage.toFixed(0)}%` : "Add rent"}</strong></article>
        </div>
        <small>This is only an estimate for this prototype preview. It is not regulated mortgage advice.</small>
      </section>
    `;
  }

  function wireServicePage(service) {
    const persistServiceJourney = () => {
      const answeredQuestions = buildJourneyAnswers(service, state.serviceDraft);
      window.CMPJourney?.setEntry?.({
        entryService: service.entryService,
        focusMode: state.serviceDraft.focusMode || (service.entryService === "eviction" ? "full_compliance" : "service_only"),
        isTenanted: state.serviceDraft.isTenanted && state.serviceDraft.isTenanted !== "unsure" ? state.serviceDraft.isTenanted : "unsure",
        answeredQuestions,
        sourceRoute: `${window.location.pathname.split("/").pop() || service.route}`
      });
    };

    app.querySelectorAll("[data-intent]").forEach((button) => {
      button.addEventListener("click", () => {
        state.serviceDraft.intent = button.dataset.intent;
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelectorAll("[data-focus]").forEach((button) => {
      button.addEventListener("click", () => {
        state.serviceDraft.focusMode = button.dataset.focus;
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelectorAll("[data-tenanted]").forEach((button) => {
      button.addEventListener("click", () => {
        state.serviceDraft.isTenanted = button.dataset.tenanted;
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelectorAll("[data-question-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.choiceGroupName;
        if (!key) return;
        state.serviceDraft[key] = button.dataset.questionChoice;
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelectorAll("[data-question-input]").forEach((input) => {
      input.addEventListener("input", () => {
        state.serviceDraft[input.dataset.questionInput] = input.value;
        saveServiceDraft(serviceKey, state.serviceDraft);
        if (service.calculator) renderServicePage();
      });
      input.addEventListener("change", () => {
        state.serviceDraft[input.dataset.questionInput] = input.value;
        saveServiceDraft(serviceKey, state.serviceDraft);
      });
    });
    app.querySelectorAll("[data-question-upload]").forEach((input) => {
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        state.serviceDraft[input.dataset.questionUpload] = file?.name || "";
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelectorAll("[data-calculator-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.serviceDraft.repayment_mode = button.dataset.calculatorMode;
        saveServiceDraft(serviceKey, state.serviceDraft);
        renderServicePage();
      });
    });
    app.querySelector("[data-continue-service]")?.addEventListener("click", () => {
      persistServiceJourney();
      flash(`${service.title} journey saved. Next: choose the property.`, "info");
      window.location.href = "add-property.html";
    });
    app.querySelector("[data-skip-service]")?.addEventListener("click", () => {
      persistServiceJourney();
      flash(`${service.title} journey saved. You can choose the property now.`, "info");
      window.location.href = "add-property.html";
    });
    app.querySelector("[data-service-properties]")?.addEventListener("click", () => {
      persistServiceJourney();
      flash(`${service.title} journey saved. You can pick up from My Properties whenever you're ready.`, "info");
      window.location.href = "my-properties.html";
    });
  }

  function buildJourneyAnswers(service, draft) {
    const answers = {
      service_intent: draft.intent || "",
      service_focus: draft.focusMode || "",
      isTenanted: draft.isTenanted || "unsure"
    };
    [...(service.questions || []), ...(service.optionalEvidence || [])].forEach((question) => {
      if (hasAnswer(draft, question.key)) {
        answers[question.key] = draft[question.key];
      }
    });
    return answers;
  }

  async function lookupPostcode(postcode) {
    const normalized = normalizePostcode(postcode);
    if (!normalized) throw new Error("Enter a postcode first.");
    const response = await fetch(`https://api.postcodes.io/postcodes/${normalized}`);
    const data = await response.json();
    if (!response.ok || data.status !== 200 || !data.result) {
      throw new Error("Postcode not recognised.");
    }
    return data.result;
  }

  function demoPostcodeMeta(postcode) {
    return {
      postcode: formatPostcode(postcode),
      post_town: "Birmingham",
      admin_district: "Birmingham",
      region: "West Midlands",
      country: "England"
    };
  }

  function generateAddressMatches(postcode, meta) {
    return DEMO_ADDRESS_TEMPLATES.map((template, index) => {
      const address = `${template.houseNumber}, ${template.street}, ${meta.post_town || meta.admin_district || "Birmingham"}, ${formatPostcode(postcode)}`;
      const issueDate = `2024-0${(index % 4) + 2}-1${index}`;
      const expiryDate = template.rating ? `2034-0${(index % 4) + 2}-1${index}` : "";
      return {
        id: `address-${normalizePostcode(postcode)}-${index + 1}`,
        uprn: `1000${normalizePostcode(postcode)}${index + 1}`,
        address,
        postcode: formatPostcode(postcode),
        city: meta.post_town || meta.admin_district || "Birmingham",
        type: template.type,
        bedrooms: template.bedrooms,
        storeys: template.storeys,
        hasGas: template.hasGas,
        fixedCombustion: template.fixedCombustion,
        epc: {
          rating: template.rating,
          currentScore: template.currentScore,
          potential: template.potential,
          potentialScore: template.potentialScore,
          issue: issueDate,
          expiry: expiryDate,
          certificate: template.rating ? `EPC-${normalizePostcode(postcode)}-${index + 1}` : "",
          source: template.rating ? "Example EPC preview" : "Example property preview"
        }
      };
    });
  }

  function buildServiceDocs(service, draft) {
    const docs = [];
    Object.entries(draft).forEach(([key, value]) => {
      if (!value || typeof value !== "string") return;
      if (!/_upload$/.test(key)) return;
      docs.push({
        key,
        title: value,
        date: "",
        source: "Selected from the public journey"
      });
    });
    return docs;
  }

  function buildServiceTimeline(service, draft, selection) {
    return [
      {
        id: `public-journey:${selection.uprn || selection.id}`,
        type: "system",
        category: service.entryService === "eviction" ? "eviction" : service.entryService === "mould" ? "mould_damp" : service.entryService,
        title: `${service.title} journey started`,
        description: `Started from the public ${service.title} page with ${focusLabel(draft.focusMode || "service_only")} selected.`,
        eventDate: new Date().toISOString().slice(0, 10),
        dueDate: null,
        source: "system",
        linkedEvidenceId: null,
        linkedQuestionId: null,
        status: "completed",
        confidence: "medium",
        notes: null,
        createdAt: nowIso(),
        updatedAt: nowIso()
      }
    ];
  }

  function buildPropertyFromSelection(selection) {
    const journey = currentJourney();
    const sourceService = SERVICE_CONFIG[journey.entryService] || {
      entryService: "full_compliance",
      title: "Full Compliance",
      route: "services.html"
    };
    const propertyId = selection.uprn ? `property:${selection.uprn}` : `property:${normalizedAddressKey(selection.address, selection.postcode)}`;
    const tenanted = journey.isTenanted === "yes" ? true : journey.isTenanted === "no" ? false : null;
    const answers = journey.answeredQuestions || {};
    const property = {
      id: propertyId,
      shortName: selection.address.split(",")[0],
      address: selection.address,
      postcode: selection.postcode,
      city: selection.city,
      type: selection.type || "",
      bedrooms: selection.bedrooms ?? null,
      storeys: selection.storeys ?? null,
      hasGas: answers.has_gas_appliances === "yes" ? true : answers.has_gas_appliances === "no" ? false : selection.hasGas ?? null,
      fixedCombustion: selection.fixedCombustion ?? null,
      epc: {
        rating: selection.epc?.rating || "",
        currentScore: selection.epc?.currentScore ?? null,
        potential: selection.epc?.potential || "",
        potentialScore: selection.epc?.potentialScore ?? null,
        issue: selection.epc?.issue || "",
        expiry: selection.epc?.expiry || "",
        certificate: selection.epc?.certificate || "",
        source: selection.epc?.source || "Example EPC preview"
      },
      gas: {
        issue: answers.last_gas_check || "",
        engineer: ""
      },
      eicr: {
        issue: answers.last_eicr_check || "",
        result: ""
      },
      alarms: {
        smokeEachStorey: null,
        coAlarm: null,
        testedAtStart: null
      },
      tenancy: {
        currentlyTenanted: tenanted,
        agreement: null,
        howToRent: null,
        epcServed: null,
        gasServed: null,
        eicrServed: null,
        rightToRent: null
      },
      deposit: {
        taken: null,
        protected: null,
        prescribedInfo: null
      },
      licensing: {
        localChecked: answers.licence_state ? true : null,
        hmoLicence: null,
        licenceExpiry: "",
        localAuthority: answers.local_authority || ""
      },
      inspections: {
        last: answers.last_inspection || "",
        concern: answers.inspection_concern || ""
      },
      possession: {
        planned: journey.entryService === "eviction" ? true : null
      },
      docs: buildServiceDocs(sourceService, answers),
      evidence: {},
      timeline: buildServiceTimeline(sourceService, journey, selection),
      serviceRequests: [],
      originJourney: {
        entryService: journey.entryService,
        focusMode: journey.focusMode,
        label: sourceService.title,
        createdAt: nowIso()
      },
      identity: {
        propertyId,
        uprn: selection.uprn || "",
        addressKey: normalizedAddressKey(selection.address, selection.postcode),
        certificateRef: selection.epc?.certificate || ""
      }
    };

    if (answers.has_gas_certificate === "no" && property.hasGas === true) {
      property.gas.issue = "";
    }
    if (answers.has_eicr === "yes" && answers.last_eicr_check) {
      property.eicr.issue = answers.last_eicr_check;
    }
    if (answers.has_eicr === "no") {
      property.eicr.issue = "";
    }
    if (answers.insurance_state) {
      property.insurance = { status: answers.insurance_state };
    }
    if (answers.mould_severity) {
      property.mouldCase = {
        severity: answers.mould_severity,
        tenantReported: answers.tenant_reported_mould || "",
        repairState: answers.mould_repair_state || ""
      };
    }

    return property;
  }

  function nextActionForProperty(property) {
    const source = property.originJourney?.entryService || "full_compliance";
    if (source === "epc") return property.epc?.rating ? "Review EPC" : "Check EPC";
    if (source === "gas") return property.hasGas === true && !property.gas?.issue ? "Upload Gas Safety evidence" : "Check gas setup";
    if (source === "eicr") return property.eicr?.issue ? "Review EICR" : "Add EICR details";
    if (source === "eviction") return "Build evidence pack";
    if (source === "mould") return "Continue issue timeline";
    if (source === "inspection") return "Continue inspection record";
    if (source === "licensing") return "Check licensing position";
    if (source === "mortgage") return "Review mortgage estimate";
    return "Continue property check";
  }

  function statusForProperty(property) {
    if (property.epc?.rating) {
      return {
        tone: "info",
        label: `EPC ${property.epc.rating}`
      };
    }
    if (property.originJourney?.entryService === "eviction") {
      return {
        tone: "warning",
        label: "Evidence pack started"
      };
    }
    return {
      tone: "neutral",
      label: "Setup started"
    };
  }

  function journeyLabelForProperty(property) {
    const source = property.originJourney?.entryService || currentJourney().entryService;
    return serviceLabel(source);
  }

  function selectPropertyAndOpenDashboard(property) {
    const origin = property.originJourney || {};
    window.CMPJourney?.update?.({
      selectedPropertyId: property.id,
      entryService: origin.entryService || currentJourney().entryService,
      focusMode: origin.focusMode || currentJourney().focusMode,
      isTenanted: property.tenancy?.currentlyTenanted === true ? "yes" : property.tenancy?.currentlyTenanted === false ? "no" : currentJourney().isTenanted,
      answeredQuestions: currentJourney().answeredQuestions || {}
    });
    window.location.href = "dashboard.html";
  }

  async function renderAddPropertyPage() {
    const context = currentJourney();
    const service = SERVICE_CONFIG[context.entryService] || SERVICE_CONFIG.epc;
    document.title = "Add Property | ComplyMyProperty";
    app.innerHTML = `
      ${baseHeader("add-property")}
      <main class="public-main">
        <section class="page-hero public-page-hero">
          <div>
            <span class="eyebrow">Add Property</span>
            <h1>Add your property</h1>
            <p>Enter a postcode and choose the right address. CMP will look for EPC information automatically and carry your ${escapeHtml(service.title)} journey forward.</p>
            <div class="hero-metrics">
              <span><strong>Journey</strong> ${escapeHtml(service.title)}</span>
              <span><strong>Focus</strong> ${escapeHtml(focusLabel(context.focusMode || "service_only"))}</span>
              <span><strong>Tenancy</strong> ${escapeHtml(tenancyLabel(context.isTenanted || "unsure"))}</span>
            </div>
          </div>
          <img src="assets/cmp-hero-property.png" alt="Choose a property address by postcode">
        </section>

        ${renderFlashBanner()}

        <section class="page-section">
          <div class="question-stack">
            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">Step 1</span>
                <h3>Enter postcode</h3>
              </div>
              <form class="postcode-card" id="addPropertySearchForm">
                <label for="addPropertyPostcode">Property postcode</label>
                <div class="postcode-row">
                  <input id="addPropertyPostcode" type="text" value="${escapeHtml(state.addProperty.postcode)}" placeholder="B37 7BA" autocomplete="postal-code">
                  <button class="button primary" type="submit" ${state.addProperty.isSearching ? "disabled" : ""}>${state.addProperty.isSearching ? "Checking..." : "Find address"}</button>
                </div>
                <small>We'll look for EPC information automatically. If live records are unavailable, CMP will still show a realistic property preview.</small>
              </form>
            </section>

            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">Step 2</span>
                <h3>Select address</h3>
              </div>
              ${renderAddressResults()}
            </section>

            <section class="question-panel">
              <div class="question-panel-heading">
                <span class="section-kicker">Step 3</span>
                <h3>Import property details</h3>
              </div>
              <div class="helper-card compact">
                <h3>${escapeHtml(state.addProperty.stage || "Choose the address, then CMP will do the rest.")}</h3>
                <p>${escapeHtml(state.addProperty.message || "Once you pick the right property, CMP will import the EPC preview, create the property record, and send you to My Properties.")}</p>
              </div>
            </section>
          </div>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;

    document.getElementById("addPropertySearchForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.getElementById("addPropertyPostcode");
      const postcode = input?.value?.trim() || "";
      await searchAddresses(postcode);
    });

    app.querySelectorAll("[data-use-address]").forEach((button) => {
      button.addEventListener("click", async () => {
        const match = state.addProperty.matches.find((item) => item.id === button.dataset.useAddress);
        if (!match) return;
        state.addProperty.selectedId = match.id;
        state.addProperty.stage = "Checking EPC records...";
        state.addProperty.message = "Checking EPC records...";
        renderAddPropertyPage();
        await wait(350);
        state.addProperty.stage = "Importing property details...";
        state.addProperty.message = "Importing property details...";
        renderAddPropertyPage();
        await wait(450);
        state.addProperty.stage = "Building your dashboard...";
        state.addProperty.message = "Building your dashboard...";
        renderAddPropertyPage();
        await wait(550);

        const property = buildPropertyFromSelection(match);
        const existing = propertyEntries().find((item) => item.identity?.addressKey === property.identity.addressKey || item.identity?.uprn === property.identity.uprn);
        const target = existing || property;
        if (!existing) {
          saveWorkspaceEntry(property, { ...currentJourney().answeredQuestions });
          localStorage.setItem(ONBOARDING_STORAGE, "true");
        }
        window.CMPJourney?.update?.({
          selectedPropertyId: target.id
        });
        flash(existing ? "This property already existed. CMP kept the existing record and sent you to My Properties." : "Property added. EPC information found.", "success");
        window.location.href = "my-properties.html";
      });
    });

    if (state.addProperty.postcode && !state.addProperty.matches.length && !state.addProperty.isSearching && !state.addProperty.prefillHandled) {
      state.addProperty.prefillHandled = true;
      void searchAddresses(state.addProperty.postcode, { quiet: true });
    }
  }

  function renderAddressResults() {
    if (!state.addProperty.matches.length) {
      return `
        <div class="empty-state-card">
          <strong>No address selected yet</strong>
          <p>Enter a postcode first. If live records are unavailable, CMP will still show realistic address choices so you can continue.</p>
        </div>
      `;
    }
    return `
      <div class="address-card-list">
        ${state.addProperty.matches.map((match) => `
          <article class="address-card${state.addProperty.selectedId === match.id ? " is-selected" : ""}">
            <div>
              <strong>${escapeHtml(match.address)}</strong>
              <p>${escapeHtml(match.postcode)} · ${escapeHtml(match.type || "Property type to confirm")}</p>
              <small>${escapeHtml(match.epc?.rating ? "EPC match found" : "EPC needs checking")}</small>
            </div>
            <button class="button primary" type="button" data-use-address="${escapeHtml(match.id)}">Use this property</button>
          </article>
        `).join("")}
      </div>
    `;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function searchAddresses(postcode, options = {}) {
    state.addProperty.postcode = postcode;
    if (!normalizePostcode(postcode)) {
      state.addProperty.isSearching = false;
      state.addProperty.message = "Enter a postcode to see the available addresses.";
      state.addProperty.stage = "Enter postcode";
      renderAddPropertyPage();
      return;
    }
    state.addProperty.isSearching = true;
    state.addProperty.message = "Checking postcode...";
    state.addProperty.stage = "Looking for the right address";
    renderAddPropertyPage();
    let meta;
    try {
      meta = await lookupPostcode(postcode);
      state.addProperty.message = "Postcode recognised. Loading realistic address options.";
    } catch (error) {
      if (!DEMO_MODE) {
        state.addProperty.isSearching = false;
        state.addProperty.message = error.message;
        state.addProperty.stage = "Postcode needs checking";
        renderAddPropertyPage();
        return;
      }
      meta = demoPostcodeMeta(postcode);
      state.addProperty.message = options.quiet
        ? "Loading realistic address options."
        : "Live records were not available, so CMP is showing a realistic property preview instead.";
    }
    state.addProperty.matches = generateAddressMatches(postcode, meta);
    state.addProperty.isSearching = false;
    state.addProperty.stage = "Choose the right address";
    renderAddPropertyPage();
  }

  function renderMyPropertiesPage() {
    document.title = "My Properties | ComplyMyProperty";
    const properties = propertyEntries();
    app.innerHTML = `
      ${baseHeader("my-properties")}
      <main class="public-main">
        <section class="page-hero public-page-hero">
          <div>
            <span class="eyebrow">My Properties</span>
            <h1>Choose a property, then open the right dashboard.</h1>
            <p>This sits between Add Property and the dashboard, just like the Wix journey. It keeps the landlord in control of which property they open next.</p>
            <div class="hero-actions">
              <a class="button primary" href="add-property.html">Add property</a>
              <button class="button secondary" type="button" data-load-demo-property>Try example property</button>
            </div>
          </div>
          <img src="assets/cmp-dashboard-preview.png" alt="My Properties view and property dashboard preview">
        </section>

        ${renderFlashBanner()}

        <section class="page-section">
          <div class="section-heading">
            <span class="eyebrow">Property list</span>
            <h2>${properties.length ? "Your properties" : "Start by adding your first property"}</h2>
            <p>${properties.length ? "Each card carries the journey label, a basic status, and the next obvious action." : "Add a property, or use the example property to preview how the dashboard opens from this page."}</p>
          </div>
          ${properties.length ? `
            <div class="property-card-grid">
              ${properties.map((property) => {
                const status = statusForProperty(property);
                return `
                  <article class="property-summary-card">
                    <div class="property-summary-top">
                      <span class="status-pill ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
                      <span class="quiet-pill">${escapeHtml(journeyLabelForProperty(property))}</span>
                    </div>
                    <h3>${escapeHtml(property.address)}</h3>
                    <p>${escapeHtml(nextActionForProperty(property))}</p>
                    <div class="property-summary-meta">
                      <span>${escapeHtml(property.type || "Property type to confirm")}</span>
                      <span>${escapeHtml(property.epc?.rating ? `EPC ${property.epc.rating}` : "No EPC rating recorded yet")}</span>
                    </div>
                    <button class="button primary" type="button" data-view-property="${escapeHtml(property.id)}">View dashboard</button>
                  </article>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="empty-state-card large">
              <strong>No properties added yet</strong>
              <p>Add your first property to start checking compliance, tracking evidence, and opening the right dashboard.</p>
              <div class="hero-actions">
                <a class="button primary" href="add-property.html">Add property</a>
                <button class="button secondary" type="button" data-load-demo-property>Try example property</button>
              </div>
            </div>
          `}
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;

    app.querySelectorAll("[data-view-property]").forEach((button) => {
      button.addEventListener("click", () => {
        const property = properties.find((item) => item.id === button.dataset.viewProperty);
        if (property) selectPropertyAndOpenDashboard(property);
      });
    });
    app.querySelectorAll("[data-load-demo-property]").forEach((button) => {
      button.addEventListener("click", () => {
        const defaultSelection = generateAddressMatches("B37 7BA", demoPostcodeMeta("B37 7BA"))[0];
        const existing = propertyEntries().find((item) => item.identity?.addressKey === normalizedAddressKey(defaultSelection.address, defaultSelection.postcode));
        if (!existing) {
          window.CMPJourney?.setEntry?.({
            entryService: "full_compliance",
            focusMode: "full_compliance",
            isTenanted: "yes",
            answeredQuestions: {
              service_intent: "broader_check",
              service_focus: "full_compliance"
            },
            sourceRoute: "my-properties.html"
          });
          const property = buildPropertyFromSelection(defaultSelection);
          saveWorkspaceEntry(property, currentJourney().answeredQuestions);
        }
        flash("Example property loaded. You can open the dashboard now.", "success");
        renderMyPropertiesPage();
      });
    });
  }

  function renderNewsPage() {
    document.title = "CMP Updates | ComplyMyProperty";
    const categories = ["all", ...new Set(NEWS_ARTICLES.map((article) => article.category))];
    const articles = state.newsFilter === "all"
      ? NEWS_ARTICLES
      : NEWS_ARTICLES.filter((article) => article.category === state.newsFilter);
    app.innerHTML = `
      ${baseHeader("news")}
      <main class="public-main">
        <section class="page-hero public-page-hero">
          <div>
            <span class="eyebrow">Latest compliance updates</span>
            <h1>Latest compliance updates</h1>
            <p>This is an editorial preview area for EPCs, licensing, Gas Safety, possession preparation, mould responsibilities, and practical landlord reminders.</p>
          </div>
          <img src="assets/cmp-evidence-ai.png" alt="Editorial updates and landlord guidance">
        </section>
        <section class="page-section">
          <div class="filter-row">
            ${categories.map((category) => `<button class="filter-chip${state.newsFilter === category ? " is-active" : ""}" type="button" data-news-filter="${escapeHtml(category)}">${escapeHtml(category === "all" ? "All updates" : category)}</button>`).join("")}
          </div>
          <div class="news-grid">
            ${articles.map((article) => renderArticleCard(article)).join("")}
          </div>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;

    app.querySelectorAll("[data-news-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.newsFilter = button.dataset.newsFilter;
        renderNewsPage();
      });
    });
  }

  function renderFlashBanner() {
    const notice = readFlash();
    if (!notice) return "";
    return `<section class="page-section"><div class="flash-banner flash-${escapeHtml(notice.tone || "info")}"><strong>${escapeHtml(notice.message)}</strong></div></section>`;
  }

  function toggleAssistant() {
    state.assistantOpen = !state.assistantOpen;
    renderPage();
  }

  function renderPage() {
    if (page === "home") {
      renderHomepage();
    } else if (page === "services") {
      renderServicesOverview();
    } else if (page === "service") {
      renderServicePage();
    } else if (page === "add-property") {
      renderAddPropertyPage();
    } else if (page === "my-properties") {
      renderMyPropertiesPage();
    } else if (page === "news") {
      renderNewsPage();
    }

    app.querySelectorAll("[data-toggle-assistant]").forEach((button) => {
      button.addEventListener("click", toggleAssistant);
    });
    app.querySelectorAll("[data-open-article]").forEach((button) => {
      button.addEventListener("click", () => {
        flash("Example article only. A fuller updates area can be layered on later.", "info");
        renderPage();
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderPage();
})();
