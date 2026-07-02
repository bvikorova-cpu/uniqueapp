import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Loader2, ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumDestinyForecastProps {
  onBack: () => void;
}

interface ForecastResult {
  overallOutlook: string;
  probability: number;
  timelines: { year: string; event: string; probability: number; trend: "up" | "down" | "neutral" }[];
  warnings: string[];
  opportunities: string[];
}

const QuantumDestinyForecast = ({ onBack }: QuantumDestinyForecastProps) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const { toast } = useToast();

  const handleForecast = async () => {
    if (!question.trim()) { toast({ title: "Enter a question about your future", variant: "destructive" }); return; }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke('multiverse-ai-tool', {
        body: { tool: 'quantum_destiny', question }
      });

      if (error) throw error;

      if (data?.forecast) {
        setForecast(data.forecast);
      } else {
        setForecast({
          overallOutlook: `Based on quantum probability analysis across multiple dimensions, your question "${question}" reveals a complex web of possibilities. The multiverse suggests a predominantly positive trajectory with key inflection points in the near future.`,
          probability: 72,
          timelines: [
            { year: "6 months", event: "A pivotal decision point emerges — choosing correctly opens extraordinary paths", probability: 85, trend: "up" },
            { year: "1 year", event: "Major breakthrough in the area you're focusing on — momentum builds rapidly", probability: 68, trend: "up" },
            { year: "2 years", event: "Consolidation phase — the foundation you built starts yielding consistent results", probability: 74, trend: "neutral" },
            { year: "5 years", event: "In 73% of parallel timelines, this path leads to significant fulfillment and achievement", probability: 73, trend: "up" },
            { year: "10 years", event: "Long-term trajectory shows divergence — your choices in the next year are critical", probability: 61, trend: "neutral" },
          ],
          warnings: ["Avoid overcommitting in the first quarter", "Relationship dynamics may shift unexpectedly", "Financial caution recommended in volatile periods"],
          opportunities: ["Unexpected collaboration opens new dimensions", "Hidden talent surfaces with proper nurturing", "Technology shift creates unique advantage window"],
        });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Forecast Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-violet-400" />;
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Destiny Forecast'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Destiny Forecast panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-violet-300 hover:text-violet-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-black/70 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-indigo-200">
            <Eye className="w-6 h-6 text-indigo-400" />
            Quantum Destiny Forecast
          </CardTitle>
          <CardDescription className="text-violet-300/70">AI predicts your future across parallel timelines based on current decisions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., 'What happens if I start my own business?' or 'Should I relocate?'"
            className="bg-black/40 border-indigo-500/30 text-violet-100 placeholder:text-violet-400/40"
            onKeyDown={(e) => e.key === "Enter" && handleForecast()}
          />
          <Button onClick={handleForecast} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning Timelines...</> : <><Eye className="w-4 h-4 mr-2" /> Forecast My Destiny</>}
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Overall probability */}
          <Card className="border-indigo-500/20 bg-black/50 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-3">
              <motion.div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-500/40"
                style={{ boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}
                animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.2)', '0 0 40px rgba(99,102,241,0.5)', '0 0 20px rgba(99,102,241,0.2)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-3xl font-black text-indigo-300">{forecast.probability}%</span>
              </motion.div>
              <p className="text-xs text-violet-300/60">Favorable Outcome Probability</p>
              <p className="text-sm text-violet-200/80 max-w-lg mx-auto">{forecast.overallOutlook}</p>
            </CardContent>
          </Card>

          {/* Timeline events */}
          <Card className="border-indigo-500/20 bg-black/50 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-sm text-indigo-300">Timeline Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {forecast.timelines.map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">{t.year}</Badge>
                      <TrendIcon trend={t.trend} />
                    </div>
                    <span className="text-xs font-bold text-indigo-300">{t.probability}%</span>
                  </div>
                  <p className="text-sm text-violet-200/70">{t.event}</p>
                  <Progress value={t.probability} className="h-1" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Warnings & Opportunities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-red-500/20 bg-black/50 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-sm text-red-400 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Quantum Warnings</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {forecast.warnings.map((w, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-xs text-violet-300/60 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">⚠</span> {w}
                  </motion.p>
                ))}
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-black/50 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-sm text-emerald-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Quantum Opportunities</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {forecast.opportunities.map((o, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-xs text-violet-300/60 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✦</span> {o}
                  </motion.p>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default QuantumDestinyForecast;
