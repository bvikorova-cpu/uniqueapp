import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const mascots = ["🔬", "🧪", "⚗️", "🧫", "🔭"];
const floatingEmojis = ["⚛️", "🧬", "🌡️", "💡", "🌋", "🦠", "🪐", "⭐"];

export const ScienceLabHero = () => {
  const [currentMascot, setCurrentMascot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMascot((prev) => (prev + 1) % mascots.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-purple-500/20 border border-emerald-500/30 p-8 mb-8">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 17) % 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Orbital rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-emerald-400/20 rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-48 h-48 border border-cyan-400/15 rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 text-center">
        {/* Rotating mascot */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMascot}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-7xl mb-4 drop-shadow-lg"
          >
            {mascots[currentMascot]}
          </motion.div>
        </AnimatePresence>

        <motion.h1
          className="text-4xl md:text-5xl font-black mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AI Science Lab
          </span>
          <span className="ml-2">🧪</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discover science through virtual experiments and AI-powered analysis!
        </motion.p>

        {/* Pulsing atom */}
        <motion.div
          className="absolute -top-2 -right-2 text-4xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚛️
        </motion.div>
      </div>
    </div>
  );
};
