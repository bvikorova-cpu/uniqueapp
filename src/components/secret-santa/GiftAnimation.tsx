import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftAnimationProps {
  emoji: string;
  label: string;
  onComplete?: () => void;
  type?: "open" | "send" | "reveal";
}

export const GiftAnimation = ({ emoji, label, onComplete, type = "open" }: GiftAnimationProps) => {
  const [stage, setStage] = useState<"closed" | "opening" | "revealed">("closed");

  useEffect(() => {
    if (type === "reveal") {
      setStage("revealed");
      return;
    }
    
    const timer1 = setTimeout(() => setStage("opening"), 500);
    const timer2 = setTimeout(() => setStage("revealed"), 1500);
    const timer3 = setTimeout(() => onComplete?.(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [type, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {stage === "closed" && (
          <motion.div
            key="closed"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-9xl"
          >
            🎁
          </motion.div>
        )}

        {stage === "opening" && (
          <motion.div
            key="opening"
            animate={{
              scale: [1, 1.2, 0.9, 1.1, 1],
              rotate: [0, -10, 10, -5, 0],
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="relative"
          >
            <span className="text-9xl animate-pulse">🎁</span>
            {/* Sparkles around */}
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i * Math.PI) / 4) * 80,
                  y: Math.sin((i * Math.PI) / 4) * 80,
                }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>
        )}

        {stage === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[150px] drop-shadow-2xl"
            >
              {emoji}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-3xl font-bold mt-4 drop-shadow-lg"
            >
              {label}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/60 text-lg mt-2"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Animated gift card for display
export const AnimatedGiftCard = ({ emoji, isNew }: { emoji: string; isNew?: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      className="relative"
    >
      <span className="text-4xl block">{emoji}</span>
      {isNew && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        />
      )}
    </motion.div>
  );
};

// Bounce animation for sending
export const SendingAnimation = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        animate={{
          y: [0, -100, -150],
          x: [0, 50, 150],
          scale: [1, 1.2, 0],
          rotate: [0, 15, 45],
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-8xl"
      >
        🎁
      </motion.div>
    </motion.div>
  );
};
