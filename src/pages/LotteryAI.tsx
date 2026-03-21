import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Star,
  Save,
  Zap,
  BarChart3,
  Calendar,
  Coins,
  Check,
  LogOut,
  User,
  Settings,
  History,
} from "lucide-react";

const LOTTERY_TYPES = [
  { id: "eurojackpot", name: "EuroJackpot", maxNumber: 50, bonusBalls: 12, mainBalls: 5, bonusCount: 2 },
  { id: "lotto", name: "Lotto 6/49", maxNumber: 49, bonusBalls: 0, mainBalls: 6, bonusCount: 0 },
  { id: "powerball", name: "Powerball", maxNumber: 69, bonusBalls: 26, mainBalls: 5, bonusCount: 1 },
  { id: "megamillions", name: "Mega Millions", maxNumber: 70, bonusBalls: 25, mainBalls: 5, bonusCount: 1 },
];

const SUBSCRIPTION_TIERS = {
  basic: {
    price_id: "price_1STrLuGaXSfGtYFtgA9rNDxL",
    product_id: "prod_TQinlyjGo50cTk",
  },
  pro: {
    price_id: "price_1STrLwGaXSfGtYFtdbmjAGKA",
    product_id: "prod_TQinw9pUYC81T8",
  },
};

const PRICING_TIERS = [
  {
    name: "Basic",
    tier: "basic",
    price: "4.99",
    period: "month",
    features: [
      "10 generations per month",
      "Basic statistics",
      "Hot & Cold numbers",
      "Save up to 5 combinations",
    ],
    icon: Star,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    tier: "pro",
    price: "9.99",
    period: "month",
    features: [
      "30 generations per month",
      "Advanced analytics",
      "Pattern notifications",
      "Save unlimited combinations",
      "Historical pattern analysis",
      "Priority AI processing",
    ],
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
];

export default function LotteryAI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Auth & Subscription state
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  
  // Generator state
  const [selectedLottery, setSelectedLottery] = useState(LOTTERY_TYPES[0]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription();
        loadHistory();
      } else {
        setSubscription(null);
        setSavedCombinations([]);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // Check for successful payment
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your subscription is now active.",
      });
      setTimeout(() => checkSubscription(), 1000);
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await checkSubscription();
      await loadHistory();
    }
    setLoading(false);
  };

  const checkSubscription = async () => {
    if (!user && !await supabase.auth.getSession().then(({ data }) => data.session?.user)) return;
    
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-lottery-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("lottery_generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setSavedCombinations(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const handleSubscribe = async (tier: "basic" | "pro") => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const priceId = SUBSCRIPTION_TIERS[tier].price_id;
      const { data, error } = await supabase.functions.invoke("create-lottery-subscription", {
        body: { priceId },
      });

      if (error) throw error;
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const generateNumbers = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!subscription?.subscribed) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to generate lucky numbers. Choose a plan below!",
        variant: "destructive",
      });
      return;
    }

    // Check generation limits for Basic tier (10 generations per month)
    if (subscription.isBasic && !subscription.isPro) {
      // Get the start of the current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { count, error: countError } = await supabase
        .from("lottery_generations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart);
      
      if (countError) {
        console.error("Error checking generation count:", countError);
      } else if (count !== null && count >= 10) {
        toast({
          title: "Generation Limit Reached",
          description: "You've used all 10 generations this month. Upgrade to Pro for unlimited generations!",
          variant: "destructive",
        });
        return;
      }
    }

    setIsGenerating(true);
    let generatedData: any = null;
    
    try {
      // Call AI edge function for real predictions
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        'generate-lottery-numbers',
        {
          body: {
            lotteryType: selectedLottery.id,
            preferences: {} // Can be extended with user preferences
          }
        }
      );

      if (aiError) throw aiError;
      generatedData = aiResult;

      console.log('AI generated numbers:', aiResult);
      
      setGeneratedNumbers(aiResult.numbers);
      setBonusNumbers(aiResult.bonusNumbers || []);
      setAiAnalysis(aiResult.analysis);

      toast({
        title: "AI Analysis Complete! 🤖",
        description: aiResult.analysis.reasoning,
      });
    } catch (error: any) {
      console.error('Error generating numbers:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate numbers. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    // Save to database
    try {
      await supabase.from("lottery_generations").insert({
        user_id: user.id,
        lottery_type: selectedLottery.name,
        main_numbers: generatedData.numbers,
        bonus_numbers: generatedData.bonusNumbers && generatedData.bonusNumbers.length > 0 ? generatedData.bonusNumbers : null,
      });

      await loadHistory();
      
      setIsGenerating(false);
      toast({
        title: "Numbers Generated! 🎰",
        description: "Your AI-predicted lucky numbers are ready!",
      });
    } catch (error) {
      console.error("Error saving generation:", error);
      setIsGenerating(false);
      toast({
        title: "Saved with warnings",
        description: "Numbers generated but may not be saved to history.",
      });
    }
  };

  const saveCombination = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (generatedNumbers.length === 0) {
      toast({
        title: "No Numbers",
        description: "Generate numbers first before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("lottery_generations")
        .select("id")
        .eq("user_id", user.id)
        .eq("main_numbers", generatedNumbers)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("lottery_generations")
          .update({ is_favorite: true })
          .eq("id", existing.id);
      }

      await loadHistory();
      
      toast({
        title: "Combination Saved! 💾",
        description: "Your lucky numbers have been marked as favorite.",
      });
    } catch (error) {
      console.error("Error saving combination:", error);
      toast({
        title: "Error",
        description: "Failed to save combination",
        variant: "destructive",
      });
    }
  };

  // Mock hot and cold numbers
  const hotNumbers = [12, 23, 34, 41, 17, 29];
  const coldNumbers = [5, 18, 27, 36, 45, 8];

  return (
    <div className="min-h-screen bg-background">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access AI-powered lottery predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* User Header */}
          <div className="border-b bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{user.email}</span>
                {subscription?.subscribed && (
                  <Badge className={subscription.tier === "pro" ? "bg-purple-500" : ""}>
                    {subscription.tier === "pro" ? "Pro" : "Basic"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/lottery-history")}>
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                {subscription?.subscribed && (
                  <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={checkSubscription} disabled={checkingSubscription}>
                  Refresh Status
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Subscription Status Banner */}
          {subscription?.subscribed ? (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
              <div className="container mx-auto px-4 py-3 text-center">
                <p className="text-sm">
                  Your <strong>{subscription.tier === "pro" ? "Pro" : "Basic"}</strong> plan is active. 
                  {subscription.tier === "pro" ? (
                    <strong className="ml-1">Unlimited generations remaining</strong>
                  ) : (
                    <strong className="ml-1">{subscription.limit - (subscription.generations_used || 0)} generations remaining this month</strong>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-200">
              <div className="container mx-auto px-4 py-3 text-center">
                <p className="text-sm font-medium">
                  ⚠️ No active subscription. <strong>Subscribe now to start generating lucky numbers!</strong>
                </p>
              </div>
            </div>
          )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Predictions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Lottery Numbers - AI Predictions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI generates "lucky" numbers based on historical data and your personal preferences
          </p>
          
          {/* Detailed Description */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto text-left border border-border/50 mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">About Lottery AI Predictions</h2>
            <p className="text-muted-foreground mb-4">
              Lottery AI is an advanced analytical tool that uses machine learning algorithms to analyze historical lottery data and generate number combinations based on statistical patterns. Our AI examines millions of past draws to identify trends, frequencies, and patterns that may help inform your number selection.
            </p>
            
            <h3 className="font-semibold mb-2">How to Use:</h3>
            <ul className="text-muted-foreground space-y-2 mb-4 list-disc list-inside">
              <li><strong>Select Lottery Type:</strong> Choose from EuroJackpot, Lotto 6/49, Powerball, or Mega Millions</li>
              <li><strong>Generate Numbers:</strong> Click the "Generate Lucky Numbers" button to receive AI-analyzed combinations</li>
              <li><strong>View Statistics:</strong> Explore hot/cold numbers, frequency analysis, and pattern insights</li>
              <li><strong>Save Favorites:</strong> Store your preferred combinations for easy access later</li>
              <li><strong>Save Favorites:</strong> Mark your preferred combinations for quick access</li>
            </ul>
            
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Support for multiple international lottery formats</li>
              <li>Real-time statistical analysis of historical draw data</li>
              <li>Hot numbers (frequently drawn) and cold numbers (rarely drawn) tracking</li>
              <li>Pattern analysis including odd/even ratio and high/low balance</li>
              <li>Personal combination history and favorites management</li>
              <li>Pro plan includes unlimited generations and advanced analytics</li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={generateNumbers}
              disabled={isGenerating}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isGenerating ? "Generating..." : "Generate Lucky Numbers"}
            </Button>
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Statistics
            </Button>
          </div>
        </div>
      </section>

      {/* Main Generator Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="saved">Saved ({savedCombinations.length})</TabsTrigger>
            </TabsList>

            {/* Generator Tab */}
            <TabsContent value="generator" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Generator */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Lottery Type</CardTitle>
                      <CardDescription>Choose your preferred lottery game</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedLottery.id}
                        onValueChange={(value) => {
                          const lottery = LOTTERY_TYPES.find((l) => l.id === value);
                          if (lottery) setSelectedLottery(lottery);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOTTERY_TYPES.map((lottery) => (
                            <SelectItem key={lottery.id} value={lottery.id}>
                              {lottery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Your AI-Generated Lucky Numbers
                      </CardTitle>
                      <CardDescription>
                        Based on {selectedLottery.name} - {selectedLottery.mainBalls} main numbers
                        {selectedLottery.bonusCount > 0 && ` + ${selectedLottery.bonusCount} bonus`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {generatedNumbers.length === 0 ? (
                        <div className="text-center py-12">
                          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Click "Generate Lucky Numbers" to get your AI predictions
                          </p>
                          <Button onClick={generateNumbers} size="lg" disabled={isGenerating}>
                            <Sparkles className="mr-2 h-5 w-5" />
                            {isGenerating ? "Analyzing..." : "Generate Now"}
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Main Numbers */}
                          <div>
                            <p className="text-sm font-medium mb-3">Main Numbers:</p>
                            <div className="flex flex-wrap gap-3">
                              {generatedNumbers.map((num, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bonus Numbers */}
                          {bonusNumbers.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-3">Bonus Numbers:</p>
                              <div className="flex flex-wrap gap-3">
                                {bonusNumbers.map((num, idx) => (
                                  <div
                                    key={idx}
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Analysis Section */}
                          {aiAnalysis && (
                            <div className="border-t pt-4 space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                AI Analysis & Insights
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Confidence:</strong> <Badge variant={aiAnalysis.confidence === 'high' ? 'default' : 'secondary'}>{aiAnalysis.confidence}</Badge></p>
                                <p><strong>Strategy:</strong> {aiAnalysis.reasoning}</p>
                                <div>
                                  <strong>Statistics:</strong>
                                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                    <div>Even: {aiAnalysis.statistics?.evenCount || 0}</div>
                                    <div>Odd: {aiAnalysis.statistics?.oddCount || 0}</div>
                                    <div>High: {aiAnalysis.statistics?.highCount || 0}</div>
                                    <div>Low: {aiAnalysis.statistics?.lowCount || 0}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3 pt-4">
                            <Button onClick={generateNumbers} className="flex-1" disabled={isGenerating}>
                              <Sparkles className="mr-2 h-4 w-4" />
                              {isGenerating ? "Analyzing..." : "Generate New"}
                            </Button>
                            <Button onClick={saveCombination} variant="outline">
                              <Save className="mr-2 h-4 w-4" />
                              Save Combination
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Hot & Cold Numbers Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                        Hot Numbers
                      </CardTitle>
                      <CardDescription>Most frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {hotNumbers.map((num) => (
                          <div
                            key={num}
                            className="aspect-square rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-500"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-blue-500" />
                        Cold Numbers
                      </CardTitle>
                      <CardDescription>Least frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {coldNumbers.map((num) => (
                          <div
                            key={num}
                            className="aspect-square rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Frequency Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { num: 7, freq: 42, color: "bg-red-500" },
                        { num: 14, freq: 38, color: "bg-orange-500" },
                        { num: 21, freq: 35, color: "bg-yellow-500" },
                        { num: 28, freq: 31, color: "bg-green-500" },
                        { num: 35, freq: 28, color: "bg-blue-500" },
                      ].map((item) => (
                        <div key={item.num} className="flex items-center gap-3">
                          <div className="w-12 text-center font-bold">{item.num}</div>
                          <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all`}
                              style={{ width: `${item.freq}%` }}
                            />
                          </div>
                          <div className="w-16 text-right text-sm text-muted-foreground">
                            {item.freq}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">Odd/Even Ratio</span>
                      <Badge>3:3 Optimal</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">High/Low Balance</span>
                      <Badge>Balanced</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">Consecutive Numbers</span>
                      <Badge variant="outline">Low Probability</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Saved Combinations Tab */}
            <TabsContent value="saved" className="mt-8">
              {savedCombinations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Save className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No saved combinations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Generate and save your favorite number combinations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedCombinations.map((combo) => (
                    <Card key={combo.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{combo.lottery_type}</CardTitle>
                          <Badge variant="secondary">
                            {new Date(combo.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {combo.main_numbers?.map((num: number, idx: number) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary"
                            >
                              {num}
                            </div>
                          ))}
                          {combo.bonus_numbers?.map((num: number, idx: number) => (
                            <div
                              key={`bonus-${idx}`}
                              className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center font-bold text-orange-500"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">
              Unlock advanced AI predictions and analytics
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isCurrentPlan = subscription?.tier === tier.tier;
              return (
                <Card
                  key={tier.name}
                  className={`relative ${
                    tier.popular ? "border-2 border-primary shadow-xl scale-105" : ""
                  } ${isCurrentPlan ? "border-2 border-green-500" : ""}`}
                >
                  {tier.popular && !isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                      Current Plan
                    </Badge>
                  )}
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">€{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(tier.tier as "basic" | "pro")}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to maximize your lottery strategy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Multiple Lottery Types",
                description: "Support for EuroJackpot, Lotto 6/49, Powerball, Mega Millions, and more",
              },
              {
                icon: BarChart3,
                title: "Historical Statistics",
                description: "Deep analysis of past draws and number frequency patterns",
              },
              {
                icon: TrendingUp,
                title: "Hot & Cold Analysis",
                description: "Track frequently and rarely drawn numbers for informed decisions",
              },
              {
                icon: Save,
                title: "Saved Combinations",
                description: "Store and manage your favorite number combinations",
              },
              {
                icon: Calendar,
                title: "Generation History",
                description: "Track all your generated combinations with dates and statistics",
              },
              {
                icon: Zap,
                title: "AI-Powered Predictions",
                description: "Advanced machine learning algorithms analyze patterns",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer & Consumer Protection */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-6">Disclaimer & Consumer Protection</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please read the following points carefully to clearly understand the nature of this service.
          </p>
          
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">1. Purpose of Service</h3>
              <p className="mb-2">
                This tool (including AI predictions, pattern analysis, and notifications) is intended solely for entertainment, informational, and analytical purposes.
              </p>
              <p className="font-medium text-destructive">
                This is NOT investment advice, financial advice, or a guaranteed path to winning in gambling.
              </p>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">2. About AI Predictions</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Machine Learning algorithms analyze exclusively historical data and patterns from past draws.</li>
                <li>AI does NOT have the ability to predict the future or influence the random lottery drawing process.</li>
                <li>The probability of winning the lottery is fixed, and no software predictions, patterns, or notifications can increase it. Each draw is an independent event.</li>
              </ul>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">3. Notifications & Subscription</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Notifications are based on historical statistical analysis, numerological data, or personalized preferences. They do NOT represent a prediction of an actual day with a higher chance of winning.</li>
                <li>The subscription fee ("Pro Plan") is charged for access to advanced analytical and notification software tools, NOT for an increased chance of winning.</li>
              </ul>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">4. Disclaimer of Liability</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>There is NO guarantee of winning.</strong> The operator provides no guarantees of success, winnings, or profit when using numbers or notifications generated by this tool.</li>
                <li>Users are solely responsible for their gambling decisions and any financial losses that may arise from gambling.</li>
                <li className="font-medium text-primary">Play responsibly. If you suspect a gambling problem, seek help immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service */}
      <section className="py-12 px-4 bg-card border-t">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-6">Terms of Service</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            By using Lottery AI, you agree to the following terms and conditions.
          </p>
          
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">1. Purpose of Service</h3>
              <p className="mb-2">
                This tool (including AI predictions, pattern analysis, and notifications) is intended solely for entertainment, informational, and analytical purposes.
              </p>
              <p className="font-medium text-destructive">
                This is NOT investment advice, financial advice, or a guaranteed path to winning in gambling.
              </p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">2. About AI Predictions</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Machine Learning algorithms analyze exclusively historical data and patterns from past draws.</li>
                <li>AI does NOT have the ability to predict the future or influence the random lottery drawing process.</li>
                <li>The probability of winning the lottery is fixed, and no software predictions, patterns, or notifications can increase it. Each draw is an independent event.</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">3. Notifications & Subscription</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Notifications are based on historical statistical analysis, numerological data, or personalized preferences. They do NOT represent a prediction of an actual day with a higher chance of winning.</li>
                <li>The subscription fee ("Pro Plan") is charged for access to advanced analytical and notification software tools, NOT for an increased chance of winning.</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">4. Disclaimer of Liability</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>There is NO guarantee of winning.</strong> The operator provides no guarantees of success, winnings, or profit when using numbers or notifications generated by this tool.</li>
                <li>Users are solely responsible for their gambling decisions and any financial losses that may arise from gambling.</li>
                <li className="font-medium text-primary">Play responsibly. If you suspect a gambling problem, seek help immediately.</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">5. User Responsibilities</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Users must be of legal gambling age in their jurisdiction to use this service.</li>
                <li>Users are responsible for complying with all local laws and regulations regarding lottery participation.</li>
                <li>Users agree not to misrepresent the nature of this service to others.</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">6. Subscription & Payment Terms</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Subscriptions are billed monthly and can be cancelled at any time through the customer portal.</li>
                <li>Refunds are handled according to Stripe's refund policies.</li>
                <li>The operator reserves the right to modify pricing with 30 days advance notice.</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-2">7. Acceptance of Terms</h3>
              <p>
                By subscribing to or using the Lottery AI service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and the Disclaimer above. If you do not agree to these terms, please do not use this service.
              </p>
            </div>
          </div>
        </div>
      </section>
      </>
    )}
    </div>
  );
}
