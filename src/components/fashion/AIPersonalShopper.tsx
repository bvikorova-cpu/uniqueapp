import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Send, Bot, User, ShoppingBag, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CREDIT_COST = 2;
const SUGGESTIONS = [
  "What should I wear to a summer wedding?",
  "Build me a capsule wardrobe for €500",
  "What colors suit a warm skin tone?",
  "Suggest a date night outfit for winter",
];

export default function AIPersonalShopper() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { credits, spendCredit } = useAICredits();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "AI Personal Shopper Chat");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const newMessages = [...messages, { role: "user" as const, content: userMessage }];
      setMessages(newMessages);

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "personal-shopper", messages: newMessages },
      });
      if (error) throw error;
      return data.reply;
    },
    onSuccess: (reply) => {
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    },
    onError: (e: any) => {
      toast.error(e.message);
      setMessages(prev => prev.slice(0, -1));
    },
  });

  const sendMessage = (msg?: string) => {
    const text = msg || input.trim();
    if (!text) return;
    setInput("");
    mutation.mutate(text);
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPersonal Shopper works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Personal Shopper</h2>
            <p className="text-sm text-muted-foreground">Chat with Luna, your AI fashion consultant • {CREDIT_COST} Credits/message</p>
          </div>
        </div>
      </Card>

      <Card className="bg-card/80 backdrop-blur-xl border-primary/20 overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">Hi, I'm Luna! 👋</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Your personal AI fashion consultant. Ask me anything about style, outfits, brands, or shopping!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs text-left justify-start h-auto py-2 hover:border-primary/40"
                    onClick={() => sendMessage(s)}
                    disabled={mutation.isPending || (credits?.credits_remaining || 0) < CREDIT_COST}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5 shrink-0 text-primary" />
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {mutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted/50 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 border-t border-border/50">
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Luna about fashion..."
              disabled={mutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || mutation.isPending || (credits?.credits_remaining || 0) < CREDIT_COST}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {credits && credits.credits_remaining < CREDIT_COST && (
            <p className="text-xs text-destructive text-center mt-1">Insufficient credits</p>
          )}
        </div>
      </Card>
    </div>
    </>
    );
}
