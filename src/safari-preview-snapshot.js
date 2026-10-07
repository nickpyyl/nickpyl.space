import { coverUntilPresented } from './mobile-preview-transition.js';

export function needsSafariPreviewSnapshot(navigator = globalThis.navigator) {
  return /Apple/.test(navigator?.vendor ?? '') && /Safari\//.test(navigator?.userAgent ?? '') && !/CriOS|FxiOS|EdgiOS/.test(navigator?.userAgent ?? '');
}

// Borrow the existing video in one directly animated DOM layer. No native
// view snapshots, new decoder, or per-frame video-to-canvas readback.
export function createSafariPreviewSnapshot(source, canvas, sourceMedia) {
  const layer = document.createElement('div');
  layer.className = 'preview-handoff-frame';
  layer.setAttribute('aria-hidden', 'true');
  const sourceOpacity = source.style.opacity;
  const liveVideo = sourceMedia?.tagName === 'VIDEO' ? sourceMedia : null;
  const originalParent = liveVideo?.parentNode;
  const originalSibling = liveVideo?.nextSibling;
  const originalStyle = liveVideo?.getAttribute('style');
  const originalLoop = liveVideo?.loop;
  const originalAriaHidden = liveVideo?.getAttribute('aria-hidden');
  let destination, destinationOpacity, stopWaiting, observer, bufferedMedia, paintFrame, videoFrame, fade;
  let cancelled = false, removed = false;
  const place = element => {
    const rect = element.getBoundingClientRect();
    Object.assign(layer.style, {
      position: 'fixed', inset: 'auto', left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width ?? rect.right - rect.left}px`, height: `${rect.height ?? rect.bottom - rect.top}px`,
      zIndex: '100002', pointerEvents: 'none', transformOrigin: '0 0', overflow: 'hidden',
    });
  };
  const mediaStyle = { position: 'absolute', inset: '0', width: '100%', height: '100%',
    maxWidth: 'none', objectFit: 'cover', borderRadius: '0', transform: 'none' };
  Object.assign(canvas.style, mediaStyle);
  layer.append(canvas);
  place(source);
  document.body.append(layer);
  source.style.opacity = '0';
  if (liveVideo) {
    Object.assign(liveVideo.style, mediaStyle, { opacity: '0' });
    liveVideo.loop = true;
    liveVideo.setAttribute('aria-hidden', 'true');
    layer.append(liveVideo);
  }
  const remove = () => {
    if (removed) return;
    removed = true;
    if (videoFrame !== undefined) liveVideo.cancelVideoFrameCallback(videoFrame);
    if (paintFrame !== undefined) cancelAnimationFrame(paintFrame);
    fade?.cancel();
    stopWaiting?.();
    bufferedMedia?.removeAttribute('data-preview-buffering');
    observer?.disconnect();
    if (liveVideo) {
      liveVideo.loop = originalLoop;
      if (originalAriaHidden === null) liveVideo.removeAttribute('aria-hidden');
      else liveVideo.setAttribute('aria-hidden', originalAriaHidden);
      if (originalStyle === null) liveVideo.removeAttribute('style');
      else liveVideo.setAttribute('style', originalStyle);
      if (originalParent?.isConnected) originalParent.insertBefore(liveVideo, originalSibling?.parentNode === originalParent ? originalSibling : null);
      else liveVideo.pause();
    }
    layer.remove();
  };
  return {
    layer,
    stage(target, media) {
      bufferedMedia = media;
      media?.setAttribute('data-preview-buffering', 'true');
      media?.pause?.();
      destination = target;
      destinationOpacity = target.style.opacity;
      target.style.opacity = '0';
      place(target);
      if (liveVideo) {
        const reveal = () => { if (!removed) liveVideo.style.opacity = '1'; };
        if (liveVideo.requestVideoFrameCallback) videoFrame = liveVideo.requestVideoFrameCallback(reveal);
        else reveal();
        liveVideo.play()?.catch(() => {});
      }
    },
    finish(media, time) {
      if (cancelled) return;
      source.style.opacity = sourceOpacity;
      if (!destination?.isConnected) { remove(); return; }
      Object.assign(layer.style, { position: 'absolute', inset: '0', left: '0', top: '0', width: '100%', height: '100%', zIndex: '1', transform: 'none' });
      destination.append(layer);
      destination.style.opacity = destinationOpacity;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => { if (!destination.isConnected) remove(); });
        observer.observe(document.body, { childList: true, subtree: true });
      }
      paintFrame = requestAnimationFrame(() => {
        paintFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          stopWaiting = coverUntilPresented(media, liveVideo ? () => liveVideo.currentTime : time, () => {
            if (removed) return;
            fade = layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease', fill: 'both' });
            fade.finished.catch(() => {}).finally(remove);
          });
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
