import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export async function mentorCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("mentor-router", { body: { action, ...payload } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export type MentorArea = "career" | "fitness" | "mindset" | "relationships";
export type MentorAreaSub = { subscribed: boolean; plan?: "monthly" | "yearly"; current_period_end?: string; subscription_id?: string };

export const useMentorPremium = (area?: MentorArea) =>
  useQuery({
    queryKey: ["mentor-premium", area ?? "all"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("mentor-router", { body: { action: "premium.check", area } });
      return data as { subscribed: boolean; plan?: "monthly" | "yearly"; current_period_end?: string; areas: Record<string, MentorAreaSub> };
    },
    refetchInterval: 60_000,
  });

export const useMentorCheckout = () =>
  useMutation({
    mutationFn: async (vars: { plan: "monthly" | "yearly"; area: MentorArea }) => {
      const { data, error } = await supabase.functions.invoke("mentor-router", { body: { action: "premium.checkout", plan: vars.plan, area: vars.area } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
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
