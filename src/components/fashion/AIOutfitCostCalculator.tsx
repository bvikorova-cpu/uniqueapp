import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIOutfitCostCalculator() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleAnalyze = async () => {
    if (!description.trim()) { toast.error("Please describe your outfit"); return; }
    try {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "outfit-cost", description }
      });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Cost analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIOutfit Cost Calculator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-emerald-500" /> AI Outfit Cost Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe your outfit to get estimated costs, budget alternatives, and luxury upgrades. <strong>Cost: 8 credits</strong>
            </p>
            <Textarea placeholder="e.g. Navy blue suit with brown leather shoes, white shirt, silk tie..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 8}>
              {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating...</> : "Calculate Costs (8 credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Cost Breakdown Report</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
