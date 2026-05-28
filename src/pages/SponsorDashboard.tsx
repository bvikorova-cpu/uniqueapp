import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, TrendingUp, Star, Award, Crown, Zap, ArrowLeft, 
  Calendar, Users, BarChart3, Settings, ExternalLink, Loader2,
  AlertCircle, CheckCircle2, XCircle, Target
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { GoalSettingDialog } from "@/components/sponsor/GoalSettingDialog";
import { GoalProgressCard } from "@/components/sponsor/GoalProgressCard";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BrandSponsor {
  id: string;
  name: string;
  logo: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  category: string;
  total_votes: number;
  description: string;
  website: string;
  subscription_status: string;
  subscription_start: string;
  subscription_end: string;
  stripe_subscription_id: string;
  created_at?: string;
  moderation_status?: "pending" | "approved" | "rejected";
  moderation_reason?: string | null;
  user_id?: string;
}

const TIER_INFO = {
  bronze: { name: "Bronze", icon: Award, color: "from-amber-600 to-amber-800", price: "€200" },
  silver: { name: "Silver", icon: Star, color: "from-gray-400 to-gray-600", price: "€500" },
  gold: { name: "Gold", icon: Crown, color: "from-yellow-400 to-yellow-600", price: "€1,500" },
  platinum: { name: "Platinum", icon: Zap, color: "from-purple-400 to-purple-600", price: "€3,000" },
};

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error("Please sign in to access the dashboard");
        navigate("/auth");
      }
      setUser(user);
    });
  }, [navigate]);

  // Load sponsor data
  const { data: sponsor, isLoading: sponsorLoading } = useQuery({
    queryKey: ["sponsor-data", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          toast.error("You don't have a sponsor account yet");
          navigate("/sponsor-registration");
          return null;
        }
        throw error;
      }
      return data as BrandSponsor;
    },
    enabled: !!user,
  });

  // Load vote history for analytics
  const { data: voteHistory = [] } = useQuery({
    queryKey: ["vote-history", sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return [];
      
      const { data, error } = await supabase
        .from("brand_votes")
        .select("created_at")
        .eq("brand_id", sponsor.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Group votes by date
      const votesByDate: Record<string, number> = {};
      data.forEach(vote => {
        const date = new Date(vote.created_at).toLocaleDateString();
        votesByDate[date] = (votesByDate[date] || 0) + 1;
      });
      
      // Convert to chart data
      return Object.entries(votesByDate).map(([date, votes]) => ({
        date,
        votes,
      }));
    },
    enabled: !!sponsor,
  });

  // Load ranking position
  const { data: rankingData } = useQuery({
    queryKey: ["sponsor-ranking", sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return null;
      
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("id, total_votes")
        .eq("subscription_status", "active")
        .order("total_votes", { ascending: false });
      
      if (error) throw error;
      
      const rank = data.findIndex(s => s.id === sponsor.id) + 1;
      const totalSponsors = data.length;
      
      return { rank, totalSponsors };
    },
    enabled: !!sponsor,
  });

  // Load recent voters
  const { data: recentVotes = [] } = useQuery({
    queryKey: ["recent-votes", sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return [];
      
      const { data, error } = await supabase
        .from("brand_votes")
        .select("created_at, user_id")
        .eq("brand_id", sponsor.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!sponsor,
  });

  // Load category competitors
  const { data: competitors = [] } = useQuery({
    queryKey: ["category-competitors", sponsor?.category, sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return [];
      
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("id, name, logo, tier, total_votes, created_at")
        .eq("category", sponsor.category)
        .eq("subscription_status", "active")
        .neq("id", sponsor.id)
        .order("total_votes", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!sponsor,
  });

  // Load category benchmarks
  const { data: categoryBenchmarks } = useQuery({
    queryKey: ["category-benchmarks", sponsor?.category],
    queryFn: async () => {
      if (!sponsor) return null;
      
      // Get all active sponsors in category
      const { data: allSponsors, error } = await supabase
        .from("brand_sponsors")
        .select("id, total_votes, created_at")
        .eq("category", sponsor.category)
        .eq("subscription_status", "active");
      
      if (error) throw error;
      
      // Calculate averages
      const totalVotes = allSponsors.reduce((sum, s) => sum + s.total_votes, 0);
      const avgVotes = totalVotes / allSponsors.length;
      
      // Calculate days active and daily average
      const sponsorDaysActive = Math.max(1, Math.ceil(
        (Date.now() - new Date(sponsor.created_at || sponsor.subscription_start).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const sponsorDailyAvg = sponsor.total_votes / sponsorDaysActive;
      
      const categoryDailyAvgs = allSponsors.map(s => {
        const daysActive = Math.max(1, Math.ceil(
          (Date.now() - new Date(s.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
        ));
        return s.total_votes / daysActive;
      });
      const avgDailyVotes = categoryDailyAvgs.reduce((sum, v) => sum + v, 0) / categoryDailyAvgs.length;
      
      return {
        totalSponsors: allSponsors.length,
        avgVotes,
        avgDailyVotes,
        totalCategoryVotes: totalVotes,
        sponsorDailyAvg,
        sponsorDaysActive,
      };
    },
    enabled: !!sponsor,
  });

  // Load vote growth trend (last 7 days)
  const { data: growthMetrics } = useQuery({
    queryKey: ["growth-metrics", sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return null;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from("brand_votes")
        .select("created_at")
        .eq("brand_id", sponsor.id)
        .gte("created_at", sevenDaysAgo.toISOString());
      
      if (error) throw error;
      
      const votesLast7Days = data.length;
      
      // Get previous 7 days for comparison
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const { data: prevData, error: prevError } = await supabase
        .from("brand_votes")
        .select("created_at")
        .eq("brand_id", sponsor.id)
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString());
      
      if (prevError) throw prevError;
      
      const votesPrev7Days = prevData.length;
      const growthRate = votesPrev7Days > 0 
        ? ((votesLast7Days - votesPrev7Days) / votesPrev7Days) * 100 
        : votesLast7Days > 0 ? 100 : 0;
      
      return {
        votesLast7Days,
        votesPrev7Days,
        growthRate,
        dailyAverage: votesLast7Days / 7,
      };
    },
    enabled: !!sponsor,
  });

  // Load sponsor goals
  const { data: sponsorGoal, refetch: refetchGoal } = useQuery({
    queryKey: ["sponsor-goal", sponsor?.id],
    queryFn: async () => {
      if (!sponsor) return null;
      
      const { data, error } = await supabase
        .from("sponsor_goals" as any)
        .select("*")
        .eq("sponsor_id", sponsor.id)
        .eq("status", "active")
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // No goal found
        throw error;
      }
      
      return data;
    },
    enabled: !!sponsor,
  });

  const handleCancelSubscription = async () => {
    if (!sponsor?.stripe_subscription_id) {
      toast.error("No active subscription found");
      return;
    }

    setCancelingSubscription(true);
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionId: sponsor.stripe_subscription_id },
      });

      if (error) throw error;

      toast.success("Subscription canceled successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelingSubscription(false);
    }
  };

  if (sponsorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    );
  }

  if (!sponsor) {
    return null;
  }

  const tierInfo = TIER_INFO[sponsor.tier];
  const TierIcon = tierInfo.icon;
  const subscriptionEndDate = new Date(sponsor.subscription_end);
  const daysUntilRenewal = Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/brand-battle")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Brand Battle
          </Button>
        </div>

        {/* Moderation status banner */}
        {sponsor.moderation_status && sponsor.moderation_status !== "approved" && (
          <Card
            data-testid="moderation-banner"
            className={`mb-6 border-2 ${
              sponsor.moderation_status === "rejected"
                ? "border-red-500/60 bg-red-950/40"
                : "border-yellow-500/60 bg-yellow-950/30"
            }`}
          >
            <CardContent className="p-4 flex items-start gap-3">
              {sponsor.moderation_status === "rejected" ? (
                <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {sponsor.moderation_status === "rejected"
                    ? "Your brand was rejected by moderation"
                    : "Your brand is awaiting moderation approval"}
                </p>
                <p className="text-gray-300 mt-1">
                  {sponsor.moderation_status === "rejected"
                    ? sponsor.moderation_reason || "Please contact support for details."
                    : "Until an admin approves it, your brand will not appear in Brand Battle Arena listings or competitions."}
                </p>
                {sponsor.moderation_status === "rejected" && (
                  <BrandAppealForm brandId={sponsor.id} brandUserId={sponsor.user_id ?? ""} />
                )}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Header Section */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center text-5xl">
                {sponsor.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{sponsor.name}</h1>
                  <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white border-0`}>
                    {tierInfo.name} Sponsor
                  </Badge>
                </div>
                <p className="text-gray-300 mb-4">{sponsor.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(sponsor.subscription_start).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <ExternalLink className="h-4 w-4" />
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      {sponsor.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{sponsor.total_votes}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Current Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                #{rankingData?.rank || "-"}
                <span className="text-sm text-gray-400 ml-2">of {rankingData?.totalSponsors}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Subscription Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TierIcon className="h-6 w-6 text-white" />
                <span className="text-2xl font-bold text-white">{tierInfo.name}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">{tierInfo.price}/month</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Next Renewal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {daysUntilRenewal} days
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {subscriptionEndDate.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Goals
                </CardTitle>
                <CardDescription>Track your progress toward your targets</CardDescription>
              </div>
              <GoalSettingDialog 
                sponsorId={sponsor.id} 
                currentGoal={sponsorGoal}
                onGoalSet={() => refetchGoal()}
              />
            </div>
          </CardHeader>
          <CardContent>
            {sponsorGoal ? (
              <GoalProgressCard
                goal={sponsorGoal}
                currentValue={sponsor.total_votes}
                categoryRank={rankingData?.rank}
                dailyAverage={categoryBenchmarks?.sponsorDailyAvg}
                onGoalDeleted={() => refetchGoal()}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-white mb-2">No Active Goal</p>
                <p className="mb-4">Set a goal to track your progress and stay motivated</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/30">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <TrendingUp className="h-4 w-4 mr-2" />
              Competitor Analysis
            </TabsTrigger>
            <TabsTrigger value="votes">
              <Users className="h-4 w-4 mr-2" />
              Recent Votes
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <Settings className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Vote Trends</CardTitle>
                <CardDescription>Daily vote count over time</CardDescription>
              </CardHeader>
              <CardContent>
                {voteHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={voteHistory}>
                      <defs>
                        <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Area type="monotone" dataKey="votes" stroke="#a855f7" fillOpacity={1} fill="url(#colorVotes)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No vote data yet. Share your brand to get votes!
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Average Votes/Day</span>
                    <span className="text-white font-bold">
                      {voteHistory.length > 0 
                        ? (sponsor.total_votes / voteHistory.length).toFixed(1)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Category</span>
                    <Badge variant="secondary">{sponsor.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Ranking Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {rankingData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Current Position</span>
                        <div className="text-2xl font-bold text-white">#{rankingData.rank}</div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ 
                            width: `${((rankingData.totalSponsors - rankingData.rank + 1) / rankingData.totalSponsors) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-400">
                        {rankingData.rank === 1 ? (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            You're in 1st place!
                          </span>
                        ) : (
                          `${rankingData.rank - 1} ${rankingData.rank === 2 ? 'brand' : 'brands'} ahead of you`
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitor Analysis Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Category Leaderboard - {sponsor.category}</CardTitle>
                <CardDescription>
                  See how you rank against other brands in your category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Your Position Card */}
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-4xl">
                        {sponsor.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-white">{sponsor.name}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            You
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {tierInfo.name} Sponsor
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        #{rankingData?.rank || "-"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {sponsor.total_votes} votes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitors List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Competitors in {sponsor.category}
                  </h3>
                  {competitors.length > 0 ? (
                    competitors.map((competitor, index) => {
                      const competitorTier = TIER_INFO[competitor.tier as keyof typeof TIER_INFO];
                      const voteDifference = competitor.total_votes - sponsor.total_votes;
                      const isAhead = voteDifference > 0;
                      
                      return (
                        <div
                          key={competitor.id}
                          className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                              {competitor.logo}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">
                                  {competitor.name}
                                </span>
                                <Badge 
                                  variant="outline"
                                  className={`text-xs bg-gradient-to-r ${competitorTier.color} border-0 text-white`}
                                >
                                  {competitorTier.name}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400">
                                {competitor.total_votes} votes
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${isAhead ? 'text-red-400' : 'text-green-400'}`}>
                              {isAhead ? (
                                <>+{voteDifference} ahead</>
                              ) : (
                                <>{Math.abs(voteDifference)} behind</>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No other active sponsors in your category yet. You're leading the pack!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comparison Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Vote Comparison</CardTitle>
                  <CardDescription>
                    Your votes vs top 5 competitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {competitors.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={[
                          { name: sponsor.name.substring(0, 15), votes: sponsor.total_votes, fill: "#a855f7" },
                          ...competitors.slice(0, 5).map(c => ({
                            name: c.name.substring(0, 15),
                            votes: c.total_votes,
                            fill: "#6b7280"
                          }))
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #4b5563', 
                            borderRadius: '0.5rem' 
                          }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="votes" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No competitors to compare
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Market Share</CardTitle>
                  <CardDescription>
                    Your share of votes in {sponsor.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {competitors.length > 0 ? (
                    <>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Your Market Share</span>
                          <span className="text-2xl font-bold text-white">
                            {(
                              (sponsor.total_votes / 
                              (sponsor.total_votes + competitors.reduce((sum, c) => sum + c.total_votes, 0))) * 100
                            ).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(sponsor.total_votes / 
                                (sponsor.total_votes + competitors.reduce((sum, c) => sum + c.total_votes, 0))) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white">Category Insights</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-black/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Total Category Votes</div>
                            <div className="text-xl font-bold text-white">
                              {sponsor.total_votes + competitors.reduce((sum, c) => sum + c.total_votes, 0)}
                            </div>
                          </div>
                          <div className="p-3 bg-black/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Active Sponsors</div>
                            <div className="text-xl font-bold text-white">
                              {competitors.length + 1}
                            </div>
                          </div>
                          <div className="p-3 bg-black/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Your Position</div>
                            <div className="text-xl font-bold text-white">
                              #{rankingData?.rank || "-"}
                            </div>
                          </div>
                          <div className="p-3 bg-black/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Votes to #1</div>
                            <div className="text-xl font-bold text-white">
                              {competitors[0] && competitors[0].total_votes > sponsor.total_votes
                                ? competitors[0].total_votes - sponsor.total_votes + 1
                                : rankingData?.rank === 1 ? "👑" : 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                      <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-lg font-semibold text-white mb-2">
                        You're the category leader!
                      </p>
                      <p className="text-sm">
                        No other sponsors in {sponsor.category} yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Benchmarks */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Category Benchmarks</CardTitle>
                <CardDescription>
                  How your performance compares to category averages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryBenchmarks && growthMetrics ? (
                  <div className="space-y-6">
                    {/* Performance Metrics Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Total Votes</span>
                          <Trophy className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold text-white mb-1">
                              {sponsor.total_votes}
                            </div>
                            <div className="text-xs text-gray-500">
                              Avg: {categoryBenchmarks.avgVotes.toFixed(0)}
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${
                            sponsor.total_votes > categoryBenchmarks.avgVotes ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {sponsor.total_votes > categoryBenchmarks.avgVotes ? '+' : ''}
                            {((sponsor.total_votes / categoryBenchmarks.avgVotes - 1) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              sponsor.total_votes > categoryBenchmarks.avgVotes 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (sponsor.total_votes / categoryBenchmarks.avgVotes) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Daily Average</span>
                          <BarChart3 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold text-white mb-1">
                              {categoryBenchmarks.sponsorDailyAvg.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Avg: {categoryBenchmarks.avgDailyVotes.toFixed(1)}
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${
                            categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes 
                              ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes ? '+' : ''}
                            {((categoryBenchmarks.sponsorDailyAvg / categoryBenchmarks.avgDailyVotes - 1) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (categoryBenchmarks.sponsorDailyAvg / categoryBenchmarks.avgDailyVotes) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">7-Day Growth</span>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold text-white mb-1">
                              {growthMetrics.growthRate > 0 ? '+' : ''}
                              {growthMetrics.growthRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {growthMetrics.votesLast7Days} votes this week
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${
                            growthMetrics.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {growthMetrics.growthRate > 0 ? '↗' : '↘'}
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          vs {growthMetrics.votesPrev7Days} previous week
                        </div>
                      </div>
                    </div>

                    {/* Detailed Comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-4">Performance Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Days Active</span>
                            <span className="text-sm font-semibold text-white">
                              {categoryBenchmarks.sponsorDaysActive} days
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Votes per Day</span>
                            <span className="text-sm font-semibold text-white">
                              {categoryBenchmarks.sponsorDailyAvg.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Category Rank</span>
                            <span className="text-sm font-semibold text-white">
                              #{rankingData?.rank || "-"} of {categoryBenchmarks.totalSponsors}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Market Share</span>
                            <span className="text-sm font-semibold text-white">
                              {((sponsor.total_votes / categoryBenchmarks.totalCategoryVotes) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-4">Engagement Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Weekly Votes</span>
                            <span className="text-sm font-semibold text-white">
                              {growthMetrics.votesLast7Days}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Daily Average (7d)</span>
                            <span className="text-sm font-semibold text-white">
                              {growthMetrics.dailyAverage.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Growth Trend</span>
                            <span className={`text-sm font-semibold ${
                              growthMetrics.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {growthMetrics.growthRate > 0 ? 'Growing' : 'Declining'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">vs Category Avg</span>
                            <span className={`text-sm font-semibold ${
                              categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes 
                                ? 'text-green-400' : 'text-orange-400'
                            }`}>
                              {categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes 
                                ? 'Above Average' : 'Below Average'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
                      <h4 className="text-sm font-semibold text-white mb-3">Performance Summary</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        {sponsor.total_votes > categoryBenchmarks.avgVotes ? (
                          <p>
                            ✅ Your brand is performing <strong className="text-green-400">
                            {((sponsor.total_votes / categoryBenchmarks.avgVotes - 1) * 100).toFixed(0)}% above</strong> the category average for total votes.
                          </p>
                        ) : (
                          <p>
                            📊 Your brand is currently <strong className="text-orange-400">
                            {((1 - sponsor.total_votes / categoryBenchmarks.avgVotes) * 100).toFixed(0)}% below</strong> the category average. Focus on increasing engagement.
                          </p>
                        )}
                        
                        {categoryBenchmarks.sponsorDailyAvg > categoryBenchmarks.avgDailyVotes ? (
                          <p>
                            ✅ Your daily vote rate is <strong className="text-green-400">
                            {((categoryBenchmarks.sponsorDailyAvg / categoryBenchmarks.avgDailyVotes - 1) * 100).toFixed(0)}% higher</strong> than the category average.
                          </p>
                        ) : (
                          <p>
                            📈 Aim to increase your daily vote rate by <strong className="text-orange-400">
                            {((categoryBenchmarks.avgDailyVotes / categoryBenchmarks.sponsorDailyAvg - 1) * 100).toFixed(0)}%</strong> to match the category average.
                          </p>
                        )}
                        
                        {growthMetrics.growthRate > 0 ? (
                          <p>
                            🚀 Great momentum! Your votes increased by <strong className="text-green-400">
                            {growthMetrics.growthRate.toFixed(0)}%</strong> in the last 7 days.
                          </p>
                        ) : growthMetrics.growthRate < 0 ? (
                          <p>
                            ⚠️ Your votes decreased by <strong className="text-red-400">
                            {Math.abs(growthMetrics.growthRate).toFixed(0)}%</strong> this week. Consider new engagement strategies.
                          </p>
                        ) : (
                          <p>
                            📊 Your vote count remained stable this week. Focus on growth strategies to improve rankings.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading category benchmarks...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategic Insights */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Strategic Insights</CardTitle>
                <CardDescription>
                  Actionable recommendations based on competitor analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.length > 0 && (
                    <>
                      {rankingData && rankingData.rank === 1 && (
                        <div className="flex gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <Trophy className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-green-400 mb-1">
                              Maintaining Leadership
                            </div>
                            <div className="text-sm text-gray-300">
                              You're currently #1 in {sponsor.category}! Keep engaging with voters and maintain your presence to stay on top.
                            </div>
                          </div>
                        </div>
                      )}

                      {rankingData && rankingData.rank > 1 && competitors[0] && (
                        <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-blue-400 mb-1">
                              Path to Top Position
                            </div>
                            <div className="text-sm text-gray-300">
                              You need {competitors[0].total_votes - sponsor.total_votes + 1} more votes to reach #1. 
                              Consider upgrading your tier or running campaigns to boost engagement.
                            </div>
                          </div>
                        </div>
                      )}

                      {competitors.filter(c => TIER_INFO[c.tier as keyof typeof TIER_INFO].name > tierInfo.name).length > 0 && (
                        <div className="flex gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <Crown className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-purple-400 mb-1">
                              Tier Upgrade Opportunity
                            </div>
                            <div className="text-sm text-gray-300">
                              Some competitors have higher tier sponsorships. Upgrading your tier can provide better visibility and features to gain more votes.
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-400 mb-1">
                        Engagement Tips
                      </div>
                      <div className="text-sm text-gray-300">
                        Share your brand profile on social media, engage with voters, and promote your unique value proposition to stand out in the {sponsor.category} category.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Votes Tab */}
          <TabsContent value="votes" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Votes</CardTitle>
                <CardDescription>Latest votes from the community</CardDescription>
              </CardHeader>
              <CardContent>
                {recentVotes.length > 0 ? (
                  <div className="space-y-3">
                    {recentVotes.map((vote, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Anonymous User</div>
                            <div className="text-sm text-gray-400">
                              {new Date(vote.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No votes yet. Be patient, votes are coming!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Subscription Details</CardTitle>
                <CardDescription>Manage your sponsorship plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between p-6 bg-black/20 rounded-lg">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <TierIcon className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{tierInfo.name} Plan</h3>
                        <p className="text-gray-400">{tierInfo.price} per month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Status: Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">
                          Started: {new Date(sponsor.subscription_start).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">
                          Renews: {subscriptionEndDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-500/30 pt-6">
                  <h4 className="text-white font-semibold mb-4">Actions</h4>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/sponsor-registration")}
                      className="border-purple-500/30 text-white hover:bg-purple-500/10"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-purple-500/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            This will cancel your sponsorship subscription. You will lose access to all sponsor benefits at the end of your current billing period ({subscriptionEndDate.toLocaleDateString()}).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-black/40 text-white border-purple-500/30">
                            Keep Subscription
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={cancelingSubscription}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cancelingSubscription ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Canceling...
                              </>
                            ) : (
                              "Cancel Subscription"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">Need help?</p>
                      <p>Contact our support team for any questions about your subscription or to discuss custom sponsorship opportunities.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
