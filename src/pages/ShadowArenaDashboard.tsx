import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { ShadowArenaHero } from '@/components/shadow-arena/ShadowArenaHero';
import { ShadowCreditsCard } from '@/components/shadow-arena/ShadowCreditsCard';
import { ShadowAIToolsHub } from '@/components/shadow-arena/ShadowAIToolsHub';
import { ArenaSteps } from '@/components/shadow-arena/ArenaSteps';
import { LiveBattleTicker } from '@/components/shadow-arena/LiveBattleTicker';
import { ArenaPrizePool } from '@/components/shadow-arena/ArenaPrizePool';
import { ArenaLeaderboard } from '@/components/shadow-arena/ArenaLeaderboard';
import { ArenaStoryCard } from '@/components/shadow-arena/ArenaStoryCard';
import { ArenaAchievements } from '@/components/shadow-arena/ArenaAchievements';
import { CurseWheelCard } from '@/components/shadow-arena/CurseWheelCard';
import { StoryChainsCard } from '@/components/shadow-arena/StoryChainsCard';
import { VoiceCloneCard } from '@/components/shadow-arena/VoiceCloneCard';
import { CursedAchievementsCard } from '@/components/shadow-arena/CursedAchievementsCard';
import { HorrorReelsCard } from '@/components/shadow-arena/HorrorReelsCard';
import { PushNotificationsCard } from '@/components/shadow-arena/PushNotificationsCard';
import { VirtualGiftsCard } from '@/components/shadow-arena/VirtualGiftsCard';
import { DuetBattlesCard } from '@/components/shadow-arena/DuetBattlesCard';
import { StreamGoalsCard } from '@/components/shadow-arena/StreamGoalsCard';
import { TopGiftersCard } from '@/components/shadow-arena/TopGiftersCard';
import { TournamentsCard } from '@/components/shadow-arena/TournamentsCard';
import { StreamScheduleCard } from '@/components/shadow-arena/StreamScheduleCard';
import { AutoClipsCard } from '@/components/shadow-arena/AutoClipsCard';
import { ChatModerationCard } from '@/components/shadow-arena/ChatModerationCard';
import { Plus, Swords, BookOpen, Trophy } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Battle {
  id: string;
  challenge_theme: string;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  total_prize_pool: number;
}

interface Story {
  id: string;
  title: string;
  content: string;
  votes_count: number;
  is_top_week: boolean;
  created_at: string;
}

export default function ShadowArenaDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Verify payment after Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'canceled') {
      toast.error(t('shadow.credits.purchase_canceled'));
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
      return;
    }
    if (paymentStatus === 'success' && sessionId) {
      supabase.functions
        .invoke('verify-credits-payment', { body: { session_id: sessionId } })
        .then(({ data, error }) => {
          if (error || !data?.success) {
            toast.error(t('shadow.credits.verify_failed'));
          } else {
            toast.success(t('shadow.credits.purchase_success'));
            queryClient.invalidateQueries({ queryKey: ['shadow-arena-credits'] });
          }
          searchParams.delete('payment');
          searchParams.delete('session_id');
          setSearchParams(searchParams, { replace: true });
        });
    }
  }, [searchParams, setSearchParams, t, queryClient]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [battlesResult, storiesResult] = await Promise.all([
        supabase
          .from('shadow_battles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('shadow_stories')
          .select('*')
          .eq('is_top_week', true)
          .order('votes_count', { ascending: false })
          .limit(10)
      ]);

      if (battlesResult.error) throw battlesResult.error;
      if (storiesResult.error) throw storiesResult.error;

      setBattles(battlesResult.data || []);
      setStories(storiesResult.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalActivePrizePool = battles
    .filter(b => b.status === 'active' || b.status === 'waiting_for_participants')
    .reduce((sum, b) => sum + b.total_prize_pool, 0);

  const activeBattlesCount = battles.filter(b => b.status === 'active' || b.status === 'waiting_for_participants').length;

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-6 pb-8 max-w-6xl">
        <ShadowArenaHero
          totalPrizePool={totalActivePrizePool}
          activeBattles={activeBattlesCount}
          topStories={stories.length}
        />
        <LiveBattleTicker battles={battles} />

        {/* AI Studio + Credits */}
        <ShadowCreditsCard />
        <ShadowAIToolsHub />

        <ArenaPrizePool totalPool={totalActivePrizePool} />
        <ArenaLeaderboard />

        {/* TikTok-LIVE parity pack */}
        <DuetBattlesCard />
        <VirtualGiftsCard />
        <StreamGoalsCard />
        <TopGiftersCard />
        <TournamentsCard />
        <StreamScheduleCard />
        <AutoClipsCard />
        <ChatModerationCard />

        {/* New 8 advanced features */}
        <PushNotificationsCard />
        <CurseWheelCard />
        <StoryChainsCard />
        <HorrorReelsCard />
        <VoiceCloneCard />
        <CursedAchievementsCard />
        <ArenaAchievements />

        <ArenaSteps />

        {/* Content Tabs */}
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('shadow.dashboard.tab_stories')}
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Trophy className="mr-2 h-4 w-4" />
              {t('shadow.dashboard.tab_battles')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              </div>
            ) : stories.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <p className="text-muted-foreground">{t('shadow.dashboard.no_stories')}</p>
                <Button onClick={() => navigate('/shadow-arena/submit-story')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('shadow.dashboard.submit_story_cta')}
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {stories.map((story) => (
                  <ArenaStoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="battles" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              </div>
            ) : battles.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <p className="text-muted-foreground">{t('shadow.dashboard.no_battles')}</p>
                <Button onClick={() => navigate('/shadow-arena/battles')}>
                  <Swords className="mr-2 h-4 w-4" />
                  {t('shadow.dashboard.create_battle_cta')}
                </Button>
              </Card>
            ) : (
              battles.map((battle) => (
                <Card
                  key={battle.id}
                  className="p-5 hover:border-purple-700/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{battle.challenge_theme}</h3>
                      <span className="text-xs text-muted-foreground capitalize">{battle.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-lg font-bold text-yellow-400">€{battle.total_prize_pool.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SubscriptionGate>
  );
}
