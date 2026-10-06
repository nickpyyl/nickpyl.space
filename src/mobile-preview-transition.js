const scrollPositions = new Map();
const mediaSelector = 'video[data-active="true"], img[data-active="true"], video:not([data-active]), img:not([data-active])';

// Mobile Safari can resize/reposition native video snapshots mid-transition.
// Move the already-playing element in one fixed layer, using desktop timing.
export function startMobilePreviewTransition(section, updatePage) {
  const selector = `[data-shared-preview="${section}"]`;
  const source = document.querySelector(selector);
  const media = source?.querySelector(mediaSelector);
  const from = source?.getBoundingClientRect();
  if (!media || !from || from.right <= 0 || from.left >= innerWidth || from.bottom <= 0 || from.top >= innerHeight) return null;
  const width = media.videoWidth || media.naturalWidth;
  const height = media.videoHeight || media.naturalHeight;
  if (!width || !height) return null;
  const backup = document.createElement('canvas');
  backup.width = Math.min(width, 640);
  backup.height = Math.round(backup.width * height / width);
  try { backup.getContext('2d').drawImage(media, 0, 0, backup.width, backup.height); }
  catch { return null; }
  const frame = document.createElement('div');
  frame.className = 'preview-handoff-frame';
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, {
    position: 'fixed', inset: 'auto', left: `${from.left}px`, top: `${from.top}px`,
    width: `${from.width}px`, height: `${from.height}px`, zIndex: '100002',
    transformOrigin: '0 0', pointerEvents: 'none', overflow: 'hidden', borderRadius: '0',
  });
  const home = source.closest('.home-page');
  if (home) scrollPositions.set(section, home.scrollTop);
  const originalParent = media.parentNode;
  const originalSibling = media.nextSibling;
  const originalStyle = media.getAttribute('style');
  const originalLoop = media.loop;
  if (media.tagName === 'VIDEO') media.loop = true;
  const mediaStyle = { position: 'absolute', inset: '0', width: '100%', height: '100%',
    maxWidth: 'none', objectFit: 'cover', borderRadius: '0', transform: 'none' };
  Object.assign(backup.style, mediaStyle);
  Object.assign(media.style, mediaStyle, { opacity: '0' });
  frame.append(backup, media);
  document.body.append(frame);
  const animations = [];
  let destination, nextMedia, originalOpacity, presentationFrame, liveFrame, removalObserver, stopWaiting = () => {}, cancelled = false, removed = false;
  const removeFrame = () => {
    if (removed) return;
    removed = true;
    removalObserver?.disconnect();
    if (media.tagName === 'VIDEO') media.loop = originalLoop;
    if (liveFrame !== undefined) media.cancelVideoFrameCallback?.(liveFrame);
    if (originalStyle === null) media.removeAttribute('style');
    else media.setAttribute('style', originalStyle);
    if (originalParent?.isConnected) originalParent.insertBefore(media, originalSibling?.parentNode === originalParent ? originalSibling : null);
    else media.pause?.();
    frame.remove();
  };
  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(presentationFrame);
    stopWaiting();
    nextMedia?.removeAttribute('data-preview-buffering');
    for (const animation of animations) animation.cancel();
    if (destination) destination.style.opacity = originalOpacity;
    removeFrame();
  };
  // Defer the React update by a microtask so the caller can register this
  // transition before rendering the destination. No browser snapshot pause.
  const finished = Promise.resolve().then(async () => {
    if (cancelled || !updatePage()) { removeFrame(); return; }
    destination = document.querySelector(selector);
    if (!destination) { removeFrame(); return; }
    // A slow decoder may outlive the movement. Stop the borrowed video if
    // another navigation removes its destination before handoff completes.
    if (typeof MutationObserver !== 'undefined') {
      removalObserver = new MutationObserver(() => { if (!destination.isConnected) cancel(); });
      removalObserver.observe(document.body, { childList: true, subtree: true });
    }
    const destinationHome = destination.closest('.home-page');
    if (destinationHome) destinationHome.scrollTop = scrollPositions.get(section) ?? 0;
    const to = destination.getBoundingClientRect();
    originalOpacity = destination.style.opacity;
    destination.style.opacity = '0';
    nextMedia = destination.querySelector(mediaSelector);
    nextMedia?.setAttribute('data-preview-buffering', 'true');
    nextMedia?.pause?.();
    // React has now cleaned up the old page's playback controller. Resume the
    // same decoded video in the overlay; no new source or seek during movement.
    const revealLive = () => { if (!cancelled) media.style.opacity = '1'; };
    if (media.requestVideoFrameCallback) liveFrame = media.requestVideoFrameCallback(revealLive);
    else revealLive();
    media.play?.()?.catch(() => {});
    const motion = frame.animate([
      { transform: 'translate(0,0) scale(1,1)' },
      { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width},${to.height / from.height})` },
    ], { duration: 460, easing: 'cubic-bezier(.25,.75,.25,1)', fill: 'both' });
    animations.push(motion);
    const page = destination.closest('.selected-work-page') ?? destinationHome;
    let galleryIndex = 0;
    for (const element of page?.querySelectorAll(destinationHome
      ? '.home-intro > :not(.home-destinations), .home-destination'
      : '.work-intro, .work-piece:first-of-type figcaption, .work-piece:not(:first-of-type), .work-rail-end') ?? []) {
      if (element.contains(destination)) continue;
      const bounds = element.getBoundingClientRect();
      if (bounds.right <= 0 || bounds.left >= innerWidth || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
      const text = element.matches('.work-intro, .home-intro > :not(.home-destinations)');
      animations.push(element.animate(text
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, filter: 'blur(10px)' }, { opacity: .8, filter: 'blur(2px)', offset: .6 }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: text ? 380 : 320, delay: text ? 60 : 120 + Math.min(galleryIndex++, 4) * 35,
        easing: text ? 'cubic-bezier(.25,.1,.25,1)' : 'cubic-bezier(.22,1,.36,1)', fill: 'both' }));
    }
    await motion.finished.catch(() => {});
    if (cancelled) return;
    destination.style.opacity = originalOpacity;
    // Keep an undecoded video covered in the card itself. Navigation is never
    // held hostage by loading, and an unmounted card takes its cover with it.
    destination.append(frame);
    Object.assign(frame.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', transform: 'none', zIndex: '1' });
    motion.cancel();
    // A frame decoded while opacity was zero is not evidence that Safari has
    // repainted the visible video layer. Give it a paint, then request a fresh
    // presentation before removing the opaque cover.
    presentationFrame = requestAnimationFrame(() => {
      presentationFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        stopWaiting = coverUntilPresented(nextMedia, () => media.currentTime || 0, () => {
          if (cancelled) return;
          const handoff = frame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in-out', fill: 'both' });
          handoff.finished.catch(() => {}).finally(removeFrame);
        });
      });
    });
    await Promise.all(animations.slice(1).map(animation => animation.finished.catch(() => {})));
    for (const animation of animations) animation.cancel();
  });
  finished.catch(cancel);
  return { finished, skipTransition: cancel };
}

// A poster alone is insufficient on Safari once a video has begun seeking.
// Hold the bitmap until the compositor confirms a frame, without a short
// timeout that can expose a blank video on a slow phone.
export function coverUntilPresented(media, time, reveal, canReveal = () => true) {
  if (!media) return () => {};
  const isVideo = media.tagName !== 'IMG';
  if (isVideo) {
    media.setAttribute?.('data-preview-buffering', 'true');
    media.pause?.();
  }
  let callback, observer, disposed = false, started = false;
  const finish = () => {
    callback = undefined;
    if (disposed || !canReveal()) return;
    cleanup();
    reveal();
  };
  const present = () => {
    if (media.tagName === 'IMG') {
      if (media.complete && media.naturalWidth) finish();
      return;
    }
    if (disposed || media.seeking || media.readyState < 2) return;
    // The cover shows the captured timestamp. Do not let playback race ahead
    // behind it while the card moves, or revealing the video skips visibly.
    if (!canReveal()) return;
    media.removeAttribute?.('data-preview-buffering');
    if (media.requestVideoFrameCallback) {
      if (callback === undefined) callback = media.requestVideoFrameCallback(finish);
    } else finish();
    media.play()?.catch(() => {});
  };
  const start = () => {
    if (disposed || started || media.readyState < 1) return;
    started = true;
    if (Number.isFinite(media.duration) && media.duration > 0) {
      const target = (typeof time === 'function' ? time() : time) % media.duration;
      if (Math.abs(media.currentTime - target) > .025) media.currentTime = target;
    }
    present();
  };
  const cleanup = () => {
    disposed = true;
    media.removeAttribute?.('data-preview-buffering');
    if (callback !== undefined) media.cancelVideoFrameCallback?.(callback);
    observer?.disconnect();
    media.removeEventListener('loadedmetadata', start);
    media.removeEventListener('loadeddata', present);
    media.removeEventListener('seeked', present);
    media.removeEventListener('load', finish);
  };
  // If rotation replaces the active clip before a callback arrives, its
  // already-decoded successor must not stay hidden under the old cover.
  if (typeof MutationObserver !== 'undefined' && media.parentElement) {
    observer = new MutationObserver(() => {
      if (!media.isConnected || media.dataset.active === 'false') finish();
    });
    observer.observe(media.parentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-active'] });
  }
  if (media.tagName === 'IMG') {
    if (media.complete && media.naturalWidth) finish();
    else media.addEventListener('load', finish, { once: true });
  } else {
    media.addEventListener('loadedmetadata', start);
    media.addEventListener('loadeddata', present);
    media.addEventListener('seeked', present);
    start();
  }
  cleanup.checkPresentation = present;
  return cleanup;
}
