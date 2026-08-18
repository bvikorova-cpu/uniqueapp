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
import santa from "@/assets/puzzles/puzzle-santa.jpg";
import christmas from "@/assets/puzzles/puzzle-christmas.jpg";
import halloween from "@/assets/puzzles/puzzle-halloween.jpg";
import easter from "@/assets/puzzles/puzzle-easter.jpg";
import birthday from "@/assets/puzzles/puzzle-birthday.jpg";
import dolls from "@/assets/puzzles/puzzle-dolls.jpg";
import fashion from "@/assets/puzzles/puzzle-fashion.jpg";
import beauty from "@/assets/puzzles/puzzle-beauty.jpg";
import babyAnimals from "@/assets/puzzles/puzzle-baby-animals.jpg";
import superheroes from "@/assets/puzzles/puzzle-superheroes.jpg";
import princess from "@/assets/puzzles/puzzle-princess.jpg";
import ballet from "@/assets/puzzles/puzzle-ballet.jpg";
import ponies from "@/assets/puzzles/puzzle-ponies.jpg";
import mechs from "@/assets/puzzles/puzzle-mechs.jpg";
import raceCars from "@/assets/puzzles/puzzle-race-cars.jpg";
import spaceStation from "@/assets/puzzles/puzzle-space-station.jpg";
import autumn from "@/assets/puzzles/puzzle-autumn.jpg";
import beach from "@/assets/puzzles/puzzle-beach.jpg";
import bakery from "@/assets/puzzles/puzzle-bakery.jpg";
import fairyGarden from "@/assets/puzzles/puzzle-fairy-garden.jpg";

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
  // ---- Little kids (16–25 pieces) ----
  {
    slug: "safari",
    title: "Safari Friends",
    tagline: "Lion, giraffe, zebra and elephant in a sunny savannah.",
    emoji: "🦁",
    gradient: "from-yellow-400 to-amber-500",
    image: safari,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "kittens",
    title: "Cosy Kittens",
    tagline: "Playful kittens with balls of yarn in a warm living room.",
    emoji: "🐱",
    gradient: "from-orange-300 to-rose-400",
    image: kittens,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "trucks",
    title: "Big Machines",
    tagline: "Smiling excavator, crane and dump truck at work.",
    emoji: "🚜",
    gradient: "from-yellow-400 to-orange-500",
    image: trucks,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "puppies",
    title: "Puppy Garden",
    tagline: "Happy puppies among butterflies and flowers.",
    emoji: "🐶",
    gradient: "from-lime-300 to-emerald-400",
    image: puppies,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "circus",
    title: "Happy Circus",
    tagline: "Clowns, balloons and an elephant on a ball.",
    emoji: "🎪",
    gradient: "from-red-400 to-yellow-400",
    image: circus,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "winter",
    title: "Winter Wonderland",
    tagline: "Snowman, penguins and sledging in the snow.",
    emoji: "⛄",
    gradient: "from-sky-300 to-blue-400",
    image: winter,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "candy",
    title: "Candy Land",
    tagline: "Lollipop trees, chocolate river and gingerbread houses.",
    emoji: "🍭",
    gradient: "from-pink-300 to-rose-400",
    image: candy,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "bugs",
    title: "Meadow Bugs",
    tagline: "Bees, ladybugs and a snail in a flower meadow.",
    emoji: "🐝",
    gradient: "from-yellow-300 to-lime-400",
    image: bugs,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  // ---- Bigger kids (36–64 pieces) ----
  {
    slug: "fire-station",
    title: "Fire Station",
    tagline: "Fire truck, ladder and a dalmatian on duty.",
    emoji: "🚒",
    gradient: "from-red-500 to-orange-500",
    image: fireStation,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "school-fun",
    title: "School Fun",
    tagline: "Letters, numbers and cheerful school supplies.",
    emoji: "✏️",
    gradient: "from-emerald-400 to-teal-500",
    image: school,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "pirate-island",
    title: "Pirate Island",
    tagline: "Pirate ship, parrots and a treasure chest on the sand.",
    emoji: "🏝️",
    gradient: "from-cyan-400 to-amber-400",
    image: pirateIsland,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "funfair",
    title: "Fun Fair",
    tagline: "Ferris wheel, carousel and a crowd of happy families.",
    emoji: "🎡",
    gradient: "from-fuchsia-400 to-orange-400",
    image: funfair,
    rows: 7,
    cols: 7,
    age: "Ages 8–10",
    level: "big",
  },
  {
    slug: "train-station",
    title: "Train Station",
    tagline: "Steam train, platforms, travellers and a clock tower.",
    emoji: "🚂",
    gradient: "from-emerald-500 to-cyan-600",
    image: trainStation,
    rows: 7,
    cols: 7,
    age: "Ages 8–10",
    level: "big",
  },
  {
    slug: "knights",
    title: "Knight Tournament",
    tagline: "Jousting knights, banners and a castle full of details.",
    emoji: "⚔️",
    gradient: "from-red-500 to-yellow-500",
    image: knights,
    rows: 8,
    cols: 8,
    age: "Ages 9–11",
    level: "big",
  },
  {
    slug: "stadium",
    title: "Stadium Night",
    tagline: "Football match with cheering fans and a scoreboard.",
    emoji: "⚽",
    gradient: "from-green-500 to-blue-600",
    image: stadium,
    rows: 8,
    cols: 8,
    age: "Ages 9–11",
    level: "big",
  },
  // ---- Experts (81–144 pieces) ----
  {
    slug: "dino-valley",
    title: "Dinosaur Valley",
    tagline: "Dozens of dinosaurs, volcanoes and waterfalls.",
    emoji: "🌋",
    gradient: "from-orange-500 to-emerald-600",
    image: dinoValley,
    rows: 9,
    cols: 9,
    age: "Ages 11+",
    level: "expert",
  },
  {
    slug: "world-map",
    title: "Animal World Map",
    tagline: "Continents packed with animals, ships and landmarks.",
    emoji: "🗺️",
    gradient: "from-sky-400 to-emerald-500",
    image: worldMap,
    rows: 10,
    cols: 10,
    age: "Ages 12+",
    level: "expert",
  },
  {
    slug: "coral-city",
    title: "Coral City",
    tagline: "Hundreds of fish, seahorses and a yellow submarine.",
    emoji: "🐠",
    gradient: "from-cyan-500 to-indigo-600",
    image: coralCity,
    rows: 11,
    cols: 11,
    age: "Ages 12+",
    level: "expert",
  },
  {
    slug: "ski-resort",
    title: "Alpine Ski Resort",
    tagline: "Cable cars, chalets and skiers across a snowy panorama.",
    emoji: "🎿",
    gradient: "from-blue-400 to-slate-600",
    image: skiResort,
    rows: 12,
    cols: 12,
    age: "Ages 12+",
    level: "expert",
  },
  // ---- Holidays & seasons ----
  {
    slug: "santa",
    title: "Santa's Night",
    tagline: "Santa with a sack of gifts, sleigh and reindeer above a snowy village.",
    emoji: "🎅",
    gradient: "from-red-500 to-rose-600",
    image: santa,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "christmas",
    title: "Christmas Room",
    tagline: "Decorated tree, presents, stockings and a curious cat.",
    emoji: "🎄",
    gradient: "from-emerald-500 to-red-500",
    image: christmas,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "easter",
    title: "Easter Meadow",
    tagline: "Bunnies, painted eggs and chicks among spring flowers.",
    emoji: "🐰",
    gradient: "from-lime-300 to-pink-300",
    image: easter,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "halloween",
    title: "Friendly Halloween",
    tagline: "Smiling pumpkins, a little ghost and a tiny witch.",
    emoji: "🎃",
    gradient: "from-orange-500 to-purple-600",
    image: halloween,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "birthday",
    title: "Birthday Party",
    tagline: "Cake, balloons, party hats and happy kids.",
    emoji: "🎂",
    gradient: "from-pink-400 to-yellow-400",
    image: birthday,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "autumn",
    title: "Autumn Forest",
    tagline: "Squirrels, mushrooms and falling leaves.",
    emoji: "🍁",
    gradient: "from-amber-500 to-orange-600",
    image: autumn,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "beach",
    title: "Summer Beach",
    tagline: "Sandcastle, umbrellas and seagulls on a sunny day.",
    emoji: "🏖️",
    gradient: "from-cyan-300 to-yellow-300",
    image: beach,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  // ---- For girls ----
  {
    slug: "dolls",
    title: "Doll House",
    tagline: "Pretty dolls with dresses, ribbons and a little dollhouse.",
    emoji: "🧸",
    gradient: "from-pink-300 to-rose-400",
    image: dolls,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "princess",
    title: "Princess Castle",
    tagline: "A princess, magic carriage and a rainbow over the castle.",
    emoji: "👑",
    gradient: "from-fuchsia-300 to-sky-300",
    image: princess,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "baby-animals",
    title: "Baby Animals",
    tagline: "Bunny, kitten, duckling, hedgehog and a little fawn.",
    emoji: "🐰",
    gradient: "from-amber-200 to-rose-300",
    image: babyAnimals,
    rows: 4,
    cols: 4,
    age: "Ages 4–6",
    level: "little",
  },
  {
    slug: "ponies",
    title: "Pony Stable",
    tagline: "Friendly ponies with ribbons in a cosy stable.",
    emoji: "🐴",
    gradient: "from-rose-300 to-amber-300",
    image: ponies,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "ballet",
    title: "Ballet Class",
    tagline: "Little ballerinas in tutus at the barre.",
    emoji: "🩰",
    gradient: "from-pink-200 to-rose-300",
    image: ballet,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "fashion",
    title: "Fashion Boutique",
    tagline: "Dresses, shoes and handbags in a pastel boutique.",
    emoji: "👗",
    gradient: "from-rose-300 to-fuchsia-400",
    image: fashion,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "beauty",
    title: "Beauty Table",
    tagline: "Brushes, nail polish, perfumes and roses on a vanity.",
    emoji: "💄",
    gradient: "from-pink-300 to-amber-200",
    image: beauty,
    rows: 7,
    cols: 7,
    age: "Ages 8–10",
    level: "big",
  },
  {
    slug: "fairy-garden",
    title: "Fairy Garden",
    tagline: "Fairies, mushroom houses and glowing lanterns at dusk.",
    emoji: "🧚",
    gradient: "from-purple-400 to-pink-400",
    image: fairyGarden,
    rows: 9,
    cols: 9,
    age: "Ages 11+",
    level: "expert",
  },
  // ---- For boys ----
  {
    slug: "superheroes",
    title: "Superhero Squad",
    tagline: "Caped hero kids flying over the city skyline.",
    emoji: "🦸",
    gradient: "from-blue-500 to-red-500",
    image: superheroes,
    rows: 5,
    cols: 5,
    age: "Ages 5–7",
    level: "little",
  },
  {
    slug: "space-station",
    title: "Space Mission",
    tagline: "Astronauts fixing a rocket among planets and satellites.",
    emoji: "👨‍🚀",
    gradient: "from-indigo-600 to-sky-500",
    image: spaceStation,
    rows: 6,
    cols: 6,
    age: "Ages 7–9",
    level: "big",
  },
  {
    slug: "mechs",
    title: "Mech Heroes",
    tagline: "Robot mech team in a neon-lit hangar.",
    emoji: "🦾",
    gradient: "from-slate-600 to-cyan-500",
    image: mechs,
    rows: 8,
    cols: 8,
    age: "Ages 9–11",
    level: "big",
  },
  {
    slug: "race-cars",
    title: "Race Day",
    tagline: "Race cars, pit crew and a packed grandstand.",
    emoji: "🏎️",
    gradient: "from-red-500 to-yellow-500",
    image: raceCars,
    rows: 10,
    cols: 10,
    age: "Ages 12+",
    level: "expert",
  },
  {
    slug: "bakery",
    title: "Bakery Street",
    tagline: "A cosy city corner full of cakes, flowers and bicycles.",
    emoji: "🥐",
    gradient: "from-amber-400 to-rose-400",
    image: bakery,
    rows: 11,
    cols: 11,
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
