import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Swords, TrendingUp, TrendingDown, Search, Trophy, Target, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HeadToHeadRecord {
  opponentId: string;
  opponentName: string;
  opponentAvatar: string | null;
  wins: number;
  losses: number;
  totalGames: number;
  lastPlayed: string;
}

export const DuelHistoryStats = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["brain-duel-history-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { records: [], totalStats: null };

      const { data: matches } = await supabase
        .from("brain_duel_matches")
        .select("*")
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false });

      if (!matches || matches.length === 0) return { records: [], totalStats: null };

      // Build head-to-head records
      const h2h: Record<string, { wins: number; losses: number; lastPlayed: string }> = {};
      let totalWins = 0, totalLosses = 0, totalCorrect = 0, totalQuestions = 0;
      const categoryCounts: Record<string, number> = {};

      matches.forEach((match: any) => {
        const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;
        if (!h2h[opponentId]) h2h[opponentId] = { wins: 0, losses: 0, lastPlayed: match.created_at };

        if (match.winner_id === user.id) {
          h2h[opponentId].wins++;
          totalWins++;
        } else {
          h2h[opponentId].losses++;
          totalLosses++;
        }

        if (match.player1_score) totalCorrect += match.player1_id === user.id ? match.player1_score : match.player2_score;
        totalQuestions += match.questions_count || 10;
        categoryCounts[match.category] = (categoryCounts[match.category] || 0) + 1;
      });

      // Fetch profiles
      const opponentIds = Object.keys(h2h);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", opponentIds);

      const records: HeadToHeadRecord[] = opponentIds.map((id) => {
        const profile = profiles?.find((p) => p.id === id);
        return {
          opponentId: id,
          opponentName: profile?.full_name || "Anonymous",
          opponentAvatar: profile?.avatar_url || null,
          wins: h2h[id].wins,
          losses: h2h[id].losses,
          totalGames: h2h[id].wins + h2h[id].losses,
          lastPlayed: h2h[id].lastPlayed,
        };
      }).sort((a, b) => b.totalGames - a.totalGames);

      const bestCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];

      return {
        records,
        totalStats: {
          totalMatches: matches.length,
          totalWins,
          totalLosses,
          winRate: matches.length > 0 ? Math.round((totalWins / matches.length) * 100) : 0,
          bestCategory: bestCategory?.[0] || "N/A",
          uniqueOpponents: opponentIds.length,
        },
      };
    },
  });

  const filteredRecords = historyData?.records?.filter((r) =>
    r.opponentName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <FloatingHowItWorks title={"Duel History Stats - How it works"} steps={[{ title: 'Open', desc: 'Access the Duel History Stats section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Duel History Stats.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          Duel History & Head-to-Head Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Overview stats */}
        {historyData?.totalStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Matches", value: historyData.totalStats.totalMatches, icon: Swords, color: "text-primary" },
              { label: "Win Rate", value: `${historyData.totalStats.winRate}%`, icon: Target, color: "text-green-400" },
              { label: "Unique Rivals", value: historyData.totalStats.uniqueOpponents, icon: Trophy, color: "text-yellow-400" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="p-3 rounded-xl bg-muted/30 border border-primary/10 text-center"
                whileHover={{ scale: 1.03 }}
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opponent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/20"
          />
        </div>

        {/* Head-to-head list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No duel history yet. Play matches to build your rivalry records!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filteredRecords.map((record, i) => {
                const isWinning = record.wins > record.losses;
                const isTied = record.wins === record.losses;
                return (
                  <motion.div
                    key={record.opponentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                      isWinning ? "border-green-500/20 bg-green-500/5" : isTied ? "border-yellow-500/20 bg-yellow-500/5" : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={record.opponentAvatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {record.opponentName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{record.opponentName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {record.totalGames} games • Last: {new Date(record.lastPlayed).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <span className="text-green-400">{record.wins}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-red-400">{record.losses}</span>
                        </div>
                      </div>
                      {isWinning ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : isTied ? (
                        <Swords className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
