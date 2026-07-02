import { motion } from "framer-motion";
import { Gamepad2, Star, Zap } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GameHeroProps {
  totalScore: number;
  level: number;
  gamesPlayed: number;
}

const FLOATING_ICONS = ["🎮", "🎯", "🧩", "⭐", "🏆", "🎲", "🎪", "🎨"];

export function GameHero({ totalScore, level, gamesPlayed }: GameHeroProps) {
  return (
    <>
      <FloatingHowItWorks title={"Game Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Game Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Game Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-8 md:p-12 shadow-2xl mb-8"
    >
      {/* Floating game icons */}
      {FLOATING_ICONS.map((icon, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl md:text-3xl opacity-20"
          style={{ left: `${(i / FLOATING_ICONS.length) * 100}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        >
          {icon}
        </motion.span>
      ))}

      <div className="relative z-10 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-black text-white mb-3"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎮 Story Games Arena
        </motion.h1>
        <p className="text-lg text-white/80 mb-6">Play, learn, and earn rewards!</p>

        {/* Stats Row */}
        <div className="flex justify-center gap-6 md:gap-10">
          {[
            { icon: <Star className="h-5 w-5" />, label: "Score", value: totalScore, color: "from-yellow-400 to-orange-400" },
            { icon: <Zap className="h-5 w-5" />, label: "Level", value: level, color: "from-green-400 to-emerald-400" },
            { icon: <Gamepad2 className="h-5 w-5" />, label: "Games", value: gamesPlayed, color: "from-blue-400 to-cyan-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl px-5 py-3 shadow-lg`}
            >
              <div className="flex items-center gap-2 text-white mb-1">
                {stat.icon}
                <span className="text-xs font-bold uppercase">{stat.label}</span>
              </div>
              <motion.div
                className="text-3xl font-black text-white"
                key={stat.value}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
}
