import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Scissors, Upload, Sparkles, ThermometerSun, Droplets, Wind, Shield } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";

const CREDIT_COST = 10;

interface FabricResult {
  fabric_name: string;
  composition: { material: string; percentage: number }[];
  quality_score: number;
  breathability: number;
  durability: number;
  comfort: number;
  care_instructions: { icon: string; instruction: string }[];
  best_seasons: string[];
  styling_tips: string[];
  sustainability_rating: string;
  price_tier: string;
  similar_alternatives: { name: string; pros: string; cons: string }[];
}

export default function AIFabricAnalyzer() {
  const { credits, spendCredit } = useAICredits();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<FabricResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = useMutation({
    mutationFn: async () => {
      if (!preview) throw new Error("Please upload a fabric image");
      if ((credits?.credits_remaining || 0) < CREDIT_COST) throw new Error("Not enough credits");
      const success = await spendCredit("custom_generation", "Fabric Analyzer");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "fabric-analyzer", image: preview },
      });
      if (error) throw error;
      return data as FabricResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Fabric analysis complete!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scoreColor = (score: number) => score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Fabric & Material Analyzer</h3>
            <p className="text-sm text-muted-foreground">Identify fabrics, quality & care from photos • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center mb-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="Fabric" className="max-h-48 mx-auto rounded-lg object-cover" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload a close-up photo of the fabric</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending || !preview} className="w-full gap-2">
          {analyze.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze Fabric ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-5 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-primary/20">
              <h3 className="font-bold text-xl mb-1">{result.fabric_name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Quality: <strong className={scoreColor(result.quality_score)}>{result.quality_score}/100</strong></span>
                <span>•</span>
                <span>{result.price_tier}</span>
                <span>•</span>
                <span>🌿 {result.sustainability_rating}</span>
              </div>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Quality", value: result.quality_score, icon: Shield },
                { label: "Breathability", value: result.breathability, icon: Wind },
                { label: "Durability", value: result.durability, icon: ThermometerSun },
                { label: "Comfort", value: result.comfort, icon: Droplets },
              ].map((stat) => (
                <Card key={stat.label} className="p-3 bg-card/80 backdrop-blur-xl border-border/50 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className={`text-xl font-black ${scoreColor(stat.value)}`}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">Composition</h4>
              <div className="space-y-2">
                {result.composition.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${c.percentage}%` }} />
                    </div>
                    <span className="text-xs font-medium w-24">{c.material} {c.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">Care Instructions</h4>
              <div className="grid grid-cols-2 gap-2">
                {result.care_instructions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-lg">{c.icon}</span>
                    <span>{c.instruction}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">Similar Alternatives</h4>
              <div className="space-y-2">
                {result.similar_alternatives.map((alt, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{alt.name}</p>
                    <p className="text-[10px] text-green-500">✓ {alt.pros}</p>
                    <p className="text-[10px] text-red-400">✗ {alt.cons}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
