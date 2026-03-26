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

// Generate simple questions based on result
const generateQuestions = (category: string): QuizQuestion[] => {
  const questions: Record<string, QuizQuestion[]> = {
    physics: [
      { question: "Čo je sila?", options: ["Pôsobenie na teleso", "Druh energie", "Typ svetla"], correctIndex: 0 },
      { question: "Čo je gravitácia?", options: ["Magnetizmus", "Príťažlivá sila Zeme", "Typ elektriny"], correctIndex: 1 },
      { question: "Čo meria teplomer?", options: ["Hmotnosť", "Teplotu", "Rýchlosť"], correctIndex: 1 },
    ],
    chemistry: [
      { question: "Čo je chemická reakcia?", options: ["Premena látok", "Zmena teploty", "Pohyb molekúl"], correctIndex: 0 },
      { question: "Čo je H2O?", options: ["Kyslík", "Voda", "Vodík"], correctIndex: 1 },
      { question: "Čo sú atómy?", options: ["Veľké častice", "Najmenšie častice prvkov", "Typ buniek"], correctIndex: 1 },
    ],
    biology: [
      { question: "Čo je bunka?", options: ["Základná jednotka života", "Typ energie", "Druh minerálu"], correctIndex: 0 },
      { question: "Čo je fotosyntéza?", options: ["Rast zvierat", "Tvorba potravy rastlinami", "Dýchanie"], correctIndex: 1 },
      { question: "Čo je DNA?", options: ["Typ bunky", "Genetický materiál", "Druh vitamínu"], correctIndex: 1 },
    ],
    earth: [
      { question: "Čo sú tektonické dosky?", options: ["Vrstvy atmosféry", "Kusy zemskej kôry", "Typy hornín"], correctIndex: 1 },
      { question: "Čo spôsobuje zemetrasenia?", options: ["Vietor", "Pohyb dosiek", "Dážď"], correctIndex: 1 },
      { question: "Čo je magma?", options: ["Studená hornina", "Roztavená hornina", "Typ minerálu"], correctIndex: 1 },
    ],
    astronomy: [
      { question: "Čo je hviezda?", options: ["Planéta", "Guľa žiariaceho plynu", "Mesiac"], correctIndex: 1 },
      { question: "Čo je galaxia?", options: ["Jedna hviezda", "Zoskupenie miliárd hviezd", "Planéta"], correctIndex: 1 },
      { question: "Aká je najbližšia hviezda k Zemi?", options: ["Polárka", "Sirius", "Slnko"], correctIndex: 2 },
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
            {score === questions.length ? "Perfektné!" : score >= 2 ? "Skvelé!" : "Pokračuj v učení!"}
          </h3>
          <p className="text-muted-foreground">
            {score}/{questions.length} správne • <span className="text-emerald-500 font-bold">+{score * 5} XP</span>
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
          🧠 Kvíz — Pochopil/a si?
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
