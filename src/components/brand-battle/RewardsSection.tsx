import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Target, TrendingUp, Flame, Gift, Coins, Users } from "lucide-react";
import { useVotingStreak } from "@/hooks/useVotingStreak";
import { useBrandBattleCredits } from "@/hooks/useBrandBattleCredits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CampaignStats {
  totalVotes: number;
  totalVoters: number;
  totalSponsors: number;
  daysRemaining: number;
}

export const RewardsSection = () => {
  const { data: streak } = useVotingStreak();
  const { data: credits } = useBrandBattleCredits();

  const { data: campaignStats } = useQuery<CampaignStats>({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { count: totalVotes } = await supabase
        .from("brand_votes")
        .select("*", { count: "exact", head: true });
      const { data: voters } = await supabase
        .from("brand_votes")
        .select("user_id")
        .limit(1000);
      const uniqueVoters = new Set(voters?.map(v => v.user_id)).size;
      const { count: totalSponsors } = await supabase
        .from("brand_sponsors")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .eq("moderation_status", "approved");
      const now = new Date();
      const currentQuarterEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
      const daysRemaining = Math.max(0, Math.ceil((currentQuarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return { totalVotes: totalVotes || 0, totalVoters: uniqueVoters, totalSponsors: totalSponsors || 0, daysRemaining };
    },
  });

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

  const rewardStats = [
    { icon: Coins, value: credits?.creditsBalance || 0, label: "Available Credits", color: "text-yellow-500" },
    { icon: TrendingUp, value: credits?.totalCreditsEarned || 0, label: "Total Earned", color: "text-green-500" },
    { icon: Flame, value: streakDays, label: "Current Streak", color: "text-orange-500" },
    { icon: Trophy, value: streak?.totalVotesCast || 0, label: "Votes Cast", color: "text-purple-500" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Rewards Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Rewards Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Rewards Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Your Rewards Summary */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Voting Rewards
          </CardTitle>
          <CardDescription>Track your progress and earn credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewardStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-4 rounded-xl backdrop-blur-sm bg-background/40 border border-primary/5 hover:border-primary/20 transition-colors"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Streak Progress */}
          <div className="p-4 rounded-xl backdrop-blur-sm bg-background/40 border border-primary/5">
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
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Current Season Campaign
          </CardTitle>
          <CardDescription>Active battle period — vote daily to earn rewards!</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: "€10,000", label: "Prize Pool" },
              { value: campaignStats?.daysRemaining || 0, label: "Days Left" },
              { value: campaignStats?.totalVotes?.toLocaleString() || "0", label: "Total Votes" },
              { value: campaignStats?.totalSponsors || 0, label: "Active Sponsors" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl backdrop-blur-sm bg-background/40 border border-primary/5"
              >
                <div className="text-3xl font-bold text-primary">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Voters & Brand Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Voters
            </CardTitle>
            <CardDescription>Top 10 most active voters this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {topVoters.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No voters yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topVoters.map((voter, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <motion.div
                      key={voter.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        index < 3 ? "bg-primary/5 border border-primary/10" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold w-8">{index < 3 ? medals[index] : `#${index + 1}`}</span>
                        <span className="text-sm">Voter {voter.user_id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{voter.total_votes_cast}</div>
                          <div className="text-xs text-muted-foreground">votes</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{voter.current_streak}🔥</Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards for Brands */}
        <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Brand Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { medal: "🥇", place: "1st Place", reward: "Homepage hero banner + Featured article + Full analytics", bg: "bg-yellow-500/10 border-yellow-500/20" },
              { medal: "🥈", place: "2nd Place", reward: "Featured article + Advanced analytics dashboard", bg: "bg-gray-500/10 border-gray-500/20" },
              { medal: "🥉", place: "3rd Place", reward: "Social media feature + Basic analytics", bg: "bg-amber-600/10 border-amber-600/20" },
            ].map((item, i) => (
              <motion.div
                key={item.place}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${item.bg}`}
              >
                <div className="text-2xl">{item.medal}</div>
                <div>
                  <div className="font-semibold">{item.place}</div>
                  <div className="text-sm text-muted-foreground">{item.reward}</div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* How to Earn Credits */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            How to Earn Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: "🗳️", title: "+2 Credits", desc: "Per vote cast" },
              { emoji: "🔥", title: "+20 Bonus", desc: "7-day streak" },
              { emoji: "👑", title: "€50 Credits", desc: "Top 10 voters monthly" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl bg-muted/20 border border-primary/5 text-center hover:border-primary/20 transition-colors"
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="font-bold text-lg">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
