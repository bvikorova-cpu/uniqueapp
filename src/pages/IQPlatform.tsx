import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trophy, LineChart, Zap, Users, Target } from "lucide-react";
import { IQCreditsDisplay } from "@/components/iq/IQCreditsDisplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const IQPlatform = () => {
  const [activeTab, setActiveTab] = useState("tests");

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

  const competitions = [
    {
      id: "daily",
      title: "Daily IQ Challenge",
      description: "Quick 15-minute daily competition",
      entryFee: 5,
      prizePool: 250,
      participants: 142,
      maxParticipants: 200,
      status: "Active",
      endsIn: "6h 24m",
    },
    {
      id: "weekly",
      title: "Weekly Grand Tournament",
      description: "60-minute comprehensive test",
      entryFee: 20,
      prizePool: 1500,
      participants: 89,
      maxParticipants: 100,
      status: "Active",
      endsIn: "2d 14h",
    },
    {
      id: "premium",
      title: "Premium Championship",
      description: "Expert level competition",
      entryFee: 50,
      prizePool: 5000,
      participants: 45,
      maxParticipants: 50,
      status: "Upcoming",
      startsIn: "12h",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">IQ Platform</h1>
            <p className="text-muted-foreground">Test, Analyze, Compete & Earn</p>
          </div>
        </div>
        
        <IQCreditsDisplay />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">IQ Tests</TabsTrigger>
          <TabsTrigger value="analyses">AI Analysis</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="results">My Results</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {testCategories.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <test.icon className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>{test.title}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{test.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
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
                  <Button className="w-full">Start Test</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{analysis.title}</CardTitle>
                      <CardDescription>{analysis.description}</CardDescription>
                    </div>
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration: {analysis.duration}</span>
                    <span className="font-semibold">{analysis.credits} credits</span>
                  </div>
                  <Button className="w-full">Get Analysis</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <div className="space-y-4">
            {competitions.map((comp) => (
              <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>{comp.title}</CardTitle>
                        <CardDescription>{comp.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={comp.status === "Active" ? "default" : "secondary"}>
                      {comp.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Fee</p>
                      <p className="font-semibold">{comp.entryFee} credits</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold text-green-600">{comp.prizePool} credits</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participants</p>
                      <p className="font-semibold">{comp.participants}/{comp.maxParticipants}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{comp.status === "Active" ? "Ends in" : "Starts in"}</p>
                      <p className="font-semibold">{comp.status === "Active" ? comp.endsIn : comp.startsIn}</p>
                    </div>
                  </div>
                  <Button className="w-full" disabled={comp.status !== "Active"}>
                    {comp.status === "Active" ? "Join Competition" : "Coming Soon"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your IQ Journey</CardTitle>
              <CardDescription>Track your progress and improvements</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Take your first IQ test to see your results here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <Brain className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold">1. Take Tests</h3>
            <p className="text-sm text-muted-foreground">
              Choose from beginner to expert level IQ tests
            </p>
          </div>
          <div className="text-center space-y-2">
            <LineChart className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold">2. Get AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Receive detailed insights about your cognitive abilities
            </p>
          </div>
          <div className="text-center space-y-2">
            <Trophy className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold">3. Compete & Earn</h3>
            <p className="text-sm text-muted-foreground">
              Join competitions and win credits
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IQPlatform;
