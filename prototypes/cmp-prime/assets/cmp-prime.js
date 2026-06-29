(function cmpPrimePrototype(window, document) {
  "use strict";

  const data = window.CMPPrimeData;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "Review date to add";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function stateClass(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function label(value, tone = "") {
    return `<span class="status-label ${tone || stateClass(value)}">${escapeHtml(value)}</span>`;
  }

  function getActiveOrExample() {
    return data.getActiveProperty() || data.ensureExampleProperty();
  }

  function saveAndRender(property) {
    data.saveProperty(property);
    const page = document.body.dataset.page;
    if (page === "property") renderPropertyPage();
    if (page === "services") renderServicesPage();
    if (page === "my-properties") renderMyPropertiesPage();
  }

  function confirmedRecords(property) {
    return property.records.filter((record) => ["Landlord says held", "Evidence added"].includes(record.evidenceState));
  }

  function missingRecords(property) {
    return property.records.filter((record) => ["Not known", "Needs renewal", "Service request drafted"].includes(record.evidenceState));
  }

  function initHeader() {
    const current = document.body.dataset.page;
    $all("[data-nav]").forEach((link) => {
      if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
    });
  }

  function initIndexPage() {
    $all("[data-open-example]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        data.ensureExampleProperty();
        window.location.href = "property.html";
      });
    });
  }

  function showPanel(panel) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initAddPropertyPage() {
    const form = $("#propertyLookupForm");
    const status = $("#lookupStatus");
    const selectedAddress = $("#selectedAddress");
    const manualFallback = $("#manualFallback");
    const manualAddress = $("#manualAddress");
    const smartChecksPanel = $("#smartChecksPanel");
    const reviewPanel = $("#reviewPanel");
    const questionsPanel = $("#questionsPanel");
    const questionsForm = $("#propertyQuestionsForm");
    let currentProperty = null;

    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const postcode = data.normalisePostcode($("#postcode").value);
      const submit = form.querySelector("button[type='submit']");
      submit.disabled = true;
      status.textContent = "Running postcode lookup and preparing Smart Checks.";
      status.className = "form-status is-loading";

      const postcodeLookup = await data.lookupPostcode(postcode);
      const epcLookup = await data.lookupEpc(postcodeLookup.data);
      const address = postcodeLookup.ok
        ? `Rental property at ${postcodeLookup.data.postcode}`
        : `Fallback property at ${postcodeLookup.data.postcode}`;

      currentProperty = data.createPropertyFromLookup({
        postcodeContext: postcodeLookup.data,
        epcLookup,
        address
      });

      if (!postcodeLookup.ok) {
        manualFallback.hidden = false;
        status.textContent = `${postcodeLookup.error} CMP has loaded a fallback so the check can continue.`;
        status.className = "form-status is-warning";
      } else {
        manualFallback.hidden = true;
        status.textContent = "Postcode data from live postcode lookup";
        status.className = "form-status is-success";
      }

      data.saveProperty(currentProperty);
      selectedAddress.innerHTML = renderSelectedAddress(currentProperty, postcodeLookup.ok);
      renderSmartChecks(currentProperty);
      form.classList.add("is-complete");
      submit.hidden = true;
      showPanel(smartChecksPanel);
    });

    $("#applyManualAddress").addEventListener("click", () => {
      if (!currentProperty) return;
      const value = manualAddress.value.trim();
      if (value) {
        currentProperty.address = value;
        data.saveProperty(currentProperty);
        selectedAddress.innerHTML = renderSelectedAddress(currentProperty, false);
      }
    });

    $("#reviewFoundData").addEventListener("click", () => {
      currentProperty = data.getActiveProperty();
      renderReview(currentProperty);
      smartChecksPanel.classList.add("is-complete");
      $("#reviewFoundData").hidden = true;
      showPanel(reviewPanel);
    });

    $("#confirmFoundData").addEventListener("click", () => {
      currentProperty = data.getActiveProperty();
      currentProperty.foundDataReviewed = true;
      data.saveProperty(currentProperty);
      reviewPanel.classList.add("is-complete");
      $("#confirmFoundData").hidden = true;
      showPanel(questionsPanel);
    });

    questionsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      currentProperty = data.getActiveProperty();
      const formData = new FormData(questionsForm);
      data.applyQuestionAnswers(currentProperty, {
        occupancyStatus: formData.get("occupancyStatus"),
        gasSafety: formData.get("gasSafety"),
        eicr: formData.get("eicr"),
        smokeCo: formData.get("smokeCo"),
        deposit: formData.get("deposit"),
        tenancyAgreement: formData.get("tenancyAgreement"),
        dampMould: formData.get("dampMould"),
        licensing: formData.get("licensing"),
        serviceHelp: formData.get("serviceHelp")
      });
      data.saveProperty(currentProperty);
      window.location.href = "property.html";
    });
  }

  function renderSelectedAddress(property, liveLookup) {
    return `
      <div class="selected-card">
        <div>
          <p class="eyebrow-text">Selected property</p>
          <h2>${escapeHtml(property.address)}</h2>
          <p>${escapeHtml(property.localAuthority)} · ${escapeHtml(property.postcode)}</p>
        </div>
        ${label(liveLookup ? "Postcode data from live postcode lookup" : "Prototype property fallback", liveLookup ? "live" : "fallback")}
      </div>
    `;
  }

  function renderSmartChecks(property) {
    const container = $("#smartChecksContent");
    container.innerHTML = `
      <div class="check-grid">
        ${checkCard("Address checked", property.address, property.sourceLabels.postcode)}
        ${checkCard("Local authority context", property.localAuthority, property.sourceLabels.postcode)}
        ${checkCard("EPC prepared for review", `Rating ${property.epc.rating}`, property.sourceLabels.epc)}
        ${checkCard("Landlord record questions", "Gas Safety, EICR, alarms, tenancy pack and licensing questions are ready.", "Needs landlord confirmation")}
        ${checkCard("Evidence gaps calculated", `${missingRecords(property).length} record areas need confirmation or evidence.`, "Not known")}
      </div>
      <p class="help-note">CMP separates found data from records that still need landlord confirmation or evidence.</p>
    `;
  }

  function checkCard(title, value, source) {
    return `
      <article class="mini-card">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(value)}</p>
        ${label(source, source.includes("live") ? "live" : "")}
      </article>
    `;
  }

  function renderReview(property) {
    $("#foundDataList").innerHTML = `
      ${reviewItem("Address", property.address, property.sourceLabels.postcode)}
      ${reviewItem("Local authority", property.localAuthority, property.sourceLabels.postcode)}
      ${reviewItem("EPC", `Rating ${property.epc.rating}, review by ${formatDate(property.epc.reviewDate)}`, property.sourceLabels.epc)}
    `;

    const needs = [
      "Gas Safety certificate",
      "EICR",
      "Smoke and CO alarms",
      "Deposit and tenancy agreement",
      "Licence/HMO position",
      "Repair or damp/mould issues"
    ];

    $("#needsDataList").innerHTML = needs.map((item) => reviewItem(item, "CMP needs landlord confirmation.", "Not known")).join("");
  }

  function reviewItem(title, value, source) {
    return `
      <li class="review-item">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(value)}</span>
        ${label(source, source.includes("live") ? "live" : "")}
      </li>
    `;
  }

  function initTabs() {
    const tabs = $all("[data-tab-target]");
    if (!tabs.length) return;

    function activate(target) {
      tabs.forEach((tab) => {
        const selected = tab.dataset.tabTarget === target;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
      });

      $all("[data-tab-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== target;
      });

      if (window.location.hash.slice(1) !== target) {
        history.replaceState(null, "", `#${target}`);
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab.dataset.tabTarget));
    });

    activate(window.location.hash.slice(1) || "overview");
  }

  function renderPropertyPage() {
    const property = getActiveOrExample();
    $("#propertyTitle").textContent = property.address;
    $("#propertyMeta").textContent = `${property.localAuthority} · ${property.propertyType} · ${property.bedrooms} bedrooms`;
    $("#readinessScore").textContent = `${property.readinessScore}%`;
    $("#evidenceStrength").textContent = `${property.evidenceStrength}%`;
    $("#confirmedCount").textContent = confirmedRecords(property).length;
    $("#missingCount").textContent = missingRecords(property).length;
    $("#nextActionTitle").textContent = property.nextBestAction.title;
    $("#nextActionReason").textContent = property.nextBestAction.reason;
    $("#nextActionEvidence").textContent = property.nextBestAction.evidenceNeeded;
    $("#overviewConfirmed").innerHTML = confirmedRecords(property).slice(0, 5).map(recordPill).join("") || "<p>No records confirmed yet.</p>";
    $("#overviewMissing").innerHTML = missingRecords(property).slice(0, 5).map(recordPill).join("") || "<p>No immediate evidence gaps.</p>";
    $("#startNextAction").onclick = () => {
      activateTabFromCode("action-plan");
    };
    $("#viewEvidenceGaps").onclick = () => {
      activateTabFromCode("evidence-vault");
    };

    renderEvidenceVault(property);
    renderActionPlan(property);
    renderPropertyServices(property);
    renderMonitoring(property);
  }

  function activateTabFromCode(target) {
    const tab = $(`[data-tab-target="${target}"]`);
    if (tab) tab.click();
  }

  function recordPill(record) {
    return `<span class="record-pill">${escapeHtml(record.title)} ${label(record.evidenceState)}</span>`;
  }

  function renderEvidenceVault(property) {
    const rows = property.records.map((record) => `
      <tr>
        <td>
          <strong>${escapeHtml(record.title)}</strong>
          <span>${escapeHtml(record.type)}</span>
        </td>
        <td>${escapeHtml(record.status)}</td>
        <td>${label(record.evidenceState)}</td>
        <td>${escapeHtml(record.source)}</td>
        <td>${escapeHtml(record.expiryDate ? formatDate(record.expiryDate) : formatDate(record.reviewDate))}</td>
        <td><button class="table-action" type="button" data-upload-record="${escapeHtml(record.id)}">Add evidence</button></td>
      </tr>
    `).join("");

    $("#evidenceRows").innerHTML = rows;
    $all("[data-upload-record]").forEach((button) => {
      button.addEventListener("click", () => openEvidenceDialog(button.dataset.uploadRecord));
    });
  }

  function renderActionPlan(property) {
    const action = property.nextBestAction;
    const record = action.linkedRecordId ? data.getRecord(property, action.linkedRecordId) : null;
    $("#actionPlanContent").innerHTML = `
      <article class="priority-action">
        <p class="eyebrow-text">Top priority action</p>
        <h3>${escapeHtml(action.title)}</h3>
        <p>${escapeHtml(action.reason)}</p>
        <dl class="action-details">
          <div><dt>Affected record</dt><dd>${escapeHtml(record ? record.title : "Monitoring")}</dd></div>
          <div><dt>Evidence route</dt><dd>${escapeHtml(action.evidenceNeeded)}</dd></div>
          <div><dt>Service route</dt><dd>${escapeHtml(action.serviceOption || "No service needed now")}</dd></div>
          <div><dt>What happens next</dt><dd>CMP updates the property file, readiness score and monitoring reminders.</dd></div>
        </dl>
        <div class="button-row">
          <button class="btn primary" type="button" id="resolveTopAction">Resolve this action</button>
          ${action.serviceOption ? '<button class="btn secondary" type="button" id="chooseServiceHelp">Choose service help</button>' : ""}
        </div>
      </article>
    `;

    $("#resolveTopAction").addEventListener("click", () => {
      if (action.linkedRecordId) openEvidenceDialog(action.linkedRecordId);
      else activateTabFromCode("monitoring");
    });

    const serviceButton = $("#chooseServiceHelp");
    if (serviceButton) serviceButton.addEventListener("click", () => activateTabFromCode("services"));
  }

  function renderPropertyServices(property) {
    const action = property.nextBestAction;
    const record = action.linkedRecordId ? data.getRecord(property, action.linkedRecordId) : null;
    const latestRequest = property.serviceRequests[0];
    $("#propertyServicesContent").innerHTML = `
      <article class="service-gap-card">
        <p class="eyebrow-text">Service help tied to this gap</p>
        <h3>${escapeHtml(action.serviceOption || "No service request needed")}</h3>
        <p>${escapeHtml(record ? record.title : "Monitoring")} · ${escapeHtml(action.reason)}</p>
        <div class="request-preview">
          <strong>Draft request preview</strong>
          <p>${escapeHtml((latestRequest && latestRequest.linkedActionId === action.id) ? latestRequest.preview : `${action.serviceOption || "Follow-up"} for ${property.address}. CMP will prepare text for the landlord to review.`)}</p>
        </div>
        <div class="status-strip">
          ${label(latestRequest ? latestRequest.status : "Service request drafted")}
          ${label("No supplier contacted")}
          ${label("No payment taken")}
        </div>
        <div class="button-row">
          <button class="btn primary" type="button" id="draftServiceRequest">Draft service request</button>
          <a class="btn secondary" href="services.html">Open service request page</a>
        </div>
      </article>
    `;

    $("#draftServiceRequest").addEventListener("click", () => {
      const active = getActiveOrExample();
      data.draftServiceRequest(active, active.nextBestAction.id);
      saveAndRender(active);
    });
  }

  function renderMonitoring(property) {
    const items = property.monitoringItems
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((item) => `
        <li class="timeline-item">
          <time>${formatDate(item.date)}</time>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.reason)}</p>
          </div>
          ${label(item.riskLevel)}
        </li>
      `)
      .join("");
    $("#monitoringItems").innerHTML = items || "<li>No monitoring items yet.</li>";
  }

  function openEvidenceDialog(recordId) {
    const property = getActiveOrExample();
    const record = data.getRecord(property, recordId);
    if (!record) return;
    $("#evidenceRecordId").value = record.id;
    $("#evidenceFileName").value = `${record.title} evidence.pdf`;
    $("#evidenceDialogTitle").textContent = `Add evidence for ${record.title}`;
    $("#evidenceDialog").showModal();
  }

  function initEvidenceDialog() {
    const dialog = $("#evidenceDialog");
    if (!dialog) return;

    $("#closeEvidenceDialog").addEventListener("click", () => dialog.close());
    $("#evidenceForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const property = getActiveOrExample();
      data.addEvidence(property, $("#evidenceRecordId").value, $("#evidenceFileName").value.trim());
      data.saveProperty(property);
      dialog.close();
      renderPropertyPage();
      $("#evidenceSuccess").hidden = false;
      window.setTimeout(() => {
        const success = $("#evidenceSuccess");
        if (success) success.hidden = true;
      }, 3500);
    });
  }

  function initAskCmp() {
    const drawer = $("#askCmpDrawer");
    if (!drawer) return;

    $("#openAskCmp").addEventListener("click", () => {
      drawer.hidden = false;
      drawer.setAttribute("aria-modal", "true");
      renderAskResponse("What should I fix first?");
      $("#closeAskCmp").focus();
    });

    $("#closeAskCmp").addEventListener("click", () => {
      drawer.hidden = true;
      $("#openAskCmp").focus();
    });

    $all("[data-ask-prompt]").forEach((button) => {
      button.addEventListener("click", () => renderAskResponse(button.dataset.askPrompt));
    });
  }

  function renderAskResponse(prompt) {
    const property = getActiveOrExample();
    const action = property.nextBestAction;
    const record = action.linkedRecordId ? data.getRecord(property, action.linkedRecordId) : null;
    const responses = {
      "What should I fix first?": `${action.title}. This is first because ${action.reason}`,
      "What evidence do I need?": action.evidenceNeeded,
      "Why is this the priority?": `${record ? record.title : "Monitoring"} is the highest current gap in CMP's priority order for this property.`,
      "What service should I request?": action.serviceOption ? `${action.serviceOption}, tied to ${record ? record.title : "the active gap"}. CMP prepares a draft only.` : "No service request is needed while monitoring is the next step.",
      "What should I monitor next?": property.monitoringItems[0] ? `${property.monitoringItems[0].title} on ${formatDate(property.monitoringItems[0].date)}.` : "Add evidence or draft a service request first, then CMP will create a reminder."
    };
    $("#askCmpResponse").textContent = responses[prompt] || responses["What should I fix first?"];
  }

  function renderServicesPage() {
    const property = getActiveOrExample();
    const action = property.nextBestAction;
    const record = action.linkedRecordId ? data.getRecord(property, action.linkedRecordId) : null;
    const requests = property.serviceRequests.map((request) => `
      <article class="request-card">
        <div>
          <p class="eyebrow-text">${escapeHtml(request.serviceType)}</p>
          <h3>${escapeHtml(request.status)}</h3>
          <p>${escapeHtml(request.preview)}</p>
        </div>
        <div class="status-strip">
          ${label(request.status)}
          ${label("No supplier contacted")}
          ${label("No payment taken")}
        </div>
      </article>
    `).join("");

    $("#serviceProperty").textContent = property.address;
    $("#serviceGap").textContent = record ? record.title : "Monitoring";
    $("#serviceType").textContent = action.serviceOption || "No service help needed now";
    $("#serviceReason").textContent = action.reason;
    $("#servicePreview").textContent = `${action.serviceOption || "Follow-up"} for ${property.address}. Gap: ${record ? record.title : "monitoring"}. CMP has prepared a draft only.`;
    $("#serviceHistory").innerHTML = requests || "<p>No service request has been drafted yet.</p>";

    $("#draftServiceFromPage").onclick = () => {
      const active = getActiveOrExample();
      data.draftServiceRequest(active, active.nextBestAction.id);
      saveAndRender(active);
    };
  }

  function renderMyPropertiesPage() {
    const store = data.loadStore();
    if (!store.properties.length) {
      data.ensureExampleProperty();
    }
    const refreshed = data.loadStore();
    const properties = refreshed.properties.map((property) => data.recalculateProperty(property));

    $("#propertiesList").innerHTML = properties.map((property) => `
      <article class="property-row-card">
        <div>
          <p class="eyebrow-text">Property needing attention</p>
          <h2>${escapeHtml(property.address)}</h2>
          <p>${escapeHtml(property.localAuthority)} · ${missingRecords(property).length} evidence gaps · ${property.monitoringItems.length} monitoring items</p>
        </div>
        <div class="property-row-metrics">
          <strong>${property.readinessScore}%</strong>
          <span>Readiness</span>
        </div>
        <div>
          <strong>${escapeHtml(property.nextBestAction.title)}</strong>
          <p>${escapeHtml(property.nextBestAction.reason)}</p>
        </div>
        <a class="btn primary" href="property.html" data-open-property="${escapeHtml(property.id)}">Open property</a>
      </article>
    `).join("");

    $all("[data-open-property]").forEach((link) => {
      link.addEventListener("click", () => {
        const storeNow = data.loadStore();
        storeNow.activePropertyId = link.dataset.openProperty;
        data.saveStore(storeNow);
      });
    });

    const comparison = $("#propertyComparison");
    if (comparison) {
      comparison.hidden = properties.length < 2;
      if (properties.length >= 2) {
        comparison.innerHTML = `
          <h2>Compare properties</h2>
          <div class="comparison-grid">
            ${properties.map((property) => `
              <div>
                <strong>${escapeHtml(property.address)}</strong>
                <span>${property.readinessScore}% ready</span>
              </div>
            `).join("")}
          </div>
        `;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    const page = document.body.dataset.page;
    if (page === "home") initIndexPage();
    if (page === "add-property") initAddPropertyPage();
    if (page === "property") {
      renderPropertyPage();
      initTabs();
      initEvidenceDialog();
      initAskCmp();
    }
    if (page === "services") renderServicesPage();
    if (page === "my-properties") renderMyPropertiesPage();
  });
})(window, document);
