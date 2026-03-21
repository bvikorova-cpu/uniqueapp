import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { LiveStream } from '@/components/shadow-arena/LiveStream';
import { Swords, Trophy, Gift, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const GIFT_TYPES = [
  { type: "faint_whisper", amount: 0.10, name: "Faint Whisper", emoji: "👻" },
  { type: "scream", amount: 0.50, name: "Scream", emoji: "😱" },
  { type: "golden_fear_chest", amount: 5.00, name: "Golden Fear Chest", emoji: "💰" }
];

interface Participant {
  id: string;
  user_id: string;
  story_title: string;
  story_content: string;
  total_gifts_received: number;
  entry_fee_paid: boolean;
}

export default function ShadowArenaBattleDetail() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (battleId) {
      fetchBattleDetails();
    }
  }, [battleId]);

  const fetchBattleDetails = async () => {
    try {
      const [battleRes, participantsRes] = await Promise.all([
        supabase.from('shadow_battles').select('*').eq('id', battleId).single(),
        supabase.from('shadow_battle_participants').select('*').eq('battle_id', battleId)
      ]);

      if (battleRes.error) throw battleRes.error;
      setBattle(battleRes.data);
      setParticipants(participantsRes.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load battle details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async () => {
    if (!user) {
      toast.error('Please sign in to join');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('join-shadow-battle', {
        body: { battleId }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast.info('Complete payment to join the battle');
      }
    } catch (error) {
      console.error('Join error:', error);
      toast.error('Failed to join battle');
    }
  };

  const handleSendGift = async (participantId: string, giftType: string) => {
    if (!user) {
      toast.error('Please sign in to send gifts');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('purchase-shadow-gift', {
        body: { battleId, participantId, giftType }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast.info('Complete payment to send gift');
      }
    } catch (error) {
      console.error('Gift error:', error);
      toast.error('Failed to send gift');
    }
  };

  if (loading) {
    return (
      <SubscriptionGate>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SubscriptionGate>
    );
  }

  if (!battle) {
    return (
      <SubscriptionGate>
        <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 text-center">
          <p>Battle not found</p>
        </div>
      </SubscriptionGate>
    );
  }

  const userIsParticipant = participants.some(p => p.user_id === user?.id);

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/shadow-arena/battles')}
          className="mb-6"
        >
          ← Back to Battles
        </Button>

        <Card className="p-8 mb-6 bg-gradient-to-br from-purple-900/20 via-background to-fuchsia-900/20">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <Badge className="mb-3">{battle.status.replace('_', ' ')}</Badge>
              <h1 className="text-4xl font-black mb-3">{battle.challenge_theme}</h1>
              <p className="text-muted-foreground text-lg mb-4">
                {battle.challenge_prompt}
              </p>
              {battle.challenge_keywords && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Required keywords:</span>
                  {battle.challenge_keywords.map((kw: string, i: number) => (
                    <Badge key={i} variant="outline">{kw}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <Trophy className="h-12 w-12 text-primary mb-2 ml-auto" />
              <p className="text-4xl font-bold text-primary">
                €{battle.total_prize_pool.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Prize Pool</p>
            </div>
          </div>

          {!userIsParticipant && battle.status === 'waiting_for_participants' && (
            <Button onClick={handleJoinBattle} size="lg" className="w-full">
              Join Battle (€1.00 Entry Fee)
            </Button>
          )}
        </Card>

        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <User className="h-6 w-6" />
          Participants ({participants.length})
        </h2>

        {participants.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-black/80 to-red-950/20 border-red-900/50">
            <p className="text-white/80">No participants yet. Be the first to join!</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {participants.map((participant, index) => (
              <Card key={participant.id} className="p-6 bg-gradient-to-br from-black/80 to-red-950/20 border-red-900/50">
                {/* Live Stream Section */}
                {participant.user_id === user?.id || (participant as any).is_streaming ? (
                  <div className="mb-6">
                    <LiveStream
                      participantId={participant.id}
                      battleId={battleId!}
                      isStreamer={participant.user_id === user?.id}
                    />
                  </div>
                ) : null}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Story {String.fromCharCode(65 + index)}</Badge>
                      {participant.user_id === user?.id && (
                        <Badge>Your Story</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{participant.story_title}</h3>
                    <p className="text-muted-foreground line-clamp-4">
                      {participant.story_content}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      €{participant.total_gifts_received.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Gifts</p>
                  </div>
                </div>

                {participant.user_id !== user?.id && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold mb-3">Send a Gift to Vote:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {GIFT_TYPES.map((gift) => (
                        <Button
                          key={gift.type}
                          variant="outline"
                          onClick={() => handleSendGift(participant.id, gift.type)}
                          className="flex-col h-auto py-4"
                        >
                          <span className="text-3xl mb-2">{gift.emoji}</span>
                          <span className="font-semibold">{gift.name}</span>
                          <span className="text-primary font-bold">€{gift.amount.toFixed(2)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
