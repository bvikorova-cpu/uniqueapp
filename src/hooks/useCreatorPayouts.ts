import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PayoutKind =
  | "musician"
  | "masterchef"
  | "instructor"
  | "influencer"
  | "auction"
  | "referral"
  | "campaign";

export interface PayoutRow {
  id: string;
  kind: PayoutKind;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  stripe_transfer_id?: string | null;
}

interface KindConfig {
  table: string;
  userIdCol: string;
  label: string;
}

const KIND_CONFIG: Record<PayoutKind, KindConfig> = {
  musician: { table: "musician_withdrawal_requests", userIdCol: "musician_id", label: "Musician" },
  masterchef: { table: "masterchef_withdrawal_requests", userIdCol: "chef_id", label: "Masterchef" },
  instructor: { table: "instructor_withdrawal_requests", userIdCol: "instructor_id", label: "Instructor" },
  influencer: { table: "influencer_withdrawal_requests", userIdCol: "influencer_id", label: "Influencer" },
  auction: { table: "auction_withdrawal_requests", userIdCol: "seller_id", label: "Auctions" },
  referral: { table: "referral_withdrawal_requests", userIdCol: "referrer_id", label: "Referrals" },
  campaign: { table: "withdrawal_requests", userIdCol: "creator_id", label: "Campaigns" },
};

export const KIND_LABELS = Object.fromEntries(
  Object.entries(KIND_CONFIG).map(([k, v]) => [k, v.label]),
) as Record<PayoutKind, string>;

/**
 * Loads withdrawal history for the logged-in creator across ALL 7 payout types.
 * Computes totals: pending, paid, rejected.
 */
export function useCreatorPayouts() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        (Object.keys(KIND_CONFIG) as PayoutKind[]).map(async (kind) => {
          const cfg = KIND_CONFIG[kind];
          const { data, error } = await (supabase as any)
            .from(cfg.table)
            .select(`id, amount, status, created_at, processed_at, admin_notes, stripe_transfer_id`)
            .eq(cfg.userIdCol, user.id)
            .order("created_at", { ascending: false })
            .limit(50);
          if (error) {
            console.warn(`[useCreatorPayouts] ${cfg.table}:`, error.message);
            return [];
          }
          return (data || []).map((r: any) => ({ ...r, kind }) as PayoutRow);
        }),
      );
      const flat = results
        .flat()
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      setRows(flat);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totals = rows.reduce(
    (acc, r) => {
      const amt = Number(r.amount) || 0;
      const s = (r.status || "").toLowerCase();
      if (s === "pending" || s === "processing") acc.pending += amt;
      else if (s === "completed" || s === "paid" || s === "approved") acc.paid += amt;
      else if (s === "rejected" || s === "failed") acc.rejected += amt;
      return acc;
    },
    { pending: 0, paid: 0, rejected: 0 },
  );

  return { rows, totals, loading, error, refetch: fetchAll };
}
