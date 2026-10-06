import { useEffect, useRef } from "react";
import { connectPreviewPlayback, nextPreview } from "./preview-playlist.js";

export default function HomePreview({ clips, activeSrc, section, canCycle, onAdvance }) {
  const host = useRef(null);
  const playback = useRef(null);
  const cycleAllowed = useRef(canCycle);
  cycleAllowed.current = canCycle;
  const clip = clips.find(item => item.src === activeSrc) ?? clips[0];
  const next = nextPreview(clips, clip.src);
  const buffered = next.src === clip.src ? [clip] : [clip, next];

  useEffect(() => {
    const media = host.current.querySelectorAll("video, img");
    const stop = connectPreviewPlayback(media[0], media[1], {
      canCycle: () => cycleAllowed.current, durationMs: clip.durationMs,
      onAdvance: () => onAdvance(section, next.src),
    });
    playback.current = stop;
    return () => { playback.current = null; stop(); };
  }, [clip.src, clip.durationMs, next.src, section, onAdvance]);

  useEffect(() => { playback.current?.sync(); }, [canCycle]);

  return <span ref={host} className="home-preview" aria-hidden="true">
    {buffered.map(item => item.type === "image" ? <img key={item.src} className="home-preview-video"
      data-active={item.src === clip.src ? "true" : "false"} src={item.src} alt="" draggable="false" /> : <video key={item.src} className="home-preview-video"
      data-active={item.src === clip.src ? "true" : "false"}
      src={item.src} muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} />)}
  </span>;
}
