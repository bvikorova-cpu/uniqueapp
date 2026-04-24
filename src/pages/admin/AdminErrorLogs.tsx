import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bug, RefreshCw, AlertTriangle, AlertCircle, Info,
  Trash2, Search, Activity, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Severity = "error" | "warning" | "info";

interface ErrorLog {
  id: string;
  user_id: string | null;
  severity: Severity;
  error_message: string;
  error_stack: string | null;
  component_stack: string | null;
  route: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

const SEVERITY_META: Record<Severity, { color: string; bg: string; icon: typeof AlertCircle }> = {
  error: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: AlertCircle },
  warning: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
  info: { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30", icon: Info },
};

export default function AdminErrorLogs() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("app_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Failed to load error logs");
    } else {
      setLogs(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-error-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "app_error_logs" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (severityFilter !== "all" && l.severity !== severityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.error_message.toLowerCase().includes(q) ||
          (l.route ?? "").toLowerCase().includes(q) ||
          (l.error_stack ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, severityFilter, search]);

  const stats = useMemo(() => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recent = logs.filter((l) => new Date(l.created_at).getTime() > last24h);
    return {
      total: logs.length,
      errors24h: recent.filter((l) => l.severity === "error").length,
      warnings24h: recent.filter((l) => l.severity === "warning").length,
      uniqueUsers24h: new Set(recent.map((l) => l.user_id).filter(Boolean)).size,
    };
  }, [logs]);

  const purgeOld = async () => {
    if (!confirm("Delete logs older than 30 days?")) return;
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await (supabase as any)
      .from("app_error_logs")
      .delete()
      .lt("created_at", cutoff);
    if (error) toast.error("Purge failed");
    else {
      toast.success("Old logs purged");
      load();
    }
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Error Logs & Health"
          subtitle="Real-time application errors, warnings, and system health monitoring."
          icon={Bug}
          badge="Live"
          breadcrumbs={[{ label: "Error Logs" }]}
        />

        {/* System health */}
        <div className="mb-6">
          <SystemHealthMonitor />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total logs", value: stats.total, icon: Activity, color: "text-foreground" },
            { label: "Errors (24h)", value: stats.errors24h, icon: AlertCircle, color: "text-destructive" },
            { label: "Warnings (24h)", value: stats.warnings24h, icon: AlertTriangle, color: "text-amber-500" },
            { label: "Affected users (24h)", value: stats.uniqueUsers24h, icon: TrendingUp, color: "text-primary" },
          ].map((k) => (
            <AdminGlassCard key={k.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <div className={`text-2xl font-black ${k.color}`}>{k.value.toLocaleString()}</div>
            </AdminGlassCard>
          ))}
        </div>

        <AdminGlassCard className="p-4 sm:p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, routes, stacks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="error">Errors only</SelectItem>
                <SelectItem value="warning">Warnings only</SelectItem>
                <SelectItem value="info">Info only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={purgeOld}>
              <Trash2 className="h-4 w-4 mr-2" />
              Purge &gt;30d
            </Button>
          </div>

          {/* Log list */}
          {loading && logs.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No logs match your filters.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((log) => {
                const meta = SEVERITY_META[log.severity];
                const Icon = meta.icon;
                const isOpen = expanded === log.id;
                return (
                  <div
                    key={log.id}
                    className={`rounded-lg border ${meta.bg} p-3 cursor-pointer transition-colors hover:bg-opacity-80`}
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${meta.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className={`${meta.color} text-[10px] uppercase`}>
                            {log.severity}
                          </Badge>
                          {log.route && (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {log.route}
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm font-medium break-words">{log.error_message}</p>
                        {isOpen && (
                          <div className="mt-3 space-y-2 text-xs">
                            {log.error_stack && (
                              <div>
                                <div className="font-bold mb-1 text-muted-foreground">Stack</div>
                                <pre className="whitespace-pre-wrap break-words bg-background/50 p-2 rounded font-mono max-h-48 overflow-auto">
                                  {log.error_stack}
                                </pre>
                              </div>
                            )}
                            {log.component_stack && (
                              <div>
                                <div className="font-bold mb-1 text-muted-foreground">Component stack</div>
                                <pre className="whitespace-pre-wrap break-words bg-background/50 p-2 rounded font-mono max-h-32 overflow-auto">
                                  {log.component_stack}
                                </pre>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 text-muted-foreground">
                              {log.user_id && <span>User: <code className="font-mono">{log.user_id.slice(0, 8)}…</code></span>}
                              {log.user_agent && <span className="truncate max-w-md">UA: {log.user_agent}</span>}
                            </div>
                            {log.metadata && (
                              <pre className="bg-background/50 p-2 rounded font-mono max-h-32 overflow-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
