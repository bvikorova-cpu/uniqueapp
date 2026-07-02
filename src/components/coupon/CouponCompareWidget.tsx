import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCouponCompare, type CompareCoupon } from "@/hooks/useCouponCompare";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponCompareWidget({ userId }: { userId: string | null }) {
  const { ids, toggle, clear } = useCouponCompare(userId);
  const [rows, setRows] = useState<CompareCoupon[]>([]);

  useEffect(() => {
    if (ids.length === 0) { setRows([]); return; }
    supabase.from("coupon_listings").select("id, title, store_name, selling_price, original_value, expiry_date, image_url")
      .in("id", ids)
      .then(({ data }) => setRows(((data as any) || []) as CompareCoupon[]));
  }, [ids]);

  if (ids.length === 0) return null;
  const cheapest = Math.min(...rows.map(r => Number(r.selling_price)));
  const bestSavings = Math.max(...rows.map(r => ((r.original_value - r.selling_price) / r.original_value) * 100));

  return (
    <>
      <FloatingHowItWorks title={"Coupon Compare Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Compare Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Compare Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="mb-6 border-primary/40 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Compare ({rows.length}/4)</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={clear}>Clear all</Button>
        </div>
        <div className={`grid gap-3 ${rows.length === 1 ? "grid-cols-1" : rows.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
          {rows.map(r => {
            const sav = Math.round(((r.original_value - r.selling_price) / r.original_value) * 100);
            const isCheap = Number(r.selling_price) === cheapest;
            const isBestSav = Math.abs(((r.original_value - r.selling_price) / r.original_value) * 100 - bestSavings) < 0.01;
            return (
              <div key={r.id} className="rounded-lg border border-border bg-card p-2 relative">
                <button onClick={() => toggle(r.id)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-rose-500 hover:text-white"><X className="w-3 h-3" /></button>
                {r.image_url && <img src={r.image_url} alt="" className="w-full h-16 object-cover rounded mb-2" />}
                <p className="text-[10px] text-muted-foreground">{r.store_name}</p>
                <p className="text-xs font-semibold line-clamp-1">{r.title}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-sm font-black ${isCheap ? "text-emerald-500" : "text-primary"}`}>€{Number(r.selling_price).toFixed(2)}</span>
                  {isCheap && rows.length > 1 && <span className="text-[9px] text-emerald-500 font-bold">CHEAPEST</span>}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  −{sav}% {isBestSav && rows.length > 1 && <span className="text-amber-500 font-bold">BEST</span>}
                </div>
                {r.expiry_date && <div className="text-[10px] text-muted-foreground">exp {new Date(r.expiry_date).toLocaleDateString()}</div>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
