import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Sparkles, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export default function MasterChefAICoach() {
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: "assistant", content: "Hello! I'm your AI Cooking Coach 👨‍🍳 I can help you with cooking techniques, recipe improvements, ingredient substitutions, plating tips, and competition strategies. What would you like to learn today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data, error } = await supabase.functions.invoke("masterchef-ai", {
        body: { action: "ai-coach", message: userMsg, history: messages },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data?.reply || "I couldn't process that. Try again!" }]);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Coach unavailable", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "How do I properly sear a steak?",
    "What's the secret to fluffy pancakes?",
    "Tips for winning a dessert competition?",
    "How to plate like a Michelin chef?",
  ];

  return (
    <>
      <FloatingHowItWorks title="How Master Chef AICoach works" steps={[
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
            AI Cooking Coach
          </h1>
          <p className="text-muted-foreground text-lg">Your personal culinary mentor powered by AI</p>
        </div>

        <Card className="h-[60vh] flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2 text-base"><Bot className="h-5 w-5 text-primary" /> Cooking Coach</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <Button key={i} size="sm" variant="outline" className="text-xs" onClick={() => { setInput(s); }}>{s}</Button>
                ))}
              </div>
            )}

            <div className="p-3 border-t flex gap-2">
              <Input placeholder="Ask your cooking coach..." value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
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
