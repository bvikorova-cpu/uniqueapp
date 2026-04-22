import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "pending_referral_code";

/**
 * Captures `?ref=CODE` from the URL into localStorage on first hit.
 * Once the user is authenticated, calls claim-referral edge fn so the
 * stripe-webhook can later credit €5 when their first subscription activates.
 */
export function useReferralCapture() {
  const { user } = useAuth();

  // 1. Persist the code from the URL on landing
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref");
    if (code && code.length <= 64) {
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, []);

  // 2. After login, claim it (one-shot)
  useEffect(() => {
    if (!user?.id) return;
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) return;
    const claimedKey = `referral_claimed_${user.id}`;
    if (localStorage.getItem(claimedKey)) return;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("claim-referral", {
          body: { code },
        });
        if (!error) {
          localStorage.setItem(claimedKey, "1");
          localStorage.removeItem(STORAGE_KEY);
          if ((data as any)?.ok) {
            // silent success; reward fires on first subscription
            console.log("[referral] attributed", data);
          }
        }
      } catch (e) {
        console.warn("[referral] claim failed", e);
      }
    })();
  }, [user?.id]);
}
