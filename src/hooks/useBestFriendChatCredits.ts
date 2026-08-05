import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const BEST_FRIEND_CHAT_COST = 1;

/**
 * Unified AI credits balance for Best Friend chat (1 credit per message).
 * Replaces the old €15/month subscription model.
 */
export function useBestFriendChatCredits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCredits(0);
        return;
      }
      const { data } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .maybeSingle();
      setCredits(data?.credits_remaining ?? 0);
    } catch (e) {
      console.error('Failed to load AI credits', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    credits,
    loading,
    canSendMessage: credits >= BEST_FRIEND_CHAT_COST,
    cost: BEST_FRIEND_CHAT_COST,
    refresh,
  };
}
