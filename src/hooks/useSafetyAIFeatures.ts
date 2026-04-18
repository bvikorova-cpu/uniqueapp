import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeAction<T = any>(action: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("safety-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export function useSafetyCredits() {
  return useQuery({
    queryKey: ["safety-ai-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("safety_ai_credits").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });
}

export function useBullyDecoder() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-bully-decoder"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_bully_decoder")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const decode = useMutation({
    mutationFn: (input_text: string) => invokeAction("decoder", { input_text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-bully-decoder"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
      toast.success("Message decoded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, decode };
}

export function useEvidenceBuilder() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-evidence-packs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_evidence_packs")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const build = useMutation({
    mutationFn: (vars: { title: string; incidents: { date?: string; description: string }[] }) =>
      invokeAction("evidence", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-evidence-packs"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
      toast.success("Evidence pack ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, build };
}

export function useResponseCoach() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-response-coach"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_response_coach_sessions")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const score = useMutation({
    mutationFn: (vars: { scenario: string; user_response: string }) => invokeAction("coach", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-response-coach"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
      toast.success("Response scored");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, score };
}

export function useCyberRiskScan() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["safety-cyber-scans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("safety_cyberbullying_scans")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const scan = useMutation({
    mutationFn: (scan_input: string) => invokeAction("riskscan", { scan_input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-cyber-scans"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
      toast.success("Risk scan complete");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, scan };
}
