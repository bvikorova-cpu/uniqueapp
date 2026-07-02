import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIDressCodeAdvisor() {
  const [eventDesc, setEventDesc] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleAnalyze = async () => {
    if (!eventDesc.trim()) { toast.error("Describe your event"); return; }
    try {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("fashion-ai", { body: { action: "dress-code", eventDescription: eventDesc } });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Dress code advice ready!");
    } catch (err: any) { toast.error(err.message || "Error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIDress Code Advisor works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-blue-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-blue-500" /> AI Dress Code Advisor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Describe your event to get precise dress code guidance with outfit suggestions. <strong>Cost: 6 credits</strong></p>
            <Textarea placeholder="e.g. Business dinner at a Michelin-star restaurant, summer wedding in Tuscany..." value={eventDesc} onChange={e => setEventDesc(e.target.value)} rows={3} />
            <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 6}>
              {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Advising...</> : "Get Dress Code Advice (6 credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl"><CardHeader><CardTitle>Dress Code Guide</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
