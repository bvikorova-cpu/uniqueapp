import { Link } from "react-router-dom";
import { Sparkles, Plus } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

/**
 * Mobile menu pill: shows only the paid AI credit bucket.
 */
export const MobileCreditsPill = () => {
  const { paidBalance, loading } = useAICredits();

  if (loading) return null;

  const lowPaid = paidBalance < 5;

  return (
    <div className="mb-2">
      <Link
        to="/ai-credits"
        title="AI credits (purchased)"
        className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 border backdrop-blur-md transition-all active:scale-[0.98] ${
          lowPaid
            ? "bg-destructive/10 border-destructive/40 text-destructive"
            : "bg-gradient-to-r from-violet-500/15 to-pink-500/15 border-violet-300/40 text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className={`h-4 w-4 shrink-0 ${lowPaid ? "" : "text-violet-500"}`} />
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-bold tabular-nums">{paidBalance}</div>
            <div className="text-[9px] uppercase font-bold tracking-wider opacity-70">AI credits</div>
          </div>
        </div>
        <Plus className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </Link>
    </div>
  );
};

export default MobileCreditsPill;
