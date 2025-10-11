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
export const gdGames: GDGame[] = [];

export const getGamesByCategory = (category: GameCategory): GDGame[] => {
  return gdGames.filter(game => game.category === category);
};
