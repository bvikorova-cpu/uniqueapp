import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, ArrowLeft, Swords, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GothicPageHeader } from '@/components/shadow-arena/GothicPageHeader';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function ShadowArenaBattleSubmit() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [battle, setBattle] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (battleId && sessionId) {
      verifyPaymentAndFetch();
    } else if (battleId) {
      fetchBattle();
    }
  }, [battleId, sessionId]);

  const verifyPaymentAndFetch = async () => {
    try {
      if (!sessionId || !battleId) return;
      const { data, error } = await supabase.functions.invoke('verify-shadow-battle-payment', {
        body: { sessionId, battleId },
      });
      if (error) throw error;
      if (!data?.verified) {
        setPaymentVerified(false);
        toast.error('Payment not verified yet. Please complete checkout first.');
        navigate(`/shadow-arena/battle/${battleId}`);
        return;
      }
      setPaymentVerified(true);
      fetchBattle();
    } catch (err) {
      console.error('Verify payment error:', err);
      setPaymentVerified(false);
      toast.error('Failed to verify payment');
      navigate(`/shadow-arena/battle/${battleId}`);
    }
  };

  const fetchBattle = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_battles')
        .select('*')
        .eq('id', battleId)
        .single();
      if (error) throw error;
      setBattle(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load battle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !battleId) { toast.error('Authentication required'); return; }
    if (!title.trim() || !content.trim()) { toast.error('Please fill in all fields'); return; }
    if (!paymentVerified) { toast.error('Payment verification required before submitting'); return; }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('shadow_battle_participants')
        .insert({
          battle_id: battleId,
          user_id: user.id,
          story_title: title,
          story_content: content,
          entry_fee_paid: true
        });
      if (error) throw error;
      toast.success('Story submitted successfully!');
      navigate(`/shadow-arena/battle/${battleId}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  if (!battle) {
    return (
      <><FloatingHowItWorks title="ShadowArenaBattleSubmit — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaBattleSubmit from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<SubscriptionGate>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </SubscriptionGate>
    );
  }

  const timeRemaining = battle.ends_at
    ? Math.max(0, Math.floor((new Date(battle.ends_at).getTime() - Date.now()) / 1000 / 60))
    : 60;

  const charCount = content.length;

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/shadow-arena/battle/${battleId}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Battle
        </Button>

        {/* Payment verified banner */}
        {paymentVerified && (
          <motion.div
            className="mb-6 rounded-xl border border-green-800/30 bg-green-950/20 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <p className="font-semibold text-sm">Payment verified! You can now submit your story.</p>
            </div>
          </motion.div>
        )}

        {/* Cinematic gothic hero */}
        <GothicPageHeader
          icon={Swords}
          title="Submit Your Battle Story"
          subtitle="Channel terror into words. Your tale could win the cash pool."
        >
          <span className="inline-flex items-center gap-2 text-sm text-red-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-900/40">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{timeRemaining} minutes remaining</span>
          </span>
        </GothicPageHeader>

        {/* Challenge card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 mb-6 border-purple-900/20 bg-purple-950/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-sm text-purple-300">Challenge: {battle.challenge_theme}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{battle.challenge_prompt}</p>
            {battle.challenge_keywords && battle.challenge_keywords.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 text-red-200/60">Required Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {battle.challenge_keywords.map((kw: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-purple-800/40 text-purple-300">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border-red-900/20 bg-gradient-to-b from-card/80 to-card/40">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium mb-2 text-red-200/80">Story Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  disabled={submitting}
                  required
                  className="bg-background/50 border-red-900/20 focus:border-red-700/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-red-200/80">Your Story</label>
                  <span className="text-xs text-muted-foreground">{charCount} characters</span>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your horror story based on the challenge..."
                  rows={16}
                  disabled={submitting}
                  required
                  className="bg-background/50 border-red-900/20 focus:border-red-700/50 font-serif"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure to include all required keywords in your story!
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-800 hover:to-purple-900 border border-red-700/40 shadow-lg"
                disabled={submitting || !paymentVerified || !title.trim() || !content.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Story'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </SubscriptionGate>
  </>
  );
}
