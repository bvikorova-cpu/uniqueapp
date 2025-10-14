import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Save } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

const InterviewSimulator = () => {
  const { toast } = useToast();
  const { credits, useCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const startInterview = async () => {
    if (!jobTitle) {
      toast({ title: "Error", description: "Please enter a job title", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await useCredit("effect");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: sessionData, error: sessionError } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          job_description: jobDescription,
          difficulty_level: difficulty,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(sessionData.id);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("career-interview", {
        body: { jobTitle, jobDescription, difficulty },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;
      
      setCurrentQuestion(response.data.response);
      setQuestions([response.data.response]);
      setQuestionIndex(1);
      
      toast({ title: "Interview Started", description: "Answer the first question to begin" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({ title: "Error", description: "Please provide an answer", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await useCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("career-interview", {
        body: { jobTitle, jobDescription, difficulty, userAnswer, questionIndex },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;

      const newAnswers = [...answers, userAnswer];
      const newQuestions = [...questions];
      
      setAnswers(newAnswers);
      setFeedback(response.data.response);
      setUserAnswer("");
      setQuestionIndex(questionIndex + 1);

      await supabase
        .from("interview_sessions")
        .update({
          questions_asked: newQuestions,
          answers_given: newAnswers,
          duration_minutes: questionIndex * 3,
        })
        .eq("id", sessionId);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from("interview_sessions")
        .update({
          ai_feedback: feedback,
          overall_score: Math.floor(Math.random() * 30) + 70,
        })
        .eq("id", sessionId);

      toast({ title: "Saved", description: "Interview session saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Interview Simulator</CardTitle>
        <CardDescription>Practice with realistic interview questions and get instant feedback</CardDescription>
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentQuestion ? (
          <>
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="jobDescription">Job Description (Optional)</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={startInterview} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Start Interview
            </Button>
          </>
        ) : (
          <>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Question {questionIndex}:</h3>
              <p>{currentQuestion}</p>
            </div>

            {feedback && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Feedback:</h3>
                <p className="whitespace-pre-wrap">{feedback}</p>
              </div>
            )}

            <div>
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitAnswer} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Answer
              </Button>
              <Button onClick={saveSession} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewSimulator;