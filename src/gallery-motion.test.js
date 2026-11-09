import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoopingTrack, wrapGalleryOffset } from './gallery-motion.js';

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

test('the running line uses one infinite transform animation with fractional positioning', () => {
  const { track, animations } = fakeTrack();
  const loop = createLoopingTrack(track, { width: 1000, initialOffset: 120 });
  loop.resume();
  assert.equal(animations.length, 1);
  assert.deepEqual(animations[0].options, { duration: 62500, iterations: Infinity, easing: 'linear' });
  assert.deepEqual(animations[0].keyframes, [
    { transform: 'translate3d(-1000px, 0, 0)' },
    { transform: 'translate3d(-2000px, 0, 0)' },
  ]);
  animations[0].animation.currentTime += 16.67;
  assert.ok(Math.abs(loop.getPosition() - 1120.26672) < .00001);
  loop.destroy();
});

test('pause, tap alignment and resume preserve the visible position without a restart delay', () => {
  const { track, animations } = fakeTrack();
  const loop = createLoopingTrack(track, { width: 1000 });
  loop.resume();
  animations[0].animation.currentTime = 12345;
  loop.pause();
  assert.equal(loop.getPosition(), 1197.52);
  assert.equal(animations[0].animation.cancelled, true);
  loop.setPosition(2050);
  assert.equal(loop.getPosition(), 2050, 'keep the same copy during the collapse transition');
  loop.resume();
  assert.equal(loop.getPosition(), 1050, 'resume from its identical place in the loop');
  assert.equal(animations.length, 2);
});

test('manual movement wraps in both directions and resizing preserves the item position', () => {
  const { track } = fakeTrack();
  const loop = createLoopingTrack(track, { width: 1000 });
  loop.setPosition(940, true);
  assert.equal(loop.getPosition(), 1940);
  loop.setPosition(2040, true);
  assert.equal(loop.getPosition(), 1040);
  loop.resize(500);
  assert.equal(loop.getPosition(), 520);
});

test('reduced motion keeps the line still while manual browsing remains available', () => {
  const { track, animations } = fakeTrack();
  const loop = createLoopingTrack(track, { width: 1000, reducedMotion: true });
  loop.resume();
  loop.setPosition(1150, true);
  assert.equal(loop.getPosition(), 1150);
  assert.equal(animations.length, 0);
  loop.destroy();
  assert.equal(track.style.transform, undefined);
});

test('offsets wrap in either direction, including an empty sequence', () => {
  assert.equal(wrapGalleryOffset(-60, 1000), 940);
  assert.equal(wrapGalleryOffset(2040, 1000), 40);
  assert.equal(wrapGalleryOffset(10, 0), 0);
});

test('video synchronization runs only at loop boundaries and is cancelled when paused', t => {
  let scheduled;
  let delay;
  let wraps = 0;
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;
  globalThis.setTimeout = (callback, ms) => { scheduled = callback; delay = ms; return 1; };
  globalThis.clearTimeout = () => { scheduled = undefined; };
  t.after(() => { globalThis.setTimeout = originalSet; globalThis.clearTimeout = originalClear; });
  const { track } = fakeTrack();
  const loop = createLoopingTrack(track, { width: 1000, initialOffset: 200, onWrap: () => { wraps++; } });
  loop.resume();
  assert.equal(delay, 50000);
  assert.equal(wraps, 0);
  scheduled();
  assert.equal(wraps, 1);
  assert.equal(delay, 62500);
  loop.pause();
  assert.equal(scheduled, undefined);
  loop.resume();
  loop.destroy();
  assert.equal(scheduled, undefined);
});
