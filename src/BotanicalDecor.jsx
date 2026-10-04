import { useEffect, useRef } from "react";
import rose from "../assets/botanical/rose.png";
import gypsophila from "../assets/botanical/gypsophila.png";
import thistle from "../assets/botanical/thistle.png";
import yarrow from "../assets/botanical/yarrow.png";
import lilac from "../assets/botanical/butterfly-lilac.png";
import amber from "../assets/botanical/butterfly-amber.png";
import luna from "../assets/botanical/butterfly-luna.png";
import "./botanical.css";

const flowers = [rose, gypsophila, thistle, yarrow];
const butterflies = [lilac, amber, luna];
const cardPlanting = [
  [0, -8, -8, 104, -12], [1, 12, -14, 76, 9],
  [3, 65, -13, 73, -8], [2, 82, -9, 105, 13],
];
const pagePlanting = [
  [1, 2, -13, 128, -14], [0, 6, -15, 170, -7],
  [3, 12, -12, 114, 12], [2, 20, -16, 140, -9],
  [1, 78, -16, 142, -10], [3, 87, -14, 125, 8],
  [2, 92, -16, 172, 10], [0, 97, -18, 118, -11],
];

export default function BotanicalDecor({ kind, mode = "card", phase = "idle" }) {
  const root = useRef(null);
  useEffect(() => {
    const sync = () => { if (root.current) root.current.dataset.paused = String(document.hidden); };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return <span ref={root} className={`botanical botanical--${mode} botanical--${kind}`} data-phase={phase} aria-hidden="true">
    {kind === "flowers" ? (mode === "card" ? cardPlanting : pagePlanting).map(([type, x, bottom, height, angle], index) =>
      <span className="botanical-flower" key={index} style={{ "--plant-x": `${x}%`, "--plant-bottom": `${bottom}px`, "--plant-height": `${height}px`, "--plant-angle": `${angle}deg`, "--plant-delay": `${index * 105}ms`, "--sway-time": `${6 + index % 3}s` }}>
        <span className="botanical-flower-growth"><img className="botanical-flower-sway" src={flowers[type]} alt="" draggable="false" width="256" height="384" /></span>
      </span>
    ) : butterflies.map((src, index) => <span className={`botanical-flight botanical-flight--${index}`} key={src}>
      <span className="botanical-butterfly">
        <img className="butterfly-wing butterfly-wing--left" src={src} alt="" draggable="false" width="160" height="160" />
        <img className="butterfly-wing butterfly-wing--right" src={src} alt="" draggable="false" width="160" height="160" />
        <img className="butterfly-body" src={src} alt="" draggable="false" width="160" height="160" />
      </span>
    </span>)}
  </span>;
}
