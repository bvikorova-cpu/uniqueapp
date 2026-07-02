import { motion } from "framer-motion";
import { Moon, Play, Pause, Loader2, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryData {
  id: number;
  title: string;
  emoji: string;
  description: string;
  duration: string;
}

interface EnchantedStoryCardProps {
  story: StoryData;
  index: number;
  isPlaying: boolean;
  isGenerating: boolean;
  isCurrentStory: boolean;
  rating?: number;
  onPlay: () => void;
  onRate?: (rating: number) => void;
}

const CARD_GLOWS = [
  "hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]",
  "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
  "hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]",
  "hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
  "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
  "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
];

const DREAM_EMOJIS = ["🌙", "⭐", "💤", "🦋", "✨"];

export function EnchantedStoryCard({
  story, index, isPlaying, isGenerating, isCurrentStory, rating = 0, onPlay, onRate
}: EnchantedStoryCardProps) {
  const glow = CARD_GLOWS[index % CARD_GLOWS.length];

  return (
    <>
      <FloatingHowItWorks title={"Enchanted Story Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Enchanted Story Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Enchanted Story Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -10 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 }}
      whileHover={{ scale: 1.04, y: -8 }}
      className="perspective"
      style={{ perspective: "800px" }}
    >
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md border border-purple-400/30 shadow-xl transition-all duration-500 group ${glow}`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="p-6 text-center relative z-10">
          {/* Floating emoji */}
          <motion.div
            className="text-6xl mb-3"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
          >
            {story.emoji}
          </motion.div>

          <h3 className="text-lg font-bold text-white mb-1">{story.title}</h3>
          <p className="text-sm text-purple-200/80 mb-3 leading-snug">{story.description}</p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-xs text-purple-300">{story.duration}</span>
          </div>

          {/* Dream rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {DREAM_EMOJIS.map((emoji, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onRate?.(i + 1); }}
                className={`text-lg transition-opacity ${i < rating ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50"
              onClick={onPlay}
              disabled={isGenerating || isCurrentStory}
            >
              {isGenerating && isCurrentStory ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : isCurrentStory ? (
                <>{isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{isPlaying ? 'Playing...' : 'Paused'}</>
              ) : (
                <><Moon className="mr-2 h-4 w-4" />Listen Now</>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Animated star */}
        <motion.div
          className="absolute top-3 right-3"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
        >
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
