import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBrainDuelCredits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ['brain-duel-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brain_duel_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Initialize credits if they don't exist
      if (!data) {
        const { data: newCredits, error: insertError } = await supabase
          .from('brain_duel_credits')
          .insert({
            user_id: user.id,
            credits: 100, // Starting credits
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newCredits.credits;
      }

      return data.credits;
    },
  });

  const spendCredits = useMutation({
    mutationFn: async (amount: number) => {
      // SECURITY: client-side sanity check; RPC re-validates atomically.
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('invalid_amount');

      // Atomic decrement with row lock (race-condition safe).
      // RPC throws 'insufficient_credits' / 'not_authenticated' / 'invalid_amount'.
      const { data, error } = await supabase.rpc('brain_duel_spend_credits', {
        _amount: Math.floor(amount),
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
    },
    onError: (error: any) => {
      const msg = (error?.message || '').toString();
      toast({
        title: 'Error',
        description: msg.includes('insufficient_credits')
          ? 'Not enough credits to start this game'
          : 'Failed to spend credits',
        variant: 'destructive',
      });
    },
  });

  // NOTE: `earnCredits` was removed — client cannot increase balance (DB trigger blocks it).
  // Credit awards now happen exclusively server-side via brain-duel-router on verified events.

  return {
    credits: credits || 0,
    isLoading,
    spendCredits: spendCredits.mutate,
    isSpending: spendCredits.isPending,
  };
};
