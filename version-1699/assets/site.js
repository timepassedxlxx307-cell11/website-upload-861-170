(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var heroSearch = document.querySelector('[data-hero-search]');

  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
    });
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterPanel && filterList) {
    var searchInput = filterPanel.querySelector('[data-filter-input]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var noResults = document.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function matchCard(card) {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var text = card.getAttribute('data-search') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';

      if (query && text.indexOf(query) === -1) {
        return false;
      }

      if (region && cardRegion !== region) {
        return false;
      }

      if (type && cardType !== type) {
        return false;
      }

      if (year && cardYear !== year) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var visible = 0;

      cards.forEach(function (card) {
        var matched = matchCard(card);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');

    if (!video || !overlay) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var initialized = false;

    function startVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function initializePlayer() {
      if (!stream) {
        return;
      }

      overlay.classList.add('is-hidden');

      if (initialized) {
        startVideo();
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', startVideo, { once: true });
      } else {
        video.src = stream;
        startVideo();
      }
    }

    overlay.addEventListener('click', initializePlayer);
    video.addEventListener('click', function () {
      if (!initialized) {
        initializePlayer();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);

  Array.prototype.slice.call(document.querySelectorAll('[data-share]')).forEach(function (button) {
    button.addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
    });
  });
})();
