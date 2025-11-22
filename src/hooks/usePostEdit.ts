import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostEdit = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editPost = useMutation({
    mutationFn: async ({ postId, newContent }: { postId: string; newContent: string }) => {
      // Get current post content
      const { data: post } = await supabase
        .from("posts")
        .select("content")
        .eq("id", postId)
        .single();

      if (!post) throw new Error("Post not found");

      // Save edit history
      await supabase
        .from("post_edits")
        .insert({
          post_id: postId,
          previous_content: post.content,
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
