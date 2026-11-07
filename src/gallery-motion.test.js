import test from "node:test";
import assert from "node:assert/strict";
import { startGalleryDrift, wrapGalleryOffset } from "./gallery-motion.js";

function setup({ start = 0, width = 1000, rounded = false } = {}) {
  let offset = start;
  let callback;
  let paused = false;
  let cancelled = false;
  const wraps = [];
  const rail = {
    get scrollLeft() { return offset; },
    set scrollLeft(value) { offset = rounded ? Math.round(value) : value; },
  };
  const stop = startGalleryDrift(rail, {
    cycleWidth: () => width,
    isPaused: () => paused,
    onWrap: () => wraps.push(rail.scrollLeft),
    requestFrame: cb => { callback = cb; return 1; },
    cancelFrame: () => { cancelled = true; },
  });
  return { rail, stop, wraps, frame: time => callback(time), pause: value => { paused = value; }, cancelled: () => cancelled };
}

test("gallery moves left at a steady pace even when scroll offsets are rounded", () => {
  const motion = setup({ rounded: true });
  for (let time = 0; time <= 1000; time += 10) motion.frame(time);
  assert.equal(motion.rail.scrollLeft, 16);
});

test("the duplicate sequence wraps without a gap and supports reverse dragging", () => {
  const motion = setup({ start: 999.5 });
  motion.frame(0);
  motion.frame(50);
  assert.ok(Math.abs(motion.rail.scrollLeft - .3) < .0001);
  assert.deepEqual(motion.wraps, [999.5]);
  assert.equal(wrapGalleryOffset(-60, 1000), 940);
  assert.equal(wrapGalleryOffset(2040, 1000), 40);
});

test("pausing drift and resuming keeps a manually chosen position", () => {
  const motion = setup();
  motion.frame(0);
  motion.pause(true);
  motion.frame(1000);
  assert.equal(motion.rail.scrollLeft, 0);
  motion.rail.scrollLeft = 480;
  motion.frame(1100);
  motion.pause(false);
  motion.frame(1150);
  assert.ok(Math.abs(motion.rail.scrollLeft - 480.8) < .0001);
});

test("returning from a background tab never catches up with a large jump", () => {
  const motion = setup();
  motion.frame(0);
  motion.frame(100000);
  assert.ok(motion.rail.scrollLeft <= 1.0241);
  motion.stop();
  assert.equal(motion.cancelled(), true);
});
