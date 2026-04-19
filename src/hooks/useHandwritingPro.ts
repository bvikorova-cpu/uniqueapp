import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// All 8 tools are routed through a single edge function "handwriting-ai"
// using { action, ...payload } to stay within the function-slot quota.
const ROUTED: Record<string, string> = {
  "handwriting-signature-analyzer": "signature",
  "handwriting-compatibility": "compatibility",
  "handwriting-mood-tracker": "mood",
  "handwriting-forgery-detector": "forgery",
  "handwriting-twin-finder": "twin",
  "handwriting-famous-comparison": "famous",
  "handwriting-academy": "academy",
  "handwriting-pdf-report": "pdf-report",
};

const invoke = async (fn: string, body: any) => {
  const action = ROUTED[fn];
  const payload = action
    ? (fn === "handwriting-academy"
        ? { action, subAction: body?.action, ...body }
        : { action, ...body })
    : body;
  const { data, error } = await supabase.functions.invoke(
    action ? "handwriting-ai" : fn,
    { body: payload },
  );
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
};

const handleErr = (e: Error) => {
  const m = e.message || "";
  if (m.includes("Insufficient")) toast.error("Not enough credits — top up to continue.");
  else if (m.includes("Rate limited")) toast.error("Too many requests, slow down.");
  else if (m.includes("AI credits")) toast.error("AI workspace credits exhausted.");
  else toast.error(m || "Something went wrong");
};

export function useSignatureAnalyzer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageUrl: string }) => invoke("handwriting-signature-analyzer", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      qc.invalidateQueries({ queryKey: ["signature-analyses"] });
      toast.success("Signature analyzed");
    },
    onError: handleErr,
  });
}

export function useCompatibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageAUrl: string; imageBUrl: string; context?: string }) =>
      invoke("handwriting-compatibility", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Compatibility report ready");
    },
    onError: handleErr,
  });
}

export function useMoodTracker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageUrl: string; notes?: string }) =>
      invoke("handwriting-mood-tracker", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      qc.invalidateQueries({ queryKey: ["mood-scans"] });
      toast.success("Mood scan recorded");
    },
    onError: handleErr,
  });
}

export function useMoodHistory() {
  return useQuery({
    queryKey: ["mood-scans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("handwriting_mood_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("scan_date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });
}

export function useForgeryDetector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { referenceUrl: string; suspectUrl: string }) =>
      invoke("handwriting-forgery-detector", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Forensic check complete");
    },
    onError: handleErr,
  });
}

export function useTwinFinder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageUrl: string; displayName: string; isPublic?: boolean }) =>
      invoke("handwriting-twin-finder", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Twin search complete");
    },
    onError: handleErr,
  });
}

export function useFamousComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { imageUrl: string }) => invoke("handwriting-famous-comparison", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Famous match found");
    },
    onError: handleErr,
  });
}

export function useAcademy() {
  const qc = useQueryClient();
  const progress = useQuery({
    queryKey: ["academy-progress"],
    queryFn: async () => {
      const { data } = await invoke("handwriting-academy", { action: "list" }) as any;
      return data?.progress ?? (data?.progress === undefined ? [] : data.progress);
    },
  });
  const generateQuiz = useMutation({
    mutationFn: (vars: { lessonId: string }) =>
      invoke("handwriting-academy", { action: "generate-quiz", lessonId: vars.lessonId }),
    onError: handleErr,
  });
  const completeLesson = useMutation({
    mutationFn: (vars: { lessonId: string; quizScore: number }) =>
      invoke("handwriting-academy", { action: "complete", ...vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-progress"] });
      toast.success("Lesson complete · XP earned");
    },
    onError: handleErr,
  });
  return { progress, generateQuiz, completeLesson };
}

export function usePdfReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { analysisId: string; source?: string }) =>
      invoke("handwriting-pdf-report", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Forensic PDF ready");
    },
    onError: handleErr,
  });
}
