import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBrainDuelOnlinePlayers = () => {
  const { data: onlineCount } = useQuery({
    queryKey: ['brain-duel-online-players'],
    queryFn: async () => {
      // Count active matches (players currently in game)
      const { count: activeMatchesCount } = await supabase
        .from('brain_duel_matches')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'waiting']);

      // Count recently active users (logged in within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: recentUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fiveMinutesAgo);

      // Estimate online players (active matches count × 2 + recent users / 3)
      const activePlayersInMatches = (activeMatchesCount || 0) * 2;
      const browsingUsers = Math.floor((recentUsersCount || 0) / 3);
      
      return Math.max(activePlayersInMatches + browsingUsers, 1);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    onlineCount: onlineCount || 0,
  };
};
