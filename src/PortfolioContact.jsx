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

  return <div className="portfolio-email">
    <a className="email-address" href={`mailto:${email}`} ref={address}>{email}</a>
    <button type="button" onClick={copyEmail} aria-label="Copy email address">
      {status === "copied" ? "copied" : status === "manual" ? "copy manually" : "copy"}
    </button>
    <span className="visually-hidden" role="status">{status === "copied" ? "Email address copied" : status === "manual" ? "Email address selected for copying" : ""}</span>
  </div>;
}

function LetterboxdLink() {
  const [open, setOpen] = useState(false);
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
    onPointerEnter={event => { if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={event => { if (!event.currentTarget.matches(":focus-visible")) setOpen(false); }}
    onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
    onBlur={() => setOpen(false)}>
    <InteractiveLabel>letterboxd</InteractiveLabel>
    <span className="letterboxd-preview" id="recent-film" role="tooltip" data-open={open} aria-hidden={!open}>
      <span className="letterboxd-rating" aria-hidden="true">Recent&nbsp; ★ 4,5</span>
      <span className="visually-hidden">Recent film, Primetime. Rated 4.5 out of 5.</span>
      <img src={poster} width="336" height="420" alt="" draggable="false" decoding="async" loading="lazy" />
    </span>
  </a>;
}

export function SocialLinks() {
  return <div className="portfolio-socials">
    <HoverText>Say hi via <a href="https://x.com/nickpyl" target="_blank" rel="noreferrer" aria-label="Nick Pyl on Twitter"><InteractiveLabel>twitter</InteractiveLabel></a>, <a href="https://www.instagram.com/nickphylm/" target="_blank" rel="noreferrer" aria-label="Nick Pyl on Instagram"><InteractiveLabel>instagram</InteractiveLabel></a> or <LetterboxdLink /></HoverText>
  </div>;
}
