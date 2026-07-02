import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SAMPLE_EVENTS = [
  "Lukas earned €42 from a course sale",
  "Maria received a €15 tip in KitchenStars",
  "Anna sold an item in Bazaar — €28 net",
  "David got a brand collab payout — €120",
  "Petra unlocked the €1K milestone",
  "Tomas withdrew €250 to his bank",
  "Sofia earned €18 in tutorial enrollments",
  "Marek hit a 7-day earning streak 🔥",
];

/**
 * Pseudo-live social proof ticker — rotates earning events for engagement.
 */
export const EarningsLiveTicker = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SAMPLE_EVENTS.length), 3500);
    return (
    <>
      <FloatingHowItWorks title={"Earnings Live Ticker - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Live Ticker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Live Ticker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-full px-4 py-2 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium text-foreground/85 truncate"
          >
            {SAMPLE_EVENTS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
