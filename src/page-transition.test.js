import test from "node:test";
import assert from "node:assert/strict";
import { createPageTransition, pageTransitionTiming } from "./page-transition.js";

function setup() {
  const changes = [];
  const timers = new Map();
  let nextId = 0;
  const controller = createPageTransition("explorations", state => changes.push(state), {
    schedule(callback, duration) {
      const id = ++nextId;
      timers.set(id, { callback, duration });
      return id;
    },
    cancel: id => timers.delete(id),
  });
  return {
    controller, timers, changes,
    state: () => changes.at(-1),
    advance() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
    },
  };
}

test("navigation keeps the current content until its exit ends, then enters the chosen view", () => {
  const f = setup();
  assert.equal(f.changes.length, 0);
  f.controller.navigate("about");
  assert.deepEqual(f.state(), { view: "explorations", target: "about", phase: "exiting" });
  assert.equal([...f.timers.values()][0].duration, pageTransitionTiming.exit + 80);
  f.controller.completeExit("explorations");
  assert.deepEqual(f.state(), { view: "about", target: "about", phase: "entering" });
  assert.equal([...f.timers.values()][0].duration, pageTransitionTiming.enter);
  f.advance();
  assert.equal(f.state().phase, "idle");
  assert.equal(f.timers.size, 0);
});

test("an exit notification from a different view cannot commit navigation", () => {
  const f = setup();
  f.controller.navigate("about");
  f.controller.completeExit("fuse");
  assert.equal(f.state().view, "explorations");
  assert.equal(f.state().phase, "exiting");
  f.advance();
  assert.equal(f.state().view, "about");
});

test("rapid tab switches choose only the latest view without restarting the exit", () => {
  const f = setup();
  f.controller.navigate("fuse");
  const timer = [...f.timers.keys()][0];
  f.controller.navigate("about");
  f.controller.navigate("about");
  assert.deepEqual([...f.timers.keys()], [timer]);
  f.advance();
  assert.equal(f.state().view, "about");
  assert.ok(f.changes.every(state => state.view !== "fuse"));
});

test("returning to the current view reverses its exit and cancels the pending switch", () => {
  const f = setup();
  f.controller.navigate("about");
  const staleExit = [...f.timers.values()][0].callback;
  f.controller.navigate("explorations");
  assert.deepEqual(f.state(), { view: "explorations", target: "explorations", phase: "entering" });
  staleExit();
  f.advance();
  assert.equal(f.state().phase, "idle");
  assert.ok(f.changes.every(state => state.view === "explorations"));
});

test("a new choice during entrance cannot be overwritten by the previous completion", () => {
  const f = setup();
  f.controller.navigate("fuse");
  f.advance();
  const staleEnter = [...f.timers.values()][0].callback;
  f.controller.navigate("about");
  staleEnter();
  assert.equal(f.state().phase, "exiting");
  f.advance();
  assert.equal(f.state().view, "about");
});

test("keyboard and reduced-motion navigation settles immediately without leftover timers", () => {
  const f = setup();
  f.controller.navigate("about");
  const staleExit = [...f.timers.values()][0].callback;
  f.controller.navigate("fuse", { instant: true });
  staleExit();
  assert.deepEqual(f.state(), { view: "fuse", target: "fuse", phase: "idle" });
  assert.equal(f.timers.size, 0);
  f.controller.navigate("about");
  f.controller.finish();
  assert.deepEqual(f.state(), { view: "about", target: "about", phase: "idle" });
  assert.equal(f.timers.size, 0);
});

test("unmounting cancels all pending work and ignores stale callbacks", () => {
  const f = setup();
  f.controller.navigate("about");
  const staleExit = [...f.timers.values()][0].callback;
  f.controller.dispose();
  staleExit();
  f.controller.navigate("fuse");
  assert.equal(f.changes.length, 1);
  assert.equal(f.timers.size, 0);
});
