import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Map, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const learningPaths = [
  { name: "Beginner", xpNeeded: 0, icon: "🌱", color: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-500/30" },
  { name: "Student", xpNeeded: 100, icon: "📖", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/30" },
  { name: "Advanced", xpNeeded: 500, icon: "🎯", color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30" },
  { name: "Expert", xpNeeded: 1500, icon: "🏆", color: "from-yellow-500/20 to-amber-500/20", borderColor: "border-yellow-500/30" },
  { name: "Master", xpNeeded: 5000, icon: "👑", color: "from-red-500/20 to-orange-500/20", borderColor: "border-red-500/30" },
];

interface LearningPathProgressProps {
  currentXP: number;
}

export const LearningPathProgress = ({ currentXP }: LearningPathProgressProps) => {
  const getCurrentLevel = () => {
    for (let i = learningPaths.length - 1; i >= 0; i--) {
      if (currentXP >= learningPaths[i].xpNeeded) return i;
    }
    return 0;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = Math.min(currentLevel + 1, learningPaths.length - 1);
  const progressToNext = currentLevel === learningPaths.length - 1
    ? 100
    : learningPaths[nextLevel].xpNeeded === learningPaths[currentLevel].xpNeeded
      ? 0
      : ((currentXP - learningPaths[currentLevel].xpNeeded) / (learningPaths[nextLevel].xpNeeded - learningPaths[currentLevel].xpNeeded)) * 100;

  return (
    <>
      <FloatingHowItWorks title="How Learning Path Progress works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="w-4 h-4 text-primary" />
            Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-4">
            {learningPaths.map((path, i) => {
              const isUnlocked = i <= currentLevel;
              const isCurrent = i === currentLevel;
              return (
                <div key={path.name} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-1 transition-all
                      ${isCurrent ? `bg-gradient-to-br ${path.color} ${path.borderColor} border-2 ring-2 ring-primary/20` : ""}
                      ${isUnlocked && !isCurrent ? `bg-gradient-to-br ${path.color} ${path.borderColor} border` : ""}
                      ${!isUnlocked ? "bg-muted/50 border border-border/50 opacity-50" : ""}
                    `}
                  >
                    {isUnlocked ? path.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
                  </motion.div>
                  <span className={`text-[9px] font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                    {path.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {learningPaths[currentLevel].icon} {learningPaths[currentLevel].name}
              </span>
              {currentLevel < learningPaths.length - 1 && (
                <span className="text-muted-foreground">
                  {currentXP}/{learningPaths[nextLevel].xpNeeded} XP
                </span>
              )}
            </div>
            <Progress value={Math.min(progressToNext, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
