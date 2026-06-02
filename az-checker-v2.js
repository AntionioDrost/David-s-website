(function () {
  const STORAGE_KEY = "cmp_az_checker_v2";
  const DEFAULT_THEME = "intro";
  const SERVICE_LIBRARY = [
    { key: "epc", title: "EPC booking", reason: "Renew, replace, or update the EPC.", cta: "Select for demo" },
    { key: "gas", title: "Gas Safety", reason: "Arrange or replace the gas safety certificate.", cta: "Select for demo" },
    { key: "eicr", title: "EICR", reason: "Book an electrical installation condition report.", cta: "Select for demo" },
    { key: "licensing", title: "Selective Licensing", reason: "Check local licensing before chasing paperwork.", cta: "Select for demo" },
    { key: "inspections", title: "Property Inspections", reason: "Plan a condition visit or inspection report.", cta: "Select for demo" },
    { key: "mould", title: "Mould & Damp", reason: "Track reports, repairs, and contractor steps.", cta: "Select for demo" },
    { key: "insurance", title: "Landlord Insurance", reason: "Review cover around the property and tenancy.", cta: "Select for demo" },
    { key: "rent_guarantee", title: "Rent Guarantee", reason: "Explore arrears protection and income cover.", cta: "Select for demo" },
    { key: "aml", title: "AML checks", reason: "Organise ID and compliance evidence for a tenancy.", cta: "Select for demo" },
    { key: "possession", title: "Possession support", reason: "Build notices, communications, and evidence pack steps.", cta: "Select for demo" },
    { key: "mortgage", title: "Mortgage support", reason: "Keep lender-readiness and repayments in view.", cta: "Select for demo" }
  ];

  const DEMO_PROPERTIES = {
    "B377BA": {
      postcode: "B37 7BA",
      address: "66 Station Road, Marston Green, Birmingham B37 7BA",
      type: "Terraced house",
      bedrooms: 3,
      storeys: 2,
      hasGas: true,
      epc: {
        status: "valid",
        rating: "B",
        expiry: "2031-10-04",
        issue: "2021-10-04",
        floorArea: "82 m²"
      }
    },
    "SW1A1AA": {
      postcode: "SW1A 1AA",
      address: "10 Westminster Gardens, London SW1A 1AA",
      type: "Flat",
      bedrooms: 2,
      storeys: 1,
      hasGas: true,
      epc: {
        status: "expired",
        rating: "D",
        expiry: "2024-02-11",
        issue: "2014-02-11",
        floorArea: "61 m²"
      }
    },
    "M503UB": {
      postcode: "M50 3UB",
      address: "18 Harbour Quay, Salford M50 3UB",
      type: "Apartment",
      bedrooms: 1,
      storeys: 1,
      hasGas: false,
      epc: {
        status: "missing",
        rating: null,
        expiry: "",
        issue: "",
        floorArea: "54 m²"
      }
    }
  };

  const state = loadState();
  const urlParams = new URLSearchParams(window.location.search);

  const ui = {
    body: document.body,
    introScreen: document.getElementById("introScreen"),
    experienceShell: document.getElementById("experienceShell"),
    postcodeForm: document.getElementById("postcodeLookupForm"),
    postcodeInput: document.getElementById("postcodeInput"),
    resumeCard: document.getElementById("resumeCard"),
    overviewPanel: document.getElementById("overviewPanel"),
    overviewToggle: document.getElementById("overviewToggle"),
    overviewSummary: document.getElementById("overviewSummary"),
    propertyPill: document.getElementById("propertyPill"),
    progressPercent: document.getElementById("progressPercent"),
    progressText: document.getElementById("progressText"),
    progressBar: document.getElementById("progressBar"),
    stepNav: document.getElementById("stepNav"),
    stepCounter: document.getElementById("stepCounter"),
    themeLabel: document.getElementById("themeLabel"),
    slideShell: document.getElementById("slideShell"),
    nextButton: document.getElementById("nextButton"),
    backButton: document.getElementById("backButton"),
    skipButton: document.getElementById("skipButton"),
    skipButtonTop: document.getElementById("skipButtonTop"),
    saveExitButton: document.getElementById("saveExitButton"),
    resetCheckerButton: document.getElementById("resetCheckerButton")
  };

  const slides = [
    {
      id: "epc-found",
      label: "EPC found",
      theme: (property) => property.epc.status === "expired" ? "epc-expired" : property.epc.status === "missing" ? "question-cyan" : "epc-valid",
      subtitle: (property) => property.epc.status === "expired" ? "EPC found — action needed" : property.epc.status === "missing" ? "No live EPC found" : "EPC found automatically",
      isAnswered: () => true,
      render: (property) => renderEpcFoundSlide(property)
    },
    {
      id: "epc-action",
      label: "Reminder or renewal",
      theme: (property) => property.epc.status === "expired" ? "epc-expired" : "question-cyan",
      subtitle: (property) => property.epc.status === "expired" ? "EPC renewal path" : "EPC reminder",
      isAnswered: () => Boolean(state.answers.epcAction),
      render: (property) => renderEpcActionSlide(property)
    },
    {
      id: "tenancy",
      label: "Tenancy status",
      theme: () => "question-cyan",
      subtitle: () => "Who is living there?",
      isAnswered: () => Boolean(state.answers.tenancy),
      render: () => renderChoiceSlide({
        kicker: "Tenancy",
        title: "Is the property currently let to tenants?",
        body: "You do not need every detail yet. Pick the closest answer and move on.",
        answerKey: "tenancy",
        options: [
          { value: "yes", title: "Yes", copy: "There is a live tenancy right now." },
          { value: "no", title: "No", copy: "It is empty or between lets." },
          { value: "unsure", title: "Not sure", copy: "No problem — we will mark this to double-check." }
        ]
      })
    },
    {
      id: "gas",
      label: "Gas safety",
      theme: () => "question-lime",
      subtitle: () => "Gas safety check",
      isAnswered: () => Boolean(state.answers.gas),
      render: () => renderChoiceSlide({
        kicker: "Gas safety",
        title: state.property.hasGas ? "Do you already have a current gas safety certificate?" : "Does this property have gas appliances at all?",
        body: state.property.hasGas
          ? "If you have the certificate, great. If not, just choose the closest answer."
          : "If this is electric-only, you can say no and keep moving.",
        answerKey: "gas",
        options: state.property.hasGas ? [
          { value: "current", title: "Yes, current", copy: "You already have a valid CP12 or gas record." },
          { value: "expired", title: "It has run out", copy: "The certificate exists but needs renewing." },
          { value: "missing", title: "I cannot find it", copy: "No problem — we can show where to look." },
          { value: "unsure", title: "Not sure", copy: "We will mark this to double-check later." }
        ] : [
          { value: "none", title: "No gas", copy: "Electric-only or no fixed gas appliances." },
          { value: "unsure", title: "Not sure", copy: "We will keep it flexible until you confirm." }
        ]
      })
    },
    {
      id: "eicr",
      label: "Electrical check",
      theme: () => "question-cyan",
      subtitle: () => "EICR status",
      isAnswered: () => Boolean(state.answers.eicr),
      render: () => renderChoiceSlide({
        kicker: "Electrical safety",
        title: "Do you know where the latest EICR is?",
        body: "This is just to see whether the electrical side is already covered or needs a next step.",
        answerKey: "eicr",
        options: [
          { value: "current", title: "Yes, I have it", copy: "The report is easy to find and looks current." },
          { value: "old", title: "I have an old one", copy: "There is a report, but it may need reviewing." },
          { value: "missing", title: "I cannot find it", copy: "We can point you to the next practical move." },
          { value: "unsure", title: "Not sure", copy: "No problem — we will park it for later." }
        ]
      })
    },
    {
      id: "evidence",
      label: "Evidence you have",
      theme: () => "question-lime",
      subtitle: () => "What is nearby?",
      isAnswered: () => Array.isArray(state.answers.evidence) && state.answers.evidence.length > 0,
      render: () => renderEvidenceSlide()
    },
    {
      id: "licensing",
      label: "Licensing check",
      theme: () => "question-cyan",
      subtitle: () => "Local rules",
      isAnswered: () => Boolean(state.answers.licensing),
      render: () => renderChoiceSlide({
        kicker: "Local checks",
        title: "Have you checked whether local licensing applies?",
        body: "This is often postcode-based, so it is fine to say no or not sure for now.",
        answerKey: "licensing",
        options: [
          { value: "checked", title: "Yes, checked", copy: "You have already looked at the local licensing position." },
          { value: "not_checked", title: "Not yet", copy: "CMP should remind you to check this next." },
          { value: "unsure", title: "Not sure", copy: "We can keep that as a flexible follow-up." }
        ]
      })
    },
    {
      id: "issues",
      label: "Repairs or mould",
      theme: () => "question-lime",
      subtitle: () => "Anything active?",
      isAnswered: () => Boolean(state.answers.issues),
      render: () => renderChoiceSlide({
        kicker: "Repairs and mould",
        title: "Is there anything active you want CMP to track?",
        body: "This could be mould, damp, repairs, complaints, or anything else you do not want to lose track of.",
        answerKey: "issues",
        options: [
          { value: "none", title: "No, all calm", copy: "Nothing is active right now." },
          { value: "mould", title: "Mould or damp", copy: "You want timelines, photos, or repair notes in one place." },
          { value: "repairs", title: "Repairs or access", copy: "You want a record of visits, works, or communications." },
          { value: "unsure", title: "Not sure", copy: "You can keep moving and add this later." }
        ]
      })
    },
    {
      id: "summary",
      label: "Dynamic summary",
      theme: () => "summary",
      subtitle: () => "What CMP would do next",
      isAnswered: () => true,
      render: () => renderSummarySlide()
    }
  ];

  init();

  function init() {
    applyUrlState();
    attachEvents();
    syncJourney();
    render();
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function attachEvents() {
    ui.postcodeForm?.addEventListener("submit", handleLookup);
    document.querySelectorAll("[data-demo-postcode]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.postcodeInput.value = button.dataset.demoPostcode || "";
        handleLookup(new Event("submit"));
      });
    });
    ui.nextButton?.addEventListener("click", goNext);
    ui.backButton?.addEventListener("click", goBack);
    ui.skipButton?.addEventListener("click", skipCurrentSlide);
    ui.skipButtonTop?.addEventListener("click", skipCurrentSlide);
    ui.saveExitButton?.addEventListener("click", () => {
      persist();
      window.location.href = "index.html";
    });
    ui.resetCheckerButton?.addEventListener("click", resetState);
    ui.overviewToggle?.addEventListener("click", () => {
      ui.overviewPanel.classList.toggle("is-open");
      ui.overviewToggle.setAttribute("aria-expanded", ui.overviewPanel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function emptyState() {
    return {
      property: null,
      started: false,
      currentSlide: 0,
      answers: {
        epcAction: "",
        tenancy: "",
        gas: "",
        eicr: "",
        evidence: [],
        licensing: "",
        issues: ""
      },
      skipped: {},
      bookings: {},
      updatedAt: null
    };
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!raw || typeof raw !== "object") return emptyState();
      return {
        ...emptyState(),
        ...raw,
        answers: { ...emptyState().answers, ...(raw.answers || {}) },
        skipped: { ...(raw.skipped || {}) },
        bookings: { ...(raw.bookings || {}) }
      };
    } catch {
      return emptyState();
    }
  }

  function persist() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncJourney();
  }

  function syncJourney() {
    if (!window.CMPJourney) return;
    const tenantedValue = state.answers.tenancy === "yes"
      ? true
      : state.answers.tenancy === "no"
        ? false
        : "";
    const licensingCheckedValue = state.answers.licensing === "checked"
      ? true
      : state.answers.licensing === "not_checked"
        ? false
        : "";
    const hasTenancyAgreement = Array.isArray(state.answers.evidence) && state.answers.evidence.includes("Tenancy agreement");
    const answeredQuestions = {
      "v2.postcode": state.property?.postcode || "",
      "epc.issue": state.property?.epc?.issue || "",
      "epc.rating": state.property?.epc?.rating || "",
      "epc.expiry": state.property?.epc?.expiry || "",
      "v2.epcStatus": state.property?.epc?.status || "",
      "tenancy.currentlyTenanted": tenantedValue,
      "tenancy.agreement": hasTenancyAgreement,
      "v2.gasStatus": state.answers.gas || "",
      "v2.eicrStatus": state.answers.eicr || "",
      "licensing.localChecked": licensingCheckedValue,
      "v2.evidence": state.answers.evidence || [],
      "v2.licensing": state.answers.licensing || "",
      "v2.issues": state.answers.issues || ""
    };
    window.CMPJourney.update({
      entryService: "full_compliance",
      focusMode: "full_compliance",
      sourceRoute: "az-checker-v2.html",
      answeredQuestions
    });
  }

  function normalizedPostcode(postcode) {
    return String(postcode || "").toUpperCase().replace(/\s+/g, "");
  }

  function lookupDemoProperty(postcode) {
    const key = normalizedPostcode(postcode);
    return DEMO_PROPERTIES[key] || {
      postcode: postcode.toUpperCase(),
      address: `Example property, ${postcode.toUpperCase()}`,
      type: "Unknown type",
      bedrooms: 0,
      storeys: 0,
      hasGas: true,
      epc: {
        status: "missing",
        rating: null,
        expiry: "",
        issue: "",
        floorArea: ""
      }
    };
  }

  function handleLookup(event) {
    event?.preventDefault?.();
    const postcode = ui.postcodeInput.value.trim();
    if (!postcode) return;
    state.property = lookupDemoProperty(postcode);
    state.started = true;
    state.currentSlide = 0;
    persist();
    render();
  }

  function applyUrlState() {
    const demo = urlParams.get("demo");
    const scenario = urlParams.get("scenario");
    const slide = urlParams.get("slide");

    if (scenario && applyScenario(scenario)) {
      if (slide) applySlideFromUrl(slide);
      return;
    }

    if (!demo) return;
    const lookupValue = demo === "valid"
      ? "B37 7BA"
      : demo === "expired"
        ? "SW1A 1AA"
        : demo === "missing"
          ? "M50 3UB"
          : demo;
    state.property = lookupDemoProperty(lookupValue);
    state.started = true;
    state.currentSlide = 0;
    if (slide) applySlideFromUrl(slide);
  }

  function applySlideFromUrl(slide) {
    const numericIndex = Number(slide);
    if (Number.isFinite(numericIndex) && numericIndex >= 1 && numericIndex <= slides.length) {
      state.currentSlide = numericIndex - 1;
      return;
    }
    const index = slides.findIndex((item) => item.id === slide);
    if (index >= 0) state.currentSlide = index;
  }

  function applyScenario(name) {
    const scenarios = {
      valid: {
        property: lookupDemoProperty("B37 7BA"),
        currentSlide: 0
      },
      expired: {
        property: lookupDemoProperty("SW1A 1AA"),
        currentSlide: 0
      },
      valid_summary: {
        property: lookupDemoProperty("B37 7BA"),
        currentSlide: slides.findIndex((item) => item.id === "summary"),
        answers: {
          epcAction: "set_90",
          tenancy: "yes",
          gas: "current",
          eicr: "current",
          evidence: ["Gas certificate", "EICR report"],
          licensing: "checked",
          issues: "none"
        }
      },
      expired_summary: {
        property: lookupDemoProperty("SW1A 1AA"),
        currentSlide: slides.findIndex((item) => item.id === "summary"),
        answers: {
          epcAction: "rebook_now",
          tenancy: "yes",
          gas: "expired",
          eicr: "missing",
          evidence: ["Tenancy agreement", "Notices or letters"],
          licensing: "not_checked",
          issues: "mould"
        },
        bookings: {
          epc: "selected",
          gas: "selected",
          mould: "later"
        }
      }
    };

    const config = scenarios[name];
    if (!config) return false;

    Object.assign(state, emptyState(), {
      started: true,
      property: config.property,
      currentSlide: config.currentSlide ?? 0,
      answers: { ...emptyState().answers, ...(config.answers || {}) },
      skipped: { ...(config.skipped || {}) },
      bookings: { ...(config.bookings || {}) }
    });
    return true;
  }

  function render() {
    const hasSession = Boolean(state.started && state.property);
    ui.body.dataset.theme = hasSession ? currentTheme() : DEFAULT_THEME;
    ui.introScreen.hidden = hasSession;
    ui.experienceShell.hidden = !hasSession;
    ui.overviewToggle.hidden = !hasSession;
    renderResumeCard();
    if (!hasSession) return;
    renderOverview();
    renderStage();
  }

  function currentSlideDef() {
    return slides[state.currentSlide] || slides[0];
  }

  function currentTheme() {
    const slide = currentSlideDef();
    return typeof slide.theme === "function" ? slide.theme(state.property) : slide.theme;
  }

  function renderResumeCard() {
    if (!state.started || !state.property) {
      ui.resumeCard.hidden = true;
      ui.resumeCard.innerHTML = "";
      return;
    }
    const progress = completionPercent();
    ui.resumeCard.hidden = false;
    ui.resumeCard.innerHTML = `
      <strong>Resume your last V2 check</strong>
      <p>${escapeHtml(state.property.address)} · ${progress}% saved so far.</p>
      <button class="azv2-primary-button" type="button" id="resumeJourneyButton">Resume where I left off</button>
    `;
    document.getElementById("resumeJourneyButton")?.addEventListener("click", () => {
      render();
      document.getElementById("experienceShell")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderOverview() {
    const progress = completionPercent();
    const completed = completedCount();
    ui.overviewSummary.textContent = state.property.epc.status === "expired"
      ? "This property already has one obvious action: deal with the EPC first, then widen the picture."
      : "The checker is building around one property, one answer at a time, so landlords never have to do everything at once.";
    ui.propertyPill.innerHTML = `
      <strong>${escapeHtml(state.property.address)}</strong>
      <small>${escapeHtml(state.property.type)} · ${escapeHtml(state.property.postcode)}</small>
    `;
    ui.progressPercent.textContent = `${progress}%`;
    ui.progressText.textContent = `${completed} of ${slides.length - 1} questions or actions have been answered.`;
    ui.progressBar.style.width = `${progress}%`;
    ui.stepNav.innerHTML = slides.map((slide, index) => {
      const status = slide.id === "summary" ? "pending" : stepStatus(slide);
      return `
        <button class="azv2-step-link${index === state.currentSlide ? " is-active" : ""}" type="button" data-step-index="${index}">
          <div class="azv2-step-meta-line">
            <strong>${escapeHtml(slide.label)}</strong>
            <span class="azv2-status-dot ${status}">${escapeHtml(statusLabel(status))}</span>
          </div>
          <small>${escapeHtml(typeof slide.subtitle === "function" ? slide.subtitle(state.property) : slide.subtitle)}</small>
        </button>
      `;
    }).join("");
    ui.stepNav.querySelectorAll("[data-step-index]").forEach((button) => {
      button.addEventListener("click", () => {
        state.currentSlide = Number(button.dataset.stepIndex);
        persist();
        render();
      });
    });
  }

  function renderStage() {
    const slide = currentSlideDef();
    ui.stepCounter.textContent = `Step ${state.currentSlide + 1} of ${slides.length}`;
    ui.themeLabel.textContent = typeof slide.subtitle === "function" ? slide.subtitle(state.property) : slide.subtitle;
    ui.slideShell.innerHTML = slide.render(state.property);
    bindSlideInteractions(slide.id);
    updateStageButtons();
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function updateStageButtons() {
    const slide = currentSlideDef();
    ui.backButton.disabled = state.currentSlide === 0;
    ui.nextButton.textContent = slide.id === "summary"
      ? "Back to overview"
      : !slide.isAnswered() && slide.id !== "epc-found"
        ? "Skip and continue"
      : state.currentSlide === slides.length - 2
        ? "See my summary"
        : "Continue";
  }

  function bindSlideInteractions(slideId) {
    ui.slideShell.querySelectorAll("[data-answer-key][data-answer-value]").forEach((button) => {
      button.addEventListener("click", () => {
        setAnswer(button.dataset.answerKey, button.dataset.answerValue);
      });
    });
    ui.slideShell.querySelectorAll("[data-multi-key][data-multi-value]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleMultiAnswer(button.dataset.multiKey, button.dataset.multiValue);
      });
    });
    ui.slideShell.querySelectorAll("[data-book-service]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.bookService;
        state.bookings[key] = state.bookings[key] === "selected" ? "later" : "selected";
        persist();
        renderStage();
      });
    });
    ui.slideShell.querySelectorAll("[data-book-later]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.bookLater;
        state.bookings[key] = "later";
        persist();
        renderStage();
      });
    });
  }

  function setAnswer(key, value) {
    state.answers[key] = value;
    delete state.skipped[currentSlideDef().id];
    persist();
    render();
  }

  function toggleMultiAnswer(key, value) {
    const current = new Set(Array.isArray(state.answers[key]) ? state.answers[key] : []);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    state.answers[key] = Array.from(current);
    delete state.skipped[currentSlideDef().id];
    persist();
    render();
  }

  function skipCurrentSlide() {
    const slide = currentSlideDef();
    if (slide.id === "summary") return;
    state.skipped[slide.id] = true;
    persist();
    if (state.currentSlide < slides.length - 1) state.currentSlide += 1;
    render();
  }

  function goBack() {
    if (state.currentSlide === 0) return;
    state.currentSlide -= 1;
    persist();
    render();
  }

  function goNext() {
    const slide = currentSlideDef();
    if (slide.id === "summary") {
      state.currentSlide = 0;
      persist();
      render();
      document.getElementById("overviewPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!slide.isAnswered() && slide.id !== "epc-found") {
      state.skipped[slide.id] = true;
    }
    if (state.currentSlide < slides.length - 1) {
      state.currentSlide += 1;
      persist();
      render();
    }
  }

  function stepStatus(slide) {
    if (slide.isAnswered()) return "done";
    if (state.skipped[slide.id]) return "skipped";
    return "pending";
  }

  function statusLabel(status) {
    if (status === "done") return "Saved";
    if (status === "skipped") return "Skipped";
    return "Next";
  }

  function completedCount() {
    return slides.slice(0, -1).filter((slide) => slide.isAnswered()).length;
  }

  function completionPercent() {
    return Math.round((completedCount() / (slides.length - 1)) * 100);
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderEpcFoundSlide(property) {
    const isExpired = property.epc.status === "expired";
    const isMissing = property.epc.status === "missing";
    return `
      <section class="azv2-slide">
        <div class="azv2-slide-header">
          <span class="azv2-slide-index">01</span>
          <span class="azv2-slide-feedback">${escapeHtml(isMissing ? "Preview mode: no live EPC found" : "Automatic EPC search complete")}</span>
        </div>
        <div class="azv2-slide-copy">
          <span class="azv2-kicker">${escapeHtml(isExpired ? "EPC found — but expired" : isMissing ? "No EPC found automatically" : "Congratulations — we found your EPC automatically")}</span>
          <h1>${escapeHtml(
            isMissing
              ? "No live EPC in the preview. We can still build the picture."
              : isExpired
                ? "We found your EPC. It looks like it has already run out."
                : "We found your EPC automatically — and it still looks valid."
          )}</h1>
          <p>${escapeHtml(
            isMissing
              ? "That is fine. CMP can start with what you know, then fill the gaps when you are ready."
              : `This property looks like a ${property.type.toLowerCase()} with an EPC rating of ${property.epc.rating}. ${isExpired ? "The next step is to sort the renewal path." : "The good news is you do not need to start from scratch."}`
          )}</p>
        </div>
        <div class="azv2-highlight-card">
          <article class="azv2-stat">
            <span>Address</span>
            <strong>${escapeHtml(property.address.split(",")[0])}</strong>
          </article>
          <article class="azv2-stat">
            <span>EPC rating</span>
            <strong>${escapeHtml(property.epc.rating || "Unknown")}</strong>
          </article>
          <article class="azv2-stat">
            <span>Status</span>
            <strong>${escapeHtml(isMissing ? "Not found" : isExpired ? "Expired" : "Valid")}</strong>
          </article>
          <article class="azv2-stat">
            <span>${escapeHtml(isExpired ? "Expired on" : "Valid until")}</span>
            <strong>${escapeHtml(property.epc.expiry ? formatDate(property.epc.expiry) : "To confirm")}</strong>
          </article>
        </div>
        <div class="azv2-insight-row">
          <span class="azv2-insight-pill">${escapeHtml(property.bedrooms || "?" )} bedrooms</span>
          <span class="azv2-insight-pill">${escapeHtml(property.floorArea || property.epc.floorArea || "Area to confirm")}</span>
          <span class="azv2-insight-pill">${escapeHtml(property.hasGas ? "Gas likely present" : "No gas showing in preview")}</span>
        </div>
      </section>
    `;
  }

  function renderEpcActionSlide(property) {
    const isExpired = property.epc.status === "expired";
    const isMissing = property.epc.status === "missing";
    return `
      <section class="azv2-slide">
        <div class="azv2-slide-header">
          <span class="azv2-slide-index">02</span>
        </div>
        <div class="azv2-slide-copy">
          <span class="azv2-kicker">${escapeHtml(isExpired ? "Renewal path" : isMissing ? "First follow-up" : "Reminder path")}</span>
          <h2>${escapeHtml(
            isMissing
              ? "Should we treat the EPC as something to recover or something to re-book?"
              : isExpired
                ? "Let’s decide what the EPC next step should be."
                : "Nice. Want CMP to remind you before the EPC runs out?"
          )}</h2>
          <p>${escapeHtml(
            isMissing
              ? "If you think there should already be a certificate, we can suggest where to look. If not, we can point you straight to a fresh booking."
              : isExpired
                ? "This is where the flow becomes useful. You can move straight into renewal, or say you already have newer paperwork."
                : "This keeps the journey practical. Even when something is valid, the next useful move might just be a reminder."
          )}</p>
        </div>
        <div class="azv2-choice-grid">
          ${(isMissing ? [
            { value: "search_first", title: "Help me find it", copy: "Show me where an old certificate might still exist." },
            { value: "book_new", title: "Book a fresh EPC", copy: "Treat this as a new EPC requirement." },
            { value: "later", title: "Come back later", copy: "Keep moving and revisit it when I have more time." }
          ] : isExpired ? [
            { value: "rebook_now", title: "Re-book now", copy: "This becomes the next obvious action." },
            { value: "i_have_new_one", title: "I already have a newer EPC", copy: "Great — CMP should ask for it later." },
            { value: "later", title: "Come back later", copy: "No problem — keep the task visible without blocking the rest." }
          ] : [
            { value: "set_90", title: "90-day reminder", copy: "Bring it back just before renewal becomes urgent." },
            { value: "set_180", title: "6-month reminder", copy: "Give yourself more breathing room." },
            { value: "leave_it", title: "Not now", copy: "Keep moving without adding a reminder yet." }
          ]).map((option) => `
            <button class="azv2-choice${state.answers.epcAction === option.value ? " is-active" : ""}" type="button" data-answer-key="epcAction" data-answer-value="${escapeHtml(option.value)}">
              <strong>${escapeHtml(option.title)}</strong>
              <small>${escapeHtml(option.copy)}</small>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderChoiceSlide(config) {
    return `
      <section class="azv2-slide">
        <div class="azv2-slide-header">
          <span class="azv2-slide-index">${escapeHtml(String(state.currentSlide + 1).padStart(2, "0"))}</span>
          ${state.answers[config.answerKey] ? `<span class="azv2-slide-feedback">Saved — you can change this later.</span>` : ""}
        </div>
        <div class="azv2-slide-copy">
          <span class="azv2-kicker">${escapeHtml(config.kicker)}</span>
          <h2>${escapeHtml(config.title)}</h2>
          <p>${escapeHtml(config.body)}</p>
        </div>
        <div class="azv2-choice-grid">
          ${config.options.map((option) => `
            <button class="azv2-choice${state.answers[config.answerKey] === option.value ? " is-active" : ""}" type="button" data-answer-key="${escapeHtml(config.answerKey)}" data-answer-value="${escapeHtml(option.value)}">
              <strong>${escapeHtml(option.title)}</strong>
              <small>${escapeHtml(option.copy)}</small>
            </button>
          `).join("")}
        </div>
        <p class="azv2-inline-note">Not sure? No problem. You can skip this slide and come back later.</p>
      </section>
    `;
  }

  function renderEvidenceSlide() {
    const selected = new Set(state.answers.evidence || []);
    const options = [
      "EPC certificate",
      "Gas certificate",
      "EICR report",
      "Tenancy agreement",
      "Deposit proof",
      "Photos or reports",
      "Repair notes",
      "Nothing handy yet"
    ];
    return `
      <section class="azv2-slide">
        <div class="azv2-slide-header">
          <span class="azv2-slide-index">06</span>
          ${selected.size ? `<span class="azv2-slide-feedback">Nice, that’s recorded.</span>` : ""}
        </div>
        <div class="azv2-slide-copy">
          <span class="azv2-kicker">Evidence nearby</span>
          <h2>Which documents or evidence do you already have nearby?</h2>
          <p>This does not need to be complete. Pick what is easy to reach. The point is to build momentum, not to create homework.</p>
        </div>
        <div class="azv2-multi-grid">
          ${options.map((option) => `
            <button class="azv2-multi-chip${selected.has(option) ? " is-active" : ""}" type="button" data-multi-key="evidence" data-multi-value="${escapeHtml(option)}">
              ${escapeHtml(option)}
            </button>
          `).join("")}
        </div>
        <div class="azv2-recap-card">
          <strong>Return-later friendly</strong>
          <p>Nothing here blocks you. If all you know today is the postcode and one certificate, that is enough to keep going.</p>
        </div>
      </section>
    `;
  }

  function summaryBlocks() {
    const property = state.property;
    const actions = [];
    const finders = [];
    const recommended = [];
    const later = [];

    if (property.epc.status === "expired" || state.answers.epcAction === "rebook_now" || state.answers.epcAction === "book_new") {
      actions.push("Re-book the EPC or upload a newer certificate if you already have one.");
      recommended.push("epc");
    } else if (property.epc.status === "missing" || state.answers.epcAction === "search_first") {
      actions.push("Check whether an EPC already exists before booking a new one.");
      finders.push("EPC certificates can often be found on the GOV.UK EPC register, or through the assessor, agent, or previous landlord file.");
      recommended.push("epc");
    } else {
      actions.push("Set a reminder so the EPC does not become a last-minute problem.");
    }

    if (state.answers.gas === "expired") {
      actions.push("Arrange a fresh gas safety certificate.");
      recommended.push("gas");
    }
    if (state.answers.gas === "missing") {
      finders.push("Lost the gas certificate? Ask the engineer, managing agent, or whoever arranged the last CP12 for a copy.");
      recommended.push("gas");
    }
    if (state.answers.eicr === "old") {
      actions.push("Review whether the latest EICR is still current.");
      recommended.push("eicr");
    }
    if (state.answers.eicr === "missing") {
      finders.push("Lost the EICR? Ask the electrician, managing agent, or contractor who carried out the last inspection.");
      recommended.push("eicr");
    }
    if (state.answers.licensing === "not_checked" || state.answers.licensing === "unsure") {
      actions.push("Check the local licensing position before assuming no licence is needed.");
      recommended.push("licensing");
    }
    if (state.answers.issues === "mould") {
      actions.push("Create a damp or mould timeline with photos, contractor notes, and tenant communication.");
      recommended.push("mould");
    }
    if (state.answers.issues === "repairs") {
      actions.push("Track repairs and access notes in one place so nothing gets lost.");
      recommended.push("inspections");
    }
    if (!state.answers.evidence?.length || state.answers.evidence.includes("Nothing handy yet")) {
      actions.push("Start without documents today, then add certificates or evidence when they become easy to find.");
      later.push("evidence_pack");
    }
    if (state.answers.tenancy === "yes") {
      later.push("rent_guarantee", "insurance");
    }
    if (state.answers.tenancy === "unsure") {
      actions.push("Confirm whether the property is currently tenanted so the rest of the checklist can tighten up later.");
    }

    return { actions, finders, recommended: Array.from(new Set(recommended)), later: Array.from(new Set(later)) };
  }

  function renderSummarySlide() {
    const blocks = summaryBlocks();
    const property = state.property;
    const recommendedServices = SERVICE_LIBRARY.filter((item) => blocks.recommended.includes(item.key));
    const laterServices = SERVICE_LIBRARY.filter((item) => !blocks.recommended.includes(item.key));

    return `
      <section class="azv2-slide">
        <div class="azv2-slide-header">
          <span class="azv2-slide-index">09</span>
          <span class="azv2-slide-feedback">Dynamic summary ready.</span>
        </div>

        <div class="azv2-summary-grid">
          <div class="azv2-summary-heading">
            <span class="azv2-kicker">Your property summary</span>
            <h2>${escapeHtml(property.epc.status === "expired" ? "We know enough to start fixing the urgent stuff." : "You have a working compliance picture already.")}</h2>
            <p class="azv2-summary-copy">This is the V2 idea: postcode first, one question at a time, and then practical next steps based on the real state of the property.</p>
            <div class="azv2-insight-row">
              <span class="azv2-insight-pill">${escapeHtml(property.address.split(",")[0])}</span>
              <span class="azv2-insight-pill">${escapeHtml(property.epc.status === "expired" ? "Expired EPC" : property.epc.status === "missing" ? "EPC not found" : `EPC ${property.epc.rating}`)}</span>
              <span class="azv2-insight-pill">${escapeHtml(completionPercent())}% saved</span>
            </div>
          </div>

          <div class="azv2-summary-stack">
            <article class="azv2-summary-block">
              <h3>Next steps that matter now</h3>
              <ul class="azv2-summary-list">
                ${blocks.actions.length ? blocks.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : `<li>Nothing urgent is showing right now. Keep the dashboard tidy and track renewals calmly.</li>`}
              </ul>
            </article>

            <article class="azv2-summary-block">
              <h3>If you have lost a certificate</h3>
              <ul class="azv2-summary-list">
                ${(blocks.finders.length ? blocks.finders : [
                  "Lost a document? Ask the assessor, engineer, electrician, agent, or scheme that issued it before assuming you need to start from zero."
                ]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
          </div>
        </div>

        <article class="azv2-summary-block">
          <h3>Book or save services for this property</h3>
          <div class="azv2-service-grid">
            ${recommendedServices.map((service) => renderServiceCard(service, true)).join("")}
            ${laterServices.slice(0, 5).map((service) => renderServiceCard(service, false)).join("")}
          </div>
        </article>

        <article class="azv2-finder-card">
          <strong>Prototype note</strong>
          <p>This V2 page is for testing how a faster, brighter, slide-based compliance journey could feel before you replicate it in Wix. It saves progress locally and updates journey context, but it does not place real bookings or store live certificates.</p>
        </article>
      </section>
    `;
  }

  function renderServiceCard(service, recommendedNow) {
    const selected = state.bookings[service.key] === "selected";
    const later = state.bookings[service.key] === "later";
    return `
      <article class="azv2-service-card">
        <span class="azv2-card-label">${escapeHtml(recommendedNow ? "Recommended now" : "Optional later")}</span>
        <h4>${escapeHtml(service.title)}</h4>
        <p>${escapeHtml(service.reason)}</p>
        <div class="azv2-service-card-actions">
          <button class="azv2-service-button${selected ? " is-active" : ""}" type="button" data-book-service="${escapeHtml(service.key)}">
            ${escapeHtml(selected ? "Selected for demo" : service.cta)}
          </button>
          <button class="azv2-service-button" type="button" data-book-later="${escapeHtml(service.key)}">
            ${escapeHtml(later ? "Saved for later" : "Maybe later")}
          </button>
        </div>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function resetState() {
    Object.assign(state, emptyState());
    localStorage.removeItem(STORAGE_KEY);
    if (window.CMPJourney) window.CMPJourney.clear();
    render();
  }
})();
