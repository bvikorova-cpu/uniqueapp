import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, Zap, Target, Flame, Crown, Star, Medal, Swords, Lightbulb, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Rarity = "common" | "rare" | "epic" | "legendary";

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: any;
  points: number;
  rarity: Rarity;
}

const achievements: AchievementDef[] = [
  { id: "first_test", name: "First Steps", desc: "Complete your first IQ test", icon: Brain, points: 10, rarity: "common" },
  { id: "iq_100", name: "Century Mind", desc: "Reach IQ score of 100", icon: Target, points: 25, rarity: "common" },
  { id: "iq_120", name: "Superior Intellect", desc: "Reach IQ score of 120", icon: Star, points: 50, rarity: "rare" },
  { id: "iq_140", name: "Genius Level", desc: "Reach IQ score of 140", icon: Crown, points: 100, rarity: "epic" },
  { id: "iq_160", name: "Mensa Elite", desc: "Reach IQ score of 160", icon: Crown, points: 200, rarity: "legendary" },
  { id: "streak_7", name: "Weekly Warrior", desc: "Maintain a 7-day streak", icon: Flame, points: 20, rarity: "common" },
  { id: "streak_30", name: "Monthly Master", desc: "Maintain a 30-day streak", icon: Flame, points: 75, rarity: "rare" },
  { id: "streak_100", name: "Centurion", desc: "Maintain a 100-day streak", icon: Flame, points: 250, rarity: "legendary" },
  { id: "duel_win", name: "Duel Victor", desc: "Win your first IQ duel", icon: Swords, points: 15, rarity: "common" },
  { id: "duel_10", name: "Duel Champion", desc: "Win 10 IQ duels", icon: Trophy, points: 50, rarity: "rare" },
  { id: "duel_50", name: "Arena Legend", desc: "Win 50 IQ duels", icon: Trophy, points: 150, rarity: "epic" },
  { id: "tools_5", name: "Tool Explorer", desc: "Use 5 different AI tools", icon: Lightbulb, points: 20, rarity: "common" },
  { id: "tools_all", name: "AI Master", desc: "Use all AI tools at least once", icon: Zap, points: 40, rarity: "rare" },
  { id: "tournament_join", name: "Competitor", desc: "Join your first tournament", icon: Medal, points: 15, rarity: "common" },
  { id: "tournament_win", name: "Champion", desc: "Win a tournament", icon: Trophy, points: 120, rarity: "epic" },
  { id: "scholar", name: "Scholar", desc: "Complete 10 IQ tests", icon: GraduationCap, points: 60, rarity: "rare" },
];

const rarityStyles: Record<Rarity, { border: string; bg: string; text: string; glow: string; label: string }> = {
  common:    { border: "border-slate-400/50",  bg: "from-slate-500/10 to-slate-600/5",   text: "text-slate-300",   glow: "",                                       label: "Common" },
  rare:      { border: "border-blue-400/60",   bg: "from-blue-500/15 to-cyan-500/10",    text: "text-blue-300",    glow: "shadow-md shadow-blue-500/20",           label: "Rare" },
  epic:      { border: "border-purple-400/70", bg: "from-purple-500/20 to-pink-500/10",  text: "text-purple-300",  glow: "shadow-lg shadow-purple-500/30",         label: "Epic" },
  legendary: { border: "border-amber-400",     bg: "from-amber-500/25 to-orange-500/15", text: "text-amber-300",   glow: "shadow-xl shadow-amber-500/40 ring-1 ring-amber-400/40", label: "Legendary" },
};

export default function IQAchievements() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Try awarding any newly-earned badges first
      try {
        const { data: newly } = await supabase.rpc("award_iq_badges");
        if (Array.isArray(newly) && newly.length > 0) {
          const names = newly
            .map((code: string) => achievements.find(a => a.id === code)?.name || code)
            .join(", ");
          toast.success(`🏆 Achievement unlocked: ${names}`);
        }
      } catch {
        // ignore
      }

      const { data } = await supabase
        .from("iq_user_badges")
        .select("code")
        .eq("user_id", session.user.id);
      if (data) setUnlockedIds(data.map((a: { code: string }) => a.code));
    })();
  }, []);

  const totalPoints = achievements.filter(a => unlockedIds.includes(a.id)).reduce((s, a) => s + a.points, 0);
  const maxPoints = achievements.reduce((s, a) => s + a.points, 0);

  const byRarity: Record<Rarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
  achievements.forEach(a => { if (unlockedIds.includes(a.id)) byRarity[a.rarity]++; });

  return (
    <>
      <FloatingHowItWorks title="How IQAchievements works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Achievements</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(byRarity) as Rarity[]).map(r => (
            <Badge key={r} variant="outline" className={`text-[10px] ${rarityStyles[r].text} ${rarityStyles[r].border}`}>
              {rarityStyles[r].label}: {byRarity[r]}
            </Badge>
          ))}
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
            {totalPoints}/{maxPoints} pts
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((ach, i) => {
          const unlocked = unlockedIds.includes(ach.id);
          const s = rarityStyles[ach.rarity];
          return (
            <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className={`relative text-center p-3 transition-all h-full bg-gradient-to-br ${s.bg} ${s.border} ${unlocked ? s.glow : "opacity-40 grayscale"}`}>
                <Badge variant="outline" className={`absolute top-1 right-1 text-[8px] ${s.text} ${s.border} bg-background/60`}>
                  {s.label}
                </Badge>
                <ach.icon className={`h-7 w-7 mx-auto mb-1.5 mt-2 ${unlocked ? s.text : "text-muted-foreground"}`} />
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
    </>
    );
}
