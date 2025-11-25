import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ShareType = 'profile' | 'message' | 'external' | 'story';

export const usePostShares = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shares, isLoading } = useQuery({
    queryKey: ["post-shares", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_shares")
        .select("*")
        .eq("original_post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });

  const sharePost = useMutation({
    mutationFn: async ({ postId, shareType, metadata }: {
      postId: string;
      shareType: ShareType;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("post_shares").insert({
        original_post_id: postId,
        user_id: user.id,
        share_text: shareType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-shares"] });
      toast({ title: "Post shared!" });
    },
  });

  return {
    shares: shares || [],
    shareCount: shares?.length || 0,
    isLoading,
    sharePost: sharePost.mutate,
  };
};
