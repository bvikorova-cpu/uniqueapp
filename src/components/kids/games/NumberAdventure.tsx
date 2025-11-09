import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface NumberAdventureProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const generateProblem = (level: number) => {
  const operations = ["+", "-", "×"];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1, num2, answer;
  
  if (operation === "+") {
    num1 = Math.floor(Math.random() * (10 * level)) + 1;
    num2 = Math.floor(Math.random() * (10 * level)) + 1;
    answer = num1 + num2;
  } else if (operation === "-") {
    answer = Math.floor(Math.random() * (10 * level)) + 1;
    num2 = Math.floor(Math.random() * answer) + 1;
    num1 = answer + num2;
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * (5 * level)) + 1;
    num2 = Math.floor(Math.random() * (5 * level)) + 1;
    answer = num1 * num2;
  }
  
  return { num1, num2, operation, answer };
};

export const NumberAdventure = ({ onComplete, onBack }: NumberAdventureProps) => {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(generateProblem(1));
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const totalProblems = 10;

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) {
      toast.error("Zadaj číslo!");
      return;
    }

    if (answer === problem.answer) {
      const points = 10 + streak * 5;
      setScore(score + points);
      setStreak(streak + 1);
      setProblemsSolved(problemsSolved + 1);
      toast.success(`Správne! +${points} bodov (${streak + 1}× v rade)`);

      if (problemsSolved + 1 >= totalProblems) {
        setTimeout(() => onComplete(score + points), 1500);
      } else {
        if ((problemsSolved + 1) % 3 === 0) {
          setLevel(level + 1);
          toast.success("Úroveň zvýšená! 🎉");
        }
        setProblem(generateProblem(level));
        setUserAnswer("");
      }
    } else {
      setStreak(0);
      toast.error(`Nesprávne! Správna odpoveď je ${problem.answer}`);
      setTimeout(() => {
        setProblem(generateProblem(level));
        setUserAnswer("");
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť
          </Button>
          <div className="flex gap-6 text-lg font-bold">
            <span className="text-purple-600">Úroveň: {level}</span>
            <span className="text-green-600">Skóre: {score}</span>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Number Adventure 🔢
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Príklad {problemsSolved + 1} z {totalProblems}
            </p>

            {streak > 0 && (
              <div className="text-center mb-6">
                <span className="inline-block px-6 py-2 bg-yellow-200 text-yellow-800 rounded-full font-bold text-lg animate-pulse">
                  🔥 {streak}× v rade!
                </span>
              </div>
            )}

            <div className="mb-8 p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl border-4 border-purple-300">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 mb-6 flex items-center justify-center gap-4">
                  <span>{problem.num1}</span>
                  <span className="text-5xl">{problem.operation}</span>
                  <span>{problem.num2}</span>
                  <span className="text-5xl">=</span>
                  <span className="text-red-600">?</span>
                </div>

                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tvoja odpoveď"
                  className="w-64 h-16 text-3xl text-center border-4 border-purple-400 rounded-xl focus:border-purple-600 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="text-xl px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Skontrolovať
              </Button>
              <Button
                onClick={() => {
                  setProblem(generateProblem(level));
                  setUserAnswer("");
                }}
                variant="outline"
                className="text-xl px-8 py-6 border-2"
              >
                Preskočiť
              </Button>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {[...Array(totalProblems)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    i < problemsSolved
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
