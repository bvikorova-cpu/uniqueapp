import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LiveRecording {
  id: string;
  stream_id: string;
  owner_id: string;
  title: string;
  description: string | null;
  playback_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  views_count: number;
  is_public: boolean;
  created_at: string;
}

export const useLiveRecordings = (ownerId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ["live-recordings", ownerId],
    queryFn: async () => {
      let q = supabase.from("live_recordings" as any).select("*").order("created_at", { ascending: false });
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return (data || []) as unknown as LiveRecording[];
    },
  });

  const createRecording = useMutation({
    mutationFn: async (input: Omit<LiveRecording, "id" | "owner_id" | "created_at" | "views_count">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("live_recordings" as any).insert({
        ...input,
        owner_id: user.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-recordings"] });
      toast({ title: "Recording archived" });
    },
  });

  const deleteRecording = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_recordings" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-recordings"] }),
  });

  return {
    recordings,
    isLoading,
    createRecording: createRecording.mutate,
    deleteRecording: deleteRecording.mutate,
  };
};
