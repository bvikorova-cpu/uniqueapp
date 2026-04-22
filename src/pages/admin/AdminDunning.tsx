import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type DunningEvent = {
  id: string;
  email: string | null;
  amount_due_cents: number;
  currency: string;
  attempt_count: number;
  next_retry_at: string | null;
  hosted_invoice_url: string | null;
  kind: "failed" | "requires_action" | "recovered";
  created_at: string;
  recovered_at: string | null;
  stripe_subscription_id: string | null;
};
type Stats = {
  total_90d: number; recovered: number; open: number;
  recovery_rate_pct: number; at_risk_eur: number;
};

export default function AdminDunning() {
  const { format } = useCurrency();
  const [events, setEvents] = useState<DunningEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "recovered">("open");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-dunning");
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to load");
    } else {
      setEvents((data as any).events);
      setStats((data as any).stats);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = events.filter((e) => {
    if (filter === "open") return e.kind === "failed" || e.kind === "requires_action";
    if (filter === "recovered") return e.kind === "recovered";
    return true;
  });

  const kindBadge = (k: string) => {
    if (k === "recovered") return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 gap-1"><CheckCircle2 className="h-3 w-3" />Recovered</Badge>;
    if (k === "requires_action") return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 gap-1"><AlertCircle className="h-3 w-3" />SCA Required</Badge>;
    return <Badge className="bg-destructive/20 text-destructive border-destructive/40 gap-1"><AlertTriangle className="h-3 w-3" />Failed</Badge>;
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Dunning & Failed Payments"
          subtitle="Track failed subscription charges, retry schedule, and recovery rate."
          icon={AlertTriangle}
          badge="Live"
          breadcrumbs={[{ label: "Dunning" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex gap-2">
              {(["open", "recovered", "all"] as const).map((f) => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                  {f === "open" ? "Open" : f === "recovered" ? "Recovered" : "All"}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total (90d)", value: stats.total_90d.toLocaleString(), icon: Clock, accent: "text-foreground" },
                { label: "Open", value: stats.open.toLocaleString(), icon: AlertTriangle, accent: "text-destructive" },
                { label: "Recovered", value: stats.recovered.toLocaleString(), icon: CheckCircle2, accent: "text-emerald-400" },
                { label: "Recovery Rate", value: `${stats.recovery_rate_pct}%`, icon: CheckCircle2, accent: stats.recovery_rate_pct >= 50 ? "text-emerald-400" : "text-amber-400" },
                { label: "At Risk", value: format(stats.at_risk_eur), icon: AlertCircle, accent: "text-orange-400" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border bg-background/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{k.label}</span>
                    <k.icon className={`h-4 w-4 ${k.accent}`} />
                  </div>
                  <div className={`text-xl font-black ${k.accent}`}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {loading && events.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No dunning events.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-center">Attempt</th>
                    <th className="px-3 py-2">Next Retry</th>
                    <th className="px-3 py-2">When</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-3">{kindBadge(e.kind)}</td>
                      <td className="px-3 py-3 font-mono text-xs">{e.email ?? "—"}</td>
                      <td className="px-3 py-3 text-right font-bold">{format(e.amount_due_cents / 100)}</td>
                      <td className="px-3 py-3 text-center">{e.attempt_count}</td>
                      <td className="px-3 py-3 text-xs">
                        {e.next_retry_at ? new Date(e.next_retry_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        {e.hosted_invoice_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={e.hosted_invoice_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
