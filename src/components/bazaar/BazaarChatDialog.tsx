import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChatAttachmentPicker, ChatAttachmentPreview, ChatAttachmentView, uploadChatMedia } from "@/components/chat/ChatAttachment";
import { maskContactInfo } from "@/lib/contactMask";

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
  itemId: string;
  itemTitle: string;
  otherId: string;
  otherName?: string;
}

export function BazaarChatDialog({ open, onOpenChange, itemId, itemTitle, otherId, otherName }: Props) {
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
      .from("bazaar_messages")
      .update({ is_read: true })
      .eq("item_id", itemId)
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
        .from("bazaar_messages")
        .select("id, sender_id, receiver_id, message, created_at, attachment_path, attachment_type")
        .eq("item_id", itemId)
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
      .channel(`bazaarmsg-${itemId}-${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bazaar_messages", filter: `item_id=eq.${itemId}` },
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
  }, [open, user, itemId, otherId]);

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

    const { data: inserted, error } = await supabase
      .from("bazaar_messages")
      .insert({
        item_id: itemId,
        sender_id: user.id,
        receiver_id: otherId,
        message: body,
        attachment_path,
        attachment_type,
      } as any)
      .select("id, sender_id, receiver_id, message, created_at, attachment_path, attachment_type")
      .maybeSingle();
    setSending(false);
    if (error) {
      const msg = error.message || "";
      if (/row-level security/i.test(msg)) {
        toast.error("Chat locked — unlock the contact with 2 credits first");
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
          <DialogDescription className="truncate">{itemTitle}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 border rounded-md p-3" ref={scrollRef as any}>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No messages yet — say hello!</p>
          ) : (
            <div className="space-y-2">
              {messages.map((m, i) => {
                const mine = m.sender_id === user?.id;
                const body = i < 3 ? maskContactInfo(m.message) : m.message;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="whitespace-pre-wrap break-words">{body}</p>
                      {m.attachment_path && <ChatAttachmentView path={m.attachment_path} type={m.attachment_type} />}
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

        <ChatAttachmentPreview file={file} onRemove={() => setFile(null)} />
        <div className="flex items-end gap-2">
          <ChatAttachmentPicker file={file} onFileChange={setFile} disabled={sending} />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message…"
            rows={2}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={send} disabled={sending} size="icon" className="h-10 w-10 shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BazaarChatDialog;
