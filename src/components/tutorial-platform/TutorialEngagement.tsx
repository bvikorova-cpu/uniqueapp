import { Card } from "@/components/ui/card";
import { Flame, BarChart3, Trophy, TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function TutorialEngagement() {
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="space-y-3 mb-8">
      {/* Daily Streak Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 border-orange-200/50 dark:border-orange-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-sm">Daily Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-orange-500">0</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {weekDays.map((day, i) => (
              <div key={day} className="flex-1 text-center">
                <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-1 ${
                  i === todayIndex 
                    ? 'bg-orange-500 text-white ring-2 ring-orange-300 dark:ring-orange-500/50' 
                    : i < todayIndex 
                      ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                      : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">Weekly</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">+48</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] md:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">↑ 23%</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-3 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">XP Level</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Lv. 3</p>
            <Progress value={45} className="h-1 mt-1.5" />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">Badges</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">7/25</p>
            <p className="text-[9px] md:text-xs text-muted-foreground mt-1">3 to 🏅 Gold</p>
          </Card>
        </motion.div>
      </div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="p-3 bg-gradient-to-r from-rose-500/10 to-violet-500/10 border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Daily Challenge</p>
                <p className="text-[10px] text-muted-foreground">Complete 1 quiz to earn 50 XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-rose-500">+50 XP</p>
              <Progress value={0} className="h-1 w-16 mt-1" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
