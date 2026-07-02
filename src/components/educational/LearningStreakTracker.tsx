import { motion } from "framer-motion";
import { Flame, Zap, Calendar } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LearningStreakTrackerProps {
  streak: number;
  totalXP: number;
}

export const LearningStreakTracker = ({ streak, totalXP }: LearningStreakTrackerProps) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  // Map JS day (0=Sun) to Mon-based index
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <>
      <FloatingHowItWorks title="How Learning Streak Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Learning Streak</h3>
            <p className="text-sm text-muted-foreground">{streak} day{streak !== 1 ? 's' : ''} in a row!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-700">{totalXP} XP</span>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isActive = i <= todayIndex && i >= todayIndex - streak + 1 && streak > 0;
          const isToday = i === todayIndex;

          return (
            <motion.div
              key={day}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                ${isToday ? 'ring-2 ring-orange-400' : ''}
                ${isActive ? 'bg-gradient-to-b from-orange-100 to-amber-100' : 'bg-muted/50'}
              `}
            >
              <span className="text-xs font-medium text-muted-foreground">{day}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isActive ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-muted'
              }`}>
                {isActive && <Flame className="w-3 h-3 text-white" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
    </>
    );
};
