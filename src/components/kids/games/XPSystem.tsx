import { motion } from "framer-motion";
import { Star, Zap, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface XPSystemProps {
  totalXP: number;
  level: number;
}

const LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100];

export function XPSystem({ totalXP, level }: XPSystemProps) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 200;
  const xpInLevel = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <>
      <FloatingHowItWorks title={"X P System - How it works"} steps={[{ title: 'Open', desc: 'Access the X P System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in X P System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-yellow-500" /> XP Progress
        </h3>
        <span className="text-xs text-gray-500">Level {level}</span>
      </div>

      {/* Level badge */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl font-black text-white">{level}</span>
        </motion.div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{xpInLevel} XP</span>
            <span>{xpNeeded} XP</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Next reward */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-2.5 border border-yellow-200">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-xs text-gray-600">
          <span className="font-bold">{xpNeeded - xpInLevel} XP</span> until Level {level + 1} reward!
        </span>
      </div>
    </div>
    </>
  );
}
