import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pause, Play, X, CreditCard, RefreshCw, ExternalLink, FileText, Download, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PauseLimitCard from "@/components/billing/PauseLimitCard";
import RefundButton from "@/components/billing/RefundButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";

interface Sub {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  canceled_at: string | null;
  price_id: string | null;
  product_id: string | null;
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
  invoice_pdf: string | null;
  description: string | null;
}

interface Proration {
  amount_due_now: number;
  proration_total: number;
  total: number;
  currency: string;
  period_end: string | null;
  lines: { description: string; amount: number; proration: boolean }[];
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  unpaid: "destructive",
  canceled: "outline",
};

export default function MySubscriptions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Proration preview dialog state
  const [pvOpen, setPvOpen] = useState(false);
  const [pvSub, setPvSub] = useState<Sub | null>(null);
  const [pvPriceId, setPvPriceId] = useState("");
  const [pvLoading, setPvLoading] = useState(false);
  const [pvData, setPvData] = useState<Proration | null>(null);
  const [pvError, setPvError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-user-subscriptions");
      if (error) throw error;
      setSubs(data?.subscriptions || []);
    } catch (e: any) {
      toast({ title: "Failed to load subscriptions", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    setInvoicesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-user-subscriptions", {
        body: { action: "list_invoices", limit: 24 },
      });
      if (error) throw error;
      setInvoices(data?.invoices || []);
    } catch (e: any) {
      toast({ title: "Failed to load invoices", description: e.message, variant: "destructive" });
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => { load(); loadInvoices(); }, []);

  const openPreview = (s: Sub) => {
    setPvSub(s); setPvPriceId(""); setPvData(null); setPvError(null); setPvOpen(true);
  };

  const runPreview = async () => {
    if (!pvSub || !pvPriceId.trim()) return;
    setPvLoading(true); setPvError(null); setPvData(null);
    try {
      const { data, error } = await supabase.functions.invoke("list-user-subscriptions", {
        body: {
          action: "proration_preview",
          subscription_id: pvSub.id,
          new_price_id: pvPriceId.trim(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPvData(data as Proration);
    } catch (e: any) {
      setPvError(e.message || "Preview failed");
    } finally {
      setPvLoading(false);
    }
  };

  const openPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Portal unavailable", description: e.message, variant: "destructive" });
    }
  };

  const action = async (
    fn: string,
    body: Record<string, unknown>,
    successMsg: string,
    subId: string,
  ) => {
    setBusy(subId);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: successMsg });
      await load();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  const fmtMoney = (a: number, c: string) =>
    `${a.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>My Subscriptions — Manage billing & plans</title>
        <meta name="description" content="View, pause, resume, or cancel your active subscriptions." />
        <link rel="canonical" href={`${window.location.origin}/account/subscriptions`} />
      </Helmet>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all your active and past subscriptions in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openPortal}>
            <CreditCard className="h-4 w-4 mr-2" />
            Stripe Portal
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <PauseLimitCard />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : subs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">You don't have any subscriptions yet.</p>
            <Button asChild variant="outline">
              <a href="/subscription">Browse plans</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const isActive = s.status === "active" || s.status === "trialing";
            const isPastDue = s.status === "past_due" || s.status === "unpaid";
            const isCanceled = s.status === "canceled";
            const willCancel = s.cancel_at_period_end && !isCanceled;
            return (
              <Card key={s.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-lg">{s.product_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {fmtMoney(s.amount, s.currency)} / {s.interval}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={statusVariant[s.status] ?? "outline"} className="capitalize">
                        {s.status.replace("_", " ")}
                      </Badge>
                      {willCancel && (
                        <Badge variant="outline" className="text-xs">
                          Ends {fmtDate(s.current_period_end)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground mb-4 space-y-0.5">
                    <p>
                      {isCanceled ? "Canceled on" : "Renews on"}:{" "}
                      <span className="text-foreground font-medium">
                        {fmtDate(isCanceled ? s.canceled_at : s.current_period_end)}
                      </span>
                    </p>
                    <p className="font-mono opacity-60">{s.id}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isActive && !willCancel && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === s.id}
                          onClick={() =>
                            action("pause-subscription", { months: 1 }, "Subscription paused for 1 month", s.id)
                          }
                        >
                          <Pause className="h-4 w-4 mr-1.5" />
                          Pause 1 month
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={busy === s.id}>
                              <X className="h-4 w-4 mr-1.5" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your access will continue until {fmtDate(s.current_period_end)}.
                                You won't be charged again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  action(
                                    "cancel-subscription-by-id",
                                    { subscription_id: s.id },
                                    "Subscription will end at period end",
                                    s.id,
                                  )
                                }
                              >
                                Cancel at period end
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {(willCancel || isActive) && willCancel && (
                      <Button
                        size="sm"
                        disabled={busy === s.id}
                        onClick={() =>
                          action(
                            "resume-subscription",
                            { subscription_id: s.id },
                            "Subscription resumed",
                            s.id,
                          )
                        }
                      >
                        <Play className="h-4 w-4 mr-1.5" />
                        Resume
                      </Button>
                    )}

                    {isPastDue && (
                      <Button size="sm" onClick={openPortal}>
                        <CreditCard className="h-4 w-4 mr-1.5" />
                        Update payment method
                      </Button>
                    )}

                    {isActive && (
                      <Button size="sm" variant="outline" onClick={() => openPreview(s)}>
                        <ArrowUpRight className="h-4 w-4 mr-1.5" />
                        Preview plan change
                      </Button>
                    )}

                    {isActive && <RefundButton subscriptionId={s.id} onDone={load} />}

                    {busy === s.id && <Loader2 className="h-4 w-4 animate-spin self-center ml-1" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invoices section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Invoices
          </h2>
          <Button size="sm" variant="ghost" onClick={loadInvoices} disabled={invoicesLoading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${invoicesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            {invoicesLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : invoices.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</div>
            ) : (
              <ul className="divide-y">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {inv.number || inv.id}
                        <Badge variant={inv.status === "paid" ? "default" : "outline"} className="ml-2 capitalize text-[10px]">
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmtDate(inv.created)} · {fmtMoney(inv.amount_paid || inv.amount_due, inv.currency)}
                        {inv.description ? ` · ${inv.description}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inv.invoice_pdf && (
                        <Button asChild size="sm" variant="outline">
                          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                          </a>
                        </Button>
                      )}
                      {inv.hosted_invoice_url && (
                        <Button asChild size="sm" variant="ghost">
                          <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View
                          </a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proration preview dialog */}
      <Dialog open={pvOpen} onOpenChange={setPvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview plan change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter the Stripe price ID of the plan you want to switch <span className="font-medium">{pvSub?.product_name}</span> to.
              We'll show the prorated amount due today.
            </p>
            <div>
              <Label htmlFor="newPriceId" className="text-xs">New price ID</Label>
              <Input
                id="newPriceId"
                placeholder="price_..."
                value={pvPriceId}
                onChange={(e) => setPvPriceId(e.target.value)}
                className="font-mono"
              />
              {pvSub?.price_id && (
                <p className="text-[11px] text-muted-foreground mt-1">Current: <span className="font-mono">{pvSub.price_id}</span></p>
              )}
            </div>
            {pvError && <p className="text-sm text-destructive">{pvError}</p>}
            {pvData && (
              <div className="rounded-lg border p-3 bg-muted/30 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proration</span>
                  <span className="font-medium">{fmtMoney(pvData.proration_total, pvData.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total upcoming invoice</span>
                  <span className="font-medium">{fmtMoney(pvData.total, pvData.currency)}</span>
                </div>
                <div className="flex justify-between text-base pt-1.5 border-t">
                  <span className="font-semibold">Charged today</span>
                  <span className="font-bold">{fmtMoney(pvData.amount_due_now, pvData.currency)}</span>
                </div>
                {pvData.period_end && (
                  <p className="text-[11px] text-muted-foreground">Next billing: {fmtDate(pvData.period_end)}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPvOpen(false)}>Close</Button>
            <Button onClick={runPreview} disabled={pvLoading || !pvPriceId.trim()}>
              {pvLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
