import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export default function AIDietaryAdvisor({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [dietType, setDietType] = useState("general");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Dietary Advisor");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a certified nutritionist and allergen specialist. Analyze the following food/recipe for dietary compatibility. Diet type: ${dietType}. Provide:
1) ALLERGEN ANALYSIS: List all common allergens present (gluten, dairy, nuts, soy, eggs, shellfish, etc.)
2) DIETARY COMPATIBILITY: Is this suitable for ${dietType}? If not, what needs to change?
3) NUTRIENT PROFILE: Key macros and micros, potential deficiencies
4) HEALTH BENEFITS: Top 5 health benefits of this dish
5) HEALTH CONCERNS: Any potential issues (sodium, sugar, saturated fat)
6) MODIFICATION SUGGESTIONS: How to make it healthier without losing flavor
7) PORTION GUIDANCE: Recommended serving size and frequency
8) PAIRING SUGGESTIONS: What to eat with it for complete nutrition

DISCLAIMER: This is general guidance, not medical advice. Consult a dietitian for specific needs.

Food/Recipe: ${input}` },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-lime-500/20 border border-emerald-500/30">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-emerald-400">AI Dietary Advisor</span>
          <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Analyze any food for allergens, nutrients & dietary compatibility</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60 space-y-4">
        <Select value={dietType} onValueChange={setDietType}>
          <SelectTrigger><SelectValue placeholder="Select diet type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General / No Restrictions</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="keto">Keto / Low-Carb</SelectItem>
            <SelectItem value="paleo">Paleo</SelectItem>
            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
            <SelectItem value="dairy-free">Dairy-Free</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="kosher">Kosher</SelectItem>
            <SelectItem value="diabetic">Diabetic-Friendly</SelectItem>
          </SelectContent>
        </Select>
        <Textarea placeholder="E.g. Pasta carbonara with eggs, guanciale, pecorino romano, black pepper, and spaghetti..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-emerald-500 to-lime-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze Diet Compatibility</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-emerald-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /> Dietary Analysis</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
  );
}
