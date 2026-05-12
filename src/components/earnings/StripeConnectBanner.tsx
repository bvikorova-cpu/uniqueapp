import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStripeConnect } from "@/hooks/useStripeConnect";

interface ConnectStatus {
  account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

export const StripeConnectBanner = () => {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { startOnboarding, openDashboard, loading: actionLoading } = useStripeConnect();

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_details_submitted')
      .eq('id', user.id)
      .maybeSingle();
    setStatus({
      account_id: data?.stripe_connect_account_id ?? null,
      charges_enabled: !!data?.stripe_connect_charges_enabled,
      payouts_enabled: !!data?.stripe_connect_payouts_enabled,
      details_submitted: !!data?.stripe_connect_details_submitted,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !status) return null;

  const fullyReady = status.account_id && status.charges_enabled && status.payouts_enabled;

  if (fullyReady) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/10">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <AlertTitle className="text-emerald-600">Stripe Connect active — automatic payouts enabled</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Buyer payments are automatically split: the platform keeps the commission and your share is transferred straight to your Stripe account.
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={openDashboard} disabled={actionLoading}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open Stripe dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const conditions = [
    { label: "Stripe account created", ok: !!status.account_id },
    { label: "Identity & business details submitted", ok: status.details_submitted },
    { label: "Charges enabled (can accept payments)", ok: status.charges_enabled },
    { label: "Payouts enabled (can receive money)", ok: status.payouts_enabled },
  ];

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-600">Stripe Connect required to receive payouts</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground space-y-3">
        <p>
          We use <strong>Stripe Connect</strong> to send your earnings directly and automatically.
          On every sale, Stripe keeps the platform commission and transfers the rest to your account — no manual action needed.
          Until your account is fully verified, buyer payments are held by the platform and you cannot withdraw funds.
        </p>
        <ul className="space-y-1.5">
          {conditions.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <span className={c.ok ? "text-emerald-600" : "text-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={startOnboarding} disabled={actionLoading}>
            {status.account_id ? "Resume Stripe onboarding" : "Connect Stripe"}
          </Button>
          {status.account_id && (
            <Button size="sm" variant="outline" onClick={load}>
              Refresh status
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StripeConnectBanner;
