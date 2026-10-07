import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedPreviewFrames, startSafariDesktopTransition } from './safari-desktop-transition.js';

function fixture(t, { pendingSnapshot = false, returningHome = false } = {}) {
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
  let resolveDecode, rejectDecode, replacement;
  const image = { style: {}, dataset: {}, decode: () => new Promise((resolve, reject) => { resolveDecode = resolve; rejectDecode = reject; }) };
  const originalVideo = Object.assign(node('secondary-video'), { readyState: 4, videoWidth: 400, videoHeight: 400, closest: () => null });
  const copiedVideo = { replaceWith: element => { replacement = element; } };
  const copy = Object.assign(node('old-page'), { querySelectorAll: selector => pendingSnapshot && selector === 'video' ? [copiedVideo] : [], querySelector: () => oldCard });
  let clones = 0;
  const home = { scrollTop: 12, querySelectorAll: selector => pendingSnapshot && selector === 'video' ? [originalVideo] : [], cloneNode: () => { clones++; return copy; } };
  const oldText = Object.assign(node('old-text'), { contains: () => false });
  const oldGallery = Object.assign(node('old-gallery'), { contains: () => false });
  const oldPage = { querySelectorAll: () => [oldText, oldGallery] };
  const source = Object.assign(node('source'), { querySelector: () => media, closest: s => returningHome ? (s === '.selected-work-page' ? oldPage : null) : (s === '.home-page' ? home : null) });
  const text = Object.assign(node('text'), { contains: () => false, matches: () => true });
  const caption = Object.assign(node('caption'), { contains: () => false, matches: () => false });
  const gallery = Object.assign(node('gallery'), { contains: () => false, matches: () => false });
  const page = { querySelectorAll: () => [text, caption, gallery] };
  const destination = Object.assign(node('destination', bounds(80, 250, 360, 270)), { querySelector: () => media, closest: s => returningHome ? (s === '.home-page' ? page : null) : (s === '.home-page' ? null : page) });
  let current = source, updates = 0;
  const layer = node('shared-layer');
  const canvas = Object.assign(node('canvas'), { getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/jpeg;base64,frame' });
  for (const [key, value] of Object.entries({ innerWidth: 1200, innerHeight: 900,
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    document: { body: { append(element) { element.mounted = true; } }, createElement: tag => tag === 'canvas' ? canvas : tag === 'img' ? image : layer,
      querySelector: () => current, startViewTransition() { throw Error('Safari must not use native snapshots'); } },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const transition = startSafariDesktopTransition('work', () => { updates++; current = destination; return true; });
  return { animations, transition, copy, layer, destination, source, image, replacement: () => replacement,
    decode: () => resolveDecode(), failDecode: () => rejectDecode(Error('decode failed')), updates: () => updates, clones: () => clones };
}

test('Safari moves only the shared card; captions fade in place without native snapshots', async t => {
  const f = fixture(t);
  await new Promise(setImmediate);
  const motion = f.animations.find(a => a.name === 'shared-layer');
  assert.equal(motion.options.duration, 440);
  assert.ok(motion.frames.every(frame => !('width' in frame) && !('height' in frame)));
  assert.equal(motion.frames.at(-1).transform, 'translate(0px,0px) scale(1)');
  const caption = f.animations.find(a => a.name === 'caption');
  assert.equal(caption.options.delay, 240);
  assert.ok(caption.frames.every(frame => !('transform' in frame) && !('left' in frame) && !('top' in frame)));
  assert.ok(f.animations.filter(a => ['caption', 'gallery'].includes(a.name)).every(a => a.frames.every(frame => !('filter' in frame))));
  assert.equal(f.animations.find(a => a.name === 'old-page').options.duration, 90);
  f.transition.skipTransition();
  await f.transition.finished;
  assert.equal(f.layer.removed, true);
  assert.equal(f.copy.removed, true);
});

test('Safari outro fades real gallery content before unmounting, without copying the page', async t => {
  const f = fixture(t, { returningHome: true });
  await new Promise(setImmediate);
  assert.equal(f.clones(), 0);
  assert.equal(f.updates(), 0);
  assert.equal(f.layer.mounted, undefined);
  const exits = f.animations.filter(a => ['old-text', 'old-gallery'].includes(a.name));
  assert.equal(exits.length, 2);
  exits.forEach(a => { assert.equal(a.options.duration, 90); assert.deepEqual(a.frames, [{opacity:1},{opacity:0}]); a.complete(); });
  await new Promise(setImmediate);
  assert.equal(f.updates(), 1);
  assert.equal(f.animations.find(a => a.name === 'shared-layer').options.duration, 350);
  assert.equal(f.animations.find(a => a.name === 'caption').options.delay, 150);
  f.transition.skipTransition(); await f.transition.finished;
});

test('interrupting the live gallery exit restores it without an obsolete page update', async t => {
  const f = fixture(t, { returningHome: true });
  f.transition.skipTransition(); await f.transition.finished;
  assert.equal(f.updates(), 0); assert.equal(f.clones(), 0);
  assert.ok(f.animations.every(a => a.cancelled));
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
  assert.equal(f.layer.mounted, undefined);
  assert.equal(f.copy.removed, true);
});

test('right-hand video images decode before the outgoing page is exposed or the source is hidden', async t => {
  const f = fixture(t, { pendingSnapshot: true });
  await new Promise(setImmediate);
  assert.equal(f.copy.mounted, undefined);
  assert.equal(f.source.style.opacity, undefined);
  assert.equal(f.updates(), 0);
  assert.equal(f.replacement(), f.image);
  f.decode(); await new Promise(setImmediate);
  assert.equal(f.copy.mounted, true);
  assert.equal(f.updates(), 1);
  assert.equal(f.animations.find(a => a.name === 'old-page').frames[0].opacity, 1);
  f.transition.skipTransition(); await f.transition.finished;
});

test('cancelling during frame preparation cannot mount a late snapshot or change the page', async t => {
  const f = fixture(t, { pendingSnapshot: true });
  f.transition.skipTransition(); f.decode(); await f.transition.finished;
  assert.equal(f.copy.mounted, undefined);
  assert.equal(f.layer.mounted, undefined);
  assert.equal(f.updates(), 0);
});

test('a failed image decode is omitted rather than flashing an unpainted outgoing gallery', async t => {
  const f = fixture(t, { pendingSnapshot: true });
  f.failDecode(); await new Promise(setImmediate);
  assert.equal(f.copy.mounted, undefined);
  assert.equal(f.updates(), 1);
  assert.equal(f.animations.some(a => a.name === 'old-page'), false);
  f.transition.skipTransition(); await f.transition.finished;
});
