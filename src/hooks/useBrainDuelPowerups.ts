import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBrainDuelPowerups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: powerups, isLoading } = useQuery({
    queryKey: ['brain-duel-powerups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('brain_duel_powerups')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const purchasePowerup = useMutation({
    mutationFn: async ({ type, price }: { type: string; price: number }) => {
      const { error } = await supabase.rpc('purchase_brain_duel_powerup', {
        p_powerup_type: type,
        p_price: price,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-powerups'] });
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      toast({
        title: 'Power-up purchased!',
        description: 'Your power-up has been added to your inventory',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Purchase failed',
        description: error.message === 'Insufficient credits'
          ? 'Not enough credits to buy this power-up'
          : 'Failed to purchase power-up',
        variant: 'destructive',
      });
    },
  });

  const usePowerupMutation = useMutation({
    mutationFn: async ({ powerupId, quantity }: { powerupId: string; quantity: number }) => {
      const { error } = await supabase
        .from('brain_duel_powerups')
        .update({ 
          quantity: quantity - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', powerupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-powerups'] });
    },
  });

  return {
    powerups: powerups || [],
    isLoading,
    purchasePowerup: purchasePowerup.mutate,
    isPurchasing: purchasePowerup.isPending,
    consumePowerup: usePowerupMutation.mutateAsync,
  };
};
