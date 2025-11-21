import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { Plus, Swords, BookOpen, Trophy, Ghost } from 'lucide-react';
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
      const [battlesRes, storiesRes] = await Promise.all([
        supabase.from('shadow_battles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('shadow_stories').select('*').order('votes_count', { ascending: false }).limit(10)
      ]);

      if (battlesRes.data) setBattles(battlesRes.data);
      if (storiesRes.data) setStories(storiesRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionGate>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Ghost className="h-12 w-12 text-purple-400" />
            Shadow Arena Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Horror storytelling platform with creator battles & AI enhancements
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => navigate('/shadow-arena/submit-story')}
            size="lg"
            className="h-24 text-lg"
          >
            <Plus className="mr-2 h-6 w-6" />
            Submit Your Story
          </Button>
          <Button 
            onClick={() => navigate('/shadow-arena/battles')}
            size="lg"
            variant="outline"
            className="h-24 text-lg"
          >
            <Swords className="mr-2 h-6 w-6" />
            View Active Battles
          </Button>
        </div>

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

          <TabsContent value="stories" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">Loading stories...</div>
            ) : stories.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No stories yet. Be the first to submit!</p>
              </Card>
            ) : (
              stories.map((story) => (
                <Card key={story.id} className="p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/shadow-arena/story/${story.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{story.title}</h3>
                        {story.is_top_week && (
                          <Badge variant="default">Top of the Week</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {story.content}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{story.votes_count}</p>
                      <p className="text-xs text-muted-foreground">votes</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="battles" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">Loading battles...</div>
            ) : battles.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No battles yet. Check back soon!</p>
              </Card>
            ) : (
              battles.map((battle) => (
                <Card key={battle.id} className="p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Swords className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">{battle.challenge_theme}</h3>
                        <Badge variant={battle.status === 'active' ? 'default' : 'secondary'}>
                          {battle.status}
                        </Badge>
                      </div>
                      {battle.ends_at && (
                        <p className="text-sm text-muted-foreground">
                          Ends: {new Date(battle.ends_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">€{battle.total_prize_pool.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">prize pool</p>
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
