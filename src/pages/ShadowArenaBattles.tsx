import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { Swords, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Battle {
  id: string;
  challenge_theme: string;
  challenge_prompt: string;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  total_prize_pool: number;
}

export default function ShadowArenaBattles() {
  const navigate = useNavigate();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_battles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBattles(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  const createNewBattle = async () => {
    try {
      setCreating(true);
      toast.info('Creating new battle with AI challenge...');

      const { data, error } = await supabase.functions.invoke('create-shadow-battle');
      
      if (error) throw error;

      toast.success('New battle created!');
      fetchBattles();
    } catch (error) {
      console.error('Create battle error:', error);
      toast.error('Failed to create battle');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_for_participants': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeRemaining = (endsAt: string | null) => {
    if (!endsAt) return 'Not started';
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <SubscriptionGate>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-fuchsia-600 bg-clip-text text-transparent">
                <Swords className="h-10 w-10 text-purple-400" />
                Battle Arena
              </h1>
              <p className="text-lg text-muted-foreground">
                Monthly horror storytelling competitions with real cash prizes
              </p>
            </div>
            <Button 
              onClick={createNewBattle}
              disabled={creating}
              size="lg"
            >
              {creating ? 'Creating...' : 'Create New Battle'}
            </Button>
          </div>

          {/* Battle Explanation Card */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>🎯 <strong>How Battles Work:</strong> Every month, new challenges are created with AI-generated themes</p>
                <p>💶 <strong>Entry Fee:</strong> €1 to participate | All entries go into the prize pool</p>
                <p>🎭 <strong>Anonymous Competition:</strong> Stories are submitted anonymously for fair judging</p>
                <p>🎁 <strong>Voting System:</strong> Readers vote using digital gifts (each gift = weighted vote)</p>
                <p>🏆 <strong>Prize Distribution:</strong> 80% to winners, 20% platform fee | Top 3 places win prizes</p>
                <p>⏰ <strong>Duration:</strong> Each battle runs for 14 days from start</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : battles.length === 0 ? (
          <Card className="p-12 text-center">
            <Swords className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">No battles yet</p>
            <p className="text-muted-foreground mb-6">Create the first battle to get started!</p>
            <Button onClick={createNewBattle} disabled={creating}>
              {creating ? 'Creating...' : 'Create First Battle'}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {battles.map((battle) => (
              <Card 
                key={battle.id} 
                className="p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(battle.status)}>
                        {battle.status.replace('_', ' ')}
                      </Badge>
                      {battle.ends_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {getTimeRemaining(battle.ends_at)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{battle.challenge_theme}</h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {battle.challenge_prompt}
                    </p>
                  </div>
                  <div className="text-right">
                    <Trophy className="h-8 w-8 text-primary mb-2 ml-auto" />
                    <p className="text-3xl font-bold text-primary">
                      €{battle.total_prize_pool.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Prize Pool</p>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shadow-arena/battle/${battle.id}`);
                  }}
                >
                  View Battle Details
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
