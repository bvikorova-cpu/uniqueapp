import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorPayouts, KIND_LABELS, type PayoutKind } from "@/hooks/useCreatorPayouts";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { TaxExportCard } from "@/components/creator/TaxExportCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Banknote,
  BarChart3,
} from "lucide-react";

type ConnectStatus = {
  connected: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
};

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "paid" || s === "approved")
    return <Badge className="bg-primary/15 text-primary border-primary/30">Paid</Badge>;
  if (s === "pending" || s === "processing")
    return <Badge className="bg-accent/15 text-accent-foreground border-accent/30">Pending</Badge>;
  if (s === "rejected" || s === "failed")
    return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function CreatorPayouts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rows, totals, loading, refetch } = useCreatorPayouts();
  const { startOnboarding, checkStatus, openDashboard, loading: connectLoading } =
    useStripeConnect();
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [filter, setFilter] = useState<PayoutKind | "all">("all");

  useEffect(() => {
    if (!user?.id) return;
    checkStatus()
      .then((d) => setConnect(d as ConnectStatus))
      .catch(() => setConnect({ connected: false }));
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to view your payouts.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.kind === filter);
  const connectReady = connect?.connected && connect?.payouts_enabled;

  return (
    <>
      <FloatingHowItWorks
        title="How Creator Payouts works"
        steps={[
          { title: 'Connect Stripe', description: 'Complete Stripe Connect onboarding.' },
          { title: 'Check balance', description: 'See available and pending earnings.' },
          { title: 'Withdraw', description: 'Request payout to your bank (85/15 split).' },
          { title: 'Payout history', description: 'Review past transfers and invoices.' },
        ]}
      />
    <>
      <Helmet>
        <title>Creator Payouts — Earnings Dashboard</title>
        <meta
          name="description"
          content="Track your creator earnings, withdrawal history, and Stripe payout status across all platform features."
        />
      </Helmet>

      <main className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Creator Payouts</h1>
            <p className="text-muted-foreground mt-1">
              All your earnings from music, courses, recipes, auctions, referrals & more.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/creator-analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View analytics
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Stripe Connect status card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-primary" />
              Stripe Connect Account
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              {connectReady ? (
                <Badge className="bg-primary/15 text-primary border-primary/30">
                  ✓ Connected — payouts enabled
                </Badge>
              ) : connect?.connected ? (
                <Badge className="bg-accent/15 text-accent-foreground border-accent/30">
                  Onboarding incomplete
                </Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
              <p className="text-sm text-muted-foreground">
                {connectReady
                  ? "You can receive Stripe payouts to your bank account."
                  : "Connect Stripe to receive your earnings directly."}
              </p>
            </div>
            <div className="flex gap-2">
              {!connectReady ? (
                <Button onClick={startOnboarding} disabled={connectLoading}>
                  {connectLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {connect?.connected ? "Continue setup" : "Connect Stripe"}
                </Button>
              ) : (
                <Button variant="outline" onClick={openDashboard} disabled={connectLoading}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Stripe dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-accent-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold">€{totals.pending.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Paid out</span>
              </div>
              <div className="text-2xl font-bold">€{totals.paid.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <div className="text-2xl font-bold">€{totals.rejected.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tax export */}
        <TaxExportCard />

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
                {(Object.keys(KIND_LABELS) as PayoutKind[]).map((k) => {
                  const count = rows.filter((r) => r.kind === k).length;
                  if (count === 0) return null;
                  return (
                    <TabsTrigger key={k} value={k}>
                      {KIND_LABELS[k]} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={filter} className="mt-4">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No withdrawal requests yet. Earn from any platform feature to see them here.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Stripe Transfer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((r) => (
                          <TableRow key={`${r.kind}-${r.id}`}>
                            <TableCell className="text-sm whitespace-nowrap">
                              {new Date(r.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{KIND_LABELS[r.kind]}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              €{Number(r.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>{statusBadge(r.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {r.admin_notes || "—"}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {r.stripe_transfer_id ? r.stripe_transfer_id.slice(0, 16) + "…" : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
    </>
  );
}
