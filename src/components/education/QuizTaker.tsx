import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuiz, useSubmitQuizAttempt, useQuizAttempts } from "@/hooks/useQuizzes";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Trophy, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuiz(quizId);
  const submitAttempt = useSubmitQuizAttempt();
  const { data: attempts } = useQuizAttempts(quizId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    if (!timerActive) return;
    
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (!data?.quiz || !data.questions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  const { quiz, questions } = data;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);

    await submitAttempt.mutateAsync({
      quizId: quiz.id,
      answers,
      score,
      passed,
    });

    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (showResults) {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);

    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {passed ? (
                  <Trophy className="h-20 w-20 text-yellow-500" />
                ) : (
                  <XCircle className="h-20 w-20 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {passed ? "Congratulations!" : "Keep Practicing"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                You scored {score}% (Passing: {quiz.passing_score}%)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span>Correct Answers:</span>
                  <Badge variant={passed ? "default" : "secondary"}>
                    {correct} / {questions.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Time Taken:</span>
                  <Badge variant="outline">{formatTime(timeElapsed)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Previous Attempts:</span>
                  <Badge variant="outline">{attempts?.length || 0}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Review Answers</h3>
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correct_answer;

                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">Question {index + 1}</p>
                            <p className="text-sm">{question.question}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Your answer:</span>{" "}
                            <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                              {userAnswer || "Not answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-medium">Correct answer:</span>{" "}
                              <span className="text-green-600">
                                {question.correct_answer}
                              </span>
                            </p>
                          )}
                        </div>
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground">
                            💡 {question.explanation}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/education")}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>{quiz.title}</CardTitle>
              <Badge variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{question.question}</h3>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {(question.options as string[]).map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                Previous
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="flex-1"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {Object.keys(answers).length} / {questions.length} questions answered
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
