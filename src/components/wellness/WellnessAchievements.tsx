import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const badges = [
  { name: "First Breath", icon: "🌬️", description: "Complete your first breathing exercise", unlocked: false },
  { name: "3-Day Streak", icon: "🔥", description: "Maintain a 3-day wellness streak", unlocked: false },
  { name: "Zen Master", icon: "🧘", description: "Complete 10 meditation sessions", unlocked: false },
  { name: "Gratitude Pro", icon: "📝", description: "Write 7 journal entries", unlocked: false },
  { name: "Sound Healer", icon: "🎵", description: "Listen to 5 hours of nature sounds", unlocked: false },
  { name: "Full Spectrum", icon: "🌈", description: "Try all wellness tools", unlocked: false },
];

export const WellnessAchievements = () => {
  return (
    <>
      <FloatingHowItWorks title="WellnessAchievements — How it works" steps={[{title:"Open this tool",desc:"Access WellnessAchievements within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
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
                className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all hover:scale-105
                  ${badge.unlocked
                    ? "bg-gradient-to-br from-yellow-500/15 to-amber-500/10 border-yellow-500/30"
                    : "bg-muted/20 border-border/30 opacity-60"
                  }
                `}
              >
                <div className="text-2xl mb-1">
                  {badge.unlocked ? badge.icon : (
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
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
    </>);
};
