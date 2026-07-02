import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Target, Loader2, Sparkles, CheckCircle2, Brain, Rocket } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const LifeCoachView = () => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const coach = async () => {
    if (!topic.trim()) {
      toast({ title: "Share your goal", description: "Tell us what you'd like coaching on", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "life_coach", topic: topic.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Coaching Ready! 🎯" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Life Coach View"}
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Life Coach Mode
          </h2>
          <p className="text-muted-foreground mt-2">Structured goal-setting and accountability coaching powered by AI</p>
          <Badge variant="outline" className="mt-2">4 Credits per session</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-emerald-500/20">
        <CardHeader><CardTitle className="text-lg">What would you like coaching on?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g., I want to improve my fitness routine, build better habits, advance my career..."
            rows={4} />
          <Button onClick={coach} disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Coaching...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Start Coaching Session</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.assessment && (
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2"><Brain className="h-4 w-4 text-emerald-400" /> Assessment</h4>
                <p className="text-sm text-muted-foreground">{result.assessment}</p>
              </CardContent>
            </Card>
          )}

          {result.goals && (
            <Card className="bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-emerald-400" /> SMART Goals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.goals.map((g: any, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Rocket className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{g.goal}</p>
                        <p className="text-xs text-muted-foreground mt-1">⏰ {g.timeline}</p>
                        <p className="text-xs text-muted-foreground">🚀 First step: {g.first_step}</p>
                        <p className="text-xs text-emerald-400 mt-1">💪 {g.motivation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.action_plan && (
            <Card className="bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-base">📋 Daily Action Plan</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.action_plan.map((a: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.mindset_shift && (
            <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-semibold mb-1">🧠 Key Mindset Shift:</p>
                <p className="text-sm text-muted-foreground italic">{result.mindset_shift}</p>
              </CardContent>
            </Card>
          )}

          {result.accountability_check && (
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-1">📊 Weekly Accountability Check:</p>
                <p className="text-sm text-muted-foreground italic">"{result.accountability_check}"</p>
              </CardContent>
            </Card>
          )}

          {result.resources && (
            <Card className="bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-base">📚 Recommended Practices</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.resources.map((r: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
                    <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
  );
};
