// Sample escape room data with real puzzles
// These can be replaced with AI-generated panoramas

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  usableOn?: string[];
}

interface PuzzleData {
  type: "code" | "riddle" | "sequence" | "cipher" | "combination";
  question: string;
  hint: string;
  answer: string;
  reward?: InventoryItem;
}

interface Hotspot {
  id: string;
  position: [number, number, number];
  type: "puzzle" | "item" | "door" | "clue" | "lock";
  label: string;
  description?: string;
  puzzle?: PuzzleData;
  item?: InventoryItem;
  requiredItem?: string;
  nextRoom?: number;
  solved?: boolean;
}

interface RoomData {
  id: number;
  name: string;
  description: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
}

// Helper to calculate 3D position from angles
const angleToPosition = (yaw: number, pitch: number, distance: number = 50): [number, number, number] => {
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  
  return [
    Math.sin(yawRad) * Math.cos(pitchRad) * distance,
    Math.sin(pitchRad) * distance,
    -Math.cos(yawRad) * Math.cos(pitchRad) * distance
  ];
};

// Mystery Detective Office Escape Room
export const mysteryDetectiveRooms: RoomData[] = [
  {
    id: 0,
    name: "Detektívna kancelária",
    description: "Vstúpil si do starej detektívnej kancelárie. Na stole leží nedokončený prípad...",
    panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2048",
    hotspots: [
      {
        id: "desk-drawer",
        position: angleToPosition(45, -15),
        type: "puzzle",
        label: "Zamknutá zásuvka",
        puzzle: {
          type: "code",
          question: "Zásuvka je zamknutá 4-ciferným kódom. Na kalendári je zakrúžkovaný dátum: 15. december. Aký je kód?",
          hint: "Dátum v číslach: deň a mesiac",
          answer: "1512",
          reward: {
            id: "magnifier",
            name: "Lupa",
            icon: "🔍",
            description: "Stará detektívna lupa. Možno odhalí skryté stopy."
          }
        }
      },
      {
        id: "bookshelf",
        position: angleToPosition(-60, 10),
        type: "clue",
        label: "Knižnica",
        description: "Medzi knihami nájdeš poznámku: 'Heslo je meno prvého prezidenta USA'"
      },
      {
        id: "safe",
        position: angleToPosition(180, -20),
        type: "lock",
        label: "Trezor",
        puzzle: {
          type: "riddle",
          question: "Zadaj heslo pre otvorenie trezoru. (Nápoveda: Pozri sa na knižnicu)",
          hint: "George...",
          answer: "washington",
          reward: {
            id: "key-gold",
            name: "Zlatý kľúč",
            icon: "🔑",
            description: "Ozdobný zlatý kľúč. Otvára hlavné dvere."
          }
        }
      },
      {
        id: "window",
        position: angleToPosition(-120, 20),
        type: "clue",
        label: "Okno",
        description: "Z okna vidíš tmavú uličku. Na skle je napísané 'ROMA' - ale zdá sa to byť zrkadlovo obrátené..."
      },
      {
        id: "exit-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Východ do chodby",
        requiredItem: "key-gold",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Tajná chodba",
    description: "Temná chodba s niekoľkými dverami. Jedna z nich vedie k úniku...",
    panoramaUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2048",
    hotspots: [
      {
        id: "painting",
        position: angleToPosition(90, 15),
        type: "puzzle",
        label: "Starý obraz",
        puzzle: {
          type: "cipher",
          question: "Pod obrazom je šifra: 'DPEFS'. Každé písmeno je posunuté o 1. Aké je skutočné slovo?",
          hint: "A→Z, B→A, C→B... posuň každé písmeno späť",
          answer: "CODES",
          reward: {
            id: "paper-code",
            name: "Papier s kódom",
            icon: "📜",
            description: "Papier s číslami: 7-3-9"
          }
        }
      },
      {
        id: "statue",
        position: angleToPosition(-45, -10),
        type: "item",
        label: "Socha",
        item: {
          id: "gem-red",
          name: "Červený drahokam",
          icon: "💎",
          description: "Trblietavý rubín. Zdá sa, že niekam patrí."
        }
      },
      {
        id: "locked-cabinet",
        position: angleToPosition(135, 0),
        type: "lock",
        label: "Zamknutá skrinka",
        puzzle: {
          type: "combination",
          question: "Skrinka má kombinačný zámok. Potrebuješ 3 čísla. (Pozri sa na papier s kódom)",
          hint: "Čísla z papiera, ktorý si našiel",
          answer: "739",
          reward: {
            id: "key-silver",
            name: "Strieborný kľúč",
            icon: "🗝️",
            description: "Strieborný kľúč s ozdobnou hlavou."
          }
        }
      },
      {
        id: "final-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Únikové dvere",
        requiredItem: "key-silver",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Miestnosť slobody",
    description: "Posledná miestnosť! Stačí vyriešiť poslednú hádanku a unikneš!",
    panoramaUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=2048",
    hotspots: [
      {
        id: "final-puzzle",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Posledná hádanka",
        puzzle: {
          type: "riddle",
          question: "Mám kľúče, ale žiadny zámok. Mám medzeru, ale žiadnu miestnosť. Môžeš vstúpiť, ale nemôžeš ísť von. Čo som?",
          hint: "Používaš to každý deň na počítači...",
          answer: "klavesnica"
        }
      },
      {
        id: "gem-slot",
        position: angleToPosition(60, -10),
        type: "lock",
        label: "Otvor pre drahokam",
        requiredItem: "gem-red",
        description: "Dvere sa otvorili! Rubín aktivoval mechanizmus."
      },
      {
        id: "escape-door",
        position: angleToPosition(-30, 0),
        type: "door",
        label: "ÚNIK!",
        nextRoom: 999 // Signals completion
      }
    ]
  }
];

// Horror Theme Rooms
export const horrorRooms: RoomData[] = [
  {
    id: 0,
    name: "Opustená nemocnica",
    description: "Prebúdzaš sa v starej opustenej nemocnici. Svetlá blikajú...",
    panoramaUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=2048",
    hotspots: [
      {
        id: "medical-chart",
        position: angleToPosition(30, 10),
        type: "puzzle",
        label: "Lekárska karta",
        puzzle: {
          type: "code",
          question: "Na karte je napísané: 'Pacient #666 - Izba 13'. Kombinácia je súčet týchto čísel.",
          hint: "666 + 13 = ?",
          answer: "679",
          reward: {
            id: "scalpel",
            name: "Skalpel",
            icon: "🔪",
            description: "Ostrý chirurgický nástroj. Môže prerezať niečo..."
          }
        }
      },
      {
        id: "body-bag",
        position: angleToPosition(-90, -20),
        type: "clue",
        label: "Čierny vak",
        description: "Na vaku je visačka: 'MORTE' - latinsky smrť. Posledné písmeno je E."
      },
      {
        id: "exit",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Núdzový východ",
        requiredItem: "scalpel",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Temná chodba",
    description: "Dlhá chodba plná tieňov. Počuješ kroky za sebou...",
    panoramaUrl: "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=2048",
    hotspots: [
      {
        id: "number-wall",
        position: angleToPosition(45, 0),
        type: "puzzle",
        label: "Čísla na stene",
        puzzle: {
          type: "sequence",
          question: "Na stene sú čísla: 2, 4, 8, 16, ?. Aké je ďalšie číslo?",
          hint: "Každé číslo je dvojnásobok predchádzajúceho",
          answer: "32",
          reward: {
            id: "key-rusty",
            name: "Hrdzavý kľúč",
            icon: "🗝️",
            description: "Starý hrdzavý kľúč. Ešte funguje."
          }
        }
      },
      {
        id: "final-escape",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Úniková brána",
        requiredItem: "key-rusty",
        nextRoom: 999
      }
    ]
  }
];

// Sci-Fi Theme Rooms
export const scifiRooms: RoomData[] = [
  {
    id: 0,
    name: "Vesmírna stanica",
    description: "Kyslík sa míňa. Musíš nájsť spôsob ako opustiť stanicu.",
    panoramaUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=2048",
    hotspots: [
      {
        id: "console",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Ovládací panel",
        puzzle: {
          type: "code",
          question: "Panel žiada prístupový kód. Nápoveda: 'Binárne: 101010'",
          hint: "Preveď binárne číslo 101010 na decimálne",
          answer: "42",
          reward: {
            id: "keycard",
            name: "Prístupová karta",
            icon: "💳",
            description: "Elektronická karta s modrým svetlom."
          }
        }
      },
      {
        id: "robot",
        position: angleToPosition(-60, -10),
        type: "clue",
        label: "Pokazený robot",
        description: "Robot opakuje: 'Pi... 3.14... Pi...' Možno je to nápoveda?"
      },
      {
        id: "airlock",
        position: angleToPosition(120, 5),
        type: "lock",
        label: "Vzduchová komora",
        puzzle: {
          type: "code",
          question: "Zadaj hodnotu Pi na 2 desatinné miesta (bez bodky)",
          hint: "3.14 → bez bodky",
          answer: "314"
        }
      },
      {
        id: "escape-pod",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Úniková kapsula",
        requiredItem: "keycard",
        nextRoom: 999
      }
    ]
  }
];

// Adventure Theme Rooms
export const adventureRooms: RoomData[] = [
  {
    id: 0,
    name: "Egyptská hrobka",
    description: "Prepadol si sa do starovekej hrobky faraóna...",
    panoramaUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=2048",
    hotspots: [
      {
        id: "hieroglyphs",
        position: angleToPosition(30, 20),
        type: "clue",
        label: "Hieroglyfy",
        description: "Staré písmo hovorí: 'Slnko vychádza na VÝCHODE'"
      },
      {
        id: "scarab",
        position: angleToPosition(-45, -15),
        type: "item",
        label: "Zlatý skarabeus",
        item: {
          id: "scarab",
          name: "Skarabeus",
          icon: "🪲",
          description: "Posvätný zlatý chrobák. Symbol večného života."
        }
      },
      {
        id: "sphinx-riddle",
        position: angleToPosition(90, 0),
        type: "puzzle",
        label: "Hádanka sfingy",
        puzzle: {
          type: "riddle",
          question: "Ráno chodím na štyroch, na obed na dvoch, večer na troch. Čo som?",
          hint: "Zamysli sa nad ľudským životom...",
          answer: "clovek",
          reward: {
            id: "ankh",
            name: "Ankh",
            icon: "☥",
            description: "Egyptský symbol života. Otvára hrobku."
          }
        }
      },
      {
        id: "tomb-door",
        position: angleToPosition(180, 0),
        type: "lock",
        label: "Dvere hrobky",
        requiredItem: "ankh",
        nextRoom: 999
      }
    ]
  }
];

// Fantasy Theme Rooms
export const fantasyRooms: RoomData[] = [
  {
    id: 0,
    name: "Čarodejníkova veža",
    description: "Si uväznený v magickej veži. Len správne kúzlo ťa oslobodí.",
    panoramaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2048",
    hotspots: [
      {
        id: "spellbook",
        position: angleToPosition(-30, 10),
        type: "clue",
        label: "Kniha kúziel",
        description: "Otvorená strana hovorí: 'Otváracie kúzlo má 11 písmen a končí na -MORA'"
      },
      {
        id: "crystal-ball",
        position: angleToPosition(60, 0),
        type: "puzzle",
        label: "Krištáľová guľa",
        puzzle: {
          type: "riddle",
          question: "Guľa žiari a pýta sa: 'Aké slovo z 11 písmen končiace na MORA otvára dvere?'",
          hint: "Známe kúzlo z Harryho Pottera na otváranie...",
          answer: "alohomora",
          reward: {
            id: "wand",
            name: "Čarovný prútik",
            icon: "🪄",
            description: "Prútik s jadrom z fénixovho pera."
          }
        }
      },
      {
        id: "potion",
        position: angleToPosition(-90, -20),
        type: "item",
        label: "Modrý elixír",
        item: {
          id: "potion-blue",
          name: "Elixír múdrosti",
          icon: "🧪",
          description: "Modrá tekutina. Dáva nápovedy."
        }
      },
      {
        id: "magic-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Magický portál",
        requiredItem: "wand",
        nextRoom: 999
      }
    ]
  }
];

// Map themes to rooms
export const themeRoomsMap: Record<string, RoomData[]> = {
  mystery: mysteryDetectiveRooms,
  horror: horrorRooms,
  "sci-fi": scifiRooms,
  adventure: adventureRooms,
  fantasy: fantasyRooms,
  educational: mysteryDetectiveRooms, // Default to mystery for now
  corporate: mysteryDetectiveRooms
};

export const getRoomsForTheme = (theme: string): RoomData[] => {
  return themeRoomsMap[theme] || mysteryDetectiveRooms;
};
