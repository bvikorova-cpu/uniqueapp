import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCookingCredits = () => {
  return useQuery({
    queryKey: ['cooking-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { credits: 0, subscription_tier: 'basic' };
      }

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRole) {
        return { credits: 999999, subscription_tier: 'premium' };
      }

      const { data, error } = await supabase
        .from('cooking_credits')
        .select('credits, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data || { credits: 0, subscription_tier: 'basic' };
    },
  });
};
