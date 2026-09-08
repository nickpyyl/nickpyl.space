export const DEFAULT_SECTION_ID = "explorations";

export const sectionPaths = {
  explorations: "/explorations",
  "fuse-wallet": "/fuse",
  iceland: "/selected",
  phantom: "/phantom",
  spacia: "/spacia",
  nice: "/nice",
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
