import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { triggerBadgeConfetti } from "@/utils/confetti";


/**
 * Detects ?donation=success&session_id=... or ?donation=canceled in the URL
 * after returning from Stripe Checkout, verifies the payment, and triggers a
 * refresh callback so the campaign UI reflects the new totals.
 */
export function useDonationReturn(onVerified?: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const status = searchParams.get("donation");
    const sessionId = searchParams.get("session_id");

    if (status === "canceled") {
      handled.current = true;
      toast({
        title: "Donation canceled",
        description: "No payment was taken.",
      });
      const next = new URLSearchParams(searchParams);
      next.delete("donation");
      next.delete("session_id");
      setSearchParams(next, { replace: true });
      return;
    }

    if (status === "success" && sessionId) {
      handled.current = true;
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-donation", {
            body: { session_id: sessionId },
          });
          if (error) throw error;
          if (data?.verified) {
            const eur = ((data?.amount_cents ?? 0) / 100).toFixed(2);
            toast({
              title: "Thank you for your donation!",
              description: `Your contribution of €${eur} was received.`,
            });
            onVerified?.();
          } else {
            toast({
              title: "Payment pending",
              description: "We could not confirm the payment yet. It may take a moment.",
            });
          }
        } catch (e) {
          console.error("verify-donation error", e);
          toast({
            title: "Verification failed",
            description: "We could not verify your donation. Please contact support if you were charged.",
            variant: "destructive",
          });
        } finally {
          const next = new URLSearchParams(searchParams);
          next.delete("donation");
          next.delete("session_id");
          setSearchParams(next, { replace: true });
        }
      })();
    }
  }, [searchParams, setSearchParams, onVerified]);
}
