import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, startOfWeek, subDays, parseISO } from "date-fns";
import { Trophy, Flame, Star, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRewardsStats } from "@/hooks/useRewardsStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WallTopNav } from "@/components/wall/WallTopNav";

const DAYS = 30;

interface DayRow { activity_date: string; xp_earned: number; }
interface CompletedChallenge {
  challenge_id: string;
  period_key: string;
  completed_at: string;
  challenges: { title: string; icon: string | null; xp_reward: number; challenge_type: string } | null;
}

export default function MyProgress() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  const { data: stats } = useRewardsStats(userId);

  const { data: days = [] } = useQuery({
    queryKey: ["my-progress-days", userId],
    enabled: !!userId,
    queryFn: async (): Promise<DayRow[]> => {
      const since = format(subDays(new Date(), DAYS - 1), "yyyy-MM-dd");
      const { data } = await (supabase as any)
        .from("user_activity_days")
        .select("activity_date, xp_earned")
        .eq("user_id", userId)
        .gte("activity_date", since)
        .order("activity_date", { ascending: true });
      return (data ?? []) as DayRow[];
    },
  });

  const { data: completed = [] } = useQuery({
    queryKey: ["my-progress-completed", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CompletedChallenge[]> => {
      const { data } = await (supabase as any)
        .from("user_challenge_progress")
        .select("challenge_id, period_key, completed_at, challenges(title, icon, xp_reward, challenge_type)")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(50);
      return (data ?? []) as CompletedChallenge[];
    },
  });

  const dayMap = useMemo(() => {
    const m: Record<string, number> = {};
    days.forEach((d) => { m[d.activity_date] = d.xp_earned; });
    return m;
  }, [days]);

  const last30 = useMemo(() => {
    const out: { date: string; xp: number; label: string }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      out.push({ date: key, xp: dayMap[key] ?? 0, label: format(d, "MMM d") });
    }
    return out;
  }, [dayMap]);

  const weekly = useMemo(() => {
    const buckets: Record<string, number> = {};
    last30.forEach((d) => {
      const wk = format(startOfWeek(parseISO(d.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
      buckets[wk] = (buckets[wk] ?? 0) + d.xp;
    });
    return Object.entries(buckets)
      .map(([wk, xp]) => ({ wk, xp, label: `Week of ${format(parseISO(wk), "MMM d")}` }))
      .sort((a, b) => a.wk.localeCompare(b.wk));
  }, [last30]);

  const maxDay = Math.max(1, ...last30.map((d) => d.xp));
  const maxWeek = Math.max(1, ...weekly.map((w) => w.xp));
  const total30 = last30.reduce((s, d) => s + d.xp, 0);
  const activeDays = last30.filter((d) => d.xp > 0).length;

  if (loading) return null;
  if (!userId) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <WallTopNav />
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-28 pb-24">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            XP history, daily & weekly activity, and completed challenges.
          </p>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard icon={Star} label="Level" value={stats?.level ?? 1} color="text-primary" />
          <SummaryCard icon={Trophy} label="Total XP" value={stats?.totalXP ?? 0} color="text-amber-400" />
          <SummaryCard icon={Flame} label="Streak" value={`${stats?.streak ?? 0}d`} color="text-orange-400" sub={`best ${stats?.longestStreak ?? 0}d`} />
          <SummaryCard icon={CheckCircle2} label="Active days (30d)" value={`${activeDays}/30`} color="text-emerald-400" sub={`${total30} XP`} />
        </div>

        {/* Daily XP */}
        <Card className="mb-6 backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Daily XP — last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40 overflow-x-auto">
              {last30.map((d, i) => {
                const h = d.xp === 0 ? 4 : Math.max(8, (d.xp / maxDay) * 100);
                return (
                  <motion.div
                    key={d.date}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${h}%`, opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    title={`${d.label}: ${d.xp} XP`}
                    className={`flex-1 min-w-[8px] rounded-t-sm ${
                      d.xp === 0
                        ? "bg-muted/40"
                        : "bg-gradient-to-t from-primary/60 to-accent"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>{last30[0]?.label}</span>
              <span>{last30[last30.length - 1]?.label}</span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly XP */}
        <Card className="mb-6 backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-accent" />
              Weekly XP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weekly.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
            {weekly.map((w) => (
              <div key={w.wk}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{w.label}</span>
                  <span className="font-bold text-foreground">{w.xp} XP</span>
                </div>
                <Progress value={(w.xp / maxWeek) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed challenges */}
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Completed challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No challenges completed yet. Post, comment or react to start earning.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {completed.map((c) => (
                  <li key={`${c.challenge_id}-${c.period_key}`} className="flex items-center gap-3 py-3">
                    <div className="text-2xl">{c.challenges?.icon ?? "🏆"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {c.challenges?.title ?? "Challenge"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.completed_at ? format(parseISO(c.completed_at), "PPp") : ""}
                        {c.challenges?.challenge_type ? ` · ${c.challenges.challenge_type}` : ""}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      +{c.challenges?.xp_reward ?? 0} XP
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, color, sub,
}: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className={`h-4 w-4 ${color}`} />
          {label}
        </div>
        <div className="text-xl sm:text-2xl font-black mt-1">{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
