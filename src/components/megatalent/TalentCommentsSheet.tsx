import { useEffect, useState } from "react";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TalentComment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  submissionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCountChange?: (submissionId: string, count: number) => void;
}

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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (open && submissionId) {
      fetchComments(submissionId);
    } else {
      setComments([]);
      setText("");
    }
  }, [open, submissionId]);

  // Realtime subscription for new comments on this submission
  useEffect(() => {
    if (!open || !submissionId) return;
    const channel = supabase
      .channel(`talent_comments:${submissionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "talent_comments", filter: `submission_id=eq.${submissionId}` },
        () => fetchComments(submissionId)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "talent_comments", filter: `submission_id=eq.${submissionId}` },
        () => fetchComments(submissionId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, submissionId]);

  const fetchComments = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("talent_comments")
        .select("id, user_id, comment_text, created_at")
        .eq("submission_id", id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((c) => c.user_id))];
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        profilesMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
      }

      const enriched: TalentComment[] = (data ?? []).map((c) => ({
        ...c,
        profiles: profilesMap[c.user_id] ?? null,
      }));
      setComments(enriched);
      onCountChange?.(id, enriched.length);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      toast({ title: "Chyba", description: "Nepodarilo sa načítať komentáre", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
      await fetchComments(submissionId);
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
      await fetchComments(submissionId);
    } catch (err: any) {
      toast({ title: "Chyba", description: err?.message || "Nepodarilo sa odstrániť komentár", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Komentáre {comments.length > 0 && <span className="text-muted-foreground text-sm">({comments.length})</span>}
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
