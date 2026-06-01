import { Link } from "react-router-dom";
import { Sparkles, Plus } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

/**
 * Compact AI credits indicator shown in the mobile menu above the Wall item.
 * Paid-only model — no free tier displayed.
 */
export const MobileCreditsPill = () => {
  const { credits, loading } = useAICredits();

  if (loading) return null;

  const remaining = credits?.credits_remaining ?? 0;
  const low = remaining < 5;

  return (
    <Link
      to="/ai-credits"
      className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 mb-2 border backdrop-blur-md transition-all active:scale-[0.98] ${
        low
          ? "bg-destructive/10 border-destructive/40 text-destructive"
          : "bg-gradient-to-r from-violet-500/15 to-pink-500/15 border-violet-300/40 text-foreground"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className={`h-4 w-4 shrink-0 ${low ? "" : "text-violet-500"}`} />
        <span className="text-sm font-semibold">
          {remaining} AI credit{remaining === 1 ? "" : "s"}
        </span>
        {low && <span className="text-[10px] uppercase font-bold">Low</span>}
      </div>
      <div className="flex items-center gap-1 text-xs font-medium opacity-80 shrink-0">
        <Plus className="h-3 w-3" />
        Buy
      </div>
    </Link>
  );
};

export default MobileCreditsPill;
