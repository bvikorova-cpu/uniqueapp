import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ClubTier = "digital" | "physical";

export interface ClubShippingAddressFields {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface ClubShippingAddress extends ClubShippingAddressFields {
  name?: string | null;
  phone?: string | null;
  address?: ClubShippingAddressFields | null;
}

export interface ClubMembership {
  id: string;
  user_id: string;
  member_number: number;
  tier: ClubTier;
  status: "active" | "past_due" | "canceled" | "pending";
  is_founding: boolean;
  current_period_end: string | null;
  shipping_status: "not_applicable" | "pending" | "shipped" | "delivered";
  shipping_address: ClubShippingAddress | null;
  recipient_name: string | null;
  phone: string | null;
  shipping_note: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  card_pdf_url: string | null;
  started_at: string;
}

interface CheckClubStatusResponse {
  membership: ClubMembership | null;
}

interface CheckoutUrlResponse {
  url?: string;
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
      const { data, error } = await supabase.functions.invoke<CheckClubStatusResponse>("check-club-status");
      if (error) throw error;
      setMembership(data?.membership ?? null);
    } catch (e) {
      console.error("[useClubMembership]", e);
      const { reportError } = await import("@/lib/errorReporter");
      void reportError(e, { source: "club.check-status" });
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCheckout = useCallback(async (tier: ClubTier, options?: StartCheckoutOptions) => {
    const { data, error } = await supabase.functions.invoke<CheckoutUrlResponse>("create-club-checkout", {
      body: { tier, referralCode: options?.referralCode },
    });
    if (error) throw error;
    const url = data?.url;
    if (!url) throw new Error("Stripe checkout URL was not returned.");
    if (options?.open !== false) {
      openStripeCheckout(url, options?.targetWindow);
    }
    return url;
  }, []);

  const openBillingPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke<CheckoutUrlResponse>("billing-portal");
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
  }, []);

  const isMember = membership?.status === "active";
  const isFounding = membership?.is_founding === true;

  return { membership, loading, isMember, isFounding, refresh, startCheckout, openBillingPortal };
}
