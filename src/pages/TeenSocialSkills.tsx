import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Users, Heart, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeenSocialSkills() {
  const [situation, setSituation] = useState("");
  const [scenario, setScenario] = useState("");
  const [advice, setAdvice] = useState("");
  const [practiceResponse, setPracticeResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAdvice = async () => {
    if (!situation) {
      toast({
        title: "Missing Information",
        description: "Please describe your situation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-social-skills', {
        body: { 
          type: 'advice',
          situation
        }
      });

      if (error) throw error;
      setAdvice(data.advice);
      toast({
        title: "Advice Ready!",
        description: "Check out your personalized guidance",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const practiceScenario = async () => {
    if (!scenario) {
      toast({
        title: "Missing Information",
        description: "Please describe a scenario to practice",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-social-skills', {
        body: { 
          type: 'practice',
          scenario
        }
      });

      if (error) throw error;
      setPracticeResponse(data.response);
      toast({
        title: "Practice Session Ready!",
        description: "Try responding to the scenario",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate practice. Please try again.",
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
            AI Social Skills Trainer (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Improve your communication and social skills with AI-powered guidance
          </p>
        </div>

        <Tabs defaultValue="advice" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advice">Get Advice</TabsTrigger>
            <TabsTrigger value="practice">Practice Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="advice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Social Situation Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="situation">Describe Your Situation</Label>
                  <Textarea
                    id="situation"
                    placeholder="e.g., I want to make new friends but I'm shy, I had a conflict with a classmate, I need to speak in front of the class..."
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button 
                  onClick={getAdvice} 
                  disabled={loading}
                  className="w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {loading ? "Getting Advice..." : "Get Advice"}
                </Button>
              </CardContent>
            </Card>

            {advice && (
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {advice}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Practice Social Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scenario">Choose a Scenario to Practice</Label>
                  <Textarea
                    id="scenario"
                    placeholder="e.g., Starting a conversation with someone new, handling peer pressure, expressing disagreement respectfully..."
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={practiceScenario} 
                  disabled={loading}
                  className="w-full"
                >
                  <Smile className="mr-2 h-4 w-4" />
                  {loading ? "Generating..." : "Start Practice"}
                </Button>
              </CardContent>
            </Card>

            {practiceResponse && (
              <Card>
                <CardHeader>
                  <CardTitle>Practice Scenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {practiceResponse}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Social Skills Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Active listening: Focus on understanding, not just responding</li>
              <li>• Body language matters: Make eye contact and smile</li>
              <li>• Ask open-ended questions to keep conversations flowing</li>
              <li>• Be genuine and authentic in your interactions</li>
              <li>• Practice empathy: Try to see things from others' perspectives</li>
              <li>• It's okay to feel nervous - everyone does sometimes</li>
              <li>• Build confidence through small, daily interactions</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
