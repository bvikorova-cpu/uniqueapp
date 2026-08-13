/**
 * Frame styles for Battle Coins cosmetics.
 *
 * IMPORTANT: Tailwind only ships classes it can find in the source at build
 * time. The `css_class` column in `battle_cosmetics` is loaded at runtime, so
 * those class names are purged and frames never render. We therefore keep the
 * literal class strings here, keyed by cosmetic code.
 */
export const COSMETIC_FRAME_CLASSES: Record<string, string> = {
  frame_neon: "ring-2 ring-primary shadow-[0_0_18px_hsl(var(--primary))]",
  frame_gold: "ring-2 ring-yellow-400 shadow-[0_0_22px_rgba(250,204,21,0.7)]",
  frame_mint: "ring-2 ring-emerald-400",
  frame_inferno: "ring-2 ring-orange-500 shadow-[0_0_26px_rgba(249,115,22,0.8)]",
  frame_aurora:
    "aurora-legend-frame ring-0 p-[3px] shadow-[0_0_10px_rgba(232,121,249,0.45),0_0_20px_rgba(168,85,247,0.25)]",
};

/** Resolve a safe, build-time-known frame class for a cosmetic code. */
export function frameClassForCode(code?: string | null): string {
  if (!code) return "";
  return COSMETIC_FRAME_CLASSES[code] ?? "ring-2 ring-primary";
}
