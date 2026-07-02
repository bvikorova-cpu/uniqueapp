import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, Award, Users, Crown, Medal, Star, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_votes: number;
  rank: number;
}

export const CommunityLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get vote counts per user
      const { data: votes } = await supabase
        .from("absolution_votes")
        .select("voter_id")
        .limit(1000);

      if (votes) {
        const voteCounts = votes.reduce((acc, v) => {
          acc[v.voter_id] = (acc[v.voter_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sorted = Object.entries(voteCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([uid, count], i) => ({
            user_id: uid,
            display_name: `Member #${uid.substring(0, 6).toUpperCase()}`,
            total_votes: count,
            rank: i + 1,
          }));

        setLeaders(sorted.slice(0, 20));

        if (user) {
          const myEntry = sorted.find(e => e.user_id === user.id);
          setMyRank(myEntry?.rank || null);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30";
    return "bg-card/80 border-border/50";
  };

  if (loading) {
    return <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50"><Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" /></Card>;
  }

  return (
    <>
      <FloatingHowItWorks
        title='Community Leaderboard'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Community Leaderboard panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black mb-2">Community Leaderboard</h3>
            <p className="text-sm text-muted-foreground">
              Top community members ranked by their participation in the absolution voting system.
              Cast votes to climb the ranks and earn recognition.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadLeaderboard} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </Card>

      {/* My Rank */}
      {myRank && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <p className="font-black text-sm">Your Rank</p>
                <p className="text-xs text-muted-foreground">Keep voting to climb higher</p>
              </div>
            </div>
            <span className="text-3xl font-black text-primary">#{myRank}</span>
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      {leaders.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Users className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No community members yet</p>
          <p className="text-xs text-muted-foreground">Start voting on confessions to appear on the leaderboard</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {leaders.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`p-4 backdrop-blur-xl transition-all ${getRankBg(entry.rank)}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{entry.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">Rank #{entry.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-primary">{entry.total_votes}</p>
                    <p className="text-[10px] text-muted-foreground">votes cast</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
