(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var sliders = document.querySelectorAll("[data-hero-slider]");
        sliders.forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

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

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });
            show(0);
            restart();
        });

        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        var activeType = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
        }

        function queryText() {
            return normalize(inputs.map(function (input) {
                return input.value;
            }).join(" "));
        }

        function runFilter() {
            if (!cards.length) {
                return;
            }
            var query = queryText();
            var visible = 0;
            cards.forEach(function (card) {
                var type = normalize(card.getAttribute("data-type"));
                var matchesType = activeType === "all" || type.indexOf(activeType) !== -1;
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matched = matchesType && matchesQuery;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", runFilter);
        });
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = normalize(button.getAttribute("data-filter"));
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                runFilter();
            });
        });
    });

    window.initVideoPlayer = function (streamUrl) {
        var video = document.querySelector("[data-video-player]");
        var overlay = document.querySelector("[data-player-overlay]");
        var playButton = document.querySelector("[data-player-start]");
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            loadVideo();
            if (overlay) {
                overlay.hidden = true;
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("play", function () {
            loadVideo();
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
