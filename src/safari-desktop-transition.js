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
  const home = source.closest('.home-page');
  const returningHome = !home;
  if (home) scrollPositions.set(section, home.scrollTop);
  // Keep the real gallery mounted for its short exit. Replacing its video
  // surfaces with a page-sized snapshot is both expensive and flash-prone in
  // WebKit, even when the replacement images have already decoded.
  let outgoing = home ? capturePage(home, selector) : null;
  const exits = [];
  if (returningHome) {
    const page = source.closest('.selected-work-page');
    for (const element of page?.querySelectorAll('.work-intro, .work-piece:first-of-type figcaption, .work-piece:not(:first-of-type), .work-rail-end') ?? []) {
      if (element.contains(source)) continue;
      const bounds = element.getBoundingClientRect();
      if (bounds.right <= 0 || bounds.left >= innerWidth || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
      exits.push(element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'ease-out', fill: 'both' }));
    }
  }
  let shared;
  const animations = [];
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    for (const animation of [...exits, ...animations]) animation.cancel();
    outgoing?.remove();
    shared?.cancel();
  };
  const prepared = returningHome
    ? Promise.all(exits.map(animation => animation.finished.catch(() => {}))).then(() => true)
    : Promise.resolve(outgoing?.ready);
  const finished = prepared.then(async ready => {
    if (cancelled) return;
    if (outgoing && !ready) { outgoing.remove(); outgoing = null; }
    const canvas = capture(media);
    if (!canvas) { cancel(); updatePage(); return; }
    outgoing?.mount();
    shared = createSafariPreviewSnapshot(source, canvas, media);
    if (!updatePage()) { cancel(); return; }
    const destination = document.querySelector(selector);
    const nextMedia = destination?.querySelector(mediaSelector);
    if (!destination || !nextMedia) { cancel(); return; }
    const destinationHome = destination.closest('.home-page');
    if (destinationHome) destinationHome.scrollTop = scrollPositions.get(section) ?? 0;
    const to = destination.getBoundingClientRect();
    const base = shared.stage(destination, nextMedia);
    // Keep the decoder surface at its final size. Scale and crop on the
    // compositor instead of resizing a live Safari video on every frame.
    const motion = shared.layer.animate(sharedPreviewFrames(from, to, base),
      { duration: returningHome ? 350 : 440, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'both' });
    animations.push(motion);
    if (outgoing) {
      const exit = outgoing.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'ease-out', fill: 'both' });
      animations.push(exit);
      exit.finished.catch(() => {}).finally(() => outgoing.remove());
    }
    const page = destination.closest('.selected-work-page') ?? destinationHome;
    // An opacity reveal avoids filtering several large decoded video surfaces
    // every frame. These overrides belong only to the Safari-rendered page.
    for (const piece of page?.querySelectorAll('.work-piece, .work-intro, .work-rail-end') ?? []) piece.style.filter = 'none';
    let galleryIndex = 0;
    for (const element of page?.querySelectorAll(destinationHome
      ? '.home-intro > :not(.home-destinations), .home-destination'
      : '.work-intro, .work-piece:first-of-type figcaption, .work-piece:not(:first-of-type), .work-rail-end') ?? []) {
      if (element.contains(destination)) continue;
      const bounds = element.getBoundingClientRect();
      if (bounds.right <= 0 || bounds.left >= innerWidth || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
      const text = element.matches('.work-intro, .home-intro > :not(.home-destinations)');
      animations.push(element.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: text ? 380 : 320, delay: (text ? 160 : 240 + Math.min(galleryIndex++, 4) * 45) - (returningHome ? 90 : 0),
        easing: text ? 'cubic-bezier(.25,.1,.25,1)' : 'cubic-bezier(.22,1,.36,1)', fill: 'both' }));
    }
    await motion.finished.catch(() => {});
    if (cancelled) return;
    motion.cancel();
    shared.finish(nextMedia, () => media.currentTime || 0);
    await Promise.all(animations.slice(1).map(animation => animation.finished.catch(() => {})));
    for (const animation of [...exits, ...animations]) animation.cancel();
  });
  finished.catch(cancel);
  return { finished, skipTransition: cancel };
}

export function sharedPreviewFrames(from, to, base = to) {
  // Uniform scale preserves the clip's proportions. Insets interpolate the
  // square home crop into the gallery's aspect ratio without stretching it.
  return Array.from({ length: 33 }, (_, index) => {
    const progress = index / 32;
    const mix = (a, b) => a + (b - a) * progress;
    const width = mix(from.width, to.width), height = mix(from.height, to.height);
    const scale = Math.max(width / base.width, height / base.height);
    const insetX = Math.max(0, (base.width - width / scale) / 2);
    const insetY = Math.max(0, (base.height - height / scale) / 2);
    const x = mix(from.left, to.left) - to.left - insetX * scale;
    const y = mix(from.top, to.top) - to.top - insetY * scale;
    return { offset: progress, transform: `translate(${x}px,${y}px) scale(${scale})`,
      clipPath: `inset(${insetY}px ${insetX}px)` };
  });
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
  const decodedFrames = [];
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.removeAttribute('id');
  for (const element of copy.querySelectorAll('[id]')) element.removeAttribute('id');
  // Inert copies must never start extra video decoders or downloads.
  const originals = page.querySelectorAll('video');
  for (const [index, video] of [...copy.querySelectorAll('video')].entries()) {
    const original = originals[index];
    const rect = original.getBoundingClientRect();
    const visible = original.dataset.active !== 'false' && !original.closest(selector)
      && original.readyState >= 2 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
    const frame = visible ? capture(original) : null;
    if (frame) {
      // WebKit can expose a newly mounted canvas as blank for its first paint.
      // Decode immutable images while the original page is still visible, then
      // mount the fully prepared copy and swap pages in the same update.
      const image = document.createElement('img');
      image.className = original.className;
      image.style.cssText = original.style.cssText;
      if (original.dataset.active) image.dataset.active = original.dataset.active;
      image.src = frame.toDataURL('image/jpeg', .9);
      decodedFrames.push(image.decode());
      video.replaceWith(image);
    } else video.remove();
  }
  copy.querySelector(selector)?.style.setProperty('visibility', 'hidden');
  Object.assign(copy.style, { position: 'fixed', inset: '0', zIndex: '100000', pointerEvents: 'none' });
  const scrollTop = page.scrollTop;
  const originalRails = page.querySelectorAll('.work-rail');
  const scrollLeft = [...originalRails].map(rail => rail.scrollLeft);
  return {
    element: copy,
    ready: Promise.all(decodedFrames).then(() => true, () => false),
    mount() {
      document.body.append(copy);
      copy.scrollTop = scrollTop;
      for (const [index, rail] of [...copy.querySelectorAll('.work-rail')].entries()) rail.scrollLeft = scrollLeft[index];
    },
    remove: () => copy.remove(),
  };
}
