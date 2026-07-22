import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'care';

export const usePostReactions = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reactions, isLoading } = useQuery({
    queryKey: ["post-reactions", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;
      return data;
    },
    enabled: !!postId });

  const addReaction = useMutation({
    mutationFn: async ({ postId, reactionType }: {
      postId: string;
      reactionType: ReactionType;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("post_reactions").upsert({ post_id: postId,
        user_id: user.id,
        reaction_type: reactionType }, {
        onConflict: "post_id,user_id"
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    } });

  const removeReaction = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    } });

  const getReactionCounts = () => { const counts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      care: 0 };

    reactions?.forEach(r => {
      counts[r.reaction_type as ReactionType]++;
    });

    return counts;
  };

  return { reactions: reactions || [],
    isLoading,
    addReaction: addReaction.mutate,
    removeReaction: removeReaction.mutate,
    getReactionCounts };
};
