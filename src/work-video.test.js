import assert from "node:assert/strict";
import { test } from "node:test";
import { observeWorkVideo, refreshVideoPlayback } from "./work-video.js";

function setup(t, { priority = false, observerSupport = true } = {}) {
  const observers = [];
  const document = Object.assign(new EventTarget(), { hidden: false });
  const video = Object.assign(new EventTarget(), {
    paused: true, src: "", preload: "none", inViewer: false, inert: false,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    closest(selector) {
      return (selector === ".media-viewer" && this.inViewer) || (selector === "[inert]" && this.inert) ? {} : null;
    },
  });
  const Observer = class {
    constructor(callback, options) { Object.assign(this, { callback, options }); observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    intersect(isIntersecting) { this.callback([{ isIntersecting }]); }
  };
  const globals = { document, window: observerSupport ? { IntersectionObserver: Observer } : {}, IntersectionObserver: Observer };
  const originals = Object.fromEntries(Object.keys(globals).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  let dispose;
  t.after(() => {
    dispose?.();
    for (const [name, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  let source = "blob:cached";
  dispose = observeWorkVideo(video, "video.mp4", { priority, sourceFor: () => source });
  return { video, document, observers, dispose, setSource: next => { source = next; } };
}

test("nearby videos prepare cached bytes but only visible videos play", t => {
  const { video, observers } = setup(t);
  assert.equal(video.src, "");
  observers[1].intersect(true);
  assert.equal(video.src, "blob:cached");
  assert.equal(video.preload, "auto");
  assert.equal(video.paused, true);
  assert.equal(observers[1].disconnected, true);
  observers[0].intersect(true);
  assert.equal(video.paused, false);
  observers[0].intersect(false);
  assert.equal(video.paused, true);
});

test("initial priority videos load immediately without offscreen autoplay", t => {
  const { video, observers } = setup(t, { priority: true });
  assert.equal(video.src, "blob:cached");
  assert.equal(observers.length, 1);
  assert.equal(video.paused, true);
  observers[0].intersect(true);
  assert.equal(video.paused, false);
});

test("hidden tabs stop playback and resume only visible videos", t => {
  const { video, document, observers } = setup(t);
  observers[0].intersect(true);
  document.hidden = true;
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.paused, true);
  video.dispatchEvent(new Event("loadeddata"));
  assert.equal(video.paused, true);
  document.hidden = false;
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.paused, false);
  observers[0].intersect(false);
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.paused, true);
});

test("an existing video source stays stable if the background cache changes", t => {
  const { video, observers, setSource } = setup(t, { priority: true });
  setSource("blob:newly-completed");
  observers[0].intersect(true);
  video.dispatchEvent(new Event("loadeddata"));
  assert.equal(video.src, "blob:cached", "no source replacement or playback reset");
});

test("a gallery video moved into the viewer keeps playing, then pauses offscreen", t => {
  const { video, observers } = setup(t);
  video.inViewer = true;
  observers[0].intersect(false);
  assert.equal(video.paused, false);
  video.inViewer = false;
  observers[0].intersect(false);
  assert.equal(video.paused, true);
});

test("cleanup disconnects observers and does not resume on later visibility events", t => {
  const { video, document, observers, dispose } = setup(t);
  observers[0].intersect(true);
  dispose();
  assert.equal(video.paused, true);
  assert.ok(observers.every(observer => observer.disconnected));
  document.dispatchEvent(new Event("visibilitychange"));
  video.dispatchEvent(new Event("loadeddata"));
  refreshVideoPlayback();
  assert.equal(video.paused, true);
});

test("opening a viewer pauses background gallery videos and closing resumes them", t => {
  const { video, observers } = setup(t);
  observers[0].intersect(true);
  video.inert = true;
  refreshVideoPlayback();
  assert.equal(video.paused, true);
  video.inert = false;
  refreshVideoPlayback();
  assert.equal(video.paused, false);
});

test("browsers without IntersectionObserver retain video playback", t => {
  const { video } = setup(t, { observerSupport: false });
  assert.equal(video.src, "blob:cached");
  assert.equal(video.paused, false);
});
