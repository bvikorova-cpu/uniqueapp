import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Utensils, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { AiMarkdown } from "../common/AiMarkdown";

export default function AIMealAnalyzer({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [meal, setMeal] = useState("");

  const analyze = async () => {
    if (!meal.trim()) return toast.error("Describe your meal first");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "nutrition_plan",
          message: `Analyze this meal in detail: "${meal}".

Use markdown with these sections:
## Overview
Short summary of the meal quality.

## Nutrition Breakdown
A markdown table with columns: Nutrient | Amount | % Daily Value — include calories, protein, carbs, sugar, fat, saturated fat, fiber, sodium.

## Micronutrients
Key vitamins & minerals with what they do.

## Weight-Loss Score
Rating X/10 with reasoning (satiety, calorie density, protein ratio, glycemic impact).

## Improvements
4-6 concrete swaps or additions with the expected effect.

## Portion & Timing Tips
Best time to eat it, portion adjustments for cutting vs maintenance.

## Verdict
One-line verdict with an emoji rating.` } });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");

    } catch (e: any) {
      toast.error(e.message || "Error analyzing meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Meal Analyzer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Meal Analyzer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Meal Analyzer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5 text-orange-500" /> AI Meal Analyzer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Describe your meal in detail, e.g. 'Grilled chicken breast 200g, brown rice 150g, steamed broccoli, olive oil dressing'" value={meal} onChange={e => setMeal(e.target.value)} rows={4} />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze Meal (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-orange-500/5 border-orange-500/20 mt-4">
              <CardContent className="p-4"><AiMarkdown content={result} /></CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
