import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Zap, Award } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PlayerStatsDisplayProps {
  xp?: number;
  level?: number;
  elo?: number;
  eloChange?: number;
  wins?: number;
  losses?: number;
  streak?: number;
}

const LEVELS = [
  { level: 1, xpRequired: 0, title: "Novice", icon: "🧠" },
  { level: 2, xpRequired: 100, title: "Learner", icon: "📚" },
  { level: 3, xpRequired: 300, title: "Scholar", icon: "🎓" },
  { level: 4, xpRequired: 600, title: "Expert", icon: "⚡" },
  { level: 5, xpRequired: 1000, title: "Master", icon: "🏆" },
  { level: 6, xpRequired: 1500, title: "Grandmaster", icon: "👑" },
  { level: 7, xpRequired: 2500, title: "Legend", icon: "💎" },
  { level: 8, xpRequired: 4000, title: "Mythic", icon: "🔮" },
  { level: 9, xpRequired: 6000, title: "Immortal", icon: "⭐" },
  { level: 10, xpRequired: 10000, title: "Transcendent", icon: "🌟" },
];

const ELO_RANKS = [
  { min: 0, name: "Unranked", color: "text-muted-foreground", bg: "bg-muted" },
  { min: 800, name: "Bronze", color: "text-amber-700", bg: "bg-amber-700/10" },
  { min: 1000, name: "Silver", color: "text-slate-400", bg: "bg-slate-400/10" },
  { min: 1200, name: "Gold", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { min: 1400, name: "Platinum", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { min: 1600, name: "Diamond", color: "text-violet-500", bg: "bg-violet-500/10" },
  { min: 1800, name: "Master", color: "text-rose-500", bg: "bg-rose-500/10" },
  { min: 2000, name: "Grandmaster", color: "text-primary", bg: "bg-primary/10" },
];

export const PlayerStatsDisplay = ({
  xp = 0,
  level = 1,
  elo = 1000,
  eloChange = 0,
  wins = 0,
  losses = 0,
  streak = 0,
}: PlayerStatsDisplayProps) => {
  const currentLevelData = LEVELS.find(l => l.level === level) || LEVELS[0];
  const nextLevelData = LEVELS.find(l => l.level === level + 1);
  const xpProgress = nextLevelData
    ? ((xp - currentLevelData.xpRequired) / (nextLevelData.xpRequired - currentLevelData.xpRequired)) * 100
    : 100;

  const eloRank = ELO_RANKS.slice().reverse().find(r => elo >= r.min) || ELO_RANKS[0];
  const nextEloRank = ELO_RANKS.find(r => r.min > elo);
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Player Stats Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Player Stats Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Player Stats Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* XP & Level Card */}
      <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentLevelData.icon}
              </motion.span>
              <span className="text-lg">Level {level}</span>
            </div>
            <Badge variant="outline" className="text-xs border-primary/20">{currentLevelData.title}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{xp} XP</span>
              {nextLevelData && (
                <span className="text-muted-foreground">{nextLevelData.xpRequired} XP</span>
              )}
            </div>
            <div className="relative">
              <Progress value={xpProgress} className="h-3" />
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
                style={{ width: `${xpProgress}%` }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {nextLevelData && (
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {nextLevelData.xpRequired - xp} XP to Level {level + 1} ({nextLevelData.title})
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { value: wins, label: "Wins", color: "text-green-500" },
              { value: losses, label: "Losses", color: "text-red-500" },
              { value: `${winRate}%`, label: "Win Rate", color: "text-primary" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-2 rounded-lg bg-muted/30 backdrop-blur-sm border border-primary/5"
              >
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ELO Rating Card */}
      <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-primary/5" />
        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-lg">ELO Rating</span>
            </div>
            <Badge className={`${eloRank.bg} ${eloRank.color} border-0`}>{eloRank.name}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="text-center py-2">
            <motion.div
              className="text-5xl font-black text-primary"
              key={elo}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {elo}
            </motion.div>
            {eloChange !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: eloChange > 0 ? 10 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-center gap-1 mt-1 text-sm font-bold ${
                  eloChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {eloChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {eloChange > 0 ? "+" : ""}{eloChange}
              </motion.div>
            )}
          </div>

          {nextEloRank && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={eloRank.color}>{eloRank.name}</span>
                <span className={nextEloRank.color}>{nextEloRank.name}</span>
              </div>
              <Progress
                value={((elo - (ELO_RANKS.find(r => r.name === eloRank.name)?.min || 0)) /
                  (nextEloRank.min - (ELO_RANKS.find(r => r.name === eloRank.name)?.min || 0))) * 100}
                className="h-2"
              />
              <p className="text-[10px] text-muted-foreground text-center">
                {nextEloRank.min - elo} points to {nextEloRank.name}
              </p>
            </div>
          )}

          {streak > 0 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 gap-1">
                <Zap className="h-3 w-3" />
                {streak} Win Streak
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};