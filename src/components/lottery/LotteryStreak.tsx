import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const LotteryStreak = () => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  const currentStreak = 0;

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Streak'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Streak panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/10 h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-bold text-sm">Generation Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-orange-500">{currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            {days.map((day, i) => {
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
                      ${isToday ? "bg-orange-500/20 border-2 border-dashed border-orange-400 text-orange-500" : "bg-muted/30 text-muted-foreground border border-border/20"}
                    `}
                  >
                    {day}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Best: 0 days
            </span>
            <span className="text-orange-500 font-semibold animate-pulse">
              Start generating! 🎰
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
