import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import avatarNick from "../assets/avatar-nick.png";
import signatureNew from "../assets/signature-new.png";
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
const PAGE_EXIT_MS = 160;
const PAGE_ENTER_MS = 280;
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
      { type: "image", src: fuseStill03, alt: "Fuse app icon on iPhone home screen" },
      { type: "video", src: fuseMedia01, alt: "Fuse Wallet interaction video 1" },
      { type: "video", src: fuseMedia02, alt: "Fuse Wallet interaction video 2" },
      { type: "image", src: fuseStill02, alt: "Fuse Plus phone render" },
      { type: "video", src: fuseMedia03, alt: "Fuse Wallet interaction video 3" },
      { type: "video", src: fuseMedia04, alt: "Fuse Wallet interaction video 4" },
      { type: "video", src: fuseMedia05, alt: "Fuse Wallet interaction video 5" },
      { type: "video", src: fuseMedia06, alt: "Fuse Wallet interaction video 6" },
      { type: "image", src: fuseStill04, alt: "Fuse card render" },
      { type: "video", src: fuseMedia07, alt: "Fuse Wallet interaction video 7" },
      { type: "video", src: fuseMedia08, alt: "Fuse Wallet interaction video 8" },
      { type: "video", src: fuseMedia09, alt: "Fuse Wallet interaction video 9" },
      { type: "video", src: fuseMedia10, alt: "Fuse Wallet interaction video 10" },
      {
        type: "image",
        src: fuseStill05,
        alt: "Fuse Wallet receive flow and virtual bank account screens",
      },
      {
        type: "image",
        src: fuseStill06,
        alt: "Fuse Wallet card, cash, investments, and earn screens",
      },
      { type: "image", src: fuseStill07, alt: "Fuse Wallet Device Key security screen" },
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
      { type: "video", src: explorationMedia02, alt: "Exploration interaction video 2" },
      { type: "video", src: explorationMedia01, alt: "Exploration interaction video 1" },
      { type: "video", src: explorationMedia03, alt: "Exploration interaction video 3" },
      { type: "video", src: explorationMedia04, alt: "Exploration interaction video 4" },
      { type: "video", src: explorationMedia05, alt: "Exploration interaction video 5" },
      { type: "video", src: explorationMedia06, alt: "Exploration interaction video 6" },
      { type: "video", src: explorationMedia07, alt: "Exploration interaction video 7" },
      { type: "video", src: explorationMedia08, alt: "Exploration interaction video 8" },
      { type: "video", src: explorationMedia09, alt: "Exploration interaction video 9" },
      { type: "video", src: explorationMedia10, alt: "Exploration interaction video 10" },
      { type: "video", src: explorationMedia11, alt: "Exploration interaction video 11" },
      { type: "video", src: explorationMedia12, alt: "Exploration interaction video 12" },
      { type: "video", src: explorationMedia13, alt: "Exploration interaction video 13" },
      { type: "video", src: explorationMedia14, alt: "Exploration interaction video 14" },
      { type: "video", src: explorationMedia15, alt: "Exploration interaction video 15" },
      { type: "video", src: explorationMedia16, alt: "Exploration interaction video 16" },
      { type: "video", src: explorationMedia17, alt: "Exploration interaction video 17" },
      { type: "video", src: explorationMedia18, alt: "Exploration interaction video 18" },
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
      { src: selectedAmsterdamHouses, alt: "Amsterdam canal houses with red doors and bicycles" },
      { src: shotWhiteFenceLandscape, alt: "White fence in front of a rocky green landscape" },
      { src: shotTidalFlats, alt: "Tidal flats with mountains in the distance" },
      { src: selectedIcelandHouse, alt: "Light-colored Icelandic house beneath a blue sky" },
      { src: shotRockyHills, alt: "Rocky green hills under cloudy sky" },
      { src: shotFenceBlueSky, alt: "White fence below a wide blue sky" },
      { src: selectedIcelandStairs, alt: "Stairs and railings outside a corrugated Icelandic house" },
      { src: shotWildflowerHillside, alt: "Grassy hillside with wildflowers" },
      { src: shotHallwayWindow, alt: "Dim hallway with a bright window at the end" },
      { src: selectedIcelandWindow, alt: "Cloud-covered Icelandic landscape seen through a car window" },
      { src: shotWhiteVehicle, alt: "White vehicle parked beside a greenhouse" },
      { src: shotFieldCarHorses, alt: "Silver car and horses in a grassy field" },
      { src: shotBlueCarSheep, alt: "Blue car framing sheep in the distance" },
      { src: shotSailboatDeck, alt: "Sailboat deck with a blue sail cover" },
      { src: shotVintageCar, alt: "Vintage car parked in a shaded residential street" },
    ],
  },
  nice: {
    type: "note",
    eyebrow: "Photography",
    title: "Nice",
    description: "Coming soon.",
    images: [],
  },
};

const DEFAULT_SECTION_ID = "explorations";

function getRouteSectionId() {
  if (typeof window === "undefined") {
    return DEFAULT_SECTION_ID;
  }

  const sectionId = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  return content[sectionId] ? sectionId : DEFAULT_SECTION_ID;
}

function pushRouteSectionId(sectionId) {
  if (typeof window === "undefined") {
    return;
  }

  const nextHash = `#${encodeURIComponent(sectionId)}`;

  if (window.location.hash !== nextHash) {
    window.history.pushState({ sectionId }, "", nextHash);
  }
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
      <span className={item.mobileLabel ? "nav-label nav-label--desktop" : "nav-label"}>
        {item.label}
      </span>
      {item.mobileLabel ? (
        <span className="nav-label nav-label--mobile">{item.mobileLabel}</span>
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
            Phantom
          </a>
          , previously at{" "}
          <a href="https://x.com/fusewallet" target="_blank" rel="noreferrer">
            Fuse
          </a>{" "}
          /{" "}
          <a href="https://x.com/squadslabs" target="_blank" rel="noreferrer">
            Squads Labs
          </a>
          .
        </p>
        <p>
          I design digital products and spend probably too much time thinking about how they move, respond, and feel.
        </p>
        <p className="contact-line">
          <a href="mailto:hello@nickpyl.space">Email me</a>
          <span> or find me on</span>{" "}
          <a href="https://x.com/nickpylll" target="_blank" rel="noreferrer">
            X
          </a>
          <span>.</span>
        </p>
      </div>
    </section>
  );
}

function ContentPane({ selectedId, transitionKey = 0, transitionPhase = "idle" }) {
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

      const targetRect = getCenteredRect(currentRect);
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

  function getCenteredRect(sourceRect) {
    const aspectRatio = sourceRect.width / sourceRect.height;
    const isCompactViewport = window.innerWidth <= 960;
    const maxWidth = isCompactViewport
      ? Math.max(window.innerWidth - 48, 1)
      : Math.min(window.innerWidth * 0.76, 820);
    const maxHeight = isCompactViewport
      ? Math.max(window.innerHeight - 48, 1)
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
    const targetRect = getCenteredRect(sourceRect);

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
      const targetRect = getCenteredRect(sourceRect);
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

function PhotographyPane({ selectedContent, selectedId, transitionKey, transitionPhase }) {
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
      ? Math.max(window.innerHeight - 40, 1)
      : Math.min(window.innerHeight * 0.84, 980);
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
                alt={image.alt}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}
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

function MediaCard({ isHidden, item, onClick, refCallback }) {
  return (
    <button
      className="work-media-card"
      data-hidden={isHidden ? "true" : "false"}
      type="button"
      onClick={onClick}
      ref={refCallback}
      aria-label={item.alt}
    >
      {item.type === "image" ? (
        <img className="work-image" src={item.src} alt={item.alt} loading="lazy" />
      ) : (
        <WorkVideo item={item} />
      )}
    </button>
  );
}

function WorkVideo({ item }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      video.play().catch(() => {});
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          return;
        }

        video.pause();
      },
      {
        root: null,
        rootMargin: "160px 0px",
        threshold: 0.08,
      },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [item.src]);

  return (
    <video
      ref={videoRef}
      aria-label={item.alt}
      className="work-video"
      loop
      muted
      playsInline
      preload="metadata"
      src={item.src}
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
      <button
        className="media-viewer-stage"
        data-open={isOpen ? "true" : "false"}
        data-settled={isSettled ? "true" : "false"}
        type="button"
        ref={stageRef}
        style={stageStyle}
        onClick={(event) => {
          event.stopPropagation();
          onNext();
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

  useEffect(() => {
    function handlePopState() {
      transitionTo(getRouteSectionId());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.clearTimeout(pageTransitionTimerRef.current);
      window.clearTimeout(pageTransitionSettleTimerRef.current);
    };
  }, []);

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
        <img className="portrait" src={avatarNick} alt="Nick Pyl" />
        <PortfolioNav selectedId={selectedId} onSelect={handleSelect} />
        <BioBlock />
      </aside>

      <ContentPane
        selectedId={displayedId}
        transitionKey={pageTransitionKey}
        transitionPhase={pageTransitionPhase}
      />
    </div>
  );
}

export default App;
