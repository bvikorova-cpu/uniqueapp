/**
 * Purchasable decorative frames for Unlock Videos.
 * Classes must be literal so Tailwind keeps them.
 * Costs mirror the SQL function public.video_frame_cost().
 */

export interface VideoFrameDef {
  slug: string;
  name: string;
  credits: number;
  /** Outer wrapper: padding + background that shows around the video. */
  wrapper: string;
  /** Optional decorative layer behind the video (clip-battle style shards etc.). */
  decor?: string;
  /** Inner container around the video itself. */
  inner: string;
}

export const VIDEO_FRAMES: VideoFrameDef[] = [
  {
    slug: "vframe_none",
    name: "No frame",
    credits: 0,
    wrapper: "p-0",
    inner: "rounded-none",
  },
  {
    slug: "vframe_soft_glow",
    name: "Soft Glow",
    credits: 2,
    wrapper: "p-2 bg-primary/10",
    inner: "rounded-xl ring-2 ring-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.35)]",
  },
  {
    slug: "vframe_neon_pulse",
    name: "Neon Pulse",
    credits: 3,
    wrapper: "p-2.5 bg-gradient-to-br from-fuchsia-500/20 via-primary/20 to-cyan-400/20",
    inner: "rounded-xl ring-4 ring-fuchsia-400 shadow-[0_0_26px_rgba(232,121,249,0.75)] animate-pulse",
  },
  {
    slug: "vframe_gold_luxe",
    name: "Gold Luxe",
    credits: 3,
    wrapper: "p-2.5 bg-gradient-to-br from-amber-300/30 via-yellow-500/25 to-amber-700/30",
    inner: "rounded-xl ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)]",
  },
  {
    slug: "vframe_chrome_edge",
    name: "Chrome Edge",
    credits: 4,
    wrapper: "p-2.5 bg-gradient-to-br from-slate-200/40 via-slate-400/30 to-slate-700/40",
    inner: "rounded-xl ring-4 ring-slate-300 shadow-[0_0_22px_rgba(203,213,225,0.7)]",
  },
  {
    slug: "vframe_battle_shards",
    name: "Battle Shards",
    credits: 5,
    wrapper: "p-4 bg-transparent",
    decor:
      "before:absolute before:-left-6 before:top-6 before:h-40 before:w-40 before:rotate-12 before:rounded-3xl before:bg-primary/40 before:blur-[2px] after:absolute after:-right-4 after:-top-4 after:h-44 after:w-44 after:-rotate-12 after:rounded-3xl after:bg-cyan-400/40 after:blur-[2px]",
    inner: "rounded-xl ring-2 ring-primary/50 shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.6)]",
  },
  {
    slug: "vframe_aurora_wave",
    name: "Aurora Wave",
    credits: 5,
    wrapper:
      "p-3 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.5),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(129,140,248,0.5),transparent_55%),linear-gradient(to_bottom_right,rgba(15,23,42,0.5),rgba(49,46,129,0.5))]",
    inner: "rounded-2xl ring-2 ring-emerald-300/70 shadow-[0_0_26px_rgba(52,211,153,0.55)]",
  },
  {
    slug: "vframe_cyber_grid",
    name: "Cyber Grid",
    credits: 6,
    wrapper:
      "p-3 bg-[linear-gradient(rgba(34,211,238,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.25)_1px,transparent_1px)] [background-size:16px_16px]",
    inner: "rounded-lg ring-4 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.7)]",
  },
  {
    slug: "vframe_rose_bloom",
    name: "Rose Bloom",
    credits: 6,
    wrapper: "p-3 bg-gradient-to-br from-rose-300/40 via-pink-400/30 to-fuchsia-500/40",
    decor:
      "before:absolute before:-left-3 before:bottom-4 before:h-28 before:w-28 before:rotate-45 before:rounded-full before:bg-rose-400/40 before:blur-sm after:absolute after:-right-3 after:top-3 after:h-24 after:w-24 after:rounded-full after:bg-fuchsia-400/40 after:blur-sm",
    inner: "rounded-2xl ring-4 ring-rose-300 shadow-[0_0_24px_rgba(251,113,133,0.65)]",
  },
  {
    slug: "vframe_holo_prism",
    name: "Holo Prism",
    credits: 8,
    wrapper:
      "p-3 bg-[conic-gradient(at_30%_30%,#22d3ee,#a855f7,#f472b6,#facc15,#22d3ee)]",
    inner: "rounded-2xl ring-2 ring-white/70 shadow-[0_0_30px_rgba(168,85,247,0.7)]",
  },
  {
    slug: "vframe_mythic_crown",
    name: "Mythic Crown",
    credits: 10,
    wrapper:
      "p-4 bg-[conic-gradient(from_0deg,#fde68a,#f59e0b,#a855f7,#38bdf8,#fde68a)] animate-pulse",
    decor:
      "before:absolute before:left-1/2 before:top-1 before:h-16 before:w-16 before:-translate-x-1/2 before:rotate-45 before:rounded-xl before:bg-amber-300/60 before:blur-[3px]",
    inner: "rounded-2xl ring-4 ring-amber-200 shadow-[0_0_36px_rgba(245,158,11,0.8)]",
  },
];

export const videoFrame = (slug?: string | null): VideoFrameDef =>
  VIDEO_FRAMES.find((f) => f.slug === (slug || "vframe_none")) ?? VIDEO_FRAMES[0];
