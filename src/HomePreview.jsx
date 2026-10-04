import { useEffect, useRef } from "react";

export default function HomePreview({ clip }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden && !motion.matches) video.play()?.catch(() => {});
      else video.pause();
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer?.observe(video);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    video.addEventListener("canplay", sync);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      video.removeEventListener("canplay", sync);
      video.pause();
    };
  }, []);

  return <span className="home-preview" aria-hidden="true">
    <video ref={videoRef} className="home-preview-video" data-active="true"
      src={clip.src} muted playsInline loop preload="auto" disablePictureInPicture tabIndex={-1} />
  </span>;
}
