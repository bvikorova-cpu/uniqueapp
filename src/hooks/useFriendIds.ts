import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single shared source for "ids of my accepted friends".
 *
 * Many Wall surfaces (feed tabs, stories bar, birthdays, tag dialog, messages,
 * suggestions) used to run their own `friendships?or=(...)` query on the same
 * page load. React Query dedupes by key, so they now share ONE cached request.
 */
export const FRIEND_IDS_KEY = "friend-ids";

export function useFriendIds(userId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: [FRIEND_IDS_KEY, userId],
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<string[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("friendships")
        .select("user_id,friend_id")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      if (error) return [];
      return (data ?? [])
        .map((r) => (r.user_id === userId ? r.friend_id : r.user_id))
        .filter(Boolean) as string[];
    } });
}
