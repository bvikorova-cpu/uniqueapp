import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Brain, Loader2, Sparkles, TrendingUp, Target, BarChart3, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIRarityPredictor = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<"rarity_prediction" | "box_strategy">("rarity_prediction");

  const COSTS: Record<string, number> = { rarity_prediction: 10, box_strategy: 8 };
  const cost = COSTS[analysisType];

  const predict = async () => {
    if (credits.credits_remaining < cost) {
      toast.error(`You need ${cost} credits. Redirecting...`);
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    setPrediction(null);
    try {
      const { data, error } = await supabase.functions.invoke('mystery-box-ai', {
        body: { type: analysisType },
      });
      if (error) throw error;
      setPrediction(data.prediction);
      await refresh();
      toast.success("AI analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Error generating prediction");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, title: "Drop Rate Analysis", desc: "Statistical breakdown of rarity distributions", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { icon: Target, title: "Optimal Timing", desc: "Best moments to open for higher chances", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { icon: TrendingUp, title: "Lucky Patterns", desc: "Historical streak analysis and trends", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { icon: Lightbulb, title: "Smart Strategy", desc: "Budget optimization recommendations", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  ];

  const analysisOptions = [
    { id: "rarity_prediction" as const, label: "Full Prediction Report", desc: "Complete analysis with patterns, recommendations & collection score", cost: 10 },
    { id: "box_strategy" as const, label: "Quick Strategy Guide", desc: "Concise budget optimization tips", cost: 8 },
  ];

  return (
    <>
      <FloatingHowItWorks title={"A I Rarity Predictor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Rarity Predictor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Rarity Predictor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/90 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">AI Rarity Predictor</h2>
            <p className="text-muted-foreground text-xs">Powered by GPT-4o-mini • Analyzes your luck patterns</p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`p-3 ${f.bg} text-center`}>
                <f.icon className={`h-5 w-5 mx-auto ${f.color} mb-1.5`} />
                <h4 className="font-bold text-xs">{f.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analysis type selection */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-bold text-muted-foreground">Choose Analysis Type</p>
          {analysisOptions.map(opt => (
            <motion.div key={opt.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Card
                className={`p-4 cursor-pointer transition-all ${analysisType === opt.id
                  ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/30"
                  : "border-border/50 hover:border-violet-500/30"
                }`}
                onClick={() => setAnalysisType(opt.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                    {opt.cost} Credits
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={predict}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-violet-500/25 active:scale-[0.97] transition-transform"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing your data...</>
          ) : (
            <><Brain className="h-5 w-5 mr-2" /> Generate Analysis — {cost} Credits</>
          )}
        </Button>

        <AnimatePresence>
          {prediction && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
              <Card className="p-5 bg-gradient-to-br from-violet-500/5 to-purple-600/5 border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <h3 className="font-black text-lg bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">AI Prediction Report</h3>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed text-sm">{prediction}</div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
    </>
  );
};
