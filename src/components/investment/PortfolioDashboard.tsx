import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  avg_cost_eur: number;
  current_price_eur: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);

export function PortfolioDashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("investment_holdings" as any)
        .select("*")
        .eq("user_id", user.id);
      setHoldings((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const totalValue = holdings.reduce((s, h) => s + h.quantity * h.current_price_eur, 0);
  const totalCost = holdings.reduce((s, h) => s + h.quantity * h.avg_cost_eur, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" /> My Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span className="opacity-70">Value</span><span className="font-bold">{fmt(totalValue)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Cost basis</span><span>{fmt(totalCost)}</span></div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">P/L</span>
            <Badge variant={pnl >= 0 ? "default" : "destructive"} className="gap-1">
              {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {fmt(pnl)} ({pnlPct.toFixed(2)}%)
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Holdings</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm opacity-60">Loading…</p>
          ) : holdings.length === 0 ? (
            <p className="text-sm opacity-60">No holdings yet. Start investing to build your portfolio.</p>
          ) : (
            <div className="space-y-2">
              {holdings.map((h) => {
                const value = h.quantity * h.current_price_eur;
                const cost = h.quantity * h.avg_cost_eur;
                const p = value - cost;
                return (
                  <div key={h.id} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="font-semibold">{h.symbol}</p>
                      <p className="text-xs opacity-60">{h.quantity} @ {fmt(h.avg_cost_eur)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{fmt(value)}</p>
                      <p className={`text-xs ${p >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p >= 0 ? "+" : ""}{fmt(p)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
