import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuiz, useSubmitQuizAttempt, useQuizAttempts } from "@/hooks/useQuizzes";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Trophy, ArrowLeft, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    const interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Quiz Taker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
      </>
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
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    let correct = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correct_answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);
    try {
      await submitAttempt.mutateAsync({ quizId: quiz.id, answers, score, passed });
    } catch (err) {
      // Show results even if save fails so the user isn't stuck on an empty screen.
      console.error("[QuizTaker] submit failed", err);
    }
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (showResults) {
    let correct = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correct_answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);

    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
              <CardHeader className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="flex justify-center mb-4">
                  {passed ? (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/30 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted/50 border-2 border-border/30 flex items-center justify-center">
                      <XCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
                <CardTitle className="text-3xl">{passed ? "Congratulations!" : "Keep Practicing"}</CardTitle>
                <p className="text-muted-foreground mt-2">You scored {score}% (Passing: {quiz.passing_score}%)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Correct", value: `${correct}/${questions.length}`, color: passed ? "text-green-500" : "text-destructive" },
                    { label: "Time", value: formatTime(timeElapsed), color: "text-primary" },
                    { label: "Attempts", value: String(attempts?.length || 0), color: "text-muted-foreground" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Review Answers</h3>
                  {questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer === question.correct_answer;
                    return (
                      <motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <Card className={`border ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />}
                              <div className="flex-1">
                                <p className="font-medium text-sm">Q{index + 1}: {question.question}</p>
                                <p className="text-xs mt-1">
                                  <span className="text-muted-foreground">Your answer: </span>
                                  <span className={isCorrect ? "text-green-600" : "text-destructive"}>{userAnswer || "Not answered"}</span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-xs"><span className="text-muted-foreground">Correct: </span><span className="text-green-600">{question.correct_answer}</span></p>
                                )}
                                {question.explanation && <p className="text-xs text-muted-foreground mt-1">💡 {question.explanation}</p>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/education")} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => window.location.reload()} className="flex-1">Try Again</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <Badge variant="outline" className="gap-2 bg-primary/10 border-primary/20">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-medium mb-4">{question.question}</h3>
                <RadioGroup value={answers[question.id] || ""} onValueChange={(value) => handleAnswerChange(question.id, value)}>
                  {(question.options as string[]).map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
                        answers[question.id] === option
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex-1">Previous</Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length} className="flex-1">Submit Quiz</Button>
                ) : (
                  <Button onClick={handleNext} className="flex-1">Next</Button>
                )}
              </div>

              {/* Question dots */}
              <div className="flex justify-center gap-1.5">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentQuestion ? "bg-primary scale-125" : answers[questions[i].id] ? "bg-primary/50" : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
