import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface EComment {
  id: string;
  submission_id: string;
  user_id: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; username: string | null } | null;
}

const MAX = 1000;

export function EcoComments({ submissionId }: { submissionId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<EComment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadCount = useCallback(async () => {
    const { count: c } = await (supabase as any)
      .from("eco_comments")
      .select("id", { count: "exact", head: true })
      .eq("submission_id", submissionId)
      .eq("is_deleted", false);
    setCount(c ?? 0);
  }, [submissionId]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("eco_comments")
      .select("*")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true })
      .limit(200);
    const rows = (data || []) as EComment[];
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    let pmap = new Map<string, any>();
    if (ids.length) {
      const { data: p } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url, username")
        .in("id", ids);
      pmap = new Map((p || []).map((x: any) => [x.id, x]));
    }
    setComments(rows.map((r) => ({ ...r, profile: pmap.get(r.user_id) || null })));
    setCount(rows.filter((r) => !r.is_deleted).length);
    setLoading(false);
  }, [submissionId]);

  useEffect(() => { loadCount(); }, [loadCount]);
  useEffect(() => { if (open) load(); }, [open, load]);

  const post = async () => {
    if (!user) { toast({ title: "Sign in to comment", variant: "destructive" }); return; }
    const trimmed = body.trim();
    if (trimmed.length < 1) return;
    setPosting(true);
    const { error } = await (supabase as any).from("eco_comments").insert({
      submission_id: submissionId,
      user_id: user.id,
      body: trimmed.slice(0, MAX),
    });
    setPosting(false);
    if (error) { toast({ title: "Comment failed", description: error.message, variant: "destructive" }); return; }
    setBody("");
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any)
      .from("eco_comments")
      .update({ is_deleted: true, body: "[deleted]" })
      .eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    load();
  };

  return (
    <div className="mt-2 border-t pt-2">
      <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
        <MessageCircle className="w-4 h-4 mr-1" /> {count} {count === 1 ? "comment" : "comments"}
      </Button>
      {open && (
        <div className="mt-2 space-y-3">
          {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {!loading && comments.length === 0 && <p className="text-xs text-muted-foreground">Be the first to comment.</p>}
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2">
                {c.profile?.avatar_url && <img src={c.profile.avatar_url} alt="" className="w-6 h-6 rounded-full" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{c.profile?.full_name || c.profile?.username || "User"}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className={`whitespace-pre-wrap break-words ${c.is_deleted ? "italic text-muted-foreground" : ""}`}>{c.body}</p>
                </div>
                {user && c.user_id === user.id && !c.is_deleted && (
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)} aria-label="Delete comment">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {user ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a supportive comment… (be respectful)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={2}
                maxLength={MAX}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{body.length}/{MAX}</span>
                <Button size="sm" onClick={post} disabled={posting || body.trim().length === 0} className="bg-green-600 hover:bg-green-700">
                  {posting ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              <Link to="/auth" className="underline">Sign in</Link> to comment. Only registered users can comment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
