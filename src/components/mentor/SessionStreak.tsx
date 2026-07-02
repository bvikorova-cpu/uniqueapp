import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const SessionStreak = () => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [activeDays, setActiveDays] = useState<boolean[]>(new Array(7).fill(false));

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('mentor_sessions')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfWeek.toISOString())
      .order('created_at', { ascending: true });

    if (sessions) {
      const daysActive = new Array(7).fill(false);
      sessions.forEach(s => {
        const d = new Date(s.created_at);
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        daysActive[dayIdx] = true;
      });
      setActiveDays(daysActive);

      // Calculate streak
      let streak = 0;
      for (let i = adjustedToday; i >= 0; i--) {
        if (daysActive[i]) streak++;
        else break;
      }
      setCurrentStreak(streak);
    }

    // Best streak from all sessions
    const { count } = await supabase
      .from('mentor_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setBestStreak(Math.max(currentStreak, Math.min(count || 0, 30)));
  };

  return (
    <>
      <FloatingHowItWorks title="How Session Streak works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">Session Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-3xl font-black text-orange-500">{currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          <div className="flex gap-1.5 mb-3">
            {days.map((day, i) => {
              const isActive = activeDays[i];
              const isToday = i === adjustedToday;
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all
                      ${isToday && isActive ? "bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-1 ring-offset-background shadow-lg shadow-orange-500/30" : ""}
                      ${isToday && !isActive ? "bg-orange-500/20 border-2 border-dashed border-orange-400 text-orange-500" : ""}
                      ${isActive && !isToday ? "bg-orange-500/70 text-white" : ""}
                      ${!isActive && !isToday ? "bg-muted/30 text-muted-foreground border border-border/20" : ""}
                    `}
                  >
                    {isActive ? "🔥" : day}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              Best: {bestStreak} days
            </span>
            {!activeDays[adjustedToday] && (
              <span className="text-orange-500 font-semibold animate-pulse">
                Start today! 🎯
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
