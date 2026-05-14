import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useMessagePins(conversationId?: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["message-pins", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_pins")
        .select("id, message_id, pinned_by, created_at, messages:message_id(id, content, sender_id, created_at)")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const pin = useMutation({
    mutationFn: async (messageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !conversationId) throw new Error("Not allowed");
      const { error } = await supabase.from("message_pins").insert({
        conversation_id: conversationId,
        message_id: messageId,
        pinned_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["message-pins", conversationId] });
      toast({ title: "Message pinned" });
    },
    onError: (e: any) => toast({ title: "Could not pin", description: e.message, variant: "destructive" }),
  });

  const unpin = useMutation({
    mutationFn: async (pinId: string) => {
      const { error } = await supabase.from("message_pins").delete().eq("id", pinId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["message-pins", conversationId] }),
  });

  return { ...query, pin: pin.mutate, unpin: unpin.mutate };
}
