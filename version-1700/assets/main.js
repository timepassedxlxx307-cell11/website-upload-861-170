(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var heroIndex = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === heroIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === heroIndex);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showHero(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function currentQuery() {
            var values = searchInputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean);
            return values.join(' ');
        }

        function currentFilter(name) {
            var field = filters.find(function (item) {
                return item.getAttribute('data-filter') === name;
            });
            return field ? field.value.trim() : '';
        }

        function filterCards() {
            var query = currentQuery();
            var type = currentFilter('type');
            var region = currentFilter('region');
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matchQuery = !query || query.split(/\s+/).every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
                var matchType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
                var matchRegion = !region || cardRegion.indexOf(region) !== -1 || haystack.indexOf(region.toLowerCase()) !== -1;
                card.style.display = matchQuery && matchType && matchRegion ? '' : 'none';
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', filterCards);
        });

        filters.forEach(function (field) {
            field.addEventListener('change', filterCards);
        });
    });
})();
