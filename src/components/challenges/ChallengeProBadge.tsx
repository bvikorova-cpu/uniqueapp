import { Leaf, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Badge shown next to a user's name in Eco / Healthy Challenge feeds and
 * leaderboards. Two variants:
 *  - "pro"  → gold leaf (Challenge PRO €3/mo)
 *  - "top"  → pink/purple crown (Challenge TOP €5/mo)
 */
export function ChallengeProBadge({
  className,
  compact = false,
  tier = "pro",
}: {
  className?: string;
  compact?: boolean;
  tier?: "pro" | "top";
}) {
  if (tier === "top") {
    return (
      <span
        title="Challenge TOP — 500k XP + 1M credits monthly, pinned in feed"
        aria-label="Challenge TOP"
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-bold shadow-sm ring-1",
          "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500",
          "text-white ring-pink-300/60",
          compact ? "px-1.5 py-0 text-[10px] leading-4" : "px-2 py-0.5 text-[11px] leading-4",
          className,
        )}
      >
        <Crown className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} fill="currentColor" />
        {!compact && <span className="tracking-wide">TOP</span>}
      </span>
    );
  }

  return (
    <span
      title="Challenge PRO — Eco-Champion (2× monthly prize)"
      aria-label="Challenge PRO — Eco-Champion"
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500",
        "text-amber-950 font-bold shadow-sm ring-1 ring-amber-500/50",
        compact ? "px-1.5 py-0 text-[10px] leading-4" : "px-2 py-0.5 text-[11px] leading-4",
        className,
      )}
    >
      <Leaf className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} fill="currentColor" />
      {!compact && <span className="tracking-wide">PRO</span>}
    </span>
  );
}
