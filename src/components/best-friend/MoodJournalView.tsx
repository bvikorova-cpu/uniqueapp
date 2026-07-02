import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BookHeart, Loader2, Sparkles, TrendingUp, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MoodJournalView = () => {
  const { toast } = useToast();
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("best_friend_mood_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data || []);
  };

  const analyze = async () => {
    if (!entry.trim()) {
      toast({ title: "Write something", description: "Share how you're feeling today", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "mood_journal", entry: entry.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Mood Analyzed! ✨", description: `You're feeling ${data.mood_label} (${data.mood_score}/10)` });
      loadHistory();
      setEntry("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const moodColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Mood Journal View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <BookHeart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Mood Journal
          </h2>
          <p className="text-muted-foreground mt-2">Track your emotions and get AI-powered insights into your emotional patterns</p>
          <Badge variant="outline" className="mt-2">3 Credits per entry</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
        <CardHeader><CardTitle className="text-lg">How are you feeling today?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={entry} onChange={(e) => setEntry(e.target.value)}
            placeholder="Write about your day, your feelings, what's on your mind..." rows={5} />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Analyze My Mood</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" /> Mood Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 bg-purple-500/10 rounded-xl p-4">
                <div className={`text-4xl font-black ${moodColor(result.mood_score)}`}>{result.mood_score}/10</div>
                <div>
                  <div className="font-bold text-lg">{result.mood_label}</div>
                  <p className="text-sm text-muted-foreground">{result.insight}</p>
                </div>
              </div>

              {result.patterns && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Emotional Patterns:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.patterns.map((p: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-purple-500/10">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestion && (
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-1">💡 Self-Care Suggestion:</h4>
                  <p className="text-sm text-muted-foreground">{result.suggestion}</p>
                </div>
              )}

              {result.affirmation && (
                <div className="bg-pink-500/10 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium italic">"{result.affirmation}"</p>
                </div>
              )}

              <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" /> Recent Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${moodColor(h.mood_score)}`}>{h.mood_score}/10</span>
                      <Badge variant="outline" className="text-[10px]">{h.mood_label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{h.journal_entry?.slice(0, 80)}...</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
