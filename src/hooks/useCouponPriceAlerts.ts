import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PriceAlert {
  id: string;
  store_name: string;
  max_price: number;
  min_discount_pct: number;
  is_active: boolean;
  created_at: string;
}

export function useCouponPriceAlerts(userId: string | null) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) { setAlerts([]); return; }
    setLoading(true);
    const { data } = await supabase.from("coupon_price_alerts" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setAlerts(((data as any) || []) as any);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (input: { store_name: string; max_price: number; min_discount_pct?: number }) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.from("coupon_price_alerts" as any).insert({ user_id: userId, ...input });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Alert created", description: `We'll notify you when ${input.store_name} drops below €${input.max_price}.` });
    refresh();
  }, [userId, toast, refresh]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("coupon_price_alerts" as any).delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggle = useCallback(async (id: string, is_active: boolean) => {
    await supabase.from("coupon_price_alerts" as any).update({ is_active }).eq("id", id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active } : a));
  }, []);

  return { alerts, loading, create, remove, toggle, refresh };
}
