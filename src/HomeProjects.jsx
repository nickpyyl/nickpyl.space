import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { observeWorkVideo, refreshVideoPlayback } from "./work-video.js";
import { getMediaSource } from "./media-preload.js";
import { wrapGalleryOffset } from "./gallery-motion.js";
import { createGalleryDock } from "./gallery-dock.js";
import { createGalleryMotion } from "./gallery-controls.js";
import "./home-projects.css";

function GalleryMedia({ item, active, reducedMotion, duplicate, expanded, onToggle }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const label = item.description || item.alt;
  const aspectRatio = item.aspectRatio || (item.width && item.height ? `${item.width} / ${item.height}` : "1 / 1");

  useEffect(() => {
    if (item.type !== "video") return;
    return observeWorkVideo(videoRef.current, item.src, { poster: item.poster });
  }, [item.src, item.type, item.poster]);

  // Explicit widths keep WebKit's max-content rows independent of video metadata.
  return <figure className="gallery-piece" style={{ width: `calc(var(--media-height) * (${aspectRatio}))` }}>
    {item.type === "image"
      ? <img src={getMediaSource(item.src)} srcSet={item.srcSet} sizes="(max-width: 700px) 300px, 525px" alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />
      : <video ref={videoRef} aria-label={label} muted loop playsInline preload="none" controls={reducedMotion}
          tabIndex={duplicate ? -1 : undefined} data-preview-buffering={!active || reducedMotion ? "true" : undefined}
          onError={() => setFailed(true)} />}
    {failed && <a className="gallery-media-status" href={item.src} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined}>Open media</a>}
    <button className="gallery-open" type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      aria-expanded={expanded} tabIndex={duplicate ? -1 : 0} onClick={event => onToggle(event.currentTarget.closest(".gallery-piece"))} />
    <figcaption className="visually-hidden">{label}</figcaption>
  </figure>;
}

function Gallery({ id, items, active, prepared, reducedMotion, simple }) {
  const railRef = useRef(null);
  const sequenceRef = useRef(null);
  const dock = useRef(null);
  const motionRef = useRef(null);
  const progressRef = useRef();
  const [selected, setSelected] = useState(null);
  const [caption, setCaption] = useState("");
  const [visited, setVisited] = useState(active || prepared);
  useEffect(() => { if (active || prepared) setVisited(true); }, [active, prepared]);
  useEffect(() => { refreshVideoPlayback(); }, [active, reducedMotion]);

  useLayoutEffect(() => {
    if (!active) return;
    const rail = railRef.current;
    rail.scrollLeft = 0;
    const motion = createGalleryMotion(rail, sequenceRef.current, {
      reducedMotion, simple, progress: progressRef.current, onInteract: () => dock.current?.clear(),
      onBrowseChange: refreshVideoPlayback,
    });
    motionRef.current = motion;
    motion.setPaused('focus', rail.closest('.portfolio-page').dataset.input === 'keyboard' && rail.contains(document.activeElement));
    return () => {
      progressRef.current = motion.getProgress();
      motion.destroy();
      motionRef.current = null;
    };
  }, [active, reducedMotion, simple]);

  useLayoutEffect(() => {
    setSelected(null);
    if (!active) return;
    const controller = createGalleryDock(railRef.current, { reducedMotion, simple, scroll: motionRef.current, onSelect: index => {
      motionRef.current?.setPaused('selected', index !== null);
      if (index !== null) {
        const item = items[index % items.length];
        setCaption(item.description || item.alt);
      }
      setSelected(index);
    } });
    dock.current = controller;
    return () => {
      controller.destroy();
      dock.current = null;
    };
  }, [active, reducedMotion, simple, items]);

  function moveWithKeys(event) {
    if (event.target.tagName === "VIDEO" || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    dock.current?.clear();
    motionRef.current?.setPaused('focus', true);
    const cards = [...sequenceRef.current.children];
    const cycle = sequenceRef.current.offsetWidth;
    const position = wrapGalleryOffset(motionRef.current.getPosition(), cycle);
    const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - position) < Math.abs(cards[best].offsetLeft - position) ? index : best, 0);
    const next = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : (nearest + (event.key === "ArrowRight" ? 1 : -1) + cards.length) % cards.length;
    motionRef.current.setPosition(cards[next].offsetLeft + cycle);
  }

  return <div id={`gallery-${id}`} className="portfolio-gallery" role="tabpanel" aria-labelledby={`tab-${id}`} data-active={active} data-simple={simple} data-expanded={selected !== null} inert={!active} aria-hidden={!active}>
    <div className="gallery-viewport">
      <div ref={railRef} className="gallery-rail work-rail" tabIndex={active ? 0 : -1} aria-label={`${id === "fuse" ? "Fuse" : "Explorations"} gallery. Scroll or drag to browse.`}
        onKeyDown={moveWithKeys}
        onFocusCapture={event => {
          const keyboard = event.currentTarget.closest('.portfolio-page').dataset.input === "keyboard";
          motionRef.current?.setPaused('focus', keyboard);
          const piece = event.target.closest(".gallery-piece");
          if (piece && keyboard) motionRef.current?.setPosition(piece.offsetLeft + sequenceRef.current.offsetWidth);
        }}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) motionRef.current?.setPaused('focus', false);
        }}>
        <div className="gallery-track">
          {[-1, 0, 1].map((copy, copyIndex) => <div key={copy} ref={copy === 0 ? sequenceRef : undefined} className="gallery-sequence" aria-hidden={copy !== 0 || undefined}>
            {(active || prepared || visited) && items.map((item, index) => <GalleryMedia key={item.src} item={item} active={active} reducedMotion={reducedMotion} duplicate={copy !== 0}
              expanded={selected === index + copyIndex * items.length} onToggle={element => dock.current?.toggle(element)} />)}
          </div>)}
        </div>
      </div>
      <div className="gallery-edge" aria-hidden="true" />
    </div>
    <p className="gallery-caption" aria-live="polite" aria-hidden={selected === null}>{caption}</p>
  </div>;
}

export default function HomeProjects({ projects, activeProject, preparedProject, reducedMotion, simple }) {
  return <div className="portfolio-galleries">
    {Object.entries(projects).map(([id, items]) => <Gallery key={id} id={id} items={items} active={activeProject === id} prepared={preparedProject === id} reducedMotion={reducedMotion} simple={simple} />)}
  </div>;
}
