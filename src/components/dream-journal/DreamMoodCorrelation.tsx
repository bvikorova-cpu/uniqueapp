import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Map, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";

interface DreamMoodCorrelationProps {
  onBack: () => void;
}

const DreamMoodCorrelation = ({ onBack }: DreamMoodCorrelationProps) => {
  const navigate = useNavigate();
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if ((credits?.credits_remaining || 0) < 1) {
      handleEdgeError({ status: 402 }, { navigate, context: "Dream-Mood Correlation" });
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Dream-Mood Correlation Analysis");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        handleEdgeError({ status: 401 }, { navigate, context: "Dream-Mood Correlation" });
        return;
      }

      const [dreamsRes, moodsRes] = await Promise.all([
        (supabase as any).from("dream_entries").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50),
        (supabase as any).from("dream_mood_entries").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50),
      ]);

      const dreams = dreamsRes.data || [];
      const moods = moodsRes.data || [];

      if (dreams.length < 3 && moods.length < 3) {
        toast.error("You need at least 3 dream entries and 3 mood entries for correlation analysis.");
        setLoading(false);
        return;
      }

      const res = await supabase.functions.invoke("dream-ai", {
        body: { action: "mood-correlation", dreams, moods },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = throwIfInvokeError(res);
      setResult(data.analysis);
      toast.success("Correlation analysis ready!");
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Dream-Mood Correlation" })) {
        toast.error(err.message || "Error generating analysis");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Dream-Mood Correlation Map
              <span className="text-xs font-normal text-muted-foreground ml-auto">1 Credit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI analyzes your dream journal entries alongside your mood tracking data to reveal hidden connections between your waking emotions and dream content. Discover how stress, happiness, anxiety, and other moods influence your dream themes.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                <p className="text-2xl font-bold text-primary">📝</p>
                <p className="text-xs text-muted-foreground mt-1">Dream Entries</p>
                <p className="text-sm font-semibold">Analyzed</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                <p className="text-2xl font-bold text-primary">😊</p>
                <p className="text-xs text-muted-foreground mt-1">Mood Records</p>
                <p className="text-sm font-semibold">Cross-referenced</p>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Mapping Correlations..." : "Generate Correlation Map (1 Credit)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">🧬 Dream-Mood Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DreamMoodCorrelation;
