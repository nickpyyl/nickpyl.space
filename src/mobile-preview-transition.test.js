import test from 'node:test';
import assert from 'node:assert/strict';
import { coverUntilPresented } from './mobile-preview-transition.js';

function video() {
  let present;
  const media = Object.assign(new EventTarget(), {
    tagName: 'VIDEO', readyState: 0, currentTime: 0, duration: 10, seeking: false,
    plays: 0, pauses: 0,
    play() { this.plays++; return Promise.resolve(); },
    pause() { this.pauses++; },
    setAttribute() {}, removeAttribute() {},
    requestVideoFrameCallback(callback) { present = callback; return 1; },
    cancelVideoFrameCallback() { present = undefined; },
  });
  return { media, present: () => present?.() };
}

test('a slow mobile video stays covered until an actual frame is presented', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = video();
  let revealed = false;
  coverUntilPresented(f.media, 5, () => { revealed = true; });
  t.mock.timers.tick(5000);
  assert.equal(revealed, false);
  f.media.readyState = 4;
  f.media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(f.media.currentTime, 5);
  assert.equal(revealed, false);
  f.present();
  assert.equal(revealed, true);
});

test('cancelling a mobile handoff prevents late seeking or revealing', () => {
  const f = video();
  let revealed = false;
  const stop = coverUntilPresented(f.media, 5, () => { revealed = true; });
  stop();
  f.media.readyState = 4;
  f.media.dispatchEvent(new Event('loadedmetadata'));
  f.present();
  assert.equal(f.media.currentTime, 0);
  assert.equal(revealed, false);
});

test('a seek must finish before the cover can expose the destination', () => {
  const f = video();
  f.media.readyState = 4;
  f.media.seeking = true;
  let revealed = false;
  coverUntilPresented(f.media, 5, () => { revealed = true; });
  f.present();
  assert.equal(revealed, false);
  f.media.seeking = false;
  f.media.dispatchEvent(new Event('seeked'));
  f.present();
  assert.equal(revealed, true);
});

test('the original video keeps playing through movement and slow destination decoding', async t => {
  const { startMobilePreviewTransition } = await import('./mobile-preview-transition.js');
  const f = video();
  const from = { left: 24, top: 240, width: 304, height: 304, right: 328, bottom: 544 };
  const to = { left: 24, top: 520, width: 164, height: 164, right: 188, bottom: 684 };
  const sourceMedia = Object.assign(video().media, { videoWidth: 1080, videoHeight: 1080, currentTime: 5,
    style: {}, getAttribute: () => null });
  const source = { getBoundingClientRect: () => from, closest: () => null,
    querySelector: selector => selector === '.preview-handoff-frame' ? null : sourceMedia };
  const home = { scrollTop: 0, querySelectorAll: () => [] };
  const destination = { style: { opacity: '' }, getBoundingClientRect: () => to,
    closest: selector => selector === '.home-page' ? home : null,
    querySelector: () => f.media, append: frame => { frame.parent = destination; } };
  let current = source, keyframes, land;
  const frame = { style: {}, setAttribute() {}, append(...children) { this.children = children; },
    remove() { this.removed = true; },
    animate(frames) {
      if ('opacity' in frames[0]) return { finished: Promise.resolve(), cancel() {} };
      keyframes = frames; return { finished: new Promise(resolve => { land = resolve; }), cancel() {} };
    } };
  const paintCallbacks = [];
  const globals = { innerWidth: 390, innerHeight: 844,
    requestAnimationFrame: callback => { paintCallbacks.push(callback); return paintCallbacks.length; },
    cancelAnimationFrame() {},
    document: { querySelector: () => current, createElement: tag => tag === 'canvas'
      ? { style: {}, getContext: () => ({ drawImage() {} }) } : frame, body: { append() {} } } };
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const transition = startMobilePreviewTransition('fuse-wallet', () => { current = destination; return true; });
  await Promise.resolve();
  assert.equal(destination.style.opacity, '0');
  assert.equal(frame.children[1], sourceMedia, 'move the existing decoder, not a duplicate');
  assert.equal(sourceMedia.plays, 1);
  assert.equal(keyframes.length, 2);
  assert.ok(keyframes[1].transform.startsWith('translate(0px,280px)'));
  land();
  await transition.finished;
  assert.equal(frame.parent, destination);
  assert.notEqual(frame.removed, true, 'a stalled decoder must not uncover the tile');
  assert.equal(destination.style.opacity, '');
  paintCallbacks.shift()();
  paintCallbacks.shift()();
  sourceMedia.currentTime = 6;
  f.media.readyState = 4;
  f.media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(f.media.currentTime, 6, 'synchronize to the live timeline when the new decoder is ready');
  f.present();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(frame.removed, true);
});

test('a decoded hidden frame cannot remove the cover before visible presentation', () => {
  const f = video();
  f.media.readyState = 4;
  let visible = false, revealed = false;
  const stop = coverUntilPresented(f.media, 0, () => { revealed = true; }, () => visible);
  f.present();
  assert.equal(revealed, false);
  assert.equal(f.media.plays, 0, 'the hidden destination must not advance beyond the captured frame');
  visible = true;
  stop.checkPresentation();
  assert.equal(f.media.plays, 1);
  assert.equal(revealed, false);
  f.present();
  assert.equal(revealed, true);
});
