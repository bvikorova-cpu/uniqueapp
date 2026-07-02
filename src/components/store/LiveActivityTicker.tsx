import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const ACTIVITIES = [
  { user: "Maria K.", item: "Legendary Crown Badge", emoji: "👑", color: "text-amber-400" },
  { user: "Jakub T.", item: "30-Day Premium Spotlight", emoji: "💎", color: "text-cyan-400" },
  { user: "Sofia R.", item: "Animated Phoenix Avatar", emoji: "🔥", color: "text-orange-400" },
  { user: "Lukas H.", item: "7-Day Featured Boost", emoji: "⭐", color: "text-yellow-400" },
  { user: "Anna B.", item: "Galaxy Theme Pack", emoji: "🌌", color: "text-purple-400" },
  { user: "David M.", item: "Featured Employer Badge", emoji: "🏆", color: "text-emerald-400" },
  { user: "Nina V.", item: "Diamond Collector Bundle", emoji: "💠", color: "text-blue-400" },
  { user: "Tomas P.", item: "Rare Wizard Avatar", emoji: "🧙", color: "text-violet-400" },
  { user: "Eva D.", item: "Legendary Dragon Theme", emoji: "🐉", color: "text-red-400" },
  { user: "Peter S.", item: "24h Visibility Boost x3", emoji: "🚀", color: "text-green-400" },
];

/** Live social-proof ticker — creates FOMO around purchases. */
export const LiveActivityTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ACTIVITIES.length), 3200);
    return () => clearInterval(id);
  }, []);

  const a = ACTIVITIES[index];

  return (
    <>
      <FloatingHowItWorks title="How Live Activity Ticker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-background/60 to-emerald-500/10 backdrop-blur-xl px-4 py-3 mb-6"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">LIVE</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm flex-1 min-w-0"
          >
            <span className="text-xl">{a.emoji}</span>
            <p className="truncate">
              <span className="font-bold">{a.user}</span>
              <span className="text-muted-foreground"> just unlocked </span>
              <span className={`font-bold ${a.color}`}>{a.item}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 hidden sm:block" />
      </div>
    </motion.div>
    </>
    );
};
