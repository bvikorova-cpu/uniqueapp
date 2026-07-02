import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Award, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PerformanceScoreView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const evaluate = async () => {
    if (!category || !title) { toast({ title: "Error", description: "Please fill category and title", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "performance_score", category, title, description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Evaluation Complete! ⭐" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Performance Score View - How it works"} steps={[{ title: 'Open', desc: 'Access the Performance Score View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Performance Score View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">AI Performance Score</h2>
          <p className="text-muted-foreground mt-2">Get professional-grade evaluation of your talent submission</p>
          <Badge variant="outline" className="mt-2 border-yellow-500/30 text-yellow-500">4 Credits per evaluation</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
        <CardHeader><CardTitle className="text-lg">Submit for Evaluation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
            <SelectContent>
              {["Drawing", "Singing", "Dance", "Photography", "Cooking", "Comedy", "Sports", "Music Production", "Digital Art", "Other"].map(c => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Submission title..." />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your performance..." className="min-h-[100px]" />
          <Button onClick={evaluate} disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Evaluating...</> : <><Award className="h-4 w-4 mr-2" /> Get Performance Score</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Score Hero */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <div className="text-6xl font-black text-yellow-500 mb-2">{result.total_score}</div>
              <p className="text-sm text-muted-foreground mb-3">Overall Score out of 100</p>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-6 w-6 ${i < (result.star_rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <Badge className="mt-3 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Zap className="h-3 w-3 mr-1" /> Winning Potential: {result.winning_potential}%
              </Badge>
            </CardContent>
          </Card>

          {/* Dimensions */}
          {result.dimensions && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.dimensions.map((d: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{d.name}</span>
                      <span className="font-bold text-yellow-500">{d.score}/100</span>
                    </div>
                    <Progress value={d.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{d.feedback}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Judge Commentary */}
          {result.judge_commentary && (
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">🎤 Judge's Commentary</p>
                <p className="text-sm text-muted-foreground">{result.judge_commentary}</p>
              </CardContent>
            </Card>
          )}

          {/* Improvement Roadmap */}
          {result.improvement_roadmap && (
            <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm">Improvement Roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.improvement_roadmap.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-500 shrink-0">{step.step}</div>
                    <div><p className="text-sm font-medium">{step.action}</p><p className="text-xs text-muted-foreground">{step.expected_impact}</p></div>
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
