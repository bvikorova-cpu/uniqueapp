import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Sparkles, Music, Lightbulb, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 15;

export default function AIFashionShowSimulator() {
  const [outfits, setOutfits] = useState<string[]>([""]);
  const [theme, setTheme] = useState("");
  const [mood, setMood] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits, spendCredit } = useAICredits();

  const addOutfit = () => setOutfits([...outfits, ""]);
  const removeOutfit = (i: number) => setOutfits(outfits.filter((_, idx) => idx !== i));
  const updateOutfit = (i: number, v: string) => {
    const copy = [...outfits];
    copy[i] = v;
    setOutfits(copy);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Fashion Show Simulator");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "show-simulator", outfitDescriptions: outfits.filter(o => o.trim()), theme, mood },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.showConcept);
      toast.success("Fashion show generated!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate show"),
  });

  return (
    <>
      <FloatingHowItWorks title="How AIFashion Show Simulator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Fashion Show Simulator</h2>
            <p className="text-sm text-muted-foreground">Create a virtual runway show from your outfit concepts • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Show Theme</Label>
              <Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Midnight Elegance, Urban Jungle" />
            </div>
            <div>
              <Label>Mood</Label>
              <Input value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g., Sophisticated, Rebellious, Dreamy" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Runway Looks</Label>
            {outfits.map((outfit, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                <Textarea
                  value={outfit}
                  onChange={e => updateOutfit(i, e.target.value)}
                  placeholder={`Look ${i + 1}: Describe the outfit in detail...`}
                  rows={2}
                  className="flex-1"
                />
                {outfits.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeOutfit(i)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </motion.div>
            ))}
            <Button variant="outline" size="sm" onClick={addOutfit} className="gap-2">
              <Plus className="h-4 w-4" /> Add Look
            </Button>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || outfits.every(o => !o.trim()) || (credits?.credits_remaining || 0) < CREDIT_COST}
            className="w-full gap-2"
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Show...</> : <><Sparkles className="h-4 w-4" /> Generate Fashion Show ({CREDIT_COST} Credits)</>}
          </Button>

          {credits && credits.credits_remaining < CREDIT_COST && (
            <p className="text-sm text-destructive text-center">Insufficient credits ({credits.credits_remaining}/{CREDIT_COST})</p>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 backdrop-blur-xl">
              <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {result.show_title || "Your Fashion Show"}
              </h3>
              {result.opening_statement && <p className="text-sm text-muted-foreground italic mb-4">"{result.opening_statement}"</p>}
              {result.audience_impact_score && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-bold">Impact Score: {result.audience_impact_score}/100</span>
                </div>
              )}
            </Card>

            {result.looks?.map((look: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-5 bg-card/80 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-white">
                      {look.look_number || i + 1}
                    </span>
                    <h4 className="font-bold text-lg">{look.outfit_name || `Look ${i + 1}`}</h4>
                  </div>
                  <p className="text-sm mb-3">{look.runway_description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {look.music_cue && (
                      <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg p-2">
                        <Music className="h-3 w-3 text-primary" />
                        <span>{look.music_cue}</span>
                      </div>
                    )}
                    {look.lighting_direction && (
                      <div className="flex items-center gap-1.5 bg-accent/10 rounded-lg p-2">
                        <Lightbulb className="h-3 w-3 text-accent" />
                        <span>{look.lighting_direction}</span>
                      </div>
                    )}
                  </div>
                  {look.commentary_script && <p className="text-sm italic text-muted-foreground mt-3">"{look.commentary_script}"</p>}
                </Card>
              </motion.div>
            ))}

            {result.finale_description && (
              <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <h4 className="font-bold mb-2">🎆 Finale</h4>
                <p className="text-sm">{result.finale_description}</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
