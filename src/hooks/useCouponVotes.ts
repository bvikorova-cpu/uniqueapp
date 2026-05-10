import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCouponVotes(couponId: string, userId: string | null) {
  const { toast } = useToast();
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);
  const [myVote, setMyVote] = useState<-1 | 1 | 0>(0);

  const refresh = useCallback(async () => {
    if (!couponId) return;
    const { data } = await supabase.from("coupon_votes" as any).select("value").eq("coupon_id", couponId);
    const rows = ((data as any) || []) as { value: number }[];
    setUp(rows.filter(r => r.value === 1).length);
    setDown(rows.filter(r => r.value === -1).length);
    if (userId) {
      const mine = rows.find((_, i) => false); // can't filter by user via above; do separate query
      const { data: m } = await supabase.from("coupon_votes" as any).select("value").eq("coupon_id", couponId).eq("user_id", userId).maybeSingle();
      setMyVote((((m as any)?.value) ?? 0) as -1 | 1 | 0);
    } else setMyVote(0);
  }, [couponId, userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const cast = useCallback(async (value: 1 | -1) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (myVote === value) {
      await supabase.from("coupon_votes" as any).delete().eq("coupon_id", couponId).eq("user_id", userId);
    } else {
      await supabase.from("coupon_votes" as any).upsert({ coupon_id: couponId, user_id: userId, value }, { onConflict: "coupon_id,user_id" });
    }
    refresh();
  }, [couponId, userId, myVote, refresh, toast]);

  return { up, down, myVote, cast, score: up - down };
}
