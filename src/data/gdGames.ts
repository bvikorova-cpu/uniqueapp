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
      "https://html5.gamedistribution.com/fd5ae555f42e4dac872819ed9125616c",
    aspectRatio: "4/3",
  },
  {
    id: "2fb1dc3ebec147eeb9d7875354afcc20",
    title: "Arrow Sorting",
    category: "puzzle",
    description: "by GameBerry Studio",
    thumbnail: gdThumb("2fb1dc3ebec147eeb9d7875354afcc20"),
    embedUrl:
      "https://html5.gamedistribution.com/2fb1dc3ebec147eeb9d7875354afcc20",
    aspectRatio: "4/3",
  },
  {
    id: "679c57024b5944f584585244718e1cee",
    title: "Mojicon Garden JigSolitaire",
    category: "puzzle",
    description: "by 2Million Games",
    thumbnail: gdThumb("679c57024b5944f584585244718e1cee"),
    embedUrl:
      "https://html5.gamedistribution.com/679c57024b5944f584585244718e1cee",
    aspectRatio: "4/3",
  },
  {
    id: "c725caf57a5940deb09730cdf322f3a1",
    title: "Combinations Daily",
    category: "puzzle",
    thumbnail: gdThumb("c725caf57a5940deb09730cdf322f3a1"),
    embedUrl:
      "https://html5.gamedistribution.com/c725caf57a5940deb09730cdf322f3a1",
    aspectRatio: "9/16",
  },
  {
    id: "8a7fdc0a68ad4311a72557de8368b8cd",
    title: "Game 5",
    category: "arcade",
    thumbnail: gdThumb("8a7fdc0a68ad4311a72557de8368b8cd"),
    embedUrl:
      "https://html5.gamedistribution.com/8a7fdc0a68ad4311a72557de8368b8cd",
    aspectRatio: "4/3",
  },
  {
    id: "1d9ac2ca58b2436ab1e7ce3b83fd709f",
    title: "Stacking Match",
    category: "puzzle",
    description: "by Yizhiyuan Network Technology Co., Ltd.",
    thumbnail: gdThumb("1d9ac2ca58b2436ab1e7ce3b83fd709f"),
    embedUrl:
      "https://html5.gamedistribution.com/1d9ac2ca58b2436ab1e7ce3b83fd709f",
    aspectRatio: "4/3",
  },
  {
    id: "f000cd0f0a0444aa82a1b937828a9954",
    title: "Pogo Masters",
    category: "arcade",
    description: "by GamesMrkt",
    thumbnail: gdThumb("f000cd0f0a0444aa82a1b937828a9954"),
    embedUrl:
      "https://html5.gamedistribution.com/f000cd0f0a0444aa82a1b937828a9954",
    aspectRatio: "16/9",
  },
  {
    id: "a2b83c1a317c4eb0bffcc4ffcece5ef9",
    title: "Float for Brainrots",
    category: "arcade",
    description: "by gameVgames",
    thumbnail: gdThumb("a2b83c1a317c4eb0bffcc4ffcece5ef9"),
    embedUrl:
      "https://html5.gamedistribution.com/a2b83c1a317c4eb0bffcc4ffcece5ef9",
    aspectRatio: "16/9",
  },
  {
    id: "a0cd025397ff4b23ba3879e8da7936b2",
    title: "Bears vs. Art",
    category: "arcade",
    description: "by Yes2Games",
    thumbnail: gdThumb("a0cd025397ff4b23ba3879e8da7936b2"),
    embedUrl:
      "https://html5.gamedistribution.com/a0cd025397ff4b23ba3879e8da7936b2",
    aspectRatio: "4/3",
  },
  {
    id: "e098ff2d14cf45efbc5d1896631372e5",
    title: "HexaFill",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("e098ff2d14cf45efbc5d1896631372e5"),
    embedUrl:
      "https://html5.gamedistribution.com/e098ff2d14cf45efbc5d1896631372e5",
    aspectRatio: "4/3",
  },
  {
    id: "6b3a8b1a95db42cdb8c166093d0c78a5",
    title: "Tidy Master Satisfeel ASMR",
    category: "casual",
    description: "by Yiv.Com",
    thumbnail: gdThumb("6b3a8b1a95db42cdb8c166093d0c78a5"),
    embedUrl:
      "https://html5.gamedistribution.com/6b3a8b1a95db42cdb8c166093d0c78a5",
    aspectRatio: "16/9",
  },
  {
    id: "7d506f1931fc46c59714305fbd9ae056",
    title: "Asylum: Baldi Granny Slender",
    category: "action",
    description: "by Starodymov Games",
    thumbnail: gdThumb("7d506f1931fc46c59714305fbd9ae056"),
    embedUrl:
      "https://html5.gamedistribution.com/7d506f1931fc46c59714305fbd9ae056",
    aspectRatio: "16/9",
  },
  {
    id: "47ae55f0a59a41ed871cd94c93083b01",
    title: "City Gas Station Simulator",
    category: "casual",
    description: "by bestgames.com",
    thumbnail: gdThumb("47ae55f0a59a41ed871cd94c93083b01"),
    embedUrl:
      "https://html5.gamedistribution.com/47ae55f0a59a41ed871cd94c93083b01",
    aspectRatio: "16/9",
  },
  {
    id: "7cd661a59cc4416693b71d686b06d25d",
    title: "Build a Go-Kart",
    category: "racing",
    description: "by GamePush",
    thumbnail: gdThumb("7cd661a59cc4416693b71d686b06d25d"),
    embedUrl:
      "https://html5.gamedistribution.com/7cd661a59cc4416693b71d686b06d25d",
    aspectRatio: "4/3",
  },
  {
    id: "47d3e4e4cc2d4ed293509052e3e39c91",
    title: "Lemonade Tycoon Idle",
    category: "strategy",
    description: "by MHL",
    thumbnail: gdThumb("47d3e4e4cc2d4ed293509052e3e39c91"),
    embedUrl:
      "https://html5.gamedistribution.com/47d3e4e4cc2d4ed293509052e3e39c91",
    aspectRatio: "16/9",
  },
  {
    id: "59560ac116da4d729dd6a07439d3995e",
    title: "Stacking Match",
    category: "puzzle",
    thumbnail: gdThumb("59560ac116da4d729dd6a07439d3995e"),
    embedUrl:
      "https://html5.gamedistribution.com/59560ac116da4d729dd6a07439d3995e",
    aspectRatio: "4/3",
  },
  {
    id: "fff2efce32324f56a3e9d59ddb42cf1b",
    title: "Pato Vs Cops",
    category: "racing",
    description: "by GMG",
    thumbnail: gdThumb("fff2efce32324f56a3e9d59ddb42cf1b"),
    embedUrl:
      "https://html5.gamedistribution.com/fff2efce32324f56a3e9d59ddb42cf1b",
    aspectRatio: "4/3",
  },
  {
    id: "d4a7c2d0d8914a888912ca21d0e20ae7",
    title: "Power Puzzle",
    category: "puzzle",
    description: "by HDCorp",
    thumbnail: gdThumb("d4a7c2d0d8914a888912ca21d0e20ae7"),
    embedUrl:
      "https://html5.gamedistribution.com/d4a7c2d0d8914a888912ca21d0e20ae7",
    aspectRatio: "16/9",
  },
  {
    id: "dc0290265efc4df58436136b8a8b0b52",
    title: "Match Dream Garden",
    category: "puzzle",
    description: "by Inlogic Software",
    thumbnail: gdThumb("dc0290265efc4df58436136b8a8b0b52"),
    embedUrl:
      "https://html5.gamedistribution.com/dc0290265efc4df58436136b8a8b0b52",
    aspectRatio: "4/3",
  },
  {
    id: "9dc3a58253534d52ad8be29b14c86fa9",
    title: "Belote 3in1",
    category: "casual",
    description: "by Playades International LLC",
    thumbnail: gdThumb("9dc3a58253534d52ad8be29b14c86fa9"),
    embedUrl:
      "https://html5.gamedistribution.com/9dc3a58253534d52ad8be29b14c86fa9",
    aspectRatio: "4/3",
  },
  {
    id: "966d94f902de491eb224711f51d7a92e",
    title: "Dogs vs Aliens",
    category: "arcade",
    description: "by Square Dino LLC",
    thumbnail: gdThumb("966d94f902de491eb224711f51d7a92e"),
    embedUrl:
      "https://html5.gamedistribution.com/966d94f902de491eb224711f51d7a92e",
    aspectRatio: "4/3",
  },
  {
    id: "75c605af07684a719fd9ebbc552c246b",
    title: "TRIVIA NATION",
    category: "casual",
    description: "by BUSIDOL",
    thumbnail: gdThumb("75c605af07684a719fd9ebbc552c246b"),
    embedUrl:
      "https://html5.gamedistribution.com/75c605af07684a719fd9ebbc552c246b",
    aspectRatio: "16/9",
  },
  {
    id: "59c9c46de0c744e9ae989546e860d7e8",
    title: "Emoji Frenzy",
    category: "arcade",
    description: "by ArKeny",
    thumbnail: gdThumb("59c9c46de0c744e9ae989546e860d7e8"),
    embedUrl:
      "https://html5.gamedistribution.com/59c9c46de0c744e9ae989546e860d7e8",
    aspectRatio: "4/3",
  },
  {
    id: "109536c4ebad4fceb14224df11b0b158",
    title: "Oreplication",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("109536c4ebad4fceb14224df11b0b158"),
    embedUrl:
      "https://html5.gamedistribution.com/109536c4ebad4fceb14224df11b0b158",
    aspectRatio: "4/3",
  },
  {
    id: "26a55f4431144dd3a7230222c772e676",
    title: "Word Game 2026",
    category: "puzzle",
    description: "by Aman Bhai",
    thumbnail: gdThumb("26a55f4431144dd3a7230222c772e676"),
    embedUrl:
      "https://html5.gamedistribution.com/26a55f4431144dd3a7230222c772e676",
    aspectRatio: "9/16",
  },
  {
    id: "57e0f26d59df4e2a95c4ea779012310e",
    title: "Match Ten Number Puzzle",
    category: "puzzle",
    description: "by PuzzleGame.Com",
    thumbnail: gdThumb("57e0f26d59df4e2a95c4ea779012310e"),
    embedUrl:
      "https://html5.gamedistribution.com/57e0f26d59df4e2a95c4ea779012310e",
    aspectRatio: "9/16",
  },
  {
    id: "17113941a2f5409290016059b594d0b5",
    title: "Stick: Tactics & Destruction",
    category: "action",
    description: "by GamePush",
    thumbnail: gdThumb("17113941a2f5409290016059b594d0b5"),
    embedUrl:
      "https://html5.gamedistribution.com/17113941a2f5409290016059b594d0b5",
    aspectRatio: "4/3",
  },
  {
    id: "1561f24d736b4bf292e0ae33059f909f",
    title: "Bubble Pop Legend",
    category: "puzzle",
    description: "by Anna Inc",
    thumbnail: gdThumb("1561f24d736b4bf292e0ae33059f909f"),
    embedUrl:
      "https://html5.gamedistribution.com/1561f24d736b4bf292e0ae33059f909f",
    aspectRatio: "4/3",
  },
  {
    id: "24834535f13b4c7aa2b696bb62ec2685",
    title: "Zombie Rush",
    category: "action",
    description: "by SqueakyGamesInc",
    thumbnail: gdThumb("24834535f13b4c7aa2b696bb62ec2685"),
    embedUrl:
      "https://html5.gamedistribution.com/24834535f13b4c7aa2b696bb62ec2685",
    aspectRatio: "16/9",
  },
  {
    id: "82efd9293b264d2ebf2255857a4912e7",
    title: "Coin Blitz",
    category: "arcade",
    description: "by LevelKraft Technologies",
    thumbnail: gdThumb("82efd9293b264d2ebf2255857a4912e7"),
    embedUrl:
      "https://html5.gamedistribution.com/82efd9293b264d2ebf2255857a4912e7",
    aspectRatio: "16/9",
  },
  {
    id: "600319e8d5d94a41bb3374c726ba15fc",
    title: "Apocalypse Shelter",
    category: "strategy",
    description: "by GamePush",
    thumbnail: gdThumb("600319e8d5d94a41bb3374c726ba15fc"),
    embedUrl:
      "https://html5.gamedistribution.com/600319e8d5d94a41bb3374c726ba15fc",
    aspectRatio: "4/3",
  },
  {
    id: "504e7fdd353f469b95f1680e4f63b36b",
    title: "Snake Puzzle Escape",
    category: "puzzle",
    description: "by Extremesols",
    thumbnail: gdThumb("504e7fdd353f469b95f1680e4f63b36b"),
    embedUrl:
      "https://html5.gamedistribution.com/504e7fdd353f469b95f1680e4f63b36b",
    aspectRatio: "16/9",
  },
  {
    id: "95a7eb46911a48ae845dd8e58ea1dba2",
    title: "Car Parking Simulator",
    category: "racing",
    description: "by bestgames.com",
    thumbnail: gdThumb("95a7eb46911a48ae845dd8e58ea1dba2"),
    embedUrl:
      "https://html5.gamedistribution.com/95a7eb46911a48ae845dd8e58ea1dba2",
    aspectRatio: "16/9",
  },
  {
    id: "f9d0af2d87e644e68e65e0ea2184a0f7",
    title: "Ship & Fish",
    category: "arcade",
    description: "by KDS Group",
    thumbnail: gdThumb("f9d0af2d87e644e68e65e0ea2184a0f7"),
    embedUrl:
      "https://html5.gamedistribution.com/f9d0af2d87e644e68e65e0ea2184a0f7",
    aspectRatio: "4/3",
  },
  {
    id: "a71168b1feb94d4bbeb466d22c292b53",
    title: "Caterfall 2048",
    category: "puzzle",
    description: "by GamePush",
    thumbnail: gdThumb("a71168b1feb94d4bbeb466d22c292b53"),
    embedUrl:
      "https://html5.gamedistribution.com/a71168b1feb94d4bbeb466d22c292b53",
    aspectRatio: "4/3",
  },
  {
    id: "9a4cfbdbd33b4b028a69b908699502eb",
    title: "Obby Champions",
    category: "action",
    description: "by Mirra Games",
    thumbnail: gdThumb("9a4cfbdbd33b4b028a69b908699502eb"),
    embedUrl:
      "https://html5.gamedistribution.com/9a4cfbdbd33b4b028a69b908699502eb",
    aspectRatio: "4/3",
  },
  {
    id: "1abaea29fe734e8ba27448bc7a9c3422",
    title: "Wool Sorting",
    category: "puzzle",
    description: "by SecGame",
    thumbnail: gdThumb("1abaea29fe734e8ba27448bc7a9c3422"),
    embedUrl:
      "https://html5.gamedistribution.com/1abaea29fe734e8ba27448bc7a9c3422",
    aspectRatio: "4/3",
  },
  {
    id: "1623f11ab941461899f9146501c36d9e",
    title: "Tap Bead",
    category: "puzzle",
    description: "by Guangzhou Yomitoo Network Technology Co., Ltd.",
    thumbnail: gdThumb("1623f11ab941461899f9146501c36d9e"),
    embedUrl:
      "https://html5.gamedistribution.com/1623f11ab941461899f9146501c36d9e",
    aspectRatio: "9/16",
  },
  {
    id: "6ff158a48fed4f3aa40877422662a71a",
    title: "Ninja Survivor",
    category: "action",
    description: "by Mirra Games",
    thumbnail: gdThumb("6ff158a48fed4f3aa40877422662a71a"),
    embedUrl:
      "https://html5.gamedistribution.com/6ff158a48fed4f3aa40877422662a71a",
    aspectRatio: "4/3",
  },
  {
    id: "d882b7ce8c7145c5b20bef128bd2fabf",
    title: "Solitaire Summer: Klondike",
    category: "casual",
    description: "by Playades International LLC",
    thumbnail: gdThumb("d882b7ce8c7145c5b20bef128bd2fabf"),
    embedUrl:
      "https://html5.gamedistribution.com/d882b7ce8c7145c5b20bef128bd2fabf",
    aspectRatio: "4/3",
  },
  {
    id: "ca808ce686fa485c81fcf487ef65cac1",
    title: "Office Pyramid Solitaire",
    category: "casual",
    description: "by Sanoma",
    thumbnail: gdThumb("ca808ce686fa485c81fcf487ef65cac1"),
    embedUrl:
      "https://html5.gamedistribution.com/ca808ce686fa485c81fcf487ef65cac1",
    aspectRatio: "4/3",
  },
  {
    id: "c6d324c4729f48ef9a3cd8882bdf078e",
    title: "Jungle Match Adventures",
    category: "puzzle",
    description: "by SOFTGAMES – Mobile Entertainment Services GmbH",
    thumbnail: gdThumb("c6d324c4729f48ef9a3cd8882bdf078e"),
    embedUrl:
      "https://html5.gamedistribution.com/c6d324c4729f48ef9a3cd8882bdf078e",
    aspectRatio: "4/3",
  },
  {
    id: "4254dba037de4b798541d2c97eae5016",
    title: "Fruit Match",
    category: "puzzle",
    description: "by GameBerry Studio",
    thumbnail: gdThumb("4254dba037de4b798541d2c97eae5016"),
    embedUrl:
      "https://html5.gamedistribution.com/4254dba037de4b798541d2c97eae5016",
    aspectRatio: "4/3",
  },
  {
    id: "91028829ed0c4d2aba1f0e1fb537733b",
    title: "Mine Quest Daily",
    category: "puzzle",
    description: "by Denda Games",
    thumbnail: gdThumb("91028829ed0c4d2aba1f0e1fb537733b"),
    embedUrl:
      "https://html5.gamedistribution.com/91028829ed0c4d2aba1f0e1fb537733b",
    aspectRatio: "9/16",
  },
  {
    id: "780bdf6c7e3244ed9237d175f6c099db",
    title: "Royal Pin",
    category: "arcade",
    description: "by Gamee JSC",
    thumbnail: gdThumb("780bdf6c7e3244ed9237d175f6c099db"),
    embedUrl:
      "https://html5.gamedistribution.com/780bdf6c7e3244ed9237d175f6c099db",
    aspectRatio: "9/16",
  },
  {
    id: "74d4566d990d431ab7e58166f3fc3d2d",
    title: "Game 46",
    category: "arcade",
    thumbnail: gdThumb("74d4566d990d431ab7e58166f3fc3d2d"),
    embedUrl:
      "https://html5.gamedistribution.com/74d4566d990d431ab7e58166f3fc3d2d",
    aspectRatio: "16/9",
  },
  {
    id: "d9a1e7343c9642988d8ec4623df4196c",
    title: "Game 47",
    category: "arcade",
    thumbnail: gdThumb("d9a1e7343c9642988d8ec4623df4196c"),
    embedUrl:
      "https://html5.gamedistribution.com/d9a1e7343c9642988d8ec4623df4196c",
    aspectRatio: "9/16",
  },
  {
    id: "77183764be80432a90acd34174f4dade",
    title: "Game 48",
    category: "arcade",
    thumbnail: gdThumb("77183764be80432a90acd34174f4dade"),
    embedUrl:
      "https://html5.gamedistribution.com/77183764be80432a90acd34174f4dade",
    aspectRatio: "9/16",
  },
  {
    id: "141b948c1f5c4476acc673d84f2ad1c0",
    title: "Game 49",
    category: "puzzle",
    thumbnail: gdThumb("141b948c1f5c4476acc673d84f2ad1c0"),
    embedUrl:
      "https://html5.gamedistribution.com/141b948c1f5c4476acc673d84f2ad1c0",
    aspectRatio: "4/3",
  },
  {
    id: "73d8b722929e42d192795617dc4dd372",
    title: "Game 50",
    category: "arcade",
    thumbnail: gdThumb("73d8b722929e42d192795617dc4dd372"),
    embedUrl:
      "https://html5.gamedistribution.com/73d8b722929e42d192795617dc4dd372",
    aspectRatio: "16/9",
  },
  {
    id: "69507828a2d441b781740ecff532057a",
    title: "Game 51",
    category: "puzzle",
    thumbnail: gdThumb("69507828a2d441b781740ecff532057a"),
    embedUrl:
      "https://html5.gamedistribution.com/69507828a2d441b781740ecff532057a",
    aspectRatio: "4/3",
  },
  {
    id: "96f82746df35411e81a1227bc9fbd798",
    title: "Game 52",
    category: "arcade",
    thumbnail: gdThumb("96f82746df35411e81a1227bc9fbd798"),
    embedUrl:
      "https://html5.gamedistribution.com/96f82746df35411e81a1227bc9fbd798",
    aspectRatio: "16/9",
  },
  {
    id: "92f19fdd8fe24ff18cfb3a07799c7114",
    title: "Game 53",
    category: "puzzle",
    thumbnail: gdThumb("92f19fdd8fe24ff18cfb3a07799c7114"),
    embedUrl:
      "https://html5.gamedistribution.com/92f19fdd8fe24ff18cfb3a07799c7114",
    aspectRatio: "4/3",
  },
  {
    id: "5a89e945969e4b2fbb3ecb661d4c64ba",
    title: "Game 54",
    category: "arcade",
    thumbnail: gdThumb("5a89e945969e4b2fbb3ecb661d4c64ba"),
    embedUrl:
      "https://html5.gamedistribution.com/5a89e945969e4b2fbb3ecb661d4c64ba",
    aspectRatio: "9/16",
  },
  {
    id: "e8b6cc385eda4a869e2c450e5a5bcc16",
    title: "Game 55",
    category: "arcade",
    thumbnail: gdThumb("e8b6cc385eda4a869e2c450e5a5bcc16"),
    embedUrl:
      "https://html5.gamedistribution.com/e8b6cc385eda4a869e2c450e5a5bcc16",
    aspectRatio: "4/3",
  },
  {
    id: "496b8e15e117418f8e9b80601470c5e8",
    title: "Game 56",
    category: "puzzle",
    thumbnail: gdThumb("496b8e15e117418f8e9b80601470c5e8"),
    embedUrl:
      "https://html5.gamedistribution.com/496b8e15e117418f8e9b80601470c5e8",
    aspectRatio: "4/3",
  },
  {
    id: "b7c6b58e8a0841f984c2be418d3299d4",
    title: "Game 57",
    category: "arcade",
    thumbnail: gdThumb("b7c6b58e8a0841f984c2be418d3299d4"),
    embedUrl:
      "https://html5.gamedistribution.com/b7c6b58e8a0841f984c2be418d3299d4",
    aspectRatio: "9/16",
  },
  {
    id: "77958ea5d573469e867c16c5f7e0e6d8",
    title: "Game 58",
    category: "arcade",
    thumbnail: gdThumb("77958ea5d573469e867c16c5f7e0e6d8"),
    embedUrl:
      "https://html5.gamedistribution.com/77958ea5d573469e867c16c5f7e0e6d8",
    aspectRatio: "4/3",
  },
  {
    id: "c708e45f672c4c32b1769859d3da499d",
    title: "Game 59",
    category: "puzzle",
    thumbnail: gdThumb("c708e45f672c4c32b1769859d3da499d"),
    embedUrl:
      "https://html5.gamedistribution.com/c708e45f672c4c32b1769859d3da499d",
    aspectRatio: "4/3",
  },
  {
    id: "3b187941ce7941e8bf379e7ec3a53747",
    title: "Game 60",
    category: "arcade",
    thumbnail: gdThumb("3b187941ce7941e8bf379e7ec3a53747"),
    embedUrl:
      "https://html5.gamedistribution.com/3b187941ce7941e8bf379e7ec3a53747",
    aspectRatio: "4/3",
  },
  {
    id: "e35a1c652fcb47ec9b331a97d4704c33",
    title: "Game 61",
    category: "action",
    thumbnail: gdThumb("e35a1c652fcb47ec9b331a97d4704c33"),
    embedUrl:
      "https://html5.gamedistribution.com/e35a1c652fcb47ec9b331a97d4704c33",
    aspectRatio: "16/9",
  },
  {
    id: "8bd8d8dc794c4bf0b3e04e3f8ca4203f",
    title: "Game 62",
    category: "arcade",
    thumbnail: gdThumb("8bd8d8dc794c4bf0b3e04e3f8ca4203f"),
    embedUrl:
      "https://html5.gamedistribution.com/8bd8d8dc794c4bf0b3e04e3f8ca4203f",
    aspectRatio: "9/16",
  },
  {
    id: "d83a6203efec418084fc93da189e0abb",
    title: "Game 63",
    category: "arcade",
    thumbnail: gdThumb("d83a6203efec418084fc93da189e0abb"),
    embedUrl:
      "https://html5.gamedistribution.com/d83a6203efec418084fc93da189e0abb",
    aspectRatio: "16/9",
  },
  {
    id: "c07ca66b157144bfb03ba69e7bbf5156",
    title: "Garten Of BanBan 1 Escape",
    category: "arcade",
    thumbnail: gdThumb("c07ca66b157144bfb03ba69e7bbf5156"),
    embedUrl:
      "https://html5.gamedistribution.com/c07ca66b157144bfb03ba69e7bbf5156",
    aspectRatio: "4/3",
  },
  {
    id: "8c85fb2b116f4299927e33071c852847",
    title: "Artillery Vs Tanks",
    category: "action",
    thumbnail: gdThumb("8c85fb2b116f4299927e33071c852847"),
    embedUrl:
      "https://html5.gamedistribution.com/8c85fb2b116f4299927e33071c852847",
    aspectRatio: "4/3",
  },
  {
    id: "7cb8b1ed1f174128bb7da70c7fb14361",
    title: "Merge Blocks 2048",
    category: "puzzle",
    thumbnail: gdThumb("7cb8b1ed1f174128bb7da70c7fb14361"),
    embedUrl:
      "https://html5.gamedistribution.com/7cb8b1ed1f174128bb7da70c7fb14361",
    aspectRatio: "4/3",
  },
  {
    id: "644044c3831d4d77a6cee53e6b9d01c9",
    title: "Fruite Swipe",
    category: "puzzle",
    thumbnail: gdThumb("644044c3831d4d77a6cee53e6b9d01c9"),
    embedUrl:
      "https://html5.gamedistribution.com/644044c3831d4d77a6cee53e6b9d01c9",
    aspectRatio: "16/9",
  },
  {
    id: "80a3f1d615d1414ea4eaace523d94056",
    title: "Treasure Hunt Puzzle",
    category: "puzzle",
    thumbnail: gdThumb("80a3f1d615d1414ea4eaace523d94056"),
    embedUrl:
      "https://html5.gamedistribution.com/80a3f1d615d1414ea4eaace523d94056",
    aspectRatio: "9/16",
  },
  {
    id: "c61be3d80a54455a908a44a1ea7087fb",
    title: "Meme Mukbang ASMR Game",
    category: "arcade",
    thumbnail: gdThumb("c61be3d80a54455a908a44a1ea7087fb"),
    embedUrl:
      "https://html5.gamedistribution.com/c61be3d80a54455a908a44a1ea7087fb",
    aspectRatio: "9/16",
  },
  {
    id: "6465ba06644349ccab4cdd4e65196aef",
    title: "Obby Rescue Pin",
    category: "arcade",
    thumbnail: gdThumb("6465ba06644349ccab4cdd4e65196aef"),
    embedUrl:
      "https://html5.gamedistribution.com/6465ba06644349ccab4cdd4e65196aef",
    aspectRatio: "9/16",
  },
  {
    id: "c51a61ffce8044a6b1333575047534f3",
    title: "Reach 2048",
    category: "puzzle",
    thumbnail: gdThumb("c51a61ffce8044a6b1333575047534f3"),
    embedUrl:
      "https://html5.gamedistribution.com/c51a61ffce8044a6b1333575047534f3",
    aspectRatio: "16/9",
  },
  {
    id: "fbcdbc6cbf174116a48aa3c297b45bf8",
    title: "Solitaire Farm Seasons 3",
    category: "puzzle",
    thumbnail: gdThumb("fbcdbc6cbf174116a48aa3c297b45bf8"),
    embedUrl:
      "https://html5.gamedistribution.com/fbcdbc6cbf174116a48aa3c297b45bf8",
    aspectRatio: "4/3",
  },
  {
    id: "ed99a63b0a35407792cbd1f93b7b7b83",
    title: "ColorWars.io - Conquest Game",
    category: "action",
    thumbnail: gdThumb("ed99a63b0a35407792cbd1f93b7b7b83"),
    embedUrl:
      "https://html5.gamedistribution.com/ed99a63b0a35407792cbd1f93b7b7b83",
    aspectRatio: "4/3",
  },
  {
    id: "9fc92d0c20434f779cfb934aa7e5fa33",
    title: "Bus Escape: Clear Jam",
    category: "puzzle",
    thumbnail: gdThumb("9fc92d0c20434f779cfb934aa7e5fa33"),
    embedUrl:
      "https://html5.gamedistribution.com/9fc92d0c20434f779cfb934aa7e5fa33",
    aspectRatio: "16/9",
  },
  {
    id: "139b8e0290914556898663a6f2311817",
    title: "Candy Jewels",
    category: "puzzle",
    thumbnail: gdThumb("139b8e0290914556898663a6f2311817"),
    embedUrl:
      "https://html5.gamedistribution.com/139b8e0290914556898663a6f2311817",
    aspectRatio: "4/3",
  },
  {
    id: "92211d47448849d189bbc32d0d4d8f6f",
    title: "Grand Mahjong Connect",
    category: "puzzle",
    thumbnail: gdThumb("92211d47448849d189bbc32d0d4d8f6f"),
    embedUrl:
      "https://html5.gamedistribution.com/92211d47448849d189bbc32d0d4d8f6f",
    aspectRatio: "4/3",
  },
  {
    id: "b230a24fa8f14fb3a3a595f9e797feb3",
    title: "Anime Couple: Avatar Maker",
    category: "girls",
    thumbnail: gdThumb("b230a24fa8f14fb3a3a595f9e797feb3"),
    embedUrl:
      "https://html5.gamedistribution.com/b230a24fa8f14fb3a3a595f9e797feb3",
    aspectRatio: "9/16",
  },
  {
    id: "f5fa6153725e42e69e4b0de40d2ef9c7",
    title: "Fruit Match Juicy Puzzle",
    category: "puzzle",
    thumbnail: gdThumb("f5fa6153725e42e69e4b0de40d2ef9c7"),
    embedUrl:
      "https://html5.gamedistribution.com/f5fa6153725e42e69e4b0de40d2ef9c7",
    aspectRatio: "9/16",
  },
  {
    id: "9ffaf2fb134844958788642d2f76c6cd",
    title: "Block Escape",
    category: "puzzle",
    thumbnail: gdThumb("9ffaf2fb134844958788642d2f76c6cd"),
    embedUrl:
      "https://html5.gamedistribution.com/9ffaf2fb134844958788642d2f76c6cd",
    aspectRatio: "9/16",
  },
  {
    id: "9f201fb381ab42efbcc0530f9990f777",
    title: "Emoji Guess",
    category: "puzzle",
    thumbnail: gdThumb("9f201fb381ab42efbcc0530f9990f777"),
    embedUrl:
      "https://html5.gamedistribution.com/9f201fb381ab42efbcc0530f9990f777",
    aspectRatio: "4/3",
  },
  {
    id: "82e9077372484a82ab196e2e38c7efc6",
    title: "Sudo Tetroid Daily",
    category: "puzzle",
    thumbnail: gdThumb("82e9077372484a82ab196e2e38c7efc6"),
    embedUrl:
      "https://html5.gamedistribution.com/82e9077372484a82ab196e2e38c7efc6",
    aspectRatio: "9/16",
  },
  {
    id: "04bfaeb994ba4c38bd977a7082a7f07c",
    title: "Mojicon Garden Connect",
    category: "puzzle",
    thumbnail: gdThumb("04bfaeb994ba4c38bd977a7082a7f07c"),
    embedUrl:
      "https://html5.gamedistribution.com/04bfaeb994ba4c38bd977a7082a7f07c",
    aspectRatio: "4/3",
  },
  {
    id: "ce1b2e5eabe44debb11bf77cd04c0f85",
    title: "Vex X3M 3",
    category: "action",
    thumbnail: gdThumb("ce1b2e5eabe44debb11bf77cd04c0f85"),
    embedUrl:
      "https://html5.gamedistribution.com/ce1b2e5eabe44debb11bf77cd04c0f85",
    aspectRatio: "4/3",
  },
  {
    id: "a33aed73c90f428da97f4772503b50eb",
    title: "Doodle Dino Run",
    category: "action",
    thumbnail: gdThumb("a33aed73c90f428da97f4772503b50eb"),
    embedUrl:
      "https://html5.gamedistribution.com/a33aed73c90f428da97f4772503b50eb",
    aspectRatio: "16/9",
  },
  {
    id: "9f82549300b14817a917bfca75210fd0",
    title: "City Tower Builder",
    category: "puzzle",
    thumbnail: gdThumb("9f82549300b14817a917bfca75210fd0"),
    embedUrl:
      "https://html5.gamedistribution.com/9f82549300b14817a917bfca75210fd0",
    aspectRatio: "4/3",
  },
  {
    id: "09fd115d31734cb0bbab0e58fa6e4a1b",
    title: "Office Spider Solitaire",
    category: "puzzle",
    thumbnail: gdThumb("09fd115d31734cb0bbab0e58fa6e4a1b"),
    embedUrl:
      "https://html5.gamedistribution.com/09fd115d31734cb0bbab0e58fa6e4a1b",
    aspectRatio: "4/3",
  },
  {
    id: "efa7f45d308f48e9a3f3dc641b83556c",
    title: "Obby - Escape Barry's Jail Parkour",
    category: "action",
    thumbnail: gdThumb("efa7f45d308f48e9a3f3dc641b83556c"),
    embedUrl:
      "https://html5.gamedistribution.com/efa7f45d308f48e9a3f3dc641b83556c",
    aspectRatio: "4/3",
  },
  {
    id: "3bbe72ba374644f5b7360a993fa8bc46",
    title: "Closed City",
    category: "action",
    thumbnail: gdThumb("3bbe72ba374644f5b7360a993fa8bc46"),
    embedUrl:
      "https://html5.gamedistribution.com/3bbe72ba374644f5b7360a993fa8bc46",
    aspectRatio: "4/3",
  },
  {
    id: "ab572c1e1dc04e4499da4db26e768286",
    title: "Office Solitaire",
    category: "puzzle",
    thumbnail: gdThumb("ab572c1e1dc04e4499da4db26e768286"),
    embedUrl:
      "https://html5.gamedistribution.com/ab572c1e1dc04e4499da4db26e768286",
    aspectRatio: "4/3",
  },
  {
    id: "63e4110fb71d4588a8f4b6081fea5bdb",
    title: "Cooking Empire",
    category: "puzzle",
    thumbnail: gdThumb("63e4110fb71d4588a8f4b6081fea5bdb"),
    embedUrl:
      "https://html5.gamedistribution.com/63e4110fb71d4588a8f4b6081fea5bdb",
    aspectRatio: "4/3",
  },
  {
    id: "cfa73398f23a40feaed85292ab9ae51d",
    title: "PaperWar.io",
    category: "action",
    thumbnail: gdThumb("cfa73398f23a40feaed85292ab9ae51d"),
    embedUrl:
      "https://html5.gamedistribution.com/cfa73398f23a40feaed85292ab9ae51d",
    aspectRatio: "4/3",
  },
  {
    id: "b5c96767c4484a959e6154fc64a73144",
    title: "Logic Storm: Animals Puzzle",
    category: "puzzle",
    thumbnail: gdThumb("b5c96767c4484a959e6154fc64a73144"),
    embedUrl:
      "https://html5.gamedistribution.com/b5c96767c4484a959e6154fc64a73144",
    aspectRatio: "16/9",
  },
  {
    id: "63cf93e7b28a43f2a781bafa61cf5307",
    title: "Super Ninja Balloon",
    category: "action",
    thumbnail: gdThumb("63cf93e7b28a43f2a781bafa61cf5307"),
    embedUrl:
      "https://html5.gamedistribution.com/63cf93e7b28a43f2a781bafa61cf5307",
    aspectRatio: "9/16",
  },
  {
    id: "6eff71bc2e824830be09d6a78b967c20",
    title: "Pubg Hack",
    category: "action",
    thumbnail: gdThumb("6eff71bc2e824830be09d6a78b967c20"),
    embedUrl:
      "https://html5.gamedistribution.com/6eff71bc2e824830be09d6a78b967c20",
    aspectRatio: "16/9",
  },
  {
    id: "7fcb55f25f4a4a07848c630dffe1ae6e",
    title: "67 Clicker Tap Tap",
    category: "puzzle",
    thumbnail: gdThumb("7fcb55f25f4a4a07848c630dffe1ae6e"),
    embedUrl:
      "https://html5.gamedistribution.com/7fcb55f25f4a4a07848c630dffe1ae6e",
    aspectRatio: "16/9",
  },
  {
    id: "040ff13a2a9f44b98009750960a523ae",
    title: "World Cup Soccer Caps",
    category: "sports",
    thumbnail: gdThumb("040ff13a2a9f44b98009750960a523ae"),
    embedUrl:
      "https://html5.gamedistribution.com/040ff13a2a9f44b98009750960a523ae",
    aspectRatio: "16/9",
  },
  {
    id: "5a0b0fc8fd1e48468fe289997085b0bb",
    title: "Jungle Solitaire",
    category: "puzzle",
    thumbnail: gdThumb("5a0b0fc8fd1e48468fe289997085b0bb"),
    embedUrl:
      "https://html5.gamedistribution.com/5a0b0fc8fd1e48468fe289997085b0bb",
    aspectRatio: "4/3",
  },
  {
    id: "81eb4f30ea604c2dba1c486c27d7744f",
    title: "PopSortica",
    category: "puzzle",
    thumbnail: gdThumb("81eb4f30ea604c2dba1c486c27d7744f"),
    embedUrl:
      "https://html5.gamedistribution.com/81eb4f30ea604c2dba1c486c27d7744f",
    aspectRatio: "4/3",
  },
  {
    id: "ecc90172a5a8427b85f6b1b75e5306e7",
    title: "Slingshot Fortress",
    category: "action",
    thumbnail: gdThumb("ecc90172a5a8427b85f6b1b75e5306e7"),
    embedUrl:
      "https://html5.gamedistribution.com/ecc90172a5a8427b85f6b1b75e5306e7",
    aspectRatio: "4/3",
  },
  {
    id: "d70eb84a934f4a6aa9e574bb3629bbfb",
    title: "Worm Escape",
    category: "puzzle",
    thumbnail: gdThumb("d70eb84a934f4a6aa9e574bb3629bbfb"),
    embedUrl:
      "https://html5.gamedistribution.com/d70eb84a934f4a6aa9e574bb3629bbfb",
    aspectRatio: "4/3",
  },
  {
    id: "b1d11769f6754c14ad36e726b998bbc5",
    title: "My Castle. Merge & Story",
    category: "puzzle",
    thumbnail: gdThumb("b1d11769f6754c14ad36e726b998bbc5"),
    embedUrl:
      "https://html5.gamedistribution.com/b1d11769f6754c14ad36e726b998bbc5",
    aspectRatio: "4/3",
  },
  {
    id: "3521ba73a1694cc2abf79a510b1e98ce",
    title: "Darling Doll",
    category: "girls",
    thumbnail: gdThumb("3521ba73a1694cc2abf79a510b1e98ce"),
    embedUrl:
      "https://html5.gamedistribution.com/3521ba73a1694cc2abf79a510b1e98ce",
    aspectRatio: "9/16",
  },
  {
    id: "bece97115f26426491fa08e409e545aa",
    title: "Fish Out of Water!",
    category: "action",
    thumbnail: gdThumb("bece97115f26426491fa08e409e545aa"),
    embedUrl:
      "https://html5.gamedistribution.com/bece97115f26426491fa08e409e545aa",
    aspectRatio: "4/3",
  },
  {
    id: "4217557d28cc4038b6822767a09b79e3",
    title: "Ludo Star",
    category: "puzzle",
    thumbnail: gdThumb("4217557d28cc4038b6822767a09b79e3"),
    embedUrl:
      "https://html5.gamedistribution.com/4217557d28cc4038b6822767a09b79e3",
    aspectRatio: "4/3",
  },
  {
    id: "d60f8c65c1f64c838d6aa490ed5c649d",
    title: "Park Me: Draw Path",
    category: "racing",
    thumbnail: gdThumb("d60f8c65c1f64c838d6aa490ed5c649d"),
    embedUrl:
      "https://html5.gamedistribution.com/d60f8c65c1f64c838d6aa490ed5c649d",
    aspectRatio: "16/9",
  },
  {
    id: "0340635cab9e421ca6c3cda5acaa03f1",
    title: "Bloons Survival.io",
    category: "action",
    thumbnail: gdThumb("0340635cab9e421ca6c3cda5acaa03f1"),
    embedUrl:
      "https://html5.gamedistribution.com/0340635cab9e421ca6c3cda5acaa03f1",
    aspectRatio: "4/3",
  },
  {
    id: "6d334740fa9245898dba6281e2766ee1",
    title: "Sudoblock Daily",
    category: "puzzle",
    thumbnail: gdThumb("6d334740fa9245898dba6281e2766ee1"),
    embedUrl:
      "https://html5.gamedistribution.com/6d334740fa9245898dba6281e2766ee1",
    aspectRatio: "9/16",
  },
  {
    id: "13eabea86f7c4cd993a156258420e9ec",
    title: "Football Legends 2026",
    category: "sports",
    thumbnail: gdThumb("13eabea86f7c4cd993a156258420e9ec"),
    embedUrl:
      "https://html5.gamedistribution.com/13eabea86f7c4cd993a156258420e9ec",
    aspectRatio: "16/9",
  },
  {
    id: "ac3276e1819644858f0c8693c219064c",
    title: "Hexa Stack",
    category: "puzzle",
    thumbnail: gdThumb("ac3276e1819644858f0c8693c219064c"),
    embedUrl:
      "https://html5.gamedistribution.com/ac3276e1819644858f0c8693c219064c",
    aspectRatio: "4/3",
  },
  {
    id: "1ab4aa63ba214e85bda2c11aa5653ed8",
    title: "Fruit Merge Arena",
    category: "puzzle",
    thumbnail: gdThumb("1ab4aa63ba214e85bda2c11aa5653ed8"),
    embedUrl:
      "https://html5.gamedistribution.com/1ab4aa63ba214e85bda2c11aa5653ed8",
    aspectRatio: "9/16",
  },
  {
    id: "d12e86faf8f4439aa45389a10cec4592",
    title: "Jump to the Mountain for the Brainrots",
    category: "action",
    thumbnail: gdThumb("d12e86faf8f4439aa45389a10cec4592"),
    embedUrl:
      "https://html5.gamedistribution.com/d12e86faf8f4439aa45389a10cec4592",
    aspectRatio: "16/9",
  },
  {
    id: "96990bc0c10949bab8d1d5c844eb5b7f",
    title: "Mobile Phone Case Design & DIY",
    category: "girls",
    thumbnail: gdThumb("96990bc0c10949bab8d1d5c844eb5b7f"),
    embedUrl:
      "https://html5.gamedistribution.com/96990bc0c10949bab8d1d5c844eb5b7f",
    aspectRatio: "9/16",
  },
  {
    id: "55e0e53f26824f0f8f689ac52f9009d7",
    title: "Theo Morini's Magical Resort",
    category: "adventure",
    thumbnail: gdThumb("55e0e53f26824f0f8f689ac52f9009d7"),
    embedUrl:
      "https://html5.gamedistribution.com/55e0e53f26824f0f8f689ac52f9009d7",
    aspectRatio: "4/3",
  },
  {
    id: "ddc451045f974781b9d60b60f20c81d4",
    title: "Word Stars",
    category: "puzzle",
    thumbnail: gdThumb("ddc451045f974781b9d60b60f20c81d4"),
    embedUrl: "https://html5.gamedistribution.com/ddc451045f974781b9d60b60f20c81d4",
    aspectRatio: "4/3",
  },
  {
    id: "d26337f400ff49869928d9994646457b",
    title: "Tank Challenge",
    category: "action",
    thumbnail: gdThumb("d26337f400ff49869928d9994646457b"),
    embedUrl: "https://html5.gamedistribution.com/d26337f400ff49869928d9994646457b",
    aspectRatio: "4/3",
  },
  {
    id: "d4a3629101574bc39bd8f9d1888ca58e",
    title: "Fireboy & Watergirl 7: and Friends",
    category: "adventure",
    thumbnail: gdThumb("d4a3629101574bc39bd8f9d1888ca58e"),
    embedUrl: "https://html5.gamedistribution.com/d4a3629101574bc39bd8f9d1888ca58e",
    aspectRatio: "16/9",
  },
  {
    id: "4e0bcf98b67346bf94f5642e01ebd691",
    title: "The Noob Aventures",
    category: "adventure",
    thumbnail: gdThumb("4e0bcf98b67346bf94f5642e01ebd691"),
    embedUrl: "https://html5.gamedistribution.com/4e0bcf98b67346bf94f5642e01ebd691",
    aspectRatio: "5/3",
  },
  {
    id: "f73be292c3d643d6a2488938dcc47007",
    title: "Goodeluxe",
    category: "puzzle",
    thumbnail: gdThumb("f73be292c3d643d6a2488938dcc47007"),
    embedUrl: "https://html5.gamedistribution.com/f73be292c3d643d6a2488938dcc47007",
    aspectRatio: "4/3",
  },
  {
    id: "43f45c8924824a1bbbb1c2bb6820d5ac",
    title: "Archers Ragdoll Physics",
    category: "action",
    thumbnail: gdThumb("43f45c8924824a1bbbb1c2bb6820d5ac"),
    embedUrl: "https://html5.gamedistribution.com/43f45c8924824a1bbbb1c2bb6820d5ac",
    aspectRatio: "16/9",
  },
  {
    id: "7ca746d71b7049df851999d2c0d554c9",
    title: "SuperPixelint",
    category: "puzzle",
    thumbnail: gdThumb("7ca746d71b7049df851999d2c0d554c9"),
    embedUrl: "https://html5.gamedistribution.com/7ca746d71b7049df851999d2c0d554c9",
    aspectRatio: "9/16",
  },
  {
    id: "6d6556f0c714498fbe8e5b24941f57bf",
    title: "Pixel Flow",
    category: "puzzle",
    thumbnail: gdThumb("6d6556f0c714498fbe8e5b24941f57bf"),
    embedUrl: "https://html5.gamedistribution.com/6d6556f0c714498fbe8e5b24941f57bf",
    aspectRatio: "2/1",
  },
  {
    id: "ebe613bf6d5b44ad8908c7a36a710b7b",
    title: "Smash Defense",
    category: "action",
    thumbnail: gdThumb("ebe613bf6d5b44ad8908c7a36a710b7b"),
    embedUrl: "https://html5.gamedistribution.com/ebe613bf6d5b44ad8908c7a36a710b7b",
    aspectRatio: "4/3",
  },
  {
    id: "75960014ad694866ac41e0919f0a5e73",
    title: "Merge Home Mania",
    category: "puzzle",
    thumbnail: gdThumb("75960014ad694866ac41e0919f0a5e73"),
    embedUrl: "https://html5.gamedistribution.com/75960014ad694866ac41e0919f0a5e73",
    aspectRatio: "4/3",
  },
];

export const getGDGamesByCategory = (cat: GDCategory) =>
  gdGames.filter((g) => g.category === cat);
