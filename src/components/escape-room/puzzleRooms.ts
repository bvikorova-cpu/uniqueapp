// Sample escape room data with real puzzles
// These can be replaced with AI-generated panoramas

import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  usableOn?: string[];
}

export interface PuzzleData {
  type: "code" | "riddle" | "sequence" | "cipher" | "combination";
  question: string;
  hint: string;
  answer: string;
  reward?: InventoryItem;
}

export interface Hotspot {
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

export interface RoomData {
  id: number;
  name: string;
  description: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
}

// Helper to calculate 3D position from angles
export const angleToPosition = (yaw: number, pitch: number, distance: number = 50): [number, number, number] => {
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  
  return [
    Math.sin(yawRad) * Math.cos(pitchRad) * distance,
    Math.sin(pitchRad) * distance,
    -Math.cos(yawRad) * Math.cos(pitchRad) * distance
  ];
};

// Function to generate AI panorama for a room
export const generateRoomPanorama = async (
  roomName: string, 
  theme: string, 
  description?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-escape-room-panorama', {
      body: { roomName, theme, description }
    });

    if (error) {
      console.error('Error generating panorama:', error);
      return null;
    }

    return data?.imageUrl || null;
  } catch (err) {
    console.error('Failed to generate panorama:', err);
    return null;
  }
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

// Horror Theme Rooms - 3 miestnosti
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
        id: "medicine-cabinet",
        position: angleToPosition(120, 5),
        type: "item",
        label: "Lekárnička",
        item: {
          id: "syringe",
          name: "Striekačka",
          icon: "💉",
          description: "Prázdna striekačka. Možno sa na niečo hodí."
        }
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
            id: "flashlight",
            name: "Baterka",
            icon: "🔦",
            description: "Slabá baterka. Osvetlí tmavé miesta."
          }
        }
      },
      {
        id: "blood-writing",
        position: angleToPosition(-60, 15),
        type: "clue",
        label: "Nápis krvou",
        description: "Na stene je napísané: 'BEŽI' - ale posledné písmeno je rozmazané. Bolo to I alebo U?"
      },
      {
        id: "corpse-hand",
        position: angleToPosition(90, -25),
        type: "puzzle",
        label: "Mŕtva ruka",
        puzzle: {
          type: "riddle",
          question: "Mŕtva ruka drží papier: 'Som živý bez dychu, studený ale horúci strachy. Čo som?'",
          hint: "Niečo mŕtve, čo sa hýbe...",
          answer: "zombie",
          reward: {
            id: "key-bloody",
            name: "Zakrvavený kľúč",
            icon: "🗝️",
            description: "Kľúč pokrytý zaschlou krvou."
          }
        }
      },
      {
        id: "morgue-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Dvere do márnice",
        requiredItem: "key-bloody",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Márnica",
    description: "Posledná miestnosť. Chladné vzduchy a ticho. Jediný spôsob von...",
    panoramaUrl: "https://images.unsplash.com/photo-1509248961725-aec71f4e848e?w=2048",
    hotspots: [
      {
        id: "autopsy-table",
        position: angleToPosition(30, -10),
        type: "puzzle",
        label: "Pitevný stôl",
        puzzle: {
          type: "cipher",
          question: "Na stole je správa: 'GSRH RH GSV VCR'. Je to Atbash šifra (A=Z, B=Y...). Čo to znamená?",
          hint: "THIS IS THE EX... preložené: TOTO JE VÝ...",
          answer: "exit"
        }
      },
      {
        id: "freezer-drawer",
        position: angleToPosition(-45, 0),
        type: "lock",
        label: "Mraziaca zásuvka",
        puzzle: {
          type: "code",
          question: "Zásuvka má 4-miestny kód. Nápoveda: 'Rok keď vznikla Frankenšteinova príšera'",
          hint: "Mary Shelley, 18...",
          answer: "1818",
          reward: {
            id: "key-exit",
            name: "Únikový kľúč",
            icon: "🔑",
            description: "Kľúč k slobode!"
          }
        }
      },
      {
        id: "ghost-message",
        position: angleToPosition(120, 20),
        type: "clue",
        label: "Duchov odkaz",
        description: "Na zahmleným skle sa objavuje text: 'Frankenstein... 1818...'"
      },
      {
        id: "final-escape",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Úniková brána",
        requiredItem: "key-exit",
        nextRoom: 999
      }
    ]
  }
];

// Sci-Fi Theme Rooms - 3 miestnosti
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
            id: "keycard-blue",
            name: "Modrá karta",
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
        id: "corridor-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Chodba stanice",
        requiredItem: "keycard-blue",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Laboratórium",
    description: "Vedecké laboratórium plné experimentov. Niektoré vyzerajú nebezpečne...",
    panoramaUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=2048",
    hotspots: [
      {
        id: "dna-helix",
        position: angleToPosition(45, 10),
        type: "puzzle",
        label: "DNA model",
        puzzle: {
          type: "riddle",
          question: "Koľko chromozómov má človek?",
          hint: "Je to párne číslo medzi 40 a 50...",
          answer: "46",
          reward: {
            id: "sample-tube",
            name: "Vzorka DNA",
            icon: "🧬",
            description: "Sklená skúmavka s DNA vzorkou."
          }
        }
      },
      {
        id: "periodic-table",
        position: angleToPosition(-30, 0),
        type: "clue",
        label: "Periodická tabuľka",
        description: "Niektoré prvky sú zvýraznené: Au (79), Ag (47), Cu (29). Súčet = 155"
      },
      {
        id: "chemical-safe",
        position: angleToPosition(90, -15),
        type: "lock",
        label: "Chemický trezor",
        puzzle: {
          type: "code",
          question: "Zadaj súčet atómových čísel Au + Ag + Cu",
          hint: "Pozri na periodickú tabuľku: 79 + 47 + 29",
          answer: "155",
          reward: {
            id: "keycard-red",
            name: "Červená karta",
            icon: "💳",
            description: "Prístupová karta vysokej úrovne."
          }
        }
      },
      {
        id: "alien-specimen",
        position: angleToPosition(-90, 5),
        type: "item",
        label: "Mimozemský exemplár",
        item: {
          id: "alien-crystal",
          name: "Mimozemský kryštál",
          icon: "💎",
          description: "Žiariaci kryštál z inej planéty."
        }
      },
      {
        id: "engine-room-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Strojovňa",
        requiredItem: "keycard-red",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Strojovňa",
    description: "Srdce stanice. Úniková kapsula je blízko, ale potrebuješ aktivovať motor.",
    panoramaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2048",
    hotspots: [
      {
        id: "engine-panel",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Hlavný motor",
        puzzle: {
          type: "sequence",
          question: "Sekvencia štartu: 1, 1, 2, 3, 5, 8, ?. Aké je ďalšie číslo?",
          hint: "Fibonacciho postupnosť - súčet predošlých dvoch",
          answer: "13"
        }
      },
      {
        id: "warp-core",
        position: angleToPosition(60, 10),
        type: "lock",
        label: "Warp jadro",
        puzzle: {
          type: "riddle",
          question: "Rýchlosť svetla v km/s (zaokrúhlene na tisíce)",
          hint: "Približne 300 000 km/s",
          answer: "300000",
          reward: {
            id: "warp-key",
            name: "Warp kľúč",
            icon: "⚡",
            description: "Aktivačný kľúč pre únikovú kapsulu."
          }
        }
      },
      {
        id: "hologram",
        position: angleToPosition(-60, 5),
        type: "clue",
        label: "Hologram kapitána",
        description: "Kapitán hovorí: 'Svetlo cestuje rýchlosťou 299 792 km/s... zaokrúhli na tisíce.'"
      },
      {
        id: "escape-pod",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Úniková kapsula",
        requiredItem: "warp-key",
        nextRoom: 999
      }
    ]
  }
];

// Adventure Theme Rooms - 3 miestnosti
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
        description: "Staré písmo hovorí: 'Slnko vychádza na VÝCHODE. Ra je boh slnka.'"
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
            id: "torch",
            name: "Fakľa",
            icon: "🔥",
            description: "Horiaca fakľa osvetľujúca cestu."
          }
        }
      },
      {
        id: "tomb-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Chodba hrobky",
        requiredItem: "torch",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Pokladnica faraóna",
    description: "Zlato a drahokamy všade naokolo, ale pozor na pascu!",
    panoramaUrl: "https://images.unsplash.com/photo-1553522991-71439aa62779?w=2048",
    hotspots: [
      {
        id: "golden-mask",
        position: angleToPosition(0, 5),
        type: "puzzle",
        label: "Zlatá maska",
        puzzle: {
          type: "code",
          question: "Maska Tutanchamóna. V ktorom roku bola objavená hrobka? (19XX)",
          hint: "Howard Carter ju objavil v roku 19..22",
          answer: "1922",
          reward: {
            id: "ankh",
            name: "Ankh",
            icon: "☥",
            description: "Egyptský symbol života."
          }
        }
      },
      {
        id: "treasure-chest",
        position: angleToPosition(-60, -10),
        type: "item",
        label: "Truhlica pokladov",
        item: {
          id: "ruby",
          name: "Rubín faraóna",
          icon: "💎",
          description: "Obrovský červený drahokam."
        }
      },
      {
        id: "trap-floor",
        position: angleToPosition(90, -20),
        type: "clue",
        label: "Podlahová pasca",
        description: "Na dlažbe je nápis: 'Len ten kto pozná rok objavu prejde'. Tutanchamón, 1922."
      },
      {
        id: "pyramid-lock",
        position: angleToPosition(45, 10),
        type: "lock",
        label: "Pyramídový zámok",
        requiredItem: "scarab",
        description: "Skarabeus aktivoval mechanizmus!"
      },
      {
        id: "inner-chamber",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Vnútorná komora",
        requiredItem: "ankh",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Sarkofágová sieň",
    description: "Posledná miestnosť. Sarkofág faraóna a tajný východ...",
    panoramaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=2048",
    hotspots: [
      {
        id: "sarcophagus",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Sarkofág",
        puzzle: {
          type: "cipher",
          question: "Na sarkofágu je: 'RA + ANUBIS = ?'. Koľko bohov spolu? Napíš slovom.",
          hint: "1 + 1 = 2, slovom...",
          answer: "dva"
        }
      },
      {
        id: "canopic-jars",
        position: angleToPosition(-45, -5),
        type: "puzzle",
        label: "Kanopy",
        puzzle: {
          type: "riddle",
          question: "Koľko kanop sa používalo na uloženie orgánov? (srdce, pľúca, žalúdok, črevá - ktoré NIE?)",
          hint: "Srdce zostávalo v tele, takže zvyšok...",
          answer: "4",
          reward: {
            id: "secret-map",
            name: "Tajná mapa",
            icon: "🗺️",
            description: "Mapa ukazuje tajný východ!"
          }
        }
      },
      {
        id: "wall-painting",
        position: angleToPosition(60, 15),
        type: "clue",
        label: "Nástenná maľba",
        description: "Maľba zobrazuje 4 nádoby - kanopy. Srdce faraóna zostávalo v tele."
      },
      {
        id: "secret-exit",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Tajný východ",
        requiredItem: "secret-map",
        nextRoom: 999
      }
    ]
  }
];

// Fantasy Theme Rooms - 3 miestnosti
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
        description: "Otvorená strana hovorí: 'Otváracie kúzlo má 9 písmen a začína na ALO-'"
      },
      {
        id: "crystal-ball",
        position: angleToPosition(60, 0),
        type: "puzzle",
        label: "Krištáľová guľa",
        puzzle: {
          type: "riddle",
          question: "Guľa žiari: 'Aké kúzlo z 9 písmen otvára dvere? Začína na ALO...'",
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
        label: "Tajná chodba",
        requiredItem: "wand",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Dračia jaskyňa",
    description: "Jaskyňa plná dračích pokladov. Drak spí... zatiaľ.",
    panoramaUrl: "https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=2048",
    hotspots: [
      {
        id: "dragon-eggs",
        position: angleToPosition(30, -15),
        type: "puzzle",
        label: "Dračie vajcia",
        puzzle: {
          type: "sequence",
          question: "Na vajciach sú čísla: 3, 6, 12, 24, ?. Aké je ďalšie?",
          hint: "Každé číslo je dvojnásobok predošlého",
          answer: "48",
          reward: {
            id: "dragon-scale",
            name: "Dračia šupina",
            icon: "🐉",
            description: "Nezničiteľná šupina z draka."
          }
        }
      },
      {
        id: "treasure-pile",
        position: angleToPosition(-45, 0),
        type: "item",
        label: "Kopa zlata",
        item: {
          id: "golden-key",
          name: "Zlatý kľúč",
          icon: "🔑",
          description: "Veľký zlatý kľúč s dračou hlavou."
        }
      },
      {
        id: "ancient-scroll",
        position: angleToPosition(90, 10),
        type: "clue",
        label: "Starý zvitok",
        description: "Zvitok hovorí: 'Drakar spí 100 rokov. Prebudí ho len... OHEŇ.'"
      },
      {
        id: "riddle-stone",
        position: angleToPosition(-90, 5),
        type: "puzzle",
        label: "Hádankový kameň",
        puzzle: {
          type: "riddle",
          question: "Som horúci ale nie som slnko, ničím ale aj tvorím, draci ma dýchajú. Čo som?",
          hint: "Draci dýchajú...",
          answer: "ohen"
        }
      },
      {
        id: "enchanted-gate",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Čarovaná brána",
        requiredItem: "dragon-scale",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Elfský les",
    description: "Magický les plný svetlušiek. Portál domov je blízko...",
    panoramaUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=2048",
    hotspots: [
      {
        id: "fairy-ring",
        position: angleToPosition(0, -10),
        type: "puzzle",
        label: "Kruh svetlušiek",
        puzzle: {
          type: "cipher",
          question: "Svetlušky blikajú: 'GSRH RH ZNTVW'. Atbash šifra (A=Z). Čo to znamená?",
          hint: "THIS IS M... = TOTO JE M...",
          answer: "magic"
        }
      },
      {
        id: "wise-owl",
        position: angleToPosition(-60, 20),
        type: "clue",
        label: "Múdra sova",
        description: "Sova huhúka: 'Portál otvorí ten, kto pozná MAGIC-ké slovo... Atbash: ZNTVR'"
      },
      {
        id: "moonflower",
        position: angleToPosition(60, -5),
        type: "item",
        label: "Mesačný kvet",
        item: {
          id: "moonflower",
          name: "Mesačný kvet",
          icon: "🌸",
          description: "Kvet žiariaci mesačným svetlom."
        }
      },
      {
        id: "tree-spirit",
        position: angleToPosition(120, 10),
        type: "lock",
        label: "Duch stromu",
        puzzle: {
          type: "riddle",
          question: "Rastiem stovky rokov, dávam kyslík, mám korene hlboko. Čo som?",
          hint: "Les je plný...",
          answer: "strom",
          reward: {
            id: "portal-gem",
            name: "Portálový klenot",
            icon: "💫",
            description: "Kameň aktivujúci portál."
          }
        }
      },
      {
        id: "portal-home",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Portál domov",
        requiredItem: "portal-gem",
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
  educational: mysteryDetectiveRooms,
  corporate: mysteryDetectiveRooms
};

export const getRoomsForTheme = (theme: string): RoomData[] => {
  return themeRoomsMap[theme] || mysteryDetectiveRooms;
};
