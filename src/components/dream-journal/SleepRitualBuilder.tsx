import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Moon, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SleepRitualBuilderProps {
  onBack: () => void;
}

const SleepRitualBuilder = ({ onBack }: SleepRitualBuilderProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [sleepGoal, setSleepGoal] = useState("lucid-dreams");
  const [challenges, setChallenges] = useState("");
  const [duration, setDuration] = useState("30");
  const [result, setResult] = useState<string | null>(null);

  const goals = [
    { value: "lucid-dreams", label: "Achieve Lucid Dreams" },
    { value: "deep-sleep", label: "Deeper, More Restful Sleep" },
    { value: "vivid-dreams", label: "More Vivid Dream Recall" },
    { value: "reduce-nightmares", label: "Reduce Nightmares" },
    { value: "faster-sleep", label: "Fall Asleep Faster" },
    { value: "dream-control", label: "Better Dream Control" },
  ];

  const handleGenerate = async () => {
    if ((credits?.credits_remaining || 0) < 1) {
      toast.error("Insufficient credits. Please purchase more.");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Sleep Ritual Builder");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "sleep-ritual", sleepGoal, challenges, duration: parseInt(duration) },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setResult(data.ritual);
      toast.success("Sleep ritual created!");
    } catch (err: any) {
      toast.error(err.message || "Error creating ritual");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Sleep Ritual Builder'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Sleep Ritual Builder panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              Sleep Ritual Builder
              <span className="text-xs font-normal text-muted-foreground ml-auto">1 Credit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI creates a personalized bedtime ritual combining meditation, breathing exercises, visualization techniques, and sleep hygiene practices tailored to your specific goals.
            </p>

            <div>
              <label className="text-sm font-medium mb-2 block">Sleep Goal</label>
              <Select value={sleepGoal} onValueChange={setSleepGoal}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ritual Duration (minutes)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Sleep Challenges (optional)</label>
              <Textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="I have trouble falling asleep, often wake up at 3am, screen time before bed..."
                className="min-h-[80px] bg-background/50"
              />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Building Your Ritual..." : "Create Sleep Ritual (1 Credit)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">🌙 Your Personalized Sleep Ritual</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default SleepRitualBuilder;
