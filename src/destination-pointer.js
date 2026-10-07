// Keep pointer tracking out of React and avoid layout reads between pointer
// writes. Measurements change only when entering, scrolling, or resizing.
export function createDestinationPointer(nav, tooltip, onDestination) {
  let metrics, point, frame, active = false, destination;
  const measure = () => {
    const bounds = nav.getBoundingClientRect();
    const labels = [...nav.querySelectorAll('.home-destination-label')];
    metrics = { midpoint: bounds.left + bounds.width / 2,
      halfWidth: Math.max(...labels.map(label => label.offsetWidth)) / 2,
      halfHeight: Math.max(...labels.map(label => label.offsetHeight)) / 2,
      fontSize: getComputedStyle(labels[0]).fontSize };
  };
  const paint = () => {
    frame = undefined;
    if (!active) return;
    if (!metrics) measure();
    const next = point.x < metrics.midpoint ? 'work' : 'explorations';
    const x = Math.min(innerWidth - metrics.halfWidth - 8, Math.max(metrics.halfWidth + 8, point.x));
    const y = Math.min(innerHeight - metrics.halfHeight - 8, Math.max(metrics.halfHeight + 8, point.y));
    tooltip.style.setProperty('--label-x', `${x}px`);
    tooltip.style.setProperty('--label-y', `${y}px`);
    tooltip.style.setProperty('--label-font-size', metrics.fontSize);
    tooltip.dataset.pointerActive = 'true';
    nav.dataset.pointerActive = 'true';
    if (next !== destination) { destination = next; onDestination(next); }
  };
  const hide = () => {
    active = false; metrics = undefined;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    delete nav.dataset.pointerActive;
    delete tooltip.dataset.pointerActive;
  };
  return {
    move(event) {
      if (event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY }; active = true;
      if (frame === undefined) frame = requestAnimationFrame(paint);
    },
    hide,
    dispose: hide,
  };
}
