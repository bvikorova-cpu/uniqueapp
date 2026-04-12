import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, User } from "lucide-react";
import { motion } from "framer-motion";

const mockLeaderboard = [
  { rank: 1, username: "AgelessEmma", score: 98, transformations: 42, badge: "Crystal Legend" },
  { rank: 2, username: "GlowQueen", score: 95, transformations: 38, badge: "Diamond" },
  { rank: 3, username: "YouthKeeper", score: 91, transformations: 55, badge: "Diamond" },
  { rank: 4, username: "SkinGenius", score: 88, transformations: 31, badge: "Platinum" },
  { rank: 5, username: "FaceWizard", score: 85, transformations: 47, badge: "Platinum" },
  { rank: 6, username: "TimeTraveler", score: 82, transformations: 29, badge: "Gold" },
  { rank: 7, username: "AgeDefier", score: 79, transformations: 60, badge: "Gold" },
  { rank: 8, username: "CrystalSkin", score: 76, transformations: 23, badge: "Gold" },
  { rank: 9, username: "BioHacker", score: 73, transformations: 34, badge: "Silver" },
  { rank: 10, username: "GlowUp_Pro", score: 70, transformations: 41, badge: "Silver" },
];

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

export default function FutureFaceLeaderboard() {
  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🏆 Transformation Leaderboard</h2>
      <Card className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Most Dramatic Transformations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {mockLeaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRankBg(entry.rank)}`}
            >
              <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 rounded-full bg-muted"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{entry.username}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.transformations} analyses</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] shrink-0">{entry.badge}</Badge>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-cyan-500">{entry.score}</p>
                <p className="text-[9px] text-muted-foreground">Score</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
