import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const CUISINES = ["Italian", "Japanese", "Mexican", "Indian", "French", "Thai", "Korean", "Mediterranean", "Middle Eastern", "Chinese"];

export default function AICuisineConverter({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [targetCuisine, setTargetCuisine] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const convert = async () => {
    if (!input.trim() || !targetCuisine) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Cuisine Converter");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { type: "cooking_ai", prompt: `You are a world-renowned chef specialising in authentic ${targetCuisine} cuisine. Convert the recipe below into a genuine ${targetCuisine} dish. Answer in clean markdown (## and ### headings, bullet lists, markdown tables). No long intro paragraph — start straight with the first heading. Metric units and EUR only.

Structure it exactly like this:
## New dish name
Name in the target language + English translation + one-line pronunciation guide.

## What changes and why
3-5 bullets summarising the transformation of the original dish.

## Ingredient conversion table
Markdown table: Original ingredient | ${targetCuisine} replacement | Amount (g/ml) | Why it works | Where to buy / substitute.

## Authentic pantry additions
Bullets of the signature spices, pastes, sauces, fats or aromatics that make it truly ${targetCuisine}, with the amount for this recipe.

## Technique changes
Bullets comparing the original technique to the ${targetCuisine} method (heat, pan, order of steps, marinating, resting).

## Flavour profile
Bullets for salt, acid, heat, umami, sweetness, aroma and texture — before vs after.

## Step-by-step method
Numbered steps with exact times, temperatures and sensory cues (what it should look, smell and sound like). Include prep time, cook time and total time.

## Serving & pairing
Traditional side dishes, garnish, tableware, plus a drink pairing (wine, beer, tea or non-alcoholic) with an approximate price in EUR.

## Cultural context
Short paragraph on the dish's regional origin and how it is eaten locally.

## Chef's tips & common mistakes
5 bullets of pro tips, plus 3 mistakes to avoid.

## Make-ahead, storage & leftovers
Fridge/freezer times, reheating method and one leftover idea.

## Variations
Bullets for vegetarian/vegan, gluten-free, spicier, kid-friendly and budget versions.

## Nutrition estimate per serving
Small markdown table: kcal, protein, carbs, fat, fibre, sodium.

Original recipe: ${input}` } });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AICuisine Converter works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
          <Globe className="h-5 w-5 text-violet-400" />
          <span className="font-bold text-violet-400">AI Cuisine Converter</span>
          <span className="text-xs bg-violet-500/20 px-2 py-0.5 rounded-full text-violet-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Transform any recipe into a different cuisine style</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60 space-y-4">
        <Select value={targetCuisine} onValueChange={setTargetCuisine}>
          <SelectTrigger><SelectValue placeholder="Select target cuisine" /></SelectTrigger>
          <SelectContent>
            {CUISINES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea placeholder="Paste your recipe or describe the dish you want to convert..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} />
        <Button onClick={convert} disabled={loading || !input.trim() || !targetCuisine} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting...</> : <><Sparkles className="h-4 w-4 mr-2" /> Convert to {targetCuisine || "..."}</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-violet-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Globe className="h-5 w-5 text-violet-400" /> {targetCuisine} Version</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
    );
}
