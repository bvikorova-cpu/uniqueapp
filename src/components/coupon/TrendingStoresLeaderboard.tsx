import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function TrendingStoresLeaderboard() {
  const [rows, setRows] = useState<{ store_name: string; orders: number; gross_eur: number }[]>([]);

  useEffect(() => {
    supabase.rpc("coupon_trending_stores" as any, { p_limit: 10, p_days: 7 }).then(({ data }) => {
      setRows(((data as any) || []) as any);
    });
  }, []);

  if (rows.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Trending Stores Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Trending Stores Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trending Stores Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Trending stores · last 7 days</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {rows.map((r, i) => (
            <Link key={r.store_name} to={`/coupons/${slug(r.store_name)}`}
              className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <span className="text-lg font-black text-primary w-5">#{i + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{r.store_name}</p>
                <p className="text-[10px] text-muted-foreground">{r.orders} sales</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
