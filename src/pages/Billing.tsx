import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, ExternalLink, Loader2, RefreshCw, Receipt } from "lucide-react";

interface Subscription {
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

function statusBadge(s: Subscription) {
  if (s.cancel_at_period_end)
    return <Badge className="bg-accent/15 text-accent-foreground border-accent/30">Cancels at period end</Badge>;
  switch (s.status) {
    case "active":
      return <Badge className="bg-primary/15 text-primary border-primary/30">Active</Badge>;
    case "trialing":
      return <Badge className="bg-primary/15 text-primary border-primary/30">Trial</Badge>;
    case "past_due":
      return <Badge variant="destructive">Past due</Badge>;
    case "unpaid":
      return <Badge variant="destructive">Unpaid</Badge>;
    case "canceled":
      return <Badge variant="outline">Canceled</Badge>;
    default:
      return <Badge variant="outline">{s.status}</Badge>;
  }
}

export default function Billing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const load = async () => {
    if (!user) {
      setSubs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-user-subscriptions");
      if (error) throw error;
      setSubs((data as any)?.subscriptions || []);
    } catch (e: any) {
      toast({ title: "Failed to load subscriptions", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if ((data as any)?.url) {
        window.open((data as any).url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (e: any) {
      toast({ title: "Couldn't open portal", description: e.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to view your billing.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCount = subs.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;
  const monthlySpend = subs
    .filter((s) => (s.status === "active" || s.status === "trialing") && s.interval === "month")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <Helmet>
        <title>Billing & Subscriptions — Manage your plans</title>
        <meta
          name="description"
          content="View, manage, and cancel your active subscriptions through the secure Stripe Customer Portal."
        />
      </Helmet>

      <main className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your active plans, payment methods, and invoices in one place.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Active plans</span>
              </div>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Receipt className="h-4 w-4" />
                <span className="text-sm font-medium">Monthly spend</span>
              </div>
              <div className="text-2xl font-bold">€{monthlySpend.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardContent className="pt-6 flex flex-col gap-3">
              <div className="text-sm font-medium text-muted-foreground">
                Manage payment & cancel
              </div>
              <Button onClick={openPortal} disabled={portalLoading} className="w-full">
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Open Customer Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions table */}
        <Card>
          <CardHeader>
            <CardTitle>Your subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading…
              </div>
            ) : subs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                You don't have any subscriptions yet. Browse our{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => navigate("/subscription")}
                >
                  subscription plans
                </button>
                .
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Renews / Ends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subs.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.product_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          €{s.amount.toFixed(2)} / {s.interval}
                        </TableCell>
                        <TableCell>{statusBadge(s)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.current_period_end
                            ? new Date(s.current_period_end).toLocaleDateString()
                            : s.canceled_at
                              ? `Canceled ${new Date(s.canceled_at).toLocaleDateString()}`
                              : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Cancellations, payment method updates, and invoices are handled securely through
          Stripe. Click "Open Customer Portal" above.
        </p>
      </main>
    </>
  );
}
