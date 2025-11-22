import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StoryHighlight {
  id: string;
  user_id: string;
  title: string;
  cover_image: string | null;
  created_at: string;
  post_count?: number;
}

export const useStoryHighlights = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: highlights, isLoading } = useQuery({
    queryKey: ["story-highlights", userId],
    queryFn: async () => {
      let query = supabase
        .from("story_highlights")
        .select(`
          *,
          story_highlight_posts(count)
        `)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(h => ({
        ...h,
        post_count: h.story_highlight_posts?.[0]?.count || 0
      }));
    },
    enabled: !!userId,
  });

  const createHighlight = useMutation({
    mutationFn: async ({ title, coverImage }: { title: string; coverImage?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("story_highlights")
        .insert({
          user_id: user.id,
          title,
          cover_image: coverImage,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-highlights"] });
      toast({ title: "Story highlight created!" });
    },
    onError: () => {
      toast({ title: "Failed to create highlight", variant: "destructive" });
    },
  });

  const addPostToHighlight = useMutation({
    mutationFn: async ({ highlightId, postId }: { highlightId: string; postId: string }) => {
      const { error } = await supabase
        .from("story_highlight_posts")
        .insert({ highlight_id: highlightId, post_id: postId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-highlights"] });
      toast({ title: "Post added to highlight!" });
    },
    onError: () => {
      toast({ title: "Failed to add post", variant: "destructive" });
    },
  });

  const deleteHighlight = useMutation({
    mutationFn: async (highlightId: string) => {
      const { error } = await supabase
        .from("story_highlights")
        .delete()
        .eq("id", highlightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-highlights"] });
      toast({ title: "Highlight deleted" });
    },
  });

  return {
    highlights,
    isLoading,
    createHighlight: createHighlight.mutate,
    addPostToHighlight: addPostToHighlight.mutate,
    deleteHighlight: deleteHighlight.mutate,
  };
};
