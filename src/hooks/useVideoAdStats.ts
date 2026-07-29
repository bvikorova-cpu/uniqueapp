import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoAdStats {
  adsCreated: number;
  dayStreak: number;
  creditsUsed: number;
  tier: string;
}

const calcStreak = (dates: string[]): number => {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  if (days.size === 0) return 0;

  const today = new Date();
  const key = (d: Date) => d.toISOString().slice(0, 10);

  // streak may start today or yesterday
  let cursor = new Date(today);
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(key(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const useVideoAdStats = () => {
  return useQuery({
    queryKey: ["video-ad-stats"],
    queryFn: async (): Promise<VideoAdStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { adsCreated: 0, dayStreak: 0, creditsUsed: 0, tier: "free" };

      const [historyRes, creditsRes] = await Promise.all([
        supabase
          .from("video_ad_history")
          .select("created_at, credits_used")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("video_ad_credits")
          .select("tier")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const rows = historyRes.data || [];

      return {
        adsCreated: rows.length,
        dayStreak: calcStreak(rows.map((r) => r.created_at)),
        creditsUsed: rows.reduce((sum, r) => sum + (r.credits_used || 0), 0),
        tier: creditsRes.data?.tier || "free",
      };
    },
    staleTime: 30_000,
  });
};
