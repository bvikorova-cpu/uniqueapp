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
  recipient_name: string | null;
  phone: string | null;
  shipping_note: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  card_pdf_url: string | null;
  started_at: string;
}

interface StartCheckoutOptions {
  referralCode?: string;
  targetWindow?: Window | null;
  open?: boolean;
}

export function openStripeCheckout(url: string, targetWindow?: Window | null) {
  if (targetWindow && !targetWindow.closed) {
    try {
      targetWindow.location.assign(url);
      targetWindow.focus();
      return;
    } catch {
      // Fall back to the current tab below.
    }
  }

  try {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) return;
  } catch {
    // Fall back to same-tab navigation below.
  }

  window.location.assign(url);
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

  const startCheckout = useCallback(async (tier: ClubTier, options?: StartCheckoutOptions) => {
    const { data, error } = await supabase.functions.invoke("create-club-checkout", {
      body: { tier, referralCode: options?.referralCode },
    });
    if (error) throw error;
    const url = (data as any)?.url;
    if (!url) throw new Error("Stripe checkout URL was not returned.");
    if (options?.open !== false) {
      openStripeCheckout(url, options?.targetWindow);
    }
    return url as string;
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
