import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const badgeDefinitions = [
  { name: "First Session", icon: "🎉", description: "Complete your first mentor session", check: (d: any) => d.sessions >= 1 },
  { name: "3-Day Streak", icon: "🔥", description: "Maintain a 3-day session streak", check: (d: any) => d.sessions >= 3 },
  { name: "Goal Setter", icon: "🎯", description: "Set your first personal goal", check: (d: any) => d.goals >= 1 },
  { name: "Week Warrior", icon: "⚔️", description: "Complete 7 sessions", check: (d: any) => d.sessions >= 7 },
  { name: "Deep Diver", icon: "🤿", description: "Have 10+ sessions", check: (d: any) => d.sessions >= 10 },
  { name: "Multi-Coach", icon: "🌟", description: "Use all 4 mentor areas", check: (d: any) => d.areas >= 4 },
];

export const AchievementBadges = () => {
  const [badges, setBadges] = useState(badgeDefinitions.map(b => ({ ...b, unlocked: false })));

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [sessions, goals, areas] = await Promise.all([
      supabase.from('mentor_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mentor_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mentor_sessions').select('mentor_area').eq('user_id', user.id),
    ]);

    const uniqueAreas = new Set((areas.data || []).map((s: any) => s.mentor_area)).size;
    const data = { sessions: sessions.count || 0, goals: goals.count || 0, areas: uniqueAreas };

    setBadges(badgeDefinitions.map(b => ({ ...b, unlocked: b.check(data) })));
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <>
      <FloatingHowItWorks title="How Achievement Badges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award className="w-4 h-4 text-white" />
              </div>
              Achievements
            </div>
            <span className="text-xs font-medium text-muted-foreground">{unlockedCount}/{badges.length}</span>
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
                    ? "bg-gradient-to-br from-amber-500/15 to-yellow-500/10 border-amber-500/30 shadow-sm shadow-amber-500/10"
                    : "bg-muted/20 border-border/30 opacity-50"
                  }
                `}
              >
                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                )}
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
    </>
    );
};
