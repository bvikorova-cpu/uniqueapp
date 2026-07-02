import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Users, Loader2, Send, Sparkles, CheckCircle } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const GroupConversations = () => {
  const { toast } = useToast();
  const [companions, setCompanions] = useState<any[]>([]);
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ role: string; content: string; name?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCompanions(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadCompanions = async () => {
    const { data } = await supabase.from("ai_characters").select("*");
    setCompanions(data || []);
  };

  const toggleCompanion = (id: string) => {
    setSelectedCompanions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const startGroupChat = () => {
    if (selectedCompanions.length < 2) {
      toast({ title: "Select at least 2 companions", variant: "destructive" });
      return;
    }
    setChatStarted(true);
    const names = selectedCompanions.map(id => companions.find(c => c.id === id)?.name).filter(Boolean);
    setMessages([{ role: "system", content: `Group chat started with ${names.join(", ")}. Say something!` }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("companion-ai", {
        body: { action: "group-chat",
          characterIds: selectedCompanions,
          message: userMsg,
          conversationHistory: messages.filter(m => m.role !== "system"),
        },
      });
      if (error) throw error;

      if (data?.responses) {
        const newMsgs = data.responses.map((r: any) => ({
          role: "assistant",
          content: r.response,
          name: r.companion_name,
        }));
        setMessages((prev) => [...prev, ...newMsgs]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to get responses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const colorMap: Record<number, string> = {
    0: "bg-pink-500",
    1: "bg-blue-500",
    2: "bg-green-500",
  };

  if (!chatStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Group Conversations"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Group Conversations
            </h1>
            <p className="text-muted-foreground mt-2">Chat with 2-3 AI companions at once — watch them interact!</p>
            <Badge variant="outline" className="mt-2">4 Credits per group message</Badge>
          </div>
        </motion.div>

        <Card className="bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Select 2-3 Companions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {companions.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleCompanion(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedCompanions.includes(c.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                }`}
              >
                <Avatar>
                  <AvatarFallback>{c.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{c.personality_type}</p>
                </div>
                {selectedCompanions.includes(c.id) && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            ))}

            <Button onClick={startGroupChat} className="w-full mt-4" size="lg" disabled={selectedCompanions.length < 2}>
              <Sparkles className="h-4 w-4 mr-2" /> Start Group Chat ({selectedCompanions.length}/3 selected)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-card/80 backdrop-blur-xl h-[600px] flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Group Chat</CardTitle>
            <div className="flex gap-1 ml-auto">
              {selectedCompanions.map((id, idx) => {
                const c = companions.find(comp => comp.id === id);
                return c ? (
                  <Badge key={id} variant="secondary" className="text-xs">{c.name}</Badge>
                ) : null;
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.filter(m => m.role !== "system").map((msg, i) => {
            const companionIdx = msg.name ? selectedCompanions.findIndex(id => companions.find(c => c.id === id)?.name === msg.name) : -1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${msg.role === "user" ? "" : "flex gap-2"}`}>
                  {msg.role !== "user" && (
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback className={`text-white text-xs ${colorMap[companionIdx] || "bg-gray-500"}`}>
                        {msg.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.name && <p className="text-xs font-bold mb-1">{msg.name}</p>}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Companions are thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Message the group..."
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
