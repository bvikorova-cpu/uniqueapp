import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NoteRow {
  id: string;
  user_id: string;
  content: string;
  emoji: string | null;
  created_at: string;
  expires_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

const EMOJIS = ["💭", "🔥", "✨", "🎉", "😂", "💜", "👀", "☕", "🚀", "🎵"];

export const NotesBar = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("💭");
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState<NoteRow | null>(null);

  const load = useCallback(async () => {
    const { data: notesData, error } = await supabase
      .from("user_notes")
      .select("id, user_id, content, emoji, created_at, expires_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return;
    const userIds = Array.from(new Set((notesData ?? []).map((n) => n.user_id)));
    const { data: profiles } = userIds.length
      ? await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", userIds)
      : { data: [] as any[] };
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    setNotes(
      (notesData ?? []).map((n) => ({
        ...n,
        profile: profileMap.get(n.user_id) ?? null,
      }))
    );
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
    load();
  }, [load]);

  const submit = async () => {
    if (!content.trim() || !me) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_notes").insert({
      user_id: me,
      content: content.trim().slice(0, 280),
      emoji,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not post note", description: error.message, variant: "destructive" });
      return;
    }
    setContent("");
    setOpen(false);
    toast({ title: "Note posted", description: "Visible for 24 hours." });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("user_notes").delete().eq("id", id);
    if (error) return;
    setViewing(null);
    load();
  };

  const myNote = notes.find((n) => n.user_id === me);

  return (
    <>
      <div className="glass-post-card p-3 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {/* Add / my note */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1 w-20 shrink-0"
          >
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 ring-2 ring-primary/40 flex items-center justify-center">
              {myNote ? (
                <span className="text-2xl">{myNote.emoji || "💭"}</span>
              ) : (
                <Plus className="h-6 w-6 text-primary" />
              )}
              {!myNote && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  +
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate max-w-full">
              {myNote ? "Your note" : "Add note"}
            </span>
          </button>

          {notes
            .filter((n) => n.user_id !== me)
            .map((n) => (
              <button
                key={n.id}
                onClick={() => setViewing(n)}
                className="flex flex-col items-center gap-1 w-20 shrink-0"
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-accent/50">
                    <AvatarImage src={n.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{n.profile?.full_name?.charAt(0) ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-sm">
                    {n.emoji || "💭"}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground truncate max-w-full">
                  {n.profile?.full_name?.split(" ")[0] ?? "User"}
                </span>
              </button>
            ))}

          {notes.length === 0 && (
            <div className="flex items-center text-xs text-muted-foreground px-4">
              <MessageCircle className="h-4 w-4 mr-2" />
              No active notes — be the first.
            </div>
          )}
        </div>
      </div>

      {/* Compose */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post a 24h note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-1 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-9 w-9 rounded-full text-xl ${
                    emoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <Input
              maxLength={280}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? (max 280 chars)"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}/280</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!content.trim() || submitting}>
              Post note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={viewing.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{viewing.profile?.full_name?.charAt(0) ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{viewing.profile?.full_name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {formatDistanceToNow(new Date(viewing.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                <div className="text-4xl mb-3">{viewing.emoji || "💭"}</div>
                <p className="text-lg whitespace-pre-wrap">{viewing.content}</p>
              </div>
              {viewing.user_id === me && (
                <DialogFooter>
                  <Button variant="destructive" size="sm" onClick={() => remove(viewing.id)}>
                    <X className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
