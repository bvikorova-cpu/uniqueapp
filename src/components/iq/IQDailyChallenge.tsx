import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, CheckCircle2, XCircle, Sparkles, Gift } from "lucide-react";

const dailyQuestions = [
  {
    question: "What comes next in the sequence: 2, 6, 18, 54, ?",
    options: ["108", "162", "148", "216"],
    correct: 1,
    explanation: "Each number is multiplied by 3. 54 × 3 = 162.",
    category: "Pattern Recognition"
  },
  {
    question: "If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely Lazzles?",
    options: ["True", "False", "Cannot determine", "Sometimes"],
    correct: 0,
    explanation: "This is a classic syllogism. If A⊂B and B⊂C, then A⊂C.",
    category: "Logical Reasoning"
  },
  {
    question: "Which shape completes the pattern? ○ □ △ ○ □ ?",
    options: ["○", "□", "△", "◇"],
    correct: 2,
    explanation: "The pattern repeats: circle, square, triangle. The next shape is triangle.",
    category: "Pattern Recognition"
  },
];

export default function IQDailyChallenge() {
  const [started, setStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Deterministic daily question based on date
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % dailyQuestions.length;
  const question = dailyQuestions[dayIndex];

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setSelectedAnswer(idx);
    setRevealed(true);
  };

  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🎯 Daily Challenge</h2>
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {!started ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-black mb-1">Today's Brain Challenge</h3>
              <p className="text-sm text-muted-foreground mb-1">One free question every day to keep your brain sharp!</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><Gift className="h-3 w-3 mr-1" /> FREE</Badge>
                <Badge variant="outline" className="text-xs">{question.category}</Badge>
              </div>
              <Button onClick={() => setStarted(true)} className="bg-gradient-to-r from-amber-600 to-orange-600">
                <Sparkles className="h-4 w-4 mr-2" /> Start Challenge
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-xs">{question.category}</Badge>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">FREE</Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-4">{question.question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {question.options.map((opt, idx) => {
                  let classes = "p-3 rounded-lg border text-sm font-medium text-left transition-all ";
                  if (revealed) {
                    if (idx === question.correct) classes += "border-green-500 bg-green-500/10 text-green-600";
                    else if (idx === selectedAnswer) classes += "border-red-500 bg-red-500/10 text-red-600";
                    else classes += "border-border/30 opacity-50";
                  } else {
                    classes += "border-border/30 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer";
                  }
                  return (
                    <motion.button
                      key={idx}
                      whileTap={!revealed ? { scale: 0.97 } : undefined}
                      onClick={() => handleAnswer(idx)}
                      className={classes}
                    >
                      <span className="mr-2 font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                      {revealed && idx === question.correct && <CheckCircle2 className="h-4 w-4 inline ml-2 text-green-500" />}
                      {revealed && idx === selectedAnswer && idx !== question.correct && <XCircle className="h-4 w-4 inline ml-2 text-red-500" />}
                    </motion.button>
                  );
                })}
              </div>
              {revealed && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-muted/50 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <Badge className="bg-green-500 text-white">✓ Correct!</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Incorrect</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{question.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
