import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeft, Save } from "lucide-react";
import { useCreateQuiz, useAddQuestion, usePublishQuiz } from "@/hooks/useQuiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Answer {
  answer_text: string;
  is_correct: boolean;
  answer_order: number;
}

interface Question {
  question_text: string;
  points: number;
  answers: Answer[];
}

export default function QuizCreator() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentPoints, setCurrentPoints] = useState(1);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([
    { answer_text: "", is_correct: false, answer_order: 0 },
    { answer_text: "", is_correct: false, answer_order: 1 },
  ]);

  const createQuiz = useCreateQuiz();
  const addQuestion = useAddQuestion();
  const publishQuiz = usePublishQuiz();

  const addAnswer = () => {
    setCurrentAnswers([
      ...currentAnswers,
      { answer_text: "", is_correct: false, answer_order: currentAnswers.length },
    ]);
  };

  const updateAnswer = (index: number, field: string, value: any) => {
    const updated = [...currentAnswers];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentAnswers(updated);
  };

  const removeAnswer = (index: number) => {
    if (currentAnswers.length > 2) {
      setCurrentAnswers(currentAnswers.filter((_, i) => i !== index));
    }
  };

  const addQuestionToList = () => {
    if (!currentQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const validAnswers = currentAnswers.filter((a) => a.answer_text.trim());
    if (validAnswers.length < 2) {
      toast.error("Please add at least 2 answers");
      return;
    }

    if (!validAnswers.some((a) => a.is_correct)) {
      toast.error("Please mark at least one answer as correct");
      return;
    }

    setQuestions([
      ...questions,
      {
        question_text: currentQuestion,
        points: currentPoints,
        answers: validAnswers,
      },
    ]);

    setCurrentQuestion("");
    setCurrentPoints(1);
    setCurrentAnswers([
      { answer_text: "", is_correct: false, answer_order: 0 },
      { answer_text: "", is_correct: false, answer_order: 1 },
    ]);
    toast.success("Question added!");
  };

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to create a quiz");
      return;
    }

    try {
      const quiz = await createQuiz.mutateAsync({
        title,
        description,
        time_limit_minutes: timeLimit,
        passing_score: passingScore,
        creator_id: user.id,
      });

      for (let i = 0; i < questions.length; i++) {
        await addQuestion.mutateAsync({
          quiz_id: quiz.id,
          question_text: questions[i].question_text,
          question_order: i + 1,
          points: questions[i].points,
          answers: questions[i].answers,
        });
      }

      await publishQuiz.mutateAsync(quiz.id);
      navigate("/education");
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/education")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Education
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Question</h3>

            <div>
              <Label htmlFor="question">Question Text *</Label>
              <Textarea
                id="question"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Enter your question"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={currentPoints}
                onChange={(e) => setCurrentPoints(parseInt(e.target.value))}
                min="1"
                className="w-32"
              />
            </div>

            <div className="space-y-3">
              <Label>Answers (mark correct answer with checkbox)</Label>
              {currentAnswers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={answer.is_correct}
                    onChange={(e) =>
                      updateAnswer(index, "is_correct", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Input
                    value={answer.answer_text}
                    onChange={(e) =>
                      updateAnswer(index, "answer_text", e.target.value)
                    }
                    placeholder={`Answer ${index + 1}`}
                  />
                  {currentAnswers.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnswer(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addAnswer} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Answer
              </Button>
            </div>

            <Button onClick={addQuestionToList} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Question to Quiz
            </Button>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Questions ({questions.length})
              </h3>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <p className="font-medium">
                        {index + 1}. {q.question_text}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {q.points} point{q.points !== 1 && "s"} •{" "}
                        {q.answers.length} answers
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSaveQuiz}
            className="w-full"
            size="lg"
            disabled={createQuiz.isPending || questions.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {createQuiz.isPending ? "Saving..." : "Save & Publish Quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
