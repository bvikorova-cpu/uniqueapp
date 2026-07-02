import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScienceCategorySelector } from "./ScienceCategorySelector";
import { DifficultySelector } from "./DifficultySelector";
import { Microscope, ArrowRight, ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ExperimentWizardProps {
  category: string;
  setCategory: (v: string) => void;
  hypothesis: string;
  setHypothesis: (v: string) => void;
  observations: string;
  setObservations: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  canAnalyze: boolean;
}

const steps = [
  { label: "Category", icon: "🔬" },
  { label: "Hypothesis", icon: "💡" },
  { label: "Observations", icon: "👁️" },
  { label: "Analysis", icon: "🚀" },
];

export const ExperimentWizard = ({
  category, setCategory,
  hypothesis, setHypothesis,
  observations, setObservations,
  difficulty, setDifficulty,
  onAnalyze, loading, canAnalyze,
}: ExperimentWizardProps) => {
  const [step, setStep] = useState(0);

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return hypothesis.trim().length > 5;
    if (step === 2) return observations.trim().length > 5;
    return true;
  };

  return (
    <>
      <FloatingHowItWorks title={"Experiment Wizard - How it works"} steps={[{ title: 'Open', desc: 'Access the Experiment Wizard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Experiment Wizard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all
                ${i <= step ? "bg-emerald-500/20 border-emerald-500 text-emerald-600" : "bg-muted border-border text-muted-foreground"}
              `}
              animate={i === step ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: i === step ? Infinity : 0 }}
            >
              {s.icon}
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-all ${i < step ? "bg-emerald-500" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Step {step + 1} of {steps.length}: <strong>{steps[step].label}</strong>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && (
            <div className="space-y-6">
              <ScienceCategorySelector
                selected={category}
                onSelect={setCategory}
              />
              <DifficultySelector selected={difficulty} onSelect={setDifficulty} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                💡 Your Hypothesis
              </h3>
              <p className="text-sm text-muted-foreground">
                What do you think will happen? Start with "I think that..."
              </p>
              <Textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="I think that when..."
                className="min-h-[120px] text-base"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                👁️ Your Observations
              </h3>
              <p className="text-sm text-muted-foreground">
                What did you see, hear, or measure? Be as precise as possible!
              </p>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="I observed that..."
                className="min-h-[120px] text-base"
              />
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-6">
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🚀
              </motion.div>
              <h3 className="text-xl font-bold">Everything is ready!</h3>
              <p className="text-muted-foreground">
                Category: <strong className="capitalize">{category}</strong> • 
                Hypothesis and observations are filled in
              </p>
              <Button
                size="lg"
                onClick={onAnalyze}
                disabled={loading || !canAnalyze}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
              >
                {loading ? (
                  <>
                    <Microscope className="mr-2 h-5 w-5 animate-spin" />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-5 w-5" />
                    Run AI Analysis 🔬
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < 3 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
    </>
  );
};