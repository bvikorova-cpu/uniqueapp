import dinoJungle from "@/assets/puzzles/puzzle-dino-jungle.jpg";
import spaceKids from "@/assets/puzzles/puzzle-space-kids.jpg";
import seaBuddies from "@/assets/puzzles/puzzle-sea-buddies.jpg";
import unicornCastle from "@/assets/puzzles/puzzle-unicorn-castle.jpg";
import farmFriends from "@/assets/puzzles/puzzle-farm-friends.jpg";
import robotCity from "@/assets/puzzles/puzzle-robot-city.jpg";
import rainforest from "@/assets/puzzles/puzzle-rainforest.jpg";
import dragonTown from "@/assets/puzzles/puzzle-dragon-town.jpg";
import futureCity from "@/assets/puzzles/puzzle-future-city.jpg";
import deepSpace from "@/assets/puzzles/puzzle-deep-space.jpg";
import sunkenShip from "@/assets/puzzles/puzzle-sunken-ship.jpg";
import safari from "@/assets/puzzles/puzzle-safari.jpg";
import kittens from "@/assets/puzzles/puzzle-kittens.jpg";
import trucks from "@/assets/puzzles/puzzle-trucks.jpg";
import circus from "@/assets/puzzles/puzzle-circus.jpg";
import winter from "@/assets/puzzles/puzzle-winter.jpg";
import candy from "@/assets/puzzles/puzzle-candy.jpg";
import fireStation from "@/assets/puzzles/puzzle-firestation.jpg";
import puppies from "@/assets/puzzles/puzzle-puppies.jpg";
import school from "@/assets/puzzles/puzzle-school.jpg";
import bugs from "@/assets/puzzles/puzzle-bugs.jpg";
import pirateIsland from "@/assets/puzzles/puzzle-pirate-island.jpg";
import funfair from "@/assets/puzzles/puzzle-funfair.jpg";
import trainStation from "@/assets/puzzles/puzzle-train-station.jpg";
import knights from "@/assets/puzzles/puzzle-knights.jpg";
import stadium from "@/assets/puzzles/puzzle-stadium.jpg";
import worldMap from "@/assets/puzzles/puzzle-world-map.jpg";
import dinoValley from "@/assets/puzzles/puzzle-dino-valley.jpg";
import coralCity from "@/assets/puzzles/puzzle-coral-city.jpg";
import skiResort from "@/assets/puzzles/puzzle-ski-resort.jpg";

export interface KidsPuzzle {
  slug: string;
  title: string;
  tagline: string;
  emoji: string;
  gradient: string;
  image: string;
  rows: number;
  cols: number;
  /** Recommended age range shown on the card. */
  age: string;
  /** Difficulty group used for filtering. */
  level: "little" | "big" | "expert";
}

/** Cost in AI credits for one puzzle-piece draw. */
export const PIECE_COST = 1;

export const PUZZLE_LEVELS: { id: KidsPuzzle["level"]; label: string; hint: string }[] = [
  { id: "little", label: "Little kids", hint: "16–25 pieces · ages 4–7" },
  { id: "big", label: "Bigger kids", hint: "36–64 pieces · ages 8–11" },
  { id: "expert", label: "Experts", hint: "81–144 pieces · ages 12+" },
];

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
    age: "Ages 4–6",
    level: "little",
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
    age: "Ages 4–6",
    level: "little",
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
    age: "Ages 5–7",
    level: "little",
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
    age: "Ages 5–7",
    level: "little",
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
    age: "Ages 7–9",
    level: "big",
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
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "rainforest",
    title: "Rainforest Falls",
    tagline: "Toucans, monkeys and a jaguar hidden in the jungle canopy.",
    emoji: "🦜",
    gradient: "from-green-500 to-emerald-600",
    image: rainforest,
    rows: 7,
    cols: 7,
    age: "Ages 8–10",
    level: "big",
  },
  {
    slug: "dragon-town",
    title: "Dragon Town",
    tagline: "A busy medieval market square with dragons over the castle.",
    emoji: "🐉",
    gradient: "from-orange-500 to-red-600",
    image: dragonTown,
    rows: 8,
    cols: 8,
    age: "Ages 9–11",
    level: "big",
  },
  {
    slug: "future-city",
    title: "Neon Future City",
    tagline: "Flying cars and neon towers in a night skyline.",
    emoji: "🌃",
    gradient: "from-sky-500 to-indigo-600",
    image: futureCity,
    rows: 9,
    cols: 9,
    age: "Ages 11+",
    level: "expert",
  },
  {
    slug: "deep-space",
    title: "Deep Space Atlas",
    tagline: "Planets, comets, nebulae and astronauts across the solar system.",
    emoji: "🪐",
    gradient: "from-slate-700 to-purple-700",
    image: deepSpace,
    rows: 10,
    cols: 10,
    age: "Ages 12+",
    level: "expert",
  },
  {
    slug: "sunken-ship",
    title: "Sunken Treasure City",
    tagline: "A shipwreck, divers and coral ruins full of tiny details.",
    emoji: "🏴‍☠️",
    gradient: "from-teal-600 to-blue-800",
    image: sunkenShip,
    rows: 12,
    cols: 12,
    age: "Ages 12+",
    level: "expert",
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
