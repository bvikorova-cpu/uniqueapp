import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConnectStatus = "none" | "pending" | "active" | "error" | "restricted";

export interface StripeConnectStatus {
  connected: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

export interface StripeLiveStatus {
  connected: boolean;
  account_id?: string;
  account_type?: string;
  country?: string;
  default_currency?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  disabled_reason?: string | null;
  currently_due?: string[];
  past_due?: string[];
  eventually_due?: string[];
  capabilities?: Record<string, string>;
  payout_schedule?: { interval?: string; delay_days?: number; weekly_anchor?: string; monthly_anchor?: number } | null;
  balance?: {
    available?: { amount: number; currency: string }[];
    pending?: { amount: number; currency: string }[];
    instant_available?: { amount: number; currency: string }[] | null;
  } | null;
  recent_payouts?: { id: string; amount: number; currency: string; status: string; arrival_date: number }[];
  synced_at?: string;
}

function mapToStatusString(data: any): ConnectStatus {
  if (data?.error) return "error";
  if (!data?.has_account) return "none";
  if (data?.payouts_enabled && data?.charges_enabled) return "active";
  return "pending";
}

export function useStripeConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invokeStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("stripe-connect-status");
    if (error) throw error;
    return data;
  }, []);

  const getStatus = useCallback(async (): Promise<ConnectStatus> => {
    try {
      const data = await invokeStatus();
      return mapToStatusString(data);
    } catch (e) {
      console.error("Connect status check failed", e);
      return "error";
    }
  }, [invokeStatus]);

  const checkStatus = useCallback(async (): Promise<StripeConnectStatus> => {
    try {
      const data = await invokeStatus();
      return {
        connected: !!data?.has_account,
        charges_enabled: !!data?.charges_enabled,
        payouts_enabled: !!data?.payouts_enabled,
        details_submitted: !!data?.onboarding_complete,
      };
    } catch (e) {
      console.error("checkStatus failed", e);
      return { connected: false };
    }
  }, [invokeStatus]);

  const liveStatus = useCallback(async (): Promise<StripeLiveStatus | null> => {
    try {
      const data = await invokeStatus();
      if (!data?.has_account) return null;
      const req = data?.requirements || {};
      return {
        connected: true,
        account_id: data?.account_id,
        charges_enabled: !!data?.charges_enabled,
        payouts_enabled: !!data?.payouts_enabled,
        details_submitted: !!data?.onboarding_complete,
        disabled_reason: req?.disabled_reason ?? null,
        currently_due: req?.currently_due ?? [],
        past_due: req?.past_due ?? [],
        eventually_due: req?.eventually_due ?? [],
      };
    } catch (e) {
      console.error("liveStatus failed", e);
      return null;
    }
  }, [invokeStatus]);

  const createAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account", { body: {} });
      if (error) throw error;
      return data?.account_id || null;
    } catch (e: any) {
      setError(e?.message || "Failed to create Stripe account");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startOnboarding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", {
        body: { return_url: window.location.href },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (e: any) {
      setError(e?.message || "Stripe onboarding failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const openDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-dashboard");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("No dashboard URL returned");
      }
    } catch (e: any) {
      setError(e?.message || "Stripe dashboard login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getStatus,
    checkStatus,
    liveStatus,
    createAccount,
    startOnboarding,
    openDashboard,
    loading,
    error,
  };
}
