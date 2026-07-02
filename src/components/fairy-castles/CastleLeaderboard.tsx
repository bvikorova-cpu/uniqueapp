import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardEntry {
  rank: number;
  name: string;
  stamps: number;
  xp: number;
  avatar: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "CastleMaster_22", stamps: 6, xp: 2450, avatar: "👸" },
  { rank: 2, name: "FairyFan_UK", stamps: 6, xp: 2380, avatar: "🤴" },
  { rank: 3, name: "MagicExplorer", stamps: 5, xp: 1920, avatar: "🧙" },
  { rank: 4, name: "PrincessAdv", stamps: 5, xp: 1850, avatar: "👧" },
  { rank: 5, name: "TourKing99", stamps: 4, xp: 1600, avatar: "👦" },
  { rank: 6, name: "You", stamps: 0, xp: 0, avatar: "⭐" },
];

const challenges = [
  { title: "Speed Runner 🏃", desc: "Complete any castle tour under 10 minutes", reward: "+50 XP" },
  { title: "Collector 🎒", desc: "Find 10 hidden collectibles this week", reward: "+100 XP" },
  { title: "Quiz Master 🧠", desc: "Get 3 perfect quiz scores in a row", reward: "+75 XP" },
];

interface CastleLeaderboardProps {
  userStamps: number;
}

export function CastleLeaderboard({ userStamps }: CastleLeaderboardProps) {
  const leaderboard = mockLeaderboard.map(e =>
    e.name === "You" ? { ...e, stamps: userStamps, xp: userStamps * 100 } : e
  ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <>
      <FloatingHowItWorks title={"Castle Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
    >
      {/* Leaderboard */}
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-bold">Top Explorers</h3>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry, i) => {
            const isYou = entry.name === "You";
            const rankIcon = entry.rank === 1 ? <Crown className="h-4 w-4 text-amber-500" />
              : entry.rank === 2 ? <Medal className="h-4 w-4 text-gray-400" />
              : entry.rank === 3 ? <Medal className="h-4 w-4 text-amber-700" />
              : null;

            return (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isYou ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-sm text-muted-foreground">
                    {rankIcon || `#${entry.rank}`}
                  </span>
                  <span className="text-xl">{entry.avatar}</span>
                  <div>
                    <p className={`text-sm font-semibold ${isYou ? "text-primary" : ""}`}>
                      {entry.name} {isYou && "⬅️"}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.stamps}/6 stamps</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{entry.xp} XP</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-bold">Weekly Challenges</h3>
        </div>

        <div className="space-y-3">
          {challenges.map((ch, i) => (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold">{ch.title}</h4>
                <span className="text-xs font-bold text-green-500">{ch.reward}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ch.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
}
