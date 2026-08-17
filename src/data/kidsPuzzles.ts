import dinoJungle from "@/assets/puzzles/puzzle-dino-jungle.jpg";
import spaceKids from "@/assets/puzzles/puzzle-space-kids.jpg";
import seaBuddies from "@/assets/puzzles/puzzle-sea-buddies.jpg";
import unicornCastle from "@/assets/puzzles/puzzle-unicorn-castle.jpg";
import farmFriends from "@/assets/puzzles/puzzle-farm-friends.jpg";
import robotCity from "@/assets/puzzles/puzzle-robot-city.jpg";

export interface KidsPuzzle {
  slug: string;
  title: string;
  tagline: string;
  emoji: string;
  gradient: string;
  image: string;
  rows: number;
  cols: number;
}

/** Cost in AI credits for one puzzle-piece draw. */
export const PIECE_COST = 1;

export const KIDS_PUZZLES: KidsPuzzle[] = [
  {
    slug: "dino-jungle",
    title: "Dino Jungle",
    tagline: "Baby dinosaurs splashing in a sunny jungle river.",
    emoji: "🦖",
    gradient: "from-emerald-400 to-lime-500",
    image: dinoJungle,
    rows: 4,
    cols: 4,
  },
  {
    slug: "space-kids",
    title: "Space Kiddos",
    tagline: "A little astronaut and a smiling rocket among the planets.",
    emoji: "🚀",
    gradient: "from-indigo-500 to-sky-500",
    image: spaceKids,
    rows: 4,
    cols: 4,
  },
  {
    slug: "sea-buddies",
    title: "Sea Buddies",
    tagline: "Dolphins, turtles and clownfish in a coral reef.",
    emoji: "🐬",
    gradient: "from-cyan-400 to-blue-500",
    image: seaBuddies,
    rows: 5,
    cols: 5,
  },
  {
    slug: "unicorn-castle",
    title: "Unicorn Castle",
    tagline: "Fairies and unicorns above a rainbow castle.",
    emoji: "🦄",
    gradient: "from-pink-400 to-fuchsia-500",
    image: unicornCastle,
    rows: 5,
    cols: 5,
  },
  {
    slug: "farm-friends",
    title: "Farm Friends",
    tagline: "A cheerful barnyard party with sunflowers.",
    emoji: "🐮",
    gradient: "from-amber-400 to-orange-500",
    image: farmFriends,
    rows: 6,
    cols: 6,
  },
  {
    slug: "robot-city",
    title: "Robot City",
    tagline: "Friendly robots building a colourful toy city.",
    emoji: "🤖",
    gradient: "from-violet-500 to-purple-600",
    image: robotCity,
    rows: 6,
    cols: 6,
  },
];

export const getPuzzle = (slug: string) =>
  KIDS_PUZZLES.find((p) => p.slug === slug);

export const totalPieces = (p: KidsPuzzle) => p.rows * p.cols;

/** Background styles that crop one puzzle piece out of the full artwork. */
export const pieceStyle = (p: KidsPuzzle, index: number) => {
  const row = Math.floor(index / p.cols);
  const col = index % p.cols;
  return {
    backgroundImage: `url(${p.image})`,
    backgroundSize: `${p.cols * 100}% ${p.rows * 100}%`,
    backgroundPosition: `${p.cols > 1 ? (col * 100) / (p.cols - 1) : 0}% ${
      p.rows > 1 ? (row * 100) / (p.rows - 1) : 0
    }%`,
  } as const;
};
