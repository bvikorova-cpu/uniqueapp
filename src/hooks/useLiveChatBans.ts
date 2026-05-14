import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLiveChatBans = (streamId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: bans = [] } = useQuery({
    queryKey: ["live-chat-bans", streamId],
    enabled: !!streamId,
    queryFn: async () => {
      const { data } = await supabase
        .from("live_chat_bans" as any)
        .select("*")
        .eq("stream_id", streamId);
      return (data || []) as any[];
    },
  });

  const banUser = useMutation({
    mutationFn: async ({ userId, reason, durationMinutes }: { userId: string; reason?: string; durationMinutes?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !streamId) throw new Error("Missing context");
      const expires_at = durationMinutes
        ? new Date(Date.now() + durationMinutes * 60_000).toISOString()
        : null;
      const { error } = await supabase.from("live_chat_bans" as any).insert({
        stream_id: streamId,
        banned_user_id: userId,
        banned_by: user.id,
        reason,
        expires_at,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-chat-bans", streamId] });
      toast({ title: "User banned" });
    },
  });

  const unbanUser = useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase.from("live_chat_bans" as any).delete().eq("id", banId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-chat-bans", streamId] }),
  });

  return { bans, banUser: banUser.mutate, unbanUser: unbanUser.mutate };
};
