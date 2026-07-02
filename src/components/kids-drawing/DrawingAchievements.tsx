import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Flame, Star, Palette, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first", title: "First Stroke", description: "Complete your first drawing", icon: <Star className="w-5 h-5" />, target: 1, color: "from-yellow-500 to-amber-500" },
  { id: "explorer", title: "Art Explorer", description: "Try 3 different categories", icon: <Palette className="w-5 h-5" />, target: 3, color: "from-blue-500 to-cyan-500" },
  { id: "five", title: "Creative Five", description: "Complete 5 tutorials", icon: <Target className="w-5 h-5" />, target: 5, color: "from-green-500 to-emerald-500" },
  { id: "streak", title: "Hot Streak", description: "Draw 3 days in a row", icon: <Flame className="w-5 h-5" />, target: 3, color: "from-orange-500 to-red-500" },
  { id: "master", title: "Drawing Master", description: "Complete 10 tutorials", icon: <Trophy className="w-5 h-5" />, target: 10, color: "from-purple-500 to-pink-500" },
  { id: "legend", title: "Art Legend", description: "Complete 25 tutorials", icon: <Sparkles className="w-5 h-5" />, target: 25, color: "from-primary to-accent" },
];

interface Props {
  completedCount: number;
}

export const DrawingAchievements = ({ completedCount }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Drawing Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a, i) => {
            const progress = Math.min(completedCount, a.target);
            const unlocked = progress >= a.target;

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  unlocked
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${
                      unlocked ? a.color : "from-muted-foreground/30 to-muted-foreground/20"
                    }`}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {a.title}
                      {unlocked && <span>✅</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                    <div className="mt-2">
                      <Progress value={(progress / a.target) * 100} className="h-1.5" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {progress}/{a.target}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
