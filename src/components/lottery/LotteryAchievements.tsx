import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const badges = [
  { name: "First Pick", icon: "🎰", description: "Generate your first numbers", unlocked: false, color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/30" },
  { name: "3-Day Streak", icon: "🔥", description: "Generate 3 days in a row", unlocked: false, color: "from-orange-500/20 to-red-500/20", borderColor: "border-orange-500/30" },
  { name: "Collector", icon: "💾", description: "Save 5 combinations", unlocked: false, color: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-500/30" },
  { name: "Multi-Game", icon: "🎯", description: "Try all 4 lottery types", unlocked: false, color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30" },
  { name: "Analyst", icon: "📊", description: "Check statistics 10 times", unlocked: false, color: "from-yellow-500/20 to-amber-500/20", borderColor: "border-yellow-500/30" },
  { name: "Lucky Seven", icon: "🍀", description: "Generate 7 days in a row", unlocked: false, color: "from-red-500/20 to-pink-500/20", borderColor: "border-red-500/30" },
];

export const LotteryAchievements = () => {
  return (
    <>
      <FloatingHowItWorks
        title='Lottery Achievements'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Achievements panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-300/30 h-full">
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
                className={`relative flex flex-col items-center p-2.5 rounded-xl border text-center transition-all hover:scale-105
                  ${badge.unlocked
                    ? `bg-gradient-to-br ${badge.color} ${badge.borderColor}`
                    : "bg-muted/30 border-border/30 opacity-60"
                  }
                `}
              >
                <div className="text-xl mb-1">
                  {badge.unlocked ? badge.icon : (
                    <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-semibold line-clamp-1">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
