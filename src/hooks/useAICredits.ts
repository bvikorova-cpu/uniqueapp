import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFreeTierCredits } from '@/hooks/useFreeTierCredits';

export interface AICredits {
  credits_remaining: number;
  total_credits_purchased: number;
  last_used_at: string | null;
}

export type SpendType =
  | 'image_generation'
  | 'avatar'
  | 'effect'
  | 'course'
  | 'custom_generation';

export type SpendSource = 'free' | 'paid';

export interface SpendResult {
  success: boolean;
  source?: SpendSource;
}

/**
 * Unified credits hook.
 * Exposes BOTH balances separately (free monthly vs. paid AI) and
 * spends free tier FIRST, paid second. UI must never mix the two visually.
 */
export const useAICredits = () => {
  const [credits, setCredits] = useState<AICredits>({
    credits_remaining: 0,
    total_credits_purchased: 0,
    last_used_at: null,
  });
  const [loading, setLoading] = useState(true);

  const { data: freeData, refresh: refreshFree, consume: consumeFree } = useFreeTierCredits();
  const freeBalance = freeData?.balance ?? 0;
  const paidBalance = credits.credits_remaining;
  const totalBalance = freeBalance + paidBalance;

  const loadCredits = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('ai_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCredits(data);
      } else {
        const { data: newCredits, error: insertError } = await supabase
          .from('ai_credits')
          .insert({
            user_id: user.id,
            credits_remaining: 0,
            total_credits_purchased: 0,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        if (newCredits) setCredits(newCredits);
      }
    } catch (error) {
      console.error('Load credits error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  /**
   * Spend 1 credit. Free tier first, paid AI fallback.
   * Returns boolean for backwards compat; use spendCreditDetailed for source info.
   */
  const spendCredit = async (type: SpendType, description?: string): Promise<boolean> => {
    const res = await spendCreditDetailed(type, description);
    return res.success;
  };

  const spendCreditDetailed = async (
    type: SpendType,
    description?: string
  ): Promise<SpendResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      // 1) Try FREE tier first
      if (freeBalance > 0) {
        const ok = await consumeFree(1, `ai:${type}`);
        if (ok) {
          await supabase.from('ai_usage_history').insert({
            user_id: user.id,
            usage_type: type,
            credits_used: 1,
            description: description ? `[free] ${description}` : '[free]',
          });
          return { success: true, source: 'free' };
        }
      }

      // 2) Fall back to PAID AI credits
      if (paidBalance <= 0) return { success: false };

      const { error: updateError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: paidBalance - 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: type,
        credits_used: 1,
        description: description ? `[paid] ${description}` : '[paid]',
      });

      setCredits((prev) => ({
        ...prev,
        credits_remaining: prev.credits_remaining - 1,
        last_used_at: new Date().toISOString(),
      }));

      return { success: true, source: 'paid' };
    } catch (error) {
      console.error('Use credit error:', error);
      return { success: false };
    }
  };

  const purchaseCredits = async (amount: number, price: number): Promise<string | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Please log in to purchase credits');

      const { data, error } = await supabase.functions.invoke('create-credits-payment', {
        body: { credits: amount, price },
      });
      if (error) throw new Error(error.message || 'Failed to create payment session');
      if (data?.url) return data.url;
      throw new Error('Failed to retrieve payment link');
    } catch (error) {
      console.error('Purchase credits error:', error);
      throw error;
    }
  };

  const refresh = useCallback(async () => {
    await Promise.all([loadCredits(), refreshFree()]);
  }, [loadCredits, refreshFree]);

  return {
    // Legacy shape (paid only) kept for backwards compat
    credits,
    loading,
    spendCredit,
    purchaseCredits,
    refresh,
    // New explicit fields — UI should use these to avoid mixing buckets
    freeBalance,
    paidBalance,
    totalBalance,
    spendCreditDetailed,
  };
};
