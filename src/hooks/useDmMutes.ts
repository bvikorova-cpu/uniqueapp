import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Per-user DM mute list. Reads from `dm_mutes` table. */
export function useDmMutes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: mutedIds = [] } = useQuery({
    queryKey: ["dm-mutes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("dm_mutes")
        .select("muted_user_id")
        .eq("user_id", user!.id);
      return ((data ?? []) as { muted_user_id: string }[]).map((r) => r.muted_user_id);
    },
  });

  const isMuted = (otherUserId: string) => mutedIds.includes(otherUserId);

  const mute = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      await (supabase as any)
        .from("dm_mutes")
        .insert({ user_id: user.id, muted_user_id: otherUserId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dm-mutes"] }),
  });

  const unmute = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      await (supabase as any)
        .from("dm_mutes")
        .delete()
        .eq("user_id", user.id)
        .eq("muted_user_id", otherUserId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dm-mutes"] }),
  });

  return {
    mutedIds: new Set(mutedIds),
    isMuted,
    mute: mute.mutate,
    unmute: unmute.mutate,
    toggle: (id: string) => (isMuted(id) ? unmute.mutate(id) : mute.mutate(id)),
  };
}
