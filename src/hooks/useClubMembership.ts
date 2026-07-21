import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ClubTier = "digital" | "physical";

export interface ClubMembership {
  id: string;
  user_id: string;
  member_number: number;
  tier: ClubTier;
  status: "active" | "past_due" | "canceled" | "pending";
  is_founding: boolean;
  current_period_end: string | null;
  shipping_status: "not_applicable" | "pending" | "shipped" | "delivered";
  shipping_address: any;
  card_pdf_url: string | null;
  started_at: string;
}

export function useClubMembership() {
  const [membership, setMembership] = useState<ClubMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setMembership(null);
        return;
      }
      const { data, error } = await supabase.functions.invoke("check-club-status");
      if (error) throw error;
      setMembership((data as any)?.membership ?? null);
    } catch (e) {
      console.error("[useClubMembership]", e);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCheckout = useCallback(async (tier: ClubTier, referralCode?: string) => {
    const { data, error } = await supabase.functions.invoke("create-club-checkout", {
      body: { tier, referralCode },
    });
    if (error) throw error;
    if ((data as any)?.url) window.location.href = (data as any).url;
  }, []);

  const openBillingPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("billing-portal");
    if (error) throw error;
    if ((data as any)?.url) window.location.href = (data as any).url;
  }, []);

  const isMember = membership?.status === "active";
  const isFounding = membership?.is_founding === true;

  return { membership, loading, isMember, isFounding, refresh, startCheckout, openBillingPortal };
}
