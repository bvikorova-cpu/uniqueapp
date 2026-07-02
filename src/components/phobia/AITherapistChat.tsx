import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "I'm anxious about spiders",
  "How do I cope with social anxiety?",
  "What is exposure therapy?",
  "Help me with my fear of heights",
];

export const AITherapistChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI Fear Therapist. I can help you understand and manage your phobias using evidence-based techniques. What fear would you like to work on today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    
    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemPrompt: "You are a compassionate AI therapist specializing in phobias and anxiety disorders. Use evidence-based techniques like CBT, exposure therapy, and mindfulness. Be empathetic, professional, and helpful. Provide actionable advice and coping strategies. Always remind users to seek professional help for severe conditions. Keep responses concise (2-3 paragraphs max).",
        },
      });

      if (error) throw error;
      const reply = data?.response || data?.content || data?.message || "I'm here to help. Could you tell me more about your fear?";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I'm having trouble responding right now. Let's try again — tell me about the fear you'd like to work on." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Therapist Chat - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Therapist Chat section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Therapist Chat.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-400" />
          <h3 className="font-bold text-sm">AI Fear Therapist</h3>
          <span className="ml-auto text-[10px] text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
          </span>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 border border-border/50"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-[11px] px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                <Sparkles className="h-3 w-3 inline mr-1" />{p}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-border/50 flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Describe your fear or ask for advice..."
            className="bg-muted/10 border-border/50" />
          <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
    </>
  );
};
