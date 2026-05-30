import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Palette, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export default function AIPlatingCoach({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Plating Coach");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a Michelin-star chef specializing in food presentation and plating. For the dish described, provide: 1) Plate selection (shape, color, size), 2) Color composition strategy, 3) Step-by-step plating instructions, 4) Sauce placement techniques (dots, swoosh, pool), 5) Garnish recommendations (micro greens, edible flowers, etc.), 6) Height and dimension tips, 7) Photography angle suggestions for Instagram. Dish: ${input}` },
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30">
          <Palette className="h-5 w-5 text-pink-400" />
          <span className="font-bold text-pink-400">AI Plating Coach</span>
          <span className="text-xs bg-pink-500/20 px-2 py-0.5 rounded-full text-pink-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Describe your dish for Michelin-level plating guidance</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. Pan-seared salmon with asparagus, mashed potatoes, and lemon butter sauce..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Designing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Get Plating Guide</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Palette className="h-5 w-5 text-pink-400" /> Plating Design</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
  );
}
