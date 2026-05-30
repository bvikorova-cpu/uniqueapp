import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ScanEye, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export default function AIPostureAnalyzer({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits for posture analysis.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Posture Analyzer");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are an expert physiotherapist and posture specialist. A user describes their posture issues or daily habits. Provide: 1) Posture Assessment (identify likely problems), 2) Risk Analysis (what could worsen), 3) Corrective Exercises (5-6 specific exercises with reps/sets), 4) Ergonomic Recommendations (desk/chair/screen setup), 5) Daily Posture Routine (morning + evening). User description: ${input}` },
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
          <ScanEye className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-indigo-400">AI Posture Analyzer</span>
          <span className="text-xs bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Describe your posture habits, pain points, or daily routine for expert analysis</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. I sit at a desk 8+ hours daily, my shoulders round forward, I have lower back pain after standing long..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze My Posture</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-indigo-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ScanEye className="h-5 w-5 text-indigo-400" /> Posture Analysis</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
  );
}
