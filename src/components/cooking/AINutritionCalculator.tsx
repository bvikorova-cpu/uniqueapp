import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import AiMarkdown from "@/components/common/AiMarkdown";

interface Props { onBack: () => void; }

export default function AINutritionCalculator({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Nutrition Calculator");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "cooking_ai",
          prompt: `You are a certified clinical nutritionist. Produce an exhaustive nutritional analysis in clean markdown (use ## and ### headings, bullet lists and markdown tables — never raw text walls). Use metric units only.

Structure it exactly like this:
## Overview
Recognised dish/meal, serving size in grams, number of servings, and stated assumptions (cooking method, added fat, etc.).

## Per-ingredient breakdown
A markdown table: Ingredient | Amount (g/ml) | kcal | Protein (g) | Carbs (g) | Fat (g).

## Total nutrition per serving
A markdown table with: kcal, protein, carbs (of which sugars), fibre, fat (of which saturated), sodium, cholesterol, water content. Add the % of a 2000 kcal daily reference intake for each row.

## Macro split
Percentages of calories from protein / carbs / fat, plus protein quality note and whether the split fits a balanced, low-carb or high-protein pattern.

## Vitamins & minerals
Table of the key micronutrients with amount and %DV (vitamin A, C, D, E, K, B6, B12, folate, calcium, iron, magnesium, potassium, zinc, selenium).

## Glycemic impact
Estimated glycemic index and glycemic load, expected blood-sugar curve, and pairing advice to flatten it.

## Health score
A score out of 100 with a short justification, plus **Strengths** and **Weaknesses** bullet lists.

## Suitability
Bullets for: weight loss, muscle gain, diabetes, heart health, keto, vegetarian/vegan, gluten-free, kids, athletes — each with a clear yes/no/adjust and why.

## Allergens & sensitivities
Bullet list of likely allergens and hidden sources.

## Smarter modifications
At least 5 concrete swaps with the exact kcal/macro change each one produces.

## Activity equivalent
Minutes of walking, running, cycling and swimming needed to burn this serving.

## Verdict
2-3 sentence practical summary.

Recipe/meal to analyse: ${input}`,
        } });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AINutrition Calculator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
          <Calculator className="h-5 w-5 text-green-400" />
          <span className="font-bold text-green-400">AI Nutrition Calculator</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Paste a recipe or describe a meal for full nutritional analysis</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. Grilled chicken breast 200g with steamed broccoli 150g, brown rice 180g, drizzled with olive oil 15ml and lemon juice..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Calculate Nutrition</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-green-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Calculator className="h-5 w-5 text-green-400" /> Nutritional Breakdown</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
    );
}
