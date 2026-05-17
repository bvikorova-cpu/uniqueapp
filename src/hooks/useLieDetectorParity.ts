import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invoke<T = any>(action: string, body: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("lie-detector-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

const onErr = (e: Error) => toast.error(e.message);

// 1. Chat Import
export function useChatImport() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-chat-imports"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_chat_imports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const run = useMutation({
    mutationFn: (vars: { raw_text: string; source_app?: string }) => invoke("chat-import", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-chat-imports"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Chat analyzed");
    },
    onError: onErr,
  });
  return { items: list.data || [], run };
}

// 2. Email Scan
export function useEmailScan() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-email-scans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_email_scans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const run = useMutation({
    mutationFn: (vars: { subject?: string; sender?: string; body: string }) => invoke("email-scan", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-email-scans"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Email analyzed");
    },
    onError: onErr,
  });
  return { items: list.data || [], run };
}

// 3. Sentiment Timeline
export function useSentimentTimeline() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-sentiment-timelines-v2"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_sentiment_timelines_v2").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const run = useMutation({
    mutationFn: (vars: { messages: string[]; title?: string }) => invoke("sentiment-timeline", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-sentiment-timelines-v2"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Timeline mapped");
    },
    onError: onErr,
  });
  return { items: list.data || [], run };
}

// 4. Watchlist Triggers
export function useWatchlist() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-watchlist"],
    queryFn: () => invoke<{ items: any[] }>("watchlist", { sub_action: "list" }).then((r) => r.items || []),
  });
  const create = useMutation({
    mutationFn: (vars: { label: string; keywords: string[]; notify?: boolean }) =>
      invoke("watchlist", { sub_action: "create", ...vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-watchlist"] }); toast.success("Trigger added"); },
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: string) => invoke("watchlist", { sub_action: "delete", id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lie-watchlist"] }); toast.success("Removed"); },
    onError: onErr,
  });
  const scan = useMutation({
    mutationFn: (text: string) => invoke<{ hits: any[]; total: number }>("watchlist", { sub_action: "scan", text }),
    onError: onErr,
  });
  return { items: list.data || [], create, remove, scan };
}

// 5. Red Flag Dictionary
export function useRedFlagLookup() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-red-flag-lookups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_red_flag_lookups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const run = useMutation({
    mutationFn: (phrase: string) => invoke("red-flag", { phrase }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-red-flag-lookups"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
    },
    onError: onErr,
  });
  return { items: list.data || [], run };
}

// 6. Truth Chat
export function useTruthChat() {
  const qc = useQueryClient();
  const sessions = useQuery({
    queryKey: ["lie-truth-chat-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_truth_chat_sessions").select("*").eq("user_id", user.id).order("last_message_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const send = useMutation({
    mutationFn: (vars: { session_id?: string; message: string; context?: string }) => invoke("truth-chat", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-truth-chat-sessions"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
    },
    onError: onErr,
  });
  return { sessions: sessions.data || [], send };
}

// 7. Trust Score
export function useTrustScore() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-trust-scores"],
    queryFn: () => invoke<{ items: any[] }>("trust-score", { sub_action: "list" }).then((r) => r.items || []),
  });
  const score = useMutation({
    mutationFn: (vars: { contact_name: string; sample_text: string }) =>
      invoke("trust-score", { sub_action: "score", ...vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-trust-scores"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Trust score updated");
    },
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: string) => invoke("trust-score", { sub_action: "delete", id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lie-trust-scores"] }),
    onError: onErr,
  });
  return { items: list.data || [], score, remove };
}

// 8. Tactic Classify
export function useTacticClassify() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lie-tactic-classifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("lie_tactic_classifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const run = useMutation({
    mutationFn: (text: string) => invoke("tactic-classify", { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lie-tactic-classifications"] });
      qc.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      toast.success("Tactics classified");
    },
    onError: onErr,
  });
  return { items: list.data || [], run };
}
