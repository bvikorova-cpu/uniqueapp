import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Send, Loader2, Bot, User, Sparkles, Lightbulb, BookOpen, Brain, Code, Palette, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Message { role: "user" | "assistant"; content: string; }
interface Props { onBack: () => void; }

const CREDITS_PER_MESSAGE = 3;

const suggestionCategories = [
  { icon: Code, label: "Programming", suggestions: ["Explain React hooks", "What is TypeScript?", "How does async/await work?"] },
  { icon: Brain, label: "Data Science", suggestions: ["What is machine learning?", "Explain neural networks", "SQL vs NoSQL?"] },
  { icon: Palette, label: "Design", suggestions: ["UI vs UX difference?", "Color theory basics", "Responsive design tips"] },
  { icon: BookOpen, label: "General", suggestions: ["Study techniques", "How to stay focused", "Best learning methods"] },
];

export function AITutorChatView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isLoading: creditsLoading, spendCredit, isUsingCredit } = useTutoringCredits();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! 👋 I'm your AI Tutor. I can help you with programming, data science, design, marketing, and more. Pick a topic below or ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    // Check credits
    if (credits < CREDITS_PER_MESSAGE) {
      toast({ title: "Insufficient Credits", description: `You need ${CREDITS_PER_MESSAGE} credits per message. Purchase more to continue.`, variant: "destructive" });
      return;
    }

    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSelectedCategory(null);
    setLoading(true);

    try {
      // Deduct credits first
      for (let i = 0; i < CREDITS_PER_MESSAGE; i++) {
        await spendCredit();
      }

      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'tutor-chat', messages: [...messages, userMsg] }
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.result }]);
    } catch (err: any) {
      if (err.message === "Insufficient credits") {
        toast({ title: "Insufficient Credits", description: "Purchase more credits to continue.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.message || "Failed to get response", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Tutor Chat View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Tutor Chat View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Tutor Chat View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Tutor Chat</h2>
            <p className="text-sm text-muted-foreground">Personal AI tutor for any subject</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md">
              <Sparkles className="w-3 h-3 mr-1" />{CREDITS_PER_MESSAGE} CR / msg
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <CreditCard className="w-3 h-3 text-muted-foreground" />
              <span className={`font-bold ${credits < CREDITS_PER_MESSAGE ? 'text-destructive' : 'text-emerald-500'}`}>
                {creditsLoading ? '...' : `${credits} credits`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Low credits warning */}
        {!creditsLoading && credits < CREDITS_PER_MESSAGE && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-3 mb-3 bg-destructive/10 border-destructive/30">
              <p className="text-xs text-destructive font-medium">
                ⚠️ Insufficient credits! You need at least {CREDITS_PER_MESSAGE} credits to send a message. Purchase more from the Education hub.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-2.5 mb-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
              <p className="text-[10px] md:text-xs text-muted-foreground">
                <strong>💡 Tips:</strong> Ask follow-up questions for deeper understanding. Request examples or code snippets. Say "explain like I'm 5" for simpler explanations!
              </p>
            </div>
          </Card>
        </motion.div>

        <Card className="h-[520px] flex flex-col border-cyan-500/10 shadow-lg">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-foreground border border-violet-500/20" 
                    : "bg-muted/80 border border-border/50"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
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

          {/* Smart suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {suggestionCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                      className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 whitespace-nowrap transition-colors ${
                        selectedCategory === i
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
                          : 'bg-muted/50 border-border hover:bg-cyan-500/10'
                      }`}
                    >
                      <Icon className="w-3 h-3" />{cat.label}
                    </button>
                  );
                })}
              </div>
              {selectedCategory !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-1.5">
                  {suggestionCategories[selectedCategory].suggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)} className="text-[10px] md:text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 transition-colors">
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <div className="p-3 border-t flex gap-2">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder={credits < CREDITS_PER_MESSAGE ? "Purchase credits to chat..." : "Ask your tutor anything..."} 
              onKeyDown={e => e.key === "Enter" && sendMessage()} 
              className="h-10"
              disabled={credits < CREDITS_PER_MESSAGE}
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={loading || isUsingCredit || credits < CREDITS_PER_MESSAGE} 
              className="h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md"
            >
              {isUsingCredit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
