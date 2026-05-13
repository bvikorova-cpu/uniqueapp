import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export const useMessageReactions = (messageIds: string[]) => {
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ["message-reactions", messageIds.sort().join(",")],
    queryFn: async () => {
      if (!messageIds.length) return [];
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", messageIds);
      if (error) throw error;
      return data as MessageReaction[];
    },
    enabled: messageIds.length > 0,
  });

  const toggle = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = reactions.find(
        (r) => r.message_id === messageId && r.user_id === user.id && r.reaction === emoji,
      );
      if (existing) {
        await supabase.from("message_reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("message_reactions").insert({
          message_id: messageId,
          user_id: user.id,
          reaction: emoji,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message-reactions"] }),
  });

  const reactionsByMessage = reactions.reduce<Record<string, MessageReaction[]>>((acc, r) => {
    (acc[r.message_id] ||= []).push(r);
    return acc;
  }, {});

  return { reactionsByMessage, toggle: toggle.mutate };
};
