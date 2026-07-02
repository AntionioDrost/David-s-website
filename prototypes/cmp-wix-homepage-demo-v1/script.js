(function () {
  const body = document.body;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      body.classList.toggle("nav-open", !isOpen);
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        navToggle.setAttribute("aria-expanded", "false");
        body.classList.remove("nav-open");
      }
    });
  }

  const postcodeForm = document.querySelector("[data-postcode-form]");
  const postcodeResult = document.querySelector("[data-postcode-result]");

  if (postcodeForm && postcodeResult) {
    postcodeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const input = form.querySelector("input");
      const value = input ? input.value.trim().toUpperCase() : "";

      postcodeResult.classList.add("is-active");
      postcodeResult.textContent = value
        ? `Prototype state: ${value} would move into address selection and compliance prompts.`
        : "Prototype state: enter a postcode to preview the next address step.";
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-inspection-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-slide-dot]"));
  const prev = document.querySelector("[data-slide-prev]");
  const next = document.querySelector("[data-slide-next]");
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== currentSlide;
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
      dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
    });
  }

  if (slides.length) {
    prev?.addEventListener("click", () => showSlide(currentSlide - 1));
    next?.addEventListener("click", () => showSlide(currentSlide + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.getAttribute("data-slide-dot"));
        showSlide(Number.isNaN(index) ? 0 : index);
      });
    });
  }
})();
