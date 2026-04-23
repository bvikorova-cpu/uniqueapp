import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Sparkles, Flame, Clock, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  view_count: number;
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

const msUntilNextMonday = () => {
  const now = new Date();
  const nextMonday = new Date(now);
  const day = now.getDay();
  const daysUntil = day === 0 ? 1 : 8 - day;
  nextMonday.setDate(now.getDate() + daysUntil);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
};

const formatCountdown = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
};

const getNextResetDate = () => {
  const now = new Date();
  const nextMonday = new Date(now);
  const day = now.getDay();
  const daysUntil = day === 0 ? 1 : 8 - day;
  nextMonday.setDate(now.getDate() + daysUntil);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
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

  const countdown = formatCountdown(msUntilNextMonday());

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Weekly XP Leaderboard
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            <Flame className="h-3 w-3 mr-1 text-orange-500" />
            Resets in {countdown}
          </Badge>
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
      </CardContent>
    </Card>
  );
};
