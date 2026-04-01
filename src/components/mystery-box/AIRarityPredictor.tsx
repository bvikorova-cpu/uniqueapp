import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Brain, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const AIRarityPredictor = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  const COST = 10;

  const predict = async () => {
    if (credits.credits_remaining < COST) {
      toast.error(`You need ${COST} credits. Redirecting...`);
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    setPrediction(null);
    try {
      const { data, error } = await supabase.functions.invoke('mystery-box-ai', {
        body: { type: 'rarity_prediction' },
      });
      if (error) throw error;
      setPrediction(data.prediction);
      await refresh();
      toast.success("Prediction generated!");
    } catch (e: any) {
      toast.error(e.message || "Error generating prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">AI Rarity Predictor</h2>
            <p className="text-muted-foreground text-sm">AI analyzes patterns & suggests best boxes to buy</p>
          </div>
          <span className="ml-auto text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">{COST} Credits</span>
        </motion.div>

        <div className="space-y-4">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
              <TrendingUp className="h-5 w-5 text-violet-400 mb-2" />
              <h4 className="font-bold text-sm">Drop Rate Analysis</h4>
              <p className="text-xs text-muted-foreground">AI calculates optimal timing and box selection</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20">
              <Sparkles className="h-5 w-5 text-yellow-400 mb-2" />
              <h4 className="font-bold text-sm">Lucky Patterns</h4>
              <p className="text-xs text-muted-foreground">Identifies historical lucky streaks & trends</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <Brain className="h-5 w-5 text-green-400 mb-2" />
              <h4 className="font-bold text-sm">Smart Strategy</h4>
              <p className="text-xs text-muted-foreground">Personalized recommendations for max ROI</p>
            </Card>
          </div>

          <Button
            onClick={predict}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-base shadow-lg shadow-yellow-500/20"
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</> : <><Brain className="h-5 w-5 mr-2" /> Generate Prediction — {COST} Credits</>}
          </Button>

          {prediction && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border-yellow-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">🔮 AI Prediction Report</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{prediction}</div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};
