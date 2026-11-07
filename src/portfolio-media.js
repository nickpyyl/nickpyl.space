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
      { type: "video", src: fuseMedia08, alt: "Multi-Action Interaction", description: "Multi-Action Interaction" },
      { type: "video", src: fuseMedia09, alt: "Onboarding", description: "Onboarding" },
      { type: "video", src: fuseMedia04, alt: "Home Experience", description: "Home Experience" },
      { type: "video", src: fuseMedia01, alt: "Send with Hide My Wallet", description: "Send with Hide My Wallet" },
      { type: "video", src: fuseMedia05, alt: "Address input field", description: "Address input field", aspectRatio: "2156 / 2160" },
      { type: "video", src: fuseMedia02, alt: "Transaction tracking", description: "Transaction tracking" },
      { type: "video", src: fuseMedia07, alt: "Pending verification", description: "Pending verification" },
      { type: "video", src: fuseMedia06, alt: "Promo cards", description: "Promo cards" },
      { type: "image", src: fusePlusMembership, srcSet: `${fusePlusMembership} 800w, ${fusePlusMembershipLarge} 1200w`, width: 2080, height: 2080, alt: "Fuse Plus membership on an iPhone", description: "Fuse Plus Membership" },
      { type: "image", src: fuseCardsDesign, width: 1600, height: 1246, alt: "Fuse Cards design", description: "Fuse Cards design" },
      { type: "video", src: fuseMedia10, alt: "Coin breakdown", description: "Coin breakdown", aspectRatio: "1082 / 1080" },
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
        description: "lights out",
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
};

const explorationOrder = [explorationMedia02, explorationMedia16, explorationMedia10, explorationMedia04, explorationMedia06, explorationMedia03];

export const portfolioMedia = {
  explorations: [
    ...explorationOrder.map(src => projects.explorations.media.find(item => item.src === src)),
    ...projects.explorations.media.filter(item => !explorationOrder.includes(item.src)),
  ],
  fuse: projects["fuse-wallet"].media,
};
