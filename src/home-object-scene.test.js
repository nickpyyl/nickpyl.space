import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";
import * as THREE from "three";

// Run with node --experimental-test-module-mocks --test src/home-object-scene.test.js.
const renderers = [];
mock.module("three", {
  exports: {
    ...THREE,
    WebGLRenderer: class {
      constructor() { renderers.push(this); }
      setPixelRatio() {}
      setClearColor() {}
      setSize() {}
      getContext() { return { isContextLost:() => false }; }
      render(scene) { this.pivot = scene.children.find(child => child.isGroup); }
      dispose() {}
    },
  },
});
const assets = registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith("/home-redbull-ps2-texture.webp")) return { format:"module", source:'export default "can.webp";', shortCircuit:true };
    return nextLoad(url, context);
  },
});
const { mountHomeObject } = await import("./home-object-scene.js");
assets.deregister();

class Card extends EventTarget {
  dataset = {};
  captures = new Set();
  matches() { return false; }
  getBoundingClientRect() { return { left:0, top:0, right:200, bottom:200 }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) {
    this.captures.delete(id);
    pointer(this, "lostpointercapture", { pointerId:id });
  }
}

function pointer(target, type, properties = {}) {
  const event = new Event(type, { cancelable:true });
  Object.defineProperties(event, Object.fromEntries(Object.entries({
    button:0, buttons:1, pointerId:1, clientX:100, clientY:100, timeStamp:0,
    ...properties,
  }).map(([name, value]) => [name, { value }])));
  target.dispatchEvent(event);
}

async function setup(t, reducedMotion = false) {
  const card = new Card();
  const canvas = new EventTarget();
  const host = { dataset:{}, clientWidth:200, closest:() => card, querySelector:() => canvas };
  const document = Object.assign(new EventTarget(), {
    hidden:false,
    createElement:() => ({ getContext:() => ({
      createImageData:(width, height) => ({ data:new Uint8ClampedArray(width * height * 4) }),
      putImageData() {},
    }) }),
  });
  const window = new EventTarget();
  const frames = new Map();
  let frameId = 0, time = 0;
  const globals = {
    document, window,
    matchMedia:() => ({ matches:reducedMotion }),
    ResizeObserver:class { observe() {} disconnect() {} },
    IntersectionObserver:class { observe() {} disconnect() {} },
    requestAnimationFrame:callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame:id => frames.delete(id),
  };
  const originals = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable:true, writable:true, value });
  let dispose;
  t.after(() => {
    dispose?.();
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dispose = await mountHomeObject(host, "disc");
  const renderer = renderers.at(-1);
  function step(count = 20) {
    for (let i = 0; i < count; i++) {
      time += 50;
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(time);
    }
  }
  const orientation = () => [...renderer.pivot.quaternion.toArray(), ...renderer.pivot.children[0].quaternion.toArray()];
  return { card, document, window, dispose, step, orientation };
}

for (const interruption of ["blur", "hidden", "outside-release", "missing-release", "secondary-button"]) {
  test(`disc resumes after ${interruption} interrupts a drag`, async t => {
    const { card, document, window, step, orientation } = await setup(t);
    pointer(card, "pointerdown");
    pointer(card, "pointermove", { clientX:125, timeStamp:100 });
    const held = orientation();
    step();
    assert.deepEqual(orientation(), held, "the disc stays held during a drag");

    if (interruption === "blur") window.dispatchEvent(new Event("blur"));
    if (interruption === "hidden") {
      document.hidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
      step();
      assert.deepEqual(orientation(), held);
      document.hidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    }
    if (interruption === "outside-release") pointer(window, "pointerup", { clientX:300, buttons:0, timeStamp:1200 });
    if (interruption === "missing-release") pointer(card, "pointermove", { buttons:0, timeStamp:1200 });
    if (interruption === "secondary-button") pointer(card, "pointermove", { buttons:2, timeStamp:1200 });

    const released = orientation();
    assert.deepEqual(released, held, "releasing does not move the disc");
    step();
    assert.notDeepEqual(orientation(), held, "idle rotation resumes");
    assert.equal(card.dataset.objectDragging, undefined);
    assert.equal(card.hasPointerCapture(1), false);
  });
}

test("disc keeps spinning on hover and after a normal release", async t => {
  const { card, step, orientation } = await setup(t);
  card.dispatchEvent(new Event("pointerenter"));
  const beforeHover = orientation();
  step(100);
  assert.notDeepEqual(orientation(), beforeHover);
  pointer(card, "pointerdown");
  pointer(card, "pointermove", { clientX:130, timeStamp:100 });
  pointer(card, "pointerup", { buttons:0, timeStamp:150 });
  const released = orientation();
  step(100);
  assert.notDeepEqual(orientation(), released);
});

test("changing pages releases capture without resetting the disc", async t => {
  const { card, dispose, step, orientation } = await setup(t);
  pointer(card, "pointerdown");
  pointer(card, "pointermove", { clientX:125, timeStamp:100 });
  const beforeSwitch = orientation();
  dispose.setInteractionTarget(new Card());
  assert.deepEqual(orientation(), beforeSwitch);
  assert.equal(card.hasPointerCapture(1), false);
  step();
  assert.notDeepEqual(orientation(), beforeSwitch);
});

test("reduced motion still disables automatic rotation", async t => {
  const { step, orientation } = await setup(t, true);
  const before = orientation();
  step();
  assert.deepEqual(orientation(), before);
});
