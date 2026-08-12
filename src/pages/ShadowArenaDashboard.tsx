import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShadowCreditsGate } from '@/components/shadow-arena/ShadowCreditsGate';
import { ShadowArenaHero } from '@/components/shadow-arena/ShadowArenaHero';
import { ShadowCreditsCard } from '@/components/shadow-arena/ShadowCreditsCard';
import { ShadowAIToolsHub } from '@/components/shadow-arena/ShadowAIToolsHub';
import { ArenaLeaderboard } from '@/components/shadow-arena/ArenaLeaderboard';
import { ArenaStoryCard } from '@/components/shadow-arena/ArenaStoryCard';
import { CurseWheelCard } from '@/components/shadow-arena/CurseWheelCard';
import { PushNotificationsCard } from '@/components/shadow-arena/PushNotificationsCard';
import { DuetBattlesCard } from '@/components/shadow-arena/DuetBattlesCard';

import { Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storiesResult = await supabase
        .from('shadow_stories')
        .select('id, title, content, votes_count, is_top_week, created_at, user_id, is_anonymous')
        .order('is_top_week', { ascending: false })
        .order('votes_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (storiesResult.error) throw storiesResult.error;

      setStories(storiesResult.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <><FloatingHowItWorks title="ShadowArenaDashboard — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaDashboard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<ShadowCreditsGate>
      <div className="container mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-8 max-w-6xl">
        <ShadowArenaHero topStories={stories.length} />

        {/* AI Studio + Credits */}
        <ShadowCreditsCard />
        <ShadowAIToolsHub />

        <ArenaLeaderboard />

        <DuetBattlesCard />
        <PushNotificationsCard />
        <CurseWheelCard />

        {/* Top Stories */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <BookOpen className="h-5 w-5" />
            Top Stories
          </h2>
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
        </div>
      </div>
    </ShadowCreditsGate>
  </>
  );
}
