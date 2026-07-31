import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConnectStatus = "none" | "pending" | "active" | "error" | "restricted";

export function useStripeConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = useCallback(async (): Promise<ConnectStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-status");
      if (error) throw error;
      return (data?.status as ConnectStatus) || "none";
    } catch (e) {
      console.error("Connect status check failed", e);
      return "none";
    }
  }, []);

  const createAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account", {
        body: {},
      });
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
    createAccount,
    startOnboarding,
    openDashboard,
    loading,
    error,
  };
}
