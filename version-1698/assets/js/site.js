(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getBase() {
    return document.body.getAttribute("data-base") || "./";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function searchItems(query, limit) {
    var q = normalize(query);
    if (!q || !window.MovieSearchIndex) {
      return [];
    }
    var results = [];
    for (var i = 0; i < window.MovieSearchIndex.length; i += 1) {
      var item = window.MovieSearchIndex[i];
      var hay = normalize(item.title + " " + item.meta + " " + item.tags);
      if (hay.indexOf(q) !== -1) {
        results.push(item);
      }
      if (results.length >= limit) {
        break;
      }
    }
    return results;
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function renderSuggest(box, items) {
    var base = getBase();
    if (!box) {
      return;
    }
    if (!items.length) {
      box.innerHTML = "";
      box.classList.remove("open");
      return;
    }
    box.innerHTML = items.map(function (item) {
      return "<a href=\"" + base + item.url + "\"><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.meta) + "</span></a>";
    }).join("");
    box.classList.add("open");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var results = form.querySelector("[data-search-results]");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        renderSuggest(results, searchItems(input.value, 10));
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (!query) {
          input.focus();
          return;
        }
        window.location.href = getBase() + "search.html?q=" + encodeURIComponent(query);
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target) && results) {
          results.classList.remove("open");
        }
      });
    });
  }

  function setupSearchPage() {
    var holder = document.querySelector("[data-search-page-results]");
    if (!holder) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector(".search-page-form [data-search-input]");
    if (input) {
      input.value = query;
    }
    if (!query) {
      holder.innerHTML = "<div class=\"empty-state\">输入关键词即可检索片库内容。</div>";
      return;
    }
    var items = searchItems(query, 80);
    var base = getBase();
    if (!items.length) {
      holder.innerHTML = "<div class=\"empty-state\">未找到匹配内容，请尝试更换关键词。</div>";
      return;
    }
    holder.innerHTML = items.map(function (item) {
      return "<a class=\"search-result-card\" href=\"" + base + item.url + "\"><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.meta) + "</span><em>" + escapeHtml(item.tags) + "</em></a>";
    }).join("");
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-page-filter]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    function apply() {
      var q = normalize(input ? input.value : "");
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter-select")] = select.value;
      });
      cards.forEach(function (card) {
        var hay = normalize(card.innerText + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-category"));
        var ok = !q || hay.indexOf(q) !== -1;
        Object.keys(filters).forEach(function (key) {
          var val = filters[key];
          if (val && String(card.getAttribute("data-" + key)) !== val) {
            ok = false;
          }
        });
        card.classList.toggle("hidden-by-filter", !ok);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function setupImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupSearchPage();
    setupFilters();
    setupImages();
  });
}());
