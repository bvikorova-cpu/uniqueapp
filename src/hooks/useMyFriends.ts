import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MyFriend {
  id: string;
  full_name: string | null;
  username?: string | null;
  avatar_url: string | null;
}

/**
 * Single shared source of truth for the signed-in user's friend list.
 * All consumers share ONE cached request (React Query dedupes by key), so the
 * Wall no longer fires the same RPC three times per page load.
 */
export const useMyFriends = (userId: string | null | undefined) => {
  return useQuery({
    queryKey: ["my-friends", userId],
    queryFn: async (): Promise<MyFriend[]> => {
      if (!userId) return [];
      const { data, error } = await (supabase as any).rpc("get_my_friends");
      if (error) throw error;
      const seen = new Set<string>();
      return ((data as MyFriend[]) ?? []).filter((p) => {
        if (!p?.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });
};
