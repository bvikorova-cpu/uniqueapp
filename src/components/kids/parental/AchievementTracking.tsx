import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ChildAchievement {
  childName: string; childAvatar: string; totalPoints: number; level: number;
  achievements: { id: string; name: string; emoji: string; description: string; earned: boolean; earnedDate?: string; progress: number; }[];
}

const childrenAchievements: ChildAchievement[] = [
  {
    childName: "Tommy", childAvatar: "🧒", totalPoints: 340, level: 5,
    achievements: [
      { id: "1", name: "First Step", emoji: "👣", description: "Complete first lesson", earned: true, earnedDate: "Mar 15", progress: 100 },
      { id: "2", name: "Scientist", emoji: "🔬", description: "5 experiments", earned: true, earnedDate: "Mar 18", progress: 100 },
      { id: "3", name: "Bookworm", emoji: "📚", description: "Read 10 stories", earned: true, earnedDate: "Mar 20", progress: 100 },
      { id: "4", name: "Streak Master", emoji: "🔥", description: "7-day streak", earned: true, earnedDate: "Mar 22", progress: 100 },
      { id: "5", name: "Artist", emoji: "🎨", description: "10 drawings", earned: false, progress: 70 },
      { id: "6", name: "Mathematician", emoji: "🧮", description: "50 math tasks", earned: false, progress: 45 },
    ],
  },
  {
    childName: "Emma", childAvatar: "👧", totalPoints: 180, level: 3,
    achievements: [
      { id: "1", name: "First Step", emoji: "👣", description: "Complete first lesson", earned: true, earnedDate: "Mar 16", progress: 100 },
      { id: "2", name: "Scientist", emoji: "🔬", description: "5 experiments", earned: false, progress: 60 },
      { id: "3", name: "Bookworm", emoji: "📚", description: "Read 10 stories", earned: true, earnedDate: "Mar 21", progress: 100 },
      { id: "4", name: "Streak Master", emoji: "🔥", description: "7-day streak", earned: false, progress: 57 },
      { id: "5", name: "Artist", emoji: "🎨", description: "10 drawings", earned: true, earnedDate: "Mar 24", progress: 100 },
      { id: "6", name: "Mathematician", emoji: "🧮", description: "50 math tasks", earned: false, progress: 20 },
    ],
  },
];

export const AchievementTracking = () => {
  return (
    <>
      <FloatingHowItWorks title={"Achievement Tracking - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievement Tracking section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievement Tracking.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {childrenAchievements.map((child, ci) => (
        <motion.div key={child.childName} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.15 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{child.childAvatar}</span>
                  <div><p className="text-lg">{child.childName}</p><p className="text-xs text-muted-foreground font-normal">Level {child.level} • {child.totalPoints} XP</p></div>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 gap-1"><Award className="w-3 h-3" />{child.achievements.filter(a => a.earned).length}/{child.achievements.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {child.achievements.map((ach, ai) => (
                  <motion.div key={ach.id} className={`relative rounded-xl p-3 border-2 transition-all ${ach.earned ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300" : "bg-muted/30 border-muted"}`} whileHover={{ scale: 1.03 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: ci * 0.15 + ai * 0.05 }}>
                    {ach.earned && <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-yellow-500" />}
                    {!ach.earned && <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/50" />}
                    <div className="text-center">
                      <span className={`text-2xl ${!ach.earned ? "opacity-40 grayscale" : ""}`}>{ach.emoji}</span>
                      <p className="text-xs font-semibold mt-1">{ach.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                      {!ach.earned && <Progress value={ach.progress} className="h-1 mt-2" />}
                      {ach.earned && ach.earnedDate && <p className="text-[9px] text-yellow-600 mt-1">{ach.earnedDate}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    </>
  );
};
