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
        .eq("subscription_status", "active");
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

  const handleVote = async (brandId: string, brandName: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }
    if ((votes?.remaining || 0) <= 0) {
      toast.error("Not enough votes. Buy extra votes!");
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Luxury Arena Hero */}
        <LuxuryArenaHero
          totalVotes={campaignStats?.totalVotes}
          totalSponsors={campaignStats?.totalSponsors}
          liveNow={Math.max(1, Math.floor((campaignStats?.totalSponsors ?? 0) / 2))}
        />

        {/* Live brand stock ticker */}
        <div className="mb-6">
          <BrandStockTicker />
        </div>

        {/* User controls */}
        {user && (
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <BrandVotesDisplay />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/sponsor-dashboard")}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Sponsor Dashboard
              </Button>
            </div>
            <VotingStreakCard />
          </div>
        )}

        {/* How it works */}
        <div className="bg-muted/50 rounded-xl p-4 sm:p-6 max-w-3xl mx-auto mb-8 text-left">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-primary">📋</span> How Brand Battle Works
          </h3>
          <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span><strong>Vote Daily:</strong> You get 1 free vote per day. Use it to support your favorite brands.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span><strong>Head-to-Head:</strong> Pick winners in 1v1 matchups for bonus excitement.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span><strong>Complete Challenges:</strong> Daily & weekly challenges earn you credit multipliers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span><strong>Win Prizes:</strong> Top voters and brands earn rewards each quarter.</span>
            </li>
          </ul>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex gap-1 w-max h-auto p-1.5">
              <TabsTrigger value="leaderboard" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Trophy className="h-3.5 w-3.5 mr-1.5" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger value="ai" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Lab
              </TabsTrigger>
              <TabsTrigger value="market" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Stock Market
              </TabsTrigger>
              <TabsTrigger value="matchup" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Swords className="h-3.5 w-3.5 mr-1.5" /> Head-to-Head
              </TabsTrigger>
              <TabsTrigger value="tribes" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Crown className="h-3.5 w-3.5 mr-1.5" /> Tribes
              </TabsTrigger>
              <TabsTrigger value="cards" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Star className="h-3.5 w-3.5 mr-1.5" /> Trading Cards
              </TabsTrigger>
              <TabsTrigger value="chat" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Live Chat
              </TabsTrigger>
              <TabsTrigger value="boosters" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Boosters
              </TabsTrigger>
              <TabsTrigger value="passes" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Crown className="h-3.5 w-3.5 mr-1.5" /> Premium Pass
              </TabsTrigger>
              <TabsTrigger value="challenges" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Target className="h-3.5 w-3.5 mr-1.5" /> Challenges
              </TabsTrigger>
              <TabsTrigger value="tournament" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Tournament
              </TabsTrigger>
              <TabsTrigger value="reviews" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Reviews
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Building2 className="h-3.5 w-3.5 mr-1.5" /> Become Sponsor
              </TabsTrigger>
              <TabsTrigger value="rewards" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Award className="h-3.5 w-3.5 mr-1.5" /> Rewards
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center pb-2">
              <Button variant={selectedCategory === "All" ? "default" : "outline"} onClick={() => setSelectedCategory("All")} size="sm" className="text-xs px-3">All</Button>
              {CATEGORIES.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)} size="sm" className="text-xs px-3">{cat}</Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedSponsors.slice(0, 3).map((sponsor, i) => (
                <FeaturedBrandCard key={sponsor.id} sponsor={sponsor} rank={i + 1} onVote={handleVote} isVoting={voteMutation.isPending} canVote={(votes?.remaining || 0) > 0} isAuthenticated={!!user} />
              ))}
            </div>

            {sortedSponsors.length > 3 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Full Leaderboard</h3>
                {sortedSponsors.slice(3).map((sponsor, index) => {
                  const tierInfo = SPONSOR_TIERS[sponsor.tier];
                  const position = index + 4;
                  return (
                    <Card key={sponsor.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="text-xl sm:text-2xl font-bold text-muted-foreground w-8 sm:w-12 text-center flex-shrink-0">#{position}</div>
                            <div className="flex-shrink-0">
                              {sponsor.logo.startsWith('http') ? (
                                <img src={sponsor.logo} alt={sponsor.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />
                              ) : (
                                <div className="text-3xl sm:text-4xl">{sponsor.logo}</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm sm:text-base truncate">{sponsor.name}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{sponsor.description}</div>
                              <Badge variant="secondary" className="mt-1 text-xs">{sponsor.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-primary">{sponsor.total_votes}</div>
                              <div className="text-xs text-muted-foreground">votes</div>
                            </div>
                            <Button onClick={() => handleVote(sponsor.id, sponsor.name)} disabled={!user || voteMutation.isPending || (votes?.remaining || 0) <= 0} className="min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm px-3 sm:px-4" size="sm">
                              {voteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Vote className="h-3.5 w-3.5 mr-1.5" />}
                              Vote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
