import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Flame, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderEntry {
  user_id: string;
  wins: number;
  total_games: number;
  win_rate: number;
  streak: number;
  elo: number;
  previousRank?: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const RANK_COLORS = [
  "from-yellow-500/20 to-amber-600/10 border-yellow-500/30",
  "from-slate-400/20 to-slate-500/10 border-slate-400/30",
  "from-amber-700/20 to-amber-800/10 border-amber-700/30",
];

export const AnimatedLeaderboard = () => {
  const navigate = useNavigate();
  const prevRankingsRef = useRef<Record<string, number>>({});

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["brain-duel-animated-leaderboard"],
    queryFn: async () => {
      const [matchesResult, leaguesResult] = await Promise.all([
        supabase
          .from("brain_duel_matches")
          .select("player1_id, player2_id, winner_id")
          .eq("status", "finished"),
        supabase
          .from("brain_duel_leagues")
          .select("user_id, league_points, win_streak"),
      ]);

      if (matchesResult.error) throw matchesResult.error;
      const matches = matchesResult.data || [];
      const leagues = leaguesResult.data || [];

      const playerStats: Record<string, { wins: number; total: number }> = {};

      matches.forEach((match: any) => {
        [match.player1_id, match.player2_id].forEach((pid: string) => {
          if (!playerStats[pid]) playerStats[pid] = { wins: 0, total: 0 };
          playerStats[pid].total++;
          if (match.winner_id === pid) playerStats[pid].wins++;
        });
      });

      const entries = Object.entries(playerStats)
        .map(([userId, stats]) => {
          const league = leagues.find((l: any) => l.user_id === userId);
          return {
            user_id: userId,
            wins: stats.wins,
            total_games: stats.total,
            win_rate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
            streak: league?.win_streak || 0,
            elo: league?.league_points || 1000,
          };
        })
        .filter((e) => e.total_games >= 3)
        .sort((a, b) => b.elo !== a.elo ? b.elo - a.elo : b.wins - a.wins)
        .slice(0, 15);

      // Fetch profiles
      const userIds = entries.map((e) => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Compute rank changes
      const prevRankings = prevRankingsRef.current;
      const result: LeaderEntry[] = entries.map((entry, i) => ({
        ...entry,
        previousRank: prevRankings[entry.user_id],
        profile: profiles?.find((p) => p.id === entry.user_id) || null,
      }));

      // Store current rankings for next refresh
      const newRankings: Record<string, number> = {};
      entries.forEach((e, i) => { newRankings[e.user_id] = i; });
      prevRankingsRef.current = newRankings;

      return result;
    },
    refetchInterval: 30000, // Refresh every 30s for live changes
  });

  const getRankChange = (entry: LeaderEntry, currentIndex: number) => {
    if (entry.previousRank === undefined) return null;
    const change = entry.previousRank - currentIndex;
    if (change > 0) return { direction: "up", amount: change };
    if (change < 0) return { direction: "down", amount: Math.abs(change) };
    return { direction: "same", amount: 0 };
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{index + 1}</span>;
  };

  return (
    <>
      <FloatingHowItWorks title={"Animated Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Animated Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Animated Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-500/10">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            Live Leaderboard
          </div>
          <Badge variant="outline" className="text-[10px] animate-pulse border-green-500/30 text-green-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 inline-block" />
            Auto-updating
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Play 3+ games to appear on the leaderboard!</p>
          </div>
        ) : (
          <LayoutGroup>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {leaderboard.map((entry, index) => {
                  const rankChange = getRankChange(entry, index);
                  return (
                    <motion.div
                      key={entry.user_id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      onClick={() => navigate(`/profile/${entry.user_id}`)}
                      className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-colors hover:bg-primary/5 ${
                        index < 3 ? `bg-gradient-to-r ${RANK_COLORS[index]}` : "bg-muted/10 border-primary/5"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center flex-shrink-0">
                        {getMedalIcon(index)}
                      </div>

                      {/* Rank change indicator */}
                      <div className="w-6 flex-shrink-0">
                        {rankChange?.direction === "up" && (
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center text-green-400"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">{rankChange.amount}</span>
                          </motion.div>
                        )}
                        {rankChange?.direction === "down" && (
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center text-red-400"
                          >
                            <TrendingDown className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">{rankChange.amount}</span>
                          </motion.div>
                        )}
                        {rankChange?.direction === "same" && (
                          <Minus className="h-3 w-3 text-muted-foreground/50" />
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className={`h-9 w-9 ${index === 0 ? "ring-2 ring-yellow-500/50" : ""}`}>
                        <AvatarImage src={entry.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {entry.profile?.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{entry.profile?.full_name || "Anonymous"}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{entry.total_games} games</span>
                          <span>•</span>
                          <span>{entry.win_rate.toFixed(0)}% WR</span>
                          {entry.streak >= 3 && (
                            <Badge className="h-4 px-1 text-[9px] bg-orange-500/15 text-orange-400 border-0">
                              <Flame className="h-2.5 w-2.5 mr-0.5" />
                              {entry.streak}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* ELO + Wins */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-lg font-black text-primary">{entry.elo}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{entry.wins}W</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}
      </CardContent>
    </Card>
    </>
  );
};
