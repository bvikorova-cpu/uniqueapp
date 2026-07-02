import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { GiftConfetti } from "./GiftConfetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface InteractiveGiftProps {
  giftEmoji: string;
  giftLabel: string;
  interactionType: "puzzle" | "scratch" | "spin" | "shake";
  onComplete?: () => void;
  bonusValue?: number;
}

export const InteractiveGift = ({ 
  giftEmoji, 
  giftLabel, 
  interactionType, 
  onComplete,
  bonusValue 
}: InteractiveGiftProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    onComplete?.();
  };

  return (
    <>
      <FloatingHowItWorks title={"Interactive Gift - How it works"} steps={[{ title: 'Open', desc: 'Access the Interactive Gift section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Interactive Gift.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <GiftConfetti trigger={showConfetti} type="receive" />
      
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <InteractionComponent 
            type={interactionType} 
            onComplete={handleComplete}
            giftEmoji={giftEmoji}
          />
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center p-8"
          >
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[120px] drop-shadow-2xl"
            >
              {giftEmoji}
            </motion.div>
            <h2 className="text-white text-3xl font-bold mt-4">{giftLabel}</h2>
            {bonusValue && (
              <p className="text-amber-400 text-xl mt-2">
                🎉 Bonus: +{bonusValue} credits!
              </p>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="mt-6 bg-white text-gray-800 hover:bg-gray-100"
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

// Puzzle game component
const PuzzleGame = ({ onComplete, giftEmoji }: { onComplete: () => void; giftEmoji: string }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Shuffle pieces (3x3 = 9 pieces, 0-8)
    const shuffled = [...Array(9).keys()].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
  }, []);

  const handlePieceClick = (index: number) => {
    // Simple swap logic - find empty spot (8) and swap if adjacent
    const emptyIndex = pieces.indexOf(8);
    const isAdjacent = 
      (index === emptyIndex - 1 && emptyIndex % 3 !== 0) ||
      (index === emptyIndex + 1 && (emptyIndex + 1) % 3 !== 0) ||
      index === emptyIndex - 3 ||
      index === emptyIndex + 3;

    if (isAdjacent) {
      const newPieces = [...pieces];
      [newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]];
      setPieces(newPieces);
      setMoves(m => m + 1);

      // Check if solved
      if (newPieces.every((p, i) => p === i)) {
        setTimeout(onComplete, 500);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h3 className="text-white text-xl font-bold mb-4">🧩 Solve the Puzzle!</h3>
      <p className="text-white/60 mb-4">Arrange the numbers in order to reveal your gift</p>
      
      <div className="grid grid-cols-3 gap-1 w-48 h-48 mx-auto bg-white/10 rounded-xl p-2">
        {pieces.map((piece, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: piece !== 8 ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePieceClick(index)}
            className={`w-14 h-14 rounded-lg font-bold text-xl flex items-center justify-center ${
              piece === 8 
                ? "bg-transparent" 
                : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
            }`}
          >
            {piece !== 8 && piece + 1}
          </motion.button>
        ))}
      </div>
      
      <p className="text-white/60 mt-4">Moves: {moves}</p>
    </motion.div>
  );
};

// Scratch card component
const ScratchCard = ({ onComplete, giftEmoji }: { onComplete: () => void; giftEmoji: string }) => {
  const [scratched, setScratched] = useState<boolean[]>(Array(25).fill(false));
  const scratchedCount = scratched.filter(Boolean).length;
  const progress = (scratchedCount / 25) * 100;

  useEffect(() => {
    if (progress >= 70) {
      setTimeout(onComplete, 500);
    }
  }, [progress, onComplete]);

  const handleScratch = (index: number) => {
    const newScratched = [...scratched];
    newScratched[index] = true;
    // Also scratch adjacent cells for smoother effect
    if (index > 0) newScratched[index - 1] = true;
    if (index < 24) newScratched[index + 1] = true;
    if (index > 4) newScratched[index - 5] = true;
    if (index < 20) newScratched[index + 5] = true;
    setScratched(newScratched);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h3 className="text-white text-xl font-bold mb-4">🎫 Scratch to Reveal!</h3>
      <p className="text-white/60 mb-4">Scratch the card to see your gift</p>
      
      <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-amber-200 to-yellow-200">
        {/* Hidden gift */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl">{giftEmoji}</span>
        </div>
        
        {/* Scratch overlay */}
        <div className="absolute inset-0 grid grid-cols-5">
          {scratched.map((isScratched, index) => (
            <motion.div
              key={index}
              onMouseEnter={() => handleScratch(index)}
              onTouchStart={() => handleScratch(index)}
              animate={{ opacity: isScratched ? 0 : 1 }}
              className="bg-gradient-to-br from-gray-400 to-gray-600 cursor-pointer"
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4 w-64 mx-auto bg-white/20 rounded-full h-2">
        <div 
          className="bg-amber-400 h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/60 mt-2">{Math.round(progress)}% revealed</p>
    </motion.div>
  );
};

// Spin wheel component
const SpinWheel = ({ onComplete, giftEmoji }: { onComplete: () => void; giftEmoji: string }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const newRotation = rotation + 1440 + Math.random() * 720; // 4-6 full spins
    setRotation(newRotation);
    setTimeout(() => {
      setIsSpinning(false);
      onComplete();
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h3 className="text-white text-xl font-bold mb-4">🎡 Spin the Wheel!</h3>
      <p className="text-white/60 mb-4">Spin to reveal your gift</p>
      
      <div className="relative w-64 h-64 mx-auto">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-amber-400" />
        </div>
        
        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-full h-full rounded-full bg-gradient-conic from-amber-400 via-pink-400 via-purple-400 via-blue-400 via-green-400 to-amber-400 shadow-2xl flex items-center justify-center"
          style={{
            background: "conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #22c55e, #f59e0b)"
          }}
        >
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-inner">
            <span className="text-5xl">{giftEmoji}</span>
          </div>
        </motion.div>
      </div>
      
      <Button
        onClick={spin}
        disabled={isSpinning}
        className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
      >
        {isSpinning ? "Spinning..." : "SPIN!"}
      </Button>
    </motion.div>
  );
};

// Shake component
const ShakeGift = ({ onComplete, giftEmoji }: { onComplete: () => void; giftEmoji: string }) => {
  const [shakeCount, setShakeCount] = useState(0);
  const required = 10;

  useEffect(() => {
    if (shakeCount >= required) {
      setTimeout(onComplete, 500);
    }
  }, [shakeCount, onComplete]);

  const handleShake = () => {
    setShakeCount(c => Math.min(c + 1, required));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h3 className="text-white text-xl font-bold mb-4">📦 Shake to Open!</h3>
      <p className="text-white/60 mb-4">Tap the box repeatedly to open it</p>
      
      <motion.button
        onClick={handleShake}
        animate={shakeCount > 0 ? { 
          x: [0, -10, 10, -10, 10, 0],
          rotate: [0, -5, 5, -5, 5, 0]
        } : {}}
        transition={{ duration: 0.3 }}
        className="text-[120px] cursor-pointer"
      >
        🎁
      </motion.button>
      
      <div className="mt-4 w-48 mx-auto bg-white/20 rounded-full h-3">
        <motion.div 
          animate={{ width: `${(shakeCount / required) * 100}%` }}
          className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full"
        />
      </div>
      <p className="text-white/60 mt-2">{shakeCount}/{required} shakes</p>
    </motion.div>
  );
};

// Main interaction component selector
const InteractionComponent = ({ 
  type, 
  onComplete,
  giftEmoji 
}: { 
  type: string; 
  onComplete: () => void;
  giftEmoji: string;
}) => {
  switch (type) {
    case "puzzle":
      return <PuzzleGame onComplete={onComplete} giftEmoji={giftEmoji} />;
    case "scratch":
      return <ScratchCard onComplete={onComplete} giftEmoji={giftEmoji} />;
    case "spin":
      return <SpinWheel onComplete={onComplete} giftEmoji={giftEmoji} />;
    case "shake":
    default:
      return <ShakeGift onComplete={onComplete} giftEmoji={giftEmoji} />;
  }
};

export default InteractiveGift;
