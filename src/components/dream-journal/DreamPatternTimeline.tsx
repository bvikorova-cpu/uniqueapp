import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, GitBranch, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface DreamPatternTimelineProps {
  onBack: () => void;
}

const DreamPatternTimeline = ({ onBack }: DreamPatternTimelineProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [dreams, setDreams] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingDreams, setLoadingDreams] = useState(true);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("dream_entries").select("*").eq("user_id", user.id).order("dream_date", { ascending: false }).limit(20);
      setDreams(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDreams(false);
    }
  };

  const analyzePatterns = async () => {
    if (dreams.length < 3) {
      toast.error("You need at least 3 dream entries for pattern analysis");
      return;
    }
    if ((credits?.credits_remaining || 0) < 1) {
      toast.error("Insufficient credits");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Dream Pattern Analysis");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      const dreamSummaries = dreams.map(d => ({
        title: d.title,
        date: d.dream_date,
        themes: d.themes,
        emotions: d.emotions,
        symbols: d.symbols,
        content: d.content?.substring(0, 200),
      }));

      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "pattern-analysis", dreams: dreamSummaries },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setAnalysis(data.analysis);
      toast.success("Pattern analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing patterns");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <GitBranch className="h-6 w-6 text-primary" />
            Dream Pattern Timeline
            <span className="ml-auto text-xs font-normal text-muted-foreground">1 Credit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingDreams ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <>
              <div className="space-y-3">
                {dreams.slice(0, 5).map((dream, i) => (
                  <motion.div key={dream.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{dream.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(dream.dream_date).toLocaleDateString()}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dream.themes?.slice(0, 3).map((t: string, j: number) => (
                          <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {dreams.length > 5 && <p className="text-xs text-muted-foreground text-center">+{dreams.length - 5} more dreams</p>}
              </div>
              <Button onClick={analyzePatterns} disabled={loading || dreams.length < 3} className="w-full bg-gradient-to-r from-primary to-accent">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Analyze Dream Patterns ({dreams.length} dreams)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Pattern Analysis Results</CardTitle></CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DreamPatternTimeline;
