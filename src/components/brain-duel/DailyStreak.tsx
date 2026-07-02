import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DailyStreakProps {
  currentStreak?: number;
  longestStreak?: number;
  todayPlayed?: boolean;
}

const STREAK_MILESTONES = [
  { days: 3, reward: "+50 XP", icon: "🔥", multiplier: "1.5x" },
  { days: 7, reward: "+150 XP + Power-up", icon: "⚡", multiplier: "2x" },
  { days: 14, reward: "+400 XP + Rare Badge", icon: "🏅", multiplier: "2.5x" },
  { days: 30, reward: "+1000 XP + Legendary Badge", icon: "👑", multiplier: "3x" },
];

export const DailyStreak = ({ currentStreak = 0, longestStreak = 0, todayPlayed = false }: DailyStreakProps) => {
  const nextMilestone = STREAK_MILESTONES.find(m => currentStreak < m.days);
  const currentMultiplier = STREAK_MILESTONES.slice().reverse().find(m => currentStreak >= m.days);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayNum = currentStreak - (6 - i);
    return { active: dayNum > 0, today: i === 6 && todayPlayed };
  });

  return (
    <>
      <FloatingHowItWorks title={"Daily Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
            </motion.div>
            Daily Streak
          </div>
          {currentMultiplier && (
            <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 gap-1">
              <Zap className="h-3 w-3" /> {currentMultiplier.multiplier} Multiplier
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Streak counter */}
        <div className="text-center">
          <motion.div
            className="text-5xl font-black text-orange-500"
            key={currentStreak}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {currentStreak}
          </motion.div>
          <div className="text-sm text-muted-foreground">day streak</div>
        </div>

        {/* Week display */}
        <div className="flex justify-center gap-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1">{day}</div>
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur-sm ${
                  days[i].active
                    ? days[i].today
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                      : "bg-orange-500/20 text-orange-500"
                    : "bg-muted/50 text-muted-foreground"
                }`}
                initial={days[i].today ? { scale: 0 } : {}}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
              >
                {days[i].active ? "✓" : "·"}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-3 border border-primary/5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Next reward at {nextMilestone.days} days</span>
              <span className="text-xs">{nextMilestone.icon} {nextMilestone.reward}</span>
            </div>
            <Progress value={(currentStreak / nextMilestone.days) * 100} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {nextMilestone.days - currentStreak} more days • Unlocks {nextMilestone.multiplier} multiplier
            </p>
          </div>
        )}

        {/* Milestones */}
        <div className="grid grid-cols-4 gap-2">
          {STREAK_MILESTONES.map((m, i) => {
            const achieved = currentStreak >= m.days;
            return (
              <motion.div
                key={m.days}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`text-center p-2 rounded-lg transition-all backdrop-blur-sm ${
                  achieved ? "bg-orange-500/10 border border-orange-500/30" : "bg-muted/20 border border-transparent"
                }`}
              >
                <div className="text-lg mb-0.5">{achieved ? m.icon : "🔒"}</div>
                <div className={`text-[10px] font-semibold ${achieved ? "text-orange-500" : "text-muted-foreground"}`}>
                  {m.days} Days
                </div>
                <div className="text-[10px] text-muted-foreground">{m.multiplier}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Best streak */}
        <div className="text-center text-xs text-muted-foreground">
          <Trophy className="h-3 w-3 inline mr-1 text-yellow-500" />
          Best streak: {longestStreak} days
        </div>
      </CardContent>
    </Card>
    </>
  );
};