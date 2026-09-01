/**
 * Photo Styler presets — keep the ids in sync with
 * supabase/functions/photo-styler/index.ts (STYLE_PROMPTS).
 */
export interface PhotoStyle {
  id: string;
  label: string;
  emoji: string;
  group: string;
}

export const PHOTO_STYLE_GROUPS = [
  "Drawn",
  "Cartoon & Anime",
  "Painted",
  "Retro & Neon",
  "Fantasy",
  "Craft & Pixel",
  "Classic & Photo",
  "Street & Graphic",
  "Avatars & Emoji",
  "Royal & Historical",
  "Gala & Fantasy Royalty",
] as const;

export const PHOTO_STYLES: PhotoStyle[] = [
  { id: "pencil", label: "Pencil sketch", emoji: "✏️", group: "Drawn" },
  { id: "charcoal", label: "Charcoal", emoji: "🖤", group: "Drawn" },
  { id: "ink", label: "Ink line art", emoji: "🖊️", group: "Drawn" },
  { id: "sketchnote", label: "Marker doodle", emoji: "🖍️", group: "Drawn" },
  { id: "colorpencil", label: "Colored pencil", emoji: "🌈", group: "Drawn" },
  { id: "scratchboard", label: "Scratchboard", emoji: "⚪", group: "Drawn" },

  { id: "cartoon", label: "Cartoon", emoji: "😃", group: "Cartoon & Anime" },
  { id: "anime", label: "Anime", emoji: "🌸", group: "Cartoon & Anime" },
  { id: "comic", label: "Comic book", emoji: "💥", group: "Cartoon & Anime" },
  { id: "animated3d", label: "Animated 3D", emoji: "🧸", group: "Cartoon & Anime" },
  { id: "caricature", label: "Caricature", emoji: "🤪", group: "Cartoon & Anime" },
  { id: "chibi", label: "Chibi", emoji: "🍡", group: "Cartoon & Anime" },
  { id: "manga", label: "Manga B&W", emoji: "📓", group: "Cartoon & Anime" },
  { id: "sticker", label: "Vinyl sticker", emoji: "🏷️", group: "Cartoon & Anime" },

  { id: "watercolor", label: "Watercolor", emoji: "💧", group: "Painted" },
  { id: "oil", label: "Oil painting", emoji: "🎨", group: "Painted" },
  { id: "gouache", label: "Gouache", emoji: "🖌️", group: "Painted" },
  { id: "pastel", label: "Chalk pastel", emoji: "🌼", group: "Painted" },
  { id: "impressionist", label: "Impressionist", emoji: "🌾", group: "Painted" },
  { id: "postimpressionist", label: "Swirl brush", emoji: "🌀", group: "Painted" },
  { id: "acrylic", label: "Palette knife", emoji: "🔪", group: "Painted" },
  { id: "surreal", label: "Surreal dream", emoji: "🌙", group: "Painted" },

  { id: "hippy", label: "Hippie 70s", emoji: "☮️", group: "Retro & Neon" },
  { id: "popart", label: "Pop art", emoji: "🟡", group: "Retro & Neon" },
  { id: "vaporwave", label: "Vaporwave", emoji: "🌴", group: "Retro & Neon" },
  { id: "synth80s", label: "80s airbrush", emoji: "🕶️", group: "Retro & Neon" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", group: "Retro & Neon" },
  { id: "neonline", label: "Neon lines", emoji: "💡", group: "Retro & Neon" },
  { id: "disco70s", label: "Disco 70s", emoji: "🪩", group: "Retro & Neon" },
  { id: "retro90s", label: "90s anime cel", emoji: "📼", group: "Retro & Neon" },
  { id: "glitch", label: "Glitch art", emoji: "🛠️", group: "Retro & Neon" },

  { id: "fantasy", label: "Fantasy hero", emoji: "🗡️", group: "Fantasy" },
  { id: "fairytale", label: "Storybook", emoji: "📖", group: "Fantasy" },
  { id: "gothic", label: "Gothic", emoji: "🕯️", group: "Fantasy" },
  { id: "steampunk", label: "Steampunk", emoji: "⚙️", group: "Fantasy" },
  { id: "superhero", label: "Superhero", emoji: "🦸", group: "Fantasy" },
  { id: "cosmic", label: "Cosmic", emoji: "🌌", group: "Fantasy" },
  { id: "underwater", label: "Underwater", emoji: "🐚", group: "Fantasy" },
  { id: "mythicgod", label: "Mythic deity", emoji: "⚡", group: "Fantasy" },
  { id: "icequeen", label: "Ice & frost", emoji: "❄️", group: "Fantasy" },
  { id: "emberfire", label: "Fire & embers", emoji: "🔥", group: "Fantasy" },
  { id: "forestspirit", label: "Forest spirit", emoji: "🌿", group: "Fantasy" },

  { id: "claymation", label: "Clay figure", emoji: "🧱", group: "Craft & Pixel" },
  { id: "papercut", label: "Paper cut", emoji: "📄", group: "Craft & Pixel" },
  { id: "pixel", label: "Pixel art", emoji: "👾", group: "Craft & Pixel" },
  { id: "lowpoly", label: "Low poly", emoji: "🔷", group: "Craft & Pixel" },
  { id: "mosaic", label: "Mosaic", emoji: "🟦", group: "Craft & Pixel" },
  { id: "stainedglass", label: "Stained glass", emoji: "🪟", group: "Craft & Pixel" },
  { id: "woodcut", label: "Woodcut", emoji: "🪵", group: "Craft & Pixel" },
  { id: "origami", label: "Origami", emoji: "🦢", group: "Craft & Pixel" },
  { id: "feltwool", label: "Felted wool", emoji: "🧶", group: "Craft & Pixel" },
  { id: "toybrick", label: "Toy bricks", emoji: "🧩", group: "Craft & Pixel" },
  { id: "marble", label: "Marble statue", emoji: "🗿", group: "Craft & Pixel" },
  { id: "bronze", label: "Bronze bust", emoji: "🥉", group: "Craft & Pixel" },

  { id: "noir", label: "Film noir", emoji: "🎬", group: "Classic & Photo" },
  { id: "vintage", label: "Vintage photo", emoji: "📷", group: "Classic & Photo" },
  { id: "renaissance", label: "Renaissance", emoji: "🏛️", group: "Classic & Photo" },
  { id: "ukiyoe", label: "Ukiyo-e", emoji: "🌊", group: "Classic & Photo" },
  { id: "artnouveau", label: "Art nouveau", emoji: "🌺", group: "Classic & Photo" },
  { id: "cubism", label: "Cubism", emoji: "🔺", group: "Classic & Photo" },
  { id: "polaroid", label: "Polaroid", emoji: "🖼️", group: "Classic & Photo" },

  { id: "graffiti", label: "Graffiti", emoji: "🧴", group: "Street & Graphic" },
  { id: "minimal", label: "One-line minimal", emoji: "➰", group: "Street & Graphic" },
  { id: "blueprint", label: "Blueprint", emoji: "📐", group: "Street & Graphic" },
  { id: "duotone", label: "Duotone", emoji: "🎞️", group: "Street & Graphic" },
  { id: "silhouette", label: "Silhouette", emoji: "🌇", group: "Street & Graphic" },
  { id: "holofoil", label: "Holo foil", emoji: "✨", group: "Street & Graphic" },

  { id: "memoji", label: "Avatar sticker", emoji: "🙂", group: "Avatars & Emoji" },
  { id: "pixelemoji", label: "Pixel emoji", emoji: "🕹️", group: "Avatars & Emoji" },
  { id: "emote", label: "Chat emote", emoji: "😂", group: "Avatars & Emoji" },
  { id: "shonen", label: "Shonen anime", emoji: "⚔️", group: "Avatars & Emoji" },
  { id: "ghiblisoft", label: "Soft animation film", emoji: "🍃", group: "Avatars & Emoji" },
  { id: "kawaii", label: "Kawaii chibi", emoji: "🎀", group: "Avatars & Emoji" },
  { id: "pixar3d", label: "3D movie character", emoji: "🎞️", group: "Avatars & Emoji" },
  { id: "webtoon", label: "Webtoon comic", emoji: "📱", group: "Avatars & Emoji" },
  { id: "vectorgame", label: "Game cover vector", emoji: "🎮", group: "Avatars & Emoji" },

  { id: "renaissanceportrait", label: "Baroque portrait", emoji: "👑", group: "Royal & Historical" },
  { id: "victorian", label: "Regency era", emoji: "🎻", group: "Royal & Historical" },
  { id: "medievalqueen", label: "Medieval royal", emoji: "🛡️", group: "Royal & Historical" },

  { id: "redcarpet", label: "Red carpet gala", emoji: "💎", group: "Gala & Fantasy Royalty" },
  { id: "masquerade", label: "Masquerade ball", emoji: "🎭", group: "Gala & Fantasy Royalty" },
  { id: "elfprincess", label: "Elven princess", emoji: "🧝", group: "Gala & Fantasy Royalty" },
  { id: "darkroyalty", label: "Dark royalty", emoji: "🖤", group: "Gala & Fantasy Royalty" },
];


export const PHOTO_STYLE_COST = 3;
