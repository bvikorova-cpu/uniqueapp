import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIFashionCompatibility() {
  const [outfit1, setOutfit1] = useState("");
  const [outfit2, setOutfit2] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleAnalyze = async () => {
    if (!outfit1.trim() || !outfit2.trim()) { toast.error("Describe both outfits"); return; }
    try {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("fashion-ai", { body: { action: "compatibility", outfit1, outfit2 } });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Compatibility analysis complete!");
    } catch (err: any) { toast.error(err.message || "Error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIFashion Compatibility works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-pink-500" /> Fashion Compatibility</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Compare two outfits or styles to see how well they complement each other. <strong>Cost: 8 credits</strong></p>
            <Textarea placeholder="Outfit/Style 1: e.g. Dark academia with tweed blazer..." value={outfit1} onChange={e => setOutfit1(e.target.value)} rows={3} />
            <Textarea placeholder="Outfit/Style 2: e.g. Streetwear with oversized hoodie..." value={outfit2} onChange={e => setOutfit2(e.target.value)} rows={3} />
            <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 8}>
              {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Check Compatibility (8 credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl"><CardHeader><CardTitle>Compatibility Report</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
