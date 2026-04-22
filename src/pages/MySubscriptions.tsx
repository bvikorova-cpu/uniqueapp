import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pause, Play, X, CreditCard, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Helmet } from "react-helmet-async";

interface Sub {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  canceled_at: string | null;
  product_id: string | null;
  product_name: string;
  amount: number;
  currency: string;
  interval: string;
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
  const [busy, setBusy] = useState<string | null>(null);

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

  useEffect(() => { load(); }, []);

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

                    {busy === s.id && <Loader2 className="h-4 w-4 animate-spin self-center ml-1" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
