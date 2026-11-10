import { getMediaSource } from "./media-preload.js";

const playbackControllers = new Set();
export function refreshVideoPlayback() {
  for (const sync of playbackControllers) sync();
}

// Loading can run ahead of the horizontal rail, but playback is limited to the
// actual viewport. Keep the chosen source stable when the cache finishes later.
export function observeWorkVideo(video, src, { priority = false, poster, sourceFor = getMediaSource } = {}) {
  let visible = false;
  let nearby = false;
  let loaded = false;
  let loadObserver;
  let visibilityObserver;
  const touch = window.matchMedia?.("(pointer: coarse)").matches;
  const playbackThreshold = touch ? 0.25 : 0.01;
  const gallery = video.closest(".portfolio-gallery");

  function load() {
    if (loaded) return;
    loaded = true;
    video.preload = "auto";
    video.src = sourceFor(src);
    loadObserver?.disconnect();
  }

  function syncPlayback() {
    if (poster && (visible || nearby) && !video.hasAttribute("poster")) video.poster = poster;
    if (poster && gallery?.dataset.browsing === "true" && !video.controls) {
      if (!video.paused) video.pause();
      return;
    }
    if (nearby && !document.hidden && !video.closest("[inert]")) load();
    if (video.dataset?.previewBuffering !== "true" && !document.hidden && !video.closest("[inert]") && (visible || video.closest(".media-viewer"))) {
      load();
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }

  playbackControllers.add(syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
  video.addEventListener("loadeddata", syncPlayback);
  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && (entry.intersectionRatio ?? 1) >= playbackThreshold;
      syncPlayback();
    }, { threshold: playbackThreshold });
    visibilityObserver.observe(video);

    if (!priority) {
      loadObserver = new IntersectionObserver(([entry]) => {
        nearby = entry.isIntersecting;
        syncPlayback();
      }, { root: video.closest(".work-rail"), rootMargin: touch ? "0px 160px" : "360px 600px", threshold: 0 });
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
