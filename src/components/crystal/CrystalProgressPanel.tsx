import { motion } from "framer-motion";
import { Flame, TrendingUp, Trophy, Gem, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCrystalStats } from "@/hooks/useCrystalStats";

export const CrystalProgressPanel = () => {
  const {
    currentStreak,
    longestStreak,
    totalReadings,
    totalPoints,
    avgEnergy,
    readingsThisWeek,
    achievements,
    loading,
    signedIn,
  } = useCrystalStats();

  if (!signedIn && !loading) return null;

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const weeklyGoal = 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
    >
      {/* Healing Streak */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" /> Healing Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-foreground">
            {loading ? "—" : currentStreak}
            <span className="text-sm font-semibold text-muted-foreground ml-1">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Longest streak: {loading ? "—" : longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i < Math.min(currentStreak, 7) ? "bg-orange-500" : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Run any crystal AI tool today to keep your streak alive.
          </p>
        </CardContent>
      </Card>

      {/* Energy Progress */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Energy Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Average energy level</span>
              <span className="font-bold">{loading ? "—" : `${Math.round(avgEnergy)}/100`}</span>
            </div>
            <Progress value={Math.min(avgEnergy, 100)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Weekly goal ({weeklyGoal} sessions)</span>
              <span className="font-bold">{loading ? "—" : `${readingsThisWeek}/${weeklyGoal}`}</span>
            </div>
            <Progress value={Math.min((readingsThisWeek / weeklyGoal) * 100, 100)} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Gem className="h-3.5 w-3.5 text-accent" /> Total readings
            </span>
            <span className="font-bold">{loading ? "—" : totalReadings}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Energy points</span>
            <span className="font-bold">{loading ? "—" : totalPoints}</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Achievements
            </span>
            <Badge variant="secondary" className="text-[11px]">
              {loading ? "—" : `${unlocked}/${achievements.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                a.unlocked ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40"
              }`}
            >
              {a.unlocked ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{a.title}</p>
                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                {!a.unlocked && (
                  <Progress value={Math.min((a.progress / a.target) * 100, 100)} className="h-1 mt-1.5" />
                )}
              </div>
            </div>
          ))}
          {!loading && achievements.length === 0 && (
            <p className="text-xs text-muted-foreground">Run your first tool to start unlocking achievements.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
