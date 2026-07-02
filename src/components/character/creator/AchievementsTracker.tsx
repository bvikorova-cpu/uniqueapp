import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsTrackerProps {
  characterCount: number;
  hasStory: boolean;
  hasTradingCard: boolean;
}

export function AchievementsTracker({ characterCount, hasStory, hasTradingCard }: AchievementsTrackerProps) {
  const achievements: Achievement[] = [
    { id: "first", name: "First Hero", emoji: "🌟", description: "Create your first character", unlocked: characterCount >= 1 },
    { id: "storyteller", name: "Storyteller", emoji: "📖", description: "Generate a backstory", unlocked: hasStory },
    { id: "collector", name: "Card Maker", emoji: "🎴", description: "Create a trading card", unlocked: hasTradingCard },
    { id: "trio", name: "Hero Trio", emoji: "👥", description: "Create 3 characters", unlocked: characterCount >= 3 },
    { id: "squad", name: "Super Squad", emoji: "🦸‍♂️", description: "Create 5 characters", unlocked: characterCount >= 5 },
    { id: "legend", name: "Legend Maker", emoji: "👑", description: "Create 10 characters", unlocked: characterCount >= 10 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <FloatingHowItWorks title={"Achievements Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievements Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievements Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/60 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🏆</span> Achievements
        </h3>
        <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl p-2 text-center transition-all ${
              ach.unlocked
                ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300"
                : "bg-gray-100 border-2 border-gray-200 opacity-50"
            }`}
          >
            <span className={`text-xl block ${ach.unlocked ? "" : "grayscale"}`}>
              {ach.emoji}
            </span>
            <p className="text-[9px] font-bold text-gray-700 mt-1 leading-tight">{ach.name}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
}
