import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eduCall } from "./useEducationRouter";
import { toast } from "sonner";

export const useDailyChallenge = () => {
  return useQuery({
    queryKey: ["daily-challenge"],
    queryFn: async () => eduCall<{ challenge: any; completed: boolean; score: number | null }>("daily.today"),
  });
};

export const useSubmitDaily = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, score }: { challengeId: string; score: number }) =>
      eduCall<{ ok: boolean; xp_awarded: number; streak: number }>("daily.submit", { challenge_id: challengeId, score }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["daily-challenge"] });
      qc.invalidateQueries({ queryKey: ["education-stats"] });
      qc.invalidateQueries({ queryKey: ["league"] });
      toast.success(`+${data.xp_awarded} XP`);
    },
  });
};

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: all }, { data: mine }] = await Promise.all([
        supabase.from("education_achievements").select("*").order("xp_reward"),
        user
          ? supabase.from("education_user_achievements").select("achievement_id, unlocked_at").eq("user_id", user.id)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const unlocked = new Set((mine ?? []).map((m: any) => m.achievement_id));
      return (all ?? []).map((a: any) => ({ ...a, unlocked: unlocked.has(a.id) }));
    },
  });
};

export const useCheckAchievements = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => eduCall<{ newly_unlocked: any[] }>("achievement.check"),
    onSuccess: (data) => {
      const count = data?.newly_unlocked?.length ?? 0;
      if (count > 0) {
        data.newly_unlocked.forEach((a) => toast.success(`🏆 Unlocked: ${a.title}`));
        qc.invalidateQueries({ queryKey: ["achievements"] });
        qc.invalidateQueries({ queryKey: ["education-stats"] });
      } else {
        toast.info("No new achievements yet — keep learning!");
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to check achievements"),
  });
};

export const useLeague = (tier = "bronze") => {
  return useQuery({
    queryKey: ["league", tier],
    queryFn: async () => eduCall<{ rows: any[]; week_start: string; tier: string }>("league.top", { tier }),
  });
};

export const useCertificates = () => {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("education_certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      return data ?? [];
    },
  });
};

export const useIssueCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { course_title: string; score: number; recipient_name?: string; course_id?: string }) =>
      eduCall<{ certificate: any }>("cert.issue", p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate issued!");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
};
