import { wrapGalleryOffset } from "./gallery-motion.js";

export function createLoopingTrack(track, { width, initialOffset = 0, reducedMotion = false, speed = 16 }) {
  let cycle = width;
  let position = cycle + initialOffset;
  let animation;

  const transform = offset => `translate3d(${-offset}px, 0, 0)`;
  const getPosition = () => animation
    ? cycle + wrapGalleryOffset(Number(animation.currentTime || 0) * speed / 1000, cycle)
    : position;

  function pause() {
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
  }

  function resize(nextWidth) {
    const relative = cycle > 0 ? getPosition() / cycle : 1;
    pause();
    cycle = nextWidth;
    setPosition(relative * cycle, true);
  }

  setPosition(position);
  return { getPosition, setPosition, pause, resume, resize, destroy() {
    animation?.cancel();
    track.style.removeProperty("transform");
  } };
}

export function createMobileGalleryMotion(rail, sequence, { reducedMotion, progress, onInteract }) {
  const track = rail.querySelector('.gallery-track');
  const page = rail.closest('.portfolio-page');
  const gallery = rail.closest('.portfolio-gallery');
  let width = sequence.getBoundingClientRect().width;
  const loop = createLoopingTrack(track, {
    width,
    initialOffset: progress === undefined
      ? reducedMotion ? 0 : sequence.offsetHeight * .6 + parseFloat(getComputedStyle(track).paddingLeft)
      : width * (progress - 1),
    reducedMotion,
  });
  const paused = new Set();
  let gesture;
  let frame;
  let timer;
  let skipClick = false;

  function sync() {
    if (paused.size || document.hidden) loop.pause();
    else loop.resume();
  }

  function setPaused(reason, value) {
    if (value) paused.add(reason);
    else paused.delete(reason);
    sync();
  }

  function stopMomentum() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    paused.delete('momentum');
    paused.delete('wheel');
  }

  function pointerdown(event) {
    if (gesture && gesture.id !== event.pointerId) {
      gesture = undefined;
      delete gallery.dataset.dragging;
      skipClick = true;
      setPaused('pointer', false);
      return;
    }
    if (event.button !== 0 || event.target.closest('video[controls], input, textarea, select')) return;
    stopMomentum();
    skipClick = false;
    setPaused('focus', false);
    setPaused('pointer', true);
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, velocity: 0, axis: null };
  }

  function pointermove(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = gesture.x - event.clientX;
    const dy = gesture.y - event.clientY;
    if (!gesture.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      gallery.dataset.dragging = 'true';
      onInteract();
      page.setPointerCapture(event.pointerId);
    }
    const delta = gesture.axis === 'x' ? dx : dy;
    const elapsed = Math.max(8, event.timeStamp - gesture.time);
    gesture.velocity = gesture.velocity * .35 + Math.max(-2, Math.min(2, delta / elapsed)) * .65;
    loop.setPosition(loop.getPosition() + delta, true);
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    gesture.time = event.timeStamp;
  }

  function finish(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const moved = Boolean(gesture.axis);
    let velocity = event.timeStamp - gesture.time < 100 ? gesture.velocity : 0;
    gesture = undefined;
    skipClick = moved;
    delete gallery.dataset.dragging;
    if (page.hasPointerCapture(event.pointerId)) page.releasePointerCapture(event.pointerId);
    if (moved && !reducedMotion && event.type !== 'pointercancel' && Math.abs(velocity) > .02) {
      paused.add('momentum');
      let previous;
      function coast(time) {
        const elapsed = previous === undefined ? 0 : Math.min(time - previous, 32);
        previous = time;
        loop.setPosition(loop.getPosition() + velocity * elapsed, true);
        velocity *= Math.exp(-elapsed / 180);
        if (Math.abs(velocity) > .02) frame = requestAnimationFrame(coast);
        else setPaused('momentum', false);
      }
      frame = requestAnimationFrame(coast);
    }
    setPaused('pointer', false);
  }

  function wheel(event) {
    if (event.ctrlKey) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    stopMomentum();
    setPaused('wheel', true);
    onInteract();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
    loop.setPosition(loop.getPosition() + delta * unit, true);
    timer = setTimeout(() => setPaused('wheel', false), 100);
  }

  function click(event) {
    if (!skipClick) return;
    event.preventDefault();
    event.stopPropagation();
    skipClick = false;
  }

  function visibility() {
    if (document.hidden) {
      gesture = undefined;
      delete gallery.dataset.dragging;
      paused.delete('pointer');
      stopMomentum();
    }
    sync();
  }

  const resize = new ResizeObserver(() => {
    const nextWidth = sequence.getBoundingClientRect().width;
    if (Math.abs(nextWidth - width) < .1) return;
    width = nextWidth;
    loop.resize(width);
    sync();
  });
  resize.observe(sequence);
  page.addEventListener('pointerdown', pointerdown);
  page.addEventListener('pointermove', pointermove);
  page.addEventListener('pointerup', finish);
  page.addEventListener('pointercancel', finish);
  page.addEventListener('wheel', wheel, { passive: false });
  page.addEventListener('click', click, true);
  document.addEventListener('visibilitychange', visibility);
  sync();

  return { getPosition: loop.getPosition, getProgress: () => loop.getPosition() / width, setPosition: loop.setPosition, setPaused, destroy() {
    stopMomentum();
    resize.disconnect();
    page.removeEventListener('pointerdown', pointerdown);
    page.removeEventListener('pointermove', pointermove);
    page.removeEventListener('pointerup', finish);
    page.removeEventListener('pointercancel', finish);
    page.removeEventListener('wheel', wheel);
    page.removeEventListener('click', click, true);
    document.removeEventListener('visibilitychange', visibility);
    delete gallery.dataset.dragging;
    loop.destroy();
  } };
}
