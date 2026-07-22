import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ArchivedPost {
  id: string;
  user_id: string;
  post_id: string;
  archived_at: string | null;
  posts: unknown;
}

export const useArchive = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: archivedPosts = [], isLoading } = useQuery<ArchivedPost[]>({
    queryKey: ["archived-posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("archived_posts")
        .select(`
          *,
          posts (*)
        `)
        .eq("user_id", user.id)
        .order("archived_at", { ascending: false });

      if (error) throw error;
      return data;
    } });

  const isArchived = (postId: string) => {
    return archivedPosts.some((a) => a.post_id === postId);
  };

  const toggleArchive = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = archivedPosts.find((a) => a.post_id === postId);

      if (existing) {
        const { error } = await supabase
          .from("archived_posts")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("archived_posts").insert({ user_id: user.id,
          post_id: postId });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-posts"] });
      toast({ title: "Archive updated" });
    } });

  return { archivedPosts,
    isLoading,
    isArchived,
    toggleArchive: toggleArchive.mutate };
};
