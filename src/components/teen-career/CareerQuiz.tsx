import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CareerQuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

export interface QuizAnswers {
  interests: string[];
  workStyle: string[];
  values: string[];
  subjects: string[];
}

const questions = [
  {
    title: "What excites you the most?",
    subtitle: "Pick all that apply",
    key: "interests" as const,
    options: [
      { emoji: "💻", label: "Technology & Coding" },
      { emoji: "🎨", label: "Art & Design" },
      { emoji: "🔬", label: "Science & Research" },
      { emoji: "🏥", label: "Helping People" },
      { emoji: "📊", label: "Business & Money" },
      { emoji: "🎬", label: "Entertainment & Media" },
      { emoji: "🌍", label: "Travel & Nature" },
      { emoji: "⚖️", label: "Law & Justice" },
    ],
  },
  {
    title: "How do you prefer to work?",
    subtitle: "Pick all that apply",
    key: "workStyle" as const,
    options: [
      { emoji: "👥", label: "In a team" },
      { emoji: "🧘", label: "Independently" },
      { emoji: "🏠", label: "From home" },
      { emoji: "✈️", label: "Traveling" },
      { emoji: "🎤", label: "Leading others" },
      { emoji: "🔧", label: "Hands-on work" },
    ],
  },
  {
    title: "What matters most to you?",
    subtitle: "Pick your top values",
    key: "values" as const,
    options: [
      { emoji: "💰", label: "High salary" },
      { emoji: "❤️", label: "Making a difference" },
      { emoji: "🎯", label: "Work-life balance" },
      { emoji: "🚀", label: "Innovation" },
      { emoji: "🏆", label: "Recognition" },
      { emoji: "📚", label: "Continuous learning" },
    ],
  },
  {
    title: "Favorite school subjects?",
    subtitle: "Pick all that apply",
    key: "subjects" as const,
    options: [
      { emoji: "📐", label: "Math" },
      { emoji: "🧪", label: "Science" },
      { emoji: "📖", label: "Languages" },
      { emoji: "🎭", label: "Arts & Drama" },
      { emoji: "💻", label: "Computer Science" },
      { emoji: "🏃", label: "Physical Education" },
      { emoji: "📜", label: "History" },
      { emoji: "🎵", label: "Music" },
    ],
  },
];

export const CareerQuiz = ({ onComplete }: CareerQuizProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    interests: [],
    workStyle: [],
    values: [],
    subjects: [],
  });

  const question = questions[currentQ];

  const toggleOption = (label: string) => {
    setAnswers(prev => {
      const key = question.key;
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(label)
          ? current.filter(v => v !== label)
          : [...current, label],
      };
    });
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      onComplete(answers);
    }
  };

  const selectedCount = answers[question.key].length;

  return (
    <>
      <FloatingHowItWorks title={"Career Quiz - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Quiz section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Quiz.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentQ ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold">{question.title}</h3>
              <p className="text-sm text-muted-foreground">{question.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {question.options.map((opt) => {
                const isSelected = answers[question.key].includes(opt.label);
                return (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleOption(opt.label)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-xs sm:text-sm">{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <Button
              onClick={handleNext}
              disabled={selectedCount === 0}
              className="w-full gap-2"
            >
              {currentQ < questions.length - 1 ? (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Complete Quiz
                </>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
  );
};
