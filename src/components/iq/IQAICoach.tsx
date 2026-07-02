import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2, Target, Clock, TrendingUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useIQUserStats } from "@/hooks/useIQUserStats";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CoachPlan {
  plan_title?: string;
  duration?: string;
  daily_schedule?: Array<{ time_block: string; activity: string; duration: string; cognitive_target: string }>;
  weekly_goals?: Array<{ week: number; goal: string; expected_improvement: string }>;
  techniques?: Array<{ name: string; description: string; frequency: string }>;
  motivation_strategies?: string[];
  estimated_improvement?: string;
}

const COST = 5;

export default function IQAICoach() {
  const { data: stats } = useIQUserStats();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const generate = async () => {
    setLoading(true);
    try {
      const weakAreas = stats?.sub_scores
        ? Object.entries(stats.sub_scores)
            .sort((a, b) => (a[1] as number) - (b[1] as number))
            .slice(0, 2)
            .map(([k]) => k)
            .join(", ")
        : "";
      const strongAreas = stats?.sub_scores
        ? Object.entries(stats.sub_scores)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 2)
            .map(([k]) => k)
            .join(", ")
        : "";

      const { data, error } = await supabase.functions.invoke("iq-platform-ai", {
        body: {
          action: "study_coach",
          goal: `Reach IQ ${(stats?.best_iq ?? 110) + 10}`,
          currentLevel: stats?.tier ?? "Bronze",
          dailyTime: "20 minutes",
          weakAreas: weakAreas || "general",
          strongAreas: strongAreas || "general",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data as CoachPlan);
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
      toast({ title: "🧠 Plan ready!", description: `Used ${COST} credits` });
    } catch (e) {
      toast({
        title: "Coach unavailable",
        description: e instanceof Error ? e.message : "Try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQAICoach works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
              <Brain className="h-5 w-5 text-primary" />
            </motion.div>
            Personal IQ AI Coach
          </span>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> {COST} credits
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!plan && (
          <>
            <p className="text-sm text-muted-foreground">
              Get a fully personalized cognitive training plan based on your test history,
              tier ({stats?.tier ?? "Bronze"}) and weakest dimensions. Updated weekly.
            </p>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building your plan…</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate my plan</>}
            </Button>
          </>
        )}

        <AnimatePresence>
          {plan && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm">{plan.plan_title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {plan.duration}
                  </p>
                </div>
                {plan.estimated_improvement && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    <TrendingUp className="h-3 w-3 mr-1" /> {plan.estimated_improvement}
                  </Badge>
                )}
              </div>

              {plan.daily_schedule && plan.daily_schedule.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Daily routine
                  </p>
                  {plan.daily_schedule.slice(0, 4).map((s, i) => (
                    <div key={i} className="text-xs flex gap-2 items-start p-2 rounded-md bg-background/40 border border-border/50">
                      <span className="font-mono text-[10px] text-primary shrink-0">{s.time_block}</span>
                      <span className="flex-1">{s.activity}</span>
                      <span className="text-[10px] text-muted-foreground">{s.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {plan.techniques && plan.techniques.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Key techniques
                  </p>
                  {plan.techniques.slice(0, 3).map((t, i) => (
                    <div key={i} className="text-xs p-2 rounded-md bg-background/40 border border-border/50">
                      <div className="font-semibold">{t.name} <span className="text-[10px] text-muted-foreground font-normal">· {t.frequency}</span></div>
                      <div className="text-muted-foreground mt-0.5">{t.description}</div>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => setPlan(null)} className="w-full">
                Generate new plan
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
    );
}
