import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, RefreshCw, DollarSign, Users, AlertCircle,
  Activity, Calendar, Pause,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type Analytics = {
  mrr: number; arr: number; arpu: number; ltv: number;
  active: number; trialing: number; past_due: number;
  canceled_total: number; scheduled_to_cancel: number;
  churn_30d_pct: number; churned_30d: number;
  trend: { month: string; revenue: number; invoices: number }[];
  generated_at: string;
};

export default function AdminSubscriptionAnalytics() {
  const { format } = useCurrency();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.functions.invoke("admin-subscription-analytics");
    if (error || (res as any)?.error) {
      toast.error((res as any)?.error || error?.message || "Failed to load");
    } else {
      setData(res as Analytics);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const kpis = data && [
    { label: "MRR", value: format(data.mrr), icon: DollarSign, accent: "text-emerald-400" },
    { label: "ARR", value: format(data.arr), icon: TrendingUp, accent: "text-emerald-400" },
    { label: "Active", value: data.active.toLocaleString(), icon: Users, accent: "text-primary" },
    { label: "Trialing", value: data.trialing.toLocaleString(), icon: Activity, accent: "text-blue-400" },
    { label: "Past Due", value: data.past_due.toLocaleString(), icon: AlertCircle, accent: "text-orange-400" },
    { label: "Scheduled to Cancel", value: data.scheduled_to_cancel.toLocaleString(), icon: Pause, accent: "text-amber-400" },
    { label: "ARPU", value: format(data.arpu), icon: Users, accent: "text-foreground" },
    { label: "LTV (est.)", value: format(data.ltv), icon: TrendingUp, accent: "text-accent" },
    { label: "30d Churn", value: `${data.churn_30d_pct}%`, icon: AlertCircle, accent: data.churn_30d_pct > 5 ? "text-red-400" : "text-emerald-400" },
    { label: "Churned (30d)", value: data.churned_30d.toLocaleString(), icon: Calendar, accent: "text-muted-foreground" },
  ];

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Subscription Analytics"
          subtitle="MRR, ARR, churn, LTV and 12-month revenue trend — pulled live from Stripe."
          icon={TrendingUp}
          badge="Live"
          breadcrumbs={[{ label: "Subscription Analytics" }]}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : !data ? (
            <p className="text-center text-muted-foreground py-12">No data.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {kpis!.map((k) => (
                  <div key={k.label} className="rounded-xl border bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{k.label}</span>
                      <k.icon className={`h-4 w-4 ${k.accent}`} />
                    </div>
                    <div className={`text-xl font-black ${k.accent}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-background/40 p-4">
                <h3 className="font-bold mb-4">12-Month Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => format(v)} width={70} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v: number, key) => key === "revenue" ? format(v) : v}
                    />
                    <Area
                      type="monotone" dataKey="revenue"
                      stroke="hsl(var(--primary))" strokeWidth={2}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
