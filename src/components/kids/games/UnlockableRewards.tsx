import { motion } from "framer-motion";
import { Lock, CheckCircle, Gift } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface UnlockableRewardsProps {
  level: number;
}

const REWARDS = [
  { level: 1, name: "Starter Pack", emoji: "🎁", type: "Theme" },
  { level: 2, name: "Speed Boost", emoji: "⚡", type: "Power-up" },
  { level: 3, name: "Ocean Theme", emoji: "🌊", type: "Theme" },
  { level: 4, name: "Extra Life", emoji: "❤️", type: "Power-up" },
  { level: 5, name: "Space Theme", emoji: "🚀", type: "Theme" },
  { level: 6, name: "Mystery Box", emoji: "📦", type: "Special" },
  { level: 7, name: "Dragon Skin", emoji: "🐉", type: "Character" },
  { level: 8, name: "Rainbow Mode", emoji: "🌈", type: "Theme" },
];

export function UnlockableRewards({ level }: UnlockableRewardsProps) {
  return (
    <>
      <FloatingHowItWorks title={"Unlockable Rewards - How it works"} steps={[{ title: 'Open', desc: 'Access the Unlockable Rewards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Unlockable Rewards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
        <Gift className="h-4 w-4 text-purple-500" /> Rewards
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {REWARDS.map((reward, i) => {
          const unlocked = level >= reward.level;
          return (
            <motion.div
              key={reward.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl text-center ${
                unlocked
                  ? "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm"
                  : "bg-gray-50 opacity-50"
              }`}
            >
              <span className="text-xl">{unlocked ? reward.emoji : "🔒"}</span>
              <span className="text-[9px] font-bold text-gray-600 leading-tight">{reward.name}</span>
              <span className="text-[8px] text-gray-400">Lv.{reward.level}</span>
              
              {unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 fill-green-100" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
