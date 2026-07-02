import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Trophy, Loader2, TrendingUp } from "lucide-react";
import { useShadowAITools, useShadowArenaCredits, SHADOW_AI_COSTS } from "@/hooks/useShadowArenaAI";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  battleId: string;
}

export function BattlePredictorPanel({ battleId }: Props) {
  const { predictBattle } = useShadowAITools();
  const { credits } = useShadowArenaCredits();
  const balance = credits?.credits_remaining ?? 0;
  const [result, setResult] = useState<any>(null);

  const handlePredict = () => {
    if (balance < SHADOW_AI_COSTS.predictor) {
      toast.error(`Need ${SHADOW_AI_COSTS.predictor} credits to predict`);
      return;
    }
    predictBattle.mutate({ battleId }, { onSuccess: (data) => setResult(data) });
  };

  return (
    <><FloatingHowItWorks title="BattlePredictorPanel — How it works" steps={[{title:"Open this section",desc:"Access BattlePredictorPanel from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 bg-gradient-to-br from-purple-950/30 via-card/60 to-red-950/20 border-purple-900/30">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-red-900 flex items-center justify-center shadow-[0_0_20px_rgba(127,29,29,0.4)]"
          >
            <TrendingUp className="w-5 h-5 text-purple-100" />
          </motion.div>
          <div>
            <h3 className="font-bold text-purple-200">AI Battle Predictor</h3>
            <p className="text-xs text-muted-foreground">Analyze stories + sentiment to forecast the winner</p>
          </div>
        </div>
        <Button
          onClick={handlePredict}
          disabled={predictBattle.isPending}
          size="sm"
          className="bg-gradient-to-r from-purple-700 to-red-800 hover:from-purple-800 hover:to-red-900"
        >
          {predictBattle.isPending
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Reading the shadows...</>
            : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Predict ({SHADOW_AI_COSTS.predictor} cr)</>}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-black/50 border border-purple-900/40 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <p className="font-bold text-yellow-200">
              Predicted winner: {result.predictedWinner || result.winner_title || "—"}
            </p>
            {result.confidence && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-950/50 border border-purple-800/40 text-purple-200">
                {Math.round(result.confidence * 100)}% confidence
              </span>
            )}
          </div>
          {result.reasoning && (
            <p className="text-sm text-foreground/80 leading-relaxed">{result.reasoning}</p>
          )}
          {result.scores && Array.isArray(result.scores) && (
            <div className="space-y-1.5 pt-2">
              {result.scores.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-32 truncate text-muted-foreground">{s.title}</span>
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-700 to-purple-700"
                      style={{ width: `${(s.score || 0) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-purple-300 font-mono">{Math.round((s.score || 0) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  </>
  );
}
