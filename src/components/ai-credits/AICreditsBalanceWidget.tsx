import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  compact?: boolean;
}

/**
 * Small reusable balance widget. Drop it into any page that consumes credits.
 */
export const AICreditsBalanceWidget = ({ compact = false }: Props) => {
  const navigate = useNavigate();
  const { credits, loading } = useAICredits();
  const balance = credits?.credits_remaining ?? 0;
  const low = balance <= 5;

  if (compact) {
    return (
    <>
      <FloatingHowItWorks title={"A I Credits Balance Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Credits Balance Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Credits Balance Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <button
        onClick={() => navigate("/ai-credits")}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-colors ${
          low
            ? "bg-amber-500/15 border-amber-400/50 hover:bg-amber-500/25"
            : "bg-primary/10 border-primary/40 hover:bg-primary/20"
        }`}
      >
        <Sparkles className={`h-3.5 w-3.5 ${low ? "text-amber-400" : "text-primary"}`} />
        <span className="text-sm font-black tabular-nums">{loading ? "—" : balance}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">credits</span>
      </button>
    </>
  );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-black tabular-nums">{loading ? "—" : balance}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">AI Credits</p>
        </div>
      </div>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/ai-credits")}>
        <Plus className="h-3.5 w-3.5" /> Top up
      </Button>
    </div>
  );
};
