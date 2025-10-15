import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Sparkles, Microscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const KidsScienceLab = () => {
  const [category, setCategory] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!category || !hypothesis.trim() || !observations.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-science-lab', {
        body: { category, hypothesis, observations }
      });

      if (error) throw error;
      
      setResult(data);
      toast.success("AI analyzed your experiment! 🔬");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to analyze experiment");
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
              AI Science Lab 🔬
            </h1>
            <p className="text-muted-foreground">
              Discover science with virtual experiments!
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Your Experiment
              </CardTitle>
              <CardDescription>
                Record your experiment and get AI insights!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Science Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="earth">Earth Science</SelectItem>
                    <SelectItem value="astronomy">Astronomy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Hypothesis</label>
                <Textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="What do you think will happen?"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Observations</label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="What did you see or notice?"
                  className="min-h-[120px]"
                />
              </div>

              <Button onClick={handleAnalyze} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Microscope className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Microscope className="w-4 h-4 mr-2" />
                    Analyze Experiment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Conclusion:</h3>
                  <p className="text-muted-foreground">{result.conclusion}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What's Happening:</h3>
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>

                {result.funFacts && result.funFacts.length > 0 && (
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Cool Science Facts! 🌟</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.funFacts.map((fact: string, index: number) => (
                        <li key={index} className="text-sm">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsScienceLab;