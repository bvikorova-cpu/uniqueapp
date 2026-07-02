import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ChallengeRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  target_count: number;
  xp_reward: number;
}

interface ProgressRow {
  challenge_id: string;
  progress: number;
  completed_at: string | null;
  period_key: string;
}

interface HallEntry {
  challenge_slug: string;
  challenge_title: string;
  xp_reward: number;
  total_completions: number;
  top_user_id: string | null;
  top_user_name: string | null;
}

function currentWeekKey(): string {
  const d = new Date();
  // ISO week
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

export default function JobsWeeklyChallenges() {
  const { user } = useAuth();

  const { data: challenges = [], isLoading: loadingC } = useQuery({
    queryKey: ["job_weekly_challenges"],
    queryFn: async (): Promise<ChallengeRow[]> => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, slug, title, description, icon, target_count, xp_reward")
        .eq("active", true)
        .eq("challenge_type", "weekly")
        .like("action_type", "job_%");
      if (error) throw error;
      return (data ?? []) as ChallengeRow[];
    },
  });

  const periodKey = currentWeekKey();

  const { data: progress = [] } = useQuery({
    queryKey: ["job_weekly_progress", user?.id, periodKey],
    enabled: !!user?.id && challenges.length > 0,
    queryFn: async (): Promise<ProgressRow[]> => {
      const { data, error } = await supabase
        .from("user_challenge_progress")
        .select("challenge_id, progress, completed_at, period_key")
        .eq("user_id", user!.id)
        .eq("period_key", periodKey)
        .in(
          "challenge_id",
          challenges.map((c) => c.id),
        );
      if (error) throw error;
      return (data ?? []) as ProgressRow[];
    },
  });

  const { data: hall = [], isLoading: loadingHall } = useQuery({
    queryKey: ["job_challenges_hall_of_fame"],
    queryFn: async (): Promise<HallEntry[]> => {
      const { data, error } = await (supabase as any).rpc("get_job_challenges_hall_of_fame");
      if (error) throw error;
      return (data ?? []) as HallEntry[];
    },
  });

  const progressMap = new Map(progress.map((p) => [p.challenge_id, p]));

  return (
    <>
      <FloatingHowItWorks title="How Jobs Weekly Challenges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🏋️ Weekly Challenges</h2>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Clock className="h-3 w-3 mr-1" /> Resets Sunday
        </Badge>
      </div>

      {loadingC ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : challenges.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active weekly challenges.</p>
      ) : (
        <div className="space-y-3">
          {challenges.map((c, i) => {
            const p = progressMap.get(c.id);
            const current = p?.progress ?? 0;
            const completed = !!p?.completed_at;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border-border/30 ${completed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card/80"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{c.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm flex items-center gap-1.5">
                            {c.title}
                            {completed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          </p>
                          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                            +{c.xp_reward} XP
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(100, (current / c.target_count) * 100)}
                            className="h-2 flex-1"
                          />
                          <span className="text-xs font-mono">
                            {Math.min(current, c.target_count)}/{c.target_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" /> Hall of Fame
        </h3>
        {loadingHall ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : hall.filter((h) => h.total_completions > 0).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No one has completed a job challenge yet — be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {hall
              .filter((h) => h.total_completions > 0)
              .map((h) => (
                <Card key={h.challenge_slug} className="bg-card/50 border-border/20">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">{h.challenge_title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        First: {h.top_user_name ?? "Anonymous"} • {h.total_completions} completions
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px]">
                      +{h.xp_reward} XP
                    </Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
    </>
    );
}
