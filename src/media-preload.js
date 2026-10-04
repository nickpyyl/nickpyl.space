// Download compressed files, not hidden video elements/decoders. This cache lives
// for the app session, so changing routes never cancels or repeats completed work.
export function createMediaPreloader({
  fetchMedia = (...args) => fetch(...args),
  createObjectURL = blob => URL.createObjectURL(blob),
  revokeObjectURL = url => URL.revokeObjectURL(url),
  concurrency = 2,
  timeoutMs = 20000,
} = {}) {
  const entries = new Map();
  let queue = [];
  let active = 0;
  let paused = true;
  let disposed = false;

  async function download(entry) {
    active++;
    entry.state = "loading";
    entry.controller = new AbortController();
    const timeout = setTimeout(() => entry.controller.abort(), timeoutMs);
    try {
      const response = await fetchMedia(entry.src, {
        signal: entry.controller.signal,
        cache: "force-cache",
        priority: entry.priority ? "auto" : "low",
      });
      if (!response.ok) throw new Error("Media unavailable");
      const blob = await response.blob();
      if (!disposed && !entry.controller.signal.aborted) {
        entry.url = createObjectURL(blob);
        entry.state = "ready";
      }
    } catch {
      // Streaming the original URL remains available if background loading fails.
    } finally {
      clearTimeout(timeout);
      if (entry.state === "loading") entry.state = "failed";
      entry.controller = null;
      active--;
      pump();
    }
  }

  function pump() {
    while (!paused && !disposed && active < concurrency && queue.length) {
      void download(queue.shift());
    }
  }

  return {
    enqueue(items, { priority = false } = {}) {
      if (disposed) return;
      const promoted = [];
      for (const { src } of items) {
        let entry = entries.get(src);
        if (!entry) {
          entry = { src, state: "queued", priority, attempts: 1 };
          entries.set(src, entry);
          queue.push(entry);
        } else if (entry.state === "failed" && priority && entry.attempts < 2) {
          // One intent-driven retry, never a background retry loop.
          entry.state = "queued";
          entry.attempts++;
          queue.push(entry);
        }
        if (priority && entry.state === "queued" && !promoted.includes(entry)) {
          entry.priority = true;
          promoted.push(entry);
        }
      }
      if (promoted.length) {
        const promotedSet = new Set(promoted);
        queue = [...promoted, ...queue.filter(entry => !promotedSet.has(entry))];
      }
      pump();
    },
    getSource(src) { return entries.get(src)?.url ?? src; },
    resume() { paused = false; pump(); },
    pause() { paused = true; },
    dispose() {
      disposed = true;
      queue = [];
      for (const entry of entries.values()) {
        entry.controller?.abort();
        if (entry.url) revokeObjectURL(entry.url);
      }
      entries.clear();
    },
  };
}

export const mediaPreloader = createMediaPreloader();
export const getMediaSource = src => mediaPreloader.getSource(src);

export function canPreloadMedia() {
  const connection = navigator.connection;
  return !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType);
}

if (import.meta.hot) import.meta.hot.dispose(() => mediaPreloader.dispose());
