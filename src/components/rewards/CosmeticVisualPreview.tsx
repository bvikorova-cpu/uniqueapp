import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Real visual preview of a cosmetic item — shows exactly what the user gets
 * after buying (frame around their avatar, name color, profile theme, border).
 * Styles are literal Tailwind/inline strings so they survive the build purge.
 */

const FRAME_STYLE: Record<string, string> = {
  frame_classic_gold: "ring-4 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.75)]",
  frame_cosmic_aurora:
    "ring-4 ring-fuchsia-400 shadow-[0_0_26px_rgba(232,121,249,0.8)] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400",
  frame_diamond_legend:
    "ring-4 ring-cyan-200 shadow-[0_0_26px_rgba(165,243,252,0.9)] bg-gradient-to-br from-sky-200 via-white to-cyan-300",
  frame_neon_pulse: "ring-4 ring-primary shadow-[0_0_22px_hsl(var(--primary))] animate-pulse",
};

const NAME_STYLE: Record<string, string> = {
  name_silver_shine: "bg-gradient-to-r from-slate-300 via-white to-slate-400 bg-clip-text text-transparent",
  name_gold_rush: "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 bg-clip-text text-transparent",
  name_emerald_glow:
    "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  name_rainbow_flow:
    "bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent",
};

const THEME_STYLE: Record<string, string> = {
  theme_midnight_purple: "bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900",
  theme_sunset_blaze: "bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600",
  theme_ocean_breeze: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700",
  theme_galaxy_holo: "bg-[conic-gradient(at_30%_30%,#22d3ee,#a855f7,#f472b6,#facc15,#22d3ee)]",
};

const BORDER_STYLE: Record<string, string> = {
  border_simple_pulse: "border-4 border-primary animate-pulse",
  border_fire_ring: "border-4 border-orange-500 shadow-[0_0_22px_rgba(249,115,22,0.85)]",
  border_lightning_storm:
    "border-4 border-yellow-300 shadow-[0_0_24px_rgba(253,224,71,0.9)] animate-pulse",
  border_rainbow_prism:
    "border-4 border-transparent [background:linear-gradient(hsl(var(--card)),hsl(var(--card)))_padding-box,linear-gradient(120deg,#f472b6,#facc15,#4ade80,#22d3ee,#a855f7)_border-box]",
};

export default function CosmeticVisualPreview({
  slug,
  category,
  name,
  emoji,
  avatarUrl,
  displayName,
}: {
  slug: string;
  category: string;
  name: string;
  emoji?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
}) {
  const who = displayName || "You";
  const initials = who.slice(0, 2).toUpperCase();

  if (category === "avatar_frame") {
    return (
      <div className="aspect-square rounded mb-2 bg-muted/30 flex items-center justify-center">
        <div className={`rounded-full p-1 ${FRAME_STYLE[slug] ?? "ring-4 ring-primary"}`}>
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || undefined} alt={`${name} preview`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  if (category === "name_color") {
    return (
      <div className="aspect-square rounded mb-2 bg-muted/30 flex flex-col items-center justify-center gap-2 px-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || undefined} alt={`${name} preview`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className={`font-black text-base truncate max-w-full ${NAME_STYLE[slug] ?? "text-primary"}`}>
          {who}
        </span>
      </div>
    );
  }

  if (category === "profile_theme") {
    return (
      <div className={`aspect-square rounded mb-2 overflow-hidden relative ${THEME_STYLE[slug] ?? "bg-gradient-to-br from-primary to-accent"}`}>
        <div className="absolute inset-x-2 bottom-2 rounded-md bg-background/70 backdrop-blur-sm p-1.5 flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || undefined} alt={`${name} preview`} />
            <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-semibold truncate">{who}</span>
        </div>
      </div>
    );
  }

  if (category === "animated_border") {
    return (
      <div className="aspect-square rounded mb-2 bg-muted/30 flex items-center justify-center p-2">
        <div className={`w-full h-full rounded-lg bg-card flex items-center justify-center text-2xl ${BORDER_STYLE[slug] ?? "border-4 border-primary"}`}>
          {emoji || "✨"}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded mb-2 bg-muted/30 flex items-center justify-center text-3xl">
      {emoji || "✨"}
    </div>
  );
}
