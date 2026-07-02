import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Moon, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AISleepOptimizer({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Sleep Optimizer");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are an expert sleep scientist and fitness recovery specialist. Analyze the user's sleep habits and fitness routine, then provide: 1) Sleep Quality Score (1-10 with explanation), 2) Sleep-Fitness Connection (how their sleep affects training), 3) Optimal Sleep Schedule (exact bedtime/wake time), 4) Pre-Sleep Routine (step-by-step, 60 min before bed), 5) Sleep Environment Checklist (temperature, light, noise), 6) Supplement Suggestions (melatonin, magnesium, etc.), 7) Recovery Optimization Tips (naps, sleep cycles). User info: ${input}` },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Sleep Optimizer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Sleep Optimizer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Sleep Optimizer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30">
          <Moon className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-indigo-400">AI Sleep Optimizer</span>
          <span className="text-xs bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Describe your sleep patterns, workout schedule, and any issues for personalized optimization</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. I sleep ~6 hours, wake up tired, train at 6 AM, have trouble falling asleep after evening workouts, drink coffee until 4 PM..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Optimize My Sleep</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-indigo-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Moon className="h-5 w-5 text-indigo-400" /> Sleep Optimization Plan</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
  );
}
