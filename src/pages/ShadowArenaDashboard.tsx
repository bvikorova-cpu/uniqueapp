import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShadowCreditsGate } from '@/components/shadow-arena/ShadowCreditsGate';
import { ShadowArenaHero } from '@/components/shadow-arena/ShadowArenaHero';
import { ShadowCreditsCard } from '@/components/shadow-arena/ShadowCreditsCard';
import { ShadowAIToolsHub } from '@/components/shadow-arena/ShadowAIToolsHub';
import { LiveBattleTicker } from '@/components/shadow-arena/LiveBattleTicker';
import { ArenaLeaderboard } from '@/components/shadow-arena/ArenaLeaderboard';
import { ArenaStoryCard } from '@/components/shadow-arena/ArenaStoryCard';
import { CurseWheelCard } from '@/components/shadow-arena/CurseWheelCard';
import { PushNotificationsCard } from '@/components/shadow-arena/PushNotificationsCard';
import { DuetBattlesCard } from '@/components/shadow-arena/DuetBattlesCard';

import { Plus, Swords, BookOpen, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
  user_id?: string | null;
  is_anonymous?: boolean | null;
}

export default function ShadowArenaDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);


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
          .order('is_top_week', { ascending: false })
          .order('votes_count', { ascending: false })
          .order('created_at', { ascending: false })
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
    <><FloatingHowItWorks title="ShadowArenaDashboard — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaDashboard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<ShadowCreditsGate>
      <div className="container mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-8 max-w-6xl">
        <ShadowArenaHero
          totalPrizePool={totalActivePrizePool}
          activeBattles={activeBattlesCount}
          topStories={stories.length}
        />
        <LiveBattleTicker battles={battles} />

        {/* AI Studio + Credits */}
        <ShadowCreditsCard />
        <ShadowAIToolsHub />

        <ArenaLeaderboard />

        <DuetBattlesCard />
        <PushNotificationsCard />
        <CurseWheelCard />



        {/* Content Tabs */}
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">
              <BookOpen className="mr-2 h-4 w-4" />
              {"Top Stories"}
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Trophy className="mr-2 h-4 w-4" />
              {"Recent Battles"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              </div>
            ) : stories.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <p className="text-muted-foreground">{"No stories yet. Be the first to submit!"}</p>
                <Button onClick={() => navigate('/shadow-arena/submit-story')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {"Submit a Story"}
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
                <p className="text-muted-foreground">{"No battles yet. Create the first one!"}</p>
                <Button onClick={() => navigate('/shadow-arena/battles')}>
                  <Swords className="mr-2 h-4 w-4" />
                  {"Create a Battle"}
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
                      <span className="text-lg font-bold text-yellow-400">{battle.total_prize_pool} pts</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ShadowCreditsGate>
  </>
  );
}
