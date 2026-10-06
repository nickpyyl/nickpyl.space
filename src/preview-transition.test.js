import test from "node:test";
import assert from "node:assert/strict";
import { startPreviewTransition } from "./preview-transition.js";

function fixture(t, bounds = { left: 100, right: 300, top: 100, bottom: 300 }) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const video = Object.assign(new EventTarget(), { readyState: 0, currentTime: 0, duration: 20, seeking: false });
  const sourceVideo = { readyState: 4, currentTime: 5, videoWidth: 320, videoHeight: 320 };
  const style = () => ({ removeProperty() { delete this.viewTransitionName; } });
  const home = { scrollTop: 42 };
  const page = { querySelectorAll: () => [] };
  const source = { append() {}, style: style(), querySelector: () => sourceVideo, closest: () => home,
    getBoundingClientRect: () => bounds };
  const destination = { style: style(), querySelector: () => video, closest: name => name === ".home-page" ? null : page };
  let current = source;
  let callback;
  let finish;
  const root = { dataset: {}, removeAttribute() { delete this.dataset.previewReady; } };
  const doc = {
    documentElement: root,
    querySelector: () => current,
    head: { append() {} },
    createElement: tag => tag === "canvas"
      ? { remove() {}, getContext: () => ({ drawImage() {} }), toDataURL: () => "data:image/jpeg;base64,frame" }
      : { remove() {} },
    startViewTransition(update) {
      callback = update;
      return { ready: Promise.resolve(), finished: new Promise(resolve => { finish = resolve; }), skipTransition() { finish(); } };
    },
  };
  for (const [key, value] of Object.entries({ document: doc, matchMedia: () => ({ matches: false }), innerWidth: 1000, innerHeight: 800 })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const transition = startPreviewTransition("explorations", () => { current = destination; return true; });
  return { transition, video, source, destination, root, update: () => callback(), finish: () => finish() };
}

test("navigation does not wait for a slow video; a captured frame covers decoding", async t => {
  const f = fixture(t);
  assert.equal(f.update(), undefined, "the snapshot update must not return a video-loading promise");
  assert.equal(f.video.poster, "data:image/jpeg;base64,frame");
  assert.equal(f.root.dataset.previewReady, "false");
  f.video.readyState = 4;
  f.video.dispatchEvent(new Event("loadeddata"));
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.root.dataset.previewReady, "true");
  assert.ok(f.video.currentTime >= 5 && f.video.currentTime < 6);
  f.finish();
});

test("the new video stays covered until a decoded frame is presented", async t => {
  const f = fixture(t);
  let present;
  f.video.requestVideoFrameCallback = callback => { present = callback; return 1; };
  f.video.cancelVideoFrameCallback = () => {};
  f.update();
  f.video.readyState = 4;
  f.video.dispatchEvent(new Event("loadeddata"));
  await Promise.resolve();
  assert.equal(f.root.dataset.previewReady, "false");
  present();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.root.dataset.previewReady, "true");
  f.finish();
});

test("cancelled navigation cannot seek or reveal a late-loading destination", async t => {
  const f = fixture(t);
  f.update();
  f.transition.skipTransition();
  f.video.readyState = 4;
  f.video.dispatchEvent(new Event("loadeddata"));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.root.dataset.previewReady, undefined);
  assert.equal(f.source.style.viewTransitionName, undefined);
  assert.equal(f.destination.style.viewTransitionName, undefined);
});

test("a video timeout keeps the captured frame without delaying the page update", async t => {
  const f = fixture(t);
  assert.equal(f.update(), undefined);
  t.mock.timers.tick(350);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.root.dataset.previewReady, "false");
  assert.equal(f.video.currentTime, 0);
  assert.ok(f.video.poster);
  f.transition.skipTransition();
});

test("a partially clipped gallery card uses the normal page fade", t => {
  const f = fixture(t, { left: -96, right: 208, top: 200, bottom: 504 });
  assert.equal(f.transition, null);
  assert.equal(f.source.style.viewTransitionName, undefined);
});
