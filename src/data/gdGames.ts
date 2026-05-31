// Game Distributor embeds — add games here as you receive embed codes.
// Each game has either `embedUrl` (preferred) OR `embedHtml` (raw <iframe>).

export type GDCategory =
  | "action"
  | "adventure"
  | "puzzle"
  | "racing"
  | "sports"
  | "shooting"
  | "strategy"
  | "arcade"
  | "girls"
  | "io"
  | "multiplayer"
  | "casual";

export const gdCategories: Record<GDCategory, string> = {
  action: "Action",
  adventure: "Adventure",
  puzzle: "Puzzle",
  racing: "Racing",
  sports: "Sports",
  shooting: "Shooting",
  strategy: "Strategy",
  arcade: "Arcade",
  girls: "Girls",
  io: ".io",
  multiplayer: "Multiplayer",
  casual: "Casual",
};

export interface GDGame {
  id: string;
  title: string;
  category: GDCategory;
  thumbnail?: string;
  description?: string;
  /** Game Distributor iframe URL (https://html5.gamedistribution.com/...) */
  embedUrl?: string;
  /** Or paste the full <iframe ...></iframe> snippet here */
  embedHtml?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16";
}

export const gdGames: GDGame[] = [
  {
    id: "gd-fd5ae555",
    title: "Featured Game",
    category: "arcade",
    embedUrl:
      "https://html5.gamedistribution.com/fd5ae555f42e4dac872819ed9125616c/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
];

export const getGDGamesByCategory = (cat: GDCategory) =>
  gdGames.filter((g) => g.category === cat);
