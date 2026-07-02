import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Flame, Clock, Smile, Meh, Frown } from "lucide-react";
import { useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ChildProfile {
  name: string;
  avatar: string;
  age: number;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  todayMinutes: number;
  limitMinutes: number;
  mood: "happy" | "neutral" | "tired";
  lastActivity: string;
  totalStars: number;
}

const defaultProfiles: ChildProfile[] = [
  { name: "Tommy", avatar: "🧒", age: 7, level: 5, xp: 340, xpToNext: 500, streak: 7, todayMinutes: 35, limitMinutes: 60, mood: "happy", lastActivity: "Completed math challenge", totalStars: 142 },
  { name: "Emma", avatar: "👧", age: 5, level: 3, xp: 180, xpToNext: 300, streak: 4, todayMinutes: 20, limitMinutes: 45, mood: "happy", lastActivity: "Drew a rainbow", totalStars: 78 },
];

const moodIcons = {
  happy: <Smile className="w-4 h-4 text-green-500" />,
  neutral: <Meh className="w-4 h-4 text-yellow-500" />,
  tired: <Frown className="w-4 h-4 text-orange-500" />,
};
const moodLabels = { happy: "Happy", neutral: "Neutral", tired: "Tired" };

export const ChildProfileCards = () => {
  const [profiles] = useState<ChildProfile[]>(defaultProfiles);
  return (
    <>
      <FloatingHowItWorks title={"Child Profile Cards - How it works"} steps={[{ title: 'Open', desc: 'Access the Child Profile Cards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Child Profile Cards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-2 gap-6">
      {profiles.map((child, i) => (
        <motion.div key={child.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
          <Card className="overflow-hidden border-2 hover:shadow-lg transition-all">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 flex items-center gap-4">
              <div className="text-4xl bg-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-sm">{child.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{child.name}</h3>
                  <Badge variant="secondary" className="text-xs">{child.age} years</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs flex items-center gap-1"><Trophy className="w-3 h-3 text-purple-500" />Level {child.level}</span>
                  <span className="text-xs flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{child.streak} day streak</span>
                  <span className="text-xs flex items-center gap-1">{moodIcons[child.mood]}{moodLabels[child.mood]}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-500"><Star className="w-5 h-5 fill-yellow-500" /><span className="font-bold text-lg">{child.totalStars}</span></div>
                <span className="text-[10px] text-muted-foreground">stars</span>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">XP to Level {child.level + 1}</span><span className="font-medium">{child.xp}/{child.xpToNext}</span></div>
                <Progress value={(child.xp / child.xpToNext) * 100} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> Online today</span>
                  <span className={`font-medium ${child.todayMinutes / child.limitMinutes > 0.8 ? "text-orange-500" : "text-green-500"}`}>{child.todayMinutes}/{child.limitMinutes} min</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${child.todayMinutes / child.limitMinutes > 0.8 ? "bg-orange-500" : "bg-green-500"}`} initial={{ width: 0 }} animate={{ width: `${Math.min((child.todayMinutes / child.limitMinutes) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.2 }} />
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-xs"><span className="text-muted-foreground">Last activity: </span><span className="font-medium">{child.lastActivity}</span></div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    </>
  );
};
