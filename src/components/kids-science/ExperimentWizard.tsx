import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScienceCategorySelector } from "./ScienceCategorySelector";
import { DifficultySelector } from "./DifficultySelector";
import { Microscope, ArrowRight, ArrowLeft } from "lucide-react";

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
  { label: "Kategória", icon: "🔬" },
  { label: "Hypotéza", icon: "💡" },
  { label: "Pozorovania", icon: "👁️" },
  { label: "Analýza", icon: "🚀" },
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
        Krok {step + 1} z {steps.length}: <strong>{steps[step].label}</strong>
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
                disabled={!canAnalyze}
              />
              <DifficultySelector selected={difficulty} onSelect={setDifficulty} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                💡 Tvoja hypotéza
              </h3>
              <p className="text-sm text-muted-foreground">
                Čo si myslíš, že sa stane? Začni s "Myslím, že..."
              </p>
              <Textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Myslím, že keď..."
                className="min-h-[120px] text-base"
                disabled={!canAnalyze}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                👁️ Tvoje pozorovania
              </h3>
              <p className="text-sm text-muted-foreground">
                Čo si videl/a, počul/a alebo nameral/a? Buď čo najpresnejší/ia!
              </p>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Pozoroval/a som, že..."
                className="min-h-[120px] text-base"
                disabled={!canAnalyze}
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
              <h3 className="text-xl font-bold">Všetko je pripravené!</h3>
              <p className="text-muted-foreground">
                Kategória: <strong className="capitalize">{category}</strong> • 
                Hypotéza aj pozorovania sú vyplnené
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
                    AI analyzuje...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-5 w-5" />
                    Spustiť AI analýzu 🔬
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
          Späť
        </Button>
        {step < 3 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            Ďalej
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
