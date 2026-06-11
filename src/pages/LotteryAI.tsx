import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { savePendingAction } from "@/lib/pendingAction";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Star, Save, Zap, BarChart3, Coins, Check,
  ArrowRight, Dices, Target, BookOpen, Shield, Settings, AlertTriangle,
  Bell, Share2, Trophy, Radio, ArrowLeft,
} from "lucide-react";
import { LotteryHero } from "@/components/lottery/LotteryHero";
import { LotteryStreak } from "@/components/lottery/LotteryStreak";
import { LotteryProgress } from "@/components/lottery/LotteryProgress";
import { LotteryAchievements } from "@/components/lottery/LotteryAchievements";
import { LotterySidebar } from "@/components/lottery/LotterySidebar";
import { LotteryQuestionnaire } from "@/components/lottery/LotteryQuestionnaire";
import { LotteryPushNotifications } from "@/components/lottery/LotteryPushNotifications";
import { LotterySocialSharing } from "@/components/lottery/LotterySocialSharing";
import { LotteryWinTracker } from "@/components/lottery/LotteryWinTracker";
import { LotterySmartPicks } from "@/components/lottery/LotterySmartPicks";
import { LotteryLiveDraws } from "@/components/lottery/LotteryLiveDraws";
import { LotteryLeaderboard } from "@/components/lottery/LotteryLeaderboard";
import { LotteryDreamDecoder } from "@/components/lottery/LotteryDreamDecoder";
import { LotteryNumerology } from "@/components/lottery/LotteryNumerology";
import { LotteryHeatmapLab } from "@/components/lottery/LotteryHeatmapLab";
import { LotterySyndicate } from "@/components/lottery/LotterySyndicate";
import { LotteryParityPack } from "@/components/lottery/LotteryParityPack";
import { Moon, Hash, Activity, Users } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const LOTTERY_TYPES = [
  { id: "eurojackpot", name: "EuroJackpot", maxNumber: 50, bonusBalls: 12, mainBalls: 5, bonusCount: 2 },
  { id: "lotto", name: "Lotto 6/49", maxNumber: 49, bonusBalls: 0, mainBalls: 6, bonusCount: 0 },
  { id: "powerball", name: "Powerball", maxNumber: 69, bonusBalls: 26, mainBalls: 5, bonusCount: 1 },
  { id: "megamillions", name: "Mega Millions", maxNumber: 70, bonusBalls: 25, mainBalls: 5, bonusCount: 1 },
];

const SUBSCRIPTION_TIERS = {
  basic: { price_id: "price_1STrLuGaXSfGtYFtgA9rNDxL", product_id: "prod_TQinlyjGo50cTk" },
  pro: { price_id: "price_1STrLwGaXSfGtYFtdbmjAGKA", product_id: "prod_TQinw9pUYC81T8" },
};

const PRICING_TIERS = [
  {
    name: "Basic", tier: "basic", price: "4.99", period: "month",
    features: ["10 generations per month", "Basic statistics", "Hot & Cold numbers", "Save up to 5 combinations"],
    icon: Star, color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro", tier: "pro", price: "9.99", period: "month",
    features: ["30 generations per month", "Advanced analytics", "Pattern notifications", "Save unlimited combinations", "Historical pattern analysis", "Priority AI processing"],
    icon: Zap, color: "from-primary to-accent", popular: true,
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Choose Lottery", description: "Select from EuroJackpot, Powerball & more", icon: Dices },
  { step: 2, title: "AI Analyzes", description: "ML processes millions of historical draws", icon: BarChart3 },
  { step: 3, title: "Get Numbers", description: "Optimized combinations with confidence scores", icon: Target },
  { step: 4, title: "Track & Save", description: "Save favorites and monitor history", icon: Save },
];

export default function LotteryAI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [activeView, setActiveView] = useState<"hub" | "notifications" | "sharing" | "wintracker" | "smartpicks" | "livedraws" | "leaderboard" | "dream" | "numerology" | "heatmap" | "syndicate">("hub");

  const [selectedLottery, setSelectedLottery] = useState(LOTTERY_TYPES[0]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const FEATURE_CARDS = [
    { id: "notifications" as const, icon: Bell, label: "Push Notifications", desc: "Lucky day alerts", color: "from-violet-500 to-purple-600" },
    { id: "sharing" as const, icon: Share2, label: "Social Sharing", desc: "Share combos with friends", color: "from-blue-500 to-cyan-500" },
    { id: "wintracker" as const, icon: Target, label: "Win Tracker", desc: "Track your results", color: "from-emerald-500 to-green-600" },
    { id: "smartpicks" as const, icon: Zap, label: "Smart Picks", desc: "AI top 3 combos", color: "from-orange-500 to-red-500" },
    { id: "livedraws" as const, icon: Radio, label: "Live Draws", desc: "Real-time results", color: "from-red-500 to-pink-500" },
    { id: "leaderboard" as const, icon: Trophy, label: "Leaderboard", desc: "Top players ranking", color: "from-yellow-500 to-amber-500" },
    { id: "dream" as const, icon: Moon, label: "Dream Decoder", desc: "Numbers from dreams · 5 cr", color: "from-purple-600 to-amber-500" },
    { id: "numerology" as const, icon: Hash, label: "Numerology", desc: "Personal numbers · 3 cr", color: "from-indigo-500 to-amber-500" },
    { id: "heatmap" as const, icon: Activity, label: "Heatmap Lab", desc: "Hot/cold AI map · 4 cr", color: "from-rose-500 to-amber-500" },
    { id: "syndicate" as const, icon: Users, label: "Squad Play", desc: "Pool & split winnings", color: "from-emerald-500 to-amber-500" },
  ];

  useEffect(() => {
    checkAuth();
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { checkSubscription(); loadHistory(); }
      else { setSubscription(null); setSavedCombinations([]); }
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        void checkSubscription();
        void loadHistory();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user && !await supabase.auth.getSession().then(({ data }) => data.session?.user)) return;
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-lottery-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch (error) { console.error("Error checking subscription:", error); }
    finally { setCheckingSubscription(false); }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("lottery_generations").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      setSavedCombinations(data || []);
    } catch (error) { console.error("Error loading history:", error); }
  };

  const describeError = (error: any, fallback: string): { title: string; description: string } => {
    const raw = (error?.message || error?.error_description || "").toString();
    const msg = raw.toLowerCase();
    if (!raw && !error) return { title: "Network Issue", description: "Please check your connection and try again." };
    if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("not authenticated")) {
      return { title: "Sign-in Required", description: "Your session expired. Please sign in again." };
    }
    if (msg.includes("402") || msg.includes("insufficient") || msg.includes("credit")) {
      return { title: "Not Enough Credits", description: "Top up your AI credits to continue." };
    }
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) {
      return { title: "Slow Down", description: "Too many requests. Try again in a moment." };
    }
    if (msg.includes("403") || msg.includes("forbidden") || msg.includes("subscription")) {
      return { title: "Subscription Required", description: "An active subscription is required for this action." };
    }
    if (msg.includes("400") || msg.includes("validation") || msg.includes("invalid") || msg.includes("required")) {
      return { title: "Invalid Input", description: raw || "Please check the inputs and try again." };
    }
    if (msg.includes("failed to fetch") || msg.includes("network")) {
      return { title: "Network Issue", description: "Please check your connection and try again." };
    }
    if (msg.includes("stripe") || msg.includes("checkout") || msg.includes("payment")) {
      return { title: "Payment Error", description: raw || "Stripe checkout failed. Try again." };
    }
    return { title: "Error", description: raw || fallback };
  };

  const handleSubscribe = async (tier: "basic" | "pro") => {
    if (!user) {
      toast({ title: "Sign-in Required", description: "Please sign in to subscribe.", variant: "destructive" });
      savePendingAction({ key: "lottery-ai:open", returnTo: "/lottery-ai" }); navigate("/auth");
      return;
    }
    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      toast({ title: "Invalid Plan", description: "Please choose Basic or Pro.", variant: "destructive" });
      return;
    }
    try {
      const priceId = SUBSCRIPTION_TIERS[tier].price_id;
      const { data, error } = await supabase.functions.invoke("create-lottery-subscription", { body: { priceId } });
      if (error) throw error;
      if (!data?.url) {
        toast({ title: "Checkout Unavailable", description: "Stripe didn't return a checkout URL. Try again shortly.", variant: "destructive" });
        return;
      }
      window.open(data.url, "_blank");
      toast({ title: "Redirecting to Stripe…", description: "Complete your payment in the new tab." });
    } catch (error: any) {
      const e = describeError(error, "Failed to start Stripe checkout.");
      toast({ title: e.title, description: e.description, variant: "destructive" });
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast({ title: "Sign-in Required", description: "Please sign in to manage your subscription.", variant: "destructive" });
      savePendingAction({ key: "lottery-ai:open", returnTo: "/lottery-ai" }); navigate("/auth");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (!data?.url) {
        toast({ title: "Portal Unavailable", description: "Stripe customer portal didn't return a URL.", variant: "destructive" });
        return;
      }
      window.open(data.url, "_blank");
    } catch (error: any) {
      const e = describeError(error, "Failed to open customer portal.");
      toast({ title: e.title, description: e.description, variant: "destructive" });
    }
  };

  const generateNumbers = async () => {
    if (!user) {
      toast({ title: "Sign-in Required", description: "Please sign in to generate numbers.", variant: "destructive" });
      savePendingAction({ key: "lottery-ai:open", returnTo: "/lottery-ai" }); navigate("/auth");
      return;
    }
    if (!subscription?.subscribed) {
      toast({ title: "Subscription Required", description: "Subscribe to Basic or Pro to generate AI lucky numbers.", variant: "destructive" });
      return;
    }
    if (!selectedLottery?.id) {
      toast({ title: "Invalid Input", description: "Please select a lottery type first.", variant: "destructive" });
      return;
    }
    if (subscription.isBasic && !subscription.isPro) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count, error: countError } = await supabase
        .from("lottery_generations").select("*", { count: 'exact', head: true })
        .eq("user_id", user.id).gte("created_at", monthStart);
      if (countError) {
        console.error("Error checking generation count:", countError);
        toast({ title: "Could Not Verify Limit", description: "We couldn't check your monthly usage. Try again.", variant: "destructive" });
        return;
      }
      if (count !== null && count >= 10) {
        toast({ title: "Monthly Limit Reached", description: "You've used 10/10 generations this month. Upgrade to Pro for more.", variant: "destructive" });
        return;
      }
    }

    setIsGenerating(true);
    let generatedData: any = null;
    try {
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        'generate-lottery-numbers', { body: { lotteryType: selectedLottery.id, preferences: {} } }
      );
      if (aiError) throw aiError;
      if (!aiResult?.numbers || !Array.isArray(aiResult.numbers) || aiResult.numbers.length === 0) {
        throw new Error("AI returned no numbers. Please try again.");
      }
      generatedData = aiResult;
      setGeneratedNumbers(aiResult.numbers);
      setBonusNumbers(aiResult.bonusNumbers || []);
      setAiAnalysis(aiResult.analysis);
      toast({ title: "AI Analysis Complete! 🤖", description: aiResult.analysis?.reasoning || "Your numbers are ready." });
    } catch (error: any) {
      console.error('Error generating numbers:', error);
      const e = describeError(error, "Failed to generate numbers.");
      toast({ title: e.title, description: e.description, variant: "destructive" });
      setIsGenerating(false);
      return;
    }

    try {
      const { error: insErr } = await supabase.from("lottery_generations").insert({
        user_id: user.id, lottery_type: selectedLottery.name,
        main_numbers: generatedData.numbers,
        bonus_numbers: generatedData.bonusNumbers?.length > 0 ? generatedData.bonusNumbers : null,
      });
      if (insErr) throw insErr;
      await loadHistory();
      setIsGenerating(false);
      toast({ title: "Numbers Generated! 🎰", description: "Saved to your history." });
    } catch (error: any) {
      console.error("Error saving generation:", error);
      setIsGenerating(false);
      const e = describeError(error, "Numbers generated but couldn't be saved to history.");
      toast({ title: `Saved Failed: ${e.title}`, description: e.description, variant: "destructive" });
    }
  };

  const saveCombination = async () => {
    if (!user) {
      toast({ title: "Sign-in Required", description: "Please sign in to save combinations.", variant: "destructive" });
      savePendingAction({ key: "lottery-ai:open", returnTo: "/lottery-ai" }); navigate("/auth");
      return;
    }
    if (generatedNumbers.length === 0) {
      toast({ title: "Nothing to Save", description: "Generate numbers first, then save them as favorite.", variant: "destructive" });
      return;
    }
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("lottery_generations")
        .select("id, main_numbers")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (fetchErr) throw fetchErr;
      const match = existing?.find(
        (row: any) => Array.isArray(row.main_numbers)
          && row.main_numbers.length === generatedNumbers.length
          && row.main_numbers.every((n: number, i: number) => n === generatedNumbers[i])
      );
      if (!match) {
        toast({ title: "Combination Not Found", description: "We couldn't locate this generation in your history. Generate again, then save.", variant: "destructive" });
        return;
      }
      const { error: updErr } = await supabase
        .from("lottery_generations")
        .update({ is_favorite: true })
        .eq("id", match.id);
      if (updErr) throw updErr;
      await loadHistory();
      toast({ title: "Combination Saved! 💾", description: "Marked as favorite in your history." });
    } catch (error: any) {
      console.error("Error saving combination:", error);
      const e = describeError(error, "Failed to save combination.");
      toast({ title: e.title, description: e.description, variant: "destructive" });
    }
  };

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

  if (activeView === "notifications") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryPushNotifications onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "sharing") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotterySocialSharing onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "wintracker") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryWinTracker onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "smartpicks") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotterySmartPicks onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "livedraws") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryLiveDraws onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "leaderboard") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryLeaderboard onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "dream") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryDreamDecoder onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "numerology") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryNumerology onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "heatmap") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotteryHeatmapLab onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "syndicate") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-2 sm:px-4 max-w-4xl">
      <LotterySyndicate onBack={() => setActiveView("hub")} />
    </div></div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Hero */}
        <LotteryHero />

        <HeroRewardedAd sectionKey="page_lotteryai" />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="bg-card/80 backdrop-blur-xl border-border/50 cursor-pointer hover:border-primary/30 hover:scale-[1.03] transition-all"
                onClick={() => setActiveView(card.id)}
              >
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-2`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-bold text-xs">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Engagement Row: Streak + Progress + Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <LotteryStreak />
          <LotteryProgress />
          <LotteryAchievements />
        </div>

        {/* Lottery Parity Pack - 8 advanced AI tools */}
        <div className="mb-8">
          <LotteryParityPack />
        </div>

        {/* Main 4-column grid like Education */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content - 3 cols */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/80 backdrop-blur-sm border">
                <TabsTrigger value="generator" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Sparkles className="h-4 w-4" /> Generator
                </TabsTrigger>
                <TabsTrigger value="statistics" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="h-4 w-4" /> Statistics
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Save className="h-4 w-4" /> Saved ({savedCombinations.length})
                </TabsTrigger>
              </TabsList>

              {/* Generator Tab */}
              <TabsContent value="generator">
                <div className="space-y-4">
                  {/* How It Works row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {HOW_IT_WORKS.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold">{item.title}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lottery Selector */}
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-black text-base">Select Lottery Type</CardTitle>
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
                            <SelectItem key={lottery.id} value={lottery.id}>{lottery.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Generated Numbers */}
                  <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-black">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI-Generated Lucky Numbers
                      </CardTitle>
                      <CardDescription>
                        {selectedLottery.name} - {selectedLottery.mainBalls} main numbers
                        {selectedLottery.bonusCount > 0 && ` + ${selectedLottery.bonusCount} bonus`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {generatedNumbers.length === 0 ? (
                        <div className="text-center py-12">
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                            <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          </motion.div>
                          <p className="text-muted-foreground mb-4">Click "Generate" to get your AI predictions</p>
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
                                  <motion.div key={idx} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: idx * 0.1, type: "spring" }}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl sm:text-2xl font-black text-primary-foreground shadow-lg shadow-primary/20">
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
                                    <motion.div key={idx} initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: (generatedNumbers.length + idx) * 0.1, type: "spring" }}
                                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg shadow-orange-500/20">
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
                                  AI Analysis
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
                                <Save className="mr-2 h-4 w-4" /> Save
                              </Button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics">
                <div className="space-y-4">
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
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.freq}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full ${item.color} rounded-full`} />
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

                  {/* Questionnaire */}
                  <LotteryQuestionnaire />
                </div>
              </TabsContent>

              {/* Saved Tab */}
              <TabsContent value="saved">
                {savedCombinations.length === 0 ? (
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                    <CardContent className="pt-6 text-center py-12">
                      <Save className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-black mb-2">No saved combinations yet</p>
                      <p className="text-sm text-muted-foreground">Generate and save your favorite number combinations</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
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

          {/* Sidebar - 1 col */}
          <LotterySidebar
            subscription={subscription}
            onRefreshStatus={checkSubscription}
            onManageSubscription={handleManageSubscription}
            checkingSubscription={checkingSubscription}
          />
        </div>

        {/* Pricing Section */}
        <div className="mt-12" id="pricing">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Choose Your Plan</h2>
            <p className="text-sm text-muted-foreground">Unlock advanced AI predictions and analytics</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PRICING_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              const isCurrentPlan = subscription?.tier === tier.tier;
              return (
                <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className={`relative bg-card/80 backdrop-blur-xl ${tier.popular ? "border-2 border-primary shadow-xl shadow-primary/10" : "border-border/50"} ${isCurrentPlan ? "border-2 border-green-500" : ""}`}>
                    {tier.popular && !isCurrentPlan && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">Most Popular</Badge>
                    )}
                    {isCurrentPlan && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">Current Plan</Badge>
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

        {/* Disclaimer */}
        <div className="mt-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="text-xl font-black mb-1 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Disclaimer & Consumer Protection</h2>
            <p className="text-xs text-muted-foreground">Please read carefully</p>
          </motion.div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {[
              { title: "Purpose of Service", icon: BookOpen, content: "This tool is for entertainment and analytical purposes only.", warning: "NOT investment advice or a guaranteed path to winning." },
              { title: "AI Predictions", icon: Sparkles, list: ["ML analyzes exclusively historical data.", "AI cannot predict the future.", "Each draw is an independent event."] },
              { title: "Subscription", icon: Settings, list: ["Notifications are based on statistical analysis.", "Subscription fee is for access to analytical tools."] },
              { title: "Liability", icon: Shield, list: ["No guarantee of winning.", "Users are responsible for their decisions.", "Play responsibly."] },
            ].map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-black text-foreground mb-2 flex items-center gap-2 text-sm">
                      <section.icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </h3>
                    {section.content && <p className="text-xs text-muted-foreground mb-1">{section.content}</p>}
                    {section.warning && <p className="text-xs font-bold text-destructive">{section.warning}</p>}
                    {section.list && (
                      <ul className="space-y-1 list-disc list-inside text-xs text-muted-foreground">
                        {section.list.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
