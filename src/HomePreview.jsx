import { useEffect, useRef } from "react";
import { connectPreviewPlayback, nextPreview } from "./preview-playlist.js";

export default function HomePreview({ clips, activeSrc, section, canCycle, onAdvance }) {
  const host = useRef(null);
  const clip = clips.find(item => item.src === activeSrc) ?? clips[0];
  const next = nextPreview(clips, clip.src);
  const buffered = next.src === clip.src ? [clip] : [clip, next];

  useEffect(() => {
    const media = host.current.querySelectorAll("video, img");
    return connectPreviewPlayback(media[0], media[1], {
      canCycle, durationMs: clip.durationMs,
      onAdvance: () => onAdvance(section, next.src),
    });
  }, [clip.src, clip.durationMs, next.src, canCycle, section, onAdvance]);

  return <span ref={host} className="home-preview" aria-hidden="true">
    {buffered.map(item => item.type === "image" ? <img key={item.src} className="home-preview-video"
      data-active={item.src === clip.src ? "true" : "false"} src={item.src} alt="" draggable="false" /> : <video key={item.src} className="home-preview-video"
      data-active={item.src === clip.src ? "true" : "false"}
      src={item.src} muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} />)}
  </span>;
}
