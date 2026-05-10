import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type VerificationStatus = "worked" | "didnt_work";
export interface VerificationStats { worked: number; didnt_work: number; success_pct: number; }

export function useCouponVerifications(couponId: string, userId: string | null) {
  const { toast } = useToast();
  const [stats, setStats] = useState<VerificationStats>({ worked: 0, didnt_work: 0, success_pct: 0 });
  const [myStatus, setMyStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!couponId) return;
    const { data } = await supabase.rpc("coupon_verification_stats" as any, { p_coupon_id: couponId });
    const row: any = Array.isArray(data) ? data[0] : data;
    if (row) setStats({ worked: Number(row.worked || 0), didnt_work: Number(row.didnt_work || 0), success_pct: Number(row.success_pct || 0) });
    if (userId) {
      const { data: mine } = await supabase.from("coupon_verifications" as any)
        .select("status").eq("coupon_id", couponId).eq("user_id", userId).maybeSingle();
      setMyStatus(((mine as any)?.status as VerificationStatus) ?? null);
    }
  }, [couponId, userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const vote = useCallback(async (status: VerificationStatus) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await supabase.from("coupon_verifications" as any)
      .upsert({ coupon_id: couponId, user_id: userId, status }, { onConflict: "coupon_id,user_id" });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: status === "worked" ? "Marked as worked ✓" : "Marked as didn't work" });
    refresh();
  }, [couponId, userId, refresh, toast]);

  return { stats, myStatus, vote, loading, refresh };
}
