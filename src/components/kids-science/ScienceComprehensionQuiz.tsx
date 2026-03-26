import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const generateQuestions = (category: string): QuizQuestion[] => {
  const questions: Record<string, QuizQuestion[]> = {
    physics: [
      { question: "What is force?", options: ["An action on an object", "A type of energy", "A type of light"], correctIndex: 0 },
      { question: "What is gravity?", options: ["Magnetism", "Earth's attractive force", "A type of electricity"], correctIndex: 1 },
      { question: "What does a thermometer measure?", options: ["Mass", "Temperature", "Speed"], correctIndex: 1 },
    ],
    chemistry: [
      { question: "What is a chemical reaction?", options: ["Transformation of substances", "Change in temperature", "Movement of molecules"], correctIndex: 0 },
      { question: "What is H2O?", options: ["Oxygen", "Water", "Hydrogen"], correctIndex: 1 },
      { question: "What are atoms?", options: ["Large particles", "The smallest particles of elements", "A type of cell"], correctIndex: 1 },
    ],
    biology: [
      { question: "What is a cell?", options: ["The basic unit of life", "A type of energy", "A type of mineral"], correctIndex: 0 },
      { question: "What is photosynthesis?", options: ["Animal growth", "Food production by plants", "Breathing"], correctIndex: 1 },
      { question: "What is DNA?", options: ["A type of cell", "Genetic material", "A type of vitamin"], correctIndex: 1 },
    ],
    earth: [
      { question: "What are tectonic plates?", options: ["Layers of the atmosphere", "Pieces of Earth's crust", "Types of rocks"], correctIndex: 1 },
      { question: "What causes earthquakes?", options: ["Wind", "Plate movement", "Rain"], correctIndex: 1 },
      { question: "What is magma?", options: ["Cold rock", "Molten rock", "A type of mineral"], correctIndex: 1 },
    ],
    astronomy: [
      { question: "What is a star?", options: ["A planet", "A ball of glowing gas", "A moon"], correctIndex: 1 },
      { question: "What is a galaxy?", options: ["A single star", "A collection of billions of stars", "A planet"], correctIndex: 1 },
      { question: "What is the closest star to Earth?", options: ["Polaris", "Sirius", "The Sun"], correctIndex: 2 },
    ],
  };
  return questions[category] || questions.physics;
};

interface ScienceComprehensionQuizProps {
  category: string;
  onComplete: (score: number) => void;
}

export const ScienceComprehensionQuiz = ({ category, onComplete }: ScienceComprehensionQuizProps) => {
  const [questions] = useState(() => generateQuestions(category));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered !== null) return;
    setAnswered(index);
    const correct = index === questions[currentQ].correctIndex;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        onComplete(newScore * 5);
      }
    }, 1200);
  };

  if (finished) {
    return (
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
        <CardContent className="py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            {score === questions.length ? "🏆" : score >= 2 ? "🎉" : "📚"}
          </motion.div>
          <h3 className="text-xl font-bold mb-2">
            {score === questions.length ? "Perfect!" : score >= 2 ? "Great job!" : "Keep learning!"}
          </h3>
          <p className="text-muted-foreground">
            {score}/{questions.length} correct • <span className="text-emerald-500 font-bold">+{score * 5} XP</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentQ];

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🧠 Quiz — Did you understand?
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {currentQ + 1}/{questions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="font-semibold mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let variant = "";
                if (answered !== null) {
                  if (i === q.correctIndex) variant = "border-emerald-500 bg-emerald-500/20";
                  else if (i === answered) variant = "border-red-500 bg-red-500/20";
                }
                return (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => handleAnswer(i)}
                    disabled={answered !== null}
                    className={`w-full justify-start text-left h-auto py-3 ${variant}`}
                  >
                    {answered !== null && i === q.correctIndex && <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />}
                    {answered !== null && i === answered && i !== q.correctIndex && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                    {opt}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};