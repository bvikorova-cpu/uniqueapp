import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, Trophy, DollarSign, Users, FileText, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const achievements = [
  { emoji: "🚀", name: "First Post", color: "from-blue-500/20 to-cyan-500/10" },
  { emoji: "👥", name: "10 Subs", color: "from-emerald-500/20 to-green-500/10" },
  { emoji: "💰", name: "First €100", color: "from-yellow-500/20 to-amber-500/10" },
  { emoji: "🔥", name: "7-Day Streak", color: "from-orange-500/20 to-red-500/10" },
  { emoji: "⭐", name: "Verified", color: "from-purple-500/20 to-violet-500/10" },
  { emoji: "🏆", name: "Top Creator", color: "from-pink-500/20 to-rose-500/10" },
];

export const MembershipEngagementRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <FloatingHowItWorks
        title={"Membership Engagement Row"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Creator Streak */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              Creator Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">0</span>
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

      {/* Revenue & Subscribers Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              Creator Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Monthly Revenue", value: 0, max: 1000, icon: DollarSign, suffix: "€", color: "bg-green-500" },
              { label: "Subscribers", value: 0, max: 100, icon: Users, suffix: "", color: "bg-blue-500" },
              { label: "Posts Published", value: 0, max: 50, icon: FileText, suffix: "", color: "bg-purple-500" },
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
