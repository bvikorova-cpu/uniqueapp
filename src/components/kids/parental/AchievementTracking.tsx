import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, Sparkles } from "lucide-react";

interface ChildAchievement {
  childName: string;
  childAvatar: string;
  achievements: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    earned: boolean;
    earnedDate?: string;
    progress: number;
  }[];
  totalPoints: number;
  level: number;
}

const childrenAchievements: ChildAchievement[] = [
  {
    childName: "Tomáško",
    childAvatar: "🧒",
    totalPoints: 340,
    level: 5,
    achievements: [
      { id: "1", name: "Prvý krok", emoji: "👣", description: "Dokončená prvá lekcia", earned: true, earnedDate: "15.3.2026", progress: 100 },
      { id: "2", name: "Vedec", emoji: "🔬", description: "5 experimentov", earned: true, earnedDate: "18.3.2026", progress: 100 },
      { id: "3", name: "Knihomol", emoji: "📚", description: "Prečítaných 10 príbehov", earned: true, earnedDate: "20.3.2026", progress: 100 },
      { id: "4", name: "Streak Master", emoji: "🔥", description: "7-dňový streak", earned: true, earnedDate: "22.3.2026", progress: 100 },
      { id: "5", name: "Umelec", emoji: "🎨", description: "10 kresieb", earned: false, progress: 70 },
      { id: "6", name: "Matematik", emoji: "🧮", description: "50 úloh z matematiky", earned: false, progress: 45 },
    ],
  },
  {
    childName: "Emka",
    childAvatar: "👧",
    totalPoints: 180,
    level: 3,
    achievements: [
      { id: "1", name: "Prvý krok", emoji: "👣", description: "Dokončená prvá lekcia", earned: true, earnedDate: "16.3.2026", progress: 100 },
      { id: "2", name: "Vedec", emoji: "🔬", description: "5 experimentov", earned: false, progress: 60 },
      { id: "3", name: "Knihomol", emoji: "📚", description: "Prečítaných 10 príbehov", earned: true, earnedDate: "21.3.2026", progress: 100 },
      { id: "4", name: "Streak Master", emoji: "🔥", description: "7-dňový streak", earned: false, progress: 57 },
      { id: "5", name: "Umelec", emoji: "🎨", description: "10 kresieb", earned: true, earnedDate: "24.3.2026", progress: 100 },
      { id: "6", name: "Matematik", emoji: "🧮", description: "50 úloh z matematiky", earned: false, progress: 20 },
    ],
  },
];

export const AchievementTracking = () => {
  return (
    <div className="space-y-6">
      {childrenAchievements.map((child, ci) => (
        <motion.div
          key={child.childName}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{child.childAvatar}</span>
                  <div>
                    <p className="text-lg">{child.childName}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      Level {child.level} • {child.totalPoints} XP
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 gap-1">
                  <Award className="w-3 h-3" />
                  {child.achievements.filter(a => a.earned).length}/{child.achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {child.achievements.map((ach, ai) => (
                  <motion.div
                    key={ach.id}
                    className={`relative rounded-xl p-3 border-2 transition-all ${
                      ach.earned
                        ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300"
                        : "bg-muted/30 border-muted"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ci * 0.15 + ai * 0.05 }}
                  >
                    {ach.earned && (
                      <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-yellow-500" />
                    )}
                    {!ach.earned && (
                      <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/50" />
                    )}
                    <div className="text-center">
                      <span className={`text-2xl ${!ach.earned ? "opacity-40 grayscale" : ""}`}>
                        {ach.emoji}
                      </span>
                      <p className="text-xs font-semibold mt-1">{ach.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                      {!ach.earned && (
                        <Progress value={ach.progress} className="h-1 mt-2" />
                      )}
                      {ach.earned && ach.earnedDate && (
                        <p className="text-[9px] text-yellow-600 mt-1">{ach.earnedDate}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
