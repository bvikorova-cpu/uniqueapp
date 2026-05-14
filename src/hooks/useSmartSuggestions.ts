import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Smart suggestions for users to follow / topics to explore.
 * Mixes: friends-of-friends, trending creators, hashtags from your interests.
 */
export const useSmartSuggestions = (limit = 8) => {
  const { data: suggestedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["smart-suggested-users", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friends } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      const friendIds = (friends || []).map((f: any) => f.friend_id);

      // Friends-of-friends
      let candidates: string[] = [];
      if (friendIds.length > 0) {
        const { data: fof } = await supabase
          .from("friendships")
          .select("friend_id")
          .in("user_id", friendIds)
          .eq("status", "accepted")
          .limit(50);
        candidates = (fof || [])
          .map((f: any) => f.friend_id)
          .filter((id: string) => id !== user.id && !friendIds.includes(id));
      }

      // Fallback: most active recent posters
      if (candidates.length < limit) {
        const since = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: recent } = await supabase
          .from("posts")
          .select("user_id")
          .gte("created_at", since)
          .limit(100);
        const counts: Record<string, number> = {};
        (recent || []).forEach((p: any) => {
          if (p.user_id !== user.id && !friendIds.includes(p.user_id)) {
            counts[p.user_id] = (counts[p.user_id] || 0) + 1;
          }
        });
        const top = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .map(([id]) => id);
        candidates = [...new Set([...candidates, ...top])];
      }

      const ids = candidates.slice(0, limit);
      if (ids.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio")
        .in("id", ids);

      return profiles || [];
    },
  });

  const { data: suggestedHashtags = [], isLoading: loadingTags } = useQuery({
    queryKey: ["smart-suggested-hashtags", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hashtags")
        .select("*")
        .order("use_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });

  return {
    suggestedUsers,
    suggestedHashtags,
    isLoading: loadingUsers || loadingTags,
  };
};
