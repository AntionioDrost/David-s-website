(function () {
  const DEMO_MODE = window.CMP_DEMO_MODE !== false;
  const QA_MODE = new URLSearchParams(window.location.search).get("qa") === "1";
  const WORKSPACE_STORAGE_KEY = "cmp_compliance_workspaces::guest";
  const ONBOARDING_STORAGE = "cmp_onboarding_complete";
  const FLASH_STORAGE_KEY = "cmp_public_flash";
  const SERVICE_DRAFT_PREFIX = "cmp_public_service_draft::";
  const HOME_POSTCODE_KEY = "cmp_public_postcode_hint";

  function qaDemoCta(className = "button tertiary") {
    return QA_MODE
      ? `<a class="${escapeHtml(className)}" href="dashboard-labs.html?demo=nick&qa=1"><i data-lucide="layout-dashboard"></i>Open QA demo</a>`
      : "";
  }

  const SERVICE_CONFIG = {
    epc: {
      route: "epcs.html",
      entryService: "epc",
      title: "EPCs",
      eyebrow: "Energy performance",
      promise: "Start with EPC rating, expiry and improvement context, then widen only if it helps.",
      heroTitle: "EPC support that starts with the rating and expiry.",
      heroCopy: "Use this route when EPC status, renewal timing or improvement work is the reason you are here. CMP can keep the journey EPC-only, add related checks, or widen into a full property review.",
      description: "Check EPC status, review expiry dates, and spot improvement opportunities without being pushed into unrelated checks.",
      cardCta: "Start EPC route",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "book_epc", label: "I just need an EPC assessment", helper: "Keep this focused on the certificate and the next step." },
        { value: "check_rules", label: "I want to understand the EPC position", helper: "Use the rating, dates and property context to see what matters." },
        { value: "improve_rating", label: "I want to improve a low EPC rating", helper: "Start with the current EPC, then look at sensible follow-on actions." },
        { value: "broader_check", label: "I want a broader property check", helper: "Use EPC as the starting point for a wider property review." }
      ],
      questions: [
        { key: "eviction_reason", type: "choice", label: "Is the EPC needed for letting, renewal or a property decision?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure" } },
        { key: "already_have_epc", type: "choice", label: "Do you already have an EPC certificate or rating?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } }
      ],
      optionalEvidence: [
        { key: "epc_upload", type: "upload", label: "Add EPC proof later if you have it" },
        { key: "epc_issue_date", type: "date", label: "EPC issue or expiry date, if known" }
      ],
      assistant: [
        "If you only came for the EPC, choose the focused option. CMP will not push the full property check too hard.",
        "If the EPC is already in place, CMP can use that as the first known fact when the property is added."
      ]
    },
    gas: {
      route: "gas-safety.html",
      entryService: "gas",
      title: "Gas Safety",
      eyebrow: "Gas Safety",
      promise: "Start with gas appliances, certificate evidence and renewal timing.",
      heroTitle: "Gas Safety support that starts with the property setup.",
      heroCopy: "CMP asks whether gas applies, whether proof is already held, and whether you need to request a service or simply keep better evidence.",
      description: "Check whether gas applies, capture certificate evidence and renewal timing, then decide whether this stays focused or widens.",
      cardCta: "Start Gas Safety route",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_gas", label: "I want to check the gas safety position", helper: "Start with appliances, certificate evidence and the last known check." },
        { value: "need_certificate", label: "I need a Gas Safety Certificate", helper: "Use this if the certificate is missing, due or unclear." },
        { value: "tenant_prep", label: "I'm preparing for a tenant or inspection", helper: "Capture the proof and annual renewal context." },
        { value: "full_check", label: "I want a full property check", helper: "Gas first, then the wider property picture." }
      ],
      questions: [
        { key: "has_gas_appliances", type: "choice", label: "Does the property have gas appliances?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "has_gas_certificate", type: "choice", label: "Do you currently have a Gas Safety Certificate?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "last_gas_check", type: "date", label: "When was the last gas safety check?", placement: "documents" },
        { key: "gas_upload", type: "upload", label: "Add Gas Safety proof later if you have it", placement: "documents" }
      ],
      assistant: [
        "If you are not sure whether gas applies, say so. CMP will treat that as a check-next item, not a failure.",
        "If you already have the certificate, you can add the proof later from the property workspace too."
      ]
    },
    eicr: {
      route: "eicr.html",
      entryService: "eicr",
      title: "EICR",
      eyebrow: "Electrical safety",
      promise: "Start with electrical safety proof, report age and renewal context.",
      heroTitle: "EICR support for held proof, missing reports and renewals.",
      heroCopy: "CMP keeps the first questions short: whether you have an EICR, when it was last inspected, and whether this should stay certificate-focused.",
      description: "Capture the current EICR position, add proof later if you have it, and then choose whether to widen the checks.",
      cardCta: "Start EICR route",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_electrical", label: "I want to check the electrical safety position", helper: "Start with the current EICR and what is known." },
        { value: "need_eicr", label: "I need an EICR", helper: "Use this if the report is missing, due or unclear." },
        { value: "tenant_or_renewal", label: "I'm preparing for a tenant, renewal or inspection", helper: "Keep the journey practical, dated and evidence-led." },
        { value: "full_check", label: "I want a full property check", helper: "EICR first, then the wider property picture." }
      ],
      questions: [
        { key: "has_eicr", type: "choice", label: "Do you currently have an EICR?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "last_eicr_check", type: "date", label: "When was the last electrical inspection?", placement: "documents" },
        { key: "eicr_upload", type: "upload", label: "Add EICR proof later if you have it", placement: "documents" }
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
      promise: "Organise the property information, tenancy records and evidence before deciding what support you need.",
      heroTitle: "Start a possession support route with the evidence in order.",
      heroCopy: "CMP helps landlords organise compliance documents, notices, rent context and communications before they move further into possession preparation.",
      description: "Start with the landlord goal, build the document trail around the property and keep the legal boundary clear.",
      cardCta: "Start possession support",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "understand_options", label: "I want to understand the next documents to organise", helper: "Keep the wording careful, factual and evidence-led." },
        { value: "check_compliance_first", label: "I want to check the property evidence first", helper: "Start with certificates, tenancy records and communications." },
        { value: "prepare_properly", label: "I want to prepare for possession support", helper: "Build the document trail in a calm way." },
        { value: "full_check", label: "I want a full property check", helper: "Use the possession need as the reason for a wider property review." }
      ],
      questions: [
        { key: "regaining_possession", type: "choice", label: "Is regaining possession your main goal?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure yet" } },
        { key: "eviction_situation", type: "select", label: "What situation sounds closest to your property?", options: ["Rent arrears", "Late payment pattern", "Anti-social behaviour", "Breach of tenancy", "Sale or move back in", "I'm not sure yet"] },
        { key: "possession_documents", type: "choice", label: "Do you already have notices, communications or rent records to organise?", options: ["yes", "some", "no", "not_sure"], optionLabels: { yes: "Yes", some: "Some records", no: "Not yet", not_sure: "Not sure" } }
      ],
      optionalEvidence: [
        { key: "tenancy_agreement_upload", type: "upload", label: "Add tenancy agreement proof later if you have it" },
        { key: "deposit_proof_upload", type: "upload", label: "Add deposit proof later if available" },
        { key: "notice_evidence_upload", type: "upload", label: "Add notices or tenant communications later if you have them" }
      ],
      assistant: [
        "CMP helps organise your information and evidence. It does not replace legal advice.",
        "If you are not ready for formal advice, you can still use this to organise the document trail first."
      ]
    },
    possession_preparation: {
      route: "possession-eviction-preparation.html",
      entryService: "eviction",
      title: "Possession & Eviction Preparation",
      eyebrow: "Evidence pack",
      promise: "Choose the scenario first, then let CMP organise the evidence trail around it.",
      heroTitle: "Build the possession evidence pack before you chase the next step.",
      heroCopy: "Use the scenario cards to tell CMP what is happening. The aim is to organise facts, documents, notices, communications and timelines calmly before you widen the process.",
      description: "Choose the possession situation, organise the evidence pack, and keep related checks optional until they help.",
      cardCta: "Prepare evidence pack",
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
        { key: "evidence_goal", type: "choice", label: "What do you want this to help with most?", options: ["organise_documents", "check_compliance", "prepare_timeline", "all_three"], optionLabels: { organise_documents: "Organise documents", check_compliance: "Check property records first", prepare_timeline: "Build a timeline", all_three: "A bit of all three" } },
        { key: "possession_timeline_started", type: "choice", label: "Have you already started a timeline of notices, arrears or communications?", options: ["yes", "partly", "no", "not_sure"], optionLabels: { yes: "Yes", partly: "Partly", no: "Not yet", not_sure: "Not sure" } }
      ],
      optionalEvidence: [
        { key: "tenancy_agreement_upload", type: "upload", label: "Add tenancy agreement proof later if you have it" },
        { key: "rent_arrears_upload", type: "upload", label: "Add rent arrears evidence later if it is relevant" },
        { key: "notice_evidence_upload", type: "upload", label: "Add notices or tenant communications later if you have them" }
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
      heroTitle: "Treat mould and damp like a clear response record.",
      heroCopy: "CMP can organise tenant reports, photos, severity notes, inspections, repairs and follow-up communication around a mould or damp issue without forcing the whole property through a bigger process.",
      description: "Organise the tenant report, photos, seriousness, inspections, repairs and follow-up in one calm flow.",
      cardCta: "Start mould support",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "assess_issue", label: "I want to record a mould or damp report", helper: "Start with the seriousness and whether the tenant has reported it." },
        { value: "organise_repairs", label: "I want help organising evidence and repairs", helper: "Use the timeline and document prompts." },
        { value: "prevention_guidance", label: "I want to reduce repeat mould or damp issues", helper: "Capture the property facts first, then keep the issue practical." },
        { value: "broader_check", label: "I want a broader property check", helper: "Start with mould or damp, then widen it later if you want." }
      ],
      questions: [
        { key: "mould_severity", type: "choice", label: "How serious does the issue seem?", options: ["minor_condensation", "one_area", "widespread", "not_sure"], optionLabels: { minor_condensation: "Minor condensation only", one_area: "Visible mould in one area", widespread: "Widespread or recurring mould", not_sure: "I'm not sure" } },
        { key: "tenant_reported_mould", type: "choice", label: "Has the tenant reported it?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "mould_repair_state", type: "choice", label: "Has anything been inspected or repaired?", options: ["inspected", "repaired", "both", "not_yet"], optionLabels: { inspected: "Inspected only", repaired: "Repaired only", both: "Inspected and repaired", not_yet: "Not yet" } },
        { key: "landlord_response_record", type: "choice", label: "Have you kept a record of your response so far?", options: ["yes", "partial", "no", "not_sure"], optionLabels: { yes: "Yes", partial: "Some notes", no: "Not yet", not_sure: "Not sure" } },
        { key: "mould_upload", type: "upload", label: "Upload photos or a report if you have them", placement: "documents" }
      ],
      optionalEvidence: [
        { key: "mould_repair_notes_upload", type: "upload", label: "Add repair or contractor notes later if available" }
      ],
      assistant: [
        "This journey should stay practical. It is about records, dates, inspections, repairs and communication, not medical or legal certainty.",
        "If you are unsure how serious it is, mark that and keep going."
      ]
    },
    licensing: {
      route: "selective-licensing.html",
      entryService: "licensing",
      title: "Selective Licensing",
      eyebrow: "Council licensing",
      promise: "Organise the licensing position, local authority context and evidence you already hold.",
      heroTitle: "Start with the local licence question.",
      heroCopy: "CMP keeps this journey focused on whether HMO, selective or additional licensing may apply, what the current licence state is, and what local authority context you already know.",
      description: "Record whether the property may need licensing, what evidence is held, and whether you need application or renewal support.",
      cardCta: "Start licensing journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "check_need", label: "I want to check if licensing may apply", helper: "Use postcode and local authority details if you know them." },
        { value: "apply_licence", label: "I need support preparing a licence application", helper: "Capture the current position and evidence." },
        { value: "renew_manage", label: "I need help renewing or managing a licence", helper: "Keep the renewal state and documents together." },
        { value: "not_sure", label: "I'm not sure", helper: "Start the licence journey without overcommitting." }
      ],
      questions: [
        { key: "licence_state", type: "choice", label: "What is the current licensing situation?", options: ["already_licensed", "not_licensed", "expired", "not_sure"], optionLabels: { already_licensed: "Already licensed", not_licensed: "Not licensed", expired: "Expired or needs renewal", not_sure: "I'm not sure" } },
        { key: "licence_type", type: "choice", label: "Which licence type might be relevant?", options: ["hmo", "selective", "additional", "not_sure"], optionLabels: { hmo: "HMO", selective: "Selective licensing", additional: "Additional licensing", not_sure: "Not sure" } },
        { key: "local_authority", type: "text", label: "Do you know the council or local authority?" }
      ],
      optionalEvidence: [
        { key: "licence_upload", type: "upload", label: "Add licence or application proof later if you have it" }
      ],
      assistant: [
        "This page organises licensing information. It does not confirm live council records.",
        "If you do not know the council or licence type yet, continue anyway and add it later."
      ]
    },
    inspection: {
      route: "property-inspections.html",
      entryService: "inspection",
      title: "Property Inspections",
      eyebrow: "Condition and access",
      promise: "Keep inspections practical: what kind, what concerns, what was last done, and what proof you have.",
      heroTitle: "Use the inspection journey for condition, access, and practical evidence.",
      heroCopy: "CMP can help organise landlord visit records, inspection photos, condition notes, access concerns and the next inspection plan without immediately turning it into a full property review.",
      description: "Choose the inspection type, capture the condition concern, add photo or report proof later and decide whether you need a broader property review.",
      cardCta: "Start inspection journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "routine", label: "I want to arrange a routine property inspection", helper: "Use this for regular condition and access checks." },
        { value: "condition", label: "I want to check the condition of a property", helper: "Useful for signs of neglect, damage, or issues building up." },
        { value: "concern", label: "I'm concerned about possible damage or neglect", helper: "Keep the concern practical and documented." },
        { value: "broader_check", label: "I want a wider property and condition check", helper: "Start with the inspection and widen it later." }
      ],
      questions: [
        { key: "inspection_type", type: "choice", label: "What kind of inspection do you need?", options: ["routine", "pre_tenancy", "mid_tenancy", "end_tenancy"], optionLabels: { routine: "Routine inspection", pre_tenancy: "Pre-tenancy or move-in", mid_tenancy: "Mid-tenancy inspection", end_tenancy: "End-of-tenancy or condition check" } },
        { key: "inspection_concern", type: "text", label: "What are you most concerned about?" },
        { key: "visit_record_state", type: "choice", label: "Do you already have visit notes, photos or a report?", options: ["yes", "some", "no", "not_sure"], optionLabels: { yes: "Yes", some: "Some proof", no: "Not yet", not_sure: "Not sure" } },
        { key: "last_inspection", type: "date", label: "When was the property last inspected?", placement: "documents" },
        { key: "inspection_upload", type: "upload", label: "Add inspection photos or reports later if you have them", placement: "documents" }
      ],
      assistant: [
        "If you are not sure which inspection type fits best, pick the closest and keep moving.",
        "Photos and notes can be added later from the property workspace too."
      ]
    },
    aml: {
      route: "aml-checks.html",
      entryService: "aml",
      title: "AML Checks",
      eyebrow: "Due diligence support",
      promise: "Organise identity, address and source-of-funds style evidence before deciding what support is needed.",
      heroTitle: "Use the AML route for due diligence documents.",
      heroCopy: "CMP can capture what identity, address and funds-related evidence you already hold and whether this should stay focused or widen into a broader property check.",
      description: "Organise due diligence evidence held vs missing without claiming a regulated check is complete.",
      cardCta: "Start AML journey",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "understand_aml", label: "I want to understand what evidence is needed", helper: "Use this if you want a calm starting point." },
        { value: "check_property", label: "I want to organise due diligence for this property", helper: "Keep it practical and document-led." },
        { value: "organise_documents", label: "I need help organising ID and funds evidence", helper: "Capture what exists now, then add more later." },
        { value: "full_check", label: "I want a full property check", helper: "Use AML as the starting point for a wider journey." }
      ],
      questions: [
        { key: "aml_context", type: "choice", label: "What is the due diligence context?", options: ["landlord", "agent", "purchase_or_sale", "not_sure"], optionLabels: { landlord: "Landlord record", agent: "Agent request", purchase_or_sale: "Purchase or sale", not_sure: "Not sure" } },
        { key: "aml_docs", type: "choice", label: "What identity or address evidence do you currently have?", options: ["photo_id", "proof_of_address", "both", "not_sure"], optionLabels: { photo_id: "Photo ID", proof_of_address: "Proof of address", both: "Both", not_sure: "Not sure" } },
        { key: "source_funds_evidence", type: "choice", label: "Do you hold any source-of-funds or supporting evidence?", options: ["yes", "some", "no", "not_sure"], optionLabels: { yes: "Yes", some: "Some evidence", no: "Not yet", not_sure: "Not sure" } },
        { key: "aml_upload", type: "upload", label: "Add AML evidence later if you have it", placement: "documents" }
      ],
      assistant: [
        "CMP can help organise the document trail here, but it is not confirming that a regulated AML check is complete.",
        "If you only need document organisation, keep the focus tight."
      ]
    },
    rent_guarantee: {
      route: "rent-guarantee.html",
      entryService: "rent_guarantee",
      title: "Rent Guarantee",
      eyebrow: "Rent guarantee readiness",
      promise: "Organise the tenancy, rent and arrears picture before deciding whether specialist support is needed.",
      heroTitle: "Prepare the tenancy and rent picture before exploring rent guarantee support.",
      heroCopy: "CMP helps capture rent reliability, arrears concerns and the documents a specialist may need. CMP does not provide rent guarantee cover, complete underwriting or contact a provider from this route.",
      description: "Prepare rent records and tenancy context for specialist support.",
      cardCta: "Prepare rent support request",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_cover", label: "I want to prepare rent guarantee context", helper: "Start with the tenancy and payment picture." },
        { value: "compare", label: "I want to organise information for specialist support", helper: "Capture the current situation first." },
        { value: "protect_income", label: "I want to understand rent payment risk", helper: "Keep the route practical and document-led." },
        { value: "not_sure", label: "I'm not sure what support fits", helper: "Use the starter questions and decide later." }
      ],
      questions: [
        { key: "rent_reliable", type: "choice", label: "Is the tenant currently paying reliably?", options: ["yes", "mostly", "no", "not_sure"], optionLabels: { yes: "Yes", mostly: "Mostly", no: "No", not_sure: "Not sure" } },
        { key: "arrears_recent", type: "choice", label: "Have there been recent arrears or late payments?", options: ["yes", "no", "not_sure"], optionLabels: { yes: "Yes", no: "No", not_sure: "Not sure at this point" } },
        { key: "wider_check", type: "choice", label: "Do you want wider compliance checked too?", options: ["yes", "no", "later"], optionLabels: { yes: "Yes", no: "No, keep it focused", later: "Maybe later" } }
      ],
      optionalEvidence: [
        { key: "rent_guarantee_upload", type: "upload", label: "Add rent records or provider documents later if you have them" }
      ],
      assistant: [
        "CMP can prepare the rent and tenancy context, but it does not complete underwriting or arrange rent guarantee cover.",
        "No provider is contacted and no payment is taken from this route."
      ]
    },
    insurance: {
      route: "landlord-insurance.html",
      entryService: "insurance",
      title: "Landlord Insurance",
      eyebrow: "Insurance readiness",
      promise: "Organise policy details, property risks and renewal context before deciding whether specialist support is needed.",
      heroTitle: "Prepare your landlord insurance details before renewal or review.",
      heroCopy: "CMP helps gather current policy details, known property risks and documents a specialist may ask for. No policy is arranged, no cover is verified and no insurer is contacted from this route.",
      description: "Prepare policy details and property risk context for specialist support.",
      cardCta: "Prepare insurance request",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_cover", label: "I want to prepare insurance context", helper: "Start with the current policy position." },
        { value: "compare_policies", label: "I want to organise information for specialist support", helper: "Keep it practical and focused." },
        { value: "renew", label: "I need to prepare for renewal", helper: "Use CMP to capture the current policy state." },
        { value: "not_sure", label: "I'm not sure what support fits", helper: "Start gently and decide how far to go." }
      ],
      questions: [
        { key: "insurance_state", type: "choice", label: "What policy information do you currently hold?", options: ["fully_insured", "basic_cover", "not_insured", "not_sure"], optionLabels: { fully_insured: "Policy currently held", basic_cover: "Some policy details held", not_insured: "No current policy details", not_sure: "I'm not sure" } },
        { key: "known_risks", type: "text", label: "Are there any known risks or concerns? (optional)" }
      ],
      optionalEvidence: [
        { key: "insurance_upload", type: "upload", label: "Add policy or renewal documents later if you have them" }
      ],
      assistant: [
        "CMP can organise insurance readiness information, but it does not arrange or recommend a policy.",
        "No insurer is contacted and no cover is verified from this route."
      ]
    },
    mortgage: {
      route: "mortgages.html",
      entryService: "mortgage",
      title: "Mortgages",
      eyebrow: "Property finance readiness",
      promise: "Organise property finance context and documents before deciding whether specialist support is needed.",
      heroTitle: "Prepare your mortgage context before you ask for support.",
      heroCopy: "CMP helps capture ownership, property value and borrowing context so you can decide what to gather next. No lender is contacted, no application is submitted and no approval is implied from this route.",
      description: "Prepare property finance context and an illustrative estimate for specialist support.",
      cardCta: "Prepare mortgage request",
      intentHeading: "What do you need help with today?",
      intents: [
        { value: "want_advice", label: "I want to prepare mortgage context", helper: "Start with the current borrowing position." },
        { value: "lender_requirements", label: "I want to understand likely document needs", helper: "Keep this focused on readiness first." },
        { value: "refinance", label: "I need to organise refinance context", helper: "Use the estimate and property context together." },
        { value: "not_sure", label: "I'm not sure what support fits", helper: "Run the estimate and keep the rest optional." }
      ],
      questions: [
        { key: "mortgage_state", type: "choice", label: "What is the current property finance situation?", options: ["have_mortgage", "need_mortgage", "refinance", "not_sure"], optionLabels: { have_mortgage: "Mortgage currently in place", need_mortgage: "Finance may be needed", refinance: "Refinance context to organise", not_sure: "I'm not sure" } }
      ],
      optionalEvidence: [
        { key: "mortgage_offer_upload", type: "upload", label: "Add finance documents later if you have them" }
      ],
      assistant: [
        "This route organises readiness information only. CMP does not recommend a lender or product.",
        "No lender is contacted, no application is submitted and no approval is implied."
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
  const SERVICE_PILOT_KEYS = ["epc", "gas", "eicr", "inspection", "licensing", "mould", "possession_preparation", "eviction", "aml"];
  const SERVICE_REFERRAL_KEYS = ["mortgage", "insurance", "rent_guarantee"];
  const SERVICE_CERTIFICATE_KEYS = ["epc", "gas", "eicr"];
  const SERVICE_PROBLEM_KEYS = ["inspection", "licensing", "mould"];
  const SERVICE_EVIDENCE_KEYS = ["possession_preparation", "eviction", "aml"];

  const SERVICE_VISUALS = {
    epc: { icon: "house", tone: "blue" },
    eviction: { icon: "scale", tone: "purple" },
    gas: { icon: "flame", tone: "green" },
    mortgage: { icon: "landmark", tone: "cyan" },
    insurance: { icon: "shield", tone: "blue" },
    possession_preparation: { icon: "folder-open", tone: "purple" },
    rent_guarantee: { icon: "banknote", tone: "green" },
    mould: { icon: "droplets", tone: "amber" },
    licensing: { icon: "building-2", tone: "violet" },
    eicr: { icon: "zap", tone: "amber" },
    inspection: { icon: "clipboard-list", tone: "cyan" },
    aml: { icon: "id-card", tone: "blue" }
  };

  const PUBLIC_VISUALS = {
    v2Exterior: "assets/generated/public-v2-system/photos/uk-rental-exterior-detail.png",
    v2EvidenceDesk: "assets/generated/public-v2-system/photos/property-evidence-desk.png",
    v2HumanSupport: "assets/generated/public-v2-system/photos/human-support-review.png",
    v2ConditionInspection: "assets/generated/public-v2-system/photos/calm-condition-inspection.png",
    serviceGallery: "assets/generated/property-os-preview.svg",
    serviceJourney: "assets/generated/service-journey-preview.svg",
    addProperty: "assets/generated/add-property-flow.svg",
    propertyPortfolio: "assets/generated/property-portfolio.svg",
    evidenceStack: "assets/generated/evidence-stack.svg",
    supportTrust: "assets/generated/compliance-support.svg",
    homeHero: "assets/generated/homepage-hero-property-os.jpg",
    homeAurora: "assets/generated/homepage-aurora-dashboard.jpg",
    homeEvidence: "assets/generated/homepage-evidence-desk.jpg",
    homePortfolio: "assets/generated/homepage-property-portfolio.jpg",
    homeDashboard: "assets/cmp-dashboard-preview.png",
    homeHeroWide: "assets/generated/homepage-hero-wide.jpg",
    homeGuidedWide: "assets/generated/homepage-guided-wide.jpg"
  };

  const NEWS_ARTICLES = [
    { id: "epc-rules", category: "EPC", title: "EPC rules are changing — what landlords should prepare for", excerpt: "Use postcode, certificate dates, and the current rating to keep the next EPC decision practical.", published: "May 2026", readTime: "4 min read", demo: true },
    { id: "gas-renewal", category: "Gas Safety", title: "Gas Safety reminders: what to check before renewal", excerpt: "A calm reminder flow is often more useful than a scary dashboard warning.", published: "May 2026", readTime: "3 min read", demo: true },
    { id: "licensing-postcode", category: "Licensing", title: "Selective licensing: why postcode matters", excerpt: "Landlords usually want to know if licensing even applies before they chase paperwork.", published: "April 2026", readTime: "4 min read", demo: true },
    { id: "possession-prep", category: "Possession", title: "Possession preparation: documents landlords should organise early", excerpt: "Evidence packs work better when the timeline and communication trail are started before they feel urgent.", published: "April 2026", readTime: "5 min read", demo: true },
    { id: "mould-history", category: "Mould & Damp", title: "Mould and damp: why timelines and repair records matter", excerpt: "This is often less about one certificate and more about a clear inspection and repair history.", published: "March 2026", readTime: "4 min read", demo: true }
  ];

  const DEFAULT_FOCUS_OPTIONS = [
    { value: "service_only", label: "Just this service", helper: "Keep CMP focused on what you came for." },
    { value: "related_checks", label: "Start with this service, then related checks", helper: "Let CMP widen the journey gently if it helps." },
    { value: "full_compliance", label: "Check the whole property", helper: "Use this when you want the full property check." }
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
      isCreating: false,
      canonicalRecord: null,
      canonicalReview: null,
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

  function serviceVisual(key) {
    return SERVICE_VISUALS[key] || { icon: "circle", tone: "blue" };
  }

  function serviceIconMarkup(key, variant = "card") {
    const visual = serviceVisual(key);
    return `
      <span class="service-icon-badge tone-${escapeHtml(visual.tone)} service-icon-${escapeHtml(variant)}" aria-hidden="true">
        <i data-lucide="${escapeHtml(visual.icon)}"></i>
      </span>
    `;
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

  function canonicalBridge() {
    return window.CMPPublicPropertyBridge || null;
  }

  function portfolioDerivationApi() {
    return window.CMPPortfolioDerivation || null;
  }

  function portfolioActionsApi() {
    return window.CMPPortfolioActions || null;
  }

  function canonicalPropertyRecords() {
    const bridge = canonicalBridge();
    if (!bridge?.listCanonicalProperties) return [];
    const listed = bridge.listCanonicalProperties(localStorage, bridge.PUBLIC_GUEST_NAMESPACE_ID);
    return listed.ok ? listed.value : [];
  }

  function canonicalPropertyEntries() {
    const bridge = canonicalBridge();
    if (!bridge?.propertyCardFromRecord) return [];
    return canonicalPropertyRecords().map((record) => bridge.propertyCardFromRecord(record));
  }

  function myPropertyEntries() {
    const bridge = canonicalBridge();
    const canonicalCards = canonicalPropertyEntries();
    const legacyProperties = propertyEntries();
    if (!bridge?.dedupeLegacyPropertyCards || !bridge?.legacyPropertyCardFromSnapshot) {
      return canonicalCards.length ? canonicalCards : legacyProperties;
    }
    const legacyOnly = bridge
      .dedupeLegacyPropertyCards(canonicalCards, legacyProperties)
      .map((property) => bridge.legacyPropertyCardFromSnapshot(property));
    return [...canonicalCards, ...legacyOnly];
  }

  function myPropertiesPortfolioIntelligence() {
    const portfolioApi = portfolioDerivationApi();
    if (!portfolioApi?.derivePortfolioIntelligence) return null;
    const records = canonicalPropertyRecords();
    const result = portfolioApi.derivePortfolioIntelligence(records, {
      now: nowIso()
    });
    return result.ok ? result.value : null;
  }

  function renderMyPropertiesPortfolioSummary() {
    const intelligence = myPropertiesPortfolioIntelligence();
    if (!intelligence || intelligence.propertyCount < 2 || !intelligence.portfolioToolsVisible) {
      return "";
    }
    const top = intelligence.rankedProperties?.[0];
    const reportPreview = portfolioActionsApi()?.createPortfolioReportPreview?.(intelligence, "portfolio_summary", { now: nowIso() });
    return `
      <section class="page-section" data-my-properties-portfolio-summary>
        <div class="section-heading">
          <span class="eyebrow">Portfolio priority</span>
          <h2>Portfolio Sweep is ready</h2>
          <p>Based on current information across ${escapeHtml(String(intelligence.propertyCount))} saved properties. Guidance, not legal advice.</p>
        </div>
        <div class="property-card-grid">
          <article class="property-summary-card">
            <div class="property-summary-top">
              <span class="status-pill warning">Priority</span>
              <span class="quiet-pill">Portfolio Sweep</span>
            </div>
            <h3>${escapeHtml(top?.address || "Review portfolio priority")}</h3>
            <span class="property-summary-label">This property is first because...</span>
            <p class="property-summary-lead">${escapeHtml(top?.priorityExplanation || "CMP ranked the current saved properties by open risks and evidence gaps.")}</p>
            <div class="property-summary-meta">
              <span>${escapeHtml(String(intelligence.summary.evidenceGapCount || 0))} evidence gaps</span>
              <span>${escapeHtml(String(intelligence.summary.upcomingExpiryCount || 0))} expiry items</span>
              <span>${escapeHtml(String(intelligence.summary.lowConfidencePropertyCount || 0))} low confidence</span>
            </div>
            <a class="button primary" href="dashboard-labs.html?portfolio=guest">Open Portfolio Sweep</a>
          </article>
          <article class="property-summary-card">
            <div class="property-summary-top">
              <span class="status-pill info">Report preview</span>
              <span class="quiet-pill">Prepared for review</span>
            </div>
            <h3>${escapeHtml(reportPreview?.ok ? reportPreview.value.title : "Portfolio Summary")}</h3>
            <p class="property-summary-lead">Report preview uses saved property data, derived status, source labels and confidence status.</p>
            <p class="property-summary-lead">No supplier contacted. No payment taken.</p>
          </article>
        </div>
      </section>
    `;
  }

  function saveWorkspaceEntry(property, answers = {}) {
    // Transitional Stage 4 compatibility: My Properties still reads this legacy public workspace store.
    // Canonical Add Property writes to cmp_canonical_property_store_v1::guest:public first.
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

  function serviceDraftForJourney(journey = currentJourney()) {
    const answeredQuestions = journey?.answeredQuestions && typeof journey.answeredQuestions === "object"
      ? journey.answeredQuestions
      : {};
    if (Object.keys(answeredQuestions).length) return answeredQuestions;
    const directDraft = loadServiceDraft(journey?.entryService);
    if (Object.keys(directDraft).length) return directDraft;
    const sourceRoute = String(journey?.sourceRoute || "").split(/[?#]/)[0];
    const sourceServiceKey = Object.keys(SERVICE_CONFIG).find((key) => SERVICE_CONFIG[key].route === sourceRoute);
    return sourceServiceKey ? loadServiceDraft(sourceServiceKey) : {};
  }

  function serviceLabel(key) {
    const config = SERVICE_CONFIG[key];
    return config ? config.title : titleCase(key);
  }

  function serviceArchetype(key) {
    if (SERVICE_CERTIFICATE_KEYS.includes(key)) return "certificate";
    if (SERVICE_PROBLEM_KEYS.includes(key)) return "problem";
    if (SERVICE_EVIDENCE_KEYS.includes(key)) return "evidence";
    if (SERVICE_REFERRAL_KEYS.includes(key)) return "specialist";
    return "general";
  }

  function serviceArchetypeLabel(key) {
    const labels = {
      certificate: "Certificate-led",
      problem: "Condition-led",
      evidence: "Evidence-led",
      specialist: "Specialist readiness",
      general: "Service route"
    };
    return labels[serviceArchetype(key)] || labels.general;
  }

  function serviceArchetypeCopy(key) {
    const copy = {
      certificate: "Status, document date, expiry and evidence state stay visible before any request is prepared.",
      problem: "Report, evidence, timeline, repair or follow-up context are organised before the route widens.",
      evidence: "Documents, notices, identity checks and supporting records are arranged into a calm preparation pack.",
      specialist: "CMP prepares the property context for review. No lender, insurer or provider is contacted from this route.",
      general: "The route stays focused while keeping the wider property record available."
    };
    return copy[serviceArchetype(key)] || copy.general;
  }

  function serviceArchetypeSteps(key) {
    const steps = {
      certificate: ["Current status", "Expiry context", "Evidence review"],
      problem: ["Report received", "Evidence timeline", "Follow-up plan"],
      evidence: ["Scenario context", "Document trail", "Preparation pack"],
      specialist: ["Readiness context", "Support boundary", "No provider contact"],
      general: ["Focused route", "Useful answers", "Prepared request"]
    };
    return steps[serviceArchetype(key)] || steps.general;
  }

  function serviceCategoryIntro(archetype) {
    const copy = {
      certificate: {
        eyebrow: "Certificate-led services",
        title: "Start with status, proof and renewal context.",
        body: "EPC, Gas Safety and EICR routes should feel technical and calm: held proof, missing dates, expiry windows and evidence review before any request is prepared."
      },
      problem: {
        eyebrow: "Condition and problem-led services",
        title: "Organise the report before widening the route.",
        body: "Inspection, licensing, mould and damp routes need warmer seriousness: what happened, what is known, what evidence exists and what follow-up may be needed."
      },
      evidence: {
        eyebrow: "Possession and evidence preparation",
        title: "Build the document trail around the property.",
        body: "Possession and due-diligence routes stay factual and preparation-led, keeping notices, records, identity evidence and timelines separate from legal conclusions."
      },
      specialist: {
        eyebrow: "Specialist and referral support",
        title: "Prepare the context without implying approval or cover.",
        body: "Mortgage, insurance and rent guarantee routes organise readiness information only. No provider is contacted, no cover is verified and no approval is implied."
      }
    };
    return copy[archetype];
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

  function cmpShieldMarkSvg() {
    return `
      <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
        <path fill="#183a5a" d="M36 4 58.5 13.2v18.7c0 16.3-9.1 28.7-22.5 35.4C22.7 60.6 13.5 48.2 13.5 31.9V13.2Z"/>
        <path fill="#fff" d="M36 8.7 54.1 16v15.2c0 13.5-7.3 24.1-18.1 30-10.8-5.9-18.1-16.5-18.1-30V16Z"/>
        <path fill="#183a5a" d="M25.1 33.4v-9.3L36 15.8l10.9 8.3v9.3l-10.9 8.4z"/>
        <path fill="#183a5a" d="M29.8 34.6h12.4v11.7H29.8z"/>
        <path fill="#fff" d="M35.2 35.3h1.6V46h-1.6z"/>
        <path fill="#fff" d="M29.7 39.8h12.5v1.6H29.7z"/>
        <path fill="#58b63f" d="m26.8 42.4 6.6 6.1L54.9 25l5.1 4.8L33.6 58.1 21.8 47.2z"/>
        <path fill="#1291dc" d="m46.3 61.4 4.2-4.7L63 34.3c-.7 8.2-2.7 15.1-6.4 20.8-3 4.5-6.5 7.6-10.3 9.5z"/>
      </svg>
    `;
  }

  function baseHeader(active = "") {
    const homeVariant = active === "home";
    const links = homeVariant
      ? [
          { href: "#begin", label: "How CMP works", key: "begin" },
          { href: "services.html", label: "Services", key: "services" },
          { href: "#property-brain", label: "Property Brain", key: "property-brain" },
          { href: "#support", label: "Resources", key: "support" },
          { href: "contact.html", label: "Support", key: "contact" }
        ]
      : [
          { href: "index.html", label: "Home", key: "home" },
          { href: "services.html", label: "Services", key: "services" },
          { href: "add-property.html", label: "Add Property", key: "add-property" },
          { href: "my-properties.html", label: "My Properties", key: "my-properties" },
          { href: "news.html", label: "Updates", key: "news" },
          { href: "contact.html", label: "Contact", key: "contact" }
        ];
    return `
      <header class="site-nav public-v2-nav${homeVariant ? " homepage-nav" : ""}">
        <a class="brand" href="index.html" aria-label="ComplyMyProperty home">
          <span class="brand-mark brand-mark-shield">${cmpShieldMarkSvg()}</span>
          <span class="brand-copy">
            <strong>${homeVariant ? "Comply My Property" : "ComplyMyProperty"}</strong>
            <small>${homeVariant ? "Property intelligence for private landlords" : "Property intelligence for private landlords"}</small>
          </span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          ${links
            .map(
              (link) =>
                `<a href="${link.href}"${active === link.key ? ' aria-current="page"' : ""}>${link.label}</a>`
            )
            .join("")}
        </nav>
        <div class="nav-actions">
          ${homeVariant ? "" : `<a class="nav-link-secondary" href="add-property.html">Check property</a>`}
          <a class="nav-cta" href="${navigationPrimaryHref()}"><i data-lucide="layout-dashboard"></i>${DEMO_MODE ? "My Properties" : "Log in"}</a>
        </div>
      </header>
    `;
  }

  function baseFooter() {
    return `
      <footer class="site-footer">
        <div class="site-footer-section footer-brand-section">
          <div class="footer-brand-lockup">
            <span class="brand-mark brand-mark-shield footer-brand-mark">${cmpShieldMarkSvg()}</span>
            <div>
              <strong>COMPLYMYPROPERTY</strong>
              <p>The compliance operating system for UK landlords.</p>
            </div>
          </div>
          <small class="footer-note">The safest place for private landlords to organise property compliance with no subscription fee.</small>
          <div class="footer-trust-pills">
            <span>Request prepared</span>
            <span>No supplier contacted</span>
            <span>No payment taken</span>
          </div>
        </div>
        <div class="site-footer-section footer-services-section">
          <span>Services</span>
          <a href="epcs.html">EPC's</a>
          <a href="gas-safety.html">Gas Safety</a>
          <a href="eicr.html">EICR</a>
          <a href="evictions-possession.html">Evictions & Possession</a>
          <a href="selective-licensing.html">Selective Licensing</a>
          <a href="property-inspections.html">Property Inspections</a>
        </div>
        <div class="site-footer-section footer-company-section">
          <span>Company</span>
          <a href="index.html">Homepage</a>
          <a href="services.html">All services</a>
          <a href="my-properties.html">My Properties</a>
          <a href="news.html">Compliance updates</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="site-footer-section footer-support-section">
          <div class="footer-support-columns">
            <div class="footer-support-group">
              <span>Support</span>
              <a href="mailto:compliance@complymyproperty.com">compliance@complymyproperty.com</a>
              <a href="tel:01217708814">0121 770 8814</a>
            </div>
            <div class="footer-support-group footer-follow-group">
              <span class="footer-subheading">Follow</span>
              <div class="footer-social-links" aria-label="Social links preview">
                <a href="#footer" aria-disabled="true">LinkedIn</a>
                <a href="#footer" aria-disabled="true">Facebook</a>
                <a href="#footer" aria-disabled="true">Instagram</a>
              </div>
            </div>
          </div>
          <div class="footer-legal-notes">
            <small class="footer-note">Privacy, terms and data protection pages will be added in the final build.</small>
            <small class="footer-note">Social profile links can be connected before launch.</small>
            <small class="footer-note">Guidance, not legal advice. Based on current information. Evidence needs review before action.</small>
          </div>
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
    const disclaimer = SERVICE_REFERRAL_KEYS.includes(serviceKey)
      ? "CMP helps organise property information for review, but it is not financial or legal advice."
      : "CMP helps organise and highlight property compliance information, but it is not legal advice.";
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
          <p class="assistant-disclaimer">${escapeHtml(disclaimer)}</p>
        </aside>
      </div>
    `;
  }

  function serviceSelectorCopy(key) {
    const copy = {
      epc: "Check ratings, expiry, and what to do next.",
      eviction: "Organise evidence and possession-related records.",
      gas: "Start with gas appliances and certificate status.",
      mortgage: "Organise property finance context for review.",
      insurance: "Prepare policy details and property risk context.",
      possession_preparation: "Build a calmer evidence pack around the scenario.",
      rent_guarantee: "Prepare tenancy and rent records for support.",
      mould: "Record reports, repairs, and communication history.",
      licensing: "Check if licensing applies before chasing paperwork.",
      eicr: "Review the electrical report and inspection dates.",
      inspection: "Track condition, access, and inspection notes.",
      aml: "Organise ID and proof-of-address documents."
    };
    return copy[key] || SERVICE_CONFIG[key]?.description || "";
  }

  function renderServiceCards(keys = SERVICE_ORDER, variant = "full") {
    return keys.map((key) => {
      const service = SERVICE_CONFIG[key];
      const visual = serviceVisual(key);
      const archetype = serviceArchetype(key);
      if (variant === "selector") {
        return `
          <article class="service-selector-card tone-${escapeHtml(visual.tone)} service-archetype-${escapeHtml(archetype)}">
            <div class="service-card-head">
              ${serviceIconMarkup(key, "selector")}
              <div class="service-card-copy">
                <span class="service-grid-eyebrow">${escapeHtml(serviceArchetypeLabel(key))}</span>
                <h3>${escapeHtml(service.title)}</h3>
              </div>
            </div>
            ${serviceCardPreviewMarkup(key, "selector")}
            <div>
              <p>${escapeHtml(serviceSelectorCopy(key))}</p>
            </div>
            <a class="service-selector-link" href="${escapeHtml(service.route)}">Start</a>
          </article>
        `;
      }
      return `
        <article class="service-grid-card tone-${escapeHtml(visual.tone)} service-archetype-${escapeHtml(archetype)}">
          <div class="service-card-head">
            ${serviceIconMarkup(key, "grid")}
            <div class="service-card-copy">
              <span class="service-grid-eyebrow">${escapeHtml(serviceArchetypeLabel(key))}</span>
              <h3>${escapeHtml(service.title)}</h3>
            </div>
          </div>
          ${serviceCardPreviewMarkup(key)}
          <p>${escapeHtml(service.description)}</p>
          <small class="service-card-boundary">${escapeHtml(serviceArchetypeCopy(key))}</small>
          <a class="service-grid-link" href="${escapeHtml(service.route)}">${escapeHtml(service.cardCta)}</a>
        </article>
      `;
    }).join("");
  }

  function serviceCardPreviewMarkup(key, variant = "full") {
    const visual = serviceVisual(key);
    const compact = variant === "selector";
    const archetype = serviceArchetype(key);
    return `
      <div class="service-card-preview service-card-preview-${escapeHtml(variant)} service-preview-${escapeHtml(archetype)} tone-${escapeHtml(visual.tone)}" aria-hidden="true">
        <div class="service-card-preview-window">
          <span class="service-card-preview-chip">${escapeHtml(compact ? serviceArchetypeLabel(key) : SERVICE_CONFIG[key].title)}</span>
          <div class="service-card-preview-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="service-card-preview-orbit">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  function renderHomepageFlagshipVisual() {
    return `
      <div class="home-hero-image-stage">
        <img src="${PUBLIC_VISUALS.homeHeroWide}" alt="ComplyMyProperty property compliance operating system preview">
        <article class="home-flagship-float home-flagship-float-left">
          <span class="status-pill info">EPC imported</span>
          <strong>Property intelligence starts here.</strong>
        </article>
        <article class="home-flagship-float home-flagship-float-right">
          <span class="status-pill good">Property check</span>
          <strong>One calm next step at a time.</strong>
        </article>
      </div>
    `;
  }

  function renderServiceHeroStage(key) {
    const service = SERVICE_CONFIG[key];
    const visual = serviceVisual(key);
    const archetype = serviceArchetype(key);
    const steps = serviceArchetypeSteps(key);
    return `
      <div class="service-hero-stage service-hero-stage-${escapeHtml(archetype)} tone-${escapeHtml(visual.tone)}" aria-hidden="true">
        <div class="service-hero-stage-header">
          <span class="service-stage-badge">${escapeHtml(serviceArchetypeLabel(key))}</span>
          <strong>${escapeHtml(service.promise)}</strong>
        </div>
        <div class="service-hero-stage-grid">
          <div class="service-hero-stage-card service-hero-stage-card-main">
            <span class="service-stage-mini service-stage-mini-blue">${escapeHtml(steps[0])}</span>
            <div class="service-stage-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="service-hero-stage-card service-hero-stage-card-side">
            <span class="service-stage-mini service-stage-mini-purple">${escapeHtml(steps[1])}</span>
            <div class="service-stage-checks">
              <span>Just this service</span>
              <span>Related checks</span>
              <span>Full picture</span>
            </div>
          </div>
          <div class="service-hero-stage-card service-hero-stage-card-bottom">
            <span class="service-stage-mini service-stage-mini-green">${escapeHtml(steps[2])}</span>
            <div class="service-stage-docstack">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAddPropertyHeroStage() {
    return `
      <div class="add-property-stage-art" aria-hidden="true">
        <div class="add-property-stage-panel add-property-stage-search">
          <span class="service-stage-mini service-stage-mini-blue">Postcode</span>
          <strong>B37 7BA</strong>
          <div class="add-property-stage-search-row">
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="add-property-stage-panel add-property-stage-choice">
          <span class="service-stage-mini">Choose address</span>
          <div class="add-property-stage-cards">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="add-property-stage-panel add-property-stage-import">
          <span class="service-stage-mini service-stage-mini-green">Import preview</span>
          <div class="add-property-stage-bars">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
  }

  function renderMyPropertiesHeroStage() {
    return `
      <div class="portfolio-stage-art" aria-hidden="true">
        <article class="portfolio-stage-card portfolio-stage-card-main">
          <span class="service-stage-mini service-stage-mini-blue">Property file</span>
          <strong>66 Station Road</strong>
          <div class="portfolio-stage-meta">
            <span>EPC B</span>
            <span>2 checks confirmed</span>
          </div>
        </article>
        <article class="portfolio-stage-card portfolio-stage-card-side">
          <span class="service-stage-mini service-stage-mini-purple">Evidence</span>
          <div class="portfolio-stage-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </article>
        <article class="portfolio-stage-card portfolio-stage-card-bottom">
          <span class="service-stage-mini service-stage-mini-green">Next step</span>
          <div class="portfolio-stage-progress"></div>
        </article>
      </div>
    `;
  }

  function renderHomepage() {
    document.title = "ComplyMyProperty | Property intelligence for private landlords";
    app.innerHTML = `
      ${baseHeader("home")}
      <main class="public-main homepage-main cmp-v2-homepage">
        <section class="cmp-v2-hero" aria-labelledby="cmp-v2-hero-title">
          <div class="cmp-v2-hero-copy">
            <span class="cmp-v2-kicker">Check My Property</span>
            <h1 id="cmp-v2-hero-title">Property intelligence that turns unknowns into one clear next action.</h1>
            <p>ComplyMyProperty organises one property record, Smart Checks, Evidence Vault, Services, Monitoring and landlord answers into a calm Property Brain for private landlords.</p>
            <div class="cmp-v2-actions">
              <a class="button primary cmp-v2-button-primary" href="add-property.html"><i data-lucide="search-check"></i>Check My Property</a>
              <a class="button secondary cmp-v2-button-secondary" href="services.html"><i data-lucide="file-check-2"></i>Request service</a>
              ${qaDemoCta("button tertiary cmp-v2-button-quiet")}
            </div>
            <div class="cmp-v2-principles" aria-label="CMP principles">
              <span>Property-first</span>
              <span>Evidence-led</span>
              <span>Unknown remains unknown</span>
              <span>Guidance, not legal advice</span>
              <span>Not a legal compliance decision</span>
              <span>No supplier contacted</span>
              <span>No payment taken</span>
            </div>
          </div>
          <div class="cmp-v2-hero-proof" aria-label="Readable Property Brain product preview">
            <article class="cmp-v2-product-card">
              <div class="cmp-v2-product-bar">
                <span aria-hidden="true"></span>
                <strong>Property Brain</strong>
                <small>Example record</small>
              </div>
              <div class="cmp-v2-property-head">
                <div>
                  <span class="cmp-v2-kicker">Example property record</span>
                  <strong>14 King Street</strong>
                  <small>Birmingham B13 · private rental</small>
                </div>
                <div class="cmp-v2-review-badge">
                  <strong>Review</strong>
                  <span>next action ready</span>
                </div>
              </div>
              <div class="cmp-v2-proof-grid">
                <div><i class="cmp-v2-status cmp-v2-status-held"></i><strong>Identity found</strong><p>Address and property type are ready for landlord review.</p></div>
                <div><i class="cmp-v2-status cmp-v2-status-held"></i><strong>EPC found</strong><p>Rating and expiry are visible. Source still needs review.</p></div>
                <div><i class="cmp-v2-status cmp-v2-status-gap"></i><strong>Gas date missing</strong><p>Upload evidence or request support when ready.</p></div>
                <div><i class="cmp-v2-status cmp-v2-status-monitor"></i><strong>Monitoring on</strong><p>Renewals stay connected to the property record.</p></div>
              </div>
              <div class="cmp-v2-next-action">
                <span>Next action</span>
                <strong>Confirm the licensing position before preparing service requests.</strong>
              </div>
            </article>
            <figure class="cmp-v2-photo-panel">
              <img src="${PUBLIC_VISUALS.v2Exterior}" alt="Concept image of a UK rental property exterior detail">
              <figcaption>Illustrative property preview.</figcaption>
            </figure>
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-begin" id="begin" aria-labelledby="cmp-v2-begin-title">
          <div class="cmp-v2-section-head">
            <span class="cmp-v2-kicker">Three ways to begin</span>
            <h2 id="cmp-v2-begin-title">Start with the route that matches the landlord's question.</h2>
            <p>Use a full property check, a focused service route, or an existing My Properties workspace without changing the underlying CMP journeys.</p>
          </div>
          <div class="cmp-v2-begin-grid">
            <a class="cmp-v2-begin-card cmp-v2-begin-card-primary" href="add-property.html">
              <span>Full property check</span>
              <strong>Check a property</strong>
              <p>Add the address, run Smart Checks, review found data and build the Property Brain.</p>
              <em>Check My Property</em>
            </a>
            <a class="cmp-v2-begin-card" href="services.html">
              <span>Focused support</span>
              <strong>Request one service</strong>
              <p>Start with EPC, Gas Safety, EICR, licensing, possession preparation or a condition concern.</p>
              <em>Open services</em>
            </a>
            <a class="cmp-v2-begin-card" href="my-properties.html">
              <span>Existing workspace</span>
              <strong>Continue from My Properties</strong>
              <p>Return to Evidence Vault, renewals, property notes and support context without starting again.</p>
              <em>Open My Properties</em>
            </a>
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-brain" id="property-brain" aria-labelledby="cmp-v2-brain-title">
          <div class="cmp-v2-split">
            <div>
              <span class="cmp-v2-kicker">Property Brain</span>
              <h2 id="cmp-v2-brain-title">A readable property file built from what CMP knows and what still needs review.</h2>
              <p>The Property Brain separates found facts, landlord answers, missing evidence and human-review moments. It does not pretend all facts are known.</p>
              <div class="cmp-v2-symbol-row" aria-label="Property Brain stages">
                <span><b>I</b>Identity</span>
                <span><b>E</b>Evidence</span>
                <span><b>A</b>Action</span>
                <span><b>M</b>Monitor</span>
              </div>
            </div>
            <div class="cmp-v2-record">
              <div><strong>Address</strong><span>14 King Street, Birmingham B13</span><i class="cmp-v2-status cmp-v2-status-held"></i></div>
              <div><strong>Property type</strong><span>Terraced house, private rental</span><i class="cmp-v2-status cmp-v2-status-held"></i></div>
              <div><strong>EPC</strong><span>Rating C found. Expiry visible for review.</span><i class="cmp-v2-status cmp-v2-status-held"></i></div>
              <div><strong>Gas Safety</strong><span>Certificate date not yet supplied.</span><i class="cmp-v2-status cmp-v2-status-gap"></i></div>
              <div><strong>Licence position</strong><span>Needs review against local requirement.</span><i class="cmp-v2-status"></i></div>
              <div><strong>Boundary</strong><span>Guidance, not legal advice. No supplier contacted. No payment taken.</span><i class="cmp-v2-status cmp-v2-status-monitor"></i></div>
            </div>
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-loop" aria-labelledby="cmp-v2-loop-title">
          <div class="cmp-v2-section-head">
            <span class="cmp-v2-kicker">Evidence-to-action loop</span>
            <h2 id="cmp-v2-loop-title">A gap becomes a route, not a warning wall.</h2>
          </div>
          <div class="cmp-v2-loop-grid">
            <article><strong>Find</strong><p>CMP gathers property identity and available facts.</p></article>
            <article><strong>Separate</strong><p>Held evidence, landlord answers and unknowns stay distinct.</p></article>
            <article><strong>Ask</strong><p>Only useful questions appear before a route widens.</p></article>
            <article><strong>Act</strong><p>One practical next action is named without overstating certainty.</p></article>
            <article><strong>Monitor</strong><p>Renewals and repeat issues remain connected to the property.</p></article>
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-service-preview" aria-labelledby="cmp-v2-service-title">
          <div class="cmp-v2-section-split-head">
            <div>
              <span class="cmp-v2-kicker">Services</span>
              <h2 id="cmp-v2-service-title">Service routes keep their job identity.</h2>
              <p>Certificate-led routes, issue-led routes and preparation routes can stay focused while still connecting back to the same property record.</p>
            </div>
            <a class="button secondary cmp-v2-button-secondary" href="services.html"><i data-lucide="arrow-right"></i>View all services</a>
          </div>
          <div class="cmp-v2-service-grid">
            ${["epc", "gas", "eicr", "mould", "possession_preparation", "licensing"].map((key) => {
              const service = SERVICE_CONFIG[key];
              return `
                <a class="cmp-v2-service-card" href="${escapeHtml(service.route)}">
                  ${serviceIconMarkup(key, "selector")}
                  <span>${escapeHtml(service.eyebrow)}</span>
                  <strong>${escapeHtml(service.title)}</strong>
                  <small>${escapeHtml(serviceSelectorCopy(key))}</small>
                </a>
              `;
            }).join("")}
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-postcode" aria-labelledby="cmp-v2-postcode-title">
          <div>
            <span class="cmp-v2-kicker">Property-led from the first click</span>
            <h2 id="cmp-v2-postcode-title">Start with the address. CMP builds the picture around it.</h2>
            <p>Enter a postcode, choose the right property, and CMP will carry the journey into Add Property with Smart Checks and Review found data.</p>
          </div>
          <form class="postcode-card cmp-v2-postcode-card" id="homePostcodeForm">
            <label for="homePostcodeInput">Property postcode</label>
            <div class="postcode-row">
              <input id="homePostcodeInput" type="text" name="postcode" placeholder="B37 7BA" autocomplete="postal-code">
              <button class="button primary cmp-v2-button-primary" type="submit"><i data-lucide="search"></i>Find address</button>
            </div>
            <small>CMP keeps the journey moving with a property preview if live results are unavailable.</small>
          </form>
        </section>

        <section class="cmp-v2-section cmp-v2-support" id="support" aria-labelledby="cmp-v2-support-title">
          <figure class="cmp-v2-photo-panel">
            <img src="${PUBLIC_VISUALS.v2EvidenceDesk}" alt="Concept image of property evidence papers, tablet and files on a desk">
            <figcaption>Illustrative evidence preview.</figcaption>
          </figure>
          <div>
            <span class="cmp-v2-kicker">Human support and resources</span>
            <h2 id="cmp-v2-support-title">Support is a credible layer, not a panic button.</h2>
            <p>CMP organises the record and names the next action. Human support appears where evidence needs review or the landlord needs confidence before proceeding.</p>
            <div class="cmp-v2-resource-list">
              <article><strong>Understanding evidence states</strong><p>Held, missing, landlord supplied, review needed.</p></article>
              <article><strong>When to request a certificate</strong><p>How a focused route can start from the property record.</p></article>
              <article><strong>What support can and cannot do</strong><p>Guidance boundaries, legal-advice boundary and supplier-contact boundary.</p></article>
            </div>
          </div>
        </section>

        <section class="cmp-v2-section cmp-v2-human" aria-labelledby="cmp-v2-human-title">
          <div>
            <span class="cmp-v2-kicker">Established-company depth</span>
            <h2 id="cmp-v2-human-title">Calm software for real landlord work.</h2>
            <p>Use CMP to organise the property, understand the gaps, prepare service requests and keep monitoring visible over time.</p>
            <div class="cmp-v2-actions">
              <a class="button primary cmp-v2-button-primary" href="add-property.html"><i data-lucide="search-check"></i>Check My Property</a>
              <a class="button secondary cmp-v2-button-secondary" href="services.html"><i data-lucide="file-check-2"></i>Request service</a>
              ${qaDemoCta("button tertiary cmp-v2-button-quiet")}
            </div>
          </div>
          <figure class="cmp-v2-photo-panel cmp-v2-photo-panel-small">
            <img src="${PUBLIC_VISUALS.v2HumanSupport}" alt="Concept image of a property professional reviewing information at a desk">
            <figcaption>Illustrative support preview.</figcaption>
          </figure>
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
        <div class="news-card-meta">
          <span class="service-grid-eyebrow">${escapeHtml(article.category)}</span>
          <span class="quiet-pill">${escapeHtml(article.readTime || "Preview update")}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt)}</p>
        <div class="news-card-footer">
          <span class="news-card-note">${escapeHtml(article.published || "Editorial preview")} · Plain-English landlord update</span>
          <button class="mini-button" type="button" data-open-article="${escapeHtml(article.id)}">Read article</button>
        </div>
      </article>
    `;
  }

  function renderServicesOverview() {
    document.title = "Services | ComplyMyProperty";
    const serviceGroups = [
      { archetype: "certificate", keys: SERVICE_CERTIFICATE_KEYS },
      { archetype: "problem", keys: SERVICE_PROBLEM_KEYS },
      { archetype: "evidence", keys: SERVICE_EVIDENCE_KEYS },
      { archetype: "specialist", keys: SERVICE_REFERRAL_KEYS }
    ];
    app.innerHTML = `
      ${baseHeader("services")}
      <main class="public-main service-pilot-main service-index-v2">
        <section class="page-hero public-page-hero service-index-hero">
          <div>
            <span class="eyebrow">CMP Request Centre</span>
            <h1>Choose the service route without losing the property picture.</h1>
            <p>Request one focused service, widen into related checks, or start a full property check. CMP keeps the route clear before the property record is created.</p>
            <div class="hero-actions">
              <a class="button primary" href="#serviceDirectory">Choose a service</a>
              <a class="button secondary" href="add-property.html">Full property check</a>
              <a class="button tertiary" href="my-properties.html">Continue from My Properties</a>
            </div>
            <div class="service-safe-strip" aria-label="Service request safety">
              <span>Request prepared</span>
              <span>No supplier contacted</span>
              <span>No payment taken</span>
            </div>
          </div>
          <div class="page-hero-visual page-hero-visual-service">
            <figure class="service-index-photo">
              <img src="${PUBLIC_VISUALS.v2Exterior}" alt="Concept image of a UK rental property exterior detail">
              <figcaption>Illustrative property preview.</figcaption>
            </figure>
            ${renderServiceHeroStage("gas")}
          </div>
        </section>

        <section class="page-section service-decision-section">
          <div class="section-heading">
            <span class="eyebrow">Three entry routes</span>
            <h2>Start from the landlord's actual job.</h2>
            <p>Services stay focused, the full-property path remains prominent, and saved properties have a clear route back into the workspace.</p>
          </div>
          <div class="service-request-centre-grid">
            <article class="service-request-card tone-blue service-request-card-primary">
              <span class="service-grid-eyebrow">Direct route</span>
              <h3>Request one service</h3>
              <p>Use this if the landlord already knows the certificate, condition issue, evidence pack or readiness route they need.</p>
              <a class="service-selector-link" href="#serviceDirectory">Choose service</a>
            </article>
            <article class="service-request-card tone-green">
              <span class="service-grid-eyebrow">Wider check</span>
              <h3>Full property check</h3>
              <p>Start with the property instead and let Smart Checks build the wider Property Brain.</p>
              <a class="service-selector-link" href="add-property.html">Check My Property</a>
            </article>
            <article class="service-request-card tone-purple">
              <span class="service-grid-eyebrow">Already started</span>
              <h3>Continue from My Properties</h3>
              <p>Open a saved property workspace, review the next best action, or pick up a prepared service request.</p>
              <a class="service-selector-link" href="my-properties.html">Open My Properties</a>
            </article>
          </div>
        </section>

        <section class="page-section service-pilot-showcase service-directory-v2" id="serviceDirectory">
          <div class="section-heading">
            <span class="eyebrow">Curated service discovery</span>
            <h2>Routes grouped by the kind of landlord work they support.</h2>
            <p>Each group has a distinct visual rhythm and boundary, but every card still leads to the existing service route and the same Add Property handoff.</p>
          </div>
          ${serviceGroups.map((group) => {
            const intro = serviceCategoryIntro(group.archetype);
            return `
              <section class="service-category-block service-category-${escapeHtml(group.archetype)}">
                <div class="service-category-copy">
                  <span class="service-grid-eyebrow">${escapeHtml(intro.eyebrow)}</span>
                  <h3>${escapeHtml(intro.title)}</h3>
                  <p>${escapeHtml(intro.body)}</p>
                </div>
                <div class="service-grid public-service-grid public-service-grid-showcase service-category-grid">
                  ${renderServiceCards(group.keys)}
                </div>
              </section>
            `;
          }).join("")}
        </section>

        <section class="page-section service-index-bridge-band">
          <div>
            <span class="eyebrow">Property bridge</span>
            <h2>Not sure which route fits? Start with the address.</h2>
            <p>A full property check runs Smart Checks first, then shows Review found data before the Property Brain opens.</p>
          </div>
          <div class="hero-actions">
            <a class="button primary" href="add-property.html">Check My Property</a>
            <a class="button secondary" href="my-properties.html">Open My Properties</a>
            <a class="button tertiary" href="#serviceDirectory">Back to services</a>
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

  function renderQuestionField(question, draft, options = {}) {
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
            <span>${draft[question.key] ? (options.pilotService ? "Change proof" : "Change document") : (options.pilotService ? "Add proof later" : "Choose document")}</span>
            <small>${draft[question.key] ? `Proof selected for review: ${draft[question.key]}` : (options.pilotService ? "Optional. Add proof later; nothing is submitted from this screen." : "Optional. In the final version, this would be stored securely.")}</small>
          </label>
        </div>
      `;
    }
    return "";
  }

  function renderOptionalEvidenceBlock(service, draft, stepNumber, options = {}) {
    const documentQuestions = optionalEvidenceQuestionsForService(service);
    if (!documentQuestions.length) return "";
    return `
      <section class="question-panel optional-evidence-panel${options.pilotService ? " service-proof-panel" : ""}">
        <div class="question-panel-heading">
          <span class="section-kicker">Step ${stepNumber}</span>
          <h3>${options.pilotService ? "Optional proof and dates" : "Optional documents and dates"}</h3>
        </div>
        <p class="question-panel-copy">${options.pilotService ? "Have proof handy? Add the name now, or skip and come back later. No supplier is contacted and no payment is taken." : "Have this document handy? You can add it now, or skip and come back later."}</p>
        <div class="question-stack-inner">
          ${documentQuestions.map((question) => renderQuestionField(question, draft, options)).join("")}
        </div>
      </section>
    `;
  }

  function renderServiceSafetyBand(options = {}) {
    const guidance = options.referral ? "Guidance, not financial or legal advice" : "Guidance, not legal advice";
    return `
      <div class="service-safe-strip service-safe-strip-panel" aria-label="Service request safety">
        <span>Request prepared</span>
        <span>Evidence can be added later</span>
        <span>No supplier contacted</span>
        <span>No payment taken</span>
        <span>${escapeHtml(guidance)}</span>
      </div>
    `;
  }

  function renderServiceRelatedChecks(serviceKey) {
    const relatedMap = {
      epc: ["gas", "eicr", "inspection"],
      gas: ["epc", "eicr", "inspection"],
      eicr: ["gas", "epc", "licensing"],
      inspection: ["mould", "gas", "eicr"],
      licensing: ["inspection", "gas", "eicr"],
      mould: ["inspection", "gas", "licensing"],
      possession_preparation: ["eviction", "inspection", "licensing"],
      eviction: ["possession_preparation", "inspection", "licensing"],
      aml: ["inspection", "licensing", "epc"],
      mortgage: ["inspection", "licensing", "aml"],
      insurance: ["inspection", "mould", "gas"],
      rent_guarantee: ["inspection", "eviction", "aml"],
    };
    const related = relatedMap[serviceKey] || ["epc", "gas", "eicr"];
    return `
      <section class="service-related-panel">
        <div>
          <span class="service-grid-eyebrow">Related checks</span>
          <h3>Need more than this one service?</h3>
          <p>Keep this route focused, add a related check, or move into the full property review when you are ready.</p>
        </div>
        <div class="service-related-links">
          ${related.map((key) => {
            const relatedService = SERVICE_CONFIG[key];
            return `<a href="${escapeHtml(relatedService.route)}">${serviceIconMarkup(key, "rail")}<span>${escapeHtml(relatedService.title)}</span></a>`;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderServiceArchetypePanel(key) {
    const archetype = serviceArchetype(key);
    const steps = serviceArchetypeSteps(key);
    const image = archetype === "problem" ? PUBLIC_VISUALS.v2ConditionInspection : archetype === "specialist" ? PUBLIC_VISUALS.v2HumanSupport : PUBLIC_VISUALS.v2EvidenceDesk;
    const imageAlt = archetype === "problem"
      ? "Concept image of a calm property condition inspection scene"
      : archetype === "specialist"
        ? "Concept image of a property professional reviewing information at a desk"
        : "Concept image of property evidence papers, tablet and files on a desk";
    return `
      <section class="service-archetype-panel service-archetype-panel-${escapeHtml(archetype)}">
        <div>
          <span class="service-grid-eyebrow">${escapeHtml(serviceArchetypeLabel(key))}</span>
          <h2>${escapeHtml(archetype === "certificate" ? "Treat the document as evidence first." : archetype === "problem" ? "Turn the report into a practical timeline." : archetype === "evidence" ? "Prepare the record before deciding the next step." : "Prepare context without implying approval.")}</h2>
          <p>${escapeHtml(serviceArchetypeCopy(key))}</p>
          <div class="service-archetype-steps" aria-label="${escapeHtml(serviceArchetypeLabel(key))} route shape">
            ${steps.map((step) => `<span>${escapeHtml(step)}</span>`).join("")}
          </div>
        </div>
        <figure class="service-archetype-photo">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}">
          <figcaption>Illustrative service preview.</figcaption>
        </figure>
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
    const isReferralService = SERVICE_REFERRAL_KEYS.includes(serviceKey);
    const isPilotService = SERVICE_PILOT_KEYS.includes(serviceKey) || isReferralService;
    app.innerHTML = `
      ${baseHeader("services")}
      <main class="public-main${isPilotService ? " service-pilot-main" : ""} service-detail-main service-archetype-${escapeHtml(serviceArchetype(serviceKey))}">
        <section class="page-hero public-page-hero${isPilotService ? " service-detail-hero" : ""} service-detail-hero-${escapeHtml(serviceArchetype(serviceKey))}">
          <div>
            <span class="eyebrow service-hero-eyebrow">${serviceIconMarkup(serviceKey, "hero")}${escapeHtml(service.eyebrow)}</span>
            <h1>${escapeHtml(service.heroTitle)}</h1>
            <p>${escapeHtml(service.heroCopy)}</p>
            <div class="hero-actions">
              <a class="button primary" href="#journeyStart">${isPilotService ? "Start this service route" : "Start this journey"}</a>
              <button class="button secondary" type="button" data-skip-service>${isPilotService ? "Widen to full property check" : "Skip to Add Property"}</button>
              ${isPilotService ? `<a class="button tertiary" href="services.html">See all services</a>` : ""}
            </div>
            <div class="hero-metrics">
              <span><strong>${progress.answered}/${progress.total}</strong> answers started</span>
              <span><strong>${escapeHtml(focusLabel(state.serviceDraft.focusMode || "service_only"))}</strong> selected</span>
              <span><strong>${isPilotService ? "Prepared" : "Optional"}</strong> ${isPilotService ? "for review" : "documents can be added later"}</span>
            </div>
            ${isPilotService ? renderServiceSafetyBand({ referral: isReferralService }) : ""}
          </div>
          <div class="page-hero-visual page-hero-visual-service">
            ${renderServiceHeroStage(serviceKey)}
          </div>
        </section>

        ${isPilotService ? renderServiceArchetypePanel(serviceKey) : ""}
        ${isPilotService ? renderServiceRelatedChecks(serviceKey) : ""}

        <section class="page-section service-journey-shell${isPilotService ? " service-pilot-journey-shell" : ""}" id="journeyStart">
          <div class="section-heading">
            <span class="eyebrow">${escapeHtml(service.title)} journey</span>
            <h2>${isPilotService ? "Choose the service route that fits." : "Choose how focused you want us to be."}</h2>
            <p>${isPilotService ? "Just this service is a valid path. Related checks and the full property check stay optional until you choose them." : "You stay in control. Just this service is a valid path. Related checks and a wider property review are optional."}</p>
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
                <h3>${isPilotService ? `${escapeHtml(service.title)} questions` : "Service-specific questions"}</h3>
              </div>
              <div class="question-stack-inner">
                ${journeyQuestions.map((question) => renderQuestionField(question, state.serviceDraft, { pilotService: isPilotService })).join("")}
              </div>
            </section>

            ${service.calculator ? renderMortgageCalculator(state.serviceDraft) : ""}
            ${renderOptionalEvidenceBlock(service, state.serviceDraft, service.calculator ? 6 : 5, { pilotService: isPilotService })}

            <section class="helper-card">
              <span class="service-grid-eyebrow">${isPilotService ? "Safe request preparation" : "Reassurance"}</span>
              <h3>${isPilotService ? "A request can be prepared without contacting anyone." : "Not sure? You can continue and come back later."}</h3>
              <p>${isPilotService ? "CMP carries these answers into Add Property and can prepare the request context, but no supplier is contacted and no payment is taken." : "You stay in control of how much you want to check. CMP will carry these answers into Add Property and keep the next step obvious."}</p>
            </section>

            <div class="service-journey-actions">
              <button class="button primary" type="button" data-continue-service>${isPilotService ? "Prepare request and add property" : "Continue to Add Property"}</button>
              <button class="button secondary" type="button" data-service-properties>Go to My Properties instead</button>
              ${isPilotService ? `<a class="button tertiary" href="services.html">Back to services</a>` : ""}
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
          <h3>Illustrative finance estimate</h3>
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
          <article><span>Illustrative monthly payment</span><strong>£${estimate.monthlyPayment.toFixed(0)}</strong></article>
          <article><span>Loan to value</span><strong>${estimate.ltv.toFixed(1)}%</strong></article>
          <article><span>Rent coverage</span><strong>${estimate.rentCoverage ? `${estimate.rentCoverage.toFixed(0)}%` : "Add rent"}</strong></article>
        </div>
        <small>Illustration only. No lender is contacted and no application is submitted.</small>
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

  function buildPropertyFromSelection(selection, canonicalRecord = null) {
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
      canonicalPropertyId: canonicalRecord?.id || null,
      identity: {
        propertyId,
        uprn: selection.uprn || "",
        addressKey: normalizedAddressKey(selection.address, selection.postcode),
        certificateRef: selection.epc?.certificate || "",
        canonicalPropertyId: canonicalRecord?.id || null,
        canonicalNamespace: canonicalRecord?.namespace || null
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
    if (property.sourceKind === "canonical" || property.canonicalPropertyId) {
      const propertyId = property.canonicalPropertyId || property.id;
      const record = property.record || {};
      const origin = record.entryContext || property.originJourney || {};
      window.CMPJourney?.update?.({
        selectedPropertyId: propertyId,
        entryService: origin.entryService || property.entryService || currentJourney().entryService,
        focusMode: origin.focusMode || currentJourney().focusMode,
        isTenanted: origin.isTenanted || currentJourney().isTenanted,
        answeredQuestions: currentJourney().answeredQuestions || {}
      });
      window.location.href = `dashboard-labs.html?propertyId=${encodeURIComponent(propertyId)}`;
      return;
    }

    const origin = property.originJourney || {};
    window.CMPJourney?.update?.({
      selectedPropertyId: property.id,
      entryService: origin.entryService || currentJourney().entryService,
      focusMode: origin.focusMode || currentJourney().focusMode,
      isTenanted: property.tenancy?.currentlyTenanted === true ? "yes" : property.tenancy?.currentlyTenanted === false ? "no" : currentJourney().isTenanted,
      answeredQuestions: currentJourney().answeredQuestions || {}
    });
    flash("This older property record needs to be reconnected before opening the workspace.", "info");
    window.location.href = `add-property.html${property.postcode ? `?postcode=${encodeURIComponent(property.postcode)}` : ""}`;
  }

  async function renderAddPropertyPage() {
    const context = currentJourney();
    const service = SERVICE_CONFIG[context.entryService] || SERVICE_CONFIG.epc;
    document.title = "Add Property | ComplyMyProperty";
    app.innerHTML = `
      ${baseHeader("add-property")}
      <main class="public-main bridge-page add-property-bridge-page public-v2-bridge">
        <div class="cmp-public-container add-property-journey-shell">
          <section class="page-hero public-page-hero bridge-hero add-property-bridge-hero">
            <div class="add-property-hero-copy">
              <span class="eyebrow">Add property</span>
              <h1>Start your property check from the address.</h1>
              <p>Enter a postcode, choose the right property and let CMP prepare Smart Checks before you move into the Property Brain.</p>
              <div class="hero-metrics">
                <span><strong>Path</strong> ${escapeHtml(service.title)}</span>
                <span><strong>Focus</strong> ${escapeHtml(focusLabel(context.focusMode || "service_only"))}</span>
                <span><strong>Tenancy</strong> ${escapeHtml(tenancyLabel(context.isTenanted || "unsure"))}</span>
              </div>
              <form class="postcode-card bridge-postcode-card" id="addPropertySearchForm">
                <label for="addPropertyPostcode">Property postcode</label>
                <div class="postcode-row">
                  <input id="addPropertyPostcode" type="text" value="${escapeHtml(state.addProperty.postcode)}" placeholder="B37 7BA" autocomplete="postal-code">
                  <button class="button primary" type="submit" ${state.addProperty.isSearching ? "disabled" : ""}>${state.addProperty.isSearching ? "Checking..." : "Find address"}</button>
                </div>
                <small>Smart Checks prepare an initial view from the address and available property information. Review found data before continuing.</small>
              </form>
            </div>
            <div class="page-hero-visual page-hero-visual-add-property">
              ${renderAddPropertyHeroStage()}
            </div>
          </section>

          ${renderFlashBanner()}

          <section class="page-section add-property-workflow-section">
            <div class="add-property-stepper add-property-progress" aria-label="Add property steps">
              ${renderAddPropertyStepper()}
            </div>

            <div class="question-stack add-property-flow">
              <section class="question-panel" data-add-property-step="find">
                <div class="question-panel-heading">
                  <span class="section-kicker">Find property</span>
                  <h3 id="addPropertyFindTitle" tabindex="-1">Find the property</h3>
                </div>
                <p class="question-panel-copy">Use the postcode search above. CMP will try to find address matches and EPC information automatically.</p>
                <div class="helper-card compact bridge-helper">
                  <h3>${escapeHtml(state.addProperty.postcode ? "Postcode ready" : "Enter a postcode to begin")}</h3>
                  <p>${escapeHtml(state.addProperty.postcode ? "Choose the correct property below when the address options appear." : "The first step creates the property file that Smart Checks and Review found data can build on.")}</p>
                </div>
              </section>

              <section class="question-panel" data-add-property-step="address">
                <div class="question-panel-heading">
                  <span class="section-kicker">Current subtask</span>
                  <h3 id="addPropertyAddressTitle" tabindex="-1">Select address</h3>
                </div>
                <p class="question-panel-copy">Choose the right property card below. CMP will carry the selected address into your property record.</p>
                ${renderAddressResults()}
              </section>

              <section class="question-panel" data-add-property-step="checks">
                <div class="question-panel-heading">
                  <span class="section-kicker">Smart Checks</span>
                  <h3 id="addPropertyChecksTitle" tabindex="-1">Run Smart Checks</h3>
                </div>
                <p class="question-panel-copy">Once you confirm the address, CMP will prepare the property file, run Smart Checks, and show what needs review next.</p>
                <div class="helper-card compact">
                  <h3>${escapeHtml(state.addProperty.stage || "Choose the address, then CMP will do the rest.")}</h3>
                  <p>${escapeHtml(state.addProperty.message || "Once you pick the right property, CMP will prepare Smart Checks and show Review found data from the same property file.")}</p>
                </div>
              </section>

              ${renderCanonicalReview()}
            </div>
          </section>
        </div>
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
        if (state.addProperty.isCreating) return;
        state.addProperty.selectedId = match.id;
        state.addProperty.isCreating = true;
        state.addProperty.stage = "Checking EPC records...";
        state.addProperty.message = "Checking EPC records...";
        renderAddPropertyPage();
        queueAddPropertyProgression("[data-add-property-step='checks']", "#addPropertyChecksTitle");
        await wait(350);
        state.addProperty.stage = "Importing property details...";
        state.addProperty.message = "Importing property details...";
        renderAddPropertyPage();
        await wait(450);
        state.addProperty.stage = "Preparing Review found data...";
        state.addProperty.message = "Address matched. Preparing the property file and Smart Checks...";
        renderAddPropertyPage();
        await wait(550);

        const bridge = window.CMPPublicPropertyBridge;
        if (!bridge?.createOrUpdatePropertyFromSelection) {
          state.addProperty.isCreating = false;
          state.addProperty.stage = "Smart Checks unavailable";
          state.addProperty.message = "The property setup tool did not load. Please refresh and try again.";
          renderAddPropertyPage();
          return;
        }
        const canonicalResult = bridge.createOrUpdatePropertyFromSelection(match, {
          storage: localStorage,
          journeyContext: currentJourney(),
          serviceDraft: serviceDraftForJourney()
        });
        if (!canonicalResult.ok) {
          state.addProperty.isCreating = false;
          state.addProperty.stage = "Property needs checking";
          state.addProperty.message = canonicalResult.errors.join(" ");
          renderAddPropertyPage();
          return;
        }
        const canonicalRecord = canonicalResult.value.property;
        const canonicalReview = bridge.prepareReviewFoundData(canonicalRecord);
        window.CMPJourney?.update?.({
          selectedPropertyId: canonicalRecord.id
        });
        state.addProperty.canonicalRecord = canonicalRecord;
        state.addProperty.canonicalReview = canonicalReview;
        state.addProperty.isCreating = false;
        state.addProperty.stage = "Review found data";
        state.addProperty.message = "Smart Checks are ready. Review what CMP found before continuing.";
        flash("Review found data is ready.", "success");
        renderAddPropertyPage();
        queueAddPropertyProgression("[data-canonical-review]", "#addPropertyReviewTitle");
      });
    });

    if (state.addProperty.postcode && !state.addProperty.matches.length && !state.addProperty.isSearching && !state.addProperty.prefillHandled) {
      state.addProperty.prefillHandled = true;
      void searchAddresses(state.addProperty.postcode, { quiet: true });
    }
  }

  function renderAddPropertyStepper() {
    const selected = Boolean(state.addProperty.selectedId);
    const reviewed = Boolean(state.addProperty.canonicalReview);
    const steps = [
      {
        title: "Find property",
        detail: "Enter postcode and choose the correct address.",
        state: selected || reviewed ? "done" : "current"
      },
      {
        title: "Smart Checks",
        detail: "CMP prepares source and confidence labels.",
        state: reviewed ? "done" : selected ? "current" : "upcoming"
      },
      {
        title: "Review found data",
        detail: "Confirm what is known, missing or needs review.",
        state: reviewed ? "current" : "upcoming"
      },
      {
        title: "Answer property questions",
        detail: "Answer only what CMP still needs from you.",
        state: "upcoming"
      },
      {
        title: "Open Property Brain",
        detail: "Continue to the selected property workspace.",
        state: "upcoming"
      }
    ];

    return steps.map((step, index) => `
      <article class="step-pill step-pill-${escapeHtml(step.state)}" aria-current="${step.state === "current" ? "step" : "false"}">
        <span class="step-pill-index">${index + 1}</span>
        <div>
          <strong>${escapeHtml(step.title)}</strong>
          <small>${escapeHtml(step.detail)}</small>
        </div>
      </article>
    `).join("");
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
              <div class="address-card-top">
                <span class="quiet-pill">${escapeHtml(match.postcode)}</span>
                <span class="status-pill ${escapeHtml(match.epc?.rating ? "info" : "neutral")}">${escapeHtml(match.epc?.rating ? `EPC ${match.epc.rating}` : "Preview import")}</span>
              </div>
              <strong>${escapeHtml(match.address)}</strong>
              <p>${escapeHtml(match.postcode)} · ${escapeHtml(match.type || "Property type to confirm")}</p>
              <small>${escapeHtml(match.epc?.source === "Example EPC preview" ? "Example EPC data ready" : match.epc?.rating ? "EPC match found" : "EPC needs checking")}</small>
              <div class="address-card-preview" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <button class="button primary" type="button" data-use-address="${escapeHtml(match.id)}" ${state.addProperty.isCreating ? "disabled" : ""}>${state.addProperty.selectedId === match.id && state.addProperty.isCreating ? "Preparing..." : state.addProperty.selectedId === match.id ? "Selected" : "Use this property"}</button>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderReviewItems(items) {
    return `
      <div class="add-property-review-list">
        ${items.map((item) => `
          <article class="add-property-review-item" data-review-fact-key="${escapeHtml(item.label)}">
            ${item.status === "missing" || item.status === "unknown" ? `<span class="status-pill warning">Missing / unknown</span>` : ""}
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.value)}</p>
            <div class="property-summary-meta">
              <span>Confidence: ${escapeHtml(item.confidence)}</span>
              <span>Source: ${escapeHtml(landlordFacingCopy(item.sourceLabel))}</span>
            </div>
            ${item.reason ? `<small>${escapeHtml(landlordFacingCopy(item.reason))}</small>` : ""}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderCanonicalReview() {
    const review = state.addProperty.canonicalReview;
    if (!review) return "";
    const landlordQuestionItems = reviewQuestionItems(review);
    const landlordQuestionIds = new Set(landlordQuestionItems.map((item) => item.id));
    const foundItems = review.foundAutomatically.filter((item) => !landlordQuestionIds.has(item.id));
    const handoff = reviewHandoffState(review);
    const reviewGroups = [
      {
        title: "What CMP found",
        body: "Address, local context and property information prepared from the selected property.",
        items: foundItems
      },
      {
        title: "What still needs your answer",
        body: "Only remaining landlord-owned property questions stay here before the Property Brain is completed.",
        items: landlordQuestionItems
      }
    ].filter((group) => group.items.length);
    return `
      <section class="question-panel" data-canonical-review data-add-property-step="review" data-property-id="${escapeHtml(review.propertyId)}">
        <div class="question-panel-heading">
          <span class="section-kicker">Review found data</span>
          <h3 id="addPropertyReviewTitle" tabindex="-1">Review found data</h3>
        </div>
        <p class="question-panel-copy">CMP has prepared a property file for ${escapeHtml(review.address)}.</p>
        <p class="review-capability-disclosure">Example and available property information is shown for review. No live official lookup or legal compliance decision has been made.</p>

        ${reviewGroups.map((group) => `
          <div class="helper-card compact review-found-card">
            <h3>${escapeHtml(group.title)}</h3>
            <p>${escapeHtml(group.body)}</p>
            ${renderReviewItems(group.items)}
          </div>
        `).join("")}

        <div class="review-handoff-card">
          <div>
            <span class="section-kicker">Next step</span>
            <h3>${escapeHtml(handoff.heading)}</h3>
            <p>${escapeHtml(handoff.copy)}</p>
          </div>
          <div class="service-journey-actions">
            <a class="button primary" data-canonical-handoff href="${escapeHtml(handoff.href)}">${escapeHtml(handoff.primaryLabel)}</a>
            <a class="button secondary" href="my-properties.html">Save and return to My Properties</a>
          </div>
        </div>
      </section>
    `;
  }

  function reviewQuestionItems(review) {
    const byId = new Map();
    [
      ...(review.missingUnknown || []),
      ...(review.needsConfirmation || []),
      ...(review.foundAutomatically || []).filter((item) => item.label === "Heating source")
    ].forEach((item) => {
      if (item?.id) byId.set(item.id, item);
    });
    return [...byId.values()];
  }

  function reviewHandoffState(review) {
    const hasPropertyQuestions = reviewQuestionItems(review).length > 0;
    return {
      heading: "What happens next",
      copy: hasPropertyQuestions
        ? "Answer the remaining property questions so CMP can complete the Property Brain and recommend one clear next action."
        : "Open the Property Brain to review the property position and one clear next action.",
      primaryLabel: hasPropertyQuestions ? "Answer property questions" : "Open Property Brain",
      href: review.handoffHref
    };
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function landlordFacingCopy(value) {
    const raw = String(value || "");
    const mapped = {
      "Simulated Smart Check": "Smart Check",
      "Simulated EPC preview": "Example EPC information",
      "Simulated property preview": "Example property information",
      "Simulated EPC data prepared for landlord review.": "Example EPC information is shown for landlord review. No live official lookup was performed.",
      "Prepared for review from prototype data. No live supplier or official lookup was performed.": "Example information is shown for review. No live supplier or official lookup was performed.",
      "Local authority unavailable in simulated preview": "Local authority is unavailable in the example information.",
      "Property type unavailable in simulated preview": "Property type is unavailable in the example information.",
      "Heating source unavailable in simulated preview": "Heating source is unavailable in the example information.",
      "No EPC found in simulated preview": "No EPC found in the example information."
    }[raw];
    return mapped || raw;
  }

  function capabilityStatusCopy(value) {
    const labels = {
      simulated: "Example information",
      live: "Live source"
    };
    const raw = String(value || "");
    return labels[raw] || raw || "Needs review";
  }

  function queueAddPropertyProgression(sectionSelector, focusSelector) {
    window.requestAnimationFrame(() => progressToAddPropertySection(sectionSelector, focusSelector));
  }

  function progressToAddPropertySection(sectionSelector, focusSelector) {
    const section = app.querySelector(sectionSelector);
    if (!section) return;
    const heading = focusSelector ? app.querySelector(focusSelector) : section.querySelector("h2, h3");
    const header = document.querySelector(".public-v2-nav, .site-nav, header");
    const stickyOffset = Math.ceil((header?.getBoundingClientRect().height || 0) + 18);
    const targetTop = Math.max(0, section.getBoundingClientRect().top + window.scrollY - stickyOffset);
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
    window.setTimeout(() => {
      if (heading && typeof heading.focus === "function") {
        heading.focus({ preventScroll: true });
      }
    }, prefersReducedMotion ? 0 : 220);
  }

  async function searchAddresses(postcode, options = {}) {
    state.addProperty.postcode = postcode;
    if (!normalizePostcode(postcode)) {
      state.addProperty.isSearching = false;
      state.addProperty.message = "Enter a postcode to see the available addresses.";
      state.addProperty.stage = "Enter postcode";
      renderAddPropertyPage();
      queueAddPropertyProgression("[data-add-property-step='find']", "#addPropertyPostcode");
      return;
    }
    state.addProperty.isSearching = true;
    state.addProperty.message = "Checking postcode...";
    state.addProperty.stage = "Looking for the right address";
    state.addProperty.selectedId = "";
    state.addProperty.canonicalRecord = null;
    state.addProperty.canonicalReview = null;
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
        queueAddPropertyProgression("[data-add-property-step='find']", "#addPropertyPostcode");
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
    if (!options.quiet) {
      queueAddPropertyProgression("[data-add-property-step='address']", "#addPropertyAddressTitle");
    }
  }

  function renderMyPropertiesPage() {
    document.title = "My Properties | ComplyMyProperty";
    const properties = myPropertyEntries();
    const propertyCount = properties.length;
    const isOneProperty = propertyCount === 1;
    const isMultiProperty = propertyCount > 1;
    const listHeading = isMultiProperty
      ? "Your property portfolio"
      : isOneProperty
        ? "Your property workspace is ready"
        : "Start by adding your first property";
    const listCopy = isMultiProperty
      ? "Compare current status, evidence gaps and priority actions before opening a property."
      : isOneProperty
        ? "Open the property workspace, continue setup, or add another property when you are ready."
        : "Add a property once. CMP will check what it can, show Review found data, and prepare the property workspace.";
    app.innerHTML = `
      ${baseHeader("my-properties")}
      <main class="public-main bridge-page my-properties-bridge-page public-v2-bridge my-properties-state-${isMultiProperty ? "multi" : isOneProperty ? "one" : "empty"}">
        <section class="page-hero public-page-hero bridge-hero my-properties-bridge-hero">
          <div>
            <span class="eyebrow">My Properties</span>
            <h1>${isMultiProperty ? "See what needs attention across your properties." : isOneProperty ? "Keep your property check moving." : "Your property workspace starts here."}</h1>
            <p>${isMultiProperty ? "Portfolio Sweep helps prioritise evidence gaps, expiries and service opportunities across saved properties." : isOneProperty ? "Use this page to reopen the property workspace, review the Next action, or add another property." : "Add the first property and CMP will build from Smart Checks to Review found data and the Property Brain."}</p>
            <div class="hero-actions">
              <a class="button primary" href="add-property.html">Add property</a>
              ${propertyCount ? `<a class="button secondary" href="${escapeHtml(isMultiProperty ? "dashboard-labs.html?portfolio=guest" : "#property-list")}">${isMultiProperty ? "Open Portfolio Sweep" : "Open property"}</a>` : qaDemoCta("button tertiary")}
            </div>
            <div class="hero-metrics">
              <span><strong>${escapeHtml(String(propertyCount))}</strong> ${propertyCount === 1 ? "property" : "properties"}</span>
              <span>Current status</span>
              <span>Next action</span>
            </div>
          </div>
          <div class="page-hero-visual page-hero-visual-portfolio">
            ${renderMyPropertiesHeroStage()}
          </div>
        </section>

        ${renderFlashBanner()}
        ${renderMyPropertiesPortfolioSummary()}

        <section class="page-section" id="property-list">
          <div class="section-heading">
            <span class="eyebrow">${isMultiProperty ? "Portfolio view" : "Property list"}</span>
            <h2>${listHeading}</h2>
            <p>${listCopy}</p>
          </div>
          ${properties.length ? `
            <div class="property-card-grid">
              ${properties.map((property) => {
                const status = property.sourceKind === "canonical" ? { tone: property.statusTone, label: property.statusLabel } : statusForProperty(property.record || property);
                return `
                  <article class="property-summary-card property-summary-card-${isMultiProperty ? "portfolio" : "single"}">
                    <div class="property-summary-top">
                      <span class="status-pill ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
                      <span class="quiet-pill">${escapeHtml(property.sourceKind === "canonical" ? "Property workspace" : journeyLabelForProperty(property.record || property))}</span>
                    </div>
                    <div class="property-summary-visual" aria-hidden="true">
                      <div class="property-summary-visual-window">
                        <span class="property-summary-visual-chip">Property file</span>
                        <div class="property-summary-visual-lines">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                    <h3>${escapeHtml(property.address)}</h3>
                    <span class="property-summary-label">Next action</span>
                    <p class="property-summary-lead">${escapeHtml(property.sourceKind === "canonical" ? "Open property workspace" : nextActionForProperty(property.record || property))}</p>
                    <div class="property-summary-meta">
                      <span>${escapeHtml(property.type || "Property type to confirm")}</span>
                      <span>${escapeHtml(property.postcode || "Postcode to confirm")}</span>
                      <span>${escapeHtml(property.epcLabel || "EPC missing / unknown")}</span>
                    </div>
                    <p class="property-summary-lead">${escapeHtml(property.smartCheckSummary || "Review found data")}</p>
                    <div class="property-card-actions">
                      <button class="button primary" type="button" data-view-property="${escapeHtml(property.id)}">Open property workspace</button>
                      <a class="button secondary" href="add-property.html">Add another property</a>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="empty-state-card large">
              <strong>No properties added yet</strong>
              <p>Add your first property to start Smart Checks, review found data, track evidence gaps and open the property workspace.</p>
              <div class="hero-actions">
                <a class="button primary" href="add-property.html">Add property</a>
                <a class="button secondary" href="services.html">Request service</a>
                ${qaDemoCta("button tertiary")}
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
          <div class="page-hero-visual page-hero-visual-news">
            <img src="${PUBLIC_VISUALS.evidenceStack}" alt="Editorial updates and landlord guidance">
          </div>
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

  function renderContactPage() {
    document.title = "Contact CMP | ComplyMyProperty";
    app.innerHTML = `
      ${baseHeader("contact")}
      <main class="public-main">
        <section class="page-hero public-page-hero contact-page-hero">
          <div>
            <span class="eyebrow">Contact CMP</span>
            <h1>Need a certificate, check, or evidence pack?</h1>
            <p>Use this page when a landlord wants direct support now. CMP can still keep the journey calm, service-led, and property-led before anything becomes a bigger workflow.</p>
            <div class="hero-actions">
              <a class="button primary" href="mailto:compliance@complymyproperty.com">Email CMP</a>
              <a class="button secondary" href="tel:01217708814">Call 0121 770 8814</a>
            </div>
            <div class="hero-metrics">
              <span>Support-led</span>
              <span>Property-first</span>
              <span>Evidence-aware</span>
            </div>
          </div>
          <div class="page-hero-visual page-hero-visual-contact">
            <img src="${PUBLIC_VISUALS.supportTrust}" alt="ComplyMyProperty support and evidence overview">
          </div>
        </section>

        <section class="page-section">
          <div class="section-heading">
            <span class="eyebrow">Support routes</span>
            <h2>Choose the fastest way to get the right help.</h2>
            <p>These routes stay practical. You can ask for a certificate, a property check, or help organising the evidence before the next step.</p>
          </div>
          <div class="contact-grid">
            <article class="contact-card">
              <span class="service-grid-eyebrow">General support</span>
              <h3>General compliance enquiries</h3>
              <p>For property checks, evidence packs, renewal questions, and landlord compliance support.</p>
              <a href="mailto:compliance@complymyproperty.com">compliance@complymyproperty.com</a>
            </article>
            <article class="contact-card">
              <span class="service-grid-eyebrow">Certificates</span>
              <h3>EPC enquiries</h3>
              <p>For EPC bookings, poor ratings, expiry questions, and certificate follow-up.</p>
              <a href="mailto:epc@complymyproperty.com">epc@complymyproperty.com</a>
            </article>
            <article class="contact-card">
              <span class="service-grid-eyebrow">Safety checks</span>
              <h3>Gas Safety enquiries</h3>
              <p>For Gas Safety Certificate renewals, missing proof, and certificate evidence.</p>
              <a href="mailto:gassafety@complymyproperty.com">gassafety@complymyproperty.com</a>
            </article>
          </div>
        </section>

        <section class="final-cta public-trust-band">
          <div class="home-centered-heading">
            <span class="eyebrow">Prefer to self-check first?</span>
            <h2>Start with the property and let CMP organise the next step.</h2>
            <p>You can still use the public journey first, then return for support once the property facts, evidence, and open checks are in one place.</p>
          </div>
          <div class="home-trust-actions home-centered-actions">
            <a class="button primary" href="add-property.html">Check your property</a>
            <a class="button secondary" href="services.html">Explore services</a>
          </div>
        </section>
      </main>
      ${baseFooter()}
      ${assistantWidget()}
    `;
  }

  function renderFlashBanner() {
    const notice = readFlash();
    if (!notice) return "";
    return `<section class="page-section flash-banner-section"><div class="flash-banner flash-${escapeHtml(notice.tone || "info")}"><strong>${escapeHtml(notice.message)}</strong></div></section>`;
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
    } else if (page === "contact") {
      renderContactPage();
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
