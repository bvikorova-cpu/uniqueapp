import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawingCanvas } from "@/components/kids-drawing/DrawingCanvas";

const KidsDrawingBuddy = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = async () => {
    if (!topic || !difficulty) {
      toast.error("Please select topic and difficulty");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-drawing-tutorial', {
        body: { topic, difficulty }
      });

      if (error) throw error;
      
      setTutorial(data);
      setCurrentStep(0);
      toast.success("Let's start drawing! 🎨");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to load tutorial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Drawing Buddy 🎨
            </h1>
            <p className="text-muted-foreground">
              Learn to draw step by step with AI!
            </p>
          </div>

          {!tutorial ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="w-5 h-5" />
                  Choose What to Draw
                </CardTitle>
                <CardDescription>
                  Pick a topic and we'll teach you step by step!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What do you want to draw?</label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="animals">Animals 🐶</SelectItem>
                      <SelectItem value="nature">Nature 🌳</SelectItem>
                      <SelectItem value="people">People 👨</SelectItem>
                      <SelectItem value="vehicles">Vehicles 🚗</SelectItem>
                      <SelectItem value="fantasy">Fantasy 🦄</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="How hard?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy ⭐</SelectItem>
                      <SelectItem value="medium">Medium ⭐⭐</SelectItem>
                      <SelectItem value="hard">Hard ⭐⭐⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={startTutorial} className="w-full" disabled={loading}>
                  {loading ? "Loading tutorial..." : "Start Drawing!"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{tutorial.title}</CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {tutorial.steps.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="font-medium text-lg">{tutorial.steps[currentStep].instruction}</p>
                  </div>

                  {/* Drawing Canvas */}
                  <DrawingCanvas 
                    tutorialImage={tutorial.steps[currentStep].image}
                    stepNumber={currentStep + 1}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(Math.min(tutorial.steps.length - 1, currentStep + 1))}
                      disabled={currentStep === tutorial.steps.length - 1}
                      className="flex-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={() => setTutorial(null)} className="w-full">
                    Choose New Tutorial
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsDrawingBuddy;