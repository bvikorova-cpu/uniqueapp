import { Coffee, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CoffeeCreditsDisplay = () => {
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['coffee-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('coffee_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Create profile if it doesn't exist
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('coffee_profiles')
          .insert({
            user_id: user.id,
            subscription_tier: 'free',
            matches_remaining: 3
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newProfile;
      }
      
      return data;
    }
  });

  const handleUpgrade = async (tier: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: `coffee_${tier.toLowerCase()}`,
          mode: "subscription",
          successUrl: `${window.location.origin}/coffee-roulette?success=true`,
          cancelUrl: `${window.location.origin}/coffee-roulette?canceled=true`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else toast({ title: "Checkout not available", description: "Please try again later." });
    } catch {
      toast({ title: "Error", description: "Payment service unavailable. Please try again later.", variant: "destructive" });
    }
  };

  if (!profile) return null;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Subscription</p>
            <p className="text-lg sm:text-2xl font-bold capitalize">{profile.subscription_tier}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 sm:ml-auto">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Points</p>
            <p className="text-lg sm:text-2xl font-bold">{profile.total_points}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Matches Left</p>
            <p className="text-lg sm:text-2xl font-bold">{profile.matches_remaining}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => handleUpgrade('Basic')} variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            €4.99/mo
          </Button>
          <Button onClick={() => handleUpgrade('Premium')} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            €9.99/mo
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm">
          💡 Check-in: 5 points • Review: 10 points • Match: 3 points • Event: 15 points
        </p>
      </div>
    </Card>
  );
};