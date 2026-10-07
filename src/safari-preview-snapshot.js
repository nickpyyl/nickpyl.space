import { coverUntilPresented } from './mobile-preview-transition.js';

export function needsSafariPreviewSnapshot(navigator = globalThis.navigator) {
  return /Apple/.test(navigator?.vendor ?? '') && /Safari\//.test(navigator?.userAgent ?? '') && !/CriOS|FxiOS|EdgiOS/.test(navigator?.userAgent ?? '');
}

// Keep desktop geometry/easing, but render the playing video into a canvas.
// Safari snapshots this live surface without moving its native video layer.
export function createSafariPreviewSnapshot(source, canvas, sourceMedia) {
  const sourceOpacity = source.style.opacity;
  const liveVideo = sourceMedia?.tagName === 'VIDEO' ? sourceMedia : null;
  const originalParent = liveVideo?.parentNode;
  const originalSibling = liveVideo?.nextSibling;
  const originalStyle = liveVideo?.getAttribute('style');
  const originalLoop = liveVideo?.loop;
  const originalAriaHidden = liveVideo?.getAttribute('aria-hidden');
  let videoFrame, fallbackFrame, removed = false;
  const context = liveVideo ? canvas.getContext('2d') : null;
  const paintVideo = () => {
    if (removed) return;
    if (liveVideo.readyState >= 2) context.drawImage(liveVideo, 0, 0, canvas.width, canvas.height);
    if (liveVideo.requestVideoFrameCallback) videoFrame = liveVideo.requestVideoFrameCallback(paintVideo);
    else fallbackFrame = requestAnimationFrame(paintVideo);
  };
  let destination, destinationOpacity, stopWaiting, observer, bufferedMedia, paintFrame, cancelled = false;
  const place = element => {
    const rect = element.getBoundingClientRect();
    Object.assign(canvas.style, {
      position: 'fixed', inset: 'auto', left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width ?? rect.right - rect.left}px`, height: `${rect.height ?? rect.bottom - rect.top}px`,
      zIndex: '100002', pointerEvents: 'none', viewTransitionName: 'section-preview',
    });
  };
  canvas.setAttribute('aria-hidden', 'true');
  place(source);
  document.body.append(canvas);
  source.style.opacity = '0';
  if (liveVideo) {
    // Keep the same decoder alive when React removes the old page. The video
    // is a frame source only; it never participates in the browser snapshots.
    Object.assign(liveVideo.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
    liveVideo.loop = true;
    liveVideo.setAttribute('aria-hidden', 'true');
    document.body.append(liveVideo);
  }
  const remove = () => {
    if (removed) return;
    removed = true;
    if (videoFrame !== undefined) liveVideo.cancelVideoFrameCallback(videoFrame);
    if (fallbackFrame !== undefined) cancelAnimationFrame(fallbackFrame);
    if (liveVideo) {
      liveVideo.loop = originalLoop;
      if (originalAriaHidden === null) liveVideo.removeAttribute('aria-hidden');
      else liveVideo.setAttribute('aria-hidden', originalAriaHidden);
      if (originalStyle === null) liveVideo.removeAttribute('style');
      else liveVideo.setAttribute('style', originalStyle);
      if (originalParent?.isConnected) originalParent.insertBefore(liveVideo, originalSibling?.parentNode === originalParent ? originalSibling : null);
      else { liveVideo.pause(); liveVideo.remove(); }
    }
    if (paintFrame !== undefined) cancelAnimationFrame(paintFrame);
    stopWaiting?.();
    bufferedMedia?.removeAttribute('data-preview-buffering');
    observer?.disconnect();
    canvas.remove();
  };
  return {
    stage(target, media) {
      bufferedMedia = media;
      media?.setAttribute('data-preview-buffering', 'true');
      media?.pause?.();
      destination = target;
      destinationOpacity = target.style.opacity;
      target.style.opacity = '0';
      place(target);
      if (liveVideo) {
        // The outgoing React playback controller has now been disposed.
        liveVideo.play()?.catch(() => {});
        paintVideo();
      }
    },
    finish(media, time) {
      if (cancelled) return;
      source.style.opacity = sourceOpacity;
      if (!destination?.isConnected) { remove(); return; }
      // Leave the cover in the real card after the native animation ends.
      // A loading/seek timeout must never expose an unpainted video surface.
      canvas.style.removeProperty('view-transition-name');
      Object.assign(canvas.style, { position: 'absolute', inset: '0', left: '0', top: '0', width: '100%', height: '100%', zIndex: '1' });
      destination.append(canvas);
      destination.style.opacity = destinationOpacity;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => { if (!destination.isConnected) remove(); });
        observer.observe(document.body, { childList: true, subtree: true });
      }
      paintFrame = requestAnimationFrame(() => {
        paintFrame = requestAnimationFrame(() => {
          if (!cancelled) stopWaiting = coverUntilPresented(media, liveVideo ? () => liveVideo.currentTime : time, remove);
        });
      });
    },
    cancel() {
      cancelled = true;
      source.style.opacity = sourceOpacity;
      if (destination) destination.style.opacity = destinationOpacity;
      remove();
    },
  };
}
