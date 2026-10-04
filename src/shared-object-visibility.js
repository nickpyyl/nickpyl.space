export function isObjectInViewport(rect, viewport) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return false;
  const left = viewport.offsetLeft ?? 0;
  const top = viewport.offsetTop ?? 0;
  return rect.left < left + viewport.width && rect.left + rect.width > left
    && rect.top < top + viewport.height && rect.top + rect.height > top;
}
