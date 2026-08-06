import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface FreeTierCredits {
  user_id: string;
  balance: number;
  month_key: string;
  welcome_shown: boolean;
  granted_at: string;
  updated_at: string;
}

const STATIC_ZERO: FreeTierCredits = {
  user_id: "",
  balance: 0,
  month_key: "",
  welcome_shown: true,
  granted_at: "",
  updated_at: "",
};

/**
 * Free tier credits hook — paid-only model.
 *
 * The platform no longer grants free monthly credits. This hook now returns a
 * static zero balance and avoids any database calls to the free-tier system,
 * which previously generated thousands of ensure_free_tier_credits RPC calls.
 */
export function useFreeTierCredits() {
  const { user } = useAuth();
  const [data, setData] = useState<FreeTierCredits | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }
    // Paid-only: free balance is always 0.
    setData({ ...STATIC_ZERO, user_id: user.id });
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markWelcomeShown = useCallback(async () => {
    // No-op in paid-only mode.
  }, []);

  const consume = useCallback(async (): Promise<boolean> => {
    // No free credits to spend in paid-only mode.
    return false;
  }, []);

  return { data, loading, refresh, markWelcomeShown, consume };
}
