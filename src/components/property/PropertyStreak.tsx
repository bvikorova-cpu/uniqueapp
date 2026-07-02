import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PropertyStreak = () => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  const currentStreak = 0;

  return (
    <>
      <FloatingHowItWorks title={"Property Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-blue-500/10 h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-sky-500" />
              </div>
              <span className="font-bold text-sm">Activity Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-sky-500">{currentStreak}</span>
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
                      ${isToday ? "bg-sky-500/20 border-2 border-dashed border-sky-400 text-sky-500" : "bg-muted/30 text-muted-foreground border border-border/20"}
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
            <span className="text-sky-500 font-semibold animate-pulse">
              Start browsing! 🏠
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
