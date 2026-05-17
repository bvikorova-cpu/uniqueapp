import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeAction<T = any>(action: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("wellness-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export function useCBTReframer() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-cbt"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_cbt_reframes")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const reframe = useMutation({
    mutationFn: (vars: { situation: string; negative_thought: string; emotion?: string; intensity_before?: number }) =>
      invokeAction("cbt", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-cbt"] }); toast.success("Thought reframed"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, reframe };
}

export function useMHAssessment() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-mh"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_mh_assessments")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const submit = useMutation({
    mutationFn: (vars: { assessment_type: "phq9" | "gad7" | "pss10" | "wellbeing"; answers: number[]; total_score: number }) =>
      invokeAction("mh_assess", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-mh"] }); toast.success("Assessment complete"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, submit };
}

export function useWalkingMeditation() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-walking"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_walking_meditations")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const generate = useMutation({
    mutationFn: (vars: { intention: string; environment?: string; duration_minutes?: number; voice_id?: string }) =>
      invokeAction("walking", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-walking"] }); toast.success("Walking meditation ready"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, generate };
}

export function useStressCheckins() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-stress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_stress_checkins")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
      return data || [];
    },
  });
  const log = useMutation({
    mutationFn: async (vars: { stress_level: number; energy_level?: number; note?: string; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("wellness_stress_checkins")
        .insert({ user_id: user.id, ...vars }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-stress"] }); toast.success("Check-in logged"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, log };
}

export function usePomodoro() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-pomo"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_pomodoro_sessions")
        .select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const start = useMutation({
    mutationFn: async (vars: { task: string; duration_minutes: number; break_minutes?: number; ambience?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("wellness_pomodoro_sessions")
        .insert({ user_id: user.id, ...vars }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wellness-pomo"] }),
  });
  const complete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wellness_pomodoro_sessions")
        .update({ completed: true, completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-pomo"] }); toast.success("Focus session complete"); },
  });
  return { items: list.data || [], isLoading: list.isLoading, start, complete };
}

export function useSoundscapePresets() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-sound"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_soundscape_presets")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
  const save = useMutation({
    mutationFn: async (vars: { name: string; layers: { id: string; volume: number }[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("wellness_soundscape_presets")
        .insert({ user_id: user.id, name: vars.name, layers: vars.layers }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-sound"] }); toast.success("Mix saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wellness_soundscape_presets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wellness-sound"] }),
  });
  return { items: list.data || [], isLoading: list.isLoading, save, remove };
}

export function useWakeAlarms() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-alarms"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_wake_alarms")
        .select("*").eq("user_id", user.id).order("time_of_day", { ascending: true });
      return data || [];
    },
  });
  const upsert = useMutation({
    mutationFn: async (vars: { id?: string; label?: string; time_of_day: string; days_of_week?: number[]; soundscape?: string; enabled?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      if (vars.id) {
        const { error } = await supabase.from("wellness_wake_alarms").update(vars).eq("id", vars.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wellness_wake_alarms").insert({ user_id: user.id, ...vars });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-alarms"] }); toast.success("Alarm saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wellness_wake_alarms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wellness-alarms"] }),
  });
  return { items: list.data || [], isLoading: list.isLoading, upsert, remove };
}

export function useGroupSessions() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-groups"],
    queryFn: async () => {
      const { data } = await supabase.from("wellness_group_sessions")
        .select("*").eq("status", "scheduled").gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true }).limit(20);
      return data || [];
    },
  });
  const create = useMutation({
    mutationFn: async (vars: { title: string; description?: string; starts_at: string; duration_minutes?: number; category?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("wellness_group_sessions")
        .insert({ host_id: user.id, ...vars }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-groups"] }); toast.success("Session scheduled"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rsvp = useMutation({
    mutationFn: async (session_id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("wellness_group_attendees")
        .insert({ session_id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-groups"] }); toast.success("You're in"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { items: list.data || [], isLoading: list.isLoading, create, rsvp };
}
