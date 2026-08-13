import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { EyeOff, Eye, MoreVertical, Send, ShieldAlert, Trash2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeMessageContent, checkRateLimit, MAX_MESSAGE_LEN } from "@/lib/messageSafety";
import { TypingDots } from "@/components/realtime/TypingDots";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface ChatMessage {
  id: string;
  show_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_hidden?: boolean;
  sender_name?: string | null;
  sender_avatar?: string | null;
}

interface ComedyLiveChatProps {
  showId: string;
  /** Show moderation controls (host of the show / admin). */
  canModerate?: boolean;
  className?: string;
}

const MAX_RENDERED = 200;

export function ComedyLiveChat({ showId, canModerate = false, className }: ComedyLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<Map<string, { name: string | null; avatar: string | null }>>(new Map());

  const { typingUsers, notifyTyping } = useTypingIndicator({
    channelKey: `comedy-show:${showId}`,
    user: userId ? { id: userId } : null,
  });

  const hydrateNames = useCallback(async (ids: string[]) => {
    const missing = ids.filter((id) => id && !namesRef.current.has(id));
    if (!missing.length) return;
    const { data } = await (supabase as any)
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", missing);
    ((data ?? []) as any[]).forEach((p: any) => {
      namesRef.current.set(p.user_id, { name: p.display_name ?? null, avatar: p.avatar_url ?? null });
    });
    missing.forEach((id) => {
      if (!namesRef.current.has(id)) namesRef.current.set(id, { name: null, avatar: null });
    });
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        sender_name: namesRef.current.get(m.sender_id)?.name ?? m.sender_name ?? null,
        sender_avatar: namesRef.current.get(m.sender_id)?.avatar ?? m.sender_avatar ?? null,
      })),
    );
  }, []);

  // Current user + mute state
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(data.user?.id ?? null);
      if (data.user) {
        const { data: to } = await (supabase as any)
          .from("comedy_chat_timeouts")
          .select("expires_at")
          .eq("show_id", showId)
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (active) setMuted(!!to && new Date(to.expires_at) > new Date());
      }
    })();
    return () => {
      active = false;
    };
  }, [showId]);

  // Initial load + realtime
  useEffect(() => {
    if (!showId) return;
    let active = true;

    (async () => {
      const { data } = await (supabase as any)
        .from("comedy_show_messages")
        .select("id, show_id, sender_id, message, created_at, is_hidden")
        .eq("show_id", showId)
        .order("created_at", { ascending: true })
        .limit(MAX_RENDERED);
      if (!active) return;
      const rows = (data ?? []) as ChatMessage[];
      setMessages(rows);
      void hydrateNames(rows.map((r) => r.sender_id));
    })();

    const channel = supabase
      .channel(`comedy-chat-${showId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comedy_show_messages", filter: `show_id=eq.${showId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const old = payload.old as any;
            setMessages((prev) => prev.filter((m) => m.id !== old.id));
            return;
          }
          const row = payload.new as ChatMessage;
          setMessages((prev) => {
            const next = prev.some((m) => m.id === row.id)
              ? prev.map((m) => (m.id === row.id ? { ...m, ...row } : m))
              : [...prev, row];
            return next.slice(-MAX_RENDERED);
          });
          void hydrateNames([row.sender_id]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [showId, hydrateNames]);

  // Auto-scroll to newest
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const visible = useMemo(
    () => messages.filter((m) => !m.is_hidden || showHidden || m.sender_id === userId),
    [messages, showHidden, userId],
  );

  const send = async () => {
    const text = sanitizeMessageContent(value);
    if (!text || sending) return;
    if (!userId) {
      toast.error("Sign in to join the chat");
      return;
    }
    if (muted) {
      toast.error("You are timed out in this chat");
      return;
    }
    const limit = checkRateLimit(`comedy-chat:${showId}`, 8, 10_000);
    if (!limit.ok) {
      toast.error(`Slow down — try again in ${Math.ceil(limit.retryAfterMs / 1000)}s`);
      return;
    }
    setSending(true);
    const { error } = await (supabase as any)
      .from("comedy_show_messages")
      .insert({ show_id: showId, sender_id: userId, message: text });
    setSending(false);
    if (error) {
      const isMute = /policy/i.test(error.message);
      if (isMute) setMuted(true);
      toast.error(isMute ? "You cannot post in this chat right now" : "Failed to send message");
      return;
    }
    setValue("");
  };

  const setHidden = async (msg: ChatMessage, hidden: boolean) => {
    const { error } = await (supabase as any)
      .from("comedy_show_messages")
      .update({
        is_hidden: hidden,
        hidden_by: hidden ? userId : null,
        hidden_at: hidden ? new Date().toISOString() : null,
      })
      .eq("id", msg.id);
    if (error) {
      toast.error("Moderation failed");
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_hidden: hidden } : m)));
    toast.success(hidden ? "Message hidden" : "Message restored");
  };

  const removeMessage = async (msg: ChatMessage) => {
    const { error } = await (supabase as any).from("comedy_show_messages").delete().eq("id", msg.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    toast.success("Message deleted");
  };

  const timeoutUser = async (msg: ChatMessage, minutes: number) => {
    if (!userId) return;
    const expires_at = new Date(Date.now() + minutes * 60_000).toISOString();
    const { error } = await (supabase as any).from("comedy_chat_timeouts").upsert(
      { show_id: showId, user_id: msg.sender_id, created_by: userId, expires_at, reason: "Chat moderation" },
      { onConflict: "show_id,user_id" },
    );
    if (error) {
      toast.error("Could not time out this viewer");
      return;
    }
    toast.success(`Viewer timed out for ${minutes} min`);
  };

  return (
    <Card className={cn("p-4 flex flex-col h-[600px]", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Live Chat</h3>
        {canModerate && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setShowHidden((v) => !v)}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {showHidden ? "Hide moderated" : "Show moderated"}
          </Button>
        )}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet — say hi to the comedian!</p>
        )}
        {visible.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "group flex items-start gap-2 rounded-md px-2 py-1 text-sm",
              msg.is_hidden && "opacity-60 bg-muted",
            )}
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium">{msg.sender_name || "Viewer"}: </span>
              <span className="break-words">{msg.message}</span>
              {msg.is_hidden && (
                <Badge variant="outline" className="ml-2 text-[10px]">
                  hidden
                </Badge>
              )}
            </div>
            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Moderate message"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {msg.is_hidden ? (
                    <DropdownMenuItem onClick={() => setHidden(msg, false)}>
                      <Eye className="mr-2 h-4 w-4" /> Restore message
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setHidden(msg, true)}>
                      <EyeOff className="mr-2 h-4 w-4" /> Hide message
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => timeoutUser(msg, 5)}>
                    <Timer className="mr-2 h-4 w-4" /> Timeout 5 min
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => timeoutUser(msg, 60)}>
                    <Timer className="mr-2 h-4 w-4" /> Timeout 1 hour
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => removeMessage(msg)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      <TypingDots names={typingUsers.map((t) => t.display_name ?? "Someone")} className="mt-2" />

      <div className="mt-3 flex gap-2">
        <Input
          placeholder={muted ? "You are timed out" : "Type a message..."}
          value={value}
          maxLength={MAX_MESSAGE_LEN}
          disabled={muted}
          onChange={(e) => {
            setValue(e.target.value);
            notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button size="icon" onClick={() => void send()} disabled={sending || muted || !value.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export default ComedyLiveChat;
