// A decoded destination may still lag the live source by the time spent
// seeking. Align it under the opaque cover before blending the two videos.
export function alignSafariVideo(source, destination, reveal) {
  const rate = destination.playbackRate ?? 1;
  const loop = destination.loop;
  destination.loop = true;
  let frame, cancelled = false;
  const stop = () => {
    cancelled = true;
    if (frame !== undefined) destination.cancelVideoFrameCallback?.(frame);
    destination.playbackRate = rate;
    destination.loop = loop;
  };
  const check = () => {
    frame = undefined;
    if (cancelled) return;
    let drift = source.currentTime - destination.currentTime;
    const duration = destination.duration;
    if (Number.isFinite(duration) && duration > 0) drift = ((drift + duration / 2) % duration + duration) % duration - duration / 2;
    if (!destination.seeking && destination.readyState >= 2 && Math.abs(drift) <= .05) {
      stop(); reveal(); return;
    }
    // Catch up offscreen without another seek/decoder reset or a visible jump.
    destination.playbackRate = Math.max(.75, Math.min(1.5, rate + drift * 8));
    frame = destination.requestVideoFrameCallback(check);
  };
  if (destination.requestVideoFrameCallback) frame = destination.requestVideoFrameCallback(check);
  else reveal();
  return stop;
}
