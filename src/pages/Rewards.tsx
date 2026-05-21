import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import DailyRewardButton from "@/components/gamification/DailyRewardButton";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import { XpToCreditsConverter } from "@/components/gamification/XpToCreditsConverter";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import BadgeLeaderboard from "@/components/gamification/BadgeLeaderboard";
import MyBadgesDisplay from "@/components/gamification/MyBadgesDisplay";
import WeeklyChallenges from "@/components/rewards/WeeklyChallenges";
import RewardHistoryTimeline from "@/components/rewards/RewardHistoryTimeline";
import StreakHeatmap from "@/components/rewards/StreakHeatmap";
import AchievementProgressCards from "@/components/rewards/AchievementProgressCards";
import XPMultiplierBanner from "@/components/rewards/XPMultiplierBanner";
import RewardsGuide from "@/components/gamification/RewardsGuide";
import RewardsCinematicHero from "@/components/rewards/RewardsCinematicHero";
import RewardsAIToolsGrid from "@/components/rewards/RewardsAIToolsGrid";
import RewardsXPLeaderboard from "@/components/rewards/RewardsXPLeaderboard";
import RewardsRewardTiers from "@/components/rewards/RewardsRewardTiers";
import RewardsLuckyWheel from "@/components/rewards/RewardsLuckyWheel";
import RewardsSeasonalMissions from "@/components/rewards/RewardsSeasonalMissions";
import RewardsStreakCoach from "@/components/rewards/RewardsStreakCoach";
import RewardsGiftXP from "@/components/rewards/RewardsGiftXP";
import RewardsShowcase from "@/components/rewards/RewardsShowcase";
import RewardsXPBetting from "@/components/rewards/RewardsXPBetting";
import RewardsMysteryBadges from "@/components/rewards/RewardsMysteryBadges";
import RewardsMarketplace from "@/components/rewards/RewardsMarketplace";
import RewardsLeagues from "@/components/rewards/RewardsLeagues";
import RewardsBattlePass from "@/components/rewards/RewardsBattlePass";
import RewardsStreakFreeze from "@/components/rewards/RewardsStreakFreeze";
import RewardsLoginCalendar from "@/components/rewards/RewardsLoginCalendar";
import RewardsFriendQuests from "@/components/rewards/RewardsFriendQuests";
import RewardsGuilds from "@/components/rewards/RewardsGuilds";
import RewardsQuestPath from "@/components/rewards/RewardsQuestPath";
import RewardsCosmetics from "@/components/rewards/RewardsCosmetics";
import RewardsYearWrapped from "@/components/rewards/RewardsYearWrapped";
import RewardsDonateXP from "@/components/rewards/RewardsDonateXP";
import { WeeklyXPLeaderboard } from "@/components/gamification/WeeklyXPLeaderboard";
import { LastWeekWinners } from "@/components/gamification/LastWeekWinners";
import { Crown, Home, Wand2, Trophy, Layers, Disc3, Target, Award, Medal, Flame, Gift, Eye, Sword, HelpCircle, ShoppingBag, Shield, Snowflake, CalendarDays, Users, Castle, Map, Sparkles as SparklesIcon, PartyPopper, Heart } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { useRewardsStats } from "@/hooks/useRewardsStats";
const TABS = [
  { id: "overview", icon: Home, label: "Overview" },
  { id: "leagues", icon: Shield, label: "Leagues" },
  { id: "battlepass", icon: Crown, label: "Battle Pass" },
  { id: "calendar", icon: CalendarDays, label: "Calendar" },
  { id: "freeze", icon: Snowflake, label: "Streak Freeze" },
  { id: "friend-quests", icon: Users, label: "Friend Quests" },
  { id: "guilds", icon: Castle, label: "Guilds" },
  { id: "quest-path", icon: Map, label: "Quest Path" },
  { id: "cosmetics", icon: SparklesIcon, label: "Cosmetics" },
  { id: "wrapped", icon: PartyPopper, label: "Wrapped" },
  { id: "donate-xp", icon: Heart, label: "Donate XP" },
  { id: "ai-tools", icon: Wand2, label: "AI Tools" },
  { id: "tiers", icon: Layers, label: "Tiers" },
  { id: "spin", icon: Disc3, label: "Lucky Spin" },
  { id: "leaderboard", icon: Trophy, label: "Ranks" },
  { id: "missions", icon: Target, label: "Missions" },
  { id: "badges", icon: Award, label: "Badges" },
  { id: "hunters", icon: Medal, label: "Hunters" },
  { id: "streak-coach", icon: Flame, label: "Streak Coach" },
  { id: "gift-xp", icon: Gift, label: "Gift XP" },
  { id: "showcase", icon: Eye, label: "Showcase" },
  { id: "betting", icon: Sword, label: "XP Betting" },
  { id: "mystery", icon: HelpCircle, label: "Mystery" },
  { id: "marketplace", icon: ShoppingBag, label: "Marketplace" },
];

export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");
  const { data: stats } = useRewardsStats(user?.id);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/auth");
      else setUser(data.user);
    });
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <XPMultiplierBanner />
        <RewardsCinematicHero
          level={stats?.level ?? 1}
          totalXP={stats?.totalXP ?? 0}
          streak={stats?.streak ?? 0}
          badges={stats?.badges ?? 0}
        />


        <HeroRewardedAd sectionKey="page_rewards" />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeView === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20"
                  : "bg-card/60 text-muted-foreground hover:bg-card/80 border border-amber-400/15"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <DailyRewardButton />
              <DailyXPVideoReward userId={user.id} />
              <div className="sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={() => navigate('/premium-store')}
                  className="w-full h-full min-h-[120px] gap-2 text-lg bg-gradient-to-br from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  size="lg"
                >
                  <Crown className="h-6 w-6" />
                  Premium Store
                </Button>
            </div>
            </div>

            <div className="mb-8">
              <XpToCreditsConverter userId={user.id} />
            </div>





            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-6">
                <AchievementProgressCards userId={user.id} />
                <WeeklyChallenges />
              </div>
              <div className="space-y-6">
                <WeeklyXPLeaderboard />
                <LastWeekWinners />
                <StreakHeatmap userId={user.id} />
                <RewardHistoryTimeline userId={user.id} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/rewards/audit')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View full XP audit log
                </Button>
              </div>
            </div>

            <RewardsGuide />
            <div className="mt-6">
              <MyBadgesDisplay userId={user.id} />
            </div>
          </>
        )}

        {activeView === "ai-tools" && <RewardsAIToolsGrid />}
        {activeView === "tiers" && <RewardsRewardTiers />}
        {activeView === "spin" && <RewardsLuckyWheel />}
        {activeView === "leaderboard" && <RewardsXPLeaderboard />}
        {activeView === "missions" && <RewardsSeasonalMissions />}
        {activeView === "badges" && <BadgesDisplay userId={user.id} />}
        {activeView === "hunters" && <BadgeLeaderboard />}
        {activeView === "streak-coach" && <RewardsStreakCoach />}
        {activeView === "gift-xp" && <RewardsGiftXP />}
        {activeView === "showcase" && <RewardsShowcase />}
        {activeView === "betting" && <RewardsXPBetting />}
        {activeView === "mystery" && <RewardsMysteryBadges />}
        {activeView === "marketplace" && <RewardsMarketplace />}
        {activeView === "leagues" && <RewardsLeagues />}
        {activeView === "battlepass" && <RewardsBattlePass />}
        {activeView === "calendar" && <RewardsLoginCalendar />}
        {activeView === "freeze" && <RewardsStreakFreeze />}
        {activeView === "friend-quests" && <RewardsFriendQuests />}
        {activeView === "guilds" && <RewardsGuilds />}
        {activeView === "quest-path" && <RewardsQuestPath />}
        {activeView === "cosmetics" && <RewardsCosmetics />}
        {activeView === "wrapped" && <RewardsYearWrapped />}
        {activeView === "donate-xp" && <RewardsDonateXP />}
      </div>
    </div>
  );
}
