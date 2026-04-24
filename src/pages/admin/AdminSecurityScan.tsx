import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, RefreshCw, Loader2, AlertTriangle, ShieldCheck, Package, Server, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Severity = "critical" | "high" | "medium" | "low";

interface Snapshot {
  id: string;
  scan_type: "edge_functions" | "frontend_deps";
  trigger_source: "manual" | "cron";
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: any[];
  meta: Record<string, any>;
  duration_ms: number | null;
  created_at: string;
}

const sevColor: Record<Severity, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-orange-500/90 text-white",
  medium: "bg-amber-500/90 text-white",
  low: "bg-muted text-muted-foreground",
};

const Counters = ({ s }: { s: Snapshot }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <Badge className={`${sevColor.critical} justify-center py-1.5`}>Critical {s.critical_count}</Badge>
    <Badge className={`${sevColor.high} justify-center py-1.5`}>High {s.high_count}</Badge>
    <Badge className={`${sevColor.medium} justify-center py-1.5`}>Medium {s.medium_count}</Badge>
    <Badge className={`${sevColor.low} justify-center py-1.5`}>Low {s.low_count}</Badge>
  </div>
);

const FindingRow = ({ f, type }: { f: any; type: Snapshot["scan_type"] }) => (
  <div className="border border-border/40 rounded-lg p-3 bg-background/40 hover:bg-background/60 transition">
    <div className="flex flex-wrap items-center gap-2 mb-1.5">
      <Badge className={sevColor[f.severity as Severity] || sevColor.low}>
        {f.severity?.toUpperCase()}
      </Badge>
      {type === "edge_functions" ? (
        <>
          <code className="text-xs px-1.5 py-0.5 rounded bg-muted">{f.fn}</code>
          <span className="text-xs text-muted-foreground">{f.rule}</span>
        </>
      ) : (
        <>
          <code className="text-xs px-1.5 py-0.5 rounded bg-muted">{f.package}@{f.installed}</code>
          {f.cvss !== undefined && <span className="text-xs text-muted-foreground">CVSS {f.cvss}</span>}
        </>
      )}
    </div>
    <p className="text-sm text-foreground/90">{f.message || f.summary}</p>
    {(f.remediation || f.fixed_in) && (
      <p className="text-xs text-muted-foreground mt-1.5">
        <ShieldCheck className="inline h-3 w-3 mr-1" />
        {f.remediation || `Upgrade to ${f.fixed_in}`}
      </p>
    )}
    {f.references?.length > 0 && (
      <a
        href={f.references[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary inline-flex items-center gap-1 mt-1.5 hover:underline"
      >
        <ExternalLink className="h-3 w-3" /> {f.vuln_id || "Reference"}
      </a>
    )}
  </div>
);

const ScanCard = ({
  type,
  icon: Icon,
  title,
  fnName,
  history,
  onScan,
  scanning,
}: {
  type: Snapshot["scan_type"];
  icon: typeof Server;
  title: string;
  fnName: string;
  history: Snapshot[];
  onScan: () => void;
  scanning: boolean;
}) => {
  const latest = history[0];
  const filtered = history.filter((h) => h.scan_type === type);
  const current = filtered[0];

  return (
    <AdminGlassCard className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {current && (
              <p className="text-xs text-muted-foreground">
                Last scan {formatDistanceToNow(new Date(current.created_at), { addSuffix: true })}
                {" · "}{current.duration_ms ? `${(current.duration_ms / 1000).toFixed(1)}s` : ""}
                {" · "}<span className="capitalize">{current.trigger_source}</span>
              </p>
            )}
          </div>
        </div>
        <Button onClick={onScan} disabled={scanning} size="sm" className="gap-1.5">
          {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Run scan
        </Button>
      </div>

      {current ? (
        <>
          <Counters s={current} />
          {current.findings.length === 0 ? (
            <div className="mt-4 p-6 text-center rounded-lg border border-border/40 bg-background/40">
              <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">No vulnerabilities detected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type === "edge_functions"
                  ? `Scanned ${current.meta.functions_scanned ?? 0} functions, probed ${current.meta.functions_probed ?? 0}`
                  : `Scanned ${current.meta.packages_scanned ?? 0} packages`}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[420px] mt-4 pr-3">
              <div className="space-y-2">
                {[...current.findings]
                  .sort((a, b) => {
                    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
                  })
                  .map((f, i) => <FindingRow key={i} f={f} type={type} />)}
              </div>
            </ScrollArea>
          )}
        </>
      ) : (
        <div className="p-6 text-center rounded-lg border border-dashed border-border/40">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No scan run yet — click "Run scan" to start.</p>
        </div>
      )}

      {filtered.length > 1 && (
        <details className="mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            <Calendar className="inline h-3 w-3 mr-1" />
            History ({filtered.length})
          </summary>
          <div className="mt-2 space-y-1">
            {filtered.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-xs p-2 rounded bg-background/40">
                <span>{new Date(h.created_at).toLocaleString()}</span>
                <span className="flex gap-1">
                  {h.critical_count > 0 && <Badge variant="destructive" className="h-5">{h.critical_count}C</Badge>}
                  {h.high_count > 0 && <Badge className="bg-orange-500/90 h-5">{h.high_count}H</Badge>}
                  <Badge variant="outline" className="h-5">{h.total_findings} total</Badge>
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </AdminGlassCard>
  );
};

export default function AdminSecurityScan() {
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningEdge, setScanningEdge] = useState(false);
  const [scanningDeps, setScanningDeps] = useState(false);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("security_scan_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error(error.message);
    } else {
      setHistory((data ?? []) as Snapshot[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const runScan = async (type: Snapshot["scan_type"]) => {
    const fnName = type === "edge_functions" ? "security-scan-edge-functions" : "security-scan-frontend-deps";
    const setBusy = type === "edge_functions" ? setScanningEdge : setScanningDeps;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke(fnName);
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Scan complete: ${(data as any).total_findings} findings`);
      await loadHistory();
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setBusy(false);
    }
  };

  const edgeHistory = history.filter((h) => h.scan_type === "edge_functions");
  const depsHistory = history.filter((h) => h.scan_type === "frontend_deps");
  const totalCritical = (edgeHistory[0]?.critical_count ?? 0) + (depsHistory[0]?.critical_count ?? 0);

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Security Scan"
          subtitle="Static + runtime audit of edge functions, plus OSV.dev CVE scan of npm dependencies. Auto-runs daily at 03:30 UTC."
          icon={Shield}
          badge={totalCritical > 0 ? `${totalCritical} CRITICAL` : "Healthy"}
          breadcrumbs={[{ label: "Security Scan" }]}
        />

        {totalCritical > 0 && (
          <AdminGlassCard className="p-4 mb-4 border-destructive/40 bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium">
                {totalCritical} critical security {totalCritical === 1 ? "issue" : "issues"} detected — fix immediately.
              </p>
            </div>
          </AdminGlassCard>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="edge" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="edge" className="gap-2">
                <Server className="h-4 w-4" /> Edge Functions
              </TabsTrigger>
              <TabsTrigger value="deps" className="gap-2">
                <Package className="h-4 w-4" /> Dependencies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edge">
              <ScanCard
                type="edge_functions"
                icon={Server}
                title="Edge Function Audit"
                fnName="security-scan-edge-functions"
                history={history}
                onScan={() => runScan("edge_functions")}
                scanning={scanningEdge}
              />
            </TabsContent>

            <TabsContent value="deps">
              <ScanCard
                type="frontend_deps"
                icon={Package}
                title="npm Dependency CVE Scan"
                fnName="security-scan-frontend-deps"
                history={history}
                onScan={() => runScan("frontend_deps")}
                scanning={scanningDeps}
              />
            </TabsContent>
          </Tabs>
        )}
      </AdminPageShell>
    </AdminGuard>
  );
}
