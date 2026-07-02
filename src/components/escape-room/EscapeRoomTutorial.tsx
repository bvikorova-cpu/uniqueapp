import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MousePointer2, Eye, Package, Lightbulb, Clock, 
  ChevronRight, ChevronLeft, Play, Volume2
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    icon: <Eye className="h-12 w-12" />,
    title: "Rozhliadni sa",
    description: "Drag with the mouse or finger across the screen for a 360° view of the room. Use the mouse wheel or pinch gesture to zoom in.",
    tip: "💡 Try looking into all corners - some objects are hidden!"
  },
  {
    icon: <MousePointer2 className="h-12 w-12" />,
    title: "Klikaj na objekty",
    description: "Colored dots indicate interactive objects. Click on them to interact - you can find items, clues, or puzzles.",
    tip: "🔍 Orange = puzzles, Blue = items, Turquoise = clues"
  },
  {
    icon: <Package className="h-12 w-12" />,
    title: "Zbieraj predmety",
    description: "Found items are stored in your inventory. Select an item from your inventory and click on the lock to use it.",
    tip: "🎒 Every item has its purpose - read the description carefully!"
  },
  {
    icon: <Lightbulb className="h-12 w-12" />,
    title: "Solve puzzles",
    description: "Puzzles can be ciphers, math problems, or logic riddles. If you're stuck, use a hint.",
    tip: "🧩 Clues in the room often hint at the solution!"
  },
  {
    icon: <Clock className="h-12 w-12" />,
    title: "Time and score",
    description: "The faster you escape and the fewer hints you use, the higher your score will be. Compete with others!",
    tip: "🏆 The best score will be recorded on the leaderboard!"
  }
];

interface EscapeRoomTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EscapeRoomTutorial({ onComplete, onSkip }: EscapeRoomTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <>
      <FloatingHowItWorks title={"Escape Room Tutorial - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Room Tutorial section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape Room Tutorial.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <div className="max-w-lg w-full mx-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep 
                  ? 'w-8 bg-primary' 
                  : idx < currentStep 
                    ? 'w-2 bg-primary/60' 
                    : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 shadow-2xl"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 rounded-full bg-primary/20 text-primary">
                {step.icon}
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-center mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Tip box */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-200 text-sm text-center">
                {step.tip}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {isLastStep ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start game!
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-white/50 hover:text-white/80"
          >
            Skip tutorial
          </Button>
        </motion.div>

        {/* Sound hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-4 text-white/40 text-sm"
        >
          <Volume2 className="h-4 w-4" />
          <span>For a better experience, turn on sound</span>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}

export default EscapeRoomTutorial;
