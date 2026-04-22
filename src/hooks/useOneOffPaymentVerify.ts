import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type VerifyFn =
  | "verify-concert-ticket-payment"
  | "verify-crystal-purchase"
  | "verify-gift-payment"
  | "verify-job-listing-payment";

interface Options {
  /** Edge function to call. */
  fn: VerifyFn;
  /** Toast title on success. */
  successTitle?: string;
  /** Toast description on success. */
  successDescription?: string;
  /** Optional callback after successful verification. */
  onSuccess?: (data: any) => void;
  /** If true, strips ?session_id & success params from URL on completion. Default true. */
  cleanUrl?: boolean;
}

/**
 * Generic Stripe one-off payment verification hook.
 * Reads `session_id` from the URL, calls the given verify-* edge function once,
 * shows a toast, and (optionally) cleans the URL.
 */
export function useOneOffPaymentVerify({
  fn,
  successTitle = "Payment successful!",
  successDescription = "Your purchase has been confirmed.",
  onSuccess,
  cleanUrl = true,
}: Options) {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const ranRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(fn, {
          body: { sessionId },
        });
        if (error) throw error;

        toast({ title: successTitle, description: successDescription });
        onSuccess?.(data);
      } catch (err: any) {
        console.error(`[${fn}] verification failed:`, err);
        toast({
          title: "Verification failed",
          description: err?.message || "Please contact support.",
          variant: "destructive",
        });
      } finally {
        if (cleanUrl) {
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          url.searchParams.delete("success");
          url.searchParams.delete("payment");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    })();
  }, [searchParams, fn, successTitle, successDescription, onSuccess, cleanUrl, toast]);
}
