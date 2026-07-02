import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Props {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

export const MultiQuestionQuiz = ({ questions, onComplete, onBack }: Props) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isComplete, setIsComplete] = useState(false);

  const question = questions[currentQ];

  useEffect(() => {
    if (answered || isComplete) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQ, answered, isComplete]);

  const handleTimeout = () => {
    setAnswered(true);
    toast.error("Time's up! ⏰");
  };

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setAnswered(true);
    const isCorrect = selected === question.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success("Correct! 🎉");
    } else {
      toast.error(`The answer was: ${question.correctAnswer}`);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      setTimer(30);
    } else {
      setIsComplete(true);
      const finalScore = score + (selected === question.correctAnswer && answered ? 0 : 0);
      if (finalScore >= questions.length * 0.8) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
      onComplete(score, questions.length);
    }
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 80 ? "⭐ Excellent!" : percentage >= 60 ? "👍 Good Job!" : "💪 Keep Practicing!";

    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="pt-8 text-center space-y-4">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5 }}
          >
            {percentage >= 80 ? "🏆" : percentage >= 60 ? "🎯" : "📚"}
          </motion.div>
          <h3 className="text-2xl font-black">{grade}</h3>
          <p className="text-muted-foreground">
            You got <span className="font-bold text-primary">{score}/{questions.length}</span> correct ({percentage}%)
          </p>
          <div className="w-full max-w-xs mx-auto">
            <Progress value={percentage} className="h-3" />
          </div>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Back to Reading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🎯 Quiz Time!
          </CardTitle>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            timer <= 10 ? "bg-red-500/20 text-red-600 animate-pulse" : "bg-muted text-muted-foreground"
          }`}>
            ⏱ {timer}s
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">{currentQ + 1}/{questions.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.p
          key={currentQ}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-sm"
        >
          {question.question}
        </motion.p>

        <div className="space-y-2">
          {question.options.map((option, i) => {
            let style = "border-border hover:border-primary/50";
            if (answered) {
              if (option === question.correctAnswer) {
                style = "border-green-500 bg-green-500/10";
              } else if (option === selected) {
                style = "border-red-500 bg-red-500/10";
              }
            } else if (option === selected) {
              style = "border-primary bg-primary/10";
            }

            return (
              <motion.button
                key={i}
                whileTap={!answered ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(option)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${style}`}
              >
                <span className="font-bold mr-2 text-muted-foreground">
                  {String.fromCharCode(65 + i)}.
                </span>
                {option}
              </motion.button>
            );
          })}
        </div>

        {!answered ? (
          <Button onClick={handleSubmit} disabled={!selected} className="w-full">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {currentQ < questions.length - 1 ? "Next Question →" : "See Results"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
