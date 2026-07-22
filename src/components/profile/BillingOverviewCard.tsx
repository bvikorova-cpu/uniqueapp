import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard,
  Receipt,
  ExternalLink,
  Loader2,
  ArrowRight,
  CheckCircle2 } from "lucide-react";
import { useClubMembership } from "@/hooks/useClubMembership";

interface Sub {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  product_name: string;
  amount: number;
  currency: string;
  interval: string;
}

interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  created: string;
  hosted_invoice_url: string | null;
  description: string | null;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

const fmtMoney = (a: number, c: string) =>
  `${a.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c.toUpperCase()}`;

/**
 * Compact billing overview shown on the user's own profile.
 * - Membership (Unique VIP Club) status
 * - Count / list of active subscriptions
 * - Last 3 payments (invoices)
 * - Deep link to /account/subscriptions for full management
 */
export function BillingOverviewCard() {
  const { membership, loading: clubLoading, isMember, isFounding } = useClubMembership();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [subsRes, invRes] = await Promise.all([
          supabase.functions.invoke("list-user-subscriptions"),
          supabase.functions.invoke("list-user-subscriptions", {
            body: { action: "list_invoices", limit: 3 } }),
        ]);
        if (cancelled) return;
        setSubs((subsRes.data as any)?.subscriptions || []);
        setInvoices((invRes.data as any)?.invoices || []);
      } catch {
        /* silent — profile card must not break profile page */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const pastDue = subs.filter((s) => s.status === "past_due" || s.status === "unpaid");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Billing & Membership
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/account/subscriptions">
              Manage
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Membership status */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm font-medium">Unique VIP Club</div>
            {clubLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isMember ? (
              <div className="flex items-center gap-1.5">
                {isFounding && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white border-0 text-[10px]">
                    Founding
                  </Badge>
                )}
                <Badge className="bg-emerald-600 text-white border-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            ) : (
              <Badge variant="outline">Not a member</Badge>
            )}
          </div>
          {isMember && membership && (
            <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              <span>Member #{membership.member_number}</span>
              <span>Tier: {membership.tier === "physical" ? "Physical card" : "Digital"}</span>
              {membership.current_period_end && (
                <span>Renews {fmtDate(membership.current_period_end)}</span>
              )}
            </div>
          )}
          {!clubLoading && !isMember && (
            <div className="mt-2">
              <Button asChild size="sm" variant="secondary">
                <Link to="/club">Join the VIP Club</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Active subscriptions */}
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
            Active subscriptions
          </div>
          {loading ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : active.length === 0 && pastDue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active subscriptions.</p>
          ) : (
            <ul className="space-y-2">
              {[...active, ...pastDue].slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmtMoney(s.amount, s.currency)} / {s.interval}
                      {s.current_period_end &&
                        ` · Renews ${fmtDate(s.current_period_end)}`}
                      {s.cancel_at_period_end && " · Ends soon"}
                    </div>
                  </div>
                  <Badge
                    variant={
                      s.status === "active" || s.status === "trialing"
                        ? "default"
                        : "destructive"
                    }
                    className="capitalize text-[10px]"
                  >
                    {s.status.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment history preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              Recent payments
            </div>
            {invoices.length > 0 && (
              <Link
                to="/account/subscriptions"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          {loading ? (
            <div className="py-3 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="divide-y border rounded-md">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm truncate">
                      {inv.description || inv.number || inv.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(inv.created)} ·{" "}
                      {fmtMoney(inv.amount_paid || inv.amount_due, inv.currency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={inv.status === "paid" ? "default" : "outline"}
                      className="capitalize text-[10px]"
                    >
                      {inv.status}
                    </Badge>
                    {inv.hosted_invoice_url && (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="View invoice"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BillingOverviewCard;
