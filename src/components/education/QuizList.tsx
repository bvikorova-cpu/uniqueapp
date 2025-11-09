import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function QuizList() {
  const navigate = useNavigate();
  const { data: quizzes, isLoading } = useQuizzes();

  if (isLoading) {
    return <div className="text-center py-8">Loading quizzes...</div>;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Available Quizzes</CardTitle>
            <CardDescription>Test your knowledge with interactive quizzes</CardDescription>
          </div>
          <Button onClick={() => navigate("/quiz/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!quizzes || quizzes.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No quizzes available yet</p>
            <Button onClick={() => navigate("/quiz/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Quiz
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover-scale">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">
                      Pass: {quiz.passing_score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
