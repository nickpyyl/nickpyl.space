import { useLayoutEffect, useRef, useState } from "react";
import HomeObject3D from "./HomeObject3D.jsx";
import { isObjectInViewport } from "./shared-object-visibility.js";
import redBull from "../assets/home-redbull-ps2.png";
import compactDisc from "../assets/home-disc-ps2.png";

// The canvas never unmounts between pages: orientation and momentum travel with it.
export default function SharedObject3D({ kind, page, phase }) {
  const layerRef = useRef(null);
  const lastRect = useRef(null);
  const animationRef = useRef(null);
  const wasVisibleOnExit = useRef(false);
  const [target, setTarget] = useState(null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const slot = document.querySelector(`[data-object-slot="${kind}"]`);
    setTarget(slot);
    if (!slot) {
      layer.dataset.visible = "false";
      delete layer.dataset.transition;
      animationRef.current?.cancel();
      lastRect.current = null;
      wasVisibleOnExit.current = false;
      return;
    }
    if (phase === "leaving") {
      // Capture before the old page unmounts or its scroll position is reset.
      wasVisibleOnExit.current = Boolean(lastRect.current)
        && isObjectInViewport(layer.getBoundingClientRect(), window.visualViewport ?? { width:window.innerWidth, height:window.innerHeight });
      return;
    }

    const rect = slot.getBoundingClientRect();
    const from = lastRect.current ? layer.getBoundingClientRect() : null;
    layer.dataset.visible = "true";
    const entering = phase === "entering" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldMove = entering && from && wasVisibleOnExit.current;
    if (entering) layer.dataset.transition = shouldMove ? "move" : "reveal";
    layer.style.setProperty("--object-reveal-delay", page === "home" ? "100ms" : "70ms");
    layer.style.setProperty("--object-reveal-duration", page === "home" ? "460ms" : "620ms");

    function place(next, origin = null, duration = page === "home" ? 400 : 520) {
      animationRef.current?.cancel();
      animationRef.current = null;
      layer.style.width = `${next.width}px`;
      layer.style.height = `${next.height}px`;
      const transform = `translate3d(${next.left}px, ${next.top}px, 0)`;
      layer.style.transform = transform;
      lastRect.current = next;
      if (origin && duration > 0 && next.width > 0 && next.height > 0) {
        animationRef.current = layer.animate([
          { transform:`translate3d(${origin.left}px, ${origin.top}px, 0) scale(${origin.width / next.width}, ${origin.height / next.height})` },
          { transform },
        ], { duration, easing:"cubic-bezier(.22,1,.36,1)" });
      }
    }
    place(rect, shouldMove ? from : null);

    function followSlot() {
      const next = slot.getBoundingClientRect();
      const previous = lastRect.current;
      if (previous && ["left", "top", "width", "height"].every(key => Math.abs(next[key] - previous[key]) < .5)) return;
      const animation = animationRef.current;
      const moving = animation?.playState === "running";
      const remaining = moving ? animation.effect.getComputedTiming().endTime - Number(animation.currentTime ?? 0) : 0;
      place(next, moving ? layer.getBoundingClientRect() : null, remaining);
    }
    window.addEventListener("scroll", followSlot, true);
    window.addEventListener("resize", followSlot);
    const resize = new ResizeObserver(() => {
      const next = slot.getBoundingClientRect();
      if (!lastRect.current || Math.abs(next.width - lastRect.current.width) > .5 || Math.abs(next.height - lastRect.current.height) > .5) followSlot();
    });
    resize.observe(slot);
    return () => {
      window.removeEventListener("scroll", followSlot, true);
      window.removeEventListener("resize", followSlot);
      resize.disconnect();
    };
  }, [kind, page, phase]);

  useLayoutEffect(() => () => animationRef.current?.cancel(), []);

  return <div className={`shared-object shared-object--${kind}`} ref={layerRef} data-visible="false" data-phase={phase} aria-hidden="true">
    <HomeObject3D kind={kind} fallback={kind === "can" ? redBull : compactDisc} interactionTarget={target} />
  </div>;
}
