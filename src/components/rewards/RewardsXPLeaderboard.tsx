import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Star, Flame, Gem } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockLeaderboard = [
  { rank: 1, name: "Alex G.", avatar: "👑", xp: 45200, level: 32, badges: 48, streak: 92 },
  { rank: 2, name: "Maria S.", avatar: "🌟", xp: 38700, level: 28, badges: 42, streak: 67 },
  { rank: 3, name: "Chen W.", avatar: "💎", xp: 34100, level: 25, badges: 38, streak: 54 },
  { rank: 4, name: "Sophie L.", avatar: "⭐", xp: 28900, level: 22, badges: 33, streak: 43 },
  { rank: 5, name: "James K.", avatar: "🔥", xp: 25400, level: 20, badges: 29, streak: 38 },
  { rank: 6, name: "Luna R.", avatar: "💫", xp: 22100, level: 18, badges: 25, streak: 31 },
  { rank: 7, name: "Oliver M.", avatar: "🏆", xp: 19800, level: 16, badges: 22, streak: 28 },
  { rank: 8, name: "Zara N.", avatar: "✨", xp: 17200, level: 14, badges: 19, streak: 21 },
  { rank: 9, name: "Ethan P.", avatar: "🎯", xp: 15600, level: 13, badges: 17, streak: 19 },
  { rank: 10, name: "Mia C.", avatar: "🌈", xp: 13400, level: 11, badges: 14, streak: 15 },
];

export default function RewardsXPLeaderboard() {
  const [period, setPeriod] = useState("weekly");

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
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="weekly" className="text-xs px-3 h-7">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs px-3 h-7">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="text-xs px-3 h-7">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-amber-500">#42</span>
            <span className="text-lg">👤</span>
            <div>
              <p className="font-bold text-sm">You</p>
              <p className="text-[10px] text-muted-foreground">153 XP · Level 2</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
            <TrendingUp className="h-3 w-3" /> +3 ranks
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {mockLeaderboard.map((user, i) => (
          <motion.div key={user.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${getRankBg(user.rank)}`}>
            <div className="flex items-center gap-3">
              <div className="w-7 flex justify-center">{getRankIcon(user.rank)}</div>
              <span className="text-xl">{user.avatar}</span>
              <div>
                <p className="font-bold text-sm">{user.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" /> Lv.{user.level}</span>
                  <span className="flex items-center gap-0.5"><Gem className="h-2.5 w-2.5" /> {user.badges}</span>
                  <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" /> {user.streak}d</span>
                </div>
              </div>
            </div>
            <span className="text-sm font-black text-amber-500">{user.xp.toLocaleString()} XP</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
