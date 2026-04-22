import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, Search, Loader2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefundButton } from "@/components/admin/RefundButton";
import { format } from "date-fns";

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
  refunded_at: string | null;
  refund_amount_cents: number | null;
  stripe_refund_id: string | null;
  created_at: string;
}

export default function AdminRefunds() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as PaymentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.product_type?.toLowerCase().includes(q) ||
      r.product_id?.toLowerCase().includes(q) ||
      r.stripe_payment_intent_id?.toLowerCase().includes(q) ||
      r.user_id?.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  const statusColor = (s: string) => {
    if (s === "paid" || s === "completed") return "bg-emerald-500/15 text-emerald-500";
    if (s === "refunded") return "bg-orange-500/15 text-orange-500";
    if (s === "pending") return "bg-amber-500/15 text-amber-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Payments & Refunds"
          subtitle="Browse Stripe payments and issue refunds via the universal payment ledger."
          icon={Receipt}
          badge="Stripe"
          breadcrumbs={[{ label: "Payments & Refunds" }]}
        />

        <AdminGlassCard className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, user, payment intent…"
              className="max-w-md"
            />
          </div>

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
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe PI</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                  {filtered.map((r) => {
                    const eur = (r.amount_cents / 100);
                    const refundable =
                      !r.refunded_at &&
                      !!r.stripe_payment_intent_id &&
                      (r.status === "paid" || r.status === "completed");
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {format(new Date(r.created_at), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{r.product_type}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {r.product_id ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] truncate max-w-[140px]">
                          {r.user_id?.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          €{eur.toFixed(2)}
                          {r.refund_amount_cents != null && (
                            <div className="text-[10px] text-orange-500 font-normal">
                              -€{(r.refund_amount_cents / 100).toFixed(2)} refunded
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor(r.status)}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] truncate max-w-[140px]">
                          {r.stripe_payment_intent_id?.slice(0, 16) ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {refundable ? (
                            <RefundButton
                              paymentRecordId={r.id}
                              amount={eur}
                              onRefunded={load}
                            />
                          ) : r.refunded_at ? (
                            <span className="text-[11px] text-muted-foreground">
                              Refunded
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
