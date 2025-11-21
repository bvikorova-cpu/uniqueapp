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
      <div className="container mx-auto p-6 pt-24 max-w-4xl">
        <Card className="p-8 text-center bg-gradient-to-br from-purple-900/20 via-background to-fuchsia-900/20 border-purple-500/20">
          <Lock className="h-20 w-20 mx-auto mb-6 text-purple-400" />
          <h2 className="text-3xl font-bold mb-6">🎭 Shadow Arena Hub Access Required</h2>
          <p className="text-muted-foreground mb-6 text-lg">
            Subscribe to unlock full access to Shadow Arena features:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Story Archive</p>
                <p className="text-sm text-muted-foreground">Access all horror stories</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Battle Viewing</p>
                <p className="text-sm text-muted-foreground">Watch creator battles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Voting Rights</p>
                <p className="text-sm text-muted-foreground">Vote with gifts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Story Submission</p>
                <p className="text-sm text-muted-foreground">Submit your stories</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 p-6 rounded-lg mb-6">
            <p className="text-2xl font-bold mb-2">€2.00 / month</p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
          </div>

          <Button 
            onClick={handleSubscribe}
            size="lg"
            className="w-full md:w-auto"
          >
            Subscribe Now
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
