// GameDistribution Games Data
// After registering on GameDistribution.com, replace "PLACEHOLDER_ID" with actual game IDs

export type GameCategory = "girls" | "action" | "puzzle" | "sports" | "adventure" | "racing";

export interface GDGame {
  id: string;
  gameId: string; // GameDistribution game ID (from catalog)
  title: string;
  description: string;
  category: GameCategory;
  width: number;
  height: number;
  rating?: number;
}

export const gameCategories: Record<GameCategory, string> = {
  girls: "For Girls",
  action: "Action",
  puzzle: "Puzzle",
  sports: "Sports",
  adventure: "Adventure",
  racing: "Racing"
};

// PLACEHOLDER GAMES - After registration, add actual game IDs from GameDistribution catalog
export const gdGames: GDGame[] = [];

export const getGamesByCategory = (category: GameCategory): GDGame[] => {
  return gdGames.filter(game => game.category === category);
};
