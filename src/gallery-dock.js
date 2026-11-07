const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => value * value * (3 - 2 * value);

export function getDockTransforms(items, pointerX, { radius, magnification = .35 } = {}) {
  const influence = items.map(item => {
    const distance = Math.abs(pointerX - (item.left + item.width / 2));
    return magnification * smooth(clamp(1 - distance / radius));
  });
  const extra = items.map((item, index) => item.width * influence[index]);
  const anchor = items.reduce((sum, item, index) => sum + extra[index] * clamp((pointerX - item.left) / item.width), 0);
  let before = 0;
  return items.map((item, index) => {
    const transform = { x: before + extra[index] / 2 - anchor, scale: 1 + influence[index] };
    before += extra[index];
    return transform;
  });
}

export function getPressedTransforms(items, selectedIndex, { left, top, maxWidth, maxScale = 2.05 }) {
  const selected = items[selectedIndex];
  const bottom = selected.y + selected.height / 2;
  const scale = Math.min(maxScale, maxWidth / selected.width, Math.max(.1, (bottom - top) / selected.height));
  const extra = selected.width * (scale - 1);
  const offset = left - selected.left;
  return items.map((item, index) => ({
    x: offset + (index === selectedIndex ? extra / 2 : index > selectedIndex ? extra : 0),
    y: index === selectedIndex ? selected.height * (1 - scale) / 2 : 0,
    scale: index === selectedIndex ? scale : 1,
  }));
}

export function createGalleryDock(rail, { reducedMotion = false, simple = false, onSelect = () => {} } = {}) {
  const sequences = [...rail.querySelectorAll('.gallery-sequence')];
  const elements = sequences.flatMap(sequence => [...sequence.children]);
  const gallery = rail.closest('.portfolio-gallery');
  const page = rail.closest('.portfolio-page');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let metrics;
  let point;
  let frame;
  let selected = null;

  function paint() {
    frame = undefined;
    if (!metrics) {
      metrics = sequences.flatMap(sequence => {
        const bounds = sequence.getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(sequence).columnGap);
        let left = bounds.left;
        return [...sequence.children].map(element => {
          const width = parseFloat(getComputedStyle(element).width);
          const item = { left, y: bounds.top + bounds.height / 2, width, height: bounds.height };
          left += width + gap;
          return item;
        });
      });
    }
    let transforms;
    if (selected !== null) {
      const margin = parseFloat(getComputedStyle(page.querySelector('.portfolio-top')).paddingLeft);
      transforms = getPressedTransforms(metrics, selected, {
        left: page.getBoundingClientRect().left + margin,
        top: page.querySelector('.portfolio-top').getBoundingClientRect().bottom + 32,
        maxWidth: rail.clientWidth - margin * 2,
        maxScale: simple ? 1.6 : 2.05,
      });
      gallery.style.setProperty('--caption-width', `${metrics[selected].width * transforms[selected].scale}px`);
    } else {
      const { height, y } = metrics[0];
      const proximity = smooth(clamp((height * .85 - Math.abs(point.y - y)) / (height * .35)));
      transforms = getDockTransforms(metrics, point.x, { radius: height * 1.8, magnification: .35 * proximity });
    }
    transforms.forEach(({ x, y = 0, scale }, index) => {
      elements[index].style.setProperty('--dock-x', `${x.toFixed(3)}px`);
      elements[index].style.setProperty('--dock-y', `${y.toFixed(3)}px`);
      elements[index].style.setProperty('--dock-scale', scale.toFixed(4));
    });
  }

  function schedule() {
    if ((point || selected !== null) && frame === undefined) frame = requestAnimationFrame(paint);
  }

  function move(event) {
    if (simple || selected !== null || reducedMotion || event.pointerType !== 'mouse' || !hover.matches) return;
    point = { x: event.clientX, y: event.clientY };
    schedule();
  }

  function invalidate() {
    metrics = undefined;
    schedule();
  }

  function reset() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    metrics = undefined;
    point = undefined;
    for (const element of elements) {
      element.style.removeProperty('--dock-x');
      element.style.removeProperty('--dock-y');
      element.style.removeProperty('--dock-scale');
    }
  }

  function leave() {
    if (selected === null) reset();
  }

  function clear() {
    if (selected === null) return;
    const transforms = elements.map(element => new DOMMatrixReadOnly(getComputedStyle(element).transform));
    const element = elements[selected];
    const transform = transforms[selected];
    const width = parseFloat(getComputedStyle(element).width);
    const baseLeft = element.getBoundingClientRect().left - transform.e + width * (transform.a - 1) / 2;
    const gutter = page.getBoundingClientRect().left + parseFloat(getComputedStyle(page.querySelector('.portfolio-top')).paddingLeft);
    const previousScroll = rail.scrollLeft;
    rail.scrollLeft += baseLeft - gutter;
    const scrollDelta = rail.scrollLeft - previousScroll;

    elements.forEach((item, index) => {
      const current = transforms[index];
      item.style.transition = 'none';
      item.style.setProperty('--dock-x', `${current.e + scrollDelta}px`);
      item.style.setProperty('--dock-y', `${current.f}px`);
      item.style.setProperty('--dock-scale', String(current.a));
    });
    // Preserve the visible pose while committing the row's new scroll position.
    element.getBoundingClientRect();
    for (const item of elements) item.style.removeProperty('transition');
    selected = null;
    onSelect(null);
    reset();
  }

  function toggle(element) {
    const index = elements.indexOf(element);
    if (index < 0) return;
    if (index === selected) return clear();
    selected = index;
    point = undefined;
    onSelect(index);
    invalidate();
  }

  function keydown(event) {
    if (event.key === 'Escape') clear();
    else leave();
  }

  function dismissOnClick(event) {
    if (selected === null) return;
    clear();
    if (rail.contains(event.target.closest('.gallery-open'))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const resize = new ResizeObserver(invalidate);
  resize.observe(rail);
  for (const sequence of sequences) resize.observe(sequence);
  rail.addEventListener('pointerenter', move);
  rail.addEventListener('pointermove', move);
  rail.addEventListener('pointerleave', leave);
  rail.addEventListener('pointercancel', leave);
  window.addEventListener('keydown', keydown);
  window.addEventListener('click', dismissOnClick, true);
  hover.addEventListener('change', leave);
  window.addEventListener('scroll', invalidate, true);
  window.addEventListener('blur', leave);

  function destroy() {
    reset();
    resize.disconnect();
    rail.removeEventListener('pointerenter', move);
    rail.removeEventListener('pointermove', move);
    rail.removeEventListener('pointerleave', leave);
    rail.removeEventListener('pointercancel', leave);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('click', dismissOnClick, true);
    hover.removeEventListener('change', leave);
    window.removeEventListener('scroll', invalidate, true);
    window.removeEventListener('blur', leave);
  }
  return { toggle, clear, destroy };
}
