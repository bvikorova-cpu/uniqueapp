import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2, ArrowLeft, Send, Bot, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumChatProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QuantumChat = ({ onBack }: QuantumChatProps) => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [selectedUniverseId, setSelectedUniverseId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase.functions.invoke('get-user-universes');
        if (error) throw error;
        setUniverses(data.universes || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedUniverse = universes.find(u => u.id === selectedUniverseId);

  const handleSend = async () => {
    if (!input.trim() || !selectedUniverseId) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('quantum-chat', {
        body: {
          universeId: selectedUniverseId,
          message: input,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.response || "I couldn't connect to that reality. Please try again." }]);
    } catch (e) {
      console.error(e);
      const universe = selectedUniverse;
      // Fallback AI simulation
      const response = `*As your ${universe?.universe_name || "alternate"} self:*\n\nThat's an interesting question. In my reality where I ${universe?.divergence_point || "took a different path"}, things work quite differently. My success score is ${universe?.success_score || "unknown"}/100, and the choices I've made have led me to unique perspectives.\n\nWhat else would you like to know about my reality?`;
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Chat'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Chat panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="w-6 h-6 text-pink-400" />
            Quantum Chat
          </CardTitle>
          <CardDescription>Chat with your alternate selves — AI simulates responses from parallel versions of you</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUniverseId} onValueChange={(v) => { setSelectedUniverseId(v); setMessages([]); }}>
            <SelectTrigger><SelectValue placeholder="Select a universe to chat with..." /></SelectTrigger>
            <SelectContent>
              {universes.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.universe_name} (Score: {u.success_score})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>
      ) : !selectedUniverseId ? (
        <Card className="border-muted"><CardContent className="py-12 text-center text-muted-foreground">Select a universe above to start chatting with your alternate self</CardContent></Card>
      ) : (
        <Card className="border-pink-500/20">
          <CardContent className="p-4">
            <div className="h-[400px] overflow-y-auto space-y-3 mb-4 pr-2">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-pink-400/50" />
                  <p>Start a conversation with your <strong>{selectedUniverse?.universe_name}</strong> self</p>
                  <p className="text-xs mt-1">Ask about their life, decisions, or what's different in their reality</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <Bot className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  {msg.role === "user" && <User className="w-6 h-6 text-primary flex-shrink-0 mt-1" />}
                </div>
              ))}
              {sending && (
                <div className="flex gap-2">
                  <Bot className="w-6 h-6 text-pink-400 flex-shrink-0" />
                  <div className="bg-muted rounded-2xl px-4 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your alternate self..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} disabled={sending} />
              <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon" className="bg-gradient-to-r from-pink-500 to-rose-500">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default QuantumChat;
