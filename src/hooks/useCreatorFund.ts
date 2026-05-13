import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorFundData {
  user_id: string;
  show_total_earned: boolean;
  show_subscriber_count: boolean;
  show_tip_count: boolean;
  total_earned_eur: number;
  subscriber_count: number;
  tip_count: number;
}

export function useCreatorFund(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  const [data, setData] = useState<CreatorFundData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    const { data: row } = await (supabase as any)
      .from("creator_fund_visibility")
      .select("*")
      .eq("user_id", targetId)
      .maybeSingle();
    setData((row as CreatorFundData) ?? null);
    setLoading(false);
  }, [targetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSettings = async (
    patch: Partial<Pick<CreatorFundData, "show_total_earned" | "show_subscriber_count" | "show_tip_count">>,
  ) => {
    if (!user) return;
    await (supabase as any)
      .from("creator_fund_visibility")
      .upsert({ user_id: user.id, ...patch });
    await fetchData();
  };

  return { data, loading, updateSettings, refetch: fetchData };
}
