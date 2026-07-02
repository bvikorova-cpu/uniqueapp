import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, Bot, User, Coins, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props { onBack: () => void; }

export function AIMoodTherapist({ onBack }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    // Check credits
    const { data: credits } = await supabase
      .from("emotion_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 3) {
      toast({
        title: "Insufficient Credits",
        description: "AI Mood Therapist requires 3 credits per session. Purchase more credits first.",
        variant: "destructive",
      });
      return;
    }

    // Deduct credits
    await supabase.rpc("deduct_emotion_credits" as any, { p_user_id: user.id, p_amount: 3 });

    // Fetch wallet data for context
    const { data: wallet } = await supabase
      .from("emotion_wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const portfolioContext = wallet
      ? `User's emotion portfolio: Joy: ${wallet.joy_balance}, Love: ${wallet.love_balance}, Motivation: ${wallet.motivation_balance}, Peace: ${wallet.peace_balance}, Excitement: ${wallet.excitement_balance}, Sadness: ${wallet.sadness_balance}, Anger: ${wallet.anger_balance}, Fear: ${wallet.fear_balance}. Total mined: ${wallet.total_mined}, Total traded: ${wallet.total_traded}.`
      : "User has no emotion wallet yet.";

    setSessionStarted(true);
    setMessages([
      {
        role: "assistant",
        content: `Welcome to your AI Mood Therapist session! 🧠✨\n\nI've analyzed your emotional portfolio and I'm ready to help you optimize your emotional investments.\n\n**Your Portfolio Summary:**\n${wallet ? `- Joy: ${wallet.joy_balance} | Love: ${wallet.love_balance} | Motivation: ${wallet.motivation_balance}\n- Peace: ${wallet.peace_balance} | Excitement: ${wallet.excitement_balance}\n- Total Mined: ${wallet.total_mined} | Total Traded: ${wallet.total_traded}` : "No portfolio data yet — start trading to build your emotional assets!"}\n\nHow can I help you today? I can:\n- Analyze your emotional balance\n- Suggest optimal trades\n- Recommend mining strategies\n- Provide emotional investment advice`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: [...messages, { role: "user", content: userMessage }],
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.reply || "I apologize, I couldn't process that. Please try again." },
      ]);
    } catch (err) {
      console.error("AI Therapist error:", err);
      toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"A I Mood Therapist"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      {!sessionStarted ? (
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-pink-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 w-fit">
              <MessageSquare className="h-12 w-12 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl">AI Mood Therapist</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              Get personalized emotional investment advice from our AI. It analyzes your portfolio 
              and suggests optimal trades, mining strategies, and emotional balance tips.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-pink-400" />
              <span>3 credits per session</span>
            </div>
            <Button
              size="lg"
              onClick={startSession}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Session (3 Credits)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              AI Mood Therapist
              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Active Session</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto space-y-3 p-3 rounded-xl border border-white/5 bg-white/5">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 h-fit">
                        <Bot className="h-4 w-4 text-cyan-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/10 border border-white/5"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="p-1.5 rounded-lg bg-primary/20 h-fit">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <Bot className="h-4 w-4 text-cyan-400 animate-pulse" />
                  </div>
                  <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your emotional portfolio..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="h-auto">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
