(function () {
  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    show(0);
    play();
  }

  function setupGlobalSearch() {
    var input = document.getElementById("global-search");
    var panel = document.getElementById("search-panel");
    if (!input || !panel || typeof SiteMovieIndex === "undefined") {
      return;
    }
    function render(items) {
      if (!items.length) {
        panel.innerHTML = "";
        panel.classList.remove("is-open");
        return;
      }
      var root = document.body ? (document.body.getAttribute("data-root") || "") : "";
      panel.innerHTML = items.slice(0, 12).map(function (item) {
        return '<a class="search-result" href="' + root + item.url + '">' +
          '<img src="' + root + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + ' · ' + item.genre + '</span></span>' +
          '</a>';
      }).join("");
      panel.classList.add("is-open");
    }
    input.addEventListener("input", function () {
      var keyword = text(input.value);
      if (keyword.length < 1) {
        render([]);
        return;
      }
      var matched = SiteMovieIndex.filter(function (item) {
        return text(item.search).indexOf(keyword) !== -1;
      });
      render(matched);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      }
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-text]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length || (!input && !select)) {
      return;
    }
    function apply() {
      var keyword = input ? text(input.value) : "";
      var value = select ? text(select.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var data = text(card.getAttribute("data-card-text"));
        var okKeyword = !keyword || data.indexOf(keyword) !== -1;
        var okValue = !value || data.indexOf(value) !== -1;
        var ok = okKeyword && okValue;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupPageFilter();
  });
})();
