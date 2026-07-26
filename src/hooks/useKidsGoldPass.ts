import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GoldPassStatus {
  hasGoldPass: boolean;
  loading: boolean;
  expiresAt: string | null;
}

export function useKidsGoldPass(): GoldPassStatus {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<GoldPassStatus>({
    hasGoldPass: false,
    loading: true,
    expiresAt: null,
  });

  const loadStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
      return;
    }

    setStatus((current) => ({ ...current, loading: true }));

    try {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setStatus({ hasGoldPass: true, loading: false, expiresAt: null });
        return;
      }

      const { data: cache, error: cacheError } = await (supabase as any)
        .from("kids_gold_pass_status")
        .select("active, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cacheError && cache) {
        setStatus({
          hasGoldPass: !!cache.active,
          loading: false,
          expiresAt: cache.current_period_end ?? null,
        });
        return;
      }

      const { data } = await supabase.functions.invoke("check-subscription", {
        body: { tier: "kids" },
      });

      setStatus({
        hasGoldPass: !!(data as any)?.subscribed,
        loading: false,
        expiresAt: (data as any)?.subscription_end ?? null,
      });
    } catch (error) {
      console.error("Kids Gold Pass status check failed", error);
      setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;

    loadStatus();

    if (!user?.id) return;

    const channel = supabase
      .channel(`kids-gold-pass-hook-${user.id}-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "kids_gold_pass_status", filter: `user_id=eq.${user.id}` },
        loadStatus,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, loadStatus, user?.id]);

  return status;
}
