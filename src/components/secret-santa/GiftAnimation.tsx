import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

    return (
    <>
      <FloatingHowItWorks title={"Gift Animation - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Animation section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Animation.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
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

// Animated gift card for display with 3D rotation
export const AnimatedGiftCard = ({ emoji, isNew }: { emoji: string; isNew?: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      whileHover={{ 
        scale: 1.15, 
        rotateY: [0, 15, -15, 0],
        rotateX: [0, -10, 10, 0],
        z: 50
      }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="relative cursor-pointer"
    >
      <span className="text-4xl block drop-shadow-lg">{emoji}</span>
      {isNew && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
        />
      )}
    </motion.div>
  );
};

// 3D Rotating Gift Icon with continuous animation
export const Rotating3DGift = ({ 
  emoji, 
  size = "text-6xl",
  speed = 4,
  hover3D = true 
}: { 
  emoji: string; 
  size?: string;
  speed?: number;
  hover3D?: boolean;
}) => {
  return (
    <motion.div
      animate={{ 
        rotateY: [0, 360],
      }}
      transition={{ 
        duration: speed, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      whileHover={hover3D ? { 
        rotateX: [0, 20, -20, 0],
        scale: 1.2,
        transition: { duration: 0.5 }
      } : undefined}
      style={{ 
        perspective: 1000, 
        transformStyle: "preserve-3d",
      }}
      className="cursor-pointer"
    >
      <span className={`${size} block drop-shadow-2xl`}>{emoji}</span>
    </motion.div>
  );
};

// 3D Flip Card Gift (front/back reveal)
export const FlipCardGift = ({ 
  frontEmoji, 
  backEmoji,
  isFlipped,
  onFlip
}: { 
  frontEmoji: string; 
  backEmoji: string;
  isFlipped: boolean;
  onFlip?: () => void;
}) => {
  return (
    <motion.div
      className="relative w-24 h-24 cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 backdrop-blur-sm border border-amber-300/30"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-5xl drop-shadow-lg">{frontEmoji}</span>
        </div>
        {/* Back */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/20 to-pink-500/20 backdrop-blur-sm border border-rose-300/30"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-5xl drop-shadow-lg">{backEmoji}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Floating 3D Gift with bobbing animation
export const Floating3DGift = ({ 
  emoji,
  delay = 0
}: { 
  emoji: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ y: 0, rotateY: 0, rotateX: 0 }}
      animate={{ 
        y: [0, -15, 0],
        rotateY: [0, 10, -10, 0],
        rotateX: [0, 5, -5, 0],
      }}
      transition={{ 
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="inline-block"
    >
      <span className="text-4xl block drop-shadow-xl">{emoji}</span>
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
