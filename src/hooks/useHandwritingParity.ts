import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const invoke = async (action: string, payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("handwriting-ai", {
    body: { action, ...payload },
  });
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

const mk = (action: string, successMsg: string) => () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) => invoke(action, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success(successMsg);
    },
    onError: handleErr,
  });
};

export const useZoneAnalysis = mk("zone-analysis", "Zone analysis ready");
export const useLetterDecoder = mk("letter-decoder", "Letter decoder ready");
export const useCareerMatch = mk("career-match", "Career match ready");
export const useHealthScreen = mk("health-screen", "Wellness screen ready");
export const useMentalScreen = mk("mental-screen", "Resilience screen ready");
export const useCoachPlan = mk("coach-plan", "7-day plan ready");
export const useForensicProfile = mk("forensic-profile", "Forensic profile ready");
export const useCulturalMatch = mk("cultural-match", "Cultural match ready");
