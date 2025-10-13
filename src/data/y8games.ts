export interface Y8Game {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  rating?: number;
}

export const gameCategories = {
  girls: "For Girls",
  action: "Action",
  puzzle: "Puzzle",
  sports: "Sports",
  adventure: "Adventure",
  racing: "Racing",
} as const;

export type GameCategory = keyof typeof gameCategories;

export const y8Games: Y8Game[] = [];

export function getGamesByCategory(category: GameCategory): Y8Game[] {
  return y8Games.filter(game => game.category === category);
}

export function getGameBySlug(slug: string): Y8Game | undefined {
  return y8Games.find(game => game.slug === slug);
}