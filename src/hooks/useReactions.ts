import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReactions = (postId: string) => {
  const queryClient = useQueryClient();

  const { data: reactions, isLoading } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;
      return data;
    },
  });

  const userReaction = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return undefined;
    return reactions?.find((r) => r.user_id === userId);
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    reactions?.forEach((r) => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
    });
    return counts;
  };

  const toggleReaction = useMutation({
    mutationFn: async (reactionType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = reactions?.find((r) => r.user_id === user.id);

      if (existing) {
        if (existing.reaction_type === reactionType) {
          // Remove reaction
          const { error } = await supabase
            .from("post_reactions")
            .delete()
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          // Update reaction
          const { error } = await supabase
            .from("post_reactions")
            .update({ reaction_type: reactionType })
            .eq("id", existing.id);
          if (error) throw error;
        }
      } else {
        // Add new reaction
        const { error } = await supabase.from("post_reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
    },
  });

  return {
    reactions: reactions || [],
    isLoading,
    userReaction,
    getReactionCounts,
    toggleReaction: toggleReaction.mutate,
  };
};
