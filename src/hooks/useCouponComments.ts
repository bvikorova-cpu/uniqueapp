import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CouponComment {
  id: string;
  coupon_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  is_deleted: boolean;
  created_at: string;
}

export function useCouponComments(couponId: string, userId: string | null) {
  const { toast } = useToast();
  const [comments, setComments] = useState<CouponComment[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!couponId) return;
    setLoading(true);
    const { data } = await supabase.from("coupon_comments" as any)
      .select("*").eq("coupon_id", couponId).order("created_at", { ascending: true });
    setComments(((data as any) || []) as CouponComment[]);
    setLoading(false);
  }, [couponId]);

  useEffect(() => { refresh(); }, [refresh]);

  const post = useCallback(async (body: string, parent_id: string | null = null) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const trimmed = body.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("coupon_comments" as any)
      .insert({ coupon_id: couponId, user_id: userId, parent_id, body: trimmed.slice(0, 2000) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    refresh();
  }, [couponId, userId, refresh, toast]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("coupon_comments" as any).update({ is_deleted: true, body: "[deleted]" }).eq("id", id);
    refresh();
  }, [refresh]);

  return { comments, loading, post, remove, refresh };
}
