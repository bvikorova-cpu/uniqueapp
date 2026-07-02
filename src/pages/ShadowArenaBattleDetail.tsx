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
import { GothicPageHeader } from '@/components/shadow-arena/GothicPageHeader';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
      <FloatingHowItWorks title="ShadowArenaBattleDetail — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaBattleDetail from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shadow-arena/battles')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Battles
        </Button>

        {/* Cinematic gothic battle hero */}
        <GothicPageHeader
          icon={Swords}
          title={battle.challenge_theme}
          subtitle={battle.challenge_prompt}
          height="h-[360px] md:h-[420px]"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
            {battle.ends_at && battle.status !== "completed" && (
              <span className="flex items-center gap-1 text-xs text-red-200/80 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-red-900/40">
                <Clock className="w-3 h-3" />
                <BattleCountdown endsAt={battle.ends_at} />
              </span>
            )}
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-800/40">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-sm font-black text-yellow-400">€{battle.total_prize_pool.toFixed(2)}</span>
            </div>
          </div>
          {battle.challenge_keywords && battle.challenge_keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {battle.challenge_keywords.map((kw: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] border-purple-800/40 text-purple-200 bg-black/40 backdrop-blur-md">{kw}</Badge>
              ))}
            </div>
          )}
          {!userIsParticipant && battle.status === 'waiting_for_participants' && (
            <Button
              onClick={handleJoinBattle}
              size="lg"
              className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40 shadow-[0_0_25px_-5px_rgba(220,38,38,0.7)]"
            >
              <Swords className="mr-2 h-5 w-5" />
              Join Battle (€1.00 Entry Fee)
            </Button>
          )}
        </GothicPageHeader>

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
