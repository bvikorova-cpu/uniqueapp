import { motion } from "framer-motion";
import { Flame, Gift } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function DailyStreak({ currentStreak, longestStreak }: DailyStreakProps) {
  return (
    <>
      <FloatingHowItWorks title={"Daily Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" /> Daily Streak
        </h3>
        <span className="text-xs text-gray-500">Best: {longestStreak}</span>
      </div>

      {/* Streak counter */}
      <div className="flex items-center gap-3">
        <motion.div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            currentStreak > 0
              ? "bg-gradient-to-br from-orange-400 to-red-500"
              : "bg-gray-200"
          }`}
          animate={currentStreak > 0 ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-center">
            <div className="text-xl font-black text-white">{currentStreak}</div>
            <div className="text-[8px] text-white/80 font-bold">DAYS</div>
          </div>
        </motion.div>

        <div className="flex gap-1.5 flex-1">
          {DAYS.map((day, i) => {
            const isActive = i < currentStreak;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
                  isActive
                    ? "bg-gradient-to-b from-orange-400 to-red-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isActive ? "🔥" : day}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak bonus */}
      {currentStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-2.5 border border-orange-200"
        >
          <Gift className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-gray-600">
            <span className="font-bold">{currentStreak}-day streak!</span> Bonus XP active!
          </span>
        </motion.div>
      )}
    </div>
    </>
  );
}
