import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Sparkles, BarChart3, Clock, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TrendAnalyzerView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "trend_analyzer", category: category || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Trends Analyzed! 📊" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Trend Analyzer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Trend Analyzer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trend Analyzer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">AI Trend Analyzer</h2>
          <p className="text-muted-foreground mt-2">Discover trending categories and optimize your competition strategy</p>
          <Badge variant="outline" className="mt-2 border-yellow-500/30 text-yellow-500">3 Credits per analysis</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
        <CardHeader><CardTitle className="text-lg">Analyze Trends</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional: focus on a specific category..." />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><BarChart3 className="h-4 w-4 mr-2" /> Analyze Trends</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.trending_categories && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-yellow-500" /> Trending Categories</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.trending_categories.map((cat: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{cat.name}</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{cat.growth}</Badge>
                    </div>
                    <Progress value={cat.opportunity_score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{cat.reason}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.best_posting_times && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" /> Best Posting Times</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.best_posting_times.map((t: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                      <p className="font-medium text-sm">{t.day} — {t.time}</p>
                      <p className="text-xs text-muted-foreground">{t.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.content_recommendations && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" /> Content Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.content_recommendations.map((r: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <p className="text-sm font-medium">{r.type}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{r.expected_engagement}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
    </>
  );
};
