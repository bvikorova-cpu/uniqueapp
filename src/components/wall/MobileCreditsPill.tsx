import { Link } from "react-router-dom";
import { Gift, Sparkles, Plus } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { useFreeTierCredits } from "@/hooks/useFreeTierCredits";

/**
 * Mobile menu pill: free credits (gift) + AI credits.
 */
export const MobileCreditsPill = () => {
  const { credits, loading } = useAICredits();
  const { data: freeData, loading: freeLoading } = useFreeTierCredits();

  if (loading) return null;

  const remaining = credits?.credits_remaining ?? 0;
  const freeBalance = freeData?.balance ?? 0;
  const low = remaining < 5;

  return (
    <div className="mb-2 flex items-center gap-2">
      {/* Free credits with gift icon */}
      <Link
        to="/ai-credits"
        className="flex items-center gap-2 rounded-2xl px-3 py-2 border border-accent/40 bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-md active:scale-[0.98] transition-all"
      >
        <Gift className="h-4 w-4 text-accent" />
        <span className="text-sm font-bold tabular-nums">{freeLoading ? "—" : freeBalance}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">free</span>
      </Link>

      {/* AI credits */}
      <Link
        to="/ai-credits"
        className={`flex-1 flex items-center justify-between gap-2 rounded-2xl px-3 py-2 border backdrop-blur-md transition-all active:scale-[0.98] ${
          low
            ? "bg-destructive/10 border-destructive/40 text-destructive"
            : "bg-gradient-to-r from-violet-500/15 to-pink-500/15 border-violet-300/40 text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className={`h-4 w-4 shrink-0 ${low ? "" : "text-violet-500"}`} />
          <span className="text-sm font-semibold truncate">{remaining} AI</span>
          {low && <span className="text-[10px] uppercase font-bold">Low</span>}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium opacity-80 shrink-0">
          <Plus className="h-3 w-3" />
          Buy
        </div>
      </Link>
    </div>
  );
};

export default MobileCreditsPill;
