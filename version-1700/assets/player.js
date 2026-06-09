(function () {
    window.initMoviePlayer = function (sourceUrl) {
        document.addEventListener('DOMContentLoaded', function () {
            var video = document.getElementById('videoPlayer');
            var shell = document.getElementById('videoShell');
            var button = document.getElementById('playButton');
            var loaded = false;
            var hls = null;

            function bindStream() {
                if (!video || loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }

            function startVideo() {
                if (!video) {
                    return;
                }
                bindStream();
                if (shell) {
                    shell.classList.add('is-playing');
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    startVideo();
                });
            }

            if (shell) {
                shell.addEventListener('click', function (event) {
                    if (event.target === shell || event.target === video) {
                        startVideo();
                    }
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    if (shell) {
                        shell.classList.add('is-playing');
                    }
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
            }
        });
    };
})();
