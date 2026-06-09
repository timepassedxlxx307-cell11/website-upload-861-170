(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll(".stream-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var streamUrl = player.getAttribute("data-stream");
      var hlsInstance = null;

      function attachStream() {
        if (!video || !streamUrl || video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.setAttribute("data-ready", "1");
      }

      function play() {
        attachStream();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (video) {
          video.controls = true;
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {
              video.controls = true;
            });
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.getAttribute("data-ready") !== "1") {
            play();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
