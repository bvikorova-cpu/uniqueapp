import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, Trophy, Gem, Heart, Sparkles, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const achievements = [
  { emoji: "🔮", name: "First Reading", color: "from-violet-500/20 to-purple-500/10" },
  { emoji: "💎", name: "Crystal Guru", color: "from-cyan-500/20 to-blue-500/10" },
  { emoji: "✨", name: "Energy Master", color: "from-yellow-500/20 to-amber-500/10" },
  { emoji: "🧘", name: "7-Day Zen", color: "from-emerald-500/20 to-green-500/10" },
  { emoji: "🌙", name: "Chakra Aligned", color: "from-indigo-500/20 to-violet-500/10" },
  { emoji: "👑", name: "Healer", color: "from-pink-500/20 to-rose-500/10" },
];

export const CrystalEngagementRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Healing Streak */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              Healing Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-black bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">0</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <div key={day} className="text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{day}</div>
                  <div className="w-7 h-7 rounded-full border border-border/50 bg-muted/20 flex items-center justify-center mx-auto hover:border-primary/30 transition-colors">
                    <span className="text-[10px] text-muted-foreground">—</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              Energy Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Energy Level", value: 0, max: 100, icon: Sparkles, suffix: "%", color: "bg-violet-500" },
              { label: "Crystals Collected", value: 0, max: 50, icon: Gem, suffix: "", color: "bg-cyan-500" },
              { label: "Chakras Balanced", value: 0, max: 7, icon: Heart, suffix: "/7", color: "bg-pink-500" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <stat.icon className="w-3 h-3" />
                    {stat.label}
                  </span>
                  <span className="font-semibold text-foreground">{stat.value} / {stat.max}</span>
                </div>
                <Progress value={(stat.value / stat.max) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((badge) => (
                <div key={badge.name} className={`text-center p-2 rounded-xl bg-gradient-to-br ${badge.color} border border-border/30 opacity-40 hover:opacity-60 transition-opacity`}>
                  <div className="text-lg mb-0.5">{badge.emoji}</div>
                  <div className="text-[9px] text-muted-foreground font-medium">{badge.name}</div>
                  <Lock className="w-2.5 h-2.5 text-muted-foreground mx-auto mt-0.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
