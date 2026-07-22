import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useHighlights = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: highlights } = useQuery({
    queryKey: ["post-highlights", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("post_highlights")
        .select("*, posts(*)")
        .eq("user_id", userId)
        .order("highlight_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userId });

  const addHighlight = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const maxOrder = highlights?.length || 0;

      const { error } = await supabase
        .from("post_highlights")
        .insert({ user_id: user.id,
          post_id: postId,
          highlight_order: maxOrder + 1 });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-highlights"] });
      toast({ title: "Added to highlights!" });
    } });

  const removeHighlight = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_highlights")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-highlights"] });
      toast({ title: "Removed from highlights" });
    } });

  return { highlights: highlights || [],
    addHighlight: addHighlight.mutate,
    removeHighlight: removeHighlight.mutate };
};
