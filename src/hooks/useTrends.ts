import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrendingPosts = () => {
  return useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("likes_count", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles for posts
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", post.user_id)
            .single();
          
          return {
            ...post,
            profiles: profile || { id: post.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      // Calculate engagement score for better trending
      const postsWithScore = postsWithProfiles.map((post) => ({
        ...post,
        engagement_score:
          (post.likes_count || 0) * 3 +
          (post.comments_count || 0) * 5 +
          (post.shares_count || 0) * 2 +
          (post.reposts_count || 0) * 4,
      }));

      // Sort by engagement score
      return postsWithScore.sort((a, b) => b.engagement_score - a.engagement_score);
    },
  });
};

export const useActiveUsers = () => {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("posts")
        .select("user_id")
        .gte("created_at", oneWeekAgo.toISOString());

      if (error) throw error;

      // Count posts per user
      const userPostCounts = data.reduce((acc: Record<string, number>, post) => {
        acc[post.user_id] = (acc[post.user_id] || 0) + 1;
        return acc;
      }, {});

      // Get top 10 users
      const topUserIds = Object.entries(userPostCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([userId]) => userId);

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", topUserIds);

      if (profilesError) throw profilesError;

      // Combine with post counts
      return profiles.map((profile) => ({
        ...profile,
        post_count: userPostCounts[profile.id],
      }));
    },
  });
};
