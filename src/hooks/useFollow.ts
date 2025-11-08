import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useIsFollowing = (userId: string | undefined, targetUserId: string | undefined) => {
  return useQuery({
    queryKey: ["is-following", userId, targetUserId],
    queryFn: async () => {
      if (!userId || !targetUserId) return false;

      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!targetUserId,
  });
};

export const useFollowCounts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };

      const [followersRes, followingRes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", userId),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", userId),
      ]);

      return {
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
      };
    },
    enabled: !!userId,
  });
};

export const useFollowMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: followerId, following_id: followingId });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", variables.followingId] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", variables.followerId] });
      toast({
        title: "Success",
        description: "You are now following this user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    },
  });
};

export const useUnfollowMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", variables.followingId] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", variables.followerId] });
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    },
  });
};

export const useFollowingPosts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["following-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get list of users the current user is following
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      const followingIds = followingData?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) return [];

      // Get posts from followed users
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Fetch profiles for posts
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", post.user_id)
            .single();

          return {
            ...post,
            profiles: profile || { id: post.user_id, full_name: null, avatar_url: null },
          };
        })
      );

      return postsWithProfiles;
    },
    enabled: !!userId,
  });
};
