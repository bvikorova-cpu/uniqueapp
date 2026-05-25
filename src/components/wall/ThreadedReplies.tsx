import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, ChevronDown, ChevronUp, Quote, Send, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ThreadedRepliesProps {
  postId: string;
  commentId: string;
  depth?: number;
  maxDepth?: number;
}

interface ReplyData {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reply_count?: number;
  likes_count?: number;
}

export function ThreadedReplies({ postId, commentId, depth = 0, maxDepth = 3 }: ThreadedRepliesProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [quotedReply, setQuotedReply] = useState<ReplyData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: replies = [], refetch } = useQuery({
    queryKey: ["thread-replies", commentId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("comments")
        .select(`id, content, created_at, user_id, parent_comment_id`)
        .eq("parent_comment_id", commentId)
        .order("created_at", { ascending: true });

      const rows = (data as any[]) || [];
      if (!rows.length) return [];
      const ids = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)));
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
      const m = new Map((profs || []).map((p: any) => [p.id, p]));
      return rows.map((r: any) => ({ ...r, profiles: m.get(r.user_id) || { full_name: null, avatar_url: null } }));
    },
    enabled: expanded,
  });

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const content = quotedReply
        ? `> ${quotedReply.profiles?.full_name}: "${quotedReply.content.slice(0, 100)}"\n\n${replyText}`
        : replyText;

      const { error } = await (supabase as any).from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_comment_id: commentId,
      });

      if (error) throw error;

      setReplyText("");
      setQuotedReply(null);
      setShowReplyInput(false);
      refetch();
    } catch (err) {
      toast({ title: "Failed to reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (replies.length === 0 && !showReplyInput) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReplyInput(true)}
        className="text-xs text-muted-foreground hover:text-primary gap-1 ml-4"
      >
        <Reply className="h-3 w-3" />
        Reply
      </Button>
    );
  }

  return (
    <div className={cn("relative", depth > 0 && "ml-6 pl-4 border-l-2 border-primary/10")}>
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-primary gap-1 mb-1"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </Button>
      )}

      <AnimatePresence>
        {expanded && replies.map((reply: ReplyData) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="py-2"
          >
            <div className="flex gap-2 group">
              <Avatar className="h-6 w-6 mt-0.5">
                <AvatarImage src={reply.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-accent/50">
                  {reply.profiles?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-accent/30 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold">{reply.profiles?.full_name || "User"}</p>
                  {reply.content.startsWith(">") ? (
                    <div>
                      <blockquote className="text-[10px] text-muted-foreground italic border-l-2 border-primary/30 pl-2 my-1">
                        {reply.content.split("\n\n")[0].replace(/^>\s*/, "")}
                      </blockquote>
                      <p className="text-xs">{reply.content.split("\n\n").slice(1).join("\n\n")}</p>
                    </div>
                  ) : (
                    <p className="text-xs">{reply.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </span>
                  <button className="text-[10px] text-muted-foreground hover:text-primary font-medium">
                    Like
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyInput(true);
                      setQuotedReply(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-primary font-medium"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyInput(true);
                      setQuotedReply(reply);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-primary font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Quote className="h-2.5 w-2.5" />
                    Quote
                  </button>
                </div>

                {/* Recursive nested replies */}
                {depth < maxDepth && (
                  <ThreadedReplies
                    postId={postId}
                    commentId={reply.id}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Reply input */}
      <AnimatePresence>
        {showReplyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
          >
            {quotedReply && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-accent/20 rounded-lg px-2 py-1">
                <Quote className="h-3 w-3 text-primary" />
                <span>Replying to {quotedReply.profiles?.full_name}: "{quotedReply.content.slice(0, 50)}..."</span>
                <button onClick={() => setQuotedReply(null)} className="ml-auto text-muted-foreground hover:text-foreground">×</button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[36px] text-xs resize-none rounded-xl bg-accent/20 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                rows={1}
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-xl shrink-0"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submitting}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
