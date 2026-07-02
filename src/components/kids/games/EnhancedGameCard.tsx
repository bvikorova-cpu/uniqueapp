import { motion } from "framer-motion";
import { Gamepad2, Star, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GameCardProps {
  game: {
    id: number;
    title: string;
    emoji: string;
    description: string;
    difficulty: string;
    stars: number;
  };
  index: number;
  isUnlocked: boolean;
  bestScore: number;
  onPlay: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "from-green-400 to-emerald-400",
  Medium: "from-yellow-400 to-orange-400",
  Hard: "from-red-400 to-pink-400",
};

const CARD_GRADIENTS = [
  "from-red-50 to-pink-50 border-red-200 hover:border-red-400",
  "from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400",
  "from-green-50 to-emerald-50 border-green-200 hover:border-green-400",
  "from-purple-50 to-violet-50 border-purple-200 hover:border-purple-400",
  "from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400",
  "from-cyan-50 to-teal-50 border-cyan-200 hover:border-cyan-400",
];

export function EnhancedGameCard({ game, index, isUnlocked, bestScore, onPlay }: GameCardProps) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const diffGradient = DIFFICULTY_COLORS[game.difficulty] || "from-gray-400 to-gray-500";

  return (
    <>
      <FloatingHowItWorks title={"Enhanced Game Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Enhanced Game Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Enhanced Game Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.08 }}
      whileHover={{ scale: 1.05, y: -5, rotateY: 3 }}
      whileTap={{ scale: 0.97 }}
      className="perspective"
      style={{ perspective: "800px" }}
    >
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} border-2 shadow-xl transition-all duration-300 group`}>
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/0 via-white/30 to-white/0 pointer-events-none" />

        <div className="p-6 text-center relative z-10">
          {/* Animated emoji */}
          <motion.div
            className="text-7xl mb-3"
            animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
          >
            {game.emoji}
          </motion.div>

          <h3 className="text-xl font-bold text-gray-800 mb-1">{game.title}</h3>
          <p className="text-sm text-gray-500 mb-4 leading-snug">{game.description}</p>

          {/* Difficulty & Stars */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs px-3 py-1 rounded-full text-white font-bold bg-gradient-to-r ${diffGradient} shadow-sm`}>
              {game.difficulty}
            </span>
            <div className="flex gap-0.5">
              {[...Array(game.stars)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Best Score */}
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-1 mb-3 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Best: <span className="font-bold text-gray-700">{bestScore} pts</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((bestScore / 100) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className={`w-full rounded-xl font-bold shadow-lg ${
                isUnlocked
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={onPlay}
              disabled={!isUnlocked}
            >
              {isUnlocked ? (
                <>
                  <Gamepad2 className="mr-2 h-4 w-4" /> Play Now!
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Locked
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Sparkle on hover */}
        <motion.div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
