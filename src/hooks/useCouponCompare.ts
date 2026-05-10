import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompareCoupon {
  id: string; title: string; store_name: string; selling_price: number;
  original_value: number; expiry_date: string | null; image_url: string | null;
}

export function useCouponCompare(userId: string | null) {
  const { toast } = useToast();
  const [ids, setIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) { setIds([]); return; }
    const { data } = await supabase.from("coupon_compare_sessions" as any).select("coupon_ids").eq("user_id", userId).maybeSingle();
    setIds((((data as any)?.coupon_ids) ?? []) as string[]);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (id: string) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const next = ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id].slice(-4);
    if (!ids.includes(id) && ids.length >= 4) {
      toast({ title: "Compare full", description: "Max 4 coupons. Removed oldest." });
    }
    setIds(next);
    await supabase.from("coupon_compare_sessions" as any)
      .upsert({ user_id: userId, coupon_ids: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }, [ids, userId, toast]);

  const clear = useCallback(async () => {
    if (!userId) return;
    setIds([]);
    await supabase.from("coupon_compare_sessions" as any).delete().eq("user_id", userId);
  }, [userId]);

  return { ids, toggle, clear, isComparing: (id: string) => ids.includes(id) };
}
