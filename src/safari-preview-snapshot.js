import { coverUntilPresented } from './mobile-preview-transition.js';

export function needsSafariPreviewSnapshot(navigator = globalThis.navigator) {
  return /Apple/.test(navigator?.vendor ?? '') && /Safari\//.test(navigator?.userAgent ?? '') && !/CriOS|FxiOS|EdgiOS/.test(navigator?.userAgent ?? '');
}

// Keep native desktop geometry/easing, but snapshot only a bitmap. Safari's
// video compositor must not become part of either shared snapshot.
export function createSafariPreviewSnapshot(source, canvas) {
  const sourceOpacity = source.style.opacity;
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
  const remove = () => {
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
          if (!cancelled) stopWaiting = coverUntilPresented(media, time, remove);
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
