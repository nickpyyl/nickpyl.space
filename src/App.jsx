import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_SECTION_ID, resolveSectionId, sectionPaths, sectionTitles } from "./routes.js";
import avatarNick from "../assets/avatar-nick-small.png";
import signatureNew from "../assets/signature-new-small.png";
import nextPageChevron from "../assets/icon-chevron-right-small.svg";
import nextPageExplorations from "../assets/next-page-explorations.png";
import nextPageFuse from "../assets/next-page-fuse.svg";
import nextPagePhotography from "../assets/next-page-photography.png";
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
import fuseMedia03 from "../assets/fuse-media/fuse-03.mp4";
import fuseMedia04 from "../assets/fuse-media/fuse-04.mp4";
import fuseMedia05 from "../assets/fuse-media/fuse-05.mp4";
import fuseMedia06 from "../assets/fuse-media/fuse-06.mp4";
import fuseMedia07 from "../assets/fuse-media/fuse-07.mp4";
import fuseMedia08 from "../assets/fuse-media/fuse-08.mp4";
import fuseMedia09 from "../assets/fuse-media/fuse-09.mp4";
import fuseMedia10 from "../assets/fuse-media/fuse-10.mp4";
import fuseStill02 from "../assets/fuse-media/fuse-still-02.jpg";
import fuseStill03 from "../assets/fuse-media/fuse-still-03.jpg";
import fuseStill04 from "../assets/fuse-media/fuse-still-04.jpg";
import fuseStill05 from "../assets/fuse-media/fuse-still-05.png";
import fuseStill06 from "../assets/fuse-media/fuse-still-06.png";
import fuseStill07 from "../assets/fuse-media/fuse-still-07.jpg";
import explorationMedia01 from "../assets/explorations-media/exploration-01.mp4";
import explorationMedia02 from "../assets/explorations-media/exploration-02.mp4";
import explorationMedia03 from "../assets/explorations-media/exploration-03.mp4";
import explorationMedia04 from "../assets/explorations-media/exploration-04.mp4";
import explorationMedia05 from "../assets/explorations-media/exploration-05.mp4";
import explorationMedia06 from "../assets/explorations-media/exploration-06.mp4";
import explorationMedia07 from "../assets/explorations-media/exploration-07.mp4";
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
const PAGE_EXIT_MS = 90;
const PAGE_ENTER_MS = 180;
const identityTransform = { scaleX: 1, scaleY: 1, x: 0, y: 0 };

const portfolioSections = [
  {
    title: "Work",
    items: [
      {
        label: "Work",
        items: [
          { id: "explorations", label: "Explorations", status: null },
          { id: "fuse-wallet", label: "Fuse Wallet", status: null },
          { id: "phantom", label: "Phantom", status: "Soon" },
        ],
      },
    ],
  },
  {
    title: "Photography",
    items: [
      { id: "iceland", label: "Selected", mobileLabel: "Photography", status: null },
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
      {
        type: "image",
        src: fuseStill03,
        width: 1600,
        height: 1600,
        alt: "Fuse app icon on iPhone home screen",
        description: "Fuse Plus app icon",
      },
      {
        type: "video",
        src: fuseMedia01,
        alt: "Fuse Wallet interaction video 1",
        description: "Send with Hide My Wallet",
      },
      {
        type: "video",
        src: fuseMedia02,
        alt: "Fuse Wallet interaction video 2",
        description: "Transaction tracking and expand interaction",
      },
      {
        type: "image",
        src: fuseStill02,
        width: 1600,
        height: 1040,
        alt: "Fuse Plus phone render",
        description: "Fuse Plus membership",
      },
      {
        type: "video",
        src: fuseMedia03,
        alt: "Fuse Wallet interaction video 3",
        description: "Delete wallet interaction",
      },
      {
        type: "video",
        src: fuseMedia04,
        alt: "Fuse Wallet interaction video 4",
        description: "Recently redesigned Fuse dashboard",
      },
      {
        type: "video",
        src: fuseMedia05,
        alt: "Fuse Wallet interaction video 5",
        description: "New address input field",
      },
      {
        type: "video",
        src: fuseMedia06,
        alt: "Fuse Wallet interaction video 6",
        description: "Promo cards interaction",
      },
      {
        type: "image",
        src: fuseStill04,
        width: 1600,
        height: 1246,
        alt: "Fuse card render",
        description: "Fuse Cards design",
      },
      {
        type: "video",
        src: fuseMedia07,
        alt: "Fuse Wallet interaction video 7",
        description: "Pending verification",
      },
      {
        type: "video",
        src: fuseMedia08,
        alt: "Fuse Wallet interaction video 8",
        description: "Multi-action button interaction",
      },
      {
        type: "video",
        src: fuseMedia09,
        alt: "Fuse Wallet interaction video 9",
        description: "New onboarding flow",
      },
      {
        type: "video",
        src: fuseMedia10,
        alt: "Fuse Wallet interaction video 10",
        description: "Coin breakdown interaction",
      },
      {
        type: "image",
        src: fuseStill05,
        width: 2163,
        height: 1407,
        alt: "Fuse Wallet receive flow and virtual bank account screens",
        description: "Receive Fiat screens",
      },
      {
        type: "image",
        src: fuseStill06,
        width: 2400,
        height: 1560,
        alt: "Fuse Wallet card, cash, investments, and earn screens",
        description: "Accounts System",
      },
      {
        type: "image",
        src: fuseStill07,
        width: 2800,
        height: 2800,
        alt: "Fuse Wallet Device Key security screen",
        description: "Onboarding part",
      },
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
    title: "Explorations",
    description: "",
    media: [
      {
        type: "video",
        src: explorationMedia02,
        alt: "Exploration interaction video 2",
        description: "Document signature / mobile version",
      },
      {
        type: "video",
        src: explorationMedia01,
        alt: "Exploration interaction video 1",
        description: "Interaction with my shots from Copenhagen",
      },
      {
        type: "video",
        src: explorationMedia03,
        alt: "Exploration interaction video 3",
        description: "36 exposure cards with film simulation for a more analog feel",
      },
      {
        type: "video",
        src: explorationMedia04,
        alt: "Exploration interaction video 4",
        description: "Lights on / shortcut checkbox interaction",
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
      },
      {
        type: "video",
        src: explorationMedia07,
        alt: "Exploration interaction video 7",
        description: "Reminders written by personas that can sound funny, caring, dramatic, or strict",
      },
      {
        type: "video",
        src: explorationMedia08,
        alt: "Exploration interaction video 8",
        description: "A clearer Mail send flow, extending motion into status and undo in the notch",
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
        description: "Exploring features that are missing from other reference apps",
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
        description: "Lights on",
        aspectRatio: "1142 / 1080",
      },
      {
        type: "video",
        src: explorationMedia17,
        alt: "Exploration interaction video 17",
        description: "Task suggestions based on meeting transcription",
      },
      {
        type: "video",
        src: explorationMedia18,
        alt: "Exploration interaction video 18",
        description: "Interactions / folder view and collection fullscreen",
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
      { src: shotFieldCarHorses, width: 2200, height: 1459, alt: "Silver car and horses in a grassy field" },
      { src: shotBlueCarSheep, width: 2200, height: 1459, alt: "Blue car framing sheep in the distance" },
      { src: shotSailboatDeck, width: 2200, height: 1459, alt: "Sailboat deck with a blue sail cover" },
      { src: shotVintageCar, width: 2200, height: 1459, alt: "Vintage car parked in a shaded residential street" },
    ].map((image, index, images) => ({
      ...image,
      description:
        index === 0 || index === images.length - 1
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

const pageLoop = [
  { id: "explorations", label: "Explorations", thumbnail: nextPageExplorations },
  { id: "fuse-wallet", label: "Fuse Wallet", thumbnail: nextPageFuse },
  { id: "iceland", label: "Photography", thumbnail: nextPagePhotography },
];
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

function InteractiveLabel({ children, className = "" }) {
  return (
    <span className={`interactive-label ${className}`.trim()}>
      <span>{children}</span>
      <span className="interactive-label-gradient" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

function NavItem({ item, selectedId, onSelect }) {
  if (item.status === "Soon") {
    return (
      <div className="nav-item nav-item--disabled">
        <span>{item.label}</span>
        <span className="nav-status">{item.status}</span>
      </div>
    );
  }

  return (
    <button
      className="nav-item"
      data-selected={item.id === selectedId}
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
          Currently Design Lead at{" "}
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

function NextPageLink({ currentId, onSelect }) {
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

    if (!button || !contentPane || !nextPage) {
      return undefined;
    }

    const mobileQuery = window.matchMedia("(max-width: 960px)");
    let committed = false;
    let commitScheduled = false;

    arrivalLockedRef.current = true;

    function getScrollElement() {
      return mobileQuery.matches ? document.scrollingElement : contentPane;
    }

    function isAtBottom() {
      const scrollElement = getScrollElement();

      if (!scrollElement) {
        return false;
      }

      return scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight <= 2;
    }

    function setProgress(nextProgress) {
      const clampedProgress = Math.min(1, Math.max(0, nextProgress));
      progressRef.current = clampedProgress;
      window.cancelAnimationFrame(visualFrameRef.current);
      visualFrameRef.current = window.requestAnimationFrame(() => {
        const pullTransform =
          clampedProgress > 0
            ? `translate3d(0, ${-8 * clampedProgress}px, 0) scale(${1 + 0.02 * clampedProgress})`
            : "";

        button.dataset.hinting = "false";
        button.dataset.pulling = clampedProgress > 0 ? "true" : "false";
        button.style.setProperty("--next-page-progress", String(clampedProgress));
        button.style.transform = pullTransform;
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
      hintTimerRef.current = window.setTimeout(() => {
        button.dataset.hinting = "false";
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
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * 16;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * window.innerHeight;
      }

      return event.deltaY;
    }

    function handleWheel(event) {
      if (committed) {
        return;
      }

      const delta = normalizeWheelDelta(event);
      const atBottom = isAtBottom();

      if (delta > 0 && atBottom) {
        event.preventDefault();

        if (arrivalLockedRef.current) {
          showFirstScrollHint();
          scheduleStopRelease();
          return;
        }

        clearResetTimer();
        const wheelStep = Math.min(delta, NEXT_PAGE_MAX_WHEEL_STEP);
        const nextProgress = setProgress(
          progressRef.current + wheelStep / NEXT_PAGE_WHEEL_THRESHOLD,
        );

        if (nextProgress >= 1) {
          commitNavigation();
        } else {
          resetProgress(NEXT_PAGE_RESET_DELAY);
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
    }

    function handleScroll() {
      if (isAtBottom()) {
        scheduleStopRelease();

        if (mobileQuery.matches) {
          showFirstScrollHint();
        }
      } else {
        window.clearTimeout(stopTimerRef.current);
        arrivalLockedRef.current = true;
        hintShownRef.current = false;
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

      if (committed || !mobileQuery.matches || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const startedAtBottom = isAtBottom();

      touchIdRef.current = touch.identifier;
      clearResetTimer();
      touchStartRef.current = touch.clientY;
      touchStartXRef.current = touch.clientX;
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

      const pullDistance = touchStartRef.current - touch.clientY;
      const horizontalDistance = Math.abs(touchStartXRef.current - touch.clientX);

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

    const wheelTarget = mobileQuery.matches ? window : contentPane;
    const scrollTarget = mobileQuery.matches ? window : contentPane;
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
    };
  }, [nextPage, onSelect]);

  if (currentIndex === -1 || !nextPage) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      className="next-page-link"
      type="button"
      onClick={() => onSelect(nextPage.id)}
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
  const selectedContent = content[selectedId] ?? content.iceland;
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [activeVideoElement, setActiveVideoElement] = useState(null);
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
  const paneClassName =
    transitionPhase === "idle" ? "content-pane" : `content-pane content-pane--${transitionPhase}`;

  useEffect(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(cleanupTimerRef.current);
    window.clearTimeout(mediaSwapTimerRef.current);
    window.clearTimeout(sourceRevealTimerRef.current);
    setActiveMediaIndex(null);
    setActiveVideoElement(null);
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

    function handleResize() {
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
    ? [
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
      ? Math.max(window.innerHeight - (reserveCaption ? 96 : 48), 1)
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
    setActiveVideoElement(null);
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
    const sourceVideo = sourceElement.querySelector("video");
    const targetRect = getCenteredRect(sourceRect, hasMediaCaption(index));

    if (sourceVideo) {
      sourceElement.style.height = `${sourceRect.height}px`;
    }

    setActiveVideoElement(sourceVideo);
    setMediaStartTime(sourceVideo ? sourceVideo.currentTime : 0);
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
      sharedElement: activeVideoElement,
      startTime: currentVideo ? currentVideo.currentTime : mediaStartTime,
    });
    setHiddenMediaIndexes((indexes) => Array.from(new Set([...indexes, activeMediaIndex, nextIndex])));
    setIsViewerOpen(true);

    if (sourceElement) {
      const sourceRect = getSourceRect(sourceElement);
      const targetRect = getCenteredRect(sourceRect, hasMediaCaption(nextIndex));
      const sourceVideo = sourceElement.querySelector("video");

      if (sourceVideo) {
        sourceElement.style.height = `${sourceRect.height}px`;
      }

      setViewerRect(targetRect);
      setViewerTransform(getTransformBetweenRects(currentRect ?? sourceRect, targetRect));
      setIsViewerSettled(false);
      settleViewer();
      setActiveVideoElement(sourceVideo);
      setMediaStartTime(sourceVideo ? sourceVideo.currentTime : 0);
    } else {
      setActiveVideoElement(null);
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
      aria-label="Selected content"
      ref={paneRef}
    >
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
                <img className="detail-image" src={image.src} alt={image.alt} key={image.alt} />
              ))
            )}
            <NextPageLink currentId={selectedId} onSelect={onSelect} />
          </section>
        </div>
      </div>
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
          sharedElement={activeVideoElement}
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

    function handleResize() {
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
      ? Math.max(window.innerHeight - 144, 1)
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
                src={image.src}
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

function MediaCard({ isHidden, item, onClick, priority, refCallback }) {
  return (
    <button
      className="work-media-card"
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
          src={item.src}
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
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "360px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isNearViewport) {
      setShouldLoad(true);
      video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [isNearViewport, shouldLoad]);

  return (
    <video
      ref={videoRef}
      aria-label={item.alt}
      className="work-video"
      loop
      muted
      playsInline
      preload={shouldLoad ? "metadata" : "none"}
      src={shouldLoad ? item.src : undefined}
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
      sharedElement.play().catch(() => {});
    }

    return () => {
      sharedElement.className = originalClassName;

      if (originalParent?.isConnected) {
        const nextSibling =
          originalNextSibling?.parentNode === originalParent ? originalNextSibling : null;

        originalParent.insertBefore(sharedElement, nextSibling);

        if (originalParent instanceof HTMLElement) {
          window.requestAnimationFrame(() => {
            if (originalParent.isConnected && sharedElement.parentNode === originalParent) {
              originalParent.style.height = "";
            }
          });
        }

        if (sharedElement instanceof HTMLVideoElement) {
          sharedElement.play().catch(() => {});
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
        <img className="media-viewer-media" src={item.src} alt={item.alt} />
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
          src={item.src}
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

  useEffect(() => {
    function handleKeyDown(event) {
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
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
        aria-label={item.alt}
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
  const [pageTransitionPhase, setPageTransitionPhase] = useState("idle");
  const [pageTransitionKey, setPageTransitionKey] = useState(0);
  const pageTransitionTimerRef = useRef(null);
  const pageTransitionSettleTimerRef = useRef(null);
  const selectedIdRef = useRef(selectedId);
  const displayedIdRef = useRef(displayedId);

  useLayoutEffect(() => {
    document.title = sectionTitles[selectedId] ?? sectionTitles[DEFAULT_SECTION_ID];
  }, [selectedId]);

  useEffect(() => {
    function handlePopState() {
      const nextId = getRouteSectionId();
      pushRouteSectionId(nextId, true);
      transitionTo(nextId);
    }

    pushRouteSectionId(getRouteSectionId(), true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    return () => {
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

  function transitionTo(nextId) {
    if (nextId === selectedIdRef.current) {
      return;
    }

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

    setPageTransitionPhase("leaving");
    pageTransitionTimerRef.current = window.setTimeout(() => {
      setDisplayedContent(nextId);
      setPageTransitionKey((key) => key + 1);
      setPageTransitionPhase("entering");

      pageTransitionSettleTimerRef.current = window.setTimeout(() => {
        setPageTransitionPhase("idle");
      }, PAGE_ENTER_MS);
    }, PAGE_EXIT_MS);
  }

  function handleSelect(nextId) {
    pushRouteSectionId(nextId);
    transitionTo(nextId);
  }

  return (
    <div className="portfolio-shell">
      <aside className="sidebar">
        <PortfolioHeader selectedId={selectedId} />
        <PortfolioNav selectedId={selectedId} onSelect={handleSelect} />
        <BioBlock />
      </aside>

      <ContentPane
        onSelect={handleSelect}
        selectedId={displayedId}
        transitionKey={pageTransitionKey}
        transitionPhase={pageTransitionPhase}
      />
    </div>
  );
}

export default App;
