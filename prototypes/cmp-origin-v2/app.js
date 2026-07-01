const serviceDetails = {
  "Compliance Checker A-Z": {
    title: "Compliance Checker A-Z",
    body: "Start with a property check, see what records are missing, and choose the next practical service.",
  },
  "EPC Certificates": {
    title: "EPC Certificates",
    body: "Check EPC evidence, renewal timing and rating-improvement notes before the file becomes urgent.",
  },
  "Gas Safety": {
    title: "Gas Safety",
    body: "Keep gas safety certificates, renewal dates and booking notes together in the property file.",
  },
  EICR: {
    title: "EICR",
    body: "Track the electrical report, remedial notes and review timing in one clear place.",
  },
  "Property Inspections": {
    title: "Property Inspections",
    body: "Record visits, condition notes, photos and follow-up actions so the evidence is easier to find.",
  },
  "AML Checks": {
    title: "AML Checks",
    body: "Prepare identity and ownership records for property transactions and service requests.",
  },
  "Selective Licensing": {
    title: "Selective Licensing",
    body: "Organise licence evidence, council notes and review questions before asking for support.",
  },
  "Possession & Eviction Preparation": {
    title: "Possession & Eviction Preparation",
    body: "Gather tenancy records, certificates and communication evidence before notices or advisor review.",
  },
};

const sampleAddresses = [
  "Flat 2, 18 Victoria Street, Birmingham B1 1AA",
  "24 Station Road, Marston Green, Birmingham B37 7BA",
  "Apartment 6, 41 Highfield Avenue, Solihull B91 3QD",
];

const landlordUpdates = [
  "Renters' reform watch: keep evidence and notices organised.",
  "EPC planning: know what expires before it becomes urgent.",
  "Damp and mould: record repairs, inspections and tenant reports clearly.",
  "Licensing checks: confirm local rules before advertising a property.",
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showPropertiesPanel() {
  const panel = document.querySelector("#properties-panel");
  if (!panel) return;
  panel.hidden = false;
  const closeButton = panel.querySelector("[data-close-properties]");
  closeButton?.focus();
}

function hidePropertiesPanel() {
  const panel = document.querySelector("#properties-panel");
  if (!panel) return;
  panel.hidden = true;
}

function renderAddressResults(postcode) {
  const panel = document.querySelector("#address-panel");
  if (!panel) return;

  const cleanPostcode = escapeHtml(postcode.trim() || "your postcode");
  panel.hidden = false;
  panel.classList.remove("is-address-selected");
  panel.innerHTML = `
    <strong>Sample addresses for ${cleanPostcode.toUpperCase()}</strong>
    <p>Prototype results only. Choose one to continue the homepage flow.</p>
    <div class="address-options">
      ${sampleAddresses
        .map(
          (address) => `
            <button type="button" data-address="${escapeHtml(address)}">
              ${escapeHtml(address)}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSelectedService(serviceName) {
  const panel = document.querySelector("#selected-service");
  if (!panel) return;

  const service = serviceDetails[serviceName] || serviceDetails["Compliance Checker A-Z"];
  panel.hidden = false;
  panel.innerHTML = `
    <div class="selected-service-inner">
      <div>
        <p class="eyebrow">SELECTED SERVICE</p>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.body)}</p>
      </div>
      <div class="selected-service-actions">
        <button class="button button-primary" type="button" data-scroll="#postcode">Check a property first</button>
        <button class="button button-secondary" type="button" data-open-properties>Save for My Properties</button>
      </div>
    </div>
  `;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function initUpdatesTicker() {
  const headline = document.querySelector("[data-update-headline]");
  const prev = document.querySelector("[data-update-prev]");
  const next = document.querySelector("[data-update-next]");
  if (!headline || !prev || !next) return;

  let index = 0;
  const render = () => {
    headline.textContent = landlordUpdates[index];
  };

  prev.addEventListener("click", () => {
    index = (index - 1 + landlordUpdates.length) % landlordUpdates.length;
    render();
  });

  next.addEventListener("click", () => {
    index = (index + 1) % landlordUpdates.length;
    render();
  });
}

function initInspectionCarousel() {
  const carousel = document.querySelector("[data-inspection-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const dots = [...carousel.querySelectorAll("[data-inspection-dot]")];
  const prev = carousel.querySelector("[data-inspection-prev]");
  const next = carousel.querySelector("[data-inspection-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;

  const render = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  };

  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    if (reducedMotion || timer) return;
    timer = window.setInterval(() => render(index + 1), 5200);
  };

  prev?.addEventListener("click", () => {
    stop();
    render(index - 1);
    start();
  });

  next?.addEventListener("click", () => {
    stop();
    render(index + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stop();
      render(Number(dot.dataset.inspectionDot));
      start();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);

  render(0);
  start();
}

document.addEventListener("click", (event) => {
  const scrollButton = event.target.closest("[data-scroll]");
  if (scrollButton) {
    event.preventDefault();
    scrollToTarget(scrollButton.dataset.scroll);
  }

  const serviceButton = event.target.closest("[data-service]");
  if (serviceButton) {
    event.preventDefault();
    document
      .querySelectorAll(".service-card.is-selected")
      .forEach((card) => card.classList.remove("is-selected"));
    serviceButton.closest(".service-card")?.classList.add("is-selected");
    renderSelectedService(serviceButton.dataset.service);
  }

  if (event.target.closest("[data-open-properties]")) {
    event.preventDefault();
    showPropertiesPanel();
  }

  if (event.target.closest("[data-close-properties]")) {
    event.preventDefault();
    hidePropertiesPanel();
  }

  const addressButton = event.target.closest("[data-address]");
  if (addressButton) {
    event.preventDefault();
    const panel = document.querySelector("#address-panel");
    if (!panel) return;
    panel.classList.add("is-address-selected");
    panel.innerHTML = `
      <strong>${escapeHtml(addressButton.dataset.address || "")}</strong>
      <p>This fictional address is selected for the prototype. Next, choose one service or keep building the compliance picture.</p>
      <div class="selected-service-actions">
        <button class="button button-primary" type="button" data-scroll="#services">View services</button>
        <button class="button button-secondary" type="button" data-open-properties>Save to My Properties</button>
      </div>
    `;
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "postcode-form") return;
  event.preventDefault();
  const input = event.target.querySelector("#postcode-input");
  renderAddressResults(input?.value || "");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hidePropertiesPanel();
  }
});

initUpdatesTicker();
initInspectionCarousel();
