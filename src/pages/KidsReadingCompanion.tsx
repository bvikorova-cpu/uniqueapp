import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, HelpCircle, Award, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useKidsReadingSubscription } from "@/hooks/useKidsReadingSubscription";
import { Progress } from "@/components/ui/progress";

const KidsReadingCompanion = () => {
  const { t } = useTranslation();
  const [bookText, setBookText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { subscription, createCheckout, incrementAnalysisUsage, incrementQuizUsage } = useKidsReadingSubscription();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const analyzeText = async () => {
    if (!bookText.trim()) {
      toast.error("Please paste some text to read");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to use this feature");
      return;
    }

    if (!subscription.subscribed && subscription.analyses_used >= subscription.analyses_limit) {
      toast.error("You've reached your free limit. Subscribe for unlimited access!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-reading-companion', {
        body: { text: bookText, action: 'analyze' }
      });

      if (error) throw error;
      
      setAnalysis(data);
      await incrementAnalysisUsage();
      toast.success("Text analyzed! 📖");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to analyze text");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use this feature");
      return;
    }

    if (!subscription.subscribed && subscription.quizzes_used >= subscription.quizzes_limit) {
      toast.error("You've reached your free limit. Subscribe for unlimited access!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-reading-companion', {
        body: { text: bookText, action: 'quiz' }
      });

      if (error) throw error;
      
      setQuiz(data);
      setShowQuiz(true);
      await incrementQuizUsage();
      toast.success("Quiz ready! 🎯");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !quiz) return;

    const isCorrect = selectedAnswer === quiz.correctAnswer;
    if (isCorrect) {
      toast.success("Correct! Great job! 🎉");
    } else {
      toast.error(`Not quite! The answer is: ${quiz.correctAnswer}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Kids Reading Companion
            </h1>
            <p className="text-muted-foreground mb-4">
              AI-powered reading assistant that helps children understand texts better through simplified explanations and interactive quizzes
            </p>
            
            {!subscription.loading && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  {subscription.subscribed ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold">Premium Active - Unlimited Access</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Active until: {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ) : isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Text Analyses: {subscription.analyses_used}/{subscription.analyses_limit === 999999 ? 'Unlimited' : subscription.analyses_limit}</span>
                          <span>Quizzes: {subscription.quizzes_used}/{subscription.quizzes_limit === 999999 ? 'Unlimited' : subscription.quizzes_limit}</span>
                        </div>
                        <Progress value={subscription.analyses_limit === 999999 ? 0 : (subscription.analyses_used / subscription.analyses_limit) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <Button onClick={createCheckout} size="lg" className="gap-2">
                          <Sparkles className="w-4 h-4" />
                          Get Premium - €5/month
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unlimited analyses & quizzes • Cancel anytime
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-muted-foreground">Sign in to start your free trial</p>
                      <Button size="lg" variant="outline">Sign In</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Paste Your Text
              </CardTitle>
              <CardDescription>
                Copy and paste any text from your book, article, or homework assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={bookText}
                onChange={(e) => setBookText(e.target.value)}
                placeholder="Paste your text here... (e.g., a paragraph from your book, a story, or any text you want to understand better)"
                className="min-h-[200px]"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={analyzeText} 
                  disabled={loading || !bookText.trim() || (!subscription.subscribed && subscription.analyses_used >= subscription.analyses_limit)}
                >
                  {(!subscription.subscribed && subscription.analyses_used >= subscription.analyses_limit) ? (
                    <><Lock className="w-4 h-4 mr-2" />Premium Only</>
                  ) : (
                    <><HelpCircle className="w-4 h-4 mr-2" />Get Explanations</>
                  )}
                </Button>
                <Button 
                  onClick={generateQuiz} 
                  disabled={loading || !bookText.trim() || (!subscription.subscribed && subscription.quizzes_used >= subscription.quizzes_limit)} 
                  variant="outline"
                >
                  {(!subscription.subscribed && subscription.quizzes_used >= subscription.quizzes_limit) ? (
                    <><Lock className="w-4 h-4 mr-2" />Premium Only</>
                  ) : (
                    <><Award className="w-4 h-4 mr-2" />Take Quiz</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysis && !showQuiz && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
              <CardHeader>
                <CardTitle>Understanding Your Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>

                {analysis.vocabulary && analysis.vocabulary.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">New Words to Learn</h3>
                    <div className="space-y-2">
                      {analysis.vocabulary.map((word: any, index: number) => (
                        <div key={index} className="bg-background/50 p-3 rounded-lg">
                          <p className="font-medium">{word.word}</p>
                          <p className="text-sm text-muted-foreground">{word.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showQuiz && quiz && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Reading Comprehension Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">{quiz.question}</h3>
                  <div className="space-y-2">
                    {quiz.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedAnswer === option
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={checkAnswer} disabled={!selectedAnswer}>
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={() => setShowQuiz(false)}>
                    Back to Reading
                  </Button>
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

export default KidsReadingCompanion;