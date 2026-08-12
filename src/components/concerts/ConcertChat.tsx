import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useSpendCredits, CREDIT_COSTS } from "@/hooks/useSpendCredits";

interface Props {
  onBack: () => void;
  /** Embedded mode: renders only the message list + composer (no page chrome). */
  embedded?: boolean;
  /** Optional room id so each concert has its own lounge. */
  roomId?: string;
}

export const ConcertChat = ({ onBack, embedded = false, roomId }: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { spend } = useSpendCredits();

  // Persisted chat (per concert). The legacy global lounge (no roomId) stays
  // broadcast-only because it isn't tied to a concert row.
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const topic = roomId ? `concert-chat-${roomId}` : "concert-global-chat";

  useEffect(() => {
    let cancelled = false;

    if (roomId) {
      (async () => {
        const { data } = await supabase
          .from("concert_chat_messages")
          .select("id, user_id, username, content, created_at")
          .eq("concert_id", roomId)
          .order("created_at", { ascending: true })
          .limit(200);
        if (!cancelled) {
          setMessages((data ?? []).map((m: any) => ({ ...m, timestamp: m.created_at })));
        }
      })();

      const ch = supabase
        .channel(`concert-chat-db-${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "concert_chat_messages", filter: `concert_id=eq.${roomId}` },
          (payload) => {
            const row: any = payload.new;
            setMessages((prev) =>
              prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, timestamp: row.created_at }]
            );
          }
        )
        .subscribe();
      channelRef.current = null;
      return () => { cancelled = true; supabase.removeChannel(ch); };
    }

    const channel = supabase
      .channel(topic)
      .on("broadcast", { event: "chat_message" }, (payload) => {
        setMessages(prev => [...prev, payload.payload]);
      })
      .subscribe();
    channelRef.current = channel;

    return () => { cancelled = true; supabase.removeChannel(channel); channelRef.current = null; };
  }, [topic, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;
    try {
      setSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to chat"); return; }

      // Each chat message costs 1 AI credit (unified ai_credits + ledger).
      const paid = await spend("concert_chat_message", { description: "concert_chat_message" });
      if (!paid) return;

      const username = session.user.email?.split("@")[0] || "Anonymous";

      if (roomId) {
        const { data, error } = await supabase
          .from("concert_chat_messages")
          .insert({ concert_id: roomId, user_id: session.user.id, username, content: text })
          .select("id, user_id, username, content, created_at")
          .single();
        if (error) throw error;
        setMessages((prev) =>
          prev.some((m) => m.id === (data as any).id)
            ? prev
            : [...prev, { ...(data as any), timestamp: (data as any).created_at }]
        );
        setNewMessage("");
        toast.success("Sent · 1 credit used");
        return;
      }

      const msg = { user_id: session.user.id,
        username,
        content: text,
        timestamp: new Date().toISOString() };

      // Reuse subscribed channel instead of creating a new one per send (leak fix).
      await channelRef.current?.send({ type: "broadcast",
        event: "chat_message",
        payload: msg });

      setMessages(prev => [...prev, msg]);
      setNewMessage("");
      toast.success("Sent · 1 credit used");
    } catch (e: any) { toast.error(e?.message || "Failed to send message"); }
    finally { setSending(false); }
  };


  const messageList = (
    <div
      ref={scrollRef}
      className={`overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg ${embedded ? "flex-1 min-h-0" : "h-[400px] mb-4"}`}
    >
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : messages.map((msg, i) => (
        <div key={i} className="text-sm">
          <span className="font-bold text-primary">{msg.username}: </span>
          <span className="text-foreground break-words">{msg.content}</span>
        </div>
      ))}
    </div>
  );

  const composer = (
    <div className="flex gap-2">
      <Input
        placeholder={`Type a message... (${CREDIT_COSTS.concert_chat_message} credit)`}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <Button onClick={sendMessage} disabled={sending} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col h-full min-h-0 gap-2 px-2 pb-2">
        {messageList}
        {composer}
      </div>
    );
  }

  return (
    <>
      <FloatingHowItWorks title="How Concert Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Concert Lounge Chat</h2>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Global Concert Lounge
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />Live</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messageList}
          {composer}
        </CardContent>
      </Card>
    </div>
    </>
    );
};
