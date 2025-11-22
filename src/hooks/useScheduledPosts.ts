import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useScheduledPosts = () => {
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
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const schedulePost = useMutation({
    mutationFn: async ({ content, mediaUrls, scheduledFor }: {
      content: string;
      mediaUrls?: string[];
      scheduledFor: Date;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("scheduled_posts").insert({
        user_id: user.id,
        content,
        media_urls: mediaUrls,
        scheduled_for: scheduledFor.toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({ title: "Post scheduled!" });
    },
  });

  const cancelScheduled = useMutation({
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
    cancelScheduled: cancelScheduled.mutate,
  };
};
