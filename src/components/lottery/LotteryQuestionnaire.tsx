import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, ChevronRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Question {
  id: string;
  question: string;
  icon: string;
  options: { label: string; value: string; emoji: string }[];
}

const questions: Question[] = [
  {
    id: "frequency",
    question: "How often do you play the lottery?",
    icon: "🎰",
    options: [
      { label: "Daily", value: "daily", emoji: "📅" },
      { label: "Weekly", value: "weekly", emoji: "📆" },
      { label: "Monthly", value: "monthly", emoji: "🗓️" },
      { label: "Occasionally", value: "occasional", emoji: "🎲" },
    ],
  },
  {
    id: "strategy",
    question: "What's your number picking strategy?",
    icon: "🧠",
    options: [
      { label: "Random", value: "random", emoji: "🎯" },
      { label: "Statistics", value: "stats", emoji: "📊" },
      { label: "Lucky Numbers", value: "lucky", emoji: "🍀" },
      { label: "Mixed", value: "mixed", emoji: "🔀" },
    ],
  },
  {
    id: "preference",
    question: "Do you prefer hot or cold numbers?",
    icon: "🌡️",
    options: [
      { label: "Hot Numbers", value: "hot", emoji: "🔥" },
      { label: "Cold Numbers", value: "cold", emoji: "❄️" },
      { label: "Balanced", value: "balanced", emoji: "⚖️" },
      { label: "No Preference", value: "none", emoji: "🤷" },
    ],
  },
  {
    id: "budget",
    question: "What's your typical lottery budget?",
    icon: "💰",
    options: [
      { label: "Under €5", value: "low", emoji: "🪙" },
      { label: "€5-€20", value: "medium", emoji: "💵" },
      { label: "€20-€50", value: "high", emoji: "💶" },
      { label: "€50+", value: "premium", emoji: "💎" },
    ],
  },
  {
    id: "goal",
    question: "What's your primary goal?",
    icon: "🎯",
    options: [
      { label: "Fun", value: "fun", emoji: "🎉" },
      { label: "Analysis", value: "analysis", emoji: "🔬" },
      { label: "Tracking", value: "tracking", emoji: "📈" },
      { label: "Win Big", value: "win", emoji: "🏆" },
    ],
  },
];

export const LotteryQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setIsCompleted(true), 300);
    }
  };

  const resetQuestionnaire = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const currentQuestion = questions[currentStep];

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Questionnaire'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Questionnaire panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardList className="h-5 w-5 text-primary" /> Lottery Profile Quiz
        </CardTitle>
        <CardDescription>Personalize your AI predictions by answering a few questions</CardDescription>

        {/* Progress dots */}
        <div className="flex items-center gap-2 pt-3">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-center gap-1">
              <motion.div
                className={`w-8 h-2 rounded-full transition-all ${
                  i < currentStep || isCompleted
                    ? "bg-gradient-to-r from-primary to-accent"
                    : i === currentStep && !isCompleted
                    ? "bg-primary/50"
                    : "bg-muted/50"
                }`}
                animate={{ scale: i === currentStep && !isCompleted ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1, repeat: i === currentStep && !isCompleted ? Infinity : 0 }}
              />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-black text-lg mb-2">Profile Complete! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your AI predictions will now be personalized based on your preferences
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {Object.entries(answers).map(([qId, answer]) => {
                  const question = questions.find(q => q.id === qId);
                  const option = question?.options.find(o => o.value === answer);
                  return (
                    <div key={qId} className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-center">
                      <span className="text-lg">{option?.emoji}</span>
                      <p className="text-[10px] font-semibold mt-1">{option?.label}</p>
                    </div>
                  );
                })}
              </div>

              <Button onClick={resetQuestionnaire} variant="outline" size="sm" className="border-border/50">
                Retake Quiz
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{currentQuestion.icon}</span>
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">
                    Question {currentStep + 1}/{questions.length}
                  </Badge>
                  <h3 className="font-bold text-sm">{currentQuestion.question}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.value;
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <button
                        onClick={() => handleAnswer(currentQuestion.id, option.value)}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                            : "bg-card/60 border-border/30 hover:border-primary/20 hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{option.emoji}</span>
                          <span className="text-xs font-semibold">{option.label}</span>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← Back
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
  );
};
