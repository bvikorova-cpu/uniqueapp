import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Award, CheckCircle, XCircle, ChevronRight } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Quiz {
  id: string;
  title: string;
  passing_score: number;
}

interface Question {
  id: string;
  question: string;
  options: any;
  correct_answer: string;
  order_index: number;
}

interface QuizTakerProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  userId: string;
  onComplete: () => void;
}

export function QuizTaker({ isOpen, onClose, quiz, userId, onComplete }: QuizTakerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
    setScore(scorePercentage);
    setShowResults(true);

    // Save quiz attempt
    try {
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: quiz.id,
        score: scorePercentage,
        passed: scorePercentage >= quiz.passing_score,
        answers: answers,
      });

      if (error) throw error;

      if (scorePercentage >= quiz.passing_score) {
        toast({
          title: "Quiz Passed! 🎉",
          description: `You scored ${scorePercentage}%! Great job!`,
        });
        onComplete();
      } else {
        toast({
          title: "Keep Trying!",
          description: `You scored ${scorePercentage}%. You need ${quiz.passing_score}% to pass.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Quiz Taker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading quiz...</p>
          </div>
        </DialogContent>
      </Dialog>
      </>
      );
  }

  if (questions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Questions Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">This quiz doesn't have any questions yet.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        {showResults ? (
          // Results View
          <div className="space-y-6">
            <Card className={score >= quiz.passing_score ? "bg-primary/5 border-primary" : "bg-destructive/5 border-destructive"}>
              <CardContent className="text-center py-8">
                {score >= quiz.passing_score ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                    <p className="text-lg mb-2">You passed the quiz!</p>
                    <p className="text-3xl font-bold text-primary">{score}%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Passing score: {quiz.passing_score}%
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Keep Trying!</h3>
                    <p className="text-lg mb-2">You didn't pass this time</p>
                    <p className="text-3xl font-bold text-destructive">{score}%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You need {quiz.passing_score}% to pass
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Answer Review */}
            <div className="space-y-4">
              <h4 className="font-semibold">Review Your Answers</h4>
              {questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;

                return (
                  <Card key={question.id} className={isCorrect ? "border-primary/50" : "border-destructive/50"}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {index + 1}. {question.question}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Your answer: </span>
                            <span className={isCorrect ? "text-primary" : "text-destructive"}>
                              {userAnswer || "Not answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Correct answer: </span>
                              <span className="text-primary font-medium">
                                {question.correct_answer}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3">
              {score < quiz.passing_score && (
                <Button onClick={handleRetry} className="flex-1">
                  Retry Quiz
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Quiz Taking View
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-muted-foreground">
                  {Object.keys(answers).length} answered
                </span>
              </div>
              <Progress value={progressPercentage} />
            </div>

            {/* Question */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {currentQuestion.question}
                </h3>

                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerSelect(currentQuestion.id, value)
                  }
                  className="space-y-3"
                >
                  {currentQuestion.options?.options?.map((option: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {!allAnswered && "Answer all questions to submit"}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="min-w-[120px]"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
