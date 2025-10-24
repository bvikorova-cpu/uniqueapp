import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCookingCredits = () => {
  return useQuery({
    queryKey: ['cooking-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { credits: 0, subscription_tier: 'free' };
      }

      const { data, error } = await supabase
        .from('cooking_credits')
        .select('credits, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data || { credits: 0, subscription_tier: 'free' };
    },
  });
};
