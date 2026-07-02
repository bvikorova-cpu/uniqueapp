import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Trophy, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  /** Current % funded (0-100) */
  pct: number;
  /** Optional callback when a milestone is reached */
  onMilestone?: (pct: number) => void;
}

const MILESTONES = [
  { pct: 10, label: "First steps!", emoji: "🌱", color: "from-emerald-400 to-green-500" },
  { pct: 25, label: "Quarter way!", emoji: "✨", color: "from-amber-400 to-yellow-500" },
  { pct: 50, label: "Halfway there!", emoji: "🎉", color: "from-rose-400 to-pink-500" },
  { pct: 75, label: "Almost done!", emoji: "🚀", color: "from-purple-400 to-fuchsia-500" },
  { pct: 100, label: "Goal reached!", emoji: "🏆", color: "from-amber-400 via-yellow-400 to-amber-500" },
];

export function MilestoneCelebration({ pct, onMilestone }: Props) {
  const [showCelebration, setShowCelebration] = useState<typeof MILESTONES[0] | null>(null);
  const [reachedMilestones, setReachedMilestones] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newlyReached = MILESTONES.find((m) => pct >= m.pct && !reachedMilestones.has(m.pct));
    if (newlyReached) {
      setReachedMilestones((prev) => new Set(prev).add(newlyReached.pct));
      setShowCelebration(newlyReached);
      onMilestone?.(newlyReached.pct);
      setTimeout(() => setShowCelebration(null), 4000);
    }
  }, [pct]);

  // Track milestones based on initial pct without celebrating
  useEffect(() => {
    setReachedMilestones(new Set(MILESTONES.filter((m) => pct >= m.pct).map((m) => m.pct)));
  }, []); // eslint-disable-line

  return (
    <>
      <FloatingHowItWorks title={"Milestone Celebration - How it works"} steps={[{ title: 'Open', desc: 'Access the Milestone Celebration section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Milestone Celebration.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      {/* Inline progress badges */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {MILESTONES.map((m) => {
          const reached = pct >= m.pct;
          return (
            <span
              key={m.pct}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all ${
                reached
                  ? `bg-gradient-to-r ${m.color} text-white border-transparent shadow-sm`
                  : "bg-muted/30 text-muted-foreground border-border/30"
              }`}
            >
              {m.emoji} {m.pct}%
            </span>
          );
        })}
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`bg-gradient-to-r ${showCelebration.color} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20`}>
              <span className="text-3xl">{showCelebration.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span className="font-bold text-sm uppercase tracking-wide">{showCelebration.pct}% Milestone</span>
                </div>
                <p className="text-lg font-black">{showCelebration.label}</p>
              </div>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {/* Confetti particles */}
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 300 - 100,
                  opacity: 0,
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                style={{ left: "50%", top: "50%" }}
              >
                {["🎉", "✨", "🎊", "💖", "⭐"][i % 5]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
    </>
  );
}
