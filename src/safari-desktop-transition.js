import { createSafariPreviewSnapshot } from './safari-preview-snapshot.js';

const scrollPositions = new Map();
const mediaSelector = 'video[data-active="true"], img[data-active="true"], video:not([data-active]), img:not([data-active])';

// Mirror the desktop View Transition choreography without asking WebKit to
// snapshot, resize, or composite the page. Chromium keeps its native path.
export function startSafariDesktopTransition(section, updatePage) {
  const selector = `[data-shared-preview="${section}"]`;
  const source = document.querySelector(selector);
  const media = source?.querySelector(mediaSelector);
  const from = source?.getBoundingClientRect();
  if (!media || !from || from.right <= 0 || from.left >= innerWidth || from.bottom <= 0 || from.top >= innerHeight) return null;
  if (media.tagName === 'IMG' ? !media.complete || !media.naturalWidth : media.readyState < 2) return null;
  const canvas = capture(media);
  if (!canvas) return null;
  const home = source.closest('.home-page');
  if (home) scrollPositions.set(section, home.scrollTop);
  const outgoing = capturePage(source.closest('.selected-work-page') ?? home, selector);
  const shared = createSafariPreviewSnapshot(source, canvas, media);
  const animations = [];
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    for (const animation of animations) animation.cancel();
    outgoing?.remove();
    shared.cancel();
  };
  const finished = Promise.resolve().then(async () => {
    if (cancelled || !updatePage()) { cancel(); return; }
    const destination = document.querySelector(selector);
    const nextMedia = destination?.querySelector(mediaSelector);
    if (!destination || !nextMedia) { cancel(); return; }
    const destinationHome = destination.closest('.home-page');
    if (destinationHome) destinationHome.scrollTop = scrollPositions.get(section) ?? 0;
    const to = destination.getBoundingClientRect();
    shared.stage(destination, nextMedia);
    // The live media uses object-fit throughout the resize, so differently shaped
    // clips crop smoothly rather than being stretched by independent x/y scales.
    const motion = shared.layer.animate([
      { transform: `translate(${from.left - to.left}px,${from.top - to.top}px)`, width: `${from.width}px`, height: `${from.height}px` },
      { transform: 'translate(0,0)', width: `${to.width}px`, height: `${to.height}px` },
    ], { duration: 440, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'both' });
    animations.push(motion);
    if (outgoing) {
      const exit = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'ease-out', fill: 'both' });
      animations.push(exit);
      exit.finished.catch(() => {}).finally(() => outgoing.remove());
    }
    const page = destination.closest('.selected-work-page') ?? destinationHome;
    let galleryIndex = 0;
    for (const element of page?.querySelectorAll(destinationHome
      ? '.home-intro > :not(.home-destinations), .home-destination'
      : '.work-intro, .work-piece:first-of-type figcaption, .work-piece:not(:first-of-type), .work-rail-end') ?? []) {
      if (element.contains(destination)) continue;
      const bounds = element.getBoundingClientRect();
      if (bounds.right <= 0 || bounds.left >= innerWidth || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
      const text = element.matches('.work-intro, .home-intro > :not(.home-destinations)');
      animations.push(element.animate(text
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, filter: 'blur(8px)' }, { opacity: .8, filter: 'blur(1.5px)', offset: .6 }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: text ? 380 : 320, delay: text ? 160 : 240 + Math.min(galleryIndex++, 4) * 45,
        easing: text ? 'cubic-bezier(.25,.1,.25,1)' : 'cubic-bezier(.22,1,.36,1)', fill: 'both' }));
    }
    await motion.finished.catch(() => {});
    if (cancelled) return;
    motion.cancel();
    shared.finish(nextMedia, () => media.currentTime || 0);
    await Promise.all(animations.slice(1).map(animation => animation.finished.catch(() => {})));
    for (const animation of animations) animation.cancel();
  });
  finished.catch(cancel);
  return { finished, skipTransition: cancel };
}

function capture(media) {
  const canvas = document.createElement('canvas');
  const width = media.videoWidth || media.naturalWidth;
  const height = media.videoHeight || media.naturalHeight;
  canvas.width = Math.min(width, 960);
  canvas.height = Math.round(canvas.width * height / width);
  canvas.className = 'preview-handoff-frame';
  try { canvas.getContext('2d').drawImage(media, 0, 0, canvas.width, canvas.height); }
  catch { return null; }
  return canvas;
}

function capturePage(page, selector) {
  if (!page) return null;
  const copy = page.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.removeAttribute('id');
  for (const element of copy.querySelectorAll('[id]')) element.removeAttribute('id');
  // Inert copies must never start extra video decoders or downloads.
  const originals = page.querySelectorAll('video');
  for (const [index, video] of [...copy.querySelectorAll('video')].entries()) {
    const original = originals[index];
    const rect = original.getBoundingClientRect();
    const visible = original.readyState >= 2 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
    const frame = visible ? capture(original) : null;
    if (frame) {
      frame.className = original.className;
      frame.style.cssText = original.style.cssText;
      if (original.dataset.active) frame.dataset.active = original.dataset.active;
      video.replaceWith(frame);
    } else video.remove();
  }
  copy.querySelector(selector)?.style.setProperty('visibility', 'hidden');
  Object.assign(copy.style, { position: 'fixed', inset: '0', zIndex: '100000', pointerEvents: 'none' });
  document.body.append(copy);
  copy.scrollTop = page.scrollTop;
  const originalRails = page.querySelectorAll('.work-rail');
  for (const [index, rail] of [...copy.querySelectorAll('.work-rail')].entries()) rail.scrollLeft = originalRails[index].scrollLeft;
  return copy;
}
