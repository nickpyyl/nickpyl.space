import { useEffect, useRef, useState } from "react";

export default function HomeObject3D({ kind, fallback, interactionTarget }) {
  const [failed, setFailed] = useState(false);
  const host = useRef(null);
  const scene = useRef(null);
  const target = useRef(interactionTarget);
  target.current = interactionTarget;

  useEffect(() => {
    scene.current?.setInteractionTarget(interactionTarget);
  }, [interactionTarget]);

  useEffect(() => {
    let cancelled = false;
    let dispose;
    setFailed(false);
    import("./home-object-scene.js")
      .then(({ mountHomeObject }) => cancelled ? undefined : mountHomeObject(host.current, kind))
      .then(cleanup => {
        if (cancelled) cleanup?.();
        else {
          dispose = cleanup;
          scene.current = cleanup;
          if (target.current !== undefined) cleanup?.setInteractionTarget(target.current);
        }
      })
      .catch(error => {
        // Keep the illustrated link usable if WebGL is unavailable.
        if (!cancelled) setFailed(true);
        console.warn("3D preview unavailable:", error.message);
      });
    return () => { cancelled = true; dispose?.(); scene.current = null; };
  }, [kind]);

  return <span className="home-object" ref={host} aria-hidden="true">
    {(kind !== "can" || failed) && <img className="home-destination-art" src={fallback} width="1254" height="1254" alt="" draggable="false" />}
    <canvas className="home-object-canvas" />
  </span>;
}
