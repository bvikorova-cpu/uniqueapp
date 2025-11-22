import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePinnedPosts = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pinnedPosts, isLoading } = useQuery({
    queryKey: ["pinned-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("pinned_posts")
        .select("*, posts(*)")
        .eq("user_id", userId)
        .order("pinned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const isPinned = (postId: string) => {
    return pinnedPosts?.some((p) => p.post_id === postId) || false;
  };

  const togglePin = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = pinnedPosts?.find((p) => p.post_id === postId);

      if (existing) {
        const { error } = await supabase
          .from("pinned_posts")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "unpinned" };
      } else {
        const { error } = await supabase.from("pinned_posts").insert({
          user_id: user.id,
          post_id: postId,
        });
        if (error) throw error;
        return { action: "pinned" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pinned-posts"] });
      toast({
        title: data.action === "pinned" ? "Post pinned!" : "Post unpinned",
      });
    },
  });

  return {
    pinnedPosts: pinnedPosts || [],
    isLoading,
    isPinned,
    togglePin: togglePin.mutate,
  };
};
