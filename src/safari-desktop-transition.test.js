import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedPreviewFrames, startSafariDesktopTransition } from './safari-desktop-transition.js';

function fixture(t) {
  const animations = [];
  const bounds = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
  const node = (name, rect = bounds(20, 100, 200, 200)) => ({
    name, style: { setProperty(key, value) { this[key] = value; } }, isConnected: true, dataset: {},
    getBoundingClientRect: () => rect, setAttribute() {}, removeAttribute() {}, append() {},
    remove() { this.removed = true; },
    animate(frames, options) {
      let resolve;
      const animation = { name, frames, options, finished: new Promise(r => { resolve = r; }), cancel() { this.cancelled = true; resolve(); }, complete: () => resolve() };
      animations.push(animation); return animation;
    },
  });
  const media = { tagName: 'IMG', naturalWidth: 400, naturalHeight: 300, complete: true, setAttribute() {}, removeAttribute() {} };
  const oldCard = node('old-card');
  const copy = Object.assign(node('old-page'), { querySelectorAll: () => [], querySelector: () => oldCard });
  const home = { scrollTop: 12, querySelectorAll: () => [], cloneNode: () => copy };
  const source = Object.assign(node('source'), { querySelector: () => media, closest: s => s === '.home-page' ? home : null });
  const text = Object.assign(node('text'), { contains: () => false, matches: () => true });
  const caption = Object.assign(node('caption'), { contains: () => false, matches: () => false });
  const gallery = Object.assign(node('gallery'), { contains: () => false, matches: () => false });
  const page = { querySelectorAll: () => [text, caption, gallery] };
  const destination = Object.assign(node('destination', bounds(80, 250, 360, 270)), { querySelector: () => media, closest: s => s === '.home-page' ? null : page });
  let current = source, updates = 0;
  const layer = node('shared-layer');
  const canvas = Object.assign(node('canvas'), { getContext: () => ({ drawImage() {} }) });
  for (const [key, value] of Object.entries({ innerWidth: 1200, innerHeight: 900,
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    document: { body: { append() {} }, createElement: tag => tag === 'canvas' ? canvas : layer,
      querySelector: () => current, startViewTransition() { throw Error('Safari must not use native snapshots'); } },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const transition = startSafariDesktopTransition('work', () => { updates++; current = destination; return true; });
  return { animations, transition, copy, layer, destination, updates: () => updates };
}

test('Safari moves only the shared card; captions fade in place without native snapshots', async t => {
  const f = fixture(t);
  await Promise.resolve();
  const motion = f.animations.find(a => a.name === 'shared-layer');
  assert.equal(motion.options.duration, 440);
  assert.ok(motion.frames.every(frame => !('width' in frame) && !('height' in frame)));
  assert.equal(motion.frames.at(-1).transform, 'translate(0px,0px) scale(1)');
  const caption = f.animations.find(a => a.name === 'caption');
  assert.equal(caption.options.delay, 240);
  assert.ok(caption.frames.every(frame => !('transform' in frame) && !('left' in frame) && !('top' in frame)));
  assert.equal(f.animations.find(a => a.name === 'old-page').options.duration, 90);
  f.transition.skipTransition();
  await f.transition.finished;
  assert.equal(f.layer.removed, true);
  assert.equal(f.copy.removed, true);
});

test('compositor crops preserve the intended bounds and proportions for wide and tall clips', () => {
  for (const [width, height] of [[360, 270], [270, 400], [400, 400]]) {
    const home = { left: 100, top: 500, width: 196, height: 196 };
    const gallery = { left: 50, top: 220, width, height };
    for (const [from, to] of [[home, gallery], [gallery, home]]) {
      const aspect = width / height;
      const base = { ...to, width: Math.max(to.width, to.height * aspect), height: Math.max(to.height, to.width / aspect) };
      for (const frame of sharedPreviewFrames(from, to, base)) {
        const [x, y, scale] = frame.transform.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
        const [insetY, insetX] = frame.clipPath.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
        const mix = (a, b) => a + (b - a) * frame.offset;
        const actual = [to.left + x + insetX * scale, to.top + y + insetY * scale,
          (base.width - insetX * 2) * scale, (base.height - insetY * 2) * scale];
        const expected = [mix(from.left, to.left), mix(from.top, to.top), mix(from.width, to.width), mix(from.height, to.height)];
        actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < .001));
      }
    }
  }
});

test('cancelling Safari navigation before its update leaves no overlays or page swap', async t => {
  const f = fixture(t);
  f.transition.skipTransition();
  await f.transition.finished;
  assert.equal(f.updates(), 0);
  assert.equal(f.layer.removed, true);
  assert.equal(f.copy.removed, true);
});
