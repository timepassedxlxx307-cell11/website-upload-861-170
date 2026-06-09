(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        mobileMenu.hidden = expanded;
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      show(0);
      start();
    });

    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
      var input = panel.querySelector("[data-local-search]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var grid = document.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var activeGenre = "";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" "));
          var genre = card.getAttribute("data-genre") || "";
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedGenre = !activeGenre || genre.indexOf(activeGenre) !== -1;
          card.hidden = !(matchedQuery && matchedGenre);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeGenre = button.getAttribute("data-filter-value") || "";
          apply();
        });
      });
    });

    if (window.SITE_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var form = document.querySelector("[data-search-form]");
      var input = form ? form.querySelector("input[name='q']") : null;
      var title = document.querySelector("[data-search-title]");
      var results = document.querySelector("[data-search-results]");

      if (input) {
        input.value = q;
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
          "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\">",
          "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
          "<span class=\"poster-glow\"></span>",
          "</a>",
          "<div class=\"movie-card-body\">",
          "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
          "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
          "<p>" + escapeHtml(movie.intro) + "</p>",
          "<div class=\"tag-row\">" + tags + "</div>",
          "<a class=\"watch-link\" href=\"" + escapeHtml(movie.url) + "\">立即观看</a>",
          "</div>",
          "</article>"
        ].join("");
      }

      function render() {
        if (!results) {
          return;
        }
        var query = q.toLowerCase().trim();
        var pool = window.SITE_MOVIES.filter(function (movie) {
          if (!query) {
            return movie.featured;
          }
          var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.intro].join(" ").toLowerCase();
          return text.indexOf(query) !== -1;
        }).slice(0, 120);
        if (title) {
          title.textContent = query ? "搜索结果" : "推荐影片";
        }
        results.innerHTML = pool.length ? pool.map(card).join("") : "<p>没有找到相关影片。</p>";
      }

      render();
    }
  });
})();
