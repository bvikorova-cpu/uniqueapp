import { motion } from "framer-motion";
import { BookOpen, Sparkles, Star, Wand2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MASCOTS = ["📖", "✏️", "🐉", "🧙‍♂️", "🦄", "🌟"];

const FLOATING_EMOJIS = ["⭐", "🌙", "✨", "💫", "🔮", "🪄", "📚", "🎨", "🦋", "🌈"];

export const StoryCreatorHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Story Creator Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Creator Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Creator Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950 p-8 md:p-12 mb-8">
      {/* Animated particles */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-lg pointer-events-none select-none"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [-12, 12, -12],
            x: [-6, 6, -6],
            opacity: [0.2, 0.7, 0.2],
            scale: [0.7, 1.1, 0.7],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Rotating mascot ring */}
      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative w-32 h-32">
          {MASCOTS.map((m, i) => {
            const angle = (i / MASCOTS.length) * 2 * Math.PI;
            return (
              <motion.span
                key={i}
                className="absolute text-3xl"
                style={{
                  left: `${50 + 45 * Math.cos(angle)}%`,
                  top: `${50 + 45 * Math.sin(angle)}%`,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {m}
              </motion.span>
            );
          })}
        </div>
      </motion.div>

      {/* Neon glow orbs */}
      <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold border border-amber-400/30"
        >
          <Wand2 className="w-4 h-4" />
          AI-Powered Story Magic
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent leading-tight"
        >
          AI Story Creator
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-purple-200 text-lg"
        >
          Transform your imagination into magical illustrated stories with AI ✨
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 text-sm text-purple-300"
        >
          {["✍️ AI Writing", "🎨 AI Illustrations", "📖 Story Library", "🎙️ Read Aloud"].map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
