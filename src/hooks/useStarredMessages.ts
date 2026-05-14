import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStarredMessages() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["starred-messages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("starred_messages")
        .select("id, message_id, conversation_id, note, created_at, messages:message_id(content, sender_id, created_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const star = useMutation({
    mutationFn: async ({ messageId, conversationId, note }: { messageId: string; conversationId: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("starred_messages").insert({
        user_id: user.id,
        message_id: messageId,
        conversation_id: conversationId,
        note: note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["starred-messages"] });
      toast({ title: "Message starred" });
    },
    onError: (e: any) => toast({ title: "Could not star", description: e.message, variant: "destructive" }),
  });

  const unstar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("starred_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["starred-messages"] }),
  });

  return { ...query, star: star.mutate, unstar: unstar.mutate };
}
