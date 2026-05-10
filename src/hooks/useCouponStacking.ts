import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCouponStacking() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = async (coupon_ids: string[], cart_total?: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("coupon-stacking-calc", {
        body: { coupon_ids, cart_total },
      });
      if (error) throw error;
      if (data?.error === "insufficient_credits") {
        toast.error("Need 3 AI credits to run stacking calculator.");
        return null;
      }
      setResult(data);
      return data;
    } catch (e: any) {
      toast.error(e.message ?? "Stacking failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, calculate };
}
