import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Recycle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export default function AILeftoverTransformer({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const transform = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Leftover Transformer");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a zero-waste chef specializing in creative leftover transformation. The user has leftovers. Create 3 completely different recipes that transform these leftovers into exciting new meals. For each recipe include: 1) Creative name, 2) Additional ingredients needed (keep minimal), 3) Step-by-step instructions, 4) Time to prepare, 5) Estimated calories, 6) Storage tips for remaining leftovers. Leftovers available: ${input}` },
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
          <Recycle className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-amber-400">AI Leftover Transformer</span>
          <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">List your leftovers and get 3 creative new recipes</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. Cooked rice (300g), leftover grilled chicken (200g), half an onion, some bell peppers, soy sauce, eggs..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={transform} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Transforming...</> : <><Sparkles className="h-4 w-4 mr-2" /> Transform Leftovers</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-amber-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Recycle className="h-5 w-5 text-amber-400" /> New Recipe Ideas</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
  );
}
