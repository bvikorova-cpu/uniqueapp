import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DailyRewardButton from "@/components/gamification/DailyRewardButton";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import BadgeLeaderboard from "@/components/gamification/BadgeLeaderboard";
import Leaderboard from "@/components/gamification/Leaderboard";
import MyBadgesDisplay from "@/components/gamification/MyBadgesDisplay";
import RewardsHeroSection from "@/components/rewards/RewardsHeroSection";
import WeeklyChallenges from "@/components/rewards/WeeklyChallenges";
import RewardHistoryTimeline from "@/components/rewards/RewardHistoryTimeline";
import StreakHeatmap from "@/components/rewards/StreakHeatmap";
import AchievementProgressCards from "@/components/rewards/AchievementProgressCards";
import XPMultiplierBanner from "@/components/rewards/XPMultiplierBanner";
import RewardsGuide from "@/components/gamification/RewardsGuide";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser(data.user);
      }
    });
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('rewards.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* XP Multiplier Banner (shows only when event active) */}
        <XPMultiplierBanner />

        {/* Hero Section */}
        <RewardsHeroSection />

        {/* Action cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <DailyRewardButton />
          <DailyXPVideoReward userId={user.id} />
          <div className="sm:col-span-2 lg:col-span-1">
            <Button
              onClick={() => navigate('/premium-store')}
              className="w-full h-full min-h-[120px] gap-2 text-lg bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              <Crown className="h-6 w-6" />
              {t('rewards.premiumStore')}
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <AchievementProgressCards userId={user.id} />
            <WeeklyChallenges />
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            <StreakHeatmap userId={user.id} />
            <RewardHistoryTimeline userId={user.id} />
          </div>
        </div>

        <RewardsGuide />

        <Tabs defaultValue="my-badges" className="space-y-6 mt-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="my-badges" className="py-2 text-xs sm:text-sm">🏅 My Badges</TabsTrigger>
            <TabsTrigger value="badges" className="py-2 text-xs sm:text-sm">{t('rewards.badges')}</TabsTrigger>
            <TabsTrigger value="badge-hunters" className="py-2 text-xs sm:text-sm">🏆 Hunters</TabsTrigger>
            <TabsTrigger value="leaderboard" className="py-2 text-xs sm:text-sm">{t('rewards.leaderboard')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-badges">
            <MyBadgesDisplay userId={user.id} />
          </TabsContent>
          <TabsContent value="badges">
            <BadgesDisplay userId={user.id} />
          </TabsContent>
          <TabsContent value="badge-hunters">
            <BadgeLeaderboard />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
