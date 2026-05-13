import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invoke<T = any>(action: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("wellness-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// ==================== MOOD LOGS ====================
export function useMoodLogs(days = 30) {
  return useQuery({
    queryKey: ["safety-mood-logs", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase
        .from("safety_mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", since)
        .order("logged_at", { ascending: true });
      return data || [];
    },
  });
}

export function useAddMoodLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { mood_score: number; energy_score?: number; anxiety_score?: number; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to log mood");
      const { error } = await supabase.from("safety_mood_logs").insert({ ...vars, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-mood-logs"] });
      toast.success("Mood logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== WEEKLY INSIGHT (AI 5cr) ====================
export function useWeeklyInsight() {
  const qc = useQueryClient();
  const latest = useQuery({
    queryKey: ["safety-weekly-insight"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("safety_journal_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
  const generate = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [{ data: entries }, { data: moods }] = await Promise.all([
        supabase.from("safety_journal_entries").select("incident_type,description,mood_rating,created_at").eq("user_id", user.id).gte("created_at", since),
        supabase.from("safety_mood_logs").select("mood_score,energy_score,anxiety_score,logged_at").eq("user_id", user.id).gte("logged_at", since),
      ]);
      return invoke("weekly_insight", { entries: entries || [], mood_logs: moods || [] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-weekly-insight"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
      toast.success("Weekly insight ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { insight: latest.data, isLoading: latest.isLoading, generate };
}

// ==================== ROLEPLAY SCORE (AI 6cr) ====================
export function useRoleplayScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { scenario_id: string; scenario: string; user_response: string; difficulty: string; mode: string }) =>
      invoke("roleplay_score", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-leaderboard"] });
      qc.invalidateQueries({ queryKey: ["safety-ai-credits"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["safety-leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.from("safety_roleplay_leaderboard" as any).select("*").limit(50);
      return data || [];
    },
  });
}

// ==================== WALL REACTIONS ====================
export function useWallReactions(messageIds: string[]) {
  return useQuery({
    queryKey: ["safety-wall-reactions", messageIds.sort().join(",")],
    queryFn: async () => {
      if (messageIds.length === 0) return {};
      const { data } = await supabase.from("safety_wall_reactions").select("*").in("message_id", messageIds);
      const grouped: Record<string, Record<string, number>> = {};
      (data || []).forEach((r: any) => {
        grouped[r.message_id] = grouped[r.message_id] || {};
        grouped[r.message_id][r.reaction_type] = (grouped[r.message_id][r.reaction_type] || 0) + 1;
      });
      return grouped;
    },
    enabled: messageIds.length > 0,
  });
}

export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { message_id: string; reaction_type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to react");
      const { data: existing } = await supabase
        .from("safety_wall_reactions")
        .select("id")
        .eq("message_id", vars.message_id)
        .eq("user_id", user.id)
        .eq("reaction_type", vars.reaction_type)
        .maybeSingle();
      if (existing) {
        await supabase.from("safety_wall_reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("safety_wall_reactions").insert({ ...vars, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safety-wall-reactions"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== WALL AI FILTER (2cr) ====================
export function useWallFilter() {
  return useMutation({
    mutationFn: (message: string) => invoke<{ safe: boolean; reason?: string; suggested_rewrite?: string }>("wall_filter", { message }),
  });
}

// ==================== BUDDY MATCHING ====================
export function useBuddyProfile() {
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["safety-buddy-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("safety_buddy_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });
  const upsert = useMutation({
    mutationFn: async (vars: { anonymous_handle: string; age_range?: string; experience_tags?: string[]; looking_for?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("safety_buddy_profiles").upsert({ ...vars, user_id: user.id, is_active: true }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-buddy-profile"] });
      qc.invalidateQueries({ queryKey: ["safety-buddies"] });
      toast.success("Buddy profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { profile: profile.data, isLoading: profile.isLoading, upsert };
}

export function useBuddies() {
  return useQuery({
    queryKey: ["safety-buddies"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("safety_buddy_profiles")
        .select("*")
        .eq("is_active", true)
        .neq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .limit(30);
      return data || [];
    },
  });
}

// ==================== SOS GEO ====================
const COUNTRY_HOTLINES: Record<string, { country: string; flag: string; numbers: { name: string; tel: string; note?: string }[] }> = {
  US: { country: "United States", flag: "🇺🇸", numbers: [
    { name: "Emergency", tel: "911" }, { name: "Suicide & Crisis Lifeline", tel: "988" },
    { name: "Crisis Text", tel: "741741", note: "Text HOME" }, { name: "Childhelp", tel: "18004224453" },
  ]},
  GB: { country: "United Kingdom", flag: "🇬🇧", numbers: [
    { name: "Emergency", tel: "999" }, { name: "Childline", tel: "08001111" },
    { name: "Samaritans", tel: "116123" }, { name: "NSPCC", tel: "08088005000" },
  ]},
  CA: { country: "Canada", flag: "🇨🇦", numbers: [
    { name: "Emergency", tel: "911" }, { name: "Kids Help Phone", tel: "18006686868" },
    { name: "Talk Suicide", tel: "18334564566" },
  ]},
  AU: { country: "Australia", flag: "🇦🇺", numbers: [
    { name: "Emergency", tel: "000" }, { name: "Kids Helpline", tel: "1800551800" }, { name: "Lifeline", tel: "131114" },
  ]},
  DE: { country: "Germany", flag: "🇩🇪", numbers: [
    { name: "Emergency", tel: "112" }, { name: "Nummer gegen Kummer", tel: "11611" }, { name: "Telefonseelsorge", tel: "08001110111" },
  ]},
  FR: { country: "France", flag: "🇫🇷", numbers: [
    { name: "Emergency", tel: "112" }, { name: "3020 Anti-bullying", tel: "3020" }, { name: "SOS Friendship", tel: "0972394050" },
  ]},
  SK: { country: "Slovakia", flag: "🇸🇰", numbers: [
    { name: "Emergency", tel: "112" }, { name: "Children's Safety Line", tel: "116111" }, { name: "IPčko", tel: "116123" },
  ]},
  CZ: { country: "Czechia", flag: "🇨🇿", numbers: [
    { name: "Emergency", tel: "112" }, { name: "Safety Line", tel: "116111" }, { name: "First Psychological Help Line", tel: "116123" },
  ]},
  PL: { country: "Poland", flag: "🇵🇱", numbers: [
    { name: "Emergency", tel: "112" }, { name: "Telefon Zaufania dla Dzieci", tel: "116111" },
  ]},
  IN: { country: "India", flag: "🇮🇳", numbers: [
    { name: "Emergency", tel: "112" }, { name: "iCall", tel: "9152987821" }, { name: "Childline India", tel: "1098" },
  ]},
  ZA: { country: "South Africa", flag: "🇿🇦", numbers: [
    { name: "Emergency", tel: "112" }, { name: "Childline SA", tel: "0800055555" }, { name: "SADAG", tel: "0800567567" },
  ]},
  XX: { country: "International", flag: "🌍", numbers: [
    { name: "Emergency (EU)", tel: "112" }, { name: "Emergency (US)", tel: "911" },
    { name: "Crisis Text (US/UK/CA/IE)", tel: "741741", note: "Text HOME" },
  ]},
};

export function useSosCountry() {
  const qc = useQueryClient();
  const detected = useQuery({
    queryKey: ["safety-sos-country"],
    queryFn: async () => {
      // try cached
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pref } = await supabase.from("safety_sos_country_pref").select("country_code").eq("user_id", user.id).maybeSingle();
        if (pref?.country_code) return pref.country_code;
      }
      const cached = localStorage.getItem("sos_country");
      if (cached) return cached;
      try {
        const r = await fetch("https://ipapi.co/json/");
        const j = await r.json();
        const code = j.country_code || "XX";
        localStorage.setItem("sos_country", code);
        if (user) await supabase.from("safety_sos_country_pref").upsert({ user_id: user.id, country_code: code });
        return code;
      } catch { return "XX"; }
    },
  });
  const setCountry = useMutation({
    mutationFn: async (code: string) => {
      localStorage.setItem("sos_country", code);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("safety_sos_country_pref").upsert({ user_id: user.id, country_code: code });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safety-sos-country"] }),
  });
  const code = detected.data || "XX";
  const data = COUNTRY_HOTLINES[code] || COUNTRY_HOTLINES.XX;
  return { code, data, allCountries: COUNTRY_HOTLINES, setCountry, isLoading: detected.isLoading };
}
