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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".journey-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".journey-tab").forEach((tab) => {
        tab.classList.toggle("is-active", tab === button);
      });
      renderJourney(button.dataset.journey);
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
