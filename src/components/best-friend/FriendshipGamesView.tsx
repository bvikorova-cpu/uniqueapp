import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gamepad2, Loader2, Trophy, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const FriendshipGamesView = () => {
  const [gameType, setGameType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "friendship_games", gameType },
      });
      if (error) throw error;
      setResult(data);
      setCurrentQ(0); setScore(0); setAnswered(null); setFinished(false);
      toast.success("Game created! (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const answer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    const q = result.questions[currentQ];
    if (idx === q.correct_answer) setScore(s => s + (q.points || 10));
  };

  const next = () => {
    if (currentQ < result.questions.length - 1) {
      setCurrentQ(c => c + 1);
      setAnswered(null);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Friendship Games View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <Gamepad2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">Friendship Mini-Games</h2>
        <p className="text-muted-foreground text-sm">Fun quizzes & challenges to enjoy with your AI friend</p>
        <Badge variant="secondary" className="mt-2">3 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Game theme (optional)</label>
              <Input value={gameType} onChange={(e) => setGameType(e.target.value)} placeholder="e.g., pop culture, science, friendship trivia..." />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gamepad2 className="h-4 w-4 mr-2" />}
              Start New Game
            </Button>
          </CardContent>
        </Card>
      ) : finished ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-yellow-500/15 to-orange-500/15 border-yellow-500/20">
            <CardContent className="p-8 text-center space-y-4">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto" />
              <h3 className="text-3xl font-black">{score} Points!</h3>
              <p className="text-muted-foreground">
                You got {result.questions.filter((_: any, i: number) => i < result.questions.length).length} questions
              </p>
              {result.bonus_challenge && (
                <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-left">
                  <p className="font-bold text-sm">🎯 Bonus Challenge</p>
                  <p className="text-sm text-muted-foreground">{result.bonus_challenge.challenge}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{result.bonus_challenge.difficulty}</Badge>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={generate} className="bg-gradient-to-r from-green-600 to-emerald-600">New Game</Button>
                <Button onClick={() => setResult(null)} variant="outline">Back</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Game Info */}
          {result.game && (
            <Card className="bg-card/80 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{result.game.name}</h3>
                  <p className="text-xs text-muted-foreground">{result.game.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-green-400">{score} pts</div>
                  <p className="text-xs text-muted-foreground">Q {currentQ + 1}/{result.questions?.length}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question */}
          {result.questions?.[currentQ] && (
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-6 space-y-4">
                  <p className="font-bold">{result.questions[currentQ].question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {result.questions[currentQ].options?.map((opt: string, i: number) => {
                      const correct = result.questions[currentQ].correct_answer;
                      let cls = "border-border/50 hover:border-purple-500/40";
                      if (answered !== null) {
                        if (i === correct) cls = "border-green-500 bg-green-500/10";
                        else if (i === answered) cls = "border-red-500 bg-red-500/10";
                      }
                      return (
                        <Button key={i} variant="outline" className={`justify-start h-auto py-3 px-4 ${cls}`}
                          onClick={() => answer(i)} disabled={answered !== null}>
                          <span className="flex items-center gap-2">
                            {answered !== null && i === correct && <Check className="h-4 w-4 text-green-400" />}
                            {answered !== null && i === answered && i !== correct && <X className="h-4 w-4 text-red-400" />}
                            {opt}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  {answered !== null && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">💡 {result.questions[currentQ].fun_fact}</p>
                      <Button onClick={next} className="w-full">
                        {currentQ < result.questions.length - 1 ? "Next Question" : "See Results"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
