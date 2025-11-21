import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { useShadowSubscription } from '@/hooks/useShadowSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionGateProps {
  children: ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { subscribed, loading } = useShadowSubscription();

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-shadow-subscription');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="container mx-auto p-6 pt-24 max-w-5xl">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-black to-red-900/10 blur-3xl -z-10 animate-pulse"></div>
        <Card className="p-10 text-center bg-gradient-to-br from-black via-red-950/40 to-black border-red-900/50 shadow-[0_0_50px_rgba(139,0,0,0.4)] relative overflow-hidden">
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          
          <Lock className="h-24 w-24 mx-auto mb-6 text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] relative z-10" />
          <h2 className="text-4xl font-bold mb-4 text-red-400 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)] relative z-10">
            👻 Shadow Arena Hub Access Required
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto relative z-10">
            Enter the darkest corner of storytelling. Unlock live horror battles, AI-enhanced tales, 
            and compete for real cash prizes in our terrifying arena.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left relative z-10">
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-6 w-6 text-red-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-red-300 mb-1">📚 Story Archive</p>
                <p className="text-sm text-gray-200">Access all AI-enhanced horror stories with atmospheric illustrations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-6 w-6 text-purple-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-purple-300 mb-1">📹 Live Battle Viewing</p>
                <p className="text-sm text-gray-200">Watch creators perform horror stories LIVE in real-time battles</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-6 w-6 text-red-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-red-300 mb-1">🎁 Voting Rights</p>
                <p className="text-sm text-gray-200">Send digital gifts during streams to vote for your favorites</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-6 w-6 text-purple-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-purple-300 mb-1">✍️ Story Submission</p>
                <p className="text-sm text-gray-200">Submit your stories & compete in €1 entry battles for cash prizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-6 w-6 text-red-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-red-300 mb-1">💰 Prize Pool Access</p>
                <p className="text-sm text-gray-200">Win 80% of battle entry fees - top 3 performers get paid</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-6 w-6 text-purple-400 mt-1 animate-pulse" />
              <div>
                <p className="font-bold text-purple-300 mb-1">🤖 AI Enhancements</p>
                <p className="text-sm text-gray-200">Every story gets 3 AI-generated horror illustrations automatically</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-950/70 to-black/70 p-8 rounded-lg mb-8 border border-red-900/50 shadow-[0_0_30px_rgba(139,0,0,0.3)] relative z-10">
            <p className="text-4xl font-bold mb-3 text-red-400 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">€2.00 / month</p>
            <p className="text-sm text-gray-200 mb-4">Cancel anytime - No long-term commitment</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-300">
              <span>✓ Instant access</span>
              <span>✓ Stripe secure payment</span>
              <span>✓ Cancel online anytime</span>
            </div>
          </div>

          <Button 
            onClick={handleSubscribe}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-xl py-7 px-12 shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] border border-red-500/50 transition-all relative z-10"
          >
            <Lock className="mr-2 h-6 w-6" />
            Unlock Shadow Arena Now
          </Button>
          
          <p className="text-xs text-gray-300 mt-6 relative z-10">
            Join hundreds of horror creators earning real money from their stories
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
