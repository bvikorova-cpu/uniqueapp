import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Check } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useWellnessStats } from "@/hooks/useWellnessStats";

const LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const WellnessStreak = () => {
  const { currentStreak, bestStreak, weekDays, isLoading } = useWellnessStats();
  const todayKey = new Date().toDateString();

  return (
    <>
      <FloatingHowItWorks title="Wellness Streak — How it works" steps={[{title:"Do one activity a day",desc:"Any breathing exercise, meditation, journal entry or nature-sound session counts."},{title:"Day gets marked",desc:"The weekday turns green once your activity is saved to your account."},{title:"Keep the chain",desc:"Consecutive days build your current streak; a missed day resets it."},{title:"Beat your best",desc:"Your longest streak ever is stored and shown as 'Best'."}]} />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="font-bold text-sm">Wellness Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-emerald-500">{isLoading ? "–" : currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            {weekDays.map((d, i) => {
              const isToday = d.date.toDateString() === todayKey;
              return (
                <motion.div
                  key={LABELS[i]}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all
                      ${d.active
                        ? "bg-emerald-500 text-white border border-emerald-500"
                        : isToday
                          ? "bg-emerald-500/20 border-2 border-dashed border-emerald-400 text-emerald-500"
                          : "bg-muted/30 text-muted-foreground border border-border/20"}
                    `}
                  >
                    {d.active ? <Check className="w-3.5 h-3.5" /> : LABELS[i]}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Best: {isLoading ? "–" : bestStreak} day{bestStreak === 1 ? "" : "s"}
            </span>
            <span className="text-emerald-500 font-semibold">
              {currentStreak > 0 ? `${currentStreak}-day streak 🔥` : "Start your streak! 🧘"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>);
};
