import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star, ArrowLeftRight, Medal, Crown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  country: string;
  exchanges: number;
  rating: number;
  reviews: number;
  topSkill: string;
  streak: number;
  change: "up" | "down" | "same";
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Yuki T.", avatar: "🇯🇵", country: "Japan", exchanges: 41, rating: 5.0, reviews: 38, topSkill: "Japanese", streak: 14, change: "same" },
  { rank: 2, name: "Sarah K.", avatar: "🇬🇧", country: "UK", exchanges: 34, rating: 4.9, reviews: 30, topSkill: "Piano", streak: 10, change: "up" },
  { rank: 3, name: "Chen W.", avatar: "🇨🇳", country: "China", exchanges: 38, rating: 4.9, reviews: 35, topSkill: "Mandarin", streak: 12, change: "down" },
  { rank: 4, name: "Priya P.", avatar: "🇮🇳", country: "India", exchanges: 29, rating: 4.9, reviews: 27, topSkill: "Meditation", streak: 8, change: "up" },
  { rank: 5, name: "James L.", avatar: "🇺🇸", country: "USA", exchanges: 27, rating: 4.6, reviews: 24, topSkill: "Photography", streak: 6, change: "same" },
  { rank: 6, name: "Fatima A.", avatar: "🇦🇪", country: "UAE", exchanges: 25, rating: 4.8, reviews: 22, topSkill: "Arabic", streak: 9, change: "up" },
  { rank: 7, name: "Tomáš M.", avatar: "🇸🇰", country: "Slovakia", exchanges: 22, rating: 4.8, reviews: 20, topSkill: "Programming", streak: 5, change: "up" },
  { rank: 8, name: "Carlos R.", avatar: "🇲🇽", country: "Mexico", exchanges: 20, rating: 4.5, reviews: 18, topSkill: "Spanish", streak: 4, change: "down" },
  { rank: 9, name: "Maria G.", avatar: "🇧🇷", country: "Brazil", exchanges: 18, rating: 4.7, reviews: 16, topSkill: "Dance", streak: 7, change: "same" },
  { rank: 10, name: "Aisha B.", avatar: "🇳🇬", country: "Nigeria", exchanges: 15, rating: 4.8, reviews: 14, topSkill: "Design", streak: 3, change: "up" },
];

type SortType = "exchanges" | "rating" | "streak";

interface SwapLeaderboardProps {
  onBack: () => void;
}

export const SwapLeaderboard = ({ onBack }: SwapLeaderboardProps) => {
  const [sortBy, setSortBy] = useState<SortType>("exchanges");

  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "streak") return b.streak - a.streak;
    return b.exchanges - a.exchanges;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
  };

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

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
        {[sorted[1], sorted[0], sorted[2]].map((entry, i) => {
          const podiumOrder = [2, 1, 3];
          const heights = ["h-28", "h-36", "h-24"];
          const colors = ["from-gray-300 to-gray-400", "from-yellow-400 to-amber-500", "from-amber-600 to-amber-700"];
          return (
            <motion.div key={entry.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-border/50 mb-2">
                {entry.avatar}
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

      {/* Sort Tabs */}
      <div className="flex gap-2 justify-center">
        {([
          { key: "exchanges" as SortType, label: "Most Exchanges", icon: ArrowLeftRight },
          { key: "rating" as SortType, label: "Highest Rated", icon: Star },
          { key: "streak" as SortType, label: "Longest Streak", icon: TrendingUp },
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
              key={entry.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 p-4 hover:bg-muted/10 transition-all ${i < 3 ? "bg-primary/5" : ""}`}
            >
              <div className="w-8 flex justify-center">{getRankIcon(i + 1)}</div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl">
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm truncate">{entry.name}</p>
                  <Badge variant="outline" className="text-[9px] flex-shrink-0">{entry.country}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">Top skill: {entry.topSkill}</p>
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
                  <div className="text-center">
                    <div className="text-sm font-black">🔥{entry.streak}</div>
                    <p className="text-[9px] text-muted-foreground">streak</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
