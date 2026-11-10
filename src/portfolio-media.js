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
import fusePlusMembership from "../assets/fuse-media/fuse-plus-membership-800.jpg";
import fusePlusMembershipLarge from "../assets/fuse-media/fuse-plus-membership-1200.jpg";
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

const projects = {
  "fuse-wallet": {
    type: "work",
    eyebrow: "Work",
    title: "Fuse Wallet",
    description: "",
    media: [
      { type: "video", src: fuseMedia08, poster: "/gallery-posters/fuse-08.webp", alt: "Multi-Action Interaction", description: "Multi-Action Interaction" },
      { type: "video", src: fuseMedia09, poster: "/gallery-posters/fuse-09.webp", alt: "Onboarding", description: "Onboarding" },
      { type: "video", src: fuseMedia04, poster: "/gallery-posters/fuse-04.webp", alt: "Home Experience", description: "Home Experience" },
      { type: "video", src: fuseMedia01, poster: "/gallery-posters/fuse-01.webp", alt: "Send with Hide My Wallet", description: "Send with Hide My Wallet" },
      { type: "video", src: fuseMedia05, poster: "/gallery-posters/fuse-05.webp", alt: "Address input field", description: "Address input field", aspectRatio: "2156 / 2160" },
      { type: "video", src: fuseMedia02, poster: "/gallery-posters/fuse-02.webp", alt: "Transaction tracking", description: "Transaction tracking" },
      { type: "video", src: fuseMedia07, poster: "/gallery-posters/fuse-07.webp", alt: "Pending verification", description: "Pending verification" },
      { type: "video", src: fuseMedia06, poster: "/gallery-posters/fuse-06.webp", alt: "Promo cards", description: "Promo cards" },
      { type: "image", src: fusePlusMembership, srcSet: `${fusePlusMembership} 800w, ${fusePlusMembershipLarge} 1200w`, width: 2080, height: 2080, alt: "Fuse Plus membership on an iPhone", description: "Fuse Plus Membership" },
      { type: "image", src: fuseCardsDesign, width: 1600, height: 1246, alt: "Fuse Cards design", description: "Fuse Cards design" },
      { type: "video", src: fuseMedia10, poster: "/gallery-posters/fuse-10.webp", alt: "Coin breakdown", description: "Coin breakdown", aspectRatio: "1082 / 1080" },
    ],
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
        poster: "/gallery-posters/exploration-01.webp",
        alt: "Exploration interaction video 1",
        description: "Interaction with my shots from Copenhagen",
      },
      {
        type: "video",
        src: explorationMedia02,
        poster: "/gallery-posters/exploration-02.webp",
        alt: "Exploration interaction video 2",
        description: "Document signature / mobile version",
      },
      {
        type: "video",
        src: explorationMedia03,
        poster: "/gallery-posters/exploration-03.webp",
        alt: "Exploration interaction video 3",
        description: "SD cards with film simulation",
        aspectRatio: "1088 / 1080",
      },
      {
        type: "video",
        src: explorationMedia04,
        poster: "/gallery-posters/exploration-04.webp",
        alt: "Exploration interaction video 4",
        description: "Shortcut checkbox interaction",
        aspectRatio: "1218 / 720",
      },
      {
        type: "video",
        src: explorationMedia05,
        poster: "/gallery-posters/exploration-05.webp",
        alt: "Exploration interaction video 5",
        description: "Lights out",
      },
      {
        type: "video",
        src: explorationMedia06,
        poster: "/gallery-posters/exploration-06.webp",
        alt: "Exploration interaction video 6",
        description: "Reply to a movie review",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia08,
        poster: "/gallery-posters/exploration-08.webp",
        alt: "Exploration interaction video 8",
        description: "Mail send flow",
      },
      {
        type: "video",
        src: explorationMedia09,
        poster: "/gallery-posters/exploration-09.webp",
        alt: "Exploration interaction video 9",
        description: "Movie review appearance interaction",
      },
      {
        type: "video",
        src: explorationMedia10,
        poster: "/gallery-posters/exploration-10.webp",
        alt: "Exploration interaction video 10",
        description: "Photos interaction / expand and preview",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia11,
        poster: "/gallery-posters/exploration-11.webp",
        alt: "Exploration interaction video 11",
        description: "Elements / Mail app light theme",
        aspectRatio: "1262 / 1080",
      },
      {
        type: "video",
        src: explorationMedia12,
        poster: "/gallery-posters/exploration-12.webp",
        alt: "Exploration interaction video 12",
        description: "Archive selected interaction",
      },
      {
        type: "video",
        src: explorationMedia13,
        poster: "/gallery-posters/exploration-13.webp",
        alt: "Exploration interaction video 13",
        description: "Highlighting a favourite movie moment",
        aspectRatio: "1370 / 1080",
      },
      {
        type: "video",
        src: explorationMedia14,
        poster: "/gallery-posters/exploration-14.webp",
        alt: "Exploration interaction video 14",
        description: "Board customisation",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia15,
        poster: "/gallery-posters/exploration-15.webp",
        alt: "Exploration interaction video 15",
        description: "Rate and review films",
      },
      {
        type: "video",
        src: explorationMedia16,
        poster: "/gallery-posters/exploration-16.webp",
        alt: "Exploration interaction video 16",
        description: "Signature interaction",
        aspectRatio: "1142 / 1080",
      },
      {
        type: "video",
        src: explorationMedia17,
        poster: "/gallery-posters/exploration-17.webp",
        alt: "Exploration interaction video 17",
        description: "Task suggestions based on meeting transcription",
        aspectRatio: "1082 / 1080",
      },
      {
        type: "video",
        src: explorationMedia18,
        poster: "/gallery-posters/exploration-18.webp",
        alt: "Exploration interaction video 18",
        description: "Folder view and collection fullscreen",
      },
    ],
    images: [],
  },
};

const explorationOrder = [explorationMedia02, explorationMedia16, explorationMedia10, explorationMedia04, explorationMedia06, explorationMedia03];

export const portfolioMedia = {
  explorations: [
    ...explorationOrder.map(src => projects.explorations.media.find(item => item.src === src)),
    ...projects.explorations.media.filter(item => !explorationOrder.includes(item.src)),
  ],
  fuse: projects["fuse-wallet"].media,
};
