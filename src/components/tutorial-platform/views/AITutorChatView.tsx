import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Send, Loader2, Bot, User, Sparkles, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message { role: "user" | "assistant"; content: string; }
interface Props { onBack: () => void; }

const suggestions = [
  "Explain React hooks simply",
  "What is machine learning?",
  "How does CSS Grid work?",
  "Teach me Python basics",
];

export function AITutorChatView({ onBack }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! 👋 I'm your AI Tutor. Ask me anything about any course topic — programming, design, marketing, science, and more. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg: Message = { role: "user", content: msg };
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Tutor Chat</h2>
            <p className="text-muted-foreground">Personal AI tutor for any subject</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 CR / Session
          </Badge>
        </div>

        <Card className="h-[520px] flex flex-col border-cyan-500/10 shadow-lg">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-foreground border border-emerald-500/20" 
                    : "bg-muted/80 border border-border/50"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted/80 rounded-2xl px-4 py-3 border border-border/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)} className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 transition-colors flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />{s}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your tutor anything..." onKeyDown={e => e.key === "Enter" && sendMessage()} className="h-11" />
            <Button onClick={() => sendMessage()} disabled={loading} className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}