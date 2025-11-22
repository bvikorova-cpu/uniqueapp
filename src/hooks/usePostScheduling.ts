import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  scheduled_for: string;
  status: string;
  created_at: string;
}

export const usePostScheduling = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduled-posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const schedulePost = useMutation({
    mutationFn: async ({ content, scheduledFor, mediaUrls }: { 
      content: string; 
      scheduledFor: Date;
      mediaUrls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert({
          user_id: user.id,
          content,
          scheduled_for: scheduledFor.toISOString(),
          media_urls: mediaUrls || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({ title: "Post scheduled successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to schedule post", variant: "destructive" });
    },
  });

  const cancelScheduledPost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: "cancelled" })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({ title: "Scheduled post cancelled" });
    },
  });

  return {
    scheduledPosts: scheduledPosts || [],
    isLoading,
    schedulePost: schedulePost.mutate,
    cancelScheduledPost: cancelScheduledPost.mutate,
  };
};
