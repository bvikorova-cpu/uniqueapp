import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, Star, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ComprehensionQuizProps {
  subject: string;
  question?: string;
  explanation?: string;
}

// Generate simple quiz questions based on subject
function generateQuizQuestions(subject: string): Array<{ question: string; options: string[]; correct: number }> {
  const quizzes: Record<string, Array<{ question: string; options: string[]; correct: number }>> = {
    math: [
      { question: "What is 7 × 8?", options: ["54", "56", "48", "64"], correct: 1 },
      { question: "Which number is a prime number?", options: ["4", "6", "7", "9"], correct: 2 },
      { question: "What is 100 ÷ 4?", options: ["20", "25", "30", "15"], correct: 1 },
    ],
    science: [
      { question: "What gas do plants need to grow?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correct: 1 },
      { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1 },
      { question: "What is H₂O?", options: ["Salt", "Sugar", "Water", "Air"], correct: 2 },
    ],
    english: [
      { question: "Which is a noun?", options: ["Run", "Happy", "Cat", "Quickly"], correct: 2 },
      { question: "What is a synonym of 'big'?", options: ["Small", "Large", "Fast", "Slow"], correct: 1 },
      { question: "Which sentence is correct?", options: ["They're going.", "Their going.", "There going.", "Thier going."], correct: 0 },
    ],
    history: [
      { question: "Where were the ancient pyramids built?", options: ["Greece", "Egypt", "Rome", "China"], correct: 1 },
      { question: "Who was the first president of the USA?", options: ["Lincoln", "Jefferson", "Washington", "Adams"], correct: 2 },
      { question: "What year did WWII end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
    ],
    geography: [
      { question: "What is the largest continent?", options: ["Africa", "Europe", "Asia", "America"], correct: 2 },
      { question: "What is the longest river?", options: ["Amazon", "Nile", "Mississippi", "Danube"], correct: 1 },
      { question: "Which ocean is the biggest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
    ],
  };
  return quizzes[subject] || quizzes.math;
}

export const ComprehensionQuiz = ({ subject }: ComprehensionQuizProps) => {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = generateQuizQuestions(subject);

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    
    setTimeout(() => {
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);
      
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct).length;
  const totalXP = correctCount * 5;

  if (!started) {
    return (
    <>
      <FloatingHowItWorks title={"Comprehension Quiz - How it works"} steps={[{ title: 'Open', desc: 'Access the Comprehension Quiz section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comprehension Quiz.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardContent className="py-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl mb-3"
          >
            🧠
          </motion.div>
          <h3 className="font-bold text-foreground mb-2">Did you understand? Let's check!</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Take a quick {questions.length}-question quiz to earn bonus XP!
          </p>
          <Button onClick={() => setStarted(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Brain className="w-4 h-4 mr-2" />
            Start Quiz (+{questions.length * 5} XP possible)
          </Button>
        </CardContent>
      </Card>
    </>
  );
  }

  if (showResult) {
    return (
      <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <CardContent className="py-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-5xl mb-3"
          >
            {correctCount === questions.length ? "🏆" : correctCount > 0 ? "⭐" : "💪"}
          </motion.div>
          <h3 className="text-xl font-black text-foreground mb-1">
            {correctCount}/{questions.length} Correct!
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {correctCount === questions.length
              ? "Perfect score! You're a genius! 🎉"
              : correctCount > 0
              ? "Great effort! Keep learning! 📚"
              : "Don't worry, practice makes perfect! 💪"}
          </p>
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
            <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
            +{totalXP} XP earned
          </Badge>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStarted(false); setCurrentQ(0); setAnswers([]); setSelectedOption(null); setShowResult(false); }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentQ];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Question {currentQ + 1}/{questions.length}
          </span>
          <Badge variant="outline" className="text-xs">
            +5 XP each
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-semibold text-foreground">{q.question}</p>
        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === q.correct;
            const showFeedback = selectedOption !== null;

            return (
              <motion.button
                key={i}
                whileHover={!showFeedback ? { scale: 1.02 } : {}}
                whileTap={!showFeedback ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={showFeedback}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                  showFeedback && isCorrect
                    ? "border-green-500 bg-green-500/10 text-green-700"
                    : showFeedback && isSelected && !isCorrect
                    ? "border-red-500 bg-red-500/10 text-red-700"
                    : "border-border/50 bg-card/50 hover:border-primary/30 text-foreground"
                }`}
              >
                {showFeedback && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                {!showFeedback && <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                {opt}
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
