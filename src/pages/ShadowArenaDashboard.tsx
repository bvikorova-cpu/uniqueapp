import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { ArenaHero } from '@/components/shadow-arena/ArenaHero';
import { ArenaSteps } from '@/components/shadow-arena/ArenaSteps';
import { LiveBattleTicker } from '@/components/shadow-arena/LiveBattleTicker';
import { ArenaPrizePool } from '@/components/shadow-arena/ArenaPrizePool';
import { ArenaLeaderboard } from '@/components/shadow-arena/ArenaLeaderboard';
import { ArenaStoryCard } from '@/components/shadow-arena/ArenaStoryCard';
import { ArenaAchievements } from '@/components/shadow-arena/ArenaAchievements';
import { Plus, Swords, BookOpen, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-5xl">
        <ArenaHero />
        <LiveBattleTicker battles={battles} />

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate('/shadow-arena/submit-story')}
            size="lg"
            className="h-20 text-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40 shadow-lg"
          >
            <Plus className="mr-2 h-6 w-6" />
            Submit Your Horror Story
          </Button>
          <Button
            onClick={() => navigate('/shadow-arena/battles')}
            size="lg"
            variant="outline"
            className="h-20 text-lg border-purple-700/40 hover:bg-purple-950/20"
          >
            <Swords className="mr-2 h-6 w-6" />
            Browse All Battles
          </Button>
        </div>

        <ArenaPrizePool totalPool={totalActivePrizePool} />
        <ArenaLeaderboard />
        <ArenaAchievements />

        <ArenaSteps />

        {/* Content Tabs */}
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">
              <BookOpen className="mr-2 h-4 w-4" />
              Top Stories
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Trophy className="mr-2 h-4 w-4" />
              Recent Battles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              </div>
            ) : stories.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No stories yet. Be the first to submit!</p>
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
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No battles yet. Create the first one!</p>
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
