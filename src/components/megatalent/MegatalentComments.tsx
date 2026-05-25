import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReportButton from "@/components/megatalent/ReportButton";
import { useSpendCredits } from "@/hooks/useSpendCredits";

type Sub = { id: string; title: string; user_id: string };
type Comment = { id: string; submission_id: string; user_id: string; body: string; created_at: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

interface Props { category?: string; categories?: string[]; userId: string | null; }

const MAX = 500;

const MegatalentComments = ({ category, categories, userId }: Props) => {
  const cats = useMemo(() => categories?.length ? categories : (category ? [category] : []), [categories, category]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const channelRef = useRef<any>(null);

  // Load top submissions in category
  useEffect(() => {
    if (!cats.length) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("talent_submissions")
          .select("id,title,user_id")
          .in("category", cats as any)
          .order("votes_count", { ascending: false })
          .limit(20);
        const arr = (data as Sub[]) || [];
        setSubs(arr);
        if (arr.length && !selectedId) setSelectedId(arr[0].id);
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line
  }, [cats.join(",")]);

  // Load comments for selected submission + realtime
  useEffect(() => {
    if (!selectedId) { setComments([]); return; }
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any).from("talent_comments")
        .select("*").eq("submission_id", selectedId).order("created_at", { ascending: true });
      const list = (data as Comment[]) || [];
      if (!mounted) return;
      setComments(list);
      const uids = Array.from(new Set(list.map(c => c.user_id)));
      if (uids.length) {
        const { data: profs } = await (supabase as any).from("profiles_public").select("id,full_name,avatar_url").in("id", uids);
        const map: Record<string, Profile> = {};
        (profs || []).forEach((p: any) => { map[p.id] = p; });
        if (mounted) setProfiles(prev => ({ ...prev, ...map }));
      }
    })();

    const ch = supabase.channel(`talent_comments:${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "talent_comments", filter: `submission_id=eq.${selectedId}` },
        (payload: any) => {
          const c = payload.new as Comment;
          setComments(prev => prev.find(x => x.id === c.id) ? prev : [...prev, c]);
          if (!profiles[c.user_id]) {
            (supabase as any).from("profiles_public").select("id,full_name,avatar_url").eq("id", c.user_id).maybeSingle().then(({ data }) => {
              if (data) setProfiles(prev => ({ ...prev, [data.id]: data as Profile }));
            });
          }
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "talent_comments", filter: `submission_id=eq.${selectedId}` },
        (payload: any) => setComments(prev => prev.filter(c => c.id !== payload.old.id)))
      .subscribe();
    channelRef.current = ch;
    return () => { mounted = false; supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [selectedId]);

  const { spend } = useSpendCredits();
  const post = async () => {
    if (!userId) { toast.error("Sign in to comment"); return; }
    const text = body.trim();
    if (!text) return;
    if (text.length > MAX) { toast.error(`Max ${MAX} characters`); return; }
    setPosting(true);
    try {
      const paid = await spend("megatalent_comment", { description: "talent_comment" });
      if (!paid) return;
      const { error } = await (supabase as any).from("talent_comments").insert({ submission_id: selectedId, user_id: userId, body: text });
      if (error) throw error;
      setBody("");
    } catch (e: any) { toast.error(e?.message || "Couldn't post"); }
    finally { setPosting(false); }
  };

  const remove = async (id: string) => {
    try { await (supabase as any).from("talent_comments").delete().eq("id", id); }
    catch (e: any) { toast.error(e?.message || "Couldn't delete"); }
  };

  if (!cats.length) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Comments</h2>
        </div>
        {loading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : subs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No submissions to comment on yet.</p>
        ) : (
          <>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="bg-background/60 h-9 text-xs mb-3"><SelectValue placeholder="Pick a submission" /></SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-72">
                {subs.map(s => <SelectItem key={s.id} value={s.id}><span className="text-xs truncate">{s.title}</span></SelectItem>)}
              </SelectContent>
            </Select>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-3">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Be the first to comment.</p>
              ) : comments.map(c => {
                const p = profiles[c.user_id];
                const mine = c.user_id === userId;
                return (
                  <div key={c.id} className="rounded-lg border border-border/30 bg-background/40 p-2.5 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      {p?.avatar_url ? <img src={p.avatar_url} className="h-5 w-5 rounded-full" alt="" /> :
                        <div className="h-5 w-5 rounded-full bg-primary/30 grid place-items-center text-[10px]">{(p?.full_name || "?").slice(0, 1)}</div>}
                      <span className="font-semibold truncate">{p?.full_name || "User"}</span>
                      <span className="text-muted-foreground ml-auto text-[10px]">{new Date(c.created_at).toLocaleString()}</span>
                      {mine && <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>}
                      {!mine && userId && <ReportButton targetType="comment" targetId={c.id} reporterId={userId} size="icon" className="h-5 w-5" />}
                    </div>
                    <p className="whitespace-pre-wrap break-words">{c.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Textarea value={body} onChange={e => setBody(e.target.value.slice(0, MAX))}
                placeholder={userId ? "Write a comment…" : "Sign in to comment"} disabled={!userId || posting}
                className="min-h-[60px] text-xs bg-background/60" />
              <Button onClick={post} disabled={!userId || posting || !body.trim()} size="sm" className="self-end gap-1">
                {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground text-right mt-1">{body.length}/{MAX}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentComments;
