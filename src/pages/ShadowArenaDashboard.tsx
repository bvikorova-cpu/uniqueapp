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
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 via-purple-900/10 to-black/5 blur-3xl -z-10 animate-pulse"></div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-600 via-purple-600 to-black bg-clip-text text-transparent flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(139,0,0,0.5)]">
              <Ghost className="h-16 w-16 text-red-600 animate-pulse drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]" />
              Shadow Arena
            </h1>
            <p className="text-2xl text-red-300/80 mb-6 font-serif italic">
              Where Terror Meets Glory in Live Horror Battles
            </p>
          </div>

          {/* Platform Description */}
          <Card className="mb-8 bg-gradient-to-br from-black/80 via-red-950/40 to-purple-950/40 border-red-900/50 shadow-[0_0_30px_rgba(139,0,0,0.3)]">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4 flex items-center gap-2 text-red-400">
                    <Ghost className="h-8 w-8 text-red-500 animate-pulse" />
                    What is Shadow Arena?
                  </h2>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    <strong className="text-red-400">Shadow Arena</strong> is the world's first <strong>live horror storytelling battle platform</strong> where 
                    creators compete in spine-chilling monthly competitions. Stream yourself reading terrifying tales in real-time, 
                    engage with a live audience, and earn substantial cash prizes. For just <strong className="text-red-400">€2/month</strong>, 
                    unlock unlimited access to AI-enhanced stories, live streaming battles, interactive voting, and exclusive dark community features.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-red-900/30">
                      <Badge className="bg-red-600 text-white">📹</Badge>
                      <div>
                        <p className="text-sm font-bold text-red-300">Live Streaming Battles</p>
                        <p className="text-xs text-gray-400">Watch creators perform their horror stories in real-time with live chat</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-red-900/30">
                      <Badge className="bg-purple-600 text-white">✨</Badge>
                      <div>
                        <p className="text-sm font-bold text-purple-300">AI Enhancement</p>
                        <p className="text-xs text-gray-400">Stories enhanced with 3 atmospheric horror illustrations generated by AI</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-red-900/30">
                      <Badge className="bg-red-600 text-white">⚔️</Badge>
                      <div>
                        <p className="text-sm font-bold text-red-300">Monthly Battles</p>
                        <p className="text-xs text-gray-400">€1 entry fee per battle | Anonymous competition | AI-generated challenges</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-red-900/30">
                      <Badge className="bg-purple-600 text-white">🎁</Badge>
                      <div>
                        <p className="text-sm font-bold text-purple-300">Live Voting System</p>
                        <p className="text-xs text-gray-400">Send digital gifts during streams | Each gift is a weighted vote</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-red-900/30">
                      <Badge className="bg-red-600 text-white">💰</Badge>
                      <div>
                        <p className="text-sm font-bold text-red-300">Prize Distribution</p>
                        <p className="text-xs text-gray-400">80% to top 3 winners | 20% platform fee | Payouts via Stripe</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4 text-red-400">How It Works</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_15px_rgba(139,0,0,0.6)]">1</div>
                      <div>
                        <h3 className="font-bold mb-1 text-red-300">Subscribe to Enter</h3>
                        <p className="text-sm text-gray-400">Unlock full access for €2/month - cancel anytime</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-4 rounded-lg border border-purple-900/30">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.6)]">2</div>
                      <div>
                        <h3 className="font-bold mb-1 text-purple-300">Write Your Horror</h3>
                        <p className="text-sm text-gray-400">Submit stories & AI generates 3 atmospheric illustrations automatically</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_15px_rgba(139,0,0,0.6)]">3</div>
                      <div>
                        <h3 className="font-bold mb-1 text-red-300">Join Battle & Stream</h3>
                        <p className="text-sm text-gray-400">Pay €1 entry | Go live and perform your story | Viewers send gifts to vote</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-4 rounded-lg border border-purple-900/30">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.6)]">4</div>
                      <div>
                        <h3 className="font-bold mb-1 text-purple-300">Win Cash Prizes</h3>
                        <p className="text-sm text-gray-400">Top 3 split 80% of pool | More gifts = higher rank | Instant Stripe payouts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_15px_rgba(139,0,0,0.6)]">5</div>
                      <div>
                        <h3 className="font-bold mb-1 text-red-300">Build Your Following</h3>
                        <p className="text-sm text-gray-400">Gain fans | Archive streams | Earn from gifts on past performances</p>
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
            className="h-28 text-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border border-red-500/50 shadow-[0_0_20px_rgba(139,0,0,0.4)] hover:shadow-[0_0_30px_rgba(139,0,0,0.6)] transition-all"
          >
            <Plus className="mr-2 h-8 w-8" />
            Submit Your Horror Story
          </Button>
          <Button 
            onClick={() => navigate('/shadow-arena/battles')}
            size="lg"
            className="h-28 text-xl bg-gradient-to-r from-purple-700 to-black hover:from-purple-800 hover:to-black/90 border border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all"
          >
            <Swords className="mr-2 h-8 w-8" />
            <div className="flex flex-col">
              <span>Watch Live Battles</span>
              <Badge className="mt-1 bg-red-600 animate-pulse">🔴 LIVE NOW</Badge>
            </div>
          </Button>
        </div>

        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-red-950/50 to-black border border-red-900/50">
            <TabsTrigger value="stories" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Top Stories
            </TabsTrigger>
            <TabsTrigger value="battles" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Trophy className="mr-2 h-4 w-4" />
              Recent Battles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              </div>
            ) : stories.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-black/80 to-red-950/20 border-red-900/50">
                <p className="text-muted-foreground">No stories yet. Be the first to submit!</p>
              </Card>
            ) : (
              stories.map((story) => (
                <Card 
                  key={story.id}
                  className="p-6 hover:border-red-500 transition-colors cursor-pointer bg-gradient-to-br from-black/60 to-red-950/30 border-red-900/30 hover:shadow-[0_0_20px_rgba(139,0,0,0.3)]"
                  onClick={() => navigate(`/shadow-arena/story/${story.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-red-300">{story.title}</h3>
                      <p className="text-gray-400 line-clamp-2 mb-3">
                        {story.content.substring(0, 200)}...
                      </p>
                      <Badge className="bg-red-600">
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : battles.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-black/80 to-purple-950/20 border-purple-900/50">
                <p className="text-muted-foreground">No battles yet. Create the first one!</p>
              </Card>
            ) : (
              battles.map((battle) => (
                <Card 
                  key={battle.id}
                  className="p-6 hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-black/60 to-purple-950/30 border-purple-900/30 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
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
                      <h3 className="text-xl font-bold mb-2 text-purple-300">{battle.challenge_theme}</h3>
                    </div>
                    <div className="text-right">
                      <Trophy className="h-8 w-8 text-red-500 mb-2 ml-auto drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
                      <p className="text-2xl font-bold text-red-400">
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
