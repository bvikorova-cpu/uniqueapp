import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Search, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PaymentRow {
  id: string;
  user_id: string;
  product_type: string;
  product_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  verified_at: string | null;
  refunded_at: string | null;
  refund_amount_cents: number | null;
  created_at: string;
}

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending / unpaid" },
  { key: "failed", label: "Failed" },
  { key: "refunded", label: "Refunded" },
  { key: "disputed", label: "Disputed" },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    const list = (data ?? []) as PaymentRow[];
    setRows(list);

    const ids = [...new Set(list.map((r) => r.user_id).filter(Boolean))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", ids);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const inspect = async (row: PaymentRow) => {
    setDetailLoading(row.id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-payment-inspect", {
        body: { paymentRecordId: row.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setDetail(data);
    } catch (e: any) {
      toast({ title: "Couldn't load Stripe details", description: e.message, variant: "destructive" });
    } finally {
      setDetailLoading(null);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all") {
        if (tab === "paid" && !(r.status === "paid" || r.status === "completed")) return false;
        if (tab === "pending" && !(r.status === "pending" || r.status === "unpaid" || r.status === "created")) return false;
        if (tab === "failed" && !(r.status === "failed" || r.status === "canceled" || r.status === "expired")) return false;
        if (tab === "refunded" && !r.refunded_at && r.status !== "refunded") return false;
        if (tab === "disputed" && r.status !== "disputed") return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      const p = profiles[r.user_id];
      return (
        r.product_type?.toLowerCase().includes(q) ||
        r.product_id?.toLowerCase().includes(q) ||
        r.stripe_payment_intent_id?.toLowerCase().includes(q) ||
        r.stripe_session_id?.toLowerCase().includes(q) ||
        r.user_id?.toLowerCase().includes(q) ||
        p?.username?.toLowerCase().includes(q) ||
        p?.display_name?.toLowerCase().includes(q)
      );
    });
  }, [rows, tab, search, profiles]);

  const kpi = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid" || r.status === "completed");
    const failed = rows.filter((r) => ["failed", "canceled", "expired"].includes(r.status));
    const pending = rows.filter((r) => ["pending", "unpaid", "created"].includes(r.status));
    const refunded = rows.filter((r) => !!r.refunded_at || r.status === "refunded");
    const revenue = paid.reduce((s, r) => s + r.amount_cents, 0) / 100;
    return { paid: paid.length, failed: failed.length, pending: pending.length, refunded: refunded.length, revenue };
  }, [rows]);

  const statusColor = (s: string) => {
    if (s === "paid" || s === "completed") return "bg-emerald-500/15 text-emerald-500";
    if (s === "refunded") return "bg-orange-500/15 text-orange-500";
    if (s === "pending" || s === "unpaid" || s === "created") return "bg-amber-500/15 text-amber-500";
    if (s === "failed" || s === "canceled" || s === "expired") return "bg-destructive/15 text-destructive";
    if (s === "disputed") return "bg-purple-500/15 text-purple-500";
    return "bg-muted text-muted-foreground";
  };

  const name = (id: string) => {
    const p = profiles[id];
    return p?.display_name || p?.username || `${id?.slice(0, 8)}…`;
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Payments control"
          subtitle="Who paid for what, whether the payment went through, and why it failed."
          icon={CreditCard}
          badge="Stripe"
          breadcrumbs={[{ label: "Payments control" }]}
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Paid", value: kpi.paid },
            { label: "Revenue", value: `€${kpi.revenue.toFixed(2)}` },
            { label: "Pending", value: kpi.pending },
            { label: "Failed", value: kpi.failed },
            { label: "Refunded", value: kpi.refunded },
          ].map((k) => (
            <AdminGlassCard key={k.label} className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold mt-1">{k.value}</div>
            </AdminGlassCard>
          ))}
        </div>

        <AdminGlassCard className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, product, session or payment intent…"
                className="max-w-md"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading payments…
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(r.created_at), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm" translate="no">
                        {name(r.user_id)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{r.product_type}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {r.product_id ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{(r.amount_cents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.verified_at ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => inspect(r)}
                          disabled={detailLoading === r.id}
                        >
                          {detailLoading === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Inspect"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminGlassCard>

        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment details</DialogTitle>
            </DialogHeader>
            {detail && (
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">Ledger</div>
                  <Row label="User" value={name(detail.record.user_id)} />
                  <Row label="Product" value={`${detail.record.product_type} ${detail.record.product_id ?? ""}`} />
                  <Row label="Amount" value={`€${(detail.record.amount_cents / 100).toFixed(2)}`} />
                  <Row label="DB status" value={detail.record.status} />
                  <Row
                    label="Verified at"
                    value={detail.record.verified_at ? format(new Date(detail.record.verified_at), "yyyy-MM-dd HH:mm") : "not verified"}
                  />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">Stripe</div>
                  <Row label="Intent status" value={detail.stripe.intent_status ?? "—"} />
                  <Row label="Session status" value={detail.stripe.session_status ?? "—"} />
                  <Row label="Payment status" value={detail.stripe.session_payment_status ?? "—"} />
                  <Row label="Charge status" value={detail.stripe.charge_status ?? "—"} />
                  <Row label="Method" value={[detail.stripe.payment_method_type, detail.stripe.card_brand, detail.stripe.card_last4 && `••${detail.stripe.card_last4}`, detail.stripe.card_country].filter(Boolean).join(" · ") || "—"} />
                  <Row label="Email" value={detail.stripe.customer_email ?? "—"} />
                  <Row label="Risk" value={[detail.stripe.risk_level, detail.stripe.network_status].filter(Boolean).join(" · ") || "—"} />
                  <Row label="Refunded" value={detail.stripe.amount_refunded ? `€${(detail.stripe.amount_refunded / 100).toFixed(2)}` : "no"} />
                  <Row label="Disputed" value={detail.stripe.disputed ? "yes" : "no"} />
                </div>
                {(detail.stripe.failure_reason || detail.stripe.failure_code) && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 space-y-1">
                    <div className="font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Why it failed
                    </div>
                    <p>{detail.stripe.failure_reason ?? "Unknown reason"}</p>
                    <p className="text-xs text-muted-foreground">
                      code: {detail.stripe.failure_code ?? "—"}
                      {detail.stripe.decline_code ? ` · decline: ${detail.stripe.decline_code}` : ""}
                    </p>
                  </div>
                )}
                {detail.stripe.receipt_url && (
                  <a
                    href={detail.stripe.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-xs"
                  >
                    Open Stripe receipt
                  </a>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminPageShell>
    </AdminGuard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  );
}
