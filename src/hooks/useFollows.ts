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
        .select("*")
        .eq("follower_id", user.id);

      if (error) throw error;
      const ids = (data || []).map((f: any) => f.following_id);
      if (ids.length === 0) return data || [];
      const { data: profs } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url, username, headline, is_verified")
        .in("id", ids);
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      return (data || []).map((f: any) => ({ ...f, profiles: map.get(f.following_id) || null }));
    },
  });

  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("following_id", user.id);

      if (error) throw error;
      const ids = (data || []).map((f: any) => f.follower_id);
      if (ids.length === 0) return data || [];
      const { data: profs } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url, username, headline, is_verified")
        .in("id", ids);
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      return (data || []).map((f: any) => ({ ...f, profiles: map.get(f.follower_id) || null }));
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
        // Scale guard: 60 follow actions / min (block spam-follow bots)
        const { rateLimit } = await import("@/lib/scaleGuards");
        const ok = await rateLimit("follow.create", 60, 60);
        if (!ok) throw new Error("Too many follow actions. Slow down.");

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
