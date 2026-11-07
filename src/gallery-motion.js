export function wrapGalleryOffset(offset, cycleWidth) {
  if (cycleWidth <= 0) return 0;
  return ((offset % cycleWidth) + cycleWidth) % cycleWidth;
}

export function startGalleryDrift(rail, {
  cycleWidth,
  isPaused,
  onWrap,
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
    if (Math.abs(rail.scrollLeft - lastWritten) > 1) position = rail.scrollLeft;
    if (!isPaused()) {
      const next = position + elapsed * speed / 1000;
      const width = cycleWidth();
      position = wrapGalleryOffset(next, width);
      if (width > 0 && next >= width) onWrap?.();
      rail.scrollLeft = position;
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
