import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AITrendAlertRadar() {
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("fashion-ai", { body: { action: "trend-radar", category: category || "general fashion" } });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Trend radar scan complete!");
    } catch (err: any) { toast.error(err.message || "Error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AITrend Alert Radar works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-cyan-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-cyan-500" /> Trend Alert Radar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Scan real-time fashion trends with emerging alerts, virality scores, and investment potential. <strong>Cost: 12 credits</strong></p>
            <Input placeholder="Focus category (optional): e.g. streetwear, luxury, sportswear..." value={category} onChange={e => setCategory(e.target.value)} />
            <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 12}>
              {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</> : "Scan Trend Radar (12 credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl"><CardHeader><CardTitle>Trend Radar Report</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
