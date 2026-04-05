import { Card } from "@/components/ui/card";
import { Flame, BarChart3, Trophy, TrendingUp, BookOpen, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function TutorialEngagement() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-3 md:p-5 bg-gradient-to-br from-orange-500/15 to-amber-600/5 border-orange-500/25 h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-xs md:text-sm font-bold">Teaching Streak</span>
          </div>
          <p className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">12 Days</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">🔥 Keep uploading lessons!</p>
          <div className="flex gap-0.5 mt-2">
            {[1,2,3,4,5,6,7].map(d => (
              <div key={d} className={`h-1.5 flex-1 rounded-full ${d <= 5 ? 'bg-orange-500' : 'bg-orange-500/20'}`} />
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-3 md:p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border-emerald-500/25 h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs md:text-sm font-bold">Weekly Stats</span>
          </div>
          <p className="text-xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">+48</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">New students this week</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] md:text-xs text-emerald-500 font-bold">↑ 23% vs last week</span>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-3 md:p-5 bg-gradient-to-br from-amber-500/15 to-yellow-600/5 border-amber-500/25 h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs md:text-sm font-bold">Achievements</span>
          </div>
          <p className="text-xl md:text-3xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">7 / 25</p>
          <Progress value={28} className="h-1.5 mt-2 mb-1" />
          <p className="text-[10px] md:text-xs text-muted-foreground">3 more to unlock 🏅 Gold</p>
        </Card>
      </motion.div>
    </div>
  );
}