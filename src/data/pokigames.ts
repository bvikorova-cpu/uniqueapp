// Poki Games Data
// Integration with Poki.com for game content

export type GameCategory = "girls" | "action" | "puzzle" | "sports" | "adventure" | "racing" | "strategy" | "casual";

export interface PokiGame {
  id: string;
  slug: string; // Poki game slug for iframe embed
  title: string;
  description: string;
  category: GameCategory;
  thumbnail: string;
  rating?: number;
  plays?: number;
}

export const gameCategories: Record<GameCategory, string> = {
  girls: "For Girls",
  action: "Action",
  puzzle: "Puzzle",
  sports: "Sports",
  adventure: "Adventure",
  racing: "Racing",
  strategy: "Strategy",
  casual: "Casual"
};

// Poki Games Collection
export const pokiGames: PokiGame[] = [
  // Girls Games
  {
    id: "girls-1",
    slug: "stickman-hook",
    title: "Stickman Hook",
    description: "Swing through levels with style and precision",
    category: "girls",
    thumbnail: "/placeholder.svg",
    rating: 9.2,
    plays: 15000000
  },
  {
    id: "girls-2",
    slug: "subway-surfers",
    title: "Subway Surfers",
    description: "Run, dodge and surf through the city",
    category: "girls",
    thumbnail: "/placeholder.svg",
    rating: 9.5,
    plays: 50000000
  },
  // Action Games
  {
    id: "action-1",
    slug: "bullet-force",
    title: "Bullet Force",
    description: "Multiplayer FPS action game",
    category: "action",
    thumbnail: "/placeholder.svg",
    rating: 9.0,
    plays: 20000000
  },
  {
    id: "action-2",
    slug: "combat-reloaded",
    title: "Combat Reloaded",
    description: "Fast-paced shooter combat",
    category: "action",
    thumbnail: "/placeholder.svg",
    rating: 8.8,
    plays: 12000000
  },
  // Puzzle Games
  {
    id: "puzzle-1",
    slug: "bubble-shooter",
    title: "Bubble Shooter",
    description: "Pop colorful bubbles and clear the board",
    category: "puzzle",
    thumbnail: "/placeholder.svg",
    rating: 8.5,
    plays: 30000000
  },
  {
    id: "puzzle-2",
    slug: "2048",
    title: "2048",
    description: "Merge tiles to reach 2048",
    category: "puzzle",
    thumbnail: "/placeholder.svg",
    rating: 9.1,
    plays: 25000000
  },
  // Sports Games
  {
    id: "sports-1",
    slug: "soccer-skills",
    title: "Soccer Skills",
    description: "Show off your football prowess",
    category: "sports",
    thumbnail: "/placeholder.svg",
    rating: 8.7,
    plays: 18000000
  },
  {
    id: "sports-2",
    slug: "basketball-stars",
    title: "Basketball Stars",
    description: "Compete in basketball tournaments",
    category: "sports",
    thumbnail: "/placeholder.svg",
    rating: 9.0,
    plays: 22000000
  },
  // Racing Games
  {
    id: "racing-1",
    slug: "moto-x3m",
    title: "Moto X3M",
    description: "Perform stunts on your motorbike",
    category: "racing",
    thumbnail: "/placeholder.svg",
    rating: 9.3,
    plays: 35000000
  },
  {
    id: "racing-2",
    slug: "drift-hunters",
    title: "Drift Hunters",
    description: "Master the art of drifting",
    category: "racing",
    thumbnail: "/placeholder.svg",
    rating: 8.9,
    plays: 16000000
  },
  // Strategy Games
  {
    id: "strategy-1",
    slug: "bloons-td-5",
    title: "Bloons TD 5",
    description: "Tower defense strategy game",
    category: "strategy",
    thumbnail: "/placeholder.svg",
    rating: 9.4,
    plays: 28000000
  },
  {
    id: "strategy-2",
    slug: "clash-of-clans",
    title: "Clash of Clans",
    description: "Build and defend your village",
    category: "strategy",
    thumbnail: "/placeholder.svg",
    rating: 9.2,
    plays: 40000000
  }
];

export const getGamesByCategory = (category: GameCategory): PokiGame[] => {
  return pokiGames.filter(game => game.category === category);
};

export const getTopGameOfDay = (): PokiGame => {
  // Return the game with highest plays
  return pokiGames.sort((a, b) => (b.plays || 0) - (a.plays || 0))[0];
};

export const getTrendingGames = (limit: number = 5): PokiGame[] => {
  return pokiGames
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, limit);
};
