import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Palette, Sparkles, Sun, Snowflake, Leaf, Flower2 } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";

const CREDIT_COST = 8;

interface SeasonResult {
  season: string;
  sub_season: string;
  description: string;
  best_colors: { name: string; hex: string; usage: string }[];
  avoid_colors: { name: string; hex: string; reason: string }[];
  metal_preference: string;
  best_neutrals: { name: string; hex: string }[];
  makeup_palette: { category: string; shades: string[] }[];
  celebrity_examples: string[];
  wardrobe_essentials: string[];
  color_combinations: { combo: string[]; occasion: string }[];
}

export default function AIColorSeasonAnalysis() {
  const { credits, spendCredit } = useAICredits();
  const [skinTone, setSkinTone] = useState("medium");
  const [hairColor, setHairColor] = useState("brown");
  const [eyeColor, setEyeColor] = useState("brown");
  const [undertone, setUndertone] = useState("warm");
  const [result, setResult] = useState<SeasonResult | null>(null);

  const analyze = useMutation({
    mutationFn: async () => {
      if ((credits?.credits_remaining || 0) < CREDIT_COST) throw new Error("Not enough credits");
      const success = await spendCredit("custom_generation", "Color Season Analysis");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "color-season", skin_tone: skinTone, hair_color: hairColor, eye_color: eyeColor, undertone },
      });
      if (error) throw error;
      return data as SeasonResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Your color season has been determined!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const seasonIcons: Record<string, React.ReactNode> = {
    Spring: <Flower2 className="h-6 w-6 text-pink-400" />,
    Summer: <Sun className="h-6 w-6 text-amber-400" />,
    Autumn: <Leaf className="h-6 w-6 text-orange-400" />,
    Winter: <Snowflake className="h-6 w-6 text-blue-400" />,
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Color Season Analysis</h3>
            <p className="text-sm text-muted-foreground">Discover your perfect color palette • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Skin Tone</Label>
            <Select value={skinTone} onValueChange={setSkinTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="very-fair">Very Fair</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="light-medium">Light Medium</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="olive">Olive</SelectItem>
                <SelectItem value="tan">Tan</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hair Color</Label>
            <Select value={hairColor} onValueChange={setHairColor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blonde">Blonde</SelectItem>
                <SelectItem value="light-brown">Light Brown</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="dark-brown">Dark Brown</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="auburn">Auburn</SelectItem>
                <SelectItem value="gray">Gray/Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Eye Color</Label>
            <Select value={eyeColor} onValueChange={setEyeColor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="hazel">Hazel</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="dark-brown">Dark Brown</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Undertone</Label>
            <Select value={undertone} onValueChange={setUndertone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warm">Warm (Yellow/Peachy)</SelectItem>
                <SelectItem value="cool">Cool (Pink/Blue)</SelectItem>
                <SelectItem value="neutral">Neutral (Mix)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="w-full gap-2">
          {analyze.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze My Color Season ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 bg-gradient-to-r from-pink-500/10 via-primary/10 to-violet-500/10 border-primary/20 text-center">
              <div className="mb-2">{seasonIcons[result.season] || seasonIcons.Spring}</div>
              <h3 className="font-black text-2xl">{result.season}</h3>
              <p className="text-sm text-primary font-medium">{result.sub_season}</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{result.description}</p>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-3">✨ Your Best Colors</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.best_colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg border border-border/50 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <div>
                      <p className="text-xs font-medium">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-red-500/20">
              <h4 className="font-bold text-sm mb-3">🚫 Colors to Avoid</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.avoid_colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg border border-border/50 flex-shrink-0 opacity-60" style={{ backgroundColor: c.hex }} />
                    <div>
                      <p className="text-xs font-medium">{c.name}</p>
                      <p className="text-[10px] text-red-400">{c.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">🎨 Best Color Combinations</h4>
              <div className="space-y-2">
                {result.color_combinations.map((combo, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {combo.combo.map((hex, j) => (
                        <div key={j} className="w-6 h-6 rounded-full border border-border/50" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{combo.occasion}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">👗 Wardrobe Essentials</h4>
              <div className="flex flex-wrap gap-2">
                {result.wardrobe_essentials.map((e, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{e}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
