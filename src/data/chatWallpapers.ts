import { PHOTO_CHAT_WALLPAPERS } from "@/data/chatWallpaperImages";

/**
 * Chat wallpaper catalog — CSS templates and optimized photographic wallpapers.
 * Used by every chat surface on the platform via `useChatTheme`.
 * Legacy ids (abstract, stars, bubbles, matrix) are kept for backwards
 * compatibility with already saved `messenger_chat_themes.wallpaper_id`.
 */
export type ChatWallpaperCategory =
  | "gradient"
  | "neon"
  | "nature"
  | "pastel"
  | "dark"
  | "pattern"
  | "romantic"
  | "kids"
  | "hearts"
  | "animals"
  | "mens"
  | "womens"
  | "travel"
  | "fashion";

export interface ChatWallpaper {
  id: string;
  name: string;
  category: ChatWallpaperCategory;
  price: number;
  /** CSS background-image value (may contain multiple layers). */
  background: string;
  /** Optional background-color underneath the layers. */
  base?: string;
  /** Optional background-size for patterned templates. */
  size?: string;
  /** Optional background-position for photographic templates. */
  position?: string;
  /** Accent used for the bubble border tint. */
  accent: string;
}

export const CHAT_WALLPAPER_CATEGORIES: { id: ChatWallpaperCategory; label: string }[] = [
  { id: "gradient", label: "Gradients" },
  { id: "neon", label: "Neon" },
  { id: "nature", label: "Nature" },
  { id: "pastel", label: "Pastel" },
  { id: "dark", label: "Dark" },
  { id: "pattern", label: "Patterns" },
  { id: "romantic", label: "Romantic" },
  { id: "kids", label: "Kids" },
  { id: "hearts", label: "Hearts" },
  { id: "animals", label: "Cats & Pets" },
  { id: "mens", label: "For men" },
  { id: "womens", label: "For women" },
  { id: "travel", label: "Travel" },
  { id: "fashion", label: "Fashion" },
];

const g = (a: string, b: string, c: string, deg = 135) =>
  `linear-gradient(${deg}deg, ${a} 0%, ${b} 50%, ${c} 100%)`;

const glow = (a: string, b: string, base: string) =>
  `radial-gradient(circle at 20% 15%, ${a} 0%, transparent 55%), radial-gradient(circle at 80% 85%, ${b} 0%, transparent 55%), linear-gradient(160deg, ${base} 0%, transparent 100%)`;

/**
 * Icon-tile ("image style") wallpaper: repeating SVG motif over a gradient.
 * The motif is inlined as an SVG data URL, so there is nothing to download.
 */
const motif = (glyphs: string[], opacity = 0.45, tile = 96) => {
  const spots = [
    [22, 30],
    [64, 22],
    [40, 66],
    [80, 76],
  ];
  const inner = glyphs
    .slice(0, 4)
    .map((gl, i) => {
      const [x, y] = spots[i % spots.length];
      return `<text x='${x}' y='${y}' font-size='24' text-anchor='middle' opacity='${opacity}'>${gl}</text>`;
    })
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}' viewBox='0 0 96 96'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/** Motif tiles layered over a soft gradient. */
const iconBg = (glyphs: string[], a: string, b: string, c: string, opacity = 0.45, tile = 96) =>
  `${motif(glyphs, opacity, tile)}, ${g(a, b, c)}`;

const iconSize = (tile = 96) => `${tile}px ${tile}px, auto`;

const BASE_CHAT_WALLPAPERS: ChatWallpaper[] = [
  /* ---------- Gradients (10) ---------- */
  { id: "abstract", name: "Abstract Waves", category: "gradient", price: 0, accent: "#3b82f6", background: g("#22d3ee55", "#3b82f640", "#a855f755") },
  { id: "sunrise", name: "Sunrise", category: "gradient", price: 0, accent: "#f97316", background: g("#fed7aa66", "#fb923c44", "#f9731655") },
  { id: "lagoon", name: "Lagoon", category: "gradient", price: 0, accent: "#06b6d4", background: g("#a5f3fc66", "#22d3ee44", "#0891b255") },
  { id: "grape", name: "Grape Soda", category: "gradient", price: 0, accent: "#7c3aed", background: g("#ddd6fe66", "#a78bfa44", "#7c3aed55") },
  { id: "peachy", name: "Peachy", category: "gradient", price: 0, accent: "#fb7185", background: g("#fecdd366", "#fda4af44", "#fb718555") },
  { id: "mintbreeze", name: "Mint Breeze", category: "gradient", price: 0, accent: "#10b981", background: g("#d1fae566", "#6ee7b744", "#10b98155") },
  { id: "sandstone", name: "Sandstone", category: "gradient", price: 2, accent: "#d97706", background: g("#fef3c766", "#fcd34d44", "#d9770655") },
  { id: "bluesteel", name: "Blue Steel", category: "gradient", price: 2, accent: "#1d4ed8", background: g("#dbeafe66", "#60a5fa44", "#1d4ed855") },
  { id: "tropic", name: "Tropic Punch", category: "gradient", price: 2, accent: "#f43f5e", background: g("#fde04766", "#fb923c44", "#f43f5e55") },
  { id: "iris", name: "Iris Bloom", category: "gradient", price: 3, accent: "#8b5cf6", background: g("#c4b5fd66", "#818cf844", "#8b5cf655") },

  /* ---------- Neon (8) ---------- */
  { id: "matrix", name: "Digital Rain", category: "neon", price: 0, accent: "#22c55e", base: "#04140c", background: `repeating-linear-gradient(180deg, #22c55e22 0 2px, transparent 2px 14px), ${g("#064e3b66", "#065f4644", "#0f766e66")}`, size: "auto" },
  { id: "cyberpink", name: "Cyber Pink", category: "neon", price: 0, accent: "#ec4899", base: "#12021a", background: glow("#ec489966", "#6366f166", "#12021a") },
  { id: "voltage", name: "Voltage", category: "neon", price: 2, accent: "#facc15", base: "#0b0b14", background: glow("#facc1555", "#06b6d455", "#0b0b14") },
  { id: "vaporwave", name: "Vaporwave", category: "neon", price: 2, accent: "#f472b6", base: "#150726", background: `repeating-linear-gradient(0deg, #f472b622 0 1px, transparent 1px 22px), ${g("#7c3aed55", "#db277744", "#22d3ee55")}` },
  { id: "acidlime", name: "Acid Lime", category: "neon", price: 2, accent: "#a3e635", base: "#0a1000", background: glow("#a3e63555", "#14b8a655", "#0a1000") },
  { id: "hologram", name: "Hologram", category: "neon", price: 3, accent: "#22d3ee", base: "#050b14", background: `repeating-linear-gradient(120deg, #22d3ee1a 0 6px, transparent 6px 18px), ${glow("#22d3ee55", "#a855f755", "#050b14")}` },
  { id: "arcade", name: "Arcade Night", category: "neon", price: 3, accent: "#6366f1", base: "#080615", background: glow("#6366f166", "#f9731655", "#080615") },
  { id: "infrared", name: "Infrared", category: "neon", price: 4, accent: "#ef4444", base: "#140203", background: glow("#ef444466", "#f9731644", "#140203") },

  /* ---------- Nature (8) ---------- */
  { id: "forestmist", name: "Forest Mist", category: "nature", price: 0, accent: "#16a34a", background: g("#dcfce766", "#86efac44", "#16a34a55") },
  { id: "oceanfloor", name: "Ocean Floor", category: "nature", price: 0, accent: "#0284c7", background: g("#bae6fd66", "#38bdf844", "#0369a155") },
  { id: "sakura", name: "Sakura", category: "nature", price: 0, accent: "#f9a8d4", background: `radial-gradient(circle at 25% 20%, #fbcfe866 0 12%, transparent 13%), radial-gradient(circle at 70% 60%, #fda4af55 0 9%, transparent 10%), ${g("#fff1f266", "#fbcfe844", "#f9a8d455")}` },
  { id: "desertdune", name: "Desert Dune", category: "nature", price: 2, accent: "#ea580c", background: g("#fef3c766", "#fdba7444", "#ea580c55") },
  { id: "northernlight", name: "Northern Light", category: "nature", price: 2, accent: "#22d3ee", base: "#041029", background: glow("#22d3ee55", "#a855f755", "#041029") },
  { id: "mountainhaze", name: "Mountain Haze", category: "nature", price: 2, accent: "#64748b", background: g("#e2e8f066", "#94a3b844", "#47556955") },
  { id: "autumnleaf", name: "Autumn Leaf", category: "nature", price: 3, accent: "#b45309", background: g("#fed7aa66", "#f59e0b44", "#b4530955") },
  { id: "rainyglass", name: "Rainy Glass", category: "nature", price: 3, accent: "#3b82f6", background: `repeating-linear-gradient(100deg, #3b82f61f 0 2px, transparent 2px 12px), ${g("#e0f2fe66", "#93c5fd44", "#3b82f644")}` },

  /* ---------- Pastel (8) ---------- */
  { id: "cottoncandy", name: "Cotton Candy", category: "pastel", price: 0, accent: "#f0abfc", background: g("#fae8ff66", "#f5d0fe44", "#a5f3fc55") },
  { id: "vanillasky", name: "Vanilla Sky", category: "pastel", price: 0, accent: "#fcd34d", background: g("#fefce866", "#fef08a44", "#bfdbfe55") },
  { id: "lavendermilk", name: "Lavender Milk", category: "pastel", price: 0, accent: "#c4b5fd", background: g("#f5f3ff66", "#ddd6fe44", "#c4b5fd55") },
  { id: "seafoam", name: "Seafoam", category: "pastel", price: 0, accent: "#5eead4", background: g("#f0fdfa66", "#99f6e444", "#5eead455") },
  { id: "babyblue", name: "Baby Blue", category: "pastel", price: 0, accent: "#93c5fd", background: g("#eff6ff66", "#bfdbfe44", "#93c5fd55") },
  { id: "blushrose", name: "Blush Rose", category: "pastel", price: 2, accent: "#fda4af", background: g("#fff1f266", "#fecdd344", "#fda4af55") },
  { id: "pistachio", name: "Pistachio", category: "pastel", price: 2, accent: "#bef264", background: g("#f7fee766", "#d9f99d44", "#bef26455") },
  { id: "apricotcream", name: "Apricot Cream", category: "pastel", price: 2, accent: "#fdba74", background: g("#fff7ed66", "#fed7aa44", "#fdba7455") },

  /* ---------- Dark / Minimal (8) ---------- */
  { id: "midnightink", name: "Midnight Ink", category: "dark", price: 0, accent: "#334155", base: "#0b1120", background: g("#1e293b66", "#0f172a44", "#02061266") },
  { id: "charcoal", name: "Charcoal", category: "dark", price: 0, accent: "#4b5563", base: "#111113", background: g("#27272a66", "#18181b44", "#09090b66") },
  { id: "deepocean", name: "Deep Ocean", category: "dark", price: 0, accent: "#0e7490", base: "#04121a", background: glow("#0e749055", "#1e40af44", "#04121a") },
  { id: "espresso", name: "Espresso", category: "dark", price: 2, accent: "#78350f", base: "#160d07", background: g("#44403c66", "#292524", "#1c191766") },
  { id: "obsidian", name: "Obsidian", category: "dark", price: 2, accent: "#6b7280", base: "#08080a", background: `repeating-linear-gradient(45deg, #ffffff08 0 1px, transparent 1px 16px), ${g("#1f293766", "#111827", "#03030566")}` },
  { id: "plumnight", name: "Plum Night", category: "dark", price: 2, accent: "#7e22ce", base: "#150920", background: glow("#7e22ce55", "#2563eb44", "#150920") },
  { id: "graphitegrid", name: "Graphite Grid", category: "dark", price: 3, accent: "#52525b", base: "#0d0d10", background: `linear-gradient(#ffffff0d 1px, transparent 1px), linear-gradient(90deg, #ffffff0d 1px, transparent 1px), linear-gradient(160deg, #18181b 0%, #09090b 100%)`, size: "26px 26px, 26px 26px, auto" },
  { id: "steelnoir", name: "Steel Noir", category: "dark", price: 3, accent: "#475569", base: "#0a0f16", background: glow("#47556955", "#0ea5e933", "#0a0f16") },

  /* ---------- Patterns (8) ---------- */
  { id: "bubbles", name: "Chat Bubbles", category: "pattern", price: 0, accent: "#ec4899", background: `radial-gradient(circle at 20% 30%, #ec489933 0 8%, transparent 9%), radial-gradient(circle at 75% 65%, #f9731633 0 10%, transparent 11%), ${g("#fdf2f866", "#ffe4e644", "#ffedd555")}` },
  { id: "polkadots", name: "Polka Dots", category: "pattern", price: 0, accent: "#8b5cf6", background: `radial-gradient(#8b5cf62e 1.6px, transparent 1.7px), linear-gradient(135deg, #f5f3ff66, #ede9fe44)`, size: "18px 18px, auto" },
  { id: "grid", name: "Blueprint Grid", category: "pattern", price: 0, accent: "#0ea5e9", background: `linear-gradient(#0ea5e922 1px, transparent 1px), linear-gradient(90deg, #0ea5e922 1px, transparent 1px), linear-gradient(135deg, #f0f9ff66, #e0f2fe44)`, size: "24px 24px, 24px 24px, auto" },
  { id: "stripes", name: "Soft Stripes", category: "pattern", price: 0, accent: "#f59e0b", background: `repeating-linear-gradient(45deg, #f59e0b1f 0 10px, transparent 10px 20px), linear-gradient(135deg, #fffbeb66, #fef3c744)` },
  { id: "waves", name: "Wavelets", category: "pattern", price: 2, accent: "#06b6d4", background: `repeating-radial-gradient(circle at 0 100%, #06b6d41f 0 12px, transparent 12px 24px), linear-gradient(135deg, #ecfeff66, #cffafe44)` },
  { id: "diamonds", name: "Diamonds", category: "pattern", price: 2, accent: "#a855f7", background: `repeating-conic-gradient(from 45deg at 50% 50%, #a855f71f 0% 25%, transparent 0% 50%), linear-gradient(135deg, #faf5ff66, #f3e8ff44)`, size: "26px 26px, auto" },
  { id: "honeycomb", name: "Honeycomb", category: "pattern", price: 3, accent: "#eab308", background: `repeating-linear-gradient(60deg, #eab3081f 0 2px, transparent 2px 18px), repeating-linear-gradient(-60deg, #eab3081f 0 2px, transparent 2px 18px), linear-gradient(135deg, #fefce866, #fef9c344)` },
  { id: "stars", name: "Starfield", category: "pattern", price: 2, accent: "#818cf8", base: "#0b1026", background: `radial-gradient(1.4px 1.4px at 20% 30%, #ffffffaa, transparent), radial-gradient(1.2px 1.2px at 70% 20%, #ffffff88, transparent), radial-gradient(1.6px 1.6px at 45% 75%, #ffffff99, transparent), ${g("#312e8166", "#4c1d9544", "#1e3a8a66")}` },

  /* ---------- Romantic / Glow (8) ---------- */
  { id: "loveletter", name: "Love Letter", category: "romantic", price: 0, accent: "#e11d48", background: g("#fff1f266", "#fecdd344", "#e11d4844") },
  { id: "champagne", name: "Champagne", category: "romantic", price: 0, accent: "#eab308", background: g("#fffbeb66", "#fde68a44", "#eab30844") },
  { id: "velvetred", name: "Velvet Red", category: "romantic", price: 2, accent: "#be123c", base: "#1a040a", background: glow("#be123c66", "#f9731644", "#1a040a") },
  { id: "moonlitkiss", name: "Moonlit Kiss", category: "romantic", price: 2, accent: "#a78bfa", base: "#0f0a1f", background: glow("#a78bfa55", "#f472b655", "#0f0a1f") },
  { id: "roseglow", name: "Rose Glow", category: "romantic", price: 2, accent: "#f472b6", background: glow("#f472b644", "#fda4af44", "#fff1f2") },
  { id: "goldenhour", name: "Golden Hour", category: "romantic", price: 3, accent: "#f59e0b", background: glow("#f59e0b44", "#fb718544", "#fff7ed") },
  { id: "silkpurple", name: "Silk Purple", category: "romantic", price: 3, accent: "#9333ea", background: g("#f3e8ff66", "#d8b4fe44", "#9333ea44") },
  { id: "firefly", name: "Firefly Night", category: "romantic", price: 4, accent: "#fde047", base: "#0a1408", background: `radial-gradient(1.8px 1.8px at 30% 40%, #fde047cc, transparent), radial-gradient(1.6px 1.6px at 65% 25%, #fde04799, transparent), radial-gradient(2px 2px at 50% 80%, #fde047aa, transparent), ${glow("#16653455", "#22c55e33", "#0a1408")}` },

  /* ---------- Kids (4, always free) ---------- */
  { id: "kidscandy", name: "Candy Land", category: "kids", price: 0, accent: "#f472b6", background: `radial-gradient(circle at 15% 25%, #f472b644 0 7%, transparent 8%), radial-gradient(circle at 60% 15%, #38bdf644 0 6%, transparent 7%), radial-gradient(circle at 80% 70%, #fbbf2444 0 8%, transparent 9%), ${g("#fff1f766", "#fef9c344", "#e0f2fe55")}` },
  { id: "kidsrainbow", name: "Rainbow Fun", category: "kids", price: 0, accent: "#22c55e", background: `repeating-linear-gradient(45deg, #f8717133 0 14px, #fbbf2433 14px 28px, #34d39933 28px 42px, #60a5fa33 42px 56px, #a78bfa33 56px 70px), linear-gradient(135deg, #ffffff55, #ffffff22)` },
  { id: "kidsspace", name: "Space Kids", category: "kids", price: 0, accent: "#818cf8", base: "#0d1030", background: `radial-gradient(2px 2px at 25% 30%, #ffffffcc, transparent), radial-gradient(1.6px 1.6px at 70% 20%, #ffffff99, transparent), radial-gradient(circle at 82% 78%, #fbbf2455 0 6%, transparent 7%), ${g("#312e8166", "#1e3a8a44", "#4c1d9566")}` },
  { id: "kidsocean", name: "Ocean Friends", category: "kids", price: 0, accent: "#22d3ee", background: `repeating-radial-gradient(circle at 10% 100%, #22d3ee26 0 14px, transparent 14px 28px), radial-gradient(circle at 70% 30%, #fde04744 0 6%, transparent 7%), ${g("#ecfeff66", "#a5f3fc44", "#0891b244")}` },

  /* ---------- Hearts (8) ---------- */
  { id: "heartsblush", name: "Blush Hearts", category: "hearts", price: 0, accent: "#fb7185", background: iconBg(["❤️", "💗", "💕", "💖"], "#fff1f266", "#ffe4e644", "#fecdd355"), size: iconSize() },
  { id: "heartsred", name: "Red Romance", category: "hearts", price: 0, accent: "#e11d48", background: iconBg(["❤️", "💋", "❤️", "💘"], "#fff1f266", "#fda4af44", "#e11d4844"), size: iconSize() },
  { id: "heartspurple", name: "Purple Hearts", category: "hearts", price: 2, accent: "#a855f7", background: iconBg(["💜", "💟", "💜", "✨"], "#faf5ff66", "#e9d5ff44", "#a855f744"), size: iconSize() },
  { id: "heartsgold", name: "Golden Hearts", category: "hearts", price: 2, accent: "#f59e0b", background: iconBg(["💛", "✨", "💛", "🌟"], "#fffbeb66", "#fde68a44", "#f59e0b44"), size: iconSize() },
  { id: "heartsnight", name: "Neon Hearts", category: "hearts", price: 3, accent: "#f472b6", base: "#12041a", background: `${motif(["💖", "💫", "💗", "✨"], 0.55)}, ${glow("#f472b655", "#a855f755", "#12041a")}`, size: iconSize() },
  { id: "heartsmini", name: "Tiny Hearts", category: "hearts", price: 2, accent: "#f9a8d4", background: iconBg(["💕", "💕", "💕", "💕"], "#fdf2f866", "#fce7f344", "#f9a8d444", 0.35, 64), size: iconSize(64) },
  { id: "heartslove", name: "Love Notes", category: "hearts", price: 3, accent: "#db2777", background: iconBg(["💌", "❤️", "💐", "💞"], "#fff1f266", "#fbcfe844", "#db277744"), size: iconSize() },
  { id: "heartsteddy", name: "Teddy Love", category: "hearts", price: 3, accent: "#f97316", background: iconBg(["🧸", "❤️", "🎀", "💖"], "#fff7ed66", "#fed7aa44", "#f9731644"), size: iconSize() },

  /* ---------- Cats & Pets (8) ---------- */
  { id: "catsmeow", name: "Meow Meow", category: "animals", price: 0, accent: "#f59e0b", background: iconBg(["🐱", "🐾", "😻", "🐈"], "#fffbeb66", "#fef3c744", "#fdba7444"), size: iconSize() },
  { id: "catspaws", name: "Paw Prints", category: "animals", price: 0, accent: "#a16207", background: iconBg(["🐾", "🐾", "🐾", "🐾"], "#fefce866", "#fde68a44", "#d9770644", 0.35, 64), size: iconSize(64) },
  { id: "dogsbuddy", name: "Puppy Buddy", category: "animals", price: 0, accent: "#0ea5e9", background: iconBg(["🐶", "🦴", "🐾", "🐕"], "#f0f9ff66", "#e0f2fe44", "#38bdf844"), size: iconSize() },
  { id: "petsmix", name: "Pet Party", category: "animals", price: 2, accent: "#22c55e", background: iconBg(["🐰", "🐹", "🐢", "🐦"], "#f0fdf466", "#dcfce744", "#22c55e44"), size: iconSize() },
  { id: "catsnight", name: "Night Cats", category: "animals", price: 3, accent: "#a78bfa", base: "#0e0a1f", background: `${motif(["🐈‍⬛", "🌙", "🐾", "✨"], 0.55)}, ${glow("#a78bfa55", "#22d3ee44", "#0e0a1f")}`, size: iconSize() },
  { id: "catskitty", name: "Kitty Pastel", category: "animals", price: 2, accent: "#f0abfc", background: iconBg(["😺", "🎀", "🐾", "💗"], "#fdf4ff66", "#f5d0fe44", "#e879f944"), size: iconSize() },
  { id: "petsfarm", name: "Farm Friends", category: "animals", price: 2, accent: "#84cc16", background: iconBg(["🐮", "🐷", "🐔", "🐴"], "#f7fee766", "#d9f99d44", "#65a30d44"), size: iconSize() },
  { id: "petswild", name: "Wild Ones", category: "animals", price: 3, accent: "#ea580c", background: iconBg(["🦊", "🐼", "🦁", "🐨"], "#fff7ed66", "#fed7aa44", "#ea580c44"), size: iconSize() },

  /* ---------- For men (8) ---------- */
  { id: "menscar", name: "Fast Lane", category: "mens", price: 0, accent: "#1d4ed8", base: "#0a1020", background: `${motif(["🚗", "🏁", "🏎️", "⚙️"], 0.4)}, ${glow("#1d4ed855", "#0ea5e944", "#0a1020")}`, size: iconSize() },
  { id: "mensgym", name: "Iron Gym", category: "mens", price: 0, accent: "#ef4444", base: "#111113", background: `${motif(["🏋️", "💪", "🥊", "🔥"], 0.4)}, ${glow("#ef444455", "#f9731633", "#111113")}`, size: iconSize() },
  { id: "mensfootball", name: "Match Day", category: "mens", price: 0, accent: "#16a34a", background: iconBg(["⚽", "🥇", "🏟️", "🧤"], "#f0fdf466", "#bbf7d044", "#16a34a44"), size: iconSize() },
  { id: "menstech", name: "Tech Desk", category: "mens", price: 2, accent: "#22d3ee", base: "#050b14", background: `${motif(["💻", "🎧", "🎮", "⌨️"], 0.4)}, ${glow("#22d3ee55", "#6366f144", "#050b14")}`, size: iconSize() },
  { id: "mensfish", name: "Fishing Trip", category: "mens", price: 2, accent: "#0284c7", background: iconBg(["🎣", "🐟", "⛵", "🌊"], "#f0f9ff66", "#bae6fd44", "#0284c744"), size: iconSize() },
  { id: "menswhiskey", name: "Whiskey Club", category: "mens", price: 3, accent: "#b45309", base: "#160d07", background: `${motif(["🥃", "🚬", "♠️", "🎲"], 0.4)}, ${glow("#b4530955", "#78350f44", "#160d07")}`, size: iconSize() },
  { id: "mensmoto", name: "Ride Free", category: "mens", price: 3, accent: "#64748b", base: "#0b1120", background: `${motif(["🏍️", "🛠️", "🔧", "🛞"], 0.4)}, ${glow("#64748b55", "#0ea5e933", "#0b1120")}`, size: iconSize() },
  { id: "mensmoney", name: "Business Mode", category: "mens", price: 4, accent: "#eab308", base: "#0d0d10", background: `${motif(["💼", "📈", "💰", "⌚"], 0.4)}, ${glow("#eab30855", "#22c55e33", "#0d0d10")}`, size: iconSize() },

  /* ---------- For women (8) ---------- */
  { id: "womensflowers", name: "Flower Field", category: "womens", price: 0, accent: "#ec4899", background: iconBg(["🌸", "🌷", "🌺", "🌼"], "#fdf2f866", "#fce7f344", "#f9a8d444"), size: iconSize() },
  { id: "womensbeauty", name: "Beauty Bar", category: "womens", price: 0, accent: "#db2777", background: iconBg(["💄", "💅", "🪞", "💋"], "#fff1f266", "#fbcfe844", "#db277744"), size: iconSize() },
  { id: "womenscoffee", name: "Coffee & Chill", category: "womens", price: 0, accent: "#b45309", background: iconBg(["☕", "🥐", "📖", "🕯️"], "#fffbeb66", "#fde68a44", "#b4530944"), size: iconSize() },
  { id: "womensspa", name: "Spa Day", category: "womens", price: 2, accent: "#14b8a6", background: iconBg(["🧖", "🌿", "🕯️", "🛁"], "#f0fdfa66", "#ccfbf144", "#14b8a644"), size: iconSize() },
  { id: "womensyoga", name: "Yoga Flow", category: "womens", price: 2, accent: "#a855f7", background: iconBg(["🧘", "🌙", "🪷", "✨"], "#faf5ff66", "#ede9fe44", "#a855f744"), size: iconSize() },
  { id: "womenssweet", name: "Sweet Tooth", category: "womens", price: 2, accent: "#f472b6", background: iconBg(["🧁", "🍓", "🍰", "🍭"], "#fff1f766", "#fce7f344", "#f472b644"), size: iconSize() },
  { id: "womensglam", name: "Glam Night", category: "womens", price: 3, accent: "#e879f9", base: "#140a1c", background: `${motif(["💎", "🥂", "👠", "✨"], 0.5)}, ${glow("#e879f955", "#f472b644", "#140a1c")}`, size: iconSize() },
  { id: "womensgarden", name: "Secret Garden", category: "womens", price: 3, accent: "#22c55e", background: iconBg(["🌿", "🦋", "🌷", "🐝"], "#f0fdf466", "#dcfce744", "#22c55e44"), size: iconSize() },

  /* ---------- Travel (8) ---------- */
  { id: "travelworld", name: "Wanderlust", category: "travel", price: 0, accent: "#0ea5e9", background: iconBg(["✈️", "🌍", "🧭", "🗺️"], "#f0f9ff66", "#e0f2fe44", "#0ea5e944"), size: iconSize() },
  { id: "travelbeach", name: "Beach Escape", category: "travel", price: 0, accent: "#06b6d4", background: iconBg(["🏖️", "🌴", "🐚", "🍹"], "#ecfeff66", "#cffafe44", "#06b6d444"), size: iconSize() },
  { id: "travelcity", name: "City Break", category: "travel", price: 0, accent: "#64748b", background: iconBg(["🏙️", "🚕", "☕", "📸"], "#f8fafc66", "#e2e8f044", "#47556944"), size: iconSize() },
  { id: "travelmountain", name: "Mountain Trail", category: "travel", price: 2, accent: "#16a34a", background: iconBg(["⛰️", "🥾", "🎒", "🌲"], "#f0fdf466", "#dcfce744", "#16653444"), size: iconSize() },
  { id: "travelroad", name: "Road Trip", category: "travel", price: 2, accent: "#f59e0b", background: iconBg(["🚐", "🛣️", "⛽", "🎶"], "#fffbeb66", "#fef3c744", "#f59e0b44"), size: iconSize() },
  { id: "travelnight", name: "Night Flight", category: "travel", price: 3, accent: "#818cf8", base: "#0b1026", background: `${motif(["✈️", "🌙", "⭐", "🌃"], 0.5)}, ${glow("#818cf855", "#22d3ee44", "#0b1026")}`, size: iconSize() },
  { id: "travelcamp", name: "Campfire", category: "travel", price: 3, accent: "#ea580c", base: "#140b06", background: `${motif(["🏕️", "🔥", "🌌", "🎸"], 0.5)}, ${glow("#ea580c55", "#eab30833", "#140b06")}`, size: iconSize() },
  { id: "travelsail", name: "Sail Away", category: "travel", price: 4, accent: "#0284c7", background: iconBg(["⛵", "🐬", "🌊", "🧳"], "#eff6ff66", "#bfdbfe44", "#0284c744"), size: iconSize() },

  /* ---------- Fashion (8) ---------- */
  { id: "fashionrunway", name: "Runway", category: "fashion", price: 0, accent: "#a855f7", background: iconBg(["👗", "👠", "👜", "🕶️"], "#faf5ff66", "#f3e8ff44", "#a855f744"), size: iconSize() },
  { id: "fashionstreet", name: "Streetwear", category: "fashion", price: 0, accent: "#0f172a", background: iconBg(["🧢", "👟", "🧥", "🎧"], "#f8fafc66", "#e2e8f044", "#33415544"), size: iconSize() },
  { id: "fashionluxury", name: "Luxury", category: "fashion", price: 2, accent: "#eab308", base: "#100d05", background: `${motif(["💎", "👜", "⌚", "✨"], 0.5)}, ${glow("#eab30855", "#a1620733", "#100d05")}`, size: iconSize() },
  { id: "fashionjewel", name: "Jewel Box", category: "fashion", price: 2, accent: "#f0abfc", background: iconBg(["💍", "💎", "📿", "✨"], "#fdf4ff66", "#f5d0fe44", "#c026d344"), size: iconSize() },
  { id: "fashionsummer", name: "Summer Look", category: "fashion", price: 2, accent: "#f97316", background: iconBg(["👙", "🕶️", "👡", "🧴"], "#fff7ed66", "#ffedd544", "#f9731644"), size: iconSize() },
  { id: "fashionvintage", name: "Vintage Chic", category: "fashion", price: 3, accent: "#b45309", background: iconBg(["👒", "🧵", "🪡", "🎩"], "#fefce866", "#fef3c744", "#b4530944"), size: iconSize() },
  { id: "fashionmakeup", name: "Makeup Studio", category: "fashion", price: 3, accent: "#ec4899", background: iconBg(["💄", "🖌️", "💅", "🪞"], "#fdf2f866", "#fce7f344", "#ec489944"), size: iconSize() },
  { id: "fashionnight", name: "Catwalk Night", category: "fashion", price: 4, accent: "#f472b6", base: "#0f0a14", background: `${motif(["👠", "💫", "👗", "📸"], 0.5)}, ${glow("#f472b655", "#a855f744", "#0f0a14")}`, size: iconSize() },
];

/** Replaces the adult icon motifs with editorial photography while preserving IDs and prices. */
export const CHAT_WALLPAPERS: ChatWallpaper[] = BASE_CHAT_WALLPAPERS.map((wallpaper) => {
  const photo = PHOTO_CHAT_WALLPAPERS[wallpaper.id];
  if (!photo) return wallpaper;

  const darkOverlay = wallpaper.category === "mens" || wallpaper.id.endsWith("night");
  return {
    ...wallpaper,
    background: `${darkOverlay ? "linear-gradient(rgb(0 0 0 / 0.26), rgb(0 0 0 / 0.38))" : "linear-gradient(rgb(255 255 255 / 0.14), rgb(0 0 0 / 0.16))"}, url("${photo}")`,
    base: darkOverlay ? "#111111" : "#f5f5f4",
    size: "cover",
    position: "center",
  };
});

export const CHAT_WALLPAPER_MAP: Record<string, ChatWallpaper> = Object.fromEntries(
  CHAT_WALLPAPERS.map((w) => [w.id, w]),
);

export const DEFAULT_CHAT_WALLPAPER = CHAT_WALLPAPER_MAP.abstract;
