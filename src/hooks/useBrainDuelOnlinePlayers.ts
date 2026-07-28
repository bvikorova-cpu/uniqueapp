import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Real online count: distinct users currently in an active/waiting match
 * + distinct users with profile activity in the last 5 minutes.
 * No estimates, no multipliers — deduplicated real user ids.
 */
export const useBrainDuelOnlinePlayers = () => {
  const { data: onlineCount } = useQuery({
    queryKey: ['brain-duel-online-players'],
    staleTime: 10_000,
    refetchInterval: 15_000,
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const [matchesRes, recentRes] = await Promise.all([
        supabase
          .from('brain_duel_matches')
          .select('player1_id, player2_id')
          .in('status', ['active', 'waiting'])
          .limit(500),
        supabase
          .from('profiles')
          .select('id')
          .gte('updated_at', fiveMinutesAgo)
          .limit(500),
      ]);

      const ids = new Set<string>();
      (matchesRes.data ?? []).forEach((m: any) => {
        if (m.player1_id) ids.add(m.player1_id);
        if (m.player2_id) ids.add(m.player2_id);
      });
      (recentRes.data ?? []).forEach((p: any) => {
        if (p.id) ids.add(p.id);
      });

      return ids.size;
    },
  });

  return { onlineCount: onlineCount ?? 0 };
};
