import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafariPreviewSnapshot, needsSafariPreviewSnapshot } from './safari-preview-snapshot.js';

function fixture(t, live = false) {
  const callbacks = new Map();
  let id = 0, finishFade;
  const layer = { style: {}, setAttribute() {}, append() {}, remove() { this.removed = true; },
    animate() { return { finished: new Promise(resolve => { finishFade = resolve; }), cancel() {} }; } };
  const canvas = { style: {}, getContext() { throw Error('No per-frame readbacks'); } };
  const source = { style: { opacity: '.9' }, getBoundingClientRect: () => ({ left: 20, top: 40, width: 180, height: 180 }) };
  const target = { style: { opacity: '' }, isConnected: true, getBoundingClientRect: () => ({ left: 100, top: 120, width: 400, height: 400 }), append(node) { this.cover = node; } };
  const makeVideo = () => Object.assign(new EventTarget(), {
    tagName: 'VIDEO', readyState: 4, duration: 20, currentTime: 0, dataset: {}, style: {}, loop: false,
    parentNode: { isConnected: false }, getAttribute: () => null,
    setAttribute(key, value) { if (key === 'data-preview-buffering') this.dataset.previewBuffering = value; },
    removeAttribute(key) { if (key === 'data-preview-buffering') delete this.dataset.previewBuffering; },
    pause() { this.playing = false; }, play() { this.playing = true; return Promise.resolve(); },
    requestVideoFrameCallback(cb) { this.present = cb; return 1; }, cancelVideoFrameCallback() { this.present = undefined; },
  });
  const video = makeVideo(), sourceVideo = makeVideo(); sourceVideo.currentTime = 5;
  for (const [key, value] of Object.entries({
    document: { body: { append() {} }, createElement: () => layer },
    requestAnimationFrame: cb => { callbacks.set(++id, cb); return id; },
    cancelAnimationFrame: id => callbacks.delete(id),
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const paint = () => { const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(cb => cb()); };
  const finish = async () => { finishFade(); await Promise.resolve(); await Promise.resolve(); };
  return { canvas, layer, source, target, video, sourceVideo, paint, finish, snapshot: createSafariPreviewSnapshot(source, canvas, live ? sourceVideo : undefined) };
}

test('only Safari uses the separate desktop renderer', () => {
  assert.equal(needsSafariPreviewSnapshot({ vendor: 'Apple Computer, Inc.', userAgent: 'Version/26.0 Safari/605.1.15' }), true);
  assert.equal(needsSafariPreviewSnapshot({ vendor: 'Google Inc.', userAgent: 'Chrome/141 Safari/537.36' }), false);
  assert.equal(needsSafariPreviewSnapshot({ vendor: '', userAgent: 'Firefox/143' }), false);
});

test('Safari uses measured bounds without registering native view snapshots', t => {
  const f = fixture(t);
  assert.equal(f.source.style.opacity, '0');
  assert.equal(f.layer.style.width, '180px');
  assert.equal(f.layer.style.viewTransitionName, undefined);
  f.snapshot.stage(f.target, f.video);
  assert.equal(f.target.style.opacity, '0');
  assert.equal(f.layer.style.width, '400px');
  assert.equal(f.layer.style.left, '100px');
  f.snapshot.cancel();
  assert.equal(f.source.style.opacity, '.9');
  assert.equal(f.target.style.opacity, '');
  assert.equal(f.video.dataset.previewBuffering, undefined);
});

test('the original video plays directly without a per-frame canvas copy', async t => {
  const f = fixture(t, true);
  f.snapshot.stage(f.target, f.video);
  assert.equal(f.sourceVideo.playing, true);
  assert.equal(f.video.loop, true);
  assert.equal(f.sourceVideo.style.opacity, '0');
  f.sourceVideo.present();
  assert.equal(f.sourceVideo.style.opacity, '1');
  f.sourceVideo.currentTime = 5.4;
  const boundsBeforeHandoff = { ...f.layer.style };
  f.snapshot.finish(f.video, 99);
  assert.deepEqual(f.layer.style, boundsBeforeHandoff, 'handoff must preserve border-box geometry');
  assert.equal(f.target.cover, undefined, 'live surface stays in the same parent until it is released');
  f.paint(); f.paint();
  assert.equal(f.video.currentTime, 5.4);
  assert.equal(f.layer.removed, undefined);
  f.video.present();
  f.video.present(); // A second presented frame confirms the two live clocks align.
  await f.finish();
  assert.equal(f.layer.removed, true);
  assert.equal(f.sourceVideo.playing, false);
  assert.equal(f.sourceVideo.present, undefined);
  assert.equal(f.sourceVideo.loop, false);
  assert.equal(f.video.loop, false);
});

test('interrupting Safari handoff cancels late paints and restores the card', t => {
  const f = fixture(t, true);
  f.snapshot.stage(f.target, f.video);
  f.snapshot.finish(f.video, 5);
  f.snapshot.cancel();
  f.paint(); f.paint();
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.video.dataset.previewBuffering, undefined);
  assert.equal(f.video.loop, false);
  assert.equal(f.target.style.opacity, '');
  assert.equal(f.layer.removed, true);
  assert.equal(f.sourceVideo.playing, false);
});

test('a slow Safari decoder stays covered until its visible frame is presented', async t => {
  const f = fixture(t);
  f.video.readyState = 0;
  f.snapshot.stage(f.target, f.video);
  f.snapshot.finish(f.video, 7);
  f.paint(); f.paint();
  assert.equal(f.layer.removed, undefined);
  f.video.readyState = 4;
  f.video.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(f.video.currentTime, 7);
  assert.equal(f.layer.removed, undefined);
  f.video.present();
  await f.finish();
  assert.equal(f.layer.removed, true);
});
