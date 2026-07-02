import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, HelpCircle } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
}

interface Question {
  id: string;
  quiz_id: string;
  question: string;
  order_index: number;
  options: any;
  correct_answer: string;
  explanation: string;
}

interface QuizBuilderProps {
  courseId: string;
}

export function QuizBuilder({ courseId }: QuizBuilderProps) {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizForm, setQuizForm] = useState({
    lesson_id: "",
    title: "",
    passing_score: "70",
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_type: "multiple_choice",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: "",
    points: "1",
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      // Load lessons
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      setLessons(lessonsData || []);

      // Load quizzes
      const { data: quizzesData } = await supabase
        .from("course_quizzes")
        .select("*")
        .in("lesson_id", (lessonsData || []).map((l) => l.id));

      setQuizzes(quizzesData || []);
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

  const loadQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizForm.lesson_id || !quizForm.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("course_quizzes")
        .insert([{
          lesson_id: quizForm.lesson_id,
          title: quizForm.title,
          passing_score: parseInt(quizForm.passing_score),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      setQuizForm({ lesson_id: "", title: "", passing_score: "70" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuiz || !questionForm.question_text || !questionForm.correct_answer) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const options = {
        options: [
          questionForm.option1,
          questionForm.option2,
          questionForm.option3,
          questionForm.option4,
        ].filter(Boolean),
      };

      const { error } = await supabase
        .from("quiz_questions")
        .insert([{
          quiz_id: selectedQuiz.id,
          question: questionForm.question_text,
          order_index: questions.length,
          options,
          correct_answer: questionForm.correct_answer,
          explanation: "",
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      setQuestionForm({
        question_text: "",
        question_type: "multiple_choice",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_answer: "",
        points: "1",
      });
      
      loadQuestions(selectedQuiz.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      
      if (selectedQuiz) {
        loadQuestions(selectedQuiz.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Quiz Builder works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      {/* Create Quiz Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
          <CardDescription>Add quizzes to test student knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-lesson">Select Lesson *</Label>
              <Select
                value={quizForm.lesson_id}
                onValueChange={(value) => setQuizForm({ ...quizForm, lesson_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title *</Label>
                <Input
                  id="quiz-title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g., Lesson 1 Quiz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Course Quizzes ({quizzes.length})</CardTitle>
          <CardDescription>Select a quiz to add questions</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No quizzes yet. Create one above.
            </p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <Button
                  key={quiz.id}
                  variant={selectedQuiz?.id === quiz.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    loadQuestions(quiz.id);
                  }}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {quiz.title} (Pass: {quiz.passing_score}%)
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Questions to Selected Quiz */}
      {selectedQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Add Questions to: {selectedQuiz.title}</CardTitle>
            <CardDescription>Create multiple choice questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">Question *</Label>
                <Textarea
                  id="question-text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Answer Options</Label>
                {[1, 2, 3, 4].map((num) => (
                  <Input
                    key={num}
                    value={questionForm[`option${num}` as keyof typeof questionForm]}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, [`option${num}`]: e.target.value })
                    }
                    placeholder={`Option ${num}`}
                  />
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correct-answer">Correct Answer *</Label>
                  <Input
                    id="correct-answer"
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    placeholder="Enter the correct answer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </form>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-3 pt-6 border-t">
                <h4 className="font-semibold">Questions ({questions.length})</h4>
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {question.options?.options?.map((opt: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span
                                className={
                                  opt === question.correct_answer
                                    ? "text-primary font-semibold"
                                    : ""
                                }
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                                {opt === question.correct_answer && " ✓"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </>
    );
}
