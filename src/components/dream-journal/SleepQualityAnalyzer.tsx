import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Moon, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SleepQualityAnalyzerProps {
  onBack: () => void;
}

const SleepQualityAnalyzer = ({ onBack }: SleepQualityAnalyzerProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [sleepHours, setSleepHours] = useState([7]);
  const [quality, setQuality] = useState("moderate");
  const [wakeUps, setWakeUps] = useState([1]);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if ((credits?.credits_remaining || 0) < 1) {
      toast.error("Insufficient credits");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Sleep Quality Analysis");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "sleep-analyzer", sleepHours: sleepHours[0], quality, wakeUps: wakeUps[0], notes },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Sleep analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing sleep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Sleep Quality Analyzer'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Sleep Quality Analyzer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Moon className="h-6 w-6 text-primary" />
            Sleep Quality Analyzer
            <span className="ml-auto text-xs font-normal text-muted-foreground">1 Credit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Hours of Sleep</label>
              <span className="text-sm text-muted-foreground">{sleepHours[0]}h</span>
            </div>
            <Slider value={sleepHours} onValueChange={setSleepHours} min={1} max={14} step={0.5} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sleep Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">😴 Excellent — Slept like a baby</SelectItem>
                <SelectItem value="good">🙂 Good — Restful night</SelectItem>
                <SelectItem value="moderate">😐 Moderate — Average sleep</SelectItem>
                <SelectItem value="poor">😕 Poor — Restless night</SelectItem>
                <SelectItem value="terrible">😰 Terrible — Barely slept</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Night Wake-Ups</label>
              <span className="text-sm text-muted-foreground">{wakeUps[0]}</span>
            </div>
            <Slider value={wakeUps} onValueChange={setWakeUps} min={0} max={10} step={1} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any factors affecting your sleep? (caffeine, stress, exercise, screen time...)" rows={3} />
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Analyze My Sleep
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Sleep Analysis Report</CardTitle></CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
  );
};

export default SleepQualityAnalyzer;
