import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Brain, Sparkles, RotateCcw, Eye, Hand, Ear, Wind as Nose, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const STEPS = [
  { count: 5, prompt: "Name 5 things you can SEE around you", icon: Eye, color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/5" },
  { count: 4, prompt: "Name 4 things you can TOUCH", icon: Hand, color: "text-green-400", bg: "from-green-500/10 to-emerald-500/5" },
  { count: 3, prompt: "Name 3 things you can HEAR", icon: Ear, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/5" },
  { count: 2, prompt: "Name 2 things you can SMELL", icon: Nose, color: "text-amber-400", bg: "from-amber-500/10 to-yellow-500/5" },
  { count: 1, prompt: "Name 1 thing you can TASTE", icon: Coffee, color: "text-rose-400", bg: "from-rose-500/10 to-pink-500/5" },
];

export function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[][]>(STEPS.map(() => []));
  const [currentInput, setCurrentInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const step = STEPS[currentStep];
  const currentAnswers = answers[currentStep];
  const StepIcon = step.icon;

  const handleAddAnswer = () => {
    if (!currentInput.trim()) return;
    const newAnswers = [...answers];
    newAnswers[currentStep] = [...currentAnswers, currentInput];
    setAnswers(newAnswers);
    setCurrentInput("");

    if (newAnswers[currentStep].length === step.count) {
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 600);
      } else {
        setIsComplete(true);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers(STEPS.map(() => []));
    setCurrentInput("");
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="GroundingExercise — How it works" steps={[{title:"Open this tool",desc:"Access GroundingExercise within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-primary/5 to-emerald-500/5" />
        <CardContent className="relative pt-8 text-center pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-black mb-2">Well Done!</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You've completed the 5-4-3-2-1 grounding exercise. Take a moment to notice how you feel — more present, more calm.
          </p>

          {/* Summary of answers */}
          <div className="space-y-3 mb-6 max-w-md mx-auto text-left">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 ${s.color} flex-shrink-0`} />
                  <p className="text-xs text-muted-foreground">
                    {answers[i].join(", ")}
                  </p>
                </div>
              );
            })}
          </div>

          <Button onClick={handleReset} className="gap-2 active:scale-[0.97] transition-transform">
            <RotateCcw className="w-4 h-4" /> Start Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className={`absolute inset-0 bg-gradient-to-br ${step.bg}`} />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          5-4-3-2-1 Grounding Exercise
        </CardTitle>
        <CardDescription>A mindfulness technique to bring you into the present moment and reduce anxiety</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Step progress */}
        <div className="flex gap-3 justify-center">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                animate={{ scale: idx === currentStep ? 1.15 : 1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  idx < currentStep
                    ? 'bg-green-500/20'
                    : idx === currentStep
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'bg-muted/30'
                }`}>
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Icon className={`w-5 h-5 ${idx === currentStep ? s.color : 'text-muted-foreground/50'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-bold ${idx === currentStep ? s.color : 'text-muted-foreground/50'}`}>
                  {s.count}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${step.bg} flex items-center justify-center mb-3`}>
              <StepIcon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-2">{step.prompt}</h3>
            <Badge variant="outline" className="text-xs">
              {currentAnswers.length} of {step.count} answers
            </Badge>
          </motion.div>
        </AnimatePresence>

        {/* Answers */}
        {currentAnswers.length > 0 && (
          <div className="space-y-2">
            {currentAnswers.map((answer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50"
              >
                <CheckCircle2 className={`w-4 h-4 ${step.color} flex-shrink-0`} />
                <span className="text-sm">{answer}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAnswer()}
            placeholder="Type your answer..."
            disabled={currentAnswers.length >= step.count}
            className="backdrop-blur-sm"
          />
          <Button
            onClick={handleAddAnswer}
            disabled={!currentInput.trim() || currentAnswers.length >= step.count}
            className="active:scale-[0.97] transition-transform"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
