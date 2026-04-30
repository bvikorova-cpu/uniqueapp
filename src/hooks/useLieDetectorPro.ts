import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// All lie-detector-* are routed through the consolidated `lie-detector-ai` function.
async function invoke<T = any>(action: string, body: Record<string, any>): Promise<T> {
  // Router action MUST win over body.action. Sub-actions become `sub_action`.
  const { action: subAction, ...rest } = body;
  const payload = { ...rest, action, ...(subAction !== undefined ? { sub_action: subAction } : {}) };
  const { data, error } = await supabase.functions.invoke("lie-detector-ai", { body: payload });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// ===== POLYGRAPH =====
export function usePolygraph() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { text: string }) => invoke("polygraph", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); toast.success("Polygraph reading captured"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== CROSS-EXAM =====
export function useCrossExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { subject_text: string; qa_thread: any[]; action: "question" | "verdict" }) =>
      invoke("cross-exam", vars),
    onSuccess: (_d, v) => { if (v.action === "verdict") { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); toast.success("Verdict delivered"); } },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== VOICE HEATMAP =====
export function useVoiceHeatmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { audio_base64: string; mime: string }) => invoke("voice-heatmap", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); toast.success("Heatmap generated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== BODY LANGUAGE =====
export function useBodyLanguageScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { frames_base64: string[]; mime: string; context?: string }) => invoke("body-language", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); toast.success("Body language scanned"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== COMPARISON =====
export function useComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { source_a: string; source_b: string; title?: string }) => invoke("comparison", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); toast.success("Comparison ready"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== BULK =====
export function useBulkAnalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { items: string[]; job_type?: string }) => invoke("bulk", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-detector-credits"] }); qc.invalidateQueries({ queryKey: ["lie-bulk-jobs"] }); toast.success("Bulk batch done"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useBulkJobs() {
  return useQuery({
    queryKey: ["lie-bulk-jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_bulk_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
}

// ===== API KEYS =====
export function useApiKeys() {
  return useQuery({
    queryKey: ["lie-api-keys"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
}
export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => invoke("api-keys", { action: "create", label }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lie-api-keys"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key_id: string) => invoke("api-keys", { action: "revoke", key_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-api-keys"] }); toast.success("Revoked"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== MONITORING =====
export function useMonitoringJobs() {
  return useQuery({
    queryKey: ["lie-monitoring"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_monitoring_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
}
export function useMonitorAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) => invoke("monitor", vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lie-monitoring"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== CASE FILES =====
export function useCaseFiles() {
  return useQuery({
    queryKey: ["lie-case-files"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_case_files").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      return data || [];
    },
  });
}
export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { title: string; description?: string; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("lie_case_files").insert({ ...vars, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-case-files"] }); toast.success("Case opened"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== DETECTIVE RANK =====
export function useMyRank() {
  return useQuery({
    queryKey: ["lie-my-rank"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("lie_detective_ranks").select("*").eq("user_id", user.id).maybeSingle();
      return data || { xp: 0, rank_tier: "Rookie", badges: [], total_analyses: 0 };
    },
  });
}

// ===== SOCIAL CARD =====
export function useCreateSocialCard() {
  return useMutation({
    mutationFn: (vars: { quote: string; truth_score?: number; source_type?: string; source_id?: string }) =>
      invoke("social-card", vars),
    onSuccess: () => toast.success("Share card created"),
    onError: (e: Error) => toast.error(e.message),
  });
}
