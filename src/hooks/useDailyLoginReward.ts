import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LoginStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_claim_date: string | null;
  total_claims: number;
}

export function useDailyLoginReward() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<LoginStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("user_login_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setStreak((data as LoginStreak) ?? null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Use Europe/Bratislava date so the day flips at local midnight, matching the RPC.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bratislava",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const canClaim = !streak || streak.last_claim_date !== today;

  const claim = async () => {
    if (!user) return null;
    setClaiming(true);
    try {
      const { data, error } = await (supabase as any).rpc("claim_daily_login_reward");
      if (error) throw error;
      await fetchStreak();
      return data as {
        claimed: boolean;
        streak: number;
        bonus?: number;
        reason?: string;
        was_reset?: boolean;
        missed_days?: number;
      };
    } finally {
      setClaiming(false);
    }
  };

  return { streak, loading, claiming, canClaim, claim, refetch: fetchStreak };
}
