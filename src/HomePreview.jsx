import { useEffect, useRef, useState } from "react";

const FADE_MS = 650;

// Keep just the playing clip and its successor mounted. The next clip must
// have a decoded frame before it can replace the current one.
export default function HomePreview({ clips, interval = 6000, phase }) {
  const host = useRef(null);
  const videos = useRef([]);
  const [slots, setSlots] = useState([0, 1 % clips.length]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState({});
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const next = 1 - active;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    const sync = () => setVisible(inView && !document.hidden);
    const syncMotion = () => setReduced(motion.matches);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer?.observe(host.current);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", syncMotion);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    videos.current.forEach((video, slot) => {
      if (!video) return;
      if (slot === active && visible && !reduced) video.play()?.catch(() => {});
      else video.pause();
    });
  }, [active, visible, reduced, slots]);

  useEffect(() => {
    if (!visible || reduced || phase !== "idle" || clips.length < 2 || !ready[slots[next]] || !ready[slots[active]]) return;
    const timer = window.setTimeout(() => setActive(next), interval);
    return () => window.clearTimeout(timer);
  }, [active, slots, ready, visible, reduced, phase, interval, clips.length, next]);

  useEffect(() => {
    const following = (slots[active] + 1) % clips.length;
    if (slots[next] === following) return;
    // Retain the outgoing frame until the crossfade has finished.
    const timer = window.setTimeout(() => {
      setReady(current => ({ ...current, [following]: false }));
      setSlots(current => current.map((index, slot) => slot === next ? following : index));
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [active, slots, next, clips.length]);

  return <span ref={host} className="home-preview" aria-hidden="true">
    {slots.map((index, slot) => <video
      key={`${slot}-${index}`}
      ref={video => { videos.current[slot] = video; }}
      className="home-preview-video"
      data-active={slot === active ? "true" : "false"}
      data-clip={index}
      src={clips[index].src}
      muted playsInline loop preload={slot === active || (visible && !reduced) ? "auto" : "none"}
      onLoadedData={() => setReady(current => ({ ...current, [index]: true }))}
      onCanPlay={event => {
        if (slot === active && visible && !reduced) event.currentTarget.play()?.catch(() => {});
      }}
      disablePictureInPicture
      tabIndex={-1}
    />)}
  </span>;
}
