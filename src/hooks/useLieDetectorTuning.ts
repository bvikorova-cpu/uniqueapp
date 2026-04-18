import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invoke<T = any>(name: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// ============== LIVE COACH ==============
export function useLieCoach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { conversation: string }) => invoke("lie-detector-coach", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Coach analysis ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============== MULTI-PERSON ==============
export function useMultiPersonProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title?: string; people: { name: string; messages: string[] }[] }) =>
      invoke("lie-detector-multi-person", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      qc.invalidateQueries({ queryKey: ["lie-relationship-maps"] });
      toast.success("Relationship map generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRelationshipMaps(limit = 5) {
  return useQuery({
    queryKey: ["lie-relationship-maps", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_relationship_maps").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
      return data || [];
    },
  });
}

// ============== DEEPFAKE ==============
export function useDeepfakeCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { audio_base64: string; mime: string }) =>
      invoke("lie-detector-deepfake", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Deepfake check complete");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============== DAILY CHALLENGE ==============
export function useDailyChallenge() {
  return useQuery({
    queryKey: ["lie-daily-challenge"],
    queryFn: () => invoke("lie-detector-daily-challenge", { action: "get" }),
    staleTime: 60_000,
  });
}

export function useSubmitChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { challenge_id: string; selected_index: number; time_taken_ms: number }) =>
      invoke("lie-detector-daily-challenge", { action: "submit", ...vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-daily-challenge"] });
      qc.invalidateQueries({ queryKey: ["lie-leaderboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLieLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ["lie-leaderboard", limit],
    queryFn: async () => {
      const { data } = await supabase.from("lie_leaderboard").select("*")
        .order("total_points", { ascending: false }).limit(limit);
      return data || [];
    },
  });
}

// ============== REPORT VERIFICATION ==============
export function useRegisterVerification() {
  return useMutation({
    mutationFn: async (vars: { report_id?: string; title: string; summary?: string; truthfulness_score?: number }) =>
      invoke("lie-detector-verify-report", vars),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============== INTERROGATION MODE PREF ==============
export function useInterrogationMode() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["lie-detector-prefs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { interrogation_mode: false };
      const { data } = await supabase.from("lie_detector_preferences")
        .select("*").eq("user_id", user.id).maybeSingle();
      return data || { interrogation_mode: false };
    },
  });
  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data: existing } = await supabase.from("lie_detector_preferences")
        .select("user_id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("lie_detector_preferences").update({ interrogation_mode: next, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      } else {
        await supabase.from("lie_detector_preferences").insert({ user_id: user.id, interrogation_mode: next });
      }
      return next;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lie-detector-prefs"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  return { ...q, toggle };
}
