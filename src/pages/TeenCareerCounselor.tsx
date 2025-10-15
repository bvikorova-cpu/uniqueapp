import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Heart, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TeenCareerCounselor() {
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [goals, setGoals] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCareerGuidance = async () => {
    if (!interests || !strengths) {
      toast({
        title: "Missing Information",
        description: "Please describe your interests and strengths",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-career-counselor', {
        body: { interests, strengths, goals }
      });

      if (error) throw error;
      setGuidance(data.guidance);
      toast({
        title: "Career Guidance Ready!",
        description: "Check out your personalized career path recommendations",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate career guidance. Please try again.",
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
            AI Career Counselor (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover career paths that match your interests, strengths, and goals
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Tell Us About Yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interests" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  What are your interests and hobbies?
                </Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., I love coding, playing music, helping people, science experiments..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="strengths" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  What are you good at?
                </Label>
                <Textarea
                  id="strengths"
                  placeholder="e.g., problem-solving, creativity, communication, mathematics, leadership..."
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  What are your career goals or dreams? (Optional)
                </Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., I want to make a positive impact, earn well, work with technology..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={getCareerGuidance} 
                disabled={loading}
                className="w-full"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                {loading ? "Analyzing..." : "Get Career Guidance"}
              </Button>
            </CardContent>
          </Card>

          {guidance && (
            <Card>
              <CardHeader>
                <CardTitle>Your Career Path Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {guidance}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Career Exploration Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Try job shadowing or internships to experience different careers</li>
                <li>• Talk to professionals in fields that interest you</li>
                <li>• Take online courses to explore new subjects</li>
                <li>• Join clubs and activities related to your interests</li>
                <li>• Remember: it's okay to change your mind as you learn more</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
