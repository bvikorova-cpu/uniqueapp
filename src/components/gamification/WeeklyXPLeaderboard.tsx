import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Sparkles, Flame, Clock, RotateCcw, User } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  view_count: number;
}

interface MyRankRow {
  rank: number;
  weekly_xp: number;
  view_count: number;
  total_participants: number;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
  return "border-border/30";
};

const formatCountdown = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
};

// Server resets at UTC Monday 00:00 (matches SQL date_trunc('week', now()) which uses UTC).
const getNextResetDate = () => {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0 = Sun
  const daysUntil = utcDay === 0 ? 1 : 8 - utcDay;
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntil,
    0, 0, 0, 0
  ));
  return next;
};

export const WeeklyXPLeaderboard = () => {
  const { data: leaders, isLoading } = useQuery<LeaderboardRow[]>({
    queryKey: ["weekly-xp-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_xp_leaderboard");
      if (error) throw error;
      return (data as LeaderboardRow[]) || [];
    },
    refetchInterval: 60_000,
  });

  const { data: myRank } = useQuery<MyRankRow | null>({
    queryKey: ["my-weekly-xp-rank"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.rpc("get_my_weekly_xp_rank");
      if (error) throw error;
      const rows = (data as MyRankRow[]) || [];
      return rows[0] ?? null;
    },
    refetchInterval: 60_000,
  });

  const isInTop10 = !!(myRank && leaders?.some((l) => Number(l.rank) === Number(myRank.rank) && Number(myRank.rank) <= 10));

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const resetDate = getNextResetDate();
  const countdown = formatCountdown(resetDate.getTime() - now);
  const resetLabel = resetDate.toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[44px] px-2 py-1.5 rounded-lg bg-background/60 border border-primary/20">
      <span className="text-lg font-black tabular-nums text-primary leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Weekly XP Leaderboard
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            <RotateCcw className="h-3 w-3 mr-1 text-orange-500" />
            Auto-reset every Monday 00:00
          </Badge>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-400/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs font-bold">Next reset</p>
                <p className="text-[10px] text-muted-foreground capitalize">{resetLabel}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <TimeBox value={countdown.days} label="days" />
              <TimeBox value={countdown.hours} label="hrs" />
              <TimeBox value={countdown.minutes} label="min" />
              <TimeBox value={countdown.seconds} label="sec" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            Top 3 each week earn bonus XP. Rankings reset every Monday — fresh chance to win!
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
        ) : !leaders || leaders.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Be the first to earn XP this week!</p>
          </div>
        ) : (
          leaders.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRankBg(Number(entry.rank))}`}
            >
              <div className="flex items-center justify-center w-8">{getRankIcon(Number(entry.rank))}</div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.display_name}
                    className="h-8 w-8 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{entry.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.view_count} views</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-primary">{entry.weekly_xp.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          ))
        )}

        {/* Your rank badge — shown when user is signed in */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">
                  {isInTop10 ? "You're in the top 10! 🎉" : "Your position this week"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Rank #{myRank.rank} of {myRank.total_participants} · {myRank.view_count} views
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-primary">{Number(myRank.weekly_xp).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
