export function wrapGalleryOffset(offset, cycleWidth) {
  if (cycleWidth <= 0) return 0;
  return ((offset % cycleWidth) + cycleWidth) % cycleWidth;
}

export function createLoopingTrack(track, { width, initialOffset = 0, reducedMotion = false, speed = 16, onWrap }) {
  let cycle = width;
  let position = cycle + initialOffset;
  let animation;
  let wrapTimer;

  const transform = offset => `translate3d(${-offset}px, 0, 0)`;
  const getPosition = () => animation
    ? cycle + wrapGalleryOffset(Number(animation.currentTime || 0) * speed / 1000, cycle)
    : position;

  function pause() {
    clearTimeout(wrapTimer);
    position = getPosition();
    animation?.cancel();
    animation = undefined;
    track.style.transform = transform(position);
  }

  function setPosition(next, wrap = false) {
    pause();
    position = wrap ? cycle + wrapGalleryOffset(next - cycle, cycle) : next;
    track.style.transform = transform(position);
  }

  function resume() {
    if (animation || reducedMotion || cycle <= 0) return;
    position = cycle + wrapGalleryOffset(position - cycle, cycle);
    track.style.transform = transform(position);
    animation = track.animate([
      { transform: transform(cycle) },
      { transform: transform(cycle * 2) },
    ], { duration: cycle / speed * 1000, iterations: Infinity, easing: "linear" });
    animation.currentTime = (position - cycle) / speed * 1000;
    if (onWrap) {
      const duration = cycle / speed * 1000;
      const repeat = () => {
        onWrap();
        wrapTimer = setTimeout(repeat, duration);
      };
      wrapTimer = setTimeout(repeat, duration - Number(animation.currentTime));
    }
  }

  function resize(nextWidth) {
    const relative = cycle > 0 ? getPosition() / cycle : 1;
    pause();
    cycle = nextWidth;
    setPosition(relative * cycle, true);
  }

  setPosition(position);
  return { getPosition, setPosition, pause, resume, resize, destroy() {
    clearTimeout(wrapTimer);
    animation?.cancel();
    track.style.removeProperty("transform");
  } };
}
