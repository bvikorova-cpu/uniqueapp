import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeAction<T = any>(action: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("wellness-ai", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// 1. Dream Interpreter
export function useDreamInterpreter() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-dreams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_dream_interpretations")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const interpret = useMutation({
    mutationFn: (dream_text: string) => invokeAction("dream", { dream_text }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-dreams"] }); toast.success("Dream interpreted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { dreams: list.data || [], isLoading: list.isLoading, interpret };
}

// 2. Personalized Meditation
export function usePersonalizedMeditation() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-pers-meditations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_personalized_meditations")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const generate = useMutation({
    mutationFn: (vars: { topic: string; duration_minutes?: number; voice_id?: string }) =>
      invokeAction("meditation", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-pers-meditations"] }); toast.success("Meditation generated"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { meditations: list.data || [], isLoading: list.isLoading, generate };
}

// 3. Mood Mirror
export function useMoodMirror() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-mood-mirror"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_mood_mirror")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });
  const analyze = useMutation({
    mutationFn: (selfie_data_url: string) => invokeAction("mood", { selfie_data_url }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-mood-mirror"] }); toast.success("Mood analyzed"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { history: list.data || [], isLoading: list.isLoading, analyze };
}

// 4. AI Sleep Story
export function useAiSleepStory() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["wellness-ai-sleep"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("wellness_ai_sleep_stories")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });
  const generate = useMutation({
    mutationFn: (vars: { theme: string; protagonist?: string; setting?: string; duration_minutes?: number; voice_id?: string }) =>
      invokeAction("sleep", vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wellness-ai-sleep"] }); toast.success("Sleep story ready"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { stories: list.data || [], isLoading: list.isLoading, generate };
}
