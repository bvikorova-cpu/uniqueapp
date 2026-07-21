import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, RefreshCcw, Download, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditRow {
  id: string;
  user_id: string | null;
  email: string | null;
  fan_club_id: string | null;
  outcome: string;
  error_message: string | null;
  stripe_customer_id: string | null;
  subscriptions_found: number;
  memberships_synced: number;
  status_summary: Record<string, number> | null;
  duration_ms: number | null;
  created_at: string;
}

const OUTCOME_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  no_customer: "secondary",
  partial_error: "destructive",
  stripe_error: "destructive",
  auth_error: "destructive",
  no_email: "destructive",
};

const Inner = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<string>("all");
  const [limit, setLimit] = useState(200);

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("fanclub_verify_audit" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (outcome !== "all") query = query.eq("outcome", outcome);
      const { data, error } = await query;
      if (error) throw error;
      setRows((data as unknown as AuditRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, limit]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return rows;
    return rows.filter(
      (r) =>
        (r.email ?? "").toLowerCase().includes(ql) ||
        (r.user_id ?? "").toLowerCase().includes(ql) ||
        (r.fan_club_id ?? "").toLowerCase().includes(ql) ||
        (r.error_message ?? "").toLowerCase().includes(ql) ||
        (r.stripe_customer_id ?? "").toLowerCase().includes(ql),
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const total = rows.length;
    const errors = rows.filter((r) =>
      ["partial_error", "stripe_error", "auth_error", "no_email"].includes(r.outcome),
    ).length;
    const success = rows.filter((r) => r.outcome === "success").length;
    const avgMs =
      rows.length > 0
        ? Math.round(rows.reduce((a, r) => a + (r.duration_ms ?? 0), 0) / rows.length)
        : 0;
    return { total, errors, success, avgMs };
  }, [rows]);

  const exportCsv = () => {
    const header = [
      "created_at",
      "outcome",
      "email",
      "user_id",
      "fan_club_id",
      "stripe_customer_id",
      "subscriptions_found",
      "memberships_synced",
      "status_summary",
      "duration_ms",
      "error_message",
    ];
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        [
          r.created_at,
          r.outcome,
          r.email ?? "",
          r.user_id ?? "",
          r.fan_club_id ?? "",
          r.stripe_customer_id ?? "",
          r.subscriptions_found,
          r.memberships_synced,
          JSON.stringify(r.status_summary ?? {}),
          r.duration_ms ?? "",
          (r.error_message ?? "").replace(/"/g, '""'),
        ]
          .map((v) => `"${String(v)}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fanclub-verify-audit-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        icon={ShieldCheck}
        title="Fan Club Verify Audit"
        subtitle="Every call to fanclub-verify with outcome, timing, and error reason."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <AdminGlassCard className="p-4">
          <div className="text-xs text-muted-foreground">Total (loaded)</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </AdminGlassCard>
        <AdminGlassCard className="p-4">
          <div className="text-xs text-muted-foreground">Success</div>
          <div className="text-2xl font-bold text-green-500">{stats.success}</div>
        </AdminGlassCard>
        <AdminGlassCard className="p-4">
          <div className="text-xs text-muted-foreground">Errors</div>
          <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
        </AdminGlassCard>
        <AdminGlassCard className="p-4">
          <div className="text-xs text-muted-foreground">Avg duration</div>
          <div className="text-2xl font-bold">{stats.avgMs} ms</div>
        </AdminGlassCard>
      </div>

      <AdminGlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search email / user_id / fan_club_id / error / customer…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="success">success</SelectItem>
              <SelectItem value="no_customer">no_customer</SelectItem>
              <SelectItem value="partial_error">partial_error</SelectItem>
              <SelectItem value="stripe_error">stripe_error</SelectItem>
              <SelectItem value="auth_error">auth_error</SelectItem>
              <SelectItem value="no_email">no_email</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Outcome</th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Fan club</th>
                <th className="py-2 pr-3">Subs</th>
                <th className="py-2 pr-3">Synced</th>
                <th className="py-2 pr-3">Statuses</th>
                <th className="py-2 pr-3">ms</th>
                <th className="py-2 pr-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 pr-3 whitespace-nowrap" title={r.created_at}>
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge variant={OUTCOME_COLORS[r.outcome] ?? "outline"}>{r.outcome}</Badge>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="font-mono text-xs">{r.email ?? "—"}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {r.user_id?.slice(0, 8) ?? "—"}
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {r.fan_club_id?.slice(0, 8) ?? <span className="text-muted-foreground">all</span>}
                  </td>
                  <td className="py-2 pr-3 text-center">{r.subscriptions_found}</td>
                  <td className="py-2 pr-3 text-center">{r.memberships_synced}</td>
                  <td className="py-2 pr-3 text-xs">
                    {r.status_summary
                      ? Object.entries(r.status_summary).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="mr-1">
                            {k}: {v}
                          </Badge>
                        ))
                      : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right">{r.duration_ms ?? "—"}</td>
                  <td className="py-2 pr-3 max-w-xs">
                    <span className="text-destructive text-xs">{r.error_message ?? ""}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    {loading ? "Loading…" : "No audit entries."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>
    </AdminPageShell>
  );
};

export default function AdminFanClubVerifyAudit() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
