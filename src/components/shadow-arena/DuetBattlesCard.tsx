import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Duet {
  id: string; theme: string; votes_a: number; votes_b: number;
  creator_a: string; creator_b: string | null; status: string;
}

export function DuetBattlesCard() {
  const [duets, setDuets] = useState<Duet[]>([]);
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("shadow_duet_battles")
      .select("*").order("created_at", { ascending: false }).limit(5);
    setDuets((data as Duet[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!theme.trim()) return;
    setBusy(true);
    try {
      await shadowArenaCall("duet_create", { theme });
      setTheme(""); await load(); toast.success("Duet battle created!");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const vote = async (id: string, side: "A" | "B") => {
    try { await shadowArenaCall("duet_vote", { duet_id: id, vote_for: side }); await load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="h-5 w-5 text-red-400" />
        <h3 className="font-bold">Duet Battles (1v1 Live)</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Battle theme..." value={theme} onChange={(e) => setTheme(e.target.value)} />
        <Button onClick={create} disabled={busy || !theme.trim()}>Start</Button>
      </div>
      <div className="space-y-2">
        {duets.length === 0 && <p className="text-sm text-muted-foreground">No active duets. Be the first.</p>}
        {duets.map((d) => {
          const total = d.votes_a + d.votes_b || 1;
          const pctA = Math.round((d.votes_a / total) * 100);
          return (
            <div key={d.id} className="rounded border border-border/50 p-3 bg-black/30">
              <FloatingHowItWorks title="DuetBattlesCard — How it works" steps={[{title:"Open this section",desc:"Access DuetBattlesCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
              <div className="text-sm font-semibold mb-2">{d.theme}</div>
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => vote(d.id, "A")}>
                  A · {d.votes_a}
                </Button>
                <div className="text-xs text-muted-foreground w-12 text-center">{pctA}%</div>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => vote(d.id, "B")}>
                  B · {d.votes_b}
                </Button>
              </div>
              <div className="h-1.5 mt-2 rounded bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-purple-500" style={{ width: `${pctA}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
