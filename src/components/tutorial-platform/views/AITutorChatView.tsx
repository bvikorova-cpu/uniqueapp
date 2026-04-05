import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message { role: "user" | "assistant"; content: string; }
interface Props { onBack: () => void; }

export function AITutorChatView({ onBack }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI Tutor. Ask me anything about any course topic — programming, design, marketing, science, and more. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'tutor-chat', messages: [...messages, userMsg] }
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.result }]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to get response", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-8 h-8 text-cyan-500" />
          <div>
            <h2 className="text-2xl font-black">AI Tutor Chat</h2>
            <p className="text-muted-foreground">Personal AI tutor for any subject</p>
          </div>
          <Badge className="ml-auto bg-cyan-500/10 text-cyan-500">3 Credits / Session</Badge>
        </div>

        <Card className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-cyan-500" /></div>}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-emerald-500/20 text-foreground" : "bg-muted"}`}>
                  {msg.content}
                </div>
                {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-emerald-500" /></div>}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-cyan-500" /></div>
                <div className="bg-muted rounded-xl px-4 py-3"><Loader2 className="w-4 h-4 animate-spin" /></div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
          <div className="p-4 border-t flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your tutor..." onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <Button onClick={sendMessage} disabled={loading}><Send className="w-4 h-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
