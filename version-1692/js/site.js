(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHero() {
        var wrap = document.querySelector('[data-hero]');
        if (!wrap) {
            return;
        }
        var slides = Array.prototype.slice.call(wrap.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(wrap.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var input = document.querySelector('.filter-input');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
        if (!input && !buttons.length) {
            return;
        }
        var current = 'all';
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var region = card.getAttribute('data-region') || '';
                var year = card.getAttribute('data-year') || '';
                var matchText = !keyword || search.indexOf(keyword) !== -1;
                var matchFilter = current === 'all' || region === current || year === current || search.indexOf(current.toLowerCase()) !== -1;
                card.classList.toggle('hidden-card', !(matchText && matchFilter));
            });
        }
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                input.value = query;
            }
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                current = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayer() {
        var video = document.querySelector('.video-player');
        var overlay = document.querySelector('.player-overlay');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var box = video.closest('.player-box');
        var hlsInstance = null;
        function attach() {
            if (!stream) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
            } else if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
        }
        function play() {
            attach();
            if (box) {
                box.classList.add('playing');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('playing');
            }
        });
        if (overlay) {
            overlay.addEventListener('click', play);
        }
    }

    function setupImages() {
        Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
        setupImages();
    });
})();
