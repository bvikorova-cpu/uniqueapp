import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Loader2, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Match = {
  id: string;
  participant_a_id: string | null;
  participant_b_id: string | null;
  winner_id: string | null;
  votes_a: number; votes_b: number;
  status: string;
};
type Participant = { id: string; user_id: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

interface Props { category?: string; categories?: string[]; }

type Rivalry = { aId: string; bId: string; total: number; closeness: number; matches: number };

const MegatalentRivalries = ({ category, categories }: Props) => {
  const cats = useMemo(() => categories?.length ? categories : (category ? [category] : []), [categories, category]);
  const [loading, setLoading] = useState(true);
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!cats.length) return;
    (async () => {
      setLoading(true);
      try {
        const { data: tourneys } = await supabase.from("battle_royale_tournaments").select("id").in("category", cats as any);
        const tIds = (tourneys || []).map((t: any) => t.id);
        if (!tIds.length) { setRivalries([]); return; }

        const [{ data: parts }, { data: matches }] = await Promise.all([
          supabase.from("battle_royale_participants").select("id,user_id").in("tournament_id", tIds),
          supabase.from("battle_royale_matches").select("id,participant_a_id,participant_b_id,winner_id,votes_a,votes_b,status").in("tournament_id", tIds),
        ]);
        const pMap = new Map<string, Participant>(); (parts as Participant[] || []).forEach(p => pMap.set(p.id, p));

        // Aggregate user vs user closeness
        const agg = new Map<string, Rivalry>();
        (matches as Match[] || []).forEach(m => {
          if (!m.participant_a_id || !m.participant_b_id) return;
          const pa = pMap.get(m.participant_a_id); const pb = pMap.get(m.participant_b_id);
          if (!pa || !pb) return;
          const [u1, u2] = [pa.user_id, pb.user_id].sort();
          if (u1 === u2) return;
          const key = `${u1}|${u2}`;
          const total = m.votes_a + m.votes_b;
          const closeness = total ? 100 - Math.abs(m.votes_a - m.votes_b) / total * 100 : 0;
          const ex = agg.get(key) || { aId: u1, bId: u2, total: 0, closeness: 0, matches: 0 };
          ex.total += total; ex.matches += 1; ex.closeness += closeness;
          agg.set(key, ex);
        });

        const list = Array.from(agg.values())
          .map(r => ({ ...r, closeness: r.closeness / Math.max(1, r.matches) }))
          .sort((a, b) => (b.matches * 1000 + b.closeness) - (a.matches * 1000 + a.closeness))
          .slice(0, 6);
        setRivalries(list);

        const uids = Array.from(new Set(list.flatMap(r => [r.aId, r.bId])));
        if (uids.length) {
          const { data: profs } = await (supabase as any).from("profiles_public").select("id,full_name,avatar_url").in("id", uids);
          const map: Record<string, Profile> = {}; (profs || []).forEach((p: any) => { map[p.id] = p; });
          setProfiles(map);
        }
      } catch (e) { console.error("rivalries", e); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line
  }, [cats.join(",")]);

  if (!cats.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Rivalries - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Rivalries section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Rivalries.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden border-destructive/30 bg-gradient-to-br from-destructive/10 via-rose-500/5 to-transparent">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-destructive" />
          <h2 className="font-bold">Hottest Rivalries</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">Based on past Battle Royale clashes</span>
        </div>
        {loading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : rivalries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No rivalries detected yet. Play some Battle Royales!</p>
        ) : (
          <div className="space-y-2">
            {rivalries.map(r => {
              const a = profiles[r.aId]; const b = profiles[r.bId];
              const closeness = Math.round(r.closeness);
              return (
                <div key={`${r.aId}-${r.bId}`} className="rounded-lg border border-border/30 bg-background/40 p-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold truncate flex-1">{a?.full_name || "Talent"}</span>
                    <Swords className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="font-semibold truncate flex-1 text-right">{b?.full_name || "Talent"}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{r.matches} {r.matches === 1 ? "match" : "matches"}</Badge>
                    <Badge variant="outline" className="text-[10px]">{r.total} total votes</Badge>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-destructive to-primary" style={{ width: `${closeness}%` }} />
                    </div>
                    <span className="tabular-nums">{closeness}% close</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentRivalries;
