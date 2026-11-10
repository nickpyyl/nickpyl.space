import { useEffect, useRef, useState } from "react";
import { HoverText } from "./HoverText.jsx";
import InteractiveLabel from "./InteractiveLabel.jsx";
import poster from "../assets/primetime-poster.webp";

const email = "hello@nickpyl.space";

export function EmailContact() {
  const address = useRef(null);
  const timer = useRef();
  const [status, setStatus] = useState("idle");
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(address.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      setStatus("manual");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }

  return <>
    <button className="portfolio-email" type="button" onClick={copyEmail} data-status={status} aria-label={`Copy email address ${email}`}>
      <span className="email-address" ref={address}>{email}</span>
      <span className="email-action" aria-hidden="true">
        <span className="email-copy"><InteractiveLabel>{status === "manual" ? "copy manually" : "copy"}</InteractiveLabel></span>
        <span className="email-copied">
          copied
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" focusable="false">
            <path d="m3 8 3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </button>
    <span className="visually-hidden" role="status">{status === "copied" ? "Email address copied" : status === "manual" ? "Email address selected for copying" : ""}</span>
  </>;
}

function LetterboxdLink() {
  const [open, setOpen] = useState(false);
  const preview = useRef(null);

  function followPointer(event) {
    if (event.pointerType !== "mouse") return;
    const surface = preview.current.contains(event.target) ? preview.current : event.currentTarget;
    const { left, width } = surface.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - left) / width));
    preview.current.style.setProperty("--preview-x", `${(fraction - .5) * 14}px`);
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);

  return <a className="letterboxd-link" href="https://letterboxd.com/nickpyl/" target="_blank" rel="noreferrer"
    aria-label="Nick Pyl on Letterboxd" aria-describedby={open ? "recent-film" : undefined}
    onPointerEnter={event => {
      if (event.pointerType !== "mouse") return;
      followPointer(event);
      setOpen(true);
    }}
    onPointerMove={followPointer}
    onPointerLeave={event => {
      preview.current.style.removeProperty("--preview-x");
      if (!event.currentTarget.matches(":focus-visible")) setOpen(false);
    }}
    onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
    onBlur={() => setOpen(false)}>
    <InteractiveLabel>letterboxd</InteractiveLabel>
    <span ref={preview} className="letterboxd-preview" id="recent-film" role="tooltip" data-open={open} aria-hidden={!open}>
      <span className="letterboxd-film">
        <span className="letterboxd-rating" aria-hidden="true">
          Recent
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" focusable="false">
            <path d="M8 1.8l1.9 3.85 4.25.62-3.08 3 .73 4.24L8 11.5l-3.8 2.01.73-4.24-3.08-3 4.25-.62Z"
              stroke="currentColor" strokeWidth="0.65" strokeLinejoin="round" />
          </svg>
          4,5
        </span>
        <span className="visually-hidden">Recent film, Primetime. Rated 4.5 out of 5.</span>
        <img src={poster} width="336" height="420" alt="" draggable="false" decoding="async" loading="lazy" />
      </span>
    </span>
  </a>;
}

export function SocialLinks() {
  return <div className="portfolio-socials">
    <HoverText>Say hi via <a href="https://x.com/nickpyl" target="_blank" rel="noreferrer" aria-label="Nick Pyl on Twitter"><InteractiveLabel>twitter</InteractiveLabel></a>, <a href="https://www.instagram.com/nickphylm/" target="_blank" rel="noreferrer" aria-label="Nick Pyl on Instagram"><InteractiveLabel>instagram</InteractiveLabel></a> or <LetterboxdLink /></HoverText>
  </div>;
}
