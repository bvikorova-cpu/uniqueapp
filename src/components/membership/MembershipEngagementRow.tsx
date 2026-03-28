import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, Trophy, DollarSign, Users, FileText, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MembershipEngagementRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Creator Streak */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Creator Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-black text-foreground">0</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{day}</div>
                  <div className="w-7 h-7 rounded-full border border-border/50 bg-muted/30 flex items-center justify-center mx-auto">
                    <span className="text-[10px] text-muted-foreground">—</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue & Subscribers Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Creator Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Monthly Revenue", value: 0, max: 1000, icon: DollarSign, suffix: "€" },
              { label: "Subscribers", value: 0, max: 100, icon: Users, suffix: "" },
              { label: "Posts Published", value: 0, max: 50, icon: FileText, suffix: "" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <stat.icon className="w-3 h-3" />
                    {stat.label}
                  </span>
                  <span className="font-semibold text-foreground">{stat.value}{stat.suffix} / {stat.max}{stat.suffix}</span>
                </div>
                <Progress value={(stat.value / stat.max) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: "🚀", name: "First Post" },
                { emoji: "👥", name: "10 Subs" },
                { emoji: "💰", name: "First €100" },
                { emoji: "🔥", name: "7-Day Streak" },
                { emoji: "⭐", name: "Verified" },
                { emoji: "🏆", name: "Top Creator" },
              ].map((badge) => (
                <div key={badge.name} className="text-center p-2 rounded-lg bg-muted/30 border border-border/30 opacity-40">
                  <div className="text-lg mb-0.5">{badge.emoji}</div>
                  <div className="text-[9px] text-muted-foreground">{badge.name}</div>
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
