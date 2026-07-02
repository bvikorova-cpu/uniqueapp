import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, AlertTriangle, ExternalLink, RefreshCw,
  Loader2, Banknote, Globe, CalendarClock, Percent, ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LiveStatus {
  connected: boolean;
  account_id?: string;
  account_type?: string;
  country?: string;
  default_currency?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  disabled_reason?: string | null;
  currently_due?: string[];
  past_due?: string[];
  eventually_due?: string[];
  capabilities?: Record<string, string>;
  payout_schedule?: { interval?: string; delay_days?: number; weekly_anchor?: string; monthly_anchor?: number } | null;
  balance?: {
    available?: { amount: number; currency: string }[];
    pending?: { amount: number; currency: string }[];
    instant_available?: { amount: number; currency: string }[] | null;
  } | null;
  recent_payouts?: { id: string; amount: number; currency: string; status: string; arrival_date: number }[];
  synced_at?: string;
}

// Platform commission shown to seller (matches edge fn create-bazaar-checkout: 20%)
const PLATFORM_COMMISSION_PCT = 20;

const fmtMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() })
    .format((cents || 0) / 100);

const humanField = (k: string) =>
  k.replace(/_/g, " ").replace(/\./g, " › ");

export const StripeConnectBanner = () => {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { startOnboarding, openDashboard, liveStatus, loading: actionLoading } = useStripeConnect();

  const load = useCallback(async (live = false) => {
    if (live) setRefreshing(true); else setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthed(false); return; }
      setAuthed(true);

      // Fast cached read first
      const { data } = await supabase
        .from('profiles')
        .select(`stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled,
                 stripe_connect_details_submitted, stripe_connect_disabled_reason,
                 stripe_connect_currently_due, stripe_connect_past_due, stripe_connect_eventually_due,
                 stripe_connect_default_currency, stripe_connect_payout_schedule,
                 stripe_connect_country, stripe_connect_capabilities,
                 stripe_connect_account_type, stripe_connect_synced_at`)
        .eq('id', user.id)
        .maybeSingle();
      const d: any = data || {};
      const cached: LiveStatus = {
        connected: !!d.stripe_connect_account_id,
        account_id: d.stripe_connect_account_id ?? undefined,
        account_type: d.stripe_connect_account_type ?? undefined,
        country: d.stripe_connect_country ?? undefined,
        default_currency: d.stripe_connect_default_currency ?? undefined,
        charges_enabled: !!d.stripe_connect_charges_enabled,
        payouts_enabled: !!d.stripe_connect_payouts_enabled,
        details_submitted: !!d.stripe_connect_details_submitted,
        disabled_reason: d.stripe_connect_disabled_reason ?? null,
        currently_due: d.stripe_connect_currently_due ?? [],
        past_due: d.stripe_connect_past_due ?? [],
        eventually_due: d.stripe_connect_eventually_due ?? [],
        capabilities: d.stripe_connect_capabilities ?? {},
        payout_schedule: d.stripe_connect_payout_schedule ?? null,
        synced_at: d.stripe_connect_synced_at ?? undefined,
      };
      setStatus(cached);

      if (live && cached.connected) {
        try {
          const fresh = await liveStatus();
          if (fresh) setStatus(fresh as LiveStatus);
        } catch (e) { console.warn("liveStatus failed", e); }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [liveStatus]);

  // Initial load + refresh on focus (after onboarding tab closes)
  useEffect(() => {
    load(true);
    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    return (
    <>
      <FloatingHowItWorks title={"Stripe Connect Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Stripe Connect Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stripe Connect Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => window.removeEventListener('focus', onFocus);
  }, [load]);

  if (loading) return null;
  if (!authed || !status) return null; // hide for anon (#11)

  const fullyReady =
    status.account_id &&
    status.charges_enabled &&
    status.payouts_enabled &&
    status.capabilities?.transfers === 'active';

  const balanceLine = (entries?: { amount: number; currency: string }[]) =>
    !entries?.length ? "—" : entries.map((e) => fmtMoney(e.amount, e.currency)).join(" · ");

  const heldByPlatform = !status.account_id || !status.payouts_enabled;

  const scheduleLabel = (() => {
    const s = status.payout_schedule;
    if (!s) return null;
    const parts = [s.interval];
    if (s.interval === 'weekly' && s.weekly_anchor) parts.push(`(${s.weekly_anchor})`);
    if (s.interval === 'monthly' && s.monthly_anchor) parts.push(`(day ${s.monthly_anchor})`);
    if (typeof s.delay_days === 'number') parts.push(`+${s.delay_days}d delay`);
    return parts.filter(Boolean).join(' ');
  })();

  return (
    <div className="space-y-3">
      {fullyReady ? (
        <Alert className="border-emerald-500/40 bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <AlertTitle className="text-emerald-600">Stripe Connect active — automatic payouts enabled</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground space-y-3">
            <p>
              Each sale is split automatically: the platform keeps a{" "}
              <strong>{PLATFORM_COMMISSION_PCT}% commission</strong> and the rest is transferred to
              your Stripe account.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {status.country && <div className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Country: <strong>{status.country.toUpperCase()}</strong></div>}
              {status.default_currency && <div className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> Currency: <strong>{status.default_currency.toUpperCase()}</strong></div>}
              {scheduleLabel && <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Payout schedule: <strong>{scheduleLabel}</strong></div>}
              {status.account_type && <div className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5" /> Account: <strong>{status.account_type}</strong></div>}
            </div>
            {status.balance && (
              <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3 text-xs space-y-1">
                <div className="flex justify-between"><span>Available on Stripe</span><strong className="font-mono">{balanceLine(status.balance.available)}</strong></div>
                <div className="flex justify-between"><span>Pending on Stripe</span><strong className="font-mono">{balanceLine(status.balance.pending)}</strong></div>
                {!!status.balance.instant_available?.length && (
                  <div className="flex justify-between"><span>Instant available</span><strong className="font-mono">{balanceLine(status.balance.instant_available)}</strong></div>
                )}
              </div>
            )}
            {!!status.recent_payouts?.length && (
              <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3 text-xs">
                <div className="font-semibold mb-1.5">Recent Stripe payouts</div>
                <ul className="space-y-1">
                  {status.recent_payouts.slice(0, 3).map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span>{new Date(p.arrival_date * 1000).toLocaleDateString()} · <Badge variant="outline" className="text-[10px] py-0">{p.status}</Badge></span>
                      <span className="font-mono">{fmtMoney(p.amount, p.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={openDashboard} disabled={actionLoading}>
                <ExternalLink className="h-4 w-4 mr-2" /> Open Stripe dashboard
              </Button>
              <Button size="sm" variant="ghost" onClick={() => load(true)} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh from Stripe
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-600">Stripe Connect required to receive payouts</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground space-y-3">
            <p>
              We use <strong>Stripe Connect</strong> to send your earnings directly. On every sale,
              Stripe keeps the <strong>{PLATFORM_COMMISSION_PCT}% platform commission</strong> and
              transfers the rest to your account. Until your account is fully verified, buyer
              payments are <strong>held by the platform</strong> and you cannot withdraw funds.
            </p>

            <ul className="space-y-1.5">
              {[
                { label: "Stripe account created", ok: !!status.account_id },
                { label: "Identity & business details submitted", ok: !!status.details_submitted },
                { label: "Charges enabled (can accept payments)", ok: !!status.charges_enabled },
                { label: "Payouts enabled (can receive money)", ok: !!status.payouts_enabled },
                { label: "Transfers capability active", ok: status.capabilities?.transfers === 'active' },
              ].map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  <span className={c.ok ? "text-emerald-600" : "text-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>

            {(status.disabled_reason || (status.past_due?.length ?? 0) > 0 || (status.currently_due?.length ?? 0) > 0) && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-destructive">
                  <ShieldAlert className="h-4 w-4" /> Stripe is asking for:
                </div>
                {status.disabled_reason && <div>Reason: <code className="font-mono">{status.disabled_reason}</code></div>}
                {!!status.past_due?.length && (
                  <div>
                    <div className="text-destructive font-semibold">Past due ({status.past_due.length}):</div>
                    <ul className="list-disc pl-5">{status.past_due.map((f) => <li key={f}>{humanField(f)}</li>)}</ul>
                  </div>
                )}
                {!!status.currently_due?.length && (
                  <div>
                    <div className="font-semibold">Currently due ({status.currently_due.length}):</div>
                    <ul className="list-disc pl-5">{status.currently_due.slice(0, 8).map((f) => <li key={f}>{humanField(f)}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {heldByPlatform && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                <strong>Funds currently held by platform:</strong> any sale you make right now is
                paid to the platform escrow. As soon as Stripe Connect is fully active, future sales
                are routed straight to your Stripe balance and queued earnings can be released.
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={startOnboarding} disabled={actionLoading}>
                {status.account_id ? "Resume Stripe onboarding" : "Connect Stripe"}
              </Button>
              {status.account_id && (
                <>
                  <Button size="sm" variant="outline" onClick={openDashboard} disabled={actionLoading}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Open Stripe dashboard
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => load(true)} disabled={refreshing}>
                    {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh from Stripe
                  </Button>
                </>
              )}
            </div>
            {status.synced_at && (
              <p className="text-[10px] text-muted-foreground/70">
                Last synced from Stripe: {new Date(status.synced_at).toLocaleString()}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StripeConnectBanner;
