import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export async function kidsHubCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("kids-academy-router", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const KIDS_HUB_COSTS = {
  dailyPlan: 3,
  recommendations: 2,
  parentDigest: 3,
} as const;

export function useKidsAcademyCredits() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kids-academy-credits", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const res = await kidsHubCall<{ credits: number }>("hub.credits").catch(() => ({ credits: 0 }));
      return res.credits ?? 0;
    },
    enabled: !!user,
  });
  const purchase = async (credits: number) => {
    const { data: res, error } = await supabase.functions.invoke("create-checkout", {
      body: { credits, creditType: "kids_academy" },
    });
    if (error || !res?.url) { toast.error("Failed to start checkout"); return null; }
    return res.url as string;
  };
  return {
    balance: data ?? 0,
    isLoading,
    refresh: () => { qc.invalidateQueries({ queryKey: ["kids-academy-credits"] }); refetch(); },
    purchase,
  };
}

export function useKidsAcademyXP(childId?: string | null) {
  return useQuery({
    queryKey: ["kids-academy-xp", childId],
    queryFn: async () => {
      if (!childId) return null;
      const res = await kidsHubCall<{ xp: any }>("hub.xp", { child_id: childId });
      return res.xp;
    },
    enabled: !!childId,
  });
}

export function useKidsFamilyLeaderboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["kids-family-leaderboard", user?.id],
    queryFn: async () => {
      const res = await kidsHubCall<{ leaderboard: any[] }>("hub.familyLeaderboard");
      return res.leaderboard ?? [];
    },
    enabled: !!user,
  });
}

export function useKidsDailyPlan(childId?: string | null) {
  return useQuery({
    queryKey: ["kids-daily-plan", childId, new Date().toISOString().slice(0, 10)],
    queryFn: async () => {
      if (!childId) return null;
      // Try fetch existing first via dailyPlan (server returns existing without re-charging)
      const res = await kidsHubCall<{ plan: any }>("hub.dailyPlan", { child_id: childId });
      return res.plan;
    },
    enabled: false, // generate on demand
  });
}
