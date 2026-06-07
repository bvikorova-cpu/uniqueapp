import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { maskUUID, maskIP } from "@/lib/maskPII";

type Row = {
  id: string;
  user_id: string | null;
  event_type: string;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

const EVENT_TYPES = [
  "all",
  "email_change_requested",
  "email_change_failed",
  "password_change_succeeded",
  "password_change_failed",
  "reauth_succeeded",
  "reauth_failed",
  "mfa_enrolled",
  "mfa_unenrolled",
  "idle_logout",
  "manual_signout",
] as const;

const PAGE_SIZE = 50;

function severityFor(eventType: string): "destructive" | "default" | "secondary" {
  if (eventType.endsWith("_failed")) return "destructive";
  if (eventType === "idle_logout") return "secondary";
  return "default";
}

export default function AdminAuditLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = (supabase as any)
      .from("security_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (eventFilter !== "all") q = q.eq("event_type", eventFilter);
    if (userFilter.trim()) q = q.eq("user_id", userFilter.trim());
    if (fromDate) q = q.gte("created_at", new Date(fromDate).toISOString());
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      q = q.lte("created_at", end.toISOString());
    }

    const { data, error, count } = await q;
    if (error) {
      toast.error(`Load failed: ${error.message}`);
      setRows([]);
      setTotalCount(0);
    } else {
      setRows((data ?? []) as Row[]);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, eventFilter]);

  const onApplyFilters = () => {
    setPage(0);
    load();
  };

  const onReset = () => {
    setEventFilter("all");
    setUserFilter("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const totalPages = useMemo(
    () => (totalCount == null ? 0 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE))),
    [totalCount]
  );

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Security Audit Log"
        subtitle="Account changes, MFA, idle logouts, re-auth attempts. PII is masked."
        icon={ShieldAlert}
        badge="P5"
      />

      <AdminGlassCard className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Event type</label>
            <Select value={eventFilter} onValueChange={(v) => { setPage(0); setEventFilter(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">User ID (uuid)</label>
            <Input
              placeholder="e.g. 1a2b3c4d-…"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={onApplyFilters} className="flex-1">
              <Search className="h-4 w-4 mr-1" /> Apply
            </Button>
            <Button variant="outline" onClick={onReset}>Reset</Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {totalCount == null ? "—" : `${totalCount} events`} · Page {page + 1} / {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => load()} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={loading || page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || page + 1 >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AdminGlassCard>

      <AdminGlassCard className="mt-4 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">When</th>
                <th className="text-left px-3 py-2">Event</th>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Resource</th>
                <th className="text-left px-3 py-2">IP</th>
                <th className="text-left px-3 py-2">UA</th>
                <th className="text-left px-3 py-2">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No events match the filters.</td></tr>
              )}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground" title={r.created_at}>
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={severityFor(r.event_type)} className="text-[10px]">
                      {r.event_type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs" title={r.user_id ?? ""}>
                    {maskUUID(r.user_id)}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.resource ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{maskIP(r.ip_address) || "—"}</td>
                  <td className="px-3 py-2 text-xs max-w-[200px] truncate" title={r.user_agent ?? ""}>
                    {r.user_agent ? r.user_agent.slice(0, 40) + (r.user_agent.length > 40 ? "…" : "") : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[260px]">
                    {r.metadata && Object.keys(r.metadata).length > 0 ? (
                      <code className="text-[10px] text-muted-foreground break-all">
                        {JSON.stringify(r.metadata)}
                      </code>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>
    </AdminPageShell>
  );
}
