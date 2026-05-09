import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCouponWishlist(userId: string | null) {
  const { toast } = useToast();
  const [items, setItems] = useState<{ id: string; coupon_id: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase.from("coupon_wishlist" as any).select("id, coupon_id").eq("user_id", userId);
    setItems(((data as any) || []) as any);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const isWishlisted = useCallback((couponId: string) => items.some(i => i.coupon_id === couponId), [items]);

  const toggle = useCallback(async (couponId: string) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const existing = items.find(i => i.coupon_id === couponId);
    if (existing) {
      await supabase.from("coupon_wishlist" as any).delete().eq("id", existing.id);
      setItems(prev => prev.filter(i => i.id !== existing.id));
    } else {
      const { data, error } = await supabase.from("coupon_wishlist" as any).insert({ user_id: userId, coupon_id: couponId }).select("id, coupon_id").single();
      if (!error && data) setItems(prev => [...prev, data as any]);
      else if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [items, userId, toast]);

  return { items, isWishlisted, toggle, refresh, loading };
}
