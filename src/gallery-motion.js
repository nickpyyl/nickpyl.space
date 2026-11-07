export function wrapGalleryOffset(offset, cycleWidth) {
  if (cycleWidth <= 0) return 0;
  return ((offset % cycleWidth) + cycleWidth) % cycleWidth;
}

export function startGalleryDrift(rail, {
  cycleWidth,
  cycleStart = () => 0,
  loopWhilePaused = false,
  isPaused,
  onWrap,
  onManualScroll,
  speed = 16,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
}) {
  let frame;
  let previousTime;
  let position = rail.scrollLeft;
  let lastWritten = position;

  function tick(time) {
    const elapsed = previousTime === undefined ? 0 : Math.min(time - previousTime, 64);
    previousTime = time;
    // Keep fractional movement even on browsers that round native scroll offsets.
    if (Math.abs(rail.scrollLeft - lastWritten) > 1) {
      position = rail.scrollLeft;
      onManualScroll?.();
    }
    const paused = isPaused();
    if (!paused || loopWhilePaused) {
      const next = paused ? rail.scrollLeft : position + elapsed * speed / 1000;
      const width = cycleWidth();
      const start = cycleStart();
      position = wrapGalleryOffset(next - start, width) + start;
      const wrapped = width > 0 && (next < start || next >= start + width);
      if (wrapped) onWrap?.({ from: next, to: position });
      if (!paused || wrapped) rail.scrollLeft = position;
      lastWritten = rail.scrollLeft;
    } else {
      position = rail.scrollLeft;
      lastWritten = position;
    }
    frame = requestFrame(tick);
  }

  frame = requestFrame(tick);
  return () => cancelFrame(frame);
}
