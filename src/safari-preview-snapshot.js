import { coverUntilPresented } from './mobile-preview-transition.js';
import { alignSafariVideo } from './safari-video-handoff.js';

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
  let destination, destinationOpacity, stopWaiting, stopAligning, observer, bufferedMedia, bufferedLoop, paintFrame, videoFrame, fade;
  let cancelled = false, removed = false;
  const followDestination = () => {
    if (destination?.isConnected) place(destination);
    else remove();
  };
  const place = element => {
    const rect = element.getBoundingClientRect();
    const aspect = canvas.width && canvas.height ? canvas.width / canvas.height : rect.width / rect.height;
    const width = Math.max(rect.width, rect.height * aspect);
    const height = Math.max(rect.height, rect.width / aspect);
    const insetX = (width - rect.width) / 2, insetY = (height - rect.height) / 2;
    Object.assign(layer.style, {
      position: 'fixed', inset: 'auto', left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${width}px`, height: `${height}px`,
      transform: `translate(${-insetX}px,${-insetY}px) scale(1)`, clipPath: `inset(${insetY}px ${insetX}px)`,
      zIndex: '100002', pointerEvents: 'none', transformOrigin: '0 0', overflow: 'hidden',
      willChange: 'transform, clip-path',
    });
    return { left: rect.left, top: rect.top, width, height };
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
    stopAligning?.();
    bufferedMedia?.removeAttribute('data-preview-buffering');
    if (bufferedMedia?.tagName === 'VIDEO') bufferedMedia.loop = bufferedLoop;
    observer?.disconnect();
    globalThis.removeEventListener?.('scroll', followDestination, true);
    globalThis.removeEventListener?.('resize', followDestination);
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
      bufferedLoop = media?.loop;
      // A clip ending during the handoff must not rotate out from under its
      // live cover before the two playback surfaces have been aligned.
      if (media?.tagName === 'VIDEO') media.loop = true;
      media?.setAttribute('data-preview-buffering', 'true');
      media?.pause?.();
      destination = target;
      destinationOpacity = target.style.opacity;
      target.style.opacity = '0';
      const base = place(target);
      if (liveVideo) {
        const reveal = () => { if (!removed) liveVideo.style.opacity = '1'; };
        if (liveVideo.requestVideoFrameCallback) videoFrame = liveVideo.requestVideoFrameCallback(reveal);
        else reveal();
        liveVideo.play()?.catch(() => {});
      }
      return base;
    },
    finish(media, time) {
      if (cancelled) return;
      source.style.opacity = sourceOpacity;
      if (!destination?.isConnected) { remove(); return; }
      // Keep the same parent and border-box geometry through the crossfade.
      // Reparenting into a bordered home card shrinks the cover by two pixels
      // and can make WebKit rebuild its video compositing surface.
      globalThis.addEventListener?.('scroll', followDestination, true);
      globalThis.addEventListener?.('resize', followDestination);
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
            const reveal = () => {
              if (removed) return;
              fade = layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 80, easing: 'ease', fill: 'both' });
              fade.finished.catch(() => {}).finally(remove);
            };
            if (liveVideo && media.tagName === 'VIDEO') stopAligning = alignSafariVideo(liveVideo, media, reveal);
            else reveal();
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
