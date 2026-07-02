import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, Trophy, Medal, Zap, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const LEVELS = [
  { name: "Explorer", minXP: 0, emoji: "🌱", color: "text-green-500" },
  { name: "Adventurer", minXP: 100, emoji: "🧭", color: "text-blue-500" },
  { name: "Scholar", minXP: 300, emoji: "📚", color: "text-violet-500" },
  { name: "Wizard", minXP: 600, emoji: "🧙‍♂️", color: "text-purple-500" },
  { name: "Master", minXP: 1000, emoji: "🏆", color: "text-amber-500" },
  { name: "Genius", minXP: 1500, emoji: "🧠", color: "text-pink-500" },
  { name: "Legend", minXP: 2500, emoji: "⭐", color: "text-yellow-500" },
];

const BADGES = [
  { id: "first-story", name: "First Story", emoji: "📖", desc: "Created your first story", unlockXP: 10 },
  { id: "science-fan", name: "Science Fan", emoji: "🔬", desc: "Completed 3 experiments", unlockXP: 50 },
  { id: "artist", name: "Young Artist", emoji: "🎨", desc: "Drew 5 pictures", unlockXP: 75 },
  { id: "bookworm", name: "Bookworm", emoji: "📚", desc: "Read 10 texts", unlockXP: 100 },
  { id: "streak-3", name: "On Fire!", emoji: "🔥", desc: "3-day streak", unlockXP: 150 },
  { id: "explorer", name: "World Explorer", emoji: "🗺️", desc: "Visited all modules", unlockXP: 200 },
  { id: "quiz-champ", name: "Quiz Champion", emoji: "🏅", desc: "Won 5 quizzes", unlockXP: 300 },
  { id: "genius", name: "Little Genius", emoji: "🧠", desc: "Reached Genius level", unlockXP: 1500 },
];

function getLevel(xp: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
    else break;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1];
  const progress = next
    ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
    : 100;
  return { ...current, level: idx + 1, progress: Math.min(progress, 100), next };
}

export const KidsAcademyProgress = () => {
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("kids-academy-xp");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("kids-academy-xp", String(xp));
  }, [xp]);

  const level = getLevel(xp);
  const unlockedBadges = BADGES.filter(b => xp >= b.unlockXP);
  const lockedBadges = BADGES.filter(b => xp < b.unlockXP);

  return (
    <>
      <FloatingHowItWorks title={"Kids Academy Progress - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Academy Progress section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Academy Progress.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* XP & Level Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level display */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl border border-primary/20"
            >
              {level.emoji}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-foreground">Level {level.level}</span>
                <Badge variant="outline" className={level.color}>
                  {level.name}
                </Badge>
              </div>
              <Progress value={level.progress} className="h-3 mb-1" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{xp} XP</span>
                <span>
                  {level.next
                    ? `${level.next.minXP - xp} XP to ${level.next.name}`
                    : "MAX LEVEL!"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Star, label: "Total XP", value: xp, color: "text-amber-500" },
              { icon: Medal, label: "Badges", value: unlockedBadges.length, color: "text-violet-500" },
              { icon: Crown, label: "Level", value: level.level, color: "text-primary" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-2 rounded-xl bg-muted/50">
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            Badges ({unlockedBadges.length}/{BADGES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((badge, i) => {
              const unlocked = xp >= badge.unlockXP;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`text-center p-2 rounded-xl border ${
                    unlocked
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-muted/30 border-border/50 opacity-50"
                  }`}
                  title={`${badge.name}: ${badge.desc}`}
                >
                  <span className={`text-2xl ${unlocked ? "" : "grayscale filter"}`}>
                    {badge.emoji}
                  </span>
                  <div className="text-[9px] font-medium text-muted-foreground mt-1 truncate">
                    {badge.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
