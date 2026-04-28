import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, MessageCircle, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TalentComment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at?: string | null;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  submissionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCountChange?: (submissionId: string, count: number) => void;
}

const PAGE_SIZE = 20;

const commentSchema = z.object({
  comment_text: z
    .string()
    .trim()
    .min(1, { message: "Komentár nemôže byť prázdny" })
    .max(500, { message: "Komentár môže mať maximálne 500 znakov" }),
});

export function TalentCommentsSheet({ submissionId, open, onOpenChange, onCountChange }: Props) {
  const { toast } = useToast();
  const [comments, setComments] = useState<TalentComment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const enrichWithProfiles = async (rows: any[]): Promise<TalentComment[]> => {
    const userIds = [...new Set(rows.map((c) => c.user_id))];
    let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      profilesMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
    }
    return rows.map((c) => ({ ...c, profiles: profilesMap[c.user_id] ?? null }));
  };

  const fetchPage = async (id: string, pageIndex: number) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("talent_comments")
      .select("id, user_id, comment_text, created_at, updated_at", { count: "exact" })
      .eq("submission_id", id)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    const enriched = await enrichWithProfiles(data ?? []);
    return { rows: enriched, count: count ?? 0 };
  };

  const loadInitial = async (id: string) => {
    try {
      setLoading(true);
      seenIds.current = new Set();
      const { rows, count } = await fetchPage(id, 0);
      rows.forEach((r) => seenIds.current.add(r.id));
      setComments(rows);
      setTotalCount(count);
      setPage(0);
      setHasMore(rows.length < count);
      onCountChange?.(id, count);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      toast({ title: "Chyba", description: "Nepodarilo sa načítať komentáre", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!submissionId || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { rows, count } = await fetchPage(submissionId, nextPage);
      const fresh = rows.filter((r) => !seenIds.current.has(r.id));
      fresh.forEach((r) => seenIds.current.add(r.id));
      setComments((prev) => [...prev, ...fresh]);
      setTotalCount(count);
      setPage(nextPage);
      setHasMore(seenIds.current.size < count);
      onCountChange?.(submissionId, count);
    } catch (err: any) {
      console.error("Error loading more comments:", err);
      toast({ title: "Chyba", description: "Nepodarilo sa načítať ďalšie komentáre", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open && submissionId) {
      loadInitial(submissionId);
    } else {
      setComments([]);
      setText("");
      setPage(0);
      setHasMore(false);
      setTotalCount(0);
      seenIds.current = new Set();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submissionId]);

  // Realtime: prepend new, remove deleted — without refetch
  useEffect(() => {
    if (!open || !submissionId) return;
    const channel = supabase
      .channel(`talent_comments:${submissionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "talent_comments", filter: `submission_id=eq.${submissionId}` },
        async (payload: any) => {
          const row = payload.new;
          if (!row || seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          const [enriched] = await enrichWithProfiles([row]);
          setComments((prev) => [enriched, ...prev]);
          setTotalCount((c) => {
            const next = c + 1;
            onCountChange?.(submissionId, next);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "talent_comments", filter: `submission_id=eq.${submissionId}` },
        (payload: any) => {
          const id = payload.old?.id;
          if (!id) return;
          if (seenIds.current.has(id)) seenIds.current.delete(id);
          setComments((prev) => {
            const next = prev.filter((c) => c.id !== id);
            if (next.length !== prev.length) {
              setTotalCount((tc) => {
                const v = Math.max(0, tc - 1);
                onCountChange?.(submissionId, v);
                return v;
              });
            }
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "talent_comments", filter: `submission_id=eq.${submissionId}` },
        (payload: any) => {
          const row = payload.new;
          if (!row?.id) return;
          setComments((prev) =>
            prev.map((c) =>
              c.id === row.id
                ? { ...c, comment_text: row.comment_text, updated_at: row.updated_at }
                : c
            )
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submissionId]);

  // Infinite scroll observer
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, page, submissionId]);

  const handleSubmit = async () => {
    if (!submissionId) return;
    const parsed = commentSchema.safeParse({ comment_text: text });
    if (!parsed.success) {
      toast({ title: "Neplatný komentár", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Prihlásenie potrebné", description: "Pre komentovanie sa prihlás", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("talent_comments").insert({
        submission_id: submissionId,
        user_id: user.id,
        comment_text: parsed.data.comment_text,
      });
      if (error) {
        if (error.message?.toLowerCase().includes("row-level security")) {
          toast({
            title: "Vyžadované predplatné",
            description: "Komentovať môžu len členovia s aktívnym Megatalent predplatným.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      setText("");
      // Realtime INSERT will prepend; no refetch needed
    } catch (err: any) {
      console.error("Error posting comment:", err);
      toast({ title: "Chyba", description: err?.message || "Nepodarilo sa pridať komentár", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!submissionId) return;
    try {
      const { error } = await supabase.from("talent_comments").delete().eq("id", commentId);
      if (error) throw error;
      // Realtime DELETE will remove locally
    } catch (err: any) {
      toast({ title: "Chyba", description: err?.message || "Nepodarilo sa odstrániť komentár", variant: "destructive" });
    }
  };

  const startEdit = (c: TalentComment) => {
    setEditingId(c.id);
    setEditingText(c.comment_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const parsed = commentSchema.safeParse({ comment_text: editingText });
    if (!parsed.success) {
      toast({ title: "Neplatný komentár", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    try {
      setSavingEdit(true);
      const { data, error } = await supabase
        .from("talent_comments")
        .update({ comment_text: parsed.data.comment_text, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select("id, comment_text, updated_at")
        .single();
      if (error) {
        if (error.message?.toLowerCase().includes("row-level security")) {
          toast({
            title: "Nedostatočné oprávnenia",
            description: "Upraviť môžeš iba vlastné komentáre.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      if (data) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === data.id ? { ...c, comment_text: data.comment_text, updated_at: data.updated_at } : c
          )
        );
      }
      toast({ title: "Komentár upravený" });
      cancelEdit();
    } catch (err: any) {
      console.error("Error updating comment:", err);
      toast({ title: "Chyba", description: err?.message || "Nepodarilo sa upraviť komentár", variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Komentáre {totalCount > 0 && <span className="text-muted-foreground text-sm">({totalCount})</span>}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Zatiaľ žiadne komentáre. Buď prvý!
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {comments.map((c) => {
                  const isOwn = currentUserId && c.user_id === currentUserId;
                  const initial = c.profiles?.full_name?.[0]?.toUpperCase() || "U";
                  return (
                    <li key={c.id} className="flex gap-3">
                      {c.profiles?.avatar_url ? (
                        <img
                          src={c.profiles.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {initial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate">
                            {c.profiles?.full_name || "Používateľ"}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString("sk-SK", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words mt-0.5">{c.comment_text}</p>
                      </div>
                      {isOwn && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          onClick={() => handleDelete(c.id)}
                          aria-label="Odstrániť komentár"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-xs"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        Načítavam...
                      </>
                    ) : (
                      <>Načítať ďalšie ({totalCount - comments.length})</>
                    )}
                  </Button>
                </div>
              )}
              {!hasMore && comments.length >= PAGE_SIZE && (
                <p className="text-center text-[11px] text-muted-foreground py-3">
                  Všetky komentáre načítané
                </p>
              )}
            </>
          )}
        </ScrollArea>

        <div className="border-t border-border/30 p-3 bg-background">
          <div className="flex gap-2 items-end">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Napíš komentár..."
              className="min-h-[44px] max-h-32 resize-none text-sm"
              maxLength={500}
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              aria-label="Odoslať komentár"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{text.length}/500</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default TalentCommentsSheet;
