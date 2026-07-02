import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Trophy, Lock, Star, MessageCircle, Users, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  type: "messages" | "characters" | "reactions";
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-chat", name: "First Words", description: "Send your first message", icon: <MessageCircle className="h-5 w-5" />, requirement: 1, type: "messages" },
  { id: "chatty", name: "Chatty Kid", description: "Send 10 messages", icon: <MessageCircle className="h-5 w-5" />, requirement: 10, type: "messages" },
  { id: "storyteller", name: "Storyteller", description: "Send 25 messages", icon: <Star className="h-5 w-5" />, requirement: 25, type: "messages" },
  { id: "social", name: "Social Butterfly", description: "Chat with 3 characters", icon: <Users className="h-5 w-5" />, requirement: 3, type: "characters" },
  { id: "explorer", name: "Explorer", description: "Chat with 5 characters", icon: <Sparkles className="h-5 w-5" />, requirement: 5, type: "characters" },
  { id: "super-fan", name: "Super Fan", description: "Send 50 messages", icon: <Trophy className="h-5 w-5" />, requirement: 50, type: "messages" },
];

interface ChatAchievementsProps {
  messagesSent: number;
  charactersUsed: number;
  reactionsGiven: number;
}

export function ChatAchievements({ messagesSent, charactersUsed, reactionsGiven }: ChatAchievementsProps) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  const getProgress = (achievement: Achievement) => {
    const current = achievement.type === "messages" ? messagesSent
      : achievement.type === "characters" ? charactersUsed
      : reactionsGiven;
    return Math.min(current / achievement.requirement, 1);
  };

  const isUnlocked = (achievement: Achievement) => getProgress(achievement) >= 1;

  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;

  return (
    <>
      <FloatingHowItWorks title={"Chat Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Chat Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Chat Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Achievements
        </h3>
        <span className="text-xs text-gray-500">{unlockedCount}/{ACHIEVEMENTS.length}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = isUnlocked(achievement);
          const progress = getProgress(achievement);

          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.05 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl text-center ${
                unlocked
                  ? "bg-gradient-to-br from-yellow-100 to-orange-100 shadow-md"
                  : "bg-gray-50 opacity-60"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                unlocked 
                  ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white" 
                  : "bg-gray-200 text-gray-400"
              }`}>
                {unlocked ? achievement.icon : <Lock className="h-4 w-4" />}
              </div>
              <span className="text-[10px] font-bold text-gray-700 leading-tight">{achievement.name}</span>
              
              {/* Progress bar */}
              {!unlocked && (
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}

              {unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-sm"
                >
                  ⭐
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Popup */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-bold">Achievement Unlocked!</h3>
              <p className="text-sm opacity-90">{newlyUnlocked}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
