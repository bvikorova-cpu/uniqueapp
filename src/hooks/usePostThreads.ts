import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostThreads = (postId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: threadPosts = [], isLoading } = useQuery({
    queryKey: ["post-thread", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_threads")
        .select("child_post_id, thread_order")
        .eq("parent_post_id", postId)
        .order("thread_order", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get all child posts
      const childPostIds = data.map((t) => t.child_post_id);
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .in("id", childPostIds);

      if (postsError) throw postsError;

      // Sort posts by thread order
      const sortedPosts = posts?.sort((a, b) => {
        const orderA = data.find((t) => t.child_post_id === a.id)?.thread_order || 0;
        const orderB = data.find((t) => t.child_post_id === b.id)?.thread_order || 0;
        return orderA - orderB;
      });

      return sortedPosts || [];
    },
    enabled: !!postId,
  });

  const addToThread = useMutation({
    mutationFn: async ({
      parentPostId,
      childPostId,
    }: {
      parentPostId: string;
      childPostId: string;
    }) => {
      // Get current thread count to determine order
      const { data: existing } = await supabase
        .from("post_threads")
        .select("thread_order")
        .eq("parent_post_id", parentPostId)
        .order("thread_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].thread_order + 1 : 1;

      const { error } = await supabase.from("post_threads").insert({
        parent_post_id: parentPostId,
        child_post_id: childPostId,
        thread_order: nextOrder,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Added to thread" });
      queryClient.invalidateQueries({ queryKey: ["post-thread"] });
    },
    onError: () => {
      toast({ title: "Failed to add to thread", variant: "destructive" });
    },
  });

  const removeFromThread = useMutation({
    mutationFn: async ({
      parentPostId,
      childPostId,
    }: {
      parentPostId: string;
      childPostId: string;
    }) => {
      const { error } = await supabase
        .from("post_threads")
        .delete()
        .eq("parent_post_id", parentPostId)
        .eq("child_post_id", childPostId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Removed from thread" });
      queryClient.invalidateQueries({ queryKey: ["post-thread"] });
    },
  });

  return {
    threadPosts,
    isLoading,
    addToThread: addToThread.mutate,
    removeFromThread: removeFromThread.mutate,
  };
};
