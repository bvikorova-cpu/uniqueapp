import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

interface FloatingReactionsProps {
  postId: string;
  onReact?: (emoji: string) => void;
}

const QUICK_REACTIONS = ["❤️", "🔥", "😂", "😮", "👏", "💯"];

export const FloatingReactions = ({ postId, onReact }: FloatingReactionsProps) => {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const [showBar, setShowBar] = useState(false);
  let counter = 0;

  const spawnEmoji = useCallback((emoji: string) => {
    const id = Date.now() + counter++;
    const x = Math.random() * 60 - 30;
    setFloating((prev) => [...prev.slice(-8), { id, emoji, x }]);
    onReact?.(emoji);

    setTimeout(() => {
      setFloating((prev) => prev.filter((e) => e.id !== id));
    }, 1500);
  }, [onReact]);

  return (
    <div className="relative">
      {/* Floating emojis */}
      <AnimatePresence>
        {floating.map((item) => (
          <motion.span
            key={item.id}
            initial={{ opacity: 1, y: 0, x: item.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 text-2xl pointer-events-none z-50"
          >
            {item.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Quick reaction bar */}
      <div 
        className="relative"
        onMouseEnter={() => setShowBar(true)}
        onMouseLeave={() => setShowBar(false)}
      >
        <button 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          onClick={() => spawnEmoji("❤️")}
        >
          <span className="text-lg">⚡</span>
          <span className="text-xs font-medium">React</span>
        </button>

        <AnimatePresence>
          {showBar && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 flex gap-1 p-1.5 rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-xl z-50"
            >
              {QUICK_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.4, y: -4 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => spawnEmoji(emoji)}
                  className="text-xl p-1 hover:bg-accent/50 rounded-lg transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
