import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFreeTierCredits } from "@/hooks/useFreeTierCredits";

interface Props {
  compact?: boolean;
}

/**
 * Displays the user's free-tier credit balance.
 * Compact mode is designed for the navbar.
 */
export const FreeTierBalanceWidget = ({ compact = false }: Props) => {
  const navigate = useNavigate();
  const { data, loading } = useFreeTierCredits();
  const balance = data?.balance ?? 0;
  const low = balance <= 2;

  if (compact) {
    return (
      <button
        onClick={() => navigate("/ai-credits")}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-colors ${
          low
            ? "bg-amber-500/15 border-amber-400/50 hover:bg-amber-500/25"
            : "bg-accent/10 border-accent/40 hover:bg-accent/20"
        }`}
        title="Free monthly credits"
      >
        <Gift className={`h-3.5 w-3.5 ${low ? "text-amber-400" : "text-accent"}`} />
        <span className="text-sm font-black tabular-nums">{loading ? "—" : balance}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">free</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/30">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-black tabular-nums">{loading ? "—" : balance}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Free Credits</p>
        </div>
      </div>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/ai-credits")}>
        <Plus className="h-3.5 w-3.5" /> Top up
      </Button>
    </div>
  );
};
