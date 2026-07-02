import { motion } from "framer-motion";
import { Sparkles, Star, Crown } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const floatingEmojis = ["🦄", "🌈", "⭐", "🎪", "🧚", "🎠", "🪄", "🎨"];

export const KidsHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Kids Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="text-center mb-8 pt-8 relative">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: `${10 + (i * 12) % 80}%`,
            top: `${10 + (i * 17) % 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-4"
      >
        <Sparkles className="w-5 h-5 text-yellow-300" />
        <span className="font-bold text-sm">✨ Magical World of Adventures ✨</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl"
        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
      >
        Kids Channel ✨
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-xl md:text-2xl text-white/95 mb-3 drop-shadow-lg font-semibold"
      >
        Magical Stories for Little Dreamers
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex items-center justify-center gap-2 text-white/95"
      >
        <Crown className="w-5 h-5 text-yellow-300" />
        <span className="font-medium text-sm">Premium content available for subscribers</span>
      </motion.div>

      {/* Fun fact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30"
      >
        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
        <span className="text-white/90 text-sm font-medium">
          Fun Fact: Did you know dolphins sleep with one eye open? 🐬
        </span>
      </motion.div>
    </div>
    </>
  );
};
