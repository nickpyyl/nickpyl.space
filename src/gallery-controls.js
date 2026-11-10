import { createLoopingTrack } from "./gallery-motion.js";

export function createGalleryMotion(rail, sequence, { reducedMotion, simple = false, progress, onInteract }) {
  const track = rail.querySelector('.gallery-track');
  const gallery = rail.closest('.portfolio-gallery');
  const page = rail.closest('.portfolio-page');
  const wheelTarget = simple ? rail : page;
  let width = sequence.getBoundingClientRect().width;
  const loop = createLoopingTrack(track, {
    width,
    initialOffset: progress === undefined
      ? reducedMotion ? 0 : sequence.offsetHeight * .6 + parseFloat(getComputedStyle(track).paddingLeft)
      : width * (progress - 1),
    reducedMotion,
    onWrap: () => {
      const copies = sequence.nextElementSibling.querySelectorAll('video');
      sequence.querySelectorAll('video').forEach((video, index) => {
        const copy = copies[index];
        if (!copy.paused && copy.readyState >= 2 && video.readyState >= 1) video.currentTime = copy.currentTime;
      });
    },
  });
  const paused = new Set();
  let gesture;
  let frame;
  let wheelGesture;
  let skipClick = false;

  function sync() {
    if (paused.size || document.hidden) loop.pause();
    else loop.resume();
  }

  function setPaused(reason, value) {
    if (value && (reason === 'focus' || reason === 'selected')) stopMomentum();
    if (value) paused.add(reason);
    else paused.delete(reason);
    sync();
  }

  function stopMomentum() {
    cancelAnimationFrame(frame);
    if (wheelGesture) {
      wheelGesture = undefined;
      delete gallery.dataset.scrolling;
    }
    paused.delete('momentum');
    paused.delete('wheel');
  }

  function pointerdown(event) {
    if (gesture && gesture.id !== event.pointerId) {
      if (rail.hasPointerCapture(gesture.id)) rail.releasePointerCapture(gesture.id);
      gesture = undefined;
      delete gallery.dataset.dragging;
      skipClick = true;
      setPaused('pointer', false);
      return;
    }
    if (event.button !== 0 || event.target.closest('a, video[controls], input, textarea, select')) return;
    if (event.pointerType === 'mouse') event.preventDefault();
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
      gesture.axis = !simple || Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      gallery.dataset.dragging = 'true';
      onInteract();
      rail.setPointerCapture(event.pointerId);
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
    if (event.type === 'lostpointercapture' && event.target !== rail) return;
    if (!gesture || gesture.id !== event.pointerId) return;
    const moved = Boolean(gesture.axis);
    let velocity = event.timeStamp - gesture.time < 100 ? gesture.velocity : 0;
    gesture = undefined;
    skipClick = moved;
    delete gallery.dataset.dragging;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (moved && !reducedMotion && event.type === 'pointerup' && Math.abs(velocity) > .02) {
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

  function paintWheel(time) {
    const elapsed = Math.max(0, time - wheelGesture.lastFrame);
    const remaining = wheelGesture.delta;
    // WebKit can deliver trackpad deltas in bursts. Keep their full distance
    // and spread it over display frames, including during native momentum.
    const step = reducedMotion || Math.abs(remaining) < .25
      ? remaining : remaining * -Math.expm1(-elapsed / 26);
    if (step) loop.setPosition(loop.getPosition() + step, true);
    wheelGesture.delta -= step;
    wheelGesture.lastFrame = time;
    if (wheelGesture.delta || time - wheelGesture.lastInput < 100) {
      frame = requestAnimationFrame(paintWheel);
    } else {
      wheelGesture = undefined;
      delete gallery.dataset.scrolling;
      setPaused('wheel', false);
    }
  }

  function wheel(event) {
    if (event.ctrlKey || gesture) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    if (!wheelGesture) {
      stopMomentum();
      wheelGesture = { delta: 0, lastFrame: now, lastInput: now, scrollPage: !simple && page.scrollHeight > window.innerHeight };
      gallery.dataset.scrolling = 'true';
      setPaused('wheel', true);
      onInteract();
      frame = requestAnimationFrame(paintWheel);
    }
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
    if (wheelGesture.scrollPage && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      window.scrollBy({ top: event.deltaY * unit, behavior: 'instant' });
    }
    wheelGesture.delta += delta * unit;
    wheelGesture.lastInput = now;
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
  rail.addEventListener('pointerdown', pointerdown);
  rail.addEventListener('pointermove', pointermove);
  rail.addEventListener('pointerup', finish);
  rail.addEventListener('pointercancel', finish);
  rail.addEventListener('lostpointercapture', finish);
  wheelTarget.addEventListener('wheel', wheel, { passive: false });
  rail.addEventListener('click', click, true);
  document.addEventListener('visibilitychange', visibility);
  sync();

  return { getPosition: loop.getPosition, getProgress: () => loop.getPosition() / width, setPosition: loop.setPosition, setPaused, destroy() {
    stopMomentum();
    resize.disconnect();
    rail.removeEventListener('pointerdown', pointerdown);
    rail.removeEventListener('pointermove', pointermove);
    rail.removeEventListener('pointerup', finish);
    rail.removeEventListener('pointercancel', finish);
    rail.removeEventListener('lostpointercapture', finish);
    wheelTarget.removeEventListener('wheel', wheel);
    rail.removeEventListener('click', click, true);
    document.removeEventListener('visibilitychange', visibility);
    delete gallery.dataset.dragging;
    loop.destroy();
  } };
}
