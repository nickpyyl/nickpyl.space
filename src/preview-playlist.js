export function nextPreview(clips, src) {
  const index = clips.findIndex(clip => clip.src === src);
  return clips[(index + 1) % clips.length];
}

// Safari keeps the decoded active video in its existing DOM slot when the
// buffered successor is promoted; only the other slot receives a new source.
export function stablePreviewSlots(previous, active, next) {
  if (active.src === next.src) return [active];
  return previous.findIndex(item => item.src === active.src) === 1 ? [next, active] : [active, next];
}

// Keep every gallery item, including stills, and preserve the remaining order.
export function promotePreview(media, src) {
  const index = media.findIndex(item => item.src === src);
  return index > 0 ? [media[index], ...media.slice(0, index), ...media.slice(index + 1)] : media;
}

// Keep the current media visible until the buffered successor is ready.
// Videos finish naturally; still images stay for their configured duration.
export function connectPreviewPlayback(video, next, { canCycle, onAdvance, durationMs = 4000 }) {
  const cyclingAllowed = () => typeof canCycle === 'function' ? canCycle() : canCycle;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, disposed = false, pending = false;
  let frame, timer, holdTimer;
  const isImage = video.tagName === 'IMG';
  const nextIsImage = next?.tagName === 'IMG';
  let elapsed = false;
  const ready = media => media?.tagName === 'IMG' ? media.complete && media.naturalWidth > 0 : media?.readyState >= 2;
  const playable = () => video.dataset?.previewBuffering !== 'true' && visible && !document.hidden && !motion.matches;
  function cancelPending() {
    if (frame !== undefined) next?.cancelVideoFrameCallback?.(frame);
    clearTimeout(timer);
    frame = undefined; pending = false;
    next?.pause?.();
  }
  function advance() {
    if (!next || !cyclingAllowed() || !(isImage ? elapsed : video.ended) || !playable() || pending || !ready(next)) return;
    pending = true;
    const reveal = () => {
      if (disposed || !pending) return;
      clearTimeout(timer);frame = undefined;
      if (!playable() || !onAdvance()) cancelPending();
    };
    if (nextIsImage) { reveal(); return; }
    // Keep the outgoing last frame if decoding stalls or autoplay is denied.
    timer = setTimeout(cancelPending, 1000);
    if (next.requestVideoFrameCallback) frame = next.requestVideoFrameCallback(reveal);
    next.play()?.then(() => {
      if (!next.requestVideoFrameCallback) reveal();
    }).catch(() => { if (!disposed) cancelPending(); });
  }
  function sync() {
    if (!playable() || (!cyclingAllowed() && isImage)) {
      video.pause?.(); cancelPending(); clearTimeout(holdTimer); holdTimer = undefined;
    } else if (isImage) {
      if (elapsed) advance();
      else if (ready(video) && holdTimer === undefined) holdTimer = setTimeout(() => { elapsed = true; advance(); }, durationMs);
    } else if (video.ended) advance();
    else video.play()?.catch(() => {});
  }
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;sync();
  });
  observer?.observe(video);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  video.addEventListener('canplay', sync);
  video.addEventListener('load', sync);
  video.addEventListener('ended', advance);
  next?.addEventListener('canplay', advance);
  next?.addEventListener('load', advance);
  next?.addEventListener('error', cancelPending);
  sync();
  const stop = () => {
    disposed = true;cancelPending();clearTimeout(holdTimer);video.pause?.();observer?.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    video.removeEventListener('canplay', sync);
    video.removeEventListener('load', sync);
    video.removeEventListener('ended', advance);
    next?.removeEventListener('canplay', advance);
    next?.removeEventListener('load', advance);
    next?.removeEventListener('error', cancelPending);
  };
  stop.sync = sync;
  return stop;
}
