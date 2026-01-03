import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import BadgeLeaderboard from "@/components/gamification/BadgeLeaderboard";
import DailyRewardButton from "@/components/gamification/DailyRewardButton";
import Leaderboard from "@/components/gamification/Leaderboard";
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('rewards.titleEmoji')}
          </h1>
          <Button onClick={() => navigate('/premium-store')} className="gap-2">
            <Crown className="h-4 w-4" />
            {t('rewards.premiumStore')}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <PointsDisplay />
          <DailyRewardButton />
        </div>

        <RewardsGuide />

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">{t('rewards.badges')}</TabsTrigger>
            <TabsTrigger value="badge-hunters">🏆 Badge Hunters</TabsTrigger>
            <TabsTrigger value="leaderboard">{t('rewards.leaderboard')}</TabsTrigger>
          </TabsList>

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
