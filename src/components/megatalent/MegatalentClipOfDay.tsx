import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Crown, Loader2, RefreshCw, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Clip = { id: string; for_date: string; category: string; submission_id: string; votes_count: number; awarded_user_id: string | null };
type Sub = { id: string; title: string; media_url: string; media_type: string; user_id: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

interface Props { category?: string; }

const todayISO = () => new Date().toISOString().slice(0, 10);

const MegatalentClipOfDay = ({ category }: Props) => {
  const [clip, setClip] = useState<Clip | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [broken, setBroken] = useState(false);

  const load = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const { data } = await (supabase as any).from("talent_clip_of_day")
        .select("*").eq("category", category).eq("for_date", todayISO()).maybeSingle();
      const c = data as Clip | null;
      setClip(c);
      if (c) await hydrate(c);
      else { setSub(null); setProfile(null); }
    } finally { setLoading(false); }
  };

  const hydrate = async (c: Clip) => {
    const { data: s } = await supabase.from("talent_submissions")
      .select("id,title,media_url,media_type,user_id").eq("id", c.submission_id).maybeSingle();
    setSub((s as Sub) || null);
    if (s?.user_id) {
      const { data: p } = await supabase.from("profiles_public" as any).select("id,full_name,avatar_url").eq("id", s.user_id).maybeSingle();
      setProfile((p as Profile) || null);
    }
    setBroken(false);
  };

  const pick = async () => {
    if (!category) return;
    setPicking(true);
    try {
      const { data, error } = await (supabase as any).rpc("pick_clip_of_day", { _category: category, _for_date: todayISO() });
      if (error) throw error;
      if (!data) toast.info("No eligible clip found in last 24h");
      else { setClip(data as Clip); await hydrate(data as Clip); toast.success("Clip of the Day picked! Winner +50 XP"); }
    } catch (e: any) { toast.error(e?.message || "Couldn't pick"); }
    finally { setPicking(false); }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [category]);

  if (!category) return null;

  return (
    <Card className="overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-4 w-4 text-yellow-500" />
          <h2 className="font-bold">Clip of the Day</h2>
          <Badge variant="secondary" className="text-[10px]">+50 XP to winner</Badge>
          <Button size="sm" variant="ghost" onClick={pick} disabled={picking || loading} className="ml-auto gap-1 h-7">
            {picking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="text-xs">{clip ? "Re-pick" : "Pick today"}</span>
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : !clip || !sub ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No clip picked for today. Click "Pick today" to crown the most-voted clip from the last 24h.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden border border-yellow-500/30 shrink-0">
              {!broken && sub.media_url ? (
                sub.media_type === "video" ? (
                  <video src={sub.media_url} controls className="w-full h-full object-cover" onError={() => setBroken(true)} />
                ) : (
                  <img src={sub.media_url} alt={sub.title} className="w-full h-full object-cover" onError={() => setBroken(true)} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground"><ImageOff className="h-6 w-6" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-xs uppercase tracking-wider text-yellow-600/80">Today's Winner</span>
              </div>
              <div className="text-xl font-black truncate">{sub.title}</div>
              <div className="text-sm text-muted-foreground mt-1">by {profile?.full_name || "Talent"}</div>
              <div className="mt-2 text-xs">
                <Badge variant="outline">{clip.votes_count} votes</Badge>
                <span className="text-muted-foreground ml-2">{new Date(clip.for_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentClipOfDay;
