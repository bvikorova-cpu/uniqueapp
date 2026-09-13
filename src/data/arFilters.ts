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
import masqueradeMaskImg from "@/assets/ar/masquerade-mask.png";
import devilHornsImg from "@/assets/ar/devil-horns.png";
import angelHaloImg from "@/assets/ar/angel-halo.png";
import piratePatchImg from "@/assets/ar/pirate-patch.png";
import catKitImg from "@/assets/ar/cat-kit.png";
import robotVisorImg from "@/assets/ar/robot-visor.png";
import unicornKitImg from "@/assets/ar/unicorn-kit.png";
import clownKitImg from "@/assets/ar/clown-kit.png";
import ninjaMaskImg from "@/assets/ar/ninja-mask.png";
import wizardKitImg from "@/assets/ar/wizard-kit.png";
import alienKitImg from "@/assets/ar/alien-kit.png";
import glasses3dImg from "@/assets/ar/3d-glasses.png";
import snowmanKitImg from "@/assets/ar/snowman-kit.png";
import laceMaskImg from "@/assets/ar/lace-mask.png";
import redLipsImg from "@/assets/ar/red-lips.png";
import diamondEarringsImg from "@/assets/ar/diamond-earrings.png";
import champagneImg from "@/assets/ar/champagne.png";
import luxuryShadesImg from "@/assets/ar/luxury-shades.png";
import bowTieImg from "@/assets/ar/bow-tie.png";
import redRoseImg from "@/assets/ar/red-rose.png";
import martiniImg from "@/assets/ar/martini.png";
import pearlsImg from "@/assets/ar/pearls.png";
import goldChainImg from "@/assets/ar/gold-chain.png";
import fedoraImg from "@/assets/ar/fedora.png";
import monocleImg from "@/assets/ar/monocle.png";
import eyelashesImg from "@/assets/ar/eyelashes.png";
import blushImg from "@/assets/ar/blush.png";

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
  // ---- Exclusive Unique effects (original designs, not found on other platforms) ----
  {
    id: "cybervisor",
    label: "Cyber visor",
    emoji: "🕶️",
    overlays: [{ src: neonVisorImg, anchor: "eyes", widthFactor: 2.4, offsetY: 0 }],
  },
  {
    id: "galaxyhalo",
    label: "Galaxy halo",
    emoji: "🌌",
    overlays: [{ src: galaxyHaloImg, anchor: "above-head", widthFactor: 3.4, offsetY: -0.55 }],
  },
  {
    id: "butterflies",
    label: "Butterfly crown",
    emoji: "🦋",
    overlays: [{ src: butterflyCrownImg, anchor: "above-head", widthFactor: 3.1, offsetY: -0.2 }],
  },
  {
    id: "flamecrown",
    label: "Flame crown",
    emoji: "🔥",
    overlays: [{ src: flameCrownImg, anchor: "above-head", widthFactor: 2.5, offsetY: -0.35 }],
  },
  {
    id: "cyberqueen",
    label: "Cyber queen",
    emoji: "👑",
    overlays: [
      { src: galaxyHaloImg, anchor: "above-head", widthFactor: 3.4, offsetY: -0.55 },
      { src: neonVisorImg, anchor: "eyes", widthFactor: 2.4, offsetY: 0 },
    ],
  },
  {
    id: "firelegend",
    label: "Fire legend",
    emoji: "🌋",
    overlays: [
      { src: flameCrownImg, anchor: "above-head", widthFactor: 2.5, offsetY: -0.35 },
      { src: sunglassesImg, anchor: "eyes", widthFactor: 2.05, offsetY: 0 },
    ],
  },
  {
    id: "butterflylove",
    label: "Butterfly love",
    emoji: "💞",
    overlays: [
      { src: butterflyCrownImg, anchor: "above-head", widthFactor: 3.1, offsetY: -0.2 },
      { src: heartGlassesImg, anchor: "eyes", widthFactor: 2.1, offsetY: 0 },
    ],
  },
  {
    id: "masquerade",
    label: "Midnight mask",
    emoji: "🎭",
    overlays: [{ src: masqueradeMaskImg, anchor: "eyes", widthFactor: 2.25, offsetY: 0 }],
  },
  {
    id: "devil",
    label: "Little devil",
    emoji: "😈",
    overlays: [{ src: devilHornsImg, anchor: "above-head", widthFactor: 2.2, offsetY: -0.35 }],
  },
  {
    id: "angel",
    label: "Pure angel",
    emoji: "😇",
    overlays: [{ src: angelHaloImg, anchor: "above-head", widthFactor: 2.0, offsetY: -0.55 }],
  },
  {
    id: "pirate",
    label: "Pirate",
    emoji: "🏴‍☠️",
    overlays: [{ src: piratePatchImg, anchor: "eyes", widthFactor: 1.6, offsetY: 0 }],
  },
  {
    id: "cat",
    label: "Cute cat",
    emoji: "🐱",
    overlays: [{ src: catKitImg, anchor: "above-head", widthFactor: 2.5, offsetY: -0.25 }],
  },
  {
    id: "robot",
    label: "Cyborg",
    emoji: "🤖",
    overlays: [{ src: robotVisorImg, anchor: "eyes", widthFactor: 2.0, offsetY: 0 }],
  },
  {
    id: "unicorn",
    label: "Unicorn",
    emoji: "🦄",
    overlays: [{ src: unicornKitImg, anchor: "above-head", widthFactor: 2.5, offsetY: -0.3 }],
  },
  {
    id: "clown",
    label: "Rainbow clown",
    emoji: "🤡",
    overlays: [{ src: clownKitImg, anchor: "above-head", widthFactor: 2.8, offsetY: -0.2 }],
  },
  {
    id: "ninja",
    label: "Ninja",
    emoji: "🥷",
    overlays: [{ src: ninjaMaskImg, anchor: "eyes", widthFactor: 2.1, offsetY: 0 }],
  },
  {
    id: "wizard",
    label: "Wizard",
    emoji: "🧙",
    overlays: [{ src: wizardKitImg, anchor: "above-head", widthFactor: 2.7, offsetY: -0.4 }],
  },
  {
    id: "alien",
    label: "Alien",
    emoji: "👽",
    overlays: [{ src: alienKitImg, anchor: "above-head", widthFactor: 2.4, offsetY: -0.35 }],
  },
  {
    id: "retro3d",
    label: "Retro 3D",
    emoji: "🕶️",
    overlays: [{ src: glasses3dImg, anchor: "eyes", widthFactor: 2.2, offsetY: 0 }],
  },
  {
    id: "snowman",
    label: "Snowman",
    emoji: "⛄",
    overlays: [{ src: snowmanKitImg, anchor: "nose", widthFactor: 1.1, offsetY: 0 }],
  },
  {
    id: "lace",
    label: "Lace mask",
    emoji: "🖤",
    overlays: [{ src: laceMaskImg, anchor: "eyes", widthFactor: 2.3, offsetY: 0 }],
  },
  {
    id: "redlips",
    label: "Red lips",
    emoji: "💋",
    overlays: [{ src: redLipsImg, anchor: "mouth", widthFactor: 1.3, offsetY: -0.05 }],
  },
  {
    id: "diamonds",
    label: "Diamonds",
    emoji: "💎",
    overlays: [{ src: diamondEarringsImg, anchor: "eyes", widthFactor: 2.6, offsetY: 0.15 }],
  },
  {
    id: "champagne",
    label: "Champagne",
    emoji: "🥂",
    overlays: [{ src: champagneImg, anchor: "above-head", widthFactor: 2.6, offsetY: -0.25 }],
  },
  {
    id: "luxury",
    label: "Luxury shades",
    emoji: "🕶️",
    overlays: [{ src: luxuryShadesImg, anchor: "eyes", widthFactor: 2.15, offsetY: 0 }],
  },
  {
    id: "gentleman",
    label: "Gentleman",
    emoji: "🎩",
    overlays: [{ src: bowTieImg, anchor: "mouth", widthFactor: 1.6, offsetY: -0.55 }],
  },
  {
    id: "romantic",
    label: "Romantic",
    emoji: "🌹",
    overlays: [
      { src: redRoseImg, anchor: "above-head", widthFactor: 1.8, offsetY: -0.2 },
      { src: redLipsImg, anchor: "mouth", widthFactor: 1.1, offsetY: -0.05 },
    ],
  },
  {
    id: "martini",
    label: "Cocktail night",
    emoji: "🍸",
    overlays: [{ src: martiniImg, anchor: "above-head", widthFactor: 2.2, offsetY: -0.2 }],
  },
  {
    id: "pearls",
    label: "Pearls",
    emoji: "🤍",
    overlays: [{ src: pearlsImg, anchor: "mouth", widthFactor: 2.4, offsetY: 0.35 }],
  },
  {
    id: "goldchain",
    label: "Gold chain",
    emoji: "⛓️",
    overlays: [{ src: goldChainImg, anchor: "mouth", widthFactor: 2.5, offsetY: 0.4 }],
  },
  {
    id: "fedora",
    label: "Mystery",
    emoji: "🕵️",
    overlays: [{ src: fedoraImg, anchor: "above-head", widthFactor: 3.0, offsetY: -0.45 }],
  },
  {
    id: "monocle",
    label: "Monocle",
    emoji: "🧐",
    overlays: [{ src: monocleImg, anchor: "eyes", widthFactor: 2.0, offsetY: 0 }],
  },
  {
    id: "glam",
    label: "Glam lashes",
    emoji: "✨",
    overlays: [
      { src: eyelashesImg, anchor: "eyes", widthFactor: 2.3, offsetY: -0.1 },
      { src: blushImg, anchor: "eyes", widthFactor: 2.8, offsetY: 0.35 },
    ],
  },
];
