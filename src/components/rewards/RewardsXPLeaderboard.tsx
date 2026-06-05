import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Crown, TrendingUp, Star, Flame, Gem, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  login_streak: number;
  badges: number;
  rank: number;
}

type Period = "weekly" | "monthly" | "alltime";

async function fetchLeaderboard(period: Period): Promise<LeaderboardEntry[]> {
  // Server-side aggregation via SECURITY DEFINER RPC — avoids pulling thousands of xp_events rows.
  const { data: rows, error } = await (supabase as any).rpc("rewards_xp_leaderboard", {
    _period: period,
    _limit: 50,
  });
  if (error || !rows) return [];
  const totals: { user_id: string; total: number }[] = (rows as any[]).map((r) => ({
    user_id: r.user_id,
    total: Number(r.total ?? 0),
  }));


  if (totals.length === 0) return [];
  const userIds = totals.map((t) => t.user_id);

  const [pointsRes, profilesRes, badgesRes] = await Promise.all([
    supabase.from("user_points").select("user_id, level, login_streak").in("user_id", userIds),
    (supabase as any).from("profiles_public").select("id, full_name, username, avatar_url").in("id", userIds),
    supabase.from("user_badges").select("user_id").in("user_id", userIds),
  ]);

  const pointsMap = new Map((pointsRes.data ?? []).map((p: any) => [p.user_id, p]));
  const profileMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p]));
  const badgeCounts = new Map<string, number>();
  for (const b of badgesRes.data ?? []) {
    badgeCounts.set(b.user_id, (badgeCounts.get(b.user_id) ?? 0) + 1);
  }

  return totals
    .filter((t) => t.total > 0)
    .map((t, i) => {
      const profile: any = profileMap.get(t.user_id);
      const pts: any = pointsMap.get(t.user_id);
      return {
        user_id: t.user_id,
        display_name: profile?.username || profile?.full_name || `Player ${t.user_id.slice(0, 4)}`,
        avatar_url: profile?.avatar_url ?? null,
        total_points: t.total,
        level: pts?.level ?? 1,
        login_streak: pts?.login_streak ?? 0,
        badges: badgeCounts.get(t.user_id) ?? 0,
        rank: i + 1,
      };
    });
}

export default function RewardsXPLeaderboard() {
  const [period, setPeriod] = useState<Period>("alltime");
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["rewards-xp-leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
    staleTime: 60_000,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-300/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-orange-800/10 border-amber-700/30";
    return "bg-muted/10 border-border/20";
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> XP Leaderboard</h3>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-8">
            <TabsTrigger value="weekly" className="text-xs px-3 h-7">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs px-3 h-7">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="text-xs px-3 h-7">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading leaderboard…
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-bold">Be the first on the leaderboard!</p>
          <p className="text-xs text-muted-foreground mt-1">No one has earned XP yet. Start earning to claim the #1 spot.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((user, i) => (
            <motion.div key={user.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-center justify-between p-3 rounded-xl border ${getRankBg(user.rank)}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 flex justify-center shrink-0">{getRankIcon(user.rank)}</div>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs">👤</div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{user.display_name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" /> Lv.{user.level}</span>
                    <span className="flex items-center gap-0.5"><Gem className="h-2.5 w-2.5" /> {user.badges}</span>
                    <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" /> {user.login_streak}d</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-black text-amber-500 shrink-0">{user.total_points.toLocaleString()} XP</span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
