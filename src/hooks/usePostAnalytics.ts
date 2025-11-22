import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PostAnalytics {
  id: string;
  post_id: string;
  views_count: number;
  unique_viewers: number;
  engagement_rate: number;
  avg_time_spent: number;
  peak_engagement_hour: number | null;
  updated_at: string;
}

export const usePostAnalytics = (postId?: string) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["post-analytics", postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from("post_analytics")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!postId,
  });

  const { data: userPosts } = useQuery({
    queryKey: ["user-posts-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      const postIds = posts.map(p => p.id);
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("post_analytics")
        .select("*")
        .in("post_id", postIds);

      if (analyticsError) throw analyticsError;

      return posts.map(post => ({
        ...post,
        analytics: analyticsData?.find(a => a.post_id === post.id),
      }));
    },
  });

  return {
    analytics,
    userPosts: userPosts || [],
    isLoading,
  };
};
