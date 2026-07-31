import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";
import type { PayoutKind } from "@/hooks/useAdminPayoutWithdrawal";

type Source = {
  kind: PayoutKind;
  label: string;
  table: string;
  creatorCol: string;
  transferCol: string;
};

const SOURCES: Source[] = [
  { kind: "instructor", label: "Instructors", table: "instructor_withdrawal_requests", creatorCol: "instructor_id", transferCol: "stripe_transfer_id" },
  { kind: "musician", label: "Musicians", table: "musician_withdrawal_requests", creatorCol: "musician_id", transferCol: "stripe_transfer_id" },
  { kind: "masterchef", label: "KitchenStars", table: "masterchef_withdrawal_requests", creatorCol: "chef_id", transferCol: "stripe_transfer_id" },
  { kind: "influencer", label: "InfluKing", table: "influencer_withdrawal_requests", creatorCol: "influencer_id", transferCol: "stripe_transfer_id" },
  { kind: "auction", label: "Auctions", table: "auction_withdrawal_requests", creatorCol: "seller_id", transferCol: "stripe_payout_id" },
  { kind: "referral", label: "Referrals", table: "referral_withdrawal_requests", creatorCol: "referrer_id", transferCol: "stripe_transfer_id" },
  { kind: "campaign", label: "Campaigns", table: "withdrawal_requests", creatorCol: "creator_id", transferCol: "stripe_transfer_id" },
  { kind: "stock", label: "Stock Content", table: "stock_withdrawal_requests", creatorCol: "creator_id", transferCol: "stripe_transfer_id" },
];

interface Row {
  id: string;
  kind: PayoutKind;
  hub: string;
  creatorId: string | null;
  amount: number;
  status: string;
  createdAt: string | null;
  processedAt: string | null;
  transferId: string | null;
}

const fmt = (n: number) => `€${n.toFixed(2)}`;
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export function AdminPlatformWithdrawals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [platformFees, setPlatformFees] = useState(0);
  const [creatorWallets, setCreatorWallets] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const all: Row[] = [];

    await Promise.all(
      SOURCES.map(async (s) => {
        const { data, error } = await supabase
          .from(s.table as any)
          .select(`id, amount, status, created_at, processed_at, ${s.creatorCol}, ${s.transferCol}`)
          .order("created_at", { ascending: false })
          .limit(200);
        if (error || !data) return;
        (data as any[]).forEach((r) => {
          all.push({
            id: r.id,
            kind: s.kind,
            hub: s.label,
            creatorId: r[s.creatorCol] ?? null,
            amount: Number(r.amount || 0),
            status: String(r.status || "pending"),
            createdAt: r.created_at ?? null,
            processedAt: r.processed_at ?? null,
            transferId: r[s.transferCol] ?? null,
          });
        });
      }),
    );

    // Platform-side available funds (commissions kept by the platform)
    const [influ, chef, sports, stock, wallets] = await Promise.all([
      supabase.from("influencer_platform_earnings").select("commission_amount"),
      supabase.from("masterchef_platform_earnings").select("commission_amount"),
      supabase.from("sports_platform_earnings").select("platform_commission"),
      supabase.from("stock_content_sales").select("platform_fee").eq("status", "completed"),
      supabase.from("wallet_balances" as any).select("balance_eur"),
    ]);

    const sum = (arr: any[] | null, col: string) =>
      (arr || []).reduce((acc: number, r: any) => acc + Number(r[col] || 0), 0);

    setPlatformFees(
      sum(influ.data as any[], "commission_amount") +
        sum(chef.data as any[], "commission_amount") +
        sum(sports.data as any[], "platform_commission") +
        sum(stock.data as any[], "platform_fee"),
    );
    setCreatorWallets(sum(wallets.data as any[], "balance_eur"));

    all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    setRows(all);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);
  const history = useMemo(
    () => rows.filter((r) => ["completed", "paid", "approved", "rejected"].includes(r.status)),
    [rows],
  );
  const paidTotal = useMemo(
    () => history.filter((r) => r.status !== "rejected").reduce((a, r) => a + r.amount, 0),
    [history],
  );
  const pendingTotal = useMemo(() => pending.reduce((a, r) => a + r.amount, 0), [pending]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading withdrawals…
      </div>
    );
  }

  const RowCard = ({ r, showAction }: { r: Row; showAction?: boolean }) => (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{fmt(r.amount)}</span>
          <Badge variant="secondary">{r.hub}</Badge>
          <Badge variant={r.status === "rejected" ? "destructive" : r.status === "pending" ? "outline" : "default"}>
            {r.status}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          Creator {r.creatorId ? r.creatorId.slice(0, 8) : "—"} · requested {fmtDate(r.createdAt)}
          {r.processedAt ? ` · processed ${fmtDate(r.processedAt)}` : ""}
          {r.transferId ? ` · ${r.transferId}` : ""}
        </p>
      </div>
      {showAction && (
        <StripePayoutButton kind={r.kind} amount={r.amount} withdrawalId={r.id} onPaid={load} />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-emerald-500" /> Available platform funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(platformFees)}</p>
            <p className="text-[11px] text-muted-foreground">Commissions kept by the platform</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-amber-500" /> Pending withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(pendingTotal)}</p>
            <p className="text-[11px] text-muted-foreground">{pending.length} requests · creator wallets {fmt(creatorWallets)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Paid out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(paidTotal)}</p>
            <p className="text-[11px] text-muted-foreground">{history.length} processed requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-2">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending withdrawals.</p>
          ) : (
            pending.map((r) => <RowCard key={`${r.kind}-${r.id}`} r={r} showAction />)
          )}
        </TabsContent>
        <TabsContent value="history" className="mt-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No processed withdrawals yet.</p>
          ) : (
            history.map((r) => <RowCard key={`${r.kind}-${r.id}`} r={r} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPlatformWithdrawals;
