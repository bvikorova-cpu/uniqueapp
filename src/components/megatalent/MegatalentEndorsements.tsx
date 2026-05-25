import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SKILLS = ["Vocal", "Performance", "Charisma", "Technique", "Originality", "Stage Presence"];

type Row = { talent_user_id: string; endorser_id: string; skill: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

interface Props { category?: string; categories?: string[]; userId: string | null; }

const MegatalentEndorsements = ({ category, categories, userId }: Props) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [talents, setTalents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const cats = useMemo(() => categories?.length ? categories : (category ? [category] : []), [categories, category]);

  const load = async () => {
    setLoading(true);
    try {
      // Pull category submissions to discover talent user IDs
      const { data: subs } = await supabase
        .from("talent_submissions")
        .select("user_id, votes_count")
        .in("category", cats as any)
        .order("votes_count", { ascending: false })
        .limit(50);
      const ids = Array.from(new Set((subs || []).map((s: any) => s.user_id))).slice(0, 10);
      setTalents(ids);

      if (ids.length) {
        const [{ data: endRows }, { data: profs }] = await Promise.all([
          (supabase as any).from("talent_endorsements").select("talent_user_id,endorser_id,skill").in("talent_user_id", ids),
          (supabase as any).from("profiles_public").select("id,full_name,avatar_url").in("id", ids),
        ]);
        setRows((endRows as Row[]) || []);
        const map: Record<string, Profile> = {};
        (profs || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      } else {
        setRows([]); setProfiles({});
      }
    } catch (e) {
      console.error("endorsements load", e);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (cats.length) load(); /* eslint-disable-line */ }, [cats.join(",")]);

  const endorsedByMe = (tid: string, skill: string) => !!rows.find(r => r.talent_user_id === tid && r.skill === skill && r.endorser_id === userId);
  const countFor = (tid: string, skill: string) => rows.filter(r => r.talent_user_id === tid && r.skill === skill).length;

  const toggle = async (tid: string, skill: string) => {
    if (!userId) { toast.error("Sign in to endorse"); return; }
    if (tid === userId) { toast.info("You can't endorse yourself"); return; }
    const key = `${tid}:${skill}`;
    setBusy(key);
    try {
      if (endorsedByMe(tid, skill)) {
        await (supabase as any).from("talent_endorsements").delete().match({ talent_user_id: tid, endorser_id: userId, skill });
        setRows(prev => prev.filter(r => !(r.talent_user_id === tid && r.skill === skill && r.endorser_id === userId)));
      } else {
        const { error } = await (supabase as any).from("talent_endorsements").insert({ talent_user_id: tid, endorser_id: userId, skill, category });
        if (error) throw error;
        setRows(prev => [...prev, { talent_user_id: tid, endorser_id: userId, skill }]);
        toast.success(`Endorsed for ${skill}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Couldn't endorse");
    } finally { setBusy(null); }
  };

  if (!cats.length) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Endorse Talents</h2>
          <span className="text-xs text-muted-foreground ml-auto">One tap per skill</span>
        </div>
        {loading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…</div>
        ) : talents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No talents to endorse yet.</p>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {talents.map(tid => {
              const p = profiles[tid];
              return (
                <div key={tid} className="rounded-lg border border-border/30 bg-background/40 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {p?.avatar_url ? (
                      <img src={p.avatar_url} alt={p.full_name || ""} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-xs font-bold">{(p?.full_name || "?").slice(0, 1)}</div>
                    )}
                    <div className="font-semibold text-sm truncate">{p?.full_name || "Talent"}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS.map(s => {
                      const mine = endorsedByMe(tid, s);
                      const n = countFor(tid, s);
                      return (
                        <Button key={s} size="sm" variant={mine ? "default" : "outline"} disabled={busy === `${tid}:${s}` || !userId}
                          onClick={() => toggle(tid, s)} className="h-7 text-[11px] px-2 gap-1">
                          <ThumbsUp className="h-3 w-3" /> {s} {n > 0 && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{n}</Badge>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentEndorsements;
