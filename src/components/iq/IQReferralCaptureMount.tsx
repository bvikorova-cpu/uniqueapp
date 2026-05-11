import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "iq_ref_code";
const APPLIED_KEY = "iq_ref_applied";

/**
 * Mount-only component:
 *  1. Captures ?ref=CODE from any URL into localStorage (works pre-signup).
 *  2. After auth, redeems it exactly once via redeem_iq_referral_code RPC.
 */
export default function IQReferralCaptureMount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  // 1. capture
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("ref");
      if (code && code.length >= 4 && !localStorage.getItem(APPLIED_KEY)) {
        localStorage.setItem(STORAGE_KEY, code.toUpperCase().trim());
      }
    } catch {}
  }, []);

  // 2. redeem after auth
  useEffect(() => {
    if (!user) return;
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code || localStorage.getItem(APPLIED_KEY)) return;

    (async () => {
      const { data, error } = await supabase.rpc("redeem_iq_referral_code", { _code: code });
      localStorage.setItem(APPLIED_KEY, "1");
      localStorage.removeItem(STORAGE_KEY);
      if (error) {
        // silent unless it's a real new-user redemption attempt; show only success
        return;
      }
      const d = data as { referrer_credits: number; referee_credits: number } | null;
      toast({
        title: "Welcome bonus! 🎁",
        description: `You got +${d?.referee_credits ?? 5} IQ credits from your friend's invite.`,
      });
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
    })();
  }, [user, toast, qc]);

  return null;
}
