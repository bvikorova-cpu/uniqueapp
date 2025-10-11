import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AICredits {
  credits_remaining: number;
  total_credits_purchased: number;
  last_used_at: string | null;
}

export const useAICredits = () => {
  const [credits, setCredits] = useState<AICredits>({
    credits_remaining: 0,
    total_credits_purchased: 0,
    last_used_at: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
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
        // Create initial record
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
  };

  const useCredit = async (type: 'image_generation' | 'avatar' | 'effect' | 'course', description?: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user has credits
      if (credits.credits_remaining <= 0) {
        return false;
      }

      // Deduct credit
      const { error: updateError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining - 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log usage
      await supabase
        .from('ai_usage_history')
        .insert({
          user_id: user.id,
          usage_type: type,
          credits_used: 1,
          description,
        });

      // Update local state
      setCredits(prev => ({
        ...prev,
        credits_remaining: prev.credits_remaining - 1,
        last_used_at: new Date().toISOString(),
      }));

      return true;
    } catch (error) {
      console.error('Use credit error:', error);
      return false;
    }
  };

  const purchaseCredits = async (amount: number, price: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // TODO: Integrate with Tatra Banka payment gateway
      
      // Update credits after successful payment
      const { error: updateError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining + amount,
          total_credits_purchased: credits.total_credits_purchased + amount,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'subscription',
          amount: price,
          commission_rate: 0,
          commission_amount: price,
          status: 'completed',
        });

      // Update local state
      setCredits(prev => ({
        ...prev,
        credits_remaining: prev.credits_remaining + amount,
        total_credits_purchased: prev.total_credits_purchased + amount,
      }));

      return true;
    } catch (error) {
      console.error('Purchase credits error:', error);
      return false;
    }
  };

  return {
    credits,
    loading,
    useCredit,
    purchaseCredits,
    refresh: loadCredits,
  };
};