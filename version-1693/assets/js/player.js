function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var button = document.getElementById("start-play");
  var hlsInstance = null;
  var ready = false;

  function attach() {
    if (!video || ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function hideButton() {
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  function start() {
    attach();
    hideButton();

    if (video) {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }
  }

  attach();

  if (button) {
    button.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
