import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Eye, MessageCircle, Gift, 
  Send, Radio 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { motion } from 'framer-motion';
import { SpectatorBetting } from './SpectatorBetting';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  color: string;
}

const virtualGifts: VirtualGift[] = [
  { id: 'heart', name: 'Heart', emoji: '❤️', cost: 5, color: 'text-red-500' },
  { id: 'gift', name: 'Gift Box', emoji: '🎁', cost: 10, color: 'text-pink-500' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', cost: 20, color: 'text-yellow-500' },
  { id: 'crown', name: 'Crown', emoji: '👑', cost: 50, color: 'text-purple-500' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', cost: 100, color: 'text-cyan-500' },
];

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  message_type: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface LiveMatch {
  id: string;
  category: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  game_mode: string;
  status: string;
  player1_profile?: { full_name: string; avatar_url: string };
  player2_profile?: { full_name: string; avatar_url: string };
  spectator_count?: number;
}

export const LiveSpectatorMode = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { credits, spendCredits } = useBrainDuelCredits();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { data: liveMatches, isLoading } = useQuery({
    queryKey: ['brain-duel-live-matches'],
    queryFn: async () => {
      const { data: matches } = await supabase
        .from('brain_duel_matches')
        .select('*')
        .in('status', ['active', 'ready'])
        .eq('is_spectatable', true)
        .order('started_at', { ascending: false })
        .limit(20);

      if (!matches) return [];

      const playerIds = new Set<string>();
      matches.forEach(m => {
        playerIds.add(m.player1_id);
        if (m.player2_id) playerIds.add(m.player2_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(playerIds));

      const matchIds = matches.map(m => m.id);
      const { data: spectators } = await supabase
        .from('brain_duel_spectators')
        .select('match_id')
        .in('match_id', matchIds)
        .is('left_at', null);

      const spectatorCounts: Record<string, number> = {};
      spectators?.forEach(s => {
        spectatorCounts[s.match_id] = (spectatorCounts[s.match_id] || 0) + 1;
      });

      return matches.map(match => ({
        ...match,
        player1_profile: profiles?.find(p => p.id === match.player1_id),
        player2_profile: profiles?.find(p => p.id === match.player2_id),
        spectator_count: spectatorCounts[match.id] || 0,
      }));
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!selectedMatch) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('brain_duel_match_chat')
        .select('*')
        .eq('match_id', selectedMatch)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        setChatMessages(data.map(msg => ({
          ...msg,
          profile: profiles?.find(p => p.id === msg.user_id),
        })));
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`match-chat-${selectedMatch}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'brain_duel_match_chat', filter: `match_id=eq.${selectedMatch}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          setChatMessages(prev => [...prev, { ...payload.new as ChatMessage, profile }]);
        }
      )
      .subscribe();

    return (
    <>
      <FloatingHowItWorks title={"Live Spectator Mode - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Spectator Mode section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Spectator Mode.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); };
  }, [selectedMatch]);

  const joinAsSpectator = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('brain_duel_spectators')
        .upsert({ match_id: matchId, user_id: userId!, joined_at: new Date().toISOString(), left_at: null });
      if (error) throw error;
      return matchId;
    },
    onSuccess: (matchId) => {
      setSelectedMatch(matchId);
      toast({ title: 'Joined as spectator! 👀', description: 'You can now watch the match and chat' });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!chatMessage.trim() || !selectedMatch || !userId) return;
      const { error } = await supabase
        .from('brain_duel_match_chat')
        .insert({ match_id: selectedMatch, user_id: userId, message: chatMessage, message_type: 'chat' });
      if (error) throw error;
    },
    onSuccess: () => { setChatMessage(''); },
  });

  const sendGift = useMutation({
    mutationFn: async ({ gift, recipientId }: { gift: VirtualGift; recipientId: string }) => {
      if (credits < gift.cost) throw new Error('Insufficient credits');
      spendCredits(gift.cost);
      const { error } = await supabase
        .from('brain_duel_gifts')
        .insert({ match_id: selectedMatch!, sender_id: userId!, recipient_id: recipientId, gift_type: gift.id, gift_cost: gift.cost });
      if (error) throw error;
      await supabase
        .from('brain_duel_match_chat')
        .insert({ match_id: selectedMatch!, user_id: userId!, message: `sent ${gift.emoji} to the player!`, message_type: 'gift' });
      return gift;
    },
    onSuccess: (gift) => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      toast({ title: `${gift.emoji} Gift sent!`, description: `You sent a ${gift.name} (${gift.cost} credits)` });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to send gift', description: error.message, variant: 'destructive' });
    },
  });

  const selectedMatchData = liveMatches?.find(m => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 backdrop-blur-xl bg-card/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Radio className="h-5 w-5 text-red-500" />
            </motion.div>
            Live Spectator Mode
          </CardTitle>
          <CardDescription>Watch live battles and support your favorite players with virtual gifts</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Matches List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Matches ({liveMatches?.length || 0})
          </h3>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse backdrop-blur-xl bg-card/80">
                  <CardContent className="p-6 h-32" />
                </Card>
              ))}
            </div>
          ) : liveMatches && liveMatches.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {liveMatches.map((match: LiveMatch, i: number) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card 
                    className={`cursor-pointer backdrop-blur-xl bg-card/80 transition-all hover:shadow-lg ${
                      selectedMatch === match.id ? 'ring-2 ring-primary border-primary/30' : 'border-primary/10'
                    }`}
                    onClick={() => joinAsSpectator.mutate(match.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Radio className="h-3 w-3 text-red-500 animate-pulse" />
                          LIVE
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 border-primary/20">
                          <Eye className="h-3 w-3" />
                          {match.spectator_count}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={match.player1_profile?.avatar_url} />
                            <AvatarFallback className="bg-primary/10">P1</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{match.player1_profile?.full_name || 'Player 1'}</p>
                            <p className="text-2xl font-black text-primary">{match.player1_score}</p>
                          </div>
                        </div>
                        
                        <span className="text-muted-foreground font-bold">VS</span>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-medium text-sm">{match.player2_profile?.full_name || 'Player 2'}</p>
                            <p className="text-2xl font-black text-orange-500">{match.player2_score}</p>
                          </div>
                          <Avatar className="h-10 w-10 ring-2 ring-orange-500/20">
                            <AvatarImage src={match.player2_profile?.avatar_url} />
                            <AvatarFallback className="bg-orange-500/10">P2</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Badge variant="secondary">{match.category}</Badge>
                        <Badge variant="outline" className="border-primary/20">{match.game_mode || 'Quick'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No live matches right now</p>
                <p className="text-sm text-muted-foreground mt-1">Check back later or start your own match!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat & Gifts Panel */}
        <div className="space-y-4">
          {selectedMatch && selectedMatchData ? (
            <>
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Watching:</span>
                    <Badge variant="secondary">
                      <Radio className="h-3 w-3 mr-1 text-red-500 animate-pulse" />
                      LIVE
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedMatchData.player1_profile?.full_name} vs {selectedMatchData.player2_profile?.full_name}
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    Send Virtual Gifts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {virtualGifts.map((gift) => (
                      <Button
                        key={gift.id}
                        variant="outline"
                        size="sm"
                        onClick={() => sendGift.mutate({ gift, recipientId: selectedMatchData.player1_id })}
                        disabled={credits < gift.cost || sendGift.isPending}
                        className="flex-1 min-w-[60px] border-primary/10 hover:bg-primary/10"
                      >
                        <span className="text-lg mr-1">{gift.emoji}</span>
                        <span className="text-xs">{gift.cost}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Your credits: {credits}
                  </p>
                </CardContent>
              </Card>

              <Card className="flex-1 backdrop-blur-xl bg-card/80 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {chatMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`text-sm ${
                            msg.message_type === 'gift' ? 'text-yellow-500 font-medium' : ''
                          }`}
                        >
                          <span className="font-semibold">
                            {msg.profile?.full_name || 'User'}:
                          </span>{' '}
                          {msg.message}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage.mutate()}
                      className="backdrop-blur-sm"
                    />
                    <Button 
                      size="icon" 
                      onClick={() => sendMessage.mutate()}
                      disabled={!chatMessage.trim() || sendMessage.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Spectator Betting */}
              <SpectatorBetting
                matchId={selectedMatch}
                player1Name={selectedMatchData.player1_profile?.full_name || "Player 1"}
                player2Name={selectedMatchData.player2_profile?.full_name || "Player 2"}
                player1Id={selectedMatchData.player1_id}
                player2Id={selectedMatchData.player2_id}
              />
            </>
          ) : (
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardContent className="p-8 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">
                  Select a match to watch and chat
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};