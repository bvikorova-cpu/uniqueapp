import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Wallet, ArrowUpDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useBrandVotes } from "@/hooks/useBrandVotes";
import { spendBrandCredits } from "@/lib/brandCredits";
import { useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StockRow {
  id: string;
  brand_id: string;
  current_price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  brand?: { name: string; logo: string };
}

export const BrandStockMarket = () => {
  const { data: votes, refetch } = useBrandVotes();
  const queryClient = useQueryClient();
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);
  const [amount, setAmount] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase
      .from("brand_stock_prices")
      .select("*, brand:brand_sponsors(name, logo)")
      .order("change_24h", { ascending: false });
    if (data) setStocks(data as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("stock-market")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "brand_stock_prices" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const invest = async (s: StockRow) => {
    const credits = amount[s.brand_id] ?? 5;
    if (credits < 1) { toast.error("Min 1 credit"); return; }
    if ((votes?.remaining ?? 0) < credits) { toast.error("Not enough credits"); return; }

    setInvesting(s.brand_id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return; }

      await spendBrandCredits(credits);

      const shares = credits / s.current_price;
      const { error } = await supabase.from("brand_investments").insert({
        user_id: user.id,
        brand_id: s.brand_id,
        shares,
        buy_price: s.current_price,
        current_value: credits,
      });
      if (error) throw error;

      refetch();
      queryClient.invalidateQueries({ queryKey: ["brand-investments"] });
      toast.success(`Invested ${credits} credits in ${s.brand?.name} (${shares.toFixed(4)} shares)`);
    } catch (e: any) {
      toast.error(e.message ?? "Investment failed");
    } finally {
      setInvesting(null);
    }
  };

  const tickPrices = async () => {
    await supabase.functions.invoke("brand-stock-tick");
    load();
    toast.success("Market refreshed");
  };

  if (loading) return <div className="text-center py-8 text-amber-100/60"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(45_100%_50%/.06)_0%,transparent_50%)]" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-amber-100">
            <Wallet className="h-5 w-5 text-amber-400" />
            Brand Stock Market
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">LIVE</Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={tickPrices} className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" /> Tick
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-amber-100/60 text-xs uppercase tracking-wider border-b border-amber-500/10">
                <th className="text-left py-2 pr-3">Brand</th>
                <th className="text-right py-2 pr-3">Price</th>
                <th className="text-right py-2 pr-3">24h</th>
                <th className="text-right py-2 pr-3">Vol</th>
                <th className="text-right py-2">Invest</th>
              </tr>
            </thead>
            <tbody>
              {stocks.slice(0, 12).map(s => {
                const up = s.change_24h >= 0;
                return (
                  <tr key={s.id} className="border-b border-amber-500/5 hover:bg-amber-500/5 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{s.brand?.logo?.startsWith("http") ? "🏢" : s.brand?.logo}</span>
                        <span className="font-bold text-amber-100">{s.brand?.name}</span>
                      </div>
                    </td>
                    <td className="text-right pr-3 font-mono text-amber-200">€{Number(s.current_price).toFixed(2)}</td>
                    <td className={`text-right pr-3 font-mono ${up ? "text-emerald-400" : "text-red-400"}`}>
                      <span className="inline-flex items-center gap-0.5">
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {up ? "+" : ""}{Number(s.change_24h).toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right pr-3 text-amber-100/60 font-mono text-xs">{s.volume_24h}</td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <Input
                          type="number"
                          min={1}
                          value={amount[s.brand_id] ?? 5}
                          onChange={(e) => setAmount({ ...amount, [s.brand_id]: Number(e.target.value) })}
                          className="w-14 h-7 text-xs text-center bg-zinc-900/80 border-amber-500/20 text-amber-100"
                        />
                        <Button
                          size="sm"
                          disabled={investing === s.brand_id}
                          onClick={() => invest(s)}
                          className="h-7 px-2 text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 hover:from-amber-600 hover:to-yellow-600 border-0"
                        >
                          {investing === s.brand_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-amber-100/40 text-center mt-3">
          Virtual market · Investments tracked but no real money value · For entertainment
        </p>
      </CardContent>
    </Card>
  );
};
