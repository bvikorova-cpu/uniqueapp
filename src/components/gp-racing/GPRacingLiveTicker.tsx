import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Zap, Star, Car } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const tickerEvents = [
  { icon: Trophy, text: "🏆 Phoenix Team won the Nebula Drift Circuit!", color: "text-amber-400" },
  { icon: Flame, text: "🔥 New speed record: 347 km/h on Quantum Horizon Ring", color: "text-orange-400" },
  { icon: Car, text: "🏎️ 12 new cars entered the arena today", color: "text-cyan-400" },
  { icon: Star, text: "⭐ Weekend Grand Prix starting in 3 hours — 500 Coin prize!", color: "text-violet-400" },
  { icon: Zap, text: "⚡ Thunder Racing upgraded to Hybrid Power Unit", color: "text-emerald-400" },
  { icon: Trophy, text: "🥇 New #1 driver: Phantom Racer with 47 wins", color: "text-amber-400" },
  { icon: Flame, text: "🌧️ Rain conditions detected on Asteroid Belt Gauntlet", color: "text-blue-400" },
  { icon: Car, text: "🛞 Quantum Grip Tires now available in shop — limited time!", color: "text-red-400" },
];

export function GPRacingLiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const event = tickerEvents[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-sm">
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="h-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse" />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="shrink-0 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60">Live</span>
        </div>
        
        <div className="h-4 w-px bg-cyan-500/30" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <span className={`text-sm font-mono truncate ${event.color}`}>
              {event.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
