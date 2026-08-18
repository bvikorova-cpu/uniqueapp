import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChatAttachmentPicker, ChatAttachmentView, uploadChatMedia } from "@/components/chat/ChatAttachment";

interface Msg {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  attachment_path?: string | null;
  attachment_type?: string | null;
}


interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  offeringId: string;
  offeringTitle: string;
  otherId: string;
  otherName?: string;
}

export function SkillChatDialog({ open, onOpenChange, offeringId, offeringTitle, otherId, otherName }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const markRead = async () => {
    if (!user) return;
    await supabase
      .from("marketplace_responses")
      .update({ is_read: true })
      .eq("offering_id", offeringId)
      .eq("sender_id", otherId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);

    const fetchMessages = async (initial = false) => {
      const { data } = await supabase
        .from("marketplace_responses")
        .select("id, sender_id, receiver_id, message, created_at, attachment_path, attachment_type")
        .eq("offering_id", offeringId)
        .or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const rows = ((data || []) as Msg[]).filter(
        (m) =>
          (m.sender_id === user.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.id),
      );
      setMessages((prev) => (prev.length === rows.length && prev.every((p, i) => p.id === rows[i]?.id) ? prev : rows));
      if (initial) setLoading(false);
      markRead();
    };

    fetchMessages(true);

    const channel = supabase
      .channel(`skillmsg-${offeringId}-${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "marketplace_responses", filter: `offering_id=eq.${offeringId}` },
        (payload) => {
          const m = payload.new as Msg;
          const relevant =
            (m.sender_id === user.id && m.receiver_id === otherId) ||
            (m.sender_id === otherId && m.receiver_id === user.id);
          if (!relevant) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== user.id) markRead();
        },
      )
      .subscribe();

    const poll = window.setInterval(() => fetchMessages(), 4000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, offeringId, otherId]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    const trimmed = content.trim();
    if (!file && trimmed.length < 5) { toast.error("Message is too short"); return; }
    setSending(true);

    let attachment_path: string | null = null;
    let attachment_type: string | null = null;
    if (file) {
      try {
        attachment_path = await uploadChatMedia(file, user.id);
        attachment_type = file.type;
      } catch (e: any) {
        setSending(false);
        toast.error(e?.message || "Upload failed");
        return;
      }
    }

    const body = trimmed || (file?.type.startsWith("video/") ? `🎬 ${file.name}` : `📷 ${file?.name ?? "photo"}`);

    const { data: inserted, error } = await supabase.from("marketplace_responses").insert({
      offering_id: offeringId,
      sender_id: user.id,
      receiver_id: otherId,
      message: body,
      attachment_path,
      attachment_type,
    }).select("id, sender_id, receiver_id, message, created_at, attachment_path, attachment_type").maybeSingle();
    setSending(false);
    if (error) {
      const msg = error.message || "";
      if (msg.includes("RATE_LIMIT")) {
        toast.error("Anti-spam limit reached — try again later");
      } else if (msg.includes("DUPLICATE_MESSAGE")) {
        toast.error("You already sent this exact message");
      } else if (/row-level security/i.test(msg)) {
        toast.error("Chat locked — unlock the chat with 1 credit first");
      } else {
        toast.error(msg);
      }
      return;
    }
    if (inserted) {
      const m = inserted as Msg;
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    }
    setContent("");
    setFile(null);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] flex flex-col h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> {otherName || "Chat"}
          </DialogTitle>
          <DialogDescription className="truncate">{offeringTitle}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 border rounded-md p-3" ref={scrollRef as any}>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No messages yet — say hello!</p>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message…"
            rows={2}
            disabled={sending}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <Button onClick={send} disabled={sending || content.trim().length < 5}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
