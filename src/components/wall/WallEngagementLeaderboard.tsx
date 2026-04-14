import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockLeaderboard = [
  { rank: 1, name: "Sarah K.", avatar: "🌟", likes: 2847, comments: 1203, shares: 567, score: 4617 },
  { rank: 2, name: "Marcus T.", avatar: "🔥", likes: 2234, comments: 987, shares: 445, score: 3666 },
  { rank: 3, name: "Aisha L.", avatar: "💎", likes: 1987, comments: 876, shares: 389, score: 3252 },
  { rank: 4, name: "James R.", avatar: "⭐", likes: 1654, comments: 723, shares: 298, score: 2675 },
  { rank: 5, name: "Luna M.", avatar: "🎯", likes: 1432, comments: 654, shares: 267, score: 2353 },
  { rank: 6, name: "Oliver P.", avatar: "💫", likes: 1287, comments: 567, shares: 234, score: 2088 },
  { rank: 7, name: "Zara N.", avatar: "🌈", likes: 1098, comments: 489, shares: 198, score: 1785 },
  { rank: 8, name: "Ethan W.", avatar: "🏆", likes: 987, comments: 423, shares: 167, score: 1577 },
  { rank: 9, name: "Mia C.", avatar: "✨", likes: 876, comments: 378, shares: 145, score: 1399 },
  { rank: 10, name: "Noah B.", avatar: "🎭", likes: 765, comments: 334, shares: 123, score: 1222 },
];

export default function WallEngagementLeaderboard() {
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
    <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-orange-500" /> Engagement Rankings</h3>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8">
              <TabsTrigger value="weekly" className="text-xs px-3 h-7">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-7">Monthly</TabsTrigger>
              <TabsTrigger value="alltime" className="text-xs px-3 h-7">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Your position */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/15 to-teal-500/10 border border-orange-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-orange-500">#42</span>
              <span className="text-lg">👤</span>
              <div>
                <p className="font-bold text-sm">You</p>
                <p className="text-[10px] text-muted-foreground">Score: 456 pts</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
              <TrendingUp className="h-3 w-3" /> +5 ranks
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {mockLeaderboard.map((user, i) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl border ${getRankBg(user.rank)}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 flex justify-center">{getRankIcon(user.rank)}</div>
                <span className="text-xl">{user.avatar}</span>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" /> {user.likes}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" /> {user.comments}</span>
                    <span className="flex items-center gap-0.5"><Share2 className="h-2.5 w-2.5" /> {user.shares}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-black text-orange-500">{user.score.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
