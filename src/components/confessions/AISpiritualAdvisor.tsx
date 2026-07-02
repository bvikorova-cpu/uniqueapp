import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Brain, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const AISpiritualAdvisor = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Welcome, seeker. I am your AI Spiritual Advisor. Share what weighs on your soul, and I will offer guidance, perspective, and paths toward inner peace. Whether you seek forgiveness, understanding, or spiritual growth — I am here to listen.\n\nWhat would you like to discuss?",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const conversationContext = messages
        .filter(m => m.id !== "welcome")
        .slice(-10)
        .map(m => `${m.role === "user" ? "Seeker" : "Advisor"}: ${m.content}`)
        .join("\n\n");

      const { data, error } = await supabase.functions.invoke("create-reincarnation-plan", {
        body: {
          planName: "Spiritual Guidance Session",
          goalDescription: `You are a compassionate AI Spiritual Advisor on a confession and redemption platform. A seeker comes to you for guidance. Respond with wisdom, empathy, and practical spiritual advice. Keep responses concise (2-3 paragraphs max). Use markdown formatting.

Previous conversation:
${conversationContext}

Seeker's latest message: ${userMsg.content}

Provide thoughtful spiritual guidance addressing their concern.`,
        },
      });

      if (error) throw error;

      const advisorResponse = data?.plan?.next_life_goal || 
        data?.plan?.soul_missions?.[0]?.mission ||
        "I sense the depth of your concern. Let us explore this together. Consider that every burden carried is also an opportunity for growth. What specific aspect would you like to examine further?";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: advisorResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      toast({ title: "Failed to get guidance", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "I feel guilty about something I did",
    "How do I forgive myself?",
    "I need guidance on letting go",
    "What does redemption mean?",
  ];

  return (
    <>
      <FloatingHowItWorks
        title='AISpiritual Advisor'
        steps={[
          { title: 'Open the tool', desc: 'Launch the AISpiritual Advisor panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">AI Spiritual Advisor</h3>
        <p className="text-sm text-muted-foreground">
          Receive compassionate AI-powered spiritual guidance. Share what weighs on your heart
          and receive thoughtful advice for your journey toward peace and redemption.
        </p>
      </Card>

      {/* Chat Area */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
        <div ref={scrollRef} className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant" ? "bg-primary/10" : "bg-muted/30"
              }`}>
                {msg.role === "assistant" ? <Brain className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted/30 border border-border/30 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/30 border border-border/30 rounded-2xl rounded-tl-sm p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-[10px] h-7"
                onClick={() => { setInput(prompt); }}
              >
                <Sparkles className="h-3 w-3 mr-1" />{prompt}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/30">
          <div className="flex gap-2">
            <Textarea
              placeholder="Share what's on your mind..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={2}
              className="resize-none"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="shrink-0 h-auto">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};
