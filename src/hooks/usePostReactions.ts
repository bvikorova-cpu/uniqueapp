import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queueReaction } from "@/lib/voteBatch";


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
      // Debounced batch write — dramatically reduces write QPS at scale.
      queueReaction(postId, reactionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    } });

  const removeReaction = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      queueReaction(postId, null);
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
