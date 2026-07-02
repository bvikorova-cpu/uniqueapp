import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const mascotMessages = [
  { text: "Welcome back! Ready for an adventure? 🚀", emoji: "🧙‍♂️" },
  { text: "Psst... there are new stories waiting for you! 📖", emoji: "🦊" },
  { text: "You're doing amazing! Keep exploring! ✨", emoji: "🐉" },
  { text: "Try the bedtime stories tonight! 🌙", emoji: "🦉" },
  { text: "Have you met all the characters? 💬", emoji: "🐻" },
];

export const MascotGuide = () => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % mascotMessages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 right-4 z-50 max-w-[280px]"
    >
      <div className="relative">
        {/* Chat bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMsg}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-br-sm p-3 shadow-xl border border-purple-200 mb-2"
          >
            <p className="text-sm text-gray-700 font-medium">{mascotMessages[currentMsg].text}</p>
          </motion.div>
        </AnimatePresence>

        {/* Mascot avatar */}
        <div className="flex items-center justify-end gap-2">
          <motion.button
            onClick={() => setIsVisible(false)}
            className="text-[10px] text-white/60 hover:text-white/90"
          >
            Hide
          </motion.button>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-lg border-2 border-white/50 cursor-pointer"
            onClick={() => setCurrentMsg(prev => (prev + 1) % mascotMessages.length)}
          >
            {mascotMessages[currentMsg].emoji}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
