import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoryAnalytics {
  story_id: string;
  user_id: string;
  views_count: number;
  unique_viewers: number;
  replies_count: number;
  reactions_count: number;
  shares_count: number;
  avg_view_duration_ms: number;
  updated_at: string;
}

export const useStoryAnalytics = (storyId?: string) => {
  return useQuery({
    queryKey: ["story-analytics", storyId],
    enabled: !!storyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("story_analytics" as any)
        .select("*")
        .eq("story_id", storyId)
        .maybeSingle();
      return (data || null) as unknown as StoryAnalytics | null;
    },
  });
};
