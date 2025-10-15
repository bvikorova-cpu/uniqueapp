import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Brain, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TeenStudyPlanner() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateStudyPlan = async () => {
    if (!subject || !examDate || !currentLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-study-planner', {
        body: { subject, examDate, currentLevel }
      });

      if (error) throw error;
      setStudyPlan(data.plan);
      toast({
        title: "Study Plan Generated!",
        description: "Your personalized study plan is ready",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Study Planner (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Optimize your learning with AI-powered study plans tailored to your exams
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Plan Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject/Topic</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Biology, History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="level">Current Understanding Level</Label>
                <Textarea
                  id="level"
                  placeholder="Describe what you already know and what you find difficult..."
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={generateStudyPlan} 
                disabled={loading}
                className="w-full"
              >
                <Brain className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Study Plan"}
              </Button>
            </CardContent>
          </Card>

          {studyPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Personalized Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {studyPlan}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use the Pomodoro Technique: 25 min study, 5 min break</li>
                <li>• Review material within 24 hours to improve retention</li>
                <li>• Practice active recall instead of just re-reading</li>
                <li>• Get enough sleep - it's crucial for memory consolidation</li>
                <li>• Mix up subjects to prevent mental fatigue</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
