import { useEffect, useState } from "react";
import { aboutPhotoAssets } from "./about-photo-assets.js";

const photos = [
  { id: "shore", alt: "A tidal shoreline with mountains in the distance" },
  { id: "blueCar", alt: "Green hills seen through the open window of a blue car" },
  { id: "field", alt: "A silver car parked in a grassy field beneath a cloudy sky" },
  { id: "cafe", alt: "Sunlight falling across the tables of a café with red and yellow walls" },
  { id: "landscape", alt: "A path through mossy rocks and grass with mountains beyond" },
];

export default function AboutPhotos({ active, prepared }) {
  const [visited, setVisited] = useState(active || prepared);
  useEffect(() => { if (active || prepared) setVisited(true); }, [active, prepared]);

  return <section className="portfolio-about" id="gallery-about" role="tabpanel" aria-labelledby="tab-about"
    data-active={active} inert={!active} aria-hidden={!active} tabIndex={active ? 0 : -1}>
    {(active || prepared || visited) && photos.map(photo => <img key={photo.id} {...aboutPhotoAssets[photo.id]} alt={photo.alt}
      sizes="(max-width: 700px) calc((100vw - 48px) / 2), (max-width: 900px) calc((100vw - 72px) / 2), calc((100vw - 96px) / 5)"
      decoding="async" draggable="false" />)}
  </section>;
}
