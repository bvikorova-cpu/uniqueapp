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
    name: "Detective's Office",
    description: "You've entered an old detective's office. An unfinished case lies on the desk...",
    panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2048",
    hotspots: [
      {
        id: "desk-drawer",
        position: angleToPosition(45, -15),
        type: "puzzle",
        label: "Locked drawer",
        puzzle: {
          type: "code",
          question: "The drawer is locked with a 4-digit code. A date is circled on the calendar: December 15. What is the code?",
          hint: "Date in numbers: day and month",
          answer: "1512",
          reward: {
            id: "magnifier",
            name: "Lupa",
            icon: "🔍",
            description: "An old detective's magnifying glass. Perhaps it will reveal hidden clues."
          }
        }
      },
      {
        id: "bookshelf",
        position: angleToPosition(-60, 10),
        type: "clue",
        label: "Bookshelf",
        description: "Among the books, you find a note: 'The password is the name of the first president of the USA'"
      },
      {
        id: "safe",
        position: angleToPosition(180, -20),
        type: "lock",
        label: "Trezor",
        puzzle: {
          type: "riddle",
          question: "Enter the password to open the safe. (Hint: Look at the bookshelf)",
          hint: "George...",
          answer: "washington",
          reward: {
            id: "key-gold",
            name: "Golden key",
            icon: "🔑",
            description: "An ornate golden key. It opens the main door."
          }
        }
      },
      {
        id: "window",
        position: angleToPosition(-120, 20),
        type: "clue",
        label: "Okno",
        description: "Through the window, you see a dark alley. 'ROMA' is written on the glass - but it appears to be mirrored..."
      },
      {
        id: "exit-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Exit to the hallway",
        requiredItem: "key-gold",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Secret Passage",
    description: "A dark corridor with several doors. One of them leads to escape...",
    panoramaUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2048",
    hotspots: [
      {
        id: "painting",
        position: angleToPosition(90, 15),
        type: "puzzle",
        label: "Old painting",
        puzzle: {
          type: "cipher",
          question: "Under the painting is a cipher: 'DPEFS'. Each letter is shifted by 1. What is the real word?",
          hint: "A→Z, B→A, C→B... shift each letter back",
          answer: "CODES",
          reward: {
            id: "paper-code",
            name: "Paper with code",
            icon: "📜",
            description: "Paper with numbers: 7-3-9"
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
          name: "Red gemstone",
          icon: "💎",
          description: "A glittering ruby. It seems to belong somewhere."
        }
      },
      {
        id: "locked-cabinet",
        position: angleToPosition(135, 0),
        type: "lock",
        label: "Locked cabinet",
        puzzle: {
          type: "combination",
          question: "The cabinet has a combination lock. You need 3 numbers. (Look at the paper with the code)",
          hint: "Numbers from the paper you found",
          answer: "739",
          reward: {
            id: "key-silver",
            name: "Silver key",
            icon: "🗝️",
            description: "A silver key with an ornate head."
          }
        }
      },
      {
        id: "final-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Escape door",
        requiredItem: "key-silver",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Freedom Room",
    description: "The last room! Just solve the final puzzle and you'll escape!",
    panoramaUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=2048",
    hotspots: [
      {
        id: "final-puzzle",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Last puzzle",
        puzzle: {
          type: "riddle",
          question: "I have keys, but no lock. I have space, but no room. You can enter, but you can't go out. What am I?",
          hint: "You use it every day on your computer...",
          answer: "klavesnica"
        }
      },
      {
        id: "gem-slot",
        position: angleToPosition(60, -10),
        type: "lock",
        label: "Otvor pre drahokam",
        requiredItem: "gem-red",
        description: "The doors opened! The ruby activated the mechanism."
      },
      {
        id: "escape-door",
        position: angleToPosition(-30, 0),
        type: "door",
        label: "ESCAPE!",
        nextRoom: 999 // Signals completion
      }
    ]
  }
];

// Horror Theme Rooms - 3 miestnosti
export const horrorRooms: RoomData[] = [
  {
    id: 0,
    name: "Abandoned Hospital",
    description: "You wake up in an old abandoned hospital. Lights are flickering...",
    panoramaUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=2048",
    hotspots: [
      {
        id: "medical-chart",
        position: angleToPosition(30, 10),
        type: "puzzle",
        label: "Medical chart",
        puzzle: {
          type: "code",
          question: "The chart says: 'Patient #666 - Room 13'. The combination is the sum of these numbers.",
          hint: "666 + 13 = ?",
          answer: "679",
          reward: {
            id: "scalpel",
            name: "Skalpel",
            icon: "🔪",
            description: "A sharp surgical instrument. It might cut something..."
          }
        }
      },
      {
        id: "body-bag",
        position: angleToPosition(-90, -20),
        type: "clue",
        label: "Black bag",
        description: "There's a tag on the bag: 'MORTE' - Latin for death. The last letter is E."
      },
      {
        id: "medicine-cabinet",
        position: angleToPosition(120, 5),
        type: "item",
        label: "First aid kit",
        item: {
          id: "syringe",
          name: "Syringe",
          icon: "💉",
          description: "An empty syringe. It might be useful for something."
        }
      },
      {
        id: "exit",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Emergency exit",
        requiredItem: "scalpel",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Dark Hallway",
    description: "A long corridor full of shadows. You hear footsteps behind you...",
    panoramaUrl: "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=2048",
    hotspots: [
      {
        id: "number-wall",
        position: angleToPosition(45, 0),
        type: "puzzle",
        label: "Numbers on the wall",
        puzzle: {
          type: "sequence",
          question: "There are numbers on the wall: 2, 4, 8, 16, ?. What is the next number?",
          hint: "Each number is double the previous one",
          answer: "32",
          reward: {
            id: "flashlight",
            name: "Flashlight",
            icon: "🔦",
            description: "Weak flashlight. It illuminates dark places."
          }
        }
      },
      {
        id: "blood-writing",
        position: angleToPosition(-60, 15),
        type: "clue",
        label: "Writing in blood",
        description: "On the wall is written: 'RU_' - but the last letter is smudged. Was it N or M?"
      },
      {
        id: "corpse-hand",
        position: angleToPosition(90, -25),
        type: "puzzle",
        label: "Mŕtva ruka",
        puzzle: {
          type: "riddle",
          question: "A dead hand holds a paper: 'I am alive without breath, cold but hot with fears. What am I?'",
          hint: "Something dead that moves...",
          answer: "zombie",
          reward: {
            id: "key-bloody",
            name: "Bloody key",
            icon: "🗝️",
            description: "Key covered in dried blood."
          }
        }
      },
      {
        id: "morgue-door",
        position: angleToPosition(0, 0),
        type: "door",
        label: "Door to the morgue",
        requiredItem: "key-bloody",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Morgue",
    description: "The last room. Cold air and silence. The only way out...",
    panoramaUrl: "https://images.unsplash.com/photo-1509248961725-aec71f4e848e?w=2048",
    hotspots: [
      {
        id: "autopsy-table",
        position: angleToPosition(30, -10),
        type: "puzzle",
        label: "Autopsy table",
        puzzle: {
          type: "cipher",
          question: "There is a message on the table: 'GSRH RH GSV VCR'. It's an Atbash cipher (A=Z, B=Y...). What does it mean?",
          hint: "THIS IS THE EX... translated: THIS IS THE EX...",
          answer: "exit"
        }
      },
      {
        id: "freezer-drawer",
        position: angleToPosition(-45, 0),
        type: "lock",
        label: "Freezer drawer",
        puzzle: {
          type: "code",
          question: "The drawer has a 4-digit code. Hint: 'The year Frankenstein's monster was created'",
          hint: "Mary Shelley, 18...",
          answer: "1818",
          reward: {
            id: "key-exit",
            name: "Escape key",
            icon: "🔑",
            description: "Key to freedom!"
          }
        }
      },
      {
        id: "ghost-message",
        position: angleToPosition(120, 20),
        type: "clue",
        label: "Duchov odkaz",
        description: "Text appears on the foggy glass: 'Frankenstein... 1818...'"
      },
      {
        id: "final-escape",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Escape gate",
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
    name: "Space Station",
    description: "Oxygen is running out. You need to find a way to leave the station.",
    panoramaUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=2048",
    hotspots: [
      {
        id: "console",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Control panel",
        puzzle: {
          type: "code",
          question: "The panel asks for an access code. Hint: 'Binary: 101010'",
          hint: "Convert binary number 101010 to decimal",
          answer: "42",
          reward: {
            id: "keycard-blue",
            name: "Blue card",
            icon: "💳",
            description: "Electronic card with blue light."
          }
        }
      },
      {
        id: "robot",
        position: angleToPosition(-60, -10),
        type: "clue",
        label: "Broken robot",
        description: "The robot repeats: 'Pi... 3.14... Pi...' Maybe it's a hint?"
      },
      {
        id: "airlock",
        position: angleToPosition(120, 5),
        type: "lock",
        label: "Air chamber",
        puzzle: {
          type: "code",
          question: "Enter the value of Pi to 2 decimal places (without a dot)",
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
    name: "Laboratory",
    description: "Scientific laboratory full of experiments. Some look dangerous...",
    panoramaUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=2048",
    hotspots: [
      {
        id: "dna-helix",
        position: angleToPosition(45, 10),
        type: "puzzle",
        label: "DNA model",
        puzzle: {
          type: "riddle",
          question: "How many chromosomes does a human have?",
          hint: "It's an even number between 40 and 50...",
          answer: "46",
          reward: {
            id: "sample-tube",
            name: "Vzorka DNA",
            icon: "🧬",
            description: "Glass test tube with a DNA sample."
          }
        }
      },
      {
        id: "periodic-table",
        position: angleToPosition(-30, 0),
        type: "clue",
        label: "Periodic table",
        description: "Some elements are highlighted: Au (79), Ag (47), Cu (29). Sum = 155"
      },
      {
        id: "chemical-safe",
        position: angleToPosition(90, -15),
        type: "lock",
        label: "Chemical safe",
        puzzle: {
          type: "code",
          question: "Enter the sum of atomic numbers Au + Ag + Cu",
          hint: "Look at the periodic table: 79 + 47 + 29",
          answer: "155",
          reward: {
            id: "keycard-red",
            name: "Red card",
            icon: "💳",
            description: "High level access card."
          }
        }
      },
      {
        id: "alien-specimen",
        position: angleToPosition(-90, 5),
        type: "item",
        label: "Alien specimen",
        item: {
          id: "alien-crystal",
          name: "Alien crystal",
          icon: "💎",
          description: "Glowing crystal from another planet."
        }
      },
      {
        id: "engine-room-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Engine room",
        requiredItem: "keycard-red",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Engine Room",
    description: "The heart of the station. The escape pod is close, but you need to activate the engine.",
    panoramaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2048",
    hotspots: [
      {
        id: "engine-panel",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Main engine",
        puzzle: {
          type: "sequence",
          question: "Start sequence: 1, 1, 2, 3, 5, 8, ?. What is the next number?",
          hint: "Fibonacci sequence - sum of the previous two",
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
          question: "Speed of light in km/s (rounded to thousands)",
          hint: "Approximately 300,000 km/s",
          answer: "300000",
          reward: {
            id: "warp-key",
            name: "Warp Key",
            icon: "⚡",
            description: "Activation key for the escape pod."
          }
        }
      },
      {
        id: "hologram",
        position: angleToPosition(-60, 5),
        type: "clue",
        label: "Captain's Hologram",
        description: "The captain says: 'Light travels at 299,792 km/s... round to thousands.'"
      },
      {
        id: "escape-pod",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Escape pod",
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
    name: "Egyptian Tomb",
    description: "You have fallen into an ancient pharaoh's tomb...",
    panoramaUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=2048",
    hotspots: [
      {
        id: "hieroglyphs",
        position: angleToPosition(30, 20),
        type: "clue",
        label: "Hieroglyfy",
        description: "Ancient writing says: 'The sun rises in the EAST. Ra is the sun god.'"
      },
      {
        id: "scarab",
        position: angleToPosition(-45, -15),
        type: "item",
        label: "Golden Scarab",
        item: {
          id: "scarab",
          name: "Scarab",
          icon: "🪲",
          description: "Sacred golden beetle. Symbol of eternal life."
        }
      },
      {
        id: "sphinx-riddle",
        position: angleToPosition(90, 0),
        type: "puzzle",
        label: "Riddle of the Sphinx",
        puzzle: {
          type: "riddle",
          question: "In the morning I walk on four, at noon on two, in the evening on three. What am I?",
          hint: "Think about human life...",
          answer: "clovek",
          reward: {
            id: "torch",
            name: "Torch",
            icon: "🔥",
            description: "Burning torch illuminating the path."
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
    name: "Pharaoh's Treasure Chamber",
    description: "Gold and jewels all around, but beware of the trap!",
    panoramaUrl: "https://images.unsplash.com/photo-1553522991-71439aa62779?w=2048",
    hotspots: [
      {
        id: "golden-mask",
        position: angleToPosition(0, 5),
        type: "puzzle",
        label: "Golden mask",
        puzzle: {
          type: "code",
          question: "Mask of Tutankhamun. In what year was the tomb discovered? (19XX)",
          hint: "Howard Carter ju objavil v roku 19..22",
          answer: "1922",
          reward: {
            id: "ankh",
            name: "Ankh",
            icon: "☥",
            description: "Egyptian symbol of life."
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
          name: "Pharaoh's Ruby",
          icon: "💎",
          description: "A huge red gemstone."
        }
      },
      {
        id: "trap-floor",
        position: angleToPosition(90, -20),
        type: "clue",
        label: "Floor trap",
        description: "The inscription on the floor reads: 'Only he who knows the year of discovery shall pass'. Tutankhamun, 1922."
      },
      {
        id: "pyramid-lock",
        position: angleToPosition(45, 10),
        type: "lock",
        label: "Pyramid lock",
        requiredItem: "scarab",
        description: "The scarab activated the mechanism!"
      },
      {
        id: "inner-chamber",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Inner Chamber",
        requiredItem: "ankh",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Sarcophagus Hall",
    description: "The last room. Pharaoh's sarcophagus and a secret exit...",
    panoramaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=2048",
    hotspots: [
      {
        id: "sarcophagus",
        position: angleToPosition(0, 0),
        type: "puzzle",
        label: "Sarcophagus",
        puzzle: {
          type: "cipher",
          question: "On the sarcophagus is: 'RA + ANUBIS = ?'. How many gods together? Write in words.",
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
          question: "How many canopic jars were used to store organs? (heart, lungs, stomach, intestines - which ONE not?)",
          hint: "The heart remained in the body, so the rest...",
          answer: "4",
          reward: {
            id: "secret-map",
            name: "Secret map",
            icon: "🗺️",
            description: "The map shows a secret exit!"
          }
        }
      },
      {
        id: "wall-painting",
        position: angleToPosition(60, 15),
        type: "clue",
        label: "Wall painting",
        description: "The painting depicts 4 vessels - canopic jars. The pharaoh's heart remained in the body."
      },
      {
        id: "secret-exit",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Secret exit",
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
    name: "Wizard's Tower",
    description: "You are trapped in a magic tower. Only the right spell will free you.",
    panoramaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2048",
    hotspots: [
      {
        id: "spellbook",
        position: angleToPosition(-30, 10),
        type: "clue",
        label: "Book of Spells",
        description: "The open page says: 'The opening spell has 9 letters and starts with ALO-'",
      },
      {
        id: "crystal-ball",
        position: angleToPosition(60, 0),
        type: "puzzle",
        label: "Crystal ball",
        puzzle: {
          type: "riddle",
          question: "The ball glows: 'What 9-letter spell opens doors? Starts with ALO...'",
          hint: "A famous spell from Harry Potter for opening...",
          answer: "alohomora",
          reward: {
            id: "wand",
            name: "Magic Wand",
            icon: "🪄",
            description: "A wand with a phoenix feather core."
          }
        }
      },
      {
        id: "potion",
        position: angleToPosition(-90, -20),
        type: "item",
        label: "Blue Elixir",
        item: {
          id: "potion-blue",
          name: "Elixir of Wisdom",
          icon: "🧪",
          description: "Blue liquid. Gives hints."
        }
      },
      {
        id: "magic-door",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Secret passage",
        requiredItem: "wand",
        nextRoom: 1
      }
    ]
  },
  {
    id: 1,
    name: "Dragon's Lair",
    description: "A cave full of dragon treasures. The dragon is sleeping... for now.",
    panoramaUrl: "https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=2048",
    hotspots: [
      {
        id: "dragon-eggs",
        position: angleToPosition(30, -15),
        type: "puzzle",
        label: "Dragon Eggs",
        puzzle: {
          type: "sequence",
          question: "The eggs have numbers: 3, 6, 12, 24, ?. What is the next one?",
          hint: "Each number is double the previous one",
          answer: "48",
          reward: {
            id: "dragon-scale",
            name: "Dragon Scale",
            icon: "🐉",
            description: "Indestructible dragon scale."
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
          name: "Golden Key",
          icon: "🔑",
          description: "A large golden key with a dragon's head."
        }
      },
      {
        id: "ancient-scroll",
        position: angleToPosition(90, 10),
        type: "clue",
        label: "Old Scroll",
        description: "The scroll says: 'The Drakar sleeps for 100 years. Only... FIRE will awaken it.'"
      },
      {
        id: "riddle-stone",
        position: angleToPosition(-90, 5),
        type: "puzzle",
        label: "Riddle Stone",
        puzzle: {
          type: "riddle",
          question: "I am hot but not the sun, I destroy but also create, dragons breathe me. What am I?",
          hint: "Dragons breathe...",
          answer: "ohen"
        }
      },
      {
        id: "enchanted-gate",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Enchanted Gate",
        requiredItem: "dragon-scale",
        nextRoom: 2
      }
    ]
  },
  {
    id: 2,
    name: "Elven Forest",
    description: "A magical forest full of fireflies. The portal home is near...",
    panoramaUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=2048",
    hotspots: [
      {
        id: "fairy-ring",
        position: angleToPosition(0, -10),
        type: "puzzle",
        label: "Circle of Fireflies",
        puzzle: {
          type: "cipher",
          question: "Fireflies blink: 'GSRH RH ZNTVW'. Atbash cipher (A=Z). What does it mean?",
          hint: "THIS IS M... = TOTO JE M...",
          answer: "magic"
        }
      },
      {
        id: "wise-owl",
        position: angleToPosition(-60, 20),
        type: "clue",
        label: "Wise Owl",
        description: "The owl hoots: 'The portal will be opened by one who knows the MAGICal word... Atbash: ZNTVR'"
      },
      {
        id: "moonflower",
        position: angleToPosition(60, -5),
        type: "item",
        label: "Moonflower",
        item: {
          id: "moonflower",
          name: "Moonflower",
          icon: "🌸",
          description: "A flower glowing with moonlight."
        }
      },
      {
        id: "tree-spirit",
        position: angleToPosition(120, 10),
        type: "lock",
        label: "Duch stromu",
        puzzle: {
          type: "riddle",
          question: "I grow for hundreds of years, give oxygen, have deep roots. What am I?",
          hint: "The forest is full of...",
          answer: "strom",
          reward: {
            id: "portal-gem",
            name: "Portal Gem",
            icon: "💫",
            description: "A stone activating the portal."
          }
        }
      },
      {
        id: "portal-home",
        position: angleToPosition(180, 0),
        type: "door",
        label: "Portal Home",
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
