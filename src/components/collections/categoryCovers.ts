import mythicBeasts from "@/assets/cards/mythic-beasts.jpg";
import celestialSpirits from "@/assets/cards/celestial-spirits.jpg";
import ancientLegends from "@/assets/cards/ancient-legends.jpg";
import cyberGuardians from "@/assets/cards/cyber-guardians.jpg";
import oceanDepths from "@/assets/cards/ocean-depths.jpg";
import wildKingdom from "@/assets/cards/wild-kingdom.jpg";
import elementalTitans from "@/assets/cards/elemental-titans.jpg";
import shadowOrder from "@/assets/cards/shadow-order.jpg";
import cosmicExplorers from "@/assets/cards/cosmic-explorers.jpg";
import enchantedForest from "@/assets/cards/enchanted-forest.jpg";

/** Illustrated cover artwork per collectible-card category (replaces emoji icons). */
export const CATEGORY_COVERS: Record<string, string> = {
  "mythic-beasts": mythicBeasts,
  "celestial-spirits": celestialSpirits,
  "ancient-legends": ancientLegends,
  "cyber-guardians": cyberGuardians,
  "ocean-depths": oceanDepths,
  "wild-kingdom": wildKingdom,
  "elemental-titans": elementalTitans,
  "shadow-order": shadowOrder,
  "cosmic-explorers": cosmicExplorers,
  "enchanted-forest": enchantedForest,
};

export const getCategoryCover = (slug?: string | null): string | undefined =>
  slug ? CATEGORY_COVERS[slug] : undefined;
