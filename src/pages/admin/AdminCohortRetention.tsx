import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Cell = { count: number; pct: number };
type Cohort = { month: string; size: number; cells: Cell[] };
type Resp = { cohorts: Cohort[]; cohort_months: number; generated_at: string };

const heat = (pct: number) => {
  // 0% → muted, 100% → primary at full opacity
  const a = Math.min(1, Math.max(0, pct / 100));
  return `hsl(var(--primary) / ${0.08 + a * 0.7})`;
};

export default function AdminCohortRetention() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.functions.invoke("admin-cohort-retention");
    if (error || (res as any)?.error) {
      toast.error((res as any)?.error || error?.message || "Failed to load");
    } else {
      setData(res as Resp);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const months = data?.cohort_months ?? 12;

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Cohort Retention"
          subtitle="Monthly subscriber cohorts and their retention curves — pulled live from Stripe."
          icon={LayoutGrid}
          badge="Live"
          breadcrumbs={[{ label: "Cohort Retention" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            {data && (
              <Badge variant="outline" className="text-xs">
                Updated {new Date(data.generated_at).toLocaleString()}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : !data ? (
            <p className="text-center text-muted-foreground py-12">No data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground font-medium px-2 py-1 sticky left-0 bg-background/80 backdrop-blur z-10">
                      Cohort
                    </th>
                    <th className="text-right text-muted-foreground font-medium px-2 py-1">Size</th>
                    {Array.from({ length: months }).map((_, i) => (
                      <th key={i} className="text-center text-muted-foreground font-medium px-1 py-1 min-w-[44px]">
                        M{i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((c) => (
                    <tr key={c.month}>
                      <td className="font-mono px-2 py-1 sticky left-0 bg-background/80 backdrop-blur z-10">
                        {c.month}
                      </td>
                      <td className="text-right font-bold px-2 py-1">{c.size}</td>
                      {Array.from({ length: months }).map((_, i) => {
                        const cell = c.cells[i];
                        if (!cell) {
                          return <td key={i} className="px-1 py-1 text-center text-muted-foreground/30">—</td>;
                        }
                        return (
                          <td
                            key={i}
                            className="text-center px-1 py-2 rounded font-medium"
                            style={{ background: heat(cell.pct), color: cell.pct > 50 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))" }}
                            title={`${cell.count} of ${c.size} retained`}
                          >
                            {cell.pct}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-6 text-xs text-muted-foreground">
                M0 = signup month (always 100% by definition for that cohort's lived members). Each subsequent column shows
                the share of the original cohort still on an uncanceled subscription that many months later. Empty cells (—)
                are months that haven't elapsed yet for that cohort.
              </p>
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
