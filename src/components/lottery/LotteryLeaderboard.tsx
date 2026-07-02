import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Crown, Medal, Star, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LotteryLeaderboardProps {
  onBack: () => void;
}

const LEADERS = [
  { rank: 1, name: "LuckyMaster", avatar: "🎯", wins: 12, accuracy: 94, streak: 8, prize: "€2,450", tier: "Diamond" },
  { rank: 2, name: "NumWizard", avatar: "🧙", wins: 10, accuracy: 89, streak: 5, prize: "€1,890", tier: "Platinum" },
  { rank: 3, name: "StatsGuru", avatar: "📊", wins: 8, accuracy: 87, streak: 7, prize: "€1,320", tier: "Gold" },
  { rank: 4, name: "PatternPro", avatar: "🔮", wins: 7, accuracy: 82, streak: 3, prize: "€980", tier: "Gold" },
  { rank: 5, name: "LottoKing", avatar: "👑", wins: 6, accuracy: 80, streak: 4, prize: "€750", tier: "Silver" },
  { rank: 6, name: "DrawMaster", avatar: "🎰", wins: 5, accuracy: 78, streak: 2, prize: "€520", tier: "Silver" },
  { rank: 7, name: "NumberNinja", avatar: "🥷", wins: 4, accuracy: 75, streak: 3, prize: "€380", tier: "Bronze" },
  { rank: 8, name: "JackpotJoe", avatar: "💰", wins: 3, accuracy: 72, streak: 1, prize: "€210", tier: "Bronze" },
];

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-2 border-yellow-500/40";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-2 border-gray-400/40";
  if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-2 border-amber-600/40";
  return "bg-muted/30 border border-border/30";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return null;
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Diamond": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "Platinum": return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    case "Gold": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Silver": return "bg-gray-400/20 text-gray-300 border-gray-400/30";
    case "Bronze": return "bg-amber-600/20 text-amber-500 border-amber-600/30";
    default: return "bg-muted text-muted-foreground";
  }
};

export function LotteryLeaderboard({ onBack }: LotteryLeaderboardProps) {
  return (
    <>
      <FloatingHowItWorks
        title='Lottery Leaderboard'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Leaderboard panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">Top players ranked by accuracy & wins</p>
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-2">
        {[LEADERS[1], LEADERS[0], LEADERS[2]].map((leader, i) => {
          const heights = ["h-24", "h-32", "h-20"];
          const sizes = ["text-3xl", "text-4xl", "text-3xl"];
          return (
            <motion.div
              key={leader.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`${sizes[i]} mb-2`}>{leader.avatar}</div>
              <p className="font-black text-sm">{leader.name}</p>
              <Badge className={`${getTierColor(leader.tier)} text-[10px] mb-2`}>{leader.tier}</Badge>
              <div className={`${heights[i]} w-20 rounded-t-xl bg-gradient-to-t ${
                leader.rank === 1 ? "from-yellow-500/30 to-yellow-500/5" :
                leader.rank === 2 ? "from-gray-400/30 to-gray-400/5" :
                "from-amber-600/30 to-amber-600/5"
              } flex items-end justify-center pb-2`}>
                <span className="font-black text-lg">#{leader.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LEADERS.map((leader, i) => (
            <motion.div
              key={leader.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01] ${getRankStyle(leader.rank)}`}
            >
              <div className="w-8 text-center font-bold flex items-center justify-center">
                {getRankIcon(leader.rank) || <span className="text-muted-foreground">#{leader.rank}</span>}
              </div>

              <div className="text-2xl">{leader.avatar}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm truncate">{leader.name}</p>
                  <Badge className={`${getTierColor(leader.tier)} text-[9px] px-1.5 py-0`}>{leader.tier}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {leader.wins} wins</span>
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {leader.streak} streak</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-black">{leader.accuracy}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{leader.prize}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
