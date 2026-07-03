import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gold-leaf "Eco-Champion PRO" badge shown next to a user's name in
 * Eco / Healthy Challenge feeds and leaderboards. Rendered when the
 * user has an active `challenge_pro` subscription (€3/mo).
 */
export function ChallengeProBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
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
