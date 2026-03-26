import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { name: "First Session", icon: "🎉", description: "Complete your first mentor session", unlocked: false },
  { name: "3-Day Streak", icon: "🔥", description: "Maintain a 3-day session streak", unlocked: false },
  { name: "Goal Setter", icon: "🎯", description: "Set your first personal goal", unlocked: false },
  { name: "Week Warrior", icon: "⚔️", description: "Complete 7 days of mentoring", unlocked: false },
  { name: "Deep Diver", icon: "🤿", description: "Have a 30+ message session", unlocked: false },
  { name: "Multi-Coach", icon: "🌟", description: "Try all 4 mentor areas", unlocked: false },
];

export const AchievementBadges = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-4 h-4 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all
                  ${badge.unlocked
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-muted/30 border-border/50 opacity-60"
                  }
                `}
              >
                <div className="text-2xl mb-1">
                  {badge.unlocked ? badge.icon : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-semibold line-clamp-1">{badge.name}</p>
                <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
