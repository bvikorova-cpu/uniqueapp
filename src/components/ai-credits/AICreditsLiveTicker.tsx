import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2, Image as ImageIcon, Brush, Cpu } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ACTIONS = [
  { icon: ImageIcon, verb: "generated an image", credits: 5, color: "text-cyan-300" },
  { icon: Brush, verb: "applied style transfer", credits: 3, color: "text-purple-300" },
  { icon: Wand2, verb: "edited with AI", credits: 3, color: "text-pink-300" },
  { icon: Cpu, verb: "upscaled to 4K", credits: 2, color: "text-amber-300" },
  { icon: Sparkles, verb: "topped up credits", credits: 25, color: "text-emerald-300" },
];

const NAMES = [
  // Europe
  "Emma L.", "Liam B.", "Sofia R.", "Noah K.", "Mia F.",
  "Lucas M.", "Olivia T.", "Hugo D.", "Chloé P.", "Matteo R.",
  "Giulia C.", "Hans M.", "Greta S.", "Pavel N.", "Zofia W.",
  // Americas
  "Ethan W.", "Ava J.", "Mason H.", "Isabella G.", "Diego A.",
  "Camila V.", "Lucas S.", "Valentina O.", "Mateo F.", "Sophia D.",
  // Asia
  "Hiroshi T.", "Yuki S.", "Wei L.", "Mei C.", "Aarav P.",
  "Priya S.", "Min-jun K.", "Ji-woo L.", "Aisha R.", "Ravi K.",
  // Middle East / Africa
  "Omar H.", "Layla A.", "Fatima Z.", "Youssef B.", "Amara O.",
  "Kwame A.", "Zainab M.", "Idris N.",
  // Oceania
  "Jack W.", "Ruby T.", "Aroha N.", "Tane M.",
];

/**
 * Live activity ticker for AI Credits — pseudo-live FOMO feed.
 * Cycles through random actions every ~3.5s.
 */
export const AICreditsLiveTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => i + 1), 3500);
    return () => clearInterval(t);
  }, []);

  const action = ACTIONS[index % ACTIONS.length];
  const name = NAMES[(index * 7) % NAMES.length];
  const Icon = action.icon;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 border border-primary/30 backdrop-blur-xl px-4 py-3 mb-6 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">LIVE</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-2 text-sm flex-1 min-w-0"
          >
            <Icon className={`h-4 w-4 shrink-0 ${action.color}`} />
            <span className="font-bold text-foreground truncate">{name}</span>
            <span className="text-muted-foreground truncate">{action.verb}</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-black shrink-0">
              {action.credits} cr
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
