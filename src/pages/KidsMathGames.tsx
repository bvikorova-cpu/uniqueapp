import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Trophy, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const KidsMathGames = () => {
  const [gameType, setGameType] = useState<string | null>(null);
  const [problem, setProblem] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  const startGame = async (type: string) => {
    setGameType(type);
    setScore(0);
    setLevel(1);
    loadNewProblem(type, 1);
  };

  const loadNewProblem = async (type: string, currentLevel: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-math-game', {
        body: { gameType: type, level: currentLevel }
      });

      if (error) throw error;
      setProblem(data.problem);
      setAnswer("");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to load problem");
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!problem || !answer) return;

    const isCorrect = parseInt(answer) === problem.answer;
    
    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      toast.success("Correct! 🎉 +10 points");
      
      if (newScore % 50 === 0) {
        const newLevel = level + 1;
        setLevel(newLevel);
        toast.success(`Level Up! Now at Level ${newLevel} 🌟`);
      }
      
      if (gameType) {
        loadNewProblem(gameType, level);
      }
    } else {
      toast.error(`Not quite! The answer was ${problem.answer}. Try the next one! 💪`);
      if (gameType) {
        loadNewProblem(gameType, level);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Math Games 🎮
            </h1>
            <p className="text-muted-foreground">
              Practice math with your AI teacher!
            </p>
          </div>

          {!gameType ? (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('addition')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-500" />
                    Addition Game
                  </CardTitle>
                  <CardDescription>Practice adding numbers!</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('subtraction')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-500" />
                    Subtraction Game
                  </CardTitle>
                  <CardDescription>Practice subtracting numbers!</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('multiplication')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-500" />
                    Multiplication Game
                  </CardTitle>
                  <CardDescription>Practice times tables!</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('division')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-orange-500" />
                    Division Game
                  </CardTitle>
                  <CardDescription>Practice dividing numbers!</CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-background/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Score: {score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Level: {level}</span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {loading ? "Loading..." : problem?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    className="w-full text-center text-2xl p-4 border rounded-lg bg-background text-foreground"
                    placeholder="Your answer"
                    disabled={loading}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={checkAnswer} disabled={loading || !answer} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Check Answer
                    </Button>
                    <Button variant="outline" onClick={() => setGameType(null)} className="w-full">
                      Change Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsMathGames;