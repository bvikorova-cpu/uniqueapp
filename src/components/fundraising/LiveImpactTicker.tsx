import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TICKER_MESSAGES = [
  "A generous donor just contributed to a medical campaign 💊",
  "Someone supported an education campaign 🎓",
  "A new campaign just reached 50% of its goal! 🎉",
  "A donor helped fund an animal rescue project 🐾",
  "A community member started a new campaign 🌟",
  "Someone just made their first donation! ❤️",
];

export function LiveImpactTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 4000);
    return (
    <>
      <FloatingHowItWorks title={"Live Impact Ticker - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Impact Ticker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Impact Ticker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-primary/5 border-y border-border/30 py-3 px-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live</span>
        </div>

        <div className="flex-1 overflow-hidden h-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-foreground/80 flex items-center gap-1.5"
            >
              <Heart className="w-3 h-3 text-primary shrink-0" />
              {TICKER_MESSAGES[currentIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
