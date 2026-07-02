import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const ProgressPreview = () => {
  const [sessionsCount, setSessionsCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [sessions, goals, completed] = await Promise.all([
      supabase.from('mentor_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mentor_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mentor_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('progress', 100),
    ]);

    setSessionsCount(sessions.count || 0);
    setGoalsCount(goals.count || 0);
    setCompletedGoals(completed.count || 0);
  };

  const progressItems = [
    { label: "Sessions completed", value: sessionsCount, max: 50, color: "bg-blue-500" },
    { label: "Goals set", value: goalsCount, max: 20, color: "bg-purple-500" },
    { label: "Goals achieved", value: completedGoals, max: Math.max(goalsCount, 1), color: "bg-emerald-500" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Progress Preview works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-br-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsCount === 0 && goalsCount === 0 ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-500/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No goals set yet</p>
              <p className="text-xs text-muted-foreground">Start a mentor session to set your first goal!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progressItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" />
                      {item.label}
                    </span>
                    <span className="font-black text-sm">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
