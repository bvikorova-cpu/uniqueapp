import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  /** Compact mode hides the success banner; only shows the warning. */
  compact?: boolean;
}

/**
 * Seller Stripe Connect gate banner.
 * Shows a warning if the current user has not finished Stripe Connect onboarding,
 * with a CTA to /earnings. Used inside "Create listing" / "Sell" dialogs across
 * Marketplaces & Commerce hubs (Auction, Marketplace, Property, Collectibles, etc).
 */
export function SellerConnectGate({ compact = false }: Props) {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setReady(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setReady(
        !!(profile?.stripe_connect_account_id &&
           profile?.stripe_connect_charges_enabled &&
           profile?.stripe_connect_payouts_enabled),
      );
    })();
    return () => { cancelled = true; };
  }, []);

  if (ready === null) return null;

  if (ready === false) {
    return (
      <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Stripe Connect required to receive payouts.</strong> You can publish, but
          buyer payments will be held by the platform until you connect Stripe.{" "}
          <Link to="/earnings" className="underline font-semibold">Connect Stripe →</Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) return null;

  return (
    <Alert className="border-emerald-500/50 bg-emerald-500/10">
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      <AlertDescription className="text-xs">
        Stripe Connect active — payouts will be sent automatically.
      </AlertDescription>
    </Alert>
  );
}

export default SellerConnectGate;
