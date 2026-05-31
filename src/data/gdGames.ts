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

/** Auto-builds the Game Distributor CDN thumbnail URL from a game id. */
export const gdThumb = (gdId: string, size: "512x384" | "512x512" | "1280x720" = "512x384") =>
  `https://img.gamedistribution.com/${gdId}-${size}.jpg`;

export const gdGames: GDGame[] = [
  {
    id: "fd5ae555f42e4dac872819ed9125616c",
    title: "Featured Game",
    category: "arcade",
    thumbnail: gdThumb("fd5ae555f42e4dac872819ed9125616c"),
    embedUrl:
      "https://html5.gamedistribution.com/fd5ae555f42e4dac872819ed9125616c/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "2fb1dc3ebec147eeb9d7875354afcc20",
    title: "Arrow Sorting",
    category: "puzzle",
    description: "by GameBerry Studio",
    thumbnail: gdThumb("2fb1dc3ebec147eeb9d7875354afcc20"),
    embedUrl:
      "https://html5.gamedistribution.com/2fb1dc3ebec147eeb9d7875354afcc20/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "679c57024b5944f584585244718e1cee",
    title: "Mojicon Garden JigSolitaire",
    category: "puzzle",
    description: "by 2Million Games",
    thumbnail: gdThumb("679c57024b5944f584585244718e1cee"),
    embedUrl:
      "https://html5.gamedistribution.com/679c57024b5944f584585244718e1cee/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
];

export const getGDGamesByCategory = (cat: GDCategory) =>
  gdGames.filter((g) => g.category === cat);
