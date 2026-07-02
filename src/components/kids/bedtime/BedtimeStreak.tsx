import { motion } from "framer-motion";
import { Flame, Moon, Star } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BedtimeStreakProps {
  currentStreak: number;
  dreamTokens: number;
  storiesListened: number;
}

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function BedtimeStreak({ currentStreak, dreamTokens, storiesListened }: BedtimeStreakProps) {
  return (
    <>
      <FloatingHowItWorks title={"Bedtime Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Bedtime Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bedtime Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-bold text-purple-100 flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-orange-400" /> Bedtime Streak
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, value: currentStreak, label: "Streak" },
          { icon: <Moon className="h-3.5 w-3.5 text-yellow-300" />, value: dreamTokens, label: "Tokens" },
          { icon: <Star className="h-3.5 w-3.5 text-purple-300" />, value: storiesListened, label: "Stories" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/10">
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <div className="text-lg font-black text-white">{stat.value}</div>
            <div className="text-[9px] text-gray-400 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Week tracker */}
      <div className="flex gap-1.5">
        {WEEK_DAYS.map((day, i) => {
          const isActive = i < currentStreak;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex-1 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                isActive
                  ? "bg-gradient-to-b from-indigo-400 to-purple-500 text-white shadow-md shadow-purple-500/30"
                  : "bg-white/5 text-gray-500 border border-white/10"
              }`}
            >
              {isActive ? "🌙" : day}
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
