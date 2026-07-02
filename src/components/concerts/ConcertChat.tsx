import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertChat = ({ onBack }: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("concert-global-chat")
      .on("broadcast", { event: "chat_message" }, (payload) => {
        setMessages(prev => [...prev, payload.payload]);
      })
      .subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !channelRef.current) return;
    try {
      setSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to chat"); return; }

      const msg = {
        user_id: session.user.id,
        username: session.user.email?.split("@")[0] || "Anonymous",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // Reuse subscribed channel instead of creating a new one per send (leak fix).
      await channelRef.current.send({
        type: "broadcast",
        event: "chat_message",
        payload: msg,
      });

      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };


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
          <div ref={scrollRef} className="h-[400px] overflow-y-auto space-y-3 mb-4 p-3 bg-muted/30 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="font-bold text-primary">{msg.username}: </span>
                <span className="text-foreground">{msg.content}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={sending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
