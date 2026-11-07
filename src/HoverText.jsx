import { Children, useRef } from "react";

export function HoverText({ children }) {
  const activeLink = useRef(null);

  function updateLine(event) {
    const paragraph = event.currentTarget;
    const link = event.target.closest("a");
    const active = link?.parentElement === paragraph ? link : null;
    if (activeLink.current === active) return;
    activeLink.current = active;
    const bounds = active?.getBoundingClientRect();
    // Measure rendered words so wrapping on other lines stays untouched.
    const parts = [...paragraph.children].map(part => {
      const rect = part.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const sameLine = bounds && part !== active && centerY > bounds.top && centerY < bounds.bottom;
      return { part, side: sameLine ? (rect.left < bounds.left ? "before" : "after") : null };
    });
    if (bounds) paragraph.style.setProperty("--hover-room", `${Math.min(3, Math.max(1, bounds.width * .015))}px`);
    for (const { part, side } of parts) {
      if (side) part.dataset.hoverSide = side;
      else delete part.dataset.hoverSide;
    }
  }

  function clearLine(event) {
    if (event.target.closest("a")?.contains(event.relatedTarget)) return;
    activeLink.current = null;
    for (const part of event.currentTarget.children) delete part.dataset.hoverSide;
  }

  return <p className="home-hover-text" onPointerOver={updateLine} onPointerOut={clearLine} onFocus={updateLine} onBlur={clearLine}>
    {Children.map(children, child => typeof child === "string"
      ? child.split(/(\s+)/).map((word, index) => /^\s*$/.test(word) ? word : <span key={index}>{word}</span>)
      : child)}
  </p>;
}
