import assert from "node:assert/strict";
import test from "node:test";
import { isObjectInViewport } from "./shared-object-visibility.js";

const viewport = { width:1280, height:720 };
const rect = { left:100, top:200, width:200, height:200 };

test("visible and partially visible objects keep their shared movement", () => {
  assert.equal(isObjectInViewport(rect, viewport), true);
  assert.equal(isObjectInViewport({ ...rect, left:-100 }, viewport), true);
  assert.equal(isObjectInViewport({ ...rect, top:700 }, viewport), true);
});

test("objects outside any viewport edge use a local reveal", () => {
  for (const outside of [{ left:-200 }, { left:1280 }, { top:-200 }, { top:720 }]) {
    assert.equal(isObjectInViewport({ ...rect, ...outside }, viewport), false);
  }
  assert.equal(isObjectInViewport(null, viewport), false);
  assert.equal(isObjectInViewport({ ...rect, width:0 }, viewport), false);
});

test("visibility follows the visual viewport when zoomed or panned", () => {
  const zoomed = { offsetLeft:200, offsetTop:300, width:390, height:600 };
  assert.equal(isObjectInViewport({ ...rect, left:0, top:0 }, zoomed), false);
  assert.equal(isObjectInViewport({ ...rect, left:180, top:320 }, zoomed), true);
});
