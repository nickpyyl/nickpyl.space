const homeScrollPositions = new Map();

// Share only the selected clip; the rest of each page retains its blur/fade.
export function startPreviewTransition(section, updatePage) {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const selector = `[data-shared-preview="${section}"]`;
  const source = document.querySelector(selector);
  const video = source?.querySelector('video[data-active="true"], img[data-active="true"], video:not([data-active]), img:not([data-active])');
  const rect = source?.getBoundingClientRect();
  if (!video || (video.tagName === 'IMG' ? !video.complete || !video.naturalWidth : video.readyState < 2) || !rect || rect.right <= 0 || rect.left >= innerWidth || rect.bottom <= 0 || rect.top >= innerHeight) return null;
  // A partly scrolled-off card produces a clipped snapshot that stretches
  // on its way home. Use the normal fade when the full card is not visible.
  const viewport = globalThis.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const right = left + (viewport?.width ?? innerWidth);
  const bottom = top + (viewport?.height ?? innerHeight);
  if (rect.left < left - 1 || rect.top < top - 1 || rect.right > right + 1 || rect.bottom > bottom + 1) return null;

  const time = video.currentTime ?? 0;
  const startedAt = performance.now();
  const frame = captureFrame(video);
  const poster = frame.poster;
  // Give the outgoing snapshot a painted frame even if unmounting the
  // video releases its compositor surface (most noticeable on return).
  if (frame.canvas) source.append(frame.canvas);
  const sourceHome = source.closest(".home-page");
  const returningHome = !sourceHome;
  if (sourceHome) homeScrollPositions.set(section, sourceHome.scrollTop);
  let destination;
  let cancelled = false;
  let cleaned = false;
  const revealElements = [];
  let revealStyles;
  source.style.viewTransitionName = "section-preview";
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    frame.canvas?.remove();
    source.style.removeProperty("view-transition-name");
    destination?.style.removeProperty("view-transition-name");
    for (const element of revealElements) element.style.removeProperty("view-transition-name");
    revealStyles?.remove();
    document.documentElement.removeAttribute("data-preview-ready");
  };
  document.documentElement.dataset.previewReady = "false";
  const transition = document.startViewTransition(() => {
    if (cancelled || !updatePage()) return;
    destination = document.querySelector(selector);
    if (!destination) return;
    const home = destination.closest(".home-page");
    if (home) home.scrollTop = homeScrollPositions.get(section) ?? 0;
    destination.style.viewTransitionName = "section-preview";
    const nextVideo = destination.querySelector('video[data-active="true"], img[data-active="true"], video:not([data-active]), img:not([data-active])');
    if (!nextVideo) return;
    // Start movement immediately. Keep the captured frame visible while the
    // destination decodes, rather than freezing the whole old page to wait.
    if (poster && nextVideo.tagName !== "IMG") nextVideo.poster = poster;
    prepareVideo(nextVideo, time, startedAt, () => cancelled).then(ready => {
      if (cancelled || cleaned || !ready) return;
      document.documentElement.dataset.previewReady = "true";
    }).catch(() => {});
    const page = destination.closest(".selected-work-page") ?? home;
    if (page) {
      // Keep text on one calm fade; only stagger the gallery. Separate
      // paragraph blurs make the copy appear to blink as it sharpens.
      const candidates = page.querySelectorAll(returningHome
        ? ".home-intro > :not(.home-destinations), .home-destination"
        : ".work-intro, .work-piece:first-of-type figcaption, .work-piece:not(:first-of-type), .work-rail-end");
      const rules = [];
      let galleryIndex = 0;
      for (const element of candidates) {
        // Do not snapshot an ancestor of the video that is already shared.
        if (element.contains(destination)) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.right <= 0 || bounds.left >= innerWidth || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
        const index = revealElements.length;
        const name = `preview-reveal-${index}`;
        element.style.viewTransitionName = name;
        revealElements.push(element);
        const isText = element.matches(".work-intro, .home-intro > :not(.home-destinations)");
        const delay = isText ? 160 : 240 + Math.min(galleryIndex++, 4) * 45;
        const animation = isText ? "preview-text-in 380ms cubic-bezier(.25,.1,.25,1)" : "preview-content-in 320ms cubic-bezier(.22,1,.36,1)";
        rules.push(`::view-transition-new(${name}) { mix-blend-mode:normal; animation:${animation} ${delay}ms both; }`);
      }
      revealStyles = document.createElement("style");
      revealStyles.textContent = rules.join("\n");
      document.head.append(revealStyles);
    }
  });
  transition.ready.catch(() => {});
  transition.finished.catch(() => {}).finally(cleanup);
  return { finished: transition.finished, skipTransition() { cancelled = true; transition.skipTransition(); cleanup(); } };
}

function captureFrame(video) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(video.videoWidth || video.naturalWidth, 640);
    canvas.height = Math.round(canvas.width * (video.videoHeight || video.naturalHeight) / (video.videoWidth || video.naturalWidth));
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.className = "preview-handoff-frame";
    return { poster: canvas.toDataURL("image/jpeg", .85), canvas };
  } catch {
    return { poster: video.poster || "" };
  }
}

async function prepareVideo(video, time, startedAt, isCancelled) {
  if (video.tagName === "IMG") {
    if (!video.complete) await waitForVideo(video, "load", 350);
    return !isCancelled() && video.complete && video.naturalWidth > 0;
  }
  if (video.readyState < 2) await waitForVideo(video, "loadeddata", 350);
  if (isCancelled() || video.readyState < 2) return false;
  if (Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = (time + (performance.now() - startedAt) / 1000) % video.duration;
    if (video.seeking) await waitForVideo(video, "seeked", 120);
  }
  if (isCancelled() || video.seeking || video.readyState < 2) return false;
  // loadeddata/seeked can precede presentation by a frame. Do not expose
  // the destination video until its decoded frame reaches the compositor.
  const presented = await waitForPresentedFrame(video);
  return presented && !isCancelled();
}

function waitForPresentedFrame(video) {
  if (!video.requestVideoFrameCallback) return Promise.resolve(true);
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      video.cancelVideoFrameCallback(callback);
      resolve(false);
    }, 180);
    const callback = video.requestVideoFrameCallback(() => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

function waitForVideo(video, event, timeout) {
  return new Promise(resolve => {
    const finish = () => {
      clearTimeout(timer);
      video.removeEventListener(event, finish);
      video.removeEventListener("error", finish);
      resolve();
    };
    const timer = setTimeout(finish, timeout);
    video.addEventListener(event, finish, { once: true });
    video.addEventListener("error", finish, { once: true });
  });
}
