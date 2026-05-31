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
  {
    id: "c725caf57a5940deb09730cdf322f3a1",
    title: "Combinations Daily",
    category: "puzzle",
    thumbnail: gdThumb("c725caf57a5940deb09730cdf322f3a1"),
    embedUrl:
      "https://html5.gamedistribution.com/c725caf57a5940deb09730cdf322f3a1/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "9/16",
  },
  {
    id: "8a7fdc0a68ad4311a72557de8368b8cd",
    title: "Game 5",
    category: "arcade",
    thumbnail: gdThumb("8a7fdc0a68ad4311a72557de8368b8cd"),
    embedUrl:
      "https://html5.gamedistribution.com/8a7fdc0a68ad4311a72557de8368b8cd/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "1d9ac2ca58b2436ab1e7ce3b83fd709f",
    title: "Stacking Match",
    category: "puzzle",
    description: "by Yizhiyuan Network Technology Co., Ltd.",
    thumbnail: gdThumb("1d9ac2ca58b2436ab1e7ce3b83fd709f"),
    embedUrl:
      "https://html5.gamedistribution.com/1d9ac2ca58b2436ab1e7ce3b83fd709f/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "f000cd0f0a0444aa82a1b937828a9954",
    title: "Pogo Masters",
    category: "arcade",
    description: "by GamesMrkt",
    thumbnail: gdThumb("f000cd0f0a0444aa82a1b937828a9954"),
    embedUrl:
      "https://html5.gamedistribution.com/f000cd0f0a0444aa82a1b937828a9954/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "a2b83c1a317c4eb0bffcc4ffcece5ef9",
    title: "Float for Brainrots",
    category: "arcade",
    description: "by gameVgames",
    thumbnail: gdThumb("a2b83c1a317c4eb0bffcc4ffcece5ef9"),
    embedUrl:
      "https://html5.gamedistribution.com/a2b83c1a317c4eb0bffcc4ffcece5ef9/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "a0cd025397ff4b23ba3879e8da7936b2",
    title: "Bears vs. Art",
    category: "arcade",
    description: "by Yes2Games",
    thumbnail: gdThumb("a0cd025397ff4b23ba3879e8da7936b2"),
    embedUrl:
      "https://html5.gamedistribution.com/a0cd025397ff4b23ba3879e8da7936b2/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "e098ff2d14cf45efbc5d1896631372e5",
    title: "HexaFill",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("e098ff2d14cf45efbc5d1896631372e5"),
    embedUrl:
      "https://html5.gamedistribution.com/e098ff2d14cf45efbc5d1896631372e5/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "6b3a8b1a95db42cdb8c166093d0c78a5",
    title: "Tidy Master Satisfeel ASMR",
    category: "casual",
    description: "by Yiv.Com",
    thumbnail: gdThumb("6b3a8b1a95db42cdb8c166093d0c78a5"),
    embedUrl:
      "https://html5.gamedistribution.com/6b3a8b1a95db42cdb8c166093d0c78a5/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "7d506f1931fc46c59714305fbd9ae056",
    title: "Asylum: Baldi Granny Slender",
    category: "action",
    description: "by Starodymov Games",
    thumbnail: gdThumb("7d506f1931fc46c59714305fbd9ae056"),
    embedUrl:
      "https://html5.gamedistribution.com/7d506f1931fc46c59714305fbd9ae056/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "47ae55f0a59a41ed871cd94c93083b01",
    title: "City Gas Station Simulator",
    category: "casual",
    description: "by bestgames.com",
    thumbnail: gdThumb("47ae55f0a59a41ed871cd94c93083b01"),
    embedUrl:
      "https://html5.gamedistribution.com/47ae55f0a59a41ed871cd94c93083b01/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "7cd661a59cc4416693b71d686b06d25d",
    title: "Build a Go-Kart",
    category: "racing",
    description: "by GamePush",
    thumbnail: gdThumb("7cd661a59cc4416693b71d686b06d25d"),
    embedUrl:
      "https://html5.gamedistribution.com/7cd661a59cc4416693b71d686b06d25d/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "47d3e4e4cc2d4ed293509052e3e39c91",
    title: "Lemonade Tycoon Idle",
    category: "strategy",
    description: "by MHL",
    thumbnail: gdThumb("47d3e4e4cc2d4ed293509052e3e39c91"),
    embedUrl:
      "https://html5.gamedistribution.com/47d3e4e4cc2d4ed293509052e3e39c91/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "59560ac116da4d729dd6a07439d3995e",
    title: "Stacking Match",
    category: "puzzle",
    thumbnail: gdThumb("59560ac116da4d729dd6a07439d3995e"),
    embedUrl:
      "https://html5.gamedistribution.com/59560ac116da4d729dd6a07439d3995e/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "fff2efce32324f56a3e9d59ddb42cf1b",
    title: "Pato Vs Cops",
    category: "racing",
    description: "by GMG",
    thumbnail: gdThumb("fff2efce32324f56a3e9d59ddb42cf1b"),
    embedUrl:
      "https://html5.gamedistribution.com/fff2efce32324f56a3e9d59ddb42cf1b/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "d4a7c2d0d8914a888912ca21d0e20ae7",
    title: "Power Puzzle",
    category: "puzzle",
    description: "by HDCorp",
    thumbnail: gdThumb("d4a7c2d0d8914a888912ca21d0e20ae7"),
    embedUrl:
      "https://html5.gamedistribution.com/d4a7c2d0d8914a888912ca21d0e20ae7/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "dc0290265efc4df58436136b8a8b0b52",
    title: "Match Dream Garden",
    category: "puzzle",
    description: "by Inlogic Software",
    thumbnail: gdThumb("dc0290265efc4df58436136b8a8b0b52"),
    embedUrl:
      "https://html5.gamedistribution.com/dc0290265efc4df58436136b8a8b0b52/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "9dc3a58253534d52ad8be29b14c86fa9",
    title: "Belote 3in1",
    category: "casual",
    description: "by Playades International LLC",
    thumbnail: gdThumb("9dc3a58253534d52ad8be29b14c86fa9"),
    embedUrl:
      "https://html5.gamedistribution.com/9dc3a58253534d52ad8be29b14c86fa9/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "966d94f902de491eb224711f51d7a92e",
    title: "Dogs vs Aliens",
    category: "arcade",
    description: "by Square Dino LLC",
    thumbnail: gdThumb("966d94f902de491eb224711f51d7a92e"),
    embedUrl:
      "https://html5.gamedistribution.com/966d94f902de491eb224711f51d7a92e/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "75c605af07684a719fd9ebbc552c246b",
    title: "TRIVIA NATION",
    category: "casual",
    description: "by BUSIDOL",
    thumbnail: gdThumb("75c605af07684a719fd9ebbc552c246b"),
    embedUrl:
      "https://html5.gamedistribution.com/75c605af07684a719fd9ebbc552c246b/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "59c9c46de0c744e9ae989546e860d7e8",
    title: "Emoji Frenzy",
    category: "arcade",
    description: "by ArKeny",
    thumbnail: gdThumb("59c9c46de0c744e9ae989546e860d7e8"),
    embedUrl:
      "https://html5.gamedistribution.com/59c9c46de0c744e9ae989546e860d7e8/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "109536c4ebad4fceb14224df11b0b158",
    title: "Oreplication",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("109536c4ebad4fceb14224df11b0b158"),
    embedUrl:
      "https://html5.gamedistribution.com/109536c4ebad4fceb14224df11b0b158/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "26a55f4431144dd3a7230222c772e676",
    title: "Word Game 2026",
    category: "puzzle",
    description: "by Aman Bhai",
    thumbnail: gdThumb("26a55f4431144dd3a7230222c772e676"),
    embedUrl:
      "https://html5.gamedistribution.com/26a55f4431144dd3a7230222c772e676/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "9/16",
  },
  {
    id: "57e0f26d59df4e2a95c4ea779012310e",
    title: "Match Ten Number Puzzle",
    category: "puzzle",
    description: "by PuzzleGame.Com",
    thumbnail: gdThumb("57e0f26d59df4e2a95c4ea779012310e"),
    embedUrl:
      "https://html5.gamedistribution.com/57e0f26d59df4e2a95c4ea779012310e/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "9/16",
  },
  {
    id: "17113941a2f5409290016059b594d0b5",
    title: "Stick: Tactics & Destruction",
    category: "action",
    description: "by GamePush",
    thumbnail: gdThumb("17113941a2f5409290016059b594d0b5"),
    embedUrl:
      "https://html5.gamedistribution.com/17113941a2f5409290016059b594d0b5/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "1561f24d736b4bf292e0ae33059f909f",
    title: "Bubble Pop Legend",
    category: "puzzle",
    description: "by Anna Inc",
    thumbnail: gdThumb("1561f24d736b4bf292e0ae33059f909f"),
    embedUrl:
      "https://html5.gamedistribution.com/1561f24d736b4bf292e0ae33059f909f/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "24834535f13b4c7aa2b696bb62ec2685",
    title: "Zombie Rush",
    category: "action",
    description: "by SqueakyGamesInc",
    thumbnail: gdThumb("24834535f13b4c7aa2b696bb62ec2685"),
    embedUrl:
      "https://html5.gamedistribution.com/24834535f13b4c7aa2b696bb62ec2685/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "82efd9293b264d2ebf2255857a4912e7",
    title: "Coin Blitz",
    category: "arcade",
    description: "by LevelKraft Technologies",
    thumbnail: gdThumb("82efd9293b264d2ebf2255857a4912e7"),
    embedUrl:
      "https://html5.gamedistribution.com/82efd9293b264d2ebf2255857a4912e7/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "600319e8d5d94a41bb3374c726ba15fc",
    title: "Apocalypse Shelter",
    category: "strategy",
    description: "by GamePush",
    thumbnail: gdThumb("600319e8d5d94a41bb3374c726ba15fc"),
    embedUrl:
      "https://html5.gamedistribution.com/600319e8d5d94a41bb3374c726ba15fc/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "504e7fdd353f469b95f1680e4f63b36b",
    title: "Snake Puzzle Escape",
    category: "puzzle",
    description: "by Extremesols",
    thumbnail: gdThumb("504e7fdd353f469b95f1680e4f63b36b"),
    embedUrl:
      "https://html5.gamedistribution.com/504e7fdd353f469b95f1680e4f63b36b/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "95a7eb46911a48ae845dd8e58ea1dba2",
    title: "Car Parking Simulator",
    category: "racing",
    description: "by bestgames.com",
    thumbnail: gdThumb("95a7eb46911a48ae845dd8e58ea1dba2"),
    embedUrl:
      "https://html5.gamedistribution.com/95a7eb46911a48ae845dd8e58ea1dba2/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "16/9",
  },
  {
    id: "f9d0af2d87e644e68e65e0ea2184a0f7",
    title: "Ship & Fish",
    category: "arcade",
    description: "by KDS Group",
    thumbnail: gdThumb("f9d0af2d87e644e68e65e0ea2184a0f7"),
    embedUrl:
      "https://html5.gamedistribution.com/f9d0af2d87e644e68e65e0ea2184a0f7/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
  {
    id: "a71168b1feb94d4bbeb466d22c292b53",
    title: "Caterfall 2048",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("a71168b1feb94d4bbeb466d22c292b53"),
    embedUrl:
      "https://html5.gamedistribution.com/a71168b1feb94d4bbeb466d22c292b53/?gd_sdk_referrer_url=https://uniqueapp.fun/games-hub",
    aspectRatio: "4/3",
  },
];

export const getGDGamesByCategory = (cat: GDCategory) =>
  gdGames.filter((g) => g.category === cat);
