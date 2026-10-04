export const DEFAULT_SECTION_ID = "home";

export const sectionTitles = {
  home: "Nick Pyl",
  explorations: "Design Experiments",
  "fuse-wallet": "fusewallet",
  phantom: "phantom",
  spacia: "spacia",
};

export const sectionPaths = {
  home: "/",
  explorations: "/explorations",
  "fuse-wallet": "/fuse",
  phantom: "/phantom",
  spacia: "/spacia",
};

export function resolveSectionId({ pathname, hash }) {
  let legacyId;

  try {
    legacyId = decodeURIComponent(hash.replace(/^#\/?/, ""));
  } catch {
    legacyId = "";
  }

  if (Object.hasOwn(sectionPaths, legacyId)) {
    return legacyId;
  }

  const path = pathname.replace(/\/+$/, "") || "/";
  return Object.keys(sectionPaths).find((id) => sectionPaths[id] === path) ?? DEFAULT_SECTION_ID;
}
