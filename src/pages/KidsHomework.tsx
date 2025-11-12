import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsHomeworkProgress } from "@/hooks/useKidsHomeworkProgress";
import { useKidsDailyChallenge } from "@/hooks/useKidsDailyChallenge";
import { useKidsHomework } from "@/hooks/useKidsHomework";
import { ProgressCard } from "@/components/kids-homework/ProgressCard";
import { AchievementsGrid } from "@/components/kids-homework/AchievementsGrid";
import { DailyChallengeCard } from "@/components/kids-homework/DailyChallengeCard";
import { HomeworkLimitBanner } from "@/components/kids-homework/HomeworkLimitBanner";
import { SubscriptionManagement } from "@/components/kids-homework/SubscriptionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";

const KidsHomework = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { points, achievements, unlockedAchievements, isLoading: progressLoading } = useKidsHomeworkProgress();
  const { challenge, progress, isCompleted, isLoading: challengeLoading } = useKidsDailyChallenge();
  const { questionsUsed, questionsLimit, isPremium, loading: usageLoading, refreshUsage, manageSubscription } = useKidsHomework();
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !subject || !difficulty) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-homework-helper', {
        body: { subject, question, difficulty }
      });

      if (error) {
        // Check if it's a limit error
        if (error.message?.includes('Daily limit reached')) {
          toast.error('Daily limit reached! Upgrade to Premium for unlimited questions.', {
            duration: 5000,
          });
          refreshUsage();
          return;
        }
        throw error;
      }
      
      setResult(data);
      refreshUsage();
      
      // Invalidate queries to refresh progress and challenges
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({ queryKey: ['kids-homework-points', user.id] });
        queryClient.invalidateQueries({ queryKey: ['daily-progress', user.id, today] });
        queryClient.invalidateQueries({ queryKey: ['challenge-completion', user.id] });
        toast.success("Homework help ready! You earned 10 points! 🎉");
      } else {
        toast.success("Homework help ready! 🎉");
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to get homework help");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Homework Helper 📚
            </h1>
            <p className="text-muted-foreground">
              Get fun and easy help with your homework! {user && "Earn points and unlock achievements!"}
            </p>
          </div>

          {!usageLoading && (
            <div className="mb-6 space-y-4">
              <HomeworkLimitBanner
                questionsUsed={questionsUsed}
                questionsLimit={questionsLimit}
                isPremium={isPremium}
              />
              {isPremium && (
                <SubscriptionManagement
                  subscribed={isPremium}
                  onManageSubscription={manageSubscription}
                />
              )}
            </div>
          )}

          {user && !progressLoading && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <ProgressCard points={points} />
              {!challengeLoading && (
                <DailyChallengeCard 
                  challenge={challenge} 
                  progress={progress}
                  isCompleted={isCompleted}
                />
              )}
            </div>
          )}

          <Tabs defaultValue="homework" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="homework">Ask Question</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="homework" className="space-y-6">

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Ask Your Question
              </CardTitle>
              <CardDescription>
                Tell me about your homework and I'll help you understand it better!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="How hard is it?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy 😊</SelectItem>
                      <SelectItem value="medium">Medium 🤔</SelectItem>
                      <SelectItem value="hard">Hard 🧠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Question</label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your homework question here..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || (!isPremium && questionsUsed >= questionsLimit)}
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (!isPremium && questionsUsed >= questionsLimit) ? (
                    'Daily Limit Reached - Upgrade to Premium'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Help!
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Your Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Explanation:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
                </div>

                {result.funFacts && result.funFacts.length > 0 && (
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Fun Facts!
                    </h3>
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
            </TabsContent>

            <TabsContent value="achievements">
              {user ? (
                <AchievementsGrid 
                  achievements={achievements} 
                  unlockedAchievements={unlockedAchievements} 
                />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Sign in to track your achievements and earn badges!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsHomework;