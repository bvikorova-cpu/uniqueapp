import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      const [battlesResult, storiesResult] = await Promise.all([
        supabase
          .from('shadow_battles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('shadow_stories')
          .select('*')
          .eq('is_top_week', true)
          .order('votes_count', { ascending: false })
          .limit(5)
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

  return (
    <SubscriptionGate>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Ghost className="h-12 w-12 text-purple-400" />
              Shadow Arena
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              The Ultimate Horror Storytelling & Creator Battle Platform
            </p>
          </div>

          {/* Platform Description */}
          <Card className="mb-8 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Ghost className="h-6 w-6 text-purple-400" />
                    What is Shadow Arena?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Shadow Arena is a premium horror storytelling platform where creators compete in monthly battles, 
                    share terrifying tales, and earn real money. Subscribe for €2/month to unlock unlimited access 
                    to AI-enhanced stories, battle participation, and exclusive community features.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-purple-500">✨</Badge>
                      <span className="text-sm">AI-enhanced stories with generated illustrations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-purple-500">⚔️</Badge>
                      <span className="text-sm">Monthly creator battles with €1 entry fee</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-purple-500">🎁</Badge>
                      <span className="text-sm">Digital gifting system for voting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-purple-500">💰</Badge>
                      <span className="text-sm">80% of prize pool to winners, 20% to platform</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <h3 className="font-semibold mb-1">Subscribe</h3>
                        <p className="text-sm text-muted-foreground">Get unlimited access for just €2/month</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <h3 className="font-semibold mb-1">Create Stories</h3>
                        <p className="text-sm text-muted-foreground">Submit your horror stories and let AI enhance them with illustrations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <h3 className="font-semibold mb-1">Join Battles</h3>
                        <p className="text-sm text-muted-foreground">Enter monthly battles with €1 entry fee and compete anonymously</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <h3 className="font-semibold mb-1">Earn & Win</h3>
                        <p className="text-sm text-muted-foreground">Receive digital gifts from fans and win prize pools from battles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
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
                <Card 
                  key={story.id}
                  className="p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/shadow-arena/story/${story.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {story.content.substring(0, 200)}...
                      </p>
                      <Badge className="bg-yellow-500">
                        ⭐ {story.votes_count} votes
                      </Badge>
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
                <p className="text-muted-foreground">No battles yet. Create the first one!</p>
              </Card>
            ) : (
              battles.map((battle) => (
                <Card 
                  key={battle.id}
                  className="p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          battle.status === 'active' ? 'bg-green-500' : 
                          battle.status === 'waiting_for_participants' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }>
                          {battle.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{battle.challenge_theme}</h3>
                    </div>
                    <div className="text-right">
                      <Trophy className="h-8 w-8 text-primary mb-2 ml-auto" />
                      <p className="text-2xl font-bold text-primary">
                        €{battle.total_prize_pool.toFixed(2)}
                      </p>
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
