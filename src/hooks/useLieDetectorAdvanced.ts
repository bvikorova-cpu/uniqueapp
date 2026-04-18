import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invoke<T = any>(name: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// ============== VOICE ==============
export function useVoiceLieDetection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { audio_base64: string; mime: string }) => invoke("lie-detector-voice", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-voice-history"] });
      toast.success("Voice analysis complete");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useVoiceHistory(limit = 5) {
  return useQuery({
    queryKey: ["lie-detector-voice-history", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("lie_detector_voice_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      return data || [];
    },
  });
}

// ============== SCREENSHOT ==============
export function useScreenshotForensics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { image_base64: string; mime: string }) => invoke("lie-detector-screenshot", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-screenshot-history"] });
      toast.success("Screenshot analyzed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============== TIMELINE ==============
export function useConversationTimeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { messages: string[]; title?: string }) => invoke("lie-detector-timeline", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-timelines"] });
      toast.success("Timeline analyzed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTimelines(limit = 5) {
  return useQuery({
    queryKey: ["lie-detector-timelines", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("lie_detector_timelines")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      return data || [];
    },
  });
}

// ============== TRUTH REPORT ==============
export function useTruthReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { source_type: string; source_id?: string; payload: any; title?: string }) =>
      invoke("lie-detector-report", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Report generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
