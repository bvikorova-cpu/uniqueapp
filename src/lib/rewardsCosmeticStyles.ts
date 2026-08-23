/**
 * Literal Tailwind class maps for Rewards cosmetics.
 *
 * Slugs come from the database at runtime, so class names must exist literally
 * in the source or Tailwind purges them and nothing renders.
 */

export const REWARDS_FRAME_STYLE: Record<string, string> = {
  frame_classic_gold: "ring-4 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.75)]",
  frame_cosmic_aurora:
    "ring-4 ring-fuchsia-400 shadow-[0_0_26px_rgba(232,121,249,0.8)] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400",
  frame_diamond_legend:
    "ring-4 ring-cyan-200 shadow-[0_0_26px_rgba(165,243,252,0.9)] bg-gradient-to-br from-sky-200 via-white to-cyan-300",
  frame_neon_pulse: "ring-4 ring-primary shadow-[0_0_22px_hsl(var(--primary))] animate-pulse",
  frame_rose_petal: "ring-4 ring-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.8)] bg-gradient-to-br from-rose-300 to-pink-500",
  frame_emerald_vine: "ring-4 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] bg-gradient-to-br from-emerald-400 to-teal-600",
  frame_royal_crown: "ring-4 ring-yellow-300 shadow-[0_0_28px_rgba(253,224,71,0.9)] bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700",
  frame_obsidian_flame: "ring-4 ring-orange-600 shadow-[0_0_26px_rgba(234,88,12,0.9)] bg-gradient-to-br from-zinc-900 via-neutral-800 to-orange-700",
  frame_galactic_mythic:
    "ring-4 ring-violet-300 shadow-[0_0_34px_rgba(167,139,250,0.95)] bg-[conic-gradient(at_30%_30%,#22d3ee,#a855f7,#f472b6,#facc15,#22d3ee)]",
};

export const REWARDS_NAME_STYLE: Record<string, string> = {
  name_silver_shine:
    "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
  name_gold_rush:
    "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
  name_emerald_glow: "text-emerald-500 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  name_rainbow_flow: "bg-gradient-to-r from-pink-500 via-orange-400 to-cyan-500 bg-clip-text text-transparent",
  name_ocean_ink: "bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-700 bg-clip-text text-transparent",
  name_lava_flow: "bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent",
  name_neon_cyber: "text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.95)]",
  name_royal_amethyst: "bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 bg-clip-text text-transparent",
  name_starlight_mythic:
    "bg-[conic-gradient(at_50%_50%,#818cf8,#e879f9,#38bdf8,#818cf8)] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(129,140,248,0.9)]",
};

export const REWARDS_THEME_STYLE: Record<string, string> = {
  theme_midnight_purple: "bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900",
  theme_sunset_blaze: "bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600",
  theme_ocean_breeze: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700",
  theme_galaxy_holo: "bg-[conic-gradient(at_30%_30%,#22d3ee,#a855f7,#f472b6,#facc15,#22d3ee)]",
  theme_cherry_blossom: "bg-gradient-to-br from-pink-200 via-rose-300 to-fuchsia-400",
  theme_forest_mist: "bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500",
  theme_desert_dune: "bg-gradient-to-br from-amber-200 via-orange-300 to-yellow-600",
  theme_neon_tokyo: "bg-gradient-to-br from-fuchsia-600 via-purple-700 to-cyan-500",
  theme_aurora_mythic:
    "bg-[radial-gradient(circle_at_20%_20%,#34d399,transparent_55%),radial-gradient(circle_at_80%_30%,#818cf8,transparent_55%),linear-gradient(to_bottom_right,#0f172a,#312e81)]",
};

export const REWARDS_BORDER_STYLE: Record<string, string> = {
  border_simple_pulse: "border-4 border-primary animate-pulse",
  border_fire_ring: "border-4 border-orange-500 shadow-[0_0_22px_rgba(249,115,22,0.85)]",
  border_lightning_storm: "border-4 border-yellow-300 shadow-[0_0_24px_rgba(253,224,71,0.9)] animate-pulse",
  border_rainbow_prism:
    "border-4 border-transparent [background:linear-gradient(hsl(var(--card)),hsl(var(--card)))_padding-box,linear-gradient(120deg,#f472b6,#facc15,#4ade80,#22d3ee,#a855f7)_border-box]",
  border_frost_crystal: "border-4 border-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.9)]",
  border_toxic_glow: "border-4 border-lime-400 shadow-[0_0_22px_rgba(163,230,53,0.9)] animate-pulse",
  border_royal_gold:
    "border-4 border-transparent [background:linear-gradient(hsl(var(--card)),hsl(var(--card)))_padding-box,linear-gradient(120deg,#fde68a,#f59e0b,#b45309,#fde68a)_border-box] shadow-[0_0_20px_rgba(245,158,11,0.7)]",
  border_shadow_smoke: "border-4 border-zinc-700 shadow-[0_0_24px_rgba(63,63,70,0.9)]",
  border_celestial_mythic:
    "border-4 border-transparent [background:linear-gradient(hsl(var(--card)),hsl(var(--card)))_padding-box,conic-gradient(from_0deg,#38bdf8,#a855f7,#f472b6,#38bdf8)_border-box] shadow-[0_0_28px_rgba(168,85,247,0.85)] animate-pulse",
};

export const rewardsFrameClass = (slug?: string | null) => (slug ? REWARDS_FRAME_STYLE[slug] ?? "" : "");
export const rewardsNameClass = (slug?: string | null) => (slug ? REWARDS_NAME_STYLE[slug] ?? "" : "");
export const rewardsThemeClass = (slug?: string | null) => (slug ? REWARDS_THEME_STYLE[slug] ?? "" : "");
export const rewardsBorderClass = (slug?: string | null) => (slug ? REWARDS_BORDER_STYLE[slug] ?? "" : "");
