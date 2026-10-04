import { navigateFromLink } from "./Home.jsx";

export default function WorkIntro({ selectedId, onSelect }) {
  const isFuse = selectedId === "fuse-wallet";
  const title = isFuse ? "Fuse Wallet" : "Design Experiments";

  return (
    <section className="work-intro" aria-labelledby="work-title">
      <header className={`work-heading${isFuse ? "" : " work-heading--explorations"}`}>
        <div className="work-heading-row">
          <div className="work-back-group">
            <a className="work-back" href="/" aria-keyshortcuts={`${isFuse ? "S" : "E"} Escape`} onClick={event => navigateFromLink(event, "home", onSelect)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6.5 3-4 4 4 4M3 7h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </a>
            <span className="work-back-section">{isFuse ? "SELECTED WORK" : "EXPLORATIONS"}</span>
            <svg className="work-back-shortcut" width="18" height="16" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false">
              <path d="M4.5 2.5h-3v15h3M17.5 2.5h3v15h-3" />
              <path d={isFuse
                ? "M14.5 6.5C14.5 5.25 13 4.5 11 4.5S7.5 5.4 7.5 7s1.25 2.25 3.5 3 3.5 1.4 3.5 3-1.5 2.5-3.5 2.5-3.5-.75-3.5-2"
                : "M14.5 4.5h-7v11h7M7.5 10h6"} />
            </svg>
          </div>
          <h1 id="work-title">
            <a href={isFuse ? "https://apps.apple.com/app/id6470302252" : "https://x.com/nickpylll"} target="_blank" rel="noreferrer">
              {title}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 12 8-8M4 4h8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </h1>
          <span className="work-years">{isFuse ? "24 - 26" : "18 - Now"}</span>
        </div>
      </header>
      <p className="work-summary">{isFuse
        ? "Fuse was evolving from a crypto wallet into a broader finance app. I redesigned the experience to bring saving, earning, spending, and bank transfers together in one clear, cohesive product."
        : "I like experimenting with interactions and product concepts, trying out ideas and seeing where they go. It’s a space to play with the details that make digital products easier and more enjoyable to use."}</p>
    </section>
  );
}
