import { Card } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsForecastChartProps {
  /** Past transactions: each item must have `created_at` and `amount` (net to user). */
  history: { created_at: string; amount: number }[];
}

/**
 * 30-day actual earnings + 14-day linear forecast (based on 30d avg).
 */
export const EarningsForecastChart = ({ history }: EarningsForecastChartProps) => {
  const data = useMemo(() => {
    const now = new Date();
    const days: { date: string; actual: number | null; forecast: number | null }[] = [];

    // Past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = history
        .filter((h) => h.created_at.slice(0, 10) === key)
        .reduce((s, h) => s + Number(h.amount), 0);
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        actual: total,
        forecast: null,
      });
    }

    const total30 = days.reduce((s, d) => s + (d.actual || 0), 0);
    const avg = total30 / 30;

    // Add bridge point so forecast line continues from today's actual
    if (days.length) {
      days[days.length - 1].forecast = days[days.length - 1].actual;
    }

    // Next 14 days forecast
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        actual: null,
        forecast: Math.max(0, avg),
      });
    }

    return days;
  }, [history]);

  const projected14 = useMemo(() => {
    const last30 = history
      .filter((h) => {
        const d = new Date(h.created_at);
        return Date.now() - d.getTime() <= 30 * 86400000;
      })
      .reduce((s, h) => s + Number(h.amount), 0);
    return (last30 / 30) * 14;
  }, [history]);

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-amber-500/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            30-Day Trend & 14-Day Forecast
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Projected next 14 days: <span className="font-bold text-amber-500">€{projected14.toFixed(2)}</span>
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(43 96% 56%)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(43 96% 56%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(280 70% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            formatter={(v: any, name: string) =>
              v === null ? null : [`€${Number(v).toFixed(2)}`, name === "actual" ? "Earned" : "Forecast"]
            }
          />
          <Area type="monotone" dataKey="actual" stroke="hsl(43 96% 56%)" strokeWidth={2.5} fill="url(#actualGradient)" />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="hsl(280 70% 60%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#forecastGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
