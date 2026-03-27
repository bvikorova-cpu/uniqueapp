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
import { motion, AnimatePresence } from "framer-motion";
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
  Shield,
  AlertTriangle,
  BookOpen,
  Dices,
  Target,
  Flame,
  ArrowRight,
} from "lucide-react";
import { LotteryHero } from "@/components/lottery/LotteryHero";

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
    color: "from-primary to-accent",
    popular: true,
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Choose Lottery", description: "Select from EuroJackpot, Powerball, Mega Millions & more", icon: Dices },
  { step: 2, title: "AI Analyzes", description: "Machine learning processes millions of historical draws", icon: BarChart3 },
  { step: 3, title: "Get Numbers", description: "Receive optimized combinations with confidence scores", icon: Target },
  { step: 4, title: "Track & Save", description: "Save favorites and monitor your generation history", icon: Save },
];

export default function LotteryAI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  
  const [selectedLottery, setSelectedLottery] = useState(LOTTERY_TYPES[0]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkAuth();
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
    return () => { authSubscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Payment Successful! 🎉", description: "Your subscription is now active." });
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
    if (!user) { navigate("/auth"); return; }
    try {
      const priceId = SUBSCRIPTION_TIERS[tier].price_id;
      const { data, error } = await supabase.functions.invoke("create-lottery-subscription", {
        body: { priceId },
      });
      if (error) throw error;
      if (data.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to start checkout", variant: "destructive" });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to open customer portal", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const generateNumbers = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!subscription?.subscribed) {
      toast({ title: "Subscription Required", description: "You need an active subscription to generate lucky numbers.", variant: "destructive" });
      return;
    }

    if (subscription.isBasic && !subscription.isPro) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count, error: countError } = await supabase
        .from("lottery_generations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart);
      if (countError) console.error("Error checking generation count:", countError);
      else if (count !== null && count >= 10) {
        toast({ title: "Generation Limit Reached", description: "Upgrade to Pro for more generations!", variant: "destructive" });
        return;
      }
    }

    setIsGenerating(true);
    let generatedData: any = null;
    
    try {
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        'generate-lottery-numbers',
        { body: { lotteryType: selectedLottery.id, preferences: {} } }
      );
      if (aiError) throw aiError;
      generatedData = aiResult;
      setGeneratedNumbers(aiResult.numbers);
      setBonusNumbers(aiResult.bonusNumbers || []);
      setAiAnalysis(aiResult.analysis);
      toast({ title: "AI Analysis Complete! 🤖", description: aiResult.analysis.reasoning });
    } catch (error: any) {
      console.error('Error generating numbers:', error);
      toast({ title: "Generation Error", description: error.message || "Failed to generate numbers.", variant: "destructive" });
      setIsGenerating(false);
      return;
    }

    try {
      await supabase.from("lottery_generations").insert({
        user_id: user.id,
        lottery_type: selectedLottery.name,
        main_numbers: generatedData.numbers,
        bonus_numbers: generatedData.bonusNumbers && generatedData.bonusNumbers.length > 0 ? generatedData.bonusNumbers : null,
      });
      await loadHistory();
      setIsGenerating(false);
      toast({ title: "Numbers Generated! 🎰", description: "Your AI-predicted lucky numbers are ready!" });
    } catch (error) {
      console.error("Error saving generation:", error);
      setIsGenerating(false);
    }
  };

  const saveCombination = async () => {
    if (!user) { navigate("/auth"); return; }
    if (generatedNumbers.length === 0) {
      toast({ title: "No Numbers", description: "Generate numbers first before saving", variant: "destructive" });
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
        await supabase.from("lottery_generations").update({ is_favorite: true }).eq("id", existing.id);
      }
      await loadHistory();
      toast({ title: "Combination Saved! 💾", description: "Your lucky numbers have been marked as favorite." });
    } catch (error) {
      console.error("Error saving combination:", error);
      toast({ title: "Error", description: "Failed to save combination", variant: "destructive" });
    }
  };

  const hotNumbers = [12, 23, 34, 41, 17, 29];
  const coldNumbers = [5, 18, 27, 36, 45, 8];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 text-center">
              <CardHeader>
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-black">Sign In Required</CardTitle>
                <CardDescription>Please sign in to access AI-powered lottery predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* User Header Bar */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-sm hidden sm:inline">{user.email}</span>
            {subscription?.subscribed && (
              <Badge className={`${subscription.tier === "pro" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                {subscription.tier === "pro" ? "Pro" : "Basic"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/lottery-history")} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <History className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            {subscription?.subscribed && (
              <Button variant="outline" size="sm" onClick={handleManageSubscription} className="border-border/50 bg-card/50 backdrop-blur-sm hidden sm:flex">
                <Settings className="mr-2 h-4 w-4" />
                Manage
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Status Banner */}
      {subscription?.subscribed ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2.5 text-center">
            <p className="text-sm flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <strong>{subscription.tier === "pro" ? "Pro" : "Basic"}</strong> plan active
              {subscription.tier === "pro" ? (
                <span className="text-muted-foreground">• Unlimited generations</span>
              ) : (
                <span className="text-muted-foreground">• {subscription.limit - (subscription.generations_used || 0)} generations left</span>
              )}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20">
          <div className="container mx-auto px-4 py-2.5 text-center">
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              No active subscription. <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary font-bold underline underline-offset-2">Subscribe now!</button>
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <LotteryHero />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 text-center group hover:border-primary/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-1">Step {item.step}</div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Generator Section */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-card/80 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="saved">Saved ({savedCombinations.length})</TabsTrigger>
            </TabsList>

            {/* Generator Tab */}
            <TabsContent value="generator" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="font-black">Select Lottery Type</CardTitle>
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
                        <SelectTrigger className="bg-background/50 border-border/50">
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

                  <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-black">
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
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                            <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          </motion.div>
                          <p className="text-muted-foreground mb-4">Click "Generate Lucky Numbers" to get your AI predictions</p>
                          <Button onClick={generateNumbers} size="lg" disabled={isGenerating} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                            <Sparkles className="mr-2 h-5 w-5" />
                            {isGenerating ? "Analyzing..." : "Generate Now"}
                          </Button>
                        </div>
                      ) : (
                        <AnimatePresence>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                              <p className="text-sm font-bold mb-3">Main Numbers:</p>
                              <div className="flex flex-wrap gap-3">
                                {generatedNumbers.map((num, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: idx * 0.1, type: "spring" }}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl sm:text-2xl font-black text-primary-foreground shadow-lg shadow-primary/20"
                                  >
                                    {num}
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {bonusNumbers.length > 0 && (
                              <div>
                                <p className="text-sm font-bold mb-3">Bonus Numbers:</p>
                                <div className="flex flex-wrap gap-3">
                                  {bonusNumbers.map((num, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ scale: 0, rotate: 180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: (generatedNumbers.length + idx) * 0.1, type: "spring" }}
                                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg shadow-orange-500/20"
                                    >
                                      {num}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {aiAnalysis && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-border/50 pt-4 space-y-3">
                                <h4 className="font-black flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-primary" />
                                  AI Analysis & Insights
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Confidence:</strong> <Badge className={aiAnalysis.confidence === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-muted'}>{aiAnalysis.confidence}</Badge></p>
                                  <p><strong>Strategy:</strong> {aiAnalysis.reasoning}</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                    {[
                                      { label: "Even", value: aiAnalysis.statistics?.evenCount || 0 },
                                      { label: "Odd", value: aiAnalysis.statistics?.oddCount || 0 },
                                      { label: "High", value: aiAnalysis.statistics?.highCount || 0 },
                                      { label: "Low", value: aiAnalysis.statistics?.lowCount || 0 },
                                    ].map(s => (
                                      <div key={s.label} className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
                                        <div className="text-lg font-black">{s.value}</div>
                                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            <div className="flex gap-3 pt-4">
                              <Button onClick={generateNumbers} className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground" disabled={isGenerating}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isGenerating ? "Analyzing..." : "Generate New"}
                              </Button>
                              <Button onClick={saveCombination} variant="outline" className="border-border/50">
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-black text-base">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                        Hot Numbers
                      </CardTitle>
                      <CardDescription>Most frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {hotNumbers.map((num) => (
                          <div key={num} className="aspect-square rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-black text-red-500 text-lg">
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-black text-base">
                        <TrendingDown className="h-5 w-5 text-blue-500" />
                        Cold Numbers
                      </CardTitle>
                      <CardDescription>Least frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {coldNumbers.map((num) => (
                          <div key={num} className="aspect-square rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-lg">
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="font-black text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={() => navigate("/lottery-history")}>
                        <History className="mr-2 h-4 w-4" /> View Full History
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={checkSubscription} disabled={checkingSubscription}>
                        <Zap className="mr-2 h-4 w-4" /> Refresh Status
                      </Button>
                      {subscription?.subscribed && (
                        <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={handleManageSubscription}>
                          <Settings className="mr-2 h-4 w-4" /> Manage Subscription
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="font-black">Historical Frequency Analysis</CardTitle>
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
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-sm">{item.num}</div>
                          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.freq}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className={`h-full ${item.color} rounded-full`}
                            />
                          </div>
                          <div className="w-12 text-right text-sm font-bold">{item.freq}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="font-black">Pattern Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Odd/Even Ratio", value: "3:3 Optimal", variant: "default" as const },
                      { label: "High/Low Balance", value: "Balanced", variant: "default" as const },
                      { label: "Consecutive Numbers", value: "Low Probability", variant: "outline" as const },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/30">
                        <span className="font-bold text-sm">{item.label}</span>
                        <Badge variant={item.variant} className={item.variant === "default" ? "bg-primary/20 text-primary border-primary/30" : ""}>{item.value}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Saved Combinations Tab */}
            <TabsContent value="saved" className="mt-8">
              {savedCombinations.length === 0 ? (
                <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                  <CardContent className="pt-6 text-center py-12">
                    <Save className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-black mb-2">No saved combinations yet</p>
                    <p className="text-sm text-muted-foreground">Generate and save your favorite number combinations</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedCombinations.map((combo, i) => (
                    <motion.div key={combo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black">{combo.lottery_type}</CardTitle>
                            <Badge variant="secondary" className="text-[10px]">
                              {new Date(combo.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {combo.main_numbers?.map((num: number, idx: number) => (
                              <div key={idx} className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
                                {num}
                              </div>
                            ))}
                            {combo.bonus_numbers?.map((num: number, idx: number) => (
                              <div key={`bonus-${idx}`} className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-500 text-sm">
                                {num}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Choose Your Plan</h2>
            <p className="text-muted-foreground">Unlock advanced AI predictions and analytics</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PRICING_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              const isCurrentPlan = subscription?.tier === tier.tier;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`relative bg-card/80 backdrop-blur-xl ${
                    tier.popular ? "border-2 border-primary shadow-xl shadow-primary/10 scale-[1.02]" : "border-border/50"
                  } ${isCurrentPlan ? "border-2 border-green-500" : ""}`}>
                    {tier.popular && !isCurrentPlan && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    {isCurrentPlan && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">
                        Current Plan
                      </Badge>
                    )}
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="font-black">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">€{tier.price}</span>
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
                        className={`w-full mt-6 ${tier.popular ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                        variant={tier.popular ? "default" : "outline"}
                        onClick={() => handleSubscribe(tier.tier as "basic" | "pro")}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
                        {!isCurrentPlan && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to maximize your lottery strategy</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: "Multiple Lottery Types", description: "EuroJackpot, Lotto 6/49, Powerball, Mega Millions and more" },
              { icon: BarChart3, title: "Historical Statistics", description: "Deep analysis of past draws and number frequency patterns" },
              { icon: TrendingUp, title: "Hot & Cold Analysis", description: "Track frequently and rarely drawn numbers" },
              { icon: Save, title: "Saved Combinations", description: "Store and manage your favorite number combinations" },
              { icon: Calendar, title: "Generation History", description: "Track all generated combinations with dates" },
              { icon: Zap, title: "AI-Powered Predictions", description: "Advanced ML algorithms analyze patterns" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all h-full">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-black">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer & Consumer Protection */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-black text-center mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Disclaimer & Consumer Protection</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Please read the following points carefully to understand the nature of this service.
            </p>
          </motion.div>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            {[
              { title: "1. Purpose of Service", icon: BookOpen, content: "This tool is intended solely for entertainment, informational, and analytical purposes.", warning: "This is NOT investment advice, financial advice, or a guaranteed path to winning in gambling." },
              { title: "2. About AI Predictions", icon: Sparkles, list: [
                "Machine Learning algorithms analyze exclusively historical data and patterns from past draws.",
                "AI does NOT have the ability to predict the future or influence the random lottery drawing process.",
                "The probability of winning the lottery is fixed. Each draw is an independent event."
              ]},
              { title: "3. Notifications & Subscription", icon: Settings, list: [
                "Notifications are based on historical statistical analysis, NOT a prediction of an actual day with a higher chance of winning.",
                "The subscription fee is charged for access to advanced analytical tools, NOT for an increased chance of winning."
              ]},
              { title: "4. Disclaimer of Liability", icon: Shield, list: [
                "There is NO guarantee of winning. The operator provides no guarantees of success or profit.",
                "Users are solely responsible for their gambling decisions and any financial losses.",
                "Play responsibly. If you suspect a gambling problem, seek help immediately."
              ]},
            ].map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-black text-foreground mb-2 flex items-center gap-2">
                      <section.icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </h3>
                    {section.content && <p className="mb-2">{section.content}</p>}
                    {section.warning && <p className="font-bold text-destructive">{section.warning}</p>}
                    {section.list && (
                      <ul className="space-y-1.5 list-disc list-inside">
                        {section.list.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms of Service */}
      <section className="py-12 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-black text-center mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Terms of Service</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            By using Lottery AI, you agree to the following terms and conditions.
          </p>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            {[
              { title: "1. Purpose of Service", content: "This tool is intended solely for entertainment, informational, and analytical purposes.", warning: "This is NOT investment advice, financial advice, or a guaranteed path to winning in gambling." },
              { title: "2. About AI Predictions", list: [
                "Machine Learning algorithms analyze exclusively historical data.",
                "AI does NOT have the ability to predict the future.",
                "The probability of winning is fixed. Each draw is an independent event."
              ]},
              { title: "3. Notifications & Subscription", list: [
                "Notifications are based on historical statistical analysis.",
                "The subscription fee is for access to advanced analytical tools."
              ]},
              { title: "4. Disclaimer of Liability", list: [
                "There is NO guarantee of winning.",
                "Users are solely responsible for their decisions.",
                "Play responsibly."
              ]},
              { title: "5. User Responsibilities", list: [
                "Users must be of legal gambling age in their jurisdiction.",
                "Users are responsible for complying with all local laws.",
                "Users agree not to misrepresent the nature of this service."
              ]},
              { title: "6. Subscription & Payment Terms", list: [
                "Subscriptions are billed monthly and can be cancelled at any time.",
                "Refunds are handled according to Stripe's refund policies.",
                "The operator reserves the right to modify pricing with 30 days notice."
              ]},
              { title: "7. Acceptance of Terms", content: "By subscribing to or using the Lottery AI service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service." },
            ].map((section, i) => (
              <Card key={i} className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-black text-foreground mb-2">{section.title}</h3>
                  {section.content && <p>{section.content}</p>}
                  {section.warning && <p className="font-bold text-destructive mt-1">{section.warning}</p>}
                  {section.list && (
                    <ul className="space-y-1 list-disc list-inside">
                      {section.list.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
