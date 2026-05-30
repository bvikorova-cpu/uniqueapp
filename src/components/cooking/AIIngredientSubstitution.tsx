import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Repeat, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export default function AIIngredientSubstitution({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Ingredient Substitution");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a professional chef and food scientist. The user needs ingredient substitutions. For each ingredient they mention, provide: 1) Best substitute with exact ratio, 2) How it changes flavor/texture, 3) Allergen-free alternative, 4) Budget-friendly option, 5) Tips for the swap. Also suggest if any technique changes are needed. User request: ${input}` },
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <Repeat className="h-5 w-5 text-teal-400" />
          <span className="font-bold text-teal-400">AI Ingredient Substitution</span>
          <span className="text-xs bg-teal-500/20 px-2 py-0.5 rounded-full text-teal-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Tell us what ingredient you need to replace and why</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. I need to replace eggs in a cake recipe (vegan), substitute heavy cream in pasta (lactose-free), replace all-purpose flour (gluten-free)..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding Substitutes...</> : <><Sparkles className="h-4 w-4 mr-2" /> Find Substitutes</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-teal-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Repeat className="h-5 w-5 text-teal-400" /> Substitution Guide</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
  );
}
