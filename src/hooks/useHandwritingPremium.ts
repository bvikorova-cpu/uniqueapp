import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const invoke = async (action: string, body: any = {}) => {
  const { data, error } = await supabase.functions.invoke("handwriting-ai", {
    body: { action, ...body },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
};

const handleErr = (e: Error) => {
  const m = e.message || "";
  if (m.includes("Insufficient")) toast.error("Not enough credits — top up to continue.");
  else if (m.includes("subscription")) toast.error("Active subscription required.");
  else toast.error(m || "Something went wrong");
};

// ---------------- Couples ----------------
export function useCouplesStatus() {
  return useQuery({
    queryKey: ["couples-status"],
    queryFn: async () => {
      const data: any = await invoke("couples-status");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useCouplesCheckout() {
  return useMutation({
    mutationFn: async (vars: { partnerEmail?: string }) => {
      const data: any = await invoke("couples-checkout", vars);
      if (data?.url) window.open(data.url, "_blank");
      return data;
    },
    onError: handleErr,
  });
}

export function useCouplesPortal() {
  return useMutation({
    mutationFn: async () => {
      const data: any = await invoke("portal", { kind: "couples" });
      if (data?.url) window.open(data.url, "_blank");
      return data;
    },
    onError: handleErr,
  });
}

// ---------------- HR Pro ----------------
export function useHrStatus() {
  return useQuery({
    queryKey: ["hr-status"],
    queryFn: async () => {
      const data: any = await invoke("hr-status");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useHrCheckout() {
  return useMutation({
    mutationFn: async () => {
      const data: any = await invoke("hr-checkout");
      if (data?.url) window.open(data.url, "_blank");
      return data;
    },
    onError: handleErr,
  });
}

export function useHrPortal() {
  return useMutation({
    mutationFn: async () => {
      const data: any = await invoke("portal", { kind: "hr" });
      if (data?.url) window.open(data.url, "_blank");
      return data;
    },
    onError: handleErr,
  });
}

export function useHrBulkAnalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { jobTitle: string; candidates: { name: string; imageUrl: string }[] }) =>
      invoke("hr-bulk-analyze", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hr-jobs"] });
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Bulk analysis complete");
    },
    onError: handleErr,
  });
}

export function useHrJobs() {
  return useQuery({
    queryKey: ["hr-jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("hr_bulk_jobs" as any)
        .select("*, hr_bulk_candidates(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });
}

// ---------------- Voice Diary ----------------
export function useVoiceDiary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageUrl: string; transcript: string; mood?: string }) =>
      invoke("voice-diary", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-diaries"] });
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Voice diary saved");
    },
    onError: handleErr,
  });
}

export function useVoiceDiaryHistory() {
  return useQuery({
    queryKey: ["voice-diaries"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("voice_diaries" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });
}
