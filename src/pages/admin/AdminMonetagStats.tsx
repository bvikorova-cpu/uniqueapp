import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, DollarSign, Eye, MousePointerClick, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const PROJECT_REF = "jufrdzeonywluwutvyxz";
const POSTBACK_URL =
  `https://${PROJECT_REF}.functions.supabase.co/monetag-postback` +
  `?event_type={event_type}&zone_id={zone_id}&revenue={revenue}` +
  `&ymid={ymid}&sub_id={sub_id_5}&country={country_iso}`;

type Row = {
  event_at: string;
  event_type: string;
  zone_id: string | null;
  revenue: number;
};

export default function AdminMonetagStats() {
  const [days, setDays] = useState(7);
  const since = useMemo(
    () => new Date(Date.now() - days * 86400 * 1000).toISOString(),
    [days],
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["monetag-stats", days],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("monetag_ad_events")
        .select("event_at,event_type,zone_id,revenue")
        .gte("event_at", since)
        .order("event_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const summary = useMemo(() => {
    const rows = data ?? [];
    const impressions = rows.filter((r) =>
      ["impression", "imp", "view", "show"].includes(r.event_type),
    ).length;
    const clicks = rows.filter((r) =>
      ["click", "clk"].includes(r.event_type),
    ).length;
    const revenue = rows.reduce((a, r) => a + Number(r.revenue || 0), 0);
    const ctr = impressions ? (clicks / impressions) * 100 : 0;

    const byDay = new Map<string, { imp: number; clk: number; rev: number }>();
    for (const r of rows) {
      const d = r.event_at.slice(0, 10);
      const e = byDay.get(d) ?? { imp: 0, clk: 0, rev: 0 };
      if (["impression", "imp", "view", "show"].includes(r.event_type)) e.imp++;
      if (["click", "clk"].includes(r.event_type)) e.clk++;
      e.rev += Number(r.revenue || 0);
      byDay.set(d, e);
    }
    const daysArr = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));

    const byZone = new Map<string, { imp: number; clk: number; rev: number }>();
    for (const r of rows) {
      const z = r.zone_id ?? "—";
      const e = byZone.get(z) ?? { imp: 0, clk: 0, rev: 0 };
      if (["impression", "imp", "view", "show"].includes(r.event_type)) e.imp++;
      if (["click", "clk"].includes(r.event_type)) e.clk++;
      e.rev += Number(r.revenue || 0);
      byZone.set(z, e);
    }
    const zonesArr = Array.from(byZone.entries()).sort((a, b) => b[1].rev - a[1].rev);

    return { impressions, clicks, revenue, ctr, daysArr, zonesArr };
  }, [data]);

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Monetag Stats"
          subtitle="Impressions, clicks and revenue from the Multitag / Monetag ad zones."
          icon={BarChart3}
          badge="Ads"
          breadcrumbs={[{ label: "Monetag Stats" }]}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat icon={Eye} label="Impressions" value={summary.impressions.toLocaleString()} />
          <Stat icon={MousePointerClick} label="Clicks" value={summary.clicks.toLocaleString()} sub={`CTR ${summary.ctr.toFixed(2)}%`} />
          <Stat icon={DollarSign} label="Revenue" value={`$${summary.revenue.toFixed(4)}`} />
          <Stat icon={BarChart3} label="Events" value={(data?.length ?? 0).toLocaleString()} sub={isLoading ? "loading…" : `last ${days}d`} />
        </div>

        <AdminGlassCard className="p-4 sm:p-6 mb-4">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Postback URL (configure in Monetag)</h3>
          <code className="block break-all text-xs bg-muted/40 rounded-md p-3 text-foreground/80">
            {POSTBACK_URL}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Paste this URL into Monetag Dashboard → Zone settings → Postback. Macros are auto-replaced.
          </p>
        </AdminGlassCard>

        <div className="grid lg:grid-cols-2 gap-4">
          <AdminGlassCard className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3 text-foreground">By day</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Imp.</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.daysArr.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-6">No events yet — configure the postback URL above.</TableCell></TableRow>
                )}
                {summary.daysArr.map(([d, e]) => (
                  <TableRow key={d}>
                    <TableCell className="text-xs">{d}</TableCell>
                    <TableCell className="text-right">{e.imp}</TableCell>
                    <TableCell className="text-right">{e.clk}</TableCell>
                    <TableCell className="text-right">${e.rev.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminGlassCard>

          <AdminGlassCard className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3 text-foreground">By zone</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">Imp.</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.zonesArr.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-6">No zone data yet.</TableCell></TableRow>
                )}
                {summary.zonesArr.map(([z, e]) => (
                  <TableRow key={z}>
                    <TableCell className="text-xs font-mono">{z}</TableCell>
                    <TableCell className="text-right">{e.imp}</TableCell>
                    <TableCell className="text-right">{e.clk}</TableCell>
                    <TableCell className="text-right">${e.rev.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminGlassCard>
        </div>
      </AdminPageShell>
    </AdminGuard>
  );
}

function Stat({
  icon: Icon, label, value, sub,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <Card className="bg-gradient-to-br from-card/90 to-card/70 border border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          <Icon className="w-4 h-4" /> {label}
        </div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
