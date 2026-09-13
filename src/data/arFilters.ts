import mustacheImg from "@/assets/ar/mustache.png";
import sunglassesImg from "@/assets/ar/sunglasses.png";
import capImg from "@/assets/ar/cap.png";
import crownImg from "@/assets/ar/crown.png";
import dogEarsImg from "@/assets/ar/dog-ears.png";
import dogNoseImg from "@/assets/ar/dog-nose.png";
import heartGlassesImg from "@/assets/ar/heart-glasses.png";
import flowerCrownImg from "@/assets/ar/flower-crown.png";
import neonVisorImg from "@/assets/ar/neon-visor.png";
import galaxyHaloImg from "@/assets/ar/galaxy-halo.png";
import butterflyCrownImg from "@/assets/ar/butterfly-crown.png";
import flameCrownImg from "@/assets/ar/flame-crown.png";

/** Where an overlay is anchored on the detected face. */
export type ArAnchor = "eyes" | "forehead" | "above-head" | "nose" | "mouth";

export interface ArOverlay {
  src: string;
  anchor: ArAnchor;
  /** Overlay width as a multiple of the measured eye distance. */
  widthFactor: number;
  /** Vertical offset as a multiple of the eye distance (negative = up). */
  offsetY: number;
}

export interface ArFilter {
  id: string;
  label: string;
  emoji: string;
  overlays: ArOverlay[];
}

/** Original Unique AR filters (no third-party effects are copied). */
export const AR_FILTERS: ArFilter[] = [
  { id: "none", label: "No filter", emoji: "🚫", overlays: [] },
  {
    id: "mustache",
    label: "Mustache",
    emoji: "🥸",
    overlays: [{ src: mustacheImg, anchor: "mouth", widthFactor: 1.1, offsetY: -0.12 }],
  },
  {
    id: "sunglasses",
    label: "Cool shades",
    emoji: "😎",
    overlays: [{ src: sunglassesImg, anchor: "eyes", widthFactor: 2.05, offsetY: 0 }],
  },
  {
    id: "hearts",
    label: "Heart glasses",
    emoji: "😍",
    overlays: [{ src: heartGlassesImg, anchor: "eyes", widthFactor: 2.1, offsetY: 0 }],
  },
  {
    id: "cap",
    label: "Cap",
    emoji: "🧢",
    overlays: [{ src: capImg, anchor: "above-head", widthFactor: 2.6, offsetY: -0.35 }],
  },
  {
    id: "crown",
    label: "Crown",
    emoji: "👑",
    overlays: [{ src: crownImg, anchor: "above-head", widthFactor: 2.3, offsetY: -0.45 }],
  },
  {
    id: "flowers",
    label: "Flower crown",
    emoji: "🌸",
    overlays: [{ src: flowerCrownImg, anchor: "above-head", widthFactor: 2.4, offsetY: -0.3 }],
  },
  {
    id: "puppy",
    label: "Puppy",
    emoji: "🐶",
    overlays: [
      { src: dogEarsImg, anchor: "above-head", widthFactor: 2.6, offsetY: -0.3 },
      { src: dogNoseImg, anchor: "nose", widthFactor: 0.75, offsetY: 0 },
    ],
  },
  {
    id: "party",
    label: "Party look",
    emoji: "🎉",
    overlays: [
      { src: crownImg, anchor: "above-head", widthFactor: 2.2, offsetY: -0.45 },
      { src: heartGlassesImg, anchor: "eyes", widthFactor: 2.1, offsetY: 0 },
    ],
  },
  {
    id: "disguise",
    label: "Disguise",
    emoji: "🕵️",
    overlays: [
      { src: sunglassesImg, anchor: "eyes", widthFactor: 2.05, offsetY: 0 },
      { src: mustacheImg, anchor: "mouth", widthFactor: 1.1, offsetY: -0.12 },
      { src: capImg, anchor: "above-head", widthFactor: 2.6, offsetY: -0.35 },
    ],
  },
];
