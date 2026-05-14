import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Manage per-user conversation state: pin, archive, mute. */
export function useConversationState() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const update = useMutation({
    mutationFn: async ({
      conversationId,
      patch,
    }: {
      conversationId: string;
      patch: Partial<{ is_pinned: boolean; is_archived: boolean; muted_until: string | null; pinned_at: string | null }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("conversation_participants")
        .update(patch)
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return {
    pin: (conversationId: string) => update.mutate({ conversationId, patch: { is_pinned: true, pinned_at: new Date().toISOString() } }),
    unpin: (conversationId: string) => update.mutate({ conversationId, patch: { is_pinned: false, pinned_at: null } }),
    archive: (conversationId: string) => update.mutate({ conversationId, patch: { is_archived: true } }),
    unarchive: (conversationId: string) => update.mutate({ conversationId, patch: { is_archived: false } }),
    mute: (conversationId: string, hours: number) =>
      update.mutate({
        conversationId,
        patch: { muted_until: new Date(Date.now() + hours * 3600_000).toISOString() },
      }),
    unmute: (conversationId: string) => update.mutate({ conversationId, patch: { muted_until: null } }),
  };
}
