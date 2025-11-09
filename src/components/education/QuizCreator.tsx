import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { useCreateQuiz, QuizQuestion } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";

export default function QuizCreator() {
  const navigate = useNavigate();
  const createQuiz = useCreateQuiz();
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      order_index: 0,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        order_index: questions.length,
      },
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
    if (!title.trim()) {
      return;
    }

    const validQuestions = questions.filter(
      (q) => q.question.trim() && q.options.every((o) => o.trim()) && q.correct_answer
    );

    if (validQuestions.length === 0) {
      return;
    }

    await createQuiz.mutateAsync({
      quiz: { title, passing_score: passingScore, lesson_id: "default" },
      questions: validQuestions,
    });

    navigate("/education");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Quiz</CardTitle>
            <CardDescription>
              Build a custom quiz with multiple choice questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button onClick={addQuestion} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, "question", e.target.value)
                        }
                        placeholder="Enter your question"
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2 items-center">
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <Button
                            variant={
                              question.correct_answer === option && option
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              updateQuestion(qIndex, "correct_answer", option)
                            }
                          >
                            {question.correct_answer === option && option
                              ? "Correct"
                              : "Set as Correct"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) =>
                          updateQuestion(qIndex, "explanation", e.target.value)
                        }
                        placeholder="Explain the correct answer"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => navigate("/education")}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createQuiz.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {createQuiz.isPending ? "Creating..." : "Create Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
