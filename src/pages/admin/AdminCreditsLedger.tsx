import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, RefreshCw, Search, Download, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface LedgerRow {
  id: string;
  user_id: string;
  delta: number;
  balance_before: number | null;
  balance_after: number | null;
  reason: string | null;
  source: string | null;
  actor: string | null;
  metadata: any;
  created_at: string;
}

const PAGE_SIZE = 200;

export default function AdminCreditsLedger() {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    let q = (supabase as any)
      .from("ai_credits_ledger")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (userFilter.trim()) q = q.eq("user_id", userFilter.trim());
    if (reasonFilter !== "all") q = q.eq("reason", reasonFilter);
    if (dateFrom) q = q.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) q = q.lte("created_at", new Date(dateTo + "T23:59:59").toISOString());
    if (directionFilter === "credit") q = q.gt("delta", 0);
    if (directionFilter === "debit") q = q.lt("delta", 0);

    const { data, error } = await q;
    if (error) {
      toast.error("Failed to load ledger: " + error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reasons = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.reason && s.add(r.reason));
    return Array.from(s).sort();
  }, [rows]);

  const stats = useMemo(() => {
    const credits = rows.filter((r) => r.delta > 0).reduce((s, r) => s + r.delta, 0);
    const debits = rows.filter((r) => r.delta < 0).reduce((s, r) => s + r.delta, 0);
    return { credits, debits, net: credits + debits, count: rows.length };
  }, [rows]);

  const exportCsv = () => {
    const headers = ["created_at", "user_id", "delta", "balance_before", "balance_after", "reason", "source", "actor"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.created_at, r.user_id, r.delta, r.balance_before ?? "", r.balance_after ?? "", r.reason ?? "", r.source ?? "", r.actor ?? ""]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_credits_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          icon={Coins}
          title="AI Credits Ledger"
          description="Audit trail všetkých zmien ai_credits — kto, kedy, prečo."
        />

        <AdminGlassCard className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">User ID (UUID)</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="user_id..."
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reason</label>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {reasons.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="credit">Credits (+)</SelectItem>
                  <SelectItem value="debit">Debits (−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Apply filters
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </AdminGlassCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Rows</div>
            <div className="text-2xl font-bold">{stats.count}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Credits</div>
            <div className="text-2xl font-bold text-green-500">+{stats.credits}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" /> Debits</div>
            <div className="text-2xl font-bold text-red-500">{stats.debits}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Net</div>
            <div className={`text-2xl font-bold ${stats.net >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stats.net >= 0 ? "+" : ""}{stats.net}
            </div>
          </AdminGlassCard>
        </div>

        <AdminGlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-right p-3">Δ</th>
                  <th className="text-right p-3">Before</th>
                  <th className="text-right p-3">After</th>
                  <th className="text-left p-3">Reason</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Actor</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {!loading && !rows.length && (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No ledger entries match these filters.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 whitespace-nowrap text-xs">{format(new Date(r.created_at), "yyyy-MM-dd HH:mm:ss")}</td>
                    <td className="p-3 font-mono text-xs">
                      <button
                        className="hover:underline"
                        onClick={() => { setUserFilter(r.user_id); load(); }}
                        title="Filter by this user"
                      >
                        {r.user_id.slice(0, 8)}…
                      </button>
                    </td>
                    <td className={`p-3 text-right font-bold ${r.delta > 0 ? "text-green-500" : "text-red-500"}`}>
                      {r.delta > 0 ? "+" : ""}{r.delta}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{r.balance_before ?? "—"}</td>
                    <td className="p-3 text-right">{r.balance_after ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant={r.reason === "unknown_update" ? "destructive" : "secondary"}>
                        {r.reason ?? "—"}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.source ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{r.actor ? r.actor.slice(0, 8) + "…" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === PAGE_SIZE && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t border-border/40">
              Showing first {PAGE_SIZE} rows. Use filters to narrow.
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
