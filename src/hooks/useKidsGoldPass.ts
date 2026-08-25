import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GoldPassStatus {
  hasGoldPass: boolean;
  loading: boolean;
  expiresAt: string | null;
}

/**
 * Kids Gold Pass was retired — the Kids Channel is fully credit-based
 * (unified `ai_credits`). This hook is kept for backwards compatibility and now
 * only reports `true` for platform admins (unlimited access for support/QA).
 */
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

    try {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setStatus({ hasGoldPass: !!adminRole, loading: false, expiresAt: null });
    } catch (error) {
      console.error("Kids admin status check failed", error);
      setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    loadStatus();
  }, [authLoading, loadStatus, user?.id]);

  return status;
}
