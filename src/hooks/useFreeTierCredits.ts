// Neutralized — paid-only model (Core: 100% paid, no free tiers).
// Kept as a no-op shim so legacy imports still compile; will be removed.
import { useCallback } from "react";

export interface FreeTierCredits {
  user_id: string;
  balance: number;
  month_key: string;
  welcome_shown: boolean;
  granted_at: string;
  updated_at: string;
}

export function useFreeTierCredits() {
  const refresh = useCallback(async () => {}, []);
  const markWelcomeShown = useCallback(async () => {}, []);
  const consume = useCallback(async (_amount: number, _reason: string) => false, []);
  return { data: null as FreeTierCredits | null, loading: false, refresh, markWelcomeShown, consume };
}
