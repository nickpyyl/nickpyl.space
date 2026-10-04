import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { startPreviewTransition } from "./preview-transition.js";
import Home, { navigateFromLink } from "./Home.jsx";
import WorkIntro from "./WorkIntro.jsx";
import "./work.css";
import InteractiveLabel from "./InteractiveLabel.jsx";
import { canPreloadMedia, getMediaSource, mediaPreloader } from "./media-preload.js";
import { observeWorkVideo, refreshVideoPlayback } from "./work-video.js";
import { DEFAULT_SECTION_ID, resolveSectionId, sectionPaths, sectionTitles } from "./routes.js";
import avatarNick from "../assets/avatar-nick-small.png";
import signatureNew from "../assets/signature-new-small.png";
import nextPageChevron from "../assets/icon-chevron-right-small.svg";
import nextPageExplorations from "../assets/icon-explorations.svg";
import nextPageSelectedWork from "../assets/icon-selected-work.svg";
import shotVintageCar from "../assets/optimized/shots-000032420024.webp";
import shotWhiteFenceLandscape from "../assets/optimized/shots-000041000002.webp";
import shotHallwayWindow from "../assets/optimized/shots-000041000004.webp";
import shotTidalFlats from "../assets/optimized/shots-000041000021.webp";
import shotWhiteVehicle from "../assets/optimized/shots-000041040010.webp";
import shotFieldCarHorses from "../assets/optimized/shots-000041040008.webp";
import shotBlueCarSheep from "../assets/optimized/shots-000041000013.webp";
import shotRockyHills from "../assets/optimized/shots-000041000008.webp";
import shotFenceBlueSky from "../assets/optimized/shots-000041000003.webp";
import shotWildflowerHillside from "../assets/optimized/shots-000041030012.webp";
import shotSailboatDeck from "../assets/optimized/shots-000041030015.webp";
import selectedAmsterdamHouses from "../assets/optimized/selected-amsterdam-houses.webp";
import selectedIcelandHouse from "../assets/optimized/selected-iceland-house.webp";
import selectedIcelandWindow from "../assets/optimized/selected-iceland-window.webp";
import selectedIcelandStairs from "../assets/optimized/selected-iceland-stairs.webp";
import fuseMedia01 from "../assets/fuse-media/fuse-01.mp4";
import fuseMedia02 from "../assets/fuse-media/fuse-02.mp4";
import fuseMedia04 from "../assets/fuse-media/fuse-04.mp4";
import fuseMedia05 from "../assets/fuse-media/fuse-05.mp4";
import fuseMedia06 from "../assets/fuse-media/fuse-06.mp4";
import fuseMedia07 from "../assets/fuse-media/fuse-07.mp4";
import fuseMedia08 from "../assets/fuse-media/fuse-08.mp4";
import fuseMedia09 from "../assets/fuse-media/fuse-09.mp4";
import fuseMedia10 from "../assets/fuse-media/fuse-10.mp4";
import fuseCardsDesign from "../assets/fuse-media/fuse-still-04.jpg";
import fusePlusMembership from "../assets/fuse-media/fuse-plus-membership.png";
import explorationMedia01 from "../assets/explorations-media/exploration-01.mp4";
import explorationMedia02 from "../assets/explorations-media/exploration-02.mp4";
import explorationMedia03 from "../assets/explorations-media/exploration-03.mp4";
import explorationMedia04 from "../assets/explorations-media/exploration-04.mp4";
import explorationMedia05 from "../assets/explorations-media/exploration-05.mp4";
import explorationMedia06 from "../assets/explorations-media/exploration-06.mp4";
import explorationMedia08 from "../assets/explorations-media/exploration-08.mp4";
import explorationMedia09 from "../assets/explorations-media/exploration-09.mp4";
import explorationMedia10 from "../assets/explorations-media/exploration-10.mp4";
import explorationMedia11 from "../assets/explorations-media/exploration-11.mp4";
import explorationMedia12 from "../assets/explorations-media/exploration-12.mp4";
import explorationMedia13 from "../assets/explorations-media/exploration-13.mp4";
import explorationMedia14 from "../assets/explorations-media/exploration-14.mp4";
import explorationMedia15 from "../assets/explorations-media/exploration-15.mp4";
import explorationMedia16 from "../assets/explorations-media/exploration-16.mp4";
import explorationMedia17 from "../assets/explorations-media/exploration-17.mp4";
import explorationMedia18 from "../assets/explorations-media/exploration-18.mp4";

const MEDIA_TRANSITION_MS = 260;
const MEDIA_SWAP_MS = 220;
const PAGE_EXIT_MS = 280;
// Allow the final staggered element to finish before removing the phase class.
const PAGE_ENTER_MS = 760;
const HOME_ENTER_MS = 560;
const identityTransform = { scaleX: 1, scaleY: 1, x: 0, y: 0 };

function getMediaAspectRatio(item) {
  if (item.width && item.height) return item.width / item.height;
  const [width, height] = (item.aspectRatio ?? "1 / 1").split("/").map(Number);
  return width / height;
}

const portfolioSections = [
  {
    title: "Work",
    items: [
      {
        label: "Work",
        items: [
          { id: "explorations", label: "Design Experiments", status: null },
          { id: "fuse-wallet", label: "Fuse Wallet", mobileLabel: "Fuse", status: null },
          { id: "phantom", label: "Phantom", status: "Soon", desktopOnly: true },
        ],
      },
    ],
  },
];

const content = {
  "fuse-wallet": {
    type: "work",
    eyebrow: "Work",
    title: "Fuse Wallet",
    description: "",
    media: [
      { type: "video", src: fuseMedia08, alt: "Multi-Action Interaction", description: "Multi-Action Interaction" },
      { type: "video", src: fuseMedia09, alt: "Onboarding", description: "Onboarding" },
      { type: "video", src: fuseMedia04, alt: "Home Experience", description: "Home Experience" },
      { type: "video", src: fuseMedia01, alt: "Send with Hide My Wallet", description: "Send with Hide My Wallet" },
      { type: "video", src: fuseMedia05, alt: "Address input field", description: "Address input field", aspectRatio: "2156 / 2160" },
      { type: "video", src: fuseMedia02, alt: "Transaction tracking", description: "Transaction tracking" },
      { type: "video", src: fuseMedia07, alt: "Pending verification", description: "Pending verification" },
      { type: "video", src: fuseMedia06, alt: "Promo cards", description: "Promo cards" },
      { type: "image", src: fusePlusMembership, width: 2080, height: 2080, alt: "Fuse Plus membership on an iPhone", description: "Fuse Plus Membership" },
      { type: "image", src: fuseCardsDesign, width: 1600, height: 1246, alt: "Fuse Cards design", description: "Fuse Cards design" },
      { type: "video", src: fuseMedia10, alt: "Coin breakdown", description: "Coin breakdown", aspectRatio: "1082 / 1080" },
    ],
  },
  phantom: {
    type: "note",
    eyebrow: "Work",
    title: "Phantom",
    description: "Selected work coming soon.",
    images: [],
  },
  explorations: {
    type: "note",
    eyebrow: "Work",
    title: "Design Experiments",
    description: "",
    media: [
      {
        type: "video",
        src: explorationMedia01,
        alt: "Exploration interaction video 1",
        description: "Interaction with my shots from Copenhagen",
      },
      {
        type: "video",
        src: explorationMedia02,
        alt: "Exploration interaction video 2",
        description: "Document signature / mobile version",
      },
      {
        type: "video",
        src: explorationMedia03,
        alt: "Exploration interaction video 3",
        description: "SD cards with film simulation",
        aspectRatio: "1088 / 1080",
      },
      {
        type: "video",
        src: explorationMedia04,
        alt: "Exploration interaction video 4",
        description: "Shortcut checkbox interaction",
        aspectRatio: "1218 / 720",
      },
      {
        type: "video",
        src: explorationMedia05,
        alt: "Exploration interaction video 5",
        description: "Spotify integration in Telegram",
      },
      {
        type: "video",
        src: explorationMedia06,
        alt: "Exploration interaction video 6",
        description: "Reply to a movie review",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia08,
        alt: "Exploration interaction video 8",
        description: "Mail send flow",
      },
      {
        type: "video",
        src: explorationMedia09,
        alt: "Exploration interaction video 9",
        description: "Movie review appearance interaction",
      },
      {
        type: "video",
        src: explorationMedia10,
        alt: "Exploration interaction video 10",
        description: "Photos interaction / expand and preview",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia11,
        alt: "Exploration interaction video 11",
        description: "Elements / Mail app light theme",
        aspectRatio: "1262 / 1080",
      },
      {
        type: "video",
        src: explorationMedia12,
        alt: "Exploration interaction video 12",
        description: "Archive selected interaction",
      },
      {
        type: "video",
        src: explorationMedia13,
        alt: "Exploration interaction video 13",
        description: "Highlighting a favourite movie moment",
        aspectRatio: "1370 / 1080",
      },
      {
        type: "video",
        src: explorationMedia14,
        alt: "Exploration interaction video 14",
        description: "board customisation",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia15,
        alt: "Exploration interaction video 15",
        description: "Rate and review films",
      },
      {
        type: "video",
        src: explorationMedia16,
        alt: "Exploration interaction video 16",
        description: "Signature interaction",
        aspectRatio: "1142 / 1080",
      },
      {
        type: "video",
        src: explorationMedia17,
        alt: "Exploration interaction video 17",
        description: "Task suggestions based on meeting transcription",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia18,
        alt: "Exploration interaction video 18",
        description: "Folder view and collection fullscreen",
      },
    ],
    images: [],
  },
  spacia: {
    type: "note",
    eyebrow: "Explorations",
    title: "Spacia",
    description: "Coming soon.",
    images: [],
  },
  iceland: {
    type: "photography",
    images: [
      { src: shotBlueCarSheep, width: 2200, height: 1459, alt: "Blue car framing sheep in the distance" },
      { src: shotFieldCarHorses, width: 2200, height: 1459, alt: "Silver car and horses in a grassy field" },
      { src: selectedAmsterdamHouses, width: 1400, height: 928, alt: "Amsterdam canal houses with red doors and bicycles" },
      { src: shotWhiteFenceLandscape, width: 2200, height: 1459, alt: "White fence in front of a rocky green landscape" },
      { src: shotTidalFlats, width: 2200, height: 1458, alt: "Tidal flats with mountains in the distance" },
      { src: selectedIcelandHouse, width: 1400, height: 928, alt: "Light-colored Icelandic house beneath a blue sky" },
      { src: shotRockyHills, width: 2200, height: 1459, alt: "Rocky green hills under cloudy sky" },
      { src: shotFenceBlueSky, width: 1459, height: 2200, alt: "White fence below a wide blue sky" },
      { src: selectedIcelandStairs, width: 928, height: 1400, alt: "Stairs and railings outside a corrugated Icelandic house" },
      { src: shotWildflowerHillside, width: 2200, height: 1459, alt: "Grassy hillside with wildflowers" },
      { src: shotHallwayWindow, width: 1459, height: 2200, alt: "Dim hallway with a bright window at the end" },
      { src: selectedIcelandWindow, width: 1400, height: 928, alt: "Cloud-covered Icelandic landscape seen through a car window" },
      { src: shotWhiteVehicle, width: 1459, height: 2200, alt: "White vehicle parked beside a greenhouse" },
      { src: shotSailboatDeck, width: 2200, height: 1459, alt: "Sailboat deck with a blue sail cover" },
      { src: shotVintageCar, width: 2200, height: 1459, alt: "Vintage car parked in a shaded residential street" },
    ].map((image) => ({
      ...image,
      description:
        image.src === selectedAmsterdamHouses || image.src === shotVintageCar
          ? "Amsterdam · Leica M6 · Portra 800"
          : "Iceland · Leica M6 · Portra 400",
    })),
  },
  nice: {
    type: "note",
    eyebrow: "Photography",
    title: "Nice",
    description: "Coming soon.",
    images: [],
  },
};

const homePreviews = {
  work: content["fuse-wallet"].media[0],
  explorations: content.explorations.media[0],
};

const pageLoop = [
  { id: "fuse-wallet", label: "Selected work", thumbnail: nextPageSelectedWork },
  { id: "explorations", label: "Explorations", thumbnail: nextPageExplorations },
];
function preloadSection(id) {
  if (document.hidden || !canPreloadMedia()) return;
  const videos = content[id]?.media?.filter(item => item.type === "video") ?? [];
  if (!videos.length) return;
  mediaPreloader.enqueue(videos.slice(0, 2), { priority: true });
  mediaPreloader.resume();
}

const NEXT_PAGE_WHEEL_THRESHOLD = 560;
const NEXT_PAGE_TOUCH_THRESHOLD = 180;
const NEXT_PAGE_TOUCH_ACTIVATION = 8;
const NEXT_PAGE_MAX_WHEEL_STEP = 60;
const NEXT_PAGE_FIRST_SCROLL_HINT = 0.35;
const NEXT_PAGE_HINT_DURATION = 355;
const NEXT_PAGE_STOP_SETTLE = 45;
const NEXT_PAGE_COMMIT_DELAY = 100;
const NEXT_PAGE_RESET_DELAY = 35;

function PortfolioHeader({ selectedId }) {
  const isPhotography = selectedId === "iceland";

  return (
    <div className="portfolio-header" data-photography={isPhotography ? "true" : "false"}>
      <img className="portrait" src={avatarNick} alt="Nick Pyl" />
      <span className="portfolio-header-marks" aria-hidden="true">
        {pageLoop.map((page) => (
          <span
            className="portfolio-header-mark"
            data-active={page.id === selectedId ? "true" : "false"}
            data-page={page.id}
            key={page.id}
          >
            <img src={page.thumbnail} alt="" />
          </span>
        ))}
      </span>
    </div>
  );
}

function getRouteSectionId() {
  if (typeof window === "undefined") {
    return DEFAULT_SECTION_ID;
  }

  return resolveSectionId(window.location);
}

function pushRouteSectionId(sectionId, replace = false) {
  if (typeof window === "undefined") {
    return;
  }

  const nextPath = sectionPaths[sectionId] ?? sectionPaths[DEFAULT_SECTION_ID];

  if (window.location.pathname !== nextPath || window.location.hash) {
    window.history[replace ? "replaceState" : "pushState"](
      { sectionId },
      "",
      `${nextPath}${window.location.search}`,
    );
  }
}

function NavItem({ item, selectedId, onSelect }) {
  if (item.status === "Soon") {
    return (
      <div className={`nav-item nav-item--disabled${item.desktopOnly ? " nav-item--desktop-only" : ""}`}>
        <span>{item.label}</span>
        <span className="nav-status">{item.status}</span>
      </div>
    );
  }

  return (
    <button
      className="nav-item"
      data-selected={item.id === selectedId}
      aria-current={item.id === selectedId ? "page" : undefined}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <InteractiveLabel className={item.mobileLabel ? "nav-label nav-label--desktop" : "nav-label"}>
        {item.label}
      </InteractiveLabel>
      {item.mobileLabel ? (
        <InteractiveLabel className="nav-label nav-label--mobile">{item.mobileLabel}</InteractiveLabel>
      ) : null}
      {item.status ? <span className="nav-status">{item.status}</span> : null}
    </button>
  );
}

function PortfolioNav({ selectedId, onSelect }) {
  return (
    <nav className="portfolio-nav" aria-label="Portfolio sections">
      {portfolioSections.map((section) => (
        <div className="nav-group" key={section.title}>
          <p className="nav-heading">{section.title}</p>
          {section.items.map((item) => {
            if (item.items) {
              return (
                <div className="nav-subgroup" key={item.label}>
                  {item.label !== section.title ? <p className="nav-subheading">{item.label}</p> : null}
                  {item.items.map((subItem) => {
                    return (
                      <NavItem
                        item={subItem}
                        key={subItem.id}
                        selectedId={selectedId}
                        onSelect={onSelect}
                      />
                    );
                  })}
                </div>
              );
            }
            return (
              <NavItem item={item} key={item.id} selectedId={selectedId} onSelect={onSelect} />
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function BioBlock() {
  return (
    <section className="bio-block" aria-label="About Nick Pyl">
      <img className="signature" src={signatureNew} alt="Nick Pyl signature" />
      <div className="bio-copy">
        <p>
          Currently designing at{" "}
          <a href="https://x.com/phantom" target="_blank" rel="noreferrer">
            <InteractiveLabel>Phantom</InteractiveLabel>
          </a>
          , previously at{" "}
          <a href="https://x.com/fusewallet" target="_blank" rel="noreferrer">
            <InteractiveLabel>Fuse</InteractiveLabel>
          </a>{" "}
          /{" "}
          <a href="https://x.com/squadslabs" target="_blank" rel="noreferrer">
            <InteractiveLabel>Squads Labs</InteractiveLabel>
          </a>
          .
        </p>
        <p>
          I design products and spend probably too much time thinking about how they move, respond, and feel.
        </p>
        <p className="contact-line">
          <a href="mailto:hello@nickpyl.space">
            <InteractiveLabel>Email me</InteractiveLabel>
          </a>
          <span> or find me on</span>{" "}
          <a href="https://x.com/nickpylll" target="_blank" rel="noreferrer">
            <InteractiveLabel>X</InteractiveLabel>
          </a>
          <span>.</span>
        </p>
      </div>
    </section>
  );
}

function NextPageLink({ currentId, onSelect, horizontal = false }) {
  const currentIndex = pageLoop.findIndex((page) => page.id === currentId);
  const nextPage = pageLoop[(currentIndex + 1) % pageLoop.length];
  const buttonRef = useRef(null);
  const progressRef = useRef(0);
  const arrivalLockedRef = useRef(true);
  const hintShownRef = useRef(false);
  const visualFrameRef = useRef(null);
  const hintTimerRef = useRef(null);
  const stopTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const commitTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchIdRef = useRef(null);
  const touchProgressRef = useRef(0);
  const touchClaimedRef = useRef(false);
  const touchStartedAtBottomRef = useRef(false);
  useEffect(() => {
    const button = buttonRef.current;
    const contentPane = button?.closest(".content-pane");
    const rail = button?.closest(".work-rail");
    const track = horizontal ? rail?.querySelector(".work-rail-track") : null;

    if (!button || !contentPane || !nextPage) {
      return undefined;
    }

    const mobileQuery = window.matchMedia("(max-width: 960px)");
    let committed = false;
    let commitScheduled = false;

    arrivalLockedRef.current = true;

    function getScrollElement() {
      if (horizontal) return rail;
      return mobileQuery.matches ? document.scrollingElement : contentPane;
    }

    function isAtBottom() {
      const scrollElement = getScrollElement();

      if (!scrollElement) {
        return false;
      }

      return horizontal
        ? scrollElement.scrollWidth - scrollElement.scrollLeft - scrollElement.clientWidth <= 2
        : scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight <= 2;
    }

    function setProgress(nextProgress) {
      const clampedProgress = Math.min(1, Math.max(0, nextProgress));
      progressRef.current = clampedProgress;
      window.cancelAnimationFrame(visualFrameRef.current);
      visualFrameRef.current = window.requestAnimationFrame(() => {
        button.dataset.hinting = "false";
        button.dataset.pulling = clampedProgress > 0 ? "true" : "false";
        button.style.setProperty("--next-page-progress", String(clampedProgress));
        if (track) {
          // Pull the media, captions and button together, with resistance near the limit.
          const resistance = (1 - Math.exp(-1.65 * clampedProgress)) / (1 - Math.exp(-1.65));
          const distance = Math.min(8, rail.clientWidth * 0.02) * resistance;
          track.dataset.hinting = "false";
          track.dataset.pulling = clampedProgress > 0 ? "true" : "false";
          track.style.setProperty("--work-overdrag", `${-distance}px`);
          button.style.transform = "";
        } else {
          button.style.transform = clampedProgress > 0
            ? `translate3d(0, ${-8 * clampedProgress}px, 0) scale(${1 + 0.02 * clampedProgress})`
            : "";
        }
      });
      return clampedProgress;
    }

    function showFirstScrollHint() {
      if (hintShownRef.current) {
        return;
      }

      hintShownRef.current = true;
      window.clearTimeout(hintTimerRef.current);
      button.style.setProperty("--next-page-hint", String(NEXT_PAGE_FIRST_SCROLL_HINT));
      button.dataset.hinting = "true";
      if (track) track.dataset.hinting = "true";
      hintTimerRef.current = window.setTimeout(() => {
        button.dataset.hinting = "false";
        if (track) track.dataset.hinting = "false";
      }, NEXT_PAGE_HINT_DURATION);
    }

    function clearResetTimer() {
      window.clearTimeout(resetTimerRef.current);
    }

    function scheduleStopRelease() {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = window.setTimeout(() => {
        arrivalLockedRef.current = false;
      }, NEXT_PAGE_STOP_SETTLE);
    }

    function resetProgress(delay = 0) {
      clearResetTimer();
      resetTimerRef.current = window.setTimeout(() => setProgress(0), delay);
    }

    function cancelCommit() {
      if (committed) {
        return;
      }

      window.clearTimeout(commitTimerRef.current);
      commitScheduled = false;
    }

    function commitNavigation() {
      if (committed || commitScheduled) {
        return;
      }

      commitScheduled = true;
      clearResetTimer();
      setProgress(1);
      commitTimerRef.current = window.setTimeout(() => {
        committed = true;
        onSelect(nextPage.id);
      }, NEXT_PAGE_COMMIT_DELAY);
    }

    function normalizeWheelDelta(event) {
      const delta = horizontal && Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return delta * 16;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return delta * (horizontal ? window.innerWidth : window.innerHeight);
      }

      return delta;
    }

    function handleWheel(event) {
      if (
        committed ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        (!horizontal && Math.abs(event.deltaX) > Math.abs(event.deltaY)) ||
        document.querySelector(".media-viewer")
      ) {
        return;
      }

      const delta = normalizeWheelDelta(event);
      const atBottom = isAtBottom();

      if (horizontal && !rail.contains(event.target) && Math.abs(event.deltaY) >= Math.abs(event.deltaX) &&
          contentPane.scrollHeight > contentPane.clientHeight + 2 &&
          ((delta > 0 && contentPane.scrollTop + contentPane.clientHeight < contentPane.scrollHeight - 2) ||
           (delta < 0 && contentPane.scrollTop > 0))) return;

      // Vertical wheel movement browses the horizontal work row too.
      if (horizontal && !(delta > 0 && atBottom)) {
        event.preventDefault();
        rail.scrollBy({ left: delta, behavior: "instant" });
      }

      if (delta > 0 && atBottom) {
        event.preventDefault();

        if (arrivalLockedRef.current) {
          showFirstScrollHint();
          scheduleStopRelease();
          return;
        }

        clearResetTimer();
        const wheelStep = Math.min(delta, horizontal ? NEXT_PAGE_WHEEL_THRESHOLD : NEXT_PAGE_MAX_WHEEL_STEP);
        const nextProgress = setProgress(
          progressRef.current + wheelStep / NEXT_PAGE_WHEEL_THRESHOLD,
        );

        if (nextProgress >= 1) {
          commitNavigation();
        } else {
          resetProgress(horizontal ? 160 : NEXT_PAGE_RESET_DELAY);
        }
      } else if (delta < 0 && progressRef.current > 0) {
        cancelCommit();
        clearResetTimer();
        setProgress(0);
        arrivalLockedRef.current = true;
        hintShownRef.current = false;
      } else if (!atBottom && progressRef.current > 0) {
        cancelCommit();
        resetProgress();
      }

      // The fixed sidebar and page gutters share the content pane's scroll area.
      if (!horizontal && !mobileQuery.matches && !contentPane.contains(event.target) && !event.defaultPrevented) {
        event.preventDefault();
        contentPane.scrollBy({ top: delta, behavior: "instant" });
      }
    }

    function handleScroll() {
      if (isAtBottom()) {
        scheduleStopRelease();

        if (mobileQuery.matches || horizontal) {
          showFirstScrollHint();
        }
      } else {
        window.clearTimeout(stopTimerRef.current);
        arrivalLockedRef.current = true;
        hintShownRef.current = false;
        if (track) track.dataset.hinting = "false";
      }

      if (!isAtBottom() && progressRef.current > 0) {
        cancelCommit();
        resetProgress();
      }
    }

    function findTrackedTouch(touchList) {
      for (let index = 0; index < touchList.length; index += 1) {
        if (touchList[index].identifier === touchIdRef.current) {
          return touchList[index];
        }
      }

      return null;
    }

    function clearTouchTracking() {
      window.removeEventListener("touchmove", handleTouchMove);
      touchStartRef.current = null;
      touchStartXRef.current = null;
      touchIdRef.current = null;
      touchClaimedRef.current = false;
      touchStartedAtBottomRef.current = false;
    }

    function handleTouchStart(event) {
      clearTouchTracking();

      // Track upward pulls anywhere at the bottom of the mobile page.
      if (committed || (!horizontal && !mobileQuery.matches) || event.touches.length !== 1 ||
          (horizontal && !rail.contains(event.target)) ||
          document.querySelector(".media-viewer")) {
        return;
      }

      const touch = event.touches[0];
      const startedAtBottom = isAtBottom();

      touchIdRef.current = touch.identifier;
      clearResetTimer();
      touchStartRef.current = horizontal ? touch.clientX : touch.clientY;
      touchStartXRef.current = horizontal ? touch.clientY : touch.clientX;
      touchProgressRef.current = progressRef.current;
      touchStartedAtBottomRef.current = startedAtBottom;

      if (startedAtBottom) {
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
      }
    }

    function handleTouchMove(event) {
      if (committed || touchStartRef.current === null) {
        return;
      }

      const touch = findTrackedTouch(event.touches);

      if (!touch) {
        return;
      }

      const pullDistance = touchStartRef.current - (horizontal ? touch.clientX : touch.clientY);
      const horizontalDistance = Math.abs(touchStartXRef.current - (horizontal ? touch.clientY : touch.clientX));

      if (!touchClaimedRef.current) {
        if (horizontalDistance > Math.max(pullDistance, NEXT_PAGE_TOUCH_ACTIVATION)) {
          clearTouchTracking();
          return;
        }

        if (pullDistance < NEXT_PAGE_TOUCH_ACTIVATION) {
          return;
        }

        touchClaimedRef.current = true;
      }

      event.preventDefault();
      const adjustedPullDistance =
        pullDistance > 0 ? pullDistance - NEXT_PAGE_TOUCH_ACTIVATION : pullDistance;
      const nextProgress =
        touchProgressRef.current + adjustedPullDistance / NEXT_PAGE_TOUCH_THRESHOLD;
      setProgress(nextProgress);
    }

    function handleTouchEnd() {
      if (touchStartRef.current === null) {
        return;
      }

      const startedAtBottom = touchStartedAtBottomRef.current;
      const claimed = touchClaimedRef.current;
      clearTouchTracking();

      if (committed) {
        return;
      }

      if (!startedAtBottom) {
        if (isAtBottom()) {
          showFirstScrollHint();
        }
        return;
      }

      if (!claimed) {
        return;
      }

      if (progressRef.current >= 1) {
        commitNavigation();
      } else {
        resetProgress(NEXT_PAGE_RESET_DELAY);
      }
    }

    function handleTouchCancel() {
      if (touchStartRef.current === null) {
        return;
      }

      const claimed = touchClaimedRef.current;
      clearTouchTracking();

      if (claimed && !committed) {
        resetProgress(NEXT_PAGE_RESET_DELAY);
      }
    }

    const wheelTarget = window;
    const scrollTarget = horizontal ? rail : mobileQuery.matches ? window : contentPane;
    wheelTarget.addEventListener("wheel", handleWheel, { passive: false });
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      wheelTarget.removeEventListener("wheel", handleWheel);
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
      window.cancelAnimationFrame(visualFrameRef.current);
      window.clearTimeout(hintTimerRef.current);
      window.clearTimeout(stopTimerRef.current);
      window.clearTimeout(resetTimerRef.current);
      window.clearTimeout(commitTimerRef.current);
      if (track) {
        delete track.dataset.pulling;
        delete track.dataset.hinting;
        track.style.removeProperty("--work-overdrag");
      }
    };
  }, [nextPage, onSelect, horizontal]);

  if (currentIndex === -1 || !nextPage) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      className="next-page-link"
      type="button"
      onClick={() => onSelect(nextPage.id)}
      onPointerEnter={() => preloadSection(nextPage.id)}
      onFocus={() => preloadSection(nextPage.id)}
      data-pulling="false"
      data-hinting="false"
      style={{ "--next-page-progress": 0, "--next-page-hint": NEXT_PAGE_FIRST_SCROLL_HINT }}
      aria-label={`Next page: ${nextPage.label}`}
    >
      <span className="next-page-content">
        <span className="next-page-thumbnail">
          <img src={nextPage.thumbnail} alt="" />
        </span>
        <span className="next-page-destination">{nextPage.label}</span>
      </span>
      <span className="next-page-action" aria-hidden="true">
        <img src={nextPageChevron} alt="" />
      </span>
    </button>
  );
}

function ContentPane({ onSelect, selectedId, transitionKey = 0, transitionPhase = "idle" }) {
  const selectedContent = content[selectedId] ?? content["fuse-wallet"];
  const isWork = selectedId === "fuse-wallet" || selectedId === "explorations";
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [activeMediaElement, setActiveMediaElement] = useState(null);
  const [isSingleColumn, setIsSingleColumn] = useState(() => window.matchMedia("(max-width: 560px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 560px)");
    const updateColumns = () => setIsSingleColumn(query.matches);
    query.addEventListener("change", updateColumns);
    return () => query.removeEventListener("change", updateColumns);
  }, []);
  const [hiddenMediaIndexes, setHiddenMediaIndexes] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerSettled, setIsViewerSettled] = useState(false);
  const [mediaStartTime, setMediaStartTime] = useState(0);
  const [outgoingMedia, setOutgoingMedia] = useState(null);
  const [viewerRect, setViewerRect] = useState(null);
  const [viewerTransform, setViewerTransform] = useState(identityTransform);
  const mediaCardRefs = useRef([]);
  const mediaViewerStageRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cleanupTimerRef = useRef(null);
  const mediaSwapTimerRef = useRef(null);
  const sourceRevealTimerRef = useRef(null);
  const swapIdRef = useRef(0);
  const paneRef = useRef(null);
  const paneClassName = `content-pane${isWork ? " selected-work-page" : ""}${transitionPhase === "idle" ? "" : ` content-pane--${transitionPhase}`}`;

  useEffect(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    setActiveMediaIndex(null);
    setActiveMediaElement(null);
    setHiddenMediaIndexes([]);
    setIsViewerOpen(false);
    setIsViewerSettled(false);
    setOutgoingMedia(null);
    setViewerRect(null);
    setViewerTransform(identityTransform);
    mediaCardRefs.current = [];
  }, [selectedId]);

  useLayoutEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = 0;
    }
  }, [selectedId]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.clearTimeout(cleanupTimerRef.current);
      window.clearTimeout(mediaSwapTimerRef.current);
      window.clearTimeout(sourceRevealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeMediaIndex === null || !isViewerOpen) {
      return undefined;
    }

    let viewportWidth = window.innerWidth;
    function handleResize() {
      // Safari changes viewport height as its bars expand/collapse. Keep the
      // current transition anchored; only a width change requires new geometry.
      const nextWidth = window.innerWidth;
      if (nextWidth <= 960 && nextWidth === viewportWidth) return;
      viewportWidth = nextWidth;
      const currentRect = getStageRect();

      if (!currentRect) {
        return;
      }

      const targetRect = getCenteredRect(currentRect, hasMediaCaption(activeMediaIndex));
      setViewerRect(targetRect);
      setViewerTransform(getTransformBetweenRects(currentRect, targetRect));
      setIsViewerSettled(false);
      settleViewer();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeMediaIndex, isViewerOpen]);

  if (selectedContent.type === "photography") {
    return (
      <PhotographyPane
        onSelect={onSelect}
        selectedContent={selectedContent}
        selectedId={selectedId}
        transitionKey={transitionKey}
        transitionPhase={transitionPhase}
      />
    );
  }

  const hasMediaGrid = Boolean(selectedContent.media?.length);
  const indexedMedia = hasMediaGrid
    ? selectedContent.media.map((item, index) => ({ item, index }))
    : [];
  const mediaColumns = hasMediaGrid
    ? isSingleColumn ? [indexedMedia] : [
        indexedMedia.filter(({ index }) => index % 2 === 0),
        indexedMedia.filter(({ index }) => index % 2 === 1),
      ]
    : [];
  function getSourceRect(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();

    return {
      height: Math.max(rect.height, 1),
      left: rect.left,
      top: rect.top,
      width: Math.max(rect.width, 1),
    };
  }

  function hasMediaCaption(index) {
    const item = selectedContent.media?.[index];

    return Boolean(item?.description);
  }

  function getCenteredRect(sourceRect, reserveCaption = false) {
    const aspectRatio = sourceRect.width / sourceRect.height;
    const isCompactViewport = window.innerWidth <= 960;
    const maxWidth = isCompactViewport
      ? Math.max(window.innerWidth - 48, 1)
      : Math.min(window.innerWidth * 0.76, 820);
    const maxHeight = isCompactViewport
      ? Math.max(window.innerHeight - (reserveCaption ? 240 : 176), 1)
      : Math.min(window.innerHeight * 0.8, 920);
    let viewerWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    let viewerHeight = viewerWidth / aspectRatio;

    if (viewerHeight > maxHeight) {
      viewerHeight = maxHeight;
      viewerWidth = viewerHeight * aspectRatio;
    }

    return {
      height: viewerHeight,
      left: (window.innerWidth - viewerWidth) / 2,
      top: (window.innerHeight - viewerHeight) / 2,
      width: viewerWidth,
    };
  }

  function getTransformBetweenRects(fromRect, toRect) {
    return {
      scaleX: fromRect.width / toRect.width,
      scaleY: fromRect.height / toRect.height,
      x: fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2),
      y: fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2),
    };
  }

  function getStageRect() {
    if (mediaViewerStageRef.current) {
      return getSourceRect(mediaViewerStageRef.current);
    }

    return viewerRect;
  }

  function settleViewer() {
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      if (mediaViewerStageRef.current) {
        mediaViewerStageRef.current.getBoundingClientRect();
      }

      setIsViewerSettled(true);
    });
  }

  function scheduleCloseCleanup() {
    window.clearTimeout(cleanupTimerRef.current);
    cleanupTimerRef.current = window.setTimeout(() => {
      completeClose();
    }, MEDIA_TRANSITION_MS + 120);
  }

  function completeClose() {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    setActiveMediaIndex(null);
    setActiveMediaElement(null);
    setHiddenMediaIndexes([]);
    setOutgoingMedia(null);
    setViewerRect(null);
    setViewerTransform(identityTransform);
    setIsViewerSettled(false);
  }

  function openMedia(index, sourceElement) {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    const sourceRect = getSourceRect(sourceElement);
    const sourceMedia = sourceElement.querySelector("video, img");
    const targetRect = getCenteredRect(sourceRect, hasMediaCaption(index));

    if (sourceMedia) {
      sourceElement.style.height = `${sourceRect.height}px`;
    }

    setActiveMediaElement(sourceMedia);
    setMediaStartTime(sourceMedia instanceof HTMLVideoElement ? sourceMedia.currentTime : 0);
    setOutgoingMedia(null);
    setViewerRect(targetRect);
    setViewerTransform(getTransformBetweenRects(sourceRect, targetRect));
    setActiveMediaIndex(index);
    setHiddenMediaIndexes([index]);
    setIsViewerOpen(true);
    setIsViewerSettled(false);
    settleViewer();
  }

  function closeMedia() {
    if (!isViewerOpen) {
      return;
    }

    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);

    if (activeMediaIndex !== null) {
      const sourceElement = mediaCardRefs.current[activeMediaIndex];

      if (sourceElement) {
        const sourceRect = getSourceRect(sourceElement);
        const currentRect =
          getStageRect() ?? getCenteredRect(sourceRect, hasMediaCaption(activeMediaIndex));

        setViewerRect(currentRect);
        setViewerTransform(identityTransform);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          animationFrameRef.current = window.requestAnimationFrame(() => {
            setViewerTransform(getTransformBetweenRects(sourceRect, currentRect));
          });
        });
      }
    }

    setIsViewerOpen(false);
    setIsViewerSettled(false);
    scheduleCloseCleanup();
  }

  function stepMedia(step) {
    if (activeMediaIndex === null || !selectedContent.media?.length) {
      return;
    }

    const mediaCount = selectedContent.media.length;
    const nextIndex = (activeMediaIndex + step + mediaCount) % mediaCount;
    const sourceElement = mediaCardRefs.current[nextIndex];
    const currentRect = getStageRect();
    const currentVideo = mediaViewerStageRef.current?.querySelector(
      ".media-viewer-media-layer--current video",
    );

    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    swapIdRef.current += 1;
    setOutgoingMedia({
      id: swapIdRef.current,
      item: selectedContent.media[activeMediaIndex],
      sharedElement: activeMediaElement,
      startTime: currentVideo ? currentVideo.currentTime : mediaStartTime,
    });
    setHiddenMediaIndexes((indexes) => Array.from(new Set([...indexes, activeMediaIndex, nextIndex])));
    setIsViewerOpen(true);

    if (sourceElement) {
      const sourceRect = getSourceRect(sourceElement);
      const targetRect = getCenteredRect(sourceRect, hasMediaCaption(nextIndex));
      const sourceMedia = sourceElement.querySelector("video, img");

      if (sourceMedia) {
        sourceElement.style.height = `${sourceRect.height}px`;
      }

      setViewerRect(targetRect);
      setViewerTransform(getTransformBetweenRects(currentRect ?? sourceRect, targetRect));
      setIsViewerSettled(false);
      settleViewer();
      setActiveMediaElement(sourceMedia);
      setMediaStartTime(sourceMedia instanceof HTMLVideoElement ? sourceMedia.currentTime : 0);
    } else {
      setActiveMediaElement(null);
      setMediaStartTime(0);
    }

    setActiveMediaIndex(nextIndex);
    mediaSwapTimerRef.current = window.setTimeout(() => {
      setOutgoingMedia(null);
    }, MEDIA_SWAP_MS + 40);
    sourceRevealTimerRef.current = window.setTimeout(() => {
      setHiddenMediaIndexes([nextIndex]);
    }, MEDIA_SWAP_MS + 60);
  }

  function finishClose() {
    if (isViewerOpen) {
      return;
    }

    completeClose();
  }

  return (
    <main
      className={paneClassName}
      aria-label={isWork ? selectedContent.title : "Selected content"}
      ref={paneRef}
    >
      {isWork ? (
        <div className="work-layout" key={`${selectedId}-${transitionKey}`}>
          <WorkIntro selectedId={selectedId} onSelect={onSelect} />
          <div className="work-rail" role="region" aria-label={`${selectedContent.title} projects`} tabIndex={0}>
            <div className="work-rail-track">
              <div className="work-rail-lead" aria-hidden="true" />
              {indexedMedia.map(({ item, index }) => (
                <figure className="work-piece" key={item.src} style={{ "--work-aspect-ratio": getMediaAspectRatio(item), "--page-reveal-delay": `${70 + Math.min(index, 2) * 35}ms` }}>
                  <MediaCard sharedPreview={index === 0 ? selectedId : undefined} isHidden={hiddenMediaIndexes.includes(index)} priority={index < 2} item={item}
                    onClick={event => openMedia(index, event.currentTarget)}
                    refCallback={element => { mediaCardRefs.current[index] = element; }} />
                  <figcaption>{item.description}</figcaption>
                </figure>
              ))}
              <div className="work-rail-end"><NextPageLink currentId={selectedId} onSelect={onSelect} horizontal /></div>
            </div>
          </div>
          <span className="home-object-instructions" id="work-object-instructions">Press Escape to return home.</span>
        </div>
      ) : (
      <div className="content-motion" key={`${selectedId}-${transitionKey}`}>
        <div className={hasMediaGrid ? "content-stack content-stack--wide" : "content-stack"}>
          <section className={hasMediaGrid ? "work-detail work-detail--media" : "work-detail"}>
            {hasMediaGrid ? null : <h1>{selectedContent.title}</h1>}
            {selectedContent.description ? <p>{selectedContent.description}</p> : null}

            {hasMediaGrid ? (
              <div className="work-media-grid" aria-label={`${selectedContent.title} media`}>
                {mediaColumns.map((column, columnIndex) => (
                  <div className="work-media-column" key={`media-column-${columnIndex}`}>
                    {column.map(({ item, index }) => (
                      <MediaCard
                        isHidden={hiddenMediaIndexes.includes(index)}
                        priority={index < 2}
                        item={item}
                        key={item.src}
                        onClick={(event) => openMedia(index, event.currentTarget)}
                        refCallback={(element) => {
                          mediaCardRefs.current[index] = element;
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              selectedContent.images.map((image) => (
                <img className="detail-image" src={getMediaSource(image.src)} alt={image.alt} key={image.alt} />
              ))
            )}
            <NextPageLink currentId={selectedId} onSelect={onSelect} />
          </section>
        </div>
      </div>
      )}
      {hasMediaGrid && activeMediaIndex !== null ? (
        <MediaViewer
          isOpen={isViewerOpen}
          isSettled={isViewerSettled}
          item={selectedContent.media[activeMediaIndex]}
          onClose={closeMedia}
          onCloseComplete={finishClose}
          onNext={() => stepMedia(1)}
          onPrevious={() => stepMedia(-1)}
          outgoingMedia={outgoingMedia}
          rect={viewerRect}
          sharedElement={activeMediaElement}
          stageRef={mediaViewerStageRef}
          startTime={mediaStartTime}
          title={selectedContent.title}
          transform={viewerTransform}
        />
      ) : null}
    </main>
  );
}

function PhotographyPane({ onSelect, selectedContent, selectedId, transitionKey, transitionPhase }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [activeElement, setActiveElement] = useState(null);
  const [hiddenMediaIndexes, setHiddenMediaIndexes] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerSettled, setIsViewerSettled] = useState(false);
  const [outgoingMedia, setOutgoingMedia] = useState(null);
  const [viewerRect, setViewerRect] = useState(null);
  const [viewerTransform, setViewerTransform] = useState(identityTransform);
  const mediaCardRefs = useRef([]);
  const mediaViewerStageRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cleanupTimerRef = useRef(null);
  const mediaSwapTimerRef = useRef(null);
  const sourceRevealTimerRef = useRef(null);
  const swapIdRef = useRef(0);
  const paneRef = useRef(null);
  const paneClassName =
    transitionPhase === "idle" ? "content-pane" : `content-pane content-pane--${transitionPhase}`;

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.clearTimeout(cleanupTimerRef.current);
      window.clearTimeout(mediaSwapTimerRef.current);
      window.clearTimeout(sourceRevealTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = 0;
    }
  }, [selectedId]);

  useEffect(() => {
    if (activeMediaIndex === null || !isViewerOpen) {
      return undefined;
    }

    let viewportWidth = window.innerWidth;
    function handleResize() {
      // Safari changes viewport height as its bars expand/collapse. Keep the
      // current transition anchored; only a width change requires new geometry.
      const nextWidth = window.innerWidth;
      if (nextWidth <= 960 && nextWidth === viewportWidth) return;
      viewportWidth = nextWidth;
      const currentRect = getStageRect();

      if (!currentRect) {
        return;
      }

      const targetRect = getCenteredRect(currentRect);
      setViewerRect(targetRect);
      setViewerTransform(getTransformBetweenRects(currentRect, targetRect));
      setIsViewerSettled(false);
      settleViewer();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeMediaIndex, isViewerOpen]);

  function getSourceRect(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();

    return {
      height: Math.max(rect.height, 1),
      left: rect.left,
      top: rect.top,
      width: Math.max(rect.width, 1),
    };
  }

  function getCenteredRect(sourceRect) {
    const aspectRatio = sourceRect.width / sourceRect.height;
    const isCompactViewport = window.innerWidth <= 960;
    const maxWidth = isCompactViewport
      ? Math.max(window.innerWidth - 40, 1)
      : Math.min(window.innerWidth * 0.86, 1000);
    const maxHeight = isCompactViewport
      ? Math.max(window.innerHeight - 240, 1)
      : Math.max(Math.min(window.innerHeight * 0.84, window.innerHeight - 144, 980), 1);
    let viewerWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    let viewerHeight = viewerWidth / aspectRatio;

    if (viewerHeight > maxHeight) {
      viewerHeight = maxHeight;
      viewerWidth = viewerHeight * aspectRatio;
    }

    return {
      height: viewerHeight,
      left: (window.innerWidth - viewerWidth) / 2,
      top: (window.innerHeight - viewerHeight) / 2,
      width: viewerWidth,
    };
  }

  function getTransformBetweenRects(fromRect, toRect) {
    return {
      scaleX: fromRect.width / toRect.width,
      scaleY: fromRect.height / toRect.height,
      x: fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2),
      y: fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2),
    };
  }

  function getStageRect() {
    if (mediaViewerStageRef.current) {
      return getSourceRect(mediaViewerStageRef.current);
    }

    return viewerRect;
  }

  function settleViewer() {
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      if (mediaViewerStageRef.current) {
        mediaViewerStageRef.current.getBoundingClientRect();
      }

      setIsViewerSettled(true);
    });
  }

  function completeClose() {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    setActiveMediaIndex(null);
    setActiveElement(null);
    setHiddenMediaIndexes([]);
    setOutgoingMedia(null);
    setViewerRect(null);
    setViewerTransform(identityTransform);
    setIsViewerSettled(false);
  }

  function scheduleCloseCleanup() {
    window.clearTimeout(cleanupTimerRef.current);
    cleanupTimerRef.current = window.setTimeout(completeClose, MEDIA_TRANSITION_MS + 120);
  }

  function openMedia(index, sourceElement) {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    const sourceRect = getSourceRect(sourceElement);
    const sourceImage = sourceElement.querySelector("img");
    const targetRect = getCenteredRect(sourceRect);

    sourceElement.style.height = `${sourceRect.height}px`;
    setActiveElement(sourceImage);
    setOutgoingMedia(null);
    setViewerRect(targetRect);
    setViewerTransform(getTransformBetweenRects(sourceRect, targetRect));
    setActiveMediaIndex(index);
    setHiddenMediaIndexes([index]);
    setIsViewerOpen(true);
    setIsViewerSettled(false);
    settleViewer();
  }

  function closeMedia() {
    if (!isViewerOpen) {
      return;
    }

    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);

    if (activeMediaIndex !== null) {
      const sourceElement = mediaCardRefs.current[activeMediaIndex];

      if (sourceElement) {
        const sourceRect = getSourceRect(sourceElement);
        const currentRect = getStageRect() ?? getCenteredRect(sourceRect);

        setViewerRect(currentRect);
        setViewerTransform(identityTransform);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          animationFrameRef.current = window.requestAnimationFrame(() => {
            setViewerTransform(getTransformBetweenRects(sourceRect, currentRect));
          });
        });
      }
    }

    setIsViewerOpen(false);
    setIsViewerSettled(false);
    scheduleCloseCleanup();
  }

  function stepMedia(step) {
    if (activeMediaIndex === null || !selectedContent.images.length) {
      return;
    }

    const mediaCount = selectedContent.images.length;
    const nextIndex = (activeMediaIndex + step + mediaCount) % mediaCount;
    const sourceElement = mediaCardRefs.current[nextIndex];
    const currentRect = getStageRect();

    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    swapIdRef.current += 1;
    setOutgoingMedia({
      id: swapIdRef.current,
      item: { ...selectedContent.images[activeMediaIndex], type: "image" },
      sharedElement: activeElement,
      startTime: 0,
    });
    setHiddenMediaIndexes((indexes) => Array.from(new Set([...indexes, activeMediaIndex, nextIndex])));
    setIsViewerOpen(true);

    if (sourceElement) {
      const sourceRect = getSourceRect(sourceElement);
      const targetRect = getCenteredRect(sourceRect);
      const sourceImage = sourceElement.querySelector("img");

      sourceElement.style.height = `${sourceRect.height}px`;
      setViewerRect(targetRect);
      setViewerTransform(getTransformBetweenRects(currentRect ?? sourceRect, targetRect));
      setIsViewerSettled(false);
      settleViewer();
      setActiveElement(sourceImage);
    } else {
      setActiveElement(null);
    }

    setActiveMediaIndex(nextIndex);
    mediaSwapTimerRef.current = window.setTimeout(() => {
      setOutgoingMedia(null);
    }, MEDIA_SWAP_MS + 40);
    sourceRevealTimerRef.current = window.setTimeout(() => {
      setHiddenMediaIndexes([nextIndex]);
    }, MEDIA_SWAP_MS + 60);
  }

  function finishClose() {
    if (isViewerOpen) {
      return;
    }

    completeClose();
  }

  return (
    <main
      className={paneClassName}
      aria-label="Selected content"
      ref={paneRef}
    >
      <div className="content-motion" key={`${selectedId}-${transitionKey}`}>
        <section className="photo-feed" aria-label="Photography">
          {selectedContent.images.map((image, index) => (
            <button
              className="photo-frame"
              data-hidden={hiddenMediaIndexes.includes(index) ? "true" : "false"}
              key={`${image.alt}-${index}`}
              type="button"
              onClick={(event) => openMedia(index, event.currentTarget)}
              ref={(element) => {
                mediaCardRefs.current[index] = element;
              }}
              aria-label={image.alt}
            >
              <img
                src={getMediaSource(image.src)}
                width={image.width}
                height={image.height}
                alt={image.alt}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}
          <NextPageLink currentId={selectedId} onSelect={onSelect} />
        </section>
      </div>
      {activeMediaIndex !== null ? (
        <MediaViewer
          backdropMode="white"
          isOpen={isViewerOpen}
          isSettled={isViewerSettled}
          item={{ ...selectedContent.images[activeMediaIndex], type: "image" }}
          onClose={closeMedia}
          onCloseComplete={finishClose}
          onNext={() => stepMedia(1)}
          onPrevious={() => stepMedia(-1)}
          outgoingMedia={outgoingMedia}
          rect={viewerRect}
          sharedElement={activeElement}
          stageRef={mediaViewerStageRef}
          startTime={0}
          title="Photography"
          transform={viewerTransform}
        />
      ) : null}
    </main>
  );
}

function MediaCard({ isHidden, item, onClick, priority, refCallback, sharedPreview }) {
  return (
    <button
      className="work-media-card"
      data-shared-preview={sharedPreview}
      data-hidden={isHidden ? "true" : "false"}
      style={item.aspectRatio ? { "--media-aspect-ratio": item.aspectRatio } : undefined}
      type="button"
      onClick={onClick}
      ref={refCallback}
      aria-label={item.alt}
    >
      {item.type === "image" ? (
        <img
          className="work-image"
          src={getMediaSource(item.src)}
          width={item.width}
          height={item.height}
          alt={item.alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      ) : (
        <WorkVideo item={item} priority={priority} />
      )}
    </button>
  );
}

function WorkVideo({ item, priority }) {
  const videoRef = useRef(null);
  useEffect(() => observeWorkVideo(videoRef.current, item.src, { priority }), [item.src, priority]);

  return (
    <video
      ref={videoRef}
      aria-label={item.alt}
      className="work-video"
      loop
      muted
      playsInline
      preload="none"
    />
  );
}

function ViewerMedia({ item, layer, sharedElement = null, startTime }) {
  const layerRef = useRef(null);
  const videoRef = useRef(null);

  useLayoutEffect(() => {
    const layerElement = layerRef.current;

    if (!layerElement || !sharedElement) {
      return undefined;
    }

    const originalParent = sharedElement.parentNode;
    const originalNextSibling = sharedElement.nextSibling;
    const originalClassName = sharedElement.className;

    layerElement.appendChild(sharedElement);
    sharedElement.className = "media-viewer-media";

    if (sharedElement instanceof HTMLVideoElement) {
      refreshVideoPlayback();
    }

    return () => {
      sharedElement.className = originalClassName;

      if (originalParent?.isConnected) {
        const nextSibling =
          originalNextSibling?.parentNode === originalParent ? originalNextSibling : null;

        originalParent.insertBefore(sharedElement, nextSibling);

        if (originalParent instanceof HTMLElement) {
          // Restore natural layout in this same commit, before revealing the card.
          originalParent.style.height = "";
        }

        if (sharedElement instanceof HTMLVideoElement) {
          refreshVideoPlayback();
        }
      }
    };
  }, [sharedElement]);

  useLayoutEffect(() => {
    const video = videoRef.current;

    if (!video || sharedElement) {
      return undefined;
    }

    function syncTime() {
      if (Number.isFinite(video.duration)) {
        const targetTime = Math.min(startTime, video.duration);

        if (startTime > 0 && Math.abs(video.currentTime - targetTime) > 0.025) {
          video.currentTime = targetTime;
        }
      }
    }

    if (video.readyState >= 1) {
      syncTime();
    } else {
      video.addEventListener("loadedmetadata", syncTime, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", syncTime);
    };
  }, [item.src, sharedElement, startTime]);

  return (
    <span
      className={`media-viewer-media-layer media-viewer-media-layer--${layer}`}
      ref={layerRef}
    >
      {item.type === "image" && !sharedElement ? (
        <img className="media-viewer-media" src={getMediaSource(item.src)} alt={item.alt} />
      ) : item.type === "video" && !sharedElement ? (
        <video
          ref={videoRef}
          aria-label={item.alt}
          autoPlay
          className="media-viewer-media"
          loop
          muted
          playsInline
          preload="auto"
          src={getMediaSource(item.src)}
        />
      ) : null}
    </span>
  );
}

function MediaViewer({
  backdropMode = "blur",
  isOpen,
  isSettled,
  item,
  onClose,
  onCloseComplete,
  onNext,
  onPrevious,
  outgoingMedia,
  rect,
  sharedElement,
  stageRef,
  startTime,
  title,
  transform,
}) {
  const [isBackdropActive, setIsBackdropActive] = useState(false);
  const backdropFrameRef = useRef(null);
  const dialogRef = useRef(null);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement;
    const root = document.getElementById("root");
    const previousInert = root.inert;
    root.inert = true;
    refreshVideoPlayback();
    stageRef.current?.focus({ preventScroll: true });
    return () => {
      root.inert = previousInert;
      refreshVideoPlayback();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Tab") {
        const buttons = [...dialogRef.current.querySelectorAll("button")];
        const index = buttons.indexOf(document.activeElement);
        const nextIndex = (index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
        event.preventDefault();
        buttons[nextIndex]?.focus();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    const previousOverflow = document.body.style.overflow;
    // Changing body overflow on iOS also changes the browser bars and viewport.
    // Block gestures on the overlay instead, leaving the feed's layout intact.
    if (!isMobile) document.body.style.overflow = "hidden";
    function preventBackgroundScroll(event) {
      if (event.touches?.length > 1 || event.ctrlKey) return;
      event.preventDefault();
    }
    dialog.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    dialog.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    return () => {
      dialog.removeEventListener("touchmove", preventBackgroundScroll);
      dialog.removeEventListener("wheel", preventBackgroundScroll);
      if (!isMobile) document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    window.cancelAnimationFrame(backdropFrameRef.current);

    if (!isOpen) {
      setIsBackdropActive(false);
      return undefined;
    }

    setIsBackdropActive(false);
    backdropFrameRef.current = window.requestAnimationFrame(() => {
      backdropFrameRef.current = window.requestAnimationFrame(() => {
        setIsBackdropActive(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(backdropFrameRef.current);
    };
  }, [isOpen]);

  const transformScale = Math.sqrt(Math.max(transform.scaleX * transform.scaleY, 0.0001));

  const stageStyle = rect
    ? {
        height: `${rect.height}px`,
        left: `${rect.left}px`,
        "--viewer-scale-x": transform.scaleX,
        "--viewer-scale-y": transform.scaleY,
        "--viewer-x": `${transform.x}px`,
        "--viewer-y": `${transform.y}px`,
        "--viewer-radius-start": `${12 / transformScale}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
      }
    : undefined;
  const caption = item.description ?? "";
  const captionStyle = rect
    ? {
        left: `${rect.left}px`,
        top: `${rect.top + rect.height + 18}px`,
        width: `${rect.width}px`,
      }
    : undefined;

  return createPortal(
    <div
      className="media-viewer"
      ref={dialogRef}
      data-backdrop={backdropMode}
      data-open={isBackdropActive ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} media`}
      onClick={onClose}
    >
      <div className="media-viewer-backdrop" aria-hidden="true" />
      <button
        className="media-viewer-stage"
        data-open={isOpen ? "true" : "false"}
        data-settled={isSettled ? "true" : "false"}
        type="button"
        ref={stageRef}
        style={stageStyle}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "transform") {
            onCloseComplete();
          }
        }}
        aria-label={`Close media viewer: ${item.alt}`}
      >
        <span className="media-viewer-media-shell">
          <ViewerMedia
            item={item}
            key={item.src}
            layer="current"
            sharedElement={sharedElement}
            startTime={startTime}
          />
          {outgoingMedia ? (
            <ViewerMedia
              item={outgoingMedia.item}
              key={`outgoing-${outgoingMedia.id}`}
              layer="outgoing"
              sharedElement={outgoingMedia.sharedElement}
              startTime={outgoingMedia.startTime}
            />
          ) : null}
        </span>
      </button>
      {caption ? (
        <p
          className="media-viewer-caption"
          data-visible={isOpen && isSettled ? "true" : "false"}
          style={captionStyle}
        >
          <span>{caption}</span>
        </p>
      ) : null}
    </div>,
    document.body,
  );
}

function App() {
  const [selectedId, setSelectedId] = useState(() => getRouteSectionId());
  const [displayedId, setDisplayedId] = useState(() => getRouteSectionId());
  const [pageTransitionPhase, setPageTransitionPhase] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "idle" : "entering",
  );
  const [pageTransitionKey, setPageTransitionKey] = useState(0);
  const sharedTransitionRef = useRef(null);
  const pageTransitionTimerRef = useRef(null);
  const pageTransitionSettleTimerRef = useRef(null);
  const selectedIdRef = useRef(selectedId);
  const displayedIdRef = useRef(displayedId);

  useLayoutEffect(() => {
    document.title = sectionTitles[selectedId] ?? sectionTitles[DEFAULT_SECTION_ID];
  }, [selectedId]);

  useEffect(() => {
    const pages = pageLoop.map(page => content[page.id].media.filter(item => item.type === "video"));
    // Interleave destinations: both opening views are ready before deeper clips.
    const queue = Array.from({ length: Math.max(...pages.map(items => items.length)) }, (_, index) =>
      pages.map(items => items[index]).filter(Boolean),
    ).flat();
    mediaPreloader.enqueue(queue);
    let started = false;
    let idleId;
    let timeoutId;
    const connection = navigator.connection;

    function sync() {
      if (started && !document.hidden && canPreloadMedia()) mediaPreloader.resume();
      else mediaPreloader.pause();
    }
    function start() {
      started = true;
      sync();
    }
    function schedule() {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(start, { timeout: 1200 });
      else timeoutId = window.setTimeout(start, 150);
    }
    // Let the home artwork and initial page render load first. Once started,
    // the queue survives navigation; hiding the tab pauses only new requests.
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    document.addEventListener("visibilitychange", sync);
    connection?.addEventListener("change", sync);
    return () => {
      mediaPreloader.pause();
      window.removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", sync);
      connection?.removeEventListener("change", sync);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      const nextId = getRouteSectionId();
      pushRouteSectionId(nextId, true);
      transitionTo(nextId);
    }

    pushRouteSectionId(getRouteSectionId(), true);
    // Reuse the page entrance on first paint, including the shared objects.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pageTransitionSettleTimerRef.current = window.setTimeout(() => {
        setPageTransitionPhase("idle");
      }, displayedIdRef.current === "home" ? HOME_ENTER_MS : PAGE_ENTER_MS);
    }
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    return () => {
      sharedTransitionRef.current?.skipTransition();
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
      window.clearTimeout(pageTransitionTimerRef.current);
      window.clearTimeout(pageTransitionSettleTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia("(max-width: 960px)").matches) {
      window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    }
  }, [displayedId]);

  function setDisplayedContent(nextId) {
    displayedIdRef.current = nextId;
    setDisplayedId(nextId);
  }

  const transitionTo = useCallback((nextId) => {
    preloadSection(nextId);
    if (nextId === selectedIdRef.current) {
      return;
    }

    sharedTransitionRef.current?.skipTransition();
    selectedIdRef.current = nextId;
    setSelectedId(nextId);
    window.clearTimeout(pageTransitionTimerRef.current);
    window.clearTimeout(pageTransitionSettleTimerRef.current);

    if (nextId === displayedIdRef.current) {
      setPageTransitionPhase("idle");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedContent(nextId);
      setPageTransitionPhase("idle");
      return;
    }

    const fromId = displayedIdRef.current;
    const section = fromId === "home" ? nextId : nextId === "home" ? fromId : null;
    if (section === "fuse-wallet" || section === "explorations") {
      const transition = startPreviewTransition(section, () => {
        if (selectedIdRef.current !== nextId) return false;
        flushSync(() => {
          setDisplayedContent(nextId);
          setPageTransitionKey(key => key + 1);
          setPageTransitionPhase("idle");
        });
        return true;
      });
      if (transition) {
        sharedTransitionRef.current = transition;
        return;
      }
    }

    setPageTransitionPhase("leaving");
    pageTransitionTimerRef.current = window.setTimeout(() => {
      setDisplayedContent(nextId);
      setPageTransitionKey((key) => key + 1);
      setPageTransitionPhase("entering");

      pageTransitionSettleTimerRef.current = window.setTimeout(() => {
        setPageTransitionPhase("idle");
      }, nextId === "home" ? HOME_ENTER_MS : PAGE_ENTER_MS);
    }, PAGE_EXIT_MS);
  }, []);

  const handleSelect = useCallback((nextId) => {
    pushRouteSectionId(nextId);
    transitionTo(nextId);
  }, [transitionTo]);

  useEffect(() => {
    if (pageTransitionPhase !== "idle") return;
    function navigateWithKey(event) {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.getElementById("root")?.inert) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) return;
      const key = event.key.toLowerCase();
      const destination = key === "s" ? "fuse-wallet" : key === "e" ? "explorations" : null;
      const isWork = displayedId === "fuse-wallet" || displayedId === "explorations";
      const nextId = displayedId === "home" ? destination
        : isWork && (destination === displayedId || key === "escape") ? "home" : null;
      if (!nextId) return;
      event.preventDefault();
      event.stopPropagation();
      handleSelect(nextId);
    }
    // Let Escape leave a work page even when its rotatable object has focus.
    window.addEventListener("keydown", navigateWithKey, true);
    return () => window.removeEventListener("keydown", navigateWithKey, true);
  }, [displayedId, pageTransitionPhase, handleSelect]);

  return (
    <>
      {displayedId === "home" ? <Home previews={homePreviews} phase={pageTransitionPhase} onSelect={handleSelect} onIntent={preloadSection} /> :
      displayedId === "fuse-wallet" || displayedId === "explorations" ? (
        <ContentPane key={displayedId} onSelect={handleSelect} selectedId={displayedId} transitionKey={pageTransitionKey} transitionPhase={pageTransitionPhase} />
      ) : (
    <div className="portfolio-shell">
      <aside className="sidebar">
        <div className="navigation-header">
          <a className="home-return" href="/" aria-label="Back to home" onClick={event => navigateFromLink(event, "home", handleSelect)}>
            <PortfolioHeader selectedId={selectedId} />
          </a>
          <PortfolioNav selectedId={selectedId} onSelect={handleSelect} />
        </div>
        <BioBlock />
      </aside>

      <ContentPane
        onSelect={handleSelect}
        selectedId={displayedId}
        transitionKey={pageTransitionKey}
        transitionPhase={pageTransitionPhase}
      />
    </div>
      )}
    </>
  );
}

export default App;
