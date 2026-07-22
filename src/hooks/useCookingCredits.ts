import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeInvoke } from '@/utils/safeInvoke';

export const useCookingCredits = () => {
  const query = useQuery({
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
    } });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    const { data, error } = await safeInvoke('create-cooking-credits-payment', {
      body: { credits }
    });
    
    if (error) {
      toast.error("Error creating payment session");
      return null;
    }
    return data?.url || null;
  };

  return { ...query,
    purchaseCredits };
};
