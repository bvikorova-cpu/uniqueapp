import { motion } from "framer-motion";
import { Crown, Sparkles, Trophy, Map } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CastleHeroProps {
  stampsCount: number;
  totalCastles: number;
  visitedCount: number;
}

const floatingItems = [
  { emoji: "🏰", left: 2, top: 10 },
  { emoji: "👑", left: 8, top: 70 },
  { emoji: "✨", left: 92, top: 15 },
  { emoji: "🌟", left: 88, top: 65 },
  { emoji: "🎪", left: 5, top: 45 },
  { emoji: "🗺️", left: 95, top: 40 },
  { emoji: "🏆", left: 90, top: 80 },
  { emoji: "🇺🇸", left: 3, top: 85 },
  { emoji: "🇫🇷", left: 12, top: 25 },
  { emoji: "🇯🇵", left: 85, top: 5 },
];

export function CastleHero({ stampsCount, totalCastles, visitedCount }: CastleHeroProps) {
  const completionPercent = Math.round((stampsCount / totalCastles) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Castle Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative text-center py-16 overflow-hidden">
      {/* Floating items */}
      {floatingItems.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl md:text-3xl pointer-events-none select-none opacity-60"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Rotating castle icon */}
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex items-center justify-center shadow-2xl shadow-amber-400/30"
          style={{ perspective: 800, transformStyle: "preserve-3d" }}
        >
          <span className="text-5xl">🏰</span>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black mb-3">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Fairy Castle
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            World Tour 🌍
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Explore 12 magical castles in stunning 360° panoramic views from around the world!
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-6 mb-8"
      >
        {[
          { icon: Map, value: `${visitedCount}/${totalCastles}`, label: "Explored", color: "text-blue-500" },
          { icon: Trophy, value: `${stampsCount}/${totalCastles}`, label: "Stamps", color: "text-amber-500" },
          { icon: Crown, value: `${completionPercent}%`, label: "Complete", color: "text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div className="text-left">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Global progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-md mx-auto"
      >
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Explorer Progress</span>
          <span>{completionPercent}%</span>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full"
          />
        </div>
        {completionPercent === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-amber-600 dark:text-amber-400 font-bold mt-2 flex items-center justify-center gap-1"
          >
            <Sparkles className="h-4 w-4" /> Master Fairy Explorer! 🎉
          </motion.p>
        )}
      </motion.div>
    </div>
    </>
  );
}
