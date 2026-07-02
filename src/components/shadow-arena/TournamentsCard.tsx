import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface T { id: string; title: string; status: string; max_participants: number; entry_credits: number; prize_pool_credits: number; starts_at: string; }

export function TournamentsCard() {
  const [items, setItems] = useState<T[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase.from("shadow_tournaments")
      .select("*").order("starts_at", { ascending: true }).limit(5);
    setItems((data as T[]) || []);
    if (data) {
      const c: Record<string, number> = {};
      for (const t of data as T[]) {
        const { count } = await supabase.from("shadow_tournament_entries")
          .select("*", { count: "exact", head: true }).eq("tournament_id", t.id);
        c[t.id] = count || 0;
      }
      setCounts(c);
    }
  };
  useEffect(() => { load(); }, []);

  const join = async (id: string) => {
    try { await shadowArenaCall("tournament_join", { tournament_id: id }); toast.success("Joined!"); await load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <><FloatingHowItWorks title="TournamentsCard — How it works" steps={[{title:"Open this section",desc:"Access TournamentsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h3 className="font-bold">Weekly Tournaments</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tournaments yet. New brackets open every Monday.</p>
      ) : items.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-3 rounded border border-border/50 bg-black/30 mb-2">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{t.title}</div>
            <div className="text-xs text-muted-foreground">
              {counts[t.id] || 0}/{t.max_participants} · Prize: {t.prize_pool_credits}c · Entry: {t.entry_credits}c
            </div>
          </div>
          <Button size="sm" disabled={t.status !== "open"} onClick={() => join(t.id)}>
            {t.status === "open" ? "Join" : t.status}
          </Button>
        </div>
      ))}
    </Card>
  </>
  );
}
