import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Loader2, Brain, BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const DreamCompanionView = () => {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const interpret = async () => {
    if (!dream.trim()) { toast.error("Please describe your dream"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "dream_companion", dream },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Dream interpreted! (4 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Dream Companion View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <Moon className="h-10 w-10 text-indigo-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">AI Dream Companion</h2>
        <p className="text-muted-foreground text-sm">Share your dreams and discover their hidden meanings</p>
        <Badge variant="secondary" className="mt-2">4 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Describe your dream in detail</label>
              <Textarea value={dream} onChange={(e) => setDream(e.target.value)} rows={5}
                placeholder="I was flying over a vast ocean when suddenly..." className="resize-none" />
            </div>
            <Button onClick={interpret} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              Interpret Dream
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Dream Type */}
          {result.dream_type && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border-indigo-500/20">
                <CardContent className="p-6 text-center">
                  <Badge className="bg-indigo-500/30 text-indigo-300 text-sm mb-2">{result.dream_type} Dream</Badge>
                  {result.interpretation && <p className="text-sm mt-2">{result.interpretation.summary}</p>}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Interpretation */}
          {result.interpretation && (
            <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-400" /> Interpretation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground mb-1">Emotional Meaning</p>
                  <p className="text-sm">{result.interpretation.emotional_meaning}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground mb-1">Subconscious Message</p>
                  <p className="text-sm">{result.interpretation.subconscious_message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Symbols */}
          {result.symbols && (
            <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" /> Dream Symbols</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.symbols.map((s: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-xl bg-card/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{s.emoji}</span>
                        <span className="font-bold text-sm">{s.symbol}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.meaning}</p>
                      <p className="text-xs text-purple-400 mt-1">{s.personal_relevance}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Psychological Insight */}
          {result.psychological_insight && (
            <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-400" /> Psychological Insight</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline">{result.psychological_insight.theory}</Badge>
                <p className="text-sm">{result.psychological_insight.explanation}</p>
                <p className="text-sm italic text-muted-foreground">Reflect: {result.psychological_insight.reflection_question}</p>
              </CardContent>
            </Card>
          )}

          {/* Creative Rewrite */}
          {result.creative_rewrite && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">✨ Creative Retelling</p>
                <p className="text-sm italic">{result.creative_rewrite}</p>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          {result.action_suggestion && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4">
                <p className="font-bold text-sm">💡 Suggested Action</p>
                <p className="text-sm text-muted-foreground">{result.action_suggestion.suggestion}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.action_suggestion.reason}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Interpret Another Dream</Button>
        </div>
      )}
    </div>
  );
};
