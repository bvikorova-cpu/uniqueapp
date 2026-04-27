import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, Users, TrendingUp, UserPlus, Zap } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Metrics = {
  dau: number;
  wau: number;
  mau: number;
  total_users: number;
  new_users: number;
  active_users_window: number;
  stickiness_pct: number;
  window_days: number;
  generated_at: string;
};
type SeriesRow = { day: string; active_users: number; new_users: number };
type Resp = { metrics: Metrics; series: SeriesRow[] };

const WINDOWS = [7, 30, 90] as const;

export default function AdminEngagement() {
  const [data, setData] = useState<Resp | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  const load = async (windowDays: number) => {
    setLoading(true);
    const { data: res, error } = await supabase.functions.invoke("admin-engagement", {
      body: { days: windowDays },
    });
    if (error || (res as any)?.error) {
      toast.error((res as any)?.error || error?.message || "Failed to load");
    } else {
      setData(res as Resp);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const m = data?.metrics;

  const stats = [
    { label: "DAU", value: m?.dau ?? "—", icon: Zap, hint: "Daily active users (24h)" },
    { label: "WAU", value: m?.wau ?? "—", icon: Activity, hint: "Weekly active (7d)" },
    { label: "MAU", value: m?.mau ?? "—", icon: Users, hint: "Monthly active (30d)" },
    { label: "Stickiness", value: m ? `${m.stickiness_pct}%` : "—", icon: TrendingUp, hint: "DAU / MAU ratio" },
    { label: "New users", value: m?.new_users ?? "—", icon: UserPlus, hint: `Signups in ${days}d` },
    { label: "Total users", value: m?.total_users ?? "—", icon: Users, hint: "Lifetime registered" },
  ];

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="User Engagement"
          subtitle="Daily / Monthly active users, stickiness, and signup velocity."
          icon={Activity}
          badge="Live"
          breadcrumbs={[{ label: "Engagement" }]}
        />

        <AdminGlassCard className="p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              {WINDOWS.map((w) => (
                <Button
                  key={w}
                  variant={days === w ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(w)}
                  disabled={loading}
                >
                  {w}d
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <Badge variant="outline" className="text-xs">
                  Updated {new Date(data.metrics.generated_at).toLocaleString()}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => load(days)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.hint}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 p-4">
            <h3 className="text-sm font-semibold mb-3">
              Active users vs new signups — last {days} days
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.series ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="active_users"
                    name="Active users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="new_users"
                    name="New signups"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Active = unique users with at least one <code>activity_feed</code> event or{" "}
            <code>user_activity.last_seen</code> in the window. Stickiness = DAU / MAU × 100.
            Healthy product targets ≥20%; world-class ≥50%.
          </p>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
