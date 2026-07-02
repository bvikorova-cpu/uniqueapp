import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star, ArrowLeftRight, Medal, Crown, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type SortType = "exchanges" | "rating" | "streak";

interface SwapLeaderboardProps {
  onBack: () => void;
}

export const SwapLeaderboard = ({ onBack }: SwapLeaderboardProps) => {
  const [sortBy, setSortBy] = useState<SortType>("exchanges");

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['skill-swap-leaderboard'],
    queryFn: async () => {
      // Get conversations with reviews to build leaderboard
      const { data: conversations } = await supabase
        .from('skill_swap_conversations')
        .select('user1_id, user2_id, completed_at')
        .eq('status', 'completed');

      const { data: reviews } = await supabase
        .from('skill_swap_reviews')
        .select('reviewer_id, reviewed_user_id, rating');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location');

      if (!profiles?.length) return [];

      // Build stats per user
      const userStats = new Map<string, { exchanges: number; totalRating: number; reviewCount: number }>();
      
      conversations?.forEach(c => {
        [c.user1_id, c.user2_id].forEach(uid => {
          const s = userStats.get(uid) || { exchanges: 0, totalRating: 0, reviewCount: 0 };
          s.exchanges++;
          userStats.set(uid, s);
        });
      });

      reviews?.forEach(r => {
        const s = userStats.get(r.reviewed_user_id) || { exchanges: 0, totalRating: 0, reviewCount: 0 };
        s.totalRating += (r.rating || 0);
        s.reviewCount++;
        userStats.set(r.reviewed_user_id, s);
      });

      // Build leaderboard entries
      const entries = profiles
        .filter(p => userStats.has(p.id))
        .map(p => {
          const s = userStats.get(p.id)!;
          return {
            name: p.full_name || 'User',
            avatar: p.avatar_url || '👤',
            country: p.location || '—',
            exchanges: s.exchanges,
            rating: s.reviewCount > 0 ? Math.round((s.totalRating / s.reviewCount) * 10) / 10 : 0,
            reviews: s.reviewCount,
            isAvatarUrl: !!p.avatar_url,
          };
        })
        .sort((a, b) => b.exchanges - a.exchanges)
        .slice(0, 20)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      return entries;
    },
  });

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    return b.exchanges - a.exchanges;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Swap Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Swap Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Swap Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Leaderboard
        </h2>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Rankings Yet</h3>
          <p className="text-sm text-muted-foreground">Complete skill swaps to appear on the leaderboard!</p>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[sorted[1], sorted[0], sorted[2]].map((entry, i) => {
                const podiumOrder = [2, 1, 3];
                const heights = ["h-28", "h-36", "h-24"];
                const colors = ["from-gray-300 to-gray-400", "from-yellow-400 to-amber-500", "from-amber-600 to-amber-700"];
                return (
                  <motion.div key={entry.name + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-border/50 mb-2 overflow-hidden">
                      {entry.isAvatarUrl ? <img src={entry.avatar} className="w-full h-full object-cover" /> : '👤'}
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-center">{entry.name}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.exchanges} swaps</p>
                    <div className={`w-full ${heights[i]} rounded-t-xl bg-gradient-to-t ${colors[i]} mt-2 flex items-start justify-center pt-2`}>
                      <span className="text-white font-black text-lg">#{podiumOrder[i]}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex gap-2 justify-center">
            {([
              { key: "exchanges" as SortType, label: "Most Exchanges", icon: ArrowLeftRight },
              { key: "rating" as SortType, label: "Highest Rated", icon: Star },
            ]).map(tab => (
              <Button key={tab.key} size="sm" variant={sortBy === tab.key ? "default" : "outline"} onClick={() => setSortBy(tab.key)} className="text-xs gap-1.5">
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </Button>
            ))}
          </div>

          {/* Full List */}
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
            <div className="divide-y divide-border/30">
              {sorted.map((entry, i) => (
                <motion.div
                  key={entry.name + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/10 transition-all ${i < 3 ? "bg-primary/5" : ""}`}
                >
                  <div className="w-8 flex justify-center">{getRankIcon(i + 1)}</div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl overflow-hidden">
                    {entry.isAvatarUrl ? <img src={entry.avatar} className="w-full h-full object-cover" /> : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{entry.name}</p>
                      <Badge variant="outline" className="text-[9px] flex-shrink-0">{entry.country}</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-black">{entry.exchanges}</div>
                        <p className="text-[9px] text-muted-foreground">swaps</p>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-black flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {entry.rating}
                        </div>
                        <p className="text-[9px] text-muted-foreground">rating</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
};