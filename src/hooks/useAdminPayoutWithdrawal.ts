import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PayoutKind =
  | "instructor"
  | "musician"
  | "masterchef"
  | "influencer"
  | "auction"
  | "referral"
  | "campaign";

/**
 * Admin-only hook: pays out a withdrawal request via Stripe Connect transfer.
 * On approve → creates a `transfers.create` to the creator's Connect account
 * and marks the withdrawal `completed`.
 * On reject  → marks the withdrawal `rejected`.
 */
export function useAdminPayoutWithdrawal() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const run = async (params: {
    kind: PayoutKind;
    withdrawalId: string;
    action: "approve" | "reject";
    adminNotes?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-payout-withdrawal", {
        body: params,
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title:
          params.action === "approve"
            ? "Payout sent via Stripe"
            : "Withdrawal rejected",
        description:
          params.action === "approve"
            ? `Transfer ${(data as any)?.transfer_id ?? ""} created.`
            : "The creator has been notified.",
      });
      return data;
    } catch (e: any) {
      toast({
        title: "Payout failed",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading };
}
