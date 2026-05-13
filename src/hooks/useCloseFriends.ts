import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCloseFriends = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["close-friends"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_close_friends")
        .select("id, friend_id, created_at, profiles:friend_id(id, full_name, avatar_url)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async (friendId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_close_friends")
        .insert({ user_id: user.id, friend_id: friendId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["close-friends"] });
      toast({ title: "Added to close friends" });
    },
  });

  const remove = useMutation({
    mutationFn: async (friendId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_close_friends")
        .delete()
        .eq("user_id", user.id)
        .eq("friend_id", friendId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["close-friends"] });
      toast({ title: "Removed from close friends" });
    },
  });

  return { friends, isLoading, addFriend: add.mutate, removeFriend: remove.mutate };
};
