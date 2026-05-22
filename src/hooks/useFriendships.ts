import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface FriendProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username?: string | null;
}

export interface FriendSuggestion extends FriendProfile {
  mutual_count: number;
}

const KEY = ["friendships"] as const;

export function useFriendships(userId: string | undefined) {
  const qc = useQueryClient();

  // ---- Accepted friends
  const friends = useQuery({
    queryKey: [...KEY, "accepted", userId],
    enabled: !!userId,
    queryFn: async (): Promise<FriendProfile[]> => {
      const { data, error } = await supabase
        .from("friendships")
        .select("user_id,friend_id,status")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      if (error) throw error;
      const ids = (data ?? [])
        .map((r) => (r.user_id === userId ? r.friend_id : r.user_id))
        .filter(Boolean);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, username")
        .in("id", ids);
      return (profs ?? []) as FriendProfile[];
    },
  });

  // ---- Incoming pending requests (someone sent ME)
  const incoming = useQuery({
    queryKey: [...KEY, "incoming", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("id, user_id, created_at")
        .eq("friend_id", userId!)
        .eq("status", "pending");
      if (error) throw error;
      const ids = (data ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as (Friendship & { profile: FriendProfile })[];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, username")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (data ?? []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        friend_id: userId!,
        status: "pending" as const,
        created_at: r.created_at,
        profile: map.get(r.user_id) as FriendProfile,
      }));
    },
  });

  // ---- Outgoing pending requests
  const outgoing = useQuery({
    queryKey: [...KEY, "outgoing", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("id, friend_id, created_at")
        .eq("user_id", userId!)
        .eq("status", "pending");
      if (error) throw error;
      return data ?? [];
    },
  });

  // ---- People you may know (mutual-friend RPC)
  const suggestions = useQuery({
    queryKey: [...KEY, "suggestions", userId],
    enabled: !!userId,
    queryFn: async (): Promise<FriendSuggestion[]> => {
      const { data, error } = await supabase.rpc("suggest_friends", {
        _user_id: userId!,
        _limit: 8,
      });
      if (error) throw error;
      const ids = (data ?? []).map((r: any) => r.suggested_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, username")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (data ?? [])
        .map((r: any) => {
          const p = map.get(r.suggested_id);
          return p
            ? { ...(p as FriendProfile), mutual_count: Number(r.mutual_count) }
            : null;
        })
        .filter(Boolean) as FriendSuggestion[];
    },
    staleTime: 60_000,
  });

  // ---- Mutations
  const sendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      if (!userId) throw new Error("Not authenticated");
      if (friendId === userId) throw new Error("You can't add yourself");

      // Check if a friendship already exists in either direction
      const { data: existing } = await supabase
        .from("friendships")
        .select("id, status, user_id, friend_id")
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
        )
        .maybeSingle();

      if (existing) {
        if (existing.status === "accepted") {
          throw new Error("You are already friends");
        }
        if (existing.status === "pending") {
          // If they sent us a request, accept it instead
          if (existing.friend_id === userId) {
            const { error } = await supabase
              .from("friendships")
              .update({ status: "accepted" })
              .eq("id", existing.id);
            if (error) throw error;
            return { accepted: true };
          }
          throw new Error("Friend request already sent");
        }
        throw new Error("Cannot send request");
      }

      const { error } = await supabase
        .from("friendships")
        .insert({ user_id: userId, friend_id: friendId, status: "pending" });
      if (error) throw error;
      return { accepted: false };
    },
    onSuccess: (res: any) => {
      toast.success(res?.accepted ? "Friend request accepted" : "Friend request sent");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to send request"),
  });

  const accept = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend request accepted");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const cancelRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId)
        .eq("user_id", userId!)
        .eq("status", "pending");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend request cancelled");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to cancel request"),
  });

  const reject = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request dismissed");
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const removeFriend = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend removed");
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  return {
    friends,
    incoming,
    outgoing,
    suggestions,
    sendRequest,
    accept,
    reject,
    cancelRequest,
    removeFriend,
  };
}
