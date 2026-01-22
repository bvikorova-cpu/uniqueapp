import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle } from 'lucide-react';

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

    if (!user || !battleId) {
      toast.error('Authentication required');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!paymentVerified) {
      toast.error('Payment verification required before submitting');
      return;
    }

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
      <SubscriptionGate>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SubscriptionGate>
    );
  }

  const timeRemaining = battle.ends_at ? 
    Math.max(0, Math.floor((new Date(battle.ends_at).getTime() - Date.now()) / 1000 / 60)) : 60;

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-4xl">
        {paymentVerified && (
          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="font-semibold">Payment verified! You can now submit your story.</p>
            </div>
          </Card>
        )}

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Submit Your Battle Story</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <p>{timeRemaining} minutes remaining</p>
            </div>
          </div>

          <Card className="p-4 mb-6 bg-primary/5">
            <h3 className="font-bold mb-2">Challenge: {battle.challenge_theme}</h3>
            <p className="text-sm text-muted-foreground mb-3">{battle.challenge_prompt}</p>
            {battle.challenge_keywords && battle.challenge_keywords.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Required Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {battle.challenge_keywords.map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 rounded text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Story Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your story title..."
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Your Story</label>
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your horror story based on the challenge..."
                rows={15}
                disabled={submitting}
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                Make sure to include all required keywords in your story!
              </p>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={submitting || !paymentVerified}
            >
              {submitting ? 'Submitting...' : 'Submit Story'}
            </Button>
          </form>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
