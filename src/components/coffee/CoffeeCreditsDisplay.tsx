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

  const handleUpgrade = (tier: string) => {
    toast({
      title: 'Coming Soon',
      description: `${tier} subscription will be available soon!`
    });
  };

  if (!profile) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coffee className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Subscription</p>
            <p className="text-2xl font-bold capitalize">{profile.subscription_tier}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="text-2xl font-bold">{profile.total_points}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Matches Left</p>
            <p className="text-2xl font-bold">{profile.matches_remaining}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleUpgrade('Basic')} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              €4.99/mo
            </Button>
            <Button onClick={() => handleUpgrade('Premium')}>
              <Plus className="mr-2 h-4 w-4" />
              €9.99/mo
            </Button>
          </div>
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