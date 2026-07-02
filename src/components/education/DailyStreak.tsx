import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface DailyStreakProps {
  currentStreak: number;
  bestStreak: number;
  todayCompleted: boolean;
}

export const DailyStreak = ({ currentStreak, bestStreak, todayCompleted }: DailyStreakProps) => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  return (
    <>
      <FloatingHowItWorks title="How Daily Streak works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-sm">Daily Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-orange-500">{currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            {days.map((day, i) => {
              const isActive = i <= adjustedToday && i >= adjustedToday - currentStreak + 1;
              const isToday = i === adjustedToday;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all
                      ${isToday && todayCompleted ? "bg-orange-500 text-orange-50 ring-2 ring-orange-400 ring-offset-1 ring-offset-background" : ""}
                      ${isToday && !todayCompleted ? "bg-orange-500/20 border-2 border-dashed border-orange-400 text-orange-500" : ""}
                      ${isActive && !isToday ? "bg-orange-500/70 text-orange-50" : ""}
                      ${!isActive && !isToday ? "bg-muted/50 text-muted-foreground" : ""}
                    `}
                  >
                    {isActive || (isToday && todayCompleted) ? "🔥" : day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Best: {bestStreak} days
            </span>
            {!todayCompleted && (
              <span className="text-orange-500 font-semibold animate-pulse">
                Complete today! 🎯
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
