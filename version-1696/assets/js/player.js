function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (!video || prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!prepared && video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (hlsInstance && hlsInstance.stopLoad) {
        hlsInstance.stopLoad();
      }
    });
  }
}
