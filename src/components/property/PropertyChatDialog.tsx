import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Msg {
  id: string;
  sender_id: string;
  buyer_id: string;
  seller_id: string;
  content: string;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  /** Explicit buyer id — required when the current user is the seller viewing a thread */
  buyerIdOverride?: string;
}

export function PropertyChatDialog({ open, onOpenChange, propertyId, propertyTitle, sellerId, buyerIdOverride }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const buyerId = buyerIdOverride ?? (user?.id && user.id !== sellerId ? user.id : null);
  const canSend = !!user && !!buyerId;

  const markRead = async () => {
    if (!user) return;
    await supabase
      .from("property_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("property_id", propertyId)
      .eq("buyer_id", buyerId ?? user.id)
      .eq("seller_id", sellerId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  };

  useEffect(() => {
    if (!open || !user) return;
    const effectiveBuyer = buyerId ?? user.id;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("property_messages")
      .select("*")
      .eq("property_id", propertyId)
      .eq("buyer_id", effectiveBuyer)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setMessages((data || []) as Msg[]);
        setLoading(false);
        markRead();
      });

    const channel = supabase
      .channel(`pmsg-${propertyId}-${effectiveBuyer}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "property_messages", filter: `property_id=eq.${propertyId}` },
        (payload) => {
          const m = payload.new as Msg;
          if (m.buyer_id === effectiveBuyer && m.seller_id === sellerId) {
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
            if (m.sender_id !== user.id) markRead();
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, buyerId, propertyId, sellerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user) { toast.error("Please sign in to message the seller"); return; }
    if (!buyerId) { toast.error("You can't message your own listing"); return; }
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    const { error } = await supabase.from("property_messages").insert({
      property_id: propertyId,
      buyer_id: buyerId,
      seller_id: sellerId,
      sender_id: user.id,
      content: trimmed,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] flex flex-col h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Chat with seller</DialogTitle>
          <DialogDescription className="truncate">{propertyTitle}</DialogDescription>
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
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
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
            placeholder={buyerId ? "Type your message…" : "You can't message your own listing"}
            rows={2}
            disabled={!buyerId || sending}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <Button onClick={send} disabled={!buyerId || sending || !content.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
