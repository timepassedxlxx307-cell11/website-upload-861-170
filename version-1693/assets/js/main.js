document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-slider-prev]");
    var next = slider.querySelector("[data-slider-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  var pageSearch = document.querySelector("[data-page-search]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var list = document.querySelector("[data-filter-list]");
  var emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards() {
    if (!list) {
      return;
    }

    var query = normalize(pageSearch ? pageSearch.value : "");
    var typeValue = typeFilter ? typeFilter.value : "";
    var yearValue = yearFilter ? yearFilter.value : "";
    var visibleCount = 0;

    list.querySelectorAll(".movie-card").forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
      var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
      var visible = matchesQuery && matchesType && matchesYear;

      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (pageSearch || typeFilter || yearFilter) {
    [pageSearch, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && pageSearch) {
      pageSearch.value = q;
    }

    filterCards();
  }
});
