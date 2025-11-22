import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingTopic {
  id: string;
  topic: string;
  post_count: number;
  engagement_score: number;
  last_updated: string;
}

export const useTrending = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ["trending-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_topics")
        .select("*")
        .order("engagement_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return {
    topics: topics || [],
    isLoading,
  };
};

export const useTrendingPosts = () => {
  const { data: trendingPosts = [], isLoading } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_posts")
        .select(`
          *,
          posts (*)
        `)
        .order("trending_score", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  return {
    trendingPosts,
    isLoading,
  };
};
