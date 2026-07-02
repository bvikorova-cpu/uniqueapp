import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Pill, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AISupplementStack({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Supplement Stack");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a certified sports nutritionist. Based on the user's fitness goals, training style, diet, and health info, recommend a complete supplement stack. Include: 1) Essential Stack (must-haves with exact dosages and timing), 2) Performance Stack (pre/intra/post workout), 3) Recovery Stack (sleep, joints, inflammation), 4) Health Stack (vitamins, minerals, omega-3), 5) Budget Option (top 3 if budget is tight), 6) Warnings & Interactions, 7) Monthly Cost Estimate. User info: ${input}` },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Supplement Stack - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Supplement Stack section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Supplement Stack.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30">
          <Pill className="h-5 w-5 text-green-400" />
          <span className="font-bold text-green-400">AI Supplement Stack Builder</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Describe your goals, training, diet, and any health conditions</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. I'm 28M, train 5x/week (strength + cardio), goal is lean muscle gain, vegetarian diet, no known allergies, budget €50/month..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building Stack...</> : <><Sparkles className="h-4 w-4 mr-2" /> Build My Stack</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-green-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Pill className="h-5 w-5 text-green-400" /> Your Supplement Stack</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
  );
}
