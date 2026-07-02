import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowLeft, Sparkles } from "lucide-react";
import { useCreateQuiz, QuizQuestion } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function QuizCreator() {
  const navigate = useNavigate();
  const createQuiz = useCreateQuiz();
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correct_answer: "", order_index: 0 },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correct_answer: "", order_index: questions.length },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const validQuestions = questions.filter(
      (q) => q.question.trim() && q.options.every((o) => o.trim()) && q.correct_answer
    );
    if (validQuestions.length === 0) return;

    await createQuiz.mutateAsync({
      quiz: { title, passing_score: passingScore, lesson_id: "default" },
      questions: validQuestions,
    });
    navigate("/education");
  };

  return (
    <>
      <FloatingHowItWorks title="How Quiz Creator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/education")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Education
          </Button>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-purple-500/10 border border-primary/20 p-8">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-black">Create New Quiz</h1>
              </div>
              <p className="text-muted-foreground">Build a custom quiz with multiple choice questions and instant feedback</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter quiz title" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input id="passing-score" type="number" min="0" max="100" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
            <Button onClick={addQuestion} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * qIndex }}
            >
              <Card className="backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {qIndex + 1}
                      </span>
                      Question {qIndex + 1}
                    </CardTitle>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea value={question.question} onChange={(e) => updateQuestion(qIndex, "question", e.target.value)} placeholder="Enter your question" className="mt-1" />
                  </div>

                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 items-center">
                        <Input value={option} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} />
                        <Button
                          variant={question.correct_answer === option && option ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateQuestion(qIndex, "correct_answer", option)}
                          className="shrink-0"
                        >
                          {question.correct_answer === option && option ? "✓ Correct" : "Set Correct"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea value={question.explanation || ""} onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)} placeholder="Explain the correct answer" className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-2 justify-end pt-6 pb-8">
          <Button variant="outline" onClick={() => navigate("/education")}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createQuiz.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {createQuiz.isPending ? "Creating..." : "Create Quiz"}
          </Button>
        </motion.div>
      </div>
    </div>
    </>
    );
}
