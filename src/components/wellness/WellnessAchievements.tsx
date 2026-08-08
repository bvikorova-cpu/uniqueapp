import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useWellnessStats } from "@/hooks/useWellnessStats";

export const WellnessAchievements = () => {
  const { achievements, isLoading } = useWellnessStats();
  const unlockedCount = achievements.filter((b) => b.unlocked).length;

  return (
    <>
      <FloatingHowItWorks title="Achievements — How it works" steps={[{title:"Use the tools",desc:"Each badge tracks a real milestone from your own wellness activity."},{title:"Watch the bar",desc:"Locked badges show live progress toward their goal."},{title:"Unlock automatically",desc:"When you hit the goal the badge unlocks instantly — no claiming needed."},{title:"Collect all six",desc:"Trying different tools unlocks the Full Spectrum badge."}]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Achievements
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {isLoading ? "–" : `${unlockedCount}/${achievements.length}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((badge, i) => (
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
                {!badge.unlocked && (
                  <div className="w-full h-1 rounded-full bg-muted/60 mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all"
                      style={{ width: `${Math.round(badge.progress * 100)}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>);
};
