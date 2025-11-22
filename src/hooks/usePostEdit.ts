import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostEdit = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editPost = useMutation({
    mutationFn: async ({ postId, newContent }: { postId: string; newContent: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current post content
      const { data: post } = await supabase
        .from("posts")
        .select("content")
        .eq("id", postId)
        .single();

      if (!post) throw new Error("Post not found");

      // Save edit history
      await supabase
        .from("post_edit_history")
        .insert({
          post_id: postId,
          previous_content: post.content,
          edited_by: user.id,
        });

      // Update post
      const { error } = await supabase
        .from("posts")
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Post updated successfully!" });
    },
    onError: () => {
      toast({
        title: "Failed to update post",
        variant: "destructive",
      });
    },
  });

  return {
    editPost: editPost.mutate,
    isEditing: editPost.isPending,
  };
};

export const usePostHistory = (postId: string) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["post-history", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_edit_history")
        .select("*")
        .eq("post_id", postId)
        .order("edited_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { history, isLoading };
};
