import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy, TrendingUp, Star, Award, Crown, Vote, Building2, Zap,
  Loader2, Swords, MessageSquare, Target, Calendar, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import { BrandVotesDisplay } from "@/components/brand-battle/BrandVotesDisplay";
import { VotingStreakCard } from "@/components/brand-battle/VotingStreakCard";
import { RewardsSection } from "@/components/brand-battle/RewardsSection";
import { FeaturedBrandCard } from "@/components/brand-battle/FeaturedBrandCard";
import { HeadToHead } from "@/components/brand-battle/HeadToHead";
import { DailyChallenges } from "@/components/brand-battle/DailyChallenges";
import { BrandComments } from "@/components/brand-battle/BrandComments";
import { TournamentBracket } from "@/components/brand-battle/TournamentBracket";
import { LuxuryArenaHero } from "@/components/brand-battle/LuxuryArenaHero";
import { LuxuryTabsNav, LuxuryTabItem } from "@/components/brand-battle/LuxuryTabsNav";
import { BrandStockTicker } from "@/components/brand-battle/BrandStockTicker";
import { BrandStockMarket } from "@/components/brand-battle/BrandStockMarket";
import { BrandAIAnalyzer } from "@/components/brand-battle/BrandAIAnalyzer";
import { AIBattlePredictor } from "@/components/brand-battle/AIBattlePredictor";
import { BrandTribes } from "@/components/brand-battle/BrandTribes";
import { BrandTradingCards } from "@/components/brand-battle/BrandTradingCards";
import { LiveBrandChat } from "@/components/brand-battle/LiveBrandChat";
import { BoosterPacks } from "@/components/brand-battle/BoosterPacks";
import { PremiumPasses } from "@/components/brand-battle/PremiumPasses";
import { useBrandVotes } from "@/hooks/useBrandVotes";
import { useVotingStreak } from "@/hooks/useVotingStreak";

interface BrandSponsor {
  id: string;
  name: string;
  logo: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  category: string;
  total_votes: number;
  description: string;
  website: string;
}

const SPONSOR_TIERS = {
  bronze: {
    name: "Bronze Sponsor",
    price: 200,
    color: "from-amber-600 to-amber-800",
    features: ["Listed in footer", "Basic brand visibility", "Monthly analytics report"],
    icon: Award,
  },
  silver: {
    name: "Silver Sponsor",
    price: 500,
    color: "from-gray-400 to-gray-600",
    features: ["Sidebar banner placement", "Vote count display", "Advanced analytics", "Social media mentions"],
    icon: Star,
  },
  gold: {
    name: "Gold Sponsor",
    price: 1500,
    color: "from-yellow-400 to-yellow-600",
    features: ["Homepage hero placement", "Featured article", "Full analytics dashboard", "Custom landing page", "Priority support"],
    icon: Crown,
  },
  platinum: {
    name: "Platinum Sponsor",
    price: 3000,
    color: "from-purple-400 to-purple-600",
    features: ["All Gold features", "Custom landing page", "API access", "Dedicated account manager", "White-label options"],
    icon: Zap,
  },
};

const CATEGORIES = ["Tech", "Fashion", "Food", "Services", "Healthcare", "Education"];

export default function BrandBattle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<string>("leaderboard");
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: votes, refetch: refetchVotes } = useBrandVotes();
  const { data: streak } = useVotingStreak();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId) {
      handlePaymentSuccess(sessionId);
      searchParams.delete("payment");
      searchParams.delete("session_id");
      setSearchParams(searchParams);
    } else if (payment === "canceled") {
      toast.error("Payment was cancelled");
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-brand-votes-payment", {
        body: { sessionId },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Success! We've added ${data.votesAdded} votes to your account.`);
        refetchVotes();
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error("Error verifying payment");
    }
  };

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: ["brand-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("*")
        .eq("subscription_status", "active")
        .eq("moderation_status", "approved")
        .order("total_votes", { ascending: false });
      if (error) throw error;
      return data as BrandSponsor[];
    },
  });

  // Campaign stats
  const { data: campaignStats } = useQuery({
    queryKey: ["campaign-stats-hero"],
    queryFn: async () => {
      const { count: totalVotes } = await supabase
        .from("brand_votes")
        .select("*", { count: "exact", head: true });
      const { count: totalSponsors } = await supabase
        .from("brand_sponsors")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .eq("moderation_status", "approved");
      return { totalVotes: totalVotes || 0, totalSponsors: totalSponsors || 0 };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('brand-votes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'brand_votes' }, () => {
        queryClient.invalidateQueries({ queryKey: ["brand-sponsors"] });
        queryClient.invalidateQueries({ queryKey: ["campaign-stats-hero"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const voteMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const { data, error } = await supabase.functions.invoke("vote-for-brand", {
        body: { brandId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Vote recorded! ${data.votesRemaining} votes remaining today.`);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      queryClient.invalidateQueries({ queryKey: ["brand-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["brand-votes"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats-hero"] });
      refetchVotes();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const handleVote = async (brandId: string, _brandName?: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }
    if ((votes?.remaining || 0) <= 0) {
      toast.error("No votes left today. Buy extra votes to keep voting!");
      return;
    }
    voteMutation.mutate(brandId);
  };

  const filteredSponsors = selectedCategory === "All"
    ? sponsors
    : sponsors.filter(s => s.category === selectedCategory);
  const sortedSponsors = [...filteredSponsors].sort((a, b) => b.total_votes - a.total_votes);

  if (sponsorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const LUXURY_TABS: LuxuryTabItem[] = [
    { value: "leaderboard", label: "Leaderboard", icon: Trophy },
    { value: "ai", label: "AI Lab", icon: Sparkles },
    { value: "market", label: "Stock Market", icon: TrendingUp },
    { value: "matchup", label: "Head-to-Head", icon: Swords },
    { value: "tribes", label: "Tribes", icon: Crown },
    { value: "cards", label: "Trading Cards", icon: Star },
    { value: "chat", label: "Live Chat", icon: MessageSquare },
    { value: "boosters", label: "Boosters", icon: Zap },
    { value: "passes", label: "Premium Pass", icon: Crown },
    { value: "challenges", label: "Challenges", icon: Target },
    { value: "tournament", label: "Tournament", icon: Calendar },
    { value: "reviews", label: "Reviews", icon: MessageSquare },
    { value: "sponsors", label: "Become Sponsor", icon: Building2 },
    { value: "rewards", label: "Rewards", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-20 pb-8 max-w-6xl">
        {/* Cinematic Video Hero */}
        <LuxuryArenaHero
          totalVotes={campaignStats?.totalVotes}
          totalSponsors={campaignStats?.totalSponsors}
          liveNow={Math.max(1, Math.floor((campaignStats?.totalSponsors ?? 0) / 2))}
        />

        <div className="my-4 flex justify-center">
          <Button size="lg" onClick={() => navigate("/brand-battle/hub")} className="gap-2">
            <Sparkles className="w-5 h-5" /> Open Brand Arena Hub (20 new features)
          </Button>
        </div>

        {/* Live brand stock ticker */}
        <div className="mb-8">
          <BrandStockTicker />
        </div>

        {/* User controls */}
        {user && (
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
              <BrandVotesDisplay />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/sponsor-dashboard")}
                className="gap-2 bg-card/60 backdrop-blur-sm border-border/50 hover:border-amber-500/30"
              >
                <Building2 className="h-4 w-4 text-amber-500" />
                Sponsor Dashboard
              </Button>
            </div>
            <VotingStreakCard />
          </div>
        )}

        {/* How it Works */}
        <Card className="max-w-4xl mx-auto mb-10 bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-black">
              How <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Brand Battle</span> Works
            </CardTitle>
            <CardDescription>Vote, win and climb the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { num: "01", title: "Daily Vote", text: "Get 1 free vote every day to support your favorite brand." },
                { num: "02", title: "Head-to-Head", text: "Pick winners in 1v1 brand duels and earn streak bonuses." },
                { num: "03", title: "Challenges", text: "Complete daily quests to unlock vote multipliers." },
                { num: "04", title: "Win Rewards", text: "Top voters and champion brands earn quarterly prizes." },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/40 hover:border-amber-500/30 transition-colors"
                >
                  <span className="font-mono font-black text-2xl text-amber-500/60 tabular-nums">
                    {item.num}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-foreground text-sm">{item.title}</div>
                    <div className="text-muted-foreground text-xs sm:text-sm mt-0.5">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <LuxuryTabsNav tabs={LUXURY_TABS} active={activeTab} onChange={setActiveTab} />

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-6">
            {/* Luxury category filter */}
            <div>
              <div className="flex items-center gap-3 mb-4 px-1">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500/40" />
                <span
                  className="text-[11px] uppercase tracking-[0.3em] font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ✦ Categories ✦
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/40 to-amber-500/40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {["All", ...CATEGORIES].map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab("leaderboard");
                        setTimeout(() => {
                          document.getElementById("brand-roster")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }}
                      className={`relative rounded-xl p-px transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_25px_-5px_hsl(45_85%_55%/.7)]"
                          : "bg-gradient-to-br from-amber-500/30 via-amber-600/15 to-transparent hover:from-amber-400/60 hover:via-amber-500/30"
                      }`}
                    >
                      <div
                        className={`rounded-[11px] px-3 py-3 text-center transition-all min-h-[48px] flex items-center justify-center ${
                          isActive
                            ? "bg-gradient-to-b from-zinc-900 to-zinc-950"
                            : "bg-card/80 backdrop-blur-xl hover:bg-zinc-900/80"
                        }`}
                      >
                        <span
                          className={`text-[12px] sm:text-[13px] uppercase tracking-[0.15em] font-bold ${
                            isActive ? "text-amber-200" : "text-foreground/90"
                          }`}
                        >
                          {cat}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter result indicator */}
            <div id="brand-roster" className="text-center -mb-2">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 font-bold">
                {selectedCategory === "All" ? "All Brands" : selectedCategory} · {sortedSponsors.length} {sortedSponsors.length === 1 ? "brand" : "brands"}
              </span>
            </div>

            {sortedSponsors.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-card/60 backdrop-blur p-10 text-center">
                <p className="text-muted-foreground">No brands in this category yet.</p>
              </div>
            ) : (
              <>
            {/* Top 3 podium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedSponsors.slice(0, 3).map((sponsor, i) => (
                <FeaturedBrandCard key={sponsor.id} sponsor={sponsor} rank={i + 1} onVote={handleVote} isVoting={voteMutation.isPending} canVote={(votes?.remaining || 0) > 0} isAuthenticated={!!user} />
              ))}
            </div>

            {/* Full luxury leaderboard */}
            {sortedSponsors.length > 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  <h3 className="font-serif text-xl text-amber-200 italic tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    The Full Roster
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                </div>
                {sortedSponsors.slice(3).map((sponsor, index) => {
                  const position = index + 4;
                  return (
                    <div
                      key={sponsor.id}
                      className="group relative rounded-xl p-px bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-400/40 hover:via-amber-500/20 transition-all duration-500"
                    >
                      <div className="rounded-xl bg-zinc-950/90 backdrop-blur p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="font-serif text-2xl sm:text-3xl text-amber-500/70 group-hover:text-amber-400 w-10 sm:w-14 text-center flex-shrink-0 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                              {position}
                            </div>
                            <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-amber-500/20">
                              {sponsor.logo.startsWith('http') ? (
                                <img src={sponsor.logo} alt={sponsor.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover" />
                              ) : (
                                <div className="text-3xl sm:text-4xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-zinc-900">{sponsor.logo}</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm sm:text-base text-amber-100 truncate">{sponsor.name}</div>
                              <div className="text-xs sm:text-sm text-amber-100/40 line-clamp-2 font-light">{sponsor.description}</div>
                              <Badge className="mt-1.5 text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/15">{sponsor.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                            <div className="text-center">
                              <div className="font-serif text-2xl sm:text-3xl bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{sponsor.total_votes}</div>
                              <div className="text-[9px] uppercase tracking-[0.2em] text-amber-100/40">votes</div>
                            </div>
                            <Button
                              onClick={() => handleVote(sponsor.id, sponsor.name)}
                              disabled={!user || voteMutation.isPending || (votes?.remaining || 0) <= 0}
                              className="min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm px-4 sm:px-5 bg-gradient-to-b from-amber-300 to-amber-600 text-zinc-950 hover:from-amber-200 hover:to-amber-500 border-0 font-semibold tracking-wider uppercase shadow-[0_0_20px_-5px_hsl(45_85%_55%/.5)]"
                              size="sm"
                            >
                              {voteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Vote className="h-3.5 w-3.5 mr-1.5" />}
                              Vote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </TabsContent>

          {/* AI Lab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrandAIAnalyzer brands={sponsors as any} />
              <AIBattlePredictor brands={sponsors as any} />
            </div>
          </TabsContent>

          {/* Stock Market */}
          <TabsContent value="market" className="space-y-6">
            <BrandStockMarket />
          </TabsContent>

          {/* Head-to-Head */}
          <TabsContent value="matchup" className="space-y-6">
            <HeadToHead
              sponsors={sponsors}
              onVote={handleVote}
              isVoting={voteMutation.isPending}
              canVote={(votes?.remaining || 0) > 0}
              isAuthenticated={!!user}
            />
          </TabsContent>

          {/* Tribes */}
          <TabsContent value="tribes" className="space-y-6">
            <BrandTribes />
          </TabsContent>

          {/* Trading Cards */}
          <TabsContent value="cards" className="space-y-6">
            <BrandTradingCards />
          </TabsContent>

          {/* Live Chat */}
          <TabsContent value="chat" className="space-y-6">
            <LiveBrandChat />
          </TabsContent>

          {/* Boosters */}
          <TabsContent value="boosters" className="space-y-6">
            <BoosterPacks />
          </TabsContent>

          {/* Premium Passes */}
          <TabsContent value="passes" className="space-y-6">
            <PremiumPasses />
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges" className="space-y-6">
            <DailyChallenges
              currentStreak={streak?.currentStreak || 0}
              totalVotesCast={streak?.totalVotesCast || 0}
            />
          </TabsContent>

          {/* Tournament */}
          <TabsContent value="tournament" className="space-y-6">
            <TournamentBracket sponsors={sponsors} />
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            <BrandComments isAuthenticated={!!user} />
          </TabsContent>

          {/* Sponsor Tiers */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-4">Become a Sponsor</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get premium visibility, engage with our community, and boost your brand recognition through our Brand Battle Arena.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(SPONSOR_TIERS).map(([key, tier]) => {
                const Icon = tier.icon;
                return (
                  <Card key={key} className={key === "platinum" ? "border-primary shadow-xl" : ""}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">€{tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={key === "platinum" ? "default" : "outline"} onClick={() => navigate("/sponsor-registration")}>
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Rewards */}
          <TabsContent value="rewards" className="space-y-6">
            <RewardsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
