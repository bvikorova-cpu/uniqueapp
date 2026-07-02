import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Brain, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AILucidDreamCoachProps {
  onBack: () => void;
}

const AILucidDreamCoach = ({ onBack }: AILucidDreamCoachProps) => {
  const navigate = useNavigate();
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState("beginner");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!goal.trim()) {
      toast.error("Please describe your lucid dreaming goal");
      return;
    }
    if ((credits?.credits_remaining || 0) < 1) {
      handleEdgeError({ status: 402 }, { navigate, context: "Lucid Dream Coach" });
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Lucid Dream Coaching");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        handleEdgeError({ status: 401 }, { navigate, context: "Lucid Dream Coach" });
        return;
      }
      const res = await supabase.functions.invoke("dream-ai", {
        body: { action: "lucid-coach", experience, goal },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = throwIfInvokeError(res);
      setResult(data.coaching);
      toast.success("Lucid dream coaching ready!");
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Lucid Dream Coach" })) {
        toast.error(err.message || "Error generating coaching plan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='AILucid Dream Coach'
        steps={[
          { title: 'Open the tool', desc: 'Launch the AILucid Dream Coach panel from this page.' },
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
            <Brain className="h-6 w-6 text-primary" />
            AI Lucid Dream Coach
            <span className="ml-auto text-xs font-normal text-muted-foreground">1 Credit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Experience Level</label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🌱 Beginner — Never had a lucid dream</SelectItem>
                <SelectItem value="intermediate">🌿 Intermediate — Occasional lucid dreams</SelectItem>
                <SelectItem value="advanced">🌳 Advanced — Regular lucid dreamer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Your Goal or Recent Dream</label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what you want to achieve in lucid dreaming, or describe a recent dream you'd like to become lucid in..."
              rows={5}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Get Lucid Dream Coaching
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Your Personalized Coaching Plan</CardTitle>
            </CardHeader>
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

export default AILucidDreamCoach;
