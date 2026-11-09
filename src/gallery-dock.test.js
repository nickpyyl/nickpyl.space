import test from 'node:test';
import assert from 'node:assert/strict';
import { getDockTransforms, getPressedTransforms } from './gallery-dock.js';

const items = [
  { left: -80, width: 160 },
  { left: 88, width: 160 },
  { left: 256, width: 284 },
  { left: 548, width: 160 },
];

test('gallery zoom peaks under the pointer with a gentle falloff for neighbors', () => {
  const result = getDockTransforms(items, 168, { radius: 288 });
  assert.equal(result[1].scale, 1.35);
  assert.ok(result[0].scale > result[2].scale);
  assert.ok(result[2].scale > 1);
  assert.equal(result[3].scale, 1);
  assert.ok(Math.abs(result[1].x) < .00001);
});

test('different image widths retain their gaps throughout magnification', () => {
  for (let x = -80; x <= 708; x += 7) {
    const result = getDockTransforms(items, x, { radius: 288 });
    for (let index = 1; index < items.length; index++) {
      const left = items[index].left + result[index].x - items[index].width * (result[index].scale - 1) / 2;
      const previous = items[index - 1];
      const right = previous.left + result[index - 1].x + previous.width * (1 + result[index - 1].scale) / 2;
      assert.ok(Math.abs(left - right - 8) < .00001);
    }
  }
});

test('magnification keeps the point underneath the cursor anchored in place', () => {
  for (const x of [100, 168, 240, 300, 480, 600]) {
    const index = items.findIndex(item => x >= item.left && x <= item.left + item.width);
    const item = items[index];
    const result = getDockTransforms(items, x, { radius: 288 })[index];
    const center = item.left + item.width / 2;
    assert.ok(Math.abs(center + result.x + (x - center) * result.scale - x) < .00001);
  }
});

test('a distant pointer or zero magnification leaves all images at rest', () => {
  for (const result of [getDockTransforms(items, 2000, { radius: 288 }), getDockTransforms(items, 168, { radius: 288, magnification: 0 })]) {
    assert.ok(result.every(item => item.x === 0 && item.scale === 1));
  }
});

test('pressed media aligns with the page gutter and keeps the gallery baseline and gaps', () => {
  const row = items.map(item => ({ ...item, y: 360, height: 160 }));
  const result = getPressedTransforms(row, 1, { left: 28, top: 100, maxWidth: 1224 });
  const selected = result[1];
  assert.equal(selected.scale, 2.05);
  assert.ok(Math.abs(row[1].left + selected.x - row[1].width * (selected.scale - 1) / 2 - 28) < .00001);
  assert.ok(Math.abs(row[1].y + selected.y + row[1].height * selected.scale / 2 - 440) < .00001);
  for (let index = 1; index < row.length; index++) {
    const left = row[index].left + result[index].x - row[index].width * (result[index].scale - 1) / 2;
    const previous = row[index - 1];
    const right = previous.left + result[index - 1].x + previous.width * (1 + result[index - 1].scale) / 2;
    assert.ok(Math.abs(left - right - 8) < .00001);
  }
});

test('pressed media fits a narrow screen and stays below the header', () => {
  const row = [{ left: 280, width: 380, height: 226, y: 397 }];
  const result = getPressedTransforms(row, 0, { left: 24, top: 160, maxWidth: 342 })[0];
  assert.ok(row[0].width * result.scale <= 342);
  assert.ok(row[0].y + result.y - row[0].height * result.scale / 2 >= 160);
  const short = getPressedTransforms(row, 0, { left: 24, top: 350, maxWidth: 1000 })[0];
  assert.ok(Math.abs(row[0].y + short.y - row[0].height * short.scale / 2 - 350) < .00001);
});

test('mobile expansion leaves room for a neighboring card without changing the baseline', () => {
  const row = [
    { left: -168, width: 180, height: 180, y: 432 },
    { left: 20, width: 180, height: 180, y: 432 },
    { left: 208, width: 305, height: 180, y: 432 },
  ];
  const result = getPressedTransforms(row, 1, { left: 20, top: 96, maxWidth: 353, maxScale: 1.6 });
  const selected = row[1];
  const pose = result[1];
  const right = selected.left + pose.x + selected.width * (1 + pose.scale) / 2;
  const neighborLeft = row[2].left + result[2].x;
  assert.equal(pose.scale, 1.6);
  assert.ok(Math.abs(selected.left + pose.x - selected.width * (pose.scale - 1) / 2 - 20) < .00001);
  assert.equal(selected.y + pose.y + selected.height * pose.scale / 2, 522);
  assert.equal(neighborLeft - right, 8);
  assert.ok(neighborLeft < 393);
});

test('a stationary pointer follows the moving line without measuring layout every frame', async t => {
  const { createGalleryDock } = await import('./gallery-dock.js');
  let measurements = 0;
  let position = 1000;
  let pending;
  const listeners = new Map();
  const style = () => ({ removeProperty(key) { delete this[key]; } });
  const elements = [{ style: style() }, { style: style() }];
  const sequence = {
    children: elements,
    getBoundingClientRect() { measurements++; return { left: 0, top: 200, height: 160 }; },
  };
  const rail = {
    querySelectorAll: () => [sequence],
    closest: () => ({ dataset: {} }),
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener() {},
  };
  const globals = {
    window: { matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }), addEventListener() {}, removeEventListener() {} },
    document: { hidden: false, addEventListener() {}, removeEventListener() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    getComputedStyle() { measurements++; return { columnGap: '8', width: '160' }; },
    requestAnimationFrame(callback) { pending = callback; return 1; },
    cancelAnimationFrame() { pending = undefined; },
  };
  const restore = [];
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    restore.push(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const dock = createGalleryDock(rail, { scroll: { getPosition: () => position } });
  t.after(() => { dock.destroy(); restore.forEach(reset => reset()); });
  listeners.get('pointermove')({ pointerType: 'mouse', clientX: 80, clientY: 280 });
  pending();
  const first = elements[0].style.transform;
  const initialMeasurements = measurements;
  position += 80;
  pending();
  assert.notEqual(elements[0].style.transform, first, 'magnification follows the row under a stationary pointer');
  assert.equal(measurements, initialMeasurements, 'hover frames reuse measured geometry');
  listeners.get('pointerleave')();
  assert.equal(pending, undefined, 'no frame loop continues when the pointer leaves');
});
