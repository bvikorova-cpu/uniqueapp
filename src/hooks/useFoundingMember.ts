import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FoundingMemberState {
  memberNumber: number | null;
  isFoundingMember: boolean;
  remaining: number;
  loading: boolean;
}

/**
 * Live state for the Founding Members programme (first 100 members).
 * - `memberNumber`/`isFoundingMember`: status of the current authenticated user.
 * - `remaining`: how many of the 100 slots are still available (public).
 */
export function useFoundingMember(): FoundingMemberState & { claim: () => Promise<{ ok: boolean; reason?: string; memberNumber?: number }>; refresh: () => Promise<void> } {
  const { user } = useAuth();
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [remainingRes, mineRes] = await Promise.all([
        (supabase as any).rpc?.("founding_members_remaining"),
        user
          ? (supabase as any)
              .from("founding_members")
              .select("member_number")
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (remainingRes && typeof remainingRes.data === "number") {
        setRemaining(remainingRes.data);
      }
      setMemberNumber(mineRes?.data?.member_number ?? null);
    } catch {
      // soft fail — non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claim = useCallback(async () => {
    if (!user) return { ok: false, reason: "auth_required" as const };
    const rpc = (supabase as any).rpc;
    if (typeof rpc !== "function") return { ok: false, reason: "unavailable" };
    const { data, error } = await rpc.call(supabase, "claim_founding_member");
    if (error) return { ok: false, reason: error.message };
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.full_cohort) return { ok: false, reason: "cohort_full" };
    if (row?.already_claimed) {
      setMemberNumber(row.member_number);
      return { ok: true, memberNumber: row.member_number };
    }
    if (row?.member_number) {
      setMemberNumber(row.member_number);
      setRemaining((r) => Math.max(0, r - 1));
      return { ok: true, memberNumber: row.member_number };
    }
    return { ok: false, reason: "unknown" };
  }, [user]);

  return { memberNumber, isFoundingMember: memberNumber != null, remaining, loading, claim, refresh };
}
