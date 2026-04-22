import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin-only hook: refunds a Stripe payment via `admin-refund-payment`
 * edge function. Targets the central `payment_records` ledger row.
 */
export function useAdminRefund() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const refund = async (params: {
    paymentRecordId: string;
    amountCents?: number;
    reason?: "duplicate" | "fraudulent" | "requested_by_customer";
    adminNotes?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-refund-payment", {
        body: params,
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "Refund issued",
        description: `Stripe refund ${(data as any)?.refund_id ?? ""} created.`,
      });
      return data;
    } catch (e: any) {
      toast({
        title: "Refund failed",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { refund, loading };
}
