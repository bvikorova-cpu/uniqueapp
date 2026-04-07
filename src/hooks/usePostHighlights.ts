import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostHighlights = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: highlights, isLoading } = useQuery({
    queryKey: ["post-highlights", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("post_highlights")
        .select("*, posts(*)")
        .eq("user_id", targetUserId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const addHighlight = useMutation({
    mutationFn: async ({ postId, category }: {
      postId: string;
      category?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("post_highlights").insert({
        user_id: user.id,
        post_id: postId,
        category,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-highlights"] });
      toast({ title: "Added to highlights!" });
    },
  });

  const removeHighlight = useMutation({
    mutationFn: async (highlightId: string) => {
      const { error } = await supabase
        .from("post_highlights")
        .delete()
        .eq("id", highlightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-highlights"] });
      toast({ title: "Removed from highlights" });
    },
  });

  return {
    highlights: highlights || [],
    isLoading,
    addHighlight: addHighlight.mutate,
    removeHighlight: removeHighlight.mutate,
  };
};
