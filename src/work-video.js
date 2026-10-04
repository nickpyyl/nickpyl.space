import { getMediaSource } from "./media-preload.js";

const playbackControllers = new Set();
export function refreshVideoPlayback() {
  for (const sync of playbackControllers) sync();
}

// Loading can run ahead of the horizontal rail, but playback is limited to the
// actual viewport. Keep the chosen source stable when the cache finishes later.
export function observeWorkVideo(video, src, { priority = false, sourceFor = getMediaSource } = {}) {
  let visible = false;
  let loaded = false;
  let loadObserver;
  let visibilityObserver;

  function load() {
    if (loaded) return;
    loaded = true;
    video.preload = "auto";
    video.src = sourceFor(src);
    loadObserver?.disconnect();
  }

  function syncPlayback() {
    if (!document.hidden && !video.closest("[inert]") && (visible || video.closest(".media-viewer"))) {
      load();
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  playbackControllers.add(syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
  video.addEventListener("loadeddata", syncPlayback);
  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.01 });
    visibilityObserver.observe(video);

    if (!priority) {
      loadObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) load();
      }, { root: video.closest(".work-rail"), rootMargin: "360px 600px", threshold: 0 });
      loadObserver.observe(video);
    }
  } else {
    visible = true;
  }
  if (priority) load();
  syncPlayback();

  return () => {
    playbackControllers.delete(syncPlayback);
    loadObserver?.disconnect();
    visibilityObserver?.disconnect();
    document.removeEventListener("visibilitychange", syncPlayback);
    video.removeEventListener("loadeddata", syncPlayback);
    video.pause();
  };
}
