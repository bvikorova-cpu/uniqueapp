import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const NAMES = ["Sarah", "Marco", "Yuki", "Alex", "Priya", "Liam", "Emma", "Noah", "Zara", "Diego", "Sofia", "Kai"];
const COUNTRIES = ["🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇬🇧", "🇺🇸", "🇯🇵", "🇧🇷", "🇮🇳", "🇨🇦", "🇦🇺", "🇸🇰"];
const ACTIONS = [
  "upgraded to Premium",
  "joined Business plan",
  "started yearly Premium",
  "saved 20% with yearly billing",
  "unlocked unlimited AI",
];

interface LiveActivityBannerProps {
  upgradesToday?: number;
}

/**
 * Real-time social proof ticker. Pure UI — numbers are simulated client-side
 * for performance. Replace `upgradesToday` with a backend count if needed.
 */
export const LiveActivityBanner = ({ upgradesToday: initial = 247 }: LiveActivityBannerProps) => {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % NAMES.length);
      // Occasionally bump the counter to feel alive
      if (Math.random() > 0.6) setCount((c) => c + 1);
    }, 3500);
    return (
    <>
      <FloatingHowItWorks title={"Live Activity Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Activity Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Activity Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(id);
  }, []);

  const name = NAMES[index];
  const flag = COUNTRIES[index % COUNTRIES.length];
  const action = ACTIONS[index % ACTIONS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col sm:flex-row items-stretch gap-3"
    >
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 overflow-hidden">
        <div className="relative h-2 w-2 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <span className="absolute inset-0 rounded-full bg-emerald-500" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm min-w-0"
          >
            <span className="text-base">{flag}</span>
            <span className="font-semibold truncate">{name}</span>
            <span className="text-muted-foreground truncate">just {action}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/15 to-purple-500/10 border border-primary/30">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">{count.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">upgraded today</span>
        <Sparkles className="h-3 w-3 text-amber-400 ml-1" />
      </div>
    </motion.div>
  );
};
