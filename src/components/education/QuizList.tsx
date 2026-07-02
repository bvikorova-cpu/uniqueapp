import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function QuizList() {
  const navigate = useNavigate();
  const { data: quizzes, isLoading } = useQuizzes();

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
            <Button onClick={() => navigate("/quiz/create")} className="gap-2">
              <Plus className="h-4 w-4" /> Create Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!quizzes || quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground mb-4">No quizzes available yet</p>
              <Button onClick={() => navigate("/quiz/create")} className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Quiz
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
