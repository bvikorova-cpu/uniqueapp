import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AudioSpace {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  recording_url: string | null;
  transcript: string | null;
  transcript_status: string;
  status: string;
  created_at: string;
}

export function useAudioSpaces() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["audio-spaces"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("audio_spaces")
        .select("*")
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AudioSpace[];
    },
  });

  const schedule = useMutation({
    mutationFn: async (input: { title: string; description?: string; scheduled_at?: string | null }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not authenticated");
      const { error } = await (supabase as any).from("audio_spaces").insert({
        host_id: u.user.id,
        title: input.title,
        description: input.description ?? null,
        scheduled_at: input.scheduled_at ?? null,
        status: input.scheduled_at ? "scheduled" : "live",
        started_at: input.scheduled_at ? null : new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Space scheduled" });
      qc.invalidateQueries({ queryKey: ["audio-spaces"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const endSpace = useMutation({
    mutationFn: async ({ id, recording_url }: { id: string; recording_url?: string }) => {
      const { error } = await (supabase as any).from("audio_spaces").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        recording_url: recording_url ?? null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audio-spaces"] }),
  });

  const transcribe = useMutation({
    mutationFn: async ({ spaceId, recordingUrl }: { spaceId: string; recordingUrl: string }) => {
      const { error } = await supabase.functions.invoke("transcribe-space", {
        body: { spaceId, recordingUrl },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Transcript ready" });
      qc.invalidateQueries({ queryKey: ["audio-spaces"] });
    },
  });

  return { spaces, isLoading, schedule, endSpace, transcribe };
}
