import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafariPreviewSnapshot, needsSafariPreviewSnapshot } from './safari-preview-snapshot.js';

function fixture(t, live = false) {
  const callbacks = new Map();
  let id = 0;
  const drawn = [];
  const canvas = { width: 640, height: 640, getContext: () => ({ drawImage(video) { drawn.push(video.currentTime); } }), style: { removeProperty(key) { if (key === 'view-transition-name') delete this.viewTransitionName; } }, setAttribute() {}, remove() { this.removed = true; } };
  const source = { style: { opacity: '.9' }, getBoundingClientRect: () => ({ left: 20, top: 40, width: 180, height: 180 }) };
  const target = { style: { opacity: '' }, isConnected: true, getBoundingClientRect: () => ({ left: 100, top: 120, width: 400, height: 400 }), append(node) { this.cover = node; } };
  const video = Object.assign(new EventTarget(), {
    tagName: 'VIDEO', readyState: 4, duration: 20, currentTime: 0, dataset: {},
    setAttribute(key, value) { if (key === 'data-preview-buffering') this.dataset.previewBuffering = value; },
    removeAttribute(key) { if (key === 'data-preview-buffering') delete this.dataset.previewBuffering; },
    pause() {}, play() { return Promise.resolve(); },
    requestVideoFrameCallback(cb) { this.present = cb; return 1; }, cancelVideoFrameCallback() {},
  });
  for (const [key, value] of Object.entries({
    document: { body: { append() {} } },
    requestAnimationFrame: cb => { callbacks.set(++id, cb); return id; },
    cancelAnimationFrame: id => callbacks.delete(id),
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const sourceVideo = Object.assign(new EventTarget(), {
    tagName: 'VIDEO', style: {}, loop: false, readyState: 4, currentTime: 5,
    parentNode: { isConnected: false }, getAttribute: () => null, setAttribute() {}, removeAttribute() {},
    play() { this.playing = true; return Promise.resolve(); }, pause() { this.playing = false; }, remove() { this.removed = true; },
    requestVideoFrameCallback(cb) { this.present = cb; return 1; }, cancelVideoFrameCallback() { this.present = undefined; },
  });
  const paint = () => { const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(cb => cb()); };
  return { canvas, source, target, video, sourceVideo, drawn, paint, snapshot: createSafariPreviewSnapshot(source, canvas, live ? sourceVideo : undefined) };
}

test('only Safari uses the bitmap snapshot workaround', () => {
  assert.equal(needsSafariPreviewSnapshot({ vendor: 'Apple Computer, Inc.', userAgent: 'Version/26.0 Safari/605.1.15' }), true);
  assert.equal(needsSafariPreviewSnapshot({ vendor: 'Google Inc.', userAgent: 'Chrome/141 Safari/537.36' }), false);
  assert.equal(needsSafariPreviewSnapshot({ vendor: '', userAgent: 'Firefox/143' }), false);
});

test('Safari shares one bitmap at the actual source and destination bounds', t => {
  const f = fixture(t);
  assert.equal(f.source.style.opacity, '0');
  assert.equal(f.canvas.style.width, '180px');
  assert.equal(f.canvas.style.viewTransitionName, 'section-preview');
  f.snapshot.stage(f.target, f.video);
  assert.equal(f.target.style.opacity, '0');
  assert.equal(f.canvas.style.width, '400px');
  assert.equal(f.canvas.style.left, '100px');
  f.snapshot.cancel();
  assert.equal(f.source.style.opacity, '.9');
  assert.equal(f.target.style.opacity, '');
  assert.equal(f.video.dataset.previewBuffering, undefined);
});

test('Safari keeps the destination covered until a visible video frame is presented', t => {
  const f = fixture(t);
  f.snapshot.stage(f.target, f.video);
  f.snapshot.finish(f.video, () => 5.5);
  assert.equal(f.target.cover, f.canvas);
  assert.equal(f.canvas.style.viewTransitionName, undefined);
  assert.equal(f.canvas.removed, undefined);
  f.paint(); f.paint();
  assert.equal(f.video.currentTime, 5.5);
  assert.equal(f.canvas.removed, undefined);
  f.video.present();
  assert.equal(f.canvas.removed, true);
});

test('interrupting Safari handoff cancels late paints and restores the card', t => {
  const f = fixture(t);
  f.snapshot.stage(f.target, f.video);
  f.snapshot.finish(f.video, 5);
  f.snapshot.cancel();
  f.paint(); f.paint();
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.video.dataset.previewBuffering, undefined);
  assert.equal(f.target.style.opacity, '');
  assert.equal(f.canvas.removed, true);
});

test('a slow Safari decoder remains covered after the movement has finished', t => {
  const f = fixture(t);
  f.video.readyState = 0;
  f.snapshot.stage(f.target, f.video);
  f.snapshot.finish(f.video, 7);
  f.paint(); f.paint();
  assert.equal(f.canvas.removed, undefined);
  assert.equal(f.video.currentTime, 0);
  f.video.readyState = 4;
  f.video.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(f.video.currentTime, 7);
  assert.equal(f.canvas.removed, undefined);
  f.video.present();
  assert.equal(f.canvas.removed, true);
});


test('Safari redraws the same playing video throughout movement instead of freezing a poster', t => {
  const f = fixture(t, true);
  f.snapshot.stage(f.target, f.video);
  assert.equal(f.sourceVideo.playing, true);
  assert.deepEqual(f.drawn, [5]);
  f.sourceVideo.currentTime = 5.2;
  f.sourceVideo.present();
  f.sourceVideo.currentTime = 5.4;
  f.sourceVideo.present();
  assert.deepEqual(f.drawn, [5, 5.2, 5.4]);
  f.snapshot.finish(f.video, 99);
  f.paint(); f.paint();
  assert.equal(f.video.currentTime, 5.4, 'handoff follows the actual playing decoder, not estimated elapsed time');
  f.video.present();
  assert.equal(f.sourceVideo.removed, true);
  assert.equal(f.sourceVideo.playing, false);
  assert.equal(f.sourceVideo.present, undefined);
  assert.equal(f.sourceVideo.loop, false);
});

test('interrupting a live Safari canvas releases the borrowed decoder and frame callback', t => {
  const f = fixture(t, true);
  f.snapshot.stage(f.target, f.video);
  f.snapshot.cancel();
  assert.equal(f.sourceVideo.playing, false);
  assert.equal(f.sourceVideo.present, undefined);
  assert.equal(f.sourceVideo.removed, true);
  assert.equal(f.video.dataset.previewBuffering, undefined);
});
