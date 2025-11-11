import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Star, Award, Crown, Vote, Building2, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BrandVotesDisplay } from "@/components/brand-battle/BrandVotesDisplay";
import { useBrandVotes } from "@/hooks/useBrandVotes";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: votes, refetch: refetchVotes } = useBrandVotes();

  // Load user auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle payment success/cancel
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      handlePaymentSuccess(sessionId);
      searchParams.delete("payment");
      searchParams.delete("session_id");
      setSearchParams(searchParams);
    } else if (payment === "canceled") {
      toast.error("Platba bola zrušená");
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-brand-votes-payment",
        {
          body: { sessionId },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(`Úspešne! Pridali sme ti ${data.votesAdded} hlasov.`);
        refetchVotes();
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error("Chyba pri overovaní platby");
    }
  };

  // Load brand sponsors
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


  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const { data, error } = await supabase.functions.invoke("vote-for-brand", {
        body: { brandId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Hlas zaznamenaný! Ostáva ti ${data.votesRemaining} hlasov dnes.`);
      queryClient.invalidateQueries({ queryKey: ["brand-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["brand-votes"] });
      refetchVotes();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const handleVote = async (brandId: string, brandName: string) => {
    if (!user) {
      toast.error("Prihlás sa aby si mohol hlasovať");
      navigate("/auth");
      return;
    }

    if ((votes?.remaining || 0) <= 0) {
      toast.error("Nemáš dostatok hlasov. Kúp si extra hlasy!");
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Live Brand Battle - Q1 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Brand Battle Arena
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Hlasuj za svoje obľúbené značky a získavaj odmeny. Top značky získajú prémiové umiestnenie.
          </p>
          
          {user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <BrandVotesDisplay />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/sponsor-dashboard")}
                className="border-purple-500/30 hover:bg-purple-500/10"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Sponsor Dashboard
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Building2 className="h-4 w-4 mr-2" />
              Become a Sponsor
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Award className="h-4 w-4 mr-2" />
              Rewards & Prizes
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                onClick={() => setSelectedCategory("All")}
                size="sm"
              >
                All Categories
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Top 3 - Featured */}
            <div className="grid md:grid-cols-3 gap-6">
              {sortedSponsors.slice(0, 3).map((sponsor, index) => {
                const tierInfo = SPONSOR_TIERS[sponsor.tier];
                const medals = ["🥇", "🥈", "🥉"];
                
                return (
                  <Card key={sponsor.id} className={`relative overflow-hidden ${index === 0 ? "md:scale-105 shadow-xl" : ""}`}>
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tierInfo.color}`}></div>
                    <CardHeader className="text-center pb-3">
                      <div className="text-6xl mb-2">{sponsor.logo}</div>
                      <div className="text-4xl mb-2">{medals[index]}</div>
                      <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                      <CardDescription>{sponsor.description}</CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {sponsor.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{sponsor.total_votes}</div>
                        <div className="text-sm text-muted-foreground">votes</div>
                      </div>
                      <Button 
                        onClick={() => handleVote(sponsor.id, sponsor.name)}
                        className="w-full"
                        disabled={!user || voteMutation.isPending || (votes?.remaining || 0) <= 0}
                      >
                        {voteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Vote className="h-4 w-4 mr-2" />
                        )}
                        Hlasovať
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Rest of the Leaderboard */}
            {sortedSponsors.length > 3 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Full Leaderboard</h3>
                {sortedSponsors.slice(3).map((sponsor, index) => {
                  const tierInfo = SPONSOR_TIERS[sponsor.tier];
                  const position = index + 4;
                  
                  return (
                    <Card key={sponsor.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="text-2xl font-bold text-muted-foreground w-12 text-center">
                          #{position}
                        </div>
                        <div className="text-4xl">{sponsor.logo}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{sponsor.name}</div>
                          <div className="text-sm text-muted-foreground">{sponsor.description}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {sponsor.category}
                          </Badge>
                        </div>
                        <div className="text-center px-4">
                          <div className="text-2xl font-bold text-primary">{sponsor.total_votes}</div>
                          <div className="text-xs text-muted-foreground">votes</div>
                        </div>
                        <Button 
                          onClick={() => handleVote(sponsor.id, sponsor.name)}
                          disabled={!user || voteMutation.isPending || (votes?.remaining || 0) <= 0}
                        >
                          {voteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Vote className="h-4 w-4 mr-2" />
                          )}
                          Hlasovať
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Sponsor Tiers Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get premium visibility, engage with our community, and boost your brand recognition through our Brand Battle Arena.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                      <Button 
                        className="w-full" 
                        variant={key === "platinum" ? "default" : "outline"}
                        onClick={() => navigate("/sponsor-registration")}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Rewards & Prizes</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Participate in voting and earn rewards. Top brands and voters receive exclusive benefits.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    For Winning Brands
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🥇</div>
                    <div>
                      <div className="font-semibold">1st Place</div>
                      <div className="text-sm text-muted-foreground">
                        Homepage hero banner for 1 month + Featured article + Full analytics dashboard
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🥈</div>
                    <div>
                      <div className="font-semibold">2nd Place</div>
                      <div className="text-sm text-muted-foreground">
                        Featured article + Advanced analytics
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🥉</div>
                    <div>
                      <div className="font-semibold">3rd Place</div>
                      <div className="text-sm text-muted-foreground">
                        Social media feature + Basic analytics
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    For Top Voters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👑</div>
                    <div>
                      <div className="font-semibold">Top 10 Voters</div>
                      <div className="text-sm text-muted-foreground">
                        €50 in platform credits each month
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎁</div>
                    <div>
                      <div className="font-semibold">Daily Voting Rewards</div>
                      <div className="text-sm text-muted-foreground">
                        Earn 2 credits for every vote cast
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                      <div className="font-semibold">Streak Bonuses</div>
                      <div className="text-sm text-muted-foreground">
                        Vote 7 days in a row: +20 bonus credits
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Q1 2025 Campaign</CardTitle>
                <CardDescription>
                  Current battle period: January 1 - March 31, 2025
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">€10,000</div>
                    <div className="text-sm text-muted-foreground">Total Prize Pool</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">45</div>
                    <div className="text-sm text-muted-foreground">Days Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12,547</div>
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

