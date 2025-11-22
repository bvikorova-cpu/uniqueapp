import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  target_id: string | null;
  target_type: string | null;
  metadata: any;
  created_at: string;
}

export const useActivityFeed = (userId?: string) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-feed", userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId || true,
  });

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      post_created: "✍️",
      post_liked: "❤️",
      post_commented: "💬",
      post_shared: "🔄",
      friend_added: "👥",
      profile_updated: "👤",
      photo_uploaded: "📷",
    };
    return icons[type] || "📌";
  };

  const getActivityMessage = (activity: Activity) => {
    const messages: Record<string, string> = {
      post_created: "created a new post",
      post_liked: "liked a post",
      post_commented: "commented on a post",
      post_shared: "shared a post",
      friend_added: "added a new friend",
      profile_updated: "updated their profile",
      photo_uploaded: "uploaded a photo",
    };
    return messages[activity.activity_type] || "had an activity";
  };

  return {
    activities: activities || [],
    isLoading,
    getActivityIcon,
    getActivityMessage,
  };
};
