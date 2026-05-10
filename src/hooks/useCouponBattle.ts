import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BattleCoupon {
  id: string; title: string; store_name: string;
  original_value: number; selling_price: number;
  image_url: string | null; category: string;
}

export function useCouponBattle() {
  const [pair, setPair] = useState<[BattleCoupon, BattleCoupon] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPair = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("coupon_battle_pair" as any);
    const rows = ((data as any) || []) as BattleCoupon[];
    setPair(rows.length === 2 ? [rows[0], rows[1]] : null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPair(); }, [fetchPair]);

  const vote = useCallback(async (winnerId: string, userId: string | null) => {
    if (!userId || !pair) return;
    await supabase.from("coupon_battle_votes" as any).insert({
      user_id: userId,
      coupon_a: pair[0].id,
      coupon_b: pair[1].id,
      winner: winnerId,
    });
    // Add upvote to winner so it boosts the hot ranking
    await supabase.from("coupon_votes" as any).upsert(
      { coupon_id: winnerId, user_id: userId, value: 1 },
      { onConflict: "coupon_id,user_id" }
    );
    fetchPair();
  }, [pair, fetchPair]);

  return { pair, loading, vote, refresh: fetchPair };
}
