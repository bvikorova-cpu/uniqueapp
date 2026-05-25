import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserMutes = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: mutes = [], isLoading } = useQuery({
    queryKey: ["user-mutes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_mutes")
        .select("id, muted_user_id, expires_at, created_at")
        .eq("user_id", user.id);
      if (error) throw error;
      const now = Date.now();
      const active = (data || []).filter(
        (m: any) => !m.expires_at || new Date(m.expires_at).getTime() > now
      );
      const ids = active.map((m: any) => m.muted_user_id);
      if (ids.length === 0) return active;
      const { data: profs } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url")
        .in("id", ids);
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      return active.map((m: any) => ({ ...m, profiles: map.get(m.muted_user_id) || null }));
    },
  });

  const mute = useMutation({
    mutationFn: async ({ userId, durationHours }: { userId: string; durationHours?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const expires_at = durationHours
        ? new Date(Date.now() + durationHours * 3600 * 1000).toISOString()
        : null;
      const { error } = await supabase
        .from("user_mutes")
        .upsert(
          { user_id: user.id, muted_user_id: userId, expires_at },
          { onConflict: "user_id,muted_user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-mutes"] });
      toast({ title: "User muted" });
    },
  });

  const unmute = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_mutes")
        .delete()
        .eq("user_id", user.id)
        .eq("muted_user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-mutes"] });
      toast({ title: "User unmuted" });
    },
  });

  return {
    mutes,
    mutedIds: mutes.map((m: any) => m.muted_user_id),
    isLoading,
    muteUser: mute.mutate,
    unmuteUser: unmute.mutate,
  };
};
