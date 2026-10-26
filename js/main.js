document.addEventListener("DOMContentLoaded", () => {
  // Adds a subtle reveal effect to cards as they enter the viewport.
  const cards = document.querySelectorAll(".info-card, .term-card, .lesson-placeholder");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach((card) => card.classList.add("is-visible"));
  }

  // Lesson search filters visible lesson cards by their text.
  const search = document.querySelector("#lessonSearch");
  if (search) {
    const cards = document.querySelectorAll("[data-lesson-card]");
    const status = document.querySelector("#lessonSearchStatus");
    const emptyMessage = document.querySelector("#lessonSearchEmpty");

    search.addEventListener("input", () => {
      const term = search.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        card.hidden = !card.textContent.toLowerCase().includes(term);
        if (!card.hidden) visibleCount += 1;
      });

      document.querySelectorAll(".lesson-group").forEach((group) => {
        group.hidden = !group.querySelector("[data-lesson-card]:not([hidden])");
      });

      if (emptyMessage) emptyMessage.hidden = !term || visibleCount > 0;

      if (status) {
        status.textContent = term ? `${visibleCount} resulta sa paghahanap.` : "";
      }
    });
  }
});
