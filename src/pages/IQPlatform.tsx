import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trophy, LineChart, Zap, Users, Target } from "lucide-react";
import { IQCreditsDisplay } from "@/components/iq/IQCreditsDisplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const IQPlatform = () => {
  const [activeTab, setActiveTab] = useState("tests");
  const [competitions, setCompetitions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCompetitions();
    const interval = setInterval(loadCompetitions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCompetitions = async () => {
    const { data } = await supabase
      .from("iq_competitions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCompetitions(data);
  };

  const handleStartTest = async (testType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }
      
      const test = testCategories.find(t => t.id === testType);
      if (!test) return;
      
      // Check if user has enough credits
      const { data: userCredits } = await supabase
        .from("brain_duel_credits")
        .select("credits")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (!userCredits || userCredits.credits < test.credits) {
        toast({ 
          title: "Insufficient Credits", 
          description: `You need ${test.credits} credits for this test. Please purchase more credits.`,
          variant: "destructive" 
        });
        return;
      }
      
      // Deduct credits
      await supabase
        .from("brain_duel_credits")
        .update({ credits: userCredits.credits - test.credits })
        .eq("user_id", session.user.id);
      
      // Start the test (navigate to test page or open test modal)
      toast({ 
        title: "Test Started!", 
        description: `${test.title} - ${test.questions} questions, ${test.timeLimit} minutes. Good luck!` 
      });
      
    } catch (error: any) {
      toast({ title: "Error starting test", description: error.message, variant: "destructive" });
    }
  };

  const handleGetAnalysis = async (analysisType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("get-ai-analysis", {
        body: { analysisType },
      });

      if (error) throw error;
      toast({ title: "Analysis complete!", description: data.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleJoinCompetition = async (competitionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("join-iq-competition", {
        body: { competitionId },
      });

      if (error) throw error;
      toast({ title: "Success!", description: data.message });
      loadCompetitions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getTimeUntilEnd = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};
      competitions.forEach(comp => {
        if (comp.end_time) {
          newCountdowns[comp.id] = getTimeUntilEnd(comp.end_time);
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [competitions]);

  const testCategories = [
    {
      id: "beginner",
      title: "Beginner IQ Test",
      description: "Perfect for first-time test takers",
      difficulty: "Beginner",
      questions: 30,
      timeLimit: 30,
      credits: 10,
      icon: Target,
    },
    {
      id: "intermediate",
      title: "Intermediate IQ Test",
      description: "Standard IQ assessment",
      difficulty: "Intermediate",
      questions: 40,
      timeLimit: 45,
      credits: 15,
      icon: Brain,
    },
    {
      id: "advanced",
      title: "Advanced IQ Test",
      description: "Challenging cognitive assessment",
      difficulty: "Advanced",
      questions: 50,
      timeLimit: 60,
      credits: 20,
      icon: Zap,
    },
    {
      id: "expert",
      title: "Expert IQ Test",
      description: "Mensa-level difficulty",
      difficulty: "Expert",
      questions: 60,
      timeLimit: 75,
      credits: 25,
      icon: Trophy,
    },
  ];

  const analyses = [
    {
      id: "cognitive",
      title: "Cognitive Profile Analysis",
      description: "Deep dive into your cognitive strengths and patterns",
      credits: 30,
      duration: "15 min",
    },
    {
      id: "learning",
      title: "Learning Style Assessment",
      description: "Discover how you learn best",
      credits: 20,
      duration: "10 min",
    },
    {
      id: "strengths",
      title: "Strengths & Weaknesses Report",
      description: "Detailed breakdown of your abilities",
      credits: 25,
      duration: "20 min",
    },
    {
      id: "improvement",
      title: "Personalized Improvement Plan",
      description: "AI-generated roadmap to boost your IQ",
      credits: 40,
      duration: "30 min",
    },
  ];

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
      <div className="space-y-4 mt-16 sm:mt-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">IQ Platform</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Test, Analyze, Compete & Earn</p>
          </div>
        </div>
        
        <IQCreditsDisplay />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-2 bg-muted/50 rounded-xl">
          <TabsTrigger 
            value="tests" 
            className="text-xs sm:text-sm py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <Brain className="h-4 w-4 mr-2" />
            IQ Tests
          </TabsTrigger>
          <TabsTrigger 
            value="analyses" 
            className="text-xs sm:text-sm py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <LineChart className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="competitions" 
            className="text-xs sm:text-sm py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Competitions
          </TabsTrigger>
          <TabsTrigger 
            value="results" 
            className="text-xs sm:text-sm py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <Users className="h-4 w-4 mr-2" />
            My Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {testCategories.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <test.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg">{test.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{test.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{test.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground">Questions</p>
                      <p className="font-semibold">{test.questions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Limit</p>
                      <p className="font-semibold">{test.timeLimit} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credits</p>
                      <p className="font-semibold">{test.credits}</p>
                    </div>
                  </div>
                  <Button className="w-full text-sm" onClick={() => handleStartTest(test.id)}>Start Test</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg">{analysis.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{analysis.description}</CardDescription>
                    </div>
                    <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Duration: {analysis.duration}</span>
                    <span className="font-semibold">{analysis.credits} credits</span>
                  </div>
                  <Button className="w-full text-sm" onClick={() => handleGetAnalysis(analysis.id)}>Get Analysis</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4">
          <div className="space-y-3 sm:space-y-4">
            {competitions.map((comp) => {
              const endsIn = countdowns[comp.id] || "Loading...";
              
              return (
                <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg">{comp.title}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">{comp.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={comp.status === "active" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                        {comp.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Entry Fee</p>
                        <p className="font-semibold">{comp.entry_fee} credits</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prize Pool</p>
                        <p className="font-semibold text-green-600">{comp.prize_pool} credits</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-semibold">0/{comp.max_participants}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ends in</p>
                        <p className="font-semibold">{endsIn}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full text-sm" 
                      disabled={comp.status !== "active"} 
                      onClick={() => handleJoinCompetition(comp.id)}
                    >
                      Join Competition
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Your IQ Journey</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track your progress and improvements</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Take your first IQ test to see your results here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">How It Works</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your complete guide to using the IQ Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center space-y-2 p-4 bg-background/50 rounded-lg">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-sm sm:text-base">1. Take Tests</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose from beginner to expert level IQ tests
              </p>
            </div>
            <div className="text-center space-y-2 p-4 bg-background/50 rounded-lg">
              <LineChart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-sm sm:text-base">2. Get AI Analysis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Receive detailed insights about your cognitive abilities
              </p>
            </div>
            <div className="text-center space-y-2 p-4 bg-background/50 rounded-lg">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-sm sm:text-base">3. Compete & Earn</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Join competitions and win credits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Description Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">About the IQ Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 text-sm text-muted-foreground">
          <p>
            The IQ Platform is a comprehensive cognitive assessment and improvement tool designed to help you understand and enhance your intellectual abilities. Our scientifically-designed tests measure various aspects of intelligence including logical reasoning, pattern recognition, spatial awareness, and problem-solving skills.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Features:</h4>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>IQ Tests:</strong> Four difficulty levels from Beginner to Expert. Each test contains 30-60 questions with time limits ranging from 30-75 minutes. Results include detailed score breakdowns and percentile rankings.</li>
              <li><strong>AI Analysis:</strong> Get personalized cognitive profile analysis, learning style assessment, and improvement plans powered by advanced AI algorithms.</li>
              <li><strong>Competitions:</strong> Join timed competitions against other users. Pay entry fees with credits and compete for prize pools. Top performers win credit rewards.</li>
              <li><strong>My Results:</strong> Track your progress over time, view historical test scores, and monitor your cognitive improvement journey.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Credit System:</h4>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Purchase credits in packages: 10 credits for €5, 20 credits for €7, or 50 credits for €10</li>
              <li>Tests cost 10-25 credits depending on difficulty level</li>
              <li>AI analyses range from 20-40 credits based on depth and duration</li>
              <li>Win credits by placing in competitions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IQPlatform;
