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
] as const;

export const PHOTO_STYLES: PhotoStyle[] = [
  { id: "pencil", label: "Pencil sketch", emoji: "✏️", group: "Drawn" },
  { id: "charcoal", label: "Charcoal", emoji: "🖤", group: "Drawn" },
  { id: "ink", label: "Ink line art", emoji: "🖊️", group: "Drawn" },
  { id: "sketchnote", label: "Marker doodle", emoji: "🖍️", group: "Drawn" },

  { id: "cartoon", label: "Cartoon", emoji: "😃", group: "Cartoon & Anime" },
  { id: "anime", label: "Anime", emoji: "🌸", group: "Cartoon & Anime" },
  { id: "comic", label: "Comic book", emoji: "💥", group: "Cartoon & Anime" },
  { id: "animated3d", label: "Animated 3D", emoji: "🧸", group: "Cartoon & Anime" },

  { id: "watercolor", label: "Watercolor", emoji: "💧", group: "Painted" },
  { id: "oil", label: "Oil painting", emoji: "🎨", group: "Painted" },
  { id: "gouache", label: "Gouache", emoji: "🖌️", group: "Painted" },
  { id: "pastel", label: "Chalk pastel", emoji: "🌼", group: "Painted" },

  { id: "hippy", label: "Hippie 70s", emoji: "☮️", group: "Retro & Neon" },
  { id: "popart", label: "Pop art", emoji: "🟡", group: "Retro & Neon" },
  { id: "vaporwave", label: "Vaporwave", emoji: "🌴", group: "Retro & Neon" },
  { id: "synth80s", label: "80s airbrush", emoji: "🕶️", group: "Retro & Neon" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", group: "Retro & Neon" },
  { id: "neonline", label: "Neon lines", emoji: "💡", group: "Retro & Neon" },

  { id: "fantasy", label: "Fantasy hero", emoji: "🗡️", group: "Fantasy" },
  { id: "fairytale", label: "Storybook", emoji: "📖", group: "Fantasy" },
  { id: "gothic", label: "Gothic", emoji: "🕯️", group: "Fantasy" },
  { id: "steampunk", label: "Steampunk", emoji: "⚙️", group: "Fantasy" },
  { id: "superhero", label: "Superhero", emoji: "🦸", group: "Fantasy" },
  { id: "cosmic", label: "Cosmic", emoji: "🌌", group: "Fantasy" },
  { id: "underwater", label: "Underwater", emoji: "🐚", group: "Fantasy" },

  { id: "claymation", label: "Clay figure", emoji: "🧱", group: "Craft & Pixel" },
  { id: "papercut", label: "Paper cut", emoji: "📄", group: "Craft & Pixel" },
  { id: "pixel", label: "Pixel art", emoji: "👾", group: "Craft & Pixel" },
  { id: "lowpoly", label: "Low poly", emoji: "🔷", group: "Craft & Pixel" },
  { id: "mosaic", label: "Mosaic", emoji: "🟦", group: "Craft & Pixel" },
  { id: "stainedglass", label: "Stained glass", emoji: "🪟", group: "Craft & Pixel" },
  { id: "woodcut", label: "Woodcut", emoji: "🪵", group: "Craft & Pixel" },

  { id: "noir", label: "Film noir", emoji: "🎬", group: "Classic & Photo" },
  { id: "vintage", label: "Vintage photo", emoji: "📷", group: "Classic & Photo" },
  { id: "renaissance", label: "Renaissance", emoji: "🏛️", group: "Classic & Photo" },
  { id: "ukiyoe", label: "Ukiyo-e", emoji: "🌊", group: "Classic & Photo" },

  { id: "graffiti", label: "Graffiti", emoji: "🧴", group: "Street & Graphic" },
  { id: "minimal", label: "One-line minimal", emoji: "➰", group: "Street & Graphic" },
];

export const PHOTO_STYLE_COST = 3;
