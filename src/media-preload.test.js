import assert from "node:assert/strict";
import { setImmediate as flush } from "node:timers/promises";
import { test } from "node:test";
import { createMediaPreloader } from "./media-preload.js";

const items = (...sources) => sources.map(src => ({ src }));

function setup(t, options = {}) {
  const requests = [];
  const revoked = [];
  const loader = createMediaPreloader({
    fetchMedia: (src, options) => new Promise((resolve, reject) => {
      const request = { src, options, finish: () => resolve({ ok: true, blob: async () => src }), fail: reject };
      options.signal.addEventListener("abort", () => reject(new Error("Aborted")), { once: true });
      requests.push(request);
    }),
    createObjectURL: blob => `blob:${blob}`,
    revokeObjectURL: url => revoked.push(url),
    ...options,
  });
  t.after(() => loader.dispose());
  return { loader, requests, revoked };
}

test("warms the entire queue with at most two downloads and reuses completed files", async t => {
  const { loader, requests } = setup(t);
  loader.enqueue(items("a", "b", "c", "d"));
  assert.equal(requests.length, 0, "initial rendering gets priority");
  loader.resume();
  assert.deepEqual(requests.map(item => item.src), ["a", "b"]);
  loader.enqueue(items("a", "b", "c", "d"));
  assert.equal(requests.length, 2, "pending downloads are not duplicated");
  requests[0].finish();
  await flush();
  assert.equal(loader.getSource("a"), "blob:a");
  assert.equal(loader.getSource("b"), "b", "unfinished files still support normal streaming");
  assert.deepEqual(requests.map(item => item.src), ["a", "b", "c"]);
  requests[1].finish();
  await flush();
  requests[2].finish();
  requests[3].finish();
  await flush();
  loader.enqueue(items("a", "b", "c", "d"), { priority: true });
  assert.equal(requests.length, 4, "navigation does not download files again");
  assert.deepEqual(["a", "b", "c", "d"].map(loader.getSource), ["blob:a", "blob:b", "blob:c", "blob:d"]);
  assert.ok(requests.every(item => item.options.cache === "force-cache"));
});

test("hover/focus promotes the destination without interrupting in-flight files", async t => {
  const { loader, requests } = setup(t);
  loader.enqueue(items("a", "b", "c", "d", "e"));
  loader.resume();
  loader.enqueue(items("e", "d", "e"), { priority: true });
  requests[0].finish();
  requests[1].finish();
  await flush();
  assert.deepEqual(requests.map(item => item.src), ["a", "b", "e", "d"]);
  assert.equal(requests[2].options.priority, "auto");
  assert.equal(requests[0].options.signal.aborted, false);
});

test("pausing allows current downloads to finish and resumes remaining work", async t => {
  const { loader, requests } = setup(t);
  loader.enqueue(items("a", "b", "c"));
  loader.resume();
  loader.pause();
  requests.forEach(item => item.finish());
  await flush();
  assert.equal(requests.length, 2);
  assert.equal(loader.getSource("a"), "blob:a");
  loader.resume();
  assert.equal(requests[2].src, "c");
});

test("failed downloads do not block the queue; intent permits only one retry", async t => {
  const { loader, requests } = setup(t, { concurrency: 1 });
  loader.enqueue(items("bad", "good"));
  loader.resume();
  requests[0].fail(new Error("Network failure"));
  await flush();
  assert.equal(loader.getSource("bad"), "bad");
  assert.equal(requests[1].src, "good");
  requests[1].finish();
  await flush();
  loader.enqueue(items("bad"));
  assert.equal(requests.length, 2);
  loader.enqueue(items("bad"), { priority: true });
  requests[2].fail(new Error("Still unavailable"));
  await flush();
  loader.enqueue(items("bad"), { priority: true });
  assert.equal(requests.length, 3);
});

test("an HTTP error skips that file and advances to the next", async t => {
  const requests = [];
  const { loader } = setup(t, { concurrency: 1, fetchMedia: async src => {
    requests.push(src);
    return { ok: src !== "missing", blob: async () => src };
  } });
  loader.enqueue(items("missing", "good"));
  loader.resume();
  await flush();
  assert.deepEqual(requests, ["missing", "good"]);
  assert.equal(loader.getSource("missing"), "missing");
  assert.equal(loader.getSource("good"), "blob:good");
});

test("dispose aborts pending downloads and releases cached blobs", async t => {
  const { loader, requests, revoked } = setup(t);
  loader.enqueue(items("a", "b", "c", "d"));
  loader.resume();
  requests[0].finish();
  await flush();
  loader.dispose();
  await flush();
  assert.deepEqual(revoked, ["blob:a"]);
  assert.equal(requests[1].options.signal.aborted, true);
  assert.equal(requests[2].options.signal.aborted, true);
  loader.enqueue(items("e"));
  loader.resume();
  assert.equal(requests.length, 3);
});

test("late responses after disposal cannot retain new blobs", async t => {
  let finish;
  let created = 0;
  const { loader } = setup(t, {
    fetchMedia: () => new Promise(resolve => { finish = resolve; }),
    createObjectURL: () => { created++; return "blob:late"; },
  });
  loader.enqueue(items("late"));
  loader.resume();
  loader.dispose();
  finish({ ok: true, blob: async () => "late" });
  await flush();
  assert.equal(created, 0);
});

test("a stalled request times out and releases its queue slot", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { loader, requests } = setup(t, { concurrency: 1, timeoutMs: 20000 });
  loader.enqueue(items("stalled", "next"));
  loader.resume();
  t.mock.timers.tick(20000);
  await flush();
  assert.equal(requests[0].options.signal.aborted, true);
  assert.equal(requests[1].src, "next");
  assert.equal(loader.getSource("stalled"), "stalled");
});
