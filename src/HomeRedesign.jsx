import { useCallback, useEffect, useRef, useState } from "react";
import { HoverText } from "./HoverText.jsx";
import InteractiveLabel from "./InteractiveLabel.jsx";
import { EmailContact, SocialLinks } from "./PortfolioContact.jsx";
import HomeProjects from "./HomeProjects.jsx";
import AboutPhotos from "./AboutPhotos.jsx";
import { createPageTransition, pageTransitionTiming } from "./page-transition.js";
import avatar from "../assets/avatar-nick-96.jpg";
import "./home-redesign.css";

const navigationItems = [
  { id: "explorations", label: "explorations", key: "E" },
  { id: "fuse", label: "fuse", key: "F" },
  { id: "phantom", label: <>phantom <span className="portfolio-tab-dot">·</span> soon</>, disabled: true },
  { id: "about", label: "memo", key: "M" },
];
const availableTabs = navigationItems.filter(item => !item.disabled).map(item => item.id);

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export default function HomeRedesign({ projects }) {
  const [navigation, setNavigation] = useState({ view: "explorations", target: "explorations", phase: "idle" });
  const { view: activeView, target: selectedView, phase } = navigation;
  const [inputMode, setInputMode] = useState("pointer");
  const [aboutPrepared, setAboutPrepared] = useState(false);
  const mobileLayout = useMediaQuery("(max-width: 700px)");
  const simpleGallery = useMediaQuery("(max-width: 700px), (pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const tabs = useRef({});
  const transition = useRef(null);

  useEffect(() => {
    transition.current = createPageTransition("explorations", setNavigation);
    return () => transition.current.dispose();
  }, []);

  const showView = useCallback((next, instant = false) => {
    transition.current.navigate(next, { instant: instant || reducedMotion });
  }, [reducedMotion]);

  useEffect(() => { if (reducedMotion) transition.current.finish(); }, [reducedMotion]);

  useEffect(() => {
    function shortcut(event) {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      const next = { e: "explorations", f: "fuse", s: "fuse", m: "about" }[event.key.toLowerCase()];
      if (!next) return;
      event.preventDefault();
      setInputMode("keyboard");
      showView(next, true);
      tabs.current[next]?.focus({ preventScroll: true });
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [showView]);

  function selectTab(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    const index = (availableTabs.indexOf(selectedView) + direction + availableTabs.length) % availableTabs.length;
    const next = event.key === "Home" ? availableTabs[0] : event.key === "End" ? availableTabs.at(-1) : availableTabs[index];
    showView(next, true);
    tabs.current[next]?.focus({ preventScroll: true });
  }

  return <main className="portfolio-page" data-view={activeView} data-view-phase={phase} data-input={inputMode} aria-label="Nick Pyl — product designer"
    style={{ "--page-exit-duration": `${pageTransitionTiming.exit}ms`, "--page-enter-duration": `${pageTransitionTiming.enter}ms` }}
    onTransitionEnd={event => {
      if (event.propertyName === "opacity" && event.target.matches('.portfolio-work[data-active="true"], .portfolio-about[data-active="true"]')) {
        transition.current.completeExit(activeView);
      }
    }}
    onPointerDownCapture={() => setInputMode("pointer")} onKeyDownCapture={() => setInputMode("keyboard")}>
    <header className="portfolio-top">
      <nav className="portfolio-navigation" aria-label="Portfolio">
        <div className="portfolio-identity">
          <img src={avatar} alt="" width="22" height="22" draggable="false" />
          <h1><a href="/" onClick={event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            showView("explorations", event.detail === 0);
          }}><InteractiveLabel>@nickpyl</InteractiveLabel></a></h1>
        </div>
        <div className="portfolio-tabs" role="tablist" aria-label="Portfolio views" onKeyDown={selectTab}>
          {navigationItems.map(item =>
            <button key={item.id} ref={element => { tabs.current[item.id] = element; }} type="button" role="tab"
              id={`tab-${item.id}`} aria-controls={item.disabled ? undefined : `gallery-${item.id}`} aria-selected={selectedView === item.id}
              onPointerEnter={() => { if (item.id === "about") setAboutPrepared(true); }}
              onFocus={() => { if (item.id === "about") setAboutPrepared(true); }}
              disabled={item.disabled} tabIndex={selectedView === item.id ? 0 : -1} aria-keyshortcuts={item.key} onClick={event => showView(item.id, event.detail === 0)}>
              {item.disabled ? item.label : <InteractiveLabel>{item.label}</InteractiveLabel>}
            </button>)}
        </div>
      </nav>
      {!mobileLayout && <EmailContact />}
    </header>

    <section className="portfolio-work" data-active={activeView !== "about"} aria-hidden={activeView === "about"} aria-label="Selected projects">
      <HomeProjects projects={projects} activeProject={activeView} preparedProject={selectedView} reducedMotion={reducedMotion} simple={simpleGallery} />
    </section>

    <AboutPhotos active={activeView === "about"} prepared={aboutPrepared || selectedView === "about"} mobileLayout={mobileLayout} />

    <footer className="portfolio-bottom">
      <div className="portfolio-bio" aria-label={activeView === "about" ? "Memo" : "About Nick Pyl"}
        data-memo={activeView === "about"} data-changing={(activeView === "about") !== (selectedView === "about")}>
        {activeView === "about" ?
          <p>I found my way into interface design through photography 8 years ago. It taught me to care about composition, rhythm, light, and the small details that shape how something feels.</p>
        : <>
          <HoverText>Currently product design lead at <a href="https://phantom.com/" target="_blank" rel="noreferrer"><InteractiveLabel>Phantom</InteractiveLabel></a></HoverText>
          <HoverText>Previously multidisciplinary designer at <a href="#fuse" onClick={event => {
            event.preventDefault();
            showView("fuse", event.detail === 0);
            tabs.current.fuse?.focus({ preventScroll: true });
          }}><InteractiveLabel>Fuse</InteractiveLabel></a>,<br /> where I redesigned the product experience.</HoverText>
        </>}
      </div>
      <SocialLinks />
      {mobileLayout && <EmailContact />}
    </footer>
  </main>;
}
