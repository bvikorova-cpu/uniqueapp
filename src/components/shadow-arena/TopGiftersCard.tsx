import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Row { sender_id: string; total: number; }

export function TopGiftersCard() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase.from("shadow_gift_sends")
        .select("sender_id, credits_spent").gte("created_at", since);
      const agg = new Map<string, number>();
      (data || []).forEach((r: any) => agg.set(r.sender_id, (agg.get(r.sender_id) || 0) + r.credits_spent));
      const list = [...agg.entries()].map(([sender_id, total]) => ({ sender_id, total }))
        .sort((a, b) => b.total - a.total).slice(0, 10);
      setRows(list);
    })();
  }, []);

  return (
    <><FloatingHowItWorks title="TopGiftersCard — How it works" steps={[{title:"Open this section",desc:"Access TopGiftersCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-5 w-5 text-amber-400" />
        <h3 className="font-bold">Top Gifters (Weekly)</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gifts sent yet this week.</p>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((r, i) => (
            <li key={r.sender_id} className="flex justify-between text-sm py-1.5 px-2 rounded bg-black/30">
              <span className="font-mono">#{i + 1} · {r.sender_id.slice(0, 8)}…</span>
              <span className="text-amber-300 font-bold">{r.total} credits</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  </>
  );
}
