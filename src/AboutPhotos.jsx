import { useEffect, useState } from "react";
import { aboutPhotoAssets } from "./about-photo-assets.js";
import boat480 from "../assets/about/boat-480.jpg";
import boat800 from "../assets/about/boat-800.jpg";
import boat1200 from "../assets/about/boat-1200.jpg";

const photos = [
  { ...aboutPhotoAssets.shore, alt: "A tidal shoreline with mountains in the distance" },
  { ...aboutPhotoAssets.blueCar, alt: "Green hills seen through the open window of a blue car" },
  { ...aboutPhotoAssets.field, alt: "A silver car parked in a grassy field beneath a cloudy sky" },
  { ...aboutPhotoAssets.cafe, alt: "Sunlight falling across the tables of a café with red and yellow walls" },
  { ...aboutPhotoAssets.landscape, alt: "A path through mossy rocks and grass with mountains beyond" },
];
const mobilePhotos = [...photos, {
  src: boat480, srcSet: `${boat480} 480w, ${boat800} 800w, ${boat1200} 1200w`,
  width: 1200, height: 796, alt: "A blue sail cover marked Charisma beside a moored sailboat",
}];

export default function AboutPhotos({ active, prepared, mobileLayout }) {
  const [visited, setVisited] = useState(active || prepared);
  useEffect(() => { if (active || prepared) setVisited(true); }, [active, prepared]);

  return <section className="portfolio-about" id="gallery-about" role="tabpanel" aria-labelledby="tab-about"
    data-active={active} inert={!active} aria-hidden={!active} tabIndex={active ? 0 : -1}>
    {(active || prepared || visited) && (mobileLayout ? mobilePhotos : photos).map(photo => <img key={photo.src} {...photo}
      sizes="(max-width: 700px) calc((100vw - 48px) / 2), (max-width: 900px) calc((100vw - 72px) / 2), calc((100vw - 96px) / 5)"
      decoding="async" draggable="false" />)}
  </section>;
}
