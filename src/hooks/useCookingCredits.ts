import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * AI Culinary Academy — credits only.
 *
 * Reads the unified `ai_credits` balance. There are no cooking subscriptions
 * or tiers: every tool is paid per use from the same credit pool, and top-ups
 * happen exclusively in the AI Credits Store.
 */
export const useCookingCredits = () => {
  const query = useQuery({
    queryKey: ['cooking-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { credits: 0 };
      }

      const { data, error } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return { credits: (data as any)?.credits_remaining ?? 0 };
    } });

  return query;
};
