import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Camera, Zap, Target, Flame, Crown, Star, Medal, Eye, Heart, Gem, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const achievements = [
  { id: "first_scan", name: "First Glimpse", desc: "Complete your first face scan", icon: Camera, points: 10, color: "text-cyan-400" },
  { id: "skin_check", name: "Skin Expert", desc: "Run 5 skin health analyses", icon: Eye, points: 25, color: "text-purple-400" },
  { id: "streak_7", name: "Weekly Warrior", desc: "7-day selfie streak", icon: Flame, points: 20, color: "text-orange-400" },
  { id: "streak_30", name: "Monthly Master", desc: "30-day selfie streak", icon: Crown, points: 75, color: "text-red-400" },
  { id: "anti_aging", name: "Age Defier", desc: "Follow anti-aging plan for 14 days", icon: Heart, points: 50, color: "text-pink-400" },
  { id: "celeb_match", name: "Star Twin", desc: "Find your celebrity age match", icon: Star, points: 15, color: "text-yellow-400" },
  { id: "tools_5", name: "Tool Explorer", desc: "Use 5 different AI tools", icon: Zap, points: 20, color: "text-emerald-400" },
  { id: "tools_all", name: "Crystal Master", desc: "Use all 8 AI tools", icon: Gem, points: 60, color: "text-indigo-400" },
  { id: "challenge_win", name: "Duel Victor", desc: "Win your first age challenge", icon: Trophy, points: 30, color: "text-amber-400" },
  { id: "transform_10", name: "Transformer", desc: "Complete 10 transformations", icon: Target, points: 40, color: "text-teal-400" },
  { id: "scholar", name: "Scholar", desc: "Read all anti-aging reports", icon: GraduationCap, points: 35, color: "text-violet-400" },
  { id: "legend", name: "Crystal Legend", desc: "Reach 100-day streak", icon: Medal, points: 100, color: "text-cyan-400" },
];

export default function FutureFaceAchievements() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("user_achievements").select("achievement_id").eq("user_id", session.user.id);
      if (data) setUnlockedIds(data.map((a: any) => a.achievement_id));
    };
    load();
  }, []);

  const totalPoints = achievements.filter(a => unlockedIds.includes(a.id)).reduce((s, a) => s + a.points, 0);
  const maxPoints = achievements.reduce((s, a) => s + a.points, 0);

  return (
    <>
      <FloatingHowItWorks title={"Future Face Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Age Reversal Achievements</h2>
        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          {totalPoints}/{maxPoints} Points
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((ach, i) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className={`text-center p-3 h-full ${unlocked ? "border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-purple-500/5" : "opacity-50 grayscale"}`}>
                <ach.icon className={`h-6 w-6 mx-auto mb-1.5 ${unlocked ? ach.color : "text-muted-foreground"}`} />
                <p className="text-xs font-bold leading-tight">{ach.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{ach.desc}</p>
                <Badge variant="outline" className="mt-1.5 text-[8px]">{unlocked ? "✓ Unlocked" : `${ach.points} pts`}</Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
