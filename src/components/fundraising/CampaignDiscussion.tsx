import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Megaphone, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type CampaignType = "medical" | "dream" | "hero" | "pet" | "student" | "crisis" | "talent";

interface Props {
  campaignId: string;
  campaignType: CampaignType;
  ownerUserId: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}
interface Update {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

export function CampaignDiscussion({ campaignId, campaignType, ownerUserId }: Props) {
  const [me, setMe] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [commentText, setCommentText] = useState("");
  const [updTitle, setUpdTitle] = useState("");
  const [updBody, setUpdBody] = useState("");
  const [posting, setPosting] = useState(false);

  const isOwner = me === ownerUserId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  // Initial load + realtime
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [c, u] = await Promise.all([
        supabase
          .from("campaign_comments" as any)
          .select("id,user_id,content,created_at")
          .eq("campaign_id", campaignId)
          .eq("campaign_type", campaignType)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("campaign_updates" as any)
          .select("id,user_id,title,body,created_at")
          .eq("campaign_id", campaignId)
          .eq("campaign_type", campaignType)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (!mounted) return;
      setComments((c.data as unknown as Comment[]) || []);
      setUpdates((u.data as unknown as Update[]) || []);
    })();

    const ch = supabase
      .channel(`campaign-discussion-${campaignType}-${campaignId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_comments", filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          if ((payload.new as any)?.campaign_type !== campaignType && (payload.old as any)?.campaign_type !== campaignType) return;
          if (payload.eventType === "INSERT") setComments((p) => [payload.new as Comment, ...p]);
          else if (payload.eventType === "DELETE") setComments((p) => p.filter((x) => x.id !== (payload.old as Comment).id));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_updates", filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          if ((payload.new as any)?.campaign_type !== campaignType && (payload.old as any)?.campaign_type !== campaignType) return;
          if (payload.eventType === "INSERT") setUpdates((p) => [payload.new as Update, ...p]);
          else if (payload.eventType === "DELETE") setUpdates((p) => p.filter((x) => x.id !== (payload.old as Update).id));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [campaignId, campaignType]);

  const postComment = async () => {
    if (!me) { toast({ title: "Sign in to comment", variant: "destructive" }); return; }
    const text = commentText.trim();
    if (text.length < 1) return;
    setPosting(true);
    const { error } = await supabase.from("campaign_comments" as any).insert({
      campaign_id: campaignId, campaign_type: campaignType, user_id: me, content: text,
    });
    setPosting(false);
    if (error) { toast({ title: "Failed to post", description: error.message, variant: "destructive" }); return; }
    setCommentText("");
  };

  const postUpdate = async () => {
    if (!me || !isOwner) return;
    const t = updTitle.trim(); const b = updBody.trim();
    if (!t || !b) return;
    setPosting(true);
    const { error } = await supabase.from("campaign_updates" as any).insert({
      campaign_id: campaignId, campaign_type: campaignType, user_id: me, title: t, body: b,
    });
    setPosting(false);
    if (error) { toast({ title: "Failed to post update", description: error.message, variant: "destructive" }); return; }
    setUpdTitle(""); setUpdBody("");
    toast({ title: "Update posted", description: "All donors have been notified." });
  };

  const del = async (table: "campaign_comments" | "campaign_updates", id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast({ title: "Failed to delete", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Updates from creator */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Updates from creator</h3>
          <Badge variant="secondary" className="ml-auto text-xs">{updates.length}</Badge>
        </div>

        {isOwner && (
          <div className="space-y-2 mb-4 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
            <Input
              placeholder="Update title"
              value={updTitle}
              onChange={(e) => setUpdTitle(e.target.value)}
              maxLength={200}
            />
            <Textarea
              placeholder="Share progress with your donors…"
              value={updBody}
              onChange={(e) => setUpdBody(e.target.value)}
              maxLength={5000}
              rows={3}
            />
            <Button size="sm" onClick={postUpdate} disabled={posting || !updTitle.trim() || !updBody.trim()}>
              <Send className="w-3 h-3 mr-1" /> Post update
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {updates.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-lg bg-background/60 border border-border/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{u.title}</h4>
                  {me === u.user_id && (
                    <button onClick={() => del("campaign_updates", u.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{u.body}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {updates.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No updates yet.</p>
          )}
        </div>
      </Card>

      {/* Comments */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Comments</h3>
          <Badge variant="secondary" className="ml-auto text-xs">{comments.length}</Badge>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder={me ? "Write a comment…" : "Sign in to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!me}
            maxLength={2000}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
          />
          <Button size="sm" onClick={postComment} disabled={!me || posting || !commentText.trim()}>
            <Send className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="p-2 rounded-lg bg-background/60 border border-border/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm whitespace-pre-wrap flex-1">{c.content}</p>
                  {me === c.user_id && (
                    <button onClick={() => del("campaign_comments", c.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Be the first to comment.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
