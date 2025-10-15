import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, Lightbulb, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TeenSideHustle() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateIdeas = async () => {
    if (!skills || !interests) {
      toast({
        title: "Missing Information",
        description: "Please describe your skills and interests",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-side-hustle', {
        body: { skills, interests, timeAvailable }
      });

      if (error) throw error;
      setIdeas(data.ideas);
      toast({
        title: "Ideas Generated!",
        description: "Check out your personalized side hustle ideas",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
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
            Side Hustle Ideas (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover ways to earn money as a student based on your skills and interests
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Tell Us About Yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="skills">What skills do you have?</Label>
                <Textarea
                  id="skills"
                  placeholder="e.g., graphic design, coding, writing, tutoring, video editing, social media..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="interests">What are you interested in?</Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., technology, fashion, fitness, gaming, crafts, music..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  How much time can you dedicate? (Optional)
                </Label>
                <Textarea
                  id="time"
                  placeholder="e.g., 5 hours per week, weekends only, after school..."
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={generateIdeas} 
                disabled={loading}
                className="w-full"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Get Side Hustle Ideas"}
              </Button>
            </CardContent>
          </Card>

          {ideas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Personalized Side Hustle Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {ideas}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tips for Teen Entrepreneurs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Start small and scale as you learn</li>
                <li>• Always check with parents/guardians before starting</li>
                <li>• Be professional and reliable with clients</li>
                <li>• Set clear boundaries for work-life balance</li>
                <li>• Save a portion of your earnings</li>
                <li>• Learn about taxes and basic finances</li>
                <li>• Build a portfolio to showcase your work</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
