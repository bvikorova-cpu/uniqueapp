import { Card } from "@/components/ui/card";
import { Sparkles, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useMemo } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsInsightsProps {
  history: { created_at: string; amount: number; source?: string; item_type?: string }[];
}

/**
 * Smart insights — auto-derived from history.
 * - Best performing source/type
 * - Trend (last 7d vs prior 7d)
 * - Best day-of-week
 */
export const EarningsInsights = ({ history }: EarningsInsightsProps) => {
  const insights = useMemo(() => {
    const now = Date.now();
    const day = 86400000;

    const last7 = history
      .filter((h) => now - new Date(h.created_at).getTime() <= 7 * day)
      .reduce((s, h) => s + Number(h.amount), 0);
    const prev7 = history
      .filter((h) => {
        const t = now - new Date(h.created_at).getTime();
        return t > 7 * day && t <= 14 * day;
      })
      .reduce((s, h) => s + Number(h.amount), 0);

    const trendPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : last7 > 0 ? 100 : 0;

    // Best source
    const sources: Record<string, number> = {};
    history.forEach((h) => {
      const k = (h.source || h.item_type || "other").toString();
      sources[k] = (sources[k] || 0) + Number(h.amount);
    });
    const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0];

    // Best day-of-week
    const dows: Record<number, number> = {};
    history.forEach((h) => {
      const d = new Date(h.created_at).getDay();
      dows[d] = (dows[d] || 0) + Number(h.amount);
    });
    const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const topDow = Object.entries(dows).sort((a, b) => b[1] - a[1])[0];

    return {
      last7,
      prev7,
      trendPct,
      topSource,
      topDow: topDow ? { name: dowNames[Number(topDow[0])], amount: topDow[1] } : null,
    };
  }, [history]);

  const TrendIcon =
    insights.trendPct > 5 ? ArrowUp : insights.trendPct < -5 ? ArrowDown : Minus;
  const trendColor =
    insights.trendPct > 5 ? "text-emerald-500" : insights.trendPct < -5 ? "text-rose-500" : "text-muted-foreground";

  return (
    <>
      <FloatingHowItWorks title={"Earnings Insights - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Insights section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Insights.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-card/80 backdrop-blur-md border-amber-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        Smart Insights
      </h3>

      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20">
          <p className="text-xs text-muted-foreground mb-1">Last 7 days</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black">€{insights.last7.toFixed(2)}</p>
            <div className={`flex items-center gap-1 ${trendColor} text-sm font-bold`}>
              <TrendIcon className="h-4 w-4" />
              {insights.trendPct > 0 ? "+" : ""}
              {insights.trendPct.toFixed(0)}% vs prev week
            </div>
          </div>
        </div>

        {insights.topSource && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top source</p>
              <p className="font-bold capitalize">{insights.topSource[0].replace(/_/g, " ")}</p>
            </div>
            <p className="font-black text-amber-500">€{insights.topSource[1].toFixed(2)}</p>
          </div>
        )}

        {insights.topDow && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best day</p>
              <p className="font-bold">{insights.topDow.name}</p>
            </div>
            <p className="font-black text-amber-500">€{insights.topDow.amount.toFixed(2)}</p>
          </div>
        )}

        {insights.trendPct < -10 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            ⚠️ Earnings dropped significantly. Try promoting your top sources or running a campaign.
          </div>
        )}
        {insights.trendPct > 25 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            🚀 You're on fire! Earnings up {insights.trendPct.toFixed(0)}% — keep the momentum.
          </div>
        )}
      </div>
    </Card>
    </>
  );
};
