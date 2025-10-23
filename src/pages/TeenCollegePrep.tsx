import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, FileText, CheckCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeenCollegePrep() {
  const [essayTopic, setEssayTopic] = useState("");
  const [essayDraft, setEssayDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reviewEssay = async () => {
    if (!essayTopic || !essayDraft) {
      toast({
        title: "Missing Information",
        description: "Please enter both topic and essay draft",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-college-prep', {
        body: { 
          type: 'essay',
          topic: essayTopic,
          content: essayDraft
        }
      });

      if (error) throw error;
      setFeedback(data.feedback);
      toast({
        title: "Essay Review Complete!",
        description: "Check your personalized feedback",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to review essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTestPrep = async () => {
    if (!testSubject) {
      toast({
        title: "Missing Information",
        description: "Please enter a subject",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-college-prep', {
        body: { 
          type: 'test-prep',
          subject: testSubject
        }
      });

      if (error) throw error;
      setStudyPlan(data.plan);
      toast({
        title: "Test Prep Plan Ready!",
        description: "Your study plan has been generated",
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
      <main className="flex-1 container mx-auto px-4 pt-16 pb-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            College Prep (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Get ready for college admissions with professional preparation tools
          </p>
        </div>

        <Tabs defaultValue="essay" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="essay">Essay Review</TabsTrigger>
            <TabsTrigger value="test">Test Preparation</TabsTrigger>
          </TabsList>

          <TabsContent value="essay" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  College Essay Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Essay Topic/Prompt</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Describe a challenge you've overcome..."
                    value={essayTopic}
                    onChange={(e) => setEssayTopic(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="draft">Your Essay Draft</Label>
                  <Textarea
                    id="draft"
                    placeholder="Paste your essay here..."
                    value={essayDraft}
                    onChange={(e) => setEssayDraft(e.target.value)}
                    rows={10}
                  />
                </div>

                <Button 
                  onClick={reviewEssay} 
                  disabled={loading}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {loading ? "Reviewing..." : "Get Feedback"}
                </Button>
              </CardContent>
            </Card>

            {feedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Essay Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {feedback}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Entrance Exam Preparation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Test Subject/Section</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., SAT Math, ACT English, Subject Test..."
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={generateTestPrep} 
                  disabled={loading}
                  className="w-full"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {loading ? "Generating..." : "Generate Study Plan"}
                </Button>
              </CardContent>
            </Card>

            {studyPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Test Prep Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {studyPlan}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>College Prep Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Start preparing early - don't wait until senior year</li>
              <li>• Take challenging courses that align with your interests</li>
              <li>• Build meaningful extracurricular activities</li>
              <li>• Practice writing essays regularly</li>
              <li>• Take practice tests in real exam conditions</li>
              <li>• Visit colleges and attend information sessions</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
