import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Tick {
  brand_id: string;
  current_price: number;
  change_24h: number;
  brand?: { name: string; logo: string };
}

export const BrandStockTicker = () => {
  const [ticks, setTicks] = useState<Tick[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("brand_stock_prices")
        .select("brand_id, current_price, change_24h, brand:brand_sponsors(name, logo)")
        .order("change_24h", { ascending: false })
        .limit(20);
      if (data) setTicks(data as any);
    };
    load();

    const channel = supabase.channel("stock-ticker")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "brand_stock_prices" }, () => load())
      .subscribe();

    const interval = setInterval(load, 30_000);
    return (
    <>
      <FloatingHowItWorks title={"Brand Stock Ticker - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Stock Ticker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Stock Ticker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); clearInterval(interval); };
  }, []);

  if (ticks.length === 0) return null;
  const loop = [...ticks, ...ticks];

  return (
    <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(45_100%_50%/.08),transparent)]" />
      <div className="relative flex items-center gap-3 py-3">
        <Badge className="ml-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 border-0 font-black shrink-0">
          ● LIVE BRAND INDEX
        </Badge>
        <div className="overflow-hidden flex-1">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {loop.map((t, i) => {
              const Icon = t.change_24h > 0.5 ? TrendingUp : t.change_24h < -0.5 ? TrendingDown : Minus;
              const color = t.change_24h > 0.5 ? "text-emerald-400" : t.change_24h < -0.5 ? "text-red-400" : "text-zinc-400";
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-base">{t.brand?.logo?.startsWith("http") ? "🏢" : t.brand?.logo}</span>
                  <span className="font-bold text-amber-100">{t.brand?.name?.toUpperCase()}</span>
                  <span className="font-mono text-amber-300">€{Number(t.current_price).toFixed(2)}</span>
                  <span className={`flex items-center gap-0.5 font-mono text-xs ${color}`}>
                    <Icon className="h-3 w-3" />
                    {t.change_24h > 0 ? "+" : ""}{Number(t.change_24h).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </Card>
  );
};
