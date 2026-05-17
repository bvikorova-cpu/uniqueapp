import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeAction<T = any>(action: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("wellness-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

const useUserId = () => {
  return useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
    staleTime: 60_000,
  });
};

// ===== Toxicity =====
export function useToxicityScans() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-toxicity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_toxicity_scans" as any)
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return (data as any[]) || [];
    },
  });
  const scan = useMutation({
    mutationFn: (input_text: string) => invokeAction("toxicity", { input_text }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-toxicity"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Toxicity scan complete"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], scan };
}

// ===== Platform reports =====
export function usePlatformReports() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-platreports"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_platform_reports" as any)
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return (data as any[]) || [];
    },
  });
  const generate = useMutation({
    mutationFn: (vars: { platform: string; incident_summary: string; evidence_urls?: string[] }) =>
      invokeAction("platreport", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-platreports"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Report letter generated"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], generate };
}

// ===== Restorative letters =====
export function useRestorativeLetters() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-restorative"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_restorative_letters" as any)
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return (data as any[]) || [];
    },
  });
  const write = useMutation({
    mutationFn: (vars: { recipient_type: string; context: string; tone?: string }) =>
      invokeAction("restorative", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-restorative"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Letter drafted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], write };
}

// ===== Trusted allies =====
export function useTrustedAllies() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-allies"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_trusted_allies" as any)
        .select("*").eq("user_id", user.id).order("sort_order", { ascending: true });
      return (data as any[]) || [];
    },
  });
  const add = useMutation({
    mutationFn: async (vars: { ally_name: string; ally_phone?: string; ally_email?: string; relationship?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("safety_trusted_allies" as any).insert({ ...vars, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-allies"] }); toast.success("Ally added"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("safety_trusted_allies" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safety-allies"] }),
  });
  return { items: list.data || [], add, remove };
}

// ===== Safe word =====
export function useSafeWord() {
  const qc = useQueryClient();
  const row = useQuery({
    queryKey: ["safety-safeword"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("safety_safe_word" as any).select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async (vars: { code_phrase: string; alert_message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("safety_safe_word" as any).upsert({ ...vars, user_id: user.id }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-safeword"] }); toast.success("Safe word saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { row: row.data as any, save };
}

// ===== Wellbeing pulse =====
export function useWellbeingPulse() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-pulse"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_wellbeing_pulse" as any)
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return (data as any[]) || [];
    },
  });
  const submit = useMutation({
    mutationFn: (vars: { mood_score: number; anxiety_score: number; safety_score: number }) =>
      invokeAction("pulse", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-pulse"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Pulse check saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], submit };
}

// ===== Daily affirmation =====
export function useDailyAffirmation() {
  const qc = useQueryClient();
  const today = useQuery({
    queryKey: ["safety-affirmation-today"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const date = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("safety_daily_affirmations" as any)
        .select("*").eq("user_id", user.id).eq("for_date", date).maybeSingle();
      return data;
    },
  });
  const generate = useMutation({
    mutationFn: (theme: string) => invokeAction("affirmation", { theme }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-affirmation-today"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Affirmation ready"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { today: today.data as any, generate };
}

// ===== Bystander trainer =====
export function useBystanderTrainer() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-bystander"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_bystander_scores" as any)
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return (data as any[]) || [];
    },
  });
  const score = useMutation({
    mutationFn: (vars: { scenario_key: string; choice: string }) => invokeAction("bystander", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safety-bystander"] }); qc.invalidateQueries({ queryKey: ["safety-ai-credits"] }); toast.success("Scored"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], score };
}
