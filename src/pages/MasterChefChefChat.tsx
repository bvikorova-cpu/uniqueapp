import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
}

export default function MasterChefChefChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setCurrentUserId(session.user.id);
    await loadMessages();
    
    const channel = supabase
      .channel("masterchef-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "masterchef_chat_messages" }, (payload) => {
        const raw = payload.new as Record<string, unknown>;
        const msg: ChatMessage = {
          id: raw.id as string,
          user_id: raw.user_id as string,
          message: raw.message as string,
          created_at: raw.created_at as string,
        };
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const loadMessages = async () => {
    const { data: rawData, error: rawError } = await (supabase as any)
      .from("masterchef_chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (rawData) {
      const userIds = [...new Set(rawData.map((m: any) => m.user_id))] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name || "Chef"]));
      setMessages(rawData.map(m => ({ ...m, user_name: profileMap.get(m.user_id) || "Chef" })));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("masterchef_chat_messages")
        .insert({ user_id: currentUserId, message: newMessage.trim() });
      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Chef Chat works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Chef Community Chat
          </h1>
          <p className="text-muted-foreground text-lg">Connect with fellow chefs in real-time</p>
        </div>

        <Card className="h-[60vh] flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" /> General Kitchen Chat
              <span className="text-xs text-muted-foreground ml-auto">{messages.length} messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.user_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                      msg.user_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      <p className="text-xs font-medium opacity-80 mb-0.5">{msg.user_name || "Chef"}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input placeholder="Type your message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} className="flex-1" />
              <Button onClick={sendMessage} disabled={loading || !newMessage.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
