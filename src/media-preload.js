// Keep a small set of fully downloaded media available across section changes.
// Blob URLs also avoid a second video range request when a warmed section mounts.
const warmedSources = new Map();

export function getMediaSource(src) {
  return warmedSources.get(src) ?? src;
}

export function waitForMediaReady(element, signal) {
  return new Promise((resolve) => {
    const ready = () => element.tagName === "VIDEO"
      ? element.readyState >= 2
      : element.complete;
    if (signal.aborted || ready()) return resolve();
    const finish = () => {
      for (const event of ["load", "loadeddata", "canplay", "error"]) {
        element.removeEventListener(event, finish);
      }
      signal.removeEventListener("abort", finish);
      resolve();
    };
    for (const event of ["load", "loadeddata", "canplay", "error"]) {
      element.addEventListener(event, finish, { once: true });
    }
    signal.addEventListener("abort", finish, { once: true });
  });
}

export async function warmMedia(items, signal) {
  for (const item of items) {
    if (signal.aborted) return;
    if (warmedSources.has(item.src)) continue;
    try {
      const response = await fetch(item.src, { signal, cache: "force-cache", priority: "low" });
      if (!response.ok) continue;
      const blob = await response.blob();
      if (signal.aborted) return;
      if (!warmedSources.has(item.src)) {
        warmedSources.set(item.src, URL.createObjectURL(blob));
      }
    } catch {
      // Warming is optional: normal media loading remains the fallback.
      if (signal.aborted) return;
    }
  }
}
