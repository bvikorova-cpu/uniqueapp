import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Heart, Sparkles, Smile, Frown, Zap, Coffee, Moon, Sun } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 5;

interface MoodOutfit {
  outfit_name: string;
  description: string;
  key_pieces: string[];
  color_palette: string[];
  accessories: string[];
  fragrance_suggestion: string;
  playlist_vibe: string;
  confidence_boost: string;
}

interface MoodResult {
  detected_mood: string;
  mood_emoji: string;
  mood_color: string;
  fashion_prescription: string;
  outfits: MoodOutfit[];
  color_therapy: { color: string; hex: string; effect: string }[];
  mood_boosting_tips: string[];
  avoid_wearing: string[];
}

const MOODS = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "💪", label: "Powerful", value: "powerful" },
  { emoji: "🥰", label: "Romantic", value: "romantic" },
  { emoji: "😎", label: "Confident", value: "confident" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "🤗", label: "Social", value: "social" },
  { emoji: "🧘", label: "Zen", value: "zen" },
  { emoji: "🔥", label: "Bold", value: "bold" },
];

export default function AIFashionMoodRing() {
  const { credits, spendCredit } = useAICredits();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState([50]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<MoodResult | null>(null);

  const analyze = useMutation({
    mutationFn: async () => {
      if (!selectedMood) throw new Error("Please select your mood");
      if ((credits?.credits_remaining || 0) < CREDIT_COST) throw new Error("Not enough credits");
      const success = await spendCredit("custom_generation", "Fashion Mood Ring");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "mood-ring", mood: selectedMood, energy_level: energy[0], context },
      });
      if (error) throw error;
      return data as MoodResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Your mood-matched outfits are ready!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <FloatingHowItWorks title="How AIFashion Mood Ring works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Fashion Mood Ring</h3>
            <p className="text-sm text-muted-foreground">Outfit suggestions based on your mood • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="mb-4">
          <Label className="mb-2 block">How are you feeling?</Label>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                  selectedMood === m.value
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border/50 bg-card/50 hover:border-primary/30"
                }`}
              >
                <span className="text-2xl block">{m.emoji}</span>
                <span className="text-[10px] font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Label className="mb-2 block">Energy Level: {energy[0]}%</Label>
          <div className="flex items-center gap-3">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <Slider value={energy} onValueChange={setEnergy} max={100} step={10} className="flex-1" />
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="mb-4">
          <Label>Context (optional)</Label>
          <Textarea
            placeholder="e.g. Going to a gallery opening, need to feel creative..."
            value={context}
            onChange={e => setContext(e.target.value)}
            rows={2}
          />
        </div>

        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending || !selectedMood} className="w-full gap-2">
          {analyze.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Get Mood-Matched Outfits ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${result.mood_color}15, transparent)`, borderColor: `${result.mood_color}40` }}>
              <span className="text-5xl block mb-2">{result.mood_emoji}</span>
              <h3 className="font-black text-xl mb-1">{result.detected_mood}</h3>
              <p className="text-sm text-muted-foreground">{result.fashion_prescription}</p>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-3">🎨 Color Therapy</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.color_therapy.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <div>
                      <p className="text-xs font-medium">{c.color}</p>
                      <p className="text-[10px] text-muted-foreground">{c.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-3">
              {result.outfits.map((o, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 transition-all">
                    <h4 className="font-bold text-sm mb-1">{o.outfit_name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{o.description}</p>

                    <div className="flex gap-1 mb-2">
                      {o.color_palette.map((c, j) => (
                        <div key={j} className="w-5 h-5 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {o.key_pieces.map((p, j) => (
                        <span key={j} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-2">
                      <p>🎵 {o.playlist_vibe}</p>
                      <p>✨ {o.fragrance_suggestion}</p>
                    </div>
                    <p className="text-xs text-primary mt-2 font-medium">💪 {o.confidence_boost}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="p-4 bg-red-500/5 border-red-500/20">
              <h4 className="font-bold text-sm mb-2">🚫 Avoid Wearing Today</h4>
              <div className="flex flex-wrap gap-2">
                {result.avoid_wearing.map((a, i) => (
                  <span key={i} className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
