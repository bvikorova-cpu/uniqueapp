// GameDistribution Games Data
// Po registrácii na GameDistribution.com nahraď "PLACEHOLDER_ID" skutočnými game ID

export type GameCategory = "girls" | "action" | "puzzle" | "sports" | "adventure" | "racing";

export interface GDGame {
  id: string;
  gameId: string; // GameDistribution game ID (z katalógu)
  title: string;
  description: string;
  category: GameCategory;
  width: number;
  height: number;
  rating?: number;
}

export const gameCategories: Record<GameCategory, string> = {
  girls: "Pre dievčatá",
  action: "Akčné",
  puzzle: "Logické",
  sports: "Športové",
  adventure: "Dobrodružné",
  racing: "Závodné"
};

// PLACEHOLDER GAMES - Po registrácii doplň skutočné game IDs z GameDistribution katalógu
export const gdGames: GDGame[] = [
  // Girls Games
  {
    id: "fashion-designer",
    gameId: "PLACEHOLDER_ID", // Nahraď po registrácii
    title: "Fashion Designer",
    description: "Navrhni vlastnú módu a staň sa top dizajnérkou!",
    category: "girls",
    width: 800,
    height: 600,
    rating: 9.2
  },
  {
    id: "makeup-salon",
    gameId: "PLACEHOLDER_ID",
    title: "Makeup Salon",
    description: "Profesionálny makeup salón s neobmedzenými možnosťami!",
    category: "girls",
    width: 800,
    height: 600,
    rating: 9.0
  },
  {
    id: "dress-up-princess",
    gameId: "PLACEHOLDER_ID",
    title: "Princess Dress Up",
    description: "Obleč princeznú do najkrajších šiat!",
    category: "girls",
    width: 800,
    height: 600,
    rating: 8.8
  },
  {
    id: "nail-art-studio",
    gameId: "PLACEHOLDER_ID",
    title: "Nail Art Studio",
    description: "Vytvor dokonalý nail art dizajn!",
    category: "girls",
    width: 800,
    height: 600,
    rating: 8.5
  },
  
  // Action Games
  {
    id: "zombie-shooter",
    gameId: "PLACEHOLDER_ID",
    title: "Zombie Shooter",
    description: "Prežij vlny zombie útočníkov!",
    category: "action",
    width: 800,
    height: 600,
    rating: 9.1
  },
  {
    id: "ninja-warrior",
    gameId: "PLACEHOLDER_ID",
    title: "Ninja Warrior",
    description: "Stань najlepším ninja bojovníkom!",
    category: "action",
    width: 800,
    height: 600,
    rating: 8.9
  },
  
  // Puzzle Games
  {
    id: "bubble-shooter",
    gameId: "PLACEHOLDER_ID",
    title: "Bubble Shooter",
    description: "Klasická logická hra s bublinkami!",
    category: "puzzle",
    width: 800,
    height: 600,
    rating: 8.7
  },
  {
    id: "match-3-candy",
    gameId: "PLACEHOLDER_ID",
    title: "Candy Match 3",
    description: "Spojuj sladkosti a získaj najvyššie skóre!",
    category: "puzzle",
    width: 800,
    height: 600,
    rating: 8.6
  },
  
  // Sports Games
  {
    id: "soccer-stars",
    gameId: "PLACEHOLDER_ID",
    title: "Soccer Stars",
    description: "Futbalový zápas s najlepšími hráčmi!",
    category: "sports",
    width: 800,
    height: 600,
    rating: 9.0
  },
  {
    id: "basketball-legends",
    gameId: "PLACEHOLDER_ID",
    title: "Basketball Legends",
    description: "Basketbalové legendy čakajú na súboj!",
    category: "sports",
    width: 800,
    height: 600,
    rating: 8.8
  },
  
  // Adventure Games
  {
    id: "treasure-hunt",
    gameId: "PLACEHOLDER_ID",
    title: "Treasure Hunt",
    description: "Hľadaj stratený poklad v džungli!",
    category: "adventure",
    width: 800,
    height: 600,
    rating: 8.9
  },
  {
    id: "space-explorer",
    gameId: "PLACEHOLDER_ID",
    title: "Space Explorer",
    description: "Preskúmaj vesmír a objav nové planéty!",
    category: "adventure",
    width: 800,
    height: 600,
    rating: 9.1
  },
  
  // Racing Games
  {
    id: "speed-racing",
    gameId: "PLACEHOLDER_ID",
    title: "Speed Racing",
    description: "Rýchle závody s najlepšími autami!",
    category: "racing",
    width: 800,
    height: 600,
    rating: 9.2
  },
  {
    id: "moto-x3m",
    gameId: "PLACEHOLDER_ID",
    title: "Moto X3M",
    description: "Extrémne motorové kaskadérske kúsky!",
    category: "racing",
    width: 800,
    height: 600,
    rating: 9.0
  }
];

export const getGamesByCategory = (category: GameCategory): GDGame[] => {
  return gdGames.filter(game => game.category === category);
};
