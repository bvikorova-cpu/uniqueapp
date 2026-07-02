import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function DailyDealCountdown({ onOpenCoupon }: { onOpenCoupon: (id: string) => void }) {
  const [dealId, setDealId] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    supabase.rpc("get_or_pick_daily_deal" as any).then(async ({ data }) => {
      const id = data as string | null;
      if (!id) return;
      setDealId(id);
      const { data: c } = await supabase.from("coupon_listings").select("title, store_name, selling_price, original_value, image_url").eq("id", id).maybeSingle();
      setMeta(c);
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      const end = new Date(); end.setHours(24, 0, 0, 0);
      const ms = end.getTime() - Date.now();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return (
    <>
      <FloatingHowItWorks title={"Daily Deal Countdown - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Deal Countdown section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Deal Countdown.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(iv);
  }, []);

  if (!dealId || !meta) return null;
  const save = Math.round(((meta.original_value - meta.selling_price) / meta.original_value) * 100);

  return (
    <Card className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/10 border-amber-500/40 mb-6">
      <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
        <Badge className="bg-amber-500 hover:bg-amber-500 gap-1 self-start"><Flame className="w-3 h-3" /> Deal of the day</Badge>
        {meta.image_url && <img src={meta.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">{meta.store_name}</p>
          <h3 className="font-bold text-base line-clamp-1">{meta.title}</h3>
          <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
            <span className="text-xl font-black text-primary">€{Number(meta.selling_price).toFixed(2)}</span>
            <span className="text-xs line-through text-muted-foreground">€{Number(meta.original_value).toFixed(2)}</span>
            <Badge className="bg-success">−{save}%</Badge>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-amber-600 font-mono font-bold"><Clock className="w-4 h-4" /> {timeLeft}</div>
          <Button size="sm" onClick={() => onOpenCoupon(dealId)}>Grab it</Button>
        </div>
      </CardContent>
    </Card>
  );
}
