import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Target, TrendingUp, Flame, Gift, Coins, Users } from "lucide-react";
import { useVotingStreak } from "@/hooks/useVotingStreak";
import { useBrandBattleCredits } from "@/hooks/useBrandBattleCredits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CampaignStats {
  totalVotes: number;
  totalVoters: number;
  totalSponsors: number;
  daysRemaining: number;
}

export const RewardsSection = () => {
  const { data: streak } = useVotingStreak();
  const { data: credits } = useBrandBattleCredits();

  // Calculate campaign stats
  const { data: campaignStats } = useQuery<CampaignStats>({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      // Get total votes
      const { count: totalVotes } = await supabase
        .from("brand_votes")
        .select("*", { count: "exact", head: true });

      // Get unique voters
      const { data: voters } = await supabase
        .from("brand_votes")
        .select("user_id")
        .limit(1000);
      const uniqueVoters = new Set(voters?.map(v => v.user_id)).size;

      // Get active sponsors
      const { count: totalSponsors } = await supabase
        .from("brand_sponsors")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active");

      // Calculate days remaining in current season
      const now = new Date();
      const currentQuarterEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
      const daysRemaining = Math.max(0, Math.ceil((currentQuarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        totalVotes: totalVotes || 0,
        totalVoters: uniqueVoters,
        totalSponsors: totalSponsors || 0,
        daysRemaining,
      };
    },
  });

  // Get top voters leaderboard
  const { data: topVoters = [] } = useQuery({
    queryKey: ["top-voters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voting_streaks")
        .select("user_id, total_votes_cast, current_streak, credits_earned")
        .order("total_votes_cast", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const streakDays = streak?.currentStreak || 0;
  const daysUntilBonus = 7 - (streakDays % 7);
  const streakProgress = ((streakDays % 7) / 7) * 100;

  return (
    <div className="space-y-6">
      {/* Your Rewards Summary */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Your Voting Rewards
          </CardTitle>
          <CardDescription>Track your progress and earn credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{credits?.creditsBalance || 0}</div>
              <div className="text-xs text-muted-foreground">Available Credits</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{credits?.totalCreditsEarned || 0}</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{streakDays}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{streak?.totalVotesCast || 0}</div>
              <div className="text-xs text-muted-foreground">Votes Cast</div>
            </div>
          </div>

          {/* Streak Progress */}
          <div className="p-4 bg-background/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Streak Bonus Progress</span>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
                {daysUntilBonus} days until +20 credits
              </Badge>
            </div>
            <Progress value={streakProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Vote 7 consecutive days to earn bonus credits. Current streak: {streakDays} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Status */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Current Season Campaign
          </CardTitle>
          <CardDescription>
            Active battle period — vote daily to earn rewards!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">€10,000</div>
              <div className="text-sm text-muted-foreground">Prize Pool</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {campaignStats?.daysRemaining || 0}
              </div>
              <div className="text-sm text-muted-foreground">Days Left</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {campaignStats?.totalVotes?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {campaignStats?.totalSponsors || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Sponsors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Voters Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Top Voters
            </CardTitle>
            <CardDescription>
              Top 10 most active voters this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topVoters.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No voters yet</p>
            ) : (
              <div className="space-y-2">
                {topVoters.map((voter, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div
                      key={voter.user_id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        index < 3 ? "bg-primary/5" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold w-8">
                          {index < 3 ? medals[index] : `#${index + 1}`}
                        </span>
                        <span className="text-sm">
                          Voter {voter.user_id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{voter.total_votes_cast}</div>
                          <div className="text-xs text-muted-foreground">votes</div>
                        </div>
                        <Badge variant="secondary">
                          {voter.current_streak}🔥
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards for Brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Brand Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-2xl">🥇</div>
              <div>
                <div className="font-semibold">1st Place</div>
                <div className="text-sm text-muted-foreground">
                  Homepage hero banner + Featured article + Full analytics
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-500/10 rounded-lg">
              <div className="text-2xl">🥈</div>
              <div>
                <div className="font-semibold">2nd Place</div>
                <div className="text-sm text-muted-foreground">
                  Featured article + Advanced analytics dashboard
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-600/10 rounded-lg">
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
      </div>

      {/* Voter Rewards Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            How to Earn Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl mb-2">🗳️</div>
              <div className="font-bold text-lg">+2 Credits</div>
              <div className="text-sm text-muted-foreground">Per vote cast</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-bold text-lg">+20 Bonus</div>
              <div className="text-sm text-muted-foreground">7-day streak</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl mb-2">👑</div>
              <div className="font-bold text-lg">€50 Credits</div>
              <div className="text-sm text-muted-foreground">Top 10 voters monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
