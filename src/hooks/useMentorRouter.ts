import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export async function mentorCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("mentor-router", { body: { action, ...payload } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const useMentorPremium = () =>
  useQuery({
    queryKey: ["mentor-premium"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("mentor-router", { body: { action: "premium.check" } });
      return data as { subscribed: boolean; plan?: string; current_period_end?: string };
    },
    refetchInterval: 60_000,
  });

export const useMentorCheckout = () =>
  useMutation({
    mutationFn: async (plan: "monthly" | "yearly") => {
      const { data, error } = await supabase.functions.invoke("mentor-router", { body: { action: "premium.checkout", plan } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      return data;
    },
    onError: (e: any) => toast.error(e?.message ?? "Checkout failed"),
  });

// Generic hook for any list action
export const useMentor = <T = any>(action: string, payload: Record<string, any> = {}, key?: any[]) =>
  useQuery({
    queryKey: ["mentor", action, ...(key ?? [])],
    queryFn: async () => mentorCall<T>(action, payload),
  });

export const useMentorMutation = <T = any>(action: string, invalidate?: string[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any> = {}) => mentorCall<T>(action, payload),
    onSuccess: () => {
      invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: ["mentor", k] }));
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
};
