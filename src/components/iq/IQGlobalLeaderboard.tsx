import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  best_iq: number;
  tests_taken: number;
}

const getLeague = (iq: number) => {
  if (iq >= 145) return "Legend";
  if (iq >= 135) return "Grandmaster";
  if (iq >= 125) return "Master";
  if (iq >= 115) return "Diamond";
  return "Gold";
};

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

export default function IQGlobalLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_iq_global_leaderboard");
      if (!error && data) setEntries(data as LeaderboardEntry[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🌍 Global Leaderboard</h2>
      <Card className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Worldwide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {loading ? (
            <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-6">No completed tests yet. Be the first to top the chart!</p>
          ) : (
            entries.map((entry, i) => {
              const rank = i + 1;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRankBg(rank)} transition-all`}
                >
                  <div className="flex items-center justify-center w-8">{getRankIcon(rank)}</div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-full bg-muted">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{entry.username}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.tests_taken} tests</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{getLeague(entry.best_iq)}</Badge>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-500">{entry.best_iq}</p>
                    <p className="text-[9px] text-muted-foreground">IQ</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
