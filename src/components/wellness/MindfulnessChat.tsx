import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Brain, Sparkles, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "I'm feeling anxious right now",
  "Help me with a breathing exercise",
  "I can't stop overthinking",
  "I need motivation today",
];

export function MindfulnessChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! 🌿 I'm your mindfulness coach. I'm here to support your mental wellbeing with empathy and evidence-based techniques. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellness-mindfulness-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        }
      );

      if (!response.ok || !response.body) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally { setIsLoading(false); }
  };

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="MindfulnessChat — How it works" steps={[{title:"Open this tool",desc:"Access MindfulnessChat within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-primary/5 to-pink-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          AI Mindfulness Coach
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Online</Badge>
        </CardTitle>
        <CardDescription>A compassionate AI trained in CBT, mindfulness, and therapeutic techniques</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1.5 border-border/50 hover:border-primary/30"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
            >
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              {prompt}
            </Button>
          ))}
        </div>

        <ScrollArea ref={scrollRef} className="h-[400px] pr-4 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-3">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/60 backdrop-blur-sm border border-border/30 rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Heart className="h-3 w-3 text-pink-400" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Coach</span>
                    </div>
                  )}
                  {msg.content || (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Share what's on your mind..."
            disabled={isLoading}
            className="backdrop-blur-sm"
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} className="active:scale-[0.97] transition-transform">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
