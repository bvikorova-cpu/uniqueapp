import { motion } from "framer-motion";
import { Flame, Trophy, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRewardsStats } from "@/hooks/useRewardsStats";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

const milestones = [
  { days: 3, reward: "🔥", title: "Warm Up", xp: 50 },
  { days: 7, reward: "⭐", title: "Weekly Warrior", xp: 150 },
  { days: 14, reward: "💎", title: "Consistent Creator", xp: 300 },
  { days: 30, reward: "👑", title: "Content King", xp: 750 },
  { days: 60, reward: "🏆", title: "Legendary Poster", xp: 1500 },
  { days: 100, reward: "🌟", title: "Hall of Fame", xp: 3000 },
  { days: 365, reward: "💫", title: "Annual Champion", xp: 10000 },
];

export default function WallPostingStreaks() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useRewardsStats(user?.id);
  const currentStreak = stats?.streak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const todayIdx = (today.getDay() + 6) % 7;

  const scrollToComposer = () => {
    window.dispatchEvent(new CustomEvent("open-create-post"));
    document.getElementById("wall-create-post")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-400/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-black">{isLoading ? "—" : currentStreak}</p>
              <p className="text-xs text-muted-foreground font-semibold">Day Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-muted-foreground">Best: {longestStreak} days</p>
            <p className="text-xs text-muted-foreground">XP Multiplier: {currentStreak >= 7 ? "2x" : "1x"}</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, i) => {
            const dayDate = addDays(monday, i);
            const isToday = isSameDay(dayDate, today);
            const isPast = i < todayIdx;
            const isCompleted = (isPast || isToday) && i > todayIdx - currentStreak;
            return (
              <div key={i} className="flex flex-col items-center gap-1" title={format(dayDate, "PP")}>
                <span className="text-[10px] text-muted-foreground font-bold">{day}</span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md" :
                  isToday ? "border-2 border-orange-400 border-dashed" :
                  "bg-muted/30"
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : ""}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90"
          onClick={scrollToComposer}
        >
          <Zap className="h-4 w-4 mr-2" /> Post Today to Continue Streak
        </Button>
      </Card>


      <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-orange-500" /> Streak Milestones</h3>
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const reached = currentStreak >= m.days;
            return (
              <motion.div
                key={m.days}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl ${reached ? "bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-400/20" : "bg-muted/20"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{m.reward}</span>
                  <div>
                    <p className={`text-sm font-bold ${reached ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>{m.title}</p>
                    <p className="text-[10px] text-muted-foreground">{m.days} day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${reached ? "text-orange-500" : "text-muted-foreground"}`}>+{m.xp} XP</span>
                  {reached && <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-0.5" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
