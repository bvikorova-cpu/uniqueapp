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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentCredits = credits || 0;
      if (currentCredits < amount) {
        throw new Error('Insufficient credits');
      }

      const { error } = await supabase
        .from('brain_duel_credits')
        .update({ credits: currentCredits - amount })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message === 'Insufficient credits' 
          ? 'Not enough credits to start this game'
          : 'Failed to spend credits',
        variant: 'destructive',
      });
    },
  });

  const earnCredits = useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentCredits = credits || 0;

      const { error } = await supabase
        .from('brain_duel_credits')
        .update({ credits: currentCredits + amount })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
    },
  });

  return {
    credits: credits || 0,
    isLoading,
    spendCredits: spendCredits.mutate,
    earnCredits: earnCredits.mutate,
    isSpending: spendCredits.isPending,
  };
};
