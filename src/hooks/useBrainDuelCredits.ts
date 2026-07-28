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
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.credits_remaining ?? 0;
    } });

  const spendCredits = useMutation({
    mutationFn: async (amount: number) => {
      // SECURITY: client-side sanity check; RPC re-validates atomically.
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('invalid_amount');

      // Atomic decrement with row lock (race-condition safe).
      // RPC throws 'insufficient_credits' / 'not_authenticated' / 'invalid_amount'.
      const { data, error } = await supabase.rpc('brain_duel_spend_credits', { _amount: Math.floor(amount) });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
    },
    onError: (error: any) => { const msg = (error?.message || '').toString();
      toast({
        title: 'Error',
        description: msg.includes('insufficient_credits')
          ? 'Not enough credits to start this game'
          : 'Failed to spend credits',
        variant: 'destructive' });
    } });

  // Brain Duel displays the unified ai_credits balance. Awards happen server-side
  // through add_ai_credits so every change is recorded in ai_credits_ledger.

  return { credits: credits || 0,
    isLoading,
    spendCredits: spendCredits.mutate,
    spendCreditsAsync: spendCredits.mutateAsync,
    isSpending: spendCredits.isPending };
};
