import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Sparkles, Microscope, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScienceSubscription } from "@/hooks/useScienceSubscription";
import { ScienceLimitBanner } from "@/components/kids-science/ScienceLimitBanner";
import { ScienceSubscriptionManagement } from "@/components/kids-science/ScienceSubscriptionManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const KidsScienceLab = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { subscription, refreshSubscription, subscribe, manageSubscription, incrementUsage } = useScienceSubscription();

  useEffect(() => {
    refreshSubscription();
  }, []);

  const handleAnalyze = async () => {
    if (!category || !hypothesis.trim() || !observations.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check if user can perform experiment
    if (!subscription.subscribed && subscription.experiments_used >= subscription.experiments_limit) {
      toast.error("Monthly limit reached! Upgrade to Premium for unlimited experiments.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to analyze experiments");
        return;
      }

      const { data, error } = await supabase.functions.invoke('kids-science-lab', {
        body: { category, hypothesis, observations }
      });

      if (error) throw error;
      
      setResult(data);
      await incrementUsage();
      toast.success("AI analyzed your experiment! 🔬");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to analyze experiment");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = subscription.subscribed || subscription.experiments_used < subscription.experiments_limit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Science Lab 🔬
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover science with virtual experiments and AI-powered analysis!
            </p>
          </div>

          {/* What is this section */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Info className="w-5 h-5" />
                What is AI Science Lab?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>AI Science Lab</strong> is your virtual laboratory assistant! It helps young scientists (ages 6-12) understand their science experiments through AI-powered analysis.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Choose your science category (Physics, Chemistry, Biology, etc.)</li>
                  <li>Write what you think will happen (your hypothesis)</li>
                  <li>Describe what you observed during your experiment</li>
                  <li>Let AI analyze and explain the science behind your results!</li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground italic">
                You'll get a clear conclusion, easy-to-understand explanation, and fun science facts!
              </p>
            </CardContent>
          </Card>

          {/* Safety Warning */}
          <Alert variant="destructive" className="border-orange-500 bg-orange-500/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Important Safety Notice:</strong> Real experiments should only be performed under adult supervision. Always follow proper safety guidelines and use appropriate protective equipment.
            </AlertDescription>
          </Alert>

          {/* Subscription Status Banner */}
          {subscription.loading ? (
            <Card className="animate-pulse">
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading subscription status...
              </CardContent>
            </Card>
          ) : (
            <ScienceLimitBanner
              experimentsUsed={subscription.experiments_used}
              experimentsLimit={subscription.experiments_limit}
              isPremium={subscription.subscribed}
              onUpgrade={() => navigate('/kids-science-pricing')}
            />
          )}

          {/* Subscription Management */}
          {subscription.subscribed && (
            <ScienceSubscriptionManagement
              subscribed={subscription.subscribed}
              onManageSubscription={manageSubscription}
            />
          )}

          {/* Experiment Form */}
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
                <Select value={category} onValueChange={setCategory} disabled={!canAnalyze}>
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
                  disabled={!canAnalyze}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Observations</label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="What did you see or notice?"
                  className="min-h-[100px]"
                  disabled={!canAnalyze}
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full"
                disabled={loading || !canAnalyze}
              >
                {loading ? (
                  <>
                    <Microscope className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-4 w-4" />
                    Analyze Experiment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Conclusion</h3>
                  <p className="text-muted-foreground">{result.conclusion}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-lg">Scientific Explanation</h3>
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Fun Facts
                  </h3>
                  <ul className="space-y-2">
                    {result.funFacts.map((fact: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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