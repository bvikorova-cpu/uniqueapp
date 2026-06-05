import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Apple,
  Eye,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type EventRow = {
  event_type: string;
  platform: string;
  created_at: string;
};

const DAYS_OPTIONS = [7, 30, 90] as const;

export default function AdminPwaStats() {
  const [days, setDays] = useState<number>(30);
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (windowDays: number) => {
    setLoading(true);
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("pwa_install_events")
      .select("event_type, platform, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message || "Failed to load PWA stats");
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const stats = useMemo(() => {
    if (!rows) return null;

    const counts: Record<string, number> = {};
    const byPlatform: Record<string, Record<string, number>> = {};
    const daily: Record<string, Record<string, number>> = {};

    for (const r of rows) {
      counts[r.event_type] = (counts[r.event_type] || 0) + 1;

      if (!byPlatform[r.platform]) byPlatform[r.platform] = {};
      byPlatform[r.platform][r.event_type] = (byPlatform[r.platform][r.event_type] || 0) + 1;

      const day = r.created_at.slice(0, 10);
      if (!daily[day]) daily[day] = {};
      daily[day][r.event_type] = (daily[day][r.event_type] || 0) + 1;
    }

    const shown = counts["banner_shown"] || 0;
    const click = counts["install_click"] || 0;
    const accepted = counts["install_accepted"] || 0;
    const dismissed = counts["banner_dismissed"] || 0;
    const installDismissed = counts["install_dismissed"] || 0;
    const openClick = counts["open_click"] || 0;

    const clickRate = shown ? Math.round((click / shown) * 1000) / 10 : 0;
    const acceptRate = click ? Math.round((accepted / click) * 1000) / 10 : 0;
    const overallRate = shown ? Math.round((accepted / shown) * 1000) / 10 : 0;

    const daysArr = Object.keys(daily).sort();
    const funnelSeries = daysArr.map((d) => ({
      day: d,
      shown: daily[d]["banner_shown"] || 0,
      click: daily[d]["install_click"] || 0,
      accepted: daily[d]["install_accepted"] || 0,
      openClick: daily[d]["open_click"] || 0,
    }));

    return {
      counts,
      shown,
      click,
      accepted,
      dismissed,
      installDismissed,
      openClick,
      clickRate,
      acceptRate,
      overallRate,
      byPlatform,
      funnelSeries,
    };
  }, [rows]);

  const statCards = stats
    ? [
        { label: "Banner shown", value: stats.shown, icon: Eye },
        { label: "Install clicks", value: stats.click, icon: MousePointerClick },
        { label: "Installs accepted", value: stats.accepted, icon: CheckCircle2 },
        { label: "Open clicks", value: stats.openClick, icon: Download },
        { label: "Banner dismissed", value: stats.dismissed, icon: XCircle },
        { label: "Click → Install", value: `${stats.acceptRate}%`, icon: TrendingUp },
      ]
    : [];

  const platformBadge = (p: string) => {
    switch (p) {
      case "ios":
        return <Apple className="h-3.5 w-3.5" />;
      case "android":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "desktop":
        return <Monitor className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="PWA Install Stats"
          subtitle="Track banner impressions, install clicks, and accepted installs across platforms."
          icon={Download}
          badge="Live"
          breadcrumbs={[{ label: "PWA Stats" }]}
        />

        <AdminGlassCard className="p-4 sm:p-6">
          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              {DAYS_OPTIONS.map((w) => (
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
              {stats && (
                <Badge variant="outline" className="text-xs">
                  {stats.shown.toLocaleString()} events
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => load(days)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-4"
                  >
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                ))
              : statCards.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-4"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </div>
                    <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
                  </div>
                ))}
          </div>

          {/* Funnel daily trend */}
          <div className="rounded-xl border border-border/40 bg-card/40 p-4 mb-8">
            <h3 className="text-sm font-semibold mb-3">
              Daily funnel — last {days} days
            </h3>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : stats && stats.funnelSeries.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No data yet. Events will appear once users see the install banner.
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.funnelSeries ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      allowDecimals={false}
                    />
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
                      dataKey="shown"
                      name="Banner shown"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="click"
                      name="Install clicks"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="accepted"
                      name="Installs accepted"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="openClick"
                      name="Open clicks"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Platform breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border/40 bg-card/40 p-4">
              <h3 className="text-sm font-semibold mb-3">Events by platform</h3>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : stats && Object.keys(stats.byPlatform).length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">No data.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(stats?.byPlatform ?? {}).map(([platform, events]) => ({
                        platform,
                        shown: events["banner_shown"] || 0,
                        click: events["install_click"] || 0,
                        accepted: events["install_accepted"] || 0,
                        open: events["open_click"] || 0,
                      }))}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                      <XAxis
                        dataKey="platform"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="shown" name="Shown" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="click" name="Click" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="open" name="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/40 bg-card/40 p-4">
              <h3 className="text-sm font-semibold mb-3">Platform breakdown table</h3>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : stats && Object.keys(stats.byPlatform).length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">No data.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-2 pr-4">Platform</th>
                        <th className="py-2 pr-4 text-right">Shown</th>
                        <th className="py-2 pr-4 text-right">Click</th>
                        <th className="py-2 pr-4 text-right">Accepted</th>
                        <th className="py-2 pr-4 text-right">Open</th>
                        <th className="py-2 pr-4 text-right">Conv.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byPlatform).map(([platform, events]) => {
                        const s = events["banner_shown"] || 0;
                        const a = events["install_accepted"] || 0;
                        const conv = s ? Math.round((a / s) * 1000) / 10 : 0;
                        return (
                          <tr key={platform} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium flex items-center gap-2 capitalize">
                              {platformBadge(platform)}
                              {platform}
                            </td>
                            <td className="py-3 pr-4 text-right">{events["banner_shown"] || 0}</td>
                            <td className="py-3 pr-4 text-right">{events["install_click"] || 0}</td>
                            <td className="py-3 pr-4 text-right">{events["install_accepted"] || 0}</td>
                            <td className="py-3 pr-4 text-right">{events["open_click"] || 0}</td>
                            <td className="py-3 pr-4 text-right font-semibold">{conv}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Conversion = accepted installs / banner shown. Click-through = install clicks / banner shown.
            Data comes from <code>pwa_install_events</code>. All users (anon + auth) are tracked.
          </p>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
