import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Zap, MousePointerClick, Layers, Clock, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SummaryRow = { metric: string; samples: number; p50: number; p75: number; p95: number; good_pct: number };
type DailyRow = { day: string; p75: number; samples: number };

const METRICS = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
type MetricName = typeof METRICS[number];

// Core Web Vitals thresholds (good / needs improvement / poor)
const THRESHOLDS: Record<MetricName, { good: number; poor: number; unit: string; icon: typeof Zap; label: string }> = {
  LCP:  { good: 2500, poor: 4000, unit: "ms",  icon: Zap,               label: "Largest Contentful Paint" },
  INP:  { good: 200,  poor: 500,  unit: "ms",  icon: MousePointerClick, label: "Interaction to Next Paint" },
  CLS:  { good: 0.1,  poor: 0.25, unit: "",    icon: Layers,            label: "Cumulative Layout Shift" },
  FCP:  { good: 1800, poor: 3000, unit: "ms",  icon: Activity,          label: "First Contentful Paint" },
  TTFB: { good: 800,  poor: 1800, unit: "ms",  icon: Clock,             label: "Time to First Byte" },
};

function ratingColor(metric: MetricName, value: number | null | undefined) {
  if (value == null) return "text-muted-foreground";
  const t = THRESHOLDS[metric];
  if (value <= t.good) return "text-emerald-500";
  if (value <= t.poor) return "text-amber-500";
  return "text-red-500";
}

function formatValue(metric: MetricName, value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const t = THRESHOLDS[metric];
  if (metric === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ${t.unit}`;
}

const AdminVitals = () => {
  const { toast } = useToast();
  const [days, setDays] = useState(7);
  const [chartMetric, setChartMetric] = useState<MetricName>("LCP");
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-vitals", {
        body: { days, metric: chartMetric },
      });
      if (cancelled) return;
      if (error) {
        toast({ title: "Failed to load Web Vitals", description: error.message, variant: "destructive" });
      } else {
        setSummary((data?.summary as SummaryRow[]) || []);
        setDaily((data?.daily as DailyRow[]) || []);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [days, chartMetric, toast]);

  const totalSamples = summary.reduce((s, r) => s + Number(r.samples || 0), 0);
  const t = THRESHOLDS[chartMetric];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gauge className="h-7 w-7 text-primary" />
              Web Vitals (Real Users)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Field data from production visitors — p75 is the score Google uses for CWV.
            </p>
          </div>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            <TabsTrigger value="1">24h</TabsTrigger>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {METRICS.map((m) => {
          const row = summary.find((r) => r.metric === m);
          const Icon = THRESHOLDS[m].icon;
          const p75 = row?.p75;
          const good = row?.good_pct;
          return (
            <Card
              key={m}
              className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                chartMetric === m ? "border-primary ring-2 ring-primary/30" : ""
              }`}
              onClick={() => setChartMetric(m)}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">{m}</Badge>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className={`text-2xl font-bold ${ratingColor(m, p75)}`}>
                  {formatValue(m, p75)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">{THRESHOLDS[m].label}</div>
              <div className="text-xs text-muted-foreground mt-2">
                {row?.samples ? `${row.samples.toLocaleString()} samples` : "no data"}
                {good != null && ` · ${Math.round(good)}% good`}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed table */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Distribution (last {days}d)</h2>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : summary.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No samples yet — Web Vitals reporter starts collecting on next page load.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-4">Metric</th>
                  <th className="py-2 pr-4 text-right">Samples</th>
                  <th className="py-2 pr-4 text-right">p50</th>
                  <th className="py-2 pr-4 text-right">p75</th>
                  <th className="py-2 pr-4 text-right">p95</th>
                  <th className="py-2 pr-4 text-right">Good %</th>
                  <th className="py-2 pr-4">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m) => {
                  const r = summary.find((x) => x.metric === m);
                  const t2 = THRESHOLDS[m];
                  return (
                    <tr key={m} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{m}</td>
                      <td className="py-3 pr-4 text-right">{r?.samples?.toLocaleString() ?? "—"}</td>
                      <td className={`py-3 pr-4 text-right ${ratingColor(m, r?.p50)}`}>{formatValue(m, r?.p50)}</td>
                      <td className={`py-3 pr-4 text-right font-semibold ${ratingColor(m, r?.p75)}`}>{formatValue(m, r?.p75)}</td>
                      <td className={`py-3 pr-4 text-right ${ratingColor(m, r?.p95)}`}>{formatValue(m, r?.p95)}</td>
                      <td className="py-3 pr-4 text-right">{r?.good_pct != null ? `${Math.round(r.good_pct)}%` : "—"}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        good ≤ {t2.good}{t2.unit} · poor &gt; {t2.poor}{t2.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-xs text-muted-foreground mt-4">
              Total samples in window: <strong>{totalSamples.toLocaleString()}</strong>
            </div>
          </div>
        )}
      </Card>

      {/* Daily trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Daily p75 — <span className="text-primary">{chartMetric}</span>
          </h2>
          <span className="text-xs text-muted-foreground">click a metric card to switch</span>
        </div>
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : daily.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No daily data yet.</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  formatter={(v: number) => formatValue(chartMetric, v)}
                />
                <ReferenceLine y={t.good} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" label={{ value: "good", fill: "hsl(142 71% 45%)", fontSize: 11 }} />
                <ReferenceLine y={t.poor} stroke="hsl(0 84% 60%)" strokeDasharray="4 4" label={{ value: "poor", fill: "hsl(0 84% 60%)", fontSize: 11 }} />
                <Line type="monotone" dataKey="p75" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminVitals;
