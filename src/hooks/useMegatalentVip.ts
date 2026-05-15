import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMegatalentVip() {
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setIsVip(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke(
        "check-megatalent-vip",
      );
      if (error) throw error;
      setIsVip(!!(data as any)?.is_vip);
    } catch (e) {
      console.error("vip check failed", e);
      setIsVip(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCheckout = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke(
      "create-megatalent-vip-checkout",
    );
    if (error) throw error;
    if ((data as any)?.url) window.location.href = (data as any).url;
  }, []);

  return { isVip, loading, refresh, startCheckout };
}
