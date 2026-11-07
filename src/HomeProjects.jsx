import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { observeWorkVideo, refreshVideoPlayback } from "./work-video.js";
import { getMediaSource } from "./media-preload.js";
import { startGalleryDrift, wrapGalleryOffset } from "./gallery-motion.js";
import { createGalleryDock } from "./gallery-dock.js";
import "./home-projects.css";

function GalleryMedia({ item, active, reducedMotion, duplicate, expanded, onToggle, simple }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const label = item.description || item.alt;

  useEffect(() => {
    if (item.type !== "video") return;
    return observeWorkVideo(videoRef.current, item.src);
  }, [item.src, item.type]);

  useEffect(() => { refreshVideoPlayback(); }, [active, reducedMotion]);

  return <figure className="gallery-piece" style={{ aspectRatio: item.aspectRatio || (item.width && item.height ? `${item.width} / ${item.height}` : "1 / 1") }}>
    {item.type === "image"
      ? <img src={getMediaSource(item.src)} srcSet={item.srcSet} sizes="(max-width: 700px) 300px, 525px" alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" draggable="false" onLoad={() => setReady(true)} onError={() => setFailed(true)} />
      : <video ref={videoRef} aria-label={label} muted loop playsInline preload="none" controls={reducedMotion}
          tabIndex={duplicate ? -1 : undefined} data-preview-buffering={!active || reducedMotion ? "true" : undefined}
          onLoadedData={() => setReady(true)} onError={() => setFailed(true)} />}
    {!ready && !failed && <span className="gallery-media-status" role="status">Loading preview…</span>}
    {failed && <a className="gallery-media-status" href={item.src} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined}>Open media</a>}
    {!simple && <button className="gallery-open" type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      aria-expanded={expanded} tabIndex={duplicate ? -1 : 0} onClick={event => onToggle(event.currentTarget.closest(".gallery-piece"))} />}
    <figcaption className="visually-hidden">{label}</figcaption>
  </figure>;
}

function Gallery({ id, items, active, prepared, reducedMotion, simple }) {
  const railRef = useRef(null);
  const sequenceRef = useRef(null);
  const dock = useRef(null);
  const drag = useRef(null);
  const skipClick = useRef(false);
  const initialized = useRef(false);
  const pause = useRef({ focus: false, pointer: false, selected: false, until: 0 });
  const [selected, setSelected] = useState(null);
  const [visited, setVisited] = useState(active || prepared);
  useEffect(() => { if (active || prepared) setVisited(true); }, [active, prepared]);

  useLayoutEffect(() => {
    if (!active) return;
    const rail = railRef.current;
    if (!initialized.current) {
      const leadingSpace = parseFloat(getComputedStyle(rail.querySelector('.gallery-track')).paddingLeft);
      rail.scrollLeft = reducedMotion || simple ? 0 : sequenceRef.current.offsetHeight * .6 + leadingSpace;
      initialized.current = true;
    }
    pause.current.focus = rail.contains(document.activeElement);
    pause.current.pointer = false;
    if (reducedMotion || simple) return;
    return startGalleryDrift(rail, {
      cycleWidth: () => sequenceRef.current.offsetWidth,
      isPaused: () => document.hidden || pause.current.focus || pause.current.pointer || pause.current.selected || performance.now() < pause.current.until,
      onWrap: () => {
        const originals = sequenceRef.current.querySelectorAll("video");
        const copies = sequenceRef.current.nextElementSibling.querySelectorAll("video");
        originals.forEach((video, index) => {
          const copy = copies[index];
          if (!copy.paused && copy.readyState >= 2 && video.readyState >= 1) video.currentTime = copy.currentTime;
        });
      },
    });
  }, [active, reducedMotion, simple]);

  useLayoutEffect(() => {
    setSelected(null);
    pause.current.selected = false;
    if (!active || simple) return;
    const controller = createGalleryDock(railRef.current, { reducedMotion, onSelect: index => {
      pause.current.selected = index !== null;
      setSelected(index);
    } });
    dock.current = controller;
    return () => {
      controller.destroy();
      dock.current = null;
    };
  }, [active, reducedMotion, simple]);

  useEffect(() => {
    if (!active || simple) return;
    const rail = railRef.current;
    const page = rail.closest(".portfolio-page");
    function wheel(event) {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      dock.current?.clear();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
      if (page.scrollHeight > window.innerHeight && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        window.scrollBy({ top: event.deltaY * unit, behavior: "instant" });
      }
      rail.scrollLeft = wrapGalleryOffset(rail.scrollLeft + delta * unit, sequenceRef.current.offsetWidth);
      pause.current.until = performance.now() + 1200;
    }
    page.addEventListener("wheel", wheel, { passive: false });
    return () => page.removeEventListener("wheel", wheel);
  }, [active, simple]);

  function moveWithKeys(event) {
    if (event.target.tagName === "VIDEO" || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    dock.current?.clear();
    const rail = railRef.current;
    const cards = [...sequenceRef.current.children];
    const cycle = sequenceRef.current.offsetWidth;
    const position = wrapGalleryOffset(rail.scrollLeft, cycle);
    const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - position) < Math.abs(cards[best].offsetLeft - position) ? index : best, 0);
    const next = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : (nearest + (event.key === "ArrowRight" ? 1 : -1) + cards.length) % cards.length;
    rail.scrollLeft = cards[next].offsetLeft;
  }

  function finishDrag(event) {
    if (drag.current?.id === event.pointerId) {
      skipClick.current = drag.current.moved;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pause.current.pointer = false;
    pause.current.until = performance.now() + 800;
  }

  return <div id={`gallery-${id}`} className="portfolio-gallery" role="tabpanel" aria-labelledby={`tab-${id}`} data-active={active} data-simple={simple} data-expanded={selected !== null} inert={!active} aria-hidden={!active}>
    <div className="gallery-viewport">
      <div ref={railRef} className="gallery-rail work-rail" tabIndex={active ? 0 : -1} aria-label={`${id === "fuse" ? "Fuse" : "Explorations"} gallery. Scroll or drag to browse.`}
        onKeyDown={moveWithKeys}
        onClickCapture={event => {
          if (!skipClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          skipClick.current = false;
        }}
        onFocusCapture={event => {
          pause.current.focus = true;
          const piece = event.target.closest(".gallery-piece");
          if (piece) event.currentTarget.scrollLeft = piece.offsetLeft;
        }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) pause.current.focus = false; }}
        onPointerDown={event => {
          if (simple) return;
          skipClick.current = false;
          if (event.target.closest("a") || event.target.tagName === "VIDEO" && reducedMotion) return;
          if (event.button !== 0) return;
          pause.current.pointer = true;
          if (event.pointerType === "mouse") event.preventDefault();
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={event => {
          const gesture = drag.current;
          if (!gesture || gesture.id !== event.pointerId) return;
          if (!gesture.moved && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 6) return;
          if (!gesture.moved) {
            dock.current?.clear();
            gesture.start = event.currentTarget.scrollLeft;
          }
          gesture.moved = true;
          if (event.pointerType !== "mouse") return;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.scrollLeft = wrapGalleryOffset(gesture.start + gesture.x - event.clientX, sequenceRef.current.offsetWidth);
        }}
        onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
        <div className="gallery-track">
          {(simple ? [false] : [false, true]).map(duplicate => <div key={String(duplicate)} ref={duplicate ? undefined : sequenceRef} className="gallery-sequence" aria-hidden={duplicate || undefined}>
            {(active || prepared || visited) && items.map((item, index) => <GalleryMedia key={item.src} item={item} active={active} reducedMotion={reducedMotion} duplicate={duplicate}
              simple={simple} expanded={selected === index + (duplicate ? items.length : 0)} onToggle={element => dock.current?.toggle(element)} />)}
          </div>)}
        </div>
      </div>
      <div className="gallery-edge" aria-hidden="true"><span /><span /><span /></div>
    </div>
    <p className="gallery-caption" aria-live="polite">{selected === null ? "" : items[selected % items.length].description || items[selected % items.length].alt}</p>
  </div>;
}

export default function HomeProjects({ projects, activeProject, preparedProject, reducedMotion, simple }) {
  return <div className="portfolio-galleries">
    {Object.entries(projects).map(([id, items]) => <Gallery key={id} id={id} items={items} active={activeProject === id} prepared={preparedProject === id} reducedMotion={reducedMotion} simple={simple} />)}
  </div>;
}
