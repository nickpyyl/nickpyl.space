import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalleryMotion } from './gallery-controls.js';

function fakeTrack() {
  const animations = [];
  const track = {
    style: { removeProperty(key) { delete this[key]; } },
    animate(keyframes, options) {
      const animation = { currentTime: 0, cancelled: false, cancel() { this.cancelled = true; } };
      animations.push({ animation, keyframes, options });
      return animation;
    },
  };
  return { track, animations };
}

function controls(t, { simple = true, reducedMotion = true } = {}) {
  const listeners = new Map();
  const pageListeners = new Map();
  const captures = new Set();
  const page = {
    addEventListener(type, handler) { pageListeners.set(type, handler); },
    removeEventListener(type) { pageListeners.delete(type); },
  };
  const { track, animations } = fakeTrack();
  const gallery = { dataset: {} };
  const rail = {
    clientWidth: 393, querySelector: () => track,
    closest: selector => selector === '.portfolio-page' ? page : selector === '.portfolio-gallery' ? gallery : null,
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type) { listeners.delete(type); },
    setPointerCapture(id) { captures.add(id); },
    hasPointerCapture(id) { return captures.has(id); },
    releasePointerCapture(id) { captures.delete(id); },
  };
  const sequence = { offsetHeight: 180, getBoundingClientRect: () => ({ width: 1000 }) };
  let now = 0;
  let nextId = 0;
  const frames = new Map();
  function tick(ms = 16) {
    now += ms;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(now));
  }
  const globals = {
    document: { hidden: false, addEventListener() {}, removeEventListener() {} },
    getComputedStyle: () => ({ paddingLeft: '20px' }),
    ResizeObserver: class { observe() {} disconnect() {} },
    performance: { now: () => now },
    requestAnimationFrame(callback) { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const restore = [];
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    restore.push(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  let interactions = 0;
  const motion = createGalleryMotion(rail, sequence, { reducedMotion, simple, onInteract: () => { interactions++; } });
  t.after(() => {
    motion.destroy();
    restore.forEach(reset => reset());
  });
  const pointer = (type, x, y, time, id = 1) => listeners.get(type)({
    type, pointerId: id, clientX: x, clientY: y, timeStamp: time, button: 0, target: rail,
  });
  return { motion, listeners, pageListeners, captures, gallery, pointer, tick, frames, animations, interactions: () => interactions };
}

test('vertical and horizontal gallery gestures move the line and suppress accidental taps', t => {
  const { motion, listeners, pointer, interactions } = controls(t);
  pointer('pointerdown', 200, 500, 0);
  pointer('pointermove', 200, 400, 100);
  pointer('pointerup', 200, 400, 110);
  assert.equal(motion.getPosition(), 1100);
  pointer('pointerdown', 200, 400, 200);
  pointer('pointermove', 120, 405, 300);
  pointer('pointerup', 120, 405, 310);
  assert.equal(motion.getPosition(), 1180);
  assert.equal(interactions(), 2);
  let prevented = false;
  listeners.get('click')({ preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true);
});

test('downward wheel input moves horizontally while pinch gestures release capture', t => {
  const { motion, listeners, pointer, gallery, captures, tick } = controls(t);
  let prevented = false;
  listeners.get('wheel')({ deltaX: 0, deltaY: 120, deltaMode: 0, preventDefault() { prevented = true; } });
  tick();
  assert.equal(motion.getPosition(), 1120);
  assert.equal(prevented, true);
  listeners.get('wheel')({ ctrlKey: true, deltaY: 120, preventDefault() { assert.fail('pinch zoom must remain available'); } });
  pointer('pointerdown', 200, 400, 0);
  pointer('pointermove', 150, 400, 100);
  const beforePinch = motion.getPosition();
  pointer('pointerdown', 250, 400, 110, 2);
  pointer('pointermove', 100, 400, 120);
  assert.equal(motion.getPosition(), beforePinch);
  assert.equal(gallery.dataset.dragging, undefined);
  assert.equal(captures.size, 0);
});

test('gestures outside the gallery stay with the browser and never capture the page', t => {
  const { motion, pageListeners, interactions } = controls(t);
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'click']) {
    assert.equal(pageListeners.has(type), false, `${type} must not be intercepted on the page`);
  }
  assert.equal(motion.getPosition(), 1000);
  assert.equal(interactions(), 0);
});

test('browser cancellation and lost capture stop a drag without retaining the pointer', t => {
  const { motion, pointer, gallery, captures } = controls(t);
  for (const ending of ['pointercancel', 'lostpointercapture']) {
    pointer('pointerdown', 200, 400, 0);
    pointer('pointermove', 150, 400, 100);
    assert.equal(captures.size, 1);
    pointer(ending, 150, 400, 110);
    const position = motion.getPosition();
    pointer('pointermove', 100, 400, 120);
    assert.equal(motion.getPosition(), position);
    assert.equal(captures.size, 0);
    assert.equal(gallery.dataset.dragging, undefined);
  }
});

test('transferring implicit touch capture from a card to the rail does not cancel the drag', t => {
  const { motion, pointer, listeners, captures } = controls(t);
  pointer('pointerdown', 200, 400, 0);
  pointer('pointermove', 150, 400, 100);
  listeners.get('lostpointercapture')({ type: 'lostpointercapture', pointerId: 1, target: {} });
  pointer('pointermove', 100, 400, 120);
  assert.equal(motion.getPosition(), 1100);
  assert.equal(captures.size, 1);
  pointer('pointerup', 100, 400, 130);
});

test('desktop wheel browsing covers the page without moving native scroll offsets', t => {
  const { motion, listeners, pageListeners, tick } = controls(t, { simple: false });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { value: { innerHeight: 900 }, configurable: true });
  t.after(() => previous ? Object.defineProperty(globalThis, 'window', previous) : delete globalThis.window);
  assert.equal(listeners.has('wheel'), false);
  pageListeners.get('wheel')({ deltaX: 0, deltaY: 120, deltaMode: 0, preventDefault() {} });
  tick();
  assert.equal(motion.getPosition(), 1120);
  for (const type of ['pointerdown', 'pointermove', 'pointerup']) assert.equal(pageListeners.has(type), false);
});

test('bursty wheel input moves on consecutive frames, wraps, and hands the exact distance back to autoplay', t => {
  const { motion, listeners, tick, frames, animations, interactions, gallery } = controls(t, { reducedMotion: false });
  const start = motion.getPosition();
  const wheel = distance => listeners.get('wheel')({ deltaY: distance, deltaX: 0, deltaMode: 0, preventDefault() {} });
  wheel(70);
  wheel(50);
  assert.equal(gallery.dataset.browsing, 'true');
  assert.equal(motion.getPosition(), start);
  assert.equal(frames.size, 1);
  tick();
  const first = motion.getPosition();
  assert.ok(first > start && first < start + 120);
  tick();
  assert.ok(motion.getPosition() > first);
  wheel(-300);
  assert.equal(interactions(), 1);
  for (let i = 0; i < 20; i++) tick();
  assert.ok(Math.abs(motion.getPosition() - (start - 180 + 1000)) < .0001);
  assert.equal(frames.size, 0);
  assert.equal(gallery.dataset.scrolling, undefined);
  assert.equal(gallery.dataset.browsing, undefined);
  assert.equal(animations.length, 2);
});

test('grabbing a card during wheel motion cancels the pending scroll frames', t => {
  const { motion, listeners, tick, frames, pointer } = controls(t, { reducedMotion: false });
  listeners.get('wheel')({ deltaX: 200, deltaY: 0, deltaMode: 0, preventDefault() {} });
  tick();
  pointer('pointerdown', 200, 400, 16);
  const grabbed = motion.getPosition();
  tick(250);
  assert.equal(motion.getPosition(), grabbed);
  assert.equal(frames.size, 0);
});
