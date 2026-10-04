import { Children, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import portrait from "../assets/avatar-nick-small.png";
import signature from "../assets/signature-new-small.png";
import { sectionPaths } from "./routes.js";
import "./home.css";
import InteractiveLabel from "./InteractiveLabel.jsx";
import HomePreview from "./HomePreview.jsx";
import BotanicalDecor from "./BotanicalDecor.jsx";

export function navigateFromLink(event, id, onSelect) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onSelect(id);
}

function HoverText({ children }) {
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

function DestinationLabel({ destination }) {
  const isWork = destination === "work";
  return <>{isWork ? "Selected work" : "Explorations"} <span className="home-destination-shortcut">[{isWork ? "S" : "E"}]</span></>;
}

export default function Home({ phase, onSelect, onIntent, previews }) {
  const [hoveredDestination, setHoveredDestination] = useState("work");
  const tooltipRef = useRef(null);

  useEffect(() => {
    const hideOnScroll = () => {
      if (tooltipRef.current) delete tooltipRef.current.dataset.pointerActive;
    };
    window.addEventListener("scroll", hideOnScroll, true);
    return () => window.removeEventListener("scroll", hideOnScroll, true);
  }, []);

  function trackDestinationLabel(event) {
    if (event.pointerType === "touch") return;
    const destinations = event.currentTarget;
    const bounds = destinations.getBoundingClientRect();
    // One label spans both cards and their gap, so crossing never restarts the entrance.
    const destination = event.clientX < bounds.left + bounds.width / 2 ? "work" : "explorations";
    if (destination !== hoveredDestination) setHoveredDestination(destination);
    const labels = [...destinations.querySelectorAll(".home-destination-label")];
    const halfWidth = Math.max(...labels.map(label => label.offsetWidth)) / 2;
    const x = Math.min(window.innerWidth - halfWidth - 8, Math.max(halfWidth + 8, event.clientX));
    const y = Math.max(Math.max(...labels.map(label => label.offsetHeight)) + 8, event.clientY - 12);
    const tooltip = tooltipRef.current;
    tooltip.style.setProperty("--label-x", `${x}px`);
    tooltip.style.setProperty("--label-y", `${y}px`);
    tooltip.style.setProperty("--label-font-size", getComputedStyle(labels[0]).fontSize);
    tooltip.dataset.pointerActive = "true";
    destinations.dataset.pointerActive = "true";
  }

  function hideDestinationLabel(event) {
    delete event.currentTarget.dataset.pointerActive;
    delete tooltipRef.current.dataset.pointerActive;
  }

  return (
    <main className={`home-page home-page--${phase}`} aria-label="About Nick Pyl">
      <div className="home-column">
        <section className="home-intro">
          <img className="home-portrait" src={portrait} width="32" height="32" alt="Nick Pyl" />
          <header>
            <h1>Hey there, I’m Nick Pyl</h1>
            <p className="home-subtitle">a designer based in Amsterdam</p>
          </header>
          <HoverText>Currently, I design at <a className="home-phantom" href="https://phantom.com/" target="_blank" rel="noreferrer"><InteractiveLabel>Phantom</InteractiveLabel></a>. I also spend probably too much time on my own <a className="home-explorations" href="https://x.com/nickpylll" target="_blank" rel="noreferrer"><InteractiveLabel>design experiments,</InteractiveLabel></a> focused mainly on interactions.</HoverText>
          <HoverText>Previously, multidisciplinary designer at <a className="home-fuse" href="https://x.com/fusewallet" target="_blank" rel="noreferrer"><InteractiveLabel>Fuse</InteractiveLabel></a>, where I redesigned the experience, and worked across brand and social.</HoverText>
          <footer className="home-contact">
            <HoverText><span>Reach me at </span><a href="mailto:hello@nickpyl.space"><InteractiveLabel>hello@nickpyl.space</InteractiveLabel></a><span aria-hidden="true"> · </span><a href="https://x.com/nickpylll" target="_blank" rel="noreferrer" aria-label="Nick Pyl on X"><InteractiveLabel>X</InteractiveLabel></a></HoverText>
            <img src={signature} alt="Nick Pyl signature" width="280" height="104" />
          </footer>
          <nav
            className="home-destinations"
            aria-label="Explore"
            onPointerEnter={trackDestinationLabel}
            onPointerMove={trackDestinationLabel}
            onPointerLeave={hideDestinationLabel}
            onPointerCancel={hideDestinationLabel}
          >
            <a
              className="home-destination home-destination--work"
              href={sectionPaths["fuse-wallet"]}
              onPointerEnter={() => onIntent?.("fuse-wallet")}
              onFocus={() => onIntent?.("fuse-wallet")}
              onClick={event => navigateFromLink(event, "fuse-wallet", onSelect)}
              aria-label="Selected work"
              aria-keyshortcuts="S"
              aria-describedby="home-object-controls"
              draggable="false"
            >
              <HomePreview clips={previews.work} phase={phase} />
              <BotanicalDecor kind="flowers" phase={phase} />
              <span className="home-destination-label" aria-hidden="true"><DestinationLabel destination="work" /></span>
              <kbd className="home-destination-key" aria-hidden="true">S</kbd>
            </a>
            <a
              className="home-destination home-destination--explorations"
              href={sectionPaths.explorations}
              onPointerEnter={() => onIntent?.("explorations")}
              onFocus={() => onIntent?.("explorations")}
              onClick={event => navigateFromLink(event, "explorations", onSelect)}
              aria-label="Explorations"
              aria-keyshortcuts="E"
              aria-describedby="home-object-controls"
              draggable="false"
            >
              <HomePreview clips={previews.explorations} interval={7200} phase={phase} />
              <BotanicalDecor kind="butterflies" phase={phase} />
              <span className="home-destination-label" aria-hidden="true"><DestinationLabel destination="explorations" /></span>
              <kbd className="home-destination-key" aria-hidden="true">E</kbd>
            </a>
            {createPortal(<span ref={tooltipRef} className={`home-destination-tooltip home-destination-tooltip--${hoveredDestination}`} data-phase={phase} aria-hidden="true">
              <DestinationLabel destination={hoveredDestination} />
            </span>, document.body)}
            <span className="home-object-instructions" id="home-object-controls">Click or press Enter to open. Press S for Selected work or E for Explorations.</span>
          </nav>
        </section>
      </div>
    </main>
  );
}
