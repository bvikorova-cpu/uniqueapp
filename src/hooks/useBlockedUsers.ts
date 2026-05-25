import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBlockedUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("blocked_users")
        .select("blocked_user_id")
        .eq("user_id", user.id);

      if (error) throw error;
      const ids = (data || []).map((b: any) => b.blocked_user_id);
      if (ids.length === 0) return [];
      const { data: profiles } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url, username")
        .in("id", ids);
      const map = new Map((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((b: any) => ({ ...b, profiles: map.get(b.blocked_user_id) || null }));
    },
  });

  const isBlocked = (userId: string) => {
    return blockedUsers?.some((b) => b.blocked_user_id === userId) || false;
  };

  const blockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("blocked_users").insert({
        user_id: user.id,
        blocked_user_id: blockedUserId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      toast({ title: "User blocked" });
    },
  });

  const unblockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("user_id", user.id)
        .eq("blocked_user_id", blockedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      toast({ title: "User unblocked" });
    },
  });

  return {
    blockedUsers: blockedUsers || [],
    isLoading,
    isBlocked,
    blockUser: blockUser.mutate,
    unblockUser: unblockUser.mutate,
  };
};
