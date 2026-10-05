export const DEFAULT_SECTION_ID = "home";

export const sectionTitles = {
  home: "Nick Pyl",
  explorations: "Explorations",
  "fuse-wallet": "Selected work",
  phantom: "phantom",
  spacia: "spacia",
};

export const sectionPaths = {
  home: "/",
  explorations: "/explorations",
  "fuse-wallet": "/selected",
  phantom: "/phantom",
  spacia: "/spacia",
};

export const legacySectionPaths = { "/fuse": "fuse-wallet" };

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
  if (Object.hasOwn(legacySectionPaths, path)) return legacySectionPaths[path];
  return Object.keys(sectionPaths).find((id) => sectionPaths[id] === path) ?? DEFAULT_SECTION_ID;
}
