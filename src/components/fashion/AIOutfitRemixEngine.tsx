import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Repeat, Sparkles, ArrowRight, Star, Zap } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 10;

interface RemixVariation {
  remix_name: string;
  occasion: string;
  changes_made: string[];
  add_items: string[];
  remove_items: string[];
  styling_notes: string;
  vibe: string;
  difficulty: string;
  estimated_cost: string;
}

interface RemixResult {
  original_outfit: string;
  remix_count: number;
  variations: RemixVariation[];
  versatility_score: number;
  most_versatile_piece: string;
}

export default function AIOutfitRemixEngine() {
  const { credits, spendCredit } = useAICredits();
  const [outfit, setOutfit] = useState("");
  const [result, setResult] = useState<RemixResult | null>(null);

  const remix = useMutation({
    mutationFn: async () => {
      if ((credits?.credits_remaining || 0) < CREDIT_COST) throw new Error("Not enough credits");
      const success = await spendCredit("custom_generation", "Outfit Remix Engine");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "outfit-remix", outfit_description: outfit },
      });
      if (error) throw error;
      return data as RemixResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`${data.remix_count} remix variations generated!`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const difficultyColor = (d: string) => d === "Easy" ? "text-green-500" : d === "Medium" ? "text-amber-500" : "text-red-500";

  return (
    <>
      <FloatingHowItWorks title="How AIOutfit Remix Engine works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Repeat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Outfit Remix Engine</h3>
            <p className="text-sm text-muted-foreground">Transform 1 outfit into 10 different looks • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="mb-4">
          <Label>Describe Your Outfit</Label>
          <Textarea
            placeholder="e.g. White oversized blazer, black turtleneck, dark wash jeans, white sneakers, silver watch"
            value={outfit}
            onChange={e => setOutfit(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={() => remix.mutate()} disabled={remix.isPending || !outfit.trim()} className="w-full gap-2">
          {remix.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
          Remix This Outfit ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">🔄 {result.remix_count} Remix Variations</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-bold">Versatility: {result.versatility_score}/100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Most versatile piece: <strong>{result.most_versatile_piece}</strong></p>
            </Card>

            <div className="space-y-3">
              {result.variations.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <span className="text-lg">#{i + 1}</span> {v.remix_name}
                        </h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{v.occasion}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-medium ${difficultyColor(v.difficulty)}`}>{v.difficulty}</p>
                        <p className="text-[10px] text-muted-foreground">{v.estimated_cost}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {v.add_items.length > 0 && (
                        <div>
                          <p className="text-[10px] text-green-500 font-medium mb-1">+ Add</p>
                          <div className="flex flex-wrap gap-1">
                            {v.add_items.map((a, j) => (
                              <span key={j} className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {v.remove_items.length > 0 && (
                        <div>
                          <p className="text-[10px] text-red-400 font-medium mb-1">- Remove</p>
                          <div className="flex flex-wrap gap-1">
                            {v.remove_items.map((r, j) => (
                              <span key={j} className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground italic">💡 {v.styling_notes}</p>
                    <div className="mt-1.5">
                      <span className="text-[10px] bg-accent/10 text-accent-foreground px-1.5 py-0.5 rounded-full">Vibe: {v.vibe}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
