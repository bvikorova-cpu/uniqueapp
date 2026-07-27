import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Trophy, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function QuizList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: quizzes, isLoading } = useQuizzes();
  const { totalBalance, loading: creditsLoading, refresh } = useAICredits();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState("10");
  const [generating, setGenerating] = useState(false);

  const generateQuiz = async () => {
    const safeTopic = topic.trim();
    if (safeTopic.length < 2) {
      toast.error("Enter a quiz topic first");
      return;
    }
    if (totalBalance < 5) {
      toast.error("Not enough AI credits (5 needed)");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("education-ai", {
        body: {
          action: "generate_quiz",
          topic: safeTopic,
          numQuestions: Number(numQuestions),
          difficulty,
        },
      });
      if (error) {
        const ctx: any = (error as any)?.context;
        if (ctx?.status === 402 || (data as any)?.error === "Insufficient credits") {
          toast.error("Not enough AI credits (5 needed)");
          return;
        }
        throw error;
      }
      if ((data as any)?.error) throw new Error((data as any).error);

      await Promise.all([
        refresh(),
        queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
      ]);
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success("Quiz generated and saved");
      setTopic("");
      const quizId = (data as any)?.quizId;
      if (quizId) navigate(`/quiz/${quizId}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Quiz List works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="text-center py-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading quizzes...</p>
      </div>
      </>
      );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Available Quizzes
              </CardTitle>
              <CardDescription>Test your knowledge with interactive quizzes</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/quiz/create")} className="gap-2">
              <Plus className="h-4 w-4" /> Create Manually
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-primary/20 bg-muted/30 p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Generate AI Quiz
              </h3>
              <p className="text-sm text-muted-foreground">Creates and saves a quiz to your list. Cost: 5 AI credits.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-topic">Topic</Label>
                <Input
                  id="quiz-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value.slice(0, 200))}
                  placeholder="e.g. fractions, biology cells, European history"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quiz-difficulty">Difficulty</Label>
                  <select
                    id="quiz-difficulty"
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-count">Questions</Label>
                  <select
                    id="quiz-count"
                    value={numQuestions}
                    onChange={(event) => setNumQuestions(event.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="5">5 questions</option>
                    <option value="10">10 questions</option>
                    <option value="15">15 questions</option>
                    <option value="20">20 questions</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={generateQuiz}
                disabled={generating || creditsLoading || topic.trim().length < 2}
                className="w-full gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : "Generate Quiz"}
              </Button>
            </div>
          </div>

          {!quizzes || quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground mb-4">No quizzes available yet</p>
              <Button onClick={generateQuiz} disabled={generating || creditsLoading || topic.trim().length < 2} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {quizzes.map((quiz, i) => (
                <motion.div key={quiz.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/60 border-border/30">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{quiz.title}</CardTitle>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">Pass: {quiz.passing_score}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => navigate(`/quiz/${quiz.id}`)} className="w-full gap-2">
                        <Play className="h-4 w-4" /> Take Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
