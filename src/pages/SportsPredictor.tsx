import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useSportsSubscription } from "@/hooks/useSportsSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TipsterRegistrationDialog } from "@/components/sports/TipsterRegistrationDialog";
import { ExpertTips } from "@/components/sports/ExpertTips";
import { TipstersLeaderboard } from "@/components/sports/TipstersLeaderboard";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Trophy,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  Bell,
  Shield,
  Users,
  Award,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
} from "lucide-react";

const PRICING_TIERS = [
  {
    name: "AI Premium",
    price: "9.99",
    currency: "€",
    period: "month",
    description: "Advanced AI-powered predictions",
    features: [
      "3 predictions per week",
      "Advanced analytics & insights",
      "Live match notifications",
      "Head-to-head analysis",
      "Injury & form tracking",
      "Historical data analysis",
    ],
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    name: "Expert Tipster",
    price: "19.99",
    currency: "€",
    period: "month",
    description: "Follow top-rated expert tipsters",
    features: [
      "All AI Premium features",
      "Unlimited expert tips",
      "VIP tipster access",
      "Personalized recommendations",
      "Priority notifications",
      "Exclusive betting strategies",
      "Monthly expert webinars",
    ],
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
  },
];

const TOP_TIPSTERS = [
  {
    id: 1,
    name: "Mike Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    sport: "Football",
    winRate: 78.5,
    totalTips: 342,
    followers: 12400,
    roi: "+24.3%",
    badge: "Elite",
  },
  {
    id: 2,
    name: "Sarah Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    sport: "Basketball",
    winRate: 76.2,
    totalTips: 289,
    followers: 9800,
    roi: "+21.8%",
    badge: "Pro",
  },
  {
    id: 3,
    name: "James Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    sport: "Tennis",
    winRate: 74.8,
    totalTips: 256,
    followers: 8300,
    roi: "+19.5%",
    badge: "Pro",
  },
];

interface Match {
  id: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  prediction?: {
    prediction_type: string;
    confidence: number;
    odds: number;
    analysis?: string;
  };
}

export default function SportsPredictor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, tier, loading, createCheckout } = useSportsSubscription();
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState("all");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [generatingPrediction, setGeneratingPrediction] = useState<string | null>(null);
  const [showTipsterDialog, setShowTipsterDialog] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const { data: matchesData, error: matchesError } = await supabase
        .from('sports_matches')
        .select('*')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      // Fetch predictions for each match
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('sports_predictions')
        .select('*');

      if (predictionsError) throw predictionsError;

      // Combine matches with predictions
      const matchesWithPredictions = (matchesData || []).map(match => {
        const prediction = predictionsData?.find(p => p.match_id === match.id);
        return {
          ...match,
          prediction: prediction ? {
            prediction_type: prediction.prediction_type,
            confidence: prediction.confidence,
            odds: prediction.odds,
            analysis: prediction.analysis_text,
          } : undefined,
        };
      });

      setMatches(matchesWithPredictions);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSubscribe = async (selectedTier: 'ai_premium' | 'expert_tipster') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setCheckoutLoading(true);
      await createCheckout(selectedTier);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleGeneratePrediction = async (matchId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canViewPredictions) {
      toast({
        title: "Subscription Required",
        description: "Active subscription required to generate predictions",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingPrediction(matchId);
      const { data, error } = await supabase.functions.invoke('generate-sports-prediction', {
        body: { matchId },
      });

      if (error) throw error;

      toast({
        title: "Prediction Generated! 🎯",
        description: "AI successfully analyzed the match",
      });

      // Refresh matches to show new prediction
      await fetchMatches();
    } catch (error: any) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Error",
        description: getUserFriendlyErrorMessage(error, "Failed to generate prediction"),
        variant: "destructive",
      });
    } finally {
      setGeneratingPrediction(null);
    }
  };

  const canViewPredictions = subscribed && (tier === 'ai_premium' || tier === 'expert_tipster');

  return (
    <><FloatingHowItWorks title="SportsPredictor — How it works" steps={[{title:"Open this section",desc:"Access SportsPredictor from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 px-3 sm:px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="flex justify-end mb-4">
            {user && (
              <Button onClick={() => navigate('/sports-admin')} variant="outline" size="sm">
                ⚙️ Add Matches
              </Button>
            )}
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">Expert + AI Predictions</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Sports Match Predictions
          </h1>
          
          <p className="text-sm sm:text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Expert tips and AI-powered predictions for sports matches
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button size="lg" onClick={() => user ? handleSubscribe('ai_premium') : navigate("/auth")}>
              <Trophy className="mr-2 h-5 w-5" />
              {user ? "Subscribe" : "Sign In"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/tipster-dashboard?view=top")}>
              <BarChart3 className="mr-2 h-5 w-5" />
              View Top Tipsters
            </Button>
            {user && (
              <>
                <Button size="lg" variant="secondary" onClick={() => navigate("/my-purchased-tips")}>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  My Purchased Tips
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate("/tipster-dashboard")}>
                  <Trophy className="mr-2 h-5 w-5" />
                  Tipster Dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/admin/sports-matches")}>
                  <Activity className="mr-2 h-5 w-5" />
                  Add Match
                </Button>
              </>
            )}
          </div>

          {/* Legal Disclaimer */}
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                <strong className="text-orange-500">Disclaimer:</strong> Predictions are for entertainment purposes only. 
                Past performance does not guarantee future results. Gambling can be addictive. 
                Please bet responsibly. 18+ only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tipsters Leaderboard */}
      <section className="py-12 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Top Tipsters Leaderboard</h2>
              <p className="text-muted-foreground">Follow the best performers</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setShowTipsterDialog(true);
              }}
            >
              <Award className="mr-2 h-4 w-4" />
              Become a Tipster
            </Button>
          </div>

          <TipstersLeaderboard />
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black mb-8">Today's Predictions</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Sports</TabsTrigger>
              <TabsTrigger value="football">Football</TabsTrigger>
              <TabsTrigger value="basketball">Basketball</TabsTrigger>
              <TabsTrigger value="tennis">Tennis</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loadingMatches ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No matches scheduled yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {matches.map((match) => (
                    <Card key={match.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{match.sport}</Badge>
                              <Badge variant="secondary">{match.league}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-bold text-lg">{match.home_team}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="font-bold text-lg">{match.away_team}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{format(new Date(match.match_date), "dd.MM.yyyy")} • {match.match_time}</span>
                            </div>
                          </div>

                          {/* Prediction or Generate Button */}
                          {match.prediction ? (
                            <div className="flex items-center gap-6 relative">
                              {!canViewPredictions && (
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                                  <div className="text-center">
                                    <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                                    <p className="text-sm font-semibold">Subscription Required</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className={`text-center ${!canViewPredictions ? 'blur-sm' : ''}`}>
                                <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                                <Badge className="bg-green-500 text-white">
                                  {match.prediction.prediction_type === 'home_win' ? 'Home' : 
                                   match.prediction.prediction_type === 'away_win' ? 'Away' : 'Draw'}
                                </Badge>
                              </div>
                              <div className={`text-center ${!canViewPredictions ? 'blur-sm' : ''}`}>
                                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                                <div className="text-2xl font-bold">{match.prediction.confidence}%</div>
                              </div>
                              {match.prediction.odds && (
                                <div className={`text-center ${!canViewPredictions ? 'blur-sm' : ''}`}>
                                  <div className="text-sm text-muted-foreground mb-1">Odds</div>
                                  <div className="text-2xl font-bold text-primary">{match.prediction.odds}</div>
                                </div>
                              )}
                              {canViewPredictions && (
                                <Button variant="outline" onClick={() => {
                                  const subs = JSON.parse(localStorage.getItem("sports_match_notify") || "[]");
                                  if (subs.includes(match.id)) { toast({ description: "Notifications are already enabled" }); return; }
                                  subs.push(match.id);
                                  localStorage.setItem("sports_match_notify", JSON.stringify(subs));
                                  toast({ description: "We'll send you a notification before the match!" });
                                }}>
                                  <Bell className="mr-2 h-4 w-4" />
                                  Notify
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleGeneratePrediction(match.id)}
                              disabled={generatingPrediction === match.id || !canViewPredictions}
                            >
                              {generatingPrediction === match.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-2 h-4 w-4" />
                                  {canViewPredictions ? 'Generate AI Prediction' : 'Subscription Required'}
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Analysis section - only show if prediction exists and user can view */}
                        {match.prediction && canViewPredictions && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-start gap-2">
                              <BarChart3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold mb-1">AI Analysis:</p>
                                <p className="text-sm text-muted-foreground">{(match.prediction as any).analysis || 'Analysis not available'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Expert Tips Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2">Premium Expert Tips</h2>
            <p className="text-muted-foreground">Purchase individual tips from top-performing tipsters</p>
          </div>
          <ExpertTips />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black mb-8 text-center">Platform Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Win Rate Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track detailed performance metrics for every tipster with transparent win rates and ROI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Live Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant alerts before matches start with predictions from your favorite tipsters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive match analysis including form, head-to-head stats, and injury reports
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">All predictions are paid - subscribe to unlock expert insights</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_TIERS.map((pricingTier) => (
              <Card
                key={pricingTier.name}
                className={`relative ${
                  pricingTier.popular ? "border-2 border-primary shadow-xl" : ""
                }`}
              >
                {pricingTier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pricingTier.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <pricingTier.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{pricingTier.name}</CardTitle>
                  <CardDescription>{pricingTier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pricingTier.currency}{pricingTier.price}</span>
                    <span className="text-muted-foreground">/{pricingTier.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {pricingTier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={pricingTier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(pricingTier.name === "AI Premium" ? "ai_premium" : "expert_tipster")}
                    disabled={checkoutLoading || loading}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : subscribed && ((pricingTier.name === "AI Premium" && tier === 'ai_premium') || (pricingTier.name === "Expert Tipster" && tier === 'expert_tipster')) ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Active
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Tipster CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Become a Professional Tipster</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Share your expertise and earn 75% from every tip you sell. 
            Top performers get exclusive badges and higher visibility.
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">€1-50</div>
              <div className="text-sm text-muted-foreground">Per Tip</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">75%</div>
              <div className="text-sm text-muted-foreground">Your Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">€19.99</div>
              <div className="text-sm text-muted-foreground">Subscription Price</div>
            </div>
          </div>
          <Button size="lg" onClick={() => setShowTipsterDialog(true)}>
            <Award className="mr-2 h-5 w-5" />
            Apply as Tipster
          </Button>
        </div>
      </section>

      <TipsterRegistrationDialog
        open={showTipsterDialog}
        onOpenChange={setShowTipsterDialog}
      />
    </div>
  </>
  );
}
