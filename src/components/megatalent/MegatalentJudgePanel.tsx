import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, Loader2, Star, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Pick = { id: string; judge_id: string; submission_id: string; category: string | null; note: string | null; created_at: string };
type Sub = { id: string; title: string; media_url: string; media_type: string; user_id: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

interface Props { category?: string; categories?: string[]; userId: string | null; }

const MegatalentJudgePanel = ({ category, categories, userId }: Props) => {
  const cats = useMemo(() => categories?.length ? categories : (category ? [category] : []), [categories, category]);
  const [isJudge, setIsJudge] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [subs, setSubs] = useState<Record<string, Sub>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [topSubs, setTopSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickFor, setPickFor] = useState<string>("");
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);

  // Check judge role
  useEffect(() => {
    if (!userId) { setIsJudge(false); return; }
    (async () => {
      const { data } = await (supabase as any).from("user_roles").select("role").eq("user_id", userId).eq("role", "judge").maybeSingle();
      setIsJudge(!!data);
    })();
  }, [userId]);

  const load = async () => {
    if (!cats.length) return;
    setLoading(true);
    try {
      // Top submissions for picker
      const { data: ts } = await supabase.from("talent_submissions")
        .select("id,title,media_url,media_type,user_id")
        .in("category", cats as any)
        .order("votes_count", { ascending: false }).limit(20);
      const tsArr = (ts as Sub[]) || [];
      setTopSubs(tsArr);
      if (tsArr.length && !pickFor) setPickFor(tsArr[0].id);

      // Picks in these categories
      const { data: pk } = await (supabase as any).from("talent_judge_picks")
        .select("*").in("category", cats as any).order("created_at", { ascending: false }).limit(30);
      const pkArr = (pk as Pick[]) || [];
      setPicks(pkArr);

      const sids = Array.from(new Set([...pkArr.map(p => p.submission_id), ...tsArr.map(t => t.id)]));
      const uids = Array.from(new Set([...pkArr.map(p => p.judge_id), ...tsArr.map(t => t.user_id)]));
      const sMap: Record<string, Sub> = {}; tsArr.forEach(t => { sMap[t.id] = t; });
      const missing = sids.filter(id => !sMap[id]);
      if (missing.length) {
        const { data: more } = await supabase.from("talent_submissions").select("id,title,media_url,media_type,user_id").in("id", missing);
        (more || []).forEach((s: any) => { sMap[s.id] = s; });
      }
      setSubs(sMap);

      if (uids.length) {
        const { data: profs } = await supabase.from("profiles_public" as any).select("id,full_name,avatar_url").in("id", uids);
        const map: Record<string, Profile> = {}; (profs || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [cats.join(",")]);

  const submitPick = async () => {
    if (!userId || !isJudge) { toast.error("Judges only"); return; }
    if (!pickFor) return;
    setPosting(true);
    try {
      const { error } = await (supabase as any).from("talent_judge_picks").insert({
        judge_id: userId, submission_id: pickFor, category: category || null, note: note.trim() || null,
      });
      if (error) throw error;
      setNote("");
      toast.success("Pick added");
      load();
    } catch (e: any) {
      toast.error(String(e?.message || "").includes("duplicate") ? "Already picked this one" : (e?.message || "Failed"));
    } finally { setPosting(false); }
  };

  // Aggregate count of picks per submission
  const tallied = useMemo(() => {
    const m = new Map<string, number>();
    picks.forEach(p => m.set(p.submission_id, (m.get(p.submission_id) || 0) + 1));
    return Array.from(m.entries()).map(([sid, n]) => ({ sid, n })).sort((a, b) => b.n - a.n).slice(0, 8);
  }, [picks]);

  if (!cats.length) return null;

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gavel className="h-4 w-4 text-amber-500" />
          <h2 className="font-bold">Judge Panel</h2>
          {isJudge && <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">You're a judge</Badge>}
        </div>

        {loading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : (
          <>
            {tallied.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No judge picks yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Top picks</div>
                {tallied.map(({ sid, n }) => {
                  const s = subs[sid]; const p = s ? profiles[s.user_id] : null;
                  return (
                    <div key={sid} className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/40 p-2 text-xs">
                      <div className="h-9 w-9 rounded overflow-hidden shrink-0 bg-muted">
                        {s?.media_url ? (
                          s.media_type === "video"
                            ? <video src={s.media_url} className="h-full w-full object-cover" muted />
                            : <img src={s.media_url} className="h-full w-full object-cover" alt="" />
                        ) : <div className="h-full w-full grid place-items-center text-muted-foreground"><ImageOff className="h-3 w-3" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{s?.title || "Submission"}</div>
                        <div className="text-muted-foreground truncate">{p?.full_name || "Talent"}</div>
                      </div>
                      <Badge variant="default" className="gap-1"><Star className="h-3 w-3" /> {n}</Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {isJudge ? (
              <div className="rounded-lg border border-amber-500/30 bg-background/40 p-3 space-y-2">
                <div className="text-xs font-semibold">Add your pick</div>
                <Select value={pickFor} onValueChange={setPickFor}>
                  <SelectTrigger className="bg-background/60 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-72">
                    {topSubs.map(s => <SelectItem key={s.id} value={s.id}><span className="text-xs">{s.title}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional comment…" className="bg-background/60 text-xs min-h-[50px]" />
                <Button onClick={submitPick} disabled={posting || !pickFor} size="sm" className="w-full gap-1">
                  {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />} Submit pick
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center pt-2">Want to judge? Ask an admin to grant you the judge role.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentJudgePanel;
