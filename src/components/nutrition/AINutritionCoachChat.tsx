import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Loader2, ArrowLeft, Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }
interface Message { role: "user" | "assistant"; content: string; }

export default function AINutritionCoachChat({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Nutrition Coach 🥗 Ask me anything about diet, macros, meal timing, supplements, or your fitness nutrition. Each message costs 2 credits." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const credited = await spendCredit('custom_generation', 'Nutrition Coach Chat');
    if (!credited) { toast.error("Not enough credits (2 required)"); return; }

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('nutrition-coach-chat', {
        body: { messages: [...messages, userMsg].slice(-10) }
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      toast.error(e.message || "Error getting response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="AINutritionCoachChat — How it works" steps={[{title:"Open this tool",desc:"Access AINutritionCoachChat within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
              <MessageCircle className="h-5 w-5 text-indigo-500" />
            </div>
            AI Nutrition Coach
          </CardTitle>
          <CardDescription>Real-time expert nutrition advice (2 credits/message)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={scrollRef} className="h-[400px] overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-xl border border-border/30">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-indigo-500" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/70 rounded-bl-md"}`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="p-3 bg-muted/70 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about nutrition, macros, meal timing..." 
              className="bg-background/50"
              disabled={loading || !credits || credits.credits_remaining < 2}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim() || !credits || credits.credits_remaining < 2} size="icon" className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Credits remaining: {credits?.credits_remaining || 0} • 2 credits per message
          </p>
        </CardContent>
      </Card>
    </motion.div>
    </>);
}
