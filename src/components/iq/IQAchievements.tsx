import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, Zap, Target, Flame, Crown, Star, Medal, Swords, BookOpen, Lightbulb, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const achievements = [
  { id: "first_test", name: "First Steps", desc: "Complete your first IQ test", icon: Brain, points: 10, color: "text-blue-400" },
  { id: "iq_100", name: "Century Mind", desc: "Reach IQ score of 100", icon: Target, points: 25, color: "text-emerald-400" },
  { id: "iq_120", name: "Superior Intellect", desc: "Reach IQ score of 120", icon: Star, points: 50, color: "text-yellow-400" },
  { id: "iq_140", name: "Genius Level", desc: "Reach IQ score of 140", icon: Crown, points: 100, color: "text-purple-400" },
  { id: "streak_7", name: "Weekly Warrior", desc: "Maintain a 7-day streak", icon: Flame, points: 20, color: "text-orange-400" },
  { id: "streak_30", name: "Monthly Master", desc: "Maintain a 30-day streak", icon: Flame, points: 75, color: "text-red-400" },
  { id: "duel_win", name: "Duel Victor", desc: "Win your first IQ duel", icon: Swords, points: 15, color: "text-pink-400" },
  { id: "duel_10", name: "Duel Champion", desc: "Win 10 IQ duels", icon: Trophy, points: 50, color: "text-amber-400" },
  { id: "tools_5", name: "Tool Explorer", desc: "Use 5 different AI tools", icon: Lightbulb, points: 20, color: "text-cyan-400" },
  { id: "tools_all", name: "AI Master", desc: "Use all AI tools at least once", icon: Zap, points: 40, color: "text-indigo-400" },
  { id: "tournament_join", name: "Competitor", desc: "Join your first tournament", icon: Medal, points: 15, color: "text-teal-400" },
  { id: "scholar", name: "Scholar", desc: "Complete 10 IQ tests", icon: GraduationCap, points: 60, color: "text-violet-400" },
];

export default function IQAchievements() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("iq_user_badges")
        .select("code")
        .eq("user_id", session.user.id);
      if (data) setUnlockedIds(data.map((a: { code: string }) => a.code));
    };
    loadAchievements();
  }, []);

  const totalPoints = achievements.filter(a => unlockedIds.includes(a.id)).reduce((sum, a) => sum + a.points, 0);
  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Achievements</h2>
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
          {totalPoints}/{maxPoints} Points
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((ach, i) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className={`text-center p-3 transition-all h-full ${unlocked ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-yellow-500/5" : "opacity-50 grayscale"}`}>
                <ach.icon className={`h-6 w-6 mx-auto mb-1.5 ${unlocked ? ach.color : "text-muted-foreground"}`} />
                <p className="text-xs font-bold leading-tight">{ach.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{ach.desc}</p>
                <Badge variant="outline" className="mt-1.5 text-[8px]">
                  {unlocked ? "✓ Unlocked" : `${ach.points} pts`}
                </Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
