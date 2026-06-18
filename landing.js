const journeyContent = {
  check: {
    label: "Compliance check journey",
    title: '"Am I compliant?" becomes a scored action plan.',
    copy: "CMP guides the landlord through EPC, gas, electrical, alarms, tenancy documents, deposit protection, licensing, and inspections, then shows risk and next steps.",
    bullets: ["Compliance score and risk level", "Missing evidence and expiry warnings", "Property-specific services to book"]
  },
  service: {
    label: "Service booking journey",
    title: '"I need a certificate" still builds the property record.',
    copy: "A landlord can book an EPC, Gas Safety Certificate, EICR, or inspection quickly, while CMP saves the address, dates, evidence, and future renewal logic.",
    bullets: ["Fast service route", "Saved property history", "Renewal reminders created"]
  },
  possession: {
    label: "Possession readiness journey",
    title: '"I need to serve notice" starts with evidence strength.',
    copy: "CMP can flag missing EPC, Gas Safety, deposit, tenancy, and served-document evidence before the landlord moves further into possession preparation.",
    bullets: ["Evidence pack review", "Risk-sensitive wording", "Specialist service recommendation"]
  },
  portfolio: {
    label: "Portfolio management journey",
    title: '"Which property needs attention today?" becomes obvious.',
    copy: "Portfolio landlords see which properties are safe, which are missing evidence, which have upcoming renewals, and where paid services are likely needed next.",
    bullets: ["Property-by-property risk", "Renewal calendar", "Bulk evidence visibility"]
  }
};

const serviceEntryRoutes = {
  epc: "epcs.html",
  gas: "gas-safety.html",
  eicr: "eicr.html",
  inspection: "property-inspections.html",
  licensing: "selective-licensing.html",
  eviction: "evictions-possession.html",
  possession_preparation: "possession-eviction-preparation.html",
  mould: "mould-damp.html",
  aml: "aml-checks.html",
  rent_guarantee: "rent-guarantee.html",
  insurance: "landlord-insurance.html",
  mortgage: "mortgages.html"
};

function temporaryJourneyDestination(element) {
  const entryService = element.dataset.journeyEntryService || "full_compliance";
  const focusMode = element.dataset.journeyFocusMode || "full_compliance";
  if (focusMode === "service_only" && serviceEntryRoutes[entryService]) {
    return serviceEntryRoutes[entryService];
  }
  if (entryService === "portfolio") {
    return "my-properties.html";
  }
  return "add-property.html";
}

function renderJourney(id) {
  const content = journeyContent[id] || journeyContent.check;
  const output = document.querySelector("#journeyOutput");
  if (!output) return;

  output.innerHTML = `
    <span class="mini-label">${content.label}</span>
    <h3>${content.title}</h3>
    <p>${content.copy}</p>
    <ul>
      ${content.bullets.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function wireJourneyEntryPoints() {
  document.querySelectorAll("[data-journey-entry-service]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (!window.CMPJourney?.setEntry) return;
      window.CMPJourney.setEntry({
        entryService: element.dataset.journeyEntryService || "full_compliance",
        focusMode: element.dataset.journeyFocusMode || "full_compliance",
        sourceRoute: `${window.location.pathname.split("/").pop() || "index.html"}${window.location.hash}`
      });
      if (window.CMP_DEMO_MODE !== false && element.tagName === "A") {
        event.preventDefault();
        window.location.href = temporaryJourneyDestination(element);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".journey-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".journey-tab").forEach((tab) => {
        tab.classList.toggle("is-active", tab === button);
      });
      renderJourney(button.dataset.journey);
    });
  });

  wireJourneyEntryPoints();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
