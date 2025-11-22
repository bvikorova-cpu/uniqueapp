import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBookmarks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*, posts(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isBookmarked = (postId: string) => {
    return bookmarks?.some(b => b.post_id === postId) || false;
  };

  const toggleBookmark = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = bookmarks?.find(b => b.post_id === postId);

      if (existing) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({
            user_id: user.id,
            post_id: postId,
          });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast({ 
        title: data.action === "added" ? "Bookmark saved!" : "Bookmark removed" 
      });
    },
  });

  return {
    bookmarks: bookmarks || [],
    isLoading,
    isBookmarked,
    toggleBookmark: toggleBookmark.mutate,
  };
};
