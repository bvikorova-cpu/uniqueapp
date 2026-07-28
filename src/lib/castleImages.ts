// Central image resolver for Fairy Castles (exteriors + room panoramas).
import cinderellaFlorida from "@/assets/fairy-castles/cinderella-castle-florida.jpg";
import sleepingBeautyCalifornia from "@/assets/fairy-castles/sleeping-beauty-castle-california.jpg";
import parisCastle from "@/assets/fairy-castles/paris-castle.jpg";
import hongkongCastle from "@/assets/fairy-castles/hongkong-castle.jpg";
import shanghaiCastle from "@/assets/fairy-castles/shanghai-castle.jpg";
import tokyoCastle from "@/assets/fairy-castles/tokyo-castle-exterior.jpg";
import bojniceCastle from "@/assets/fairy-castles/bojnice-castle.jpg";
import edinburghCastle from "@/assets/fairy-castles/edinburgh-castle.jpg";
import himejiCastle from "@/assets/fairy-castles/himeji-castle.jpg";
import hohenzollernCastle from "@/assets/fairy-castles/hohenzollern-castle.jpg";
import neuschwansteinCastle from "@/assets/fairy-castles/neuschwanstein-castle.jpg";
import pragueCastle from "@/assets/fairy-castles/prague-castle.jpg";

/** Exterior hero image per castle name (DB names). */
const EXTERIORS: Record<string, string> = {
  "Crystal Castle": cinderellaFlorida,
  "Rose Castle": sleepingBeautyCalifornia,
  "Royal Château": parisCastle,
  "Pearl Castle": hongkongCastle,
  "Jade Castle": shanghaiCastle,
  "Sakura Castle": tokyoCastle,
  "Bojnice Castle": bojniceCastle,
  "Edinburgh Castle": edinburghCastle,
  "Himeji Castle": himejiCastle,
  "Hohenzollern Castle": hohenzollernCastle,
  "Neuschwanstein Castle": neuschwansteinCastle,
  "Prague Castle": pragueCastle,
  // legacy names kept for safety
  "Cinderella Castle": cinderellaFlorida,
  "Sleeping Beauty Castle": sleepingBeautyCalifornia,
  "Tokyo Cinderella Castle": tokyoCastle,
};

export function getCastleImage(name?: string, fallback?: string | null): string {
  if (name && EXTERIORS[name]) return EXTERIORS[name];
  return fallback || cinderellaFlorida;
}

// --- Panoramas -------------------------------------------------------------
const panoramaModules = import.meta.glob<string>(
  "@/assets/fairy-castles/panoramas/*.jpg",
  { eager: true, import: "default" }
);

const PANORAMA_PACKS = [
  "cinderella",
  "sleeping-beauty",
  "paris-belle",
  "magical-dreams",
  "shanghai-storybook",
  "tokyo-cinderella",
] as const;

function packImages(pack: string): string[] {
  return Object.keys(panoramaModules)
    .filter((p) => p.includes(`/${pack}-`))
    .sort((a, b) => {
      const n = (s: string) => parseInt(s.match(/-(\d+)\.jpg$/)?.[1] || "0", 10);
      return n(a) - n(b);
    })
    .map((p) => panoramaModules[p] as unknown as string);
}

const CASTLE_PACK: Record<string, string> = {
  "Crystal Castle": "cinderella",
  "Rose Castle": "sleeping-beauty",
  "Royal Château": "paris-belle",
  "Pearl Castle": "magical-dreams",
  "Jade Castle": "shanghai-storybook",
  "Sakura Castle": "tokyo-cinderella",
  "Bojnice Castle": "paris-belle",
  "Edinburgh Castle": "sleeping-beauty",
  "Himeji Castle": "tokyo-cinderella",
  "Hohenzollern Castle": "magical-dreams",
  "Neuschwanstein Castle": "cinderella",
  "Prague Castle": "shanghai-storybook",
};

/**
 * Resolves the panorama for a room. Generic stock URLs (unsplash placeholders
 * that show unrelated photos like city streets) are replaced with a curated
 * castle-interior panorama from the matching pack.
 */
export function getRoomPanorama(
  castleName: string | undefined,
  roomIndex: number,
  panoramaUrl?: string | null
): string {
  const isStock = !panoramaUrl || /unsplash\.com|placeholder/.test(panoramaUrl);
  if (!isStock) return panoramaUrl!;

  const pack =
    (castleName && CASTLE_PACK[castleName]) ||
    PANORAMA_PACKS[Math.abs((castleName || "").length) % PANORAMA_PACKS.length];
  const images = packImages(pack);
  if (!images.length) return panoramaUrl || "/placeholder.svg";
  return images[roomIndex % images.length];
}
