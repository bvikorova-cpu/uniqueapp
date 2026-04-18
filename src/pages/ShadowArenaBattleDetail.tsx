import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { LiveStream } from '@/components/shadow-arena/LiveStream';
import { BattlePredictorPanel } from '@/components/shadow-arena/BattlePredictorPanel';
import { LiveReactions } from '@/components/shadow-arena/LiveReactions';
import { Swords, Trophy, Gift, User, ArrowLeft, Clock, Skull } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const GIFT_TYPES = [
  { type: "faint_whisper", amount: 0.10, name: "Faint Whisper", icon: "W" },
  { type: "scream", amount: 0.50, name: "Scream", icon: "S" },
  { type: "golden_fear_chest", amount: 5.00, name: "Golden Fear Chest", icon: "G" },
];

interface Participant {
  id: string;
  user_id: string;
  story_title: string;
  story_content: string;
  total_gifts_received: number;
  entry_fee_paid: boolean;
  is_streaming?: boolean;
}

function BattleCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return <span className="font-mono text-red-400">{timeLeft}</span>;
}

export default function ShadowArenaBattleDetail() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (battleId) fetchBattleDetails();
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
    if (!user) { toast.error('Please sign in to join'); return; }
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
    if (!user) { toast.error('Please sign in to send gifts'); return; }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </SubscriptionGate>
    );
  }

  if (!battle) {
    return (
      <SubscriptionGate>
        <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 text-center">
          <p className="text-muted-foreground">Battle not found</p>
        </div>
      </SubscriptionGate>
    );
  }

  const userIsParticipant = participants.some(p => p.user_id === user?.id);
  const sortedParticipants = [...participants].sort((a, b) => b.total_gifts_received - a.total_gifts_received);

  const statusConfig: Record<string, { label: string; className: string }> = {
    waiting_for_participants: { label: "Open", className: "bg-yellow-600/80 text-yellow-100" },
    active: { label: "Live", className: "bg-green-600/80 text-green-100" },
    completed: { label: "Ended", className: "bg-muted text-muted-foreground" },
  };

  const cfg = statusConfig[battle.status] || { label: battle.status, className: "bg-muted" };

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shadow-arena/battles')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Battles
        </Button>

        {/* Battle hero */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(280,30%,8%)] via-[hsl(0,20%,6%)] to-[hsl(0,0%,4%)] p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/15 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                {battle.ends_at && battle.status !== "completed" && (
                  <span className="flex items-center gap-1 text-sm">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <BattleCountdown endsAt={battle.ends_at} />
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-3">
                {battle.challenge_theme}
              </h1>
              <p className="text-red-200/60 text-sm mb-4">{battle.challenge_prompt}</p>
              {battle.challenge_keywords && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Required keywords:</span>
                  {battle.challenge_keywords.map((kw: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-purple-800/40 text-purple-300">{kw}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center shrink-0">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-yellow-400">
                  {"\u20AC"}{battle.total_prize_pool.toFixed(2)}
                </p>
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Prize Pool</p>
            </div>
          </div>

          {!userIsParticipant && battle.status === 'waiting_for_participants' && (
            <Button
              onClick={handleJoinBattle}
              size="lg"
              className="relative z-10 w-full mt-6 bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-800 hover:to-purple-900 border border-red-700/40 shadow-lg"
            >
              <Swords className="mr-2 h-5 w-5" />
              Join Battle ({"\u20AC"}1.00 Entry Fee)
            </Button>
          )}
        </motion.div>

        {/* Live Audience Reactions */}
        <LiveReactions battleId={battleId!} />

        {/* AI Battle Predictor */}
        {participants.length >= 2 && (
          <BattlePredictorPanel battleId={battleId!} />
        )}

        {/* Participants header */}
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-foreground">Participants ({participants.length})</h2>
        </div>

        {sortedParticipants.length === 0 ? (
          <Card className="p-12 text-center border-red-900/20 bg-gradient-to-br from-card/50 to-red-950/10">
            <Skull className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-1">No participants yet</p>
            <p className="text-muted-foreground text-sm">Be the first to join this battle!</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="p-6 border-red-900/20 bg-gradient-to-br from-card/80 to-red-950/5 hover:border-red-700/30 transition-colors">
                  {/* Live Stream */}
                  {(participant.user_id === user?.id || participant.is_streaming) && (
                    <div className="mb-5">
                      <LiveStream
                        participantId={participant.id}
                        battleId={battleId!}
                        isStreamer={participant.user_id === user?.id}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {index === 0 && participants.length > 1 && (
                          <Badge className="bg-yellow-600/80 text-yellow-100 text-xs">Leading</Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-purple-800/40 text-purple-300">
                          Story {String.fromCharCode(65 + index)}
                        </Badge>
                        {participant.user_id === user?.id && (
                          <Badge className="bg-red-700/80 text-red-100 text-xs">Your Story</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{participant.story_title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-4 font-serif">
                        {participant.story_content}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-yellow-400">
                        {"\u20AC"}{participant.total_gifts_received.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Gifts</p>
                    </div>
                  </div>

                  {participant.user_id !== user?.id && (
                    <div className="border-t border-red-900/15 pt-4 mt-4">
                      <p className="text-xs font-semibold mb-3 text-red-200/60 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5" />
                        Send a Gift to Vote
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {GIFT_TYPES.map((gift) => (
                          <Button
                            key={gift.type}
                            variant="outline"
                            onClick={() => handleSendGift(participant.id, gift.type)}
                            className="flex-col h-auto py-4 border-red-900/20 hover:border-red-700/40 hover:bg-red-950/20 transition-colors"
                          >
                            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-purple-800 flex items-center justify-center text-white font-bold text-xs mb-2">
                              {gift.icon}
                            </span>
                            <span className="font-semibold text-sm">{gift.name}</span>
                            <span className="text-yellow-400 font-bold text-xs">{"\u20AC"}{gift.amount.toFixed(2)}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
