import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useCreatorPayouts, KIND_LABELS, type PayoutKind } from "@/hooks/useCreatorPayouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, BarChart3, PieChart as PieIcon, Award } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(280 80% 60%)",
  "hsl(200 90% 55%)",
  "hsl(40 95% 55%)",
  "hsl(160 70% 50%)",
  "hsl(0 80% 60%)",
];

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CreatorAnalytics() {
  const { rows, totals, loading } = useCreatorPayouts();

  const monthly = useMemo(() => {
    const buckets: Record<string, number> = {};
    rows
      .filter((r) => ["completed", "paid", "approved"].includes((r.status || "").toLowerCase()))
      .forEach((r) => {
        const k = monthKey(r.processed_at || r.created_at);
        buckets[k] = (buckets[k] || 0) + Number(r.amount || 0);
      });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount: Number(amount.toFixed(2)) }));
  }, [rows]);

  const byHub = useMemo(() => {
    const map: Record<string, number> = {};
    rows
      .filter((r) => ["completed", "paid", "approved"].includes((r.status || "").toLowerCase()))
      .forEach((r) => {
        map[r.kind] = (map[r.kind] || 0) + Number(r.amount || 0);
      });
    return Object.entries(map).map(([kind, amount]) => ({
      name: KIND_LABELS[kind as PayoutKind] ?? kind,
      value: Number(amount.toFixed(2)),
    }));
  }, [rows]);

  const stats = useMemo(() => {
    const total = totals.paid + totals.pending + totals.rejected;
    const successRate = total > 0 ? (totals.paid / total) * 100 : 0;
    const rejectRate = total > 0 ? (totals.rejected / total) * 100 : 0;
    const avgPayout =
      rows.length > 0
        ? rows.reduce((s, r) => s + Number(r.amount || 0), 0) / rows.length
        : 0;
    return { successRate, rejectRate, avgPayout, count: rows.length };
  }, [rows, totals]);

  return (
    <>
      <Helmet>
        <title>Creator Analytics — Revenue & Payout Insights</title>
        <meta
          name="description"
          content="Track your creator earnings: monthly revenue, hub breakdown, payout success rate and average ticket."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-10 max-w-7xl">
          <header className="mb-8">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <BarChart3 className="h-3 w-3" /> Creator Analytics
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Your earnings, decoded
            </h1>
            <p className="text-muted-foreground">
              Revenue trends, hub performance, and payout health across all 7 creator hubs.
            </p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Crunching your numbers…
            </div>
          ) : (
            <>
              {/* KPI strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard
                  label="Total earned"
                  value={`€${totals.paid.toFixed(2)}`}
                  icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                />
                <KpiCard
                  label="Avg payout"
                  value={`€${stats.avgPayout.toFixed(2)}`}
                  icon={<Award className="h-4 w-4 text-amber-500" />}
                />
                <KpiCard
                  label="Success rate"
                  value={`${stats.successRate.toFixed(1)}%`}
                  icon={<PieIcon className="h-4 w-4 text-primary" />}
                />
                <KpiCard
                  label="Total requests"
                  value={String(stats.count)}
                  icon={<BarChart3 className="h-4 w-4 text-cyan-500" />}
                />
              </div>

              {/* Monthly revenue */}
              <Card className="mb-6 border-primary/20 bg-card/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly revenue (last 12 months)</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {monthly.length === 0 ? (
                    <EmptyChart text="No completed payouts yet — once admins approve, your trend will show here." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.75rem",
                          }}
                          formatter={(v: number) => [`€${v.toFixed(2)}`, "Earned"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Hub split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue by hub</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {byHub.length === 0 ? (
                      <EmptyChart text="No earnings to split yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byHub}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(e: any) => `€${e.value}`}
                          >
                            {byHub.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Payout health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <HealthRow label="Approved" value={totals.paid} pct={stats.successRate} tone="emerald" />
                    <HealthRow
                      label="Pending review"
                      value={totals.pending}
                      pct={stats.count ? (totals.pending / (totals.paid + totals.pending + totals.rejected || 1)) * 100 : 0}
                      tone="amber"
                    />
                    <HealthRow label="Rejected" value={totals.rejected} pct={stats.rejectRate} tone="rose" />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function HealthRow({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-500"
      : tone === "amber"
      ? "bg-amber-500"
      : "bg-rose-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          €{value.toFixed(2)} · {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${toneClass} transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <>
      <FloatingHowItWorks
        title="How Creator Analytics works"
        steps={[
          { title: 'View metrics', description: 'Track views, engagement, and revenue.' },
          { title: 'Compare periods', description: 'See week-over-week and month-over-month trends.' },
          { title: 'Segment audience', description: 'Understand demographics and top content.' },
          { title: 'Export data', description: 'Download CSVs for deeper analysis.' },
        ]}
      />
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-6">
      {text}
    </div>
    </>
  );
}
