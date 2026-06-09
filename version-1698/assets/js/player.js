(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback);
    document.head.appendChild(script);
  }

  function setupPlayer(card) {
    var video = card.querySelector("video");
    var button = card.querySelector("[data-play-button]");
    var status = card.querySelector("[data-player-status]");
    var source = card.getAttribute("data-video-src");
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          setStatus("请再次点击播放");
        });
      }
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放源正在重连");
            try {
              hlsInstance.recoverMediaError();
            } catch (error) {
              setStatus("请刷新后重试");
            }
          }
        });
      } else {
        video.src = source;
        playVideo();
      }
    }

    function start() {
      if (!source) {
        return;
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      setStatus("");
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
      } else {
        loadHls(attachWithHls);
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!initialized || video.paused) {
        start();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
}());
