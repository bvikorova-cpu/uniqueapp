import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CastleQuizProps {
  castleName: string;
  funFacts: string[];
  onComplete: (score: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

// Generate quiz questions from fun facts
function generateQuestions(castleName: string, funFacts: string[]) {
  const questions = [
    {
      q: `Which castle did you just explore?`,
      options: [castleName, "Hogwarts Castle", "Buckingham Palace", "Neuschwanstein"],
      correct: 0,
    },
    {
      q: `How many fairy castles exist around the world?`,
      options: ["4", "6", "8", "10"],
      correct: 1,
    },
    {
      q: `What can you find inside fairy castles?`,
      options: ["Real dragons", "Magical rooms & galleries", "A swimming pool", "A spaceship"],
      correct: 1,
    },
  ];
  return questions;
}

export function CastleQuiz({ castleName, funFacts, onComplete, isVisible, onClose }: CastleQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const questions = generateQuestions(castleName, funFacts);
  const q = questions[currentQ];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correct;
    if (isCorrect) setScore(s => s + 1);

    setShowResult(true);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setFinished(true);
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <>
      <FloatingHowItWorks title={"Castle Quiz - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Quiz section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Quiz.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card rounded-3xl border border-border/50 p-8 max-w-lg w-full shadow-2xl"
      >
        {!finished ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg">Castle Quiz</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentQ + 1}/{questions.length}
              </span>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-muted/50 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            <p className="text-lg font-semibold mb-6">{q.q}</p>

            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={selected === null ? { scale: 1.02 } : {}}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected === idx
                      ? idx === q.correct
                        ? "border-green-500 bg-green-500/10"
                        : "border-red-500 bg-red-500/10"
                      : selected !== null && idx === q.correct
                      ? "border-green-500 bg-green-500/10"
                      : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opt}</span>
                    {showResult && idx === q.correct && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showResult && selected === idx && idx !== q.correct && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="text-6xl mb-4">
              {score === questions.length ? "🎉" : score >= 2 ? "⭐" : "📚"}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {score === questions.length ? "Perfect Score!" : score >= 2 ? "Great Job!" : "Keep Learning!"}
            </h3>
            <p className="text-muted-foreground mb-2">
              You got {score}/{questions.length} correct
            </p>
            <p className="text-amber-600 dark:text-amber-400 font-bold mb-6">
              +{score * 10} XP earned! 🌟
            </p>
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Award className="mr-2 h-4 w-4" /> Continue
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
    </>
  );
}
