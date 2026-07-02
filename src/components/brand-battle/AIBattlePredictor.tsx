import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Brand { id: string; name: string; logo: string; total_votes: number; }

interface Prediction {
  winnerId: string;
  winnerName: string;
  confidence: number;
  reasoning: string;
  keyFactors: string[];
}

export const AIBattlePredictor = ({ brands }: { brands: Brand[] }) => {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pred, setPred] = useState<Prediction | null>(null);

  const run = async () => {
    if (!a || !b || a === b) { toast.error("Pick two different brands"); return; }
    setLoading(true);
    setPred(null);
    try {
      const { data, error } = await supabase.functions.invoke("brand-battle-predictor", {
        body: { brandAId: a, brandBId: b },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setPred(data as Prediction);
      toast.success(`AI predicts: ${(data as any).winnerName}!`);
    } catch (e: any) {
      toast.error(e.message ?? "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Battle Predictor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Battle Predictor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Battle Predictor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-violet-500/30 bg-gradient-to-br from-zinc-950 via-violet-950/20 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(280_85%_55%/.12),transparent_60%)]" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-violet-100">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          AI Battle Predictor
          <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40">2 credits</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <select value={a} onChange={(e) => setA(e.target.value)} className="rounded-xl bg-zinc-900/80 border border-violet-500/30 text-violet-100 px-3 py-2 text-sm">
            <option value="">Brand A</option>
            {brands.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
          </select>
          <select value={b} onChange={(e) => setB(e.target.value)} className="rounded-xl bg-zinc-900/80 border border-violet-500/30 text-violet-100 px-3 py-2 text-sm">
            <option value="">Brand B</option>
            {brands.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
          </select>
        </div>

        <Button
          onClick={run}
          disabled={loading || !a || !b}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
        >
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> AI thinking…</> : <><Sparkles className="h-4 w-4 mr-2" /> Predict Winner</>}
        </Button>

        <AnimatePresence>
          {pred && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl bg-gradient-to-br from-violet-900/40 to-fuchsia-900/30 border border-violet-400/30 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <p className="font-black text-violet-100 text-lg">{pred.winnerName}</p>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                  {pred.confidence}% confidence
                </Badge>
              </div>
              <p className="text-sm text-violet-100/80 leading-relaxed">{pred.reasoning}</p>
              <div className="flex flex-wrap gap-1.5">
                {pred.keyFactors.map((kf, i) => (
                  <Badge key={i} variant="outline" className="border-violet-400/30 text-violet-200 text-[11px]">
                    {kf}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
  );
};
