import { useEffect, useState } from "react";
import { Activity, Database, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface PerfStats {
  jobs_pending: number;
  jobs_processing: number;
  jobs_failed: number;
  jobs_done_24h: number;
  idempotency_active: number;
  db_size_mb: number;
}

export default function AdminPerformance() {
  const [stats, setStats] = useState<PerfStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_perf_stats");
      if (error) setErr(error.message);
      else setStats(data as unknown as PerfStats);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  const cards = stats
    ? [
        { label: "Jobs pending", value: stats.jobs_pending, icon: Clock, tone: "text-amber-500" },
        { label: "Jobs processing", value: stats.jobs_processing, icon: Activity, tone: "text-blue-500" },
        { label: "Jobs failed", value: stats.jobs_failed, icon: AlertTriangle, tone: "text-red-500" },
        { label: "Jobs done (24h)", value: stats.jobs_done_24h, icon: Activity, tone: "text-emerald-500" },
        { label: "Idempotency keys active", value: stats.idempotency_active, icon: Database, tone: "text-purple-500" },
        { label: "DB size (MB)", value: stats.db_size_mb, icon: Database, tone: "text-pink-500" },
      ]
    : [];

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Performance"
          subtitle="Async job queue, idempotency cache, database footprint. Refreshes every 15s."
          icon={Activity}
          badge="Scale"
          breadcrumbs={[{ label: "Performance" }]}
        />
        {loading && !stats && <AdminGlassCard className="p-6">Loading…</AdminGlassCard>}
        {err && <AdminGlassCard className="p-6 text-red-500">{err}</AdminGlassCard>}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <AdminGlassCard key={c.label} className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${c.tone}`} />
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                  </div>
                  <div className="text-3xl font-semibold">{c.value?.toLocaleString?.() ?? c.value}</div>
                </AdminGlassCard>
              );
            })}
          </div>
        )}
        <AdminGlassCard className="p-6 mt-6 text-sm text-muted-foreground">
          <p className="font-semibold mb-2 text-foreground">Load testing</p>
          <p>Run <code className="px-1 rounded bg-muted">k6 run scripts/loadtest/wall-feed.js</code> to benchmark public routes. See <code>scripts/loadtest/README.md</code>.</p>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
