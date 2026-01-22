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
        window.location.href = data.url;
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
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-24 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-black to-red-900/10 blur-3xl -z-10 animate-pulse"></div>
        <Card className="p-4 sm:p-10 text-center bg-gradient-to-br from-black via-red-950/40 to-black border-red-900/50 shadow-[0_0_50px_rgba(139,0,0,0.4)] relative overflow-hidden">
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          
          <Lock className="h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-4 sm:mb-6 text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] relative z-10" />
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-red-400 drop-shadow-[0_0_10px_rgba(220,38,38,0.6)] relative z-10">
            👻 Shadow Arena Hub Access Required
          </h2>
          <p className="text-sm sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto relative z-10">
            Enter the darkest corner of storytelling. Unlock live horror battles, AI-enhanced tales, 
            and compete for real cash prizes in our terrifying arena.
          </p>

          {/* Detailed Description Section */}
          <div className="bg-gradient-to-r from-black/60 to-red-950/30 p-4 sm:p-6 rounded-lg mb-6 border border-red-900/30 text-left relative z-10">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-red-400 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              What is Shadow Arena?
            </h3>
            <p className="text-sm text-gray-200 mb-4">
              Shadow Arena is the ultimate live horror storytelling battle platform where creators compete for real cash prizes. 
              Submit your spine-chilling tales, enhanced automatically with AI-generated atmospheric illustrations, then go LIVE 
              and perform your story to a terrified audience. Viewers vote by sending digital gifts — the more gifts you receive, 
              the higher your ranking. Top 3 performers split 80% of the prize pool!
            </p>
            
            <h4 className="text-md font-semibold mb-2 text-red-300">How to Use Shadow Arena:</h4>
            <ol className="text-sm text-gray-200 space-y-1.5 list-decimal list-inside mb-4">
              <li><strong>Subscribe</strong> for €2/month to unlock full platform access</li>
              <li><strong>Write & Submit</strong> your horror story — AI generates 3 atmospheric illustrations</li>
              <li><strong>Pay €1 Entry</strong> to join a monthly battle competition</li>
              <li><strong>Go LIVE</strong> and perform your story via video stream</li>
              <li><strong>Collect Gifts</strong> from viewers — each gift counts as a weighted vote</li>
              <li><strong>Win Prizes</strong> — Top 3 split 80% of total entry fees via Stripe payout</li>
            </ol>
            
            <p className="text-xs text-gray-400 border-t border-red-900/30 pt-3">
              💡 <strong>Tip:</strong> Build your audience over multiple battles. Archived streams continue earning gift revenue even after the competition ends!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left relative z-10">
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300 mb-1 text-sm sm:text-base">📚 Story Archive</p>
                <p className="text-xs sm:text-sm text-gray-200">Access all AI-enhanced horror stories with atmospheric illustrations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-300 mb-1 text-sm sm:text-base">📹 Live Battle Viewing</p>
                <p className="text-xs sm:text-sm text-gray-200">Watch creators perform horror stories LIVE in real-time battles</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300 mb-1 text-sm sm:text-base">🎁 Voting Rights</p>
                <p className="text-xs sm:text-sm text-gray-200">Send digital gifts during streams to vote for your favorites</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-300 mb-1 text-sm sm:text-base">✍️ Story Submission</p>
                <p className="text-xs sm:text-sm text-gray-200">Submit your stories & compete in €1 entry battles for cash prizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-red-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-red-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300 mb-1 text-sm sm:text-base">💰 Prize Pool Access</p>
                <p className="text-xs sm:text-sm text-gray-200">Win 80% of battle entry fees - top 3 performers get paid</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-purple-950/50 to-black/50 p-3 sm:p-4 rounded-lg border border-purple-900/30">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mt-1 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-300 mb-1 text-sm sm:text-base">🤖 AI Enhancements</p>
                <p className="text-xs sm:text-sm text-gray-200">Every story gets 3 AI-generated horror illustrations automatically</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-950/70 to-black/70 p-6 sm:p-8 rounded-lg mb-6 sm:mb-8 border border-red-900/50 shadow-[0_0_30px_rgba(139,0,0,0.3)] relative z-10">
            <p className="text-3xl sm:text-4xl font-bold mb-3 text-red-400 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">€2.00 / month</p>
            <p className="text-xs sm:text-sm text-gray-200 mb-4">Cancel anytime - No long-term commitment</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-300">
              <span>✓ Instant access</span>
              <span>✓ Stripe secure payment</span>
              <span>✓ Cancel online anytime</span>
            </div>

            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-lg sm:text-xl py-6 sm:py-7 px-8 sm:px-12 shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] border border-red-500/50 transition-all"
            >
              <Lock className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Unlock Shadow Arena Now
            </Button>
          </div>
          
          <p className="text-xs text-gray-300 relative z-10">
            Join hundreds of horror creators earning real money from their stories
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
