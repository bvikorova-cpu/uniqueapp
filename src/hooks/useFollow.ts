import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFollowStatus = (userId: string, currentUserId?: string) => {
  return useQuery({
    queryKey: ["follow-status", userId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { isFollowing: false };

      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();

      if (error) throw error;

      return { isFollowing: !!data };
    },
    enabled: !!currentUserId && !!userId && currentUserId !== userId,
  });
};

export const useFollowCounts = (userId: string) => {
  return useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: async () => {
      const { data: followersData } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId);

      const { data: followingData } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId);

      return {
        followers: followersData?.length || 0,
        following: followingData?.length || 0,
      };
    },
    enabled: !!userId,
  });
};

export const useFollowMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      followerId,
      followingId,
      action,
    }: {
      followerId: string;
      followingId: string;
      action: "follow" | "unfollow";
    }) => {
      if (action === "follow") {
        const { error } = await supabase.from("follows").insert({
          follower_id: followerId,
          following_id: followingId,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", followingId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["follow-status", variables.followingId, variables.followerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-counts", variables.followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-counts", variables.followerId],
      });

      toast({
        title: variables.action === "follow" ? "Following" : "Unfollowed",
        description:
          variables.action === "follow"
            ? "You are now following this user"
            : "You have unfollowed this user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useFollowingPosts = (userId?: string) => {
  return useQuery({
    queryKey: ["following-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get list of users that current user follows
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      const followingIds = followingData?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) return [];

      // Fetch posts from followed users
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .in("user_id", followingIds)
        .order("created_at", { ascending: false });

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
            profiles: profile || {
              id: post.user_id,
              full_name: null,
              avatar_url: null,
            },
          };
        })
      );

      return postsWithProfiles;
    },
    enabled: !!userId,
  });
};
