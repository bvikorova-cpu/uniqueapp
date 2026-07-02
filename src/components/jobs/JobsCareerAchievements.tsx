import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface JobAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  target: number;
}

export default function JobsCareerAchievements() {
  const { user } = useAuth();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["job_achievements", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<JobAchievement[]> => {
      const { data, error } = await (supabase as any).rpc("get_user_job_achievements");
      if (error) throw error;
      return (data ?? []) as JobAchievement[];
    },
  });

  const totalPoints = achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.points, 0);
  const maxPoints = achievements.reduce((s, a) => s + a.points, 0);

  return (
    <>
      <FloatingHowItWorks title="How Jobs Career Achievements works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Career Achievements</h2>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm">
          {totalPoints} / {maxPoints} pts
        </Badge>
      </div>

      {!user ? (
        <p className="text-sm text-muted-foreground">Sign in to track your achievements.</p>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map((a, i) => {
            const pct = a.target > 0 ? Math.min(100, (a.progress / a.target) * 100) : 0;
            return (
              <motion.div
                key={a.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`text-center p-4 border-border/30 ${
                    a.unlocked ? "bg-amber-500/10 border-amber-500/30" : "bg-card/50 opacity-70"
                  }`}
                >
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <p className="font-bold text-xs mb-1">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2 min-h-[28px]">
                    {a.description}
                  </p>
                  <div className="space-y-1.5">
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-[9px] text-muted-foreground font-mono">
                      {a.progress}/{a.target}
                    </p>
                    <Badge variant="outline" className="text-[9px]">
                      {a.points} pts
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </>
    );
}
