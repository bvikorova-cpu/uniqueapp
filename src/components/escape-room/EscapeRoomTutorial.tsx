import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MousePointer2, Eye, Package, Lightbulb, Clock, 
  ChevronRight, ChevronLeft, Play, Volume2
} from "lucide-react";

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
    description: "Ťahaj myšou alebo prstom po obrazovke pre 360° pohľad po miestnosti. Používaj koliesko myši alebo pinch gesto pre priblíženie.",
    tip: "💡 Skús sa pozrieť do všetkých kútov - niektoré predmety sú skryté!"
  },
  {
    icon: <MousePointer2 className="h-12 w-12" />,
    title: "Klikaj na objekty",
    description: "Farebné body označujú interaktívne objekty. Klikni na ne pre interakciu - môžeš nájsť predmety, stopy alebo hádanky.",
    tip: "🔍 Oranžové = hádanky, Modré = predmety, Tyrkysové = stopy"
  },
  {
    icon: <Package className="h-12 w-12" />,
    title: "Zbieraj predmety",
    description: "Nájdené predmety sa uložia do inventára. Vyber predmet z inventára a klikni na zámok pre jeho použitie.",
    tip: "🎒 Každý predmet má svoj účel - dobre si prečítaj popis!"
  },
  {
    icon: <Lightbulb className="h-12 w-12" />,
    title: "Rieš hádanky",
    description: "Hádanky môžu byť šifry, matematické úlohy alebo logické rébusy. Ak si zaseknutý, použi nápovedu.",
    tip: "🧩 Stopy v miestnosti ti často napovedajú riešenie!"
  },
  {
    icon: <Clock className="h-12 w-12" />,
    title: "Čas a skóre",
    description: "Čím rýchlejšie unikneš a čím menej nápoved použiješ, tým vyššie bude tvoje skóre. Súťaž s ostatnými!",
    tip: "🏆 Najlepšie skóre sa zapíše do rebríčka!"
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
                  Späť
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {isLastStep ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Začať hru!
                  </>
                ) : (
                  <>
                    Ďalej
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
            Preskočiť tutoriál
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
          <span>Pre lepší zážitok zapni zvuk</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default EscapeRoomTutorial;
