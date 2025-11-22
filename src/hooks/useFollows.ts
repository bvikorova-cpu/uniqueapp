import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFollows = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("*, profiles!follows_following_id_fkey(*)")
        .eq("follower_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("*, profiles!follows_follower_id_fkey(*)")
        .eq("following_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const isFollowing = (userId: string) => {
    return following?.some((f) => f.following_id === userId) || false;
  };

  const toggleFollow = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = following?.find((f) => f.following_id === userId);

      if (existing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "unfollowed" };
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });
        if (error) throw error;
        return { action: "followed" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      toast({
        title: data.action === "followed" ? "Following!" : "Unfollowed",
      });
    },
  });

  return {
    following: following || [],
    followers: followers || [],
    isLoadingFollowing,
    isLoadingFollowers,
    isFollowing,
    toggleFollow: toggleFollow.mutate,
  };
};
