import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Msg {
  id: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  itemId: string;
  sellerId: string;
  currentUserId: string;
}

/**
 * Two-way realtime chat between buyer & seller scoped to a specific bazaar item.
 * Uses bazaar_messages table.
 */
export const BazaarItemChat = ({ itemId, sellerId, currentUserId }: Props) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherUserId = currentUserId === sellerId ? null : sellerId;
  const isSeller = currentUserId === sellerId;

  const load = async () => {
    const query = supabase
      .from("bazaar_messages")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true });
    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      // For seller view: show all messages on this item; for buyer view: only between them and seller
      const filtered = isSeller
        ? (data || [])
        : (data || []).filter(
            (m) =>
              (m.sender_id === currentUserId && m.receiver_id === sellerId) ||
              (m.sender_id === sellerId && m.receiver_id === currentUserId),
          );
      setMessages(filtered as Msg[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`bazaar-msg-${itemId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bazaar_messages", filter: `item_id=eq.${itemId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!input.trim() || sending) return;
    if (isSeller) {
      toast({ title: "Tip", description: "Open the conversation from a buyer's message to reply.", variant: "destructive" });
      return;
    }
    if (!otherUserId) return;
    setSending(true);
    const { error } = await supabase.from("bazaar_messages").insert({
      item_id: itemId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      message: input.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInput("");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Bazaar Item Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="flex flex-col gap-2">
      <ScrollArea className="h-64 rounded border bg-muted/30 p-3" ref={scrollRef as any}>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet — say hi 👋</p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-background border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    <p className="mt-1 text-[10px] opacity-70">{format(new Date(m.created_at), "HH:mm")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      {!isSeller && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type a message…"
            disabled={sending}
          />
          <Button onClick={send} disabled={sending || !input.trim()} size="icon">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
      {isSeller && (
        <p className="text-xs text-muted-foreground text-center">
          You're the seller — replies happen in the buyer's order chat once they purchase.
        </p>
      )}
    </div>
    </>
    );
};

export default BazaarItemChat;
